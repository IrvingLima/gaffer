"use strict";
/* ================= mercado: memoria de ofertas, canjes, operaciones preparadas, bloquear ofertas ================= */
/* un club que rompió las negociaciones recuerda tu oferta (+5 % de precio durante ~13 meses) */
const _negClubCore=negClub;
negClub=function(pid,t,dest){
  const r=_negClubCore(pid,t,dest);
  if(r&&(r.state==='dead'||r.state==='lost')){const p=S.players[pid];S.memo=S.memo||{};S.memo[pid]={cid:p.club,t:S.t,fee:t.fee};}
  return r;
};
/* aplicar canje al cerrar un fichaje: el jugador que incluiste pasa al club vendedor */
function applySwap(sellerId,swapPid){
  const c=userClub(),sw=S.players[swapPid],pc=S.clubs[sellerId];
  if(!sw||sw.club!==S.user||!pc)return;
  c.players=c.players.filter(i=>i!==sw.id);sw.club=sellerId;sw.where='first';sw.lock=null;sw.tl=false;sw.fix=null;pc.players.push(sw.id);
  Object.keys(c.fix||{}).forEach(fk=>{Object.keys(c.fix[fk]).forEach(i=>{if(c.fix[fk][i]===sw.id)delete c.fix[fk][i];});});
  news(`Canje: ${sw.name} (${sw.ovr}) se marcha a ${pc.name} como parte del pago.`,'t');
}
/* bloquear ofertas por un jugador propio */
function toggleNoSell(pid){const p=S.players[pid];if(!p||p.club!==S.user)return;p.nb=!p.nb;if(p.nb)p.tl=false;return p.nb;}
/* operaciones preparadas para el Deadline Day */
function prepToggle(pid){
  S.prep=S.prep||{};const p=S.players[pid];if(!p)return false;
  if(S.prep[pid]){delete S.prep[pid];return false;}
  const fee=p.where==='free'?0:Math.round(askOf(p).fee*1.1/1000)*1000;
  S.prep[pid]={fee,wage:Math.round(wageAsk(p).w/100)*100,years:3,Y:userYear()};return true;
}
function ddRunPrepared(){
  const dd=S.dd,c=userClub();if(!dd||!S.prep)return;
  Object.keys(S.prep).forEach(k=>{
    const pr=S.prep[k],p=S.players[+k];if(!p){delete S.prep[k];return;}
    if(Math.random()>0.45)return; // se intenta en cualquier hora del día
    const hour=DD_HOURS[Math.min(dd.step,DD_HOURS.length-1)];
    let why=null;
    if(p.club===S.user)why='ya es tuyo';
    else if(p.club==null&&p.where!=='free')why='ya no está disponible';
    else if(c.budget<pr.fee)why=`no llegas al presupuesto (${EUR(pr.fee)})`;
    else if(c.players.length>=27)why='plantilla completa';
    else if(wageBill(c)+pr.wage>wageLimit(c))why='supera el límite salarial';
    else if(p.club!=null&&Math.random()<0.25)why='el club vendedor se echa atrás';
    if(why){dd.failed.push(`${p.name} (preparado): ${why}`);dd.log.push(`${hour} · Operación preparada por ${p.name} cae: ${why}.`);delete S.prep[k];return;}
    doSigning(p,{fee:pr.fee,wage:pr.wage,years:pr.years,sellOn:0,bonus:0,dest:'first'});
    dd.signed.push(`${p.name} (${p.ovr}) por ${EUR(pr.fee)} · operación preparada`);dd.log.push(`${hour} · ¡Se cierra tu operación preparada: ${p.name}!`);delete S.prep[k];
  });
}
