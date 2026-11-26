"use strict";
/* ================= mercado en tarjetas con iconos e ilustración (mobile first) ================= */
Object.assign(ICONS,{
 wallet:'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 7l2-3h12M16 14h2',
 tag:'M3 12V4h8l9 9-8 8-9-9zM7.5 7.5h.01',
 gem:'M6 3h12l4 6-10 12L2 9l4-6zM2 9h20M9 3l-1 6 4 12 4-12-1-6',
 clock:'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
 trend:'M3 17l6-6 4 4 8-8M15 7h6v6',
 shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
 flame:'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',
 search:'M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z',
 filter:'M3 5h18l-7 8v6l-4-2v-4L3 5z',
 globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
 grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
 list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
 swap:'M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7',
 coin:'M12 8v8M9.5 10.5c.5-1 1.5-1.5 2.5-1.5s2.5.5 2.5 1.8-1.5 1.7-2.5 1.9-2.5.6-2.5 1.9 1.5 1.9 2.5 1.9 2-.5 2.5-1.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'
});
const PRESETS=[['ALL','globe','Todo el mundo','Sin atajos'],['reach','wallet','Alcanzables','Entran en tu presupuesto y salario'],['gems','gem','Promesas baratas','Jóvenes con margen'],['exp','clock','Fin de contrato','Acaban en junio'],['vets','flame','Veteranos útiles','Experiencia a buen precio'],['cheap','tag','Mi presupuesto','Todo lo que puedes pagar']];
function marketArt(){
  return `<svg class="mkart" viewBox="0 0 360 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
   <linearGradient id="mkg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--acc)" stop-opacity=".30"/><stop offset="1" stop-color="var(--acc)" stop-opacity="0"/></linearGradient>
   <linearGradient id="mkl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
   <rect width="360" height="120" fill="url(#mkg)"/>
   <g class="mk-lights">${[40,120,240,320].map(x=>`<g><rect x="${x-1.5}" y="26" width="3" height="60" fill="currentColor" opacity=".35"/><rect x="${x-9}" y="18" width="18" height="9" rx="2" fill="currentColor" opacity=".7"/><path d="M${x-9} 27L${x-26} 110H${x+26}L${x+9} 27Z" fill="url(#mkl)"/></g>`).join('')}</g>
   <path d="M0 100Q180 70 360 100V120H0Z" fill="currentColor" opacity=".10"/>
   <path d="M30 104Q180 84 330 104" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="4 4"/>
   <g class="mk-swap"><circle cx="180" cy="62" r="22" fill="var(--s1)" stroke="var(--acc)" stroke-width="2"/>
   <path d="M168 58h20l-5-5M192 66h-20l5 5" fill="none" stroke="var(--acc)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>
   <circle class="mk-coin c1" cx="120" cy="40" r="5" fill="var(--gold)"/><circle class="mk-coin c2" cx="250" cy="48" r="4" fill="var(--gold)"/><circle class="mk-coin c3" cx="210" cy="30" r="3" fill="var(--gold)"/></svg>`;
}
let _pc=null;
function presetCounts(){
  const c=userClub(),key=Math.floor(S.t/7)+'|'+Math.round(c.budget/1e4)+'|'+wageBill(c)+'|'+S.user;
  if(_pc&&_pc.k===key)return _pc.v;
  const v={reach:0,gems:0,exp:0,vets:0,cheap:0,ALL:0},room=wageLimit(c)-wageBill(c);
  S.clubs.forEach(cl=>{if(cl.id===S.user)return;cl.players.forEach(id=>{const p=S.players[id];if(!p)return;
    v.ALL++;const fee=estFee(p),aff=fee<=c.budget;
    if(aff){v.cheap++;if(midOvr(p)>=c.skill-2&&estWage(p)<=room)v.reach++;if(p.age<=22&&midPot(p)-midOvr(p)>=8&&midPot(p)>=c.skill+4)v.gems++;if(p.age>=29&&midOvr(p)>=c.skill-8)v.vets++;}
    if(p.ce<=S.Y)v.exp++;});});
  _pc={k:key,v};return v;
}
function activeFilters(F){return ['pos','sp','nat','cc'].filter(k=>F[k]!=='ALL').length+(F.maxAge<40?1:0)+(F.minOvr>0?1:0)+(F.minPot>0?1:0)+(typeof F.price==='number'?1:0)+(F.q?1:0);}
function filterGrid(F){
  return `<div class="mkgrid"><input id="mkq" type="search" aria-label="Buscar por nombre o club" placeholder="Nombre o club…" value="${esc(F.q)}">
    <select id="mksp" aria-label="Posición">${spOptions(F.sp)}</select>
    <select id="mkcc" aria-label="Liga o país"><option value="ALL">Todas las ligas</option>${LEAGUES.map(L=>`<option value="${L.cc}" ${F.cc===L.cc?'selected':''}>${L.nm}</option>`).join('')}</select>
    <select id="mknat" aria-label="Nacionalidad"><option value="ALL">Toda nacionalidad</option>${NATS.map(n=>`<option value="${n[0]}" ${F.nat===n[0]?'selected':''}>${n[1]}</option>`).join('')}</select>
    <select id="mkage" aria-label="Edad máxima">${[[40,'Cualquier edad'],[19,'≤ 19 años'],[21,'≤ 21 años'],[23,'≤ 23 años'],[27,'≤ 27 años'],[31,'≤ 31 años']].map(([v,l])=>`<option value="${v}" ${F.maxAge===v?'selected':''}>${l}</option>`).join('')}</select>
    <select id="mkmin" aria-label="Nivel mínimo">${[[0,'Cualquier nivel'],[55,'≥ 55'],[62,'≥ 62'],[68,'≥ 68'],[74,'≥ 74'],[80,'≥ 80']].map(([v,l])=>`<option value="${v}" ${F.minOvr===v?'selected':''}>${l}</option>`).join('')}</select>
    <select id="mkpot" aria-label="Potencial mínimo">${[[0,'Cualquier potencial'],[70,'Pot. ≥ 70'],[78,'Pot. ≥ 78'],[85,'Pot. ≥ 85']].map(([v,l])=>`<option value="${v}" ${F.minPot===v?'selected':''}>${l}</option>`).join('')}</select>
    <select id="mkprice" aria-label="Precio máximo"><option value="ALL">Cualquier precio</option>${[250000,1e6,3e6,8e6,2e7,5e7].map(v=>`<option value="${v}" ${F.price===v?'selected':''}>≤ ${EUR(v)}</option>`).join('')}</select>
    <select id="mksort" aria-label="Ordenar por">${SORTS.map(([k,l])=>`<option value="${k}" ${F.sort===k?'selected':''}>Ordenar: ${l}</option>`).join('')}</select>
    <button class="btn sm" data-act="mkdir" aria-label="Invertir orden">${dirLabel(F)}</button><button class="btn sm ghost" data-act="mkreset">Limpiar</button></div>`;
}
function marketCard(p,free){
  const cl=p.club!=null?S.clubs[p.club]:null,fee=estFee(p),pre=!free&&canPrecontract(p),t=tierOf(midOvr(p)),rg=showOvr(p).includes('–');
  const reach=reachOf(p),lgn=cl?`${LG_BY_CC[cl.cc].nm} · ${S.leagues[cl.lg].tier}ª div.`:'',s=seen(p);
  const pot=s.e2===0?p.pot:midPot(p),ovr=midOvr(p);
  const rcls=reach===3?'ok':reach===0?'no':'mid',rtxt=reach===3?'Alcanzable':reach===2?'Salario ✗':reach===1?'Caro':'Fuera de alcance';
  const chips=[free?'<span class="chip info">Agente libre</span>':p.ce<=S.Y?'<span class="chip warn">Acaba contrato</span>':'',p.age<=21&&pot-ovr>=10?'<span class="chip gold">Perla</span>':'',(p.ps||[]).slice(0,1).map(k=>s.k>=40&&PLAYSTYLES[k]?`<span class="chip ps">${PLAYSTYLES[k].nm}</span>`:'').join('')].join('');
  return `<article class="mcard ${t}" data-act="player" data-id="${p.id}" tabindex="0">
   <div class="mc-top"><div class="mc-ovr ${t} ${rg?'rg':''}"><b>${showOvr(p)}</b><small>${p.sp?SPL[p.sp]:POSL[p.pos]}</small></div>
    <div class="mc-id"><b class="ellip">${esc(p.name)}${deltaChip(p)}</b><div class="sub">${flag(p.nat,11)} ${NAT[p.nat]?NAT[p.nat].nm:p.nat} · ${p.age} años</div>
     <div class="mc-club">${cl?crest(cl,18):''}<span class="ellip">${free?'Sin club':esc(clubLabel(p))}</span>${lgn?`<span class="sub"> · ${lgn}</span>`:''}</div></div>
    <div class="mc-price ${rcls}"><b>${free?'Gratis':EUR(fee)}</b><span>${EUR(estWage(p))}/sem</span></div></div>
   <div class="mc-mid"><div class="mc-pot" title="Nivel ${showOvr(p)} · potencial ${showPot(p)}"><i class="cur" style="width:${clamp(ovr,0,100)}%"></i><i class="pt" style="left:${clamp(pot,0,100)}%"></i></div><span class="sub">pot. ${showPot(p)}</span>${chips}</div>
   <div class="mc-act"><span class="reach ${rcls}">${rtxt}</span><span class="grow"></span>
    <button class="btn xs ${S.short.includes(p.id)?'on':''}" data-act="short" data-id="${p.id}" aria-label="Lista corta">${ic('star','sm')}</button>
    ${pre?`<button class="btn xs" data-act="pre" data-id="${p.id}" title="Su contrato acaba en junio: llega gratis">Pre-contrato</button>`:''}
    <button class="btn xs pri" data-act="offer" data-id="${p.id}">${free?'Contrato':'Ofertar'}</button></div></article>`;
}
function marketSearchHTML(){
  const F=UI.f.mk,c=userClub(),res=visiblePlayers(),room=wageLimit(c)-wageBill(c),w=winInfo(c.cc,S.t),cnt=presetCounts(),na=activeFilters(F);
  const view=F.view||'cards';
  return `<div class="mkhero">${marketArt()}<div class="mkhero-in"><div class="lbl">Mercado mundial</div><h2>Fichajes</h2>
    <div class="sub">${cnt.ALL.toLocaleString('es')} jugadores en ${LEAGUES.length} ligas · ofertas a cualquiera</div></div></div>
   <div class="mkstats"><div class="mks">${ic('wallet')}<div><div class="lbl">Presupuesto</div><b>${EUR(c.budget)}</b></div></div>
    <div class="mks">${ic('coin')}<div><div class="lbl">Margen salarial</div><b class="${room<0?'bad':''}">${EUR(room)}/sem</b></div></div>
    <div class="mks">${ic('users')}<div><div class="lbl">Plantilla</div><b>${c.players.length}/27</b></div></div>
    <div class="mks">${ic('clock')}<div><div class="lbl">Ventana</div><b class="${w.open?'good':'bad'}">${w.open?'Abierta · '+w.left+' d':'Cierra · abre en '+w.left+' d'}</b></div></div></div>
   <div class="presets" role="group" aria-label="Atajos">${PRESETS.map(([k,i,t,d])=>`<button class="ptile ${F.preset===k?'on':''}" data-act="mkpreset" data-v="${k}">${ic(i)}<b>${t}</b><span>${k==='ALL'?cnt.ALL.toLocaleString('es'):(cnt[k]||0).toLocaleString('es')}</span></button>`).join('')}</div>
   <div class="panel"><div class="mkbar"><button class="btn sm ${F.fopen?'on':''}" data-act="mkfilters">${ic('filter','sm')} Filtros${na?` (${na})`:''}</button><span class="sub">${res.length.toLocaleString('es')} resultados</span><span class="grow"></span>
     <div class="seg"><button class="${view==='cards'?'on':''}" data-act="mkview" data-v="cards" aria-label="Tarjetas">${ic('grid','sm')}</button><button class="${view==='list'?'on':''}" data-act="mkview" data-v="list" aria-label="Lista">${ic('list','sm')}</button></div></div>
    ${F.fopen?filterGrid(F):''}
    ${view==='cards'?`<div class="mcards">${res.slice(0,F.lim).map(p=>marketCard(p,false)).join('')||'<div class="empty">Nada con esos filtros. Prueba «Todo el mundo» o sube el precio máximo.</div>'}</div>`
    :`<div class="scroll"><table class="mktable"><tr><th>Pos</th><th>Jugador</th><th class="n">Edad</th><th class="n">Nivel</th><th class="n">Pot.</th><th class="n">Contrato</th><th class="n">Precio</th><th></th><th></th></tr>${res.slice(0,F.lim).map(p=>marketRow(p,false)).join('')||'<tr><td colspan="9" class="empty">Nada con esos filtros.</td></tr>'}</table></div>`}
    ${res.length>F.lim?`<div style="text-align:center;margin-top:12px"><button class="btn" data-act="mkmore">Ver ${Math.min(40,res.length-F.lim)} más (${res.length-F.lim} restantes)</button></div>`:''}
    <p class="sub" style="margin:12px 0 0">El precio es orientativo: el vendedor puede pedir más si es un jugador clave o rebajar si le queda poco contrato.</p></div>`;
}
function marketFreeHTML(){
  const F=UI.f.fa;let list=S.free.map(i=>S.players[i]).filter(p=>p&&p.where==='free');
  const q=F.q.trim().toLowerCase();
  list=list.filter(p=>(F.pos==='ALL'||p.pos===F.pos)&&(F.sp==='ALL'||p.sp===F.sp||(p.alt||[]).includes(F.sp))&&p.age<=F.maxAge&&midOvr(p)>=F.minOvr&&(!q||p.name.toLowerCase().includes(q)));
  const key={ovr:p=>midOvr(p),pot:p=>midPot(p),age:p=>-p.age,wage:p=>estWage(p),growth:p=>midPot(p)-midOvr(p)}[F.sort]||(p=>midOvr(p));
  list.sort((a,b)=>(key(b)-key(a))*F.dir);
  const stars=list.filter(p=>p.fc==='star').length,gems=list.filter(p=>p.fc==='gem').length;
  return `<div class="mkhero">${marketArt()}<div class="mkhero-in"><div class="lbl">Sin traspaso</div><h2>Agentes libres</h2><div class="sub">${list.length} disponibles · ${stars} estrellas · ${gems} promesas liberadas</div></div></div>
   <div class="panel"><div class="mkgrid"><input id="fa_q" type="search" aria-label="Buscar" placeholder="Nombre…" value="${esc(F.q)}">
    <select id="fa_sp" aria-label="Posición">${spOptions(F.sp)}</select>
    <select id="fa_age" aria-label="Edad máxima">${[[40,'Cualquier edad'],[21,'≤ 21 años'],[25,'≤ 25 años'],[30,'≤ 30 años']].map(([v,l])=>`<option value="${v}" ${F.maxAge===v?'selected':''}>${l}</option>`).join('')}</select>
    <select id="fa_min" aria-label="Nivel mínimo">${[[0,'Cualquier nivel'],[55,'≥ 55'],[62,'≥ 62'],[68,'≥ 68'],[74,'≥ 74']].map(([v,l])=>`<option value="${v}" ${F.minOvr===v?'selected':''}>${l}</option>`).join('')}</select>
    <select id="fa_sort" aria-label="Ordenar por">${[['ovr','Nivel'],['pot','Potencial'],['growth','Margen de crecimiento'],['wage','Salario pedido'],['age','Más joven']].map(([k,l])=>`<option value="${k}" ${F.sort===k?'selected':''}>Ordenar: ${l}</option>`).join('')}</select>
    <button class="btn sm" data-act="fadir">${dirLabel(F)}</button></div>
   <div class="mcards">${list.slice(0,F.lim).map(p=>marketCard(p,true)).join('')||'<div class="empty">Sin resultados.</div>'}</div>
   ${list.length>F.lim?`<div style="text-align:center;margin-top:12px"><button class="btn" data-act="famore">Ver más (${list.length-F.lim})</button></div>`:''}</div>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');if(!b||!S||UI.menu)return;const a=b.dataset.act,F=UI.f.mk;
  if(a==='mkfilters'){F.fopen=!F.fopen;render();e.stopImmediatePropagation();e.preventDefault();return;}
  if(a==='mkview'){F.view=b.dataset.v;render();e.stopImmediatePropagation();e.preventDefault();return;}
},true);
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.classList&&e.target.classList.contains('mcard')){e.preventDefault();e.target.click();}});
