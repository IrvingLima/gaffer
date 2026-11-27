"use strict";
/* ================= cantera jugable, cesiones, entrenamiento, eventos, junta ================= */
const ACAD_SLOTS=l=>6+l*2;
const acadFree=()=>ACAD_SLOTS(S.ac.lvl)-S.ac.list.length;
const upgCost=lvl=>Math.round(Math.max(300000,wageBill(userClub())*2.5)*[0,0.6,1.2,2.4,4.8][lvl]/1e4)*1e4;
function academyCost(){const W=wageBill(userClub());return Math.round(W*0.006*S.ac.lvl+S.ac.list.length*W*0.0006);}
function youthDebuts(){return userClub().players.map(i=>S.players[i]).filter(p=>p.h&&p.ap>=5).length;}

function genProspect(hidden){
  const lvl=S.ac.lvl,yab=staffAbSafe('youth'),boost=0.01*(lvl+yab/3);
  const age=ri(15,18),pos=pick(['GK','DEF','DEF','MID','MID','FWD','FWD']),luck=Math.random();
  const pot=luck<0.03+boost?ri(86,96):luck<0.17+boost*2?ri(76,85):ri(58,75);
  const ovr=clamp(Math.round(34+lvl*3+(age-15)*3+gauss()*3+yab*0.4),30,64);
  const p=mkPlayer(pos,ovr,age,age,Math.random()<0.72?userClub().cc:pickNat(userClub().cc),S.user,{});
  p.ovr=ovr;p.ovr0=ovr;p.pot=Math.max(pot,ovr+8);p.age=age;p.a=attrs(pos,ovr);p.w=300;p.ce=S.Y+3;
  p.known=!hidden;p.wk=0;p.ymw=0;p.ym=0;p.yg=0;p.mentor=null;p.int=false;p.where='acad';
  return p;
}
function genIntake(){
  const n=5+S.ac.lvl;S.ac.intake=[];
  for(let i=0;i<n;i++){const p=genProspect(true);S.ac.intake.push(p);}
}
function signProspect(p){
  if(acadFree()<=0)return 'Cantera llena: libera, asciende o cede a alguien.';
  S.ac.intake=S.ac.intake.filter(x=>x.id!==p.id);S.players[p.id]=p;S.ac.list.push(p.id);p.wk=0;return null;
}
function skipIntake(){S.ac.intake=[];}
function devMult(p){
  const parts=[],A=S.ac,yab=staffAbSafe('youth');let m=1;
  const mins=0.55+0.6*clamp((p.ymw||0)/2.5,0,1);m*=mins;parts.push({k:'Minutos',v:mins,txt:mins>=1.0?`Juega con regularidad (${(p.ymw||0).toFixed(1)} partidos recientes).`:mins>=0.8?`Minutos justos (${(p.ymw||0).toFixed(1)}).`:'Juega poco: ponlo en el once juvenil o cédelo.'});
  const st=1+yab*0.02;m*=st;parts.push({k:'Jefe de cantera',v:st,txt:yab>=10?`Buen jefe de cantera (nivel ${yab}).`:`Jefe de cantera mejorable (nivel ${yab}).`});
  const ac=1+0.08*(A.lvl-1);m*=ac;parts.push({k:'Academia',v:ac,txt:`Academia nivel ${A.lvl}.`});
  const mb=mentorBonus(p);m*=mb;parts.push({k:'Mentor',v:mb,txt:mb>1?'Tiene mentor.':'Sin mentor: asígnale un veterano.'});
  const r=rateOf(p);m*=r;parts.push({k:'Personalidad',v:r,txt:`${traitOf(p)}: ${TRAITS[p.tr][2]}.`});
  if(p.int){m*=1.35;parts.push({k:'Plan intensivo',v:1.35,txt:'Plan intensivo activo (coste y riesgo).'});}
  if(p.inj>0){m*=0.3;parts.push({k:'Lesión',v:0.3,txt:`Lesionado ${p.inj} sem.`});}
  if(p.age>=19){m*=0.85;parts.push({k:'Edad',v:0.85,txt:'A partir de los 19 el crecimiento se frena.'});}
  if(p.ovr>=p.pot-2)parts.push({k:'Techo',v:1,txt:'Está cerca de su techo actual.'});
  return {m,parts};
}
function mentorBonus(p){
  if(!p.mentor)return 1;const m=S.players[p.mentor];
  if(!m||m.club!==S.user||m.where!=='first'||m.age<27)return 1;
  return (traitOf(m)==='Profesional'||traitOf(m)==='Líder'||m.ovr>=72)?1.3:1.15;
}
function autoMentors(){
  const seniors=userClub().players.map(i=>S.players[i]).filter(m=>m.age>=27&&m.ovr>=60).sort((a,b)=>(traitOf(b)==='Profesional'||traitOf(b)==='Líder'?1:0)-(traitOf(a)==='Profesional'||traitOf(a)==='Líder'?1:0)||b.ovr-a.ovr);
  const load={};let n=0;
  S.ac.list.map(i=>S.players[i]).sort((a,b)=>b.pot-a.pot).forEach(p=>{
    const m=seniors.find(s=>(load[s.id]||0)<2&&s.pos===p.pos)||seniors.find(s=>(load[s.id]||0)<2);
    if(m){p.mentor=m.id;load[m.id]=(load[m.id]||0)+1;n++;}
  });
  return n;
}
function tickDev(p,mult){
  if(p.ovr>=p.pot||p.age>=24)return 0;
  const lam=(0.06+0.008*(p.pot-p.ovr))*mult*(p.age>=22?0.5:1),pr=1-Math.exp(-lam);
  if(Math.random()<pr){p.ovr++;p.a=p.a.map(x=>clamp(x+(Math.random()<0.5?1:0),18,98));return 1;}return 0;
}
function academyWeek(){
  const A=S.ac,c=userClub(),notes=[];
  A.list.map(i=>S.players[i]).forEach(p=>{
    p.wk++;p.ymw=(p.ymw||0)*0.78;
    const {m}=devMult(p);const g=tickDev(p,m);
    if(p.int){c.budget-=10000*(wageBill(c)>1e6?10:1);if(Math.random()<0.03){p.ovr=Math.max(30,p.ovr-1);notes.push(`${p.name} sufre sobrecarga por el plan intensivo.`);}}
    // potencial dinámico
    if(p.known&&p.age<=20){
      if((p.ymw||0)>=2&&p.yg>=4&&Math.random()<0.04&&p.pot<96){p.pot++;notes.push(`${p.name} rinde por encima de lo esperado: su techo sube (${p.pot}).`);}
      if((p.ymw||0)<0.3&&p.wk>10&&Math.random()<0.03&&p.pot>p.ovr+4){p.pot--;notes.push(`${p.name} se estanca sin jugar: su techo baja (${p.pot}).`);}
    }
    if(!p.known&&(p.wk>=14||staffAbSafe('youth')>=17)){
      p.known=true;
      if(p.pot>=85)notes.push(`¡Se confirma: ${p.name} es una perla! Potencial ${p.pot}.`);
      else if(p.pot<=64)notes.push(`${p.name} tiene un techo bajo (${p.pot}).`);
    }
    if(p.inj>0)p.inj--;
  });
  notes.slice(0,3).forEach(n=>news(n,'y'));
}
/* ---- liga juvenil (sub-19): partidos semanales con minutos visibles ---- */
function youthStrength(c){
  if(c.id===S.user){
    const a=S.ac.list.map(i=>S.players[i]).filter(p=>!p.inj).sort((x,y)=>y.ovr-x.ovr).slice(0,11);
    if(!a.length)return 30;const m=a.reduce((s,p)=>s+p.ovr,0)/a.length;return (a.reduce((s,p)=>s+p.ovr,0)+(11-a.length)*Math.max(30,m-7))/11;
  }
  return clubQ(c)-14+gauss()*3;
}
function poisson(l){let L=Math.exp(-l),k=0,p=1;do{k++;p*=Math.random();}while(p>L);return k-1;}
function youthRound(){
  const lg=leagueOf(S.user);
  if(lg.sched[lg.rd]&&S.t<lg.sched[0].t)return;
  if(lg.rd>=lg.sched.length)return;
  const ids=lg.ids.slice().sort(()=>Math.random()-0.5);
  for(let i=0;i+1<ids.length;i+=2){
    const h=ids[i],a=ids[i+1],sh=youthStrength(S.clubs[h]),sa=youthStrength(S.clubs[a]);
    const hg=poisson(1.4*Math.exp((sh-sa)/22+0.05)),ag=poisson(1.3*Math.exp((sa-sh)/22));
    const th=lg.yt[h],ta=lg.yt[a];th.p++;ta.p++;th.gf+=hg;th.ga+=ag;ta.gf+=ag;ta.ga+=hg;
    if(hg>ag){th.w++;ta.l++;th.pts+=3;}else if(hg<ag){ta.w++;th.l++;ta.pts+=3;}else{th.d++;ta.d++;th.pts++;ta.pts++;}
    [[h,hg],[a,ag]].forEach(([cid,gl])=>{
      if(cid!==S.user)return;
      const xi=S.ac.list.map(i=>S.players[i]).filter(p=>!p.inj).sort((x,y)=>y.ovr-x.ovr);
      xi.slice(0,11).forEach(p=>{p.ymw=(p.ymw||0)+1;p.ym=(p.ym||0)+1;});
      xi.slice(11,14).forEach(p=>{p.ymw=(p.ymw||0)+0.4;});
      for(let g=0;g<gl;g++){const sc=xi.slice(0,11).filter(p=>p.pos!=='GK');if(sc.length){const s=pick(sc.concat(sc.filter(p=>p.pos==='FWD')));s.yg=(s.yg||0)+1;}}
      S.lastYouth={h,a,hg,ag,t:S.t};
    });
  }
}
/* ---- acciones de cantera ---- */
function promote(pid){
  const c=userClub(),p=S.players[pid];if(!p)return 'No existe.';
  if(c.players.length>=27)return 'Plantilla completa (27).';
  S.ac.list=S.ac.list.filter(i=>i!==pid);S.ac.loans=S.ac.loans.filter(i=>i!==pid);
  (S.hist.grads=S.hist.grads||[]).push({Y:S.Y,id:p.id,n:p.name,ovr:p.ovr,pot:p.pot,age:p.age});p.where='first';p.h=1;p.known=true;p.int=false;p.mentor=null;p.fit=100;p.club=S.user;p.lock=null;p.loan=null;
  p.w=Math.max(500,Math.round(wageOf(p)*0.7/100)*100);p.ce=Math.max(p.ce,S.Y+2);c.players.push(pid);
  news(`${p.name} (${p.age}) asciende al primer equipo.`,'y');return null;
}
function releaseProspect(pid){S.ac.list=S.ac.list.filter(i=>i!==pid);S.players[pid].where='retired';S.players[pid].club=null;}
function sellProspect(pid){
  const p=S.players[pid];if(lockDays(p)>0)return null;const price=sellPrice(p);userClub().budget+=price;
  S.ac.list=S.ac.list.filter(i=>i!==pid);p.where='free';p.club=null;S.free.push(pid);
  news(`Traspaso de cantera: ${p.name} vendido por ${EUR(price)}.`,'t');return price;
}
function upgradeAcademy(){
  const A=S.ac,c=userClub();if(A.lvl>=5)return 'Nivel máximo.';
  const cost=upgCost(A.lvl);if(c.budget<cost)return 'Presupuesto insuficiente ('+EUR(cost)+').';
  c.budget-=cost;A.lvl++;return null;
}
/* ---- cesiones con destino, minutos pactados e informe mensual ---- */
function loanOptions(p){
  return S.clubs.filter(c=>c.id!==S.user&&c.tier<=3).map(c=>{
    const lvl=clubQ(c),diff=p.ovr-(lvl-8),exp=clamp(0.45+diff/14,0,1);
    return {c,exp,lvl,ok:p.ovr>=lvl-14};
  }).filter(x=>x.ok).sort((a,b)=>b.exp-a.exp).slice(0,40);
}
function loanOut(pid,cid,role){
  const p=S.players[pid],opt=loanOptions(p).find(x=>x.c.id===cid);if(!opt)return 'Ese club no acepta la cesión.';
  const need=role==='titular'?0.7:role==='rotacion'?0.4:0.15;
  if(opt.exp<need)return `${opt.c.name} no puede garantizarte ese papel (esperan ${Math.round(opt.exp*100)}% de minutos).`;
  S.ac.list=S.ac.list.filter(i=>i!==pid);S.ac.loans.push(pid);
  p.where='loan';p.int=false;p.loan={cid,exp:opt.exp,role,apps:0,goals:0,wk:0,start:S.t};p.wk=p.wk||0;
  news(`${p.name} sale cedido a ${opt.c.name} (${role==='titular'?'titular':role==='rotacion'?'rotación':'minutos'}).`,'y');return null;
}
function recallLoan(pid){
  const p=S.players[pid];S.ac.loans=S.ac.loans.filter(i=>i!==pid);S.ac.list.push(pid);p.where='acad';p.loan=null;
}
function loanWeek(){
  S.ac.loans.map(i=>S.players[i]).forEach(p=>{
    const L=p.loan;if(!L)return;L.wk++;p.wk++;
    const c=S.clubs[L.cid],lvl=clubQ(c);L.hist=L.hist||[];
    if(!L.mod&&Math.random()<0.025){L.mod=0.3;L.until=S.t+42;inbox({ty:'loan',title:`${p.name} ha dejado de jugar en ${c.name}`,body:`El entrenador de ${c.name} ya no cuenta con ${p.name}. Puedes repatriarlo o esperar a que recupere su sitio.`,pid:p.id,ch:[{k:'recall',l:'Repatriar'},{k:'keep',l:'Esperar'}]});}
    if(L.mod&&S.t>L.until){L.mod=null;}
    const exp=clamp((0.45+(p.ovr-(lvl-8))/14)*(L.mod||1),0,1);L.exp=exp;
    const played=Math.random()<exp;L.hist.push(played?1:0);if(L.hist.length>6)L.hist.shift();
    const need=L.role==='titular'?0.7:L.role==='rotacion'?0.4:0.15;L.recent=L.hist.reduce((a,b)=>a+b,0)/L.hist.length;L.sem=L.hist.length<3?'g':L.recent>=need-0.1?'g':L.recent>=need-0.3?'a':'r';
    if(played){L.apps++;if(Math.random()<(p.pos==='FWD'?0.3:p.pos==='MID'?0.12:0.04)*exp*1.5)L.goals++;}
    tickDev(p,(0.7+1.3*exp)*rateOf(p)*1.1*(1+0.02*staffAbSafe('youth')));
    if(!p.known&&p.wk>=14)p.known=true;
    if(L.wk%4===0)inbox({ty:'loan',title:`Informe de cesión: ${p.name}`,body:`En ${c.name} lleva ${L.apps} partido${L.apps===1?'':'s'} y ${L.goals} gol${L.goals===1?'':'es'}. Minutos esperados: ${Math.round(exp*100)}%. Nivel actual ${p.ovr}.`,pid:p.id,
      ch:(L.sem==='r'||L.sem==='a')&&L.wk>=3?[{k:'recall',l:'Repatriar'},{k:'keep',l:'Que siga'}]:null});
  });
}
function returnLoans(sum){
  S.ac.loans.slice().forEach(id=>{const p=S.players[id];p.where='acad';p.loan=null;S.ac.list.push(id);});S.ac.loans=[];
}
function graduates(sum){
  const c=userClub();
  S.ac.list.slice().forEach(id=>{const p=S.players[id];
    if(p.age>=20){S.ac.list=S.ac.list.filter(i=>i!==id);
      if(c.players.length<27){p.where='first';p.h=1;p.known=true;p.int=false;p.mentor=null;p.w=Math.max(500,Math.round(wageOf(p)*0.7/100)*100);p.ce=S.Y+2;c.players.push(id);sum.grads++;news(`${p.name} se gradúa de la cantera al primer equipo.`,'y');}
      else{const pr=sellPrice(p);c.budget+=pr;p.where='free';p.club=null;S.free.push(id);news(`${p.name} traspasado al graduarse (${EUR(pr)}).`,'t');}
    }});
}
/* ---- entrenamiento del primer equipo con feedback semanal ---- */
/* ritmo común de progresión: calibrado para que el nivel del mundo se mantenga estable temporada tras temporada */
let GROW_K=0.22;
/* progresión semanal de un jugador de primer equipo: la misma regla para tu club y para los rivales */
function growPro(p,o){
  if(p.age>29)return false;
  let up=false;
  const played=S.t-p.lp<=10?1:0.55;
  const mult=GROW_K*(1+o.tech*0.02)*rateOf(p)*o.focus*played*(p.plan!=null?1.5:1)*(p.pos==='GK'?(1+o.gk*0.015):1);
  if(p.age<=24){
    if(tickDev(p,mult*1.2))up=true;
  }else if(p.ovr<p.pot&&Math.random()<(0.02+(p.pot-p.ovr)*0.004)*mult){p.ovr++;up=true;}
  // potencial dinámico: sube si juega y rinde, baja si se estanca o se lesiona mucho
  if(p.age>=18&&p.age<=24&&p.where==='first'){
    const idle=p.lp>0?S.t-p.lp>42:S.t>dayOf(S.Y,7,1)+126;
    if(idle&&p.pot>=p.ovr+4&&Math.random()<0.02){p.pot--;if(o.user)p._why=`Lleva semanas sin jugar: su techo baja (de ${p.pot+1} a ${p.pot}). Dale minutos o cédelo.`;}
    else if(p.inj>=8&&p.pot>p.ovr+2&&Math.random()<0.12){p.pot--;if(o.user)p._why='Una lesión larga frena su proyección: baja su techo.';}
    else if(p.age<=23&&p.ap>=12&&S.t-p.lp<=10&&p.pot<96&&p.pot<p.ovr+14&&Math.random()<0.015*GROW_K){p.pot++;if(o.user)p._why=`Es habitual en el once y rinde (${p.ap} partidos): sube su techo.`;}
  }
  if(p.age<=21&&p.known!==false){
    if(p.lp>=S.t-14&&p.g>=3&&Math.random()<0.02*GROW_K&&p.pot<96){p.pot++;if(o.user)p._why=`Su techo sube: juega a menudo y rinde (${p.g} goles esta temporada).`;}
  }
  return up;
}
/* semana de entrenamiento y vestuario de todos los clubes que no diriges */
function aiWeek(){
  S.clubs.forEach(c=>{
    if(c.id===S.user)return;
    const ab=aiAb(c);
    c.players.forEach(id=>{const p=S.players[id];if(!p)return;
      if(growPro(p,{tech:ab,gk:ab,focus:0.8})&&p.age>24){const i=ri(0,5);p.a[i]=clamp(p.a[i]+1,18,98);}
    });
    moraleClub(c,false);
  });
}
function trainingWeek(){
  const c=userClub(),tech=staffAbSafe('tech'),notes=[];
  const grp={att:['FWD'],mid:['MID'],def:['DEF','GK'],bal:['FWD','MID','DEF','GK'],fit:[]}[c.train||'bal'];
  const up=[],idle=[],rep={t:S.t,ups:[],idle:[]};
  c.players.map(i=>S.players[i]).forEach(p=>{
    if(growPro(p,{tech,gk:staffAbSafe('gk'),focus:grp.includes(p.pos)?(c.train==='bal'?0.8:1.5):0.5,user:true}))up.push(p);
  });
  up.forEach(p=>{const L=p.pos==='GK'?ATTL.gk:ATTL.out,idx=({att:[0,1,3],mid:[2,3],def:[4,5],bal:[0,1,2,3,4,5],fit:[5]}[c.train||'bal']||[0,1,2,3,4,5]),ix=p.plan!=null?p.plan:(p.pos==='GK'?ri(0,5):pick(idx));p.a[ix]=clamp(p.a[ix]+1,18,98);
    const pl=S.t-p.lp<=10;rep.ups.push({pid:p.id,txt:`${p.name}: +1 en ${L[ix]} (${pl?'está jugando':'entrenamiento'}${c.train&&c.train!=='bal'?', foco '+({att:'ataque',mid:'medio',def:'defensa',fit:'físico'})[c.train]:''})`});});
  c.players.map(i=>S.players[i]).filter(p=>p.age>=19&&p.age<=29&&p.ovr<p.pot&&S.t-p.lp>21).slice(0,6).forEach(p=>rep.idle.push({pid:p.id,txt:`${p.name} lleva ${Math.max(21,S.t-p.lp)} días sin jugar: su crecimiento está frenado (techo bajo si no suma minutos).`}));
  S.trainRep=(S.trainRep||[]);S.trainRep.unshift(rep);if(S.trainRep.length>6)S.trainRep.length=6;
  if(up.length)notes.push('Entrenamiento: mejoran '+up.slice(0,4).map(p=>`${sname(p)} (${p.ovr})`).join(', ')+(c.train==='fit'?'':`. Foco: ${({att:'ataque',mid:'medio',def:'defensa',bal:'equilibrado'})[c.train||'bal']||'físico'}.`));
  const tired=c.players.map(i=>S.players[i]).filter(p=>p.fit<55);
  if(tired.length>=3)notes.push(`Atención: ${tired.length} jugadores con la condición baja (${tired.slice(0,3).map(sname).join(', ')}). Considera rotar o entrenar el físico.`);
  notes.forEach(n=>news(n,'y'));
}
/* ---- contratos: avisos y expiración ---- */
function contractsWeek(){
  const c=userClub(),mo=dateOf(S.t).getUTCMonth()+1;
  if(![3,5].includes(mo))return;
  const sorted=c.players.map(i=>S.players[i]).sort((a,b)=>b.ovr-a.ovr),cut=sorted[Math.floor(sorted.length*0.6)].ovr;
  c.players.map(i=>S.players[i]).filter(p=>p.ce<=S.Y&&p.remind!==mo&&(p.ovr>=cut||p.pot>=p.ovr+8)).forEach(p=>{
    p.remind=mo;
    inbox({ty:'contract',title:`Contrato por expirar: ${p.name}`,body:`El contrato de ${p.name} (${POSL[p.pos]} ${p.ovr}) termina el 30 de junio. Si no renuevas, se marchará libre.`,pid:p.id,ch:[{k:'renew',l:'Negociar renovación'},{k:'ignore',l:'Dejar marchar'}]});
  });
}
/* ---- junta ---- */
function boardWeek(){
  const c=userClub(),lg=leagueOf(c.id);
  if(c.board<=5){sackUser('La directiva te destituye por los malos resultados.');return;}
  if(lg.rd===Math.floor(lg.sched.length/2)&&!S.midMsg){
    S.midMsg=true;const pos=posOf(c.id);
    inbox({ty:'board',title:'Valoración de la directiva a mitad de temporada',body:`Objetivo: ${S.obj.rtxt}. Posición actual: ${pos}º. Confianza: ${Math.round(c.board)}%. ${pos<=S.obj.rank?'La directiva está satisfecha.':'La directiva espera una reacción.'}`});
  }
  if(lg.rd<lg.sched.length/2)S.midMsg=false;
  if(c.budget<-c.cap*5){c.board=Math.max(0,c.board-1.5);}
}
/* ---- eventos con decisiones ---- */
function eventsWeek(){
  const c=userClub();
  const wk=Math.floor((S.t-dayOf(S.Y,7,1))/7);
  if(wk%4===0&&S.ac.intake.length<8&&acadFree()>0){for(let i=0;i<2;i++)S.ac.intake.push(genProspect(true));news('Jornada de pruebas: llegan 2 nuevos candidatos a la cantera.','y');}
  if(Math.random()>0.32)return;
  const r=Math.random();
  const open=ty=>S.inbox.some(m=>m.ty===ty&&!m.done);
  if(r<0.3&&!open('minutes')){
    const cand=c.players.map(i=>S.players[i]).filter(p=>p.age<=22&&S.t-p.lp>21&&p.pot>=p.ovr+6);
    if(cand.length){const p=pick(cand);inbox({ty:'minutes',title:`${p.name} pide más minutos`,body:`El joven ${p.name} (${p.age}, ${POSL[p.pos]} ${p.ovr}/${showPot(p)}) lleva semanas sin jugar y quiere una solución.`,pid:p.id,
      ch:[{k:'promise',l:'Prometer minutos'},{k:'wait',l:'Que espere'},{k:'loan',l:'Buscar una cesión'}]});return;}
  }
  if(r<0.55&&!open('interest')){
    const cand=S.ac.list.map(i=>S.players[i]).filter(p=>p.known&&p.pot>=72&&!lockDays(p));
    if(cand.length){const p=pick(cand),b=pick(S.clubs.filter(x=>x.id!==c.id&&x.skill>=c.skill-3)),fee=Math.round(valueOf(p)*1.25/1000)*1000;
      inbox({ty:'interest',title:`${b.name} quiere a ${p.name}`,body:`${b.name} ofrece ${EUR(fee)} por tu promesa ${p.name} (${p.age} años, potencial ${p.pot}).`,pid:p.id,cid:b.id,fee,exp:S.t+10,ch:[{k:'sell',l:'Vender'},{k:'refuse',l:'Rechazar'}]});return;}
  }
  S.spCount=S.spCount||{};
  if(r<0.75&&!open('sponsor')&&(S.spCount[S.Y]||0)<2){S.spCount[S.Y]=(S.spCount[S.Y]||0)+1;
    const a=Math.round(c.sp*0.15/100)*100;
    inbox({ty:'sponsor',title:'Oferta de patrocinio',body:`Dos marcas quieren patrocinar tu club. Opción A: +${EUR(a)}/semana fijos. Opción B: +${EUR(Math.round(a*0.5))}/semana y un premio de ${EUR(a*8)} si acabas entre los ${S.obj.rank} primeros.`,
      a,exp:S.t+10,ch:[{k:'A',l:'Opción A (fijo)'},{k:'B',l:'Opción B (riesgo)'},{k:'none',l:'Rechazar'}]});return;
  }
  if(!open('unhappy')){
    const cand=c.players.map(i=>S.players[i]).filter(p=>p.ovr>=60&&S.t-p.lp>35&&p.age>=23);
    if(cand.length){const p=pick(cand);inbox({ty:'unhappy',title:`${p.name} quiere salir`,body:`${p.name} (${p.ovr}) no tiene minutos y pide el traspaso.`,pid:p.id,ch:[{k:'list',l:'Ponerlo en venta'},{k:'persuade',l:'Convencerle'}]});}
  }
}
/* ---- resolver mensajes ---- */
function respond(id,key){
  const m=S.inbox.find(x=>x.id===id);if(!m||m.done)return null;
  const c=userClub();let msg=null;
  const done=()=>{m.done=true;};
  if(m.ty==='loanopt'){
    if(key==='buy'){const p=S.players[m.pid];if(c.budget<m.fee){return 'No tienes presupuesto para la opción de compra.';}
      const from=p.lo&&S.clubs[p.lo.from];c.budget-=m.fee;if(from)from.budget+=m.fee;p.lo=null;p.ce=S.Y+3;p.w=Math.max(p.w,Math.round(wageOf(p)/100)*100);msg=`Has comprado a ${p.name} por ${EUR(m.fee)}.`;news(msg,'t');}
    else msg='Devolverás al jugador a su club.';
    done();save();return msg;}
  if(m.ty==='offer'){
    if(key==='counter')return {open:'counter',mid:m.id};
    if(key==='accept'){
      const p=S.players[m.pid];if(!p||p.club!==S.user){done();return 'El jugador ya no está en tu plantilla.';}
      const err=transferOut(m.pid,m.cid,m.fee);if(err)return err;msg=`Has vendido a ${p.name} por ${EUR(m.fee)}.`;
      if(m.swap!=null){const q=S.players[m.swap],b=S.clubs[m.cid];if(q&&q.club===m.cid){b.players=b.players.filter(i=>i!==q.id);q.club=S.user;q.where='first';q.since=S.t;q.src=null;q.lock=null;userClub().players.push(q.id);msg=`Canje cerrado: te llega ${q.name} (${q.ovr}) y ${EUR(m.fee)} por ${p.name}.`;news(msg,'t');}}
    }else msg='Oferta rechazada.';
    done();
  }else if(m.ty==='interest'){
    if(key==='sell'){const err=transferOutAcademy(m.pid,m.cid,m.fee);if(err)return err;msg='Promesa vendida.';}
    done();
  }else if(m.ty==='sponsor'){
    if(key==='A'){c.sp+=m.a;msg=`+${EUR(m.a)}/semana de patrocinio.`;}
    else if(key==='B'){c.sp+=Math.round(m.a*0.5);S.bonusB={amt:m.a*8,rank:S.obj.rank,Y:S.Y};msg='Patrocinio con bono por resultados firmado.';}
    done();
  }else if(m.ty==='minutes'){
    const p=S.players[m.pid];
    if(key==='promise'){p.promise={till:S.t+42,ap:p.ap+4};msg=`Prometes a ${p.name} que jugará 4 partidos en las próximas 6 semanas.`;}
    else if(key==='wait'){p.ovr=Math.max(30,p.ovr-0);msg='Aceptas que espere.';}
    else if(key==='loan'){done();return {open:'loan',pid:m.pid};}
    done();
  }else if(m.ty==='unhappy'){
    const p=S.players[m.pid];
    if(key==='list'){p.tl=true;msg=`${p.name} queda en la lista de traspasos.`;}
    else{if(Math.random()<0.6)msg=`${p.name} acepta quedarse.`;else{p.tl=true;msg=`${p.name} no se deja convencer y queda en venta.`;}}
    done();
  }else if(m.ty==='loan'){
    if(key==='recall'){recallLoan(m.pid);msg='Cedido repatriado a la cantera.';}
    done();
  }else if(m.ty==='contract'){
    if(key==='renew'){return {open:'renew',pid:m.pid};}
    done();
  }else if(m.ty==='deadline'){
    if(key==='dd'){if(!S.dd||!S.dd.open||S.dd.Y!==userYear())ddOpen();m.done=true;return {open:'dd'};}
    done();
  }else if(m.ty==='ntjob'){
    if(key==='accept')msg=ntAccept(m);else{S.ntDecl=S.t;m.done=true;msg='Has rechazado la oferta de la selección.';}
  }else if(m.ty==='preseason'){
    const r=preseasonPlay(key);m.done=true;msg=`Pretemporada resuelta: ${r.games.length?r.games.join(' · '):'trabajo físico'}${r.prize?' · premio '+EUR(r.prize):''}.`;
  }else if(m.ty==='sponsorpick'){
    msg=sponsorPick(m,key);m.done=true;
  }else if(m.ty==='challenge'){
    if(key==='accept'){acceptChallenge(m);msg='Reto aceptado. Mira tu progreso en el Inicio.';}else{m.done=true;msg='Reto ignorado, sin consecuencias.';}
  }else if(m.ty==='jobOffer'){
    if(key==='accept'){takeJob(m.cid);return {open:'job'};}
    done();msg='Oferta rechazada.';
  }else{done();}
  save();return msg;
}
function transferOutAcademy(pid,buyer,fee){
  const p=S.players[pid];if(!p)return 'No existe.';
  S.ac.list=S.ac.list.filter(i=>i!==pid);const b=S.clubs[buyer];
  userClub().budget+=fee;b.budget-=fee;p.club=b.id;p.where='first';b.players.push(pid);p.ce=S.Y+ri(2,4);p.w=Math.round(wageOf(p)/100)*100;
  news(`Venta de cantera: ${p.name} se va a ${b.name} por ${EUR(fee)}.`,'t');return null;
}
/* promesas de minutos: evaluar */
function checkPromises(){
  const c=userClub();
  c.players.map(i=>S.players[i]).forEach(p=>{
    if(p.promise&&S.t>=p.promise.till){
      if(p.ap>=p.promise.ap){news(`Cumples tu promesa con ${p.name}.`,'y');p.fit=100;}
      else{news(`${p.name} se siente engañado por no cumplir la promesa de minutos.`,'y');p.tl=true;c.board=Math.max(0,c.board-1);}
      p.promise=null;
    }
  });
}

/* ---- evolución del nivel (estilo FIFA): se registra cada cambio de los jugadores que sigues ---- */
function trackOvr(){
  if(S.user==null)return;
  const ids=new Set(),c=userClub();
  if(c)c.players.forEach(i=>ids.add(i));
  if(S.ac){(S.ac.list||[]).concat(S.ac.loans||[]).forEach(i=>ids.add(i));}
  (S.short||[]).forEach(i=>ids.add(i));
  ids.forEach(id=>{const p=S.players[id];if(!p||p.where==='retired')return;
    if(p.ow==null){p.ow=p.ovr;p.pw=p.pot;return;}
    if(p.ovr!==p.ow||p.pot!==p.pw){(p.chg=p.chg||[]).push([S.t,p.ovr-p.ow,p.pot-p.pw,whyChange(p)]);p._why=null;if(p.chg.length>10)p.chg.shift();p.ow=p.ovr;p.pw=p.pot;}
  });
}
const recentDelta=(p,days)=>(p.chg||[]).filter(x=>x[0]>=S.t-(days||28)).reduce((s,x)=>s+x[1],0);

/* explicación en una frase de por qué cambió el nivel o el potencial (nunca un freno invisible) */
function whyChange(p){
  if(p._why)return p._why;
  const dO=p.ovr-p.ow,dP=p.pot-p.pw,played=p.lp>0&&S.t-p.lp<=14;
  if(dP<0)return p.age>=24?'El potencial se ajusta a su edad: ya está cerca de su techo real.':'Rendimiento por debajo de lo esperado: se recorta su techo.';
  if(dO>0)return p.age<=24?(played?'Crece por entrenar y por los minutos que acumula.':'Crece por entrenamiento, aunque jugar más aceleraría el proceso.'):'Mejora por trabajo y confianza.';
  if(dO<0)return p.age>=30?'Baja por la edad.':p.inj?'Baja tras una lesión.':played?'Baja por un bache de rendimiento.':'Baja por falta de ritmo competitivo.';
  return '';
}
