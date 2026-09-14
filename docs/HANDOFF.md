# Continue on another computer · 跨电脑接力

[English README](../README.md) · [中文首页](../README.zh-CN.md) · [Development / 开发](DEVELOPMENT.md)

## Current project card · 当前项目接力卡

| Field / 字段 | Baseline / 当前基线 |
| --- | --- |
| Project / 项目 | Tarot Pocket · 塔罗随身学 |
| Canonical repository / 正式仓库 | [georgelu-creator/tarot-pocket](https://github.com/georgelu-creator/tarot-pocket) |
| Release target / 发布版本 | v1.1.0 choice and ritual / 自主学牌与仪式牌桌 |
| Goal / 目标 | Help learners remember cards and understand spreads through image-based, low-typing practice / 用牌图与少输入交互，帮助记牌并理解牌阵 |
| Product stage / 阶段 | Installable mobile website; native app not included / 可安装手机网页，未包含原生 App |
| Source baseline / 源码能力 | 78 variable seven-stage courses, 56 further steps, 23 scenario spreads + daily tarot / 78 套七步变式课、56 步进阶、23 场景牌阵与日运 |
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
