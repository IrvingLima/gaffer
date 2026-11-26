"use strict";
/* ================= decisiones pendientes con más claridad + guía para cumplir los objetivos ================= */
const MSG_TYPES={offer:['Oferta','good'],jobOffer:['Trabajo','acc'],minutes:['Minutos','info'],interest:['Interés','info'],deadline:['Cierre de mercado','bad'],unhappy:['Vestuario','warn'],contract:['Contrato','warn'],sponsor:['Patrocinio','gold'],loanopt:['Cesión','info'],season:['Temporada',''],promise:['Promesa','warn'],challenge:['Reto del mes','gold'],preseason:['Pretemporada','info'],ntjob:['Selección','gold'],sponsorpick:['Patrocinador','gold']};
function msgHTML(m){
  const dec=!m.done&&m.ch,pend=!m.done&&DECISIONS.includes(m.ty),T=MSG_TYPES[m.ty]||['Aviso',''];
  const left=m.exp&&!m.done?m.exp-S.t:null,urg=left==null?'':left<=2?'bad':left<=5?'warn':'';
  let facts='';
  if(m.ty==='offer'&&m.pid!=null&&S.players[m.pid]&&m.fee!=null){
    const p=S.players[m.pid],v=valueOf(p),d=Math.round((m.fee/Math.max(1,v)-1)*100);
    facts=`<div class="facts">${posTag(p.pos,p)}<span class="chip">${p.age} años · nivel ${p.ovr}</span><span class="chip">Ofrecen ${EUR(m.fee)}${m.swap!=null&&S.players[m.swap]?' + '+esc(S.players[m.swap].name)+' ('+S.players[m.swap].ovr+')':''}</span><span class="chip ${d>=0?'good':'bad'}">${d>=0?'+':''}${d}% sobre su valor</span>${m.soft&&!m.done?'<span class="chip">Sin urgencia</span>':''}</div>`;
  }
  const acts=dec?`<div class="row dact">${m.ch.map((x,i)=>`<button class="btn sm ${i===0?'pri':i===m.ch.length-1?'ghost':''}" data-act="resp" data-id="${m.id}" data-v="${x.k}">${x.l}</button>`).join('')}${m.pid?`<button class="btn sm ghost" data-act="player" data-id="${m.pid}">Ver jugador</button>`:''}</div>`
    :(m.pid&&!m.done?`<div class="row dact"><button class="btn sm ghost" data-act="player" data-id="${m.pid}">Ver jugador</button></div>`:'');
  return `<div class="dcard ${pend?'pending':''} ${m.soft?'soft':''}"><div class="dhead"><span class="chip ${T[1]}">${T[0]}</span>${left!=null?`<span class="due ${urg}">${left<=0?'vence hoy':left===1?'vence mañana':'vence en '+left+' días'}</span>`:''}${m.expired?'<span class="due">expirada</span>':''}</div>
  <b class="dt">${esc(m.title)}</b><div class="sub db">${esc(m.body)}</div>${facts}${acts}</div>`;
}
/* qué hacer para cumplir cada objetivo, con atajos y datos reales del club */
function objGuide(kind){
  const c=userClub(),lg=leagueOf(c.id),L=lineup(c.id),r=ratings(c.id,L,true);
  const inj=c.players.map(i=>S.players[i]).filter(p=>p.inj).length;
  const lines=[['ataque',r.att],['medio',r.mid],['defensa',r.def]].sort((a,b)=>a[1]-b[1]),weak=lines[0];
  const top=lg.ids.map(id=>S.clubs[id]).sort((a,b)=>b.skill-a.skill).slice(0,4).map(x=>x.skill);
  const room=wageLimit(c)-wageBill(c),btn=(l,t)=>`<button class="btn xs" data-act="goto" data-v="${t}">${l}</button>`,li=a=>`<li>${a}</li>`;
  let steps;
  if(kind==='rank'){
    steps=[li(`Tu línea más floja es el <b>${weak[0]}</b> (${Math.round(weak[1])}). Refuérzala ${btn('en el Mercado','market:search')}`),
      li(`Tienes <b>${EUR(c.budget)}</b> y ${EUR(Math.max(0,room))}/sem de margen salarial: usa el atajo «Alcanzables ahora».`),
      li(`Revisa tu once y el sistema ${btn('Alineación','team:lineup')}. Atacar o presionar mucho pasa factura al final del partido.`),
      li(inj?`Tienes <b>${inj}</b> lesionado${inj>1?'s':''}: amplía el banquillo.`:'Plantilla sana: rota a los cansados para mantener la condición.'),
      li(`Los mejores de tu liga rondan ${Math.max(...top)} de nivel; tú tienes ${c.skill}.`)];
  }else if(kind==='youth'){
    const ready=S.ac.list.map(i=>S.players[i]).filter(p=>p.ovr>=45).length;
    steps=[li(`Tienes <b>${ready}</b> canteranos con nivel ≥ 45. Ábrelos en ${btn('Cantera','acad:squad')} y pulsa <b>Ascender</b>.`),
      li('Cuenta cuando juega 5+ partidos con el primer equipo: márcalo como «Titular» en su ficha o úsalo en copa y partidos fáciles.'),
      li('Los que aún no estén listos, cédelos con minutos pactados para que sigan creciendo.')];
  }else if(kind==='cup'){
    steps=[li('En las primeras rondas rota a los titulares («Descanso») y guarda fuerzas para la liga.'),
      li('En eliminatorias a doble vuelta, no te la juegues en la ida fuera.'),
      li(`Mira el cuadro completo en ${btn('Liga › Copas','league:cups')}.`)];
  }else{
    steps=[li(`Revisa ingresos y gastos en ${btn('Club › Finanzas','club:finance')}.`),
      li('Sube un poco el precio de las entradas si el estadio se llena.'),
      li(`Vende a quien no uses: ${btn('Mercado › Vender','market:sell')}.`),
      li('Cuidado con el límite salarial: los fichajes grandes se pagan cada semana.')];
  }
  return `<details class="guide"><summary>¿Cómo lograrlo?</summary><ul>${steps.join('')}</ul></details>`;
}

/* ================= historia permanente de la partida (carretera a la gloria) ================= */
function historyHTML(){
  const H=S.mgr.hist||[],done=H.filter(x=>!x.sacked),titles=done.filter(x=>x.champion).length,ups=done.filter(x=>x.mv==='up').length,downs=done.filter(x=>x.mv==='down').length;
  const best=done.length?Math.min(...done.map(x=>x.pos)):null,grads=(S.hist.grads||[]);
  const lab=x=>seasonLabel(x.Y,x.cal);
  let h=`<div class="grid g4 keep"><div class="stat"><div class="lbl">Temporadas</div><div class="num">${done.length}</div></div><div class="stat"><div class="lbl">Títulos</div><div class="num">${titles}</div></div><div class="stat"><div class="lbl">Ascensos</div><div class="num good">${ups}</div><div class="sub">${downs} descensos</div></div><div class="stat"><div class="lbl">Mejor puesto</div><div class="num">${best?best+'º':'—'}</div></div></div>`;
  h+=`<div class="panel"><div class="hd"><h2>Tu camino</h2><span class="sub">No se borra nunca</span></div><div class="scroll"><table><tr><th>Temp.</th><th>Club</th><th>Liga</th><th class="n">Pos.</th><th class="n">Pts</th><th>Campeón</th></tr>${H.slice().reverse().map(x=>`<tr><td>${lab(x)}</td><td>${esc(x.club)}</td><td>${esc(x.lg)}</td><td class="n">${x.sacked?'<span class="bad">Despedido</span>':x.pos+'º'+(x.champion?' <span class="chip gold">Campeón</span>':'')+(x.mv==='up'?' <span class="chip good">Asc.</span>':x.mv==='down'?' <span class="chip bad">Desc.</span>':'')}</td><td class="n">${x.pts!=null?x.pts:''}</td><td>${esc(x.champ||'')}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">Tu historia empieza aquí.</td></tr>'}</table></div></div>`;
  const withXI=done.filter(x=>x.xi&&x.xi.length).slice().reverse();
  h+=`<div class="panel"><div class="hd"><h2>Mejor once por temporada</h2><span class="sub">El once que más jugó</span></div>${withXI.length?withXI.map((x,i)=>`<details ${i===0?'open':''} class="xi"><summary>${lab(x)} · ${esc(x.club)} · ${x.pos}º</summary><div class="xigrid">${x.xi.map(p=>`<div class="kv nw"><span class="row nw" style="gap:8px"><span class="pos ${SPG[p.sp]||'MID'}">${SPL[p.sp]||''}</span><b>${esc(p.n)}</b></span><span>${p.ovr}${p.g?` · ${p.g}⚽`:''}</span></div>`).join('')}</div></details>`).join(''):'<div class="empty">Cuando termine tu primera temporada verás aquí tu mejor once.</div>'}</div>`;
  h+=`<div class="panel"><div class="hd"><h2>Canteranos graduados</h2><span class="sub">Y qué fue de ellos</span></div>${grads.length?`<div class="scroll"><table><tr><th>Temp.</th><th>Jugador</th><th class="n">Entonces</th><th>Ahora</th></tr>${grads.slice().reverse().slice(0,40).map(g=>{const p=S.players[g.id],cl=p&&p.club!=null?S.clubs[p.club]:null;const now=!p?'—':p.where==='retired'?'Retirado':p.club===S.user?'En tu club · '+p.ovr:cl?esc(cl.name)+' · '+p.ovr:p.where==='free'?'Agente libre · '+p.ovr:p.ovr;
    return `<tr class="${p?'click':''}" ${p?`data-act="player" data-id="${p.id}"`:''}><td>${seasonLabel(g.Y)}</td><td><b>${esc(g.n)}</b></td><td class="n">${g.ovr}/${g.pot}</td><td>${now}</td></tr>`;}).join('')}</table></div>`:'<div class="empty">Aún no ha subido ningún canterano.</div>'}</div>`;
  const ch=(S.hist.champs||[]).filter(x=>{const lg=S.leagues[x.lg];return lg&&userClub()&&lg.cc===userClub().cc&&lg.tier===1;}).slice().reverse();
  h+=`<div class="panel"><div class="hd"><h2>Campeones de ${userClub()?esc(LG_BY_CC[userClub().cc].nm):'tu liga'}</h2></div>${ch.map(x=>`<div class="kv"><span>${seasonLabel(x.Y,x.cal)}</span><b>${esc(x.club)}</b></div>`).join('')||'<div class="empty">Sin temporadas jugadas todavía.</div>'}</div>`;
  return h;
}

/* ================= Deadline Day ================= */
function mDeadline(){
  const dd=S.dd;if(!dd)return modalShell('Deadline Day','<div class="empty">No hay evento activo.</div>','narrow');
  const hour=dd.open?DD_HOURS[dd.step]:'Cierre',c=userClub();
  const offers=S.inbox.filter(m=>m.ty==='offer'&&!m.done&&m.exp>=S.t-0&&String(m.title).includes('última hora'));
  const steps=DD_HOURS.map((h,i)=>`<span class="ddh ${i<dd.step?'past':i===dd.step&&dd.open?'now':''}">${h}</span>`).join('');
  let body=`<div class="ddclock"><div class="lbl">Cuenta atrás del mercado · ${esc(LG_BY_CC[dd.cc].nm)}</div><div class="num big" style="font-size:54px;line-height:1">${hour}</div><div class="ddsteps">${steps}</div>
   <div class="sub">Presupuesto <b>${EUR(c.budget)}</b> · margen salarial <b>${EUR(Math.max(0,wageLimit(c)-wageBill(c)))}/sem</b> · plantilla ${c.players.length}/27</div></div>`;
  if(dd.open){
    body+=`<h3 style="margin-top:12px">Oportunidades de las ${hour}</h3>${dd.opps.length?dd.opps.map((o,i)=>{const p=S.players[o.pid],cl=S.clubs[p.club];
      return `<div class="dcard pending"><div class="dhead"><span class="chip gold">Última hora</span><span class="due bad">solo hasta las ${DD_HOURS[Math.min(DD_HOURS.length-1,dd.step+1)]}</span></div><b class="dt">${posTag(p.pos,p)} ${esc(p.name)} <span class="sub">${flag(p.nat,11)} ${p.age} años · nivel ${p.ovr}</span></b>
      <div class="sub">${esc(cl.name)} acepta ${EUR(o.fee)} (con prima por urgencia). Salario ${EUR(o.wage)}/sem · 3 años.</div><div class="row dact"><button class="btn sm pri" data-act="ddclose" data-v="${i}" ${o.closed?'disabled':''}>${o.closed?'Resuelto':'Cerrar fichaje'}</button><button class="btn sm ghost" data-act="player" data-id="${p.id}">Ver jugador</button></div></div>`;}).join(''):'<div class="empty">Sin oportunidades interesantes ahora mismo.</div>'}
    ${offers.length?`<h3 style="margin-top:12px">Ofertas por tus jugadores</h3><div class="dlist">${offers.map(msgHTML).join('')}</div>`:''}`;
  }
  const prep=S.prep?Object.keys(S.prep).map(k=>S.players[+k]).filter(Boolean):[];
  if(prep.length&&dd.open)body+=`<h3 style="margin-top:12px">Operaciones preparadas</h3>${prep.map(p=>`<div class="kv"><span>${esc(p.name)} (${p.ovr}) · ${EUR(S.prep[p.id].fee)}</span><button class="btn xs" data-act="prepdd" data-id="${p.id}">Retirar</button></div>`).join('')}<p class="sub">Se intentan cerrar a lo largo del día; pueden caerse si el club se echa atrás o ya no llegas al presupuesto o al límite salarial.</p>`;
  body+=`<h3 style="margin-top:12px">En directo</h3><div class="feed" style="max-height:170px">${dd.log.slice().reverse().map(x=>`<div class="ev"><span>${esc(x)}</span></div>`).join('')||'<div class="empty">Aún no ha pasado nada.</div>'}</div>`;
  if(!dd.open){
    body+=`<div class="panel" style="margin-top:12px"><div class="hd"><h2>Resumen del día</h2></div><div class="kv"><span>Altas</span><b>${dd.signed.length}</b></div>${dd.signed.map(x=>`<div class="sub">· ${esc(x)}</div>`).join('')}<div class="kv"><span>Operaciones caídas</span><b>${dd.failed.length}</b></div>${dd.failed.map(x=>`<div class="sub">· ${esc(x)}</div>`).join('')}<p class="sub" style="margin-bottom:0">Bajas: acepta ofertas desde el buzón; las que dejaste pendientes caducan con el cierre.</p></div>`;
  }
  body+=`<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" data-act="mclose">${dd.open?'Salir (sigue abierto)':'Cerrar'}</button>${dd.open?`<button class="btn pri" data-act="ddnext">${dd.step>=DD_HOURS.length-1?'Cerrar el mercado':'Pasar a las '+DD_HOURS[dd.step+1]} ${ic('arrow','sm')}</button>`:''}</div>`;
  return modalShell('Deadline Day',body,'wide');
}

function trainReportHTML(){
  const r=(S.trainRep||[])[0];if(!r)return '';
  return `<div class="panel"><div class="hd"><h2>Informe de entrenamiento</h2><span class="sub">semana del ${fmtD(r.t)}</span></div>
   ${r.ups.length?r.ups.slice(0,6).map(x=>`<div class="kv nw" data-act="player" data-id="${x.pid}" style="cursor:pointer"><span>${esc(x.txt)}</span><span class="dl up">▲</span></div>`).join(''):'<div class="sub">Esta semana nadie mejora: sigue entrenando y dando minutos.</div>'}
   ${r.idle.length?`<div class="lbl" style="margin-top:8px">Sin minutos</div>${r.idle.map(x=>`<div class="why warn">${esc(x.txt)}</div>`).join('')}`:''}</div>`;
}

function youthMatchPanel(){
  const q=S.yp;if(!q)return '';
  const h=S.clubs[q.h],a=S.clubs[q.a],mine=q.h===S.user,opp=mine?a:h,ours=youthStrength(S.clubs[S.user]),theirs=youthStrength(opp);
  return `<div class="panel"><div class="hd"><h2>Partido juvenil de la semana</h2><span class="chip ${ours>=theirs?'good':'warn'}">${ours>=theirs?'Favoritos':'Rival superior'}</span></div>
   <div class="row spread"><div class="row nw" style="gap:8px">${crest(h,26)}<b>${esc(h.name)}</b></div><span class="sub">vs</span><div class="row nw" style="gap:8px"><b>${esc(a.name)}</b>${crest(a,26)}</div></div>
   <p class="sub" style="margin:8px 0">Tu cantera: nivel ${Math.round(ours)} · rival ${Math.round(theirs)}. Si no lo juegas, se simula solo al empezar la semana siguiente. Los titulares suman minutos y los goleadores quedan registrados.</p>
   <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn pri" data-act="youthplay">Jugar el partido</button><button class="btn" data-act="youthsim">Simular</button></div></div>`;
}

function ntPanel(){
  const N=S.nt;if(!N)return '';
  const nm=NAT[N.cc].nm,fx=N.fix||[];
  return `<div class="panel"><div class="hd"><h2>Selección de ${esc(nm)}</h2><span class="chip gold">${N.w}G ${N.d}E ${N.l}P</span></div>
   ${fx.length?fx.map((f,i)=>`<div class="dcard pending"><div class="dhead"><span class="chip info">${f.label}</span><span class="due">${fmtD(f.t)}</span></div><b class="dt">${flag(N.cc,12)} ${esc(nm)} vs ${flag(f.opp,12)} ${esc(NAT[f.opp].nm)}</b><div class="row dact"><button class="btn sm pri" data-act="ntplay" data-v="${i}">Jugar</button><button class="btn sm" data-act="ntsim" data-v="${i}">Simular</button></div></div>`).join(''):`<div class="sub">Sin partidos pendientes. Los próximos llegan con el siguiente parón de selecciones.</div>`}
   ${N.hist.length?`<div class="lbl" style="margin-top:10px">Últimos resultados</div>${N.hist.slice(0,4).map(h=>`<div class="kv"><span>${fmtD(h.t)} · ${esc(NAT[h.opp].nm)} (${h.label})</span><b class="${h.my>h.op?'good':h.my<h.op?'bad':''}">${h.my}-${h.op}</b></div>`).join('')}`:''}
   <div class="row" style="margin-top:10px"><button class="btn xs ghost" data-act="ntquit">Dejar la selección</button></div></div>`;
}
