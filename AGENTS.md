# Tarot Pocket contributor and agent guide / 项目协作入口

This public repository is the project source. Start with README.md, then
docs/HANDOFF.md and docs/DEVELOPMENT.md. Personal assistant configuration, private
conversations, personal readings, credentials and browser backups do not belong here.

- Keep the working demo usable. Product changes should follow user feedback; do not
  treat the roadmap as permission to build the entire app or publish to app stores.
- Chinese is the authored source language. Update matching English translations in
  locales/en-*.json when changing displayed text. i18n.js translates presentation;
  do not translate stable card/question IDs, data attributes, or stored identifiers.
- Keep the three existing learning/reading storage keys and JSON backup compatibility.
  Never publish actual user progress. Tests use isolated browser contexts.
- Use only verified historical artwork from assets/manifest.json. Do not replace
  missing images with another edition, generated artwork, or commercial redraws.
- Verify a change with the relevant checks. Before a release, run npm test in full.
  Test failures must be investigated, not bypassed. Offline learning and drawing
  have no third-party requests, account requirement, or analytics. Optional online
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
个人进度另行导出，不上传公开仓库。修改中文同时更新英文，保持稳定 ID 和存档兼容。
按真实验证结果交接，不把路线图、图片齐全或 CI 通过说成完整产品已经验收。
