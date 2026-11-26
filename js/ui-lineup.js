"use strict";
/* ================= alineación pensada para el móvil: toca un hueco, consejos y sistema recomendado ================= */
const natChip=(pen)=>pen===0?'<span class="chip good">Su posición</span>':pen<=1.2?'<span class="chip info">Posición alternativa</span>':`<span class="chip warn">Fuera de posición −${pen.toFixed(1)}</span>`;
function pitchInteractive(c,L){
  const rows=[['GK',130],['DEF',100],['MID',69],['FWD',36]];let dots='';
  rows.forEach(([pos,y])=>{
    const xs=L.xi.filter(x=>x.slot===pos).sort((a,b)=>(a.lat||0)-(b.lat||0));
    xs.forEach((x,i)=>{
      const cx=(i+1)*100/(xs.length+1),nm=sname(x.p),lab=nm.length>9?nm.slice(0,8)+'.':nm,out=x.pen>0,bad=x.pen>=4;
      const ring=bad?'#d4161d':out?'#e2b80f':c.c2,rad=xs.length>=5?7:8;
      dots+=`<g class="slotnode" data-act="slot" data-i="${x.idx}" role="button" tabindex="0" aria-label="${SPL[x.spos]}: ${esc(x.p.name)}, nivel ${x.p.ovr}" transform="translate(${cx.toFixed(1)} ${y})">
        <circle r="${rad+4}" class="hit"/><circle r="${rad}" fill="${c.c1}" stroke="${ring}" stroke-width="${out?2.2:1.4}"/>
        <text y="2.6" text-anchor="middle" font-size="7.4" font-weight="800" style="fill:${lum(c.c1)>0.4?'#111':'#fff'}">${x.p.ovr}</text>
        <text y="${rad+8.5}" text-anchor="middle" font-size="4.7" class="nm">${esc(lab)}</text>
        <text y="${-rad-3}" text-anchor="middle" font-size="4.1" class="ps${out?' off':''}">${SPL[x.spos]}${x.fixed?' ★':''}</text></g>`;
    });
  });
  return `<svg viewBox="0 0 100 148" class="pitch big" role="group" aria-label="Once titular: toca un hueco para cambiar al jugador"><rect x="3" y="3" width="94" height="142" rx="3" class="pl"/><path d="M3 74h94" class="pl"/><circle cx="50" cy="74" r="11" class="pl"/><rect x="26" y="3" width="48" height="19" class="pl"/><rect x="26" y="126" width="48" height="19" class="pl"/>${dots}</svg>`;
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
  const chips=Object.keys(FORMS).map(fk=>{const r=rep.find(x=>x.fk===fk);return `<button class="formchip ${c.form===fk?'on':''}" data-act="form" data-v="${fk}" aria-pressed="${c.form===fk}"><b>${fk}</b><span>${r.nat}/11 ${r===best?'★':''}</span></button>`;}).join('');
  const tips=lineupAdvice(c,L);
  const bench=c.players.map(i=>S.players[i]).filter(p=>!L.xi.some(x=>x.p.id===p.id)).sort((a,b)=>b.ovr-a.ovr);
  return `<div class="panel lineup-top"><div class="hd"><h2>Tu once</h2><span class="chip ${natNow>=9?'good':natNow>=7?'info':'warn'}">${natNow}/11 en su posición</span></div>
   <div class="formchips" role="group" aria-label="Sistema de juego">${chips}</div>
   ${show?`<div class="reco"><div><b>Recomendado: ${best.fk}</b><div class="sub">${best.nat}/11 en su posición · fuerza ${best.score.toFixed(1)} (ahora ${cur.score.toFixed(1)})</div></div><button class="btn sm pri" data-act="form" data-v="${best.fk}">Usar</button></div>`:`<div class="sub" style="margin:6px 0">Tu sistema actual es de los mejores para esta plantilla (★ = el que mejor encaja).</div>`}
   ${pitchInteractive(c,L)}
   <p class="sub" style="margin:8px 0 0">Toca un hueco para elegir quién juega ahí. <b>★</b> = lo fijaste tú. Aro <span class="warn">ámbar</span> = fuera de su posición natural.</p></div>
   <div class="panel"><div class="hd"><h2>Consejos del asistente</h2></div>${tips.map(t=>`<div class="tip ${t.ic}"><span class="ti">${t.ic==='up'?'▲':t.ic==='warn'?'!':t.ic==='ok'?'✓':'i'}</span><div><div>${t.t}</div>${t.s?`<div class="sub">${t.s}</div>`:''}</div>${t.pid?`<button class="btn xs pri" data-act="tostart" data-id="${t.pid}">Titular</button>`:''}</div>`).join('')}</div>
   <div class="panel"><div class="hd"><h2>Banquillo y reservas</h2><span class="sub">${bench.length} jugadores</span></div>
    <p class="sub" style="margin-top:0">Los que juegan crecen y mantienen su nivel. Toca <b>A titular</b> para meterlos en el once o la ficha para ver su evolución.</p>
    ${bench.map(p=>`<div class="benchrow"><div class="row nw" style="gap:8px;min-width:0;flex:1" data-act="player" data-id="${p.id}">${posTag(p.pos,p)}<div style="min-width:0"><b class="ellip">${esc(p.name)}</b><div class="sub">${p.age} años · cond. ${Math.round(p.fit)}%${p.inj?` · <span class="bad">lesión ${p.inj}s</span>`:''}${p.age<=21&&p.pot-p.ovr>=8?' · <span class="good">crece jugando</span>':''}${p.lock==='rest'?' · descanso':''}</div></div>${ovrChip(p)}</div>
     ${p.inj?'':`<button class="btn xs pri" data-act="tostart" data-id="${p.id}">A titular</button>`}</div>`).join('')}</div>
   <details class="mapfold"><summary class="sub">Sistema sin balón (avanzado)</summary><div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm ${!c.formOut?'on':''}" data-act="formout" data-v="">Igual</button>${Object.keys(FORMS).map(f=>`<button class="btn sm ${c.formOut===f?'on':''}" data-act="formout" data-v="${f}">${f}</button>`).join('')}</div><p class="sub">Más defensas sin balón suben tu defensa y bajan tu ataque.</p></details>`;
}
function mSlotPick(i){
  const c=userClub(),L=lineup(c.id),fk=c.form,sp=FSLOTS[fk][i],cur=L.xi[i],grp=cur.slot;
  const cands=c.players.map(i2=>S.players[i2]).filter(p=>!p.inj&&((grp==='GK')===(p.pos==='GK'))).map(p=>({p,pen:posPen(p,sp),s:eff(p)-posPen(p,sp)+psBonus(p,grp)})).sort((a,b)=>b.s-a.s).slice(0,16);
  return modalShell(`Elegir ${SPN[sp]}`,`<p class="sub" style="margin-top:0">Hueco <b>${SPL[sp]}</b> en el ${fk}. Ahora: <b>${esc(cur.p.name)}</b>. Entre paréntesis, su nivel real jugando ahí.</p>
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
