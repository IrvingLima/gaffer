"use strict";
/* ================= vida del mánager: pedir fondos a la directiva y retos mensuales (propuestas a validar) ================= */
/* --- pedir fondos: sí, no o sí con condición según resultados y confianza --- */
function askFunds(){
  const c=userClub(),lg=leagueOf(c.id),pos=posOf(c.id),played=lg.tab[c.id].p>0;
  S.funds=S.funds||{};const k=userYear();
  if(S.funds[k])return {ok:false,msg:'Ya has pedido fondos esta temporada: la directiva no volverá a abrir la caja.'};
  const target=S.obj&&S.obj.rank?S.obj.rank:lg.ids.length;
  const base=Math.max(150000,Math.round(wageBill(c)*(c.tier===1?5:4)/1e4)*1e4),onTrack=!played||pos<=target;
  S.funds[k]=true;
  if(c.board>=70&&onTrack){c.budget+=base;return {ok:true,amount:base,msg:`La directiva aprueba ${EUR(base)}: «confiamos en tu proyecto».`};}
  if(c.board>=45){
    const amt=Math.round(base*0.6/1e4)*1e4;c.budget+=amt;S.fundCond={Y:k,rank:target,amt};c.board=Math.max(0,c.board-3);
    return {ok:true,cond:true,amount:amt,msg:`Aprueban ${EUR(amt)} con condición: terminar en el puesto ${target} o mejor. Si no, la confianza caerá más al final de temporada.`};
  }
  c.board=Math.max(0,c.board-2);
  return {ok:false,msg:'La directiva lo rechaza: con la confianza actual no hay dinero extra. Mejora los resultados y vuelve a intentarlo la próxima temporada.'};
}
function fundCondEnd(uc,pos){
  const f=S.fundCond;if(!f)return 0;S.fundCond=null;
  if(pos>f.rank){uc.board=Math.max(0,uc.board-6);return -6;}
  return 0;
}
/* --- retos de Manager Live: objetivo, plazo y recompensa antes de aceptar; caducan sin castigo --- */
const CHALLENGES=[
  {id:'win3',t:'Gana 3 de los próximos 5 partidos',need:3,games:5,rew:0.012,kind:'wins'},
  {id:'cs2',t:'Deja la portería a cero en 2 de los próximos 4 partidos',need:2,games:4,rew:0.01,kind:'cs'},
  {id:'goals6',t:'Marca 6 goles en los próximos 4 partidos',need:6,games:4,rew:0.01,kind:'gf'},
  {id:'unb4',t:'Encadena 4 partidos sin perder',need:4,games:4,rew:0.014,kind:'unb'}];
function challengeWeek(){
  if(S.chal&&S.chal.state==='open'&&S.t>S.chal.until){S.chal.state='expired';news('El reto «'+S.chal.t+'» ha caducado sin consecuencias.','n');}
  const d=dateOf(S.t);
  if(S.chal&&S.chal.state==='active')return;
  if(S.inbox.some(m=>m.ty==='challenge'&&!m.done))return;
  if(d.getUTCDate()>7||Math.random()<0.25)return; // primera semana de cada mes
  if(S.chalLast!=null&&S.t-S.chalLast<110)return;    // como mucho uno cada ~2,5 meses
  S.chalLast=S.t;const c=userClub(),ch=pick(CHALLENGES),rew=Math.max(100000,Math.round(wageBill(c)*52*ch.rew/1e4)*1e4);
  inbox({ty:'challenge',title:'Reto del mes',body:`${ch.t}. Plazo: ${ch.games} partidos. Recompensa: ${EUR(rew)} y +2 de confianza de la directiva. Puedes ignorarlo sin consecuencias.`,exp:S.t+10,
    ch:[{k:'accept',l:'Aceptar reto'},{k:'ignore',l:'Ignorar'}],cd:{...ch,rewardEUR:rew}});
}
function challengeResult(M){
  const C=S.chal;if(!C||C.state!=='active')return;
  const me=M.hid===S.user,my=me?M.hg:M.ag,op=me?M.ag:M.hg;
  C.played++;
  if(C.kind==='wins'&&my>op)C.prog++;
  if(C.kind==='cs'&&op===0)C.prog++;
  if(C.kind==='gf')C.prog+=my;
  if(C.kind==='unb'){if(my>=op)C.prog++;else C.prog=0;}
  const done=C.prog>=C.need;
  if(done){C.state='done';const c=userClub();c.budget+=C.rew;c.board=Math.min(100,c.board+2);news(`¡Reto cumplido! «${C.t}»: +${EUR(C.rew)} para el club.`,'g');inbox({ty:'info',title:'Reto cumplido',body:`${C.t}. Recompensa ${EUR(C.rew)}.`});}
  else if(C.kind==='unb'?(C.prog<C.need&&C.played>=C.games+8):C.played>=C.games){C.state='failed';news(`Reto no cumplido: «${C.t}». Sin consecuencias.`,'n');}
}
function acceptChallenge(m){const d=m.cd;S.chal={id:d.id,t:d.t,need:d.need,games:d.games,kind:d.kind,rew:d.rewardEUR,prog:0,played:0,state:'active'};m.done=true;}
