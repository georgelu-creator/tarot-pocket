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

assert.equal(api.VERSION, 'OR-1.2.0');
const offlineSource = fs.readFileSync(path.join(root, 'offline-reading.js'), 'utf8');
assert.doesNotMatch(offlineSource, /SIGNAL_WORDS|countSignals|semanticScore|propositionScore/, 'result tendencies must not scan or repeatedly score natural-language substrings');
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

const yes = api.interpret(input('yes-no', {question: '这周适合提交申请吗？', cards: [{id: 'm19', reversed: false}]}));
assert.equal(yes.overview.tendency, 'leans-yes');
assert.match(yes.overview.text, /^对“这周适合提交申请吗？”/);
assert.doesNotMatch(yes.overview.text, /太阳正位/);
assert.match(yes.sections[0].text, /太阳正位.*结果倾向/);
assert.notEqual(yes.overview.text, yes.sections[0].text);
assert.doesNotMatch(yes.overview.text, /前提是把这张牌指出的条件处理好/);

// Orientation is not a yes/no vote: an upright pause card is not an automatic
// yes, a reversed positive card is not an automatic stop, and changing the
// proposition from submitting to pausing changes how the same meaning applies.
const uprightPause = api.interpret(input('yes-no', {question: '这周适合提交申请吗？', cards: [{id: 's04', reversed: false}]}));
assert.equal(uprightPause.overview.tendency, 'leans-no');
assert.match(uprightPause.sections[0].text, /宝剑四正位.*休整/);
const reversedSun = api.interpret(input('yes-no', {question: '这周适合提交申请吗？', cards: [{id: 'm19', reversed: true}]}));
assert.equal(reversedSun.overview.tendency, 'conditional');
assert.match(reversedSun.sections[0].text, /太阳逆位.*漏掉细节/);
assert.doesNotMatch(reversedSun.overview.text, /先停一下|逆位直接算“不能”$/);
const pauseSameCard = api.interpret(input('yes-no', {question: '这周适合先暂停申请吗？', cards: [{id: 's04', reversed: false}]}));
assert.equal(pauseSameCard.overview.tendency, 'leans-yes');
const endingCardForPass = api.interpret(input('yes-no', {question: '这次申请会通过吗？', cards: [{id: 's10', reversed: false}]}));
const endingCardForRejection = api.interpret(input('yes-no', {question: '这次申请会被拒绝吗？', cards: [{id: 's10', reversed: false}]}));
const endingCardForFailure = api.interpret(input('yes-no', {question: '这次考试会失败吗？', cards: [{id: 's10', reversed: false}]}));
assert.equal(endingCardForPass.overview.tendency, 'leans-no');
assert.equal(endingCardForRejection.overview.tendency, 'leans-yes');
assert.equal(endingCardForFailure.overview.tendency, 'leans-yes');
assert.match(endingCardForFailure.overview.text, /(?:考试)?失败或(?:没有|不)通过的风险更高/);
assert.match(endingCardForRejection.overview.text, /被拒绝、拉黑或得不到回应的风险更高/);
const cupsFiveForPass = api.interpret(input('yes-no', {question: '这次考试会通过吗？', cards: [{id: 'c05', reversed: false}]}));
assert.equal(cupsFiveForPass.overview.tendency, 'leans-no');
assert.match(cupsFiveForPass.overview.text, /不支持“通过.*考试或审核”/);
const reversedWorldForCompletion = api.interpret(input('yes-no', {question: '这个项目能按时完成吗？', cards: [{id: 'm21', reversed: true}]}));
assert.equal(reversedWorldForCompletion.overview.tendency, 'leans-no');
assert.match(reversedWorldForCompletion.sections[0].text, /世界逆位.*最后一环迟迟未完成/);
const quit = api.interpret(input('yes-no', {question: '我现在该辞职吗？', cards: [{id: 'm13', reversed: false}]}));
assert.equal(quit.overview.tendency, 'leans-yes');
assert.match(quit.overview.text, /认真考虑辞职离开当前工作/);
const breakup = api.interpret(input('yes-no', {question: '我们会分手吗？', cards: [{id: 'm13', reversed: false}]}));
assert.equal(breakup.overview.tendency, 'leans-yes');
assert.match(breakup.overview.text, /这段关系有走向结束的风险/);
for (const question of ['我不想复合，这段关系该结束吗？', '这段关系要不要结束？', '我该不该离开他？']) {
  const result = api.interpret(input('yes-no', {question, cards: [{id: 'm13', reversed: false}]}));
  assert.equal(result.overview.tendency, 'leans-yes', question);
  assert.match(result.overview.text, /支持认真考虑结束这段关系/, question);
  assert.doesNotMatch(result.overview.text, /支持“不复合”/, question);
}
const partnerLeaves = api.interpret(input('yes-no', {question: '他会离开我吗？', cards: [{id: 'm13', reversed: false}]}));
assert.equal(partnerLeaves.overview.tendency, 'leans-yes');
assert.match(partnerLeaves.overview.text, /这段关系有走向结束的风险/);
for (const question of ['这份工作该不该继续？', '这份工作要不要继续？', '这份工作值得留下吗？']) {
  const result = api.interpret(input('yes-no', {question, cards: [{id: 'm13', reversed: false}]}));
  assert.equal(result.overview.tendency, 'leans-no', question);
  assert.match(result.overview.text, /目前这份工作继续下去会有明显阻碍/, question);
}
for (const question of ['这次考试会考不上吗？', '这次考试会挂科吗？', '这次考试会不及格吗？', '这次考试会落榜吗？']) {
  const result = api.interpret(input('yes-no', {question, cards: [{id: 's10', reversed: false}]}));
  assert.equal(result.overview.tendency, 'leans-yes', question);
  assert.match(result.overview.text, /考试失败或没有通过的风险更高/, question);
}
for (const question of ['他会拒绝我的表白吗？', '他会拉黑我吗？', '他会不理我吗？']) {
  const result = api.interpret(input('yes-no', {question, cards: [{id: 'c05', reversed: false}]}));
  assert.equal(result.overview.tendency, 'leans-yes', question);
  assert.match(result.overview.text, /被拒绝、拉黑或得不到回应的风险更高/, question);
}
for (const question of ['我会失业吗？', '我会被裁员吗？', '我会丢掉这份工作吗？']) {
  const result = api.interpret(input('yes-no', {question, cards: [{id: 'm13', reversed: false}]}));
  assert.equal(result.overview.tendency, 'leans-yes', question);
  assert.match(result.overview.text, /失去目前工作的风险更高/, question);
}
const offer = api.interpret(input('yes-no', {question: '我能拿到这次录用或 offer 吗？', cards: [{id: 'm19', reversed: false}]}));
assert.equal(offer.overview.tendency, 'leans-yes');
assert.match(offer.overview.text, /能拿到这次录用或 offer/);
assert.doesNotMatch(offer.overview.text, /考试或审核/);
const finalClausePass = api.interpret(input('yes-no', {question: '这次考试会通过吗？我最近复习很少。', cards: [{id: 'm19', reversed: false}]}));
assert.equal(finalClausePass.overview.tendency, 'leans-yes');
assert.match(finalClausePass.overview.text, /通过问题里所说的考试或审核/);
const jobProgressWithAdvice = api.interpret(input('yes-no', {question: '按目前的情况，我的求职有希望取得进展吗，最需要留意什么？', cards: [{id: 'm19', reversed: false}]}));
assert.equal(jobProgressWithAdvice.overview.tendency, 'leans-yes');
assert.match(jobProgressWithAdvice.overview.text, /继续推进/);
const continueCurrentJob = api.interpret(input('yes-no', {question: '我该继续这份工作吗？', cards: [{id: 'm19', reversed: false}]}));
assert.equal(continueCurrentJob.overview.tendency, 'leans-yes');
assert.match(continueCurrentJob.overview.text, /目前的工作还能继续/);
for (const [positive, negative] of [
  ['他明天会来吗？', '他明天不会来吗？'],
  ['明天会下雨吗？', '明天不会下雨吗？'],
  ['这个消息是真的吗？', '这个消息不是真的吗？']
]) {
  const positiveResult = api.interpret(input('yes-no', {question: positive, cards: [{id: 'm19', reversed: false}]}));
  const negativeResult = api.interpret(input('yes-no', {question: negative, cards: [{id: 'm19', reversed: false}]}));
  assert.equal(positiveResult.overview.tendency, 'leans-yes', positive);
  assert.equal(negativeResult.overview.tendency, 'leans-no', negative);
  assert.match(negativeResult.overview.text, /不支持问题里的否定情况成立/, negative);
}

// Medical diagnosis/medication, legal conclusions and high-risk financial
// decisions stop before any tarot tendency and point to a real-world next step.
const highRiskCases = [
  ['我是不是得了抑郁症？', /正规医疗机构|有资质的医生/],
  ['这个检查结果是不是恶性肿瘤？', /正规医疗机构|有资质的医生/],
  ['我现在可以停药吗？', /开药医生|有资质的药师/],
  ['我是不是应该立刻停掉医生开的药？', /开药医生|有资质的药师/],
  ['这份合同违法吗？', /律师|法律援助/],
  ['我该把全部积蓄投入这个项目吗？', /应急资金.*最坏损失.*持牌专业人士/]
];
const highRiskResults = highRiskCases.map(([question, nextStep]) => {
  const result = api.interpret(input('yes-no', {question, cards: [{id: 'm19', reversed: false}]}));
  assert.equal(result.overview.tendency, 'not-applicable', question);
  assert.match([result.overview.text, ...result.sections.map(section => section.text)].join(' '), nextStep, question);
  assert.doesNotMatch(result.overview.text, /更支持.*这一边|目前更偏向|牌面.*(?:支持|不支持)/, question);
  assert.match(result.positions[0].reading, /不用于作出这项高风险判断或决定/);
  assert.notEqual(result.overview.text, result.sections[0].text, question + ' separates boundary from next step');
  return result;
});
const contrastedSafeQuestion = api.interpret(input('yes-no', {question: '我不是想问合同违法吗，而是这次考试会通过吗？', cards: [{id: 'm19', reversed: false}]}));
assert.equal(contrastedSafeQuestion.overview.tendency, 'leans-yes');
assert.doesNotMatch(contrastedSafeQuestion.overview.text, /律师|法律援助/);
const medicationEnglish = api.interpret(input('yes-no', {language: 'en', question: 'Should I stop my medication?', cards: [{id: 'm19', reversed: false}]}));
assert.equal(medicationEnglish.overview.tendency, 'not-applicable');
assert.match(medicationEnglish.sections[0].text, /prescribed it|qualified pharmacist/);
assert.doesNotMatch(JSON.stringify(medicationEnglish), /[\u3400-\u9fff]/);
const discontinueEnglish = api.interpret(input('yes-no', {language: 'en', question: 'Should I discontinue this prescription?', cards: [{id: 'm19', reversed: false}]}));
assert.equal(discontinueEnglish.overview.tendency, 'not-applicable');

for (const spreadId of ['one', 'three', 'open-three', 'timeline', 'relationship-five']) {
  const result = api.interpret(input(spreadId, {question: '我现在能停药吗？'}));
  assert.equal(result.overview.tendency, 'not-applicable', spreadId + ' high-risk preflight');
  assert.match(result.sections[0].text, /开药医生|有资质的药师/, spreadId);
  assert.ok(result.positions.every(position => /不用于作出这项高风险判断或决定/.test(position.reading)), spreadId);
}
for (const question of ['我有抑郁症，这次考试会通过吗？', '医生已经让我停药，这次考试会通过吗？', '我已经按医生要求停掉这个药，这次考试会通过吗？', '这份合同已经由律师确认合法，这次合作会成吗？', '我不打算投入全部积蓄，这个项目会完成吗？']) {
  const result = api.interpret(input('yes-no', {question, cards: [{id: 'm19', reversed: false}]}));
  assert.notEqual(result.overview.tendency, 'not-applicable', question);
}

const keepJob = api.interpret(input('yes-no', {question: '我继续做不辞职会有进展吗？', cards: [{id: 'm13', reversed: false}]}));
assert.doesNotMatch(keepJob.overview.text, /支持认真考虑辞职/);
const keepGoing = api.interpret(input('yes-no', {question: '这件事不暂停继续推进能完成吗？', cards: [{id: 'm19', reversed: false}]}));
assert.doesNotMatch(keepGoing.overview.text, /先暂停/);
const negatedPredicates = [
  ['这次不会被拒绝吗？', 'm19', false, /不被拒绝/],
  ['这次不会失败吗？', 'm19', false, /不失败/],
  ['我不辞职继续留下会更好吗？', 'm13', false, /继续留在当前工作/],
  ['我们不分手继续在一起好吗？', 'm19', false, /继续维持这段关系/],
  ['这件事不暂停继续推进好吗？', 'm01', false, /继续推进/],
  ['我不想复合，保持距离会更好吗？', 'm13', false, /保持距离/],
  ['这个项目不会完成吗？', 'm21', true, /无法完成/],
  ['这个项目会没进展吗？', 'm12', false, /无法推进/]
];
for (const [question, id, reversed, phrase] of negatedPredicates) {
  const result = api.interpret(input('yes-no', {question, cards: [{id, reversed}]}));
  assert.match(result.overview.text, phrase, question);
  assert.doesNotMatch(result.overview.text, /支持认真考虑辞职|走向结束的风险|支持先暂停|支持“重新在一起”/, question);
}

const noQuestion = api.interpret(input('yes-no', {cards: [{id: 'm19', reversed: false}]}));
assert.equal(noQuestion.overview.tendency, 'general-guidance');
assert.match(noQuestion.overview.text, /不能替一件未知的事回答“能”或“不能”/);
assert.doesNotMatch(noQuestion.overview.text, /目前更偏向/);

const open = api.interpret(input('open-three', {
  question: '这个合作这周能推进吗？',
  cards: [
    {id: 'm01', reversed: false, positionId: 'card-1'},
    {id: 's04', reversed: true, positionId: 'card-2'},
    {id: 'p08', reversed: false, positionId: 'card-3'}
  ]
}));
assert.match(open.overview.text, /^对“这个合作这周能推进吗？”/);
assert.match(open.overview.text, /更支持“继续推进”/);
for (const evidence of ['魔术师正位', '宝剑四逆位', '星币八正位']) assert.match(open.sections[0].text, new RegExp(evidence));
assert.match(open.overview.text, /三张牌共同聚焦在/);
assert.notEqual(open.overview.text, open.sections[0].text, 'free-three overview must not repeat the full card evidence');
assert.equal(open.closing.title, '怎样回到现实核对');
assert.doesNotMatch(open.closing.text, /三张牌共同聚焦|魔术师|宝剑四|星币八/);
assert.doesNotMatch([open.overview.text, open.sections[0].text, open.closing.realityCheck].join(' '), /第\s*1\s*张.*过去.*第\s*2\s*张.*现在|第\s*3\s*张(?:不是|是|作为)(?:建议|未来|结果)|编号只表示抽取顺序/);
assert.doesNotMatch(open.overview.text, /趋势或结果牌位/);

const openCauseAndAction = api.interpret(input('open-three', {
  question: '这件事为什么推进不顺，我可以做什么？',
  cards: [
    {id: 'p14', reversed: false, positionId: 'card-1'},
    {id: 'c02', reversed: false, positionId: 'card-2'},
    {id: 'm15', reversed: false, positionId: 'card-3'}
  ]
}));
assert.match(openCauseAndAction.overview.text, /^对“这件事为什么推进不顺，我可以做什么”，/);
assert.match(openCauseAndAction.overview.text, /当前最值得核对的卡点是：某种欲望、依赖或习惯正在缩小选择空间/);
assert.match(openCauseAndAction.overview.text, /可以先做的是：如果需要别人配合，先确认彼此有没有听见和回应；如果主要由你完成，就检查投入有没有得到有效反馈/);
assert.doesNotMatch(openCauseAndAction.overview.text, /？”|三张牌共同聚焦在|第\s*1\s*张.*原因|第\s*3\s*张.*建议/);
assert.notEqual(openCauseAndAction.overview.text, openCauseAndAction.sections[0].text);
assert.doesNotMatch([openCauseAndAction.overview.text, openCauseAndAction.closing.text].join(' '), /？”，/);

const choice = api.interpret(input('decision-five', {
  question: '哪种学习安排更适合三个月内完成作品？', optionA: '固定小班', optionB: '零散视频',
  cards: [
    {id: 'm00', reversed: false, positionId: 'current'},
    {id: 'c02', reversed: false, positionId: 'a-development'},
    {id: 'w10', reversed: true, positionId: 'b-development'},
    {id: 'p08', reversed: false, positionId: 'a-outcome'},
    {id: 's10', reversed: false, positionId: 'b-outcome'}
  ]
}));
assert.match(choice.overview.text, /更支持选项 A · 固定小班/);
assert.ok(choice.sections.some(section => section.title.includes('固定小班')));
assert.ok(choice.sections.some(section => section.title.includes('零散视频')));
for (const evidence of ['圣杯二正位', '星币八正位', '权杖十逆位', '宝剑十正位']) assert.match(choice.sections.map(section => section.text).join(' '), new RegExp(evidence));
assert.equal(choice.sections.find(section => section.id === 'comparison').title, '把几个选项放在一起看');

const choiceSunA = api.interpret(input('decision-five', {question: '辞职还是留下，哪个更适合我？', optionA: '留下', optionB: '辞职', cards: [
  {id: 'm00', reversed: false, positionId: 'current'}, {id: 'c02', reversed: false, positionId: 'a-development'}, {id: 'c05', reversed: false, positionId: 'b-development'}, {id: 'm19', reversed: false, positionId: 'a-outcome'}, {id: 'm13', reversed: false, positionId: 'b-outcome'}
]}));
const choiceSunB = api.interpret(input('decision-five', {question: '辞职还是留下，哪个更适合我？', optionA: '辞职', optionB: '留下', cards: [
  {id: 'm00', reversed: false, positionId: 'current'}, {id: 'c05', reversed: false, positionId: 'a-development'}, {id: 'c02', reversed: false, positionId: 'b-development'}, {id: 'm13', reversed: false, positionId: 'a-outcome'}, {id: 'm19', reversed: false, positionId: 'b-outcome'}
]}));
assert.match(choiceSunA.overview.text, /不硬选一个答案/);
assert.match(choiceSunB.overview.text, /不硬选一个答案/);
for (const question of ['哪个更适合增加收入？', '哪个更适合减少工作强度？', '哪个更适合长期稳定？', '哪个更适合尽快离开目前环境？']) {
  const result = api.interpret(input('three-options', {question, optionA: '方案 A', optionB: '方案 B', optionC: '方案 C', cards: [
    {id: 'm19', reversed: false, positionId: 'option-a'},
    {id: 's04', reversed: false, positionId: 'option-b'},
    {id: 'c05', reversed: false, positionId: 'option-c'}
  ]}));
  assert.match(result.overview.text, /没有足够依据.*不硬选一个答案/, question);
  assert.doesNotMatch(result.overview.text, /更支持选项|明显领先/, question);
}

const choiceWithoutGoal = api.interpret(input('decision-five', {question: '', optionA: '继续准备', optionB: '接受当前方案', cards: [
  {id: 'm00', reversed: false, positionId: 'current'}, {id: 'c02', reversed: false, positionId: 'a-development'}, {id: 'c05', reversed: false, positionId: 'b-development'}, {id: 'm19', reversed: false, positionId: 'a-outcome'}, {id: 'm13', reversed: false, positionId: 'b-outcome'}
]}));
assert.match(choiceWithoutGoal.overview.text, /没有填写这次比较最在意的目标/);
assert.doesNotMatch(choiceWithoutGoal.overview.text, /更支持选项|明显领先/);

const threeOptions = api.interpret(input('three-options', {
  question: '哪个安排更适合这周稳定练习？', optionA: '早上', optionB: '午间', optionC: '晚上',
  cards: [
    {id: 'p08', reversed: false, positionId: 'option-a'},
    {id: 'w10', reversed: true, positionId: 'option-b'},
    {id: 'm19', reversed: false, positionId: 'option-c'}
  ]
}));
assert.match(threeOptions.overview.text, /没有一条路径明显领先/);
for (const label of ['早上', '午间', '晚上']) assert.ok(threeOptions.sections.some(section => section.title.includes(label)));

const concreteThree = api.interpret(input('three', {
  question: '这件事为什么推进不顺，我可以做什么？',
  cards: [
    {id: 's08', reversed: false, positionId: 'state'},
    {id: 's04', reversed: true, positionId: 'obstacle'},
    {id: 'm16', reversed: false, positionId: 'advice'}
  ]
}));
assert.match(concreteThree.overview.text, /^对“这件事为什么推进不顺，我可以做什么？”/);
assert.match(concreteThree.overview.text, /现在容易觉得处处受限.*休息不够就急着回到任务.*原来的计划或判断已经有一部分不成立.*最早暴露出来的具体问题/);
const concreteVisible = [concreteThree.overview.text, ...concreteThree.sections.map(section => section.text), concreteThree.closing.text].join(' ');
assert.equal((concreteVisible.match(/现在容易觉得处处受限/g) || []).length, 1, 'answer is not repeated verbatim in the evidence section');
assert.doesNotMatch(concreteVisible, /结构|失效|信号|能量|张力|逐牌|牌义拼接/);
for (const evidence of ['宝剑八正位', '宝剑四逆位', '高塔正位']) assert.match(concreteThree.sections[0].text, new RegExp(evidence));

const relationship = api.interpret(input('relationship-five'));
assert.match(relationship.sections.map(section => section.text).join(' '), /不能当成读取对方内心/);
const relationshipCurrent = api.interpret(input('relationship-three', {topic: 'love', question: '我们下个月会在一起吗？'}));
assert.match(relationshipCurrent.overview.text, /没有未来位或结果位，不能据此预测关系会不会、何时发生变化/);
for (const question of ['我们还有可能吗？', '他还会回来吗？', '他还会联系我吗？']) {
  assert.match(api.interpret(input('relationship-three', {topic: 'love', question})).overview.text, /没有未来位或结果位/, question);
}
for (const question of ['这段暧昧会有结果吗？', '我们会有结果吗？', '这段关系能成吗？', '他最后会选择我吗？', '我们的关系会稳定下来吗？']) {
  assert.match(api.interpret(input('relationship-three', {topic: 'love', question})).overview.text, /没有未来位或结果位/, question);
}
const relationshipTrend = api.interpret(input('relationship-five', {
  topic: 'love', question: '我们还有复合的机会吗？',
  cards: [
    {id: 's03', reversed: false, positionId: 'self'},
    {id: 'c02', reversed: false, positionId: 'partner'},
    {id: 'c05', reversed: false, positionId: 'foundation'},
    {id: 's04', reversed: false, positionId: 'present'},
    {id: 'm19', reversed: false, positionId: 'direction'}
  ]
}));
assert.match(relationshipTrend.overview.text, /^对“我们还有复合的机会吗？”.*更偏向还有重新靠近或复合的机会/);
assert.match(relationshipTrend.overview.text, /后续方向.*太阳正位/);
assert.notEqual(relationshipTrend.overview.text, relationshipTrend.sections[0].text, 'relationship overview must not repeat its evidence section');
const relationshipOpenDevelopment = api.interpret(input('relationship-five', {
  topic: 'love', question: '我们接下来会怎样发展？',
  cards: [
    {id: 's03', reversed: false, positionId: 'self'},
    {id: 'c02', reversed: false, positionId: 'partner'},
    {id: 'c05', reversed: false, positionId: 'foundation'},
    {id: 's04', reversed: false, positionId: 'present'},
    {id: 'p08', reversed: true, positionId: 'direction'}
  ]
}));
assert.match(relationshipOpenDevelopment.overview.text, /指向这样的发展.*相处技巧可能需要通过日常行动不断练习/);
assert.match(relationshipOpenDevelopment.overview.text, /逆位时还要留意.*机械重复同样错误/);
assert.doesNotMatch(relationshipOpenDevelopment.overview.text, /更支持“继续推进”|通过有反馈的重复练习，把细节磨成技能。这是/);
for (const question of ['这段暧昧会有结果吗？', '我们会有结果吗？', '这段关系能成吗？', '他最后会选择我吗？', '我们的关系会稳定下来吗？']) {
  const result = api.interpret(input('relationship-five', {
    topic: 'love', question,
    cards: [
      {id: 's03', reversed: false, positionId: 'self'},
      {id: 'c02', reversed: false, positionId: 'partner'},
      {id: 'c05', reversed: false, positionId: 'foundation'},
      {id: 's04', reversed: false, positionId: 'present'},
      {id: 'm19', reversed: false, positionId: 'direction'}
    ]
  }));
  assert.match(result.overview.text, /趋势／结果牌|后续方向.*太阳正位/, question);
}
const timelineResult = api.interpret(input('timeline', {
  topic: 'study', question: '这次考试会通过吗？',
  cards: [
    {id: 'p08', reversed: false, positionId: 'past'},
    {id: 's04', reversed: false, positionId: 'present'},
    {id: 'm19', reversed: false, positionId: 'trend'}
  ]
}));
assert.match(timelineResult.overview.text, /^对“这次考试会通过吗？”.*更支持“通过.*考试或审核”/);
assert.match(timelineResult.sections[0].text, /延续趋势.*太阳正位/);
assert.notEqual(timelineResult.overview.text, timelineResult.sections[0].text, 'timeline overview must not duplicate the position evidence');
assert.doesNotMatch(timelineResult.closing.text, /看到问题的全貌，也更愿意把事情放到明面上/);
const timelineNoQuestion = api.interpret(input('timeline'));
assert.notEqual(timelineNoQuestion.overview.text, timelineNoQuestion.sections[0].text);
assert.equal(timelineNoQuestion.overview.text.includes(timelineNoQuestion.sections[0].text), false, 'questionless timeline summary must not contain the full evidence section');
for (const spreadId of ['new-love', 'career-six']) {
  const result = api.interpret(input(spreadId));
  assert.notEqual(result.overview.text, result.sections[0].text, spreadId + ' overview differs from evidence');
  assert.equal(result.overview.text.includes(result.sections[0].text), false, spreadId + ' overview must not repeat every position');
}
const celtic = api.interpret(input('celtic'));
assert.deepEqual(Array.from(celtic.sections, section => section.id), ['situation', 'background', 'perspective', 'direction']);
const celticOpenDevelopment = api.interpret(input('celtic', {topic: 'career', question: '未来三个月留在现在岗位会怎样发展？'}));
assert.match(celticOpenDevelopment.overview.text, /指向这样的发展/);
assert.doesNotMatch(celticOpenDevelopment.overview.text, /更支持“继续推进”/);
const pageOfSwordsAdvice = api.interpret(input('three', {topic: 'study', question: '复习时我下一步该做什么？', cards: [
  {id: 'p08', reversed: false, positionId: 'state'},
  {id: 's04', reversed: false, positionId: 'obstacle'},
  {id: 's11', reversed: false, positionId: 'advice'}
]}));
assert.match(pageOfSwordsAdvice.positions[2].reading, /完整知识结构/);

for (const result of [yes, uprightPause, reversedSun, pauseSameCard, endingCardForPass, endingCardForRejection, endingCardForFailure, cupsFiveForPass, reversedWorldForCompletion, quit, breakup, ...highRiskResults, contrastedSafeQuestion, noQuestion, open, choice, threeOptions, concreteThree, relationshipCurrent, relationshipTrend, timelineResult]) {
  assert.doesNotMatch([result.overview.text, ...result.sections.map(section => section.text), result.closing.title].join(' '), /关系张力|现实落点|可以落地的一步|能量流动/);
}

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
assert.match(english.positions[1].reading, /main obstacle to check/);
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

console.log('PASS: deterministic bilingual offline readings cover all spreads, high-risk Yes/No stops, explicit predicate rules, same-dimension choices, non-repeating free-three/timeline/general summaries and relationship scope.');
