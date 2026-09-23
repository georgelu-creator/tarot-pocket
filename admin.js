(() => {
  'use strict';
  const q=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const endpoint=()=>window.TAROT_AI_CONFIG?.analyticsEndpoint?.replace(/\/events$/,'/admin/metrics')||'/api/admin/metrics';
  let token='';try{token=sessionStorage.getItem('tarot-admin-session')||'';}catch(_){}
  async function load(){
    q('[data-error]').textContent='';
    try{
      const response=await fetch(endpoint(),{headers:{Authorization:'Bearer '+token},credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
      const data=await response.json();if(!response.ok)throw Error(data.error||'UNAVAILABLE');
      q('[data-login]').hidden=true;q('[data-dashboard]').hidden=false;q('[data-refresh]').hidden=false;
      q('[data-kpis]').innerHTML=[['PV',data.overview.pv],['UV',data.overview.uv],['事件',data.overview.events]].map(x=>`<div><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join('');
      const max=Math.max(1,...data.daily.map(x=>x.pv));q('[data-trend]').innerHTML=data.daily.map(x=>`<div class="bar" style="height:${Math.max(4,x.pv/max*130)}px" title="${esc(x.day)} · PV ${x.pv} / UV ${x.uv}"><small>${esc(x.day.slice(5))}</small></div>`).join('')||'<p>还没有访问数据。</p>';
      const labels={spread_open:'查看牌阵',reading_start:'开始抽牌',reading_reveal:'完成揭牌',ai_confirm:'确认 AI'};const first=Math.max(1,data.funnel.spread_open||0);
      q('[data-funnel]').innerHTML=Object.entries(labels).map(([key,label])=>`<div><b>${label}</b> · ${data.funnel[key]||0}<span style="width:${Math.max(2,(data.funnel[key]||0)/first*100)}%"></span></div>`).join('');
      q('[data-events]').innerHTML=data.events.map(x=>`<tr><td>${esc(x.name)}</td><td>${x.count}</td><td>${x.users}</td></tr>`).join('');
      q('[data-ai]').innerHTML=data.ai.total?`<div class="ai-kpis"><div><small>调用</small><b>${data.ai.total}</b></div><div><small>成功率</small><b>${data.ai.successRate}%</b></div><div><small>平均耗时</small><b>${(data.ai.averageMs/1000).toFixed(1)}s</b></div><div><small>P95</small><b>${(data.ai.p95Ms/1000).toFixed(1)}s</b></div></div><p>失败 ${data.ai.failures} 次 · 状态 ${esc(Object.entries(data.ai.statuses).map(([status,count])=>status+':'+count).join(' / '))}</p>`:'<p>还没有 AI 服务调用。</p>';
      q('[data-generated]').textContent='更新于 '+new Date(data.generatedAt).toLocaleString();
    }catch(error){q('[data-error]').textContent=error.message==='AUTH_REQUIRED'?'口令不正确。':'暂时无法读取统计数据。';q('[data-login]').hidden=false;q('[data-dashboard]').hidden=true;}
  }
  q('[data-login]').addEventListener('submit',event=>{event.preventDefault();token=event.currentTarget.querySelector('input').value;try{sessionStorage.setItem('tarot-admin-session',token);}catch(_){}load();});
  q('[data-refresh]').addEventListener('click',load);if(token)load();
})();
