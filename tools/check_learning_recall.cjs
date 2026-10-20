'use strict';
// Mount both production classrooms without regenerating shared build artifacts.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),mini=path.join(root,'apps/miniapp'),req=createRequire(path.join(mini,'package.json'));
const {parse,compileScript,compileTemplate}=req('@vue/compiler-sfc'),esbuild=req('esbuild');
const source=fs.readFileSync(path.join(root,'academy.js'),'utf8'),sandbox={window:{}};
const images={p08:'data:image/webp;base64,'+fs.readFileSync(path.join(root,'assets/cards/p08.webp')).toString('base64')};
for(const file of ['academy-content.js','card-knowledge.js','academy.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
const {TarotAcademy:engine,TAROT_ACADEMY_CONTENT:content,TAROT_CARD_KNOWLEDGE:knowledge}=sandbox.window;
for(const card of content.cards)for(const [mode,index]of [['foundation',0],['application',0],['application',2],['integration',0]]){
 const step=engine.planFor(card,mode)[index],aid=engine.knowledgeLesson(knowledge,card.id,step);
 assert(aid.recall.prompt.includes(card.title.zh),card.id+' targets the actual card');
 assert(aid.recall.reason.every(p=>step.content.some(t=>p===t.zh)),card.id+' only recalls taught content');
 assert(aid.recall.example.length>20,card.id+' has a substantive short teaching example');
 assert.equal(engine.knowledgeLesson(knowledge,card.id,{...step,support:true}),null,'Repairs retain their focused content');
}
const filename=path.join(mini,'src/pages/learn/index.vue'),{descriptor}=parse(fs.readFileSync(filename,'utf8'),{filename});
const compiled=compileScript(descriptor,{id:'recall-check'}),template=compileTemplate({source:descriptor.template.content,filename,id:'recall-check',compilerOptions:{bindingMetadata:compiled.bindings}});
assert.deepEqual(template.errors,[]);
const sfc=compiled.content.replace('export default','const component =').replace("'../../core/platform'","'recall-platform'").replace("'../../core/catalogs'","'recall-catalogs'")+'\n'+template.code.replace('export function render','function render')+`\nimport {createApp} from 'vue';component.render=render;const setup=component.setup;component.setup=(props,context)=>{const bindings=setup(props,context);window.lesson=bindings;return bindings;};createApp(component).mount('#app');`;
const curated={...knowledge,byId:Object.fromEntries(Object.entries(knowledge.byId).map(([id,k])=>[id,{id,learning:k.learning}]))};
const catalog=`const source=${JSON.stringify(content)};const units=Object.fromEntries([...source.lessons,...source.cards].map(u=>[u.id,u]));${source.slice(source.indexOf('  const DAY='),source.indexOf('  function create(bridge)'))}\nexport const academy={coursePurpose,learningVisual,knowledgeLesson,practiceVariants,guidedQueue,courseRoute,stageNext,skillState,blank,validate,planFor,stepFor:currentStep,answer,advance,masteryState,cardPath:[...CARD_PATH],units,version};export const knowledge=${JSON.stringify(curated)};`;
(async()=>{
 const bundle=await esbuild.build({stdin:{contents:sfc,loader:'ts',resolveDir:path.dirname(filename)},bundle:true,platform:'browser',format:'iife',write:false,plugins:[{name:'recall-fixture',setup(build){
  build.onResolve({filter:/^(recall-platform|recall-catalogs|@dcloudio\/uni-app)$/},args=>({path:args.path,namespace:'fixture'}));
  build.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='recall-catalogs'?catalog:args.path==='recall-platform'?`export const readStore=()=>null,writeStore=(k,v)=>window.saved=structuredClone(v),notify=()=>{},cardImage=id=>window.recallImages[id]||'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';`:`export const onShow=cb=>window.hooks.show.push(cb),onHide=cb=>window.hooks.hide.push(cb),onUnload=()=>{},onBackPress=()=>{};`,loader:'js'}));
 }}]});
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [320,390,768]){
   const web=await browser.newPage({viewport:{width,height:844}}),miniPage=await browser.newPage({viewport:{width,height:844}});
   const errors=[];for(const p of [web,miniPage])p.on('pageerror',e=>errors.push(e.message));
   await web.setContent('<div id="app"></div>');await web.evaluate(images=>window.recallImages=images,images);
   await web.addStyleTag({content:':root{--bg:#f5f0e8;--paper:#fffcf7;--ink:#302a30;--muted:#756d77;--accent:#654b65;--line:#ddd3df}body{margin:0;background:var(--bg)}button{font:inherit}.linkbtn,.secondary,.primary{min-height:44px;border-radius:12px;padding:8px 14px}.primary{display:block;width:100%}.wide{width:100%}'+fs.readFileSync(path.join(root,'academy.css'),'utf8')});
   await web.addScriptTag({content:fs.readFileSync(path.join(root,'academy-content.js'),'utf8')});await web.addScriptTag({content:fs.readFileSync(path.join(root,'card-knowledge.js'),'utf8')});await web.addScriptTag({content:source});
   await web.evaluate(()=>{window.saved=TarotAcademy.blank();const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));window.mount=()=>{window.academy=TarotAcademy.create({esc,img:id=>'<img alt="本轮牌图" src="'+(window.recallImages[id]||'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=')+'">',icon:()=>'',now:Date.now,get:()=>window.saved,set:d=>window.saved=d,go:()=>document.querySelector('#app').innerHTML=window.academy.render(),toast:()=>{}})};window.mount();});
   await miniPage.setContent('<div id="app"></div>');await miniPage.evaluate(images=>window.recallImages=images,images);await miniPage.evaluate(()=>{window.hooks={show:[],hide:[]};window.uni={hideTabBar:opts=>opts.success()};});
   await miniPage.addStyleTag({content:':root{--bg:#f5f0e8;--paper:#fffcf7;--ink:#302a30;--muted:#756d77;--accent:#654b65;--line:#ddd3df}view,scroll-view{display:block}body{margin:0}'+descriptor.styles.map(s=>s.content).join('\n')});
   await miniPage.addScriptTag({content:bundle.outputFiles[0].text});
   for(const [mode,index]of [['foundation',0],['application',0],['application',2],['integration',0]]){
    await web.evaluate(({mode,index})=>{window.saved=TarotAcademy.blank();window.academy.start('p08',mode);window.saved.session.index=index;document.querySelector('#app').innerHTML=window.academy.render();},{mode,index});
    await miniPage.evaluate(({mode,index})=>{const l=window.lesson;l.data.value=l.academy.blank();l.start({id:'p08',mode});l.session.value.index=index;},{mode,index});
    await web.evaluate(()=>window.originalImage=document.querySelector('.academy-card-face'));await miniPage.evaluate(()=>window.originalImage=document.querySelector('.card-picture'));
    const beforeWeb=await web.evaluate(()=>JSON.stringify({answers:window.saved.session.answers,progress:window.saved.progress,index:window.saved.session.index}));
    const beforeMini=await miniPage.evaluate(()=>JSON.stringify({answers:window.lesson.session.value.answers,progress:window.lesson.data.value.progress,index:window.lesson.session.value.index}));
    assert(await web.locator('.academy-explanation').isVisible(),'web first teaches');assert(await miniPage.locator('.lesson-explanation').isVisible(),'mini first teaches');
    await web.locator('[data-academy=recall][data-recall=think]').click();await miniPage.locator('.recall-entry').dispatchEvent('tap');
    assert(!await web.locator('.academy-explanation').isVisible(),'web actively conceals explanation');assert(!await miniPage.locator('.lesson-explanation').isVisible(),'mini actively conceals explanation');
    assert.equal(await web.locator('.academy-recall>p').first().innerText(),await miniPage.locator('.recall>.paragraph').first().textContent(),'same current prompt');
    await web.locator('[data-recall=reason]').click();await miniPage.locator('.recall-button').first().dispatchEvent('tap');
    assert.equal((await web.locator('.academy-recall-reason p').allTextContents()).join('|'),(await miniPage.locator('.recall-reason .paragraph').allTextContents()).join('|'),'same explanation');
    await web.locator('[data-recall=example]').click();await miniPage.locator('.recall-button').first().dispatchEvent('tap');
    assert.equal(await web.locator('.academy-recall-example p').innerText(),await miniPage.locator('.recall-example .paragraph').textContent(),'same learning example');
    assert(await web.evaluate(()=>window.originalImage===document.querySelector('.academy-card-face')),'web recall retains card DOM');assert(await miniPage.evaluate(()=>window.originalImage===document.querySelector('.card-picture')),'mini recall retains card DOM');
    if(process.env.RECALL_SCREENSHOTS&&width===390&&mode==='foundation'){await web.screenshot({path:path.join(process.env.RECALL_SCREENSHOTS,'tarot-recall-web.png'),fullPage:true});await miniPage.screenshot({path:path.join(process.env.RECALL_SCREENSHOTS,'tarot-recall-mini.png'),fullPage:true});}
    const restored=await web.evaluate(()=>{window.saved=TarotAcademy.validate(JSON.parse(JSON.stringify(window.saved)));document.querySelector('#app').innerHTML=window.academy.render();return !!document.querySelector('.academy-recall-example');});
    assert(restored,'web disclosure survives restore');
    await miniPage.evaluate(()=>{const l=window.lesson;l.goHome();l.data.value=l.academy.validate(JSON.parse(JSON.stringify(l.data.value)));l.continueCourse();});assert.equal(await miniPage.locator('.recall-example').count(),1,'mini disclosure survives back/resume');
    assert.equal(await web.evaluate(()=>JSON.stringify({answers:window.saved.session.answers,progress:window.saved.progress,index:window.saved.session.index})),beforeWeb,'web optional recall never scores or advances');
    assert.equal(await miniPage.evaluate(()=>JSON.stringify({answers:window.lesson.session.value.answers,progress:window.lesson.data.value.progress,index:window.lesson.session.value.index})),beforeMini,'mini optional recall never scores or advances');
    for(const p of [web,miniPage])assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow '+width);
    await web.locator('[data-recall=close]').click();await miniPage.getByText('返回讲解',{exact:true}).dispatchEvent('tap');
    assert(await web.locator('.academy-explanation').isVisible());assert(await miniPage.locator('.lesson-explanation').isVisible());
    // The original primary action remains sufficient; optional aid is never a gate.
    await web.locator('[data-academy=next]').click();await miniPage.locator('.lesson-content>.primary').dispatchEvent('tap');
    assert.equal(await web.locator('.academy-options').count(),1);assert.equal(await miniPage.locator('.question').count(),1);
   }
   assert.deepEqual(errors,[]);await web.close();await miniPage.close();
  }
  console.log('PASS: 312 card/stage recall prompts; real web and mini Vue conceal/reason/example/restore; no scoring/advance; 320/390/768px; original assessment route unchanged.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
