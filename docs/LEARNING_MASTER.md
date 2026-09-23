# Tarot Pocket 教学主文档与完整脚本

> 当前设计事实源 / Current learning-design source of truth。正文中文；供应用展示的教学、题目、选项和反馈中英对照。设计、实际实现与学习效果分开记录；当前实现见R5与末尾R6记录，R4保留早期实现史。
>
> 文档版本：LM-1.2-R6，2026-09-24。R3为教材内容基线，R4记录首次完整接入，R5补充整牌理解题和可选详细资料，R6修复逐牌讲解实际未显示并把78张牌库从课程长页拆出。用户最新已明确本期公共界面只做中文，并授权修复、Git发布和上线；具体学习效果仍待真人试学。
>
> 当前实现与证据见 [1.7交付记录](RELEASE_1_7.md)。原Word教材保留不改，自动检查不证明教学效果。

<a id="start"></a>
## 0. 使用入口与状态

- [当前约定与要求追踪](#requirements)
- [教材基线与修订](#baseline)
- [课程地图与学习入口](#curriculum)
- [统一页面、提示与双语文案](#ui-copy)
- [动态补学与进度契约](#adaptive-contract)
- [动画分镜通用约定](#motion-contract)
- [20 课完整课程脚本](#lesson-scripts)
- [78 张牌逐牌脚本](#card-scripts)
- [来源、证据边界与版本](#sources)
- [覆盖检查与剩余验证](#acceptance)
- [R1教学有效性复核与优化提议](#review-20260916)
- [R2零基础视角文案与题意走查（历史记录）](#novice-walkthrough-20260916)
- [R3全稿中文修订、98单元覆盖与剩余问题](#chinese-walkthrough-20260916)
- [更新规则与变更记录](#change-log)

**当前质量状态：**R3已按学习者视角顺读并修订20课、78张牌的中文讲解、题目、反馈与补学，处理抽象翻译腔和已发现的局部衔接错误；用户最新确认[学牌页面只对学习者说话](#learner-first-copy)，不先抛不必要术语再解释，不加自评及换名同类步骤。R6走查发现逐牌T1虽有完整内容，运行页面却没有实际渲染三段讲解，用户会从提示直接进入Q1；本版必须以78张逐项运行检查证明“先讲后练”。仍有错误选项过于明显、部分补题换考点、建议位占比过高等长期教学问题，不能靠UI或题量证明已经学会；真人试学、延迟回忆与教学效果待验证。

**R6 题目内容修订状态（2026-09-24）：**已把 p13-Q1 的补学改成重新区分“实际安排照顾”与“只有愿望”，并修订审查点 A05-Q2、m16-Q1、p08-Q3 及 p02-Q4。随后逐项复核此前改写的381个错误项：每项都保留稳定题目与选项 ID，重新写成与所教内容相邻但不满足本题条件的误解。答错反馈直接回到该题的画面、情境或牌义依据，已删除批量重复的“把重点放在……缺少本题要辨认的……”和“所以本题更贴近……”包装。18道可能出现双解的题已收紧错误项；s07-Q3 去掉“说明改动就能证明先前没有隐瞒”的语气线索，m13-Q1 中英文恢复同一含义；复核时另处理 m03-V1、s10-R3 两处软绝对提示。`learning-distractor-feedback-v19.json`保存381项审定前后文案，专项检查逐项核对运行数据中的错项、反馈、正确项边界和审定记录。这里的“已验证”仅指构建与自动一致性检查，不代表独立塔罗教师审稿、真人理解或长期记忆效果已经验证。

**2026-09-17 运行规则补充：**学牌不自动播放讲解效果，也不给学习者展示“播放、重播、看动效、跳过动效”等控制。直接展示牌图、讲解、例子和练习；牌图放大只用于看清细节。本文早期单元里任何要求学习者点“看画面讲解”、暂停、重播或跳过的旧控制说明，均由本条替代；不删除讲解、题目或静态内容。

**接力必读：**先读本节、要求追踪、变更记录，再读涉及的课程或单牌。不得从旧 README、旧截图或旧应用行为推断新课程已获用户认可。发现新用户指令与本文冲突时，遵循最新明确指令并同步本文；不要把待讨论提议写成已确认。

| 状态 | 准确含义 |
|---|---|
| 提议 | 本文提出的具体题目、分镜、时间和调度参数，尚待试学 |
| 已确认 | 用户明确同意的范围、方向与原则；不是每道新题均已认可 |
| 已编写 | 存在完整脚本，不等于已验证教学效果 |
| 已验证 | 只限验收记录列出的具体检查，例如链接、覆盖、双语与内容检查 |
| 已实现 | 必须有应用代码与运行验证；当前接入及检查见R4实现记录 |

本文不承诺自动后台更新。后续在此工作区处理相关需求的执行者，应在每轮收尾前同步本文与交接入口；离开任务、未来会话未读取文档或外部系统自行变更，不视为已经同步。

<a id="requirements"></a>
## 1. 产品目标、完整要求与历史纠偏

核心目标：新人能够记住、理解并运用 RWS 塔罗。完成一个明确学习链路；在手机上主要靠点击、选择、滑动完成。旅行无网时仍可学习与抽牌；在线解读是独立能力。游戏与动画必须服务理解，不以玩法数量、点击次数或视觉热闹代替学习。

以下是当前可见对话中产品要求的语义归纳，不是私人聊天逐字存档。用户分享的他人方案与截图属于参考素材，只有明确采纳的要求成为约束。最新明确修改优先；无法复原的历史助手回复不补写为事实。

| ID | 用户要求/问题来源 | 当前有效决定 | 对应位置与验收 | 范围与当前状态 |
|---|---|---|---|---|
| R01 | 最初希望旅行断网时手机学塔罗 | 学习、题库、牌图与基础抽牌本地可用；在线 AI 单独标识 | 动态契约、R30；无网不依赖模型生成题 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R02 | 记牌、记牌阵、会按问题解牌 | 同时覆盖记忆、完整含义与应用，不用识图代替理解 | 20课、78牌、阶段验收 | 原则已确认；脚本/规则已编写，待试学 |
| R03 | 打字、语音不方便 | 学习主链路无需输入、录音或长篇感悟 | UI契约；全部主练习可点击完成 | 原则已确认；脚本/规则已编写，待试学 |
| R04 | 新人不了解牌，题目答案抽象脱节 | 先教后考，选项判据必须在教学中出现 | 每题教学依据与逐项反馈 | 原则已确认；脚本/规则已编写，待试学 |
| R05 | 最早希望选项相近、有挑战 | 保留合理区分，但后续“不模棱两可”优先；不能靠绕话增加难度 | 错因审查；合理多解转开放示范 | 原则已确认；脚本/规则已编写，待试学 |
| R06 | 自评没有价值；最新再次拒绝为产品流程增加负担 | 删除自评、信心打分、必填感悟及换名同类步骤；根据真实作答帮助学习 | 统一文案与脚本扫描 | 原则已确认；脚本/规则已编写，待试学 |
| R07 | 一张牌不止几个关键词 | 不固定词数、不逐字背诵；完整含义先教，关键词作整理 | 每牌T1与关键词说明 | 原则已确认；脚本/规则已编写，待试学 |
| R08 | 需要元素、数字、宫廷基础 | 初级建立工具，中级回到具体牌；禁止公式直接生成牌义 | B03–B05、I02–I03 | 原则已确认；脚本/规则已编写，待试学 |
| R09 | 大小阿尔卡纳与正逆位都要学 | 初级有选定正位单牌，中级78牌，逆位独立深化 | 课程地图、Q3入口 | 原则已确认；脚本/规则已编写，待试学 |
| R10 | 不要每次星币四/高塔固定顺序 | 可自选或随机未学牌；继续旧课与学新牌区分 | 动态契约；不默认重置同卡 | 原则已确认；脚本/规则已编写，待试学 |
| R11 | 一张完成后不能继续，流程阻断 | 完成页明确继续新牌/回课程入口，保留进度 | UI结束态；断点恢复验收 | 原则已确认；脚本/规则已编写，待试学 |
| R12 | 核心学习中杂项太多 | 固定“环节与指引—内容/题目—操作—反馈”；换牌放课外 | UI契约；无中途反思表单 | 原则已确认；脚本/规则已编写，待试学 |
| R13 | 图大小、位置、牌名跳动 | 单牌图与名称始终占固定区域，局部强调不重排整页 | 动画契约、移动端验收 | 原则已确认；脚本/规则已编写，待试学 |
| R14 | 陌生牌对比强行混淆 | 初学不强制双牌比较；以后只在都学过且有实际混淆时另议 | 20课与78牌均无陌生牌必考 | 原则已确认；脚本/规则已编写，待试学 |
| R15 | 操作与讲解不像自然中文；最新明确只有学习者一个受众 | 所有展示文案直接面向学习者；编写/评分/路由说明内部保留；普通话直接说清，不先抛抽象词再解释 | [学习者文案约定](#learner-first-copy)、R3全稿走查 | 原则已确认；脚本/规则已编写，待试学 |
| R16 | 学习要机动，不能固定模板 | 页面统一，补讲内容、难度和回访由实际证据改变 | 动态契约、每牌主练习、专属R分支与V1 | 原则已确认；脚本/规则已编写，待试学 |
| R17 | 选定“适量补学，稍后再遇见” | 每个目标当次最多两轮补学；困难不阻断整课 | 两轮上限与完成/掌握分离 | 原则已确认；脚本/规则已编写，待试学 |
| R18 | 希望洗牌、切牌也能学 | B02分步操作演示，教一种可行方法，不称唯一仪式 | B02脚本 | 原则已确认；脚本/规则已编写，待试学 |
| R19 | 加动效辅助理解，留时间看 | 内容停住等待用户；可暂停重播跳过；减少动态可学全 | 动画契约与每节分镜 | 原则已确认；脚本/规则已编写，待试学 |
| R20 | 游戏好玩但真正学会更重要 | 不扣生命、不限时、不以通关次数冒充掌握；奖励具体学习成果 | 动态契约 | 原则已确认；脚本/规则已编写，待试学 |
| R21 | 没实体牌也可独立抽牌 | 独立牌桌不强制教学；单牌释义是可选查阅 | 独立牌桌验收，见抽牌主文档 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R22 | 洗牌不明显、缺仪式 | 保留摊开、打散交错、收拢、切牌、抽牌与引导；实际牌序与装饰分开 | 未来抽牌验收；B02仅教学演示 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R23 | 选牌分页/双击确认麻烦 | 全78背面连续可见可滚动，等价可点区域，单击选中；滑动不误选；一次揭全组 | 未来牌桌验收；不退回早期双击方案 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R24 | 牌阵少且捏造，二择一位置错误 | 只用声明来源和版本的结构；按张数排序；不能靠改名扩充 | 来源S02–S04、A05/A06、SPREAD_SOURCES | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R25 | 无牌阵直接问三张 | 保留自由三牌，抽取顺序不暗加过去/现在/未来 | I06/A03区分；未来牌桌约束 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R26 | 场景tab不变化，通用措辞多余 | 感情/工作/学业/生活等分类贯穿用途、示例、问题与解读 | 案例显式语境；未来UI/API验收 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R27 | 牌阵介绍太空、太长 | 缩略图、用途、解决的问题、位置说明紧凑可读；不展示内部写作思路 | 课程牌位示意保留；未来UI验收 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R28 | 返回缺失、底部遮挡、详情刷新 | 专注流程不遮内容；上一级/牌桌出口清楚；详情返回保留滚动 | 通用验收；移动端走查 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R29 | 正逆位选择入口多余 | 独立抽牌默认包含逆位；课程初学正位是教学分层，两者不冲突 | 课程入口与抽牌分别验收 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R30 | AI解读割裂且未回答具体问题 | 整组结论优先，带入具体问题、场景、牌阵、位置、方向；有依据可给倾向与条件 | 高级示范；在线服务长期约束 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R31 | 结果页锁定单牌 | 整组结果为主，不默认强制选中单牌；单牌详情后置可选 | 未来结果页验收 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R32 | 不要用户填模型key/连接码 | 服务端密钥、一次邀请码入口后自动会话；模型key不进公开资料 | 文档无凭证；保留部署安全约束 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R33 | 邀请码要短、手机网络能通 | 使用既有短码机制；跨域预检、HTTPS、手机真实网络分别验证 | 历史问题保留，不把健康检查当登录成功 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R34 | AI等待枯燥 | 温和动效与提示，可取消；不伪造模型思考或百分比 | 未来AI结果体验约束 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R35 | 日签有日期、宜忌、仪式感，不分享 | 保留日期、原牌义与建议；宜忌为牌义生活提醒，不冒充黄历规则 | 后续日签约束，不新增分享 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R36 | 首页简洁，学习+抽牌 | 主入口两条；牌库承载详解、基础查阅和已学/未学信息 | 未来导航；学习不另设重复练习入口 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R37 | 单牌资料太薄 | 完整含义、画面、结构、正逆位、情境与边界；可用图表辅助 | 每牌T1–T3、分镜；R5可选详细资料 | 已实现78张可选详解；内容与真人理解仍待试学 |
| R38 | 只看效果先讨论，别反复返工 | 教材/脚本评审→UI设计→开发；当前只授权文档 | 接力规则和状态表 | 原则已确认；脚本/规则已编写，待试学 |
| R39 | 截图参考表达，不照抄 | 使用自有版式与合法真实牌图；不复制商业视觉 | 动画素材约束 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R40 | 双语、公开Git、接力，截图说明同步 | 发布时源码、双语文案、截图/说明一致；最新授权已包括Git发布 | 本文中英展示文案、协作入口 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R41 | MIT＋CC BY-SA，牌图单列 | 代码MIT；原创文档/课程CC BY-SA4.0；图片独立出处 | 来源与许可 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R42 | 素材必须真实完整，拒绝悄悄缺图 | 78资产身份、来源、hash可追溯；缺图明确失败，不用别版/AI替换 | 本轮链接/素材核对；未来发布门禁 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R43 | 单文件备份与PWA离线 | 长期保留两种交付；离线媒体本地化，进度单独备份 | 不把联网成功当离线验证 | 本轮已纳入实现；具体证据见R4与1.7交付记录 |
| R44 | 防止上下文压缩丢要求 | 本文为主材料，更新有效正文+变更+覆盖+接力，不只追加聊天摘要 | §更新规则 | 原则已确认；脚本/规则已编写，待试学 |
| R45 | 完整脚本范围选择 | 20课＋78逐牌，不是只做三节样课；全写后仍以代表课先试学 | 覆盖表98单元 | 原则已确认；脚本/规则已编写，待试学 |
| R46 | “科学吗”需要诚实依据 | 通用学习研究≠塔罗效果证明；三阶段与分支均为本项目设计 | 来源等级与未验证项 | 原则已确认；脚本/规则已编写，待试学 |
| R47 | 2026-09-24本期隐藏英文入口，只做中文 | 公共界面和旧`lang=en`链接统一显示中文；保留稳定ID、旧记录及非公开英文资料，未来双语另行验收 | R6运行检查、发布入口 | 用户已确认；本版实施与验证 |
| R48 | 课程页过长，牌库可以单独出来 | 课程页只承载三阶段课程、续学、随机新牌和复习；78张搜索、筛选、详解与逐牌学习进入独立牌库 | 课程与牌库导航、移动端首屏 | 用户已确认；本版实施与验证 |
| R49 | 确保每张牌真正先学懂再答题 | 78张逐牌T1必须实际显示核心牌义、画面依据和记忆整理，再进入Q1；错题补讲、Q2应用、Q4整牌理解、独立逆位和后续回访保持可达 | 78张运行遍历与错题路径 | 用户已确认；本版实施与验证；效果仍待真人验证 |

### 已被替代的做法

| 旧说法/实现 | 最新决定 | 防止回退 |
|---|---|---|
| 先保留“静观”等不必要抽象词，再加解释 | 直接说“先留意自己的感受，还不清楚的事先别急着下结论” | 用户已否定R2的此种改法；不用词汇解释增加一层阅读 |
| 为了展示教学设计而露出目标、评分与路由说明 | 学牌页面只有学习者一个受众 | 讲解、选项、提示、补讲和完成页同样适用；内部字段不展示 |
| 用“想起全部/部分/没想起”自评驱动流程 | 用实际练习与提示记录，删除自评 | 不把旧存储grade或旧README当新UI要求 |
| 每张都固定三个词、按词回忆判掌握 | 完整意义先教；关键词数量与措辞服从内容 | 同义词不作为错误项 |
| 一张牌固定六步必须全部通过 | 稳定页面、阶段分层、实际错误补学 | 初学不自动塞逆位与高级关系 |
| 初学就辨析两张“相似牌” | 不强制陌生对比 | 不能用另一牌知识当隐含前提 |
| 把图中象征当可独立推导的唯一答案 | 先说明传统解释和图像助记的关系 | 图像事实与解读分开 |
| 闭眼想过即可计作掌握 | 没有可观察回答不记正确 | “继续”不能产生掌握分数 |
| 选牌先候选，再确认，每页少量卡 | 后期明确单击入位、全78连续铺开 | 保留早期历史，不再恢复旧方案 |
| 自编大量场景牌阵 | 采用有出处结构，场景是用途 | 旧记录兼容不等于重新推荐旧结构 |

<a id="baseline"></a>
## 2. 教材基线与本轮修订

基线文件：[Tarot Pocket 初中高级教学手册](../output/Tarot-Pocket-初中高级教学手册.docx)。制作时核对 SHA-256：`b628bde8c142dc06f116dc0c33ba5d6039384d91cf9e2287a0d40b74efe7e3a3`。79页，20课，78图文牌条目。本轮保留Word原件，不修改其内容。该文件当前是否进入Git必须查实际状态，不能把本地存在当远端已备份。

| 修订点 | 本文处理 | Word后续处理 |
|---|---|---|
| “先记三个关键词” | 改为完整意思先教，主题词辅助整理；不固定个数或逐字背诵 | 下一次明确授权修订Word时同步 |
| “回忆自评/心里说过即可” | 无自评；独立作答与延迟验证才是证据，继续按钮不判掌握 | 同上 |
| 78牌逆位单一入口 | 可保留初学示范入口，但每例明确背景与适用范围；不等于唯一牌义 | 同上 |
| 旧练习缺少逐项错因/补讲 | 为20课与78牌补全题目、所有选项反馈和真实补学内容 | 不声称Word原练习已经通过新验收 |
| 旧图文查阅与游戏脱节 | 本文把完整意义、图像说明、例子、练习与反馈关联 | 通过稳定ID保持对应 |

教材内容基础以最终Word为准，不从临时草稿还原已修正牌义。本文是基于该内容的新教学编排，不是Joan Bunning或其他作者课程的翻译版。不同解释传统不混成唯一标准；术语采用“大/小阿尔卡纳、权杖、圣杯、宝剑、星币、侍从、骑士、王后、国王”。稳定牌ID沿用项目。

<a id="curriculum"></a>
## 3. 三阶段课程地图与入口

| 阶段 | 单元 | 学会什么 | 不提前要求 |
|---|---|---|---|
| 初级 | B01–B08 | 结构、流程、元素/数字/宫廷入门、少量正位单牌、首次建议牌 | 全78背完、逆位大全、陌生牌比较、复杂牌阵 |
| 中级 | I01–I06与78逐牌 | 用完整含义解释单牌，结合元素/数字/角色，带背景学逆位与问题/位置 | 自行发明牌义、所有逆位同时适用 |
| 高级 | A01–A06 | 问题、位置、多牌关系、两路径与十位信息整合，形成有依据结论 | 预测现实事实的确定性、职业资格认证 |

每课详文见后文同编号。20课是方法课；78牌是可选的内容课，不要求顺序刷完98项才能应用。初级12张起步卡：m00,m01,m08,m09,m19,m21,w01,w04,c02,c10,s04,p08；不是一次必背清单。B06/B07直接关联p08、c02、m08；其他卡可在基础教学后自选。

### 用户怎么进入

- 首页只保留“学习”“抽牌”两个主方向；此处只定义学习方向的内容，未设计实际UI。
- 学习入口可“接着上次 / Continue learning”“随机学新牌 / Learn a random new card”“自己选牌 / Choose a card”。随机从尚未完成初学的牌中抽取，避免把固定起始牌当每次重置入口；已有进行中课程不自动替换。
- 课程内部不插入换牌、写感想、排行榜、信心评估。保留一个可暂停的返回；进度保存后可继续。
- 新人可直接选牌：缺少基础时在该牌必要节点解释术语，提供可选基础课链接，不硬锁全课程。系统不能因为用户点进一张中级牌就假定其懂逆位。
- 逐牌首次路径是T1/Q1、T2/Q2、总结；T3/Q3正逆位深化在I04讲解后推荐，可主动进入，未学I04时先显示逆位短讲。各R分支仅实际困难时进入；V1为后续回访，不顺序强塞在同次初学末尾。
- 已经学过的牌可直接进入针对性回访或主动重学；重学不删除历史证据。

<a id="ui-copy"></a>
## 4. 共用页面与展示文案

单牌教学页固定牌图与名称区域，接着是环节名、一句指引、教学或问题、操作与反馈。图文能在窄屏纵向阅读；不把全部后台规则、评分维度或分支路径展示给用户。多牌课固定整阵小视图与当前讲解区，不能因切换位置把用户锁在单牌详情。逐牌脚本中的教学与题目按步骤呈现，不能一次倾倒整篇。

<a id="learner-first-copy"></a>
### 学牌页面只对学习者说话（用户最新确认，2026-09-16）

这条约定覆盖整个学牌环节：介绍、讲解、例子、题干、选项、答题反馈、提示、补讲、动画字幕、操作按钮、暂停恢复及完成页。唯一读者是正在学习的人。普通说明直接按中文习惯说清楚，不先摆出一个生硬词，再加一段释义。只有需要掌握的塔罗名称（如正位、逆位、牌位、花色）才保留，并在首次使用时简短说明。关键词也用常用词整理意思，不因为原稿或英文用了抽象词就照搬。

- **会展示的内容**：告诉学习者这张牌在说什么、这个例子发生了什么、现在需要回答什么，以及选项为什么对或错。每句话都要有清楚的对象；问行动就给行动选项，问含义就给含义选项。
- **不展示的内部内容**：目标与前置、知识点编号、题目ID、答案键、已教依据、补学触发条件、评分与证据规则、调度、验收状态、分镜时长和实现说明。本文保留这些供协作使用，不能把整段Markdown直接转换为学习页面。英文同样遵守。
- **不要出现的口吻**：“本题验证……”“符合已教条件”“保留核心主题”“完成迁移”“让理解收敛”。改成针对眼前例子的解释，例如“题目说他每天都练，所以不能说他完全没练”。这不是禁词表：必须看整句话是否在帮助学习者，而不是机械换近义词。
- **不增加替代负担**：不用自评、信心打分、必填感悟或“我已掌握”按钮来完成作者的记录需求。已有答题、提示和暂停记录留在内部；阅读继续按钮不代表答对。
- **反馈不重复宣布答案就结束**：明确指出所选句子与刚才学过的哪一点不符，再解释原因。不要让学习者猜“这符合本课核心”到底指哪部分。
- **交互必须有学习用途**：让人看清牌、理解讲解、作答、得到帮助、继续或暂停。若一个动作只为展示产品设计、记录感悟或增加点击，就不进入核心学习链路。仍保留必要的返回和恢复，不以所谓专注为由把用户困住。
- **句子验收**：按首次接触这张牌的顺序阅读；不靠后文替前文补意思。检查是否需要重读才能知道主语、正在问什么、选项回答什么、解释依据什么。不要用硬性字数上限把句子切成缺主语的短词。

| 用途 | 中文实际文案 | English copy |
|---|---|---|
| 教学继续 | 继续 | Continue |
| 讲解重播 | 再看一遍 | Watch again |
| 动画暂停/恢复 | 暂停 / 继续播放 | Pause / Resume |
| 静态版本 | 看分步图 | View the steps |
| 练习提示 | 给我一点提示 | Show a hint |
| 没有作答 | 请选择一个答案 | Choose an answer |
| 客观答对 | 答对了。 | Correct. |
| 客观答错 | 这题选错了。 | That answer is incorrect. |
| 一轮补学入口 | 我们换个例子看。 | Let's look at another example. |
| 辅助完成 | 稍后会换个例子，再练练这一点。 | We will practise this again later with another example. |
| 两轮后仍困难 | 先看一下刚才的重点，再往下学。这道题以后会换个例子再练。 | Review the key point, then continue. We will return to this with another example later. |
| 课程结束 | 这一课完成了。 | Lesson complete. |
| 单牌结束 | 这张牌的初次学习完成了。 | Your first lesson on this card is complete. |
| 下一步 | 继续学一张 / 返回课程 | Learn another card / Back to lessons |
| 暂停 | 暂停并返回 | Pause and return |
| 恢复 | 接着上次继续 | Continue where you left off |
| 无更多已编题 | 这次先学到这里，下次换个例子再练。 | We will stop here for now and try another example next time. |

**内部呈现说明，不展示给学习者**：正确／错误提示后，使用该题已写好的选项解释；不要把“下方跟随本题逐项解释”等编写指令当成文案。上表第一列只是内部用途名称，不是页面标题。

不能把按钮名“我想好了”或“继续”解释为正确回答。题目的A/B标签只为文档定位；实现时必须绑定稳定选项ID，换序后反馈与答案一同换位，不根据字母判断。

<a id="adaptive-contract"></a>
## 5. 动态补学与进度契约

### 5.1 观察什么，不观察什么

只使用实际提交选项、所用提示、目标知识、题目版本和历史完成情况。正确一次是一次证据，不是“掌握率100%”。阅读时长、看动画、点继续、语言切换和暂停都不计对错；不收集信心或自评，不推断私人心理状态。局部正确不代表整个牌义都会。

每个脚本定义Q（主练习）、R（替代补讲＋补练）、V（延迟换境练习）。错误项体现一个明确误解，但只是“此次可能需要补的内容”，不能给人贴能力标签。选项必须已由当前教学提供判据。没有明确判据的开放解读不自动判唯一正确，更不能要求用户自评补位。

### 5.2 当次路由（设计约定，未实现）

1. 主讲解结束后用户自行继续进入Q。无提交不记答错；退出只保存位置。
2. Q正确且未用提示：显示该项的实际理由，继续下一知识点。主Q不因缺少自评而额外加一张问卷。
3. Q错误：显示明确错因和正确依据；进入对应已编R。大牌/宝剑/星币Q1→R1、Q2→R2、Q3→R3；权杖/圣杯Q1→R1、Q2→RA、Q3→R2；课程Q1→R1、Q2→R2。不能重放原题直到答对。
4. 同目标一次会话最多两轮补讲＋补练。R首次仍错时使用另一个已编替代单元中适配该误解的内容；无匹配单元时不硬套、不即兴编题，直接总结并留待回访。两轮是上限，不是必做数量。
5. R正确：标为辅助完成，不抹去原错误；继续原课程中断位置。仍错：给本节具体总结，标记待回访，继续或完成。R内容不能在同次重新归入主Q再增长分数。
6. 使用提示后Q正确，按辅助完成处理；提示给教学相关线索，不提前用颜色暴露选项。主动查看答案不算独立正确。
7. 题目有争议/无法唯一判分：停用该题的正确性证据，修订题目版本；不惩罚历史用户，不凭“作者本意”强判。
8. 完成页显示学过的具体内容及下一入口，不显示“你已经精通/准确率等于能力”。

R分支按目标调用，不按字母猜用途。本轮每张牌均已有核心、应用、逆位三种对应补讲及新题；分支表见覆盖章节。不得把一次回访正确扩展为不相关目标已经掌握。

### 5.3 延迟回访与退出恢复

- 本轮参数为待试学默认：有错误/提示的目标下一学习日优先回访；独立完成的目标可先在约3日后回访，之后根据连续独立表现逐步延至约7日、14日。不是精确遗忘曲线、不是“7天保证记住”，不更改现有应用调度。
- V1验证具体目标与新情境，不能把同题选项换序当新题。V1完成后短期无新题时延后再问，不能伪造无限题库。未来题库扩充需同样审阅。
- 推荐回访不阻止自选新牌。长期未学先少量检查近期已学内容，不列巨额“欠题”；每次检查只据已编题作判断。
- 会话保存单元ID、步骤ID、题目/内容版本、已提交选项、提示状态、当前补学轮数、当前语言及动画停留步骤。返回恢复原位置，不重抽题、不重置牌、不自动重复计分。
- 旧存档保留，不把旧自评分强行改写成独立答题证据；新进度嵌入原journey.academy并保留历史字段，三种存储键不变，旧格式导入须通过回归。
- 动画中断恢复为该步骤可阅读的静态状态；用户可重播，不自动完成题目。

### 5.4 游戏机制边界

学习奖励只说明实际进步，如“你用这个含义回答了一个新的问题 / You used this meaning in a new situation.”不以生命、限时、连续登录惩罚、随机金币替代课程。机制动态来自已审核知识点、变式与分支选择，不依赖联网模型临时生成答案；离线主链路完整。AI可在未来辅助解释，但不得悄悄改变答案标准、混淆教学与真实抽牌。

<a id="motion-contract"></a>
## 6. 动画与静态教学契约

本节是制作说明，不是已交付的动画资产。每个脚本必须引用本契约并给出实际目标、起止状态、说明和静态替代。所有时长是待试学建议，不是限制用户阅读的倒计时。

- 单牌图取[资产清单](../assets/manifest.json)的稳定ID；不改变图中的人物/物件来论证牌义，不换现代重绘或AI图。
- 画面事实、传统含义与我们的助记解释分别说明；聚焦只是指示注意，不声称象征是唯一可推导答案。
- 开始按钮/本步骤进入可触发短演示；讲解的最终状态必须保持，直到用户点“继续”。暂停、重播、跳过/静态分步图均可用；减少动态时直接显示带编号的静态图与全部文字。
- 轮廓高亮/焦点转移建议每个焦点约0.6–1.2秒，完成后停留；翻转或换位约0.5–0.8秒。流程洗牌可分步约2秒/步，用户控制下一步。不得强迫等长仪式才能学一道题。
- 旋转逆位时同时展示“正位/逆位 Upright/Reversed”标签；旋转不是解释，必须有背景与主题变化说明。凯尔特交叉横牌不等于逆位。
- 同牌换位显示已声明的位置含义，保留问题与牌名；不要靠动画结束后记忆来判断位置。
- 颜色不是唯一编码：数字、标签和说明并存；不闪烁、不抖屏惩罚、不强制音效；无声音也能理解。
- 手机固定图区不造成整页跳动；放大图退出回原滚动位置；底部操作与系统安全区域不遮题目反馈。动画不是页面刷新。
- 手势有点击替代；滚动不触发选牌；教学演示的牌序固定且标为示范，不能冒充真实随机结果。



<a id="lesson-scripts"></a>
## 7. 20课索引与Word逐课对应

| 稳定ID与脚本 | Word原课名（顺序不改） |
|---|---|
| [B01 认清地图：78 张牌分别是什么](#lesson-b01) | 第 1 课　认清地图：78 张牌分别是什么 |
| [B02 走完流程：一次占卜怎样开始和结束](#lesson-b02) | 第 2 课　走完流程：一次占卜怎样开始和结束 |
| [B03 理解花色：元素怎样帮助记忆](#lesson-b03) | 第 3 课　理解花色：元素怎样帮助记忆 |
| [B04 使用数字：线索不能替代单牌](#lesson-b04) | 第 4 课　使用数字：先搭记忆线索，再回到单牌 |
| [B05 认识宫廷：角色不是年龄与性别](#lesson-b05) | 第 5 课　认识宫廷：角色不是年龄和性别答案 |
| [B06 学懂星币八：把词变成有内容的意思](#lesson-b06) | 第 6 课　学懂一张牌：星币八的关键词怎样连成意思 |
| [B07 分别认识圣杯二与力量](#lesson-b07) | 第 7 课　再学两张：圣杯二与力量各自说清什么 |
| [B08 完成第一张建议牌](#lesson-b08) | 第 8 课　独立完成第一张建议牌，并安排下一次学习 |
| [I01 用一致的方法，把一张牌学完整](#lesson-i01) | 第 1 课　用同一个框架，把一张牌学完整 |
| [I02 元素和数字怎样帮助理解圣杯十](#lesson-i02) | 第 2 课　用元素和数字整理记忆，不用公式替代牌义 |
| [I03 宫廷牌：把角色与花色用于具体问题](#lesson-i03) | 第 3 课　宫廷牌：把角色和花色组合起来 |
| [I04 逆位：保留主题，再判断变化](#lesson-i04) | 第 4 课　逆位：先保留主题，再判断哪里出了变化 |
| [I05 问题和牌位怎样改变表达](#lesson-i05) | 第 5 课　同一张牌，怎样随着问题和位置改变表达 |
| [I06 用三张已学过的牌完成短解读](#lesson-i06) | 第 6 课　用三张已学过的牌，完成一次短解读 |
| [A01 先问清楚，才能答到事情上](#lesson-a01) | 第 1 课　先问清楚，才能答到事情上 |
| [A02 守住牌义，再放进牌位](#lesson-a02) | 第 2 课　同一张牌，先守住含义，再放进牌位 |
| [A03 把多张牌连成主线](#lesson-a03) | 第 3 课　让多张牌形成主线，而非三段词典 |
| [A04 让逆位进入整组，而非另列一串词](#lesson-a04) | 第 4 课　把逆位放回整组牌里 |
| [A05 二择一：比较两条完整路径](#lesson-a05) | 第 5 课　二择一：比较两条完整路径 |
| [A06 凯尔特十字：整合复杂信息](#lesson-a06) | 第 6 课　凯尔特十字：处理复杂信息并收束答案 |

## 课程脚本 / Lesson scripts

以下 20 课与 Word 的 8＋6＋6 课逐项对应。每课的 T、Q、R、V 编号是固定内容标识，不是界面文案。全体案例均为原创虚构。`Q` 为主练习，`R1/R2` 为按误解选择的两种实际补学内容，`V1` 为延后变式；不默认让每个人完成所有补学题。每次学习最多触发两轮补学，调用 [动态教学约定](#adaptive-contract)。动画采用 [动效约定](#motion-contract)，通用按钮及正确／错误提示采用 [双语交互文案](#ui-copy)。题表的“反馈”在公共正确／错误标记后逐项展示。所有用户可见内容以“中文 / English”配对；作者说明不得作为产品文案显示；标题中的稳定编号和审核标签也不展示，页面只使用单独标明的学习者文案。英文是语义一致的译文，不强制逐字对应。两个选项的题目用于清楚检查本课知识，不能单凭一次二选一推定长期掌握。多次跨情境、无提示作答才累计证据。 本稿 A/B 是审稿定位，不得作为持久答案 ID；展示时可打乱选项，正确性必须跟随选项内容的稳定标识，反馈随同选项移动。每课完成文案描述本轮接触与练习，不用于宣告长期掌握；两轮补学后仍困难时，优先使用公共未完成知识点提示，并保留本课进度。

<a id="lesson-b01"></a>
### B01｜认清地图：78 张牌分别是什么 / Meet the deck: how the 78 cards fit together

**目标与边界**：识别大牌、数字牌、宫廷牌；无前置；不要求知道任何牌义。Word 对应初级第 1 课。来源 S01（less3）；例子原创。

**教学屏幕**
- **B01-T1**「我们用的是伟特系塔罗，英文简称 RWS。一副有 78 张，分成 22 张大阿尔卡纳和 56 张小阿尔卡纳。先认清分类，不用急着背牌义。/ We use the Rider–Waite–Smith deck, abbreviated RWS. It has 78 cards: 22 Major Arcana and 56 Minor Arcana. Start with the groups; you do not need to memorize meanings yet.」
- **B01-T2**「小阿尔卡纳分成权杖、圣杯、宝剑、星币四组，这四组叫“花色”，不是指颜色。每组有王牌（Ace，可记作 1）到十，共 10 张数字牌，还有侍从、骑士、王后、国王 4 张宫廷牌。所以 56 张小牌里，已经包括 40 张数字牌和 16 张宫廷牌。 / The Minor Arcana has four suits—Wands, Cups, Swords and Pentacles. A suit is a group, not a color. Each has ten numbered cards, Ace (which can be remembered as 1) through Ten, plus Page, Knight, Queen and King. The 56 minors already include 40 numbered cards and 16 courts.」
- **B01-T3**「试着拆开牌名：星币八＝星币花色＋数字八；圣杯骑士＝圣杯花色＋骑士角色；力量是大阿尔卡纳。本教材力量编号 VIII、正义编号 XI。大牌不代表一定更重要或更准确。/ Read the name: Eight of Pentacles combines a suit and a number; Knight of Cups combines a suit and a court role; Strength is a Major Arcana card. Here Strength is VIII and Justice is XI. Major cards are not automatically more important or more accurate.」依次展示 p08、c12、m08，先讲一张再切换，不要求比较牌义。

**分镜 B01-M**：完整牌背组→22／56 两区→56 区分成四花色、每组标注 10＋4。用户点“展开牌组 / Unfold the deck”开始，三段各约 0.8 秒，段末停留等继续；目标是数量包含关系，非视觉辨牌。可暂停、重播；静态为三幅有数量标签的分类图，不必实际画 78 张微小卡。

**练习与逐项反馈**
| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| B01-Q1「圣杯王后属于哪一类牌？/ Where does the Queen of Cups belong?」 | A「宫廷牌 / Court card」→「王后是四种宫廷角色之一。/ Queen is one of the four court roles.」；B「数字牌 / Numbered card」→「数字牌是王牌至十；王后是角色。/ Numbered cards run from Ace to Ten; Queen is a role.」 | A；T2 |
| B01-Q2「56 张小牌是否已经包含 16 张宫廷牌？/ Do the 56 minors already include the 16 courts?」 | A「不包含 / No」→「这样会重复计算宫廷牌。/ That would count the courts twice.」；B「包含 / Yes」→「40 张数字牌加 16 张宫廷牌等于 56。/ Forty numbered cards plus sixteen courts make 56.」 | B；T1–T2 |

**补学内容与新题**
- **B01-R1 教学**「先看后半个名字：八是数字，骑士是角色。分类不需要知道它是什么意思。/ Look at the second part of the name: Eight is a number; Knight is a role. You can classify a card before knowing its meaning.」
  题「宝剑侍从应放在哪一类？/ Where does the Page of Swords belong?」A「宫廷牌 / Court」→「侍从是角色，因此属于宫廷。/ Page is a role, so this is a court card.」；B「数字牌 / Numbered」→「侍从不是王牌至十中的数字名称。/ Page is not a rank from Ace to Ten.」答案 A；纠正分类错误，依据 T2。
- **B01-R2 教学**「56 张小牌里已经有 40 张数字牌和 16 张宫廷牌。算整副牌时，不要把宫廷牌再加一次。/ Picture 56 as a box holding two bags: 40 cards and 16 cards. Both bags are already inside.」
  题「整副牌怎样相加？/ Which sum describes the whole deck?」A「22＋56＋16 / 22+56+16」→「16 已包含在 56 中。/ The 16 are already inside the 56.」；B「22＋40＋16 / 22+40+16」→「三类互不重复，合计 78。/ The three groups do not overlap and total 78.」答案 B；纠正重复计数，依据 T1–T2。

**B01-V1 延后题**「权杖九的名字由什么组成？/ What makes up the name Nine of Wands?」A「花色＋数字 / Suit + number」→「权杖是花色，九是数字。/ Wands is the suit and Nine the number.」；B「花色＋宫廷角色 / Suit + court role」→「九不是侍从、骑士、王后或国王。/ Nine is not a court role.」答案 A；下一次基础回访使用，检查名称拆分。

**完成**「本课介绍了牌组的分类。接下来学一次抽牌如何开始。/ This lesson introduced the deck’s categories. Next, learn how a reading begins.」正常下一课 B02；自选单牌返回原路线。不将分类答对记成已会牌义。

<a id="lesson-b02"></a>
### B02｜走完流程：一次占卜怎样开始和结束 / Complete the process: from question to reading

**目标与边界**：完成一张建议牌流程；前置 B01，可补其分类摘要；不考牌义记忆，不要求仪式用品。Word 初级第 2 课；S01 less8、less5，动作编排原创。

**教学屏幕**
- **B02-T1**「先确定问题和牌位，再抽牌。问题告诉你在问什么；牌位告诉你这张牌负责回答哪一部分。今天问：这周我可以怎样练摄影？这一张用来给行动建议。今天先读正位，也就是牌图朝正方向；倒着的情况以后再学。 / Choose the question and position before drawing. The question says what you are asking; the position says which part this card answers. Today: How can I practice photography this week? This card offers action advice. We start with upright cards, whose images face the usual way; reversed cards come later.」
- **B02-T2**「洗牌是打乱牌序。这里示范把牌分成两叠、交替合回；实体牌也可使用你拿得稳的方法。切牌是把牌堆分开后重新合拢，可作为洗牌结束的标记，不是必须步骤，没有唯一次数。然后选一张，仍按刚才定好的“行动建议”来读。/ Shuffling changes the order. We demonstrate splitting into two piles and interleaving them; with physical cards, use a method you can handle comfortably. Cutting separates and recombines the stack. It can mark the end of shuffling, but is optional and has no mandatory count. Draw one card and keep the position you agreed on.」
- **B02-T3**「示范抽到星币八。这张牌讲的是认真练技能，把手上的事做熟、做好。回答摄影问题时，可以这样建议：“挑一个想练的拍摄技巧，拍一些照片，再看看哪里需要改。”最后用一句话回答最初的问题。不熟悉这张牌时，可以查资料。它没有告诉我们哪天会获奖。/ Our example draws the Eight of Pentacles: attentive skill practice and care for quality. The advice becomes: choose one photography skill, take photographs, then review the results. Finish with a concise answer. We did not ask when you would win an award, so advice is not an award guarantee. Looking up an unfamiliar card is allowed.」

**分镜 B02-M**：完整牌堆→两叠交错合拢（约 2.4 秒）→用户选切牌分点→上叠移到下方并合回（约 1.6 秒）→点一张抽出并翻开 p08（约 1 秒）。每一步说明先出现，用户点“看示范 / Watch”或“继续 / Continue”；允许跳过切牌、暂停、重播，每步终态保留。静态四帧显示分叠、合拢、切牌、抽牌。手势不计准确度，不能用拖动难度拦住课程；为教学预设 p08 并标注“教学示范 / Worked example”，不假称随机。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| B02-Q1「应该在什么时候决定，这张牌用来给行动建议？/ When do you define the advice position?」 | A「抽完牌、看清牌面后 / After drawing and seeing the card」→「原本问的是“接下来怎样做”，看完牌后再改，就变成了另一个问题。/ Changing it afterward alters the reading's rules.」；B「抽牌前 / Before drawing」→「这样知道牌在回答什么。/ That defines what the card will answer.」 | B；T1 |
| B02-Q2「本课的切牌必须做三次吗？/ Must you cut three times in this lesson?」 | A「不必，切牌是可选操作 / No; cutting is optional」→「本课不规定次数。/ This lesson does not prescribe a count.」；B「建议按固定三次切牌，让这套流程更完整。 / Cutting exactly three times is recommended to complete this reading routine.」→「切牌在本课是可选步骤，没有固定次数；洗好牌后可以直接按原问题抽牌。 / Cutting is optional here and has no required count; after shuffling, you may draw for the agreed question.」 | A；T2 |

- **B02-R1 教学**「抽牌前定好这一张给建议，解牌时就要回答接下来怎样做。/ A position is a task label: once it says Advice, the interpretation should address an approach.」题「已经约定建议位，抽到牌后能为得到满意答案改成结果位吗？/ Can you change an agreed advice position into an outcome position to get a preferred answer?」A「可以 / Yes」→「原先问的是怎样做，改成结果位后，回答的就不是同一个问题了。/ Changing the task breaks consistency.」；B「不能，仍然按建议位来读 / No; keep its task」→「保留了抽牌前的约定。/ This preserves the agreement.」答案 B，针对 Q1。
- **B02-R2 教学**「切牌在本课是可选步骤，没有必须完成的次数。是否切牌，不改变已经定好的问题和牌位。/ Cutting is optional here and has no required count. Cutting or not cutting leaves the agreed question and position unchanged.」题「小安洗好牌后忘了切牌，已按原问题抽出一张。本课怎样继续？/ An shuffled but forgot to cut, then drew one card for the agreed question. How should this lesson continue?」A「保留原问题和位置，继续读这张牌 / Keep the question and position and continue reading this card」→「没有漏掉必须条件，切牌本来就是可选操作。/ No required condition is missing; cutting was optional.」；B「先补做一次切牌，再按原问题重新抽一张。 / Add a cut now, then draw again for the same question.」→「这个做法没有解决眼前的情况。没有漏掉必须条件，切牌本来就是可选操作。 / This action does not resolve the situation described. No required condition is missing; cutting was optional.」答案 A；T2，回应 Q2 的必做次数误解。

**B02-V1**「问本周怎样练习，抽到星币八建议位。哪句话是在回答本周怎样练习？/ For this week's practice, Eight of Pentacles appears as advice. Which answer keeps that task?」A「你下周必得奖 / You will win next week」→「增加了没有提供的事件与时间保证。/ This adds an unsupported event and date.」；B「实际练一个技能并检查作品 / Practise a skill and review your work」→「把牌义转成做法。/ This turns meaning into an action.」答案 B，依据 T3，延后与 B06 联动。

**完成**「你看过了一次完整示范：先定问题和牌位，再洗牌、选牌，最后围绕问题解读。接下来认识四种花色。/ You have followed a complete example: set the question and position, shuffle, draw, then interpret the card for that question. Next, meet the four suits.」下一课 B03；不记录教学抽牌为私人占卜历史。

<a id="lesson-b03"></a>
### B03｜理解花色：元素怎样帮助记忆 / Suits and elements as memory aids

**目标与边界**：理解四花色观察角度；前置 B01；不从背景颜色猜元素、不推导整张牌义。Word 初级第 3 课；S01 less3。

**教学屏幕**
- **B03-T1**「权杖对应火，可以帮你记住行动、热情和创造；圣杯对应水，常说感受和人与人的关系；宝剑对应风，常说想法、判断和沟通；星币对应土，常说钱、物品、技能，以及生活中的实际安排。这是本课用来理解塔罗的对应方式。/ Wands–Fire highlights action, motivation and creativity; Cups–Water highlights feelings, relationships and responses; Swords–Air highlights thought, judgment and communication; Pentacles–Earth highlights resources, skills and practical arrangements. These are symbolic correspondences used by this course, not scientific categories.」
- **B03-T2**「同样是合办小店：想不想开始，是动力；是否信任彼此，是关系；约定是否清楚，是沟通；预算够不够，是资源。一件事可以有四个观察角度。/ Consider opening a shop together: willingness to begin concerns motivation; mutual trust concerns relationships; clear agreements concern communication; a workable budget concerns resources. One situation can involve all four perspectives.」
- **B03-T3**「因此圣杯不只用于恋爱，星币也不只用于赚钱。先确认花色，再学具体牌。画面背景有水，不意味着整张牌都按圣杯来读。/ Cups is not restricted to romance, and Pentacles is not restricted to money. Identify the suit, then learn the particular card. Water in a picture does not turn the card into a Cups card.」

**分镜 B03-M**：四花色符号固定→用户逐项点开对应含义，约 0.35 秒淡入→同一小店案例切换四个说明。每项保留可返回；不使用火焰爆炸等替代解释。静态为四行双语配对与同一案例；可暂停、重播展示顺序。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| B03-Q1「这次只看“预算够不够、工具够不够用”，对应刚学的哪种花色？/ Which suit relates directly to having enough money and tools?」 | A「星币：钱和工具 / Pentacles: money and tools」→「预算是可用的钱，工具是做事要用的东西，都属于星币关注的实际资源。/ Budgets and tools are practical resources.」；B「圣杯：彼此的感受 / Cups: feelings between people」→「这里在谈可用的钱和工具，没有在谈彼此的感受。/ Emotional response is not the resource perspective specified here.」 | A；T1–T2，不表示其他花色不能进入工作问题 |
| B03-Q2「工作问题里能讨论圣杯的关系角度吗？/ Can Cups' relationship perspective matter in a work question?」 | A「可以，不过工作里的圣杯主要看同事之间是否亲近。 / Yes, but in work Cups mainly concerns whether colleagues feel personally close.」→「把圣杯只缩成“同事是否亲近”，会漏掉工作中的信任、理解和配合；这里正要看同事之间的信任。 / Reducing Cups to whether coworkers feel close misses trust, understanding, and cooperation at work; this example specifically concerns trust between colleagues.」；B「能，例如同事的信任 / Yes, such as trust among colleagues」→「工作里也有同事之间的信任，所以也能用圣杯来理解。/ Life domains do not restrict suits.」 | B；T2–T3 |

- **B03-R1 教学**「先看看这句话在谈什么。谈钱、时间、工具，可以想到星币；谈感受、信任、彼此怎样回应，可以想到圣杯。一件事里可能两方面都有，这题先练习分清正在谈哪方面。/ Start with the nouns: money, time and tools are resources; feelings, trust and responses concern relationships. Both can matter in the same situation. First, look at which aspect the sentence describes.」题「“对方听后感到被理解”属于哪一栏？/ Which column fits feeling understood after being heard?」A「圣杯：感受与回应 / Cups: feelings and responses」→「重点是情感体验。/ The focus is emotional experience.」；B「星币：预算 / Pentacles: budget」→「这里没有预算信息。/ No budget is described.」答案 A，依据 T1。
- **B03-R2 教学**「同一件事里，可能既要考虑钱，也要考虑感受、沟通和行动。不能把工作只分给星币，把恋爱只分给圣杯。/ Suits are four lenses, not four rooms that admit only certain questions.」题「恋爱中的共同生活开支，可以从星币角度看吗？/ Can Pentacles address shared living expenses in a relationship?」A「不可以 / No」→「恋爱也要安排开支，不能因为是恋爱问题就排除星币。/ This again confuses a suit with a life domain.」；B「可以 / Yes」→「两个人一起生活，也需要安排钱和其他生活用品。/ Relationships also involve practical resources.」答案 B，依据 T2–T3。

**B03-V1**「合作前，大家要把“谁负责什么、什么时候完成”说清楚。这一部分更直接对应哪种花色？/ Before working together, people need to clarify who will do what and when it will be finished. Which suit directly relates to clarifying these agreements?」A「宝剑：把想法和约定说清楚 / Swords: clear thoughts and agreements」→「题目在说怎样把安排讲清楚，对应刚学的沟通和判断。/ The question concerns making arrangements clear, matching the communication and judgment you learned.」；B「圣杯：彼此是否亲近、信任 / Cups: closeness and trust」→「同一次合作也可能涉及信任，但这题问的是把安排说清楚，没有在问大家是否亲近。/ The same project may involve trust, but this question asks about clear arrangements, not how close people feel.」答案 A；T1–T3；用新案例回访。

**完成**「元素帮助找到观察角度，具体含义仍要回到单牌。接下来认识数字的作用。/ Elements offer perspectives; specific meanings still belong to individual cards. Next, explore numbers.」下一课 B04。

<a id="lesson-b04"></a>
### B04｜使用数字：线索不能替代单牌 / Numbers: a guide, not a formula

**目标与边界**：认识数字辅助及局限；前置 B01、B03；不背统一口诀，不要求比较陌生牌。Word 初级第 4 课；数字编排为本教材方法，S01 提供单牌结构背景。

**教学屏幕**
- **B04-T1**「数字可以帮助记忆：王牌让人想到刚开始；二让人想到两方之间的关系；三让人想到事情开始发展；四让人想到安定下来或暂时停住；五让人想到原来的状态被打破；六让人想到重新调整；七让人想到检查目前的情况；八让人想到继续做下去；九让人想到已经积累了不少；十让人想到一件事发展到最后阶段。这些只是大致提示，尤其七、八、九，不能直接套在每一张牌上。/ Numbers can organize memory: Ace suggests a beginning; Two, two sides or response; Three, development; Four, structure or pause; Five, disruption; Six, adjustment; Seven, testing; Eight, an ongoing process; Nine, accumulation; Ten, a developed stage or ending. These are broad prompts, particularly loose for Seven, Eight and Nine.」数字表可随时查看，不计背诵分。
- **B04-T2**「以星币八为例：“八”可以帮助记住持续练习。但还要单独学这张牌的意思：认真练技能，把手上的活做好。只知道它对应土、编号是八，还不够了解这张牌，也算不出人物能赚多少钱。/ Focus on the Eight of Pentacles: Eight may prompt attention to a continuing process, but you still need its meaning—attentive skill practice and quality. Earth plus Eight cannot tell you what the craftsperson is doing or predict an income.」展示 p08，不引入对比牌。
- **B04-T3**「例如小林在学木工，可以先用“认真练习，把活做好”来记星币八，再用数字八帮助记忆。如果数字的说法反而让你困惑，先学这张牌本身就可以。/ For Lin learning woodwork, first use the card's learned meaning of practice and detail; then use the number as an index. If the number prompt confuses you, set it aside.」

**分镜 B04-M**：p08 固定→点击数字 VIII，出现“数字只帮忙记忆 / Ongoing process is only a cue”→点击回到人物做工细节与完整意思。每段约 0.5 秒，用户控制停留；不让数字自动“合成”牌义。静态为数字提示和单牌说明并列；可重播。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| B04-Q1「“八＋星币”是否已足够学懂全部牌义？/ Is Eight plus Pentacles enough to know the complete card meaning?」 | A「够，可以跳过牌义 / Yes, skip the meaning」→「这样遗漏这张牌自己的场景与传统解释。/ That omits its scene and interpretive tradition.」；B「不够，还需单牌学习 / No, the individual card still needs study」→「还要单独学这张牌在说什么。/ Structure does not replace meaning.」 | B；T2 |
| B04-Q2「数字提示越用越困惑时，先做什么？/ If a number prompt increases confusion, what should come first?」 | A「回到已讲清的单牌含义 / Return to the taught card meaning」→「先学懂这张牌就可以，不必等到数字全背熟。/ Numbers are aids, not a gate.」；B「先选一套自己最顺手的数字口诀，用它解释同数字的牌。 / Choose the number mnemonic that feels easiest, then use it to explain cards with that number.」→「数字提示越用越乱时，先回到已经讲清的单牌含义；不用等背完数字体系再理解牌。 / If number cues create confusion, return to the card meaning already taught; memorising the whole number system is not a prerequisite.」 | A；T1、T3 |

- **B04-R1 教学**「书架编号帮你找书，但不等于书的内容。数字对牌义也起类似的整理作用。/ A shelf number helps you find a book; it is not the book's content. Numbers similarly organize card meanings.」题「知道编号以后，还要不要了解这一张牌讲什么？/ After learning the number, do you still need this card's meaning?」A「不要 / No」→「只知道编号，还不知道这张牌在说什么。/ That mistakes an index for an explanation.」；B「要 / Yes」→「编号没有替代内容。/ The index does not replace the content.」答案 B，依据 T2。
- **B04-R2 教学**「如果数字口诀和刚学的牌义对不上，先按这张牌本身来记。不必为了凑口诀，把所有同数字的牌都解释成一个意思。/ If a broad number cue does not fit an already-taught card meaning, return to that meaning. Numbers are indexes, not a requirement for identical same-number meanings. Setting a cue aside does not prevent understanding.」题「你理解星币八在讲技能练习，却被‘八’的不同口诀弄混。下一步怎样学？/ You understand Eight of Pentacles as skill practice but conflicting number-eight slogans confuse you. What next?」A「先记住认真练习、把活做好的意思，暂时不背数字口诀 / Use the taught meaning of skill practice and detail, setting the slogan aside」→「保留已有理解，没有为口诀改写牌义。/ This retains understanding without rewriting the card to fit a slogan.」；B「先把不同的“八”统一成一条口诀，再用同一口诀解释星币八。 / First combine the different Eights into one rule, then use that rule to explain the Eight of Pentacles.」→「数字口诀只是辅助。既然已经理解星币八在讲认真练习，就先保留这层牌义，不必强行统一口诀。 / Number cues are only aids. Since you already understand the Eight of Pentacles as careful practice, keep that meaning instead of forcing every Eight into one rule.」答案 A；T1–T3，回应 Q2 的强行统一数字。

**B04-V1**「忘了数字八的提示，但仍理解星币八的技能练习，可以继续应用吗？/ If you forget the number cue but understand the Eight of Pentacles' skill practice, can you still use it?」A「先暂停应用，等把数字表背熟后再解释这张牌。 / Pause using the card until the full number system has been memorized.」→「忘了“八”的数字提示不影响使用星币八；已经理解认真练习和改进，就可以继续解读。 / Forgetting the number cue does not block using the Eight of Pentacles; understanding practice and improvement is enough to continue.」；B「可以 / Yes」→「单牌理解是主线，数字是帮助。/ Card understanding is primary; number cues help.」答案 B；T3。

**完成**「你知道怎样借助数字，也知道什么时候不用它。接下来认识宫廷角色。/ You know how numbers can help and when to leave them aside. Next, meet court roles.」下一课 B05。

<a id="lesson-b05"></a>
### B05｜认识宫廷：角色不是年龄与性别 / Courts: roles are not ages or genders

**目标与边界**：理解角色入口；前置 B01、B03；不背 16 张、不推断具体人物身份。Word 初级第 5 课；S01，简化角色组织为教材编排。

**教学屏幕**
- **B05-T1**「先用做事方式来认识宫廷牌：侍从开始接触和学习；骑士主动追求想要的东西；王后留意自己和别人的需要，并给予照顾；国王安排事情，并承担责任。这只是入门时的记忆提示，四种角色没有高低之分，也不是每个人必须依次经历的阶段。/ Start with behaviour: Pages suggest discovery and learning; Knights, action and pursuit; Queens, understanding and care; Kings, coordination and responsibility. These are introductory cues, not a ranking or a mandatory life path.」
- **B05-T2**「把角色和花色放在一起看。星币侍从可以描述刚开始学一项实际技能、愿意认真打基础的状态。它不等于没能力，也不一定指小孩。接下来还要学习这张牌的具体含义。/ Role and suit work together. The Page of Pentacles combines practical skills with early learning: a useful cue is seriously beginning a practical subject. It does not mean incompetence or necessarily a child. The individual picture and meaning still need study.」显示 p11。
- **B05-T3**「例子：小周刚接触陶艺，认真练习基本手法。这里用星币侍从描述他的学习方式，不是在算年龄。王后也可以描述任何人的照料方式，国王可以描述任何人的组织责任。/ Example: Zhou has just started pottery and carefully practises basic techniques. Page of Pentacles describes a learning approach, not an age. A Queen can describe anyone's way of caring; a King can describe anyone's organizing responsibility.」

**分镜 B05-M**：四个角色标签固定→用户点“侍从”，出现“学习 / Learning”与 p11→点“放进例子 / See an example”，呈现陶艺文字例子，约 0.4 秒切换。不得用儿童变成人、男女图标来演绎角色；静态表保留四项解释，卡图保持同一位置，可暂停与重看。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| B05-Q1「本课哪种角色提示是‘开始接触新事物、学习基础’？/ Which role cue means initial discovery and learning?」 | A「侍从 / Page」→「侍从在本课代表刚接触一件事、愿意学习的状态。/ This matches the taught cue.」；B「国王 / King」→「本课用国王帮助记住安排事情、承担责任，不是刚开始学基础。/ Here the King's cue is coordination and responsibility.」 | A；T1 |
| B05-Q2「王后是否优先把王后理解为题目里较成熟的女性。解释成现实中的女性？/ Must a Queen mean a woman in real life?」 | A「优先把王后理解为题目里较成熟的女性。 / Read a Queen primarily as the more mature woman in the situation.」→「这个结论比题目给出的信息多走了一步。任何性别的人，都可能用这种方式做事。 / This conclusion goes beyond the information provided. The role does not fix gender or identity.」；B「不必，可指处事方式 / No, it can describe an approach」→「任何性别的人，都可能用这种方式做事。/ The role does not fix gender or identity.」 | B；T3 |

- **B05-R1 教学**「本课的侍从，先记开始学习；国王，先记安排事情、承担责任。看例子里的人正在做什么，不要按头衔大小猜。/ This lesson uses Page for beginning to discover and learn, and King for coordinating and taking responsibility. Identify the behaviour described rather than guessing by title.」题「新例：小安第一次学习器材操作，正在跟着示范练基础动作。更符合本课哪种角色的做事方式？/ New example: An is learning equipment operation for the first time and follows a demonstration of basic movements. Which taught role cue is direct?」A「侍从的初步学习 / The Page's initial learning」→「题目明确描述接触新技能、练基础。/ The question explicitly describes beginning a skill and practising basics.」；B「国王安排事情、承担责任 / The King's coordination and responsibility」→「例子是在跟着示范学基础，还没有说他在安排别人的工作。/ No team coordination or organizing responsibility is stated; it does not replace the learning cue.」答案 A；T1–T2，回应 Q1 的角色提示混淆。
- **B05-R2 教学**「本课用王后帮助记住留意别人的需要、给予照顾。看的是怎样做事，不能只凭牌名判断这个人是什么性别。/ Queen is a role used here for understanding and care, not a label establishing someone's gender. Start with behaviour and the question before deciding whether a specific person is relevant.」题「一位男性成员留意到同伴的需要，并主动照顾对方，能用本课王后的角色提示描述这种方式吗？/ A male group member understands companions' needs and provides care. Can this lesson's Queen cue describe that approach?」A「不能，男性不能体现王后角色 / No; a man cannot express a Queen role」→「这仍按头衔固定性别，忽略了本课描述的是行为方式。/ This still fixes gender from a title and ignores the behavioural approach.」；B「能，这里是在说他怎样关心和照顾同伴 / Yes; attend to the understanding and care」→「这里描述的是照顾同伴的方式，不是在判断性别。/ It preserves the role's meaning without making it an identity restriction.」答案 B；T3，回应 Q2 的固定性别误解。

**B05-V1**「一位经验丰富的人第一次学木工，能用侍从描述这次学习方式吗？/ Can a Page describe an experienced adult's first woodworking lessons?」A「能 / Yes」→「新领域的学习方式不由年龄决定。/ Learning a new subject is not determined by age.」；B「不太适合，经验丰富的人更接近国王角色。 / It is not a close fit because an experienced person is better represented by a King.」→「侍从描述的是进入新领域时的学习方式，不由一个人的年龄或其他领域经验决定。 / A Page can describe how someone enters a new field; age or expertise in another field does not decide that role.」答案 A；T2–T3。

**完成**「先看行为，再看问题在问谁。接下来用一张牌体验完整学习。/ Start with behaviour, then consider who the question concerns. Next, learn one card in full.」下一课 B06；相关单牌 [星币侍从](#card-p11)。

<a id="lesson-b06"></a>
### B06｜学懂星币八：把词变成有内容的意思 / Eight of Pentacles: meaning beyond keywords

**目标与边界**：理解正位、连接画面、应用到技能学习；前置 B01，B03 可现场查阅；不教逆位、不要求固定三个词。Word 初级第 6 课；修订原“固定三词测验”。S01 p8、S05；单牌 [p08](#card-p08)。

**教学屏幕**
- **B06-T1**「星币八讲的是专心做事、练习技能，把手上的事做熟、做好。可以用“专注、练习、不断改进、细心”帮助记忆，不必逐字背下来。/ The Eight of Pentacles often concerns attentive work, learning a skill and caring about quality. The focus is becoming skilled and careful in what you do. Focus, skill learning, refinement and attention to detail can all help organize the meaning; you need not memorize a fixed list.」
- **B06-T2**「画面里，人物低头加工一枚星币，旁边已有多枚作品。正在做工帮助记住投入，多件作品帮助记住练习，手中加工帮助记住细节。‘他一定得到加薪’不是图中事实；‘检查后改进’是把牌义用在学习中的方法。/ The figure works on a pentacle, with several pieces nearby. Working supports the memory of effort; repeated pieces, practice; the craftwork, detail. A pay rise is not a pictured fact. Reviewing and improving is an application of the meaning to learning.」
- **B06-T3**「例子：小林练琴，总在同一小节出错。星币八可以这样给建议：先把总出错的那一小节单独拿出来慢练，找到错在哪里，改好后再连起来弹整首。一直从头弹到尾，却不管反复出现的错误，很难把这一处练好。/ Example: Lin keeps making a mistake in one musical passage. As Eight of Pentacles advice, isolate it, check the technique and then return it to the whole piece. Repeating the whole piece without addressing the mistake spends time but misses this example's improvement.」

**分镜 B06-M**：完整 p08 常驻→用户点“看依据 / See the cues”，用不遮挡画面的柔和外框依次强调手中制作、旁侧成品（各约 0.6 秒）→右侧／下方对应解释停留。最后移除强调，保留完整意思。不可把成品变出质量等级或加画导师。静态为同图编号注释，可暂停、重播、放大后恢复原滚动位置。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| B06-Q1「小林总在同一小节出错。怎样练，才是在改进？ / Lin keeps making a mistake in the same passage. Which practice would help him improve?」 | A「把出错的小节多做几遍，先用熟练度弥补问题。 / Repeat the troublesome section several more times and use fluency to make up for the problem.」→「先找到反复出错的原因，再练习那一小节并检查动作是否改对，才会真正进步。 / Improvement starts by finding the repeated mistake, practising that passage, and checking whether the technique has changed.」；B「找出问题，练习并改进操作 / Find the difficulty, practise and improve technique」→「先找到错误，再练习改正，才能把总出错的这一小节练好。/ This preserves skill and quality.」 | B；T1、T3 |
| B06-Q2「哪项是牌图中可直接看见的？/ Which is directly visible in the picture?」 | A「人物正在制作星币 / A figure working on a pentacle」→「这是可见动作。/ This is a visible action.」；B「他已获得加薪 / He has received a pay rise」→「工资结果没有画在图里。/ A pay outcome is not depicted.」 | A；T2 |

- **B06-R1 教学**「练很多遍，不一定就改好了。这个例子里同一处总出错，下一步要先找出错在哪里。/ Working often and improving can coexist, but they are not identical. The example explicitly gives a repeated error, so the advice must address it.」题「练字总写歪同一笔，怎样练更能改正这一笔？/ When one stroke is repeatedly crooked, which action applies improvement?」A「不看结果地加写十页 / Add ten pages without looking at results」→「没有检查已知错误。/ This does not check the known error.」；B「单练那一笔，检查后再写 / Practise that stroke, review, then repeat」→「直接处理已知困难。/ This addresses the known difficulty.」答案 B；T3。
- **B06-R2 教学**「先说看见的，再说用来理解的：看见加工动作；用它记住认真工作。收入提高还需要别的信息。/ Separate what is seen from how it helps: we see craftwork; we use it to remember attentive work. Higher income needs other information.」题「旁边有多枚作品，就能确定每枚都更好吗？/ Do several finished pieces prove each is better than the last?」A「不能。能看见多件作品，但看不出哪件做得更好 / No, no quality comparison is shown」→「图上画出了多件作品，却没有告诉我们它们是不是一件比一件好。/ Quantity is visible; improvement piece by piece is not established.」；B「能 / Yes」→「这张牌可以帮助记住练习，但图画没有证明每次练习都进步了。/ This treats a practice theme as a verified result.」答案 A；T2。

**B06-V1**「学摄影时只收藏教程，很少拍摄。哪项用上星币八的本课含义？/ A photography learner collects tutorials but rarely shoots. Which action uses this lesson's meaning?」A「继续收藏，不开始练 / Keep collecting without practising」→「没有回应缺少实际练习的问题。/ It leaves the lack of practice unchanged.」；B「选一个技能实际拍摄，再检查照片 / Practise one skill by shooting and reviewing photographs」→「题目说很少实际拍摄，所以先动手拍，再检查哪里需要改。/ This applies effort, skill and quality to the context.」答案 B；T1、T3。

**完成**「本课把星币八的意思连到画面和实际练习。接下来分别学圣杯二和力量。/ This lesson connected the Eight of Pentacles to its picture and practical learning. Next, meet connection and gentle strength.」下一课 B07，后续另行回访无提示情境，不要求自评。

<a id="lesson-b07"></a>
### B07｜分别认识圣杯二与力量 / Learn Two of Cups and Strength separately

**目标与边界**：分别理解两张正位；前置 B06；本课是两段顺序教学，不做陌生牌 PK。Word 初级第 7 课；S01 c2、maj08；[c02](#card-c02)、[m08](#card-m08)。

**教学屏幕**
- **B07-T1**「先学圣杯二。它常说两个人愿意互相了解：表达自己的想法，也听对方怎么说。可以是朋友、合作伙伴或恋人。“互相回应、亲近、合作”能帮助记忆。图中两人面对面，各自拿着杯子，可以用来记住“彼此”。只有一方希望合作，还不等于双方已经说好了。/ First, Two of Cups: two participants form connection through expression and response, in friendship, collaboration or romance. Mutual response, connection and cooperation are useful cues. Two facing figures with cups support the memory of reciprocity; one person's hopes are not mutual commitment.」
- **B07-T2**「例子：同事讨论合作时，各自说出需要，也认真回应对方。建议可以是‘先交换想法，确认共同意愿’。它不保证对方一定接受你的邀请。/ Example: colleagues state their needs and respond to one another. Advice might be: exchange ideas and check shared willingness. It does not guarantee acceptance of an invitation.」完成 Q1 后再进入下一张。
- **B07-T3**「再学力量。它强调面对强烈情绪或困难时的勇气、耐心和自我调节。人物以双手接触狮子，而非持武器搏斗，帮助记住不靠蛮力的应对。例子：方案被批评，先听清具体问题，再说清自己的理由，以及哪些要求不能接受。温和不等于无条件忍让。/ Next, Strength: courage, patience and self-regulation when facing strong feelings or difficulty. Hands meet the lion without a weapon, supporting the memory of a response without brute force. If a proposal is criticized, first understand the objection, then clearly state reasons and boundaries. Gentleness is not unconditional submission.」

**分镜 B07-M**：先固定 c02，按“看联系 / See the connection”强调两个人之间的相向姿态，约 0.6 秒；完成第一段后以 0.3 秒淡切在同一位置显示 m08，强调人物与狮子接触处。两图不并列竞赛，不改变人物动作；每段停留，暂停／重播；静态是两张独立教学页。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| B07-Q1「圣杯二的本课例子，哪里能看出两个人都参与了交流？/ What makes the Two of Cups example reciprocal?」 | A「双方都表达并回应 / Both express and respond」→「双方都说出想法，也听取对方的回应，不是只有一个人在说。/ Both sides participate in the connection.」；B「一方独自想象对方答应 / One imagines the other has agreed」→「你希望对方答应，不代表对方已经答应。/ Hope supplies no response from the other person.」 | A；T1–T2 |
| B07-Q2「受到批评后，怎样做符合刚才讲的力量牌？/ Which response to criticism fits this lesson's Strength advice?」 | A「先接受对方的要求，避免当场冲突，之后再处理自己的不满。 / Accept the request to avoid conflict now, then deal with your dissatisfaction later.」→「先全盘接受要求只是把不满推迟，没有表达自己的界限。力量牌在这里要先听清问题，再平静说明理由和不能接受的部分。 / Accepting every demand only postpones the dissatisfaction and leaves boundaries unspoken. Here Strength asks you to understand the issue, then calmly state reasons and limits.」；B「听清问题，再平静说出自己的理由和不能接受的要求 / Understand the issue, then calmly state reasons and boundaries」→「没有回避问题，也没有急着争吵，而是先听清楚再表达自己。/ This faces the issue and regulates the response.」 | B；T3 |

- **B07-R1 教学**「邀请是一个人的动作；形成相互回应还需要另一人的实际参与。/ An invitation is one person's action; reciprocity needs actual participation from the other.」题「你发出了邀请但尚未收到回复，能确定双方已经达成共同意愿吗？/ You invited someone but have no reply. Is shared willingness established?」A「尚不能 / Not yet」→「缺少对方回应。/ The other response is missing.」；B「能 / Yes」→「发出邀请只是你这一方的行动，还不知道对方怎么想。/ This turns one person's action into a mutual state.」答案 A；T1–T2。
- **B07-R2 教学**「力量提醒我们先稳住情绪，再面对问题。可以好好说话，也可以拒绝无法接受的要求；不需要为了显得温和而全答应。/ Strength's gentleness regulates a response; it does not mean accepting every request. Steady yourself while explaining reasons and what you cannot accept. Patience does not erase courage or boundaries.」题「新例：组员临时要求你承担无法完成的额外工作。怎样用本课力量的建议？/ New example: a teammate requests extra work you cannot complete. How does this lesson's Strength advice apply?」A「先接下额外工作，等忙不过来时再说明限制。 / Take on the extra work first and explain your limits if the workload becomes unmanageable.」→「这样做会漏掉题目里的关键一步。既没有生气回避，也没有勉强全接下来，而是把能做和不能做的说清楚。 / This action skips a key step in the question. It retains patience, courage to face the issue and boundaries.」；B「平静说明可承担的部分与限制，再讨论安排 / Calmly state your capacity and limits, then discuss arrangements」→「既没有生气回避，也没有勉强全接下来，而是把能做和不能做的说清楚。/ It retains patience, courage to face the issue and boundaries.」答案 B；T3，回应 Q2 的温和等于忍让错误。

**B07-V1**「合作建议位是圣杯二。哪项回应合作问题？/ Two of Cups is advice for a collaboration. Which response addresses that question?」A「彼此说出期待，确认共同目标 / Exchange expectations and check a shared goal」→「两个人都说出想法，再一起确认要做什么。/ This applies reciprocal communication.」；B「先表达自己的合作目标，让对方按这个方向回应。 / State your collaboration goal first and invite the other person to respond within that direction.」→「请回到画面里的具体细节：两个人都说出想法，再一起确认要做什么。 / Return to the specific details in the picture: This applies reciprocal communication.」答案 A；T1–T2。

**完成**「圣杯二帮助理解相互回应；力量帮助理解怎样面对困难。两张分别记住各自的意思就好。/ Two of Cups addresses reciprocal connection; Strength addresses facing difficulty. You have learned each separately, without forcing a comparison.」下一课 B08；任何一张未完成按各自 ID 恢复。

<a id="lesson-b08"></a>
### B08｜完成第一张建议牌 / Complete your first advice-card interpretation

**目标与边界**：连起牌义、牌位、问题；前置 B02、B06、B07，可查阅；不要求全部 78 张或自评。Word 初级第 8 课，取消原自检等级与统一三词要求；S01 less5、less11。

**教学屏幕**
- **B08-T1**「读一张建议牌时，依次确认：本题问什么，这张牌本来的含义是什么，怎样把这个含义变成针对问题的做法。解释要符合刚学的牌义，也要回答原来的问题。建议说的是怎样做，不是保证一定会成功。/ For an advice card, identify the question, recall the card's meaning, then turn that meaning into an approach to the issue. Meaning cannot become any answer, and advice is not an outcome guarantee.」
- **B08-T2**「完整例子：朋友误会了我发的一条消息，这周我能先做什么？这次用圣杯二正位示范，牌位是“我能采取的第一步”。可以这样建议：先问朋友愿不愿意聊聊，说清自己的本意，也听听朋友当时是怎样理解的。如果朋友暂时不想谈，就先别强求。/ Worked example: a message caused a misunderstanding with a friend. How can I start repairing it this week? The upright position is My first step, illustrated by Two of Cups. Its reciprocity theme becomes: sincerely invite a conversation, explain your intention and invite the friend's perspective. If they do not want to talk yet, respect that response.」
- **B08-T3**「这回答的是你能做什么，并没有确认对方一定原谅你。学完后可以自己选新牌，也可以随机学一张。学过的牌，以后会换个例子再练。/ This answers what you can do; it does not establish that the friend will forgive you. Afterward, choose or randomly receive a new card; learned material returns later in a different context. You do not need to rate your memory: practice responses guide the help.」

**分镜 B08-M**：c02 保持原位，问题条→“建议 / Advice”位置标签→具体行动句依次强调，每段 0.4 秒，用户点继续；不把牌移出屏幕。静态同时显示三项对应，文字完整保留，可重播。结束后的新牌选择在课外完成页，不干扰核心步骤。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| B08-Q1「朋友案例里，哪个句子回应‘第一步’？/ Which sentence answers the friend's case about a first step?」 | A「先等对方表态，再决定是否说明自己的本意。 / Wait for the other person to respond before deciding whether to explain your intent.」→「圣杯二强调双方回应；既要说出自己的期待，也要听对方怎样理解。 / The Two of Cups is reciprocal: state your expectations and listen to how the other person understands them.」；B「邀请交流，也听对方的理解 / Invite a conversation and listen to their understanding」→「把双向回应转成可做的动作。/ This turns reciprocity into an action.」 | B；T1–T2 |
| B08-Q2「朋友暂时不想谈，怎样做才顾及双方的意愿？/ If the friend does not want to talk yet, which response preserves reciprocity?」 | A「尊重回应，暂不强求 / Respect the response without forcing」→「对方的意愿也是双向关系的一部分。/ Their willingness is part of reciprocity.」；B「持续追问直到同意 / Keep pressing until they agree」→「只顾自己想谈，没有听取朋友暂时不想谈的回应。/ This replaces mutual participation with pressure.」 | A；T2 |

- **B08-R1 教学**「建议句回答‘我可以做什么’，不是‘别人一定会怎样’。/ Advice answers what I can do, not what someone else will certainly do.」题「哪句是建议？/ Which is advice?」A「分析朋友可能什么时候回复。 / Estimate when the friend is likely to reply.」→「“先把自己的本意说清”是自己现在能采取的行动；猜朋友何时回复不是行动建议。 / Explaining your intention is an action you can take now; guessing when a friend will reply is not an action recommendation.」；B「先把自己的本意说清 / First explain your intention clearly」→「是自己的行动。/ It is your own action.」答案 B；T1–T2。
- **B08-R2 教学**「双向不等于双方必须同意；它要求听见彼此真实回应。/ Reciprocity does not require agreement; it requires attending to each person's actual response.」题「合作伙伴说需要时间考虑，接下来怎样做比较合适？/ A partner needs time to consider. Which respects that response?」A「约定合适时间再确认 / Agree on a suitable time to check back」→「让对方有时间考虑，之后再一起决定。/ This leaves room for participation.」；B「继续追问，让对方尽快给出结论。 / Keep asking so the other person reaches a decision sooner.」→「对方需要时间时，约好之后再确认，既留出考虑空间，也让沟通有下一步。 / When someone needs time, agree when to check back; this gives them room to think and keeps a clear next step.」答案 A；T2。

**B08-V1**「换成备考问题，建议位是已经学过的星币八。哪项符合这张牌刚才讲的意思？/ For exam preparation, the advice card is the already-learned Eight of Pentacles. Which retains its meaning?」A「先再收集更多备考资料，等准备充分后开始练题。 / Collect more study materials first, then begin practice when the preparation feels sufficient.」→「针对薄弱题型练习并检查错误，才把星币八的认真练习和持续改进用进了备考。 / Practising weak question types and reviewing mistakes applies the Eight of Pentacles through careful practice and improvement.」；B「针对薄弱题型练习，检查错误 / Practise weak areas and review mistakes」→「针对不会的题多练，再检查错误，符合认真练习、不断改进的意思。/ It preserves practice and quality.」答案 B；B06-T1、B08-T1，出题前可查看 B06 一句摘要，不强迫重学。

**完成**「你已完成第一次建议牌解读。接下来可以自选一张新牌，也可以继续中级，学习更完整的单牌方法。/ You have completed your first advice-card interpretation. Next, choose a new card or continue to the intermediate lessons for fuller card study.」两入口仅完成页出现；记录本课完成与具体练习证据，不宣告“全部掌握”。

<a id="lesson-i01"></a>
### I01｜用一致的方法，把一张牌学完整 / A consistent method for learning one card

**目标与边界**：整合完整含义、画面、结构和应用；前置 B06，允许摘要补齐；不背固定词数、不把愚人旅程当必然人生顺序。Word 中级第 1 课；S01 howcard、p8。

**教学屏幕**
- **I01-T1**「先学完整意思，再用关键词整理。每张牌看六件事：主要含义、帮助记忆的画面、关键词各指什么、花色、数字或宫廷角色怎样帮助记忆、放进问题怎样使用、哪些说法没有依据。关键词可以多种措辞，但核心主题不能随意改变。/ Learn the full meaning, then organize it with keywords. Examine six things: the main meaning, visual memory cues, what the keywords mean, structural aids, use in a question, and unsupported claims. Wording can vary; the central theme cannot change arbitrarily.」
- **I01-T2**「星币八讲的是认真做事、练习技能，把手上的活做好。“专注、练习、不断改进、细心”分别帮你记住其中一部分。可以借图中的工匠和作品记忆；星币对应土，也能帮助你想起动手做事。数字只用来帮助记忆，不能代替这张牌的完整意思。/ Eight of Pentacles means attentive practical work, learning and refining a craft, and caring for quality. Focus, learning, refinement and detail name aspects of that meaning. The craftsperson and pieces support memory; Earth prompts practical effort; the number is an index, not a substitute for this explanation.」
- **I01-T3**「小林只购买摄影器材，很少练构图。建议位的星币八可解释为：固定一个构图任务，拍摄、检查、针对问题重拍。这是根据背景做出的应用，不是图里写着必须拍几次。大阿尔卡纳也沿用此方法：先学每张的意思，以后也可以把大牌串成故事来复习。常说的“愚人旅程”就是一种串故事的方式；现在不用学，故事也不能代替每张牌本身。 / Lin buys photography equipment but rarely practices composition. In an advice position, Eight of Pentacles can suggest choosing a composition task, taking photographs, checking them and retaking them to address problems. This applies the meaning to the context; the image does not prescribe a number of attempts. Learn each Major card first. Later, a story such as the Fool’s Journey can help review them; you do not need that story now, and it does not replace individual meanings.」

**分镜 I01-M**：p08 固定，六项解释依次从同一说明区展开（0.3 秒）；结构项不过度强调；最后展示“看见／含义／应用 / Seen / Meaning / Application”三列具体句。点击继续、可暂停重播，静态为完整三列表。不展示空白等待用户猜测。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| I01-Q1「‘认真练习，把手艺练好’没逐字说出教材关键词，是否仍保留星币八核心？/ Does 'careful practice and refining a skill' retain the meaning without quoting the keywords?」 | A「是 / Yes」→「虽然换了说法，仍是在说认真练习、把事做好。/ The wording differs, but effort and skilled quality remain.」；B「核心意思要和教材关键词基本一致，才算真正掌握。 / Treat the core meaning as learned when it closely matches the textbook keywords.」→「先核对眼前例子的条件：虽然换了说法，仍是在说认真练习、把事做好。 / Check the conditions in this example first: The wording differs, but effort and skilled quality remain.」 | A；T1–T2 |
| I01-Q2「摄影例子中，哪项同时回应背景与牌义？/ Which responds to both the photography context and the card?」 | A「先换更好的设备，再开始练习构图。 / Upgrade the equipment first, then begin practising composition.」→「摄影问题缺的是实际练习；围绕构图去拍、检查再修改，比先换设备更贴近星币八。 / The photography problem lacks hands-on practice; shooting, reviewing, and revising composition fits the Eight of Pentacles better than replacing equipment first.」；B「围绕构图拍摄、检查和修改 / Shoot, review and adjust composition」→「处理了缺少实践的困难。/ It addresses the lack of practice.」 | B；T3 |

- **I01-R1 教学**「关键词是帮你记意思的，换种说法也可以。只要仍然说清认真练习、把手上的事做好，就不需要逐字照背。/ Keywords help retrieve meaning; exact wording is not required. Judge a paraphrase by whether it retains attentive effort, skill learning and quality, not by identical words.」题「新例：小周把星币八解释为‘专心做实际练习，慢慢把手艺磨好’，没有照抄词表。这种表达可以吗？/ New example: Zhou explains Eight of Pentacles as 'concentrated hands-on practice to gradually refine a craft' without quoting the list. Is that acceptable?」A「可以，保留了投入、技能与改进 / Yes; it retains effort, skill and improvement」→「换了说法，意思没有变。/ The paraphrase conveys the full theme.」；B「不可以，没有逐字说出词表 / No; it does not quote the exact list」→「不必逐字照背；只要意思没变，就不算错。/ This mistakes a memory aid for a required formula rather than checking understanding.」答案 A；T1–T2，回应 Q1 的逐字背诵误解。
- **I01-R2 教学**「小林已经有设备，却很少拍照。问题不在工具不够，而在还没动手练。这里的星币八建议他先实际拍摄，再检查和修改，并不是说不能买工具。/ Equipment can support practice, but the question says Lin rarely takes photographs; further purchases do not fill that gap. In this example, Eight of Pentacles emphasizes doing, reviewing and improving, not banning tools.」题「新例：小周已有能正常使用的吉他，却只浏览设备评测，很少弹奏。接下来怎样做符合刚才的建议？/ New example: Zhou has a working guitar but mostly reads equipment reviews and rarely plays. How can this lesson's advice be applied?」A「先继续比较更多设备，仍不安排弹奏 / Compare more equipment first, still without scheduling playing」→「工具已能使用，继续比较仍未回应缺少实际练习。/ The instrument works; more comparison still does not address the missing practice.」；B「选一个和弦转换练习，听录音检查，再修正 / Practise one chord transition, listen to a recording and adjust」→「他缺的是实际弹奏。先练，再听录音检查，正好解决这个问题。/ This applies skill practice and quality review to the stated gap.」答案 B；T2–T3，专门回应 Q2 的购买替代练习错误。

**I01-V1**「学写作时，哪项保留同一核心？/ In learning to write, which retains the same theme?」A「写一段，检查结构，再修改 / Write a paragraph, review its structure and revise」→「先写、再检查和修改，也是在通过实际练习把事情做得更好。/ It transfers skill and quality to a new area.」；B「凭星币八确定出版日期 / Use the card to establish a publication date」→「单牌核心不提供这个日期。/ The core meaning provides no such date.」答案 A；T2–T3。

**完成**「你可以用相同框架理解不同牌，不必让每张牌拥有相同数量的词。/ You can use a consistent framework without giving every card the same number of keywords.」下一课 I02；亦可跳至任意 [单牌脚本](#card-p08)，保留课程位置。

<a id="lesson-i02"></a>
### I02｜元素和数字怎样帮助理解圣杯十 / Elements and numbers through Ten of Cups

**目标与边界**：将结构连到具体单牌；前置 B03、B04；不凭水＋十推事件，不引入未学对比牌。Word 中级第 2 课；S01 c10、less3；[c10](#card-c10)。

**教学屏幕**
- **I02-T1**「圣杯十常说：和重要的人相处融洽，大家在一起感到开心、安心，觉得自己被接纳。可以是恋人、家人，也可以是一群相处得好的朋友。可以用“和睦、归属感、一起幸福”帮助记忆。它不只是在说有钱，也不要求你的生活和图中的家庭一模一样。/ Ten of Cups emphasizes shared fulfillment and belonging through emotional connection—in close relationships, family or an accepting group. Harmony, belonging and shared happiness are useful cues. It is not success defined solely by wealth or a requirement to copy the pictured family.」
- **I02-T2**「图上有两位成人、两个孩子，远处有房屋，头顶是杯子组成的彩虹。把这些画面放在一起，可以帮助记住“一家人共享幸福”。圣杯让人想到感受和关系；十帮助记住一件事已经发展到后面的阶段。不过，幸福是这张牌本身的含义，不是只凭“水加十”算出来的，更算不出结婚日期。/ Adults, children, a distant home and the rainbow of cups support memory of sharing. Cups concerns feelings and relationships; Ten may suggest a developed stage. Neither cue alone establishes happiness or a wedding date. Shared fulfillment is the individual meaning you have been taught.」
- **I02-T3**「一群朋友准备办相识周年聚会，问怎样让大家玩得开心、没人被冷落。圣杯十可以这样给方向：一起回忆这些年的经历，让每个人都有参与的机会，感到自己是大家的一员。它没有告诉我们会来多少人；相处融洽也不等于所有人想法都一样。 / Friends are planning an anniversary gathering and ask how to make it enjoyable without leaving anyone out. Ten of Cups can suggest recalling shared experiences and giving everyone a chance to join in and feel included. It does not specify attendance; harmony does not require identical opinions.」

**分镜 I02-M**：c10 固定→点选“画面 / Picture”“花色 / Suit”“数字 / Number”，对应三段已有讲解，约 0.3 秒切换；最终三项汇到完整意思，不播放算式合成。静态三项并列，可暂停重播，保留牌名与尺度。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| I02-Q1「圣杯十说的幸福，重点是什么？/ What is distinctive about fulfillment in this lesson's Ten of Cups?」 | A「家庭财务稳定带来的安心感。 / The reassurance created by stable household finances.」→「请回到画面里的具体细节：重点是大家在一起感到开心、被接纳，不只是一个人拥有很多东西。 / Return to the specific details in the picture: It preserves sharing and belonging.」；B「和在意的人一起感到幸福、相处融洽 / Shared experience among emotionally connected people」→「重点是大家在一起感到开心、被接纳，不只是一个人拥有很多东西。/ It preserves sharing and belonging.」 | B；T1 |
| I02-Q2「只凭水＋十，能确定下个月结婚吗？/ Can Water plus Ten establish a wedding next month?」 | A「不能 / No」→「知道元素和数字，不能算出婚期。/ Structure supplies neither event nor date.」；B「能 / Yes」→「水和十是帮助记忆的，不能用来计算下个月会发生什么。/ This treats cues as an event formula.」 | A；T2 |

- **I02-R1 教学**「这里说的幸福，是大家在一起相处得好，不只是一个人得到了什么。/ Look for shared experience: fulfillment here concerns connection between people, not one person possessing a prize.」题「怎样安排聚会，更符合刚才讲的意思？/ Which gathering goal applies that meaning?」A「把食物和场地准备得更丰富，让主人承担好招待工作。 / Prepare richer food and a better venue so the host performs the hosting role well.」→「圣杯十强调共同的归属感；让每个人都能参与并回忆共同经历，才回应了这层牌义。 / The Ten of Cups emphasizes shared belonging; including everyone and recalling common experiences applies that meaning.」；B「让每个人都能参与，一起回忆共同经历 / Help everyone feel accepted and share experiences」→「让每个人都感到自己是大家的一员。/ It directly expresses belonging.」答案 B；T1、T3。
- **I02-R2 教学**「水帮助记情感与关系，十帮助记阶段性状态；两者没有给出事件日期。若要知道何时聚会，要看现实安排，不能把牌号换算成天数。/ Water helps organize feelings and relationships; Ten cues a stage. Neither gives an event date. A gathering's date comes from real arrangements, not converting the rank into days.」题「新例：朋友尚未定聚会日期，抽到圣杯十。能因编号十就断定十天后聚会吗？/ New example: friends have not set a gathering date and draw Ten of Cups. Does its rank establish a gathering ten days later?」A「不能。它讲的是大家相处的感受，聚会日期还要另定 / No; retain shared fulfillment and confirm the date separately」→「区分了牌义和未提供的时间信息。/ This separates meaning from the missing timing information.」；B「能，数字十通常提示事情接近十个时间单位。 / Yes; the number Ten often suggests a period close to ten time units.」→「圣杯十能说明大家相处的感受，却不能给出聚会日期；时间仍要另行商量。 / The Ten of Cups can describe how people feel together, but it cannot supply the gathering date; the time still needs agreement.」答案 A；T2，回应 Q2 的元素数字推事件日期错误。

**I02-V1**「工作团队庆祝合作完成，能用圣杯十讨论归属吗？/ Can Ten of Cups discuss belonging when a work team celebrates completion?」A「不能，圣杯不能进工作题 / No, Cups cannot appear in work questions」→「同事一起完成工作也会感到开心，不能把圣杯只用于恋爱。/ This wrongly restricts the suit to one domain.」；B「能。同事也会因为一起完成工作而开心 / Yes, work also involves emotional connections」→「这里也在说大家一起完成一件事、分享开心的感受。/ It preserves the core of shared experience.」答案 B；T1–T3。

**完成**「先有单牌含义，再让元素和数字帮助整理。接下来把这个方法用于宫廷牌。/ Begin with the individual meaning; let element and number organize it. Next, apply this to court cards.」下一课 I03。

<a id="lesson-i03"></a>
### I03｜宫廷牌：把角色与花色用于具体问题 / Court cards in a specific question

**目标与边界**：理解 16 格索引与圣杯骑士应用；前置 B03、B05；不把人物身份当答案。Word 中级第 3 课；S01 ckn、less3；[c12](#card-c12)。

**教学屏幕**
- **I03-T1**「四种角色与四花色形成 16 张宫廷牌。角色帮助你记住怎样做事，花色帮助你记住在关注什么。侍从开始学习，骑士主动追求，王后关心需要、给予照顾，国王安排事情、承担责任。记住这些以后，每张宫廷牌的具体意思仍要单独学。/ Four roles across four suits make sixteen courts. The role suggests an approach; the suit suggests a focus. Pages learn, Knights pursue, Queens understand and care, Kings coordinate and take responsibility. This is an index; each card still has its own meaning.」
- **I03-T2**「圣杯骑士常说愿意为自己的感受或理想主动做些什么，比如温和地表达心意、发出邀请，或追求向往的事情。骑士拿着杯子向前，可以帮你记住“主动表达”。可以记“表达心意、浪漫、追求理想”。不过，说出心意，还不等于以后一直做得到。/ Knight of Cups is moved by feeling or an ideal, expressing, inviting or pursuing in a gentle, appealing way. The mounted figure holding a cup helps recall bringing feeling outward. Expression, romance and pursuit of ideals summarize aspects, but expression is not yet lasting commitment.」
- **I03-T3**「问‘怎样邀请朋友谈误会’，建议可说：告诉朋友自己想把误会说开，再问对方是否愿意找时间聊聊。若问‘活动氛围’，可强调理想与情绪体验。两种说法都来自同一含义，由问题决定应用方向；不能跳成某个年龄的男人必定出现。/ Asked how to invite a friend to discuss a misunderstanding, advice can be: gently express a wish to repair and ask whether they would like to talk. Asked about an event's atmosphere, the same card can emphasize ideals and emotional experience. The question selects the use of the same meaning; it does not establish that a man of a certain age will appear.」

**分镜 I03-M**：4×4 索引显示文字标签，不需16张小图→点圣杯×骑士，c12 在固定图位显示，约 0.5 秒→同一卡片旁依次呈现两个问题及已写解释。静态矩阵可查，动画可暂停、重播；不显示人格升级条。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| I03-Q1「本课用圣杯骑士描述的，首先是哪类信息？ / What kind of information does Knight of Cups primarily describe in this lesson?」 | A「一种表达或追求方式 / A way of expressing or pursuing」→「这正是本课所讲的重点。/ This is the taught emphasis.」；B「对方已作出终身承诺 / The other person has made a lifelong commitment」→「长期承诺需要额外信息。/ Lasting commitment needs additional information.」 | A；T2 |
| I03-Q2「问‘我怎样邀请朋友’，哪项回应了问句？/ For 'How should I invite my friend?', which responds to the question?」 | A「断定会出现一个特定性别的人 / Predict a person of a specified gender」→「改变了问题对象，也加入身份推断。/ It changes the subject and adds an identity claim.」；B「好好说出想把误会说开，再问朋友愿不愿意聊聊 / Gently express a wish to repair and ask their willingness」→「说的是自己怎样发出邀请，正好回答“我怎样邀请朋友”。/ It applies an approach to your own action.」 | B；T3 |

- **I03-R1 教学**「‘会表达’和‘长期做到’是不同信息。邀约是起点，承诺需要持续行为支持。/ Being expressive and following through long term are different information. An invitation begins contact; commitment needs sustained behaviour.」题「一封浪漫邀请能保证今后一直合作吗？/ Does a romantic invitation guarantee lasting cooperation?」A「不能 / No」→「表达不等于长期落实。/ Expression is not sustained follow-through.」；B「能 / Yes」→「从风格跳到了保证。/ This jumps from style to guarantee.」答案 A；T2。
- **I03-R2 教学**「先看问题在问什么。如果问活动氛围，就说这场活动给人的感受，不要突然改成猜主办人是谁。/ First check whether the question concerns a person, an action or an atmosphere. Then choose that level of expression.」题「问题是“这场活动的氛围怎样”。哪句话在回答它？/ For an event's atmosphere, which matches the taught level?」A「从主持者的身份与风格推断活动气氛。 / Infer the atmosphere from the host’s identity and personal style.」→「这里要判断聚会的氛围：大家是否愿意表达感受，并一起谈想做的事。 / The question asks about the gathering atmosphere: whether people share feelings and imagine what they want to do together.」；B「大家愿意表达感受，也一起畅想想做的事 / It emphasizes emotional experience and an appealing ideal」→「在描述氛围。/ It describes atmosphere.」答案 B；T3。

**I03-V1**「为社团发合作邀请，圣杯骑士建议怎样表达？/ How might Knight of Cups advise inviting another club to collaborate?」A「真诚说出想一起做什么，再听听对方愿不愿意 / Express the shared ideal sincerely and allow a choice」→「延续温和邀请，未保证接受。/ It retains a gentle invitation without guaranteeing acceptance.」；B「把合作设想写得很动人，让对方自然明白你希望他参加。 / Describe the collaboration vividly and let the other person infer that you want them to join.」→「真诚说明合作想法，再听对方愿不愿意，既保留邀请，也没有预设对方一定接受。 / Share the collaboration idea sincerely, then listen to whether the other person wants it; this invites without assuming acceptance.」答案 A；T2–T3。

**完成**「先学清这张牌的意思，再看问题是在问一个人、下一步怎样做，还是活动的气氛。下一课开始理解逆位。/ Role and suit offer an entry point; the question determines the level of expression. Next, learn reversals.」下一课 I04；不将一课完成记为16宫廷牌已学完。

<a id="lesson-i04"></a>
### I04｜逆位：保留主题，再判断变化 / Reversals: retain the theme, then locate the change

**目标与边界**：按背景选择逆位方向；前置 B06／I01 的 p08；不一口气背所有逆位机制。Word 中级第 4 课；S01 less17，单牌变式为本课原创应用。

**教学屏幕**
- **I04-T1**「逆位是指抽出的牌图倒着。它的意思不一定和正位相反，也不一定是坏结果。不同传统有不同处理方式。本课程保留牌的主题，再结合背景、问题和牌位判断变化：可能是这件事做不起来、做过了头，或想在心里还没表现出来，也可能是原来的困难正在减轻。它们不是每张牌都适用的固定清单，更不能全部同时当结论。/ Reversed first describes orientation, not an opposite meaning or a bad outcome. Traditions differ. Here retain the card's theme, then use context, question and position to identify a change: blockage, excess, an inward expression, or easing of an existing difficulty. These are not a universal checklist for every card or simultaneous conclusions.」
  「一个先讲清的小例子：宝剑九正位常涉及忧虑、反复想着令人不安的事。虚构背景是活动负责人原来不断担忧，但在分工确定、沟通之后，担忧开始减少。此时若用宝剑九逆位作教学解释，可以读为原有忧虑正在缓解；这是结合已经给出的改善背景，不是见到逆位就保证问题消失。这个例子供理解，不要求现在记住一张新牌的全部含义。/ A fully explained example: upright Nine of Swords often concerns worry and repeatedly dwelling on distressing matters. In this fictional context, an event organizer had recurring worries, but clearer responsibilities and communication have reduced them. Reversed Nine of Swords can then be taught as worry beginning to ease. This follows the supplied improvement in context; reversal alone does not guarantee the problem has disappeared. This example illustrates the idea, without requiring the whole meaning of a new card now.」
- **I04-T2**「读星币八逆位，仍然围绕练习和做事来理解，但要看具体发生了什么。例 A：报名后一直没练，问题是还没有动手。例 B：每天练，却从不检查反复出现的错误，问题可能是练法需要改。例 C：作品已符合要求，却一直改细节不交，这时才适合说改得太多、耽误了完成。这些情况由题目告诉我们，不能只凭逆位断定。/ For reversed Eight of Pentacles, retain effort, skill and quality. A: enrolled but never practised—effort is not implemented. B: practises daily but never reviews repeated errors—the method is ineffective. C: meets requirements but endlessly revises and never submits—over-refinement is supported. The context is supplied, not proved by the reversal.」
- **I04-T3**「这次看例 B：他每天都练，但没有找出并纠正反复出现的错误。可以建议他先选一个总出错的地方，找到原因，再换个方法练。题目已经说他每天在练，所以不能说他完全没练，也不能保证改完马上得奖。 / Now read case B: the learner practices daily but has not identified and corrected recurring errors. Advice can be to choose one repeated mistake, find its cause and try a different practice method. Saying they never practice contradicts the context; there is no basis for promising an immediate prize.」

**分镜 I04-M**：p08 正位固定，主题文字保留→点“看本课逆位 / See this reversal”，图转180度约0.6秒，主题不变色为“坏”→显示 A/B/C 三张情境卡，每次仅强调已选情境及解释。静态标注方向并显示对应例子；可暂停重播，选例不改变原有牌义。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| I04-Q1「每天练却不检查错误，哪项与背景一致？/ With daily practice but no error review, which fits the context?」 | A「练习次数在增加，原来的错误也会逐渐自行消失。 / As the number of practice attempts rises, the original mistakes will gradually fade on their own.」→「一直在练却重复同样的错误，说明投入没有转成改进；需要检查方法，而不是只看练习次数。 / Repeating the same mistake despite continued practice means effort has not become improvement; check the method, not just the number of repetitions.」；B「一直在练，但没有改掉反复出现的错误 / Effort is not effectively producing improvement」→「既承认投入，也指出缺少检查。/ It acknowledges effort and identifies missing review.」 | B；T2–T3 |
| I04-Q2「只有一张逆位，没有问题或背景，能确定是哪种变化吗？/ With only a reversed card and no context, can you identify the exact change?」 | A「不能。还要知道发生了什么，才能判断 / No, context is needed to narrow it」→「朝向没有提供现实细节。/ Orientation supplies no real-world details.」；B「能，星币八逆位更常见的是练得太多。 / Yes; the Eight of Pentacles reversed is commonly read as practising too much.」→「正逆位只改变解读角度，不能补出没说的现实情况；要先知道具体发生了什么。 / Orientation changes the interpretive angle but cannot invent missing circumstances; first establish what actually happened.」 | A；T1–T2 |

- **I04-R1 教学**「题目已经说他每天都练，就不能再说他完全没练。再看怎样练，才能改掉错误。/ Keep the stated fact: daily practice rules out no practice. Then use the card to discuss quality.」题「每天练字但不看字形，优先补什么？/ Practising handwriting daily without looking at letter forms: what is missing first?」A「假设从未动笔 / Assume no writing happened」→「否认已有练习。/ It denies the given practice.」；B「检查并修正字形 / Review and correct the forms」→「题目说不看字形，所以要先检查，再改正。/ It addresses the stated gap.」答案 B；T3。
- **I04-R2 教学**「同一个技能主题，问题可能在开始投入，也可能在投入方法。不能在没有背景时任选一个当事实。/ Within the same skill theme, the issue may be starting practice or its method. Without context, neither is established as fact.」题「要区分两种情况，哪条信息有帮助？/ Which information helps distinguish them?」A「实际有没有练、怎样练 / Whether and how practice occurs」→「直接区分投入与方法。/ It distinguishes effort from method.」；B「把逆位再旋转一次 / Rotate the card again」→「旋转不会补充背景。/ Rotation does not add context.」答案 A；T1–T2。

**I04-V1**「作品已经达标却一直改小细节不交，哪项符合题目说的情况？/ Work meets requirements but endless tiny revisions prevent submission. Which is supported?」A「作品还不够成熟，需要继续打磨。 / The work is not mature enough and needs further refinement.」→「作品已经达标，却因反复修改小细节迟迟不交，正是逆位示例里的“投入没有转成完成”。 / The work already meets the standard but remains unsubmitted because of repeated small edits; effort is not becoming completion.」；B「小细节一直改，反而迟迟交不了作品 / Refinement is unbalanced and obstructs completion」→「作品已达标，却仍因小细节交不出去，和刚才的例 C 一样。/ It matches C's conditions.」答案 B；T2。

**完成**「同一张逆位牌，要结合发生的事情来读。有时是做不起来或做过头，也可能是原来的困难在减轻；不能只选自己喜欢的解释。 / The same reversed card is read in context. Sometimes something is blocked or overdone; sometimes an earlier difficulty is easing. Choose an interpretation supported by the situation, not simply the one you prefer.」下一课 I05；逆位证据单独记录，不重置正位已学内容。

<a id="lesson-i05"></a>
### I05｜问题和牌位怎样改变表达 / How questions and positions shape an interpretation

**目标与边界**：保持核心而改变句子任务；前置 I01、I04；不把障碍位自动读成过度。Word 中级第 5 课；S01 less11；[p08](#card-p08)。

**教学屏幕**
- **I05-T1**「现状位回答“现在怎么样”，建议位回答“接下来怎样做”，趋势位回答“照这样下去，可能怎样发展”。牌本身的意思不变，重点随着它要回答的问题改变。/ Situation describes what is happening; advice suggests an approach; tendency discusses possible development under current conditions. These give the meaning different tasks, not permission to change it arbitrarily.」
- **I05-T2**「小林准备两个月后的作品展，正在练摄影。星币八放在现状位，可以说他正在认真练摄影；放在建议位，可以说按展览要求练习、改好照片细节；放在趋势位，可以说继续认真练和改，摄影水平和作品有望逐步改善，但不能保证获奖。三种说法都围绕认真练习、把事做好。/ Lin is practising photography for an exhibition in two months. Eight of Pentacles as situation: a phase of skill training. As advice: practise to the exhibition's needs and refine details. As tendency: a direction of improving skill and quality, not a guaranteed prize. All three retain the same theme.」
- **I05-T3**「换成沟通问题，建议可以是练习明确表达并确认对方理解；换成备考，则是针对薄弱题型练习。障碍位回答“什么在妨碍这件事”。如果星币八在这里，要先看看有没有只顾改一小部分、却迟迟没做完整件事的情况，不能一看是障碍位就说努力错了。 / For communication, advice could be to practice expressing yourself clearly and checking how the other person understood it; for an exam, practice weaker question types. An obstacle position asks what is getting in the way. With Eight of Pentacles here, check whether attention to one small part is delaying completion of the whole task; the position alone does not mean effort is wrong.」

**分镜 I05-M**：三张空位同时显示“现状／建议／趋势”及定义，p08 在同一舞台内依次滑到所选位（约0.5秒），原含义条固定，应用句随位置改变；非相关位不隐藏。可暂停重播，静态为三行对应表。教学布局标“位置演示 / Position demonstration”，不冒称另一传统牌阵。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| I05-Q1「在作品展的建议位，哪句话是在说下一步怎样做？/ Which sentence fulfills the advice position for the exhibition?」 | A「按展示要求练习和完善细节 / Practise and refine details to meet exhibition needs」→「给出与牌义一致的做法。/ It offers an approach consistent with the card.」；B「你以前练过很多 / You practised a lot previously」→「这是过去描述，没有回答下一步做法。/ This describes the past rather than the next approach.」 | A；T1–T2 |
| I05-Q2「星币八在障碍位，就能断定过度努力吗？/ Does Eight of Pentacles in an obstacle position establish excessive effort?」 | A「是，障碍位会把星币八原本的勤练转成过度练习。 / Yes. An obstacle position turns the Eight of Pentacles’ diligence into overwork.」→「“障碍位”只说明这张牌负责回答阻碍，不能替你补出事情背景；还要结合已知情况。 / An obstacle position says which part the card answers; it cannot supply missing facts about the situation, which still need checking.」；B「不能，还要核对背景 / No, check the context」→「位置不提供缺少的现实情况。/ A position does not supply missing facts.」 | B；T3 |

- **I05-R1 教学**「用句子的任务检查：‘现在正……’是描述，‘接下来可以……’是建议。/ Check the sentence's task: 'Currently…' describes; 'Next, you could…' advises.」题「问下一步怎样备考，哪句更直接？/ For the next step in exam preparation, which is direct?」A「针对薄弱题型练习并查错 / Practise weak question types and review errors」→「给出下一步。/ It gives a next step.」；B「你之前买了资料 / You previously bought materials」→「只描述过去，而且购买并非牌所证明。/ It only describes the past; the purchase is not proved by the card.」答案 A；T1–T3。
- **I05-R2 教学**「如果有人一直改同一张照片，却还没准备整场展览，才可以说他被这一张照片拖住了。如果他只是刚开始练习，就不能直接这样判断。/ If someone refines one photograph but never organizes the exhibition, detail blocking the whole has support. If they just began training, that conclusion may not fit.」题「哪种情况说明，一直改细节已经耽误了整场展览？/ Which fact supports this obstacle reading?」A「最近花在修改同一张照片上的时间比较多。 / Spending more time recently revising the same photograph.」→「这个解释没有把画面线索连起来。一直改一张照片，却没有准备整场展览，确实耽误了原本要做的事。 / This reading does not connect the picture cues. It shows effort disconnected from the overall goal.」；B「一直改同一张照片，还没开始整理整组展览照片 / Revising one image while never organizing the set」→「一直改一张照片，却没有准备整场展览，确实耽误了原本要做的事。/ It shows effort disconnected from the overall goal.」答案 B；T3。

**I05-V1**「用星币八给沟通建议，哪项符合认真练习、不断改进的意思？/ Which retains Eight of Pentacles in communication advice?」A「练习明确表达，核对理解并调整 / Practise clear expression, check understanding and adjust」→「将技能练习用于沟通。/ It applies practice to communication.」；B「一看到星币就改问工资 / Change the question to salary because it is Pentacles」→「花色不能擅自替换原问题。/ A suit cannot replace the original question.」答案 A；T3。

**完成**「先看这张牌要回答什么，再结合实际问题，把意思说清楚。下一课把三张已学牌连起来。/ Position changes the task; the question supplies the context. Next, connect three learned cards.」下一课 I06。

<a id="lesson-i06"></a>
### I06｜用三张已学过的牌完成短解读 / A short reading with three learned cards

**目标与边界**：串联已学牌与位置；前置 I02、I03、I05，可逐张查看摘要；不先考陌生牌、不擅加因果。Word 中级第 6 课；本课“现状—建议—发展趋势”为明确标注的教学三位组合，不宣称传统唯一标准；S01 提供位置原则，S02 提供三牌教学背景。

**教学屏幕**
- **I06-T1**「虚构问题：我们小组要合办摄影展，大家很有热情，但不知道怎样开始。我可以怎么推进？抽牌前约定左至右：1 现状、2 建议、3 发展趋势。教学牌全部正位：圣杯骑士、星币八、圣杯十。/ Fictional question: Our group wants to organize a photography exhibition. Everyone is enthusiastic, but we do not know how to begin. How can I move it forward? Before drawing, define left to right: 1 situation, 2 advice, 3 tendency. The worked cards are all upright: Knight of Cups, Eight of Pentacles, Ten of Cups.」
- **I06-T2**「先回顾三张牌：圣杯骑士愿意为向往的事行动；星币八认真练习、把作品做好；圣杯十和重要的人一起感到幸福。在这个摄影展里，大家想一起办好展览，是现状；把照片选好、修好、布置好，是建议；认真做完后，大家一起体会完成展览的开心，是可能的发展。只有热情，还不够把展览办起来。/ Knight of Cups: motivated by an ideal, ready to express and participate. Eight of Pentacles: practical work, practice and quality. Ten of Cups: shared fulfillment and belonging. Here, shared vision is the situation, making the work is the advice, and a shared experience of completion is the tendency. Enthusiasm itself does not install an exhibition.」
- **I06-T3**「可以这样回答：你们都想把展览办好，接下来要分清谁选片、谁修图、谁布展，并一起检查完成得怎么样。把这些工作做好后，这组牌更倾向于大家能一起完成展览，并为此感到开心。但它没有保证会来多少观众、赚多少钱。选片和布展是结合摄影展举出的做法，不是每次抽到这些牌都必须做的事。/ Worked reading: You have a vision and willingness to join. Next, make selection, editing and installation into concrete tasks and check quality. If this work is implemented, the cards lean toward a meaningful shared achievement and belonging. They give no guaranteed audience or income. The task list is an application, not a command written on the cards.」

**分镜 I06-M**：三张真实牌在带标签的横排常驻→用户点“逐位读 / Read positions”，每段约0.45秒边框强调→讲解完才出现条件连接线 1→2→3。三个位置的含义可直接读，不需幻想；位置2建议不能画成必然发生的事件。静态三列表含每位句子及整组总结；可暂停重播。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| I06-Q1「大家想把展览办好。中间的星币八提醒他们接下来做什么？/ What needs implementation between the vision and shared fulfillment?」 | A「先继续讨论大家理想中的展览，等想法足够一致后再动手。 / Keep discussing the ideal exhibition and begin the work after everyone’s ideas align.」→「继续讨论会把准备停在想法里，展览仍没有实际进展。星币八在建议位要他们动手准备，并检查照片和布置。 / More discussion leaves the exhibition at the idea stage. As advice, the Eight of Pentacles calls for practical preparation and checks of the photographs and layout.」；B「动手准备展览，并检查照片和布置是否做好 / Practical production and quality checks」→「星币八在建议位，正是在提醒他们动手做，并检查做得怎样。/ This is Eight of Pentacles in advice.」 | B；T2–T3 |
| I06-Q2「哪句话既说出可能的发展，也说清要先做什么？/ Which preserves the tendency's condition?」 | A「先把展览认真准备好，大家才更有机会一起体会办成展览的开心 / Implementing the work supports a shared achievement」→「没有把方向变成无条件保证。/ This does not turn a tendency into an unconditional guarantee.」；B「先营造大家一起庆祝的气氛，准备工作可以边做边补。 / Create a shared celebratory mood first and fill in the preparation along the way.」→「先把展览认真准备好，才会增加大家一起庆祝成果的机会；这是一条有条件的方向，不是保证。 / Preparing the exhibition carefully increases the chance of celebrating together; it is a conditional direction, not a guarantee.」 | A；T3 |

- **I06-R1 教学**「先找中间那张的任务：它是建议，所以要说明可以做什么，而非再描述热情。/ Check the middle card's task: it is advice, so it should offer an approach, not merely describe enthusiasm again.」题「哪句解释位置2？/ Which explains position 2?」A「大家很向往这次活动 / Everyone likes the idea」→「重复现状，未处理建议。/ It repeats the situation instead of advice.」；B「把选片和制作分成任务，逐项检查 / Organize selection and production tasks and check each」→「具体说明了接下来要做什么，不只是说大家有热情。/ It applies practical effort.」答案 B；T2。
- **I06-R2 教学**「这里说的是：先把展览准备好，才更有机会一起庆祝完成。不能省掉准备，直接保证成功。 / The interpretation says: prepare the exhibition carefully first, then there is a better chance to celebrate its completion together. Do not remove the preparation and promise success.」题「哪种删减改变了原意？/ Which edit changes the meaning?」A「删掉‘先把展览认真准备好’，改成‘一定成功’ / Remove “prepare the exhibition carefully first” and replace it with “success is certain”」→「对，原来是先认真准备、才更有机会办好，删改后却成了不管做什么都一定成功。/ Correct identification: this changes a conditional direction into a guarantee.」；B「把‘大家为完成展览感到开心’换成‘大家一起庆祝展览办成’ / Replace “everyone feels happy about completing the exhibition” with “everyone celebrates the exhibition’s completion together”」→「这只是换个说法，仍是在说大家为完成展览感到开心。/ This is equivalent wording that preserves the theme.」答案 A；T3，题干检查编辑行为，不是让用户选择错误预测。

**I06-V1**「换成合办小型读书会，仍用同一教学牌位和三张牌。哪句话把这次的三张牌连起来回答了问题？/ For a small reading club with the same worked positions and cards, which keeps the method?」A「三张牌分别说三个词即可，不必回应问题 / State three isolated words without answering the question」→「没有完成整组连接。/ It does not connect the reading.」；B「大家想一起办读书会；先准备内容；认真办完后，一起分享收获 / Shared vision—prepare content—shared experience after effort」→「仍然是先说大家的想法，再说准备工作，最后说做好后可能得到的收获。/ It transfers the position tasks.」答案 B；T1–T3；当前题先给三牌摘要，回访版本可逐步撤提示。

**完成**「本课练习了把三张牌连起来，回答事情可能怎样发展，以及先要做什么。高级课程会进一步练习提问、牌阵与完整解读。/ This lesson practised connecting three cards into a conditional response. Advanced lessons develop questions, spreads and whole readings.」下一课 A01；允许继续单牌，不设背完 78 张门槛。

<a id="lesson-a01"></a>
### A01｜先问清楚，才能答到事情上 / Clarify the question to answer the actual issue

**目标与边界**：保留用户关心的事情与结果，补足解释所需范围；前置 I05、I06；不把结果问题强改成只谈感受、不要求长访谈。Word 高级第 1 课；S01 less8；S02；练习全为虚构。

**教学屏幕**
- **A01-T1**「要回答到点上，先说清在问哪件事，已经发生了什么，以及想看哪段时间。‘事业怎么样’可能指找工作、做项目或同事关系；先说清当前最想问哪件事。补充会影响判断的情况就好，不用讲所有经历。/ An answerable question usually specifies the issue, relevant context, scope and key conditions. 'How is my career?' might mean job hunting, a project or colleagues. Identify the current issue first. Add information that changes the interpretation, not your entire life story.」
- **A01-T2**「例子：‘我适合做设计吗？’补充背景是刚自学两周，希望三个月完成作品集，暂不转职。可以这样问：我想用三个月做出作品集。现在准备得怎样，主要困难是什么，接下来该先做什么？这保留设计目标，适用三牌现状—阻碍—建议。不是在替人判定一生天赋。/ Example: 'Am I suited to design?' Context: two weeks of self-study, a portfolio goal in three months, no job change planned. Refine it to: For completing a portfolio in three months, what are my situation, main obstacle and next-step advice? This preserves the design goal and fits situation–obstacle–advice. It does not judge lifelong talent.」
- **A01-T3**「如果真正在问‘能否完成’，可以保留结果问题，说明目标、时间与准备情况。解读给倾向、理由和条件，而不编造确定日期。比较两个方案时，先固定 A/B 和共同时间范围；只问今天练习重点，单牌就够，不因专业感而增加牌数。/ If the real concern is whether it can be completed, keep that outcome question and clarify goal, timing and preparation. Give a tendency, reasons and conditions without inventing an exact date. For two choices, define A/B and a common timeframe first. A single card is enough for today's practice focus; more cards do not make it more professional.」

**分镜 A01-M**：原问题固定→用户点开已有背景标签“自学两周／三个月作品集／不转职”→精炼问题中的对应短语淡亮（0.4秒），最后展示对应三位用途。不是自动生成或改写用户私人问题；静态为原问、背景、修订三栏，可暂停重播。练习通过点选，不需输入。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| A01-Q1「他现在想用三个月做出作品集。哪项是在继续问这件事？/ Which keeps the stated design-learning goal?」 | A「三个月作品集的现状、阻碍与建议 / Situation, obstacle and advice for the three-month portfolio」→「沿用已知事项与时间。/ It uses the given issue and timeframe.」；B「明年转职后会赚多少 / Earnings after a job change next year」→「新增了未计划的转职和时间。/ It adds an unplanned job change and timeframe.」 | A；T2 |
| A01-Q2「比较两个方案前，哪项必须先固定？/ Before comparing two options, what should be fixed?」 | A「先抽，哪条好就贴给喜欢的方案 / Draw first and give the better line to the preferred option」→「事后贴标签改变了比较规则。/ Relabelling afterward changes the comparison.」；B「A 和 B 分别是什么，以及比较哪段时间 / What A/B mean and their shared scope」→「保证两条路径可比较。/ This makes the two paths comparable.」 | B；T3 |

- **A01-R1 教学**「整理问题是在减少含糊，不是在替用户换目标。已知不转职，就不能突然开始预测转职工资。/ Clarifying reduces ambiguity; it does not replace the person's goal. If no job change is planned, do not start predicting a new salary.」题「摄影新手希望半年拍完一组人像，哪项范围合适？/ A beginner wants to finish a portrait series in six months. Which scope fits?」A「围绕人像作品的学习状态、障碍和建议 / Learning situation, obstacles and advice for the portrait series」→「保留给定目标。/ It preserves the given goal.」；B「何时开摄影公司并上市 / When a photography company will go public」→「加入了不存在的目标。/ It invents a goal.」答案 A；T1–T2。
- **A01-R2 教学**「先固定 A 与 B，才知道每条路线在回答哪个方案。看到牌后再把好看的路线给喜欢的方案，会让比较失去原来的对象；如果真实选项改变，可以重新提出问题，但不能倒改已经抽出的标签。/ Define A and B first so each path has a clear subject. Giving the preferred option the better-looking path after seeing the cards changes the comparison. If the real choices change, ask a new question; do not relabel an existing draw.」题「新例：小安比较周末参加实体摄影班与在线摄影班，时间范围都是未来两个月。抽牌前怎样准备？/ New example: An compares an in-person weekend photography class with an online class, both over the next two months. What should happen before drawing?」A「先不定 A/B，抽完把更好的路线给实体班 / Leave A/B undefined, then give the better path to the in-person class」→「抽完才决定 A、B，容易把喜欢的牌分给自己本来就偏好的选择。/ The subjects are assigned after the cards, so there is no preserved advance comparison.」；B「写定 A 为实体班、B 为在线班，并保持共同时间范围 / Fix A as in-person and B as online, with the shared timeframe」→「两条路线先有明确对象与相同范围，才可比较。/ Each path has a defined subject and the same scope before comparison.」答案 B；T3，专门回应 Q2 的抽后贴标签错误。

**A01-V1**「‘这次考核能否通过’是否必须改成‘我感觉如何’？/ Must 'Will I pass this assessment?' become 'How do I feel?'」A「不必。说清是哪次考核、准备得怎样，就可以讨论更倾向于通过还是不通过 / No; clarify the assessment and conditions, then address outcome tendency」→「保留真正关心的问题，同时说明条件。/ It retains the concern and its conditions.」；B「最好改成感受问题，因为塔罗更适合谈心理状态。 / It is better to rewrite it as a feelings question because tarot is more suited to inner states.」→「考核问题可以保留；把具体考核和准备情况说清，才有条件讨论更倾向通过还是不通过。 / The exam question can remain. Name the assessment and preparation clearly before discussing whether the outcome leans toward passing or not.」答案 A；T3；倾向不得被呈现为事实保证。

**完成**「先确定要回答的事，再选择需要的位置。下一课把单牌放回位置。/ Establish the issue, then select the needed positions. Next, place meanings within them.」下一课 A02。

<a id="lesson-a02"></a>
### A02｜守住牌义，再放进牌位 / Keep the meaning, then apply the position

**目标与边界**：实际三牌场景区分现状、阻碍、建议；前置 I05，并在本课先教 s02/m14 摘要；不靠读心补故事。Word 高级第 2 课；S02 三牌现状—阻碍—建议，S01 单牌与位置。

**教学屏幕**
- **A02-T1**「固定顺序：先知道牌的核心，再看牌位的任务，最后回应问题。圣杯二常说双方愿意交流、互相回应；宝剑二在本例说的是迟迟没有决定、事情卡住；节制常说调整不同做法，让彼此逐步配合。下面先把这些含义讲清，再读位置。/ Use a stable sequence: the card's core, the position's task, then the question. Two of Cups concerns reciprocity; Two of Swords here concerns suspended choice and stalemate; Temperance concerns adjusting proportions, coordinating differences and gradual integration. Learn these meanings before applying the positions.」必要时显示 [c02](#card-c02)、[s02](#card-s02)、[m14](#card-m14) 完整资料入口，返回恢复原步。
- **A02-T2**「虚构背景：伴侣商量共同出行，常因时间安排争执，双方仍愿意沟通。问题是这次计划的现状、主要阻碍及我能采取的建议。采用现状—阻碍—建议，左至右 1 圣杯二正位、2 宝剑二正位、3 节制正位。现状位可以理解为双方还愿意一起计划；阻碍位提醒看看有什么迟迟没决定，例如各自哪些日期不能改；建议位可以说先讲清哪些时间能改、哪些不能，再找两个人都能接受的安排。/ Fictional context: partners disagree about dates for a trip but both still wish to communicate. The question asks for the plan's situation, main obstacle and advice I can take. Use situation–obstacle–advice, left to right: 1 Two of Cups upright, 2 Two of Swords upright, 3 Temperance upright. The situation retains willingness to connect. The obstacle prompts checking whether non-negotiable dates remain unclear. Advice is to state necessary conditions and flexible parts, then seek a shared plan.」
- **A02-T3**「可以这样回答：你们还想一起出行，但安排卡住了。可以先问清各自哪些日期能改、哪些不能，再找两个人都能接受的安排。节制在建议位给协调方法，不保证旅行一定成行；宝剑二也没有证明谁秘密订了别的行程。/ Whole response: willingness to cooperate remains, but a key choice is unclear. State timing and necessary conditions, then try an arrangement both can accept. Temperance in advice offers coordination, not a guaranteed trip; Two of Swords does not prove a secret alternative booking.」

**分镜 A02-M**：来源明确的 three 横排常驻，完整位置标签与短定义可见→点击对应牌位时0.35秒框选并显示其解释→点“看整组 / Read together”取消单牌选中、显示总结。静态三行表及总结；无需逐张翻开才能阅读，无强制锁定单牌；可暂停重播。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| A02-Q1「节制在建议位，哪句话是在给下一步的做法？/ Which correctly uses Temperance in this advice position?」 | A「目前的行程安排看起来已经比较协调。 / The current travel plan appears reasonably coordinated.」→「先别按这个做法继续；先说清差别，再找双方能配合的安排，符合节制刚才讲的意思。 / Do not continue with this approach yet; It turns coordination into an approach.」；B「各自说清哪些日期不能改，再商量可以调整的安排 / Clarify necessities and coordinate flexible parts」→「先说清差别，再找双方能配合的安排，符合节制刚才讲的意思。/ It turns coordination into an approach.」 | B；T1–T3 |
| A02-Q2「想断言某人秘密订了别的行程，缺什么？/ To assert someone secretly booked another trip, what is missing?」 | A「现实信息的支持 / Supporting real-world information」→「迟迟没决定出行日期，不等于对方已经秘密订了别的行程。/ Stalemate does not prove a secret event.」；B「更肯定的语气 / A more confident tone」→「语气不能提供证据。/ Tone supplies no evidence.」 | A；T2–T3 |

- **A02-R1 教学**「建议位可以说‘怎样增加协调机会’，不能直接说‘已经成功’。前者是做法，后者是结果。/ Advice can say how to improve coordination, not that success is already achieved. One is an approach; the other an outcome.」题「哪句仍是节制建议？/ Which remains Temperance advice?」A「各自先把自己的安排定死，再看谁愿意迁就。 / Have each person fix their own schedule first, then see who is willing to give way.」→「这项做法先把各自的安排定死，再让一方迁就，缺少双方说明可调整空间并一起协调的步骤。 / This fixes each person’s schedule first and asks one side to give way; it lacks a step where both sides state what can move and coordinate together.」；B「先各自说清能调整的日期 / First state which dates each can adjust」→「提供协调动作。/ It offers a coordinating action.」答案 B；T3。
- **A02-R2 教学**「用‘可以核实是否……’标明假设，不能把它偷换为‘已经查明……’。/ Mark a hypothesis with 'check whether…'; do not replace it with 'it has been established…'.」题「根据本例宝剑二，哪句话没有把猜测说成事实？/ Which correctly expresses the level of inference for Two of Swords here?」A「可以核实双方是否没说清日期限制 / Check whether date constraints remain unstated」→「这是接下来可以问清楚的事，没有假装已经知道答案。/ It is a checkable interpretive hypothesis.」；B「已经证明对方另有安排 / It proves the partner has other plans」→「越过了现有信息。/ It exceeds the available information.」答案 A；T2–T3。

**A02-V1**「同事筹办活动仍用本课三位与三牌，哪项建议也适合用在这个活动安排上？/ Colleagues plan an event with the same positions and cards. Which transfers the advice?」A「先照顾大家的情绪，具体时间和分工可以活动前再定。 / Attend to everyone’s feelings first and settle timing and responsibilities shortly before the event.」→「把时间和分工拖到活动前再定，仍没有解决彼此安排冲突。双方应先说明限制，再协调可以调整的部分。 / Postponing timing and responsibilities until shortly before the event leaves the scheduling conflict unresolved. Each side should state constraints and coordinate what can move.」；B「明确各自限制，协调可调整的安排 / Clarify constraints and coordinate flexible arrangements」→「虽然换成同事，仍是在找双方能配合的安排。/ It preserves coordination in a new domain.」答案 B；T1–T3。

**完成**「先读位置任务，再组织全组；单牌资料可以查，但最终回答要回到原问题。/ Read the position's task, then the whole spread. Card references can help, but the final response must return to the question.」下一课 A03。

<a id="lesson-a03"></a>
### A03｜把多张牌连成主线 / Connect several cards into a main thread

**目标与边界**：以已教含义整合三牌，区分有牌位与无牌阵；前置 A02，先补 p11/c07/p08 摘要；不把横向排列强作因果。Word 高级第 3 课；S02、S01；自由三张是用户需求的开放抽牌模式，非传统命名牌阵。

**教学屏幕**
- **A03-T1**「几张牌有时在强调同一件事，有时各说一部分，也可能一张想往前、一张想维持原样。如果事先定了过去、现在、未来，还可以按时间连起来读。不必硬把每两张连起来；摆在旁边，不代表前一张就是后一张的原因。/ Cards can reinforce a theme, add a perspective, create tension, or form a process within agreed time positions. You need not link every pair; sitting beside another card does not establish causation.」
- **A03-T2**「本例先学三张摘要：星币侍从是认真开始实际学习；圣杯七是许多可能与设想，需要选择；星币八是认真练习、把手艺练好。虚构背景：小林收藏许多摄影课程，买了工具，两个月没完成专题；想四周内完成十张照片。用现状—阻碍—建议：1 星币侍从正位，2 圣杯七正位，3 星币八正位。/ First learn the example's card summaries: Page of Pentacles is a serious practical beginning; Seven of Cups concerns many possibilities and images requiring selection; Eight of Pentacles concerns skilled effort and refinement. Fictional context: Lin collected courses and tools but finished no series in two months; the goal is ten photographs in four weeks. Situation–obstacle–advice: 1 Page of Pentacles upright, 2 Seven of Cups upright, 3 Eight of Pentacles upright.」
- **A03-T3**「可以这样解读：小林想学摄影，但想做的太多，迟迟没有完成一组照片。先选一个题材，实际拍摄、检查和修改，争取四周内做完这一组。三张连起来是：想学，但拿不定主意做什么，所以先选一件认真做。不是说他没有天赋。两张星币可辅助总结实际投入，但不是唯一依据。若改用无牌阵三张，三张共同回应问题，编号仅为抽取顺序，不能临时把第三张命名为结果位。/ Whole reading: willingness to learn exists, but scattered options prevent preparation from becoming finished work. Fix one subject, shoot, review and improve toward a series in four weeks. The thread is willingness to learn—distraction by possibilities—focused practice, not lack of talent. Two Pentacles cards support a practical summary but are not the sole basis. In an open three-card draw, all three address the question; numbers show draw order only. Do not invent an outcome position for the third card afterward.」

**分镜 A03-M**：三张牌与位置常驻→先点击分别显示已教摘要→用户点“连起来 / Connect them”，相关词“学习／选择分散／实践”依次淡亮，约0.4秒，随后全句停留。切到无牌阵说明时移除位置语义，仅显示1/2/3抽取顺序，禁止保留结果箭头。静态两种明确标注的布局，暂停重播均可。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| A03-Q1「哪句话把现状、阻碍和建议都说清楚了？/ Which retains information from all three positions?」 | A「有学习意愿，选择分散，应集中做一组作品 / Willing to learn but scattered; focus on one series」→「连接现状、阻碍和建议。/ It connects situation, obstacle and advice.」；B「有学习意愿，也有很多选择；继续同时尝试，之后自然会找到方向。 / There is motivation and there are many choices; keep trying them together and a direction will emerge.」→「这个案例既有学习意愿，也有选择分散的问题；建议应落到集中完成一组作品。 / The case shows willingness to learn but scattered choices; the advice should focus on completing one body of work.」 | A；T2–T3 |
| A03-Q2「无牌阵第三张是否自动是结果？/ Is the third card in an open draw automatically the outcome?」 | A「是，最后抽就叫结果 / Yes, last drawn means outcome」→「第三个抽出来，不代表抽牌前已约好它代表结果。/ This changes order into a position meaning.」；B「不是，数字只记抽取顺序 / No, the number records draw order」→「没有事前约定结果位。/ No outcome position was agreed.」 | B；T3 |

- **A03-R1 教学**「本例星币侍从说明他想认真学，圣杯七提醒他想做的太多，星币八建议先选一件、动手练好。只说‘毫无意愿’会否定第一张，也解释不了为什么第三张建议练习。/ Page of Pentacles preserves a serious learning start, Seven of Cups identifies scattered choices, and Eight of Pentacles advises focused practice. Saying 'no willingness' denies the first card and does not explain the third.」题「新例：小周认真看木工资料，却同时想做桌子、柜子和书架，迟迟没做出东西。沿用本课三位与三牌，哪句话既指出目前的困难，也给出了下一步的做法？/ New example: Zhou seriously studies woodworking but wants to make a table, cabinet and shelf at once and has finished nothing. With this lesson's positions and cards, which retains the whole thread?」A「愿意学习，但选择太散；先定一个小作品，实际制作和打磨 / Willing to learn but scattered; choose one small item, then make and refine it」→「既说出了他愿意学，也指出想做的太多，最后给出先做一件的办法。/ It keeps the positive foundation, scattered-choice obstacle and practical advice.」；B「愿意学习，项目多说明兴趣广；先轮流都做一点，再看哪个先有成果。 / The many projects show broad interest; work on each in turn and see which produces a result first.」→「三个项目轮流做，仍然保留了选择分散的阻碍。这里要先缩小范围，完成并打磨一个小作品。 / Rotating among three projects preserves the scattered-choice obstacle. Narrow the scope first, then make and refine one small item.」答案 A；T2–T3，回应 Q1 的否定现状及丢失主线。
- **A03-R2 教学**「位置需要抽牌前约定。自由三张仍可谈共同主题，只是不假装有过去或结果的位置。/ Positions require advance agreement. Open draws can still discuss shared themes without pretending to have past or outcome positions.」题「自由抽三张后，哪种说法没有临时给牌加上未约定的位置？/ Which respects an open three-card draw?」A「第一张现在改叫过去 / Rename the first card Past」→「事后补了未约定的位置。/ It adds an unagreed position afterward.」；B「这三张共同强调实践与选择 / These cards jointly emphasize practice and choice」→「是在一起解释三张牌，没有临时给某张加上过去或结果的意思。/ It discusses contributions without inventing positions.」答案 B；T1、T3。

**A03-V1**「新例：小周认真看烹饪课，收藏了很多菜谱，却没有做出一道成品。仍用本课三位与三张正位牌：现状星币侍从、阻碍圣杯七、建议星币八。他想学，却一直没做出一道菜。哪项建议更符合这组三张牌？/ New example: Zhou studies cooking seriously and collects many recipes but has made no finished dish. Use the same upright spread: Page of Pentacles as situation, Seven of Cups as obstacle and Eight of Pentacles as advice. Which better addresses the main blockage?」A「先缩小到一道菜，实际制作并检查哪里需要改进 / Narrow the choice to one dish, cook it and review what needs improvement」→「星币侍从说他愿意学，圣杯七提醒想做的太多，星币八建议认真动手练。因此先做一道菜、做好后再改，能把三张牌连起来。/ The situation acknowledges willingness; the obstacle identifies scattered choices; the advice turns learning into focused practice. All three positions are retained.」；B「从收藏的菜谱中每天换一道尝试，用多做几个方向来寻找最适合的。 / Try a different saved recipe each day and use several directions to discover the best fit.」→「这个解释没有把画面线索连起来。星币侍从说他愿意学，圣杯七提醒想做的太多，星币八建议认真动手练。因此先做一道菜、做好后再改，能把三张牌连起来。 / This reading does not connect the picture cues. The situation acknowledges willingness; the obstacle identifies scattered choices; the advice turns learning into focused practice. All three positions are retained.」答案 A；T2–T3。

**完成**「本课示范了怎样把逐张解释连成一条主线。下一课检查逆位怎样进入整组。/ This lesson demonstrated how separate meanings form a main thread. Next, integrate a reversal.」下一课 A04；开放解释展示此完整参考路径，不把照抄作为完成条件。

<a id="lesson-a04"></a>
### A04｜让逆位进入整组，而非另列一串词 / Integrate reversals instead of listing possibilities

**目标与边界**：按背景、位置、邻牌选择有依据的解释；前置 I04、A03；不因逆位数量判输赢。Word 高级第 4 课；S01 less17；本课三位组合沿用 S02 现状—阻碍—建议。

**教学屏幕**
- **A04-T1**「读逆位时，先记住这张牌原本在说什么，再看具体情况。某些牌可能是在说做得不够，也可能是在说做过了头；这次是哪一种，要看题目告诉了我们什么。旁边的牌能帮助一起理解，但不能凭空增加没发生过的事。/ Retain the theme before identifying this reversal's change. Lack and excess may both be possible for some cards, but you cannot assert both indiscriminately in one case. Other cards help integration; they do not create real-world facts.」
- **A04-T2**「虚构背景：作品已符合展示要求，小林仍不断修改细节，错过自己定的提交时间。教学三牌：1 现状星币侍从正位——仍愿意认真学、动手做；2 阻碍星币八逆位——细节一直改，反而迟迟做不完；3 建议星币骑士正位——稳步执行、可靠跟进。骑士本课含义先明示，不要求猜陌生牌。/ Fictional context: Lin's work meets exhibition requirements, but repeated tiny revisions have missed a self-set deadline. Worked spread: 1 situation, Page of Pentacles upright—practical learning matters; 2 obstacle, Eight of Pentacles reversed—unbalanced refinement obstructs completion; 3 advice, Knight of Pentacles upright—steady execution and reliable follow-through. The Knight's meaning is supplied; you are not expected to guess it.」
- **A04-T3**「可以这样回答：小林一直在认真做，但作品已经够用，还在反复改细节，结果没按时交。先列出真正必须改的地方，改完就按计划提交。这里要改的是做法，不能说他从来没努力。星币骑士是行动方式，不能据此确定有某位男性来替你完成。如果不知道他练过没有、怎样练，就先问清楚，再判断是没开始做，还是做法需要调整。/ Whole response: serious learning is a foundation, but refinement no longer serving delivery calls for step-by-step completion. Define required changes and a stopping condition, then submit to plan. This supports changing the refinement process, not claiming no effort. Knight of Pentacles is an approach, not proof that a man will finish it for you. Without practice context, insufficient effort and an unbalanced method remain alternatives; actual practice information is needed to distinguish them.」

**分镜 A04-M**：p11正位、p08逆位、p12正位带位置常驻；点“查背景 / Check context”时现实条件“已达要求／反复改／错过时间”与对应解释同步突出约0.4秒；点“看建议 / See advice”强调p12并保留p08，不强制切单牌页。静态全部条件与三位说明可读，可暂停重播。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| A04-Q1「本例哪项更符合星币八逆位？/ Which reading of reversed Eight of Pentacles fits this case?」 | A「从未付出时间 / No time was invested」→「与反复修改矛盾。/ It contradicts repeated revision.」；B「细节改得太多，耽误了提交作品 / Excessive refinement obstructs delivery」→「与已达要求却持续修改相符。/ It fits continued revision after requirements are met.」 | B；T2–T3 |
| A04-Q2「建议位星币骑士在这里补充了什么？/ What does Knight of Pentacles add in advice here?」 | A「稳步执行到完成的方式 / A steady way to follow through to completion」→「这里卡在一直改、迟迟不交，所以建议按步骤做完并提交。/ It addresses the blockage from unbalanced refinement.」；B「帮助主要来自一位经验较少但做事务实的人。 / The help mainly comes from a less experienced but practical person.」→「先别按这个做法继续；这里卡在一直改、迟迟不交，所以建议按步骤做完并提交。 / Do not continue with this approach yet; It addresses the blockage from unbalanced refinement.」 | A；T2–T3 |

- **A04-R1 教学**「两个说法先与背景对照：有大量修改，就不能说完全没做。再看修改是否推进了目标。/ Compare each claim with the context: extensive revision rules out doing nothing. Then check whether revision advances the goal.」题「改动越来越小，提交却不断延后，优先关注什么？/ Revisions shrink while submission keeps slipping. What should be examined first?」A「花在作品上的总时间是不是还不够。 / Whether the total time spent on the work is still insufficient.」→「牌里已经给出“一直改小细节”的线索；先核对它是否拖慢交付，才回应眼前变化。 / The cards already show repeated small edits; check whether they delayed delivery to address the stated change.」；B「是否一直改小细节，耽误了按时做完 / Whether detail work and completion are out of balance」→「直接回应已给变化。/ It addresses the given change.」答案 B；T2。
- **A04-R2 教学**「星币骑士在这个建议位给出的是稳步做完、可靠跟进的做法，不是在宣布某个男性会出现。任何人都能采取这种方式；若现实有人协助，仍要另外确认。/ In this advice position, Knight of Pentacles offers steady completion and reliable follow-through, not the arrival of a man. Anyone can use that approach; real assistance still needs separate confirmation.」题「新例：小安为社团整理活动材料，建议位是星币骑士。怎样做符合星币骑士刚才讲的建议？/ New example: An is preparing event materials for a club, with Knight of Pentacles as advice. Which applies this lesson's use of the role?」A「把材料列清，按顺序完成并跟进遗漏 / List the materials, complete them in sequence and follow up omissions」→「把稳步执行变成自己的行动，不依赖虚构帮助者。/ It makes steady execution your action without inventing a helper.」；B「暂停整理，等待牌里预告的男性替自己做完 / Stop preparing and wait for the predicted man to finish it」→「牌位没有提供帮助者身份或到来保证，也没有回答自己的行动。/ The position establishes neither a helper's identity nor arrival, and it fails to address your action.」答案 A；T2–T3，回应 Q2 的行动方式误作性别身份。

**A04-V1**「若背景改成报名后从未做作业，同张逆位先关注什么？/ If the context changes to never doing assignments after enrolling, what does the same reversal first highlight?」A「仍断定修改过度 / Still assert excessive revision」→「新背景没有任何修改支持。/ The new facts contain no revision to support that.」；B「报名了，却还没有开始做作业 / Practical effort has not been implemented」→「题目变成从没做作业，应该先开始动手，不能再说是修改太多。/ New context supports a different change within the same theme.」答案 B；I04-T2、A04-T1。

**完成**「先看实际发生了什么，选择说得通的逆位解释，再结合其他牌，一起回答问题。/ Context narrows a reversal's possibilities; the other positions help answer the question.」下一课 A05；未区分逆位的错误仅回访相关知识，不重学整套牌阵。

<a id="lesson-a05"></a>
### A05｜二择一：比较两条完整路径 / A choice spread: compare two complete paths

**目标与边界**：准确读五牌 V 形与有条件倾向；前置 A01–A04，五张摘要本课明示；不按孤立牌的好坏排名、不采用其他编号版本。Word 高级第 5 课；S03 的 1→2→4、1→3→5 版本，抽取仪式为本产品自定；参见项目牌阵来源说明。

**教学屏幕**
- **A05-T1**「本课采用五牌 V 形：1 当前状况在下方中央；2 A 当前发展在左中，4 A 结果趋势在左上；3 B 当前发展在右中，5 B 结果趋势在右上。两条路线是 1→2→4 与 1→3→5。抽牌前固定选项与同一时间范围，不能读完后换标签。/ This five-card V places 1 current situation at the bottom centre; 2 A development at mid-left and 4 A outcome tendency at upper-left; 3 B development at mid-right and 5 B outcome tendency at upper-right. Read 1→2→4 and 1→3→5. Define the choices and a shared timeframe before drawing; do not relabel afterward.」
- **A05-T2**「虚构案例：设计助理可选 A 有资深同事指导的跨部门项目，或 B 独立负责新品牌小项目，都要兼顾现有工作。问未来三个月，哪一个更能帮他做出拿得出手、能展示能力的作品？五张均正位：1 星币二——同时安排几件事；2 星币三——合作、交流做法；3 权杖侍从——想尝试新东西；4 星币八——认真练习，把作品做好；5 权杖十——要负责的事越来越多，负担很重。/ Fictional case: a design assistant can choose A, a cross-team project with senior guidance, or B, independently leading a small new-brand project. Both must fit existing work. Over three months, which better supports completing a quality project that demonstrates ability? All cards are upright: 1 Two of Pentacles—balancing tasks and resources; 2 Three of Pentacles—collaboration and skill exchange; 3 Page of Wands—enthusiastic exploration; 4 Eight of Pentacles—practice, refinement and quality; 5 Ten of Wands—accumulating responsibility and burden.」
- **A05-T3**「先看共同的情况：手上还有工作，所以不论选 A 还是 B，都要看自己有没有时间做。A 有人一起讨论做法、指出问题，之后还要自己认真练习和修改。有人帮忙，但不能替他把作品做完。B 从新方向热情走向负担增加，独立自由可能伴随提案、协调和制作都落在一人身上；这符合兼顾现有工作的背景，不是说独立项目一律差。/ Start with the shared situation: existing work makes resources relevant to both paths. A moves from collaboration to individual refinement, with clearer support but still requiring effort. B moves from exploration to heavier responsibility; freedom may also bring proposal, coordination and production to one person. This fits the existing workload; it does not mean independent projects are always bad.」
- **A05-T4**「完整回应：如果目标是三个月内把作品做好，这组牌更支持 A：有人给意见，自己再练习和修改。B 也可以考虑，但要先少做几项，问清谁能帮忙，避免所有事都压到自己身上。如果后来发现 A 的时间根本排不开，就要重新考虑，不能因为牌更偏 A，就忽略现实里做不到。牌组也没有承诺 A 一定升职。/ Whole response: for a quality project in three months, this spread favors A because collaborative feedback can feed into individual practice. B remains possible, but narrow delivery and confirm help to avoid overload. If A later proves impossible to attend, acknowledge changed feasibility and reconsider; reality does not have to obey the cards. The spread also does not guarantee promotion through A.」

**分镜 A05-M**：五牌真实V布局及编号常驻，位置1先框选→用户点“A 路线 / Path A”时按1、2、4分三段约0.4秒强调→点B依次1、3、5→点击“比较 / Compare”取消单牌选中，呈现共同目标及两条完整解释。不能用彩带金色标A必胜、红色标B失败。较小屏幕仍有完整布局缩略图与可读分组说明；静态标清两路径，暂停重播不改抽牌顺序。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| A05-Q1「本版本 A 路线读哪几个位置？/ Which positions form path A in this version?」 | A「1→2→4 / 1→2→4」→「从共同现状走到 A 发展与 A 趋势。/ It joins the shared situation, A development and A tendency.」；B「1→2→3 / 1→2→3」→「第3位是 B 发展，不属于 A 路线。/ Position 3 is B development, not part of A.」 | A；T1 |
| A05-Q2「为什么本例更支持 A？/ Why does this example favor A?」 | A「A 路线里星币牌更多，因此先把它看成更稳妥 / Path A has more Pentacles cards, so treat it as the safer route」→「这仍是在数花色，没有结合现有工作、合作过程和三个月内完成作品的目标。/ This still counts suits instead of relating workload, process and goal.」；B「本来工作就不少，A 有人一起讨论和指导，更利于自己继续练、把作品做细 / Under existing workload, collaboration supports sustained refinement」→「他本来就要兼顾工作。A 有合作指导，最后仍要自己认真做，更符合三个月内做好作品的目标。/ It connects situation, development, tendency and goal.」 | B；T2–T4 |

- **A05-R1 教学**「先从第1张开始。选 A 时再看第2、4张；选 B 时再看第3、5张。第1张是两条路线共同的起点。/ Start with card 1. For A, continue with cards 2 and 4. For B, continue with cards 3 and 5. Card 1 is the shared starting point.」题「B 结果趋势在哪里？/ Where is B's outcome tendency?」A「5 / 5」→「右上第5位承接右中第3位。/ Upper-right 5 follows mid-right 3.」；B「4 / 4」→「第4位属于 A。/ Position 4 belongs to A.」答案 A；T1；补学时静态图始终可见，下一次无提示验证编号。
- **A05-R2 教学**「本例更支持 A，是因为本来就有不少工作，有人一起讨论和指导，更有利于把作品做好。不是因为星币比权杖好。要结合想做成什么，以及 A、B 各自怎样发展来比较。/ A is favored because collaboration can support sustained refinement under an existing workload, not because Pentacles is inherently better than Wands. Retain the goal, shared situation and both paths.」题「新例：小周要在两个月内完成展览作品，又有日常任务。沿用刚才五张牌：选 A，有人一起讨论，之后自己继续修改作品；选 B，独立尝试新方向，但要负责的事越来越多。为什么这里更支持 A？/ New example: Zhou aims to finish exhibition work in two months while keeping daily duties. The same five worked cards show collaboration leading to refinement versus carrying more work alone. Which reason actually supports the collaborative project?」A「A 路线有人一起讨论，合作本身就足以抵消期限和工作量。 / Path A includes discussion with another person, so collaboration itself offsets the deadline and workload.」→「有人讨论不等于期限和工作量会自动消失。A 更受支持，是因为合作指导能帮助持续修改作品，并更有机会按期完成。 / Discussion with another person does not erase the deadline or workload. A is better supported because guidance can sustain revisions and improve the chance of finishing on time.」；B「本来任务就不少，有人合作指导，更方便持续修改作品、争取按期完成 / Collaborative support can sustain refinement and better fit completion under the existing workload」→「比较的是哪种安排更利于按期做好作品，不是在给花色分高低。/ It compares processes against the goal and workload, without ranking suits.」答案 B；T2–T4，回应 Q2 的孤立牌或花色优劣判断。

**A05-V1**「用本例 B 路线制定准备，哪项回应权杖十的负担？/ To prepare for path B, which action addresses Ten of Wands' burden?」A「限定范围并确认能得到的协助 / Limit scope and confirm available help」→「处理任务积累的实际条件。/ It addresses accumulating tasks.」；B「保留现有任务，用更严格的日程把它们同时推进。 / Keep the current tasks and use a stricter schedule to move them forward together.」→「任务已经积累时，先限定作品范围并确认协助，才是在处理时间和资源条件。 / When tasks have accumulated, limit the project scope and confirm available help to address the real time and resource constraints.」答案 A；T3–T4。

**完成**「二择一要比较整条路径，而不是只挑喜欢的一张。本课展示了倾向、理由与条件怎样放在一起。/ A choice reading compares whole paths, not a favorite card. This lesson showed how a tendency, reasons and conditions fit together.」下一课 A06。案例表达不是唯一标准答案；题目只检查编号、已讲主线与背景一致性。

<a id="lesson-a06"></a>
### A06｜凯尔特十字：整合复杂信息 / Celtic Cross: integrate complex information

**目标与边界**：认识采用版本的十位职责、整合三条主线；前置 A02–A05，所有本例单牌摘要在T2提供；不要求闭卷背全部牌位或78张，不把十牌当默认专业门槛。Word 高级第 6 课；S04 Waite III§7。教学改编：省略额外指示牌，固定5左6右；不混用 Bunning 的另一编号。

**教学屏幕**
- **A06-T1**「本课凯尔特十字采用这些职责：1 整体影响；2 交叉阻碍；3 目标或尚未实现的可能；4 基础；5 正在退去的影响；6 即将作用的影响；7 自己的态度；8 环境；9 希望或担忧；10 结果趋势。中心1与2，3上4下，5左6右；右边一列7至10自下向上。2的横放只表示交叉位置，不自动变成逆位；正逆位按原抽取方向记录。/ This Celtic Cross uses: 1 overall influence; 2 crossing obstacle; 3 goal or unrealized possibility; 4 foundation; 5 receding influence; 6 approaching influence; 7 your attitude; 8 environment; 9 hopes or fears; 10 outcome tendency. Positions 1–2 are central, 3 above, 4 below, 5 left and 6 right; the right column runs 7 to 10 from bottom to top. Card 2's horizontal placement marks crossing, not an automatic reversal; retain its originally recorded orientation.」
- **A06-T2**「虚构案例：社区小组计划两个月内举办旧物交换，场地初步获准，成员有热情，但分工和登记未确定。问：按现在的准备情况，活动接下来可能怎样？最该先解决什么？下面十张都是正位，先逐位讲清再整合。/ Fictional case: a community group plans a swap event in two months. Venue approval is preliminary, members are enthusiastic, but responsibilities and item registration remain unclear. How might it develop from current preparation, and what needs addressing? All ten cards below are upright. First learn each position's meaning, then integrate.」

| 位置／实际讲解（均为 T2 内容） | English teaching copy |
|---|---|
| 1 整体影响：星币三。活动需要大家一起做，分清各人擅长什么、负责什么，不能只靠发起人想办成。 | 1 Overall influence: Three of Pentacles. The event needs collaboration and complementary skills, not only its initiator's wishes. |
| 2 交叉阻碍：权杖五。大家意见不同、做法不一致，和目前分工没定的情况相符，但不代表有人故意捣乱。 | 2 Crossing obstacle: Five of Wands. Competing opinions and approaches fit unclear responsibilities; they do not prove sabotage. |
| 3 目标或可能：太阳。希望活动清楚、有趣，大家都能愉快参与。这是想办成的样子，还不是已经办成的结果。 | 3 Goal or possibility: The Sun. An open, clear and enjoyable experience is the possibility being pursued, not success already achieved. |
| 4 基础：星币六。交换涉及拿出东西、收到东西，以及怎样分配，所以要说清谁提供什么、谁能领取。 | 4 Foundation: Six of Pentacles. Giving, receiving and resource allocation underpin the exchange; clarify who provides and receives. |
| 5 渐退影响：权杖侍从。一开始因为觉得新鲜、有意思，大家想办这个活动。现在光有热情不够，还要动手准备。 | 5 Receding influence: Page of Wands. Early exploratory enthusiasm launched the idea, but novelty alone cannot complete the next stage. |
| 6 将来影响：星币骑士。接下来要一步步把准备工作做好，比如定时间、做登记、分清谁负责，不能等着一下子全解决。 | 6 Approaching influence: Knight of Pentacles. The next emphasis is steady execution—scheduling, registration and responsibility—not a dramatic instant breakthrough. |
| 7 自己的态度：魔术师。发起人愿意用自己的能力和手头工具把活动办起来。可以主动组织，但不用把所有活都揽下来。 | 7 Your attitude: The Magician. The initiator is ready to use skills and tools actively; apply that initiative to organizing rather than owning every task. |
| 8 环境：教皇。活动要按现有规则和流程来。场地只是初步同意，要再问清使用要求，不能认定主办机构会解决所有问题。 | 8 Environment: The Hierophant. Existing rules and procedures matter. With preliminary permission, check venue requirements; institutional rescue is not guaranteed. |
| 9 希望或担忧：宝剑九。发起人担心细节出错、让人失望；这张牌在这里说的是他担心什么，不是在预告会出事故。 | 9 Hopes or fears: Nine of Swords. The initiator fears mistakes and disappointing others. In this position, fear is a theme, not a prediction of an accident. |
| 10 结果趋势：权杖四。有机会把这次活动办成，让大家聚在一起庆祝。但还要结合前面各张牌，看看需要先做好什么。 | 10 Outcome tendency: Four of Wands. Milestone completion, gathering and celebration offer a positive direction, to be read with implementation conditions. |

- **A06-T3**「把十条信息收成三条主线。第一，看第 1、2 位：需要合作，但大家做法不一致，所以先把分工说清。第二，看接下来怎么做：第 5 位的权杖侍从说起初有热情，第 6 位的星币骑士提醒现在要一步步准备。第 4 位的星币六提醒分配东西，第 8 位的教皇提醒遵守场地规则。第三，把想办成的样子、担心的事和可能的结果分开：太阳在目标位，宝剑九在担忧位，权杖四在结果趋势位，不能把担忧直接当结果。/ Reduce ten pieces of information to three threads. First, collaboration is the foundation and coordination the blockage: Three of Pentacles with Five of Wands supports clarifying responsibilities. Second, move from enthusiasm to execution: receding Page of Wands to approaching Knight of Pentacles, with Six of Pentacles adding resources and Hierophant adding rules. Third, separate possibility from fear: Sun is a goal, Four of Wands a tendency, and Nine of Swords a fear position, not the outcome itself.」
- **A06-T4**「完整回应：整体上，这次活动有机会办成，让大家一起庆祝。前提是把分工、登记和场地要求处理好。现在最需要说清谁负责、什么时候做完，不是继续确认大家有没有热情。优先确认负责人、进度和规则，再检查最担心的准备项目。是否最终办成仍取决于现实工作与条件变化；这组牌不能代替筹备。/ Whole response: the overall tendency is toward a positive milestone, provided responsibilities, registration and venue requirements are implemented. Clear ownership and steady execution matter more now than proving enthusiasm. Confirm owners, schedule and rules, then check the preparations causing most concern. Actual completion depends on real work and changing conditions; this spread does not replace preparation.」

**分镜 A06-M**：完整10位缩略图始终在可见范围，用户点“按组看 / Read in groups”依次强调1＋2、4＋5＋6＋8、3＋9＋10，其余降低强调但不消失；每组约0.5秒过渡，讲解停留至继续，7在逐位讲解保留且整组回顾可查。位置2为可分选的交叉层，若数字屏为可访问性摆在1旁需注明交叉职责，不把旋转动画当抽到逆位。静态为带编号布局、十位表、三条总结；可暂停重播、放大后恢复位置。禁止循环闪烁十张牌制造信息噪声。

| ID／题干 | 选项与对应反馈 | 答案／依据 |
|---|---|---|
| A06-Q1「第9张在说“希望或担忧”。这里的宝剑九说明了什么？/ Position 9 describes hopes or fears. What does the Nine of Swords mean here?」 | A「活动临近时会出现新的麻烦，需要提前防范。 / New problems are likely to appear as the event approaches, so prepare for them.」→「这个说法混淆了题目正在考的含义。第 9 位在说他担心什么。可以接着检查准备工作，不必把担心直接当成会发生的事。 / This statement confuses the meaning being tested. It keeps fear in its position and links to practical checking.」；B「发起人担心活动准备出错 / The organiser is worried about mistakes in preparing the event」→「第 9 位在说他担心什么。可以接着检查准备工作，不必把担心直接当成会发生的事。/ It keeps fear in its position and links to practical checking.」 | B；T1–T3 |
| A06-Q2「根据本例已给的背景与十个位置，哪项应优先安排来推进活动？/ Given this example's context and ten positions, which priority best advances the event?」 | A「把任务分给负责人，落实登记与场地要求，再跟进执行 / Assign task owners, implement registration and venue requirements, then follow through」→「第 1、2 位说明需要合作，但做法还没谈妥；第 6 位提醒一步步准备，第 4、8 位提醒物品分配和场地规则。因此先分工、登记、确认场地，正好处理目前没定下来的事。/ Three of Pentacles in 1 and Five of Wands in 2 locate the coordination issue; Knight of Pentacles in 6 supports execution; Six of Pentacles in 4 and Hierophant in 8 add resources and rules. This addresses the stated unfinished preparation.」；B「先扩大宣传和创意征集，靠更多热情解决当前分工问题 / Expand promotion and collect more ideas first, relying on enthusiasm to resolve the role problem」→「太阳说的是想办成的样子，魔术师说发起人愿意主动做，并不代表分工已经解决。第 5、6 位也提醒从想办，走到实际准备。宣传可以安排，但眼下先要确定负责人和场地要求。/ The Sun in 3 is a goal and Magician in 7 an organizing attitude, not reasons to bypass the coordination issue in 2. Initial enthusiasm recedes in 5 while 6 calls for execution. Promotion may have a place, but it is not the priority gap stated here.」 | A；T2–T4 |

- **A06-R1 教学**「先把第9、10张分开看：第9张宝剑九说发起人担心什么；第10张权杖四说活动有机会办成。担心出错，不等于最后一定会失败；还要看分工、登记和场地准备能否做好。/ Separate cards 9 and 10: the Nine of Swords in 9 describes the organiser’s worries; the Four of Wands in 10 suggests the event could succeed. Worry does not mean certain failure. Responsibilities, registration and venue preparations still need to be completed.」题「把本例第9张宝剑九和第10张权杖四放在一起，哪种解释更合适？/ Read this example’s Nine of Swords in 9 alongside the Four of Wands in 10. Which interpretation fits?」A「宝剑九的担忧比权杖四更强，因此结局仍应按担忧来判断。 / The Nine of Swords’ worry outweighs the Four of Wands, so the outcome should follow the worry.」→「请回到画面里的具体细节：这把担心的事和可能的结果分开，也保留了前面讲过的准备条件。 / Return to the specific details in the picture: This separates fear from the possible outcome and keeps the preparation conditions already explained.」；B「发起人有担忧，但把准备工作做好，活动仍有机会顺利完成 / The organiser is worried, but the event could still succeed if preparations are completed」→「这把担心的事和可能的结果分开，也保留了前面讲过的准备条件。/ This separates fear from the possible outcome and keeps the preparation conditions already explained.」答案 B；T2、T4。
- **A06-R2 教学**「太阳在目标位，说明想把活动办得开心、有趣，但没有说现在最该做宣传。目前分工还没定，权杖五也提醒大家做法不一致。先按星币骑士的提示一步步准备，再按教皇的提示问清场地规则。多一些热情，不能代替这些工作。/ The Sun in the goal position describes the desired experience; it does not by itself make promotion the immediate priority. First check the current obstacle: Five of Wands fits unclear roles; Knight of Pentacles supports execution and Hierophant rules. More enthusiasm does not assign owners or confirm venue requirements.」题「新例：同一活动已收集到足够创意，但登记负责人和场地使用条件仍不明确。保留本例牌位，下一次筹备会先做什么？/ New example: the same event has enough ideas, but the registration owner and venue conditions remain unclear. With the same positions, what should the next preparation meeting do first?」A「确定登记负责人，确认场地条件，并约定跟进日期 / Assign a registration owner, confirm venue conditions and set a follow-up date」→「先分清谁登记、场地怎样用、何时跟进，正是在解决第 2、6、8 位提醒的事，也有助于把原定活动办好。/ It addresses coordination in 2, execution in 6 and rules in 8 while preserving the event's goal.」；B「继续征集更多创意，把责任与规则等到宣传后再定 / Collect more ideas and defer roles and rules until after promotion」→「已有创意不是缺口；这延后了牌位与背景共同指出的准备问题。/ Ideas are not the missing piece; this postpones the preparation gap identified by both positions and context.」答案 A；T2–T4，回应 Q2 的愿景替代执行优先级错误。

**A06-V1**「位置2的牌横放，就必须改记逆位吗？/ Does a horizontal card in position 2 have to be marked reversed?」A「横放时先按逆位解释，再结合第二张牌修正。 / Read the crossing card as reversed first, then adjust it using the second card.」→「交叉摆放表示牌阵位置，正逆位按抽取方向另行记录；两者不要混在一起。 / The crossing layout marks a spread position, while orientation is recorded from the draw direction; keep the two separate.」；B「不必，交叉摆法与抽取方向分开记录 / No; crossing placement and drawn orientation are recorded separately」→「遵守本课采用版本的展示约定。/ It follows this lesson's layout convention.」答案 B；T1；下次十字案例先验位置规则，非背诵速度测试。

**完成**「你已练习把十张牌一起读：回答正在问的事，说清更可能怎样发展、为什么这样判断，以及还要先做好什么。之后可以回到新案例继续练，不必每次使用十张。/ You have practised reducing a complex spread to the issue, tendency, evidence and conditions. Continue with new cases; ten cards are not required every time.」完成页提供“换一个案例 / Another case”和“回到课程 / Back to lessons”；无自评分、日记或长文必填。

### 20 课与 Word 的修订追踪 / Lesson-to-book revision notes

1. B01–B08、I01–I06、A01–A06 分别与 Word 的同序初、中、高课程一一对应；没有新增冒称原教材的第21课。
2. 删除原统一“三个词”的学习要求及相关原文复述题；B06/I01 先教完整主题，再解释若干可用提示词。Word 保留原文件，主文档记录为需后续修订的基线差异。
3. 原心中作答后自行评级、感悟填写、闭卷自评分改为有标准的低输入练习及逐项反馈。短暂先想再继续只是阅读节奏，不记录自评。
4. B04 不要求初学者同时比较尚未完整学习的权杖四／宝剑四；数字边界仍保留。B07 两张分别讲解和验证，不作 PK。
5. I06 保留 Word 的原创“现状—建议—趋势”教学组合，明确非传统唯一标准；A02/A03 使用有来源的“现状—阻碍—建议”。二者的位置语义不得混用。
6. A04 为展示整组逆位补充原创三牌案例：p11正、p08逆、p12正。原 Word 的逆位选择原则未被改写为固定反义。
7. A05 保留原 Word 的内部发展项目虚构案例与五牌版本；A06 保留社区交换活动与十位定义。未复制任何用户私人占卜案例。
8. 分镜时长是可调的教学设计起点，不宣称已经经过手机试学；所有动效制作与产品实现尚未进行。


### 逐课补学路由核查 / Per-lesson remediation mapping audit

此表用于作者与实现核对，不显示为学习步骤。Q1 错误首先进入同课 R1，Q2 错误首先进入 R2；一次补学仍错时按公共上限规则再次帮助，不得拿不相关题答对替代原知识点的证据。以下逐对核查的是“原错误解释—补讲目标—新情境检验”的一致性，非仅按标题相似。

| 课程 | Q1→R1 同一误解 | Q2→R2 同一误解 |
|---|---|---|
| B01 | 宫廷角色误当数字 | 56 中已含16，重复计数 |
| B02 | 抽后改变位置任务 | 将可选切牌变成必做次数 |
| B03 | 资源角度与情感角度混淆 | 花色误当唯一生活领域 |
| B04 | 数字公式代替单牌 | 为口诀强行统一，无法返回具体含义 |
| B05 | 侍从学习与国王统筹混淆 | 王后角色固定为女性 |
| B06 | 无检查重复误当技能改进 | 图像事实误当未验证结果 |
| B07 | 一方期待误作双向回应 | 温和误作无条件退让 |
| B08 | 建议误作他人结果保证 | 忽略对方意愿、强求同意 |
| I01 | 同义理解误判为必须逐字背词 | 购买设备替代实际技能练习 |
| I02 | 共享情感满足误作个人财富 | 元素数字推算确定事件日期 |
| I03 | 表达邀请误作长期承诺 | 行动或氛围问题误作性别身份 |
| I04 | 否认题目已提供的练习投入 | 无背景仍确定逆位具体变化 |
| I05 | 下一步建议误作过去描述 | 障碍位自动反义，缺少背景支持 |
| I06 | 愿景自动完成，遗漏实践建议 | 趋势删去行动条件变成保证 |
| A01 | 澄清问题时替换原目标 | 抽后给喜欢的方案分配路线 |
| A02 | 协调建议误作成功事实 | 解释假设误作秘密事件证据 |
| A03 | 否定学习现状、丢失三位主线 | 抽取顺序误作预设牌位 |
| A04 | 大量修改误作从未付出 | 骑士行动方式误作男性帮助者 |
| A05 | 二择一分支编号混用 | 目标条件下的路径比较误作花色排名 |
| A06 | 担忧位置误作结果事实 | 愿景与热情替代当前协调执行卡点 |


<a id="card-scripts"></a>
## 8. 78张牌脚本索引

20课教方法，这78个单元教具体牌。所有情境为原创虚构；首次只走正位，后续逆位与回访分开进入。下面链接到逐牌正文，Word六字段另存于[基线附录](#baseline-atlas)。

| 大阿尔卡纳 | 权杖 | 圣杯 | 宝剑 | 星币 |
|---|---|---|---|---|
| [m00 愚人](#card-m00) | [w01 权杖王牌](#card-w01) | [c01 圣杯王牌](#card-c01) | [s01 宝剑王牌](#card-s01) | [p01 星币王牌](#card-p01) |
| [m01 魔术师](#card-m01) | [w02 权杖二](#card-w02) | [c02 圣杯二](#card-c02) | [s02 宝剑二](#card-s02) | [p02 星币二](#card-p02) |
| [m02 女祭司](#card-m02) | [w03 权杖三](#card-w03) | [c03 圣杯三](#card-c03) | [s03 宝剑三](#card-s03) | [p03 星币三](#card-p03) |
| [m03 皇后](#card-m03) | [w04 权杖四](#card-w04) | [c04 圣杯四](#card-c04) | [s04 宝剑四](#card-s04) | [p04 星币四](#card-p04) |
| [m04 皇帝](#card-m04) | [w05 权杖五](#card-w05) | [c05 圣杯五](#card-c05) | [s05 宝剑五](#card-s05) | [p05 星币五](#card-p05) |
| [m05 教皇](#card-m05) | [w06 权杖六](#card-w06) | [c06 圣杯六](#card-c06) | [s06 宝剑六](#card-s06) | [p06 星币六](#card-p06) |
| [m06 恋人](#card-m06) | [w07 权杖七](#card-w07) | [c07 圣杯七](#card-c07) | [s07 宝剑七](#card-s07) | [p07 星币七](#card-p07) |
| [m07 战车](#card-m07) | [w08 权杖八](#card-w08) | [c08 圣杯八](#card-c08) | [s08 宝剑八](#card-s08) | [p08 星币八](#card-p08) |
| [m08 力量](#card-m08) | [w09 权杖九](#card-w09) | [c09 圣杯九](#card-c09) | [s09 宝剑九](#card-s09) | [p09 星币九](#card-p09) |
| [m09 隐士](#card-m09) | [w10 权杖十](#card-w10) | [c10 圣杯十](#card-c10) | [s10 宝剑十](#card-s10) | [p10 星币十](#card-p10) |
| [m10 命运之轮](#card-m10) | [w11 权杖侍从](#card-w11) | [c11 圣杯侍从](#card-c11) | [s11 宝剑侍从](#card-s11) | [p11 星币侍从](#card-p11) |
| [m11 正义](#card-m11) | [w12 权杖骑士](#card-w12) | [c12 圣杯骑士](#card-c12) | [s12 宝剑骑士](#card-s12) | [p12 星币骑士](#card-p12) |
| [m12 倒吊人](#card-m12) | [w13 权杖王后](#card-w13) | [c13 圣杯王后](#card-c13) | [s13 宝剑王后](#card-s13) | [p13 星币王后](#card-p13) |
| [m13 死神](#card-m13) | [w14 权杖国王](#card-w14) | [c14 圣杯国王](#card-c14) | [s14 宝剑国王](#card-s14) | [p14 星币国王](#card-p14) |
| [m14 节制](#card-m14) | — | — | — | — |
| [m15 恶魔](#card-m15) | — | — | — | — |
| [m16 高塔](#card-m16) | — | — | — | — |
| [m17 星星](#card-m17) | — | — | — | — |
| [m18 月亮](#card-m18) | — | — | — | — |
| [m19 太阳](#card-m19) | — | — | — | — |
| [m20 审判](#card-m20) | — | — | — | — |
| [m21 世界](#card-m21) | — | — | — | — |

## 大阿尔卡纳逐牌脚本 / Major Arcana scripts

以下每卡首次学习使用 T1、T2、Q1、Q2；完成逆位基础 I04 后才进入 T3、Q3。R1/R2/R3 分别对应核心、应用、逆位误解，按答题表现调用而非全部必做。V1 是延后变式。各项只有本课明确背景下的答案，不是对牌义穷尽的裁决。所有案例为原创虚构。

<a id="card-m00"></a>
### m00｜愚人 / The Fool

**目标、基础与范围**：理解 愚人 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m00.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_00_Fool.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m00-T1 完整含义 / Meaning**

愚人代表新的开始，以及面对未知时愿意尝试的态度。不必一开始就投入全部，也不意味着什么准备都不用做。 / The Fool represents new beginnings and a willingness to try something unfamiliar. Beginning requires neither committing everything nor abandoning preparation.

**画面联系 / Picture connection**

轻装的人靠近崖边，旁边有狗。轻装与前行帮助记住开始，崖边提醒未知；不能由图断言他会坠落。 / A lightly packed traveler approaches an edge with a dog nearby. Travel suggests a beginning; the edge reminds us of uncertainty, not an inevitable fall.

**关键词整理 / Recall labels**

关键词：开始、开放、探索。愚人的编号是0，是认识大牌的起点。 / Remember: beginnings, openness, exploration. The Fool is numbered 0, a starting point for learning the majors.

**m00-T2 正位应用 / Upright application**

建议位：想学陶艺但没接触过，可以先试一节入门课，再决定长期投入。这里支持开始探索，不要求一次买齐昂贵设备。 / Advice: try an introductory pottery class before committing long term. This supports exploration, not buying all the equipment at once.

**m00-T3 后续逆位深化 / Later reversal study**

逆位示例：已打算独自进山，却没有路线与装备准备。这里需要先查清路线、备好装备，不能把逆位一概理解成以后都不能出发。 / Reversed example: a solo hike is planned without a route or equipment. Research the route and prepare the gear first; reversal does not mean never setting out again.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m00-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

行囊→崖边；完整牌图起，焦点依次停留，终态并列“尝试/准备”。 / Pack, then edge; retain the full card and end with “explore / prepare”.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m00-q1"></a>
**m00-Q1**（已教依据：T1）

本课说愚人具有“开放”的态度，这是什么意思？ / What does the Fool’s openness mean in this lesson?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 愿意尝试未知 / Willingness to explore | 答对了 / Correct. 愿意接触没做过的事，正是本课所说的开始与探索。 / Being willing to try something unfamiliar expresses the beginning and exploration taught here. |
| B | 不必考虑条件 / Ignoring conditions | 这项不对 / Not correct. 愿意开始尝试，也要确认自己准备得够不够；开放不等于什么都不考虑。 / Willingness to begin still requires checking preparation; openness does not mean ignoring every consideration. |

答案：A。内容ID `m00-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m00-q2"></a>
**m00-Q2**（已教依据：T2）

第一次学陶艺怎样开始？ / How could a pottery beginner start?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先买齐一整套设备，再决定自己是否喜欢陶艺。 / Buy a full set of equipment first, then decide whether you enjoy pottery. | 这项不对 / Not correct. 第一次体验前就买齐设备，投入已经很大，却还不知道自己是否喜欢陶艺。 / Buying a full set before a first trial makes a large commitment before you know whether pottery suits you. |
| B | 先体验一节课 / Try one class | 答对了 / Correct. 上一节课就已经开始探索，也给自己留下了解后再决定的机会。 / One class starts the exploration while leaving room to decide after experiencing it. |

答案：B。内容ID `m00-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m00-q3"></a>
**m00-Q3**（已教依据：T3）

在没有准备路线和装备就打算进山的例子里，愚人逆位提醒先做什么？ / In the unprepared hiking example, what does the reversed Fool suggest addressing first?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 补路线和装备 / Prepare route and equipment | 答对了 / Correct. 例子已经说明缺少路线与装备，先补好这两项准备才回应了问题。 / The example identifies a missing route and equipment; preparing them addresses that problem. |
| B | 先把计划放一段时间，等自己不再担心风险。 / Set the plan aside until the risks no longer feel worrying. | 这项不对 / Not correct. 先别按这个做法继续；例子已经说明缺少路线与装备，先补好这两项准备才回应了问题。 / Do not continue with this approach yet; The example identifies a missing route and equipment; preparing them addresses that problem. |

答案：A。内容ID `m00-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m00-R1 替代讲解 / Alternative explanation**

开始可以很小。先试一次和把全部资源押上，是两种不同规模的行动。 / A beginning can be small. Trying once differs from committing everything.

<a id="m00-r1"></a>
**m00-R1**（已教依据：T1 与 R1）

只试一天新爱好算开始吗？ / Is trying a hobby for one day a beginning?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不算，至少连续做几次才说明真的开始。 / Not yet; it takes several sessions before it counts as a real beginning. | 这项不对 / Not correct. 这个结论比题目给出的信息多走了一步。试一天已经从没接触过走到亲自尝试，投入虽小，也算开始。 / This conclusion goes beyond the information provided. One day moves you from unfamiliarity to experience; a small attempt still counts as a beginning. |
| B | 算，已经接触未知 / Yes, it explores something new | 答对了 / Correct. 试一天已经从没接触过走到亲自尝试，投入虽小，也算开始。 / One day moves you from unfamiliarity to experience; a small attempt still counts as a beginning. |

答案：B。内容ID `m00-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m00-R2 替代讲解 / Alternative explanation**

还不了解陶艺时，先上一节体验课，看看自己是否喜欢，再考虑买工具。 / If pottery is unfamiliar, try one class to see whether you enjoy it before buying tools.

<a id="m00-r2"></a>
**m00-R2**（已教依据：T2 与 R2）

先体验陶艺，再决定是否买工具，与愚人的开放态度矛盾吗？ / Does trying pottery before deciding whether to buy tools conflict with the Fool’s openness?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不矛盾，先探索再决定 / No, explore before deciding | 答对了 / Correct. 先体验可以帮助你了解陶艺，再决定买什么，既愿意尝试，也保留判断。 / A trial helps you understand pottery before choosing equipment, combining openness with judgment. |
| B | 有些矛盾，开放尝试应该在开始前准备好较完整的工具。 / It is somewhat inconsistent because an open trial should begin with a fairly complete set of tools. | 这项不对 / Not correct. 这个判断忽略了题目给出的条件。先体验可以帮助你了解陶艺，再决定买什么，既愿意尝试，也保留判断。 / This judgment overlooks a condition given in the question. A trial helps you understand pottery before choosing equipment, combining openness with judgment. |

答案：A。内容ID `m00-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m00-R3 替代讲解 / Alternative explanation**

这里担心的是没有路线和装备的准备。查清路线、备好装备，是在处理已经知道的风险；逆位不等于一定出事。 / The concern is the missing route and equipment. Preparing both addresses known risks; a reversed card does not make disaster inevitable.

<a id="m00-r3"></a>
**m00-R3**（已教依据：T3 与 R3）

补齐装备后还必定出事吗？ / Is trouble inevitable after preparation?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 是，逆位已经决定 / Yes, the reversal decides it | 这项不对 / Not correct. 逆位指出本例的准备不足，不能据此断定之后必定发生事故。 / The reversal highlights poor preparation here; it cannot establish a later accident. |
| B | 无法由这张牌断定 / The card cannot establish that | 答对了 / Correct. 准备可以处理已知风险，但这张牌本身既不能保证出事，也不能保证完全安全。 / Preparation addresses known risks, but the card itself guarantees neither trouble nor complete safety. |

答案：B。内容ID `m00-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m00-v1"></a>
**m00-V1**（已教依据：T1 与 T2）

你想试试写作。哪种开始方式符合本课讲的愚人？ / You want to try writing. Which way of starting fits the Fool as taught here?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先写一个短篇 / Write a short piece first | 答对了 / Correct. 写一个短篇能让你亲自接触写作，符合从小尝试开始探索的含义。 / A short piece gives direct experience of writing, fitting exploration through a small beginning. |
| B | 先系统学习写作方法，准备好完整大纲再写第一篇。 / Study writing methods systematically and prepare a full outline before writing the first piece. | 这项不对 / Not correct. 把方法和大纲全部准备好才动笔，会把探索一再推迟。愚人在这里更像先写一个短篇，亲自试试。 / Waiting to master methods and finish a full outline postpones exploration. Here the Fool is closer to writing one short piece and learning through the attempt. |

答案：A。内容ID `m00-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“开始可以很小。先试一次和把全部资源押上，是两种不同规模的行动。 / A beginning can be small. Trying once differs from committing everything.”；Q2 使用“还不了解陶艺时，先上一节体验课，看看自己是否喜欢，再考虑买工具。 / If pottery is unfamiliar, try one class to see whether you enjoy it before buying tools.”；Q3 使用“这里担心的是没有路线和装备的准备。查清路线、备好装备，是在处理已经知道的风险；逆位不等于一定出事。 / The concern is the missing route and equipment. Preparing both addresses known risks; a reversed card does not make disaster inevitable.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“愚人代表新的开始，以及面对未知时愿意尝试的态度。不必一开始就投入全部，也不意味着什么准备都不用做。 / The Fool represents new beginnings and a willingness to try something unfamiliar. Beginning requires neither committing everything nor abandoning preparation.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m01"></a>
### m01｜魔术师 / The Magician

**目标、基础与范围**：理解 魔术师 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m01.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_01_Magician.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m01-T1 完整含义 / Meaning**

魔术师代表把想法变成行动：先知道自己想完成什么，再把已有的能力和工具用起来。仅仅拥有工具或表现得自信，还不等于已经做成了事情。 / The Magician represents turning an intention into action: know what you want to achieve, then use available abilities and tools. Owning tools or appearing confident is not the same as producing a result.

**画面联系 / Picture connection**

桌上的四类工具，以及一手朝上、一手朝下的姿势，可以帮助记住“把已有资源用来实现目标”。这些手势不是超自然能力的证明。 / The four kinds of tools and the raised and lowered hands help recall using available resources toward a goal. The gestures do not prove supernatural power.

**关键词整理 / Recall labels**

关键词：目标、能力与工具、主动行动。这里的I是魔术师的大牌编号，不表示它与四种花色的首牌含义相同。 / Remember: goals, abilities and tools, initiative. I is the Magician’s major-card number; it does not give the four aces the same meaning.

**m01-T2 正位应用 / Upright application**

工作建议：已经有资料、剪辑软件与时间，先明确短片主题，再制作一个片段，而非继续囤软件。 / Work advice: with research, editing software and time available, choose a theme and produce a clip rather than collecting more software.

**m01-T3 后续逆位深化 / Later reversal study**

逆位示例：工具充足，却一直在讲计划，还没有实际动手。这里要留意的是工具有没有用起来，不能只凭这一点就断定当事人在骗人。 / Reversed example: tools are available, but the plan is only being discussed. Check whether they are actually being used; this alone does not establish deception.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m01-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

桌面器具→手势；终态显示“目标＋已有条件＋行动”。 / Tools, then gesture; end with “goal + resources + action”.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m01-q1"></a>
**m01-Q1**（已教依据：T1）

哪种做法体现了魔术师的核心含义？ / Which action expresses the Magician’s core meaning?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先把现有工具分类整理清楚，等方案完整后再开始。 / Sort the available tools clearly and wait for a complete plan before starting. | 这项不对 / Not correct. 先别按这个做法继续；先知道想完成什么，再使用现有工具和能力，才把目标变成了行动。 / Do not continue with this approach yet; A goal becomes action when available tools and abilities are used toward it. |
| B | 把现有能力和工具用来实现目标 / Use available abilities and tools toward a goal | 答对了 / Correct. 先知道想完成什么，再使用现有工具和能力，才把目标变成了行动。 / A goal becomes action when available tools and abilities are used toward it. |

答案：B。内容ID `m01-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m01-q2"></a>
**m01-Q2**（已教依据：T2）

资料、剪辑软件和时间都已具备。按照刚才的示范，下一步做什么？ / With material, editing software and time available, what comes next in the example?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 制作一个主题片段 / Make a focused clip | 答对了 / Correct. 做出一个围绕主题的片段，就把已有资料和软件实际用起来了。 / Making a focused clip puts the available material and software to use. |
| B | 再买重复的软件 / Buy duplicate software | 这项不对 / Not correct. 软件已经够用，再买重复的软件仍然没有开始制作短片。 / The software is already sufficient; buying duplicates still does not start the film. |

答案：A。内容ID `m01-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m01-q3"></a>
**m01-Q3**（已教依据：T3）

工具充足，却一直只讲计划。在这个逆位例子中，应该先检查什么？ / In the reversal example with enough tools but only talk, what should be checked first?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 当事人是否天生骗子 / Whether the person is inherently deceitful | 这项不对 / Not correct. 没有动手不等于天生爱骗人；这个例子没有提供判断人格的依据。 / Not starting work does not establish deceitful character; the example supplies no such evidence. |
| B | 是否已经实际执行 / Whether action has begun | 答对了 / Correct. 例子的问题是工具都有了却未动手，因此先看是否真的开始执行。 / Tools are available but unused, so the relevant check is whether work has actually begun. |

答案：B。内容ID `m01-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m01-R1 替代讲解 / Alternative explanation**

有工具是条件，用工具完成一步才是行动。 / Having tools is a condition; using them to complete a step is action.

<a id="m01-r1"></a>
**m01-R1**（已教依据：T1 与 R1）

拥有画笔等于画了画吗？ / Does owning brushes mean a picture is painted?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不等于，要实际使用 / No, they must be used | 答对了 / Correct. 画笔只是能用的工具，拿起它作画才算开始做这件事。 / A brush is an available tool; using it to paint begins the work. |
| B | 等于，资源就是成果 / Yes, resources are results | 这项不对 / Not correct. 拥有画笔还没有产生画作，不能把工具本身当成成果。 / Owning brushes has not produced a painting; tools are not the finished result. |

答案：A。内容ID `m01-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m01-R2 替代讲解 / Alternative explanation**

先想清楚这次要做成什么，再挑适合的工具。工具用得多，不等于离目标更近。 / Decide what you want to make, then select suitable tools. Using more tools does not necessarily bring the goal closer.

<a id="m01-r2"></a>
**m01-R2**（已教依据：T2 与 R2）

目标是短片，必须用全部工具吗？ / Must the clip use every tool?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 更适合尽量多用现有工具，以免遗漏可用资源。 / It is better to use as many available tools as possible so no resource is overlooked. | 这项不对 / Not correct. 这个结论比题目给出的信息多走了一步。按短片需要选工具，才能让现有资源帮助你完成目标。 / This conclusion goes beyond the information provided. Selecting tools for the film lets available resources serve the goal. |
| B | 不必，选择适用的 / No, use what serves it | 答对了 / Correct. 按短片需要选工具，才能让现有资源帮助你完成目标。 / Selecting tools for the film lets available resources serve the goal. |

答案：B。内容ID `m01-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m01-R3 替代讲解 / Alternative explanation**

把计划讲得精彩，不等于已经做出了成品。还要看有没有实际动手、做出了什么。 / Presenting a plan well is not the same as producing the work. Check whether work has begun and what has actually been made.

<a id="m01-r3"></a>
**m01-R3**（已教依据：T3 与 R3）

把计划演示得很精彩，能证明作品已经做完了吗？ / Does an impressive presentation prove that the work is finished?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不能，还需成果证据 / No, inspect the actual output | 答对了 / Correct. 演示告诉我们计划怎样做；实际做出的作品，才能说明做到了哪一步。 / A presentation describes the plan; actual work shows what has been completed. |
| B | 能，表达就是完成 / Yes, speaking is completion | 这项不对 / Not correct. 讲出计划和做出作品是两件事，表达精彩不能替代制作。 / Presenting a plan and producing the work are different; eloquence does not replace making. |

答案：A。内容ID `m01-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m01-v1"></a>
**m01-V1**（已教依据：T1 与 T2）

已有材料想做手工，先做什么？ / With craft materials ready, what fits?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 继续收集更合适的材料，等选择更齐全后再做样品。 / Keep collecting better materials and make the sample after the choices are broader. | 这项不对 / Not correct. 继续收集材料没有使用手边已经具备的资源。魔术师在这里要先定目标、做出样品，让材料变成行动。 / Collecting more materials does not use the resources already at hand. Here the Magician calls for choosing a goal and making a sample. |
| B | 选目标并动手做样品 / Choose a goal and make a sample | 答对了 / Correct. 确定要做什么并做个样品，把已有材料变成了实际行动。 / Choosing what to make and building a sample turns available materials into action. |

答案：B。内容ID `m01-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“有工具是条件，用工具完成一步才是行动。 / Having tools is a condition; using them to complete a step is action.”；Q2 使用“先想清楚这次要做成什么，再挑适合的工具。工具用得多，不等于离目标更近。 / Decide what you want to make, then select suitable tools. Using more tools does not necessarily bring the goal closer.”；Q3 使用“把计划讲得精彩，不等于已经做出了成品。还要看有没有实际动手、做出了什么。 / Presenting a plan well is not the same as producing the work. Check whether work has begun and what has actually been made.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“魔术师代表把想法变成行动：先知道自己想完成什么，再把已有的能力和工具用起来。仅仅拥有工具或表现得自信，还不等于已经做成了事情。 / The Magician represents turning an intention into action: know what you want to achieve, then use available abilities and tools. Owning tools or appearing confident is not the same as producing a result.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m02"></a>
### m02｜女祭司 / The High Priestess

**目标、基础与范围**：理解 女祭司 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m02.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_02_High_Priestess.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m02-T1 完整含义 / Meaning**

女祭司提醒我们先留意自己的感受，还不清楚的事，先别急着下结论。可以安静观察，也可以继续了解；不必假定自己已经知道别人的秘密，更不需要一直等着不动。 / The High Priestess invites attention to inner feelings and patience with what is still unclear. Observe or seek understanding before concluding; do not assume secret knowledge or wait indefinitely.

**画面联系 / Picture connection**

人物静坐，两柱之间有帷幕，卷轴部分被衣服遮住。这些被遮住的细节，可以帮助记住“有些信息还没看清”。 / A seated figure, a veil between pillars and a partly covered scroll support remembering information not fully revealed.

**关键词整理 / Recall labels**

关键词：观察、直觉、还不清楚的信息。女祭司的编号是II，不能仅凭数字2就解释成两个人恋爱。 / Remember: observation, intuition, information still unclear. The High Priestess is numbered II; the number two alone does not mean romance.

**m02-T2 正位应用 / Upright application**

收到一句意思不清的回复，心里有些不安。可以先想想是哪句话让你不舒服，再问清对方的意思；不要仅凭不安就认定对方在隐瞒。 / An unclear reply leaves you uneasy. Notice which words bothered you, then ask what the other person meant. Unease alone does not establish that they are hiding something.

**m02-T3 后续逆位深化 / Later reversal study**

逆位示例：明明觉得不舒服，却没有理会自己的感受，反而凭传言下结论。先留意这份不安，再查证消息；感到不安还不能证明传言是真的。 / Reversed example: someone ignores personal unease but accepts a rumor. Notice the feeling and check the report; unease does not prove the rumor true.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m02-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

卷轴遮挡→帷幕；终态保留“有些事还不清楚”。 / Covered scroll, then veil; keep “not yet clear” visible.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m02-q1"></a>
**m02-Q1**（已教依据：T1）

信息还不清楚时，女祭司提醒我们怎样做？ / What does the High Priestess suggest doing when information is still unclear?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先观察，了解更多后再下结论 / Observe and learn more before concluding | 答对了 / Correct. 信息还不清楚时，先了解再判断，才不会把猜测当成已经知道的事。 / Learning before judging unclear information avoids treating guesses as known facts. |
| B | 证明自己知道秘密 / Prove secret knowledge | 这项不对 / Not correct. 看到某些内容被遮住，只能知道没有看清，不能因此知道藏着什么。 / Seeing concealment shows that something is unclear, not what it contains. |

答案：A。内容ID `m02-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m02-q2"></a>
**m02-Q2**（已教依据：T2）

收到含糊的回复后感到不安，怎样运用女祭司的含义？ / How can you apply the High Priestess when an unclear reply makes you uneasy?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 因为自己感到不安，就认定对方在撒谎 / Conclude that the other person is lying because you feel uneasy | 这项不对 / Not correct. 不安说明你有这种感受，还不能证明对方撒谎或有所隐瞒。 / Unease establishes your feeling, not that the other person is lying or hiding something. |
| B | 先留意自己的不安，再问清对方的意思 / Notice your unease, then ask what the other person means | 答对了 / Correct. 先弄清自己为什么不舒服，再问清对方的意思。这样既没有忽略自己的感受，也没有把猜测当成事实。 / Notice what bothered you, then clarify what the other person meant. This acknowledges your feelings without treating a guess as fact. |

答案：B。内容ID `m02-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m02-q3"></a>
**m02-Q3**（已教依据：T3）

在忽视不适、却凭传言下结论的例子里，女祭司逆位提醒什么？ / What does the reversed High Priestess highlight when unease is ignored but rumor is accepted?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 留意自己的不安并查证传言，不把感受当成事实 / Notice your unease and verify the rumor instead of treating a feeling as fact | 答对了 / Correct. 例子漏掉了对自身感受的留意，也没有查证传言；这两步都需要补上。 / The example neglects inner feelings and verification of rumor; both need attention. |
| B | 相信传言就是真相 / Treat the rumor as truth | 这项不对 / Not correct. 传言还没有核实，不能因为听到了它就当成事实。 / An unverified rumor does not become fact simply because it has been heard. |

答案：A。内容ID `m02-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m02-R1 替代讲解 / Alternative explanation**

感到不安是真实的体验，但其原因仍需核实。 / Unease is a real experience; its cause still needs checking.

<a id="m02-r1"></a>
**m02-R1**（已教依据：T1 与 R1）

感到不安，能证明对方心里一定在想什么吗？ / Does feeling uneasy establish what another person must be thinking?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 能，直觉不会有错 / Yes, intuition is infallible | 这项不对 / Not correct. 心里有一种感觉，不等于已经查明对方为什么这样做。 / Having an inner feeling does not establish why another person acted that way. |
| B | 不能，需要核实 / No, check the cause | 答对了 / Correct. 你确实感到不安，但为什么不安、对方在想什么，还需要分别了解。 / Your unease is real, but its cause and the other person’s motives still need checking. |

答案：B。内容ID `m02-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m02-R2 替代讲解 / Alternative explanation**

还没想清楚时可以先不判断，同时问一问对方究竟是什么意思。 / You can withhold judgment while asking what the other person means.

<a id="m02-r2"></a>
**m02-R2**（已教依据：T2 与 R2）

暂时不下结论时，可以主动询问对方吗？ / Can you ask the other person while withholding judgment?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 可以，询问帮助澄清 / Yes, questions clarify | 答对了 / Correct. 询问可以补充尚不清楚的信息，暂时不判断不妨碍主动了解。 / Questions can clarify missing information; withholding judgment does not prevent inquiry. |
| B | 不太适合；保持观察比主动询问更能保护还没成形的直觉。 / It is not ideal; continued observation protects an emerging intuition better than asking directly. | 这项不对 / Not correct. 先核对眼前例子的条件：询问可以补充尚不清楚的信息，暂时不判断不妨碍主动了解。 / Check the conditions in this example first: Questions can clarify missing information; withholding judgment does not prevent inquiry. |

答案：A。内容ID `m02-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m02-R3 替代讲解 / Alternative explanation**

抽到逆位也不能证明传言是真的。先留意自己的不安，再核对传言的来源和事实。 / A reversed card cannot prove a rumor true. Notice your unease, then check the source and facts.

<a id="m02-r3"></a>
**m02-R3**（已教依据：T3 与 R3）

逆位是否让传言可靠？ / Does reversal make a rumor reliable?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 会，隐藏信息被证实 / Yes, hidden facts are confirmed | 这项不对 / Not correct. 逆位没有提供新的事实，不能让没有查证的消息变成可靠消息。 / A reversal supplies no new facts and cannot make unchecked news reliable. |
| B | 不会，还需核对 / No, verification remains needed | 答对了 / Correct. 传言是否可靠仍要看来源和事实，不能由牌的方向决定。 / Reliability depends on sources and facts, not on the card’s orientation. |

答案：B。内容ID `m02-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m02-v1"></a>
**m02-V1**（已教依据：T1 与 T2）

审阅资料时，有些信息还不完整。哪种做法符合本课含义？ / While reviewing incomplete material, which action fits this lesson?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 标出疑问后求证 / Identify questions and verify | 答对了 / Correct. 把不清楚的地方标出来再求证，正是先承认不知道，再继续了解。 / Marking uncertainties and checking them acknowledges what is unknown before learning more. |
| B | 用猜测填满空白 / Fill gaps with guesses | 这项不对 / Not correct. 猜测填满了空白，却没有增加事实，不能代替求证。 / Filling gaps with guesses adds no facts and cannot replace verification. |

答案：A。内容ID `m02-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“感到不安是真实的体验，但其原因仍需核实。 / Unease is a real experience; its cause still needs checking.”；Q2 使用“还没想清楚时可以先不判断，同时问一问对方究竟是什么意思。 / You can withhold judgment while asking what the other person means.”；Q3 使用“抽到逆位也不能证明传言是真的。先留意自己的不安，再核对传言的来源和事实。 / A reversed card cannot prove a rumor true. Notice your unease, then check the source and facts.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“女祭司提醒我们先留意自己的感受，还不清楚的事，先别急着下结论。可以安静观察，也可以继续了解；不必假定自己已经知道别人的秘密，更不需要一直等着不动。 / The High Priestess invites attention to inner feelings and patience with what is still unclear. Observe or seek understanding before concluding; do not assume secret knowledge or wait indefinitely.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m03"></a>
### m03｜皇后 / The Empress

**目标、基础与范围**：理解 皇后 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m03.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_03_Empress.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m03-T1 完整含义 / Meaning**

皇后代表照顾、创造，以及事物慢慢成长的丰盛。成长需要时间、材料和照顾，照顾者也需要休息，不是要求一个人无止境地付出。 / The Empress represents care, creativity and the abundance of gradual growth. Growth needs time, materials and care, including rest for the caregiver; it does not demand endless giving.

**画面联系 / Picture connection**

麦田、树木与舒适坐席帮助记住适合生长的环境，不据此判断任何人的怀孕或身体状况。 / Grain, trees and a comfortable seat suggest a nourishing environment, not anyone’s pregnancy or health.

**关键词整理 / Recall labels**

关键词：照顾、创造、成长、丰盛。皇后的编号是III，理解含义时仍要看这张牌本身。 / Remember: care, creativity, growth, abundance. The Empress is numbered III; its meaning still belongs to the card itself.

**m03-T2 正位应用 / Upright application**

创作建议：给插画安排固定时间、合适材料与休息，让作品逐渐成形；不是只催自己马上交出成果。 / Creative advice: provide time, materials and rest for an illustration to develop, rather than demanding an instant result.

**m03-T3 后续逆位深化 / Later reversal study**

逆位示例：一直照顾团队却忽略自身休息，创造力下降。这里需要留意自己是否只顾付出、没有休息，并留出时间恢复精力。 / Reversed example: caring for a team without resting has drained creativity. Notice giving without recovery and make time to restore energy.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m03-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

麦田→树木→坐席；终态显示“生长需要条件”。 / Grain, trees, seat; end with “growth needs support”.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m03-q1"></a>
**m03-Q1**（已教依据：T1）

滋养主要指什么？ / What does nourishment mean here?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 替对方安排好节奏，尽快把成果催出来。 / Set the pace for the other person and push the result forward quickly. | 这项不对 / Not correct. 替别人定节奏并催成果是控制，不是滋养。皇后所说的滋养，是给成长留出时间、资源和照顾。 / Setting another person’s pace and pushing for results is control, not nurture. The Empress points to time, resources, and care that allow growth. |
| B | 提供成长需要的时间、资源与照顾 / Provide the time, resources and care needed for growth | 答对了 / Correct. 有时间、资源和照顾，事物才有机会逐渐发展，这就是本课的滋养。 / Time, resources and care allow gradual development, which is nurture as taught here. |

答案：B。内容ID `m03-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m03-q2"></a>
**m03-Q2**（已教依据：T2）

在插画创作的例子里，哪种做法体现了皇后的滋养？ / Which action expresses the Empress’s nurture in the illustration example?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 安排材料时间与休息 / Arrange materials, time and rest | 答对了 / Correct. 材料帮助完成作品，时间和休息让创作者能持续创作。 / Materials support the work; time and rest help the creator keep making it. |
| B | 把交稿目标拆得更细，用进度要求推动完成。 / Break the delivery target into smaller milestones and use progress requirements to drive completion. | 这项不对 / Not correct. 先别按这个做法继续；材料帮助完成作品，时间和休息让创作者能持续创作。 / Do not continue with this approach yet; Materials support the work; time and rest help the creator keep making it. |

答案：A。内容ID `m03-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m03-q3"></a>
**m03-Q3**（已教依据：T3）

在照顾团队却忽略自己休息的例子里，皇后逆位提醒关注什么？ / What does the reversed Empress highlight when someone cares for a team but neglects rest?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 暂时停止支持团队，把精力转向自己休息。 / Stop supporting the team for now and turn your attention to your own rest instead. | 这项不对 / Not correct. 停止照顾团队只是把失衡倒向另一边；皇后逆位提醒的是把照顾与休息重新放回平衡。 / Stopping care for the team only flips the imbalance; the reversed Empress asks for care and rest to be brought back into balance. |
| B | 留出休息时间，恢复精力 / Make time to rest and recover energy | 答对了 / Correct. 例子中创造力已经因缺少休息而下降，先恢复精力回应了这种失衡。 / Creativity has fallen through lack of rest; recovering energy addresses that imbalance. |

答案：B。内容ID `m03-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m03-R1 替代讲解 / Alternative explanation**

照顾不是替事物瞬间长大，而是提供持续生长的条件。 / Care provides conditions for growth; it does not force instant maturity.

<a id="m03-r1"></a>
**m03-R1**（已教依据：T1 与 R1）

花盆缺水时“滋养”是什么？ / What is nurture for a dry plant?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 提供合适水分 / Supply suitable water | 答对了 / Correct. 花缺水时，提供合适水分才能支持它生长。 / When a plant lacks water, suitable watering supports its growth. |
| B | 要求今天开花 / Demand flowers today | 这项不对 / Not correct. 要求开花并没有给花补水，不能代替实际照顾。 / Demanding flowers does not supply water or replace care. |

答案：A。内容ID `m03-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m03-R2 替代讲解 / Alternative explanation**

支持作品也包括支持创作者：休息是条件之一。 / Supporting work includes supporting its creator; rest is one condition.

<a id="m03-r2"></a>
**m03-R2**（已教依据：T2 与 R2）

创作者休息属于照顾作品吗？ / Can the creator's rest support the work?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 休息主要照顾创作者，和作品本身的成长关系不大。 / Rest mainly supports the creator and has little connection to the work’s development. | 这项不对 / Not correct. 先核对眼前例子的条件：作品由人完成，创作者休息好，才更有精力继续创作。 / Check the conditions in this example first: People make the work; rest restores the energy needed to continue. |
| B | 属于，休息能恢复创作精力 / Yes, rest restores energy for creating | 答对了 / Correct. 作品由人完成，创作者休息好，才更有精力继续创作。 / People make the work; rest restores the energy needed to continue. |

答案：B。内容ID `m03-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m03-R3 替代讲解 / Alternative explanation**

本例不是“不能再关心别人”，而是不能长期只付出不恢复。 / This example concerns unrenewed giving, not a ban on caring for others.

<a id="m03-r3"></a>
**m03-R3**（已教依据：T3 与 R3）

已经因持续付出而疲惫，还需要无休止地继续付出吗？ / When continual giving has caused exhaustion, is endless further giving needed?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不需要，先调整失衡 / No, address the imbalance | 答对了 / Correct. 已经疲惫，说明需要休息与恢复；继续只付出会延续同一个问题。 / Existing exhaustion calls for rest and recovery; unbroken giving continues the same problem. |
| B | 需要，越耗尽自己越能照顾大家 / Yes, exhausting yourself lets you care for everyone better | 这项不对 / Not correct. 把自己耗尽并没有提供持续照顾的能力，与本课支持成长的含义相反。 / Exhausting yourself does not sustain care and conflicts with supporting growth. |

答案：A。内容ID `m03-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m03-v1"></a>
**m03-V1**（已教依据：T1 与 T2）

一个新社团想慢慢发展起来，哪种做法符合皇后的滋养？ / Which action expresses nurture as a new club develops?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 用人数增长和完成指标来判断社团发展，把成员需要的支持放在后面。 / Judge the club by membership growth and completed targets, leaving members’ support needs for later. | 这项不对 / Not correct. 这项做法只看增长指标，没有及时给成员提供成长所需的资源和支持。 / This approach looks at growth metrics but does not give members the timely resources and support they need to develop. |
| B | 给成员资源与支持 / Offer resources and support | 答对了 / Correct. 给成员所需的资源和帮助，才是在建立能够逐渐发展的环境。 / Giving members resources and help creates conditions in which the club can develop. |

答案：B。内容ID `m03-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“照顾不是替事物瞬间长大，而是提供持续生长的条件。 / Care provides conditions for growth; it does not force instant maturity.”；Q2 使用“支持作品也包括支持创作者：休息是条件之一。 / Supporting work includes supporting its creator; rest is one condition.”；Q3 使用“本例不是“不能再关心别人”，而是不能长期只付出不恢复。 / This example concerns unrenewed giving, not a ban on caring for others.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“皇后代表照顾、创造，以及事物慢慢成长的丰盛。成长需要时间、材料和照顾，照顾者也需要休息，不是要求一个人无止境地付出。 / The Empress represents care, creativity and the abundance of gradual growth. Growth needs time, materials and care, including rest for the caregiver; it does not demand endless giving.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m04"></a>
### m04｜皇帝 / The Emperor

**目标、基础与范围**：理解 皇帝 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m04.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_04_Emperor.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m04-T1 完整含义 / Meaning**

皇帝代表秩序、责任和清楚的界限。谁负责什么、有哪些需要遵守的规则，安排清楚了才容易稳定；不等于所有决定都必须由一个人控制。 / The Emperor represents order, responsibility and clear limits. Stability benefits from clear duties and rules, not necessarily one person controlling every decision.

**画面联系 / Picture connection**

石座、铠甲和端正姿态可以帮助记住稳定的秩序与保护；不能用人物性别断定现实中的某位男性。 / The stone throne, armor and upright posture support structure and protection, not identification of a particular man.

**关键词整理 / Recall labels**

关键词：秩序、责任、边界。IV可帮助整理稳定主题，不证明一切规则合理。 / Recall labels: order, responsibility, boundaries. IV may organize stability, not validate every rule.

**m04-T2 正位应用 / Upright application**

工作建议：项目常漏交接，先说明谁负责交、谁负责接、什么时候交，以及怎样才算交接完成。 / Work advice: when handovers are missed, specify who hands over to whom, the deadline, and what counts as completion.

**m04-T3 后续逆位深化 / Later reversal study**

逆位示例：负责人不许按实际情况调整，流程停滞。本例强调控制与僵化，而不是所有管理都不好。 / Reversed example: a manager forbids adjustments and work stalls. Here control becomes rigidity, not a rejection of all management.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m04-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

石座→铠甲；终态“安排清楚，事情才好推进”。 / Stone throne, then armor; end with “clear arrangements support action”.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m04-q1"></a>
**m04-Q1**（已教依据：T1）

皇帝的秩序靠什么落实？ / What makes this order practical?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 明确责任与边界 / Clear responsibilities and boundaries | 答对了 / Correct. 每个人知道负责什么、有哪些界限，工作才有清楚的安排。 / Work has a clear arrangement when people know their responsibilities and limits. |
| B | 由负责人集中做决定，其他人按统一指令执行。 / Have the leader make centralized decisions while everyone else follows one set of instructions. | 这项不对 / Not correct. 这个说法混淆了题目正在考的含义。每个人知道负责什么、有哪些界限，工作才有清楚的安排。 / This statement confuses the meaning being tested. Work has a clear arrangement when people know their responsibilities and limits. |

答案：A。内容ID `m04-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m04-q2"></a>
**m04-Q2**（已教依据：T2）

项目经常漏交接，按照刚才的示范，先改进什么？ / What should change first when project handovers are often missed?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 增加一次提醒，让每个人自行留意交接。 / Add another reminder and let each person monitor the handover independently. | 这项不对 / Not correct. 这个说法混淆了题目正在考的含义。把交接双方和时间说清楚，才让每个人知道该完成哪一步。 / This statement confuses the meaning being tested. Naming both parties and the deadline tells each person what to do. |
| B | 明确谁交给谁及期限 / Specify people and deadlines | 答对了 / Correct. 把交接双方和时间说清楚，才让每个人知道该完成哪一步。 / Naming both parties and the deadline tells each person what to do. |

答案：B。内容ID `m04-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m04-q3"></a>
**m04-Q3**（已教依据：T3）

在负责人不许调整、流程因此停滞的逆位例子里，怎样调整更合适？ / In the reversal example where rigid management stalls work, what adjustment fits?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 保留边界并调整流程 / Keep boundaries, adapt procedures | 答对了 / Correct. 必要的职责仍然保留，同时按实际情况改流程，可以让事情重新推进。 / Keeping necessary duties while adapting the process lets work proceed again. |
| B | 先维持原流程，等大家适应后再考虑调整。 / Keep the existing process for now and consider adjustments after people adapt to it. | 这项不对 / Not correct. 这个做法没有解决眼前的情况。必要的职责仍然保留，同时按实际情况改流程，可以让事情重新推进。 / This action does not resolve the situation described. Keeping necessary duties while adapting the process lets work proceed again. |

答案：A。内容ID `m04-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m04-R1 替代讲解 / Alternative explanation**

责任清楚才能协作；规则不是为了证明谁更强。 / Clear responsibility supports cooperation; rules are not a strength contest.

<a id="m04-r1"></a>
**m04-R1**（已教依据：T1 与 R1）

规则应帮助协作还是争强？ / Should rules support cooperation or domination?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 证明谁最强 / Prove who is strongest | 这项不对 / Not correct. 规则是让大家知道怎样协作，不是用来证明某个人比别人强。 / Rules clarify cooperation; they are not a contest over who is strongest. |
| B | 支持协作 / Support cooperation | 答对了 / Correct. 责任分清楚，大家才知道怎样配合，规则因此有实际作用。 / Clear responsibilities show people how to work together and give rules practical value. |

答案：B。内容ID `m04-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m04-R2 替代讲解 / Alternative explanation**

交接问题需要能执行的约定，单纯催促不能替代负责人。 / Handover needs workable agreements; pressure cannot replace ownership.

<a id="m04-r2"></a>
**m04-R2**（已教依据：T2 与 R2）

只有期限没有负责人够吗？ / Is a deadline enough without an owner?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不够，还需职责 / No, assign responsibility | 答对了 / Correct. 知道什么时候交，还要知道谁来交、谁来接，否则仍可能无人负责。 / A deadline also needs identified senders and recipients, or responsibility may remain unassigned. |
| B | 基本够，大家可以根据期限自行认领剩余工作。 / It is mostly enough; people can claim the remaining work themselves based on the deadline. | 这项不对 / Not correct. 这个结论比题目给出的信息多走了一步。知道什么时候交，还要知道谁来交、谁来接，否则仍可能无人负责。 / This conclusion goes beyond the information provided. A deadline also needs identified senders and recipients, or responsibility may remain unassigned. |

答案：A。内容ID `m04-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m04-R3 替代讲解 / Alternative explanation**

保留必要边界，同时允许按已知变化修订流程。 / Keep necessary boundaries while revising procedures for known changes.

<a id="m04-r3"></a>
**m04-R3**（已教依据：T3 与 R3）

灵活调整等于取消全部规则吗？ / Does adapting mean removing every rule?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 等于 / Yes | 这项不对 / Not correct. 修改不合适的步骤，可以继续保留职责和必要界限，不必把规则全部取消。 / Unsuitable steps can change while duties and necessary limits remain. |
| B | 不等于 / No | 答对了 / Correct. 可以保留谁负责什么，同时调整怎样交接；两者并不冲突。 / Responsibilities can stay clear while handover methods change; the two are compatible. |

答案：B。内容ID `m04-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m04-v1"></a>
**m04-V1**（已教依据：T1 与 T2）

怎样把皇帝的含义用在合租的公共事务中？ / How can the Emperor’s meaning apply to shared-house responsibilities?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 约定分工与边界 / Agree duties and boundaries | 答对了 / Correct. 把清洁等公共事务的分工和界限约定好，大家才知道各自的责任。 / Agreed duties and limits for shared tasks tell residents what each is responsible for. |
| B | 由最擅长家务的人统筹，其他人有需要时再帮忙。 / Have the person best at housework coordinate it, with the others helping when needed. | 这项不对 / Not correct. 这个做法没有解决眼前的情况。把清洁等公共事务的分工和界限约定好，大家才知道各自的责任。 / This action does not resolve the situation described. Agreed duties and limits for shared tasks tell residents what each is responsible for. |

答案：A。内容ID `m04-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“责任清楚才能协作；规则不是为了证明谁更强。 / Clear responsibility supports cooperation; rules are not a strength contest.”；Q2 使用“交接问题需要能执行的约定，单纯催促不能替代负责人。 / Handover needs workable agreements; pressure cannot replace ownership.”；Q3 使用“保留必要边界，同时允许按已知变化修订流程。 / Keep necessary boundaries while revising procedures for known changes.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“皇帝代表秩序、责任和清楚的界限。谁负责什么、有哪些需要遵守的规则，安排清楚了才容易稳定；不等于所有决定都必须由一个人控制。 / The Emperor represents order, responsibility and clear limits. Stability benefits from clear duties and rules, not necessarily one person controlling every decision.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m05"></a>
### m05｜教皇 / The Hierophant

**目标、基础与范围**：理解 教皇 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m05.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_05_Hierophant.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m05-T1 完整含义 / Meaning**

教皇代表向老师、机构或群体学习已有的知识和方法，也包括大家共同遵守的规范。已有经验可以帮助新手起步，但学习传统不等于不能提问。 / The Hierophant represents learning established knowledge and methods from teachers, institutions or groups, including shared standards. Tradition can support beginners without forbidding questions.

**画面联系 / Picture connection**

居中的人物、两名学习者与钥匙，可以帮助记住向已有经验学习，不用宗教服饰判断人的信仰。 / The central figure, two learners and keys support teaching and entry into a tradition, not claims about a person’s faith.

**关键词整理 / Recall labels**

关键词：传承、向前人学习、共同规范。教皇的编号是V，但不能只凭数字5就把它解释成混乱。 / Remember: tradition, learning from others’ experience, shared standards. The Hierophant is numbered V, but five alone does not make its meaning chaos.

**m05-T2 正位应用 / Upright application**

学习建议：首次学木工，先跟合格老师学安全流程与基本技法，再逐步独立。 / Study advice: learn safety and basic woodworking from a qualified teacher before working independently.

**m05-T3 后续逆位深化 / Later reversal study**

逆位示例：某条老规定已不适用，却只因“过去如此”继续执行。需要重新检查这条规则现在是否合用，不等于拒绝所有指导。 / Reversed example: an outdated rule is kept only because it has always been used. Reassess this rule’s present relevance rather than reject all guidance.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m05-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

两名学习者→居中人物→钥匙；终态“学习与传承”。 / Learners, teacher, keys; end with “learning and tradition”.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m05-q1"></a>
**m05-Q1**（已教依据：T1）

本课讲的教皇，主要与哪种学习方式有关？ / Which approach to learning matches the Hierophant as taught here?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 以沿用传统规则为主，较少追问这些方法是否适合当下。 / Rely mainly on established rules and spend less time asking whether the methods fit the present. | 这项不对 / Not correct. 只沿用规则却不理解它是否适用，会把学习变成照搬。教皇在这里强调跟着已有知识和方法学习，并理解这套传承。 / Following rules without considering why they apply turns learning into imitation. Here the Hierophant concerns learning established knowledge and methods within a tradition. |
| B | 跟着已有的知识和方法学习 / Learn established knowledge and methods | 答对了 / Correct. 老师或群体传授已有的知识与做法，正体现了传承和学习。 / A teacher or group passing on established knowledge and methods expresses tradition and learning. |

答案：B。内容ID `m05-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m05-q2"></a>
**m05-Q2**（已教依据：T2）

木工新手先做什么？ / What should the woodworking beginner do?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 学安全与基本技法 / Learn safety and basics | 答对了 / Correct. 安全流程和基本技法，是新手能够逐步开始木工的基础。 / Safety procedures and basic techniques provide a foundation for beginning woodworking. |
| B | 跳过基础直接操作 / Skip basics and start working | 这项不对 / Not correct. 还没学过怎样安全操作就直接动手，跳过了例子要求先学习的基础。 / Working before learning safe operation skips the foundation taught in the example. |

答案：A。内容ID `m05-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m05-q3"></a>
**m05-Q3**（已教依据：T3）

在老规定已经不适用的逆位例子里，应该怎样做？ / What should be done in the reversal example about an outdated rule?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先保留旧规定，再让成员逐步适应它。 / Keep the old rule first and help members adapt to it gradually. | 这项不对 / Not correct. 这个做法没有解决眼前的情况。先弄清规则现在是否有用，才能决定继续保留还是修改。 / This action does not resolve the situation described. Checking current relevance supports a decision about retaining or revising the rule. |
| B | 评估规则是否适用 / Assess its relevance | 答对了 / Correct. 先弄清规则现在是否有用，才能决定继续保留还是修改。 / Checking current relevance supports a decision about retaining or revising the rule. |

答案：B。内容ID `m05-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m05-R1 替代讲解 / Alternative explanation**

向已有方法学习，要弄懂怎样做、为什么这样做，不只是记住是谁说的。 / Learning an established method involves understanding how and why, not merely who said it.

<a id="m05-r1"></a>
**m05-R1**（已教依据：T1 与 R1）

向老师提问违反传承吗？ / Does asking a teacher violate tradition?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不违反，可帮助理解 / No, it can deepen understanding | 答对了 / Correct. 问清为什么这样做，可以帮助理解传授的方法，并没有拒绝学习。 / Asking why a method works deepens understanding rather than rejecting instruction. |
| B | 最好先照着老师示范完成，再把疑问留到学会以后。 / It is better to follow the teacher’s demonstration first and save questions until the method has been learned. | 这项不对 / Not correct. 先核对眼前例子的条件：问清为什么这样做，可以帮助理解传授的方法，并没有拒绝学习。 / Check the conditions in this example first: Asking why a method works deepens understanding rather than rejecting instruction. |

答案：A。内容ID `m05-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m05-R2 替代讲解 / Alternative explanation**

基础教学给新手一套可以照着练的方法；遇到不懂的地方提问，才能理解规则的原因。 / Foundational teaching gives beginners a method to practise. Questions help explain the reasons behind unfamiliar rules.

<a id="m05-r2"></a>
**m05-R2**（已教依据：T2 与 R2）

新手学习规范是为了什么？ / Why learn basic standards?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 为了避免走弯路，先把不同情境都套进同一套步骤。 / To avoid detours, begin by applying the same procedure across different situations. | 这项不对 / Not correct. 这里要分清牌义的边界：先有可以照着练的方法，才能逐步理解并形成自己的判断。 / The boundary of the card meaning matters here: A method to practise provides a starting point for understanding and developing judgment. |
| B | 建立可依循的方法 / Establish a usable method | 答对了 / Correct. 先有可以照着练的方法，才能逐步理解并形成自己的判断。 / A method to practise provides a starting point for understanding and developing judgment. |

答案：B。内容ID `m05-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m05-R3 替代讲解 / Alternative explanation**

审视一条过时规则不等于所有规则都失效。 / Questioning an outdated rule does not invalidate every rule.

<a id="m05-r3"></a>
**m05-R3**（已教依据：T3 与 R3）

一条规则过时说明什么？ / What follows from one outdated rule?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 这条需要重新评估 / This rule needs reassessment | 答对了 / Correct. 已知的是这一条不适用，所以先重新检查这一条规则。 / The known issue concerns this particular rule, so reassess that rule first. |
| B | 这类规则的指导方式整体不再适合当前团队。 / This whole style of guidance no longer suits the current team. | 这项不对 / Not correct. 这个解释把牌义带到了别处。已知的是这一条不适用，所以先重新检查这一条规则。 / This interpretation shifts the card meaning elsewhere. The known issue concerns this particular rule, so reassess that rule first. |

答案：A。内容ID `m05-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m05-v1"></a>
**m05-V1**（已教依据：T1 与 T2）

刚加入合唱团，哪种做法符合本课讲的教皇？ / Which action fits the Hierophant when joining a choir?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不听说明直接各唱各的 / Ignore guidance and sing separately | 这项不对 / Not correct. 合唱需要共同的练习方法，各唱各的没有学会怎样配合。 / A choir needs shared practice methods; singing separately does not teach coordination. |
| B | 学共同练习规范 / Learn shared practice standards | 答对了 / Correct. 先学团体共同使用的练习规范，符合从已有方法和群体经验中学习。 / Learning shared practice standards fits learning from established methods and group experience. |

答案：B。内容ID `m05-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“向已有方法学习，要弄懂怎样做、为什么这样做，不只是记住是谁说的。 / Learning an established method involves understanding how and why, not merely who said it.”；Q2 使用“基础教学给新手一套可以照着练的方法；遇到不懂的地方提问，才能理解规则的原因。 / Foundational teaching gives beginners a method to practise. Questions help explain the reasons behind unfamiliar rules.”；Q3 使用“审视一条过时规则不等于所有规则都失效。 / Questioning an outdated rule does not invalidate every rule.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“教皇代表向老师、机构或群体学习已有的知识和方法，也包括大家共同遵守的规范。已有经验可以帮助新手起步，但学习传统不等于不能提问。 / The Hierophant represents learning established knowledge and methods from teachers, institutions or groups, including shared standards. Tradition can support beginners without forbidding questions.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m06"></a>
### m06｜恋人 / The Lovers

**目标、基础与范围**：理解 恋人 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m06.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_06_Lovers.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m06-T1 完整含义 / Meaning**

恋人代表吸引、关系，以及按照自己真正重视的事情作选择。涉及两个人时，还要看双方是否认同。它不只指恋爱，也不保证关系结果。 / The Lovers represents attraction, relationships and choices reflecting what matters most. When two people are involved, mutual agreement also matters. Romance is not its only meaning or a guaranteed outcome.

**画面联系 / Picture connection**

两个人物和上方天使，可以帮助记住关系，以及自己真正重视的事情；画面不能替对方作承诺。 / Two figures and an angel support relationship and values; the image cannot make another person’s commitment.

**关键词整理 / Recall labels**

关键词：连接、重要选择、相互认同。恋人的编号是VI，但抽到它并不保证感情一定成功。 / Remember: connection, important choices, mutual agreement. The Lovers is numbered VI, but drawing it does not guarantee romantic success.

**m06-T2 正位应用 / Upright application**

职业选择建议：两份工作待遇相近，一份支持你重视的创作，另一份要求放弃它。先想清楚自己是否愿意为了工作放下创作，再作决定。 / Career advice: two jobs offer similar pay, but only one supports valued creative work. Decide whether you are willing to give up creativity for the job before choosing.

**m06-T3 后续逆位深化 / Later reversal study**

逆位示例：两人已明确想要不同的生活安排，却回避讨论。先看看双方哪里想得不同、为什么迟迟不作选择；不能据此认定他们一定会分手。 / Reversed example: two people want different living arrangements but avoid discussing them. Examine the disagreement and delayed choice without declaring inevitable separation.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m06-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

两个人物同时强调；终态“关系＋重要选择”，不画确定姻缘线。 / Emphasize both figures; end with “relationship + values”, not a guaranteed romantic bond.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m06-q1"></a>
**m06-Q1**（已教依据：T1）

恋人只适用于恋爱吗？ / Is the Lovers only about romance?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不是，也涉及按自己重视的事情作选择 / No, it also involves choosing according to what matters to you | 答对了 / Correct. 职业、合作等选择也可能涉及自己重视的事情，并不只有恋爱才会遇到。 / Work and collaboration choices can also involve personal values; this is not limited to romance. |
| B | 是，其他问题不能用 / Yes, no other issue applies | 这项不对 / Not correct. 本课已经包括重要选择与相互认同，因此把它限制为恋爱会漏掉这些含义。 / The lesson also includes important choices and mutual agreement, which a romance-only reading omits. |

答案：A。内容ID `m06-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m06-q2"></a>
**m06-Q2**（已教依据：T2）

两份工作的待遇相近，但只有一份允许继续创作。这个例子首先要想清楚什么？ / Two jobs offer similar pay, but only one allows continued creative work. What needs clarifying first?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 工资相近时，优先比较哪份工作看起来更稳定。 / When the salaries are similar, compare which job appears more stable first. | 这项不对 / Not correct. 这里要分清牌义的边界：例子明确说你重视创作，先弄清能否接受放下它，才是在处理这次取舍。 / The boundary of the card meaning matters here: The example says creativity matters to you, so deciding whether to relinquish it addresses the trade-off. |
| B | 想清楚是否愿意为了工作放下创作 / Decide whether you are willing to give up creative work for the job | 答对了 / Correct. 例子明确说你重视创作，先弄清能否接受放下它，才是在处理这次取舍。 / The example says creativity matters to you, so deciding whether to relinquish it addresses the trade-off. |

答案：B。内容ID `m06-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m06-q3"></a>
**m06-Q3**（已教依据：T3）

两人想要的生活安排不同，又回避讨论。在这个逆位例子里，先处理什么？ / Two people want different living arrangements and avoid discussing them. What should be addressed first?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 讨论双方不一致 / Discuss the disagreement | 答对了 / Correct. 已经知道双方想法不同却没有谈清楚，讨论差异才回应了当前问题。 / Different wishes and avoided discussion are given; discussing them addresses the present issue. |
| B | 先判断谁更愿意为关系让步，再决定是否继续。 / First determine who is more willing to compromise for the relationship, then decide whether to continue. | 这项不对 / Not correct. 这里要分清牌义的边界：已经知道双方想法不同却没有谈清楚，讨论差异才回应了当前问题。 / The boundary of the card meaning matters here: Different wishes and avoided discussion are given; discussing them addresses the present issue. |

答案：A。内容ID `m06-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m06-R1 替代讲解 / Alternative explanation**

两个人互相吸引，不等于他们重视的事情和想过的生活都一样。这两个方面需要分别了解。 / Mutual attraction does not establish identical priorities or desired lives. Examine those aspects separately.

<a id="m06-r1"></a>
**m06-R1**（已教依据：T1 与 R1）

互相吸引，就代表想要的生活和重视的事情都相同吗？ / Does attraction prove shared values?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 代表 / Yes | 这项不对 / Not correct. 互相吸引只能说明有吸引，不能因此知道双方对生活和原则的看法都相同。 / Attraction alone does not establish matching views about life or principles. |
| B | 不代表 / No | 答对了 / Correct. 是否吸引与重视什么是两个方面，需要分别了解。 / Attraction and personal priorities are distinct and need separate consideration. |

答案：B。内容ID `m06-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m06-R2 替代讲解 / Alternative explanation**

选择要看你自己重视什么。有人最看重创作，有人更看重别的事情，因此不能替所有人规定同一个职业答案。 / Choices depend on personal priorities. Creativity matters most to some people, while others prioritize differently, so no career answer fits everyone.

<a id="m06-r2"></a>
**m06-R2**（已教依据：T2 与 R2）

建议能替所有人选同一职业吗？ / Can this advice choose the same career for everyone?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不能，价值取舍不同 / No, priorities differ | 答对了 / Correct. 每个人重视的事情不同，相同职业也可能适合一人、不适合另一人。 / Priorities differ; the same career may suit one person and not another. |
| B | 能，牌给统一职业 / Yes, the card names one career | 这项不对 / Not correct. 牌没有给所有人指定同一种职业；本课要求结合个人重视的事情作选择。 / The card assigns no universal career; the lesson relates choices to personal priorities. |

答案：A。内容ID `m06-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m06-R3 替代讲解 / Alternative explanation**

差异需要被讨论；牌面不替双方决定关系去留。 / Differences need discussion; the card does not decide whether people stay.

<a id="m06-r3"></a>
**m06-R3**（已教依据：T3 与 R3）

不一致是否等于关系已结束？ / Does disagreement mean the relationship has ended?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 等于 / Yes | 这项不对 / Not correct. 差异和回避说明有待处理的问题，不是已经作出了分开的决定。 / Disagreement and avoidance identify an unresolved problem, not an established decision to separate. |
| B | 不等于 / No | 答对了 / Correct. 例子只说明安排不同且没有讨论，之后如何选择仍需双方决定。 / Only different preferences and avoidance are stated; the later choice remains with the people involved. |

答案：B。内容ID `m06-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m06-v1"></a>
**m06-V1**（已教依据：T1 与 T2）

收到的合作邀请与个人原则冲突，怎样运用恋人的含义？ / How can the Lovers apply when an invitation conflicts with personal principles?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 明确原则再作选择 / Clarify principles before choosing | 答对了 / Correct. 先明确自己不能放弃的原则，再决定是否合作，就是在按自己重视的事情作选择。 / Clarifying principles before accepting the invitation expresses values-based choice. |
| B | 只因被邀请就答应 / Accept merely because invited | 这项不对 / Not correct. 被邀请不代表合作符合自己的原则，直接答应没有处理已知冲突。 / An invitation does not ensure compatibility with your principles; immediate acceptance leaves the conflict unresolved. |

答案：A。内容ID `m06-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“两个人互相吸引，不等于他们重视的事情和想过的生活都一样。这两个方面需要分别了解。 / Mutual attraction does not establish identical priorities or desired lives. Examine those aspects separately.”；Q2 使用“选择要看你自己重视什么。有人最看重创作，有人更看重别的事情，因此不能替所有人规定同一个职业答案。 / Choices depend on personal priorities. Creativity matters most to some people, while others prioritize differently, so no career answer fits everyone.”；Q3 使用“差异需要被讨论；牌面不替双方决定关系去留。 / Differences need discussion; the card does not decide whether people stay.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“恋人代表吸引、关系，以及按照自己真正重视的事情作选择。涉及两个人时，还要看双方是否认同。它不只指恋爱，也不保证关系结果。 / The Lovers represents attraction, relationships and choices reflecting what matters most. When two people are involved, mutual agreement also matters. Romance is not its only meaning or a guaranteed outcome.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m07"></a>
### m07｜战车 / The Chariot

**目标、基础与范围**：理解 战车 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m07.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_07_Chariot.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m07-T1 完整含义 / Meaning**

战车代表朝着明确目标努力向前，也包括把不同方向的行动协调好。进展不只靠速度，还要让大家的行动朝着同一个目标。 / The Chariot represents determined progress toward a clear goal, including coordinating different efforts. Speed alone is not enough; action needs a shared direction.

**画面联系 / Picture connection**

驾车者、车体与一黑一白的狮身像帮助记住驾驭不同力量，不表示现实必须有敌人。 / The driver, vehicle and contrasting sphinxes support coordination of different forces, not a necessary enemy.

**关键词整理 / Recall labels**

关键词：方向、自律、推进。VII不是保证胜利的数字。 / Recall labels: direction, discipline, progress. VII does not guarantee victory.

**m07-T2 正位应用 / Upright application**

项目建议：多项任务都要占用同一段时间，先确定本周要完成的目标，再安排各项任务的时间。 / Project advice: when tasks compete for the same time, decide what must be achieved this week and schedule the tasks around it.

**m07-T3 后续逆位深化 / Later reversal study**

逆位示例：团队各自追不同目标，忙却没有共同进展。先明确大家要一起完成什么，而不只是催每个人做得更快。 / Reversed example: team members pursue different goals and stay busy without shared progress. Agree what to achieve together instead of only demanding more speed.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m07-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

两只狮身像→驾车者；终态标出同一目标，不改动原图朝向。 / Sphinxes, then driver; label a shared goal without altering the artwork.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m07-q1"></a>
**m07-Q1**（已教依据：T1）

本课讲的战车，除了行动速度，还需要什么才能推进？ / Besides speed, what does the Chariot need for progress in this lesson?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 单纯加快动作 / Simply move faster | 这项不对 / Not correct. 如果不知道要完成什么，只加快动作仍可能各做各的。 / Without a shared goal, moving faster may still send efforts in separate directions. |
| B | 确定目标，让行动朝同一方向推进 / Set a goal and coordinate action toward it | 答对了 / Correct. 明确要完成什么，再让各项行动围绕目标安排，才有共同方向。 / A clear goal and coordinated actions give effort a shared direction. |

答案：B。内容ID `m07-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m07-q2"></a>
**m07-Q2**（已教依据：T2）

多项任务要占用同一段时间，怎样运用战车的含义？ / How can the Chariot apply when several tasks compete for the same time?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 定目标并协调排期 / Set a goal and coordinate schedules | 答对了 / Correct. 先定目标再排时间，能决定先做什么，避免任务挤在一起。 / A goal and schedule establish priorities instead of crowding tasks together. |
| B | 先推进最紧急的任务，其他任务也尽量保持原进度。 / Push the most urgent task first while trying to keep the other tasks moving at their current pace. | 这项不对 / Not correct. 先别按这个做法继续；先定目标再排时间，能决定先做什么，避免任务挤在一起。 / Do not continue with this approach yet; A goal and schedule establish priorities instead of crowding tasks together. |

答案：A。内容ID `m07-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m07-q3"></a>
**m07-Q3**（已教依据：T3）

这个逆位案例中，团队先做什么？ / In this reversed-card example, what should the team do first?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 加快不同方向行动 / Accelerate conflicting actions | 这项不对 / Not correct. 目标本来就不同，加快各自动作仍不会让团队朝同一目标前进。 / Accelerating conflicting efforts does not give the team a shared goal. |
| B | 统一目标 / Align goals | 答对了 / Correct. 先说清共同目标，再协调每个人的工作，才能改变各自为政的情况。 / Clarifying a shared goal before coordinating work addresses the conflicting directions. |

答案：B。内容ID `m07-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m07-R1 替代讲解 / Alternative explanation**

战车讲的前进，是朝着明确目标推进。有很多动作、很忙碌，不代表正在接近目标。 / The Chariot’s progress moves toward a clear goal. Being busy and active does not necessarily mean approaching it.

<a id="m07-r1"></a>
**m07-R1**（已教依据：T1 与 R1）

忙碌一定等于前进吗？ / Does being busy necessarily mean progress?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不一定，要看方向 / No, direction matters | 答对了 / Correct. 要看忙的事情有没有帮助接近目标，不能只按动作多少判断进展。 / Progress depends on whether activity approaches the goal, not on the amount of activity. |
| B | 大体是，持续忙碌通常说明事情正在推进。 / Generally yes; staying busy usually shows that the work is moving forward. | 这项不对 / Not correct. 这个结论比题目给出的信息多走了一步。要看忙的事情有没有帮助接近目标，不能只按动作多少判断进展。 / This conclusion goes beyond the information provided. Progress depends on whether activity approaches the goal, not on the amount of activity. |

答案：A。内容ID `m07-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m07-R2 替代讲解 / Alternative explanation**

排期要先看当前目标最需要完成什么，再安排各项任务；不是把所有事都挤在同一时间做。 / Scheduling begins with what the current goal needs, then arranges tasks accordingly rather than squeezing everything into the same time.

<a id="m07-r2"></a>
**m07-R2**（已教依据：T2 与 R2）

合理安排任务，就是同时做尽可能多的事吗？ / Does arranging work well mean doing as many tasks as possible at once?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 是，越多越有掌控 / Yes, more means more control | 这项不对 / Not correct. 同时做得多，仍可能任务冲突；数量不能证明安排得好。 / More simultaneous tasks may still conflict; quantity does not establish good coordination. |
| B | 不是，要围绕目标安排 / No, arrange work around the goal | 答对了 / Correct. 围绕目标安排先后，才是在协调时间与精力。 / Ordering work around the goal coordinates time and effort. |

答案：B。内容ID `m07-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m07-R3 替代讲解 / Alternative explanation**

如果大家朝不同目标行动，做得越快也可能离共同目标越远。先确认要一起完成什么，再继续推进。 / When people pursue different goals, speed may increase divergence. Agree what to achieve together before moving on.

<a id="m07-r3"></a>
**m07-R3**（已教依据：T3 与 R3）

目标相反时加速能解决吗？ / Can speed fix opposing goals?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不能，先统一目标 / No, align the goals first | 答对了 / Correct. 真正的问题是目标不一致，先统一目标才知道接下来怎样配合。 / The actual problem is conflicting goals; alignment comes before coordinated action. |
| B | 能，速度会统一目标 / Yes, speed aligns goals | 这项不对 / Not correct. 速度改变的是做得多快，并不会自动改变大家想完成什么。 / Speed changes how fast people act, not what each intends to achieve. |

答案：A。内容ID `m07-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m07-v1"></a>
**m07-V1**（已教依据：T1 与 T2）

为了参加比赛而训练，哪种做法体现战车的含义？ / Which approach to competition training fits the Chariot?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 每天随机换目标 / Change goals randomly each day | 这项不对 / Not correct. 每天随意换目标，会让训练缺少持续方向，难以围绕比赛准备。 / Randomly changing goals removes consistent direction from preparation. |
| B | 围绕目标安排训练 / Organize training around a goal | 答对了 / Correct. 围绕比赛目标安排训练，让持续行动服务于明确方向。 / Training organized around the competition goal gives sustained action a clear direction. |

答案：B。内容ID `m07-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“战车讲的前进，是朝着明确目标推进。有很多动作、很忙碌，不代表正在接近目标。 / The Chariot’s progress moves toward a clear goal. Being busy and active does not necessarily mean approaching it.”；Q2 使用“排期要先看当前目标最需要完成什么，再安排各项任务；不是把所有事都挤在同一时间做。 / Scheduling begins with what the current goal needs, then arranges tasks accordingly rather than squeezing everything into the same time.”；Q3 使用“如果大家朝不同目标行动，做得越快也可能离共同目标越远。先确认要一起完成什么，再继续推进。 / When people pursue different goals, speed may increase divergence. Agree what to achieve together before moving on.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“战车代表朝着明确目标努力向前，也包括把不同方向的行动协调好。进展不只靠速度，还要让大家的行动朝着同一个目标。 / The Chariot represents determined progress toward a clear goal, including coordinating different efforts. Speed alone is not enough; action needs a shared direction.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m08"></a>
### m08｜力量 / Strength

**目标、基础与范围**：理解 力量 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m08.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_08_Strength.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m08-T1 完整含义 / Meaning**

力量表达面对困难的勇气和耐心。即使很生气、很想立刻反击，也能先稳住自己，再选择怎样回应。温和不等于退让，坚定也不必靠压过别人。 / Strength expresses courage and patience in difficulty. Even when angry and ready to retaliate, you can steady yourself before responding. Gentleness need not surrender, and firmness need not overpower.

**画面联系 / Picture connection**

人物靠近狮子，双手放在狮子嘴边，可以帮助记住温和地应对强烈的力量，不据此鼓励接近真实猛兽。 / The figure’s hands near the lion support approaching and regulating force, not approaching real wild animals.

**关键词整理 / Recall labels**

关键词：勇气、耐心、温和而坚定。这套RWS牌中，力量的编号是VIII。 / Remember: courage, patience, gentle firmness. Strength is numbered VIII in this RWS deck.

**m08-T2 正位应用 / Upright application**

沟通建议：意见被否定时先稳住情绪，再清楚表达理由。不是忍到不说，也不是吼赢对方。 / Communication advice: steady yourself after criticism and explain your reasons, rather than silence yourself or shout someone down.

**m08-T3 后续逆位深化 / Later reversal study**

逆位示例：压力大时一受刺激就爆发。这里需要留意自己为什么难以稳住情绪，先休息或求助；不能据此给人贴上“永远软弱”的标签。 / Reversed example: stress brings quick outbursts. Notice the difficulty steadying emotions and seek rest or support; this does not establish permanent weakness.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m08-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

手与狮口→人物姿态；终态“温和而坚定”。 / Hands and lion, then posture; end with “gentle and firm”.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m08-q1"></a>
**m08-Q1**（已教依据：T1）

按照本课讲的力量，很想冲动反击时可以怎样回应？ / How does Strength, as taught here, respond to an impulse to retaliate?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先稳住情绪，再选择怎样回应 / Steady yourself before choosing how to respond | 答对了 / Correct. 先稳住自己，仍然可以回应问题，只是不让一时冲动决定怎么做。 / Steadying yourself still allows a response without letting impulse decide it. |
| B | 先压住情绪，不表露立场，等对方态度缓和。 / Hold the emotion down and conceal your position until the other person softens. | 这项不对 / Not correct. 先别按这个做法继续；先稳住自己，仍然可以回应问题，只是不让一时冲动决定怎么做。 / Do not continue with this approach yet; Steadying yourself still allows a response without letting impulse decide it. |

答案：A。内容ID `m08-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m08-q2"></a>
**m08-Q2**（已教依据：T2）

意见被否定后，哪种回应符合刚才的沟通示范？ / Which response fits the example of having your opinion rejected?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先不回应，等情绪过去后让这次分歧自然淡化。 / Do not respond for now; let the disagreement fade after the emotion passes. | 这项不对 / Not correct. 这个判断忽略了题目给出的条件。先稳住情绪，再讲理由，既没有冲动反击，也没有放弃表达。 / This judgment overlooks a condition given in the question. Steadying yourself before giving reasons avoids both retaliation and abandoning expression. |
| B | 稳住后说明理由 / Steady yourself and give reasons | 答对了 / Correct. 先稳住情绪，再讲理由，既没有冲动反击，也没有放弃表达。 / Steadying yourself before giving reasons avoids both retaliation and abandoning expression. |

答案：B。内容ID `m08-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m08-q3"></a>
**m08-Q3**（已教依据：T3）

在压力很大、一受刺激就爆发的逆位例子里，应关注什么？ / What matters in the reversal example of outbursts under stress?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 恢复稳住情绪的能力 / Restore the ability to steady emotions | 答对了 / Correct. 例子说明目前压力大、容易爆发，应帮助自己休息和恢复，而不是贴标签。 / The example concerns stress and outbursts, calling for recovery rather than a label. |
| B | 暂时减少需要表达意见的场合，避免再次失控。 / Temporarily avoid situations that require expressing an opinion so another outburst is less likely. | 这项不对 / Not correct. 这个说法混淆了题目正在考的含义。例子说明目前压力大、容易爆发，应帮助自己休息和恢复，而不是贴标签。 / This statement confuses the meaning being tested. The example concerns stress and outbursts, calling for recovery rather than a label. |

答案：A。内容ID `m08-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m08-R1 替代讲解 / Alternative explanation**

可以平静地说话，也可以清楚说明自己不能接受什么。语气温和，不等于必须答应对方。 / You can speak calmly while clearly stating what you cannot accept. A gentle tone does not require agreement.

<a id="m08-r1"></a>
**m08-R1**（已教依据：T1 与 R1）

平静地表达，还能清楚说明自己不能接受什么吗？ / Can you speak calmly while clearly stating what you cannot accept?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不可以 / No | 这项不对 / Not correct. 语气平静不等于答应一切，不能接受的要求仍然可以说清楚。 / A calm tone does not require agreement; unacceptable requests can still be refused clearly. |
| B | 可以 / Yes | 答对了 / Correct. 怎样说话和是否坚持自己的立场，是两回事，可以同时做到。 / A gentle manner and a firm position can coexist. |

答案：B。内容ID `m08-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m08-R2 替代讲解 / Alternative explanation**

先冷静下来，是为了把想说的话说清楚，不是要求以后都不再表达。 / Calming down helps you express yourself clearly; it does not require permanent silence.

<a id="m08-r2"></a>
**m08-R2**（已教依据：T2 与 R2）

先冷静是否代表不再说？ / Does calming down mean never speaking?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不代表 / No | 答对了 / Correct. 冷静之后仍可继续表达，只是更容易把理由讲清楚。 / You can still speak after calming down and may explain your reasons more clearly. |
| B | 代表 / Yes | 这项不对 / Not correct. 示范说的是先稳住再表达，没有要求取消后面的表达。 / The example says to steady yourself and then speak, not to remove expression. |

答案：A。内容ID `m08-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m08-R3 替代讲解 / Alternative explanation**

最近很难稳住情绪，可以先休息或寻求帮助。这是目前遇到的困难，不能据此认定一个人永远软弱。 / Recent difficulty managing emotions can call for rest or help. It describes a present difficulty, not permanent weakness.

<a id="m08-r3"></a>
**m08-R3**（已教依据：T3 与 R3）

最近难以稳住情绪，能说明这个人永远软弱吗？ / Does recent difficulty managing emotions establish permanent weakness?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 能 / Yes | 这项不对 / Not correct. 例子只说明最近压力下的表现，不能推出永远不会改变。 / The example describes a current response to stress, not an unchangeable trait. |
| B | 不能 / No | 答对了 / Correct. 休息和帮助仍可能有用，不能用当前困难给一个人下终身定论。 / Rest and support may help; present difficulty is not a lifelong verdict. |

答案：B。内容ID `m08-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m08-v1"></a>
**m08-V1**（已教依据：T1 与 T2）

学新技能时遇到挫折，怎样运用力量的含义？ / How can Strength apply to frustration while learning a skill?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 耐心处理挫败再尝试 / Handle frustration patiently and retry | 答对了 / Correct. 耐心处理挫败后再试，既面对困难，也照顾了自己的情绪。 / Patiently handling frustration and retrying combines courage with emotional care. |
| B | 用羞辱逼自己继续 / Shame yourself into continuing | 这项不对 / Not correct. 羞辱只增加压力，没有教会自己怎样耐心面对困难。 / Shame adds pressure without teaching a patient response to difficulty. |

答案：A。内容ID `m08-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“可以平静地说话，也可以清楚说明自己不能接受什么。语气温和，不等于必须答应对方。 / You can speak calmly while clearly stating what you cannot accept. A gentle tone does not require agreement.”；Q2 使用“先冷静下来，是为了把想说的话说清楚，不是要求以后都不再表达。 / Calming down helps you express yourself clearly; it does not require permanent silence.”；Q3 使用“最近很难稳住情绪，可以先休息或寻求帮助。这是目前遇到的困难，不能据此认定一个人永远软弱。 / Recent difficulty managing emotions can call for rest or help. It describes a present difficulty, not permanent weakness.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“力量表达面对困难的勇气和耐心。即使很生气、很想立刻反击，也能先稳住自己，再选择怎样回应。温和不等于退让，坚定也不必靠压过别人。 / Strength expresses courage and patience in difficulty. Even when angry and ready to retaliate, you can steady yourself before responding. Gentleness need not surrender, and firmness need not overpower.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m09"></a>
### m09｜隐士 / The Hermit

**目标、基础与范围**：理解 隐士 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m09.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_09_Hermit.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m09-T1 完整含义 / Meaning**

隐士强调主动独处、反思与寻找自己的方向。暂时离开喧闹，是为了看清问题，不是把孤立和拒绝帮助当作理想。 / The Hermit emphasizes deliberate solitude, reflection and finding direction. Stepping away from noise serves understanding, not isolation or rejection of help.

**画面联系 / Picture connection**

灯笼、手杖与独自站立的人物帮助记住照亮眼前的一段路，不保证立刻知道全部未来。 / The lantern, staff and solitary figure suggest illuminating the next part of a path, not knowing the entire future.

**关键词整理 / Recall labels**

关键词：独处、反思、寻找方向。IX不能代替具体牌义。 / Recall labels: solitude, reflection, seeking direction. IX does not replace the meaning.

**m09-T2 正位应用 / Upright application**

学习建议：被各种课程推荐弄乱时，先安静检查自己真正缺什么，再选择资源。 / Study advice: when course recommendations overwhelm you, review your actual needs before choosing resources.

**m09-T3 后续逆位深化 / Later reversal study**

逆位示例：长时间拒绝交流，连需要的信息也得不到。这里的问题是把自己孤立起来，而不是安静思考本身有错。 / Reversed example: prolonged refusal to communicate blocks needed information. The issue is isolation, not quiet reflection itself.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m09-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

灯笼→手杖；终态“先照清下一步”，不画通向必然未来的路线。 / Lantern, then staff; end with “clarify the next step”, without a guaranteed future route.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m09-q1"></a>
**m09-Q1**（已教依据：T1）

本课里，隐士暂时独处是为了什么？ / What is the purpose of the Hermit’s temporary solitude here?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先把别人的建议放下，只凭自己的第一感觉决定。 / Set other people’s advice aside and decide from your first instinct alone. | 这项不对 / Not correct. 独处不是拒绝所有建议，也不是只凭第一感觉决定。隐士留出安静时间，是为了反思并找清自己的方向。 / Solitude is not rejecting every suggestion or deciding from first instinct alone. The Hermit uses quiet time to reflect and find direction. |
| B | 反思并找方向 / Reflect and find direction | 答对了 / Correct. 留出安静思考的时间，帮助自己看清需要什么、往哪里走。 / Quiet reflection helps clarify needs and direction. |

答案：B。内容ID `m09-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m09-q2"></a>
**m09-Q2**（已教依据：T2）

课程推荐太多先做什么？ / What first when course options overwhelm?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 检查自己的学习需要 / Examine your learning needs | 答对了 / Correct. 先知道自己真正需要学什么，才更容易判断哪些课程适合。 / Knowing your learning needs helps identify suitable courses. |
| B | 从推荐人数最多的课程开始，借助大家的选择缩小范围。 / Start with the most recommended course and use other people’s choice to narrow the options. | 这项不对 / Not correct. 这个做法没有解决眼前的情况。先知道自己真正需要学什么，才更容易判断哪些课程适合。 / This action does not resolve the situation described. Knowing your learning needs helps identify suitable courses. |

答案：A。内容ID `m09-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m09-q3"></a>
**m09-Q3**（已教依据：T3）

在拒绝交流、连必要信息也得不到的逆位例子里，需要调整什么？ / What needs changing when refusing contact blocks necessary information?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 继续独自整理，等想清楚后再恢复交流。 / Keep working it out alone and resume communication after the answer feels clear. | 这项不对 / Not correct. 先别按这个做法继续；恢复必要联系，才能获得需要的信息；之后仍可以独立判断。 / Do not continue with this approach yet; Necessary contact restores access to information while leaving judgment independent. |
| B | 恢复必要交流 / Restore necessary communication | 答对了 / Correct. 恢复必要联系，才能获得需要的信息；之后仍可以独立判断。 / Necessary contact restores access to information while leaving judgment independent. |

答案：B。内容ID `m09-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m09-R1 替代讲解 / Alternative explanation**

一个人安静下来，是为了想清楚遇到的问题。周围没人说话，并不等于已经想清楚了。 / Quiet time alone can help examine a problem. Silence does not mean the problem is already understood.

<a id="m09-r1"></a>
**m09-R1**（已教依据：T1 与 R1）

没人说话就等于有效反思吗？ / Does silence alone equal reflection?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不等于，还要理解问题 / No, examine the issue | 答对了 / Correct. 安静只是提供思考的时间，还需要实际去理解遇到的问题。 / Quiet provides time for reflection; the problem still needs examination. |
| B | 等于，安静就是答案 / Yes, silence is the answer | 这项不对 / Not correct. 没有人说话，并不能自动带来对问题的理解。 / Silence does not automatically produce understanding. |

答案：A。内容ID `m09-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m09-R2 替代讲解 / Alternative explanation**

先想清楚自己哪里不懂，再带着具体问题请教别人，会更容易找到需要的信息。 / Clarifying what you do not understand before asking a specific question helps locate the information you need.

<a id="m09-r2"></a>
**m09-R2**（已教依据：T2 与 R2）

想清问题后还能请教吗？ / Can you seek advice after reflecting?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 可以，不过最好先接受对方给出的方向，减少自己的犹豫。 / Yes, though it is better to adopt the other person’s direction first and reduce your own hesitation. | 这项不对 / Not correct. 先核对眼前例子的条件：带着明确问题请教，是在为自己的判断寻找需要的信息。 / Check the conditions in this example first: A clear question seeks information to inform your own judgment. |
| B | 可以，带着明确问题 / Yes, with a clear question | 答对了 / Correct. 带着明确问题请教，是在为自己的判断寻找需要的信息。 / A clear question seeks information to inform your own judgment. |

答案：B。内容ID `m09-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m09-R3 替代讲解 / Alternative explanation**

如果一直不与人交流，连需要的信息和帮助也得不到，可以恢复一些联系。听到别人的信息后，仍能自己判断是否采用。 / When isolation blocks needed information or support, some contact can help. You can still decide independently whether to use what others provide.

<a id="m09-r3"></a>
**m09-R3**（已教依据：T3 与 R3）

恢复交流会取消独立判断吗？ / Does reconnecting erase independent judgment?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不会 / No | 答对了 / Correct. 别人可以提供信息，是否采用仍由自己思考决定。 / Others can supply information while you decide whether to use it. |
| B | 会 / Yes | 这项不对 / Not correct. 交流不等于把决定全部交给别人，仍可保留自己的判断。 / Communication does not hand every decision to others. |

答案：A。内容ID `m09-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m09-v1"></a>
**m09-V1**（已教依据：T1 与 T2）

收到许多互相冲突的创作建议时，怎样运用隐士的含义？ / How can the Hermit apply to conflicting feedback about your creative work?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 把最受欢迎的建议当成自己的方向，不再检查自己想表达什么。 / Treat the most popular suggestion as your direction without checking what you want to express. | 这项不对 / Not correct. 这里用受欢迎程度代替了自己的方向；隐士提醒先想清楚自己要表达什么，再选择采用哪些建议。 / Popularity replaces your own direction here; the Hermit asks you to clarify what you want to express before choosing feedback. |
| B | 留时间澄清自己的方向 / Take time to clarify your direction | 答对了 / Correct. 先想清楚自己想表达什么，再决定采用哪些意见，符合本课的反思。 / Clarifying your intent before choosing feedback applies the reflection taught here. |

答案：B。内容ID `m09-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“一个人安静下来，是为了想清楚遇到的问题。周围没人说话，并不等于已经想清楚了。 / Quiet time alone can help examine a problem. Silence does not mean the problem is already understood.”；Q2 使用“先想清楚自己哪里不懂，再带着具体问题请教别人，会更容易找到需要的信息。 / Clarifying what you do not understand before asking a specific question helps locate the information you need.”；Q3 使用“如果一直不与人交流，连需要的信息和帮助也得不到，可以恢复一些联系。听到别人的信息后，仍能自己判断是否采用。 / When isolation blocks needed information or support, some contact can help. You can still decide independently whether to use what others provide.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“隐士强调主动独处、反思与寻找自己的方向。暂时离开喧闹，是为了看清问题，不是把孤立和拒绝帮助当作理想。 / The Hermit emphasizes deliberate solitude, reflection and finding direction. Stepping away from noise serves understanding, not isolation or rejection of help.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m10"></a>
### m10｜命运之轮 / Wheel of Fortune

**目标、基础与范围**：理解 命运之轮 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m10.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_10_Wheel_of_Fortune.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m10-T1 完整含义 / Meaning**

命运之轮关注周期、转折和不完全受个人控制的变化。它提醒观察时机并调整，不承诺变化必定带来好运。 / The Wheel of Fortune concerns cycles, turning points and change beyond personal control. Notice timing and adapt; change does not guarantee good luck.

**画面联系 / Picture connection**

轮子居中，周围有不同形象。轮形帮助记住循环与转动；具体事情何时发生不能从轮子直接确定。 / A wheel occupies the centre, surrounded by figures. Its form helps recall cycles and turning, but does not specify when an event will occur.

**关键词整理 / Recall labels**

关键词：周期、转折、时机、变化。编号X是大牌序号，不等于所有数字十的牌义。 / Recall labels: cycles, turning points, timing, change. X is this major card’s number, not the meaning of every Ten.

**m10-T2 正位应用 / Upright application**

建议位：展会日期被主办方调整，你可以重新安排准备和交通。先区分外部变化与自己可调整的部分，而不是责备自己控制不了全部。 / Advice: an organiser changes an exhibition date. Revise preparation and travel, distinguishing external change from what you can adjust.

**m10-T3 后续逆位深化 / Later reversal study**

逆位示例：安排已经变化，仍坚持旧时间表，结果接连遇到阻碍。需要重新看看现在怎样安排才合适，不代表这个人会永远倒霉。 / Reversed example: circumstances have changed, but an old schedule produces repeated obstacles. Reconsider a suitable present plan rather than declaring permanent bad luck.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m10-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

轮子轮廓→外圈；终态保留“发生了什么变化／我能调整什么”两栏，不旋转原画制造事件。 / Highlight the wheel and its rim; finish with “changed conditions / my adjustment”, without animating invented events.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m10-q1"></a>
**m10-Q1**（已教依据：T1）

本课讲的命运之轮，主要表达什么？ / What does the Wheel of Fortune mainly express here?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 周期与局面变化 / Cycles and changing circumstances | 答对了 / Correct. 轮子让我们记住周期和转折：事情会变化，不总由一个人决定。 / The wheel recalls cycles and turning points: circumstances change beyond one person’s control. |
| B | 外部局面改变后，机会通常会自然转向更有利的一面。 / When external circumstances change, opportunities usually turn in a more favorable direction on their own. | 这项不对 / Not correct. 这个解释把牌义带到了别处。轮子让我们记住周期和转折：事情会变化，不总由一个人决定。 / This interpretation shifts the card meaning elsewhere. The wheel recalls cycles and turning points: circumstances change beyond one person’s control. |

答案：A。内容ID `m10-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m10-q2"></a>
**m10-Q2**（已教依据：T2）

展会已经改期，哪种做法符合刚才的建议？ / Which action fits the advice after the exhibition date changes?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 坚持原日期去参加 / Attend on the original date | 这项不对 / Not correct. 活动已经改期，按旧日期到场没有回应现实中的改变。 / Attending on the old date ignores the actual change. |
| B | 重排准备与交通 / Revise preparation and travel | 答对了 / Correct. 日期不能由你决定，但准备顺序和出行安排可以随之调整。 / The date is outside your control, but preparation and travel can adapt. |

答案：B。内容ID `m10-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m10-q3"></a>
**m10-Q3**（已教依据：T3）

安排已经改变，却仍坚持旧时间表。这个逆位例子的问题在哪里？ / What is wrong in the reversal example of keeping an old schedule after plans change?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 旧安排不适合新条件 / The old plan no longer fits | 答对了 / Correct. 已知的是旧时间表不再合用，仍坚持它才造成反复受阻。 / The old schedule no longer fits; insisting on it causes the repeated obstacles. |
| B | 变化来得太快，当事人暂时还没有等到合适的新机会。 / The change came too quickly, and the person has not yet waited long enough for a suitable new opportunity. | 这项不对 / Not correct. 先核对眼前例子的条件：已知的是旧时间表不再合用，仍坚持它才造成反复受阻。 / Check the conditions in this example first: The old schedule no longer fits; insisting on it causes the repeated obstacles. |

答案：A。内容ID `m10-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m10-R1 替代讲解 / Alternative explanation**

轮子帮助我们记住事情会变化。变化可能带来机会，也可能带来新的困难；变化本身并不保证好运。 / The wheel recalls changing circumstances. Change can bring opportunities or new difficulties; it does not itself guarantee good fortune.

<a id="m10-r1"></a>
**m10-R1**（已教依据：T1 与 R1）

变化与好运是同一件事吗？ / Are change and good luck identical?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 大体相同，局面转动通常意味着机会增加。 / They are broadly similar because a turning situation usually brings more opportunities. | 这项不对 / Not correct. 这个判断忽略了题目给出的条件。变化会有不同影响，需要看改变了什么、目前能怎样回应。 / This judgment overlooks a condition given in the question. Change has different effects; examine what changed and how to respond. |
| B | 不是，需要看具体条件 / No; context matters | 答对了 / Correct. 变化会有不同影响，需要看改变了什么、目前能怎样回应。 / Change has different effects; examine what changed and how to respond. |

答案：B。内容ID `m10-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m10-R2 替代讲解 / Alternative explanation**

展会改期由主办方决定，但怎样安排准备和交通，是你可以调整的。先把这两件事分开，才知道自己接下来能做什么。 / The organizer changes the date, while you can adjust preparation and travel. Separating these identifies your available next actions.

<a id="m10-r2"></a>
**m10-R2**（已教依据：T2 与 R2）

活动地点已经改变，按照刚才的讲解，先检查什么？ / The event location has changed. What should you check first?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 路线与原计划是否仍适用 / Whether the route and plan still fit | 答对了 / Correct. 地点变了，原路线和时间安排可能不合用，先检查它们才好继续准备。 / A new location may invalidate the route and timing, so check them before proceeding. |
| B | 如何让过去的安排从未发生 / How to undo the past | 这项不对 / Not correct. 已经发生的改动不能靠愿望取消；本课讲的是调整接下来的安排。 / Wishing cannot undo a past change; the lesson concerns adapting future plans. |

答案：A。内容ID `m10-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m10-R3 替代讲解 / Alternative explanation**

事情接连不顺，不必认定是自己被诅咒。先看看实际情况是否已经变化，而自己还在按旧安排做。 / Repeated setbacks need not mean a curse. Check whether circumstances have changed while you are still following an old plan.

<a id="m10-r3"></a>
**m10-R3**（已教依据：T3 与 R3）

情况已经变化，按旧安排做又接连受阻，可以先怎样调整？ / Circumstances have changed and the old plan keeps failing. What can change first?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先等局面稳定，再决定要不要修改原来的安排。 / Wait for the situation to settle before deciding whether to revise the original plan. | 这项不对 / Not correct. 先别按这个做法继续；把旧安排改成适合现在情况的安排，才回应了已知阻碍。 / Do not continue with this approach yet; Updating the plan to fit present circumstances addresses the identified obstacle. |
| B | 更新不合适的安排 / Update the unsuitable plan | 答对了 / Correct. 把旧安排改成适合现在情况的安排，才回应了已知阻碍。 / Updating the plan to fit present circumstances addresses the identified obstacle. |

答案：B。内容ID `m10-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m10-v1"></a>
**m10-V1**（已教依据：T1 与 T2）

图书馆临时闭馆，怎样运用命运之轮的含义继续安排学习？ / How can the Wheel of Fortune inform study plans when the library closes temporarily?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 根据新条件寻找替代学习地点 / Find another place under the new conditions | 答对了 / Correct. 闭馆是外部变化，换个学习地点是自己能够作出的调整。 / The closure is external; finding another study place is an available adjustment. |
| B | 先暂停学习，等图书馆重新开放后再按原计划继续。 / Pause studying and resume the original plan after the library reopens. | 这项不对 / Not correct. 这个做法没有解决眼前的情况。闭馆是外部变化，换个学习地点是自己能够作出的调整。 / This action does not resolve the situation described. The closure is external; finding another study place is an available adjustment. |

答案：A。内容ID `m10-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“轮子帮助我们记住事情会变化。变化可能带来机会，也可能带来新的困难；变化本身并不保证好运。 / The wheel recalls changing circumstances. Change can bring opportunities or new difficulties; it does not itself guarantee good fortune.”；Q2 使用“展会改期由主办方决定，但怎样安排准备和交通，是你可以调整的。先把这两件事分开，才知道自己接下来能做什么。 / The organizer changes the date, while you can adjust preparation and travel. Separating these identifies your available next actions.”；Q3 使用“事情接连不顺，不必认定是自己被诅咒。先看看实际情况是否已经变化，而自己还在按旧安排做。 / Repeated setbacks need not mean a curse. Check whether circumstances have changed while you are still following an old plan.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“命运之轮关注周期、转折和不完全受个人控制的变化。它提醒观察时机并调整，不承诺变化必定带来好运。 / The Wheel of Fortune concerns cycles, turning points and change beyond personal control. Notice timing and adapt; change does not guarantee good luck.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m11"></a>
### m11｜正义 / Justice

**目标、基础与范围**：理解 正义 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m11.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_11_Justice.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m11-T1 完整含义 / Meaning**

正义关注事实、公平、责任与选择的后果。它要求核对依据和规则，再作判断；不是保证自己一定被判为正确。 / Justice concerns facts, fairness, responsibility and consequences. Examine evidence and rules before judging; it does not guarantee that your side is right.

**画面联系 / Picture connection**

人物持天平和直立宝剑。天平帮助记住衡量，宝剑帮助记住清楚判断；画面不提供某个现实争议的全部证据。 / The figure holds scales and an upright sword. They help recall weighing evidence and clear judgment, not the facts of a real dispute.

**关键词整理 / Recall labels**

关键词：公平、事实、责任、后果。编号XI只作识牌信息，本课不加入额外数字公式。 / Recall labels: fairness, facts, responsibility, consequences. XI identifies this card; no extra numerical formula is required.

**m11-T2 正位应用 / Upright application**

建议位：两位同事对工作量有争议，先核对约定、实际任务和记录，再讨论责任。不是因为抽到正义就证明其中一人有错。 / Advice: colleagues dispute workload. Check agreements, tasks and records before discussing responsibility. The card does not prove either person guilty.

**m11-T3 后续逆位深化 / Later reversal study**

逆位示例：评选对不同人使用不同标准。这里关注对不同人区别对待的不公平，建议查清情况，并按同一标准评选。 / Reversed example: different candidates are judged by inconsistent standards. This highlights bias and unfairness; clarify and apply the standards consistently.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m11-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

天平→宝剑；终态并列“核对依据／承担后果”。 / Scales, then sword; end with “check evidence / accept consequences”.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m11-q1"></a>
**m11-Q1**（已教依据：T1）

正义首先要求什么？ / What does Justice first require?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先找到对自己最有利的规则解释，再准备论据。 / Find the interpretation of the rules that favors you, then prepare supporting arguments. | 这项不对 / Not correct. 这个说法混淆了题目正在考的含义。先核对事实，再按规则判断，才能说明结论为什么公平。 / This statement confuses the meaning being tested. Facts checked against rules provide reasons for a fair judgment. |
| B | 核对事实和规则 / Examine facts and rules | 答对了 / Correct. 先核对事实，再按规则判断，才能说明结论为什么公平。 / Facts checked against rules provide reasons for a fair judgment. |

答案：B。内容ID `m11-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m11-q2"></a>
**m11-Q2**（已教依据：T2）

工作量争议先怎么做？ / What first in the workload dispute?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 对照约定与任务记录 / Compare agreements and records | 答对了 / Correct. 约定说明本来由谁做什么，任务记录说明实际做了什么，两者可以一起核对。 / Agreements show assigned work; task records show actual work, allowing comparison. |
| B | 宣布牌证明对方错误 / Say the card proves the other person wrong | 这项不对 / Not correct. 抽到正义没有增加任务记录或证据，不能据此证明谁错了。 / Drawing Justice adds no task records or evidence and does not establish blame. |

答案：A。内容ID `m11-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m11-q3"></a>
**m11-Q3**（已教依据：T3）

评选对不同人用了不同标准。在这个逆位例子里，正义提醒检查什么？ / What does reversed Justice highlight when different standards are applied to different people?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 评选结果得到多数人接受，就可以视为标准足够公平。 / If most people accept the result, the standard can be treated as fair enough. | 这项不对 / Not correct. 这个解释把牌义带到了别处。问题是标准使用不一致，查清并统一使用标准才回应了它。 / This interpretation shifts the card meaning elsewhere. Inconsistent standards are the problem; checking and applying them consistently addresses it. |
| B | 检查偏差并统一标准 / Check bias and apply consistent criteria | 答对了 / Correct. 问题是标准使用不一致，查清并统一使用标准才回应了它。 / Inconsistent standards are the problem; checking and applying them consistently addresses it. |

答案：B。内容ID `m11-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m11-R1 替代讲解 / Alternative explanation**

公平不等于我获胜。先核对事实，再看同样的情况是否用了同样的规则、每个人应承担什么责任。 / Fairness does not mean that I win. Check facts, consistent rules for comparable cases, and each person’s responsibility.

<a id="m11-r1"></a>
**m11-R1**（已教依据：T1 与 R1）

怎样辨认公平的判断？ / What supports a fair judgment?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 对同类情况使用同一标准 / Use consistent criteria for comparable cases | 答对了 / Correct. 同类情况用同一标准，才不会因为对象不同而随意改变判断。 / Consistent criteria for comparable cases prevent arbitrary changes based on the person. |
| B | 先定赢家再找理由 / Choose a winner before reasons | 这项不对 / Not correct. 先选赢家再补理由，是让证据迁就结论，没有先公平比较。 / Picking a winner first makes evidence serve a conclusion rather than a fair comparison. |

答案：A。内容ID `m11-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m11-R2 替代讲解 / Alternative explanation**

先把“我觉得”与任务记录分开，再协商分工；不要拿牌替任何一方作证。 / Separate impressions from task records, then negotiate. A card cannot testify for either side.

<a id="m11-r2"></a>
**m11-R2**（已教依据：T2 与 R2）

团队分工重新协商要带什么？ / What helps renegotiate teamwork?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 带上自己认为更合理的分工方案。 / Bring the division of work that you personally consider more reasonable. | 这项不对 / Not correct. 这里要分清牌义的边界：记录可以共同核对，帮助大家按实际工作讨论分工。 / The boundary of the card meaning matters here: Shared records let people discuss responsibilities using actual work. |
| B | 实际任务与约定记录 / Records of tasks and agreements | 答对了 / Correct. 记录可以共同核对，帮助大家按实际工作讨论分工。 / Shared records let people discuss responsibilities using actual work. |

答案：B。内容ID `m11-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m11-R3 替代讲解 / Alternative explanation**

修正不公平，需要检查标准怎样使用，不是换一个自己喜欢的赢家。 / Correcting unfairness requires checking how standards are applied, not choosing a preferred winner.

<a id="m11-r3"></a>
**m11-R3**（已教依据：T3 与 R3）

要改正刚才例子中不公平的评选，应该改什么？ / What should change to correct the unfair judging in the example?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 标准的使用方式 / How criteria are applied | 答对了 / Correct. 检查同类情况是否用了同一标准，才能修正例子里的区别对待。 / Checking consistent treatment addresses the unequal standards in the example. |
| B | 只换成喜欢的获奖者 / Merely choose a preferred winner | 这项不对 / Not correct. 换成喜欢的人获奖，没有改变评选偏向个人喜好的问题。 / Selecting a preferred winner preserves favoritism. |

答案：A。内容ID `m11-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m11-v1"></a>
**m11-V1**（已教依据：T1 与 T2）

社团报销发生争议，怎样运用正义的含义？ / How can Justice apply to a dispute over club reimbursements?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 用抽牌决定谁撒谎 / Draw to decide who is lying | 这项不对 / Not correct. 牌没有查验票据或对话，不能用来认定某个人撒谎。 / The card has not verified receipts or statements and cannot establish lying. |
| B | 核对票据与事先规则 / Check receipts and agreed rules | 答对了 / Correct. 票据说明花了什么，事先规则说明哪些可报销，能据此核对争议。 / Receipts show spending and agreed rules show eligibility, providing grounds to examine the dispute. |

答案：B。内容ID `m11-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“公平不等于我获胜。先核对事实，再看同样的情况是否用了同样的规则、每个人应承担什么责任。 / Fairness does not mean that I win. Check facts, consistent rules for comparable cases, and each person’s responsibility.”；Q2 使用“先把“我觉得”与任务记录分开，再协商分工；不要拿牌替任何一方作证。 / Separate impressions from task records, then negotiate. A card cannot testify for either side.”；Q3 使用“修正不公平，需要检查标准怎样使用，不是换一个自己喜欢的赢家。 / Correcting unfairness requires checking how standards are applied, not choosing a preferred winner.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“正义关注事实、公平、责任与选择的后果。它要求核对依据和规则，再作判断；不是保证自己一定被判为正确。 / Justice concerns facts, fairness, responsibility and consequences. Examine evidence and rules before judging; it does not guarantee that your side is right.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m12"></a>
### m12｜倒吊人 / The Hanged Man

**目标、基础与范围**：理解 倒吊人 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m12.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_12_Hanged_Man.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m12-T1 完整含义 / Meaning**

倒吊人表达暂停、放下原来的做法，以及换个角度理解问题。一直沿用同一种办法想不通时，停下来重新看，可能发现以前没注意的地方；并不是只要等待就会有答案。 / The Hanged Man represents pausing, releasing an old approach and seeing differently. When one approach fails, reconsidering may reveal something overlooked; waiting alone does not guarantee answers.

**画面联系 / Picture connection**

人物倒悬，姿态相对平静，头部有光环。倒置帮助记住视角改变；不能由此要求人在现实中承受伤害。 / A figure hangs upside down with a relatively calm posture and halo. Inversion suggests a changed perspective; it is not an instruction to endure harm.

**关键词整理 / Recall labels**

关键词：暂停、换角度、放手、等待。编号XII不在本课拆成数字运算。 / Recall labels: pause, perspective, letting go, waiting. XII is not reduced through arithmetic here.

**m12-T2 正位应用 / Upright application**

建议位：设计一直改颜色却没解决用户看不清信息的问题。暂停修改，先按读者阅读的先后顺序，检查信息怎样摆放。 / Advice: repeated color changes have not made a design readable. Pause editing and examine information placement in the order readers encounter it.

**m12-T3 后续逆位深化 / Later reversal study**

逆位示例：一直说等一等，却不收集信息也不尝试新角度。这里关注停滞和无效等待。 / Reversed example: repeatedly waiting without gathering information or considering another perspective. Here the issue is stagnation and unproductive delay.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m12-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

完整牌图→倒置姿态轮廓；旁侧视角标签从“我怎么改”切到“读者怎么看”，原画不变。 / Highlight the inverted posture; change a side label from “how I edit” to “how readers see”, keeping the artwork unchanged.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m12-q1"></a>
**m12-Q1**（已教依据：T1）

倒吊人的暂停为了什么？ / What is the pause for?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先停下原来的做法，换个角度看问题 / Pause the old approach and view the problem differently | 答对了 / Correct. 暂时不沿用原来的做法，才能尝试从读者等其他角度理解问题。 / Pausing the old approach allows another perspective, such as the reader’s. |
| B | 先保持停顿，让答案随着时间逐渐显现。 / Remain paused and let the answer gradually reveal itself over time. | 这项不对 / Not correct. 这里要分清牌义的边界：暂时不沿用原来的做法，才能尝试从读者等其他角度理解问题。 / The boundary of the card meaning matters here: Pausing the old approach allows another perspective, such as the reader’s. |

答案：A。内容ID `m12-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m12-q2"></a>
**m12-Q2**（已教依据：T2）

设计改了很多次颜色，读者还是看不清信息。按照刚才的示范，先做什么？ / Colors have changed repeatedly but readers still struggle. What comes first in the example?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 继续随机换颜色 / Keep changing colours randomly | 这项不对 / Not correct. 前面已经试过反复改颜色却无效，再做同样的事没有换角度。 / Repeated color changes have failed; repeating them does not change perspective. |
| B | 按读者阅读的先后顺序检查信息摆放 / Check information placement in the order readers encounter it | 答对了 / Correct. 改从读者怎样看到信息来检查，才从“我怎么改”转向“读者怎么看”。 / Examining how readers encounter information changes the perspective from editing to reading. |

答案：B。内容ID `m12-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m12-q3"></a>
**m12-Q3**（已教依据：T3）

逆位示例为什么停滞？ / Why is the reversed example stagnant?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 等待没带来信息或新角度 / Waiting brings no information or perspective | 答对了 / Correct. 例子明确说没有收集信息，也没有换角度，只等着并未帮助理解。 / The example supplies neither new information nor a new perspective, so waiting has not helped understanding. |
| B | 暂停时间还不够长，需要继续等到想法自然变化。 / The pause has not lasted long enough; keep waiting for the perspective to change naturally. | 这项不对 / Not correct. 这个说法混淆了题目正在考的含义。例子明确说没有收集信息，也没有换角度，只等着并未帮助理解。 / This statement confuses the meaning being tested. The example supplies neither new information nor a new perspective, so waiting has not helped understanding. |

答案：A。内容ID `m12-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m12-R1 替代讲解 / Alternative explanation**

停下来后，还要试着从别的角度看问题。只是不动手，却仍然按原来的想法理解，就还没有换角度。 / After pausing, try another perspective. Merely stopping while retaining the same understanding does not change perspective.

<a id="m12-r1"></a>
**m12-R1**（已教依据：T1 与 R1）

什么使暂停有价值？ / What makes a pause useful?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 暂停能让情绪降下来，之后继续原来的做法。 / The pause can settle the emotion before resuming the original approach. | 这项不对 / Not correct. 这里要分清牌义的边界：停下来重新检查原来的理解，才用到了暂停后换角度的含义。 / The boundary of the card meaning matters here: Reexamining the original understanding uses the pause to change perspective. |
| B | 帮助重新理解问题 / It helps reconsider the problem | 答对了 / Correct. 停下来重新检查原来的理解，才用到了暂停后换角度的含义。 / Reexamining the original understanding uses the pause to change perspective. |

答案：B。内容ID `m12-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m12-R2 替代讲解 / Alternative explanation**

读者看不清信息时，可以按他们阅读的顺序，检查标题、正文等内容放在哪里；不必继续只改颜色。 / When information is unclear to readers, inspect the placement of headings and text in reading order instead of only changing colors.

<a id="m12-r2"></a>
**m12-R2**（已教依据：T2 与 R2）

反复使用同一种修改方法仍然无效，下一步怎样做？ / What comes next when repeating the same change has not worked?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 检查原先对问题的理解 / Reconsider your definition of the problem | 答对了 / Correct. 原办法无效时，先检查是不是把问题想错了，才可能找到另一种做法。 / When an approach fails, reconsidering the problem can reveal another approach. |
| B | 把同样修改再做十遍 / Repeat it ten more times | 这项不对 / Not correct. 重复十遍仍是同一种办法，没有回应前面已经发现的无效。 / Ten repetitions remain the same approach and do not address its failure. |

答案：A。内容ID `m12-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m12-R3 替代讲解 / Alternative explanation**

等待有没有作用，要看它是否带来必要信息或理解；这里明确两者都没有。 / Ask whether waiting brings useful information or understanding; this example explicitly brings neither.

<a id="m12-r3"></a>
**m12-R3**（已教依据：T3 与 R3）

一直等待，却没有获得新信息，可以怎样调整？ / How can waiting be adjusted when it brings no new information?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 继续观察一段时间，看答案会不会逐渐出现。 / Keep observing for a while and see whether an answer gradually appears. | 这项不对 / Not correct. 这样做会漏掉题目里的关键一步。先知道自己还不清楚什么，再去核实，等待才不只是空耗时间。 / This action skips a key step in the question. Identifying and checking what is unknown gives waiting a purpose beyond elapsed time. |
| B | 明确还缺什么信息并去核实 / Identify and check missing information | 答对了 / Correct. 先知道自己还不清楚什么，再去核实，等待才不只是空耗时间。 / Identifying and checking what is unknown gives waiting a purpose beyond elapsed time. |

答案：B。内容ID `m12-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m12-v1"></a>
**m12-V1**（已教依据：T1 与 T2）

反复逐字读，还是不理解一句话。怎样运用倒吊人的含义？ / How can the Hanged Man apply when repeated word-by-word reading brings no understanding?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 暂停逐字硬读，结合上下文重看 / Pause word-by-word struggle and reread in context | 答对了 / Correct. 从单个字转向前后文，是改变理解的角度，并没有停止学习。 / Moving from individual words to context changes perspective without abandoning study. |
| B | 暂停阅读，等精神更好时再从同一句重新读起。 / Pause the reading and return to the same sentence when concentration improves. | 这项不对 / Not correct. 先别按这个做法继续；从单个字转向前后文，是改变理解的角度，并没有停止学习。 / Do not continue with this approach yet; Moving from individual words to context changes perspective without abandoning study. |

答案：A。内容ID `m12-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“停下来后，还要试着从别的角度看问题。只是不动手，却仍然按原来的想法理解，就还没有换角度。 / After pausing, try another perspective. Merely stopping while retaining the same understanding does not change perspective.”；Q2 使用“读者看不清信息时，可以按他们阅读的顺序，检查标题、正文等内容放在哪里；不必继续只改颜色。 / When information is unclear to readers, inspect the placement of headings and text in reading order instead of only changing colors.”；Q3 使用“等待有没有作用，要看它是否带来必要信息或理解；这里明确两者都没有。 / Ask whether waiting brings useful information or understanding; this example explicitly brings neither.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“倒吊人表达暂停、放下原来的做法，以及换个角度理解问题。一直沿用同一种办法想不通时，停下来重新看，可能发现以前没注意的地方；并不是只要等待就会有答案。 / The Hanged Man represents pausing, releasing an old approach and seeing differently. When one approach fails, reconsidering may reveal something overlooked; waiting alone does not guarantee answers.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m13"></a>
### m13｜死神 / Death

**目标、基础与范围**：理解 死神 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m13.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_13_Death.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m13-T1 完整含义 / Meaning**

死神常说一件事告一段落，需要结束已经不适用的做法，再开始下一阶段。它让我们面对该结束的事，不是在预告有人死亡。 / Death often describes something coming to an end: leave behind an approach that no longer fits and move into the next stage. It asks us to face an ending, not predict someone’s death.

**画面联系 / Picture connection**

骷髅骑士前行，画面中有不同人物，远处可见光。前行与变化的场面帮助记住结束和过渡，不是现实死亡证据。 / A skeletal rider advances among different figures, with light in the distance. The scene supports remembering endings and transition, not evidence of a real death.

**关键词整理 / Recall labels**

关键词：结束、告别、转变、更新。变化之后不一定马上觉得轻松。可以先承认这件事已经结束，再慢慢适应。 / Recall labels: ending, farewell, transition, renewal. Change may not bring immediate relief. Acknowledge that something has ended and give yourself time to adjust.

**m13-T2 正位应用 / Upright application**

建议位：一个已完成的社团活动还占着你的时间，文件和职责没有收尾。整理交接，结束旧任务，才能腾出时间与精力开始下一阶段。 / Advice: a completed club event still consumes time because files and duties remain open. Finish the handover and close the old task to make room for the next stage.

**m13-T3 后续逆位深化 / Later reversal study**

逆位示例：明知旧项目已经结束，仍不愿交接，继续重复已经没有作用的工作。这里要留意不愿承认结束的情况，不能理解成项目会自动重新开始。 / Reversed example: a finished project is not handed over, and useless work continues. Notice reluctance to accept an ending; it does not promise automatic revival.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m13-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

骑士前行方向→远处光；终态“旧阶段结束／进入过渡”，不让人物消失。 / Follow the rider’s direction, then distant light; end with “ending / transition”, without making figures disappear.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m13-q1"></a>
**m13-Q1**（已教依据：T1）

本课讲的死神，主要表达什么意思？ / What does Death mainly express in this lesson?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 经历重大变化时，重点在原来的生活被打乱和失去。 / In a major change, the focus is disruption of the previous life and loss. | 这项不对 / Not correct. 这项说法只写生活被打乱和失去，缺少死神所强调的阶段结束、收尾与转变。 / This describes disruption and loss as the focus and leaves out the ending, closure, and transition taught for Death. |
| B | 阶段结束与转变 / Ending and transition | 答对了 / Correct. 一件事结束后，把该收尾的事处理好，再准备下一阶段，符合刚才的讲解。 / Finish what needs closing when something ends, then prepare for the next stage. This matches the explanation. |

答案：B。内容ID `m13-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m13-q2"></a>
**m13-Q2**（已教依据：T2）

已完成活动还占时间，建议是什么？ / What is the advice for the completed event?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 做交接并收尾 / Complete the handover and closure | 答对了 / Correct. 把资料和职责交接清楚，旧任务才有真正的结束，也能腾出时间做下一件事。 / Clear handover finishes the old task and frees time for the next one. |
| B | 先维持原任务，等新的安排更明确后再交接。 / Keep the old task in place until the new arrangement becomes clearer. | 这项不对 / Not correct. 先别按这个做法继续；把资料和职责交接清楚，旧任务才有真正的结束，也能腾出时间做下一件事。 / Do not continue with this approach yet; Clear handover finishes the old task and frees time for the next one. |

答案：A。内容ID `m13-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m13-q3"></a>
**m13-Q3**（已教依据：T3）

旧项目已经结束，却仍不愿交接。这个逆位例子强调什么？ / What does the reversal example emphasize when someone refuses to hand over a finished project?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 旧项目可能还有恢复机会，因此暂时不宜交接。 / The old project may still recover, so it is better to postpone the handover. | 这项不对 / Not correct. 这个解释把牌义带到了别处。知道项目已结束却不愿放手，正是例子中的抗拒。 / This interpretation shifts the card meaning elsewhere. Knowing a project has ended while refusing to let go is the resistance described. |
| B | 抗拒承认结束 / Resistance to acknowledging the end | 答对了 / Correct. 知道项目已结束却不愿放手，正是例子中的抗拒。 / Knowing a project has ended while refusing to let go is the resistance described. |

答案：B。内容ID `m13-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m13-R1 替代讲解 / Alternative explanation**

牌名有冲击力，但教学中的主题是阶段转换。要先看问题是否存在已结束的关系、习惯或任务。 / The name is striking, but the theme is transition. Look for a completed task, habit or phase in the stated context.

<a id="m13-r1"></a>
**m13-R1**（已教依据：T1 与 R1）

可以只凭“死神”这个牌名，就认定现实中有人死亡吗？ / Can the name Death alone establish that someone has died?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不可，要回到问题与阶段变化 / No; return to context and transition | 答对了 / Correct. 牌名可以提醒我们理解结束与变化，不能替代对现实事件的核实。 / The name can recall endings and change, but cannot replace checking real events. |
| B | 可以，不必看背景 / Yes, regardless of context | 这项不对 / Not correct. 跳过背景直接把牌名当事实，会把象征含义误当成已经发生的事件。 / Treating a name as fact without context mistakes symbolism for an established event. |

答案：A。内容ID `m13-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m13-R2 替代讲解 / Alternative explanation**

收尾是实在的行动：交还职责、整理资料、确认结束，不是突然丢掉所有责任。 / Closure can mean handing over duties, organising files and confirming completion, not dropping every responsibility.

<a id="m13-r2"></a>
**m13-R2**（已教依据：T2 与 R2）

收尾行动是哪一个？ / Which action provides closure?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先停止投入，等接手人主动来了解剩余事项。 / Stop investing effort and wait for the next person to ask about the remaining work. | 这项不对 / Not correct. 这个判断忽略了题目给出的条件。确认哪些做完、剩余职责由谁接手，是实际完成收尾。 / This judgment overlooks a condition given in the question. Confirming completion and transferring remaining duties provides real closure. |
| B | 确认已完成并移交剩余职责 / Confirm completion and transfer duties | 答对了 / Correct. 确认哪些做完、剩余职责由谁接手，是实际完成收尾。 / Confirming completion and transferring remaining duties provides real closure. |

答案：B。内容ID `m13-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m13-R3 替代讲解 / Alternative explanation**

不愿承认项目结束，并不能让已经结束的项目继续下去。这个逆位例子讲的是不愿放下，不是保证项目会重新开始。 / Refusing to acknowledge a finished project cannot keep it alive. This reversal concerns reluctance to let go, not guaranteed revival.

<a id="m13-r3"></a>
**m13-R3**（已教依据：T3 与 R3）

不愿结束等于不会结束吗？ / Does resisting an ending prevent it?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不等于 / No | 答对了 / Correct. 人的不舍可以影响交接，却不能让已经结束的项目自动恢复。 / Reluctance may delay handover but cannot automatically revive a finished project. |
| B | 等于 / Yes | 这项不对 / Not correct. 不愿接受结束是一种反应，不是能够改变事实的保证。 / Reluctance is a response, not a guarantee that circumstances will change. |

答案：A。内容ID `m13-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m13-v1"></a>
**m13-V1**（已教依据：T1 与 T2）

旧的学习习惯已经不适用，怎样运用死神的含义？ / How can Death apply when an old study habit no longer works?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先保留旧习惯，同时慢慢增加新的学习方式。 / Keep the old habit for now while gradually adding a new study method. | 这项不对 / Not correct. 这样做会漏掉题目里的关键一步。让不再适用的做法结束，再开始替代方法，符合告别与转变。 / This action skips a key step in the question. Ending an unsuitable approach and adopting another applies ending and transition. |
| B | 结束旧做法并建立替代方式 / Let the old approach end and build a replacement | 答对了 / Correct. 让不再适用的做法结束，再开始替代方法，符合告别与转变。 / Ending an unsuitable approach and adopting another applies ending and transition. |

答案：B。内容ID `m13-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“牌名有冲击力，但教学中的主题是阶段转换。要先看问题是否存在已结束的关系、习惯或任务。 / The name is striking, but the theme is transition. Look for a completed task, habit or phase in the stated context.”；Q2 使用“收尾是实在的行动：交还职责、整理资料、确认结束，不是突然丢掉所有责任。 / Closure can mean handing over duties, organising files and confirming completion, not dropping every responsibility.”；Q3 使用“不愿承认项目结束，并不能让已经结束的项目继续下去。这个逆位例子讲的是不愿放下，不是保证项目会重新开始。 / Refusing to acknowledge a finished project cannot keep it alive. This reversal concerns reluctance to let go, not guaranteed revival.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“死神常说一件事告一段落，需要结束已经不适用的做法，再开始下一阶段。它让我们面对该结束的事，不是在预告有人死亡。 / Death often describes something coming to an end: leave behind an approach that no longer fits and move into the next stage. It asks us to face an ending, not predict someone’s death.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m14"></a>
### m14｜节制 / Temperance

**目标、基础与范围**：理解 节制 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m14.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_14_Temperance.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m14-T1 完整含义 / Meaning**

节制表达适度、耐心和相互配合。不同的需要放在一起时，要一点点调整到合适的程度，不是所有事都各占一半，也不是压下自己的所有需要。 / Temperance expresses moderation, patience and cooperation. Different needs require gradual adjustment, not equal halves for everything or suppressing every need.

**画面联系 / Picture connection**

人物在两个杯子之间倾倒液体，一脚在水中、一脚在地面。流动与两种环境帮助记住调和；不是精确配方。 / A figure pours between two cups, with one foot in water and one on land. Flow and two settings suggest integration, not an exact recipe.

**关键词整理 / Recall labels**

关键词：适度、配合、耐心、平衡。重点是适合实际需要，不是机械地平均分配。 / Remember: moderation, cooperation, patience, balance. Fit actual needs rather than dividing everything mechanically into equal parts.

**m14-T2 正位应用 / Upright application**

建议位：备考和休息总是顾此失彼，可以先试一份自己能坚持的时间安排，再看精力是否够用，继续调整。不会因为节制就规定每天必须一半学习一半休息。 / Advice: study and rest crowd each other out. Try a sustainable schedule and adjust to energy levels; the card does not prescribe a fifty-fifty split.

**m14-T3 后续逆位深化 / Later reversal study**

逆位示例：连续熬夜后又完全停学，节奏在两端摆动。这里关注失衡与缺少协调，先把学习和休息安排到自己能够坚持的程度。 / Reversed example: all-night study alternates with abandoning study entirely. This concerns imbalance; restore a sustainable rhythm.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m14-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

两杯→水陆两处脚；旁侧两条节奏线逐渐协调，原牌液体保持原样。 / Highlight the cups and feet; side rhythm lines align while the historical liquid remains unchanged.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m14-q1"></a>
**m14-Q1**（已教依据：T1）

节制所说的平衡，应该怎样理解？ / How should the balance of Temperance be understood?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 按实际需要，调整到合适的程度 / Adjust to a level that fits actual needs | 答对了 / Correct. 不同人、不同任务需要的安排不一样，合适比固定比例更重要。 / Different people and tasks need different arrangements; suitability matters more than a fixed ratio. |
| B | 在几个需要之间轮流补齐，尽量让每项投入接近。 / Alternate among the needs and try to keep the investment in each one similar. | 这项不对 / Not correct. 这样做会漏掉题目里的关键一步。不同人、不同任务需要的安排不一样，合适比固定比例更重要。 / This action skips a key step in the question. Different people and tasks need different arrangements; suitability matters more than a fixed ratio. |

答案：A。内容ID `m14-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m14-q2"></a>
**m14-Q2**（已教依据：T2）

在备考与休息总是顾此失彼的例子里，哪种做法符合刚才的示范？ / Which action fits the study-and-rest example?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 把学习和休息固定成相等时段，先用统一比例稳定节奏。 / Fix study and rest into equal blocks and use one ratio to stabilize the rhythm. | 这项不对 / Not correct. 先别按这个做法继续；先试再按实际精力调整，才能找到学习和休息都能兼顾的安排。 / Do not continue with this approach yet; Trying and adjusting to actual energy can produce workable study and rest. |
| B | 先试一份能坚持的安排，再按精力调整 / Try a manageable schedule and adjust it to your energy | 答对了 / Correct. 先试再按实际精力调整，才能找到学习和休息都能兼顾的安排。 / Trying and adjusting to actual energy can produce workable study and rest. |

答案：B。内容ID `m14-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m14-q3"></a>
**m14-Q3**（已教依据：T3）

连续熬夜后又完全停学。这个逆位例子中，需要改进什么？ / What needs changing in the reversal example of all-nighters followed by stopping study completely?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 熬夜后又完全停学的反复 / The cycle of all-nighters followed by stopping study | 答对了 / Correct. 问题正是熬夜后又完全停止，需要减少这两种极端之间的反复。 / The problem is swinging from all-nighters to stopping completely; reduce that swing. |
| B | 自己还不够拼命 / Not pushing yourself hard enough | 这项不对 / Not correct. 例子已经过于极端，更加极端地努力会延续原来的问题。 / Greater extremes would continue the very problem described. |

答案：A。内容ID `m14-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m14-R1 替代讲解 / Alternative explanation**

这就像调水温：先看看水温是否合适，再一点点加冷水或热水，不是规定冷热水永远各一半。 / This resembles adjusting water temperature: add cold or hot water gradually as needed, rather than requiring equal quantities.

<a id="m14-r1"></a>
**m14-R1**（已教依据：T1 与 R1）

为什么节制不要求学习和休息永远各占一半？ / Why does Temperance not require study and rest always to be split equally?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 调和应该先定一个固定比例，条件变化后也继续照做。 / Balance should begin with a fixed ratio and keep that ratio when conditions change. | 这项不对 / Not correct. 这个解释把牌义带到了别处。实际精力和任务量会变化，所以合适的时间分配也可能变化。 / This interpretation shifts the card meaning elsewhere. Energy and workload vary, so suitable time allocations may vary too. |
| B | 需求和条件会不同 / Needs and conditions vary | 答对了 / Correct. 实际精力和任务量会变化，所以合适的时间分配也可能变化。 / Energy and workload vary, so suitable time allocations may vary too. |

答案：B。内容ID `m14-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m14-R2 替代讲解 / Alternative explanation**

新安排先试着做，再看精力够不够、任务能不能按时完成；不合适的地方再慢慢改。 / Try a schedule, check whether energy is sufficient and tasks can be completed, then gradually revise unsuitable parts.

<a id="m14-r2"></a>
**m14-R2**（已教依据：T2 与 R2）

新安排试行后看什么？ / What do you review after trying a schedule?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 精力是否够用，任务能否按这个节奏完成 / Whether energy is sufficient and tasks can be completed at this pace | 答对了 / Correct. 这些情况能告诉你安排是否做得下去，哪里需要减少或增加。 / These checks show whether the schedule works and where it needs adjustment. |
| B | 是否严格复制别人作息 / Whether it copies someone else exactly | 这项不对 / Not correct. 别人的精力和任务可能不同，照搬作息不能说明适合自己。 / Someone else’s energy and workload may differ; copying does not establish suitability. |

答案：A。内容ID `m14-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m14-R3 替代讲解 / Alternative explanation**

逆位例不是要求更极端地控制自己，而是减少在两端来回摆动。 / The reversal does not call for harsher control; reduce the swing between extremes.

<a id="m14-r3"></a>
**m14-R3**（已教依据：T3 与 R3）

要减少熬夜和完全停学之间的反复，可以先怎样做？ / What can reduce the swing between all-nighters and stopping study?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 把每天学习时间定得更长，即使睡眠不足也先坚持。 / Set a longer daily study period and keep going even when sleep is insufficient. | 这项不对 / Not correct. 睡眠不足时仍拉长学习时间，延续了过度用力；节制要找的是能长期保持的学习和休息节奏。 / Extending study while losing sleep continues the same overexertion; Temperance asks for a study-and-rest rhythm you can sustain. |
| B | 先安排一段能坚持的学习和休息时间 / Start with manageable study and rest periods | 答对了 / Correct. 从能坚持的时段开始，再逐渐调整，才有机会不再反复走向极端。 / Manageable periods followed by gradual adjustment can reduce repeated extremes. |

答案：B。内容ID `m14-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m14-v1"></a>
**m14-V1**（已教依据：T1 与 T2）

合作双方做事速度不同，怎样运用节制的含义？ / How can Temperance apply when collaborators work at different speeds?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 商定衔接节奏并试着调整 / Agree on a shared rhythm and adjust it | 答对了 / Correct. 商定怎样衔接工作，再根据实际情况调整，能让不同速度也配合起来。 / Agreed handoffs and adjustment can coordinate different working speeds. |
| B | 让较慢的一方跟上较快的一方，把流程统一到同一速度。 / Have the slower side catch up with the faster side so the process runs at one speed. | 这项不对 / Not correct. 这个做法没有解决眼前的情况。商定怎样衔接工作，再根据实际情况调整，能让不同速度也配合起来。 / This action does not resolve the situation described. Agreed handoffs and adjustment can coordinate different working speeds. |

答案：A。内容ID `m14-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“这就像调水温：先看看水温是否合适，再一点点加冷水或热水，不是规定冷热水永远各一半。 / This resembles adjusting water temperature: add cold or hot water gradually as needed, rather than requiring equal quantities.”；Q2 使用“新安排先试着做，再看精力够不够、任务能不能按时完成；不合适的地方再慢慢改。 / Try a schedule, check whether energy is sufficient and tasks can be completed, then gradually revise unsuitable parts.”；Q3 使用“逆位例不是要求更极端地控制自己，而是减少在两端来回摆动。 / The reversal does not call for harsher control; reduce the swing between extremes.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“节制表达适度、耐心和相互配合。不同的需要放在一起时，要一点点调整到合适的程度，不是所有事都各占一半，也不是压下自己的所有需要。 / Temperance expresses moderation, patience and cooperation. Different needs require gradual adjustment, not equal halves for everything or suppressing every need.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m15"></a>
### m15｜恶魔 / The Devil

**目标、基础与范围**：理解 恶魔 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m15.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_15_Devil.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m15-T1 完整含义 / Meaning**

恶魔表达束缚、依赖和难以摆脱的诱惑。有些事短暂让人舒服，却让人越来越难停下来，挤掉原本想做的事。它不证明有人邪恶或受到了诅咒。 / The Devil represents constraint, dependence and hard-to-resist temptation. Something briefly comforting can become hard to stop and crowd out intended activities. It does not establish evil or a curse.

**画面联系 / Picture connection**

人物被链条连接在座前，链圈看起来有松动空间。链条帮助记住束缚，松动空间提醒检查可改变之处；不表示所有现实限制都容易解除。 / Figures are chained before a pedestal, with apparently loose loops. Chains recall constraint; the space invites examining possible change, not assuming every real constraint is easy to escape.

**关键词整理 / Recall labels**

关键词：束缚、依赖、诱惑、难以停下。留意想停却不容易停的处境，不要据此判断一个人的好坏。 / Remember: constraint, dependence, temptation, difficulty stopping. Notice the hard-to-stop situation rather than judging a person’s worth.

**m15-T2 正位应用 / Upright application**

建议位：总忍不住刷新短视频，已经挤掉计划中的练习时间。先留意自己什么时候开始刷、为什么停不下来，再给使用时间作具体限制，不必把自己骂成没有价值的人。 / Advice: repeated video scrolling crowds out planned practice. Notice when it starts and why it continues, then set concrete time limits instead of condemning your worth.

**m15-T3 后续逆位深化 / Later reversal study**

逆位示例：已经看见刷屏的代价，并开始关掉自动播放。这里可以理解为开始改变让自己停不下来的习惯，不保证从此再无反复。 / Reversed example: recognising the cost of scrolling and disabling autoplay. This can suggest beginning to loosen a pattern, not a guarantee of no recurrence.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m15-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

链条→链圈空间；终态“看见代价／检查选择”，不播放自动断链。 / Highlight chains and loop space; end with “notice cost / examine choices”, without magically breaking the chains.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m15-q1"></a>
**m15-Q1**（已教依据：T1）

恶魔在本课关注什么？ / What does the Devil focus on here?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 证明某人邪恶 / Proving someone evil | 这项不对 / Not correct. 这张牌讨论让人难以停下的依赖，不能用来证明某个人邪恶。 / The card discusses constraining dependence, not proof that a person is evil. |
| B | 越来越依赖某种习惯，想停却不容易停 / Becoming dependent on a habit that is hard to stop | 答对了 / Correct. 想停却很难停，连原本计划也受影响，正体现了本课的束缚与依赖。 / Difficulty stopping despite effects on other plans expresses the taught constraint and dependence. |

答案：B。内容ID `m15-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m15-q2"></a>
**m15-Q2**（已教依据：T2）

总忍不住刷短视频，练习时间因此被挤掉。哪种建议符合刚才的示范？ / Scrolling crowds out planned practice. Which advice fits the example?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 留意何时开始刷，并限制使用时间 / Notice when scrolling starts and limit usage time | 答对了 / Correct. 知道什么时候容易开始刷，再限制使用时间，才是在改变具体习惯。 / Noticing when scrolling begins and limiting time addresses the specific habit. |
| B | 给自己设置更严格的练习目标，用任务压力压住刷视频的冲动。 / Set a stricter practice target and use task pressure to suppress the urge to watch short videos. | 这项不对 / Not correct. 先别按这个做法继续；知道什么时候容易开始刷，再限制使用时间，才是在改变具体习惯。 / Do not continue with this approach yet; Noticing when scrolling begins and limiting time addresses the specific habit. |

答案：A。内容ID `m15-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m15-q3"></a>
**m15-Q3**（已教依据：T3）

看见刷屏的代价后，开始关闭自动播放。这个逆位例子说明什么？ / What does the reversal example show when autoplay is turned off after recognizing the cost of scrolling?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 已经看清诱因，之后主要靠意志力避免再次发生。 / Now that the trigger is clear, rely mainly on willpower to prevent it from happening again. | 这项不对 / Not correct. 这里要分清牌义的边界：已经采取具体行动，开始减少原来让自己不断刷下去的影响。 / The boundary of the card meaning matters here: A concrete action begins reducing what previously kept the scrolling going. |
| B | 开始改变让自己停不下来的习惯 / Begin changing a hard-to-stop habit | 答对了 / Correct. 已经采取具体行动，开始减少原来让自己不断刷下去的影响。 / A concrete action begins reducing what previously kept the scrolling going. |

答案：B。内容ID `m15-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m15-R1 替代讲解 / Alternative explanation**

一件事当下让人舒服，也可能慢慢占掉时间、让人难以停下。要同时看到它为什么吸引自己，以及为此放弃了什么。 / Something comforting now may take increasing time and become hard to stop. Consider both its attraction and what it costs.

<a id="m15-r1"></a>
**m15-R1**（已教依据：T1 与 R1）

短暂舒服是否可能伴随限制？ / Can short-term comfort coexist with restriction?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 可以，要一起看吸引与代价 / Yes; consider both attraction and cost | 答对了 / Correct. 刷视频可以当下轻松，同时挤掉练习时间，舒服与付出代价可以并存。 / Scrolling can feel relaxing while taking practice time; comfort and cost can coexist. |
| B | 短暂舒服说明眼前需求得到满足，限制可以以后再看。 / Short-term comfort shows the immediate need is met; restrictions can be considered later. | 这项不对 / Not correct. 这个判断忽略了题目给出的条件。刷视频可以当下轻松，同时挤掉练习时间，舒服与付出代价可以并存。 / This judgment overlooks a condition given in the question. Scrolling can feel relaxing while taking practice time; comfort and cost can coexist. |

答案：A。内容ID `m15-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m15-R2 替代讲解 / Alternative explanation**

把“我不行”换成具体问题：什么时候打开、什么让你一直刷下去、可以先限制哪一段使用时间。 / Replace “I am incapable” with specific questions: when does scrolling start, what keeps it going, and which period of use can you limit first?

<a id="m15-r2"></a>
**m15-R2**（已教依据：T2 与 R2）

想改变停不下来的刷屏习惯，先问自己哪一个问题？ / Which question helps examine a hard-to-stop scrolling habit?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先问自己怎样增强意志力，避免下一次点开。 / First ask how to strengthen willpower so you do not open it next time. | 这项不对 / Not correct. 先核对眼前例子的条件：问清什么情况让自己一直刷，才可能找到具体能调整的地方。 / Check the conditions in this example first: Understanding what keeps scrolling going helps identify a specific change. |
| B | 什么场景让我不断继续 / What situation keeps the behaviour going | 答对了 / Correct. 问清什么情况让自己一直刷，才可能找到具体能调整的地方。 / Understanding what keeps scrolling going helps identify a specific change. |

答案：B。内容ID `m15-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m15-R3 替代讲解 / Alternative explanation**

这个逆位例子已经有了关闭自动播放的行动。看清习惯不等于已经改掉，还要看之后能否继续做到。 / The reversal example includes disabling autoplay. Recognizing a habit does not mean it is changed; continued action still matters.

<a id="m15-r3"></a>
**m15-R3**（已教依据：T3 与 R3）

已经看见习惯怎样限制自己，接下来还需要什么？ / After recognizing how a habit constrains you, what is still needed?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 具体改变与持续观察 / Concrete change and monitoring | 答对了 / Correct. 发现问题后仍要采取改变，并看看是否有用，才不只停在知道这一步。 / Recognition still needs action and observation of whether the change helps. |
| B | 继续分析习惯的原因，等理解得更充分后再行动。 / Keep analyzing the habit and act after the causes are understood more fully. | 这项不对 / Not correct. 这样做会漏掉题目里的关键一步。发现问题后仍要采取改变，并看看是否有用，才不只停在知道这一步。 / This action skips a key step in the question. Recognition still needs action and observation of whether the change helps. |

答案：A。内容ID `m15-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m15-v1"></a>
**m15-V1**（已教依据：T1 与 T2）

冲动购物已经挤占预算，怎样运用恶魔的含义？ / How can the Devil apply when impulse shopping crowds out the budget?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 用牌断言商家在诅咒自己 / Claim the seller has cursed you | 这项不对 / Not correct. 冲动消费没有提供被诅咒的证据，牌也不能代替这种证明。 / Impulse spending supplies no evidence of a curse, and the card cannot establish one. |
| B | 看清诱因和代价，设置购买边界 / Examine triggers and costs, then set boundaries | 答对了 / Correct. 检查购买冲动从哪里来、挤掉了哪些预算，再限制购买，回应了依赖与代价。 / Examining impulses and budget costs before setting limits addresses dependence and its cost. |

答案：B。内容ID `m15-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“一件事当下让人舒服，也可能慢慢占掉时间、让人难以停下。要同时看到它为什么吸引自己，以及为此放弃了什么。 / Something comforting now may take increasing time and become hard to stop. Consider both its attraction and what it costs.”；Q2 使用“把“我不行”换成具体问题：什么时候打开、什么让你一直刷下去、可以先限制哪一段使用时间。 / Replace “I am incapable” with specific questions: when does scrolling start, what keeps it going, and which period of use can you limit first?”；Q3 使用“这个逆位例子已经有了关闭自动播放的行动。看清习惯不等于已经改掉，还要看之后能否继续做到。 / The reversal example includes disabling autoplay. Recognizing a habit does not mean it is changed; continued action still matters.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“恶魔表达束缚、依赖和难以摆脱的诱惑。有些事短暂让人舒服，却让人越来越难停下来，挤掉原本想做的事。它不证明有人邪恶或受到了诅咒。 / The Devil represents constraint, dependence and hard-to-resist temptation. Something briefly comforting can become hard to stop and crowd out intended activities. It does not establish evil or a curse.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m16"></a>
### m16｜高塔 / The Tower

**目标、基础与范围**：理解 高塔 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m16.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_16_Tower.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m16-T1 完整含义 / Meaning**

高塔表达突如其来的冲击：原以为可靠的安排或看法突然行不通了，原来没看见的问题也显露出来。它不等于每次都预告事故或失业。 / The Tower expresses sudden disruption: arrangements or beliefs once considered reliable fail, exposing previously unseen problems. It does not invariably predict accidents or job loss.

**画面联系 / Picture connection**

闪电击中塔顶，皇冠倾落，人物坠下。这些画面可以帮助记住原本稳固的东西突然被打破；不能由图确定个人会遭遇什么事件。 / Lightning strikes the tower, its crown falls and people tumble. These images recall the sudden breaking of apparent stability, not a specific personal event.

**关键词整理 / Recall labels**

关键词：突变、冲击、原有安排被打破、问题暴露。原来以为可靠的东西突然不再可靠，是理解这张牌的一条主线。 / Remember: upheaval, disruption, broken arrangements, exposed problems. The sudden failure of something once considered reliable is a central idea.

**m16-T2 正位应用 / Upright application**

建议位：项目一直靠一个人记住所有交接，离岗一次就中断。把交接步骤记下来，让其他成员也知道怎样接手，而不是主动制造危机。 / Advice: a project relies on one person remembering every handover and stops during an absence. Record the steps so others can take over; do not deliberately create a crisis.

**m16-T3 后续逆位深化 / Later reversal study**

逆位示例：已经知道原来的交接方法行不通，却为了维持表面正常而回避改动。这里关注抗拒必要改变，不保证问题不会发生。 / Reversed example: a failed handover structure is known but change is avoided to preserve appearances. This concerns resistance to needed change, not a guarantee that problems will disappear.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m16-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

闪电→倾落皇冠→塔身；终态三处编号与“突然受到冲击／原来依靠的东西被打破”连线，不增加爆炸闪屏。 / Highlight lightning, crown and tower; end with numbered links to “sudden impact / failed structure”, without added explosions or flashes.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m16-q1"></a>
**m16-Q1**（已教依据：T1）

高塔在本课表达的核心含义是什么？ / What is the Tower’s core meaning in this lesson?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 原以为可靠的安排突然行不通了 / An arrangement once thought reliable suddenly fails | 答对了 / Correct. 原本以为稳固的塔被闪电击中，帮助记住原先可靠的东西突然被打破。 / Lightning striking a seemingly solid tower recalls the sudden failure of something once reliable. |
| B | 把突然冲击具体理解成近期交通出行会受阻 / Read the sudden disruption specifically as likely travel trouble | 这项不对 / Not correct. 交通受阻是一种可能联想，但题目没有交通背景；这里先学习原本可靠的安排突然失效。 / Travel trouble is one possible association, but the prompt gives no travel context; the taught core is that a once-reliable structure suddenly fails. |

答案：A。内容ID `m16-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m16-q2"></a>
**m16-Q2**（已教依据：T2）

一个人离岗就无法交接，怎样运用高塔在建议位的含义？ / How does the Tower in advice apply when one person’s absence stops the handover?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 主动破坏项目 / Deliberately wreck the project | 这项不对 / Not correct. 建议位是在问怎样处理问题，不是在命令人制造一次破坏。 / Advice asks how to handle the problem, not how to create destruction. |
| B | 记录交接步骤，让其他成员也能接手 / Record handover steps so others can take over | 答对了 / Correct. 写清步骤并让其他人能接手，能直接改善一人离岗就中断的问题。 / Written steps and additional people able to take over address the interruption caused by one absence. |

答案：B。内容ID `m16-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m16-q3"></a>
**m16-Q3**（已教依据：T3）

明知交接方法行不通，却为了表面正常而不改。这个逆位例子说明什么？ / What does the reversal example show when a known handover failure is ignored to preserve appearances?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 原来交接不可靠的问题仍需处理 / The unreliable handover still needs attention | 答对了 / Correct. 不改动并没有解决只靠一人的交接问题，它仍需要处理。 / Avoiding change does not resolve reliance on one person; the issue remains. |
| B | 先维持表面正常，等出现明确损失后再调整。 / Maintain the appearance of normal operation and adjust after a clear loss appears. | 这项不对 / Not correct. 这里要分清牌义的边界：不改动并没有解决只靠一人的交接问题，它仍需要处理。 / The boundary of the card meaning matters here: Avoiding change does not resolve reliance on one person; the issue remains. |

答案：A。内容ID `m16-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m16-R1 替代讲解 / Alternative explanation**

突变说的是稳定感被打断；现实会发生什么，仍需要问题背景，不能从牌名挑一个灾难。 / Disruption means an interruption of stability; the actual event requires context, not choosing a disaster from the card’s name.

<a id="m16-r1"></a>
**m16-R1**（已教依据：T1 与 R1）

能凭高塔确定哪种灾难吗？ / Can the Tower identify a specific disaster?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 能，直接选最严重的 / Yes; choose the worst event | 这项不对 / Not correct. 本课只教了突发冲击，没有依据选出某一种更严重的现实灾难。 / The lesson teaches disruption, not a basis for choosing a particular disaster. |
| B | 不能，需要现实背景 / No; context is needed | 答对了 / Correct. 需要了解现实问题，才能讨论这张牌可能怎样对应；牌名本身不能确认灾难。 / Context is needed to discuss a possible application; the card’s name cannot establish a disaster. |

答案：B。内容ID `m16-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m16-R2 替代讲解 / Alternative explanation**

建议位是在问怎样应对眼前的问题。工作只靠一人记住交接，就把步骤写下来，让其他人也能接手；不是要求主动破坏项目。 / Advice asks how to respond. A handover dependent on one person’s memory needs written steps and others able to take over, not deliberate destruction.

<a id="m16-r2"></a>
**m16-R2**（已教依据：T2 与 R2）

刚才的建议为什么是记录并改进交接方法？ / Why does the advice suggest recording and improving the handover?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 问题出在工作交接只靠一个人记住 / The handover relies on one person’s memory | 答对了 / Correct. 只靠一人记住步骤，离岗就断，所以记录和让别人接手正好处理这个原因。 / One person’s absence breaks the memory-dependent handover, so records and backup directly address it. |
| B | 为了让冲击更严重 / To intensify disruption | 这项不对 / Not correct. 建议是减少已知问题造成的中断，不是让冲击更严重。 / The advice reduces an identified interruption rather than intensifying it. |

答案：A。内容ID `m16-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m16-R3 替代讲解 / Alternative explanation**

不讨论交接问题，不能让原来的方法变得可靠。例子已经知道问题在哪里，需要的是检查和处理。 / Silence does not make the handover reliable. The known problem needs examination and action.

<a id="m16-r3"></a>
**m16-R3**（已教依据：T3 与 R3）

不谈已知弱点会让它消失吗？ / Does silence remove a known weakness?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先暂时避开薄弱处，等外部条件改变后再处理。 / Avoid the weak point for now and address it after external conditions change. | 这项不对 / Not correct. 这个结论比题目给出的信息多走了一步。把已经知道的问题拿出来检查、处理，才可能让交接可靠起来。 / This conclusion goes beyond the information provided. Examining and addressing the known problem can make the handover more reliable. |
| B | 不会，应检查并处理 / No; inspect and address it | 答对了 / Correct. 把已经知道的问题拿出来检查、处理，才可能让交接可靠起来。 / Examining and addressing the known problem can make the handover more reliable. |

答案：B。内容ID `m16-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m16-v1"></a>
**m16-V1**（已教依据：T1 与 T2）

团队发现以前据旧数据得出的结论有误，怎样运用高塔的含义？ / How can the Tower apply when a team finds its earlier data-based conclusion was wrong?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 面对发现的问题，查清数据并重新核对结论 / Face the problem, check the data and reassess the conclusion | 答对了 / Correct. 旧结论已经不可靠，先核查数据再作判断，是在回应刚发现的冲击。 / Checking data before reassessing an unreliable conclusion responds to the newly discovered disruption. |
| B | 因过去稳定就拒绝核查 / Refuse checks because things once seemed stable | 这项不对 / Not correct. 以前觉得可靠，不能取消现在已经发现的错误，仍需要核查。 / Past confidence does not erase a newly discovered error; checking remains necessary. |

答案：A。内容ID `m16-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“突变说的是稳定感被打断；现实会发生什么，仍需要问题背景，不能从牌名挑一个灾难。 / Disruption means an interruption of stability; the actual event requires context, not choosing a disaster from the card’s name.”；Q2 使用“建议位是在问怎样应对眼前的问题。工作只靠一人记住交接，就把步骤写下来，让其他人也能接手；不是要求主动破坏项目。 / Advice asks how to respond. A handover dependent on one person’s memory needs written steps and others able to take over, not deliberate destruction.”；Q3 使用“不讨论交接问题，不能让原来的方法变得可靠。例子已经知道问题在哪里，需要的是检查和处理。 / Silence does not make the handover reliable. The known problem needs examination and action.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“高塔表达突如其来的冲击：原以为可靠的安排或看法突然行不通了，原来没看见的问题也显露出来。它不等于每次都预告事故或失业。 / The Tower expresses sudden disruption: arrangements or beliefs once considered reliable fail, exposing previously unseen problems. It does not invariably predict accidents or job loss.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m17"></a>
### m17｜星星 / The Star

**目标、基础与范围**：理解 星星 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m17.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_17_Star.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m17-T1 完整含义 / Meaning**

星星关注经历困难之后的希望、恢复与重新找到方向。经历挫折后，仍可以慢慢恢复、重新相信前面还有路可走；但不承诺愿望立刻实现。 / The Star concerns hope, renewal and rediscovering direction after difficulty. It supports continuing recovery, not instant fulfilment of a wish.

**画面联系 / Picture connection**

人物向水面和土地倾水，天空有星。水的流动与开阔场景帮助记住恢复和希望；星光不是现实成功的证据。 / A figure pours water onto water and land beneath stars. Flow and openness help recall renewal and hope; starlight is not proof of success.

**关键词整理 / Recall labels**

关键词：希望、恢复、信任、方向。希望可以与仍需努力并存。 / Recall labels: hope, renewal, trust, direction. Hope can coexist with further effort.

**m17-T2 正位应用 / Upright application**

建议位：创作受挫后想重新开始，先从自己能坚持的短练习做起，再想想自己仍然想创作什么。不是只许愿就不用行动。 / Advice: after a creative setback, begin with short, manageable practice and reconnect with what you still want to create. Wishing does not replace action.

**m17-T3 后续逆位深化 / Later reversal study**

逆位示例：一次失败之后不再相信任何进步，连已有的小改善也看不见。这里关注希望减弱，先识别可见进展。 / Reversed example: after failure, no progress seems believable and small improvements go unnoticed. This concerns diminished hope; begin by recognising visible progress.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m17-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

水流→星群；终态“恢复／重新找方向”，缓慢光圈强调后静止，不加中奖特效。 / Follow water and stars; end with “renewal / direction” and a still highlight, not a jackpot effect.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m17-q1"></a>
**m17-Q1**（已教依据：T1）

星星主要传达什么？ / What does the Star mainly convey?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 保持乐观，相信眼前愿望会按期待推进。 / Stay optimistic and trust that the present wish will unfold as hoped. | 这项不对 / Not correct. 希望不等于愿望会照预期实现。星星讲的是困难后逐渐恢复，并重新看见可以继续的方向。 / Hope does not mean a wish will unfold exactly as expected. The Star concerns gradual recovery and finding a direction forward after difficulty. |
| B | 希望与恢复 / Hope and renewal | 答对了 / Correct. 困难后慢慢恢复，并重新看见可以继续的方向，正是本课的主旨。 / Gradual recovery and renewed direction after difficulty express the taught theme. |

答案：B。内容ID `m17-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m17-q2"></a>
**m17-Q2**（已教依据：T2）

创作受挫后怎样应用建议？ / How does the advice apply after creative difficulty?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 从能坚持的短练习重新开始 / Restart with short, manageable practice | 答对了 / Correct. 从做得到的短练习开始，能让恢复有实际行动，而不只停在愿望上。 / Manageable practice gives recovery a concrete action beyond wishing. |
| B | 先设想最终成功的样子，用积极情绪替代挫败感。 / Visualize the final success first and use positive emotion to replace the discouragement. | 这项不对 / Not correct. 先别按这个做法继续；从做得到的短练习开始，能让恢复有实际行动，而不只停在愿望上。 / Do not continue with this approach yet; Manageable practice gives recovery a concrete action beyond wishing. |

答案：A。内容ID `m17-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m17-q3"></a>
**m17-Q3**（已教依据：T3）

一次失败后，只觉得再也不会进步。在这个逆位例子里，先看看什么？ / After a failure, someone no longer believes improvement is possible. What should be examined first?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 把这次失败当作主要依据，先降低后续目标。 / Use this failure as the main evidence and lower the next goal. | 这项不对 / Not correct. 这个解释把牌义带到了别处。例子已经提到小改善却看不见，重新识别它们才能回应眼前的失望。 / This interpretation shifts the card meaning elsewhere. The example includes overlooked improvements; noticing them responds to the discouragement. |
| B | 已有但被忽略的小改善 / Small improvements being overlooked | 答对了 / Correct. 例子已经提到小改善却看不见，重新识别它们才能回应眼前的失望。 / The example includes overlooked improvements; noticing them responds to the discouragement. |

答案：B。内容ID `m17-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m17-R1 替代讲解 / Alternative explanation**

有希望，不等于已经知道哪一天会成功。可以重新尝试，同时接受恢复需要时间和实际行动。 / Hope does not establish a success date. Try again while accepting that recovery takes time and action.

<a id="m17-r1"></a>
**m17-R1**（已教依据：T1 与 R1）

星星表达希望，能保证愿望会在哪一天实现吗？ / Can the Star’s hope guarantee a date for fulfillment?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不能 / No | 答对了 / Correct. 是否实现、何时实现仍取决于现实情况和后续行动，牌没有给出日期保证。 / Timing and fulfillment depend on circumstances and action; the card guarantees no date. |
| B | 能 / Yes | 这项不对 / Not correct. 本课只讲希望与恢复，没有教可以从中读出确定日期。 / The lesson teaches hope and recovery, not a fixed date. |

答案：A。内容ID `m17-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m17-R2 替代讲解 / Alternative explanation**

先从自己现在做得到的小练习开始，不要求立刻恢复到以前最好的状态。 / Begin with small actions you can manage now, without demanding an immediate return to your previous peak.

<a id="m17-r2"></a>
**m17-R2**（已教依据：T2 与 R2）

恢复应该怎样起步？ / How can renewal begin?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 先恢复到受挫前的强度，借完整投入找回信心。 / Return to the pre-setback intensity and rebuild confidence through a full commitment. | 这项不对 / Not correct. 这个做法没有解决眼前的情况。按目前能力做小练习，更容易真正开始并逐步恢复。 / This action does not resolve the situation described. Small actions suited to present ability support a real start and gradual recovery. |
| B | 从可坚持的行动开始 / Begin with manageable action | 答对了 / Correct. 按目前能力做小练习，更容易真正开始并逐步恢复。 / Small actions suited to present ability support a real start and gradual recovery. |

答案：B。内容ID `m17-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m17-R3 替代讲解 / Alternative explanation**

觉得没有希望时，先看看有没有被自己忽略的小进步。看见确实做得更好的地方，能帮助自己重新相信仍有进步的可能。 / When hope feels absent, look for overlooked improvements. Real examples of progress can renew belief that further improvement is possible.

<a id="m17-r3"></a>
**m17-R3**（已教依据：T3 与 R3）

觉得没有希望时，回看已有的小进步有什么帮助？ / How can noticing small improvements help when hope is low?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 让自己看到仍能进步的实际例子 / Show real examples that improvement remains possible | 答对了 / Correct. 具体的小进步能说明并非毫无变化，帮助重新相信自己还能继续。 / Concrete improvement shows that change exists and can renew belief in continuing. |
| B | 说明之前的担心多余，可以恢复原来的高目标。 / It shows the earlier worry was unnecessary, so the original ambitious goal can be restored. | 这项不对 / Not correct. 这里要分清牌义的边界：具体的小进步能说明并非毫无变化，帮助重新相信自己还能继续。 / The boundary of the card meaning matters here: Concrete improvement shows that change exists and can renew belief in continuing. |

答案：A。内容ID `m17-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m17-v1"></a>
**m17-V1**（已教依据：T1 与 T2）

中断练琴后想重新开始，怎样运用星星的含义？ / How can the Star apply to resuming piano practice after a break?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 等待奇迹替代练习 / Wait for a miracle instead of practice | 这项不对 / Not correct. 等待奇迹没有开始练琴，也没有建立实际恢复的过程。 / Waiting for a miracle starts no practice or recovery process. |
| B | 从短而可持续的练习找回方向 / Regain direction through manageable practice | 答对了 / Correct. 短而能坚持的练习，让重新开始有实际支撑，符合慢慢恢复的含义。 / Short, manageable practice supports a real restart and gradual recovery. |

答案：B。内容ID `m17-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“有希望，不等于已经知道哪一天会成功。可以重新尝试，同时接受恢复需要时间和实际行动。 / Hope does not establish a success date. Try again while accepting that recovery takes time and action.”；Q2 使用“先从自己现在做得到的小练习开始，不要求立刻恢复到以前最好的状态。 / Begin with small actions you can manage now, without demanding an immediate return to your previous peak.”；Q3 使用“觉得没有希望时，先看看有没有被自己忽略的小进步。看见确实做得更好的地方，能帮助自己重新相信仍有进步的可能。 / When hope feels absent, look for overlooked improvements. Real examples of progress can renew belief that further improvement is possible.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“星星关注经历困难之后的希望、恢复与重新找到方向。经历挫折后，仍可以慢慢恢复、重新相信前面还有路可走；但不承诺愿望立刻实现。 / The Star concerns hope, renewal and rediscovering direction after difficulty. It supports continuing recovery, not instant fulfilment of a wish.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m18"></a>
### m18｜月亮 / The Moon

**目标、基础与范围**：理解 月亮 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m18.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_18_Moon.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m18-T1 完整含义 / Meaning**

月亮关注信息不清、想象、恐惧和感受对判断的影响。它提醒分开已经知道的事实与尚未证实的猜测，不等于所有人都在欺骗你。 / The Moon concerns unclear information, imagination, fear and feelings influencing judgment. Separate known facts from unverified guesses; it does not mean everyone is deceiving you.

**画面联系 / Picture connection**

月光下有两座塔、动物和延伸的小路。月光照着小路，前方仍不清楚，可以帮助记住看不清时的不确定；不能把动物或阴影当作某个人撒谎的证据。 / Towers, animals and a path appear in moonlight. Limited light and a receding path help recall uncertainty; shadows do not prove someone is lying.

**关键词整理 / Recall labels**

关键词：不确定、想象、担心、看不清。可以承认自己担心，但担心不等于事情已经发生。 / Remember: uncertainty, imagination, worry, lack of clarity. Acknowledge worry without treating the feared event as fact.

**m18-T2 正位应用 / Upright application**

建议位：朋友暂未回复，你开始猜测关系破裂。先确认唯一事实是未收到回复；可能原因仍待沟通，不先把最担心的故事当结论。 / Advice: a friend has not replied and you fear the relationship is over. The known fact is no reply yet; causes still require clarification.

**m18-T3 后续逆位深化 / Later reversal study**

逆位示例：通过沟通得到了原先不知道的重要信息，开始分清哪些只是自己的猜测。这里可以理解为事情逐渐清楚，但仍不代表所有未知都已解决。 / Reversed example: communication supplies key facts and earlier guesses become distinguishable. This can suggest clearing confusion, not complete certainty about everything.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m18-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

月光→远去小路；终态事实与猜测两张文字卡并列，原图不变亮成白天。 / Highlight moonlight and the path; end with separate fact and guess labels, without turning the image into daylight.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m18-q1"></a>
**m18-Q1**（已教依据：T1）

月亮首先提醒什么？ / What does the Moon first remind us?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 区分事实与猜测 / Separate facts and guesses | 答对了 / Correct. 还不清楚时，把已经知道的事和自己想象的原因分开，才不会误判。 / Separating known facts from imagined causes avoids confusing uncertainty with knowledge. |
| B | 对信息保持怀疑，优先相信自己的直觉判断。 / Remain skeptical of the information and give priority to your intuitive judgment. | 这项不对 / Not correct. 这个解释把牌义带到了别处。还不清楚时，把已经知道的事和自己想象的原因分开，才不会误判。 / This interpretation shifts the card meaning elsewhere. Separating known facts from imagined causes avoids confusing uncertainty with knowledge. |

答案：A。内容ID `m18-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m18-q2"></a>
**m18-Q2**（已教依据：T2）

朋友未回复，已知事实是什么？ / What is known when the friend has not replied?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 朋友可能在回避这段关系。 / The friend may be avoiding the relationship. | 这项不对 / Not correct. 这个说法混淆了题目正在考的含义。目前只知道还没回复，为什么没回仍然需要了解。 / This statement confuses the meaning being tested. Only the absence of a reply is known; the reason remains unclear. |
| B | 目前还没收到回复 / No reply has arrived yet | 答对了 / Correct. 目前只知道还没回复，为什么没回仍然需要了解。 / Only the absence of a reply is known; the reason remains unclear. |

答案：B。内容ID `m18-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m18-q3"></a>
**m18-Q3**（已教依据：T3）

这个例子中，为什么可以把月亮逆位理解为事情逐渐清楚？ / Why can the reversed Moon indicate growing clarity in this example?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 沟通提供了新事实 / Communication supplied new facts | 答对了 / Correct. 例子明确说沟通带来了新事实，因此可以说原来的猜测逐渐减少。 / Communication supplies new facts in the example, supporting reduced uncertainty. |
| B | 事情开始清楚，是因为直觉逐渐接近真实情况。 / The situation is becoming clearer because intuition is moving closer to the truth. | 这项不对 / Not correct. 这里要分清牌义的边界：例子明确说沟通带来了新事实，因此可以说原来的猜测逐渐减少。 / The boundary of the card meaning matters here: Communication supplies new facts in the example, supporting reduced uncertainty. |

答案：A。内容ID `m18-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m18-R1 替代讲解 / Alternative explanation**

“我很担心”是感受，“对方一定讨厌我”是未证实解释，两者不能互相替代。 / “I am worried” is a feeling; “they hate me” is an unverified interpretation. They are not interchangeable.

<a id="m18-r1"></a>
**m18-R1**（已教依据：T1 与 R1）

担心与事实怎样区分？ / How do worry and fact differ?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 担心什么就证明发生什么 / Fear proves what happened | 这项不对 / Not correct. 担心可以很强烈，却仍然不能证明担心的事情已经发生。 / Strong worry still does not establish that the feared event happened. |
| B | 担心是真实感受，原因仍需核实 / Worry is a real feeling; its cause needs checking | 答对了 / Correct. “我担心”描述自己的感受，“为什么没回复”仍需要核实。 / Worry describes your feeling; the reason for the missing reply still needs checking. |

答案：B。内容ID `m18-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m18-R2 替代讲解 / Alternative explanation**

不知道朋友为什么没回复，可以在合适的时候问一问。最担心的原因只是可能性之一，不能直接当成事实。 / If a friend’s silence is unexplained, ask at a suitable time. The most worrying explanation remains only one possibility, not a fact.

<a id="m18-r2"></a>
**m18-R2**（已教依据：T2 与 R2）

还不知道朋友为什么没回复时，哪种做法符合刚才的讲解？ / Which response fits the lesson when the reason for a missing reply is unknown?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 留出其他可能并适时沟通 / Allow other possibilities and clarify appropriately | 答对了 / Correct. 没有确认原因前，可以保留其他解释，再通过沟通了解实情。 / Other explanations remain possible until communication clarifies the reason. |
| B | 先按较可能的负面原因做准备，再决定要不要沟通。 / Prepare for the more likely negative explanation first, then decide whether to communicate. | 这项不对 / Not correct. 这个做法没有解决眼前的情况。没有确认原因前，可以保留其他解释，再通过沟通了解实情。 / This action does not resolve the situation described. Other explanations remain possible until communication clarifies the reason. |

答案：A。内容ID `m18-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m18-R3 替代讲解 / Alternative explanation**

这个例子因为沟通得到了新信息，事情才逐渐清楚。不能省略沟通这一步，只凭逆位就说所有事情都知道了。 / Communication supplies new information in this example, bringing gradual clarity. Reversal alone cannot replace that step or establish complete knowledge.

<a id="m18-r3"></a>
**m18-R3**（已教依据：T3 与 R3）

知道一项事实等于全部清楚吗？ / Does one new fact clarify everything?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 等于，其他都无需问 / Yes; no further questions matter | 这项不对 / Not correct. 新知道一件事，不代表其他问题也已得到答案。 / Learning one fact does not answer every other question. |
| B | 不等于，继续区分已知未知 / No; distinguish known from unknown | 答对了 / Correct. 把刚得到的信息和仍不清楚的部分分开，才符合逐渐了解的过程。 / Distinguishing newly known facts from remaining unknowns fits gradual clarification. |

答案：B。内容ID `m18-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m18-v1"></a>
**m18-V1**（已教依据：T1 与 T2）

听到活动取消的消息，但尚未证实，怎样运用月亮的含义？ / How can the Moon apply to an unconfirmed report that an event was canceled?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 核对主办方通知 / Check the organiser’s notice | 答对了 / Correct. 核对主办方是否正式通知，可以补充判断活动是否取消的依据。 / Checking the organizer’s notice provides grounds to assess cancellation. |
| B | 因为担心就当已取消 / Treat worry as confirmation | 这项不对 / Not correct. 担心取消只是自己的感受，没有增加活动确已取消的证据。 / Worry supplies no evidence that cancellation has occurred. |

答案：A。内容ID `m18-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示““我很担心”是感受，“对方一定讨厌我”是未证实解释，两者不能互相替代。 / “I am worried” is a feeling; “they hate me” is an unverified interpretation. They are not interchangeable.”；Q2 使用“不知道朋友为什么没回复，可以在合适的时候问一问。最担心的原因只是可能性之一，不能直接当成事实。 / If a friend’s silence is unexplained, ask at a suitable time. The most worrying explanation remains only one possibility, not a fact.”；Q3 使用“这个例子因为沟通得到了新信息，事情才逐渐清楚。不能省略沟通这一步，只凭逆位就说所有事情都知道了。 / Communication supplies new information in this example, bringing gradual clarity. Reversal alone cannot replace that step or establish complete knowledge.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“月亮关注信息不清、想象、恐惧和感受对判断的影响。它提醒分开已经知道的事实与尚未证实的猜测，不等于所有人都在欺骗你。 / The Moon concerns unclear information, imagination, fear and feelings influencing judgment. Separate known facts from unverified guesses; it does not mean everyone is deceiving you.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m19"></a>
### m19｜太阳 / The Sun

**目标、基础与范围**：理解 太阳 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m19.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_19_Sun.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m19-T1 完整含义 / Meaning**

太阳关注清晰、活力、开放表达与可以看见的喜悦。它支持认识已取得的进展，但不能保证所有困难永远消失。 / The Sun concerns clarity, vitality, openness and visible joy. Recognise progress without assuming all difficulties vanish forever.

**画面联系 / Picture connection**

明亮太阳下，孩子骑白马，后方有向日葵。明亮与开放姿态帮助记住清楚和活力；不能直接推出获奖或财富数额。 / A child rides a white horse beneath a bright sun, with sunflowers behind. Brightness and openness recall clarity and vitality, not an award or a sum of money.

**关键词整理 / Recall labels**

关键词：清晰、活力、喜悦、坦诚。可以高兴地表达进展，也要说清实际做到了什么。 / Remember: clarity, vitality, joy, honesty. Celebrate progress while accurately stating what has been achieved.

**m19-T2 正位应用 / Upright application**

建议位：项目已经完成可展示版本，却一直不敢介绍。用清楚的话展示真实成果，分享进展并接受反馈，不夸大还没有的功能。 / Advice: a project has a demonstrable version, but you hesitate to present it. Show real progress clearly and welcome feedback, without exaggerating unfinished features.

**m19-T3 后续逆位深化 / Later reversal study**

逆位示例：已经进步，却只盯着缺点而感受不到成就。这里关注明明有进步，却高兴不起来、也缺少自信的情况，不等于进展完全不存在。 / Reversed example: progress exists but focusing only on flaws blocks satisfaction. This concerns reduced joy or confidence, not the absence of all progress.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m19-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

太阳→孩子开放姿态；终态“清晰表达／看见进展”，保持温和强调，无闪光。 / Highlight sun and open posture; end with “clear expression / visible progress”, without flashing.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m19-q1"></a>
**m19-Q1**（已教依据：T1）

本课讲的太阳，主要表达什么？ / What does the Sun mainly express in this lesson?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 事情进入顺利阶段，接下来的进展会更容易。 / The situation has entered a favorable phase, so the next steps should come more easily. | 这项不对 / Not correct. 这里要分清牌义的边界：清楚看见成果、有活力地表达并感受喜悦，符合刚才的讲解。 / The boundary of the card meaning matters here: Recognizing results, expressing vitality and experiencing joy match the teaching. |
| B | 清晰、活力与喜悦 / Clarity, vitality and joy | 答对了 / Correct. 清楚看见成果、有活力地表达并感受喜悦，符合刚才的讲解。 / Recognizing results, expressing vitality and experiencing joy match the teaching. |

答案：B。内容ID `m19-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m19-q2"></a>
**m19-Q2**（已教依据：T2）

项目已有可以展示的版本，怎样介绍它符合刚才的建议？ / How should the available project version be presented in the example?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 清楚介绍已有真实成果 / Clearly present actual progress | 答对了 / Correct. 真实成果已经可以展示，清楚介绍它既坦诚，也让进展被看见。 / Presenting actual work clearly is honest and makes progress visible. |
| B | 宣称未完成功能也已完成 / Claim unfinished features are finished | 这项不对 / Not correct. 尚未完成却说已完成，是夸大结果，不是坦诚表达。 / Calling unfinished work complete exaggerates results rather than expressing them honestly. |

答案：A。内容ID `m19-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m19-q3"></a>
**m19-Q3**（已教依据：T3）

明明已有进步，却只看到缺点。在这个逆位例子里，需要检查什么？ / What should be examined when real progress exists but only flaws are noticed?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 是不是目标定得还不够高，导致进展不够明显。 / Whether the goal is not ambitious enough, making the progress feel less noticeable. | 这项不对 / Not correct. 这里要分清牌义的边界：先核对哪些已经进步，才有机会看见被缺点遮住的成就。 / The boundary of the card meaning matters here: Identifying progress can reveal achievements obscured by attention to flaws. |
| B | 被忽略的实际进展 / Actual progress being overlooked | 答对了 / Correct. 先核对哪些已经进步，才有机会看见被缺点遮住的成就。 / Identifying progress can reveal achievements obscured by attention to flaws. |

答案：B。内容ID `m19-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m19-R1 替代讲解 / Alternative explanation**

清楚展示，要说出已经做成什么，也说清还有什么没做完。积极表达不等于夸大成果。 / Clear presentation states both achievements and unfinished work. Positive expression does not mean exaggerating results.

<a id="m19-r1"></a>
**m19-R1**（已教依据：T1 与 R1）

清楚介绍作品时，要说清哪些部分还没完成吗？ / Should a clear presentation state which parts remain unfinished?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 包含 / Yes | 答对了 / Correct. 说清做成了什么、还缺什么，别人才能准确了解作品。 / Stating both completed and unfinished parts gives an accurate account. |
| B | 可以先突出完成的部分，未完成内容等别人追问时再说明。 / Lead with the completed parts and explain unfinished work if someone asks about it. | 这项不对 / Not correct. 这个结论比题目给出的信息多走了一步。说清做成了什么、还缺什么，别人才能准确了解作品。 / This conclusion goes beyond the information provided. Stating both completed and unfinished parts gives an accurate account. |

答案：A。内容ID `m19-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m19-R2 替代讲解 / Alternative explanation**

已有成果才拿出来分享；展示真实进展与宣布完美是两回事。 / Share what exists. Showing progress differs from claiming perfection.

<a id="m19-r2"></a>
**m19-R2**（已教依据：T2 与 R2）

展示真实成果与宣称完美一样吗？ / Is showing progress claiming perfection?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 一样 / Yes | 这项不对 / Not correct. 有值得分享的进步，并不等于每一处都已经完美。 / Progress worth sharing does not establish perfection in every part. |
| B | 不一样 / No | 答对了 / Correct. 可以真实展示已完成的部分，同时承认仍有地方需要改进。 / Completed work can be shared while acknowledging further improvements. |

答案：B。内容ID `m19-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m19-R3 替代讲解 / Alternative explanation**

不能感受成就与没有成就是两件事；先确认已做成的具体部分。 / Not feeling achievement differs from having none. Identify what has actually been achieved.

<a id="m19-r3"></a>
**m19-R3**（已教依据：T3 与 R3）

已经有进步，却仍不满意，可以先怎样做？ / What can come first when progress exists but satisfaction is missing?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 核对具体已完成部分 / Identify specific completed work | 答对了 / Correct. 列出实际做成的部分，能让评价不只停留在对缺点的不满意。 / Identifying completed work broadens attention beyond dissatisfaction with flaws. |
| B | 先提高下一阶段目标，让已有进步显得更有意义。 / Raise the next-stage goal so the progress already made feels more meaningful. | 这项不对 / Not correct. 这样做会漏掉题目里的关键一步。列出实际做成的部分，能让评价不只停留在对缺点的不满意。 / This action skips a key step in the question. Identifying completed work broadens attention beyond dissatisfaction with flaws. |

答案：A。内容ID `m19-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m19-v1"></a>
**m19-V1**（已教依据：T1 与 T2）

终于能完整弹一首曲子，怎样运用太阳的含义？ / How can the Sun apply after playing a whole piece successfully?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 宣布以后不用练习 / Declare further practice unnecessary | 这项不对 / Not correct. 这一次能完整弹奏，是一项进步，不等于以后已经没有需要学习的地方。 / Playing a full piece is progress, not the end of future learning. |
| B | 看见进步并坦然分享 / Recognise progress and share openly | 答对了 / Correct. 承认确实取得的进步并分享，符合本课的喜悦与坦诚表达。 / Recognizing and sharing real progress expresses joy and openness. |

答案：B。内容ID `m19-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“清楚展示，要说出已经做成什么，也说清还有什么没做完。积极表达不等于夸大成果。 / Clear presentation states both achievements and unfinished work. Positive expression does not mean exaggerating results.”；Q2 使用“已有成果才拿出来分享；展示真实进展与宣布完美是两回事。 / Share what exists. Showing progress differs from claiming perfection.”；Q3 使用“不能感受成就与没有成就是两件事；先确认已做成的具体部分。 / Not feeling achievement differs from having none. Identify what has actually been achieved.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“太阳关注清晰、活力、开放表达与可以看见的喜悦。它支持认识已取得的进展，但不能保证所有困难永远消失。 / The Sun concerns clarity, vitality, openness and visible joy. Recognise progress without assuming all difficulties vanish forever.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m20"></a>
### m20｜审判 / Judgement

**目标、基础与范围**：理解 审判 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m20.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_20_Judgement.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m20-T1 完整含义 / Meaning**

审判表达回看经历后终于想明白了：有些事情不能再照旧，需要重新作决定。重点是把看清的问题用到下一次选择中，不是等别人评判自己，也不是反复责备过去的自己。 / Judgement represents understanding gained by reviewing experience: some things need a new decision. Apply what you learned to the next choice rather than awaiting others’ judgment or repeatedly blaming your past self.

**画面联系 / Picture connection**

号角响起，人物抬头伸臂。听到号角后抬头的姿态，可以帮助记住发现问题后作出回应；画面不是现实法律裁决。 / A trumpet sounds and figures rise with lifted arms. Call and response support remembering awareness followed by action, not a real legal verdict.

**关键词整理 / Recall labels**

关键词：想明白了、回顾、重新决定、重新开始。回看过去，是为了知道下一步怎样选择。 / Remember: realization, review, renewed decision, starting again. Review the past to understand your next choice.

**m20-T2 正位应用 / Upright application**

建议位：反复接下不适合的合作，终于看清共同问题。找出这些合作为什么都不适合，想清楚今后选合作时要注意什么，再决定是否接受新邀请。 / Advice: repeated unsuitable collaborations reveal recurring problems. Identify what made them unsuitable and what to check next time before accepting a new invitation.

**m20-T3 后续逆位深化 / Later reversal study**

逆位示例：已经发现自己总在重复同样的问题，却因为不想面对而拖延决定。这里要留意看清问题后仍不愿作决定的情况，不意味着永远没有重新选择的机会。 / Reversed example: a recurring problem is recognized, but a decision is delayed to avoid facing it. Notice reluctance to decide after understanding; this does not remove every future chance to choose.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m20-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

号角→人物回应；终态“回顾／看清／作决定”依次出现并停留。 / Highlight trumpet and responding figures; end with “review / recognise / decide”, holding each label.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m20-q1"></a>
**m20-Q1**（已教依据：T1）

审判为什么提醒我们回想过去的经历？ / Why does Judgement encourage us to look back at past experiences?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 想清楚问题后重新作决定 / Make a new decision after understanding the issue | 答对了 / Correct. 想明白过去哪里出了问题，再改变下一次选择，才把回顾用到了行动上。 / Understanding past problems and changing the next choice puts review into action. |
| B | 找出过去是谁造成问题，以免自己再次受影响。 / Identify who caused the past problem so you can avoid being affected again. | 这项不对 / Not correct. 这个解释把牌义带到了别处。想明白过去哪里出了问题，再改变下一次选择，才把回顾用到了行动上。 / This interpretation shifts the card meaning elsewhere. Understanding past problems and changing the next choice puts review into action. |

答案：A。内容ID `m20-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m20-q2"></a>
**m20-Q2**（已教依据：T2）

接下的合作总是不适合自己。按照刚才的示范，下一次收到邀请时怎样做？ / Repeated collaborations have been unsuitable. How should the next invitation be handled?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 只说后悔，仍照旧接受 / Express regret and accept as before | 这项不对 / Not correct. 嘴上后悔但仍照旧接受，就又重复了已经发现的问题。 / Regret followed by the same acceptance repeats the recognized problem. |
| B | 想清楚选合作要注意什么，再判断新邀请 / Clarify what to look for before assessing a new invitation | 答对了 / Correct. 先知道哪些条件不适合自己，再检查新邀请，才用到了过去的经验。 / Identifying unsuitable conditions before assessing the invitation uses past experience. |

答案：B。内容ID `m20-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m20-q3"></a>
**m20-Q3**（已教依据：T3）

已经看清反复出现的问题，却一直拖着不决定。这个逆位例子卡在哪里？ / What is stuck when a recurring problem is understood but a decision is delayed?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 看见问题后回避决定 / Avoid deciding after recognition | 答对了 / Correct. 例子已经看清问题，拖住的是接下来不愿作决定这一步。 / Understanding is already present; unwillingness to make the next decision is the obstacle. |
| B | 信息还需要整理得更完整，等判断更确定后再决定。 / The information needs more organization; wait until the judgment feels firmer before deciding. | 这项不对 / Not correct. 这个判断忽略了题目给出的条件。例子已经看清问题，拖住的是接下来不愿作决定这一步。 / This judgment overlooks a condition given in the question. Understanding is already present; unwillingness to make the next decision is the obstacle. |

答案：A。内容ID `m20-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m20-R1 替代讲解 / Alternative explanation**

回看经历，是为了知道下次怎样选择。只责备自己，却仍然照旧作决定，还没有把发现的问题用起来。 / Reviewing experience should inform the next choice. Blame followed by the same decisions does not apply what you discovered.

<a id="m20-r1"></a>
**m20-R1**（已教依据：T1 与 R1）

按照本课讲的审判，只责备自己就够了吗？ / According to Judgement as taught here, is blaming yourself enough?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 够了，越自责就说明想得越透彻 / Yes; more self-blame means a more thorough understanding | 这项不对 / Not correct. 自责有多痛苦，不能说明之后会怎样选择，也不能替代新的决定。 / The pain of blame does not establish a different next choice or replace a decision. |
| B | 不够，还要根据想明白的事，重新作决定 / No; use what you have understood to make a new decision | 答对了 / Correct. 还需要让下一次选择有所改变，才把回顾的发现实际用起来。 / A changed next choice is needed to apply what review revealed. |

答案：B。内容ID `m20-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m20-R2 替代讲解 / Alternative explanation**

先找出过去几次合作为什么不合适，把这些原因变成下次选择时要检查的事项，再看新邀请是否适合。 / Identify why past collaborations were unsuitable, turn those reasons into checks for the next choice, and assess the new invitation.

<a id="m20-r2"></a>
**m20-R2**（已教依据：T2 与 R2）

回顾怎样影响新合作？ / How can review affect a new collaboration?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 用明确标准检查是否适合 / Check suitability against clear criteria | 答对了 / Correct. 检查新合作是否又有过去的问题，能让之前的经验真正影响选择。 / Checking for previous problems lets experience inform the new choice. |
| B | 为了避免重蹈覆辙，先拒绝和过去相似的合作方式。 / To avoid repeating the past, reject collaboration arrangements that resemble the previous one. | 这项不对 / Not correct. 先别按这个做法继续；检查新合作是否又有过去的问题，能让之前的经验真正影响选择。 / Do not continue with this approach yet; Checking for previous problems lets experience inform the new choice. |

答案：A。内容ID `m20-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m20-R3 替代讲解 / Alternative explanation**

例子里已经看清了问题，困难是还不愿决定接下来怎么办。需要继续作选择，而不是否认刚才已经发现的事。 / The problem is already understood in this example. The difficulty is choosing what to do next, not lack of recognition; do not deny what has been learned.

<a id="m20-r3"></a>
**m20-R3**（已教依据：T3 与 R3）

已经看清问题后，怎样避免一直停在原处？ / After understanding the issue, how can you avoid remaining stuck?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 否认刚才看见的问题 / Deny the recognised issue | 这项不对 / Not correct. 否认已经看清的问题，会重新回到不愿面对它的状态。 / Denying a recognized problem returns to avoidance. |
| B | 作一个与认识相符的决定 / Make a decision consistent with the insight | 答对了 / Correct. 根据刚才的发现决定下一步，才从知道问题走到处理问题。 / Choosing the next step based on the insight moves from recognizing to addressing the problem. |

答案：B。内容ID `m20-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m20-v1"></a>
**m20-V1**（已教依据：T1 与 T2）

发现自己每次备考都拖到最后，怎样运用审判的含义？ / How can Judgement apply to repeatedly delaying exam preparation?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 发现总在拖延，就提前安排下一次备考 / Recognize the repeated delay and plan the next exam preparation earlier | 答对了 / Correct. 发现总是拖延后提前安排，让下一次做法不同，符合回顾后重新决定。 / Planning earlier after recognizing delay changes the next action and applies renewed choice. |
| B | 回想上一次拖延带来的压力，用自责提醒自己下次别再犯。 / Recall the stress caused by the last delay and use self-reproach as a reminder for next time. | 这项不对 / Not correct. 先别按这个做法继续；发现总是拖延后提前安排，让下一次做法不同，符合回顾后重新决定。 / Do not continue with this approach yet; Planning earlier after recognizing delay changes the next action and applies renewed choice. |

答案：A。内容ID `m20-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“回看经历，是为了知道下次怎样选择。只责备自己，却仍然照旧作决定，还没有把发现的问题用起来。 / Reviewing experience should inform the next choice. Blame followed by the same decisions does not apply what you discovered.”；Q2 使用“先找出过去几次合作为什么不合适，把这些原因变成下次选择时要检查的事项，再看新邀请是否适合。 / Identify why past collaborations were unsuitable, turn those reasons into checks for the next choice, and assess the new invitation.”；Q3 使用“例子里已经看清了问题，困难是还不愿决定接下来怎么办。需要继续作选择，而不是否认刚才已经发现的事。 / The problem is already understood in this example. The difficulty is choosing what to do next, not lack of recognition; do not deny what has been learned.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“审判表达回看经历后终于想明白了：有些事情不能再照旧，需要重新作决定。重点是把看清的问题用到下一次选择中，不是等别人评判自己，也不是反复责备过去的自己。 / Judgement represents understanding gained by reviewing experience: some things need a new decision. Apply what you learned to the next choice rather than awaiting others’ judgment or repeatedly blaming your past self.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。

<a id="card-m21"></a>
### m21｜世界 / The World

**目标、基础与范围**：理解 世界 的核心主题，用在一个明确建议位，并在后续学习一个限定背景的逆位。前置 [B01 牌组结构](#lesson-b01)、[B07 两张起步牌](#lesson-b07)；自选进入时先提供其摘要。本节不要求星座、卡巴拉、所有逆位方向或陌生牌比较。逆位前置 [I04](#lesson-i04)。首次不以 Q3 作为完成门槛。

**图源与依据**：[本地历史牌图](../assets/cards/m21.webp)；[来源页](https://commons.wikimedia.org/wiki/File:RWS_Tarot_21_World.jpg)；身份以[资产清单](../assets/manifest.json)为准。牌义以保留的 Word 基线为起点，对照[S01 与 S04](#sources)的教学和历史体系作原创改写；助记、案例与题目为本项目设计。不可把图像线索说成唯一证明。

**m21-T1 完整含义 / Meaning**

世界代表这一阶段圆满完成：各部分分别做好，也合在一起，形成了完整成果。它可以带来告一段落的满足，但不意味着以后再也不用学习。 / The World represents fulfillment at the end of a phase: completed parts combine into a whole result. It can bring satisfaction without ending all future learning.

**画面联系 / Picture connection**

人物位于花环内，四角有形象围绕。闭合的花环与周围的形象，可以帮助记住各部分合成一个整体；不表示世界上所有愿望都完成。 / A figure stands within a wreath, surrounded by four corner figures. The enclosing form supports completion and integration, not fulfilment of every wish.

**关键词整理 / Recall labels**

关键词：完成、完整、圆满、告一段落。先弄清楚完成的是哪一段事情。 / Remember: completion, wholeness, fulfillment, closure. First identify which phase is complete.

**m21-T2 正位应用 / Upright application**

建议位：作品各部分已经做出，但还没合成可以提交的完整作品。把各部分组合好、检查并提交，完成这段工作的最后几步。 / Advice: parts of a project exist but are not yet assembled for submission. Combine, check and submit them to complete the final steps of this phase.

**m21-T3 后续逆位深化 / Later reversal study**

逆位示例：大部分内容完成，但最后的检查和提交迟迟没做。这里关注还有最后的收尾工作没做，不是把所有成果归零。 / Reversed example: most work is done, but final checks and submission remain. This concerns unfinished closure, not erasing all achievement.

这里只练上述情境；逆位不是自动反义。 / Practise this stated context only; reversal is not automatic opposition.

**分镜 m21-M**

固定同一牌图位置、比例与牌名，从完整牌图开始。 / Keep the image position, scale and name consistent, starting from the full card.

花环→四角→回到中央；终态“各部分组合好／这一阶段完成”，原画静止，不生成额外象征。 / Trace wreath, corners and centre; end with “integration / phase completed”, without inventing symbols.

用户点“看线索 / Show clues”触发；各焦点约0.8秒，段末停留，用户点“继续 / Continue”才进入下一段。可“暂停 / Pause”“重播 / Replay”“看静态图 / View stills”；静态替代为原图带相同编号与相同文字。遵守[动效约定](#motion-contract)，不会在答题中自动闪出正确答案。逆位只在 T3 翻转展示一次并保留方向标签。

**练习与定向补学**

<a id="m21-q1"></a>
**m21-Q1**（已教依据：T1）

世界的完成指什么？ / What does the World’s completion refer to?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 今后再也不用学习 / No future learning is needed | 这项不对 / Not correct. 完成的是当前这一段任务，不能扩大成以后再也不需要学习。 / Completion concerns this phase, not an end to all future learning. |
| B | 这一阶段形成了完整成果 / This phase has produced a complete result | 答对了 / Correct. 各部分合成完整成果，这一阶段才真正告一段落。 / Combining the parts into a complete result brings this phase to a close. |

答案：B。内容ID `m21-Q1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m21-q2"></a>
**m21-Q2**（已教依据：T2）

作品的各部分已经做好，却还没组合成完整作品。怎样运用世界在建议位的含义？ / How does the World in advice apply when completed parts have not yet been assembled?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 组合各部分、检查并提交 / Assemble the parts, check and submit | 答对了 / Correct. 把各部分组合好并检查、提交，正是在完成案例里还没做的步骤。 / Assembly, checking and submission address the steps still missing in the example. |
| B | 各部分有了，就说整份作品已经提交 / Declare the whole project submitted merely because its parts exist | 这项不对 / Not correct. 各部分虽然都有了，但还没组成完整作品，也没有提交。 / The parts exist, but the complete work has not been assembled or submitted. |

答案：A。内容ID `m21-Q2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m21-q3"></a>
**m21-Q3**（已教依据：T3）

大部分内容已完成，但最后检查和提交没做。这个逆位例子说明什么？ / What does the reversal example show when most work is done but final checks and submission remain?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 主体内容已经完成，最后手续对成果影响不大。 / The main work is finished, so the final formalities have little effect on the result. | 这项不对 / Not correct. 这里要分清牌义的边界：背景明确缺少最后检查与提交，因此需要补上收尾。 / The boundary of the card meaning matters here: Final checks and submission are explicitly missing, so closure remains necessary. |
| B | 有收尾环节未完成 / Closure remains unfinished | 答对了 / Correct. 背景明确缺少最后检查与提交，因此需要补上收尾。 / Final checks and submission are explicitly missing, so closure remains necessary. |

答案：B。内容ID `m21-Q3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m21-R1 替代讲解 / Alternative explanation**

各部分分别做好以后，还要组合成一份符合要求的完整成果。例如作品的各部分都有了，也需要检查它们能否接在一起，才算完成。 / Finished parts must be combined into a whole that meets the requirements. Check how the parts of a project connect before calling it complete.

<a id="m21-r1"></a>
**m21-R1**（已教依据：T1 与 R1）

作品的各部分都有了，就自动算完成整个任务了吗？ / Do existing parts automatically mean that the whole task is complete?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 不，还要组合好并完成任务要求 / No, assemble them properly and meet the task requirements | 答对了 / Correct. 部分分别做好，还要能组合起来并满足任务要求，才形成完整成果。 / Finished parts must work together and meet requirements to form a complete result. |
| B | 是，不用检查连接 / Yes; connections need no checking | 这项不对 / Not correct. 没有检查各部分怎样接起来，不能确认整个作品已经完成。 / Without checking how the parts connect, the whole work cannot be considered complete. |

答案：A。内容ID `m21-R1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m21-R2 替代讲解 / Alternative explanation**

建议位是在问怎样做，所以这里讲的是把作品组合好、检查并提交。放在结果位时，才是讨论这段工作能否走向完成。 / The advice position asks what to do, so it calls for assembly, checking and submission. In an outcome position, the question is whether the work is heading toward completion.

<a id="m21-r2"></a>
**m21-R2**（已教依据：T2 与 R2）

世界放在建议位，为什么这里要讲怎样完成并提交作品？ / Why does the World in advice discuss completing and submitting the work?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 世界显示事情接近完成，因此可以把结果视为已经确定。 / The World shows that the matter is close to completion, so the result can be treated as settled. | 这项不对 / Not correct. 这样做会漏掉题目里的关键一步。这个牌位问的是怎样做，因此要把完成转成可以执行的最后几步。 / This action skips a key step in the question. This position asks what to do, so completion becomes the concrete final steps. |
| B | 它要回答怎样完成 / It answers how to complete | 答对了 / Correct. 这个牌位问的是怎样做，因此要把完成转成可以执行的最后几步。 / This position asks what to do, so completion becomes the concrete final steps. |

答案：B。内容ID `m21-R2-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**m21-R3 替代讲解 / Alternative explanation**

还差收尾时，要找出最后哪一步没做，不代表前面完成的部分都没有价值。 / Unfinished closure calls for finding the missing final step; it does not make earlier work worthless.

<a id="m21-r3"></a>
**m21-R3**（已教依据：T3 与 R3）

最后还没收尾时，先找什么？ / What should be identified when closure is unfinished?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 最后还有哪一步没做 / Which final step remains unfinished | 答对了 / Correct. 找出最后缺少的检查或提交，既承认已有成果，也知道接下来补什么。 / Identifying remaining checks or submission recognizes existing work and the next step. |
| B | 先回顾已经做过的工作，确认前面的投入是否值得继续。 / Review the work already done and decide whether the earlier effort is still worth continuing. | 这项不对 / Not correct. 这个解释把牌义带到了别处。找出最后缺少的检查或提交，既承认已有成果，也知道接下来补什么。 / This interpretation shifts the card meaning elsewhere. Identifying remaining checks or submission recognizes existing work and the next step. |

答案：A。内容ID `m21-R3-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

<a id="m21-v1"></a>
**m21-V1**（已教依据：T1 与 T2）

一次展览已经完整结束，怎样运用世界的含义回看它？ / How can the World apply when reflecting on a completed exhibition?

| 选项 | 实际展示文案 | 提交后的逐项反馈 |
|---|---|---|
| A | 把这次成功当成以后展览的固定模板，继续复制同样做法。 / Treat this success as a fixed template and repeat the same approach for future exhibitions. | 这项不对 / Not correct. 把一次成功固定成以后都照搬的模板，会忽略新阶段可能有不同条件。世界在这里要整理成果，并确认这一阶段已经完成。 / Turning one success into a fixed template ignores the different conditions of a later stage. Here the World asks you to gather the results and acknowledge this stage as complete. |
| B | 整理成果并确认本阶段完成 / Gather the outcomes and acknowledge completion | 答对了 / Correct. 整理这次的成果、确认它已告一段落，符合本课的完成与圆满。 / Gathering this event’s results and recognizing its completion fits the taught wholeness. |

答案：B。内容ID `m21-V1-target` 绑定正确内容而非字母；最终界面排列变化时，反馈必须跟随内容。

**提示与补学路由**：Q1 使用提示“各部分分别做好以后，还要组合成一份符合要求的完整成果。例如作品的各部分都有了，也需要检查它们能否接在一起，才算完成。 / Finished parts must be combined into a whole that meets the requirements. Check how the parts of a project connect before calling it complete.”；Q2 使用“建议位是在问怎样做，所以这里讲的是把作品组合好、检查并提交。放在结果位时，才是讨论这段工作能否走向完成。 / The advice position asks what to do, so it calls for assembly, checking and submission. In an outcome position, the question is whether the work is heading toward completion.”；Q3 使用“还差收尾时，要找出最后哪一步没做，不代表前面完成的部分都没有价值。 / Unfinished closure calls for finding the missing final step; it does not make earlier work worthless.”。提示后答对记辅助完成；提示后仍错进入对应 R 分支，不记独立正确证据。Q1 错误→R1；Q2 错误→R2；Q3 错误→R3。每个目标一次最多两轮；本卡仅一条匹配的已编补题时，不拿其他目标的题凑第二轮。补题仍错就展示本卡 T1/T2 或 T3 的具体总结，保存该目标待回访，继续后续内容。完整处理见[动态约定](#adaptive-contract)。

**继续、完成与回访**：每题提交后保留明确反馈，点“继续 / Continue”进入下一步；不自动跳走。首次总结“世界代表这一阶段圆满完成：各部分分别做好，也合在一起，形成了完整成果。它可以带来告一段落的满足，但不意味着以后再也不用学习。 / The World represents fulfillment at the end of a phase: completed parts combine into a whole result. It can bring satisfaction without ending all future learning.”并再次显示 T2 的做法。完成只记本次已学，不宣布精通。V1 在后续学习日检验能否把同一主题用于另一情境；逆位误解回访先重读 T3，再用 R3 检查，标记为复现题而不冒称全新迁移证据。暂停按步骤ID恢复，保持图尺度和答案状态；使用[共用文案](#ui-copy)。


<a id="card-w01"></a>
### w01 · 权杖王牌 / Ace of Wands

**目标 / Goal**：理解权杖王牌的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w01.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands01.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w01-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 有了新灵感，也有了想开始做点什么的热情。 权杖刚长出新芽，可以用来记住“刚开始”。有了灵感，还得继续做下去，才会有成果。
>
> A fresh impulse or creative idea offers an opening for action. It is a beginning to explore, not a finished or guaranteed project.

**画面助记 / Visual memory support**：云中伸出一只手，握着长出新芽的权杖。用这根刚发芽的权杖，记住新出现的创意和干劲。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A hand emerging from a cloud holds a sprouting wand: the shoots help recall a new impulse. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：灵感、启动。 / inspiration; beginning. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：权杖对应火元素，可以联想行动的热情与创造力；王牌强调新开始，还不是成熟的成果。 / Wands relate to fire: action and creation. An Ace suggests emergence, not maturity.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖王牌 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：云中伸出一只手，握着长出新芽的权杖。用这根刚发芽的权杖，记住新出现的创意和干劲。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w01-application"></a>
**先看应用示范 / Read the worked application**

> 示范：有了手工产品的灵感，先做一个小样看看能否实现。先做一个小样，才能看看想法能不能实现；如果一直等所有条件齐备，就迟迟没有开始。
>
> Example: test a craft idea with a small prototype. This lesson turns fresh energy into a small trial; waiting for every condition postpones that start.

<a id="w01-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：原来想做短片，但一直没有安排第一次拍摄。这里的逆位，是想开始却卡住了。可以先拍一个做得到的场景，不必因此认定整个作品会失败。
>
> Case: a short-film idea has never reached a first filming session. Here the reversal means a blocked start; find one achievable starting action, rather than declaring permanent failure.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w01-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w01-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：发芽的权杖，可以帮助记住什么？ / What do the shoots help us remember?

- A．有了新的创作灵感，很想试一试 / A creative impulse is emerging
- B．整个创作已经完成 / The whole creation is finished

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：有了新的创作灵感，很想试一试。权杖刚长出新芽，可以用来记住“刚开始”。有了灵感，还得继续做下去，才会有成果。 / A is correct: A creative impulse is emerging. Shoots connect to a beginning; completion requires later action and is not established here.
- B 不对：权杖刚长出新芽，可以用来记住“刚开始”。有了灵感，还得继续做下去，才会有成果。 / B is incorrect: Shoots connect to a beginning; completion requires later action and is not established here.

<a id="w01-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w01-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：想写一个短篇故事，已经有了灵感。权杖王牌在建议位，哪种做法更合适？ / You have an idea for a short story. With the Ace of Wands as advice, which next step fits?

- A．先把人物设定和章节大纲写完整，再开始第一个场景 / Finish the character profiles and chapter outline before drafting the first scene
- B．先写一个场景，试出方向 / Draft one scene to test a direction

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先写一个场景，试出方向。先做一个小样，才能看看想法能不能实现；如果一直等所有条件齐备，就迟迟没有开始。 / B is correct: Draft one scene to test a direction. This lesson turns fresh energy into a small trial; waiting for every condition postpones that start.
- A 不对：请回到画面里的具体细节：先做一个小样，才能看看想法能不能实现；如果一直等所有条件齐备，就迟迟没有开始。 / A is incorrect: Return to the specific details in the picture: This lesson turns fresh energy into a small trial; waiting for every condition postpones that start.

<a id="w01-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w01-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：在短片迟迟没有第一次拍摄的案例里，逆位解释是哪一个？ / In the case with no first filming session, which reversed reading fits?

- A．想开始却迟迟没动手，需要先找到做得到的一步 / The start is blocked; identify what enables it
- B．灵感已经成熟，先等待合适的拍摄时机 / The idea is mature, so wait for the right moment to film

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：想开始却迟迟没动手，需要先找到做得到的一步。短片还没开始拍，所以这里的问题是怎样迈出第一步，不是拍好了等别人赞赏。 / A is correct: The start is blocked; identify what enables it. The case explicitly has not started; this reversal concerns starting difficulty, not recognition after completion.
- B 不对：这个判断忽略了题目给出的条件。短片还没开始拍，所以这里的问题是怎样迈出第一步，不是拍好了等别人赞赏。 / B is incorrect: This judgment overlooks a condition given in the question. The case explicitly has not started; this reversal concerns starting difficulty, not recognition after completion.

<a id="w01-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：现在有了想法，也有机会动手，但还要一步步做下去。能够开始，不等于已经成功。 记住：有了新的创作灵感，很想试一试，不是“整个创作已经完成”。 / A beginning means an opening for action; results still need further effort. Separate an opportunity to start from a guarantee of success. Compare: A creative impulse is emerging; this cannot be replaced by “The whole creation is finished”.

**题目 / Prompt**：想到做一个阳台花园，刚画了第一张草图。这是开始还是成果保证？ / a balcony-garden idea has its first sketch. Is this a start or a guarantee?

- A．第一张草图说明方案已经成熟，可以直接扩大种植规模 / The first sketch shows the plan is mature enough to expand the garden now
- B．有了新想法，可以开始试一试 / A new opening worth trying

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：有了新想法，可以开始试一试。有了草图，就有机会开始布置；能不能成为花园，还得看后面的种植和照料。 / B is correct: A new opening worth trying. An idea offers an opening; the garden still depends on later conditions.
- A 不对：这个结论比题目给出的信息多走了一步。有了草图，就有机会开始布置；能不能成为花园，还得看后面的种植和照料。 / A is incorrect: This conclusion goes beyond the information provided. An idea offers an opening; the garden still depends on later conditions.

<a id="w01-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：先完成一个做得到的小步骤，才算真正开始；只换一种说法，事情仍然没有往前走。 题目描述的是“想开始却迟迟没动手，需要先找到做得到的一步”，不是“已有成片，只差接受掌声”。 / A feasible first action addresses the blocked start; relabelling the situation does not create action. Return to the stated context: “The start is blocked; identify what enables it” fits this case; “A finished film only awaits applause” is unsupported by that context.

**题目 / Prompt**：迟迟没拍短片，因为不知道先拍什么。先做什么，才能开始拍？ / You have delayed filming because you do not know which scene to start with. What can you do first to get filming?

- A．选一个容易拍的场景安排试拍 / Choose one manageable scene and schedule a trial
- B．把迟迟没拍当成已经完成 / Treat the delay as if the film were complete

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：选一个容易拍的场景安排试拍。先完成一个做得到的小步骤，才算真正开始；只换一种说法，事情仍然没有往前走。 / A is correct: Choose one manageable scene and schedule a trial. A feasible first action addresses the blocked start; relabelling the situation does not create action.
- B 不对：先完成一个做得到的小步骤，才算真正开始；只换一种说法，事情仍然没有往前走。 / B is incorrect: A feasible first action addresses the blocked start; relabelling the situation does not create action.

<a id="w01-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：不用第一次就把整个作品做完。先做个小样试试，看看想法行不行。可以继续计划，但总要有一次真正动手。 / A starting exercise need not finish the entire work. Make one small, inspectable result to test whether the idea merits development; planning should not indefinitely replace action.

**新题 / New prompt**：想尝试设计桌游，已经知道基本玩法，下一步怎样应用权杖王牌？ / A board-game idea already has basic rules. How can Ace of Wands advice apply next?

- A．用纸片做一轮可试玩的小样。 / Make a paper prototype for one playable round.
- B．先完善发行定位和包装，再考虑安排试玩。 / Refine the launch positioning and packaging before arranging a playtest.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：用纸片做一轮可试玩的小样。 已经有了基本规则，就能做一个纸上版本试着玩。继续扩大设想却不试玩，仍然不知道游戏能不能玩起来。 / A is correct: Make a paper prototype for one playable round. Starting conditions exist; a prototype makes the impulse testable, while more imagining still postpones practice.
- B 不对：这个解释没有把画面线索连起来。已经有了基本规则，就能做一个纸上版本试着玩。继续扩大设想却不试玩，仍然不知道游戏能不能玩起来。 / B is incorrect: This reading does not connect the picture cues. Starting conditions exist; a prototype makes the impulse testable, while more imagining still postpones practice.

**依据 / Taught basis**：[本卡应用示范](#w01-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w01-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：想开发新菜式，突然有一个搭配灵感。哪句最贴近这张牌的主题？ / a new flavour combination sparks an idea. Which fits this card?

- A．无需试做就已证明适合开店 / It already proves a restaurant will succeed
- B．先试做一道菜，看看效果 / Make one trial dish to begin exploring

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先试做一道菜，看看效果。有了新菜的想法，可以先做一份试试；这还不能说明以后开店的经营结果。 / B is correct: Make one trial dish to begin exploring. Fresh inspiration supports a small start, not proof of a long-term business outcome.
- A 不对：有了新菜的想法，可以先做一份试试；这还不能说明以后开店的经营结果。 / A is incorrect: Fresh inspiration supports a small start, not proof of a long-term business outcome.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：有了新灵感，也有了想开始做点什么的热情。 记住意思就好，不必逐字背诵。 / The main meaning covered is: A fresh impulse or creative idea offers an opening for action. It is a beginning to explore, not a finished or guaranteed project. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w02"></a>
### w02 · 权杖二 / Two of Wands

**目标 / Goal**：理解权杖二的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w02.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands02.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w02-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 已经有了一定基础，正在规划下一步去哪里发展。 人物向远处看，可以帮助记住“正在规划”。想好了去哪里，不等于已经在那里取得成果。
>
> With some ground already established, consider where to expand next. The emphasis is on choosing a direction and planning, before that wider venture is achieved.

**画面助记 / Visual memory support**：人物站在城墙上，拿着地球仪望向远方。城墙可以帮助记住已有的基础，远望则对应下一步的打算。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A figure on a battlement holds a globe and looks outward, connecting a present base with possibilities beyond it. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：规划、选择、远景。 / planning; choice; outlook. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：权杖对应火元素，帮助记住想向外发展的热情；数字二在这张牌里帮助记住比较和选择，但不是每张二号牌都在讲二选一。 / Fire supports initiative; here two aids recall of choice and weighing directions, not a universal formula for every Two.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖二 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：人物站在城墙上，拿着地球仪望向远方。城墙可以帮助记住已有的基础，远望则对应下一步的打算。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w02-application"></a>
**先看应用示范 / Read the worked application**

> 示范：已有本地客户，先比较两个外地市场。还没决定怎样发展，就先比较各个方向。现在有了打算，不等于已经成功开展了新活动。
>
> Example: compare two new markets after establishing local clients. Choose a direction and examine the base first; an unexamined option is not an achieved expansion.

<a id="w02-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：已有稳定作品集，想接触外地客户，但因为不敢离开熟悉渠道而一直不做调查。这里的逆位，是因为害怕走出熟悉范围，迟迟没有规划下一步。
>
> Case: an established portfolio could reach clients elsewhere, but fear of unfamiliar channels prevents research. Here the reversal focuses on planning stalled by reluctance.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w02-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w02-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：人物拿着地球仪望向远方，对应哪种状态？ / Holding the globe and looking outward helps recall which stage?

- A．已经收获外部拓展成果 / Already harvesting the expansion's results
- B．已经有了一定基础，正在考虑下一步去哪里发展 / Planning expansion from an existing base

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：已经有了一定基础，正在考虑下一步去哪里发展。人物向远处看，可以帮助记住“正在规划”。想好了去哪里，不等于已经在那里取得成果。 / B is correct: Planning expansion from an existing base. Looking outward aids planning; the lesson does not turn a plan into an achieved result.
- A 不对：人物向远处看，可以帮助记住“正在规划”。想好了去哪里，不等于已经在那里取得成果。 / A is incorrect: Looking outward aids planning; the lesson does not turn a plan into an achieved result.

<a id="w02-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w02-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：社团已有固定活动，想去其他校区发展。权杖二在建议位，下一步更适合做什么？ / An established club wants to expand to other campuses. With the Two of Wands as advice, what fits next?

- A．先看看要面向哪些人、需要什么条件，再决定去哪里发展 / Compare audiences and resources before choosing a direction
- B．把尚未比较的方向直接记作成功 / Record an unexamined direction as a success

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：先看看要面向哪些人、需要什么条件，再决定去哪里发展。还没决定怎样发展，就先比较各个方向。现在有了打算，不等于已经成功开展了新活动。 / A is correct: Compare audiences and resources before choosing a direction. Choose a direction and examine the base first; an unexamined option is not an achieved expansion.
- B 不对：还没决定怎样发展，就先比较各个方向。现在有了打算，不等于已经成功开展了新活动。 / B is incorrect: Choose a direction and examine the base first; an unexamined option is not an achieved expansion.

<a id="w02-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w02-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：在因害怕陌生渠道而拒绝调查的案例里，逆位重点是什么？ / In the case of refusing research out of fear, what does the reversal emphasise?

- A．先沿用熟悉渠道，等需求主动出现再规划 / Stay with the familiar channel and plan after demand appears on its own
- B．只敢留在熟悉的范围，不敢考虑下一步 / The familiar comfort zone is constraining planning

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：只敢留在熟悉的范围，不敢考虑下一步。题目说的是因为害怕陌生渠道而迟迟不调查，计划还没往前走，更谈不上已经从新市场获利。 / B is correct: The familiar comfort zone is constraining planning. The stated issue is stalled planning, not evidence of returns from a new market.
- A 不对：这里要分清牌义的边界：题目说的是因为害怕陌生渠道而迟迟不调查，计划还没往前走，更谈不上已经从新市场获利。 / A is incorrect: The boundary of the card meaning matters here: The stated issue is stalled planning, not evidence of returns from a new market.

<a id="w02-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：正在比较去哪里，说明还在规划。有没有完成，要看事情实际做到哪一步。 记住：已经有了一定基础，正在考虑下一步去哪里发展，不是“已经收获外部拓展成果”。 / Comparing directions is planning; completion would need separate evidence. Compare: Planning expansion from an existing base; this cannot be replaced by “Already harvesting the expansion's results”.

**题目 / Prompt**：已经掌握一门技能，正在比较两个发展方向。哪项是当前状态？ / one skill is established and two directions are being compared. What describes the present?

- A．评估下一步向哪里发展 / Assessing where to go next
- B．两个方向的目标都已完成 / Both directions have already been completed

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：评估下一步向哪里发展。正在比较去哪里，说明还在规划。有没有完成，要看事情实际做到哪一步。 / A is correct: Assessing where to go next. Comparing directions is planning; completion would need separate evidence.
- B 不对：正在比较去哪里，说明还在规划。有没有完成，要看事情实际做到哪一步。 / B is incorrect: Comparing directions is planning; completion would need separate evidence.

<a id="w02-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：先调查，才知道新方向需要什么条件。现在不熟悉或不敢尝试，不等于客观上做不到。 题目描述的是“只敢留在熟悉的范围，不敢考虑下一步”，不是“新市场已经带来确定收益”。 / Research gives planning a basis; fear and unfamiliarity do not establish impossibility. Return to the stated context: “The familiar comfort zone is constraining planning” fits this case; “The new market has already produced definite returns” is unsupported by that context.

**题目 / Prompt**：想尝试远程合作，却因为不熟悉而一直不敢了解。先做什么更合适？ / You want to try remote collaboration but unfamiliarity keeps you from learning about it. What can you do first?

- A．先把远程合作搁置，等熟悉的人提出具体方案 / Set remote collaboration aside until someone familiar proposes a specific plan
- B．先查清合作条件，再决定是否拓展 / Research its conditions before deciding whether to expand

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先查清合作条件，再决定是否拓展。先调查，才知道新方向需要什么条件。现在不熟悉或不敢尝试，不等于客观上做不到。 / B is correct: Research its conditions before deciding whether to expand. Research gives planning a basis; fear and unfamiliarity do not establish impossibility.
- A 不对：这样做会漏掉题目里的关键一步。先调查，才知道新方向需要什么条件。现在不熟悉或不敢尝试，不等于客观上做不到。 / A is incorrect: This action skips a key step in the question. Research gives planning a basis; fear and unfamiliarity do not establish impossibility.

<a id="w02-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：想向外发展，先比较各个方向需要什么条件、自己已经具备什么。这样比较，是为了决定下一步去哪里。 / Planning compares possible directions against real conditions. Comparison is not delay: goals, requirements, and the existing base help determine where to expand.

**新题 / New prompt**：已有稳定线上课程，想开线下工作坊，还不清楚场地与受众。下一步是什么？ / An established online course may expand into workshops, but venue needs and audience are unclear. What comes next?

- A．不比较就把开办成功写入总结。 / Record successful expansion without comparing requirements.
- B．先比较场地要求与目标学员，再决定形式。 / Compare venue requirements and target learners before choosing a format.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先比较场地要求与目标学员，再决定形式。 还没弄清场地要求和学员需要什么，就要先调查、比较，不能把想办活动当成已经办成功了。 / B is correct: Compare venue requirements and target learners before choosing a format. Unsettled conditions call for an informed direction, not treating intention as achievement.
- A 不对：还没弄清场地要求和学员需要什么，就要先调查、比较，不能把想办活动当成已经办成功了。 / A is incorrect: “Record successful expansion without comparing requirements.” does not address the specific conditions. Unsettled conditions call for an informed direction, not treating intention as achievement.

**依据 / Taught basis**：[本卡应用示范](#w02-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w02-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：咖啡店已有稳定客源，想开课程但尚未决定形式。哪句贴近主题？ / a café has regular customers and is considering classes. Which fits?

- A．在现有基础上，比较接下来做什么更合适 / Use the current base to compare next directions
- B．课程已经成功，进入庆功阶段 / The classes have succeeded and it is time to celebrate

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：在现有基础上，比较接下来做什么更合适。店里已有稳定客源，但还没决定课程怎么办，所以现在是在规划，不是庆祝课程已经办完。 / A is correct: Use the current base to compare next directions. An existing base plus an undecided direction fits planning, not celebrating completion.
- B 不对：店里已有稳定客源，但还没决定课程怎么办，所以现在是在规划，不是庆祝课程已经办完。 / B is incorrect: An existing base plus an undecided direction fits planning, not celebrating completion.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：已经有了一定基础，正在规划下一步去哪里发展。 记住意思就好，不必逐字背诵。 / The main meaning covered is: With some ground already established, consider where to expand next. The emphasis is on choosing a direction and planning, before that wider venture is achieved. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w03"></a>
### w03 · 权杖三 / Three of Wands

**目标 / Goal**：理解权杖三的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w03.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands03.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w03-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 已经迈出向外发展的第一步，正在关注合作、外部机会和接下来的进展。 这里已经采取了行动，接下来是等待回应、观察进展，不是还停留在想象中。
>
> An initiative has already reached outward. Watch how it develops, follow up connections, and prepare for the next stage of expansion.

**画面助记 / Visual memory support**：人物身边立着三根权杖，目光望向海上的船只。可以借这个画面记住：已经迈出一步，正在看事情接下来怎样发展。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A figure looks toward ships at sea beside three wands, helping recall an outward venture and attention to its progress. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：向外拓展、跟进消息。 / outward expansion; following responses. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：权杖对应火元素，强调主动行动；三在这里帮助记住已经开始向外发展。海上的船可以辅助记忆，但不能据此认定一定是海外贸易。 / Fire aids outward initiative; three here recalls early development, but the ships do not establish literal overseas trade or dates.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖三 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：人物身边立着三根权杖，目光望向海上的船只。可以借这个画面记住：已经迈出一步，正在看事情接下来怎样发展。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w03-application"></a>
**先看应用示范 / Read the worked application**

> 示范：寄出合作提案后跟进回复。等消息的时候，也可以跟进进度、做好下一步准备，不必什么都不做。
>
> Example: follow up after sending a partnership proposal. Watching for a response includes follow-up and preparation, not disengaging from development.

<a id="w03-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：提案已经发出，对方反馈却比预计晚。这里的逆位，是事情开始后进展变慢了。可以查清对方是否收到、还有什么要求，不必把回复晚了当成一定失败。
>
> Case: a proposal has been sent but the response is late. Here the reversal means delay during expansion; check communication and conditions without equating delay with certain failure.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w03-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w03-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：权杖三更接近哪一种状态？ / Which state is taught for the Three of Wands here?

- A．已经采取行动，正在关注回应和进展 / Action has reached outward and its response is being watched
- B．还在选择方向，尚未把想法交给外部 / The direction is still being chosen and the idea has not reached anyone outside

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：已经采取行动，正在关注回应和进展。这里已经采取了行动，接下来是等待回应、观察进展，不是还停留在想象中。 / A is correct: Action has reached outward and its response is being watched. Outward action is already part of this lesson; observation follows that action.
- B 不对：请回到画面里的具体细节：这里已经采取了行动，接下来是等待回应、观察进展，不是还停留在想象中。 / B is incorrect: Return to the specific details in the picture: Outward action is already part of this lesson; observation follows that action.

<a id="w03-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w03-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：作品已提交给展览方，正在等回复。权杖三在建议位，下一步更适合做什么？ / Your artwork has been submitted to an exhibition and you are awaiting a reply. With the Three of Wands as advice, what fits next?

- A．先构思另一件作品，收到回复后再准备补充材料 / Develop another work and prepare the supporting material after a reply arrives
- B．确认接收情况并准备后续材料 / Confirm receipt and prepare follow-up material

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：确认接收情况并准备后续材料。等消息的时候，也可以跟进进度、做好下一步准备，不必什么都不做。 / B is correct: Confirm receipt and prepare follow-up material. Watching for a response includes follow-up and preparation, not disengaging from development.
- A 不对：这个选项忽略了图中已经给出的区别。等消息的时候，也可以跟进进度、做好下一步准备，不必什么都不做。 / A is incorrect: This option overlooks a distinction already visible in the picture. Watching for a response includes follow-up and preparation, not disengaging from development.

<a id="w03-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w03-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：提案发出后回复延迟，这张逆位牌提醒了什么？ / A proposal has been sent and the response is late. What does this reversal suggest?

- A．事情已经开始，但进展有延迟，需要查清原因 / Outward progress is delayed and conditions need checking
- B．回复延迟说明提案还没真正进入合作流程 / The delayed reply means the proposal has not truly entered the collaboration process

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：事情已经开始，但进展有延迟，需要查清原因。提案已经发出，只是回复迟迟没来。因此要跟进进度，不是认定自己从未行动。 / A is correct: Outward progress is delayed and conditions need checking. The proposal was explicitly sent; the difficulty occurs during its progress.
- B 不对：这个说法混淆了题目正在考的含义。提案已经发出，只是回复迟迟没来。因此要跟进进度，不是认定自己从未行动。 / B is incorrect: This statement confuses the meaning being tested. The proposal was explicitly sent; the difficulty occurs during its progress.

<a id="w03-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：产品已经交给合作方了，现在要看试用反馈、商量下一步，不能再说成还没开始行动。 记住：已经采取行动，正在关注回应和进展，不是“完全没有行动，只在幻想出发”。 / Delivery has occurred, so follow its development rather than describe a venture that never started. Compare: Action has reached outward and its response is being watched; this cannot be replaced by “No action has begun; departure is only imagined”.

**题目 / Prompt**：试用产品已经交给合作方，正在等测试回报。此时关注什么？ / a prototype has reached a partner and test feedback is pending. What matters now?

- A．把注意力转回完善样品，等合作方主动联系 / Return to refining the prototype and wait for the partner to make contact
- B．看看对方的试用反馈，再商量下一步怎样合作 / Test responses and the next collaboration step

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：看看对方的试用反馈，再商量下一步怎样合作。产品已经交给合作方了，现在要看试用反馈、商量下一步，不能再说成还没开始行动。 / B is correct: Test responses and the next collaboration step. Delivery has occurred, so follow its development rather than describe a venture that never started.
- A 不对：这里要分清牌义的边界：产品已经交给合作方了，现在要看试用反馈、商量下一步，不能再说成还没开始行动。 / A is incorrect: The boundary of the card meaning matters here: Delivery has occurred, so follow its development rather than describe a venture that never started.

<a id="w03-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：物流是已知阻碍；运输晚了，并不能说明产品没有价值。 题目描述的是“事情已经开始，但进展有延迟，需要查清原因”，不是“从未发出任何提案”。 / Transit is the known obstacle; delay does not establish the product's worth. Return to the stated context: “Outward progress is delayed and conditions need checking” fits this case; “No proposal was ever sent” is unsupported by that context.

**题目 / Prompt**：样品迟迟没有送到合作方。怎样处理更合适？ / Your samples have not reached the partner on time. Which response fits?

- A．查物流并与接收方调整安排 / Check transit and coordinate an updated arrangement
- B．仅凭延迟宣布产品没有价值 / Declare the product worthless solely because of the delay

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：查物流并与接收方调整安排。物流是已知阻碍；运输晚了，并不能说明产品没有价值。 / A is correct: Check transit and coordinate an updated arrangement. Transit is the known obstacle; delay does not establish the product's worth.
- B 不对：物流是已知阻碍；运输晚了，并不能说明产品没有价值。 / B is incorrect: Transit is the known obstacle; delay does not establish the product's worth.

<a id="w03-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：提案发出只是向外行动的开始。等待回应时，可以确认对方是否收到、了解后续流程，并准备对方可能需要的材料；这不等于催促对方立刻答应。 / Sending a proposal begins an outward venture. While awaiting a response, confirm receipt, learn the next steps, and prepare relevant materials; this need not pressure the recipient to agree immediately.

**新题 / New prompt**：已经投出展览申请，主办方说稍后需要作品尺寸。现在怎样做？ / An exhibition application is submitted and the organiser will need dimensions later. What fits now?

- A．核对作品尺寸并准备补充资料。 / Check dimensions and prepare the additional information.
- B．先继续修改作品，收到追问后再核对尺寸。 / Keep revising the work and check its dimensions after the organiser asks.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：核对作品尺寸并准备补充资料。 展览方已经要求补充作品尺寸，现在就可以核对并准备资料。只是等着、不做准备，可能耽误后续安排。 / A is correct: Check dimensions and prepare the additional information. The venture is in follow-up; preparing required information supports development, while stopping overlooks available work.
- B 不对：先别按这个做法继续；展览方已经要求补充作品尺寸，现在就可以核对并准备资料。只是等着、不做准备，可能耽误后续安排。 / B is incorrect: Do not continue with this approach yet; The venture is in follow-up; preparing required information supports development, while stopping overlooks available work.

**依据 / Taught basis**：[本卡应用示范](#w03-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w03-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：交换学习申请已经提交，正在安排可能的后续面试。哪句贴近？ / an exchange application is submitted and possible interviews are being prepared. Which fits?

- A．申请递交后不再查看通知，也不准备可能的面试。 / After submitting the application, stop checking notices and do not prepare for a possible interview.
- B．已经递交申请，继续了解后续机会 / Action is underway; follow the external opportunity

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：已经递交申请，继续了解后续机会。申请已经交出，下一步可以准备可能的面试；这不代表已经确定入选。 / B is correct: Action is underway; follow the external opportunity. Submission and preparation show follow-up after action, not a predetermined outcome.
- A 不对：申请已经递交，但不看通知也不准备面试，会漏掉权杖三强调的后续跟进。 / A is incorrect: After the application is sent, ignoring notices and interview preparation drops the follow-through that the Three of Wands calls for.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：已经迈出向外发展的第一步，正在关注合作、外部机会和接下来的进展。 记住意思就好，不必逐字背诵。 / The main meaning covered is: An initiative has already reached outward. Watch how it develops, follow up connections, and prepare for the next stage of expansion. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w04"></a>
### w04 · 权杖四 / Four of Wands

**目标 / Goal**：理解权杖四的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w04.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands04.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w04-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 一起做成了一件事，暂时安定下来，也能感受到相聚和庆祝的喜悦。 庆祝的是这一阶段已经取得的成果，不是说以后的事情都已经完成、不会再有变化。
>
> A stage has reached a stable, shared achievement. Acknowledge the milestone and enjoy belonging or celebration without assuming every future goal is finished.

**画面助记 / Visual memory support**：四根权杖上有花环，人物在其后举花，呈现庆祝的场景。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / Four wands carry a garland, with people raising flowers behind them: a visible setting of communal celebration. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：阶段成果、安定、一起庆祝。 / milestone; stability; shared celebration. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：权杖的行动在这里有了阶段成果；四帮助记住暂时安定下来，而不是以后永远不会变化。 / Fire-led action reaches a milestone; four aids recall of a stable frame, not a life without change.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖四 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：四根权杖上有花环，人物在其后举花，呈现庆祝的场景。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w04-application"></a>
**先看应用示范 / Read the worked application**

> 示范：首场演出结束，团队一起庆祝并休整。第一个作品已经完成，大家可以为它高兴。不用等所有长期目标都达成，才允许庆祝。
>
> Example: celebrate and rest after a first performance. A milestone may be recognised without waiting for every long-term goal.

<a id="w04-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：活动已完成，但团队成员尚未感到被接纳，庆祝安排也推迟。这里的逆位，提醒的是大家还没感到被接纳、得到支持。
>
> Case: an event is complete, but members do not feel included and celebration is postponed. Here the reversal concerns shared support that has not settled.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w04-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w04-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：这张牌里的庆祝，主要是在为什么而高兴？ / What does celebration mainly mean?

- A．为阶段成果高兴，也说明后续安排已经稳定 / Celebrate the milestone because it also shows the next stage is settled
- B．一起庆祝已经做成的事 / Celebrate what has been accomplished together

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：一起庆祝已经做成的事。庆祝的是这一阶段已经取得的成果，不是说以后的事情都已经完成、不会再有变化。 / B is correct: Celebrate what has been accomplished together. This is stability and celebration at a milestone, not a guarantee about all future goals.
- A 不对：这里要分清牌义的边界：庆祝的是这一阶段已经取得的成果，不是说以后的事情都已经完成、不会再有变化。 / A is incorrect: The boundary of the card meaning matters here: This is stability and celebration at a milestone, not a guarantee about all future goals.

<a id="w04-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w04-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：课程小组完成了第一个作品。权杖四在建议位，哪种做法更合适？ / Your study group has completed its first project. With the Four of Wands as advice, which response fits?

- A．一起庆祝成果，也休息一下 / Acknowledge the achievement together and take a short rest
- B．先继续推进下一个目标，等成果更完整再一起庆祝 / Move on to the next goal and celebrate together when the achievement feels more complete

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：一起庆祝成果，也休息一下。第一个作品已经完成，大家可以为它高兴。不用等所有长期目标都达成，才允许庆祝。 / A is correct: Acknowledge the achievement together and take a short rest. A milestone may be recognised without waiting for every long-term goal.
- B 不对：请回到画面里的具体细节：第一个作品已经完成，大家可以为它高兴。不用等所有长期目标都达成，才允许庆祝。 / B is incorrect: Return to the specific details in the picture: A milestone may be recognised without waiting for every long-term goal.

<a id="w04-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w04-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：已完成活动却缺少接纳感，这张逆位牌更贴近哪种情况？ / An event is finished but inclusion is missing. What does this reversal concern?

- A．活动按计划完成，接纳感的问题会随着庆祝慢慢缓解 / The event went to plan, so the sense of exclusion will ease through the celebration
- B．大家还没有感到被接纳、得到支持 / Shared support and belonging remain unsettled

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：大家还没有感到被接纳、得到支持。活动确实完成了，但成员还没有觉得自己受到接纳。逆位在这里提醒的是相处中的问题，不是说活动没发生。 / B is correct: Shared support and belonging remain unsettled. The reversal concerns shared support; it does not erase the stated completed event.
- A 不对：这个结论比题目给出的信息多走了一步。活动确实完成了，但成员还没有觉得自己受到接纳。逆位在这里提醒的是相处中的问题，不是说活动没发生。 / A is incorrect: This conclusion goes beyond the information provided. The reversal concerns shared support; it does not erase the stated completed event.

<a id="w04-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：搬进新工作室，让大家暂时安定下来；以后还有新任务，也不影响庆祝这次搬迁。 记住：一起庆祝已经做成的事，不是“所有目标从此永久完成”。 / The new space offers a stable milestone; future work may still arise. Compare: Celebrate what has been accomplished together; this cannot be replaced by “Every goal is permanently complete”.

**题目 / Prompt**：搬入新工作室后邀请伙伴一起整理和庆祝。主题是什么？ / partners organise and celebrate a new studio. What is the theme?

- A．为搬进新空间、暂时安定下来而一起庆祝 / Sharing an achieved point of stability
- B．新空间已经启用，接下来主要关注个人效率 / The new space is operating, so the next focus is individual efficiency

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：为搬进新空间、暂时安定下来而一起庆祝。搬进新工作室，让大家暂时安定下来；以后还有新任务，也不影响庆祝这次搬迁。 / A is correct: Sharing an achieved point of stability. The new space offers a stable milestone; future work may still arise.
- B 不对：这里要分清牌义的边界：搬进新工作室，让大家暂时安定下来；以后还有新任务，也不影响庆祝这次搬迁。 / B is incorrect: The boundary of the card meaning matters here: The new space offers a stable milestone; future work may still arise.

<a id="w04-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：让大家参与庆祝、感谢各自的付出，才会让人觉得自己是其中一员。场面热闹，不代表每个人都被照顾到了。 题目描述的是“大家还没有感到被接纳、得到支持”，不是“活动从未发生”。 / Belonging needs participation and recognition, not merely a festive appearance. Return to the stated context: “Shared support and belonging remain unsettled” fits this case; “The event never happened” is unsupported by that context.

**题目 / Prompt**：庆功时只邀请了负责人，其他出过力的伙伴都被漏掉了。怎样做更合适？ / Only the organiser was invited to celebrate, leaving out the other contributors. What would be a better response?

- A．照旧不邀请他们，认为他们已经觉得自己被接纳了 / Leave them uninvited and assume they already feel included
- B．感谢每位伙伴的付出，邀请他们一起庆祝 / Recognise contributors and include them in celebration

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：感谢每位伙伴的付出，邀请他们一起庆祝。让大家参与庆祝、感谢各自的付出，才会让人觉得自己是其中一员。场面热闹，不代表每个人都被照顾到了。 / B is correct: Recognise contributors and include them in celebration. Belonging needs participation and recognition, not merely a festive appearance.
- A 不对：让大家参与庆祝、感谢各自的付出，才会让人觉得自己是其中一员。场面热闹，不代表每个人都被照顾到了。 / A is incorrect: Belonging needs participation and recognition, not merely a festive appearance.

<a id="w04-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：一起庆祝已经做成的事，让大家知道各自的付出被记得，也休息一下。以后还有任务，也不影响为这次成果高兴。 / Celebrate what you have accomplished together, let everyone know their effort is appreciated, and take a rest. Future tasks do not stop you from enjoying this achievement.

**新题 / New prompt**：合唱团完成第一次公开演出，但下月还有演出。怎样应用权杖四建议？ / A choir finishes its first public performance, with another next month. What fits Four of Wands advice?

- A．因为还有下一场，就否认这次值得庆祝。 / Deny this milestone deserves celebration because another remains.
- B．一起庆祝这次演出，休息一下再准备下一场。 / Celebrate this performance, take a short rest, then prepare for the next one.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：一起庆祝这次演出，休息一下再准备下一场。 这次演出已经完成，值得庆祝；下月还有演出，并不会抹去这次的成果。 / B is correct: Celebrate this performance, take a short rest, then prepare for the next one. A milestone and future tasks can coexist; celebrating now does not declare everything finished.
- A 不对：这次演出已经完成，值得庆祝；下月还有演出，并不会抹去这次的成果。 / A is incorrect: “Deny this milestone deserves celebration because another remains.” does not address the specific conditions. A milestone and future tasks can coexist; celebrating now does not declare everything finished.

**依据 / Taught basis**：[本卡应用示范](#w04-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w04-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：一家人完成搬家，准备一起吃顿饭感谢彼此。哪句贴近？ / a household finishes moving and shares a meal in thanks. Which fits?

- A．庆祝搬家完成，一起开始新的生活 / Celebrate a shared life milestone
- B．搬家完成后先各自整理，等生活稳定再表达感谢 / After the move, organise separately and share thanks once daily life settles

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：庆祝搬家完成，一起开始新的生活。搬家终于完成了，可以一起吃饭庆祝。以后还会有别的事情要做，不是所有任务都结束了。 / A is correct: Celebrate a shared life milestone. Completing the move supports a milestone celebration, not lifelong completion.
- B 不对：这个说法混淆了题目正在考的含义。搬家终于完成了，可以一起吃饭庆祝。以后还会有别的事情要做，不是所有任务都结束了。 / B is incorrect: This statement confuses the meaning being tested. Completing the move supports a milestone celebration, not lifelong completion.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：一起做成了一件事，暂时安定下来，也能感受到相聚和庆祝的喜悦。 记住意思就好，不必逐字背诵。 / The main meaning covered is: A stage has reached a stable, shared achievement. Acknowledge the milestone and enjoy belonging or celebration without assuming every future goal is finished. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w05"></a>
### w05 · 权杖五 / Five of Wands

**目标 / Goal**：理解权杖五的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w05.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands05.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w05-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 大家都想按自己的想法做，意见彼此冲突，还没有配合起来。 几个人挥杖的方向不同，可以用来记住竞争和配合不足。有分歧，不等于彼此仇恨。
>
> Several people or forces are pushing their ideas at once, before coordination is established. Competition can reveal differences that need workable rules.

**画面助记 / Visual memory support**：多人各举权杖，动作方向不一，帮助记住竞争与缺少配合。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / People lift wands in differing directions; their lack of coordinated movement helps recall competing efforts. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：竞争、意见分歧、协调不足、磨合。 / competition; disagreement; poor coordination; working things out. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：权杖对应行动，五在这里帮助记住竞争和分歧。争着表达、缺少配合，不等于彼此仇恨，也不能据此认定有暴力。 / Wands express colliding initiatives here; five aids recall of disruption, not proof of hatred or actual violence.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖五 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：多人各举权杖，动作方向不一，帮助记住竞争与缺少配合。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w05-application"></a>
**先看应用示范 / Read the worked application**

> 示范：项目争论先统一目标和发言规则。先说清共同目标，再轮流把意见讲完，才有机会商量出做法。禁止大家说话，并不会让分歧自动消失。
>
> Example: agree on goals and speaking rules during project disagreement. Coordination gives disagreement a channel; banning expression does not create cooperation.

<a id="w05-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：团队表面不争论，却各做各的，未讨论的分歧继续拖慢工作。这里的逆位，是不肯谈分歧，结果彼此牵制、事情做不下去。
>
> Case: a team avoids open argument but works at cross-purposes. Here the reversal means unaddressed disagreement draining effort.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w05-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w05-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：多人动作不一，帮助记住哪个主题？ / What do the different directions help recall?

- A．大家各说各的，还没配合起来 / Multiple efforts have not been coordinated
- B．大家方向不同，说明各自方案已经成熟，只需选出较好的一项 / The different directions show several mature proposals, so the group just needs to choose the stronger one

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：大家各说各的，还没配合起来。几个人挥杖的方向不同，可以用来记住竞争和配合不足。有分歧，不等于彼此仇恨。 / A is correct: Multiple efforts have not been coordinated. The cue is uncoordinated effort, not proof that participants hate one another.
- B 不对：这个说法混淆了题目正在考的含义。几个人挥杖的方向不同，可以用来记住竞争和配合不足。有分歧，不等于彼此仇恨。 / B is incorrect: This statement confuses the meaning being tested. The cue is uncoordinated effort, not proof that participants hate one another.

<a id="w05-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w05-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：运动社团讨论训练安排时，大家各说各的，讨论不下去。权杖五在建议位，哪种做法更合适？ / Members of a sports club are discussing training but talk over one another and cannot move forward. With the Five of Wands as advice, what fits?

- A．先投票淘汰争议较大的意见，再讨论训练目标 / Vote out the most disputed proposal before discussing the training goal
- B．先明确训练目标和讨论顺序 / Clarify the training goal and discussion order

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先明确训练目标和讨论顺序。先说清共同目标，再轮流把意见讲完，才有机会商量出做法。禁止大家说话，并不会让分歧自动消失。 / B is correct: Clarify the training goal and discussion order. Coordination gives disagreement a channel; banning expression does not create cooperation.
- A 不对：这个选项忽略了图中已经给出的区别。先说清共同目标，再轮流把意见讲完，才有机会商量出做法。禁止大家说话，并不会让分歧自动消失。 / A is incorrect: This option overlooks a distinction already visible in the picture. Coordination gives disagreement a channel; banning expression does not create cooperation.

<a id="w05-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w05-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：在表面不吵却各做各的案例里，这张逆位牌更贴近哪种情况？ / In the apparently quiet but divided team, what does this reversal mean?

- A．不肯谈分歧，结果事情一直做不下去 / Avoiding disagreement sustains internal friction
- B．没有争吵就证明合作顺利 / No argument proves smooth cooperation

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：不肯谈分歧，结果事情一直做不下去。大家虽然不吵了，还是各做各的，工作照样被耽误。安静下来，不等于已经配合好了。 / A is correct: Avoiding disagreement sustains internal friction. The work is still slowed by disagreement; silence is not coordination.
- B 不对：大家虽然不吵了，还是各做各的，工作照样被耽误。安静下来，不等于已经配合好了。 / B is incorrect: The work is still slowed by disagreement; silence is not coordination.

<a id="w05-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：几个人抢着说话，说明还没商量好怎么配合，不能因此认定他们一直互相仇恨。 记住：大家各说各的，还没配合起来，不是“所有人已达成一致并配合”。 / Talking over one another supports poor coordination, not certain enduring hatred. Compare: Multiple efforts have not been coordinated; this cannot be replaced by “Everyone has agreed and is cooperating”.

**题目 / Prompt**：三位同学同时抢着讲各自方案，任务没人统筹。主要问题是什么？ / three students push plans at once and nobody coordinates. What is central?

- A．各自方案都很积极，继续自由发挥就会形成配合 / Each proposal is energetic, so continued free expression will develop into coordination
- B．需要先听完彼此的想法，再商量怎么配合 / Expression and action need coordination

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：需要先听完彼此的想法，再商量怎么配合。几个人抢着说话，说明还没商量好怎么配合，不能因此认定他们一直互相仇恨。 / B is correct: Expression and action need coordination. Talking over one another supports poor coordination, not certain enduring hatred.
- A 不对：这个解释把牌义带到了别处。几个人抢着说话，说明还没商量好怎么配合，不能因此认定他们一直互相仇恨。 / A is incorrect: This interpretation shifts the card meaning elsewhere. Talking over one another supports poor coordination, not certain enduring hatred.

<a id="w05-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：各自照原来的做法做，问题就还在。需要把任务和分歧说清楚，而不只是停止争吵。 题目描述的是“不肯谈分歧，结果事情一直做不下去”，不是“没有争吵就证明合作顺利”。 / Visible coordination is missing; silence has not removed the disagreement. Return to the stated context: “Avoiding disagreement sustains internal friction” fits this case; “No argument proves smooth cooperation” is unsupported by that context.

**题目 / Prompt**：大家不敢谈分工，结果重复做了同样的工作。怎样做更合适？ / People avoid discussing roles and end up duplicating work. What would help?

- A．把不同意见和分工摆出来讨论 / Discuss differing views and responsibilities
- B．继续避谈，认定问题已经消失 / Keep avoiding discussion and call the problem solved

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：把不同意见和分工摆出来讨论。各自照原来的做法做，问题就还在。需要把任务和分歧说清楚，而不只是停止争吵。 / A is correct: Discuss differing views and responsibilities. Visible coordination is missing; silence has not removed the disagreement.
- B 不对：各自照原来的做法做，问题就还在。需要把任务和分歧说清楚，而不只是停止争吵。 / B is incorrect: Visible coordination is missing; silence has not removed the disagreement.

<a id="w05-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：大家意见不同时，先说清要一起做成什么，再轮流把想法讲完、比较不同方案。不让人说话，并不会解决分歧。 / When views collide, clarify the shared task and how people will express and compare ideas. Coordination handles disagreement rather than requiring permanent silence.

**新题 / New prompt**：三位成员对活动流程各有主张，会议一直互相打断。哪项针对协调问题？ / Three members propose different event plans and keep interrupting each other. What addresses coordination?

- A．先确定活动目标，再让每人完整说明方案。 / Agree on the event goal and let each person explain a proposal.
- B．先选出表达最有说服力的人定方案，减少反复讨论。 / Let the most persuasive speaker choose the plan so the discussion stops circling.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：先确定活动目标，再让每人完整说明方案。 先知道要做什么，再听完每个人的方案，才好商量。禁止别人提不同意见，只是把问题藏起来。 / A is correct: Agree on the event goal and let each person explain a proposal. Goals and speaking rules support cooperation; banning disagreement merely hides unresolved issues.
- B 不对：这个解释把牌义带到了别处。先知道要做什么，再听完每个人的方案，才好商量。禁止别人提不同意见，只是把问题藏起来。 / B is incorrect: This interpretation shifts the card meaning elsewhere. Goals and speaking rules support cooperation; banning disagreement merely hides unresolved issues.

**依据 / Taught basis**：[本卡应用示范](#w05-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w05-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：几个社区小组都想优先使用同一场地。哪项建议贴近？ / several community groups want the same venue first. Which advice fits?

- A．让使用经验较长的小组先决定场地规则 / Let the group with the longest experience decide the venue rules
- B．一起商量使用规则，让不同小组都能说明需要 / Use shared rules to coordinate competing demands

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：一起商量使用规则，让不同小组都能说明需要。几个小组都想用同一场地，需要商量规则，不能只因竞争就认定大家都怀有恶意。 / B is correct: Use shared rules to coordinate competing demands. Competition calls for coordination and does not establish malicious motives.
- A 不对：先别按这个做法继续；几个小组都想用同一场地，需要商量规则，不能只因竞争就认定大家都怀有恶意。 / A is incorrect: Do not continue with this approach yet; Competition calls for coordination and does not establish malicious motives.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：大家都想按自己的想法做，意见彼此冲突，还没有配合起来。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Several people or forces are pushing their ideas at once, before coordination is established. Competition can reveal differences that need workable rules. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w06"></a>
### w06 · 权杖六 / Six of Wands

**目标 / Goal**：理解权杖六的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w06.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands06.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w06-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 努力有了成果，也得到别人的肯定，因此更有信心。 桂冠和周围的人群，可以帮助记住受到肯定、获得荣誉。它与“努力始终无人认可”不是同一个意思。
>
> An achievement becomes visible and receives recognition from others. Enjoy the confidence it brings while remembering that recognition is not permanent superiority.

**画面助记 / Visual memory support**：戴桂冠的人骑马穿过人群，权杖上也有花环。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A laurel-crowned rider moves among people, with a wreath on the wand: these details aid recall of publicly recognised achievement. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：获得成果、得到肯定、自信。 / visible achievement; recognition; confidence. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：火的行动获得回应；这里的六可以帮助记住成果得到肯定，不把每张六都读成获奖。 / Action associated with fire gains a response; six here aids recognition, not a rule that every Six means winning an award.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖六 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：戴桂冠的人骑马穿过人群，权杖上也有花环。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w06-application"></a>
**先看应用示范 / Read the worked application**

> 示范：作品展示获肯定后庆祝，也继续改进。得到肯定，可以更有信心；但下一次仍要练习，不能认定获奖后就一直领先。
>
> Example: celebrate praise for a presentation and keep improving. Recognition supports confidence; it does not prove permanent superiority.

<a id="w06-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：作品质量不错，却因没有获得预期掌声而全盘否定自己。这里的逆位，是太依赖别人的夸奖，才觉得自己做得好。
>
> Case: good work is dismissed by its maker because applause falls short. Here the reversal focuses on overdependence on external recognition.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w06-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w06-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：花环和周围的人群，可以帮助记住什么？ / What do the wreath and people help recall here?

- A．努力取得了成果，重点是自己心里感到满意 / The effort produced a result, with the emphasis on personal satisfaction
- B．努力做出了成果，也得到别人肯定 / An achievement is seen and recognised

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：努力做出了成果，也得到别人肯定。桂冠和周围的人群，可以帮助记住受到肯定、获得荣誉。它与“努力始终无人认可”不是同一个意思。 / B is correct: An achievement is seen and recognised. The theme is recognition that is present, not permanent invisibility.
- A 不对：这个解释把牌义带到了别处。桂冠和周围的人群，可以帮助记住受到肯定、获得荣誉。它与“努力始终无人认可”不是同一个意思。 / A is incorrect: This interpretation shifts the card meaning elsewhere. The theme is recognition that is present, not permanent invisibility.

<a id="w06-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w06-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：刚获得一次奖项，很受鼓舞。权杖六在建议位，怎样对待这次成绩更合适？ / You have won an award and feel encouraged. With the Six of Wands as advice, how can you respond to this achievement?

- A．接受肯定并继续练习 / Accept recognition and keep practising
- B．因获奖认定以后不必学习 / Treat the award as ending the need to learn

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：接受肯定并继续练习。得到肯定，可以更有信心；但下一次仍要练习，不能认定获奖后就一直领先。 / A is correct: Accept recognition and keep practising. Recognition supports confidence; it does not prove permanent superiority.
- B 不对：得到肯定，可以更有信心；但下一次仍要练习，不能认定获奖后就一直领先。 / B is incorrect: Recognition supports confidence; it does not prove permanent superiority.

<a id="w06-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w06-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：因掌声不足就否定所有努力，这张逆位牌更贴近哪种情况？ / Rejecting all effort because applause is insufficient illustrates what here?

- A．掌声不够，说明作品还没有值得肯定的成果 / The limited applause shows the work has not yet achieved something worth recognising
- B．太依赖别人夸奖，才觉得自己做得好 / Self-evaluation depends too heavily on applause

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：太依赖别人夸奖，才觉得自己做得好。题目里的人因为点赞少就否定自己，说明他很在意别人的评价，不是完全不在意。 / B is correct: Self-evaluation depends too heavily on applause. The case is explicitly driven by applause, not independence from recognition.
- A 不对：这个结论比题目给出的信息多走了一步。题目里的人因为点赞少就否定自己，说明他很在意别人的评价，不是完全不在意。 / A is incorrect: This conclusion goes beyond the information provided. The case is explicitly driven by applause, not independence from recognition.

<a id="w06-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：被公开表扬，说明这次的努力得到了肯定，不代表以后一直会胜过所有人。 记住：努力做出了成果，也得到别人肯定，不是“成果永远不可能被看见”。 / One instance establishes recognition, not a lifelong ranking. Compare: An achievement is seen and recognised; this cannot be replaced by “An achievement can never be seen”.

**题目 / Prompt**：老师公开肯定作品，学生信心增加。可以确认什么主题？ / public praise increases a student's confidence. What theme is supported?

- A．自己的努力得到了别人的肯定 / Effort receives external recognition
- B．公开肯定说明这次作品已经达到成熟水平 / The public praise shows this work has reached a mature standard

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：自己的努力得到了别人的肯定。被公开表扬，说明这次的努力得到了肯定，不代表以后一直会胜过所有人。 / A is correct: Effort receives external recognition. One instance establishes recognition, not a lifelong ranking.
- B 不对：公开肯定只能说明这次努力被看见，不能证明作品已经成熟。这里能确认的是外部认可，而不是永久水平。 / B is incorrect: Public praise shows that this effort was recognized; it does not prove the work is fully mature. The supported theme is external recognition, not a permanent level.

<a id="w06-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：没有得到很多点赞，也可以看看作品本身是否达到目标。不必只靠别人夸不夸来判断自己。 题目描述的是“太依赖别人夸奖，才觉得自己做得好”，不是“已经不在意任何外部评价”。 / The aim is to reduce reliance on applause alone, not intensify it. Return to the stated context: “Self-evaluation depends too heavily on applause” fits this case; “External evaluation no longer matters at all” is unsupported by that context.

**题目 / Prompt**：项目本身做得不错，却因为点赞少就想放弃。作决定前，还可以看什么？ / The project is good, but few likes make you want to abandon it. What else can you consider before deciding?

- A．先增加宣传，让点赞数跟上作品质量 / Increase promotion first so the likes catch up with the work's quality
- B．回看实际质量与目标，不只看点赞 / Review quality and goals as well as likes

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：回看实际质量与目标，不只看点赞。没有得到很多点赞，也可以看看作品本身是否达到目标。不必只靠别人夸不夸来判断自己。 / B is correct: Review quality and goals as well as likes. The aim is to reduce reliance on applause alone, not intensify it.
- A 不对：这个解释把牌义带到了别处。没有得到很多点赞，也可以看看作品本身是否达到目标。不必只靠别人夸不夸来判断自己。 / A is incorrect: This interpretation shifts the card meaning elsewhere. The aim is to reduce reliance on applause alone, not intensify it.

<a id="w06-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：接受认可和继续学习并不矛盾。被表扬可以增加信心，但下一项任务仍有自己的标准；不能用上一次掌声替代后续准备。 / Receiving recognition and continuing to learn are compatible. Praise can build confidence, but the next task has its own requirements; past applause does not replace preparation.

**新题 / New prompt**：设计作品刚获校内奖，下次项目使用陌生工具。怎样应用权杖六建议？ / A design wins a school award, but the next project uses an unfamiliar tool. What fits Six of Wands advice?

- A．继续沿用获奖时的工具，避免新工具影响表现。 / Keep using the award-winning toolset so an unfamiliar tool does not affect performance.
- B．接受肯定，同时为新工具安排练习。 / Accept the recognition and practise the unfamiliar tool.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：接受肯定，同时为新工具安排练习。 奖项肯定的是已有作品，不代表新工具也已经会用了。高兴之余，仍要练习没学过的内容。 / B is correct: Accept the recognition and practise the unfamiliar tool. Recognition shows existing work was appreciated, not mastery of unlearned material.
- A 不对：请回到画面里的具体细节：奖项肯定的是已有作品，不代表新工具也已经会用了。高兴之余，仍要练习没学过的内容。 / A is incorrect: Return to the specific details in the picture: Recognition shows existing work was appreciated, not mastery of unlearned material.

**依据 / Taught basis**：[本卡应用示范](#w06-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w06-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：志愿服务受到社区表扬。哪句贴近牌义？ / a community praises volunteer service. Which fits?

- A．自己的付出得到肯定，因此更有信心 / Contribution is noticed and recognition can build confidence
- B．受到表扬证明以后不会犯错 / Praise proves no future mistake is possible

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：自己的付出得到肯定，因此更有信心。被表扬说明这次做得到了认可，但以后做新事情，仍可能出错。 / A is correct: Contribution is noticed and recognition can build confidence. Praise corresponds to recognition and does not eliminate possible future mistakes.
- B 不对：被表扬说明这次做得到了认可，但以后做新事情，仍可能出错。 / B is incorrect: Praise corresponds to recognition and does not eliminate possible future mistakes.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：努力有了成果，也得到别人的肯定，因此更有信心。 记住意思就好，不必逐字背诵。 / The main meaning covered is: An achievement becomes visible and receives recognition from others. Enjoy the confidence it brings while remembering that recognition is not permanent superiority. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w07"></a>
### w07 · 权杖七 / Seven of Wands

**目标 / Goal**：理解权杖七的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w07.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands07.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w07-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 面对挑战或质疑，努力守住已经争取到的位置，坚持重要的立场。 重点是守住真正重要的事。每件小事都要争个输赢，反而会顾不上最该坚持的立场。
>
> Meet challenges by defending a position or boundary already gained. Decide what is worth protecting rather than treating every disagreement as a battle.

**画面助记 / Visual memory support**：人物站在高处抵住下方六根权杖，帮助记住迎接挑战。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A figure on higher ground holds off six lower wands, giving a visible cue for defending a position under challenge. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：守住立场、分清哪些立场值得坚持。 / holding a position; selective defence. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：火支持坚持行动；七只作本牌位置编号，不用数字推导一定要对抗。 / Fire supports sustained initiative; seven is not a numerical command to oppose others.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖七 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：人物站在高处抵住下方六根权杖，帮助记住迎接挑战。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w07-application"></a>
**先看应用示范 / Read the worked application**

> 示范：合作中说明不可退让的交付质量。说清哪些要求能接受、哪些不能让步，才能保住重要的工作。全部答应，可能连最关键的任务也做不好。
>
> Example: state a non-negotiable quality boundary. A boundary needs clear expression; accepting everything may sacrifice the priority.

<a id="w07-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：为了回应每一句批评，连休息也取消，重要工作反而受影响。这里的逆位，是每次争论都要回应，反而顾不上重要的事。
>
> Case: answering every criticism eliminates rest and harms essential work. Here the reversal focuses on excessive defence losing its priorities.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w07-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w07-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：权杖七说的坚持，主要是守住什么？ / What does persistence mainly protect?

- A．重要立场和已经争取的位置 / An important position or boundary already gained
- B．遇到挑战时尽量守住当前做法，不轻易调整 / When challenged, preserve the current approach and avoid changing it too readily

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：重要立场和已经争取的位置。重点是守住真正重要的事。每件小事都要争个输赢，反而会顾不上最该坚持的立场。 / A is correct: An important position or boundary already gained. Defence protects priorities; trying to win everything scatters effort.
- B 不对：这个解释没有把画面线索连起来。重点是守住真正重要的事。每件小事都要争个输赢，反而会顾不上最该坚持的立场。 / B is incorrect: This reading does not connect the picture cues. Defence protects priorities; trying to win everything scatters effort.

<a id="w07-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w07-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：社团不断要求你增加任务，已经影响最重要的工作。权杖七在建议位，哪种做法更合适？ / Extra club tasks are putting your most important work at risk. With the Seven of Wands as advice, which response fits?

- A．先把新增任务接下来，再从原任务中删掉一部分 / Accept the new tasks first, then remove part of the original workload
- B．说明能承担的范围并守住重要任务 / State capacity and protect the essential work

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：说明能承担的范围并守住重要任务。说清哪些要求能接受、哪些不能让步，才能保住重要的工作。全部答应，可能连最关键的任务也做不好。 / B is correct: State capacity and protect the essential work. A boundary needs clear expression; accepting everything may sacrifice the priority.
- A 不对：这个选项忽略了图中已经给出的区别。说清哪些要求能接受、哪些不能让步，才能保住重要的工作。全部答应，可能连最关键的任务也做不好。 / A is incorrect: This option overlooks a distinction already visible in the picture. A boundary needs clear expression; accepting everything may sacrifice the priority.

<a id="w07-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w07-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：回应所有批评而耽误重要工作，这张逆位牌更贴近哪种情况？ / Answering every criticism delays essential work. What does this reversal emphasise?

- A．每次争论都要回应，反而顾不上重要的事 / Defence loses selectivity and scatters energy
- B．已经有效保护最重要的工作 / The most important work is already protected effectively

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：每次争论都要回应，反而顾不上重要的事。题目说，争论已经耽误了重要工作。每条评论都要反击，反而没有守住最重要的事。 / A is correct: Defence loses selectivity and scatters energy. The case says essential work is harmed; excessive defence is not effective protection.
- B 不对：题目说，争论已经耽误了重要工作。每条评论都要反击，反而没有守住最重要的事。 / B is incorrect: The case says essential work is harmed; excessive defence is not effective protection.

<a id="w07-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：先分清哪些原则不能让步，哪些小争执可以放下，不必每件事都争到底。 记住：重要立场和已经争取的位置，不是“每一句小分歧都必须赢”。 / The lesson distinguishes priorities rather than escalating every dispute equally. Compare: An important position or boundary already gained; this cannot be replaced by “Victory in every minor disagreement”.

**题目 / Prompt**：朋友误解一句无关紧要的话，与合作底线相比该怎样分配精力？ / how should a minor verbal misunderstanding compare with an essential partnership boundary?

- A．先花时间解释那句误会，避免关系继续紧张 / Address the verbal misunderstanding first so the relationship does not stay tense
- B．优先说明并守住真正重要的底线 / Prioritise the genuinely important boundary

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：优先说明并守住真正重要的底线。先分清哪些原则不能让步，哪些小争执可以放下，不必每件事都争到底。 / B is correct: Prioritise the genuinely important boundary. The lesson distinguishes priorities rather than escalating every dispute equally.
- A 不对：先别按这个做法继续；先分清哪些原则不能让步，哪些小争执可以放下，不必每件事都争到底。 / A is incorrect: Do not continue with this approach yet; The lesson distinguishes priorities rather than escalating every dispute equally.

<a id="w07-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：少卷入无关争论，才能把精力留给重要的事。一直争下去，只会更累。 题目描述的是“每次争论都要回应，反而顾不上重要的事”，不是“已经有效保护最重要的工作”。 / Selecting what to defend restores priorities; endless argument continues the drain. Return to the stated context: “Defence loses selectivity and scatters energy” fits this case; “The most important work is already protected effectively” is unsupported by that context.

**题目 / Prompt**：每天花三小时反驳无关评论，重要工作却没时间做。怎样调整更合适？ / Three hours a day go into rebutting irrelevant comments, leaving little time for important work. What adjustment fits?

- A．停止无关争执，把精力留给必须坚持的事 / Stop irrelevant disputes and protect key boundaries
- B．挑较容易反驳的评论回应，证明立场站得住 / Respond to the easier comments to demonstrate that the position is defensible

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：停止无关争执，把精力留给必须坚持的事。少卷入无关争论，才能把精力留给重要的事。一直争下去，只会更累。 / A is correct: Stop irrelevant disputes and protect key boundaries. Selecting what to defend restores priorities; endless argument continues the drain.
- B 不对：这样做会漏掉题目里的关键一步。少卷入无关争论，才能把精力留给重要的事。一直争下去，只会更累。 / B is incorrect: This action skips a key step in the question. Selecting what to defend restores priorities; endless argument continues the drain.

<a id="w07-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：先说清哪些要求不能让步，哪些事情可以商量。守住重要任务不是把每条意见都拒绝，也不是为了避免冲突接受所有要求。 / A boundary states what must be preserved and what can be negotiated. Protecting essential work means neither rejecting every suggestion nor accepting every demand to avoid conflict.

**新题 / New prompt**：团队临时要求加两项装饰，但安全检查时间会因此被挤掉。这张牌在建议位时，怎样做更合适？ / Two decorative additions would remove time for a necessary safety check. How does this card apply?

- A．说明检查不能省，协商简化装饰。 / Keep the necessary check and negotiate simpler decorations.
- B．为了显得配合，接受加项并取消检查。 / Accept additions and cancel the check to appear cooperative.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：说明检查不能省，协商简化装饰。 必要的检查不能省，装饰要求则可以商量。把所有要求都答应下来，可能反而没时间做好检查。 / A is correct: Keep the necessary check and negotiate simpler decorations. The defined priority is the necessary check; negotiating decoration protects it rather than replacing a boundary with compliance.
- B 不对：必要的检查不能省，装饰要求则可以商量。把所有要求都答应下来，可能反而没时间做好检查。 / B is incorrect: “Accept additions and cancel the check to appear cooperative.” does not address the specific conditions. The defined priority is the necessary check; negotiating decoration protects it rather than replacing a boundary with compliance.

**依据 / Taught basis**：[本卡应用示范](#w07-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w07-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：研究小组被催省略必要检查。哪项更贴近？ / a research group is pressured to omit necessary checks. Which fits?

- A．先答应省略一次检查，等项目顺利后再恢复标准 / Agree to skip the check this time and restore the standard after the project moves forward
- B．说明检查的必要性并守住标准 / Explain why checks matter and maintain the standard

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：说明检查的必要性并守住标准。必要检查不能因为催促就省掉。说明理由、坚持标准，是在保护工作质量，不是为了争输赢。 / B is correct: Explain why checks matter and maintain the standard. The necessary checks are a defined priority to protect, not a trivial contest.
- A 不对：这个说法混淆了题目正在考的含义。必要检查不能因为催促就省掉。说明理由、坚持标准，是在保护工作质量，不是为了争输赢。 / A is incorrect: This statement confuses the meaning being tested. The necessary checks are a defined priority to protect, not a trivial contest.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：面对挑战或质疑，努力守住已经争取到的位置，坚持重要的立场。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Meet challenges by defending a position or boundary already gained. Decide what is worth protecting rather than treating every disagreement as a battle. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w08"></a>
### w08 · 权杖八 / Eight of Wands

**目标 / Goal**：理解权杖八的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w08.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands08.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w08-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 事情开始迅速推进，消息也可能接连到来。 八根权杖同向飞行，可以帮助记住速度和进展。八根并不是“八天”，不能只靠数量确定日期。
>
> Events, messages, or coordinated actions are moving quickly. Respond and organise while keeping pace, without converting the number into a fixed deadline.

**画面助记 / Visual memory support**：八根权杖同向掠过天空，呈现迅速而一致的运动。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / Eight wands move in one direction across an open sky, a clear cue for swift movement. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：快速推进、消息到来。 / rapid progress; incoming messages. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：火对应行动；八不是八天。速度来自本牌主题与画面，不能由数字单独预测日期。 / Fire relates to action; eight does not mean eight days. Speed is a theme of this card, not a date calculated from its number.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖八 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：八根权杖同向掠过天空，呈现迅速而一致的运动。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w08-application"></a>
**先看应用示范 / Read the worked application**

> 示范：多条关键消息到来，及时确认并整理待办。消息来得快，更要看清内容再及时回复；回得快，不等于时间和安排都核对好了。
>
> Example: confirm incoming updates and organise tasks. Fast progress needs clear responses; speed does not replace checking.

<a id="w08-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：几个人同时发来互相矛盾的行程更新，推进很急却出现误会。这里的逆位，是消息互相矛盾，沟通出了问题。
>
> Case: several conflicting schedule updates arrive at once. Progress is rapid but confused. Here the reversal concerns disordered communication.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w08-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w08-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：同向飞行的权杖帮助记哪个主题？ / What theme does the same-direction flight help recall?

- A．八根权杖对应八个连续步骤，需要按顺序推进 / The eight wands represent eight consecutive steps that should be followed in order
- B．消息或行动快速推进 / Messages or actions move rapidly

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：消息或行动快速推进。八根权杖同向飞行，可以帮助记住速度和进展。八根并不是“八天”，不能只靠数量确定日期。 / B is correct: Messages or actions move rapidly. The image aids speed; the count does not specify a time unit.
- A 不对：这个解释没有把画面线索连起来。八根权杖同向飞行，可以帮助记住速度和进展。八根并不是“八天”，不能只靠数量确定日期。 / A is incorrect: This reading does not connect the picture cues. The image aids speed; the count does not specify a time unit.

<a id="w08-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w08-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：几场面试的安排集中发来。权杖八在建议位，哪种做法更合适？ / Several interview arrangements arrive at once. With the Eight of Wands as advice, which response fits?

- A．及时确认时间并整理安排 / Confirm times promptly and organise the schedule
- B．因为进展快就不用核对时间 / Skip checking times because progress is fast

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：及时确认时间并整理安排。消息来得快，更要看清内容再及时回复；回得快，不等于时间和安排都核对好了。 / A is correct: Confirm times promptly and organise the schedule. Fast progress needs clear responses; speed does not replace checking.
- B 不对：消息来得快，更要看清内容再及时回复；回得快，不等于时间和安排都核对好了。 / B is incorrect: Fast progress needs clear responses; speed does not replace checking.

<a id="w08-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w08-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：行程通知互相冲突，这张逆位牌在建议位时，先处理什么更合适？ / Schedule notices conflict. What should this reversed case address first?

- A．先按最近收到的通知执行，之后再处理冲突 / Follow the most recently received notice first and resolve the conflict later
- B．核对消息，确认大家收到的是同一个安排 / Verify information and restore consistency

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：核对消息，确认大家收到的是同一个安排。几条通知给出的时间互相矛盾，需要先查清哪个有效。消息多，不代表安排已经清楚。 / B is correct: Verify information and restore consistency. The problem is inconsistent information; more messages do not ensure accuracy.
- A 不对：先别按这个做法继续；几条通知给出的时间互相矛盾，需要先查清哪个有效。消息多，不代表安排已经清楚。 / A is incorrect: Do not continue with this approach yet; The problem is inconsistent information; more messages do not ensure accuracy.

<a id="w08-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：这张牌可以帮助概括消息接连到来、事情加快，但不能用八根权杖算出确定日期。 记住：消息或行动快速推进，不是“进展必定在八天后结束”。 / The lesson supports speed and messages, not a definite date from the count. Compare: Messages or actions move rapidly; this cannot be replaced by “Progress definitely ends in eight days”.

**题目 / Prompt**：一周内收到多份合作回复。哪项是牌义支持的概括？ / several partnership replies arrive in one week. Which summary fits?

- A．回复集中到来，事情加快 / Responses arrive together and events accelerate
- B．仅凭八根权杖可确定八周后结束 / Eight pictured wands establish an end in eight weeks

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：回复集中到来，事情加快。这张牌可以帮助概括消息接连到来、事情加快，但不能用八根权杖算出确定日期。 / A is correct: Responses arrive together and events accelerate. The lesson supports speed and messages, not a definite date from the count.
- B 不对：这张牌可以帮助概括消息接连到来、事情加快，但不能用八根权杖算出确定日期。 / B is incorrect: The lesson supports speed and messages, not a definite date from the count.

<a id="w08-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：先确认哪个时间有效，再通知大家。把两个冲突的版本都转发出去，会让人更糊涂。 题目描述的是“核对消息，确认大家收到的是同一个安排”，不是“凭消息多就认定安排完全清楚”。 / Verifying the version reduces confusion; spreading both maintains it. Return to the stated context: “Verify information and restore consistency” fits this case; “Assume many messages mean a fully clear schedule” is unsupported by that context.

**题目 / Prompt**：收到两个版本的通知，集合时间不一样。先做什么更合适？ / Two notices give different meeting times. What can you do first?

- A．把两版都继续转发不作说明 / Keep forwarding both without explanation
- B．确认唯一有效版本再通知大家 / Confirm the valid version and inform everyone

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：确认唯一有效版本再通知大家。先确认哪个时间有效，再通知大家。把两个冲突的版本都转发出去，会让人更糊涂。 / B is correct: Confirm the valid version and inform everyone. Verifying the version reduces confusion; spreading both maintains it.
- A 不对：先确认哪个时间有效，再通知大家。把两个冲突的版本都转发出去，会让人更糊涂。 / A is incorrect: Verifying the version reduces confusion; spreading both maintains it.

<a id="w08-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：事情加快时，确认时间和整理安排是为了跟上进展。及时不等于未经核对：先确认关键消息，再迅速行动，才能避免不同任务互相冲突。 / When events accelerate, checking times and organising tasks helps keep pace. Promptness does not mean acting unchecked; verify key details and then move quickly to avoid clashes.

**新题 / New prompt**：同一天收到两场线上面试通知，其中一封刚改时间。哪项应用更合适？ / Two online interviews are announced, and one time has just changed. Which application fits?

- A．为了回应快，未经核对就同时答应两个时段。 / To respond quickly, accept both slots without checking.
- B．确认最新时间，再调整当天安排并回复。 / Confirm the current time, adjust the day, and reply.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：确认最新时间，再调整当天安排并回复。 及时回复之前，先核对改过的时间。不看清就答应，可能把两场面试排在同一时段。 / B is correct: Confirm the current time, adjust the day, and reply. The case needs both pace and coordination; unchecked quick commitments can create clashes.
- A 不对：及时回复之前，先核对改过的时间。不看清就答应，可能把两场面试排在同一时段。 / A is incorrect: “To respond quickly, accept both slots without checking.” does not address the specific conditions. The case needs both pace and coordination; unchecked quick commitments can create clashes.

**依据 / Taught basis**：[本卡应用示范](#w08-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w08-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：订单突然增加，几个步骤可同时推进。哪项建议贴近？ / orders rise suddenly and several tasks can move together. What fits?

- A．快速协调处理，同时确认关键消息 / Coordinate promptly while verifying key information
- B．按牌上数字承诺固定交付日期 / Promise a fixed delivery date from the printed number

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：快速协调处理，同时确认关键消息。订单增加后，可以加快协调，但什么时候能交货，要按实际工作量和人手来算，不能只看牌上的数字。 / A is correct: Coordinate promptly while verifying key information. Respond to acceleration, but delivery dates require real capacity information.
- B 不对：订单增加后，可以加快协调，但什么时候能交货，要按实际工作量和人手来算，不能只看牌上的数字。 / B is incorrect: Respond to acceleration, but delivery dates require real capacity information.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：事情开始迅速推进，消息也可能接连到来。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Events, messages, or coordinated actions are moving quickly. Respond and organise while keeping pace, without converting the number into a fixed deadline. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w09"></a>
### w09 · 权杖九 / Nine of Wands

**目标 / Goal**：理解权杖九的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w09.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands09.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w09-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 经历过困难，虽然疲惫，仍然没有放弃；同时也担心再受伤，保持着警惕。 头上的绷带让人想到受过伤，仍握着权杖站立则帮助记住继续坚持。两处细节要一起看。
>
> Past strain has made someone wary, yet they are still holding on. Protect what matters and allow recovery instead of confusing resilience with unlimited endurance.

**画面助记 / Visual memory support**：头缠绷带的人握杖站在一排权杖前，兼有坚持和防护的意味。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A bandaged figure grips a wand before a row of wands, recalling both persistence after strain and protective alertness. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：韧性、警觉、保留精力。 / resilience; vigilance; protecting capacity. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：权杖对应火元素，在这里表现为虽然疲惫，仍想坚持；九接近这组数字的末尾，但不代表事情已经结束。 / Fire appears as remaining resolve; nine here suggests a later phase, not complete closure.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖九 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：头缠绷带的人握杖站在一排权杖前，兼有坚持和防护的意味。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w09-application"></a>
**先看应用示范 / Read the worked application**

> 示范：保留核心复习任务，同时安排恢复。还想继续，就要留出恢复时间。已经疲惫时再不断加练，并不等于更坚强。
>
> Example: keep core revision and allow recovery. Resilience includes protecting the capacity to continue, not limitless escalation.

<a id="w09-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：连续承担任务后已经无法集中，仍要求自己不休息。这里的逆位，是已经太累，快撑不住了。
>
> Case: prolonged demands have undermined concentration, but rest is still refused. Here the reversal focuses on depleted endurance.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w09-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w09-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：绷带与仍然站立的姿态，合起来帮助记什么？ / What do the bandage and continued stance help recall together?

- A．虽然累了，仍在坚持，也小心不让自己再受伤 / Persistence after strain, with alertness
- B．没有受过考验，也不需要防护 / No strain has occurred and no protection is needed

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：虽然累了，仍在坚持，也小心不让自己再受伤。头上的绷带让人想到受过伤，仍握着权杖站立则帮助记住继续坚持。两处细节要一起看。 / A is correct: Persistence after strain, with alertness. The bandage and grip connect previous strain with continued persistence.
- B 不对：头上的绷带让人想到受过伤，仍握着权杖站立则帮助记住继续坚持。两处细节要一起看。 / B is incorrect: The bandage and grip connect previous strain with continued persistence.

<a id="w09-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w09-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：训练后已经疲惫，但还想完成比赛准备。权杖九在建议位，哪种安排更合适？ / You are tired after training but still want to prepare for a competition. With the Nine of Wands as advice, which arrangement fits?

- A．维持原训练量，把恢复安排放到比赛之后 / Maintain the current training load and schedule recovery after the competition
- B．守住关键训练并留出恢复时间 / Keep essential practice and allow recovery

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：守住关键训练并留出恢复时间。还想继续，就要留出恢复时间。已经疲惫时再不断加练，并不等于更坚强。 / B is correct: Keep essential practice and allow recovery. Resilience includes protecting the capacity to continue, not limitless escalation.
- A 不对：请回到画面里的具体细节：还想继续，就要留出恢复时间。已经疲惫时再不断加练，并不等于更坚强。 / A is incorrect: Return to the specific details in the picture: Resilience includes protecting the capacity to continue, not limitless escalation.

<a id="w09-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w09-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：连续消耗已无法集中，这张逆位牌更贴近哪种情况？ / Prolonged strain prevents concentration. What does this reversal concern?

- A．已经很累，快撑不住了 / The ability to keep going is depleted
- B．注意力下降说明需要更强的训练刺激来找回状态 / The loss of focus suggests stronger training is needed to regain form

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：已经很累，快撑不住了。已经累得无法集中，说明需要恢复精力。再加任务，并不会证明自己已经缓过来了。 / A is correct: The ability to keep going is depleted. The case shows fatigue; increased demands are not evidence of recovery.
- B 不对：这个判断忽略了题目给出的条件。已经累得无法集中，说明需要恢复精力。再加任务，并不会证明自己已经缓过来了。 / B is incorrect: This judgment overlooks a condition given in the question. The case shows fatigue; increased demands are not evidence of recovery.

<a id="w09-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：可以一边继续努力，一边注意保护自己。有所警惕，不等于已经放弃。 记住：虽然累了，仍在坚持，也小心不让自己再受伤，不是“没有受过考验，也不需要防护”。 / This card can hold both continued effort and self-protection; they are not mutually exclusive. Compare: Persistence after strain, with alertness; this cannot be replaced by “No strain has occurred and no protection is needed”.

**题目 / Prompt**：过去受挫后仍练习，但会先检查风险。哪句贴近？ / someone keeps practising after setbacks but checks risks first. Which fits?

- A．有警觉就等于已经放弃 / Vigilance necessarily means giving up
- B．还想继续努力，也会先注意风险 / Persistence and vigilance coexist

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：还想继续努力，也会先注意风险。可以一边继续努力，一边注意保护自己。有所警惕，不等于已经放弃。 / B is correct: Persistence and vigilance coexist. This card can hold both continued effort and self-protection; they are not mutually exclusive.
- A 不对：可以一边继续努力，一边注意保护自己。有所警惕，不等于已经放弃。 / A is incorrect: This card can hold both continued effort and self-protection; they are not mutually exclusive.

<a id="w09-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：连续几天都无法完成任务，说明已经很累了。减掉非必要任务、安排休息，才是在处理这个问题。 题目描述的是“已经很累，快撑不住了”，不是“只要再加任务就证明已经恢复”。 / The evidence points to reduced capacity; easing demands addresses rather than denies depletion. Return to the stated context: “The ability to keep going is depleted” fits this case; “Adding demands would prove recovery” is unsupported by that context.

**题目 / Prompt**：已经累得连续几天都做不完重要任务。接下来怎样安排更合适？ / You have been too exhausted to finish important tasks for several days. What arrangement would help next?

- A．减少非必要负担并安排恢复 / Reduce nonessential demands and recover
- B．把无法完成解释成还有无限精力 / Interpret difficulty as unlimited energy

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：减少非必要负担并安排恢复。连续几天都无法完成任务，说明已经很累了。减掉非必要任务、安排休息，才是在处理这个问题。 / A is correct: Reduce nonessential demands and recover. The evidence points to reduced capacity; easing demands addresses rather than denies depletion.
- B 不对：连续几天都无法完成任务，说明已经很累了。减掉非必要任务、安排休息，才是在处理这个问题。 / B is incorrect: The evidence points to reduced capacity; easing demands addresses rather than denies depletion.

<a id="w09-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：把力气留给重要的任务，不必不断给自己加码。累了以后，保留必要练习，也安排休息，才有精力继续。 / Persistence protects the core task rather than adding demands without limit. After strain, keeping essential practice and recovery makes continuation possible; rest is not automatic surrender.

**新题 / New prompt**：连续排练后声音疲惫，明天还要走台。这张牌在建议位时，怎样做更合适？ / After repeated rehearsals, a performer is tired and still has a stage walkthrough tomorrow. What fits the lesson?

- A．保留必要的走位准备，并安排恢复。 / Keep necessary blocking preparation and allow recovery.
- B．保持原排练量，把恢复留到走台结束。 / Keep the rehearsal load unchanged and recover after the walkthrough.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：保留必要的走位准备，并安排恢复。 留出恢复时间，是为了还能完成后面的任务。已经疲惫时继续加练，只会消耗更多精力。 / A is correct: Keep necessary blocking preparation and allow recovery. Protecting capacity serves continued work; escalating strain is not greater resilience.
- B 不对：这个做法没有解决眼前的情况。留出恢复时间，是为了还能完成后面的任务。已经疲惫时继续加练，只会消耗更多精力。 / B is incorrect: This action does not resolve the situation described. Protecting capacity serves continued work; escalating strain is not greater resilience.

**依据 / Taught basis**：[本卡应用示范](#w09-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w09-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：长期筹备活动后仍需守住最后检查。哪项更贴近？ / after long event preparation, final checks remain. Which fits?

- A．把最后检查交给临场状态，先集中精力继续推进 / Rely on performance-day judgement for the final check and keep pushing ahead now
- B．保持必要警觉，也保护剩余精力 / Keep necessary vigilance and protect remaining energy

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：保持必要警觉，也保护剩余精力。坚持了很久，最后仍要做好必要检查，也要留住精力。不能因为已经很辛苦，就认定后面不会出问题。 / B is correct: Keep necessary vigilance and protect remaining energy. Past effort does not eliminate later problems; persistence needs capacity and reasonable protection.
- A 不对：这里要分清牌义的边界：坚持了很久，最后仍要做好必要检查，也要留住精力。不能因为已经很辛苦，就认定后面不会出问题。 / A is incorrect: The boundary of the card meaning matters here: Past effort does not eliminate later problems; persistence needs capacity and reasonable protection.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：经历过困难，虽然疲惫，仍然没有放弃；同时也担心再受伤，保持着警惕。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Past strain has made someone wary, yet they are still holding on. Protect what matters and allow recovery instead of confusing resilience with unlimited endurance. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w10"></a>
### w10 · 权杖十 / Ten of Wands

**目标 / Goal**：理解权杖十的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w10.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands10.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w10-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 事情和责任都揽得太多，做起来已经很吃力。 抱着那么多权杖，连走路都很吃力，可以帮助记住负担过重。忙碌本身不代表每件事都值得做。
>
> Responsibilities have accumulated beyond a manageable load. The goal may still matter, but the burden needs examining, sharing, or reducing.

**画面助记 / Visual memory support**：人物抱着十根权杖弯身向前，视线和行动空间受限。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A person bends forward under ten wands, with restricted vision and movement: a direct cue for excessive load. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：负担、责任过量。 / burden; excessive responsibility. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：火的行动积累成负担；十提示这一轮累积，不自动代表成功、价值或必须继续承担。 / Accumulated action becomes a load; ten suggests culmination here, not automatic success, worth, or an obligation to carry on.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖十 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：人物抱着十根权杖弯身向前，视线和行动空间受限。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w10-application"></a>
**先看应用示范 / Read the worked application**

> 示范：重新分配过多工作。问题是一个人承担得太多。把任务分清、请别人分担，才能减轻负担；继续全包只会更累。
>
> Example: redistribute excessive work. Reducing excess addresses the problem; continuing to carry everything maintains it.

<a id="w10-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：原来一人包办活动，后来把场地和物料任务分别交给伙伴。这里的逆位，是开始把事情分出去，不再独自承担所有任务。
>
> Case: one person formerly managed an event alone and now delegates venue and materials. Here the reversal describes beginning to release a burden.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w10-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w10-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：弯身抱着许多权杖，主要帮助记什么？ / What does bending beneath many wands mainly help recall?

- A．任务多说明承担能力强，应该维持现有负荷 / A large workload reflects strong capacity, so the current load should be maintained
- B．事情揽得太多，做起来很吃力 / Responsibilities are excessive and movement is burdened

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：事情揽得太多，做起来很吃力。抱着那么多权杖，连走路都很吃力，可以帮助记住负担过重。忙碌本身不代表每件事都值得做。 / B is correct: Responsibilities are excessive and movement is burdened. The lesson describes the cost of carrying a load, not busyness as proof of value.
- A 不对：这个选项忽略了图中已经给出的区别。抱着那么多权杖，连走路都很吃力，可以帮助记住负担过重。忙碌本身不代表每件事都值得做。 / A is incorrect: This option overlooks a distinction already visible in the picture. The lesson describes the cost of carrying a load, not busyness as proof of value.

<a id="w10-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w10-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：一位学生包办了小组的所有任务，已经忙不过来。权杖十在建议位，哪种做法更合适？ / A student is overwhelmed by handling every group task alone. With the Ten of Wands as advice, which step fits?

- A．列清任务并协商分担 / List tasks and agree on shared responsibilities
- B．先调整自己的时间，提高处理任务的效率 / Reorganise personal time and improve the efficiency of handling the tasks

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：列清任务并协商分担。问题是一个人承担得太多。把任务分清、请别人分担，才能减轻负担；继续全包只会更累。 / A is correct: List tasks and agree on shared responsibilities. Reducing excess addresses the problem; continuing to carry everything maintains it.
- B 不对：请回到画面里的具体细节：问题是一个人承担得太多。把任务分清、请别人分担，才能减轻负担；继续全包只会更累。 / B is incorrect: Return to the specific details in the picture: Reducing excess addresses the problem; continuing to carry everything maintains it.

<a id="w10-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w10-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：把活动任务分给伙伴后，这张逆位牌更贴近哪种情况？ / After event tasks are delegated, what does this reversal mean here?

- A．任务分出去以后，协调责任也交给接手的伙伴 / Once tasks are delegated, the coordinating responsibility passes to the partners who take them
- B．开始卸下并重新分配负担 / Beginning to release and redistribute the burden

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：开始卸下并重新分配负担。把任务分给伙伴，可以减轻自己的负担，但活动仍要继续做，不是从此没有责任。 / B is correct: Beginning to release and redistribute the burden. Redistribution changes how responsibility is carried, not whether it ever exists.
- A 不对：这个判断忽略了题目给出的条件。把任务分给伙伴，可以减轻自己的负担，但活动仍要继续做，不是从此没有责任。 / A is incorrect: This judgment overlooks a condition given in the question. Redistribution changes how responsibility is carried, not whether it ever exists.

<a id="w10-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：人物被一大捆权杖挡住视线，走路也很费力。这里要记住负担过重，而不是认定每项任务都值得承担。 记住：事情揽得太多，做起来很吃力，不是“任务越多就一定越有价值”。 / Restricted movement cues the cost of overload, not the worth of every task. Compare: Responsibilities are excessive and movement is burdened; this cannot be replaced by “More tasks necessarily mean more value”.

**题目 / Prompt**：忙到看不到下一步路，仍说越忙越有价值。哪种理解更合适？ / Someone is too busy to see the next step but calls greater busyness greater worth. Which interpretation fits better?

- A．任务太多，可能顾不上重要的事，需要重新取舍 / Excess work can obscure priorities and needs review
- B．先提高做事效率，再判断是否需要删减任务 / Improve working efficiency before deciding whether the workload needs to be reduced

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：任务太多，可能顾不上重要的事，需要重新取舍。人物被一大捆权杖挡住视线，走路也很费力。这里要记住负担过重，而不是认定每项任务都值得承担。 / A is correct: Excess work can obscure priorities and needs review. Restricted movement cues the cost of overload, not the worth of every task.
- B 不对：这样做会漏掉题目里的关键一步。人物被一大捆权杖挡住视线，走路也很费力。这里要记住负担过重，而不是认定每项任务都值得承担。 / B is incorrect: This action skips a key step in the question. Restricted movement cues the cost of overload, not the worth of every task.

<a id="w10-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：减轻负担，可以是交出一部分工作，仍负责必要的事情，不是非得什么都不做。 题目描述的是“开始卸下并重新分配负担”，不是“所有责任已经永久消失”。 / Release adjusts the load; it does not require abandoning every duty. Return to the stated context: “Beginning to release and redistribute the burden” fits this case; “All responsibility has vanished permanently” is unsupported by that context.

**题目 / Prompt**：把两项任务分给伙伴，自己仍负责协调。这样算减轻负担吗？ / Two tasks are delegated while you still coordinate the work. Does this count as easing your burden?

- A．只分出执行任务还不算减负，协调也应交出去 / Delegating execution does not reduce the burden unless coordination is handed over too
- B．分出去一部分任务，自己仍负责该做的事 / A more workable load with necessary responsibility retained

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：分出去一部分任务，自己仍负责该做的事。减轻负担，可以是交出一部分工作，仍负责必要的事情，不是非得什么都不做。 / B is correct: A more workable load with necessary responsibility retained. Release adjusts the load; it does not require abandoning every duty.
- A 不对：这个判断忽略了题目给出的条件。减轻负担，可以是交出一部分工作，仍负责必要的事情，不是非得什么都不做。 / A is incorrect: This judgment overlooks a condition given in the question. Release adjusts the load; it does not require abandoning every duty.

<a id="w10-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：重新分担不是逃避责任，而是把过量任务拆清楚：哪些必须本人做、哪些可以交接、哪些可以延期。必须明确交接，不能只是希望别人自动接手。 / Redistribution is not avoidance. Separate tasks that require you, can be handed over, or can wait. Make handovers explicit instead of hoping others automatically take over.

**新题 / New prompt**：活动负责人同时包办报名、采购和主持，已无时间核对现场。这张牌在建议位时，怎样做更合适？ / An organiser handles registration, purchasing, and hosting with no time for venue checks. What fits?

- A．压缩每项任务的用时，继续由负责人统一完成。 / Shorten the time spent on each task and keep the organiser responsible for completing them.
- B．协商交接可分担任务，保留必要的现场核对。 / Agree on handovers and retain essential venue checks.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：协商交接可分担任务，保留必要的现场核对。 一个人已经忙不过来，就要把任务交接清楚。继续全包，可能连必要检查都没时间做。 / B is correct: Agree on handovers and retain essential venue checks. The known issue is overload; explicit sharing addresses it, while busyness alone does not show duties are covered.
- A 不对：这个做法没有解决眼前的情况。一个人已经忙不过来，就要把任务交接清楚。继续全包，可能连必要检查都没时间做。 / A is incorrect: This action does not resolve the situation described. The known issue is overload; explicit sharing addresses it, while busyness alone does not show duties are covered.

**依据 / Taught basis**：[本卡应用示范](#w10-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w10-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：照顾社区活动时一人承担采购、布置、联络而疲惫。哪项贴近建议？ / one organiser is exhausted by shopping, setup, and communication. What fits?

- A．把可分担的工作明确分出去 / Explicitly share work that others can carry
- B．重新排好三项工作的先后，继续由一人完成 / Reorder the three duties and continue having one organiser complete them

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：把可分担的工作明确分出去。已经累到顾不过来，说明一个人承担太多了。把能分担的任务交接出去，才能减轻负担。 / A is correct: Explicitly share work that others can carry. Exhaustion reveals a load problem that appropriate sharing can address.
- B 不对：这个做法没有解决眼前的情况。已经累到顾不过来，说明一个人承担太多了。把能分担的任务交接出去，才能减轻负担。 / B is incorrect: This action does not resolve the situation described. Exhaustion reveals a load problem that appropriate sharing can address.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：事情和责任都揽得太多，做起来已经很吃力。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Responsibilities have accumulated beyond a manageable load. The goal may still matter, but the burden needs examining, sharing, or reducing. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w11"></a>
### w11 · 权杖侍从 / Page of Wands

**目标 / Goal**：理解权杖侍从的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w11.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands11.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w11-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 对新想法很好奇，带着热情，愿意从第一次尝试开始。 这里的“侍从”描述初学时好奇、愿意尝试的样子，不是只指某个年龄的人。
>
> Approach a new idea with a learner’s curiosity and willingness to try. Enthusiasm is an invitation to experiment, not proof of established expertise.

**画面助记 / Visual memory support**：站立人物端详发芽的权杖，帮助记住刚开始探索的状态。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A standing figure examines a sprouting wand, helping recall an exploratory beginner’s attention. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：好奇、热情、初步尝试。 / curiosity; enthusiasm; first experiments. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：侍从可以帮助记住刚开始接触、试着做做看的状态；火关联创意行动，不限定年轻人或任何性别。 / The Page is a role of beginning and experimenting; fire relates to creative action, not a fixed age or gender.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖侍从 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：站立人物端详发芽的权杖，帮助记住刚开始探索的状态。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w11-application"></a>
**先看应用示范 / Read the worked application**

> 示范：先上一节体验课再判断兴趣。不论几岁，都可以从初学者开始。亲手试一次，才能更清楚自己喜不喜欢。
>
> Example: take one trial class before judging an interest. A beginner role is open at any age; a small trial tests interest.

<a id="w11-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：不断收藏新兴趣教程，却每次都在第一次实践前转向下一个兴趣。这里的逆位，是很有兴趣，却始终没有亲手试过。
>
> Case: new-hobby tutorials are collected, but attention shifts before any first attempt. Here the reversal concerns enthusiasm that never reaches a trial.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w11-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w11-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：权杖侍从描述的是哪一种状态？ / What does the Page describe?

- A．带着好奇尝试新想法的状态 / A curious state of trying new ideas
- B．主要描述年轻、经验较少的学习者 / It mainly describes a young learner with limited experience

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：带着好奇尝试新想法的状态。这里的“侍从”描述初学时好奇、愿意尝试的样子，不是只指某个年龄的人。 / A is correct: A curious state of trying new ideas. The court role describes a learning and action style rather than fixing age.
- B 不对：这个选项忽略了图中已经给出的区别。这里的“侍从”描述初学时好奇、愿意尝试的样子，不是只指某个年龄的人。 / B is incorrect: This option overlooks a distinction already visible in the picture. The court role describes a learning and action style rather than fixing age.

<a id="w11-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w11-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：一位成年人第一次对陶艺产生兴趣。权杖侍从在建议位，哪种做法更合适？ / An adult has become interested in pottery for the first time. With the Page of Wands as advice, which step fits?

- A．因不是年轻人就不能开始 / Rule out starting because the learner is not young
- B．亲手试做一个简单器物 / Try making one simple piece

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：亲手试做一个简单器物。不论几岁，都可以从初学者开始。亲手试一次，才能更清楚自己喜不喜欢。 / B is correct: Try making one simple piece. A beginner role is open at any age; a small trial tests interest.
- A 不对：不论几岁，都可以从初学者开始。亲手试一次，才能更清楚自己喜不喜欢。 / A is incorrect: A beginner role is open at any age; a small trial tests interest.

<a id="w11-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w11-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：只收藏教程却不停换兴趣，这张逆位牌更贴近哪种情况？ / Collecting tutorials while changing interests illustrates what here?

- A．很有兴趣，却始终没有亲手试过 / Enthusiasm is not becoming an initial experiment
- B．收藏的教程已经足够说明自己适合这些兴趣 / Collecting the tutorials gives enough evidence that these interests are a good fit

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：很有兴趣，却始终没有亲手试过。他收藏了很多教程，却一次都没有做过，所以问题是迟迟没开始，而不是已经试过了。 / A is correct: Enthusiasm is not becoming an initial experiment. Practice is precisely what is missing; collecting does not replace trying.
- B 不对：这个结论比题目给出的信息多走了一步。他收藏了很多教程，却一次都没有做过，所以问题是迟迟没开始，而不是已经试过了。 / B is incorrect: This conclusion goes beyond the information provided. Practice is precisely what is missing; collecting does not replace trying.

<a id="w11-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：兴奋地开始尝试，正是这张牌的初学状态；这还不等于已经有了长期的专业经验。 记住：带着好奇尝试新想法的状态，不是“只能指某个年龄的人”。 / Willingness to try shows Page-like exploration, not established mastery. Compare: A curious state of trying new ideas; this cannot be replaced by “Only a person of a particular age”.

**题目 / Prompt**：第一次接触摄影，兴奋地尝试拍一组照片。怎样概括？ / a photography newcomer excitedly tries a photo series. What describes it?

- A．已经拥有长期成熟的专业经验 / Long-established expertise is already proven
- B．因为好奇，开始亲手试一试 / Curiosity drives an initial exploration

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：因为好奇，开始亲手试一试。兴奋地开始尝试，正是这张牌的初学状态；这还不等于已经有了长期的专业经验。 / B is correct: Curiosity drives an initial exploration. Willingness to try shows Page-like exploration, not established mastery.
- A 不对：兴奋地开始尝试，正是这张牌的初学状态；这还不等于已经有了长期的专业经验。 / A is incorrect: Willingness to try shows Page-like exploration, not established mastery.

<a id="w11-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：亲手做一次，才真正体验了这项兴趣；只收藏教程，还没有开始实践。 题目描述的是“很有兴趣，却始终没有亲手试过”，不是“已经通过实践确认全部兴趣”。 / A real trial grounds enthusiasm; bookmarking remains preparation. Return to the stated context: “Enthusiasm is not becoming an initial experiment” fits this case; “Every interest has already been tested in practice” is unsupported by that context.

**题目 / Prompt**：兴趣很多，却一次都没亲手试过。今天可以先做什么？ / You have many interests but have never tried any. What can you do first today?

- A．挑一个兴趣完成一次小体验 / Pick one interest for a small first experience
- B．继续增加收藏并称为已经实践 / Add more bookmarks and call that practice

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：挑一个兴趣完成一次小体验。亲手做一次，才真正体验了这项兴趣；只收藏教程，还没有开始实践。 / A is correct: Pick one interest for a small first experience. A real trial grounds enthusiasm; bookmarking remains preparation.
- B 不对：亲手做一次，才真正体验了这项兴趣；只收藏教程，还没有开始实践。 / B is incorrect: A real trial grounds enthusiasm; bookmarking remains preparation.

<a id="w11-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：新兴趣可以先用一次具体体验来了解。认真试一次，比只看介绍更能知道自己是否愿意继续；体验不是要求立刻成为专业人士。 / Explore a new interest through one concrete experience. Trying it reveals more about continued interest than descriptions alone; a trial does not demand instant expertise.

**新题 / New prompt**：对版画感兴趣，只读过介绍，还没操作过。这张牌在建议位时，怎样做更合适？ / A beginner is interested in printmaking but has only read descriptions. What applies the advice?

- A．参加一次基础体验，亲手完成一个小练习。 / Take an introductory session and complete one small exercise.
- B．先把基础理论学得比较完整，再安排第一次操作。 / Learn the foundations in depth before arranging the first hands-on attempt.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：参加一次基础体验，亲手完成一个小练习。 初学当然可以从基础做起。要求自己先达到专业水平才肯试，就一直没法开始。 / A is correct: Take an introductory session and complete one small exercise. Page-like exploration allows a basic start; requiring mastery first blocks initial learning.
- B 不对：这个做法没有解决眼前的情况。初学当然可以从基础做起。要求自己先达到专业水平才肯试，就一直没法开始。 / B is incorrect: This action does not resolve the situation described. Page-like exploration allows a basic start; requiring mastery first blocks initial learning.

**依据 / Taught basis**：[本卡应用示范](#w11-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w11-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：退休后第一次加入戏剧体验活动。哪句贴近？ / someone joins a first drama workshop after retirement. Which fits?

- A．年龄使侍从角色不适用 / Age makes the Page role inapplicable
- B．带着初学时的热情，尝试新的体验 / Explore a new experience with a beginner's enthusiasm

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：带着初学时的热情，尝试新的体验。这里的侍从说的是初学时的热情和好奇。退休后开始新兴趣，也可以有这种状态。 / B is correct: Explore a new experience with a beginner's enthusiasm. The role describes an attitude; age does not exclude curiosity or beginning.
- A 不对：这里的侍从说的是初学时的热情和好奇。退休后开始新兴趣，也可以有这种状态。 / A is incorrect: The role describes an attitude; age does not exclude curiosity or beginning.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：对新想法很好奇，带着热情，愿意从第一次尝试开始。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Approach a new idea with a learner’s curiosity and willingness to try. Enthusiasm is an invitation to experiment, not proof of established expertise. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w12"></a>
### w12 · 权杖骑士 / Knight of Wands

**目标 / Goal**：理解权杖骑士的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w12.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands12.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w12-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 热情高涨，主动行动，想尽快体验新事物、把事情往前推。 骑士和马正在向前，可以帮助记住主动出发；这里不只是心里有想法。
>
> Move toward a new venture with boldness, energy, and a desire to explore. Momentum needs follow-through; a spirited start alone does not establish lasting commitment.

**画面助记 / Visual memory support**：跃起的马与骑士举起的权杖，呈现快速行动的姿态。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / The energetic horse and raised wand suggest a rider already moving into action. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：冲劲、主动追求、冒险、推进。 / drive; active pursuit; adventure; movement. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：骑士强调主动追求；火增加冲劲，不能据宫廷身份猜性别或承诺期限。 / The Knight represents active pursuit; fire adds drive, not evidence of gender or commitment length.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖骑士 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：跃起的马与骑士举起的权杖，呈现快速行动的姿态。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w12-application"></a>
**先看应用示范 / Read the worked application**

> 示范：迅速启动活动，同时补上后续安排。热情能让人很快开始，但之后怎么做、什么时候再做，仍要安排好。
>
> Example: launch an activity and arrange follow-through. Enthusiasm enables a start, but continuity still requires arrangements.

<a id="w12-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：每遇新想法就立刻启动，几天后又换方向，原任务无人收尾。这里的逆位，是太急着开新项目，总换方向，原来的事却没做完。
>
> Case: every new idea triggers a start, then another switch leaves work unfinished. Here the reversal focuses on impulsiveness and inconsistent action.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w12-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w12-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：跃起的马，可以帮助记住哪种行动？ / What action style does the energetic horse help recall here?

- A．一直停在原地而不行动 / Remaining still without acting
- B．带着热情主动出发 / Setting out actively with enthusiasm

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：带着热情主动出发。骑士和马正在向前，可以帮助记住主动出发；这里不只是心里有想法。 / B is correct: Setting out actively with enthusiasm. This Knight's theme is moving into action, not merely holding an idea.
- A 不对：骑士和马正在向前，可以帮助记住主动出发；这里不只是心里有想法。 / A is incorrect: This Knight's theme is moving into action, not merely holding an idea.

<a id="w12-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w12-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：准备开始一次创作挑战。权杖骑士在建议位，怎样把热情变成持续的行动？ / You are preparing for a creative challenge. With the Knight of Wands as advice, how can enthusiasm become continued action?

- A．先动手做，再安排下次接着做什么 / Begin and schedule the next follow-through step
- B．趁热情较强时多开几个项目，之后再挑一个完成 / Start several projects while enthusiasm is high, then choose one to finish later

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：先动手做，再安排下次接着做什么。热情能让人很快开始，但之后怎么做、什么时候再做，仍要安排好。 / A is correct: Begin and schedule the next follow-through step. Enthusiasm enables a start, but continuity still requires arrangements.
- B 不对：这个解释没有把画面线索连起来。热情能让人很快开始，但之后怎么做、什么时候再做，仍要安排好。 / B is incorrect: This reading does not connect the picture cues. Enthusiasm enables a start, but continuity still requires arrangements.

<a id="w12-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w12-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：不断启动又换方向，这张逆位牌更贴近哪种情况？ / Repeated starts followed by switching illustrate what here?

- A．不断换方向说明探索范围正在稳步扩大 / Repeated changes of direction show that the range of exploration is steadily expanding
- B．开始时很有冲劲，却没坚持做完 / Drive lacks continuity and completion

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：开始时很有冲劲，却没坚持做完。题目说，原来的任务总是没人做完。开始很多次，不等于每件事都在好好进行。 / B is correct: Drive lacks continuity and completion. Tasks are explicitly abandoned; frequent starts do not equal steady progress.
- A 不对：这个结论比题目给出的信息多走了一步。题目说，原来的任务总是没人做完。开始很多次，不等于每件事都在好好进行。 / A is incorrect: This conclusion goes beyond the information provided. Tasks are explicitly abandoned; frequent starts do not equal steady progress.

<a id="w12-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：现在主动、热情，不等于以后一定能履行承诺；还要看后续行动。 记住：带着热情主动出发，不是“一直停在原地而不行动”。 / The lesson teaches pursuit, not a guarantee derived from present energy. Compare: Setting out actively with enthusiasm; this cannot be replaced by “Remaining still without acting”.

**题目 / Prompt**：有人积极邀请合作，能仅凭这张牌确认长期承诺吗？ / someone eagerly proposes collaboration. Does this card alone establish lasting commitment?

- A．不能，现在很主动，不代表以后一定会按约做到 / No; energetic action differs from lasting follow-through
- B．能，主动发出邀请说明他愿意长期投入 / Yes; making an eager invitation shows a willingness to stay committed

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：不能，现在很主动，不代表以后一定会按约做到。现在主动、热情，不等于以后一定能履行承诺；还要看后续行动。 / A is correct: No; energetic action differs from lasting follow-through. The lesson teaches pursuit, not a guarantee derived from present energy.
- B 不对：先核对眼前例子的条件：现在主动、热情，不等于以后一定能履行承诺；还要看后续行动。 / B is incorrect: Check the conditions in this example first: The lesson teaches pursuit, not a guarantee derived from present energy.

<a id="w12-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：先选一件做完，才能减少反复换方向的情况。继续开新项目，旧任务还是没人收尾。 题目描述的是“开始时很有冲劲，却没坚持做完”，不是“每项计划都已稳定推进”。 / Focusing action addresses inconsistency; more starts perpetuate unfinished work. Return to the stated context: “Drive lacks continuity and completion” fits this case; “Every plan is progressing steadily” is unsupported by that context.

**题目 / Prompt**：每周都换一个新项目，之前的总是做不完。怎样调整更合适？ / You switch projects every week and never finish the earlier ones. What adjustment fits?

- A．再开更多项目维持兴奋 / Start more projects to maintain excitement
- B．选定一项并安排明确收尾步骤 / Choose one project and schedule its completion steps

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：选定一项并安排明确收尾步骤。先选一件做完，才能减少反复换方向的情况。继续开新项目，旧任务还是没人收尾。 / B is correct: Choose one project and schedule its completion steps. Focusing action addresses inconsistency; more starts perpetuate unfinished work.
- A 不对：先选一件做完，才能减少反复换方向的情况。继续开新项目，旧任务还是没人收尾。 / A is incorrect: Focusing action addresses inconsistency; more starts perpetuate unfinished work.

<a id="w12-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：开始之后，还要安排下次什么时候做、谁负责把作品完成。光是不断开新项目，原来的事情不会自动做完。 / After a quick launch, define the next step. Enthusiasm fuels action, but follow-through needs timing and responsibility so repeated starts are not mistaken for completion.

**新题 / New prompt**：社团决定立刻做一个短视频，已拍了开头，却没安排剪辑。哪项应用更完整？ / A club quickly films the start of a video but has no editing arrangement. Which application is more complete?

- A．马上再开一个新视频，以新的兴奋替代收尾。 / Start another video and replace completion with new excitement.
- B．说清谁来剪辑、什么时候接着做。 / Assign editing and schedule the next step.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：说清谁来剪辑、什么时候接着做。 开头已经拍了，现在缺的是剪辑。再开一个视频，也不会让这个作品自动完成。 / B is correct: Assign editing and schedule the next step. Follow-through is missing; a new start does not finish the existing work.
- A 不对：开头已经拍了，现在缺的是剪辑。再开一个视频，也不会让这个作品自动完成。 / A is incorrect: “Start another video and replace completion with new excitement.” does not address the specific conditions. Follow-through is missing; a new start does not finish the existing work.

**依据 / Taught basis**：[本卡应用示范](#w12-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w12-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：户外社团积极启动新路线探索。哪句话更贴近权杖骑士的意思？ / an outdoor club actively begins exploring a new route. Which fits?

- A．有行动冲劲，同时仍要做准备与后续安排 / There is initiative, while preparation and follow-through still matter
- B．行动热情本身证明路线没有风险 / Enthusiasm itself proves the route has no risks

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：有行动冲劲，同时仍要做准备与后续安排。这张牌强调积极出发；路线是否合适、需要什么准备，还得实际检查。 / A is correct: There is initiative, while preparation and follow-through still matter. Active departure is the theme; real conditions still need separate checking.
- B 不对：这张牌强调积极出发；路线是否合适、需要什么准备，还得实际检查。 / B is incorrect: Active departure is the theme; real conditions still need separate checking.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：热情高涨，主动行动，想尽快体验新事物、把事情往前推。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Move toward a new venture with boldness, energy, and a desire to explore. Momentum needs follow-through; a spirited start alone does not establish lasting commitment. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w13"></a>
### w13 · 权杖王后 / Queen of Wands

**目标 / Goal**：理解权杖王后的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w13.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands13.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w13-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 自信、热情，愿意展现自己，也能带动周围的人。 自信可以让别人也愿意参与，不需要把所有人的注意力都抢到自己身上。
>
> Express enthusiasm with grounded confidence and invite others into what matters to you. Influence comes through a warm, engaging presence, not a requirement to dominate attention.

**画面助记 / Visual memory support**：王后持权杖与向日葵，坐姿开放，可帮助记住自信的表达。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / The seated figure holds a wand and sunflower with an open posture, helping recall confident, welcoming expression. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：自信、热情、感染力。 / confidence; warmth; engaging presence. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：王后在这里强调自信地展现自己、带动别人；权杖对应的火元素帮助记住热情。这种状态不限定性别。 / The Queen describes inhabiting and nurturing a quality steadily; fire relates to enthusiasm, not a female-only role.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖王后 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：王后持权杖与向日葵，坐姿开放，可帮助记住自信的表达。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w13-application"></a>
**先看应用示范 / Read the worked application**

> 示范：分享擅长的手工并邀请伙伴试做。可以大方分享自己的喜好，也给别人发言的机会。让人愿意加入，靠的不是压住别人的声音。
>
> Example: share a craft skill and invite others to try. Confident expression and others' participation can coexist; influence need not suppress.

<a id="w13-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：原来喜欢分享作品，现在因为担心不够好而完全不敢展示。这里的逆位，是变得不自信，不敢再展示自己。
>
> Case: someone once enjoyed sharing work but now avoids any display out of fear of inadequacy. Here the reversal focuses on diminished confidence.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w13-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w13-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：权杖王后的自信和热情，怎样表现出来？ / How is confident influence expressed?

- A．自然表达热情并邀请别人参与 / Express enthusiasm naturally and invite participation
- B．不断抢过话题，要求别人照自己的办法参与。 / Keep taking over the conversation and require others to follow your way of participating.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：自然表达热情并邀请别人参与。自信可以让别人也愿意参与，不需要把所有人的注意力都抢到自己身上。 / A is correct: Express enthusiasm naturally and invite participation. Warm confidence can engage others without monopolising attention.
- B 不对：抢过话题并要求别人照办，缺少权杖王后那种能邀请他人参与的热情与自信。 / B is incorrect: Taking over the conversation and dictating participation leaves no room for the warm confidence that invites others in.

<a id="w13-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w13-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：你准备组织读书活动。权杖王后在建议位，怎样让自己的热情带动大家？ / You are organising a reading group. With the Queen of Wands as advice, how can your enthusiasm encourage participation?

- A．把别人的发言都当成抢走光彩 / Treat others' contributions as stealing attention
- B．真诚介绍喜欢的书并给别人参与空间 / Introduce a loved book warmly and leave space for others

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：真诚介绍喜欢的书并给别人参与空间。可以大方分享自己的喜好，也给别人发言的机会。让人愿意加入，靠的不是压住别人的声音。 / B is correct: Introduce a loved book warmly and leave space for others. Confident expression and others' participation can coexist; influence need not suppress.
- A 不对：可以大方分享自己的喜好，也给别人发言的机会。让人愿意加入，靠的不是压住别人的声音。 / A is incorrect: Confident expression and others' participation can coexist; influence need not suppress.

<a id="w13-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w13-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：害怕不够好而不再展示作品，这张逆位牌更贴近哪种情况？ / Fear of inadequacy stops all sharing. What does this reversal concern?

- A．变得不自信，喜欢的事情也不敢展示了 / Reduced confidence is constraining expression
- B．已经自在地表达并接纳关注 / Expression and attention are already comfortable

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：变得不自信，喜欢的事情也不敢展示了。题目说他害怕作品不够好，已经不敢展示，不能理解成他正自在地表达自己。 / A is correct: Reduced confidence is constraining expression. The stated case is withdrawal, not ease in being seen.
- B 不对：题目说他害怕作品不够好，已经不敢展示，不能理解成他正自在地表达自己。 / B is incorrect: The stated case is withdrawal, not ease in being seen.

<a id="w13-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：这里看的是一个人是否自信、热情、愿意带动别人，不是看性别。 记住：自然表达热情并邀请别人参与，不是“必须让所有目光都只看自己”。 / This lesson reads court cards as qualities, not gender restrictions. Compare: Express enthusiasm naturally and invite participation; this cannot be replaced by “Require all attention to remain on oneself”.

**题目 / Prompt**：一个男性导师热情分享所长，鼓励别人加入。王后角色适用吗？ / a male mentor shares skills warmly and invites others in. Can the Queen role apply?

- A．不太适用，王后角色更侧重女性的表达方式 / It is a weaker fit because the Queen role is more about a feminine style of expression
- B．可以，描述的是自信热情的方式 / Yes; it describes a confident and warm style

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：可以，描述的是自信热情的方式。这里看的是一个人是否自信、热情、愿意带动别人，不是看性别。 / B is correct: Yes; it describes a confident and warm style. This lesson reads court cards as qualities, not gender restrictions.
- A 不对：这个结论比题目给出的信息多走了一步。这里看的是一个人是否自信、热情、愿意带动别人，不是看性别。 / A is incorrect: This conclusion goes beyond the information provided. This lesson reads court cards as qualities, not gender restrictions.

<a id="w13-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：先给可信的伙伴看一小部分，就能重新试着分享。要求自己完美之后才能展示，只会继续不敢开口。 题目描述的是“变得不自信，喜欢的事情也不敢展示了”，不是“已经自在地表达并接纳关注”。 / A real, modest act can restore participation; a perfection requirement keeps expression closed. Return to the stated context: “Reduced confidence is constraining expression” fits this case; “Expression and attention are already comfortable” is unsupported by that context.

**题目 / Prompt**：担心作品不够完美，一直不敢给别人看。可以先试着做什么？ / Fear that your work is imperfect keeps you from showing it to anyone. What could you try first?

- A．先向可信伙伴展示一个已完成部分 / Share one completed part with a trusted person
- B．继续打磨，等自己觉得足够成熟再展示 / Keep refining the work and share it after it feels mature enough

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：先向可信伙伴展示一个已完成部分。先给可信的伙伴看一小部分，就能重新试着分享。要求自己完美之后才能展示，只会继续不敢开口。 / A is correct: Share one completed part with a trusted person. A real, modest act can restore participation; a perfection requirement keeps expression closed.
- B 不对：这个说法混淆了题目正在考的含义。先给可信的伙伴看一小部分，就能重新试着分享。要求自己完美之后才能展示，只会继续不敢开口。 / B is incorrect: This statement confuses the meaning being tested. A real, modest act can restore participation; a perfection requirement keeps expression closed.

<a id="w13-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：可以大方分享自己喜欢的事，也邀请别人说说。不必包揽所有发言，别人参与也不会让自己变得不重要。 / Confidence makes your enthusiasm visible while leaving room for others. Energising an activity does not require all speaking time; inviting others does not diminish your worth.

**新题 / New prompt**：你主持手工交流会，新成员想展示自己的小作品。这张牌在建议位时，怎样做更合适？ / You host a craft gathering and a newcomer wants to show a small piece. What fits the lesson?

- A．热情介绍自己的经验，也邀请新人分享。 / Share your experience warmly and invite the newcomer.
- B．因怕注意力被分走，禁止别人展示。 / Ban other displays to prevent attention being shared.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：热情介绍自己的经验，也邀请新人分享。 邀请新人分享，能让更多人参与。怕被抢走注意力就禁止别人展示，不是这张牌所说的自信。 / A is correct: Share your experience warmly and invite the newcomer. An engaging presence grows participation; banning expression mistakes confidence for monopolising attention.
- B 不对：邀请新人分享，能让更多人参与。怕被抢走注意力就禁止别人展示，不是这张牌所说的自信。 / B is incorrect: “Ban other displays to prevent attention being shared.” does not address the specific conditions. An engaging presence grows participation; banning expression mistakes confidence for monopolising attention.

**依据 / Taught basis**：[本卡应用示范](#w13-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w13-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：同学主动带动校园园艺活动，也让新人尝试。哪句贴近？ / a student energises a gardening group and welcomes newcomers. Which fits?

- A．由带领者先确定做法，新人照着参与 / Let the leader set the approach and have newcomers follow it
- B．自信热情使他人愿意参与 / Confident enthusiasm invites participation

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：自信热情使他人愿意参与。能带动别人一起做，就是这张牌的热情和感染力，不必排除别人的主意。 / B is correct: Confident enthusiasm invites participation. The card's engaging quality includes others rather than requiring their exclusion.
- A 不对：这里要分清牌义的边界：能带动别人一起做，就是这张牌的热情和感染力，不必排除别人的主意。 / A is incorrect: The boundary of the card meaning matters here: The card's engaging quality includes others rather than requiring their exclusion.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：自信、热情，愿意展现自己，也能带动周围的人。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Express enthusiasm with grounded confidence and invite others into what matters to you. Influence comes through a warm, engaging presence, not a requirement to dominate attention. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-w14"></a>
### w14 · 权杖国王 / King of Wands

**目标 / Goal**：理解权杖国王的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/w14.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Wands14.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="w14-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 有明确的目标，能带领大家行动，也愿意为自己的决定负责。 要看这个人有没有带大家做事、承担责任，不是看有没有领导头衔。
>
> Give energetic activity a coherent direction and take responsibility for decisions. Leadership is shown through vision and enabling action, not merely by holding a job title.

**画面助记 / Visual memory support**：国王坐在有狮子图案的宝座上持杖，体现稳定的主导姿态。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / The seated figure holds a wand on a lion-decorated throne, a cue for an established directing presence. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：愿景、领导、担当。 / vision; leadership; accountability. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：国王在这里强调带领大家、为决定负责；火元素帮助记住热情和行动力。这种做事方式不只属于老板。 / The King is a role of directing and owning decisions; fire adds vision and initiative, not a literal boss identity.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 权杖国王 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：国王坐在有狮子图案的宝座上持杖，体现稳定的主导姿态。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="w14-application"></a>
**先看应用示范 / Read the worked application**

> 示范：明确项目目标和优先级，并协调所需资源。带大家做事，既要说清目标，也要安排人手和资源、处理困难。只喊口号还不够。
>
> Example: clarify goals and priorities and coordinate resources. Leading action needs enabling conditions and accountability, not slogans alone.

<a id="w14-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：负责人不断要求扩大项目，却不给资源，也拒绝承担决策后果。这里的逆位，是只提大目标，却不肯提供条件、承担责任。
>
> Case: a leader demands expansion without resources and rejects responsibility for outcomes. Here the reversal concerns vision detached from accountability.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="w14-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#w14-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：权杖国王所说的带领大家，重点是什么？ / How is leadership understood?

- A．先树立有感染力的大目标，具体条件让团队边做边补 / Set an inspiring direction first and let the team fill in the practical conditions while working
- B．说清目标、安排好条件，也为自己的决定负责 / Set direction, own decisions, and enable action

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：说清目标、安排好条件，也为自己的决定负责。要看这个人有没有带大家做事、承担责任，不是看有没有领导头衔。 / B is correct: Set direction, own decisions, and enable action. The role is shown through responsibility, not a title replacing action.
- A 不对：这个选项忽略了图中已经给出的区别。要看这个人有没有带大家做事、承担责任，不是看有没有领导头衔。 / A is incorrect: This option overlooks a distinction already visible in the picture. The role is shown through responsibility, not a title replacing action.

<a id="w14-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#w14-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：你要带领大家做一次志愿服务。权杖国王在建议位，哪种做法更合适？ / You are leading a volunteer activity. With the King of Wands as advice, which approach fits?

- A．说清目标、分工，并承担协调责任 / Clarify goals and roles, taking coordination responsibility
- B．重点放在鼓舞大家，具体分工让成员自行协调 / Focus on motivating the group and let members coordinate the roles themselves

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：说清目标、分工，并承担协调责任。带大家做事，既要说清目标，也要安排人手和资源、处理困难。只喊口号还不够。 / A is correct: Clarify goals and roles, taking coordination responsibility. Leading action needs enabling conditions and accountability, not slogans alone.
- B 不对：这个解释没有把画面线索连起来。带大家做事，既要说清目标，也要安排人手和资源、处理困难。只喊口号还不够。 / B is incorrect: This reading does not connect the picture cues. Leading action needs enabling conditions and accountability, not slogans alone.

<a id="w14-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#w14-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：不断要求扩张却拒绝承担后果，这张逆位牌更贴近哪种情况？ / Demanding expansion while rejecting consequences illustrates what here?

- A．已经给出充分资源并负责到底 / Resources and full accountability are already provided
- B．想主导一切，却不肯承担责任 / Directing ambition is detached from responsibility

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：想主导一切，却不肯承担责任。题目已经说他不给人手和资源、也不肯负责，不能当成他已经安排好了一切。 / B is correct: Directing ambition is detached from responsibility. The case explicitly lacks resources and accountability, not their fulfilment.
- A 不对：题目已经说他不给人手和资源、也不肯负责，不能当成他已经安排好了一切。 / A is incorrect: The case explicitly lacks resources and accountability, not their fulfilment.

<a id="w14-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：这里看的是怎样做事，没有正式职位的人，也可以带大家明确目标、负责把事情做成。 记住：说清目标、安排好条件，也为自己的决定负责，不是“只要拥有领导头衔就已足够”。 / Court roles can describe conduct without a formal position. Compare: Set direction, own decisions, and enable action; this cannot be replaced by “A leadership title alone is sufficient”.

**题目 / Prompt**：没有管理头衔的人带大家明确方向并负责落实。角色是否可能适用？ / someone without a manager title directs and takes responsibility. Can this role apply?

- A．可以，他确实在带大家做事，也肯负责 / Yes; behaviour shows direction and accountability
- B．不可以，没有头衔就不能体现 / No; it cannot apply without the title

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：可以，他确实在带大家做事，也肯负责。这里看的是怎样做事，没有正式职位的人，也可以带大家明确目标、负责把事情做成。 / A is correct: Yes; behaviour shows direction and accountability. Court roles can describe conduct without a formal position.
- B 不对：这里看的是怎样做事，没有正式职位的人，也可以带大家明确目标、负责把事情做成。 / B is incorrect: Court roles can describe conduct without a formal position.

<a id="w14-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：先确认人手、预算和责任，再决定做多大。只提高目标，不会让缺少的条件自动出现。 题目描述的是“想主导一切，却不肯承担责任”，不是“已经给出充分资源并负责到底”。 / Reconnect vision to conditions and accountability to address the disconnect. Return to the stated context: “Directing ambition is detached from responsibility” fits this case; “Resources and full accountability are already provided” is unsupported by that context.

**题目 / Prompt**：负责人要求扩大活动规模，却没有给预算。答应之前，先做什么更合适？ / An organiser wants a larger event without providing a budget. What should happen before committing?

- A．继续提高目标而不处理条件 / Raise the target again without addressing conditions
- B．先确认资源与责任，再承诺规模 / Confirm resources and responsibility before committing scale

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先确认资源与责任，再承诺规模。先确认人手、预算和责任，再决定做多大。只提高目标，不会让缺少的条件自动出现。 / B is correct: Confirm resources and responsibility before committing scale. Reconnect vision to conditions and accountability to address the disconnect.
- A 不对：先确认人手、预算和责任，再决定做多大。只提高目标，不会让缺少的条件自动出现。 / A is incorrect: Reconnect vision to conditions and accountability to address the disconnect.

<a id="w14-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：不仅要让大家知道目标是什么，还要安排好人手和资源，让事情能做起来。先做什么、谁来做、需要什么，都要安排；遇到困难也要负责，不能只喊口号。 / A vision tells people where to go and must enable the work. Priorities, resources, and accountability make leadership practical; a slogan alone does not do this.

**新题 / New prompt**：带领志愿团队筹办周末活动，大家认同目标但任务无人负责。下一步怎样应用？ / A volunteer team agrees on a weekend event's goal but no one owns the tasks. What applies next?

- A．再次喊出更大目标，仍不确认任务条件。 / Announce a bigger goal without arranging tasks or conditions.
- B．明确任务与优先级，确认负责人和所需条件。 / Define tasks and priorities, confirm owners and resources.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：明确任务与优先级，确认负责人和所需条件。 大家已经认同目标，现在缺的是谁来做、需要什么条件。再喊一遍目标，任务还是没人负责。 / B is correct: Define tasks and priorities, confirm owners and resources. The vision needs organisation and accountability; repeating it does not assign work.
- A 不对：大家已经认同目标，现在缺的是谁来做、需要什么条件。再喊一遍目标，任务还是没人负责。 / A is incorrect: “Announce a bigger goal without arranging tasks or conditions.” does not address the specific conditions. The vision needs organisation and accountability; repeating it does not assign work.

**依据 / Taught basis**：[本卡应用示范](#w14-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="w14-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：剧社负责人明确演出方向，也处理时间和场地冲突。哪句贴近？ / a theatre organiser sets direction and resolves schedule and venue conflicts. Which fits?

- A．说清目标、安排工作，并负责把事情做下去 / Vision becomes action through responsibility and organisation
- B．方向清楚之后，让成员自行解决时间和场地冲突 / Once the direction is clear, let members resolve the schedule and venue conflicts themselves

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：说清目标、安排工作，并负责把事情做下去。除了说清演出方向，他还解决时间和场地的冲突，这正是带领大家把事情做下去。 / A is correct: Vision becomes action through responsibility and organisation. The lesson includes direction and execution; practical coordination is part of leadership.
- B 不对：只说方向、把时间和场地冲突留给成员，少了负责人把愿景落实的责任。这里还要安排工作并处理实际条件。 / B is incorrect: Stating direction while leaving schedule and venue conflicts to members omits the leader’s responsibility to execute the vision. The work and practical constraints still need coordination.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：有明确的目标，能带领大家行动，也愿意为自己的决定负责。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Give energetic activity a coherent direction and take responsibility for decisions. Leadership is shown through vision and enabling action, not merely by holding a job title. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c01"></a>
### c01 · 圣杯王牌 / Ace of Cups

**目标 / Goal**：理解圣杯王牌的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c01.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups01.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c01-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 开始有了新的感动、关心或创作灵感，也愿意接纳这些感受。 刚开始有感情，只说明新的感受出现了，还不代表两个人已经建立稳定关系。
>
> A new feeling, capacity for care, or creative receptivity begins to emerge. Notice and receive it without treating a fresh feeling as an established relationship.

**画面助记 / Visual memory support**：云中手托着溢水的杯，帮助记住感受正在涌现。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A hand holds an overflowing cup above water, helping recall feelings becoming available and flowing outward. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：新的感受、愿意接纳。 / emerging feeling; receptivity. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：圣杯对应水元素，和感受、情感有关；王牌帮助记住新的开始。新的感受也可能来自创作，不一定是恋爱。 / Cups relate to water and feeling; the Ace recalls an emerging opening, not a rule that water always means romance.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯王牌 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：云中手托着溢水的杯，帮助记住感受正在涌现。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c01-application"></a>
**先看应用示范 / Read the worked application**

> 示范：发现自己很感谢对方，就用合适的话表达出来。可以先感受这份触动、试着表达，但它不能保证未来的关系会怎样。
>
> Example: recognise gratitude and express it appropriately. The lesson welcomes an emerging feeling without making it a guarantee about the future.

<a id="c01-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：对朋友有感谢，却一直否认自己想表达关怀。这里的逆位，是明明有关心，却压着不愿表达。
>
> Case: gratitude toward a friend is felt but the wish to express care is repeatedly denied. Here the reversal concerns feelings being held back.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c01-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c01-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：杯里溢出的水，可以帮助记住什么？ / What does the overflowing cup help recall here?

- A．开始有了新的感动，也想关心别人 / New feeling and care begin to emerge
- B．这份感动说明双方关系已经进入稳定阶段 / This feeling suggests the relationship has already entered a stable stage

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：开始有了新的感动，也想关心别人。刚开始有感情，只说明新的感受出现了，还不代表两个人已经建立稳定关系。 / A is correct: New feeling and care begin to emerge. Emerging feeling is a beginning, not proof of an established stable relationship.
- B 不对：请回到画面里的具体细节：刚开始有感情，只说明新的感受出现了，还不代表两个人已经建立稳定关系。 / B is incorrect: Return to the specific details in the picture: Emerging feeling is a beginning, not proof of an established stable relationship.

<a id="c01-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c01-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：第一次被一首诗深深打动。圣杯王牌在建议位，怎样对待这份感受更合适？ / A poem moves you deeply for the first time. With the Ace of Cups as advice, which response fits this feeling?

- A．先把这份感动理解为长期方向，再决定怎样表达 / Treat this feeling as a long-term direction before deciding how to express it
- B．留意这份感动，试着把它表达出来 / Receive the feeling and try expressing it simply

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：留意这份感动，试着把它表达出来。可以先感受这份触动、试着表达，但它不能保证未来的关系会怎样。 / B is correct: Receive the feeling and try expressing it simply. The lesson welcomes an emerging feeling without making it a guarantee about the future.
- A 不对：这个解释没有把画面线索连起来。可以先感受这份触动、试着表达，但它不能保证未来的关系会怎样。 / A is incorrect: This reading does not connect the picture cues. The lesson welcomes an emerging feeling without making it a guarantee about the future.

<a id="c01-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c01-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：一直压住想感谢朋友的感受，这张逆位牌更贴近哪种情况？ / Holding back gratitude toward a friend illustrates what here?

- A．明明有感受，却压着不说、也不愿承认 / Feeling is difficult to receive and express
- B．说不出口说明这份感谢还不够明确 / Difficulty speaking suggests the gratitude itself is still unclear

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：明明有感受，却压着不说、也不愿承认。他明明很感谢朋友，只是压着不肯说，不能因此认定他没有感受。 / A is correct: Feeling is difficult to receive and express. Gratitude is explicitly present; the block is in receiving and expressing it, not its existence.
- B 不对：这个结论比题目给出的信息多走了一步。他明明很感谢朋友，只是压着不肯说，不能因此认定他没有感受。 / B is incorrect: This conclusion goes beyond the information provided. Gratitude is explicitly present; the block is in receiving and expressing it, not its existence.

<a id="c01-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：开始关心一个人，和两个人已经作出长期承诺，是两回事。是否有承诺，要看双方实际说了什么、做了什么。 记住：开始有了新的感动，也想关心别人，不是“稳定关系已经完全建立”。 / Emerging care differs from mutual commitment, which needs real evidence. Compare: New feeling and care begin to emerge; this cannot be replaced by “A stable relationship is fully established”.

**题目 / Prompt**：第一次感到愿意关心新伙伴，能确认什么？ / care for a new companion first emerges. What is supported?

- A．两人已经作出长期承诺 / Both have made a lasting commitment
- B．开始想关心对方 / Care is beginning to emerge

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：开始想关心对方。开始关心一个人，和两个人已经作出长期承诺，是两回事。是否有承诺，要看双方实际说了什么、做了什么。 / B is correct: Care is beginning to emerge. Emerging care differs from mutual commitment, which needs real evidence.
- A 不对：开始关心一个人，和两个人已经作出长期承诺，是两回事。是否有承诺，要看双方实际说了什么、做了什么。 / A is incorrect: Emerging care differs from mutual commitment, which needs real evidence.

<a id="c01-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：感谢说不出口，不代表没有感谢。先承认自己想表达，再试着说一句简单的话。 题目描述的是“明明有感受，却压着不说、也不愿承认”，不是“完全没有任何感受出现”。 / Difficulty expressing is not absence of feeling; acknowledging it addresses the block. Return to the stated context: “Feeling is difficult to receive and express” fits this case; “No feeling exists at all” is unsupported by that context.

**题目 / Prompt**：很想感谢朋友，却总说不出口。可以先试着做什么？ / You want to thank a friend but cannot get the words out. What could you try first?

- A．先承认自己想感谢对方，再用一句简单的话说出来 / Acknowledge gratitude and choose a simple expression
- B．等找到足够郑重的表达方式，再向朋友道谢 / Wait for a sufficiently formal way to express the thanks before speaking to the friend

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：先承认自己想感谢对方，再用一句简单的话说出来。感谢说不出口，不代表没有感谢。先承认自己想表达，再试着说一句简单的话。 / A is correct: Acknowledge gratitude and choose a simple expression. Difficulty expressing is not absence of feeling; acknowledging it addresses the block.
- B 不对：这个解释把牌义带到了别处。感谢说不出口，不代表没有感谢。先承认自己想表达，再试着说一句简单的话。 / B is incorrect: This interpretation shifts the card meaning elsewhere. Difficulty expressing is not absence of feeling; acknowledging it addresses the block.

<a id="c01-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：发现自己被打动了，可以说一句感谢，写一点东西，或关心对方。不必刚有感受，就决定两个人的长期关系。 / Receive a new feeling by acknowledging it and finding a small fitting expression. This can be gratitude, creation, or care, without an immediate long-term commitment.

**新题 / New prompt**：听到朋友帮助自己的细节后很感动，这张牌在建议位时，怎样做更合适？ / Hearing how a friend helped you feels moving. How can this advice apply?

- A．用一句真诚的话，把感谢说出来。 / Acknowledge gratitude and respond sincerely.
- B．先判断这份感谢会不会改变关系，再决定是否说出来。 / Decide whether the gratitude might change the relationship before expressing it.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：用一句真诚的话，把感谢说出来。 一句真诚的感谢，就能表达现在的感动，不需要先决定一辈子的关系。 / A is correct: Acknowledge gratitude and respond sincerely. A simple expression can meet the present feeling; gratitude needs no prior lifelong arrangement.
- B 不对：这个解释没有把画面线索连起来。一句真诚的感谢，就能表达现在的感动，不需要先决定一辈子的关系。 / B is incorrect: This reading does not connect the picture cues. A simple expression can meet the present feeling; gratitude needs no prior lifelong arrangement.

**依据 / Taught basis**：[本卡应用示范](#c01-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c01-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：重新接触绘画时涌起温柔的创作感受。哪句贴近？ / returning to painting brings tender creative feeling. Which fits?

- A．这份创作灵感主要来自技巧进步，与感受关系不大 / The creative inspiration mainly reflects technical progress rather than an emotional opening
- B．开始有了新的感受和创作灵感 / A new emotional and creative experience is opening

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：开始有了新的感受和创作灵感。被一幅画或一首诗打动，也属于圣杯所说的感受，不一定是在谈恋爱。 / B is correct: A new emotional and creative experience is opening. Cups also include feeling and creative receptivity, not romance alone.
- A 不对：这里要分清牌义的边界：被一幅画或一首诗打动，也属于圣杯所说的感受，不一定是在谈恋爱。 / A is incorrect: The boundary of the card meaning matters here: Cups also include feeling and creative receptivity, not romance alone.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：开始有了新的感动、关心或创作灵感，也愿意接纳这些感受。 记住意思就好，不必逐字背诵。 / The main meaning covered is: A new feeling, capacity for care, or creative receptivity begins to emerge. Notice and receive it without treating a fresh feeling as an established relationship. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c02"></a>
### c02 · 圣杯二 / Two of Cups

**目标 / Goal**：理解圣杯二的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c02.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups02.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c02-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 两个人愿意交流，也愿意回应彼此，关系中有相互的好感和认可。 两个人都愿意回应，才算相互认可。只有自己愿意，不能代表对方也答应了。
>
> Two parties are willing to respond to one another and establish a mutually recognised connection. This can describe partnership as well as affection; mutuality is the central condition.

**画面助记 / Visual memory support**：两个人面对面举杯，可以帮助记住彼此回应，而不是只有一方主动。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / Two people face each other and raise cups, a direct memory cue for reciprocal exchange. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：相互回应、好感、合作。 / reciprocity; connection; partnership. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：水关注感受与回应；二在本牌帮助记双向关系，但不自动保证婚姻或永远和谐。 / Water concerns feeling and response; two here recalls mutual connection, not a guarantee of marriage or permanent harmony.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯二 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：两个人面对面举杯，可以帮助记住彼此回应，而不是只有一方主动。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c02-application"></a>
**先看应用示范 / Read the worked application**

> 示范：合作双方愿意沟通，继续谈清约定。双方都愿意合作，也还要谈清各自需要什么、愿意做什么，不能只靠好感替对方决定。
>
> Example: willing partners clarify their agreement. Response becomes practical through communication; goodwill does not replace checking with the other party.

<a id="c02-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：合作时一方不断提议，另一方从不回应，也不确认约定。这里的逆位，是总由一方主动，另一方却没有回应。
>
> Case: one partner repeatedly proposes arrangements while the other neither replies nor confirms. Here the reversal concerns unequal response.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c02-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c02-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：两个人面对面举杯，可以帮助记住关系中的哪一点？ / What is the key condition recalled by the two facing figures?

- A．一方主动表达，另一方默认接受，也算形成共识 / One person speaks and the other's quiet acceptance is enough to form mutual agreement
- B．双方都有回应和交流意愿 / Both parties are willing to respond and communicate

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：双方都有回应和交流意愿。两个人都愿意回应，才算相互认可。只有自己愿意，不能代表对方也答应了。 / B is correct: Both parties are willing to respond and communicate. Mutuality needs participation from both sides; one person's wish is not agreement from both.
- A 不对：这个选项忽略了图中已经给出的区别。两个人都愿意回应，才算相互认可。只有自己愿意，不能代表对方也答应了。 / A is incorrect: This option overlooks a distinction already visible in the picture. Mutuality needs participation from both sides; one person's wish is not agreement from both.

<a id="c02-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c02-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：两位同学都想合办活动。圣杯二在建议位，下一步怎样沟通更合适？ / Two students both want to organise an event together. With the Two of Cups as advice, how can they communicate next?

- A．互相表达需求并确认分工 / Exchange needs and confirm responsibilities
- B．因有好感就不必询问对方需求 / Skip asking about needs because goodwill exists

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：互相表达需求并确认分工。双方都愿意合作，也还要谈清各自需要什么、愿意做什么，不能只靠好感替对方决定。 / A is correct: Exchange needs and confirm responsibilities. Response becomes practical through communication; goodwill does not replace checking with the other party.
- B 不对：双方都愿意合作，也还要谈清各自需要什么、愿意做什么，不能只靠好感替对方决定。 / B is incorrect: Response becomes practical through communication; goodwill does not replace checking with the other party.

<a id="c02-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c02-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：一方提议、另一方长期不回应，这张逆位牌更贴近哪种情况？ / One side proposes and the other does not respond. What is this reversal?

- A．双方共识已清楚形成 / Mutual agreement is already clear
- B．总是一方主动，另一方没有回应 / Exchange is unbalanced and not reciprocal

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：总是一方主动，另一方没有回应。对方一直没答复，就还不知道他愿不愿意，不能当成两个人已经商量好了。 / B is correct: Exchange is unbalanced and not reciprocal. The second party's response is absent, so agreement is not established.
- A 不对：对方一直没答复，就还不知道他愿不愿意，不能当成两个人已经商量好了。 / A is incorrect: The second party's response is absent, so agreement is not established.

<a id="c02-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：重点是双方愿意交流、回应。朋友或合作伙伴也可以这样相处，不一定非得是恋人。 记住：双方都有回应和交流意愿，不是“只要一方愿意就已形成双向共识”。 / Reciprocity is central, not romantic status. Compare: Both parties are willing to respond and communicate; this cannot be replaced by “One willing party alone establishes mutual agreement”.

**题目 / Prompt**：两家社团互相听取需求并确认合作。圣杯二适用吗？ / two clubs listen and confirm cooperation. Can the Two of Cups apply?

- A．可以，合作也需要双方交流、彼此回应 / Yes; mutual connection also includes partnership
- B．不太适用，社团合作更适合从星币角度理解 / It is a weaker fit because club cooperation is better understood through Pentacles

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：可以，合作也需要双方交流、彼此回应。重点是双方愿意交流、回应。朋友或合作伙伴也可以这样相处，不一定非得是恋人。 / A is correct: Yes; mutual connection also includes partnership. Reciprocity is central, not romantic status.
- B 不对：这个选项忽略了图中已经给出的区别。重点是双方愿意交流、回应。朋友或合作伙伴也可以这样相处，不一定非得是恋人。 / B is incorrect: This option overlooks a distinction already visible in the picture. Reciprocity is central, not romantic status.

<a id="c02-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：要问清对方愿不愿意参与，不能只凭自己想合作，就替对方答应。 题目描述的是“总是一方主动，另一方没有回应”，不是“双方共识已清楚形成”。 / The other's response must be checked; a wish cannot substitute for their agreement. Return to the stated context: “Exchange is unbalanced and not reciprocal” fits this case; “Mutual agreement is already clear” is unsupported by that context.

**题目 / Prompt**：总是自己联系，对方从不确认安排。先做什么，才能知道对方愿不愿意参与？ / You always initiate contact, but the other person never confirms plans. What can you do to find out whether they want to participate?

- A．把自己的愿望直接记作对方同意 / Record one's own wish as the other's consent
- B．明确询问对方是否愿意参与 / Ask clearly whether the other person wants to participate

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：明确询问对方是否愿意参与。要问清对方愿不愿意参与，不能只凭自己想合作，就替对方答应。 / B is correct: Ask clearly whether the other person wants to participate. The other's response must be checked; a wish cannot substitute for their agreement.
- A 不对：要问清对方愿不愿意参与，不能只凭自己想合作，就替对方答应。 / A is incorrect: The other's response must be checked; a wish cannot substitute for their agreement.

<a id="c02-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：先听听彼此想要什么，再确认两个人愿不愿意一起做。即使互有好感，也不能把自己喜欢的安排当成双方已经说好的事。 / Reciprocal exchange means hearing each person's needs and checking shared willingness. Goodwill does not turn one person's preference into a joint agreement.

**新题 / New prompt**：两位同学都愿意合办展览，但一人想周末、一人只有平日晚间有空。怎样应用？ / Two students want a joint exhibition, but one prefers weekends and the other is free only on weekday evenings. What fits?

- A．因为都愿合作，就按自己喜欢的日期宣布定案。 / Declare your preferred date final because both want to collaborate.
- B．互相说明条件，再确认双方可接受的安排。 / Exchange constraints and confirm an arrangement both accept.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：互相说明条件，再确认双方可接受的安排。 两个人都想合作，但有空的时间不同，还得一起商量。都愿意，并不代表时间自动合适。 / B is correct: Exchange constraints and confirm an arrangement both accept. Willingness still needs a mutually confirmed arrangement; goodwill does not erase practical differences.
- A 不对：两个人都想合作，但有空的时间不同，还得一起商量。都愿意，并不代表时间自动合适。 / A is incorrect: “Declare your preferred date final because both want to collaborate.” does not address the specific conditions. Willingness still needs a mutually confirmed arrangement; goodwill does not erase practical differences.

**依据 / Taught basis**：[本卡应用示范](#c02-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c02-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：导师与学生都愿意倾听，谈清合作期待。哪句贴近？ / mentor and student listen and clarify expectations. Which fits?

- A．双方愿意听取意见、回应彼此，有助于一起做事 / Mutual recognition and response support cooperation
- B．彼此愿意倾听，说明合作期待已经一致 / Their willingness to listen shows that their expectations for the partnership already match

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：双方愿意听取意见、回应彼此，有助于一起做事。彼此愿意听取意见，有助于合作；以后有了分歧，仍然需要继续商量。 / A is correct: Mutual recognition and response support cooperation. Reciprocity supports connection without eliminating future adjustments.
- B 不对：这里要分清牌义的边界：彼此愿意听取意见，有助于合作；以后有了分歧，仍然需要继续商量。 / B is incorrect: The boundary of the card meaning matters here: Reciprocity supports connection without eliminating future adjustments.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：两个人愿意交流，也愿意回应彼此，关系中有相互的好感和认可。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Two parties are willing to respond to one another and establish a mutually recognised connection. This can describe partnership as well as affection; mutuality is the central condition. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c03"></a>
### c03 · 圣杯三 / Three of Cups

**目标 / Goal**：理解圣杯三的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c03.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups03.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c03-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 和朋友一起分享喜悦，在相聚中得到关心、鼓励和支持。 画面上的三个人正在举杯庆祝。要记住的是朋友相聚的喜悦，不能只数出三个人就认定有第三者。
>
> Share joy and receive emotional support in friendship or community. The group matters because its members genuinely participate in one another’s experience.

**画面助记 / Visual memory support**：三个人举杯相聚，脚边有果实，呈现共同庆祝。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / Three people raise cups together among fruit, helping recall shared celebration and friendship. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：友谊、分享喜悦、群体支持。 / friendship; shared joy; group support. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：水关联情感支持；三在这里提示多人共享，不根据人数判断现实第三者。 / Water relates to emotional support; three here recalls shared participation, not evidence of an affair.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯三 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：三个人举杯相聚，脚边有果实，呈现共同庆祝。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c03-application"></a>
**先看应用示范 / Read the worked application**

> 示范：找可信朋友分享经历。和信任的朋友分享这次经历，可以一起庆祝，也能得到鼓励；把所有感受都隔绝起来，就失去了这种交流。
>
> Example: share an experience with trusted friends. The lesson emphasises sharing with a trusted group rather than cutting off support.

<a id="c03-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：聚会很多，却每次都被打断和忽视，没人愿意认真听。这里的逆位，是聚会虽然多，却没有人真正关心、倾听。
>
> Case: gatherings are frequent but a person is interrupted and ignored. Here the reversal concerns social activity without genuine support.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c03-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c03-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：几个人一起举杯，可以帮助记住什么？ / What does gathering with raised cups help recall here?

- A．朋友之间分享喜悦与支持 / Friends share joy and support
- B．三个人聚在一起，重点是共同完成正式仪式 / The three people are gathered to complete a formal ceremony together

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：朋友之间分享喜悦与支持。画面上的三个人正在举杯庆祝。要记住的是朋友相聚的喜悦，不能只数出三个人就认定有第三者。 / A is correct: Friends share joy and support. The figures show shared celebration; their number does not establish an actual relationship event.
- B 不对：这个选项忽略了图中已经给出的区别。画面上的三个人正在举杯庆祝。要记住的是朋友相聚的喜悦，不能只数出三个人就认定有第三者。 / B is incorrect: This option overlooks a distinction already visible in the picture. The figures show shared celebration; their number does not establish an actual relationship event.

<a id="c03-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c03-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：终于完成了一门很难的课程。圣杯三在建议位，哪种做法更合适？ / You have finished a difficult course. With the Three of Cups as advice, which response fits?

- A．先独自整理成绩，等下一次课程再和伙伴交流 / Reflect on the achievement privately and discuss it with classmates at the next course
- B．与支持自己的伙伴一起庆祝 / Celebrate with supportive companions

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：与支持自己的伙伴一起庆祝。和信任的朋友分享这次经历，可以一起庆祝，也能得到鼓励；把所有感受都隔绝起来，就失去了这种交流。 / B is correct: Celebrate with supportive companions. The lesson emphasises sharing with a trusted group rather than cutting off support.
- A 不对：请回到画面里的具体细节：和信任的朋友分享这次经历，可以一起庆祝，也能得到鼓励；把所有感受都隔绝起来，就失去了这种交流。 / A is incorrect: Return to the specific details in the picture: The lesson emphasises sharing with a trusted group rather than cutting off support.

<a id="c03-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c03-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：聚会很多却没人倾听，这张逆位牌更贴近哪种情况？ / Frequent gatherings lack listening. What does this reversal emphasise?

- A．聚会很热闹，自己却没有得到关心和支持 / Social activity is not providing genuine support
- B．聚会次数已经证明关系有支持 / Frequency of gatherings proves support

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：聚会很热闹，自己却没有得到关心和支持。有没有支持，要看朋友是否愿意听你说、关心你的处境，不是看参加了多少次聚会。 / A is correct: Social activity is not providing genuine support. Support depends on interaction quality; frequency does not replace being heard.
- B 不对：有没有支持，要看朋友是否愿意听你说、关心你的处境，不是看参加了多少次聚会。 / B is incorrect: Support depends on interaction quality; frequency does not replace being heard.

<a id="c03-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：题目说三位同事在互相祝贺，可以概括为一起高兴，不能因为有三个人就认定有感情纠纷。 记住：朋友之间分享喜悦与支持，不是“只要出现三人就确定有第三者”。 / The stated interaction is congratulations; three participants do not imply romantic conflict. Compare: Friends share joy and support; this cannot be replaced by “Three figures establish a romantic affair”.

**题目 / Prompt**：三位同事互相祝贺项目完成。可以概括什么？ / three colleagues congratulate each other on completion. What is supported?

- A．项目完成后的祝贺主要代表个人获得认可 / The congratulations mainly show that each person received individual recognition
- B．大家一起为做成的事高兴 / Shared joy in a group

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：大家一起为做成的事高兴。题目说三位同事在互相祝贺，可以概括为一起高兴，不能因为有三个人就认定有感情纠纷。 / B is correct: Shared joy in a group. The stated interaction is congratulations; three participants do not imply romantic conflict.
- A 不对：这个解释把牌义带到了别处。题目说三位同事在互相祝贺，可以概括为一起高兴，不能因为有三个人就认定有感情纠纷。 / A is incorrect: This interpretation shifts the card meaning elsewhere. The stated interaction is congratulations; three participants do not imply romantic conflict.

<a id="c03-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：需要的是找愿意听你说话的朋友。多参加几次仍然没人倾听的聚会，并不会解决问题。 题目描述的是“聚会很热闹，自己却没有得到关心和支持”，不是“聚会次数已经证明关系有支持”。 / Change the quality of support rather than merely increase superficial contact. Return to the stated context: “Social activity is not providing genuine support” fits this case; “Frequency of gatherings proves support” is unsupported by that context.

**题目 / Prompt**：每次聚会都没人认真听自己说话。想得到朋友的支持，怎样做更合适？ / Nobody listens to you at these gatherings. What could help you find support from friends?

- A．选择愿意倾听的朋友交流 / Seek conversation with friends who listen
- B．只增加相同聚会次数就认定解决 / Add more identical gatherings and call it solved

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：选择愿意倾听的朋友交流。需要的是找愿意听你说话的朋友。多参加几次仍然没人倾听的聚会，并不会解决问题。 / A is correct: Seek conversation with friends who listen. Change the quality of support rather than merely increase superficial contact.
- B 不对：需要的是找愿意听你说话的朋友。多参加几次仍然没人倾听的聚会，并不会解决问题。 / B is incorrect: Change the quality of support rather than merely increase superficial contact.

<a id="c03-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：不用勉强自己参加更多聚会。找信任、愿意听你说话的人，聊聊经历，一起开心、互相鼓励，比人数多少更重要。 / Sharing is not forcing more attendance; it exchanges experience, joy, and support with trusted people. Listening and participation provide support, not the size of a gathering.

**新题 / New prompt**：完成一次困难演讲，想和支持自己的朋友庆祝。这张牌在建议位时，怎样做更合适？ / After a difficult presentation, you want to celebrate with supportive friends. What fits?

- A．找愿意倾听的伙伴分享这次经历和喜悦。 / Share the experience and joy with friends who listen.
- B．把重点放在场地和流程上，不安排与支持自己的朋友交流。 / Focus on the venue and schedule without making time to talk with the friends who supported you.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：找愿意倾听的伙伴分享这次经历和喜悦。 找愿意听的朋友分享，才能一起为这次经历高兴。人再多，如果没人愿意交流，也没有得到这种支持。 / A is correct: Share the experience and joy with friends who listen. The goal is shared support; a large crowd cannot replace mutual participation.
- B 不对：只安排场地和流程，却没有和支持自己的朋友分享，缺少圣杯三强调的共同喜悦与支持。 / B is incorrect: Managing the venue and schedule without sharing with supportive friends misses the mutual joy and support of the Three of Cups.

**依据 / Taught basis**：[本卡应用示范](#c03-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c03-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：读书伙伴彼此分享心得和鼓励。哪句贴近？ / reading partners exchange reflections and encouragement. Which fits?

- A．要有明确成果值得庆祝，伙伴间的日常支持还不算 / A clear achievement needs to be celebrated; everyday support between companions is a weaker fit
- B．在熟悉的伙伴中分享经历、得到支持 / A community offers sharing and emotional support

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：在熟悉的伙伴中分享经历、得到支持。平时一起读书、交流心得，也能互相鼓励，不一定要有正式庆典。 / B is correct: A community offers sharing and emotional support. Group support can occur in everyday gatherings, not only formal ceremonies.
- A 不对：这个说法混淆了题目正在考的含义。平时一起读书、交流心得，也能互相鼓励，不一定要有正式庆典。 / A is incorrect: This statement confuses the meaning being tested. Group support can occur in everyday gatherings, not only formal ceremonies.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：和朋友一起分享喜悦，在相聚中得到关心、鼓励和支持。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Share joy and receive emotional support in friendship or community. The group matters because its members genuinely participate in one another’s experience. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c04"></a>
### c04 · 圣杯四 / Four of Cups

**目标 / Goal**：理解圣杯四的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c04.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups04.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c04-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 心思放在自己身上，对眼前的事或新的邀请暂时提不起兴趣，也不太想回应。 旁边明明有一只杯子递过来，人物却抱着双臂，没有伸手。可以这样记：有机会出现，但自己暂时不想回应。
>
> Attention turns inward and engagement with available opportunities is low. Distinguish needing reflection from overlooking an offer; lack of response does not prove that no opportunity exists.

**画面助记 / Visual memory support**：树下抱臂者面对三杯，侧面还有递来的第四杯。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A folded-armed figure sits beneath a tree with three cups ahead and another offered from the side, a cue for offers and limited response. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：提不起兴趣、独处思考、不想回应。 / withdrawn interest; reflection; low engagement. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：圣杯对应水元素，和感受有关；四可以帮助记住暂时停下来的状态。是在独处思考，还是对事情冷淡，要看具体情况。 / Water concerns feeling; four can help recall a held state, but reflection versus disengagement needs context.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯四 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：树下抱臂者面对三杯，侧面还有递来的第四杯。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c04-application"></a>
**先看应用示范 / Read the worked application**

> 示范：对邀请无感时先分清疲惫还是不适合。自己现在有没有兴趣，和机会本身适不适合，是两件事。提不起劲，不代表外面没有机会。
>
> Example: distinguish fatigue from poor fit when an invitation feels unappealing. Internal interest and external opportunity need separate consideration.

<a id="c04-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：休整后开始愿意回复邀请，重新评估之前忽略的机会。这里的逆位，是又愿意了解活动、回复邀请了。
>
> Case: after a pause, invitations receive replies and overlooked opportunities are reconsidered. Here the reversal means renewed engagement.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c04-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c04-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：没有回应，就说明没有机会吗？ / How does this card distinguish no response from no opportunity?

- A．没有回应通常说明这个机会吸引力不足 / A lack of response usually shows that the opportunity is not appealing enough
- B．有机会出现，也可能暂时不想回应 / An opportunity may be present without a response

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：有机会出现，也可能暂时不想回应。旁边明明有一只杯子递过来，人物却抱着双臂，没有伸手。可以这样记：有机会出现，但自己暂时不想回应。 / B is correct: An opportunity may be present without a response. The offered cup and withdrawn posture coexist, showing the distinction.
- A 不对：这个结论比题目给出的信息多走了一步。旁边明明有一只杯子递过来，人物却抱着双臂，没有伸手。可以这样记：有机会出现，但自己暂时不想回应。 / A is incorrect: This conclusion goes beyond the information provided. The offered cup and withdrawn posture coexist, showing the distinction.

<a id="c04-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c04-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：收到课程邀请，却提不起兴趣。圣杯四在建议位，先做什么更合适？ / You receive a course invitation but feel little interest. With the Four of Cups as advice, what fits first?

- A．先了解自己的状态，再评估邀请 / Check one's state and then assess the invitation
- B．马上拒绝邀请，不再了解自己只是疲惫还是课程确实不合适。 / Reject the invitation right away without checking whether you are tired or the course truly does not fit.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：先了解自己的状态，再评估邀请。自己现在有没有兴趣，和机会本身适不适合，是两件事。提不起劲，不代表外面没有机会。 / A is correct: Check one's state and then assess the invitation. Internal interest and external opportunity need separate consideration.
- B 不对：马上拒绝邀请，把一时提不起劲当成了最终判断；应先分开看自己的状态和课程是否合适。 / B is incorrect: Rejecting the invitation immediately treats low energy as a settled judgement; first separate your current state from whether the course fits.

<a id="c04-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c04-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：休整后愿意回复邀请，这张逆位牌更贴近哪种变化？ / Replying to invitations after a pause shows which reversal here?

- A．只礼貌回复已经收到，不再了解活动内容。 / Acknowledge the invitation politely without learning anything more about the event.
- B．又愿意了解活动、回复邀请了 / Re-engaging with opportunities

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：又愿意了解活动、回复邀请了。原来不想回复，现在开始答复邀请，说明又愿意了解和参加了。 / B is correct: Re-engaging with opportunities. The behaviour explicitly changes from silence to replies, showing renewed engagement.
- A 不对：只回复收到却不再了解内容，仍缺少逆位在本例中所说的重新参与。 / A is incorrect: A polite acknowledgement without learning more still lacks the renewed engagement shown by this reversal.

<a id="c04-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：人物没有伸手，杯子仍然在那里。因此要分清“有东西递过来”和“愿不愿意接”。 记住：有机会出现，也可能暂时不想回应，不是“没有回应就证明机会完全不存在”。 / An object's presence does not depend on the figure responding; that is the distinction taught. Compare: An opportunity may be present without a response; this cannot be replaced by “No response proves there is no opportunity”.

**题目 / Prompt**：地上有三只杯子，旁边还有一只杯子递过来。哪句更准确？ / Three cups stand on the ground and another is being offered. Which is more accurate?

- A．杯子就在眼前，不想接不等于没有杯子 / Opportunity and response should be observed separately
- B．没有主动伸手就说明没有杯子 / Not reaching out means no cup is present

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：杯子就在眼前，不想接不等于没有杯子。人物没有伸手，杯子仍然在那里。因此要分清“有东西递过来”和“愿不愿意接”。 / A is correct: Opportunity and response should be observed separately. An object's presence does not depend on the figure responding; that is the distinction taught.
- B 不对：人物没有伸手，杯子仍然在那里。因此要分清“有东西递过来”和“愿不愿意接”。 / B is incorrect: An object's presence does not depend on the figure responding; that is the distinction taught.

<a id="c04-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：他已经开始主动问活动内容，说明愿意重新了解了。不能还按之前的不回应来判断。 题目描述的是“又愿意了解活动、回复邀请了”，不是“越来越完全拒绝任何回应”。 / The new action supports renewed engagement; the changed context matters. Return to the stated context: “Re-engaging with opportunities” fits this case; “Increasingly refusing all response” is unsupported by that context.

**题目 / Prompt**：原来不想参加活动，现在开始主动询问内容。哪句话更贴近这个变化？ / Someone who did not want to join an event now asks about it. Which statement best describes the change?

- A．礼貌问一句活动时间，之后不再了解内容。 / Ask the event time as a courtesy, then stop learning about it.
- B．不再那么冷淡，开始愿意了解活动 / Disengagement eases and curiosity returns

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：不再那么冷淡，开始愿意了解活动。他已经开始主动问活动内容，说明愿意重新了解了。不能还按之前的不回应来判断。 / B is correct: Disengagement eases and curiosity returns. The new action supports renewed engagement; the changed context matters.
- A 不对：礼貌问一句后又停止了解，没有表现出兴趣正在恢复。 / A is incorrect: A single polite question followed by disengagement does not show curiosity returning.

<a id="c04-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：先分清两件事：机会本身是否适合，以及自己当下是否有精力回应。疲惫可能让任何邀请都显得乏味，不能因此直接断定外界没有机会。 / Separate whether an offer fits from whether you currently have capacity to respond. Fatigue can make invitations unappealing without proving there are no opportunities.

**新题 / New prompt**：刚完成紧张项目，收到本来感兴趣的讲座邀请却提不起劲。下一步怎样应用？ / After an intense project, an otherwise interesting lecture invitation feels unappealing. What fits next?

- A．仅凭一时没兴趣就确定讲座毫无价值。 / Declare the lecture worthless from momentary disinterest.
- B．先检查是否需要休息，再了解讲座是否适合。 / Check the need for rest, then assess the lecture's fit.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先检查是否需要休息，再了解讲座是否适合。 刚忙完项目，可能只是太累了。先休息，再看看讲座内容，不能只因现在没精神就认定讲座没价值。 / B is correct: Check the need for rest, then assess the lecture's fit. The task separates current state from offer quality; fatigue alone does not establish value.
- A 不对：刚忙完项目，可能只是太累了。先休息，再看看讲座内容，不能只因现在没精神就认定讲座没价值。 / A is incorrect: “Declare the lecture worthless from momentary disinterest.” does not address the specific conditions. The task separates current state from offer quality; fatigue alone does not establish value.

**依据 / Taught basis**：[本卡应用示范](#c04-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c04-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：工作机会不少，但连续疲惫使人都不想看。哪句贴近？ / opportunities exist, but fatigue makes all unappealing. Which fits?

- A．现在提不起劲，先看看是自己累了，还是机会不适合 / Engagement is low; distinguish current state from the offers
- B．机会不存在，所以无需了解状态 / No opportunities exist, so the current state is irrelevant

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：现在提不起劲，先看看是自己累了，还是机会不适合。题目已经说有不少工作机会，只是累得不想看，不能说外面完全没有机会。 / A is correct: Engagement is low; distinguish current state from the offers. Opportunities are explicitly present; the issue concerns response, not their total absence.
- B 不对：题目已经说有不少工作机会，只是累得不想看，不能说外面完全没有机会。 / B is incorrect: Opportunities are explicitly present; the issue concerns response, not their total absence.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：心思放在自己身上，对眼前的事或新的邀请暂时提不起兴趣，也不太想回应。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Attention turns inward and engagement with available opportunities is low. Distinguish needing reflection from overlooking an offer; lack of response does not prove that no opportunity exists. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c05"></a>
### c05 · 圣杯五 / Five of Cups

**目标 / Goal**：理解圣杯五的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c05.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups05.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c05-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 一直想着已经失去的东西，很难注意到身边还留下了什么、还有谁愿意帮助自己。 人物面前有三只倒下的杯，身后还有两只立着的杯。失去的是真的，但并不是所有东西都失去了。
>
> A loss occupies attention while some support remains. Acknowledge disappointment without erasing what is still available; neither forced positivity nor total hopelessness captures the whole card.

**画面助记 / Visual memory support**：三杯倒下、两杯仍立，人物面向倒杯，是核心助记。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / Three cups are fallen and two remain upright while the cloaked figure faces the fallen cups: a clear memory cue for loss and remaining support. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：失落、遗憾、关注损失、仍在的支持。 / loss; regret; attention to loss; remaining support. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：圣杯对应水元素，和感受有关；五可以帮助记住受到打击。再看人物朝着倒杯、背后仍有立杯，就能记住这张牌的失落和仍在的支持。 / Water concerns emotional loss; five may aid disruption, while the particular meaning is supported by fallen and upright cups and the figure’s attention.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯五 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：三杯倒下、两杯仍立，人物面向倒杯，是核心助记。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c05-application"></a>
**先看应用示范 / Read the worked application**

> 示范：承认合作落空，再联系仍愿意帮助的人。可以为失利难过，也可以接受仍然有的帮助。不必假装没失败，才能继续往前走。
>
> Example: acknowledge a lost partnership and contact remaining supporters. The lesson holds both real loss and remaining support; neither should be erased.

<a id="c05-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：失去一个合作机会后，逐渐愿意联系仍支持自己的伙伴。这里的逆位，是慢慢接受失利，也重新注意到仍愿意帮助自己的人。
>
> Case: after losing a partnership opportunity, someone begins contacting supportive companions again. Here the reversal concerns accepting loss and noticing remaining support.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c05-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c05-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：三只杯倒了，还有两只立着。把这两处一起看，哪句话更贴近牌义？ / Three cups have fallen but two stand. What is the lesson's summary?

- A．失落占据注意，但支持并未全部消失 / Loss dominates attention but support is not entirely gone
- B．倒下的杯子更重要，应先集中处理已经失去的部分 / The fallen cups matter most, so attention should stay on what has been lost

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：失落占据注意，但支持并未全部消失。人物面前有三只倒下的杯，身后还有两只立着的杯。失去的是真的，但并不是所有东西都失去了。 / A is correct: Loss dominates attention but support is not entirely gone. The upright cups preserve remaining support without denying the loss recalled by the fallen cups.
- B 不对：这个选项忽略了图中已经给出的区别。人物面前有三只倒下的杯，身后还有两只立着的杯。失去的是真的，但并不是所有东西都失去了。 / B is incorrect: This option overlooks a distinction already visible in the picture. The upright cups preserve remaining support without denying the loss recalled by the fallen cups.

<a id="c05-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c05-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：考试失利，心里很难过。圣杯五在建议位，哪种做法更合适？ / You feel upset after an exam setback. With the Five of Cups as advice, which response fits?

- A．先把失败原因分析清楚，等能独立调整好再考虑求助 / Analyse the setback fully and consider asking for help after making a private adjustment
- B．允许自己难过，再看看还有哪些帮助和机会 / Acknowledge sadness and use remaining help and opportunities

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：允许自己难过，再看看还有哪些帮助和机会。可以为失利难过，也可以接受仍然有的帮助。不必假装没失败，才能继续往前走。 / B is correct: Acknowledge sadness and use remaining help and opportunities. The lesson holds both real loss and remaining support; neither should be erased.
- A 不对：请回到画面里的具体细节：可以为失利难过，也可以接受仍然有的帮助。不必假装没失败，才能继续往前走。 / A is incorrect: Return to the specific details in the picture: The lesson holds both real loss and remaining support; neither should be erased.

<a id="c05-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c05-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：失去机会后开始联系支持者，这张逆位牌更贴近哪种情况？ / Reconnecting with supporters after a lost opportunity illustrates what here?

- A．慢慢接受失利，也开始注意到仍愿意帮助自己的人 / Gradually accepting loss and noticing support
- B．开始联系支持者，说明这次失利对自己的影响已经很小 / Contacting supporters shows that the setback now has little emotional impact

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：慢慢接受失利，也开始注意到仍愿意帮助自己的人。重新愿意求助，说明正在慢慢走出失落，不代表之前的损失没有发生过。 / A is correct: Gradually accepting loss and noticing support. Recovery changes the response to loss, not the fact that it occurred.
- B 不对：这个结论比题目给出的信息多走了一步。重新愿意求助，说明正在慢慢走出失落，不代表之前的损失没有发生过。 / B is incorrect: This conclusion goes beyond the information provided. Recovery changes the response to loss, not the fact that it occurred.

<a id="c05-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：还有朋友支持，并不代表不该难过。遗憾和得到帮助，可以同时存在。 记住：失落占据注意，但支持并未全部消失，不是“已经失去全部可能的支持”。 / Remaining support does not invalidate sadness; both can coexist. Compare: Loss dominates attention but support is not entirely gone; this cannot be replaced by “Every possible support has been lost”.

**题目 / Prompt**：错过一个活动，但还有两位朋友愿意一起安排别的。哪句符合？ / an event is missed but two friends offer another plan. Which fits?

- A．有支持就说明不应该难过 / Available support means sadness is illegitimate
- B．虽然遗憾，还有朋友愿意陪着自己 / Regret exists alongside available support

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：虽然遗憾，还有朋友愿意陪着自己。还有朋友支持，并不代表不该难过。遗憾和得到帮助，可以同时存在。 / B is correct: Regret exists alongside available support. Remaining support does not invalidate sadness; both can coexist.
- A 不对：还有朋友支持，并不代表不该难过。遗憾和得到帮助，可以同时存在。 / A is incorrect: Remaining support does not invalidate sadness; both can coexist.

<a id="c05-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：接受失利需要时间。还会难过，也可以开始求助、继续生活，不用等到一点都不难过。 题目描述的是“慢慢接受失利，也开始注意到仍愿意帮助自己的人”，不是“证明过去的失落从未发生”。 / Acceptance is a process and does not require eliminating every feeling before continuing. Return to the stated context: “Gradually accepting loss and noticing support” fits this case; “Proving the loss never occurred” is unsupported by that context.

**题目 / Prompt**：已经开始向别人求助，但想起失败还是难过。怎样看待这种变化更合适？ / You have started asking for help but still feel sad about the setback. How can you understand this change?

- A．可以边难过边重新接受帮助 / Help can be accepted while sadness remains
- B．仍会难过，说明现在还没准备好接受别人的帮助 / Continuing sadness suggests the person is not ready to accept help yet

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：可以边难过边重新接受帮助。接受失利需要时间。还会难过，也可以开始求助、继续生活，不用等到一点都不难过。 / A is correct: Help can be accepted while sadness remains. Acceptance is a process and does not require eliminating every feeling before continuing.
- B 不对：这个做法没有解决眼前的情况。接受失利需要时间。还会难过，也可以开始求助、继续生活，不用等到一点都不难过。 / B is incorrect: This action does not resolve the situation described. Acceptance is a process and does not require eliminating every feeling before continuing.

<a id="c05-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：失利后，不必逼自己立刻开心，也不用认定什么都没了。可以为失去的东西难过，再看看身边还有谁、还有哪些机会。 / Responding to loss need not choose instant happiness or total hopelessness. Acknowledge what was lost, then notice remaining people and resources without denying either part.

**新题 / New prompt**：一次选拔没通过，但老师愿意帮忙复盘。这张牌在建议位时，怎样做更合适？ / A selection is unsuccessful, but a teacher offers a review. What fits the advice?

- A．承认失望，并接受仍可获得的复盘帮助。 / Acknowledge disappointment and accept the available review.
- B．因为有人帮助，就要求自己承认从来没受挫。 / Because help exists, insist no setback ever occurred.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：承认失望，并接受仍可获得的复盘帮助。 没通过选拔，可以失望；老师愿意帮忙，也可以接受。有人帮助，并不意味着这次没有受挫。 / A is correct: Acknowledge disappointment and accept the available review. Support and disappointment can coexist; accepting help does not rewrite the setback.
- B 不对：没通过选拔，可以失望；老师愿意帮忙，也可以接受。有人帮助，并不意味着这次没有受挫。 / B is incorrect: “Because help exists, insist no setback ever occurred.” does not address the specific conditions. Support and disappointment can coexist; accepting help does not rewrite the setback.

**依据 / Taught basis**：[本卡应用示范](#c05-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c05-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：演出取消令人遗憾，团队仍愿意支持新安排。哪句贴近？ / a cancelled show hurts, while the team supports a new plan. Which fits?

- A．先专注演出取消的原因，等问题解决后再联系团队 / Focus on why the show was cancelled and contact the team after the problem is resolved
- B．承认这次的遗憾，也看看谁还愿意一起想办法 / Recognise the loss and the people still present

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：承认这次的遗憾，也看看谁还愿意一起想办法。演出确实取消了，但团队还愿意继续支持，不能把一次取消当成什么都没有了。 / B is correct: Recognise the loss and the people still present. A particular loss does not erase all support; both parts matter.
- A 不对：这个解释把牌义带到了别处。演出确实取消了，但团队还愿意继续支持，不能把一次取消当成什么都没有了。 / A is incorrect: This interpretation shifts the card meaning elsewhere. A particular loss does not erase all support; both parts matter.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：一直想着已经失去的东西，很难注意到身边还留下了什么、还有谁愿意帮助自己。 记住意思就好，不必逐字背诵。 / The main meaning covered is: A loss occupies attention while some support remains. Acknowledge disappointment without erasing what is still available; neither forced positivity nor total hopelessness captures the whole card. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c06"></a>
### c06 · 圣杯六 / Six of Cups

**目标 / Goal**：理解圣杯六的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c06.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups06.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c06-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 想起过去，或遇到熟悉的人，心里感到温暖、亲切，也愿意真诚地关心别人。 孩子递出装着花的杯子，可以帮助记住童年、善意和温暖回忆；这不等于某位旧友一定会回来。
>
> Familiar memories or people may bring warmth, with simple generosity and goodwill. Let the past offer something useful without assuming it must return unchanged.

**画面助记 / Visual memory support**：较大的孩子把盛花的杯递向较小者，呈现善意与童年主题。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / One child offers a flower-filled cup to another, giving a cue for kindness and a childhood atmosphere. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：温暖回忆、善意。 / warm memory; kindness. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：水与熟悉的情感联系；六在本牌帮助整理回忆和善意，不用于推算旧人回来的日期。 / Water relates to familiar feeling; six here helps organise memory and kindness, not calculate a former partner’s return.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯六 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：较大的孩子把盛花的杯递向较小者，呈现善意与童年主题。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c06-application"></a>
**先看应用示范 / Read the worked application**

> 示范：想想过去哪些经历让自己开心，哪些还适合带进现在的生活。可以保留小时候读书的快乐，再按现在有空的时间安排，不需要让整个生活回到小时候。
>
> Example: draw support from old experience and keep what fits now. Memory can offer warmth, while practical arrangements still need present-day fit.

<a id="c06-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：坚持照搬学生时代的合作方式，忽略如今彼此已有不同时间条件。这里的逆位，是一直照旧做，反而不适合现在的生活。
>
> Case: old school-era collaboration rules are imposed despite changed schedules. Here the reversal concerns past patterns constraining the present.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c06-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c06-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：孩子递出装着花的杯子，可以帮助记住什么？ / What does offering the flower-filled cup connect to here?

- A．温暖回忆说明过去的关系适合在现在重新开始 / The warm memory suggests that the past relationship is suitable to restart now
- B．单纯善意与温暖回忆 / Simple goodwill and warm memory

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：单纯善意与温暖回忆。孩子递出装着花的杯子，可以帮助记住童年、善意和温暖回忆；这不等于某位旧友一定会回来。 / B is correct: Simple goodwill and warm memory. The image aids kindness and the past, not certainty about someone else's actions.
- A 不对：这个解释没有把画面线索连起来。孩子递出装着花的杯子，可以帮助记住童年、善意和温暖回忆；这不等于某位旧友一定会回来。 / A is incorrect: This reading does not connect the picture cues. The image aids kindness and the past, not certainty about someone else's actions.

<a id="c06-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c06-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：想重新拾起小时候的阅读爱好。圣杯六在建议位，哪种做法更合适？ / You want to return to a childhood love of reading. With the Six of Cups as advice, which approach fits?

- A．保留阅读带来的乐趣，按现在节奏安排 / Keep the pleasure and adapt it to the current routine
- B．尽量照搬小时候的阅读方式，才能找回原来的快乐 / Recreate the childhood reading routine closely to recover the earlier enjoyment

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：保留阅读带来的乐趣，按现在节奏安排。可以保留小时候读书的快乐，再按现在有空的时间安排，不需要让整个生活回到小时候。 / A is correct: Keep the pleasure and adapt it to the current routine. Memory can offer warmth, while practical arrangements still need present-day fit.
- B 不对：请回到画面里的具体细节：可以保留小时候读书的快乐，再按现在有空的时间安排，不需要让整个生活回到小时候。 / B is incorrect: Return to the specific details in the picture: Memory can offer warmth, while practical arrangements still need present-day fit.

<a id="c06-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c06-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：旧合作方式已不合新时间条件却坚持照搬，这张逆位牌更贴近哪种情况？ / An outdated arrangement is imposed despite changed schedules. What is this reversal?

- A．熟悉的做法曾经有效，可以先继续沿用再观察 / The familiar method worked before, so continue it for now and observe the result
- B．仍坚持旧做法，没有按现在的条件调整 / A past pattern limits present adjustment

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：仍坚持旧做法，没有按现在的条件调整。大家现在有了不同的时间安排，旧办法即使熟悉，也不一定还适合。 / B is correct: A past pattern limits present adjustment. Familiarity does not establish fit; the context explicitly changed.
- A 不对：先核对眼前例子的条件：大家现在有了不同的时间安排，旧办法即使熟悉，也不一定还适合。 / A is incorrect: Check the conditions in this example first: Familiarity does not establish fit; the context explicitly changed.

<a id="c06-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：收到老朋友的问候，可以感到温暖，但不能因此认定所有旧关系都会回到从前。 记住：单纯善意与温暖回忆，不是“某个旧人一定会回来”。 / One kind interaction cannot establish that the entire past will return. Compare: Simple goodwill and warm memory; this cannot be replaced by “A particular person from the past must return”.

**题目 / Prompt**：收到老朋友一句温暖问候，可以确认什么？ / an old friend sends a warm greeting. What is supported?

- A．老朋友的关心让人觉得温暖、亲切 / A familiar connection brings goodwill and warmth
- B．这句问候说明老朋友有意恢复过去的相处方式 / The greeting suggests that the old friend wants to restore the previous relationship pattern

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：老朋友的关心让人觉得温暖、亲切。收到老朋友的问候，可以感到温暖，但不能因此认定所有旧关系都会回到从前。 / A is correct: A familiar connection brings goodwill and warmth. One kind interaction cannot establish that the entire past will return.
- B 不对：这个说法混淆了题目正在考的含义。收到老朋友的问候，可以感到温暖，但不能因此认定所有旧关系都会回到从前。 / B is incorrect: This statement confuses the meaning being tested. One kind interaction cannot establish that the entire past will return.

<a id="c06-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：大家工作后空闲变少，需要重新约时间；没法天天见面，不等于不在乎这段关系。 题目描述的是“仍坚持旧做法，没有按现在的条件调整”，不是“只要熟悉就证明永远适合”。 / Changed time constraints call for adaptation, not denial of goodwill. Return to the stated context: “A past pattern limits present adjustment” fits this case; “Familiarity proves permanent suitability” is unsupported by that context.

**题目 / Prompt**：想像学生时代那样天天相聚，但大家现在都要工作。怎样安排更合适？ / You want to meet daily as you did at school, but everyone now has a job. What arrangement fits better?

- A．把不同时间条件当成没人有善意 / Treat changed schedules as proof nobody cares
- B．保留联系，调整成现实可行的频率 / Keep the connection and choose a workable frequency

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：保留联系，调整成现实可行的频率。大家工作后空闲变少，需要重新约时间；没法天天见面，不等于不在乎这段关系。 / B is correct: Keep the connection and choose a workable frequency. Changed time constraints call for adaptation, not denial of goodwill.
- A 不对：大家工作后空闲变少，需要重新约时间；没法天天见面，不等于不在乎这段关系。 / A is incorrect: Changed time constraints call for adaptation, not denial of goodwill.

<a id="c06-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：过去喜欢的事，今天仍然可以做，只是时间和方式可能要调整。不必把整个生活变回从前，才能保留那份快乐。 / Keep the parts of past experience that support the present, not every old condition. A workable current arrangement can preserve familiar warmth while acknowledging change.

**新题 / New prompt**：重新喜欢上学生时代的读书会，但现在只有每月一晚空闲。怎样应用？ / You miss a school-era reading group but now have only one evening a month. What fits?

- A．把每月小聚改成线上每周见，尽量还原从前的频率。 / Replace the monthly meeting with a weekly online session to recreate the former rhythm.
- B．按现在时间安排一次小聚，保留阅读与联系。 / Arrange a small meeting within current time, keeping reading and connection.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：按现在时间安排一次小聚，保留阅读与联系。 仍然可以一起读书，只需改成现在做得到的频率。不必要求和学生时代一模一样，也不用彻底放弃。 / B is correct: Arrange a small meeting within current time, keeping reading and connection. A valuable memory can continue in an adapted form, not only exact repetition or total rejection.
- A 不对：先别按这个做法继续；仍然可以一起读书，只需改成现在做得到的频率。不必要求和学生时代一模一样，也不用彻底放弃。 / A is incorrect: Do not continue with this approach yet; A valuable memory can continue in an adapted form, not only exact repetition or total rejection.

**依据 / Taught basis**：[本卡应用示范](#c06-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c06-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：祖辈教过的手艺让人感到亲切，想重新练习。哪句贴近？ / a craft taught by a grandparent feels comforting to revisit. Which fits?

- A．过去的美好经历，仍能给现在的自己温暖和支持 / Past experience can be a warm resource in the present
- B．重新练习时保持祖辈原来的做法，避免加入新的方法 / Keep the grandparent's original method when returning to the craft and avoid newer approaches

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：过去的美好经历，仍能给现在的自己温暖和支持。重拾旧手艺，可以感到亲切，也可以学新做法，不必认为只有过去才好。 / A is correct: Past experience can be a warm resource in the present. The lesson welcomes memory's support without rejecting present life or new methods.
- B 不对：这里要分清牌义的边界：重拾旧手艺，可以感到亲切，也可以学新做法，不必认为只有过去才好。 / B is incorrect: The boundary of the card meaning matters here: The lesson welcomes memory's support without rejecting present life or new methods.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：想起过去，或遇到熟悉的人，心里感到温暖、亲切，也愿意真诚地关心别人。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Familiar memories or people may bring warmth, with simple generosity and goodwill. Let the past offer something useful without assuming it must return unchanged. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c07"></a>
### c07 · 圣杯七 / Seven of Cups

**目标 / Goal**：理解圣杯七的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c07.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups07.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c07-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 想做的事很多，每一种都很吸引人，但还没弄清哪些真正做得到。 想到很多可能，不等于每一种都能实现。还要看看时间、预算和其他条件够不够。
>
> Many imagined possibilities attract attention, while desires and realistic conditions remain insufficiently separated. Explore options, then check which can actually be pursued.

**画面助记 / Visual memory support**：云中的七只杯装着不同形象，人物面对它们，可记为多种诱惑与想象。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / Seven cups hold varied images in clouds before a figure, helping recall diverse attractions and imagined possibilities. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：幻想、多种选项、按实际条件选择。 / fantasy; multiple options; practical screening. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：水关联愿望和想象；七不表示必须做七个选择，判断要回到实际条件。 / Water relates to desire and imagination; seven does not prescribe seven choices, and judgement returns to actual conditions.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯七 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：云中的七只杯装着不同形象，人物面对它们，可记为多种诱惑与想象。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c07-application"></a>
**先看应用示范 / Read the worked application**

> 示范：候选方向按实际条件筛选。喜欢一门课，不等于有时间和钱上完；选择前，要把这些条件一起看。
>
> Example: screen directions against real conditions. Preference and resources are different conditions; screening considers both.

<a id="c07-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：原来不断幻想多种职业，后来开始查资格和预算并缩小范围。这里的逆位，是不再只凭想象，而是开始按实际条件选择。
>
> Case: many careers were imagined; qualifications and budgets are now checked and the list narrows. Here the reversal means screening options and reducing fantasy.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c07-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c07-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：面对杯中许多吸引人的东西，人物像处在哪种状态？ / What do the many images in cups illustrate here?

- A．想做的事很多，还要看看哪些做得到 / Possibilities are many; wishes need separating from conditions
- B．吸引人的选项很多，先都保留可以避免错过机会 / Keep the appealing options open for now so promising opportunities are not missed

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：想做的事很多，还要看看哪些做得到。想到很多可能，不等于每一种都能实现。还要看看时间、预算和其他条件够不够。 / A is correct: Possibilities are many; wishes need separating from conditions. Imagination presents options, but feasibility needs checking separately.
- B 不对：这个解释没有把画面线索连起来。想到很多可能，不等于每一种都能实现。还要看看时间、预算和其他条件够不够。 / B is incorrect: This reading does not connect the picture cues. Imagination presents options, but feasibility needs checking separately.

<a id="c07-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c07-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：同时对很多课程感兴趣，想全部报名。圣杯七在建议位，先做什么更合适？ / Many courses appeal to you and you want to enrol in all of them. With the Seven of Cups as advice, what fits first?

- A．先报名几门最喜欢的课，开课后再根据时间决定退掉哪门 / Enrol in several favourites and decide which course to drop after the schedules begin
- B．比较时间、费用与目标，再选一项 / Compare time, cost, and goals before choosing one

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：比较时间、费用与目标，再选一项。喜欢一门课，不等于有时间和钱上完；选择前，要把这些条件一起看。 / B is correct: Compare time, cost, and goals before choosing one. Preference and resources are different conditions; screening considers both.
- A 不对：这个选项忽略了图中已经给出的区别。喜欢一门课，不等于有时间和钱上完；选择前，要把这些条件一起看。 / A is incorrect: This option overlooks a distinction already visible in the picture. Preference and resources are different conditions; screening considers both.

<a id="c07-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c07-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：开始查资格、预算并缩小职业范围，这张逆位牌更贴近哪种情况？ / Checking qualifications and budgets narrows career options. What is this reversal?

- A．从空想转向按实际条件选择 / Moving from fantasy toward practical selection
- B．选项越多越能证明无需选择 / More options prove no choice is needed

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：从空想转向按实际条件选择。已经在查资格、算预算、排除不合适的方向，说明开始认真选择，而不是继续空想。 / A is correct: Moving from fantasy toward practical selection. The case is narrowing options, not replacing judgement with quantity.
- B 不对：已经在查资格、算预算、排除不合适的方向，说明开始认真选择，而不是继续空想。 / B is incorrect: The case is narrowing options, not replacing judgement with quantity.

<a id="c07-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：写下十个想去的地方，只说明有这些愿望，还不知道预算和时间够不够。 记住：想做的事很多，还要看看哪些做得到，不是“看起来诱人的选项都已可实现”。 / A list presents possibilities, not evidence of budget or time. Compare: Possibilities are many; wishes need separating from conditions; this cannot be replaced by “Every attractive option is already achievable”.

**题目 / Prompt**：列出十个旅行目的地，还没查预算。现在可以确认什么？ / ten destinations are listed without checking budget. What is established?

- A．列出目的地后，优先从最想去的地方开始订票 / After listing the destinations, begin booking the place that feels most appealing
- B．有几个想去的地方，还不知道能不能成行 / Several wishes exist but feasibility is not established

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：有几个想去的地方，还不知道能不能成行。写下十个想去的地方，只说明有这些愿望，还不知道预算和时间够不够。 / B is correct: Several wishes exist but feasibility is not established. A list presents possibilities, not evidence of budget or time.
- A 不对：这里要分清牌义的边界：写下十个想去的地方，只说明有这些愿望，还不知道预算和时间够不够。 / A is incorrect: The boundary of the card meaning matters here: A list presents possibilities, not evidence of budget or time.

<a id="c07-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：根据预算排除不合适的计划，是在作出可行的选择，不是失去了想象力。 题目描述的是“从空想转向按实际条件选择”，不是“选项越多越能证明无需选择”。 / Screening uses conditions for judgement; it is not loss of imagination. Return to the stated context: “Moving from fantasy toward practical selection” fits this case; “More options prove no choice is needed” is unsupported by that context.

**题目 / Prompt**：查过预算后，排除了三个不合适的计划。哪句话更贴近这件事？ / After checking your budget, you remove three unsuitable plans. Which statement best describes this?

- A．在减少幻想、让选择更具体 / Reducing fantasy and making selection more concrete
- B．排除计划会限制创造力，应先继续扩充选择 / Removing plans could limit creativity, so the list should be expanded further first

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：在减少幻想、让选择更具体。根据预算排除不合适的计划，是在作出可行的选择，不是失去了想象力。 / A is correct: Reducing fantasy and making selection more concrete. Screening uses conditions for judgement; it is not loss of imagination.
- B 不对：这里要分清牌义的边界：根据预算排除不合适的计划，是在作出可行的选择，不是失去了想象力。 / B is incorrect: The boundary of the card meaning matters here: Screening uses conditions for judgement; it is not loss of imagination.

<a id="c07-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：筛选要把喜欢什么和能投入什么放在一起。明确有限的时间、预算和目标之后，先试一个方向，才能知道设想是否能实际进行。 / Screen options by combining interest with available investment. Given limited time, budget, and a goal, try one direction to see whether the imagined plan works.

**新题 / New prompt**：同时想报摄影、陶艺和舞蹈，但本月只够一门课的时间。怎样应用？ / Photography, pottery, and dance appeal, but this month has time for one course. What fits?

- A．比较当下目标和安排，选一门先试。 / Compare present goals and schedules and try one.
- B．先报名三门，把上课时间冲突留到开课后协调。 / Enrol in the three courses and resolve schedule conflicts after classes begin.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：比较当下目标和安排，选一门先试。 本月只有上一门课的时间，就需要先选一门。三门都喜欢，也不会自动多出时间。 / A is correct: Compare present goals and schedules and try one. Available time is explicitly limited; choosing must respect it, and more wishes do not create time.
- B 不对：这个做法没有解决眼前的情况。本月只有上一门课的时间，就需要先选一门。三门都喜欢，也不会自动多出时间。 / B is incorrect: This action does not resolve the situation described. Available time is explicitly limited; choosing must respect it, and more wishes do not create time.

**依据 / Taught basis**：[本卡应用示范](#c07-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c07-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：创业想法很多，但团队只有一个月试做时间。哪项贴近建议？ / many venture ideas compete for one month of trial time. Which fits?

- A．把三种想法都按完整项目推进，不先比较时间和资源。 / Run three ideas as full projects without first comparing time and resources.
- B．按可用资源选一个小试验 / Select one small trial using available resources

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：按可用资源选一个小试验。只有一个月，就要挑一个条件允许的想法先试。想到了很多，并不等于已经做出了成果。 / B is correct: Select one small trial using available resources. Connecting wishes to resources answers the lesson; ideas are not achievements.
- A 不对：把三种想法都做成完整项目，没有回应一个月的时间和资源限制；这里要先选一个小试验。 / A is incorrect: Running three full projects ignores the one-month limit and available resources; the advice is to choose one small trial.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：想做的事很多，每一种都很吸引人，但还没弄清哪些真正做得到。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Many imagined possibilities attract attention, while desires and realistic conditions remain insufficiently separated. Explore options, then check which can actually be pursued. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c08"></a>
### c08 · 圣杯八 / Eight of Cups

**目标 / Goal**：理解圣杯八的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c08.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups08.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c08-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 原来投入的事情，已经不再让自己满足，开始想离开，寻找更值得做的事。 这张牌强调的是不再满足、转身寻找。它不保证只要离开，就一定选对了方向。
>
> A previously valued situation no longer meets inner needs, and someone turns away to seek a more meaningful direction. Leaving is a considered theme, not proof every departure is wise.

**画面助记 / Visual memory support**：人物背向整齐摆放的杯子走向山地，重点是主动转身离开。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A figure walks away from arranged cups toward hills, making the turn away from something once present a visible memory cue. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：转身离开、寻找意义。 / turning away; seeking meaning. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：水关联满足与需求；八的编号不独立决定离开，必须结合牌面和问题。 / Water concerns fulfilment and needs; the number eight does not itself dictate departure, which needs the card and context.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯八 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：人物背向整齐摆放的杯子走向山地，重点是主动转身离开。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c08-application"></a>
**先看应用示范 / Read the worked application**

> 示范：想清楚为什么不再满足，再准备下一步。要先了解为什么想离开、下一步准备做什么，不能看见这张牌就马上放弃所有投入。
>
> Example: identify unmet needs and prepare a next step. The lesson emphasises a reasoned turn, not an instruction to leave without judgement.

<a id="c08-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：已清楚旧活动不再适合，却因为怕改变而反复答应留下。这里的逆位，是明知不再适合，却迟迟走不开。
>
> Case: an activity no longer fits, yet fear of change repeatedly leads to staying. Here the reversal focuses on difficulty leaving and returning to the old pattern.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c08-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c08-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：人物背向杯子走开，主要表达了什么？ / What is mainly taught by the figure walking away from the cups?

- A．离开代表对原来的投入失望，重点是尽快换方向 / Walking away reflects disappointment with the old investment, so changing direction quickly is the priority
- B．原来的事情不再让自己满足，开始找更值得做的事 / An old situation no longer fulfils needs, prompting a search

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：原来的事情不再让自己满足，开始找更值得做的事。这张牌强调的是不再满足、转身寻找。它不保证只要离开，就一定选对了方向。 / B is correct: An old situation no longer fulfils needs, prompting a search. The card describes departure and seeking without guaranteeing every departure is wise.
- A 不对：这个解释没有把画面线索连起来。这张牌强调的是不再满足、转身寻找。它不保证只要离开，就一定选对了方向。 / A is incorrect: This reading does not connect the picture cues. The card describes departure and seeking without guaranteeing every departure is wise.

<a id="c08-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c08-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：参加多年的活动已不再符合现在的目标。圣杯八在建议位，哪种做法更合适？ / An activity you have pursued for years no longer fits your goals. With the Eight of Cups as advice, which step fits?

- A．确认需求后安排退出或转向 / Clarify needs and plan an exit or change
- B．因为已经投入多年，继续参加，不再检查它是否符合现在的目标。 / Continue because of the years already invested, without checking whether the activity still fits your goals.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：确认需求后安排退出或转向。要先了解为什么想离开、下一步准备做什么，不能看见这张牌就马上放弃所有投入。 / A is correct: Clarify needs and plan an exit or change. The lesson emphasises a reasoned turn, not an instruction to leave without judgement.
- B 不对：过去投入很多，不代表现在仍要继续；圣杯八提醒重新检查是否适合，并安排下一步方向。 / B is incorrect: Past investment alone is not a reason to continue; the Eight of Cups asks whether this still fits and what direction to take next.

<a id="c08-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c08-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：明确不再适合却因怕变化反复留下，这张逆位牌更贴近哪种情况？ / Knowing it no longer fits but repeatedly staying from fear illustrates what?

- A．已经顺利完成转向 / A change of direction is already completed smoothly
- B．明知不再适合，还是很难离开 / Difficulty leaving an unfulfilling pattern

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：明知不再适合，还是很难离开。题目说他每次都又答应留下，说明还没有离开，不能当成已经顺利换了方向。 / B is correct: Difficulty leaving an unfulfilling pattern. The case explicitly involves staying and repetition, not a completed departure.
- A 不对：题目说他每次都又答应留下，说明还没有离开，不能当成已经顺利换了方向。 / A is incorrect: The case explicitly involves staying and repetition, not a completed departure.

<a id="c08-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：杯子还好好地摆在那里，人物却转身离开了。可以这样记：不是一无所有，而是已有的东西不再让自己满足。 记住：原来的事情不再让自己满足，开始找更值得做的事，不是“只要离开就保证选择永远正确”。 / The cups remain; the focus is changed fulfilment and direction, not total destruction. Compare: An old situation no longer fulfils needs, prompting a search; this cannot be replaced by “Any departure guarantees the correct choice”.

**题目 / Prompt**：仍拥有原来的成果，却决定寻找不同方向。离开是否必须因为一无所有？ / past achievements remain, but a new direction is sought. Must departure mean nothing remains?

- A．不是，拥有一些成果也可能不再满足 / No; achievements can remain without fulfilling current needs
- B．是，若成果还在，离开就更像逃避现有问题 / Yes; leaving while achievements remain is more likely to be avoidance of the current problem

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：不是，拥有一些成果也可能不再满足。杯子还好好地摆在那里，人物却转身离开了。可以这样记：不是一无所有，而是已有的东西不再让自己满足。 / A is correct: No; achievements can remain without fulfilling current needs. The cups remain; the focus is changed fulfilment and direction, not total destruction.
- B 不对：这个判断忽略了题目给出的条件。杯子还好好地摆在那里，人物却转身离开了。可以这样记：不是一无所有，而是已有的东西不再让自己满足。 / B is incorrect: This judgment overlooks a condition given in the question. The cups remain; the focus is changed fulfilment and direction, not total destruction.

<a id="c08-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：他留下，是怕让别人失望，不是因为这件事已经重新让他满意。 题目描述的是“明知不再适合，还是很难离开”，不是“已经顺利完成转向”。 / Fear explains staying here; it does not establish fulfilment. Return to the stated context: “Difficulty leaving an unfulfilling pattern” fits this case; “A change of direction is already completed smoothly” is unsupported by that context.

**题目 / Prompt**：明知不想继续，每次却因为怕别人失望而留下。先做什么更合适？ / You know you no longer want to continue, yet stay each time for fear of disappointing others. What can you do first?

- A．把不敢离开当成已经满足 / Treat difficulty leaving as proof of fulfilment
- B．理清自己需求，安排自己做得到的退出步骤 / Clarify needs and plan manageable departure steps

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：理清自己需求，安排自己做得到的退出步骤。他留下，是怕让别人失望，不是因为这件事已经重新让他满意。 / B is correct: Clarify needs and plan manageable departure steps. Fear explains staying here; it does not establish fulfilment.
- A 不对：他留下，是怕让别人失望，不是因为这件事已经重新让他满意。 / A is incorrect: Fear explains staying here; it does not establish fulfilment.

<a id="c08-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：先想清楚为什么不想继续、下一步要怎么走。过去的付出仍有价值，不必全盘否定；也不是一有不舒服就必须离开。 / Before changing direction, clarify what no longer fulfils you and what a next step requires. Leaving can respect past value; not every discomfort is an order to leave immediately.

**新题 / New prompt**：参与多年的兴趣社团已不符合现在目标，但还有已答应的任务。怎样应用？ / A long-term club no longer fits current goals, but agreed duties remain. What fits?

- A．先退出社团，把已答应的任务留到之后再解释。 / Leave the club first and explain the previously agreed duties afterward.
- B．理清需求，安排交接后探索新方向。 / Clarify needs, arrange a handover, then explore a new direction.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：理清需求，安排交接后探索新方向。 可以去找更合适的方向，同时把已经答应的任务交接好。想离开，不等于必须突然取消所有约定。 / B is correct: Clarify needs, arrange a handover, then explore a new direction. A prepared transition addresses new needs and existing responsibilities; abrupt cancellation is not required by the lesson.
- A 不对：这个做法没有解决眼前的情况。可以去找更合适的方向，同时把已经答应的任务交接好。想离开，不等于必须突然取消所有约定。 / A is incorrect: This action does not resolve the situation described. A prepared transition addresses new needs and existing responsibilities; abrupt cancellation is not required by the lesson.

**依据 / Taught basis**：[本卡应用示范](#c08-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c08-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：已经读过许多书，但原来的读书方向不再回答关心的问题。哪句贴近？ / much reading has been done, but the old subject no longer answers current questions. Which fits?

- A．承认旧投入价值，同时寻找新方向 / Acknowledge past investment while seeking a new direction
- B．旧方向既然已经有成果，就应继续深化而不是转向 / Because the old direction produced results, it should be developed further rather than changed

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：承认旧投入价值，同时寻找新方向。过去的投入仍然有价值，只是现在想解决的问题变了，所以需要找新方向。 / A is correct: Acknowledge past investment while seeking a new direction. Changing direction need not erase past value; current needs have changed.
- B 不对：这个解释把牌义带到了别处。过去的投入仍然有价值，只是现在想解决的问题变了，所以需要找新方向。 / B is incorrect: This interpretation shifts the card meaning elsewhere. Changing direction need not erase past value; current needs have changed.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：原来投入的事情，已经不再让自己满足，开始想离开，寻找更值得做的事。 记住意思就好，不必逐字背诵。 / The main meaning covered is: A previously valued situation no longer meets inner needs, and someone turns away to seek a more meaningful direction. Leaving is a considered theme, not proof every departure is wise. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c09"></a>
### c09 · 圣杯九 / Nine of Cups

**目标 / Goal**：理解圣杯九的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c09.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups09.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c09-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 自己的愿望得到满足，能为已有的成果高兴，也愿意好好享受。 这里说的是自己感到满意，不能据此认定其他人也都满意。
>
> A personal wish or need finds satisfaction, and what has been attained can be enjoyed. Personal contentment is not automatically evidence that everyone else shares it.

**画面助记 / Visual memory support**：人物坐在九只杯前，姿态安定，可记为享受已有的满足。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A seated figure rests before nine displayed cups, helping recall enjoyment of what one has. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：个人满足、愿望实现、享受。 / personal satisfaction; fulfilled wishes; enjoyment. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：圣杯对应水元素，和感受有关；九在这里帮助记住已经得到一些想要的东西。但自己满足，不代表所有人都一样满意。 / Water concerns personal satisfaction; nine recalls accumulated attainment here, not automatic happiness for everyone.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯九 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：人物坐在九只杯前，姿态安定，可记为享受已有的满足。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c09-application"></a>
**先看应用示范 / Read the worked application**

> 示范：完成自己重视的目标，允许自己享受成果。自己学会了喜欢的曲子，当然可以高兴；别人可能喜欢不同的音乐，不必和自己一样。
>
> Example: enjoy completing a valued goal. One may enjoy an achievement without deciding everyone else's preferences.

<a id="c09-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：买到一直想要的东西，却发现真正需要的是休息与联系。这里的逆位，是得到了想要的东西，却没有真正感到满足。
>
> Case: a long-desired purchase is obtained, yet rest and connection remain unmet. Here the reversal concerns outer gratification missing inner needs.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c09-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c09-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：圣杯九说的满足，主要是谁的感受？ / Whose experience of satisfaction is central here?

- A．个人愿望或需要得到满足 / An individual's wish or need is satisfied
- B．重点是共同关系中的满足感，个人感受放在其次 / The main theme is satisfaction shared in a relationship, with personal enjoyment secondary

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：个人愿望或需要得到满足。这里说的是自己感到满意，不能据此认定其他人也都满意。 / A is correct: An individual's wish or need is satisfied. Personal satisfaction cannot speak for others; the subject matters.
- B 不对：这个选项忽略了图中已经给出的区别。这里说的是自己感到满意，不能据此认定其他人也都满意。 / B is incorrect: This option overlooks a distinction already visible in the picture. Personal satisfaction cannot speak for others; the subject matters.

<a id="c09-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c09-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：终于学会了一首很喜欢的曲子。圣杯九在建议位，怎样对待这份成绩更合适？ / You have learned a piece of music you love. With the Nine of Cups as advice, which response fits?

- A．先把成绩分享给别人，得到肯定后再享受成果 / Share the achievement first and enjoy it after other people recognise it
- B．欣赏成果并享受这份满足 / Appreciate the achievement and enjoy satisfaction

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：欣赏成果并享受这份满足。自己学会了喜欢的曲子，当然可以高兴；别人可能喜欢不同的音乐，不必和自己一样。 / B is correct: Appreciate the achievement and enjoy satisfaction. One may enjoy an achievement without deciding everyone else's preferences.
- A 不对：请回到画面里的具体细节：自己学会了喜欢的曲子，当然可以高兴；别人可能喜欢不同的音乐，不必和自己一样。 / A is incorrect: Return to the specific details in the picture: One may enjoy an achievement without deciding everyone else's preferences.

<a id="c09-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c09-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：购物愿望达成却仍缺休息与联系，这张逆位牌更贴近哪种情况？ / A purchase is obtained but rest and connection remain unmet. What is this reversal?

- A．东西买到了，但真正缺的休息和陪伴没有得到满足 / Outer gratification has missed the underlying need
- B．买到想要的东西，满足感会随着时间慢慢出现 / After obtaining the desired item, the feeling of satisfaction may develop with time

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：东西买到了，但真正缺的休息和陪伴没有得到满足。案例区分了获得物品与真实需要，不能把两者等同。 / A is correct: Outer gratification has missed the underlying need. The case distinguishes obtaining an item from meeting the actual need.
- B 不对：这个结论比题目给出的信息多走了一步。案例区分了获得物品与真实需要，不能把两者等同。 / B is incorrect: This conclusion goes beyond the information provided. The case distinguishes obtaining an item from meeting the actual need.

<a id="c09-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：自己喜欢这个方案，只能说明自己的想法。对方满不满意，还要听对方怎么说。 记住：个人愿望或需要得到满足，不是“所有相关者一定同样满意”。 / The Nine's personal perspective does not supply the other person's response. Compare: An individual's wish or need is satisfied; this cannot be replaced by “Every involved person must be equally satisfied”.

**题目 / Prompt**：自己喜欢一个合作方案，能确认双方都满意吗？ / liking a partnership plan personally establishes mutual satisfaction?

- A．能，自己的满意就是双方满意 / Yes; one's satisfaction equals mutual satisfaction
- B．不能，还要询问另一方 / No; the other party still needs to be asked

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：不能，还要询问另一方。自己喜欢这个方案，只能说明自己的想法。对方满不满意，还要听对方怎么说。 / B is correct: No; the other party still needs to be asked. The Nine's personal perspective does not supply the other person's response.
- A 不对：自己喜欢这个方案，只能说明自己的想法。对方满不满意，还要听对方怎么说。 / A is incorrect: The Nine's personal perspective does not supply the other person's response.

<a id="c09-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：如果真正缺的是陪伴，再买东西也不能代替和人相处。先弄清缺什么，才知道该怎么补上。 题目描述的是“东西买到了，但真正缺的休息和陪伴没有得到满足”，不是“只要买到东西就证明全部需要满足”。 / Meeting a need first requires identifying it; more purchases do not directly provide companionship. Return to the stated context: “Outer gratification has missed the underlying need” fits this case; “Getting the item proves every need is met” is unsupported by that context.

**题目 / Prompt**：买了很多东西犒劳自己，还是觉得缺少陪伴。怎样做更合适？ / You buy many treats for yourself but still miss companionship. What response fits?

- A．弄清自己缺的是陪伴，找人聊聊、相处一下 / Identify the need for connection and arrange real contact
- B．再换一种更符合期待的商品，看看心情能否改善 / Try a different purchase that better matches expectations and see whether the mood improves

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：弄清自己缺的是陪伴，找人聊聊、相处一下。如果真正缺的是陪伴，再买东西也不能代替和人相处。先弄清缺什么，才知道该怎么补上。 / A is correct: Identify the need for connection and arrange real contact. Meeting a need first requires identifying it; more purchases do not directly provide companionship.
- B 不对：先别按这个做法继续；如果真正缺的是陪伴，再买东西也不能代替和人相处。先弄清缺什么，才知道该怎么补上。 / B is incorrect: Do not continue with this approach yet; Meeting a need first requires identifying it; more purchases do not directly provide companionship.

<a id="c09-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：先看看自己为什么为这个成果高兴。可以喜欢自己的作品，也允许别人有不同喜好，不必等所有人都赞同才开心。 / Enjoy an achievement by recognising the need it meets for you. You can like your work while others have different preferences; personal joy need not become universal agreement.

**新题 / New prompt**：做成一直想做的蛋糕，自己很满意，朋友更喜欢另一种口味。怎样应用？ / You are pleased with a long-desired cake, while a friend prefers another flavour. What fits?

- A．享受自己的满足，也允许朋友有不同喜好。 / Enjoy your satisfaction and allow the friend's different preference.
- B．先说服朋友欣赏这款口味，再庆祝自己的成果。 / Persuade the friend to appreciate the flavour before celebrating the achievement.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：享受自己的满足，也允许朋友有不同喜好。 自己喜欢这个蛋糕，可以高兴；朋友喜欢另一种口味，也不影响自己的满足。 / A is correct: Enjoy your satisfaction and allow the friend's different preference. Personal satisfaction does not require identical preferences or demand that others validate the feeling.
- B 不对：这样做会漏掉题目里的关键一步。自己喜欢这个蛋糕，可以高兴；朋友喜欢另一种口味，也不影响自己的满足。 / B is incorrect: This action skips a key step in the question. Personal satisfaction does not require identical preferences or demand that others validate the feeling.

**依据 / Taught basis**：[本卡应用示范](#c09-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c09-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：完成长期想做的个人画作，自己很满意。哪句贴近？ / a long-desired personal painting is completed and enjoyed. Which fits?

- A．自己满意还不够，要先得到观众认可才算完成 / Personal satisfaction is not enough; audience recognition is needed before the work feels complete
- B．个人愿望实现带来满足 / A fulfilled personal wish brings satisfaction

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：个人愿望实现带来满足。自己为作品满意，就已经符合这张牌的个人满足；别人可能有不同看法。 / B is correct: A fulfilled personal wish brings satisfaction. The theme can hold in personal experience without requiring or proving universal approval.
- A 不对：这个说法混淆了题目正在考的含义。自己为作品满意，就已经符合这张牌的个人满足；别人可能有不同看法。 / A is incorrect: This statement confuses the meaning being tested. The theme can hold in personal experience without requiring or proving universal approval.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：自己的愿望得到满足，能为已有的成果高兴，也愿意好好享受。 记住意思就好，不必逐字背诵。 / The main meaning covered is: A personal wish or need finds satisfaction, and what has been attained can be enjoyed. Personal contentment is not automatically evidence that everyone else shares it. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c10"></a>
### c10 · 圣杯十 / Ten of Cups

**目标 / Goal**：理解圣杯十的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c10.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups10.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c10-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 和亲近的人相处融洽，彼此关心，感到幸福和安心。家人、恋人，或一群相处得好的朋友，都可能有这种感受。图中的成人和孩子一起站在家园前，可以帮助记住“和重要的人一起感到幸福”。
>
> Feel happy and at ease with people close to you, caring for one another. This can be shared by family, partners or a close group of friends. The adults and children together in front of their home help you remember happiness shared with people who matter to you.

**画面助记 / Visual memory support**：两位成人抬起手臂，孩子在旁边玩耍，远处还有家园。把这些细节放在一起，可以记住和亲近的人共同感受幸福。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / Adults raise their arms, children move nearby, and a rainbow of cups arches over a home landscape: the scene places happiness within shared life. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：和谐、归属、一起生活的幸福。 / harmony; belonging; shared happiness. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：圣杯对应情感，十在这里强调和亲近的人一起感到幸福。它不代表这种幸福永远不会改变。 / Water relates to feeling; ten here recalls fulfilment gathered into shared life, not unchanging perfection.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯十 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：两位成人抬起手臂，孩子在旁边玩耍，远处还有家园。把这些细节放在一起，可以记住和亲近的人共同感受幸福。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c10-application"></a>
**先看应用示范 / Read the worked application**

> 几位室友希望相处得更融洽。圣杯十在建议位，可以这样做：先聊聊各自的生活习惯和需要，比如什么时候需要安静、公共空间怎样用，再一起商量。重点是大家能不能彼此照顾、住得舒服，不只是把房间布置漂亮。
>
> Several housemates want to get along better. With the Ten of Cups as advice, discuss daily habits and needs, such as quiet hours and how to use shared space, then agree together. What matters is caring for one another and feeling comfortable at home, not just decorating the rooms.

<a id="c10-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：家里人对外总说日子过得很好，私下却不谈各自想要怎样的生活，彼此的想法越来越不一样。这里的逆位，强调表面和睦、实际期待不同。
>
> Case: a household presents perfection but never discusses members’ different daily needs. Here the reversal focuses on different expectations behind an appearance of harmony.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c10-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c10-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：这张牌说的幸福，重点在哪里？ / What is central beyond one person's satisfaction?

- A．重点是家庭或群体呈现出和谐的样子 / The emphasis is on a family or group presenting a harmonious image
- B．和亲近的人一起感到幸福、彼此支持 / Happiness is shared in relationships and communal life

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：和亲近的人一起感到幸福、彼此支持。成人和孩子一起出现在家园前，可以帮助记住“一起生活的幸福”。这里不只是一个人对自己的生活满意。 / B is correct: Happiness is shared in relationships and communal life. The shared setting aids belonging and shared fulfilment; the communal element matters.
- A 不对：这个判断忽略了题目给出的条件。成人和孩子一起出现在家园前，可以帮助记住“一起生活的幸福”。这里不只是一个人对自己的生活满意。 / A is incorrect: This judgment overlooks a condition given in the question. The shared setting aids belonging and shared fulfilment; the communal element matters.

<a id="c10-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c10-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：几位室友希望住在一起更融洽。圣杯十在建议位，哪种做法更合适？ / Several housemates want to get along better in their shared home. With the Ten of Cups as advice, which approach fits?

- A．聊清楚各自的生活习惯和需要，平时互相照顾 / Discuss expectations and practise mutual support
- B．只顾把房间布置漂亮，不管大家住得舒不舒服 / Decorate the space while ignoring members' needs

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：聊清楚各自的生活习惯和需要，平时互相照顾。一起住得幸福，要看大家是否互相关心、彼此支持，不只是房子布置得好不好看。 / A is correct: Discuss expectations and practise mutual support. Living happily together depends on care and mutual support, not just how the home looks.
- B 不对：一起住得幸福，要看大家是否互相关心、彼此支持，不只是房子布置得好不好看。 / B is incorrect: Living happily together depends on care and mutual support, not just how the home looks.

<a id="c10-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c10-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：表面完美却不谈不同生活需求，这张逆位牌更贴近哪种情况？ / An image of perfection hides different daily needs. What is this reversal?

- A．照片里的和谐说明分歧暂时不会影响共同生活 / The harmony in the photograph suggests that the differences will not disrupt shared life for now
- B．表面相处和睦，彼此想要的生活却不一样 / The shared ideal is disconnected from the lived relationship

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：表面相处和睦，彼此想要的生活却不一样。题目已经说，大家想要的生活不同、又不愿说出来。照片好看，不能说明这些分歧已经解决。 / B is correct: The shared ideal is disconnected from the lived relationship. Appearance cannot replace actual needs and interaction; disagreement is explicitly given.
- A 不对：这个判断忽略了题目给出的条件。题目已经说，大家想要的生活不同、又不愿说出来。照片好看，不能说明这些分歧已经解决。 / A is incorrect: This judgment overlooks a condition given in the question. Appearance cannot replace actual needs and interaction; disagreement is explicitly given.

<a id="c10-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：圣杯十强调大家一起感到幸福。一个人满意，还不能代表其他人都开心；要看其他人的需要有没有被照顾到，是否也觉得自己受到重视。 / The Ten of Cups emphasizes happiness shared by the group. One person's satisfaction does not establish that everyone is happy. Consider whether the others' needs are met and whether they feel valued too.

**题目 / Prompt**：几位朋友一起旅行，其中一人玩得很开心，其他人却一直觉得被忽略。这能说明大家共享幸福吗？ / Friends travel together. One has a wonderful time, but the others keep feeling ignored. Does this show happiness shared by the group?

- A．还不能，要看其他人的需要有没有被照顾到 / Not yet; the others' needs matter too
- B．能，有人玩得很开心，说明行程整体安排得不错 / Yes; one person's enjoyment suggests the trip was well arranged overall

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：题目里其他人觉得被忽略，说明他们还没有一起感到开心。圣杯十强调的是大家共享的幸福。 / The others feel ignored, so the enjoyment is not yet shared. The Ten of Cups emphasizes happiness experienced together.
- B 不对：这个结论比题目给出的信息多走了一步。题目里其他人觉得被忽略，说明他们还没有一起感到开心。圣杯十强调的是大家共享的幸福。 / B is incorrect: This conclusion goes beyond the information provided. The others feel ignored, so the enjoyment is not yet shared. The Ten of Cups emphasizes happiness experienced together.

<a id="c10-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：先把不同的想法说出来，才能商量怎样一起生活。只装作和睦，分歧仍然在那里。 题目描述的是“表面相处和睦，彼此想要的生活却不一样”，不是“照片好看就证明所有人和谐”。 / Acknowledging differences enables a shared vision; appearances hide the issue. Return to the stated context: “The shared ideal is disconnected from the lived relationship” fits this case; “A pleasing image proves harmony for everyone” is unsupported by that context.

**题目 / Prompt**：大家想过的生活不一样，却一直假装没有分歧。先做什么更合适？ / People want different ways of living but keep pretending they agree. What can they do first?

- A．先把共同生活的安排照旧维持，等时机合适再谈差异 / Keep the shared-life arrangements unchanged and discuss the differences when the timing feels better
- B．说清各自想要怎样的生活，商量哪些事情能一起做到 / Clarify expectations and seek what can be shared

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：说清各自想要怎样的生活，商量哪些事情能一起做到。先把不同的想法说出来，才能商量怎样一起生活。只装作和睦，分歧仍然在那里。 / B is correct: Clarify expectations and seek what can be shared. Acknowledging differences enables a shared vision; appearances hide the issue.
- A 不对：这个做法没有解决眼前的情况。先把不同的想法说出来，才能商量怎样一起生活。只装作和睦，分歧仍然在那里。 / A is incorrect: This action does not resolve the situation described. Acknowledging differences enables a shared vision; appearances hide the issue.

<a id="c10-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：住在一起是否幸福，要看大家的需要有没有被认真对待。布置得漂亮固然好，但不能代替平时的关心和照顾。 / Shared fulfilment requires participants to be heard and cared for. Attractive surroundings can help, but appearance cannot replace shared satisfaction when needs are ignored.

**新题 / New prompt**：室友准备共同聚餐，有人需要安静、有人希望多交流。这张牌在建议位时，怎样做更合适？ / Housemates plan a shared meal: one needs quiet and another wants conversation. What fits?

- A．只装饰餐桌，认定好看就代表人人被照顾。 / Decorate the table and assume appearance means everyone is cared for.
- B．先了解各自需要，协商大家能接受的安排。 / Hear each person's needs and agree on an acceptable arrangement.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先了解各自需要，协商大家能接受的安排。 有人想安静、有人想聊天，需要先商量。餐桌再漂亮，也不能替大家决定怎样相处才舒服。 / B is correct: Hear each person's needs and agree on an acceptable arrangement. Shared fulfilment concerns lived experience; decoration does not establish that needs were met.
- A 不对：有人想安静、有人想聊天，需要先商量。餐桌再漂亮，也不能替大家决定怎样相处才舒服。 / A is incorrect: “Decorate the table and assume appearance means everyone is cared for.” does not address the specific conditions. Shared fulfilment concerns lived experience; decoration does not establish that needs were met.

**依据 / Taught basis**：[本卡应用示范](#c10-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c10-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：一群长期合住的朋友平时互相照顾，也愿意继续住在一起。哪句贴近？ / Friends who have lived together for years support one another and want to keep sharing a home. Which fits?

- A．和亲近的人一起感到幸福、像有一个家 / Belonging and fulfilment within shared relationships
- B．愿意继续合住，说明彼此的生活期待已经相同 / Wanting to continue living together shows that their expectations for daily life already match

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：和亲近的人一起感到幸福、像有一个家。现在相处幸福、彼此支持，不代表以后永远不会意见不同。 / A is correct: Belonging and fulfilment within shared relationships. Shared fulfilment is the present theme, not a prediction of permanent agreement.
- B 不对：这个说法混淆了题目正在考的含义。现在相处幸福、彼此支持，不代表以后永远不会意见不同。 / B is incorrect: This statement confuses the meaning being tested. Shared fulfilment is the present theme, not a prediction of permanent agreement.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：和亲近的人相处融洽，感到幸福、像有一个家，也愿意一起过以后的生活。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Emotional fulfilment is shared in close relationships or communal life, with a sense of belonging and a future people wish to share. This is not a guarantee of a particular family form or permanent harmony. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c11"></a>
### c11 · 圣杯侍从 / Page of Cups

**目标 / Goal**：理解圣杯侍从的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c11.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups11.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c11-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 第一次留意到新的感受或灵感，觉得新鲜，想试着表达，却还不太熟练。 侍从好奇地看着杯中的鱼，可以帮助记住对新感受的好奇。它不能证明某个人一定会发消息来。
>
> Meet new feelings or inspiration with openness and a learner’s sensitivity. A small sincere expression can begin exploration without requiring a dramatic promise.

**画面助记 / Visual memory support**：侍从看着从杯子里探出头的鱼。用这个新奇的画面，记住第一次发现某种感受或灵感时的好奇。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / The figure watches a fish emerging from a cup, giving a memorable cue for something emotionally surprising or new. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：新的感受、好奇、试着表达。 / emotional curiosity; sensitivity; first expression. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：侍从强调第一次接触、开始学习；水关联感受，不能把鱼读成某人一定发来消息。 / The Page is a role of first contact; water relates to feeling, not proof that the fish predicts a message from a particular person.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯侍从 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：侍从看着从杯子里探出头的鱼。用这个新奇的画面，记住第一次发现某种感受或灵感时的好奇。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c11-application"></a>
**先看应用示范 / Read the worked application**

> 示范：用一句简单的话表达感谢。第一次表达，不熟练很正常。先写一小段，才能慢慢找到适合自己的表达方式。
>
> Example: express thanks in one simple sentence. Beginner expression can be tentative; a small trial helps explore feeling.

<a id="c11-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：想告诉伙伴自己很感激，却担心表达不好而完全缩回去。这里的逆位，是因为害羞、担心说不好，而不敢表达。
>
> Case: gratitude toward a companion remains unexpressed because of fear of saying it badly. Here the reversal concerns shy, blocked expression.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c11-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c11-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：侍从好奇地看着杯里的鱼，可以帮助记住什么？ / What does the unexpected fish help recall?

- A．好奇地接触新的感受与灵感 / Curiously encountering new feeling and inspiration
- B．已经确定某个人会发来消息 / Certainty that a specific person will send a message

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：好奇地接触新的感受与灵感。侍从好奇地看着杯中的鱼，可以帮助记住对新感受的好奇。它不能证明某个人一定会发消息来。 / A is correct: Curiously encountering new feeling and inspiration. The surprising image aids emotional openness, not evidence of another person's future actions.
- B 不对：侍从好奇地看着杯中的鱼，可以帮助记住对新感受的好奇。它不能证明某个人一定会发消息来。 / B is incorrect: The surprising image aids emotional openness, not evidence of another person's future actions.

<a id="c11-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c11-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：刚发现自己喜欢写诗，还不太会表达。圣杯侍从在建议位，哪种做法更合适？ / You have discovered an interest in writing poetry but feel inexperienced. With the Page of Cups as advice, which step fits?

- A．认为还不够成熟，就不允许自己写 / Forbid expression until complete maturity
- B．先写一小段，试着表达刚有的感受 / Try a short piece and explore the new feeling

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先写一小段，试着表达刚有的感受。第一次表达，不熟练很正常。先写一小段，才能慢慢找到适合自己的表达方式。 / B is correct: Try a short piece and explore the new feeling. Beginner expression can be tentative; a small trial helps explore feeling.
- A 不对：第一次表达，不熟练很正常。先写一小段，才能慢慢找到适合自己的表达方式。 / A is incorrect: Beginner expression can be tentative; a small trial helps explore feeling.

<a id="c11-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c11-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：因害怕说不好而压住感谢，这张逆位牌更贴近哪种情况？ / Fear of imperfect wording suppresses gratitude. What is this reversal?

- A．明明有感谢，却因为害羞说不出口 / Shyness obstructs expression of real feeling
- B．没能表达，说明自己还没有理解这份感受 / The difficulty expressing it suggests the feeling has not yet been understood

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：明明有感谢，却因为害羞说不出口。题目说他很感谢伙伴，只是担心说不好，所以没有表达，不是完全不在意。 / A is correct: Shyness obstructs expression of real feeling. Gratitude is already stated; expression, not feeling itself, is difficult.
- B 不对：这个结论比题目给出的信息多走了一步。题目说他很感谢伙伴，只是担心说不好，所以没有表达，不是完全不在意。 / B is incorrect: This conclusion goes beyond the information provided. Gratitude is already stated; expression, not feeling itself, is difficult.

<a id="c11-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：可以先感受这份触动，试着了解它，不必刚有灵感就决定一辈子都要做什么。 记住：好奇地接触新的感受与灵感，不是“已经确定某个人会发来消息”。 / A new feeling can be explored without an unsupported major promise. Compare: Curiously encountering new feeling and inspiration; this cannot be replaced by “Certainty that a specific person will send a message”.

**题目 / Prompt**：第一次感到某个创作想法很打动自己。可以怎样理解？ / a creative idea feels moving for the first time. How can it be understood?

- A．先把这份感受定义清楚，再决定是否继续接触创作 / Define the feeling clearly before deciding whether to continue exploring the creative idea
- B．带着好奇，慢慢了解刚出现的感受 / Open exploration of an emerging feeling

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：带着好奇，慢慢了解刚出现的感受。可以先感受这份触动，试着了解它，不必刚有灵感就决定一辈子都要做什么。 / B is correct: Open exploration of an emerging feeling. A new feeling can be explored without an unsupported major promise.
- A 不对：这个做法没有解决眼前的情况。可以先感受这份触动，试着了解它，不必刚有灵感就决定一辈子都要做什么。 / A is incorrect: This action does not resolve the situation described. A new feeling can be explored without an unsupported major promise.

<a id="c11-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：先说一件具体感谢的事，就比要求自己说得完美更容易开口。 题目描述的是“明明有感谢，却因为害羞说不出口”，不是“没有表达就证明完全不在意”。 / A simple specific expression reduces the block; waiting for perfection maintains silence. Return to the stated context: “Shyness obstructs expression of real feeling” fits this case; “No expression proves there is no care” is unsupported by that context.

**题目 / Prompt**：想感谢合作伙伴，又不知道怎样说才好。可以先试着做什么？ / You want to thank a collaborator but do not know how to say it. What could you try first?

- A．先说一件具体感谢的小事 / Name one specific thing to be thankful for
- B．先在心里反复练习，等措辞比较成熟再开口 / Rehearse privately and speak after the wording feels more polished

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：先说一件具体感谢的小事。先说一件具体感谢的事，就比要求自己说得完美更容易开口。 / A is correct: Name one specific thing to be thankful for. A simple specific expression reduces the block; waiting for perfection maintains silence.
- B 不对：这个做法没有解决眼前的情况。先说一件具体感谢的事，就比要求自己说得完美更容易开口。 / B is incorrect: This action does not resolve the situation described. A simple specific expression reduces the block; waiting for perfection maintains silence.

<a id="c11-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：初次表达可以小而具体，不需要先把感受整理得完美。先尝试一句话、一小段创作，给新感受一个出口，再慢慢学习怎样表达得更清楚。 / An initial expression can be small and specific rather than perfect. Try a sentence or short creative piece to give a new feeling an outlet, then learn greater clarity.

**新题 / New prompt**：第一次想写一张感谢卡，却觉得不会写长文。这张牌在建议位时，怎样做更合适？ / You want to write a first thank-you card but cannot write a long letter. What fits?

- A．写下一个具体感谢的小细节。 / Write one specific detail you appreciate.
- B．先多读几篇范文，等能写得完整再开始感谢卡。 / Read more examples and begin the thank-you card after the wording feels complete.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：写下一个具体感谢的小细节。 初次写感谢卡，可以先写一件想感谢的小事。等到会写完美长文才动笔，就迟迟没有开始。 / A is correct: Write one specific detail you appreciate. A small expression fits open beginner exploration; a perfection threshold blocks the start.
- B 不对：先别按这个做法继续；初次写感谢卡，可以先写一件想感谢的小事。等到会写完美长文才动笔，就迟迟没有开始。 / B is incorrect: Do not continue with this approach yet; A small expression fits open beginner exploration; a perfection threshold blocks the start.

**依据 / Taught basis**：[本卡应用示范](#c11-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c11-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：孩子或成年人第一次尝试把心情画出来。哪句贴近？ / a child or adult first tries drawing a feeling. Which fits?

- A．成年人更适合王后或国王，侍从偏向还没成熟的孩子 / Adults fit Queens or Kings better, while Pages are mainly immature children
- B．留意到自己的感受，开始试着表达 / Begin expressing with curiosity and sensitivity

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：留意到自己的感受，开始试着表达。第一次试着画出心情，无论孩子还是成年人，都可以有这种好奇又不熟练的状态。 / B is correct: Begin expressing with curiosity and sensitivity. The Page is a beginner state in this lesson and can appear at any age.
- A 不对：这里要分清牌义的边界：第一次试着画出心情，无论孩子还是成年人，都可以有这种好奇又不熟练的状态。 / A is incorrect: The boundary of the card meaning matters here: The Page is a beginner state in this lesson and can appear at any age.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：第一次留意到新的感受或灵感，觉得新鲜，想试着表达，却还不太熟练。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Meet new feelings or inspiration with openness and a learner’s sensitivity. A small sincere expression can begin exploration without requiring a dramatic promise. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c12"></a>
### c12 · 圣杯骑士 / Knight of Cups

**目标 / Goal**：理解圣杯骑士的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c12.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups12.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c12-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 因为喜欢、向往或被打动，主动表达心意，去接近想认识的人、想做的事。 骑士端着杯子向前走，可以帮助记住主动靠近、表达心意，不只是放在心里想。
>
> Bring a feeling or ideal into an active offer, invitation, or creative proposal. Moving toward what is valued is central; the gesture alone does not prove lasting reliability.

**画面助记 / Visual memory support**：骑士持杯，马缓步前进，可记为带着情感目标主动靠近。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / The rider carries a cup while the horse advances calmly, recalling movement guided by feeling rather than merely thinking about it. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：表达心意、浪漫、追求理想。 / expressing feeling; romance; pursuing ideals. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：骑士强调主动接近，圣杯对应的水元素帮助记住感情和理想。但不能仅凭这张牌认定某个人就是恋爱对象，或一定会长期履行承诺。 / The Knight is active pursuit; water gives an emotional aim, not certainty about a romantic person or lasting commitment.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯骑士 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：骑士持杯，马缓步前进，可记为带着情感目标主动靠近。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c12-application"></a>
**先看应用示范 / Read the worked application**

> 示范：把审美想法做成具体提案。可以主动把邀请说出来，但对方愿不愿意，还要听对方的回答。
>
> Example: make an aesthetic idea into a concrete proposal. Making an invitation is one's own action; the other's response still needs checking.

<a id="c12-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：不断提出动人的合作想法，却从不兑现约定的准备工作。这里的逆位，是说得很动人，却没有照着承诺去做。
>
> Case: moving proposals are repeatedly made, but promised preparation never happens. Here the reversal concerns idealised expression disconnected from follow-through.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c12-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c12-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：骑士端着杯子向前，重点是哪种行动？ / Where is the emphasis of the rider moving with a cup here?

- A．先在心里形成理想，再等待对方给出回应机会 / Shape the ideal privately and wait for the other person to create an opening to respond
- B．主动表达自己的感受或理想 / Turn feeling or an ideal into an active expression

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：主动表达自己的感受或理想。骑士端着杯子向前走，可以帮助记住主动靠近、表达心意，不只是放在心里想。 / B is correct: Turn feeling or an ideal into an active expression. This Knight includes active approach, not feeling held entirely still.
- A 不对：这个解释没有把画面线索连起来。骑士端着杯子向前走，可以帮助记住主动靠近、表达心意，不只是放在心里想。 / A is incorrect: This reading does not connect the picture cues. This Knight includes active approach, not feeling held entirely still.

<a id="c12-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c12-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：想邀请朋友一起创作音乐。圣杯骑士在建议位，哪种做法更合适？ / You want to invite a friend to create music together. With the Knight of Cups as advice, which step fits?

- A．真诚说明想法并发出具体邀请 / Explain the idea sincerely and make a concrete invitation
- B．仅凭愿望就认定朋友已经答应 / Assume the friend has agreed because one wishes it

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：真诚说明想法并发出具体邀请。可以主动把邀请说出来，但对方愿不愿意，还要听对方的回答。 / A is correct: Explain the idea sincerely and make a concrete invitation. Making an invitation is one's own action; the other's response still needs checking.
- B 不对：可以主动把邀请说出来，但对方愿不愿意，还要听对方的回答。 / B is incorrect: Making an invitation is one's own action; the other's response still needs checking.

<a id="c12-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c12-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：动人提议反复出现却从不准备，这张逆位牌更贴近哪种情况？ / Repeated moving proposals lack preparation. What does the reversal mean here?

- A．说得动人就已证明长期可靠 / Moving words already establish lasting reliability
- B．说得很动人，却没有照着承诺去做 / Ideal expression is disconnected from action

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：说得很动人，却没有照着承诺去做。题目说他从不完成答应的准备工作。提议再动听，也不能代替把答应的事做好。 / B is correct: Ideal expression is disconnected from action. Follow-through is absent; expression cannot substitute for delivery.
- A 不对：题目说他从不完成答应的准备工作。提议再动听，也不能代替把答应的事做好。 / A is incorrect: Follow-through is absent; expression cannot substitute for delivery.

<a id="c12-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：主动邀请，说明现在愿意靠近；以后是否可靠，还要看答应的事能不能做到。 记住：主动表达自己的感受或理想，不是“只在心里想，从不接近或表达”。 / The lesson supports an active expression; reliability depends on later conduct. Compare: Turn feeling or an ideal into an active expression; this cannot be replaced by “Only think privately, never approach or express”.

**题目 / Prompt**：收到浪漫邀请，能仅凭这张牌保证长久关系吗？ / a romantic invitation arrives. Does this card alone guarantee a lasting relationship?

- A．不能，发出一次邀请，不等于以后一定会守约 / No; an invitation differs from sustained commitment
- B．能，主动邀请说明他愿意认真经营这段关系 / Yes; the active invitation shows a willingness to invest seriously in the relationship

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：不能，发出一次邀请，不等于以后一定会守约。主动邀请，说明现在愿意靠近；以后是否可靠，还要看答应的事能不能做到。 / A is correct: No; an invitation differs from sustained commitment. The lesson supports an active expression; reliability depends on later conduct.
- B 不对：这个结论比题目给出的信息多走了一步。主动邀请，说明现在愿意靠近；以后是否可靠，还要看答应的事能不能做到。 / B is incorrect: This conclusion goes beyond the information provided. The lesson supports an active expression; reliability depends on later conduct.

<a id="c12-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：缺的是按约完成准备工作，不是再换一种更动听的说法。 题目描述的是“说得很动人，却没有照着承诺去做”，不是“说得动人就已证明长期可靠”。 / The missing part is delivery, not sufficiently attractive language. Return to the stated context: “Ideal expression is disconnected from action” fits this case; “Moving words already establish lasting reliability” is unsupported by that context.

**题目 / Prompt**：合作方把计划说得很好，却已两次没交答应的材料。下一步怎样安排更合适？ / A partner describes an appealing plan but has twice failed to provide promised materials. What arrangement would help next?

- A．先重写更有吸引力的合作愿景，重新激发对方动力 / Rewrite the partnership vision in a more appealing way to renew the partner's motivation
- B．约定先完成哪一项准备，再看是否按约做到了 / Set a clear small deliverable and observe follow-through

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：约定先完成哪一项准备，再看是否按约做到了。缺的是按约完成准备工作，不是再换一种更动听的说法。 / B is correct: Set a clear small deliverable and observe follow-through. The missing part is delivery, not sufficiently attractive language.
- A 不对：这样做会漏掉题目里的关键一步。缺的是按约完成准备工作，不是再换一种更动听的说法。 / A is incorrect: This action skips a key step in the question. The missing part is delivery, not sufficiently attractive language.

<a id="c12-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：邀请是把自己的心意送出去，让对方有机会回应。说明想做什么、为什么在意，并询问对方意愿，比替对方宣布同意更符合主动表达。 / An invitation carries your feeling outward and lets the other person respond. Explain the idea and why it matters, then ask about willingness rather than declaring agreement for them.

**新题 / New prompt**：想邀请另一社团合办音乐会，对方还没有答复。这张牌在建议位时，怎样做更合适？ / You invite another club to hold a concert together and have no reply yet. What fits?

- A．因为自己的邀请很热情，就公布对方已加入。 / Announce their participation because your invitation was enthusiastic.
- B．真诚介绍想办怎样的音乐会，再问对方愿不愿意一起商量。 / Explain the shared vision sincerely and ask whether they wish to discuss it.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：真诚介绍想办怎样的音乐会，再问对方愿不愿意一起商量。 自己介绍得真诚、热情，也还要听对方愿不愿意加入，不能替对方答应。 / B is correct: Explain the shared vision sincerely and ask whether they wish to discuss it. Enthusiasm is your action; participation still requires the other's response.
- A 不对：自己介绍得真诚、热情，也还要听对方愿不愿意加入，不能替对方答应。 / A is incorrect: “Announce their participation because your invitation was enthusiastic.” does not address the specific conditions. Enthusiasm is your action; participation still requires the other's response.

**依据 / Taught basis**：[本卡应用示范](#c12-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c12-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：为喜欢的社区设计活动，主动递交一份提案。哪句贴近？ / affection for a community leads to submitting an event proposal. Which fits?

- A．因为喜欢或认同，主动表达想法、争取参与 / Feeling and ideals drive a concrete approach and offer
- B．社区活动提案更偏工作安排，与这张牌的情感动力关系不大 / A community event proposal is mainly a work arrangement and has little connection to this card's emotional motivation

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：因为喜欢或认同，主动表达想法、争取参与。主动表达也可用于创作和关怀，不限爱情。 / A is correct: Feeling and ideals drive a concrete approach and offer. Active expression can concern creativity and care, not romance alone.
- B 不对：这个解释把牌义带到了别处。主动表达也可用于创作和关怀，不限爱情。 / B is incorrect: This interpretation shifts the card meaning elsewhere. Active expression can concern creativity and care, not romance alone.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：因为喜欢、向往或被打动，主动表达心意，去接近想认识的人、想做的事。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Bring a feeling or ideal into an active offer, invitation, or creative proposal. Moving toward what is valued is central; the gesture alone does not prove lasting reliability. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c13"></a>
### c13 · 圣杯王后 / Queen of Cups

**目标 / Goal**：理解圣杯王后的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c13.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups13.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c13-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 细心留意自己和别人的感受，愿意倾听，也懂得关心、体谅。 要理解别人，先听对方怎么说，再确认自己有没有听懂，不能凭感觉认定自己全知道。
>
> Attend closely to feeling and respond with empathy and care. Understanding another’s experience requires listening rather than assuming access to their private thoughts.

**画面助记 / Visual memory support**：王后专注看着有盖的杯，靠近水面，帮助记住内在感受。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / The seated figure studies an ornate covered cup near water, helping recall sustained attention to inner experience. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：理解感受、倾听、关心、不过度承担。 / empathy; listening; care; boundaries. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：王后在这里强调细心体会感受，圣杯对应的水元素帮助记住关心和理解。理解别人不等于读心，也不需要替别人承担所有事情。 / The Queen here sustains and responds to feeling; water relates to empathy, not mind-reading or carrying everyone’s responsibilities.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯王后 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：王后专注看着有盖的杯，靠近水面，帮助记住内在感受。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c13-application"></a>
**先看应用示范 / Read the worked application**

> 示范：先听懂难过的原因，再问需要什么帮助。先听、再问，才知道对方真正需要什么。没听完就说“我全明白”，可能把自己的想法当成了对方的感受。
>
> Example: understand the sadness and ask what help is wanted. Checking helps the response fit; defining feelings for someone bypasses listening.

<a id="c13-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：倾听朋友后把对方所有困难都当成自己的责任，长期忽略自己的休息。这里的逆位，是太受朋友的情绪影响，把对方的责任也都揽到自己身上。
>
> Case: after listening to a friend, every difficulty becomes one’s own responsibility and rest is neglected. Here the reversal concerns overinvolvement and unclear boundaries.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c13-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c13-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：圣杯王后所说的体谅别人，哪种做法更贴近？ / How is empathy understood?

- A．认真倾听、体会感受再回应 / Listen carefully, understand feeling, then respond
- B．根据自己的类似经历推测对方现在需要什么 / Use a similar personal experience to infer what the other person needs now

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：认真倾听、体会感受再回应。要理解别人，先听对方怎么说，再确认自己有没有听懂，不能凭感觉认定自己全知道。 / A is correct: Listen carefully, understand feeling, then respond. Empathy depends on listening and understanding, not direct access to another mind.
- B 不对：这个解释没有把画面线索连起来。要理解别人，先听对方怎么说，再确认自己有没有听懂，不能凭感觉认定自己全知道。 / B is incorrect: This reading does not connect the picture cues. Empathy depends on listening and understanding, not direct access to another mind.

<a id="c13-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c13-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：朋友正在为一件事烦恼。圣杯王后在建议位，怎样回应更合适？ / A friend is troubled by something. With the Queen of Cups as advice, which response fits?

- A．先分享自己的类似经历，让朋友知道你理解他 / Share a similar personal experience first so the friend knows you understand
- B．先倾听并确认对方需要的支持 / Listen and check what support is needed

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先倾听并确认对方需要的支持。先听、再问，才知道对方真正需要什么。没听完就说“我全明白”，可能把自己的想法当成了对方的感受。 / B is correct: Listen and check what support is needed. Checking helps the response fit; defining feelings for someone bypasses listening.
- A 不对：请回到画面里的具体细节：先听、再问，才知道对方真正需要什么。没听完就说“我全明白”，可能把自己的想法当成了对方的感受。 / A is incorrect: Return to the specific details in the picture: Checking helps the response fit; defining feelings for someone bypasses listening.

<a id="c13-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c13-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：朋友的所有困难都变成自己的责任，这张逆位牌更贴近哪种情况？ / A friend's every difficulty becomes one’s own responsibility. What is this reversal?

- A．太受对方情绪影响，分不清哪些事该由谁负责 / Emotional involvement blurs boundaries
- B．多承担朋友的事情，可以减轻他的情绪压力 / Taking on more of the friend's responsibilities can reduce their emotional strain

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：太受对方情绪影响，分不清哪些事该由谁负责。替朋友做更多事，不等于更懂朋友。题目里已经连自己的休息都顾不上了。 / A is correct: Emotional involvement blurs boundaries. Extent of responsibility differs from depth of understanding; personal needs are being neglected.
- B 不对：先核对眼前例子的条件：替朋友做更多事，不等于更懂朋友。题目里已经连自己的休息都顾不上了。 / B is incorrect: Check the conditions in this example first: Extent of responsibility differs from depth of understanding; personal needs are being neglected.

<a id="c13-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：对方已经说明是累了，就应当按这个信息重新理解，不能坚持自己猜的“他在生气”。 记住：认真倾听、体会感受再回应，不是“不用询问就能确定对方全部想法”。 / Listening allows a guess to change; sensitivity is not certainty. Compare: Listen carefully, understand feeling, then respond; this cannot be replaced by “Know all another person's thoughts without asking”.

**题目 / Prompt**：对方说沉默是疲惫，你原先猜是生气。共情应该怎样做？ / silence is explained as fatigue rather than your guess of anger. What does empathy require?

- A．保留原先判断，同时从他的疲惫里寻找生气的迹象 / Keep the original interpretation while looking for signs of anger within the reported fatigue
- B．以对方说明为依据，继续倾听 / Use their explanation and keep listening

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：以对方说明为依据，继续倾听。对方已经说明是累了，就应当按这个信息重新理解，不能坚持自己猜的“他在生气”。 / B is correct: Use their explanation and keep listening. Listening allows a guess to change; sensitivity is not certainty.
- A 不对：这个做法没有解决眼前的情况。对方已经说明是累了，就应当按这个信息重新理解，不能坚持自己猜的“他在生气”。 / A is incorrect: This action does not resolve the situation described. Listening allows a guess to change; sensitivity is not certainty.

<a id="c13-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：可以关心朋友，也可以保留自己的休息时间。不必把自己累坏，才能证明在乎对方。 题目描述的是“太受对方情绪影响，分不清哪些事该由谁负责”，不是“承担越多就一定越懂对方”。 / Care can have boundaries; empathy need not be proven by self-neglect. Return to the stated context: “Emotional involvement blurs boundaries” fits this case; “Taking on more always means understanding better” is unsupported by that context.

**题目 / Prompt**：为了陪伴朋友，总是取消自己的休息。怎样做才能关心对方，也顾到自己？ / You repeatedly cancel your rest to support a friend. How can you care for them while also caring for yourself?

- A．说清自己能帮到哪一步，也留出休息时间 / Agree on support one can offer and keep recovery time
- B．先把朋友的需要安排好，自己的休息之后再补回来 / Arrange the friend's needs first and recover the missed rest afterward

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：说清自己能帮到哪一步，也留出休息时间。可以关心朋友，也可以保留自己的休息时间。不必把自己累坏，才能证明在乎对方。 / A is correct: Agree on support one can offer and keep recovery time. Care can have boundaries; empathy need not be proven by self-neglect.
- B 不对：这样做会漏掉题目里的关键一步。可以关心朋友，也可以保留自己的休息时间。不必把自己累坏，才能证明在乎对方。 / B is incorrect: This action skips a key step in the question. Care can have boundaries; empathy need not be proven by self-neglect.

<a id="c13-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：倾听时先让对方说明感受，再确认自己理解得是否准确。共情不是把自己的经历直接套到对方身上，也不是在对方开口前替他决定需要什么。 / Let someone explain their feelings and check your understanding. Empathy does not overwrite their experience with yours or decide their needs before they speak.

**新题 / New prompt**：朋友说工作压力大，但尚未说明最困难的部分。这张牌在建议位时，怎样做更合适？ / A friend mentions work pressure but has not described the hardest part. What fits?

- A．先听他说明，再确认希望得到哪种支持。 / Listen first, then check what support is wanted.
- B．直接按自己的经历认定原因和解决办法。 / Assume the cause and solution from your own past experience.

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：先听他说明，再确认希望得到哪种支持。 朋友还没说清最难的是什么，就要先听完。自己经历过类似的事，也不能直接认定他遇到的完全一样。 / A is correct: Listen first, then check what support is wanted. When the issue is unclear, listening and checking are needed; a similar experience is not the person's current information.
- B 不对：朋友还没说清最难的是什么，就要先听完。自己经历过类似的事，也不能直接认定他遇到的完全一样。 / B is incorrect: “Assume the cause and solution from your own past experience.” does not address the specific conditions. When the issue is unclear, listening and checking are needed; a similar experience is not the person's current information.

**依据 / Taught basis**：[本卡应用示范](#c13-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c13-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：同事受挫，先倾听其感受，再确认是否需要协助。哪句贴近？ / a colleague is heard and asked whether help is wanted. Which fits?

- A．自己感觉准确就无须确认 / A strong intuition removes the need to check
- B．先听懂对方，再提供自己能做到的帮助 / Respond with bounded care after attentive listening

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先听懂对方，再提供自己能做到的帮助。先听同事说，再问他是否需要帮助，就不容易把自己的猜测当成他的想法。 / B is correct: Respond with bounded care after attentive listening. The lesson connects care with checking, not treating a feeling as fact.
- A 不对：先听同事说，再问他是否需要帮助，就不容易把自己的猜测当成他的想法。 / A is incorrect: The lesson connects care with checking, not treating a feeling as fact.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：细心留意自己和别人的感受，愿意倾听，也懂得关心、体谅。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Attend closely to feeling and respond with empathy and care. Understanding another’s experience requires listening rather than assuming access to their private thoughts. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.


<a id="card-c14"></a>
### c14 · 圣杯国王 / King of Cups

**目标 / Goal**：理解圣杯国王的完整意思，并在已讲解的问题中使用；后续再学本节限定背景的逆位。 / Understand the card as a whole and use it in a taught situation; study the specified reversal later.

**前置与边界 / Prerequisites and limits**：已听过圣杯／权杖与元素的入门讲解即可；尚未学过时先展开本节“结构辅助”。首次学习只到 Q2，不要求认识其他牌、背诵词表或预言具体日期。Q3 与 R2 在 [中级逆位课](#lesson-i04) 后进入。 / The introductory suit-and-element explanation is sufficient; open the structural aid below if unfamiliar. First learning ends after Q2. No knowledge of other cards, exact word-list recall, or date prediction is required. Q3 and R2 follow the intermediate reversal lesson.

**材料与依据**：[本地历史牌图](../assets/cards/c14.webp)；[该图来源页](https://commons.wikimedia.org/wiki/File:Cups14.jpg)。牌义参照 S01 的单牌目录与 Word 本卡六字段；以下生活案例、题目、补讲均为原创，逆位取向是有背景的编辑性教学选择，不冒充唯一标准或直接引文。共用 [来源说明](#sources)。

<a id="c14-meaning"></a>
**先讲主要含义 / Teach the core meaning**

> 即使心里有难过、生气等情绪，也能稳住自己，想清楚再回应。 水面仍有波动，国王却坐得平稳。可以这样记：有情绪，也能冷静处理，不是完全没有情绪。
>
> Make room for complex emotions while keeping judgement and response steady. Maturity includes feeling and understanding emotions, not eliminating them.

**画面助记 / Visual memory support**：国王拿着杯子端坐，周围的水面仍有波动。用这个画面记住：即使有情绪，也能稳住自己。 这些画面细节用来帮助记住牌义，不能证明现实中一定会发生什么。 / A seated figure holds a cup amid moving water, helping recall steadiness within an emotionally changing setting. This is a visual association for learning, not proof of an external event.

**辅助词 / Organising words**：情绪稳定、包容、调解。 / emotional steadiness; tolerance; mediation. 先理解整句话，再用这些词帮助回忆。记得意思即可，不用一字不差地背下来。 / Understand the whole explanation first; these labels organise recall, allow equivalent wording, and are not scored verbatim.

**结构辅助 / Structural aid**：圣杯对应水元素，和感受有关；国王强调能稳妥处理这些感受。这不等于冷漠，也不限定性别或职位。 / The King manages the emotional theme of water; steadiness is not coldness, a gender, or an authority title.

**动画分镜**：点击“看画面线索 / Show visual cue”后，保留整张 圣杯国王 的位置、大小与名字，从未标注画面过渡到一个淡色边框，依次指出：国王拿着杯子端坐，周围的水面仍有波动。用这个画面记住：即使有情绪，也能稳住自己。过渡 450 ms；解释文字为上方“画面助记”的完整中英内容，始终保留。用户点击“继续 / Continue”才离开；“重看 / Replay”回到未标注图；暂停冻结当前帧；跳过与减少动态模式显示原图加同样的静态指示和说明。只移动高亮，不动画改画人物或物件。参照 [动效约定](#motion-contract)。

<a id="c14-application"></a>
**先看应用示范 / Read the worked application**

> 示范：先听清大家为什么不满，再商量怎样分工。先听清大家为什么不满，再商量分工。只禁止谈感受，看起来安静了，问题却还在。
>
> Example: hear emotions on each side, then decide roles clearly. A mature response addresses feeling and the issue rather than manufacturing calm through denial.

<a id="c14-reversal"></a>
**后续深化：先教本例逆位 / Later extension: teach this reversal first**

> 案例：表面总说没事，却拒绝承认愤怒，最后在讨论中突然失控。这里的逆位，是一直压着情绪不说，后来忍不住发火。
>
> Case: anger is denied behind repeated claims that everything is fine, then erupts in discussion. Here the reversal concerns imbalance through suppression.

这里是根据这个例子的情况来理解逆位，换一个问题或背景，解读也可能不同。 / Do not generalise this contextual direction into the only meaning of every reversal.

<a id="c14-q1"></a>
**Q1 · 理解主要含义 / Understand the core meaning**

讲解依据：[主要含义](#c14-meaning)。 / Taught basis: core meaning.

**题目 / Prompt**：水面有波动，国王却坐得平稳，可以帮助记住什么？ / What does the seated figure amid moving water teach here?

- A．把情绪压下来，保持外表平静地处理事情 / Push the emotion down and handle the situation with a calm outward manner
- B．有情绪，也能想清楚、稳妥地处理事情 / Allow emotion while keeping judgement and response steady

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：有情绪，也能想清楚、稳妥地处理事情。水面仍有波动，国王却坐得平稳。可以这样记：有情绪，也能冷静处理，不是完全没有情绪。 / B is correct: Allow emotion while keeping judgement and response steady. The moving water remains; steadiness concerns response, not the absence of emotion.
- A 不对：这个解释把牌义带到了别处。水面仍有波动，国王却坐得平稳。可以这样记：有情绪，也能冷静处理，不是完全没有情绪。 / A is incorrect: This interpretation shifts the card meaning elsewhere. The moving water remains; steadiness concerns response, not the absence of emotion.

<a id="c14-q2"></a>
**Q2 · 把含义用进问题 / Apply the meaning**

讲解依据：[应用示范](#c14-application)，先读示范再作答。 / Taught basis: read the worked application before answering.

**题目 / Prompt**：团队因为分工发生争执。圣杯国王在建议位，怎样处理更合适？ / A team is arguing about how work is divided. With the King of Cups as advice, which response fits?

- A．先听清大家为什么不满，再冷静商量分歧 / Acknowledge feelings and handle the practical disagreement steadily
- B．先由负责人定好分工，大家接受安排后情绪会慢慢缓和 / Have the organiser set the roles first and expect the feelings to settle after the group accepts them

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：先听清大家为什么不满，再冷静商量分歧。先听清大家为什么不满，再商量分工。只禁止谈感受，看起来安静了，问题却还在。 / A is correct: Acknowledge feelings and handle the practical disagreement steadily. A mature response addresses feeling and the issue rather than manufacturing calm through denial.
- B 不对：请回到画面里的具体细节：先听清大家为什么不满，再商量分工。只禁止谈感受，看起来安静了，问题却还在。 / B is incorrect: Return to the specific details in the picture: A mature response addresses feeling and the issue rather than manufacturing calm through denial.

<a id="c14-q3"></a>
**Q3 · 有背景的逆位 / A contextual reversal**

讲解依据：[本例逆位](#c14-reversal)；不凭倒放自行猜测。 / Taught basis: the specified reversed case; do not guess from rotation alone.

**题目 / Prompt**：长期否认愤怒后突然爆发，这张逆位牌更贴近哪种情况？ / Denied anger eventually erupts. What is this reversal?

- A．平时保持沉默，有助于把愤怒慢慢消化掉 / Keeping quiet in daily life helps the anger settle gradually
- B．一直压着情绪不说，后来忍不住发火 / Suppression destabilises the response

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：一直压着情绪不说，后来忍不住发火。一直不说，不代表怒气已经处理好了。后来忍不住发火，正说明之前的问题还在。 / B is correct: Suppression destabilises the response. Not expressing is not the same as understanding and regulating; the eruption shows the stated imbalance.
- A 不对：这个结论比题目给出的信息多走了一步。一直不说，不代表怒气已经处理好了。后来忍不住发火，正说明之前的问题还在。 / A is incorrect: This conclusion goes beyond the information provided. Not expressing is not the same as understanding and regulating; the eruption shows the stated imbalance.

<a id="c14-r1"></a>
**R1 · 补学：澄清核心误解 / Support: clarify the core misconception**

**替代补讲 / Alternative explanation**：难过不代表不能冷静商量事情。要看怎样处理，而不是要求自己一点情绪都没有。 记住：有情绪，也能想清楚、稳妥地处理事情，不是“成熟意味着没有任何情绪”。 / The lesson distinguishes having emotion from being entirely governed by it. Compare: Allow emotion while keeping judgement and response steady; this cannot be replaced by “Maturity means having no emotion at all”.

**题目 / Prompt**：承认自己难过，但仍能清楚商量下一步。算稳定吗？ / sadness is acknowledged while next steps are discussed clearly. Can this be steady?

- A．可以，有难过，也能冷静地回应 / Yes; a steady response can include emotion
- B．不算稳定，应该先把难过平复后再讨论下一步 / This is not yet steady; the sadness should settle before the next step is discussed

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：可以，有难过，也能冷静地回应。难过不代表不能冷静商量事情。要看怎样处理，而不是要求自己一点情绪都没有。 / A is correct: Yes; a steady response can include emotion. The lesson distinguishes having emotion from being entirely governed by it.
- B 不对：这样做会漏掉题目里的关键一步。难过不代表不能冷静商量事情。要看怎样处理，而不是要求自己一点情绪都没有。 / B is incorrect: This action skips a key step in the question. The lesson distinguishes having emotion from being entirely governed by it.

<a id="c14-r2"></a>
**R2 · 补学：澄清本例逆位 / Support: clarify this reversal**

**替代补讲 / Alternative explanation**：先承认自己在生气，才有机会好好表达。一直说“没事”，不代表情绪已经处理好了。 题目描述的是“一直压着情绪不说，后来忍不住发火”，不是“只要平时不说就证明情绪已处理”。 / Acknowledgement begins processing; protecting an image perpetuates suppression. Return to the stated context: “Suppression destabilises the response” fits this case; “Usual silence proves the emotion was resolved” is unsupported by that context.

**题目 / Prompt**：每次都说没事，过后却忍不住向伙伴发火。先做什么更合适？ / You repeatedly say you are fine, then lose your temper with your partner. What can you do first?

- A．继续否认情绪以维持成熟形象 / Keep denying feelings to preserve an image of maturity
- B．先承认自己在生气，再想怎样好好说出来 / Acknowledge the actual feeling and choose a steady expression

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先承认自己在生气，再想怎样好好说出来。先承认自己在生气，才有机会好好表达。一直说“没事”，不代表情绪已经处理好了。 / B is correct: Acknowledge the actual feeling and choose a steady expression. Acknowledgement begins processing; protecting an image perpetuates suppression.
- A 不对：先承认自己在生气，才有机会好好表达。一直说“没事”，不代表情绪已经处理好了。 / A is incorrect: Acknowledgement begins processing; protecting an image perpetuates suppression.

<a id="c14-ra"></a>
**RA · 应用专属补学 / Application-specific support**

**触发 / Trigger**：仅处理 Q2 的实际应用误解，先展示替代讲解，再作新题；不转入 R1 的分类／保证边界题。 / Use only for Q2's application error. Show the alternative explanation before the new question; do not substitute R1's different core-meaning check.

**替代补讲 / Alternative explanation**：先听大家为什么不满，再商量具体怎么办。让人说出感受，不等于谁最激动就听谁的，事情仍要按清楚的规则处理。 / A steady response acknowledges feelings and then addresses the disagreement. Allowing feelings does not make them the sole basis for decisions; clear standards and empathy can coexist.

**新题 / New prompt**：活动成员因分工不满而激动，负责人需要继续安排任务。怎样应用？ / Members are upset about roles, and the organiser needs to assign work. What fits?

- A．先把任务重新分配好，情绪问题等活动结束再谈。 / Reassign the tasks first and discuss the emotional concerns after the event.
- B．先听清不满，再按明确条件协商分工。 / Hear the concerns, then agree on roles using clear conditions.

**答案与逐项反馈 / Answer and option feedback**：

- B 正确：先听清不满，再按明确条件协商分工。 先听清不满，再协商分工，才能处理真正的问题。只叫大家别激动，分工上的分歧仍然没有解决。 / B is correct: Hear the concerns, then agree on roles using clear conditions. The lesson combines emotional understanding and practical judgement; banning emotion does not resolve the dispute.
- A 不对：先别按这个做法继续；先听清不满，再协商分工，才能处理真正的问题。只叫大家别激动，分工上的分歧仍然没有解决。 / A is incorrect: Do not continue with this approach yet; The lesson combines emotional understanding and practical judgement; banning emotion does not resolve the dispute.

**依据 / Taught basis**：[本卡应用示范](#c14-application)及 RA 替代讲解。 / The card's worked application and the RA explanation above.

<a id="c14-v1"></a>
**V1 · 稍后迁移验证 / Later transfer check**

用于稍后无提示迁移，不在刚看完答案后连续重问。 / Use for a later unprompted transfer check, not immediately after showing the answer.

**题目 / Prompt**：活动取消让负责人失望，但他听取成员意见后安排替代方案。哪句贴近？ / a disappointed organiser listens and arranges an alternative after cancellation. Which fits?

- A．理解情绪同时作成熟决定 / Understand emotion while making a mature decision
- B．有失望就不可能作稳妥决定 / Disappointment makes a sound decision impossible

**答案与逐项反馈 / Answer and option feedback**：

- A 正确：理解情绪同时作成熟决定。负责人可以为取消活动失望，也可以听完意见后安排新方案。难过不代表无法作决定。 / A is correct: Understand emotion while making a mature decision. Feeling and judgement can coexist; the focus is response rather than eliminating disappointment.
- B 不对：负责人可以为取消活动失望，也可以听完意见后安排新方案。难过不代表无法作决定。 / B is incorrect: Feeling and judgement can coexist; the focus is response rather than eliminating disappointment.

**继续、补学与完成 / Continue, support, and finish**：首次走“讲解 → Q1 → 已完成的应用示范 → Q2 → 总结”，正确后不追加相同题；Q1 错误或提示后完成，展示 R1 的补讲与新题。Q2 错误先回看应用示范，再进入 RA 的应用专属补讲与新题；不调用 R1 去处理另一种误解。RA 已用过则不重复计作独立掌握，转总结并把 V1 留待回访。后续 Q3 错误只进入 R2，不用无关正位题替代逆位补学。若 R1/RA/R2 仍困难，展示以下总结并结束本轮；最多两轮支持，不能机械用满额度。 / First learning follows explanation → Q1 → worked application → Q2 → summary. A correct answer does not trigger an identical extra item. After Q1 error or prompted completion, use R1's explanation and new item. For Q2 errors, revisit the worked example and use RA's application-specific explanation and new question; do not substitute R1's different misconception. If RA was already used, do not count repetition as independent evidence—summarise and reserve V1 for later. A later Q3 error routes only to R2, not an unrelated upright item. If R1/RA/R2 remains difficult, summarise and end this round. Two support cycles are a maximum, not a quota. Use the [adaptive contract](#adaptive-contract).

**结束时展示 / Closing copy**：记住这张牌的主要意思：即使心里有难过、生气等情绪，也能稳住自己，想清楚再回应。 记住意思就好，不必逐字背诵。 / The main meaning covered is: Make room for complex emotions while keeping judgement and response steady. Maturity includes feeling and understanding emotions, not eliminating them. You can express it in your own words; verbatim labels are not required.

**回访判据与恢复 / Return criterion and resume**：V1 检查是否能把完整主题迁移到另一背景；正确仅增加本次证据，不宣称永久掌握。错误回到本卡主要含义与相关示范。暂停时恢复到当前卡、当前步骤和已显示的反馈，不重置到固定第一张；提示作答与独立作答分开记录，不出现自评。按钮共用 [文案](#ui-copy)。 / V1 checks transfer of the complete theme to another context. Success adds evidence, not proof of permanent mastery. An error returns to this card's core teaching and relevant example. Resume the same card, step, and visible feedback after a pause; never reset to a fixed first card. Keep prompted and independent answers distinct without asking for self-ratings. Use the common interface copy.






<a id="card-s01"></a>
### s01 · 宝剑王牌 · Ace of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s01.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords01.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑王牌的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Ace of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑王牌强调新的理解：先弄清事实和词语的意思，再作判断。它可以是找到问题关键的起点，不表示事情已经做完。

**EN**: The Ace of Swords concerns new clarity: distinguish facts and concepts to reach a clear judgment. It can mark an intellectual breakthrough, not completed execution.

**中**：云中伸出的手举着一把直立的剑，剑尖穿过王冠。可以用这把直立的剑，记住把思路理清、抓住重点；画面不证明某个结论必然正确。

**EN**: A hand emerges from a cloud holding an upright sword through a crown. Its clear, focused outline supports remembering concentrated thought; it does not prove a conclusion true.

**中**：宝剑对应风元素，常和思考、判断、表达有关；王牌表示新的起点。这张牌可以记成：想清楚、看清事实、找到突破口。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air directs attention to thought and communication; an Ace suggests a beginning. Clarity, distinguishing facts, and breakthrough organize the meaning without requiring verbatim recall.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：直立宝剑与王冠 / the upright sword and crown。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：云中伸出的手举着一把直立的剑，剑尖穿过王冠。可以用这把直立的剑，记住把思路理清、抓住重点；画面不证明某个结论必然正确。 / A hand emerges from a cloud holding an upright sword through a crown. Its clear, focused outline supports remembering concentrated thought; it does not prove a conclusion true.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s01-Q1 · 核心理解

**中**：宝剑王牌说的“想清楚”，首先指什么？

**EN**: What does clarity mean here?

- A. 先弄清事实和词语的意思，再作判断。 / Distinguish facts and concepts before judging.
- B. 既然想通了，工作就已经完成。 / Once understood, the work is already complete.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。弄懂要做什么，还不等于已经做完；这里先练习把问题想清楚。 / Correct. Understanding and completed execution are different.
- 选择 B 的反馈：这题不对。本题应选：先弄清事实和词语的意思，再作判断。 弄懂要做什么，还不等于已经做完；这里先练习把问题想清楚。 / Not quite. The supported answer is: Distinguish facts and concepts before judging. Understanding and completed execution are different.


#### T2 · 先看一个有背景的应用示范

**中**：两位同学争论“作业是否完成”，却分别指初稿和终稿。建议位先让他们统一“完成”的定义，再检查实际进度。这是让判断有明确依据。

**EN**: Two students argue over whether work is finished, but one means a draft and the other a final version. In advice, first agree on the definition, then check progress: make the judgment well grounded.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s01-Q2 · 应用理解

**中**：回到刚才的作业例子，两位同学应该先做什么？

**EN**: In the assignment example, what comes first?

- A. 先判断哪位同学看起来进度更快，再决定要不要讨论标准。 / First judge who seems further along, then decide whether the standard needs discussion.
- B. 先说清“完成”指写好初稿，还是交出终稿。 / Agree whether finished means draft or final.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。两人说的“完成”不是一回事：一个指初稿，一个指终稿。先说清这一点，才能继续讨论。 / Correct. Different definitions caused the dispute; clarify them first.
- 选择 A 的反馈：这题不对。先别按这个做法继续；两人说的“完成”不是一回事：一个指初稿，一个指终稿。先说清这一点，才能继续讨论。 / Not quite. Do not continue with this approach yet; Different definitions caused the dispute; clarify them first.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：团队把未经核实的传言当成事实，作出了错误判断。这个例子里，宝剑王牌逆位提醒我们：思路出了问题，要先查来源、弄清事实。它也不表示传言一定是假的。

**EN**: Here, a team treats an unverified rumor as fact and becomes confused. Reversed, the card can indicate muddled judgment: verify and clarify first, rather than declare the rumor false.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s01-Q3 · 有背景的逆位

**中**：团队把传言当事实，本例逆位提醒什么？

**EN**: The team treats rumor as fact. What does this reversal suggest?

- A. 先查传言的来源，再重新判断。 / Check sources and reconsider the judgment.
- B. 把传言当成误会，先安抚团队再说。 / Treat the rumor as a misunderstanding and calm the team before checking it.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。还没核实传言，就既不能认定它是真的，也不能认定它是假的。 / Correct. Confusion calls for verification, not another unsupported conclusion.
- 选择 B 的反馈：这题不对。这个解释把牌义带到了别处。还没核实传言，就既不能认定它是真的，也不能认定它是假的。 / Not quite. This interpretation shifts the card meaning elsewhere. Confusion calls for verification, not another unsupported conclusion.


#### s01-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：弄懂要做什么，还不等于已经做完；这里先练习把问题想清楚。

**EN**: Understanding and completed execution are different.

**中**：把答题纸写满不表示读懂了题目。先弄清题目要求，才抓住了这张牌强调的重点。

**EN**: The card concerns grasping the issue, not the appearance of completion.


#### s01-R1-CHECK · 换个例子确认

**中**：“弄清题目”和“完成作业”，哪一个更贴近宝剑王牌的意思？

**EN**: Which more directly illustrates this theme?

- A. 无需理解，只把答题纸填满。 / Fill the page without understanding.
- B. 弄清题目到底要求什么。 / Clarify what the question asks.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。把答题纸写满不表示读懂了题目。先弄清题目要求，才抓住了这张牌强调的重点。 / Correct. The card concerns grasping the issue, not the appearance of completion.
- 选择 A 的反馈：这题不对。本题应选：弄清题目到底要求什么。 把答题纸写满不表示读懂了题目。先弄清题目要求，才抓住了这张牌强调的重点。 / Not quite. The supported answer is: Clarify what the question asks. The card concerns grasping the issue, not the appearance of completion.


#### s01-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：两人说的“完成”不是一回事：一个指初稿，一个指终稿。先说清这一点，才能继续讨论。

**EN**: Different definitions caused the dispute; clarify them first.

**中**：两人对“快”的理解不同。先约定到底是一小时还是一天，才知道怎样配合。

**EN**: A clear standard resolves the conceptual disagreement.


#### s01-R2-CHECK · 换个例子确认

**中**：项目争论“响应快”，一方指一小时一方指一天。先做什么？

**EN**: A project disputes fast response: one person means an hour, another a day. First?

- A. 说清双方要求多久回复，并写下来。 / Define a shared response-time standard.
- B. 继续重复“我们都要更快”。 / Keep repeating that everyone should be faster.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。两人对“快”的理解不同。先约定到底是一小时还是一天，才知道怎样配合。 / Correct. A clear standard resolves the conceptual disagreement.
- 选择 B 的反馈：这题不对。本题应选：说清双方要求多久回复，并写下来。 两人对“快”的理解不同。先约定到底是一小时还是一天，才知道怎样配合。 / Not quite. The supported answer is: Define a shared response-time standard. A clear standard resolves the conceptual disagreement.


#### s01-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：团队把未经核实的传言当成事实，作出了错误判断。这个例子里，宝剑王牌逆位提醒我们：思路出了问题，要先查来源、弄清事实。它也不表示传言一定是假的。

**EN**: Here, a team treats an unverified rumor as fact and becomes confused. Reversed, the card can indicate muddled judgment: verify and clarify first, rather than declare the rumor false.

**中**：把话说得很肯定，并不会让传言更可靠；仍然要查来源。

**EN**: Clarity needs verification, not confident tone.


#### s01-R3-CHECK · 逆位纠错后续题

**中**：现在有两种相反的传言，还没核实。按照宝剑王牌逆位的提醒，先做什么？

**EN**: Before verification, two claims conflict. After this reversal lesson, what next?

- A. 分别查两种说法的来源，再作判断。 / Seek checkable evidence before concluding.
- B. 随便选一种坚定说出来，就算澄清。 / State one confidently and call it clarity.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。把话说得很肯定，并不会让传言更可靠；仍然要查来源。 / Correct. Clarity needs verification, not confident tone.
- 选择 B 的反馈：这题不对。本题应选：分别查两种说法的来源，再作判断。 把话说得很肯定，并不会让传言更可靠；仍然要查来源。 / Not quite. The supported answer is: Seek checkable evidence before concluding. Clarity needs verification, not confident tone.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s01-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s01-V1-CHECK · 新背景迁移

**中**：两份说明书用了不同的术语，借助宝剑王牌的提醒，先做什么？

**EN**: Two manuals use different terminology. Apply this theme.

- A. 看哪份更长，就认定哪份正确。 / Assume the longer manual is right.
- B. 先弄清两份说明书里的术语各指什么，再比较内容。 / Map the terms before comparing the content.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。先弄清两份说明书的术语各指什么，才能比较内容；写得长不代表写得对。 / Correct. Clarity comes from meaning, not length.
- 选择 A 的反馈：这题不对。本题应选：先弄清两份说明书里的术语各指什么，再比较内容。 先弄清两份说明书的术语各指什么，才能比较内容；写得长不代表写得对。 / Not quite. The supported answer is: Map the terms before comparing the content. Clarity comes from meaning, not length.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑王牌强调新的理解：先弄清事实和词语的意思，再作判断。它可以是找到问题关键的起点，不表示事情已经做完。

**EN**: The Ace of Swords concerns new clarity: distinguish facts and concepts to reach a clear judgment. It can mark an intellectual breakthrough, not completed execution.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s02"></a>
### s02 · 宝剑二 · Two of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s02.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords02.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑二的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Two of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑二呈现暂时把决定搁置，迟迟不肯作选择的状态。回避信息或不愿承认感受会让僵持延续；它不表示两个选项本来就一样好。

**EN**: The Two of Swords depicts a balance held at the cost of a stalled decision. Avoiding information or feelings can sustain the stalemate; it does not mean both options are equally good.

**中**：蒙眼的人交叉持剑，坐在水边。蒙眼和交叉持剑的姿态，帮助记住不愿面对信息、暂时保护自己的状态；我们不能从姿态读出具体选择内容。

**EN**: A blindfolded figure crosses two swords beside water. The blindfold and guarded posture support remembering closure and defense, not the exact options being considered.

**中**：宝剑对应风元素，常和思考、判断、表达有关。数字二让我们留意两边的关系；在这张牌里，两边难以取舍，形成了僵持。可以记成：难以决定、回避选择。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air concerns judgment; two draws attention to tension between alternatives, but not every Two means stalemate. Helpers: stalemate, avoiding a decision.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：蒙眼布与交叉双剑 / the blindfold and crossed swords。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：蒙眼的人交叉持剑，坐在水边。蒙眼和交叉持剑的姿态，帮助记住不愿面对信息、暂时保护自己的状态；我们不能从姿态读出具体选择内容。 / A blindfolded figure crosses two swords beside water. The blindfold and guarded posture support remembering closure and defense, not the exact options being considered.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s02-Q1 · 核心理解

**中**：宝剑二所说的“迟迟不决定”，是怎样的情况？

**EN**: What kind of pause is shown here?

- A. 已经充分比较，确定两个选项一样好。 / A full comparison proved the options identical.
- B. 不愿看需要了解的信息，迟迟作不了决定。 / Information is blocked and a decision stalls.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。不去了解选项，只是暂时避开决定；这不表示已经比较过，也不表示两边一样好。 / Correct. Defensive balance differs from an informed conclusion.
- 选择 A 的反馈：这题不对。本题应选：不愿看需要了解的信息，迟迟作不了决定。 不去了解选项，只是暂时避开决定；这不表示已经比较过，也不表示两边一样好。 / Not quite. The supported answer is: Information is blocked and a decision stalls. Defensive balance differs from an informed conclusion.


#### T2 · 先看一个有背景的应用示范

**中**：小周在两门课之间犹豫，却一直不看课程要求。建议位可以先核对时间与先修条件，了解作决定前必须知道的事情，而不是继续把选择搁置。

**EN**: Zhou cannot choose between two classes but avoids reading their requirements. Advice is to check schedules and prerequisites so the decision gains necessary information.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s02-Q2 · 应用理解

**中**：小周没读课程要求，先做什么？

**EN**: Zhou has not read the class requirements. First?

- A. 查看时间和先修条件。 / Check schedules and prerequisites.
- B. 不看要求，继续保持两边都不选。 / Avoid requirements and keep neither choice.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。小周还不知道上课时间和先修要求。先查清这些条件，才知道哪门课适合自己。 / Correct. The missing information is known; obtain it to move forward.
- 选择 B 的反馈：这题不对。本题应选：查看时间和先修条件。 小周还不知道上课时间和先修要求。先查清这些条件，才知道哪门课适合自己。 / Not quite. The supported answer is: Check schedules and prerequisites. The missing information is known; obtain it to move forward.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：报名快截止了，小周又收到两门课的新要求，已经不能继续拖着不选。这个例子里，宝剑二逆位表示原来回避的选择必须面对了；信息增加，也带来了压力。但选哪门课，仍要看具体条件。

**EN**: With the deadline near and new requirements arriving, not deciding is no longer sustainable. This reversal means the stalemate is breaking under information pressure, not that one option is guaranteed right.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s02-Q3 · 有背景的逆位

**中**：报名快截止了，又收到新的课程要求，这个逆位例子在说什么？

**EN**: Deadline and new information arrive. What does this reversal describe?

- A. 先选听起来更轻松的课程，再慢慢了解新要求。 / Choose the course that sounds easier, then look into the new requirement later.
- B. 已经不能继续拖着不选了。 / The old stalemate cannot be maintained.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。小周不能再靠拖延避开选择了，但还得比较两门课，牌不会替他决定。 / Correct. The context supports pressure breaking balance, not a guaranteed outcome.
- 选择 A 的反馈：这题不对。这个说法混淆了题目正在考的含义。小周不能再靠拖延避开选择了，但还得比较两门课，牌不会替他决定。 / Not quite. This statement confuses the meaning being tested. The context supports pressure breaking balance, not a guaranteed outcome.


#### s02-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：不去了解选项，只是暂时避开决定；这不表示已经比较过，也不表示两边一样好。

**EN**: Defensive balance differs from an informed conclusion.

**中**：不去看课程要求，仍然会有时间和难度的差别，只是小周还不知道。

**EN**: Avoidance stalls a decision; it cannot remove real differences.


#### s02-R1-CHECK · 换个例子确认

**中**：“暂时不看”为什么不等于“已经想清楚”？

**EN**: Why is refusing to look different from reaching clarity?

- A. 因为还没了解作决定需要的信息。 / Needed information has not entered the judgment.
- B. 暂时避开资料，让情绪平静后就算有了答案。 / Step away from the information and treat a calmer mood as the answer.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。不去看课程要求，仍然会有时间和难度的差别，只是小周还不知道。 / Correct. Avoidance stalls a decision; it cannot remove real differences.
- 选择 B 的反馈：这题不对。这个解释把牌义带到了别处。不去看课程要求，仍然会有时间和难度的差别，只是小周还不知道。 / Not quite. This interpretation shifts the card meaning elsewhere. Avoidance stalls a decision; it cannot remove real differences.


#### s02-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：小周还不知道上课时间和先修要求。先查清这些条件，才知道哪门课适合自己。

**EN**: The missing information is known; obtain it to move forward.

**中**：看过排班，才能知道哪份兼职与自己的时间冲突；一直收着不看，就仍然无从选择。

**EN**: Facts help resolve stalemate better than maintaining appearances.


#### s02-R2-CHECK · 换个例子确认

**中**：两份兼职邀请都没读排班，怎样推进？

**EN**: Two job offers remain unread. How can the decision move?

- A. 先凭公司名气挑一份，再看排班能否配合。 / Pick one by company reputation, then see whether its schedule fits.
- B. 先核对排班与自己的可用时间。 / Compare schedules with actual availability.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。看过排班，才能知道哪份兼职与自己的时间冲突；一直收着不看，就仍然无从选择。 / Correct. Facts help resolve stalemate better than maintaining appearances.
- 选择 A 的反馈：这题不对。这个做法没有解决眼前的情况。看过排班，才能知道哪份兼职与自己的时间冲突；一直收着不看，就仍然无从选择。 / Not quite. This action does not resolve the situation described. Facts help resolve stalemate better than maintaining appearances.


#### s02-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：报名快截止了，小周又收到两门课的新要求，已经不能继续拖着不选。这个例子里，宝剑二逆位表示原来回避的选择必须面对了；信息增加，也带来了压力。但选哪门课，仍要看具体条件。

**EN**: With the deadline near and new requirements arriving, not deciding is no longer sustainable. This reversal means the stalemate is breaking under information pressure, not that one option is guaranteed right.

**中**：截止日期逼近，只说明必须面对选择了；选哪一项仍要看具体条件。

**EN**: Pressure breaks stalemate without replacing comparison.


#### s02-R3-CHECK · 逆位纠错后续题

**中**：原来回避的决定已不能拖，下一步是什么？

**EN**: An avoided decision can no longer wait. What next?

- A. 沿用原先偏好的课程，暂时不把新要求放进比较。 / Keep the course already preferred and leave the new requirement out of the comparison.
- B. 根据新要求重新比较两门课，再作决定。 / Include new information and face the decision.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。截止日期逼近，只说明必须面对选择了；选哪一项仍要看具体条件。 / Correct. Pressure breaks stalemate without replacing comparison.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。截止日期逼近，只说明必须面对选择了；选哪一项仍要看具体条件。 / Not quite. This action skips a key step in the question. Pressure breaks stalemate without replacing comparison.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s02-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s02-V1-CHECK · 新背景迁移

**中**：决定合租前不愿谈作息，宝剑二提醒我们什么？

**EN**: Before sharing an apartment, someone avoids discussing routines. What fits?

- A. 把彼此的作息和生活习惯说清楚。 / Discuss the avoided living conditions.
- B. 不谈差异就表示没有差异。 / Unmentioned differences do not exist.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。不谈作息，彼此的作息差异也不会消失；合租前仍要说清楚。 / Correct. Undiscussed information still affects the decision.
- 选择 B 的反馈：这题不对。本题应选：把彼此的作息和生活习惯说清楚。 不谈作息，彼此的作息差异也不会消失；合租前仍要说清楚。 / Not quite. The supported answer is: Discuss the avoided living conditions. Undiscussed information still affects the decision.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑二呈现暂时把决定搁置，迟迟不肯作选择的状态。回避信息或不愿承认感受会让僵持延续；它不表示两个选项本来就一样好。

**EN**: The Two of Swords depicts a balance held at the cost of a stalled decision. Avoiding information or feelings can sustain the stalemate; it does not mean both options are equally good.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s03"></a>
### s03 · 宝剑三 · Three of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s03.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords03.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑三的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Three of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑三表达因事实、冲突或分离带来的伤痛。先承认伤在哪里，再决定怎样回应；它不自动指三角关系，也不证明第三个人存在。

**EN**: The Three of Swords expresses pain caused by a fact, conflict, or separation. Acknowledge the hurt before responding; it does not automatically indicate a love triangle or a third person.

**中**：三把剑穿过心，背景有雨云。这是伤痛的象征画面，不是对现实伤害方式的记录。

**EN**: Three swords pierce a heart against rain clouds. This is symbolic imagery of pain, not a record of a real injury.

**中**：宝剑对应风元素，常和思考、判断、表达有关。听到事实或某句话，也可能让人难过。这里的三把剑不能直接换算成三个人。可以记成：伤痛、分离、面对事实。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air reminds us that facts and words can cause emotional pain; three swords do not count people. Helpers: hurt, separation, facing facts.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：心与穿过它的三剑 / the heart and three swords。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：三把剑穿过心，背景有雨云。这是伤痛的象征画面，不是对现实伤害方式的记录。 / Three swords pierce a heart against rain clouds. This is symbolic imagery of pain, not a record of a real injury.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s03-Q1 · 核心理解

**中**：宝剑三首先让我们留意什么？

**EN**: What is the central lesson?

- A. 承认事实带来的伤痛。 / Acknowledge pain caused by what happened.
- B. 从三把剑确定有三个当事人。 / Infer exactly three people from three swords.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。三把剑用来表现伤痛，不是说这件事里一定有三个人。 / Correct. Symbolic pain cannot establish a number of people.
- 选择 B 的反馈：这题不对。本题应选：承认事实带来的伤痛。 三把剑用来表现伤痛，不是说这件事里一定有三个人。 / Not quite. The supported answer is: Acknowledge pain caused by what happened. Symbolic pain cannot establish a number of people.


#### T2 · 先看一个有背景的应用示范

**中**：朋友明确拒绝合作，小安很难过。建议位先承认被拒绝的失落，弄清合作为何停止，再决定后续沟通；不用假装没有受伤。

**EN**: A friend clearly declines a collaboration and An feels hurt. Advice is to acknowledge disappointment, clarify why the collaboration stopped, and then decide how to communicate.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s03-Q2 · 应用理解

**中**：朋友拒绝合作后，应该先怎样做？

**EN**: After the friend declines collaboration, which follows the example?

- A. 因为牌有三剑，就指控有人插手。 / Accuse another person because there are three swords.
- B. 先承认失落，再澄清停止合作的原因。 / Acknowledge disappointment and clarify the reason.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。已知事实是合作被拒，不是第三人介入。 / Correct. The known fact is rejection, not third-party involvement.
- 选择 A 的反馈：这题不对。本题应选：先承认失落，再澄清停止合作的原因。 已知事实是合作被拒，不是第三人介入。 / Not quite. The supported answer is: Acknowledge disappointment and clarify the reason. The known fact is rejection, not third-party involvement.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小安已经愿意谈这次受伤的经历，也开始重新安排生活。这个例子里，宝剑三逆位表示痛苦正在慢慢减轻、生活开始恢复，不表示那次拒绝没有发生过。

**EN**: An has begun talking about the hurt and rebuilding daily life. Here the reversal represents gradual release and repair, not denial that the rejection happened.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s03-Q3 · 有背景的逆位

**中**：已经开始谈伤痛并恢复生活，逆位怎样表达？

**EN**: Speaking about hurt and rebuilding life: interpret this reversal.

- A. 开始承认这次伤痛，慢慢恢复生活。 / Gradual repair after acknowledging the pain.
- B. 既然愿意谈，就把伤痛视为已经处理好了。 / Treat the hurt as resolved once someone is willing to talk about it.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。慢慢好起来，不等于当初没有受伤；恢复是在承认这段经历之后发生的。 / Correct. Recovery follows experience; it does not erase it.
- 选择 B 的反馈：这题不对。这个做法没有解决眼前的情况。慢慢好起来，不等于当初没有受伤；恢复是在承认这段经历之后发生的。 / Not quite. This action does not resolve the situation described. Recovery follows experience; it does not erase it.


#### s03-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：三把剑用来表现伤痛，不是说这件事里一定有三个人。

**EN**: Symbolic pain cannot establish a number of people.

**中**：难过是真实的，但“有人背叛了我”仍是需要证据的判断。

**EN**: A real feeling does not verify every guessed cause.


#### s03-R1-CHECK · 换个例子确认

**中**：“感到受伤”和“确定有人背叛”，哪一个是宝剑三能够表达的？

**EN**: Which is supported by this lesson?

- A. 痛苦很强烈时，可以把背叛当作最合理解释。 / When the pain feels intense, take betrayal as the most plausible explanation.
- B. 这张牌表达伤痛；有没有人背叛，还需要事实来判断。 / Hurt is a theme; betrayal needs separate evidence.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。难过是真实的，但“有人背叛了我”仍是需要证据的判断。 / Correct. A real feeling does not verify every guessed cause.
- 选择 A 的反馈：这题不对。这个说法混淆了题目正在考的含义。难过是真实的，但“有人背叛了我”仍是需要证据的判断。 / Not quite. This statement confuses the meaning being tested. A real feeling does not verify every guessed cause.


#### s03-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：已知事实是合作被拒，不是第三人介入。

**EN**: The known fact is rejection, not third-party involvement.

**中**：承认落选后的失落，才能接着处理这件事；要求自己立刻开心，并没有处理难过的原因。

**EN**: Facing hurt fits the theme better than denying it.


#### s03-R2-CHECK · 换个例子确认

**中**：选拔落选后很失落，先怎样处理？

**EN**: After missing a selection, what fits?

- A. 承认失落，了解反馈再决定下一步。 / Acknowledge disappointment and seek feedback.
- B. 先否认难过，要求自己马上开心。 / Deny sadness and demand instant happiness.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。承认落选后的失落，才能接着处理这件事；要求自己立刻开心，并没有处理难过的原因。 / Correct. Facing hurt fits the theme better than denying it.
- 选择 B 的反馈：这题不对。本题应选：承认失落，了解反馈再决定下一步。 承认落选后的失落，才能接着处理这件事；要求自己立刻开心，并没有处理难过的原因。 / Not quite. The supported answer is: Acknowledge disappointment and seek feedback. Facing hurt fits the theme better than denying it.


#### s03-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小安已经愿意谈这次受伤的经历，也开始重新安排生活。这个例子里，宝剑三逆位表示痛苦正在慢慢减轻、生活开始恢复，不表示那次拒绝没有发生过。

**EN**: An has begun talking about the hurt and rebuilding daily life. Here the reversal represents gradual release and repair, not denial that the rejection happened.

**中**：恢复需要时间，偶尔难过并不表示前面的恢复都白费了。

**EN**: Repair is a process, not denial.


#### s03-R3-CHECK · 逆位纠错后续题

**中**：开始恢复时偶尔仍难过，会否定本例逆位吗？

**EN**: Does occasional sadness negate recovery here?

- A. 不会，慢慢恢复不表示痛苦要一下全部消失。 / No; gradual repair need not erase pain instantly.
- B. 会，情绪又低落说明恢复方向可能选错了。 / Yes. Feeling low again suggests that the recovery approach may be wrong.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。恢复需要时间，偶尔难过并不表示前面的恢复都白费了。 / Correct. Repair is a process, not denial.
- 选择 B 的反馈：这题不对。偶尔难过不等于之前的支持都失效；恢复本来就需要时间，可以继续照顾仍会反复的情绪。 / Not quite. Occasional sadness does not erase earlier support; recovery takes time, and recurring feelings can still be cared for.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s03-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s03-V1-CHECK · 新背景迁移

**中**：一次坦白让关系受伤，哪句话更贴近宝剑三的意思？

**EN**: An honest conversation hurts a relationship. Which fits?

- A. 先判断这段关系值不值得修复，再谈自己的痛苦。 / Judge whether the relationship deserves repair before addressing the pain.
- B. 先处理听到事实后的痛苦。 / Address the pain of hearing the facts.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。这张牌让我们注意当下的伤痛，不能由此断定关系永远无法修复。 / Correct. The meaning describes hurt without fixing the permanent outcome.
- 选择 A 的反馈：这题不对。这里要分清牌义的边界：这张牌让我们注意当下的伤痛，不能由此断定关系永远无法修复。 / Not quite. The boundary of the card meaning matters here: The meaning describes hurt without fixing the permanent outcome.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑三表达因事实、冲突或分离带来的伤痛。先承认伤在哪里，再决定怎样回应；它不自动指三角关系，也不证明第三个人存在。

**EN**: The Three of Swords expresses pain caused by a fact, conflict, or separation. Acknowledge the hurt before responding; it does not automatically indicate a love triangle or a third person.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s04"></a>
### s04 · 宝剑四 · Four of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s04.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords04.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑四的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Four of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑四强调暂时离开一直让自己疲惫的事情，好好休息，理清思路，再考虑下一步。休整是阶段性的，不等于失败或永远放弃。

**EN**: The Four of Swords concerns stepping back from ongoing strain to regain capacity before deciding what comes next. Rest is temporary, not failure or permanent surrender.

**中**：室内横卧的人像与静止的剑形成安静场景。用静止的画面记住暂时休息，不把墓像解释成现实死亡。

**EN**: A reclining effigy and motionless swords create a quiet interior. Remember restoration through stillness without predicting literal death.

**中**：宝剑对应风元素，常和思考、判断、表达有关。数字四可以帮助记住稳定与安静；这张牌的安静画面，进一步提醒我们让思绪休息。可以记成：休息、暂停、恢复。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air relates to thought; four can suggest a stable space. Restoration belongs to this card, not every Four. Helpers: rest, pause, recovery.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：横卧人像与静止的剑 / the reclining effigy and still swords。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：室内横卧的人像与静止的剑形成安静场景。用静止的画面记住暂时休息，不把墓像解释成现实死亡。 / A reclining effigy and motionless swords create a quiet interior. Remember restoration through stillness without predicting literal death.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s04-Q1 · 核心理解

**中**：宝剑四所说的暂停，是为了什么？

**EN**: What is the pause for?

- A. 把决定往后放，等外部问题自己缓下来。 / Put the decision off and wait for the outside problem to ease on its own.
- B. 恢复状态，再考虑下一步。 / Regain capacity before the next step.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。暂停是为了恢复后再继续，不是宣布从此不做了。 / Correct. Temporary recovery differs from permanent withdrawal.
- 选择 A 的反馈：这题不对。这个说法混淆了题目正在考的含义。暂停是为了恢复后再继续，不是宣布从此不做了。 / Not quite. This statement confuses the meaning being tested. Temporary recovery differs from permanent withdrawal.


#### T2 · 先看一个有背景的应用示范

**中**：连日赶作业使小许难以集中。建议位先安排一段真正不处理作业的休息，再回到计划；不是把休息换成继续刷工作消息。

**EN**: After days of assignments, Xu cannot concentrate. Advice is a genuine break from the work, then a return to planning—not replacing work with work messages.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s04-Q2 · 应用理解

**中**：小许赶作业后难以集中，哪项更符合建议？

**EN**: Xu cannot focus after prolonged work. What fits?

- A. 先停下作业休息，并约好什么时候回来继续。 / Take a real break and plan a return.
- B. 停下写作业，但持续刷新任务消息。 / Stop writing but keep checking task messages.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。虽然没在写作业，但一直看任务消息，注意力仍被工作占着，还没有真正休息。 / Correct. Constant task input continues the strain.
- 选择 B 的反馈：这题不对。本题应选：先停下作业休息，并约好什么时候回来继续。 虽然没在写作业，但一直看任务消息，注意力仍被工作占着，还没有真正休息。 / Not quite. The supported answer is: Take a real break and plan a return. Constant task input continues the strain.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小许说自己在休息，却一直回复任务消息、担心漏掉工作。这个例子里，宝剑四逆位表示还没能真正休息，需要减少打扰、留出休息时间，不表示以后永远恢复不了。

**EN**: Xu calls it rest but keeps answering task messages. Here the reversal indicates interrupted restoration and the need to change conditions, not permanent inability to recover.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s04-Q3 · 有背景的逆位

**中**：休息时仍不断回任务消息，本例逆位提示什么？

**EN**: Task messages continue during rest. What does this reversal suggest?

- A. 休息被打断说明当前不适合休息，应该先把任务赶完。 / Interrupted rest means this is a poor time to rest, so finish the tasks first.
- B. 休息一直被打断，需要留出不处理任务的时间。 / Rest is interrupted; protect the break.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。这个例子只说明休息不断被打断，不能说小许以后再也恢复不了。 / Correct. The background supports insufficient rest, not permanence.
- 选择 A 的反馈：这题不对。这个说法混淆了题目正在考的含义。这个例子只说明休息不断被打断，不能说小许以后再也恢复不了。 / Not quite. This statement confuses the meaning being tested. The background supports insufficient rest, not permanence.


#### s04-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：暂停是为了恢复后再继续，不是宣布从此不做了。

**EN**: Temporary recovery differs from permanent withdrawal.

**中**：想继续做好一件事，也可以先停下来休息；不停工作不一定做得更好。

**EN**: Continued commitment does not require eliminating rest.


#### s04-R1-CHECK · 换个例子确认

**中**：暂停一晚再整理计划，是否等于放弃？

**EN**: Does a night off before replanning equal surrender?

- A. 不是，暂停可以帮助自己恢复状态。 / No; a pause can support recovery.
- B. 是，暂停会让别人觉得自己没有承担责任。 / Yes. A pause makes it look as though responsibility was avoided.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。想继续做好一件事，也可以先停下来休息；不停工作不一定做得更好。 / Correct. Continued commitment does not require eliminating rest.
- 选择 B 的反馈：这题不对。这个判断忽略了题目给出的条件。想继续做好一件事，也可以先停下来休息；不停工作不一定做得更好。 / Not quite. This judgment overlooks a condition given in the question. Continued commitment does not require eliminating rest.


#### s04-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：虽然没在写作业，但一直看任务消息，注意力仍被工作占着，还没有真正休息。

**EN**: Constant task input continues the strain.

**中**：想缓过来，需要暂时不处理排练的事；一直看失误录像，注意力仍在任务上。

**EN**: Restoration needs space away from task strain.


#### s04-R2-CHECK · 换个例子确认

**中**：密集排练后失误变多，按照宝剑四的提醒，先做什么？

**EN**: Errors rise after intensive rehearsal. Apply the theme.

- A. 继续按原强度排练，用更多次数把失误压下去。 / Keep rehearsing at the same intensity and use more repetitions to push through the mistakes.
- B. 先安静休息，再看接下来的排练怎么安排。 / Rest quietly, then reassess the schedule.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。想缓过来，需要暂时不处理排练的事；一直看失误录像，注意力仍在任务上。 / Correct. Restoration needs space away from task strain.
- 选择 A 的反馈：这题不对。这个做法没有解决眼前的情况。想缓过来，需要暂时不处理排练的事；一直看失误录像，注意力仍在任务上。 / Not quite. This action does not resolve the situation described. Restoration needs space away from task strain.


#### s04-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小许说自己在休息，却一直回复任务消息、担心漏掉工作。这个例子里，宝剑四逆位表示还没能真正休息，需要减少打扰、留出休息时间，不表示以后永远恢复不了。

**EN**: Xu calls it rest but keeps answering task messages. Here the reversal indicates interrupted restoration and the need to change conditions, not permanent inability to recover.

**中**：关掉消息只是减少打扰，还要真正休息一段时间，才能看看状态有没有恢复。

**EN**: Removing interruption improves conditions; recovery still takes time.


#### s04-R3-CHECK · 逆位纠错后续题

**中**：关闭工作消息后仍需休整，下一步是什么？

**EN**: After muting work messages, rest is still needed. What next?

- A. 马上用更密集的安排补回刚才停下的进度。 / Make the schedule denser to recover the time spent resting.
- B. 真正休息一段时间，再看看自己缓过来没有。 / Allow real recovery time, then reassess.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。关掉消息只是减少打扰，还要真正休息一段时间，才能看看状态有没有恢复。 / Correct. Removing interruption improves conditions; recovery still takes time.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。关掉消息只是减少打扰，还要真正休息一段时间，才能看看状态有没有恢复。 / Not quite. This action skips a key step in the question. Removing interruption improves conditions; recovery still takes time.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s04-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s04-V1-CHECK · 新背景迁移

**中**：争论后思路混乱，哪种做法符合宝剑四的提醒？

**EN**: Thinking is muddled after an argument. Which fits?

- A. 约好稍后再谈，先让自己安静下来。 / Agree to talk later and settle first.
- B. 趁情绪还在，把争论一次谈到底。 / Use the remaining emotion to push the argument through to a conclusion.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。约好稍后再谈，是先让自己平静下来，并没有放弃之后的沟通。 / Correct. The pause supports recovery rather than canceling communication.
- 选择 B 的反馈：这题不对。这个做法没有解决眼前的情况。约好稍后再谈，是先让自己平静下来，并没有放弃之后的沟通。 / Not quite. This action does not resolve the situation described. The pause supports recovery rather than canceling communication.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑四强调暂时离开一直让自己疲惫的事情，好好休息，理清思路，再考虑下一步。休整是阶段性的，不等于失败或永远放弃。

**EN**: The Four of Swords concerns stepping back from ongoing strain to regain capacity before deciding what comes next. Rest is temporary, not failure or permanent surrender.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s05"></a>
### s05 · 宝剑五 · Five of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s05.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords05.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑五的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Five of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑五关注冲突中的胜负与代价：赢下一场争执，也可能让同伴不再愿意合作。它提醒检查赢的方式，而不是给某人贴坏人标签。

**EN**: The Five of Swords concerns winning and its cost: an argument may be won while cooperation is damaged. Examine the manner of winning rather than labeling someone bad.

**中**：一人收拢剑，另两人离去，胜者与离开者同时出现在画面。记住“赢了什么，又失去了什么”。

**EN**: One figure gathers swords while two leave. Remember both what was won and what was lost.

**中**：宝剑对应风元素，常和思考、判断、表达有关；数字五可以帮助记住冲突和变化。结合有人收剑、有人离开的画面，可以记成：争输赢、赢了也有损失。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air concerns arguments and judgment; five suggests disturbance without proving malice. Helpers: competing to win, costly victory.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：收剑者与远离的两人 / the sword collector and departing figures。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：一人收拢剑，另两人离去，胜者与离开者同时出现在画面。记住“赢了什么，又失去了什么”。 / One figure gathers swords while two leave. Remember both what was won and what was lost.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s05-Q1 · 核心理解

**中**：宝剑五为什么提醒我们看“赢的代价”？

**EN**: Why examine the cost of winning?

- A. 争赢了，却可能让大家原本想一起做的事更难完成。 / A win may damage the shared goal.
- B. 争论中占上风，说明这次做法更有效。 / Having the upper hand in the argument shows that this approach works better.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。不能只看争论赢没赢，还要看这样赢了以后，同伴是否还愿意合作。 / Correct. Winning does not replace examining consequences.
- 选择 B 的反馈：这题不对。这个说法混淆了题目正在考的含义。不能只看争论赢没赢，还要看这样赢了以后，同伴是否还愿意合作。 / Not quite. This statement confuses the meaning being tested. Winning does not replace examining consequences.


#### T2 · 先看一个有背景的应用示范

**中**：会议里小陈用羞辱同伴的方式让方案通过，但同伴不愿再协作。建议位应回到共同目标、处理羞辱给合作带来的伤害，不只庆祝方案获胜。

**EN**: Chen gets a proposal accepted by humiliating teammates, who then withdraw cooperation. Advice is to repair collaboration around the shared goal, not merely celebrate approval.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s05-Q2 · 应用理解

**中**：方案通过但同伴退出合作，先处理什么？

**EN**: A proposal passes but teammates withdraw. What needs attention?

- A. 只重复方案获胜，无需关心后续。 / Repeat that the proposal won and ignore what follows.
- B. 先处理羞辱同伴造成的伤害，想想怎样恢复合作。 / Damage to cooperation caused by the tactics.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。方案虽然通过了，同伴却不愿继续合作。这里要处理的正是这种代价。 / Correct. The example includes both the win and the damage.
- 选择 A 的反馈：这题不对。本题应选：先处理羞辱同伴造成的伤害，想想怎样恢复合作。 方案虽然通过了，同伴却不愿继续合作。这里要处理的正是这种代价。 / Not quite. The supported answer is: Damage to cooperation caused by the tactics. The example includes both the win and the damage.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：同一团队决定停止互相指责，愿意商量怎样修复合作。这个例子里，宝剑五逆位表示开始愿意和解；接下来还要处理分歧和伤害，不表示冲突已经全部消失。

**EN**: The team stops blaming and agrees to discuss repair. Here reversal points toward reconciliation, while actual repair is still needed.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s05-Q3 · 有背景的逆位

**中**：团队愿意停止指责，本例逆位怎么读？

**EN**: The team agrees to stop blaming. Interpret the reversal.

- A. 愿意和解了，还需要实际行动来修复关系。 / Willingness to reconcile appears; repair remains.
- B. 停止指责就说明关系已经修复，不必再谈影响。 / Once the blame stops, treat the relationship as repaired and leave its effects undiscussed.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。愿意和解只是第一步。彼此的意见和受到的伤害，仍需要好好处理。 / Correct. Willingness is a starting point, not completed repair.
- 选择 B 的反馈：这题不对。这样做会漏掉题目里的关键一步。愿意和解只是第一步。彼此的意见和受到的伤害，仍需要好好处理。 / Not quite. This action skips a key step in the question. Willingness is a starting point, not completed repair.


#### s05-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：不能只看争论赢没赢，还要看这样赢了以后，同伴是否还愿意合作。

**EN**: Winning does not replace examining consequences.

**中**：最后一句话被你说了，不表示你就是对的，也不表示合作没有受影响。

**EN**: Speaking order proves neither accuracy nor cooperation.


#### s05-R1-CHECK · 换个例子确认

**中**：争到最后一句话，却失去了伙伴，重点是什么？

**EN**: Having the last word costs a partner. What matters here?

- A. 最后发言就足以证明判断正确。 / Speaking last proves the judgment right.
- B. 看看为了争赢，失去了什么。 / Examine the cost of insisting on a win.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。最后一句话被你说了，不表示你就是对的，也不表示合作没有受影响。 / Correct. Speaking order proves neither accuracy nor cooperation.
- 选择 A 的反馈：这题不对。本题应选：看看为了争赢，失去了什么。 最后一句话被你说了，不表示你就是对的，也不表示合作没有受影响。 / Not quite. The supported answer is: Examine the cost of insisting on a win. Speaking order proves neither accuracy nor cooperation.


#### s05-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：方案虽然通过了，同伴却不愿继续合作。这里要处理的正是这种代价。

**EN**: The example includes both the win and the damage.

**中**：还想一起玩，就要处理嘲讽造成的伤害；赢过多少场，都不能让这些伤害消失。

**EN**: Shared goals require cooperation; wins do not erase costs.


#### s05-R2-CHECK · 换个例子确认

**中**：游戏队友因嘲讽而离队，按照宝剑五的提醒，应该怎样处理？

**EN**: Teammates leave after mockery. Apply the theme.

- A. 先处理嘲讽造成的伤害，再说好以后怎样一起玩。 / Address the harm and rebuild cooperation rules.
- B. 只用赢的次数说明嘲讽没问题。 / Use victory counts to justify mockery.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。还想一起玩，就要处理嘲讽造成的伤害；赢过多少场，都不能让这些伤害消失。 / Correct. Shared goals require cooperation; wins do not erase costs.
- 选择 B 的反馈：这题不对。本题应选：先处理嘲讽造成的伤害，再说好以后怎样一起玩。 还想一起玩，就要处理嘲讽造成的伤害；赢过多少场，都不能让这些伤害消失。 / Not quite. The supported answer is: Address the harm and rebuild cooperation rules. Shared goals require cooperation; wins do not erase costs.


#### s05-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：同一团队决定停止互相指责，愿意商量怎样修复合作。这个例子里，宝剑五逆位表示开始愿意和解；接下来还要处理分歧和伤害，不表示冲突已经全部消失。

**EN**: The team stops blaming and agrees to discuss repair. Here reversal points toward reconciliation, while actual repair is still needed.

**中**：说好和解后，还要谈清哪里受了伤、接下来怎样改变，关系才有机会改善。

**EN**: Willingness does not replace actual repair.


#### s05-R3-CHECK · 逆位纠错后续题

**中**：同意和解后仍有不满，怎样继续？

**EN**: After agreeing to reconcile, resentment remains. What next?

- A. 谈清哪件事伤害了彼此，以及接下来怎样改变。 / Discuss specific harm and repair actions.
- B. 把分歧先放下，避免再提受伤的细节。 / Set the disagreement aside and avoid revisiting the details that caused hurt.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。说好和解后，还要谈清哪里受了伤、接下来怎样改变，关系才有机会改善。 / Correct. Willingness does not replace actual repair.
- 选择 B 的反馈：这题不对。这样做会漏掉题目里的关键一步。说好和解后，还要谈清哪里受了伤、接下来怎样改变，关系才有机会改善。 / Not quite. This action skips a key step in the question. Willingness does not replace actual repair.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s05-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s05-V1-CHECK · 新背景迁移

**中**：讨论预算时为了面子压过别人，建议是什么？

**EN**: Someone dominates a budget discussion to save face. What fits?

- A. 继续升级争执来保住面子。 / Escalate to protect pride.
- B. 先讨论预算要解决什么问题，别只顾争一口气。 / Return from competition to the real budget goal.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。预算讨论是为了一起把钱安排好。只顾争面子，反而可能耽误这件正事。 / Correct. This theme checks whether winning undermines the real goal.
- 选择 A 的反馈：这题不对。本题应选：先讨论预算要解决什么问题，别只顾争一口气。 预算讨论是为了一起把钱安排好。只顾争面子，反而可能耽误这件正事。 / Not quite. The supported answer is: Return from competition to the real budget goal. This theme checks whether winning undermines the real goal.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑五关注冲突中的胜负与代价：赢下一场争执，也可能让同伴不再愿意合作。它提醒检查赢的方式，而不是给某人贴坏人标签。

**EN**: The Five of Swords concerns winning and its cost: an argument may be won while cooperation is damaged. Examine the manner of winning rather than labeling someone bad.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s06"></a>
### s06 · 宝剑六 · Six of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s06.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords06.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑六的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Six of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑六描述离开较困难的处境，慢慢走向平稳；过去的经历和问题可能仍会影响自己。开始移动不等于所有问题立刻消失。

**EN**: The Six of Swords describes carrying past experience away from difficulty toward calmer conditions. Movement does not mean every problem disappears immediately.

**中**：船上有人与六把剑，船驶向对岸。船在移动，剑仍随行，帮助记住“开始往前走，过去的问题还可能跟着自己”。

**EN**: People and six swords travel in a boat toward another shore. The boat moves while the swords remain: transition carries experience with it.

**中**：宝剑对应风元素，常和思考、判断、表达有关；数字六可以帮助记住调整后慢慢缓和的状态。这张牌可以记成：慢慢过渡、逐渐缓和、离开困境。它不一定指实际旅行。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air relates to thinking and methods; six may aid remembering adjustment and relief without requiring literal travel. Helpers: transition, relief, leaving difficulty.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：船、乘客与随船的剑 / the boat, passengers, and accompanying swords。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：船上有人与六把剑，船驶向对岸。船在移动，剑仍随行，帮助记住“开始往前走，过去的问题还可能跟着自己”。 / People and six swords travel in a boat toward another shore. The boat moves while the swords remain: transition carries experience with it.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s06-Q1 · 核心理解

**中**：这张牌的过渡是否要求问题立即消失？

**EN**: Must all problems vanish in this transition?

- A. 要求，否则就不能算开始改变。 / Yes; otherwise change has not begun.
- B. 不要求，开始改变时，旧经历仍可能影响自己。 / No; past experience can travel through change.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。开始改变时，旧问题不一定马上消失；迈出第一步仍然有意义。 / Correct. Moving and fully resolving need not coincide.
- 选择 A 的反馈：这题不对。本题应选：不要求，开始改变时，旧经历仍可能影响自己。 开始改变时，旧问题不一定马上消失；迈出第一步仍然有意义。 / Not quite. The supported answer is: No; past experience can travel through change. Moving and fully resolving need not coincide.


#### T2 · 先看一个有背景的应用示范

**中**：旧复习方法让小孟疲惫，他开始转向更清楚的分段计划。建议位支持逐步换方法，并承认尚需适应，而非要求立刻毫无压力。

**EN**: Meng leaves an exhausting study method for a clearer segmented plan. Advice supports gradual transition and adjustment, not instant freedom from pressure.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s06-Q2 · 应用理解

**中**：换复习方法后仍需适应，怎样回应？

**EN**: The new study method requires adjustment. What fits?

- A. 按新计划一步步做，同时处理仍然存在的困难。 / Implement it gradually and address old difficulties.
- B. 把剩余压力当成新方法选错的信号，尽快换回旧方法。 / Read the remaining pressure as evidence that the new method was a mistake and return to the old one.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。换了复习方法，还需要一段适应时间；有压力不表示新方法一定无效。 / Correct. The example concerns transition, not instant perfection.
- 选择 B 的反馈：这题不对。先别按这个做法继续；换了复习方法，还需要一段适应时间；有压力不表示新方法一定无效。 / Not quite. Do not continue with this approach yet; The example concerns transition, not instant perfection.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小孟换了计划，却仍每天照旧熬夜，旧问题并没有解决。这个例子里，宝剑六逆位表示改变没有顺利进行，还要调整一直没改的作息；不表示他永远改不了。

**EN**: Meng changes plans but keeps the same late-night habit. The reversal describes a blocked transition requiring attention to what followed along.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s06-Q3 · 有背景的逆位

**中**：计划换了，熬夜习惯没变，本例逆位提示什么？

**EN**: The plan changes but late nights remain. What fits?

- A. 先等新计划自然带来规律，再考虑作息。 / Wait for the new plan to create a routine before changing sleep habits.
- B. 旧习惯还在影响自己，需要继续调整。 / Old problems follow; transition needs adjustment.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。计划改了，熬夜的做法却没改；要真正减轻疲惫，还得调整作息。 / Correct. Behavior must change; a new label is insufficient.
- 选择 A 的反馈：这题不对。这个解释把牌义带到了别处。计划改了，熬夜的做法却没改；要真正减轻疲惫，还得调整作息。 / Not quite. This interpretation shifts the card meaning elsewhere. Behavior must change; a new label is insufficient.


#### s06-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：开始改变时，旧问题不一定马上消失；迈出第一步仍然有意义。

**EN**: Moving and fully resolving need not coincide.

**中**：船在向前走，剑还在船上。可以用这幅画记住：改变开始了，过去的问题未必马上消失。

**EN**: The picture combines movement and carrying, not total erasure.


#### s06-R1-CHECK · 换个例子确认

**中**：船在前进但剑还在，适合记住什么？

**EN**: Boat moving, swords remaining: remember what?

- A. 开始离开困境后，过去的问题可能还在。 / Leaving difficulty can carry experience along.
- B. 进入新阶段后，重点放在前方，旧问题可以先不处理。 / Focus on what lies ahead in the new stage and leave the old problems unaddressed.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。船在向前走，剑还在船上。可以用这幅画记住：改变开始了，过去的问题未必马上消失。 / Correct. The picture combines movement and carrying, not total erasure.
- 选择 B 的反馈：这题不对。这个说法混淆了题目正在考的含义。船在向前走，剑还在船上。可以用这幅画记住：改变开始了，过去的问题未必马上消失。 / Not quite. This statement confuses the meaning being tested. The picture combines movement and carrying, not total erasure.


#### s06-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：换了复习方法，还需要一段适应时间；有压力不表示新方法一定无效。

**EN**: The example concerns transition, not instant perfection.

**中**：换流程后，旧任务仍要有人接手处理，不能假定它们已经消失了。

**EN**: Transition requires handling what remains.


#### s06-R2-CHECK · 换个例子确认

**中**：团队开始用新流程，仍有旧任务，怎样安排？

**EN**: A team adopts a new process with old tasks remaining. What fits?

- A. 假定换了流程，旧任务就不存在。 / Assume the new process makes old tasks disappear.
- B. 说清旧任务由谁接手，再一项项处理完。 / Plan handover so old tasks gradually clear.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。换流程后，旧任务仍要有人接手处理，不能假定它们已经消失了。 / Correct. Transition requires handling what remains.
- 选择 A 的反馈：这题不对。本题应选：说清旧任务由谁接手，再一项项处理完。 换流程后，旧任务仍要有人接手处理，不能假定它们已经消失了。 / Not quite. The supported answer is: Plan handover so old tasks gradually clear. Transition requires handling what remains.


#### s06-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小孟换了计划，却仍每天照旧熬夜，旧问题并没有解决。这个例子里，宝剑六逆位表示改变没有顺利进行，还要调整一直没改的作息；不表示他永远改不了。

**EN**: Meng changes plans but keeps the same late-night habit. The reversal describes a blocked transition requiring attention to what followed along.

**中**：如果仍照旧熬夜，再给计划换个名字也没有用；作息本身需要改变。

**EN**: The obstacle is behavioral; renaming does not complete transition.


#### s06-R3-CHECK · 逆位纠错后续题

**中**：新计划仍被旧作息拖住，下一步是什么？

**EN**: Old routines block the new plan. What next?

- A. 只再给计划改一个名字。 / Merely rename the plan again.
- B. 连同旧作息一起调整。 / Adjust the old routine as well.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。如果仍照旧熬夜，再给计划换个名字也没有用；作息本身需要改变。 / Correct. The obstacle is behavioral; renaming does not complete transition.
- 选择 A 的反馈：这题不对。本题应选：连同旧作息一起调整。 如果仍照旧熬夜，再给计划换个名字也没有用；作息本身需要改变。 / Not quite. The supported answer is: Adjust the old routine as well. The obstacle is behavioral; renaming does not complete transition.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s06-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s06-V1-CHECK · 新背景迁移

**中**：搬到安静学习处后仍难集中，如何理解？

**EN**: A quieter study space does not immediately restore focus. Interpret.

- A. 环境改善只是过渡的一步，仍需适应。 / Better conditions are one step; adjustment remains.
- B. 把注意力困难归因于新环境，继续换学习地点。 / Blame the concentration problem on the new setting and move to another study place.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。换个安静地方有帮助，但专注状态不一定立刻恢复，还可以给自己一点适应时间。 / Correct. This theme does not require instantaneous improvement.
- 选择 B 的反馈：这题不对。这个做法没有解决眼前的情况。换个安静地方有帮助，但专注状态不一定立刻恢复，还可以给自己一点适应时间。 / Not quite. This action does not resolve the situation described. This theme does not require instantaneous improvement.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑六描述离开较困难的处境，慢慢走向平稳；过去的经历和问题可能仍会影响自己。开始移动不等于所有问题立刻消失。

**EN**: The Six of Swords describes carrying past experience away from difficulty toward calmer conditions. Movement does not mean every problem disappears immediately.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s07"></a>
### s07 · 宝剑七 · Seven of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s07.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords07.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑七的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Seven of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑七涉及不公开行动、绕开正面冲突，或独自处理事情。这样做可能有策略上的考虑，也可能是在回避问题；要看哪些事可以自己处理、哪些事应告诉别人，不能直接指控欺骗。

**EN**: The Seven of Swords concerns indirect, private, or solitary methods. These may be strategic or evasive; examine what should be disclosed rather than accuse deception.

**中**：人物带走五把剑，回头看，另两把剑留在身后。动作帮助记住悄悄安排、没有公开说明的做法；我们不知道现实中谁做了什么。

**EN**: A figure carries five swords while looking back, leaving two. The action supports remembering covert arrangements, not identifying a real culprit.

**中**：宝剑对应风元素，常和思考、判断、表达有关。不能单凭数字七认定有人隐瞒；还要结合画面和具体情况。这张牌可以记成：想办法绕过去、隐瞒、回避。是合理安排还是隐瞒了该说的事，要看背景。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air relates to strategy; seven does not prove concealment. Helpers: strategy, indirect action, concealment, avoidance; context distinguishes them.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：回头动作、带走与留下的剑 / the backward glance, carried swords, and remaining swords。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物带走五把剑，回头看，另两把剑留在身后。动作帮助记住悄悄安排、没有公开说明的做法；我们不知道现实中谁做了什么。 / A figure carries five swords while looking back, leaving two. The action supports remembering covert arrangements, not identifying a real culprit.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s07-Q1 · 核心理解

**中**：宝剑七中的“不公开地行动”，应该怎样理解？

**EN**: How should private action be interpreted?

- A. 看具体情况，分清是在想办法，还是在躲问题。 / Use context to distinguish strategy from avoidance.
- B. 仅凭牌面认定现实中有人偷窃。 / Infer a real theft from the card alone.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。牌图可以帮助理解隐瞒或策略，却不能证明现实里某个人偷了东西。 / Correct. Imagery supplies a theme, not evidence against someone.
- 选择 B 的反馈：这题不对。本题应选：看具体情况，分清是在想办法，还是在躲问题。 牌图可以帮助理解隐瞒或策略，却不能证明现实里某个人偷了东西。 / Not quite. The supported answer is: Use context to distinguish strategy from avoidance. Imagery supplies a theme, not evidence against someone.


#### T2 · 先看一个有背景的应用示范

**中**：小林独自改合作文件，却没告诉需要配合的同伴。建议位应区分个人草稿与影响他人的决定，把会影响同伴的信息告诉他们，而非把一切保密都当聪明策略。

**EN**: Lin privately changes a shared file without telling affected teammates. Advice distinguishes private drafts from decisions others need to know and calls for necessary disclosure.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s07-Q2 · 应用理解

**中**：修改影响同伴的文件，建议是什么？

**EN**: Changes affect teammates. What is the advice?

- A. 等同伴发现改动后再解释，免得提前打断合作。 / Wait until teammates notice the change, then explain it so the work is not interrupted beforehand.
- B. 把会影响合作的改动告诉同伴。 / Share information needed for coordination.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。文件改动会影响同伴接下来的工作，就应告诉他们；不能把这种隐瞒一律说成聪明。 / Correct. Coordination requires information; appropriateness depends on effects.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。文件改动会影响同伴接下来的工作，就应告诉他们；不能把这种隐瞒一律说成聪明。 / Not quite. This action skips a key step in the question. Coordination requires information; appropriateness depends on effects.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小林主动说明先前修改了什么，也愿意和同伴一起核对。这个例子里，宝剑七逆位表示开始坦白、重新面对问题；不能据此认定他之前一定有恶意。

**EN**: Lin explains the edits and offers a joint review. Here reversal suggests disclosure and facing the issue, without proving past malice.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s07-Q3 · 有背景的逆位

**中**：主动说明修改并核对，本例逆位表达什么？

**EN**: Explaining edits and reviewing them together: what fits?

- A. 开始坦白并处理原问题。 / Disclosure and renewed engagement.
- B. 主动说明改动，重点是为自己之前的做法辩解。 / Explain the change mainly to defend what you did earlier.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。主动说明改动，是开始坦白的表现，但不能因此推断他之前一定有恶意。 / Correct. Disclosure supports that direction without proving motives.
- 选择 B 的反馈：这题不对。把说明改动变成为自己辩解，缺少坦白说明并和同伴一起核对影响的行动。 / Not quite. Defending the earlier action shifts attention away from honestly explaining the change and checking its effects together.


#### s07-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：牌图可以帮助理解隐瞒或策略，却不能证明现实里某个人偷了东西。

**EN**: Imagery supplies a theme, not evidence against someone.

**中**：自己先写一份草稿，和瞒着伙伴改共同决定，不是一回事；瞒着伙伴改共同决定会影响别人，应该沟通。

**EN**: Strategy and avoidance depend on responsibilities and consequences.


#### s07-R1-CHECK · 换个例子确认

**中**：独自做草稿和隐瞒共同决定为何不同？

**EN**: Why distinguish a private draft from a hidden shared decision?

- A. 独自行动通常会破坏信任，因此草稿也应先报备。 / Working alone tends to damage trust, so a private draft should be reported in advance.
- B. 共同决定会影响伙伴怎么做，所以改动后需要告诉他们。 / A hidden shared decision affects others and needs communication.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。自己先写一份草稿，和瞒着伙伴改共同决定，不是一回事；瞒着伙伴改共同决定会影响别人，应该沟通。 / Correct. Strategy and avoidance depend on responsibilities and consequences.
- 选择 A 的反馈：这题不对。这个结论比题目给出的信息多走了一步。自己先写一份草稿，和瞒着伙伴改共同决定，不是一回事；瞒着伙伴改共同决定会影响别人，应该沟通。 / Not quite. This conclusion goes beyond the information provided. Strategy and avoidance depend on responsibilities and consequences.


#### s07-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：文件改动会影响同伴接下来的工作，就应告诉他们；不能把这种隐瞒一律说成聪明。

**EN**: Coordination requires information; appropriateness depends on effects.

**中**：集合时间一改，参加的人都会受影响，所以要通知他们并确认收到。

**EN**: Shared arrangements require informing those involved.


#### s07-R2-CHECK · 换个例子确认

**中**：组织活动时悄悄改集合时间，应怎么做？

**EN**: An organizer quietly changes the meeting time. What fits?

- A. 通知受影响的人并确认收到。 / Notify affected people and confirm receipt.
- B. 让大家自己猜新时间，以保持灵活。 / Let everyone guess to preserve flexibility.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。集合时间一改，参加的人都会受影响，所以要通知他们并确认收到。 / Correct. Shared arrangements require informing those involved.
- 选择 B 的反馈：这题不对。本题应选：通知受影响的人并确认收到。 集合时间一改，参加的人都会受影响，所以要通知他们并确认收到。 / Not quite. The supported answer is: Notify affected people and confirm receipt. Shared arrangements require informing those involved.


#### s07-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小林主动说明先前修改了什么，也愿意和同伴一起核对。这个例子里，宝剑七逆位表示开始坦白、重新面对问题；不能据此认定他之前一定有恶意。

**EN**: Lin explains the edits and offers a joint review. Here reversal suggests disclosure and facing the issue, without proving past malice.

**中**：解释过改动之后，还应让伙伴检查、提问，并说好以后怎样通知，才算认真处理这件事。

**EN**: Facing an issue includes review, not merely declaring disclosure.


#### s07-R3-CHECK · 逆位纠错后续题

**中**：补充说明先前改动后，还要做什么？

**EN**: After explaining earlier edits, what remains?

- A. 请受影响的伙伴核对改动，并说好以后怎样通知。 / Let affected partners review and agree on future updates.
- B. 解释过原因后先观察同伴反应，不再讨论通知方式。 / After explaining the reason, watch the teammates' response and leave the notification process unchanged.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。解释过改动之后，还应让伙伴检查、提问，并说好以后怎样通知，才算认真处理这件事。 / Correct. Facing an issue includes review, not merely declaring disclosure.
- 选择 B 的反馈：这题不对。这个解释把牌义带到了别处。解释过改动之后，还应让伙伴检查、提问，并说好以后怎样通知，才算认真处理这件事。 / Not quite. This interpretation shifts the card meaning elsewhere. Facing an issue includes review, not merely declaring disclosure.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s07-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s07-V1-CHECK · 新背景迁移

**中**：为惊喜准备私人草稿，是否能直接判欺骗？

**EN**: Does a private draft for a surprise establish deception?

- A. 保密会让对方不安，所以应先按欺骗来理解。 / Secrecy can make someone uneasy, so interpret it as deception at first.
- B. 不能，要看实际背景与有没有违反双方的约定。 / No; consider context and obligations.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。为惊喜暂时保密，不一定是在伤害别人；要看具体安排和双方原有的约定。 / Correct. The lesson separates strategy from avoidance, not privacy from morality.
- 选择 A 的反馈：这题不对。这个判断忽略了题目给出的条件。为惊喜暂时保密，不一定是在伤害别人；要看具体安排和双方原有的约定。 / Not quite. This judgment overlooks a condition given in the question. The lesson separates strategy from avoidance, not privacy from morality.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑七涉及不公开行动、绕开正面冲突，或独自处理事情。这样做可能有策略上的考虑，也可能是在回避问题；要看哪些事可以自己处理、哪些事应告诉别人，不能直接指控欺骗。

**EN**: The Seven of Swords concerns indirect, private, or solitary methods. These may be strategic or evasive; examine what should be disclosed rather than accuse deception.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s08"></a>
### s08 · 宝剑八 · Eight of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s08.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords08.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑八的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Eight of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑八表现的是被困住、觉得没有办法的状态。需要分清实际遇到了什么限制，以及哪些事只是暂时没有想到办法；寻找可做的一小步，不等于说困难全是想出来的。

**EN**: The Eight of Swords depicts restriction and difficulty seeing options. Take both real constraints and helplessness seriously; finding one possible step does not make all difficulty imaginary.

**中**：蒙眼、受缚的人站在剑之间，剑阵留有间隙。绳索说明人物确实受了限制，剑之间又有空隙；两处一起看，帮助我们记住：承认困难，也继续寻找还有没有别的办法。

**EN**: A blindfolded, bound figure stands among swords with gaps. Binding and space together suggest constraints alongside options not yet seen.

**中**：宝剑对应风元素，常和思考、判断、表达有关。不能只看到数字八，就认定一个人受困；要一起看绳索、蒙眼布和剑之间的空隙。可以记成：受到限制、觉得无能为力、寻找别的办法。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air supports examining judgments and information; eight is not a universal formula for entrapment. Helpers: restriction, helplessness, unseen options.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：绑缚、蒙眼布和剑阵间隙 / bindings, blindfold, and gaps between swords。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：蒙眼、受缚的人站在剑之间，剑阵留有间隙。绳索说明人物确实受了限制，剑之间又有空隙；两处一起看，帮助我们记住：承认困难，也继续寻找还有没有别的办法。 / A blindfolded, bound figure stands among swords with gaps. Binding and space together suggest constraints alongside options not yet seen.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s08-Q1 · 核心理解

**中**：感到自己没有办法时，宝剑八提醒我们先做什么？

**EN**: When restricted, what comes first here?

- A. 先提醒自己别想太多，把困难暂时放到一边。 / Tell yourself to stop overthinking and set the difficulty aside for now.
- B. 弄清卡在哪一步，再找目前能做的事。 / Identify real blocks and remaining possible actions.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。寻找还能做什么，不等于否认困难。先弄清卡在哪里，才能找到一个可行步骤。 / Correct. Finding options does not require denying real constraints.
- 选择 A 的反馈：这题不对。先别按这个做法继续；寻找还能做什么，不等于否认困难。先弄清卡在哪里，才能找到一个可行步骤。 / Not quite. Do not continue with this approach yet; Finding options does not require denying real constraints.


#### T2 · 先看一个有背景的应用示范

**中**：小夏觉得课程太难，也不知道如何求助。建议位先列出具体卡点，找一个能询问的人；不要求一句“想开点”解决全部困难。

**EN**: Xia finds a course overwhelming and does not know how to seek help. Advice is to identify a specific block and one person to ask, rather than dismiss difficulty with think positively.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s08-Q2 · 应用理解

**中**：小夏不知道怎样求助，按照刚才的例子，哪项做法更合适？

**EN**: Xia does not know how to seek help. Which follows?

- A. 选一个具体难点向助教询问。 / Ask a tutor about one specific difficulty.
- B. 把整个课程问题一次交给助教，让对方安排学习步骤。 / Hand the whole course problem to the teaching assistant and let them arrange the study steps.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。先问清一个具体难点，就开始有了办法；不必要求自己一下解决所有问题。 / Correct. A feasible small step better fits finding options.
- 选择 B 的反馈：这题不对。先别按这个做法继续；先问清一个具体难点，就开始有了办法；不必要求自己一下解决所有问题。 / Not quite. Do not continue with this approach yet; A feasible small step better fits finding options.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小夏找到助教，发现可以分步骤补上基础。这个例子里，宝剑八逆位表示开始找到办法，不再觉得完全走不出去；但具体课程仍要一步步学。

**EN**: Xia finds a tutor and sees a stepwise way to rebuild basics. The reversal suggests emerging options, while actual work remains.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s08-Q3 · 有背景的逆位

**中**：找到分步补基础的方法，逆位如何表达？

**EN**: A stepwise support plan appears. Interpret.

- A. 既然有了补基础的方法，可以先不处理剩下的课程要求。 / Now that there is a way to rebuild the basics, leave the remaining course requirements for later.
- B. 开始发现自己还有别的办法。 / Options begin to become visible.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。找到补基础的方法，只是开始知道怎样学；具体课程仍要一步步完成。 / Correct. Seeing a way forward starts change, not task completion.
- 选择 A 的反馈：这题不对。先别按这个做法继续；找到补基础的方法，只是开始知道怎样学；具体课程仍要一步步完成。 / Not quite. Do not continue with this approach yet; Seeing a way forward starts change, not task completion.


#### s08-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：寻找还能做什么，不等于否认困难。先弄清卡在哪里，才能找到一个可行步骤。

**EN**: Finding options does not require denying real constraints.

**中**：人物仍被绑着，所以有空隙不等于没有限制。两处细节要一起看。

**EN**: The binding remains; the image does not deny difficulty.


#### s08-R1-CHECK · 换个例子确认

**中**：剑阵有空隙，是否意味着约束不存在？

**EN**: Do gaps mean there are no constraints?

- A. 不是，人物仍被绑着，但可以继续寻找有没有别的办法。 / No; consider both constraints and openings.
- B. 是，看到空隙说明限制主要来自人物的想象。 / Yes. The gap suggests that the restriction mainly exists in the figure's imagination.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。人物仍被绑着，所以有空隙不等于没有限制。两处细节要一起看。 / Correct. The binding remains; the image does not deny difficulty.
- 选择 B 的反馈：这题不对。这个解释把牌义带到了别处。人物仍被绑着，所以有空隙不等于没有限制。两处细节要一起看。 / Not quite. This interpretation shifts the card meaning elsewhere. The binding remains; the image does not deny difficulty.


#### s08-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：先问清一个具体难点，就开始有了办法；不必要求自己一下解决所有问题。

**EN**: A feasible small step better fits finding options.

**中**：说清卡在哪一步，才容易找到可以询问的人；只说“全都没办法”，就难以开始。

**EN**: A concrete issue is more workable than global helplessness.


#### s08-R2-CHECK · 换个例子确认

**中**：流程复杂又不知找谁，怎样开始？

**EN**: A process is confusing and contacts unclear. Start how?

- A. 先凭经验选一个环节尝试，等出错后再找负责人。 / Choose a step by intuition and contact the responsible person after an error occurs.
- B. 先确定卡在哪一步，查询对应负责人。 / Identify the blocked step and its contact.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。说清卡在哪一步，才容易找到可以询问的人；只说“全都没办法”，就难以开始。 / Correct. A concrete issue is more workable than global helplessness.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。说清卡在哪一步，才容易找到可以询问的人；只说“全都没办法”，就难以开始。 / Not quite. This action skips a key step in the question. A concrete issue is more workable than global helplessness.


#### s08-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小夏找到助教，发现可以分步骤补上基础。这个例子里，宝剑八逆位表示开始找到办法，不再觉得完全走不出去；但具体课程仍要一步步学。

**EN**: Xia finds a tutor and sees a stepwise way to rebuild basics. The reversal suggests emerging options, while actual work remains.

**中**：知道可以找谁帮忙之后，还要实际开口询问，事情才会往前走。

**EN**: Recovered options still need action.


#### s08-R3-CHECK · 逆位纠错后续题

**中**：知道可以找谁帮忙之后，下一步做什么？

**EN**: A help option becomes visible. How follow through?

- A. 把找到联系人当成问题已解决，先等待对方主动安排。 / Treat finding a contact as solving the problem and wait for them to arrange the next step.
- B. 先尝试一个具体求助步骤。 / Try one concrete step toward help.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。知道可以找谁帮忙之后，还要实际开口询问，事情才会往前走。 / Correct. Recovered options still need action.
- 选择 A 的反馈：这题不对。先别按这个做法继续；知道可以找谁帮忙之后，还要实际开口询问，事情才会往前走。 / Not quite. Do not continue with this approach yet; Recovered options still need action.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s08-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s08-V1-CHECK · 新背景迁移

**中**：学新软件时说“我什么都不会”，先怎样？

**EN**: Learning software, someone says I can do nothing. First?

- A. 找出一个已经会的操作，再指出一个需要求助的操作。 / Name one known action and one needing help.
- B. 先跳过不熟的功能，照着别人完成的结果模仿。 / Skip the unfamiliar feature and imitate someone else's finished result.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。先分清哪些会、哪些不会，才知道要学什么；不用否认自己遇到的困难。 / Correct. Defining the difficulty fits better than denying it.
- 选择 B 的反馈：这题不对。先别按这个做法继续；先分清哪些会、哪些不会，才知道要学什么；不用否认自己遇到的困难。 / Not quite. Do not continue with this approach yet; Defining the difficulty fits better than denying it.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑八表现的是被困住、觉得没有办法的状态。需要分清实际遇到了什么限制，以及哪些事只是暂时没有想到办法；寻找可做的一小步，不等于说困难全是想出来的。

**EN**: The Eight of Swords depicts restriction and difficulty seeing options. Take both real constraints and helplessness seriously; finding one possible step does not make all difficulty imaginary.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s09"></a>
### s09 · 宝剑九 · Nine of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s09.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords09.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑九的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Nine of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑九关注反复担忧占据思绪的状态。忧虑带来的压力真实存在，但脑中想象的最坏结果，不会因为担心就成为事实。

**EN**: The Nine of Swords concerns recurring worries occupying the mind. The distress is real; the worst imagined story is not thereby a fact.

**中**：人物在床上坐起掩面，九把剑排列在背景。姿态与夜间环境帮助记住难以停下的忧虑，不用于医学诊断。

**EN**: A figure sits up in bed covering their face, with swords behind. The nighttime setting supports remembering persistent worry, not medical diagnosis.

**中**：宝剑对应风元素，常和思考、判断、表达有关。这张牌先记画面中的担忧状态，不要把数字九当成出事的天数。可以记成：担忧、反复想同一件事、精神压力。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air concerns thought; nine is a structural aid, not a nine-day prediction. Helpers: worry, rumination, mental strain.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：床边坐起掩面的姿态 / the seated, face-covered posture in bed。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物在床上坐起掩面，九把剑排列在背景。姿态与夜间环境帮助记住难以停下的忧虑，不用于医学诊断。 / A figure sits up in bed covering their face, with swords behind. The nighttime setting supports remembering persistent worry, not medical diagnosis.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s09-Q1 · 核心理解

**中**：强烈担心是否证明最坏结果会发生？

**EN**: Does intense worry prove the worst outcome?

- A. 不能，担心不等于事情一定会那样发生。 / No; distress and external evidence differ.
- B. 可以把这种担心当作最坏结果正在靠近的信号。 / The worry can be read as a sign that the worst outcome is approaching.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。担心确实会让人难受，但不能据此判断最坏的事一定会发生。 / Correct. The lesson acknowledges worry without treating it as prophecy.
- 选择 B 的反馈：这题不对。这个判断忽略了题目给出的条件。担心确实会让人难受，但不能据此判断最坏的事一定会发生。 / Not quite. This judgment overlooks a condition given in the question. The lesson acknowledges worry without treating it as prophecy.


#### T2 · 先看一个有背景的应用示范

**中**：等面试回复时，小宁不断想“没有马上回复就是失败”。建议位先区分尚未收到消息这一事实和失败的猜测，再安排可做的准备。

**EN**: Waiting for an interview reply, Ning equates no immediate answer with failure. Advice separates the fact of no reply from the guess of failure, then returns to feasible preparation.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s09-Q2 · 应用理解

**中**：没有立即收到面试回复，小宁应该怎样理解？

**EN**: No immediate interview reply: which fits?

- A. 把沉默当成婉拒，尽快停止准备后续面试。 / Read the silence as a polite rejection and stop preparing for the next interview stage.
- B. 目前没回复，失败仍只是猜测。 / No reply is known; failure remains a guess.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。目前只知道还没收到回复；“面试失败”是小宁的猜测，还没有得到证实。 / Correct. Known fact and inference must be separated.
- 选择 A 的反馈：这题不对。这个做法没有解决眼前的情况。目前只知道还没收到回复；“面试失败”是小宁的猜测，还没有得到证实。 / Not quite. This action does not resolve the situation described. Known fact and inference must be separated.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小宁向可信的人说出担忧，开始分清哪些是事实、哪些是猜测。这个例子里，宝剑九逆位表示压力有机会慢慢减轻，不表示以后绝不会再焦虑。

**EN**: Ning shares worries with someone trusted and distinguishes fact from guess. The reversal can suggest easing pressure, not a guarantee of never worrying again.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s09-Q3 · 有背景的逆位

**中**：说出担忧并得到支持，本例逆位指什么？

**EN**: Sharing worry and receiving support: reversal?

- A. 压力可能逐渐缓和。 / Pressure may gradually ease.
- B. 得到一次支持后，今后的担心可以忽略。 / After receiving support once, future worries can be dismissed.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。说出担忧、得到支持，可能让小宁慢慢轻松一些，但不表示以后绝不会再紧张。 / Correct. The context supports gradual relief, not a permanent guarantee.
- 选择 B 的反馈：这题不对。这个说法混淆了题目正在考的含义。说出担忧、得到支持，可能让小宁慢慢轻松一些，但不表示以后绝不会再紧张。 / Not quite. This statement confuses the meaning being tested. The context supports gradual relief, not a permanent guarantee.


#### s09-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：担心确实会让人难受，但不能据此判断最坏的事一定会发生。

**EN**: The lesson acknowledges worry without treating it as prophecy.

**中**：害怕出错，说明你正在担心；要知道有没有真的出错，还得检查实际情况。

**EN**: An emotion is real without verifying an external event.


#### s09-R1-CHECK · 换个例子确认

**中**：“我很怕出错”能够直接证明什么？

**EN**: What does I fear an error directly establish?

- A. 担心很强烈，说明错误大概已经发生。 / Strong worry suggests that the feared mistake has probably happened.
- B. 现在确实很担心，需要先弄清自己在担心什么。 / Worry is present and deserves attention.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。害怕出错，说明你正在担心；要知道有没有真的出错，还得检查实际情况。 / Correct. An emotion is real without verifying an external event.
- 选择 A 的反馈：这题不对。这里要分清牌义的边界：害怕出错，说明你正在担心；要知道有没有真的出错，还得检查实际情况。 / Not quite. The boundary of the card meaning matters here: An emotion is real without verifying an external event.


#### s09-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：目前只知道还没收到回复；“面试失败”是小宁的猜测，还没有得到证实。

**EN**: Known fact and inference must be separated.

**中**：“还没回消息”是已知情况，“关系结束了”是猜测；反复想这个猜测，也不会让它成为证据。

**EN**: Separating fact prevents rumination from masquerading as evidence.


#### s09-R2-CHECK · 换个例子确认

**中**：朋友暂未回消息就猜关系结束，先怎样？

**EN**: No reply leads to imagining a friendship ending. First?

- A. 把未回复与关系结束分开判断。 / Separate no reply from an ended friendship.
- B. 不断重读猜测直到把它当事实。 / Repeat the guess until it feels factual.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。“还没回消息”是已知情况，“关系结束了”是猜测；反复想这个猜测，也不会让它成为证据。 / Correct. Separating fact prevents rumination from masquerading as evidence.
- 选择 B 的反馈：这题不对。本题应选：把未回复与关系结束分开判断。 “还没回消息”是已知情况，“关系结束了”是猜测；反复想这个猜测，也不会让它成为证据。 / Not quite. The supported answer is: Separate no reply from an ended friendship. Separating fact prevents rumination from masquerading as evidence.


#### s09-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小宁向可信的人说出担忧，开始分清哪些是事实、哪些是猜测。这个例子里，宝剑九逆位表示压力有机会慢慢减轻，不表示以后绝不会再焦虑。

**EN**: Ning shares worries with someone trusted and distinguishes fact from guess. The reversal can suggest easing pressure, not a guarantee of never worrying again.

**中**：得到支持后，担忧也可能慢慢才减轻；偶尔仍紧张，不等于之前的帮助全无用处。

**EN**: Relief need not eliminate worry permanently in one step.


#### s09-R3-CHECK · 逆位纠错后续题

**中**：说出担忧后仍有紧张，怎样理解？

**EN**: Tension remains after sharing worry. Interpret.

- A. 缓和可以逐步发生，继续区分事实和猜测。 / Relief can be gradual; keep separating fact from guess.
- B. 把偶尔仍紧张理解成之前的支持没有起作用。 / Treat occasional remaining tension as evidence that the earlier support did not help.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。得到支持后，担忧也可能慢慢才减轻；偶尔仍紧张，不等于之前的帮助全无用处。 / Correct. Relief need not eliminate worry permanently in one step.
- 选择 B 的反馈：这题不对。偶尔仍紧张，不会抹掉之前支持的作用；缓和可以逐步发生，同时继续区分事实和猜测。 / Not quite. Occasional tension does not erase earlier support; relief can be gradual while you keep separating facts from assumptions.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s09-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s09-V1-CHECK · 新背景迁移

**中**：担心报告有错，按照宝剑九的提醒，先做什么？

**EN**: Worried about a report error, how apply this?

- A. 只按担忧强度判断错误多少。 / Count errors by intensity of worry.
- B. 检查报告的数据，分清实际发现的错误和自己的猜测。 / Check data and distinguish found errors from imagined ones.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。检查报告的数据，才能知道哪里有错；担心得多，并不能说明错得多。 / Correct. Checking yields evidence; worry intensity yields no count.
- 选择 A 的反馈：这题不对。本题应选：检查报告的数据，分清实际发现的错误和自己的猜测。 检查报告的数据，才能知道哪里有错；担心得多，并不能说明错得多。 / Not quite. The supported answer is: Check data and distinguish found errors from imagined ones. Checking yields evidence; worry intensity yields no count.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑九关注反复担忧占据思绪的状态。忧虑带来的压力真实存在，但脑中想象的最坏结果，不会因为担心就成为事实。

**EN**: The Nine of Swords concerns recurring worries occupying the mind. The distress is real; the worst imagined story is not thereby a fact.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s10"></a>
### s10 · 宝剑十 · Ten of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s10.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords10.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑十的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Ten of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑十指某种做法或处境已到难以继续的终点，需要承认结束和受挫。它不是说人的所有未来都结束了。

**EN**: The Ten of Swords points to a method or situation reaching an unsustainable end. Acknowledge the ending and setback without declaring a person’s entire future over.

**中**：人物伏地、背后十剑，远方天际渐亮。这幅强烈的画面帮助我们记住“已经到极限了”；远方渐亮的天空则提醒我们，结束之后仍可能有下一步。

**EN**: A fallen figure bears ten swords as the horizon brightens. The strong image recalls a limit; the changing horizon allows a future beyond it.

**中**：宝剑对应风元素，常和思考、判断、表达有关。数字十可以帮助记住一个阶段到了终点；结合整幅画，可以记成：结束、撑到极限、接受这一阶段已结束。它不能用来预言现实中的死亡。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air concerns thought and conflict; ten can aid remembering an ending, never literal death prediction. Helpers: ending, limit, acknowledging closure.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：伏地人物与远方渐亮的天际 / the fallen figure and brightening horizon。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物伏地、背后十剑，远方天际渐亮。这幅强烈的画面帮助我们记住“已经到极限了”；远方渐亮的天空则提醒我们，结束之后仍可能有下一步。 / A fallen figure bears ten swords as the horizon brightens. The strong image recalls a limit; the changing horizon allows a future beyond it.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s10-Q1 · 核心理解

**中**：宝剑十所说的“结束”，是哪种意思？

**EN**: Which matches this ending?

- A. 把这次结束理解为个人能力已经耗尽。 / Interpret this ending as a sign that the person's capacity has run out.
- B. 某种旧处境已无法继续。 / An old situation cannot continue.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。结束的是眼前这个阶段或做法，不是说这个人以后一切都没有希望。 / Correct. The lesson concerns a specific phase, not an entire life.
- 选择 A 的反馈：这题不对。先核对眼前例子的条件：结束的是眼前这个阶段或做法，不是说这个人以后一切都没有希望。 / Not quite. Check the conditions in this example first: The lesson concerns a specific phase, not an entire life.


#### T2 · 先看一个有背景的应用示范

**中**：一个项目已取消，原定交付方式不再可行。建议位先接受旧方案结束，整理可以保留的成果，再安排下一步，而非假装项目仍按原计划运行。

**EN**: A project is canceled and the original delivery route no longer works. Advice acknowledges the end, preserves useful work, and plans next steps instead of pretending nothing changed.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s10-Q2 · 应用理解

**中**：项目已经确定取消，按照刚才的例子，应该怎样处理？

**EN**: For the canceled project, which follows?

- A. 承认旧方案结束并整理可保留成果。 / Acknowledge closure and preserve usable work.
- B. 先保留旧安排，等项目可能恢复后再整理成果。 / Keep the old arrangements in place and organize the results if the project returns.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。项目已经明确取消，就要接受旧安排结束了，再整理可以保留的成果。 / Correct. The known cancellation requires acknowledging an end.
- 选择 B 的反馈：这题不对。先别按这个做法继续；项目已经明确取消，就要接受旧安排结束了，再整理可以保留的成果。 / Not quite. Do not continue with this approach yet; The known cancellation requires acknowledging an end.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：团队接受项目已经结束，开始整理已有成果、准备新的计划。这个例子里，宝剑十逆位表示从挫折中慢慢恢复，不表示旧项目会自动重新开始。

**EN**: The team accepts closure and organizes usable work and a new plan. Here reversal means beginning recovery, not automatically reviving the old project.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s10-Q3 · 有背景的逆位

**中**：开始整理新计划，本例逆位表达什么？

**EN**: Starting a new plan: interpret this reversal.

- A. 开始计划就表示旧项目正在恢复。 / Starting to plan means that the old project is coming back.
- B. 从低点逐步恢复。 / Gradually recover from the low point.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。从受挫中恢复，可以是开始新计划，不一定是把旧项目重新办起来。 / Correct. Recovery can take a new direction.
- 选择 A 的反馈：这题不对。从低点恢复不一定要回到旧项目；接受它已经结束，再开始新计划，也是一种恢复。 / Not quite. Recovery from a low point need not restore the old project; accepting its end and beginning a new plan is also recovery.


#### s10-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：结束的是眼前这个阶段或做法，不是说这个人以后一切都没有希望。

**EN**: The lesson concerns a specific phase, not an entire life.

**中**：已知的是旧方案行不通，不能因此断定以后所有方案都行不通。

**EN**: Limit the ending to the known situation.


#### s10-R1-CHECK · 换个例子确认

**中**：旧方案走到终点，是否等于所有方案都不可能？

**EN**: Does one plan ending rule out all plans?

- A. 不是，旧方案行不通，还可以考虑新的方案。 / No; distinguish that plan from future possibilities.
- B. 是，眼前失败说明相近方案也缺少可行性。 / Yes. This failure suggests that similar plans are also unworkable.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。已知的是旧方案行不通，不能因此断定以后所有方案都行不通。 / Correct. Limit the ending to the known situation.
- 选择 B 的反馈：这题不对。这个判断忽略了题目给出的条件。已知的是旧方案行不通，不能因此断定以后所有方案都行不通。 / Not quite. This judgment overlooks a condition given in the question. Limit the ending to the known situation.


#### s10-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：项目已经明确取消，就要接受旧安排结束了，再整理可以保留的成果。

**EN**: The known cancellation requires acknowledging an end.

**中**：课程已经停办，继续等原课表不会让它恢复；可以整理已学内容，再找替代课程。

**EN**: A clearly ended arrangement calls for closure.


#### s10-R2-CHECK · 换个例子确认

**中**：停办的课程无法续报，下一步怎样？

**EN**: A discontinued class cannot be renewed. What fits?

- A. 继续等待已明确取消的原课表。 / Keep waiting for the canceled schedule.
- B. 接受这门课结束，整理所学再找替代。 / Accept closure, organize learning, and seek an alternative.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。课程已经停办，继续等原课表不会让它恢复；可以整理已学内容，再找替代课程。 / Correct. A clearly ended arrangement calls for closure.
- 选择 A 的反馈：这题不对。本题应选：接受这门课结束，整理所学再找替代。 课程已经停办，继续等原课表不会让它恢复；可以整理已学内容，再找替代课程。 / Not quite. The supported answer is: Accept closure, organize learning, and seek an alternative. A clearly ended arrangement calls for closure.


#### s10-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：团队接受项目已经结束，开始整理已有成果、准备新的计划。这个例子里，宝剑十逆位表示从挫折中慢慢恢复，不表示旧项目会自动重新开始。

**EN**: The team accepts closure and organizes usable work and a new plan. Here reversal means beginning recovery, not automatically reviving the old project.

**中**：团队开始整理成果、准备新计划，就是在恢复；不需要旧项目恢复原样才算数。

**EN**: Recovery concerns action and planning, not reviving the old form.


#### s10-R3-CHECK · 逆位纠错后续题

**中**：恢复阶段准备新方案，是否必须回到旧项目？

**EN**: Must recovery return to the old project?

- A. 把回到旧项目当成恢复的主要目标。 / Treat returning to the old project as the main goal of recovery.
- B. 不需要，可以接受旧项目结束，再开始新的计划。 / No; acknowledging closure can lead to a new direction.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。团队开始整理成果、准备新计划，就是在恢复；不需要旧项目恢复原样才算数。 / Correct. Recovery concerns action and planning, not reviving the old form.
- 选择 A 的反馈：这题不对。恢复可以从接受旧项目结束、开始新计划发生，不需要把回到原项目当成目标。 / Not quite. Recovery can come from accepting the old project’s ending and beginning a new plan; returning to the old project need not be the goal.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s10-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s10-V1-CHECK · 新背景迁移

**中**：一段无效流程已被正式废止，如何理解？

**EN**: An ineffective process is formally retired. Interpret.

- A. 承认旧流程结束，再建立新方式。 / Close the old process and build a new one.
- B. 认为一段流程废止了，整个团队以后就没有希望。 / Interpret retirement as the end of the team’s future.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。被废止的是一段流程，不是整个团队的未来；还可以建立新的做法。 / Correct. A local ending does not justify global hopelessness.
- 选择 B 的反馈：这题不对。本题应选：承认旧流程结束，再建立新方式。 被废止的是一段流程，不是整个团队的未来；还可以建立新的做法。 / Not quite. The supported answer is: Close the old process and build a new one. A local ending does not justify global hopelessness.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑十指某种做法或处境已到难以继续的终点，需要承认结束和受挫。它不是说人的所有未来都结束了。

**EN**: The Ten of Swords points to a method or situation reaching an unsustainable end. Acknowledge the ending and setback without declaring a person’s entire future over.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s11"></a>
### s11 · 宝剑侍从 · Page of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s11.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords11.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑侍从的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Page of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑侍从表现出愿意观察、提问，并练习表达的初学者状态。敏锐和好奇值得保留，但听到信息还不等于已经核实。

**EN**: The Page of Swords approaches observation, questioning, and expression as skills being learned. Curiosity is useful; receiving information is not verifying it.

**中**：人物举剑、转头观察，风吹动周围树木和云。动作帮助记住留意周围、好奇求知，不用于判定现实年龄或性别。

**EN**: The figure holds a sword and looks aside amid windblown trees and clouds. The posture aids remembering alert inquiry, not a real person’s age or gender.

**中**：宝剑对应风元素，常和思考、判断、表达有关；侍从让我们想到刚开始探索、愿意学习的状态。这张牌可以记成：好奇、留心观察、问清楚。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air supplies the domain of thought; Page suggests learning and exploration. Helpers: curiosity, alertness, specific questions.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：转头观察与持剑姿态 / the sideways gaze and sword-holding posture。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物举剑、转头观察，风吹动周围树木和云。动作帮助记住留意周围、好奇求知，不用于判定现实年龄或性别。 / The figure holds a sword and looks aside amid windblown trees and clouds. The posture aids remembering alert inquiry, not a real person’s age or gender.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s11-Q1 · 核心理解

**中**：好奇和已掌握事实有什么区别？

**EN**: How does curiosity differ from established knowledge?

- A. 感兴趣以后，还要提问、核实，才能真正弄懂。 / Curiosity needs inquiry and verification to become understanding.
- B. 兴趣足够强时，可以先按直觉下结论，再补资料。 / With strong interest, form a conclusion from intuition and gather sources afterward.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。侍从愿意问、愿意学，但还在学习中；感兴趣不表示已经知道答案。 / Correct. A Page is learning, not already complete in knowledge.
- 选择 B 的反馈：这题不对。这里要分清牌义的边界：侍从愿意问、愿意学，但还在学习中；感兴趣不表示已经知道答案。 / Not quite. The boundary of the card meaning matters here: A Page is learning, not already complete in knowledge.


#### T2 · 先看一个有背景的应用示范

**中**：小叶第一次读专业文章，看见陌生术语。建议位把“不懂”改成具体问题，核对定义和来源，再尝试复述。

**EN**: Ye encounters unfamiliar terms in a first specialist article. Advice turns confusion into specific questions, checks definitions and sources, then attempts an explanation.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s11-Q2 · 应用理解

**中**：面对陌生术语，小叶先怎样？

**EN**: Facing an unfamiliar term, Ye should first?

- A. 按字面猜完就当作可靠定义。 / Treat a literal guess as a verified definition.
- B. 先查术语的意思，再问不懂的地方。 / Check its definition and ask a specific question.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。先查术语的实际定义，再问不懂的地方；只按字面猜，可能从一开始就理解错了。 / Correct. The example requires verification rather than guessing.
- 选择 A 的反馈：这题不对。本题应选：先查术语的意思，再问不懂的地方。 先查术语的实际定义，再问不懂的地方；只按字面猜，可能从一开始就理解错了。 / Not quite. The supported answer is: Check its definition and ask a specific question. The example requires verification rather than guessing.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小叶只看标题就转发结论，没有读正文。这个例子里，宝剑侍从逆位提醒我们：还没核实就急着说了，需要回到原文检查。问题在没有核实，不在好奇心本身。

**EN**: Ye shares a conclusion after reading only a headline. Here reversal concerns unverified information and premature expression, calling for source checking rather than suppressing curiosity.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s11-Q3 · 有背景的逆位

**中**：只看标题就转发，本例逆位提示什么？

**EN**: Sharing from a headline alone: what fits?

- A. 转发前先读原文，检查说法对不对。 / Check the original before sharing.
- B. 先转发标题引发讨论，再根据反馈判断内容。 / Share the headline to start a discussion, then judge the content from the responses.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。小叶的问题是没读正文就转发，不是好奇心太多；应该补上核查。 / Correct. The problem is lack of verification, not curiosity.
- 选择 B 的反馈：这题不对。这个说法混淆了题目正在考的含义。小叶的问题是没读正文就转发，不是好奇心太多；应该补上核查。 / Not quite. This statement confuses the meaning being tested. The problem is lack of verification, not curiosity.


#### s11-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：侍从愿意问、愿意学，但还在学习中；感兴趣不表示已经知道答案。

**EN**: A Page is learning, not already complete in knowledge.

**中**：遇到新说法可以好奇，也可以猜想，但在告诉别人“这是真的”之前，要先查来源。

**EN**: Exploration needs verification for reliable expression.


#### s11-R1-CHECK · 换个例子确认

**中**：遇到一句陌生说法，怎样保留好奇又避免乱猜？

**EN**: How can curiosity avoid careless guessing?

- A. 把第一个联想直接写成事实。 / Write the first association as fact.
- B. 把疑问问具体，并找可核对的来源。 / Ask specifically and find a checkable source.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。遇到新说法可以好奇，也可以猜想，但在告诉别人“这是真的”之前，要先查来源。 / Correct. Exploration needs verification for reliable expression.
- 选择 A 的反馈：这题不对。本题应选：把疑问问具体，并找可核对的来源。 遇到新说法可以好奇，也可以猜想，但在告诉别人“这是真的”之前，要先查来源。 / Not quite. The supported answer is: Ask specifically and find a checkable source. Exploration needs verification for reliable expression.


#### s11-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：先查术语的实际定义，再问不懂的地方；只按字面猜，可能从一开始就理解错了。

**EN**: The example requires verification rather than guessing.

**中**：先查清术语的意思、试过操作，再告诉别人，比把猜测转发出去更可靠。

**EN**: Confirming before spreading fits inquiry and verification.


#### s11-R2-CHECK · 换个例子确认

**中**：学软件时教程术语不懂，怎样补学？

**EN**: A software tutorial uses an unknown term. What fits?

- A. 查看官方说明里的定义，再试一次操作。 / Check the documented definition and try the action.
- B. 转发猜测让别人照做。 / Share a guess as instructions.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。先查清术语的意思、试过操作，再告诉别人，比把猜测转发出去更可靠。 / Correct. Confirming before spreading fits inquiry and verification.
- 选择 B 的反馈：这题不对。本题应选：查看官方说明里的定义，再试一次操作。 先查清术语的意思、试过操作，再告诉别人，比把猜测转发出去更可靠。 / Not quite. The supported answer is: Check the documented definition and try the action. Confirming before spreading fits inquiry and verification.


#### s11-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小叶只看标题就转发结论，没有读正文。这个例子里，宝剑侍从逆位提醒我们：还没核实就急着说了，需要回到原文检查。问题在没有核实，不在好奇心本身。

**EN**: Ye shares a conclusion after reading only a headline. Here reversal concerns unverified information and premature expression, calling for source checking rather than suppressing curiosity.

**中**：既然原来的消息没核实，就要回查原文；再加一个猜测，只会让说法更不可靠。

**EN**: Missing verification calls for evidence, not more guessing.


#### s11-R3-CHECK · 逆位纠错后续题

**中**：发现转发未经核实，怎样修正？

**EN**: A shared claim was not verified. Correct it how?

- A. 回去查原文，并说清哪些已经确认、哪些还不知道。 / Check the original and clarify known and unknown.
- B. 再加一个猜测，让说法显得完整。 / Add another guess to make it seem complete.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。既然原来的消息没核实，就要回查原文；再加一个猜测，只会让说法更不可靠。 / Correct. Missing verification calls for evidence, not more guessing.
- 选择 B 的反馈：这题不对。本题应选：回去查原文，并说清哪些已经确认、哪些还不知道。 既然原来的消息没核实，就要回查原文；再加一个猜测，只会让说法更不可靠。 / Not quite. The supported answer is: Check the original and clarify known and unknown. Missing verification calls for evidence, not more guessing.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s11-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s11-V1-CHECK · 新背景迁移

**中**：小组收到新消息，适合怎样参与？

**EN**: A group receives new information. How should this style contribute?

- A. 为了显得敏锐，抢先下最终结论。 / Rush to a final verdict to look sharp.
- B. 问清来源与具体内容。 / Ask about the source and precise content.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。发现信息缺了什么、及时问清楚，也是一种敏锐；不用急着抢先下结论。 / Correct. Alertness can mean good questions rather than fast verdicts.
- 选择 A 的反馈：这题不对。本题应选：问清来源与具体内容。 发现信息缺了什么、及时问清楚，也是一种敏锐；不用急着抢先下结论。 / Not quite. The supported answer is: Ask about the source and precise content. Alertness can mean good questions rather than fast verdicts.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑侍从表现出愿意观察、提问，并练习表达的初学者状态。敏锐和好奇值得保留，但听到信息还不等于已经核实。

**EN**: The Page of Swords approaches observation, questioning, and expression as skills being learned. Curiosity is useful; receiving information is not verifying it.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s12"></a>
### s12 · 宝剑骑士 · Knight of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s12.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords12.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑骑士的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Knight of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑骑士把一个判断转成迅速、直接的行动，主动争取把事情往前推进。速度可以有用，但坚定语气不等于判断必然正确。

**EN**: The Knight of Swords turns a judgment into fast, direct action. Speed can help, but conviction does not guarantee accuracy.

**中**：骑士举剑前冲，马和风势强化速度。画面有行动方向，但没有保证方向正确的证据。

**EN**: The charging rider, raised sword, horse, and wind emphasize speed and direction without proving that direction correct.

**中**：宝剑对应风元素，常和思考、判断、表达有关；骑士强调把想法付诸行动。这张牌可以记成：果断行动、迅速推进、直接表达。它描述做事方式，不限定年龄或性别。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air concerns judgment and expression; Knight emphasizes active pursuit without age or gender limits. Helpers: decisiveness, rapid action, direct expression.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：前冲的马与举剑方向 / the charging horse and raised sword。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：骑士举剑前冲，马和风势强化速度。画面有行动方向，但没有保证方向正确的证据。 / The charging rider, raised sword, horse, and wind emphasize speed and direction without proving that direction correct.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s12-Q1 · 核心理解

**中**：果断是否自动代表正确？

**EN**: Does decisiveness guarantee correctness?

- A. 代表，速度越快判断越可靠。 / Yes; faster judgments are more reliable.
- B. 不代表，仍需事实支持。 / No; it still needs factual support.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。动作快，不等于想得对。还要看这个判断有没有事实支持。 / Correct. Check speed and judgment quality separately.
- 选择 A 的反馈：这题不对。本题应选：不代表，仍需事实支持。 动作快，不等于想得对。还要看这个判断有没有事实支持。 / Not quite. The supported answer is: No; it still needs factual support. Check speed and judgment quality separately.


#### T2 · 先看一个有背景的应用示范

**中**：会议即将结束，一个关键需求仍未说清。建议位可直接提出关键问题并推动确认，同时核对必要事实；不是打断别人、抢着说话就算有效。

**EN**: A key requirement remains unclear as a meeting ends. Advice is to raise it directly and secure confirmation while checking facts, not simply interrupt loudly.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s12-Q2 · 应用理解

**中**：会议快结束了，关键需求还不清楚，怎样运用宝剑骑士的做事方式？

**EN**: A key requirement is unclear at meeting end. What fits?

- A. 直接提出关键问题并确认事实。 / Raise the key question directly and confirm facts.
- B. 先按最常见的需求推进，会议后再补确认。 / Proceed with the most common requirement and confirm it after the meeting.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。先直接问清关键需求，才知道该往哪里做；不问清就催大家行动，可能走错方向。 / Correct. Rapid progress still needs a clear judgment.
- 选择 B 的反馈：这题不对。先别按这个做法继续；先直接问清关键需求，才知道该往哪里做；不问清就催大家行动，可能走错方向。 / Not quite. Do not continue with this approach yet; Rapid progress still needs a clear judgment.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：有人没核对任务，就催全组立刻开始做，后来发现方向错了。这个例子里，宝剑骑士逆位表示行动太急，需要先慢下来核对要求，再继续推进，而不是从此什么都不做。

**EN**: Someone rushes everyone into execution without checking the task, then finds the direction wrong. Here reversal concerns haste and calls for verification, not abandoning action.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s12-Q3 · 有背景的逆位

**中**：没核对就催全组执行，逆位提醒什么？

**EN**: Rushing execution without checking: what fits?

- A. 先保持速度把当前版本做完，核对可以放到复盘。 / Maintain momentum and finish the current version, leaving verification for the review.
- B. 先核实关键条件再推进。 / Verify critical conditions before proceeding.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。这次是没核对任务就开始，才做错了方向；先把条件查清，才能避免继续做错。 / Correct. Haste caused the problem; checking is the correction.
- 选择 A 的反馈：这题不对。这里要分清牌义的边界：这次是没核对任务就开始，才做错了方向；先把条件查清，才能避免继续做错。 / Not quite. The boundary of the card meaning matters here: Haste caused the problem; checking is the correction.


#### s12-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：动作快，不等于想得对。还要看这个判断有没有事实支持。

**EN**: Check speed and judgment quality separately.

**中**：表达可以直接，但说得大声、坚定，不能代替事实依据。

**EN**: Directness is not substituting tone for evidence.


#### s12-R1-CHECK · 换个例子确认

**中**：想让事情快一点，哪种做法符合宝剑骑士的提醒？

**EN**: To move things quickly, which fits?

- A. 直接问清关键问题，核实后开始做。 / Focus, act directly, and verify.
- B. 靠更大声掩盖不知道的事实。 / Hide unknown facts by speaking louder.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。表达可以直接，但说得大声、坚定，不能代替事实依据。 / Correct. Directness is not substituting tone for evidence.
- 选择 B 的反馈：这题不对。本题应选：直接问清关键问题，核实后开始做。 表达可以直接，但说得大声、坚定，不能代替事实依据。 / Not quite. The supported answer is: Focus, act directly, and verify. Directness is not substituting tone for evidence.


#### s12-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：先直接问清关键需求，才知道该往哪里做；不问清就催大家行动，可能走错方向。

**EN**: Rapid progress still needs a clear judgment.

**中**：先问清提交要求，才能交对内容；交得很快但不符合要求，也没有解决问题。

**EN**: Efficiency should serve the goal, not speed alone.


#### s12-R2-CHECK · 换个例子确认

**中**：临近提交时发现要求不明，先怎样？

**EN**: Requirements are unclear near submission. First?

- A. 按自己熟悉的格式直接交终稿，不再确认关键要求。 / Submit the final version in a familiar format without confirming the key requirements.
- B. 赶快问清关键要求，再做已经确认的部分。 / Quickly clarify the requirement and act on what is clear.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。先问清提交要求，才能交对内容；交得很快但不符合要求，也没有解决问题。 / Correct. Efficiency should serve the goal, not speed alone.
- 选择 A 的反馈：这题不对。按熟悉格式直接交终稿，仍然跳过了确认；速度不能代替已经问清的要求。 / Not quite. Submitting a final version in a familiar format still skips clarification; speed cannot replace confirmed requirements.


#### s12-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：有人没核对任务，就催全组立刻开始做，后来发现方向错了。这个例子里，宝剑骑士逆位表示行动太急，需要先慢下来核对要求，再继续推进，而不是从此什么都不做。

**EN**: Someone rushes everyone into execution without checking the task, then finds the direction wrong. Here reversal concerns haste and calls for verification, not abandoning action.

**中**：发现方向错了，先停下来核对任务，再继续做，才不会越忙越偏。

**EN**: Slowing to verify supports effective progress.


#### s12-R3-CHECK · 逆位纠错后续题

**中**：推进方向有误，怎样保留行动力？

**EN**: Direction is wrong. How retain useful momentum?

- A. 保持原速度推进，等结果出现后再讨论方向。 / Keep the same pace and discuss the direction after results appear.
- B. 核实任务，修正方向后继续。 / Verify the task, correct direction, and continue.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。发现方向错了，先停下来核对任务，再继续做，才不会越忙越偏。 / Correct. Slowing to verify supports effective progress.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。发现方向错了，先停下来核对任务，再继续做，才不会越忙越偏。 / Not quite. This action skips a key step in the question. Slowing to verify supports effective progress.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s12-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s12-V1-CHECK · 新背景迁移

**中**：讨论中有人很坚定，怎样理解这个角色？

**EN**: Someone argues firmly. How interpret this style?

- A. 可能积极争取，但观点仍需核对。 / They may press actively; their claim still needs checking.
- B. 表达很坚定时，观点通常可以先作为事实使用。 / A firmly expressed view can usually be treated as fact at first.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。这个人积极、说话坚定，描述的是做事风格；他的观点对不对，仍要核对事实。 / Correct. The lesson separates action style from truth.
- 选择 B 的反馈：这题不对。这个做法没有解决眼前的情况。这个人积极、说话坚定，描述的是做事风格；他的观点对不对，仍要核对事实。 / Not quite. This action does not resolve the situation described. The lesson separates action style from truth.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑骑士把一个判断转成迅速、直接的行动，主动争取把事情往前推进。速度可以有用，但坚定语气不等于判断必然正确。

**EN**: The Knight of Swords turns a judgment into fast, direct action. Speed can help, but conviction does not guarantee accuracy.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s13"></a>
### s13 · 宝剑王后 · Queen of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s13.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords13.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑王后的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Queen of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑王后强调自己想清楚、根据事实作判断，并说清什么可以接受、什么不能接受。可以直接说明事实和底线，同时愿意听对方说明；不需要用冷漠证明理性。

**EN**: The Queen of Swords emphasizes clear judgment, independent thought, and boundaries. State facts and limits while allowing dialogue; coldness is not required for reason.

**中**：一手直立持剑，另一手向外伸出。用两种动作一起记忆：有明确界限，也可以交流。

**EN**: One hand holds an upright sword while the other reaches outward. Remember both a clear boundary and openness to dialogue.

**中**：宝剑对应风元素，常和思考、判断、表达有关；王后强调根据经验作判断、把话说清楚。这张牌可以记成：独立思考、看清事实、说清底线。它不限定性别或婚姻状况。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air concerns judgment; Queen here suggests mature use of this domain, not gender or marital status. Helpers: independence, clarity, boundaries.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：持剑的手与向外伸出的手 / the sword hand and extended hand。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：一手直立持剑，另一手向外伸出。用两种动作一起记忆：有明确界限，也可以交流。 / One hand holds an upright sword while the other reaches outward. Remember both a clear boundary and openness to dialogue.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s13-Q1 · 核心理解

**中**：把自己的底线说清楚，就必须拒绝听对方解释吗？

**EN**: Do clear boundaries require refusing dialogue?

- A. 不需要，可以说清自己的底线，也听听对方的情况。 / No; state them and hear an explanation.
- B. 需要，继续听解释会让边界变得不清楚。 / Yes. Continuing to listen would make the boundary less clear.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。你可以坚持自己的底线，也可以听对方解释；两件事并不冲突。 / Correct. The lesson preserves both judgment and dialogue.
- 选择 B 的反馈：这题不对。这个判断忽略了题目给出的条件。你可以坚持自己的底线，也可以听对方解释；两件事并不冲突。 / Not quite. This judgment overlooks a condition given in the question. The lesson preserves both judgment and dialogue.


#### T2 · 先看一个有背景的应用示范

**中**：朋友常临时取消约定。建议位可清楚说明自己能接受的通知时间，并听取对方现实困难，而非沉默惩罚。

**EN**: A friend often cancels at short notice. Advice is to state an acceptable notice period and hear practical difficulties rather than punish through silence.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s13-Q2 · 应用理解

**中**：朋友临时取消约定，怎样回应？

**EN**: A friend cancels at short notice. What fits?

- A. 先减少联系，让对方从沉默里理解自己的不满。 / Reduce contact and let the other person infer the concern from the silence.
- B. 说明可接受的提前通知方式。 / State an acceptable notice arrangement.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。想让对方提前通知，就把要求说清楚；一直沉默，对方可能仍不知道你介意什么。 / Correct. Stated boundaries fit the example better than hidden ones.
- 选择 A 的反馈：这题不对。先别按这个做法继续；想让对方提前通知，就把要求说清楚；一直沉默，对方可能仍不知道你介意什么。 / Not quite. Do not continue with this approach yet; Stated boundaries fit the example better than hidden ones.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：一个人以前受过伤，现在把新朋友每次晚回消息都当成恶意，也不愿听解释。这个例子里，宝剑王后逆位表示过去的伤害影响了眼前的判断，需要重新看这次的事实；不能据此给某个人下人格诊断。

**EN**: Past hurt leads someone to treat every delayed reply from a new friend as malice. Here reversal concerns bias from past pain and calls for checking current facts, not diagnosing personality.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s13-Q3 · 有背景的逆位

**中**：把旧伤套在新朋友身上，本例逆位提示什么？

**EN**: Applying past hurt to a new friend: reversal?

- A. 把过去受伤的经历和这次实际发生的事分开看。 / Separate past experience from current evidence.
- B. 旧经历已证明新朋友动机。 / Past experience proves the new friend’s motive.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。过去受过伤可以理解，但新朋友为什么晚回消息，需要根据这次的事实判断。 / Correct. Experience can inform but cannot prove current motives.
- 选择 B 的反馈：这题不对。本题应选：把过去受伤的经历和这次实际发生的事分开看。 过去受过伤可以理解，但新朋友为什么晚回消息，需要根据这次的事实判断。 / Not quite. The supported answer is: Separate past experience from current evidence. Experience can inform but cannot prove current motives.


#### s13-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：你可以坚持自己的底线，也可以听对方解释；两件事并不冲突。

**EN**: The lesson preserves both judgment and dialogue.

**中**：说清自己哪里不方便后，仍可以听听有没有别的安排，不必把不同意见都当成冒犯。

**EN**: Boundaries do not require rejecting disagreement.


#### s13-R1-CHECK · 换个例子确认

**中**：直接表达“不方便”，怎样既清楚又可交流？

**EN**: How can declining be clear and open?

- A. 把不同意见视为对方不尊重边界，直接结束讨论。 / Treat disagreement as disrespect for the boundary and end the discussion.
- B. 说清自己哪里不方便，再商量有没有别的安排。 / State the limit and discuss feasible alternatives.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。说清自己哪里不方便后，仍可以听听有没有别的安排，不必把不同意见都当成冒犯。 / Correct. Boundaries do not require rejecting disagreement.
- 选择 A 的反馈：这题不对。先别按这个做法继续；说清自己哪里不方便后，仍可以听听有没有别的安排，不必把不同意见都当成冒犯。 / Not quite. Do not continue with this approach yet; Boundaries do not require rejecting disagreement.


#### s13-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：想让对方提前通知，就把要求说清楚；一直沉默，对方可能仍不知道你介意什么。

**EN**: Stated boundaries fit the example better than hidden ones.

**中**：先指出哪项分工与约定不符，才能讨论怎么调整；只评价对方是什么人，解决不了这次分工问题。

**EN**: Clear judgment needs facts and defined scope.


#### s13-R2-CHECK · 换个例子确认

**中**：同伴反复超出约定分工，怎样补救？

**EN**: A teammate repeatedly exceeds agreed scope. What fits?

- A. 指出具体约定，再谈如何调整。 / Refer to the agreement and discuss adjustments.
- B. 避开具体事实，只评价对方人格。 / Avoid facts and judge their character.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。先指出哪项分工与约定不符，才能讨论怎么调整；只评价对方是什么人，解决不了这次分工问题。 / Correct. Clear judgment needs facts and defined scope.
- 选择 B 的反馈：这题不对。本题应选：指出具体约定，再谈如何调整。 先指出哪项分工与约定不符，才能讨论怎么调整；只评价对方是什么人，解决不了这次分工问题。 / Not quite. The supported answer is: Refer to the agreement and discuss adjustments. Clear judgment needs facts and defined scope.


#### s13-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：一个人以前受过伤，现在把新朋友每次晚回消息都当成恶意，也不愿听解释。这个例子里，宝剑王后逆位表示过去的伤害影响了眼前的判断，需要重新看这次的事实；不能据此给某个人下人格诊断。

**EN**: Past hurt leads someone to treat every delayed reply from a new friend as malice. Here reversal concerns bias from past pain and calls for checking current facts, not diagnosing personality.

**中**：先听新朋友这次的说明，再看是否可信；过去的经历不能直接证明这次也一样。

**EN**: Experience should not block judgment of new facts.


#### s13-R3-CHECK · 逆位纠错后续题

**中**：新朋友说明迟回复原因，如何修正旧伤带来的判断？

**EN**: A new friend explains a late reply. Correct the past-pain bias how?

- A. 听听这次的解释、核对事实，也保留自己的底线。 / Hear and check current facts while keeping boundaries.
- B. 先按旧经历判断这次情况，再决定是否听说明。 / Judge the current situation through the old experience before deciding whether to hear the explanation.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。先听新朋友这次的说明，再看是否可信；过去的经历不能直接证明这次也一样。 / Correct. Experience should not block judgment of new facts.
- 选择 B 的反馈：这题不对。这个做法没有解决眼前的情况。先听新朋友这次的说明，再看是否可信；过去的经历不能直接证明这次也一样。 / Not quite. This action does not resolve the situation described. Experience should not block judgment of new facts.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s13-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s13-V1-CHECK · 新背景迁移

**中**：家人的安排不适合你，按照宝剑王后的提醒，怎样回应？

**EN**: Family proposes an unsuitable arrangement. Apply the theme.

- A. 先退出这次沟通，让家人自行猜测你的底线。 / Leave the conversation and let the family infer the boundary themselves.
- B. 说明自己的条件与可接受范围。 / Explain your conditions and acceptable limits.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。你可以说明自己能接受什么，再讨论安排；有自己的判断，不等于必须断绝沟通。 / Correct. Independent judgment can coexist with dialogue.
- 选择 A 的反馈：这题不对。这个做法没有解决眼前的情况。你可以说明自己能接受什么，再讨论安排；有自己的判断，不等于必须断绝沟通。 / Not quite. This action does not resolve the situation described. Independent judgment can coexist with dialogue.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑王后强调自己想清楚、根据事实作判断，并说清什么可以接受、什么不能接受。可以直接说明事实和底线，同时愿意听对方说明；不需要用冷漠证明理性。

**EN**: The Queen of Swords emphasizes clear judgment, independent thought, and boundaries. State facts and limits while allowing dialogue; coldness is not required for reason.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-s14"></a>
### s14 · 宝剑国王 · King of Swords

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/s14.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Swords14.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解宝剑国王的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of King of Swords, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：宝剑国王根据知识和原则作决定，对同类事情采用同一标准，并为自己的决定负责。即使是权威人物，也需要说明决定的依据。

**EN**: The King of Swords uses knowledge, principles, and consistent standards for complex decisions and accepts responsibility. Authority does not replace checkable reasons.

**中**：人物正面坐稳并持剑，呈现正式判断的姿态。可以用来记住认真作决定、承担责任，不据此认定现实某位专家永远正确。

**EN**: A seated figure faces forward holding a sword, suggesting formal judgment. Remember responsibility without assuming an expert is infallible.

**中**：宝剑对应风元素，常和思考、判断、表达有关；国王强调作决定，并为决定负责。这张牌可以记成：按事实判断、有原则、运用专业知识、标准一致。它不限定性别。

**EN**: Swords correspond to Air and commonly concern thought, judgment, and communication. Air concerns analysis and expression; King emphasizes oversight and responsibility without gender limits. Helpers: reason, principles, expert judgment, consistent standards.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：正面坐姿与持剑 / the forward-facing seated posture and sword。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物正面坐稳并持剑，呈现正式判断的姿态。可以用来记住认真作决定、承担责任，不据此认定现实某位专家永远正确。 / A seated figure faces forward holding a sword, suggesting formal judgment. Remember responsibility without assuming an expert is infallible.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### s14-Q1 · 核心理解

**中**：专业判断靠什么建立可信度？

**EN**: What makes a judgment accountable?

- A. 看表达是否果断，以及别人是否愿意服从。 / Look at how decisive the person sounds and whether others are willing to follow.
- B. 理由、证据和一致标准。 / Reasons, evidence, and consistent standards.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。一个判断是否可靠，要看理由和证据；有头衔的人也应该说明依据。 / Correct. The lesson emphasizes checkable judgment, not status replacing reasons.
- 选择 A 的反馈：这题不对。这个说法混淆了题目正在考的含义。一个判断是否可靠，要看理由和证据；有头衔的人也应该说明依据。 / Not quite. This statement confuses the meaning being tested. The lesson emphasizes checkable judgment, not status replacing reasons.


#### T2 · 先看一个有背景的应用示范

**中**：团队需要评选方案。建议位先公开评价标准，再用同样标准比较各方案，最后说明决定，而不是只说“听我的”。

**EN**: A team must select a proposal. Advice is to publish criteria, apply them consistently, and explain the decision rather than simply demand obedience.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### s14-Q2 · 应用理解

**中**：评选团队方案，先做什么？

**EN**: Selecting a team proposal: first?

- A. 先说清评选标准，再按同一标准评选。 / Publish and consistently apply criteria.
- B. 看是谁提交，再换成对他有利的标准。 / Change criteria based on the submitter.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。先说清怎么评，再用同一标准比较各方案，大家才知道决定是怎样作出的。 / Correct. Shared criteria support accountable decisions.
- 选择 B 的反馈：这题不对。本题应选：先说清评选标准，再按同一标准评选。 先说清怎么评，再用同一标准比较各方案，大家才知道决定是怎样作出的。 / Not quite. The supported answer is: Publish and consistently apply criteria. Shared criteria support accountable decisions.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：负责人说自己按规则评分，却临时为喜欢的方案改标准。这个例子里，宝剑国王逆位提醒我们：有人在用权威和看似合理的说法偏袒或压制别人。需要重新检查，所有方案是否用了同一标准。

**EN**: A leader claims rule-based scoring but changes criteria for a favored proposal. Here reversal concerns authority and rational language being used to dominate or favor.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### s14-Q3 · 有背景的逆位

**中**：为偏爱方案改评分标准，逆位怎么理解？

**EN**: Changing criteria for a favorite: interpret.

- A. 负责人承担后果，因此可以按个人判断调整标准。 / Because the person in charge bears the consequences, personal judgment can be used to adjust the standard.
- B. 负责人在偏袒喜欢的方案，需要检查评分标准是否一样。 / Authority favors someone; examine the criteria.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。负责人说自己“按规则办”，不表示真的做到了；还要看有没有为喜欢的方案改标准。 / Correct. Rule-based language does not prove consistency.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。负责人说自己“按规则办”，不表示真的做到了；还要看有没有为喜欢的方案改标准。 / Not quite. This action skips a key step in the question. Rule-based language does not prove consistency.


#### s14-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：一个判断是否可靠，要看理由和证据；有头衔的人也应该说明依据。

**EN**: The lesson emphasizes checkable judgment, not status replacing reasons.

**中**：把事实和标准说明白，别人才能检查决定是否合理；堆术语并不能代替这些依据。

**EN**: Responsible judgment allows scrutiny, not jargon.


#### s14-R1-CHECK · 换个例子确认

**中**：为什么要说明决定依据？

**EN**: Why explain a decision’s basis?

- A. 让别人能检查事实和标准。 / Let others examine facts and standards.
- B. 只是为了多说几个专业词，让自己显得懂得多。 / Merely to sound more technical.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。把事实和标准说明白，别人才能检查决定是否合理；堆术语并不能代替这些依据。 / Correct. Responsible judgment allows scrutiny, not jargon.
- 选择 B 的反馈：这题不对。本题应选：让别人能检查事实和标准。 把事实和标准说明白，别人才能检查决定是否合理；堆术语并不能代替这些依据。 / Not quite. The supported answer is: Let others examine facts and standards. Responsible judgment allows scrutiny, not jargon.


#### s14-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：先说清怎么评，再用同一标准比较各方案，大家才知道决定是怎样作出的。

**EN**: Shared criteria support accountable decisions.

**中**：不论申请者是不是熟人，都应按事先说明的同一套条件审核。

**EN**: Consistent standards must hold across people.


#### s14-R2-CHECK · 换个例子确认

**中**：社团分配名额，怎样运用宝剑国王强调的统一标准？

**EN**: A club allocates places. Apply the theme.

- A. 看到熟人后临时放宽要求。 / Relax requirements for acquaintances.
- B. 先说明资格，再按同样条件审核。 / State eligibility and review under the same conditions.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。不论申请者是不是熟人，都应按事先说明的同一套条件审核。 / Correct. Consistent standards must hold across people.
- 选择 A 的反馈：这题不对。本题应选：先说明资格，再按同样条件审核。 不论申请者是不是熟人，都应按事先说明的同一套条件审核。 / Not quite. The supported answer is: State eligibility and review under the same conditions. Consistent standards must hold across people.


#### s14-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：负责人说自己按规则评分，却临时为喜欢的方案改标准。这个例子里，宝剑国王逆位提醒我们：有人在用权威和看似合理的说法偏袒或压制别人。需要重新检查，所有方案是否用了同一标准。

**EN**: A leader claims rule-based scoring but changes criteria for a favored proposal. Here reversal concerns authority and rational language being used to dominate or favor.

**中**：问题是评分标准因人而变；重新按同一标准评分，比换一套专业说法更重要。

**EN**: Jargon cannot repair inconsistent standards.


#### s14-R3-CHECK · 逆位纠错后续题

**中**：发现评分偏袒后，怎样修复？

**EN**: Biased scoring is found. Repair it how?

- A. 给临时偏袒加更多专业术语。 / Add technical jargon to the favoritism.
- B. 重新按事先说好的同一标准，核对各方案的分数。 / Restore consistent public criteria and review scores.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。问题是评分标准因人而变；重新按同一标准评分，比换一套专业说法更重要。 / Correct. Jargon cannot repair inconsistent standards.
- 选择 A 的反馈：这题不对。本题应选：重新按事先说好的同一标准，核对各方案的分数。 问题是评分标准因人而变；重新按同一标准评分，比换一套专业说法更重要。 / Not quite. The supported answer is: Restore consistent public criteria and review scores. Jargon cannot repair inconsistent standards.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### s14-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### s14-V1-CHECK · 新背景迁移

**中**：两位专家意见不同，宝剑国王提醒我们怎样判断？

**EN**: Two experts disagree. What fits?

- A. 比较他们各自根据什么、在什么情况下成立。 / Compare their evidence and conditions.
- B. 只比较头衔长度。 / Compare the length of their titles.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。专家意见不同，就比较他们各自依据什么、在什么条件下成立；不能只看头衔。 / Correct. Knowledge-based judgment returns to reasons and scope.
- 选择 B 的反馈：这题不对。本题应选：比较他们各自根据什么、在什么情况下成立。 专家意见不同，就比较他们各自依据什么、在什么条件下成立；不能只看头衔。 / Not quite. The supported answer is: Compare their evidence and conditions. Knowledge-based judgment returns to reasons and scope.


#### 完成与接续

**学习总结 / Learning summary**

**中**：宝剑国王根据知识和原则作决定，对同类事情采用同一标准，并为自己的决定负责。即使是权威人物，也需要说明决定的依据。

**EN**: The King of Swords uses knowledge, principles, and consistent standards for complex decisions and accepts responsibility. Authority does not replace checkable reasons.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p01"></a>
### p01 · 星币王牌 · Ace of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p01.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents01.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币王牌的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Ace of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币王牌表示一个值得着手的机会：你已经有了一些资源、时间或条件，接下来还要动手去做，才可能有成果。它不是收到财富的保证。

**EN**: The Ace of Pentacles is an opportunity that can be cultivated in practice. Resources, time, or conditions offer a starting point, but development still requires investment; wealth is not guaranteed.

**中**：云中手托着星币，下方有花园和拱门。花园和入口帮助我们记住：机会已经出现，还需要走进去、开始做，不把星币当成确定收入。

**EN**: A hand holds a pentacle above a garden and archway. The accessible setting suggests a practical beginning, not guaranteed income.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关；王牌表示新的起点。这张牌可以记成：新的机会、可用的资源、开始动手。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth directs attention to practical conditions; an Ace suggests a beginning. Helpers: a cultivable opportunity, resources, practical grounding.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：手中的星币和花园拱门 / the held pentacle and garden archway。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：云中手托着星币，下方有花园和拱门。花园和入口帮助我们记住：机会已经出现，还需要走进去、开始做，不把星币当成确定收入。 / A hand holds a pentacle above a garden and archway. The accessible setting suggests a practical beginning, not guaranteed income.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p01-Q1 · 核心理解

**中**：机会出现是否等于成果已到手？

**EN**: Does an opportunity mean the result is already secured?

- A. 不等于，还需要安排时间、准备资源并实际去做。 / No; practical investment is still needed.
- B. 等于，看到机会就不用行动。 / Yes; an opportunity removes the need to act.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。有机会开始，不表示已经做好；还需要准备和行动。 / Correct. An Ace is a starting point, not a completion guarantee.
- 选择 B 的反馈：这题不对。本题应选：不等于，还需要安排时间、准备资源并实际去做。 有机会开始，不表示已经做好；还需要准备和行动。 / Not quite. The supported answer is: No; practical investment is still needed. An Ace is a starting point, not a completion guarantee.


#### T2 · 先看一个有背景的应用示范

**中**：小陆有机会借到绘画工具，也有每周两小时空闲。放在建议位，可以先确认怎么借工具、哪天练习、第一次画什么，让这个机会变成一次真正的学习。

**EN**: Lu can borrow drawing tools and has two free hours weekly. Advice is to secure the tools, time, and first exercise so the opportunity becomes practical learning.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p01-Q2 · 应用理解

**中**：已经能借到工具，也有空闲时间，先做什么？

**EN**: Tools and time may be available. First?

- A. 只想象最终作品，不安排开始。 / Imagine the final artwork without arranging a start.
- B. 确认借用，安排第一项练习。 / Confirm access and schedule the first exercise.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。有工具可借之后，再留出练习时间、准备好材料，才能真正开始画画。 / Correct. The example turns possibility into workable conditions.
- 选择 A 的反馈：这题不对。本题应选：确认借用，安排第一项练习。 有工具可借之后，再留出练习时间、准备好材料，才能真正开始画画。 / Not quite. The supported answer is: Confirm access and schedule the first exercise. The example turns possibility into workable conditions.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小陆答应开始学画，却没确认工具怎么借、什么时候能练。这个例子里，星币王牌逆位表示机会还没有真正用起来，需要先把工具和时间安排好；不表示他永远学不会。

**EN**: Lu agrees to begin but has not secured tools or time. Here reversal means an unrealized opportunity requiring practical preparation, not permanent inability.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p01-Q3 · 有背景的逆位

**中**：工具怎么借、什么时候练都没安排好，这个逆位例子在提醒什么？

**EN**: Neither tools nor time are secured. Reversal?

- A. 机会已经有了，但工具和时间还需要安排好。 / The opportunity needs practical preparation.
- B. 机会已经出现，细节可以等真正要用时再安排。 / The opportunity exists, so arrange the practical details when they become necessary.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。现在还没准备好，不表示以后也做不到；可以先把缺少的工具和时间安排好。 / Correct. Lack of preparation differs from permanent inability.
- 选择 B 的反馈：这题不对。这样做会漏掉题目里的关键一步。现在还没准备好，不表示以后也做不到；可以先把缺少的工具和时间安排好。 / Not quite. This action skips a key step in the question. Lack of preparation differs from permanent inability.


#### p01-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：有机会开始，不表示已经做好；还需要准备和行动。

**EN**: An Ace is a starting point, not a completion guarantee.

**中**：成长仍需要资源与行动。

**EN**: Growth still needs resources and action.


#### p01-R1-CHECK · 换个例子确认

**中**：有了新的机会，就表示已经有成果了吗？

**EN**: What does cultivable mean?

- A. 有了机会就可以先按成果已到手来规划下一步。 / Once the opportunity appears, plan the next step as though the result is already secured.
- B. 有机会开始，之后还要花时间实际去做。 / There is a start that needs continued care.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。成长仍需要资源与行动。 / Correct. Growth still needs resources and action.
- 选择 A 的反馈：这题不对。星币王牌表示有可用的起点；机会要变成成果，仍需要投入时间和实际行动。 / Not quite. The Ace of Pentacles offers a usable beginning; turning the opportunity into a result still takes time and action.


#### p01-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：有工具可借之后，再留出练习时间、准备好材料，才能真正开始画画。

**EN**: The example turns possibility into workable conditions.

**中**：拿到工具只是开始，还要实际练习，才能学会使用。

**EN**: Access to resources is not acquired skill.


#### p01-R2-CHECK · 换个例子确认

**中**：有了试用学习软件的机会，按照星币王牌的提醒，先做什么？

**EN**: A trial learning tool becomes available. Ground it how?

- A. 确认设备可用并完成第一项练习。 / Check device access and complete a first exercise.
- B. 只保存注册链接，认为技能已获得。 / Save the link and assume the skill is acquired.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。拿到工具只是开始，还要实际练习，才能学会使用。 / Correct. Access to resources is not acquired skill.
- 选择 B 的反馈：这题不对。本题应选：确认设备可用并完成第一项练习。 拿到工具只是开始，还要实际练习，才能学会使用。 / Not quite. The supported answer is: Check device access and complete a first exercise. Access to resources is not acquired skill.


#### p01-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小陆答应开始学画，却没确认工具怎么借、什么时候能练。这个例子里，星币王牌逆位表示机会还没有真正用起来，需要先把工具和时间安排好；不表示他永远学不会。

**EN**: Lu agrees to begin but has not secured tools or time. Here reversal means an unrealized opportunity requiring practical preparation, not permanent inability.

**中**：这次缺的是设备和时间；光说“我一定行”，不会让设备和时间自动出现。

**EN**: The gap concerns preparation, not strength of belief.


#### p01-R3-CHECK · 逆位纠错后续题

**中**：机会已经有了，但还没安排好，先做哪一步？

**EN**: The opportunity remains unrealized. What directly addresses the gap?

- A. 确认所需工具和实际开始时间。 / Secure needed tools and a real start time.
- B. 先想象理想成果，等信心稳定后再定时间。 / Picture the ideal result first and set a start time after confidence grows.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。这次缺的是设备和时间；光说“我一定行”，不会让设备和时间自动出现。 / Correct. The gap concerns preparation, not strength of belief.
- 选择 B 的反馈：这题不对。这个做法没有解决眼前的情况。这次缺的是设备和时间；光说“我一定行”，不会让设备和时间自动出现。 / Not quite. This action does not resolve the situation described. The gap concerns preparation, not strength of belief.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p01-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p01-V1-CHECK · 新背景迁移

**中**：朋友愿意提供练习场地，按照星币王牌的提醒，先做什么？

**EN**: A friend offers practice space. Apply the theme.

- A. 先把获奖当作目标，再看有没有必要安排练习。 / Set winning as the goal, then decide whether practice needs to be scheduled.
- B. 约定可用时间，实际开始练习。 / Agree on access times and begin practicing.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。有场地可用，让计划有了开始的条件；能做到什么程度，还要看后续怎么做。 / Correct. Conditions support beginning without guaranteeing outcomes.
- 选择 A 的反馈：这题不对。这个做法没有解决眼前的情况。有场地可用，让计划有了开始的条件；能做到什么程度，还要看后续怎么做。 / Not quite. This action does not resolve the situation described. Conditions support beginning without guaranteeing outcomes.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币王牌表示一个值得着手的机会：你已经有了一些资源、时间或条件，接下来还要动手去做，才可能有成果。它不是收到财富的保证。

**EN**: The Ace of Pentacles is an opportunity that can be cultivated in practice. Resources, time, or conditions offer a starting point, but development still requires investment; wealth is not guaranteed.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p02"></a>
### p02 · 星币二 · Two of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p02.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents02.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币二的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Two of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币二表示同时照顾几件事情，随情况调整时间、精力和资源的安排。平衡会随条件变化，必要时需要取舍，而不是永远两全。

**EN**: The Two of Pentacles manages time, energy, and resources across practical demands. Balance changes with conditions and can require tradeoffs, not permanent success at everything.

**中**：人物手持两枚相连的星币，远处船随波起伏。这个画面帮助我们记住：事情会变化，安排也需要跟着调整。

**EN**: A figure holds two linked pentacles as distant ships rise and fall with waves. Coordination and changing conditions support remembering dynamic balance.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关。数字二让我们留意两边的需求；这张牌表现的是怎样安排几件实际的事。可以记成：兼顾几件事、灵活调整、必要时取舍。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns practical arrangements; two suggests coordination between demands. Helpers: coordination, flexibility, tradeoffs.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：相连的两枚星币与波浪上的船 / the linked pentacles and ships on waves。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物手持两枚相连的星币，远处船随波起伏。这个画面帮助我们记住：事情会变化，安排也需要跟着调整。 / A figure holds two linked pentacles as distant ships rise and fall with waves. Coordination and changing conditions support remembering dynamic balance.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p02-Q1 · 核心理解

**中**：星币二说要兼顾几件事，还可以减少任务吗？

**EN**: Does dynamic balance allow tradeoffs?

- A. 不太适合，减少任务会说明自己的协调能力不足。 / It is a poor fit because reducing tasks would reveal weak coordination skills.
- B. 可以，情况变了，就需要重新安排。 / Yes; changing conditions require reallocation.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。每件事都会花时间和精力；安排不过来时，就需要调整先后或减少任务。 / Correct. Coordination includes recognizing limited time and energy.
- 选择 A 的反馈：这题不对。先核对眼前例子的条件：每件事都会花时间和精力；安排不过来时，就需要调整先后或减少任务。 / Not quite. Check the conditions in this example first: Coordination includes recognizing limited time and energy.


#### T2 · 先看一个有背景的应用示范

**中**：小方同时有兼职和考试，时间不能增加。建议位调整排班与复习份量，明确先后，而不是把两个满负荷计划直接叠加。

**EN**: Fang has work and exams without extra hours. Advice adjusts shifts and study load and sets priorities rather than stacking two full schedules.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p02-Q2 · 应用理解

**中**：兼职班次增加，考试也临近了，怎样安排？

**EN**: Work and exam demands rise. What fits?

- A. 重新分配排班和复习时间。 / Reallocate shifts and study time.
- B. 把两个满负荷计划原样相加。 / Add both full schedules unchanged.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。时间没有增加，必须调整投入。 / Correct. Time has not expanded; allocation must change.
- 选择 B 的反馈：这题不对。本题应选：重新分配排班和复习时间。 时间没有增加，必须调整投入。 / Not quite. The supported answer is: Reallocate shifts and study time. Time has not expanded; allocation must change.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小方接下更多班次后，连续漏交作业。这个例子里，星币二逆位表示任务已经排得太满，需要减少一部分、重新安排；不能简单归咎于他不够努力。

**EN**: Fang takes more shifts and misses assignments. Here reversal indicates overload requiring reduction or rescheduling, not a lack of effort.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p02-Q3 · 有背景的逆位

**中**：接下更多班次后，连续漏交作业，逆位提示什么？

**EN**: More shifts lead to missed work. Reversal?

- A. 保持当前承诺，尝试把每项任务压缩一点时间。 / Keep the current commitments and shorten the time spent on each task.
- B. 事情排得太多，需要减少一些或重新安排。 / Demand exceeds capacity; reduce or reschedule.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。一天的时间有限，喊“我都能做到”不会多出几个小时；需要重新安排任务。 / Correct. Practical capacity cannot disappear through slogans.
- 选择 A 的反馈：这题不对。这个解释把牌义带到了别处。一天的时间有限，喊“我都能做到”不会多出几个小时；需要重新安排任务。 / Not quite. This interpretation shifts the card meaning elsewhere. Practical capacity cannot disappear through slogans.


#### p02-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：每件事都会花时间和精力；安排不过来时，就需要调整先后或减少任务。

**EN**: Coordination includes recognizing limited time and energy.

**中**：即使你擅长同时做几件事，每件事也会花时间和精力，不能无限加任务。

**EN**: Every task still uses limited resources.


#### p02-R1-CHECK · 换个例子确认

**中**：“灵活”为什么不等于全部答应？

**EN**: Why is flexibility not saying yes to everything?

- A. 灵活安排，也包括分清先后、拒绝做不完的任务。 / It includes priorities and declining excess.
- B. 灵活就是把任务随时挪动，不必判断优先级。 / Flexibility means moving tasks around whenever needed without judging their priority.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。即使你擅长同时做几件事，每件事也会花时间和精力，不能无限加任务。 / Correct. Every task still uses limited resources.
- 选择 B 的反馈：这题不对。这个解释把牌义带到了别处。即使你擅长同时做几件事，每件事也会花时间和精力，不能无限加任务。 / Not quite. This interpretation shifts the card meaning elsewhere. Every task still uses limited resources.


#### p02-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：时间没有增加，必须调整投入。

**EN**: Time has not expanded; allocation must change.

**中**：课程与家务时间冲突，就要改时间、分工或先后顺序；只说都重要，冲突仍然存在。

**EN**: Coordination requires real scheduling changes.


#### p02-R2-CHECK · 换个例子确认

**中**：家务和课程冲突，怎样协调？

**EN**: Chores and a class conflict. Coordinate how?

- A. 假定同时开始就能同时完成。 / Assume starting both means finishing both.
- B. 调整时间或分工，保留必要任务。 / Change timing or sharing and preserve essentials.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。课程与家务时间冲突，就要改时间、分工或先后顺序；只说都重要，冲突仍然存在。 / Correct. Coordination requires real scheduling changes.
- 选择 A 的反馈：这题不对。本题应选：调整时间或分工，保留必要任务。 课程与家务时间冲突，就要改时间、分工或先后顺序；只说都重要，冲突仍然存在。 / Not quite. The supported answer is: Change timing or sharing and preserve essentials. Coordination requires real scheduling changes.


#### p02-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小方接下更多班次后，连续漏交作业。这个例子里，星币二逆位表示任务已经排得太满，需要减少一部分、重新安排；不能简单归咎于他不够努力。

**EN**: Fang takes more shifts and misses assignments. Here reversal indicates overload requiring reduction or rescheduling, not a lack of effort.

**中**：时间不够时，可以减少一项任务，把重要的事安排好；这也是调整，并不是失败。

**EN**: Reallocation under limited time may require reduction.


#### p02-R3-CHECK · 逆位纠错后续题

**中**：任务超载后先减少一项，是否违背协调？

**EN**: Does dropping one task violate coordination?

- A. 违背，协调能力主要体现在把原任务维持住。 / It does. Coordination is mainly shown by keeping the original task list intact.
- B. 不违背，少做一件，可能才有时间把重要的事做好。 / No; tradeoffs can restore a workable balance.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。时间不够时，可以减少一项任务，把重要的事安排好；这也是调整，并不是失败。 / Correct. Reallocation under limited time may require reduction.
- 选择 A 的反馈：这题不对。这个判断忽略了题目给出的条件。时间不够时，可以减少一项任务，把重要的事安排好；这也是调整，并不是失败。 / Not quite. This judgment overlooks a condition given in the question. Reallocation under limited time may require reduction.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p02-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p02-V1-CHECK · 新背景迁移

**中**：新增志愿活动占用了周末，星币二提醒我们怎样安排？

**EN**: Volunteering uses weekend time. Apply the theme.

- A. 检查原安排，决定哪些要减少。 / Review commitments and decide what to reduce.
- B. 先把新活动塞进空档，再看原计划哪里能补回来。 / Fit the new activity into an open slot, then find time to make up the original plan.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。多了一项志愿活动，就要重新看看时间够不够，再调整原来的安排。 / Correct. New demands require rebalancing.
- 选择 B 的反馈：这题不对。新增志愿活动会改变原来的时间分配；先检查容量，再决定哪些安排要减少。 / Not quite. A new volunteer activity changes the existing time balance; check capacity before deciding what to reduce.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币二表示同时照顾几件事情，随情况调整时间、精力和资源的安排。平衡会随条件变化，必要时需要取舍，而不是永远两全。

**EN**: The Two of Pentacles manages time, energy, and resources across practical demands. Balance changes with conditions and can require tradeoffs, not permanent success at everything.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p03"></a>
### p03 · 星币三 · Three of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p03.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents03.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币三的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Three of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币三强调把不同技能组织起来，依照共同标准完成实际工作。合作不是人多就自动发生，需要分工、交流和尊重能力。

**EN**: The Three of Pentacles combines different skills under shared standards to accomplish work. Collaboration needs roles, communication, and respect for competence, not just more people.

**中**：工匠与两人围绕建筑交流，其中一人拿着图纸。有人动手做，有人拿图纸讨论，帮助我们记住：运用各自的技能，一起把工作做好。

**EN**: A craftsperson consults two others, one holding plans. Tools, plans, and distinct roles support craftsmanship and collaboration.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关。数字三可以帮助记住一起做事，但不是三个人在场就一定合作得好；还要像画中那样沟通、配合。可以记成：专业技能、合作、说好要求。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns practical results; three can aid remembering joint work without guaranteeing any trio cooperates well. Helpers: skill, collaboration, shared standards.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：工匠、持图纸者和建筑 / the craftsperson, plan holder, and building。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：工匠与两人围绕建筑交流，其中一人拿着图纸。有人动手做，有人拿图纸讨论，帮助我们记住：运用各自的技能，一起把工作做好。 / A craftsperson consults two others, one holding plans. Tools, plans, and distinct roles support craftsmanship and collaboration.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p03-Q1 · 核心理解

**中**：合作怎样形成？

**EN**: How does collaboration work here?

- A. 大家发挥各自的技能，并按事先说好的要求一起完成工作。 / Different skills coordinate around shared standards.
- B. 成员各自把擅长部分做好，成品自然会拼合。 / If members do their strongest parts well, the pieces will come together on their own.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。大家要知道在一起做什么、各自负责什么，遇到问题也要交流；不是人聚在一起就算合作。 / Correct. Coordination needs common goals and communication.
- 选择 B 的反馈：这题不对。这个做法没有解决眼前的情况。大家要知道在一起做什么、各自负责什么，遇到问题也要交流；不是人聚在一起就算合作。 / Not quite. This action does not resolve the situation described. Coordination needs common goals and communication.


#### T2 · 先看一个有背景的应用示范

**中**：小组做海报，有人写文案、有人设计。建议位先约定读者、尺寸与交付标准，再分工并互相检查，避免做完后才发现尺寸不对、内容接不上。

**EN**: A poster team has writers and designers. Advice establishes audience, size, and delivery standards before dividing work and reviewing compatibility.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p03-Q2 · 应用理解

**中**：写作与设计协作做海报，先明确什么？

**EN**: Writers and designers make a poster. Clarify what first?

- A. 只数人数，不讨论要求。 / Count people without discussing requirements.
- B. 读者、尺寸与交付标准。 / Audience, dimensions, and delivery standards.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。写文案和做设计的人先说好尺寸、内容和交付要求，做出来的东西才能用在同一张海报上。 / Correct. Shared requirements allow separate work to combine.
- 选择 A 的反馈：这题不对。本题应选：读者、尺寸与交付标准。 写文案和做设计的人先说好尺寸、内容和交付要求，做出来的东西才能用在同一张海报上。 / Not quite. The supported answer is: Audience, dimensions, and delivery standards. Shared requirements allow separate work to combine.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小组成员各按不同尺寸完成自己的部分，最后拼不在一起。这个例子里，星币三逆位表示合作的要求没说清，需要重新约定尺寸、分工和交付要求，不表示所有人都没能力。

**EN**: Everyone delivers different sizes that cannot fit together. Here reversal means misaligned standards and roles, not universal incompetence.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p03-Q3 · 有背景的逆位

**中**：作品尺寸不一致，逆位提示什么？

**EN**: Delivered pieces differ in size. Reversal?

- A. 重新说清尺寸、内容和交付要求。 / Agree on dimensions, content, and delivery requirements again.
- B. 说明团队的个人水平不够，需要换更熟练的人。 / It suggests that the team's skill level is too low and more experienced members are needed.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。每个人都会做自己的部分，不代表彼此的要求已经说清；这次需要先把要求统一。 / Correct. Technical skill and coordination standards differ.
- 选择 B 的反馈：这题不对。这里要分清牌义的边界：每个人都会做自己的部分，不代表彼此的要求已经说清；这次需要先把要求统一。 / Not quite. The boundary of the card meaning matters here: Technical skill and coordination standards differ.


#### p03-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：大家要知道在一起做什么、各自负责什么，遇到问题也要交流；不是人聚在一起就算合作。

**EN**: Coordination needs common goals and communication.

**中**：人多不一定做得好。大家要先说清怎么配合，才能把各自的工作接起来。

**EN**: The problem is coordination, not headcount.


#### p03-R1-CHECK · 换个例子确认

**中**：各自做得好却拼不起来，缺了什么？

**EN**: Good individual work does not fit together. What is missing?

- A. 让大家继续按各自标准完成，最后再找人拼在一起。 / Let everyone finish to their own standards, then find someone to assemble the pieces at the end.
- B. 缺少事先说好的要求，以及交接时的检查。 / Shared agreements and integration checks.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。人多不一定做得好。大家要先说清怎么配合，才能把各自的工作接起来。 / Correct. The problem is coordination, not headcount.
- 选择 A 的反馈：这题不对。等到最后才拼接各自完成的内容，仍缺少事先统一的要求和交接检查。 / Not quite. Waiting until the end to assemble separately made work still lacks shared requirements and handoff checks.


#### p03-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：写文案和做设计的人先说好尺寸、内容和交付要求，做出来的东西才能用在同一张海报上。

**EN**: Shared requirements allow separate work to combine.

**中**：表演和灯光先说好提示信号、进场时间，各自的技能才能配合起来。

**EN**: Shared standards turn expertise into collaboration.


#### p03-R2-CHECK · 换个例子确认

**中**：社团准备演出，怎样运用星币三讲的合作？

**EN**: A club prepares a show. What fits?

- A. 表演与灯光先确认同一套流程。 / Performers and lighting agree on one cue plan.
- B. 表演和灯光各自按经验准备，彩排时再对齐。 / Let performance and lighting prepare from experience and align during rehearsal.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。表演和灯光先说好提示信号、进场时间，各自的技能才能配合起来。 / Correct. Shared standards turn expertise into collaboration.
- 选择 B 的反馈：这题不对。先别按这个做法继续；表演和灯光先说好提示信号、进场时间，各自的技能才能配合起来。 / Not quite. Do not continue with this approach yet; Shared standards turn expertise into collaboration.


#### p03-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小组成员各按不同尺寸完成自己的部分，最后拼不在一起。这个例子里，星币三逆位表示合作的要求没说清，需要重新约定尺寸、分工和交付要求，不表示所有人都没能力。

**EN**: Everyone delivers different sizes that cannot fit together. Here reversal means misaligned standards and roles, not universal incompetence.

**中**：尺寸不一致，是因为要求没说清；先统一尺寸并修改作品，比再增加一个人更有用。

**EN**: The issue is missing standards, not headcount.


#### p03-R3-CHECK · 逆位纠错后续题

**中**：尺寸不一致的作品，怎样修复协作？

**EN**: Pieces use different sizes. Repair cooperation how?

- A. 确认统一尺寸，再分工调整。 / Agree on dimensions and assign corrections.
- B. 先增加成员人数，不讨论尺寸。 / Add members without discussing dimensions.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。尺寸不一致，是因为要求没说清；先统一尺寸并修改作品，比再增加一个人更有用。 / Correct. The issue is missing standards, not headcount.
- 选择 B 的反馈：这题不对。本题应选：确认统一尺寸，再分工调整。 尺寸不一致，是因为要求没说清；先统一尺寸并修改作品，比再增加一个人更有用。 / Not quite. The supported answer is: Agree on dimensions and assign corrections. The issue is missing standards, not headcount.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p03-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p03-V1-CHECK · 新背景迁移

**中**：老师评作品，怎样利用专业反馈？

**EN**: A teacher reviews work. How use the feedback?

- A. 认为请人看过就无需再修改。 / Assume review removes the need to revise.
- B. 按照大家说好的要求，讨论作品哪里要改。 / Discuss specific improvements against agreed criteria.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。老师已经指出哪里需要修改，把建议用到作品上，才让这次讨论真正帮助了合作。 / Correct. Collaboration includes using feedback, not mere involvement.
- 选择 A 的反馈：这题不对。本题应选：按照大家说好的要求，讨论作品哪里要改。 老师已经指出哪里需要修改，把建议用到作品上，才让这次讨论真正帮助了合作。 / Not quite. The supported answer is: Discuss specific improvements against agreed criteria. Collaboration includes using feedback, not mere involvement.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币三强调把不同技能组织起来，依照共同标准完成实际工作。合作不是人多就自动发生，需要分工、交流和尊重能力。

**EN**: The Three of Pentacles combines different skills under shared standards to accomplish work. Collaboration needs roles, communication, and respect for competence, not just more people.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p04"></a>
### p04 · 星币四 · Four of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p04.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents04.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币四的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Four of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币四通过抓紧已有资源寻求稳定和安全。保留必要储备有价值，但抓得太紧，也会让资源没法用在需要的地方；要看保留它是在保护生活，还是妨碍必要的事情。

**EN**: The Four of Pentacles seeks security by holding resources tightly. Reserves can help, but excessive holding restricts movement; examine the degree and purpose of control.

**中**：人物抱币、脚踩币、头顶币。多处抓紧的姿态帮助记住守住资源，不把所有节约都判成吝啬。

**EN**: A figure hugs a pentacle, pins two underfoot, and wears one overhead. The repeated holding supports remembering control without labeling all saving as stinginess.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关；数字四可以帮助记住稳定。结合人物紧抓星币的动作，可以记成：守住已有的东西、安全感、控制。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns resources; four suggests stability that can protect or constrain. Helpers: preservation, security, control.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：抱住、脚踩与头顶的星币 / pentacles held, pinned, and worn。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物抱币、脚踩币、头顶币。多处抓紧的姿态帮助记住守住资源，不把所有节约都判成吝啬。 / A figure hugs a pentacle, pins two underfoot, and wears one overhead. The repeated holding supports remembering control without labeling all saving as stinginess.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p04-Q1 · 核心理解

**中**：抓紧资源为什么需要看程度？

**EN**: Why examine how tightly resources are held?

- A. 留得越多越安全，使用会削弱安全感。 / Keeping more creates greater security, while using resources weakens that security.
- B. 留点储备能让人安心，但抓得太紧，也会妨碍必要的使用。 / Reserves protect; excessive control restricts use.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。保留资源可以带来安全感；但抓得太紧，也可能让你不敢做必要的事。 / Correct. The lesson recognizes both protection and restriction.
- 选择 A 的反馈：这题不对。这个解释把牌义带到了别处。保留资源可以带来安全感；但抓得太紧，也可能让你不敢做必要的事。 / Not quite. This interpretation shifts the card meaning elsewhere. The lesson recognizes both protection and restriction.


#### T2 · 先看一个有背景的应用示范

**中**：小程怕花钱，把必要课程材料也拒绝购买。放在建议位，可以先留好生活需要的钱，再从预算里安排必要的材料费用；不需要一下把钱全花光。

**EN**: Cheng fears spending and refuses essential course materials. Advice distinguishes reserves from reasonable use, allowing purposeful spending while preserving a minimum.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p04-Q2 · 应用理解

**中**：连必要材料也不买，建议是什么？

**EN**: Essential materials are refused. What fits?

- A. 先留好生活需要的钱，再安排付得起的材料费用。 / Separate minimum reserves from affordable essentials.
- B. 先把想买的材料列齐，再从储备里一次购入。 / List the desired materials and purchase them together from the reserve.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。可以在预算内支付必要费用，不需要一下把存款全花掉。 / Correct. Adjusting control does not require the opposite extreme.
- 选择 B 的反馈：这题不对。这样做会漏掉题目里的关键一步。可以在预算内支付必要费用，不需要一下把存款全花掉。 / Not quite. This action skips a key step in the question. Adjusting control does not require the opposite extreme.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小程开始设定可用预算，不再把每一笔支出都当成危险。这个例子里，星币四逆位表示开始放松过度的控制，愿意合理使用资源；不表示任何花费都合理。

**EN**: Cheng sets a usable budget instead of treating every expense as danger. Reversal here means loosening excessive control, not approving every purchase.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p04-Q3 · 有背景的逆位

**中**：开始用预算允许合理支出，逆位指什么？

**EN**: A budget allows reasonable spending. Reversal?

- A. 预算内的支出风险较低，可以省去用途检查。 / Spending within the budget carries less risk, so the purpose does not need review.
- B. 开始不再抓得那么紧，愿意合理花费了。 / Excessive holding is loosening.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。愿意花必要的钱，不表示不看预算；先留好生活费用，再决定怎么使用。 / Correct. Less control still requires practical judgment.
- 选择 A 的反馈：这题不对。这个说法混淆了题目正在考的含义。愿意花必要的钱，不表示不看预算；先留好生活费用，再决定怎么使用。 / Not quite. This statement confuses the meaning being tested. Less control still requires practical judgment.


#### p04-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：保留资源可以带来安全感；但抓得太紧，也可能让你不敢做必要的事。

**EN**: The lesson recognizes both protection and restriction.

**中**：留好必要储备后，也可以使用一部分资源；不必把每一次使用都当成危险。

**EN**: Security can coexist with measured use.


#### p04-R1-CHECK · 换个例子确认

**中**：“留好储备”与“什么都不能用”相同吗？

**EN**: Are keeping reserves and using nothing the same?

- A. 不同，留好储备后，也可以把一部分用在需要的地方。 / No; resources beyond reserves can have sensible uses.
- B. 相同，储备的意义就是暂时不动用这笔钱。 / They are the same because a reserve is meant to remain untouched for now.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。留好必要储备后，也可以使用一部分资源；不必把每一次使用都当成危险。 / Correct. Security can coexist with measured use.
- 选择 B 的反馈：这题不对。这个解释把牌义带到了别处。留好必要储备后，也可以使用一部分资源；不必把每一次使用都当成危险。 / Not quite. This interpretation shifts the card meaning elsewhere. Security can coexist with measured use.


#### p04-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：可以在预算内支付必要费用，不需要一下把存款全花掉。

**EN**: Adjusting control does not require the opposite extreme.

**中**：借用时约好归还时间和维护方式，既能保护器材，也不必拒绝所有借用。

**EN**: Rules can protect resources without blocking all use.


#### p04-R2-CHECK · 换个例子确认

**中**：团队囤着设备不许合理借用，怎样调整？

**EN**: Equipment is hoarded despite reasonable needs. What fits?

- A. 继续由熟悉设备的人保管，需要时由他决定是否外借。 / Keep the equipment with the person who knows it best and let that person decide on loans.
- B. 建立借用与归还规则，让资源可用。 / Set borrowing and return rules so resources can be used.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。借用时约好归还时间和维护方式，既能保护器材，也不必拒绝所有借用。 / Correct. Rules can protect resources without blocking all use.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。借用时约好归还时间和维护方式，既能保护器材，也不必拒绝所有借用。 / Not quite. This action skips a key step in the question. Rules can protect resources without blocking all use.


#### p04-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小程开始设定可用预算，不再把每一笔支出都当成危险。这个例子里，星币四逆位表示开始放松过度的控制，愿意合理使用资源；不表示任何花费都合理。

**EN**: Cheng sets a usable budget instead of treating every expense as danger. Reversal here means loosening excessive control, not approving every purchase.

**中**：先留好生活费，再支付必要的学习费用；放松一点不等于放弃所有保障。

**EN**: Adjusting control need not abandon practical security.


#### p04-R3-CHECK · 逆位纠错后续题

**中**：控制松动后，怎样避免走到另一极端？

**EN**: After loosening control, avoid the opposite extreme how?

- A. 先把过去没花的钱补回到学习投入里，再恢复储备。 / Move the previously unspent money into study expenses before rebuilding the reserve.
- B. 先留好生活费，再看哪些学习费用确实需要支付。 / Preserve essentials and use resources purposefully.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。先留好生活费，再支付必要的学习费用；放松一点不等于放弃所有保障。 / Correct. Adjusting control need not abandon practical security.
- 选择 A 的反馈：这题不对。先别按这个做法继续；先留好生活费，再支付必要的学习费用；放松一点不等于放弃所有保障。 / Not quite. Do not continue with this approach yet; Adjusting control need not abandon practical security.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p04-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p04-V1-CHECK · 新背景迁移

**中**：时间全部排满、不留余地，星币四提醒我们检查什么？

**EN**: Every minute is locked down with no flexibility. Apply.

- A. 保留关键安排并留出可调整部分。 / Keep essentials and allow some adjustment.
- B. 把控制越紧直接等同于越有效。 / Equate tighter control with greater effectiveness.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。如果日程定得太死，连必要调整都做不了，就要看看这套安排是否还在帮助你。 / Correct. Holding tightly must be judged by practical effects.
- 选择 B 的反馈：这题不对。本题应选：保留关键安排并留出可调整部分。 如果日程定得太死，连必要调整都做不了，就要看看这套安排是否还在帮助你。 / Not quite. The supported answer is: Keep essentials and allow some adjustment. Holding tightly must be judged by practical effects.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币四通过抓紧已有资源寻求稳定和安全。保留必要储备有价值，但抓得太紧，也会让资源没法用在需要的地方；要看保留它是在保护生活，还是妨碍必要的事情。

**EN**: The Four of Pentacles seeks security by holding resources tightly. Reserves can help, but excessive holding restricts movement; examine the degree and purpose of control.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p05"></a>
### p05 · 星币五 · Five of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p05.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents05.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币五的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Five of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币五关注现实资源不足或缺少支持的困难。先看见眼前缺少什么，再寻找能够获得的帮助，不把困境归结成个人不够努力，也不预测必然破产。

**EN**: The Five of Pentacles concerns material hardship or insufficient support. Identify needs and available help without blaming effort or predicting inevitable ruin.

**中**：雪地中的两人经过明亮的窗，困难与支持之间存在距离。窗让我们想到寻找支持，但画面不保证门一定为他们开放。

**EN**: Two people pass a lit window in snow. The distance suggests looking for support without proving access is guaranteed.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关；数字五可以帮助记住遇到困难、原来的稳定被打乱。这张牌可以记成：资源不足、生活困难、缺少支持。不能凭它诊断疾病。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns material conditions; five suggests disruption without diagnosing health. Helpers: scarcity, hardship, insufficient support.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：雪地人物与明亮窗户 / the figures in snow and illuminated window。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：雪地中的两人经过明亮的窗，困难与支持之间存在距离。窗让我们想到寻找支持，但画面不保证门一定为他们开放。 / Two people pass a lit window in snow. The distance suggests looking for support without proving access is guaranteed.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p05-Q1 · 核心理解

**中**：星币五先让我们看见什么问题？

**EN**: What does this lesson first examine?

- A. 眼前缺少什么，以及需要哪些帮助。 / Practical needs and gaps in support.
- B. 困难反映个人准备不足，应先加强自律再考虑求助。 / Difficulty reflects poor preparation, so improve discipline before seeking support.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。缺少教材，需要解决教材从哪里来；不能因此认定这个人不努力。 / Correct. Resource gaps need practical responses, not moral blame.
- 选择 B 的反馈：这题不对。这里要分清牌义的边界：缺少教材，需要解决教材从哪里来；不能因此认定这个人不努力。 / Not quite. The boundary of the card meaning matters here: Resource gaps need practical responses, not moral blame.


#### T2 · 先看一个有背景的应用示范

**中**：小唐缺教材，跟不上课程。建议位先确认最急需的材料，再查询借阅或课程提供的支持；“只劝自己积极一点”不能代替教材。

**EN**: Tang lacks course materials and falls behind. Advice identifies urgent needs and checks borrowing or course support; optimism cannot replace the materials.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p05-Q2 · 应用理解

**中**：缺教材影响学习，先怎样？

**EN**: Missing materials disrupt learning. First?

- A. 先用已有内容继续学习，等课程结束再补齐教材。 / Continue with the materials on hand and replace the missing texts after the course.
- B. 查清缺哪些教材，再找可以借阅的地方。 / Identify missing materials and borrowing support.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。这次缺的是教材，借阅、申请援助等办法才能直接解决；只鼓励自己还不够。 / Correct. The practical gap requires actual resources.
- 选择 A 的反馈：这题不对。这个做法没有解决眼前的情况。这次缺的是教材，借阅、申请援助等办法才能直接解决；只鼓励自己还不够。 / Not quite. This action does not resolve the situation described. The practical gap requires actual resources.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小唐借到了教材，也得到辅导，眼前的学习条件改善了。这个例子里，星币五逆位表示困难逐步得到缓解，不表示此后不会再缺少资源或支持。

**EN**: Tang obtains materials and tutoring. Here reversal suggests improving support and circumstances, not the absence of every future constraint.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p05-Q3 · 有背景的逆位

**中**：已借到材料并获得辅导，逆位怎么读？

**EN**: Materials and tutoring become available. Reversal?

- A. 支持增加，困难开始改善。 / Support grows and hardship begins easing.
- B. 获得辅导说明问题已经过去，可以降低后续投入。 / Receiving tutoring means the problem has passed, so later effort can be reduced.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。借到教材、得到辅导，让眼前的困难有了改善；并不保证以后不会再遇到困难。 / Correct. Improved conditions are not a permanent guarantee.
- 选择 B 的反馈：这题不对。先别按这个做法继续；借到教材、得到辅导，让眼前的困难有了改善；并不保证以后不会再遇到困难。 / Not quite. Do not continue with this approach yet; Improved conditions are not a permanent guarantee.


#### p05-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：缺少教材，需要解决教材从哪里来；不能因此认定这个人不努力。

**EN**: Resource gaps need practical responses, not moral blame.

**中**：一个人暂时缺钱或缺支持，需要的是帮助；这不能说明他比别人差。

**EN**: The theme concerns needs, not personal worth.


#### p05-R1-CHECK · 换个例子确认

**中**：看到“支持不足”，下一步应该找什么？

**EN**: Insufficient support: what should be identified?

- A. 寻找证明自己不值得帮助的理由。 / Reasons why one does not deserve help.
- B. 具体缺什么，以及哪里可能提供。 / What is missing and where it may be available.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。一个人暂时缺钱或缺支持，需要的是帮助；这不能说明他比别人差。 / Correct. The theme concerns needs, not personal worth.
- 选择 A 的反馈：这题不对。本题应选：具体缺什么，以及哪里可能提供。 一个人暂时缺钱或缺支持，需要的是帮助；这不能说明他比别人差。 / Not quite. The supported answer is: What is missing and where it may be available. The theme concerns needs, not personal worth.


#### p05-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：这次缺的是教材，借阅、申请援助等办法才能直接解决；只鼓励自己还不够。

**EN**: The practical gap requires actual resources.

**中**：社团已知缺少活动场地，先查可借用的场地才有帮助；心情变好也不会自动多出场地。

**EN**: Missing space is a concrete condition, not an enthusiasm problem.


#### p05-R2-CHECK · 换个例子确认

**中**：社团没有场地，活动办不下去，按照星币五的提醒，先做什么？

**EN**: A club lacks space and stalls. Apply.

- A. 查询可借场地与实际使用条件。 / Check available spaces and access conditions.
- B. 只责备成员缺少热情。 / Blame members for insufficient enthusiasm.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。社团已知缺少活动场地，先查可借用的场地才有帮助；心情变好也不会自动多出场地。 / Correct. Missing space is a concrete condition, not an enthusiasm problem.
- 选择 B 的反馈：这题不对。本题应选：查询可借场地与实际使用条件。 社团已知缺少活动场地，先查可借用的场地才有帮助；心情变好也不会自动多出场地。 / Not quite. The supported answer is: Check available spaces and access conditions. Missing space is a concrete condition, not an enthusiasm problem.


#### p05-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小唐借到了教材，也得到辅导，眼前的学习条件改善了。这个例子里，星币五逆位表示困难逐步得到缓解，不表示此后不会再缺少资源或支持。

**EN**: Tang obtains materials and tutoring. Here reversal suggests improving support and circumstances, not the absence of every future constraint.

**中**：得到设备或教材后，更容易继续学习，但作业和练习仍要自己完成。

**EN**: Support improves conditions without completing every task.


#### p05-R3-CHECK · 逆位纠错后续题

**中**：得到支持后仍有作业要完成，怎样理解？

**EN**: Work remains after receiving support. Interpret.

- A. 有了教材和帮助，就更方便继续学习，但作业仍要自己做。 / Better conditions create a basis for action.
- B. 帮助没有直接减少作业量，说明作用比较有限。 / Because the help did not reduce the assignment load, its value is limited.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。得到设备或教材后，更容易继续学习，但作业和练习仍要自己完成。 / Correct. Support improves conditions without completing every task.
- 选择 B 的反馈：这题不对。这样做会漏掉题目里的关键一步。得到设备或教材后，更容易继续学习，但作业和练习仍要自己完成。 / Not quite. This action skips a key step in the question. Support improves conditions without completing every task.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p05-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p05-V1-CHECK · 新背景迁移

**中**：设备损坏使作业做不了，先怎样？

**EN**: Broken equipment prevents work. First?

- A. 先暂停作业，等自己的设备修好后再继续。 / Pause the assignment and wait for the original device to be repaired.
- B. 确认临时借用或替代设备。 / Check temporary loans or replacement access.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。先问清有没有设备可以借、有没有维修帮助，才能知道下一步有哪些办法。 / Correct. Available support needs checking first.
- 选择 A 的反馈：这题不对。先别按这个做法继续；先问清有没有设备可以借、有没有维修帮助，才能知道下一步有哪些办法。 / Not quite. Do not continue with this approach yet; Available support needs checking first.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币五关注现实资源不足或缺少支持的困难。先看见眼前缺少什么，再寻找能够获得的帮助，不把困境归结成个人不够努力，也不预测必然破产。

**EN**: The Five of Pentacles concerns material hardship or insufficient support. Identify needs and available help without blaming effort or predicting inevitable ruin.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p06"></a>
### p06 · 星币六 · Six of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p06.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents06.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币六的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Six of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币六讨论给予、接受和资源如何分配。援助可能有用，但给予者往往掌握更多决定权，需要说清条件与双方可接受的范围。

**EN**: The Six of Pentacles concerns giving, receiving, and allocation. Assistance can help, but the giver often has more decision power; clarify conditions and acceptable limits.

**中**：一人持秤并发放钱币，两人接受帮助。一人决定把钱给谁，另两人等待接受；这个画面提醒我们，给予者和接受者手里的选择并不一样多。

**EN**: A person holds scales and distributes coins to two recipients. Resource flow and unequal positions together illustrate allocation power.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关。数字六可以帮助记住人与人之间的给予和接受，但公平与否还要看实际条件。这张牌可以记成：给予、接受、分配、相互帮助。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns resources; six helps remember exchange without guaranteeing fairness. Helpers: giving, receiving, allocation, reciprocity.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：秤、给出的钱币和接受者 / scales, distributed coins, and recipients。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：一人持秤并发放钱币，两人接受帮助。一人决定把钱给谁，另两人等待接受；这个画面提醒我们，给予者和接受者手里的选择并不一样多。 / A person holds scales and distributes coins to two recipients. Resource flow and unequal positions together illustrate allocation power.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p06-Q1 · 核心理解

**中**：有人愿意提供帮助，就一定公平吗？

**EN**: Is giving automatically fair?

- A. 比较公平，愿意提供资源通常已经承担了较多责任。 / It is fairly balanced because the person providing resources has usually taken on more responsibility.
- B. 不一定，要看谁决定给谁、附带什么条件。 / Not necessarily; examine conditions and power.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。有人愿意帮忙，不代表条件一定公平；还要看对方要求你付出什么、你能不能拒绝。 / Correct. Resource flow does not guarantee balanced power or conditions.
- 选择 A 的反馈：这题不对。先核对眼前例子的条件：有人愿意帮忙，不代表条件一定公平；还要看对方要求你付出什么、你能不能拒绝。 / Not quite. Check the conditions in this example first: Resource flow does not guarantee balanced power or conditions.


#### T2 · 先看一个有背景的应用示范

**中**：同学愿借小顾设备，但要求约定归还时间。建议位说清借用期限和责任，确认双方接受，再决定是否借；接受帮助并不意味着失去一切边界。

**EN**: A classmate offers Gu equipment with an agreed return date. Advice clarifies duration and responsibility so both can consent; receiving help does not erase boundaries.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p06-Q2 · 应用理解

**中**：借设备时先说清什么？

**EN**: What should equipment borrowers clarify?

- A. 期限、责任和双方可接受的条件。 / Duration, responsibility, and acceptable terms.
- B. 先表达感谢，具体期限和责任等使用后再谈。 / Express gratitude first and discuss the deadline and responsibility after using the equipment.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。接受帮助后要遵守说好的约定，但不表示以后必须答应对方所有要求。 / Correct. Reciprocity needs clear terms, not unlimited obligation.
- 选择 B 的反馈：这题不对。这个解释把牌义带到了别处。接受帮助后要遵守说好的约定，但不表示以后必须答应对方所有要求。 / Not quite. This interpretation shifts the card meaning elsewhere. Reciprocity needs clear terms, not unlimited obligation.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：有人提供帮助后，又追加事先没说、接受者也难以承担的要求。这个例子里，星币六逆位表示双方付出和接受的条件不合适，需要重新讨论；接受帮助不表示必须答应所有追加要求。

**EN**: Help comes with excessive conditions revealed only later, making refusal difficult. Here reversal concerns unequal demands and calls for renegotiation.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p06-Q3 · 有背景的逆位

**中**：援助后来附加过量要求，逆位提示什么？

**EN**: Excessive demands are added later. Reversal?

- A. 既然接受过帮助，就失去拒绝权。 / Receiving help removes the right to refuse.
- B. 追加的要求不合适，需要重新商量。 / Conditions are unbalanced and need renegotiation.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。接受了帮助，也可以拒绝事先没说、自己又承担不了的要求；需要重新谈清双方的约定。 / Correct. Receiving resources does not mean surrendering boundaries.
- 选择 A 的反馈：这题不对。本题应选：追加的要求不合适，需要重新商量。 接受了帮助，也可以拒绝事先没说、自己又承担不了的要求；需要重新谈清双方的约定。 / Not quite. The supported answer is: Conditions are unbalanced and need renegotiation. Receiving resources does not mean surrendering boundaries.


#### p06-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：有人愿意帮忙，不代表条件一定公平；还要看对方要求你付出什么、你能不能拒绝。

**EN**: Resource flow does not guarantee balanced power or conditions.

**中**：这份帮助是否合适，要看对方附带什么要求，以及接受者能否承担。

**EN**: The effect of help depends on recipients’ circumstances.


#### p06-R1-CHECK · 换个例子确认

**中**：为什么要同时看给的人和收的人？

**EN**: Why look at giver and recipient?

- A. 谁决定怎么分、附带什么条件，都会影响双方能不能接受或拒绝。 / Allocation affects both parties’ choices.
- B. 重点看提供者是否付出了足够资源，接受者的处境可以之后再谈。 / Focus on whether the giver contributed enough; discuss the recipient's circumstances later.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。这份帮助是否合适，要看对方附带什么要求，以及接受者能否承担。 / Correct. The effect of help depends on recipients’ circumstances.
- 选择 B 的反馈：这题不对。只看提供者给了多少，会漏掉接受者是否承担得起条件。星币六要同时看谁决定分配、附带什么要求，以及双方能否接受或拒绝。 / Not quite. Looking only at how much the giver contributes misses whether the recipient can bear the conditions. The Six of Pentacles also asks who controls allocation, what terms apply, and whether both sides can accept or refuse.


#### p06-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：接受帮助后要遵守说好的约定，但不表示以后必须答应对方所有要求。

**EN**: Reciprocity needs clear terms, not unlimited obligation.

**中**：先说好辅导的时间、内容和双方各自承担的事情，才知道这份帮助是否合适。

**EN**: Clear scope protects both parties.


#### p06-R2-CHECK · 换个例子确认

**中**：学长提供辅导，怎样把合作说清？

**EN**: A senior offers tutoring. How clarify it?

- A. 先接受辅导，等对方提出回报时再决定如何回应。 / Accept the tutoring first and decide how to respond when the other person asks for something in return.
- B. 说好辅导的时间、内容，以及对方希望你怎样回报。 / Agree on time, scope, and feasible reciprocity.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。先说好辅导的时间、内容和双方各自承担的事情，才知道这份帮助是否合适。 / Correct. Clear scope protects both parties.
- 选择 A 的反馈：这题不对。帮助不能只说“我来辅导”；先约定时间、内容和回报，双方才知道这份支持是否合适。 / Not quite. Help needs more than an offer to tutor; agree on time, content, and return so both sides know whether the support is workable.


#### p06-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：有人提供帮助后，又追加事先没说、接受者也难以承担的要求。这个例子里，星币六逆位表示双方付出和接受的条件不合适，需要重新讨论；接受帮助不表示必须答应所有追加要求。

**EN**: Help comes with excessive conditions revealed only later, making refusal difficult. Here reversal concerns unequal demands and calls for renegotiation.

**中**：对方后来追加的要求，如果超出了原来的约定，就应该重新讨论；接受过帮助不表示必须全部答应。

**EN**: Giving and receiving both need boundaries.


#### p06-R3-CHECK · 逆位纠错后续题

**中**：后加的要求超过可承担范围，怎样处理？

**EN**: Added conditions exceed capacity. What next?

- A. 继续答应这次，等回报完成后再说明压力。 / Agree this time and explain the pressure after the return favor is complete.
- B. 说清哪些要求自己做不到，再商量双方都能接受的条件。 / State limits and renegotiate acceptable terms.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。对方后来追加的要求，如果超出了原来的约定，就应该重新讨论；接受过帮助不表示必须全部答应。 / Correct. Giving and receiving both need boundaries.
- 选择 A 的反馈：这题不对。这个做法没有解决眼前的情况。对方后来追加的要求，如果超出了原来的约定，就应该重新讨论；接受过帮助不表示必须全部答应。 / Not quite. This action does not resolve the situation described. Giving and receiving both need boundaries.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p06-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p06-V1-CHECK · 新背景迁移

**中**：分配公共工具时，怎样运用星币六讲的公平分配？

**EN**: Allocating shared tools: apply.

- A. 说明分配标准和归还规则。 / Explain allocation and return rules.
- B. 只看谁掌管工具就让谁任意变规则。 / Let whoever holds them change rules arbitrarily.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。分配公用工具时，要说清谁可以用、按什么顺序用，不能只由掌管工具的人随意决定。 / Correct. The theme examines the conditions and power of allocation.
- 选择 B 的反馈：这题不对。本题应选：说明分配标准和归还规则。 分配公用工具时，要说清谁可以用、按什么顺序用，不能只由掌管工具的人随意决定。 / Not quite. The supported answer is: Explain allocation and return rules. The theme examines the conditions and power of allocation.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币六讨论给予、接受和资源如何分配。援助可能有用，但给予者往往掌握更多决定权，需要说清条件与双方可接受的范围。

**EN**: The Six of Pentacles concerns giving, receiving, and allocation. Assistance can help, but the giver often has more decision power; clarify conditions and acceptable limits.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p07"></a>
### p07 · 星币七 · Seven of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p07.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents07.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币七的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Seven of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币七是在投入一段时间后停下来，看看已经做出了什么、花了多少时间和精力，再决定接下来怎么做。耐心不等于一直照旧做；如果方法没有帮助，就需要检查和调整。

**EN**: The Seven of Pentacles pauses after sustained investment to assess results, costs, and direction. Patience works with evaluation, not endless commitment to ineffective effort.

**中**：人物靠着工具望向作物上的星币，当前动作是查看而非正在采收。可用它记住：做了一段时间后，停下来看看效果，不据此断言收获日期。

**EN**: A figure leans on a tool and looks at pentacles on a plant. The current action is assessing rather than harvesting, not predicting a harvest date.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关。这张牌先看人物停下来查看作物的动作，不能只用数字七推定结果。可以记成：检查效果、耐心、付出与收获。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns investment and results; seven offers a structural reminder of assessment. Helpers: evaluation, patience, return on effort.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：倚靠工具的人与注视的作物 / the figure leaning on a tool and examining the crop。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物靠着工具望向作物上的星币，当前动作是查看而非正在采收。可用它记住：做了一段时间后，停下来看看效果，不据此断言收获日期。 / A figure leans on a tool and looks at pentacles on a plant. The current action is assessing rather than harvesting, not predicting a harvest date.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p07-Q1 · 核心理解

**中**：按照星币七的提醒，怎样做才算有耐心地坚持？

**EN**: How do patience and evaluation relate?

- A. 坚持做，也定期看看方法有没有效果。 / Invest patiently and periodically check results.
- B. 只计算自己坚持了多久，不检查方法有没有效果。 / Count how long you have persisted without checking whether the method works.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。先看看方法有没有帮助，再决定继续还是调整；这不是轻易放弃，而是让后面的努力更有方向。 / Correct. Review informs continuation rather than automatic quitting.
- 选择 B 的反馈：这题不对。只计算坚持时间却不看效果，缺少星币七强调的阶段检查与方法调整。 / Not quite. Counting elapsed time without checking results misses the Seven of Pentacles’ review of whether the method works.


#### T2 · 先看一个有背景的应用示范

**中**：小胡复习三周后，某类题仍错得多。建议位先看错题记录，判断方法哪里有效、哪里需改，再决定下一轮投入。

**EN**: After three weeks of study, Hu still misses one type of problem. Advice reviews errors and evaluates the method before committing to the next round.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p07-Q2 · 应用理解

**中**：复习三周仍反复错一类题，先怎样？

**EN**: The same errors persist after three weeks. First?

- A. 只把原来的时长再加倍，不查看原因。 / Double the hours without looking at causes.
- B. 检查错题和方法效果。 / Review errors and method effectiveness.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。已经学了三周却总错在同一处，就先检查错题和练习方法，再决定下一步怎么练。 / Correct. The example evaluates investment before extending it.
- 选择 A 的反馈：这题不对。本题应选：检查错题和方法效果。 已经学了三周却总错在同一处，就先检查错题和练习方法，再决定下一步怎么练。 / Not quite. The supported answer is: Review errors and method effectiveness. The example evaluates investment before extending it.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小胡已经发现方法没有效果，却因为花了很多时间而不愿调整。这个例子里，星币七逆位提醒我们：没有效果的做法还在耗时间，应该重新检查。已经花了多少时间，不能单独成为继续照旧做的理由。

**EN**: Hu keeps an ineffective method solely because much time was spent. Here reversal concerns ongoing unproductive investment, calling for reassessment rather than sunk-cost justification.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p07-Q3 · 有背景的逆位

**中**：因已花很多时间就拒绝改法，逆位提示什么？

**EN**: Past time spent becomes the only reason to continue. Reversal?

- A. 重新看看这套方法有没有帮助，值不值得继续花时间。 / Reassess whether future investment is worthwhile.
- B. 过去花得越多，未来越不准调整。 / More past effort forbids future adjustments.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。已经花过的时间收不回来，但接下来要不要继续，还得看这套方法有没有帮助。 / Correct. Past cost cannot replace assessing future effectiveness.
- 选择 B 的反馈：这题不对。本题应选：重新看看这套方法有没有帮助，值不值得继续花时间。 已经花过的时间收不回来，但接下来要不要继续，还得看这套方法有没有帮助。 / Not quite. The supported answer is: Reassess whether future investment is worthwhile. Past cost cannot replace assessing future effectiveness.


#### p07-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：先看看方法有没有帮助，再决定继续还是调整；这不是轻易放弃，而是让后面的努力更有方向。

**EN**: Review informs continuation rather than automatic quitting.

**中**：停下来检查方法，不等于放弃；找到问题后，反而更知道该怎样继续。

**EN**: Evaluation can support more purposeful persistence.


#### p07-R1-CHECK · 换个例子确认

**中**：暂停查看成果，是不是一定放弃？

**EN**: Does reviewing results necessarily mean quitting?

- A. 是，检查成果会打断节奏，耐心应体现在持续重复。 / Yes. Reviewing results interrupts the rhythm, while patience is shown through continued repetition.
- B. 不是，是为了看看哪些做法可以继续、哪些需要改。 / No; it informs what to keep or change.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。停下来检查方法，不等于放弃；找到问题后，反而更知道该怎样继续。 / Correct. Evaluation can support more purposeful persistence.
- 选择 A 的反馈：这题不对。先核对眼前例子的条件：停下来检查方法，不等于放弃；找到问题后，反而更知道该怎样继续。 / Not quite. Check the conditions in this example first: Evaluation can support more purposeful persistence.


#### p07-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：已经学了三周却总错在同一处，就先检查错题和练习方法，再决定下一步怎么练。

**EN**: The example evaluates investment before extending it.

**中**：练得久不表示练得有效；还要看哪里进步了、哪里仍然卡住。

**EN**: Duration and results need separate examination.


#### p07-R2-CHECK · 换个例子确认

**中**：练了一段时间口语，不知道有没有进步，按照星币七的提醒，应该怎样检查？

**EN**: Progress after speaking practice is unclear. What fits?

- A. 对照录音检查具体变化，再调整。 / Compare recordings, identify changes, and adjust.
- B. 先按练习时长判断，等课程结束再听录音。 / Judge progress from practice time and listen to the recordings after the course ends.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。练得久不表示练得有效；还要看哪里进步了、哪里仍然卡住。 / Correct. Duration and results need separate examination.
- 选择 B 的反馈：这题不对。这样做会漏掉题目里的关键一步。练得久不表示练得有效；还要看哪里进步了、哪里仍然卡住。 / Not quite. This action skips a key step in the question. Duration and results need separate examination.


#### p07-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小胡已经发现方法没有效果，却因为花了很多时间而不愿调整。这个例子里，星币七逆位提醒我们：没有效果的做法还在耗时间，应该重新检查。已经花了多少时间，不能单独成为继续照旧做的理由。

**EN**: Hu keeps an ineffective method solely because much time was spent. Here reversal concerns ongoing unproductive investment, calling for reassessment rather than sunk-cost justification.

**中**：决定明天怎么练，要看当前方法有没有效果，不能只因为已经练了很久就照旧做。

**EN**: Future choices depend on effectiveness, not sunk costs alone.


#### p07-R3-CHECK · 逆位纠错后续题

**中**：检查证实旧方法无效，下一步是什么？

**EN**: Review confirms the old method is ineffective. What next?

- A. 根据已经检查出的结果，调整接下来怎么练。 / Adjust future effort based on results.
- B. 只因已经投入很多就拒绝修改。 / Refuse change because much was invested.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。决定明天怎么练，要看当前方法有没有效果，不能只因为已经练了很久就照旧做。 / Correct. Future choices depend on effectiveness, not sunk costs alone.
- 选择 B 的反馈：这题不对。本题应选：根据已经检查出的结果，调整接下来怎么练。 决定明天怎么练，要看当前方法有没有效果，不能只因为已经练了很久就照旧做。 / Not quite. The supported answer is: Adjust future effort based on results. Future choices depend on effectiveness, not sunk costs alone.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p07-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p07-V1-CHECK · 新背景迁移

**中**：种了几周植物，按照星币七的提醒，怎样决定接下来怎么照料？

**EN**: Weeks into growing a plant, apply the theme.

- A. 不看植物的情况，只管不断增加浇水和施肥。 / Increase input indefinitely regardless of conditions.
- B. 查看生长条件和变化，决定下一步。 / Review conditions and growth before deciding.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。先看看植物长得怎样、土壤和光照是否合适，再调整照料；不能因为长得慢就一味增加浇水。 / Correct. Reviewing outcomes and conditions fits better than blind escalation.
- 选择 A 的反馈：这题不对。本题应选：查看生长条件和变化，决定下一步。 先看看植物长得怎样、土壤和光照是否合适，再调整照料；不能因为长得慢就一味增加浇水。 / Not quite. The supported answer is: Review conditions and growth before deciding. Reviewing outcomes and conditions fits better than blind escalation.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币七是在投入一段时间后停下来，看看已经做出了什么、花了多少时间和精力，再决定接下来怎么做。耐心不等于一直照旧做；如果方法没有帮助，就需要检查和调整。

**EN**: The Seven of Pentacles pauses after sustained investment to assess results, costs, and direction. Patience works with evaluation, not endless commitment to ineffective effort.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p08"></a>
### p08 · 星币八 · Eight of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p08.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents08.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币八的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Eight of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币八表示认真做事、练习技能，并把细节做好。它强调的不只是花了多少时间，还包括动作有没有更熟练、作品有没有做得更好；忙碌或反复做很多次，不一定就是进步。

**EN**: The Eight of Pentacles concerns dedicated work, learning skills, and refining quality. Practice, attention, and detail support each other; busyness or repetition alone does not prove improvement.

**中**：工匠正在雕刻星币，旁边已有完成的作品。用“正在做”和“已经做过”一起记住：认真练习，把手里的活做细致。

**EN**: A craftsperson engraves a pentacle beside completed pieces. Remember both work in progress and earlier work: practise attentively and take care with the details.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关。这里用工匠做作品的画面，帮助记住手艺需要认真练习；不能只凭数字八猜出整张牌的意思。可以用“专注、练习、不断改进、细心”帮助记忆。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth focuses attention on tangible work and quality; eight alone cannot generate the meaning. Focus, skill learning, detail, and refinement can help you remember the card.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：正在雕刻的手、工具与已完成作品 / the working hands, tool, and completed pieces。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：工匠正在雕刻星币，旁边已有完成的作品。用“正在做”和“已经做过”一起记住：认真练习，把手里的活做细致。 / A craftsperson engraves a pentacle beside completed pieces. Remember both work in progress and earlier work: practise attentively and take care with the details.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p08-Q1 · 核心理解

**中**：哪句话把星币八的意思说完整？

**EN**: Which captures this lesson?

- A. 保持高频重复，熟练会随着次数慢慢出现。 / Keep repeating at a high frequency and let fluency emerge from repetition.
- B. 认真练习，把动作做熟，把细节做好。 / Attend to skill and detail to improve work quality.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。不只是花时间做，还要看动作有没有更熟练、作品有没有做得更细致。 / Correct. Time spent is not enough: check whether your technique is becoming more fluent and your work more carefully finished.
- 选择 A 的反馈：这题不对。这里要分清牌义的边界：不只是花时间做，还要看动作有没有更熟练、作品有没有做得更细致。 / Not quite. The boundary of the card meaning matters here: Time spent is not enough: check whether your technique is becoming more fluent and your work more carefully finished.


#### T2 · 先看一个有背景的应用示范

**中**：小青练琴，总在同一小节出错。星币八在建议位，可以建议先把那一小节单独拿出来慢练，找出错在哪里，改好后再连起来弹整首。

**EN**: Qing keeps making mistakes in the same musical passage. As advice, Eight of Pentacles suggests practising that passage slowly on its own, finding and correcting the mistakes, then playing it within the whole piece.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p08-Q2 · 应用理解

**中**：同一小节反复出错，按照刚才的例子，哪种练法更合适？

**EN**: The same passage repeatedly fails. Which follows?

- A. 分段慢练，检查动作再连回全曲。 / Practice slowly in isolation, check technique, then reintegrate.
- B. 不看错在哪里，只增加整曲重复次数。 / Increase full repetitions without examining the error.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。把总出错的部分拆开慢练，并检查动作，才能知道哪里错了、怎样练得更熟。 / Correct. Slow down the difficult passage and check your technique to identify errors and practise more accurately.
- 选择 B 的反馈：这题不对。本题应选：分段慢练，检查动作再连回全曲。 把总出错的部分拆开慢练，并检查动作，才能知道哪里错了、怎样练得更熟。 / Not quite. The supported answer is: Practice slowly in isolation, check technique, then reintegrate. Slow down the difficult passage and check your technique to identify errors and practise more accurately.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小青每天把同一段曲子反复弹，却一直不检查出错的地方。这个例子里，星币八逆位表示花了很多时间，却没有把细节练好，需要检查错误、调整练法。其他情况下也可能涉及对细节过分苛求，但这里没有这样的背景，不能硬套。

**EN**: Qing repeats mechanically without examining mistakes. Here reversal concerns effort disconnected from quality. Overpolishing belongs to another context and is not simultaneously imposed.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p08-Q3 · 有背景的逆位

**中**：同一段曲子反复弹，却不检查错误。这里的星币八逆位提醒了什么问题？

**EN**: The same passage is played repeatedly without checking mistakes. What problem does the reversed Eight of Pentacles highlight here?

- A. 练了很久还没有进步，说明更适合换一种技能学习。 / Lack of progress after long practice suggests switching to a different skill.
- B. 花了很多时间，动作却没有练得更准确。 / Effort is disconnected from learning quality.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。问题是同一个错误一直没有纠正；需要换一种练法，不是认定自己学不会。 / Correct. The issue is ineffective practice, not learning itself.
- 选择 A 的反馈：这题不对。本题应选：花了很多时间，动作却没有练得更准确。 题目已经指出他没有检查错误，所以先改练法、看动作是否变准；不能仅凭这段时间没进步，就换掉要学的技能。 / Not quite. The supported answer is: Effort is disconnected from learning quality. The prompt says mistakes were not checked, so revise the practice method and see whether accuracy improves before abandoning the skill.


#### p08-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：不只是花时间做，还要看动作有没有更熟练、作品有没有做得更细致。

**EN**: Time spent is not enough: check whether your technique is becoming more fluent and your work more carefully finished.

**中**：次数只能说明你练过多少遍；还要检查错误有没有减少，才能知道有没有进步。

**EN**: Counts record effort but do not alone prove improvement.


#### p08-R1-CHECK · 换个例子确认

**中**：“重复很多次”和“确实进步了”有什么不同？

**EN**: What is the difference between repeating something many times and actually improving?

- A. 要看动作有没有更熟练，做出来的东西有没有更好。 / Check whether your technique is more fluent and your work is better.
- B. 练习次数增加，通常就可以推断能力提高。 / More practice sessions usually indicate that the skill has improved.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。次数只能说明你练过多少遍；还要检查错误有没有减少，才能知道有没有进步。 / Correct. Counts record effort but do not alone prove improvement.
- 选择 B 的反馈：这题不对。这里要分清牌义的边界：次数只能说明你练过多少遍；还要检查错误有没有减少，才能知道有没有进步。 / Not quite. The boundary of the card meaning matters here: Counts record effort but do not alone prove improvement.


#### p08-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：把总出错的部分拆开慢练，并检查动作，才能知道哪里错了、怎样练得更熟。

**EN**: Slow down the difficult passage and check your technique to identify errors and practise more accurately.

**中**：把写得不稳的笔画单独拿出来练，再和之前比较，才知道练习有没有帮助。

**EN**: Practise the unstable stroke separately, then compare it with earlier attempts to check whether the practice helped.


#### p08-R2-CHECK · 换个例子确认

**中**：练字时同一笔画总歪，按照星币八的提醒，怎样练习？

**EN**: One stroke stays crooked in handwriting practice. What fits?

- A. 不看字形，只把整页抄得更多。 / Ignore form and copy more entire pages.
- B. 把这个笔画单独拿出来练，再和范例比较。 / Isolate the stroke and check against an example.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。把写得不稳的笔画单独拿出来练，再和之前比较，才知道练习有没有帮助。 / Correct. Practise the unstable stroke separately, then compare it with earlier attempts to check whether the practice helped.
- 选择 A 的反馈：这题不对。本题应选：把这个笔画单独拿出来练，再和范例比较。 把写得不稳的笔画单独拿出来练，再和之前比较，才知道练习有没有帮助。 / Not quite. The supported answer is: Isolate the stroke and check against an example. Practise the unstable stroke separately, then compare it with earlier attempts to check whether the practice helped.


#### p08-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小青每天把同一段曲子反复弹，却一直不检查出错的地方。这个例子里，星币八逆位表示花了很多时间，却没有把细节练好，需要检查错误、调整练法。其他情况下也可能涉及对细节过分苛求，但这里没有这样的背景，不能硬套。

**EN**: Qing repeats mechanically without examining mistakes. Here reversal concerns effort disconnected from quality. Overpolishing belongs to another context and is not simultaneously imposed.

**中**：这个逆位例子提醒我们：先找出总错的地方，再有针对性地练，不要只增加次数。

**EN**: This reversal reconnects effort to skill quality.


#### p08-R3-CHECK · 逆位纠错后续题

**中**：总在同一处出错，却一直没检查原因。接下来应该怎样练？

**EN**: The same mistake keeps recurring, but its cause has never been checked. How should the learner practise next?

- A. 保持当前动作，先提升速度，再在成品里看问题。 / Keep the current motion, build speed first, and inspect problems in the finished work.
- B. 先检查错在哪里，再专门练习出错的部分。 / Add error-focused checking and practice.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。这个逆位例子提醒我们：先找出总错的地方，再有针对性地练，不要只增加次数。 / Correct. This reversal reconnects effort to skill quality.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。这个逆位例子提醒我们：先找出总错的地方，再有针对性地练，不要只增加次数。 / Not quite. This action skips a key step in the question. This reversal reconnects effort to skill quality.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p08-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p08-V1-CHECK · 新背景迁移

**中**：做演示文稿时图表经常错位，按照星币八的提醒，应该怎样改进？

**EN**: Your charts often misalign in presentations. Following the Eight of Pentacles, how could you improve?

- A. 练习对齐操作，并检查实际效果。 / Practice alignment and check results.
- B. 延长制作时间，用投入时长衡量熟练程度。 / Spend longer making the slides and use time invested as the measure of skill.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。先检查幻灯片哪里没对齐，再练习调整；页数做得更多，不表示做得更仔细。 / Correct. Check where the charts misalign and practise correcting them. Making more slides does not necessarily mean making them more carefully.
- 选择 B 的反馈：这题不对。这样做会漏掉题目里的关键一步。先检查幻灯片哪里没对齐，再练习调整；页数做得更多，不表示做得更仔细。 / Not quite. This action skips a key step in the question. Check where the charts misalign and practise correcting them. Making more slides does not necessarily mean making them more carefully.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币八表示认真做事、练习技能，并把细节做好。它强调的不只是花了多少时间，还包括动作有没有更熟练、作品有没有做得更好；忙碌或反复做很多次，不一定就是进步。

**EN**: The Eight of Pentacles concerns dedicated work, learning skills, and refining quality. Practice, attention, and detail support each other; busyness or repetition alone does not prove improvement.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p09"></a>
### p09 · 星币九 · Nine of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p09.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents09.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币九的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Nine of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币九是长期积累、自我管理与从容享受成果。独立强调有能力安排自己的生活，不等于拒绝任何帮助或关系。

**EN**: The Nine of Pentacles concerns accumulated resources, self-management, and enjoying results. Independence means capacity to manage life, not refusing all help or connection.

**中**：人物站在葡萄园里，戴手套的手上停着猎鹰。丰盛的花园和从容的人物，帮助我们记住积累后的成果与生活安排；仅凭画面不能确定现实中的职业或身份。

**EN**: A figure stands in a vineyard with a falcon on a gloved hand. Abundance and composure suggest results and management, not a fixed real-world identity.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关。数字九可以帮助记住积累已经有了成果；画中的花园和人物，则让我们想到怎样照顾自己的生活、享受努力后的收获。可以记成：独立、自律、享受成果。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns living conditions; nine can aid remembering mature personal results. Helpers: independence, self-discipline, enjoyment.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：葡萄园、从容人物与戴手套的手 / vineyard, composed figure, and gloved hand。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物站在葡萄园里，戴手套的手上停着猎鹰。丰盛的花园和从容的人物，帮助我们记住积累后的成果与生活安排；仅凭画面不能确定现实中的职业或身份。 / A figure stands in a vineyard with a falcon on a gloved hand. Abundance and composure suggest results and management, not a fixed real-world identity.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p09-Q1 · 核心理解

**中**：独立是否意味着完全不需要别人？

**EN**: Does independence mean never needing anyone?

- A. 不是，能管理自己也可以接受帮助。 / No; self-management can include receiving help.
- B. 是，求助会让成果不再算作自己的能力。 / Yes. Seeking help means the result no longer reflects one's own ability.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。有能力安排自己的生活，也可以接受别人的帮助，两者并不冲突。 / Correct. Capability and connection can coexist.
- 选择 B 的反馈：这题不对。这个解释把牌义带到了别处。有能力安排自己的生活，也可以接受别人的帮助，两者并不冲突。 / Not quite. This interpretation shifts the card meaning elsewhere. Capability and connection can coexist.


#### T2 · 先看一个有背景的应用示范

**中**：小余持续练习后能独立完成作品。建议位承认自己的积累，安排可承担的奖励，也允许需要时请教别人。

**EN**: Yu can complete a work independently after sustained practice. Advice acknowledges achievement and allows an affordable reward while retaining the option to seek advice.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p09-Q2 · 应用理解

**中**：已经能独立完成作品，按照刚才的例子，怎样肯定自己的进步？

**EN**: Able to complete a work independently: what fits?

- A. 把成果展示给更多人，用外界反应确认价值。 / Show the work to more people and use their reaction to confirm its value.
- B. 肯定自己的努力，在预算内安排一份享受。 / Acknowledge progress and enjoy within means.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。可以在预算内奖励自己、享受成果；不必为了证明独立而拒绝所有人的帮助。 / Correct. Appreciating results does not require isolation.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。可以在预算内奖励自己、享受成果；不必为了证明独立而拒绝所有人的帮助。 / Not quite. This action skips a key step in the question. Appreciating results does not require isolation.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小余为了维持“我很成功”的形象，买了超出预算的东西，自己的生活反而受到影响。这个例子里，星币九逆位提醒我们：先顾好实际收支和生活，不要只顾让别人觉得自己过得好；这不是在评价一个人的价值。

**EN**: Yu overspends to maintain an image of success. Here reversal concerns display overriding genuine independence, calling for a return to actual conditions.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p09-Q3 · 有背景的逆位

**中**：为成功形象超预算购买，逆位提醒什么？

**EN**: Overspending for a success image: reversal?

- A. 先看看自己实际能负担什么，再安排消费和生活。 / Return to real capability and affordable conditions.
- B. 购买越贵就越证明独立。 / Higher prices prove greater independence.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。买得贵、看起来富足，不表示能安排好自己的收支；已经超支，就要先调整预算。 / Correct. Consumption cannot replace self-management.
- 选择 B 的反馈：这题不对。本题应选：先看看自己实际能负担什么，再安排消费和生活。 买得贵、看起来富足，不表示能安排好自己的收支；已经超支，就要先调整预算。 / Not quite. The supported answer is: Return to real capability and affordable conditions. Consumption cannot replace self-management.


#### p09-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：有能力安排自己的生活，也可以接受别人的帮助，两者并不冲突。

**EN**: Capability and connection can coexist.

**中**：重点是能把自己的日子安排好，而不是让别人觉得你比他们过得好。

**EN**: The theme centers on sustainable personal life.


#### p09-R1-CHECK · 换个例子确认

**中**：怎样区分享受成果与证明身份？

**EN**: Distinguish enjoying results from proving status.

- A. 选择容易被看见的奖励，让成果获得他人认可。 / Choose a visible reward so that the achievement gains recognition from others.
- B. 肯定自己已经做好的事，在负担得起的范围内享受成果。 / Enjoyment fits actual conditions and accumulated work.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。重点是能把自己的日子安排好，而不是让别人觉得你比他们过得好。 / Correct. The theme centers on sustainable personal life.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。重点是能把自己的日子安排好，而不是让别人觉得你比他们过得好。 / Not quite. This action skips a key step in the question. The theme centers on sustainable personal life.


#### p09-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：可以在预算内奖励自己、享受成果；不必为了证明独立而拒绝所有人的帮助。

**EN**: Appreciating results does not require isolation.

**中**：完成长期学习目标，值得给自己一点奖励；不用比别人强，才有资格肯定自己的努力。

**EN**: Achievement can be appreciated without comparison.


#### p09-R2-CHECK · 换个例子确认

**中**：完成长期学习目标后，按照星币九的提醒，怎样看待自己的成果？

**EN**: After a long-term study goal, apply.

- A. 肯定能力进步，安排适量放松。 / Recognize capability gained and allow measured relaxation.
- B. 先拿更强的人作参照，找出自己还不够好的地方。 / Compare with someone more advanced and focus on where improvement is still needed.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。完成长期学习目标，值得给自己一点奖励；不用比别人强，才有资格肯定自己的努力。 / Correct. Achievement can be appreciated without comparison.
- 选择 B 的反馈：这题不对。这个做法没有解决眼前的情况。完成长期学习目标，值得给自己一点奖励；不用比别人强，才有资格肯定自己的努力。 / Not quite. This action does not resolve the situation described. Achievement can be appreciated without comparison.


#### p09-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小余为了维持“我很成功”的形象，买了超出预算的东西，自己的生活反而受到影响。这个例子里，星币九逆位提醒我们：先顾好实际收支和生活，不要只顾让别人觉得自己过得好；这不是在评价一个人的价值。

**EN**: Yu overspends to maintain an image of success. Here reversal concerns display overriding genuine independence, calling for a return to actual conditions.

**中**：先让收支安排得过来，比维持“我过得很好”的印象更重要。

**EN**: External impressions cannot replace self-management.


#### p09-R3-CHECK · 逆位纠错后续题

**中**：超预算消费让生活受压，怎样修正？

**EN**: Overspending strains daily life. Correct how?

- A. 先按预算安排生活，分清自己真的享受什么、哪些只是买给别人看。 / Return to affordable conditions and separate enjoyment from display.
- B. 继续加购，让别人更确信自己成功。 / Buy more so others believe in the success.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。先让收支安排得过来，比维持“我过得很好”的印象更重要。 / Correct. External impressions cannot replace self-management.
- 选择 B 的反馈：这题不对。本题应选：先按预算安排生活，分清自己真的享受什么、哪些只是买给别人看。 先让收支安排得过来，比维持“我过得很好”的印象更重要。 / Not quite. The supported answer is: Return to affordable conditions and separate enjoyment from display. External impressions cannot replace self-management.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p09-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p09-V1-CHECK · 新背景迁移

**中**：靠自己整理好生活，怎样保持独立？

**EN**: Life is organized through personal effort. Maintain independence how?

- A. 减少和他人合作，把生活事项尽量留给自己处理。 / Reduce collaboration and keep daily matters under personal control as much as possible.
- B. 继续安排好自己的生活，需要时也可以求助或帮助别人。 / Maintain conditions and sensible mutual support.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。能够自己安排生活，不表示必须事事独自承担；遇到需要时仍可以求助。 / Correct. Independence is capability, not total isolation.
- 选择 A 的反馈：这题不对。先别按这个做法继续；能够自己安排生活，不表示必须事事独自承担；遇到需要时仍可以求助。 / Not quite. Do not continue with this approach yet; Independence is capability, not total isolation.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币九是长期积累、自我管理与从容享受成果。独立强调有能力安排自己的生活，不等于拒绝任何帮助或关系。

**EN**: The Nine of Pentacles concerns accumulated resources, self-management, and enjoying results. Independence means capacity to manage life, not refusing all help or connection.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p10"></a>
### p10 · 星币十 · Ten of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p10.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents10.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币十的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Ten of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币十关注长期积累下来的资源、经验，以及家人或团队共同拥有的保障。已有的成果通过共同约定、交接或代际传承保留下来，让后来的人也能使用，不只是某一个人此刻拥有多少东西。

**EN**: The Ten of Pentacles concerns long-term resources, experience, and shared security. Results endure through systems, transmission, or community beyond one person’s current possessions.

**中**：长者、成人、孩子、犬和建筑共同出现。不同年龄的人生活在同一环境里，帮助我们记住把积累的东西传给后来的人，不等于现实中必然继承财产。

**EN**: Elders, adults, a child, dogs, and architecture share the scene. Generations and a common environment suggest continuity, not guaranteed inheritance.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关。数字十可以帮助记住长期积累；画中不同年龄的人，让我们想到把成果留给后来的人。可以记成：长期积累、传给后来的人、共同保障。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns tangible security; ten can aid remembering accumulated structure. Helpers: lasting accumulation, transmission, shared security.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：不同世代人物与共同建筑 / figures of different generations and shared architecture。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：长者、成人、孩子、犬和建筑共同出现。不同年龄的人生活在同一环境里，帮助我们记住把积累的东西传给后来的人，不等于现实中必然继承财产。 / Elders, adults, a child, dogs, and architecture share the scene. Generations and a common environment suggest continuity, not guaranteed inheritance.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p10-Q1 · 核心理解

**中**：星币十为什么不只看某个人现在拥有多少东西？

**EN**: Why look beyond individual results?

- A. 看个人目前能控制多少资源，以及这些资源能否增加地位。 / Look at how many resources a person controls and whether they raise social standing.
- B. 还要看积累下来的东西，怎样留给家人或团队继续使用。 / Consider how results endure and support others.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。这张牌关注长期积累，以及家人或团队怎样一起保留、使用这些成果。 / Correct. The meaning concerns shared structures and long-term accumulation.
- 选择 A 的反馈：这题不对。个人控制多少资源只说明眼前占有，不能说明成果能否延续。星币十还要看积累怎样留给家人或团队继续使用。 / Not quite. A person’s current control of resources describes possession, not whether the result endures. The Ten of Pentacles also asks how accumulated results continue to support family or a group.


#### T2 · 先看一个有背景的应用示范

**中**：社团骨干即将离开。建议位把经验整理成流程、保存共同资料并做好交接，让成果不依赖单一成员。

**EN**: Experienced club members are leaving. Advice documents processes, preserves shared materials, and prepares handover so outcomes do not depend on one person.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p10-Q2 · 应用理解

**中**：社团骨干离开前，怎样做才能让后来的人继续工作？

**EN**: Before experienced members leave, which fits?

- A. 整理流程资料并完成交接。 / Organize process knowledge and complete handover.
- B. 只说大家以后自己猜就好。 / Tell successors to guess later.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。把经验、文件和操作方法交接清楚，接手的人才能继续做；只说“交给你了”还不够。 / Correct. Transmission requires a usable practical foundation.
- 选择 B 的反馈：这题不对。本题应选：整理流程资料并完成交接。 把经验、文件和操作方法交接清楚，接手的人才能继续做；只说“交给你了”还不够。 / Not quite. The supported answer is: Organize process knowledge and complete handover. Transmission requires a usable practical foundation.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：资料只留在离开成员的个人设备上，新成员拿不到资料，工作无法继续。这个例子里，星币十逆位表示本来该共同保留的成果没有交接好，需要补上文件和操作说明；不表示社团一定会解散。

**EN**: Shared knowledge remains on a departing member’s device. Here reversal concerns an unstable shared foundation and calls for handover, not a prediction of dissolution.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p10-Q3 · 有背景的逆位

**中**：资料随个人离开，逆位指出什么？

**EN**: Knowledge leaves with one person. Reversal?

- A. 说明负责人不够可靠，换人后从头建立资料更稳妥。 / It shows that the person in charge was unreliable, so rebuilding the records under a new person would be safer.
- B. 资料只在一个人的设备里，其他人离开他就没法接着做。 / The foundation for continuity is insecure.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。可以备份文件、补上交接，来解决眼前的问题；不能因此断定整个社团一定失败。 / Correct. The gap can be addressed without fixing the outcome.
- 选择 A 的反馈：这题不对。这个解释把牌义带到了别处。可以备份文件、补上交接，来解决眼前的问题；不能因此断定整个社团一定失败。 / Not quite. This interpretation shifts the card meaning elsewhere. The gap can be addressed without fixing the outcome.


#### p10-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：这张牌关注长期积累，以及家人或团队怎样一起保留、使用这些成果。

**EN**: The meaning concerns shared structures and long-term accumulation.

**中**：接手的人需要找得到文件，也知道怎样使用；只有一句口头叮嘱，往往不够。

**EN**: Continuity needs accessible, usable knowledge.


#### p10-R1-CHECK · 换个例子确认

**中**：经验传承为什么不是只讲一次故事？

**EN**: Why is transmission more than telling a story once?

- A. 后续成员要能实际使用经验。 / Future members must be able to use it.
- B. 讲清过去成功的做法，就足以让后来者照着使用。 / Explaining the past method gives later members enough to follow it.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。接手的人需要找得到文件，也知道怎样使用；只有一句口头叮嘱，往往不够。 / Correct. Continuity needs accessible, usable knowledge.
- 选择 B 的反馈：这题不对。这个解释把牌义带到了别处。接手的人需要找得到文件，也知道怎样使用；只有一句口头叮嘱，往往不够。 / Not quite. This interpretation shifts the card meaning elsewhere. Continuity needs accessible, usable knowledge.


#### p10-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：把经验、文件和操作方法交接清楚，接手的人才能继续做；只说“交给你了”还不够。

**EN**: Transmission requires a usable practical foundation.

**中**：把家中共用物品放在哪里、怎样维护说清楚，家人才能继续使用，而不必总依赖某一个人。

**EN**: Shared security depends on sustainable arrangements.


#### p10-R2-CHECK · 换个例子确认

**中**：家人一起管理共用物品，怎样运用星币十讲的长期保留和共同使用？

**EN**: A household manages shared items. Apply.

- A. 由最熟悉的人统一保管，其他人有需要时再问。 / Have the most experienced person keep the shared items and let others ask when needed.
- B. 说清物品放在哪里、怎样使用和维护，让家人都能继续用。 / Clarify care and access for continued use.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。把家中共用物品放在哪里、怎样维护说清楚，家人才能继续使用，而不必总依赖某一个人。 / Correct. Shared security depends on sustainable arrangements.
- 选择 A 的反馈：这题不对。这个做法没有解决眼前的情况。把家中共用物品放在哪里、怎样维护说清楚，家人才能继续使用，而不必总依赖某一个人。 / Not quite. This action does not resolve the situation described. Shared security depends on sustainable arrangements.


#### p10-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：资料只留在离开成员的个人设备上，新成员拿不到资料，工作无法继续。这个例子里，星币十逆位表示本来该共同保留的成果没有交接好，需要补上文件和操作说明；不表示社团一定会解散。

**EN**: Shared knowledge remains on a departing member’s device. Here reversal concerns an unstable shared foundation and calls for handover, not a prediction of dissolution.

**中**：把文件放到团队能访问的地方，并写好使用说明，才能让别人接着工作。

**EN**: Continuity needs usable information.


#### p10-R3-CHECK · 逆位纠错后续题

**中**：交接缺失导致新人不能继续，先补什么？

**EN**: Missing handover blocks successors. Fill what first?

- A. 只告诉新人过去曾经成功过。 / Merely tell successors that things once succeeded.
- B. 新人找得到的资料、做事步骤，以及各项工作由谁负责。 / Accessible materials, processes, and responsibilities.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。把文件放到团队能访问的地方，并写好使用说明，才能让别人接着工作。 / Correct. Continuity needs usable information.
- 选择 A 的反馈：这题不对。本题应选：新人找得到的资料、做事步骤，以及各项工作由谁负责。 把文件放到团队能访问的地方，并写好使用说明，才能让别人接着工作。 / Not quite. The supported answer is: Accessible materials, processes, and responsibilities. Continuity needs usable information.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p10-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p10-V1-CHECK · 新背景迁移

**中**：团队换负责人，怎样保留成果？

**EN**: A team changes leaders. Preserve outcomes how?

- A. 交接流程、资源与维护责任。 / Hand over processes, resources, and maintenance duties.
- B. 重新设计流程，避免继续使用前任留下的做法。 / Redesign the process and avoid continuing the previous leader's methods.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。负责人会更换，但资料、分工和操作方法交接好了，团队仍可以接着做。 / Correct. Long-term structures can carry through personnel changes.
- 选择 B 的反馈：这题不对。这个做法没有解决眼前的情况。负责人会更换，但资料、分工和操作方法交接好了，团队仍可以接着做。 / Not quite. This action does not resolve the situation described. Long-term structures can carry through personnel changes.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币十关注长期积累下来的资源、经验，以及家人或团队共同拥有的保障。已有的成果通过共同约定、交接或代际传承保留下来，让后来的人也能使用，不只是某一个人此刻拥有多少东西。

**EN**: The Ten of Pentacles concerns long-term resources, experience, and shared security. Results endure through systems, transmission, or community beyond one person’s current possessions.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p11"></a>
### p11 · 星币侍从 · Page of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p11.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents11.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币侍从的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Page of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币侍从认真开始学习一项技能，或把计划变成可以动手做的事，愿意从基础做起。学习意愿是开始，仍需实际练习才能形成技能。

**EN**: The Page of Pentacles approaches practical knowledge or a plan with attention and willingness to start from basics. Interest begins learning; practice builds skill.

**中**：人物凝视手中星币，脚下有土地。这帮助我们记住从眼前这件具体的事开始学习，不限定学生年龄。

**EN**: The figure studies a pentacle while standing on the ground. A concrete focus suggests practical learning, without an age requirement.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关；侍从表示刚开始学习、愿意尝试。这张牌可以记成：动手学、专心、新的学习机会。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth supplies practical skills and resources; Page suggests beginning to learn. Helpers: practical learning, attention, a starting opportunity.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：凝视星币的视线与手中星币 / the gaze toward the held pentacle。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物凝视手中星币，脚下有土地。这帮助我们记住从眼前这件具体的事开始学习，不限定学生年龄。 / The figure studies a pentacle while standing on the ground. A concrete focus suggests practical learning, without an age requirement.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p11-Q1 · 核心理解

**中**：学习意愿和熟练掌握是否相同？

**EN**: Are willingness and proficiency the same?

- A. 不同，愿意学之后，还需要动手练习。 / No; willingness still needs practice.
- B. 相同，有兴趣就已经会做。 / Yes; interest already means competence.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。侍从在这里表示刚开始学习、愿意认真尝试，还不是已经熟练掌握。 / Correct. The Page represents a learning beginning.
- 选择 B 的反馈：这题不对。本题应选：不同，愿意学之后，还需要动手练习。 侍从在这里表示刚开始学习、愿意认真尝试，还不是已经熟练掌握。 / Not quite. The supported answer is: No; willingness still needs practice. The Page represents a learning beginning.


#### T2 · 先看一个有背景的应用示范

**中**：小施想学摄影。建议位先认识一个基础设置，拍一组照片检查差异，不把购买全套器材当成已经学会。

**EN**: Shi wants to learn photography. Advice learns one basic setting and takes comparison photos rather than treating equipment purchases as acquired skill.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p11-Q2 · 应用理解

**中**：刚开始学摄影，按照刚才的例子，先怎样练习？

**EN**: Beginning photography: which follows?

- A. 先比较器材参数，等确定合适设备后再练。 / Compare equipment specifications first and practise after choosing the right device.
- B. 练一个设置并观察照片差异。 / Practice one setting and compare photos.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。选一个相机设置实际拍摄、比较照片，才能知道这个设置会带来什么变化。 / Correct. Practical learning requires concrete action.
- 选择 A 的反馈：这题不对。先别按这个做法继续；选一个相机设置实际拍摄、比较照片，才能知道这个设置会带来什么变化。 / Not quite. Do not continue with this approach yet; Practical learning requires concrete action.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小施收藏了很多教程，却跳过基础操作，一直没有实际拍摄。这个例子里，星币侍从逆位表示一直计划、没有动手。先完成一次基础练习，比继续收集教程更有帮助。

**EN**: Shi saves tutorials but skips basic operations and never shoots. Here reversal means a plan not put into practice, calling for one basic exercise.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p11-Q3 · 有背景的逆位

**中**：收藏教程却不操作，逆位提醒什么？

**EN**: Saving tutorials without practice: reversal?

- A. 把一个基础步骤实际做出来。 / Carry out one foundational step.
- B. 继续收藏就等于已完成练习。 / More saved tutorials equal completed practice.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。收藏教程只是存下资料；还需要拿起相机试一试，才是在练习技能。 / Correct. Collecting resources differs from practicing skills.
- 选择 B 的反馈：这题不对。本题应选：把一个基础步骤实际做出来。 收藏教程只是存下资料；还需要拿起相机试一试，才是在练习技能。 / Not quite. The supported answer is: Carry out one foundational step. Collecting resources differs from practicing skills.


#### p11-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：侍从在这里表示刚开始学习、愿意认真尝试，还不是已经熟练掌握。

**EN**: The Page represents a learning beginning.

**中**：知道有哪些工具还不够，要实际用过、练过，才能慢慢学会。

**EN**: Capability develops through practice.


#### p11-R1-CHECK · 换个例子确认

**中**：怎样把兴趣变成学习起点？

**EN**: Turn interest into learning how?

- A. 只给自己贴上熟练者标签。 / Merely label yourself proficient.
- B. 选择一个能实际操作的基础任务。 / Choose one workable foundational task.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。知道有哪些工具还不够，要实际用过、练过，才能慢慢学会。 / Correct. Capability develops through practice.
- 选择 A 的反馈：这题不对。本题应选：选择一个能实际操作的基础任务。 知道有哪些工具还不够，要实际用过、练过，才能慢慢学会。 / Not quite. The supported answer is: Choose one workable foundational task. Capability develops through practice.


#### p11-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：选一个相机设置实际拍摄、比较照片，才能知道这个设置会带来什么变化。

**EN**: Practical learning requires concrete action.

**中**：第一次做面包，先按一种简单配方称量、操作，比同时尝试很多复杂做法更容易学清楚。

**EN**: Practical beginnings stay within a learnable scope.


#### p11-R2-CHECK · 换个例子确认

**中**：想学做面包，先如何开始？

**EN**: Wanting to bake bread, start how?

- A. 先学会按配方称量，再试做一小份。 / Learn basic measurements and make one small batch.
- B. 先跳过基础，直接证明自己会复杂造型。 / Skip basics to claim complex shaping skill.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。第一次做面包，先按一种简单配方称量、操作，比同时尝试很多复杂做法更容易学清楚。 / Correct. Practical beginnings stay within a learnable scope.
- 选择 B 的反馈：这题不对。本题应选：先学会按配方称量，再试做一小份。 第一次做面包，先按一种简单配方称量、操作，比同时尝试很多复杂做法更容易学清楚。 / Not quite. The supported answer is: Learn basic measurements and make one small batch. Practical beginnings stay within a learnable scope.


#### p11-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小施收藏了很多教程，却跳过基础操作，一直没有实际拍摄。这个例子里，星币侍从逆位表示一直计划、没有动手。先完成一次基础练习，比继续收集教程更有帮助。

**EN**: Shi saves tutorials but skips basic operations and never shoots. Here reversal means a plan not put into practice, calling for one basic exercise.

**中**：教程已经收集了很多，这次缺的是实际操作；先选一个设置试拍，不用继续囤教程。

**EN**: The gap is practice, not the number of tutorials.


#### p11-R3-CHECK · 逆位纠错后续题

**中**：收藏很多教程却未实践，下一步是什么？

**EN**: Many tutorials saved, no practice done. What next?

- A. 选一个基础任务亲手完成。 / Complete one foundational task in practice.
- B. 再收藏更多高级教程代替练习。 / Save more advanced tutorials instead of practicing.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。教程已经收集了很多，这次缺的是实际操作；先选一个设置试拍，不用继续囤教程。 / Correct. The gap is practice, not the number of tutorials.
- 选择 B 的反馈：这题不对。本题应选：选一个基础任务亲手完成。 教程已经收集了很多，这次缺的是实际操作；先选一个设置试拍，不用继续囤教程。 / Not quite. The supported answer is: Complete one foundational task in practice. The gap is practice, not the number of tutorials.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p11-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p11-V1-CHECK · 新背景迁移

**中**：第一次接触表格工具，按照星币侍从的提醒，怎样开始学？

**EN**: First using spreadsheets, apply.

- A. 阅读软件名后认定自己已熟练。 / Assume proficiency after reading the software name.
- B. 从输入数据和一项基础操作开始。 / Start with data entry and one basic operation.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。听过表格功能的名字，不等于会用；可以先跟着例子实际做一遍。 / Correct. Knowing a name is not practical competence.
- 选择 A 的反馈：这题不对。本题应选：从输入数据和一项基础操作开始。 听过表格功能的名字，不等于会用；可以先跟着例子实际做一遍。 / Not quite. The supported answer is: Start with data entry and one basic operation. Knowing a name is not practical competence.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币侍从认真开始学习一项技能，或把计划变成可以动手做的事，愿意从基础做起。学习意愿是开始，仍需实际练习才能形成技能。

**EN**: The Page of Pentacles approaches practical knowledge or a plan with attention and willingness to start from basics. Interest begins learning; practice builds skill.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p12"></a>
### p12 · 星币骑士 · Knight of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p12.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents12.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币骑士的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Knight of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币骑士做事稳妥、认真负责，按自己能坚持的节奏完成任务。慢一点不等于做得差，但也要检查：每天照着做的事，是否仍符合现在的目标。

**EN**: The Knight of Pentacles follows steady, responsible steps with sustainable execution. Slow does not automatically mean poor, but routines must still serve an appropriate goal.

**中**：马静立，骑士持币，背景是耕地。安稳的姿态和耕地，帮助记住耐心把事情做完，不据此说他永远不行动。

**EN**: The horse stands still, the rider holds a pentacle, and fields lie behind. Stability and cultivation suggest patient execution, not permanent inactivity.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关；骑士强调持续去做。这张牌可以记成：可靠、坚持做完、耐心、负责。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns practical tasks; Knight emphasizes committed action. Helpers: reliability, execution, patience, responsibility.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：静立马匹、持币骑士与耕地 / the still horse, rider with pentacle, and cultivated land。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：马静立，骑士持币，背景是耕地。安稳的姿态和耕地，帮助记住耐心把事情做完，不据此说他永远不行动。 / The horse stands still, the rider holds a pentacle, and fields lie behind. Stability and cultivation suggest patient execution, not permanent inactivity.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p12-Q1 · 核心理解

**中**：做事是否稳妥可靠，主要看什么？

**EN**: What defines reliable execution?

- A. 看起步时投入多大，以及能否快速超出计划。 / Judge by the size of the initial effort and whether progress quickly exceeds the plan.
- B. 按自己能坚持的安排，持续完成该做的事。 / Consistently carrying out feasible steps.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。每天完成必要的复习，比只在某一天特别拼、之后全停下来，更能体现认真负责。 / Correct. Sustained responsibility fits better than one burst.
- 选择 A 的反馈：这题不对。这个说法混淆了题目正在考的含义。每天完成必要的复习，比只在某一天特别拼、之后全停下来，更能体现认真负责。 / Not quite. This statement confuses the meaning being tested. Sustained responsibility fits better than one burst.


#### T2 · 先看一个有背景的应用示范

**中**：小罗要参加一场需要准备较长时间的考试。放在建议位，可以把复习分成每天做得完的任务，并定期检查进度；不要头几天安排太多，累得后来完全停下来。

**EN**: Luo prepares for a long-term exam. Advice sets a manageable daily unit, follows through, and reviews periodically rather than overworking briefly and stopping.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p12-Q2 · 应用理解

**中**：考试需要准备较长时间，怎样安排更符合刚才的例子？

**EN**: Preparing for a long-term exam: which fits?

- A. 安排每天能完成的复习量，并检查有没有完成。 / Set sustainable daily tasks and check follow-through.
- B. 前几天集中完成大部分内容，后面按状态补漏。 / Complete most of the material in the first few days and fill gaps later according to energy.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。每天的量要安排得过来，才能坚持；一下塞太多，很容易第二天就停下来。 / Correct. Sustainable execution needs a workable pace.
- 选择 B 的反馈：这题不对。先别按这个做法继续；每天的量要安排得过来，才能坚持；一下塞太多，很容易第二天就停下来。 / Not quite. Do not continue with this approach yet; Sustainable execution needs a workable pace.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：考试要求已经改变，小罗却不看新要求，仍照旧清单复习。这个例子里，星币骑士逆位表示做法过于死板，需要检查每天做的事是否还符合目标；不是让他放弃规律学习。

**EN**: Requirements change but Luo mechanically follows the old list. Here reversal means rigid routine and calls for reviewing the purpose, not abandoning all consistency.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p12-Q3 · 有背景的逆位

**中**：要求已变仍机械照旧，逆位提示什么？

**EN**: Requirements change but routine does not. Reversal?

- A. 为了保持节奏，继续用原清单，复习后再看新要求。 / Keep the old checklist to preserve momentum and review the new requirement afterward.
- B. 先看新的考试要求，再调整复习安排。 / Review the goal and update steps.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。考试要求已经变了，就要更新复习安排；认真做旧清单，也可能漏掉现在要考的内容。 / Correct. Reliability serves the goal, not an outdated list.
- 选择 A 的反馈：这题不对。这个说法混淆了题目正在考的含义。考试要求已经变了，就要更新复习安排；认真做旧清单，也可能漏掉现在要考的内容。 / Not quite. This statement confuses the meaning being tested. Reliability serves the goal, not an outdated list.


#### p12-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：每天完成必要的复习，比只在某一天特别拼、之后全停下来，更能体现认真负责。

**EN**: Sustained responsibility fits better than one burst.

**中**：做得快不快是一回事，有没有持续把该做的事做完，是另一回事。

**EN**: Evaluate follow-through, not speed alone.


#### p12-R1-CHECK · 换个例子确认

**中**：慢而稳定为何仍可能有效？

**EN**: Why can slow, steady work be effective?

- A. 每一步都认真完成，日子久了也能不断进步。 / Steps are completed and can accumulate.
- B. 把较慢的节奏本身当作效果，主要记录坚持了多少天。 / Treat the slower pace itself as evidence of progress and mainly track days of persistence.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。做得快不快是一回事，有没有持续把该做的事做完，是另一回事。 / Correct. Evaluate follow-through, not speed alone.
- 选择 B 的反馈：这题不对。先核对眼前例子的条件：做得快不快是一回事，有没有持续把该做的事做完，是另一回事。 / Not quite. Check the conditions in this example first: Evaluate follow-through, not speed alone.


#### p12-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：每天的量要安排得过来，才能坚持；一下塞太多，很容易第二天就停下来。

**EN**: Sustainable execution needs a workable pace.

**中**：按计划检查和保养设备，才能减少遗漏；不能只在出问题时才想起来。

**EN**: Responsibility appears in consistent essential actions.


#### p12-R2-CHECK · 换个例子确认

**中**：每天维护社团器材，怎样体现星币骑士认真负责的做事方式？

**EN**: Maintaining club equipment daily: what fits?

- A. 发现问题时再记录，平时按印象检查。 / Record an issue when one appears and rely on memory for routine checks.
- B. 按清单检查并记录需要处理的项。 / Follow a checklist and note needed repairs.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。按计划检查和保养设备，才能减少遗漏；不能只在出问题时才想起来。 / Correct. Responsibility appears in consistent essential actions.
- 选择 A 的反馈：这题不对。这个做法没有解决眼前的情况。按计划检查和保养设备，才能减少遗漏；不能只在出问题时才想起来。 / Not quite. This action does not resolve the situation described. Responsibility appears in consistent essential actions.


#### p12-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：考试要求已经改变，小罗却不看新要求，仍照旧清单复习。这个例子里，星币骑士逆位表示做法过于死板，需要检查每天做的事是否还符合目标；不是让他放弃规律学习。

**EN**: Requirements change but Luo mechanically follows the old list. Here reversal means rigid routine and calls for reviewing the purpose, not abandoning all consistency.

**中**：认真负责也包括检查要求有没有变化，再调整做法，而不是永远照旧做。

**EN**: Responsibility includes keeping action aligned with purpose.


#### p12-R3-CHECK · 逆位纠错后续题

**中**：过时清单造成停滞，怎样重新把该做的事做好？

**EN**: An outdated checklist causes stagnation. Restore execution how?

- A. 继续照旧清单做一段时间，用持续性弥补目标变化。 / Continue with the old checklist for a while and use consistency to offset the changed goal.
- B. 先确认现在要达到什么目标，再调整每天要做的事。 / Confirm the current goal and update repeatable steps.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。认真负责也包括检查要求有没有变化，再调整做法，而不是永远照旧做。 / Correct. Responsibility includes keeping action aligned with purpose.
- 选择 A 的反馈：这题不对。这个做法没有解决眼前的情况。认真负责也包括检查要求有没有变化，再调整做法，而不是永远照旧做。 / Not quite. This action does not resolve the situation described. Responsibility includes keeping action aligned with purpose.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p12-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p12-V1-CHECK · 新背景迁移

**中**：学外语时，怎样运用星币骑士坚持做事的方式？

**EN**: Apply this style to language study.

- A. 安排每天做得完的练习，并坚持去做。 / Plan and carry out sustainable daily practice.
- B. 先比较自己和同学的速度，再决定是否值得坚持。 / Compare study speed with classmates before deciding whether the practice deserves continuation.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。按自己能坚持的节奏练习，并完成每天的任务，比一味追求学得比别人快更重要。 / Correct. Consistent execution does not require outrunning others.
- 选择 B 的反馈：这题不对。这样做会漏掉题目里的关键一步。按自己能坚持的节奏练习，并完成每天的任务，比一味追求学得比别人快更重要。 / Not quite. This action skips a key step in the question. Consistent execution does not require outrunning others.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币骑士做事稳妥、认真负责，按自己能坚持的节奏完成任务。慢一点不等于做得差，但也要检查：每天照着做的事，是否仍符合现在的目标。

**EN**: The Knight of Pentacles follows steady, responsible steps with sustainable execution. Slow does not automatically mean poor, but routines must still serve an appropriate goal.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p13"></a>
### p13 · 星币王后 · Queen of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p13.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents13.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币王后的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of Queen of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币王后用实际行动照顾生活需要，比如安排好吃住、用品和休息，让日常生活更舒适稳定。照顾别人时，也要留意自己的时间、精力和基本需要，不限定任何性别或家庭身份。

**EN**: The Queen of Pentacles turns care into practical conditions and resource arrangements that sustain daily life. Care includes one’s own capacity and is not tied to gender or family role.

**中**：人物在繁茂环境中捧着星币。手中的星币和周围的植物，帮助记住照顾生活中的实际需要，而不是把她限定为母亲。

**EN**: A figure holds a pentacle in a lush setting. Resources and comfort suggest practical care without restricting the role to motherhood.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关；王后强调用实际行动照顾生活需要。这张牌可以记成：实际照顾、安排生活需要、生活安稳。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns everyday resources; Queen emphasizes mature care. Helpers: practical care, resource arrangement, stable daily life.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：捧币动作与周围繁茂环境 / the held pentacle and surrounding growth。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：人物在繁茂环境中捧着星币。手中的星币和周围的植物，帮助记住照顾生活中的实际需要，而不是把她限定为母亲。 / A figure holds a pentacle in a lush setting. Resources and comfort suggest practical care without restricting the role to motherhood.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p13-Q1 · 核心理解

**中**：按照星币王后的意思，怎样用行动照顾生活？

**EN**: How does care become practical?

- A. 安排好场地、物品和日常需要的帮助。 / Arrange space, resources, and daily support.
- B. 只说希望生活更好，不处理实际需要。 / Express wishes without arranging conditions.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。关心可以变成实际行动，比如整理学习环境、准备用品，让对方更方便学习。 / Correct. The theme emphasizes concrete forms of care.
- 选择 B 的反馈：这题不对。本题应选：安排好场地、物品和日常需要的帮助。 关心可以变成实际行动，比如整理学习环境、准备用品，让对方更方便学习。 / Not quite. The supported answer is: Arrange space, resources, and daily support. The theme emphasizes concrete forms of care.


#### T2 · 先看一个有背景的应用示范

**中**：小严要长期学习，却总找不到材料、没有固定休息。放在建议位，可以先整理桌面和材料、安排好休息，让自己更方便继续学习；只喊“坚持”解决不了这些问题。

**EN**: Yan plans long-term study but loses materials and has no rest routine. Advice arranges space, materials, and daily rhythm to support learning in practice.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p13-Q2 · 应用理解

**中**：学习材料总找不到，建议是什么？

**EN**: Study materials are always missing. What fits?

- A. 只责备自己不够有毅力。 / Merely blame insufficient willpower.
- B. 整理常用的桌面和材料，让需要的东西容易找到。 / Organize the workspace and materials.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。已经知道材料杂乱、休息不足，就先整理材料、安排休息；只鼓励自己还不够。 / Correct. Environment and resources are identified conditions to improve.
- 选择 A 的反馈：这题不对。本题应选：整理常用的桌面和材料，让需要的东西容易找到。 已经知道材料杂乱、休息不足，就先整理材料、安排休息；只鼓励自己还不够。 / Not quite. The supported answer is: Organize the workspace and materials. Environment and resources are identified conditions to improve.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：小严忙着给所有人准备材料，连自己吃饭、休息的时间都没有了。这个例子里，星币王后逆位表示照顾别人时忽略了自己，需要重新分工、留出休息；不是说关心别人有错。

**EN**: Yan prepares everyone’s materials while skipping personal needs. Here reversal means overextending care and neglecting oneself, calling for shared work and capacity limits.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p13-Q3 · 有背景的逆位

**中**：照顾所有人却忽略自己，逆位提示什么？

**EN**: Caring for everyone while neglecting oneself: reversal?

- A. 重新分工，也留出自己吃饭、休息的时间。 / Share tasks and preserve personal needs.
- B. 关怀越多就越该取消自己的休息。 / More care requires eliminating personal rest.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。想继续照顾别人，自己也需要吃饭、休息，不能一直透支精力。 / Correct. Sustainable care includes the caregiver’s capacity.
- 选择 B 的反馈：这题不对。本题应选：重新分工，也留出自己吃饭、休息的时间。 想继续照顾别人，自己也需要吃饭、休息，不能一直透支精力。 / Not quite. The supported answer is: Share tasks and preserve personal needs. Sustainable care includes the caregiver’s capacity.


#### p13-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：关心可以变成实际行动，比如整理学习环境、准备用品，让对方更方便学习。

**EN**: The theme emphasizes concrete forms of care.

**中**：先分清“希望对方过得好”和“真的把需要安排好”。愿望表达关心，但只有实际确认场地、用品、吃饭或休息，并动手安排，才是这道题要练的实际照顾。

**EN**: Separate wishing someone well from arranging what daily life actually needs. Practical care checks the space, supplies, food or rest and then acts on them.


#### p13-R1-CHECK · 换个例子确认

**中**：伙伴要在工作室连续做一天作品。哪种关心更贴近星币王后？

**EN**: A partner will work in the studio all day. Which response better fits practical care?

- A. 先确认材料、照明和休息时间，缺的东西一起准备好。 / Check materials, lighting, and rest time, then help prepare what is missing.
- B. 告诉对方自己真心希望这次进展顺利，具体准备由对方临时处理。 / Express sincere good wishes and leave the practical setup until the day itself.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。先确认并安排材料、环境和休息，关心才落实成对方实际能用到的帮助。 / Correct. Checking and arranging resources and rest turns care into support the person can actually use.
- 选择 B 的反馈：这题不对。本题应选：先确认材料、照明和休息时间，缺的东西一起准备好。 真心祝愿表达了关心，但没有处理这次工作真正需要的材料、环境和休息。 / Not quite. The supported answer is: Check materials, lighting, and rest time, then help prepare what is missing. Good wishes express care but do not arrange the practical conditions this workday needs.


#### p13-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：已经知道材料杂乱、休息不足，就先整理材料、安排休息；只鼓励自己还不够。

**EN**: Environment and resources are identified conditions to improve.

**中**：把场地、用品和休息安排好，参与活动的人才能实际得到照顾；只有一句关心还不够。

**EN**: Practical arrangements make care usable.


#### p13-R2-CHECK · 换个例子确认

**中**：准备团体活动，怎样体现星币王后照顾实际需要的方式？

**EN**: Preparing a group activity, what fits?

- A. 安排好场地和用品，也问清参加者有哪些实际需要。 / Arrange space, supplies, and participants’ needs.
- B. 只说大家开心就好，不检查条件。 / Say have fun without checking conditions.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。把场地、用品和休息安排好，参与活动的人才能实际得到照顾；只有一句关心还不够。 / Correct. Practical arrangements make care usable.
- 选择 B 的反馈：这题不对。本题应选：安排好场地和用品，也问清参加者有哪些实际需要。 把场地、用品和休息安排好，参与活动的人才能实际得到照顾；只有一句关心还不够。 / Not quite. The supported answer is: Arrange space, supplies, and participants’ needs. Practical arrangements make care usable.


#### p13-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：小严忙着给所有人准备材料，连自己吃饭、休息的时间都没有了。这个例子里，星币王后逆位表示照顾别人时忽略了自己，需要重新分工、留出休息；不是说关心别人有错。

**EN**: Yan prepares everyone’s materials while skipping personal needs. Here reversal means overextending care and neglecting oneself, calling for shared work and capacity limits.

**中**：负责照顾的人也有精力限制，需要休息和分工，才能继续提供帮助。

**EN**: Caregiver capacity is part of sustainable support.


#### p13-R3-CHECK · 逆位纠错后续题

**中**：替别人承担过多后，怎样继续关怀？

**EN**: Overextended by helping others, how continue caring?

- A. 商量哪些事能请别人分担，也给自己留出休息时间。 / Share tasks and preserve essential recovery.
- B. 继续多承担一些，等对方状态稳定后再安排自己的休息。 / Take on more for now and plan personal rest after the other person becomes stable.

**答案：A。讲解依据：T3 逆位背景。**

- 选择 A 的反馈：答对了。负责照顾的人也有精力限制，需要休息和分工，才能继续提供帮助。 / Correct. Caregiver capacity is part of sustainable support.
- 选择 B 的反馈：这题不对。这个做法没有解决眼前的情况。负责照顾的人也有精力限制，需要休息和分工，才能继续提供帮助。 / Not quite. This action does not resolve the situation described. Caregiver capacity is part of sustainable support.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p13-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p13-V1-CHECK · 新背景迁移

**中**：考试周朋友忙乱，怎样提供适当支持？

**EN**: A friend struggles during exams. Offer suitable support how?

- A. 先替对方安排任务，再看哪些事情需要他自己完成。 / Arrange the person's tasks first, then decide which parts they should handle themselves.
- B. 先问对方需要什么，再提供自己做得到的帮助。 / Ask what is needed and help within capacity.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。先问朋友需要什么，再看看自己能帮多少；不必把对方所有事情都接过来。 / Correct. Care considers both needs and feasible capacity.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。先问朋友需要什么，再看看自己能帮多少；不必把对方所有事情都接过来。 / Not quite. This action skips a key step in the question. Care considers both needs and feasible capacity.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币王后用实际行动照顾生活需要，比如安排好吃住、用品和休息，让日常生活更舒适稳定。照顾别人时，也要留意自己的时间、精力和基本需要，不限定任何性别或家庭身份。

**EN**: The Queen of Pentacles turns care into practical conditions and resource arrangements that sustain daily life. Care includes one’s own capacity and is not tied to gender or family role.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。


<a id="card-p14"></a>
### p14 · 星币国王 · King of Pentacles

**定位与依据**：逐牌编写的教学稿，未实施或试学验证；Word 六字段基线经本节展开，主含义依 S01 / S05，逆位示范是明确背景下的编辑选例，不声明唯一通用解释。原始牌图：[本地资产](../assets/cards/p14.webp)；[图片来源](https://commons.wikimedia.org/wiki/File:Pents14.jpg)；概念出处见 [来源](#sources)。

**目标 / Goal**：理解星币国王的核心主题，用一句完整意思解释，再在已教情境中使用。 / Understand the central theme of King of Pentacles, explain it as a complete meaning, and apply it in taught contexts.

**前提 / Prerequisite**：先读本节讲解；不要求已认识其他牌。用到花色或宫廷角色时，下面同时给出必要解释。 / Read the teaching below first; no other card is required. Necessary suit or court context is supplied here.

**本节不要求 / Not required**：背齐关键词、推导全部象征、判断他人身份、预测确定日期。 / Memorizing every keyword, decoding every symbol, identifying people, or predicting dates.

**进入顺序**：首次学习执行 T1 → Q1 → T2 → Q2 → 完成；学习过[中级逆位课程](#lesson-i04)后才能进入 T3 → Q3。R1/R2/R3 仅按错误触发；V1 留给后续回访。统一行为见[动态教学契约](#adaptive-contract)，操作文案见[统一文案](#ui-copy)。

#### T1 · 含义、画面与整理线索

**中**：星币国王善于安排和管理资源，把能力用到实际工作中，并让成果能长期保留下来、继续发挥作用。重点是管理、维护和责任，不是单凭财富外观判断成功。

**EN**: The King of Pentacles manages resources maturely, turning capability into lasting results and security. Management, maintenance, and responsibility matter more than a wealthy appearance.

**中**：国王持币，周围有葡萄与城堡。成果与稳定环境可帮助记住长期经营，不保证任何投资收益。

**EN**: A figure holds a pentacle among vines and a castle. Results and stable surroundings suggest long-term stewardship without guaranteeing investment returns.

**中**：星币对应土元素，常和金钱、物品、身体及实际生活有关；国王强调安排资源、作决定并承担责任。这张牌可以记成：稳妥管理、经营成果、长期保障。

**EN**: Pentacles correspond to Earth and commonly concern money, possessions, the body, and practical life. Earth concerns practical conditions; King emphasizes stewardship and responsibility, not gender or wealth. Helpers: steady management, results, lasting security.

#### 动画分镜 · 用视觉支持刚讲过的意思

**触发**：用户点“看画面讲解 / See the visual explanation”。**起始**：完整原牌稳定展示，尺寸位置不变。**强调对象**：持币人物、葡萄与城堡 / the pentacle holder, vines, and castle。**动作与结束**：用描边或半透明聚光依次强调上述对象，约 2.4 秒一轮；不修改人物姿态，不增画现实事件。结束恢复完整牌图，T1 的牌义与画面解释保留可读。动画暂停与进度暂停分开；可暂停、重播或跳过，均不影响完成。

**播放时文案 / On-screen caption**：国王持币，周围有葡萄与城堡。成果与稳定环境可帮助记住长期经营，不保证任何投资收益。 / A figure holds a pentacle among vines and a castle. Results and stable surroundings suggest long-term stewardship without guaranteeing investment returns.

**静态替代**：保留同一完整牌图及两幅静态强调状态，旁边是完全相同的双语说明；不用颜色单独传递含义。遵守[动画契约](#motion-contract)。


#### p14-Q1 · 核心理解

**中**：怎样让已经获得的成果长期发挥作用？

**EN**: What makes results sustainable?

- A. 把资源集中保存起来，暂时不安排使用和维护。 / Keep the resources stored together without arranging their use or maintenance.
- B. 不只拥有资源，还安排好怎样使用、谁来维护。 / Resources, maintenance, and responsibility align.

**答案：B。讲解依据：T1 核心含义。**

- 选择 B 的反馈：答对了。设备买回来以后，还要安排使用、保养和维修，才能一直有用。 / Correct. Enduring results need stewardship, not mere possession.
- 选择 A 的反馈：这题不对。只保存资源却不安排使用和维护，缺少让成果长期发挥作用的管理与责任。 / Not quite. Storing resources without a plan for use or maintenance lacks the stewardship that makes results last.


#### T2 · 先看一个有背景的应用示范

**中**：团队想长期运营共享工具间。建议位核对购买、维护和使用安排，明确谁负责，让成果能持续，而非只买最贵设备。

**EN**: A team wants to run a shared workshop long term. Advice checks purchase, maintenance, access, and responsibility rather than simply buying the most expensive equipment.

**本步操作 / Action**：看懂示范后，点“做一道练习 / Try a question”。此按钮只表示继续，不要求用户评价自己掌握程度。


#### p14-Q2 · 应用理解

**中**：运营共享工具间，先核对什么？

**EN**: Running a shared workshop: check what?

- A. 购买、维护、使用与负责人的安排。 / Purchase, upkeep, access, and responsibility.
- B. 先比较设备性能，运营和维护等购入后再补。 / Compare equipment performance first and add operation and maintenance plans after purchase.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。共用工作室想长期运行，就要考虑设备怎么保养、费用由谁承担，而不只是开张那一天。 / Correct. Long-term security includes conditions for ongoing use.
- 选择 B 的反馈：这题不对。这里要分清牌义的边界：共用工作室想长期运行，就要考虑设备怎么保养、费用由谁承担，而不只是开张那一天。 / Not quite. The boundary of the card meaning matters here: Long-term security includes conditions for ongoing use.


#### T3 · 后续深化：正位基础上的逆位情境

**中**：管理者为了让人看到自己拥有很多设备而不断购买，却不愿保养，设备陆续无法使用。这个例子里，星币国王逆位表示只顾拥有、没有管理好，需要重新安排用途和维护责任。

**EN**: A manager buys for the appearance of ownership but refuses maintenance, leaving equipment idle. Here reversal means possession overriding stewardship, requiring a review of use and upkeep.

**显示提示 / Caption**：下面只判断刚才这段背景。相同逆位换了问题，不一定采用相同解释。 / Judge only the stated context. The same reversal can require a different reading in a different situation.

**逆位动效**：由用户点“看这个逆位情境 / See this reversed context”，原牌在同一容器内转至逆位，约 600 ms；不要把正位文字自动替换成反义词。T3 背景先出现并持续保留，再让用户继续。静态模式直接显示逆位图片与相同文字；可暂停、重播、跳过。


#### p14-Q3 · 有背景的逆位

**中**：不断购买却拒绝维护，逆位提示什么？

**EN**: Buying repeatedly while refusing maintenance: reversal?

- A. 购买越多就说明维护越不重要。 / More purchases make maintenance less important.
- B. 只顾购买、忽略维护，需要重新安排设备的使用和保养。 / Possession and stewardship are unbalanced; restore management.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。设备买了却不能用，说明光是拥有不够；还需要维护、修理和安排使用。 / Correct. Idle equipment shows possession cannot replace upkeep.
- 选择 A 的反馈：这题不对。本题应选：只顾购买、忽略维护，需要重新安排设备的使用和保养。 设备买了却不能用，说明光是拥有不够；还需要维护、修理和安排使用。 / Not quite. The supported answer is: Possession and stewardship are unbalanced; restore management. Idle equipment shows possession cannot replace upkeep.


#### p14-R1 · Q1 对应的补讲

**触发与范围**：Q1 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：设备买回来以后，还要安排使用、保养和维修，才能一直有用。

**EN**: Enduring results need stewardship, not mere possession.

**中**：一项资源想长期有用，就要有人负责后续的保养和管理，不能买完就不管。

**EN**: Practical security requires continuing responsibility.


#### p14-R1-CHECK · 换个例子确认

**中**：为什么有成果后仍需要管理？

**EN**: Why manage after obtaining results?

- A. 有人维护、也有后续费用，成果才能继续使用下去。 / Results require upkeep and continuity.
- B. 有了成熟成果后，维护安排可以等出现问题再补。 / Once the result is mature, maintenance arrangements can wait until a problem appears.

**答案：A。讲解依据：T1 核心含义。**

- 选择 A 的反馈：答对了。一项资源想长期有用，就要有人负责后续的保养和管理，不能买完就不管。 / Correct. Practical security requires continuing responsibility.
- 选择 B 的反馈：这题不对。这个说法混淆了题目正在考的含义。一项资源想长期有用，就要有人负责后续的保养和管理，不能买完就不管。 / Not quite. This statement confuses the meaning being tested. Practical security requires continuing responsibility.


#### p14-R2 · Q2 对应的补讲

**触发与范围**：Q2 选错或依提示仍无法完成时使用，不拿这个分支处理无关的逆位误解。

**中**：共用工作室想长期运行，就要考虑设备怎么保养、费用由谁承担，而不只是开张那一天。

**EN**: Long-term security includes conditions for ongoing use.

**中**：社团道具不只要买回来，还要安排存放、使用和维修，才能反复使用。

**EN**: Stewardship concerns the full use cycle.


#### p14-R2-CHECK · 换个例子确认

**中**：社团已经买好道具，下一步怎样？

**EN**: A club has bought props. What next?

- A. 先投入使用，等损坏或丢失时再确定保管责任。 / Put the props into use and assign custody after damage or loss occurs.
- B. 说清谁保管、谁检查维修，以后谁负责安排使用。 / Assign storage, repair, and use responsibilities.

**答案：B。讲解依据：T1 核心含义与 T2 示范。**

- 选择 B 的反馈：答对了。社团道具不只要买回来，还要安排存放、使用和维修，才能反复使用。 / Correct. Stewardship concerns the full use cycle.
- 选择 A 的反馈：这题不对。这样做会漏掉题目里的关键一步。社团道具不只要买回来，还要安排存放、使用和维修，才能反复使用。 / Not quite. This action skips a key step in the question. Stewardship concerns the full use cycle.


#### p14-R3 · Q3 对应的逆位补讲

**触发与范围**：仅用于 Q3 的逆位误解，不转到无关正位练习。

**中**：管理者为了让人看到自己拥有很多设备而不断购买，却不愿保养，设备陆续无法使用。这个例子里，星币国王逆位表示只顾拥有、没有管理好，需要重新安排用途和维护责任。

**EN**: A manager buys for the appearance of ownership but refuses maintenance, leaving equipment idle. Here reversal means possession overriding stewardship, requiring a review of use and upkeep.

**中**：先让现有设备能正常使用、有人保养，比一味购买更多设备更重要。

**EN**: Stewardship concerns sustainable use, not more possessions.


#### p14-R3-CHECK · 逆位纠错后续题

**中**：设备拥有很多却闲置，应该怎样重新安排管理？

**EN**: Much equipment is idle. Restore stewardship how?

- A. 继续买更多，以数量掩盖闲置。 / Buy more to disguise the idle stock.
- B. 检查设备能做什么、哪里要修，以及谁负责处理。 / Check use, upkeep, and assigned responsibilities.

**答案：B。讲解依据：T3 逆位背景。**

- 选择 B 的反馈：答对了。先让现有设备能正常使用、有人保养，比一味购买更多设备更重要。 / Correct. Stewardship concerns sustainable use, not more possessions.
- 选择 A 的反馈：这题不对。本题应选：检查设备能做什么、哪里要修，以及谁负责处理。 先让现有设备能正常使用、有人保养，比一味购买更多设备更重要。 / Not quite. The supported answer is: Check use, upkeep, and assigned responsibilities. Stewardship concerns sustainable use, not more possessions.


**补学上限**：本卡每个目标最多两轮；这里明确提供一个针对性分支。没有另一个与当前误解匹配、已审定的分支时，直接使用下方总结并标记稍后回访，不临时生成题目凑足两轮、不重复原题刷正确率。补讲后答对记录为“在帮助下完成”，不计独立掌握。

#### p14-V1 · 延后回访

**呈现规则**：不紧跟答案出现；后续课或稍后一次学习中出现，牌图可看，T1/T2 默认收起。用户可用[统一提示入口](#ui-copy)，不要求自评。


#### p14-V1-CHECK · 新背景迁移

**中**：想靠自己的技能长期提供服务，按照星币国王的提醒，先考虑什么？

**EN**: Turning a skill into a reliable service: apply.

- A. 先确认自己的时间、设备和工作安排，能不能持续完成答应客户的服务。 / Check capacity, resources, and repeatable delivery.
- B. 先承诺客户需要的服务，再根据订单补齐时间和设备。 / Promise the requested service first and add the needed time and equipment as orders arrive.

**答案：A。讲解依据：T1 核心含义与 T2 示范。**

- 选择 A 的反馈：答对了。把技能做成服务后，还需要安排时间、维护设备、按约定完成工作，才能持续做下去。 / Correct. Sustained results need sustained stewardship.
- 选择 B 的反馈：这题不对。先承诺再补时间和设备，可能让服务无法持续兑现。星币国王要先核对容量、设备和工作安排，再答应客户。 / Not quite. Promising first and adding time or equipment later may make delivery unsustainable. The King of Pentacles asks you to check capacity, equipment, and workflow before committing.


#### 完成与接续

**学习总结 / Learning summary**

**中**：星币国王善于安排和管理资源，把能力用到实际工作中，并让成果能长期保留下来、继续发挥作用。重点是管理、维护和责任，不是单凭财富外观判断成功。

**EN**: The King of Pentacles manages resources maturely, turning capability into lasting results and security. Management, maintenance, and responsibility matter more than a wealthy appearance.

**完成反馈 / Completion**：这一轮已完成。你可以继续学新牌，之后会用新的情境再练这张牌。 / This round is complete. Continue to a new card; a later context will revisit this one.

**回访判据**：Q1 核心主题、Q2 应用与 Q3 逆位分别记录，不把一处失误推断成整张牌不会。V1 无提示正确只增加本次所测应用的证据，不宣称所有场景已掌握。暂停按[动态契约](#adaptive-contract)回到当前步骤及已揭晓状态，不强迫重学。

## R5 — 2026-09-23：整牌理解题与可选详细资料

**修改来源：**用户指出现有练习过于简单，无法支持逐张记住整副牌，并要求把每张牌的解析扩充为按需查看的详细资料。R5不改稳定牌ID、既有补学路由和存档键。

**当前有效实现：**`tools/build_academy.py`复用已有78张逐牌脚本、`guided-major.js`、`guided-minor.js`及`card-notes.js`，为每张牌生成一题“整牌理解”练习。每题有三个接近选项，要求把多个画面线索与核心含义合在一起判断；它不以牌名或单个关键词识别代替整牌理解，也不把错误答案转入不相干的补讲。首次正位学习因此增加一个独立的Q4学习证据。

每张牌同时生成默认收起的“完整牌义”资料，学习者主动展开后可看画面线索、核心牌义、正位应用、明确情境下的逆位示例、工作／关系／学习三类常见情境，以及解读边界。中英内容沿用项目已编写的双语材料；详细资料明确用于学习和自我反思，不作事实预测。

**来源与原创边界：**牌面身份与图像仍以S09为准；传统含义的组织边界仍按S01、S05与S08；三类生活情境、选项、反馈和资料编排是本项目原创教学内容。复用已有内容是为了避免同一张牌在不同入口出现互相冲突的解释，不表示来源作者或独立塔罗教师审核了本次生成结果。

**状态：**78张牌的数据覆盖、双语完整性、每题三选项与浏览器展开行为已纳入专项检查；真人试学、长期记忆效果和独立教师逐题复核仍待验证。


<a id="sources"></a>
### 8.3 整牌理解题的显式修订

整牌理解题 Q4 沿用历史引导课程的稳定选项 ID。若其中的展示文案需要修订，必须在这里逐项记录旧文案和新文案；构建器只按稳定题目与选项 ID 应用，并核对旧文案恰好匹配，不在代码里秘密改写教材。

| 题目 ID | 选项 ID | 原中文 | 原英文 | 修订后中文 | 修订后英文 |
|---|---|---|---|---|---|
| p02-Q4 | p02-Q4-2503863740 | 任务全部压在一人身上，需要重新分担。 | All tasks rest on one person and need redistribution. | 任务分配不均，需要把一部分工作交给别人。 | The workload is uneven, so some tasks should be handed to other people. |
| m00-Q4 | m00-Q4-81eb2c109a | 已经有具体目标，正带着计划向前。 | A definite goal and plan are already guiding you forward. | 对前路已经很有把握，所以可以轻装出发。 | The path ahead feels well understood, so it is reasonable to set out lightly. |
| w03-Q4 | w03-Q4-563a94b6bf | 消息已迅速到来，需要立即衔接下一步。 | Messages arrive quickly and need prompt follow-through. | 还在远处规划方向，尚未迈出第一步。 | The direction is still being planned from afar and the first step has not been taken. |
<!-- learning-q4-copy-overrides-end -->

整牌理解题的错误项反馈也必须跟随已经修订的选项。下表只覆写指定稳定选项 ID 的错误反馈；构建器同时核对旧反馈，避免选项已经变化、反馈却仍在解释旧答案。

| 题目 ID | 选项 ID | 原中文反馈 | 原英文反馈 | 修订后中文反馈 | 修订后英文反馈 |
|---|---|---|---|---|---|
| m00-Q4 | m00-Q4-81eb2c109a | 再看看这些细节：他轻装抬头向前，脚边却是悬崖：愿意尝试和留意风险要同时记住。所以本题更贴近「带着好奇开始，也别忘了看脚下。」。 | Look at these details again: He looks ahead with little baggage, but stands by a cliff: openness and caution belong together. The best fit here is “Start with curiosity, and watch your step.” | 这个解释没有把画面线索连起来。他轻装抬头向前，脚边却是悬崖：愿意尝试和留意风险要同时记住。 | This reading does not connect the picture cues. He looks ahead with little baggage, but stands by a cliff: openness and caution belong together. |
| w03-Q4 | w03-Q4-563a94b6bf | 再看看这些细节：人物望着水面上的船，适合联想到行动已经向外展开，正在观察后续。所以本题更贴近「已经迈出第一步，接下来跟进回应。」。 | Look at these details again: The figure watching ships suggests activity sent outward and attention to what comes next. The best fit here is “The first step is taken: follow up on the response.” | 这个选项忽略了图中已经给出的区别。人物望着水面上的船，适合联想到行动已经向外展开，正在观察后续。 | This option overlooks a distinction already visible in the picture. The figure watching ships suggests activity sent outward and attention to what comes next. |
<!-- learning-q4-feedback-overrides-end -->

逐题文案修订后，选项继续使用改写前的稳定 ID，避免恢复中的旧答案失去指向。这里记录的中文必须与题目正文一致；构建时逐项核对，缺失、重复或文案不一致都会失败。

| 题目 ID | 选项字母 | 稳定选项 ID | 当前中文 |
|---|---|---|---|
| A05-Q2 | A | A05-Q2-5b3d55505c | A 路线里星币牌更多，因此先把它看成更稳妥 |
| m16-Q1 | B | m16-Q1-a7443682d9 | 把突然冲击具体理解成近期交通出行会受阻 |
| p08-Q3 | A | p08-Q3-db60b7ed2d | 练了很久还没有进步，说明更适合换一种技能学习。 |
| p13-R1 | A | p13-R1-e9de76c57f | 先确认材料、照明和休息时间，缺的东西一起准备好。 |
| p13-R1 | B | p13-R1-f6e7ab2989 | 告诉对方自己真心希望这次进展顺利，具体准备由对方临时处理。 |
| B02-Q2 | B | B02-Q2-3b37370369 | 建议按固定三次切牌，让这套流程更完整。 |
| B02-R2 | B | B02-R2-b85758f650 | 先补做一次切牌，再按原问题重新抽一张。 |
| B04-R2 | B | B04-R2-865e9d02ff | 先把不同的“八”统一成一条口诀，再用同一口诀解释星币八。 |
| B04-V1 | A | B04-V1-324ef69c9f | 先暂停应用，等把数字表背熟后再解释这张牌。 |
| B05-Q2 | A | B05-Q2-2c08cddfb1 | 优先把王后理解为题目里较成熟的女性。 |
| B06-Q1 | A | B06-Q1-5dc4ee01fc | 把出错的小节多做几遍，先用熟练度弥补问题。 |
| B07-Q2 | A | B07-Q2-8e6723cbb6 | 先接受对方的要求，避免当场冲突，之后再处理自己的不满。 |
| B07-R2 | A | B07-R2-cf080a85f4 | 先接下额外工作，等忙不过来时再说明限制。 |
| B08-Q1 | A | B08-Q1-440645bc97 | 先等对方表态，再决定是否说明自己的本意。 |
| B08-R1 | A | B08-R1-f7d6772b6a | 分析朋友可能什么时候回复。 |
| B08-R2 | B | B08-R2-99e9151a14 | 继续追问，让对方尽快给出结论。 |
| B08-V1 | A | B08-V1-3ee0a6df65 | 先再收集更多备考资料，等准备充分后开始练题。 |
| I01-Q1 | B | I01-Q1-c004bcb868 | 核心意思要和教材关键词基本一致，才算真正掌握。 |
| I01-Q2 | A | I01-Q2-cc4576acdd | 先换更好的设备，再开始练习构图。 |
| I03-R2 | A | I03-R2-c716a293a2 | 从主持者的身份与风格推断活动气氛。 |
| I03-V1 | B | I03-V1-cdff079806 | 把合作设想写得很动人，让对方自然明白你希望他参加。 |
| I04-Q1 | A | I04-Q1-7e9d736186 | 练习次数在增加，原来的错误也会逐渐自行消失。 |
| I05-Q2 | A | I05-Q2-7b2eed8f9b | 是，障碍位会把星币八原本的勤练转成过度练习。 |
| I06-Q1 | A | I06-Q1-6e0214a99a | 先继续讨论大家理想中的展览，等想法足够一致后再动手。 |
| I06-Q2 | B | I06-Q2-d1e0bc7efe | 先营造大家一起庆祝的气氛，准备工作可以边做边补。 |
| A01-V1 | B | A01-V1-3e5c2fd714 | 最好改成感受问题，因为塔罗更适合谈心理状态。 |
| A02-R1 | A | A02-R1-5802e86bbc | 各自先把自己的安排定死，再看谁愿意迁就。 |
| A02-V1 | A | A02-V1-4c21425c90 | 先照顾大家的情绪，具体时间和分工可以活动前再定。 |
| A03-Q1 | B | A03-Q1-ce549902dd | 有学习意愿，也有很多选择；继续同时尝试，之后自然会找到方向。 |
| A03-R1 | B | A03-R1-df0c7e4fc9 | 愿意学习，项目多说明兴趣广；先轮流都做一点，再看哪个先有成果。 |
| A03-V1 | B | A03-V1-aa0f925572 | 从收藏的菜谱中每天换一道尝试，用多做几个方向来寻找最适合的。 |
| A05-R2 | A | A05-R2-82e01be237 | A 路线有人一起讨论，合作本身就足以抵消期限和工作量。 |
| A05-V1 | B | A05-V1-d43ba94a36 | 保留现有任务，用更严格的日程把它们同时推进。 |
| A06-Q1 | A | A06-Q1-04c3ec56f9 | 活动临近时会出现新的麻烦，需要提前防范。 |
| A06-R1 | A | A06-R1-3f52ed77e2 | 宝剑九的担忧比权杖四更强，因此结局仍应按担忧来判断。 |
| A06-V1 | A | A06-V1-bb95225bb4 | 横放时先按逆位解释，再结合第二张牌修正。 |
| m00-Q2 | A | m00-Q2-e6d3ff3509 | 先买齐一整套设备，再决定自己是否喜欢陶艺。 |
| m00-Q3 | B | m00-Q3-a6bfb57e4c | 先把计划放一段时间，等自己不再担心风险。 |
| m00-R1 | A | m00-R1-aa69704b03 | 不算，至少连续做几次才说明真的开始。 |
| m00-R2 | B | m00-R2-b41d6da6f0 | 有些矛盾，开放尝试应该在开始前准备好较完整的工具。 |
| m00-V1 | B | m00-V1-39b414549c | 先系统学习写作方法，准备好完整大纲再写第一篇。 |
| m01-Q1 | A | m01-Q1-e78962ba55 | 先把现有工具分类整理清楚，等方案完整后再开始。 |
| m01-R2 | A | m01-R2-82516a87d4 | 更适合尽量多用现有工具，以免遗漏可用资源。 |
| m01-V1 | A | m01-V1-e4bdcfd679 | 继续收集更合适的材料，等选择更齐全后再做样品。 |
| m03-Q1 | A | m03-Q1-9ae9cf624f | 替对方安排好节奏，尽快把成果催出来。 |
| m03-Q3 | A | m03-Q3-186e28f2f1 | 暂时停止支持团队，把精力转向自己休息。 |
| m03-V1 | A | m03-V1-341bdbc9a4 | 用人数增长和完成指标来判断社团发展，把成员需要的支持放在后面。 |
| m04-Q1 | B | m04-Q1-102c203728 | 由负责人集中做决定，其他人按统一指令执行。 |
| m04-Q3 | B | m04-Q3-3296fe7db3 | 先维持原流程，等大家适应后再考虑调整。 |
| m04-R2 | B | m04-R2-c8ccd28cd1 | 基本够，大家可以根据期限自行认领剩余工作。 |
| m05-Q1 | A | m05-Q1-2cfb27d81d | 以沿用传统规则为主，较少追问这些方法是否适合当下。 |
| m05-Q3 | A | m05-Q3-79ab602c4b | 先保留旧规定，再让成员逐步适应它。 |
| m05-R3 | B | m05-R3-9340c7c1b1 | 这类规则的指导方式整体不再适合当前团队。 |
| m06-Q3 | B | m06-Q3-69e97092ee | 先判断谁更愿意为关系让步，再决定是否继续。 |
| m07-Q2 | B | m07-Q2-e52ad0b087 | 先推进最紧急的任务，其他任务也尽量保持原进度。 |
| m07-R1 | B | m07-R1-73b9f3a075 | 大体是，持续忙碌通常说明事情正在推进。 |
| m08-Q2 | A | m08-Q2-1f8fe4e511 | 先不回应，等情绪过去后让这次分歧自然淡化。 |
| m08-Q3 | B | m08-Q3-e1c03cc00d | 暂时减少需要表达意见的场合，避免再次失控。 |
| m09-Q1 | A | m09-Q1-85da3ca3d5 | 先把别人的建议放下，只凭自己的第一感觉决定。 |
| m09-Q2 | B | m09-Q2-d9d81ce11c | 从推荐人数最多的课程开始，借助大家的选择缩小范围。 |
| m09-Q3 | A | m09-Q3-ad9aa3947f | 继续独自整理，等想清楚后再恢复交流。 |
| m09-V1 | A | m09-V1-575b21df95 | 把最受欢迎的建议当成自己的方向，不再检查自己想表达什么。 |
| m10-Q1 | B | m10-Q1-37f969779b | 外部局面改变后，机会通常会自然转向更有利的一面。 |
| m10-Q3 | B | m10-Q3-84a3b352d6 | 变化来得太快，当事人暂时还没有等到合适的新机会。 |
| m10-R1 | A | m10-R1-90d812c012 | 大体相同，局面转动通常意味着机会增加。 |
| m10-R3 | A | m10-R3-25b6f28320 | 先等局面稳定，再决定要不要修改原来的安排。 |
| m10-V1 | B | m10-V1-d41f9055c6 | 先暂停学习，等图书馆重新开放后再按原计划继续。 |
| m11-Q1 | A | m11-Q1-d3d22ba221 | 先找到对自己最有利的规则解释，再准备论据。 |
| m11-Q3 | A | m11-Q3-774e3e4072 | 评选结果得到多数人接受，就可以视为标准足够公平。 |
| m12-Q1 | B | m12-Q1-a050e41177 | 先保持停顿，让答案随着时间逐渐显现。 |
| m12-Q3 | B | m12-Q3-fa9104006b | 暂停时间还不够长，需要继续等到想法自然变化。 |
| m12-R3 | A | m12-R3-6801c26fe7 | 继续观察一段时间，看答案会不会逐渐出现。 |
| m13-Q1 | A | m13-Q1-fc07587f7a | 经历重大变化时，重点在原来的生活被打乱和失去。 |
| m13-Q2 | B | m13-Q2-4ca18eab99 | 先维持原任务，等新的安排更明确后再交接。 |
| m13-Q3 | A | m13-Q3-39a2c5ea62 | 旧项目可能还有恢复机会，因此暂时不宜交接。 |
| m13-R2 | A | m13-R2-7567c338ba | 先停止投入，等接手人主动来了解剩余事项。 |
| m14-Q2 | A | m14-Q2-47eadc00fb | 把学习和休息固定成相等时段，先用统一比例稳定节奏。 |
| m14-R1 | A | m14-R1-89e1021acb | 调和应该先定一个固定比例，条件变化后也继续照做。 |
| m14-R3 | A | m14-R3-f6534f62b6 | 把每天学习时间定得更长，即使睡眠不足也先坚持。 |
| m14-V1 | B | m14-V1-4864c67994 | 让较慢的一方跟上较快的一方，把流程统一到同一速度。 |
| m15-Q3 | A | m15-Q3-8f05a3056f | 已经看清诱因，之后主要靠意志力避免再次发生。 |
| m15-R1 | B | m15-R1-ec9b43d928 | 短暂舒服说明眼前需求得到满足，限制可以以后再看。 |
| m15-R2 | A | m15-R2-c5882dbe7f | 先问自己怎样增强意志力，避免下一次点开。 |
| m15-R3 | B | m15-R3-6b7c432408 | 继续分析习惯的原因，等理解得更充分后再行动。 |
| m16-R3 | A | m16-R3-3bd6ccfcc6 | 先暂时避开薄弱处，等外部条件改变后再处理。 |
| m17-Q1 | A | m17-Q1-77269031eb | 保持乐观，相信眼前愿望会按期待推进。 |
| m17-Q3 | A | m17-Q3-7a6743f083 | 把这次失败当作主要依据，先降低后续目标。 |
| m17-R3 | B | m17-R3-3637d0a8f5 | 说明之前的担心多余，可以恢复原来的高目标。 |
| m18-Q1 | B | m18-Q1-5d13c0fd3d | 对信息保持怀疑，优先相信自己的直觉判断。 |
| m18-Q2 | A | m18-Q2-2de7f4968b | 朋友可能在回避这段关系。 |
| m18-Q3 | B | m18-Q3-52643a008d | 事情开始清楚，是因为直觉逐渐接近真实情况。 |
| m18-R2 | B | m18-R2-5ee4021ae6 | 先按较可能的负面原因做准备，再决定要不要沟通。 |
| m19-Q1 | A | m19-Q1-f3bdef439c | 事情进入顺利阶段，接下来的进展会更容易。 |
| m19-Q3 | A | m19-Q3-6b59553885 | 是不是目标定得还不够高，导致进展不够明显。 |
| m19-R3 | B | m19-R3-a91737510a | 先提高下一阶段目标，让已有进步显得更有意义。 |
| m20-Q1 | B | m20-Q1-052d9cea1f | 找出过去是谁造成问题，以免自己再次受影响。 |
| m20-Q3 | B | m20-Q3-461fd41e2d | 信息还需要整理得更完整，等判断更确定后再决定。 |
| m20-R2 | B | m20-R2-6d939c4c70 | 为了避免重蹈覆辙，先拒绝和过去相似的合作方式。 |
| m21-Q3 | A | m21-Q3-c466c91beb | 主体内容已经完成，最后手续对成果影响不大。 |
| m21-R2 | A | m21-R2-102530985e | 世界显示事情接近完成，因此可以把结果视为已经确定。 |
| m21-R3 | B | m21-R3-c862cf6d7d | 先回顾已经做过的工作，确认前面的投入是否值得继续。 |
| m21-V1 | A | m21-V1-538cb05412 | 把这次成功当成以后展览的固定模板，继续复制同样做法。 |
| B03-Q2 | A | B03-Q2-a12282e607 | 可以，不过工作里的圣杯主要看同事之间是否亲近。 |
| B04-Q2 | B | B04-Q2-7a236bccc9 | 先选一套自己最顺手的数字口诀，用它解释同数字的牌。 |
| B05-V1 | B | B05-V1-fb3401163e | 不太适合，经验丰富的人更接近国王角色。 |
| B07-V1 | B | B07-V1-994e87452f | 先表达自己的合作目标，让对方按这个方向回应。 |
| I02-Q1 | A | I02-Q1-bf1c4837b9 | 家庭财务稳定带来的安心感。 |
| I02-R1 | A | I02-R1-0194149a05 | 把食物和场地准备得更丰富，让主人承担好招待工作。 |
| I02-R2 | B | I02-R2-60afcfd6b0 | 能，数字十通常提示事情接近十个时间单位。 |
| I04-Q2 | B | I04-Q2-36dc054e35 | 能，星币八逆位更常见的是练得太多。 |
| I04-V1 | A | I04-V1-b45fd4bd6a | 作品还不够成熟，需要继续打磨。 |
| A02-Q1 | A | A02-Q1-513a1732c9 | 目前的行程安排看起来已经比较协调。 |
| A04-Q2 | B | A04-Q2-bb1a48fbab | 帮助主要来自一位经验较少但做事务实的人。 |
| A04-R1 | A | A04-R1-50dbe69b3c | 花在作品上的总时间是不是还不够。 |
| m02-R2 | B | m02-R2-df3b3ca4e0 | 不太适合；保持观察比主动询问更能保护还没成形的直觉。 |
| m03-Q2 | B | m03-Q2-31aaa03ff1 | 把交稿目标拆得更细，用进度要求推动完成。 |
| m03-R2 | A | m03-R2-9398b513d9 | 休息主要照顾创作者，和作品本身的成长关系不大。 |
| m04-Q2 | A | m04-Q2-7cbe7a9d45 | 增加一次提醒，让每个人自行留意交接。 |
| m04-V1 | B | m04-V1-5218dc7539 | 由最擅长家务的人统筹，其他人有需要时再帮忙。 |
| m05-R1 | B | m05-R1-62997ad7dd | 最好先照着老师示范完成，再把疑问留到学会以后。 |
| m05-R2 | A | m05-R2-a87c42c919 | 为了避免走弯路，先把不同情境都套进同一套步骤。 |
| m06-Q2 | A | m06-Q2-040510c54d | 工资相近时，优先比较哪份工作看起来更稳定。 |
| m08-Q1 | B | m08-Q1-8055ab6906 | 先压住情绪，不表露立场，等对方态度缓和。 |
| m09-R2 | A | m09-R2-6a6eb86228 | 可以，不过最好先接受对方给出的方向，减少自己的犹豫。 |
| m11-R2 | A | m11-R2-776107a677 | 带上自己认为更合理的分工方案。 |
| m12-R1 | A | m12-R1-83759aa14f | 暂停能让情绪降下来，之后继续原来的做法。 |
| m12-V1 | B | m12-V1-cd0440501a | 暂停阅读，等精神更好时再从同一句重新读起。 |
| m13-V1 | A | m13-V1-a641c00e5c | 先保留旧习惯，同时慢慢增加新的学习方式。 |
| m14-Q1 | B | m14-Q1-82f61b9a9d | 在几个需要之间轮流补齐，尽量让每项投入接近。 |
| m15-Q2 | B | m15-Q2-50fb043030 | 给自己设置更严格的练习目标，用任务压力压住刷视频的冲动。 |
| m16-Q3 | B | m16-Q3-eb1e01c311 | 先维持表面正常，等出现明确损失后再调整。 |
| m17-Q2 | B | m17-Q2-ed0c514fa5 | 先设想最终成功的样子，用积极情绪替代挫败感。 |
| m17-R2 | A | m17-R2-ce7c0bdd8d | 先恢复到受挫前的强度，借完整投入找回信心。 |
| m19-R1 | B | m19-R1-ab0106d8d3 | 可以先突出完成的部分，未完成内容等别人追问时再说明。 |
| m20-V1 | B | m20-V1-b6eaf97321 | 回想上一次拖延带来的压力，用自责提醒自己下次别再犯。 |
| I05-R2 | A | I05-R2-66f1712c48 | 最近花在修改同一张照片上的时间比较多。 |
| w01-Q2 | A | w01-Q2-daf66e6be0 | 先把人物设定和章节大纲写完整，再开始第一个场景 |
| w01-Q3 | B | w01-Q3-cac76ee8f5 | 灵感已经成熟，先等待合适的拍摄时机 |
| w01-R1 | A | w01-R1-7ab255eac1 | 第一张草图说明方案已经成熟，可以直接扩大种植规模 |
| w01-RA | B | w01-RA-67d9a42a75 | 先完善发行定位和包装，再考虑安排试玩。 |
| w02-Q3 | A | w02-Q3-7243ac2abc | 先沿用熟悉渠道，等需求主动出现再规划 |
| w02-R2 | A | w02-R2-8c1615264a | 先把远程合作搁置，等熟悉的人提出具体方案 |
| w03-Q1 | B | w03-Q1-3f0b03e06c | 还在选择方向，尚未把想法交给外部 |
| w03-Q2 | A | w03-Q2-c0748d7a59 | 先构思另一件作品，收到回复后再准备补充材料 |
| w03-Q3 | B | w03-Q3-2c1e78cc0b | 回复延迟说明提案还没真正进入合作流程 |
| w03-R1 | A | w03-R1-ed5304aed4 | 把注意力转回完善样品，等合作方主动联系 |
| w03-RA | B | w03-RA-81ff9d9fbb | 先继续修改作品，收到追问后再核对尺寸。 |
| w03-V1 | A | w03-V1-4d7d0dcbef | 申请递交后不再查看通知，也不准备可能的面试。 |
| w04-Q1 | A | w04-Q1-1c6f7fa55d | 为阶段成果高兴，也说明后续安排已经稳定 |
| w04-Q2 | B | w04-Q2-a24e50068a | 先继续推进下一个目标，等成果更完整再一起庆祝 |
| w04-Q3 | A | w04-Q3-ead749f76e | 活动按计划完成，接纳感的问题会随着庆祝慢慢缓解 |
| w04-R1 | B | w04-R1-2cdce2d64d | 新空间已经启用，接下来主要关注个人效率 |
| w04-V1 | B | w04-V1-a6fec093b2 | 搬家完成后先各自整理，等生活稳定再表达感谢 |
| w05-Q1 | B | w05-Q1-0cc6c801c8 | 大家方向不同，说明各自方案已经成熟，只需选出较好的一项 |
| w05-Q2 | A | w05-Q2-9d8e8eb908 | 先投票淘汰争议较大的意见，再讨论训练目标 |
| w05-R1 | A | w05-R1-14b9601eea | 各自方案都很积极，继续自由发挥就会形成配合 |
| w05-RA | B | w05-RA-a84e4d0d93 | 先选出表达最有说服力的人定方案，减少反复讨论。 |
| w05-V1 | A | w05-V1-4f28acca90 | 让使用经验较长的小组先决定场地规则 |
| w06-Q1 | A | w06-Q1-cc54b4365a | 努力取得了成果，重点是自己心里感到满意 |
| w06-Q3 | A | w06-Q3-72e0a67440 | 掌声不够，说明作品还没有值得肯定的成果 |
| w06-R1 | B | w06-R1-c4e9492b5d | 公开肯定说明这次作品已经达到成熟水平 |
| w06-RA | A | w06-RA-b493184b7e | 继续沿用获奖时的工具，避免新工具影响表现。 |
| w06-R2 | A | w06-R2-ae60f33930 | 先增加宣传，让点赞数跟上作品质量 |
| w07-Q1 | B | w07-Q1-e902816d5b | 遇到挑战时尽量守住当前做法，不轻易调整 |
| w07-Q2 | A | w07-Q2-c3e25f4c8d | 先把新增任务接下来，再从原任务中删掉一部分 |
| w07-R1 | A | w07-R1-e651711864 | 先花时间解释那句误会，避免关系继续紧张 |
| w07-R2 | B | w07-R2-37d4d75793 | 挑较容易反驳的评论回应，证明立场站得住 |
| w07-V1 | A | w07-V1-acef7524ca | 先答应省略一次检查，等项目顺利后再恢复标准 |
| w08-Q1 | A | w08-Q1-53c6a03607 | 八根权杖对应八个连续步骤，需要按顺序推进 |
| w08-Q3 | A | w08-Q3-8347fc7a25 | 先按最近收到的通知执行，之后再处理冲突 |
| w09-Q2 | A | w09-Q2-447dadea2b | 维持原训练量，把恢复安排放到比赛之后 |
| w09-Q3 | B | w09-Q3-11fe2a20b9 | 注意力下降说明需要更强的训练刺激来找回状态 |
| w09-RA | B | w09-RA-68f1e78203 | 保持原排练量，把恢复留到走台结束。 |
| w09-V1 | A | w09-V1-170c2cf5a5 | 把最后检查交给临场状态，先集中精力继续推进 |
| w10-Q1 | A | w10-Q1-e7af7d845d | 任务多说明承担能力强，应该维持现有负荷 |
| w10-Q2 | B | w10-Q2-2f1f9c620a | 先调整自己的时间，提高处理任务的效率 |
| w10-Q3 | A | w10-Q3-ca985f63ad | 任务分出去以后，协调责任也交给接手的伙伴 |
| w10-R1 | B | w10-R1-8c1954ff7e | 先提高做事效率，再判断是否需要删减任务 |
| w10-RA | A | w10-RA-eb5ce3053b | 压缩每项任务的用时，继续由负责人统一完成。 |
| w10-R2 | A | w10-R2-b528efae70 | 只分出执行任务还不算减负，协调也应交出去 |
| w10-V1 | B | w10-V1-efb489ffa2 | 重新排好三项工作的先后，继续由一人完成 |
| w11-Q1 | B | w11-Q1-ad60de4d7a | 主要描述年轻、经验较少的学习者 |
| w11-Q3 | B | w11-Q3-83cb8abda4 | 收藏的教程已经足够说明自己适合这些兴趣 |
| w11-RA | B | w11-RA-d04d29b172 | 先把基础理论学得比较完整，再安排第一次操作。 |
| w12-Q2 | B | w12-Q2-79055c2f47 | 趁热情较强时多开几个项目，之后再挑一个完成 |
| w12-Q3 | A | w12-Q3-b94c76ceca | 不断换方向说明探索范围正在稳步扩大 |
| w12-R1 | B | w12-R1-371413ef6c | 能，主动发出邀请说明他愿意长期投入 |
| w13-Q1 | B | w13-Q1-34a4b6978d | 不断抢过话题，要求别人照自己的办法参与。 |
| w13-R1 | A | w13-R1-142089592b | 不太适用，王后角色更侧重女性的表达方式 |
| w13-R2 | B | w13-R2-253c77f645 | 继续打磨，等自己觉得足够成熟再展示 |
| w13-V1 | A | w13-V1-da05cfa4c0 | 由带领者先确定做法，新人照着参与 |
| w14-Q1 | A | w14-Q1-a002b084a2 | 先树立有感染力的大目标，具体条件让团队边做边补 |
| w14-Q2 | B | w14-Q2-44c29abfb7 | 重点放在鼓舞大家，具体分工让成员自行协调 |
| w14-V1 | B | w14-V1-71b70875c3 | 方向清楚之后，让成员自行解决时间和场地冲突 |
| c01-Q1 | B | c01-Q1-deb6017d47 | 这份感动说明双方关系已经进入稳定阶段 |
| c01-Q2 | A | c01-Q2-03ef8081cc | 先把这份感动理解为长期方向，再决定怎样表达 |
| c01-Q3 | B | c01-Q3-297347c934 | 说不出口说明这份感谢还不够明确 |
| c01-RA | B | c01-RA-0b3cc01404 | 先判断这份感谢会不会改变关系，再决定是否说出来。 |
| c01-R2 | B | c01-R2-b1b1fdf3a3 | 等找到足够郑重的表达方式，再向朋友道谢 |
| c01-V1 | A | c01-V1-87a5bbab7f | 这份创作灵感主要来自技巧进步，与感受关系不大 |
| c02-Q1 | A | c02-Q1-86f533433b | 一方主动表达，另一方默认接受，也算形成共识 |
| c02-R1 | B | c02-R1-233e05698f | 不太适用，社团合作更适合从星币角度理解 |
| c02-V1 | B | c02-V1-b2f98f1137 | 彼此愿意倾听，说明合作期待已经一致 |
| c03-Q1 | B | c03-Q1-288aaaead7 | 三个人聚在一起，重点是共同完成正式仪式 |
| c03-Q2 | A | c03-Q2-7a0d762c6b | 先独自整理成绩，等下一次课程再和伙伴交流 |
| c03-R1 | A | c03-R1-fdc4b98ddd | 项目完成后的祝贺主要代表个人获得认可 |
| c03-RA | B | c03-RA-d9b091944d | 把重点放在场地和流程上，不安排与支持自己的朋友交流。 |
| c03-V1 | A | c03-V1-1691748ab3 | 要有明确成果值得庆祝，伙伴间的日常支持还不算 |
| c04-Q1 | A | c04-Q1-be48a6a0f6 | 没有回应通常说明这个机会吸引力不足 |
| c04-Q2 | B | c04-Q2-22e48e151a | 马上拒绝邀请，不再了解自己只是疲惫还是课程确实不合适。 |
| c04-Q3 | A | c04-Q3-1475f905c3 | 只礼貌回复已经收到，不再了解活动内容。 |
| c04-R2 | A | c04-R2-bece91a5df | 礼貌问一句活动时间，之后不再了解内容。 |
| c05-Q1 | B | c05-Q1-41a1d0ae7c | 倒下的杯子更重要，应先集中处理已经失去的部分 |
| c05-Q2 | A | c05-Q2-91399ac751 | 先把失败原因分析清楚，等能独立调整好再考虑求助 |
| c05-Q3 | B | c05-Q3-ca01739649 | 开始联系支持者，说明这次失利对自己的影响已经很小 |
| c05-R2 | B | c05-R2-7d4883f22f | 仍会难过，说明现在还没准备好接受别人的帮助 |
| c05-V1 | A | c05-V1-c07ba9e468 | 先专注演出取消的原因，等问题解决后再联系团队 |
| c06-Q1 | A | c06-Q1-3708185f3c | 温暖回忆说明过去的关系适合在现在重新开始 |
| c06-Q2 | B | c06-Q2-8ec91f08dd | 尽量照搬小时候的阅读方式，才能找回原来的快乐 |
| c06-Q3 | A | c06-Q3-0085f4ae36 | 熟悉的做法曾经有效，可以先继续沿用再观察 |
| c06-R1 | B | c06-R1-18d295cd9a | 这句问候说明老朋友有意恢复过去的相处方式 |
| c06-RA | A | c06-RA-6a570e31d9 | 把每月小聚改成线上每周见，尽量还原从前的频率。 |
| c06-V1 | B | c06-V1-103cdb9c06 | 重新练习时保持祖辈原来的做法，避免加入新的方法 |
| c07-Q1 | B | c07-Q1-02b3ed9045 | 吸引人的选项很多，先都保留可以避免错过机会 |
| c07-Q2 | A | c07-Q2-963e892e8e | 先报名几门最喜欢的课，开课后再根据时间决定退掉哪门 |
| c07-R1 | A | c07-R1-a2ca24a5fb | 列出目的地后，优先从最想去的地方开始订票 |
| c07-RA | B | c07-RA-0a6e258ced | 先报名三门，把上课时间冲突留到开课后协调。 |
| c07-R2 | B | c07-R2-c605fa7932 | 排除计划会限制创造力，应先继续扩充选择 |
| c07-V1 | A | c07-V1-cc12275a18 | 把三种想法都按完整项目推进，不先比较时间和资源。 |
| c08-Q1 | A | c08-Q1-694cc38951 | 离开代表对原来的投入失望，重点是尽快换方向 |
| c08-Q2 | B | c08-Q2-bbd9e49d7f | 因为已经投入多年，继续参加，不再检查它是否符合现在的目标。 |
| c08-R1 | B | c08-R1-78ddc10685 | 是，若成果还在，离开就更像逃避现有问题 |
| c08-RA | A | c08-RA-55b4c39dc1 | 先退出社团，把已答应的任务留到之后再解释。 |
| c08-V1 | B | c08-V1-2f9ac62abb | 旧方向既然已经有成果，就应继续深化而不是转向 |
| c09-Q1 | B | c09-Q1-c41277d437 | 重点是共同关系中的满足感，个人感受放在其次 |
| c09-Q2 | A | c09-Q2-c50c81feb1 | 先把成绩分享给别人，得到肯定后再享受成果 |
| c09-Q3 | B | c09-Q3-c9c4b3b4d3 | 买到想要的东西，满足感会随着时间慢慢出现 |
| c09-RA | B | c09-RA-8e750e9cfb | 先说服朋友欣赏这款口味，再庆祝自己的成果。 |
| c09-R2 | B | c09-R2-9d9ff9bc1c | 再换一种更符合期待的商品，看看心情能否改善 |
| c09-V1 | A | c09-V1-138ad21cb9 | 自己满意还不够，要先得到观众认可才算完成 |
| c10-Q1 | A | c10-Q1-f86ecabb95 | 重点是家庭或群体呈现出和谐的样子 |
| c10-Q3 | A | c10-Q3-ba2cbbd69f | 照片里的和谐说明分歧暂时不会影响共同生活 |
| c10-R1 | B | c10-R1-de927e3463 | 能，有人玩得很开心，说明行程整体安排得不错 |
| c10-R2 | A | c10-R2-8561be8062 | 先把共同生活的安排照旧维持，等时机合适再谈差异 |
| c10-V1 | B | c10-V1-ce210a6aac | 愿意继续合住，说明彼此的生活期待已经相同 |
| c11-Q3 | B | c11-Q3-612e98da6a | 没能表达，说明自己还没有理解这份感受 |
| c11-R1 | A | c11-R1-9bef4011f3 | 先把这份感受定义清楚，再决定是否继续接触创作 |
| c11-RA | B | c11-RA-ab14a24777 | 先多读几篇范文，等能写得完整再开始感谢卡。 |
| c11-R2 | B | c11-R2-07479b9433 | 先在心里反复练习，等措辞比较成熟再开口 |
| c11-V1 | A | c11-V1-d91fc27beb | 成年人更适合王后或国王，侍从偏向还没成熟的孩子 |
| c12-Q1 | A | c12-Q1-99a7c52da1 | 先在心里形成理想，再等待对方给出回应机会 |
| c12-R1 | B | c12-R1-47342b88a2 | 能，主动邀请说明他愿意认真经营这段关系 |
| c12-R2 | A | c12-R2-011c16cac7 | 先重写更有吸引力的合作愿景，重新激发对方动力 |
| c12-V1 | B | c12-V1-5e699582f1 | 社区活动提案更偏工作安排，与这张牌的情感动力关系不大 |
| c13-Q1 | B | c13-Q1-6ee692209d | 根据自己的类似经历推测对方现在需要什么 |
| c13-Q2 | A | c13-Q2-8db55a75ac | 先分享自己的类似经历，让朋友知道你理解他 |
| c13-Q3 | B | c13-Q3-ef1a7a3c6f | 多承担朋友的事情，可以减轻他的情绪压力 |
| c13-R1 | A | c13-R1-417f174067 | 保留原先判断，同时从他的疲惫里寻找生气的迹象 |
| c13-R2 | B | c13-R2-9809c486e2 | 先把朋友的需要安排好，自己的休息之后再补回来 |
| c14-Q1 | A | c14-Q1-8b59d72848 | 把情绪压下来，保持外表平静地处理事情 |
| c14-Q2 | B | c14-Q2-02217a624d | 先由负责人定好分工，大家接受安排后情绪会慢慢缓和 |
| c14-Q3 | A | c14-Q3-0ad0d3c735 | 平时保持沉默，有助于把愤怒慢慢消化掉 |
| c14-R1 | B | c14-R1-6361a11631 | 不算稳定，应该先把难过平复后再讨论下一步 |
| c14-RA | A | c14-RA-281ebddecf | 先把任务重新分配好，情绪问题等活动结束再谈。 |
| p01-Q3 | B | p01-Q3-fa49b2d65b | 机会已经出现，细节可以等真正要用时再安排。 |
| p01-R1 | A | p01-R1-64f4d9757c | 有了机会就可以先按成果已到手来规划下一步。 |
| p01-R3 | B | p01-R3-df8babc1d2 | 先想象理想成果，等信心稳定后再定时间。 |
| p01-V1 | A | p01-V1-1e05421ac3 | 先把获奖当作目标，再看有没有必要安排练习。 |
| p02-Q1 | A | p02-Q1-5133ac691d | 不太适合，减少任务会说明自己的协调能力不足。 |
| p02-Q3 | A | p02-Q3-c6cc508d74 | 保持当前承诺，尝试把每项任务压缩一点时间。 |
| p02-R1 | B | p02-R1-40470ad1d3 | 灵活就是把任务随时挪动，不必判断优先级。 |
| p02-R3 | A | p02-R3-a4d8c8bedc | 违背，协调能力主要体现在把原任务维持住。 |
| p02-V1 | B | p02-V1-89a5e99518 | 先把新活动塞进空档，再看原计划哪里能补回来。 |
| p03-Q1 | B | p03-Q1-c833ed7e41 | 成员各自把擅长部分做好，成品自然会拼合。 |
| p03-Q3 | B | p03-Q3-c6f217ecf4 | 说明团队的个人水平不够，需要换更熟练的人。 |
| p03-R1 | A | p03-R1-58fd5e8327 | 让大家继续按各自标准完成，最后再找人拼在一起。 |
| p03-R2 | B | p03-R2-14bf83d207 | 表演和灯光各自按经验准备，彩排时再对齐。 |
| p04-Q1 | A | p04-Q1-fce49a1a50 | 留得越多越安全，使用会削弱安全感。 |
| p04-Q2 | B | p04-Q2-c757bcc2c2 | 先把想买的材料列齐，再从储备里一次购入。 |
| p04-Q3 | A | p04-Q3-b7b7455ea2 | 预算内的支出风险较低，可以省去用途检查。 |
| p04-R1 | B | p04-R1-a37f2b6bad | 相同，储备的意义就是暂时不动用这笔钱。 |
| p04-R2 | A | p04-R2-38c44b8bbd | 继续由熟悉设备的人保管，需要时由他决定是否外借。 |
| p04-R3 | A | p04-R3-65907a1cb4 | 先把过去没花的钱补回到学习投入里，再恢复储备。 |
| p05-Q1 | B | p05-Q1-fbbaeca29c | 困难反映个人准备不足，应先加强自律再考虑求助。 |
| p05-Q2 | A | p05-Q2-fe9ffe5dd8 | 先用已有内容继续学习，等课程结束再补齐教材。 |
| p05-Q3 | B | p05-Q3-1efcd99c82 | 获得辅导说明问题已经过去，可以降低后续投入。 |
| p05-R3 | B | p05-R3-ea1221ed3d | 帮助没有直接减少作业量，说明作用比较有限。 |
| p05-V1 | A | p05-V1-0ba1826c92 | 先暂停作业，等自己的设备修好后再继续。 |
| p06-Q1 | A | p06-Q1-334220b553 | 比较公平，愿意提供资源通常已经承担了较多责任。 |
| p06-Q2 | B | p06-Q2-ea96147252 | 先表达感谢，具体期限和责任等使用后再谈。 |
| p06-R1 | B | p06-R1-288c70a568 | 重点看提供者是否付出了足够资源，接受者的处境可以之后再谈。 |
| p06-R2 | A | p06-R2-745cee30ca | 先接受辅导，等对方提出回报时再决定如何回应。 |
| p06-R3 | A | p06-R3-543aa2550e | 继续答应这次，等回报完成后再说明压力。 |
| p07-Q1 | B | p07-Q1-ed92d1cb4a | 只计算自己坚持了多久，不检查方法有没有效果。 |
| p07-R1 | A | p07-R1-99d0d2b8f4 | 是，检查成果会打断节奏，耐心应体现在持续重复。 |
| p07-R2 | B | p07-R2-f09cf5a600 | 先按练习时长判断，等课程结束再听录音。 |
| p08-Q1 | A | p08-Q1-aa65f87a7a | 保持高频重复，熟练会随着次数慢慢出现。 |
| p08-R1 | B | p08-R1-8508d3a2fc | 练习次数增加，通常就可以推断能力提高。 |
| p08-R3 | A | p08-R3-391ad16378 | 保持当前动作，先提升速度，再在成品里看问题。 |
| p08-V1 | B | p08-V1-1d2ec33d9a | 延长制作时间，用投入时长衡量熟练程度。 |
| p09-Q1 | B | p09-Q1-78d2e92088 | 是，求助会让成果不再算作自己的能力。 |
| p09-Q2 | A | p09-Q2-912625a285 | 把成果展示给更多人，用外界反应确认价值。 |
| p09-R1 | A | p09-R1-bfdc81a5a8 | 选择容易被看见的奖励，让成果获得他人认可。 |
| p09-R2 | B | p09-R2-01f1ce40a3 | 先拿更强的人作参照，找出自己还不够好的地方。 |
| p09-V1 | A | p09-V1-cf22d6da69 | 减少和他人合作，把生活事项尽量留给自己处理。 |
| p10-Q1 | A | p10-Q1-139ca16ba8 | 看个人目前能控制多少资源，以及这些资源能否增加地位。 |
| p10-Q3 | A | p10-Q3-af5bbac234 | 说明负责人不够可靠，换人后从头建立资料更稳妥。 |
| p10-R1 | B | p10-R1-f2e04f7f0b | 讲清过去成功的做法，就足以让后来者照着使用。 |
| p10-R2 | A | p10-R2-421132b2d2 | 由最熟悉的人统一保管，其他人有需要时再问。 |
| p10-V1 | B | p10-V1-f9f81122ab | 重新设计流程，避免继续使用前任留下的做法。 |
| p11-Q2 | A | p11-Q2-53e68533ac | 先比较器材参数，等确定合适设备后再练。 |
| p12-Q1 | A | p12-Q1-40c3b507e9 | 看起步时投入多大，以及能否快速超出计划。 |
| p12-Q2 | B | p12-Q2-90e5f53e21 | 前几天集中完成大部分内容，后面按状态补漏。 |
| p12-Q3 | A | p12-Q3-e70f461308 | 为了保持节奏，继续用原清单，复习后再看新要求。 |
| p12-R1 | B | p12-R1-54a9dd381c | 把较慢的节奏本身当作效果，主要记录坚持了多少天。 |
| p12-R2 | A | p12-R2-ba76172a48 | 发现问题时再记录，平时按印象检查。 |
| p12-R3 | A | p12-R3-eba327f234 | 继续照旧清单做一段时间，用持续性弥补目标变化。 |
| p12-V1 | B | p12-V1-8d63954600 | 先比较自己和同学的速度，再决定是否值得坚持。 |
| p13-R3 | B | p13-R3-3cc4e8bbdf | 继续多承担一些，等对方状态稳定后再安排自己的休息。 |
| p13-V1 | A | p13-V1-ab8c829887 | 先替对方安排任务，再看哪些事情需要他自己完成。 |
| p14-Q1 | A | p14-Q1-c34cb3ebec | 把资源集中保存起来，暂时不安排使用和维护。 |
| p14-Q2 | B | p14-Q2-f47d4f3ee6 | 先比较设备性能，运营和维护等购入后再补。 |
| p14-R1 | B | p14-R1-8e118f08a5 | 有了成熟成果后，维护安排可以等出现问题再补。 |
| p14-R2 | A | p14-R2-e54d4894fa | 先投入使用，等损坏或丢失时再确定保管责任。 |
| p14-V1 | B | p14-V1-88ba94bf1b | 先承诺客户需要的服务，再根据订单补齐时间和设备。 |
| s01-Q2 | A | s01-Q2-a403f8d6f6 | 先判断哪位同学看起来进度更快，再决定要不要讨论标准。 |
| s01-Q3 | B | s01-Q3-01b9462a37 | 把传言当成误会，先安抚团队再说。 |
| s02-Q3 | A | s02-Q3-1c1687ddc7 | 先选听起来更轻松的课程，再慢慢了解新要求。 |
| s02-R1 | B | s02-R1-a41d62a590 | 暂时避开资料，让情绪平静后就算有了答案。 |
| s02-R2 | A | s02-R2-bf3c616d9c | 先凭公司名气挑一份，再看排班能否配合。 |
| s02-R3 | A | s02-R3-7c8c227d68 | 沿用原先偏好的课程，暂时不把新要求放进比较。 |
| s03-Q3 | B | s03-Q3-8da0a11dec | 既然愿意谈，就把伤痛视为已经处理好了。 |
| s03-R1 | A | s03-R1-0c542da612 | 痛苦很强烈时，可以把背叛当作最合理解释。 |
| s03-R3 | B | s03-R3-93643dcded | 会，情绪又低落说明恢复方向可能选错了。 |
| s03-V1 | A | s03-V1-c3055bbdfd | 先判断这段关系值不值得修复，再谈自己的痛苦。 |
| s04-Q1 | A | s04-Q1-95c3e2321d | 把决定往后放，等外部问题自己缓下来。 |
| s04-Q3 | A | s04-Q3-624bc32c24 | 休息被打断说明当前不适合休息，应该先把任务赶完。 |
| s04-R1 | B | s04-R1-dda4103af8 | 是，暂停会让别人觉得自己没有承担责任。 |
| s04-R2 | A | s04-R2-bdb7c16bef | 继续按原强度排练，用更多次数把失误压下去。 |
| s04-R3 | A | s04-R3-de32b68708 | 马上用更密集的安排补回刚才停下的进度。 |
| s04-V1 | B | s04-V1-e35a3567a7 | 趁情绪还在，把争论一次谈到底。 |
| s05-Q1 | B | s05-Q1-75bed4fd35 | 争论中占上风，说明这次做法更有效。 |
| s05-Q3 | B | s05-Q3-d8c5ff06e6 | 停止指责就说明关系已经修复，不必再谈影响。 |
| s05-R3 | B | s05-R3-3119aa539e | 把分歧先放下，避免再提受伤的细节。 |
| s06-Q2 | B | s06-Q2-51accd422d | 把剩余压力当成新方法选错的信号，尽快换回旧方法。 |
| s06-Q3 | A | s06-Q3-66b69ece9f | 先等新计划自然带来规律，再考虑作息。 |
| s06-R1 | B | s06-R1-724c7c286e | 进入新阶段后，重点放在前方，旧问题可以先不处理。 |
| s06-V1 | B | s06-V1-9a8f29079e | 把注意力困难归因于新环境，继续换学习地点。 |
| s07-Q2 | A | s07-Q2-c8030feebf | 等同伴发现改动后再解释，免得提前打断合作。 |
| s07-Q3 | B | s07-Q3-96cf5c470a | 主动说明改动，重点是为自己之前的做法辩解。 |
| s07-R1 | A | s07-R1-3c441b52ea | 独自行动通常会破坏信任，因此草稿也应先报备。 |
| s07-R3 | B | s07-R3-fba59faf16 | 解释过原因后先观察同伴反应，不再讨论通知方式。 |
| s07-V1 | A | s07-V1-9184b16dd0 | 保密会让对方不安，所以应先按欺骗来理解。 |
| s08-Q1 | A | s08-Q1-3e6837a294 | 先提醒自己别想太多，把困难暂时放到一边。 |
| s08-Q2 | B | s08-Q2-2b9091cdf0 | 把整个课程问题一次交给助教，让对方安排学习步骤。 |
| s08-Q3 | A | s08-Q3-a7839acbe6 | 既然有了补基础的方法，可以先不处理剩下的课程要求。 |
| s08-R1 | B | s08-R1-af1755cbd9 | 是，看到空隙说明限制主要来自人物的想象。 |
| s08-R2 | A | s08-R2-08cfb7347a | 先凭经验选一个环节尝试，等出错后再找负责人。 |
| s08-R3 | A | s08-R3-8a2d3a962e | 把找到联系人当成问题已解决，先等待对方主动安排。 |
| s08-V1 | B | s08-V1-dd9b04da4a | 先跳过不熟的功能，照着别人完成的结果模仿。 |
| s09-Q1 | B | s09-Q1-dcc07edddb | 可以把这种担心当作最坏结果正在靠近的信号。 |
| s09-Q2 | A | s09-Q2-290741a985 | 把沉默当成婉拒，尽快停止准备后续面试。 |
| s09-Q3 | B | s09-Q3-bef2f4cf2c | 得到一次支持后，今后的担心可以忽略。 |
| s09-R1 | A | s09-R1-7c87ac64a7 | 担心很强烈，说明错误大概已经发生。 |
| s09-R3 | B | s09-R3-a4a28d86d6 | 把偶尔仍紧张理解成之前的支持没有起作用。 |
| s10-Q1 | A | s10-Q1-efa2e17555 | 把这次结束理解为个人能力已经耗尽。 |
| s10-Q2 | B | s10-Q2-0324ee5a84 | 先保留旧安排，等项目可能恢复后再整理成果。 |
| s10-Q3 | A | s10-Q3-352868b3de | 开始计划就表示旧项目正在恢复。 |
| s10-R1 | B | s10-R1-fc8ed0ea5c | 是，眼前失败说明相近方案也缺少可行性。 |
| s10-R3 | A | s10-R3-751ea03605 | 把回到旧项目当成恢复的主要目标。 |
| s11-Q1 | B | s11-Q1-335e6694ff | 兴趣足够强时，可以先按直觉下结论，再补资料。 |
| s11-Q3 | B | s11-Q3-7162fed8fd | 先转发标题引发讨论，再根据反馈判断内容。 |
| s12-Q2 | B | s12-Q2-cf70a80fdc | 先按最常见的需求推进，会议后再补确认。 |
| s12-Q3 | A | s12-Q3-34c7204cf5 | 先保持速度把当前版本做完，核对可以放到复盘。 |
| s12-R2 | A | s12-R2-0c44e8226d | 按自己熟悉的格式直接交终稿，不再确认关键要求。 |
| s12-R3 | A | s12-R3-a32763a11f | 保持原速度推进，等结果出现后再讨论方向。 |
| s12-V1 | B | s12-V1-91513fb6ed | 表达很坚定时，观点通常可以先作为事实使用。 |
| s13-Q1 | B | s13-Q1-72a58545a0 | 需要，继续听解释会让边界变得不清楚。 |
| s13-Q2 | A | s13-Q2-2ec4f5d02e | 先减少联系，让对方从沉默里理解自己的不满。 |
| s13-R1 | A | s13-R1-c3631ab16e | 把不同意见视为对方不尊重边界，直接结束讨论。 |
| s13-R3 | B | s13-R3-661ad2632a | 先按旧经历判断这次情况，再决定是否听说明。 |
| s13-V1 | A | s13-V1-cc84c7eb27 | 先退出这次沟通，让家人自行猜测你的底线。 |
| s14-Q1 | A | s14-Q1-1667300c88 | 看表达是否果断，以及别人是否愿意服从。 |
| s14-Q3 | A | s14-Q3-6661b381d5 | 负责人承担后果，因此可以按个人判断调整标准。 |
<!-- learning-option-id-registry-end -->

## 9. 来源、证据与许可边界

以下来源用于确定结构、传统含义和教学参照。课程、题目、情境、中文与英译均为本项目原创编排，不是原作者教材的逐课翻译。引用原站点并不代表原作者审核或背书本项目。

| ID | 类型与来源 | 本文具体使用 | 不据此声称 |
|---|---|---|---|
| S01 | 作者教学实践：Joan Bunning，[牌义条目结构](https://www.learntarot.com/howcard.htm)、[小阿尔卡纳](https://www.learntarot.com/less3.htm)、[单牌练习](https://www.learntarot.com/exer11.htm)、[逆位课](https://www.learntarot.com/less17.htm)、[牌义索引](https://www.learntarot.com/cards.htm) | 用主题词与完整说明互补；先单牌再情境与组合；基础正位之后学习逆位。B01/B03/B05、I01/I03/I04/I05与单牌组织参考 | 本项目三阶段/20课由Bunning规定；所有牌义由图像唯一推导；作者超自然或医学叙述是已证实事实 |
| S02 | 教学者实践：Biddy Tarot，[三牌结构](https://biddytarot.com/blog/easy-three-card-tarot-spreads/) | 过去—现在—未来、现状—行动—结果、现状—阻碍—建议等具名版本的出处；课程只用明确声明的版本 | 三张随意抽出就自动有时间位置；不同三牌结构可以不说明而混用 |
| S03 | 中文专业内容实例：科技紫微网，[五牌二择一V形](https://m.click108.com.tw/article/201309/9094_1.php) | A05采用1共同现状、2A发展、3B发展、4A结果、5B结果；沿1→2→4与1→3→5阅读 | 全国唯一标准；所有中文社交平台都如此教学；将商业文章当学习效果研究 |
| S04 | 历史原始文本：A. E. Waite，The Pictorial Key to the Tarot，[牌阵章节](https://sacred-texts.com/tarot/pkt/pkt0307.htm) | A06十位凯尔特十字的来源，固定本课编号；历史背景供查阅 | 历史术语天然适合当代初学者；原文所有预测性说法应原样用作现代事实 |
| S05 | 产品与作者教学实践：[Labyrinthos 初学教程](https://labyrinthos.co/pages/learn-tarot-for-beginners-with-our-online-tarot-classes) | 花色、数字、单牌与牌阵分层作为产品参考；逐牌释义对照基线时参考其公开牌义资料 | 产品有测验就证明本项目游戏有效；可复制其题库、插画或商业界面 |
| S06 | 通用学习研究指南：美国IES/WWC，[Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1)，2007 | 例题与练习交替、图文配合、具体与抽象关联、间隔学习、用练习检查内容；不同建议的证据强度并不相同 | 图动起来一定比静态好；具体两轮补学和3/7/14日由研究直接规定 |
| S07 | 通用学习研究综述：Dunlosky等，[Improving Students’ Learning With Effective Learning Techniques](https://www.psychologicalscience.org/journals/pspi/1529100612453266/)，2013，[DOI](https://doi.org/10.1177/1529100612453266) | 练习测试与分散练习的通用依据；采用理解后的练习与后续回访，不把反复阅读当全部机制 | 塔罗课程已通过实验；关键词越多越有效；答一次二选一就会长期记住 |
| S08 | 项目教材基线：[原Word](../output/Tarot-Pocket-初中高级教学手册.docx)，2026-09-16，哈希见§2 | 20课顺序与78牌六字段基线；本轮逐课逐牌扩写，修订明示 | Word已有全部本轮题目；本轮已重新导出79页Word |
| S09 | 图像身份与出处：[assets/manifest.json](../assets/manifest.json)；每牌脚本的原始来源页 | 历史RWS图像、稳定ID、路径与哈希，不改原始人物姿态 | 本轮逐张完成新的法律审查或跨司法区权利保证 |

S01–S07是本轮与教材编写期间核查过的公开来源；访问时间为2026-09-16。线上页面可能变化，来源链接故障不允许靠记忆伪造原文。若后续正式出版，需要保留版本与必要书目信息；不把页面“能访问”当内容全量学术审核。S01按教材实际参考页标注`less3/less5/less8/less11/less17`等时，是作者课程号，不是本项目B/I/A编号。

**必须区分的四类陈述**

1. **研究资料**：通用教育研究支持哪些学习措施、证据适用范围在哪里。关键词助记法研究中的“keyword mnemonic”是特定记忆技术，不能直接等同于“把牌义整理成关键词”。本课程使用主题词作为索引，不以该综述证明塔罗关键词有效或无效。
2. **作者/行业实践**：RWS牌义、元素对应、某版本牌位定义属于解释传统与教学实践。作者之间可有差异；本课采用一个清楚声明的版本。
3. **本项目设计推断**：三阶段、20课、每卡分段、低输入、最大两轮补学、动画节奏与调度参数。它们是可检验设计，尚非研究结论。
4. **尚未验证效果**：新人是否读得懂、隔天是否能独立应用、动画是否降低理解成本、能否从题目迁移到真实整组阅读。必须试学，不能从文稿数量推定。

**逆位与宫廷解释的来源差异**：Bunning常从同一主题的表达程度谈逆位；本教材还在明确背景下讨论过度、回避、内化或困难缓解，属于编辑综合，不声称这些分类全是Bunning原话。宫廷角色采用角色/行动风格教学，不沿用年龄性别作为现实身份定论。数字只用作组织线索，不把统一数字理论覆盖单牌画面与传统释义。大牌不硬套四花色或Ace–10公式。

**牌阵版本锁定**：A05五牌V按S03编号；A06凯尔特十字按S04的本项目呈现约定，省略额外指示牌，固定左右布局；第2张横置不表示逆位。不得把其他作者的位置顺序混进本例。自由三牌明确没有预先位置语义，不能读完后补成过去/现在/未来。更完整的既有来源记录见[SPREAD_SOURCES.md](SPREAD_SOURCES.md)，若与本文冲突先核实再修订，不静默选一边。

**许可**：本文原创课程、题目、案例与翻译沿用仓库CC BY-SA 4.0内容许可；代码MIT与图片来源声明分开。公开站点内容链接仅作出处，不能因项目开源而再许可别人的全文、截图、商业牌图或课程题库。案例均为虚构，不含用户私人问卜、模型密钥、会话凭证或真实邀请码。

<a id="acceptance"></a>
## 10. 覆盖表、检查与待确认事项

### 10.1 内容覆盖目标

| 对象 | 应有数量 | 本轮写作范围 | 当前状态 |
|---|---:|---|---|
| 体系课 | 20 | B01–B08、I01–I06、A01–A06；逐课对应Word | 已编写；结构核对见下 |
| 逐牌单元 | 78 | m00–m21、w/c/s/p各01–14 | 已编写；不是78节已经部署的课程 |
| 课程题 | 100 | 每课Q1/Q2/R1/R2/V1 | 已编写，含逐项反馈 |
| 单牌题 | 624 | 每卡4主练习、3对应补学、1延后变式 | R5新增78道整牌理解题；逆位题后续进入 |
| 全部题目 | 724 | 352主练习、274补练、98延后变式 | 文稿与生成题量，不是要求一次做完 |
| 课程分镜 | 20 | 具体起止、触发、强调与静态替代 | 已编写，未制作正式动画 |
| 单牌分镜 | 78 | 真实牌图具体对象与说明，逆位后续演示 | 已编写，未做触控/动效运行验证 |
| 需求追踪 | 46 | 来源、有效决定、状态、验收定位；另有替代记录 | 文档内可追溯 |
| Word牌义基线 | 78×6字段 | 附录保留实际Word文本，便于查修订 | 原Word保持不变 |

“352主练习”=20×2＋78×4；其中每张牌新增的第4题要求合并多个画面线索判断整张牌，不另设不相干补题。补练为20×2＋78×3；延后为20＋78。R分支名称在旧编辑片段中不同，必须按路由读：大牌/宝剑/星币Q1→R1、Q2→R2、Q3→R3；权杖/圣杯Q1→R1、Q2→RA、Q3→R2。**分支数不是当次补学轮数。** 同一知识目标的不同补练不能无条件连续发给每个人。

### 10.2 内容验收怎么做

- **已教再考**：逐题记录依据T编号或同卡锚点；判断选项需要的概念必须在前文出现。开放内容只展示可接受路径和边界，不假称自动检查用户脑中答案。
- **每项反馈**：先明确对/错，再指出选项和本例条件的关系。正确字母不能永远固定；本文作者稿交替排列，应用仍需稳定内容ID。修改位置不得使反馈指代“前者/后者”失效。
- **补学匹配**：Q1核心、Q2应用、Q3逆位分别有替代讲解和新练习；不要用学过角色性别就证明会应用宫廷牌。没有第二个适配变式时可提前结束补学，两轮只是上限。
- **多解处理**：有多种合理牌义的场景，缩小题目背景并问已教证据，或者改为开放示范。不能用“更专业”“更有能量”作为判错依据。英文不得增加中文没有的确定性。
- **动画关闭**：静态文字、真实图和位置标签足以完成相同题目。低动态模式不删知识，不因跳动画扣分。具体像素和触控区域等待UI阶段设计。
- **整组练习**：高级有完整问题、牌位、牌义摘要和整组示范，不要求新人自己猜未知牌的含义。情境变化可以改变解释重点，但不改牌名、方向或来源版本。

### 10.3 必测学习状态（将来UI/实现验收，不冒称本轮运行通过）

| 情形 | 输入示例 | 期望处理 | 不能出现 |
|---|---|---|---|
| 顺利 | 学完p08 T1后Q1独立正确 | 具体反馈→T2→Q2→总结 | 强迫自评或再做全部补题 |
| 答错 | p08 Q2选购买设备替代实际练习 | 指出错因→应用R2→新例检查 | 转去考花色、只原题重做 |
| 用提示后正确 | m16 Q2先看对应提示再答对 | 记辅助完成、继续原链路、后续回访 | 记成无提示独立掌握 |
| 提示后仍错 | m16 Q2提示后仍选主动制造危机 | 进入R2，不因点过提示就判完成 | “提交即掌握” |
| 连续困难 | 同目标补练仍错 | 具体总结、标待回访；最多两轮，缺变式可提前结束 | 无限循环、扣生命、强退或清空进度 |
| 暂停恢复 | c10 Q2反馈页离开后返回 | 同卡、同题版本、同反馈和补学轮数恢复 | 重置成另一张卡、重复计分 |
| 动画中断 | B02切牌演示中离开 | 恢复可读静态步骤，可重播 | 自动判流程题正确或强制重新洗牌 |
| 切换语言 | I04已作答后切EN | 同题、同答案语义和进度 | 重新抽选项或丢失反馈 |
| 题目修订 | 某题发现双答案 | 停用该版本的正确性证据，保留学过记录 | 把旧用户全判错 |
| 全部新牌已学 | 点击随机学新牌 | 说明已完成初学，可自选深化或回访 | 冒充新牌反复给同一张 |

### 10.4 本轮已做与未做

已完成文本层的数量、稳定编号、内部链接、相对文件路径、牌图清单与Word哈希核对。2026-09-16 实际检查记录如下：

| 检查 | 实际结果 | 范围 |
|---|---|---|
| 单元与题目编号 | 20课、78牌、646题；符合全部预期编号集合 | 文稿结构 |
| 要求与基线 | 46项要求；78牌各6字段Word对照 | 覆盖完整性 |
| 显式锚点 | 623个，无重复 | 本文 |
| 内部链接 | 807次引用，无失效锚点 | 本文链接 |
| 本地文件链接 | 106次引用，目标均存在 | 包含图片、Word和项目文档；不是106个独立素材 |
| 牌图 | 78个本地文件SHA-256均符合manifest | 身份完整性，不等于新增版权审查 |
| Word | SHA-256与本轮基线一致 | 原文件未变 |
| 内容交叉审查 | 20课及逐牌片段检查，发现问题已修正；部分为抽样 | 不是教师或母语编辑签字审核 |
| 应用验证 | 未运行npm test，也不需要为纯文档变更宣称应用通过 | 应用未改；未来发布仍须全套检查 |

交叉内容审查纠正了补学错位、逆位概括不足、依赖选项排列的反馈，以及少数英文表达问题。

本轮没有：应用运行变更、正式动画、手机实机测试、专家签名审校、全量英文母语审校、长期学习实验、模型解读调用、线上验证、Git提交或发布。因此“题目已写齐”不能变成“新课程已经好用/已经上线”。

### 10.5 仍须共同确认

1. **代表内容试学**：先在文字材料里走B02、B06、I04、A03和p08、c10、m02的实际链路，检查讲解与题目是否连得上；这不影响其余脚本本轮写齐。用户试学前不进入UI开发。
2. **难度的下一层**：首次题优先判据清楚，部分二选一错误项故意与已教条件冲突。这不是最终高级考试。后续是否增加多证据选择或片段组合，应在读得懂后讨论，不能再用陌生牌与抽象近义词制造困难。
3. **独立产出证据缺口**：当前低输入题证明的是在给定条件下能辨认和应用，不足以证明完全没有选项时能独立口头解整阵。既然用户不希望长文或语音，不得偷加输入；可在下一轮讨论“点击组合自己的解释”的验收方案，未确认前不实施。
4. **延迟验证范围**：当前每单元一条V1，不是无限随机题库；逆位回访部分会复用补练，应标记复现题，不能据此推定陌生情境迁移。调度间隔和过关阈值待试学，不先包装为精确科学。
5. **专业内容复核**：需要外部RWS教学者/双语审校，特别是宫廷人物解释、逆位边界及复杂牌阵；目前内部交叉审查不能替代外部审核。
6. **材料基线修订**：下一次确认后是否同步Word，由用户决定。当前保留Word、标差异；不自行把脚本的新选择写回教材。

<a id="change-log"></a>
## 11. 持续更新、恢复顺序与变更记录

### 恢复任务顺序

先读[当前状态](#start)及本节最新变更→[要求追踪](#requirements)→涉及的B/I/A课或card-ID→[动态约定](#adaptive-contract)→实际工作区差异。判断用户当前授权是否仍仅文档；不能因为先前曾要求发布就发布本轮。

### 每次需求变更必须同步

1. 写清新决定来自哪条明确用户请求、日期和作用范围；无法确定的旧回复保持“待核实”，不伪装成共识。
2. 修改当前有效正文与涉及脚本，而不是只在文末追加一句“以后改”。查该概念涉及的课程、卡牌、R分支、英译、V题与动画说明。
3. 记录旧决定为已被替代，保留原因，不让实现者从旧文档恢复过时自评、固定三词或陌生牌PK。
4. 更新要求追踪、覆盖数量、题目/内容版本及未确认事项；新增/删除题目同时复算并查链接。
5. 更新[HANDOFF](HANDOFF.md)的实际完成、验证、剩余问题和下一步。明确提议/确认/编写/验证/实现，不把五种状态合并成“完成”。
6. 若跨设备接力，需要用户授权后按仓库流程提交资料和教材；本轮只本地文件，不能声称另一台电脑已经拿到。

稳定编号不随中文改名改变。题目意义或答案变化时记录内容版本，例如未来`p08-Q2@2`，保留旧结果与其旧版本关联；本轮文稿初始版本统一`@1`，这是设计标识，不是已实现数据库字段。

| 日期 | 版本/性质 | 变更、原因与影响 | 状态 |
|---|---|---|---|
| 2026-09-24 | LM-1.2-R6 答错反馈质量 | 将运行数据中509处批量包装改成当前题目的具体画面或情境依据；专项门禁阻止旧包装和只说“答案不对”的空反馈回归 | 已编写并通过构建与专项检查；真人理解待验证 |
| 2026-09-24 | LM-1.2-R6 题目语义审计 | 修复 p13-Q1 补学目标偏移；手工重写 A05-Q2、m16-Q1、p08-Q3、p02-Q4；建立绝对化线索全量检查、稳定选项 ID 登记和显式双语映射合并门禁 | 代表问题已修；全量逐题语义改写进行中，未标成全部完成 |
| 2026-09-17 | LM-1.0-R4.1 运行交互 | 用户指出学牌中的播放、重播、看动效、跳过动效没有学习价值，且增加理解和操作成本。现行规则改为必要画面强调自动呈现；减少动态直接展示完整静态讲解。早期逐卡的控制文案不再作为实现依据 | 已实现并纳入浏览器回归；真人试学仍待验证 |
| 2026-09-16 | LM-1.0-R3 中文与单一读者 | 用户要求所有学牌文案站在学习者一边，否定先抽象术语后解释。全量顺读并修订20课、78牌；同步必要英文，保留646题ID/答案与补学结构；补充98单元覆盖及剩余教法问题 | 文稿已修订并做结构核对；无真人试学、UI、开发、提交或发布 |
| 2026-09-16 | Word基线 | 保留初中高级手册，固定20课与78牌资料；不修改原文件 | 本地基线已核对 |
| 2026-09-16 | LM-1.0 范围 | 用户明确要求一份完整主MD、20课与78脚本，禁止本轮开发/Git/发布 | 已确认 |
| 2026-09-16 | LM-1.0 教学 | 删除自评、固定三词和初学陌生对比；先教、示范再练；正位与逆位分层 | 原则已确认，脚本已编写 |
| 2026-09-16 | LM-1.0 动态 | 每类错误有实际补讲和新题，最多两轮，不拿通用再解释当分支 | 已编写，未实现 |
| 2026-09-16 | LM-1.0 内部修订 | 交叉审查发现部分应用补学目标错配；新增权杖/圣杯RA并修课程对应分支；统一逆位可含缓解；修正排序依赖反馈 | 文本已修订，用户试学待完成 |
| 2026-09-16 | LM-1.0-R2 新人走查 | 模拟初级到高级及直接选牌入口，记录13项具体措辞/题意问题与双语替换样稿；保留原题供讨论 | 文本走查已记录；无真人测试，提议未实现 |
| 2026-09-16 | LM-1.0-R1 复核 | 抽样发现常识泄露答案、补学目标错配、独立组织与延迟验证不足；新增复核提议，保留原题待讨论；修正要求表分列 | 审查已记录；新设计未确认、未实现 |
| 2026-09-16 | LM-1.0 接力 | 协作入口/HANDOFF指向本文，旧版实现留作历史证据 | 文档已更新，无发布 |

下一步：用户核对代表课程的实际讲解、练习和反馈是否达到预期；据反馈修正文稿，然后才设计UI，最后经授权开发。已写齐的98单元仍需要这道教学验收，不把脚本数量当作用户已经同意全部内容。


<a id="review-20260916"></a>
## 12. 教学有效性复核与优化提议（2026-09-16）

**状态：审查发现已记录；下述新设计均为提议，未获用户逐项确认、未改写原题、未改Word、未设计UI、未开发。** 用户本轮要求综合此前问题和现有材料，判断是否能更好地学会塔罗，参考成熟课程提出改进。本节不把一次研究或内部审查当作教学效果实验。

### 12.1 当前判断与审查范围

LM-1.0是首轮完整素材稿。它改善了先教后考、关键词与完整含义并列、分层正逆位、固定流程、明确反馈和低输入操作；但**“内容写齐”不等于“能记住并独立解牌”**。目前不建议原样把646题全部做进应用。

本次检查20课及12张代表牌：m02、m08、m16、m18、w05、w08、c02、c05、c10、s03、p08、p13；部分补学与回访为抽样。没有实施用户试学、记忆实验或外部教师审校，不能推出全量错误率。原10.4的检查记录属于LM-1.0交付时快照；本轮新发现说明此前“补学错配已修正”只覆盖当时发现的条目，不能理解为全部分支已排除问题。

| 用户关心的结果 | 当前支持程度 | 尚欠的证据 |
|---|---|---|
| 新人读得懂，题目与讲解连得上 | 框架改善，表达仍需真实试学 | 用户不依赖作者补充说明，能完成实际链路 |
| 记住完整牌义和关键词 | 已有讲解与词义整理 | 遮住讲解后、隔天换表达仍认得核心，而不是只选常识答案 |
| 每张牌都有自己的意思 | T1通常保留差别，应用有趋同 | 情境例子与练习仍体现本牌侧重，不都归为通用生活建议 |
| 答错后获得有用补学 | 已有分支和上限，发现考点错配 | 补练重新验证原误解，不拿同一张牌的另一个知识点代替 |
| 能按问题、牌位解整组牌 | 已有示范，操作多为选择现成解读 | 能组织未完整示范过的解读路径，回应问题并指出依据 |
| 自由选牌且持续进步 | 入口、进度和恢复有设计契约 | 新方案尚未实现；不能以旧版应用状态证明已满足 |

### 12.2 六项具体发现

**F01／高优先：常识泄露答案。** [高塔m16-Q1](#card-m16)在“结构突然被打破”和“一定发生交通事故”间选择；[星币八p08-Q3](#card-p08)在“投入与质量没有连起”和“所有练习毫无意义，应永远停止”间选择。此类题可作少量边界纠偏，却不足以检验牌义。高级A05-Q2“协作支持打磨／星币永远比权杖好”也存在相同问题。

提议审题方法：遮掉牌名和讲解，检查是否仍能仅靠常识、语气或绝对化措辞答对；若是，将其归为边界练习，不作为核心掌握依据。首次理解题可以容易，但后续两项应同样自然、长度相近，按已经教过的明确判据区分。不是把两个本来都合理的解释硬判一个错，也不是恢复陌生牌比较。

**F02／高优先：补练没有验证原目标。** 历史稿中的 [p13-Q1](#card-p13)考实际资源与照料，p13-R1-CHECK却考是否必须是女性家长；此项已在R6改为“实际安排照顾／只有愿望”的同目标复测。[c10-Q1](#card-c10)考共同分享，c10-R1却转到婚姻身份；[w05-Q1](#card-w05)误选已协调，R1主要纠正争论等于仇恨。补讲可以涉及多个知识点，但这些补练答对不能证明原误解消失。

提议：逐题记录“目标—错误推断—补讲改变什么—新题重新检查什么”。同一张牌不是同一考点；原错误未被检查时，不得记录为该目标已掌握。先完成这项内容审计，再讨论调度算法精细化。

**F03／高优先：有提示辨认与自主组织之间缺一段。** [A03](#lesson-a03)先给完整主线，再选主线或明显失据的放弃判断；[A06](#lesson-a06)展示完整十位解读后仍主要做二选一。低输入约束应保留，但不能把选中现成答案等同于自由解牌。

提议梯度：完整示范→补全一个缺失环节→从已学含义中选取适用片段并选依据→组织“回应问题、位置贡献、牌间关系、结论条件”→未示范案例。允许多条有依据的组合，反馈指出具体遗漏。点击拼装仍有选项支撑，只能证明限定条件下组织解释，不能宣称已经证明无提示口头/书面解读能力。

**F04／高优先：回访太少，适应性覆盖不足。** 当前每单元一条V1，却有核心、应用、逆位等多目标；部分逆位回访先重读T3再做原补题。这是提示后复现，不是独立记忆或陌生迁移的证据。p08-V1换成图表情境后，仍可主要凭合理工作方法答对。

提议按目标编写变式：核心意思、同义表达、新背景应用、牌位变化、逆位条件。回访选择缺少证据的目标，保留题目版本与提示记录；答对且已有延迟验证的目标减少重复，答错只补对应环节。每个目标仍遵守当次最多两轮补学。题库不足就明确不足，不用实时随意改写牌义制造“动态”。具体间隔、阈值待试学，不预先声称某固定日程科学有效。

**F05／中优先：应用趋同，牌义被压成通用建议。** 女祭司与月亮的讲解本来区分静观/潜藏与恐惧/不清，但两者应用都容易落到“没回复不要猜，去沟通”；宝剑三与圣杯五也容易都变成“承认失落再求助”。建议合理不代表已学清牌。

提议每牌保留核心意义、具体侧重、关键词解释、情境表达、逆位方向与边界；关键词数量按牌义需要，不再规定三个。案例覆盖状态、过程、阻碍、趋势和建议；不只教“该做什么”。画面是传统解读的记忆支持，不能假定一个图案逻辑上只能推出一种含义。已学两张确实混淆时可另议针对性对照，仍不强制初学陌生比较。

**F06／中优先：贯穿案例重复多，迁移案例不足。** 至少11/20方法课使用星币八，A03部分补练把摄影换成木工、烹饪，却保留相同“收集资料→练习成品”的解法。熟悉例子降低初学负担，有保留价值；但换兴趣或人名不一定改变解释任务。

提议保留一个贯穿例，增加桥接例与独立例：仅改变问题、仅改变牌位、或改变牌与牌的关系，控制每次变化。之后再进入同时变化。题目只使用已教牌义，不靠突然增加陌生牌制造高级难度。

### 12.3 初中高框架保留，按独立程度检验（提议）

| 阶段 | 教什么 | 练到什么程度 | 不作为必需门槛 |
|---|---|---|---|
| 初级：建立结构并读懂起步牌 | 流程、牌组、元素/数字/宫廷角色工具，配合少量正位实例 | 看完示范能认出完整主旨，把一条已教画面线索连到含义；稍后撤掉解释再验证 | 背全数字公式、先背78牌、逆位全景、陌生牌对比 |
| 中级：记稳单牌并换背景应用 | 逐牌核心与主题词、正逆位方向、背景与位置怎样限制表达 | 解释隐藏后仍能选取意义片段；换背景/位置能调整说法并选依据 | 一次掌握全牌全部细义；同一牌永远做同一套步骤 |
| 高级：围绕问题组织整组解读 | 来源明确的基础牌阵、牌间关系、冲突/支持证据、结果倾向与条件 | 对未完整示范的案例组织解读路径；结论回应所问，允许合理多解 | 张数越多越高级；必须凯尔特十字才算毕业；照抄标准解读 |

初级理论与起步牌交替，避免先上很长理论再见牌。自选/随机牌入口保留；缺前置知识时提供当前卡片所需短讲解，不把自由选择变成强制按编号上课。高级可先用三牌，复杂十位牌阵是后续深化。

### 12.4 一条具体的改题方向：星币八（讨论样稿，不替换正式脚本）

先教完整含义：“星币八常强调通过专注、持续练习来打磨技能与作品；重点是学习、熟练与工艺。”主题词可整理为勤勉、专注、练习、精进、技艺，逐个解释它们在这层意思中的作用。不是要求逐字背这五词，也不是所有地方都只译成一句“检查错误”。画面中正在加工星币的人与排列的作品用于助记，不宣称图中直接画出了导师反馈或精确考核标准。

示范比较的是两个**已讲明的过程**：一是继续加工、练熟本领；二是暂时不再加工、等待既有投入产生结果。两种过程都可能合理，本题问哪一个体现刚教过的星币八主旨，不问哪种生活态度永远更好，也不要求知道另一张牌的名字。

后续练习方向：

1. 先做一次含义判断，确认“投入正在发生在技能与工艺上”；讲解其与题干条件的对应关系。
2. 暂时收起完整讲解，在已教含义片段中选出能组成主旨的部分；错误选项同样通顺，不使用“永远停止练习”。
3. 展示同一牌放到“现状”位与“建议”位：前者描述正在投入与学习，后者建议有计划地练习。检验表达承担的任务，不只换文字。
4. 延迟换到关系中的日常经营例，再教清何时可用“持续投入、用心经营”；不推出对方一定忠诚或必然结婚。此处是进一步应用，不作为未教过的新手唯一答案题。
5. 逆位另行讲解本例采用的具体方向，给出区分“努力未转化为质量”与“过度打磨影响交付”的背景，再检查适用性。不是把正位简单翻成坏结果。

以上只是用于讨论的内容方向；完整双语题干、全部选项、逐项反馈、补练、动画和回访，需在采纳后整体修订对应编号。当前没有把新样稿计入646题。

### 12.5 市场方法与研究：选择性吸收，不拼凑流派

以下访问/检索日期均为2026-09-16。课程官网是作者实践/产品自述，不是独立学习效果验证；采用建议属于本项目推断。

| 来源 | 可核查的方法 | 建议吸收 | 不直接套用 |
|---|---|---|---|
| [Joan Bunning：牌义页面结构](https://www.learntarot.com/howcard.htm)、[牌位练习](https://www.learntarot.com/exer11.htm) | 关键词、具体表现和完整描述；牌位解读练习 | 核心意思与多种表现连接；同牌换位 | 不把作者所有象征解释当全行业唯一体系，也不强制照搬其关键词数量 |
| [Labyrinthos官方课程介绍](https://labyrinthos.co/pages/learn-tarot-for-beginners-with-our-online-tarot-classes) | 短练习、牌义词汇、基础对应、进度与日记 | 短课、牌义熟悉、看得到进展 | 刷词卡不能单独证明会解牌；日记不是本项目必经输入 |
| [Biddy Tarot课程](https://biddytarot.com/get-certified/) | 从基础到超越定义，再进入实践；强调赋能而非预测 | 案例、实践反馈、整组表达 | 该课程取向不完全等同本项目；不能把用户结果问题都改成感受探索 |
| [Duolingo教学方法](https://blog.duolingo.com/duolingo-teaching-method/) | 由简单到复杂情境，提示与个性化难度 | 逐步减少帮助、根据表现调整练习 | 不复制生命惩罚、强制连胜或把开放解读判成唯一字符串答案 |
| [中国文化大学推教初阶课程公开课纲](https://www.sce.pccu.edu.tw/courses/TQ45B5090?c=2800) | 搜索索引显示元素/结构、大牌与单张/三张应用等模块 | 理论搭配小牌阵实践的课程组织可作参考 | 本轮页面全文抓取失败，仅核实索引课纲摘录；不代表中国社媒总体趋势，也不采纳仪式为必要条件 |
| [IES学习指南](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) | 间隔学习、范例与练习交替、图文结合、具体抽象连接、提取练习等 | 用这些原则设计并验证本项目，而不靠点击量评价 | 通用教育研究不等于塔罗效果已验证；图文结合不等于所有动画都有效 |

### 12.6 动画用途与可观察的进步（提议）

- **初级流程**：洗牌、切牌按步骤停住，明确手在做什么；静态连图也能完成。仪式感保留，但不把播放时长当学习。
- **单牌理解**：只强调当下讲解的真实图像区域，再出现对应词义；点开可复看。象征解释先教，不能高亮之后让新人盲猜。
- **牌位变化**：同牌从现状移到建议，旧句与新句只突出语气/任务变化，说明为何变化；不是整页飞走重排。
- **整组关系**：在用户选择依据后连接相关牌位，并显示关系说明；既可显示支持也可显示限制，不能把视觉连线当事实因果证据。
- 装饰动效、角色引导可后续考虑。若关掉动画就不能理解课程，优先补静态讲解，而非强迫观看。

进步状态可讨论为“已读讲解／当场能用／隔天还能用／换背景能用”，来源于作答证据，不是用户自评；不能由一次选择推广到整张牌全部能力。提示后答对先记为有帮助完成，随后再用独立题验证。答对且稳定的目标可以少练；错在牌位就补牌位，不能从元素重新学起。

### 12.7 推荐修订顺序与验收（均待确认）

1. **P0内容修正**：先审现有题目，移除核心测验中仅靠常识可答的干扰项；核对全部主题到补题目标。不是只查ID存在。
2. **P1练习深度**：少量代表牌与三牌案例补“撤提示—组织解释—延迟变式”，同时保证完整含义不会缩成行动口号。
3. **P1试学**：先用文字材料走代表链路，不做应用；可选p08、c10、m02、m16、s03、p13覆盖数字小牌、大牌、困难含义与宫廷角色。试学观察能否读懂指引、选项是否歧义、解释收起后是否还会、隔天与换情境是否仍能用。不要问“你觉得记住了吗”代替验证。
4. **P2扩展**：验证代表链路后再把合适规则扩到其余脚本；用户确认教学，再进入UI设计。动画和游戏形式跟随教学任务，不先增加入口。

建议新增的验收证据：每个核心目标有清楚的已教判据；每个错误分支能重新检查原目标；每个拟标记稳定的目标有不同于紧邻示范的延迟/变式表现；高级案例能由用户组织而不只选择整段参考答案。具体正确率、时间间隔和毕业阈值尚未确定，不在本轮伪造数值。

**本轮记录结果**：保留20课、78牌、646题原稿用于对照；修正文档表格分列、增加本审查与状态提醒、更新HANDOFF。未修改应用、Word、原题答案、正式动画，未提交或发布。下一步先讨论本节的优先级与代表课修订方向，不能恢复到“全部脚本已通过教学验收”的假定。


<a id="novice-walkthrough-20260916"></a>
## 13. 零基础视角逐句走查 R2（2026-09-16，历史记录）

**历史状态说明（R3更新）**：下文记录R2当时发现的问题与样稿，保留作对照。R3已改正文，不能再照搬本节的旧样稿；尤其N04“先解释静观”的办法已被用户明确否定。逐项现状见后面的R3。本节不声称当前稿仍逐字包含全部旧句。

**授权与状态**：用户要求模拟新人阅读，指出看不懂、表达模糊、题答不匹配之处并提出建议。本轮是脚本文字走查，不是应用体验实测或真实新人的实验；下面的“新人疑问”是作者模拟，不是用户原话。问题已记录，替换文案是待讨论样稿，尚未替换98单元正文、修改Word、设计UI或开发。本节建议不计入原646题。

**走查方法**：按B01–B08的实际教学顺序阅读，再检查I01–I06与A02–A06相关段落；另检查从自选入口直接进入m02、c10、p08时的必要说明。只使用该时点已经教过的知识，不借后面的资料替前面补全意思。保留原文、局部语境和稳定ID以便复核。高级课程前置已提供部分单牌摘要，不能误报为所有牌都未教。

### N01｜第一课与流程课的术语首次出现缺少一句解释

- **位置与原文**：[B01](#lesson-b01)T1“一副标准RWS”，T2“王牌至十”；[B02](#lesson-b02)T1“只读正位”。这些首次教学段没有直白解释缩写、Ace怎样计数、正位的方向。B01已经列明四花色，不是完全没教分类；但“花色”可能被按字面误读为颜色。
- **模拟疑问**：“RWS是什么？王牌是不是最大的牌？王牌到十为什么是十张？正位怎么认？”
- **建议样稿**：“这里使用的是伟特系塔罗，简称RWS。花色指权杖、圣杯、宝剑、星币这四类，不是牌面的颜色。每个花色从王牌（Ace，记作1）排到10。这节示范把牌图正着放，叫正位；倒过来叫逆位，具体读法以后再学。”
- **EN**: “We use Rider–Waite–Smith tarot, abbreviated RWS. A suit is one of four groups—Wands, Cups, Swords or Pentacles—not the picture's colour. Each suit runs from Ace, counted as one, to Ten. This example keeps the card upright. A card turned upside down is reversed; we will learn those interpretations later.”
- **落点**：分别加在对应术语第一次出现处，不合并成一屏术语墙。不是要求新人背缩写。

### N02｜自选入口承诺无前置，正文却直接使用“土”

- **位置与原文**：[p08](#card-p08)前提承诺当场提供必要花色解释；T1写“土让我们关注可见的工作与质量”，没先说土与星币的关系。
- **模拟疑问**：“土是画里的地面，还是一种分类？为什么突然在讲土？”
- **建议样稿**：“星币属于四个花色之一。在本课程里，它对应‘土元素’，帮助记住工作、技能和实际资源。星币八再把重点放到专心练习、把手艺做熟。”
- **EN**: “Pentacles is one of the four suits. In this course it is associated with Earth, a memory aid for work, skills and practical resources. The Eight of Pentacles focuses this on attentive practice and developing a craft.”
- **验收**：课程顺序进入与直接选牌进入分别查一次；可选基础链接不代替本页必要定义。

### N03｜数字表的词比需要解释的牌义还抽象

- **位置与原文**：[B04](#lesson-b04)T1“七提示检验；八提示正在持续的过程；九提示积累；十提示阶段充分展开或走到终点”。该段已经声明是本教材宽泛提示，不能把它误称全行业定律；问题是新人仍难以拿来理解。
- **模拟疑问**：“检验什么？练习也能叫积累，为什么不算九？阶段充分展开又是什么？”
- **建议**：先用一个已讲过的数字牌演示“这个提示能帮我记哪部分”，其余表作为查阅。不要以换近义词来解决整个数字表的教学问题。数字只作可选辅助的既有原则保留。
- **建议样稿**：“先只看星币八：画面中的人正在做工。这张牌讲持续练习；你可以把‘八’当作这张牌的记忆提醒。别的八号牌还要各自学习，不要求现在把数字表背下来。”
- **EN**: “For now, look only at the Eight of Pentacles: the figure is working. This card concerns sustained practice, and its number can act as a reminder for this card. Other Eights need their own lessons; you do not need to memorize a number table now.”
- **边界**：此句降低首次理解成本，不证明八能独立推出练习；完整数字教学仍待讨论修订。

### N04｜用抽象词解释抽象词，读完仍不知道在说什么

- **位置与原文**：[m02](#card-m02)Q1“静观的用途是什么？”→“给未明信息留空间”→“符合未急于定论”。[B05](#lesson-b05)T2“认真接触一项实务”也有类似问题，随后陶艺例子反而更容易理解。
- **模拟疑问**：“怎么给信息留空间？我要做什么才叫静观？实务是什么？”
- **女祭司旧建议讲解（已被用户否定，不采用）**：“这里的‘静观’是先停下来留意自己的感受，不急着解释还没弄清的事情。”
- **EN**: “Here, quiet observation means pausing to notice your feelings without rushing to explain what is still unclear.”
- **女祭司建议题干**：“女祭司提醒‘先静观’。在本课的含糊回复例子里，为什么先不判断对方的意思？”
- **EN**: “The High Priestess suggests pausing to observe. In this lesson's unclear-message example, why not immediately decide what the other person means?”
- **建议答案表达**：“我已经感到不安，但还不清楚对方的意思。” / “I notice my unease, but I do not yet know what the other person means.”
- **星币侍从建议讲解**：“刚开始学一项实际技能，愿意认真练基本功。例如第一次学陶艺，跟着示范练捏泥。” / “Beginning a practical skill and taking the basics seriously—for example, following a demonstration while learning to shape clay.”
- **旧建议的纠正**：用户已明确否定“普通抽象词仍保留、再加解释”的做法。当前直接讲清事情；只保留确实要学的塔罗术语。完整新文案见当前m02正文与R3，此处旧样稿不再作为实施依据。

### N05｜题干同时塞进示范答案、人物背景和问题，读不清要做什么

- **位置与原文**：[c10](#card-c10)Q2：“示范：讨论彼此想要的日常并用互动维持。室友想建立温暖的共同生活，建议怎样用？”
- **模拟疑问**：“前半句已经告诉我答案了。后面的‘怎样用’是用哪张牌，还是用哪种方法？”
- **建议样稿**：“几位室友想住得更融洽。圣杯十在建议位，哪种做法更符合刚才学到的‘共同满足’？”
- **EN**: “Several housemates want to live more harmoniously. With Ten of Cups in the advice position, which action best expresses the shared fulfillment just taught?”
- **处理**：保留前面独立教学示范，进入题目后只留下必要背景、当前牌位和具体任务；题目不再重复一遍正确行动。现有干扰项质量问题另见R1，改句子不能替代改题。

### N06｜同一案例中“各自想要的生活不同”被写成了另一种问题

- **位置与原文**：[c10](#card-c10)逆位示范“成员从不谈各自想要的日常，愿景越来越不同”；Q3正确项“共同愿景与实际关系脱节”。
- **模拟疑问**：“是大家想要的生活不一样，还是大家目标相同但没有做到？两种说法好像不是一回事。”
- **判断**：后一句可作宽泛概括，但比前文引入了更宽的解释范围；单一学习目标下不够准确。
- **建议样稿**：“表面上看起来很和睦，成员对共同生活的期待却不一致，也没有把差异谈清楚。”
- **EN**: “They appear harmonious, but their expectations for living together differ, and those differences have not been discussed.”
- **修订范围**：教学、Q3答案、逐项反馈、R2补讲同步保留同一个问题，不在反馈里再次换成其他逆位方向。

### N07｜错误反馈在重复结论，没有帮助我定位理解错在哪里

- **位置与原文**：[p08](#card-p08)Q1，错误项是忙得久即可证明提高，反馈为“本题应选：认真投入技能与细节，提升完成质量。勤勉需要与技艺和质量连接”。
- **模拟疑问**：“我知道正确答案是哪一项了，但勤勉、技艺、质量连接起来具体是什么意思？”
- **建议样稿**：“你选的句子只说明花了很多时间，却直接说水平已经提高。星币八在本课强调认真练技能、留意细节；学习还要看具体做法，不能只数练了多久。”
- **EN**: “Your choice states how much time was spent, then assumes improvement. In this lesson the Eight of Pentacles emphasizes careful skill practice and attention to detail; the method matters, not only the hours.”
- **说明**：具体指出选项多推断了哪一步，而不是用另一组关键词重说正确答案。该题干扰项偏弱仍是独立待修问题。

### N08｜问“证明什么”，答案却是一种含义类别

- **位置与原文**：[I03](#lesson-i03)Q1：“圣杯骑士的温和邀请能直接证明什么？”正确项：“一种表达或追求方式。”T2已经讲了表达不等于长期承诺，不是未教就考。
- **模拟疑问**：“是谁真的发出了邀请？一种方式怎么叫证明？题目在问现实事件还是牌义？”
- **建议题干**：“本课用圣杯骑士描述的，首先是哪一类信息？”
- **EN**: “What kind of information does the Knight of Cups primarily describe in this lesson?”
- **修订原则**：题干问类别，选项答类别；问行动，选项答行动；问依据，选项答依据。不能靠学习者替作者补齐句子。

### N09｜逆位案例前后改变事实；结束语又缩窄已教方向

- **位置与原文**：[I04](#lesson-i04)T2的B案例：“每天练却从不检查重复错误”；T3：“没有把检查变成改进”。本课开始已经解释逆位可包括困难缓解，完成语却概括为“不同失衡”。
- **模拟疑问**：“他到底检查过没有？学到最后是不是逆位仍然都表示出了问题？”
- **T3建议样稿**：“案例B已经每天练习，缺的是找出并纠正反复出现的错误；下一步先挑出一个错处，检查做法，再有针对性地练。”
- **EN**: “In case B, daily practice is already happening. What is missing is identifying and correcting repeated errors. Choose one error, examine the technique, then practise it deliberately.”
- **完成语建议**：“同一张逆位牌要结合具体情况来读：有时是原来主题受阻或过度，有时是原有困难开始减轻。”
- **EN**: “Read a reversal in its specific context: a theme may be blocked or excessive, or an existing difficulty may be easing.”
- **判断**：确定的措辞衔接问题；修正时需中文、英文及受影响反馈一起核对。

### N10｜牌位教学中间新增术语，缺少即时定义

- **位置与原文**：[I05](#lesson-i05)T1讲“现状、建议、趋势”，T3突然出现“障碍位”。I04出现过日常用语学习障碍，但尚没有讲清这个位置的职责。
- **模拟疑问**：“障碍位是说坏事，还是说我做错了？为什么努力也能放这里？”
- **建议样稿**：“障碍位回答‘现在什么在妨碍目标’。如果星币八在这里，需要结合背景检查：是否一直练局部细节，却没有完成原本要交出的作品。”
- **EN**: “The obstacle position asks what is getting in the way of the goal. With Eight of Pentacles here, check the context: is practising isolated details preventing completion of the intended work?”
- **边界**：不据位置自动断言此人一定过度练习。若本课只练前三种牌位，也可把障碍位另作后续深化；两种处理待确认。

### N11｜从待核实解释滑成事实，新人难以知道哪里可以推断

- **位置与原文**：[A02](#lesson-a02)T2：“可核实是否没有明确各自不可调整的日期”；T3：“但关键选择未明确”。背景只交代时间安排争执，不保证原因是没有说清日期。
- **模拟疑问**：“可能双方都说清了日期，只是时间冲突。为什么总结就确定他们没说清？”
- **建议样稿**：“双方仍愿意一起出行，但安排卡住了。宝剑二提示先检查哪些选择还没有谈妥，例如各自哪些日期能调整、哪些不能；再用节制的协调思路寻找共同方案。”
- **EN**: “Both still want to travel together, but planning is stuck. Two of Swords prompts checking which choices remain unresolved—for example, which dates are flexible and which are not—then using Temperance's coordination to seek a shared plan.”
- **边界**：明确牌义提示的是核查方向，不让结论变得处处含糊，也不把推测写成题目给定事实。

### N12｜牌位专名与普通比喻混用，会把刚学的编号关系打乱

- **位置与原文**：[A06](#lesson-a06)第1位“整体影响：星币三”、第4位“基础：星币六”；T3总结却说“合作是基础……星币三与权杖五”。
- **模拟疑问**：“基础位究竟是星币三，还是星币六？前面的图是不是记错了？”
- **判断**：原句日常语义可成立，不是声称牌摆错；但这里正教位置名称，应避免歧义。
- **建议样稿**：“第一条主线看第1、2位：星币三说明活动离不开合作，权杖五指出当前的分工与意见协调还不顺，因此先把各自负责的事情说清。”
- **EN**: “The first thread uses positions 1 and 2: Three of Pentacles emphasizes collaboration, while Five of Wands highlights difficulty coordinating roles and ideas. Start by clarifying responsibilities.”

### N13｜刚教概念便连续排除许多误解，抢走主旨

- **位置与原文**：[m02](#card-m02)的主要含义后紧跟“不等于知道秘密”“不等于永远不行动”，关键词后又加“II不能直接推导两个人恋爱”；[p08](#card-p08)画面讲解、动画字幕、T2多次排除老师、反馈系统、获奖等未提问题。
- **模拟疑问**：“我本来没有想到这些说法。现在要记的是牌义，还是所有不能说的话？”
- **建议**：首先完整讲清一个意思、一个对应例子；与本题直接相关的边界随例子说明。其他常见误解放补学或稍后深化。资料与编辑规则仍保留，不能把所有审稿说明变成用户必读文案。
- **不做的简化**：不删除必要边界，也不把传统象征关系写成可由画面唯一证明。只调整首次阅读顺序和出现时机。

### 13.1 题目是否存在“两项都对”

这次抽样未形成“普遍存在两个同等正确答案”的证据。更明确的是：若干选项差距过大；部分题干没有清楚交代要判断含义、动作还是依据；案例前后换了事实；宽泛词掩盖了不同解释。不能为了符合问题预设，把尚未证实的歧义写成全量结论。补学换考点问题继续按[R1 F02](#review-20260916)保留，尚未改好。

### 13.2 可以保留的易懂片段

- B01把“星币八＝花色＋数字”拆开：对象清楚、分类任务明确。
- B03用同一个合办小店例子讲动力、信任、约定和预算：比单独堆元素词更可理解。
- B06说明人物正在加工、旁边有作品，再联系练习：有明确的图像对象。需要继续改进练习与反馈，不必推倒这段教学。

### 13.3 后续修订建议与检查方式

优先修N06、N08、N09、N11、N12的题答、事实和术语一致性；再处理N01、N02、N04、N05、N07、N10的阅读障碍。N03数字课和N13边界出现时机涉及教学组织，先讨论再调整。每项改动都要连同相关英文、题目答案、提示和补学核查；不只改一句展示文案。

检查时对每一步问五个具体问题：现在让我做什么；所需词语前面有没有解释；答案是不是在回答题干；解释是否指出我选项具体错处；进入下一步时案例事实有没有悄悄改变。暂不新增生硬的字数或专业词数量门槛，也不增加自评。

本轮只同步审查记录、主文档状态与HANDOFF。实际原稿尚有以上问题；明确保留“待修订”，不把写下建议算作已经修好或已经通过新人验收。


<a id="chinese-walkthrough-20260916"></a>
## 14. 全稿中文与学习者视角走查 R3（2026-09-16）

**本次授权与实际结果**：用户要求整份材料按自然中文、新人视角走查，并明确反对“先保留静观，再解释静观”的改法；随后确认整个学牌环节只有学习者一个受众，禁止编写者说明进入展示文案，也不增加自评等负担。本轮已修订20课和78张牌的中文脚本，以及相应必要英文；不是只提出修改建议。Word原件和附录基线保留。未修改应用、UI、正式动画，未提交Git或发布。

**验证边界**：这是按脚本顺序进行的模拟阅读与内容审稿，不是真人试学、手机交互测试或学习效果证明。已编写、已读过、已改过，不等于每一道题都已适合发布。题目是否真的能帮助记住牌义，仍有下列明确缺口。

### 14.1 本轮怎样读，怎样改

- 按B01到A06的顺序阅读，检查每一步需要的词语是否已经出现、题目是否在问刚教的内容。再按每张牌的首次学习、应用、后续逆位、错误补讲、回访和完成语阅读全部78张。
- 逐一检查讲解、例子、题干、全部选项、正确和错误反馈、替代补讲、新练习、动画字幕及总结。检索用于查漏，不代替逐段阅读。
- 对能确定的表达问题直接修订；保留牌义范围、稳定编号、正确答案对应关系及补学路径。发现真正的题型或教学目标问题，明确记录，不靠润色宣称解决。
- 主代理复核时又发现补题残留旧词、选项不像一个做法、反馈提前引用后面的例子，已再次处理。不能因为主讲解已经改好，就假定选项、补题与总结自动同步。
- 必要的塔罗术语仍教；普通说明直接说清楚。“不需要所有抽象词”不是取消关键词，而是选用学习者常用的词，保留完整意思。

### 14.2 具体改法

| 位置 | 原表达 | 本轮处理 |
|---|---|---|
| R2的女祭司建议 | 这里的“静观”是…… | 此改法已被用户否定。直接说先留意自己的感受，还没弄清的事先别急着下结论；不额外教“静观”这个词。 |
| p08反馈 | 勤勉需要与技艺和质量连接 | 直接说不只看花了多久，还要看动作有没有更熟、细节有没有做好。 |
| c10应用题 | 室友想建立温暖的共同生活，建议怎样用？ | 几位室友希望住在一起更融洽。圣杯十在建议位，哪种做法更合适？ |
| c10逆位 | 共同愿景与实际关系脱节 | 表面相处和睦，彼此想要的生活却不一样。相关例子、题目与补讲一起核对。 |
| B05讲解 | 现实技能与初步学习相遇，认真接触一项实务 | 刚开始学一项实际技能，愿意认真打基础。 |
| I06提问 | 本例愿景与共享成果之间，要落实哪一环？ | 大家想把展览办好。中间的星币八提醒他们接下来做什么？ |
| A05正确选项 | 在现有负担下，协作能接上持续打磨 | 本来工作就不少，A有人一起讨论和指导，更利于自己继续练、把作品做细。 |
| s14补题反馈 | 一致标准需要跨对象保持一致 | 不论申请者是不是熟人，都应按事先说明的同一套条件审核。 |
| p13反馈 | 可持续照料要包含照料者的容量 | 想继续照顾别人，自己也需要吃饭、休息，不能一直透支精力。 |
| w04选项与补讲 | 一个阶段的成果值得共同确认 | 一起庆祝已经做成的事。 |

这些不是可以全局替换的词表。比如“质量”在具体说明照片有没有拍清楚时可以理解，但“技艺和质量连接”没有告诉学习者任何事情。判断整句话是否说清楚，比禁止某个词更重要。

### 14.3 明确修正的题答与叙述衔接

1. I03-Q1原问“证明什么”，选项却回答信息类别；现按类别提问，英文同步。
2. I04例B始终是每天练但没有检查并纠正错误，不再中途改成“检查过但没有改进”。完成语也保留困难可能减轻的逆位方向。
3. A02出行案例只确认安排卡住；总结不再把尚待核实的“没有说明日期”写成已知事实。
4. A06总结明确指向第1、2位，不再用“合作是基础”干扰第4位“基础”的专名。
5. w10-R1原问“哪种理解需要修正”，正确项却是一种合适理解；改问“哪种理解更合适”，答案和英文一致。
6. c04补题把牌图中的杯子写成在桌上，改为地上，英文同步。
7. 权杖/圣杯应用题去掉题干里重复上一示范的部分；28个题干各自只交代当前人物、情境、牌名和问题。
8. 对“怎样应用”“哪项保留核心”这种缺少对象的提问，补回具体牌名、眼前情境和要回答的事；不让学生替作者猜主语。
9. 最终读回发现共用文案表仍混有“下方跟随本题逐项解释”的编写指令，已移出实际文案栏，单列为不展示的内部说明；用途标签、题目编号和审核标题也明确不进入页面。

### 14.4 全量阅读覆盖

下表“全部/全链路”指各单元的教学、练习、全部选项与反馈、补讲与新题、回访和完成语均已阅读。它表示本轮文稿走查覆盖，不表示真人全部学完或教学效果通过验证。

**20课**

| 单元 | 阅读覆盖 | 本轮修订重点 |
|---|---|---|
| B01 | 教学至完成全部 | 首次说明 RWS、花色、Ace；分类直接问“哪一类”，不靠盒子隐喻增加理解成本。 |
| B02 | 教学至完成全部 | 首次说明正位；“行动建议”直接说要回答怎样做；“收束”改成用一句话回答原问题。 |
| B03 | 教学至完成全部 | 元素从生活里的行动、感受、沟通、钱和工具讲起；不再用“四副镜头四间房”绕着解释。 |
| B04 | 教学至完成全部 | 数字提示改成常用中文，“辅助索引”改为帮助记忆；数字表怎样分步教仍需另行讨论。 |
| B05 | 教学至完成全部 | “实务、体察、统筹”改成学实际技能、留意需要、安排事情；反馈直接指出例子中的动作。 |
| B06 | 教学至完成全部 | 不先教“精进”再考词义；直接问怎样练才能改正总出错的一小节。 |
| B07 | 教学至完成全部 | “连接、双向性、边界”直接写为双方都表达回应、说清不能接受的要求；两张仍分别教学。 |
| B08 | 教学至完成全部 | 朋友误会消息的例子改成完整自然问句；删除自评相关的过程解释，完成后再选新牌。 |
| I01 | 教学至完成全部 | 关键词、花色和数字用于什么直接说清；不把“固定字串、保留核心”放进反馈。 |
| I02 | 教学至完成全部 | 圣杯十用和重要的人相处融洽来讲；聚会例子改为大家能参与、没人被冷落。 |
| I03 | 教学至完成全部 | “把心意带向外部”改为主动表达；“能证明什么”改为问正在描述哪类信息。 |
| I04 | 教学至完成全部 | 案例 B 始终是每天练但没检查纠正错误；结束语保留困难可能减轻，不只概括为失衡。 |
| I05 | 教学至完成全部 | 现状、建议、趋势各自问什么说清楚；障碍位首次直接定义，例子明确一张照片与整场展览。 |
| I06 | 教学至完成全部 | 三张连读写成想办展、实际准备、办成后共同开心；问题不再问“保留趋势条件”。 |
| A01 | 教学至完成全部 | 整理问题说清哪件事、哪段时间；保留用户想问结果的需要，不强改成感受题。 |
| A02 | 教学至完成全部 | 出行安排卡住不等于已证明双方没说明日期；始终把核实事项与已给事实分开。 |
| A03 | 教学至完成全部 | 主线用想学、想做太多、先动手做一件来讲；不再让新人读“位置语义、整组贡献”。 |
| A04 | 教学至完成全部 | “打磨服务交付、方法失衡”改为细节一直改、迟迟交不了；根据是否动手和怎样做来读逆位。 |
| A05 | 教学至完成全部 | A/B 比较说明谁能帮忙、自己还要做什么、会多出什么负担；不写协作连接打磨之类的句子。 |
| A06 | 教学至完成全部 | 十位解释改为活动里实际要处理的事；总结明确第 1、2 位，不再让“合作是基础”混淆第 4 位。 |

**22张大阿尔卡纳**

| 牌 ID | 已读步骤 | 主要修订与保留 | 仍需另议 |
|---|---|---|---|
| m00 愚人 | 全链路 | 开放直接写为愿意开始与尝试；补讲指出具体准备；去掉 Q1 反馈提前引用后文进山案例；保留探索与准备的区别。 | R3 更偏解释边界判断，未重做为准备不足的同目标新题。 |
| m01 魔术师 | 全链路 | 把“运用条件落实意图”改成目标、工具和实际动手；反馈说明讲计划与做成作品的区别；保留主动性。 | 二选一的错误项依然明显，未改题型。 |
| m02 女祭司 | 全链路 | 从“先留意自己的感受，还不清楚的事先别急着下结论”直接讲；删掉静观、潜藏等先解释名词的写法；补讲说明如何澄清。 | 与月亮的教学差异仍需要后续课程评审，不在文字修订中擅自扩充牌义。 |
| m03 皇后 | 全链路 | 用照顾、成长、精力代替生长条件与个人资源；反馈解释材料、时间、休息分别怎样支持创作。 | 大部分应用仍为建议位，保留原范围。 |
| m04 皇帝 | 全链路 | 把规则说成谁负责什么、何时交接和怎样算完成；去掉“结构服务执行”等工程语言；说明灵活不等于取消规则。 | 规则与专断的深层辨析未增加，仍是当前起步题。 |
| m05 教皇 | 全链路 | 直接说向老师、机构和群体学习已有知识方法；补讲讲清可以照着练和为什么能提问；不用“进入体系”。 | 木工安全与合唱规范案例跨度保留，未加入新案例。 |
| m06 恋人 | 全链路 | 直接说按自己重视的事作选择；工作题明确创作与待遇的取舍；说明吸引不等于生活想法相同。 | “价值选择”原主题保留含义但改用常用话；更完整关系题仍待后续设计。 |
| m07 战车 | 全链路 | 以共同目标、时间安排和各自行动解释推进；“先校准”改成先确认大家一起完成什么。 | 不能仅凭当前二选一证明理解牌面，未加更难题。 |
| m08 力量 | 全链路 | 用稳住情绪、怎样回应、平静说清不能接受什么代替自我调节／恢复余力；保留温和与坚定。 | R3 仍较偏不能给人永久贴标签，未换成新的情境应用题。 |
| m09 隐士 | 全链路 | 说明安静是为了想清问题，信息可以向人求助而判断仍由自己做；补全创作评价题干。 | 暂未增加非建议位解释。 |
| m10 命运之轮 | 全链路 | 去掉“中奖券”比喻；把外部条件与可行动部分具体写成主办方改期、自己改准备与交通。 | R2 错误项“让过去的安排从未发生”本身不现实；需要重做干扰项而非仅润色，故保留待议。 |
| m11 正义 | 全链路 | 事实与公平反馈讲清约定、任务记录、同类同标准；不再只说“符合替代讲解”。 | 事实核对常识足以排除多数错误项，题目区分度未改。 |
| m12 倒吊人 | 全链路 | 从停下原办法、按读者阅读顺序检查标题正文直接讲换角度；不再用“腾出空间”“为暂停增加目的”。 | 新手是否理解设计布局案例，需要学习者试读，不冒充已验证。 |
| m13 死神 | 全链路 | 结束说成交接、收尾与腾出时间精力；“维持空转”改成重复已无作用的工作；保留非现实死亡保证。 | R3 更偏愿望不能改变事实，仍未改变考点结构。 |
| m14 节制 | 全链路 | 用能坚持的安排、精力够不够解释适度；把“极端摆动”写成熬夜后完全停学的反复。 | 配合与平衡的其他含义未新增；保留原学习边界。 |
| m15 恶魔 | 全链路 | “模式／触发场景／选择空间”改成什么时候开始刷、为什么停不下、挤掉哪些活动；关键词不作人格审判。 | 手机使用案例较窄，扩大到其他依赖场景属于后续内容设计。 |
| m16 高塔 | 全链路 | 去掉结构失效、单点依赖与修补依赖；用原安排突然不可靠和一人离岗就中断交接解释；去掉牌图描述重复。 | R1 的灾难干扰项太容易排除；未改题目目标或补题结构。 |
| m17 星星 | 全链路 | “重建信任”明确为从小进步重新相信仍能进步；恢复写成能坚持的短练习；希望不写成日期保证。 | V1 与正位例均是恢复练习，情境距离不大；未新增迁移任务。 |
| m18 月亮 | 全链路 | 先用担心、看不清和未回复这一个事实讲不确定；逆位问题明确问为什么能理解为事情逐渐清楚。 | 与女祭司的不确定主题差别仍待课程层面讨论。 |
| m19 太阳 | 全链路 | “真实边界／背书”改成做成什么、什么没做完；反馈说明有进步不等于处处完美。 | 错误选项极端化问题仍在，未擅改正确判据。 |
| m20 审判 | 全链路 | 去掉重要召唤、更新决定、回应环节；回看经历后想明白，再把发现用于下一次选择；关键词用常用表达。 | “想明白了／重新开始”与其他牌如何分清仍需后续逐牌体系评审。 |
| m21 世界 | 全链路 | 把整合、交付、收束具体写成各部分组合、检查与提交；完整含义保留阶段完成和圆满。 | R2 原文把建议位与结果位作强对照，是否需要补其他牌位应由课程评审决定；未在润色中扩范围。 |

**28张权杖与圣杯**

| 牌 ID | 卡牌 | 阅读覆盖 | 本轮具体修订 |
|---|---|---|---|
| w01 | 权杖王牌 | 全部 | “发芽连接开始”改为新芽与刚开始的明确联系；起步、做小样和等待条件的解析改成直接因果句。 |
| w02 | 权杖二 | 全部 | 规划与完成分开讲清；“外部可能”“完成是另行证据状态”改为现有基础、未来打算、事情实际做到哪一步。 |
| w03 | 权杖三 | 全部 | “后续回响”改为消息与进展；已提交、等待回复、准备材料的先后顺序说清楚。 |
| w04 | 权杖四 | 全部 | “安定节点”“生活阶段落定”改为搬家、暂时安定、一起庆祝；归属的说明改为参与、感谢具体付出。 |
| w05 | 权杖五 | 全部 | “多方表达尚未协调”“内耗”直接写成各说各的、没配合起来、事情做不下去；协调步骤清楚落到讨论目标和轮流表达。 |
| w06 | 权杖六 | 全部 | 外部认可改为得到别人肯定；去掉“终身比较结论”等说法，解释一次获奖为什么不等于以后不用学习。 |
| w07 | 权杖七 | 全部 | “选择性防守”“防守对象”改为哪些立场值得坚持、哪些争论可以放下；不再先讲“边界”再释义。 |
| w08 | 权杖八 | 全部 | “数量并不确定时间单位”改为八根不是八天；快回复与先核对并不矛盾，解释到具体时间冲突。 |
| w09 | 权杖九 | 全部 | “保护持续能力”“余力”改为留出恢复时间、保留精力；绷带和仍站立的两层意思分别讲清。 |
| w10 | 权杖十 | 全部 | 过量成本、调整负荷改为揽得太多、分出去一部分；修复 R1 题干“哪种理解需要修正”与既定答案相反的问题，改问“哪种理解更合适”。 |
| w11 | 权杖侍从 | 全部 | “初学角色开放”“侍从式探索”改为不论几岁都能从第一次尝试开始；收藏教程与亲手体验区别说清。 |
| w12 | 权杖骑士 | 全部 | “收束行动”“后续落实”改为先选一件做完、安排剪辑和下次时间；热情与坚持做完分别说清。 |
| w13 | 权杖王后 | 全部 | “自信收缩”“垄断注意”改为不敢展示、把注意力都抢到自己身上；邀请别人参与写成实际行为。 |
| w14 | 权杖国王 | 全部 | 愿景／担当脱节直接写为只提大目标却不给条件、不肯负责；人手、预算、分工替代抽象执行话语。 |
| c01 | 圣杯王牌 | 全部 | 情感萌发改为新的感动与关心；“先承认感谢”改为承认自己想感谢对方，再说出来；区分感受刚出现与关系已稳定。 |
| c02 | 圣杯二 | 全部 | 双向共识、连接改为两个人都愿意交流、回应；把共同意愿与具体时间安排的差别讲清。 |
| c03 | 圣杯三 | 全部 | “共同体”“社交与支持脱节”改为朋友相聚、有没人认真听；聚会次数与关心的区别落到具体互动。 |
| c04 | 圣杯四 | 全部 | 注意力向内收缩改为心思在自己身上、提不起兴趣；修正 R1 将杯子写在桌上的画面错误，改为地上，并同步英文。 |
| c05 | 圣杯五 | 全部 | 抽象的“容纳失落与剩余支持”改为可以难过、也可以接受帮助；倒杯和立杯各说明什么直接讲清。 |
| c06 | 圣杯六 | 全部 | 过去模式束缚现在改为照旧做不再适合；“温暖资源”“接住温暖”改为旧爱好、熟悉快乐和现在可行的相聚频率。 |
| c07 | 圣杯七 | 全部 | 愿望／条件区分改为想做很多但还不知道做不做得到；筛选说明落到时间、预算、目标。 |
| c08 | 圣杯八 | 全部 | 内在需要、新意义改为原来的事不再让自己满足、找更值得做的事；退出步骤改成想清楚原因、安排交接。 |
| c09 | 圣杯九 | 全部 | “分清主体”“外在满足与内在需求脱节”改为自己满意不代表别人满意、买到东西却仍缺休息和陪伴。 |
| c10 | 圣杯十 | 全部 | 重写室友情境、共同生活与逆位分歧；以相处融洽、想怎样过日子、互相照顾，替代共同愿景和共享满足等抽象措辞。 |
| c11 | 圣杯侍从 | 全部 | “开放而生涩”“初学式表达”改为新鲜、想表达但还不熟练；感谢卡写一个细节即可，避免完美表达的门槛。 |
| c12 | 圣杯骑士 | 全部 | “把感受或理想化成”歧义改为主动表达心意；“小交付”“兑现”落到约定一项准备、看是否按约完成。 |
| c13 | 圣杯王后 | 全部 | 涵养、共情卷入等改为细心听、别把自己的经历套过去、别把朋友责任全揽下；不先抛术语再解释。 |
| c14 | 圣杯国王 | 全部 | 容纳复杂情绪、回应失衡改为有难过生气也能想清楚、一直压着后来发火；协商分工与理解不满直接相连。 |

**28张宝剑与星币**

| 牌 ID | 范围与状态 | 本轮修订重点 | 待议 |
|---|---|---|---|
| s01 | 全链路已实读、已润色 | 把理解、定义和完成工作的区别说清；补题反馈直接点明初稿/终稿与一小时/一天。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s02 | 全链路已实读、已润色 | 把封闭、平衡和等值改为不看要求、拖着不选与选项不一定一样好。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s03 | 全链路已实读、已润色 | 把恢复表述为愿意谈伤痛、重新安排生活；不把三剑换算为三人。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s04 | 全链路已实读、已润色 | 明确真正休息与继续看任务消息的区别；写出暂停后再继续的原因。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s05 | 全链路已实读、已润色 | 把争胜与代价落到羞辱、同伴退出、合作受损，反馈不只重复“代价”。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s06 | 全链路已实读、已润色 | 改为换计划仍熬夜、旧任务仍需交接等具体动作；去掉“带着经历过渡”的口号。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s07 | 全链路已实读、已润色 | 说明哪些保密会影响他人、为何要沟通；删去依赖选项顺序的“后者”引用。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s08 | 全链路已实读、已润色 | 同时说明绑缚是真实限制、间隙代表继续找办法；不否认困难。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s09 | 全链路已实读、已润色 | 直接写反复担心，不先引入反刍；逐项区分未回复、失败猜测及核查。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s10 | 全链路已实读、已润色 | 把结束范围限定到已取消项目/旧流程；恢复不要求旧项目重开。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s11 | 全链路已实读、已润色 | 把求知与核实落到标题、正文、术语、试操作；反馈说明为什么猜测不够。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s12 | 全链路已实读、已润色 | 改“冲断别人”为打断别人；区分做得快与方向正确，说明何时先核对。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s13 | 全链路已实读、已润色 | 把边界先写成什么能接受、什么不能；补足逆位例子主语，旧伤不证明新朋友动机。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| s14 | 全链路已实读、已润色 | 把跨对象一致、可检查判断改为同一标准审核、说明依据；不靠头衔或术语。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p01 | 全链路已实读、已润色 | 机会改为工具、时间和第一次练习的安排；区分拿到资源与实际学会。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p02 | 全链路已实读、已润色 | 去掉容量术语，直接写每天时间有限、减任务、调排班；修复句子重复。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p03 | 全链路已实读、已润色 | 技艺改为技能；对齐接口改为说清尺寸和交付要求；指出为什么多人不自动形成合作。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p04 | 全链路已实读、已润色 | 守成改为守住已有东西；把保护与限制写为必要储备和必要支出。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p05 | 全链路已实读、已润色 | 匮乏改为资源不足；反馈指出教材、场地和设备缺口，避免用情绪替代具体帮助。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p06 | 全链路已实读、已润色 | 说明帮助附带什么条件、谁能拒绝；分别对齐借设备、辅导和事后追加要求的情境。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p07 | 全链路已实读、已润色 | 评估、投入回报改为看做出什么、花了多久、方法有无帮助；不把耐心写成无限重复。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p08 | 全链路已实读、已润色 | 两轮修订：首轮改勤勉/技艺与质量连接；复核补改 R1 两选项及错误反馈、T1 评分说明和 V1 未指明牌名。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p09 | 全链路已实读、已润色 | 独立与享受改为能安排生活、预算内奖励；逆位说明超支维持形象造成影响。 | 见下方 Q1→R1 目标偏移。 |
| p10 | 全链路已实读、已润色 | 结构与延续改为文件交接、找得到资料、接手者能继续做；保留长期积累牌义。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p11 | 全链路已实读、已润色 | 务实入门改为从一个设置开始试拍、实际动手；删去重复画面句。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p12 | 全链路已实读、已润色 | 可持续执行改为每天做得完、能坚持的安排；修复考试句重复，旧要求变化需调整。 | 未重设计题型；不能据此保证无可读性遗漏。 |
| p13 | 全链路已实读、已润色 | 容量、具体载体改为时间精力、吃饭休息、用品场地；保留照顾他人与自己。 | 见下方 Q1→R1 目标偏移。 |
| p14 | 全链路已实读、已润色 | 经营持续性改为设备能用、有人维护、费用有人承担；不只重复“长期保障”。 | 未重设计题型；不能据此保证无可读性遗漏。 |

### 14.5 从学习流程看，仍不能靠改句子解决的问题

1. **有些题不学牌也能做对。**比如[高塔Q1](#m16-q1)用具体交通事故作错误项、[命运之轮R2](#m10-r2)仍有无法实际执行的错误做法，以及大量“永远、所有、自动”选项。语言可以变清楚，选项却仍不像新人真正会犯的错。后续应按刚教的区别重做，不靠增加绕口话提高难度。
2. **有些补题换了要检查的事情。**历史稿中[星币王后](#card-p13)Q1讲实际照顾，R1却检查性别；R6已把这一项改为同目标复测。[星币九](#card-p09)Q1讲独立不等于拒绝别人，R1改考享受与证明身份。另有w11、w12、w13、c02、c08、c10、c11、c12的类似偏移。即使新句子容易读，做对补题也不能证明原来的误解已解决。未修项目继续保留为待重设计，不能把路由完整算作教学匹配。
3. **太多题都在选“下一步怎样做”。**需要继续讨论如何检查这张牌原本在描述什么、怎样记住核心意思，以及换一个已教牌位怎样读。不能把78张牌最后都学成一些看似合理的生活建议。
4. **说明仍可能过多。**数字表首次集中出现、同一张牌连续排除许多误读、频繁重复“不能保证某结果”，可能盖过要记的主要意思。需要与课程顺序一起调整；本轮没有用删边界或新增点击来假装解决。
5. **少输入不等于只选整段参考答案。**高级课仍需讨论如何让学习者组织一条有依据的回答；不以新增自评、日记、感悟或长文必填解决这个问题。
6. **真实的阅读负担还要由试学确认。**完成静态走查后，仍应让零基础的人从只看到当前讲解的条件下学习代表单元，观察其具体困惑和作答。不要让用户填写“我掌握了多少”来代替检验题目是否教会。

以上保留为待讨论的教学问题。已确认不加自评、先教再考、学牌与抽牌分开等原则继续有效；本轮不恢复任何旧版游戏或交互。

### 14.6 路径模拟与状态

| 路径 | 本轮核对结果 | 未验证的部分 |
|---|---|---|
| 顺利学习 | 先讲再题、反馈后继续；20课与逐牌主步骤保留。实际显示文字和内部作者字段明确区分。 | 未在应用里运行，不能据文稿判断滚动、动画或按钮已顺畅。 |
| 答错后补讲 | 明确指出不对，补讲改用具体情境；不再只说符合或不符合核心。 | 上述补题换考点仍待修，不能标成所有分支已有效。 |
| 使用提示后完成 | 不要求评价自己；提示、答案依据和后续回访记录内部保留。 | 不能把有提示的完成算成独立掌握。 |
| 连续困难 | 保留最多两轮，不无限重做；随后看总结，继续，另一次再练。 | 调度时间与效果没有实测，未把它包装成科学已证实参数。 |
| 暂停或恢复 | 保存当前步骤与已看讲解，恢复不强迫从头重来；文案直接说“接着上次继续”。 | 这里只保留设计约定，未改现有应用存储或验证手机状态恢复。 |
| 自选一张从未学过的牌 | 必要的花色—元素关系在对应讲解说明，其他前置仍可查看。 | 完整入口与必要术语仍要在代表课试学时逐步检验，不宣称全量零障碍。 |

### 14.7 R2事项的当前处理

- N01首次术语、N02星币与土、N04抽象词、N05题干重复、N07反馈绕话、N08题干问类别、N09案例事实、N10障碍位、N11推测与事实、N12位置专名：对应正文已修订，关键示例已复读。不是仅追加建议。
- N06圣杯十：保留“彼此想要的生活不同、没有谈清”的同一情境，同步题目和补讲，不把它另换成“共同目标相同却没有落实”。
- N03数字课的组织、N13边界说明的时机：本轮改善措辞，教学编排仍待讨论；不标成全部解决。
- R2“普通术语可以保留，再紧跟解释”的旧提议已失效；以用户最新确认的学习者视角约定为准。

### 14.8 核对与接力

本轮保留20课、78张牌、646道题和原正确答案对应关系。已检查各区段的题目、选项顺序、锚点与链接未被文字改写破坏；全部内部链接、本地链接、78图片哈希核对通过，Word原件及其附录基线保持不变。文档的内部作者字段仍存在，但已明确不能作为学习者展示文字。

当前状态：**语言原则已确认；全稿中文已审读和修订；结构完整性已核对；教学效果未验证；新方案未实现。**下次先读本节与当前正文，继续讨论第14.5节的实质教学问题，并用实际的一段讲解—问题—选项—反馈来评审；不要再为了展示游戏功能而先做UI或开发。

<a id="baseline-atlas"></a>
## 附录：原Word的78牌六字段基线（保留文本）

以下逐项提取自本轮核对的Word原件。它是修订对照材料，不直接作为新应用讲解，也不覆盖上文的新决定。原文中的关键词组是该版的整理方式，不意味着新课程限三个；逆位条目是入门方向，不是唯一读法。现行教学以相应逐牌脚本为准。来源为项目自身原创教材S08；此附录只中文，因为没有作为应用文案交付。

<a id="baseline-m00"></a>
### m00 愚人 / The Fool · Word基线

[当前脚本](#card-m00)

- 核心词　开始、开放、探索
- 完整意思　愿意进入未知的新阶段，以好奇心迈出第一步。
- 画面助记　轻装的人走近崖边，身旁有狗；轻装帮助记“开始”，崖边提醒“尚有未知”。
- 逆位方向　莽撞或准备不足，尚未认真看清开始行动的条件。
- 应用示范　学业建议：先试一节入门课，确认适合后再加大投入。
- 易错提醒　开放不等于毫无准备，也不保证尝试一定成功。

<a id="baseline-m01"></a>
### m01 魔术师 / The Magician · Word基线

[当前脚本](#card-m01)

- 核心词　主动、专注、运用资源
- 完整意思　明确意图，主动调动已有能力和工具，把想法付诸实践。
- 画面助记　桌上四种器具、上下相应的手势，帮助记“把条件组织起来并行动”。
- 逆位方向　意图分散、资源闲置，或展示能力多于实际执行。
- 应用示范　工作建议：先列出可用技能与工具，完成一个可展示的成果。
- 易错提醒　不能仅凭此牌断言别人操纵你。

<a id="baseline-m02"></a>
### m02 女祭司 / The High Priestess · Word基线

[当前脚本](#card-m02)

- 核心词　直觉、静观、潜藏
- 完整意思　留意内在感受与尚未显露的信息，不急于介入或定论。
- 画面助记　两柱之间的静坐者、帷幕与半遮卷轴，可作“尚有内容未展开”的助记。
- 逆位方向　忽略内在声音，或让猜测代替了核实。
- 应用示范　关系建议：觉察自己不舒服的原因，再询问尚不清楚的事情。
- 易错提醒　直觉是解释线索，不是他人有秘密的证据。

<a id="baseline-m03"></a>
### m03 皇后 / The Empress · Word基线

[当前脚本](#card-m03)

- 核心词　滋养、丰盛、创造
- 完整意思　用照顾、感官体验与合适的环境，让生命或作品逐渐生长。
- 画面助记　麦田、树木与舒适坐席，让“被滋养而生长”的主题有了可见载体。
- 逆位方向　照顾失衡、创造受阻，或忽视自身需求。
- 应用示范　创作建议：给作品稳定的时间、材料和耐心，让想法成形。
- 易错提醒　不能据此判断怀孕或身体状况。

<a id="baseline-m04"></a>
### m04 皇帝 / The Emperor · Word基线

[当前脚本](#card-m04)

- 核心词　秩序、权威、责任
- 完整意思　用规则、边界和承担责任的行动建立稳定。
- 画面助记　石座、铠甲与端正坐姿，可帮助记住结构与保护。
- 逆位方向　控制过强、规则僵硬，稳定变成限制灵活应对的障碍。
- 应用示范　工作建议：明确谁负责、何时交付、怎样验收。
- 易错提醒　承担责任不等于必须服从某位男性。

<a id="baseline-m05"></a>
### m05 教皇 / The Hierophant · Word基线

[当前脚本](#card-m05)

- 核心词　传统、学习、规范
- 完整意思　通过老师、组织或已有方法理解并传承一套共同知识。
- 画面助记　教导者、两位听者与钥匙，让“知识传授和共同规范”容易记忆。
- 逆位方向　质疑旧规范、寻找自己的方法，或盲从不合适的权威。
- 应用示范　学业建议：先理解教材的方法，再判断哪些需要调整。
- 易错提醒　传统方法可以帮助入门，但不因此永远正确。

<a id="baseline-m06"></a>
### m06 恋人 / The Lovers · Word基线

[当前脚本](#card-m06)

- 核心词　联结、价值、选择
- 完整意思　建立重要联结，并作出与自己价值观相符的选择。
- 画面助记　两个人物与上方天使呈现联结主题；“价值选择”属于传统解释，不能只靠人数推出。
- 逆位方向　价值不一致、关系失衡，或回避必须作出的选择。
- 应用示范　关系现状：吸引之外，还需要确认双方对承诺是否一致。
- 易错提醒　不等于灵魂伴侣证明，也不限爱情。

<a id="baseline-m07"></a>
### m07 战车 / The Chariot · Word基线

[当前脚本](#card-m07)

- 核心词　意志、掌控、推进
- 完整意思　整合不同力量，保持方向，以自律推动目标。
- 画面助记　驾车者与黑白两只斯芬克斯，适合作为“把分歧带向同一方向”的助记。
- 逆位方向　失去方向、控制失衡，或用力推进却缺少协调。
- 应用示范　备考建议：确定主目标，把复习时间投入最关键的任务。
- 易错提醒　强烈行动倾向不保证赢过所有对手。

<a id="baseline-m08"></a>
### m08 力量 / Strength · Word基线

[当前脚本](#card-m08)

- 核心词　勇气、耐心、自我调节
- 完整意思　以温和而坚定的力量面对本能、压力和挫折。
- 画面助记　人物靠近狮子并用手接触它的嘴；没有武器，帮助记住柔和的力量。
- 逆位方向　自信不足、情绪失控，或把忍耐变成压抑。
- 应用示范　关系建议：先稳住情绪，再清楚表达边界和需求。
- 易错提醒　温柔坚定不要求忍受伤害。

<a id="baseline-m09"></a>
### m09 隐士 / The Hermit · Word基线

[当前脚本](#card-m09)

- 核心词　独处、反思、寻找方向
- 完整意思　暂时减少外界干扰，深入寻找方向，也可向有经验者求教。
- 画面助记　独行者提灯扶杖；灯照亮有限范围，帮助记住一步步探寻。
- 逆位方向　孤立、封闭，或迟迟不愿面对内在问题。
- 应用示范　职业建议：整理真正看重的工作条件，再请教可信的前辈。
- 易错提醒　独处是方法，不等于永远拒绝合作。

<a id="baseline-m10"></a>
### m10 命运之轮 / Wheel of Fortune · Word基线

[当前脚本](#card-m10)

- 核心词　周期、转机、变化
- 完整意思　外部条件正在转换，需要观察时机并调整应对。
- 画面助记　大轮与周围形象呈现运行和变动；轮转可帮助记住阶段转换。
- 逆位方向　变化不顺、抗拒变化，或反复陷入相同循环。
- 应用示范　项目现状：外部节奏有变化，原计划需要重新评估。
- 易错提醒　不是必然好运，也不能仅凭此牌确定日期。

<a id="baseline-m11"></a>
### m11 正义 / Justice · Word基线

[当前脚本](#card-m11)

- 核心词　公平、判断、责任
- 完整意思　依据事实和一致标准作出决定，并承担选择的后果。
- 画面助记　天平与直立宝剑可分别记为权衡和决断。
- 逆位方向　偏见、标准不一，或逃避自己应承担的责任。
- 应用示范　合作建议：把分工和约定说清，核对事实后再判断。
- 易错提醒　不预测诉讼胜负或替代法律意见。

<a id="baseline-m12"></a>
### m12 倒吊人 / The Hanged Man · Word基线

[当前脚本](#card-m12)

- 核心词　暂停、换角度、放下
- 完整意思　暂缓惯常推进方式，以不同视角理解处境与代价。
- 画面助记　倒悬的人物与平静神情，让“姿态改变但并非挣扎”成为助记。
- 逆位方向　无效拖延、抗拒放下，或付出却没有换来新的理解。
- 应用示范　工作建议：暂停重复的无效动作，重新检视问题定义。
- 易错提醒　不是要求无条件牺牲或被动等待。

<a id="baseline-m13"></a>
### m13 死神 / Death · Word基线

[当前脚本](#card-m13)

- 核心词　结束、转化、告别
- 完整意思　一个阶段需要结束，放下不再适合的形式，为转换留出空间。
- 画面助记　骑士、倒下的人与远方日出，可以连接结束与继续变化。
- 逆位方向　抗拒结束、拖延告别，旧模式难以退出。
- 应用示范　关系建议：承认某种相处方式已失效，再讨论怎样改变。
- 易错提醒　不作现实死亡预测。

<a id="baseline-m14"></a>
### m14 节制 / Temperance · Word基线

[当前脚本](#card-m14)

- 核心词　调和、节奏、整合
- 完整意思　让不同部分逐步配合，通过适量调整形成可持续的状态。
- 画面助记　两杯之间流动的水、一脚在水一脚在岸，可记为调配与协调。
- 逆位方向　节奏失衡、配合不良，或某一部分过量。
- 应用示范　学业建议：调整学习与休息的比例，而非不断延长时长。
- 易错提醒　调和不等于所有事情都各退一半。

<a id="baseline-m15"></a>
### m15 恶魔 / The Devil · Word基线

[当前脚本](#card-m15)

- 核心词　束缚、依赖、欲望
- 完整意思　某种诱惑、依赖或惯性正在缩小选择空间。
- 画面助记　两个人物被锁链连到基座，帮助记住受牵制的关系。
- 逆位方向　开始看见并松动依赖或束缚，尝试恢复选择空间。
- 应用示范　生活建议：辨认哪种即时满足正在占用自己的时间。
- 易错提醒　不能给某人贴邪恶标签，也不能据此诊断成瘾。

<a id="baseline-m16"></a>
### m16 高塔 / The Tower · Word基线

[当前脚本](#card-m16)

- 核心词　突变、崩解、揭露
- 完整意思　原以为稳定的结构受到突然冲击，隐藏的问题被迫显露。
- 画面助记　闪电击塔、皇冠飞离、人物坠落，连接突然性与结构受损。
- 逆位方向　抗拒必要改变、危机被拖延，或冲击更多发生在内在认知。
- 应用示范　工作建议：检查方案中已被事实推翻的前提，及时修正。
- 易错提醒　不等于指定时间会发生某场灾难。

<a id="baseline-m17"></a>
### m17 星星 / The Star · Word基线

[当前脚本](#card-m17)

- 核心词　希望、修复、信任
- 完整意思　经历波动后重新恢复信心，愿意滋养自己并面向未来。
- 画面助记　星光下的人把水倒向水面和土地，适合作为恢复与滋养的助记。
- 逆位方向　失望、信心不足，暂时难以相信恢复的可能。
- 应用示范　受挫后的建议：恢复基础节奏，找回一个可以持续的小目标。
- 易错提醒　希望与修复不是成果已经落地。

<a id="baseline-m18"></a>
### m18 月亮 / The Moon · Word基线

[当前脚本](#card-m18)

- 核心词　模糊、恐惧、想象
- 完整意思　信息不明时，想象和不安容易影响判断，需要辨认真实与投射。
- 画面助记　月光、两座塔与通向远方的路，让“看不完全清楚”容易记忆。
- 逆位方向　逐步辨认想象与事实，模糊的处境开始变得清楚。
- 应用示范　关系现状：目前不足以确认对方意图，先核对具体行为。
- 易错提醒　不凭此牌指控欺骗、第三者或精神问题。

<a id="baseline-m19"></a>
### m19 太阳 / The Sun · Word基线

[当前脚本](#card-m19)

- 核心词　清晰、活力、喜悦
- 完整意思　事情更明朗，能坦然表达、分享成果并感受生命力。
- 画面助记　太阳、向日葵和白马上的孩子，帮助记住明亮与开放。
- 逆位方向　喜悦受阻、过度乐观，或暂时看不见已有的积极面。
- 应用示范　学习结果示例：复杂概念终于被理解，愿意公开展示成果。
- 易错提醒　正面倾向不代表没有现实限制。

<a id="baseline-m20"></a>
### m20 审判 / Judgement · Word基线

[当前脚本](#card-m20)

- 核心词　觉醒、回顾、回应
- 完整意思　重新看待过往，认出需要回应的改变，决定怎样开启下一阶段。
- 画面助记　号角与起身回应的人物，帮助记住被唤醒和作出回应。
- 逆位方向　自我怀疑、反复苛责，或回避已经意识到的改变。
- 应用示范　职业建议：回顾经验中的反复主题，明确下一步真正要改变什么。
- 易错提醒　不是对人的道德审判，也非某事必然复活。

<a id="baseline-m21"></a>
### m21 世界 / The World · Word基线

[当前脚本](#card-m21)

- 核心词　完成、整合、阶段圆满
- 完整意思　一段经历形成相对完整的成果，能力与经验得到整合。
- 画面助记　花环中的人物与四角形象，提供完整、包围与整合的视觉助记。
- 逆位方向　收尾未完成、差最后一步，或执着完美而难以结束。
- 应用示范　学业结果示例：完成作品并能解释方法，进入新的学习阶段。
- 易错提醒　完成一个阶段不等于人生从此没有问题。

<a id="baseline-w01"></a>
### w01 权杖王牌 / Ace of Wands · Word基线

[当前脚本](#card-w01)

- 核心词　灵感、热情、启动
- 完整意思　新的动力或创意出现，有机会开始一次行动。
- 画面助记　云中伸出的手握着发芽权杖，把新生的动力变成可见线索。
- 逆位方向　动力不足、开头受阻，或热情很快消退。
- 应用示范　创作建议：把灵感做成一个小样，确认是否值得继续。
- 易错提醒　灵感出现不等于整个项目已具备条件。

<a id="baseline-w02"></a>
### w02 权杖二 / Two of Wands · Word基线

[当前脚本](#card-w02)

- 核心词　规划、选择、远景
- 完整意思　已有一定基础，正思考下一步向哪里拓展。
- 画面助记　人物站在城墙上持地球仪远望，连接现有位置与外部可能。
- 逆位方向　迟疑、规划不足，或只敢停留在熟悉范围。
- 应用示范　工作现状：已有经验，正在比较新的发展方向。
- 易错提醒　仍在谋划，不代表已经实现远景。

<a id="baseline-w03"></a>
### w03 权杖三 / Three of Wands · Word基线

[当前脚本](#card-w03)

- 核心词　拓展、远见、等待回响
- 完整意思　行动已向外展开，开始关注合作、远方机会与后续发展。
- 画面助记　人物面向海上船只，身边三根权杖，适合记成向外观察进展。
- 逆位方向　扩展受阻、反馈延迟，或远景与现实脱节。
- 应用示范　项目建议：跟进已经发出的提案，准备下一轮合作。
- 易错提醒　等待回响不等于什么也不做。

<a id="baseline-w04"></a>
### w04 权杖四 / Four of Wands · Word基线

[当前脚本](#card-w04)

- 核心词　庆祝、安定、阶段成果
- 完整意思　一个阶段获得稳定成果，可以与人共同庆祝并建立归属。
- 画面助记　四根权杖上有花环，人物在其后举花，呈现庆祝的场景。
- 逆位方向　共同支持不稳、庆祝延迟，或外表热闹但缺少归属。
- 应用示范　团队示例：完成首个里程碑，一起确认成果并休整。
- 易错提醒　阶段完成不等于所有目标终身完成。

<a id="baseline-w05"></a>
### w05 权杖五 / Five of Wands · Word基线

[当前脚本](#card-w05)

- 核心词　竞争、分歧、磨合
- 完整意思　多个人或力量同时争取表达，协调尚未形成。
- 画面助记　多人各举权杖，动作方向不一，帮助记住竞争与缺少配合。
- 逆位方向　回避必须讨论的分歧，冲突转为持续内耗。
- 应用示范　工作建议：先统一目标和讨论规则，再比较方案。
- 易错提醒　不能单凭画面断言参与者互相仇恨。

<a id="baseline-w06"></a>
### w06 权杖六 / Six of Wands · Word基线

[当前脚本](#card-w06)

- 核心词　胜利、认可、自信
- 完整意思　努力的成果被看见，获得外部认可并增强信心。
- 画面助记　戴桂冠的人骑马穿过人群，权杖上也有花环。
- 逆位方向　认可不足、过度依赖掌声，或因骄傲忽视后续工作。
- 应用示范　学业示例：展示作品获得肯定，但仍需继续练习。
- 易错提醒　受到认可不意味着能力永远领先。

<a id="baseline-w07"></a>
### w07 权杖七 / Seven of Wands · Word基线

[当前脚本](#card-w07)

- 核心词　立场、防守、坚持
- 完整意思　面对挑战时守住已争取的位置，清楚表达自己的立场。
- 画面助记　人物站在高处抵住下方六根权杖，帮助记住迎接挑战。
- 逆位方向　被压力压倒、放弃立场，或处处防御而耗尽精力。
- 应用示范　合作建议：说明不可退让的边界，同时区分小事与原则。
- 易错提醒　不是每一场争执都值得坚持到底。

<a id="baseline-w08"></a>
### w08 权杖八 / Eight of Wands · Word基线

[当前脚本](#card-w08)

- 核心词　速度、消息、推进
- 完整意思　事情进入快速发展的阶段，行动或信息正在集中到来。
- 画面助记　八根权杖同向掠过天空，呈现迅速而一致的运动。
- 逆位方向　延迟、沟通混乱，或进展太急而失去协调。
- 应用示范　工作建议：及时回应关键消息，把待办安排清楚。
- 易错提醒　不自动等于八天或八周。

<a id="baseline-w09"></a>
### w09 权杖九 / Nine of Wands · Word基线

[当前脚本](#card-w09)

- 核心词　韧性、警觉、防备
- 完整意思　经历考验后仍在坚持，同时保留对再次受伤的警惕。
- 画面助记　头缠绷带的人握杖站在一排权杖前，兼有坚持和防护的意味。
- 逆位方向　消耗过大、难以继续撑住，或防备变成封闭。
- 应用示范　学业建议：守住核心复习任务，也给自己恢复体力的时间。
- 易错提醒　坚持不等于无限加码承受。

<a id="baseline-w10"></a>
### w10 权杖十 / Ten of Wands · Word基线

[当前脚本](#card-w10)

- 核心词　负担、责任、过量
- 完整意思　承担的任务已经过多，完成目标的代价变得沉重。
- 画面助记　人物抱着十根权杖弯身向前，视线和行动空间受限。
- 逆位方向　开始卸下过量任务，重新分配责任与负担。
- 应用示范　工作建议：重新分配任务，明确哪些可以延期或拒绝。
- 易错提醒　忙碌并不自动证明这份负担有价值。

<a id="baseline-w11"></a>
### w11 权杖侍从 / Page of Wands · Word基线

[当前脚本](#card-w11)

- 核心词　探索、热情、尝试
- 完整意思　以初学者的好奇接触新想法，愿意表达和试验。
- 画面助记　站立人物端详发芽的权杖，帮助记住刚开始探索的状态。
- 逆位方向　三分钟热度、迟迟不试，或想法缺少实际准备。
- 应用示范　学业建议：报名体验课，亲手试一次再判断兴趣。
- 易错提醒　侍从描述角色状态，不锁定年龄。

<a id="baseline-w12"></a>
### w12 权杖骑士 / Knight of Wands · Word基线

[当前脚本](#card-w12)

- 核心词　冒险、行动、冲劲
- 完整意思　带着强烈热情主动出发，追求新体验和进展。
- 画面助记　跃起的马与骑士举起的权杖，呈现快速行动的姿态。
- 逆位方向　急躁、行动反复，或缺少持续投入。
- 应用示范　工作示例：迅速启动新计划，也要补上后续安排。
- 易错提醒　积极追求不等于长期承诺。

<a id="baseline-w13"></a>
### w13 权杖王后 / Queen of Wands · Word基线

[当前脚本](#card-w13)

- 核心词　自信、热情、感染力
- 完整意思　稳定地表达自己的热情，用真诚与活力影响周围的人。
- 画面助记　王后持权杖与向日葵，坐姿开放，可帮助记住自信的表达。
- 逆位方向　缺乏自信、过度争取注意，或热情因疲惫而收缩。
- 应用示范　社交建议：自然展示所长，邀请别人参与感兴趣的事。
- 易错提醒　王后可以指任何性别的这种特质。

<a id="baseline-w14"></a>
### w14 权杖国王 / King of Wands · Word基线

[当前脚本](#card-w14)

- 核心词　领导、愿景、担当
- 完整意思　把热情组织成方向，带领他人行动并承担决定。
- 画面助记　国王坐在有狮子图案的宝座上持杖，体现稳定的主导姿态。
- 逆位方向　专断、急于扩张，或只提出愿景却不承担后果。
- 应用示范　项目建议：说明目标和优先级，为团队创造行动条件。
- 易错提醒　领导力不等于现实中的老板身份。

<a id="baseline-c01"></a>
### c01 圣杯王牌 / Ace of Cups · Word基线

[当前脚本](#card-c01)

- 核心词　情感萌发、接纳、流动
- 完整意思　新的感受、关爱或创造性体验开始出现，内心愿意开放。
- 画面助记　云中手托着溢水的杯，帮助记住感受正在涌现。
- 逆位方向　感受难以表达、情绪被压住，或过度倾注。
- 应用示范　关系建议：先承认自己的感受，用合适方式表达善意。
- 易错提醒　新的感受不等于已建立稳定关系。

<a id="baseline-c02"></a>
### c02 圣杯二 / Two of Cups · Word基线

[当前脚本](#card-c02)

- 核心词　相互回应、连接、合作
- 完整意思　双方愿意交流、回应并建立相互认可的关系。
- 画面助记　两人相向举杯，直接支持双向交流的记忆。
- 逆位方向　回应不对等、误解或关系失衡。
- 应用示范　合作现状：双方有建立共识的意愿，适合把约定谈清楚。
- 易错提醒　双向联结不限爱情，也不能保证永不分开。

<a id="baseline-c03"></a>
### c03 圣杯三 / Three of Cups · Word基线

[当前脚本](#card-c03)

- 核心词　友谊、欢聚、支持
- 完整意思　在群体中分享喜悦，从朋友或共同体获得情感支持。
- 画面助记　三个人举杯相聚，脚边有果实，呈现共同庆祝。
- 逆位方向　社交过量、被排除，或表面相聚而缺乏真实支持。
- 应用示范　生活建议：与信任的朋友见面，分享最近的经历。
- 易错提醒　三个人物不等于现实中的第三者。

<a id="baseline-c04"></a>
### c04 圣杯四 / Four of Cups · Word基线

[当前脚本](#card-c04)

- 核心词　冷淡、内省、忽略机会
- 完整意思　注意力向内收缩，对已有或新出现的情感机会暂时缺少回应。
- 画面助记　树下抱臂者面对三杯，侧面还有递来的第四杯。
- 逆位方向　重新愿意回应已有机会，走出持续的冷淡与退缩。
- 应用示范　工作现状：对机会提不起兴趣，需要分清不适合还是疲惫。
- 易错提醒　不回应不一定是没有机会。

<a id="baseline-c05"></a>
### c05 圣杯五 / Five of Cups · Word基线

[当前脚本](#card-c05)

- 核心词　失落、遗憾、关注损失
- 完整意思　已发生的失落占据注意力，仍存在的支持容易被忽略。
- 画面助记　三杯倒下、两杯仍立，人物面向倒杯，是核心助记。
- 逆位方向　逐渐接纳损失、恢复情绪，重新注意仍然存在的支持。
- 应用示范　关系建议：承认失落，再看仍可维持的支持和联系。
- 易错提醒　不是所有资源都已经失去。

<a id="baseline-c06"></a>
### c06 圣杯六 / Six of Cups · Word基线

[当前脚本](#card-c06)

- 核心词　回忆、善意、纯真
- 完整意思　过去的经验或熟悉的人带来温暖，出现单纯的给予与亲切感。
- 画面助记　较大的孩子把盛花的杯递向较小者，呈现善意与童年主题。
- 逆位方向　沉溺过去、旧模式束缚，或正在学习走出怀旧。
- 应用示范　生活建议：回看曾带给自己支持的经验，并选择适合现在的部分。
- 易错提醒　不等于前任一定回来。

<a id="baseline-c07"></a>
### c07 圣杯七 / Seven of Cups · Word基线

[当前脚本](#card-c07)

- 核心词　幻想、选项、分散
- 完整意思　可能性很多，但愿望与现实条件尚未被清楚区分。
- 画面助记　云中的七只杯装着不同形象，人物面对它们，可记为多种诱惑与想象。
- 逆位方向　逐步筛选选项、减少空想，开始根据现实条件作出选择。
- 应用示范　工作建议：把候选方向按实际条件逐一核对，先选一个试行。
- 易错提醒　看见很多选择不代表每个都可实现。

<a id="baseline-c08"></a>
### c08 圣杯八 / Eight of Cups · Word基线

[当前脚本](#card-c08)

- 核心词　离开、寻求、放下
- 完整意思　原有情境已难以满足内在需要，开始离开并寻找更有意义的方向。
- 画面助记　人物背向整齐摆放的杯子走向山地，重点是主动转身离开。
- 逆位方向　难以离开、反复回头，或没有想清楚就想逃离。
- 应用示范　生活建议：辨认不再满足的原因，准备好再结束旧投入。
- 易错提醒　不意味着所有离开都正确。

<a id="baseline-c09"></a>
### c09 圣杯九 / Nine of Cups · Word基线

[当前脚本](#card-c09)

- 核心词　满足、愿望、享受
- 完整意思　个人需求得到一定满足，能欣赏拥有的成果和愉悦。
- 画面助记　人物坐在九只杯前，姿态安定，可记为享受已有的满足。
- 逆位方向　外在满足与内在需要脱节，或过度追求享乐。
- 应用示范　结果示例：完成一个自己重视的目标，对成果感到满意。
- 易错提醒　个人满意不自动等于双方关系和谐。

<a id="baseline-c10"></a>
### c10 圣杯十 / Ten of Cups · Word基线

[当前脚本](#card-c10)

- 核心词　和谐、归属、共享幸福
- 完整意思　在亲密关系或共同生活中感到情感满足，愿意分享未来。
- 画面助记　成人举臂、孩子活动、杯子彩虹与家园，把幸福放在共同生活里。
- 逆位方向　共同愿景不一致、家庭或群体关系失和，或追求完美表象。
- 应用示范　关系建议：讨论双方想要的日常生活，并以实际互动维持它。
- 易错提醒　不保证结婚、生育或永远幸福。

<a id="baseline-c11"></a>
### c11 圣杯侍从 / Page of Cups · Word基线

[当前脚本](#card-c11)

- 核心词　好奇、敏感、情感表达
- 完整意思　以开放而生涩的态度接触新的感受、灵感或情感讯息。
- 画面助记　侍从注视杯中探出的鱼，是新奇感受引起注意的助记。
- 逆位方向　情感表达不成熟、害羞退缩，或想象脱离实际。
- 应用示范　关系建议：用简单真诚的话表达感受，不急着做很大的承诺。
- 易错提醒　不能凭此牌确定会收到某个人的消息。

<a id="baseline-c12"></a>
### c12 圣杯骑士 / Knight of Cups · Word基线

[当前脚本](#card-c12)

- 核心词　表达心意、浪漫、追求理想
- 完整意思　把感受或理想化成主动表达，愿意接近自己向往的人事物。
- 画面助记　骑士持杯，马缓步前进，可记为带着情感目标主动靠近。
- 逆位方向　理想化、言行不一，或情绪左右行动。
- 应用示范　创作建议：把心中的审美想法做成一次具体提案。
- 易错提醒　浪漫表达不保证行动长期可靠。

<a id="baseline-c13"></a>
### c13 圣杯王后 / Queen of Cups · Word基线

[当前脚本](#card-c13)

- 核心词　共情、倾听、感受力
- 完整意思　认真体会情绪，以关怀和内在理解回应自己与他人。
- 画面助记　王后专注看着有盖的杯，靠近水面，帮助记住内在感受。
- 逆位方向　情绪过度卷入、边界不清，或忽略自身需要。
- 应用示范　关系建议：听懂对方感受，同时分清哪些责任属于自己。
- 易错提醒　共情不等于知道他人真实想法。

<a id="baseline-c14"></a>
### c14 圣杯国王 / King of Cups · Word基线

[当前脚本](#card-c14)

- 核心词　情绪稳定、包容、调解
- 完整意思　能容纳复杂情绪，同时保持判断和成熟回应。
- 画面助记　国王在波动的水面上端坐持杯，可记为情绪环境变化中保持稳定。
- 逆位方向　压抑情绪、情绪控制他人，或表面镇定而内在失衡。
- 应用示范　工作建议：处理分歧时先理解情绪，再作清楚而稳妥的决定。
- 易错提醒　稳定不等于没有情绪。

<a id="baseline-s01"></a>
### s01 宝剑王牌 / Ace of Swords · Word基线

[当前脚本](#card-s01)

- 核心词　清晰、突破、判断
- 完整意思　一个问题获得新的理解，可以辨明事实并作出清楚判断。
- 画面助记　云中手举起宝剑，剑尖穿过王冠，可记为清晰而集中的思考。
- 逆位方向　混乱、判断失准，或表达过于锋利。
- 应用示范　学业建议：把复杂问题拆成明确概念，找出真正的分歧。
- 易错提醒　想清楚不代表执行已经完成。

<a id="baseline-s02"></a>
### s02 宝剑二 / Two of Swords · Word基线

[当前脚本](#card-s02)

- 核心词　僵持、回避、难以抉择
- 完整意思　为维持平衡而暂时封闭信息或感受，决定因此停住。
- 画面助记　蒙眼人物交叉持剑坐在水边，帮助记住封闭与暂时平衡。
- 逆位方向　难以维持原先的僵持，混乱或信息压力迫使人面对决定。
- 应用示范　选择建议：确认还缺什么信息，再比较两个选项。
- 易错提醒　不是两种选择天然同样好。

<a id="baseline-s03"></a>
### s03 宝剑三 / Three of Swords · Word基线

[当前脚本](#card-s03)

- 核心词　伤痛、分离、直面事实
- 完整意思　某种事实、冲突或分离带来清楚的情感伤痛。
- 画面助记　三剑穿心、雨云在后，强烈呈现伤痛的象征。
- 逆位方向　开始面对伤痛，逐步释放并修复，而不是否认曾经受伤。
- 应用示范　关系建议：承认受伤的具体原因，再决定怎样沟通或结束。
- 易错提醒　不能从三把剑推断三角关系。

<a id="baseline-s04"></a>
### s04 宝剑四 / Four of Swords · Word基线

[当前脚本](#card-s04)

- 核心词　休息、暂停、恢复
- 完整意思　先退出持续消耗，通过安静休整为下一步积蓄状态。
- 画面助记　横卧的人像、静止的剑与室内场景，帮助记住暂时休整。
- 逆位方向　休整不足或无法真正休息，焦躁使恢复过程受到干扰。
- 应用示范　备考建议：安排真正的休息，整理节奏后再继续。
- 易错提醒　暂停不等于失败或永久放弃。

<a id="baseline-s05"></a>
### s05 宝剑五 / Five of Swords · Word基线

[当前脚本](#card-s05)

- 核心词　争胜、冲突、代价
- 完整意思　把赢放在关系和共同目标之前，可能得到有代价的胜利。
- 画面助记　一人收拢剑，另两人离去，让胜负与疏离同时可见。
- 逆位方向　愿意和解，或冲突后的不满仍未解决。
- 应用示范　合作建议：先确认真正目标，避免为了争口气损害合作。
- 易错提醒　不能据此断定某人品行恶劣。

<a id="baseline-s06"></a>
### s06 宝剑六 / Six of Swords · Word基线

[当前脚本](#card-s06)

- 核心词　过渡、离开困境、缓和
- 完整意思　带着已有经历离开较困难的处境，向相对平稳的阶段移动。
- 画面助记　船载人物和六把剑驶向对岸，可记为仍带着问题的过渡。
- 逆位方向　过渡受阻、旧问题跟随，或不愿离开熟悉环境。
- 应用示范　工作建议：逐步换到更合适的方法，不要求立刻完全轻松。
- 易错提醒　不必字面解释为出国或坐船。

<a id="baseline-s07"></a>
### s07 宝剑七 / Seven of Swords · Word基线

[当前脚本](#card-s07)

- 核心词　策略、隐瞒、回避
- 完整意思　采用迂回或独自处理的方式，可能有必要的策略，也可能在逃避坦诚。
- 画面助记　人物拿走五剑并回头，另两剑留下，适合记为不公开的行动。
- 逆位方向　开始坦白或重新面对问题；也可能担忧做法被发现。
- 应用示范　合作建议：辨认哪些信息确需保密，哪些该向伙伴说明。
- 易错提醒　不能仅凭此牌指控偷窃或背叛。

<a id="baseline-s08"></a>
### s08 宝剑八 / Eight of Swords · Word基线

[当前脚本](#card-s08)

- 核心词　受限、困住、看不见选择
- 完整意思　限制与无力感占据视野，尚未看清自己可以怎样移动。
- 画面助记　蒙眼、受缚的人站在剑阵中，呈现受限；画面仍留有空隙。
- 逆位方向　逐步看清限制，重新发现选择，并尝试摆脱无力感。
- 应用示范　学业建议：列出具体卡点和可获得的帮助，先解开一个限制。
- 易错提醒　不能把真实困境全部归咎于想太多。

<a id="baseline-s09"></a>
### s09 宝剑九 / Nine of Swords · Word基线

[当前脚本](#card-s09)

- 核心词　担忧、反刍、精神压力
- 完整意思　忧虑在脑中反复放大，使人难以休息或看清当下。
- 画面助记　人物坐起掩面，九剑在墙上，帮助记住夜间的忧惧。
- 逆位方向　开始说出担忧、寻求帮助，压力有机会逐步缓解。
- 应用示范　生活建议：区分已发生的事实和担忧的情节，寻求支持。
- 易错提醒　不是坏事即将发生的证明，也不用于诊断。

<a id="baseline-s10"></a>
### s10 宝剑十 / Ten of Swords · Word基线

[当前脚本](#card-s10)

- 核心词　终结、受挫、极限
- 完整意思　某种做法或处境走到难以继续的终点，需要承认结束。
- 画面助记　人物伏地、背上十剑，远处天际渐亮，可记为终点与后续可能。
- 逆位方向　逐渐从低点恢复，尝试结束已经难以维持的旧阶段。
- 应用示范　项目建议：承认已无法维持的方案，整理损失后重启。
- 易错提醒　不解释为现实死亡或绝无未来。

<a id="baseline-s11"></a>
### s11 宝剑侍从 / Page of Swords · Word基线

[当前脚本](#card-s11)

- 核心词　求知、警觉、提问
- 完整意思　敏锐观察并提出问题，开始练习分析与表达。
- 画面助记　侍从举剑、转头观察，风吹动树木和云，可记为警觉求知。
- 逆位方向　猜测过多、表达欠考虑，或只收集信息而不核实。
- 应用示范　学业建议：把不懂之处问具体，再验证信息来源。
- 易错提醒　好奇不等于已掌握完整事实。

<a id="baseline-s12"></a>
### s12 宝剑骑士 / Knight of Swords · Word基线

[当前脚本](#card-s12)

- 核心词　果断、速度、争取
- 完整意思　围绕一个判断迅速行动，直接表达并积极推进。
- 画面助记　骑士持剑向前冲，风势与马的姿态强化速度。
- 逆位方向　鲁莽争辩、判断太急，或推进失去方向。
- 应用示范　工作建议：抓住关键问题，但在行动前核对必要条件。
- 易错提醒　说得坚定不等于观点正确。

<a id="baseline-s13"></a>
### s13 宝剑王后 / Queen of Swords · Word基线

[当前脚本](#card-s13)

- 核心词　独立、清醒、边界
- 完整意思　运用经验作清楚判断，直言事实并维持界限。
- 画面助记　王后直立持剑，另一手伸出，适合记成既能交流又有边界。
- 逆位方向　苛刻、偏见，或受旧伤影响而拒绝交流。
- 应用示范　关系建议：明确表达能接受和不能接受的相处方式。
- 易错提醒　清醒不等于冷漠，也不限定女性。

<a id="baseline-s14"></a>
### s14 宝剑国王 / King of Swords · Word基线

[当前脚本](#card-s14)

- 核心词　理性、原则、专业判断
- 完整意思　以知识和一致标准统筹复杂问题，并承担决定。
- 画面助记　国王正面持剑坐稳，呈现正式而明确的判断姿态。
- 逆位方向　滥用权威、强词夺理，或把理性变成压制。
- 应用示范　合作建议：公开判断标准，让结论能被事实检验。
- 易错提醒　不等于某位专业人士必然正确。

<a id="baseline-p01"></a>
### p01 星币王牌 / Ace of Pentacles · Word基线

[当前脚本](#card-p01)

- 核心词　机会、资源、落地
- 完整意思　一个可实际培养的机会出现，需要投入资源让它生长。
- 画面助记　云中手托星币，花园与拱门在下，可记为可进入现实的起点。
- 逆位方向　机会未落实、准备不足，或资源使用不当。
- 应用示范　学业建议：准备教材和固定学习时间，建立现实基础。
- 易错提醒　不是保证得财或一夜成功。

<a id="baseline-p02"></a>
### p02 星币二 / Two of Pentacles · Word基线

[当前脚本](#card-p02)

- 核心词　协调、弹性、取舍
- 完整意思　在多个现实任务之间分配时间和精力，保持动态平衡。
- 画面助记　人物持两星币，带状线相连，身后船只随波起伏。
- 逆位方向　安排过量、失去平衡，或不能再同时兼顾。
- 应用示范　工作建议：列出必须做的事，调整先后次序和投入比例。
- 易错提醒　灵活协调不等于永远可以两全。

<a id="baseline-p03"></a>
### p03 星币三 / Three of Pentacles · Word基线

[当前脚本](#card-p03)

- 核心词　合作、技艺、共同标准
- 完整意思　不同角色把能力汇集起来，依照共同目标完成实际工作。
- 画面助记　工匠与两人围绕建筑交流，其中一人持图纸，支持协作的主题。
- 逆位方向　分工失调、标准不一，或能力未被尊重。
- 应用示范　学业建议：请他人针对作品提出具体反馈，再共同改进。
- 易错提醒　多人出现不代表配合已完美无缺。

<a id="baseline-p04"></a>
### p04 星币四 / Four of Pentacles · Word基线

[当前脚本](#card-p04)

- 核心词　守成、控制、安全感
- 完整意思　通过抓紧已有资源维持稳定，也可能因此限制流动。
- 画面助记　人物抱住星币、脚踩星币、头顶星币，呈现抓紧不放。
- 逆位方向　过度抓紧资源的状态开始松动，学习调整控制与分享。
- 应用示范　生活建议：先留好必要预算，再决定可自由使用的部分。
- 易错提醒　节制资源与控制他人不是一回事。

<a id="baseline-p05"></a>
### p05 星币五 / Five of Pentacles · Word基线

[当前脚本](#card-p05)

- 核心词　匮乏、困难、缺少支持
- 完整意思　现实资源或支持不足，处境令人感到被排除和难以应对。
- 画面助记　雪地中的两人经过亮着的窗，突出困难与支持的距离。
- 逆位方向　开始接受实际帮助，资源与支持不足的处境逐步改善。
- 应用示范　工作建议：先辨认迫切需求，再寻找可获得的实际支持。
- 易错提醒　不据此预测疾病或必然破产。

<a id="baseline-p06"></a>
### p06 星币六 / Six of Pentacles · Word基线

[当前脚本](#card-p06)

- 核心词　给予、接受、资源分配
- 完整意思　资源在给予者和接受者之间流动，伴随分配权与互惠问题。
- 画面助记　人物一手持秤一手给出钱币，两人接受援助，权力并不对等。
- 逆位方向　付出不均、援助附带条件，或过度给予而忽略自己。
- 应用示范　合作建议：说清提供什么、需要什么，以及各方是否能接受。
- 易错提醒　给予看似慷慨，也需要观察是否公平。

<a id="baseline-p07"></a>
### p07 星币七 / Seven of Pentacles · Word基线

[当前脚本](#card-p07)

- 核心词　评估、耐心、投入回报
- 完整意思　投入已有一段时间，现在停下来检查成果与下一步方向。
- 画面助记　人物靠着工具看着作物上的星币，重点是暂停并查看成果。
- 逆位方向　急于见效、投入无回报，或明知不合适仍继续消耗。
- 应用示范　学业建议：检验最近的学习效果，再决定保留或调整方法。
- 易错提醒　耐心不等于永远坚持无效投入。

<a id="baseline-p08"></a>
### p08 星币八 / Eight of Pentacles · Word基线

[当前脚本](#card-p08)

- 核心词　专注、精进、细致
- 完整意思　持续投入具体工作，通过反复练习与打磨提高技艺和质量。
- 画面助记　工匠正在雕刻星币，旁边已有成品；动作与作品支持练习和细节。
- 逆位方向　投入与质量之间失衡：可能练习无效，也可能过度打磨；按中级情境示范区分。
- 应用示范　学业建议：针对一个薄弱点练习，并对照标准检查质量。
- 易错提醒　忙碌本身不等于精进；画面未直接画出老师或反馈。

<a id="baseline-p09"></a>
### p09 星币九 / Nine of Pentacles · Word基线

[当前脚本](#card-p09)

- 核心词　独立、自律、享受成果
- 完整意思　凭长期积累维持自己的生活，能从容欣赏成果与品质。
- 画面助记　人物独立站在丰盛葡萄园中，戴手套的手上停着猎鹰，可助记成果与自我管理。
- 逆位方向　依赖外在条件、过度消费，或有成果却难以享受。
- 应用示范　生活建议：看见自己建立的能力，安排适度而可承担的享受。
- 易错提醒　独立不等于永远不需要别人。

<a id="baseline-p10"></a>
### p10 星币十 / Ten of Pentacles · Word基线

[当前脚本](#card-p10)

- 核心词　传承、长久积累、共同保障
- 完整意思　资源和经验形成较长期的结构，为家庭或共同体提供延续基础。
- 画面助记　长者、成人、孩子、犬与建筑同在画面，呈现代际和共同生活。
- 逆位方向　共同资源冲突、基础不稳，或传统安排不再适合。
- 应用示范　工作建议：把个人经验整理成能让团队持续使用的流程。
- 易错提醒　不等于一定继承财产或必然富有。

<a id="baseline-p11"></a>
### p11 星币侍从 / Page of Pentacles · Word基线

[当前脚本](#card-p11)

- 核心词　务实学习、机会、专心
- 完整意思　认真接触一项可落地的知识或计划，愿意从基础做起。
- 画面助记　侍从凝视手中的星币，脚下有土地，可记为专注现实对象。
- 逆位方向　计划不落地、学习分心，或急于成果而跳过基础。
- 应用示范　学业建议：从一个可练习的技能开始，做出第一份成果。
- 易错提醒　学习意愿尚不等于熟练掌握。

<a id="baseline-p12"></a>
### p12 星币骑士 / Knight of Pentacles · Word基线

[当前脚本](#card-p12)

- 核心词　可靠、耐心、执行
- 完整意思　按步骤持续完成任务，重视稳妥、责任与长期投入。
- 画面助记　静立的马、骑士手中的星币与耕地，可记为踏实推进。
- 逆位方向　停滞、过度保守，或机械执行而不检查目的。
- 应用示范　工作建议：把目标拆成可持续的日常行动并按时落实。
- 易错提醒　速度慢不自动意味着低效。

<a id="baseline-p13"></a>
### p13 星币王后 / Queen of Pentacles · Word基线

[当前脚本](#card-p13)

- 核心词　照顾、务实、资源管理
- 完整意思　把关怀落实在生活条件与资源安排中，让日常运转得舒适稳定。
- 画面助记　王后在繁茂环境中捧着星币，帮助记住细致的现实照料。
- 逆位方向　照顾他人过度、忽略自己，或资源安排失衡。
- 应用示范　生活建议：照顾好作息、空间和预算，让计划有稳定支撑。
- 易错提醒　不限定母亲、女性或家庭主妇。

<a id="baseline-p14"></a>
### p14 星币国王 / King of Pentacles · Word基线

[当前脚本](#card-p14)

- 核心词　稳健、经营、成果
- 完整意思　成熟地管理现实资源，把能力转成可持续的成果与保障。
- 画面助记　国王持星币，周围有葡萄和城堡，可记为经营与积累的成果。
- 逆位方向　过度重视占有、僵化守成，或管理失去分寸。
- 应用示范　项目建议：核对资源、成本与维护条件，确保成果能持续。
- 易错提醒　不保证投资收益，也不等于现实中的富人。


<a id="implementation-v17"></a>
## R4 — 2026-09-16：完整实现与实际验证

**修改来源：**用户明确要求把当日讨论的全部学牌与抽牌方案开发、提交发布并提供手机入口，随后允许重组旧交互框架。此决定替代R1–R3的“只制作文档”范围限制，不改原Word教材，也不把未验证的教学效果改记为已验证。

**当前有效实现：**`tools/build_academy.py`从有效脚本生成20课、78张牌及646道题的离线内容；应用按初级8课、中级6课、高级6课组织。面向学习者的短标题独立于内部章节名。`academy.js`先展示讲解，再展示练习和逐项反馈；答错后进入对应补讲和新题；提示后答对记为辅助完成并安排回访，连续困难总结、保存并安排回访，最多两轮补学。无自评、必填感悟、语音或强制陌生牌对比。

- R02–R20、R37–R38：主链路、实际作答证据、正位首次学与逆位深化、自由选牌和随机新牌已接入。`check_academy_v2.cjs`遍历98单元正常、错误、补讲、回访和恢复；`check_i18n.cjs`检查全部显示内容。自动检查不能代替新人试学。
- R01、R03、R28、R40–R43：双语、固定牌图、离线、旧备份、保存与恢复均有浏览器检查。`journey.academy`使用原存储键；旧自评只保留原记录，不重新算成正确答案。
- 20课有具体教学示意，逐牌有对应观察和含义提示；可暂停、重播、跳过或静态查看。B02演示洗切流程，A05/A06使用对应牌位布局。
- R21–R36抽牌要求由[抽牌主文档](READING_MASTER.md#implementation-v17)维护实际覆盖，避免重复规则互相矛盾。

内容版本为`LM-1.0-R3.2`，另存源文档hash。以后变更题意或评分判据，须升级内容版本，不把旧答案按新题重算；变版保留历史证据并重开受影响会话。格式或交接更新不代表教学内容改版。

**状态：**已编写、已接入，自动路径与可达性检查通过；真人理解、延迟迁移、真实iPhone及独立教师逐题审查仍待验证。明显干扰项、补题迁移及高级案例多样性继续按试学修订。发布检查和线上证据见[1.7交付记录](RELEASE_1_7.md)。

<a id="implementation-v19"></a>
## R6 — 2026-09-24：中文学习主线与独立牌库

**修改来源：**用户要求本期隐藏英文入口，优先让中文新人能把每一张牌学会、学懂；课程页不能再被78张牌的长列表占满，牌库应成为独立入口。运行走查同时发现，逐牌T1虽然已有完整稿件，页面实际只显示一句提示，随后直接进入Q1。这一缺口会让“先讲后练”只存在于数据里。

**本版行为：**公共界面固定显示中文；课程页只组织初级、中级、高级、续学与复习，独立“牌库”页承担78张牌的搜索、筛选、正逆位资料和进入逐牌学习。每张牌的第一次学习先显示牌图、核心意思、画面线索和记忆线索，再进入题目；Q1/Q2答错回到相应讲解，Q4整牌理解答错先重看整牌总结，逆位保持独立学习和回访。学牌界面没有播放、重播、看动效或跳过动效等额外控制。

**自动覆盖：**`check_learning_focus_v19.cjs`与学院/i18n回归遍历98个单元的正常、答错、补讲、恢复和完成路径，并核对78张牌的T1讲解、正逆位详情及320px首屏；课程、牌库与旧记录仍使用稳定ID和原存储结构。`check_learning_distractors_v19.cjs`另外核对381个审定目标全部仍是错误项、最终中英文选项及反馈与审定表一致、反馈确实已更新、20个高风险题已写回，且这些目标不再含硬性或软性答案提示。它同时遍历所有题目的反馈，拦截旧的批量答案包装及只说“答案不对”的空反馈。总题量和题库存在不能证明学习效果，浏览器遍历也不能替代新人试学、延迟回忆、独立塔罗教师逐题审稿或真实手机大字号验收。最终构建、CI、合并与上线证据只在[1.9交付记录](RELEASE_1_9.md)完成后登记。
