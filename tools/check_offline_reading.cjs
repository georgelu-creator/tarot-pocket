'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = {window: {}};
vm.createContext(context);
for (const file of ['reading-deck.js', 'spread-content.js', 'locales/en.js', 'offline-reading.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
}

const api = context.window.TarotOfflineReading;
const deck = context.window.TAROT_READING_DECK.cards;
const spreads = context.window.TAROT_SPREAD_CONTENT.spreads;
const bySpread = new Map(spreads.map(spread => [spread.id, spread]));
const input = (spreadId, additions = {}) => {
  const spread = bySpread.get(spreadId);
  return {
    spreadId,
    topic: 'general',
    language: 'zh',
    cards: spread.positions.map((position, index) => ({
      id: deck[index].id,
      reversed: index % 2 === 1,
      positionId: position.id
    })),
    ...additions
  };
};

assert.equal(api.VERSION, 'OR-1.0.0');
for (const spread of spreads) {
  const result = api.interpret(input(spread.id));
  assert.equal(result.source, 'offline');
  assert.equal(result.isAI, false);
  assert.equal(result.basis.kind, 'spread-purpose');
  assert.equal(result.basis.question, null);
  assert.equal(result.positions.length, spread.positions.length);
  assert.deepEqual(Array.from(result.positions, item => item.positionId), Array.from(spread.positions, position => position.id));
  assert.ok(result.sections.length);
  assert.ok(result.closing.text);
  assert.match(result.boundaries.join(' '), /不是 AI 解读/);
  const translated = api.interpret(input(spread.id, {language: 'en'}));
  assert.doesNotMatch(JSON.stringify(translated), /[\u3400-\u9fff]/, `${spread.id} has complete English output`);
  assert.deepEqual(translated, api.interpret(input(spread.id, {language: 'en'})), `${spread.id} output is deterministic`);
}

const branches = {
  'yes-no': 'yes-no',
  one: 'single',
  three: 'three-card',
  'decision-five': 'choice',
  'relationship-five': 'relationship',
  celtic: 'celtic',
  'career-six': 'general'
};
for (const [spreadId, branch] of Object.entries(branches)) {
  assert.equal(api.interpret(input(spreadId)).spread.branch, branch);
}

const yes = api.interpret(input('yes-no', {question: '这周适合提交申请吗？'}));
assert.equal(yes.overview.tendency, 'leans-yes');
assert.match(yes.sections[0].text, /偏向“能”/);
const pause = api.interpret(input('yes-no', {cards: [{id: 'm00', reversed: true}]}));
assert.equal(pause.overview.tendency, 'pause-and-check');
assert.match(pause.sections[0].text, /先停一下/);

const open = api.interpret(input('open-three'));
assert.match(open.sections[0].text, /不暗设过去、现在、未来/);
const choice = api.interpret(input('decision-five', {optionA: '现在提交', optionB: '再准备一周'}));
assert.ok(choice.sections.some(section => section.title.includes('现在提交')));
assert.ok(choice.sections.some(section => section.title.includes('再准备一周')));
const relationship = api.interpret(input('relationship-five'));
assert.match(relationship.sections.map(section => section.text).join(' '), /不能当成读取对方内心/);
const celtic = api.interpret(input('celtic'));
assert.deepEqual(Array.from(celtic.sections, section => section.id), ['situation', 'background', 'perspective', 'direction']);

const reordered = input('three');
reordered.cards.reverse();
const reorderedResult = api.interpret(reordered);
assert.deepEqual(Array.from(reorderedResult.positions, item => item.positionId), ['state', 'obstacle', 'advice']);
assert.equal(reorderedResult.positions[0].cardId, 'm00');

const english = api.interpret(input('three', {
  language: 'en',
  topic: 'career',
  question: 'What is blocking this project, and what can I try next?'
}));
assert.equal(english.language, 'en');
assert.equal(english.spread.name, 'Present / Obstacle / Advice');
assert.match(english.positions[1].reading, /asks you to check this tension/);
assert.match(english.boundaries.join(' '), /not an AI reading/);
assert.doesNotMatch(JSON.stringify(english), /[\u3400-\u9fff]/);

const custom = api.interpret({
  spreadId: 'custom-two',
  spreadName: 'My two-card check',
  spreadPurpose: 'Compare two named parts of the situation.',
  language: 'en',
  positions: [
    {id: 'known', label: 'What is known', role: 'state'},
    {id: 'next', label: 'What to try', role: 'advice'}
  ],
  cards: [{id: 'm01', reversed: false}, {id: 'm02', reversed: true}]
});
assert.equal(custom.spread.branch, 'general');
assert.equal(custom.positions.length, 2);

for (const invalid of [
  {...input('three'), cards: input('three').cards.slice(1)},
  {...input('three'), language: 'fr'},
  {...input('three'), topic: 'health-diagnosis'},
  {...input('three'), cards: input('three').cards.map(card => ({...card, id: 'm00'}))},
  {...input('three'), cards: input('three').cards.map((card, index) => index ? card : {...card, reversed: 'false'})},
  {...input('three'), cards: input('three').cards.map((card, index) => index ? card : {...card, positionId: 'missing'})},
  {spreadId: 'unknown', cards: [{id: 'm00', reversed: false}]}
]) assert.throws(() => api.interpret(invalid), error => error.code === 'INVALID_OFFLINE_READING');

console.log('PASS: deterministic bilingual offline readings cover all spreads, explicit Yes/No, single, three-card, choice, relationship and Celtic branches, position ordering, no-question defaults, generic fallback and strict validation.');
