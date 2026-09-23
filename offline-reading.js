/*
 * Deterministic whole-spread interpretation for the offline/default path.
 *
 * Browser API:
 *   TarotOfflineReading.interpret({
 *     spreadId: 'three',
 *     topic: 'general',
 *     question: '',
 *     language: 'zh',
 *     cards: [{id: 'm00', reversed: false, positionId: 'state'}, ...]
 *   })
 *
 * The function reads the existing TAROT_READING_DECK and TAROT_SPREAD_CONTENT
 * catalogs. It performs no I/O, stores nothing and never calls an AI service.
 */
(function (root, factory) {
  'use strict';
  const api = factory(root || {});
  if (root) root.TarotOfflineReading = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window === 'object' ? window : globalThis, function (root) {
  'use strict';

  const VERSION = 'OR-1.0.0';
  const LANGUAGES = new Set(['zh', 'en']);
  const TOPICS = new Set(['general', 'love', 'career', 'study', 'life', 'self', 'choice']);
  const ROLE_CONTEXT = {state: 'state', tension: 'tension', advice: 'advice'};
  const SAFE_ROLES = new Set(['state', 'tension', 'advice', 'past', 'trend', 'resource', 'unknown', 'outcome', 'choice', 'free']);

  function fail(message) {
    const error = new TypeError(message);
    error.code = 'INVALID_OFFLINE_READING';
    throw error;
  }

  function plainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== '[object Object]') return false;
    const prototype = Object.getPrototypeOf(value);
    // The second form accepts an ordinary object from another JavaScript realm
    // while still rejecting objects with an application-defined prototype.
    return prototype === null || Object.getPrototypeOf(prototype) === null;
  }

  function text(value, max, field, optional) {
    if (value == null && optional) return '';
    if (typeof value !== 'string') fail(field + ' must be a string');
    const result = value.trim();
    if ((!optional && !result) || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) fail('invalid ' + field);
    return result;
  }

  function catalogs(options) {
    const deck = options.deck || root.TAROT_READING_DECK;
    const spreadContent = options.spreadContent || root.TAROT_SPREAD_CONTENT;
    if (!deck || !Array.isArray(deck.cards) || !spreadContent || !Array.isArray(spreadContent.spreads)) {
      fail('card and spread catalogs are required');
    }
    return {
      cards: new Map(deck.cards.map(card => [card.id, card])),
      spreads: new Map(spreadContent.spreads.map(spread => [spread.id, spread]))
    };
  }

  function customSpread(input) {
    if (!Array.isArray(input.positions) || !input.positions.length || input.positions.length > 12) fail('unknown spreads require positions');
    const ids = new Set();
    const positions = input.positions.map((position, index) => {
      if (!plainObject(position)) fail('invalid position');
      const id = text(position.id || 'position-' + (index + 1), 60, 'position id');
      if (ids.has(id)) fail('duplicate position id');
      ids.add(id);
      const role = position.role || 'free';
      if (!SAFE_ROLES.has(role)) fail('invalid position role');
      return {id, label: text(position.label, 100, 'position label'), role};
    });
    return {
      id: text(input.spreadId, 80, 'spread id'),
      name: text(input.spreadName || input.spreadId, 120, 'spread name'),
      summary: text(input.spreadPurpose || (input.language === 'en'
        ? 'Connect the cards through the task named by each position.'
        : '按每个牌位的任务，把整组牌连起来看。'), 500, 'spread purpose'),
      layout: 'custom',
      positions
    };
  }

  function arrangeCards(inputCards, spread, cardCatalog) {
    if (!Array.isArray(inputCards) || inputCards.length !== spread.positions.length) fail('cards must match spread positions');
    const suppliedPositionIds = inputCards.filter(item => plainObject(item) && item.positionId != null).length;
    if (suppliedPositionIds !== 0 && suppliedPositionIds !== inputCards.length) fail('positionId must be supplied for every card or none');
    let cards = inputCards;
    if (suppliedPositionIds) {
      const byPosition = new Map();
      for (const item of inputCards) {
        const positionId = text(item.positionId, 60, 'card positionId');
        if (byPosition.has(positionId)) fail('duplicate card positionId');
        byPosition.set(positionId, item);
      }
      cards = spread.positions.map(position => byPosition.get(position.id));
      if (cards.some(item => !item) || byPosition.size !== spread.positions.length) fail('card positionIds must match spread');
    }
    const seen = new Set();
    return cards.map((item, index) => {
      if (!plainObject(item) || typeof item.reversed !== 'boolean') fail('invalid card');
      const id = text(item.id, 20, 'card id');
      if (seen.has(id)) fail('duplicate card id');
      seen.add(id);
      const card = cardCatalog.get(id);
      if (!card) fail('unknown card id');
      return {card, reversed: item.reversed, position: spread.positions[index], index};
    });
  }

  function classify(spread) {
    if (spread.id === 'yes-no') return 'yes-no';
    if (spread.id === 'celtic') return 'celtic';
    if (spread.positions.length === 1) return 'single';
    if (['choice', 'decision'].includes(spread.layout) || spread.positions.some(position => position.role === 'choice')) return 'choice';
    if (['cross', 'relation-cross', 'relation-row'].includes(spread.layout) || /^relationship/.test(spread.id)) return 'relationship';
    if (spread.positions.length === 3) return 'three-card';
    return 'general';
  }

  function translator(language, options) {
    if (language === 'zh') return value => String(value);
    const dictionary = options.dictionary || root.TAROT_EN || {};
    return value => Object.hasOwn(dictionary, String(value)) ? dictionary[String(value)] : String(value);
  }

  function topicContext(card, topic, role) {
    const key = ROLE_CONTEXT[role];
    return key && card.contexts && card.contexts[topic] ? card.contexts[topic][key] || '' : '';
  }

  function cardName(item, language) {
    return language === 'en' ? item.card.en : item.card.name;
  }

  function positionInterpretation(item, topic, language, tr) {
    const name = cardName(item, language);
    const label = tr(item.position.label);
    const core = tr(item.card.core);
    const orientationMeaning = tr(item.reversed ? item.card.reversed : item.card.upright);
    const contextual = tr(topicContext(item.card, topic, item.position.role));
    const role = item.position.role;
    if (language === 'en') {
      if (role === 'tension') return `${name} in “${label}” asks you to check this tension: ${contextual || orientationMeaning}`;
      if (role === 'advice') return `${name} in “${label}” suggests a grounded next step: ${contextual || orientationMeaning}`;
      if (role === 'past') return `${name} brings “${core}” into “${label}”. Compare this with what actually happened; the card does not establish an unknown past. ${orientationMeaning}`;
      if (role === 'trend' || role === 'outcome') return `${name} brings “${core}” into “${label}”. If the current pattern continues, ${orientationMeaning.charAt(0).toLowerCase() + orientationMeaning.slice(1)} This is a conditional direction, not a fixed outcome.`;
      if (role === 'unknown') return `${name} offers “${core}” as something to verify in “${label}”. It cannot establish another person's private thoughts or facts that have not been observed.`;
      if (role === 'resource') return `${name} makes “${core}” a possible resource in “${label}”. ${orientationMeaning}`;
      if (role === 'choice') return `${name} gives this option the theme “${core}”. ${orientationMeaning}`;
      if (role === 'free') return `${name} contributes the theme “${core}” to the group. ${orientationMeaning}`;
      return `${name} in “${label}” centers on “${core}”. ${contextual || orientationMeaning}`;
    }
    if (role === 'tension') return `${name}落在“${label}”，重点检查这项张力：${contextual || orientationMeaning}`;
    if (role === 'advice') return `${name}落在“${label}”，可以把下一步落在：${contextual || orientationMeaning}`;
    if (role === 'past') return `${name}把“${core}”带进“${label}”。请只和已经发生的经历核对，不用牌面补造过去。${orientationMeaning}`;
    if (role === 'trend' || role === 'outcome') return `${name}把“${core}”带进“${label}”。若当前模式继续，${orientationMeaning}这是有条件的方向，不是确定结局。`;
    if (role === 'unknown') return `${name}在“${label}”提供了“${core}”这条待核对线索；它不能证明他人的内心或尚未观察到的事实。`;
    if (role === 'resource') return `${name}让“${core}”成为“${label}”里可以调用的支点。${orientationMeaning}`;
    if (role === 'choice') return `${name}为这个选项带来“${core}”的主题。${orientationMeaning}`;
    if (role === 'free') return `${name}为整组牌带来“${core}”的主题。${orientationMeaning}`;
    return `${name}落在“${label}”，核心是“${core}”。${contextual || orientationMeaning}`;
  }

  function choiceKey(position) {
    const id = position.id.toLowerCase();
    if (/^(a-|option-a$)/.test(id)) return 'A';
    if (/^(b-|option-b$)/.test(id)) return 'B';
    if (/^(c-|option-c$)/.test(id)) return 'C';
    return 'shared';
  }

  function section(id, title, textValue, items) {
    return {id, title, text: textValue, cardIds: items.map(item => item.card.id)};
  }

  function buildSections(branch, items, spread, language, tr, input) {
    const en = language === 'en';
    if (branch === 'yes-no') {
      const item = items[0];
      const tendency = item.reversed ? 'pause-and-check' : 'leans-yes';
      const answer = item.reversed
        ? (en ? 'The current tendency is to pause before treating this as a yes.' : '目前更偏向先停一下，不急着当作“能”。')
        : (en ? 'The current tendency leans toward yes, provided the card’s condition is respected.' : '目前的倾向偏向“能”，前提是把这张牌指出的条件处理好。');
      const reason = en
        ? `${cardName(item, language)} is ${item.reversed ? 'reversed' : 'upright'}: ${tr(item.reversed ? item.card.reversed : item.card.upright)}`
        : `${cardName(item, language)}是${item.reversed ? '逆位' : '正位'}：${tr(item.reversed ? item.card.reversed : item.card.upright)}`;
      return {tendency, sections: [section('answer', en ? 'Tendency' : '倾向', answer, items), section('condition', en ? 'Reason and condition' : '依据与条件', reason, items)]};
    }
    if (branch === 'single') {
      const item = items[0];
      const value = en
        ? `Use “${tr(item.card.core)}” as the main lens. ${tr(item.reversed ? item.card.reversed : item.card.upright)}`
        : `这次先围绕“${tr(item.card.core)}”来看。${tr(item.reversed ? item.card.reversed : item.card.upright)}`;
      return {sections: [section('focus', en ? 'Main focus' : '核心提醒', value, items)]};
    }
    if (branch === 'choice') {
      const groups = new Map();
      for (const item of items) {
        const key = choiceKey(item.position);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      }
      const optionLabels = {A: input.optionA, B: input.optionB, C: input.optionC};
      const sections = [];
      for (const [key, group] of groups) {
        const themes = group.map(item => `${tr(item.position.label)}：${tr(item.card.core)}`).join(en ? '; ' : '；');
        const label = key === 'shared' ? (en ? 'Shared situation' : '共同现状') : `${en ? 'Option' : '选项'} ${key}${optionLabels[key] ? ` · ${optionLabels[key]}` : ''}`;
        sections.push(section('option-' + key.toLowerCase(), label, themes, group));
      }
      sections.push(section('comparison', en ? 'How to compare' : '怎样比较', en
        ? 'Compare the options against the same real-world goal. The cards describe different supports, costs and directions; they do not make the decision for you.'
        : '请用同一个现实目标比较各选项。牌面呈现的是不同支点、代价和方向，不替你做决定。', items));
      return {sections};
    }
    if (branch === 'relationship') {
      const unknown = items.filter(item => item.position.role === 'unknown');
      const observable = items.filter(item => item.position.role !== 'unknown');
      return {sections: [
        section('interaction', en ? 'Interaction pattern' : '互动主线', observable.map(item => `${tr(item.position.label)}: ${tr(item.card.core)}`).join(en ? '; ' : '；'), observable),
        section('verify', en ? 'What needs verification' : '需要核对的部分', unknown.length
          ? (en ? `For ${unknown.map(item => tr(item.position.label)).join(', ')}, treat the cards as prompts for observation or conversation, not access to another person's mind.` : `“${unknown.map(item => tr(item.position.label)).join('、')}”只能作为观察或沟通的线索，不能当成读取对方内心。`)
          : (en ? 'Keep claims about another person tied to observable words and actions.' : '涉及对方的判断，要回到可以观察的言行。'), unknown)
      ]};
    }
    if (branch === 'celtic') {
      const groups = [[0, 2, 'situation'], [2, 6, 'background'], [6, 9, 'perspective'], [9, 10, 'direction']];
      const titles = en
        ? {situation: 'Situation and crossing force', background: 'Aim, foundation and movement', perspective: 'Your stance and the environment', direction: 'Overall direction'}
        : {situation: '现状与交叉力量', background: '目标、基础与变化', perspective: '自身与环境', direction: '综合方向'};
      return {sections: groups.map(([start, end, id]) => {
        const group = items.slice(start, end);
        const value = group.map(item => `${tr(item.position.label)}：${tr(item.card.core)}`).join(en ? '; ' : '；');
        return section(id, titles[id], value, group);
      })};
    }
    if (branch === 'three-card') {
      const value = items.map(item => `${tr(item.position.label)}：${tr(item.card.core)}`).join(en ? '; ' : '；');
      const note = spread.id === 'open-three'
        ? (en ? ' Read the three cards as one group; no past-present-future sequence is implied.' : ' 三张牌合在一起读，不暗设过去、现在、未来。') : '';
      return {sections: [section('throughline', en ? 'Three-card throughline' : '三张牌主线', value + note, items)]};
    }
    const first = items[0], last = items[items.length - 1];
    const value = en
      ? `The spread begins with “${tr(first.card.core)}” and closes with “${tr(last.card.core)}”. Read each step through its named position.`
      : `整组牌从“${tr(first.card.core)}”展开，最后落到“${tr(last.card.core)}”。请按每个牌位的任务逐步核对。`;
    return {sections: [section('throughline', en ? 'Whole-spread throughline' : '整组主线', value, items)]};
  }

  function closing(items, topic, language, tr) {
    const en = language === 'en';
    const adviceItem = items.find(item => item.position.role === 'advice') || items.at(-1);
    const contextual = tr(topicContext(adviceItem.card, topic, 'advice'));
    const action = contextual || tr(adviceItem.reversed ? adviceItem.card.reversed : adviceItem.card.upright);
    const reversed = items.filter(item => item.reversed).length;
    const balance = reversed === 0
      ? (en ? 'All cards are upright; keep checking the practical conditions instead of treating momentum as a guarantee.' : '这组牌均为正位；仍要核对现实条件，不把顺势当成保证。')
      : reversed === items.length
        ? (en ? 'All cards are reversed; slow down and identify what is blocked, delayed or being overdone before deciding.' : '这组牌均为逆位；先放慢，分清哪里受阻、延迟或用力过头，再作判断。')
        : (en ? 'Upright and reversed cards appear together; use the upright cards as available movement and the reversed cards as points to check.' : '正逆位同时出现；可把正位看作可用方向，把逆位看作需要检查的卡点。');
    return {
      title: en ? 'A grounded next step' : '可以落地的一步',
      text: action,
      realityCheck: balance
    };
  }

  function validate(input, options) {
    if (!plainObject(input)) fail('input must be a plain object');
    options = plainObject(options) ? options : {};
    const catalog = catalogs(options);
    const spreadId = text(input.spreadId, 80, 'spread id');
    const spread = catalog.spreads.get(spreadId) || customSpread(input);
    const language = input.language == null ? 'zh' : text(input.language, 5, 'language');
    if (!LANGUAGES.has(language)) fail('unsupported language');
    const topic = input.topic == null ? 'general' : text(input.topic, 20, 'topic');
    if (!TOPICS.has(topic)) fail('unsupported topic');
    const question = text(input.question, 3000, 'question', true);
    const cards = arrangeCards(input.cards, spread, catalog.cards);
    const result = {spread, cards, language, topic, question};
    for (const field of ['optionA', 'optionB', 'optionC']) result[field] = text(input[field], 120, field, true);
    return result;
  }

  function interpret(input, options) {
    options = plainObject(options) ? options : {};
    const parsed = validate(input, options);
    const {spread, cards, language, topic, question} = parsed;
    const tr = translator(language, options);
    const en = language === 'en';
    const branch = classify(spread);
    const cardResults = cards.map(item => ({
      positionId: item.position.id,
      positionLabel: tr(item.position.label),
      positionRole: item.position.role,
      cardId: item.card.id,
      cardName: cardName(item, language),
      orientation: item.reversed ? 'reversed' : 'upright',
      coreMeaning: tr(item.card.core),
      orientationMeaning: tr(item.reversed ? item.card.reversed : item.card.upright),
      reading: positionInterpretation(item, topic, language, tr)
    }));
    const basisText = question || tr(spread.summary || spread.bestFor || spread.name);
    const heading = question
      ? (en ? 'Reading this question through the spread' : '围绕这次的问题来看')
      : (en ? 'Reading from the spread’s purpose' : '按牌阵本来的用途来看');
    const intro = question
      ? (en ? `This offline reading uses the question “${question}”, the named positions and each card’s orientation.` : `这份离线解读围绕“${question}”，结合牌位和每张牌的正逆位展开。`)
      : (en ? `No separate question was entered, so the cards are read for the spread’s stated purpose: ${basisText}` : `没有另外填写问题，因此这组牌按牌阵用途来读：${basisText}`);
    const branchResult = buildSections(branch, cards, spread, language, tr, parsed);
    return {
      version: VERSION,
      source: 'offline',
      isAI: false,
      language,
      topic,
      spread: {id: spread.id, name: tr(spread.name), branch, layout: spread.layout || 'custom'},
      basis: {kind: question ? 'question' : 'spread-purpose', question: question || null, text: basisText},
      overview: {title: heading, text: intro, ...(branchResult.tendency ? {tendency: branchResult.tendency} : {})},
      positions: cardResults,
      sections: branchResult.sections,
      closing: closing(cards, topic, language, tr),
      boundaries: en
        ? ['This is a deterministic offline reference based on the saved card meanings, spread positions and orientations.', 'It is not an AI reading and does not establish hidden thoughts, diagnoses or certain future events.']
        : ['这是依据已有牌义、牌位与正逆位生成的本地参考。', '它不是 AI 解读，也不能证明他人内心、作出诊断或断定未来事件。']
    };
  }

  return {VERSION, interpret, validate, classifySpread: classify};
});
