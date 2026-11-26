"use strict";
/* ================= fin de temporada (30 de junio) y carrera del entrenador ================= */
function inbox(m){m.id=S.uid++;m.t=S.t;m.done=false;S.inbox.unshift(m);if(S.inbox.length>70)S.inbox.length=70;return m;}
function genObjectives(){
  const c=userClub();if(!c){S.obj={};return;}
  const lg=leagueOf(c.id),n=lg.ids.length,r=expectedRank(c),L=LG_BY_CC[c.cc];let target,txt;
  if(c.tier===1){
    if(r<=2){target=3;txt='Terminar entre los 3 primeros';}
    else if(r<=6){target=Math.max(5,r-1);txt=`Terminar entre los ${target} primeros`;}
    else if(r<=Math.round(n/2)){target=Math.round(n/2);txt='Acabar en la mitad alta de la tabla';}
    else{target=n-L.ud-1;txt='Evitar el descenso';}
  }else{
    if(r<=3){target=L.ud;txt='Ascender de categoría';}
    else if(r<=Math.round(n/2)){target=Math.round(n*0.55);txt='Acabar en la mitad alta de la tabla';}
    else{target=n-L.ud-1;txt=c.tier<4?'Evitar el descenso':'Evitar la zona baja de la tabla';}
  }
  let yt=c.tier===1?1:2;if(c.phil==='cantera')yt+=1;else if(c.phil==='fichajes')yt=Math.max(0,yt-1);
  S.obj={rank:target,rtxt:txt,youth:yt,fin:true,cup:cupTarget(),phil:c.phil||null};
}
function sortedFinal(lg){return lg.final||sortedTable(lg).map(r=>r.id);}
function leagueClose(sum,sel){
  const uc=userClub();
  // 1. tablas finales, campeones, premios
  S.leagues.forEach(lg=>{
    if(!sel(lg.cc))return;const Y=calOf(lg.cc)?lg.Y:S.Y;
    const tab=sortedTable(lg);lg.final=tab.map(r=>r.id);
    const ch=S.clubs[tab[0].id];S.hist.champs.push({Y,lg:lg.id,club:ch.name,cid:ch.id,pts:tab[0].pts,cal:calOf(lg.cc)});
    if(lg.tier===1)ch.hist.titles++;
    tab.forEach((r,i)=>{const c=S.clubs[r.id],n=tab.length;
      c.hist.seasons++;c.hist.best=Math.min(c.hist.best,i+1);
      const prize=Math.round((c.tv+c.sp)*52*[0.12,0.08,0.06,0.05][lg.tier-1]*(1.5-i/(n-1))/1e4)*1e4;c.budget+=prize;c.lastPrize=prize;});
    if(lg.tier===1)sum.champs.push({lg:lg.nm,cc:lg.cc,club:ch.name,cid:ch.id});
  });
  if(uc&&sel(uc.cc)){
    const lg=leagueOf(uc.id),Y=calOf(uc.cc)?lg.Y:S.Y,pos=lg.final.indexOf(uc.id)+1,n=lg.ids.length;
    const o=S.obj||{};
    const rankOk=pos<=(o.rank||n),yd=youthDebuts(),youthOk=yd>=(o.youth||0),finOk=uc.budget>=0;
    sum.user={pos,n,lg:lg.nm,cc:uc.cc,champion:pos===1,prize:uc.lastPrize,rankOk,youthOk,finOk,yd,
      pts:lg.tab[uc.id].pts,gf:lg.tab[uc.id].gf,ga:lg.tab[uc.id].ga,rtxt:o.rtxt,yTarget:o.youth,
      top:Object.values(S.players).filter(p=>p.club===uc.id&&p.where==='first').sort((a,b)=>b.g-a.g).slice(0,3).map(p=>({n:p.name,g:p.g,ap:p.ap}))};
    uc.board=clamp(Math.round(uc.board+(rankOk?12:-10)+(youthOk?(uc.phil==='cantera'?7:4):0)+(finOk?(uc.phil==='fichajes'?4:2):-5)),0,100);
    if(S.bonusB&&(S.bonusB.Y===S.Y||calOf(uc.cc))){if(pos<=S.bonusB.rank){uc.budget+=S.bonusB.amt;sum.bonus=S.bonusB.amt;}S.bonusB=null;}
    const L=LG_BY_CC[uc.cc];
    fundCondEnd(uc,pos);
    S.mgr.rep=clamp(S.mgr.rep+(rankOk?3:-3)+(pos===1?(uc.tier===1?6:3):0)+(uc.tier>1&&pos<=L.ud?4:0)+(uc.tier<4&&pos>n-L.ud?-8:0),5,98);
    {const XI=lineup(uc.id).xi.filter(x=>x.p.id>0).map(x=>({id:x.p.id,n:x.p.name,sp:x.spos,ovr:x.p.ovr,g:x.p.g||0,ap:x.p.ap||0}));
     const upd=uc.tier>1&&pos<=L.ud,dwn=uc.tier<4&&pos>n-L.ud;
     S.mgr.hist.push({Y,club:uc.name,cc:uc.cc,lg:lg.nm,pos,n,champion:pos===1,cal:calOf(uc.cc),xi:XI,champ:S.clubs[lg.final[0]].name,pts:lg.tab[uc.id].pts,gf:lg.tab[uc.id].gf,ga:lg.tab[uc.id].ga,mv:upd?'up':dwn?'down':'',tier:uc.tier,topscorer:(sum.user.top&&sum.user.top[0])?sum.user.top[0]:null});}
    S.mgr.titles=(S.mgr.titles||0)+(pos===1&&uc.tier===1?1:0);
  }
  S.nextQual=S.nextQual||{};LEAGUES.forEach(L=>{if(sel(L.cc))S.nextQual[L.cc]=S.leagues.find(l=>l.cc===L.cc&&l.tier===1).final.slice();});
  const tnSum=[];
  const ucIn=!!(uc&&sel(uc.cc)),ucY=ucIn?leagueOf(uc.id).Y:0;
  if(ucIn&&S.tn){Object.values(S.tn).forEach(T=>{if(T.kind==='cup'&&T.cc!==uc.cc)return;if(T.kind==='cup'&&calOf(uc.cc)&&T.Y!==ucY)return;if(T.kind==='cont'&&!T.teams.includes(uc.id))return;const o=T.champion===uc.id?1:(T.out[uc.id]!=null?T.out[uc.id]:99);tnSum.push({nm:T.nm,champ:T.champion===uc.id,out:o,txt:T.champion===uc.id?'Campeón':o===99?'No disputada':o===32&&T.kind==='cont'?'Fase de grupos':'Eliminado en '+roundNameBySize(T,o)});});}
  sum.tn=tnSum;
  const cupPlayed=ucIn&&(!calOf(uc.cc)||(S.tn['cup:'+uc.cc]&&S.tn['cup:'+uc.cc].Y===ucY));
  if(cupPlayed&&S.obj&&S.obj.cup){const co=userCupOut();sum.cupOk=co<=S.obj.cup.out;uc.board=clamp(Math.round(uc.board+(sum.cupOk?3:0)),0,100);}
  if(ucIn&&typeof sponsorBonusEnd==='function')sponsorBonusEnd(uc,sum);
  // 2. ascensos y descensos en toda la piramide
  LEAGUES.forEach(L=>{
    if(!sel(L.cc))return;
    const lgs=S.leagues.filter(l=>l.cc===L.cc).sort((a,b)=>a.tier-b.tier),k=L.ud,mv={cc:L.cc,up:[],down:[]};
    for(let i=0;i<lgs.length-1;i++){
      const U=lgs[i],D=lgs[i+1],down=U.final.slice(-k),up=D.final.slice(0,k);
      U.ids=U.ids.filter(id=>!down.includes(id)).concat(up);D.ids=D.ids.filter(id=>!up.includes(id)).concat(down);
      up.forEach(id=>{const c=S.clubs[id];c.tier=U.tier;c.lg=U.id;c.rep=Math.min(95,c.rep+6);c.tv=Math.round(c.tv*1.5);});
      down.forEach(id=>{const c=S.clubs[id];c.tier=D.tier;c.lg=D.id;c.rep=Math.max(2,c.rep-6);c.tv=Math.round(c.tv*0.8);});
      if(i===0){mv.up=up.map(id=>S.clubs[id].name);mv.down=down.map(id=>S.clubs[id].name);}
    }
    sum.moves.push(mv);
  });
}
function endSeason(){
  const Y=S.Y,sum={Y,label:seasonLabel(Y),user:null,moves:[],champs:[],lost:[],grads:0};
  const uc=userClub();S.nextQual={};
  leagueClose(sum,cc=>!calOf(cc));
  if(uc)loanInSeasonEnd();
  // 3. jugadores: edad, desarrollo, retiros
  const retired=[];
  Object.values(S.players).forEach(p=>{
    if(p.where==='retired')return;
    const b=p.ovr;p.age++;
    const mine=p.club===S.user||p.where==='acad'||p.where==='loan';
    if(p.age<=23){p.ovr=Math.min(p.pot,p.ovr+(mine?ri(0,1):ri(0,3)));}
    else if(p.age<=29){p.ovr=clamp(p.ovr+ri(-1,1),38,Math.max(p.pot,p.ovr)+1);}
    else if(p.age<=32)p.ovr=Math.max(38,p.ovr-ri(0,2));
    else p.ovr=Math.max(38,p.ovr-ri(1,3));
    p.pot=Math.max(p.ovr,Math.min(p.pot,p.ovr+potHead(p.age)));
    const d=p.ovr-b;if(d)p.a=p.a.map(x=>clamp(x+d+ri(-1,1),18,98));
    if(p.age>=35&&Math.random()<(p.age-34)*0.22&&p.where!=='acad')retired.push(p);
  });
  retired.forEach(p=>{
    const c=p.club!=null?S.clubs[p.club]:null;
    if(c)c.players=c.players.filter(i=>i!==p.id);
    S.free=S.free.filter(i=>i!==p.id);
    if(p.where==='pool'&&S.pools[p.nat])S.pools[p.nat]=S.pools[p.nat].filter(i=>i!==p.id);
    if(c&&c.id===S.user)news(`${p.name} (${p.age}) se retira del fútbol.`,'n');
    p.where='retired';p.club=null;
  });
  applyPrecontracts(sum);
  // 4. contratos
  S.clubs.forEach(c=>{
    const leave=[];
    c.players.forEach(id=>{const p=S.players[id];
      if(p.ce<=Y){
        if(c.id===S.user)leave.push(p);
        else if(Math.random()<0.72){p.ce=Y+ri(1,4);p.w=Math.round(p.w*1.08/100)*100;}
        else leave.push(p);
      }
    });
    leave.forEach(p=>{c.players=c.players.filter(i=>i!==p.id);p.club=null;p.where='free';S.free.push(p.id);p.fa=S.t;
      if(c.id===S.user){sum.lost.push(p.name);}});
  });
  S.free=S.free.filter(id=>{const p=S.players[id];return p&&p.where==='free'&&p.age<36;});
  if(S.free.length>900){S.free.sort((a,b)=>S.players[b].ovr-S.players[a].ovr);S.free.slice(900).forEach(id=>{S.players[id].where='retired';S.players[id].club=null;});S.free=S.free.slice(0,900);}
    // 5. nueva temporada
  S.Y=Y+1;
  S.leagues.forEach(lg=>{if(calOf(lg.cc))return;resetTables(lg);lg.sched=genSched(lg,S.Y);lg.rd=0;});
  Object.values(S.players).forEach(p=>{if(p.where==='retired')return;p.fit=100;p.inj=0;p.ovr0=p.ovr;p.lp=-9;if(p.club!=null&&S.clubs[p.club]&&calOf(S.clubs[p.club].cc))return;p.g=0;p.ap=0;p.ym=0;p.yg=0;});
  Object.keys(S.know).forEach(id=>{S.know[id]=Math.round(S.know[id]*0.85);if(S.know[id]<20)delete S.know[id];});
  S.clubs.forEach(c=>{if(c.id!==S.user){refillClub(c,19);c.wageCap=Math.round(wageBill(c)*1.12);}c.form5=[];});
  refreshPools();buildTournaments(S.nextQual);
  genFreeClass(1);
  // 5b. economía: los ingresos de la IA se reajustan a su masa salarial; sin números rojos ni acumulación infinita
  S.clubs.forEach(c=>{
    const W=wageBill(c);
    if(c.id===S.user){c.sp=Math.round(c.sp*(1.02+(sum.user&&sum.user.rankOk?0.03:0)));c.tv=Math.round(c.tv*1.02);return;}
    const gateW=c.cap*clamp(0.42+c.rep/160,0.2,1)*c.price0*0.5,R=W*1.3,rest=Math.max(R-gateW,R*0.4);
    c.tv=Math.round(rest*0.5);c.sp=Math.round(rest*0.5);c.staffC=Math.round(W*0.04);c.wageCap=Math.round(W*1.12);
    if(c.budget<0)c.budget=0;
    const cap=W*52*0.9;if(c.budget>cap)c.budget-=(c.budget-cap)*0.6;
  });
  // 6. AI managers: cese de los peores
  S.clubs.forEach(c=>{if(c.id===S.user||!c.mg||calOf(c.cc))return;
    const pos=c.lg!=null?sortedFinal(S.leagues[c.lg]).indexOf(c.id)+1:1;
    if(pos>0&&pos-expectedRank(c)>Math.max(5,S.leagues[c.lg].ids.length*0.3)&&Math.random()<0.5){S.mgrs.push({n:c.mg.n,rep:Math.max(5,c.mg.rep-5),id:S.mid++});news(`${c.name} destituye a ${c.mg.n}: terminó ${pos}º, lejos de lo esperado (${expectedRank(c)}º).`,'j');c.mg=null;c.vac=0;}
    else if(c.mg)c.mg.rep=Math.round(clamp(c.mg.rep+(pos<=3?2:pos>=15?-2:0),5,95));});
  // 7. usuario: cantera, objetivos, staff, avisos, ofertas
  const ucCal=!!(uc&&calOf(uc.cc));
  if(uc){
    if(!ucCal&&uc.board<=10){S.summary=sum;sackUser('La directiva ha perdido la confianza tras la temporada.');return;}
    S.ac.list.concat(S.ac.loans).forEach(id=>{S.players[id].known=true;});
    returnLoans(sum);graduates(sum);genIntake();S.staff.hired=S.staff.hired.filter(s=>{s.ce--;if(s.ce<=0){sum.staffLeft=(sum.staffLeft||[]).concat(s.nm);return false;}return true;});
    refreshStaffMarket();
    uc.wageCap=Math.round(wageBill(uc)*1.3);
    if(ucCal){inbox({ty:'season',title:'Cierre del año deportivo',body:'Con el 30 de junio vencen contratos y se renueva la cantera. Tu liga sigue en juego.'});}
    else{genObjectives();
    inbox({ty:'season',title:`Resumen de la temporada ${sum.label}`,body:`Has terminado ${sum.user.pos}º en ${sum.user.lg}. Objetivo: ${sum.user.rankOk?'cumplido':'fallado'}.`});
    jobOffersSeason(sum);}
  }
  if(ucCal){news('Fin del año deportivo europeo: se renuevan contratos y cantera.','s');save();return;}
  S.summary=sum;
  news(`Fin de la temporada ${sum.label}. Campeones: ${sum.champs.slice(0,4).map(c=>c.club).join(', ')}…`,'s');
  save();
}
function closeCalYear(cc){
  const uc=userClub(),lg1=S.leagues.find(l=>l.cc===cc&&l.tier===1),Y=lg1.Y;
  const sum={Y,label:String(Y),cal:true,user:null,moves:[],champs:[],lost:[],grads:0};
  const userIn=!!(uc&&uc.cc===cc);
  leagueClose(sum,x=>x===cc);
  S.leagues.forEach(lg=>{if(lg.cc!==cc)return;lg.Y=Y+1;resetTables(lg);lg.sched=genSched(lg,lg.Y);lg.rd=0;});
  const ids=new Set(S.clubs.filter(c=>c.cc===cc).map(c=>c.id));
  Object.values(S.players).forEach(p=>{if(p.where==='retired'||p.club==null||!ids.has(p.club))return;p.g=0;p.ap=0;p.ym=0;p.yg=0;});
  S.clubs.forEach(c=>{if(c.cc!==cc)return;c.form5=[];
    if(c.id===S.user||!c.mg)return;
    const pos=c.lg!=null?sortedFinal(S.leagues[c.lg]).indexOf(c.id)+1:1;
    if(pos>0&&pos-expectedRank(c)>Math.max(5,S.leagues[c.lg].ids.length*0.3)&&Math.random()<0.5){S.mgrs.push({n:c.mg.n,rep:Math.max(5,c.mg.rep-5),id:S.mid++});c.mg=null;c.vac=0;}
    else if(c.mg)c.mg.rep=Math.round(clamp(c.mg.rep+(pos<=3?2:pos>=15?-2:0),5,95));});
  createCup(cc,Y+1);
  if(userIn){
    if(uc.board<=10){S.summary=sum;S.sumN=(S.sumN||0)+1;sackUser('La directiva ha perdido la confianza tras la temporada.');return;}
    genObjectives();
    inbox({ty:'season',title:`Resumen de la temporada ${sum.label}`,body:`Has terminado ${sum.user.pos}º en ${sum.user.lg}. Objetivo: ${sum.user.rankOk?'cumplido':'fallado'}.`});
    jobOffersSeason(sum);
    S.summary=sum;S.sumN=(S.sumN||0)+1;
  }
  news(`Fin de la temporada ${Y} en ${LG_BY_CC[cc].nm}. Campeón: ${sum.champs.length?sum.champs[0].club:'—'}.`,'s');
  save();
}
function refreshPools(){
  Object.keys(S.pools).forEach(nat=>{
    S.pools[nat]=S.pools[nat].filter(id=>{const p=S.players[id];if(!p||p.where!=='pool')return false;if(p.age>=25)return false;return true;});
    const q=NAT[nat].yq;
    while(S.pools[nat].length<40){const age=15,pos=pick(['GK','DEF','DEF','MID','MID','FWD','FWD']);
      const p=mkPlayer(pos,36+q*10+gauss()*4,15,16,nat,null,{yq:q*1.15});p.where='pool';p.vc=`${pick(FIN_SUF)} ${pick(FIN_SUF2)}`;S.players[p.id]=p;S.pools[nat].push(p.id);}
  });
}
/* ----- carrera: despido, ofertas, candidaturas ----- */
function sackUser(why){
  const c=userClub();if(!c)return;
  S.mgr.hist.push({Y:S.Y,club:c.name,cc:c.cc,lg:S.leagues[c.lg].nm,pos:null,n:null,sacked:true});
  S.mgr.rep=Math.max(5,S.mgr.rep-6);
  c.mg={n:genName(pick([c.cc,'EN','ES'])),rep:Math.round(c.rep+ri(-8,4)),since:S.Y};
  S.user=null;S.pend=null;S.apps=S.apps||[];
  S.staff.hired=[];
  inbox({ty:'info',title:'Has sido despedido',body:why+' Busca un nuevo club en la sección Carrera.'});
  news(`${S.mgr.name} es despedido de ${c.name}.`,'j');
  jobOffersSeason(null);
  save();
}
function jobOffersSeason(sum){
  const rep=S.mgr.rep,cur=userClub();
  const cand=S.clubs.filter(c=>(!cur||c.id!==cur.id)&&c.rep<=rep+14&&c.rep>=rep-20&&c.mg===null||(c.rep<=rep+10&&c.rep>=rep-6&&Math.random()<0.12&&(!cur||c.id!==cur.id)));
  const good=cand.sort((a,b)=>b.rep-a.rep).slice(0,cur?2:4);
  good.forEach(c=>{
    inbox({ty:'jobOffer',title:`Oferta de ${c.name}`,body:`${c.name} (${S.leagues[c.lg].nm}, ${LG_BY_CC[c.cc].nm}) quiere contratarte. Reputación del club ${Math.round(c.rep)}, presupuesto ${EUR(c.budget)}.`,cid:c.id,exp:S.t+30,
      ch:[{k:'accept',l:'Aceptar el puesto'},{k:'reject',l:'Rechazar'}]});
  });
  if(!cur&&!good.length){const f=S.clubs.filter(c=>c.tier>=2&&c.rep<=rep+8).sort((a,b)=>b.rep-a.rep).slice(0,3);
    f.forEach(c=>inbox({ty:'jobOffer',title:`Oferta de ${c.name}`,body:`${c.name} (${S.leagues[c.lg].nm}) te da una oportunidad.`,cid:c.id,exp:S.t+30,ch:[{k:'accept',l:'Aceptar el puesto'},{k:'reject',l:'Rechazar'}]}));}
}
function takeJob(cid){
  const old=userClub(),c=S.clubs[cid];
  if(old){old.mg={n:genName(pick([old.cc,'EN','ES'])),rep:Math.round(old.rep+ri(-8,4)),since:S.Y};}
  if(c.mg){S.mgrs.push({n:c.mg.n,rep:Math.max(5,c.mg.rep-3),id:S.mid++});}
  c.mg=null;S.user=cid;S.pend=null;S.staff.hired=[];S.mgr.cc=c.cc;
  c.board=60;c.vac=0;
  S.inbox.forEach(m=>{if(m.ty==='jobOffer')m.done=true;});S.apps=[];
  S.scout.miss={};
  initClubForUser(true);
  news(`${S.mgr.name} es nuevo entrenador de ${c.name}.`,'j');
  save();
}
function applyFor(cid){
  S.apps=S.apps||[];
  if(S.apps.some(a=>a.cid===cid&&!a.done))return false;
  S.apps.push({cid,t:S.t,done:false});
  inbox({ty:'info',title:'Candidatura enviada',body:`Has presentado tu candidatura a ${clubName(cid)}. La respuesta llegará en 1–2 semanas.`});return true;
}
function startCareer(cid,mgrName,opts){
  if(!(opts&&opts.noff))prepareStart(cid);
  S.user=cid;S.mgr={name:mgrName||'Mánager',rep:clamp(S.clubs[cid].rep-8,12,55),hist:[],cc:S.clubs[cid].cc,titles:0,start:S.Y};
  S.clubs[cid].mg=null;S.apps=[];
  initClubForUser(false);
  if(opts&&opts.diff)S.diff=opts.diff;S.diff=S.diff||'normal';
  S.clubs[cid].budget=Math.round(S.clubs[cid].budget*dif().budget/1e4)*1e4;
  S.clubs[cid].wageCap=Math.round(wageBill(S.clubs[cid])*1.3);
  if(S.clubs[cid].phil==='fichajes'){S.clubs[cid].budget=Math.round(S.clubs[cid].budget*1.15/1e4)*1e4;S.clubs[cid].wageCap=Math.round(S.clubs[cid].wageCap*1.1);}
  if(opts&&opts.budget!=null)S.clubs[cid].budget=opts.budget;
  news(`Bienvenido a ${S.clubs[cid].name}. Temporada ${userSeasonLabel()}.`,'j');
  save();
}
function createClub(cc,cfg){
  // reemplaza la identidad del club más débil de 2ª división del país elegido
  const lg=S.leagues.find(l=>l.cc===cc&&l.tier===4);
  const c=lg.ids.map(id=>S.clubs[id]).sort((a,b)=>a.skill-b.skill)[0];
  c.city=cfg.city;c.suf=cfg.suf;c.name=cfg.city+' '+cfg.suf;c.c1=cfg.c1;c.c2=cfg.c2;c.pat=cfg.pat;c.stad=cfg.stad||('Estadio '+cfg.city);
  const seen={};lg.ids.forEach(id=>{if(id!==c.id)seen[S.clubs[id].short]=1;});c.short=shortFor(c.city,c.suf,seen);c.custom=true;c.phil=cfg.phil||'balance';
  c.rival=pick(lg.ids.filter(id=>id!==c.id));
  return c.id;
}
