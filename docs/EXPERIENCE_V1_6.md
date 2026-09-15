# v1.6 · 集中学一张，直觉抽一组 / Focused learning, direct drawing

## 这次解决什么 / Problem

前版把“玩法数量”放在理解之前：每步更换布局、要求比较陌生牌、抽象题干和中途选项打断记忆。抽牌分类改变得不够明显，语境没有完整贯穿；候选确认与分页让直觉选择变成操作任务。本版以完成一张牌的学习、完成一个问题的抽牌为单位。

The previous flow added interaction variety before understanding: changing layouts, unfamiliar comparison cards, abstract wording and mid-lesson choices interrupted attention. Reading categories did not carry through consistently, while candidate confirmation and paging complicated intuitive selection. This version centers one card lesson and one complete reading.

## 固定学习框架 / Consistent lesson

每一步保持同一牌图位置、尺寸与牌名，统一呈现环节名、一句操作指引、一个问题、答案操作和解答。初学不引入另一张牌，不要求输入感悟；随机新学、自选、继续仍在课外入口，完成后再选下一步。

Each stage keeps the same card footprint and name, followed by a stage title, one instruction, one question, an answer action and feedback. First lessons do not introduce an unfamiliar comparison card or require written reflections. Random learning, card choice and resume remain outside the active lesson; further choices appear at completion.

| 环节 / Stage | 要完成的事 / Task |
| --- | --- |
| 看画面 / Observe | 在心里找人物、物品与动作，点“我想好了”再核对 / Notice people, objects and actions, then reveal the observation |
| 理解牌义 / Interpret | 选择最符合画面的意思，错误答案有明确解释 / Choose the best supported meaning; incorrect choices receive explicit feedback |
| 记住重点 / Remember | 用元素、数字和一句助记把画面串起来 / Connect the picture with its element, number and memory phrase |
| 放进问题 / Apply | 看真实位置图，用同一张牌回答现状、阻碍或建议 / Use the visible position diagram to interpret the same card in context |
| 理解逆位 / Reverse | 结合明确背景，区分具体的逆位表达 / Distinguish reversed expressions using concrete context |
| 自己回想 / Recall | 原位遮住图，先回想，再核对并记录真实表现 / Hide the image in place, recall first, then check and self-assess |

78 张牌分别编写直白牌义、画面解释、助记与感情/工作/学业情境。客观题判对错，开放解释采用自评；一次点对不标成掌握。旧比较记录保留，但不再强制进入初学链路。既有存档与备份兼容。

All 78 cards have plain meanings, visual explanations, memory phrases and love/work/study contexts. Objective questions are graded; open interpretations are self-assessed. One correct tap does not establish mastery. Historical comparison records remain compatible without forcing that stage into the new lesson.

## 抽牌与解读 / Drawing and reading

- 牌阵按张数升序。感情、工作、学业、生活、自我与选择分类各自展示用途和示例，选中的语境进入问题页、存档及 AI 请求。/ Sort by card count; category-specific purpose and examples carry into setup, storage and AI requests.
- 保留七种有出处结构，增加明确标为应用自由模式的“无牌阵 · 直接问三张”。编号只表示抽牌顺序，不暗加过去/现在/未来。/ Keep seven sourced structures and add an explicitly open three-card mode; ordinal positions do not imply a timeline.
- 78 张牌背连续铺开，窄屏自然纵向滚动，不分页；每张点击区域至少 44px。轻点即入位，原处标明已选顺序；滑动不会被算成选牌。/ Show all 78 backs in one continuous overview with natural vertical scrolling, equal targets of at least 44px, immediate picks and visible selection order. Scrolling does not select a card.
- 默认正逆位；旧牌组的方向原样保留。一次操作翻开整组，短动效后保留完整牌面结果。洗牌和切牌的观看时间、跳过、减少动态仍保留。/ New draws include reversals by default; saved directions remain exact. One action reveals the group, with an enduring result after the short animation. Shuffle/cut observation, skip and reduced motion remain.
- 结果页提供返回抽牌首页与本次说明入口。牌阵说明、问题准备和抽牌全过程移走浮动主导航；普通浏览向下滚动时收起导航、向上或到底部时恢复，并保留内容底部空间。/ Results expose return and guide actions. Spread guides, setup and focused drawing remove floating navigation; browsing hides it while scrolling down and restores it upwards or at the end, with safe content spacing.
- AI 先回应所问事情与结果，再解释整组依据。能支持时给“偏向会/不会”和条件；牌面不足时明确缺什么，不编造确定未来。离线参考与真实 AI 答案继续分开。/ AI answers the specific outcome first, then explains the spread. Give an evidence-backed leaning when supported, with conditions; otherwise identify missing information. Offline references remain distinct from genuine AI output.

## 验证与接力 / Acceptance

专项验证覆盖分类 DOM 不重建、用途变化、语境持久化、真实请求载荷、排序、自由三牌语义、44px 点击、整组动画中断恢复、六阶段一致性、中英界面及旧记录。全量 `npm test`、实际部署和公网核对记录见 [HANDOFF](HANDOFF.md)。截图仅用隔离合成数据。

Focused checks cover category DOM stability, changed purposes, persisted topics, actual request payloads, sorting, open-card semantics, touch targets, interrupted animation recovery, consistent lessons, bilingual presentation and old records. See [HANDOFF](HANDOFF.md) for full tests and deployment evidence. Screenshots use isolated synthetic data.

自动化与桌面 WebKit 不等于 iPhone 实机、专业教师审校或长期记忆效果已验收。/ Automated tests and desktop WebKit do not establish physical-iPhone acceptance, expert content review or long-term retention.

参考成熟的分步课程及有明确牌位的三牌示例：[Learn Tarot](https://www.learntarot.com/lessintro.htm)、[Labyrinthos three-card layouts](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/3-card-tarot-spreads-simple-tarot-spreads-organized-by-layout)。它们为课程组织与结构来源提供参考，不是对本应用内容或效果的背书。/ These sources inform progression and layout distinctions; they do not endorse this implementation or its effectiveness.
