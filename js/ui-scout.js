"use strict";
/* ================= centro de ojeo: encargos, progreso e informes ================= */
MSG_TYPES.scoutrep=['Ojeo','acc'];
const scoutUnread=()=>S&&S.inbox?S.inbox.filter(m=>m.ty==='scoutrep'&&!m.done).length:0;
const SC_ONLY={all:'Cualquiera',ending:'Libres o último año'};
const critText=m=>[m.pos==='ALL'?'Todas las posiciones':POSL[m.pos],'≤'+m.maxAge+' años',m.minPot?'potencial '+m.minPot+'+':'',m.maxVal?'hasta '+EUR(m.maxVal):'',m.only==='ending'?'libres o último año':''].filter(Boolean).join(' · ');
mMission=function(){
  const sc=scoutsList(),M=UI.mis||{};
  const seg=(label,act,items,cur)=>`<div class="field"><label>${label}</label><div class="seg setseg">${items.map(([v,l])=>`<button class="${cur===v?'on':''}" aria-pressed="${cur===v}" data-act="${act}" data-v="${v}">${l}</button>`).join('')}</div></div>`;
  return modalShell('Encargo de ojeo',`<div class="field"><label for="ms_sc">Ojeador</label><select id="ms_sc">${sc.map(s=>`<option value="${s.id}" ${M.sid===s.id?'selected':''}>${esc(s.nm)} · nivel ${s.ab} · conoce ${NAT[M.nat||'ES']?s.kn[M.nat||'ES']:0}/20</option>`).join('')}</select></div>
   <div class="field"><label for="ms_nat">Nación</label><select id="ms_nat">${NATS.map(n=>`<option value="${n[0]}" ${M.nat===n[0]?'selected':''}>${n[1]} (${REGIONS[n[2]]})</option>`).join('')}</select></div>
   ${seg('Posición','mspos',['ALL','GK','DEF','MID','FWD'].map(k=>[k,k==='ALL'?'Todas':POSL[k]]),M.pos||'ALL')}
   ${seg('Edad máxima','msage',[[18,'≤18'],[21,'≤21'],[23,'≤23'],[30,'≤30'],[40,'Todas']],M.maxAge||23)}
   ${seg('Potencial mínimo','mspot',[[0,'Cualquiera'],[70,'70+'],[78,'78+'],[85,'85+']],M.minPot||0)}
   ${seg('Precio máximo','msval',[[0,'Sin límite'],[1000000,'1M'],[5000000,'5M'],[15000000,'15M'],[40000000,'40M']],M.maxVal||0)}
   ${seg('Contrato','msonly',Object.entries(SC_ONLY),M.only||'all')}
   ${seg('Informe cada','msevery',[[1,'1 sem'],[2,'2 sem'],[4,'4 sem']],M.every||2)}
   ${seg('Duración','msdur',[[0,'Indefinida'],[4,'4 sem'],[8,'8 sem'],[16,'16 sem']],M.dur||0)}
   <p class="sub">Recibirás un aviso con cada informe, aunque no haya resultados. Fuera de su región el viaje cuesta más y un ojeador rinde mejor en las naciones que conoce.</p><div class="row" style="justify-content:flex-end"><button class="btn" data-act="mclose">Cancelar</button><button class="btn pri" data-act="msdo">Enviar ojeador</button></div>`,'settings');
};
function scoutsTabHTML(){
  const sc=scoutsList();
  const cards=sc.map(s=>{
    const m=S.scout.miss[s.id],best=Object.entries(s.kn).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k,v])=>`${NAT[k]?NAT[k].nm:k} ${v}`).join(' · ');
    let mis='<div class="why">Sin encargo: no está buscando a nadie.</div>';
    if(m){
      const every=m.every||2,next=m.dur?Math.min(every-(m.wk%every),Math.max(0,m.dur-m.wk)):every-(m.wk%every),prog=m.dur?Math.min(100,m.wk/m.dur*100):((m.wk%every)/every)*100,f=m.follow&&S.players[m.follow];
      mis=`<div class="scmis"><div class="row spread"><b>${f?'Siguiendo a '+esc(f.name):flag(m.nat,12)+' '+NAT[m.nat].nm}</b><span class="chip good">Semana ${m.wk}${m.dur?' de '+m.dur:''}</span></div>
        <div class="sub">${f?'Conocimiento '+(S.know[f.id]||0)+'%':critText(m)}</div><div class="wbar" style="margin:6px 0"><i style="width:${f?(S.know[f.id]||0):prog}%"></i></div>
        <div class="sub">${f?'Avisa al completar el informe.':`${(m.found||[]).length} jugadores vistos · próximo informe en ${next} semana${next===1?'':'s'}`}</div></div>`;
    }
    return `<div class="msg"><div class="row spread"><div><b>${esc(s.nm)}</b><div class="sub">${NAT[s.nat].nm} · ${s.age} años · ${EUR(s.w)}/sem</div></div><span class="chip acc">Nivel ${s.ab}</span></div>
      <div class="grid g3 keep" style="margin:10px 0"><div><div class="lbl">Juzgar nivel</div><div class="num" style="font-size:22px">${s.ja}</div></div><div><div class="lbl">Juzgar potencial</div><div class="num" style="font-size:22px">${s.jp}</div></div><div><div class="lbl">Adaptación</div><div class="num" style="font-size:22px">${s.ad}</div></div></div>
      <div class="sub">Conoce mejor: ${best}</div>${mis}<div class="row" style="margin-top:8px;gap:8px;justify-content:flex-end">${m?`<button class="btn sm" data-act="msstop" data-id="${s.id}">Retirar</button>`:''}<button class="btn sm pri" data-act="mission" data-id="${s.id}">${m?'Cambiar encargo':'Enviar a ojear'}</button></div></div>`;}).join('');
  return `<div class="panel"><div class="hd"><h2>Ojeadores</h2><button class="btn sm" data-act="goto" data-v="club:staff">Contratar más</button></div>${sc.length?cards:'<div class="empty">No tienes ojeadores. Contrata en Club → Staff.</div>'}</div>`;
}
function scoutCard(pid){
  const p=S.players[pid];if(!p||p.where==='retired'||p.club===S.user)return '';
  const g=scoutGrade(p),k=S.know[p.id]||0,free=p.club==null,pool=p.where==='pool';
  return `<article class="scard" data-act="player" data-id="${p.id}" tabindex="0"><div class="row nw" style="gap:10px"><div class="mc-ovr ${tierOf(midOvr(p))} ${seen(p).e1===0?'':'rg'}"><b>${showOvr(p)}</b><small>${p.sp?SPL[p.sp]:POSL[p.pos]}</small></div>
    <div class="grow" style="min-width:0"><b class="ellip">${esc(p.name)}</b><div class="sub">${flag(p.nat,11)} ${p.age} años · pot. ${showPot(p)}</div><div class="sub ellip">${esc(clubLabel(p))}</div></div><div class="mc-price"><b>${free&&!pool?'Libre':EUR(estFee(p))}</b><span>${EUR(estWage(p))}/sem</span></div></div>
    <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><span class="chip ${g.cls}">${g.l}</span><span class="sub grow">${g.why}</span></div>
    <div class="row nw" style="gap:8px;margin-top:6px"><span class="sub">Conocimiento</span><div class="wbar grow" style="flex:1"><i style="width:${k}%"></i></div><span class="sub">${k}%</span></div>
    <div class="row" style="gap:8px;justify-content:flex-end;margin-top:8px"><button class="btn xs ${S.short.includes(p.id)?'on':''}" data-act="short" data-id="${p.id}">${ic('star','sm')} Seguir en lista</button>${k<100?`<button class="btn xs" data-act="followm" data-id="${p.id}">Informe completo</button>`:''}<button class="btn xs pri" data-act="offer" data-id="${p.id}">Fichar</button></div></article>`;
}
function scoutReportsHTML(){
  const D=S.scout.deliv||[];
  const html=D.slice(0,12).map((r,i)=>{
    const cards=r.pids.map(scoutCard).join(''),isNew=!r.read,open=isNew||i===0;
    return `<details class="screp ${isNew?'new':''}" ${open?'open':''}><summary><span class="grow"><b>${NAT[r.nat]?flag(r.nat,12)+' '+NAT[r.nat].nm:r.nat}</b> · ${esc(r.sname)}<span class="sub"> · ${fmtD(r.t)} · ${r.pids.length?r.pids.length+' jugador'+(r.pids.length===1?'':'es'):'sin resultados'}</span></span>${isNew?'<span class="chip acc">Nuevo</span>':''}${r.done?'<span class="chip">Terminada</span>':''}</summary>
      ${r.note&&!r.follow?`<div class="why">${esc(r.note)}</div>`:''}${cards?`<div class="mcards">${cards}</div>`:(r.pids.length?'<div class="sub">Esos jugadores ya no están disponibles.</div>':`<div class="row" style="justify-content:flex-end"><button class="btn sm pri" data-act="mission" data-id="${r.sid}">Cambiar el encargo</button></div>`)}</details>`;}).join('');
  D.forEach(r=>{r.read=true;});
  S.inbox.forEach(m=>{if(m.ty==='scoutrep')m.done=true;});
  return `<div class="panel"><div class="hd"><h2>Informes recibidos</h2><span class="sub">${D.length}</span></div>${html||'<div class="empty">Todavía no hay informes. Envía a un ojeador desde la pestaña Ojeadores: te avisaremos cuando responda.</div>'}</div>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');if(!b||!S)return;const a=b.dataset.act,v=b.dataset.v;
  const stop=()=>{e.stopImmediatePropagation();e.preventDefault();};
  if(a==='resp'){const m=S.inbox.find(x=>x.id===+b.dataset.id);if(!m||m.ty!=='scoutrep')return;stop();m.done=true;
    const r=(S.scout.deliv||[]).find(x=>x.id===m.rep);
    if(v==='see'){UI.m=null;$('#modalRoot').innerHTML='';UI.tab='scout';UI.sub.scout='reports';save();render();window.scrollTo(0,0);}
    else{if(r)r.read=true;save();render();}}
  else if(a==='msval'||a==='msonly'||a==='msevery'||a==='msdur'){stop();syncMis();UI.mis[{msval:'maxVal',msonly:'only',msevery:'every',msdur:'dur'}[a]]=a==='msonly'?v:+v;renderModal();}
  else if(a==='mission'){stop();const sid=+b.dataset.id,old=S.scout.miss[sid]||{};UI.mis={sid,nat:old.nat||UI.sel.nat||userClub().cc,pos:old.pos||'ALL',maxAge:old.maxAge||23,minPot:old.minPot||0,maxVal:old.maxVal||0,only:old.only||'all',every:old.every||2,dur:old.dur||0};openModal({type:'mission'});}
  else if(a==='msstop'){stop();delete S.scout.miss[+b.dataset.id];save();render();toast('Encargo retirado.');}
},true);
