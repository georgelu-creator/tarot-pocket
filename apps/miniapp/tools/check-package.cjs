// Verify actual generated WeChat package boundaries, without excluding runtime files.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm'),{isDeepStrictEqual}=require('node:util');
const root=path.resolve(__dirname,'../dist/build/mp-weixin'),config=JSON.parse(fs.readFileSync(path.join(root,'app.json')));
assert.deepEqual(config.pages,['pages/home/index','pages/learn/index','pages/draw/index','pages/library/index']);
assert.deepEqual(config.tabBar.list.map(item=>item.text),['首页','抽牌','学牌','牌库']);
assert.deepEqual(config.tabBar.list.map(item=>item.pagePath),['pages/home/index','pages/draw/index','pages/learn/index','pages/library/index']);
const brand=JSON.parse(fs.readFileSync(path.join(root,'pages/home/index.json')));assert.equal(brand.navigationBarTitleText,'秘境梦屿');
const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../src/manifest.json')));assert.equal(manifest.name,'秘境梦屿');assert.equal(manifest.versionName,'0.5.2');assert.equal(manifest.versionCode,'502');
const packageInfo=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../package.json')));assert.equal(packageInfo.version,manifest.versionName);
const packs=config.subPackages||config.subpackages||[];
assert.equal(packs.length,1);assert.equal(packs[0].root,'pages/card');
assert.deepEqual(packs[0].pages,['index']);
assert(!config.pages.includes('pages/card/index'));
const scripts=[];
const sizes={main:0};for(const pack of packs)sizes[pack.root]=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else{const rel=path.relative(root,file).split(path.sep).join('/'),pack=packs.find(p=>rel.startsWith(p.root+'/'));sizes[pack?.root||'main']+=fs.statSync(file).size;if(rel.endsWith('.js'))scripts.push(fs.readFileSync(file,'utf8'));assert(!/^pages\/(mengyu|artwork)\//.test(rel),'Historical cultural routes must not become an alternate public profile: '+rel);}}}
walk(root);
// WXSS rejects universal selectors even when browser CSS and Vite accept them.
const postcss=require('postcss');
function checkStyles(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())checkStyles(file);else if(file.endsWith('.wxss'))postcss.parse(fs.readFileSync(file,'utf8'),{from:file}).walkRules(rule=>assert(!/(?:^|[\s,>+~])\*(?=[.#[\s:>+~]|$)/.test(rule.selector),'WXSS-incompatible universal selector in '+path.relative(root,file)+': '+rule.selector));}}
checkStyles(root);
// Custom components reject tag selectors even when page-level WXSS permits them.
const navigationStyles=fs.readFileSync(path.join(root,'components/FloatingNavigation.wxss'),'utf8');
assert(navigationStyles.includes('.floating-nav-icon'),'Navigation icons retain their explicit component class');
postcss.parse(navigationStyles).walkRules(rule=>assert(!/(?:^|[\s,>+~])(?:image|text|view|button)(?=[.#\s:>+~]|$)/.test(rule.selector),'Tag selector in navigation component: '+rule.selector));
for(const [name,bytes]of Object.entries(sizes))assert(bytes<2*1024*1024,name+' exceeds 2 MiB: '+bytes);
assert(Object.values(sizes).reduce((a,b)=>a+b,0)<20*1024*1024);
const content=fs.readFileSync(path.join(root,'core/generated/content.js'),'utf8');
assert(!content.includes('reversedBranches'),'Full reference leaked into the main content bundle');
const joined=scripts.join('\n');for(const forbidden of ['pages/mengyu/','pages/artwork/','auditMode','reviewMode','isAudit','isReview','enableAudit','showAudit','文化版开关','审核开关'])assert(!joined.includes(forbidden),'Hidden alternate profile/audit switch: '+forbidden);
const repo=path.resolve(__dirname,'../../..'),scope={window:{}};vm.createContext(scope);for(const name of ['reading-deck.js','reading-scenarios.js','academy-content.js','spread-content.js'])vm.runInContext(fs.readFileSync(path.join(repo,name),'utf8'),scope);
function chinese(value){if(Array.isArray(value))return Array.from(value,chinese);if(!value||typeof value!=='object')return value;if(Object.hasOwn(value,'zh')&&Object.hasOwn(value,'en'))return {zh:value.zh};return Object.fromEntries(Object.entries(value).filter(([key])=>key!=='en').map(([key,v])=>[key,chinese(v)]));}
const bundled=require(path.join(root,'core/generated/content.js'));
// Rollup removes unused catalog wrappers (deck.sources/version, academy source
// metadata, and the spread directory's category/guide metadata). Runtime consumes
// deck.cards, academy version/lessons/cards and spreadContent.spreads; compare each
// of those full authored records, rather than requiring unused wrappers to ship.
function assertRecords(actual,expected,label){
 assert(Array.isArray(actual),label+' must be an array');assert.equal(actual.length,expected.length,label+' record count');
 assert.deepEqual(actual.map(item=>item.id),expected.map(item=>item.id),label+' stable IDs and authored order');
 for(let i=0;i<expected.length;i++)assert(isDeepStrictEqual(actual[i],expected[i]),label+' '+expected[i].id+' differs from its complete authored record');
}
assert.equal(bundled.deck.cards.length,78);assertRecords(bundled.deck.cards,chinese(scope.window.TAROT_READING_DECK.cards),'Compiled card');
assert.equal(bundled.scenarios.length,40);assertRecords(bundled.scenarios,chinese(scope.window.TAROT_READING_SCENARIOS),'Compiled scene');
assert.equal(bundled.academyContent.lessons.length,20);assert.equal(bundled.academyContent.cards.length,78);
assert.equal(bundled.academyContent.version,scope.window.TAROT_ACADEMY_CONTENT.version);
assertRecords(bundled.academyContent.lessons,chinese(scope.window.TAROT_ACADEMY_CONTENT.lessons),'Compiled method lesson');
assertRecords(bundled.academyContent.cards,chinese(scope.window.TAROT_ACADEMY_CONTENT.cards),'Compiled card lesson');
assertRecords(bundled.spreadContent.spreads,chinese(scope.window.TAROT_SPREAD_CONTENT.spreads),'Compiled spread');
const article=fs.readFileSync(path.join(root,'pages/card/generated/knowledge.js'),'utf8');
assert(article.includes('reversedBranches'),'Full reference is absent from its subpackage');
const sourceRoot=path.resolve(__dirname,'../../../content/card-knowledge');
const expected=Object.assign({},...['major.json','wands-cups.json','swords-pentacles.json'].map(name=>JSON.parse(fs.readFileSync(path.join(sourceRoot,name),'utf8'))));
const compiled=require(path.join(root,'pages/card/generated/knowledge.js')).knowledge.byId;
assert.equal(Object.keys(compiled).length,78,'The card subpackage must retain all 78 articles');
assert.deepEqual(compiled,expected,'Compiled card articles differ from their authored source');
console.log('PASS generated WeChat package: '+JSON.stringify(sizes)+' bytes; Mengyu 0.5.2 four public tabs, all 40 scenes/20 methods/78 card lessons, complete articles in card subpackage, shared short course excerpts in main, no cultural or audit profile switch. Platform upload size validation remains separate.');
