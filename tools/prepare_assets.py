"""Prepare the reviewed 78-card Pam-A collection; preserve accepted asset bytes."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import hashlib
import json
import time
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {f'm{i:02}' for i in range(22)} | {f'{s}{i:02}' for s in 'wcsp' for i in range(1,15)}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def read_json(path):
    return json.loads(path.read_text())

def prepare(source, previous):
    card_id, filename = source['card_id'], source['filename']
    if previous:
        for path_key, hash_key in [('local_path','sha256'), ('original_path','original_sha256')]:
            if digest((ROOT/previous[path_key]).read_bytes()) != previous[hash_key]:
                raise ValueError(f'{card_id}: accepted {path_key} hash changed; refusing overwrite')
        return previous
    # Wikimedia canonical storage path is derived from normalized filename MD5.
    # Source-page dimensions and later visual review independently check identity.
    md5 = hashlib.md5(filename.encode()).hexdigest()
    source_url = f'https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[:2]}/{filename}?utm_campaign=index&utm_content=original&utm_source=commons.wikimedia.org'
    original = ROOT/'assets'/'originals'/filename
    if original.exists():
        data = original.read_bytes()
    else:
        request = Request(source_url, headers={'User-Agent':'PaijianTarotDemo/0.2 (one-time historical art download for a local educational prototype)'})
        time.sleep(1.2)
        for attempt in range(3):
            try:
                with urlopen(request, timeout=40) as response:
                    if not response.headers.get('Content-Type','').startswith('image/'):
                        raise ValueError(f'{card_id}: non-image response')
                    data = response.read()
                break
            except HTTPError as error:
                if error.code!=429 or attempt==2:
                    raise
                retry=error.headers.get('Retry-After')
                delay=max(int(retry) if retry and retry.isdigit() else 0, 10*(attempt+1))
                print('RATE_LIMIT_BACKOFF',card_id,delay,'seconds',flush=True)
                time.sleep(delay)
    with Image.open(BytesIO(data)) as decoded:
        decoded.load()
        width, height = decoded.size
        expected_size = (source['source_width'], source['source_height'])
        if decoded.format != 'JPEG' or (width,height) != expected_size or min(width,height)<900 or not .54<width/height<.65:
            raise ValueError(f'{card_id}: source mismatch {decoded.format} {decoded.size}; expected {expected_size}')
        image = decoded.convert('RGB')
        image.thumbnail((900,900), Image.Resampling.LANCZOS)
        output_buffer = BytesIO()
        image.save(output_buffer, 'WEBP', quality=90, method=6)
        output_data = output_buffer.getvalue()
        output_size = image.size
    with Image.open(BytesIO(output_data)) as check:
        check.load()
        if check.format != 'WEBP' or check.size != output_size:
            raise ValueError(f'{card_id}: output decode mismatch')
    output = ROOT/'assets'/'cards'/f'{card_id}.webp'
    original.parent.mkdir(parents=True, exist_ok=True)
    output.parent.mkdir(parents=True, exist_ok=True)
    original.write_bytes(data)
    output.write_bytes(output_data)
    return {
        'card_id':card_id,'name_zh':source['name_zh'],'name_en':source['name_en'],
        'deck':'Rider–Waite–Smith','visual_edition':'1910 Pam-A; Wikimedia Commons TaionWC scan collection',
        'artist':'Pamela Colman Smith','source_type':'Wikimedia Commons',
        'source_page':source['source_page'],'source_original':source_url,
        'source_upstream_as_listed':'http://muzendo.jp/blog/',
        'source_page_checked_on':source['source_page_checked_on'],
        'source_page_permalink':source['source_page_permalink'],
        'license_status_as_listed':'Public domain',
        'license_basis_as_listed':source['source_listed_license'],
        'license_evidence_url':source['source_page']+'#Licensing',
        'public_domain_mark_url':'https://creativecommons.org/publicdomain/mark/1.0/',
        'original_filename':filename,'original_path':str(original.relative_to(ROOT)),
        'original_width':width,'original_height':height,'original_sha256':digest(data),
        'original_sha1':hashlib.sha1(data).hexdigest(),'commons_structured_sha1':None,
        'local_path':str(output.relative_to(ROOT)),'width':output_size[0],'height':output_size[1],
        'mime_type':'image/webp','bytes':len(output_data),'sha256':digest(output_data),
        'transformation':{'operation':'proportional resize only; full card retained','max_edge':900,'format':'WebP','quality':90,'method':6,'recoloring':False,'generative_changes':False},
        'checks':{'source_page_identifies_card':True,'source_page_identifies_pam_a':True,
                  'source_page_license_reviewed':True,'original_decoded':True,'output_decoded':True,
                  'dimensions_checked':True,'dimensions_match_reviewed_source':True,
                  'visual_identity_review':'pending contact sheet review'}
    }

def contact_sheets(entries):
    groups=[('major-00-10',entries[:11]),('major-11-21',entries[11:22])]
    groups += [(s,[e for e in entries if e['card_id'].startswith(s)]) for s in 'wcsp']
    for name, group in groups:
        sheet=Image.new('RGB',(1000,440*((len(group)+3)//4)),'#f7f2e8')
        draw=ImageDraw.Draw(sheet)
        for i,entry in enumerate(group):
            with Image.open(ROOT/entry['local_path']) as source:
                image=source.convert('RGB')
                image.thumbnail((220,385),Image.Resampling.LANCZOS)
            sheet.paste(image,((i%4)*250+(250-image.width)//2,(i//4)*440+15))
            draw.text(((i%4)*250+12,(i//4)*440+408),entry['card_id']+' '+entry['name_en'],fill='#222222')
        path=Path('/tmp')/f'paijian-78-{name}.jpg'
        sheet.save(path,quality=95)
        print('CONTACT_SHEET',path,flush=True)

def main():
    evidence=read_json(ROOT/'assets'/'source-evidence.json')
    sources=evidence['items']
    if len(sources)!=78 or {s['card_id'] for s in sources}!=EXPECTED:
        raise ValueError('Source evidence must cover exactly the 78 stable IDs')
    previous_path=ROOT/'assets'/'manifest.json'
    previous={e['card_id']:e for e in read_json(previous_path)['items']} if previous_path.exists() else {}
    for entry in read_json(ROOT/'assets'/'demo-original-hashes.json')['items']:
        for path_key,hash_key in [('local_path','sha256'),('original_path','original_sha256')]:
            if digest((ROOT/entry[path_key]).read_bytes())!=entry[hash_key]:
                raise ValueError(f"Original demo asset changed: {entry['card_id']}")
    entries_by_id={}
    failures=[]
    with ThreadPoolExecutor(max_workers=1) as pool:
        tasks={pool.submit(prepare,source,previous.get(source['card_id'])):source['card_id'] for source in sources}
        for task in as_completed(tasks):
            card_id=tasks[task]
            try:
                entry=task.result()
                entries_by_id[card_id]=entry
                print('READY',card_id,entry['bytes'],flush=True)
            except Exception as error:
                failures.append(card_id)
                print('FAILED',card_id,type(error).__name__,str(error),flush=True)
    if failures:
        raise RuntimeError('No manifest written; missing verified assets: '+', '.join(failures))
    entries=[entries_by_id[source['card_id']] for source in sources]
    if len({e['sha256'] for e in entries})!=78 or len({e['original_sha256'] for e in entries})!=78:
        raise ValueError('Duplicate images detected')
    manifest={'schema_version':1,'scope':'78-card image deck; teaching coverage is separately declared by the application',
              'asset_count':78,'checked_on':evidence['checked_on'],'items':entries}
    previous_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'assets'/'cards.sha256').write_text(''.join(f"{e['sha256']}  {e['local_path']}\n" for e in entries))
    contact_sheets(entries)
    print('TOTAL_WEBP_BYTES',sum(e['bytes'] for e in entries),flush=True)
    print('PENDING_VISUAL_REVIEWS',sum(e['checks']['visual_identity_review'].startswith('pending') for e in entries),flush=True)

if __name__=='__main__':
    main()
