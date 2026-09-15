const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),han=/[\u3400-\u9fff]/;
const files=['content.js','learning-content.js','spread-content.js','reading-deck.js','daily-content.js','curriculum-content.js','guided-major.js','guided-minor.js'];
const dict=Object.assign({},...fs.readdirSync(path.join(root,'locales')).filter(n=>/^en-.*\.json$/.test(n)).sort().map(n=>JSON.parse(fs.readFileSync(path.join(root,'locales',n),'utf8'))));
const source=new Set();
function walk(v){if(typeof v==='string'&&han.test(v))source.add(v);else if(v&&typeof v==='object')Object.values(v).forEach(walk);}
const context={window:{}};
for(const file of files){vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);walk(context.window);}
const missing=[...source].filter(s=>!Object.hasOwn(dict,s));
assert.deepEqual(missing,[],'Every authored content string needs an English entry');
for(const [zh,en]of Object.entries(dict)){assert.equal(typeof en,'string');assert(en.trim()&&!han.test(en),`Invalid English translation: ${zh}`);}
console.log(JSON.stringify({status:'PASS',contentStrings:source.size,englishEntries:Object.keys(dict).length}));
