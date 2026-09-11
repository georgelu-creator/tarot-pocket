"""Read-only release gate for the full, visually reviewed historical RWS deck."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {f'm{i:02}' for i in range(22)} | {f'{s}{i:02}' for s in 'wcsp' for i in range(1,15)}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def main():
    manifest = json.loads((ROOT/'assets/manifest.json').read_text())
    items = manifest['items']
    evidence = {e['card_id']: e for e in json.loads((ROOT/'assets/source-evidence.json').read_text())['items']}
    reviews = {e['card_id']: e for e in json.loads((ROOT/'assets/visual-review.json').read_text())['items']}
    baseline = json.loads((ROOT/'assets/demo-original-hashes.json').read_text())['items']
    require(len(items)==78 and manifest['asset_count']==78, 'Expected 78 manifest entries')
    require({e['card_id'] for e in items}==EXPECTED, 'Missing, duplicate or unknown card IDs')
    require(set(evidence)==EXPECTED and set(reviews)==EXPECTED, 'Incomplete source or visual evidence')
    require({p.name for p in (ROOT/'assets/cards').iterdir() if p.is_file()}=={f'{cid}.webp' for cid in EXPECTED}, 'Missing or unknown image files')
    require(len({e['sha256'] for e in items})==78, 'Duplicate output images')
    require(len({e['original_sha256'] for e in items})==78, 'Duplicate source images')
    for entry in items:
        card_id = entry['card_id']
        source = evidence[card_id]
        require(entry['local_path']==f'assets/cards/{card_id}.webp', f'{card_id}: wrong filename')
        require(entry['source_page']==source['source_page'], f'{card_id}: source page mismatch')
        require(entry['original_filename']==source['filename'], f'{card_id}: original filename mismatch')
        require(entry['visual_edition']=='1910 Pam-A; Wikimedia Commons TaionWC scan collection', f'{card_id}: mixed visual edition')
        require(entry['artist']=='Pamela Colman Smith' and entry['license_status_as_listed']=='Public domain', f'{card_id}: missing source metadata')
        require('inspected contact sheet' in entry['checks'].get('visual_identity_review',''), f'{card_id}: pending visual review')
        require(bool(entry['checks'].get('visual_observation')), f'{card_id}: missing visual evidence')
        require(reviews[card_id]['sha256']==entry['sha256'], f'{card_id}: visually reviewed bytes differ')
        require(reviews[card_id]['observation']==entry['checks']['visual_observation'], f'{card_id}: visual review record differs')
        for path_key,hash_key,expected_format,w,h in [
            ('local_path','sha256','WEBP',entry['width'],entry['height']),
            ('original_path','original_sha256','JPEG',source['source_width'],source['source_height'])
        ]:
            path = ROOT/entry[path_key]
            blob = path.read_bytes()
            require(hashlib.sha256(blob).hexdigest()==entry[hash_key], f'{card_id}: checksum mismatch in {path_key}')
            with Image.open(path) as decoded:
                decoded.load()
                require(decoded.format==expected_format and decoded.size==(w,h), f'{card_id}: invalid {path_key} decode or dimensions')
                require(.54<w/h<.65, f'{card_id}: invalid aspect ratio')
            if path_key=='local_path':
                require(len(blob)==entry['bytes'] and h==900, f'{card_id}: wrong output size')
            else:
                require(hashlib.sha1(blob).hexdigest()==entry['original_sha1'], f'{card_id}: original SHA-1 mismatch')
                if entry.get('commons_structured_sha1'):
                    require(entry['commons_structured_sha1']==entry['original_sha1'], f'{card_id}: upstream checksum mismatch')
    for entry in baseline:
        for path_key,hash_key in [('local_path','sha256'),('original_path','original_sha256')]:
            require(hashlib.sha256((ROOT/entry[path_key]).read_bytes()).hexdigest()==entry[hash_key], f"{entry['card_id']}: original demo bytes changed")
    expected_hash_list=''.join(f"{entry['sha256']}  {entry['local_path']}\n" for entry in items)
    require((ROOT/'assets/cards.sha256').read_text()==expected_hash_list, 'Hash list does not match manifest')
    print(json.dumps({'status':'PASS','cards':78,'decoded_images':78,'source_pages':len(evidence),
                      'unchanged_original_demo_cards':len(baseline),'webp_bytes':sum(e['bytes'] for e in items),
                      'original_jpeg_bytes':sum((ROOT/e['original_path']).stat().st_size for e in items),
                      'missing':[],'visual_edition_count':len({e['visual_edition'] for e in items})}, ensure_ascii=False))


if __name__=='__main__':
    main()
