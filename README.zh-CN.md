# 秘境梦屿

**从零开始学塔罗，也可以带着问题来抽牌。**

[**手机体验 →**](https://tarot.georgelu.cn/) · [**离线版**](https://github.com/georgelu-creator/tarot-pocket/releases) · [English project notes](README.md)

## 继续当前工作

1. 先读[接力说明](docs/HANDOFF.md)的当前检查点、已验证工作、阻塞和下一步。
2. 学牌相关改动再读[教学主文档](docs/LEARNING_MASTER.md)，抽牌相关改动读[抽牌主文档](docs/READING_MASTER.md)的当前状态、有效要求和最新变更；同时涉及两者时都读。
3. 开发与检查方式见[开发指南](docs/DEVELOPMENT.md)。网页部署、小程序上传／审核／正式发布、真机验收分别看对应证据。

本页是项目介绍。版本交付文档保留当时的实现与验证范围，不据此认定当前线上或小程序版本；1.9 的过程见[历史实现记录](docs/RELEASE_1_9.md)。

![秘境梦屿](docs/images/hero.png)

## 一步步学会读牌

进入学牌就能开始当前一课：第一次从星币八入门，读一小段核心讲解，再做一道练习。下一课由系统安排，基础方法在具体牌之后穿插；中断后继续上次的位置，并结合到期复习巩固学过的内容。

三个阶段都覆盖78张牌，逐步练习画面与核心、正逆位情境、辨析与迁移。想换课程时，再进入“选择其他课程”查看分级目录。每步牌图对应当前讲解或题目；画面记忆线索和补充例子按需展开，独立牌库负责全文查询。答错后说明依据并换用已编写的变式，不要求自评、感悟或语音。
<img src="docs/images/courses-v17-zh.png" width="290" alt="初中高级课程目录"><img src="docs/images/practice-v17-zh.png" width="290" alt="先讲解再练习的单牌课程">

## 逐张查阅完整资料

牌库每张牌都包含画面与象征、正逆位详解、不同逆位的识别条件、感情/工作/资源/学业/生活应用、相近牌区别和虚构情境实例。较长章节按需展开；传统出处单独列出，区分早期RWS说法与现代原创解释。课程在画面、正位、逆位与综合辨析步骤各选取一小段相关讲解，不把整篇参考资料当成必读任务。

## 直接找到想问的事情

40个场景按常用、感情、工作、学业、生活和专业通用平铺。单牌、自由三张在前，也有Yes/No、二选一、三选一、感情发展、复合、求职与考试。每个入口说明适合问什么、会回答什么；介绍页直接列出完整牌阵及所有牌位，不用逐个点开。

预设问题可以直接使用，想问得更具体再补充。洗牌、切牌、选牌与揭牌分步完成，保留动态仪式。78张牌背可以滑动到达、缩放；轻点先预览牌背，确定后入位，也可以换一张。默认包含逆位，再手动揭牌。

<img src="docs/images/reading-v17-zh.png" width="290" alt="场景化抽牌目录"><img src="docs/images/reading-guide-v17-zh.png" width="290" alt="完整用途与全部牌位说明"><img src="docs/images/ritual-select-v17-zh.png" width="290" alt="手机扇形滑动选牌">

揭牌后先在本机围绕这次的问题、牌阵、牌位和正逆位给出完整解读；Yes/No不按正逆位机械投票，自由三张也不暗设时间线或建议牌。需要更深入时，再由用户明确点击联网AI入口。等待可以取消，重试保留原牌；修改问题后，迟到的旧回答不会覆盖新问题。

仅当前牌局的回答保存在本机，开始新牌局会替换，不保存抽牌历史。查看单牌、牌阵说明或返回时保留阅读位置。没有网络时仍可抽牌、看参考与已保存的回答；离线参考不会冒充AI答案。

## 用已经抽到的牌解读

在抽牌页点击“已经有牌了？手动解牌”，选择牌阵，再按顺序录入牌和正逆位。支持单牌、自由三张/五张及已有基础牌阵；先看本地解读，想深入时再主动请求AI，也能打开单牌完整资料。提交前保留原牌局，提交后替换当前牌局，当天日运和学习进度不受影响。

## 每天的一张牌

塔罗日运突出日期与星期，保留完整牌图、牌义与建议，增加与正逆位含义对应的“宜／忌”。同一天再打开还是原来那张牌，跨日清理旧日运；没有分享或签到任务。宜忌是牌义启发的日常提醒，不是传统黄历结论。

<img src="docs/images/daily-v17-zh.png" width="290" alt="带日期和宜忌的日签">

## 手机、中文与离线

- 托管网页公开进入，学习、抽牌和本地牌阵解读不需要账号或邀请码。供应商密钥始终留在服务端。
- 只有主动点击“请 AI 深度解析”才会建立短期匿名会话；连接失败不影响本地解读、牌面或问题。
- 在“记录 → 检查离线内容与安装”下载并校验完整内容，再通过Safari“添加到主屏幕”。断网前应在自己的手机测试一次。
- 本期公开界面只提供中文，避免未完成的英文内容干扰学习；底层稳定ID、学习进度和历史RWS牌图保持不变。
- 进度保存在当前浏览器。换设备前导出JSON；新版保留学习进度、当前牌局及当天日运；升级和旧备份导入会清理往期抽牌历史。更新时使用上面的手机入口，不必清空网站数据。

[当前进展与验证](docs/HANDOFF.md) · [教学主文档](docs/LEARNING_MASTER.md) · [抽牌主文档](docs/READING_MASTER.md) · [历史实现记录（2.0）](docs/RELEASE_2_0.md)

自动检查覆盖内容、状态恢复、中文界面、响应式和浏览器交互；尚不证明长期学习效果或真实手机在所有网络上的表现。独立教师审稿与新人试学仍需继续。

## 本地运行

准备 **Python 3.10+** 和 **Node.js 22+**。应用使用原生 HTML、CSS 和 JavaScript，Python 负责打包独立网页，Playwright 检查交互。

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

打开[本地 Demo](http://127.0.0.1:8765/demo/tarot-demo.html)。运行 `npm test` 执行项目检查。目录与开发流程见[开发指南](docs/DEVELOPMENT.md)，换电脑继续开发见[接力说明](docs/HANDOFF.md)。

## 一起来打磨下一堂课

最有帮助的反馈很具体：**哪张牌、哪个牌位、哪个选项，让你犹豫了，为什么？** 体验后可以[报告交互问题](https://github.com/georgelu-creator/tarot-pocket/issues/new?template=bug.yml)、[修订课程或翻译](https://github.com/georgelu-creator/tarot-pocket/issues/new?template=learning-content.yml)，也可以[提出功能建议](https://github.com/georgelu-creator/tarot-pocket/issues/new?template=feature.yml)。

欢迎学习者、塔罗教师、译者和无障碍体验者参与。提交 PR 前请阅读[贡献指南](CONTRIBUTING.md)，示例请使用虚构情境，不要公开私人抽牌记录。如果这种学习方式对你有帮助，欢迎点一颗 Star，让更多人发现它。

## 牌图与开源许可

牌图由 **Pamela Colman Smith** 绘制，使用历史 Rider–Waite–Smith **Pam-A** 版本的 [Wikimedia Commons TaionWC 扫描集合](https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC))。项目保留图片身份、来源、尺寸与哈希，不混入现代重绘或生成式替代图。

- **应用代码与工具：**[MIT](LICENSE)。
- **原创课程、翻译、文档与新设计牌背：**[CC BY-SA 4.0](CONTENT_LICENSE.md)。
- **历史牌图：**独立的[牌图权利说明](ARTWORK_LICENSE.md)、[来源说明](assets/SOURCES.md)和[逐牌清单](assets/manifest.json)。来源页标注公共领域；这与代码、课程的许可分别处理。

秘境梦屿是独立学习项目。[版本记录](CHANGELOG.md) · [安全问题](SECURITY.md) · [社区约定](CODE_OF_CONDUCT.md)
