"use strict";
/* ================= negociación (UI) y copas (UI) ================= */
const bub=(l)=>`<div class="bub w-${l.who}"><span class="who">${l.who==='you'?'Tú':l.who==='agent'?'Agente':'Club'}</span>${esc(l.txt)}</div>`;
const dots=(n,max)=>'●'.repeat(Math.max(0,n))+'○'.repeat(Math.max(0,max-n));
function openOffer(pid){
  const p=S.players[pid],free=p.where==='free',est=approxValue(p),wEst=Math.max(300,Math.round(wageOf({...p,ovr:midOvr(p),pot:Math.max(midOvr(p),midPot(p))})*1.05/100)*100);
  S.neg=S.neg||{};
  UI.offer={fee:free?0:Math.max(50000,Math.round(est*0.95/1e4)*1e4),wage:wEst,years:3,sellOn:0,bonus:0,sign:0,dest:'first',mode:'buy',lfee:Math.max(10000,Math.round(est*0.08/1e4)*1e4),opt:Math.round(est*1.1/1e5)*1e5,res:null};
  const n=negGet(pid);
  if(free&&n.stage==='club'&&!n.dead){const r=negClub(pid,{fee:0,sellOn:0,bonus:0},'first');UI.offer.res=r;}
  if(n.stage==='player')UI.offer.wage=Math.max(UI.offer.wage,wageAsk(p).w);
  openModal({type:'offer',pid});
}
/* medidor del límite salarial: se actualiza al mover el deslizador */
function wageMeter(wage,replace){
  const c=userClub(),lim=wageLimit(c),bill=wageBill(c)-(replace||0)+wage,pct=bill/lim,left=lim-bill;
  const cls=pct>1?'bad':pct>0.92?'warn':'good',w=Math.min(100,Math.round(pct*100));
  return `<div class="wmeter ${cls}"><div class="row spread" style="margin-bottom:4px"><span class="sub">Masa salarial tras el contrato</span><b>${EUR(bill)} / ${EUR(lim)}</b></div><div class="wbar"><i style="width:${w}%"></i><span style="left:${Math.min(100,Math.round(100/Math.max(1.0001,pct>1?pct:1)))}%"></span></div><div class="sub" style="margin-top:4px">${left>=0?`Te quedan <b>${EUR(left)}/sem</b> de margen.`:`Te pasas <b>${EUR(-left)}/sem</b> del límite: la directiva no lo aprobará.`}</div></div>`;
}
/* analista: califica el acuerdo de A a F y explica el riesgo en una línea (su criterio es una propuesta a validar) */
function dealGrade(p,O){
  const ab=staffAbSafe('anal'),noise=(p.id%7-3)*(Math.max(0,8-ab)*0.004);
  const v=approxValue(p)*(1+noise),free=p.where==='free';
  const eff=free?0:O.fee+clauseValue(p,{sellOn:O.sellOn,bonus:O.bonus});
  const wExp=Math.max(300,wageOf({...p,ovr:midOvr(p),pot:Math.max(midOvr(p),midPot(p))}));
  const pd=free?0.1:(v-eff)/Math.max(1,v),wd=(wExp*1.1-(O.wage||wExp))/wExp;
  let sc=55+38*Math.max(-1,Math.min(1,pd))+22*Math.max(-1,Math.min(1,wd));
  const risks=[];
  if(p.age>=31&&(O.years||3)>=3){sc-=9;risks.push(`contrato largo para un jugador de ${p.age} años`);}
  if(p.age<=22&&midPot(p)-midOvr(p)>=8){sc+=7;risks.push('puede revalorizarse mucho');}
  const wi=wageLimit(userClub())-wageBill(userClub())-(O.wage||wExp);
  if(wi<0){sc-=12;risks.push('el salario rompe el límite salarial');}
  if(!free&&pd<-0.08)risks.push('pagas por encima de su valor');
  if(pd>0.12)risks.push('buen precio de entrada');
  if(wd<-0.2)risks.push('salario alto para su nivel');
  const sq=userClub().players.map(i=>S.players[i]).filter(x=>x.pos===p.pos).sort((a,b)=>b.ovr-a.ovr);
  if(sq.length&&midOvr(p)<=sq[Math.min(sq.length-1,1)].ovr-3){sc-=6;risks.push('no mejoraría tu once en esa posición');}
  const g=sc>=72?'A':sc>=60?'B':sc>=48?'C':sc>=36?'D':sc>=24?'E':'F';
  return {g,sc:Math.round(sc),txt:risks.length?risks.slice(0,2).join(' · '):'Operación sin riesgos destacables.'};
}
function analystInner(pid){
  const p=S.players[pid],O=UI.offer;if(!p||!O)return '';
  const d=dealGrade(p,O),col=d.g<='B'?'good':d.g==='C'?'':'bad';
  return `<div class="analyst"><span class="grade ${col}">${d.g}</span><div><b>Analista</b><div class="sub">${esc(d.txt)}</div></div></div>`;
}
function updAnalyst(){const b=document.getElementById('analyst');if(b&&UI.m&&UI.m.type==='offer')b.innerHTML=analystInner(UI.m.pid);}
function mOffer(pid){
  const p=S.players[pid],c=userClub(),n=negGet(pid),O=UI.offer,free=p.where==='free',est=approxValue(p);
  const wEst=Math.max(300,Math.round(wageOf({...p,ovr:midOvr(p),pot:Math.max(midOvr(p),midPot(p))})/100)*100);
  const feeMax=Math.max(Math.round(est*2.2/1e5)*1e5,500000),young=p.age<=18&&acadFree()>0&&n.stage==='club';
  let body=`<div class="row" style="gap:8px;margin-bottom:6px">${posTag(p.pos,p)}<span class="chip">${p.age} años</span><span class="chip">${flag(p.nat,12)} ${NAT[p.nat].nm}</span><span class="chip">Nivel ${showOvr(p)}</span><span class="chip gold">Pot. ${showPot(p)}</span>${confChip(p)}</div>
  <p class="sub">${free?'Agente libre: solo pagas el salario.':`Club actual: ${esc(clubLabel(p))}. Valor aproximado ${EUR(est)}.`} Presupuesto ${EUR(c.budget)} · límite salarial ${EUR(wageLimit(c))} (masa ${EUR(wageBill(c))}).</p>`;
  if(n.log.length)body+=`<div class="chat" id="chat">${n.log.slice(-7).map(bub).join('')}</div>`;
  if(n.dead){body+=`<div class="msg bad"><b>Negociación rota</b><div class="sub">Podrás volver a intentarlo el ${fmtD(n.cool)}.</div></div><div class="row" style="justify-content:flex-end"><button class="btn" data-act="mclose">Cerrar</button></div>`;return modalShell((free?'Contrato: ':'Negociación: ')+p.name,body,'narrow');}
  if(n.stage==='club'){
    if(!free&&UI.offer.mode!=='loan'||free)body+='';
    if(!free)body+=`<div class="seg" style="margin:6px 0"><button class="${O.mode!=='loan'?'on':''}" data-act="nmode" data-v="buy">Traspaso</button><button class="${O.mode==='loan'?'on':''}" data-act="nmode" data-v="loan">Cesión con opción</button></div>`;
    if(O.mode==='loan'&&!free){
      body+=`${slider('of_lfee','Coste de la cesión',10000,Math.max(500000,Math.round(est*0.3/1e4)*1e4),10000,O.lfee,EUR)}${slider('of_opt','Opción de compra (0 = sin opción)',0,Math.round(est*2/1e5)*1e5,100000,O.opt,v=>v?EUR(v):'Sin opción')}
      <p class="sub">El jugador viene hasta fin de temporada y cobra su salario completo. Si hay opción, decides en abril.</p>`;
      body+=`<div id="ofres">${O.res?resBox(O.res):''}</div><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" data-act="mclose">Cancelar</button><button class="btn pri" data-act="loanin">Pedir cesión</button></div>`;
    }else{
      body+=`${slider('of_fee','Traspaso',0,feeMax,Math.max(50000,Math.round(feeMax/200/1e4)*1e4),O.fee,EUR)}${slider('of_sell','% de futura venta para el vendedor',0,30,5,O.sellOn,v=>v+'%')}${slider('of_bonus','Bono por rendimiento (tras 20 partidos)',0,Math.round(est*0.5/1e5)*1e5,50000,O.bonus,v=>v?EUR(v):'Sin bono')}
      ${young?`<div class="field"><label>Destino</label><div class="seg"><button class="${O.dest!=='acad'?'on':''}" data-act="ofdest" data-v="first">Primer equipo</button><button class="${O.dest==='acad'?'on':''}" data-act="ofdest" data-v="acad">Cantera</button></div></div>`:''}
      <div id="analyst">${analystInner(pid)}</div><div class="sub">Paciencia del club: <b>${dots(n.patience,3)}</b>${n.rival?` · <span class="warn">Rival interesado: ${esc(S.clubs[n.rival].name)}</span>`:''}</div>
      <div id="ofres">${O.res?resBox(O.res):''}</div><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" data-act="mclose">Retirarse</button><button class="btn pri" data-act="negclub">Hacer oferta</button></div>`;
    }
  }else if(n.stage==='player'){
    body+=`<div class="msg pending"><b>${n.pre?'Pre-contrato · el agente del jugador':'Fase 2 · el agente del jugador'}</b><div class="sub">${n.pre?'Pre-contrato: llegaría gratis el 1 de julio. ':free?'':`${esc(clubLabel(p))} acepta ${EUR((n.agreed||{}).fee||0)}${(n.agreed&&n.agreed.sellOn)?` con ${n.agreed.sellOn}% de venta futura`:''}. `}Ahora hay que convencer al jugador.</div></div>
    ${slider('of_wage','Salario semanal',Math.round(wEst*0.5/100)*100,Math.round(wEst*2.4/100)*100,100,O.wage,v=>EUR(v)+'/sem')}${slider('of_years','Duración (años)',1,5,1,O.years,v=>v+(v===1?' año':' años'))}${slider('of_sign','Prima de fichaje (pago único)',0,Math.round(wEst*30/1000)*1000,1000,O.sign,v=>v?EUR(v):'Sin prima')}
    <div id="wmeter">${wageMeter(O.wage)}</div><div id="analyst">${analystInner(pid)}</div><div class="sub">Paciencia del agente: <b>${dots(n.patience,3)}</b></div><div id="ofres">${O.res?resBox(O.res):''}</div>
    <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" data-act="mclose">Retirarse</button><button class="btn pri" data-act="negplayer">Proponer contrato</button></div>`;
  }else body+=`<div class="msg pending"><b>Trato cerrado</b></div><div class="row" style="justify-content:flex-end"><button class="btn pri" data-act="mclose">Cerrar</button></div>`;
  return modalShell((free?'Contrato: ':'Negociación: ')+p.name,body,'narrow');
}
function resBox(r){
  const good=r.state==='accept'||r.state==='signed',bad=r.state==='dead'||r.state==='lost'||r.state==='closed';
  return `<div class="msg ${good?'pending':''}"><div class="${good?'good':bad?'bad':''}">${esc(r.msg)}</div>${(r.counters||[]).length?`<div class="row" style="margin-top:8px">${r.counters.map((c,i)=>`<button class="btn sm pri" data-act="negcounter" data-v="${i}">Aceptar: ${esc(c.l)}</button>`).join('')}</div>`:''}</div>`;
}
function mCounter(mid){
  const m=S.inbox.find(x=>x.id===mid),p=S.players[m.pid],O=UI.cnt;
  return modalShell('Contraoferta por '+p.name,`<p class="sub">${esc(S.clubs[m.cid].name)} ofrece ${EUR(m.fee)}. Valor aproximado de ${esc(p.name)}: ${EUR(valueOf(p))}. Si pides demasiado, retirarán la oferta.</p>
   ${slider('cn_fee','Tu precio',Math.round(m.fee*0.9/1e4)*1e4,Math.round(valueOf(p)*2.4/1e5)*1e5,50000,O.fee,EUR)}
   ${O.res?`<div class="msg ${O.agreed?'pending':''}"><div class="${O.res.state==='withdrawn'?'bad':O.agreed?'good':''}">${esc(O.res.msg)}</div></div>`:''}
   <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" data-act="mclose">Cerrar</button>${O.agreed?`<button class="btn pri" data-act="cnaccept">Cerrar el trato por ${EUR(O.agreed)}</button>`:O.res&&O.res.state==='withdrawn'?'':`<button class="btn pri" data-act="cnsend">Contraofertar</button>`}</div>`,'narrow');
}
/* ----- copas en la pestaña Liga ----- */
function tournSelect(){
  const c=userClub(),all=Object.values(S.tn||{});
  const sel=UI.f.tn&&S.tn[UI.f.tn]?UI.f.tn:(c?'cup:'+c.cc:Object.keys(S.tn)[0]);
  return {sel,all,T:S.tn[sel]};
}
function vCups(){
  const {sel,all,T}=tournSelect();
  let h=`<select id="tnsel" aria-label="Competición" style="margin-bottom:10px">${all.map(t=>`<option value="${t.id}" ${t.id===sel?'selected':''}>${esc(t.nm)}</option>`).join('')}</select>`;
  if(!T)return h+'<div class="empty">Esta competición empieza el próximo año.</div>';
  const u=S.user;
  h+=`<div class="panel"><div class="hd"><h2>${esc(T.nm)} ${seasonLabel(T.Y,T.kind==='cup'&&calOf(T.cc))}</h2><span class="sub">${T.champion!=null?'Campeón: '+esc(S.clubs[T.champion].name):T.kind==='cup'?T.n+' clubes':T.n+' clubes · fase de grupos y eliminatorias'}</span></div>`;
  if(T.kind==='cont'&&T.stage==='group'){
    h+=`<div class="grid g2" style="align-items:start">${T.groups.map((G,gi)=>`<div><div class="lbl" style="margin-bottom:6px">Grupo ${'ABCDEFGH'[gi]}</div><table><tr><th>Club</th><th class="n">PJ</th><th class="n">DG</th><th class="n">Pts</th></tr>${G.ids.slice().sort((a,b)=>G.tab[b].pts-G.tab[a].pts||(G.tab[b].gf-G.tab[b].ga)-(G.tab[a].gf-G.tab[a].ga)).map(id=>`<tr class="${id===u?'me':''}"><td>${clubTag(id,18)}</td><td class="n">${G.tab[id].p}</td><td class="n">${G.tab[id].gf-G.tab[id].ga}</td><td class="n"><b>${G.tab[id].pts}</b></td></tr>`).join('')}</table></div>`).join('')}</div>`;
  }
  const rounds=T.rounds.filter(r=>r.ties);
  if(rounds.length){
    h+=rounds.slice().reverse().map(rd=>`<h3 style="margin-top:14px">${esc(rd.nm)} <span class="mute">· ${rd.dates.map(d=>fmtD(d)).join(' / ')}</span></h3>${rd.ties.filter(t=>!t.bye).slice(0,rd.ties.length>40?40:99).map(t=>{
      const sc=t.legs.filter(Boolean).map(L=>`${L.hg}-${L.ag}`).join(' · ');
      return `<div class="kv ${t.a===u||t.b===u?'me2':''}"><span class="row nw" style="gap:6px;min-width:0">${clubTag(t.a,18)} <span class="mute">vs</span> ${t.b!=null?clubTag(t.b,18):''}</span><span class="${t.w!=null?'':'mute'}">${sc||'—'}${t.pen?` (pen. ${t.pen.h}-${t.pen.a})`:''}${t.w!=null?` ▸ ${esc(S.clubs[t.w].short)}`:''}</span></div>`;}).join('')}${rd.ties.filter(t=>t.bye).length?`<div class="sub">${rd.ties.filter(t=>t.bye).length} clubes exentos${rd.ties.some(t=>t.bye&&t.a===u)?' (incluido el tuyo)':''}.</div>`:''}`).join('');
  }else h+='<div class="empty">El cuadro se sortea al terminar la fase de grupos.</div>';
  return h+'</div>';
}
/* ----- eventos de la nueva capa ----- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]');if(!t||!S)return;
  const a=t.dataset.act,v=t.dataset.v,id=+t.dataset.id;
  if(a==='offer'){openOffer(id);return;}
  if(a==='pre'){const p=S.players[id];negPre(id);UI.offer={fee:0,wage:Math.max(estWage(p),wageAsk(p).w),years:3,sellOn:0,bonus:0,sign:Math.ceil(wageAsk(p).w*4/1000)*1000,dest:'first',mode:'buy',lfee:0,opt:0,res:null};openModal({type:'offer',pid:id});return;}
  if(a==='ofdest'){UI.offer.dest=v;renderModal();return;}
  if(a==='nmode'){UI.offer.mode=v;UI.offer.res=null;renderModal();return;}
  if(a==='negclub'){const pid=UI.m.pid,O=UI.offer,r=negClub(pid,{fee:O.fee,sellOn:O.sellOn,bonus:O.bonus},O.dest);O.res=r;
    if(r.state==='accept'){const p=S.players[pid];O.wage=Math.max(O.wage,wageAsk(p).w);O.res=null;}
    if(r.state==='lost'){save();render();}renderModal();const ch=$('#chat');if(ch)ch.scrollTop=ch.scrollHeight;return;}
  if(a==='negcounter'){const pid=UI.m.pid,O=UI.offer,n=negGet(pid),c=(O.res.counters||[])[+v];if(!c)return;
    if(n.stage==='club'){O.fee=c.fee;O.sellOn=c.sellOn||0;O.bonus=c.bonus||0;const r=negClub(pid,{fee:O.fee,sellOn:O.sellOn,bonus:O.bonus},O.dest);O.res=r;if(r.state==='accept'){O.wage=Math.max(O.wage,wageAsk(S.players[pid]).w);O.res=null;}}
    else{O.wage=c.wage;O.sign=c.sign||0;const r=negPlayer(pid,{wage:O.wage,years:O.years,sign:O.sign});O.res=r;if(r.state==='signed'){const nm=S.players[pid].name;save();UI.m=null;$('#modalRoot').innerHTML='';render();toast(`${nm} firma con tu club.`);return;}}
    renderModal();return;}
  if(a==='negplayer'){const pid=UI.m.pid,O=UI.offer,r=negPlayer(pid,{wage:O.wage,years:O.years,sign:O.sign});O.res=r;
    if(r.state==='signed'){const nm=S.players[pid].name;save();UI.m=null;$('#modalRoot').innerHTML='';render();toast(`${nm} firma con tu club.`);return;}renderModal();return;}
  if(a==='loanin'){const pid=UI.m.pid,O=UI.offer,r=loanInEval(pid,{fee:O.lfee,opt:O.opt});
    if(r.ok){const p=S.players[pid];loanInDo(pid,{fee:O.lfee,opt:O.opt});save();UI.m=null;$('#modalRoot').innerHTML='';render();toast(`${p.name} llega cedido.`);return;}
    O.res={state:'reject',msg:r.msg,counters:[]};renderModal();return;}
  if(a==='cnsend'){const r=counterIncoming(UI.m.mid,UI.cnt.fee);UI.cnt.res=r;UI.cnt.agreed=(r.state==='accept'||r.state==='counter')?r.fee:null;renderModal();return;}
  if(a==='cnaccept'){const err=acceptIncoming(UI.m.mid,UI.cnt.agreed);if(err)toast(err);else{toast('Venta cerrada.');}save();closeModal();return;}
  if(a==='tnnone')return;
});
document.addEventListener('input',e=>{
  const t=e.target,id=t.id;if(!id||!S)return;
  const fm={of_lfee:['lfee',EUR],of_opt:['opt',v=>v?EUR(v):'Sin opción'],of_bonus:['bonus',v=>v?EUR(v):'Sin bono'],of_sign:['sign',v=>v?EUR(v):'Sin prima'],cn_fee:null};
  if(fm[id]){const v=+t.value;UI.offer[fm[id][0]]=v;$('#'+id+'v').textContent=fm[id][1](v);updAnalyst();return;}
  if(id==='cn_fee'){const v=+t.value;UI.cnt.fee=v;$('#cn_feev').textContent=EUR(v);}
});
document.addEventListener('change',e=>{if(e.target.id==='tnsel'){UI.f.tn=e.target.value;render();}});
