const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const model = { window: {} };
for (const file of ['reading-deck.js', 'content.js', 'curriculum-content.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), model);
}
const curriculum = model.window.TAROT_CURRICULUM;
const deck = model.window.TAROT_READING_DECK.cards;
const originals = model.window.TAROT_CONTENT.cards;
const english = JSON.parse(fs.readFileSync(path.join(root, 'locales/en-curriculum.json'), 'utf8'));
const expected = [
  ...Array.from({ length: 22 }, (_, i) => 'm' + String(i).padStart(2, '0')),
  ...['w', 'c', 's', 'p'].flatMap(suit => Array.from({ length: 14 }, (_, i) => suit + String(i + 1).padStart(2, '0')))
];
const ids = new Set(expected);
assert.equal(curriculum.version, 1);
assert.equal(curriculum.cards.length, 78, 'Every card needs an authored memory entry');
assert.deepEqual(Array.from(curriculum.cards, card => card.id).sort(), expected.slice().sort());
const allStrings = [];
for (const card of curriculum.cards) {
  assert(ids.has(card.compareId), `${card.id}: comparison target must exist`);
  assert.notEqual(card.compareId, card.id, `${card.id}: compare with another card`);
  for (const [field, min, max] of [['anchor', 8, 40], ['why', 30, 180], ['distinction', 30, 180]]) {
    assert.equal(typeof card[field], 'string', `${card.id}: ${field} is text`);
    assert(card[field].length >= min && card[field].length <= max, `${card.id}: ${field} needs substantive, bounded text`);
    assert(!/TODO|TBD|待补|示例占位/.test(card[field]), `${card.id}: no placeholder ${field}`);
    allStrings.push(card[field]);
  }
  assert.equal(card.distractors.length, 3, `${card.id}: three close alternatives`);
  assert.equal(new Set(card.distractors).size, 3, `${card.id}: alternatives must differ`);
  const possibleCores = [...deck, ...originals].filter(c => c.id === card.id).map(c => c.core);
  for (const distractor of card.distractors) {
    assert.equal(typeof distractor, 'string');
    assert(distractor.length >= 18 && distractor.length <= 90, `${card.id}: alternatives need comparable substantive descriptions`);
    assert(!possibleCores.includes(distractor), `${card.id}: a distractor cannot equal either authored core`);
    allStrings.push(distractor);
  }
}
assert.equal(new Set(curriculum.cards.map(c => c.anchor)).size, 78, 'Each card needs its own mnemonic');
assert.equal(new Set(curriculum.cards.map(c => c.why)).size, 78, 'Each card needs its own visual explanation');
assert.equal(new Set(curriculum.cards.map(c => c.distinction)).size, 78, 'Each card needs its own minimal distinction');
for (const text of allStrings) {
  assert(Object.hasOwn(english, text), `Missing exact English translation: ${text}`);
  assert.equal(typeof english[text], 'string');
  assert(english[text].trim().length >= 10, `English translation needs complete text: ${text}`);
  assert(!/[\u3400-\u9fff]/.test(english[text]), `English translation contains untranslated Han: ${text}`);
}
assert.deepEqual(Object.keys(english).sort(), [...new Set(allStrings)].sort(), 'Translation catalog matches displayed curriculum strings');
console.log(JSON.stringify({
  status: 'PASS', cards: curriculum.cards.length, visualAnchors: 78,
  distinctVisualExplanations: 78, nearCardContrasts: 78,
  closeDistractors: curriculum.cards.reduce((n, c) => n + c.distractors.length, 0),
  englishEntries: Object.keys(english).length,
  scope: 'Static coverage and structural validation; does not certify teaching efficacy or expert review.'
}, null, 2));
