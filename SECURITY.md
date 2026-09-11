# Security · 安全问题

## Scope · 范围

Tarot Pocket is a browser-based preview with local state and a file-import feature. Security-sensitive areas include imported JSON, rendered content, persistent browser data, asset and dependency integrity, and the release build. The application does not need an account, an AI API key, or a server holding reading histories.

Tarot Pocket 是保存本地状态、支持文件导入的浏览器预览版。重点检查导入 JSON、内容渲染、浏览器持久化数据、素材与依赖完整性、发行构建。应用不需要账号、AI API Key 或保存抽牌历史的服务端。

The latest preview release is the maintained target. There is no guaranteed response time or security maintenance commitment for older previews. Do not interpret a passing test suite as a security audit.

维护目标为最新预览版；旧版没有响应时间或安全维护承诺。测试通过不能代替安全审计。

## Report privately when needed · 需要时私下报告

If the repository's **Security → Report a vulnerability** action is available, use it for a report that contains exploit details or private information. If it is unavailable, open a minimal issue asking the maintainer to establish a private reporting channel, without publishing the exploit, affected person's data, or a secret.

若仓库 **Security → Report a vulnerability** 入口可用，包含利用细节或私人信息的报告请走该入口。若入口不可用，可发一个最小化 issue，请维护者建立私下沟通渠道；不要在其中公开利用方法、受影响者数据或秘密。

Include the release or commit, browser and operating system, affected component, expected impact, and safe reproduction steps. Use synthetic data. Do not attach an actual personal reading backup.

报告包含版本或提交、浏览器与系统、受影响部分、预期影响和安全的复现步骤；使用合成数据，不附真实私人抽牌备份。

## Data boundaries · 数据边界

Learning progress and readings are stored in the current browser. Exported JSON can contain your learning history, reading topics, cards, and current table. Treat it as a personal file and keep it out of Git, issues, and public screenshots.

学习与抽牌记录存于当前浏览器；导出的 JSON 可能包含学习历史、抽牌主题、牌面和当前牌桌。将其视为个人文件，不要提交到 Git、issue 或公开截图。

Opening a hosted page uses the hosting provider's network service. “No account” and “local progress” do not mean the provider receives no ordinary web request information. The standalone HTML is the distribution intended to run without runtime network resources.

打开在线网页会使用托管方网络服务。“无账号”和“进度本地保存”不代表托管方收不到常规网页请求信息。独立 HTML 用于在无需运行时网络资源的情况下使用。

A browser reset, cleared site data, or changed origin can make local records unavailable. Export before moving devices or changing how you open the application; see [Handoff](docs/HANDOFF.md).

重置浏览器、清除站点数据或更换来源可能导致原记录不可见。换设备或更换打开方式前先导出，详见接力说明。
