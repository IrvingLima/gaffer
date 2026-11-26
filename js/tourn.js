"use strict";
/* ================= copas nacionales y continentales ================= */
const pow2floor=n=>{let p=1;while(p*2<=n)p*=2;return p;};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
function nearestDow(t,dow){for(let d=0;d<=3;d++){if(dowOf(t+d)===dow)return t+d;if(dowOf(t-d)===dow)return t-d;}return t;}
function leagueDateSet(ccs,tier){const s=new Set();S.leagues.forEach(l=>{if((!ccs||ccs.includes(l.cc))&&(!tier||l.tier===tier))l.sched.forEach(r=>s.add(r.t));});return s;}
function freeDate(t,dow,set){let d=nearestDow(t,dow),g=0;while(set.has(d)&&g++<12)d+=7;return d;}
function roundName(m,after){return after===1?'Final':after===2?'Semifinales':after===4?'Cuartos de final':after===8?'Octavos de final':after===16?'Dieciseisavos':after===32?'Treintaidosavos':'Ronda previa';}
function regEv(t,e){S.ev[t]=S.ev[t]||[];S.ev[t].push(e);}
const penWin=(M)=>{let h=0,a=0;for(let i=0;i<5;i++){if(Math.random()<0.76)h++;if(Math.random()<0.76)a++;}let g=0;while(h===a&&g++<20){if(Math.random()<0.76)h++;if(Math.random()<0.76)a++;}if(h===a)h++;return {h,a};};

function buildTournaments(qual){
  // las copas de países de año natural no se reinician el 30 de junio: tienen su propio ciclo
  const keepT={},keepE={},old=S.tn||{},oev=S.ev||{};
  LEAGUES.forEach(L=>{if(L.cal&&old['cup:'+L.cc])keepT['cup:'+L.cc]=old['cup:'+L.cc];});
  Object.keys(oev).forEach(t=>{const k=oev[t].filter(e=>keepT[e.tid]);if(k.length)keepE[t]=k;});
  S.tn=keepT;S.ev=keepE;
  LEAGUES.forEach(L=>{if(!L.cal)createCup(L.cc);else if(!keepT['cup:'+L.cc]){const l1=S.leagues.find(l=>l.cc===L.cc&&l.tier===1);createCup(L.cc,l1?l1.Y:S.Y);}});
  ['CL','EL'].forEach(id=>createCont(id,qual));
}
/* ----- copa nacional ----- */
const DATES_CAL=[[11,24],[10,15],[9,3],[8,6],[6,18],[5,14],[4,16],[3,5]];
function createCup(cc,yr){
  const cal=calOf(cc),Y0=yr||S.Y,ids=S.clubs.filter(c=>c.cc===cc).map(c=>c.id);
  const T={id:'cup:'+cc,nm:CUP_NAMES[cc],kind:'cup',cc,Y:Y0,alive:ids.slice(),rounds:[],out:{},champion:null,n:ids.length};
  let m=ids.length;const sizes=[];while(m>1){const P=pow2floor(m),after=m>P?P:m/2;sizes.push([m,after]);m=after;}
  const N=sizes.length,DATES=cal?DATES_CAL:[[5,30],[4,22],[3,11],[1,27],[12,9],[10,28],[9,16],[8,26]],set=leagueDateSet([cc]);
  sizes.forEach(([mm,after],i)=>{
    const [mo,dd]=DATES[N-1-i],y=cal||mo>=7?Y0:Y0+1,last=i===N-1;
    const t=freeDate(dayOf(y,mo,dd),last?6:3,set);
    T.rounds.push({nm:roundName(mm,after),m:mm,after,legs:1,dates:[t],ties:null,done:false,neutral:last});
    regEv(t,{tid:T.id,type:'ko',r:i,leg:0});
  });
  S.tn[T.id]=T;drawKO(T,0);return T;
}
function drawKO(T,r){
  const rd=T.rounds[r],A=T.alive.slice(),m=A.length,P=pow2floor(m);let play,byes=[];
  if(m===P)play=A;else{
    const nT=m-P,sorted=A.slice().sort((a,b)=>S.clubs[a].tier-S.clubs[b].tier||S.clubs[b].skill-S.clubs[a].skill);
    byes=sorted.slice(0,m-2*nT);play=sorted.slice(m-2*nT);
  }
  shuffle(play);rd.ties=[];
  for(let i=0;i<play.length;i+=2){
    let a=play[i],b=play[i+1];
    if(T.kind==='cup'){const ca=S.clubs[a],cb=S.clubs[b];if(cb.tier>ca.tier||(cb.tier===ca.tier&&Math.random()<0.5)){[a,b]=[b,a];}}
    rd.ties.push({a,b,legs:[],w:null});
  }
  byes.forEach(id=>rd.ties.push({a:id,b:null,bye:true,w:id,legs:[]}));
  rd.m=m;
}
/* ----- competiciones continentales ----- */
function qualifyBySkill(){
  const q={};LEAGUES.forEach(L=>{q[L.cc]=S.leagues.find(l=>l.cc===L.cc&&l.tier===1).ids.slice().sort((a,b)=>S.clubs[b].skill-S.clubs[a].skill||S.clubs[b].rep-S.clubs[a].rep);});return q;
}
function createCont(id,qual){
  const def=CONT[id],teams=[];
  LEAGUES.forEach(L=>{const sk=def.skip[L.cc]||0,n=def.q[L.cc]||0;(qual[L.cc]||[]).slice(sk,sk+n).forEach(x=>teams.push(x));});
  const T={id,nm:def.nm,kind:'cont',Y:S.Y,teams:teams.slice(),stage:'group',groups:[],rounds:[],out:{},champion:null,alive:[],n:teams.length};
  // sorteo de grupos sin repetir país si es posible
  let best=null;
  for(let tr=0;tr<60;tr++){
    const sh=shuffle(teams.slice()),g=[];for(let i=0;i<8;i++)g.push(sh.slice(i*4,i*4+4));
    const clash=g.reduce((s,gr)=>s+(4-new Set(gr.map(x=>S.clubs[x].cc)).size),0);
    if(!best||clash<best.clash)best={g,clash};if(clash===0)break;
  }
  const FX=[[[0,3],[1,2]],[[3,2],[0,1]],[[1,3],[2,0]],[[3,0],[2,1]],[[2,3],[1,0]],[[3,1],[0,2]]];
  const set=leagueDateSet(null,1),GD=[[9,15],[9,29],[10,20],[11,3],[11,24],[12,8]];
  const gdates=GD.map(([mo,dd])=>freeDate(dayOf(S.Y,mo,dd),def.dow,set));
  T.gdates=gdates;
  best.g.forEach(ids=>{const tab={};ids.forEach(i=>{tab[i]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};});T.groups.push({ids,tab,fx:FX.map(md=>md.map(([a,b])=>[ids[a],ids[b]]))});});
  gdates.forEach((t,md)=>regEv(t,{tid:id,type:'gd',md}));
  const K=[['Octavos de final',2,[[2,16],[3,2]]],['Cuartos de final',2,[[3,16],[4,6]]],['Semifinales',2,[[4,20],[4,27]]],['Final',1,[[5,30]]]];
  K.forEach(([nm,legs,ds],r)=>{
    const dates=ds.map(([mo,dd],i)=>freeDate(dayOf(S.Y+1,mo,dd),r===3?6:def.dow,set));
    T.rounds.push({nm,m:[16,8,4,2][r],after:[8,4,2,1][r],legs,dates,ties:null,done:false,neutral:r===3});
    dates.forEach((t,leg)=>regEv(t,{tid:id,type:'ko',r,leg}));
  });
  S.tn[id]=T;return T;
}
function tryFinishGroup(T,md){
  if(T.stage!=='group')return;
  if(T.groups.some(G=>G.ids.some(i=>G.tab[i].p<6)))return;
  const W=[],U=[];
  T.groups.forEach((G,gi)=>{
    const rank=G.ids.slice().sort((a,b)=>{const x=G.tab[a],y=G.tab[b];return y.pts-x.pts||(y.gf-y.ga)-(x.gf-x.ga)||y.gf-x.gf;});
    G.rank=rank;W.push({id:rank[0],g:gi});U.push({id:rank[1],g:gi});
    rank.slice(2).forEach(id=>{T.out[id]=32;});
    rank.forEach((id,k)=>{const c=S.clubs[id],base=(c.tv+c.sp)*(T.id==='CL'?3:1.5);c.budget+=Math.round(base*(1+(k<2?0.4:0)));});
  });
  T.stage='ko';
  let pairs=null;
  for(let tr=0;tr<200&&!pairs;tr++){
    const u=shuffle(U.slice()),ok=W.every((w,i)=>u[i].g!==w.g&&S.clubs[u[i].id].cc!==S.clubs[w.id].cc);
    if(ok||tr>=190)pairs=W.map((w,i)=>[u[i].id,w.id]);
  }
  const rd=T.rounds[0];rd.ties=pairs.map(([a,b])=>({a,b,legs:[],w:null}));rd.m=16;T.alive=W.concat(U).map(x=>x.id);
  news(`${T.nm}: terminan los grupos. Octavos de final sorteados.`,'c');
}
function runGroup(T,md){
  T.groups.forEach((G,gi)=>{G.fx[md].forEach(([h,a],i)=>{
    if(S.user!=null&&(h===S.user||a===S.user)&&!S.pend){S.pend={kind:'tn',tid:T.id,g:gi,md,i,h,a,t:S.t,nm:T.nm,rn:`Grupo ${'ABCDEFGH'[gi]} · jornada ${md+1}`};return;}
    const M=newMatch(h,a,false);runMinutes(M,90);settleGroup(T,G,M);applyLite(M,false);
  });});
  if(!(S.pend&&S.pend.tid===T.id))tryFinishGroup(T,md);
}
function settleGroup(T,G,M){
  const th=G.tab[M.hid],ta=G.tab[M.aid];th.p++;ta.p++;th.gf+=M.hg;th.ga+=M.ag;ta.gf+=M.ag;ta.ga+=M.hg;
  if(M.hg>M.ag){th.w++;ta.l++;th.pts+=3;}else if(M.hg<M.ag){ta.w++;th.l++;ta.pts+=3;}else{th.d++;ta.d++;th.pts++;ta.pts++;}
}
/* ----- eliminatorias ----- */
const aggOf=(tie,id)=>{let g=0;tie.legs.forEach(L=>{if(!L)return;if(L.h===id)g+=L.hg;else if(L.a===id)g+=L.ag;});return g;};
function resolveTie(T,rd,tie,leg,M){
  tie.legs[leg]={h:M.hid,a:M.aid,hg:M.hg,ag:M.ag,et:!!M.et,pen:M.pen||null};
  if(leg<rd.legs-1)return;
  let ga=aggOf(tie,tie.a),gb=aggOf(tie,tie.b);
  if(ga===gb&&!M.et){runMinutes(M,120);M.et=true;tie.legs[leg]={h:M.hid,a:M.aid,hg:M.hg,ag:M.ag,et:true,pen:null};ga=aggOf(tie,tie.a);gb=aggOf(tie,tie.b);}
  if(ga===gb){if(!M.pen)M.pen=penWin(M);tie.legs[leg].pen=M.pen;tie.pen=M.pen;const homeWins=M.pen.h>M.pen.a;tie.w=homeWins?M.hid:M.aid;}
  else tie.w=ga>gb?tie.a:tie.b;
}
function needsDecider(T,rd,tie,leg,M){
  if(leg<rd.legs-1)return false;
  const ga=aggOf(tie,tie.a)+(M.hid===tie.a?M.hg:M.ag-0)*0,gb=0;
  // goles acumulados incluyendo el partido en curso
  let A=0,B=0;[...tie.legs.filter(Boolean),{h:M.hid,a:M.aid,hg:M.hg,ag:M.ag}].forEach(L=>{if(L.h===tie.a)A+=L.hg;else if(L.a===tie.a)A+=L.ag;if(L.h===tie.b)B+=L.hg;else if(L.a===tie.b)B+=L.ag;});
  return A===B;
}
function runKO(T,r,leg){
  const rd=T.rounds[r];if(!rd.ties)drawKO(T,r);
  rd.ties.forEach((tie,i)=>{
    if(tie.bye||tie.legs[leg])return;
    const h=leg===0?tie.a:tie.b,a=leg===0?tie.b:tie.a;
    if(S.user!=null&&(h===S.user||a===S.user)&&!S.pend){S.pend={kind:'tn',tid:T.id,r,leg,i,h,a,t:S.t,nm:T.nm,rn:rd.nm+(rd.legs===2?(leg===0?' (ida)':' (vuelta)'):'')};return;}
    const M=newMatch(h,a,false);runMinutes(M,90);resolveTie(T,rd,tie,leg,M);applyLite(M,rd.neutral);
  });
  if(!(S.pend&&S.pend.tid===T.id))tryFinishRound(T,r,leg);
}
function tryFinishRound(T,r,leg){
  const rd=T.rounds[r];if(!rd||leg<rd.legs-1||rd.done)return;
  if(rd.ties.some(t=>!t.bye&&t.w==null))return;
  rd.done=true;
  const losers=rd.ties.filter(t=>!t.bye).map(t=>t.w===t.a?t.b:t.a);
  losers.forEach(id=>{T.out[id]=rd.m;});
  T.alive=rd.ties.map(t=>t.w);
  const pm=T.kind==='cup'?[0.25,0.3,0.4,0.55,0.8,1.2,2.0]:[2,3,4,6];
  T.alive.forEach(id=>{const c=S.clubs[id];if(rd.ties.find(t=>t.w===id&&t.bye))return;c.budget+=Math.round((c.tv+c.sp)*(pm[Math.min(r,pm.length-1)])*(T.kind==='cup'?1:1));});
  if(r===T.rounds.length-1){T.champion=T.alive[0];T.out[T.champion]=1;crown(T);}
  else if(T.kind==='cup'||T.rounds[r+1]){T.alive=rd.ties.map(t=>t.w);drawKO(T,r+1);}
}
function crown(T){
  const c=S.clubs[T.champion];c.budget+=Math.round((c.tv+c.sp)*(T.kind==='cup'?3:T.id==='CL'?10:5));
  S.hist.tn=S.hist.tn||[];S.hist.tn.push({Y:T.Y,id:T.id,nm:T.nm,champ:c.name,cid:c.id,cal:T.kind==='cup'&&calOf(T.cc)});
  if(T.champion===S.user){S.mgr.trophies=(S.mgr.trophies||0)+1;c.rep=Math.min(95,c.rep+(T.kind==='cup'?2:4));c.board=Math.min(100,c.board+(T.kind==='cup'?5:8));S.mgr.rep=Math.min(98,S.mgr.rep+(T.kind==='cup'?2:4));
    inbox({ty:'info',title:`¡Campeón de la ${T.nm}!`,body:`Tu club levanta la ${T.nm}. La directiva está encantada.`});}
  news(`${c.name} gana la ${T.nm} ${seasonLabel(T.Y,T.kind==='cup'&&calOf(T.cc))}.`,'c');
}
function applyLite(M,neutral){
  [[M.H,M.hid],[M.A,M.aid]].forEach(([L,cid])=>{
    const c=S.clubs[cid],isU=cid===S.user,mult=((c.ins&&c.ins.press)?1.35:1)*(M.et?1.3:1)*(1-sAb(cid,'fit')*0.015);
    L.xi.forEach(x=>{const p=x.p;p.ap++;p.lp=S.t;p.fit=clamp(p.fit-ri(8,14)*mult,15,100);});
    if(isU)L.bench.filter(p=>p.h&&p.age<=21).slice(0,3).forEach(p=>{p.ap++;p.lp=S.t;});
  });
  M.goals.forEach(g=>{const p=S.players[g.pid];if(p)p.gc=(p.gc||0)+1;});
  M.inj.forEach(id=>{const p=S.players[id];if(p)p.inj=injuryWeeks(p,p.club===S.user);});
  [...M.H.xi,...M.A.xi].forEach(x=>{delete x.p._hurt;});
  if(!neutral){const hc=S.clubs[M.hid],gate=attendance(hc)*hc.price;hc.budget+=gate;if(M.hid===S.user){S.ledger.unshift({t:S.t,k:'gate',v:gate,txt:'Taquilla (copa) vs '+S.clubs[M.aid].name});S.ledger.length=Math.min(S.ledger.length,60);}}
}
function tournDay(){
  const evs=S.ev&&S.ev[S.t];if(!evs)return;
  evs.forEach(e=>{const T=S.tn[e.tid];if(!T)return;if(e.type==='gd')runGroup(T,e.md);else runKO(T,e.r,e.leg);});
}
function commitTournMatch(M){
  const p=S.pend,T=S.tn[p.tid];if(!p||!T)return;
  if(p.g!=null){settleGroup(T,T.groups[p.g],M);applyLite(M,false);}
  else{const rd=T.rounds[p.r],tie=rd.ties[p.i];resolveTie(T,rd,tie,p.leg,M);applyLite(M,rd.neutral);}
  const my=M.hid===S.user?M.hg:M.ag,op=M.hid===S.user?M.ag:M.hg,c=userClub();
  if(my>op)c.rep=Math.min(95,c.rep+0.5);
  S.lastRes={h:M.hid,a:M.aid,hg:M.hg,ag:M.ag,t:S.t,sum:matchSummary(M),comp:T.nm};
  news(`${T.nm} · ${p.rn}: ${S.clubs[M.hid].name} ${M.hg}-${M.ag} ${S.clubs[M.aid].name}${M.pen?` (pen. ${M.pen.h}-${M.pen.a})`:M.et?' (prórroga)':''}.`,'c');
  S.pend=null;
  if(p.g!=null)tryFinishGroup(T,p.md);else tryFinishRound(T,p.r,p.leg);
}
/* ----- consulta para la interfaz ----- */
function userTournEvents(){
  const out=[],u=S.user;if(u==null||!S.tn)return out;
  Object.values(S.tn).forEach(T=>{
    if(T.champion!=null)return;
    if(T.kind==='cup'){
      if(T.out[u]!=null)return;
      for(let r=0;r<T.rounds.length;r++){const rd=T.rounds[r];if(rd.done)continue;if(!rd.ties)break;
        const tie=rd.ties.find(x=>x.a===u||x.b===u);
        if(tie&&!tie.bye&&!tie.legs[0])out.push({t:rd.dates[0],kind:'cup',label:`${T.nm} · ${rd.nm}`,h:tie.a,a:tie.b,tid:T.id});
        else if(tie&&tie.bye)out.push({t:rd.dates[0],kind:'cup',label:`${T.nm} · ${rd.nm}: exento`,tid:T.id,bye:true});
        break;}
    }else{
      if(T.stage==='group'){
        if(!T.teams.includes(u))return;
        const G=T.groups.find(g=>g.ids.includes(u));
        G.fx.forEach((md,i)=>{const m=md.find(([h,a])=>h===u||a===u);if(m&&G.tab[u].p<=i&&T.gdates[i]>=S.t-0)out.push({t:T.gdates[i],kind:'cont',label:`${T.nm} · jornada ${i+1}`,h:m[0],a:m[1],tid:T.id});});
      }else if(T.out[u]==null&&T.alive.includes(u)){
        for(let r=0;r<T.rounds.length;r++){const rd=T.rounds[r];if(rd.done)continue;if(!rd.ties)break;
          const tie=rd.ties.find(x=>x.a===u||x.b===u);
          if(tie)rd.dates.forEach((t,leg)=>{if(!tie.legs[leg])out.push({t,kind:'cont',label:`${T.nm} · ${rd.nm}${rd.legs===2?(leg===0?' (ida)':' (vuelta)'):''}`,h:leg===0?tie.a:tie.b,a:leg===0?tie.b:tie.a,tid:T.id});});
          break;}
      }
    }
  });
  return out.filter(e=>e.t>=S.t).sort((a,b)=>a.t-b.t);
}
function userTournStatus(){
  const u=S.user,out=[];if(u==null||!S.tn)return out;
  Object.values(S.tn).forEach(T=>{
    if(T.kind==='cup'){if(T.cc!==userClub().cc)return;
      const o=T.out[u];let st;
      if(T.champion===u)st='Campeón';else if(o!=null){st='Eliminado en '+roundNameBySize(T,o);}else{const rd=T.rounds.find(r=>!r.done);st=rd?`Siguiente: ${rd.nm}`:'En juego';}
      out.push({nm:T.nm,st,ok:o==null,tid:T.id});
    }else if(T.teams.includes(u)){
      let st;
      if(T.champion===u)st='Campeón';
      else if(T.stage==='group'){const G=T.groups.find(g=>g.ids.includes(u)),r=G.ids.slice().sort((a,b)=>G.tab[b].pts-G.tab[a].pts||(G.tab[b].gf-G.tab[b].ga)-(G.tab[a].gf-G.tab[a].ga))[0]===u?1:G.ids.slice().sort((a,b)=>G.tab[b].pts-G.tab[a].pts||(G.tab[b].gf-G.tab[b].ga)-(G.tab[a].gf-G.tab[a].ga)).indexOf(u)+1;st=`Grupo ${'ABCDEFGH'[T.groups.indexOf(G)]}: ${r}º (${G.tab[u].pts} pts)`;}
      else if(T.out[u]!=null)st=T.out[u]===32?'Eliminado en la fase de grupos':'Eliminado en '+roundNameBySize(T,T.out[u]);
      else st='En eliminatorias';
      out.push({nm:T.nm,st,ok:T.out[u]==null,tid:T.id});
    }
  });
  return out;
}
function roundNameBySize(T,m){const rd=T.rounds.find(r=>r.m===m);return rd?rd.nm.toLowerCase():'la ronda de '+m;}
function cupTarget(){
  const c=userClub(),n=S.clubs.filter(x=>x.cc===c.cc).length,rk=S.clubs.filter(x=>x.cc===c.cc).sort((a,b)=>b.skill-a.skill).findIndex(x=>x.id===c.id)+1;
  const f=rk/n;
  return f<=0.06?{out:4,txt:'Llegar a semifinales de la copa'}:f<=0.18?{out:8,txt:'Llegar a cuartos de final de la copa'}:f<=0.4?{out:16,txt:'Llegar a octavos de final de la copa'}:f<=0.7?{out:32,txt:'Superar al menos dos rondas de copa'}:{out:64,txt:'Ganar al menos un partido de copa'};
}
function userCupOut(){const c=userClub(),T=S.tn&&S.tn['cup:'+c.cc];if(!T)return 99;if(T.champion===c.id)return 1;return T.out[c.id]!=null?T.out[c.id]:99;}
