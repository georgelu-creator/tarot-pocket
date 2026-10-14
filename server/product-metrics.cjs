'use strict';
// Derived aggregates only. No questions, card selections, answers or credentials.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const DAY=86400000, IDLE=30*60000;
const MODULES={learning:'学习',reading:'抽牌',library:'牌库',ai:'AI 解读'};
const EVENTS={page_view:'访问页面',home_learn:'首页进入学习',home_read:'首页进入抽牌',reading_category:'切换抽牌分类',spread_open:'查看牌阵',reading_start:'开始抽牌',reading_cut:'切牌',reading_pick:'选牌',reading_reveal:'揭牌',offline_reading_view:'阅读本地解读',ai_confirm:'请求 AI 解读',ai_cancel:'取消 AI 解读',ai_result:'AI 解读结果',learning_start:'开始学习',learning_answer:'回答练习',learning_complete:'完成学习',dossier_open:'查看单牌资料',feature_click:'功能点击',screen_view:'进入模块',screen_exit:'离开模块',ai_backend_success:'服务端请求成功',ai_backend_failure:'服务端请求失败'};
const BUSINESS_EVENTS=new Set(['spread_open','reading_start','reading_cut','reading_pick','reading_reveal','offline_reading_view','ai_confirm','ai_result','learning_start','learning_answer','learning_complete','dossier_open']);
const FEATURES={
 'nav-home':'首页','nav-courses':'进入学习','nav-reading':'进入抽牌','nav-library':'进入牌库',
 guided:'继续系统学习','guided-card':'开始单牌课程',start:'开始',new:'开始新课',answer:'回答练习',next:'下一步',continue:'继续',level:'选择课程阶段',catalog:'查看课程目录','catalog-back':'返回学习首页',close:'关闭资料',face:'查看牌面',nav:'切换导航',card:'打开单牌资料','show-card':'打开单牌资料',
 guide:'查看牌阵',category:'切换抽牌分类',pick:'选择一张牌','pick-confirm':'确认选牌','pick-replace':'换一张牌','pick-cancel':'取消选牌','pick-undo':'撤回选牌',shuffle:'洗牌',cut:'切牌',reveal:'揭开一张牌','reveal-all':'揭开全部牌','ai-request':'请求 AI 解读','ai-cancel':'取消 AI 解读',daily:'塔罗日运',back:'返回',resume:'恢复当前牌局',manual:'手动解牌','manual-start':'开始手动解牌','manual-submit':'生成手动解读','manual-pick':'录入一张牌','manual-edit':'修改录入的牌','manual-orientation':'切换正逆位','manual-back':'返回抽牌','manual-picker-close':'关闭选牌',reference:'查看牌库完整资料',search:'搜索',filter:'筛选',orientation:'切换正逆位',reset:'重置','clear-search':'清除搜索',review:'复习',finish:'完成课程',help:'查看帮助','ai-confirm':'确认 AI 解读'
};
Object.assign(FEATURES, {
 face:'切换正逆位','pick-change':'换一张牌',undo:'撤回刚选的牌',
 'fan-help':'查看选牌提示','fan-help-close':'关闭选牌提示','fan-in':'放大牌扇','fan-out':'缩小牌扇',
 pause:'返回抽牌首页','result-guide':'查看本次牌阵说明','edit-question':'补充或修改问题',
 'save-question':'保存问题','edit-back':'返回本次解读','close-reference':'关闭单牌参考',
 'full-reference':'打开完整牌义','detail-zoom':'放大牌面',zoom:'放大牌面','close-zoom':'关闭牌面放大',
 'manual-close':'关闭录入选牌','manual-choose':'确认录入牌','course-choice':'选择其他课程',
 'next-level':'进入下一学习阶段','start-review':'开始复习',hint:'查看练习提示',reverse:'学习逆位',
 'library-view':'切换牌库目录','reference-spread':'查看牌阵资料','send-feedback':'提交问题反馈',
 'withdraw-feedback':'撤回问题反馈','save-again':'重试本机保存',home:'返回学习首页',
 'card-back':'返回上一张','choose-cards':'查阅牌库','confirm-import':'确认导入备份',
 'confirm-reset':'确认清空本机记录',draw:'翻开学习牌',export:'导出备份',
 'feedback-save':'保存体验反馈',import:'导入备份','intro-next':'进入下一步',
 'number-family':'查看数字牌系列',position:'选择牌位',save:'保存',
 sources:'查看内容与图片来源',spread:'查看牌阵','spread-answer':'回答牌阵练习',
 'spread-retry':'重试牌阵练习',status:'检查本机内容',unknown:'选择不确定',
 'change-spread':'更换牌阵','edit-change-spread':'换牌阵后修改问题',
 gallery:'返回牌阵目录','guide-back':'返回牌阵目录',
 'use-preset-question':'使用示例问题','dismiss-zoom-tip':'关闭牌图提示'
});
let cachedSpreads;
function spreadNames(){
 if(cachedSpreads)return cachedSpreads;
 const scope={window:{}};vm.createContext(scope,{codeGeneration:{strings:false,wasm:false}});
 new vm.Script(fs.readFileSync(path.join(__dirname,'../spread-content.js'),'utf8')).runInContext(scope,{timeout:2000});
 cachedSpreads=new Map(scope.window.TAROT_SPREAD_CONTENT.spreads.map(s=>[s.id,s.name]));return cachedSpreads;
}
function cnDay(stamp){return new Date(stamp+8*3600000).toISOString().slice(0,10);}
function addDay(day,offset){return new Date(Date.parse(day+'T00:00:00Z')+offset*DAY).toISOString().slice(0,10);}
function validDay(day){return typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(Date.parse(day+'T00:00:00Z'))&&addDay(day,0)===day;}
function parseRange(filters={},stamp=Date.now(),defaultDays=30){
 const today=cnDay(stamp), oldest=addDay(today,-89);
 if(!filters||typeof filters!=='object'||Array.isArray(filters)||Object.keys(filters).some(k=>!['from','to','module'].includes(k)))throw RangeError('INVALID_RANGE');
 const from=filters.from??addDay(today,-Math.max(0,Math.min(89,defaultDays-1))),to=filters.to??today,module=filters.module??'all';
 if(!validDay(from)||!validDay(to)||from>to||to>today||from<oldest||!['all',...Object.keys(MODULES)].includes(module))throw RangeError('INVALID_RANGE');
 return {from,to,timezone:'Asia/Shanghai',days:Math.round((Date.parse(to)-Date.parse(from))/DAY)+1,module};
}
function propsOf(row){try{const p=JSON.parse(row.props||'{}');return p&&typeof p==='object'&&!Array.isArray(p)?p:{};}catch{return {};}}
function pageModule(page){if(/^(courses|academy|study|learning)(?:$|-)/.test(page||''))return 'learning';if(page==='spread-guide'||/^reading(?:$|-)/.test(page||''))return 'reading';if(/^library(?:$|-)/.test(page||''))return 'library';return 'other';}
function moduleOf(row){if(/^ai_/.test(row.name)||/^ai-/.test(row.p.feature||'')||/^ai:/.test(row.p.feature||'')||/^[^:]+:ai-/.test(row.p.feature||''))return 'ai';if(/^learning_/.test(row.name))return 'learning';if(/^reading_/.test(row.name)||['spread_open','offline_reading_view'].includes(row.name))return 'reading';return pageModule(row.page);}
function featureOf(row){
 const raw=row.p.feature||'',colon=raw.indexOf(':'),action=colon>=0?raw.slice(colon+1):raw;
 const known=Object.hasOwn(FEATURES,action),label=known?FEATURES[action]:'其他操作（旧版未命名）';
 // Canonical namespace is determined by the observed page, never trusted from arbitrary input.
 const module=row.module;
 return {key:module+':'+(known?action:'other'),label:(MODULES[module]?MODULES[module]+' · ':'')+label,generic:colon<0||!known};
}
const ratio=(n,d)=>d?Math.round(n/d*1000)/10:null;
const visitorSet=rows=>new Set(rows.filter(r=>r.visitor).map(r=>r.visitor));
function value(row){return row.name==='learning_complete'||row.name==='offline_reading_view'||row.name==='dossier_open'&&row.module==='library'||row.name==='ai_result'&&['success','safety'].includes(row.p.status);}
function counts(rows){const clients=rows.filter(r=>r.visitor&&r.name!=='screen_exit'),server=rows.some(r=>!r.visitor);return {users:clients.length?visitorSet(clients).size:server?null:0,visits:new Set(clients.map(r=>r.visit)).size,clicks:clients.filter(r=>r.name==='feature_click').length,valueUsers:visitorSet(clients.filter(value)).size};}
function grouped(rows,key,label){const m=new Map();for(const r of rows){const k=key(r);if(!m.has(k))m.set(k,[]);m.get(k).push(r);}return [...m].map(([k,v])=>({key:k,label:label(v[0],k),count:v.length,users:v.some(r=>r.visitor)?visitorSet(v).size:null})).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));}
function aiMetrics(rows){const calls=rows.filter(r=>/^ai_backend_(success|failure)$/.test(r.name)),success=calls.filter(r=>r.name==='ai_backend_success').length,durations=calls.map(r=>Number(r.p.duration)).filter(n=>Number.isFinite(n)&&n>=0&&n<=180000).sort((a,b)=>a-b),statuses={};for(const r of calls){const s=/^\d{3}$/.test(String(r.p.status))?String(r.p.status):'unknown';statuses[s]=(statuses[s]||0)+1;}const client={};for(const [key,test]of [['requests',r=>r.name==='ai_confirm'],...['success','failure','cancelled','safety'].map(status=>[status==='failure'?'failures':status,r=>r.name==='ai_result'&&r.p.status===status])]){const list=rows.filter(r=>r.visitor&&test(r));client[key]=list.length;client[key==='requests'?'requestUsers':key==='failures'?'failureUsers':key+'Users']=visitorSet(list).size;}return {total:calls.length,success,failures:calls.length-success,successRate:ratio(success,calls.length),averageMs:durations.length?Math.round(durations.reduce((a,b)=>a+b,0)/durations.length):null,p95Ms:durations.length?durations[Math.ceil(durations.length*.95)-1]:null,statuses,client};}
const FUNNELS={
 learning:[['enter','进入学习',r=>r.module==='learning'&&['screen_view','page_view'].includes(r.name)],['start','开始学习',r=>r.name==='learning_start'],['answer','回答练习',r=>r.name==='learning_answer'],['complete','完成学习',r=>r.name==='learning_complete']],
 reading:[['enter','进入抽牌',r=>r.module==='reading'&&['screen_view','page_view'].includes(r.name)],['spread','查看牌阵',r=>r.name==='spread_open'],['start','开始抽牌',r=>r.name==='reading_start'],['cut','完成切牌',r=>r.name==='reading_cut'],['pick','选择一张牌',r=>r.name==='reading_pick'],['reveal','揭牌',r=>r.name==='reading_reveal'],['local','阅读本地解读',r=>r.name==='offline_reading_view'&&r.p.source!=='manual']],
 library:[['enter','进入牌库',r=>r.module==='library'&&['screen_view','page_view'].includes(r.name)],['open','查看单牌资料',r=>r.module==='library'&&r.name==='dossier_open']],
 ai:[['confirm','请求 AI 解读',r=>r.name==='ai_confirm'],['result','收到 AI 解读',r=>r.name==='ai_result'&&['success','safety'].includes(r.p.status)]]
};
function funnels(rows,module){
 const groupedVisits=new Map();for(const r of rows.filter(r=>r.visitor)){if(!groupedVisits.has(r.visit))groupedVisits.set(r.visit,[]);groupedVisits.get(r.visit).push(r);}
 return (module==='all'?Object.keys(FUNNELS):Object.hasOwn(FUNNELS,module)?[module]:[]).flatMap(id=>{
  const stages=FUNNELS[id],sets=stages.map(()=>new Set());
  for(const visit of groupedVisits.values()){
   if(['reading','ai'].includes(id)){
    const states=new Map();let entered=false;
    for(const r of visit){
     if(id==='reading'&&stages[0][2](r)){entered=true;sets[0].add(r.visitor);continue;}
     if(id==='reading'&&(r.p.source==='manual'||r.p.spread==='daily'))continue;
     const spread=spreadNames().has(r.p.spread)?r.p.spread:null;
     if(id==='reading'&&entered&&stages[1][2](r)){sets[1].add(r.visitor);if(spread)states.set(spread,2);continue;}
     if(id==='ai'&&stages[0][2](r)){sets[0].add(r.visitor);if(spread)states.set(spread,1);continue;}
     if(!spread||!states.has(spread))continue;
     const stage=states.get(spread);if(stage<stages.length&&stages[stage][2](r)){sets[stage].add(r.visitor);states.set(spread,stage+1);}
    }
   }else{let stage=0;for(const r of visit)if(stage<stages.length&&stages[stage][2](r)){sets[stage].add(r.visitor);stage++;}}
  }
  return stages.map(([key,label],i)=>({key:id+':'+key,label:MODULES[id]+' · '+label,users:sets[i].size,conversion:ratio(sets[i].size,i?sets[i-1].size:sets[i].size)}));
 });
}
function popular(rows){const names=spreadNames(),m=new Map();for(const r of rows){if(!['spread_open','reading_start','offline_reading_view','ai_confirm','ai_result','ai_backend_success','ai_backend_failure'].includes(r.name))continue;const id=names.has(r.p.spread)?r.p.spread:'unknown';if(!m.has(id))m.set(id,[]);m.get(id).push(r);}return [...m].map(([id,list])=>{const of=name=>list.filter(r=>r.name===name),users=name=>{const a=of(name);return a.some(r=>r.visitor)?visitorSet(a).size:0;};return {id,users:list.some(r=>r.visitor)?visitorSet(list.filter(r=>r.visitor&&['reading_start','offline_reading_view','ai_confirm'].includes(r.name))).size:null,name:names.get(id)||'未记录牌阵（旧版或无效请求）',opens:of('spread_open').length,openUsers:users('spread_open'),starts:of('reading_start').length,startUsers:users('reading_start'),localViews:of('offline_reading_view').length,localUsers:users('offline_reading_view'),aiRequests:of('ai_confirm').length,aiUsers:users('ai_confirm'),aiSuccess:of('ai_result').filter(r=>['success','safety'].includes(r.p.status)).length,aiFailures:of('ai_result').filter(r=>r.p.status==='failure').length,serverCalls:list.filter(r=>/^ai_backend_/.test(r.name)).length,serverSuccess:of('ai_backend_success').length,serverFailures:of('ai_backend_failure').length};}).sort((a,b)=>(b.users||0)-(a.users||0)||b.serverCalls-a.serverCalls||b.starts-a.starts||b.opens-a.opens);}
function productMetrics(raw,filters,stamp,days=30){
 const range=parseRange(filters,stamp,days),all=[],last=new Map();
 for(const rawRow of raw){const r={...rawRow,day:cnDay(rawRow.occurred_at),p:propsOf(rawRow)};r.module=moduleOf(r);if(r.visitor){const key=r.visitor+'|'+r.session,prev=last.get(key);r.visit=prev&&r.occurred_at-prev.at<=IDLE?prev.visit:key+'|'+r.occurred_at+'|'+r.id;last.set(key,{at:r.occurred_at,visit:r.visit});}all.push(r);}
 const inRange=r=>r.day>=range.from&&r.day<=range.to,windowRows=all.filter(inRange),selectedRows=windowRows.filter(r=>range.module==='all'||r.module===range.module),selectedCounts=counts(selectedRows);
 const daily=[];for(let d=range.from;d<=range.to;d=addDay(d,1)){const list=windowRows.filter(r=>r.day===d),filtered=list.filter(r=>range.module==='all'||r.module===range.module),modules={};for(const id of Object.keys(MODULES)){const c=counts(list.filter(r=>r.module===id));modules[id]={users:c.users,clicks:c.clicks};}daily.push({day:d,...counts(filtered),aiCalls:aiMetrics(filtered).total,modules});}
 const modules=Object.entries(MODULES).map(([id,label])=>({id,label,...counts(windowRows.filter(r=>r.module===id))}));
 const selected={module:range.module,...selectedCounts,events:grouped(selectedRows.filter(r=>BUSINESS_EVENTS.has(r.name)),r=>r.name,r=>EVENTS[r.name]),features:grouped(selectedRows.filter(r=>r.name==='feature_click'),r=>featureOf(r).key,r=>featureOf(r).label),spreads:popular(selectedRows),funnel:funnels(selectedRows,range.module),ai:aiMetrics(selectedRows)};
 // First observed retained day is an observational cohort, not registration date.
 const cohorts=new Map();for(const r of all.filter(r=>r.visitor&&(range.module==='all'||r.module===range.module))){if(!cohorts.has(r.visitor))cohorts.set(r.visitor,new Set());cohorts.get(r.visitor).add(r.day);}
 const today=cnDay(stamp),retention=[1,7,30].map(offset=>{let eligible=0,returned=0;for(const active of cohorts.values()){const first=[...active].sort()[0],target=addDay(first,offset);if(first<range.from||first>range.to||target>=today)continue;eligible++;if(active.has(target))returned++;}return {day:offset,eligible,returned,rate:ratio(returned,eligible)};});
 const visits=new Map();for(const r of all.filter(r=>r.visitor)){if(!visits.has(r.visit))visits.set(r.visit,[]);visits.get(r.visit).push(r);}
 const paths=[],exitsMap=new Map();for(const [visit,list]of visits){const tail=list.at(-1);if(stamp-tail.occurred_at<IDLE||!inRange(tail)||!list.some(r=>r.name!=='screen_exit'))continue;const observed=list.filter(r=>inRange(r)&&(range.module==='all'||r.module===range.module));if(!observed.length)continue;const exitModule=tail.module;if(range.module!=='all'&&exitModule!==range.module)continue;const exit=exitModule==='other'?'other':exitModule,label=MODULES[exit]||'首页及其他页面';if(!exitsMap.has(exit))exitsMap.set(exit,[]);exitsMap.get(exit).push(tail);paths.push({session:require('node:crypto').createHash('sha256').update(visit).digest('hex').slice(0,12),at:tail.occurred_at,exit:label,steps:observed.slice(-40).map(r=>({at:r.occurred_at,page:MODULES[r.module]||'首页及其他页面',event:EVENTS[r.name]||'其他事件',feature:r.name==='feature_click'?featureOf(r).label:''}))});}
 const exits=[...exitsMap].map(([page,list])=>({page,label:MODULES[page]||'首页及其他页面',count:list.length,users:visitorSet(list).size})).sort((a,b)=>b.count-a.count);
 const names=spreadNames(),quality={legacyWithoutSpread:selectedRows.filter(r=>r.visitor&&['spread_open','reading_start','reading_pick','reading_reveal','offline_reading_view','ai_confirm','ai_result'].includes(r.name)&&!names.has(r.p.spread)).length,legacyGenericFeatures:selectedRows.filter(r=>r.name==='feature_click'&&featureOf(r).generic).length,serverCallsWithoutSpread:selectedRows.filter(r=>/^ai_backend_/.test(r.name)&&!names.has(r.p.spread)).length,notes:['用户按同一浏览器的匿名标识去重；更换设备、清理存储或隐私模式可能重复，无法代表真实人数。','次数只把功能点击计入点击数；开始、完成、解读结果等是独立业务事件，不叠加计算。','访问按匿名用户和标签页划分，连续 30 分钟无活动后计为新访问。','留存按所选模块在保留窗口内首次观察到的日期分组，未成熟当天不纳入；不等同于注册或全部历史新用户。','核心使用指完成学习、阅读本地解读、在牌库查看资料或收到 AI 解读，不代表学会或满意。','服务端请求无法关联匿名用户，用户数显示为未关联；旧事件缺失维度不推测补齐。','退出是超过 30 分钟未继续活动的最后观察位置，不证明用户主动退出或不满意。','当前日期与最早保留日可能只有部分数据。','漏斗要求同一次访问内依次完成；抽牌与 AI 后续步骤还要求牌阵一致。未记录牌阵的旧步骤不推测接续。日运和手动解读不进入随机抽牌仪式漏斗。']};
 const insights=[];if(!selectedRows.length)insights.push({title:'所选范围暂无数据',detail:'没有观察到符合日期和模块的事件。',action:'扩大日期范围，或等待新版本产生完整事件。',severity:'info'});
 if(selectedCounts.users!==null&&selectedCounts.users<20)insights.push({title:'当前样本较少',detail:'所选范围观察到 '+selectedCounts.users+' 个去重浏览器标识。',action:'结合用户反馈判断问题，暂不把变化当成稳定趋势。',severity:'info'});
 for(const id of range.module==='all'?Object.keys(FUNNELS):[range.module]){const f=selected.funnel.filter(s=>s.key.startsWith(id+':'));let drop=null;for(let i=1;i<f.length;i++){const n=f[i-1].users-f[i].users;if(n>0&&(!drop||n>drop.n))drop={n,previous:f[i-1],next:f[i]};}if(drop)insights.push({title:MODULES[id]+'的主要中断位置',detail:drop.previous.label+' → '+drop.next.label+'：少了 '+drop.n+' 个同访问顺序完成的浏览器标识（前一步 '+drop.previous.users+'）。',action:'优先复查这一步的引导与可用性；跨访问完成或关闭埋点也可能造成差异。',severity:'attention'});}
 const ai=selected.ai;if(ai.failures)insights.push({title:'AI 服务存在失败请求',detail:'服务端 '+ai.total+' 次请求中 '+ai.failures+' 次失败，成功率 '+ai.successRate+'%。',action:'查看状态码和耗时，区分鉴权、限流与上游故障；请求次数不等于用户数。',severity:'attention'});
 const top=selected.spreads.find(s=>s.id!=='unknown'&&(s.starts||s.localViews||s.aiRequests));if(top)insights.push({title:'常用牌阵：'+top.name,detail:'开始抽牌 '+top.starts+' 次，本地解读 '+top.localViews+' 次，AI 请求 '+top.aiRequests+' 次。',action:'优先检查这一牌阵的完成流程和解释质量；这些事件可能属于同一牌局，不能相加当作独立使用量。',severity:'info'});
 if(quality.legacyWithoutSpread||quality.serverCallsWithoutSpread||quality.legacyGenericFeatures)insights.push({title:'部分历史数据缺少维度',detail:'未记录牌阵的前端事件 '+quality.legacyWithoutSpread+' 次、服务端请求 '+quality.serverCallsWithoutSpread+' 次；旧版通用操作 '+quality.legacyGenericFeatures+' 次。',action:'以新版本收集的模块、命名功能和牌阵维度持续观察，不反推历史缺失数据。',severity:'info'});
 return {range,overview:selectedCounts,daily,modules,selected,retention,insights,quality,exits,paths:paths.sort((a,b)=>b.at-a.at).slice(0,50)};
}
module.exports={productMetrics,parseRange,cnDay,isKnownSpread:id=>spreadNames().has(id)};
