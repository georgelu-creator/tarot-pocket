"""Bundle the complete card deck and learning experience into one HTML file."""
from pathlib import Path
import base64
import hashlib
import html as html_module
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
version = json.loads((ROOT/'package.json').read_text())['version']
translations = {}
for locale in sorted((ROOT/'locales').glob('en-*.json')):
    translations.update(json.loads(locale.read_text()))
locale_code = 'window.TAROT_EN=' + json.dumps(translations,ensure_ascii=False) + ';\n'
assert '</script' not in locale_code.lower()
(ROOT/'locales/en.js').write_text(locale_code)
expected = {f'm{i:02d}' for i in range(22)} | {f'{s}{i:02d}' for s in 'wcsp' for i in range(1,15)}
manifest = json.loads((ROOT / 'assets/manifest.json').read_text())
assert {a['card_id'] for a in manifest['items']} == expected
images = {}
for entry in manifest['items']:
    data = (ROOT / entry['local_path']).read_bytes()
    assert hashlib.sha256(data).hexdigest() == entry['sha256'], entry['card_id']
    images[entry['card_id']] = 'data:image/webp;base64,' + base64.b64encode(data).decode()
assert {p.stem for p in (ROOT / 'assets/cards').glob('*.webp')} == expected
source_html = (ROOT / 'index.html').read_text()
css_names = re.findall(r'<link rel="stylesheet" href="([^\"]+)">',source_html)
script_names = re.findall(r'<script src="([^\"]+)"></script>',source_html)
assert css_names and script_names
for name in css_names+script_names:
    assert not name.startswith(('/', '.')) and ':' not in name and '..' not in name
    assert (ROOT/name).is_file(), f'Missing runtime file: {name}'
extra_names = ['manifest.webmanifest'] + [str(p.relative_to(ROOT)) for p in sorted((ROOT/'assets/icons').glob('*.png'))]
fingerprint=hashlib.sha256()
for name in ['index.html','update.html','sw.js','assets/design/card-back.svg','LICENSE','CONTENT_LICENSE.md','LICENSES/CC-BY-SA-4.0.txt','ARTWORK_LICENSE.md']+css_names+script_names+extra_names:
    fingerprint.update(name.encode()+b'\0'+(ROOT/name).read_bytes())
fingerprint.update(json.dumps(manifest,sort_keys=True).encode())
revision=version+'-'+fingerprint.hexdigest()[:16]
source_html=source_html.replace('name="tarot-build" content="development"',f'name="tarot-build" content="{revision}"')
html = source_html
license_text = '\n\n'.join((ROOT / name).read_text() for name in
    ['LICENSE', 'CONTENT_LICENSE.md', 'LICENSES/CC-BY-SA-4.0.txt', 'ARTWORK_LICENSE.md'])
license_notices = '<template id="license-notices"><pre>' + html_module.escape(license_text) + '</pre></template>\n'
html = html.replace('</body>', license_notices + '</body>')
css = '\n'.join((ROOT / name).read_text() for name in css_names)
card_back = (ROOT/'assets/design/card-back.svg').read_bytes()
css = css.replace('url("assets/design/card-back.svg")', 'url("data:image/svg+xml;base64,' + base64.b64encode(card_back).decode() + '")')
assert 'url("assets/' not in css
app = '\n'.join((ROOT / name).read_text() for name in script_names)
needle = 'const path = id => `assets/cards/${id}.webp`;'
assert needle in app
app = app.replace(needle, 'const path = id => window.TAROT_IMAGES[id];')
asset_sources = json.dumps({'checked_on': manifest['checked_on'], 'items':[{key:item[key] for key in ('card_id','source_page','visual_edition','artist','license_status_as_listed','sha256')} for item in manifest['items']]},ensure_ascii=False)
code = 'window.TAROT_STANDALONE=true;window.TAROT_IMAGES=' + json.dumps(images) + ';\nwindow.TAROT_ASSET_SOURCES=' + asset_sources + ';\n' + app
assert '</script' not in code.lower()
script_hash = base64.b64encode(hashlib.sha256(code.encode()).digest()).decode()
html = html.replace('<link rel="stylesheet" href="design-tokens.css">','<style>'+css+'</style>')
for name in css_names[1:]:
    html = html.replace(f'  <link rel="stylesheet" href="{name}">', '')
script_tags = '\n'.join(f'  <script src="{name}"></script>' for name in script_names)
assert script_tags in html
html = html.replace(script_tags,'  <script>'+code+'</script>')
html = html.replace("script-src 'self'", "script-src 'sha256-" + script_hash + "'")
html = html.replace("style-src 'self' 'unsafe-inline'", "style-src 'unsafe-inline'")
html = re.sub(r"connect-src [^;]+; worker-src 'self'; manifest-src 'self'", "connect-src 'none'; worker-src 'none'; manifest-src 'none'", html)
html = html.replace('  <link rel="manifest" href="manifest.webmanifest">','')
for name in extra_names:
    if name.endswith('.png'):
        html=html.replace('href="'+name+'"','href="data:image/png;base64,'+base64.b64encode((ROOT/name).read_bytes()).decode()+'"')
assert 'src="assets/' not in html
assert not re.search(r'<script[^>]+src=',html)
assert '<link rel="stylesheet"' not in html
out=ROOT / 'demo'
out.mkdir(exist_ok=True)
(out/'tarot-demo.html').write_text(html)
web=ROOT/'dist'
web.mkdir(exist_ok=True)
web_html=source_html
web_html=web_html.replace('</body>', license_notices+'</body>')
provenance_code='window.TAROT_ASSET_SOURCES='+asset_sources+';\n'
web_html=web_html.replace('<script src="content.js"></script>','<script src="assets/provenance.js"></script>\n  <script src="content.js"></script>')
# The document and every executable/style resource belong to one exact release.
# Source filenames remain stable for standalone bundling and offline inventory.
for name in css_names+script_names+['assets/provenance.js']:
    web_html=web_html.replace('"'+name+'"','"'+name+'?v='+revision+'"')
(web/'index.html').write_text(web_html)
update_html=(ROOT/'update.html').read_text().replace('TAROT_BUILD_REVISION',revision)
update_script=re.search(r'<script>(.*?)</script>',update_html,re.S).group(1)
update_hash=base64.b64encode(hashlib.sha256(update_script.encode()).digest()).decode()
update_html=update_html.replace('TAROT_UPDATE_SCRIPT_HASH',update_hash)
(web/'update.html').write_text(update_html)
(web/'.nojekyll').touch()
for name in css_names+script_names+extra_names:
    target=web/name
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(ROOT/name,target)
(web/'assets/design').mkdir(parents=True,exist_ok=True)
shutil.copyfile(ROOT/'assets/design/card-back.svg',web/'assets/design/card-back.svg')
(web/'assets/cards').mkdir(parents=True,exist_ok=True)
(web/'assets/provenance.js').write_text(provenance_code)
for entry in manifest['items']:
    shutil.copyfile(ROOT/entry['local_path'],web/entry['local_path'])
offline_names=['index.html','assets/provenance.js','assets/design/card-back.svg']+css_names+script_names+extra_names+[entry['local_path'] for entry in manifest['items']]
assert len(offline_names)==len(set(offline_names))
release_assets=[{'path':name,'sha256':hashlib.sha256((web/name).read_bytes()).hexdigest(),'bytes':(web/name).stat().st_size} for name in offline_names]
worker=(ROOT/'sw.js').read_text().replace('/* TAROT_RELEASE */ null',json.dumps({'revision':revision,'assets':release_assets},separators=(',',':')))
assert '/* TAROT_RELEASE */' not in worker
(web/'sw.js').write_text(worker)
if (ROOT/'docs/images/hero.png').exists():
    shutil.copyfile(ROOT/'docs/images/hero.png',web/'social-preview.png')
release=ROOT/'release'
release.mkdir(exist_ok=True)
standalone=release/f'tarot-pocket-v{version}.html'
shutil.copyfile(out/'tarot-demo.html',standalone)
(release/'SHA256SUMS.txt').write_text(hashlib.sha256(standalone.read_bytes()).hexdigest()+'  '+standalone.name+'\n')
print(json.dumps({'images':len(images),'size_bytes':len(html.encode()),'output':str(out/'tarot-demo.html'),'external_runtime_assets':0,'web_revision':revision,'offline_assets':len(release_assets),'offline_bytes':sum(asset['bytes'] for asset in release_assets)},ensure_ascii=False))
