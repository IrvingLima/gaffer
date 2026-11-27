"use strict";
/* ================= estadísticas individuales de tu plantilla ================= */
/* nota de 3 a 10 a partir de lo que registra el motor: goles, asistencias, tiros, tarjetas, goles encajados y paradas */
function playerRating(M,x,home){
  let r=6.4+Math.max(-0.5,Math.min(0.6,(x.e-(home?M.hr:M.ar).mid)/40));
  M.ev.forEach(e=>{if(e.pid===x.p.id&&e.home===home){if(e.t==='goal')r+=1.2;else if(e.t==='save')r+=0.15;else if(e.t==='miss')r-=0.08;else if(e.t==='card')r-=0.5;else if(e.t==='inj')r-=0.2;}});
  r+=M.goals.filter(g=>g.ast===x.p.id&&g.home===home).length*0.7;
  const gf=home?M.hg:M.ag,ga=home?M.ag:M.hg,saves=home?Math.max(0,M.asot-M.ag):Math.max(0,M.hsot-M.hg);
  if(x.slot==='GK')r+=saves*0.28-ga*0.45+(ga===0&&M.m>=60?0.6:0);else if(x.slot==='DEF')r+=-ga*0.22+(ga===0&&M.m>=60?0.5:0);
  r+=Math.max(-0.6,Math.min(0.6,(gf-ga)*0.2));
  return Math.max(3,Math.min(10,r));
}
/* quién da el pase de gol: pesan más los medios y los atacantes */
function pickAssist(xi,scorer){
  if(Math.random()>0.75)return null;
  const W={GK:0.05,DEF:1,MID:3,FWD:2},list=xi.filter(x=>x.p.id!==scorer&&x.p.id>0);if(!list.length)return null;
  let t=Math.random()*list.reduce((s,x)=>s+(W[x.slot]||1)*Math.max(30,x.p.ovr),0);
  for(const x of list){t-=(W[x.slot]||1)*Math.max(30,x.p.ovr);if(t<=0)return x.p.id;}
  return list[list.length-1].p.id;
}
const newStats=()=>({pj:0,g:0,a:0,sh:0,yc:0,cs:0,rt:0,mvp:0});
/* apunta un partido oficial de tu club */
function recordStats(M){
  const home=M.hid===S.user;if(!home&&M.aid!==S.user)return;
  const xi=(home?M.H:M.A).xi.filter(x=>x.p.id>0&&x.p.club===S.user),ga=home?M.ag:M.hg;
  const rated=xi.map(x=>({x,r:playerRating(M,x,home)})),best=rated.reduce((a,b)=>!a||b.r>a.r?b:a,null);
  rated.forEach(({x,r})=>{
    const p=x.p,s=p.ss||(p.ss=newStats()),mine=M.ev.filter(e=>e.pid===p.id&&e.home===home);
    s.pj++;s.rt+=r;
    s.g+=M.goals.filter(g=>g.pid===p.id&&g.home===home).length;
    s.a+=M.goals.filter(g=>g.ast===p.id&&g.home===home).length;
    s.sh+=mine.filter(e=>e.t==='goal'||e.t==='save'||e.t==='miss').length;
    s.yc+=mine.filter(e=>e.t==='card').length;
    if(x.slot==='GK'&&ga===0)s.cs++;
    if(best&&best.x===x)s.mvp++;
  });
}
/* al cerrar la temporada, las cifras pasan al total de la carrera del jugador en tu club */
function closeStats(p){
  if(!p.ss)return;const t=p.car||(p.car=newStats());Object.keys(t).forEach(k=>{t[k]+=p.ss[k]||0;});delete p.ss;
}
