# Tencent EdgeOne AI deployment / 腾讯云 EdgeOne AI 部署

This is an **AI-only** deployment. The learning application can remain on GitHub
Pages. Cloud Functions reuse `server/reading-service.cjs`; there is no second
prompt, validation implementation or public provider key.

这是只部署 AI 服务的配置。学牌与抽牌页面仍可使用 GitHub Pages。云函数与普通
Node HTTP 服务共用验证、鉴权、牌阵目录、提示和错误处理。

## Build and routes / 构建与路由

Use a separate EdgeOne Makers project with the repository root as its root
directory, and the region **Global (excluding Chinese mainland)**. The following
root `edgeone.json` configuration is for that AI project:

为 AI 创建独立 Makers 项目，项目根目录为仓库根目录，选择**全球可用区（不含
中国大陆）**。以下配置仅用于该 AI 项目：

```json
{
  "buildCommand": "node tools/build_edgeone_ai.cjs",
  "installCommand": "node --version",
  "outputDirectory": ".edgeone-ai/public",
  "nodeVersion": "22.11.0",
  "cloudFunctions": {
    "overseasRegions": ["ap-singapore"],
    "nodejs": {"maxDuration": 120}
  }
}
```

The build uses built-in Node modules only. It generates a static public landing
page and a separate server-only catalog from the repository's 78 cards and all
27 spread definitions, including the 19 preserved legacy definitions. The
catalog is imported into the function bundle; it is outside the static output.
The build never reads `.env` or writes credentials into artifacts. Ignore the
generated `.edgeone-ai/` directory in Git. Do not set the output directory to the
repository root or its `server` directory.

构建不需要 Python、牌图处理或安装运行时依赖。公开产物只有服务入口说明；牌义
目录在公开目录外，由函数静态导入。构建不会读取 `.env`。请忽略生成的
`.edgeone-ai/`，不要把仓库根目录或 `server` 设为公开输出目录。

| File / 文件 | Route / 路由 |
| --- | --- |
| `cloud-functions/api/reading.js` | `POST /api/reading` |
| `cloud-functions/api/health.js` | `GET /api/health` |

Handlers receive a Web `Request` and return a Web `Response`. Only the platform's
`context.env` / process environment supplies configuration; only
`context.clientIp` supplies the rate counter's client address. Request headers
cannot override either. No HTTP listener is opened inside a function.

函数接收 Request 并返回 Response。配置仅来自平台运行时环境变量；客户端地址
仅使用平台提供的 `context.clientIp`，不信任请求中的转发 IP。云函数内部不监听端口。

## Private runtime configuration / 私有运行时配置

Set these in the project's **environment variables** before deploying:

在控制台为项目配置以下**环境变量**，值不要放进 Git 或网页：

| Name / 名称 | Value / 值 |
| --- | --- |
| `TAROT_AI_PROVIDER` | `deepseek` |
| `DEEPSEEK_API_KEY` | Provider key; secret / DeepSeek 密钥，保密 |
| `TAROT_AI_ACCESS_TOKEN` | Separate access code, at least 32 characters; secret / 独立访问码，至少32字符，保密 |
| `TAROT_AI_MODEL` | `deepseek-flash` |
| `TAROT_AI_ALLOWED_ORIGINS` | Exact frontend origins, comma-separated; e.g. `https://georgelu-creator.github.io` |
| `TAROT_AI_TIMEOUT_MS` | `90000` (cloud adapter allows at most `110000`) |
| `TAROT_AI_REQUESTS_PER_MINUTE` | `6` by default / 默认6 |
| `TAROT_AI_REQUESTS_PER_DAY` | `100` by default / 默认100 |
| `TAROT_AI_CONCURRENCY` | `2` by default / 默认2 |

Project environment variables may also be available during the build. Only
trusted production commits may build with these secrets: disable untrusted PR
and preview deployments before adding them. Do not use public frontend variable
prefixes or print environment values. The provided install/build commands ignore
secrets and do not install or run dependency scripts.

项目环境变量也可能提供给构建环境。配置密钥前，应关闭不受信任的 PR 和预览构建，
仅允许经过核验的正式提交使用。不要使用前端公开变量前缀或打印环境变量。此处
构建命令不会读取密钥，也不安装或运行依赖脚本。

The independent access code is the user's reading-service password, not the
DeepSeek key. Re-deploy after configuration changes as required by the
platform. See [AI_SERVICE.md](AI_SERVICE.md) for the full shared API and options.

独立访问码用于页面调用解读服务，不能填写为 DeepSeek 密钥。平台要求时，更新
运行时变量后重新部署。完整接口、配置和错误码见 [AI_SERVICE.md](AI_SERVICE.md)。

**Limit scope:** counters are local to each warm function instance. Cold starts,
deployment and horizontal scaling reset or multiply those counters. They are
not a project-wide daily quota or a hard API spending limit. Protect the separate
access code and use provider-side balance/budget controls for a strict cost
boundary. Before broad public multi-user access, add a shared atomic quota store.

**限流范围：**计数仅对单个热实例有效，冷启动、部署和扩容会重置或扩大可用次数，
不能当作整个项目的每日费用上限。严格控费需要供应商侧余额或预算限制；开放给
大量用户前需增加共享的原子配额存储。

## Verification / 验证

```sh
node tools/build_edgeone_ai.cjs
node tools/check_cloud_functions.cjs
node tools/check_ai_server.cjs
```

These checks use synthetic credentials and mock providers. They validate the
actual cloud entrypoint imports, all current/legacy positions, auth, exact CORS,
body size, cancellation, safe errors and warm-instance counters. They do not
prove that a cloud deployment or a paid provider call has succeeded.

以上检查只用测试凭据和模拟上游，不产生模型费用。发布后仍需实际验证 HTTPS
`/api/health`、无访问码被拒绝、前端域名的 OPTIONS 请求，以及一次明确授权的
真实解读。只有实际可访问后，才用 `tools/configure_ai.cjs` 配置前端地址并重新构建。

## Official references / 官方依据

- [Node Functions](https://pages.edgeone.ai/document/node-functions): file routes,
  default handlers, `request`, `env`, `clientIp` and `Response`.
- [Cloud Functions](https://pages.edgeone.ai/document/cloud-functions): Node 20
  runtime, overseas regions and a maximum execution duration of 120 seconds.
- [edgeone.json](https://pages.edgeone.ai/document/edgeone-json): build/install
  commands, static output, build Node version and function deployment settings.

The build Node version and function Node runtime are separate platform settings.
Deployment must still verify the actual function bundle and runtime environment.

构建使用的 Node 版本与函数运行时版本是两项设置。最终需要核验平台实际生成的
函数包与运行时配置，不能只凭本地测试声明部署成功。
