# Choose, remember, and read · 自主学牌与独立牌桌

[中文首页](../README.zh-CN.md) · [English](../README.md) · [Product plan / 完整方案](PRODUCT_PLAN.md)

## The job · 要完成的事

打开手机后，能选自己想学的牌，继续上次的位置，逐渐在没有提示时想起画面与含义；需要实际用牌时，进入一个完整、安静、有仪式感的牌桌。用户不需要先理解课程分类，也不需要反复输入。

Choose a card, continue where you stopped, and gradually recall its picture and meaning without prompts. When a reading is wanted, enter a separate, tactile card table. The core experience should not require typing or understanding a course taxonomy first.

## Why earlier versions fell short · 之前缺少什么

课程数量增加不等于学习自主。固定优先推荐星币四和高塔、把选牌藏在复杂入口里，让已有 78 套课程仍像重复样本。同样，多个文字选择题不等于多种认知动作；抽牌有一段动画，也不等于完整的洗牌、切牌、挑牌与揭晓体验。详情重建和旧缓存又会让改动无法顺畅到达用户。

More courses did not create learner agency. Hardcoded priorities and buried selection made 78 courses feel like repeated samples. Multiple text questions did not supply different cognitive actions. One shuffle animation did not create a complete ritual. Rebuilt detail sheets and stale cached releases further interrupted delivery and use.

## Learning contract · 学习体验

- **Choose deliberately.** Home keeps two main actions, Learn and Draw. Learning also exposes Choose a card, Learn a new card, and due Review when available. All 78 cards are selectable. New cards are sampled only from cards not yet started; Continue restores the exact active lesson. / 首页两条主线不变；学牌里明确自选、新学和到期复习。新学只挑未开始的牌，继续恢复原课。
- **Use different actions.** Real image choices build recognition; evidence questions and close meanings require distinctions; silent recall hides the answer; four-suit families reveal shared number or court patterns; a visible three-position table asks the learner to place a card and then explore changed roles. / 认图、找依据、近义辨析、静默回忆、四花色对照和可见牌阵采用不同动作。
- **Make difficulty defensible.** Wrong answers say so, explain the distinction, and retain the evidence. New sessions vary the presentation; old saved sessions retain their original question semantics. Review selects weaker or due skills. / 干扰项接近但能解释差异，答错明确；新轮次变化呈现，旧存档保持原题语义，回访关注薄弱与到期能力。
- **Leave a trace.** Records distinguish first lessons, ongoing cards, objective performance, self-assessment and delayed recall. Reading or favoriting a card never proves mastery. Switching cards preserves unfinished sessions. / 学习足迹与自评、客观表现和延迟回忆分开；读过、收藏不等于掌握；换牌不丢进度。
- **Keep references visible.** Learn has Cards, Foundations and Learn spreads. Number 1–10 can reveal all four real suit cards side by side. Worked one-, three- and six-card examples show actual cards and roles. / 牌库分为牌、基础知识与学牌阵；数字可切换四花色真牌，基础牌阵有实际牌面和位置。

These choices draw on [Duolingo's teaching method](https://blog.duolingo.com/duolingo-teaching-method/) and its explanation of [spaced repetition](https://blog.duolingo.com/spaced-repetition-for-learning/): active participation, feedback, short steps, and returning after a delay. Tarot Pocket does not use Duolingo's algorithms or claim their measured outcomes. Its scheduler remains the documented SM-2 adaptation in the product plan.

借鉴上述一手资料中的主动参与、反馈、小步学习与间隔再遇见；不复制品牌、课程或算法，也不声称已验证同等学习效果。本产品保留已说明的 SM-2 适配。

## Reading contract · 抽牌体验

The gallery contains **23 scenario spreads plus a daily tarot draw**. Love, work, study, life, self-reflection and choices are categories. Every spread has an original layout thumbnail, scope, limitations, all position questions and a reading order. The scenario determines its internal context; the interface has no extra wording-domain picker. The screenshots supplied as inspiration are not redistributed or copied into product artwork.

**23 个场景牌阵，加塔罗日运。** 感情、工作、学业、生活、自我与选择直接分类；先看原创布局缩略图、能力范围与全部位置，再决定使用。场景直接决定内部语境，不要求进入牌阵后再选“参考措辞”。参考截图不作为产品素材复用。

1. View the spread and inspect its positions. / 看阵，点位置。
2. Optionally write a private question, or hold it in mind. / 问题可写可默念。
3. Watch the layered shuffle; proceed when ready. / 观看交叠洗牌，准备好后继续。
4. Choose a cut pile. The saved pool rotates at that point without rerolling. / 选择切牌叠，移动既有牌序。
5. Pick from a fan of identical backs, without replacement. / 从统一牌背中挑牌，无放回。
6. Reveal the placed cards and read the actual spread. / 逐张翻牌，解读实际组合。

All phases have an exit and explicit resume. Normal motion and reduced-motion paths preserve the same cards. The daily draw is saved by the device's local calendar date; returning that day shows the same card. A new date allows a new daily draw. The daily module offers a reflection and one possible action, not a guaranteed prediction.

每步均可退出与恢复；正常、减少动态与跳过动画不改变同次结果。日签按设备本地日期保存，当天重开仍是同一张；新日期可抽新日签。内容是反思方向与可尝试行动，不是确定的现实预测。

The reading report uses actual cards, positions and their relationships. It contains no graded teaching task. Full single-card reference is optional and returns to the reading. Entered questions are escaped, stored locally and displayed back; the app does not semantically analyze free text or call an AI service.

解读按实际抽到的牌、牌位和关系组织，不混教学题。可选单牌资料看完返回；问题转义后本地保存，应用不解析自由文本、不调用 AI 服务。

## Continuity and delivery · 连续性与交付

Card detail orientation, position, favorite and read markers update within the same sheet. Zoom and comparisons return to the previous sheet, open sections and scroll position. Search retains its input node and focus. Filters and view tabs restore keyboard focus after rendering.

牌义正逆位、牌位、收藏与读过状态在原弹层内更新；放大和对比返回原展开状态与滚动位置。搜索保留输入焦点；筛选和分类重绘后恢复键盘焦点。

The three storage keys and version-1 backup envelope remain compatible. Optional daily/UI fields extend reading state. The dedicated [update page](https://georgelu-creator.github.io/tarot-pocket/update.html?lang=en) bypasses the old cache-first homepage, downloads and hashes a complete version, then switches only after the user chooses to enter it. It does not clear records or reload other active tabs. CSS and script revision queries prevent mixed-version resources.

三个存储键及版本 1 备份标识兼容，日签和 UI 是可选扩展字段。独立[更新页](https://georgelu-creator.github.io/tarot-pocket/update.html?lang=zh)绕过旧首页缓存，完整下载校验后再由用户选择进入，不清记录、不刷新其他正在使用的标签页。资源版本标识防止混装。

## Acceptance · 验收

`npm test` includes earlier regressions and the new learner-choice/reference checks, 14,040 learning configurations, 24 reading definitions, real timed shuffle/cut transforms, both languages, responsive layouts, Chromium/WebKit offline behavior and a real v1.0.0-to-current upgrade with synthetic records. Check [HANDOFF](HANDOFF.md) for the actual run and release status.

完整检查保留旧测试，新增自选与资料连续性、14,040 种学习配置、24 个抽牌定义、真实分时动画变换、中英、多宽度、双引擎离线及真实旧版升级。实际运行与发布状态见接力文档。

Physical iPhone use, low-performance-device animation quality, teacher review, and long-term learning outcomes remain separate acceptance work. No native app, account, cloud sync or third-party runtime service is added.

iPhone 实机、低性能设备动效、教师审校及长期学习效果仍需独立验收；不新增原生 App、账号、云同步或第三方运行服务。
