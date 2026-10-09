# Spread sources / 牌阵来源

The current catalog uses twelve ordinary structures (including open-three and the four additions below) plus a separate daily-card ritual. Twenty-five scenarios reuse these definitions; they do not create new spreads by renaming positions. These are named versions, not a universal numbering standard. App descriptions are original paraphrases.

当前目录采用12种普通结构（含自由三张及下方新增4种），日签为独立入口。25个场景复用这些结构，不靠改名制造传统牌阵。以下标明采用版本，不声称塔罗只有唯一编号标准；说明为原创转述。

| ID | Structure / 结构 | Source / 来源 |
| --- | --- | --- |
| `one`, `daily` | Single-card focus / 单牌聚焦与每日提醒 | [Labyrinthos daily readings](https://labyrinthos.co/pages/free-online-tarot-readings) |
| `three` | Situation, obstacle, advice / 现状、阻碍、建议 | [Brigit Esselmont, Biddy Tarot](https://biddytarot.com/blog/easy-three-card-tarot-spreads/) |
| `timeline` | Past, present, future tendency / 过去、现在、未来趋势 | [Brigit Esselmont, Biddy Tarot](https://biddytarot.com/blog/easy-three-card-tarot-spreads/) |
| `decision-five` | Five-card V: shared situation; A development; B development; A outcome; B outcome / 五牌 V 形：现状、A 发展、B 发展、A 结果、B 结果 | [科技紫微网, 2013-09-26](https://m.click108.com.tw/article/201309/9094_1.php) |
| `relationship-three` | You, partner, dynamic; visual order 1/3/2 / 自己、对方、互动；横排顺序 1/3/2 | [Tina Gong, Labyrinthos](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/examining-relationships-with-tarot-3-love-tarot-spreads-to-understand-you-your-partner) |
| `relationship-five` | You, partner, past foundation, present, future; 3 above, 1/4/2 across, 5 below / 自己、对方、过去基础、现在、未来；3 上，1/4/2 中，5 下 | [Tina Gong, Labyrinthos](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/examining-relationships-with-tarot-3-love-tarot-spreads-to-understand-you-your-partner) |
| `celtic` | Waite’s ten positions / Waite 十位定义 | [A. E. Waite, The Pictorial Key to the Tarot, III §7](https://sacred-texts.com/tarot/pkt/pkt0307.htm) |

The five-card decision layout follows 1→2→4 and 1→3→5. Timing belongs to the user’s question. The app preserves the source’s position semantics and numbering but uses its own shuffle/cut/tap ritual instead of the source’s card-counting procedure. Outcomes are conditional tendencies. Other published five-card versions number the two branches differently or use advice positions; those versions must not be mixed.

五牌二择一分别沿 1→2→4 和 1→3→5 展开，时间由用户的问题约定。应用沿用来源的位置含义与编号，抽牌使用本应用的洗牌、切牌和点选流程，而非原文数牌步骤。结果为有条件的趋势。其他五牌版本可能连续编号或采用建议位，不应混用。

The Celtic view omits the extra significator. Card 2 is displayed beside card 1 for accessible selection instead of obscuring it; its crossing role is retained. Waite’s 3/4/5 positions are not Joan Bunning’s later clockwise numbering.

凯尔特省略额外指示牌；第 2 张在数字展开视图中置于第 1 张旁，以便分别点选，仍保留交叉影响角色。Waite 的 3/4/5 位不与 Joan Bunning 后来的顺时针版本混引。

Nineteen earlier authored templates remain in data solely for existing drafts/history/backups. They are excluded from new-reading galleries. In particular, `choice` retains all six original positions; it is never silently reinterpreted as `decision-five`. Worked teaching examples remain explicitly labeled as examples.

十九个旧版自编模板仅用于兼容草稿、历史与备份，不再出现在新抽牌目录。尤其 `choice` 保留原来的六张位置，绝不悄悄套用 `decision-five` 重解历史牌。教学案例明确标为示例。

Sources checked 2026-09-14. Source matching verifies the adopted layout, not predictive validity or independent expert review. / 来源核对日期：2026-09-14。匹配来源证明采用了该布局，不证明预测有效性或已接受独立专家审校。

## 1.7 scenario additions / 新增场景结构

These additions follow the public-source review recorded in READING_MASTER RM-1.2 (2026-09-16). None reconstruct Quin's private positions from thumbnails. / 以下依据抽牌主文档RM-1.2公开资料研究，不根据Quin缩略图推测内部牌位。

| ID | Adopted roles / 采用角色 | Source / 来源 |
|---|---|---|
| `yes-no` | One card for a supported leaning, without upright/reversed vote counting / 单牌判断倾向，不用正逆位投票 | [Labyrinthos Yes/No](https://labyrinthos.co/pages/yes-no-tarot-reading) |
| `new-love` | Readiness, possible partner, meeting, connection, potential / 准备、可能遇到的人、相识情境、相处方式、发展可能 | [Tina Gong: Finding New Love](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/finding-new-love-tarot-spreads) |
| `three-options` | Three equal options, one card each / A、B、C平等选项，每项一张，不另加结果位 | [Tina Gong: Three-card layouts](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/3-card-tarot-spreads-simple-tarot-spreads-organized-by-layout) |
| `career-six` | Origin, motivation, responsibilities, current situation, rewards, direction / 初衷、动力、职责、目前情况、收获、发展 | [Tina Gong: Brick by Brick](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/three-career-tarot-spreads-for-finding-your-path-and-calling) |

Current source metadata lives in `spread-content.js`; scenario purposes and preset questions live in `reading-scenarios.js`. Including 19 legacy definitions, the shared catalog has 32 entries. / 结构与来源在spread-content.js，场景用途与预设问题在reading-scenarios.js；加19个旧定义总计32项。

## Open three cards / 无牌阵三张

`open-three` is an application open-draw mode requested by users, not a named traditional spread. All three cards address one question. Numbers 1–3 record draw order only; neither the offline guide nor the AI may impose past/present/future or another fixed role. It appears separately alongside the seven sourced structures and daily tarot. / `open-three` 是用户要求的自由抽牌方式，不宣称传统牌阵来源。三张共同回应同一个问题，编号仅表示抽取顺序，不能擅自赋予过去、现在、未来或其他固定角色；七种已有出处结构和日签保持不变。

## 2026-10-09 · 独立牌阵资料目录扩充

用户提供的 `https://xn--omsu12g.xn--fiqs8s/paizhen/` 本次访问超时，未假称已读取。改从实际可访问的[塔罗中国牌阵目录](https://www.tarotchina.net/paizhenbook/)找到逐项说明；下列五个几何布局还逐张查看了该站的公开编号示意图。只采用牌位结构事实并重新编写说明，不下载图库进入本项目，也不复制长篇解释。

| 新 ID | 采用结构 | 来源及边界 |
|---|---|---|
| `sacred-triangle` | 原因、现况、结果；1 上，2 左下，3 右下 | [圣三角](https://www.tarotchina.net/paizhen2/)。不是时间线版。|
| `diamond` | 现在、问题一、问题二、结果；4 上，2/3 中，1 下 | [钻石展开法](https://www.tarotchina.net/paizhen3/)。不采用正位必为过度、逆位必为不足的统一断法。|
| `lovers-pyramid` | 自己期望、对方期望、当前关系、后续关系；4 上，2/1/3 下 | [恋人金字塔](https://www.tarotchina.net/paizhen4/)。四牌版，不混入七牌版。|
| `gypsy-cross` | 对方想法、自己想法、相处问题、环境、关系结果；1 上，3/5/4 中，2 下 | [吉普赛十字](https://www.tarotchina.net/paizhen6/)。名称沿用公开版本，不据此断言民族来源；他人想法只作待核对的象征线索。|
| `hexagram` | 过去、现况、未来、指引、环境、期望、结果 | [六芒星](https://www.tarotchina.net/paizhen9/)。六个外点顺序为上1、左上2、左下3、下4、右下5、右上6，中央7。|
| `self-exploration` | 状态、外在表现、内在想法、潜意识 | [自我探索](https://www.tarotchina.net/paizhen5/)。角色保持，本应用另采用2×2阅读布局，明确不是原图复刻。|
| `mind-body-spirit` | 思想、身体与日常、内在价值 | [Tina Gong 三牌组合](https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/3-card-tarot-spreads-simple-tarot-spreads-organized-by-layout)。采用 Mind/Body/Spirit；不做疾病诊断，不强加宗教。|
| `open-five` | 五张共同回应主题，顺序无固定角色 | 用户要求的自由模式，应用原创；不是传统命名牌阵。|

新增八项后共有 40 个定义（21 个非 legacy，其中包含独立日运；19 个兼容历史定义）。新抽牌目录应按张数排序；不能因为新增资料而重解释旧记录的角色。已有基础场景名称改为其对应牌阵名称，不再用“看清卡在哪里”等产品文案替代正式名称。

`layoutPositions` 按抽取顺序提供 `{x,y}` 的 0–1 归一化**中心坐标**；渲染层须为牌本体与文字预留边距。`layoutGrid` 提供建议列/行数，不得在不认识新布局时退回横排。

新增牌位另有 `scope`，用于区分同属 `state` 的现况、环境、期望、内在想法与外在表现。离线解释采用真实 scope 与逐位说明，牌义背景与本位应用分开；恋人金字塔、吉普赛十字仍列基础目录，但解读领域为感情。专项检查 `tools/check_position_semantics_v2.cjs` 验证同一张太阳在不同位置不再输出同一句，并验证阻碍应用不会混入正向行动建议。
