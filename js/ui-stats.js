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
/* nota de 3 a 10 a partir de lo que el motor registra: goles, tiros, tarjetas, goles encajados y paradas */
function playerRating(M,x,home){
  let r=6.4+Math.max(-0.5,Math.min(0.6,(x.e-(home?M.hr:M.ar).mid)/40));
  M.ev.forEach(e=>{if(e.pid===x.p.id&&e.home===home){if(e.t==='goal')r+=1.2;else if(e.t==='save')r+=0.15;else if(e.t==='miss')r-=0.08;else if(e.t==='card')r-=0.5;else if(e.t==='inj')r-=0.2;}});
  const gf=home?M.hg:M.ag,ga=home?M.ag:M.hg,saves=home?Math.max(0,M.asot-M.ag):Math.max(0,M.hsot-M.hg);
  if(x.slot==='GK')r+=saves*0.28-ga*0.45+(ga===0&&M.m>=60?0.6:0);else if(x.slot==='DEF')r+=-ga*0.22+(ga===0&&M.m>=60?0.5:0);
  r+=Math.max(-0.6,Math.min(0.6,(gf-ga)*0.2));
  return Math.max(3,Math.min(10,r));
}
function matchPlayersHTML(M){
  const side=UI.ms.pside||UI.ms.side,home=side==='h',L=home?M.H:M.A,hc=teamOf(M,true),ac=teamOf(M,false);
  const rows=L.xi.map(x=>{const mine=e=>e.pid===x.p.id&&e.home===home;
    return {x,g:M.goals.filter(q=>q.pid===x.p.id&&q.home===home).length,y:M.ev.some(e=>mine(e)&&e.t==='card'),inj:M.ev.some(e=>mine(e)&&e.t==='inj'),sh:M.ev.filter(e=>mine(e)&&(e.t==='goal'||e.t==='save'||e.t==='miss')).length,r:M.m?playerRating(M,x,home):6};});
  const best=Math.max(...rows.map(q=>q.r));
  return `<div class="seg" style="margin-bottom:8px"><button class="${home?'on':''}" data-act="mpside" data-v="h">${esc(hc.short||hc.name)}</button><button class="${home?'':'on'}" data-act="mpside" data-v="a">${esc(ac.short||ac.name)}</button></div>
   <div class="scroll"><table class="mpl"><tr><th>Pos</th><th>Jugador</th><th class="n">Tiros</th><th class="n">Goles</th><th class="n hm">Cond.</th><th class="n">Nota</th></tr>${rows.map(q=>`<tr><td>${posTag(q.x.slot,q.x.p.sp?q.x.p:null)}</td><td>${esc(shortName(q.x.p,14))}${q.y?' <span class="card-y" title="Amonestado"></span>':''}${q.inj?' <span class="chip bad">Les.</span>':''}${q.r===best&&M.m>10?' ★':''}</td><td class="n">${q.sh}</td><td class="n">${q.g||''}</td><td class="n hm">${Math.round(q.x.p.fit)}%</td><td class="n"><b class="rt ${q.r>=7.5?'hi':q.r<6?'lo':''}">${q.r.toFixed(1)}</b></td></tr>`).join('')}</table></div>`;
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
