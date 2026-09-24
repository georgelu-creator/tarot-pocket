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

  const VERSION = 'OR-1.3.0';
  const LANGUAGES = new Set(['zh', 'en']);
  const TOPICS = new Set(['general', 'love', 'career', 'study', 'life', 'self', 'choice']);
  const ROLE_CONTEXT = {state: 'state', tension: 'tension', advice: 'advice', trend: 'state', outcome: 'state'};
  const SAFE_ROLES = new Set(['state', 'tension', 'advice', 'past', 'trend', 'resource', 'unknown', 'outcome', 'choice', 'free']);
  const BUILTIN_EN = Object.freeze({'能不能／会不会': 'Yes or No'});

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
    return value => {
      const key = String(value);
      if (Object.hasOwn(dictionary, key)) return dictionary[key];
      if (Object.hasOwn(BUILTIN_EN, key)) return BUILTIN_EN[key];
      return key;
    };
  }

  function topicContext(card, topic, role) {
    const key = ROLE_CONTEXT[role];
    return key && card.contexts && card.contexts[topic] ? card.contexts[topic][key] || '' : '';
  }

  function cardName(item, language) {
    return language === 'en' ? item.card.en : item.card.name;
  }

  function orientationLabel(item, language) {
    if (language === 'en') return item.reversed ? 'reversed' : 'upright';
    return item.reversed ? '逆位' : '正位';
  }

  function naturalMeaning(value) {
    let result = String(value);
    if (!/\p{Script=Han}/u.test(result)) return result;
    const replacements = [
      ['辨认欲望、依赖或习惯如何限制选择，找回可行动的空间', '某种欲望、依赖或习惯正在缩小选择空间，需要先看清自己仍能改变什么'],
      ['关注互相倾听、交换与有回应的关系', '如果需要别人配合，先确认彼此有没有听见和回应；如果主要由你完成，就检查投入有没有得到有效反馈'],
      ['承认受限感，逐一检查仍可获得的信息与行动空间', '现在容易觉得处处受限，还需要逐一弄清哪些信息能获得、哪些选择还能尝试'],
      ['检查是否休息不足就急着回到任务，或暂停已变成无期限回避', '休息不够就急着回到任务，或暂停后一直没有重新开始的时间点'],
      ['重新检查被打破的假设与失效结构，面对已经显露的问题', '承认原来的计划或判断已经有一部分不成立，先处理最早暴露出来的具体问题'],
      ['真实限制与尚未检验的自我设限', '已经确认的限制与尚未核实就认定自己做不到的部分'],
      ['原有结构的脆弱部分', '原来安排里经不起变化的地方'],
      ['被打破的假设', '已经不成立的原先判断'],
      ['失效结构', '已经行不通的安排'],
      ['行动空间', '还能做的选择'],
      ['受限感', '觉得处处受限'],
      ['自我设限', '尚未核实就认定自己做不到'],
      ['结构失效', '原来的安排不再适用']
    ];
    for (const [from, to] of replacements) result = result.split(from).join(to);
    return result;
  }

  function cardMeaning(item, topic, tr) {
    const contextual = naturalMeaning(tr(topicContext(item.card, topic, item.position.role)));
    const orientation = naturalMeaning(tr(item.reversed ? item.card.reversed : item.card.upright));
    if (!contextual) return orientation;
    if (!item.reversed) return contextual;
    return `${withoutFinalPunctuation(contextual)}。${/\p{Script=Han}/u.test(contextual) ? '这张牌逆位时还要留意：' : 'Because this card is reversed, also watch for: '}${orientation}`;
  }

  function withoutFinalPunctuation(value) {
    return String(value).trim().replace(/[。.!！?？]+$/u, '');
  }

  function finishText(value) {
    const result = String(value).trim();
    if (!result || /[。.!！?？]$/u.test(result)) return result;
    return result + (/\p{Script=Han}/u.test(result) ? '。' : '.');
  }

  function itemClause(item, topic, language, tr) {
    const name = cardName(item, language);
    const label = tr(item.position.label);
    const meaning = withoutFinalPunctuation(cardMeaning(item, topic, tr));
    return language === 'en'
      ? `${name} (${orientationLabel(item, language)}) in “${label}” points to: ${meaning}`
      : `“${label}”的${name}${orientationLabel(item, language)}指出：${meaning}`;
  }

  // The offline answer never infers a result by searching prose for positive or
  // negative substrings. These small, explicit sets record only combinations
  // whose supplied meaning directly bears on the named proposition. Everything
  // else stays mixed. That makes each judgment reviewable and conservative.
  const PREDICATE_TENDENCIES = Object.freeze({
    action: Object.freeze({
      support: Object.freeze(['m01:u', 'm07:u', 'm08:u', 'm14:u', 'm17:u', 'm19:u', 'm20:u', 'w01:u', 'w03:u', 'w06:u', 'w08:u', 'c01:u', 'c02:u', 'c03:u', 'p01:u', 'p03:u', 'p08:u']),
      caution: Object.freeze(['m12:u', 'm15:u', 'm16:u', 'm18:u', 's04:u', 's08:u', 's09:u', 's10:u', 'c04:u', 'c05:u', 'c08:u', 'p05:u', 'p08:r', 'w08:r'])
    }),
    pass: Object.freeze({
      support: Object.freeze(['m19:u', 'm20:u', 'm21:u', 'w06:u']),
      caution: Object.freeze(['m16:u', 'm21:r', 's10:u', 'c05:u', 'p05:u'])
    }),
    offer: Object.freeze({
      support: Object.freeze(['m19:u', 'm20:u', 'm21:u', 'w06:u']),
      caution: Object.freeze(['m16:u', 'm21:r', 's10:u', 'c05:u', 'p05:u'])
    }),
    complete: Object.freeze({
      support: Object.freeze(['m19:u', 'm20:u', 'm21:u', 'w04:u', 'w06:u']),
      caution: Object.freeze(['m16:u', 'm21:r', 's10:u', 'w10:u'])
    }),
    progress: Object.freeze({
      support: Object.freeze(['m01:u', 'm07:u', 'm19:u', 'w03:u', 'w08:u', 'p08:u']),
      caution: Object.freeze(['m12:u', 'm21:r', 's04:u', 's10:u', 'c05:u', 'p08:r', 'w08:r'])
    }),
    contact: Object.freeze({
      support: Object.freeze(['m01:u', 'm14:u', 'm17:u', 'm19:u', 'w08:u', 'c02:u', 'c06:u']),
      caution: Object.freeze(['s04:u', 'c04:u', 'c05:u', 'c08:u', 'w08:r', 'c02:r'])
    }),
    reconcile: Object.freeze({
      support: Object.freeze(['m14:u', 'm17:u', 'm19:u', 'c02:u']),
      caution: Object.freeze(['m13:u', 'm16:u', 's03:u', 's10:u', 'c05:u', 'c08:u', 'c02:r'])
    }),
    affection: Object.freeze({
      support: Object.freeze(['m06:u', 'm17:u', 'm19:u', 'c01:u', 'c02:u', 'c06:u']),
      caution: Object.freeze(['m18:u', 's04:u', 'c04:u', 'c05:u', 'c08:u', 'c02:r'])
    }),
    relationship: Object.freeze({
      support: Object.freeze(['m14:u', 'm17:u', 'm19:u', 'c01:u', 'c02:u', 'c06:u']),
      caution: Object.freeze(['m13:u', 'm16:u', 's03:u', 's10:u', 'c05:u', 'c08:u', 'c02:r'])
    }),
    'continue-job': Object.freeze({
      support: Object.freeze(['m14:u', 'm19:u', 'm21:u', 'w03:u', 'p03:u', 'p08:u']),
      caution: Object.freeze(['m13:u', 'm16:u', 's10:u', 'c08:u', 'w10:u'])
    }),
    rejection: Object.freeze({
      support: Object.freeze(['m16:u', 's10:u', 'c05:u', 'p05:u']),
      caution: Object.freeze(['m19:u', 'm20:u', 'm21:u', 'w06:u'])
    }),
    failure: Object.freeze({
      support: Object.freeze(['m16:u', 's10:u', 'c05:u', 'p05:u']),
      caution: Object.freeze(['m19:u', 'm20:u', 'm21:u', 'w06:u'])
    }),
    'job-loss': Object.freeze({
      support: Object.freeze(['m13:u', 'm16:u', 's10:u', 'c08:u', 'p05:u']),
      caution: Object.freeze(['m14:u', 'm19:u', 'm21:u', 'c02:u', 'w06:u'])
    }),
    quit: Object.freeze({
      support: Object.freeze(['m13:u', 'm16:u', 's10:u', 'c08:u']),
      caution: Object.freeze(['m14:u', 'm19:u', 'c04:u'])
    }),
    breakup: Object.freeze({
      support: Object.freeze(['m13:u', 'm16:u', 's03:u', 's10:u', 'c08:u', 'c02:r']),
      caution: Object.freeze(['m14:u', 'm19:u', 'c02:u'])
    }),
    distance: Object.freeze({
      support: Object.freeze(['m09:u', 'm12:u', 'm13:u', 's04:u', 'c08:u']),
      caution: Object.freeze(['m01:u', 'm14:u', 'm19:u', 'c02:u', 'w08:u'])
    }),
    pause: Object.freeze({
      support: Object.freeze(['m09:u', 'm12:u', 's04:u']),
      caution: Object.freeze(['m01:u', 'm07:u', 'w08:u'])
    }),
    occurrence: Object.freeze({
      support: Object.freeze(['m19:u', 'm20:u', 'm21:u']),
      caution: Object.freeze(['m16:u', 'm21:r', 's10:u', 'c05:u'])
    })
  });

  function cardRuleKey(item) {
    return `${item.card.id}:${item.reversed ? 'r' : 'u'}`;
  }

  function predicateSignal(item, predicate) {
    const rules = PREDICATE_TENDENCIES[predicate.kind] || PREDICATE_TENDENCIES.occurrence;
    const key = cardRuleKey(item);
    const signal = rules.support.includes(key) ? 'support' : rules.caution.includes(key) ? 'caution' : 'mixed';
    if (!predicate.invert || signal === 'mixed') return signal;
    if (signal === 'support') return 'caution';
    if (signal === 'caution') return 'support';
    return 'mixed';
  }

  function focusClause(question) {
    const source = String(question || '').trim();
    const contrasted = source.split(/(?:而是|但(?:是)?|不过|其实|真正想问|主要想问|重点是|rather than|but what I (?:want|need) to know|my (?:real|main) question is)/i).map(value => value.trim()).filter(Boolean);
    const focus = contrasted.at(-1) || source;
    const clauses = focus.split(/[，,；;。.!！?？]+/).map(value => value.trim()).filter(Boolean);
    const decision = /(?:会不会|能不能|是否|能否|可不可以|有没有|有无|有希望|适不适合|值不值得|该不该|要不要|会有|能有|会在|能在|会怎样|会如何|怎么发展|怎样发展|如何发展|成不成|行不行|吗$)|\b(?:will|can|could|does|do|is|are|would|likely|chance|develop)\b/i;
    return [...clauses].reverse().find(value => decision.test(value)) || clauses.at(-1) || focus;
  }

  function asksAboutFuture(question, language) {
    return language === 'en'
      ? /\b(future|later|next|develop|where .* heading|will .* (?:last|be together|marry|reconcile|come back|contact|reach out)|come back|contact me|reach out|hear from|have a chance|any chance|when)\b/i.test(question)
      : /(?:未来|以后|接下来|后续|发展|走向|还有(?:可能|机会|戏)|回来|回头|重新出现|联系我|给我回复|见面|重逢|(?:复合|重新开始|重新在一起)[^，。？！]*(?:机会|可能)|还有[^，。？！]*(?:复合|重新开始|重新在一起)|(?:会|能)(?:不会|不能)?[^，。？！]*(?:在一起|复合|结婚|长久|联系|回来|见面|有结果|稳定下来|走下去|能成|成吗|选择我)|(?:暧昧|关系|我们)[^，。？！]*(?:有结果|能成|稳定下来)|(?:下个|这个|未来|近期|今年|明年)[^，。？！]*(?:月|季度|阶段|一年|会)|什么时候|多久)/.test(question);
  }

  function outcomeQuestion(question, language) {
    const focus = focusClause(question);
    return language === 'en'
      ? /\b(will|can|could|does|do|is|are|would|is there|are there|likely|chance|develop|developing)\b|\bhow\b[^.?!]{0,24}\b(?:develop|change|unfold)\b/i.test(focus)
      : /(?:会不会|能不能|是否|能否|可不可以|有没有|有无|适不适合|值不值得|该不该|要不要|会有|能有|会在|能在|会怎样|会如何|怎么发展|怎样发展|如何发展|走向怎样|吗[？?]?\s*$)/.test(focus);
  }

  function openDevelopmentQuestion(question, language) {
    const focus = focusClause(question);
    return language === 'en'
      ? /\bhow\b[^.?!]{0,30}\b(?:develop|change|unfold|progress)\b|\bwhere\b[^.?!]{0,30}\bheading\b/i.test(focus)
      : /(?:会怎样|会如何|怎么发展|怎样发展|如何发展|走向怎样|接下来怎样|后续怎样)/.test(focus);
  }

  function questionPredicate(question, language) {
    const focus = focusClause(question);
    const tests = language === 'en' ? [
      ['rejection', /\b(?:be|get) rejected|rejection|turned down|blocked|ignored\b/i, 'being rejected or getting no response'],
      ['failure', /\bfail(?:ure|ed)?|not pass|won't pass\b/i, 'failing'],
      ['job-loss', /\b(?:lose|lost) (?:my |the )?job|be laid off|laid off|made redundant\b/i, 'losing the job'],
      ['quit', /\bresign|quit (?:my |the )?job|leave (?:my |the )?job\b/i, 'leaving the job'],
      ['breakup', /\bbreak up|separate|end (?:the|this|our) relationship\b/i, 'the relationship ending'],
      ['pause', /\bpause|take a break|stop for now|rest first\b/i, 'pausing for now'],
      ['reconcile', /\breconcile|get back together|start again\b/i, 'getting back together'],
      ['contact', /\bcontact|hear back|reply|response|reconnect\b/i, 'contact resuming'],
      ['offer', /\b(?:get|receive|land) (?:the |an? )?(?:job )?offer|be hired\b/i, 'getting the offer'],
      ['pass', /\bpass(?:ing)? (?:the |this )?(?:exam|test|assessment)?\b/i, 'passing'],
      ['complete', /\bcomplete|finish|work out|go ahead\b/i, 'completing it'],
      ['progress', /\bprogress|move forward|advance|develop\b/i, 'moving forward'],
      ['distance', /\bkeep (?:my |some )?distance|stay away|step back\b/i, 'keeping distance'],
      ['action', /\bapply|submit|reach out|start|do it|suitable|worth\b/i, 'taking this action']
    ] : [
      ['rejection', /(?:不会被拒绝|不被拒绝|不会落选)/, '不被拒绝', true],
      ['failure', /(?:不是失败|不会失败)/, '不失败', true],
      ['quit', /(?:不辞职|不离职|继续留在(?:这份)?工作)/, '继续留在当前工作', true],
      ['breakup', /(?:不分手|不结束(?:这段)?关系|继续在一起)/, '继续维持这段关系', true],
      ['pause', /(?:不暂停|继续推进)/, '继续推进', true],
      ['reconcile', /(?:不复合|不会复合|不想复合)/, '不复合', true],
      ['complete', /(?:不能完成|不会完成|无法完成|完不成)/, '无法完成', true],
      ['progress', /(?:没进展|不能推进|无法推进)/, '无法推进', true],
      ['rejection', /(?:(?:被|遭)(?:拒绝|拒)|落选|(?:他|她|TA|ta|对方)[^，。？！]{0,8}(?:拒绝(?:我(?:的)?表白)?|拉黑我|不理我|不回复我)|不被录用|收不到(?:录用|\s*offer)|拿不到(?:录用|\s*offer))/i, '被拒绝、拉黑或得不到回应'],
      ['failure', /(?:失败|不通过|没通过|未通过|过不了|不会通过|不能通过|考不上|挂科|不及格|落榜)/, '考试失败或没有通过'],
      ['job-loss', /(?:失业|被裁员|被裁|公司裁掉我|丢掉(?:这份)?工作|失去(?:这份)?工作)/, '失去目前的工作'],
      ['quit', /(?:辞职|离职|离开这份工作|不再做这份工作)/, '辞职离开当前工作'],
      ['breakup', /(?:(?:我们|这段关系)[^，。？！]{0,10}(?:分手|分开|结束)|结束(?:我们|这段)?关系|(?:他|她|TA|ta|对方)[^，。？！]{0,8}离开我|我[^，。？！]{0,8}离开(?:他|她|TA|ta|对方)|不再在一起)/i, '这段关系结束'],
      ['pause', /(?:暂停|停一下|休息|暂缓|先不做|停止)/, '先暂停'],
      ['distance', /(?:保持距离|拉开距离|离远一点|先不联系|暂时不联系)/, '先保持距离'],
      ['reconcile', /(?:复合|和好|回到一起|重新在一起|重新开始)/, '重新在一起'],
      ['contact', /(?:(?:他|她|TA|ta|对方)[^，。？！]{0,8}(?:主动)?(?:联系|回复|回消息|回我(?:微信|消息)?|找我)|恢复联系|重新联系|收到回复|得到回复|有回应|回(?:我)?(?:微信|消息))/i, '对方主动联系或给出回应'],
      ['affection', /(?:(?:他|她|TA|ta|对方)[^，。？！]{0,8}(?:喜欢|爱|在意|有好感|有感觉)[^，。？！]{0,4}(?:我|吗)|(?:喜欢|爱|在意)我吗)/i, '对方对你有好感'],
      ['relationship', /(?:我们|这段关系)[^，。？！]{0,8}(?:还有戏|还能继续|有机会继续|能走下去)/, '这段关系还有继续发展的机会'],
      ['continue-job', /(?:(?:这份|目前|现在的)?工作[^，。？！]{0,12}(?:还能|能不能|是否能|可不可以|该不该|要不要|值不值得)继续|(?:我(?:该|应该|适合)|(?:我)?(?:该不该|要不要|是否应该|能不能|适不适合))[^，。？！]{0,6}继续(?:留在|做)?(?:这份|目前|现在的)?工作|(?:这份|目前|现在的)?工作[^，。？！]{0,8}值得留下|值不值得[^，。？！]{0,8}留在(?:这份|目前|现在的)?工作)/, '继续留在目前这份工作'],
      ['offer', /(?:拿到录用|收到录用|被录用|拿到\s*offer|收到\s*offer|获得录用)/i, '拿到这次录用或 offer'],
      ['pass', /(?:通过|过关|考上|及格)/i, '通过问题里所说的考试或审核'],
      ['complete', /(?:完成|办成|做成|成不成|能成|办下来|如期举行|顺利结束)/, '把这件事完成'],
      ['progress', /(?:推进|进展|向前|发展|改善|稳定练习|练习下去)/, '继续推进'],
      ['action', /(?:提交|申请|主动联系|开始|尝试|适合|值得|要不要|该不该|可不可以)/, '采取问题里说的行动']
    ];
    const found = [];
    const whole = String(question || '');
    const sources = [focus];
    if (focus === whole || !outcomeQuestion(focus, language)) sources.push(whole);
    for (const source of sources.filter((value, index, all) => all.indexOf(value) === index)) {
      for (const [kind, pattern, label, invert = false] of tests) {
        const match = source.match(pattern);
        if (match) found.push({kind, label, invert, index: match.index + match[0].length, length: match[0].length});
      }
      if (found.length) break;
    }
    found.sort((a, b) => b.index - a.index || Number(b.invert) - Number(a.invert) || b.length - a.length);
    if (found[0]) {
      found[0].decision = language === 'en'
        ? /\b(?:should|shall|is it better|is it worth|do i need to)\b/i.test(focus)
        : /(?:该不该|要不要|应不应该|适不适合|值不值得|(?:我|我们|这段关系|这份工作)[^，。？！]{0,4}(?:该|应该|适合|值得))/.test(focus);
      return found[0];
    }
    const genericNegative = language === 'en'
      ? /\b(?:will|would|can|could|is|are|does|do)\b[^.?!]{0,36}\b(?:not|never|no longer)\b/i.test(focus)
      : /(?:不会|不能|不是|不再|没有|没法|未能|无望)[^，。？！]{0,24}(?:吗|么|呢)?$/.test(focus);
    return {kind: 'occurrence', label: language === 'en' ? 'the event happening' : '所问结果', invert: genericNegative};
  }

  function propositionTendency(items, predicate) {
    const signals = items.map(item => predicateSignal(item, predicate));
    const hasSupport = signals.includes('support');
    const hasCaution = signals.includes('caution');
    if (hasSupport && !hasCaution) return 'leans-yes';
    if (hasCaution && !hasSupport) return 'leans-no';
    return 'conditional';
  }

  function tendencyLead(tendency, predicate, question, language, subject) {
    if (language === 'en') {
      if (predicate.kind === 'action') {
        if (tendency === 'leans-yes') return `For “${question}”, ${subject} supports taking the action you named now.`;
        if (tendency === 'leans-no') return `For “${question}”, ${subject} does not support taking that action now.`;
        return `For “${question}”, ${subject} is not enough to decide whether now is a suitable time to act.`;
      }
      if (tendency === 'leans-yes') return `For “${question}”, ${subject} supports ${predicate.label}.`;
      if (tendency === 'leans-no') return `For “${question}”, ${subject} does not currently support ${predicate.label}.`;
      return `For “${question}”, ${subject} does not establish whether ${predicate.label} will happen; the stated card condition matters.`;
    }
    if (!predicate.invert && (predicate.kind === 'rejection' || predicate.kind === 'failure')) {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}显示${predicate.label}的风险更高。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}暂时不支持${predicate.label}这一边。`;
      return `对“${question}”，${subject}不足以判断是否会${predicate.label}，还要看牌面指出的条件。`;
    }
    if (predicate.kind === 'job-loss') {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}显示失去目前工作的风险更高。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}暂时不支持会失去目前的工作。`;
      return `对“${question}”，${subject}还不足以判断是否会失去目前的工作；更可靠的是核对公司的正式通知和实际变化。`;
    }
    if (!predicate.invert && predicate.kind === 'breakup') {
      if (predicate.decision) {
        if (tendency === 'leans-yes') return `对“${question}”，${subject}更支持认真考虑结束这段关系。`;
        if (tendency === 'leans-no') return `对“${question}”，${subject}暂时不支持现在就结束这段关系。`;
        return `对“${question}”，${subject}还不足以替你决定是否结束这段关系。`;
      }
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更偏向这段关系有走向结束的风险。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}暂时不支持把分手当成既定方向。`;
      return `对“${question}”，${subject}还不足以判断这段关系会不会结束。`;
    }
    if (!predicate.invert && predicate.kind === 'quit') {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更支持认真考虑辞职离开当前工作。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}暂时不支持现在就辞职。`;
      return `对“${question}”，${subject}还不足以替你决定是否辞职。`;
    }
    if (predicate.kind === 'affection') {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更偏向有好感或愿意回应；这只能说明牌面呈现的互动倾向，不能证明对方没有说出口的真实想法。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}暂时看不出明确的好感或靠近倾向，也不能据此断言对方真实内心。`;
      return `对“${question}”，${subject}还不足以判断对方是否喜欢你；更可靠的是继续观察对方实际怎样联系和相处。`;
    }
    if (predicate.kind === 'relationship') {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更偏向这段关系还有继续发展的机会。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}目前不太支持这段关系继续发展。`;
      return `对“${question}”，${subject}还不足以判断这段关系能不能继续；需要结合牌面条件和实际相处核对。`;
    }
    if (predicate.kind === 'continue-job') {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更偏向目前的工作还能继续。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}提示目前这份工作继续下去会有明显阻碍。`;
      return `对“${question}”，${subject}还不足以判断这份工作能否继续；要看牌面指出的条件是否改善。`;
    }
    if (predicate.kind === 'offer') {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更偏向能拿到这次录用或 offer。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}目前不太支持很快拿到这次录用或 offer。`;
      return `对“${question}”，${subject}还不足以判断是否能拿到录用；要继续核对面试反馈和正式通知。`;
    }
    if (predicate.kind === 'distance') {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更支持先保持距离，给彼此留出观察和调整的空间。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}暂时看不出保持距离会改善现状。`;
      return `对“${question}”，${subject}还不足以判断保持距离是否更好；先明确边界和联系频率，再观察实际变化。`;
    }
    if (predicate.kind === 'contact') {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更偏向会有主动联系或回应。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}目前不太支持很快出现主动联系或回应。`;
      return `对“${question}”，${subject}还不足以判断对方会不会主动联系；牌面指出的条件仍需在实际互动中核对。`;
    }
    if (!predicate.invert && predicate.kind === 'reconcile') {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更偏向还有重新靠近或复合的机会。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}目前不太支持很快复合。`;
      return `对“${question}”，${subject}还不足以判断能否复合；关键要看牌面指出的相处条件是否改变。`;
    }
    if (predicate.kind === 'occurrence') {
      if (predicate.invert) {
        if (tendency === 'leans-yes') return `对“${question}”，${subject}更偏向问题里的否定情况成立。`;
        if (tendency === 'leans-no') return `对“${question}”，${subject}目前不支持问题里的否定情况成立。`;
        return `对“${question}”，${subject}还不足以判断问题里的否定情况会不会成立。`;
      }
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更偏向所问的结果会发生。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}目前不太支持所问的结果发生。`;
      return `对“${question}”，${subject}还不足以判断结果会不会发生；关键要看牌面指出的条件。`;
    }
    if (predicate.kind === 'action') {
      if (tendency === 'leans-yes') return `对“${question}”，${subject}更支持现在采取问题里说的行动。`;
      if (tendency === 'leans-no') return `对“${question}”，${subject}暂时不支持现在就采取这项行动。`;
      return `对“${question}”，${subject}还不足以判断现在是否适合采取这项行动。`;
    }
    if (tendency === 'leans-yes') return `对“${question}”，${subject}更支持“${predicate.label}”这一边。`;
    if (tendency === 'leans-no') return `对“${question}”，${subject}目前不支持“${predicate.label}”这一边。`;
    return `对“${question}”，${subject}还不足以判断“${predicate.label}”会不会发生；关键要看牌面指出的条件。`;
  }

  function resultLead(items, input, language, force, subject, tr) {
    if (!input.question || (!force && !outcomeQuestion(input.question, language))) return '';
    if (openDevelopmentQuestion(input.question, language)) {
      const direction = items.map(item => cardMeaning(item, input.topic, tr)).join(language === 'en' ? ' ' : '；');
      return language === 'en'
        ? `For “${input.question}”, ${subject || 'the trend or outcome position'} points to this direction: ${direction}`
        : `对“${input.question}”，${subject || '趋势／结果牌'}指向这样的发展：${direction}`;
    }
    const predicate = questionPredicate(input.question, language);
    const tendency = propositionTendency(items, predicate);
    return tendencyLead(tendency, predicate, input.question, language, subject || (language === 'en' ? 'the trend or outcome card in this spread' : '趋势／结果牌'));
  }

  function openThreeDirectAnswer(items, input, language, tr) {
    const question = String(input.question || '');
    const asksCause = language === 'en'
      ? /\b(?:why|cause|reason|blocking|holding .* back|stuck)\b/i.test(question)
      : /(?:为什么|为何|原因|卡在哪里|卡住|受阻|阻碍|不顺|推进不了|进展不下去)/.test(question);
    const asksAction = language === 'en'
      ? /\b(?:what (?:can|should|could) i do|how (?:can|should|could) i|next step|advice)\b/i.test(question)
      : /(?:我能做什么|我可以做什么|我该做什么|怎么办|怎样做|怎么做|如何做|下一步|建议)/.test(question);
    if (!asksCause && !asksAction) return '';

    const actionPredicate = {kind: 'action', invert: false};
    const blocker = items.find(item => predicateSignal(item, actionPredicate) === 'caution')
      || items.find(item => item.reversed)
      || items[0];
    const action = items.find(item => item !== blocker && predicateSignal(item, actionPredicate) === 'support')
      || items.find(item => item !== blocker)
      || blocker;
    const blockerText = withoutFinalPunctuation(cardMeaning(blocker, input.topic, tr));
    const actionText = withoutFinalPunctuation(cardMeaning(action, input.topic, tr));
    const quotedQuestion = withoutFinalPunctuation(question);

    if (language === 'en') {
      const parts = [];
      if (asksCause) parts.push(`The main point to check is: ${blockerText}`);
      if (asksAction) parts.push(`A useful first step is: ${actionText}`);
      return `For “${quotedQuestion}”, the three cards point to a practical answer. ${parts.join(' ')}.`;
    }
    const parts = [];
    if (asksCause) parts.push(`当前最值得核对的卡点是：${blockerText}`);
    if (asksAction) parts.push(`可以先做的是：${actionText}`);
    return `对“${quotedQuestion}”，这组牌给出的直接回答是：${parts.join('；')}。`;
  }

  function highRiskQuestion(question, language) {
    const raw = String(question || '');
    if (!raw) return null;
    const source = /(?:而是|但(?:是)?|不过|真正想问|主要想问|重点是|rather than|but what I (?:want|need) to know|my (?:real|main) question is)/i.test(raw) ? focusClause(raw) : raw;
    if (language === 'en') {
      // Immediate danger is always scanned in the full input. A contrast such
      // as “but my real question is…” must never hide the urgent first clause.
      if (/\b(?:suicidal|want to die|do not want to live|don't want to live|kill myself|hurt myself|harm myself)\b/i.test(raw)) return 'crisis';
      if (/\b(?:he|she|they|my partner|my spouse|someone)\b[^.?!]{0,30}\b(?:threatened to kill|threatens to kill|hit|beat|attacked|hurt)\b[^.?!]{0,30}\b(?:me|my child|the child)?\b/i.test(raw)) return 'danger';
      if (/\b(?:should i|can i|could i|may i|i want to|i plan to)\b[^.?!]{0,35}\b(?:kill|stab|shoot|hit|beat|hurt|harm|attack)\b[^.?!]{0,24}\b(?:him|her|them|someone|my child|the child|a child)\b/i.test(raw)) return 'harm';
      if (/\b(?:chest pain|trouble breathing|difficulty breathing|severe bleeding|fainted|unconscious|stroke symptoms)\b/i.test(raw)) return 'urgent-care';
      if (/\b(?:suicidal|want to die|do not want to live|don't want to live|kill myself|hurt myself|harm myself)\b/i.test(source)) return 'crisis';
      if (/\b(?:he|she|they|my partner|my spouse|someone)\b[^.?!]{0,30}\b(?:threatened to kill|threatens to kill|hit|beat|attacked|hurt)\b[^.?!]{0,30}\b(?:me|my child|the child)?\b/i.test(source)) return 'danger';
      if (/\b(?:should i|can i|could i|may i|i want to|i plan to)\b[^.?!]{0,35}\b(?:kill|stab|shoot|hit|beat|hurt|harm|attack)\b[^.?!]{0,24}\b(?:him|her|them|someone|my child|the child|a child)\b/i.test(source)) return 'harm';
      if (/\b(?:chest pain|trouble breathing|difficulty breathing|severe bleeding|fainted|unconscious|stroke symptoms)\b/i.test(source)) return 'urgent-care';
      if (/\b(?:should|can|could|do|will)\s+i\b[^.?!]{0,35}\b(?:have|get|undergo|skip|refuse)\b[^.?!]{0,24}\b(?:surgery|operation|chemotherapy|radiotherapy|treatment|hospitali[sz]ation)\b/i.test(source)) return 'treatment';
      if (/\b(?:should|can|could|may|do|will)\s+i\b[^.?!]{0,30}\b(stop|quit|reduce|change|skip|discontinue|taper)\b[^.?!]{0,30}\b(medication|medicine|meds?|antidepressant|prescription|dose)\b/i.test(source)) return 'medication';
      if (/\b(?:dose|dosage|insulin)\b[^.?!]{0,25}\b(?:double|increase|reduce|lower|change|skip|take less|inject less)\b|\b(?:double|increase|reduce|lower|change|skip)\b[^.?!]{0,25}\b(?:dose|dosage|insulin)\b/i.test(source)) return 'medication';
      if (/\b(?:do i have|could i have|am i diagnosed with|is this|am i)\b[^.?!]{0,30}\b(depression|cancer|malignant tumou?r|disease|pregnan(?:t|cy))\b/i.test(source)) return 'diagnosis';
      if (/\b(?:is|would|does|could)\b[^.?!]{0,40}\b(illegal|lawful|legal|unlawful|legal risk|legal liability)|\b(?:am i liable|would i be liable|is this a crime|will i go to jail)\b/i.test(source)) return 'legal';
      if (!/\b(?:do not|don't|won't|wouldn't|not planning to)\b[^.?!]{0,35}\b(?:invest|commit|risk)\b/i.test(source) && /\b(?:should|can|could|will)\s+i\b[^.?!]{0,35}\b(?:invest|commit|risk|put)\b[^.?!]{0,24}\b(?:all|entire|whole|life savings|money|funds|capital)\b|\ball[- ]in\b/i.test(source)) return 'finance';
      return null;
    }
    const crisisIntent = /(?:想自杀|想轻生|想自残|不想(?:继续)?活(?:了|下去)?|活不下去(?:了)?|不如死了算了|活着(?:没意思|没有意义|太累了[^。？！]{0,8}(?:想|要)(?:结束)?生命)|(?:想|要|准备|打算)结束(?:我的|自己(?:的)?)?生命|想一了百了|结束自己的生命|伤害自己|杀了自己|(?:想|准备|打算|要|今晚(?:就)?(?:想|准备|打算|要|去)?)[^。？！]{0,10}(?:自杀|轻生|自残|割腕|割伤自己|跳楼|跳下去|服药过量|吞药)|(?:站在|到了?)[^。？！]{0,8}(?:楼顶|天台)[^。？！]{0,16}(?:(?:准备|打算|要|想)?(?:跳下去|跳楼|结束这一切)|想一了百了))|(?:^|[我，。？！,\s])想死(?:了|下去)?(?:$|[，。？！?,\s])/;
    const dangerIntent = /(?:(?:他|她|TA|伴侣|对象|家人|老公|丈夫|男朋友|男友|女朋友|女友|别人|对方)[^。？！]{0,20}(?:(?:刚刚?|经常|一直|又)?(?:打|殴打|揍)(?:了|过)?(?:我|孩子|小孩)(?:了|一顿|几下|一巴掌|一拳)?(?=$|[，。？！,\s]|还|又|并|然后)|(?:刚)?把(?:我|孩子|小孩)掐得(?:喘不过气|呼吸困难)|掐(?:着|住)?(?:了)?(?:我|孩子|小孩)?(?:的)?(?:脖子|喘不过气)|(?:拿|持)(?:刀|枪)[^。？！,，]{0,8}(?:(?:指着|威胁)(?:我|孩子|小孩)|追(?:着|赶)?(?:我|孩子|小孩))|(?:要|想|准备|打算|威胁(?:我|孩子|小孩)?[^。？！]{0,8}(?:说)?(?:要|会)?)杀(?:了|死)?(?:我|孩子|小孩)|家暴(?:我|孩子|小孩)?)|(?:我|孩子|小孩)[^。？！]{0,12}(?:被(?:他|她|伴侣|对象|家人|老公|男朋友|男友)?(?:刚刚?|经常|一直|又)?(?:打|殴打|揍|掐)|被家暴|遭到殴打|受到死亡威胁|被掐脖子))/i;
    const harmIntent = /(?:该不该|要不要|能不能|是否|我该|我想|我要|准备|打算)[^。？！]{0,24}(?:(?:杀(?:了|死)?|弄死|撞死|捅|砍|开枪打|殴打|揍|伤害|报复伤害|攻击)[^。？！]{0,16}(?:他|她|他们|别人|对方|孩子|小孩)|打(?!(?:他们|他|她|别人|对方|孩子|小孩)(?:(?:的)?(?:(?:老师|班主任)(?:的)?)?(?:电话|微信|消息)|个电话|(?:的)?(?:预防针|疫苗)))(?:他们|他|她|别人|对方|孩子|小孩)(?:一顿)?)|(?:想|准备|打算)[^。？！]{0,16}(?:报复|伤害|杀死|弄死|撞死|殴打|揍)[^。？！]{0,16}(?:他|她|别人|对方|孩子|小孩)/;
    const urgentIntent = /(?:胸(?:口)?(?:突然)?(?:剧痛|疼痛|痛|闷)|呼吸困难|呼吸不上来|喘不上气|大出血|流了很多血|昏厥|失去意识|疑似中风|(?:刚|已经)?[^。？！]{0,6}(?:吃|服|吞)(?:了)?[^。？！]{0,8}(?:(?:很多|大量|过量|一把)|(?:\d+|[一二三四五六七八九十百两]+)(?:片|粒|瓶|把)?|一整瓶)[^。？！]{0,6}(?:安眠药|药片|药)|(?:一整瓶|很多|大量|过量|一把|(?:\d+|[一二三四五六七八九十百两]+)(?:片|粒|瓶|把)?)[^。？！]{0,4}(?:安眠药|药片|药)[^。？！]{0,8}(?:都)?(?:吃|服|吞)(?:了)?|(?:已经|刚)?(?:服药|用药|吃药|吞药)[^。？！]{0,4}(?:过量|超量)|(?:半边脸|嘴角?)(?:歪|下垂)[^。？！]{0,16}(?:说话不清|说不清话|口齿不清)|(?:半边脸|左脸|右脸)[^。？！]{0,12}(?:麻|麻木)[^。？！]{0,20}(?:左|右)(?:手|脚|胳膊|腿)[^。？！]{0,12}(?:没力气|无力|抬不起来)|(?:左|右)(?:手|脚|胳膊|腿)[^。？！]{0,12}(?:突然)?(?:没力气|无力|抬不起来)[^。？！]{0,16}(?:说话不清|说不清话|口齿不清))/;
    if (crisisIntent.test(raw)) return 'crisis';
    if (dangerIntent.test(raw)) return 'danger';
    if (harmIntent.test(raw)) return 'harm';
    if (urgentIntent.test(raw)) return 'urgent-care';
    if (crisisIntent.test(source)) return 'crisis';
    if (dangerIntent.test(source)) return 'danger';
    if (harmIntent.test(source)) return 'harm';
    if (urgentIntent.test(source)) return 'urgent-care';
    if (/(?:该不该|要不要|能不能|是否|我该|我能|我想|我要|准备|打算|可以不可以)[^，。？！]{0,24}(?:做|接受|不做|不接受|不去|拒绝|取消|推迟)?[^，。？！]{0,8}(?:手术|治疗|化疗|放疗|住院|给?(?:孩子|小孩)?打(?:预防针|疫苗)|打(?:孩子|小孩)的?(?:预防针|疫苗))/.test(source)) return 'treatment';
    if (/(?:能不能|能否|是否|可不可以|该不该|要不要|应不应该|我(?:现在|目前|此刻|接下来|这次|到底|究竟)?(?:能|可以|该|要|应该)|我是不是(?:能|可以|该|要|应该)|我(?:想|打算|准备|考虑))[^，。？！]{0,24}(?:停(?:掉|用)?[^，。？！]{0,12}(?:药|药物)|不再(?:吃|用|服)[^，。？！]{0,8}(?:药|药物)|减(?:药|量)|换(?:掉)?[^，。？！]{0,10}(?:药|药物)|改(?:掉)?[^，。？！]{0,10}(?:药|药物)|调整(?:药量|剂量)|少吃[^，。？！]{0,8}药)/.test(source)) return 'medication';
    if (/(?:这个|这种)?(?:药|药物)[^。？！]{0,24}(?:不舒服|副作用|难受)[^。？！]{0,24}(?:能不能|可不可以|可以|想|要不要|该不该)[^。？！]{0,8}(?:少吃|减量|停掉|停用|换掉)/.test(source)) return 'medication';
    if (/(?:剂量|药量|胰岛素)[^，。？！]{0,16}(?:加倍|增加|减少|少打|少吃|调整|改变|停用|不打)|(?:加倍|增加|减少|少打|少吃|调整|改变)[^，。？！]{0,16}(?:剂量|药量|胰岛素)/.test(source)) return 'medication';
    if (/(?:我想|我要|准备|打算|该不该|要不要|能不能)[^，。？！]{0,16}(?:把)?[^，。？！]{0,6}(?:药|药物)[^，。？！]{0,8}(?:停了|停掉|停用|减量|换掉|改掉)/.test(source)) return 'medication';
    if (/(?:是不是|是否|有没有|有无|可能是|会不会是|能否确诊为)[^，。？！]{0,24}(?:抑郁症|焦虑症|恶性肿瘤|癌症|糖尿病|疾病|怀孕)|(?:抑郁症|焦虑症|恶性肿瘤|癌症|糖尿病|怀孕)[^，。？！]{0,8}(?:吗|么)[？?]?|(?:是不是|是否|有没有|可能是|会不会是)[^，。？！]{0,10}(?:得了|患有|感染了)[^，。？！]{0,10}(?:病|癌|肿瘤)/.test(source)) return 'diagnosis';
    if (/(?:是否违法|违法吗|是否合法|合法吗|是否无效|构成犯罪吗|会不会坐牢|(?:要不要|该不该|是否应该)起诉|会不会判刑|有没有法律风险|有法律风险吗|会不会有法律风险|承担法律责任吗|会承担法律责任吗|是否承担法律责任)/.test(source)) return 'legal';
    if (!/(?:不打算|不准备|不考虑|不会|不要)[^，。？！]{0,18}(?:投入|投资|梭哈|满仓)/.test(source) && /(?:该不该|要不要|能不能|是否|我能|我该|我想|我要|准备)[^，。？！]{0,24}(?:(?:投入|投资|梭哈|满仓)[^，。？！]{0,18}(?:全部|所有|整个|毕生)[^，。？！]{0,10}(?:积蓄|存款|资产|家当|钱|资金|本金|养老钱|养老金|退休金)|(?:全部|所有|整个|毕生)[^，。？！]{0,10}(?:积蓄|存款|资产|家当|钱|资金|本金|养老钱|养老金|退休金)[^，。？！]{0,18}(?:投入|投资|投进|拿去|用来)[^，。？！]{0,8}(?:炒股|买币|炒币)?|(?:养老钱|养老金|退休金)[^，。？！]{0,8}(?:全部|都)[^，。？！]{0,8}(?:投|投入|投资|投进))|(?:借钱|贷款|抵押)[^，。？！]{0,24}(?:投资|炒股|买币|炒币)|(?:梭哈|满仓|高杠杆)/.test(source)) return 'finance';
    return null;
  }

  function highRiskInput(input, language) {
    for (const value of [input.question, input.optionA, input.optionB, input.optionC]) {
      const risk = highRiskQuestion(value, language);
      if (risk) return risk;
    }
    return null;
  }

  function highRiskReading(items, input, language, risk) {
    items = Array.isArray(items) ? items : [items];
    const en = language === 'en';
    const messages = en ? {
      crisis: ['Do not use this card to respond to thoughts of suicide or self-harm.', 'Contact local emergency services or a crisis service now, tell a trusted person nearby, and do not stay alone while there is immediate danger.'],
      danger: ['Do not use this card to decide whether to report violence or return to a dangerous place.', 'Move to a safer place first, then contact local emergency services or police, a trusted person, or a local domestic-violence support service.'],
      harm: ['No card can support harming another person.', 'If anyone may be in immediate danger, move away from weapons and the other person, and contact local emergency services or police and a trusted person now.'],
      'urgent-care': ['Do not use this card to decide whether urgent symptoms need emergency care.', 'Contact local emergency services or urgent medical care now, especially if symptoms are severe, sudden or worsening.'],
      treatment: ['Do not use this card to decide whether to have, refuse or delay medical treatment.', 'Discuss the actual diagnosis, options, benefits and risks with a qualified clinician before deciding.'],
      medication: ['Do not use this card to decide whether to stop or change medication.', 'Contact the clinician who prescribed it or a qualified pharmacist before changing the dose or schedule.'],
      diagnosis: ['A card cannot determine a diagnosis, pregnancy, or another health status.', 'Please arrange an assessment or test with a licensed medical professional and bring the relevant symptoms, history and results.'],
      legal: ['A card cannot determine whether a contract or act is lawful.', 'Have a qualified local lawyer or legal-aid service review the actual text and applicable law.'],
      finance: ['Do not use this card to decide whether to commit all of your savings.', 'Keep essential and emergency funds separate, calculate the loss you could bear, and obtain regulated financial advice before acting.']
    } : {
      crisis: ['不要根据这张牌回应自杀或伤害自己的念头。', '请立即联系当地急救或危机干预服务，并告诉身边可信任的人；眼下有危险时不要独处。'],
      danger: ['不要根据这张牌决定是否报警或回到可能受伤的地方。', '请先去安全地点，再联系当地急救或警方、身边可信任的人，或当地反家暴支持服务。'],
      harm: ['任何牌都不能支持伤害别人。', '如果有人可能马上受伤，请先远离武器和对方，立即联系当地急救或警方，并告诉身边可信任的人。'],
      'urgent-care': ['不要根据这张牌判断紧急症状是否需要急诊。', '请立即联系当地急救或急诊；症状突然、严重或正在加重时，不要等待牌面判断。'],
      treatment: ['不要根据这张牌决定是否做、拒绝或推迟医疗治疗。', '请让有资质的医生结合诊断、方案、收益和风险说明后再决定。'],
      medication: ['不要根据这张牌停药、减量或更改用药。', '请先联系开药医生或有资质的药师，核对药物、剂量和停药方式。'],
      diagnosis: ['不能用这张牌判断是否患病、怀孕或其他身体状况。', '请联系正规医疗机构或有资质的医生，按实际情况做检查和评估。'],
      legal: ['不能用这张牌判断合同或行为是否违法。', '请让当地有资质的律师或法律援助人员根据合同原文和适用法律核对。'],
      finance: ['不要根据这张牌决定投入全部积蓄。', '先把日常开支和应急资金留出来，算清最坏损失，再向持牌专业人士核对风险。']
    };
    const [boundary, next] = messages[risk];
    return {
      tendency: 'not-applicable',
      overview: boundary,
      sections: [section('safety-boundary', en ? 'What to do instead' : '现在更需要做什么', next, items)],
      safety: {risk, boundary, next}
    };
  }

  function positionInterpretation(item, topic, language, tr) {
    const name = cardName(item, language);
    const label = tr(item.position.label);
    const core = withoutFinalPunctuation(naturalMeaning(tr(item.card.core)));
    const orientationMeaning = naturalMeaning(tr(item.reversed ? item.card.reversed : item.card.upright));
    const contextual = naturalMeaning(tr(topicContext(item.card, topic, item.position.role)));
    const situatedMeaning = cardMeaning(item, topic, tr);
    const role = item.position.role;
    const reference = root.TAROT_CARD_REFERENCE?.byId?.[item.card.id]?.[item.reversed?'reversed':'upright'];
    if(language==='zh' && reference?.roles?.[role]) {
      const details=reference.contexts?.[topic];
      const context=Array.isArray(details)?details.join(' '):details;
      return reference.roles[role]+(context && topic!=='general' ? ' '+context : '');
    }
    if (language === 'en') {
      if (role === 'tension') return `${name} is ${item.reversed ? 'reversed' : 'upright'} in “${label}”. The main obstacle to check is: ${situatedMeaning}`;
      if (role === 'advice') return `${name} is ${item.reversed ? 'reversed' : 'upright'} in “${label}”. It suggests: ${situatedMeaning}`;
      if (role === 'past') return `${name} brings “${core}” into “${label}”. Compare this with what actually happened; the card does not establish an unknown past. ${orientationMeaning}`;
      if (role === 'trend' || role === 'outcome') return `${name} brings “${core}” into “${label}”. If the current pattern continues, ${situatedMeaning.charAt(0).toLowerCase() + situatedMeaning.slice(1)} This is a conditional direction, not a fixed outcome.`;
      if (role === 'unknown') return `${name} offers “${core}” as something to verify in “${label}”. It cannot establish another person's private thoughts or facts that have not been observed.`;
      if (role === 'resource') return `${name} makes “${core}” a possible resource in “${label}”. ${situatedMeaning}`;
      if (role === 'choice') return `${name} is ${item.reversed ? 'reversed' : 'upright'} for “${label}”. Under the same comparison goal: ${situatedMeaning}`;
      if (role === 'free') return `${name} is ${item.reversed ? 'reversed' : 'upright'} and contributes this meaning to the three-card group: ${situatedMeaning}`;
      return `${name} in “${label}” centers on “${core}”. ${situatedMeaning}`;
    }
    if (role === 'tension') return `${name}${item.reversed ? '逆位' : '正位'}落在“${label}”，主要需要检查的是：${situatedMeaning}`;
    if (role === 'advice') return `${name}${item.reversed ? '逆位' : '正位'}落在“${label}”，建议是：${situatedMeaning}`;
    if (role === 'past') return `${name}把“${core}”带进“${label}”。请只和已经发生的经历核对，不用牌面补造过去。${orientationMeaning}`;
    if (role === 'trend' || role === 'outcome') return `${name}把“${core}”带进“${label}”。若当前模式继续，${situatedMeaning}这是有条件的方向，不是确定结局。`;
    if (role === 'unknown') return `${name}在“${label}”提供了“${core}”这条待核对线索；它不能证明他人的内心或尚未观察到的事实。`;
    if (role === 'resource') return `${name}让“${core}”成为“${label}”里可以利用的支持或条件。${situatedMeaning}`;
    if (role === 'choice') return `${name}${item.reversed ? '逆位' : '正位'}对应“${label}”。按同一个目标比较时，它指出：${situatedMeaning}`;
    if (role === 'free') return `${name}${item.reversed ? '逆位' : '正位'}让这三张牌多了一层意思：${situatedMeaning}`;
    return `${name}落在“${label}”，核心是“${core}”。${situatedMeaning}`;
  }

  function choiceKey(position) {
    const id = position.id.toLowerCase();
    if (/^(a-|option-a$)/.test(id)) return 'A';
    if (/^(b-|option-b$)/.test(id)) return 'B';
    if (/^(c-|option-c$)/.test(id)) return 'C';
    return 'shared';
  }

  function section(id, title, textValue, items) {
    return {id, title, text: finishText(textValue), cardIds: items.map(item => item.card.id)};
  }

  function yesNoReading(item, input, language, tr, risk) {
    const en = language === 'en';
    const question = input.question;
    const name = cardName(item, language);
    const orientation = orientationLabel(item, language);
    const meaning = naturalMeaning(tr(item.reversed ? item.card.reversed : item.card.upright));
    const core = naturalMeaning(tr(item.card.core));
    const label = tr(item.position.label);
    if (risk) return highRiskReading(item, input, language, risk);
    if (!question) {
      const reference = root.TAROT_CARD_REFERENCE?.byId?.[item.card.id]?.[item.reversed?'reversed':'upright'];
      const tendency = reference?.yesNo ? (reference.yesNo==='yes'?'leans-yes':'leans-no') : propositionTendency([item], {kind:'action'});
      const label = tendency==='leans-yes' ? 'Yes' : tendency==='leans-no' ? 'No' : 'Not yet';
      const answer = en ? `${label} — ${meaning}` : `${label} · ${tendency==='leans-yes'?'偏向可以':tendency==='leans-no'?'偏向不宜':'暂缓，条件还没齐'}。${reference?.yesNoReason || meaning}`;
      return {tendency, overview: answer, sections: [section('basis', en ? 'Card message' : '牌面暗语', core, [item])]};
    }
    const predicate = questionPredicate(question, language);
    const tendency = propositionTendency([item], predicate);
    const answer = tendencyLead(tendency, predicate, question, language, en ? 'this outcome card' : '这张结果倾向牌');
    const reason = en
      ? `${name} is ${orientation} in “${label}”, with “${core}” as its core theme. Its specific message here is: ${meaning}`
      : `${name}${orientation}落在“${label}”，核心是“${withoutFinalPunctuation(core)}”。这张牌在这里的具体提醒是：${meaning}`;
    return {tendency, overview: answer, sections: [section('answer', en ? 'Why this card supports the answer' : '牌面依据', reason, [item])]};
  }

  function choiceReading(items, input, language, tr) {
    const en = language === 'en';
    const groups = new Map();
    for (const item of items) {
      const key = choiceKey(item.position);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    const optionLabels = {A: input.optionA, B: input.optionB, C: input.optionC};
    const optionGroups = [...groups].filter(([key]) => key !== 'shared');
    const sections = [];
    const hasNamedGoal = Boolean(input.question);
    const goalPredicate = hasNamedGoal ? questionPredicate(input.question, language) : null;
    const comparableKinds = new Set(['pass', 'offer', 'complete', 'progress', 'contact', 'reconcile', 'relationship', 'distance']);
    const canCompareGoal = Boolean(goalPredicate && comparableKinds.has(goalPredicate.kind) && !goalPredicate.invert);
    const shared = groups.get('shared') || [];
    if (shared.length) {
      sections.push(section('shared', en ? 'Shared starting point' : '共同起点', shared.map(item => itemClause(item, input.topic, language, tr)).join(en ? ' ' : '；'), shared));
    }
    const predicate = canCompareGoal ? goalPredicate : {kind: 'action', label: en ? 'this path moving forward' : '这条路径能够推进'};
    const analyses = optionGroups.map(([key, group]) => {
      const outcome = group.find(item => item.position.role === 'trend' || item.position.role === 'outcome') || (group.length === 1 ? group[0] : null);
      const pathSignals = group.map(item => predicateSignal(item, predicate));
      const hasSupport = pathSignals.includes('support'), hasCaution = pathSignals.includes('caution');
      const signal = hasSupport && !hasCaution ? 'support' : hasCaution && !hasSupport ? 'caution' : 'mixed';
      const label = `${en ? 'Option' : '选项'} ${key}${optionLabels[key] ? ` · ${optionLabels[key]}` : ''}`;
      const dimension = signal === 'support'
        ? (canCompareGoal ? (en ? 'Support under the shared goal' : '按共同目标看，较有支持的地方') : (en ? 'What currently supports this path' : '这条路径目前得到的支持'))
        : signal === 'caution'
          ? (canCompareGoal ? (en ? 'Obstacle under the shared goal' : '按共同目标看，需要先处理的阻碍') : (en ? 'What this path needs to resolve first' : '这条路径需要先处理的阻碍'))
          : (canCompareGoal ? (en ? 'Condition under the shared goal' : '按共同目标看，决定结果的条件') : (en ? 'What this path depends on' : '这条路径能否推进要看什么'));
      const details = group.map(item => itemClause(item, input.topic, language, tr)).join(en ? ' ' : '；');
      sections.push(section('option-' + key.toLowerCase(), label, `${dimension}${en ? ': ' : '：'}${details}`, group));
      return {key, label, group, signal, details, outcome};
    });
    const rank = {support: 1, mixed: 0, caution: -1};
    const sorted = analyses.slice().sort((a, b) => rank[b.signal] - rank[a.signal] || a.key.localeCompare(b.key));
    const best = sorted[0];
    const next = sorted[1];
    let overview;
    if (!analyses.length) {
      overview = en ? 'The supplied positions do not contain separate options to compare.' : '现有牌位没有可分别比较的选项。';
    } else if (!hasNamedGoal) {
      overview = en
        ? `No shared comparison goal was entered. The cards can describe the support and obstacles around ${analyses.map(entry => entry.label).join('/')} separately, but they cannot name one as the better real-world choice.`
        : `没有填写这次比较最在意的目标，因此这里只分别说明${analyses.map(entry => entry.label).join('、')}的支持与阻碍，不能宣布哪一个现实上更好。`;
    } else if (!canCompareGoal) {
      overview = en
        ? `The question is recorded, but these card meanings do not provide a reviewable common measure for ranking ${analyses.map(entry => entry.label).join('/')}. The reading therefore describes each path without naming a winner.`
        : `已经记录问题“${input.question}”，但现有牌义没有足够依据把${analyses.map(entry => entry.label).join('、')}按同一个可核对指标排出高低，因此这里只分别说明每条路径，不硬选一个答案。`;
    } else if (best && (!next || rank[best.signal] > rank[next.signal])) {
      const comparisonEvidence = best.outcome && ['trend', 'outcome'].includes(best.outcome.position.role)
        ? (en ? 'the outcome card in this spread' : '这次的结果牌')
        : (en ? 'the card assigned to that option' : '这个选项对应的牌');
      overview = en
        ? `Using the same measure for every option${input.question ? `—“${input.question}”` : ''}, ${comparisonEvidence} currently favors ${best.label} over the other paths. This is a relative preference; it still depends on the conditions named in that path.`
        : `把每个选项都放在${input.question ? `“${input.question}”` : '同一个现实目标'}下比较，${comparisonEvidence}更支持${best.label}。这是路径之间的相对倾向；是否成立，仍要看这条路径指出的条件能否满足。`;
    } else {
      overview = en
        ? `Using the same measure for every option${input.question ? `—“${input.question}”` : ''}, no path is clearly ahead. The useful distinction is the different support and obstacle shown for each option.`
        : `把每个选项都放在${input.question ? `“${input.question}”` : '同一个现实目标'}下比较，目前没有一条路径明显领先。真正可用的差别，是各自牌面指出的推进条件和主要阻碍。`;
    }
    const comparisonText = analyses.map(entry => {
      const signal = entry.signal === 'support'
        ? (en ? 'currently has more support' : '目前支持较多')
        : entry.signal === 'caution'
          ? (en ? 'has an obstacle to resolve first' : '需要先处理阻碍')
          : (en ? 'depends on the stated conditions' : '要看牌面条件能否满足');
      return `${entry.label}${en ? ' ' : '：'}${canCompareGoal ? signal : (entry.signal === 'support' ? (en ? 'shows some support for moving forward' : '有一些推进支持') : entry.signal === 'caution' ? (en ? 'shows an obstacle to address first' : '有需要先处理的阻碍') : (en ? 'depends on conditions that are still unclear' : '要看尚未明确的条件'))}`;
    }).join(en ? '; ' : '；');
    sections.push(section('comparison', canCompareGoal ? (en ? 'Putting the options side by side' : '把几个选项放在一起看') : (en ? 'What each option shows' : '每个选项分别显示什么'), comparisonText, items));
    return {overview, sections};
  }

  function fixedThreeReading(items, input, language, tr) {
    const en = language === 'en';
    const state = items.find(item => item.position.role === 'state') || items[0];
    const obstacle = items.find(item => item.position.role === 'tension') || items[1];
    const advice = items.find(item => item.position.role === 'advice') || items[2];
    const stateMeaning = withoutFinalPunctuation(cardMeaning(state, input.topic, tr));
    let obstacleMeaning = withoutFinalPunctuation(cardMeaning(obstacle, input.topic, tr));
    const adviceMeaning = withoutFinalPunctuation(cardMeaning(advice, input.topic, tr));
    if (en) {
      obstacleMeaning = obstacleMeaning.replace(/^Check whether\s+/i, '').replace(/, or whether\s+/i, ', or ');
      const scope = input.question && outcomeQuestion(input.question, language)
        ? 'This spread has no outcome position, so it cannot determine the result. It can show the current situation, obstacle and a possible response. '
        : '';
      const overview = input.question
        ? `${scope}For “${input.question}”, the current issue is: ${stateMeaning}. The main obstacle is: ${obstacleMeaning}. A useful response is: ${adviceMeaning}.`
        : `Without a specific question, the spread gives this general problem-solving sequence: ${stateMeaning}. The main obstacle is: ${obstacleMeaning}. A useful response is: ${adviceMeaning}.`;
      const evidence = items.map(item => `${tr(item.position.label)}: ${cardName(item, language)} (${orientationLabel(item, language)}), centered on “${withoutFinalPunctuation(naturalMeaning(tr(item.card.core)))}”`).join('. ');
      return {overview, sections: [section('evidence', 'Why these cards support the answer', evidence, items)]};
    }
    obstacleMeaning = obstacleMeaning.replace(/^检查是否/, '').replace(/，或是否/g, '，也可能是').replace(/^检查/, '需要弄清');
    const current = /^(?:现在|当前)/.test(stateMeaning) ? stateMeaning : `当前最值得先看的是：${stateMeaning}`;
    const scope = input.question && outcomeQuestion(input.question, language)
      ? '这个牌阵没有结果位，不能据此判断所问结果会不会发生；它能帮助你看现状、阻碍和下一步。'
      : '';
    const overview = input.question
      ? `${scope}对“${input.question}”，${current}。主要阻碍是${obstacleMeaning}。下一步可以${adviceMeaning}。`
      : `没有填写具体问题，因此这里只给一般的问题处理顺序：${current}。主要阻碍是${obstacleMeaning}。下一步可以${adviceMeaning}。`;
    const evidence = items.map(item => `“${tr(item.position.label)}”由${cardName(item, language)}${orientationLabel(item, language)}说明，核心是“${withoutFinalPunctuation(naturalMeaning(tr(item.card.core)))}”`).join('；');
    return {overview, sections: [section('evidence', '为什么这样判断', evidence, items)]};
  }

  function buildSections(branch, items, spread, language, tr, input, risk) {
    const en = language === 'en';
    if (risk) return highRiskReading(items, input, language, risk);
    if (branch === 'yes-no') {
      return yesNoReading(items[0], input, language, tr, risk);
    }
    if (branch === 'single') {
      const item = items[0];
      const core = withoutFinalPunctuation(naturalMeaning(tr(item.card.core)));
      const value = en
        ? `${cardName(item, language)} is ${orientationLabel(item, language)} in “${tr(item.position.label)}”, centered on “${core}”. Because this is an advice position, it supports the response below rather than proving an outcome.`
        : `${cardName(item, language)}${orientationLabel(item, language)}落在“${tr(item.position.label)}”，核心是“${core}”。这是建议位，所以它支持下方的做法，不用来证明结果。`;
      const overview = input.question
        ? (en ? `For “${input.question}”, this advice position centers on “${core}”. It can suggest how to respond, but it cannot establish whether an unknown event will happen.` : `对“${input.question}”，这个建议牌位先把重点放在“${core}”。它能说明怎样应对，不能据此断定未知事件一定会不会发生。`)
        : (en ? `No specific question was entered. This single-card prompt centers on “${core}”; the full card basis is below.` : `没有填写具体问题，因此这张单牌只给一般提示，重点是“${core}”；完整牌面依据见下方。`);
      return {overview, sections: [section('focus', en ? 'Why this is the focus' : '为什么给出这个提醒', value, items)]};
    }
    if (branch === 'choice') {
      return choiceReading(items, input, language, tr);
    }
    if (branch === 'relationship') {
      const unknown = items.filter(item => item.position.role === 'unknown');
      const trend = items.find(item => item.position.role === 'trend' || item.position.role === 'outcome');
      const hasFuturePosition = Boolean(trend);
      const interactionItems = trend ? items.filter(item => item !== trend) : items;
      const interaction = interactionItems.map(item => itemClause(item, input.topic, language, tr)).join(en ? ' ' : '；');
      const currentNames = items.filter(item => ['state', 'unknown'].includes(item.position.role)).map(item => `${cardName(item, language)}${en ? ` (${orientationLabel(item, language)})` : orientationLabel(item, language)}`).join(en ? ', ' : '、');
      let overview;
      if (input.question && asksAboutFuture(input.question, language) && !hasFuturePosition) {
        overview = en
          ? `For “${input.question}”, this spread has no future or outcome position, so it cannot predict whether or when the relationship will change. It can only examine the current interaction shown by ${currentNames}.`
          : `对“${input.question}”，这个牌阵没有未来位或结果位，不能据此预测关系会不会、何时发生变化。它只能用${currentNames}检查双方目前怎样相处。`;
      } else if (input.question && hasFuturePosition && asksAboutFuture(input.question, language)) {
        const lead = resultLead([trend], input, language, true, undefined, tr);
        overview = en
          ? `${lead} The current positions explain what leads there. The trend position is ${cardName(trend, language)} (${orientationLabel(trend, language)}), centered on “${withoutFinalPunctuation(naturalMeaning(tr(trend.card.core)))}”; its full evidence appears below.`
          : `${lead}当前几个位置说明这种方向怎样形成。“${tr(trend.position.label)}”由${cardName(trend, language)}${orientationLabel(trend, language)}给出，核心是“${withoutFinalPunctuation(naturalMeaning(tr(trend.card.core)))}”；完整牌面依据见下方。`;
      } else if (input.question) {
        overview = en
          ? `For “${input.question}”, the relationship is best understood through the current roles shown by ${currentNames}; the detailed links are below.`
          : `对“${input.question}”，目前先看${currentNames}怎样共同影响相处；各牌位之间的具体联系见下方依据。`;
      } else {
        overview = en
          ? `No separate question was entered. As a general relationship check, compare the current roles shown by ${currentNames}.`
          : `没有填写具体问题，因此这里只作关系现状的一般提示：先核对${currentNames}呈现的相处方式。`;
      }
      const sections = [section('interaction', en ? 'Current interaction' : '现在怎样相处', interaction, interactionItems)];
      if (trend) sections.push(section('direction', en ? 'Direction under current conditions' : '当前条件下的后续方向', itemClause(trend, input.topic, language, tr), [trend]));
      sections.push(section('verify', en ? 'What needs verification' : '需要核对的部分', unknown.length
          ? (en ? `For ${unknown.map(item => tr(item.position.label)).join(', ')}, treat the cards as prompts for observation or conversation, not access to another person's mind.` : `“${unknown.map(item => tr(item.position.label)).join('、')}”只能作为观察或沟通的线索，不能当成读取对方内心。`)
          : (en ? 'Keep claims about another person tied to observable words and actions.' : '涉及对方的判断，要回到可以观察的言行。'), unknown));
      return {overview, sections};
    }
    if (branch === 'celtic') {
      const groups = [[0, 2, 'situation'], [2, 6, 'background'], [6, 9, 'perspective'], [9, 10, 'direction']];
      const titles = en
        ? {situation: 'Situation and crossing force', background: 'Aim, foundation and movement', perspective: 'Your stance and the environment', direction: 'Overall direction'}
        : {situation: '现状与交叉力量', background: '目标、基础与变化', perspective: '自身与环境', direction: '综合方向'};
      const sections = groups.map(([start, end, id]) => {
        const group = items.slice(start, end);
        const value = group.map(item => itemClause(item, input.topic, language, tr)).join(en ? ' ' : '；');
        return section(id, titles[id], value, group);
      });
      const first = items[0], crossing = items[1], outcome = items.at(-1);
      const lead = resultLead([outcome], input, language, false, undefined, tr);
      const overview = input.question
        ? (en
          ? `${lead ? lead + ' ' : ''}The situation card is ${cardName(first, language)} (${orientationLabel(first, language)}), the crossing card is ${cardName(crossing, language)} (${orientationLabel(crossing, language)}), and the outcome card is ${cardName(outcome, language)} (${orientationLabel(outcome, language)}). The four groups below show how that direction is formed.`
          : `${lead}现状由${cardName(first, language)}${orientationLabel(first, language)}说明，主要阻碍是${cardName(crossing, language)}${orientationLabel(crossing, language)}，最后的结果趋势位是${cardName(outcome, language)}${orientationLabel(outcome, language)}。下方四组牌位说明这个方向怎样形成。`)
        : (en ? 'No specific question was entered, so the ten cards are connected through their named positions rather than used to invent an event.' : '没有填写具体问题，因此十张牌只按真实牌位串联成一般提示，不替你补造一件事件。');
      return {overview, sections};
    }
    if (branch === 'three-card') {
      const details = items.map(item => itemClause(item, input.topic, language, tr));
      if (spread.id === 'open-three') {
        const throughline = details.join(en ? ' ' : '；');
        const coreSummary = items.map(item => withoutFinalPunctuation(naturalMeaning(tr(item.card.core)))).join(en ? '; ' : '、');
        const lead = resultLead(items, input, language, false, en ? 'the three cards together' : '三张牌合起来', tr);
        const directAnswer = openThreeDirectAnswer(items, input, language, tr);
        const overview = input.question
          ? (directAnswer || (en ? `${lead ? lead + ' ' : `For “${input.question}”, `}the three cards offer these clues: ${coreSummary}.` : `${lead || `对“${input.question}”，`}三张牌分别提示：${coreSummary}。`))
          : (en ? `The three cards offer these clues: ${coreSummary}.` : `三张牌分别提示：${coreSummary}。`);
        return {overview, sections: [section('throughline', en ? 'What the three cards say together' : '这三张合起来在说什么', throughline, items)]};
      }
      if (items.some(item => item.position.role === 'state') && items.some(item => item.position.role === 'tension') && items.some(item => item.position.role === 'advice')) {
        return fixedThreeReading(items, input, language, tr);
      }
      const trend = items.find(item => item.position.role === 'trend' || item.position.role === 'outcome');
      const lead = trend ? resultLead([trend], input, language, asksAboutFuture(input.question, language), undefined, tr) : '';
      const directionItem = trend || items.find(item => item.position.role === 'advice') || items[0];
      const directionSummary = en
        ? `${cardName(directionItem, language)} (${orientationLabel(directionItem, language)}) in “${tr(directionItem.position.label)}”, centered on “${withoutFinalPunctuation(naturalMeaning(tr(directionItem.card.core)))}”`
        : `“${tr(directionItem.position.label)}”的${cardName(directionItem, language)}${orientationLabel(directionItem, language)}，核心是“${withoutFinalPunctuation(naturalMeaning(tr(directionItem.card.core)))}”`;
      const overview = input.question
        ? (en ? `${lead ? lead + ' ' : `For “${input.question}”, the main direction is summarized by ${directionSummary}. `}The other positions explain how that direction formed; the position evidence is set out below.` : `${lead || `对“${input.question}”，整组重点落在${directionSummary}。`}其他牌位说明这个方向怎样形成，具体牌面依据见下方。`)
        : (en ? `No specific question was entered. As a general three-card prompt, start with ${directionSummary}; the remaining details are below.` : `没有填写具体问题，因此这里只作三张牌的一般提示：先看${directionSummary}，其余牌位依据见下方。`);
      return {overview, sections: [section('throughline', en ? 'Three-position answer' : '三个牌位怎样连起来', details.join(en ? ' ' : '；'), items)]};
    }
    const details = items.map(item => itemClause(item, input.topic, language, tr));
    const trendItems = items.filter(item => item.position.role === 'trend' || item.position.role === 'outcome');
    const trendItem = trendItems[0];
    const lead = trendItems.length ? resultLead(trendItems, input, language, false, undefined, tr) : '';
    const mainItem = trendItem || items.find(item => item.position.role === 'advice') || items[0];
    const mainSummary = en
      ? `${cardName(mainItem, language)} (${orientationLabel(mainItem, language)}) in “${tr(mainItem.position.label)}”, centered on “${withoutFinalPunctuation(naturalMeaning(tr(mainItem.card.core)))}”`
      : `“${tr(mainItem.position.label)}”的${cardName(mainItem, language)}${orientationLabel(mainItem, language)}，核心是“${withoutFinalPunctuation(naturalMeaning(tr(mainItem.card.core)))}”`;
    const overview = input.question
      ? (en ? `${lead ? lead + ' ' : `For “${input.question}”, `}the main direction is summarized by ${mainSummary}; the other named positions explain its conditions below.` : `${lead || `对“${input.question}”，`}整组最需要先看的是${mainSummary}；其他牌位怎样支持或限制它，见下方依据。`)
      : (en ? `No specific question was entered. As a general spread prompt, start with ${mainSummary}; the remaining position evidence is below.` : `没有填写具体问题，因此这里只作一般提示：先看${mainSummary}，其余牌位依据见下方。`);
    return {overview, sections: [section('throughline', en ? 'Whole-spread answer' : '整组怎样回答', details.join(en ? ' ' : '；'), items)]};
  }

  function closing(items, topic, language, tr, spread, branch, question, safety) {
    const en = language === 'en';
    if (safety) return {
      title: en ? 'Use a real-world source for this decision' : '这件事需要现实依据',
      text: en ? 'Pause any action based on the card until the relevant qualified professional has reviewed the real facts.' : '先暂停任何只依据牌面作出的行动，等相关专业人员根据现实资料核对后再决定。',
      realityCheck: en ? 'Keep the card as a draw record, not as evidence for the decision.' : '这张牌只保留为抽牌记录，不作为这项决定的证据。'
    };
    const adviceItem = items.find(item => item.position.role === 'advice');
    if (adviceItem && branch === 'three-card' && spread.id !== 'open-three') return {
      title: en ? 'Use the advice carefully' : '使用建议时',
      text: en ? 'First check that the situation and obstacle match what has actually happened; then try the advice as one response rather than a guaranteed result.' : '先核对现状和阻碍是否符合已经发生的事；符合时，再把建议位当作一种可尝试的做法。',
      realityCheck: en ? 'The advice position does not establish the outcome.' : '建议位不能证明结果一定会发生。'
    };
    if (adviceItem) return {
      title: en ? 'A suggested response' : '可以怎样回应',
      text: cardMeaning(adviceItem, topic, tr),
      realityCheck: en ? 'This comes from the advice position; it is an action to consider, not proof of the outcome.' : '这句话来自建议位，是可考虑的做法，不是结果已经确定的证据。'
    };
    if (spread.id === 'open-three') {
      return {
        title: en ? 'How to check this in reality' : '怎样回到现实核对',
        text: en ? 'Write down what has actually happened and what is still unknown. Treat any card point without observable support as a question, not a conclusion.' : `回到${question ? `“${withoutFinalPunctuation(question)}”` : '现实情况'}，分别写下已经确认发生的事和仍待确认的事；找不到现实依据的部分，先只当问题，不当结论。`,
        realityCheck: en ? 'Use the three cards as one combined reading and keep missing facts marked as unknown.' : '三张合在一起使用，缺少的事实继续标成“待确认”。'
      };
    }
    if (branch === 'choice') return {
      title: en ? 'Before deciding' : '作决定前再核对',
      text: en ? 'Compare the real options over the same time range and against the same goal.' : '把现实选项放在同一时间范围、同一个目标下核对，不要给不同选项临时更换标准。',
      realityCheck: en ? 'The comparison is a supported tendency, not a guarantee that one option will work out.' : '这里给的是有牌义依据的比较倾向，不保证某个选项一定成功。'
    };
    if (spread.id === 'timeline') return {
      title: en ? 'How to check the timeline' : '接下来怎样核对',
      text: en ? 'Use the next actual notice, result or visible change to check this direction. Until that happens, keep it as a conditional trend.' : '用接下来实际出现的通知、结果或变化核对这条方向；事情发生前，仍把它当作有条件的趋势。',
      realityCheck: en ? 'The timeline trend remains conditional on the current pattern continuing.' : '时间流的趋势位仍以当前模式继续为前提。'
    };
    if (branch === 'yes-no') return {
      title: en ? 'Reality check' : '还要核对什么',
      text: question
        ? (en ? `Watch for an observable change connected with “${withoutFinalPunctuation(naturalMeaning(tr(items[0].card.core)))}”. If the event develops differently, update the judgment.` : `接下来观察现实中有没有出现与“${withoutFinalPunctuation(naturalMeaning(tr(items[0].card.core)))}”有关的可观察变化；如果事情的发展并不符合，就按现实进展更新判断。`)
        : (en ? 'Enter a concrete event if you want a yes/no tendency; this general prompt cannot stand in for one.' : '如果需要“能／不能”的倾向，要先说明具体事情；一般提示不能代替事件本身。'),
      realityCheck: en ? 'An outcome position describes a tendency under current conditions, not a certain future fact.' : '结果倾向位描述的是当前条件下的方向，不是已经确定的未来事实。'
    };
    const trendItem = branch === 'celtic'
      ? [...items].reverse().find(item => item.position.role === 'outcome') || items.at(-1)
      : items.find(item => item.position.role === 'trend' || item.position.role === 'outcome');
    const selected = trendItem || items[0];
    const selectedCore = withoutFinalPunctuation(cardMeaning(selected, topic, tr));
    return {
      title: trendItem ? (en ? 'What to keep checking' : '后续要核对什么') : (en ? 'Reality check' : '怎样核对'),
      text: trendItem
        ? (en ? `Watch for an observable change connected with “${selectedCore}”. If it does not appear, update the reading instead of holding onto the predicted direction.` : `接下来只核对现实中有没有出现与“${selectedCore}”有关的可观察变化；如果没有，就按实际进展更新判断，不要继续套用原来的方向。`)
        : cardMeaning(selected, topic, tr),
      realityCheck: trendItem
        ? (en ? 'A trend or outcome position remains conditional on the current pattern continuing.' : '趋势或结果牌位仍以当前模式继续为前提。')
        : (en ? 'Keep this interpretation tied to observable events; the cards do not supply missing facts.' : '请用可以观察到的事实核对这层解释，牌面不会补出缺失的经历。')
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
    const risk = highRiskInput(parsed, language);
    const cardResults = cards.map(item => ({
      positionId: item.position.id,
      positionLabel: tr(item.position.label),
      positionRole: item.position.role,
      cardId: item.card.id,
      cardName: cardName(item, language),
      orientation: item.reversed ? 'reversed' : 'upright',
      message: language==='zh' ? (root.TAROT_CARD_REFERENCE?.byId?.[item.card.id]?.[item.reversed?'reversed':'upright']?.message || naturalMeaning(tr(item.card.core))) : naturalMeaning(tr(item.card.core)),
      coreMeaning: naturalMeaning(tr(item.card.core)),
      orientationMeaning: naturalMeaning(tr(item.reversed ? item.card.reversed : item.card.upright)),
      reading: risk
        ? (en ? 'This card remains in the reading record, but it is not used to make this high-risk judgment or decision.' : '这张牌保留为本次抽牌记录，但不用于作出这项高风险判断或决定。')
        : positionInterpretation(item, topic, language, tr)
    }));
    const basisText = question || tr(spread.summary || spread.bestFor || spread.name);
    const heading = question
      ? (en ? 'Answer to this question' : '这组牌怎样回答')
      : (branch === 'yes-no' ? 'Yes/No' : (en ? 'Messages from your spread' : '牌阵里的提示'));
    const branchResult = buildSections(branch, cards, spread, language, tr, parsed, risk);
    const individual = !question && branch !== 'yes-no' && !risk;
    return {
      version: VERSION,
      source: 'offline',
      display: individual ? 'positions' : 'summary',
      isAI: false,
      language,
      topic,
      spread: {id: spread.id, name: tr(spread.name), branch, layout: spread.layout || 'custom'},
      basis: {kind: question ? 'question' : 'spread-purpose', question: question || null, text: basisText},
      overview: {title: heading, text: finishText(branchResult.overview), ...(branchResult.tendency ? {tendency: branchResult.tendency} : {})},
      positions: cardResults,
      sections: branchResult.sections,
      closing: closing(cards, topic, language, tr, spread, branch, question, branchResult.safety),
      ...(branchResult.safety ? {safety: branchResult.safety} : {}),
      boundaries: en
        ? ['This is a deterministic offline reference based on the saved card meanings, spread positions and orientations.', 'It is not an AI reading and does not establish hidden thoughts, diagnoses or certain future events.']
        : ['这是依据已有牌义、牌位与正逆位生成的本地参考。', '它不是 AI 解读，也不能证明他人内心、作出诊断或断定未来事件。']
    };
  }

  return {VERSION, interpret, validate, classifySpread: classify};
});
