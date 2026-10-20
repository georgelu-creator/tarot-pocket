"""Compile separately authored card articles; never replace reading-engine fields."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
FILES = ('major.json', 'wands-cups.json', 'swords-pentacles.json')
EXPECTED = {f'm{i:02d}' for i in range(22)} | {f'{s}{i:02d}' for s in 'wcsp' for i in range(1, 15)}


def build_payload():
    articles = {}
    for name in FILES:
        entries = json.loads((ROOT / 'content/card-knowledge' / name).read_text(encoding="utf-8"))
        assert not articles.keys() & entries.keys(), f'Duplicate cards in {name}'
        articles.update(entries)
    assert set(articles) == EXPECTED, 'Knowledge must cover exactly the 78 stable card IDs'
    reference_text = (ROOT / 'card-reference.js').read_text(encoding='utf-8')
    reference_json = reference_text.split('window.TAROT_CARD_REFERENCE =', 1)[1].strip().removesuffix(';')
    references = json.loads(reference_json)['byId']
    assert set(references) == EXPECTED, 'Reference must cover exactly the 78 stable card IDs'
    for card_id, article in articles.items():
        assert article['id'] == card_id
        assert all(item['id'] in EXPECTED and item['id'] != card_id for item in article['comparisons'])
        assert set(article['domains']) == {'love', 'career', 'money', 'study', 'life'}
        assert set(article['learning']) == {'foundation', 'application', 'reversal', 'integration'}
        assert set(article['narrative']) == {'picture', 'meaning', 'example'}, f'{card_id}: narrative fields'
        assert all(isinstance(text, str) and text.strip() for text in article['narrative'].values()), f'{card_id}: empty narrative'
        # Keep both authored comparisons and an independently authored base comparison.
        # The source catalog stays unchanged; only the compiled payload gains this list.
        related = [dict(item) for item in article['comparisons']]
        base = references[card_id].get('comparison')
        if base and base['id'] not in {item['id'] for item in related}:
            assert base['id'] in EXPECTED and base['id'] != card_id
            related.append(dict(base))
        article['relatedCards'] = related
    return {'version': 'knowledge-1', 'tradition': 'Rider–Waite–Smith（韦特—史密斯）', 'byId': articles}


def build():
    payload = build_payload()
    code = 'window.TAROT_CARD_KNOWLEDGE = ' + json.dumps(payload, ensure_ascii=False, indent=2) + ';\n'
    # Keep the same catalog safe in the standalone HTML bundle.
    code = code.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    (ROOT / 'card-knowledge.js').write_text(code, encoding='utf-8')
    print('Compiled detailed knowledge for 78 cards.')


if __name__ == '__main__':
    build()
