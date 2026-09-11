# Continue on another computer · 跨电脑接力

[English README](../README.md) · [中文首页](../README.zh-CN.md) · [Development / 开发](DEVELOPMENT.md)

## Current project card · 当前项目接力卡

| Field / 字段 | Baseline / 当前基线 |
| --- | --- |
| Project / 项目 | Tarot Pocket · 塔罗随身学 |
| Canonical repository / 正式仓库 | [georgelu-creator/tarot-pocket](https://github.com/georgelu-creator/tarot-pocket) |
| Release target / 发布版本 | v0.4.0 preview / 预览版 |
| Goal / 目标 | Help learners remember cards and understand spreads through image-based, low-typing practice / 用牌图与少输入交互，帮助记牌并理解牌阵 |
| Product stage / 阶段 | Demo feedback before full curriculum or native app expansion / 先验证体验，再扩完整课程和原生 App |
| Source baseline / 源码能力 | 78 card images and basic references; 56 lesson steps; 24 quick questions; 8 spreads; 3 topics; English and Chinese / 78 张牌图与基础参考、56 步课程、24 道快练、8 阵、3 主题、中英文 |
| Deep-course coverage / 深课覆盖 | Four of Pentacles is the complete single-card sample; other cards support comparison / 星币四为完整单牌样本，其他牌参与对照 |
| Persistence / 保存 | Local browser state plus explicit JSON backups; no account or cloud sync / 本地浏览器记录与手动 JSON 备份，无账号或云同步 |
| Review scheduling / 复习 | Demonstration rule: 1 or 3 days; no production SRS / 1 天或 3 天演示规则，非正式记忆调度 |
| Device acceptance / 设备验收 | iPhone Safari and long-term phone offline use remain unverified / iPhone Safari 与手机长期离线仍待实机验证 |

The source baseline describes implemented features, not proof of a successful deployment. Use the repository's [Actions](https://github.com/georgelu-creator/tarot-pocket/actions), [Releases](https://github.com/georgelu-creator/tarot-pocket/releases), and actual [demo](https://georgelu-creator.github.io/tarot-pocket/) to check the state you receive. A pending job or an uploaded file is not a completed browser acceptance test.

源码能力不等于部署已成功。接手时分别查看 Actions、Releases 和实际演示；排队中的任务或已经上传的文件，不能代替浏览器验收。

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

**First, collect experience feedback.** Run the Four of Pentacles unit, switch languages, draw a three-card spread, and resume an interrupted session. Record specific friction rather than immediately expanding the product.

**先收集体验反馈。** 体验星币四单元、中英文切换、三牌抽取与中断续学，记录具体卡点，再决定是否扩展。

Current open work:

当前明确待办：

- Independent bilingual editing and tarot-teacher review, especially close distractors and interpretation boundaries. / 独立双语编辑与塔罗教师审核，重点看接近选项与解读边界。
- iPhone Safari acceptance: opening the chosen distribution, airplane mode, unfamiliar images, export/import, closing and reopening, and device restart. / iPhone Safari 实机检查：打开选定发行形式、飞行模式、陌生牌图、备份恢复、退出重开与设备重启。
- Broader deep-card courses, court-card practice, and varied return questions **after experience approval**. / **体验认可后**再扩展深入单牌课、宫廷牌训练和更多回访变式。
- A considered memory scheduler and an installable offline experience; neither is already implemented. / 进一步设计记忆调度与可安装的离线体验，这两项目前尚未实现。

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
