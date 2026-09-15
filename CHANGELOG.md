# Changelog · 版本记录

## 1.5.2 — A smoother card table / 更流畅的随身牌桌

- Home learning and reading cards now share aligned artwork, text and arrow rows; learning shortcuts stay below the primary cards instead of stretching the reading card. / 首页学牌与抽牌卡片的插图、文字、箭头对齐，学习快捷入口独立放在下方，不再拉长抽牌卡片。
- Shuffling visibly spreads the deck, scatters and crosses cards on the table, then gathers them into one stack over 6.8 seconds. Continue remains explicit; skipping or reduced motion preserves the same already-randomized cards. / 洗牌以 6.8 秒完成摊开、打散交错、收拢；观看完成后手动继续，跳过和减少动态均保留已生成的牌序。

- Card selection now uses native horizontal swiping with snap alignment. All 78 card backs stay mounted; tapping lifts a candidate, confirmation places it, and returning restores the same group and cards. Previous/next buttons remain keyboard alternatives. / 选牌支持原生横向滑动与吸附，78 张牌背保留在同一滚动区域；轻点抬起、确认入位，返回恢复原组与牌序，保留前后按钮供键盘操作。

- AI reading waits include gentle card motion and rotating observation tips. A longer-wait message appears after 25 seconds; cancellation and immediate answer display remain. Tips are not model progress. / AI 等待期间显示轻柔牌面动效与轮换观察提示，25 秒后明确说明仍在等候；可取消，答案返回即显示，不将提示冒充模型进度。

- Placed cards no longer reanimate when another candidate is tapped; keyboard paging keeps focus, disabled controls have no press animation, and reduced motion covers legacy feedback scrolling. Current bilingual screenshots and the ritual recording replace the old README gallery. / 切换候选不再重播已入位牌的动画，前后组按钮保留键盘焦点，禁用按钮无按压动效，旧课滚动遵守减少动态；README 同步本版双语截图与抽牌录屏。

## 1.5.1 — Shareable short invitation / 易分享短邀请码

- The app entrance now accepts an 8-character, case-insensitive invitation derived server-side from the private signing secret. The long `TAROT_AI_ACCESS_TOKEN` remains server-only and is no longer the value users share or type. / 应用入口改用服务端从私有签名密钥派生的 8 位邀请码，不区分大小写；长 `TAROT_AI_ACCESS_TOKEN` 只留在服务端，不再由用户分享或输入。
- Wrong invitations retain the separate attempt limit. Changing the signing secret changes the short invitation and invalidates existing sessions. / 错误邀请码继续使用独立尝试限流；更换签名密钥会同时更换短邀请码并使旧会话失效。

- The private invitation writer preserves the existing file when signing configuration is missing; invitation leak checks cover lowercase variants in both questions and provider output. / 未配置签名密钥时保留既有私有邀请码文件；问题与上游返回中的小写邀请码也会被防泄漏检查拦截。

## 1.5.0 — Invitation sessions / 邀请码与自动解读会话

- The hosted app now opens at one bilingual invitation gate. A valid invitation creates a 12-hour, tab-scoped reading session; individual readings no longer ask for a connection code or provider key. / 托管网页统一从双语邀请码入口进入；验证后获得 12 小时、当前浏览器标签页有效的解读会话，单次解牌不再要求连接码或供应商密钥。
- The server accepts the invitation only at `/api/session`. `/api/reading` rejects the original invitation and accepts only signed, expiring session credentials; rotating the invitation invalidates existing sessions. / 服务端仅在 `/api/session` 接收邀请码；解牌接口拒绝原邀请码，只接受签名且过期的会话凭证，更换邀请码会令旧会话失效。
- The AI action visibly names the user's question and sends that question, A/B options, spread, exact positions, cards and reversals. The prompt must answer the actual question before developing the whole-spread throughline. / AI 区明确显示本次问题，并发送问题、A/B 选项、牌阵、真实牌位、牌与正逆位；模型先回应具体问题，再展开整组主线。
- Provider keys remain server-side. Invitation attempts and readings retain separate rate limits; sessions are never included in local progress or JSON backups. / 供应商密钥仍只在服务端；邀请码尝试与解牌分别限流，会话不进入学习记录或 JSON 备份。

## 1.4.0 — Guided understanding / 逐步理解

- All 78 new lessons use authored causal questions, concrete reversed contexts and open reconstruction; element/number support, close-card comparison and same-question position changes connect the steps. / 78 张新课以因果推导、具体逆位背景和开放回忆为主，串联元素数字、近牌辨析及同题换位。
- Home prioritizes random unseen cards; resume and self-selection stay explicit. Old sessions and backups remain compatible. / 首页随机新学，继续与自选分开，旧课与备份兼容。
- Compact spread guides display position names and purpose; online reading shows an explained connection-code form with in-place correction. / 紧凑牌阵直接显示用途与牌位；联网解读连接码有入口、来源说明和原位纠错。
- Errors and hints remain recorded. Open understanding, comparison, position reading and recall use explicit self-assessment rather than false exclusive answers. Personal memory sentences are optional and local. / 错误及提示如实记录；理解、辨析、换位和回忆采用明确自评，不把同样合理的解读硬判错；记忆句可选且本地保存。
- No server prompt, authorization policy, spread definitions or scheduling changes. / 未修改服务端提示、权限策略、牌阵定义或复习调度。


## 1.3.0 — 2026-09-14

- Deliberate shuffle/cut/reveal animation, explicit viewing time, six large candidates per page and confirmed placement. All 78 remain selectable; interruption and reduced motion preserve the result. / 洗切翻动效和自主观看、六张大牌背候选与确认入位；78 张可选，中断与减少动态保留结果。
- Image-first discovery, evidence-to-meaning connection and reversible paired-card matching, with specific feedback and honest first-attempt memory records. Old lesson sessions remain compatible. / 先看图、连接依据与含义、双牌配对可撤回；明确错因并保留首次记忆成绩，兼容旧课程。
- 78 expanded bilingual card guides with chapters, contextual tables, visible positions, paired images and uninterrupted sheet interactions. / 78 张双语图文手册、情境表、可见牌位、双牌对照与不跳页查阅。
- Existing AI API, sourced spreads and scheduling rules remain unchanged in this UI-focused release. / 本轮聚焦 UI，保留既有 AI 接口、牌阵来源及调度规则。
- Details and research: [EXPERIENCE_V1_3](docs/EXPERIENCE_V1_3.md).

## 1.2.0 — 2026-09-14

- Replace unsourced reading catalog entries with seven sourced structures plus daily tarot; retain nineteen legacy definitions for saved readings. Correct five-card decision and relationship layouts with versioned IDs. / 采用有出处的七种结构及日签；十九个旧定义仅兼容存档，五牌二择一与关系阵使用独立 ID。
- Compact purpose-first guides; overall results precede optional, dismissible card references. / 介绍页聚焦用途、缩略图和牌位，结果先于可收起的单牌释义。
- Optional server-side DeepSeek/OpenAI interpretation, explicit requests, cancellation, errors and offline saved answers. No provider credentials in static files or backups. / 可选服务端 AI 完整解读，主动请求、取消、错误提示及离线保存；静态文件与备份不含供应商密钥。
- Sources and deployment details: [SPREAD_SOURCES](docs/SPREAD_SOURCES.md), [AI_SERVICE](docs/AI_SERVICE.md).


Changes describe the product included in each version. Deployment and device acceptance are recorded separately; a release entry alone does not prove either.

版本记录描述该版产品内容；部署与实机验收分别记录，出现一个版本条目不代表两者都已完成。

## v1.1.0 — Choice and ritual / 自主学牌与抽牌仪式

- Choose any of 78 cards; unseen-only new recommendations, exact continuation and due review are separate. / 78 张自由选择，新牌推荐只含未开始内容，继续与到期复习明确分开。
- Image choices, real four-suit comparisons and visible placement exercises vary the learning action. Reference sheets, search and comparisons preserve context and focus. / 图像选择、四花色对照和可见放牌训练改变学习动作；资料切换、搜索与对比保留上下文和焦点。
- 23 scenario spreads plus daily tarot; inspect all roles before using a spread. Shuffle, cut, fan selection and reveal have meaningful animations with reduced-motion support. / 23 个场景牌阵加日运，先看全部位置；洗、切、挑、翻有对应动画及减少动态支持。
- Every reading stage can exit and resume; a daily draw stays fixed within the local date. References contain no teaching task. / 抽牌每步可退可续，日签当天固定，解读不混教学题。
- Explicit update page escapes old cached homepages, verifies all assets and preserves old progress. Existing storage keys and JSON backups remain compatible. / 独立更新页绕过旧首页缓存、核验完整资源并保留进度；存储键与 JSON 备份兼容。

See [the experience contract](docs/EXPERIENCE_V1_1.md) and [actual handoff evidence](docs/HANDOFF.md). / 详见体验方案与实际接力证据。

## v1.0.0 — Continuous learning / 连续学习

- All 78 cards now have seven-stage first lessons, card-specific visual explanations and memory anchors, close distractors, quiet recall, comparisons, contextual application and reversal practice. / 78 张牌均有七步初学、专属图像解释与助记、接近选项、静默回忆、对比、情境应用和逆位练习。
- Six skill records per card, SM-2 interval scheduling with same-day retry protection, adaptive reviews and per-card pause/resume. Finishing a card leads directly to the next. / 每牌六种能力记录，SM-2 复习与同日保护、自适应回访、逐牌暂停续学；完成可直接学下一张。
- A two-choice home, searchable learning library, richer dossiers, visible progress and foundations under the library. / 首页只保留学牌与抽牌，牌库可搜索、资料更完整、进度可见，基础知识收在牌库。
- Eight separate reading flows with optional questions, optional domain wording and interpretation based on actual card combinations and spread roles. Input is local and is not semantically analyzed. / 八种独立抽牌流程，问题与领域措辞均可选，按实际组合和牌位解读；输入只保存在本地，不做语义解析。
- Explicit verified offline download, installable PWA, safe deferred updates and retained standalone HTML; no account, analytics or external runtime service. / 明确下载并校验完整离线内容，可安装 PWA，更新延后生效，保留单文件；无账号、追踪或外部运行服务。
- Existing storage keys and backups remain compatible. New bilingual product plan, handoff and refreshed actual application screenshots. / 旧存储键与备份保持兼容，新增双语完整方案与接力说明，更新真实应用截图。

Physical iPhone acceptance, independent teacher review and long-term retention effectiveness remain open. Desktop Chromium and WebKit checks do not establish those outcomes.

iPhone 实机验收、独立教师审核与长期记忆效果尚待验证，桌面 Chromium 和 WebKit 检查不能代替这些证据。

## v0.4.0 — Moonlit design preview / 静光设计预览版

A visual update to the existing learning demo; course coverage is unchanged.
Implementation checks, deployment and real-device acceptance remain separate evidence.

本版更新既有学习 Demo 的视觉体验，课程覆盖范围不变；实现检查、部署与实机验收分别记录。

- Shared warm-white, plum and charcoal tokens, local serif display headings, opaque learning and reading surfaces, and restrained frosted navigation. / 共用暖白、梅紫与炭墨令牌，本地衬线展示标题、不透明学习和阅读表面，以及克制的磨砂导航。
- A newly constructed celestial card back, shared by all cards, with exact half-turn geometry and its own asset check. All 78 verified historical faces are retained. / 新构建统一天体牌背，使用精确半周旋转几何并增加独立牌背检查；完整保留 78 张已核验历史正面。
- Focused shuffle, selection and reveal screens retain an exit; skipping the shuffle animation preserves the existing shuffled pool. Reduced-motion presentation preserves the same reading result. / 洗牌、选牌和翻牌进入保留退出操作的专注视图；跳过洗牌动画保持既有牌序，减少动态模式呈现同一次结果。
- Chinese/English language behavior, practice-first navigation, explicit wrong-answer feedback, lessons, spreads, stored IDs and JSON backup compatibility remain intact. / 保留中英语言行为、练习优先导航、明确判错、课程、牌阵、存档 ID 与 JSON 备份兼容性。
- A bilingual [design contract](docs/design/README.md), the supplied reference archive, shared design tokens and repeatable gallery capture document the adaptation for future contributors. / 用双语设计规范、原始参考归档、公共设计令牌与可重复的界面截图支持后续协作。

No journal, daily-draw limit, system-language mode, account or native app is added by this design update. The deep single-card sample remains Four of Pentacles; iPhone Safari and long-term phone offline use remain unverified.

本次设计更新不增加手记、每日抽牌限制、跟随系统语言、账号或原生 App。深入单牌样本仍为星币四；iPhone Safari 与手机长期离线仍待验证。

## v0.3.0 — Preview / 预览版

First public-preview release of **Tarot Pocket · 塔罗随身学**.

**Tarot Pocket · 塔罗随身学** 首个公开预览版本。

### Learning / 学习

- One practice homepage, with explicit right/wrong feedback and separate interpretation/evidence scoring. / 首页统一为练习，明确判错，解释与依据分别评分。
- 56 learning steps in eight units, plus 24 mixed questions. The deep single-card sample is Four of Pentacles. / 八个单元、56 个学习环节，另有 24 道混合题；深入单牌样本为星币四。
- Elements, numbers, quiet recall, near-meaning comparisons, positions, and love/career/study contexts. / 元素、数字、静默回忆、近义辨析、牌位与感情／事业／学业情境。
- English and Simplified Chinese interface and learning content. / 中英文界面与学习内容。

### Reading / 抽牌

- Full 78-card shuffle and draw without replacement, optional reversals, and reveal animations. / 完整 78 张随机洗牌与无放回抽取，可选逆位与翻牌动效。
- Eight spread guides, position practice, resumable tables, and the most recent 40 saved readings. / 八阵指南、牌位练习、可续抽牌桌与最近 40 组记录。
- Local export/import covers practice, learning, and readings. / 本地导入导出覆盖快练、学习与抽牌。

### Distribution / 发行

- 78 historical Pam-A card images with provenance and checksum records. / 78 张历史 Pam-A 牌图，保留来源与哈希记录。
- A standalone HTML with embedded images, scripts, styles, and current learning content. / 图片、脚本、样式与当前内容内嵌的独立 HTML。
- Public-project documentation in English and Chinese, contribution templates, and a cross-computer handoff guide. / 中英文开源文档、贡献模板与跨电脑接力指南。
- MIT for code; CC BY-SA 4.0 for original content and documentation; separate artwork rights notice. / 代码 MIT，原创内容与文档 CC BY-SA 4.0，牌图独立声明。

### Known limits / 已知边界

The 78-card reference library is not 78 complete deep courses. Review uses a 1/3-day demonstration rule. Independent content review, real iPhone Safari acceptance, and long-term phone offline validation remain open. There is no PWA, account, cloud sync, or native app in this release.

78 张基础牌库不等于 78 套完整深入课程；复习仍是 1／3 天演示规则。独立内容审核、iPhone Safari 实机与手机长期离线验证尚待完成。本版没有 PWA、账号、云同步或原生 App。
