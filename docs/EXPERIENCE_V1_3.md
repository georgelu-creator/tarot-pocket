# v1.3 · Touch, observation, and recall / 触摸、观看与记忆

This release refines the existing UI and interaction. It preserves storage keys, backups, scheduling rules, the sourced spread catalog, and the deployed AI API. Further model-prompt and interpretation-quality work is deferred to a separate change.

本轮集中改善既有 UI 与交互，保留存储键、备份、记忆调度规则、有出处的牌阵及现有 AI 接口。模型提示与解读质量的进一步改进留待下一轮。

## References / 借鉴依据

We inspected official public material and public web pages, not every native app's signed-in experience. References inform interaction principles; their artwork, commercial text, and claims are not copied.

本轮查看官方资料与公开网页，未声称完整实测每个产品的登录后或原生 App 体验。借鉴交互方法，不复制商业牌图、课程文字或产品结论。

| Source / 来源 | Applied here / 采用方式 |
| --- | --- |
| [Labyrinthos learning](https://labyrinthos.co/pages/learn-tarot-for-beginners-with-our-online-tarot-classes) | Picture-led, language-like repeated practice. / 从牌图出发，以不同动作反复遇见同一含义。 |
| [Labyrinthos card reference](https://labyrinthos.co/blogs/tarot-card-meanings-list/the-tower-meaning-major-arcana-tarot-card-meanings) | Layered visual reference and contextual distinctions; our 78 new explanatory paragraphs are original. / 参考分层图文查阅与情境区分；新增 78 段解说为原创。 |
| [The Fool's Dog](https://www.foolsdog.com/) | Full guidebook access and readable complete images alongside a separate reading table. / 完整牌图、丰富手册与独立牌桌。 |
| [Duolingo feedback and characters](https://blog.duolingo.com/building-character/) and [recall exercises](https://blog.duolingo.com/review-exercises-help-measure-learner-recall/) | Contextual encouragement, different retrieval actions, and useful error feedback. / 情境引导、多种回忆动作和可理解的错误反馈。 |
| [Joan Bunning: the major arcana](https://www.learntarot.com/less2.htm) and [the minor arcana](https://www.learntarot.com/less3.htm) | Image, card themes, suit and number support one another without becoming a mechanical formula. / 画面、主题、花色、数字互相支持，不机械套公式。 |

Spread definitions and their sources remain in [SPREAD_SOURCES.md](SPREAD_SOURCES.md). Reference research does not substitute for independent tarot-teacher review.

牌阵版本和具体来源沿用[牌阵出处记录](SPREAD_SOURCES.md)。参考研究不等于独立塔罗教师审校。

## Reading table / 随身牌桌

- Shuffle lasts 4.8 seconds, with moving stacks and changing prompts to hold the question in mind. When finished, it waits for the user. Skip is available. / 洗牌 4.8 秒，牌叠运动、提示依次出现；结束后等待用户继续，也可跳过。
- Cut at one of three visible points; piles separate and settle for 1.4 seconds. The cut rotates the already shuffled deck once. / 三个可见切点，牌堆分开再合拢 1.4 秒；切牌只旋转既有牌序一次。
- Browse all 78 cards in 13 groups of six large, non-overlapping targets. Tap lifts a candidate; tap again cancels; confirm places it. The position tray and progress remain visible. / 78 张分 13 组，每组六张大触控牌背；轻点抬起，再点取消，确认入位；牌位托盘与进度可见。
- Reveal a large face for 900 ms, then look for as long as desired before continuing. The final reveal also waits. / 900ms 大图翻面后不限时观看；最后一张同样等待确认，不立即跳到结果。
- Pause/resume retains deck order, selected cards, pending candidate and reveal position. Reduced-motion and skip paths keep the same outcome. / 退出再回来保留牌序、已选牌、候选牌和翻牌位置；减少动态、跳过均不改变结果。
- Reading results remain whole-spread first. Single-card guides are optional and contain no lesson tasks. / 结果优先呈现整组；单牌资料可选，不夹入教学任务。

## Learning interaction / 学习交互

- First look: a full card before its explanation, with no countdown. / 先独立观察完整牌面，不倒计时，不先给解释。
- Connect: select what is visible, then a meaning it supports. Both ends can be changed before checking. Feedback identifies which end failed. / 连接画面与含义，两端都可改，反馈明确指出哪一端不成立。
- Match: assign two close meanings to two real cards. A placed meaning can be removed and reassigned. / 把接近的含义分别交给两张实牌，可撤回重新匹配。
- Repair: retry after useful feedback while preserving the first-attempt result for memory scheduling. / 看完具体错因后重连，记忆调度仍保留首次表现。
- Continue: retain free card choice, seven-stage lessons, next-card continuation, quiet recall, visible spread positions, and element/number scaffolding. / 保留自主选牌、七步连续课程、下一张、静默回忆、可见牌位及元素数字辅助。

New sessions use `playVersion: 3`. Existing v1/v2 sessions continue with their original steps; no stored answer is reinterpreted as a new exercise.

新课程使用 `playVersion: 3`，旧 v1/v2 课程仍按原步骤续学，不把旧答案误判为新玩法的作答。

## Card handbook / 单牌手册

A complete image with zoom leads into four navigable chapters: picture, meaning, application, comparison. Each of 78 cards has a dedicated explanatory paragraph, selectable observation lenses, upright/reversed reference, a three-topic by three-role context matrix, visible position examples, and a paired-card comparison. These are reference examples, not an automatic answer to a private question.

完整可放大牌面之后，提供看图、牌义、运用、对照四章。78 张都有专属解说、事实／象征／主题切换、正逆位、感情／事业／学业与现状／阻碍／建议对照表、可见牌位及易混双牌。它们是查阅例子，不冒充对私人问题的自动回答。

Toggling orientation, topic, position, favorite, or language keeps the sheet intact. Zoom and nested references return to the prior scroll position. Chinese/English content and the existing offline build include the new guide.

切正逆位、情境、位置、收藏或语言时保留资料页；放大、进入相近牌再返回保留滚动位置。新增手册进入中英双语与离线包。

## Acceptance / 验证范围

The full `npm test` includes `check_learning_v13.cjs`, `check_ritual_v13.cjs`, and `check_dossier_v13.cjs`, and the WebKit face-visibility regression `check_reveal_webkit.cjs`, alongside all earlier checks. These exercise mobile touch bounds, actual moving transforms, deliberate waits, duplicate-action guards, saved sessions, all 78 guides, translations, responsive layouts, reduced motion and offline upgrade. Results and publication evidence belong in [HANDOFF.md](HANDOFF.md).

完整检查在原回归之上增加三项专项：手机点击范围、真实动态变换、主动等待、重复动作保护、存档恢复、78 张资料、翻译、响应式、减少动态与离线升级。实际结果及上线证据见接力记录。自动化不证明长期记忆效果、专业教师审校或真实 iPhone 旅行可靠性。
