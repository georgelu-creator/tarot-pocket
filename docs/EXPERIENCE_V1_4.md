# v1.4 — Understand before answering / 先理解，再作答

## The problem / 这次解决什么

An obvious image-matching task can measure recognition while teaching very little.
A saved lesson also became the default Home action, so returning learners kept
seeing the same cards. Spread guides used too much vertical space, and optional
online readings asked for an unexplained access code.

看出三张大图的区别，不等于理解一张牌。原首页还优先继续未完成课程，让回来的
用户总遇到相同牌。牌阵说明纵向占位过大，联网解读要求的访问码也没有明确入口。

## The learning contract / 学习约定

Every new lesson uses one card through seven connected stages:

1. **Observe:** describe an action or relationship before seeing its interpretation.
2. **Reason:** choose between plausible explanations of that action; each option
   has feedback explaining the distinction.
3. **Understand:** use the element, number or court role as supporting context,
   then explain the connection before checking. Major Arcana do not use a numbered-minor formula.
4. **Distinguish:** mentally explain a nearby card's different action, then compare
   the images and reference explanation. This is explicitly self-assessment.
5. **Change position:** keep the card and question constant; read it first as an
   obstacle and then as advice in a visible three-position layout.
6. **Interpret a reversal:** use a concrete fictional background to distinguish
   possible mechanisms. Reversed cards are not literal opposites.
7. **Reconstruct:** hide the picture and hints; recall an action, its meaning and
   an application. An optional personal sentence stays in local progress.

新课七步保持同一张牌：先开放观察，再从动作推导含义；用元素、数字或宫廷角色
辅助理解；对照相似牌的最小差别；保持同一个问题，只把阻碍位换成建议位；用具体
背景判断逆位；最后遮住图与提示，用自己的话重建“画面—含义—应用”。不要求打字
或语音；个人记忆句是可选记录，不做自动评分。

All 78 cards have individually authored observation prompts, causal questions,
contextual reversal questions and reconstruction prompts. Existing card-specific
contexts supply the position exercise. Several position readings may fit, so this
stage uses self-assessment. A strong second attempt cannot erase first-position
difficulty. Understanding, comparison, application and recall are self-report;
causal and reversal choices have explicit contextual criteria. Retention is separate.

78 张牌均有独立编写的观察、因果推导、情境逆位与回忆引导；换位题复用既有逐牌
场景内容。换位可能有多种有效读法，不把其他合理建议硬判错；第二个位置的自评
不能抹去第一个位置的困难。理解、辨析、应用与回忆明确记录为自评；因果与逆位题
在给定情境下判对错。展开回忆线索只算辅助，不把一次答题当作长期掌握。

Home offers **Random new card** as the primary learning action. **Resume** and
**Choose a card** remain separate. Random exploration avoids cards already started
while unseen cards remain. Switching preserves unfinished sessions. Existing
v1–v3 sessions keep their semantics and offer an explicit switch to the new course.

首页主按钮是“随机学一张”，另设“接着上次”与“自己选牌”。还有未学牌时，随机
探索避开已经开始的牌；换牌保留未完成进度。旧课继续按旧规则恢复，也可明确切换新课。

## Reading stays separate / 抽牌独立

Spread guides show purpose, a compact actual layout and an immediately available
start button. Up to five cards show all position names on the diagram. Tapping a
position changes one explanation in place; the complete table and sources remain
available. The catalog and original position definitions are unchanged.

牌阵说明先展示用途、紧凑真实布局与开始按钮；五张及以下直接显示全部牌位名称。
点位置仅原位切换对应说明；完整牌位表和来源可展开。没有新增自造牌阵或修改牌位。

Online interpretation has a visible **AI connection code** form, with a direct
explanation of who supplies it. For self-hosting, it is the separate
`TAROT_AI_ACCESS_TOKEN`, never the provider API key. Empty codes are caught before
a request; authorization failures keep the field available for correction. Codes
remain in memory, outside backups and persistent browser storage.

联网解读直接显示“AI 连接码”表单并说明获取途径；自建服务使用独立的
`TAROT_AI_ACCESS_TOKEN`，不是 DeepSeek 密钥。空值先在本地提示，鉴权失败后可以
原位更正。连接码只留在本次打开的内存中，不加入持久存储或备份。

## Implementation and acceptance / 实现与验收

- Authored content: `guided-major.js`, `guided-minor.js` and matching English files.
- Presentation: `guided-learning.js`, `guided-learning.css`, integrated by `journey.js`.
- Compatibility: existing three storage keys, scheduler and backup format remain;
  the optional session version is 4, with bounded per-stage state and personal notes.
- Current checks: `tools/check_guided_v14.cjs` and
  `tools/check_reading_connect_v14.cjs`; older course checks restore explicit legacy
  fixtures rather than changing their expected behavior.
- Learning remains offline and authored. It is not a live AI tutor. This release
  does not change the server prompt, access policy or provider settings.
- Browser checks do not establish independent teacher approval, long-term learning
  gains, or physical iPhone offline readiness.

原创内容、英文、运行逻辑与回归检查均随源码接力。沿用存储键、调度及备份格式；
新增有边界的分步状态与个人记忆句。离线课程不是实时 AI 导师；服务端提示、权限和
模型配置本轮不改。浏览器检查也不等于教师审核、长期记忆效果或 iPhone 实机验收。

Existing educational references and attribution remain in
[the product plan](PRODUCT_PLAN.md) and [spread sources](SPREAD_SOURCES.md).
No private conversation, learning record or credential is included in this document.
