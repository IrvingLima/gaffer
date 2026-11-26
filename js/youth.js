"use strict";
/* ================= liga juvenil jugable con el mismo motor de partido ================= */
function youthApply(lg,h,a,hg,ag,scorers){
  const th=lg.yt[h],ta=lg.yt[a];if(!th||!ta)return;
  th.p++;ta.p++;th.gf+=hg;th.ga+=ag;ta.gf+=ag;ta.ga+=hg;
  if(hg>ag){th.w++;ta.l++;th.pts+=3;}else if(hg<ag){ta.w++;th.l++;ta.pts+=3;}else{th.d++;ta.d++;th.pts++;ta.pts++;}
  [[h,hg],[a,ag]].forEach(([cid,gl])=>{
    if(cid!==S.user)return;
    const xi=S.ac.list.map(i=>S.players[i]).filter(p=>p&&!p.inj).sort((x,y)=>y.ovr-x.ovr);
    const starters=(scorers&&scorers.xi)?scorers.xi.map(i=>S.players[i]).filter(Boolean):xi.slice(0,11);
    starters.forEach(p=>{p.ymw=(p.ymw||0)+1;p.ym=(p.ym||0)+1;});
    xi.filter(p=>!starters.includes(p)).slice(0,3).forEach(p=>{p.ymw=(p.ymw||0)+0.4;});
    if(scorers&&scorers.goals){scorers.goals.forEach(pid=>{const s=S.players[pid];if(s)s.yg=(s.yg||0)+1;});}
    else for(let g=0;g<gl;g++){const sc=starters.filter(p=>p.pos!=='GK');if(sc.length){const s=pick(sc.concat(sc.filter(p=>p.pos==='FWD')));s.yg=(s.yg||0)+1;}}
    S.lastYouth={h,a,hg,ag,t:S.t};
  });
}
function youthAuto(lg,q){
  const sh=youthStrength(S.clubs[q.h]),sa=youthStrength(S.clubs[q.a]);
  const hg=poisson(1.4*Math.exp((sh-sa)/22+0.05)),ag=poisson(1.3*Math.exp((sa-sh)/22));
  youthApply(lg,q.h,q.a,hg,ag,null);
}
function youthRound(){
  const lg=leagueOf(S.user);
  if(lg.sched[lg.rd]&&S.t<lg.sched[0].t)return;
  if(lg.rd>=lg.sched.length)return;
  if(S.yp){const q=S.yp;S.yp=null;if(S.leagues[q.lg]===lg)youthAuto(lg,q);}   // el partido que no jugaste se simula
  const ids=lg.ids.slice().sort(()=>Math.random()-0.5);
  for(let i=0;i+1<ids.length;i+=2){
    const h=ids[i],a=ids[i+1];
    if(h===S.user||a===S.user){S.yp={h,a,t:S.t,lg:lg.id};continue;}
    const sh=youthStrength(S.clubs[h]),sa=youthStrength(S.clubs[a]);
    youthApply(lg,h,a,poisson(1.4*Math.exp((sh-sa)/22+0.05)),poisson(1.3*Math.exp((sa-sh)/22)),null);
  }
}
/* once juvenil de tu cantera y rival generado, listos para el motor de partido */
function newYouthMatch(){
  const q=S.yp;if(!q)return null;
  const me=S.clubs[S.user],oppId=q.h===S.user?q.a:q.h,opp=S.clubs[oppId];
  const mine=S.ac.list.map(i=>S.players[i]).filter(p=>p&&!p.inj).sort((a,b)=>eff(b)-eff(a));
  const pickXI=(pool)=>{
    const need=[['GK',1],['DEF',4],['MID',4],['FWD',2]],used=new Set(),xi=[];
    need.forEach(([pos,n])=>{for(let k=0;k<n;k++){let c=pool.filter(p=>!used.has(p.id)&&p.pos===pos)[0]||pool.filter(p=>!used.has(p.id)&&(pos==='GK'?p.pos==='GK':p.pos!=='GK'))[0];
      if(c){used.add(c.id);xi.push({p:c,slot:pos,e:eff(c)-(c.pos===pos?0:6),pen:0,spos:pos==='GK'?'GK':pos==='DEF'?'CB':pos==='MID'?'CM':'ST',lat:2,idx:xi.length});}}});
    return {xi,bench:pool.filter(p=>!used.has(p.id)).slice(0,5)};
  };
  // si tu cantera tiene menos de 11 sanos, se completa con suplentes de menor nivel
  const avgO=mine.length?mine.reduce((t,x)=>t+x.ovr,0)/mine.length:40,fill=[];
  for(let k=mine.length;k<16;k++){const pos=['GK','DEF','DEF','MID','MID','FWD'][k%6],o=Math.max(30,Math.round(avgO-7));fill.push({id:-9000-k,name:'Canterano de apoyo',nat:me.cc,pos,age:15,ovr:o,pot:o,fit:100,a:attrs(pos,o),ps:[],tr:0});}
  const L1=pickXI(mine.concat(fill));
  // rival juvenil generado: jugadores temporales con el nivel de su cantera
  const ys=youthStrength(opp),temp=[];
  const POS=['GK','DEF','DEF','DEF','DEF','MID','MID','MID','MID','FWD','FWD','DEF','MID','FWD','MID'];
  POS.forEach((pos,i)=>{const o=clamp(Math.round(ys+gauss()*4),30,80);temp.push({id:-5000-i,name:genName(opp.cc),nat:opp.cc,pos,age:ri(15,18),ovr:o,pot:o+8,fit:100,a:attrs(pos,o),ps:[],sp:pos==='GK'?'GK':pos==='DEF'?'CB':pos==='MID'?'CM':'ST',tr:0});});
  const L2=pickXI(temp);
  const M=newMatch(q.h,q.a,true);
  if(q.h===S.user){M.H=L1;M.A=L2;}else{M.H=L2;M.A=L1;}
  M.youth=true;M.recalc();
  return M;
}
function commitYouthMatch(M){
  const q=S.yp;if(!q)return;const lg=S.leagues[q.lg]||leagueOf(S.user);
  const L=q.h===S.user?M.H:M.A,xiIds=L.xi.map(x=>x.p.id).filter(i=>i>0);
  const goals=M.goals.filter(g=>(g.home===(q.h===S.user))&&g.pid>0).map(g=>g.pid);
  youthApply(lg,q.h,q.a,M.hg,M.ag,{xi:xiIds,goals});
  S.yp=null;
  news(`Liga juvenil: ${S.clubs[q.h].short} ${M.hg}-${M.ag} ${S.clubs[q.a].short}.`,'y');
}
