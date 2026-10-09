from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json, re, struct, xml.etree.ElementTree as ET

JSON_LD_TYPE = '@type'
CLIENT = Path('dist/client')

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.links = []; self.meta = {}; self.titles = []; self.h1s = []; self.ids = set()
        self.graphs = []; self.active = None; self.text = ''; self.lang = None
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a['lang']
        if 'id' in a: self.ids.add(a['id'])
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
    def entities(self, kind):
        return [e for e in self.graphs[0]['@graph'] if e[JSON_LD_TYPE] == kind]

def png_size(path):
    data = path.read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', path
    return struct.unpack('>II', data[16:24])

manifest = json.loads(Path('dist/runtime/page-manifest.json').read_text())
raw = manifest['documents']
pages = {path: Page(html) for path, html in raw.items()}
assert len(pages) == 50
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
    # Every document has its own 1200×630 social card, built with the site.
    image = page.meta['og:image']
    assert image == page.meta['twitter:image'] and image.startswith(origin + '/og/'), path
    assert png_size(CLIENT / urlsplit(image).path.lstrip('/')) == (1200, 630), image
    assert (page.meta['og:image:width'], page.meta['og:image:height']) == ('1200', '630')
    assert page.meta['og:image:alt'] == page.meta['twitter:image:alt'] == page.titles[0]
    assert page.meta['twitter:card'] == 'summary_large_image'
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
    webpages = [e for e in entities if e.get('url') == page.canonical() and e[JSON_LD_TYPE] in ('WebPage', 'CollectionPage')]
    assert len(webpages) == 1 and webpages[0]['primaryImageOfPage']['url'] == image, path
    assert [e['logo']['url'] for e in page.entities('Organization')] == [origin + '/logo.png']
    assert len(page.entities('Person')) == 1
    home = path in ('/', '/en/')
    if not home:
        crumbs = page.entities('BreadcrumbList')
        assert len(crumbs) == 1 and crumbs[0]['itemListElement'][-1]['item'] == page.canonical(), path
        assert webpages[0]['breadcrumb']['@id'] == crumbs[0]['@id']
        islands = re.findall(r'<astro-island[^>]*component-url="([^"]+)"', raw[path])
        assert all('ChatLauncher' in url for url in islands), ('Subpages hydrate only the chat launcher', path, islands)
    project = re.match(r'/(?:en/projects|projets)/[^/]+/$', path)
    if project:
        assert len(page.entities('CreativeWork')) == 1
        assert not re.search(r'\b(?:équipes?|teams?)\b', raw[path], re.I), path
    if re.match(r'/(?:en/)?swirl-cloud/$', path):
        apps = page.entities('SoftwareApplication')
        assert len(apps) == 1 and apps[0]['url'] == page.canonical(), path
        assert webpages[0]['mainEntity']['@id'] == apps[0]['@id']
        faq = page.entities('FAQPage')
        assert len(faq) == 1 and all(q['acceptedAnswer']['text'] for q in faq[0]['mainEntity']), path
        assert not page.entities('Service'), path
        # The overview links to every product detail page in its language.
        hrefs = {a.get('href') for tag, a in page.links if tag == 'a'}
        details = {p for p in pages if p.startswith(path) and p != path}
        assert details and details <= hrefs, ('Product detail pages not linked', path)
    # The header links every page to the Swirl Cloud product page.
    product = '/en/swirl-cloud/' if page.lang == 'en' else '/swirl-cloud/'
    assert product in {a.get('href') for tag, a in page.links if tag == 'a'}, ('Product page not linked', path)
    if re.match(r'/(?:en/resources|ressources)/[^/]+/$', path):
        article = page.entities('Article')
        assert len(article) == 1 and article[0]['headline'] == page.h1s[0], path
        assert article[0]['datePublished'] <= article[0]['dateModified'], path
        assert webpages[0]['mainEntity']['@id'] == article[0]['@id']
    if page.entities('Service') and not home:
        assert len(page.entities('Service')) == 1 and len(page.entities('FAQPage')) == 1, path
        assert page.entities('Service')[0]['url'] == page.canonical()
        assert all(q['acceptedAnswer']['text'] for q in page.entities('FAQPage')[0]['mainEntity'])
    for tag, a in page.links:
        if tag != 'a': continue
        href = a.get('href', '')
        if href.startswith('/'):
            target = urlsplit(href)
            assert target.path in pages, ('broken internal document link', path, href)
            if target.fragment:
                assert target.fragment in pages[target.path].ids, ('missing link target', path, href)
    print(path + ': metadata, social card, language pairing and structured data OK')

services = [path for path, page in pages.items() if page.entities('Service') and path not in ('/', '/en/')]
assert len(services) == 6, services
for home, hub, prefix in [('/', '/projets/', '/projets/'), ('/en/', '/en/projects/', '/en/projects/')]:
    page = pages[home]
    hrefs = {a.get('href') for tag, a in page.links if tag == 'a'}
    projects = {path for path in pages if path.startswith(prefix) and path != hub}
    assert projects <= hrefs, 'All projects must be crawlable without JS'
    lang_services = {path for path in services if pages[path].lang == page.lang}
    assert lang_services | {hub} <= hrefs, 'Services and the hub must be linked from the homepage'
    assert {e['url'] for e in page.entities('Service')} >= {origin + path for path in lang_services}
    listed = pages[hub].entities('ItemList')[0]['itemListElement']
    assert {item['url'] for item in listed} == {origin + path for path in projects}
    social = [a for tag, a in page.links if tag == 'a' and a.get('href') == 'https://www.linkedin.com/in/chefzaid/']
    assert len(social) == 1 and social[0].get('aria-label')
    people = page.entities('Person')
    assert len(people) == 1 and people[0]['sameAs'] == ['https://www.linkedin.com/in/chefzaid/']

for lang, html in manifest['notFound'].items():
    page = Page(html)
    assert page.lang == lang and len(page.h1s) == 1
    assert page.meta['robots'].startswith('noindex')
    assert not [a for tag, a in page.links if tag == 'link' and a.get('rel') in ('canonical', 'alternate')]
    assert not page.graphs and 'og:url' not in page.meta
print('Localized 404 pages are noindex and carry no canonical or alternates')

# These are XML namespace identifiers, not network requests; HTTPS would identify different elements.
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'x': 'http://www.w3.org/1999/xhtml'}
urls = ET.parse(CLIENT / 'sitemap.xml').getroot().findall('s:url', ns)
assert len(urls) == len(pages)
assert {u.findtext('s:loc', namespaces=ns) for u in urls} == {origin + path for path in pages}
for url in urls:
    path = urlsplit(url.findtext('s:loc', namespaces=ns)).path
    alts = {link.attrib['hreflang']: link.attrib['href'] for link in url.findall('x:link', ns)}
    assert alts == pages[path].alternates()
    assert url.find('s:lastmod', ns) is None, 'Do not fabricate freshness dates'
robots = (CLIENT / 'robots.txt').read_text()
assert 'Sitemap: ' + origin + '/sitemap.xml' in robots
assert 'Disallow: /api/' in robots
llms = (CLIENT / 'llms.txt').read_text()
assert llms.startswith('# ') and all(origin + path in llms for path in pages if path.startswith('/en/'))
assert png_size(CLIENT / 'logo.png') == (512, 512)
assert png_size(CLIENT / 'apple-touch-icon.png') == (180, 180)
assert (CLIENT / 'favicon.ico').read_bytes()[:4] == b'\x00\x00\x01\x00'
print(f'{len(pages)} sitemap entries, crawlable links, llms.txt, icons, LinkedIn and robots.txt verified')
