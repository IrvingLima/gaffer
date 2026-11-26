"use strict";
/* ================= mercado global estilo FIFA: buscar en TODAS las ligas y ofertar por cualquiera ================= */
Object.assign(UI.f.mk,{pos:'ALL',sp:'ALL',nat:'ALL',cc:'ALL',minOvr:0,minPot:0,maxAge:40,minAge:0,q:'',price:'ALL',av:'ALL',sort:'ovr',dir:1,lim:40,preset:'ALL'});
UI.f.fa={pos:'ALL',sp:'ALL',sort:'ovr',dir:1,maxAge:40,minOvr:0,q:'',lim:40};

const contractCf=p=>p.ce<=S.Y?0.55:p.ce===S.Y+1?0.85:1;
/* precio orientativo (lo que el vendedor pedirá, sin cláusulas) */
function estFee(p){
  if(p.where==='free')return 0;
  return Math.round(approxValue(p)*contractCf(p)*dif().ask/1000)*1000;
}
function estWage(p){return Math.round(wageOf({...p,ovr:midOvr(p),pot:Math.max(midOvr(p),midPot(p))})*(p.where==='free'?1.25:1.05)/100)*100;}
/* 3 = alcanzable, 2 = el salario no cabe, 1 = no llega el presupuesto, 0 = ninguno */
function reachOf(p){
  const c=userClub(),fee=estFee(p),w=estWage(p);
  const okFee=fee<=c.budget,okWage=wageBill(c)+w<=wageLimit(c);
  return okFee&&okWage?3:okFee?2:okWage?1:0;
}
const canPrecontract=p=>{const c=userClub();return !!(p.club!=null&&p.club!==S.user&&p.where==='first'&&p.ce<=S.Y&&S.t>=dayOf(yOf(S.t),1,1)&&S.t<dayOf(S.Y+1,6,30)&&!p.pre&&c.players.length<27);};
const spGroupOf=k=>SPG[k];
function marketPool(F){
  const q=F.q.trim().toLowerCase(),out=[],c=userClub();
  const pass=(p,cl)=>{
    if(F.pos!=='ALL'&&p.pos!==F.pos)return false;
    if(F.sp!=='ALL'&&p.sp!==F.sp&&!(p.alt||[]).includes(F.sp))return false;
    if(F.nat!=='ALL'&&p.nat!==F.nat)return false;
    if(F.cc!=='ALL'&&(!cl||cl.cc!==F.cc))return false;
    if(p.age>F.maxAge||p.age<F.minAge)return false;
    if(midOvr(p)<F.minOvr||midPot(p)<F.minPot)return false;
    if(q&&!(p.name.toLowerCase().includes(q)||(cl&&cl.name.toLowerCase().includes(q))))return false;
    return true;
  };
  S.clubs.forEach(cl=>{if(cl.id===S.user)return;cl.players.forEach(id=>{const p=S.players[id];if(p&&pass(p,cl))out.push(p);});});
  return out;
}
function applyPreset(list,F){
  const c=userClub(),pre=F.preset;
  if(pre==='cheap'||F.price==='budget')return list.filter(p=>estFee(p)<=c.budget);
  if(pre==='gems')return list.filter(p=>p.age<=22&&midPot(p)-midOvr(p)>=8&&midPot(p)>=c.skill+4&&estFee(p)<=c.budget*1.0);
  if(pre==='exp')return list.filter(p=>p.ce<=S.Y);
  if(pre==='vets')return list.filter(p=>p.age>=29&&midOvr(p)>=c.skill-8&&estFee(p)<=c.budget);
  if(pre==='reach')return list.filter(p=>midOvr(p)>=c.skill-2&&reachOf(p)===3);
  return list;
}
function visiblePlayers(){
  const F=UI.f.mk;let list=applyPreset(marketPool(F),F);
  if(F.av==='exp')list=list.filter(p=>p.ce<=S.Y);
  if(typeof F.price==='number'&&F.price>0)list=list.filter(p=>estFee(p)<=F.price);
  const key={ovr:p=>midOvr(p),pot:p=>midPot(p),age:p=>-p.age,price:p=>estFee(p),growth:p=>midPot(p)-midOvr(p),wage:p=>estWage(p),deal:p=>(midOvr(p)+Math.max(0,midPot(p)-midOvr(p))*0.6)/Math.log10(estFee(p)+2e5)}[F.sort]||(p=>midOvr(p));
  const asc=(F.sort==='price'||F.sort==='wage')?-1:1; // precio y salario: lo barato primero por defecto
  const keyed=list.map(p=>[p,key(p)]);
  keyed.sort((x,y)=>(y[1]-x[1])*asc*F.dir);
  return keyed.map(x=>x[0]);
}
const rowReach=p=>{const r=reachOf(p);return r===3?'<span class="chip good" title="Entra en tu presupuesto y en tu límite salarial">Alcanzable</span>':r===2?'<span class="chip warn" title="Puedes pagar el traspaso, pero el salario supera el límite">Salario ✗</span>':r===1?'<span class="chip" title="El salario cabe pero el traspaso supera tu presupuesto">Caro</span>':'<span class="chip bad">Fuera de alcance</span>';};
function marketRow(p,free){
  const cl=p.club!=null?S.clubs[p.club]:null,fee=estFee(p),pre=!free&&canPrecontract(p);
  const lg=cl?`${LG_BY_CC[cl.cc].nm} · ${S.leagues[cl.lg].tier}ª`:'';
  return `<tr class="click" data-act="player" data-id="${p.id}"><td>${posTag(p.pos,p)}</td>
   <td><div class="pname"><b>${esc(p.name)}</b><span class="sub">${flag(p.nat,11)} ${p.nat} · ${free?'Agente libre':esc(clubLabel(p))+(lg?' · '+lg:'')}</span></div></td>
   <td class="n">${p.age}</td><td class="n">${ovrChip(p)}</td><td class="n gold">${showPot(p)}</td>
   <td class="n">${free?'<span class="chip info">Libre</span>':p.ce<=S.Y?'<span class="chip warn">Acaba</span>':'hasta '+(p.ce+1)}</td>
   <td class="n"><b>${free?'0':'≈ '+EUR(fee)}</b><div class="sub">${EUR(estWage(p))}/sem</div></td>
   <td>${rowReach(p)}</td>
   <td class="n" style="white-space:nowrap"><button class="btn xs ${S.short.includes(p.id)?'on':''}" data-act="short" data-id="${p.id}" aria-label="Lista corta">${ic('star','sm')}</button> <button class="btn xs pri" data-act="offer" data-id="${p.id}">${free?'Contrato':'Ofertar'}</button>${pre?` <button class="btn xs" data-act="pre" data-id="${p.id}" title="Su contrato acaba en junio: puedes pactar su llegada gratis">Pre</button>`:''}</td></tr>`;
}
const dirLabel=F=>{const lowFirst=(F.sort==='price'||F.sort==='wage');return F.dir===1?(lowFirst?'↑ Más barato primero':'↓ Mejor primero'):(lowFirst?'↓ Más caro primero':'↑ Peor primero');};
const SORTS=[['ovr','Nivel'],['pot','Potencial'],['growth','Margen de crecimiento'],['price','Precio'],['wage','Salario'],['age','Más joven'],['deal','Mejor relación calidad/precio']];
function spOptions(sel){return `<option value="ALL">Cualquier posición</option>`+Object.keys(SPL).map(k=>`<option value="${k}" ${sel===k?'selected':''}>${SPL[k]} · ${SPN[k]}</option>`).join('');}
function marketSearchHTML(){
  const F=UI.f.mk,c=userClub(),res=visiblePlayers(),room=wageLimit(c)-wageBill(c);
  const presets=[['ALL','Todo el mundo'],['reach','Alcanzables ahora'],['gems','Promesas baratas'],['exp','Fin de contrato'],['vets','Veteranos útiles'],['cheap','Dentro de mi presupuesto']];
  return `<div class="panel"><div class="hd"><h2>Mercado mundial</h2><span class="sub">${res.length.toLocaleString('es')} jugadores en ${LEAGUES.length} ligas · puedes ofertar por cualquiera</span></div>
   <div class="mkbudget"><div><div class="lbl">Presupuesto</div><b>${EUR(c.budget)}</b></div><div><div class="lbl">Margen salarial</div><b class="${room<0?'bad':''}">${EUR(room)}/sem</b></div><div><div class="lbl">Plantilla</div><b>${c.players.length}/27</b></div></div>
   <div class="chips" role="group" aria-label="Atajos">${presets.map(([k,l])=>`<button class="chipbtn ${F.preset===k?'on':''}" data-act="mkpreset" data-v="${k}">${l}</button>`).join('')}</div>
   <div class="mkgrid"><input id="mkq" type="search" aria-label="Buscar por nombre o club" placeholder="Nombre o club…" value="${esc(F.q)}">
    <select id="mksp" aria-label="Posición">${spOptions(F.sp)}</select>
    <select id="mkcc" aria-label="Liga o país"><option value="ALL">Todas las ligas</option>${LEAGUES.map(L=>`<option value="${L.cc}" ${F.cc===L.cc?'selected':''}>${L.nm}</option>`).join('')}</select>
    <select id="mknat" aria-label="Nacionalidad"><option value="ALL">Toda nacionalidad</option>${NATS.map(n=>`<option value="${n[0]}" ${F.nat===n[0]?'selected':''}>${n[1]}</option>`).join('')}</select>
    <select id="mkage" aria-label="Edad máxima">${[[40,'Cualquier edad'],[19,'≤ 19 años'],[21,'≤ 21 años'],[23,'≤ 23 años'],[27,'≤ 27 años'],[31,'≤ 31 años']].map(([v,l])=>`<option value="${v}" ${F.maxAge===v?'selected':''}>${l}</option>`).join('')}</select>
    <select id="mkmin" aria-label="Nivel mínimo">${[[0,'Cualquier nivel'],[55,'≥ 55'],[62,'≥ 62'],[68,'≥ 68'],[74,'≥ 74'],[80,'≥ 80']].map(([v,l])=>`<option value="${v}" ${F.minOvr===v?'selected':''}>${l}</option>`).join('')}</select>
    <select id="mkpot" aria-label="Potencial mínimo">${[[0,'Cualquier potencial'],[70,'Pot. ≥ 70'],[78,'Pot. ≥ 78'],[85,'Pot. ≥ 85']].map(([v,l])=>`<option value="${v}" ${F.minPot===v?'selected':''}>${l}</option>`).join('')}</select>
    <select id="mkprice" aria-label="Precio máximo"><option value="ALL">Cualquier precio</option>${[250000,1e6,3e6,8e6,2e7,5e7].map(v=>`<option value="${v}" ${F.price===v?'selected':''}>≤ ${EUR(v)}</option>`).join('')}</select>
    <select id="mksort" aria-label="Ordenar por">${SORTS.map(([k,l])=>`<option value="${k}" ${F.sort===k?'selected':''}>Ordenar: ${l}</option>`).join('')}</select>
    <button class="btn sm" data-act="mkdir" aria-label="Invertir orden">${dirLabel(F)}</button><button class="btn sm ghost" data-act="mkreset">Limpiar</button></div>
   <div class="scroll"><table class="mktable"><tr><th>Pos</th><th>Jugador</th><th class="n">Edad</th><th class="n">Nivel</th><th class="n">Pot.</th><th class="n">Contrato</th><th class="n">Precio</th><th></th><th></th></tr>
   ${res.slice(0,F.lim).map(p=>marketRow(p,false)).join('')||'<tr><td colspan="9" class="empty">Nada con esos filtros. Prueba «Todo el mundo» o relaja el precio.</td></tr>'}</table></div>
   ${res.length>F.lim?`<div style="text-align:center;margin-top:10px"><button class="btn" data-act="mkmore">Ver ${Math.min(40,res.length-F.lim)} más (${res.length-F.lim} restantes)</button></div>`:''}
   <p class="sub" style="margin-top:10px">El precio es orientativo: el club vendedor puede pedir más si es un jugador clave, o rebajar si le queda poco contrato. «Pre» = pre-contrato (gratis, llega en julio).</p></div>`;
}
function marketFreeHTML(){
  const F=UI.f.fa;let list=S.free.map(i=>S.players[i]).filter(p=>p&&p.where==='free');
  const q=F.q.trim().toLowerCase();
  list=list.filter(p=>(F.pos==='ALL'||p.pos===F.pos)&&(F.sp==='ALL'||p.sp===F.sp||(p.alt||[]).includes(F.sp))&&p.age<=F.maxAge&&midOvr(p)>=F.minOvr&&(!q||p.name.toLowerCase().includes(q)));
  const key={ovr:p=>midOvr(p),pot:p=>midPot(p),age:p=>-p.age,wage:p=>estWage(p),growth:p=>midPot(p)-midOvr(p)}[F.sort]||(p=>midOvr(p));
  list.sort((a,b)=>(key(b)-key(a))*F.dir);
  return `<div class="panel"><div class="hd"><h2>Agentes libres</h2><span class="sub">${list.length} disponibles · sin traspaso: solo salario y prima de fichaje</span></div>
   <div class="mkgrid"><input id="fa_q" type="search" aria-label="Buscar" placeholder="Nombre…" value="${esc(F.q)}">
    <select id="fa_sp" aria-label="Posición">${spOptions(F.sp)}</select>
    <select id="fa_age" aria-label="Edad máxima">${[[40,'Cualquier edad'],[21,'≤ 21 años'],[25,'≤ 25 años'],[30,'≤ 30 años']].map(([v,l])=>`<option value="${v}" ${F.maxAge===v?'selected':''}>${l}</option>`).join('')}</select>
    <select id="fa_min" aria-label="Nivel mínimo">${[[0,'Cualquier nivel'],[55,'≥ 55'],[62,'≥ 62'],[68,'≥ 68'],[74,'≥ 74']].map(([v,l])=>`<option value="${v}" ${F.minOvr===v?'selected':''}>${l}</option>`).join('')}</select>
    <select id="fa_sort" aria-label="Ordenar por">${[['ovr','Nivel'],['pot','Potencial'],['growth','Margen de crecimiento'],['wage','Salario pedido'],['age','Más joven']].map(([k,l])=>`<option value="${k}" ${F.sort===k?'selected':''}>Ordenar: ${l}</option>`).join('')}</select>
    <button class="btn sm" data-act="fadir">${dirLabel(F)}</button></div>
   <div class="scroll"><table class="mktable"><tr><th>Pos</th><th>Jugador</th><th class="n">Edad</th><th class="n">Nivel</th><th class="n">Pot.</th><th class="n">Contrato</th><th class="n">Pide</th><th></th><th></th></tr>
   ${list.slice(0,F.lim).map(p=>marketRow(p,true)).join('')||'<tr><td colspan="9" class="empty">Sin resultados.</td></tr>'}</table></div>
   ${list.length>F.lim?`<div style="text-align:center;margin-top:10px"><button class="btn" data-act="famore">Ver más (${list.length-F.lim})</button></div>`:''}</div>`;
}
/* ---- eventos ---- */
document.addEventListener('change',e=>{
  if(!S||UI.menu)return;const t=e.target,id=t.id;if(!id)return;const F=UI.f.mk,A=UI.f.fa;
  const set=(o,k,v,fn)=>{o[k]=fn?fn(v):v;o.lim=40;if(o===F)F.preset=F.preset;render();};
  if(id==='mkq')set(F,'q',t.value);else if(id==='mksp')set(F,'sp',t.value);else if(id==='mkcc')set(F,'cc',t.value);else if(id==='mknat')set(F,'nat',t.value);
  else if(id==='mkage')set(F,'maxAge',t.value,Number);else if(id==='mkmin')set(F,'minOvr',t.value,Number);else if(id==='mkpot')set(F,'minPot',t.value,Number);
  else if(id==='mkprice')set(F,'price',t.value,v=>v==='ALL'?'ALL':+v);else if(id==='mksort'){F.sort=t.value;F.dir=1;F.lim=40;render();}
  else if(id==='fa_q')set(A,'q',t.value);else if(id==='fa_sp')set(A,'sp',t.value);else if(id==='fa_age')set(A,'maxAge',t.value,Number);else if(id==='fa_min')set(A,'minOvr',t.value,Number);else if(id==='fa_sort'){A.sort=t.value;A.dir=1;A.lim=40;render();}
},true);
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');if(!b||!S||UI.menu)return;const a=b.dataset.act,v=b.dataset.v,F=UI.f.mk,A=UI.f.fa;
  if(a==='mkpreset'){F.preset=v;F.price='ALL';F.lim=40;if(v==='gems'){F.sort='growth';F.dir=1;}else if(v==='vets'||v==='cheap'||v==='reach'){F.sort='ovr';}else if(v==='exp'){F.sort='ovr';}render();e.stopImmediatePropagation();return;}
  if(a==='mkreset'){Object.assign(F,{pos:'ALL',sp:'ALL',nat:'ALL',cc:'ALL',minOvr:0,minPot:0,maxAge:40,q:'',price:'ALL',av:'ALL',sort:'ovr',dir:1,lim:40,preset:'ALL'});render();e.stopImmediatePropagation();return;}
  if(a==='mkdir'){F.dir=-F.dir;render();e.stopImmediatePropagation();return;}
  if(a==='mkmore'){F.lim+=40;render();e.stopImmediatePropagation();return;}
  if(a==='fadir'){A.dir=-A.dir;render();e.stopImmediatePropagation();return;}
  if(a==='famore'){A.lim+=40;render();e.stopImmediatePropagation();return;}
},true);
