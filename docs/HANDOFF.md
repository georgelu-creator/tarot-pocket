# Continue on another computer · 跨电脑接力

## 1.7.3 spread-shaped reading / 牌阵形状贯穿抽牌（2026-09-17）

- 当前工作区将已选牌、揭牌和结果统一放入所选牌阵的真实槽位；二择一五张牌不再落成通用网格，关系十字和凯尔特十字同样保留位置关系。网页中“揭牌并解读”完成翻牌后自动请求已经授权的在线解读；独立离线HTML仍不发网络请求。/ The working tree keeps each spread's actual slot map through selection, reveal and results. The web action “Reveal and read” starts the authorized online reading after reveal; the standalone HTML stays offline.
- 学牌移除自动演示和所有相关操作项，只保留牌图、直白讲解、例子和练习。/ Learning removes automatic demonstrations and their controls, retaining only cards, plain explanations, examples and practice.
- 本条为待验证实现记录：需运行完整 `npm test`、提交、推送、合并、Pages及真实手机重新验收后再更新最终状态。/ This is a pending implementation record: full tests, commit, push, merge, Pages and real-phone acceptance still need actual evidence.

## 1.7.2 mobile reading flow / 移动端抽牌与学牌控制简化（2026-09-17）

- 当前工作区把抽牌目录改成一次一个分类、紧凑用途卡与详情页完整说明；同类牌阵按张数由少到多排。扇形牌组改为密集重叠、放大后才显示顺序号，选牌入更大的可见槽；整组揭牌有短光效。补充问题会保留原牌与旧回答，并在在线会话可用时立刻重解。/ The working tree now uses one real reading category at a time, compact purpose cards with complete details after entry, count-first ordering, a denser zoom-numbered fan, larger selected slots, a short reveal cue, and save-and-reread for changed questions.
- 学牌移除学习者无用的播放、重播、看动效和跳过动效控制；必要画面强调自动进行，减少动态直接保留完整静态讲解。/ Learning removes learner-facing effect controls; necessary emphasis plays automatically and reduced motion keeps the complete static explanation.
- 本地完整 `npm test` 已通过；覆盖构建、资源、双语、20课/78牌、25场景、邀请码与模拟AI、移动浏览器流。版本、提交、CI、Pages和公开手机入口仍需按本次实际发布记录更新，不能提前称已上线。/ Local `npm test` passed; version, commit, CI, Pages and public-phone evidence remain to be recorded after the actual release.

## 1.7.1 invitation route recovery / 邀请验证线路故障（2026-09-17）

- 用户提供1.7.0入口截图：邀请码已填写，页面提示“暂时无法验证”。本机对 `tarot-ai.georgelu.cn` 两个解析节点的HTTPS检查均在TLS握手超时，未触达邀请码校验；不能把截图判成邀请码错误。
- 同项目默认域名 `tarot-pocket-ai-x1xpktdj.edgeone.dev` 当前健康检查、网页跨域预检及真实邀请码换会话成功，签名会话通过解读鉴权；从GitHub Pages来源在隔离Chromium/WebKit中发起的真实跨域会话请求也均返回200。验证没有输出凭据或调用付费模型。它之前曾在另一手机网络返回401，因此备用线路的可用性仍要以用户实机复测为准。
- 1.7.1入口在主线路网络故障时尝试备用域名，错误邀请码及限流仍直接拒绝；成功后解读与刷新沿用成功验证的线路。已移除服务的旧会话会失效，避免令牌发往不匹配的地址。前端CSP、配置脚本和抽牌主文档同步更新。Chromium/WebKit隔离回归覆盖断线、错误码、正确码、解读及刷新；旧邀请码和存档格式不变。
- 本机完整 `npm test` 通过，构建指纹 `1.7.1-175b80baefb10370`，118项离线资源；包括双浏览器故障切换、真实v1.0升级及存档保留。公网发布与实机体验是后续独立验收。
- 发布提交、主分支CI、Pages和公网手机入口的最终证据，以[1.7.1发布记录](https://github.com/georgelu-creator/tarot-pocket/releases/tag/v1.7.1)及关联Actions为准。真实iPhone/微信的两条线路仍需用户试用验证；不要用本机备用服务通过替代该结论。

## Previous release / 上一版已发布与公网验证（2026-09-17）

- 网页 **1.7.0已上线**，构建指纹 `1.7.0-c675ca1f888dfacd`。[手机更新入口](https://georgelu-creator.github.io/tarot-pocket/update.html?lang=zh&v=1.7.0-c675ca1f888dfacd)：检查并下载新版，再选择保留记录进入；沿用原邀请码。
- 发布代码提交为 `5ce2237e642213788a3230da80e964920145ad06`。PR #16、#17、[#18](https://github.com/georgelu-creator/tarot-pocket/pull/18)均经完整CI后合并；最终[主分支检查及Pages部署](https://github.com/georgelu-creator/tarot-pocket/actions/runs/35176636451)全部成功。后续仅文档提交不改变此构建指纹。
- 公开入口在Chromium和WebKit的390px手机尺寸下通过：下载和启用新版、真实邀请码跨域会话、版本匹配、20课/78牌、25场景、完整牌阵介绍、78张可达及轻点一次选入。未注入会话，未为该检查额外调用模型。
- WebKit首次公网验证遇到TLS握手失败；只读确认域名、证书正常，两个CDN解析节点及两个浏览器随后健康检查均成功。未修改配置的WebKit完整复测通过。保留这次失败为网络稳定性观察项，不能据此宣称已经修复确定的协议缺陷。
- AI服务RP-1.1.1、25场景已在原EdgeOne Git项目生产部署成功：`dpvr3y4y07kh`，同一发布代码提交。最终2个虚构问题真实调用及审读通过；这不代表全部场景或每次输出质量。
- 1.7.0附件、校验和及最终证据见[GitHub发布记录](https://github.com/georgelu-creator/tarot-pocket/releases/tag/v1.7.0)。离线HTML支持独立学牌和抽牌，在线AI使用网页入口；不得把附件当作绕过在线服务认证的方法。
- 之前两次主分支失败是历史发布阻断，已被上述最终成功记录替代。调查、只读缓存修复和原生后台安装时序复现保留在[交付记录](RELEASE_1_7.md)和PR #17/#18。原缓存清理、旧记录保留、真实v1.0升级与反向检查均保留，没有以放宽断言取得通过。
- 下一步：用户真实iPhone/微信试用，记录不懂的题干、操作和解读。浏览器手机尺寸通过不等于真实手机或长期学习效果已验证。

## Current implementation: 1.7.0 / 完整课程与场景抽牌（2026-09-16）

最新用户已授权完整实现、Git发布和移动端入口，并允许升级旧交互框架；下方仅文档阶段记录均为历史，不再限制本轮开发。

- 先读 [1.7交付与验证](RELEASE_1_7.md)，再读两个主文档末尾的实现记录。
- 学习事实源：LEARNING_MASTER LM-1.0-R4；20课、78牌编译自有效脚本，学院界面和根据实际作答补讲已接入。
- 抽牌事实源：READING_MASTER RM-1.3 / RP-1.1.1；25场景、连续牌桌、78张全可达、整组答案与恢复已接入。
- 新文案只对学习者和抽牌者说话。旧数据兼容不要求保留旧交互。
- 每轮同步有效正文、脚本、英文、测试和交接；不默默改Word教材基线，不上传私人问题、进度或凭据。
- 本地运行、CI、生产部署、实机体验和学习效果分别记录，不以一项代替另一项。
- 合并提交、CI、线上版本和真实模型验收见[1.7.0发布记录](https://github.com/georgelu-creator/tarot-pocket/releases/tag/v1.7.0)及关联Actions；本文件下方旧版本结果不代表本版通过。

## Historical reading revision: RM-1.2 / 实用场景、完整用途与手机浏览（2026-09-16）

- Read [scenario packaging](READING_MASTER.md#scenario-packaging),
  [Yes/No](READING_MASTER.md#yes-no-entry) and
  [mobile browsing](READING_MASTER.md#spread-browsing) first. / 已逐项回应用户
  Quin截图中的14类用途，形成25个场景候选；不再用“不能捏造传统牌阵”排除现代场景。
- The four additional structure proposals are a one-card Yes/No reading,
  five-card new-love spread, three equal choices, and six-card career review.
  Public sources and exact roles are recorded; Quin's private positions are not
  inferred from its thumbnails. / 4种新增结构已有公开资料依据，仍未进入应用配置。
- Purposes now explain when to use each entry and what it answers, with matching
  English. Exam, job-search and event presets focus on the outcome. Outfit ideas
  are a creative daily use; wellbeing covers daily routines and rest. / 用途不再
  压缩成“了解发展”等空话；保留基础入口，同时让新人直接找复合、考试或求职。
- The proposed mobile directory uses continuous vertical scrolling with visible
  topic shortcuts. Details show the whole layout and all positions; return restores
  the original item. This remains a prototype proposal, not a tested UI. / 连续滑动
  与主题定位为优先验证方案，不强制逐页轮播，也不宣称手机体验已经验证。
- Prompt draft RP-1.1 contains 15 scenario modules. The baseline prompt includes
  A/B/C semantics; the current API still supports only A/B. New structures, a third
  option and persistence need compatible design before implementation. / 不把文稿
  的新字段当成当前接口；新增模块还需固定虚构牌组与真实模型检验。
- This revision changes only READING_MASTER and this handoff. Existing application,
  Word, learning scripts, AGENTS and artwork remain unchanged; no model call, commit,
  push or release. / 仅更新设计文档。验证记录见主文档RM-1.2段落。
- Next: review the concrete entry descriptions and shortlist, then prototype finding
  a reunion or exam reading, asking Yes/No and comparing three choices. Keep learning
  separate; agree on the flow before UI design and development. / 下一步验证能否
  找对入口、看懂用途和得到对应问题的回答，不能只验按钮能点或动画能播。

## Previous reading revision: RM-1.1 / 场景化解读提示词 RP-1.0（2026-09-16）

- Read [the complete prompt draft](READING_MASTER.md#prompt-v1),
  [scenario requirements](READING_MASTER.md#prompt-scenes) and
  [input-variation checks](READING_MASTER.md#prompt-regression) before changing AI.
  / 已补完整主提示词、10个场景模块、6类问法要求、3组双语短示范与8项差异回归。
- Keep the actual question central. Answer outcomes and choices before advice;
  preserve spread roles and reversals, use natural concrete language, and do not
  change a conclusion merely to agree with the user's wishes. The new draft removes
  minimum-length targets and obligatory closing reminders. / 先回答所问，不把结果题
  全改成安慰或建议；按实际牌位、方向解释，不凑字数、不套统一结尾。
- Keep free-three positions unassigned across all scenario modules. A clear
  question with a compatible spread still gets answered if its domain label is
  wrong; do not invent positions or request redundant clarification. / 自由三张
  不因切到感情或工作模块就变成时间轴；问题清楚时，不因领域标签错误要求重填。
- Source reading, authored examples and model performance are separate. Existing
  code already has several correct constraints; the documented issues are static
  audit findings, not experimentally proven causes. / 作者方法不是预测准确性的证明，
  新稿质量仍待真实模型对照，不能把写好提示词当成解读已改善。
- Only READING_MASTER and this handoff were edited in this revision. No application,
  API, reference-card content, model settings, Word or learning scripts were changed;
  no live model request, Git commit or release. / 仅文档修订，未接入、未调用AI、未发布。
- Next: review the actual question-and-answer samples, then run an explicitly
  authorized model comparison using fixed fictional inputs and unchanged settings.
  Preserve raw failures and assess RD-Q and RD-PG, not only length or keyword hits.

## Previous reading draft: RM-1.0 / 抽牌主文档（2026-09-16）

- Start with [READING_MASTER.md](READING_MASTER.md#start), its
  [open decisions](READING_MASTER.md#open-decisions) and
  [latest record](READING_MASTER.md#changes). It is independent of the learning
  manuscript. / 先读抽牌主文档状态、待确认及最新记录，再读相关流程；教学另行维护。
- Authored: 43 requirements, 19 current issues, 5 preserved improvements, 12
  bilingual flow scripts, 17 proposed scenarios, 8 motion scripts, 12 recovery
  scripts and 8 fictional AI cases. Sources and spread versions are traceable;
  official descriptions, screenshots, prior isolated browser observations and
  design inferences remain separate. / 已编写要求、走查、流程、场景、动效、异常与
  AI样例；新增凯尔特简介编号不一致及单牌建议位不能冒充结果位的问题记录。
- New interaction details are proposals, not accepted implementation. Cards must
  all be reachable, not forced into a 78-card grid; ritual does not require repeated
  Continue buttons. No default first-card selection on spread introductions.
  / 全牌可达、连续扇形、单击选中、整组答案优先；旧网格和旧说明交互不代表认可。
- Validation is documented in [the actual check record](READING_MASTER.md#changes).
  Current-source checks and prior mocked-browser evidence do not prove real AI,
  new-prototype usability, physical-phone access or public deployment. / 文档检查与
  真实模型、原型、新人、手机实测分开；不能以文稿完成宣称体验已通过。
- Scope: documentation only. App, interfaces, assets, Word baseline and learning
  scripts were not edited; no commit, push or publication. Existing local learning
  work remains intact. / 本轮只改抽牌主文档及两个接力入口，保留先前未提交内容。
- Next: review the remaining proposals, validate complete interaction prototypes
  for free three-card, relationship and two-choice journeys, then UI and development
  only when authorized. Update effective text, tests, decisions and this handoff
  together in each related turn. / 文档讨论确认后做完整原型，再UI和开发；每轮同步。

## Historical revision: LM-1.0-R3 / 全稿中文与学习者视角修订（2026-09-16）

- Read [the learner-only copy contract](LEARNING_MASTER.md#learner-first-copy) and
  [R3 full-manuscript review](LEARNING_MASTER.md#chinese-walkthrough-20260916) first.
  Learning screens have one audience: the learner. Author instructions, scoring,
  routing and acceptance notes must stay internal. Do not introduce an unnecessary
  abstract term merely to explain it afterward. / 学牌只对学习者说话；普通讲解直接说清，
  内部编写、评分和路由说明不能展示，不先抛“静观”等词再解释。
- All 20 lessons and 78 card scripts have been read and revised in Chinese, including
  questions, options, feedback, support, captions and summaries. Necessary English
  changes were synchronized. No self-ratings, confidence scoring or mandatory reflections
  were added. / 全量中文走查并修订，必要英文同步；不新增自评、打分、必填感悟或换名步骤。
- The 646 question answers, stable identifiers and branch structure remain intact.
  Unit/link/asset and unchanged-Word checks were run; this is a manuscript check,
  not a real novice study or app test. / 646题答案与稳定编号保持，文稿结构和素材核对；
  不等于真人学会、专业审校或手机体验验收。
- Remaining teaching issues: easily guessed distractors, support questions that test
  another concept, heavy reliance on advice positions, and limited independent reading
  practice. Discuss and revise these before UI design. R2 proposals are historical;
  its “keep the abstract term, then explain it” approach was explicitly rejected.
  / 题型与补学问题仍待讨论，不能把文案顺了算作教学已通过；R2部分旧样稿已失效。
- No Word baseline, app, production animation, Git commit or release was changed.
  The documents remain local workspace work. / 未改Word、应用和正式动画，未提交或发布；
  本轮资料仍在本地工作区。

## Previous walkthrough: LM-1.0-R2 / 新人文案走查（历史记录）

- Read [the novice wording walkthrough](LEARNING_MASTER.md#novice-walkthrough-20260916).
  It records 13 concrete issues, simulated novice questions and proposed bilingual
  wording: first-use terms, abstract paraphrases, question/answer alignment, changing
  case facts and overloaded position names. / 已记录13项具体问题与替换样稿。
- This was a text-based cognitive walkthrough, not a real novice study or app test.
  At the time of R2, these were proposals and had not replaced the scripts. R3 now
  supersedes that status; see the latest entry above. Word and app remain unchanged.
  / R2当时只提出样稿，尚未改正文；当前以顶部R3记录为准。Word与应用未改。
- Next: discuss the wording changes and update their linked teaching, English,
  answers and support together before UI design. No commit or publishing authorized
  for this documentation discussion. / 先讨论并一致修订相关内容，再进入UI；未提交发布。

## Previous review: LM-1.0-R1 / 教学有效性复核（历史记录）

- Read [the review and proposals](LEARNING_MASTER.md#review-20260916) before treating
  the full scripts as development-ready. Sampling found common-sense distractors,
  remaining mismatched remediation objectives, and limited independent construction
  and delayed transfer checks. / 先读复核；题量完整不代表已能教会，部分补学仍换考点。
- Proposals preserve the three levels, beginner scaffolding, low input, no self-rating,
  and max-two support cycles. Priorities are question quality, objective-aligned support,
  progressively reduced hints, and varied delayed checks. / 保留已确认原则；优先修题目与补学，
  再补逐步撤提示、组织解读及延迟变式。
- No question answers, Word textbook, app or animation were changed by this review;
  no Git commit or release. Proposed revisions need discussion and representative
  text-based trials before UI work. / 仅记录评估与提议，未改原题答案、Word或应用，未提交发布；
  先讨论代表教学链路再做UI。Updated the master status and its requirements table formatting.

## Historical work: learning scripts LM-1.0 / 教学主文档阶段（2026-09-16）

- Read [LEARNING_MASTER.md](LEARNING_MASTER.md) current status and latest change log
  first, then the affected lesson/card. / 先读主文档当前状态与最新变更，再进入相关脚本。
- Authored scope: 20 method lessons (8 beginner, 6 intermediate, 6 advanced), 78
  card scripts, 646 bilingual questions including targeted support and later checks,
  motion storyboards, 46 requirement records, sources and the preserved Word baseline.
  / 已编写20课、78逐牌脚本、646道双语主练习/补练/回访题、分镜、46项要求追踪、
  来源及Word基线对照。新手先教再考，移除自评、固定三词和陌生牌必做比较。
- Text checks cover unit/question counts, anchors, local links, all 78 asset hashes
  and the unchanged Word hash. Internal cross-review corrected mismatched support
  branches and reversal explanations. This is not expert certification or evidence
  of learning effectiveness. / 已做文稿数量、链接、78图哈希、Word不变核对，并修正交叉
  审查发现的补学错配；不等于专家审校、实机验收或学习效果验证。
- New scripts are authored proposals under confirmed principles, not implemented
  lessons. No app, production animation, Git commit or release was changed in this
  task. The Word remains at `output/Tarot-Pocket-初中高级教学手册.docx`; its local
  presence does not establish cross-device or remote backup. / 本轮只改文档，具体脚本
  待用户试学；不改应用、不做正式动画、不提交发布。Word原件保留，本地存在不等于已同步。
- Next: review the actual teaching/answer/support sequence with the user, revise
  affected scripts, then proceed to UI design and implementation only when authorized.
  Keep effective text, superseded decisions, coverage and this handoff synchronized
  in each relevant turn. / 下一步先验收教学链路，再设计UI和开发；每轮相关变更同步主文档。

## Existing implementation: 1.6.0 / 既有版本（不代表新教学方案获认可）

- Full bilingual design and acceptance contract: [EXPERIENCE_V1_6.md](EXPERIENCE_V1_6.md). / 完整问题复盘、方案与验收约定见该文档。
- All 78 cards use a six-stage lesson with a fixed card position and name, plain Chinese and matching English. First lessons remove unfamiliar-card comparison and mid-course switching; old progress and backups remain compatible. / 78 张牌采用统一六环节、固定牌图和牌名，重写中文并同步英文，初学移除陌生牌比较与途中换牌，保留旧进度和备份。
- Seven sourced structures plus an explicitly unpositioned three-card mode are sorted by size. Categories change the examples and carry their topic through setup, saved draws and AI. All 78 backs remain in one continuous overview; one tap commits, one action reveals the group. New draws include reversals; old card directions remain unchanged. / 有出处牌阵加自由三牌按数量排列；分类贯穿问题、存档和 AI；78 张牌连续铺开，一点即选，一次翻开，默认逆位且不改旧牌方向。
- Result return controls and focused navigation prevent obscuring content. Interrupted group reveals and older final-card acknowledgement saves recover into the result. Returning from card details restores browsing navigation. / 结果页可直接返回，专注流程移走悬浮主导航；翻牌中断、旧版末张确认存档均可恢复，从详情返回时恢复浏览导航。
- Server prompts answer the supplied question and category with a supported outcome leaning before explaining the cards. Old generic draws stay generic; API keys and invitation/session behavior are unchanged. / 服务端先回应问题与场景，再解释整组依据；旧通用存档仍按通用解读，密钥与邀请码会话机制不变。
- Updated bilingual screenshots use isolated synthetic data. Full release checks are recorded below; CI, merge, Pages and cloud deployment are separately evidenced by the matching PR/Actions and Release. / 双语截图来自隔离合成数据；本地检查见下，CI、合并、页面和云端部署分别以对应 PR/Actions 与 Release 实际记录为准。
- Release verification: full local `npm test` passed on 2026-09-15 for `1.6.0-94eb7224761ae70d`, including Chromium/WebKit, 114 offline assets, actual v1.0.0 upgrade and all 78 authored lessons. A scan of 477 source/build files found no configured credential values. Physical-iPhone visual/offline acceptance, teacher review and long-term learning effectiveness remain unverified. / 发布检查：2026-09-15 全量 `npm test` 通过，覆盖双浏览器、114 项离线资源、真实 v1.0.0 升级和 78 张牌课程；477 个源码及构建文件未发现配置中的凭证值；未宣称 iPhone 实机离线验收、教师审校或长期学习效果。

## Previous delivery: 1.5.4 / 日签手札

- Daily result is a compact calendar sheet with a prominent saved date, weekday, real card and Embrace/Avoid reminders. Original core and orientation-specific advice remain. No sharing, AI, new spread or storage schema was added. / 日签改为日历手札，大日期、星期、真实牌图与宜忌同屏，保留原牌义和正逆位建议；不增加分享、AI、牌阵或存储结构。
- `daily-content.js` authors 312 short prompts for 78 upright/reversed cards; `locales/en-daily.json` translates all of them. These are life reflections derived from existing card meanings, not historical almanac rules. / 78 张牌共 312 条正逆位短提醒与对应英译，来自现有牌义，用于生活反思，不是传统黄历规则。
- Targeted Chromium/WebKit checks cover 320/390/1280px, both languages, original advice, historical dates, same-day persistence, reversed zoom and reduced motion. The clock is fixed only in an isolated test page for deterministic same-day checks. Screenshots use synthetic saved cards. / 专项双浏览器覆盖三档宽度、双语、原建议、历史日期、同日持久化、逆位放大及减少动态；固定时间仅用于隔离测试，截图无个人记录。
- Daily UI revision: `1.5.4-f6dec509a652cf9d`. Full local validation, PR #14 merge and Pages publication passed for this revision. Physical iPhone visual/offline acceptance remains unverified. / 本版全量本地检查、PR #14 合并与 Pages 发布已通过；iPhone 实机视觉与离线验收仍待用户验证。

## Previous delivery: 1.5.3 / 前版交付

- User reported both WeChat and Safari invitation failures and supplied a real `OPTIONS /api/session` response with HTTP 401 from the EdgeOne default domain. A desktop probe returned 204 and the configured invitation issued a session, so the previous check missed the network-specific platform restriction. / 用户提供真实预检 401；桌面预检及邀请码验证通过，之前验证遗漏默认域名的网络区域限制。
- Added `tarot-ai.georgelu.cn` to the existing AI project, verified domain ownership and added its CNAME. Managed HTTPS certificate provisioning and live acceptance are tracked below. The pre-existing incomplete `tarot-api.georgelu.cn` entry was left unchanged. / 已为现有 AI 项目添加独立子域名、验证归属并添加解析；证书和实测结果见后续记录，未删除原有未完成域名配置。
- Local endpoint and CSP now target the custom domain. Authentication, secrets, server prompts and saved records are unchanged. / 本地接口与 CSP 同步切换，未改动鉴权、密钥、提示词或存档。
- Live service verification on 2026-09-15: custom-domain HTTPS health 200; session and reading OPTIONS 204 with the exact GitHub Pages origin; invalid invitation 401 without a session; the configured valid invitation 200 with a session. No credential was logged and no paid model call was made. / 新域名 HTTPS、两条接口预检、错码拒绝与正确邀请码签发均通过；未输出凭证、未调用付费模型。
- User confirmed the new `/api/health` URL returns `ok: true` on the phone network that previously failed. This confirms that network path only; full invitation entry on the updated phone app remains to be checked after publication. / 用户确认此前失败的手机网络可以访问新域名健康接口；这仅证明该网络路径可达，更新后完整手机登录仍待发布后验证。
- Full local `npm test` passed for `1.5.3-f9d0eba0c8624368`, including both browsers, invitation sessions, 113 offline assets and actual v1.0.0 upgrade preservation. GitHub CI, merge and Pages publication must be checked in the matching PR/Actions. / 本地全量检查通过，含双浏览器、邀请会话、113 项离线资源及真实旧版升级存档保持；GitHub CI、合并与 Pages 发布以对应 PR/Actions 为准。

## Previous delivery: 1.5.2 / 前版交付

- Home uses shared desktop rows for equal primary cards and aligned illustrations, headings and arrows. Self-selection, resume and review remain available below learning. / 首页桌面主卡片等高，插图、标题、箭头对齐；自选、续学、复习入口仍可用。
- The shuffle now has a 6.8-second spread, scatter, crossing and gathering sequence, with bilingual phase labels. Visual trajectories are decorative; the saved 78-card pool, cut, skip, resume and reduced-motion contracts are unchanged. / 洗牌改为 6.8 秒摊开、打散交错、收拢，含双语阶段提示；视觉路径不更改已保存牌序，切牌、跳过、恢复与减少动态的约定保持兼容。
- Focused Chromium/WebKit checks passed at 320/390/1280px for shuffle geometry and at 320/390/768/1280px for bilingual home alignment, including long card names and resumed lessons. The swipe checks include native touch, focus, candidate restoration and unchanged placed-card nodes; AI waiting checks use local mock responses. Full release validation and publication are tracked by this version's PR/Actions and Release. Physical iPhone remains unverified. / 专项 Chromium/WebKit 检查通过：洗牌 320/390/1280px，首页双语对齐 320/390/768/1280px，含长牌名和续学。滑动专项另覆盖真实触摸、焦点、候选恢复及已入位牌节点稳定；AI 等待使用本地模拟响应。完整发布检查与上线记录见本版本 PR/Actions 和 Release；iPhone 实机仍未验证。

- Card selection now uses native horizontal swiping with snap alignment. All 78 card backs stay mounted; tapping lifts a candidate, confirmation places it, and returning restores the same group and cards. Previous/next buttons remain keyboard alternatives. / 选牌支持原生横向滑动与吸附，78 张牌背保留在同一滚动区域；轻点抬起、确认入位，返回恢复原组与牌序，保留前后按钮供键盘操作。

- AI reading waits include gentle card motion and rotating observation tips. A longer-wait message appears after 25 seconds; cancellation and immediate answer display remain. Tips are not model progress. / AI 等待期间显示轻柔牌面动效与轮换观察提示，25 秒后明确说明仍在等候；可取消，答案返回即显示，不将提示冒充模型进度。

- Placed cards no longer reanimate when another candidate is tapped; keyboard paging keeps focus, disabled controls have no press animation, and reduced motion covers legacy feedback scrolling. Current bilingual screenshots and the ritual recording replace the old README gallery. / 切换候选不再重播已入位牌的动画，前后组按钮保留键盘焦点，禁用按钮无按压动效，旧课滚动遵守减少动态；README 同步本版双语截图与抽牌录屏。

- Full local `npm test` passed on 2026-09-15 for `1.5.2-1cf49f4c0c0d7ade`, including all 113 offline assets and the actual v1.0.0 upgrade. Independent UI review found no P1/P2 blockers. GitHub CI, merge and deployment must be confirmed in the matching PR/Actions; no physical-iPhone or VoiceOver acceptance is claimed. / 2026-09-15 本机全量检查通过，含 113 项离线资源及真实 v1.0.0 升级；独立 UI 审查未发现 P1/P2 阻断。GitHub CI、合并和部署以本版 PR/Actions 的实际结果为准；未宣称 iPhone 实机或 VoiceOver 验收。

## Previous delivery: 1.5.1 / 前版交付

- The shareable invitation is now an 8-character, case-insensitive code deterministically derived from the long server signing secret. Users no longer copy the long token; `tools/write_invite_code.cjs` writes the short code to a private ignored file for the maintainer. / 分享给用户的是从长服务端签名密钥确定性派生的 8 位短邀请码，不区分大小写；用户不再复制长 Token，维护者可用 `tools/write_invite_code.cjs` 写入本机私有忽略文件。

- The hosted app is protected by one bilingual invitation gate. A valid 8-character invitation is exchanged through `/api/session` for a signed 12-hour, tab-scoped credential; neither the short invitation nor long signing token can call `/api/reading`. / 托管网页使用统一双语邀请码入口；`/api/session` 将有效的 8 位短邀请码换成签名的 12 小时标签页会话，短邀请码和长签名 Token 都不能直接调用解牌接口。
- Individual readings have no connection-code or API-key UI. The current question is shown as the reading focus and is sent with A/B labels, spread ID, actual cards, positions and reversals after the user explicitly requests a complete reading. / 单次解牌不再出现连接码或 API Key；页面显示本次问题，用户点生成后自动随选项、牌阵、实际牌位、牌与正逆位发送。
- The provider key and long signing token remain server-only. The short invitation exists only in the entrance request; the temporary session lives in `sessionStorage`, is excluded from all three existing product stores and exports, and is cleared on authorization failure. / 供应商密钥与长签名 Token 不进前端；短邀请码只存在于入口验证请求，临时会话只在 `sessionStorage`，不进入既有三个存储键或备份，鉴权失败立即清除。
- Validation on 2026-09-15: full local `npm test` passed, including 113 offline assets, Chromium/WebKit, the v1.0.0 upgrade and the bilingual invitation flow. A review then received focused passing AI/server and cloud checks for missing-secret file preservation, case-insensitive invitation leak rejection and raw-short-code authentication rejection. Independent code review found no remaining release blockers. PR #10 and the merged main commit passed full CI; production evidence follows below. No physical iPhone test is claimed. / 2026-09-15 本机完整 `npm test` 通过，含 113 项离线资源、Chromium/WebKit、v1.0.0 升级及双语邀请码流程；审查修复后的 AI 服务与云函数专项检查通过，覆盖缺失密钥不覆盖私有文件、大小写邀请码防泄漏及短码直调被拒绝。独立复核无剩余发布阻断。PR #10 与合并后的 main 均通过全量 CI；线上证据如下。未宣称 iPhone 实机验收。

### Published 1.5.1 / 发布验证

- [PR #10](https://github.com/georgelu-creator/tarot-pocket/pull/10) merged as `3f57852`; [main checks and Pages deployment](https://github.com/georgelu-creator/tarot-pocket/actions/runs/34943132609) passed. [Release v1.5.1](https://github.com/georgelu-creator/tarot-pocket/releases/tag/v1.5.1) contains the standalone HTML and SHA256SUMS; a fresh download matched its checksum. / PR #10 已合并为 `3f57852`，main 全量检查与 Pages 部署通过；Release 已发布独立 HTML 和校验文件，重新下载后哈希一致。
- Public build `1.5.1-ee9ea82b7293763e` passed a 390px desktop WebKit check: lowercase short invitation accepted, eight-character entrance, same-tab reload without another invitation, and no horizontal overflow. / 公网构建通过 390px 桌面 WebKit 验证：小写短邀请码可进入、入口限八位、同标签刷新免重输、无横向溢出。
- Live EdgeOne checks rejected wrong invitations and the old long token at `/api/session`; neither raw short code nor long token could authorize `/api/reading` (401), while a signed session reached payload validation. A public UI request to DeepSeek returned a displayed 1,677-character reading addressing an invented photography-learning question and both choices. No real personal reading, credential or session was published. / 线上接口拒绝错误邀请码及长 Token；短码和长 Token 直调解牌均为 401，签名会话通过鉴权。公网 UI 的真实 DeepSeek 请求返回约 1,677 字，回应虚构的摄影学习问题与两个选项；未发布私人解读、凭据或会话。
- Next acceptance remains physical iPhone Safari and extended offline use; desktop WebKit and CI do not establish those outcomes. / 下一步仍是 iPhone Safari 实机及长期离线验收，桌面 WebKit 和 CI 不代替实机证据。

### Previous verification: 1.5.0 / 前版验证

- Automated checks cover wrong and valid invitations, signed-session expiry/tampering, refusal of the raw invitation at the reading endpoint, exact question payloads, reload, cancellation, offline saved answers and bilingual mobile UI. PR #8 passed the full CI and deployed commit `568a383` on 2026-09-15. The public 390px WebKit flow exchanged the invitation, survived reload in the same tab, and a synthetic DeepSeek request returned 1,330 Chinese characters addressing both choices; raw-invitation reading returned 401. Physical-iPhone acceptance remains separate and unverified. / 自动检查覆盖错误与正确邀请码、会话过期及篡改、解牌接口拒绝原邀请码、完整问题载荷、刷新、取消、离线回看和双语手机 UI。PR #8 全量 CI 通过并于 2026-09-15 发布提交 `568a383`；公网 390px WebKit 已验证邀请码换会话、同标签刷新免重输，合成问题的 DeepSeek 解读返回 1,330 字并回应两个选项，原始邀请码直调为 401。iPhone 实机仍须另行验收。

## Previous delivery: 1.4.0 / 前版交付

- Home learning now starts a random unstarted card; Resume and Choose a card are separate. Paused sessions stay recoverable. / 首页随机学习还没开始的牌；继续、自选分开，暂停课程仍可恢复。
- `guided-major.js` and `guided-minor.js` contain 78 authored observation/reasoning/reversal/recall guides with matching English files. `guided-learning.js` / `.css` provide the phone UI; `journey.js` creates `playVersion: 4` sessions. / 78 张独立引导与英文已齐，新会话采用 v4。
- New path: observe, reason, explain the framework, distinguish a near card, change the position within one question, use background for reversals, then reconstruct with cues hidden. Open understanding, comparison, position application and recall are explicitly self-assessed; objective causal/reversal choices explain each option. / 七步围绕理解；开放题明确自评，有判据的题才判对错并解释。
- Review found and fixed untracked answer references, a cue leaking into independent recall, leading question prompts and ambiguous neighboring-card advice marked wrong. Assistance is recorded; different valid position readings are not forced into a false exclusive answer. / 复查修复提示绕过、回忆泄漏、题干暗示及错误排除合理建议的问题。
- Compact guides retain sourced definitions and show all names for up to five positions. The AI connection form explains the separate service code and supports in-place correction; token persistence and backend settings are unchanged. / 紧凑牌阵保留定义，五张内名字直接可见；连接码有解释和更正入口，仍只存内存，后端不变。
- Existing three storage keys and JSON backup format remain. Optional `guided` state and bounded `reflections` live inside the existing journey. Old v1–v3 sessions retain their flow and offer an explicit new-course switch. / 保留原键和备份，新增分步状态与短记忆句；旧课可继续或明确切换。
- Tests: `check_guided_v14.cjs` covers all 78 cards, 156 authored questions, 468 position contexts, exact reload, honest assistance/self-assessment and random exploration. `check_reading_connect_v14.cjs` checks 7 guides at 320/390px and mocked AI connection/auth/save/cancel paths. Older course assertions remain under explicit legacy fixtures. / 专项检查覆盖内容、恢复、自评、随机、紧凑 UI 与模拟联网；旧断言继续验证旧存档。
- Full local `npm test` passed on 2026-09-14 (111 offline assets), including both browser engines and the actual v1.0.0 upgrade. A final display-only label now says Consolidating through review instead of claiming application ability from self-report; focused content/flow checks cover that change. Full checked-commit CI and public deployment are recorded by the matching v1.4 PR and Actions. / 本机全量通过，含 111 项离线资源、双引擎与真实旧版升级；最终状态文字改为“持续巩固”，避免以自评宣称能运用，另做针对检查。最终提交 CI 和上线以本版 PR 与 Actions 为准。
- Two configured secrets were compared in memory against 427 public source/build files; no matches. / 两项私有凭证仅在内存对照 427 个公开源码与构建文件，未发现泄漏。
- Real iPhone acceptance, independent tarot/translation review and delayed retention remain unverified. The offline course is authored guidance, not a live AI tutor; no real provider call was made for this frontend change. / 实机、独立专业审校与延迟记忆仍待验证；离线课不是实时 AI 导师，本轮未调用付费模型。
- Next useful acceptance: update without clearing records, use random new learning and explicit resume, finish a card, return the next day without hints, and check the compact spread guide on the actual phone. / 下一步：保留记录更新，实机随机新学与续学，完成后隔天无提示回忆，并查看紧凑牌阵。
- Design and rationale: [EXPERIENCE_V1_4.md](EXPERIENCE_V1_4.md). / 设计与依据见完整体验说明。

## Previous delivery: 1.3.0 / 前版交付

- UI-focused release: held shuffle/cut animation, six large candidates per page, tap/confirm placement and large sequential reveals with unlimited viewing time. / 本轮聚焦 UI：洗切等待、六张大牌背、候选确认及逐张大图观看。
- New lesson `playVersion: 3` adds image-first observation, evidence-to-meaning links and editable close-card matching. Existing v1/v2 sessions retain their original steps; first-attempt memory scores remain unchanged by a guided retry. / 新玩法兼容旧课程；引导后重练不改写首次成绩。
- All 78 original bilingual guide paragraphs live in `card-notes.js` / `locales/en-card-notes.json`; `dossier.css` and the card sheet in `app.js` provide chapter navigation, context matrices and visual comparisons without replacing the sheet on every tap. / 78 张双语解说及图文资料页，切换时不重建整页。
- `reading.js` keeps the existing three application storage keys and adds optional candidate/page/reveal fields inside the existing reading record. Normal motion, skip and reduced motion preserve the already randomized result. / 沿用既有存储键，新增可选候选、页码、翻牌字段，动效路径不改变牌序。
- The backend prompt, AI service settings, spread catalog and memory scheduling rules are unchanged. Question-grounded interpretation-quality refinement is deferred to the next independent task after this UI delivery. / 本轮不修改模型提示、AI 配置、牌阵目录或记忆调度；针对问题的解读质量优化留待后续。
- Design and source references: [EXPERIENCE_V1_3.md](EXPERIENCE_V1_3.md). Real isolated screenshots and the normal-motion recording are under `docs/images/*v13*`; reproduce with `node tools/capture_ritual_v13.cjs`. / 设计依据、真实截图及录屏可在仓库继续复现。
- Validation: full local `npm test` PASS on 2026-09-14 for `1.3.0-8d1beedff364d94d` (107 offline assets). It includes 14,040 legacy configurations, 702 new contextual configurations, all 78 expanded bilingual guides, normal/reduced ritual and save/resume checks, desktop WebKit 320/390px actual face visibility, Chromium/WebKit offline checks and upgrade from the actual v1.0.0 build. / 最终完整本机检查通过；含旧题、新情境、78 张图文资料、动效与续用、WebKit 正面可见性、双浏览器离线及真实旧版升级。
- A WebKit visual check caught a temporary card back covering the revealed face despite successful image decode. The fix removes the temporary 3D layer at the end of the turn; `check_reveal_webkit.cjs` now checks decoded faces, hit visibility, reduced motion and reload recovery. Real 320/390px screenshots were inspected. / 目视抓到 WebKit 翻牌遮挡，已修复并加入正面可见性、减少动态及重载回归；320/390px 实图已核对。
- Two configured credentials were checked in memory against public source and built files; zero matches were found. Credentials and private questions remain excluded from the repository. / 内存读取配置完成公开文件扫描，未发现实际密钥或访问码；私人内容不入库。
- Publication: this handoff is prepared before the single UI publication. The matching v1.3 pull request and Actions checks record the checked commit and Pages deployment; a runtime build ID identifies the installed copy. / 接力文件在统一发布前准备，具体提交、检查与 Pages 上线以 v1.3 PR 和 Actions 回执为准。
- Next physical-phone check: update while retaining records; pause in the middle of a draw, reopen, pick another candidate, finish all reveals, and browse a card without scroll jumps. Then test offline reopening after downloading the new complete pack. Desktop WebKit is not a physical iPhone test. / 下一步实机：保留记录更新、中断续抽、更换候选、完整翻牌、单牌查阅不跳页；下载完整包后再测断网重开。

## Previous delivery: 1.2.0 / 前一版交付

- Seven sourced spread structures plus daily tarot; nineteen earlier templates remain solely for saved-record compatibility. `decision-five` uses 1→2→4 and 1→3→5. See [sources](SPREAD_SOURCES.md). / 七种有出处结构及日签；十九个旧定义仅兼容历史记录。
- Compact guides; whole-spread interpretation precedes optional card details, which can be deselected. Offline references are collapsed. / 压紧介绍；整组解读优先，单牌可取消选中，离线参考默认收起。
- Optional DeepSeek/OpenAI backend, explicit requests, cancellation and honest error states. Answers are saved inside existing reading records; access codes remain in memory and provider keys remain server-side. / 可选服务端 AI；主动请求、取消、错误状态与回答保存；访问码仅内存，密钥仅服务端。
- A real DeepSeek official call returned a 1,407-character coherent reading for a generic study-choice fixture on 2026-09-14. This is a live smoke check, not expert-quality certification. No private reading was sent or committed. / 通用学习案例真实调用成功，不代表专家质量验收。
- Final connected-version npm test PASS on 2026-09-14, revision `1.2.0-29c832a21f5bcac2`, 105 offline assets. Coverage includes all 78 courses, bilingual UI, sourced positions, all 19 legacy reading records, AI request/auth/error/cancellation behavior, safe answer formatting, Chromium/WebKit offline checks and the actual v1.0.0 upgrade. A scan of 391 source/distribution files found zero matches for the real provider key or access code. Physical iPhone acceptance remains unverified. / 接通服务的最终版本完整检查通过；391 个源码及发行文件未包含真实密钥或访问码，仍非 iPhone 实机验收。
- The AI service is deployed to Tencent EdgeOne Makers in the overseas region, using project `tarot-pocket-ai`. The verified endpoint is `https://tarot-pocket-ai-x1xpktdj.edgeone.dev/api/reading`: HTTPS health 200, preflight 204 with exact frontend origin, missing access code 401, and a synthetic five-card request with reversals returned DeepSeek `deepseek-flash` text (1,081 characters) on 2026-09-14. Preview auto-deployment is disabled. Public-page publication is recorded separately below. / 境外云服务真实调用通过；精确来源与鉴权已核验，预览自动部署关闭，网页发布另行记录。
- Cloud integration is documented in [EDGEONE.md](EDGEONE.md). Actual CLI 1.6.28 bundling was tested, including explicit `onRequest` discovery, the platform's parsed-body wrapper and warm-instance limits. Node HTTP cancellation propagates; the platform wrapper removes browser abort signals, so cloud work can continue until completion/timeout after the UI stops waiting. / 已验证实际打包器差异；云端取消限制如实记录。
- Git/production receipt: [PR #5](https://github.com/georgelu-creator/tarot-pocket/pull/5) records the final checked head and public-browser verification; its checks and [Actions](https://github.com/georgelu-creator/tarot-pocket/actions) are the live publication status. The runtime revision above identifies this build independently of documentation-only commits. / 最终提交、上线浏览器核验与发布状态通过 PR 和 Actions 追踪；运行版本号不受纯文档提交影响。
- The optional custom API hostname is not active: Tencent accepted ownership verification but returned an abnormal/empty CNAME target. The application therefore uses the verified provider hostname above. Existing DNS records were preserved. Do not switch `ai-config.js` until any replacement hostname passes HTTPS, auth, CORS and a live request. / 自定义 API 域名的腾讯云 CNAME 返回异常，应用使用已验证的托管地址；原 DNS 记录保留，更换地址前必须重新核验。
- Next useful acceptance: open the published update link on the physical phone, enter the separate service access code from private `server/.env`, draw and request a reading, then verify saved answers after reopening offline. Never copy the provider key into the app or commit either credential. / 下一步：手机实测更新、独立访问码、整组解读与断网重开；密钥及访问码不提交 Git。

[English README](../README.md) · [中文首页](../README.zh-CN.md) · [Development / 开发](DEVELOPMENT.md)

## Current project card · 当前项目接力卡

| Field / 字段 | Baseline / 当前基线 |
| --- | --- |
| Project / 项目 | Tarot Pocket · 塔罗随身学 |
| Canonical repository / 正式仓库 | [georgelu-creator/tarot-pocket](https://github.com/georgelu-creator/tarot-pocket) |
| Release target / 发布版本 | v1.5.3 invitation connectivity / 邀请验证连接修复 |
| Goal / 目标 | Help learners remember cards and understand spreads through image-based, low-typing practice / 用牌图与少输入交互，帮助记牌并理解牌阵 |
| Product stage / 阶段 | Installable mobile website; native app not included / 可安装手机网页，未包含原生 App |
| Source baseline / 源码能力 | 78 variable seven-stage courses, 56 further steps, 7 sourced spreads + daily tarot; optional server-side AI / 78 套七步变式课、56 步进阶、7 种有出处牌阵与日签；可选服务端 AI |
| Deep-course coverage / 深课覆盖 | 78 authored memory anchors, explanations, contrasts and 234 close distractors / 78 组专属助记、依据、对比及 234 个接近干扰项 |
| Persistence / 保存 | Local browser state plus explicit JSON backups; no account or cloud sync / 本地浏览器记录与手动 JSON 备份，无账号或云同步 |
| Review scheduling / 复习 | SM-2 per skill with same-day guard; old quick practice retains legacy rule / 新流程按能力点 SM-2 调度并限制同日晋级，旧快练规则保留 |
| Device acceptance / 设备验收 | iPhone Safari and long-term phone offline use remain unverified / iPhone Safari 与手机长期离线仍待实机验证 |

The source baseline describes implemented features, not proof of a successful deployment. Use the repository's [Actions](https://github.com/georgelu-creator/tarot-pocket/actions), [Releases](https://github.com/georgelu-creator/tarot-pocket/releases), and actual [demo](https://georgelu-creator.github.io/tarot-pocket/) to check the state you receive. A pending job or an uploaded file is not a completed browser acceptance test.

源码能力不等于部署已成功。接手时分别查看 Actions、Releases 和实际演示；排队中的任务或已经上传的文件，不能代替浏览器验收。

### v1.1.0 checkpoint · 自主性与仪式感接力

- Product decisions and primary learning references: [EXPERIENCE_V1_1.md](EXPERIENCE_V1_1.md). / 本轮产品构思与一手学习参考见体验方案。
- New / Continue / Review use different queues. Unseen-only random recommendations replace hardcoded p04/m16 priority. All 78 cards remain directly selectable. / 新学、继续、复习分开；移除固定首牌，78 张可自选。
- Visual game variants, four-suit number and court families, and visible three-position applications; old sessions retain original semantics. / 视觉变式、数字与宫廷四花色对照、可见三位应用；旧课存档题意保留。
- Card sheets retain DOM, open sections, scroll and current favorite state through orientation/position changes, zoom and comparisons. Search and filters retain focus. / 资料不重建，放大与对比保留位置并更新收藏；搜索筛选保留焦点。
- 23 scenario spreads plus a local-date daily card, stored under the existing reading key. Every shuffle/cut/pick/reveal stage exits and resumes without rerolling. Distinct rapid taps are accepted; duplicate outcomes are blocked by state. / 23 场景阵加本地日期日签，仍用旧键；洗切抽翻可退可续，快速操作不丢，重复结果由状态排除。
- Dedicated update.html bypasses the old root-navigation cache. It verifies the full release before explicit activation, without clearing records or refreshing other active tabs. / 独立更新页绕过旧首页缓存，完整校验后明确切换，不清记录或刷新其他在用页面。
- CI checks out full history because the upgrade test builds the actual v1.0.0 tag. New browser checks are included in npm test. / 升级回归构建真实旧标签，因此 CI 取完整历史；新增浏览器检查纳入完整测试。
- Local validation on 2026-09-14: full npm test PASS for revision 1.1.0-32020928a8dff743 (103 offline assets). It covers 14,040 learning configurations, both languages, 23 scenario reading flows plus daily tarot, actual animation transforms, reference DOM/scroll/focus, backup compatibility, Chromium/WebKit offline behavior and a real v1.0.0 upgrade preserving unfinished records. / 本地全量通过：14,040 学习配置、双语、23 场景与日签、实际动画、资料原位、备份、双引擎离线及真实旧版升级。
- Visually inspected isolated mobile home, picture-choice lesson, scene gallery, shuffle, cut and fan screens. The fan appears within the mobile viewport with compact placement slots. / 已目视检查隔离手机首页、识图题、场景列表、洗牌、切牌与扇形选牌；选牌时使用紧凑位置预览。
- Publication: the matching PR, CI and deployment are tracked in GitHub Actions and Releases; public runtime verification follows deployment. / 发布状态以对应 PR、Actions 和 Releases 为准；部署后核对公网实际版本。
- Next useful work: physical iPhone update and next-day return, motion on the actual device, independent tarot/translation review and learning transfer. / 下一步实证：iPhone 更新、隔日续学、实际设备动效、独立审校与迁移效果。

### v1.0.0 checkpoint · 连续学习交接

- Scope and design: [PRODUCT_PLAN.md](PRODUCT_PLAN.md) contains the bilingual product contract and primary industry references. / 双语完整方案与一手行业参考见产品方案。
- `curriculum-content.js` supplies all 78 card-specific memory anchors, visual explanations, comparisons and 234 distractors. `journey.js` runs seven-stage first lessons and shorter adaptive reviews. / 所有牌具有独立助记与对比，初学七步，回访按薄弱能力安排。
- Main key `tarot-pocket-demo-v1` now has optional `journey` with card skills, active and paused sessions. All three old keys and backup identifiers remain. Legacy backups without journey preserve existing new learning. / 三个旧键及备份标识不变，旧备份缺字段时保留新进度。
- Self-report, objective exercise performance and delayed recall remain distinct. Same-day retry cannot advance intervals or erase a lapse. / 自评、客观题与延迟回忆分开；即时重做不能晋级或消除失败记录。
- Real drawing accepts an optional question and optional wording domain, uses all 78 cards, and generates role-aware symbolic references from actual drawn cards. Typed questions remain local and are not semantically analyzed. / 真实抽牌问题可选，按实际牌与牌位解读；不做自由文本语义解析。
- Offline preparation is explicit. Modular web build caches the full verified release and adds home-screen installation; standalone is retained. Updates never force a reload of active learning. / 明确下载完整离线内容，可添加主屏幕；保留单文件，更新不强制打断学习。
- Local verification on 2026-09-11: full `npm test` passed, including all 78 curricula, 3,510 question configurations, continuous learning and backup flows, bilingual UI, eight readings, responsive design and offline checks in Chromium and WebKit. WebKit tests disconnect every request to the app origin because Playwright offline emulation fails in an independently reproduced minimal control app. This is not physical iPhone acceptance. / 2026-09-11 本地完整检查通过：78 套课程、3,510 种题目配置、连续学习与备份、双语、八阵、布局和双浏览器离线。WebKit 用断开全部本站请求验证，因其离线模拟在最小对照中同样失败；仍不等于 iPhone 实机。
- Next useful evidence: physical phone start/close/reopen and backup round trip; independent course/translation review; next-day learning transfer. No account, cloud service or App Store release is implied. / 下一步是手机实机闭环、课程审校与隔天迁移效果，不默认开发账号、云服务或上架。

### v0.5.0 mobile-flow checkpoint · 移动流程接力检查点

- The home screen now has two primary decisions: Learn and Draw. Records are in the
  top bar, and the bottom navigation contains Home, Learn, and Draw. / 首页只保留学牌
  与抽牌两个决定；记录放在顶栏，底部导航收为首页、学牌、抽牌。
- The library is the learning home: it shows learned/due counts, New/Learned filters,
  richer card summaries, a deliberate learned marker, and element/number references.
  Existing advanced units remain in an optional collapsed section. / 牌库成为学习主页，
  展示已学与待复习、未学/已学筛选、丰富卡片简介、主动学过标记及元素/数字知识；原能力
  单元收在可选折叠区。
- Drawing starts with eight visual spread thumbnails and scope. Selecting a spread
  opens its limits, positions and reading order; only then does the user write a real
  question, choose a wording context and shuffle. / 抽牌先看 8 个牌阵缩略图与能力范围，
  进入说明后才填写真实问题、选择措辞语境并洗牌。
- A completed reading now uses five stages: task, position readings, card relationships,
  throughline, and reality checks. Teaching prompts are not shown inside the professional
  report. Card-specific practice ends with a direct Learn the next card action. / 完整
  解牌采用任务、逐位、牌间关系、主线、现实核对五步，专业报告不混教学；单牌练完可直接
  进入下一张。
- Storage keys, stable IDs, content, historical card faces and the build pipeline remain
  compatible. The existing main state accepts an optional learned-card list, and reading
  drafts/history accept an optional local question string; older backups remain valid.
  / 存储键、稳定 ID、内容、历史牌面与构建流程保持兼容；主记录新增可选学过列表，抽牌草稿
  与历史新增可选问题文本，旧备份仍可导入。
- See [the bilingual UX feedback log](UX_FEEDBACK.md) for the six reported issues and
  their UI response. Full local `npm test` covers 78 images, 56 guided steps, 24 quick
  questions, eight live spreads, bilingual rendering, offline Chromium, backup round trips,
  and 320/375/390/430/1280 widths. Physical iPhone Safari remains unverified. / 六条问题与
  对应改动见双语体验记录；本地完整检查覆盖内容、抽牌、双语、离线、备份与多宽度，仍不
  等于 iPhone Safari 实机验收。

### v0.4.0 design checkpoint · 设计接力检查点

- Completed on `design/moonlit-system`: adapted the supplied Moonlit visual system,
  shared design tokens, an engineered celestial card back, focused drawing with an
  exit and skip action, reduced-motion/opaque-material fallbacks, and refreshed gallery.
  / 已完成静光视觉适配、公共样式令牌、几何天体牌背、带退出和跳过操作的专注抽牌、
  减少动态与实体材质回退，以及新版展示图。
- Reuse [the bilingual design contract](design/README.md). The four original supplied
  files are archived with matching hashes; generated concept PNGs are not production
  screenshots or historical RWS faces. / 后续复用双语设计规范；四份原始文件按哈希原样
  归档，生成式概念图与真实界面截图、历史 RWS 正面分别标明。
- Preserved: all 78 historical faces and their hashes, existing lessons and spreads,
  Chinese/English behavior, three storage keys and JSON backup compatibility.
  / 保留 78 张历史牌面及哈希、既有课程和牌阵、中英文行为、三个存储键与 JSON 备份兼容。
- Local validation on 2026-09-11: full `npm test` passed asset, locale, card-back,
  practice, lesson, reading, backup, layout, offline and design checks. Added checks
  cover the visible home action, stacked shuffle cards, skip without reroll, rapid
  reveal, language/resume stability, reduced motion, large text and opaque contrast
  fallback. / 本地完整检查通过，新增检查覆盖首页主按钮、洗牌叠放、跳过不重抽、快速翻牌、
  切语言与续接、减少动态、大字及实体高对比回退。
- Visual inspection used isolated desktop Chromium data: English home, lesson,
  reading and gallery, plus the card back at small widths. Automated layout checks
  include Chinese/English at 320, 390, 430 and 1280 px; this is not an iPhone test.
  / 视觉检查使用隔离桌面 Chromium 数据，观察英文首页、课程、解读、展示图及小尺寸牌背；
  自动布局检查包含中英 320、390、430 与 1280 px，不等于 iPhone 实测。
- Delivery evidence: [v0.4.0 release](https://github.com/georgelu-creator/tarot-pocket/releases/tag/v0.4.0),
  [CI/Pages workflow](https://github.com/georgelu-creator/tarot-pocket/actions/workflows/ci.yml)
  and [public demo](https://georgelu-creator.github.io/tarot-pocket/?lang=zh).
  Check those actual states separately from this source checkpoint. / 发行附件、CI/Pages
  与实际页面各自提供发布证据，本源码检查点不能代替其真实状态。
- Next action: try a full lesson and a three-card draw on the actual phone, including
  language switching, pause/resume and reduced motion; collect concrete friction
  before expanding courses or choosing a native platform. / 下一步在实际手机上体验完整课程
  和三牌抽取，包含切语言、暂停恢复与减少动态，收集具体卡点，再决定课程或平台扩展。

## Start at home · 回家后的第一步

On a new computer:

新电脑首次使用：

```sh
git clone https://github.com/georgelu-creator/tarot-pocket.git
cd tarot-pocket
git remote -v
git status --short --branch
git log -1 --oneline
```

Read `AGENTS.md`, this file, and [DEVELOPMENT.md](DEVELOPMENT.md). Follow the setup there, build the demo, and run the checks before editing. Confirm the remote is the repository above; a familiar folder name alone does not establish identity.

先读 `AGENTS.md`、本文件与开发指南，再准备环境、构建、检查。确认 remote 确实指向上面的仓库；文件夹名字相同不能证明仓库相同。

For an existing checkout, inspect first:

已有克隆先检查：

```sh
git status --short --branch
git remote -v
git branch --show-current
```

Only with a clean working tree, switch to the default branch and update without rewriting history:

工作区干净时，切回默认分支，再按快进方式更新：

```sh
git switch main
git pull --ff-only
git switch -c work/next-learning-improvement
```

The branch name is an example; choose one matching the actual task. If there are local edits, preserve them on their current branch before updating. If fast-forward fails, inspect the divergence. Do not reset, clean, force-push, or overwrite somebody else's work to make the checkout look current.

分支名是示例，请按实际工作命名。若有本地改动，先保留在当前分支；快进失败时检查分叉原因，不要用 reset、clean、强推或覆盖他人改动来强行同步。

## Move learning progress separately · 学习进度单独迁移

1. On the original browser, open **My progress → Export** and save the JSON privately. / 在原浏览器打开 **我的 → 导出**，私下保存 JSON。
2. Transfer it through your own trusted file channel, outside this public repository. / 通过自己的可信文件渠道传到新电脑，不要放进公开仓库。
3. Open Tarot Pocket in the destination browser. If it already has records, export those first. / 在目标浏览器打开项目；若已有记录，先导出目标端备份。
4. Import the original JSON, review the replacement summary, and confirm. / 导入原 JSON，查看替换摘要后确认。
5. Check the lesson step, saved cards, and current reading table. Keep both backups until satisfied. / 检查学习步骤、收藏和当前牌桌，确认无误前保留两份备份。

Git carries source code and project notes. It does not carry browser local storage. Localhost, the public demo, and a downloaded HTML can have separate records even on the same computer.

Git 同步源码与项目说明，不同步浏览器存储。同一台电脑上的 localhost、公开演示和离线 HTML，也可能各自保存独立记录。

Keep these storage keys and existing backup contracts compatible:

- `tarot-pocket-demo-v1`
- `tarot-learning-units-v2`
- `tarot-reading-v3`
- Backup envelope / 备份标记：`app: "tarot-pocket-demo"`, `version: 1`

Do not rename keys as a branding cleanup. Add and test a migration when storage behavior truly needs to change.

不要为了品牌改名顺手更换存储 key；确需修改存储结构时，单独实现并验证迁移。

## What to work on next · 下一步从哪里开始

**First, validate the complete phone loop.** Learn an unfamiliar card, pause and resume, finish and continue to the next card, return on a later day, prepare offline content, and draw a spread. Record concrete friction.

**先验证完整手机闭环。** 学一张陌生牌、中断续学、完成后学下一张、隔天回访、准备离线内容并完成一次牌阵，记录具体卡点。

Current open work:

当前明确待办：

- Independent bilingual editing and tarot-teacher review, especially close distractors and interpretation boundaries. / 独立双语编辑与塔罗教师审核，重点看接近选项与解读边界。
- iPhone Safari acceptance: opening the chosen distribution, airplane mode, unfamiliar images, export/import, closing and reopening, and device restart. / iPhone Safari 实机检查：打开选定发行形式、飞行模式、陌生牌图、备份恢复、退出重开与设备重启。
- Evidence-led refinement of the 78 courses, court-card comparisons, multi-card teaching and return variants. / 根据真实卡点改善现有 78 套课程、宫廷辨析、多牌教学与回访变式。
- Delayed recall and long-absence trials of implemented SM-2 scheduling; real-device verification of implemented offline preparation and update recovery. / 验证已实现的 SM-2 在隔天与中断回归中的表现，并实机核验已实现的离线准备和更新恢复。

Keep native app and App Store decisions after the learning experience is accepted. The [roadmap](ROADMAP.md) records candidates rather than a promised delivery calendar.

学习体验确认之后，再做原生 App 与 App Store 决策。[路线图](ROADMAP.md)记录候选方向，不承诺上线日期。

## Leave the next person a usable handoff · 每次结束怎样交接

Update this file in the project branch when the working state materially changes. Record only project facts safe for a public repository. A short handoff should contain:

项目状态发生实质变化时，在当前项目分支更新本文件。只记录适合公开的项目事实，每次简短交接包含：

```text
Task / 本轮目标:
Branch / 工作分支:
Completed / 已完成:
Validation / 验证命令与实际结果:
Open issues / 未完成与已知问题:
Next action / 接手后的第一个动作:
Delivery / 本地、CI、Release、Pages、实机分别到哪一步:
```

Use the relevant commit, PR, or release link as evidence when it exists. Do not invent a successful check, publish a local absolute path, or place a personal reading in the handoff. If a job is still running, say so.

已有提交、PR 或 Release 时使用真实链接作证据。不要虚构检查通过、公开个人绝对路径或写入私人占卜内容；任务仍在运行就明确写未完成。

This project card enables code-work continuity for a human or assistant. Cloning it does not connect a personal assistant's private memory or grant access to other repositories.

这张接力卡支持人或助理恢复项目开发。克隆本仓库不代表接入私人助理记忆，也不授予其他仓库的访问权限。
