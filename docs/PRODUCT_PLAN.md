# Tarot Pocket · 完整产品方案 / Product plan

Version: 1.0.0 · 2026-09-11 · Chinese and English

## 1. 产品要兑现的承诺 / Product promise

在手机上随时开始，不依赖打字和语音；用真实牌面建立联想，通过回忆、辨析与应用逐渐记住 78 张牌。没带实体牌时，提供独立的随身牌桌。学习与抽牌都能在内容下载完成后离线运行。

Start on a phone without typing or voice. Build associations with real card images, then recall, distinguish, and apply the meanings of all 78 cards. A separate reading table replaces a physical deck when needed. Learning and drawing work offline after complete preparation.

“记得”必须由可观察的表现支持。看过资料、做对选择题、主观自评和隔天回访是不同记录，不将浏览数量宣称为掌握程度。

Evidence matters: reading a reference, recognizing a choice, self-rating recall, and succeeding at a later review are distinct records. Viewing counts are never presented as mastery.

## 2. 行业参考与采用范围 / References and decisions

| 参考 / Reference | 采用 / Adopt | 本项目的边界 / Limit |
| --- | --- | --- |
| [Anki: active recall and spaced repetition](https://docs.ankiweb.net/background.html) | 回忆后揭晓，按表现安排复习。 / Reveal after recall; schedule by performance. | 不套用“每天打卡就掌握”的指标，也不宣称本产品已验证长期效果。 / No mastery from streaks; no untested efficacy claims. |
| [SuperMemo SM-2 original algorithm](https://www.super-memory.com/english/ol/sm2.htm) | 每个能力点有独立难度、次数、间隔、到期日。 / Each skill has its own ease, repetitions, interval, and due date. | 采用 SM-2 间隔公式，并明确记录本产品的评分映射与同日防晋级调整；不是 FSRS。 / Uses SM-2 intervals with disclosed grading and same-day adaptations; not FSRS. |
| [Retrieval Practice: why it works](https://www.retrievalpractice.org/why-it-works) | 从“再读一遍”转向主动想起，并在错误后提供依据。 / Try to retrieve, then receive explanatory feedback. | 静默自评不能当作客观测验；后续题目提供补充证据。 / Silent recall remains self-report, supplemented by exercises. |
| [Labyrinthos](https://labyrinthos.co/) | 学牌、查阅与实际抽牌可以共存。 / Learning, reference, and readings can coexist. | 借鉴产品任务分工；没有复制其课程、题库、美术，也没有声称实测其离线功能。 / Task-level reference only; no copied content/art or unverified offline claims. |
| [MDN: service worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) | HTTPS、明确作用域、离线资源完整缓存、安全更新。 / HTTPS, bounded scope, complete caching, safe updates. | 下载成功前不显示可离线使用；旧页面不被更新强制刷新。 / Never claim readiness before complete caching; no forced reloads. |

参考的是机制，不是功能数量。所有关于记忆效果的外部证据都不能直接当作 Tarot Pocket 自身的实验结果。

We adopt mechanisms, not feature counts. Evidence for learning methods is not a product-specific effectiveness study.

## 3. 入口与信息层级 / Navigation and hierarchy

首页只有两个主要决定：开始/继续学习，以及为自己抽牌。学习按钮直接进入当前课程；未完成时接着上次，否则优先到期复习，再安排新牌。

Home has two primary decisions: start/continue learning and draw a reading. Learning opens the active lesson immediately; otherwise it prioritizes a due review and then a new card.

底部保留首页、学牌、抽牌。学牌页负责自主选牌：推荐的一张、搜索、未学/已学/待巩固/花色筛选、78 张牌库。元素、数字、阿尔卡纳与宫廷牌在可展开的知识区，牌阵进阶课程在其后。右上角记录入口集中显示记忆足迹、抽牌历史、导入导出和离线准备。

Bottom navigation remains Home, Learn, and Draw. Learn supports deliberate selection: a recommended card, search, progress/suit filters, and the complete library. Foundations are expandable reference sections, followed by spread lessons. Records collect learning evidence, reading history, backups, and offline preparation.

## 4. 一张牌的完整学习 / A complete card lesson

78 张牌各有独立的图像记忆锚点、画面到含义的解释、一个近似牌对比、三个接近的干扰项。所有牌使用共同的七步流程；具体内容按牌变化，不重复填充通用段落。

Each card has an authored visual mnemonic, an evidence-to-meaning explanation, a near-card contrast, and three plausible distractors. All 78 use the same seven-step interaction structure with card-specific content.

| 环节 / Stage | 用户动作 / Action | 记录与反馈 / Evidence |
| --- | --- | --- |
| 认识 / Meet | 看完整牌面与动作联想，按需展开元素数字。 / Observe the image; optionally expand structure. | 只记开始，不算掌握。 / Encounter only. |
| 画面 / Image | 找出支持该联想的画面事实。 / Select the supporting observation. | 答案、具体视觉解释、是否看提示。 / Choice, evidence, hint use. |
| 核心 / Meaning | 在四个接近描述中辨析。 / Distinguish four close descriptions. | 明确对错与正确解释。 / Explicit correctness and explanation. |
| 回忆 / Recall | 脑中回忆后揭晓，自评四档。 / Recall silently, reveal, self-rate. | 独立存为自评线索。 / Separate self-report. |
| 对照 / Compare | 在两张真牌图之间判断。 / Choose between two real cards. | 最小差异解释。 / Explain the minimal distinction. |
| 应用 / Apply | 对照具体问题和牌位，选择相应表达。 / Match a statement to question and position. | 区分描述、阻碍与建议的职责。 / Distinguish situation, obstacle, and advice. |
| 逆位 / Reversal | 根据核心主题辨认最贴合的逆位检查。 / Identify the fitting reversal lens. | 受阻、过度、内化，不能机械反义。 / Blockage, excess, internalization—not mechanical opposites. |

学习结束后，主按钮继续下一张；也可自行选牌、再巩固或结束。本张未完成位置、答案和选项顺序可恢复；切去另一张时，原进度单独保留。

Completion offers the next card, deliberate choice, another round, or finish. Unfinished positions, answers, and option order resume; switching cards retains the previous place separately.

回访先静默回忆，再回访三个最需要巩固的能力点，改变语境与牌位。三个主题和三种牌位轮换可覆盖九种组合，不把某个主题固定成某个牌位。

Reviews start with silent recall and revisit three priority skills. Three topics and three positions rotate across nine combinations rather than permanently pairing a topic with one position.

## 5. 记忆、难度与游戏反馈 / Memory, difficulty, and game feedback

六个能力点分别调度：画面、核心、回忆、辨析、应用、逆位。SM-2 起始间隔 1 天，第二次成功 6 天，后续按难度系数增长；失败回到 1 天。初始难度系数 2.5，最低 1.3。正确客观题记 4，错误、跳过或使用提示记 2；回忆自评映射为 2/3/4/5。这是产品映射，不等于原算法所有评分语义。

Six skills are scheduled separately. SM-2 begins with 1 day and 6 days, then multiplies by ease; failure returns to 1 day. Initial ease is 2.5, minimum 1.3. Objective success maps to 4; wrong, skipped, or hinted answers to 2; recall self-ratings to 2/3/4/5. This mapping is a product adaptation.

额外约束：距最近作答不足 24 小时不增长间隔或回访成功数；失败后立即重做不清除待巩固状态。长时间离开不展示债务或处罚，先提供一个可继续的小回合。重复学习可以帮助理解，但不冒充延迟回忆证据。

Additional guard: attempts less than 24 hours after the latest attempt do not increase interval or delayed-success counts. An immediate retry cannot erase a lapse. Returning users receive a manageable round, without debt or punishment. Immediate practice is not delayed-recall evidence.

进度状态：未开始、学习中、初步理解、待巩固、已回访、能运用。“能运用”要求回忆与应用都具有至少两次延迟成功，并具有失败后的连续成功证据；它描述已观测表现，不保证永久记住。

States are Not started, Learning, First understanding, Needs practice, Revisited, and Applying it. The last requires at least two delayed successes in recall and application, with successful recovery after lapses. It describes observed performance, not permanent retention.

游戏感来自翻开未知内容、寻找证据、分清相似牌和可见积累。学习抽卡按学习状态选择；真实牌桌才用完整 78 张无放回随机。不给用户制造假稀有度、签到损失或计时压力。

Game feel comes from discovery, evidence finding, distinctions, and visible accumulation. Learning selects cards by need; real readings use random draws without replacement. No artificial rarity, streak penalties, or timers.

## 6. 牌库与基础知识 / Library and foundations

每张详情提供图像动作、形成含义的理由、正逆位、近似牌、元素数字、三主题的现状/阻碍/建议。核心内容直接显示，深入解释逐段展开。收藏仅表示想再看，读过仅表示接触过；两者均不增加学习完成或掌握。

Each dossier provides visual action, reasoning, orientation, contrast, structure, and situation/obstacle/advice for three domains. Key material is immediately visible and depth unfolds in sections. Favorites and read markers never increase completion or mastery.

基础知识可独立查阅，也在学习中就地解释。所选体系为 RWS 现代教学框架；数字与宫廷角色只是线索，不是全传统唯一解释，也不把牌面人物固定成性别或年龄。

Foundations are available as references and contextual explanations. The selected approach is a modern RWS teaching framework; number and court-role associations are aids, not universal interpretations or gender/age assignments.

## 7. 独立的随身牌桌 / A separate reading table

先看八种牌阵缩略图和能力范围，再看具体位置和边界。决定使用后，可以写问题，也可以默念；语境选择可选。洗牌、选牌、翻牌具备明确反馈和减少动态支持。

Explore eight visual spreads and their scope, then inspect roles and limits. A question can be written or held in mind; context is optional. Shuffling, picking, and revealing offer clear feedback and reduced-motion support.

解读以问题/任务、逐位参考、实际牌间关系、按牌位整合、现实核对组织。二择一逐维比较双方；关系阵区分自己与可观察互动；凯尔特十字按角色整合，不能把所有牌阵都硬套为起点—中间—终点。

Readings cover the task, positions, actual card relationships, role-aware synthesis, and reality checks. Decision spreads compare both options equally, relationship spreads separate self from observable interaction, and Celtic Cross follows its actual roles instead of a generic beginning/middle/end story.

当前是离线、可追溯的象征参考：根据实际牌、牌位及所选语境组织。输入问题被原样保存，不进行自然语言语义分析，也不上传任何服务。不会因增加“专业”标签而宣称能理解自由文本。抽牌报告不插入教学题。

This is an offline, traceable symbolic reference driven by cards, positions, and optional context. The question is preserved verbatim, not semantically analyzed or uploaded. A label cannot substitute for free-text understanding. No quizzes interrupt the reading report.

## 8. 视觉与手机交互 / Visual and mobile interaction

延续静光设计：暖白阅读面、炭墨正文、梅紫主操作；绿色正确与红色错误在文字上也明确区分。真实历史牌面完整，不裁去符号或更换版本；动效只用于选中、翻牌和进度变化。

The Moonlit system uses warm paper, charcoal text, and plum actions. Green success and red error also carry explicit text. Verified historical faces remain intact. Motion communicates selection, reveal, and progress.

一屏一个主要任务。学习页缩小但可放大的牌图，让题目和下一步在手机上更容易操作；配对题并排展示真实牌。主要触点至少 44 px，长文字换行，键盘焦点可见，支持 320 px、200% 文字与减少动态。

One primary task per screen. A compact, zoomable card keeps the question and next action reachable; comparisons show two real cards. Controls target at least 44 px, text wraps, focus is visible, and narrow widths, enlarged text, and reduced motion are supported.

## 9. 离线与资料所有权 / Offline use and ownership

公开 HTTPS 网页为手机入口，可添加主屏幕。首次由用户选择下载完整离线内容。只有程序、语言包、课程和 78 张图片通过完整清单校验，才显示准备完成；部分下载或校验失败提供重试。更新失败保留旧版，学习中不强制刷新。

The public HTTPS site is the mobile entry and can be added to the home screen. Users explicitly prepare offline content. Readiness requires the complete application, locales, curriculum, and all 78 images. Partial or failed downloads offer retry; failed updates preserve the old release without interrupting learning.

单文件 HTML 保留为备份发行物。浏览器可能清理网站数据，学习记录不会写回网页文件；导出 JSON 才是可迁移的个人备份。Git 仅接力源码，不传输私人学习、问题或抽牌记录。

Standalone HTML remains a backup artifact. Browsers can evict site data; progress is not written into the HTML. JSON export provides a portable personal backup. Git transfers source, not private learning or reading records.

## 10. 验收与仍需观察 / Acceptance and remaining evidence

发布必须通过：78 课程/图像/翻译完整性、各题合法选项与对比引用、连续学习与暂停恢复、明确错题、同日不晋级、失败后恢复、旧存档兼容、真实抽牌不重复、中英文、手机布局、离线下载失败/重试/更新/重开。

Release checks cover all content/art/translations, answer and comparison validity, continuation/resume, explicit errors, same-day guards, lapse recovery, old backups, draws without replacement, both languages, mobile layouts, and offline failures/retries/updates/reopening.

最终产品效果要由真实使用进一步验证：第二天是否还能回忆、陌生问题是否能用、是否愿意继续学。自动化通过不能证明这些效果，也不能替代塔罗教师审核、真实 iPhone、手机重启或 30 天离线实测。

Product effectiveness still needs real use: next-day recall, transfer to unfamiliar questions, and willingness to continue. Automated checks cannot establish those outcomes, teacher review, physical iPhone behavior, phone restart survival, or 30-day offline retention.

实现与测试结果以 [HANDOFF](HANDOFF.md)、[版本记录](../CHANGELOG.md) 及 GitHub Actions 为准。本方案描述本次交付行为，并明确保留上述证据边界。

Implementation and validation are recorded in [HANDOFF](HANDOFF.md), [changelog](../CHANGELOG.md), and GitHub Actions. This plan describes the delivered behavior and its evidence limits.
