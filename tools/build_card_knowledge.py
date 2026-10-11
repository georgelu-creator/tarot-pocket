"""Compile separately authored card articles; never replace reading-engine fields."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
FILES = ('major.json', 'wands-cups.json', 'swords-pentacles.json')
EXPECTED = {f'm{i:02d}' for i in range(22)} | {f'{s}{i:02d}' for s in 'wcsp' for i in range(1, 15)}


def build():
    articles = {}
    for name in FILES:
        entries = json.loads((ROOT / 'content/card-knowledge' / name).read_text(encoding="utf-8"))
        assert not articles.keys() & entries.keys(), f'Duplicate cards in {name}'
        articles.update(entries)
    assert set(articles) == EXPECTED, 'Knowledge must cover exactly the 78 stable card IDs'
    for card_id, article in articles.items():
        assert article['id'] == card_id
        assert all(item['id'] in EXPECTED and item['id'] != card_id for item in article['comparisons'])
        assert set(article['domains']) == {'love', 'career', 'money', 'study', 'life'}
        assert set(article['learning']) == {'foundation', 'application', 'reversal', 'integration'}
    payload = {'version': 'knowledge-1', 'tradition': 'Rider–Waite–Smith（韦特—史密斯）', 'byId': articles}
    code = 'window.TAROT_CARD_KNOWLEDGE = ' + json.dumps(payload, ensure_ascii=False, indent=2) + ';\n'
    # Keep the same catalog safe in the standalone HTML bundle.
    code = code.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    (ROOT / 'card-knowledge.js').write_text(code, encoding='utf-8')
    print('Compiled detailed knowledge for 78 cards.')


if __name__ == '__main__':
    build()
