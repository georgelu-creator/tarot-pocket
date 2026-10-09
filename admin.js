(() => {
  'use strict';
  const q=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names={home:'首页',courses:'学牌',library:'牌库',reading:'抽牌',records:'记录',page_view:'访问页面',screen_view:'进入模块',screen_exit:'离开模块',feature_click:'功能点击',home_learn:'首页进入学牌',home_read:'首页进入抽牌',reading_category:'切换抽牌分类',spread_open:'查看牌阵',reading_start:'开始抽牌',reading_pick:'选牌',reading_reveal:'揭牌',offline_reading_view:'阅读本地解读',ai_confirm:'确认 AI 解读',ai_cancel:'取消 AI 解读',learning_start:'开始学习',learning_answer:'回答练习',learning_complete:'完成学习',dossier_open:'打开单牌资料',guided:'继续系统学习','guided-card':'选择一张牌学习',answer:'回答练习',next:'下一步',card:'打开单牌',guide:'查看牌阵',start:'开始',pick:'选牌',reveal:'揭牌','reference-spread':'查看牌阵资料','library-view':'切换牌库目录','nav-home':'首页导航','nav-courses':'学牌导航','nav-reading':'抽牌导航','nav-library':'牌库导航'};
  const label=value=>names[value]||value;
  const endpoint=()=>window.TAROT_AI_CONFIG?.analyticsEndpoint?.replace(/\/events$/,'/admin/metrics')||'/api/admin/metrics';
  let token='';try{token=sessionStorage.getItem('tarot-admin-session')||'';}catch(_){}
  async function load(){
    q('[data-error]').textContent='';
    try{
      const response=await fetch(endpoint(),{headers:{Authorization:'Bearer '+token},credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
      const data=await response.json();if(!response.ok)throw Error(data.error||'UNAVAILABLE');
      q('[data-login]').hidden=true;q('[data-dashboard]').hidden=false;q('[data-refresh]').hidden=false;
      q('[data-kpis]').innerHTML=[['PV',data.overview.pv],['UV',data.overview.uv],['事件',data.overview.events]].map(x=>`<div><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join('');
      const max=Math.max(1,...data.daily.map(x=>x.pv));q('[data-trend]').innerHTML=data.daily.map(x=>`<div class="bar" title="${esc(x.day)} · PV ${x.pv} / UV ${x.uv}"><small>${esc(x.day.slice(5))}</small></div>`).join('')||'<p>还没有访问数据。</p>';
      q('[data-trend]').querySelectorAll('.bar').forEach((el,i)=>{el.style.height=Math.max(4,data.daily[i].pv/max*130)+'px';});
      const labels={spread_open:'查看牌阵',reading_start:'开始抽牌',reading_reveal:'完成揭牌',ai_confirm:'确认 AI'};const first=Math.max(1,data.funnel.spread_open||0);
      q('[data-funnel]').innerHTML=Object.entries(labels).map(([key,label])=>`<div><b>${label}</b> · ${data.funnel[key]||0}<span></span></div>`).join('');
      q('[data-funnel]').querySelectorAll('span').forEach((el,i)=>{el.style.width=Math.min(100,Math.max(2,(data.funnel[Object.keys(labels)[i]]||0)/first*100))+'%';});
      q('[data-events]').innerHTML=data.events.map(x=>`<tr><td>${esc(label(x.name))}</td><td>${x.count}</td><td>${x.users}</td></tr>`).join('');
      q('[data-ai]').innerHTML=data.ai.total?`<div class="ai-kpis"><div><small>调用</small><b>${data.ai.total}</b></div><div><small>成功率</small><b>${data.ai.successRate}%</b></div><div><small>平均耗时</small><b>${(data.ai.averageMs/1000).toFixed(1)}s</b></div><div><small>P95</small><b>${(data.ai.p95Ms/1000).toFixed(1)}s</b></div></div><p>失败 ${data.ai.failures} 次 · 状态 ${esc(Object.entries(data.ai.statuses).map(([status,count])=>status+':'+count).join(' / '))}</p>`:'<p>还没有 AI 服务调用。</p>';
      q('[data-retention]').innerHTML=(data.retention||[]).map(r=>`<p>${r.day}日留存：${r.rate==null?'窗口尚未完成':r.rate+'%'} · 回访 ${r.returned} / 可统计 ${r.eligible}</p>`).join('');
      q('[data-features]').innerHTML=(data.features||[]).map(r=>`<tr><td>${esc(label(r.feature))}</td><td>${r.count}</td></tr>`).join('');
      q('[data-exits]').innerHTML=(data.exits||[]).map(r=>`<p>${esc(label(r.page))} · ${r.count} 次</p>`).join('')||'<p>暂无已结束的访问。</p>';
      q('[data-paths]').innerHTML=(data.paths||[]).map(r=>`<details><summary>${esc(new Date(r.at).toLocaleString())} · ${esc(r.session)} · ${esc(label(r.exit))}</summary><ol>${r.steps.map(e=>`<li>${esc(new Date(e.at).toLocaleTimeString())} · ${esc(label(e.page))} · ${esc(label(e.feature||e.event))}</li>`).join('')}</ol></details>`).join('')||'<p>暂无行为路径。</p>';
      q('[data-queries]').innerHTML=(data.feedback||[]).map(r=>`<article><small>${esc(new Date(r.at).toLocaleString())}</small><p class="query-text">${esc(r.question)}</p></article>`).join('')||'<p>暂无用户同意提交的问题。</p>';
      q('[data-generated]').textContent='更新于 '+new Date(data.generatedAt).toLocaleString();
    }catch(error){q('[data-error]').textContent=error.message==='AUTH_REQUIRED'?'口令不正确。':'暂时无法读取统计数据。';q('[data-login]').hidden=false;q('[data-dashboard]').hidden=true;}
  }
  q('[data-login]').addEventListener('submit',event=>{event.preventDefault();token=event.currentTarget.querySelector('input').value;try{sessionStorage.setItem('tarot-admin-session',token);}catch(_){}load();});
  q('[data-refresh]').addEventListener('click',load);if(token)load();
})();
