"use strict";
/* ================= centro de fichajes: todo lo que está en marcha, recomendaciones y ventas ================= */
/* diferencia de nivel frente a tu titular más flojo de esa línea */
let _cmp=null;
function weakestXI(){
  const k=S.user+'|'+S.t+'|'+userClub().players.length+'|'+userClub().form;
  if(_cmp&&_cmp.k===k)return _cmp.v;
  const v={};lineup(S.user).xi.forEach(x=>{if(x.p.id>0&&(!v[x.slot]||x.p.ovr<v[x.slot].ovr))v[x.slot]=x.p;});
  _cmp={k,v};return v;
}
function cmpBadge(p){
  const w=weakestXI()[p.pos];if(!w||p.club===S.user)return '';
  const d=midOvr(p)-w.ovr;
  return `<span class="chip ${d>0?'good':d<0?'':'info'}" title="Frente a ${esc(w.name)} (${w.ovr}), tu titular más flojo en esa línea">${d>0?'▲ Mejora +'+d:d<0?'▼ '+d+' vs tu once':'= tu once'}</span>`;
}
function recommended(){
  const c=userClub(),w=weakestXI(),room=wageLimit(c)-wageBill(c);
  const line=Object.entries(w).sort((a,b)=>a[1].ovr-b[1].ovr)[0];if(!line)return {line:null,list:[]};
  const [pos,weak]=line,list=[];
  S.clubs.forEach(cl=>{if(cl.id===S.user)return;cl.players.forEach(id=>{const p=S.players[id];if(!p||p.pos!==pos||p.age>31)return;const o=midOvr(p);if(o<=weak.ovr)return;const fee=estFee(p);if(fee>c.budget||estWage(p)>room)return;list.push([p,(o-weak.ovr)*2+Math.max(0,midPot(p)-o)*0.7-Math.log10(fee+1e5)*1.5]);});});
  return {line:pos,weak,list:list.sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0])};
}
const seasonStartDay=()=>dayOf(S.Y,7,1);
function marketHubHTML(){
  const c=userClub(),room=wageLimit(c)-wageBill(c),w=winInfo(c.cc,S.t),log=(S.tlog||[]).filter(x=>x.t>=seasonStartDay()),spent=log.filter(x=>x.k==='in').reduce((s,x)=>s+x.fee,0),earned=log.filter(x=>x.k==='out').reduce((s,x)=>s+x.fee,0);
  const negs=Object.entries(S.neg||{}).map(([id,n])=>({p:S.players[+id],n})).filter(x=>x.p&&x.p.club!==S.user&&x.n.stage!=='done'&&(x.n.log.length>0)&&!(x.n.dead&&S.t>x.n.cool));
  const offers=S.inbox.filter(m=>m.ty==='offer'&&!m.done);
  const short=S.short.map(i=>S.players[i]).filter(p=>p&&p.club!==S.user&&p.where!=='retired');
  const pre=Object.values(S.players).filter(p=>p.pre&&p.pre.cid===S.user),prep=S.prep?Object.keys(S.prep).map(k=>S.players[+k]).filter(Boolean):[],loansIn=c.players.map(i=>S.players[i]).filter(p=>p&&p.lo),loansOut=(S.ac.loans||[]).map(i=>S.players[i]).filter(Boolean);
  const rec=recommended(),LN={GK:'la portería',DEF:'la defensa',MID:'el mediocampo',FWD:'el ataque'};
  const flow=Math.max(1,spent,earned);
  return `<div class="mkhero">${marketArt()}<div class="mkhero-in"><div class="lbl">Centro de fichajes</div><h2>${w.open?'Mercado abierto':'Mercado cerrado'}</h2><div class="sub">${w.open?`Quedan ${w.left} días (cierra el ${fmtD(w.closes)})`:`Abre el ${fmtD(w.opens)} · agentes libres disponibles`}</div></div></div>
   <div class="mkstats"><div class="mks">${ic('wallet')}<div><div class="lbl">Presupuesto</div><b>${EUR(c.budget)}</b></div></div><div class="mks">${ic('coin')}<div><div class="lbl">Margen salarial</div><b class="${room<0?'bad':''}">${EUR(room)}/sem</b></div></div><div class="mks">${ic('users')}<div><div class="lbl">Plantilla</div><b>${c.players.length}/27</b></div></div></div>
   <div class="hubnav"><button class="btn pri" data-act="goto" data-v="market:search">${ic('search','sm')} Buscar jugadores</button><button class="btn" data-act="goto" data-v="market:free">${ic('users','sm')} Agentes libres</button><button class="btn" data-act="goto" data-v="market:sell">${ic('tag','sm')} Vender</button>${w.open&&S.dd&&S.dd.open?`<button class="btn" data-act="ddopen">${ic('clock','sm')} Deadline Day</button>`:''}</div>
   <div class="panel"><div class="hd"><h2>Balance de la temporada</h2><span class="chip ${earned-spent>=0?'good':'bad'}">${earned-spent>=0?'+':''}${EUR(earned-spent)}</span></div>
     <div class="flow"><span>Gastado</span><div class="wbar bad"><i style="width:${spent/flow*100}%;background:#e5484d"></i></div><b>${EUR(spent)}</b></div><div class="flow"><span>Ingresado</span><div class="wbar"><i style="width:${earned/flow*100}%"></i></div><b>${EUR(earned)}</b></div>
     ${log.slice(0,6).map(x=>`<div class="kv"><span><span class="chip ${x.k==='in'?'info':'gold'}">${x.k==='in'?'Alta':'Baja'}</span> ${esc(x.n)} <span class="sub">${fmtD(x.t)}${x.club?' · '+esc(x.club):''}</span></span><b>${x.fee?EUR(x.fee):'Libre'}</b></div>`).join('')||'<div class="sub">Sin movimientos esta temporada.</div>'}</div>
   ${negs.length?`<div class="panel"><div class="hd"><h2>Negociaciones abiertas</h2><span class="cnt">${negs.length}</span></div>${negs.map(({p,n})=>`<div class="hubrow"><div class="grow" style="min-width:0"><b class="ellip">${esc(p.name)}</b><div class="sub">${n.dead?'<span class="bad">Rota hasta el '+fmtD(n.cool)+'</span>':n.stage==='player'?'<span class="good">Falta el contrato</span>':'Hablando con el club · paciencia '+n.patience+'/3'}</div></div>${ovrChip(p)}<button class="btn sm pri" data-act="offer" data-id="${p.id}" ${n.dead?'disabled':''}>Continuar</button></div>`).join('')}</div>`:''}
   ${offers.length?`<div class="panel"><div class="hd"><h2>Ofertas por tus jugadores</h2><span class="cnt">${offers.length}</span></div><div class="dlist">${offers.map(msgHTML).join('')}</div></div>`:''}
   ${rec.line?`<div class="panel"><div class="hd"><h2>Recomendados para ti</h2><span class="sub">Refuerzan ${LN[rec.line]}</span></div><p class="sub" style="margin-top:0">Tu titular más flojo ahí es ${esc(rec.weak.name)} (${rec.weak.ovr}). Todos entran en tu presupuesto y en tu margen salarial.</p>${rec.list.length?`<div class="mcards">${rec.list.map(p=>marketCard(p,false)).join('')}</div>`:'<div class="empty">Nadie mejora esa línea con tu presupuesto actual. Vende o mira agentes libres.</div>'}</div>`:''}
   <div class="panel"><div class="hd"><h2>Lista corta</h2><span class="sub">${short.length} jugadores</span></div>${short.length?`<div class="mcards">${short.slice(0,12).map(p=>marketCard(p,p.where==='free')).join('')}</div>`:'<div class="empty">Pulsa la estrella en cualquier tarjeta para seguir a un jugador.</div>'}</div>
   ${pre.length||prep.length||loansIn.length||loansOut.length?`<div class="panel"><div class="hd"><h2>Acuerdos y cesiones</h2></div>
     ${pre.map(p=>`<div class="kv"><span><span class="chip good">Pre-contrato</span> ${esc(p.name)}</span><b>llega el 1 de julio</b></div>`).join('')}
     ${prep.map(p=>`<div class="kv"><span><span class="chip gold">Preparada</span> ${esc(p.name)} · ${EUR(S.prep[p.id].fee)}</span><button class="btn xs" data-act="prepdd" data-id="${p.id}">Retirar</button></div>`).join('')}
     ${loansIn.map(p=>`<div class="kv"><span><span class="chip info">Cedido a ti</span> ${esc(p.name)}</span><b>${p.lo.opt?(p.lo.obl?'obligación ':'opción ')+EUR(p.lo.opt):'sin compra'}</b></div>`).join('')}
     ${loansOut.map(p=>`<div class="kv"><span><span class="chip">Tuyo, cedido</span> ${esc(p.name)}</span><b>${p.loan&&S.clubs[p.loan.cid]?esc(S.clubs[p.loan.cid].name):''}</b></div>`).join('')}</div>`:''}`;
}
function sellHTML(){
  const c=userClub(),off=S.inbox.filter(m=>m.ty==='offer'&&!m.done),xi=new Set(lineup(c.id).xi.map(x=>x.p.id));
  const pl=c.players.map(i=>S.players[i]).filter(Boolean).sort((a,b)=>valueOf(b)-valueOf(a));
  return `${off.length?`<div class="panel"><div class="hd"><h2>Ofertas recibidas</h2><span class="cnt">${off.length}</span></div><div class="dlist">${off.map(msgHTML).join('')}</div></div>`:''}
   <div class="panel"><div class="hd"><h2>Tus jugadores</h2><span class="sub">Ponlos en venta para recibir más ofertas</span></div><div class="mcards">${pl.map(p=>{const lock=lockDays(p),t=tierOf(p.ovr);
    return `<article class="mcard ${t}" data-act="player" data-id="${p.id}" tabindex="0"><div class="mc-top"><div class="mc-ovr ${t}"><b>${p.ovr}</b><small>${p.sp?SPL[p.sp]:POSL[p.pos]}</small></div><div class="mc-id"><b class="ellip">${esc(p.name)}${deltaChip(p)}</b><div class="sub">${p.age} años · contrato ${p.ce+1}</div><div class="mc-club">${xi.has(p.id)?'<span class="chip acc">Titular</span>':'<span class="chip">Suplente</span>'}${p.ce<=S.Y?' <span class="chip warn">Acaba contrato</span>':''}</div></div><div class="mc-price"><b>${EUR(valueOf(p))}</b><span>valor</span></div></div>
     <div class="mc-act">${lock?`<span class="reach mid">Adaptación: ${lock} días</span>`:`<span class="sub">Venta directa ${EUR(sellPrice(p))}</span>`}<span class="grow"></span><button class="btn xs ${p.nb?'on':''}" data-act="nosell" data-id="${p.id}">${p.nb?'Sin ofertas ✓':'Intransferible'}</button><button class="btn xs ${p.tl?'on':''}" data-act="tl" data-id="${p.id}" ${p.nb?'disabled':''}>${p.tl?'En venta ✓':'Poner en venta'}</button><button class="btn xs" data-act="sellp2" data-id="${p.id}" ${lock?'disabled':''}>Vender</button></div></article>`;}).join('')}</div></div>`;
}
