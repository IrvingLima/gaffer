"use strict";
/* ================= eventos de calendario del brief: pretemporada, Deadline Day, patrocinador, convocatorias (propuestas a validar) ================= */

/* ---------- 7. Pretemporada: torneo con premio, riesgo y moral ---------- */
const PRE_OPTS=[
  {k:'reg',nm:'Torneo regional',d:'Rivales de menor nivel. Premio modesto, poco riesgo.',opp:-12,games:2,prize:0.5,risk:0.004,mor:2},
  {k:'int',nm:'Torneo internacional',d:'Rivales de tu nivel o superior. Más premio, más cansancio y riesgo.',opp:0,games:3,prize:1.2,risk:0.012,mor:4},
  {k:'work',nm:'Trabajo físico en casa',d:'Sin torneo: el cuerpo técnico prepara la temporada. Sin premio, sin riesgo.',opp:null,games:0,prize:0,risk:0,mor:1}];
function preseasonOffer(){
  const c=userClub();if(!c||S.pre&&S.pre.Y===userYear())return;
  const d=dateOf(S.t),mo=d.getUTCMonth()+1,first=leagueOf(c.id).sched[0],left=first?first.t-S.t:99;
  if(!first||left>35||left<7)return;
  if(S.inbox.some(m=>m.ty==='preseason'&&!m.done))return;
  S.pre={Y:userYear(),done:false};
  inbox({ty:'preseason',title:'Pretemporada: elige tu plan',body:`Quedan ${left} días para la liga. Elige torneo según nivel de rival, premio y riesgo de lesión o cansancio. Cambia el presupuesto y la moral de la primera jornada.`,exp:S.t+10,
    ch:PRE_OPTS.map(o=>({k:o.k,l:o.nm}))});
}
function preseasonPlay(key){
  const c=userClub(),o=PRE_OPTS.find(x=>x.k===key)||PRE_OPTS[2],lg=leagueOf(c.id);
  const res=[];let pts=0;
  if(o.games){
    const pool=S.clubs.filter(x=>x.id!==c.id&&x.cc===c.cc&&Math.abs(x.skill-(c.skill+o.opp))<=6).sort(()=>Math.random()-0.5).slice(0,o.games);
    pool.forEach(r=>{const M=newMatch(c.id,r.id,false);runAuto(M,90);const my=M.hg,op=M.ag;pts+=my>op?3:my===op?1:0;res.push(`${c.short} ${my}-${op} ${r.short}`);});
  }
  const prize=Math.round(Math.max(60000,wageBill(c)*o.prize*0.8)/1e4)*1e4*(o.games?Math.max(0.5,pts/Math.max(1,o.games*1.5)):0);
  if(prize>0)c.budget+=Math.round(prize/1e4)*1e4;
  const moral=o.mor+(o.games?Math.round((pts/(o.games*3)-0.4)*4):0);
  c.preB={v:clamp(moral,-1,5)*0.35,until:(lg.sched[0]?lg.sched[0].t:S.t)+21};
  // riesgo de lesión y cansancio
  const hurt=[];c.players.map(i=>S.players[i]).forEach(p=>{if(Math.random()<o.risk*(traitOf(p)==='Frágil'?1.6:1)&&!p.inj){p.inj=ri(1,4);hurt.push(p.name);}});
  S.pre.done=true;S.pre.res={opt:o.nm,games:res,prize:Math.round(prize/1e4)*1e4,moral:c.preB.v,hurt};
  news(`Pretemporada (${o.nm}): ${res.join(' · ')||'trabajo físico'}${prize>0?` · premio ${EUR(Math.round(prize/1e4)*1e4)}`:''}${hurt.length?` · lesionados: ${hurt.join(', ')}`:''}.`,'g');
  return S.pre.res;
}
const preBonus=cid=>{const c=S.clubs[cid];return c&&c.preB&&S.t<=c.preB.until?c.preB.v:0;};

/* ---------- 11. Elegir patrocinador al inicio de temporada ---------- */
function sponsorPickOffer(){
  const c=userClub();if(!c)return;S.spk=S.spk||{};const k=userYear();if(S.spk[k])return;
  const first=leagueOf(c.id).sched[0];if(!first||first.t-S.t>45)return;
  S.spk[k]=true;
  const w=Math.max(40000,Math.round(c.sp*0.18/1e3)*1e3);
  inbox({ty:'sponsorpick',title:'Elige tu patrocinador de la temporada',body:`A) ${EUR(w*1.0)}/sem fijos y sin bonus. B) ${EUR(Math.round(w*0.8/1e3)*1e3)}/sem y bono de ${EUR(Math.round(w*20/1e4)*1e4)} si cumples el objetivo de liga. C) ${EUR(Math.round(w*0.65/1e3)*1e3)}/sem y bono de ${EUR(Math.round(w*34/1e4)*1e4)} si llegas lejos en copa y das minutos a la cantera.`,exp:S.t+14,
    ch:[{k:'A',l:'A · dinero seguro'},{k:'B',l:'B · bono de liga'},{k:'C',l:'C · bono copa y cantera'}],sw:w});
}
function sponsorPick(m,key){
  const c=userClub(),w=m.sw,add=key==='A'?w:key==='B'?Math.round(w*0.8/1e3)*1e3:Math.round(w*0.65/1e3)*1e3;
  c.sp+=add;S.spBonus={Y:userYear(),key,amt:key==='B'?Math.round(w*20/1e4)*1e4:key==='C'?Math.round(w*34/1e4)*1e4:0,add};
  return `Patrocinador ${key} firmado: +${EUR(add)}/sem${S.spBonus.amt?` y bono de ${EUR(S.spBonus.amt)} si cumples`:''}.`;
}
function sponsorBonusEnd(uc,sum){
  const b=S.spBonus;if(!b||!b.amt||b.paid)return;S.spBonus=null;
  const ok=b.key==='B'?!!(sum.user&&sum.user.rankOk):!!(sum.user&&sum.user.youthOk&&(sum.cupOk||sum.tn&&sum.tn.some(x=>x.out<=8)));
  if(ok){uc.budget+=b.amt;sum.spBonus=b.amt;news(`Bono de patrocinio cobrado: ${EUR(b.amt)}.`,'g');}
  else news('No cumpliste las condiciones del patrocinador: pierdes el bono.','n');
}

/* ---------- 8. Gestión internacional (ligera): convocatorias de tus jugadores ---------- */
const INTL=[[9,1,9,12],[10,6,10,14],[11,10,11,18],[3,18,3,26],[6,1,6,10]];
const inIntl=t=>{const d=dateOf(t),m=d.getUTCMonth()+1,dd=d.getUTCDate();return INTL.some(([a,b,c,e])=>m===a&&dd>=b&&dd<=e);};
function callupWeek(){
  const c=userClub();if(!c||!inIntl(S.t)||S.callK===Math.floor(S.t/20))return;S.callK=Math.floor(S.t/20);
  const out=[];
  c.players.map(i=>S.players[i]).forEach(p=>{
    if(p.inj||p.away)return;const nt=NAT[p.nat];if(!nt)return;
    const cut=60+(nt.yq-1)*18;if(p.ovr<cut||Math.random()>0.55)return;
    p.away=S.t+9;p.intl=(p.intl||0)+1;
    const risk=Math.random()<0.04*(traitOf(p)==='Frágil'?1.6:1);
    if(risk){p.inj=ri(2,6);out.push(`${p.name} (${p.nat}) vuelve lesionado de la selección: ${p.inj} semanas.`);}
    else{if(p.age<=24&&p.ovr<p.pot&&Math.random()<0.3){p.ovr++;out.push(`${p.name} (${p.nat}) crece con la selección: +1 de nivel.`);}else out.push(`${p.name} es convocado por ${nt.nm}: se pierde esta jornada.`);}
    p.mv=Math.min(1.15,(p.mv||1)*1.03);
  });
  out.slice(0,5).forEach(t=>news(t,'g'));
  if(S.callY!==userYear()){S.callY=userYear();S.callN=0;}
  if(out.length&&S.callN<2){S.callN++;inbox({ty:'info',title:'Parón de selecciones',body:`${out.length} de tus jugadores han sido convocados. Estarán fuera esta semana; una convocatoria puede beneficiar (crecimiento, valor) o complicar (lesión) a tu plantilla.`});}
}
const isAway=p=>!!(p.away&&p.away>=S.t);

/* ---------- 9. Deadline Day como evento por horas ---------- */
const DD_HOURS=['10:00','12:00','14:00','16:00','18:00','20:00','22:00','23:59'];
function ddOpen(){
  const c=userClub();if(!c)return null;
  S.dd={cc:c.cc,step:0,log:[],signed:[],sold:[],failed:[],opps:[],open:true,Y:userYear()};
  ddGen();return S.dd;
}
function ddGen(){
  const dd=S.dd,c=userClub();dd.opps=[];
  // oportunidades de última hora: jugadores de otros clubes, prima por urgencia
  const need=['GK','DEF','MID','FWD'].map(pos=>({pos,avg:avg(c.players.map(i=>S.players[i]).filter(p=>p.pos===pos).sort((a,b)=>b.ovr-a.ovr).slice(0,3).map(p=>p.ovr))})).sort((a,b)=>a.avg-b.avg)[0];
  const cand=[];
  for(let k=0;k<160&&cand.length<2;k++){
    const oc=pick(S.clubs);if(oc.id===c.id||oc.players.length<=20||!winOpen(oc.cc,S.t))continue;
    const p=S.players[pick(oc.players)];if(!p||p.pos!==need.pos||p.ovr<need.avg+1||p.ovr>need.avg+9)continue;
    const fee=Math.round(valueOf(p)*1.18/1000)*1000;if(fee>c.budget||cand.some(x=>x.pid===p.id))continue;
    cand.push({pid:p.id,fee,wage:Math.round(wageAsk(p).w/100)*100,years:3,exp:DD_HOURS[dd.step]});
  }
  dd.opps=cand;
}
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
function ddNext(){
  const dd=S.dd;if(!dd||!dd.open)return;
  const hour=DD_HOURS[dd.step];
  // lo que no cerraste se cae
  dd.opps.forEach(o=>{if(!o.closed){dd.failed.push(`${S.players[o.pid].name}: se te escapó a las ${hour}`);}});
  const c=userClub(),r=Math.random();
  // oferta entrante para uno de tus jugadores
  if(r<0.5&&winOpen(c.cc,S.t)){
    const pl=c.players.map(i=>S.players[i]).filter(p=>!lockDays(p)&&!(p.src==='free'&&S.t-(p.since||0)<365)).sort((a,b)=>valueOf(b)-valueOf(a)).slice(0,12);
    const p=pl.length?pick(pl):null;
    if(p&&!S.inbox.some(m=>m.ty==='offer'&&!m.done&&m.pid===p.id)){
      const buyers=S.clubs.filter(b=>b.id!==c.id&&winOpen(b.cc,S.t)&&b.budget>valueOf(p)*1.1&&b.players.length<27);
      if(buyers.length){const b=pick(buyers),fee=Math.round(valueOf(p)*rnd(1.0,1.3)/1000)*1000;
        inbox({ty:'offer',title:`Oferta de última hora por ${p.name}`,body:`${b.name} ofrece ${EUR(fee)} por ${p.name}. Vence cuando cierre el mercado.`,pid:p.id,cid:b.id,fee,max:Math.round(fee*1.25/1000)*1000,exp:S.t+1,ch:[{k:'accept',l:'Aceptar'},{k:'counter',l:'Contraofertar'},{k:'reject',l:'Rechazar'}]});
        dd.log.push(`${hour} · ${b.name} lanza una oferta por ${p.name}.`);}
    }
  }
  // puja rival por tus objetivos (lista corta)
  const tg=S.short.map(i=>S.players[i]).filter(p=>p&&p.club!=null&&p.club!==S.user);
  if(tg.length&&Math.random()<0.4){const p=pick(tg),rc=S.clubs.filter(x=>x.id!==c.id&&x.id!==p.club&&winOpen(x.cc,S.t)&&x.budget>valueOf(p));
    if(rc.length){const b=pick(rc);moveTo(p,b.id,valueOf(p));S.short=S.short.filter(i=>i!==p.id);dd.log.push(`${hour} · ${b.name} se adelanta y ficha a ${p.name}, de tu lista corta.`);news(`Deadline Day: ${p.name} ficha por ${b.name}.`,'t');}}
  if(!dd.log.length||!dd.log[dd.log.length-1].startsWith(hour))dd.log.push(`${hour} · Sin novedades importantes.`);
  dd.step++;
  if(dd.step>=DD_HOURS.length){dd.open=false;dd.opps=[];return;}
  ddGen();
}
function ddClose(i){
  const dd=S.dd,o=dd.opps[i],p=S.players[o.pid],c=userClub();
  if(!o||o.closed)return 'Operación ya resuelta.';
  if(c.budget<o.fee)return `No tienes presupuesto (${EUR(o.fee)}).`;
  if(c.players.length>=27)return 'Plantilla completa (27).';
  if(wageBill(c)+o.wage>wageLimit(c))return `El salario (${EUR(o.wage)}/sem) supera tu límite salarial.`;
  if(Math.random()<0.18){o.closed=true;dd.failed.push(`${p.name}: el club vendedor se echa atrás.`);return `${S.clubs[p.club].name} se echa atrás en el último minuto.`;}
  doSigning(p,{fee:o.fee,wage:o.wage,years:o.years,sellOn:0,bonus:0,dest:'first'});o.closed=true;dd.signed.push(`${p.name} (${p.ovr}) por ${EUR(o.fee)}`);
  return `¡Cerrado! ${p.name} es tuyo por ${EUR(o.fee)}.`;
}
