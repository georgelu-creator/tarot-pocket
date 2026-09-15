# 联网解牌服务 / Online reading service

首次进入托管网页时，用户输入一次邀请码。服务端把邀请码换成有时效的解牌会话；之后用户主动点“生成完整解读”时，网页自动发送本次问题、选项、牌阵 ID、实际抽出的牌和正逆位。服务从仓库目录补全牌名和每个牌位，再请求 DeepSeek 或 OpenAI。学习与已下载内容仍可离线运行。

The hosted app exchanges one invitation for an expiring reading session. After the user explicitly requests a complete reading, the page automatically sends the current question, choices, spread ID, actual cards and orientations. The service fills in names and positions from this repository and requests DeepSeek or OpenAI. Learning and downloaded content still work offline.

## 当前交付边界 / Delivery status

- 已提供 Node.js 22+ 服务、容器配置、精确来源限制、邀请码换会话、请求额度/并发上限及自动化模拟测试。运行时没有第三方软件依赖。
- 本地模拟已核验两种供应商的请求和响应格式。模拟不能证明真实模型的解读质量、账户额度、网络可达性或生产部署成功。
- 2026-09-14 已用无私人信息的学习案例完成一次 DeepSeek 官方真实调用，返回 1,407 字连贯正文。它证明该次调用成功，不等于持续质量或公网部署验收。腾讯云境外云函数的适配与部署要求见 [EDGEONE.md](EDGEONE.md)。
- 同日腾讯云境外 HTTPS 服务也已真实返回五牌逆位案例解读（1,081 字）；已核对未持码请求 401 和正确来源预检 204。当前地址见 `ai-config.js`，上线版本与设备验收见 [HANDOFF.md](HANDOFF.md)。
- 这份文档与代码不包含真实密钥、用户问题、虚构的服务地址或“已完成部署”的声明。部署时由维护者填写实际云平台环境变量，之后才能执行真实连通性与质量验收。

- The Node.js 22+ service, container setup, exact-origin restrictions, invitation-to-session exchange, request/concurrency limits and mock tests are provided without third-party runtime dependencies.
- Local mocks validate both provider contracts. They do not verify live model quality, account credit, network reachability or production deployment.
- A live official DeepSeek request with a synthetic study example returned 1,407 characters on 2026-09-14. This verifies that request, not sustained quality or public deployment. See [EDGEONE.md](EDGEONE.md) for the overseas Tencent Cloud Functions adapter and hosting requirements.
- The overseas Tencent HTTPS service also returned a synthetic five-card reading with reversals (1,081 characters), with unauthorized requests returning 401 and valid-origin preflight returning 204. See `ai-config.js` for its current address and [HANDOFF.md](HANDOFF.md) for publication and device acceptance.
- No real key, personal question or invented service URL is included. The maintainer must configure the actual hosting environment before live acceptance can be performed.

## 密钥放在哪里 / Where credentials belong

供应商 API Key 与长 `TAROT_AI_ACCESS_TOKEN` 只放在云平台的服务端 Secret/环境变量里。服务端从长 Token 确定性派生一个不区分大小写的 8 位邀请码；用户只把短邀请码提交给 `/api/session`。服务返回签名的短期会话，`/api/reading` 不接受短邀请码或长 Token。邀请码、会话和供应商 Key 都不进入学习备份。这个权限只覆盖结构化塔罗解牌，不授权任意聊天、模型列表、文件或工具。

Keep the provider API key and long `TAROT_AI_ACCESS_TOKEN` in server-side secrets. The server deterministically derives a case-insensitive 8-character invitation from the long token; only that short invitation is submitted to `/api/session`. `/api/reading` accepts the signed, expiring session and rejects both invitations and long tokens. None of these credentials enter learning backups. Access remains limited to structured tarot readings, not arbitrary chat, model listing, files, or tools.

8 位邀请码仍然代表调用费用权限，应私下分享，不要写入公开前端或仓库。长 Token 至少 32 字符，实际建议使用 32 字节随机值的十六进制或 Base64URL 编码。共享邀请码不是账号系统；需要多人开放使用时，应另外设计身份、每人额度与凭据轮换。

The 8-character invitation can incur API charges and should be shared privately, never hardcoded in the public frontend or repository. The long token must contain at least 32 characters, preferably an encoding of 32 random bytes. A shared invitation is not an account system; a public multi-user service needs separate identity, per-user quotas and credential rotation.

## 配置 / Configuration

先从仓库根目录复制空白模板，在本机编辑器或云平台 Secret 页面填写。`.env` 被 Git 忽略，模板里的值全部为空。

Copy the empty template from the repository root and fill it using a local editor or the cloud host's secret settings. Git ignores `.env`; every value in the template is blank.

```sh
cp server/.env.example server/.env
node --env-file=server/.env server/reading-service.cjs
```

| 环境变量 / Variable | 含义与默认值 / Purpose and default |
| --- | --- |
| `TAROT_AI_PROVIDER` | `deepseek`（默认 / default）或 / or `openai` |
| `TAROT_AI_MODEL` | DeepSeek 默认 / default `deepseek-flash`；OpenAI 必须显式填写账户可用模型 / requires an explicit available model |
| `TAROT_AI_BASE_URL` | DeepSeek 默认 `https://api.deepseek.com`；OpenAI 默认 `https://api.openai.com/v1`。必须 HTTPS，无凭据、查询串或片段 / HTTPS only, with no embedded credentials, query or fragment |
| `DEEPSEEK_API_KEY` | DeepSeek 服务端密钥 / server-side provider key |
| `OPENAI_API_KEY` | 仅 OpenAI 模式需要 / only needed for OpenAI mode |
| `TAROT_AI_ACCESS_TOKEN` | 必填服务端签名密钥，至少 32 字符；派生 8 位邀请码，更换后短邀请码改变且旧会话失效 / required server signing secret, at least 32 characters; derives the 8-character invitation and rotation revokes old sessions |
| `TAROT_SESSION_TTL_SECONDS` | 会话时长，默认 43200（12 小时），允许 900–604800 / session lifetime, default 43200 (12 hours), range 900–604800 |
| `TAROT_AI_ALLOWED_ORIGINS` | 逗号分隔的精确网页来源，例如 `https://georgelu-creator.github.io`；不含 `/tarot-pocket/`、尾部 `/` 或 `*` / comma-separated exact origins, no paths, trailing slash or wildcard |
| `TAROT_AI_HOST` | 默认 `127.0.0.1`；云容器通常设 `0.0.0.0` / localhost by default; containers normally use `0.0.0.0` |
| `PORT` | 默认 / default `8787`；可采用云平台注入的端口 / host-provided port is supported |
| `TAROT_AI_THINKING` | DeepSeek `enabled`（默认，low effort）或 `disabled`；不影响只返回最终正文 / only final answer content is ever returned |
| `TAROT_AI_TIMEOUT_MS` | 默认 / default `90000`，允许 / range `1000–180000` |
| `TAROT_AI_MAX_TOKENS` | 默认 / default `8192`，允许 / range `1024–24000`；包含供应商计入的思考输出预算 / includes reasoning tokens where the provider counts them |
| `TAROT_AI_REQUESTS_PER_MINUTE` | 所有持码用户共享，默认 / shared default `6` |
| `TAROT_AI_REQUESTS_PER_DAY` | 过去 24 小时内所有持码用户共享，默认 / shared rolling-24-hour default `100` |
| `TAROT_AI_CONCURRENCY` | 同时进行的上游请求，默认 / simultaneous upstream requests, default `2` |

在维护者电脑上生成易分享邀请码时运行下面的命令。它只把邀请码写入被 Git 忽略且权限为 `0600` 的 `server/invite-code.txt`，不会打印长 Token 或短邀请码到日志。

To prepare the shareable invitation on the maintainer's computer, run the command below. It writes only to ignored `server/invite-code.txt` with mode `0600` and prints neither the long token nor invitation to logs.

```sh
node --env-file=server/.env tools/write_invite_code.cjs
```

供应商地址由维护者在启动时固定，客户端不能覆盖。可配置 HTTPS 兼容网关，但网关也会收到密钥与问题，只有明确受信任的服务才能作为这个地址。请求不跟随重定向，避免认证头被带往不同目的地。

The provider URL is fixed at startup and cannot be overridden by clients. An HTTPS-compatible gateway can be configured, but that gateway receives the key and question and must be explicitly trusted. Redirects are disabled to prevent credential forwarding.

## 云端运行 / Cloud deployment

从仓库根目录构建容器：

Build from the repository root:

```sh
docker build -f server/Dockerfile -t tarot-pocket-ai .
docker run --rm --env-file server/.env -p 127.0.0.1:8787:8787 tarot-pocket-ai
```

容器仅复制服务代码、牌库与牌阵目录，使用非 root 用户。Dockerfile 对应的 `.dockerignore` 排除其他文件，包括 `.env`。镜像不包含任何 Secret。云平台应把 `TAROT_AI_HOST` 设为 `0.0.0.0`，将外部 HTTPS 终止在自己的代理/负载均衡器，再转发给服务监听端口。不要直接把明文 HTTP 地址用于手机公网访问。

The image copies only the service and card/spread catalogs, uses a non-root user, and excludes other files including `.env` through its Dockerfile-specific ignore file. No secret is baked into the image. Set `TAROT_AI_HOST=0.0.0.0` on a container platform; terminate public HTTPS at the host's proxy/load balancer and forward to the listening port. Do not use a public plain-HTTP endpoint on the phone.

若云平台直接启动 Node，使用启动命令 `node server/reading-service.cjs` 并通过平台注入环境变量即可。对 GitHub Pages 的访问来源允许值是 `https://georgelu-creator.github.io`。本机开发可另外加入 `http://127.0.0.1:8765`；不允许 `Origin: null`，因此从本地 `file:` 打开的独立 HTML 不直接调用在线服务。

For a Node host, use `node server/reading-service.cjs` and inject environment variables through the platform. The GitHub Pages origin is `https://georgelu-creator.github.io`. Local development may additionally allow `http://127.0.0.1:8765`. `Origin: null` is denied, so a standalone HTML opened via `file:` does not call the online service directly.

服务器当前不保存请求或解读、不输出问题/密钥日志。仍须检查云平台代理或调试工具没有额外记录 Authorization 或请求正文。限速为单进程内存计数，重启清零、多副本各自计算；生产费用底线需要供应商额度、云端网关额度或共享限流。不能把目前的计数称为跨实例硬性预算。

The service stores no questions or readings and logs no secrets or request bodies. Check that the hosting proxy/debug tooling does not separately capture Authorization or bodies. Limits are per-process, reset on restart and do not coordinate replicas. Provider spend limits, gateway quotas or a shared limiter are needed for a production spending ceiling; the current counters are not a distributed hard budget.

## API 约定 / API contract

`GET /api/health` 不调用模型，返回：

`GET /api/health` does not call a model:

```json
{"ok":true,"configured":false,"provider":"deepseek","model":"deepseek-flash"}
```

`configured:true` 仅说明必填配置完整，不能证明供应商连接或解读质量通过。

`configured:true` only means required settings are present, not that provider connectivity or reading quality has passed.

`POST /api/session` 接受唯一字段 `inviteCode`。验证成功返回 `{token, expiresAt}`；`token` 是有时效的解牌会话，不是供应商密钥。错误邀请码按客户端地址限制为十分钟最多十次。

`POST /api/session` accepts only `inviteCode` and returns `{token, expiresAt}`. The token is an expiring reading session, never a provider credential. Failed invitation attempts are limited to ten per client address per ten minutes.

`POST /api/reading` 需要 `Content-Type: application/json` 与 `Authorization: Bearer <session token>`。原始邀请码不能替代会话。正文只接受以下字段，卡牌顺序必须对应所选牌阵的位置顺序。下面是合成示例，不是用户记录。

The POST accepts only these fields. Card order must match the selected spread's position order. This is synthetic example data, not a personal reading.

```json
{
  "spreadId": "three",
  "topic": "career",
  "question": "如何安排一个新的创作项目？",
  "language": "zh",
  "cards": [
    {"id": "m00", "reversed": false},
    {"id": "m01", "reversed": true},
    {"id": "m02", "reversed": false}
  ]
}
```

`optionA`、`optionB` 可选，各最多 300 字符；问题最多 3000 字符，语言只能 `zh`/`en`。总请求体最多 20000 字节。不存在的牌/牌阵、重复牌、位置数量不符、额外对象字段或非布尔正逆位都会被拒绝。旧存档的牌阵 ID 按旧位置定义读取，不会静默改成新五牌二择一。

Optional `optionA` and `optionB` allow up to 300 characters each. Questions allow 3000 characters and language must be `zh` or `en`. The body limit is 20000 bytes. Unknown cards/spreads, duplicates, mismatched counts, extra object fields and non-boolean orientations are rejected. Legacy spread IDs preserve their original position definitions instead of silently becoming a new five-card choice spread.

`topic` 传递选牌阵时的分类，允许 `general`、`love`、`career`、`study`、`life`、`self`、`choice`；旧客户端不传时按 `general` 处理。服务端把分类 ID 转成受控名称，拒绝未知值，不接受客户端自定义提示词。`open-three` 的三张牌仅有抽取顺序，均为 `free` 角色，不会自动分配过去、现在、未来。

`topic` preserves the category selected in the spread gallery. The allowlist is `general`, `love`, `career`, `study`, `life`, `self`, `choice`; older clients default to `general`. The server resolves trusted labels and rejects unknown categories or custom instruction fields. `open-three` preserves draw order with three `free` roles, without assigning past/present/future positions.

成功响应固定为 `{text, model, provider}`，其中 `text` 是最终正文字符串。客户端须按文本渲染，不能当 HTML 执行。服务不回传 DeepSeek 的 `reasoning_content`、OpenAI 的 reasoning items、原始错误、供应商认证头或响应中的额外字段。空答复、截断、被拒绝的答复不会被标为成功，也不会自动重试并重复计费。

Success returns only `{text, model, provider}`. Render `text` as text, never executable HTML. The service does not return DeepSeek `reasoning_content`, OpenAI reasoning items, raw errors, provider headers or extra response fields. Empty, truncated and refused responses are not marked successful. There are no automatic retries that could duplicate charges.

错误固定为 `{ "error": "CODE" }`：

Errors use `{ "error": "CODE" }`:

| Code | HTTP | 含义 / Meaning |
| --- | --- | --- |
| `INVALID_REQUEST` | 400 | 请求格式或牌面/牌位不合法 / invalid input or card-position mapping |
| `AUTH_REQUIRED` | 401 | 邀请码错误，或解牌会话缺少、篡改、过期 / invalid invitation or missing, tampered, expired reading session |
| `ORIGIN_NOT_ALLOWED` | 403 | 网页来源不在允许清单 / origin not allowed |
| `PAYLOAD_TOO_LARGE` | 413 | 请求体过大 / body too large |
| `MODEL_REFUSAL` | 422 | 模型拒绝生成 / provider refusal |
| `RATE_LIMITED` | 429 | 请求限额已到 / request quota reached |
| `UPSTREAM_ERROR` | 502 | 上游连接或响应异常，原始细节不外传 / upstream failure, raw details withheld |
| `INCOMPLETE_RESPONSE` | 502 | 答复为空、未完成或截断 / empty, incomplete or truncated answer |
| `NOT_CONFIGURED` | 503 | 服务配置未完成 / missing server configuration |
| `BUSY` | 503 | 同时处理的请求已到上限 / concurrency limit reached |
| `TIMEOUT` | 504 | 达到时间上限 / timeout |

普通 Node HTTP 服务会把取消信号传给上游；当前 EdgeOne 打包器不保留浏览器的取消信号，云函数中的上游请求可能继续到完成或 90 秒超时。页面仍可立即退出等待，供应商已开始的计算可能计费。离线参考和已保存的解读继续可读；不得因为联网失败清空牌桌或学习记录。

The Node HTTP transport propagates cancellation upstream. The current EdgeOne bundler does not preserve browser abort signals, so a cloud request may continue until completion or its 90-second deadline after the page stops waiting. Work already performed may be billable. Offline references and saved readings remain readable; a network failure must never erase the card table or learning records.

## 内容与隐私 / Content and privacy

服务只将用户明确提交的这次问题与牌面交给配置的供应商。提示词要求先回应整体问题，再连接真实牌位中的发展、结果、张力与条件；二择一比较两条真实路径，不默认 A 更好；不补出没有抽到的“牌灵”。逆位必须影响具体论述，不能在正位解释后机械追加一句。它生成的是象征解读，不是事实核验或未来保证。

用户所选分类会随问题一起进入解读。具体问题优先，先回应事情的主要方向；是否题在牌面有侧重时可以明确说偏向会或不会，并给依据、条件与可能改变结论的因素，不能用情绪安慰代替回答，也不伪造概率或保证。医疗、法律、投资等高风险决定不由塔罗下确定行动指令。

The selected category accompanies the question. Specific questions take priority and the response leads with the likely direction within the symbolic reading. Yes/no questions may receive a clear leaning when supported, followed by evidence, conditions and factors that could change it. The prompt prohibits invented probabilities, guarantees and deterministic medical, legal or investment decisions.

Only the explicitly submitted question and cards go to the configured provider. The prompt asks for an overall response followed by coherent developments, outcomes, tensions and conditions grounded in the actual positions. Choice readings compare both actual paths without defaulting to A, and never invent an undrawn “deck spirit.” Reversals must affect the interpretation. This is symbolic interpretation, not factual verification or guaranteed prediction.

OpenAI 请求设置 `store:false`；这不等于所有日志、保留或供应商政策都为零。DeepSeek 的数据处理与保留依其账户条款和隐私政策。用户提交前应能看见供应商与发送范围；学习记录、全部抽牌历史和牌图文件不在这次请求内。

OpenAI requests use `store:false`; this does not imply zero logs or universal zero retention. DeepSeek processing and retention follow its account terms and privacy policy. The UI should identify the provider and payload scope before submission. Learning records, complete reading history and artwork files are not part of this request.

## 验证 / Verification

```sh
node tools/check_ai_server.cjs
```

检查通过本机 HTTP 模拟上游运行，不使用实际 API 密钥、不产生模型费用。覆盖 78 张牌与所有当前/兼容牌阵、正逆位、英中文、问题指令隔离、鉴权、CORS、额度、并发、取消、超时、上游失败、截断、拒绝以及隐藏推理与密钥不回传。

Tests route requests to a local mock upstream, use no actual key and incur no model cost. They cover all 78 cards and current/legacy spreads, orientations, both languages, prompt-data separation, authentication, CORS, quotas, concurrency, cancellation, timeout, upstream errors, truncation, refusal, and exclusion of hidden reasoning and credentials.

发布到真实服务后，还要在受信任设备上用无私人信息的合成问题进行一次真实请求，确认配置模型、五牌路径连续性、逆位影响、手机等待/取消/重试与断网回退。Mock 通过不能代替这一步。

After deployment, make a deliberate live request from a trusted device using a synthetic question with no personal information. Verify the configured model, coherent five-card paths, effects of reversals, mobile waiting/cancellation/retry and offline fallback. Passing mocks does not replace this step.

官方依据，核对日期 2026-09-14 / Official references checked 2026-09-14:

- [DeepSeek API introduction](https://api-docs.deepseek.com/) — official base URL and current `deepseek-flash` model name.
- [DeepSeek Create Chat Completion](https://api-docs.deepseek.com/api/create-chat-completion) — chat messages, thinking mode, token limits, finish reasons and separate final/reasoning content.
- [OpenAI Responses API](https://developers.openai.com/api/reference/typescript/resources/responses/methods/create) — instructions/input, `store`, final output items and response status.
