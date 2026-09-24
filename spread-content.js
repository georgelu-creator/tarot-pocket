// 原创牌阵与情境教学样本。牌位采用本课程约定，教学题判断是否贴合给定背景。
// 自由抽牌中的象征解读用于反思，不作为他人内心或现实结果的事实证明。
window.TAROT_SPREAD_CONTENT = {
  version: 1,
  topics: [
    {id: 'love', label: '感情', questions: [
      {id: 'love-connection', text: '我可以怎样改善我们最近的沟通？'},
      {id: 'love-boundary', text: '这段关系里，我需要看清哪些边界与需要？'},
      {id: 'love-choice', text: '主动开启一次谈话，或先留出空间，各自需要考虑什么？'}
    ]},
    {id: 'career', label: '事业', questions: [
      {id: 'career-progress', text: '工作迟迟没有推进，我可以从哪里着手？'},
      {id: 'career-choice', text: '继续当前方向，或尝试一个新方向，各自的优势与代价是什么？'},
      {id: 'career-resources', text: '我该怎样安排已有资源，推进下一步行动？'}
    ]},
    {id: 'study', label: '学业', questions: [
      {id: 'study-breakthrough', text: '学习投入不少却进步有限，我可以调整什么？'},
      {id: 'study-method', text: '我该怎样找到更适合当前难点的学习方法？'},
      {id: 'study-choice', text: '先补基础，或先做综合练习，各自需要考虑什么？'}
    ]}
  ],
  spreads: [
    {
      id: 'one', name: '单牌聚焦', summary: '把一个清楚的问题，落到一个值得关注的角度。',
      bestFor: '已有具体背景，想找到今天可以观察或尝试的一点。',
      avoid: '一张牌同时回答对方想法、原因、行动和未来。', layout: 'one', topics: ['love', 'career', 'study'],
      positions: [{id: 'focus', label: '关注与行动', question: '围绕这个问题，我现在最值得关注或尝试什么？', role: 'advice'}],
      readingTip: '先说牌的核心动作，再选一条与问题相关的反思方向，最后落到一个可观察的小行动。',
      compareTip: '单牌帮助聚焦；想区分问题卡在哪里和怎么做，改用现状—阻碍—建议。'
    },
    {
      id: 'three', name: '现状 · 阻碍 · 建议', summary: '看清当前状态，找出卡点，再考虑下一步。',
      bestFor: '沟通、项目或学习推进不顺，需要理解当下并找到行动方向。',
      avoid: '把三张牌自动当成过去、现在、未来。', layout: 'row', topics: ['love', 'career', 'study'],
      positions: [
        {id: 'state', label: '现状', question: '这个问题目前呈现怎样的状态或关注重点？', role: 'state'},
        {id: 'obstacle', label: '阻碍', question: '什么倾向可能正在限制推进，需要检查？', role: 'tension'},
        {id: 'advice', label: '建议', question: '结合现状与阻碍，我可以尝试怎样的回应？', role: 'advice'}
      ],
      readingTip: '现状用描述句，阻碍查找失衡或限制，建议写成可尝试的动作；再检查三句是否回应同一个问题。',
      compareTip: '三张的位置按功能分工；时间线三张则按先后分工。张数相同，读法不同。'
    },
    {
      id: 'timeline', name: '过去 · 现在 · 趋势', summary: '把已经发生、正在持续和可能延续的线索连起来。',
      bestFor: '已有一段经历，想回顾某种模式怎样发展。',
      avoid: '把趋势位当成必然发生的日期、事件或结局。', layout: 'row', topics: ['love', 'career', 'study'],
      positions: [
        {id: 'past', label: '过去影响', question: '哪些已经发生的经验或模式，可能仍影响这个问题？', role: 'past'},
        {id: 'present', label: '当前状态', question: '目前哪些倾向正在显现或持续？', role: 'state'},
        {id: 'trend', label: '延续趋势', question: '若当前模式继续，接下来值得观察怎样的倾向？', role: 'trend'}
      ],
      readingTip: '过去位要与实际经历核对，不能补造过去；趋势句保留“若继续这样”的条件，再想哪些行动可以改变它。',
      compareTip: '适合看变化过程；若最关心下一步怎么做，行动路径会给行动本身一个独立牌位。'
    },
    {
      id: 'choice', name: '二择一', summary: '用同一组问题，平等地比较两个明确选项。',
      bestFor: 'A、B 两条路径都能说清楚，想分别检查优势、代价与可能的发展。',
      avoid: '用一条路径的优势，去比较另一条路径的代价。', layout: 'choice', topics: ['love', 'career', 'study'],
      positions: [
        {id: 'a-strength', label: 'A · 优势', question: '选项 A 有哪些值得考虑的支持或有利条件？', role: 'resource'},
        {id: 'a-cost', label: 'A · 代价', question: '选项 A 可能需要承担什么投入、限制或取舍？', role: 'tension'},
        {id: 'a-trend', label: 'A · 趋势', question: '若选择 A 并按当前方式推进，值得观察什么发展倾向？', role: 'trend'},
        {id: 'b-strength', label: 'B · 优势', question: '选项 B 有哪些值得考虑的支持或有利条件？', role: 'resource'},
        {id: 'b-cost', label: 'B · 代价', question: '选项 B 可能需要承担什么投入、限制或取舍？', role: 'tension'},
        {id: 'b-trend', label: 'B · 趋势', question: '若选择 B 并按当前方式推进，值得观察什么发展倾向？', role: 'trend'}
      ],
      readingTip: '先分别读完 A、B，再横向比较同名牌位。现实条件与个人偏好仍需自己核对，牌面不替你投票。',
      compareTip: '它比较两条路径；若尚未形成两个选项，先用单牌聚焦或行动路径整理问题。'
    },
    {
      id: 'relationship', name: '关系觉察', summary: '分清自己的状态、可观察的互动和能够采取的行动。',
      bestFor: '已有互动，希望理解自己在关系中的反应与沟通方式。',
      avoid: '把另一方的位置当成读取其真实想法、忠诚或秘密的工具。', layout: 'cross', topics: ['love', 'career', 'study'],
      positions: [
        {id: 'self', label: '我的状态', question: '我正带着怎样的关注、需要或反应进入这段互动？', role: 'state'},
        {id: 'observable', label: '可观察的互动', question: '对方已经表达的言行中，有哪些模式值得核对？', role: 'unknown'},
        {id: 'tension', label: '互动张力', question: '双方已知的需要或做法在哪里可能不一致？', role: 'tension'},
        {id: 'resource', label: '连接资源', question: '哪些已存在的互动基础或支持可以继续使用？', role: 'resource'},
        {id: 'action', label: '我的下一步', question: '在我能掌控的范围内，可以尝试怎样表达、倾听或设立边界？', role: 'advice'}
      ],
      readingTip: '先把“我的反应”和“已观察到的对方言行”分开，再看张力。若对方的表现不清楚，把相应解读保留为待沟通的问题。',
      compareTip: '这五位围绕互动分工；换成事业或学业时，可用于同事、合作伙伴或学习搭档，仍不推定他人内心。'
    },
    {
      id: 'action', name: '行动路径', summary: '从当前处境与可用资源，推导下一步可试的动作。',
      bestFor: '已经有方向，想把想法转成一次可执行的尝试。',
      avoid: '只讨论抽象结果，跳过已有资源和具体限制。', layout: 'grid', topics: ['love', 'career', 'study'],
      positions: [
        {id: 'state', label: '起点', question: '我现在从怎样的处境或行动状态出发？', role: 'state'},
        {id: 'resource', label: '可用资源', question: '哪些现有能力、支持或现实条件可以使用？', role: 'resource'},
        {id: 'friction', label: '关键阻力', question: '下一步最需要处理的阻力或约束是什么？', role: 'tension'},
        {id: 'step', label: '最小行动', question: '利用已有资源并考虑阻力，我可以先尝试哪一步？', role: 'advice'}
      ],
      readingTip: '将第四张的建议限制在第二张的可用条件里，并检查它是否回应第三张的阻力。先做小尝试，再用实际反馈调整。',
      compareTip: '比三张现状—阻碍—建议多出独立资源位，适合“想做，但还没看清手上有什么”的问题。'
    },
    {
      id: 'study', name: '学习突破', summary: '分清当前表现、卡点、学习支点和下一轮练习。',
      bestFor: '投入了时间，却不知道为什么没有明显进步。',
      avoid: '用牌面推算考试分数，或替代实际作业与错题分析。', layout: 'grid', topics: ['study'],
      positions: [
        {id: 'state', label: '学习现状', question: '目前的投入方式与学习表现，有什么值得关注的模式？', role: 'state'},
        {id: 'gap', label: '卡点', question: '什么习惯、理解缺口或现实约束可能限制进步？', role: 'tension'},
        {id: 'support', label: '学习支点', question: '哪些已有基础、支持或恢复条件值得使用？', role: 'resource'},
        {id: 'practice', label: '下一轮练习', question: '针对当前卡点，可以怎样练习并检查是否有改善？', role: 'advice'}
      ],
      readingTip: '先把牌义变成一个可检查的学习假设，再用错题、作品或回忆表现核对；建议要包含一次具体练习和一次反馈。',
      compareTip: '行动路径面向一般目标；学习突破把每个位置进一步限定在投入、理解与反馈之中。'
    },
    {
      id: 'celtic', name: '凯尔特十字', summary: '用十个位置拆开复杂背景、内外条件与发展倾向。',
      bestFor: '问题具体但背景复杂，愿意逐位核对已有事实与不同层次。',
      avoid: '把十张牌当作十个必然事件，或混用其他版本的编号。', layout: 'celtic', topics: ['love', 'career', 'study'],
      positions: [
        {id: 'state', label: '1 · 现状', question: '当前影响这个问题的主要状态或氛围是什么？', role: 'state'},
        {id: 'crossing', label: '2 · 交叉阻力', question: '什么力量与当前状态交织，形成限制或张力？', role: 'tension'},
        {id: 'aim', label: '3 · 目标', question: '我正在追求怎样的目标或理想状态？', role: 'state'},
        {id: 'foundation', label: '4 · 基础', question: '哪些已经形成的背景或模式构成当前基础？', role: 'past'},
        {id: 'past', label: '5 · 近期过去', question: '哪些刚发生或正在淡出的影响仍值得回顾？', role: 'past'},
        {id: 'near-trend', label: '6 · 近期趋势', question: '若当前条件持续，近期可能显现怎样的倾向？', role: 'trend'},
        {id: 'self', label: '7 · 我的态度', question: '我现在以怎样的态度或行动方式回应处境？', role: 'state'},
        {id: 'environment', label: '8 · 外部环境', question: '周围可核对的条件与支持，怎样影响这个问题？', role: 'unknown'},
        {id: 'hopes-fears', label: '9 · 期待与担忧', question: '我的期待或担忧，可能怎样影响理解与选择？', role: 'state'},
        {id: 'overall-trend', label: '10 · 综合趋势', question: '结合其余九张及当前条件，整体上有什么值得继续观察的走向？', role: 'trend'}
      ],
      readingTip: '本课程采用以上一种约定：十张牌，不另设指示牌。先读 1—2 的核心，再看 3—6 的背景与时间，最后连接 7—10。不同教材的位置可能不同，以抽牌前的说明为准。',
      compareTip: '它提供更多观察角度，未必比三张更适合所有问题。第 9 位是期待与担忧，不能当成第 10 位的现实结局。'
    }
  ],
  units: [
    {
      id: 'spread-basics', title: '先学会选牌阵', subtitle: '张数相同，问题不同；先记每个位置在问什么', cardIds: ['w01', 'p04', 'p08'],
      steps: [
        {
          id: 'spread-basics-map', kind: 'intro', dimension: '牌阵结构', title: '先选问题，再选牌阵', contextLabel: '牌阵基础',
          prompt: '把牌阵记成一组分工清楚的问题。',
          body: '牌位改变的是“这张牌要回答什么”，不只是它摆在哪里。',
          points: ['一个关注点：单牌聚焦；找卡点与行动：现状—阻碍—建议。', '看变化：过去—现在—趋势；比较两条路径：二择一。', '看互动：关系觉察；盘点资源再行动：行动路径；查学习卡点：学习突破。', '复杂问题：凯尔特十字。先确认十个位置的约定，再开始。'],
          hint: '先把你想知道的东西说清楚，再给它安排位置。',
          feedback: '牌阵没有按张数排名。位置越多，越需要清楚区分每个问题和依据。'
        },
        {
          id: 'spread-basics-arrange', kind: 'arrange', dimension: '牌阵结构', title: '给三个问题安排位置',
          prompt: '本轮要按“目前怎样 → 什么卡住 → 可以怎么做”解读。依次点选三张牌下面的位置名称。',
          options: [
            {id: 'advice', text: '建议', why: '第三个问题寻找可尝试的回应，因此是建议。'},
            {id: 'state', text: '现状', why: '第一个问题描述当前状态，因此是现状。'},
            {id: 'obstacle', text: '阻碍', why: '第二个问题检查限制，因此是阻碍。'}
          ], correctOrder: ['state', 'obstacle', 'advice'],
          hint: '先描述，再找卡点，最后提出动作。',
          feedback: '本课程这组三张按功能分工：现状、阻碍、建议。换成时间线时，仍然三张，但每个位置的问题会变化。'
        },
        {
          id: 'spread-basics-select', kind: 'choice', dimension: '牌阵选型', title: '这次最需要哪种分工',
          prompt: '你已经知道项目过去的经过。现在想同时检查“为什么卡住”和“接下来怎么做”，没有两个待选方案。哪阵最直接回应这两个需要？',
          options: [
            {id: 'timeline', text: '过去—现在—趋势：按时间整理发展。', why: '可以看过程，但本题已经有过去信息，且需要独立的阻碍位和建议位。'},
            {id: 'three', text: '现状—阻碍—建议：检查卡点与回应。', why: '阻碍位直接问什么限制推进，建议位直接问下一步，贴合题目的两个明确需要。'},
            {id: 'one', text: '单牌聚焦：找一个值得关注的角度。', why: '有助聚焦，但一张牌没有把卡点与行动分别安排位置，本题要求同时区分两者。'},
            {id: 'choice', text: '二择一：比较两条路径的利弊与趋势。', why: '题目还没有两个清楚的选项，无法按同一组位置比较 A 与 B。'}
          ], correct: 'three',
          hint: '把题目中的两个需要，与牌阵里的位置逐项对应。',
          feedback: '其他牌阵并非永远不能用；本题判的是哪一个最直接满足已说明的需要。'
        },
        {
          id: 'spread-basics-choice', kind: 'reason', dimension: '牌位应用', title: '二择一要怎样公平比较', cardIds: ['p04', 'p08'], cardPositions: ['A · 优势', 'B · 代价'],
          prompt: 'A 是保留当前工作，B 是转向需补技能的新方向。星币四在 A 优势位，星币八在 B 代价位。哪句同时尊重两个位置？',
          options: [
            {id: 'positions', text: 'A 可检查现有资源的保障；B 要考虑持续练习的投入。', why: '分别把守住资源放入优势，把技能打磨放入代价，回应了两个不同的问题。'},
            {id: 'both-good', text: 'A 有资源保障；B 有熟练技能，所以两者都只看收益。', why: '星币八在代价位，需检查练习投入；此句跳过 B 的代价，也假设技能已经熟练。'},
            {id: 'both-bad', text: 'A 缺乏改变；B 投入过大，所以两者都只看限制。', why: '把 A 优势位改成阻碍，还在没有时间信息时判定 B 的投入过大。'},
            {id: 'vote', text: 'A 守住不动；B 持续努力，所以 B 更值得选择。', why: '把不同维度直接比较成优劣，尚未看 A 的代价、B 的优势和个人条件。'}
          ], correct: 'positions',
          evidenceOptions: [
            {id: 'roles', text: '两张牌的动作，加上优势与代价两种位置问题。', why: '固定资源与重复制作提供方向，位置限定是在寻找支持还是考虑投入。'},
            {id: 'numbers', text: '四代表少、八代表多，因此 B 的收益更高。', why: '牌号不等于现实收益数量，也没有对应本题的位置分工。'},
            {id: 'suit', text: '两张都是星币，因此两个位置都应解释为收入。', why: '同花色提供现实资源的角度，却不能抹掉优势与代价的区别。'}
          ], evidenceCorrect: 'roles',
          hint: '先问“这个位置要找什么”，再问“这张牌提供什么线索”。',
          feedback: '比较前要读全每条路径，再横向比优势对优势、代价对代价。不能让一张牌直接替你选职业。'
        },
        {
          id: 'spread-basics-celtic', kind: 'choice', dimension: '牌阵结构', title: '十字阵里，期待不等于结果', cardIds: ['p04'], position: '9 · 期待与担忧',
          prompt: '按本课程凯尔特十字约定，第 9 位是期待与担忧。背景：你担心项目变化后失去已有保障。星币四在这里，哪句最贴合位置？',
          options: [
            {id: 'fear', text: '你对守住已有保障的需要，可能正在影响判断。', why: '它聚焦自己的期待与担忧，并与已经说明的担心相互对应。'},
            {id: 'future', text: '项目接下来会一直保有当前资源与保障。', why: '把内在担忧当成现实趋势，且进一步说成确定结果，均超出第 9 位。'},
            {id: 'environment', text: '外部环境已经替项目锁定所有资源条件。', why: '这是关于外部条件的断言，既不属于此位置，也没有事实依据。'},
            {id: 'instruction', text: '为了推进项目，现在应该冻结所有资源流动。', why: '这是直接行动指令，跳过位置所问的内在期待，而且“所有资源”过于绝对。'}
          ], correct: 'fear',
          hint: '第 9 位检查内心如何看问题；第 10 位才综合讨论条件下的趋势。',
          feedback: '本课程用十张且不另设指示牌。不同资料可能编号不同；学会记位置问题，比只记“第九张”的编号更可靠。'
        },
        {
          id: 'spread-basics-recall', kind: 'recall', dimension: '牌阵结构', title: '不看名称，回忆怎么选择',
          prompt: '在心里回答：找卡点与行动用什么分工？有 A、B 两条路径怎样比较？凯尔特十字第 9 位为什么不是结果？',
          points: ['找卡点与行动：现状、阻碍、建议各自回答一个问题。', '二择一：先完整读每条路径，再比较同名位置，不能优势对代价。', '本课程第 9 位问期待与担忧；内心期待不等于现实结局。'],
          hint: '记住位置在问什么，不必背整段说明。',
          feedback: '你记住的应是一组提问方式。换了图案和背景，只要位置问题清楚，就有办法重新组织解读。'
        }
      ]
    },
    {
      id: 'love-context', title: '同一张牌，放进感情问题', subtitle: '守住边界与控制互动，需要用背景和牌位分清', cardIds: ['p04'],
      steps: [
        {
          id: 'love-context-intro', kind: 'intro', dimension: '情境迁移', title: '感情问题，也要先看动作', contextLabel: '感情 · 关系觉察',
          prompt: '星币四不需要变成另一张牌，才可以讨论关系。',
          body: '核心仍是“抓住、守住、寻求可控”。感情背景让我们进一步问：守住的是时间、边界、投入，还是对互动的控制？',
          points: ['我的状态：描述我现在怎样回应关系。', '互动张力：检查双方已知需要在哪里冲突。', '连接资源：寻找确实有助于互动的现有基础。', '我的下一步：把线索转成我可以尝试的表达或行动。'],
          hint: '保留牌的核心动作，再让问题和位置收窄解释。',
          feedback: '关系觉察还有“可观察的互动”位。它要求核对言行，不把一张牌当作对方内心的事实。'
        },
        {
          id: 'love-context-state', kind: 'choice', dimension: '牌位应用', title: '先描述，别抢答建议', position: '我的状态', contextLabel: '感情 · 关系觉察',
          prompt: '你发现自己每次聊天都等对方先发消息，怕先表达会失去掌控。星币四在“我的状态”位，哪句最贴近？',
          options: [
            {id: 'state', text: '你可能在保留表达，借此维持互动中的可控感。', why: '描述的是自己的当前反应，符合等对方先开口的已知背景与此位置。'},
            {id: 'advice', text: '你可以先表达一项需要，同时保留自己的回应空间。', why: '这是可讨论的行动建议，但题目此时要求描述状态。'},
            {id: 'other', text: '对方可能在保留表达，借此维持互动中的可控感。', why: '把同样的解释换到了对方身上；背景给的是你的做法，位置也问你的状态。'},
            {id: 'past', text: '之前一段失衡互动，已经让你不再信任任何表达。', why: '补出了未提供的过去经历，还把当前反应扩大成对所有表达的不信任。'}
          ], correct: 'state',
          hint: '主语是谁，时间是什么，位置是在描述还是提建议？',
          feedback: '“保留表达以求可控”是这一案例中的具体化；不是星币四在感情题里永远等于不主动。'
        },
        {
          id: 'love-context-tension', kind: 'reason', dimension: '画面依据', title: '什么让“守住”变成张力', position: '互动张力', contextLabel: '感情 · 关系觉察',
          prompt: '双方已约定各自可以独立安排周末，但你仍要求每项活动先得到自己同意，冲突因此增加。星币四在“互动张力”位，哪项最贴合？',
          options: [
            {id: 'control', text: '对安排的控制超出了已约定的边界，可能限制互动空间。', why: '既有独立安排的约定，与额外要求逐项同意形成明确冲突，位置也在检查张力。'},
            {id: 'protect', text: '对共同时间的保护正在起作用，可以继续要求逐项同意。', why: '忽略已有约定与冲突增加的背景，把阻力解释成正在奏效的资源。'},
            {id: 'loss', text: '对关系的投入已经减少，双方正在失去互动兴趣。', why: '背景只说明控制安排与冲突，没有提供投入减少或双方失去兴趣的证据。'},
            {id: 'leave', text: '对旧相处方式的不满，已经促使你离开当前关系。', why: '“已离开”与背景中的持续要求和冲突不同，也更接近离开情境的另一个动作。'}
          ], correct: 'control',
          evidenceOptions: [
            {id: 'context', text: '抱紧与踩住的动作，加上张力位和违反已有约定的背景。', why: '画面提供控制的方向，位置与具体约定进一步说明为什么此处构成限制。'},
            {id: 'amount', text: '牌上只有四枚星币，说明双方能给的爱已经不足。', why: '图案数量不能量化爱，也没有解释本题的安排冲突。'},
            {id: 'alone', text: '人物独自坐着，说明对方正准备结束关系。', why: '独坐不能证明另一人的打算，尤其不能补出未提供的结束计划。'}
          ], evidenceCorrect: 'context',
          hint: '这里“控制是否过度”已有现实线索：双方先前约定了什么？',
          feedback: '同一个守住动作，是否成为阻碍，要看程度、位置与背景；不能只见星币四就判定一方控制欲强。'
        },
        {
          id: 'love-context-resource', kind: 'choice', dimension: '牌位应用', title: '换成建议，边界也可以有价值', position: '我的下一步', contextLabel: '感情 · 关系觉察',
          prompt: '换一个背景：你为了随时回复消息，连续取消已经约好的独处时间，并因此疲惫。星币四在“我的下一步”位。哪项最贴合这一背景？',
          options: [
            {id: 'boundary', text: '说明自己需要保留的时间，商量可回应消息的时段。', why: '把守住资源转为保护自己的时间，并通过沟通落实，回应了过度让出的背景。'},
            {id: 'control', text: '说明对方必须保留的时间，要求其按自己的节奏回复。', why: '把需要保护的自身资源，改成控制对方时间；没有回应你取消独处的具体问题。'},
            {id: 'endurance', text: '继续让出已有时间，等疲惫消失后再考虑如何沟通。', why: '延续正在造成疲惫的模式，也没有使用守住资源的建议方向。'},
            {id: 'withdraw', text: '先暂停所有联系，以彻底避免自己再次让出时间。', why: '把设定边界扩大成完全中断互动，超过题目已知需要，缺少尝试与商量的空间。'}
          ], correct: 'boundary',
          hint: '这个案例缺少的是对自己时间的保护，而不是对他人的额外控制。',
          feedback: '记住对照：阻碍位可能提示抓得过紧；建议位配合资源耗尽的背景，可以提示建立清楚边界。'
        },
        {
          id: 'love-context-link', kind: 'choice', dimension: '多牌关系', title: '把自己的反应和互动连起来', cardIds: ['p04', 'c04', 'c14'], cardPositions: ['我的状态', '可观察的互动', '我的下一步'], contextLabel: '感情 · 关系觉察节选',
          prompt: '已知你怕失去掌控而保留表达；对方最近对邀约明确表示“需要休息”，没有说明其他原因。依次是星币四、圣杯四、圣杯国王。哪条路径最贴合？',
          options: [
            {id: 'path', text: '看见自己的抓紧，核对对方暂不投入的表现，再平稳表达需要并倾听。', why: '分别回应自己的状态、可观察表现和下一步，保留了对方原因尚不清楚的边界。'},
            {id: 'mind', text: '看见自己的抓紧，确认对方已经失去感情，再用冷静表现挽回对方。', why: '从需要休息跳到已失去感情，越过了可观察位置与已知言行。'},
            {id: 'same', text: '把双方都视为不愿投入，用更严格的联系安排来恢复稳定。', why: '把不同位置合成同一个定性，还让建议延续未被证明有效的控制。'},
            {id: 'wait', text: '把暂不回应视为沟通已完成，继续保留表达并等待对方改变。', why: '明确说需要休息不等于你的需要已被表达；也没有回应圣杯国王的稳稳承接与表达。'}
          ], correct: 'path',
          hint: '每一段都要能对应自己的牌位，不能靠第三张替第二张补出秘密原因。',
          feedback: '关系解读可以形成行动方向，但“对方真正怎么想”仍要通过对方的表达了解。'
        },
        {
          id: 'love-context-recall', kind: 'recall', dimension: '情境迁移', title: '一张牌，回忆三种说法', contextLabel: '感情 · 换位回忆',
          prompt: '只看星币四，分别想一句：描述自己状态、说明过度控制的张力、建议保护自己时间。每句带上对应背景。',
          points: ['怕先表达失去掌控 + 我的状态：保留表达来维持可控感。', '已有独立安排约定 + 互动张力：额外要求可能抓得过紧。', '持续让出独处时间 + 我的下一步：表达并保留自己的时间边界。'],
          hint: '核心不变：守住。改变的是守住什么、是否过度、位置在问什么。',
          feedback: '不必背原话。能说清背景怎样改变解释，比记“星币四在爱情里是什么意思”更有用。'
        }
      ]
    },
    {
      id: 'career-context', title: '同一张牌，放进事业问题', subtitle: '资源保障、流程阻力与行动建议，要分开判断', cardIds: ['p04'],
      steps: [
        {
          id: 'career-context-intro', kind: 'intro', dimension: '情境迁移', title: '事业问题不只等于收入', contextLabel: '事业 · 行动路径',
          prompt: '用起点、资源、阻力、行动四个问题组织解读。',
          body: '星币四的“守住”，在工作中可以涉及预算、权限、时间、工作方式或已有成果。具体对象需要题目提供。',
          points: ['资源位：先找能够使用的保障与条件。', '阻力位：检查什么固定做法限制了推进。', '行动位：结合资源边界，提出可以尝试的动作。', '把“收入一定增加”留在现实验证之中，不能从花色直接得出。'],
          hint: '资源是一类关注对象，不只指钱。',
          feedback: '同一元素在不同领域有不同具体对象，但这些对象必须与已经说明的问题相关。'
        },
        {
          id: 'career-context-resource', kind: 'choice', dimension: '牌位应用', title: '在资源位，先找可用保障', position: '可用资源', contextLabel: '事业 · 行动路径',
          prompt: '你要做一个小试点，已划出不会影响日常运作的专项预算，并明确谁可使用。星币四在“可用资源”位，哪句最贴合？',
          options: [
            {id: 'resource', text: '清楚保留并界定的预算，为试点提供可控的资源边界。', why: '背景已经说明保障与使用权限，资源位可以把守住解为可靠的可用基础。'},
            {id: 'block', text: '预算被保留下来，说明控制已经阻止试点开始。', why: '没有说明预算不可用；题目反而给出已明确权限，不能把资源位自动判成阻碍。'},
            {id: 'profit', text: '预算被保留下来，说明试点结束后能获得同等利润。', why: '保有预算与未来利润并非同一事实，牌面没有提供利润结果。'},
            {id: 'advice', text: '应当重新划出专项预算，再去明确谁能使用。', why: '这是重复已经完成的准备工作，也把资源说明换成了行动建议。'}
          ], correct: 'resource',
          hint: '题目没有说资源不能动用，先尊重“可用资源”这个位置。',
          feedback: '不能把“守住”永久标记成坏事。此处可控边界是现实中已经存在的支持。'
        },
        {
          id: 'career-context-friction', kind: 'reason', dimension: '画面依据', title: '换一个背景，守住也会拖慢', position: '关键阻力', contextLabel: '事业 · 行动路径',
          prompt: '另一个团队已允许小额试验，但负责人仍要求每一笔已授权支出重复审批，项目反复等待。星币四在“关键阻力”位，哪句最贴合？',
          options: [
            {id: 'friction', text: '重复收紧已有权限，可能让资源难以按计划流动。', why: '它对应已授权却反复审批的事实，守住动作与阻力位共同指向过度控制。'},
            {id: 'protection', text: '重复审批说明资源得到有效保护，应继续保持流程。', why: '没有回应背景明确给出的反复等待，把问题中的阻力当成已验证有效的保障。'},
            {id: 'skill', text: '重复审批说明团队技能尚未成熟，应先加强专业训练。', why: '题目没有提供技能不足的信息；把流程卡点转成另一类原因，缺少依据。'},
            {id: 'interest', text: '重复审批说明团队对目标失去热情，应先寻找新方向。', why: '等待源于审批要求，不能据此推出团队兴趣不足，更不能直接要求换目标。'}
          ], correct: 'friction',
          evidenceOptions: [
            {id: 'joined', text: '固定星币的动作、阻力位，以及已经授权却仍重复审批的背景。', why: '三类线索一起把资源保护收窄为本题的过度控制，而不是泛泛谈求稳。'},
            {id: 'city', text: '牌后有城市，因此所有问题都由公司制度造成。', why: '城市可以引出环境联想，却不能单独确认现实中的责任或全部原因。'},
            {id: 'four', text: '数字是四，因此任何稳定流程都会阻碍创新。', why: '数字不是价值判断，稳定流程在另一个背景中也可能提供支持。'}
          ], evidenceCorrect: 'joined',
          hint: '比较“已有保护边界”和“在边界之外再次收紧”，它们不是同一件事。',
          feedback: '资源位问能用什么，阻力位问哪里受限。正确解读要同时尊重位置与已知背景。'
        },
        {
          id: 'career-context-advice', kind: 'choice', dimension: '牌位应用', title: '建议要回应实际资源压力', position: '最小行动', contextLabel: '事业 · 行动路径',
          prompt: '你同时启动三个试点，花费开始挤占必要运营预算。星币四在“最小行动”位。哪一步最贴合？',
          options: [
            {id: 'limit', text: '划清必要支出的保留线，再为一个试点设定可承担额度。', why: '用守住核心资源回应预算挤占，同时把行动限制在可尝试的范围内。'},
            {id: 'freeze', text: '冻结所有运营与试点支出，等完全没有风险再恢复。', why: '必要运营同样需要资源流动，完全冻结超过题目需要，也把可控误当成零风险。'},
            {id: 'expand', text: '同时增加三个试点投入，用更多机会分摊当前压力。', why: '题目已经出现预算挤占，追加投入没有回应守住必要资源的建议方向。'},
            {id: 'wait', text: '保持现有支出节奏，等试点回报自然补足运营预算。', why: '题目没有回报保证，等待不处理已出现的资源压力。'}
          ], correct: 'limit',
          hint: '把“守住”转成具体资源边界，而不是让所有事情停下来。',
          feedback: '这里讨论的是一个可供核对的管理动作；实际额度与取舍仍须使用真实预算信息。'
        },
        {
          id: 'career-context-link', kind: 'choice', dimension: '多牌关系', title: '资源如何支持新的行动', cardIds: ['w01', 'p04', 'p08'], cardPositions: ['起点', '可用资源', '最小行动'], contextLabel: '事业 · 行动路径节选',
          prompt: '已有新服务灵感，也留出一小笔试验预算；关键限制是团队暂不熟悉交付细节。这三位依次是权杖王牌、星币四、星币八。哪条路径最贴合？',
          options: [
            {id: 'resource-action', text: '把新动力放进有限预算里，用一次小交付反复练熟关键步骤。', why: '新动力、可控资源与实际打磨分别对应三张牌，也回应了交付尚不熟悉的背景。'},
            {id: 'obstacle-old', text: '预算被过度抓紧，必须先完全放开支出，才能开始打磨服务。', why: '此处星币四在资源位，背景也说明预算可用；不能沿用上一题阻力位的结论。'},
            {id: 'wait-master', text: '先把交付细节全部想清楚，等完全熟练后再启动第一次试验。', why: '只在头脑里准备无法替代星币八的实际制作，也没有用现有条件展开小试验。'},
            {id: 'result', text: '灵感和资金都已具备，持续投入必然让新服务成为稳定收入。', why: '从行动条件跳到收入保证，超出三张牌与背景能支持的范围。'}
          ], correct: 'resource-action',
          hint: '注意星币四这次在资源位，不能把另一个牌阵中的“阻碍”答案直接搬过来。',
          feedback: '同样三张牌，星币四从阻碍换成资源，牌间关系就能从“动力与控制的张力”变为“用边界支持尝试”。'
        },
        {
          id: 'career-context-recall', kind: 'recall', dimension: '情境迁移', title: '说清是保障，还是卡住', contextLabel: '事业 · 换位回忆',
          prompt: '回忆三个工作情境：专项预算可用、已授权仍重复审批、试点挤占运营预算。分别怎样用星币四？',
          points: ['可用资源位 + 专项预算：清楚的资源边界可以支持试验。', '关键阻力位 + 重复审批：额外控制可能妨碍资源流动。', '最小行动位 + 预算挤占：先保护必要资源，再做有限尝试。'],
          hint: '核心仍是守住；判断对象、程度和位置，才能分清三者。',
          feedback: '如果每个案例都回答“保守、缺乏变化”，就漏掉了牌位与现实背景带来的关键差别。'
        }
      ]
    },
    {
      id: 'study-context', title: '同一张牌，放进学业问题', subtitle: '守住方法还是固守方法，要看练习与反馈', cardIds: ['p04'],
      steps: [
        {
          id: 'study-context-intro', kind: 'intro', dimension: '情境迁移', title: '学习问题，需要回到表现核对', contextLabel: '学业 · 学习突破',
          prompt: '把学习投入拆成现状、卡点、支点、下一轮练习。',
          body: '星币四的“守住”可以指学习时间、资料、方法和熟悉感。要判断它有没有帮助，需看你实际怎样学、错在哪里。',
          points: ['现状：描述目前怎样投入，不直接评价好坏。', '卡点：找出限制理解与练习的具体模式。', '支点：使用已有基础、反馈或恢复条件。', '下一轮练习：提出动作，并说明怎样检查是否改善。'],
          hint: '问“我在怎样处理知识”，不只问“我会不会考好”。',
          feedback: '牌阵可以帮助提出待验证的学习假设，实际作业与回忆表现才能检验它。'
        },
        {
          id: 'study-context-state', kind: 'choice', dimension: '牌位应用', title: '现状位先描述学习方式', position: '学习现状', contextLabel: '学业 · 学习突破',
          prompt: '你每天把熟悉的笔记再看一遍，暂时没有做新的题目或回忆检查。星币四在“学习现状”位，哪句最贴合？',
          options: [
            {id: 'familiar', text: '你目前依靠保留熟悉材料与方式，维持学习的可控感。', why: '对应重复看熟悉笔记的行为，描述当前方式，没有直接补出掌握程度或分数。'},
            {id: 'mastered', text: '你目前已把知识稳定掌握，新的题目暂时没有必要。', why: '重复看笔记不等于能回忆或应用，背景还没有给出检查结果。'},
            {id: 'advice', text: '你现在应当安排一次新题练习，核对笔记是否能用出来。', why: '这是可能有价值的建议，但题目此时要求说明现状。'},
            {id: 'lack', text: '你目前缺少可用学习资料，因此只能反复使用旧笔记。', why: '题目没有说明缺少资料；把使用熟悉笔记解释成资源短缺，属于补造原因。'}
          ], correct: 'familiar',
          hint: '“我目前在怎么学”和“我到底会不会”是两个不同的问题。',
          feedback: '现状位先命名方式。是否形成卡点，还需要任务要求与实际反馈进一步说明。'
        },
        {
          id: 'study-context-gap', kind: 'reason', dimension: '画面依据', title: '什么证据支持固守方法', position: '卡点', contextLabel: '学业 · 学习突破',
          prompt: '新题连续暴露同一种概念错误，老师已给出针对性反馈，但你因为新方法不熟悉，仍只照旧抄写答案。星币四在“卡点”位，哪项最贴合？',
          options: [
            {id: 'rigidity', text: '为了保留熟悉感而固定旧方式，可能阻止你使用已有反馈。', why: '背景给出重复错误、反馈已在和拒绝调整，能把守住具体限定为妨碍修正。'},
            {id: 'resource', text: '为了稳定学习而保留旧方式，已经有效减少了概念错误。', why: '与连续出现同种错误的事实相冲突，也把卡点读成已奏效的支点。'},
            {id: 'talent', text: '为了继续学习而增加抄写，说明当前概念已超出你的能力。', why: '重复错误与方法未调整不能证明能力上限，背景更直接指向没有使用反馈。'},
            {id: 'rest', text: '为了应对疲劳而依靠抄写，说明首要问题是缺少休息。', why: '题目没有疲劳信息，不能把方法与反馈的明确卡点改写为休息不足。'}
          ], correct: 'rigidity',
          evidenceOptions: [
            {id: 'facts', text: '抱住、踩住的动作，加上卡点位与已有反馈却不调整的事实。', why: '画面、位置和已知行为一起支持固定旧方法的解释。'},
            {id: 'count', text: '四枚星币数量有限，因此知识容量已经到达上限。', why: '图案数量不能判断知识容量或能力上限。'},
            {id: 'still', text: '人物没有行走，因此任何安静看书都不会有效。', why: '从静态画面推出所有静态学习无效，既超出题目，也抹掉了具体学习方式的差别。'}
          ], evidenceCorrect: 'facts',
          hint: '题目已经给出了方法没有奏效、而反馈尚未被使用的证据。',
          feedback: '这里已有重复错误和未使用反馈的证据，所以卡点是固定旧方式。换一个背景，坚持合适的方法也可能成为支持。'
        },
        {
          id: 'study-context-advice', kind: 'choice', dimension: '牌位应用', title: '换个背景，坚持也会有帮助', position: '下一轮练习', contextLabel: '学业 · 学习突破',
          prompt: '换一个案例：你每天换一套课程，尚未把任何一套的基础练习做完；现有课程已经覆盖老师要求。星币四在“下一轮练习”位，哪项最贴合？',
          options: [
            {id: 'stable', text: '先固定一套合适材料完成一个单元，再用练习结果决定是否调整。', why: '用稳定范围回应频繁切换，同时保留反馈检查，避免把坚持变成不许修正。'},
            {id: 'never-change', text: '先固定第一套材料，以后即使反馈显示不合适也不再更换。', why: '把稳定扩大成永久拒绝调整，超过题目需要，也失去了用反馈判断的环节。'},
            {id: 'more', text: '先再找几套接近的材料，确保选择足够多才开始基础练习。', why: '延续不断切换与准备的模式；背景已经说明有覆盖要求的材料。'},
            {id: 'memorize', text: '先把选定材料的答案全部背下，再把熟悉感当作完成标准。', why: '固定材料不等于固定答案；熟悉感不能替代实际完成与理解检查。'}
          ], correct: 'stable',
          hint: '这次的卡点是不断切换，建议是建立一段可检查的稳定练习。',
          feedback: '同一张星币四，在不同背景中可以提示“别固守”或“先稳定下来”。背景与牌位决定优先检查哪一面。'
        },
        {
          id: 'study-context-link', kind: 'choice', dimension: '多牌关系', title: '恢复、理解、练习怎样相接', cardIds: ['s04', 'm09', 'p08'], cardPositions: ['学习现状', '学习支点', '下一轮练习'], contextLabel: '学业 · 学习突破节选',
          prompt: '你在连续熬夜后安排了恢复时间；已知卡点是解题时说不清关键概念，也有老师给的概念说明可以核对。三位依次为宝剑四、隐士、星币八。哪条路径最贴合？',
          options: [
            {id: 'cycle', text: '先恢复可用精力，独立梳理并核对一个概念，再用练习和反馈反复打磨。', why: '分别回应恢复状态、独立深入的学习支点与实际打磨，也针对了概念不清的卡点。'},
            {id: 'isolate', text: '先停止所有任务，独自思考到完全确定，再长期避免外部反馈干扰。', why: '把恢复扩成长期停摆，把隐士误用为拒绝已可用的反馈，也跳过星币八的实际练习。'},
            {id: 'volume', text: '先压缩恢复时间，用更多题量替代理解，再等待熟练自动解决概念问题。', why: '没有尊重已安排的恢复，也无视题目明确的概念卡点和可核对资源。'},
            {id: 'outcome', text: '先恢复再思考，既然出现了练习牌，之后的考试结果就已确定。', why: '行动方向可以讨论，考试结果仍要通过真实表现检验，不能由最后一张牌保证。'}
          ], correct: 'cycle',
          hint: '每一张承担不同工作：状态、支点、练习；把动作接起来，再检查是否回应概念卡点。',
          feedback: '学业解读的落点是可尝试的学习过程，不是分数预言。练习之后仍应看是否能不看答案解释概念。'
        },
        {
          id: 'study-context-recall', kind: 'recall', dimension: '情境迁移', title: '从记关键词，走到判断背景', contextLabel: '学业 · 换位回忆',
          prompt: '回忆：星币四在学习现状位、卡点位、下一轮练习位，分别可以怎样说？再想起一项需要用实际表现核对的信息。',
          points: ['只重复熟悉笔记 + 现状：依靠熟悉方式维持可控感，暂未证明掌握。', '已有反馈却拒绝调整 + 卡点：守住旧方式可能阻止修正。', '不停切换合适材料 + 下一轮练习：固定一个单元，完成后用反馈判断。', '能否理解、回忆、做新题或取得怎样的成绩，都需要实际表现检验。'],
          hint: '每一句都带上背景，别只背“保守”“稳定”两个词。',
          feedback: '能在新案例中解释为什么选这一层牌义，才是在练习迁移理解；这一轮自评仍不等于已经长期记住。'
        }
      ]
    }
  ],
  sources: [
    {title: 'A. E. Waite · The Pictorial Key to the Tarot · III §7（核对凯尔特十字的历史位置结构）', url: 'https://sacred-texts.com/tarot/pkt/pkt0307.htm'},
    {title: 'Labyrinthos · Tarot Spreads List（参考按问题领域选择不同牌阵的产品方式）', url: 'https://labyrinthos.co/pages/tarot-spreads-list'}
  ]
};

/* Original scenario spreads. Stable earlier IDs and authored lessons remain compatible. */
(() => {
  const c=window.TAROT_SPREAD_CONTENT;
  c.categories=[{"id": "all", "label": "全部牌阵"}, {"id": "love", "label": "感情关系"}, {"id": "work", "label": "工作事业"}, {"id": "study", "label": "学习成长"}, {"id": "life", "label": "日常生活"}, {"id": "self", "label": "自我探索"}, {"id": "choice", "label": "选择决策"}];
  const defaults={one:['life','career',false],three:['life','career',false],timeline:['life','career',false],choice:['choice','career',false],relationship:['love','love',true],action:['work','career',true],study:['study','study',true],celtic:['self','career',false]};
  for(const s of c.spreads){const [category,topic,contextEnabled]=defaults[s.id];Object.assign(s,{category,topic,contextEnabled});}
  c.spreads.push(...[
  {
    "id": "daily",
    "name": "塔罗日运",
    "category": "life",
    "topic": "career",
    "summary": "停一口气，为今天翻开一张牌。",
    "bestFor": "给今天一个观察主题和可实践的小行动。",
    "avoid": "把日签当成吉凶保证或替自己作决定。",
    "layout": "one",
    "topics": [
      "career"
    ],
    "positions": [
      {
        "id": "focus",
        "label": "今日提醒",
        "question": "今天我可以把注意力放在哪里，并采取怎样的一小步？",
        "role": "advice"
      }
    ],
    "readingTip": "先看画面，再读提醒，带着一个小行动走进今天。",
    "compareTip": "同一天保留同一张日签；明天再开启新的相遇。",
    "contextEnabled": false
  },
  {
    "id": "love-talk",
    "name": "关系沟通三角",
    "category": "love",
    "topic": "love",
    "summary": "想说的、没听见的与可开启的谈话。",
    "bestFor": "想说的、没听见的与可开启的谈话。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "triangle",
    "topics": [
      "love"
    ],
    "positions": [
      {
        "id": "voice",
        "label": "我的表达",
        "question": "我正在怎样表达自己的需要？",
        "role": "state"
      },
      {
        "id": "listen",
        "label": "倾听盲点",
        "question": "哪些假设或防御可能影响我听清对方已经表达的内容？",
        "role": "tension"
      },
      {
        "id": "talk",
        "label": "开启谈话",
        "question": "我可以怎样开始一次更清楚、可回应的沟通？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": true
  },
  {
    "id": "love-needs",
    "name": "关系中的需要",
    "category": "love",
    "topic": "love",
    "summary": "分清感受、需要、连接基础与行动。",
    "bestFor": "分清感受、需要、连接基础与行动。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "grid",
    "topics": [
      "love"
    ],
    "positions": [
      {
        "id": "feeling",
        "label": "此刻感受",
        "question": "这段关系里，我此刻更关注哪种感受？",
        "role": "state"
      },
      {
        "id": "need",
        "label": "未被照顾的需要",
        "question": "哪种需要或边界可能没有得到足够照顾？",
        "role": "tension"
      },
      {
        "id": "support",
        "label": "共同基础",
        "question": "双方已知的互动中，哪些基础值得继续珍惜？",
        "role": "resource"
      },
      {
        "id": "action",
        "label": "我的回应",
        "question": "我可以怎样表达需要，而不替对方决定？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": true
  },
  {
    "id": "love-boundary",
    "name": "温柔的边界",
    "category": "love",
    "topic": "love",
    "summary": "看清承担的部分，为关系留出空间。",
    "bestFor": "看清承担的部分，为关系留出空间。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "grid",
    "topics": [
      "love"
    ],
    "positions": [
      {
        "id": "pattern",
        "label": "相处模式",
        "question": "我习惯怎样参与这段关系？",
        "role": "state"
      },
      {
        "id": "burden",
        "label": "过度承担",
        "question": "哪些责任或期待可能已经超出我能承担的范围？",
        "role": "tension"
      },
      {
        "id": "support",
        "label": "可用支持",
        "question": "什么资源或稳定做法可以支持我建立边界？",
        "role": "resource"
      },
      {
        "id": "boundary",
        "label": "边界行动",
        "question": "我可以怎样清楚、尊重地表达一条边界？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": true
  },
  {
    "id": "love-repair",
    "name": "告别与修复",
    "category": "love",
    "topic": "love",
    "summary": "承认过去，照顾当下，选择下一步。",
    "bestFor": "承认过去，照顾当下，选择下一步。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "row",
    "topics": [
      "love"
    ],
    "positions": [
      {
        "id": "past",
        "label": "带来的经历",
        "question": "哪些实际发生的经历仍在影响我？",
        "role": "past"
      },
      {
        "id": "care",
        "label": "现在的需要",
        "question": "我当前的感受和注意力呈现怎样的状态？",
        "role": "state"
      },
      {
        "id": "repair",
        "label": "修复的一步",
        "question": "我可以先做什么，支持自己恢复选择的空间？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": true
  },
  {
    "id": "work-progress",
    "name": "工作推进三角",
    "category": "work",
    "topic": "career",
    "summary": "把卡住的项目重新带回可执行的一步。",
    "bestFor": "把卡住的项目重新带回可执行的一步。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "triangle",
    "topics": [
      "career"
    ],
    "positions": [
      {
        "id": "state",
        "label": "项目现状",
        "question": "目前推进方式和工作表现有什么值得关注？",
        "role": "state"
      },
      {
        "id": "block",
        "label": "推进卡点",
        "question": "什么约束或习惯可能限制了进展？",
        "role": "tension"
      },
      {
        "id": "action",
        "label": "下一步行动",
        "question": "我可以先做什么来检验一个改进方向？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": true
  },
  {
    "id": "work-change",
    "name": "留下还是转向",
    "category": "work",
    "topic": "career",
    "summary": "用相同维度比较当前工作与新方向。",
    "bestFor": "用相同维度比较当前工作与新方向。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "choice",
    "topics": [
      "career"
    ],
    "positions": [
      {
        "id": "a-support",
        "label": "留下 · 支持",
        "question": "继续当前工作有哪些已知支持条件？",
        "role": "resource"
      },
      {
        "id": "a-cost",
        "label": "留下 · 代价",
        "question": "继续当前工作可能需要承担哪些取舍？",
        "role": "tension"
      },
      {
        "id": "a-trend",
        "label": "留下 · 趋势",
        "question": "若按当前方式继续，值得观察什么倾向？",
        "role": "trend"
      },
      {
        "id": "b-support",
        "label": "转向 · 支持",
        "question": "探索新方向有哪些可核对的支持条件？",
        "role": "resource"
      },
      {
        "id": "b-cost",
        "label": "转向 · 代价",
        "question": "探索新方向需要哪些投入或取舍？",
        "role": "tension"
      },
      {
        "id": "b-trend",
        "label": "转向 · 趋势",
        "question": "若按已知计划探索新方向，值得观察什么倾向？",
        "role": "trend"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": true
  },
  {
    "id": "work-team",
    "name": "合作与分工",
    "category": "work",
    "topic": "career",
    "summary": "从自己的做法与已知配合中找到协作空间。",
    "bestFor": "从自己的做法与已知配合中找到协作空间。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "grid",
    "topics": [
      "career"
    ],
    "positions": [
      {
        "id": "self",
        "label": "我的参与",
        "question": "我正在以怎样的方式参与合作？",
        "role": "state"
      },
      {
        "id": "observable",
        "label": "已知配合",
        "question": "对方已经表达的承诺和实际行动有哪些模式？",
        "role": "unknown"
      },
      {
        "id": "gap",
        "label": "协作摩擦",
        "question": "哪些目标、边界或做法可能没有对齐？",
        "role": "tension"
      },
      {
        "id": "action",
        "label": "对齐行动",
        "question": "我可以怎样澄清一次分工或共同期待？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": true
  },
  {
    "id": "work-strength",
    "name": "能力与机会",
    "category": "work",
    "topic": "career",
    "summary": "将已有能力与现实约束放在同一张牌桌。",
    "bestFor": "将已有能力与现实约束放在同一张牌桌。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "pyramid",
    "topics": [
      "career"
    ],
    "positions": [
      {
        "id": "state",
        "label": "我的起点",
        "question": "我目前怎样使用自己的能力？",
        "role": "state"
      },
      {
        "id": "gap",
        "label": "待补之处",
        "question": "哪种限制或做法可能妨碍能力发挥？",
        "role": "tension"
      },
      {
        "id": "strength",
        "label": "已有优势",
        "question": "哪些已有条件值得继续发展？",
        "role": "resource"
      },
      {
        "id": "action",
        "label": "发展方向",
        "question": "我可以怎样把一个优势转成可观察的尝试？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": true
  },
  {
    "id": "study-review",
    "name": "学习复盘",
    "category": "study",
    "topic": "study",
    "summary": "回看一次练习，把经验带进下一次。",
    "bestFor": "回看一次练习，把经验带进下一次。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "row",
    "topics": [
      "study"
    ],
    "positions": [
      {
        "id": "past",
        "label": "这次的经历",
        "question": "本次学习中哪些已发生的模式值得回看？",
        "role": "past"
      },
      {
        "id": "gap",
        "label": "真正的卡点",
        "question": "哪个理解缺口或学习习惯需要进一步核对？",
        "role": "tension"
      },
      {
        "id": "next",
        "label": "下次的调整",
        "question": "下次我可以改变哪一步，并检查效果？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": true
  },
  {
    "id": "study-plan",
    "name": "学习计划四步",
    "category": "study",
    "topic": "study",
    "summary": "从目标与基础出发，安排下一轮投入。",
    "bestFor": "从目标与基础出发，安排下一轮投入。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "grid",
    "topics": [
      "study"
    ],
    "positions": [
      {
        "id": "aim",
        "label": "学习目标",
        "question": "我正追求怎样的学习状态，是否符合实际需要？",
        "role": "state"
      },
      {
        "id": "support",
        "label": "已有基础",
        "question": "我有哪些可以调用的基础、材料或支持？",
        "role": "resource"
      },
      {
        "id": "limit",
        "label": "现实约束",
        "question": "哪些时间、精力或习惯限制需要考虑？",
        "role": "tension"
      },
      {
        "id": "next",
        "label": "下一轮安排",
        "question": "怎样安排一次可以执行和检查的练习？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": true
  },
  {
    "id": "life-week",
    "name": "一周的节奏",
    "category": "life",
    "topic": "career",
    "summary": "看清当下节奏，留意需要照顾和调整的部分。",
    "bestFor": "看清当下节奏，留意需要照顾和调整的部分。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "row",
    "topics": [
      "career"
    ],
    "positions": [
      {
        "id": "state",
        "label": "当前节奏",
        "question": "我近期的日常状态呈现怎样的模式？",
        "role": "state"
      },
      {
        "id": "resource",
        "label": "支持我的事",
        "question": "哪些已有的安排或支持值得保留？",
        "role": "resource"
      },
      {
        "id": "action",
        "label": "本周的一步",
        "question": "本周可以尝试什么小调整，并观察实际反馈？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": false
  },
  {
    "id": "life-resources",
    "name": "生活资源盘点",
    "category": "life",
    "topic": "career",
    "summary": "梳理手中的条件与取舍，照顾可持续的生活。",
    "bestFor": "梳理手中的条件与取舍，照顾可持续的生活。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "grid",
    "topics": [
      "career"
    ],
    "positions": [
      {
        "id": "state",
        "label": "使用现状",
        "question": "我正在怎样安排时间、精力或身边资源？",
        "role": "state"
      },
      {
        "id": "resource",
        "label": "现有支持",
        "question": "哪些资源或支持已经存在，可以实际使用？",
        "role": "resource"
      },
      {
        "id": "tension",
        "label": "消耗与限制",
        "question": "什么习惯或安排可能造成不必要的消耗？",
        "role": "tension"
      },
      {
        "id": "action",
        "label": "调整安排",
        "question": "我可以先调整什么，让投入更可持续？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": false
  },
  {
    "id": "self-emotion",
    "name": "情绪天气",
    "category": "self",
    "topic": "career",
    "summary": "给感受一个位置，再给自己一个回应。",
    "bestFor": "给感受一个位置，再给自己一个回应。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "triangle",
    "topics": [
      "career"
    ],
    "positions": [
      {
        "id": "state",
        "label": "此刻的我",
        "question": "此刻我的注意力与反应在哪里？",
        "role": "state"
      },
      {
        "id": "tension",
        "label": "需要留意",
        "question": "哪种反应可能过度、受阻或被忽视？",
        "role": "tension"
      },
      {
        "id": "action",
        "label": "回应自己",
        "question": "我可以用什么小动作照顾并观察自己的状态？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": false
  },
  {
    "id": "self-values",
    "name": "找回自己的方向",
    "category": "self",
    "topic": "career",
    "summary": "核对想追求的方向与真正愿意投入的事情。",
    "bestFor": "核对想追求的方向与真正愿意投入的事情。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "pyramid",
    "topics": [
      "career"
    ],
    "positions": [
      {
        "id": "aim",
        "label": "想追求什么",
        "question": "我正在追求怎样的状态或方向？",
        "role": "state"
      },
      {
        "id": "tension",
        "label": "拉扯我的事",
        "question": "哪些期待、习惯或矛盾可能拉扯我的选择？",
        "role": "tension"
      },
      {
        "id": "resource",
        "label": "可以依靠",
        "question": "已有的经验或支持怎样帮助我形成自己的判断？",
        "role": "resource"
      },
      {
        "id": "action",
        "label": "靠近的一步",
        "question": "我可以做哪个小尝试，检验这个方向是否适合自己？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": false
  },
  {
    "id": "choice-clarify",
    "name": "做决定之前",
    "category": "choice",
    "topic": "career",
    "summary": "还没有清楚选项时，先把判断标准找出来。",
    "bestFor": "还没有清楚选项时，先把判断标准找出来。",
    "avoid": "把象征当成已确认的事实，或跳过现实信息直接下结论。",
    "layout": "row",
    "topics": [
      "career"
    ],
    "positions": [
      {
        "id": "state",
        "label": "真正关注",
        "question": "这次决定里，我真正关注的是什么？",
        "role": "state"
      },
      {
        "id": "tension",
        "label": "判断盲点",
        "question": "哪些假设、担心或资源限制需要核对？",
        "role": "tension"
      },
      {
        "id": "action",
        "label": "先核对的事",
        "question": "在决定以前，我可以先核对或尝试什么？",
        "role": "advice"
      }
    ],
    "readingTip": "按图中编号逐位阅读，先回答该位置的问题，再把相邻牌的线索联系起来。",
    "compareTip": "比较牌位承担的不同任务；最后用已知事实和一次小行动检验解读。",
    "contextEnabled": false
  }
]);
})();

// Curated public catalog. Legacy IDs and positions remain immutable for saved readings.
(() => {
  const c=window.TAROT_SPREAD_CONTENT;
  const kept=new Set(['one','daily','three','timeline','celtic']);
  for(const d of c.spreads)d.legacy=!kept.has(d.id);
  const sources={"choice": {"title": "科技紫微网 · 二选一占卜法（2013）", "url": "https://m.click108.com.tw/article/201309/9094_1.php", "note": "采用原文五牌 V 形的位置与交替编号：1 为共同起点，2、4 为 A，3、5 为 B。使用本应用的洗牌、切牌和点选抽牌；未采用原文的数牌步骤。时间范围由问题约定，结果表示发展趋势。"}, "linear": {"title": "Brigit Esselmont · Biddy Tarot", "url": "https://biddytarot.com/blog/easy-three-card-tarot-spreads/", "note": "采用作者列出的三张牌位置定义；本文以原创中文说明用途，并将未来视为条件延续下的趋势。"}, "relationship": {"title": "Tina Gong · Labyrinthos", "url": "https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/examining-relationships-with-tarot-3-love-tarot-spreads-to-understand-you-your-partner", "note": "依据 Tina Gong 的关系牌阵位置定义与布局。关系中的角色和感受是解读视角，不等于已经知道对方的内心。"}, "celtic": {"title": "A. E. Waite · The Pictorial Key to the Tarot, III §7", "url": "https://sacred-texts.com/tarot/pkt/pkt0307.htm", "note": "依据 Waite 的十个位置定义。本应用省略额外指示牌；第 2 张交叉牌在展开视图中放在第 1 张右侧，便于点选。其他流派的编号可能不同。"}, "one": {"title": "Labyrinthos · Daily single-card reading", "url": "https://labyrinthos.co/pages/free-online-tarot-readings", "note": "采用每日单牌聚焦的简单抽牌方式。日签提供反思主题，并非新增一种复杂牌阵。"}};
  for(const d of c.spreads.filter(d=>!d.legacy)){d.source=sources[d.id==='three'||d.id==='timeline'?'linear':d.id==='daily'?'one':d.id];d.categories=d.id==='daily'?['life']:['love','work','study','life','self','choice'];}
  c.spreads.push(...[
  {
    "id": "decision-five",
    "name": "二择一 · 五牌 V 形",
    "layout": "decision",
    "category": "choice",
    "categories": [
      "choice",
      "love",
      "work",
      "study",
      "life"
    ],
    "topic": "career",
    "topics": [
      "love",
      "career",
      "study"
    ],
    "contextEnabled": false,
    "summary": "从同一个起点，看 A 与 B 各自的发展和结果趋势。",
    "bestFor": "两个明确选项怎么选？适合比较工作去留、关系选择、学习方向或生活安排。",
    "avoid": "选项尚未明确，或把结果当成必然发生。",
    "positions": [
      {
        "id": "current",
        "label": "当前状况",
        "question": "这次选择发生在怎样的处境里？",
        "role": "state"
      },
      {
        "id": "a-development",
        "label": "A · 当前发展",
        "question": "选择 A，会以怎样的状态展开？",
        "role": "state"
      },
      {
        "id": "b-development",
        "label": "B · 当前发展",
        "question": "选择 B，会以怎样的状态展开？",
        "role": "state"
      },
      {
        "id": "a-outcome",
        "label": "A · 结果趋势",
        "question": "沿着 A 继续，可能走向怎样的状态？",
        "role": "trend"
      },
      {
        "id": "b-outcome",
        "label": "B · 结果趋势",
        "question": "沿着 B 继续，可能走向怎样的状态？",
        "role": "trend"
      }
    ],
    "readingTip": "共同起点连接两条路径：1→2→4 与 1→3→5。",
    "compareTip": "比较同一时间范围；若两条路径各有所长，保留取舍而不强选赢家。",
    "source": {
      "title": "科技紫微网 · 二选一占卜法（2013）",
      "url": "https://m.click108.com.tw/article/201309/9094_1.php",
      "note": "采用原文五牌 V 形的位置与交替编号：1 为共同起点，2、4 为 A，3、5 为 B。使用本应用的洗牌、切牌和点选抽牌；未采用原文的数牌步骤。时间范围由问题约定，结果表示发展趋势。"
    }
  },
  {
    "id": "relationship-three",
    "name": "关系动态 · 三牌",
    "layout": "relation-row",
    "category": "love",
    "categories": [
      "love"
    ],
    "topic": "love",
    "topics": [
      "love"
    ],
    "contextEnabled": true,
    "positions": [
      {
        "id": "self",
        "label": "我的角色",
        "question": "我以怎样的状态参与这段关系？",
        "role": "state"
      },
      {
        "id": "partner",
        "label": "对方的角色",
        "question": "对方在互动中呈现怎样的角色？",
        "role": "unknown"
      },
      {
        "id": "dynamic",
        "label": "关系动态",
        "question": "双方之间形成了怎样的互动？",
        "role": "state"
      }
    ],
    "summary": "快速梳理自己、对方和关系整体，适合了解当下的互动模式。",
    "bestFor": "快速梳理自己、对方和关系整体，适合了解当下的互动模式。",
    "avoid": "把牌的象征当成对方已确认的想法。",
    "readingTip": "把双方的角色放回关系动态中理解。",
    "compareTip": "结合真实的互动和沟通核对。",
    "source": {
      "title": "Tina Gong · Labyrinthos",
      "url": "https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/examining-relationships-with-tarot-3-love-tarot-spreads-to-understand-you-your-partner",
      "note": "依据 Tina Gong 的关系牌阵位置定义与布局。关系中的角色和感受是解读视角，不等于已经知道对方的内心。"
    }
  },
  {
    "id": "relationship-five",
    "name": "关系十字 · 五牌",
    "layout": "relation-cross",
    "category": "love",
    "categories": [
      "love"
    ],
    "topic": "love",
    "topics": [
      "love"
    ],
    "contextEnabled": true,
    "positions": [
      {
        "id": "self",
        "label": "我的角色",
        "question": "我以怎样的状态参与这段关系？",
        "role": "state"
      },
      {
        "id": "partner",
        "label": "对方的角色",
        "question": "对方在互动中呈现怎样的角色？",
        "role": "unknown"
      },
      {
        "id": "foundation",
        "label": "过去基础",
        "question": "这段关系建立在怎样的基础上？",
        "role": "past"
      },
      {
        "id": "present",
        "label": "关系现状",
        "question": "目前的关系呈现怎样的状态？",
        "role": "state"
      },
      {
        "id": "direction",
        "label": "后续方向",
        "question": "照目前的相处方式，关系可能怎样发展？",
        "role": "trend"
      }
    ],
    "summary": "想理解关系如何走到现在、双方的角色，以及延续目前模式的可能走向。",
    "bestFor": "想理解关系如何走到现在、双方的角色，以及延续目前模式的可能走向。",
    "avoid": "把牌的象征当成对方已确认的想法。",
    "readingTip": "把双方的角色放回关系动态中理解。",
    "compareTip": "结合真实的互动和沟通核对。",
    "source": {
      "title": "Tina Gong · Labyrinthos",
      "url": "https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/examining-relationships-with-tarot-3-love-tarot-spreads-to-understand-you-your-partner",
      "note": "依据 Tina Gong 的关系牌阵位置定义与布局。关系中的角色和感受是解读视角，不等于已经知道对方的内心。"
    }
  }
]);
})();

// Context is chosen before drawing; ordinal free cards never imply a fixed spread.
(()=>{
 const c=window.TAROT_SPREAD_CONTENT;
 const extra=[['general','综合问题'],['life','日常生活'],['self','自我探索'],['choice','选择决策']];
 for(const [id,label]of extra)c.topics.push({id,label,questions:[{id:'own',text:'这件事接下来会怎样发展？'}]});
 for(const d of c.spreads.filter(d=>!d.legacy&&!d.id.startsWith('relationship-')))d.topics=c.topics.map(t=>t.id);
 c.spreads.push({id:'open-three',name:'无牌阵 · 直接问三张',layout:'row',category:'life',categories:['love','work','study','life','self','choice'],topic:'general',topics:c.topics.map(t=>t.id),contextEnabled:true,
 summary:'不预设牌位，围绕同一个问题，把三张牌连起来解读。',bestFor:'想直接问一件具体的事，又不想事先分配牌位。',avoid:'把三张自动当成过去、现在、未来，或脱离问题各说一句。',
 positions:[1,2,3].map(n=>({id:'card-'+n,label:'第 '+n+' 张',question:'三张共同回答同一个问题；编号只表示抽取顺序。',role:'free'})),
 readingTip:'三张牌共同回答你的问题，没有预设时间或角色。',compareTip:'先看三张共同指向的结论，再看它们的支持、冲突和条件。',
 description:'适合问一件范围明确的事，例如一次合作能否推进、近期关系会怎样发展。三张不分配固定位置：先找共同主题，再用其他牌补充条件或转折。它与过去—现在—未来不同，不能把抽取顺序当成时间顺序。',
 source:{title:'本应用的自由三牌读法',url:'https://github.com/georgelu-creator/tarot-pocket/blob/main/docs/SPREAD_SOURCES.md',note:'按用户需求提供的不设牌位抽牌方式，不声称为某个传统命名牌阵。仅保留三张的抽取顺序，具体问题优先。'}});
 c.sceneGuides={
  all:{label:'全部牌阵',intro:'按张数从少到多排列。先选场景，也可以直接找一个合适的牌阵。',example:'这件事接下来会怎样发展？',uses:{}},
  love:{label:'感情关系',intro:'这里的牌阵都围绕感情：关系走向、互动障碍与感情选择。',example:'我们未来一个月还有继续发展的机会吗？',uses:{one:'感情里的一个明确问题，先看核心倾向。','open-three':'直接问关系走向、复合机会或一次联系的结果。',three:'看目前关系、阻碍关系的因素，以及下一步怎么做。',timeline:'理解关系从过去到现在，再看接下来的发展。','decision-five':'比较两种感情选择的发展与结果。',celtic:'关系背景复杂时，完整看双方处境、阻力与发展。'}},
  work:{label:'工作事业',intro:'围绕工作结果：项目推进、求职机会、合作和职业选择。',example:'这次面试，我得到录用的可能性如何？',uses:{one:'针对工作中的一个具体决定，看最重要的提示。','open-three':'直接问面试、合作、项目或近期工作结果。',three:'看工作现状、推进卡点和下一步行动。',timeline:'回看工作问题的由来，判断接下来的走势。','decision-five':'比较留任与跳槽、两个机会或两种工作方案。',celtic:'职业背景较复杂时，完整分析机会、限制与走向。'}},
  study:{label:'学习成长',intro:'围绕学习目标：考试准备、申请、学习阻碍与方向选择。',example:'照现在的准备情况，我这次考试能达到目标吗？',uses:{one:'学习中最需要关注的一件事。','open-three':'直接问考试准备、申请或某个学习目标。',three:'看目前准备、主要卡点和可改进的一步。',timeline:'看过去的学习方式怎样影响目前和下一阶段。','decision-five':'比较两个学习方向、学校或准备方案。',celtic:'申请或长期目标较复杂时，完整梳理条件与走向。'}},
  life:{label:'日常生活',intro:'围绕具体生活安排：出行、计划、人际协作与日常选择。',example:'这次旅行计划，近期能顺利落实吗？',uses:{one:'从当前生活问题中抓住最关键的一点。','open-three':'直接问一个生活计划能否推进。',three:'看生活现状、现实阻碍和下一步安排。',timeline:'看一件生活问题的过去、现在与后续趋势。','decision-five':'比较两个生活安排的过程和结果。',celtic:'搬家、旅行或长期安排，梳理复杂条件。'}},
  self:{label:'自我探索',intro:'围绕自己的习惯与目标，理解卡点并找到可实行的改变。',example:'我总是拖延这个目标，真正卡在哪里？',uses:{one:'给当前的困惑找一个切入点。','open-three':'围绕一个习惯或目标，直接看三张牌的提醒。',three:'看自己的现状、卡点和可以改变的一步。',timeline:'看过去的经历如何影响现在的选择。',celtic:'深入梳理目标、内外条件与行动方向。'}},
  choice:{label:'选择决策',intro:'先明确正在比较的选项，再看各自条件、代价与结果倾向。',example:'选择 A 近期行动，还是 B 再等一段时间，哪条路更合适？',uses:{one:'做决定前，先看最不能忽略的一件事。','open-three':'针对一个明确选择，直接看整体倾向与条件。',three:'看决策现状、阻碍和下一步怎么比较。',timeline:'看这个决定从过去到现在的发展。','decision-five':'标准五牌二择一：共同现状，A/B 各自的发展与结果。',celtic:'选择涉及多方条件时，完整梳理影响因素。'}}
 };
 const descriptions={
 one:'只抽一张，适合范围很小、背景已经清楚的问题。先读这张牌的核心含义，再结合你问的事情判断它强调什么。它给出的信息有限，不适合一次追问许多互不相关的问题。',
 three:'三张分别看现状、阻碍与建议。适合事情推进不顺时，找出当前处境、卡在哪里，以及下一步怎样行动。它侧重解决问题，不能把建议位直接读成已经发生的结果。',
 timeline:'三张分别回顾过去影响、描述现在、观察后续趋势。适合已经有一段经历的问题，例如一段关系或一个项目。未来趋势以目前条件持续为前提，重点是看事情如何一步步发展。',
 'decision-five':'五张牌形成两条可比较的路径：第一张是共同现状；第二、四张对应 A 的发展与结果，第三、五张对应 B 的发展与结果。先把 A/B 写具体并约定时间范围，再比较两条路径。不要把 A 的过程与 B 的结果混在一起比较。',
 'relationship-three':'三张分别描述自己在关系中的角色、对方呈现的角色和两人之间的互动。适合先看懂当下的关系。牌面可以提示一种可能的互动方式，但对方的实际想法仍要结合已发生的交流判断。',
 'relationship-five':'五张分别看自己、对方、过去基础、关系现状和后续方向。适合已经持续一段时间、想了解如何走到现在的关系。解读先将过去与现状联系起来，再看关系继续发展的条件。',
 celtic:'十张牌从现状、交叉影响、目标、基础、过去、近期发展、自身、环境、期望与担忧、结果趋势展开。适合背景复杂且有具体问题时使用。先看核心问题，再结合内外条件解读整体走向；不必为了张数多而选它。'
 };
 for(const d of c.spreads.filter(d=>!d.legacy))d.description ||= descriptions[d.id]||d.summary;
})();

// RM-1.2 sourced additions. Existing IDs and saved position meanings are unchanged.
window.TAROT_SPREAD_CONTENT.spreads.push(...[
  {
    "id": "yes-no",
    "name": "Yes/No",
    "layout": "one",
    "category": "all",
    "categories": [
      "love",
      "work",
      "study",
      "life"
    ],
    "topic": "general",
    "topics": [
      "general",
      "love",
      "career",
      "study",
      "life"
    ],
    "contextEnabled": true,
    "legacy": false,
    "version": "1",
    "summary": "已经有一件想确认的事，想先知道更偏向“能”还是“不能”，可以选这里。抽一张牌，先看回答，再看原因；例如能不能收到录用、这周适不适合主动联系。",
    "description": "已经有一件想确认的事，想先知道更偏向“能”还是“不能”，可以选这里。抽一张牌，先看回答，再看原因；例如能不能收到录用、这周适不适合主动联系。",
    "bestFor": "已经有一件想确认的事，想先知道更偏向“能”还是“不能”，可以选这里。抽一张牌，先看回答，再看原因；例如能不能收到录用、这周适不适合主动联系。",
    "avoid": "把牌面倾向当成已经确定的事实。",
    "positions": [
      {
        "id": "outlook",
        "label": "这件事的结果倾向",
        "question": "这件事更偏向能成还是不能成，关键依据是什么？",
        "role": "outcome"
      }
    ],
    "source": {
      "title": "Yes No Tarot Reading",
      "url": "https://labyrinthos.co/pages/yes-no-tarot-reading",
      "note": "采用公开的单牌 Yes/No 方式。结果倾向是本应用对牌位的说明，不按正逆位计票，也不保证结果。"
    }
  },
  {
    "id": "new-love",
    "name": "新感情 · 五牌",
    "layout": "row",
    "category": "love",
    "categories": [
      "love"
    ],
    "topic": "love",
    "topics": [
      "love"
    ],
    "contextEnabled": true,
    "legacy": false,
    "version": "1",
    "summary": "还没有明确交往对象，想了解新的感情机会，可以从这里看。五张牌会一起看你的准备、可能遇到什么样的人、在哪里或怎样相识，以及新关系可能怎样发展。",
    "description": "还没有明确交往对象，想了解新的感情机会，可以从这里看。五张牌会一起看你的准备、可能遇到什么样的人、在哪里或怎样相识，以及新关系可能怎样发展。",
    "bestFor": "还没有明确交往对象，想了解新的感情机会，可以从这里看。五张牌会一起看你的准备、可能遇到什么样的人、在哪里或怎样相识，以及新关系可能怎样发展。",
    "avoid": "把牌面倾向当成已经确定的事实。",
    "positions": [
      {
        "id": "readiness",
        "label": "我现在的准备",
        "question": "我目前以怎样的状态迎接新的感情？",
        "role": "state"
      },
      {
        "id": "partner",
        "label": "可能遇到的人",
        "question": "可能出现怎样的相处风格？",
        "role": "unknown"
      },
      {
        "id": "meeting",
        "label": "相识的情境",
        "question": "什么样的相识情境值得留意？",
        "role": "unknown"
      },
      {
        "id": "connection",
        "label": "相处方式",
        "question": "这段新关系可能怎样相处？",
        "role": "state"
      },
      {
        "id": "potential",
        "label": "发展可能",
        "question": "这段关系可能如何发展？",
        "role": "trend"
      }
    ],
    "source": {
      "title": "Tina Gong · Finding New Love Tarot Spreads",
      "url": "https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/finding-new-love-tarot-spreads",
      "note": "采用 Finding Love Relationship 的五个角色。中文说明由本项目编写；对象与相遇情境只描述可能性，不保证命定对象或日期。"
    }
  },
  {
    "id": "three-options",
    "name": "三选一 · 三牌",
    "layout": "row",
    "category": "all",
    "categories": [
      "love",
      "work",
      "study",
      "life"
    ],
    "topic": "general",
    "topics": [
      "general",
      "love",
      "career",
      "study",
      "life"
    ],
    "contextEnabled": true,
    "legacy": false,
    "version": "1",
    "summary": "有三个具体选项，想放在一起比较，可以用这个牌阵。每个选项对应一张牌，围绕同一个目标看它们的差别；例如三个机会中，哪一个更符合自己的安排。",
    "description": "有三个具体选项，想放在一起比较，可以用这个牌阵。每个选项对应一张牌，围绕同一个目标看它们的差别；例如三个机会中，哪一个更符合自己的安排。",
    "bestFor": "有三个具体选项，想放在一起比较，可以用这个牌阵。每个选项对应一张牌，围绕同一个目标看它们的差别；例如三个机会中，哪一个更符合自己的安排。",
    "avoid": "把牌面倾向当成已经确定的事实。",
    "positions": [
      {
        "id": "option-a",
        "label": "选项A",
        "question": "选择A有哪些主要机会或困难？",
        "role": "choice"
      },
      {
        "id": "option-b",
        "label": "选项B",
        "question": "选择B有哪些主要机会或困难？",
        "role": "choice"
      },
      {
        "id": "option-c",
        "label": "选项C",
        "question": "选择C有哪些主要机会或困难？",
        "role": "choice"
      }
    ],
    "source": {
      "title": "Tina Gong · 3 Card Tarot Spreads",
      "url": "https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/3-card-tarot-spreads-simple-tarot-spreads-organized-by-layout",
      "note": "采用三个平等选项的公开组合。A/B/C编号为应用约定，每项只有一张，不另外增加发展与结果位。"
    }
  },
  {
    "id": "career-six",
    "name": "职业发展 · 六牌",
    "layout": "grid",
    "category": "work",
    "categories": [
      "work"
    ],
    "topic": "career",
    "topics": [
      "career"
    ],
    "contextEnabled": true,
    "legacy": false,
    "version": "1",
    "summary": "想知道目前这份工作还有哪些发展空间，继续做下去可能获得什么，可以选这里。六张牌会联系你当初的选择、现在的投入与工作情况，看看后续可能往哪里走。",
    "description": "想知道目前这份工作还有哪些发展空间，继续做下去可能获得什么，可以选这里。六张牌会联系你当初的选择、现在的投入与工作情况，看看后续可能往哪里走。",
    "bestFor": "想知道目前这份工作还有哪些发展空间，继续做下去可能获得什么，可以选这里。六张牌会联系你当初的选择、现在的投入与工作情况，看看后续可能往哪里走。",
    "avoid": "把牌面倾向当成已经确定的事实。",
    "positions": [
      {
        "id": "origin",
        "label": "当初为什么选择它",
        "question": "当初选择这份工作，最看重什么？",
        "role": "past"
      },
      {
        "id": "motivation",
        "label": "继续做的动力",
        "question": "是什么支持我继续投入？",
        "role": "state"
      },
      {
        "id": "responsibilities",
        "label": "工作职责",
        "question": "当前承担的职责意味着什么？",
        "role": "state"
      },
      {
        "id": "current",
        "label": "目前的工作情况",
        "question": "现在的工作呈现怎样的状态？",
        "role": "state"
      },
      {
        "id": "rewards",
        "label": "可能的收获",
        "question": "继续投入可能带来什么收获？",
        "role": "resource"
      },
      {
        "id": "direction",
        "label": "接下来的发展",
        "question": "照目前情况继续，工作可能怎样发展？",
        "role": "trend"
      }
    ],
    "source": {
      "title": "Tina Gong · Career Status Check — Brick by Brick",
      "url": "https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/three-career-tarot-spreads-for-finding-your-path-and-calling",
      "note": "保留 Brick by Brick 六个角色。用于当前工作，不把初衷改成现状、不把收获改成弱点，也不凭空增加另一份工作的路径。"
    }
  }
]);
