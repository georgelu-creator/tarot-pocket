'use strict';
// Only the separately consented feedback store reaches this module, never AI request bodies.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {cnDay}=require('./product-metrics.cjs');
const TOPICS={general:'综合与其他',love:'感情与关系',career:'工作与发展',study:'学习与考试',life:'生活与自我'};
let names;
function spreadName(id){if(!names){const scope={window:{}};vm.createContext(scope,{codeGeneration:{strings:false,wasm:false}});new vm.Script(fs.readFileSync(path.join(__dirname,'../spread-content.js'),'utf8')).runInContext(scope,{timeout:2000});names=new Map(scope.window.TAROT_SPREAD_CONTENT.spreads.map(s=>[s.id,s.name]));}return names.get(id)||'未关联牌阵';}
function contextOf(raw){try{const c=JSON.parse(raw||'null');return c&&['ai','feedback'].includes(c.source)?c:null;}catch{return null;}}
function summarizeQueries(rows,range){
 const list=rows.filter(r=>{const day=cnDay(r.at);return day>=range.from&&day<=range.to;}).map(r=>{const c=contextOf(r.context);return {id:r.id,at:r.at,question:r.question,source:c?.source||'legacy',spreadId:c?.spread||null,spreadName:spreadName(c?.spread),topic:c?.topic||null,topicLabel:TOPICS[c?.topic]||'旧反馈未关联领域'};});
 // Query source is an independent consent channel, not an anonymous visitor/AI usage identity.
 const matched=['all','ai'].includes(range.module)?list:[];
 const count=(values,key,label)=>{const m=new Map();for(const r of values){const id=key(r);if(!m.has(id))m.set(id,{id,label:label(r),count:0});m.get(id).count++;}return [...m.values()].sort((a,b)=>b.count-a.count||String(a.id).localeCompare(String(b.id)));};
 const days=new Map();for(const r of matched){const day=cnDay(r.at);if(!days.has(day))days.set(day,{day,count:0,aiCount:0});const d=days.get(day);d.count++;if(r.source==='ai')d.aiCount++;}
 const repeated=count(matched,r=>r.question.trim().replace(/\s+/gu,' '),r=>r.question.trim().replace(/\s+/gu,' ')).filter(r=>r.count>1).map(r=>({question:r.label,count:r.count}));
 return {range:{...range},scope:'consented-only',total:matched.length,aiTotal:matched.filter(r=>r.source==='ai').length,feedbackTotal:matched.filter(r=>r.source==='feedback').length,legacyTotal:matched.filter(r=>r.source==='legacy').length,matchedTotal:matched.length,days:[...days.values()].sort((a,b)=>b.day.localeCompare(a.day)),topics:count(matched,r=>r.topic||'unknown',r=>r.topicLabel),spreads:count(matched,r=>r.spreadId||'unknown',r=>r.spreadName).map(r=>({id:r.id,name:r.label,count:r.count})),repeated:repeated.slice(0,50),items:matched.slice().sort((a,b)=>b.at-a.at||String(a.id).localeCompare(String(b.id))).slice(0,100),truncated:matched.length>100,notes:['仅包含用户主动同意提交的问题样本，不代表全部AI提问或全部用户；提交次数不等于去重用户。','AI提问、普通问题反馈和旧版未关联反馈分列；旧反馈不补猜牌阵、领域或是否使用AI。','领域来自用户所选解读主题，不用关键词或模型猜测意图；重复问题仅合并空白后完全相同的文本。','最多保留30天，明细最多展示最新100条，汇总使用当前筛选全部有效样本；用户撤回后从明细与汇总同时移除。']};
}
module.exports={summarizeQueries};
