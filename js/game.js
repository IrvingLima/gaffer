"use strict";
/* ================= control del tiempo ================= */
const BLOCKING=['offer','jobOffer','deadline','loanopt','preseason','sponsorpick'];
/* una oferta no solicitada (jugador que no has puesto en venta) no detiene el juego: queda en el buzón hasta que venza */
const blocks=m=>BLOCKING.includes(m.ty)&&!m.soft;
const DECISIONS=['ntjob','preseason','sponsorpick','challenge','offer','jobOffer','minutes','interest','deadline','unhappy','contract','sponsor','loanopt'];
function pendingMsgs(){return S.inbox.filter(m=>!m.done&&DECISIONS.includes(m.ty));}
/* cierra las tareas que ya no tienen sentido (renovaste, vendiste o liberaste al jugador) */
function cleanMsgs(){
  if(!S||S.user==null)return;
  S.inbox.forEach(m=>{
    if(m.done||m.pid==null)return;const p=S.players[m.pid];
    const gone=!p||p.club!==S.user;
    if((m.ty==='contract'&&(gone||p.ce>S.Y))||((m.ty==='offer'||m.ty==='minutes'||m.ty==='unhappy')&&gone))m.done=true;
  });
}
function expireMsgs(){cleanMsgs();S.inbox.forEach(m=>{if(!m.done&&m.exp&&S.t>m.exp){m.done=true;m.expired=true;}});}
/* mode: 'week' avanza hasta 7 días; 'match' hasta el próximo partido o evento importante */
/* Los países de año natural arrancan en la pretemporada de SU liga: el mundo avanza hasta dos semanas antes */
function startTarget(cid){const c=S.clubs[cid];if(!c||!calOf(c.cc))return 0;const lg=S.leagues[c.lg];return lg.sched.length?lg.sched[0].t-14:0;}
function prepareStart(cid){const tg=startTarget(cid);const u=S.user;S.user=null;let g=0;while(S.t<tg&&g++<500){S.t++;dayTick();}S.user=u;return g;}
function advance(mode){
  if(S.pend)return 'pend';
  const seen=S.inbox.length?S.inbox[0].id:0;let days=0,reason='';
  const limit=mode==='match'?420:7;
  const startY=seasonKey();
  while(days<limit){
    S.t++;days++;dayTick();expireMsgs();
    if(S.pend){reason='match';break;}
    if(seasonKey()!==startY){reason='season';break;}
    if(S.user==null&&mode==='match'&&S.inbox.some(m=>m.id>seen&&m.ty==='jobOffer'&&!m.done)){reason='job';break;}
    if(S.user!=null&&mode==='match'&&S.inbox.some(m=>m.id>seen&&!m.done&&blocks(m))){reason='msg';break;}
  }
  if(S.user!=null)checkPromises();
  save();
  return reason||'ok';
}
function simulateUserMatch(){
  const p=S.pend;if(!p)return null;
  const M=newMatch(p.h,p.a,true);runMinutes(M,90);
  if(p.kind==='tn'){const T=S.tn[p.tid];if(p.g==null&&needsDecider(T,T.rounds[p.r],T.rounds[p.r].ties[p.i],p.leg,M)){runMinutes(M,120);M.et=true;}commitTournMatch(M);}else commitUserMatch(M);return M;
}
function nextEventInfo(){
  const nm=nextUserMatch();
  if(S.pend)return {kind:'pend',t:S.t};
  if(nm)return {kind:'match',...nm};
  return {kind:'off'};
}

/* Simula hasta n partidos del usuario sin verlos; se detiene ante una decision urgente */
function autoplay(n){
  let played=0,w=0,d=0,l=0,reason='',guard=0;const Y0=seasonKey();
  while(played<n&&guard++<n*3+6){
    const r=advance('match');
    if(S.pend){const M=simulateUserMatch();played++;const my=M.hid===S.user?M.hg:M.ag,op=M.hid===S.user?M.ag:M.hg;if(my>op)w++;else if(my<op)l++;else d++;}
    if(seasonKey()!==Y0){reason='season';break;}
    if(r==='msg'||r==='job'){reason='msg';break;}
    if(r==='ok')break;
  }
  return {played,w,d,l,reason};
}
