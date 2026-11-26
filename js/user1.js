"use strict";
/* ================= staff, ojeo, traspasos ================= */
const staffK=()=>{const c=userClub();return c?Math.max(8,wageBill(c)*0.06/420):12;};
function genStaff(role,ab,home){
  const nat=pickNat(userClub()?userClub().cc:'ES'),s={id:S.uid++,nm:genName(nat),nat,age:ri(30,62),role,ab:clamp(ab,1,20),ce:ri(1,3)};
  if(role==='scout'){
    s.ja=clamp(ab+ri(-3,3),1,20);s.jp=clamp(ab+ri(-3,3),1,20);s.ad=clamp(ab+ri(-4,4),1,20);s.ab=Math.round((s.ja+s.jp)/2);
    s.kn={};NATS.forEach(n=>{s.kn[n[0]]=n[0]===nat?18:NAT[n[0]].reg===NAT[nat].reg?clamp(Math.round(10+gauss()*3),3,17):clamp(Math.round(3+gauss()*2),1,9);});
  }
  s.w=Math.max(300,Math.round(staffK()*s.ab*s.ab*(s.ab>=14?1.35:1)/10)*10);
  return s;
}
function initClubForUser(switched){
  const c=userClub();
  S.staff={hired:[],market:[]};
  ['asst','fit','tech','gk','youth','phys','anal'].forEach(r=>S.staff.hired.push(genStaff(r,Math.round(5+(c.skill-60)/3.2+gauss()*1.5),true)));
  const ns=c.skill>=80?3:2;for(let i=0;i<ns;i++)S.staff.hired.push(genStaff('scout',Math.round(5+(c.skill-60)/3.5+gauss()*1.5),true));
  refreshStaffMarket();
  const lvl=c.tier===1?(c.skill>=84?4:c.skill>=75?3:2):1;
  S.ac={lvl,list:[],loans:[],intake:[]};
  for(let i=0;i<7;i++){const p=genProspect(true);p.where='acad';p.wk=ri(2,14);S.players[p.id]=p;S.ac.list.push(p.id);}
  genIntake();
  c.ins=c.ins||{};c.train=c.train||'bal';c.formOut=c.formOut||null;
  S.short=S.short||[];S.scout.miss={};S.reports=S.reports||[];
  genObjectives();
}
function refreshStaffMarket(){
  const roles=['asst','fit','tech','gk','youth','phys','anal','scout','scout','scout','youth','fit','tech','scout'];
  const c=userClub(),base=c?Math.round(5+(c.skill-60)/3):8;
  S.staff.market=roles.map(r=>genStaff(r,clamp(Math.round(base+gauss()*3.5+(Math.random()<0.15?4:0)),3,19)));
  S.staff.market.sort((a,b)=>b.ab-a.ab);
}
function hireStaff(sid){
  const s=S.staff.market.find(x=>x.id===sid);if(!s)return 'No disponible';
  if(s.role==='scout'&&S.staff.hired.filter(x=>x.role==='scout').length>=5)return 'Máximo 5 ojeadores.';
  const prev=s.role!=='scout'?S.staff.hired.find(x=>x.role===s.role):null;
  const c=userClub(),fee=s.w*4;
  if(c.budget<fee)return 'Presupuesto insuficiente para la prima de fichaje ('+EUR(fee)+').';
  if(prev){S.staff.hired=S.staff.hired.filter(x=>x!==prev);c.budget-=prev.w*8;S.staff.market.push(prev);}
  c.budget-=fee;S.staff.hired.push(s);S.staff.market=S.staff.market.filter(x=>x!==s);
  news(`Nuevo ${STAFF_ROLES[s.role].nm.toLowerCase()}: ${s.nm} (nivel ${s.ab}).`,'n');return null;
}
function fireStaff(sid){
  const s=S.staff.hired.find(x=>x.id===sid);if(!s)return;
  userClub().budget-=s.w*8;S.staff.hired=S.staff.hired.filter(x=>x!==s);delete S.scout.miss[sid];
}

/* ================= ojeo por países ================= */
function setMission(sid,cfg){S.scout.miss[sid]={nat:cfg.nat,pos:cfg.pos||'ALL',maxAge:cfg.maxAge||23,minPot:cfg.minPot||0,wk:0,follow:null};}
function followPlayer(sid,pid){const m=S.scout.miss[sid];if(!m)return;m.follow=pid;m.wk=0;}
function raiseK(p,s,inc){
  const cur=S.know[p.id]!==undefined?S.know[p.id]:kOf(p);
  S.know[p.id]=Math.min(100,Math.round(cur+inc));
  const q=S.kq[p.id]||[0,0];S.kq[p.id]=[Math.max(q[0],s.ja),Math.max(q[1],s.jp)];
}
function scoutWeek(){
  const c=userClub();let flagged=0;
  S.staff.hired.filter(s=>s.role==='scout').forEach(s=>{
    const m=S.scout.miss[s.id];if(!m)return;m.wk++;c.budget-=2500+(NAT[m.nat].reg!==NAT[c.cc].reg?3500:0);
    const kn=s.kn[m.nat]||3;
    if(m.follow){
      const p=S.players[m.follow];
      if(!p||p.where==='retired'||p.club===S.user){m.follow=null;}
      else{raiseK(p,s,10+kn*0.7);if((S.know[p.id]||0)>=100){inbox({ty:'info',title:`Informe completo: ${p.name}`,body:`${s.nm} ha terminado de seguir a ${p.name}. Ya conoces su nivel real: ${p.ovr}/${p.pot}.`,pid:p.id});m.follow=null;}return;}
    }
    let pool=playersOfCountry(m.nat).filter(p=>p.club!==S.user&&p.age<=m.maxAge&&(m.pos==='ALL'||p.pos===m.pos)&&p.pot>=m.minPot&&(S.know[p.id]===undefined||S.know[p.id]<60));
    if(!pool.length)return;
    pool.sort((a,b)=>(b.pot+gauss()*s.jp*0.8)-(a.pot+gauss()*s.jp*0.8));
    const n=Math.max(1,Math.round(0.6+(kn+s.ja)/16));
    for(let i=0;i<n&&i<pool.length;i++){
      const p=pool[ri(0,Math.min(pool.length-1,Math.floor(pool.length*0.35)))];
      const was=S.know[p.id]!==undefined&&S.know[p.id]>=35;
      raiseK(p,s,was?10:Math.max(0,38+kn*1.3-(kOf(p))));
      if(!S.reports.some(r=>r.pid===p.id&&S.t-r.t<60))S.reports.unshift({t:S.t,sid:s.id,pid:p.id,nat:m.nat});
      if(p.pot>=80&&p.age<=21&&flagged<2){flagged++;inbox({ty:'scout',title:`Hallazgo en ${NAT[m.nat].nm}`,body:`${s.nm} ha visto a ${p.name} (${p.age} años, ${POSL[p.pos]}). Potencial estimado ${showPot(p)}.`,pid:p.id});}
    }
  });
  if(S.reports.length>150)S.reports.length=150;
}
function toggleShort(pid){const i=S.short.indexOf(pid);if(i>=0)S.short.splice(i,1);else S.short.push(pid);}
function nationKnow(nat){
  const ps=S.reports.filter(r=>r.nat===nat).length;
  const sc=S.staff.hired.filter(s=>s.role==='scout'&&S.scout.miss[s.id]&&S.scout.miss[s.id].nat===nat);
  return {reports:ps,scouts:sc};
}

/* ================= traspasos: negociación con motivos y cláusulas ================= */
function keyPlayer(p){
  const pc=S.clubs[p.club];if(!pc)return false;
  const same=pc.players.map(i=>S.players[i]).filter(x=>x.pos===p.pos).sort((a,b)=>b.ovr-a.ovr);
  return same.findIndex(x=>x.id===p.id)<(p.pos==='GK'?1:p.pos==='FWD'?2:3);
}
function askOf(p){
  const c=userClub(),pc=p.club!=null?S.clubs[p.club]:null,v=valueOf(p);
  if(p.where==='free')return {fee:0,why:[]};
  let f=1,why=[];
  if(pc&&pc.rep>c.rep+8){f*=1.12;why.push('Club de mayor prestigio: no regala a sus jugadores.');}
  if(pc&&keyPlayer(p)&&pc.skill>=c.skill-4){f*=1.28;why.push('Es un jugador clave de su equipo.');}
  if(p.ce<=S.Y){f*=0.55;why.push('Le queda 1 año de contrato: el precio baja.');}
  else if(p.ce===S.Y+1){f*=0.85;}
  if(p.age<=21&&p.pot-p.ovr>=10){f*=1.1;}
  f*=dif().ask;
  return {fee:Math.round(v*f/1000)*1000,why};
}
function wageAsk(p){
  const c=userClub(),pc=p.club!=null?S.clubs[p.club]:null;let w=Math.max(p.w,wageOf(p)),why=[];
  if(traitOf(p)==='Ambicioso')w*=1.08;
  if(pc&&c.rep<pc.rep-12){w*=1.3;why.push('Bajar de nivel le cuesta: pide un 30% más.');}
  const best=c.players.map(i=>S.players[i]).filter(x=>x.pos===p.pos).sort((a,b)=>b.ovr-a.ovr);
  if(p.ovr>=65&&best.length&&p.ovr<best[Math.min(best.length-1,p.pos==='GK'?0:2)].ovr-2){w*=1.12;why.push('No tendría sitio en el once: pide más dinero.');}
  if(p.where==='free'){w*=1.25;why.push('Agente libre: sin traspaso, pero pide un salario alto.');}
  return {w:Math.round(w/100)*100,why};
}
/* o={fee,wage,years,sellOn,bonus,dest} */
function evalOffer(p,o){
  const c=userClub(),pc=p.club!=null?S.clubs[p.club]:null,free=p.where==='free',res={ok:false,msgs:[],counter:null};
  const dest=o.dest==='acad'?'acad':'first';
  const A=askOf(p),WA=wageAsk(p);res.ask=A;res.wageAsk=WA;
  if(!free){
    if(!winOpen(c.cc,S.t)){const w=winInfo(c.cc,S.t);res.msgs.push(`Tu ventana de fichajes está cerrada. Abre el ${fmtD(w.opens)}. Solo puedes fichar agentes libres.`);return res;}
    if(pc&&!winOpen(pc.cc,S.t)){res.msgs.push(`La ventana del club vendedor (${LG_BY_CC[pc.cc].nm}) está cerrada.`);return res;}
  }
  if(dest==='first'&&c.players.length>=27){res.msgs.push('Plantilla completa (27). Vende o libera a alguien.');return res;}
  if(dest==='acad'&&acadFree()<=0){res.msgs.push('La cantera no tiene plazas libres.');return res;}
  const v=valueOf(p),eff=o.fee+(o.sellOn||0)/100*v*0.8+(o.bonus||0)*0.7;
  if(c.budget<o.fee){res.msgs.push(`No tienes presupuesto para ${EUR(o.fee)} (tienes ${EUR(c.budget)}).`);return res;}
  if(!free){
    if(eff>=A.fee*0.999){res.msgs.push('El club vendedor acepta las condiciones.');}
    else if(eff>=A.fee*0.9){res.counter=Math.max(0,Math.round((A.fee-(o.sellOn||0)/100*v*0.8-(o.bonus||0)*0.7)/1000)*1000);res.msgs.push(`Rechazada, pero cerca: piden ${EUR(res.counter)} con estas cláusulas.`);A.why.forEach(w=>res.msgs.push(w));return res;}
    else{res.msgs.push(`Oferta insuficiente. Valoran al jugador en torno a ${EUR(A.fee)}.`);A.why.forEach(w=>res.msgs.push(w));return res;}
  }
  const newBill=wageBill(c)+o.wage;
  if(newBill>wageLimit(c)&&dest==='first'){res.msgs.push(`Supera el límite salarial de la directiva (${EUR(wageLimit(c))}/sem). La masa salarial quedaría en ${EUR(newBill)}.`);return res;}
  if(o.wage<WA.w*0.97){res.msgs.push(`El jugador pide al menos ${EUR(WA.w)}/sem.`);WA.why.forEach(w=>res.msgs.push(w));return res;}
  res.ok=true;res.msgs.push(free?'El jugador acepta el contrato.':'¡Trato cerrado!');return res;
}
function doSigning(p,o){
  const wasFree=p.where==='free';
  const c=userClub(),pc=p.club!=null?S.clubs[p.club]:null,dest=o.dest==='acad'?'acad':'first';
  const bonus=o.bonus||0;
  if(dest==='acad'){
    // fichaje para la cantera
    if(pc){pc.players=pc.players.filter(i=>i!==p.id);pc.budget+=o.fee;}
    else if(p.where==='free')S.free=S.free.filter(i=>i!==p.id);
    else if(p.where==='pool'&&S.pools[p.nat])S.pools[p.nat]=S.pools[p.nat].filter(i=>i!==p.id);
    c.budget-=o.fee;p.club=S.user;p.where='acad';p.known=false;p.since=S.t;p.wk=Math.max(p.wk||0,8);p.w=300;p.ce=S.Y+o.years-1;delete p.vc;
    S.ac.list.push(p.id);if(S.short.includes(p.id))S.short=S.short.filter(i=>i!==p.id);
    news(`${p.name} (${p.age}) llega a la cantera desde ${pc?pc.name:NAT[p.nat].nm}.`,'t');return;
  }
  moveTo(p,S.user,o.fee);
  p.src=wasFree?'free':null;
  p.w=o.wage;p.ce=S.Y+o.years-1;p.h=0;p.since=S.t;
  if(pc&&(o.sellOn||0)>0)p.so={cid:pc.id,pct:o.sellOn};
  if(bonus)c.budget-=0;
  if(S.short.includes(p.id))S.short=S.short.filter(i=>i!==p.id);
  S.know[p.id]=100;
  news(`Fichaje: ${p.name} (${POSL[p.pos]} ${p.ovr}) por ${EUR(o.fee)}.`,'t');
}
const lockDays=p=>(p.since!=null&&!p.h)?Math.max(0,84-(S.t-p.since)):0;
const contractF=p=>p.ce<=S.Y?0.55:p.ce===S.Y+1?0.85:1;
function sellPrice(p){
  // un agente libre recién fichado no se revende con beneficio: los intermediarios y el mercado se llevan su parte
  const base=(p.where==='acad'?0.9:0.5)*((p.src==='free'&&S.t-(p.since||0)<365)?0.4:1);
  return Math.round(valueOf(p)*base*contractF(p)*(p.inj?0.8:1)*(p.mv||1)/1000)*1000;
}
function sellPlayer(pid,fee){
  const c=userClub(),p=S.players[pid];if(!p||!c.players.includes(pid))return 'Ese jugador no es tuyo.';
  if(c.players.length<=18)return 'Necesitas al menos 18 jugadores.';
  if(lockDays(p)>0)return `${p.name} acaba de llegar: periodo de adaptación, no se puede traspasar durante ${lockDays(p)} días más.`;
  if(p.pos==='GK'&&c.players.filter(i=>S.players[i].pos==='GK').length<=2)return 'Necesitas al menos 2 porteros.';
  c.players=c.players.filter(i=>i!==pid);p.club=null;p.where='free';
  let net=fee;if(p.so){const pay=Math.round(fee*p.so.pct/100);net-=pay;S.clubs[p.so.cid].budget+=pay;news(`Pagas ${EUR(pay)} (${p.so.pct}%) por la cláusula de venta a ${S.clubs[p.so.cid].name}.`,'n');}
  c.budget+=net;S.ac.list.forEach(i=>{if(S.players[i].mentor===pid)S.players[i].mentor=null;});
  S.free=S.free.filter(i=>i!==pid);
  return null;
}
function transferOut(pid,buyerId,fee){
  const err=sellPlayer(pid,fee);if(err)return err;
  const p=S.players[pid],b=S.clubs[buyerId];
  b.budget-=fee;p.club=b.id;p.where='first';b.players.push(pid);p.ce=S.Y+ri(1,4);p.lock=null;p.tl=false;
  if(b.players.length>27)releaseWorst(b);
  news(`Venta: ${p.name} se marcha a ${b.name} por ${EUR(fee)}.`,'t');return null;
}
function renewAsk(p){
  let f=1.0;const tr=traitOf(p);
  if(p.ovr>=p.pot-1&&p.age>=28)f=1.0;if(tr==='Ambicioso')f*=1.1;if(p.age<=22&&p.pot-p.ovr>=8)f*=1.15;
  const c=userClub();if(c.board<30)f*=1.08;
  return Math.round(Math.max(p.w,wageOf(p))*f/100)*100;
}
function renewPlayer(pid,wage,years){
  const p=S.players[pid],ask=renewAsk(p),c=userClub();
  if(wage<ask*0.97)return `Pide al menos ${EUR(ask)}/sem para renovar.`;
  if(wageBill(c)-p.w+wage>wageLimit(c)*1.04)return 'Supera el límite salarial de la directiva.';
  p.w=wage;p.ce=Math.max(p.ce,S.Y)+years;p.remind=0;news(`${p.name} renueva hasta ${S.Y+years-1+1}.`,'n');return null;
}
function releasePlayer(pid){
  const c=userClub(),p=S.players[pid];if(!p||!c.players.includes(pid))return 'Ese jugador no es tuyo.';
  if(c.players.length<=18)return 'Necesitas al menos 18 jugadores.';
  const cost=p.w*Math.max(8,(p.ce-S.Y+1)*26*0.5);
  if(c.budget<cost)return 'No puedes pagar la indemnización de '+EUR(cost)+'.';
  c.budget-=cost;c.players=c.players.filter(i=>i!==pid);p.club=null;p.where='free';S.free.push(pid);
  S.ac.list.forEach(i=>{if(S.players[i].mentor===pid)S.players[i].mentor=null;});return null;
}
function releaseCost(p){return p.w*Math.max(8,(p.ce-S.Y+1)*26*0.5);}
