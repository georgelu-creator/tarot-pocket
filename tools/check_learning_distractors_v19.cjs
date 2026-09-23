#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');

const reviewedMap = JSON.parse(fs.readFileSync('tools/learning-distractor-feedback-v19.json', 'utf8'));

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('academy-content.js', 'utf8'), sandbox);
const data = sandbox.window.TAROT_ACADEMY_CONTENT;

const cueZh = /必然|必定|永远|永久|所有|全部|任何|一切|完全|自动|一定|绝不|绝无|再无|从不|保证|立刻|立即|必须|无论|只要|都会|总是|唯一|必有/;
const cueEn = /\b(always|never|every|all|any|automatic(?:ally)?|certain(?:ly)?|definit(?:e|ely)|guarantee(?:d)?|must|immediately|permanent(?:ly)?|completely|entirely|everything|nothing|only)\b/i;
// These constructions can make an incorrect option look wrong through tone
// alone even when it avoids the harder absolute-word list above. Scope this
// check to the 381 reviewed rewrites: older evidence-boundary questions may
// deliberately teach why a claim does not prove a fact.
const softCueZh = /(?:就|便)(?:能|可)(?:说明|证明)|足以(?:说明|证明)|(?:一看到|单凭|仅凭)[^。！？]{0,30}(?:就|便)|证明[^。！？]{0,24}(?:没有|并非)/;
const softCueEn = /\b(?:proves?|proof that|enough to (?:show|prove)|by itself (?:shows?|proves?)|means there (?:was|is) no)\b/i;
const mechanicalResidue = /主要答应|优先宣布|应该，否则|眼前问题|自然会会|如果求|能足以说明|的足以说明|主要主要|大部分大部分/;
const mechanicalFeedbackResidue = /(?:这项说法把重点放在|缺少本题要辨认的|所以本题更贴近|本题要辨认|再看看这些细节|This statement focuses on|misses what the question asks|what the question asks you to identify|The best fit here is|Look at these details again)/i;
const genericFeedbackZh = /^(?:这题不对|答案不对|选错了|不对)[。！!]?$/;
const genericFeedbackEn = /^(?:Not correct|Not quite|Wrong)[.!]?$/i;

function questions(unit) {
  return [...Object.values(unit.questions), ...Object.values(unit.remediation).map((item) => item.question), unit.revisit];
}
function findQuestion(qid) {
  for (const unit of [...data.lessons, ...data.cards]) {
    const question = questions(unit).find((item) => item.id === qid);
    if (question) return question;
  }
  throw new Error(`Missing sample question: ${qid}`);
}
function optionText(qid, oid) {
  const option = findQuestion(qid).options.find((item) => item.id === oid);
  if (!option) throw new Error(`Missing stable sample option: ${qid}/${oid}`);
  return option.text.zh;
}
function optionFeedback(qid, oid) {
  const option = findQuestion(qid).options.find((item) => item.id === oid);
  if (!option) throw new Error(`Missing stable sample option: ${qid}/${oid}`);
  return option.feedback;
}
function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}\nexpected: ${expected}\nactual: ${actual}`);
}

const leaks = [];
const residues = [];
const feedbackResidues = [];
const genericFeedback = [];
const coverage = { lessons: 0, major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0, courts: 0 };
for (const unit of [...data.lessons, ...data.cards]) {
  if (unit.kind === 'lesson') coverage.lessons += 1;
  else if (unit.id[0] === 'm') coverage.major += 1;
  else if (unit.id[0] === 'w') coverage.wands += 1;
  else if (unit.id[0] === 'c') coverage.cups += 1;
  else if (unit.id[0] === 's') coverage.swords += 1;
  else if (unit.id[0] === 'p') coverage.pentacles += 1;
  if (unit.kind === 'card' && 'wcsp'.includes(unit.id[0]) && Number(unit.id.slice(1)) >= 11) coverage.courts += 1;

  for (const question of questions(unit)) {
    const correct = question.options.find((option) => option.id === question.correct);
    for (const option of question.options) {
      const feedback = `${option.feedback.zh} ${option.feedback.en}`;
      if (mechanicalFeedbackResidue.test(feedback)) feedbackResidues.push({ qid: question.id, option: option.id, feedback: option.feedback });
      if (option.id !== question.correct && (genericFeedbackZh.test(option.feedback.zh.trim()) || genericFeedbackEn.test(option.feedback.en.trim()))) {
        genericFeedback.push({ qid: question.id, option: option.id, feedback: option.feedback });
      }
      if (option.id === question.correct) continue;
      if (cueZh.test(option.text.zh) || cueEn.test(option.text.en)) {
        leaks.push({ unit: unit.id, qid: question.id, prompt: question.prompt, correct: correct.text, incorrect: option.text });
      }
      if (mechanicalResidue.test(option.text.zh)) residues.push({ qid: question.id, text: option.text.zh });
    }
  }
}

assertEqual(JSON.stringify(coverage), JSON.stringify({ lessons: 20, major: 22, wands: 14, cups: 14, swords: 14, pentacles: 14, courts: 16 }), 'The audit must cover every course, suit, Major and court card.');
assertEqual(optionText('A05-Q2', 'A05-Q2-5b3d55505c'), 'A 路线里星币牌更多，因此先把它看成更稳妥', 'Course sample regressed.');
assertEqual(optionText('m16-Q1', 'm16-Q1-a7443682d9'), '把突然冲击具体理解成近期交通出行会受阻', 'Major Arcana sample regressed.');
assertEqual(optionText('p08-Q3', 'p08-Q3-db60b7ed2d'), '练了很久还没有进步，说明更适合换一种技能学习。', 'Minor Arcana sample regressed.');
assertEqual(optionText('p02-Q4', 'p02-Q4-2503863740'), '任务分配不均，需要把一部分工作交给别人。', 'Whole-card source override regressed.');
const p13 = findQuestion('p13-R1');
assertEqual(p13.prompt.zh, '伙伴要在工作室连续做一天作品。哪种关心更贴近星币王后？', 'p13 remediation no longer retests practical care.');
assertEqual(p13.correct, 'p13-R1-e9de76c57f', 'p13 stable correct-answer id changed.');
assertEqual(optionText('p13-R1', 'p13-R1-f6e7ab2989'), '告诉对方自己真心希望这次进展顺利，具体准备由对方临时处理。', 'Court-card sample regressed.');

if (reviewedMap.version !== 1 || !Array.isArray(reviewedMap.changes)) throw new Error('Unsupported reviewed distractor map.');
assertEqual(reviewedMap.changes.length, 381, 'Reviewed distractor map must retain all 381 target questions.');
const reviewedKeys = reviewedMap.changes.map((change) => `${change.qid}/${change.incorrectId}`);
assertEqual(new Set(reviewedKeys).size, 381, 'Reviewed distractor map contains duplicate targets.');

const highRiskIds = [
  'A02-R1', 'm00-Q2', 'm03-Q3', 'm09-V1', 'm14-R3', 'w03-V1',
  'w13-Q1', 'c03-RA', 'c04-Q2', 'c04-Q3', 'c04-R2', 'c07-V1',
  'c08-Q2', 'p03-R1', 'p07-Q1', 'p14-Q1', 's09-R3', 's12-R2',
  's07-Q3', 'm13-Q1',
];
const highRiskSet = new Set(highRiskIds);
const reviewedIds = new Set(reviewedMap.changes.map((change) => change.qid));
for (const qid of highRiskIds) {
  if (!reviewedIds.has(qid)) throw new Error(`High-risk ambiguity repair is missing from the reviewed map: ${qid}`);
}

const reviewedFailures = [];
const reviewedSoftLeaks = [];
for (const change of reviewedMap.changes) {
  const question = findQuestion(change.qid);
  const option = question.options.find((item) => item.id === change.incorrectId);
  const correct = question.options.find((item) => item.id === question.correct);
  if (!option) {
    reviewedFailures.push(`${change.qid}: stable incorrect option is missing`);
    continue;
  }
  if (question.correct !== change.correctId) reviewedFailures.push(`${change.qid}: stable correct-answer id changed`);
  if (option.id === question.correct) reviewedFailures.push(`${change.qid}: reviewed incorrect option became correct`);
  if (!correct) reviewedFailures.push(`${change.qid}: correct option is missing`);
  if (correct && JSON.stringify(correct.text) !== JSON.stringify(change.correctOption)) reviewedFailures.push(`${change.qid}: correct-answer copy changed during distractor repair`);
  if (JSON.stringify(option.text) !== JSON.stringify(change.nextOption)) reviewedFailures.push(`${change.qid}: final option differs from reviewed copy`);
  if (JSON.stringify(option.feedback) !== JSON.stringify(change.nextFeedback)) reviewedFailures.push(`${change.qid}: final feedback differs from reviewed copy`);
  if (JSON.stringify(change.currentFeedback) === JSON.stringify(change.nextFeedback)) reviewedFailures.push(`${change.qid}: stale feedback was not replaced`);
  if (correct && JSON.stringify(option.feedback) === JSON.stringify(correct.feedback)) reviewedFailures.push(`${change.qid}: incorrect feedback merely copies the supported answer feedback`);
  if (change.reviewed !== true || !change.reviewedDimension) reviewedFailures.push(`${change.qid}: feedback lacks an explicit review record`);
  if (!change.nextFeedback || change.nextFeedback.zh.length < 18 || change.nextFeedback.en.length < 35) reviewedFailures.push(`${change.qid}: reviewed feedback is missing or too short to explain the distinction`);
  if (correct && (option.text.zh === correct.text.zh || option.text.en === correct.text.en)) reviewedFailures.push(`${change.qid}: incorrect and correct options duplicate each other`);
  if (softCueZh.test(option.text.zh) || softCueEn.test(option.text.en)) reviewedSoftLeaks.push({ qid: change.qid, option: option.text });
  if (highRiskSet.has(change.qid) && JSON.stringify(change.currentOption) === JSON.stringify(change.nextOption)) reviewedFailures.push(`${change.qid}: named ambiguity repair did not change the option`);
}
if (reviewedFailures.length) throw new Error(`Reviewed distractor/feedback failures:\n${reviewedFailures.join('\n')}`);
if (reviewedSoftLeaks.length) throw new Error(`Soft answer-shaped cues remain in reviewed distractors:\n${JSON.stringify(reviewedSoftLeaks, null, 2)}`);

const wholeCardFeedbackFailures = [];
for (const card of data.cards) {
  const question = card.questions.Q4;
  const correct = question.options.find((option) => option.id === question.correct);
  const incorrect = question.options.filter((option) => option.id !== question.correct);
  if (!correct) {
    wholeCardFeedbackFailures.push(`${question.id}: correct option is missing`);
    continue;
  }
  for (const option of incorrect) {
    if (JSON.stringify(option.feedback) === JSON.stringify(correct.feedback)) {
      wholeCardFeedbackFailures.push(`${question.id}/${option.id}: incorrect feedback copies the supported answer feedback`);
    }
  }
  const distinctIncorrect = new Set(incorrect.map((option) => JSON.stringify(option.feedback)));
  if (distinctIncorrect.size !== incorrect.length) {
    wholeCardFeedbackFailures.push(`${question.id}: different incorrect options share the same corrective feedback`);
  }
}
if (wholeCardFeedbackFailures.length) throw new Error(`Whole-card corrective feedback failures:\n${wholeCardFeedbackFailures.join('\n')}`);

if (!optionFeedback('B07-Q2', 'B07-Q2-8e6723cbb6').zh.includes('先全盘接受要求只是把不满推迟')) throw new Error('B07-Q2 no longer explains the selected boundary mistake.');
if (!optionFeedback('I06-Q1', 'I06-Q1-6e0214a99a').zh.includes('继续讨论会把准备停在想法里')) throw new Error('I06-Q1 no longer explains why more discussion delays practical preparation.');
if (!optionFeedback('m17-Q1', 'm17-Q1-77269031eb').zh.includes('希望不等于愿望会照预期实现')) throw new Error('m17-Q1 no longer separates hope from guaranteed fulfilment.');
if (!optionFeedback('p06-R1', 'p06-R1-288c70a568').zh.includes('只看提供者给了多少')) throw new Error('p06-R1 no longer explains the missing recipient perspective.');
const foolWholeCard = findQuestion('m00-Q4');
for (const option of foolWholeCard.options.filter((item) => item.id !== foolWholeCard.correct)) {
  if (!option.feedback.zh.includes('悬崖')) throw new Error(`m00-Q4/${option.id} no longer returns to the concrete picture evidence.`);
}

assertEqual(optionText('s07-Q3', 's07-Q3-96cf5c470a'), '主动说明改动，重点是为自己之前的做法辩解。', 's07-Q3 soft-absolute repair regressed.');
assertEqual(optionText('m13-Q1', 'm13-Q1-fc07587f7a'), '经历重大变化时，重点在原来的生活被打乱和失去。', 'm13-Q1 Chinese repair regressed.');
assertEqual(findQuestion('m13-Q1').options.find((item) => item.id === 'm13-Q1-fc07587f7a').text.en, 'In a major change, the focus is disruption of the previous life and loss.', 'm13-Q1 English equivalence regressed.');

if (residues.length) {
  console.error('Mechanical rewrite residue found:', JSON.stringify(residues, null, 2));
  process.exit(1);
}
if (feedbackResidues.length) {
  console.error('Mechanical answer-reveal feedback residue found:', JSON.stringify(feedbackResidues, null, 2));
  process.exit(1);
}
if (genericFeedback.length) {
  console.error('Incorrect options need a concrete correction, not a generic rejection:', JSON.stringify(genericFeedback, null, 2));
  process.exit(1);
}
if (leaks.length) {
  const grouped = {};
  for (const leak of leaks) {
    const key = leak.unit[0] === 'w' || leak.unit[0] === 'c' ? 'wands_cups' : leak.unit[0] === 's' || leak.unit[0] === 'p' ? 'swords_pentacles' : 'course_major';
    (grouped[key] ||= []).push(leak.qid);
  }
  console.error(`Found ${leaks.length} incorrect options carrying an answer-shaped absolute.`);
  console.error(JSON.stringify(Object.fromEntries(Object.entries(grouped).map(([key, ids]) => [key, { count: ids.length, qids: ids }])), null, 2));
  process.exit(1);
}

console.log('Learning distractor check passed: 20 courses + all 78 cards audited; all 381 reviewed distractors have matched bilingual, example-specific feedback that differs from the supported answer feedback; every whole-card wrong option has distinct corrective feedback; the 20 named high-risk repairs are present; and all feedback contains 0 legacy answer-reveal templates or generic rejection messages.');
