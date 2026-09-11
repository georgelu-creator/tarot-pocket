# Contributing · 贡献指南

[English README](README.md) · [中文首页](README.zh-CN.md) · [Development / 开发](docs/DEVELOPMENT.md)

Help a learner understand one card more clearly. Good contributions include a confusing interaction, a better distractor, a corrected translation, a reviewed lesson, a provenance correction, or an accessibility improvement.

帮助学习者更清楚地理解一张牌，就是有价值的贡献。可以是交互问题、更好的干扰项、翻译修订、审核过的课程、素材来源纠正或无障碍改进。

## Start with a specific problem · 从具体问题开始

Use the [issue templates](https://github.com/georgelu-creator/tarot-pocket/issues/new/choose). Search existing issues first. A small correction can come directly as a focused pull request; discuss broad curriculum changes, storage migrations, dependencies, or delivery changes before implementing them.

使用问题模板，先搜索是否已有相同反馈。小修正可以直接提一个范围清楚的 PR；完整课程扩展、存储迁移、新依赖或发行方式调整，请先讨论目标。

Describe the current behavior, the expected learning outcome, and the evidence for the change. A factual mistake, a translation mismatch, and a defensible interpretation from another tradition are different kinds of feedback.

说明当前行为、期望的学习效果，以及修改依据。事实错误、翻译偏差、另一流派中有依据的解读，是不同类型的问题，请分别说明。

## A focused pull request · 提交一次清楚的改动

1. Fork or clone the repository and create a task branch. / Fork 或克隆仓库，建立任务分支。
2. Follow [Development](docs/DEVELOPMENT.md); edit source files, not the generated standalone HTML. / 按开发指南准备环境，修改源文件，不直接改生成的独立 HTML。
3. Keep both languages aligned and preserve stable IDs and backup compatibility. / 同步两种语言，保留稳定 ID 与旧备份兼容。
4. Run relevant checks; run the complete required checks before release. Report any checks not run and why. / 运行相关检查，发布前完成必要检查；未运行的项目说明原因。
5. Open a PR explaining the learner-facing change and validation. Add screenshots for a visible change, using clean demo data. / 在 PR 中说明用户能感受到的变化与验证结果，界面改动提供使用干净演示数据的截图。

Do not weaken a test to make an unrelated failure disappear. Separate a pre-existing failure from a regression introduced by the change.

不要为消除无关失败而削弱测试；已有失败与本次引入的问题分别记录。

## Questions should be difficult for the right reason · 难度要来自理解

A useful question states its card, topic, spread position, and relevant situation. Its answer follows from that context. Distractors should reflect nearby meanings or common reasoning mistakes, with an explanation of the exact difference.

有价值的题目交代卡牌、主题、牌位与必要情境；答案由这些条件支持。干扰项来自接近的含义或常见推理错误，并说明具体差别。

If more than one option is equally supportable, refine the prompt, accept the alternatives, or acknowledge missing information. Do not label a reasonable reading wrong merely to increase difficulty. Keep visual facts separate from interpretation and from unsupported predictions.

若多个选项同样成立，应完善题干、接受多种答案或指出信息不足，不要为了更难而把合理解读判错。画面事实、解释与没有依据的预测需要分开。

Quiet recall is self-assessment. Passing an immediate multiple-choice question does not establish long-term mastery. Free readings are not scored as true or false statements about a person's future.

静默回忆是自评；即时选对不等于长期掌握；自由抽牌不按现实预测真假评分。

## Translation · 翻译

Translate the teaching intention, not only the words. Preserve the same correct option, strength of evidence, uncertainty, and closeness of distractors. Include headings, buttons, feedback, position names, and accessibility labels. Do not translate IDs, storage keys, or backup markers.

翻译需保留教学意图，而非仅替换词语。正确选项、证据强度、不确定性和干扰项的接近程度应一致，覆盖标题、按钮、反馈、牌位和无障碍标签。不要翻译 ID、存储 key 或备份标记。

## Artwork and attribution · 牌图与署名

Use the existing historical Pam-A deck. An image contribution must include its exact source page, visual edition, rights statement, original file, reason for replacement, hash changes, and a visual comparison. A matching filename alone does not establish identity. Do not mix in modern commercial redraws or generated substitutes.

沿用现有历史 Pam-A 牌组。图片贡献应提供准确来源页、视觉版本、权利声明、原图、替换理由、哈希变化与视觉对照，不能只凭文件名判断身份；不要混入现代商业重绘或生成式替代图。

Contribute only material you can share under the relevant project license: [MIT](LICENSE) for code and tooling, [CC BY-SA 4.0](CONTENT_LICENSE.md) for original content and documentation, and the separate [artwork notice](ARTWORK_LICENSE.md) for images. Preserve third-party attribution. Mark adapted material and its source.

只贡献你有权按对应许可分享的内容：代码与工具使用 MIT，原创内容与文档使用 CC BY-SA 4.0，图片单独遵循牌图权利说明。保留第三方署名，注明改编内容及来源。

## Keep personal records private · 私人记录不进入仓库

Use invented scenarios and minimal synthetic backups when reproducing a problem. Do not attach personal reading exports, private conversations, credentials, or screenshots containing identifying information. See [Security](SECURITY.md) for security reports and the [Code of Conduct](CODE_OF_CONDUCT.md) for community expectations.

复现问题时使用虚构情境与最小合成备份，不要上传私人抽牌导出、对话、凭据或含身份信息的截图。安全问题见安全说明，交流约定见社区准则。
