# Mobile experience feedback · 移动端体验问题记录

This log records the transition from the earlier preview to a complete learning loop.
Stable IDs, storage keys and verified historical card assets remain compatible.

本文记录从早期预览到完整学习闭环的体验调整。稳定 ID、三个存储键及已核验历史牌图保持兼容。

## v1.1.0 · Agency and continuity / 自主性与连续性

Repeated first cards, buried choices, text-only placement, lost sheet scroll, a separate wording picker, too few spreads and incomplete ritual stages were separate sources of friction. The [experience contract](EXPERIENCE_V1_1.md) maps them to selectable learning, real images and positions, retained sheet state, scenario categories, 23 spreads plus daily tarot and a full shuffle/cut/pick/reveal sequence. An independent update page also addresses stale offline homepages.

反复遇见固定首牌、选牌不明显、假想牌位、弹层跳动、重复选语境、牌阵太少与仪式不完整分别修复。方案对应自主学习、可见真牌和牌位、弹层原位、场景分类、23 阵加日运及洗切抽翻；另修旧离线首页缓存无法更新的问题。

## v1.0.0 · Retention comes first / 围绕记住重新组织

The earlier fixes below repaired navigation but did not make every card learnable in depth. The release now provides 78 seven-stage first lessons, adaptive review, per-card pause/resume, six skill records, and a direct next-card action. Reading a dossier is only an encounter; it never marks a lesson completed or a card mastered.

下面早期调整修复了导航，但没有让每张牌都能深入学习。本版提供 78 套七步初学、自适应回访、逐牌暂停续学、六种能力记录和直接学下一张。读过资料仅算接触，不再直接标记完成或掌握。

Questions and domain selection in real readings are optional. The report connects the actual drawn cards according to each spread's roles. Question text is stored locally and is not interpreted by a semantic service. Reading remains separate from teaching.

真实抽牌的问题和领域选择均可跳过；报告按不同牌阵的职责关联实际抽到的牌。问题仅本地保存，不通过语义服务解析；抽牌继续与教学分开。

The two-choice home starts learning immediately. The library supplies deliberate card selection, progress filters, expanded references and optional foundations. Offline preparation now explicitly downloads and verifies a complete web release, while preserving private backup compatibility. See the [complete product plan](PRODUCT_PLAN.md).

首页两个选择中，学牌直接开始；牌库提供自主选牌、进度筛选、深入资料与可选基础知识。离线准备明确下载并校验完整网页版本，私人备份保持兼容。详见[完整方案](PRODUCT_PLAN.md)。

## v0.5.0 · Earlier learning and reading changes / 早期学习与抽牌调整

| Reported friction / 体验问题 | UI response / 本轮调整 |
| --- | --- |
| A card lesson ended without a clear way to continue. / 一张牌学完后无法自然接着学。 | Card-specific completion now presents **Learn the next card** as the primary action. The next card starts immediately; returning to the library remains available. / 单牌练完后，主按钮直接进入下一张牌，同时保留返回牌库。 |
| Drawing began with topic and text choices before the user understood the spreads. / 抽牌一开始先选文字主题，机械且难理解牌阵差异。 | Drawing now starts with eight visual spread thumbnails. Every card shows card count and scope; opening it reveals limits, all positions, and reading order before the question step. / 抽牌先展示 8 个牌阵缩略图、张数和能力范围；点开后先看边界、全部牌位与读法。 |
| The home screen exposed too many parallel entries. / 首页入口过多。 | Home now offers two decisions only: **Learn** and **Draw**. Records remain available in the top bar; the bottom navigation contains Home, Learn, and Draw. / 首页只保留“学牌”和“抽牌”，记录放在右上角，底部只保留三项导航。 |
| Library cards did not contain enough information to support choosing what to learn. / 牌库卡片简介太少。 | Library cards now include suit, element, number, a core explanation, keywords, and learned state. Full details add meaning, visual evidence, orientation, positions, and domain examples. / 牌库列表增加花色、元素、数字、核心说明、关键词和学习状态；详情页保留完整解释。 |
| Real readings mixed teaching tasks with the interpretation and had no place to write the actual question. / 真实抽牌缺少问题输入，解牌节拍不够专业，并与教学混在一起。 | After choosing a spread, the user writes a question and optionally selects a wording context. A completed draw uses a five-stage report: task, position readings, card relationships, throughline, and reality checks. Learning prompts are absent from this report. / 选牌阵后输入真实问题；完成抽牌后按“任务、逐位、牌间关系、主线、现实核对”五步解读，解牌区不再混入教学入口。 |
| Learned cards and new cards were not visible as a navigable learning state. Elements and numbers occupied separate practice routes. / 已学牌和新牌缺少可见记录，元素与数字分散在单独练习里。 | The Learn page now shows learned and due counts, New/Learned filters, a deliberate **Mark as learned** action, and element/number reference cards inside the library. Existing advanced units remain under an optional collapsed section. / 学牌页展示已学与待复习数量、未学/已学筛选、主动“记录为学过”，四元素和数字知识进入牌库；既有能力训练收在可选折叠区。 |

## Acceptance boundary · 验收边界

Automated checks cover Chromium at 320, 375, 390, 430, and 1280 pixels,
Chinese/English rendering, offline navigation, complete-deck drawing, persistence,
backup compatibility, and no external runtime requests. Physical iPhone Safari
and long-term offline retention still require user testing.

自动检查覆盖 Chromium 的 320、375、390、430、1280 像素宽度、中英文、离线导航、
完整牌组抽取、记录与备份兼容，以及运行时无第三方请求。iPhone Safari 实机和长期离线
保留仍需要用户亲自体验。
