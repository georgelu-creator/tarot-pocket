# Tarot Pocket 使用统计与管理页

更新：2026-09-23。当前实现是同源、第一方、隐私受限的轻量统计。生产数据是否已经产生，以服务器和管理页实测为准。

## 用户能看到什么

管理页地址为 `https://tarot.georgelu.cn/admin.html`。管理口令只保存在当前标签页的 `sessionStorage`，页面关闭后清除。近 30 天显示：

- PV、匿名 UV、事件总数与每日趋势；
- 查看牌阵→开始抽牌→完成揭牌→确认 AI 的用户漏斗；
- 学牌开始、答题、完成、展开牌义等功能事件；
- AI 调用数、成功率、失败数、平均耗时、P95 耗时和 HTTP 状态分布。

## 不收集什么

客户端白名单事件不得包含问题正文、选项、抽到的牌、正逆位、解读正文、学习答案、学习进度、邀请码、会话或模型密钥。服务端不把请求正文写入统计库。随机访客 ID 和标签页 ID 在服务端使用按月轮换的 HMAC 摘要；数据库只保留 90 天。浏览器开启 Global Privacy Control 或 Do Not Track 时不发送事件。

反向代理仍可能默认写访问 IP。生产配置必须关闭请求正文与认证头日志，并为访问日志设短保留期；应用“不存 IP”不能替代代理配置审查。

## 为什么先用 SQLite

成熟产品常用第一方事件、漏斗、留存和服务健康指标。Umami 提供自托管、无 Cookie、自定义事件和漏斗，是后续数据规模增长时的候选；其官方部署需要数据库和单独服务。当前腾讯轻量实例是 2 核 2GB，本项目事件量尚小，因此本轮用 Node 内置 SQLite，减少一个常驻 Postgres/分析服务，同时保留清楚的事件字典与导出边界。参考：[Umami 官方说明](https://docs.umami.is/docs/about)。

达到以下任一条件再评估 Umami 或托管分析：

- 需要跨月留存、渠道归因或多人权限；
- 单机 SQLite 写入或查询影响解读服务；
- 管理页需要按版本、端或来源做稳定细分；
- 需要独立备份、告警或多实例汇总。

## 事件字典

| 事件 | 触发 | 允许属性 |
|---|---|---|
| `page_view` | 页面可交互 | `lang` |
| `home_learn` / `home_read` | 首页进入学牌/抽牌 | 无 |
| `reading_category` | 切换抽牌分类 | `category` |
| `spread_open` | 打开牌阵详情 | `spread` |
| `reading_start` / `reading_pick` / `reading_reveal` | 开始、选牌、揭牌 | 仅受控阶段值 |
| `offline_reading_view` | 本地整组解读首次显示 | `spread`, `source=local` |
| `ai_confirm` / `ai_cancel` | 明确点击 AI 或取消等待 | 无 |
| `learning_start` / `learning_answer` / `learning_complete` | 学习闭环节点 | 不含题目或答案 |
| `dossier_open` | 展开牌义资料 | `source`，不含牌名 |

后端另记 `ai_backend_success` / `ai_backend_failure`、状态码和耗时；不含供应商错误正文。

## 运维与验收

- `TAROT_TELEMETRY_ENABLED=1` 才启用，数据库位置由 `TAROT_TELEMETRY_DB` 指定。
- `TAROT_ADMIN_TOKEN` 使用独立随机值，不复用 AI 签名密钥。
- 管理接口只接受 Bearer 口令、精确来源并返回 `Cache-Control: no-store`。
- GitHub Pages、localhost、离线 HTML 不发送统计；只有与 `analyticsEndpoint` 同源的正式站点发送。
- 用 `node tools/check_telemetry.cjs` 验证事件白名单、鉴权、聚合与AI指标；生产还需检查代理日志、90天清理、备份和管理页真机显示。
