'use strict';

// AI-only cloud build: no Python, artwork copying, frontend bundle or secrets.
const fs = require('node:fs');
const path = require('node:path');
const {loadCatalog} = require('../server/reading-service.cjs');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.edgeone-ai');
const catalog = loadCatalog(root);
const data = {cards: [...catalog.cards.values()], spreads: [...catalog.spreads.values()], scenarios: [...catalog.scenarios.values()]};
fs.mkdirSync(path.join(output, 'public'), {recursive: true});
// Static import allows the platform bundler to include data without relying on
// the deployed function's cwd, VM execution, includeFiles or remote downloads.
fs.writeFileSync(path.join(output, 'catalog.cjs'), `'use strict';\nmodule.exports = ${JSON.stringify(data)};\n`);
fs.writeFileSync(path.join(output, 'public', 'index.html'), `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>Tarot Pocket · AI Service</title><style>body{font:17px/1.7 system-ui;max-width:40rem;margin:12vh auto;padding:1.5rem;color:#60465c;background:#f6f1e9}a{color:inherit}</style>
<h1>Tarot Pocket</h1><p>Online interpretation service · 在线解读服务</p>
<p>This endpoint serves the optional reading service. Use the Tarot Pocket application to draw cards and request an interpretation.</p>
<p>这里提供可选的联网解读服务，请在塔罗随身学中抽牌并发起解读。</p>
<p><a href="https://georgelu-creator.github.io/tarot-pocket/?lang=zh">打开塔罗随身学 · Open Tarot Pocket</a></p>
</html>\n`);
process.stdout.write(`EdgeOne AI build: ${data.cards.length} cards, ${data.spreads.length} spreads; static output .edgeone-ai/public.\n`);
