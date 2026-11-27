"use strict";
/* ================= estadísticas del equipo y notas de los jugadores durante el partido ================= */
function matchStats(M){
  const n=(side,t)=>M.ev.filter(e=>e.home===side&&e.t===t).length,ph=Math.round(M.pw/Math.max(1,M.m)*100);
  const big=side=>M.ev.filter(e=>e.home===side&&(e.t==='goal'||e.t==='save'||e.t==='miss')&&(e.xg||0)>=0.2).length;
  return [['Posesión',ph,100-ph,'%'],['Goles',M.hg,M.ag],['Goles esperados (xG)',+M.hx.toFixed(2),+M.ax.toFixed(2)],['Tiros',M.hs,M.as],['Tiros a puerta',M.hsot,M.asot],['Tiros fuera',Math.max(0,M.hs-M.hsot),Math.max(0,M.as-M.asot)],['Ocasiones claras',big(true),big(false)],['Paradas del portero',Math.max(0,M.asot-M.ag),Math.max(0,M.hsot-M.hg)],['Efectividad de tiro',M.hs?Math.round(M.hg/M.hs*100):0,M.as?Math.round(M.ag/M.as*100):0,'%'],['Tarjetas amarillas',n(true,'card'),n(false,'card')],['Lesionados',n(true,'inj'),n(false,'inj')]];
}
const teamOf=(M,home)=>M.tc?M.tc[home?'h':'a']:S.clubs[home?M.hid:M.aid];
function matchStatsHTML(M){
  const hc=teamOf(M,true),ac=teamOf(M,false);
  return `<div class="mstats"><div class="row spread" style="margin-bottom:6px"><span class="row nw" style="gap:6px">${crest(hc,22)}<b>${esc(hc.short||hc.name)}</b></span><span class="lbl">${UI.ms&&UI.ms.done?'Final':'Min '+M.m+"'"}</span><span class="row nw" style="gap:6px"><b>${esc(ac.short||ac.name)}</b>${crest(ac,22)}</span></div>
   ${matchStats(M).map(([l,h,a,u])=>{const t=h+a,ph=t?h/t*100:50;return `<div class="mst"><div class="mstv"><b class="${h>a?'lead':''}">${h}${u||''}</b><span>${l}</span><b class="${a>h?'lead':''}">${a}${u||''}</b></div><div class="mstb"><i style="width:${ph}%;background:var(--acc)"></i><i style="width:${100-ph}%;background:color-mix(in srgb,var(--ink) 45%,var(--s1))"></i></div></div>`;}).join('')}</div>`;
}
function matchPlayersHTML(M){
  const side=UI.ms.pside||UI.ms.side,home=side==='h',L=home?M.H:M.A,hc=teamOf(M,true),ac=teamOf(M,false);
  const rows=L.xi.map(x=>{const mine=e=>e.pid===x.p.id&&e.home===home;
    return {x,g:M.goals.filter(q=>q.pid===x.p.id&&q.home===home).length,y:M.ev.some(e=>mine(e)&&e.t==='card'),inj:M.ev.some(e=>mine(e)&&e.t==='inj'),sh:M.ev.filter(e=>mine(e)&&(e.t==='goal'||e.t==='save'||e.t==='miss')).length,r:M.m?playerRating(M,x,home):6};});
  const best=Math.max(...rows.map(q=>q.r));
  return `<div class="seg" style="margin-bottom:8px"><button class="${home?'on':''}" data-act="mpside" data-v="h">${esc(hc.short||hc.name)}</button><button class="${home?'':'on'}" data-act="mpside" data-v="a">${esc(ac.short||ac.name)}</button></div>
   <div class="scroll"><table class="mpl"><tr><th>Pos</th><th>Jugador</th><th class="n">Tiros</th><th class="n">Goles</th><th class="n">Asis.</th><th class="n hm">Cond.</th><th class="n">Nota</th></tr>${rows.map(q=>`<tr><td>${posTag(q.x.slot,q.x.p.sp?q.x.p:null)}</td><td>${esc(shortName(q.x.p,14))}${q.y?' <span class="card-y" title="Amonestado"></span>':''}${q.inj?' <span class="chip bad">Les.</span>':''}${q.r===best&&M.m>10?' ★':''}</td><td class="n">${q.sh}</td><td class="n">${q.g||''}</td><td class="n">${M.goals.filter(g=>g.ast===q.x.p.id&&g.home===home).length||''}</td><td class="n hm">${Math.round(q.x.p.fit)}%</td><td class="n"><b class="rt ${q.r>=7.5?'hi':q.r<6?'lo':''}">${q.r.toFixed(1)}</b></td></tr>`).join('')}</table></div>`;
}
function renderMatchTab(){
  const ms=UI.ms,el=document.getElementById('mt-extra');if(!el||!ms||!ms.tab||ms.tab==='live')return;
  el.innerHTML=ms.tab==='stats'?matchStatsHTML(ms.M):matchPlayersHTML(ms.M);
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act="mtab"],[data-act="mpside"]');if(!b||!UI.ms||!UI.m||UI.m.type!=='match')return;
  if(b.dataset.act==='mtab'){UI.ms.tab=b.dataset.v;document.querySelectorAll('.mtabs button').forEach(x=>x.classList.toggle('on',x===b));
    const live=document.getElementById('mt-live'),ex=document.getElementById('mt-extra');if(live)live.hidden=UI.ms.tab!=='live';if(ex)ex.hidden=UI.ms.tab==='live';}
  else UI.ms.pside=b.dataset.v;
  renderMatchTab();e.stopImmediatePropagation();e.preventDefault();
},true);
/* ----- pestaña Equipo → Estadísticas ----- */
const TS_COLS=[['pj','PJ','Partidos como titular'],['g','G','Goles'],['a','A','Asistencias'],['ga','G+A','Goles más asistencias'],['sh','Tiros','Tiros'],['yc','TA','Tarjetas amarillas'],['cs','P0','Porterías a cero (porteros)'],['mvp','MVP','Veces mejor del partido'],['avg','Nota','Nota media']];
function teamStatsRows(total){
  return userClub().players.map(i=>S.players[i]).filter(Boolean).map(p=>{
    const s=newStats();[p.ss,total?p.car:null].forEach(x=>{if(x)Object.keys(s).forEach(k=>{s[k]+=x[k]||0;});});
    return {p,...s,ga:s.g+s.a,avg:s.pj?s.rt/s.pj:0};});
}
function teamStatsHTML(){
  const c=userClub(),total=!!UI.f.stTotal,key=UI.f.stKey||'pj',pos=UI.f.stPos||'ALL';
  const all=teamStatsRows(total),rows=all.filter(r=>pos==='ALL'||r.p.pos===pos).sort((a,b)=>b[key]-a[key]||b.pj-a.pj||b.p.ovr-a.p.ovr);
  const lead=(k,l,f,min)=>{const r=all.filter(x=>x[k]>0&&x.pj>=(min||1)).sort((a,b)=>b[k]-a[k]||b.pj-a.pj)[0];
    return `<${r?`button data-act="player" data-id="${r.p.id}"`:'div'} class="stat lead"><div class="lbl">${l}</div><div class="num">${r?f(r[k]):'—'}</div><div class="sub ellip">${r?esc(r.p.name):'Sin datos'}</div></${r?'button':'div'}>`;};
  const mine=(S.mres||[]).filter(m=>(m.h===c.id||m.a===c.id)&&(total||m.Y===userYear()));
  let w=0,d=0,l=0,gf=0,gc=0,z=0;mine.forEach(m=>{const my=m.h===c.id?m.hg:m.ag,op=m.h===c.id?m.ag:m.hg;gf+=my;gc+=op;if(!op)z++;if(my>op)w++;else if(my<op)l++;else d++;});
  const kv=(a,b)=>`<div class="stat"><div class="lbl">${a}</div><div class="num">${b}</div></div>`;
  return `<div class="seg" style="margin:8px 0"><button class="${total?'':'on'}" data-act="sttotal" data-v="0">Esta temporada</button><button class="${total?'on':''}" data-act="sttotal" data-v="1">Total en tu club</button></div>
   <div class="panel"><div class="hd"><h2>El equipo</h2><span class="sub">${mine.length} partidos</span></div><div class="tsgrid">${kv('G · E · P',`${w} · ${d} · ${l}`)}${kv('Goles a favor',gf)}${kv('En contra',gc)}${kv('Portería a cero',z)}${kv('Goles por partido',mine.length?(gf/mine.length).toFixed(2):'—')}${kv('% de victorias',mine.length?Math.round(w/mine.length*100)+'%':'—')}</div></div>
   <div class="panel"><div class="hd"><h2>Líderes</h2></div><div class="tsgrid">${lead('g','Goleador',v=>v)}${lead('a','Asistente',v=>v)}${lead('avg','Mejor nota',v=>v.toFixed(2),3)}${lead('pj','Más partidos',v=>v)}${lead('mvp','Más veces MVP',v=>v)}${lead('cs','Porterías a cero',v=>v)}</div></div>
   <div class="panel"><div class="hd"><h2>Jugadores</h2><span class="sub">Toca una columna para ordenar</span></div>
    <div class="seg" role="group" aria-label="Posición" style="margin-bottom:8px">${['ALL','GK','DEF','MID','FWD'].map(k=>`<button class="${pos===k?'on':''}" data-act="stpos" data-v="${k}">${k==='ALL'?'Todos':POSL[k]}</button>`).join('')}</div>
    <div class="scroll"><table class="tstab"><tr><th>Jugador</th>${TS_COLS.map(([k,l2,t])=>`<th class="n"><button class="thbtn ${key===k?'on':''}" data-act="stsort" data-v="${k}" title="${t}">${l2}${key===k?' ▾':''}</button></th>`).join('')}</tr>
    ${rows.map(r=>`<tr class="click" data-act="player" data-id="${r.p.id}"><td><span class="tsname">${posTag(r.p.pos,r.p)}<b class="ellip">${esc(shortName(r.p,14))}</b></span></td>${TS_COLS.map(([k])=>`<td class="n ${key===k?'on':''}">${k==='avg'?(r.pj?`<span class="rt ${r.avg>=7?'hi':r.avg<6?'lo':''}">${r.avg.toFixed(2)}</span>`:'—'):r[k]}</td>`).join('')}</tr>`).join('')}</table></div>
    <p class="sub">Cuenta los partidos oficiales (liga y copas) jugados como titular desde la versión 4.48.</p></div>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act="sttotal"],[data-act="stpos"],[data-act="stsort"]');if(!b||!S)return;
  if(b.dataset.act==='sttotal')UI.f.stTotal=b.dataset.v==='1';else if(b.dataset.act==='stpos')UI.f.stPos=b.dataset.v;else UI.f.stKey=b.dataset.v;
  e.stopImmediatePropagation();e.preventDefault();render();
},true);
