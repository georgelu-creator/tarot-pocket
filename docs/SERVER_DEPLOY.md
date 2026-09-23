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

如果服务器无法访问 Docker Hub，可使用仓库中的原生部署模板，保持同一目录与回滚方式：

1. 从 Ubuntu 仓库安装 Caddy，并从 Node 官方 `latest-v24.x` 下载发行包；先用官方 `SHASUMS256.txt` 校验归档。
2. 将当前已验证发布放到 `/opt/tarot-pocket/releases/<commit>`，再把 `/opt/tarot-pocket/current` 原子切换到该目录。
3. 把 `deploy/tarot-pocket-api.service` 安装到 `/etc/systemd/system/`，把 `deploy/Caddyfile.native` 安装到 `/etc/caddy/Caddyfile`。
4. 把统计库地址改为 `/var/lib/tarot-pocket/telemetry.sqlite`，创建仅服务用户可写的数据目录，再依次执行 `systemd-analyze verify`、`caddy validate`、`systemctl enable --now tarot-pocket-api caddy`。

原生和 Compose 只能选择一种生产运行方式。当前原生模板假定服务器用户是 `ubuntu`；换机器时必须同步修改 service 的用户，不要直接照搬。
原生 service 会覆盖 `TAROT_AI_HOST=127.0.0.1`，只允许同机 Caddy 访问 8787；Compose 内的 API 仍使用环境文件中的 `0.0.0.0` 在容器网络监听。

`server/.env`、SQLite、Caddy证书和管理口令都不进入 Git。Caddy 配置不启用访问日志，避免另存访问 IP；云平台级日志仍须在控制台检查。

## 更新

Compose 部署在服务器检出已通过检查的提交后更新：

```sh
git fetch origin
git checkout main
git pull --ff-only
npm ci
npm run build
npm test
docker compose -f deploy/compose.yaml up -d --build
```

原生部署先把本机通过检查的同一提交构建成独立发布目录，再切换软链接。不要覆盖正在运行的目录：

```sh
release=/opt/tarot-pocket/releases/<verified-commit>
sudo ln -sfn "$release" /opt/tarot-pocket/current
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemd-analyze verify /etc/systemd/system/tarot-pocket-api.service
sudo systemctl restart tarot-pocket-api
sudo systemctl reload caddy
```

新发布目录需要包含构建后的 `dist/`、服务器代码及私有 `server/.env`，并保持 `.env` 为 `0600`。先验证新目录完整，再切换 `current`；统计库与证书继续留在发布目录之外。

部署后依次检查：

```sh
curl -fsS https://tarot.georgelu.cn/ >/dev/null
curl -fsS https://tarot.georgelu.cn/api/health
```

再用无私人信息的合成问题做一次本地解读和一次明确确认的 AI 解读；打开 `/admin.html` 核对 PV/UV、漏斗和 AI 指标。构建成功、容器健康、HTTPS、真实模型、手机体验是五项独立证据。

## 回滚

Compose 回滚到上一个已验证提交后重新构建和启动；`tarot-data` 与 `caddy-data` 卷不随容器删除。不要用 `docker compose down -v`，它会删除统计库和证书数据。

原生部署保留上一发布目录，把 `/opt/tarot-pocket/current` 重新指向它，再重启 `tarot-pocket-api` 并重载 Caddy。`/var/lib/tarot-pocket` 和 `/var/lib/caddy` 不随代码回滚；回滚后重新检查首页构建指纹、`/api/health`、公开会话、匿名事件与管理页鉴权。
