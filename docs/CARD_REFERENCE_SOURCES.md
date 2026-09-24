# 78 张牌独立参考资料

本资料对应 `card-reference.js` 的 `reference-1`。中文原创，采用既有稳定牌 ID，作为牌库与本地解读共享的参考。课程保留重点讲解与练习，牌库另提供正逆位解释、场景应用、牌位读法、误读与近似牌区别。本轮为作者编辑与自动覆盖检查，尚不宣称独立塔罗教师审校或真实学习效果验证。

## 来源与使用边界

- A. E. Waite, *The Pictorial Key to the Tarot*, Parts II–III：[公版原著目录](https://sacred-texts.com/tarot/pkt)。该书作为 RWS 图像与历史牌义的参考；图片继续使用 `assets/manifest.json` 已核验版本。现代场景应用、逆位解释和默认 Yes/No 倾向是本项目原创编辑，不声称逐字复现 Waite 的预测表。
- [塔罗中国首页](https://www.tarotchina.net/)与[星币六公开资料页](https://www.tarotchina.net/suit-of-pentacles6/)：本轮实际打开。借鉴其分开组织画面、正逆位、领域与牌位的资料结构，不复制其长文、预测断语或图像。该页部分条目带有确定的复合、收入与未来判断，未直接采用；部分图像细节也不作未经核对的依据。
- 本仓库 `reading-deck.js`、`card-notes.js`、`curriculum-content.js` 与 `content.js`：保留已经原创编写的基本含义、图像、情境例子与近似牌比较，在独立牌库中补写每张牌的正逆位解释段、暗语、趋势、现实调整与误读。未把练习题反馈当成参考正文。

## 编辑规则

- 每张正位解释说明图像、动作或核心概念如何形成含义；逆位解释说明具体的过度、受阻、内化、恢复或退出状态，不能机械地解释为正位反义词。
- 感情、工作、学业与生活分开呈现；资源位不偷偷套用学习场景，未知因素不假称读出别人内心。
- 过去位解释既有影响，现状位描述当前主题，建议位给行动，趋势/结果位描述维持当前方式的发展倾向，选择位解释该路径的表现。无牌阵三张不新增过去现在未来角色。
- `yesNo` 是心中问题未输入时的象征性默认倾向，`yesNoReason` 给出该牌依据；具体问题仍由解读层按命题方向处理。太阳逆位保留偏 Yes，宝剑四正位偏 No/暂缓，避免按正逆位投票。倾向不代表现实结果的统计概率或保证。
- 资料不用于诊断、法律裁决、预测死亡、指认第三者或编造确定日期。界面只在有实际需要处保留边界，不在每段插入相同提醒。

## 数据与验收

`window.TAROT_CARD_REFERENCE.byId[id]` 包含 `core`、`observation`、`symbols`、`misread`、`comparison`。`upright` / `reversed` 各含 `message`、`meaning[]`、`roles`、`contexts`、`yesNo`、`yesNoReason`。`contexts` 值为段落数组，消费者不能直接把数组当单段对象。

专项检查：`node tools/check_card_reference.cjs` 校验 78 张完整性、156 条独立暗语、两种方向的解释、全部场景/牌位、有效比较目标与非正逆位投票示例。`node tools/check_dossier_v13.cjs` 在浏览器中遍历 78 张真实图片、四个应用领域与完整牌位，并检查切换方向后章节仍打开、中文兼容与 320–1280px 溢出。
