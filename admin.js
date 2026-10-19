(() => {
  'use strict';
  const q=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const modules={all:'总览',learning:'学习',reading:'抽牌',library:'牌库',ai:'AI 解读'};
  const names={home:'首页',courses:'学习',academy:'学习',study:'学习',learning:'学习',library:'牌库',reading:'抽牌',records:'旧版记录',page_view:'访问页面',screen_view:'进入模块',screen_exit:'离开模块',feature_click:'功能点击',home_learn:'首页进入学习',home_read:'首页进入抽牌',reading_category:'切换抽牌分类',spread_open:'查看牌阵',reading_start:'开始抽牌',reading_pick:'选牌',reading_cut:'完成切牌',reading_reveal:'完成揭牌',offline_reading_view:'阅读本地解读',manual_reading_start:'生成手动解读',ai_confirm:'确认 AI 解读',ai_cancel:'取消 AI 解读',ai_result:'AI 返回结果',ai_backend_success:'AI 服务响应成功',ai_backend_error:'AI 服务响应失败',ai_backend_failure:'AI 服务响应失败',learning_start:'开始学习',learning_answer:'回答练习',learning_complete:'完成学习',dossier_open:'查看单牌资料',guided:'继续系统学习','guided-card':'选择一张牌学习',answer:'回答练习',next:'下一步',card:'打开单牌',guide:'查看牌阵',start:'开始',pick:'选牌',reveal:'揭牌',close:'关闭资料',face:'切换正逆位',nav:'切换模块',level:'选择学习阶段',catalog:'查看课程目录','catalog-back':'返回学习首页','pick-confirm':'确认选牌','reference-spread':'查看牌阵资料','library-view':'切换牌库目录','nav-home':'首页导航','nav-courses':'学习导航','nav-reading':'抽牌导航','nav-library':'牌库导航'};
  // Unnamed historical identifiers remain unknown, never become unexplained English labels.
  const label=(value,fallback='其他操作（旧版未命名）')=>{
    if(names[value])return names[value];
    if(typeof value!=='string')return fallback;
    const [scope,action]=value.split(':');
    if(modules[scope]&&names[action])return modules[scope]+' · '+names[action];
    if(value.startsWith('reading-'))return '抽牌';
    return /[\u3400-\u9fff]/.test(value)?value:fallback;
  };
  const n=v=>Number.isFinite(Number(v))&&v!==null?Math.max(0,Number(v)):0;
  const num=v=>v===null?'未关联用户':n(v).toLocaleString('zh-CN');
  const percent=v=>v==null?'暂无样本':`${Math.min(100,n(v)).toFixed(1)}%`;
  const empty=t=>`<p class="empty">${esc(t)}</p>`;
  const endpoint=()=>window.TAROT_AI_CONFIG?.analyticsEndpoint?.replace(/\/events$/,'/admin/metrics')||'/api/admin/metrics';
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const shift=(day,offset)=>{const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)};
  const time=at=>{const date=new Date(at);return Number.isNaN(date.getTime())?'时间未记录':date.toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false})};
  let filters={from:shift(today(),-6),to:today(),module:'all'},parentRange=null,sequence=0,controller=null,token='',analysisDay,currentProduct=null,currentQueries=null;
  try{token=sessionStorage.getItem('tarot-admin-session')||'';}catch(_){}
  function syncFilters(){
    q('[name=from]').value=filters.from;q('[name=to]').value=filters.to;
    for(const input of document.querySelectorAll('input[type=date]')){input.max=today();input.min=shift(today(),-89)}
    document.querySelectorAll('[data-module]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.module===filters.module)));
    document.querySelectorAll('[data-days]').forEach(b=>b.setAttribute('aria-pressed',String(filters.to===today()&&filters.from===shift(today(),1-Number(b.dataset.days)))));
    q('[data-range-caption]').textContent=`${filters.from===filters.to?filters.from:filters.from+' — '+filters.to} · ${modules[filters.module]}`;
    q('[data-back]').hidden=!parentRange;
  }
  function renderTable(target,rows,kind){
    q(target).innerHTML=(rows||[]).length?rows.map(r=>`<tr><td>${esc(label(r.label||r.key))}</td><td>${num(r.count)}</td><td>${num(r.users)}</td><td>${percent(r.userRate)}</td></tr>`).join(''):`<tr><td colspan="4">暂无${kind}，可更换日期或模块。</td></tr>`;
  }
  function renderAnalysis(){
    const p=currentProduct;if(!p)return;
    const days=[...(p.daily||[])].sort((a,b)=>b.day.localeCompare(a.day));
    if(analysisDay===undefined||(analysisDay&&!days.some(d=>d.day===analysisDay)))analysisDay=days[0]?.day||'';
    q('[data-analysis-day]').innerHTML='<option value="">当前范围汇总</option>'+days.map(d=>`<option value="${esc(d.day)}">${esc(d.day)}</option>`).join('');
    q('[data-analysis-day]').value=analysisDay;
    const scope=analysisDay?(p.dailyAnalysis||[]).find(d=>d.day===analysisDay):p.selected;
    const denominator=scope?.users;
    q('[data-analysis-caption]').textContent=`${analysisDay||filters.from+' — '+filters.to} · ${modules[filters.module]} · 人数分母：${denominator==null?'未记录':num(denominator)+' 个去重浏览器'}`;
    renderTable('[data-features]',scope?.features,'功能点击');renderTable('[data-events]',scope?.events,'关键行为');
  }
  const querySource=value=>({ai:'AI 关联样本',feedback:'普通反馈',legacy:'旧版未关联反馈'}[value]||'来源未记录');
  function renderQueryItems(){
    const source=q('[data-query-source]').value;
    const items=(currentQueries?.items||[]).filter(r=>source==='all'||r.source===source);
    q('[data-queries]').innerHTML=items.length?items.map(r=>`<article><small>${esc(time(r.at))} · ${esc(querySource(r.source))} · ${esc(r.spreadName||'未关联牌阵')} · ${esc(r.topicLabel||'未标记主题')}</small><p class="query-text">${esc(r.question)}</p></article>`).join(''):empty(currentQueries?.truncated?'当前已展示的最新明细中没有这一来源的样本。请缩小日期范围；不能据此判断该来源没有提交。':'当前来源与日期范围内暂无用户同意提交的问题样本。');
  }
  function renderQueries(analysis){
    currentQueries=analysis||null;
    q('[data-query-panel]').hidden=!['all','ai'].includes(filters.module);
    if(!analysis){q('[data-query-summary]').innerHTML=empty('当前接口未提供问题样本分析，无法从其他统计补猜提问内容。');}
    else {
      const range=analysis.range||{};
      q('[data-query-summary]').innerHTML=`<p>${esc(range.from||filters.from)} — ${esc(range.to||filters.to)} · ${esc(modules[range.module]||modules[filters.module])} · 自愿提交 ${num(analysis.total)} 条，其中 AI 关联 ${num(analysis.aiTotal)} 条、普通反馈 ${num(Math.max(0,n(analysis.total)-n(analysis.aiTotal)-n(analysis.legacyTotal)))} 条、旧版未关联 ${num(analysis.legacyTotal)} 条。</p>`+(n(analysis.total)?'':empty('当前范围暂无用户同意提交的问题样本。'));
    }
    const counts=(target,rows,name)=>{q(target).innerHTML=(rows||[]).length?`<ul class="query-counts">${rows.map(r=>`<li><span>${esc(r[name]||'未标记')}</span><strong>${num(r.count)} 条</strong></li>`).join('')}</ul>`:empty('暂无样本。')};
    counts('[data-query-topics]',analysis?.topics,'label');counts('[data-query-spreads]',analysis?.spreads,'name');
    q('[data-query-repeated]').innerHTML=(analysis?.repeated||[]).length?`<ul class="query-counts">${analysis.repeated.map(r=>`<li><span class="query-text">${esc(r.question)}</span><strong>${num(r.count)} 次</strong></li>`).join('')}</ul>`:empty('暂无重复问题样本。');
    q('[data-query-notes]').innerHTML=(analysis?.truncated?`<p>当前展示 ${num(analysis.items?.length)} 条明细；匹配 ${num(analysis.matchedTotal)} 条。明细已截断，请缩小日期范围查看。</p>`:'')+`<ul>${(analysis?.notes||[]).map(note=>`<li>${esc(note)}</li>`).join('')}</ul>`;
    renderQueryItems();
  }
  function render(data){
    const p=data.product,s=p.selected||{},o=filters.module==='all'?p.overview:s;currentProduct=p;
    q('[data-kpis]').innerHTML=[['去重使用人数',o.users,'本范围内匿名浏览器标识去重'],['核心行为人数',o.valueUsers,'完成学习、阅读解读或查看牌库资料的人数'],['功能点击次数',o.clicks,'只计功能点击，允许同一人重复使用'],['访问次数',o.visits,'同一浏览器页面闲置 30 分钟后计为新访问']].map(([title,value,detail])=>`<div class="kpi"><small>${title}</small><strong>${num(value)}</strong><p>${detail}</p></div>`).join('');
    q('[data-insights]').innerHTML=(p.insights||[]).length?p.insights.map(i=>`<article class="insight"><h3>${esc(i.title)}</h3><p>${esc(i.detail)}</p><p class="action">建议：${esc(i.action)}</p></article>`).join(''):empty('当前样本还不足以形成可靠观察。先看每天的使用人数和完成行为，避免用少量点击判断原因。');
    const quality=p.quality||{};
    const notes=[...(quality.notes||[]),'核心行为只是使用价值的代理指标，不能证明学会或满意；同一人在不同模块会分别计数。'];
    if(n(quality.legacyWithoutSpread))notes.push(`有 ${num(quality.legacyWithoutSpread)} 条历史行为未记录牌阵，不能补猜它们属于哪个牌阵。`);
    if(n(quality.legacyGenericFeatures))notes.push(`有 ${num(quality.legacyGenericFeatures)} 条旧版点击缺少明确功能命名，单独归为未命名操作。`);
    if(n(quality.serverCallsWithoutSpread))notes.push(`有 ${num(quality.serverCallsWithoutSpread)} 次服务调用缺少牌阵，保留为未记录牌阵。`);
    q('[data-quality]').innerHTML='<ul>'+notes.map(note=>`<li>${esc(note)}</li>`).join('')+'</ul>';
    q('[data-modules-panel]').hidden=filters.module!=='all';
    q('[data-modules]').innerHTML=(p.modules||[]).filter(m=>modules[m.id]&&m.id!=='all').map(m=>`<button class="module-card" data-select-module="${esc(m.id)}"><strong>${modules[m.id]}</strong><b>${num(m.users)} <small>人</small></b><small>${num(m.clicks)} 次点击 · ${num(m.valueUsers)} 人有核心行为</small></button>`).join('');
    const days=[...(p.daily||[])].sort((a,b)=>b.day.localeCompare(a.day)),max=Math.max(1,...days.map(d=>n(d.users)));
    q('[data-trend]').innerHTML=days.map(d=>`<div class="trend-point"><div class="trend-bar"><button data-day="${esc(d.day)}" data-height="${n(d.users)}" title="${esc(d.day)}：${num(d.users)} 人，${num(d.clicks)} 次点击" aria-label="查看 ${esc(d.day)}：${num(d.users)} 人"></button></div><small>${esc(d.day.slice(5))}</small></div>`).join('');
    q('[data-trend]').querySelectorAll('button').forEach((el,i)=>{el.style.height=Math.max(3,n(days[i].users)/max*100)+'%'});
    q('[data-daily]').innerHTML=days.length?days.map(d=>`<tr class="${filters.from===d.day&&filters.to===d.day?'is-selected':''}"><td><button data-day="${esc(d.day)}">${esc(d.day)}</button></td><td>${num(d.users)}</td><td>${num(d.clicks)}</td><td>${num(d.visits)}</td><td>${num(d.valueUsers)}</td><td>${num(d.aiCalls)}</td></tr>`).join(''):'<tr><td colspan="6">暂无每日数据。</td></tr>';
    q('[data-funnel-panel]').hidden=filters.module==='all';q('[data-funnel-title]').textContent=modules[filters.module]+' · 按顺序完成了哪些步骤';
    q('[data-funnel]').innerHTML=(s.funnel||[]).length?s.funnel.map((f,i)=>`<div class="funnel-item"><span>${i+1}. ${esc(label(f.label||f.key))}</span><strong>${num(f.users)} <small>人</small></strong><small>${i?'前一步转化 '+percent(f.conversion):'过程起点'}</small><progress max="100" value="${f.conversion==null?0:Math.min(100,n(f.conversion))}" aria-label="${esc(label(f.label||f.key))}转化"></progress></div>`).join(''):empty('暂无可按顺序关联的使用过程。不会把分散发生的事件拼成完成率。');
    renderAnalysis();
    q('[data-spread-funnel-panel]').hidden=!['all','reading'].includes(filters.module);
    q('[data-spread-funnel]').innerHTML=(s.spreadFunnel||[]).length?s.spreadFunnel.map((f,i)=>`<div class="funnel-item"><span>${i+1}. ${esc(label(f.label||f.key))}</span><strong>${num(f.users)} <small>人</small></strong><small>${num(f.visits)} 次访问</small><small>${i?'查看后开始 '+percent(f.conversion):'查看起点'}</small></div>`).join(''):empty('暂无同访问、同牌阵且按顺序发生的查看与开始样本。');
    q('[data-spreads-panel]').hidden=!['all','reading','ai'].includes(filters.module);
    const pair=(count,users)=>`${num(count)} <span class="number">/ ${num(users)}</span>`;
    q('[data-spreads]').innerHTML=(s.spreads||[]).length?s.spreads.map(r=>`<tr><td>${esc(label(r.name,'未记录牌阵'))}${r.users===undefined?'':`<br><span class="number">${r.users===null?'服务调用未关联用户':num(r.users)+' 人使用'}</span>`}</td><td>${pair(r.opens,r.openUsers)}</td><td>${pair(r.starts,r.startUsers)}</td><td>${r.viewToStart?`${num(r.viewToStart.convertedUsers)} / ${num(r.viewToStart.viewUsers)}<br><span class="number">${percent(r.viewToStart.rate)}</span>`:'未记录关联'}</td><td>${pair(r.localViews,r.localUsers)}</td><td>${pair(r.aiRequests,r.aiUsers)}</td><td>${num(r.aiSuccess)} / ${num(r.aiFailures)}</td><td>${num(r.serverCalls)} / ${num(r.serverFailures)}</td></tr>`).join(''):'<tr><td colspan="8">当前范围暂无记录了牌阵的使用行为。</td></tr>';
    q('[data-ai-panel]').hidden=!['all','ai'].includes(filters.module);
    const ai=s.ai||{},statusName=k=>({'200':'正常响应','400':'请求格式错误','401':'认证失败','403':'请求受限','429':'调用过于频繁','500':'服务异常','502':'上游服务异常','503':'服务暂不可用','504':'服务超时',success:'成功',failure:'失败',cancelled:'用户取消',safety:'安全提示',timeout:'超时',error:'服务异常'}[k]||'其他响应');
    const client=ai.client;
    q('[data-ai-client]').innerHTML=client?`<div class="table-scroll"><table><thead><tr><th>用户行为</th><th>次数</th><th>去重人数</th></tr></thead><tbody>${[['发起解读','requests','requestUsers'],['解读成功','success','successUsers'],['解读失败','failures','failureUsers'],['主动取消','cancelled','cancelledUsers'],['收到安全提示','safety','safetyUsers']].map(([title,count,users])=>`<tr><td>${title}</td><td>${num(client[count])}</td><td>${num(client[users])}</td></tr>`).join('')}</tbody></table></div>`:empty('旧版尚未单独记录用户看到的 AI 结果，不能从服务调用推算成功、失败或取消人数。');
    q('[data-ai]').innerHTML=n(ai.total)?`<div class="ai-kpis">${[['服务调用',num(ai.total)+' 次'],['服务成功率',percent(ai.successRate)],['平均耗时',ai.averageMs==null?'暂无样本':(n(ai.averageMs)/1000).toFixed(1)+' 秒'],['95% 调用耗时',ai.p95Ms==null?'暂无样本':(n(ai.p95Ms)/1000).toFixed(1)+' 秒']].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div><p>失败 ${num(ai.failures)} 次；${esc(Object.entries(ai.statuses||{}).map(([k,v])=>`${statusName(k)} ${num(v)} 次`).join(' · '))}</p>`:empty('当前范围没有 AI 服务调用。没有调用时不计算成功率。');
    q('[data-retention]').innerHTML=(p.retention||[]).length?`<div class="retention-list">${p.retention.map(r=>`<div class="retention-row"><strong>第 ${num(r.day)} 天回访 ${percent(r.rate)}</strong><small>回访 ${num(r.returned)} / 可统计 ${num(r.eligible)} 人</small></div>`).join('')}</div>`:empty('暂没有完整的回访观察窗口。');
    q('[data-exits]').innerHTML=(p.exits||[]).length?`<div class="exit-list">${p.exits.map(r=>`<div class="exit-row"><span>${esc(label(r.label||r.page,'未记录位置'))}</span><span>${num(r.count)} 次 / ${num(r.users)} 人</span></div>`).join('')}</div>`:empty('暂无已结束的访问。');
    q('[data-paths]').innerHTML=(p.paths||[]).length?`<div class="paths">${p.paths.map((r,i)=>`<details><summary>访问 ${i+1} · ${esc(time(r.at))} · 最后在${esc(label(r.exit,'未记录位置'))}</summary><ol>${(r.steps||[]).map(e=>`<li>${esc(time(e.at))} · ${esc(label(e.page,'未记录位置'))} · ${esc(label(e.feature||e.event))}</li>`).join('')}</ol></details>`).join('')}</div>`:empty('暂无可关联的访问过程。');
    renderQueries(data.queryAnalysis);
    q('[data-generated]').textContent='更新于 '+time(data.generatedAt)+'（北京时间）';
  }
  async function load(){
    const request=++sequence;controller?.abort();controller=new AbortController();syncFilters();q('[data-error]').textContent='';q('[data-status]').textContent='正在读取当前筛选的数据…';q('[data-dashboard]').setAttribute('aria-busy','true');q('[data-results]').hidden=true;
    try{
      const url=new URL(endpoint(),location.href);Object.entries(filters).forEach(([k,v])=>url.searchParams.set(k,v));
      const response=await fetch(url,{headers:{Authorization:'Bearer '+token},credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal});
      const data=await response.json().catch(()=>({}));if(request!==sequence)return;
      if(!response.ok){const error=Error('HTTP');error.status=response.status;throw error}
      if(!data.product?.range||!data.product?.selected)throw Error('SCHEMA');
      render(data);q('[data-results]').hidden=false;q('[data-login]').hidden=true;q('[data-dashboard]').hidden=false;q('[data-refresh]').hidden=false;q('[data-status]').textContent='';
    }catch(error){
      if(request!==sequence||error.name==='AbortError')return;
      q('[data-results]').hidden=true;
      if(error.status===401||error.status===403){q('[data-dashboard]').hidden=true;token='';try{sessionStorage.removeItem('tarot-admin-session')}catch(_){}q('[data-login]').hidden=false;q('[data-refresh]').hidden=true;q('[data-login] input').value='';q('[data-error]').textContent='管理口令无效或已失效，请重新输入。';q('[data-status]').textContent='';}
      else {if(token){q('[data-dashboard]').hidden=false;q('[data-refresh]').hidden=false;q('[data-login]').hidden=true;}q('[data-status]').textContent=error.status===400?'日期范围无效，请选择最近 90 天内、前后顺序正确的日期。':error.message==='SCHEMA'?'统计接口尚未更新，请稍后刷新；不会用旧版总数代替当前筛选。':'暂时无法读取统计数据，请刷新重试。';if(!token)q('[data-login]').hidden=false;}
    }finally{if(request===sequence)q('[data-dashboard]').setAttribute('aria-busy','false')}
  }
  q('[data-login]').addEventListener('submit',event=>{event.preventDefault();token=event.currentTarget.querySelector('input').value;try{sessionStorage.setItem('tarot-admin-session',token)}catch(_){}load()});
  q('[data-range]').addEventListener('submit',event=>{event.preventDefault();const from=q('[name=from]').value,to=q('[name=to]').value;if(from>to||from<shift(today(),-89)||to>today()){q('[data-status]').textContent='请选择最近 90 天内、开始日期不晚于结束日期的范围。';return}filters={...filters,from,to};parentRange=null;load()});
  q('[data-dashboard]').addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.days){filters={...filters,from:shift(today(),1-Number(b.dataset.days)),to:today()};parentRange=null;load()}
    else if(b.dataset.module||b.dataset.selectModule){filters.module=b.dataset.module||b.dataset.selectModule;load()}
    else if(b.dataset.day){if(!/^\d{4}-\d{2}-\d{2}$/.test(b.dataset.day))return;if(!parentRange&&filters.from!==filters.to)parentRange={from:filters.from,to:filters.to};filters={...filters,from:b.dataset.day,to:b.dataset.day};load()}
    else if(b.hasAttribute('data-back')&&parentRange){filters={...filters,...parentRange};parentRange=null;load()}
  });
  q('[data-refresh]').addEventListener('click',load);syncFilters();if(token)load();
  q('[data-analysis-day]').addEventListener('change',event=>{analysisDay=event.target.value;renderAnalysis()});
  q('[data-query-source]').addEventListener('change',renderQueryItems);
})();
