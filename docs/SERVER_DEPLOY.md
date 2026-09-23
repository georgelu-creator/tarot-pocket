# tarot.georgelu.cn 服务器部署

目标是同一来源提供网页、匿名统计和可选 AI：Caddy 托管 `dist/` 并自动申请 HTTPS，`/api/*` 反向代理到 Node 服务。GitHub Pages 继续作为发布镜像并跳到正式域名。

## 首次部署

1. 为 `tarot.georgelu.cn` 添加指向服务器公网 IPv4 的 A 记录，确认 80/443 入站可用。
2. 在服务器安装 Git 与 Docker Compose，克隆公开仓库。
3. 本机先运行 `npm ci && npm run build && npm test`，推送通过后，服务器检出同一提交并运行 `npm ci && npm run build`。
4. 从 `server/.env.example` 创建服务器私有 `server/.env`。至少填写：

   - `TAROT_AI_ALLOWED_ORIGINS=https://tarot.georgelu.cn`
   - `TAROT_AI_HOST=0.0.0.0`
   - `TAROT_TELEMETRY_ENABLED=1`
   - `TAROT_TELEMETRY_DB=/app/data/telemetry.sqlite`
   - 独立随机的 `TAROT_AI_ACCESS_TOKEN` 与 `TAROT_ADMIN_TOKEN`
   - 真实供应商密钥与模型配置

5. 运行 `docker compose -f deploy/compose.yaml up -d --build`。

`server/.env`、SQLite、Caddy证书和管理口令都不进入 Git。Caddy 配置不启用访问日志，避免另存访问 IP；云平台级日志仍须在控制台检查。

## 更新

```sh
git fetch origin
git checkout main
git pull --ff-only
npm ci
npm run build
npm test
docker compose -f deploy/compose.yaml up -d --build
```

部署后依次检查：

```sh
curl -fsS https://tarot.georgelu.cn/ >/dev/null
curl -fsS https://tarot.georgelu.cn/api/health
```

再用无私人信息的合成问题做一次本地解读和一次明确确认的 AI 解读；打开 `/admin.html` 核对 PV/UV、漏斗和 AI 指标。构建成功、容器健康、HTTPS、真实模型、手机体验是五项独立证据。

## 回滚

保留上一发布提交。代码回滚使用 `git checkout <verified-commit>` 后重新构建和启动；`tarot-data` 与 `caddy-data` 卷不随容器删除。不要用 `docker compose down -v`，它会删除统计库和证书数据。
