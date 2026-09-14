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
npx playwright install chromium webkit
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
| `curriculum-content.js`, `journey.js`, `journey.css` | 78 card plans, per-skill SM-2, saved lessons and mobile learning / 78 牌课程、分能力复习、续学与学习 UI |
| `offline.js`, `sw.js`, `update.html`, `manifest.webmanifest` | Explicit offline preparation, atomic cache and installation / 离线下载、完整缓存与安装 |
| `app.js` | Navigation, quick practice, card library, backup integration / 导航、快练、牌库与备份整合 |
| `learning.js` | Lesson interactions, scoring, recall, progress / 单元交互、评分、回忆与进度 |
| `reading.js` | Spread selection, shuffle, draw, position guidance, history / 选阵、洗牌、抽牌、牌位引导与历史 |
| `content.js` | Original teaching-card metadata and 24 quick questions / 原有教学牌资料与 24 道快练 |
| `learning-content.js` | Four original units: 32 steps / 四个原有单元，共 32 步 |
| `spread-content.js` | 24 reading definitions including daily, and four contextual units: 24 steps / 含日签共 24 个抽牌定义，以及四个情境单元 24 步 |
| `reading-deck.js` | Basic reference content for 78 cards and three topics / 78 张牌与三个主题的基础参考 |
| `i18n.js` | Display-text and accessibility translation; keeps business IDs and stored values / 显示文字与无障碍翻译，保留业务 ID 和存档值 |
| `locales/en-deck.json`, `locales/en-lessons.json`, `locales/en-ui.json` | Editable English translations / 可编辑的英文翻译源 |
| `locales/en.js` | Generated locale bundle; do not edit by hand / 生成的语言包，不直接修改 |
| `design-tokens.css` | Shared palette, typography, surfaces, motion and card-back roles / 共用配色、字体、表面、动效与牌背角色 |
| `styles.css`, `learning.css`, `reading.css` | Shared, learning, and reading presentation / 公共、学习与抽牌样式 |
| `assets/design/card-back.svg` | Authored geometric card back; separate from historical faces / 新设计的几何牌背，与历史正面分别处理 |
| `docs/design/README.md`, `.impeccable.md` | Adapted design contract and product context / 适配后的设计规范与产品背景 |
| `assets/cards/` | The 78 local WebP card images / 78 张本地 WebP 牌图 |
| `assets/manifest.json` | Card identity, sources, dimensions, and hashes / 牌图身份、来源、尺寸与哈希 |
| `tools/build_demo.py` | Standalone HTML builder / 独立 HTML 打包器 |
| `tools/verify_assets.py` | Asset integrity and provenance checks / 素材完整性与来源检查 |
| `tools/check_card_back.cjs` | Card-back palette, half-turn geometry and small-size rendering checks / 牌背配色、半周旋转几何与小尺寸渲染检查 |
| `tools/check_design.cjs` | Design, focus, skip, reduced-motion and saved-result checks / 设计、专注、跳过、减少动态与结果保留检查 |
| `tools/capture_gallery.cjs` | Isolated screenshots and hero image from the built demo / 从构建 Demo 生成隔离截图与展示封面 |

Edit the source files, then rebuild. Do not hand-edit the generated `demo/tarot-demo.html`; a later build will replace it. Keep both languages aligned when changing interface text, lessons, feedback, or accessibility labels. Follow the actual localization files loaded by `index.html`.

修改源文件后重新打包，不要直接修改生成的 `demo/tarot-demo.html`，否则下次构建会覆盖。改动界面、课程、反馈或无障碍标签时同步两种语言；本地化入口以 `index.html` 实际加载的文件为准。

## Checks · 验证

```sh
npm run build
npm test
```

`npm test` starts its own server on an available local port and runs the checks sequentially. It does not require the preview server on port 8765.

`npm test` 会自行在可用本机端口启动服务，并顺序执行检查，不依赖 8765 端口的预览服务。

The asset check verifies 78 stable IDs, decoded files, dimensions, checksums, source evidence, and visual-review records. Browser checks cover quick practice, lesson feedback, recall, interrupted sessions, all 23 scenario spreads and daily tarot, full-deck draws, backup round trips, responsive layouts, and the offline bundle. Language changes also need language-specific validation and visual inspection.

素材检查核验 78 个稳定 ID、图片解码、尺寸、哈希、来源与视觉核查记录。浏览器检查覆盖快练、课程反馈、回忆、断点续学、23 种场景牌阵与日运、完整牌组抽取、备份往返、响应式布局与离线包。语言变更还要检查对应语言的交互与实际显示。

The full check also validates the shared card back and the design integration: semantic palette and text contrast, responsive Chinese/English views, focused draw exit, skipped animation preserving the shuffled pool, rapid reveal, language/resume stability, reduced-motion reveal and opaque contrast fallback. These checks supplement the existing learning and backup suite rather than replace it.

完整检查还覆盖统一牌背和设计适配：语义配色与文字对比度、中英响应式视图、专注抽牌退出、跳过动画时保留牌序、快速翻牌、切语言与恢复、减少动态翻牌及实体对比度回退。这些检查补充原有学习与备份检查，不替代它们。

For a narrow change, run the corresponding check exposed by the repository tooling, then the required pre-release checks. Preserve assertions. If a test cannot run, report the command, the observed failure, and the unverified behavior instead of describing the release as passed.

小改动先运行相关检查，发布前再运行必要的完整检查。保留测试断言；无法运行时记录命令、实际失败及未验证的行为，不能把它描述为通过。

Desktop browser tests do not establish iPhone support, persistence after phone reboot, or 30-day offline reliability. These remain separate device acceptance tasks.

桌面浏览器测试不等于 iPhone 验收，也不能证明手机重启或断网 30 天后仍然可靠；这些需要独立实机检查。

## Reuse the visual system · 复用视觉规范

Read [the adapted design contract](design/README.md) before changing visual roles. The original brief and PNGs under `docs/design/handoff/` are supplied concepts, not instructions to replace the practice homepage with a journal or change language and draw rules. Use semantic tokens; plum selection must remain distinguishable from green success and red error feedback. Keep reading surfaces opaque, glass sparse, verified card faces complete, and all card backs identical.

修改视觉角色前先读[项目适配规范](design/README.md)。`docs/design/handoff/` 中原说明和 PNG 是用户提供的概念，不授权把练习首页替换为手记或改变语言与抽牌规则。使用语义令牌，梅紫选中须区别于成功绿和错误红；阅读区不透明，玻璃少量使用，历史牌面完整，所有牌背一致。

Regenerate the gallery from the current build with:

从当前构建重新生成展示图：

```sh
npm run build
node tools/capture_gallery.cjs
```

By default, the capture tool opens the built local `demo/tarot-demo.html` file in an isolated browser context; it does not depend on an old localhost server or personal browser records. `DEMO_URL` can explicitly select another preview. The script writes actual interface screenshots and a composed hero image under `docs/images/`. Rebuild afterward if the modular website should include the refreshed social-preview image.

截图工具默认在隔离浏览器中打开构建好的本地 `demo/tarot-demo.html`，不依赖旧 localhost 服务或个人浏览器记录；可用 `DEMO_URL` 显式选择其他预览。脚本在 `docs/images/` 输出真实界面截图与组合封面；如需网页发行目录采用新分享封面，随后再构建一次。

Inspect the resulting images in both language contexts as appropriate. Screenshot generation proves neither motion quality nor real-device acceptance; preserve separate interaction checks and note their actual results.

按改动范围检查两种语言的实际显示。生成截图不代表动效质量或实机验收通过；保留独立交互检查并记录实际结果。

## Compatibility is part of the feature · 兼容性也是功能

Keep card IDs, spread IDs, question IDs, and learning-step IDs stable unless an explicit migration is included. Translate display text rather than changing those IDs.

卡牌、牌阵、题目、学习步骤的 ID 应保持稳定；必须变更时提供明确迁移。翻译显示文字，不要翻译底层 ID。

Existing browser storage keys:

| Key | State |
| --- | --- |
| `tarot-pocket-demo-v1` | Quick practice, saved cards, optional journey memory and paused sessions / 快练、收藏、连续学习与暂停进度 |
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

The build discovers scripts/styles from `index.html` and translations from `locales/en-*.json`. `check_journey.cjs` checks memory semantics and continuity; `check_offline.cjs` tests versioned PWA caches in Chromium and WebKit. / 构建从 index 与语言目录发现资源，新增连续学习与双引擎 PWA 检查。

The upgrade regression builds the actual `v1.0.0` tag. Fetch tags/history before running it in a shallow clone (`git fetch --unshallow --tags` when appropriate); CI uses `fetch-depth: 0`. `check_ui_v11.cjs` covers choice/reference continuity, and `check_ritual_ui.cjs` measures actual timed transforms. Both are included in `npm test`.

升级回归会构建真实 v1.0.0 标签；浅克隆须先取回历史与标签。CI 使用完整历史；完整测试包含资料连续性及实际动画变换检查。
