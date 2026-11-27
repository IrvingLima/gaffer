"use strict";
/* ================= vistas ================= */
const TABS=[['home','Inicio','home'],['team','Equipo','users'],['acad','Cantera','sprout'],['scout','Ojeo','eye'],['market','Mercado','swap'],['club','Club','wallet'],['league','Liga','trophy'],['career','Carrera','brief']];
const subnav=(g,items)=>`<div class="subnav" role="tablist">${items.map(([k,l])=>`<button role="tab" class="${UI.sub[g]===k?'on':''}" aria-selected="${UI.sub[g]===k}" data-act="sub" data-g="${g}" data-v="${k}">${l}</button>`).join('')}</div>`;
const clubTag=(cid,sz)=>{const c=S.clubs[cid];return c?`<span class="club">${crest(c,sz||20)}<span>${esc(c.name)}</span></span>`:'—';};
const starsFor=v=>{const n=v>=84?5:v>=78?4:v>=70?3:v>=62?2:1;return '★'.repeat(n)+'☆'.repeat(5-n);};
const pendingCount=()=>pendingMsgs().length;
function focusKey(){const a=document.activeElement;if(!a||a===document.body||!a.dataset)return null;const d=a.dataset;if(!(d.tab||d.act||a.id))return null;return {tab:d.tab,act:d.act,id:d.id,v:d.v,g:d.g,eid:a.id};}
function restoreFocus(k){
  if(!k)return;let sel=k.eid?'#'+k.eid:k.tab?`[data-tab="${k.tab}"]`:`[data-act="${k.act}"]`+(k.id?`[data-id="${k.id}"]`:'')+(k.v?`[data-v="${k.v}"]`:'')+(k.g?`[data-g="${k.g}"]`:'');
  try{const el=document.querySelector(sel);if(el&&!el.disabled&&el.tagName!=='SELECT'&&!(el.tagName==='INPUT'&&/search|text/.test(el.type)))el.focus({preventScroll:true});}catch(e){}
}
function a11y(root){
  (root||document).querySelectorAll('[data-act="player"]:not(button),[data-act="clubview"]:not(button)').forEach(el=>{if(!el.hasAttribute('tabindex')){el.tabIndex=0;el.setAttribute('role','button');}});
}
function render(){const fk=focusKey(),y=window.scrollY,hadModal=!!UI.m;_render();if(UI.m&&UI.m.type!=='match')renderModal();a11y();restoreFocus(fk);if(y)window.scrollTo(0,y);}

/* ---------- pantalla inicial / selección ---------- */
function slotsPanel(){
  const j=slotsMeta(),free=firstFreeSlot();
  const card=(m,i)=>m?`<div class="slot"><div class="row spread nw"><b>${esc(m.club||'Sin club')}</b><span class="chip">${esc((DIFFS[m.diff]||DIFFS.normal).nm)}</span></div><div class="sub">${esc(m.mgr||'')} · ${m.cc&&LG_BY_CC[m.cc]?LG_BY_CC[m.cc].nm:'—'} · ${esc(m.ylab||seasonLabel(m.Y||2026))} · ${fmtD(m.t)}</div><div class="row" style="margin-top:10px;gap:8px"><button class="btn sm pri" data-act="continue" data-v="${i}">Continuar ${ic('arrow','sm')}</button><button class="btn sm ghost" data-act="expslot" data-v="${i}" aria-label="Exportar carrera ${i+1}">Exportar</button><button class="btn sm ghost" data-act="delslot" data-v="${i}" aria-label="Borrar carrera ${i+1}">Borrar</button></div></div>`
   :`<button class="slot empty" data-act="newworld" data-v="${i}"><span class="code">+</span><b>Nueva carrera</b><span class="sub">Ranura ${i+1} libre</span></button>`;
  const any=j.list.some(x=>x);
  return `<div class="lbl" style="margin-top:24px">${any?'Tus carreras':'Empieza'}</div><div class="slots">${j.list.map((m,i)=>card(m,i)).join('')}</div><div class="row" style="margin-top:12px;gap:10px;flex-wrap:wrap"><button class="btn" data-act="impbtn">Importar partida desde archivo…</button><input id="importfile" type="file" accept=".gaffer,.json,application/json,application/gzip" hidden><span class="sub">Exporta una partida a un archivo .gaffer para llevarla a otro dispositivo.</span></div>`;
}
function renderStart(){
  applyAccent();
  $('#app').innerHTML=`<div class="setup"><div class="row spread"><div class="wordmark">Gaffer<i>.</i></div><button class="btn sm ghost" data-act="theme" aria-label="Cambiar tema">${ic('sun')}</button></div>
  <div class="tag">Tu carrera.<br>Tu <i>mundo</i>.</div>
  <p class="sub" style="max-width:600px;font-size:16px">Dirige un club de ${LEAGUES.length} países, ojea talento en ${NATS.length} naciones, forma a tus promesas y salta de club en club. Sin anuncios ni pagos: se guarda solo y funciona sin conexión.</p>
  ${slotsPanel()}
  <div class="grid g3 stk" style="margin-top:34px"><div class="stat"><div class="lbl">Mundo</div><div class="num">${LEAGUES.reduce((a,L)=>a+L.t.reduce((b,x)=>b+x[1],0),0).toLocaleString('es-ES')} clubes</div><div class="sub">${LEAGUES.length*4} divisiones en ${LEAGUES.length} países, con copas y competiciones continentales</div></div>
  <div class="stat"><div class="lbl">Talento</div><div class="num">+27.000</div><div class="sub">jugadores y ${NATS.length} naciones para ojear</div></div>
  <div class="stat"><div class="lbl">Carrera</div><div class="num">Sin fin</div><div class="sub">ascensos, ofertas y mercado de entrenadores</div></div></div></div>`;
}
const diffPicker=U=>`<div class="lbl" style="margin-top:22px">Dificultad</div><div class="grid g3 keep" role="group" aria-label="Dificultad">${Object.entries(DIFFS).map(([k,d])=>`<button class="ccard" style="min-height:0;padding:12px 14px" data-act="diff" data-v="${k}" aria-pressed="${(U.diff||'normal')===k}"><b>${d.nm}</b><span class="sub">${d.d}</span></button>`).join('')}</div>`;
function renderSetup(){
  applyAccent();const U=UI.setup;
  let h=`<div class="setup"><div class="row spread"><div class="wordmark">Gaffer<i>.</i></div><button class="btn sm ghost" data-act="theme" aria-label="Cambiar tema">${ic('sun')}</button></div>`;
  if(U.step==='country'){
    h+=`<div class="tag">Elige tu<br><i>liga</i></div><p class="sub" style="max-width:560px">Estructura de ligas basada en las pirámides reales. Los clubes son inventados; las ciudades, reales.</p>
    <div class="cgrid">${LEAGUES.map(L=>{const c=S.clubs.filter(x=>x.cc===L.cc&&x.tier===1);const top=Math.max(...c.map(x=>x.skill));
      return `<button class="ccard" data-act="country" data-v="${L.cc}"><span class="code">${L.cc}</span><b>${L.nm}</b><span class="sub">${L.t.map(x=>x[1]).join(' + ')} clubes · ${L.t.length} divisiones</span><span class="stars">${starsFor(top-4)}</span></button>`;}).join('')}
      <button class="ccard glory" data-act="glory"><span class="code">★</span><b>Carretera a la gloria</b><span class="sub">Empieza en 4ª división con presupuesto corto y escala hasta la élite. Tu historia queda guardada.</span></button>
      <button class="ccard" data-act="createclub" style="border-style:dashed"><span class="code">+</span><b>Crear mi club</b><span class="sub">Nombre, ciudad, colores y escudo propios. Empieza desde abajo.</span></button></div>
    <div style="margin-top:20px"><button class="btn ghost" data-act="backstart">${ic('back')} Volver</button></div>`;
  }else if(U.step==='club'){
    const L=LG_BY_CC[U.cc],lg=S.leagues.find(l=>l.cc===U.cc&&l.tier===U.tier),clubs=lg.ids.map(id=>S.clubs[id]).sort((a,b)=>b.skill-a.skill);
    h+=`<div style="margin-top:20px"><button class="btn sm ghost" data-act="backsetup">${ic('back')} Ligas</button></div>
    <div class="tag" style="font-size:clamp(38px,7vw,64px)">${L.nm}<br><i>${lg.nm}</i></div>
    <div class="seg" role="group" aria-label="División" style="margin-top:8px">${L.t.map((T,i)=>`<button class="${U.tier===i+1?'on':''}" data-act="tier" data-v="${i+1}">${T[0]} (${T[1]})</button>`).join('')}</div>
    <div class="lbl" style="margin-top:20px">Elige club · presupuesto según su nivel</div><div class="clist">
    ${clubs.map((c,i)=>`<button class="crow" data-act="club" data-v="${c.id}" aria-pressed="${U.idx===c.id}">${crest(c,44)}<span class="nm"><b>${esc(c.name)}</b><span class="sub">${esc(c.city)} · ${c.stad} · ${c.cap.toLocaleString('es')} plazas · Presupuesto ${EUR(c.budget*DIFFS[U.diff||'normal'].budget)}</span></span><span class="stars" aria-label="Nivel ${starsFor(c.skill)}">${starsFor(c.skill+[0,8,18,26][U.tier-1])}</span></button>`).join('')}</div>
    ${diffPicker(U)}
    <div class="row" style="margin-top:22px"><label class="sr" for="mgr">Tu nombre</label><input id="mgr" type="text" maxlength="24" placeholder="Tu nombre de mánager" value="${esc(U.mgr)}"><button class="btn pri lg" data-act="start" ${U.idx<0?'disabled':''}>Empezar carrera ${ic('arrow')}</button></div>`;
  }else if(U.step==='create'){
    const cr=U.create,fake={name:(cr.city||'Ciudad')+' '+(cr.suf||'Club'),short:cr.short&&cr.short.length>=2?cr.short:strip((cr.city||'CIU').slice(0,2)+(cr.suf||'C')[0]).toUpperCase(),c1:cr.c1,c2:cr.c2,pat:cr.pat,sh:cr.sh||0};
    const sw=['#d4161d','#1a3a8c','#1f8a3c','#f2c200','#141414','#f2f2f0','#6cabdd','#7a1f3a','#f26b1d','#5a2a8c','#0f6e5a','#e8d9a0'];
    h+=`<div style="margin-top:20px"><button class="btn sm ghost" data-act="backsetup">${ic('back')} Ligas</button></div><div class="tag" style="font-size:clamp(38px,7vw,64px)">Crea tu<br><i>club</i></div>
    <div class="grid g2" style="align-items:start"><div class="panel"><div class="field"><label for="cc_city">Ciudad</label><input id="cc_city" type="text" maxlength="22" value="${esc(cr.city)}" placeholder="Ej. Sevilla"></div>
    <div class="field"><label for="cc_suf">Nombre del club</label><input id="cc_suf" type="text" maxlength="18" value="${esc(cr.suf)}" placeholder="Ej. Unión"></div>
    <div class="field"><label for="cc_phil">Filosofía del club</label><select id="cc_phil"><option value="balance" ${(cr.phil||'balance')==='balance'?'selected':''}>Equilibrada: sin sesgos</option><option value="cantera" ${cr.phil==='cantera'?'selected':''}>Cantera: +1 objetivo juvenil, la directiva premia más ascender canteranos</option><option value="fichajes" ${cr.phil==='fichajes'?'selected':''}>Fichajes: +15% presupuesto y +10% límite salarial, menos exigencia juvenil</option></select><div class="sub" style="margin-top:4px">También se te asignará un <b>rival histórico</b> de tu liga: sus partidos se marcan como derbi.</div></div>
    <div class="field"><label for="cc_short">Iniciales del escudo (opcional)</label><input id="cc_short" type="text" maxlength="4" autocapitalize="characters" value="${esc(cr.short||'')}" placeholder="Automáticas"></div>
    <div class="field"><label for="cc_stad">Estadio</label><input id="cc_stad" type="text" maxlength="26" value="${esc(cr.stad)}" placeholder="Estadio municipal"></div>
    <div class="field"><label>País de la liga</label><select id="cc_cc">${LEAGUES.map(L=>`<option value="${L.cc}" ${U.cc===L.cc?'selected':''}>${L.nm}</option>`).join('')}</select></div></div>
    <div class="panel"><div class="row spread"><span class="lbl">Vista previa</span></div><div class="row" style="justify-content:center;margin:10px 0">${crest(fake,96)}</div><div style="text-align:center;font-family:var(--display);font-size:26px;text-transform:uppercase;font-weight:800">${esc(fake.name)}</div>
    <div class="field"><label>Color principal</label><div class="row" style="gap:8px">${sw.map(x=>`<button class="swatch ${cr.c1===x?'on':''}" style="background:${x}" data-act="cc1" data-v="${x}" aria-label="Color ${x}"></button>`).join('')}</div></div>
    <div class="field"><label>Color secundario</label><div class="row" style="gap:8px">${sw.map(x=>`<button class="swatch ${cr.c2===x?'on':''}" style="background:${x}" data-act="cc2" data-v="${x}" aria-label="Color ${x}"></button>`).join('')}</div></div>
    <div class="field"><label>Escudo</label><div class="row" style="gap:8px;flex-wrap:wrap">${PAT_LIST.map(p=>`<button class="btn sm ${cr.pat===p?'on':''}" data-act="cpat" data-v="${p}" aria-label="Diseño ${p+1}">${crest({...fake,pat:p},34)}</button>`).join('')}</div><div class="lbl" style="margin:10px 0 6px">Forma</div><div class="row" style="gap:8px;flex-wrap:wrap">${CREST_SHAPES.map((_,i)=>`<button class="btn sm ${(cr.sh||0)===i?'on':''}" data-act="csh" data-v="${i}" aria-label="Forma ${i+1}">${crest({...fake,sh:i},34)}</button>`).join('')}</div></div></div></div>
    <p class="sub">Tu club entra en la 2ª división del país elegido, sustituyendo al más débil. Empezarás desde abajo.</p>
    <div class="row"><input id="mgr" type="text" maxlength="24" placeholder="Tu nombre de mánager" value="${esc(U.mgr)}"><button class="btn pri lg" data-act="docreate" ${cr.city&&cr.suf?'':'disabled'}>Crear y empezar ${ic('arrow')}</button></div>`;
  }
  $('#app').innerHTML=h+'</div>';
}
/* ---------- armazón del juego ---------- */
function windowChip(){
  const c=userClub();if(!c)return '';const w=winInfo(c.cc,S.t);
  return w.open?`<span class="chip good">Mercado abierto · ${w.left===0?'¡HOY cierra!':'cierra en '+w.left+' d'}</span>`:`<span class="chip bad">Mercado cerrado · abre en ${w.left} d</span>`;
}
function _render(){
  if(!S||UI.menu){renderStart();return;}
  if(S.user==null&&!S.mgr){renderSetup();return;}
  applyAccent();
  const c=userClub(),emp=!c,pc=pendingCount();
  const tabs=emp?TABS.filter(t=>['career','league'].includes(t[0])):TABS;
  if(!tabs.some(t=>t[0]===UI.tab))UI.tab=tabs[0][0];
  const links=tabs.map(([k,l,i])=>`<button data-tab="${k}" ${UI.tab===k?'aria-current="page"':''}>${ic(i)}<span>${l}</span>${k==='home'&&pc?`<span class="badge" aria-label="${pc} decisiones">${pc}</span>`:''}${k==='scout'&&scoutUnread()?`<span class="badge" aria-label="${scoutUnread()} informes nuevos">${scoutUnread()}</span>`:''}</button>`).join('');
  const body=({home:vHome,team:vTeam,acad:vAcad,scout:vScout,market:vMarket,club:vClub,league:vLeague,career:vCareer})[UI.tab]();
  $('#app').innerHTML=`<div class="app"><nav class="rail" aria-label="Secciones"><div class="brand"><div class="wordmark">Gaffer<i>.</i></div></div><div class="links">${links}</div>
  <div class="railfoot"><button class="btn sm ghost" data-act="settings">${ic('cog')} Ajustes</button><button class="btn sm ghost" data-act="menu">Menú</button></div></nav>
  <div class="main"><header class="top">${c?crest(c,52):`<div class="avatar" style="color:var(--acc);border-color:var(--acc)">${ic('brief')}</div>`}<div class="id"><h1>${c?esc(c.name):'Sin club'}</h1>
   <div class="meta"><span>${esc(S.mgr.name)}</span><span>·</span><span>${userSeasonLabel()}</span><span>·</span><span>${fmtD(S.t)}</span>${c?windowChip():''}</div></div>
   <div><div class="lbl" style="text-align:right">${c?'Presupuesto':'Reputación'}</div><div class="cash ${c&&c.budget<0?'neg':''}">${c?EUR(c.budget):Math.round(S.mgr.rep)}</div></div><button class="gearbtn" data-act="settings" aria-label="Ajustes">${ic('cog')}</button></header>
  ${actionBar()}${body}</div></div>`;
}
function actionBar(){
  const c=userClub();let nx;
  if(S.pend){const h=S.clubs[S.pend.h],a=S.clubs[S.pend.a];nx=`<b>Hoy: ${esc(h.short)} vs ${esc(a.short)}</b><span>Tu partido de ${leagueOf(c.id).nm} espera</span>`;}
  else if(c){const nm=nextUserMatch();nx=nm?`<b>${fmtD(nm.t,true)}</b><span>${esc(nm.label||'')} · ${nm.h===c.id?'en casa':'fuera'} vs ${esc(S.clubs[nm.h===c.id?nm.a:nm.h].name)}</span>`:`<b>Pretemporada</b><span>${S.leagues[c.lg].sched[0]?'La liga empieza el '+fmtD(S.leagues[c.lg].sched[0].t):'Fin de temporada'}</span>`;}
  else nx=`<b>Sin equipo</b><span>Busca club en Carrera</span>`;
  const pc=pendingCount();
  return `<div class="actionbar"><div class="nx">${nx}</div>
   ${pc?`<button class="btn sm" data-act="inbox">${ic('bell','sm')} ${pc}</button>`:''}
   ${S.pend?`<button class="btn sm" data-act="simmatch" title="Resultado al instante">Simular todo</button><button class="btn sm" data-act="playkey" title="Juegas solo las ocasiones de más peso">Momentos clave</button><button class="btn pri" data-act="play">Jugar completo ${ic('arrow','sm')}</button>`:`<button class="btn sm" data-act="week">+1 sem</button>${S.user!=null?`<button class="btn sm" data-act="auto5" title="Simula 5 partidos sin verlos">Simular 5</button>`:''}<button class="btn pri" data-act="cont">Continuar ${ic('arrow','sm')}</button>`}</div>`;
}
/* ---------- INICIO ---------- */
function calEvents(){
  const c=userClub(),out=[],lg=leagueOf(c.id);let n=0;
  for(let i=lg.rd;i<lg.sched.length&&n<7;i++){const r=lg.sched[i],m=r.m.find(([h,a])=>h===c.id||a===c.id);if(m){const o=m[0]===c.id?m[1]:m[0];out.push({t:r.t,k:'m',a:(m[0]===c.id?'vs ':'@ ')+S.clubs[o].short,b:'J'+(i+1)});n++;}}
  userTournEvents().slice(0,4).forEach(e=>out.push({t:e.t,k:'m',a:e.h!=null?((e.h===c.id?'vs ':'@ ')+S.clubs[e.h===c.id?e.a:e.h].short):'Copa',b:e.kind==='cont'?'Europa':'Copa'}));
  const w=winInfo(c.cc,S.t);if(w.open)out.push({t:w.closes,k:'c',a:'Cierra',b:'mercado'});else out.push({t:w.opens,k:'w',a:'Abre',b:'mercado'});
  const j30=dayOf(S.Y+1,6,30);if(j30-S.t<=120&&j30>=S.t)out.push({t:j30,k:'c',a:'Fin',b:'contratos'});
  return out.sort((a,b)=>a.t-b.t).slice(0,12);
}
function oppReport(oppId){
  const o=S.clubs[oppId],L=lineup(oppId),r=ratings(oppId,L,false),ab=staffAbSafe('anal'),noise=Math.max(0,Math.round(8-ab*0.45));
  const top=L.xi.slice().sort((a,b)=>b.p.ovr-a.p.ovr)[0];
  const f=v=>noise?`${Math.round(v-noise)}–${Math.round(v+noise)}`:Math.round(v);
  return {l1:`Ataque ${f(r.att)} · Medio ${f(r.mid)} · Defensa ${f(r.def)}`,l2:`${o.form} · ${o.tactic==='attack'?'ofensivo':o.tactic==='defense'?'defensivo':'equilibrado'}${noise?'':' · fiable (analista)'}`,top:top.p};
}
function vHome(){
  const c=userClub();if(!c)return vCareer();
  let h='';const lg=leagueOf(c.id),nm=nextUserMatch(),allPending=S.inbox.filter(m=>!m.done&&DECISIONS.includes(m.ty)).sort((a,b)=>((a.exp||1e9)-(b.exp||1e9))||((a.soft?1:0)-(b.soft?1:0))),pending=allPending.slice(0,4);
  if(nm||S.pend){
    const m=S.pend?{h:S.pend.h,a:S.pend.a,t:S.pend.t,rd:lg.rd+1,label:(S.pend.nm?S.pend.nm+' · '+S.pend.rn:lg.nm+' · J'+(lg.rd+1))}:nm,home=m.h===c.id,opp=S.clubs[home?m.a:m.h],rep=oppReport(opp.id);
    const L=lineup(c.id),r=ratings(c.id,L,home),orr=ratings(opp.id,lineup(opp.id),!home),edge=(r.att+r.mid+r.def)/3-(orr.att+orr.mid+orr.def)/3;
    h+=`<section class="hero"><div class="row spread"><span class="lbl">${fmtD(m.t,true)} · ${esc(m.label||lg.nm)}${opp.id===c.rival?' · <b class="warn">DERBI</b>':''}</span><div class="form" aria-label="Forma reciente">${(c.form5||[]).slice(-5).map(x=>`<i class="${x}">${x==='W'?'G':x==='D'?'E':'P'}</i>`).join('')||'<span class="sub">Sin partidos</span>'}</div></div>
    <div class="fix"><div class="t">${crest(home?c:opp,64)}<b>${esc((home?c:opp).name)}</b><small>${esc((home?c:opp).city)}</small></div><div class="vs">VS</div><div class="t">${crest(home?opp:c,64)}<b>${esc((home?opp:c).name)}</b><small>${esc((home?opp:c).city)}</small></div></div>
    <div class="grid g2 keep" style="position:relative;z-index:1"><div class="sub"><b class="${edge>=1.5?'good':edge<=-1.5?'bad':''}">${edge>=1.5?'Tu once supera al rival':edge<=-1.5?'Rival superior':'Duelo igualado'}</b><br>Tu once: ataque ${Math.round(r.att)} · medio ${Math.round(r.mid)} · def. ${Math.round(r.def)}</div>
    <div class="sub"><b>Informe del analista</b><br>${rep.l1}<br>${rep.l2} · Peligro: ${esc(sname(rep.top))}</div></div></section>`;
  }else{
    const first=lg.sched[0],w=winInfo(c.cc,S.t);
    h+=`<section class="hero"><div class="lbl">Pretemporada ${userSeasonLabel()}</div><div class="num big" style="font-size:52px;margin:6px 0">${first?Math.max(0,first.t-S.t)+' días':'—'}</div><div class="sub">para el inicio de ${lg.nm}${first?' ('+fmtD(first.t,true)+')':''}. ${w.open?`El mercado cierra en ${w.left} días.`:''}</div></section>`;
  }
  if(pending.length)h+=`<div class="panel"><div class="hd"><h2>Decisiones pendientes <span class="cnt">${allPending.length}</span></h2><button class="btn sm ghost" data-act="inbox">Ver todas</button></div><div class="dlist">${pending.map(m=>msgHTML(m)).join('')}</div>${allPending.length>pending.length?`<p class="sub" style="margin:8px 0 0">+${allPending.length-pending.length} más en el buzón.</p>`:''}</div>`;
  if(S.nt)h+=ntPanel();
  if(S.dd&&S.dd.open)h+=`<div class="panel"><div class="hd"><h2>Deadline Day en marcha</h2><button class="btn sm pri" data-act="ddopen">Volver al evento</button></div><div class="sub">Son las ${DD_HOURS[S.dd.step]}. El mercado cierra a las 23:59.</div></div>`;
  if(S.pre&&S.pre.res&&S.t-(leagueOf(c.id).sched[0]?leagueOf(c.id).sched[0].t:0)<30)h+=`<div class="panel"><div class="hd"><h2>Pretemporada</h2><span class="chip">${esc(S.pre.res.opt)}</span></div><div class="sub">${S.pre.res.games.length?esc(S.pre.res.games.join(' · ')):'Trabajo físico'}${S.pre.res.prize?' · premio '+EUR(S.pre.res.prize):''} · moral de la primera jornada ${S.pre.res.moral>=0?'+':''}${S.pre.res.moral.toFixed(1)}</div></div>`;
  if(S.chal&&S.chal.state==='active')h+=`<div class="panel"><div class="hd"><h2>Reto vivo</h2><span class="chip gold">${EUR(S.chal.rew)}</span></div><div class="kv"><span>${esc(S.chal.t)}</span><b>${S.chal.prog}/${S.chal.need}</b></div><div class="sub">Partidos jugados: ${S.chal.played}${S.chal.kind==='unb'?'':'/'+S.chal.games}. Sin castigo si no lo logras.</div></div>`;
  h+=`<div class="panel"><div class="hd"><h2>Calendario</h2><span class="sub">próximos eventos</span></div><div class="strip">${calEvents().map(e=>`<div class="day ${e.k}"><span>${dateOf(e.t).toLocaleDateString('es',{weekday:'short',timeZone:'UTC'})}</span><b>${dateOf(e.t).getUTCDate()}</b><span>${dateOf(e.t).toLocaleDateString('es',{month:'short',timeZone:'UTC'})}</span><i>${esc(e.a)}</i><span>${e.b}</span></div>`).join('')}</div></div>`;
  const pos=posOf(c.id),played=lg.tab[c.id].p>0,o=S.obj,deb=youthDebuts(),n=lg.ids.length;
  h+=`<div class="grid g4"><div class="stat"><div class="lbl">Posición</div><div class="num">${played?pos+'º':'—'}</div><div class="sub">${lg.tab[c.id].pts} pts</div></div>
   <div class="stat"><div class="lbl">Directiva</div><div class="num ${c.board<30?'bad':''}">${Math.round(c.board)}%</div>${fitBar(c.board)}</div>
   <div class="stat"><div class="lbl">Salarios/sem</div><div class="num" style="font-size:26px">${EUR(wageBill(c))}</div><div class="sub">límite ${EUR(wageLimit(c))}</div></div>
   <div class="stat"><div class="lbl">Reputación</div><div class="num">${Math.round(c.rep)}</div><div class="sub">mánager ${Math.round(S.mgr.rep)}</div></div></div>
   <div class="grid g2"><div class="panel"><div class="hd"><h2>Objetivos</h2><span class="sub">3 líneas, siempre visibles</span></div>
    <div class="obj"><span class="ck ${played&&pos<=o.rank?'ok':''}">${played&&pos<=o.rank?ic('check','sm'):''}</span><div><b>${esc(o.rtxt||'')}</b><div class="sub">${played?`Ahora ${pos}º · <span class="${pos<=o.rank?'good':'warn'}">${pos<=o.rank?'en camino':'por debajo del objetivo'}</span>`:'La temporada no ha empezado'}</div>${objGuide('rank')}</div></div>
    <div class="obj"><span class="ck ${deb>=o.youth?'ok':''}">${deb>=o.youth?ic('check','sm'):''}</span><div><b>Dar minutos a ${o.youth} canteranos</b><div class="sub">${deb}/${o.youth} con 5+ partidos en el primer equipo</div>${objGuide('youth')}</div></div>
    ${o.cup?`<div class="obj"><span class="ck ${userCupOut()<=o.cup.out?'ok':''}">${userCupOut()<=o.cup.out?ic('check','sm'):''}</span><div><b>${esc(o.cup.txt)}</b><div class="sub">${(()=>{const T=S.tn['cup:'+c.cc];if(!T)return '';const x=T.out[c.id];return T.champion===c.id?'¡Campeón!':x!=null?'Eliminado en '+roundNameBySize(T,x):'Sigues en la copa';})()}</div>${objGuide('cup')}</div></div>`:''}
    <div class="obj"><span class="ck ${c.budget>=0?'ok':'no'}">${c.budget>=0?ic('check','sm'):ic('x','sm')}</span><div><b>Mantener el presupuesto en positivo</b><div class="sub">${EUR(c.budget)} disponibles</div>${objGuide('fin')}</div></div></div>
   <div class="panel"><div class="hd"><h2>Radar de cantera</h2><button class="btn sm ghost" data-tab="acad">Ver todo</button></div>${radarList()}</div></div>
   ${(()=>{const st=userTournStatus();return st.length?`<div class="panel"><div class="hd"><h2>Competiciones</h2><button class="btn sm ghost" data-act="goto" data-v="league:cups">Ver copas</button></div>${st.map(x=>`<div class="kv"><span>${esc(x.nm)}</span><b class="${x.ok?'':'mute'}">${esc(x.st)}</b></div>`).join('')}</div>`:'';})()}
   <div class="panel"><div class="hd"><h2>${esc(lg.nm)}</h2><button class="btn sm ghost" data-tab="league">Tabla completa</button></div>${miniTable(lg,c.id,5)}</div>
   <div class="panel"><div class="hd"><h2>Noticias</h2></div>${S.news.slice(0,8).map(x=>`<div class="news"><span class="w">${dateOf(x.t).toLocaleDateString('es',{day:'numeric',month:'short',timeZone:'UTC'})}</span><span>${esc(x.txt)}</span></div>`).join('')||'<div class="empty">Sin novedades.</div>'}</div>`;
  return h;
}
function radarList(){
  const pl=S.ac.list.map(i=>S.players[i]).sort((a,b)=>midPot(b)-midPot(a)).slice(0,3);
  if(!pl.length)return '<div class="empty">Tu cantera está vacía. Ficha candidatos en Cantera.</div>';
  return pl.map(p=>`<div class="kv nw" data-act="player" data-id="${p.id}" style="cursor:pointer"><span class="row nw" style="gap:8px">${posTag(p.pos,p)}<b>${esc(p.name)}</b><span class="sub">${p.age}</span></span><span>${ovrChip(p)} <span class="sub">pot ${showPot(p)}</span></span></div>`).join('');
}
/* ---------- EQUIPO ---------- */
function vTeam(){
  let h=subnav('team',[['squad','Plantilla'],['stats','Estadísticas'],['lineup','Alineación'],['contracts','Contratos']]);
  if(UI.sub.team==='stats')return h+teamStatsHTML();
  const c=userClub();
  if(UI.sub.team==='squad'){
    h+=trainReportHTML();
    const order={GK:0,DEF:1,MID:2,FWD:3},all=c.players.map(i=>S.players[i]).sort((a,b)=>order[a.pos]-order[b.pos]||b.ovr-a.ovr),pl=all.filter(p=>UI.f.sq==='ALL'||p.pos===UI.f.sq),xi=new Set(lineup(c.id).xi.map(x=>x.p.id));
    h+=`<div class="panel"><div class="hd"><h2>Plantilla <span class="mute">${all.length}/27</span></h2><span class="sub">Salarios ${EUR(wageBill(c))}/sem</span></div>
    <div class="row spread" style="margin-bottom:10px"><div class="seg" role="group" aria-label="Posición">${['ALL','GK','DEF','MID','FWD'].map(k=>`<button class="${UI.f.sq===k?'on':''}" data-act="sfilter" data-v="${k}">${k==='ALL'?'Todos':POSL[k]}</button>`).join('')}</div>
    <div class="seg"><button class="${UI.f.cards?'':'on'}" data-act="cards" data-v="0">Tabla</button><button class="${UI.f.cards?'on':''}" data-act="cards" data-v="1">Tarjetas</button></div></div>
    ${UI.f.cards?`<div class="fcs">${pl.map(p=>fcard(p,{tag:xi.has(p.id)?'<span class="chip acc">XI</span>':'',extra:p.inj?`lesión ${p.inj}s`:''})).join('')}</div>`:
    `<div class="scroll"><table><tr><th>Pos</th><th>Jugador</th><th class="n">Edad</th><th class="n">Nivel</th><th class="n">Pot.</th><th>Cond.</th><th class="n">Part.</th><th class="n">G</th><th class="n">Contrato</th></tr>
    ${pl.map(p=>`<tr class="click" data-act="player" data-id="${p.id}"><td>${posTag(p.pos,p)}</td><td><div class="pname"><b>${esc(p.name)} ${xi.has(p.id)?'<span class="chip acc">XI</span>':''}${p.h?' <span class="chip gold">Cantera</span>':''}${p.lock?` <span class="chip">${p.lock==='start'?'Titular':'Descanso'}</span>`:''}${p.tl?' <span class="chip info">En venta</span>':''}</b><span class="sub">${flag(p.nat,11)} ${p.nat} · ${traitOf(p)}${p.inj?` · <span class="bad">Lesión ${p.inj} sem</span>`:''}</span></div></td>
    <td class="n">${p.age}</td><td class="n">${ovrChip(p)}</td><td class="n mute">${p.pot}</td><td style="min-width:70px">${fitBar(p.fit)}</td><td class="n">${p.ap}</td><td class="n">${p.g}</td><td class="n ${p.ce<=S.Y?'warn':''}">${p.ce+1}</td></tr>`).join('')}</table></div>`}
    <p class="sub" style="margin-bottom:0">Toca un jugador para ver su ficha, renovar, vender o fijar su rol.</p></div>`;
  }else if(UI.sub.team==='lineup'){
    const L=lineup(c.id),r=ratings(c.id,L,false),ins=c.ins||{};
    const bar=(n,v)=>`<div class="stline"><span>${n}</span><div class="bar neu"><i style="width:${clamp((v-40)*2,0,100)}%"></i></div><b class="num" style="font-size:18px;text-align:right">${Math.round(v)}</b></div>`;
    h+=lineupMainHTML(c,L)+`<div class="grid g2" style="align-items:start"><div>
    <div class="panel"><h2 style="margin-bottom:10px">Instrucciones</h2><div class="lbl">Mentalidad</div><div class="seg" style="margin:6px 0 12px">${[['defense','Defensiva'],['balance','Equilibrada'],['attack','Ofensiva']].map(([k,l])=>`<button class="${c.tactic===k?'on':''}" data-act="tactic" data-v="${k}">${l}</button>`).join('')}</div>
     <div class="grid g2 stk"><div><div class="lbl">Ritmo</div><div class="seg" style="margin:6px 0">${[['slow','Bajo'],['normal','Normal'],['fast','Alto']].map(([k,l])=>`<button class="${(ins.tempo||'normal')===k?'on':''}" data-act="ins" data-g="tempo" data-v="${k}">${l}</button>`).join('')}</div></div>
     <div><div class="lbl">Línea defensiva</div><div class="seg" style="margin:6px 0">${[['deep','Baja'],['normal','Media'],['high','Alta']].map(([k,l])=>`<button class="${(ins.line||'normal')===k?'on':''}" data-act="ins" data-g="line" data-v="${k}">${l}</button>`).join('')}</div></div>
     <div><div class="lbl">Anchura</div><div class="seg" style="margin:6px 0">${[['narrow','Cerrada'],['normal','Normal'],['wide','Abierta']].map(([k,l])=>`<button class="${(ins.width||'normal')===k?'on':''}" data-act="ins" data-g="width" data-v="${k}">${l}</button>`).join('')}</div></div>
     <div><div class="lbl">Presión</div><div style="margin:6px 0"><button class="btn sm ${ins.press?'on':''}" data-act="ins" data-g="press" data-v="${ins.press?'':'1'}" aria-pressed="${!!ins.press}">${ins.press?'Alta · ON':'Normal'}</button></div></div></div>
     <p class="sub">La presión y el ritmo alto suben tu nivel pero cansan más.</p></div>
    <div class="panel"><h2 style="margin-bottom:10px">Entrenamiento semanal</h2><div class="seg" style="flex-wrap:wrap">${[['bal','Equilibrado'],['fit','Físico'],['def','Defensa'],['mid','Medio'],['att','Ataque']].map(([k,l])=>`<button class="${(c.train||'bal')===k?'on':''}" data-act="train" data-v="${k}">${l}</button>`).join('')}</div><p class="sub" style="margin-bottom:0">Cada lunes recibirás un informe de quién mejoró y por qué.</p></div>
    <div class="panel"><h2 style="margin-bottom:6px">Fuerza por línea</h2>${bar('Ataque',r.att)}${bar('Medio',r.mid)}${bar('Defensa',r.def)}${bar('Portero',r.gk)}</div></div></div>`;
  }else{
    const pl=c.players.map(i=>S.players[i]).sort((a,b)=>a.ce-b.ce||b.ovr-a.ovr),W=wageBill(c);
    h+=`<div class="grid g3 keep"><div class="stat"><div class="lbl">Masa salarial</div><div class="num" style="font-size:24px">${EUR(W)}</div></div><div class="stat"><div class="lbl">Límite directiva</div><div class="num" style="font-size:24px">${EUR(c.wageCap)}</div></div><div class="stat"><div class="lbl">Expiran</div><div class="num">${pl.filter(p=>p.ce<=S.Y).length}</div></div></div>
    <div class="panel"><div class="hd"><h2>Contratos</h2><span class="sub">Los contratos terminan el 30 de junio</span></div><div class="scroll"><table><tr><th>Jugador</th><th class="n">Salario/sem</th><th class="n">Termina</th><th class="n">Valor</th><th></th></tr>
    ${pl.map(p=>`<tr><td><div class="club">${posTag(p.pos,p)}<span><b>${esc(p.name)}</b> <span class="sub">${p.age} · ${p.ovr}</span></span></div></td><td class="n">${EUR(p.w)}</td><td class="n ${p.ce<=S.Y?'warn':''}">30 jun ${p.ce+1}</td><td class="n">${EUR(valueOf(p))}</td><td class="n"><button class="btn xs ${p.ce<=S.Y?'pri':''}" data-act="renew" data-id="${p.id}">Renovar</button></td></tr>`).join('')}</table></div></div>`;
  }
  return h;
}
function pitchSVG(c,L){
  const rows=[['GK',124],['DEF',97],['MID',67],['FWD',36]];let dots='';
  rows.forEach(([pos,y])=>{const xs=L.xi.filter(x=>x.slot===pos).sort((a,b)=>(a.lat||0)-(b.lat||0));xs.forEach((x,i)=>{const cx=(i+1)*100/(xs.length+1),nm=sname(x.p),lab=nm.length>7?nm.slice(0,6)+'.':nm,fs=xs.length>=5?3.9:4.6;
    dots+=`<g transform="translate(${cx} ${y})" style="cursor:pointer" data-act="player" data-id="${x.p.id}"><circle r="${xs.length>=5?6.6:7.2}" fill="${c.c1}" stroke="${c.c2}" stroke-width="1.5"/><text y="2.5" text-anchor="middle" font-size="6.6" font-weight="800" style="fill:${lum(c.c1)>0.4?'#111':'#fff'}">${Math.round(x.e)}</text><text y="13.6" text-anchor="middle" font-size="${fs}">${esc(lab)}</text><text y="-9" text-anchor="middle" font-size="3.6" opacity=".75" style="fill:currentColor">${SPL[x.spos]||''}</text></g>`;});});
  return `<svg viewBox="0 0 100 148" class="pitch" role="img" aria-label="Once previsto en ${c.form}"><rect x="3" y="3" width="94" height="142" rx="3" class="pl"/><path d="M3 74h94" class="pl"/><circle cx="50" cy="74" r="11" class="pl"/><rect x="26" y="3" width="48" height="19" class="pl"/><rect x="26" y="126" width="48" height="19" class="pl"/>${dots}</svg>`;
}
/* ---------- CANTERA ---------- */
function growthWhy(p){
  const d=devMult(p),out=[];
  d.parts.forEach(x=>{if(x.v>=1.15)out.push(['good',x.txt]);else if(x.v<0.9||x.k==='Techo')out.push(['bad',x.txt]);else if(x.k==='Mentor'&&x.v===1)out.push(['bad',x.txt]);});
  return out;
}
function prospectCard(p,mode){
  const gem=p.known&&p.pot>=85,A=S.ac;
  const mentors=userClub().players.map(i=>S.players[i]).filter(m=>m.age>=27&&m.ovr>=60).sort((a,b)=>b.ovr-a.ovr);
  let acts;
  if(mode==='intake')acts=`<button class="btn pri sm" data-act="sign" data-id="${p.id}" ${acadFree()<=0?'disabled':''}>Fichar para la cantera</button>`;
  else if(mode==='acad')acts=`<button class="btn pri sm" data-act="promote" data-id="${p.id}">Ascender</button><button class="btn sm" data-act="loanm" data-id="${p.id}">Ceder</button><button class="btn sm" data-act="sellp" data-id="${p.id}">Vender ${EUR(sellPrice(p))}</button><button class="btn sm danger" data-act="release" data-id="${p.id}">Liberar</button>`;
  else acts=`<button class="btn sm" data-act="recall" data-id="${p.id}">Repatriar</button><button class="btn pri sm" data-act="promote" data-id="${p.id}">Ascender ya</button>`;
  const why=mode==='acad'?growthWhy(p):[];
  return `<article class="pcard ${gem?'gem':''}"><div class="row nw" style="gap:12px;cursor:pointer" data-act="player" data-id="${p.id}">${avatar(p)}<div style="min-width:0;flex:1"><b style="font-size:16px">${esc(p.name)}</b><div class="row" style="gap:6px;margin-top:3px">${posTag(p.pos,p)}<span class="chip">${p.age} años</span><span class="chip">${flag(p.nat,11)} ${p.nat}</span>${gem?'<span class="chip gold">Perla</span>':''}</div></div>${ovrChip(p)}</div>
  ${potBar(p)}<div class="row mini" style="gap:6px"><span class="chip ${rateOf(p)>=1.2?'good':rateOf(p)<0.9?'bad':''}">${traitOf(p)}</span>${confChip(p)}${mode==='acad'&&p.ovr!==p.ovr0?`<span class="chip ${p.ovr>=p.ovr0?'good':'bad'}">${p.ovr>=p.ovr0?'+':''}${p.ovr-p.ovr0} esta temp.</span>`:''}${mode==='acad'?`<span class="chip">${(p.ym||0)} part. juv. · ${(p.yg||0)} G</span>`:''}${mode==='loan'?`<span class="chip ${p.loan.sem==='r'?'bad':p.loan.sem==='a'?'warn':'good'}">${p.loan.sem==='r'?'ROJO · no juega':p.loan.sem==='a'?'ÁMBAR · menos de lo pactado':'VERDE · cumple'}</span><span class="chip acc">${esc(clubName(p.loan.cid))} · ${p.loan.apps} part.</span>`:''}</div>
  ${mode==='acad'?`<div class="row mini" style="gap:8px"><label class="sub" for="m${p.id}">Mentor</label><select id="m${p.id}" data-act="mentor" data-id="${p.id}"><option value="">Sin mentor</option>${mentors.map(m=>`<option value="${m.id}" ${p.mentor===m.id?'selected':''}>${esc(m.name)} · ${m.ovr}</option>`).join('')}</select><button class="btn xs ${p.int?'on':''}" data-act="int" data-id="${p.id}" aria-pressed="${p.int}">Plan intensivo ${p.int?'ON':'OFF'}</button></div>`:''}
  ${why.length?`<details><summary class="sub" style="cursor:pointer">¿Por qué crece${why.some(w=>w[0]==='bad')?' poco':''}?</summary>${why.map(w=>`<div class="why ${w[0]}">${esc(w[1])}</div>`).join('')}</details>`:''}
  <div class="row" style="gap:6px">${acts}</div></article>`;
}
function vAcad(){
  const A=S.ac,c=userClub();
  let h=subnav('acad',[['squad','Plantel'],['league','Liga juvenil'],['intake',`Captación${A.intake.length?' ('+A.intake.length+')':''}`]]);
  const acad=A.list.map(i=>S.players[i]).sort((a,b)=>b.ovr-a.ovr),loans=A.loans.map(i=>S.players[i]);
  if(typeof youthMatchPanel==='function')h+=youthMatchPanel();
  if(UI.sub.acad==='squad'){
    h+=`<div class="grid g3 keep"><div class="stat"><div class="lbl">Plazas</div><div class="num">${acad.length}<span class="mute" style="font-size:20px">/${ACAD_SLOTS(A.lvl)}</span></div><div class="sub">${EUR(academyCost())}/sem</div></div>
    <div class="stat"><div class="lbl">Academia</div><div class="num">Nv ${A.lvl}<span class="mute" style="font-size:20px">/5</span></div>${A.lvl<5?`<button class="btn xs" data-act="upg">Mejorar · ${EUR(upgCost(A.lvl))}</button>`:'<span class="chip good">Máximo</span>'}</div>
    <div class="stat"><div class="lbl">Jefe de cantera</div><div class="num">${staffAbSafe('youth')}</div><button class="btn xs" data-act="goto" data-v="club:staff">Cambiar</button></div></div>
    <div class="row" style="margin:6px 0"><button class="btn sm" data-act="automentor">${ic('users','sm')} Asignar mentores automáticamente</button><span class="sub">Crece más quien juega, tiene mentor y buen jefe de cantera.</span></div>
    <div class="panel"><div class="hd"><h2>Canteranos</h2><span class="sub">A los 20 años se gradúan al primer equipo</span></div>${acad.length?`<div class="cards">${acad.map(p=>prospectCard(p,'acad')).join('')}</div>`:'<div class="empty">Sin canteranos. Ficha candidatos en Captación o ojea en el extranjero.</div>'}</div>`;
    if(loans.length)h+=`<div class="panel"><div class="hd"><h2>Cedidos</h2><span class="sub">Vuelven a final de temporada</span></div><div class="cards">${loans.map(p=>prospectCard(p,'loan')).join('')}</div></div>`;
  }else if(UI.sub.acad==='league'){
    const lg=leagueOf(c.id),t=lg.ids.map(id=>({id,...lg.yt[id]})).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)),top=acad.slice().sort((a,b)=>(b.yg||0)-(a.yg||0)).slice(0,5);
    h+=`<div class="grid g2" style="align-items:start"><div class="panel"><div class="hd"><h2>Liga juvenil sub-19</h2><span class="sub">${lg.nm}</span></div><div class="scroll"><table><tr><th>#</th><th>Club</th><th class="n">PJ</th><th class="n">DG</th><th class="n">Pts</th></tr>${t.map((r,i)=>`<tr class="${r.id===c.id?'me':''}"><td>${i+1}</td><td>${clubTag(r.id,20)}</td><td class="n">${r.p}</td><td class="n">${r.gf-r.ga}</td><td class="n"><b>${r.pts}</b></td></tr>`).join('')}</table></div></div>
    <div><div class="panel"><div class="hd"><h2>Ruta de minutos</h2></div>${acad.length?acad.slice(0,8).map(p=>`<div class="kv"><span class="row nw" style="gap:8px">${posTag(p.pos,p)}<span>${esc(sname(p))}</span></span><span class="row nw" style="gap:8px;width:48%">${fitBar(clamp((p.ymw||0)/3*100,0,100))}<span class="sub">${p.ym||0}</span></span></div>`).join(''):'<div class="empty">Sin canteranos.</div>'}<p class="sub" style="margin-bottom:0">Barra: partidos recientes. Quien juega crece más.</p></div>
    <div class="panel"><div class="hd"><h2>Goleadores juveniles</h2></div>${top.filter(p=>p.yg).map(p=>`<div class="kv"><span>${esc(p.name)}</span><b>${p.yg}</b></div>`).join('')||'<div class="empty">Aún sin goles.</div>'}</div></div></div>`;
  }else{
    h+=`<div class="panel"><div class="hd"><h2>Captación</h2><span class="sub">${acadFree()} plaza(s) libre(s) · ${A.intake.length} candidatos · potencial ojeado, no exacto</span></div>${A.intake.length?`<div class="cards">${A.intake.map(p=>prospectCard(p,'intake')).join('')}</div><div style="margin-top:12px"><button class="btn sm ghost" data-act="skipintake">Descartar candidatos</button></div>`:'<div class="empty">No hay candidatos ahora. Cada mes hay pruebas, y a final de temporada llega una hornada nueva. También puedes ojear jóvenes en el extranjero.</div>'}</div>
    <div class="row"><button class="btn" data-act="goto" data-v="scout:map">${ic('globe','sm')} Ojear jóvenes en otros países</button></div>`;
  }
  return h;
}
/* ---------- OJEO ---------- */
function natKnowLevel(nat){const n=S.reports.filter(r=>r.nat===nat).length;return n>=7?3:n>=3?2:n>=1?1:0;}
function scoutsList(){return S.staff.hired.filter(s=>s.role==='scout');}
function vScout(){
  let h=subnav('scout',[['map','Mapa'],['scouts','Ojeadores'],['reports','Informes'+(scoutUnread()?' ('+scoutUnread()+')':'')],['short','Lista corta ('+S.short.length+')']]);
  const sc=scoutsList();
  if(UI.sub.scout==='map'){
    const maxY=Math.max(...NATS.map(n=>n[6]))+1,cells=[];
    for(let y=0;y<maxY;y++)for(let x=0;x<16;x++){
      const n=NATS.find(q=>q[5]===x&&q[6]===y);
      if(!n){cells.push('<div></div>');continue;}
      const cc=n[0],lvl=natKnowLevel(cc),pin=sc.some(s=>S.scout.miss[s.id]&&S.scout.miss[s.id].nat===cc);
      cells.push(`<button class="tile k${lvl} ${hasLeague(cc)?'lg':''} ${UI.sel.nat===cc?'sel':''}" data-act="nat" data-v="${cc}" aria-label="${NAT[cc].nm}${pin?', con ojeador':''}">${cc}${pin?'<span class="pin"></span>':''}</button>`);
    }
    h+=`<div class="panel"><div class="hd"><h2>Mapa de ojeo</h2><div class="legend"><span><i style="background:var(--s1);border:1px solid var(--line)"></i>sin informes</span><span><i style="background:color-mix(in srgb,var(--acc) 42%,var(--s1))"></i>conocida</span><span><i style="background:var(--acc)"></i>bien cubierta</span><span><i style="background:var(--gold)"></i>liga simulada</span></div></div>
    ${worldMapHTML(sc)}<details class="mapfold" ${typeof innerWidth!=='undefined'&&innerWidth<640?'open':''}><summary class="sub">Lista de naciones (más fácil de tocar en el móvil)</summary><div class="map">${(typeof innerWidth!=='undefined'&&innerWidth<640?cells.filter(x=>x!=='<div></div>'):cells).join('')}</div></details><p class="sub" style="margin-bottom:0">Toca una nación del mapa para ver su talento y asignar un ojeador. Tus ${sc.length} ojeadores trabajan una nación cada uno; sus viajes se ven animados.</p></div>`;
    if(UI.sel.nat)h+=natPanel(UI.sel.nat);
  }else if(UI.sub.scout==='scouts'){h+=scoutsTabHTML();
  }else if(UI.sub.scout==='reports'){
    h+=scoutReportsHTML();
    const list=S.reports.map(r=>S.players[r.pid]).filter(p=>p&&p.where!=='retired'&&p.club!==S.user&&(UI.f.rep.pos==='ALL'||p.pos===UI.f.rep.pos)&&p.age<=UI.f.rep.maxAge);
    const seenIds=new Set(),uniq=list.filter(p=>seenIds.has(p.id)?false:seenIds.add(p.id));
    h+=`<div class="panel"><div class="hd"><h2>Todos los jugadores vistos</h2><span class="sub">${uniq.length} jugadores</span></div><div class="row" style="margin-bottom:10px"><div class="seg">${['ALL','GK','DEF','MID','FWD'].map(k=>`<button class="${UI.f.rep.pos===k?'on':''}" data-act="rpos" data-v="${k}">${k==='ALL'?'Todos':POSL[k]}</button>`).join('')}</div>
    <div class="seg">${[[40,'Todos'],[21,'≤21'],[18,'≤18']].map(([v,l])=>`<button class="${UI.f.rep.maxAge===v?'on':''}" data-act="rage" data-v="${v}">${l}</button>`).join('')}</div></div>${playerTable(uniq.slice(0,60),true)}</div>`;
  }else{
    const list=S.short.map(i=>S.players[i]).filter(p=>p&&p.where!=='retired'&&p.club!==S.user);
    h+=`<div class="panel"><div class="hd"><h2>Lista corta</h2><span class="sub">Se guarda aunque cambies de pantalla</span></div>${list.length?playerTable(list,true):'<div class="empty">Añade jugadores con la estrella desde cualquier ficha o informe.</div>'}</div>`;
  }
  return h;
}
function natPanel(cc){
  const N=NAT[cc],sc=scoutsList(),m=sc.filter(s=>S.scout.miss[s.id]&&S.scout.miss[s.id].nat===cc);
  const known=S.reports.filter(r=>r.nat===cc).map(r=>S.players[r.pid]).filter(p=>p&&p.where!=='retired'&&p.club!==S.user);
  const uniq=[...new Map(known.map(p=>[p.id,p])).values()].sort((a,b)=>midPot(b)-midPot(a)).slice(0,6);
  return `<div class="panel"><div class="hd"><h2>${N.nm}</h2><span class="chip">${REGIONS[N.reg]}</span></div>
  <div class="grid g3 keep"><div><div class="lbl">Cantera local</div><div class="stars">${starsFor(N.yq*60+20)}</div></div><div><div class="lbl">Liga simulada</div><b>${hasLeague(cc)?'Sí · 2 divisiones':'No · pool de jóvenes'}</b></div><div><div class="lbl">Informes</div><b>${S.reports.filter(r=>r.nat===cc).length}</b></div></div>
  <div class="row" style="margin:12px 0">${m.length?m.map(s=>`<span class="chip good">${esc(s.nm)} ojeando</span>`).join(''):'<span class="chip bad">Sin ojeador asignado</span>'}<button class="btn sm pri" data-act="missionnat" data-v="${cc}" ${sc.length?'':'disabled'}>Asignar ojeador aquí</button></div>
  ${uniq.length?`<div class="lbl" style="margin-bottom:8px">Mejores hallazgos</div><div class="fcs">${uniq.map(p=>fcard(p,{extra:p.club!=null&&S.clubs[p.club]?S.clubs[p.club].short:''})).join('')}</div>`:'<div class="empty">Aún no hay informes de esta nación.</div>'}</div>`;
}
function playerTable(list,actions){
  return `<div class="scroll"><table><tr><th>Pos</th><th>Jugador</th><th class="n hm">Edad</th><th class="n">Nivel</th><th class="n">Pot.</th><th class="n hm">Valor</th><th class="hm">Info</th>${actions?'<th></th>':''}</tr>
  ${list.map(p=>`<tr class="click" data-act="player" data-id="${p.id}"><td>${posTag(p.pos,p)}</td><td><div class="pname"><b>${esc(p.name)}</b><span class="sub">${flag(p.nat,11)} ${p.nat} · ${esc(clubLabel(p))}</span></div></td><td class="n hm">${p.age}</td><td class="n">${ovrChip(p)}</td><td class="n gold">${showPot(p)}</td><td class="n hm">${EUR(approxValue(p))}</td><td class="hm">${confChip(p)}</td>
  ${actions?`<td class="n"><button class="btn xs ${S.short.includes(p.id)?'on':''}" data-act="short" data-id="${p.id}" aria-label="Lista corta">${ic('star','sm')}</button></td>`:''}</tr>`).join('')||'<tr><td colspan="8" class="empty">Sin resultados.</td></tr>'}</table></div>`;
}
function approxValue(p){const q={...p,ovr:midOvr(p),pot:Math.max(midOvr(p),midPot(p))};return valueOf(q);}
/* ---------- MERCADO ---------- */
function visiblePlayers(){
  const F=UI.f.mk,q=F.q.trim().toLowerCase(),out=[];
  S.clubs.forEach(c=>{if(c.id===S.user)return;c.players.forEach(id=>{const p=S.players[id];if(!p)return;
    if(F.pos!=='ALL'&&p.pos!==F.pos)return;if(F.nat!=='ALL'&&p.nat!==F.nat)return;if(p.age>F.maxAge)return;
    if(midOvr(p)<F.minOvr)return;if(q&&!(p.name.toLowerCase().includes(q)||c.name.toLowerCase().includes(q)))return;out.push(p);});});
  const key={ovr:p=>-midOvr(p),pot:p=>-midPot(p),age:p=>p.age,value:p=>-approxValue(p)}[F.sort];
  return out.sort((a,b)=>key(a)-key(b));
}
function vMarket(){
  const c=userClub();let h=subnav('market',[['hub','Centro'],['search','Buscar'],['free','Libres'],['sell','Vender'],['windows','Ventanas']]);
  const w=winInfo(c.cc,S.t);
  if(UI.sub.market==='free'||UI.sub.market==='sell')h+=`<div class="panel flat" style="padding:10px 12px;margin:10px 0"><span class="chip ${w.open?'good':'bad'}">${w.open?'Mercado abierto · cierra el '+fmtD(w.closes):'Mercado cerrado · abre el '+fmtD(w.opens)}</span> <span class="sub">Los agentes libres se pueden fichar siempre.</span></div>`;
  if(UI.sub.market==='hub'){h+=marketHubHTML();
  }else if(UI.sub.market==='search'){h+=marketSearchHTML();
  }else if(UI.sub.market==='free'){h+=marketFreeHTML();
  }else if(UI.sub.market==='sell'){h+=sellHTML();
  }else{
    h+=`<div class="panel"><div class="hd"><h2>Ventanas por país</h2><span class="sub">Fechas aproximadas del calendario real</span></div><table><tr><th>País</th><th>Estado</th><th class="n">Próximo cambio</th></tr>${LEAGUES.map(L=>{const i=winInfo(L.cc,S.t);return `<tr class="${L.cc===c.cc?'me':''}"><td>${L.nm}</td><td><span class="chip ${i.open?'good':'bad'}">${i.open?'Abierta':'Cerrada'}</span></td><td class="n">${i.open?'cierra '+fmtD(i.closes):'abre '+fmtD(i.opens)}</td></tr>`;}).join('')}</table></div>
    <div class="panel"><div class="hd"><h2>Traspasos recientes</h2></div>${S.news.filter(x=>x.ty==='t').slice(0,12).map(x=>`<div class="news"><span class="w">${dateOf(x.t).toLocaleDateString('es',{day:'numeric',month:'short',timeZone:'UTC'})}</span><span>${esc(x.txt)}</span></div>`).join('')||'<div class="empty">Aún no hay traspasos destacados.</div>'}</div>`;
  }
  return h;
}
/* ---------- CLUB ---------- */
function staffCard(s,mode){
  const R=STAFF_ROLES[s.role];
  return `<div class="msg"><div class="row spread nw"><div class="row nw" style="gap:10px">${ic(R.ic,'lg')}<div><b>${esc(s.nm)}</b><div class="sub">${R.nm} · ${NAT[s.nat].nm} · ${s.age} años</div></div></div><span class="chip acc">Nivel ${s.ab}</span></div>
  <div class="sub" style="margin:6px 0">${R.ef}${s.role==='scout'?` · JA ${s.ja} · JP ${s.jp} · AD ${s.ad}`:''}</div>
  <div class="row spread"><span class="sub">${EUR(s.w)}/sem${mode==='hire'?` · prima ${EUR(s.w*4)}`:` · ${s.ce} año${s.ce===1?'':'s'}`}</span>${mode==='hire'?`<button class="btn sm pri" data-act="hire" data-id="${s.id}">Contratar</button>`:`<button class="btn sm danger" data-act="fire" data-id="${s.id}">Despedir</button>`}</div></div>`;
}
function vClub(){
  const c=userClub();let h=subnav('club',[['staff','Staff'],['finance','Finanzas'],['identity','Identidad']]);
  if(UI.sub.club==='staff'){
    const hired=S.staff.hired,tot=hired.reduce((s,x)=>s+x.w,0);
    h+=`<div class="grid g3 keep"><div class="stat"><div class="lbl">Staff</div><div class="num">${hired.length}</div></div><div class="stat"><div class="lbl">Coste/sem</div><div class="num" style="font-size:24px">${EUR(tot)}</div></div><div class="stat"><div class="lbl">% salarios</div><div class="num">${Math.round(tot/Math.max(1,wageBill(c))*100)}%</div></div></div>
    <div class="panel"><div class="hd"><h2>Tu equipo técnico</h2></div><div class="cards">${hired.map(s=>staffCard(s,'own')).join('')}</div></div>
    <div class="panel"><div class="hd"><h2>Candidatos disponibles</h2><span class="sub">Contratar sustituye al actual del mismo rol (indemnización 8 semanas)</span></div><div class="cards">${S.staff.market.map(s=>staffCard(s,'hire')).join('')}</div></div>`;
  }else if(UI.sub.club==='finance'){
    const W=wageBill(c),st=S.staff.hired.reduce((s,x)=>s+x.w,0)+academyCost(),att=attendance(c);
    h+=`<div class="grid g2" style="align-items:start"><div class="panel"><div class="hd"><h2>Balance semanal</h2></div>
     <div class="kv"><span>TV</span><b class="good">+${EUR(c.tv)}</b></div><div class="kv"><span>Patrocinio</span><b class="good">+${EUR(c.sp)}</b></div><div class="kv"><span>Taquilla (por partido en casa)</span><b class="good">+${EUR(att*c.price)}</b></div>
     <div class="kv"><span>Salarios</span><b class="bad">-${EUR(W)}</b></div><div class="kv"><span>Staff y cantera</span><b class="bad">-${EUR(st)}</b></div>
     <div class="kv"><span>Límite salarial</span><b>${EUR(wageLimit(c))}</b></div><div class="kv"><span>Fondos extra</span><button class="btn xs" data-act="askfunds">Pedir a la directiva</button></div><div class="kv"><span>Aforo ${c.stad}</span><b>${c.cap.toLocaleString('es')}</b></div></div>
    <div class="panel"><div class="hd"><h2>Entradas</h2><span class="num" style="font-size:26px" id="tkv">€${c.price.toFixed(1)}</span></div><label class="sr" for="tk">Precio de entradas</label><input id="tk" type="range" min="${Math.round(c.price0*0.4)}" max="${Math.round(c.price0*2)}" step="0.5" value="${c.price}">
     <div class="kv"><span>Asistencia estimada</span><b id="tka">${att.toLocaleString('es')} (${Math.round(att/c.cap*100)}%)</b></div><div class="kv"><span>Precio de referencia</span><b>€${c.price0.toFixed(1)}</b></div><p class="sub" style="margin-bottom:0">Subir el precio aumenta lo que paga cada aficionado pero baja la asistencia.</p></div></div>
    <div class="panel"><div class="hd"><h2>Movimientos recientes</h2></div><div class="scroll"><table><tr><th>Fecha</th><th>Concepto</th><th class="n">Importe</th></tr>${S.ledger.slice(0,14).map(l=>`<tr><td>${fmtD(l.t)}</td><td>${esc(l.txt)}</td><td class="n ${l.v<0?'bad':'good'}">${EUR(l.v)}</td></tr>`).join('')||'<tr><td colspan="3" class="empty">Sin movimientos.</td></tr>'}</table></div></div>`;
  }else{
    h+=`<div class="panel"><div class="hd"><h2>Identidad del club</h2><span class="sub">Edítala cuando quieras</span></div><div class="grid g2" style="align-items:start"><div><div class="field"><label for="id_suf">Nombre</label><input id="id_suf" type="text" maxlength="18" value="${esc(c.suf)}"></div><div class="field"><label for="id_short">Iniciales (salen en el escudo, 2 a 4)</label><input id="id_short" type="text" maxlength="4" autocomplete="off" autocapitalize="characters" value="${esc(c.short)}"></div><div class="field"><label for="id_stad">Estadio</label><input id="id_stad" type="text" maxlength="26" value="${esc(c.stad)}"></div>
    <div class="field"><label>Color principal</label><div class="row" style="gap:8px">${['#d4161d','#1a3a8c','#1f8a3c','#f2c200','#141414','#f2f2f0','#6cabdd','#7a1f3a','#f26b1d','#5a2a8c','#0f6e5a','#e8d9a0'].map(x=>`<button class="swatch ${c.c1===x?'on':''}" style="background:${x}" data-act="idc1" data-v="${x}" aria-label="Color ${x}"></button>`).join('')}</div></div>
    <div class="field"><label>Color secundario</label><div class="row" style="gap:8px">${['#d4161d','#1a3a8c','#1f8a3c','#f2c200','#141414','#f2f2f0','#6cabdd','#7a1f3a','#f26b1d','#5a2a8c','#0f6e5a','#e8d9a0'].map(x=>`<button class="swatch ${c.c2===x?'on':''}" style="background:${x}" data-act="idc2" data-v="${x}" aria-label="Color ${x}"></button>`).join('')}</div></div></div>
    <div><div class="row" style="justify-content:center;margin:6px 0">${crest(c,110)}</div><div class="field"><label>Escudo</label><div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap">${PAT_LIST.map(p=>`<button class="btn sm ${c.pat===p?'on':''}" data-act="idpat" data-v="${p}" aria-label="Diseño ${p+1}">${crest({...c,pat:p},30)}</button>`).join('')}</div><div class="lbl" style="margin:10px 0 6px">Forma</div><div class="row" style="gap:8px;flex-wrap:wrap;justify-content:center">${CREST_SHAPES.map((_,i)=>`<button class="btn sm ${(c.sh||0)===i?'on':''}" data-act="idsh" data-v="${i}" aria-label="Forma ${i+1}">${crest({...c,sh:i},30)}</button>`).join('')}</div></div></div></div></div>`;
  }
  return h;
}
/* ---------- LIGA ---------- */
function vLeague(){
  const c=userClub(),home=c?leagueOf(c.id):S.leagues[0];let lg=S.leagues[UI.f.lg!=null?UI.f.lg:home.id];
  let h=subnav('league',[['table','Tabla'],['cups','Copas'],['fixtures','Partidos'],['stats','Estadísticas'],['world','Mundo'],['history','Historia']]);
  const sel=`<select id="lgsel" aria-label="Liga" style="margin-bottom:10px">${S.leagues.map(l=>`<option value="${l.id}" ${l.id===lg.id?'selected':''}>${LG_BY_CC[l.cc].nm} · ${l.nm}</option>`).join('')}</select>`;
  if(UI.sub.league==='cups')return h+vCups();
  if(UI.sub.league==='table'||UI.sub.league==='world'){
    const t=sortedTable(lg),L=LG_BY_CC[lg.cc],n=t.length;
    h+=`<div class="panel"><div class="hd"><h2>${LG_BY_CC[lg.cc].nm} · ${lg.nm}</h2><span class="sub">${lg.rd}/${lg.sched.length} jornadas</span></div>${UI.sub.league==='world'?sel:''}<div class="scroll"><table><tr><th>#</th><th>Club</th><th class="n">PJ</th><th class="n">G</th><th class="n">E</th><th class="n">P</th><th class="n">DG</th><th class="n">Pts</th></tr>
    ${t.map((r,i)=>{const cl=S.clubs[r.id],zone=(lg.tier<4&&i>=n-L.ud)?'zone-dn':(lg.tier>1&&i<L.ud)?'zone-up':'';return `<tr class="${r.id===S.user?'me':''} ${zone} click" data-act="clubview" data-id="${r.id}"><td>${i+1}</td><td><div class="club">${crest(cl,24)}<span><b>${esc(cl.name)}</b></span></div></td><td class="n">${r.p}</td><td class="n">${r.w}</td><td class="n">${r.d}</td><td class="n">${r.l}</td><td class="n">${r.gf-r.ga}</td><td class="n"><b>${r.pts}</b></td></tr>`;}).join('')}</table></div>
    <div class="legend" style="margin-top:10px">${lg.tier<4?`<span><i style="background:var(--bad)"></i>descenso (${L.ud})</span>`:''}${lg.tier>1?`<span><i style="background:var(--good)"></i>ascenso (${L.ud})</span>`:''}</div></div>`;
  }else if(UI.sub.league==='fixtures'){
    if(!c)return h+'<div class="empty">Sin club.</div>';
    const cl=leagueOf(c.id),res=(S.mres||[]).filter(r=>r.Y===userYear()).slice(-12).reverse(),nxt=[];
    for(let i=cl.rd;i<cl.sched.length&&nxt.length<8;i++){const r=cl.sched[i],m=r.m.find(([a,b])=>a===c.id||b===c.id);if(m)nxt.push({t:r.t,h:m[0],a:m[1],rd:i+1});}
    h+=`<div class="grid g2" style="align-items:start"><div class="panel"><div class="hd"><h2>Próximos</h2></div>${nxt.map(m=>`<div class="kv"><span class="sub">${fmtD(m.t)} · J${m.rd}</span><span class="row nw" style="gap:6px">${clubTag(m.h,18)} <span class="mute">vs</span> ${clubTag(m.a,18)}</span></div>`).join('')||'<div class="empty">No quedan partidos.</div>'}</div>
    <div class="panel"><div class="hd"><h2>Resultados</h2></div>${res.map(m=>`<div class="kv"><span class="sub">${fmtD(m.t)}</span><span class="row nw" style="gap:6px">${m.comp?`<span class="chip">${esc(m.comp.split(' · ')[0].replace('Copa de ','Copa '))}</span>`:''}${esc(S.clubs[m.h].short)} <b>${m.hg}-${m.ag}</b>${m.pen?` (${m.pen.h}-${m.pen.a})`:''} ${esc(S.clubs[m.a].short)}</span></div>`).join('')||'<div class="empty">Aún sin partidos.</div>'}</div></div>`;
  }else if(UI.sub.league==='stats'){
    const ps=[];lg.ids.forEach(id=>S.clubs[id].players.forEach(i=>ps.push(S.players[i])));
    const sc=ps.filter(p=>p.g>0).sort((a,b)=>b.g-a.g).slice(0,10);
    const best=['GK','DEF','MID','FWD'].map(pos=>[pos,ps.filter(p=>p.pos===pos).sort((a,b)=>b.ovr-a.ovr).slice(0,{GK:1,DEF:4,MID:4,FWD:2}[pos])]);
    h+=`${sel}<div class="grid g2" style="align-items:start"><div class="panel"><div class="hd"><h2>Goleadores</h2></div>${sc.map((p,i)=>`<div class="kv nw" data-act="player" data-id="${p.id}" style="cursor:pointer"><span class="row nw" style="gap:8px"><span class="mute">${i+1}</span>${clubTag(p.club,18)}<b>${esc(sname(p))}</b></span><b>${p.g}</b></div>`).join('')||'<div class="empty">Nadie ha marcado aún.</div>'}</div>
    <div class="panel"><div class="hd"><h2>Mejor once de la liga</h2><span class="sub">por nivel</span></div>${best.map(([pos,l])=>`<div class="kv"><span>${posTag(pos)}</span><span style="text-align:right">${l.map(p=>`<a href="#" data-act="player" data-id="${p.id}">${esc(sname(p))}</a> ${p.ovr}`).join(' · ')}</span></div>`).join('')}</div></div>`;
  }else{
    const ch=S.hist.champs.filter(x=>S.leagues[x.lg].cc===lg.cc&&S.leagues[x.lg].tier===lg.tier).slice().reverse();
    h+=`${sel}<div class="panel"><div class="hd"><h2>Copas y torneos</h2></div>${(S.hist.tn||[]).slice().reverse().slice(0,18).map(x=>`<div class="kv"><span>${seasonLabel(x.Y,x.cal)} · ${esc(x.nm)}</span><span class="row nw" style="gap:8px">${clubTag(x.cid,20)}</span></div>`).join('')||'<div class="empty">Aún no se ha jugado ninguna final.</div>'}</div><div class="panel"><div class="hd"><h2>Campeones de liga</h2></div>${ch.map(x=>`<div class="kv"><span>${seasonLabel(x.Y)}</span><span class="row nw" style="gap:8px">${clubTag(x.cid,20)}<b>${x.pts} pts</b></span></div>`).join('')||'<div class="empty">Aún no hay campeones: la historia empieza con tu primera temporada.</div>'}</div>`;
  }
  return h;
}
/* ---------- CARRERA ---------- */
function vCareer(){
  const c=userClub();let h=subnav('career',[['profile','Perfil'],['inbox','Mensajes'],['jobs','Vacantes'],['history','Historial']]);
  if(UI.sub.career==='profile'){
    h+=`<div class="grid g3 keep"><div class="stat"><div class="lbl">Reputación</div><div class="num">${Math.round(S.mgr.rep)}</div>${fitBar(S.mgr.rep)}</div><div class="stat"><div class="lbl">Títulos</div><div class="num">${S.mgr.titles||0}</div></div><div class="stat"><div class="lbl">Temporadas</div><div class="num">${S.mgr.hist.length}</div></div></div>
    <div class="panel"><div class="hd"><h2>${esc(S.mgr.name)}</h2></div>${c?`<div class="kv"><span>Club actual</span><span>${clubTag(c.id,20)}</span></div><div class="kv"><span>Confianza de la directiva</span><b>${Math.round(c.board)}%</b></div>
    <p class="sub">Tu reputación abre puertas: con buenos resultados llegan ofertas de clubes más grandes, incluso de otros países. Si la directiva pierde la confianza, te despiden.</p><label class="chk" style="margin:10px 0"><input type="checkbox" data-act="optexact" ${S.opt&&S.opt.exact?"checked":""}> Mostrar medias exactas de todos los jugadores (quita el misterio del ojeo; desactivado por defecto)</label><button class="btn" data-act="expslot" data-v="${S.slot||0}">Exportar esta partida</button> <button class="btn danger" data-act="resign">Dimitir</button>`:`<p class="sub">Estás sin equipo. Revisa las vacantes o espera ofertas.</p>`}</div>`;
  }else if(UI.sub.career==='inbox'){
    h+=`<div class="panel"><div class="hd"><h2>Mensajes</h2></div>${S.inbox.slice(0,30).map(msgHTML).join('')||'<div class="empty">Bandeja vacía.</div>'}</div>`;
  }else if(UI.sub.career==='jobs'){
    const vac=S.clubs.filter(x=>x.mg===null),apps=(S.apps||[]).filter(a=>!a.done);
    h+=`<div class="panel"><div class="hd"><h2>Vacantes</h2><span class="sub">Clubes sin entrenador · tu reputación ${Math.round(S.mgr.rep)}</span></div>${vac.length?`<div class="scroll"><table><tr><th>Club</th><th>Liga</th><th class="n">Reputación</th><th class="n">Presupuesto</th><th></th></tr>${vac.sort((a,b)=>b.rep-a.rep).map(x=>{const ok=S.mgr.rep>=x.rep-22,ap=apps.some(a=>a.cid===x.id);
      return `<tr><td>${clubTag(x.id,22)}</td><td>${LG_BY_CC[x.cc].nm} · ${S.leagues[x.lg].nm}</td><td class="n">${Math.round(x.rep)}</td><td class="n">${EUR(x.budget)}</td><td class="n"><button class="btn xs ${ok?'pri':''}" data-act="apply" data-id="${x.id}" ${ap?'disabled':''}>${ap?'Enviada':ok?'Candidatura':'Poco probable'}</button></td></tr>`;}).join('')}</table></div>`:'<div class="empty">Ahora mismo no hay vacantes. Aparecen cuando los clubes destituyen a su entrenador.</div>'}</div>
    <div class="panel"><div class="hd"><h2>Competencia</h2><span class="sub">Entrenadores sin club</span></div>${S.mgrs.slice().sort((a,b)=>b.rep-a.rep).slice(0,8).map(m=>`<div class="kv"><span>${esc(m.n)}</span><b>${Math.round(m.rep)}</b></div>`).join('')}</div>`;
  }else{
    h+=historyHTML();
  }
  return h;
}
