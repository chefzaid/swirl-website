from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json, re, xml.etree.ElementTree as ET

JSON_LD_TYPE = '@type'

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.links = []; self.meta = {}; self.titles = []; self.h1s = []
        self.graphs = []; self.active = None; self.text = ''; self.lang = None
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a['lang']
        if tag in ('link', 'a'): self.links.append((tag, a))
        if tag == 'meta':
            key = a.get('name', a.get('property'))
            if key:
                assert key not in self.meta, ('duplicate metadata', key)
                self.meta[key] = a.get('content', '')
        if tag in ('title', 'h1') or (tag == 'script' and a.get('type') == 'application/ld+json'):
            self.active = tag; self.text = ''
    def handle_data(self, text):
        if self.active: self.text += text
    def handle_endtag(self, tag):
        if tag != self.active: return
        if tag == 'title': self.titles.append(self.text)
        if tag == 'h1': self.h1s.append(self.text)
        if tag == 'script':
            assert '<' not in self.text, 'JSON-LD must escape HTML delimiters'
            self.graphs.append(json.loads(self.text))
        self.active = None
    def canonical(self):
        links = [a['href'] for tag, a in self.links if tag == 'link' and a.get('rel') == 'canonical']
        assert len(links) == 1
        return links[0]
    def alternates(self):
        links = [a for tag, a in self.links if tag == 'link' and a.get('rel') == 'alternate']
        assert len(links) == 3
        return {a['hreflang']: a['href'] for a in links}

raw = json.loads(Path('dist/server/page-manifest.json').read_text())
pages = {path: Page(html) for path, html in raw.items()}
assert len(pages) == 24
origin = pages['/'].canonical().rstrip('/')
titles = set(); descriptions = set()
for path, page in pages.items():
    assert len(page.titles) == len(page.h1s) == 1, path
    assert page.titles[0] not in titles, ('duplicate title', path)
    titles.add(page.titles[0])
    assert 10 <= len(page.titles[0]) <= 75, (path, page.titles)
    description = page.meta['description']
    assert description and description not in descriptions, ('duplicate description', path)
    assert len(description) <= 175, (path, description)
    descriptions.add(description)
    assert page.lang == ('en' if path.startswith('/en/') else 'fr')
    assert page.canonical() == origin + path
    assert page.meta['og:url'] == page.canonical()
    assert page.meta['og:title'] == page.meta['twitter:title'] == page.titles[0]
    assert page.meta['og:description'] == page.meta['twitter:description'] == description
    assert 'noindex' not in page.meta['robots']
    alts = page.alternates()
    assert set(alts) == {'fr', 'en', 'x-default'}
    assert alts['x-default'] == alts['fr']
    assert alts[page.lang] == page.canonical()
    for lang in ('fr', 'en'):
        other = pages[urlsplit(alts[lang]).path]
        assert other.lang == lang and other.alternates() == alts, ('non-reciprocal hreflang', path)
    assert len(page.graphs) == 1
    graph = page.graphs[0]
    assert graph['@context'] == 'https://schema.org'
    entities = graph['@graph']
    assert any(e[JSON_LD_TYPE] == 'WebPage' and e['url'] == page.canonical() for e in entities)
    project = path.startswith(('/projets/', '/en/projects/'))
    if project:
        assert any(e[JSON_LD_TYPE] == 'BreadcrumbList' for e in entities)
        assert 'og:image' not in page.meta and 'twitter:image' not in page.meta
        assert 'astro-island' not in raw[path], 'Project page should not need client JS'
        assert not re.search(r'\b(?:équipes?|teams?)\b', raw[path], re.I), path
    for tag, a in page.links:
        if tag != 'a': continue
        href = a.get('href', '')
        if href.startswith('/'):
            assert urlsplit(href).path in pages, ('broken internal document link', path, href)
    print(path + ': metadata, language pairing and structured data OK')

for home, prefix in [('/', '/projets/'), ('/en/', '/en/projects/')]:
    page = pages[home]
    hrefs = {a.get('href') for tag, a in page.links if tag == 'a'}
    assert {path for path in pages if path.startswith(prefix)} <= hrefs, 'All projects must be crawlable without JS'
    social = [a for tag, a in page.links if tag == 'a' and a.get('href') == 'https://www.linkedin.com/in/chefzaid/']
    assert len(social) == 1 and social[0].get('aria-label')
    people = [e for e in page.graphs[0]['@graph'] if e[JSON_LD_TYPE] == 'Person']
    assert len(people) == 1 and people[0]['sameAs'] == ['https://www.linkedin.com/in/chefzaid/']

# These are XML namespace identifiers, not network requests; HTTPS would identify different elements.
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'x': 'http://www.w3.org/1999/xhtml'}
urls = ET.parse('dist/client/sitemap.xml').getroot().findall('s:url', ns)
assert len(urls) == len(pages)
assert {u.findtext('s:loc', namespaces=ns) for u in urls} == {origin + path for path in pages}
for url in urls:
    path = urlsplit(url.findtext('s:loc', namespaces=ns)).path
    alts = {link.attrib['hreflang']: link.attrib['href'] for link in url.findall('x:link', ns)}
    assert alts == pages[path].alternates()
    assert url.find('s:lastmod', ns) is None, 'Do not fabricate freshness dates'
robots = Path('dist/client/robots.txt').read_text()
assert 'Sitemap: ' + origin + '/sitemap.xml' in robots
assert 'Disallow: /api/' in robots
print(f'{len(pages)} sitemap entries, crawlable project links, LinkedIn and robots.txt verified')
