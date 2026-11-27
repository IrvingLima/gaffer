"use strict";
/* ================= mesa de negociación: importes exactos, resumen de la operación y comparación ================= */
const parseMoney=t=>{const n=parseInt(String(t).replace(/\D/g,''),10);return isNaN(n)?0:n;};
const stepFor=v=>v>=2e7?500000:v>=5e6?100000:v>=1e6?50000:v>=1e5?10000:v>=2e4?1000:100;
/* limites de cada campo */
function dealBounds(k){
  const p=UI.m&&S.players[UI.m.pid],est=p?approxValue(p):1e6,c=userClub();
  if(k==='fee')return [0,Math.max(c.budget,Math.round(est*3))];
  if(k==='bonus')return [0,Math.round(est)];
  if(k==='lfee')return [0,Math.max(500000,Math.round(est*0.5))];
  if(k==='opt')return [0,Math.round(est*3)];
  if(k==='wage')return [0,Math.max(3000,Math.round(wageOf(p||{ovr:70,age:25,pos:'MID'})*4))];
  if(k==='sign')return [0,Math.max(50000,Math.round(wageOf(p||{ovr:70,age:25,pos:'MID'})*60))];
  if(k==='cn'){const m=S.inbox.find(x=>x.id===UI.m.mid);return [0,Math.round(valueOf(S.players[m.pid])*3)];}
  if(k==='rn')return [0,Math.round(wageOf(S.players[UI.m.pid])*4)];
  return [0,1e9];
}
function dealVal(k){return k==='cn'?UI.cnt.fee:k==='rn'?UI.renewO.wage:UI.offer[k]||0;}
function setDealVal(k,v){const [lo,hi]=dealBounds(k);v=Math.max(lo,Math.min(hi,Math.round(v)));if(k==='cn')UI.cnt.fee=v;else if(k==='rn')UI.renewO.wage=v;else UI.offer[k]=v;return v;}
function moneyBox(k,label,opt){
  opt=opt||{};const v=dealVal(k),[lo,hi]=dealBounds(k);
  return `<div class="money"><div class="row spread"><label for="d_${k}">${label}</label>${opt.unit?`<span class="sub">${opt.unit}</span>`:''}</div>
   <div class="mrow"><button type="button" class="mbtn" data-act="mstep" data-k="${k}" data-d="-1" aria-label="Bajar ${label}">−</button><input id="d_${k}" data-money="${k}" inputmode="numeric" autocomplete="off" value="${EXACT(v)}" aria-label="${label}, importe exacto"><button type="button" class="mbtn" data-act="mstep" data-k="${k}" data-d="1" aria-label="Subir ${label}">+</button></div>
   <input type="range" class="mrange" data-range="${k}" min="${lo}" max="${hi}" step="1" value="${v}" aria-label="${label} (barra)">
   ${opt.chips?`<div class="mchips">${opt.chips.map(([l,val])=>`<button type="button" class="chipbtn" data-act="mpick" data-k="${k}" data-v="${Math.round(val)}">${l}</button>`).join('')}</div>`:''}</div>`;
}
const dRow=(l,v,cls)=>`<div class="kv"><span>${l}</span><b class="${cls||''}">${v}</b></div>`;
function dealSummary(pid){
  const p=S.players[pid],c=userClub(),O=UI.offer,n=negGet(pid),free=p.where==='free';
  if(n.stage==='player'){
    const fee=(n.agreed&&n.agreed.fee)||0,total=fee+(O.sign||0)+(O.wage||0)*52*(O.years||1);
    return `<div class="dsum"><div class="lbl">Coste de la operación</div>${fee?dRow('Traspaso acordado',EXACT(fee)):''}${dRow('Prima de fichaje',EXACT(O.sign))}${dRow('Salario por semana',EXACT(O.wage))}${dRow(`Salarios en ${O.years} año${O.years===1?'':'s'}`,EXACT(O.wage*52*O.years))}${dRow('Total del acuerdo',EXACT(total))}${n.pre?'':dRow('Presupuesto tras firmar',EXACT(c.budget-fee-(O.sign||0)),c.budget-fee-(O.sign||0)<0?'bad':'good')}</div>`;
  }
  const sw=O.swap!=null?S.players[O.swap]:null,swV=sw?Math.round(valueOf(sw)*0.85/1000)*1000:0,cl=free?0:Math.round(clauseValue(p,{sellOn:O.sellOn,bonus:O.bonus})),eff=O.fee+cl+swV,est=estFee(p),r=est?eff/est:1;
  const label=r>=1.08?['Muy generosa','good']:r>=0.98?['En línea con lo que piden','good']:r>=0.9?['Cerca, puede haber contraoferta','warn']:r>=0.75?['Baja','warn']:['Muy baja: se pueden ofender','bad'];
  return `<div class="dsum"><div class="lbl">Tu oferta</div>${dRow('En efectivo',EXACT(O.fee))}${O.sellOn?dRow(`Venta futura ${O.sellOn}% (valorada)`,EXACT(Math.round((O.sellOn/100)*valueOf(p)*0.8))):''}${O.bonus?dRow('Bono por 20 partidos (valorado)',EXACT(Math.round(O.bonus*0.7))):''}${sw?dRow(`Canje: ${esc(sname(sw))}`,EXACT(swV)):''}${dRow('Valor total de la oferta',EXACT(eff))}
   <div class="offmeter ${label[1]}"><div class="row spread"><span class="sub">Estimación del analista: ≈ ${EXACT(est)}</span><b>${Math.round(r*100)}%</b></div><div class="wbar"><i style="width:${Math.min(100,Math.round(r/1.25*100))}%"></i><span style="left:80%"></span></div><div class="sub">${label[0]}</div></div>
   ${dRow('Presupuesto tras pagar',EXACT(c.budget-O.fee),c.budget-O.fee<0?'bad':'good')}</div>`;
}
function dealRefresh(){
  if(!UI.m)return;
  if(UI.m.type==='offer'){const a=document.getElementById('dsum');if(a)a.innerHTML=dealSummary(UI.m.pid);const w=document.getElementById('wmeter');if(w)w.innerHTML=wageMeter(UI.offer.wage);updAnalyst();}
  if(UI.m.type==='renew'){const w=document.getElementById('rnmeter');if(w)w.innerHTML=wageMeter(UI.renewO.wage,S.players[UI.m.pid].w);}
  const g=document.getElementById('cnbtn');if(g&&UI.m.type==='counter')g.textContent='Contraofertar '+EXACT(UI.cnt.fee);
}
function playerHead(p){
  const cl=p.club!=null?S.clubs[p.club]:null,t=tierOf(midOvr(p)),xi=lineup(S.user).xi.filter(x=>x.slot===p.pos&&x.p.id>0).sort((a,b)=>a.p.ovr-b.p.ovr)[0];
  const d=xi?midOvr(p)-xi.p.ovr:null;
  return `<div class="dhead2"><div class="mc-ovr ${t} ${seen(p).e1===0?'':'rg'}"><b>${showOvr(p)}</b><small>${p.sp?SPL[p.sp]:POSL[p.pos]}</small></div>
   <div class="grow" style="min-width:0"><b class="ellip">${esc(p.name)}</b><div class="sub">${flag(p.nat,11)} ${NAT[p.nat].nm} · ${p.age} años · pot. ${showPot(p)}</div><div class="mc-club">${cl?crest(cl,18):''}<span class="ellip">${p.where==='free'?'Agente libre':esc(clubLabel(p))}</span></div></div></div>
   ${xi?`<div class="vsbar"><span class="sub">Tu titular más flojo ahí: <b>${esc(sname(xi.p))} ${xi.p.ovr}</b></span><b class="${d>0?'good':d<0?'bad':''}">${d>0?'+':''}${d} de nivel</b></div>`:''}`;
}
const stepper=i=>`<ol class="steps">${['Club','Contrato','Firma'].map((l,k)=>`<li class="${k<i?'done':k===i?'now':''}"><i>${k<i?'✓':k+1}</i>${l}</li>`).join('')}</ol>`;
const patience=(n,who)=>`<div class="patience"><span class="sub">Paciencia ${who}</span><span class="pdots">${[0,1,2].map(i=>`<i class="${i<n.patience?'on':''}"></i>`).join('')}</span></div>`;
function resBox(r){
  const good=r.state==='accept'||r.state==='signed',bad=r.state==='dead'||r.state==='lost'||r.state==='closed';
  return `<div class="verdict ${good?'good':bad?'bad':'warn'}"><div class="lbl">${good?'Aceptado':bad?'Sin acuerdo':r.state==='counter'?'Contraoferta':'Respuesta'}</div><div>${esc(r.msg)}</div>${(r.counters||[]).length?`<div class="counters">${r.counters.map((c,i)=>`<button class="btn pri" data-act="negcounter" data-v="${i}">Aceptar: ${c.fee!=null?EXACT(c.fee)+(c.sellOn?` + ${c.sellOn}% de venta`:''):EXACT(c.wage)+'/sem'+(c.sign?' + '+EXACT(c.sign)+' de prima':'')}</button>`).join('')}</div>`:''}</div>`;
}
function mOffer(pid){
  const p=S.players[pid],c=userClub(),n=negGet(pid),O=UI.offer,free=p.where==='free',est=approxValue(p),title=(free?'Contrato: ':'Fichaje: ')+p.name;
  const young=p.age<=18&&acadFree()>0&&n.stage==='club';
  const stage=n.stage==='club'?0:n.stage==='player'?1:2;
  let body=playerHead(p)+stepper(stage)+`<div class="dbud"><div><span class="sub">Presupuesto</span><b>${EXACT(c.budget)}</b></div><div><span class="sub">Margen salarial</span><b>${EXACT(wageLimit(c)-wageBill(c))}/sem</b></div></div>`;
  const chat=n.log.length?`<details class="chatfold" ${n.log.length<4?'open':''}><summary class="sub">Conversación (${n.log.length})</summary><div class="chat" id="chat">${n.log.slice(-8).map(bub).join('')}</div></details>`:'';
  const res=`<div id="ofres">${O.res?resBox(O.res):''}</div>`;
  const foot=(a,l,cancel)=>`<div class="dfoot"><button class="btn" data-act="mclose">${cancel||'Retirarse'}</button><button class="btn pri" data-act="${a}">${l}</button></div>`;
  if(n.dead)return modalShell(title,body+chat+`<div class="verdict bad"><div class="lbl">Negociación rota</div><div>Podrás volver a intentarlo el ${fmtD(n.cool)}.</div></div><div class="dfoot"><button class="btn pri" data-act="mclose">Cerrar</button></div>`,'wide deal');
  if(n.stage==='club'){
    if(!free)body+=`<div class="seg dmode"><button class="${O.mode!=='loan'?'on':''}" data-act="nmode" data-v="buy">Traspaso</button><button class="${O.mode==='loan'?'on':''}" data-act="nmode" data-v="loan">Cesión</button></div>`;
    if(O.mode==='loan'&&!free){
      body+=moneyBox('lfee','Coste de la cesión',{chips:[['5 %',est*0.05],['8 %',est*0.08],['12 %',est*0.12]]})+moneyBox('opt','Precio de compra (0 = sin compra)',{chips:[['Sin compra',0],['90 %',est*0.9],['110 %',est*1.1],['130 %',est*1.3]]})
        +`<div class="seg dmode"><button class="${!O.obl?'on':''}" data-act="lobl" data-v="0">Opción de compra</button><button class="${O.obl?'on':''}" data-act="lobl" data-v="1">Obligación de compra</button></div><p class="sub">Cobra su salario completo hasta fin de temporada. ${O.obl?'Con <b>obligación</b> la compra se ejecuta sola al terminar y el club pide menos por la cesión.':'Si hay opción, decides en abril.'}</p>`+res+foot('loanin','Pedir cesión','Cancelar');
    }else{
      body+=`<div class="dgrid"><div>${moneyBox('fee','Traspaso en efectivo',{chips:[['Estimado',estFee(p)],['−10 %',estFee(p)*0.9],['+10 %',estFee(p)*1.1],['Todo mi presupuesto',c.budget]]})}
        <div class="money"><div class="row spread"><label>Venta futura para el vendedor</label></div><div class="seg">${[0,5,10,15,20,30].map(v=>`<button class="${O.sellOn===v?'on':''}" data-act="dsell" data-v="${v}">${v}%</button>`).join('')}</div></div>
        ${moneyBox('bonus','Bono por rendimiento (tras 20 partidos)',{chips:[['Sin bono',0],['10 %',est*0.1],['25 %',est*0.25]]})}
        ${swapField(O)}${young?`<div class="field"><label>Destino</label><div class="seg"><button class="${O.dest!=='acad'?'on':''}" data-act="ofdest" data-v="first">Primer equipo</button><button class="${O.dest==='acad'?'on':''}" data-act="ofdest" data-v="acad">Cantera</button></div></div>`:''}</div>
        <div><div id="dsum">${dealSummary(pid)}</div><div id="analyst">${analystInner(pid)}</div>${patience(n,'del club')}${n.rival?`<div class="why bad">Rival interesado: ${esc(S.clubs[n.rival].name)}. Si tardas, puede adelantarse.</div>`:''}</div></div>`+res+chat+foot('negclub','Enviar oferta');
    }
  }else if(n.stage==='player'){
    const ask=wageAsk(p).w;
    body+=`<div class="verdict good"><div class="lbl">${n.pre?'Pre-contrato':'Club de acuerdo'}</div><div>${n.pre?'Llegaría gratis el 1 de julio.':free?'Es agente libre.':`${esc(clubLabel(p))} acepta ${EXACT((n.agreed||{}).fee||0)}${(n.agreed&&n.agreed.sellOn)?` con ${n.agreed.sellOn}% de venta futura`:''}.`} Ahora convence al jugador.</div></div>
      <div class="dgrid"><div>${moneyBox('wage','Salario semanal',{unit:'por semana',chips:[['Lo que pide ≈',ask],['−8 %',ask*0.92],['+10 %',ask*1.1]]})}
        <div class="money"><div class="row spread"><label>Duración del contrato</label></div><div class="seg">${[1,2,3,4,5].map(v=>`<button class="${O.years===v?'on':''}" data-act="dyears" data-v="${v}">${v} año${v===1?'':'s'}</button>`).join('')}</div></div>
        ${moneyBox('sign','Prima de fichaje (pago único)',{chips:[['Sin prima',0],['4 semanas',ask*4],['6 semanas',ask*6],['10 semanas',ask*10]]})}</div>
        <div><div id="wmeter">${wageMeter(O.wage)}</div><div id="dsum">${dealSummary(pid)}</div><div id="analyst">${analystInner(pid)}</div>${patience(n,'del agente')}</div></div>`+res+chat+foot('negplayer','Proponer contrato');
  }else body+=`<div class="verdict good"><div class="lbl">Trato cerrado</div></div><div class="dfoot"><button class="btn pri" data-act="mclose">Cerrar</button></div>`;
  return modalShell(title,body,'wide deal');
}
function mCounter(mid){
  const m=S.inbox.find(x=>x.id===mid),p=S.players[m.pid],O=UI.cnt,v=valueOf(p);
  return modalShell('Contraoferta por '+p.name,`${playerHead(p)}<div class="dbud"><div><span class="sub">${esc(S.clubs[m.cid].name)} ofrece</span><b>${EXACT(m.fee)}</b></div><div><span class="sub">Valor del jugador</span><b>${EXACT(v)}</b></div></div>
   ${moneyBox('cn','Tu precio',{chips:[['Su oferta +5 %',m.fee*1.05],['+10 %',m.fee*1.1],['+20 %',m.fee*1.2],['Su valor',v]]})}<p class="sub">Si pides demasiado, retirarán la oferta.</p>
   ${O.res?`<div class="verdict ${O.res.state==='withdrawn'?'bad':O.agreed?'good':'warn'}"><div>${esc(O.res.msg)}</div></div>`:''}
   <div class="dfoot"><button class="btn" data-act="mclose">Cerrar</button>${O.agreed?`<button class="btn pri" data-act="cnaccept">Cerrar el trato por ${EXACT(O.agreed)}</button>`:O.res&&O.res.state==='withdrawn'?'':`<button class="btn pri" id="cnbtn" data-act="cnsend">Contraofertar ${EXACT(O.fee)}</button>`}</div>`,'deal');
}
function mRenew(pid){
  const p=S.players[pid],O=UI.renewO,ask=renewAsk(p);
  return modalShell('Renovar a '+p.name,`${playerHead(p)}<div class="dbud"><div><span class="sub">Cobra hoy</span><b>${EXACT(p.w)}/sem</b></div><div><span class="sub">Contrato hasta</span><b>30 jun ${p.ce+1}</b></div></div>
   ${moneyBox('rn','Nuevo salario semanal',{unit:'por semana',chips:[['Lo que pide',ask],['Actual',p.w],['+10 %',ask*1.1]]})}
   <div class="money"><div class="row spread"><label>Años que se añaden</label></div><div class="seg">${[1,2,3,4,5].map(v=>`<button class="${O.years===v?'on':''}" data-act="ryears" data-v="${v}">+${v}</button>`).join('')}</div></div>
   <div class="why">${traitOf(p)==='Ambicioso'?'Es ambicioso: pide una mejora. ':''}Pide al menos <b>${EXACT(ask)}/sem</b>.</div><div id="rnmeter">${wageMeter(O.wage,p.w)}</div>
   <div id="ofres">${O.msg?`<div class="verdict bad"><div>${esc(O.msg)}</div></div>`:''}</div><div class="dfoot"><button class="btn" data-act="mclose">Cancelar</button><button class="btn pri" data-act="rnsend">Proponer renovación</button></div>`,'deal');
}
/* ---- eventos: el número escrito y la barra siempre muestran exactamente lo que se envía ---- */
function syncMoney(k,skip){
  const v=dealVal(k),i=document.getElementById('d_'+k),r=document.querySelector(`[data-range="${k}"]`);
  if(i&&i!==skip)i.value=EXACT(v);if(r&&r!==skip)r.value=v;dealRefresh();
}
document.addEventListener('input',e=>{
  const t=e.target;if(!t||!t.dataset||!S)return;
  if(t.dataset.money){const k=t.dataset.money,digits=t.value.replace(/\D/g,'');setDealVal(k,parseMoney(digits));t.value=digits?EXACT(dealVal(k)):'';syncMoney(k,t);}
  else if(t.dataset.range){const k=t.dataset.range,st=stepFor(+t.value);setDealVal(k,Math.round(+t.value/st)*st);syncMoney(k,t);}
});
document.addEventListener('focusout',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.money)t.value=EXACT(dealVal(t.dataset.money));});
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');if(!b||!S||!UI.m)return;const a=b.dataset.act,k=b.dataset.k;
  const stop=()=>{e.stopImmediatePropagation();e.preventDefault();};
  if(a==='mstep'){const v=dealVal(k),d=+b.dataset.d,st=stepFor(d<0?Math.max(0,v-1):v);setDealVal(k,(d>0?Math.floor(v/st):Math.ceil(v/st))*st+d*st);syncMoney(k);stop();}
  else if(a==='mpick'){const v=+b.dataset.v,st=stepFor(v),exact=/Todo mi|Su valor|Lo que pide|Actual|Estimado/.test(b.textContent);setDealVal(k,exact?v:Math.round(v/st)*st);syncMoney(k);stop();}
  else if(a==='dsell'){UI.offer.sellOn=+b.dataset.v;renderModal();stop();}
  else if(a==='dyears'){UI.offer.years=+b.dataset.v;renderModal();stop();}
  else if(a==='ryears'){UI.renewO.years=+b.dataset.v;renderModal();stop();}
},true);
