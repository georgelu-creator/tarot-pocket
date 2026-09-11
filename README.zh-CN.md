# Tarot Pocket · 塔罗随身学

**看到一张牌，记得它；读懂一张牌，知道为什么。**

一个以真实牌图为起点的双语塔罗学习空间。用点击完成回忆、辨析、找依据和解牌，把完整 78 张牌与当前课程装进一份离线 HTML，带在身边。

[**开始体验 →**](https://georgelu-creator.github.io/tarot-pocket/?lang=zh) · [**下载离线版**](https://github.com/georgelu-creator/tarot-pocket/releases/download/v0.4.0/tarot-pocket-v0.4.0.html) · [English](README.md) · [后续计划](docs/ROADMAP.md)

![Tarot Pocket：练习、记住，再亲自解牌](docs/images/hero.png)

![预览版](https://img.shields.io/badge/status-v0.4.0_preview-60465C)
![双语](https://img.shields.io/badge/languages-English_%2F_简体中文-60465C)
[![代码许可](https://img.shields.io/badge/code-MIT-60465C)](LICENSE)
[![内容许可](https://img.shields.io/badge/content-CC_BY--SA_4.0-60465C)](CONTENT_LICENSE.md)

v0.4.0 预览版采用暖白与梅紫、安静的阅读表面和统一天体牌背，抽牌进入专注视图，动效可以跳过。练习优先的学习过程保持完整。[双语设计规范](docs/design/README.md)记录可复用规则，并区分用户提供的静态概念与实际实现的组件。

## 让一张牌，真正留在记忆里

只背“星币四＝抓紧不放”，很容易忘。这里会带你看清人物的手与脚，先在脑中回忆，再分辨接近的解释，联系土元素与数字四，最后把同一张牌放进不同牌位。

你需要选择解释，也需要选择依据。答错会明确显示错误，并解释差异；静默回忆单独记录自评，自由解读不会被当作客观预测题评分。

建议先打开 **练习 → 星币四**。这套 12 步单元能体验最完整的学习过程。之后进入元素与数字实验室，拼出一段三牌解读，再换个情境回来检验自己是否还记得。

<img src="docs/images/practice.png" width="390" alt="练习：观察牌面、作出判断，再找到支持它的依据">

## 现在就能体验

| 体验 | 当前预览版 |
| --- | --- |
| 看真实牌图 | 同一套 Pam-A 历史 RWS 扫描，共 78 张；逐张保留来源与哈希 |
| 不止看图选名字 | 8 个单元、56 个学习环节，另有 24 道混合快练题 |
| 建立理解框架 | 元素、数字、图像证据、相似牌辨析、换牌位与逆位情境 |
| 学会用牌阵 | 8 种牌阵，学习用途、各位置的问题，并练习辨认牌位 |
| 换个问题再理解 | 感情、事业、学业三个主题，同牌换情境、换角色 |
| 没带实体牌也能抽 | 完整 78 张随机洗牌、无放回选牌、逐张翻牌，可选正逆位 |
| 随时暂停和回来 | 本地进度、可续抽的牌桌、最近 40 组抽牌记录、JSON 导入导出 |
| 中英文切换 | 应用界面与学习内容均提供简体中文和英文 |

八种牌阵包括：**单牌聚焦、现状—阻碍—建议、过去—现在—趋势、二择一、关系觉察、行动路径、学习突破、凯尔特十字**。每个位置都有明确的问题。“学习突破”专用于学业；凯尔特十字采用本项目指南中标明的位置顺序。

<img src="docs/images/reading.png" width="390" alt="抽牌：先选问题和牌阵，亲自选牌，再逐个查看牌位">

## 为网络不稳定的旅途准备

下载的 HTML 包含应用、78 张牌图和当前全部双语学习内容。运行不需要账号、API Key、CDN、外部字体或图片服务器；重新构建也直接使用仓库中的本地素材。

1. 联网时下载 [`tarot-pocket-v0.4.0.html`](https://github.com/georgelu-creator/tarot-pocket/releases/download/v0.4.0/tarot-pocket-v0.4.0.html)。
2. 用能运行本地 HTML 与 JavaScript 的浏览器打开。
3. 在**实际要带出门的设备**上，打开陌生牌、完成一段学习，关闭后重新打开，确认内容与进度都能使用。
4. 换浏览器、换电脑或换网址前，在 **我的** 中导出备份。

**保存了网页文件，不等于保存了学习记录。** 进度存在浏览器里，不会写回 HTML 文件。本地文件的存储行为因浏览器而异，iPhone Safari 尚未完成实机验收。在线演示方便快速体验，目前还不是可安装的 PWA，也不能据此保证断网后可用。

## 这个版本做到哪一步

这是 **v0.4.0 alpha 体验版**。先确认这种学习方式是否好用，再扩展完整产品。

- 78 张牌均可查阅基础释义、参与实际抽牌。深入单牌课程目前以**星币四**为样本，并使用其他牌作对照；还没有 78 套同等深度的完整课程。
- 间隔复习使用明确标注的 **1 天／3 天演示规则**，不是 FSRS、SM-2 或经过验证的长期记忆模型。
- 课程和翻译仍需要独立编辑与塔罗教师审核。元素、数字是帮助理解的线索，不能机械套成每张牌的答案。
- 解读参考服务于反思与有依据的理解，不能确定未来事件或他人内心的真实想法。
- 当前没有账号、云同步、联网 AI 解牌、原生 App 或 App Store 版本。后续扩展以体验反馈为依据，详见[路线图](docs/ROADMAP.md)。

## 本地运行

准备 **Python 3.10+** 和 **Node.js 22+**。应用使用原生 HTML、CSS 和 JavaScript，Python 负责打包独立网页，Playwright 检查交互。

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

打开[本地 Demo](http://127.0.0.1:8765/demo/tarot-demo.html)。运行 `npm test` 执行项目检查。目录与开发流程见[开发指南](docs/DEVELOPMENT.md)，换电脑继续开发见[接力说明](docs/HANDOFF.md)。

## 一起来打磨下一堂课

最有帮助的反馈很具体：**哪张牌、哪个牌位、哪个选项，让你犹豫了，为什么？** 体验后可以[报告交互问题](https://github.com/georgelu-creator/tarot-pocket/issues/new?template=bug.yml)、[修订课程或翻译](https://github.com/georgelu-creator/tarot-pocket/issues/new?template=learning-content.yml)，也可以[提出功能建议](https://github.com/georgelu-creator/tarot-pocket/issues/new?template=feature.yml)。

欢迎学习者、塔罗教师、译者和无障碍体验者参与。提交 PR 前请阅读[贡献指南](CONTRIBUTING.md)，示例请使用虚构情境，不要公开私人抽牌记录。如果这种学习方式对你有帮助，欢迎点一颗 Star，让更多人发现它。

## 牌图与开源许可

牌图由 **Pamela Colman Smith** 绘制，使用历史 Rider–Waite–Smith **Pam-A** 版本的 [Wikimedia Commons TaionWC 扫描集合](https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC))。项目保留图片身份、来源、尺寸与哈希，不混入现代重绘或生成式替代图。

- **应用代码与工具：**[MIT](LICENSE)。
- **原创课程、翻译、文档与新设计牌背：**[CC BY-SA 4.0](CONTENT_LICENSE.md)。
- **历史牌图：**独立的[牌图权利说明](ARTWORK_LICENSE.md)、[来源说明](assets/SOURCES.md)和[逐牌清单](assets/manifest.json)。来源页标注公共领域；这与代码、课程的许可分别处理。

Tarot Pocket 是独立学习项目。[版本记录](CHANGELOG.md) · [安全问题](SECURITY.md) · [社区约定](CODE_OF_CONDUCT.md)
