from pathlib import Path
from html.parser import HTMLParser
import hashlib, base64, json

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.csp = None
        self.active = None
        self.inline = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'content-security-policy':
            self.csp = attrs['content']
        # JSON-LD is an inert data block, validated separately by the SEO check.
        executable = tag == 'style' or (tag == 'script' and attrs.get('type') != 'application/ld+json')
        if executable and not attrs.get('src'):
            assert self.csp, 'CSP must precede executable markup'
            self.active = [tag, '']
        for name in attrs:
            assert not name.startswith('on'), 'Inline event handler found'
    def handle_data(self, data):
        if self.active is not None:
            self.active[1] += data
    def handle_endtag(self, tag):
        if self.active is not None and tag == self.active[0]:
            self.inline.append(self.active)
            self.active = None

manifest = json.loads(Path('dist/runtime/page-manifest.json').read_text())
pages = dict(manifest['documents'])
assert {'/', '/en/', '/confidentialite/', '/en/privacy/'} <= set(pages)
assert len(pages) == 34, 'Expected bilingual home, 3 services, product, case-study hub, 10 projects and privacy'
assert set(manifest['notFound']) == {'fr', 'en'}
pages.update({'404 (' + lang + ')': html for lang, html in manifest['notFound'].items()})
assert not list(Path('dist/client').rglob('*.html')), 'HTML must be served by the Node request handler'
for path, html in pages.items():
    page = Page()
    page.feed(html)
    assert page.csp, path
    directives = {item.strip().split()[0]: item.strip().split()[1:] for item in page.csp.split(';') if item.strip()}
    for kind, content in page.inline:
        digest = "'sha256-" + base64.b64encode(hashlib.sha256(content.encode()).digest()).decode() + "'"
        assert digest in directives.get(kind + '-src-elem', directives.get(kind + '-src', [])), (path, kind)
    assert "'unsafe-inline'" not in directives['script-src']
    assert "'unsafe-eval'" not in directives['script-src']
    assert directives['object-src'] == ["'none'"]
    assert directives['base-uri'] == ["'none'"]
    assert directives['connect-src'] == ["'self'"]
    # Only the Odoo Live Chat origin may be framed; never a wildcard or http.
    assert len(directives['frame-src']) == 1 and directives['frame-src'][0].startswith('https://odoo.'), path
    print(str(path) + ': CSP hashes match every inline script/style')
for path in Path('dist/client').rglob('*'):
    if path.is_file():
        assert path.suffix not in ['.map', '.sqlite', '.db', '.sql', '.ts', '.pem']
        assert not path.name.startswith('.env')
print('Document CSP and public artifact boundaries verified')
