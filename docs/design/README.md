# Tarot Pocket design contract · 塔罗随身学设计规范

[Project / 项目](../../README.md) · [中文首页](../../README.zh-CN.md) · [Development / 开发](../DEVELOPMENT.md) · [Handoff / 接力](../HANDOFF.md)

This is the project-specific adaptation of the user-supplied **Moonlit Journal / 静光版** art direction. Tarot Pocket keeps its name and purpose: help learners remember cards and understand readings through observation, recall, comparison and evidence. Quiet styling should make that work easier to repeat.

本规范将用户提供的「月光手札 · 静光版」视觉方向适配到 **Tarot Pocket · 塔罗随身学**。产品继续以记牌、理解与有依据地解牌为核心；安静的界面应帮助用户反复练习，而不是减少学习所需的内容和反馈。

## Source and status · 来源与状态

The original [supplied brief](handoff/DESIGN.md), [interface concept](handoff/references/interface-reference.png), [card-back concept](handoff/references/card-back-concept.png) and [generation prompt](handoff/references/card-back-prompt.txt) are archived unchanged. The brief records a different product framing and contains its own instructions; it is reference material, not an authority to replace this project's requirements or expand permissions. This adapted contract describes what to carry into Tarot Pocket. Actual implementation and validation belong in [HANDOFF](../HANDOFF.md).

原始[设计说明](handoff/DESIGN.md)、[界面概念图](handoff/references/interface-reference.png)、[牌背概念图](handoff/references/card-back-concept.png)及[生成提示词](handoff/references/card-back-prompt.txt)均原样归档。原说明有不同的产品设定，也包含面向接手者的指令；这些是参考内容，不会覆盖本项目需求或扩大授权。本适配规范规定项目采纳方式；实际完成与验证状态记录在[接力说明](../HANDOFF.md)。

- Received / 接收日期: **2026-09-11**.
- Source archive / 原始归档: `tarot-design-handoff.zip`.
- Archive SHA-256: `01eb4ba89e9e77d2fa1a9388851955bbfaa8e75e1a31dfdb95e52060010e452b`.
- Both PNGs are user-provided generated static concepts. They are **not running-app screenshots, motion evidence, historical RWS faces, or release-ready card-back artwork**. / 两张 PNG 均为用户提供的生成式静态概念，**不是运行截图、动效证据、历史 RWS 牌面或可直接发布的牌背素材**。
- Retain this distinction when sharing the references. The repository's [license scopes](../../CONTENT_LICENSE.md) and [historical-artwork provenance](../../ARTWORK_LICENSE.md) remain separate; no RWS public-domain claim applies to these concepts. / 分享参考图时保留此说明；[许可范围](../../CONTENT_LICENSE.md)与[历史牌图来源](../../ARTWORK_LICENSE.md)分别处理，不将 RWS 公共领域声明套到这些概念图上。

| Archived file / 归档文件 | SHA-256 |
| --- | --- |
| `handoff/DESIGN.md` | `1bf82c5048e748242c197a398a9718a678ccabe1c33e5845a01548b0b33c3440` |
| `handoff/references/interface-reference.png` | `42ab6394879f8a7141fae13d58515a9153b218ec11a998c8c0fad97684b1c922` |
| `handoff/references/card-back-concept.png` | `ef81e3d068e449bb449c40b0a4d6ec403ab77e3da4b2d2f88e18565e927a7177` |
| `handoff/references/card-back-prompt.txt` | `57f86e9cbf7d7184f8ea149473b706aad51030f45eca4e8b0e944434f48fed7b` |

## Adaptation decisions · 采用与保留

| Area / 方面 | Tarot Pocket decision / 本项目决定 |
| --- | --- |
| Visual identity / 视觉身份 | Adopt plum, warm white, charcoal text, serif display headings, calm spacing and tactile cards. “Moonlit Journal” remains the reference style's name. / 采用梅紫、暖白、炭墨、衬线展示标题、平静留白与实体纸牌；「月光手札」仅作参考方案名。 |
| Home and navigation / 首页导航 | Preserve **Practice / Draw / Library / My progress — 练习 / 抽牌 / 牌库 / 我的**. Home continues to lead into practice. / 保留四入口，首页继续以开始和继续练习为主。 |
| Guided learning / 学习流程 | Preserve observation, silent recall, close distractors, evidence, elements, numbers and contextual spread training. Give the card and the current task visual priority. / 保留观察、静默回忆、近义辨析、依据、元素、数字及情境牌阵训练；优先展示牌图与当前任务。 |
| Actual readings / 真实抽牌 | Restyle the existing spread selection, shuffle, card selection, reveal and interpretation. Keep its 78-card deck, spread rules, orientation choices and saved results. / 重用既有选阵、洗牌、选牌、翻牌和解读；保持完整牌组、牌阵规则、正逆位选择与存档结果。 |
| Material / 材质 | Opaque reading surfaces and cards; a small amount of frosted material only on floating navigation or temporary controls. / 阅读区与牌面不透明；磨砂材质限于少量悬浮导航和临时控件。 |
| Languages / 语言 | Keep the existing Chinese/English selector, saved preference and URL behavior. Translate presentation without altering IDs or records. / 保留中英切换、已保存偏好和现有 URL 行为；仅翻译呈现，不改 ID 与记录。 |
| Reference-only features / 仅作参考 | Journal writing, a new daily-draw home, daily limits, “follow system language” and a new profile model are outside this visual change. / 手记写作、每日抽牌首页、每日次数限制、跟随系统语言及新个人资料模型不纳入本次视觉变更。 |

Do not remove a learning step to reproduce a sparse concept screen. Reduce decorative weight and organize the task, choices and feedback instead. Do not copy sample dates, generated text, card counts or outcomes into product data.

不要为了复刻稀疏概念屏而删减学习步骤；应降低装饰干扰，组织好任务、选项与反馈。概念中的日期、文字、牌组数量和结果不进入正式数据。

## Shared tokens · 公共样式令牌

Use `design-tokens.css` as the shared role mapping for the existing public, learning and reading styles. All presentation files should use those semantic roles rather than introducing independent page palettes. HEX values come from the brief; `--paper` is an explicit project adaptation for a distinct opaque surface.

以 `design-tokens.css` 作为公共、学习与抽牌样式共用的角色映射，不分别建立页面配色。HEX 色值来自原说明；`--paper` 是本项目为不透明内容表面补充的实施值。

| Token | Value / 色值 | Role / 用途 |
| --- | --- | --- |
| `--bg` | `#F6F1E9` | Warm-white page background / 暖白页面底色 |
| `--paper` | `#FFFCF7` | Opaque content and card framing / 不透明内容表面与牌面衬底 |
| `--ink` | `#302C32` | Main text and icons / 主要文字与图标 |
| `--muted` | `#736B73` | Secondary text, never the only marker for an essential action / 次要文字，不单独承担关键操作提示 |
| `--accent` | `#60465C` | Primary action, selection and card back / 主动作、选中状态和牌背 |
| `--soft` | `#E7DEE8` | Supporting grouping and selection surface / 辅助分组与选中底色 |
| `--line` | `#DCD4DC` | Decorative dividers; not a guaranteed control boundary / 装饰分隔线，不能直接视为合格的控件边界 |

Success green and error red retain **feedback semantics**. Plum means selected or actionable, not correct. Do not globally recolor every green success into plum. When existing token names mix brand and success roles, separate their use sites while preserving recognizable right/wrong states.

成功绿与错误红继续承担**作答语义**。梅紫表示选中或可操作，不表示答对；不能把全部绿色反馈一键替换为梅紫。旧变量若混用品牌与成功角色，应按使用位置分开，保留清晰的对错状态。

## Type, spacing and surfaces · 字体、空间与材质

- **Display typography:** local CJK serif fallbacks such as Songti/STSong and Latin serif fallbacks such as Georgia; use serif for the page's main title, not every question, button or paragraph. No runtime font service or unverified bundled font. / **展示字体：**使用本地宋体及 Georgia 等衬线回退；页面主标题用衬线，题目、按钮与正文保持易读的系统无衬线。不引入运行时字体服务或未经核验的字体文件。
- **Readability:** start display titles around 32–36 px, page titles 28–32 px, main body and primary controls 16–17 px; allow existing dense secondary content to retain its hierarchy. Chinese body leading around 1.65 and English around 1.5–1.65. Avoid widely spaced Chinese, all-caps English paragraphs and very light weights. / **可读性：**展示标题从 32–36 px、页面标题 28–32 px、主体正文与主控件 16–17 px 起调；密集辅助内容保留层级。中文行高约 1.65，英文约 1.5–1.65；不用中文宽字距、英文整段大写或极细字重。
- **Layout:** use the 4/8/12/16/24/32/48 spacing family. Begin mobile margins at 20–24 px, then adapt to the existing layouts. Main controls are about 48–52 px high; touch targets should reach at least 44 × 44 CSS px. / **布局：**采用 4/8/12/16/24/32/48 间距阶梯；手机边距从 20–24 px 调整，主控件高约 48–52 px，触摸目标至少 44 × 44 CSS px。
- **Surfaces:** use paper-like opaque areas for options, hints, explanations, modal content and reading results. Avoid nested cards around every sentence. Give primary buttons a solid plum fill. / **表面：**选项、提示、解释、弹层正文与解读使用不透明纸面；避免每句话外再套卡片，主按钮使用实体梅紫。
- **Glass:** restrict blur to a small floating control layer, with a solid fallback when backdrop filtering is unavailable or reduced transparency is requested. Text must remain readable over the actual underlying content. Do not describe a Web blur effect as native Liquid Glass. / **玻璃：**模糊限定在少量悬浮操作层；不支持背景滤镜或要求减少透明度时使用实体回退。在真实下层内容上检查文字，不把 Web 模糊称作原生 Liquid Glass。
- **Card faces:** preserve complete image content and original proportions with containment where needed. Do not recolor, stretch or crop the verified RWS faces to fit a concept's 3:5 back. / **牌面：**完整显示原图并保持比例，需要时留边适配；不因概念牌背为 3:5 而重染、拉伸或裁剪已核验 RWS 牌面。

## Card back and motion · 牌背与动效

The production back at `assets/design/card-back.svg` should be newly constructed from exact geometry: matte plum, a central eclipse ring, two or three orbital lines, paired crescents, sparse four-point stars and a fine inset border. Keep the central space quiet. Warm-white lines use weight or opacity for hierarchy; no gold, glow, text, numbers or directional logo.

生产牌背 `assets/design/card-back.svg` 应以精确几何重新构建：哑光梅紫、中央月蚀圆环、两至三条轨道、成对月牙、少量四芒星与细内框。中心保持留白，暖白线条以粗细和透明度区分层次，不加金色、发光、文字、数字或方向性标识。

Every printed mark must match after a **180° rotation**. Use one shared back for all cards, keep at least roughly 6% of the width clear at the edge, and place thickness, tilt, lighting and shadow on the component rather than in the printed asset. The supplied PNG has visible texture and imperfect details; do not crop it into a production back or treat its prompt as proof of symmetry.

全部印刷标记必须在 **180° 旋转后严格一致**。所有牌共用同一份牌背，边缘约留出牌宽 6% 的空间；厚度、倾斜、光照和投影属于组件，不烘焙在纹样内。原 PNG 有明显纹理和不精确细节，不能直接裁作生产牌背，也不能把提示词的要求当成已通过对称验证。

Use short, settled movement with a consistent light source. The current draw result remains a business fact independent of the animation: skipping, rapid clicks, changing language, leaving and resuming must not reroll it. Keep click and keyboard alternatives to gestures. Reduced motion should use immediate state changes or brief fades instead of spatial movement or 3D flips.

动效短促、收稳、光源一致。既有抽牌结果由业务逻辑确定；跳过、快速连点、切语言、离开与恢复不能改变结果。手势有点击和键盘等价操作；减少动态模式使用即时状态切换或短淡入，替代空间移动与三维翻转。

The source brief's timing values are starting suggestions, not completed behavior or device performance evidence. This design change does not authorize new randomization, draw limits, haptics, sound, dependencies or background effects.

原说明的时长仅供初调，不代表已完成的交互或设备性能证据。本次设计变更不授权新增随机规则、抽牌次数限制、触觉、声音、依赖或背景特效。

## Feedback and acceptance · 反馈与验收

Wrong answers must say they are wrong in the selected language, identify the relevant correct answer or reasoning, and show the distinction. Correct, incorrect, selected, disabled and unsubmitted states must differ through words and/or symbols as well as color. Silent recall remains a self-assessment rather than a fabricated objective score.

答错须以当前语言明确说明错误，指出相关正确答案或依据，并解释差异。答对、答错、选中、禁用和未提交状态除颜色外，还要通过文字或符号区分。静默回忆仍是自评，不变成虚构的客观评分。

Before calling the change complete:

宣布完成前：

1. Inspect Chinese and English practice, a lesson with wrong/right feedback, spread setup, card selection, reveal, interpretation, library and progress screens using isolated demo data. Check 320 px, 390 px and desktop layouts, long translations and zoomed text. / 使用隔离演示数据检查中英练习、课程对错反馈、选阵、选牌、翻牌、解读、牌库与进度；检查 320 px、390 px、桌面、长译文和文字放大。
2. Measure text contrast against its actual surface: ordinary text at least 4.5:1, applicable large text and essential component boundaries at least 3:1. A soft divider is decorative; strengthen focus, selection or control boundaries as needed. Check keyboard focus and touch targets. / 在实际背景上测量对比度：普通文字至少 4.5:1，适用的大字与必要控件边界至少 3:1；浅分隔线只作装饰，需要时加强焦点、选中或边界，并检查键盘焦点与触摸区域。
3. Check the printed back against its 180° rotation and inspect it at roughly 80–120 px wide. Confirm every back is identical and no face is clipped or stretched. / 对比牌背纹样与其 180° 旋转结果，再以约 80–120 px 宽检查；确认所有牌背一致、牌面未被裁切或拉伸。
4. Exercise normal and reduced motion, rapid taps, language switching, exits and resumed sessions. Verify the same selected cards, orientations, lesson progress and saved data. Record what was actually tested. / 实际操作正常及减少动态、快速点击、切语言、退出和恢复；核对选牌、正逆位、课程进度与存档一致，并记录实际测试范围。
5. Run the relevant checks discovered in the project tooling and the full `npm test` before a release. Validate the standalone build retains local artwork and no external runtime font or image dependency. / 按项目工具运行相关检查，发布前完整运行 `npm test`；确认单文件保留本地素材，未引入外部运行时字体或图片依赖。
6. Keep screenshot inspection, interaction checks, CI, deployment and real-device testing separate in the handoff. iPhone Safari, phone reboot persistence, long-term offline use and low-performance-device motion need their own evidence. / 在交接中分别记录截图观察、交互检查、CI、部署和实机测试；iPhone Safari、手机重启存储、长期离线及低性能设备动效需要独立证据。

This contract changes the presentation of the existing learning product. It does not claim full 78-card guided courses, proven memory scheduling, teacher review, native iOS materials or verified phone offline readiness.

本规范改变既有学习产品的呈现，不宣称已有 78 套深入单牌课、经验证的记忆调度、教师审核、原生 iOS 材质或手机离线验收。

## v1.0.0 behavior alignment / 行为对齐

Home has Learn/Draw only; Learn starts the saved or recommended card directly. Reference structures unfold in the library; Records keeps progress and offline tools. New seven-stage learning uses the same Moonlit tokens, explicit error/success, full verified faces, and one clear next action. The current behavioral contract is [PRODUCT_PLAN.md](../PRODUCT_PLAN.md), superseding earlier preview navigation references.

首页只保留学牌与抽牌，学习直接接续；基础知识在牌库展开，记录集中管理进度与离线。七步学习延续静光令牌、明确对错、完整历史牌面与清楚下一步。产品方案优先于旧预览导航描述。
