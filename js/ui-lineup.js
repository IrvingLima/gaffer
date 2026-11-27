"use strict";
/* ================= alineación pensada para el móvil: toca un hueco, consejos y sistema recomendado ================= */
const natChip=(pen)=>pen===0?'<span class="chip good">Su posición</span>':pen<=1.2?'<span class="chip info">Posición alternativa</span>':`<span class="chip warn">Fuera de posición −${pen.toFixed(1)}</span>`;
/* cada posición tiene su altura y su banda: el dibujo muestra la forma real del sistema y no se pisan los nombres */
const SP_Y={GK:135,CB:112,LB:105,RB:105,LWB:88,RWB:88,CDM:89,CM:67,LM:63,RM:63,CAM:45,LW:30,RW:30,CF:38,ST:14};
const SP_SIDE={LB:11,LWB:11,LM:11,LW:17,RB:89,RWB:89,RM:89,RW:83};
const GRP_COL={GK:'#c59bff',DEF:'#6aa5ff',MID:'#4fd08a',FWD:'#ff8f5c'};
function slotXY(xi){
  const central={};xi.forEach(x=>{if(SP_SIDE[x.spos]===undefined)(central[x.spos]=central[x.spos]||[]).push(x);});
  const out={};
  xi.forEach(x=>{
    let cx=SP_SIDE[x.spos];
    if(cx===undefined){const g=central[x.spos],i=g.indexOf(x),n=g.length;cx=n===1?50:n===2?[34,66][i]:n===3?[25,50,75][i]:12+i*76/(n-1);}
    out[x.idx]=[cx,SP_Y[x.spos]||70];
  });
  return out;
}
const shortName=(p,max)=>{const w=sname(p).split(' '),n=w.length>1&&/^(de|del|da|das|dos|di|le|la|van|von|el|al|der|den|mac|san)$/i.test(w[0])?w[0]+' '+w[1]:w[0];return n.length>max?n.slice(0,max-1)+'…':n;};
function pitchInteractive(c,L){
  const xy=slotXY(L.xi),ink=lum(c.c1)>0.4?'#111':'#fff';
  const nodes=L.xi.map(x=>{
    const [cx,cy]=xy[x.idx],out=x.pen>0,bad=x.pen>=4,col=out?(bad?'#e5484d':'#f2c200'):GRP_COL[x.slot],nm=shortName(x.p,10);
    const w=Math.max(12,Math.min(21,nm.length*1.85+3));
    return `<g class="slotnode" data-act="slot" data-i="${x.idx}" role="button" tabindex="0" aria-label="${SPN[x.spos]}: ${esc(x.p.name)}, nivel ${x.p.ovr}${out?', fuera de su posición':''}" transform="translate(${cx} ${cy})">
      <rect class="hit" x="-11" y="-10" width="22" height="24" rx="3"/>
      <circle r="5.4" fill="${c.c1}" stroke="${col}" stroke-width="1.3"/>
      <text y="1.7" text-anchor="middle" font-size="4.8" font-weight="800" style="fill:${ink}">${x.p.ovr}</text>
      <rect x="-5.6" y="-10.2" width="11.2" height="4.4" rx="1.4" fill="${col}"/>
      <text y="-6.9" text-anchor="middle" font-size="3.2" font-weight="800" style="fill:#0b0f0e">${SPL[x.spos]}${x.fixed?'★':''}</text>
      <rect class="nbg" x="${(-w/2).toFixed(1)}" y="6.4" width="${w.toFixed(1)}" height="5" rx="1.5"/>
      <text y="10" text-anchor="middle" font-size="3.25" class="nm">${esc(nm)}</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 100 148" class="pitch big" role="group" aria-label="Once titular: toca un jugador para cambiarlo"><rect x="1.5" y="1.5" width="97" height="145" rx="3" class="pl"/><path d="M1.5 74h97" class="pl"/><circle cx="50" cy="74" r="11" class="pl"/><rect x="27" y="1.5" width="46" height="17" class="pl"/><rect x="27" y="129.5" width="46" height="17" class="pl"/>${nodes}</svg>`;
}
/* la misma alineación en lista: se lee sin esfuerzo en el móvil */
function lineupList(L){
  const order=['GK','DEF','MID','FWD'],nm={GK:'Portería',DEF:'Defensa',MID:'Mediocampo',FWD:'Ataque'};
  return `<div class="xilist">${order.map(g=>{const rows=L.xi.filter(x=>x.slot===g).sort((a,b)=>(a.lat||0)-(b.lat||0));return rows.length?`<div class="lbl xig" style="color:${GRP_COL[g]}">${nm[g]}</div>`+rows.map(x=>`<button class="xirow" data-act="slot" data-i="${x.idx}"><span class="xipos" style="background:${x.pen>=4?'#e5484d':x.pen>0?'#f2c200':GRP_COL[g]}">${SPL[x.spos]}</span><span class="xinm"><b class="ellip">${esc(x.p.name)}${x.fixed?' ★':''}</b><span class="sub ellip">${x.pen>0?`Natural: ${SPL[x.p.sp]||POSL[x.p.pos]} · pierde ${x.pen.toFixed(1)}`:'En su posición'} · condición ${Math.round(x.p.fit)}%</span></span><span class="xiovr">${x.p.ovr}</span><span class="xichg">Cambiar</span></button>`).join(''):'';}).join('')}</div>`;
}
function lineupAdvice(c,L){
  const tips=[],xiIds=new Set(L.xi.map(x=>x.p.id));
  // jugadores fuera de su posición natural
  L.xi.filter(x=>x.pen>=1.5&&x.p.id>0).slice(0,2).forEach(x=>tips.push({ic:'warn',t:`${esc(x.p.name)} (${SPL[x.p.sp]||POSL[x.p.pos]}) juega de ${SPL[x.spos]}: pierde ${x.pen.toFixed(1)} puntos de nivel.`,s:'Prueba otro sistema (arriba) o elígelo para su sitio.'}));
  // jóvenes que crecen si juegan
  const weakest=L.xi.filter(x=>x.p.id>0).map(x=>x.e).sort((a,b)=>a-b)[1]||50;
  c.players.map(i=>S.players[i]).filter(p=>!xiIds.has(p.id)&&p.age<=21&&p.pot-p.ovr>=8&&!p.inj&&eff(p)>=weakest-5).slice(0,2).forEach(p=>tips.push({ic:'up',pid:p.id,t:`${esc(p.name)} (${p.age} años, ${p.ovr}→${p.pot}) crece más si juega y casi rinde como un titular.`,s:'Ponerlo de titular acelera su desarrollo.'}));
  // cansados
  L.xi.filter(x=>x.p.fit<60&&x.p.id>0).slice(0,2).forEach(x=>tips.push({ic:'warn',t:`${esc(x.p.name)} está al ${Math.round(x.p.fit)}% de condición.`,s:'Rótalo o usa el entrenamiento físico: rinde menos cansado.'}));
  const inj=c.players.map(i=>S.players[i]).filter(p=>p.inj).length;
  if(inj)tips.push({ic:'info',t:`Tienes ${inj} lesionado${inj>1?'s':''}: no entran en el once hasta recuperarse.`,s:''});
  if(!tips.length)tips.push({ic:'ok',t:'Tu once está bien montado: cada uno en su sitio y sin cansados.',s:''});
  return tips;
}
function lineupMainHTML(c,L){
  const rep=formationReport(c.id),best=rep[0],cur=rep.find(r=>r.fk===c.form)||rep[0],natNow=L.xi.filter(x=>x.pen===0).length;
  const show=best.fk!==c.form&&(best.score-cur.score>=0.15||best.nat>=cur.nat+2);
  const chip=fk=>{const r=rep.find(x=>x.fk===fk);return `<button class="formchip ${c.form===fk?'on':''}" data-act="form" data-v="${fk}" aria-pressed="${c.form===fk}"><b>${fk}</b><span>${r.nat}/11 ${r===best?'★':''}</span></button>`;};
  const chips=[3,4,5].map(n=>`<div class="fgroup"><div class="lbl">Defensa de ${n}</div><div class="formchips" role="group" aria-label="Sistemas con ${n} defensas">${Object.keys(FORMS).filter(f=>FORMS[f][0]===n).sort().map(chip).join('')}</div></div>`).join('');
  const tips=lineupAdvice(c,L);
  const bench=c.players.map(i=>S.players[i]).filter(p=>!L.xi.some(x=>x.p.id===p.id)).sort((a,b)=>b.ovr-a.ovr);
  return `<div class="panel lineup-top"><div class="hd"><h2>Tu once</h2><span class="chip ${natNow>=9?'good':natNow>=7?'info':'warn'}">${natNow}/11 en su posición</span></div>
   <details class="formfold" ${UI.formOpen?'open':''}><summary data-act="formfold">Sistema: <b>${c.form}</b> <span class="sub">· toca para ver los ${Object.keys(FORMS).length}</span></summary>${chips}</details>
   ${show?`<div class="reco"><div><b>Recomendado: ${best.fk}</b><div class="sub">${best.nat}/11 en su posición · fuerza ${best.score.toFixed(1)} (ahora ${cur.score.toFixed(1)})</div></div><button class="btn sm pri" data-act="form" data-v="${best.fk}">Usar</button></div>`:`<div class="sub" style="margin:6px 0">Tu sistema actual es de los mejores para esta plantilla (★ = el que mejor encaja).</div>`}
   ${pitchInteractive(c,L)}
   <div class="plegend"><span><i style="background:#c59bff"></i>Portería</span><span><i style="background:#6aa5ff"></i>Defensa</span><span><i style="background:#4fd08a"></i>Medio</span><span><i style="background:#ff8f5c"></i>Ataque</span><span><i style="background:#f2c200"></i>Algo fuera de posición</span><span><i style="background:#e5484d"></i>Muy fuera</span></div><p class="sub" style="margin:6px 0 0">Toca un jugador (en el campo o en la lista) para cambiarlo. <b>★</b> = lo fijaste tú.</p>${lineupList(L)}</div>
   <div class="panel"><div class="hd"><h2>Consejos del asistente</h2></div>${tips.map(t=>`<div class="tip ${t.ic}"><span class="ti">${t.ic==='up'?'▲':t.ic==='warn'?'!':t.ic==='ok'?'✓':'i'}</span><div><div>${t.t}</div>${t.s?`<div class="sub">${t.s}</div>`:''}</div>${t.pid?`<button class="btn xs pri" data-act="tostart" data-id="${t.pid}">Titular</button>`:''}</div>`).join('')}</div>
   <div class="panel"><div class="hd"><h2>Banquillo y reservas</h2><span class="sub">${bench.length} jugadores</span></div>
    <p class="sub" style="margin-top:0">Los que juegan crecen y mantienen su nivel. Toca <b>A titular</b> para meterlos en el once o la ficha para ver su evolución.</p>
    ${bench.map(p=>`<div class="benchrow"><div class="row nw" style="gap:8px;min-width:0;flex:1" data-act="player" data-id="${p.id}">${posTag(p.pos,p)}<div style="min-width:0"><b class="ellip">${esc(p.name)}</b><div class="sub">${p.age} años · cond. ${Math.round(p.fit)}%${p.inj?` · <span class="bad">lesión ${p.inj}s</span>`:''}${p.age<=21&&p.pot-p.ovr>=8?' · <span class="good">crece jugando</span>':''}${p.lock==='rest'?' · descanso':''}</div></div>${ovrChip(p)}</div>
     ${p.inj?'':`<button class="btn xs pri" data-act="tostart" data-id="${p.id}">A titular</button>`}</div>`).join('')}</div>
   <details class="mapfold"><summary class="sub">Sistema sin balón (avanzado)</summary><div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm ${!c.formOut?'on':''}" data-act="formout" data-v="">Igual</button>${Object.keys(FORMS).map(f=>`<button class="btn sm ${c.formOut===f?'on':''}" data-act="formout" data-v="${f}">${f}</button>`).join('')}</div><p class="sub">Más defensas sin balón suben tu defensa y bajan tu ataque.</p></details>`;
}
document.addEventListener('toggle',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('formfold'))UI.formOpen=e.target.open;},true);
/* línea a la que pertenece una posición concreta (un carrilero es defensa; un extremo, delantero) */
const lineOf=sp=>SPG[sp];
const LINE_NAME={GK:'porteros',DEF:'defensas',MID:'medios',FWD:'delanteros'};
function mSlotPick(i){
  const c=userClub(),L=lineup(c.id),fk=c.form,sp=FSLOTS[fk][i],cur=L.xi[i],grp=cur.slot;
  const all=c.players.map(i2=>S.players[i2]).filter(p=>!p.inj&&((grp==='GK')===(p.pos==='GK'))).map(p=>({p,pen:posPen(p,sp),s:eff(p)-posPen(p,sp)+psBonus(p,grp)})).sort((a,b)=>b.s-a.s);
  /* solo la línea del puesto: delanteros para la delantera, medios para el medio, defensas para la defensa */
  const line=lineOf(sp),cands=all.filter(x=>x.p.pos===line||x.p.id===cur.p.id),others=cands.filter(x=>x.p.id!==cur.p.id).length;
  return modalShell(`Elegir ${SPN[sp]}`,`<p class="sub" style="margin-top:0">Hueco <b>${SPL[sp]}</b> en el ${fk}. Ahora: <b>${esc(cur.p.name)}</b>. Entre paréntesis, su nivel real jugando ahí.</p><p class="sub">${others?`Solo aparecen tus ${LINE_NAME[line]}.`:`No tienes más ${LINE_NAME[line]} disponibles (revisa lesionados o ficha uno).`}</p>
   <div class="pickl">${cands.map(({p,pen,s})=>`<div class="pickrow ${p.id===cur.p.id?'cur':''}"><div class="row nw" style="gap:8px;min-width:0;flex:1">${posTag(p.pos,p)}<div style="min-width:0"><b class="ellip">${esc(p.name)}</b><div class="sub">${natChip(pen)} · cond. ${Math.round(p.fit)}%${p.age<=21&&p.pot-p.ovr>=8?' · <span class="good">crece jugando</span>':''}</div></div></div>${ovrChip(p)}<span class="sub" title="Nivel efectivo en este hueco">(${Math.round(s)})</span>
     <button class="btn xs ${p.id===cur.p.id?'':'pri'}" data-act="fixslot" data-i="${i}" data-id="${p.id}">${p.id===cur.p.id?'Fijar':'Poner'}</button></div>`).join('')}</div>
   <div class="row" style="justify-content:space-between;margin-top:12px"><button class="btn ghost" data-act="autoslot" data-i="${i}">Que decida el entrenador</button><button class="btn" data-act="mclose">Cerrar</button></div>`,'narrow');
}
function fixSlot(i,pid){
  const c=userClub(),fk=c.form;c.fix=c.fix||{};const f=(c.fix[fk]=c.fix[fk]||{});
  Object.keys(f).forEach(k=>{if(f[k]===pid)delete f[k];});f[i]=pid;
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');if(!b||!S||UI.menu)return;const a=b.dataset.act;
  if(a==='slot'){openModal({type:'slotpick',i:+b.dataset.i});e.stopImmediatePropagation();e.preventDefault();return;}
  if(a==='fixslot'){fixSlot(+b.dataset.i,+b.dataset.id);closeModal();save();render();toast('Jugador fijado en el once.');e.stopImmediatePropagation();e.preventDefault();return;}
  if(a==='autoslot'){const c=userClub();if(c.fix&&c.fix[c.form])delete c.fix[c.form][+b.dataset.i];closeModal();save();render();e.stopImmediatePropagation();e.preventDefault();return;}
  if(a==='tostart'){
    const c=userClub(),p=S.players[+b.dataset.id],L=lineup(c.id),grp=p.pos;
    let best=null,bl=1e9;
    L.xi.forEach(x=>{if(x.p.id<0)return;if((x.slot==='GK')!==(p.pos==='GK'))return;const pen=posPen(p,x.spos);if(pen>3.5)return;const loss=x.e-(eff(p)-pen);if(loss<bl){bl=loss;best=x;}});
    if(!best){toast('No hay un hueco razonable para él ahora mismo.');}
    else{fixSlot(best.idx,p.id);save();render();toast(`${p.name} entra de titular como ${SPL[best.spos]}.`);}
    e.stopImmediatePropagation();e.preventDefault();return;}
},true);
