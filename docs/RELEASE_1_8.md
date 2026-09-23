# Tarot Pocket 1.8.0 — 公开进入、本地优先与移动端压缩

更新：2026-09-23。本文区分源码实现、本地检查、Git合并、服务器部署与真实手机验收；只有对应证据完成后才更新状态。

## 本版目标

- 用户打开地址即可学牌、抽牌，不经过邀请码。
- 揭牌先在本机按真实牌阵、牌位、牌面和正逆位生成完整参考；问题可选。
- 只有点击“请 AI 深度解析”才创建短期匿名会话并发送本次问题与牌面。
- 压缩手机首屏和牌扇，增加逐牌整牌理解题及默认收起的完整牌义。
- 用第一方匿名事件查看PV、UV、阅读/学习漏斗和AI健康；不采集问题、牌面或学习记录。
- 主站迁到 `https://tarot.georgelu.cn/`；旧GitHub Pages入口保留参数后跳转。

## 实现范围

| 领域 | 当前实现 | 验证 |
|---|---|---|
| 公开入口 | 前端无门禁；AI按钮按需申请会话；服务端保留旧邀请码请求兼容 | access、reading-connect、server |
| 本地解读 | 32个当前/兼容牌阵；中英双语；有题、预设题和无题；Yes/No、二择一、关系、凯尔特等独立整合 | offline-reading 全目录确定性检查 |
| 移动体验 | 390px首页首屏出现两项主入口；目录首张牌阵提前；牌扇首屏约10–11张且78张可达 | Chromium/WebKit 320/390px检查 |
| 学牌深度 | 78张各1道整牌理解题；逐牌资料含画面、核心、正逆位、三类情境和边界；总题量724 | academy模型和双语浏览器遍历 |
| 统计后台 | 同源匿名事件、月轮换哈希、90天保留、管理令牌；PV/UV、漏斗、AI成功率/时延 | telemetry SQLite检查；`/admin.html` |
| 部署 | Caddy同源静态页与API、Docker Compose、数据卷、HTTPS及回滚说明 | [服务器说明](SERVER_DEPLOY.md) |
| 跨端 | 业务数据与平台壳分层；记录Taro微信壳和Capacitor iOS验证路径 | [跨端说明](CROSS_PLATFORM.md) |

## 隐私与兼容

三种既有业务存储键和JSON备份保持兼容。匿名统计只接受固定事件名和有限枚举属性，不接收自由文本、卡牌ID、解读正文或学习记录；全局隐私控制和Do Not Track会关闭上报。管理员令牌与供应商密钥只放在服务器环境变量。

## 发布验收

- [x] 完整本地 `npm test`（2026-09-23；构建 `1.8.0-d6aa2d0598f17ed3`；Chromium/WebKit、中英文、320/390px、真实v1.0升级、121项离线资源）
- [x] [PR #23](https://github.com/georgelu-creator/tarot-pocket/pull/23) 合并为 `82441b7f8fb08f0c095c8f142305b2c535aba9af`；PR检查与[主分支完整检查及Pages部署](https://github.com/georgelu-creator/tarot-pocket/actions/runs/35858627557)成功
- [x] `tarot.georgelu.cn` HTTPS、公开首页、本地解读、按需会话与管理后台；服务器当前版本 `/opt/tarot-pocket/releases/82441b7`
- [x] GitHub Pages主页及 `update.html` 跳转到正式域名，保留语言和片段参数并移除旧版本参数
- [ ] 真实iPhone Safari与微信内置浏览器试用
- [x] 一组固定虚构问题的真实DeepSeek复测；回答先给倾向再说明牌位依据，约17秒完成。该单例不代表全部场景或长期质量

## 线上证据（2026-09-23）

- 正式入口：<https://tarot.georgelu.cn/?lang=zh>；HTTPS首页与 `/api/health` 返回200，构建指纹为 `1.8.0-d6aa2d0598f17ed3`。
- 生产服务只在 `127.0.0.1:8787` 监听，由Caddy同源代理；公开会话返回200，合法匿名事件返回204，未授权管理请求返回401。管理员令牌未写入仓库或输出。
- 390×844 Chromium公网流程完成Yes/No牌阵、78张可达、离线整组解读与可选AI入口；没有浏览器错误。这是手机尺寸自动化检查，不是实机验收。
- 一个不含个人信息的虚构问题完成真实DeepSeek调用；生产统计随后为AI总数1、成功率100%、平均5872毫秒。样本量只有1，不能外推整体准确性。
- [v1.8.0发布页](https://github.com/georgelu-creator/tarot-pocket/releases/tag/v1.8.0)包含独立离线HTML与SHA-256校验文件；重新下载后校验通过。
- 旧GitHub Pages与新域名是不同来源，浏览器不能自动搬运旧域名的本地进度；需要时使用JSON导出与导入。

自动浏览器检查不能替代真实手机、真人学习效果或长期模型质量。上线后在本节记录真实提交、Actions、域名响应与仍未验证项。
