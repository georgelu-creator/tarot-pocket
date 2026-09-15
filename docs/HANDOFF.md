# Continue on another computer · 跨电脑接力

## Current work: 1.5.0 / 本次改动

- The hosted app is protected by one bilingual invitation gate. A valid `TAROT_AI_ACCESS_TOKEN` is exchanged through `/api/session` for a signed 12-hour, tab-scoped credential; the raw invitation cannot call `/api/reading`. / 托管网页使用统一双语邀请码入口；`/api/session` 将有效邀请码换成签名的 12 小时标签页会话，原始邀请码不能直接调用解牌接口。
- Individual readings have no connection-code or API-key UI. The current question is shown as the reading focus and is sent with A/B labels, spread ID, actual cards, positions and reversals after the user explicitly requests a complete reading. / 单次解牌不再出现连接码或 API Key；页面显示本次问题，用户点生成后自动随选项、牌阵、实际牌位、牌与正逆位发送。
- The provider key and invitation remain server-only. The temporary session lives only in `sessionStorage`, is excluded from all three existing product stores and exports, and is cleared on authorization failure. / 供应商密钥与邀请码不进前端；临时会话只在 `sessionStorage`，不进入既有三个存储键或备份，鉴权失败立即清除。
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
| Release target / 发布版本 | v1.5.0 invitation sessions / 邀请码与自动解读会话 |
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
