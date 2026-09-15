/* Deterministic readings verify that the actual cards and roles drive the reference. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..'),storage=new Map(),events={};
const model={window:{addEventListener(){}},document:{addEventListener(type,fn){events[type]=fn;},querySelector(){return null;}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>({matches:true}),crypto:webcrypto,Uint32Array,structuredClone,clearTimeout(){},setTimeout:()=>1,requestAnimationFrame:fn=>fn()};
for(const f of ['reading-deck.js','daily-content.js','spread-content.js','reading.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),model);
const deck=model.window.TAROT_READING_DECK.cards,spreadList=model.window.TAROT_SPREAD_CONTENT.spreads;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=model.window.createTarotReading({esc,img:id=>`<img data-id="${id}">`,icon:()=>'',go(){},toast(){},now:()=>123});
function event(action,value){events.click({target:{closest:()=>({dataset:{reading:action,value}})}});}
function fixture(spreadId,ids,extra={}){const chosen=ids.map(id=>({id,reversed:false}));const pool=[...chosen,...deck.filter(c=>!ids.includes(c.id)).map(c=>({id:c.id,reversed:false}))];const count=spreadList.find(s=>s.id===spreadId).positions.length;return {version:1,settings:{spreadId,topic:'career',questionId:'own',reversals:false,contextEnabled:false},draft:{id:'fixture',at:123,spreadId,topic:'career',questionId:'own',questionText:'',contextEnabled:false,reversals:false,pool,picked:Array.from({length:count},(_,i)=>i),revealed:Array.from({length:count},(_,i)=>i),active:0,phase:'read',...extra},history:[],practice:[]};}
function render(spreadId,ids,extra={}){api.restore(fixture(spreadId,ids,extra));return api.render();}
const section=(html,name)=>html.match(new RegExp(`<section class="${name}"[\\s\\S]*?</section>`))?.[0]||'';
// No text entry is required and a fresh device starts with neutral, disclosed wording.
assert.equal(api.export().settings.contextEnabled,false);
event('use-spread','three');event('start');assert(api.export().draft);assert.equal(api.export().draft.questionText,'');assert.equal(api.export().draft.pool.length,78);
const specific=render('three',['m16','p04','m17']);
assert(specific.includes('data-left="m16" data-right="p04" data-rule="specific"'));
assert(specific.includes('哪些保护仍然必要，哪些坚持已经阻碍调整'));
assert(!specific.includes('PROFESSIONAL READING'));assert(!specific.includes('专业逐牌'));
const sameSuit=render('three',['w02','w05','w08']);assert(sameSuit.includes('data-rule="same-suit"'));assert(sameSuit.includes('两张权杖都聚焦行动与意愿'));assert.notEqual(section(specific,'professional-report'),section(sameSuit,'professional-report'));
const sameNumber=render('three',['c05','w05','p05']);assert(sameNumber.includes('data-rule="same-number"'));
const choice=render('choice',['w01','p04','m00','c02','s02','m21']);assert(choice.includes('选项 A：支持、代价与趋势'));assert(choice.includes('选项 B：支持、代价与趋势'));assert(choice.includes('data-left="w01" data-right="c02"'));assert(!choice.includes('关键张力或支点'));assert(!choice.includes('收束方向'));
const relationship=render('relationship',['m02','m09','m16','p04','c02']);assert(relationship.includes('分清自己与可观察的互动'));assert(relationship.includes('我能采取的行动'));assert(relationship.includes('无法确定他人的内心'));
const celtic=render('celtic',['m16','p04','m00','c06','s03','m17','w07','p06','s09','m21']);assert(celtic.includes('态度、外部条件与心理预期'));assert(celtic.includes('带着条件比较趋势'));assert(celtic.includes('data-left="p06" data-right="s09"'));assert(celtic.includes('不能当成第 10 位的现实结局'));
for(const spread of spreadList){const ids=deck.slice(0,spread.positions.length).map(c=>c.id);const html=render(spread.id,ids);assert.equal((html.match(/<article>/g)||[]).length,5);assert(!section(html,'professional-report').includes('data-learn-start'));assert(html.includes('reading-position-details'));}
const unusual='</span><script>alert(1)</script>工作与圣杯';const custom=render('one',['m16'],{questionText:unusual});assert(custom.includes('data-i18n-ignore'));assert(custom.includes('&lt;script&gt;'));assert(!custom.includes('<script>'));assert(custom.includes('不会分析你输入的文字'));
const general=render('one',['m16']);assert(general.includes(deck.find(c=>c.id==='m16').upright));assert(!general.includes(deck.find(c=>c.id==='m16').contexts.career.advice));
const love=render('one',['m16'],{contextEnabled:true,topic:'love'});assert(love.includes(deck.find(c=>c.id==='m16').contexts.love.advice));
const reversed=fixture('three',['m16','p04','m17']);reversed.draft.reversals=true;reversed.draft.pool[0].reversed=true;api.restore(reversed);assert(api.render().includes('其中有逆位'));
const legacy=fixture('one',['m16']);delete legacy.draft.contextEnabled;delete legacy.settings.contextEnabled;delete legacy.draft.questionText;api.restore(legacy);assert.equal(api.export().draft.contextEnabled,true,'legacy selected context is preserved');assert.equal(api.export().draft.questionText,'');
console.log(JSON.stringify({status:'PASS',checks:['blank question can start','fresh default is general','actual card-specific and suit/number relationships','parallel A/B roles','relationship observation boundaries','Celtic role-aware synthesis','all current and legacy role-aware report shapes','no teaching in reports','escaped user-authored text','context wording disclosed and optional','reversal caveats','legacy storage compatibility']}));
