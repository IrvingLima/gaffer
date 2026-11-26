"use strict";
/* ================= negociación de fichajes: contraofertas, cláusulas, rivales, cesiones con opción ================= */
const NEG_PATIENCE=3;
function negGet(pid){
  S.neg=S.neg||{};
  let n=S.neg[pid];
  if(!n||n.dead&&S.t>n.cool){n=S.neg[pid]={stage:'club',patience:NEG_PATIENCE,askMult:1,round:0,rival:null,log:[],terms:null,cool:0,dead:false,mode:'buy',t0:S.t};
    const mm=S.memo&&S.memo[pid];if(mm&&S.t-mm.t<400){n.askMult*=1.05;n.memo=mm;}}
  return n;
}
const negLog=(n,who,txt)=>{n.log.push({who,txt,t:S.t});};
function negClosedReason(p){
  const c=userClub(),pc=p.club!=null?S.clubs[p.club]:null;
  if(p.where==='free')return null;
  if(!winOpen(c.cc,S.t)){const w=winInfo(c.cc,S.t);return `Tu ventana de fichajes está cerrada. Abre el ${fmtD(w.opens)}. Solo puedes fichar agentes libres.`;}
  if(pc&&!winOpen(pc.cc,S.t))return `La ventana del club vendedor (${LG_BY_CC[pc.cc].nm}) está cerrada.`;
  return null;
}
function clauseValue(p,t){const v=valueOf(p);return (t.sellOn||0)/100*v*0.8+(t.bonus||0)*0.7;}
/* ----- fase 1: el club vendedor ----- */
function negClub(pid,t,dest){
  const p=S.players[pid],c=userClub(),n=negGet(pid),pc=p.club!=null?S.clubs[p.club]:null;
  const res={state:'',msg:'',counters:[]};
  if(n.dead){res.state='dead';res.msg=`${pc?pc.name:'El club'} ha roto las negociaciones. Volverán a hablar el ${fmtD(n.cool)}.`;return res;}
  const closed=negClosedReason(p);if(closed){res.state='closed';res.msg=closed;return res;}
  if(dest!=='acad'&&c.players.length>=27&&t.swap==null){res.state='closed';res.msg='Plantilla completa (27). Vende o libera a alguien.';return res;}
  if(dest==='acad'&&acadFree()<=0){res.state='closed';res.msg='La cantera no tiene plazas libres.';return res;}
  if(c.budget<t.fee){res.state='closed';res.msg=`No tienes presupuesto para ${EUR(t.fee)} (tienes ${EUR(c.budget)}).`;return res;}
  n.round++;n.terms={...t,dest};
  const sw=(t.swap!=null&&S.players[t.swap]&&S.players[t.swap].club===S.user)?S.players[t.swap]:null,swV=sw?Math.round(valueOf(sw)*0.85/1000)*1000:0;
  if(sw&&pc&&pc.players.length>=27){res.state='closed';res.msg=`${pc.name} no tiene sitio en su plantilla para ${sw.name}.`;return res;}
  if(n.memo&&n.round===1)negLog(n,'club',`Recuerdan tu oferta anterior de ${EUR(n.memo.fee)}: el precio sube un 5%.`);
  if(sw)negLog(n,'you',`Incluyes a ${sw.name} (${sw.ovr}), que valoran en ${EUR(swV)}.`);
  const v=valueOf(p),A=askOf(p),ask=Math.round(A.fee*n.askMult/1000)*1000,eff=t.fee+clauseValue(p,t)+swV;
  negLog(n,'you',`Ofreces ${EUR(t.fee)}${t.sellOn?` + ${t.sellOn}% de venta futura`:''}${t.bonus?` + bono de ${EUR(t.bonus)}`:''}.`);
  // rival que puja (solo si ya hubo ronda previa y no se cerró el trato)
  if(n.rival&&n.round>1&&Math.random()<0.35&&eff<ask*1.15){
    const rc=S.clubs[n.rival];moveTo(p,rc.id,ask);n.dead=true;n.cool=S.t+30;
    res.state='lost';res.msg=`¡${rc.name} se te ha adelantado y ficha a ${p.name} por ${EUR(ask)}!`;negLog(n,'club',res.msg);news(res.msg,'t');return res;
  }
  if(!n.rival&&n.round===1&&v>2e6&&Math.random()<0.3*dif().rival){
    const cand=S.clubs.filter(x=>x.id!==S.user&&x.id!==p.club&&x.tier<=Math.max(1,c.tier)&&x.budget>ask&&winOpen(x.cc,S.t));
    if(cand.length){n.rival=pick(cand).id;n.askMult*=1.08;negLog(n,'club',`Ojo: ${S.clubs[n.rival].name} también ha preguntado por ${p.name}. Si tardas, puede llevárselo. El precio sube un 8%.`);}
  }
  if(p.where==='free'){n.stage='player';n.patience=NEG_PATIENCE;res.state='accept';res.msg=`${p.name} es agente libre: pasamos a hablar con su agente.`;negLog(n,'club',res.msg);return res;}
  const ask2=Math.round(A.fee*n.askMult/1000)*1000;
  if(eff>=ask2*0.999){n.stage='player';n.patience=NEG_PATIENCE;n.agreed={fee:t.fee,sellOn:t.sellOn||0,bonus:t.bonus||0,swap:sw?sw.id:null};res.state='accept';res.msg=`${pc.name} acepta ${EUR(t.fee)}${t.sellOn?` con ${t.sellOn}% de venta futura`:''}. Ahora el jugador.`;negLog(n,'club',res.msg);return res;}
  const ratio=eff/ask2;
  if(ratio>=0.92){
    const cv=clauseValue(p,t),plain=Math.round(ask2/1000)*1000;
    res.state='counter';res.msg=`Estamos cerca. ${pc.name} pide ${EUR(plain)} sin cláusulas, o ${EUR(Math.max(0,Math.round((ask2-v*0.8*0.15)/1000)*1000))} con un 15% de venta futura.`;
    res.counters=[{l:`${EUR(plain)} sin cláusulas`,fee:plain,sellOn:0,bonus:0},{l:`${EUR(Math.max(0,Math.round((ask2-v*0.8*0.15)/1000)*1000))} + 15% venta`,fee:Math.max(0,Math.round((ask2-v*0.8*0.15)/1000)*1000),sellOn:15,bonus:0}];
    n.patience=Math.max(1,n.patience);negLog(n,'club',res.msg);return res;
  }
  if(ratio>=0.75){
    const cf=Math.round(ask2*0.98/1000)*1000;n.patience--;
    if(n.patience<=0){n.dead=true;n.cool=S.t+14;res.state='dead';res.msg=`${pc.name} se levanta de la mesa tras tantas ofertas bajas.`;negLog(n,'club',res.msg);return res;}
    res.state='counter';res.msg=`Su oferta está por debajo de lo que valoramos. Nos vemos en ${EUR(cf)}.`;res.counters=[{l:`${EUR(cf)}`,fee:cf,sellOn:0,bonus:0}];negLog(n,'club',res.msg);return res;
  }
  n.patience--;n.askMult*=1.03;
  A.why.slice(0,1).forEach(w=>negLog(n,'club',w));
  if(n.patience<=0){n.dead=true;n.cool=S.t+14;res.state='dead';res.msg=`${pc.name} rompe las negociaciones: sus ofertas no son serias.`;negLog(n,'club',res.msg);return res;}
  res.state='reject';res.msg=`Oferta muy baja. Valoramos a ${p.name} en torno a ${EUR(Math.round(ask2*0.9/1e4)*1e4)}. (Paciencia ${n.patience}/${NEG_PATIENCE})`;negLog(n,'club',res.msg);return res;
}
/* ----- fase 2: el agente del jugador ----- */
function negPlayer(pid,t){
  const p=S.players[pid],c=userClub(),n=negGet(pid),WA=wageAsk(p),res={state:'',msg:'',counters:[]};
  const fee=(n.agreed&&n.agreed.fee)||0;
  const wk=n.pre?4:6;
  if((p.where==='free'||n.pre)&&(t.sign||0)<WA.w*wk){const need=Math.ceil(WA.w*wk/1000)*1000;res.state='counter';res.msg=`El agente de ${p.name} exige una prima de fichaje de al menos ${EUR(need)} (${wk} semanas de salario).`;res.counters=[{l:`${EUR(t.wage)}/sem + ${EUR(need)} prima`,wage:t.wage,sign:need}];negLog(n,'agent',res.msg);return res;}
  if(c.budget<fee+(t.sign||0)){res.state='closed';res.msg=`No tienes presupuesto para el traspaso y la prima (${EUR(fee+(t.sign||0))}).`;return res;}
  n.round++;
  const newBill=wageBill(c)+t.wage;
  negLog(n,'you',`Propones ${EUR(t.wage)}/sem durante ${t.years} año${t.years===1?'':'s'}${t.sign?` y ${EUR(t.sign)} de prima de fichaje`:''}.`);
  if(newBill>wageLimit(c)&&(n.terms&&n.terms.dest)!=='acad'){res.state='closed';res.msg=`Supera el límite salarial de la directiva (${EUR(wageLimit(c))}/sem): la masa salarial quedaría en ${EUR(newBill)}.`;negLog(n,'agent',res.msg);return res;}
  let req=WA.w*(1-Math.min(0.18,(t.sign||0)/(WA.w*40)));
  if(p.age>=31&&t.years>2)req*=1.04;if(p.age<=22&&t.years<3)req*=1.04;
  if(t.wage>=req*0.97){
    const o={fee,wage:t.wage,years:t.years,sellOn:n.agreed?n.agreed.sellOn:0,bonus:n.agreed?n.agreed.bonus:0,dest:(n.terms&&n.terms.dest)||'first'};
    if(n.pre){c.budget-=(t.sign||0);p.pre={cid:S.user,wage:t.wage,years:t.years,sign:t.sign||0,Y:S.Y};n.stage='done';res.state='signed';res.msg=`${p.name} firma un pre-contrato: llegará libre el 1 de julio con ${t.years} año${t.years===1?'':'s'} a ${EUR(t.wage)}/sem.`;negLog(n,'agent',res.msg);news(`Pre-contrato: ${p.name} (${S.clubs[p.club].name}) se unirá a tu club en verano.`,'t');return res;}
    const sellerId=p.club;c.budget-=(t.sign||0);doSigning(p,o);
    if(n.agreed&&n.agreed.swap!=null&&sellerId!=null&&typeof applySwap==='function')applySwap(sellerId,n.agreed.swap);
    n.stage='done';res.state='signed';res.msg=`${p.name} firma por ${t.years} año${t.years===1?'':'s'}. ¡Bienvenido!`;negLog(n,'agent',res.msg);return res;
  }
  n.patience--;
  if(t.wage>=req*0.88&&n.patience>0){
    const alt=Math.round(req*0.93/100)*100,altSign=Math.round(WA.w*8/1000)*1000;
    res.state='counter';res.msg=`Su agente pide ${EUR(Math.round(req/100)*100)}/sem, o ${EUR(alt)}/sem con ${EUR(altSign)} de prima de fichaje.`;
    res.counters=[{l:`${EUR(Math.round(req/100)*100)}/sem`,wage:Math.round(req/100)*100,sign:0},{l:`${EUR(alt)}/sem + ${EUR(altSign)} prima`,wage:alt,sign:altSign}];
    negLog(n,'agent',res.msg);return res;
  }
  if(n.patience<=0){n.dead=true;n.cool=S.t+14;res.state='dead';res.msg=`El agente de ${p.name} da por terminadas las conversaciones.`;negLog(n,'agent',res.msg);return res;}
  res.state='reject';res.msg=`Es muy poco para ${p.name}: pide al menos ${EUR(Math.round(req*0.9/100)*100)}/sem. (Paciencia ${n.patience}/${NEG_PATIENCE})`;negLog(n,'agent',res.msg);return res;
}
/* pre-contrato (Bosman): a un jugador al que le queda menos de un año se le puede fichar gratis desde enero */
function negPre(pid){
  const p=S.players[pid],n=negGet(pid);
  n.mode='pre';n.pre=true;n.stage='player';n.patience=NEG_PATIENCE;n.agreed={fee:0,sellOn:0,bonus:0};
  if(!n.log.length)negLog(n,'club',`${S.clubs[p.club].name} no puede impedirlo: a ${p.name} le acaba el contrato en junio. Hablamos directamente con su agente.`);
  return n;
}
function applyPrecontracts(sum){
  const c=userClub();if(!c)return;
  Object.values(S.players).forEach(p=>{
    if(!p.pre||p.pre.cid!==S.user||p.where==='retired')return;
    const pr=p.pre;p.pre=null;
    if(c.players.length>=27){news(`El pre-contrato de ${p.name} caduca: no tienes plaza en la plantilla.`,'t');return;}
    const old=p.club!=null?S.clubs[p.club]:null;if(old)old.players=old.players.filter(i=>i!==p.id);
    p.club=S.user;p.where='first';p.src='free';p.w=pr.wage;p.ce=S.Y+pr.years;p.since=S.t;p.h=0;p.lock=null;c.players.push(p.id);
    if(S.short.includes(p.id))S.short=S.short.filter(i=>i!==p.id);S.know[p.id]=100;
    news(`${p.name} se incorpora a tu club con su pre-contrato.`,'t');if(sum)sum.pre=(sum.pre||[]).concat(p.name);
  });
}
function negReset(pid){if(S.neg)delete S.neg[pid];}
/* ----- cesión con opción de compra ----- */
function loanInEval(pid,o){
  const p=S.players[pid],c=userClub(),pc=p.club!=null?S.clubs[p.club]:null,res={ok:false,msg:''};
  if(!pc){res.msg='Solo se puede pedir cedidos a jugadores de otros clubes.';return res;}
  const closed=negClosedReason(p);if(closed){res.msg=closed;return res;}
  if(c.players.length>=27){res.msg='Plantilla completa (27).';return res;}
  const v=valueOf(p);
  if(keyPlayer(p)&&pc.skill>=c.skill-6&&p.ovr>=(c.skill-12)){res.msg=`${p.name} es titular en ${pc.name}: no lo ceden.`;return res;}
  if(p.age>=30){res.msg='Solo ceden jugadores jóvenes o de plantilla.';return res;}
  const need=Math.round(v*(o.obl?0.04:0.07)/1000)*1000;
  if(o.obl&&!(o.opt>0)){res.msg='La obligación de compra necesita un precio de compra.';return res;}
  if(o.fee<need){res.msg=`${pc.name} pide al menos ${EUR(need)} por la cesión.`;return res;}
  if(o.opt>0&&o.opt<v*0.9){res.msg=`La opción de compra debe ser al menos ${EUR(Math.round(v*0.9/1e4)*1e4)}.`;return res;}
  if(c.budget<o.fee){res.msg='No tienes presupuesto.';return res;}
  const bill=wageBill(c)+p.w;if(bill>wageLimit(c)){res.msg=`Supera el límite salarial (${EUR(wageLimit(c))}/sem).`;return res;}
  res.ok=true;res.msg=`${pc.name} acepta la cesión de ${p.name} hasta fin de temporada.`;return res;
}
function loanInDo(pid,o){
  const p=S.players[pid],c=userClub(),pc=S.clubs[p.club];
  pc.players=pc.players.filter(i=>i!==pid);pc.budget+=o.fee;c.budget-=o.fee;
  p.lo={from:pc.id,opt:o.opt||0,Y:S.Y,obl:!!o.obl};p.club=S.user;p.where='first';p.lock=null;c.players.push(pid);
  if(pc.players.length<21)refillClub(pc);
  news(`Cesión: ${p.name} llega cedido desde ${pc.name}${o.opt?` con ${o.obl?'obligación':'opción'} de compra de ${EUR(o.opt)}`:''}.`,'t');
}
function loanInSeasonEnd(){
  const c=userClub();if(!c)return;
  c.players.slice().forEach(id=>{const p=S.players[id];if(!p||!p.lo)return;
    const from=S.clubs[p.lo.from];
    if(p.lo.obl&&p.lo.opt>0){
      if(c.budget>=p.lo.opt){c.budget-=p.lo.opt;if(from)from.budget+=p.lo.opt;news(`Obligación de compra cumplida: ${p.name} pasa a ser tuyo por ${EUR(p.lo.opt)}.`,'t');p.lo=null;p.ce=S.Y+3;p.since=S.t;return;}
      c.board=Math.max(0,c.board-4);news(`No puedes pagar la obligación de compra de ${p.name}: la directiva se enfada.`,'n');
    }
    c.players=c.players.filter(i=>i!==id);
    if(from){p.club=from.id;from.players.push(id);}else{p.club=null;p.where='free';S.free.push(id);}
    news(`${p.name} vuelve a ${from?from.name:'su club'} al terminar la cesión.`,'n');p.lo=null;
  });
}
function loanOptionWeek(){
  const c=userClub();if(!c)return;const mo=dateOf(S.t).getUTCMonth()+1;if(![4,5,6].includes(mo))return;
  c.players.map(i=>S.players[i]).filter(p=>p.lo&&p.lo.opt>0&&!p.lo.obl&&!p.lo.asked).forEach(p=>{
    p.lo.asked=true;
    inbox({ty:'loanopt',title:`Opción de compra: ${p.name}`,body:`Puedes quedarte definitivamente a ${p.name} (${p.ovr}) por ${EUR(p.lo.opt)}. Si no decides antes del 30 de junio, vuelve a su club.`,pid:p.id,fee:p.lo.opt,exp:dayOf(S.Y+1,6,28),
      ch:[{k:'buy',l:'Ejercer la opción'},{k:'return',l:'Devolverlo'}]});
  });
}
/* ----- contraofertar a quien te compra ----- */
function counterIncoming(mid,fee){
  const m=S.inbox.find(x=>x.id===mid);if(!m||m.done)return {state:'closed',msg:'La oferta ya no está vigente.'};
  const p=S.players[m.pid];m.rounds=(m.rounds||0)+1;
  if(fee<=m.fee){return {state:'accept',msg:`Aceptan: ${EUR(m.fee)}.`,fee:m.fee};}
  if(fee<=m.max)return {state:'accept',msg:`${S.clubs[m.cid].name} acepta pagar ${EUR(fee)}.`,fee};
  if(m.rounds<2&&fee<=m.max*1.12){const cf=Math.round((m.max)/1e4)*1e4;m.fee=Math.max(m.fee,Math.round(m.max*0.96/1e4)*1e4);return {state:'counter',msg:`Podemos llegar a ${EUR(cf)} y no más.`,fee:cf};}
  m.done=true;return {state:'withdrawn',msg:`${S.clubs[m.cid].name} retira su oferta: pides demasiado.`};
}
function acceptIncoming(mid,fee){
  const m=S.inbox.find(x=>x.id===mid);if(!m||m.done)return 'La oferta ya no está vigente.';
  const p=S.players[m.pid];if(!p||p.club!==S.user)return 'El jugador ya no está en tu plantilla.';
  const err=transferOut(m.pid,m.cid,fee);if(err)return err;m.done=true;return null;
}
