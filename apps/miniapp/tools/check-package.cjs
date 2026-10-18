// Verify the public cultural edition's real compiled routes, dependency boundary and size.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'../dist/build/mp-weixin'),config=JSON.parse(fs.readFileSync(path.join(root,'app.json')));
assert.deepEqual(config.pages,['pages/mengyu/home','pages/mengyu/learn','pages/mengyu/library']);
assert.deepEqual(config.tabBar.list.map(item=>item.text),['首页','学习','图鉴']);
const packs=config.subPackages||config.subpackages||[];
assert.equal(packs.length,1);assert.equal(packs[0].root,'pages/artwork');assert.deepEqual(packs[0].pages,['index']);
const sizes={main:0};for(const pack of packs)sizes[pack.root]=0;
const scripts=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else{const rel=path.relative(root,file).split(path.sep).join('/'),pack=packs.find(p=>rel.startsWith(p.root+'/'));sizes[pack?.root||'main']+=fs.statSync(file).size;if(rel.endsWith('.js'))scripts.push(fs.readFileSync(file,'utf8'));assert(!/^pages\/(draw|home|learn|library|card)\//.test(rel),'Retired public page leaked: '+rel);}}}
walk(root);for(const [name,bytes]of Object.entries(sizes))assert(bytes<2*1024*1024,name+' exceeds 2 MiB: '+bytes);assert(Object.values(sizes).reduce((a,b)=>a+b,0)<20*1024*1024);
const joined=scripts.join('\n');
for(const forbidden of ['offlineReading','dailyDisplay','reading-day-changed','tarot-miniapp-reading-v1','/api/reading','pages/draw/index','reversedBranches','ai-request'])assert(!joined.includes(forbidden),'Retired predictive dependency leaked: '+forbidden);
const sandbox={window:{}};vm.createContext(sandbox);const repo=path.resolve(__dirname,'../../..');for(const name of ['reading-deck.js','card-reference.js','card-knowledge.js'])vm.runInContext(fs.readFileSync(path.join(repo,name),'utf8'),sandbox);
const compiled=require(path.join(root,'core/generated/mengyu.js'));
assert.equal(compiled.cards.length,78);assert.equal(new Set(compiled.cards.map(c=>c.id)).size,78);assert.equal(compiled.provenance.sources.length,78);
for(const c of compiled.cards){const original=sandbox.window.TAROT_CARD_REFERENCE.byId[c.id];assert.equal(c.observation,original.observation);assert.deepEqual(c.symbols,JSON.parse(JSON.stringify(original.symbols.map(s=>({label:s.detail,meaning:s.meaning})))));assert.equal(c.foundation.text,sandbox.window.TAROT_CARD_KNOWLEDGE.byId[c.id].learning.foundation.text);assert.equal(c.core,sandbox.window.TAROT_READING_DECK.cards.find(card=>card.id===c.id).core,c.id+' standalone authored theme');assert(!/占卜|预测|运势|日运|牌阵|正位|逆位|解牌|解读|建议位|牌位|旁边的牌|抽到/.test(JSON.stringify(c)),c.id+' culture projection contains unrelated service content');}
assert(!compiled.cards.find(c=>c.id==='m16').core.includes('建议位'),'High Tower must not teach a reading position');
assert(!compiled.cards.find(c=>c.id==='m17').core.includes('旁边的牌'),'Star must not require a spread or companion card');
assert(joined.includes('mengyu-image-learning-v1'));assert(joined.includes('历史塔罗卡牌'),'Artwork origins must remain transparent');
console.log('PASS compiled Mengyu WeChat package: '+JSON.stringify(sizes)+' bytes; 78 visual records, truthful provenance, three cultural roots, artwork detail subpackage; no retired drawing/fortune/AI engines or routes. Native upload/review remains separate.');
