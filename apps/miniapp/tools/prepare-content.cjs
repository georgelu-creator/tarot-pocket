/* Build-time bridge: original authored catalogs and pure engines stay authoritative. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const out = path.resolve(__dirname, '../src/core/generated');
fs.mkdirSync(out, {recursive: true});
const sandbox = {window: {}};
vm.createContext(sandbox);
const sources = ['reading-deck.js','card-reference.js','spread-content.js','reading-scenarios.js','academy-content.js','daily-content.js'];
for (const name of sources) vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), sandbox, {filename: name});
function chinese(value) {
  if (Array.isArray(value)) return value.map(chinese);
  if (!value || typeof value !== 'object') return value;
  // Keep the zh envelope because the shared teaching engine accesses title.zh.
  if (Object.hasOwn(value, 'zh') && Object.hasOwn(value, 'en')) return {zh: value.zh};
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'en').map(([key,v]) => [key,chinese(v)]));
}
const names = {deck:'TAROT_READING_DECK',reference:'TAROT_CARD_REFERENCE',spreadContent:'TAROT_SPREAD_CONTENT',scenarios:'TAROT_READING_SCENARIOS',academyContent:'TAROT_ACADEMY_CONTENT',daily:'TAROT_DAILY_GUIDANCE'};
let bundle = '// Generated from the shared authored sources. Do not edit.\n';
for (const [name,key] of Object.entries(names)) bundle += `export const ${name} = ${JSON.stringify(chinese(sandbox.window[key]))};\n`;
fs.writeFileSync(path.join(out,'content.mjs'), bundle);
const originalAcademy = fs.readFileSync(path.join(root,'academy.js'),'utf8');
const start = originalAcademy.indexOf('  const DAY=');
const end = originalAcademy.indexOf('  function create(bridge)');
if (start < 0 || end < start) throw Error('Shared academy extraction boundaries changed');
fs.writeFileSync(path.join(out,'academy.mjs'), `// Generated pure engine; source: academy.js\nimport {academyContent as source} from './content.mjs';\nconst units=Object.fromEntries([...source.lessons,...source.cards].map(u=>[u.id,u]));\n${originalAcademy.slice(start,end)}\nexport const academy={practiceVariants,guidedQueue,courseRoute,stageNext,skillState,blank,validate,planFor,stepFor:currentStep,answer,advance,masteryState,cardPath:[...CARD_PATH],units,version};\n`);
const originalReading=fs.readFileSync(path.join(root,'offline-reading.js'),'utf8');
const marker="  const VERSION = '";
const readStart=originalReading.indexOf(marker);
const readEnd=originalReading.lastIndexOf('\n});');
if (readStart < 0 || readEnd < readStart) throw Error('Shared reading extraction boundaries changed');
fs.writeFileSync(path.join(out,'reading.mjs'), `// Generated pure engine; source: offline-reading.js\nimport {deck,spreadContent,reference} from './content.mjs';\nconst root={TAROT_READING_DECK:deck,TAROT_SPREAD_CONTENT:spreadContent,TAROT_CARD_REFERENCE:reference};\nexport const offlineReading=(function(){\n${originalReading.slice(readStart,readEnd)}\n})();\n`);
const hashes=Object.fromEntries([...sources,'academy.js','offline-reading.js'].map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')]));
fs.writeFileSync(path.join(out,'sources.json'),JSON.stringify(hashes,null,2)+'\n');
console.log('Shared Chinese content generated: 78 cards, 20 methods, existing spread and interpretation engines.');
