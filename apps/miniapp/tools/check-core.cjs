const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const cp = require('node:child_process');
const base = path.resolve(__dirname, '..');
cp.execFileSync(process.execPath, [path.join(__dirname,'prepare-content.cjs')], {stdio:'inherit'});
(async () => {
 const imp = name => import(pathToFileURL(path.join(base,'src/core/generated',name)).href);
 const {deck,reference,knowledge,spreadContent,scenarios} = await imp('content.mjs');
 const {academy} = await imp('academy.mjs');
 const {offlineReading} = await imp('reading.mjs');
 assert.equal(deck.cards.length,78); assert.equal(new Set(deck.cards.map(c=>c.id)).size,78);
 assert.equal(academy.cardPath.length,78);
 const artwork=JSON.parse(fs.readFileSync(path.join(base,'src/core/artwork.json')));
 for(const card of deck.cards) {
   assert.ok(artwork[card.id]); assert.ok(reference.byId[card.id]);
   assert.ok(knowledge.byId[card.id]);
   for(const mode of ['foundation','application','integration']) {
    const data=academy.blank();data.session={unitId:card.id,mode,index:0,startedAt:1,seed:1,contentVersion:academy.version,answers:{},support:null,hint:false,complete:false,lang:'zh'};
    let steps=0;
    while(!data.session.complete) {
     const step=academy.stepFor(data.session);assert.ok(step,card.id+' '+mode);
     if(step.kind==='teach'&&!step.support)assert.ok(academy.knowledgeLesson(knowledge,card.id,step)?.text,card.id+' '+mode+' has matching knowledge');
     if(step.kind==='question') {assert.equal(academy.advance(data,1000),false); assert.equal(academy.answer(data,step.question.correct,1000),true);}
     assert.equal(academy.advance(data,1000),true); assert.ok(++steps<30);
    }
    assert.ok(academy.validate(JSON.parse(JSON.stringify(data))).session.complete);
   }
 }
 const activeIds=new Set(scenarios.map(s=>s.spreadId));activeIds.add('daily');
 for(const spread of spreadContent.spreads.filter(s=>activeIds.has(s.id))) {
  for(const reversed of [false,true]) {
   const result=offlineReading.interpret({spreadId:spread.id,topic:'general',question:'',language:'zh',cards:spread.positions.map((p,i)=>({id:deck.cards[i].id,reversed,positionId:p.id}))});
   assert.equal(result.source,'offline');assert.equal(result.isAI,false);assert.equal(result.positions.length,spread.positions.length,spread.id);assert.ok(result.overview.text);
  }
 }
 const pages=JSON.parse(fs.readFileSync(path.join(base,'src/pages.json')));
 const nav=pages.tabBar.list.map(p=>p.text);assert.deepEqual(nav,['首页','学习','图鉴']);
 assert.deepEqual(pages.pages.map(p=>p.path),['pages/mengyu/home','pages/mengyu/learn','pages/mengyu/library']);
 const manifest=JSON.parse(fs.readFileSync(path.join(base,'src/manifest.json')));assert.equal(manifest.name,'秘境梦屿');
 const {cards:images,provenance}=await imp('mengyu.mjs');assert.equal(images.length,78);assert.equal(new Set(images.map(c=>c.id)).size,78);assert.equal(provenance.sources.length,78);
 for(const image of images){assert.deepEqual(Object.keys(image).sort(),['id','name','suit','number','keywords','observation','core','symbols','foundation'].sort());assert.ok(image.observation&&image.symbols.length>=2&&image.foundation.text);assert.equal(image.core,deck.cards.find(c=>c.id===image.id).core);assert(!/占卜|预测|运势|日运|牌阵|正位|逆位|解牌|解读|建议位|牌位|旁边的牌|抽到/.test(JSON.stringify(image)),image.id+' visual-only projection');assert(artwork[image.id]);}
 for(const page of [...pages.pages,...(pages.subPackages || []).flatMap(pack=>pack.pages.map(p=>({...p,path:pack.root+'/'+p.path})))]) assert.ok(fs.existsSync(path.join(base,'src',page.path+'.vue')),page.path);
 assert.equal(pages.subPackages[0].root,'pages/artwork');
 const {knowledge:fullKnowledge}=await import(pathToFileURL(path.join(base,'src/pages/card/generated/knowledge.mjs')).href);
 for(const card of deck.cards){assert.deepEqual(knowledge.byId[card.id].learning,fullKnowledge.byId[card.id].learning);assert.equal(knowledge.byId[card.id].domains,undefined);assert.equal(Object.keys(fullKnowledge.byId[card.id].domains).length,5);}
 console.log('PASS: preserved shared 78-card/3-stage and spread engines; public Mengyu profile uses only 78 image/symbol projections, explicit provenance, 3 cultural routes and artwork subpackage.');
})().catch(error=>{console.error(error);process.exitCode=1});
