#!/usr/bin/env node
/* Apply explicit, independently reviewed distractor option and feedback copy.
 *
 * Usage:
 *   node tools/apply_learning_distractor_map_v19.cjs map.json
 *   node tools/apply_learning_distractor_map_v19.cjs --apply map.json
 *
 * Dry-run is the default. The repair-map schema records the exact current
 * option and feedback plus reviewed replacements. The script changes only the
 * owning question block, the stable-id registry row, or an explicit Q4
 * feedback override row. Correct answers and stable ids never change.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const masterPath = path.join(root, 'docs/LEARNING_MASTER.md');
const academyPath = path.join(root, 'academy-content.js');
const apply = process.argv.includes('--apply');
const mapPaths = process.argv.slice(2).filter((arg) => arg !== '--apply').map((arg) => path.resolve(arg));
if (!mapPaths.length) throw new Error('Pass at least one reviewed mapping JSON file.');

const hardCueZh = /必然|必定|永远|永久|所有|全部|任何|一切|完全|自动|一定|绝不|绝无|再无|从不|保证|立刻|立即|必须|无论|只要|都会|总是|唯一|必有/;
const hardCueEn = /\b(always|never|every|all|any|automatic(?:ally)?|certain(?:ly)?|definit(?:e|ely)|guarantee(?:d)?|must|immediately|permanent(?:ly)?|completely|entirely|everything|nothing|only)\b/i;

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(academyPath, 'utf8'), sandbox);
const data = sandbox.window.TAROT_ACADEMY_CONTENT;
const questions = new Map();
for (const unit of [...data.lessons, ...data.cards]) {
  for (const q of Object.values(unit.questions)) questions.set(q.id, q);
  for (const r of Object.values(unit.remediation)) questions.set(r.question.id, r.question);
  questions.set(unit.revisit.id, unit.revisit);
}

const mappings = [];
for (const mapPath of mapPaths) {
  const doc = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  if (doc.version !== 1 || !Array.isArray(doc.changes)) throw new Error(`Unsupported map format: ${mapPath}`);
  for (const raw of doc.changes) {
    const change = raw.incorrectId ? raw : {
      qid: raw.qid,
      letter: raw.letter,
      incorrectId: raw.incorrect && raw.incorrect.id,
      currentOption: raw.incorrect && raw.incorrect.text,
      nextOption: raw.next,
      mapPath,
    };
    mappings.push({ ...change, mapPath });
  }
}
const keys = mappings.map((change) => `${change.qid}/${change.incorrectId}`);
if (new Set(keys).size !== keys.length) throw new Error('Duplicate qid/option id across mapping files.');

function questionBlock(source, qid) {
  const lower = source.toLowerCase();
  const exactAnchor = `<a id="${qid.toLowerCase()}"></a>`;
  const checkHeading = `#### ${qid.toLowerCase()}-check`;
  const directHeading = `#### ${qid.toLowerCase()} ·`;
  const anchor = lower.indexOf(exactAnchor) >= 0
    ? lower.indexOf(exactAnchor)
    : lower.indexOf(checkHeading) >= 0
      ? lower.indexOf(checkHeading)
      : lower.indexOf(directHeading) >= 0
        ? lower.indexOf(directHeading)
        : lower.indexOf(qid.toLowerCase());
  if (anchor < 0) throw new Error(`Question anchor not found in LEARNING_MASTER: ${qid}`);
  const lineStart = source.lastIndexOf('\n', anchor) + 1;
  if (source.startsWith('| ', lineStart)) {
    const end = source.indexOf('\n', anchor);
    return { start: lineStart, end: end < 0 ? source.length : end };
  }
  const candidates = [
    source.indexOf('\n<a id=', anchor + qid.length),
    source.indexOf('\n#### ', anchor + qid.length),
    source.indexOf('\n### ', anchor + qid.length),
    source.indexOf('\n## ', anchor + qid.length),
  ].filter((offset) => offset > anchor);
  return { start: lineStart, end: candidates.length ? Math.min(...candidates) : source.length };
}

function assertSafePair(pair, label) {
  if (!pair || !pair.zh || !pair.en) throw new Error(`Missing bilingual ${label}`);
  if (pair.zh.includes('|') || pair.en.includes('|') || /[\r\n]/.test(pair.zh + pair.en)) {
    throw new Error(`${label} cannot be represented safely in the source table`);
  }
}

function replaceOne(text, regex, replacement, label) {
  const matches = [...text.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g'))];
  if (matches.length !== 1) throw new Error(`${label} must match exactly once; found ${matches.length}`);
  return text.replace(regex, replacement);
}

function patchRegularBlock(block, change) {
  const currentOption = change.currentOption;
  const nextOption = change.nextOption || currentOption;
  const currentFeedback = change.currentFeedback;
  const nextFeedback = change.nextFeedback;
  const letter = change.letter;
  let nextBlock = block;

  if (/^[BIA]\d\d-/.test(change.qid)) {
    const optionToken = `${letter}「${currentOption.zh} / ${currentOption.en}」→「`;
    const start = nextBlock.indexOf(optionToken);
    if (start < 0) throw new Error(`Lesson option token missing from ${change.qid}`);
    const feedbackStart = start + optionToken.length;
    const feedbackEnd = nextBlock.indexOf('」', feedbackStart);
    if (feedbackEnd < 0) throw new Error(`Lesson feedback terminator missing from ${change.qid}`);
    const oldFeedbackCell = nextBlock.slice(feedbackStart, feedbackEnd);
    if (currentFeedback && (!oldFeedbackCell.includes(currentFeedback.zh) || !oldFeedbackCell.includes(currentFeedback.en))) {
      throw new Error(`Stale lesson feedback in ${change.qid}`);
    }
    const replacement = `${letter}「${nextOption.zh} / ${nextOption.en}」→「${nextFeedback.zh} / ${nextFeedback.en}」`;
    nextBlock = nextBlock.slice(0, start) + replacement + nextBlock.slice(feedbackEnd + 1);
    return nextBlock;
  }

  if (/^m\d\d-/.test(change.qid)) {
    const linePattern = new RegExp(`^\\| ${letter} \\| .* \\| .* \\|$`, 'm');
    const line = nextBlock.match(linePattern);
    if (!line || !line[0].includes(currentOption.zh) || !line[0].includes(currentOption.en)) {
      throw new Error(`Major option row missing or stale in ${change.qid}`);
    }
    if (currentFeedback && (!line[0].includes(currentFeedback.zh) || !line[0].includes(currentFeedback.en))) {
      throw new Error(`Stale major feedback in ${change.qid}`);
    }
    return nextBlock.replace(linePattern, `| ${letter} | ${nextOption.zh} / ${nextOption.en} | 这项不对 / Not correct. ${nextFeedback.zh} / ${nextFeedback.en} |`);
  }

  const wandCup = /^[wc]\d\d-/.test(change.qid);
  const optionPattern = new RegExp(`^- ${letter}${wandCup ? '．' : '\\.'}.*$`, 'm');
  const optionLine = nextBlock.match(optionPattern);
  if (!optionLine || !optionLine[0].includes(currentOption.zh) || !optionLine[0].includes(currentOption.en)) {
    throw new Error(`Minor option line missing or stale in ${change.qid}`);
  }
  nextBlock = nextBlock.replace(optionPattern, `- ${letter}${wandCup ? '．' : '.'}${wandCup ? '' : ' '}${nextOption.zh} / ${nextOption.en}`);
  const feedbackPattern = wandCup
    ? new RegExp(`^- ${letter} 不对：.*$`, 'm')
    : new RegExp(`^- 选择 ${letter} 的反馈：.*$`, 'm');
  const feedbackLine = nextBlock.match(feedbackPattern);
  if (!feedbackLine) throw new Error(`Minor incorrect-feedback line missing from ${change.qid}`);
  if (currentFeedback && (!feedbackLine[0].includes(currentFeedback.zh) || !feedbackLine[0].includes(currentFeedback.en))) {
    throw new Error(`Stale minor feedback in ${change.qid}`);
  }
  return nextBlock.replace(
    feedbackPattern,
    wandCup
      ? `- ${letter} 不对：${nextFeedback.zh} / ${letter} is incorrect: ${nextFeedback.en}`
      : `- 选择 ${letter} 的反馈：这题不对。${nextFeedback.zh} / Not quite. ${nextFeedback.en}`,
  );
}

let source = fs.readFileSync(masterPath, 'utf8');
const registryMarker = '<!-- learning-option-id-registry-end -->';
const q4FeedbackMarker = '<!-- learning-q4-feedback-overrides-end -->';
for (const change of mappings) {
  const q = questions.get(change.qid);
  if (!q) throw new Error(`Unknown question id: ${change.qid}`);
  const current = q.options.filter((option) => option.id === change.incorrectId);
  if (current.length !== 1) throw new Error(`Option id must match exactly once in ${change.qid}: ${change.incorrectId}`);
  if (current[0].id === q.correct) throw new Error(`Mapping attempts to replace correct option: ${change.qid}`);
  const nextOption = change.nextOption || change.currentOption;
  const originalState = JSON.stringify(current[0].text) === JSON.stringify(change.currentOption)
    && (!change.currentFeedback || JSON.stringify(current[0].feedback) === JSON.stringify(change.currentFeedback));
  const appliedState = JSON.stringify(current[0].text) === JSON.stringify(nextOption)
    && (!change.nextFeedback || JSON.stringify(current[0].feedback) === JSON.stringify(change.nextFeedback));
  if (!originalState && !appliedState) throw new Error(`Academy data is neither the reviewed before nor after state in ${change.qid}`);
  assertSafePair(nextOption, `replacement option in ${change.qid}`);
  if (change.nextFeedback) assertSafePair(change.nextFeedback, `replacement feedback in ${change.qid}`);
  if (!/^[ABC]$/.test(change.letter || '')) throw new Error(`Missing option letter in ${change.qid}`);
  const optionAtLetter = q.options[change.letter.charCodeAt(0) - 65];
  if (!optionAtLetter || optionAtLetter.id !== change.incorrectId) throw new Error(`Option letter/id mismatch in ${change.qid}`);
  if (!change.reviewed && change.nextFeedback) throw new Error(`Feedback replacement is not marked reviewed in ${change.qid}`);
  if (hardCueZh.test(nextOption.zh) || hardCueEn.test(nextOption.en)) {
    throw new Error(`Replacement still contains an answer-shaped absolute in ${change.qid}`);
  }

  if (change.qid.endsWith('-Q4')) {
    if (!change.nextFeedback) throw new Error(`Q4 repair requires reviewed feedback: ${change.qid}`);
    const sectionStart = source.indexOf('| 题目 ID | 选项 ID | 原中文反馈 |');
    const sectionEnd = source.indexOf(q4FeedbackMarker);
    if (sectionStart < 0 || sectionEnd < sectionStart) throw new Error('Whole-card feedback override section is missing.');
    const section = source.slice(sectionStart, sectionEnd);
    const existing = new RegExp(`^\\| ${change.qid} \\| ${change.incorrectId} \\| .* \\| .* \\| .* \\| .* \\|$`, 'm');
    const existingLine = section.match(existing);
    if (existingLine) {
      const cells = existingLine[0].split('|').map((cell) => cell.trim());
      const finalFeedback = { zh: cells[5], en: cells[6] };
      if (JSON.stringify(finalFeedback) === JSON.stringify(change.nextFeedback)) {
        // Idempotent reread after the latest reviewed wording was applied.
      } else if (JSON.stringify(finalFeedback) === JSON.stringify(change.currentFeedback)) {
        const replacement = `| ${change.qid} | ${change.incorrectId} | ${cells[3]} | ${cells[4]} | ${change.nextFeedback.zh} | ${change.nextFeedback.en} |`;
        source = source.replace(existingLine[0], replacement);
      } else {
        throw new Error(`Conflicting whole-card feedback override: ${change.qid}/${change.incorrectId}`);
      }
    } else {
      const row = `| ${change.qid} | ${change.incorrectId} | ${change.currentFeedback.zh} | ${change.currentFeedback.en} | ${change.nextFeedback.zh} | ${change.nextFeedback.en} |`;
      const markerIndex = source.indexOf(q4FeedbackMarker);
      if (markerIndex < 0) throw new Error('Whole-card feedback override marker is missing.');
      source = source.slice(0, markerIndex) + row + '\n' + source.slice(markerIndex);
    }
  } else if (!appliedState) {
    if (!change.nextFeedback) throw new Error(`Regular repair requires reviewed feedback: ${change.qid}`);
    const range = questionBlock(source, change.qid);
    const block = source.slice(range.start, range.end);
    const nextBlock = patchRegularBlock(block, change);
    source = source.slice(0, range.start) + nextBlock + source.slice(range.end);
  }

  if (nextOption.zh !== change.currentOption.zh) {
    const oldRegistryRow = `| ${change.qid} | ${change.letter} | ${change.incorrectId} | ${change.currentOption.zh} |`;
    const nextRegistryRow = `| ${change.qid} | ${change.letter} | ${change.incorrectId} | ${nextOption.zh} |`;
    if (source.includes(nextRegistryRow)) {
      // Idempotent verification after a successful apply/build cycle.
    } else if (source.includes(oldRegistryRow) && !appliedState) {
      source = source.replace(oldRegistryRow, nextRegistryRow);
    } else {
      throw new Error(`Stable option id registry row is stale or missing: ${change.qid}/${change.letter}`);
    }
  }
}

for (const change of mappings) {
  if (change.qid.endsWith('-Q4')) {
    const sectionStart = source.indexOf('| 题目 ID | 选项 ID | 原中文反馈 |');
    const sectionEnd = source.indexOf(q4FeedbackMarker);
    const section = source.slice(sectionStart, sectionEnd);
    const existing = new RegExp(`^\\| ${change.qid} \\| ${change.incorrectId} \\| .* \\| .* \\| .* \\| .* \\|$`, 'm');
    const line = section.match(existing);
    const cells = line && line[0].split('|').map((cell) => cell.trim());
    if (!cells || cells[5] !== change.nextFeedback.zh || cells[6] !== change.nextFeedback.en) {
      throw new Error(`Whole-card feedback override did not survive reread: ${change.qid}`);
    }
    continue;
  }
  const range = questionBlock(source, change.qid);
  const block = source.slice(range.start, range.end);
  const nextOption = change.nextOption || change.currentOption;
  if (!block.includes(nextOption.zh) || !block.includes(nextOption.en)) throw new Error(`Replacement option did not survive reread: ${change.qid}`);
  if (!block.includes(change.nextFeedback.zh) || !block.includes(change.nextFeedback.en)) throw new Error(`Replacement feedback did not survive reread: ${change.qid}`);
}

console.log(`${apply ? 'Applying' : 'Dry-run validated'} ${mappings.length} explicit bilingual distractor repairs.`);
if (apply) fs.writeFileSync(masterPath, source);
