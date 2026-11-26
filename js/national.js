"use strict";
/* ================= dirigir una selección nacional a la vez que tu club (propuesta a validar) ================= */
const NT_COLORS={ES:['#c8102e','#f1bf00'],EN:['#ffffff','#1a2a5e'],DE:['#ffffff','#141414'],IT:['#1a5fa8','#ffffff'],FR:['#1a3a8c','#d4161d'],PT:['#c8102e','#1f8a3c'],NL:['#f26b1d','#141414'],BR:['#f2d000','#1f8a3c'],AR:['#6cabdd','#ffffff'],MX:['#1f8a3c','#d4161d'],US:['#1a2a5e','#d4161d']};
const ntInfo=cc=>{const n=NAT[cc]||{nm:cc};const col=NT_COLORS[cc]||['#2fbf84','#f2f2f0'];return {name:n.nm,short:cc,city:n.nm,c1:col[0],c2:col[1],pat:1,cc};};
function ntPlayers(cc){
  return Object.values(S.players).filter(p=>p.nat===cc&&p.where!=='retired'&&p.age>=18&&p.age<=38&&(p.where==='first'||p.where==='pool'||p.where==='free')).sort((a,b)=>b.ovr-a.ovr);
}
function ntXI(cc,fallbackQ){
  const pool=ntPlayers(cc),need=[['GK',1],['DEF',4],['MID',3],['FWD',3]],used=new Set(),xi=[];
  const q=fallbackQ||50;
  need.forEach(([pos,n])=>{for(let k=0;k<n;k++){
    let c=pool.find(p=>!used.has(p.id)&&p.pos===pos&&!(p.club===S.user&&p.inj));
    if(!c){const o=clamp(Math.round(q-6+gauss()*3),30,80);c={id:-7000-xi.length-(cc.charCodeAt(0)*13),name:genName(cc),nat:cc,pos,age:ri(21,31),ovr:o,pot:o,fit:100,a:attrs(pos,o),ps:[],tr:0,sp:pos==='GK'?'GK':pos==='DEF'?'CB':pos==='MID'?'CM':'ST'};}
    used.add(c.id);xi.push({p:c,slot:pos,e:eff(c),pen:0,spos:pos==='GK'?'GK':pos==='DEF'?'CB':pos==='MID'?'CM':'ST',lat:2,idx:xi.length});}});
  return {xi,bench:pool.filter(p=>!used.has(p.id)).slice(0,5),q:xi.reduce((s,x)=>s+x.p.ovr,0)/11};
}
function ntOpponent(){
  // rivales ponderados por calidad de cantera: se enfrenta sobre todo a selecciones fuertes
  const cands=NATS.filter(n=>n[0]!==S.nt.cc),tot=cands.reduce((t,n)=>t+n[4]*n[4]*n[4],0);let r=Math.random()*tot;
  for(const n of cands){r-=n[4]*n[4]*n[4];if(r<=0)return n[0];}
  return cands[0][0];
}
function ntOfferWeek(){
  const c=userClub();if(!c||S.nt||!S.mgr)return;
  if(S.ntDecl&&S.t-S.ntDecl<240)return;
  if(S.mgr.rep<58||Math.random()>0.05)return;
  if(S.inbox.some(m=>m.ty==='ntjob'&&!m.done))return;
  const nat=NAT[c.cc];if(!nat)return;
  inbox({ty:'ntjob',title:`La selección de ${nat.nm} te quiere`,body:`Tu reputación (${Math.round(S.mgr.rep)}) y el desarrollo de jugadores de ${nat.nm} llaman la atención de la federación. Te ofrecen dirigir la selección a la vez que tu club: jugarás los parones de selecciones (2 partidos por parón) sin pausar ni penalizar a tu club. Puedes dejarlo cuando quieras.`,exp:S.t+30,
    ch:[{k:'accept',l:'Aceptar el cargo'},{k:'decline',l:'Rechazar'}],cc:c.cc});
}
function ntAccept(m){S.nt={cc:m.cc,since:S.t,w:0,d:0,l:0,gf:0,ga:0,fix:[],hist:[],win:null};m.done=true;news(`Eres el nuevo seleccionador de ${NAT[m.cc].nm}.`,'j');return `Eres seleccionador de ${NAT[m.cc].nm}. Tus partidos aparecen en el Inicio durante los parones.`;}
function ntWeek(){
  if(!S.nt)return;
  if(!inIntl(S.t))return;
  const key=Math.floor(S.t/20);if(S.nt.win===key)return;S.nt.win=key;
  // lo que quedó sin jugar se simula
  (S.nt.fix||[]).slice().forEach(f=>ntAuto(f));S.nt.fix=[];
  const kinds=['Amistoso','Clasificación'];
  for(let i=0;i<2;i++)S.nt.fix.push({opp:ntOpponent(),label:kinds[i%2],t:S.t+3+i*4,home:Math.random()<0.5});
  news(`Parón de selecciones: ${NAT[S.nt.cc].nm} juega ${S.nt.fix.map(f=>NAT[f.opp].nm).join(' y ')}.`,'g');
}
function ntRecord(f,my,op){
  const N=S.nt;N.gf+=my;N.ga+=op;
  if(my>op)N.w++;else if(my<op)N.l++;else N.d++;
  N.hist.unshift({t:S.t,opp:f.opp,label:f.label,my,op});if(N.hist.length>12)N.hist.pop();
  S.mgr.rep=clamp(S.mgr.rep+(my>op?0.4:my<op?-0.3:0.05),5,98);
  // los tuyos que están convocados vuelven cansados y con la moral tocada por el resultado
  userClub().players.map(i=>S.players[i]).filter(p=>p.nat===S.nt.cc&&p.ovr>=ntPlayers(S.nt.cc)[Math.min(22,ntPlayers(S.nt.cc).length-1)].ovr).forEach(p=>{p.fit=Math.max(55,p.fit-12);p.mo=clamp((p.mo==null?70:p.mo)+(my>op?3:my<op?-2:0),0,100);p.intl=(p.intl||0)+1;
    if(Math.random()<0.03){p.inj=ri(2,6);news(`${p.name} se lesiona con ${NAT[S.nt.cc].nm}.`,'n');}});
  news(`${NAT[S.nt.cc].nm} ${my}-${op} ${NAT[f.opp].nm} (${f.label}).`,'g');
}
function ntAuto(f){
  const a=ntXI(S.nt.cc,60),b=ntXI(f.opp,35+(NAT[f.opp]?NAT[f.opp].yq*18:20));
  const d=(a.q-b.q);const my=poisson(1.3*Math.exp(d/26+0.05)),op=poisson(1.2*Math.exp(-d/26));
  ntRecord(f,my,op);
}
/* partido jugable con el motor: la selección como local */
function newNtMatch(f){
  const cc=S.nt.cc,A=ntXI(cc,60),B=ntXI(f.opp,35+(NAT[f.opp]?NAT[f.opp].yq*18:20));
  const standIn=(S.user+1)%S.clubs.length;
  const M=newMatch(S.user,standIn,true);
  M.H={xi:A.xi,bench:A.bench};M.A={xi:B.xi,bench:B.bench};
  M.nt=true;M.tc={h:ntInfo(cc),a:ntInfo(f.opp)};M.ntFix=f;M.recalc();
  return M;
}
function commitNtMatch(M){
  const f=M.ntFix;if(!f||!S.nt)return;
  S.nt.fix=S.nt.fix.filter(x=>x!==f);ntRecord(f,M.hg,M.ag);
}
