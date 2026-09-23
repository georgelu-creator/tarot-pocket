# Tarot Pocket contributor and agent guide / 项目协作入口

## Current scope / 当前授权（2026-09-24）

The user explicitly authorized implementing the complete learning and reading
plans, publishing to Git and providing a mobile test entry. The subsequent user
decision permits replacing the older interaction framework with a more usable
design. Earlier documentation-only scope statements below are historical and
superseded. Preserve records and security boundaries, not obsolete UI controls.
Read docs/RELEASE_1_9.md and both master documents' implementation records first.

The v1.9 public product is Chinese-only. Hide language switching and make an old
`lang=en` link fall back to Chinese, while preserving stable IDs, storage and old
records. Keep legacy English catalogs as non-public compatibility/reference data;
new visible product work is authored and accepted in Chinese for this release.
Learning and the separate 78-card library are the primary experience. Every card
must show its authored explanation before assessment; the default local reading
must use the question, card meanings, spread positions and orientations rather
than orientation voting or hidden roles.

用户最新已授权完整开发学牌与抽牌、Git 发布和移动端体验，并允许升级旧交互框架。
此前仅文档的限制已被替代。保留数据与安全边界，不必保留被否定的旧交互。
开发、自动检查、生产部署、真人试用和教学效果仍是不同状态。

This public repository is the project source. Start with README.md, then
docs/HANDOFF.md and docs/DEVELOPMENT.md. Personal assistant configuration, private
conversations, personal readings, credentials and browser backups do not belong here.

- Learning-design work starts with [docs/LEARNING_MASTER.md](docs/LEARNING_MASTER.md):
  read its current status and latest changes before the relevant lesson/card scripts.
  Update effective requirements, affected bilingual scripts, superseded decisions,
  coverage and open questions before closing any related change; then update HANDOFF.
  Distinguish proposed, confirmed, authored, verified and implemented. The existing
  app is historical implementation, not acceptance of the new teaching design.
  Implementation is authorized by the latest user decision; retain teaching review
  and real-user acceptance as separate evidence. / 教学主文档是新课程的接力入口；相关需求变化须同步
  有效正文、受影响脚本、被替代决定、覆盖与待确认事项，再更新交接。旧应用不等于
  新教学方案已确认或完成；本轮已获开发授权，仍须分别记录教学与实机验收。
- Reading-design work starts with [docs/READING_MASTER.md](docs/READING_MASTER.md):
  read current status, open decisions and latest changes before flow, scenario or AI
  scripts. Keep effective requirements, bilingual copy, superseded decisions,
  evidence, coverage and handoff synchronized. Proposed, confirmed, authored,
  verified and implemented are distinct. The old app is not acceptance of this new
  design. Implementation is authorized; preserve the reasons behind superseded
  proposals and verify the new experience. / 抽牌主文档独立于教学维护；恢复时
  先读状态、待确认与最新变更，相关变动同步有效正文、双语脚本、覆盖和交接。
  “78张可选到”不等于必须平铺，“有仪式感”不等于反复点继续。页面和解读只对
  抽牌者说自然中文，不混入作者指令。本轮已获开发授权，旧实现不代表新方案已通过。
- Learners are the only audience of learning screens. Keep author instructions,
  scoring logic, routing, IDs and acceptance criteria out of teaching copy, questions,
  choices, feedback, hints and completion messages. Write natural Chinese directly;
  do not introduce an unnecessary abstract term and then explain it. Retain necessary
  tarot terms with a brief first-use explanation. No self-ratings, confidence scores,
  mandatory reflections or renamed equivalents. / 学牌只面向学习者：内部编写、评分、
  路由和验收说明不能进入展示文案；直接说自然中文，不先抛抽象词再解释。
  只解释确实需要学的塔罗术语；不增加自评、信心打分、必填感悟或换名同类步骤。
- Keep the working demo usable. Product changes should follow user feedback; do not
  treat the roadmap as permission to build the entire app or publish to app stores.
- Chinese is the authored and public interface language for v1.9. Do not add a
  visible English entry. Preserve existing English catalogs and stable card/question
  IDs, data attributes and stored identifiers; a later bilingual release requires a
  separate copy and UI acceptance pass.
- Keep the three existing learning/reading storage keys and JSON backup compatibility.
  Never publish actual user progress. Tests use isolated browser contexts.
- Use only verified historical artwork from assets/manifest.json. Do not replace
  missing images with another edition, generated artwork, or commercial redraws.
- Verify a change with the relevant checks. Before a release, run npm test in full.
  Test failures must be investigated, not bypassed. Offline learning, drawing and
  standalone files have no third-party requests or account requirement. The hosted
  site may send only documented first-party anonymous product events; never send
  questions, cards or learning records. Optional online
  interpretation requires an explicit user action; provider keys stay server-side.
  Never replace a failed AI response with an offline reference labelled as AI.
- Use focused branches and pull requests. Do not force-push, rewrite history, or
  discard another device's uncommitted work. Update docs/HANDOFF.md with actual
  completed work, verification, blockers, and the next useful step before handing off.
- Do not claim real iPhone offline readiness, long-term retention effectiveness,
  complete 78-card guided courses, or teacher review without evidence.
- Code: MIT. Authored content/docs/translations: CC BY-SA 4.0. Artwork: separate
  provenance. Do not copy private Forge/Abi materials into this repository.

中文：先读 README.zh-CN.md、docs/HANDOFF.md 与开发说明。源码通过 Git 接力，
个人进度另行导出，不上传公开仓库。本期公开界面只提供中文，保持稳定 ID 和存档兼容。
按真实验证结果交接，不把路线图、图片齐全或 CI 通过说成完整产品已经验收。
