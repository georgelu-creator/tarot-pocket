# Development · 开发指南

[English README](../README.md) · [中文首页](../README.zh-CN.md) · [Handoff / 接力](HANDOFF.md)

## Setup · 准备环境

Use Python 3.10+ and Node.js 22+. Python 3.12 and Node.js 24 LTS are the target development versions. Install dependencies from the repository files instead of relying on packages bundled with a particular editor.

使用 Python 3.10+、Node.js 22+；目标开发版本为 Python 3.12 与 Node.js 24 LTS。依赖以仓库文件为准，不依赖某台电脑或编辑器自带的运行环境。

```sh
git clone https://github.com/georgelu-creator/tarot-pocket.git
cd tarot-pocket
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
npm ci
npx playwright install chromium
npm run build
npm run serve
```

On Windows PowerShell, activate the environment with `.venv\Scripts\Activate.ps1` instead of `source .venv/bin/activate`. Open [http://127.0.0.1:8765/demo/tarot-demo.html](http://127.0.0.1:8765/demo/tarot-demo.html). Stop the preview server with Ctrl+C when finished.

Windows PowerShell 使用 `.venv\Scripts\Activate.ps1` 激活环境。打开上述本地地址；结束预览后按 Ctrl+C 停止服务器。

The localhost address belongs to the computer running the server. It is not a phone-sharing URL. Use the published demo for a first mobile trial, and verify local-file support on the actual phone before relying on the offline edition.

localhost 只指运行服务的当前电脑，不能拿这个地址让手机访问。手机初次体验可使用公开演示，离线文件能否使用仍需要实机验证。

## Where to make a change · 从哪里修改

| File / 文件 | Responsibility / 职责 |
| --- | --- |
| `index.html` | Source page and script order / 源页面与脚本加载顺序 |
| `app.js` | Navigation, quick practice, card library, backup integration / 导航、快练、牌库与备份整合 |
| `learning.js` | Lesson interactions, scoring, recall, progress / 单元交互、评分、回忆与进度 |
| `reading.js` | Spread selection, shuffle, draw, position guidance, history / 选阵、洗牌、抽牌、牌位引导与历史 |
| `content.js` | Original teaching-card metadata and 24 quick questions / 原有教学牌资料与 24 道快练 |
| `learning-content.js` | Four original units: 32 steps / 四个原有单元，共 32 步 |
| `spread-content.js` | Eight spread guides and four contextual units: 24 steps / 八阵指南与四个情境单元，共 24 步 |
| `reading-deck.js` | Basic reference content for 78 cards and three topics / 78 张牌与三个主题的基础参考 |
| `i18n.js` | Display-text and accessibility translation; keeps business IDs and stored values / 显示文字与无障碍翻译，保留业务 ID 和存档值 |
| `locales/en-deck.json`, `locales/en-lessons.json`, `locales/en-ui.json` | Editable English translations / 可编辑的英文翻译源 |
| `locales/en.js` | Generated locale bundle; do not edit by hand / 生成的语言包，不直接修改 |
| `styles.css`, `learning.css`, `reading.css` | Shared, learning, and reading presentation / 公共、学习与抽牌样式 |
| `assets/cards/` | The 78 local WebP card images / 78 张本地 WebP 牌图 |
| `assets/manifest.json` | Card identity, sources, dimensions, and hashes / 牌图身份、来源、尺寸与哈希 |
| `tools/build_demo.py` | Standalone HTML builder / 独立 HTML 打包器 |
| `tools/verify_assets.py` | Asset integrity and provenance checks / 素材完整性与来源检查 |

Edit the source files, then rebuild. Do not hand-edit the generated `demo/tarot-demo.html`; a later build will replace it. Keep both languages aligned when changing interface text, lessons, feedback, or accessibility labels. Follow the actual localization files loaded by `index.html`.

修改源文件后重新打包，不要直接修改生成的 `demo/tarot-demo.html`，否则下次构建会覆盖。改动界面、课程、反馈或无障碍标签时同步两种语言；本地化入口以 `index.html` 实际加载的文件为准。

## Checks · 验证

```sh
npm run build
npm test
```

`npm test` starts its own server on an available local port and runs the checks sequentially. It does not require the preview server on port 8765.

`npm test` 会自行在可用本机端口启动服务，并顺序执行检查，不依赖 8765 端口的预览服务。

The asset check verifies 78 stable IDs, decoded files, dimensions, checksums, source evidence, and visual-review records. Browser checks cover quick practice, lesson feedback, recall, interrupted sessions, all eight spreads, full-deck draws, backup round trips, responsive layouts, and the offline bundle. Language changes also need language-specific validation and visual inspection.

素材检查核验 78 个稳定 ID、图片解码、尺寸、哈希、来源与视觉核查记录。浏览器检查覆盖快练、课程反馈、回忆、断点续学、八种牌阵、完整牌组抽取、备份往返、响应式布局与离线包。语言变更还要检查对应语言的交互与实际显示。

For a narrow change, run the corresponding check exposed by the repository tooling, then the required pre-release checks. Preserve assertions. If a test cannot run, report the command, the observed failure, and the unverified behavior instead of describing the release as passed.

小改动先运行相关检查，发布前再运行必要的完整检查。保留测试断言；无法运行时记录命令、实际失败及未验证的行为，不能把它描述为通过。

Desktop browser tests do not establish iPhone support, persistence after phone reboot, or 30-day offline reliability. These remain separate device acceptance tasks.

桌面浏览器测试不等于 iPhone 验收，也不能证明手机重启或断网 30 天后仍然可靠；这些需要独立实机检查。

## Compatibility is part of the feature · 兼容性也是功能

Keep card IDs, spread IDs, question IDs, and learning-step IDs stable unless an explicit migration is included. Translate display text rather than changing those IDs.

卡牌、牌阵、题目、学习步骤的 ID 应保持稳定；必须变更时提供明确迁移。翻译显示文字，不要翻译底层 ID。

Existing browser storage keys:

| Key | State |
| --- | --- |
| `tarot-pocket-demo-v1` | Quick practice, saved cards, schedules / 快练、收藏与演示调度 |
| `tarot-learning-units-v2` | Learning sessions and history / 学习单元与作答历史 |
| `tarot-reading-v3` | Reading setup, current table, saved readings, spread practice / 抽牌设置、当前牌桌、历史与牌阵练习 |

The exported backup identifies itself as `app: "tarot-pocket-demo"`, `version: 1`. Preserve compatibility with old backups. An older backup without learning or reading sections must not erase the newer sections already on the device. Validate imported sections before applying any change, and keep the user's confirmation step.

导出备份沿用 `app: "tarot-pocket-demo"`、`version: 1`。旧备份缺少学习或抽牌字段时，不应清空本机已有的新字段记录；所有导入部分先校验，再统一应用，并保留用户确认。

Changing a hostname, port, browser, or file location can create a different storage context. A successful Git pull does not migrate browser data. See [Handoff](HANDOFF.md) for the separate backup procedure.

换域名、端口、浏览器或文件位置，可能进入另一份存储空间。Git 拉取成功不代表进度迁移成功，具体步骤见[接力说明](HANDOFF.md)。

## Content and assets · 内容与牌图

A question needs a concrete context, a defensible answer, plausible distractors, and feedback explaining why. If two interpretations are equally supportable, refine the prompt or offer an information-insufficient route; do not manufacture difficulty with ambiguity.

一道题需要具体背景、有依据的答案、有吸引力的干扰项，以及说明差异的反馈。若两种解释同样成立，应补充题目条件或允许“信息不足”，不要靠歧义增加难度。

Use the existing historical deck. Asset replacements require the source page, edition identity, rights statement, checksum changes, and a visible comparison. `tools/prepare_assets.py` is a maintainer tool for preparing assets, not a runtime dependency or a step every learner must execute. See [asset sources](../assets/SOURCES.md).

沿用现有历史牌组。换图需提供来源页、版本身份、权利声明、哈希变化与视觉对照。`tools/prepare_assets.py` 供维护者准备素材使用，不是运行时依赖，也不要求每位学习者执行。详见[素材来源](../assets/SOURCES.md)。

## Before a release · 发布前

Verify the source and built artifact separately. Update [CHANGELOG](../CHANGELOG.md), [ROADMAP](ROADMAP.md), and the current status in [HANDOFF](HANDOFF.md). Use clean demo data for screenshots. Confirm the public demo and downloadable file actually load, and keep local validation, CI, release assets, Pages deployment, and real-device acceptance as distinct evidence.

分别核验源码与构建产物。更新版本记录、路线图与接力状态，截图使用干净演示数据。确认公开演示和下载文件实际能打开；本地验证、CI、Release 附件、Pages 部署与实机验收分别记录。

Do not commit browser backups, reading histories, credentials, private workspace paths, or personal assistant memory. Code and documentation in this repository are sufficient to resume project work; they do not configure an external assistant's long-term memory.

不要提交浏览器备份、私人抽牌记录、凭据、个人工作区路径或私人助理记忆。本仓库支持恢复项目工作，不代表已经配置外部助理的长期记忆。
