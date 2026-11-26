"use strict";
/* ================= modales ================= */
function renderModal(){
  const m=UI.m,root=$('#modalRoot');if(!m){root.innerHTML='';return;}
  let html='';
  if(m.type==='player')html=mPlayer(m.pid);
  else if(m.type==='offer')html=mOffer(m.pid);
  else if(m.type==='dd')html=mDeadline();
  else if(m.type==='slotpick')html=mSlotPick(m.i);
  else if(m.type==='renew')html=mRenew(m.pid);
  else if(m.type==='loan')html=mLoan(m.pid);
  else if(m.type==='mission')html=mMission(m);
  else if(m.type==='follow')html=mFollow(m.pid);
  else if(m.type==='inbox')html=modalShell('Decisiones y mensajes',`${S.inbox.filter(x=>!x.done&&DECISIONS.includes(x.ty)).map(msgHTML).join('')||'<div class="empty">No tienes decisiones pendientes.</div>'}<h3 style="margin-top:14px">Recientes</h3>${S.inbox.filter(x=>x.done||!DECISIONS.includes(x.ty)).slice(0,8).map(msgHTML).join('')}`);
  else if(m.type==='summary')html=mSummary();
  else if(m.type==='clubview')html=mClub(m.cid);
  else if(m.type==='confirm')html=modalShell('Confirmar',`<p style="font-size:16px">${esc(m.msg)}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-act="mclose">Cancelar</button><button class="btn ${m.danger?'danger':'pri'}" data-act="confirmyes">${esc(m.label)}</button></div>`,'narrow');
  else if(m.type==='counter')html=mCounter(m.mid);
  else if(m.type==='match')return;
  const first=!root.firstChild||UI._mt!==m.type+(m.pid||m.cid||'');root.innerHTML=html;a11y(root);
  if(first){UI._mt=m.type+(m.pid||m.cid||'');const b=root.querySelector('.box .xbtn')||root.querySelector('.box .btn');if(b)b.focus({preventScroll:true});}
}
function ownerCtx(p){return p.club===S.user&&p.where==='first'?'own':p.where==='acad'?'acad':p.where==='loan'?'loan':'other';}
function mPlayer(pid){
  const p=S.players[pid];if(!p)return modalShell('Jugador','<div class="empty">No existe.</div>');
  const ctx=ownerCtx(p),s=seen(p),c=userClub();
  const cl=p.club!=null&&S.clubs[p.club]?clubTag(p.club,22):esc(clubLabel(p));
  let acts='';
  if(ctx==='own')acts=`<button class="btn sm" data-act="lock" data-id="${p.id}">Rol: ${p.lock==='start'?'Titular':p.lock==='rest'?'Descanso':'Auto'}</button><button class="btn sm pri" data-act="renew" data-id="${p.id}">Renovar</button><button class="btn sm" data-act="tl" data-id="${p.id}">${p.tl?'Quitar de venta':'Poner en venta'}</button><button class="btn sm" data-act="sellp2" data-id="${p.id}">Vender ${EUR(sellPrice(p))}</button><button class="btn sm danger" data-act="release2" data-id="${p.id}">Liberar</button>`;
  else if(ctx==='acad')acts=`<button class="btn pri sm" data-act="promote" data-id="${p.id}">Ascender</button><button class="btn sm" data-act="loanm" data-id="${p.id}">Ceder</button><button class="btn sm" data-act="sellp" data-id="${p.id}">Vender ${EUR(sellPrice(p))}</button><button class="btn sm danger" data-act="release" data-id="${p.id}">Liberar</button>`;
  else if(ctx==='loan')acts=`<button class="btn sm" data-act="recall" data-id="${p.id}">Repatriar</button>`;
  else acts=`<button class="btn pri" data-act="offer" data-id="${p.id}">${p.where==='free'?'Ofrecer contrato':'Hacer oferta'}</button>${(typeof canPrecontract==='function'&&canPrecontract(p))?`<button class="btn" data-act="pre" data-id="${p.id}" title="Su contrato acaba en junio">Pre-contrato (gratis)</button>`:''}<button class="btn ${S.short.includes(p.id)?'on':''}" data-act="short" data-id="${p.id}">${ic('star','sm')} ${S.short.includes(p.id)?'En lista corta':'Lista corta'}</button>${scoutsList().length?`<button class="btn" data-act="followm" data-id="${p.id}">${ic('eye','sm')} Seguir con ojeador</button>`:''}${p.club!=null&&S.clubs[p.club]?`<button class="btn ghost" data-act="clubview" data-id="${p.club}">Ver club</button>`:''}`;
  return modalShell(p.name,`<div class="grid g2" style="align-items:start"><div>${radar(p,230)}</div><div>
   <div class="row" style="gap:6px;margin-bottom:10px">${posTag(p.pos,p)}<span class="chip">${flag(p.nat,12)} ${NAT[p.nat].nm}</span><span class="chip">${p.age} años</span><span class="chip ${rateOf(p)>=1.2?'good':rateOf(p)<0.9?'bad':''}" title="${esc(TRAITS[p.tr][2])}">${traitOf(p)}</span>${p.tl?'<span class="chip info">En venta</span>':''}${p.h?'<span class="chip gold">Cantera</span>':''}${confChip(p)}</div>
   ${roleBlock(p)}
   ${evolBlock(p)}
   <div class="row" style="gap:12px;margin-bottom:8px"><div><div class="lbl">Nivel</div><div class="num" style="font-size:44px;line-height:1">${showOvr(p)}</div></div><div style="flex:1">${potBar(p)}</div></div>
   <div class="kv"><span>Club</span><span>${cl}</span></div><div class="kv"><span>Contrato</span><b>30 jun ${p.ce+1}</b></div><div class="kv"><span>Salario</span><b>${s.e1===0||ctx!=='other'?EUR(p.w)+'/sem':'≈ '+EUR(wageOf({...p,ovr:midOvr(p),pot:midPot(p)}))+'/sem'}</b></div><div class="kv"><span>Valor</span><b>${ctx==='other'?'≈ ':''}${EUR(ctx==='other'?approxValue(p):valueOf(p))}</b></div>
   ${ctx!=='other'?`<div class="kv"><span>Temporada</span><b>${p.ap} part. · ${p.g} goles</b></div><div class="kv"><span>Condición</span><span style="width:50%">${fitBar(p.fit)}</span></div>`:''}${p.inj?`<div class="kv"><span>Lesión</span><b class="bad">${p.inj} semanas</b></div>`:''}</div></div>
   ${ctx==='acad'?`<h3 style="margin-top:14px">Diagnóstico de crecimiento</h3>${devMult(p).parts.map(x=>`<div class="why ${x.v>=1.15?'good':x.v<0.9?'bad':''}">${esc(x.txt)}</div>`).join('')}`:''}
   <div class="row" style="margin-top:14px;gap:8px">${acts}</div>`,'wide');
}
function mRenew(pid){
  const p=S.players[pid],O=UI.renewO,ask=renewAsk(p);
  return modalShell('Renovar a '+p.name,`<p class="sub">Contrato actual: ${EUR(p.w)}/sem hasta el 30 de junio de ${p.ce+1}. ${traitOf(p)==='Ambicioso'?'Es ambicioso: pide una mejora.':''}</p>
   ${slider('rn_wage','Nuevo salario semanal',Math.round(p.w*0.7/100)*100,Math.round(ask*2/100)*100,100,O.wage,v=>EUR(v)+'/sem')}${slider('rn_years','Años adicionales',1,5,1,O.years,v=>'+'+v)}
   <div id="rnmeter">${wageMeter(O.wage,p.w)}</div>
   <div id="ofres">${O.msg?`<div class="msg">${esc(O.msg)}</div>`:''}</div><div class="row" style="justify-content:flex-end"><button class="btn" data-act="mclose">Cancelar</button><button class="btn pri" data-act="rnsend">Proponer</button></div>`,'narrow');
}
function mLoan(pid){
  const p=S.players[pid],opts=loanOptions(p).slice(0,14),role=UI.loanRole||'rotacion';
  return modalShell('Ceder a '+p.name,`<p class="sub">Elige destino y minutos pactados. Crecerá más cuanto más juegue. Recibirás un informe mensual y podrás repatriarlo.</p>
  <div class="seg" style="margin-bottom:10px">${[['titular','Titular'],['rotacion','Rotación'],['minutos','Minutos']].map(([k,l])=>`<button class="${role===k?'on':''}" data-act="lrole" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="scroll"><table><tr><th>Club</th><th>Liga</th><th class="n">Minutos esperados</th><th></th></tr>${opts.map(o=>`<tr><td>${clubTag(o.c.id,20)}</td><td>${LG_BY_CC[o.c.cc].nm} ${o.c.tier}ª</td><td class="n"><span class="${o.exp>=0.7?'good':o.exp>=0.4?'':'warn'}">${Math.round(o.exp*100)}%</span></td><td class="n"><button class="btn xs pri" data-act="loando" data-id="${pid}" data-v="${o.c.id}">Ceder</button></td></tr>`).join('')||'<tr><td colspan="4" class="empty">Ningún club acepta cederle por ahora (nivel insuficiente).</td></tr>'}</table></div>`,'wide');
}
function mMission(m){
  const sc=scoutsList(),M=UI.mis||{};
  return modalShell('Misión de ojeo',`<div class="field"><label for="ms_sc">Ojeador</label><select id="ms_sc">${sc.map(s=>`<option value="${s.id}" ${M.sid===s.id?'selected':''}>${esc(s.nm)} · nivel ${s.ab} · conoce ${NAT[M.nat||'ES']?s.kn[M.nat||'ES']:0}/20</option>`).join('')}</select></div>
   <div class="field"><label for="ms_nat">Nación</label><select id="ms_nat">${NATS.map(n=>`<option value="${n[0]}" ${M.nat===n[0]?'selected':''}>${n[1]} (${REGIONS[n[2]]})</option>`).join('')}</select></div>
   <div class="field"><label>Posición</label><div class="seg">${['ALL','GK','DEF','MID','FWD'].map(k=>`<button class="${(M.pos||'ALL')===k?'on':''}" data-act="mspos" data-v="${k}">${k==='ALL'?'Todas':POSL[k]}</button>`).join('')}</div></div>
   <div class="field"><label>Edad máxima</label><div class="seg">${[[18,'≤18'],[21,'≤21'],[23,'≤23'],[30,'≤30']].map(([v,l])=>`<button class="${(M.maxAge||23)===v?'on':''}" data-act="msage" data-v="${v}">${l}</button>`).join('')}</div></div>
   <div class="field"><label>Potencial mínimo</label><div class="seg">${[[0,'Cualquiera'],[70,'70+'],[78,'78+'],[85,'85+']].map(([v,l])=>`<button class="${(M.minPot||0)===v?'on':''}" data-act="mspot" data-v="${v}">${l}</button>`).join('')}</div></div>
   <p class="sub">Viajar fuera de su región cuesta más. Un ojeador rinde mucho más en las naciones que conoce.</p><div class="row" style="justify-content:flex-end"><button class="btn" data-act="mclose">Cancelar</button><button class="btn pri" data-act="msdo">Asignar misión</button></div>`,'narrow');
}
function mFollow(pid){
  const p=S.players[pid];
  return modalShell('Seguir a '+p.name,`<p class="sub">Un ojeador lo seguirá varias semanas para afinar su nivel y su potencial. No ojeará otros jugadores mientras tanto.</p>${scoutsList().map(s=>`<div class="msg"><div class="row spread"><div><b>${esc(s.nm)}</b><div class="sub">Nivel ${s.ab} · conoce ${NAT[p.nat]?s.kn[p.nat]:0}/20 ${p.nat}</div></div><button class="btn sm pri" data-act="followdo" data-id="${pid}" data-v="${s.id}">Asignar</button></div></div>`).join('')}`,'narrow');
}
/* arranque de carrera: si el club es de un país de año natural, el mundo avanza hasta su pretemporada con barra de progreso */
function beginCareer(cid,name,opts,done){
  const tg=startTarget(cid);
  if(!tg||tg<=S.t+3){startCareer(cid,name,{...opts,noff:true});done();return;}
  const ov=document.createElement('div');ov.className='loading';
  ov.innerHTML='<div class="lbox"><div class="spin"></div><b>Preparando la temporada…</b><div class="sub" id="ldtxt">El mundo sigue su curso hasta el arranque de tu liga</div><div class="wbar" style="margin-top:12px"><i id="ldbar" style="width:0%"></i></div></div>';
  document.body.appendChild(ov);
  const t0=S.t;S.user=null;
  const step=()=>{let k=0;while(S.t<tg&&k++<10){S.t++;dayTick();}
    const b=document.getElementById('ldbar'),x=document.getElementById('ldtxt');if(b)b.style.width=Math.round((S.t-t0)/(tg-t0)*100)+'%';if(x)x.textContent=fmtD(S.t);
    if(S.t<tg)setTimeout(step,0);else{ov.remove();startCareer(cid,name,{...opts,noff:true});done();}};
  setTimeout(step,40);
}
function mSummary(){
  const m=S.summary;if(!m)return modalShell('Temporada','<div class="empty">Sin datos.</div>');const u=m.user;
  return modalShell('Fin de temporada '+m.label,`${u?`<div class="num big" style="font-size:64px;margin:4px 0">${u.pos}º</div><div class="sub">${esc(u.lg)} · ${u.pts} pts · ${u.gf}-${u.ga} goles · premio ${EUR(u.prize)}${m.bonus?' · bono patrocinio '+EUR(m.bonus):''}</div>
   <div class="obj"><span class="ck ${u.rankOk?'ok':'no'}">${u.rankOk?ic('check','sm'):ic('x','sm')}</span><div><b>${esc(u.rtxt||'')}</b></div></div>
   <div class="obj"><span class="ck ${u.youthOk?'ok':'no'}">${u.youthOk?ic('check','sm'):ic('x','sm')}</span><div><b>Canteranos con minutos</b><div class="sub">${u.yd}/${u.yTarget}</div></div></div>
   <div class="obj"><span class="ck ${u.finOk?'ok':'no'}">${u.finOk?ic('check','sm'):ic('x','sm')}</span><div><b>Presupuesto positivo</b></div></div>
   ${(m.tn||[]).map(x=>`<div class="obj"><span class="ck ${x.champ?'ok':''}">${x.champ?ic('check','sm'):''}</span><div><b>${esc(x.nm)}</b><div class="sub">${esc(x.txt)}</div></div></div>`).join('')}
   ${u.top.length?`<h3 style="margin-top:12px">Goleadores del club</h3>${u.top.map(t=>`<div class="kv"><span>${esc(t.n)}</span><b>${t.g} goles · ${t.ap} part.</b></div>`).join('')}`:''}`:''}
   <h3 style="margin-top:12px">Campeones</h3>${m.champs.map(x=>`<div class="kv"><span>${LG_BY_CC[x.cc].nm} · ${esc(x.lg)}</span><b>${esc(x.club)}</b></div>`).join('')}
   <h3 style="margin-top:12px">Ascensos y descensos</h3>${m.moves.map(x=>`<div class="sub"><b>${LG_BY_CC[x.cc].nm}:</b> suben ${x.up.map(esc).join(', ')} · bajan ${x.down.map(esc).join(', ')}</div>`).join('')}
   ${m.grads?`<div class="kv"><span>Graduados de cantera</span><b>${m.grads}</b></div>`:''}${m.lost&&m.lost.length?`<div class="why bad">Se van libres: ${m.lost.map(esc).join(', ')}</div>`:''}
   <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn pri lg" data-act="mclose">Empezar ${m.cal?seasonLabel(m.Y+1,true):seasonLabel(S.Y)}</button></div>`,'wide');
}
function mClub(cid){
  const c=S.clubs[cid],lg=S.leagues[c.lg],pl=c.players.map(i=>S.players[i]).sort((a,b)=>b.ovr-a.ovr).slice(0,12);
  return modalShell(c.name,`<div class="row" style="gap:14px;margin-bottom:10px">${crest(c,64)}<div><div class="sub">${esc(c.city)} · ${LG_BY_CC[c.cc].nm} · ${lg.nm} · ${posOf(c.id)}º</div><div class="sub">${esc(c.stad)} · ${c.cap.toLocaleString('es')} plazas</div><div class="sub">Entrenador: ${c.mg?esc(c.mg.n)+' (rep. '+Math.round(c.mg.rep)+')':'<b class="warn">vacante</b>'}</div></div></div>
   <div class="grid g3 keep"><div class="stat"><div class="lbl">Reputación</div><div class="num">${Math.round(c.rep)}</div></div><div class="stat"><div class="lbl">Presupuesto</div><div class="num" style="font-size:22px">${EUR(c.budget)}</div></div><div class="stat"><div class="lbl">Salarios</div><div class="num" style="font-size:22px">${EUR(wageBill(c))}</div></div></div>
   <h3 style="margin-top:12px">Mejores jugadores</h3><div class="fcs">${pl.map(p=>fcard(p)).join('')}</div>`,'wide');
}
/* ================= partido en vivo con campo 2D ================= */
function dotsFor(M){
  const mk=(L,cid,side)=>{const c=S.clubs[cid],out=[];
    const rows={GK:[6],DEF:[22],MID:[40],FWD:[53]};
    ['GK','DEF','MID','FWD'].forEach(pos=>{const xs=L.xi.filter(x=>x.slot===pos).sort((a,b)=>(a.lat||0)-(b.lat||0));xs.forEach((x,i)=>{const y=(i+1)*68/(xs.length+1),bx=rows[pos][0],X=side==='h'?bx:105-bx;
      out.push(`<circle cx="${X}" cy="${y}" r="1.9" fill="${c.c1}" stroke="${c.c2}" stroke-width=".6"/>`);});});return out.join('');};
  return mk(M.H,M.hid,'h')+mk(M.A,M.aid,'a');
}
function startMatchUI(opt){
  const p=S.pend;if(!p)return;const M=newMatch(p.h,p.a,true),side=p.h===S.user?'h':'a';
  UI.ms={M,side,speed:1,ht:false,done:false,ball:[52.5,34],goalAt:0,committed:false};
  if(opt&&opt.key){M.keyOn=true;UI.ms.speed=4;}
  UI.m={type:'match'};drawMatch();startTimer();
}
function startTimer(){
  if(UI.mt)clearInterval(UI.mt);const ms=UI.ms;if(ms.done||ms.paused)return;
  UI.mt=setInterval(matchTick,[280,140,70,35][[0.5,1,2,4].indexOf(ms.speed)]||140);
}
function drawMatch(){
  const ms=UI.ms,M=ms.M,hc=S.clubs[M.hid],ac=S.clubs[M.aid];
  $('#modalRoot').innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="Partido"><div class="box wide">
   <div class="score"><div class="tm">${crest(hc,48)}<span>${esc(hc.name)}</span></div><div class="res" id="mScore" aria-live="polite">0-0</div><div class="tm">${crest(ac,48)}<span>${esc(ac.name)}</span></div></div>
   <div class="lbl" style="text-align:center;margin-bottom:4px">${esc(S.pend&&S.pend.nm?S.pend.nm+' · '+S.pend.rn:leagueOf(S.user).nm)}</div><div class="row spread"><span class="lbl" id="mMin">Min 0'</span><div class="speed" id="mSpeed">${[0.5,1,2,4].map(v=>`<button class="btn xs ${ms.speed===v?'on':''}" data-act="mspeed" data-v="${v}">${v}×</button>`).join('')}</div></div>
   <div class="timeline"><i id="mBar" style="width:0"></i></div>
   <svg viewBox="0 0 105 68" class="pitch2d" id="p2d" role="img" aria-label="Campo 2D"><rect x="1" y="1" width="103" height="66" class="pl"/><path d="M52.5 1v66" class="pl"/><circle cx="52.5" cy="34" r="9" class="pl"/><rect x="1" y="14" width="16" height="40" class="pl"/><rect x="88" y="14" width="16" height="40" class="pl"/><rect class="goalfx" x="1" y="1" width="103" height="66"/>${dotsFor(M)}<circle class="ball" id="ball" cx="52.5" cy="34" r="1.3"/></svg>
   <div class="feed" id="mFeed" tabindex="0" aria-label="Cronología" style="margin-top:10px"></div><div id="mPanel"></div>
   <div class="row spread" style="margin-top:12px"><button class="btn" id="mSkip" data-act="mskip">Simular el resto</button><button class="btn pri" id="mClose" data-act="mend" disabled>Continuar</button></div></div></div>`;
  M.ev.forEach(e=>feedAdd(e));
}
const evLine=e=>`<div class="ev ${e.t==='goal'?'goal':e.t==='card'?'card':e.t==='inj'?'inj':e.t==='miss'||e.t==='save'?'xg':''}"><span class="m">${e.m}'</span><span>${esc(e.txt)}${e.xg&&e.t!=='goal'?` <span class="mute">(xG ${e.xg})</span>`:''}</span></div>`;
function feedAdd(e){const f=$('#mFeed');if(f)f.insertAdjacentHTML('afterbegin',evLine(e));}
function moveBall(e){
  const b=$('#ball'),svg=$('#p2d');if(!b)return;
  const goalX=e.home?100:5,x=e.home?clamp(78+ri(0,12),70,95):clamp(27-ri(0,12),10,35),y=34+ri(-10,10);
  b.setAttribute('cx',x);b.setAttribute('cy',y);
  setTimeout(()=>{if(!$('#ball'))return;if(e.t==='goal'||e.t==='save'||e.t==='miss'){b.setAttribute('cx',e.t==='miss'?goalX+(e.home?3:-3):goalX);b.setAttribute('cy',34+ri(-4,4));}},260);
  if(e.t==='goal'&&svg){svg.classList.add('goal');setTimeout(()=>svg.classList.remove('goal'),900);}
}
let _lastEv=0;
function matchTick(){
  const ms=UI.ms;if(!ms||ms.done)return;const M=ms.M;
  const before=M.ev.length;runMinutes(M,M.m+1);
  for(let i=before;i<M.ev.length;i++){feedAdd(M.ev[i]);if(i===M.ev.length-1)moveBall(M.ev[i]);}
  if(M.ev.length===before){const b=$('#ball');if(b){const ph=M.pw/Math.max(1,M.m);b.setAttribute('cx',(52.5+(ph-0.5)*40+ri(-6,6)).toFixed(1));b.setAttribute('cy',(34+ri(-14,14)));}}
  const lim=ms.lim||90;
  $('#mScore').textContent=`${M.hg}-${M.ag}`;$('#mMin').textContent=`Min ${M.m}'${M.m>90?' (prórroga)':''}`;$('#mBar').style.width=(M.m/lim*100)+'%';
  if(M.m===45&&!ms.ht){ms.ht=true;pauseHT();}
  if(M.m>=90&&!ms.etChk){ms.etChk=true;if(needsDeciderUI(M)){ms.lim=120;feedAdd({m:90,t:'inj',home:true,txt:'Empate: se juega la prórroga.'});}}
  if(M.m>=(ms.lim||90))endMatchUI();
}
function pauseHT(){
  clearInterval(UI.mt);UI.mt=null;UI.ms.paused=true;renderHT();
}
function renderHT(){
  const ms=UI.ms,M=ms.M,side=ms.side,L=side==='h'?M.H:M.A,c=userClub(),mod=M.mod[side],tac=mod.tactic||c.tactic,ins=mod.ins||c.ins||{};
  const me=side==='h',sh=me?M.hs:M.as,so=me?M.hsot:M.asot,xg=me?M.hx:M.ax,oxg=me?M.ax:M.hx,pos=Math.round(M.pw/Math.max(1,M.m)*100);
  $('#mPanel').innerHTML=`<div class="panel" style="margin-top:12px"><div class="hd"><h2>Descanso</h2><span class="sub">${M.subs[side]}/3 cambios</span></div>
   <div class="stats3"><div class="l">${Math.round(me?pos:100-pos)}%</div><div class="c">Posesión</div><div class="r">${Math.round(me?100-pos:pos)}%</div><div class="l">${xg.toFixed(2)}</div><div class="c">xG</div><div class="r">${oxg.toFixed(2)}</div><div class="l">${sh} (${so})</div><div class="c">Tiros (a puerta)</div><div class="r">${me?M.as:M.hs} (${me?M.asot:M.hsot})</div></div>
   <div class="lbl">Mentalidad</div><div class="seg" style="margin:6px 0 10px">${[['defense','Defensiva'],['balance','Equilibrada'],['attack','Ofensiva']].map(([k,l])=>`<button class="${tac===k?'on':''}" data-act="httac" data-v="${k}">${l}</button>`).join('')}</div>
   <div class="row" style="margin-bottom:10px"><button class="btn sm ${ins.press?'on':''}" data-act="htpress">Presión alta ${ins.press?'ON':'OFF'}</button><button class="btn sm ${ins.tempo==='fast'?'on':''}" data-act="httempo">Ritmo alto ${ins.tempo==='fast'?'ON':'OFF'}</button></div>
   <div class="lbl">Cambio</div><div class="row" style="margin:6px 0"><select id="ht_out" aria-label="Sale">${L.xi.filter(x=>x.slot!=='GK').sort((a,b)=>a.p.fit-b.p.fit).map(x=>`<option value="${x.p.id}">Sale: ${esc(sname(x.p))} (${x.slot==='DEF'?'DEF':x.slot==='MID'?'MED':'DEL'} · cond. ${Math.round(x.p.fit)}%)</option>`).join('')}</select>
   <select id="ht_in" aria-label="Entra">${L.bench.map(b=>`<option value="${b.id}">Entra: ${esc(sname(b))} (${POSL[b.pos]} ${b.ovr})</option>`).join('')}</select><button class="btn sm pri" data-act="htsub" ${M.subs[side]>=3||!L.bench.length?'disabled':''}>Cambiar</button></div>
   <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn pri" data-act="htgo">Segunda parte ${ic('arrow','sm')}</button></div></div>`;
}
function needsDeciderUI(M){
  const p=S.pend;if(!p||p.kind!=='tn'||p.g!=null)return false;
  const T=S.tn[p.tid],rd=T.rounds[p.r];return needsDecider(T,rd,rd.ties[p.i],p.leg,M);
}
function endMatchUI(){
  const ms=UI.ms;if(ms.done)return;ms.done=true;clearInterval(UI.mt);UI.mt=null;
  const M=ms.M;
  if(needsDeciderUI(M)){M.pen=penWin(M);feedAdd({m:M.m,t:'goal',home:M.pen.h>M.pen.a,txt:`Tanda de penaltis: ${M.pen.h}-${M.pen.a}.`});}
  const pk=S.pend&&S.pend.kind==='tn',comp=pk?(S.pend.nm+' · '+S.pend.rn):null;
  if(pk)commitTournMatch(M);else commitUserMatch(M);
  S.mres=S.mres||[];S.mres.push({Y:userYear(),t:S.t,h:M.hid,a:M.aid,hg:M.hg,ag:M.ag,comp,pen:M.pen||null});
  const sum=matchSummary(M),me=ms.side==='h',pos=sum.pos;
  const row=(l,a,b)=>`<div class="l">${a}</div><div class="c">${l}</div><div class="r">${b}</div>`;
  $('#mScore').textContent=`${M.hg}-${M.ag}`;$('#mMin').textContent='Final';$('#mBar').style.width='100%';
  $('#mPanel').innerHTML=`<div class="panel" style="margin-top:12px"><div class="hd"><h2>Resumen</h2></div><div class="${sum.my>sum.op?'good':sum.my<sum.op?'bad':''}" style="font-weight:600;margin-bottom:8px">${esc(sum.why)}</div>
   <div class="stats3">${row('Posesión',pos+'%',(100-pos)+'%')}${row('xG',M.hx.toFixed(2),M.ax.toFixed(2))}${row('Tiros',M.hs,M.as)}${row('A puerta',M.hsot,M.asot)}</div>${keyHTML(M)}</div>`;
  $('#mClose').disabled=false;$('#mSkip').disabled=true;$('#mClose').focus();save();
}
/* ================= eventos ================= */
function startSetupDefaults(){UI.setup={step:'country',cc:null,tier:1,idx:-1,mgr:'',create:{city:'',suf:'',c1:'#2fbf84',c2:'#f2f2f0',pat:0,stad:''}};}
function afterAdvance(r){
  if(r==='season'){UI.m={type:'summary'};}
  else if(r==='msg')toast('Tienes decisiones pendientes.');
  else if(r==='job')toast('Tienes una oferta de trabajo.');
  save();render();
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-tab],[data-act]');if(!t)return;
  if(t.dataset.act==='mbg'){if(e.target===t&&UI.m&&UI.m.type!=='match'&&UI.m.type!=='confirm')closeModal();return;}
  e.preventDefault&&t.tagName==='A'&&e.preventDefault();
  if(t.dataset.tab){UI.tab=t.dataset.tab;render();window.scrollTo(0,0);return;}
  const a=t.dataset.act,v=t.dataset.v,id=+t.dataset.id;
  if(a==='theme'){const d=document.documentElement;d.dataset.theme=isDark()?'light':'dark';try{localStorage.setItem('gaffer.theme',d.dataset.theme);}catch(x){}render();return;}
  /* --- inicio / selección --- */
  if(a==='menu'){UI.menu=true;render();return;}
  if(a==='backstart'){UI.menu=true;S=null;render();return;}
  if(a==='continue'){const sl=+v;if(S&&S.slot===sl&&(S.user!=null||S.mgr)){UI.menu=false;render();return;}
    toast('Cargando carrera…');loadSaveAsync(sl).then(ok=>{if(ok){UI.menu=false;UI.tab='home';render();}else toast('No se pudo cargar la partida guardada.');});return;}
  if(a==='newworld'){const sl=v!=null?+v:Math.max(0,firstFreeSlot());const occupied=!!slotsMeta().list[sl];
    const go=()=>{toast('Generando el mundo…');setTimeout(()=>{genWorld();S.slot=sl;S.mres=[];startSetupDefaults();UI.menu=false;render();},60);};
    if(occupied){ask('Esa ranura ya tiene una carrera: se sustituirá cuando guardes de nuevo. ¿Continuar?',go,'Sustituir');}else go();return;}
  if(a==='delslot'){const sl=+v;ask('¿Borrar esta carrera? No se puede deshacer.',()=>{deleteSlot(sl).then(()=>{if(S&&S.slot===sl){S=null;}render();});},'Borrar',true);return;}
  if(a==='country'){UI.setup.step='club';UI.setup.cc=v;UI.setup.tier=1;UI.setup.idx=S.leagues.find(l=>l.cc===v&&l.tier===1).ids.map(i=>S.clubs[i]).sort((a,b)=>b.skill-a.skill)[0].id;render();return;}
  if(a==='tier'){UI.setup.tier=+v;UI.setup.idx=S.leagues.find(l=>l.cc===UI.setup.cc&&l.tier===+v).ids.map(i=>S.clubs[i]).sort((a,b)=>b.skill-a.skill)[0].id;render();return;}
  if(a==='club'){UI.setup.idx=id||+v;render();return;}
  if(a==='backsetup'){UI.setup.step='country';render();return;}
  if(a==='createclub'){UI.setup.step='create';UI.setup.cc=UI.setup.cc||'ES';render();return;}
  if(a==='cc1'){UI.setup.create.c1=v;render();return;}if(a==='cc2'){UI.setup.create.c2=v;render();return;}if(a==='cpat'){UI.setup.create.pat=+v;render();return;}
  if(a==='diff'){UI.setup.diff=v;render();return;}
  if(a==='ddopen'){if(!S.dd||!S.dd.open)ddOpen();openModal({type:'dd'});return;}
  if(a==='ddnext'){ddNext();renderModal();save();return;}
  if(a==='ddclose'){const r=ddClose(+v);toast(r);renderModal();save();return;}
  if(a==='askfunds'){const r=askFunds();toast(r.msg);save();render();return;}
  if(a==='glory'){const ccs=LEAGUES.map(L=>L.cc),cc=pick(ccs),lg=S.leagues.find(l=>l.cc===cc&&l.tier===4);UI.setup.cc=cc;UI.setup.tier=4;UI.setup.idx=lg.ids.map(i=>S.clubs[i]).sort((x,y)=>x.skill-y.skill)[Math.min(3,lg.ids.length-1)].id;UI.setup.step='club';UI.setup.diff='hard';render();toast('Carretera a la gloria: elige tu club de 4ª división.');return;}
  if(a==='optexact'){S.opt=S.opt||{};S.opt.exact=!S.opt.exact;save();render();return;}
  if(a==='start'){const nm=($('#mgr')||{}).value||UI.setup.mgr||'';S.mres=[];beginCareer(UI.setup.idx,nm.trim()||'Mánager',{diff:UI.setup.diff||'normal'},()=>{UI.tab='home';UI.menu=false;render();toast('¡Empieza tu carrera!');});return;}
  if(a==='docreate'){const cr=UI.setup.create,nm=($('#mgr')||{}).value||UI.setup.mgr||'';const cid=createClub(UI.setup.cc,{...cr});S.mres=[];beginCareer(cid,nm.trim()||'Mánager',{diff:UI.setup.diff||'normal'},()=>{UI.tab='home';UI.menu=false;render();toast('Club creado. ¡A empezar desde abajo!');});return;}
  if(!S)return;
  /* --- tiempo --- */
  if(a==='cont'){afterAdvance(advance(S.user==null?'week':'match'));return;}
  if(a==='week'){afterAdvance(advance('week'));return;}
  if(a==='auto5'){const r=autoplay(5);toast(`Simulados ${r.played} partidos: ${r.w}G ${r.d}E ${r.l}P${r.reason==='msg'?' · hay una decisión pendiente':''}`);afterAdvance(r.reason==='season'?'season':'ok');return;}
  if(a==='play'){startMatchUI();return;}
  if(a==='playkey'){startMatchUI({key:true});return;}
  if(a==='simmatch'){const pk=S.pend&&S.pend.kind==='tn',comp=pk?(S.pend.nm+' · '+S.pend.rn):null;const M=simulateUserMatch();S.mres.push({Y:userYear(),t:S.t,h:M.hid,a:M.aid,hg:M.hg,ag:M.ag,comp,pen:M.pen||null});save();toast(`Resultado: ${S.clubs[M.hid].short} ${M.hg}-${M.ag} ${S.clubs[M.aid].short}`);render();return;}
  /* --- modales genéricos --- */
  if(a==='mclose'){closeModal();return;}
  if(a==='confirmyes'){const f=UI.ask;UI.ask=null;UI.m=null;$('#modalRoot').innerHTML='';if(f)f();render();return;}
  if(a==='inbox'){openModal({type:'inbox'});return;}
  if(a==='mspeed'){UI.ms.speed=+v;document.querySelectorAll('#mSpeed .btn').forEach(b=>b.classList.toggle('on',+b.dataset.v===UI.ms.speed));if(!UI.ms.paused&&!UI.ms.done)startTimer();return;}
  if(a==='mskip'){clearInterval(UI.mt);UI.ms.paused=false;const M=UI.ms.M;if(!UI.ms.ht&&M.m<45){runMinutes(M,45);UI.ms.ht=true;M.ev.slice(-0).forEach(()=>{});$('#mFeed').innerHTML=M.ev.slice().reverse().map(evLine).join('');$('#mScore').textContent=`${M.hg}-${M.ag}`;$('#mMin').textContent="Min 45'";pauseHT();return;}
    runMinutes(M,90);if(needsDeciderUI(M)){runMinutes(M,120);}$('#mFeed').innerHTML=M.ev.slice().reverse().map(evLine).join('');UI.ms.etChk=true;endMatchUI();return;}
  if(a==='mend'){closeModal();return;}
  if(a==='httac'){const ms=UI.ms;ms.M.mod[ms.side].tactic=v;ms.M.recalc();renderHT();return;}
  if(a==='htpress'||a==='httempo'){const ms=UI.ms,mod=ms.M.mod[ms.side],base=Object.assign({},userClub().ins||{},mod.ins||{});if(a==='htpress')base.press=!base.press;else base.tempo=base.tempo==='fast'?'normal':'fast';mod.ins=base;ms.M.recalc();renderHT();return;}
  if(a==='htsub'){const ms=UI.ms,M=ms.M,L=ms.side==='h'?M.H:M.A,outId=+$('#ht_out').value,inId=+$('#ht_in').value;
    const slot=L.xi.find(x=>x.p.id===outId),b=L.bench.find(x=>x.id===inId);if(slot&&b){L.bench=L.bench.filter(x=>x.id!==inId);L.bench.push(slot.p);slot.p=b;slot.e=eff(b)-(b.pos===slot.slot?0:14);M.subs[ms.side]++;M.recalc();M.ev.push({m:M.m,t:'sub',home:ms.side==='h',txt:`Cambio: entra ${sname(b)} por ${sname(S.players[outId])}.`});feedAdd(M.ev[M.ev.length-1]);}renderHT();return;}
  if(a==='htgo'){const ms=UI.ms;ms.paused=false;$('#mPanel').innerHTML='';startTimer();return;}
  if(a==='resp'){const r=respond(id,v);if(r&&typeof r==='object'){if(r.open==='counter'){UI.cnt={fee:Math.round(S.inbox.find(x=>x.id===r.mid).fee*1.15/1e4)*1e4,res:null,agreed:null};openModal({type:'counter',mid:r.mid});}else if(r.open==='loan')openModal({type:'loan',pid:r.pid});else if(r.open==='renew'){UI.renewO={wage:renewAsk(S.players[r.pid]),years:2,msg:''};openModal({type:'renew',pid:r.pid});}else if(r.open==='job'){UI.m=null;UI.tab='home';toast('¡Nuevo club!');}else if(r.open==='dd'){openModal({type:'dd'});}}else if(r)toast(r);if(UI.m&&UI.m.type==='inbox'&&!pendingCount()){closeModal();return;}save();render();return;}
  /* --- jugador --- */
  if(a==='player'){openModal({type:'player',pid:id});return;}
  if(a==='clubview'){openModal({type:'clubview',cid:id});return;}
  if(a==='renew'){const p=S.players[id];UI.renewO={wage:renewAsk(p),years:2,msg:''};openModal({type:'renew',pid:id});return;}
  if(a==='rnsend'){const p=S.players[UI.m.pid],O=UI.renewO,err=renewPlayer(p.id,O.wage,O.years);if(err){O.msg=err;renderModal();return;}save();UI.m=null;$('#modalRoot').innerHTML='';render();toast(`${p.name} renueva.`);return;}
  if(a==='short'){toggleShort(id);save();render();return;}
  if(a==='lock'){const p=S.players[id];p.lock=!p.lock?'start':p.lock==='start'?'rest':null;save();render();return;}
  if(a==='tl'){const p=S.players[id];p.tl=!p.tl;toast(p.tl?`${p.name} en la lista de traspasos.`:'Retirado de la lista de traspasos.');save();render();return;}
  if(a==='sellp2'){const p=S.players[id],price=sellPrice(p);ask(`¿Vender a ${p.name} por ${EUR(price)}?`,()=>{const err=sellPlayer(id,price);if(err)toast(err);else{news(`Venta: ${p.name} por ${EUR(price)}.`,'t');toast(`${p.name} vendido.`);}save();},'Vender');return;}
  if(a==='release2'){const p=S.players[id];ask(`¿Liberar a ${p.name}? Pagarás ${EUR(releaseCost(p))} de indemnización.`,()=>{const err=releasePlayer(id);if(err)toast(err);save();},'Liberar',true);return;}
  /* --- cantera --- */
  if(a==='sign'){const p=S.ac.intake.find(x=>x.id===id),err=signProspect(p);toast(err||`${p.name} ficha por la cantera.`);save();render();return;}
  if(a==='skipintake'){skipIntake();save();render();return;}
  if(a==='promote'){const err=promote(id);if(err)toast(err);else{toast('Asciende al primer equipo.');if(UI.m&&UI.m.type==='player')UI.m=null;}save();render();return;}
  if(a==='loanm'){UI.loanRole='rotacion';openModal({type:'loan',pid:id});return;}
  if(a==='lrole'){UI.loanRole=v;renderModal();return;}
  if(a==='loando'){const err=loanOut(id,+v,UI.loanRole||'rotacion');if(err)toast(err);else{toast('Cesión acordada.');UI.m=null;$('#modalRoot').innerHTML='';}save();render();return;}
  if(a==='recall'){recallLoan(id);toast('Repatriado.');save();render();return;}
  if(a==='sellp'){const p=S.players[id],price=sellPrice(p);if(lockDays(p)>0){toast(`${p.name} acaba de llegar: periodo de adaptación (${lockDays(p)} días).`);return;}ask(`¿Vender a la promesa ${p.name} por ${EUR(price)}?`,()=>{sellProspect(id);save();toast('Promesa vendida.');},'Vender');return;}
  if(a==='release'){const p=S.players[id];ask(`¿Liberar a ${p.name} de la cantera?`,()=>{releaseProspect(id);save();},'Liberar',true);return;}
  if(a==='int'){const p=S.players[id];p.int=!p.int;save();render();return;}
  if(a==='upg'){const cost=upgCost(S.ac.lvl);ask(`Mejorar la academia al nivel ${S.ac.lvl+1} cuesta ${EUR(cost)}.`,()=>{const err=upgradeAcademy();if(err)toast(err);else toast('Academia mejorada.');save();},'Mejorar');return;}
  if(a==='automentor'){toast(autoMentors()+' mentores asignados.');save();render();return;}
  /* --- navegación --- */
  if(a==='sub'){UI.sub[t.dataset.g]=v;render();window.scrollTo(0,0);return;}
  if(a==='goto'){const [tab,sub]=v.split(':');UI.tab=tab;if(sub)UI.sub[tab]=sub;if(UI.m)UI.m=null;$('#modalRoot').innerHTML='';render();window.scrollTo(0,0);return;}
  if(a==='sfilter'){UI.f.sq=v;render();return;}
  if(a==='cards'){UI.f.cards=v==='1';render();return;}
  const c=userClub();
  if(a==='form'){c.form=v;save();render();return;}
  if(a==='formout'){c.formOut=v||null;save();render();return;}
  if(a==='tactic'){c.tactic=v;save();render();return;}
  if(a==='ins'){c.ins=c.ins||{};const g=t.dataset.g;if(g==='press')c.ins.press=!!v;else c.ins[g]=v;save();render();return;}
  if(a==='train'){c.train=v;save();render();return;}
  /* --- ojeo --- */
  if(a==='nat'){UI.sel.nat=v;render();return;}
  if(a==='mission'){UI.mis={sid:id,nat:(S.scout.miss[id]||{}).nat||UI.sel.nat||'ES',pos:'ALL',maxAge:23,minPot:0};openModal({type:'mission'});return;}
  if(a==='missionnat'){UI.mis={sid:(scoutsList()[0]||{}).id,nat:v,pos:'ALL',maxAge:23,minPot:0};openModal({type:'mission'});return;}
  if(a==='mspos'){UI.mis.pos=v;syncMis();renderModal();return;}if(a==='msage'){UI.mis.maxAge=+v;syncMis();renderModal();return;}if(a==='mspot'){UI.mis.minPot=+v;syncMis();renderModal();return;}
  if(a==='msdo'){syncMis();const M=UI.mis;if(!M.sid){toast('Necesitas un ojeador.');return;}setMission(M.sid,M);UI.m=null;$('#modalRoot').innerHTML='';save();render();toast('Misión asignada.');return;}
  if(a==='followm'){openModal({type:'follow',pid:id});return;}
  if(a==='followdo'){followPlayer(+v,id);UI.m=null;$('#modalRoot').innerHTML='';save();render();toast('Ojeador asignado al seguimiento.');return;}
  if(a==='rpos'){UI.f.rep.pos=v;render();return;}if(a==='rage'){UI.f.rep.maxAge=+v;render();return;}
  /* --- club / staff --- */
  if(a==='hire'){const s=S.staff.market.find(x=>x.id===id),cur=s.role!=='scout'?S.staff.hired.find(x=>x.role===s.role):null;
    ask(`Contratar a ${s.nm} (${STAFF_ROLES[s.role].nm}, nivel ${s.ab}) por ${EUR(s.w)}/sem. Prima ${EUR(s.w*4)}${cur?`. Sustituye a ${cur.nm} (nivel ${cur.ab}): indemnización ${EUR(cur.w*8)}`:''}.`,()=>{const err=hireStaff(id);if(err)toast(err);else toast('Fichaje de staff completado.');save();},'Contratar');return;}
  if(a==='fire'){const s=S.staff.hired.find(x=>x.id===id);ask(`¿Despedir a ${s.nm}? Indemnización ${EUR(s.w*8)}.`,()=>{fireStaff(id);save();},'Despedir',true);return;}
  if(a==='idc1'){c.c1=v;save();render();return;}if(a==='idc2'){c.c2=v;save();render();return;}if(a==='idpat'){c.pat=+v;save();render();return;}
  if(a==='mentor'){return;}
  /* --- carrera --- */
  if(a==='apply'){const ok=applyFor(id);if(ok)toast('Candidatura enviada.');save();render();return;}
  if(a==='resign'){ask('¿Dimitir como entrenador? Quedarás sin club hasta aceptar otra oferta.',()=>{sackUser('Has presentado tu dimisión.');S.mgr.rep=Math.min(98,S.mgr.rep+6);UI.tab='career';save();},'Dimitir',true);return;}
});
function syncMis(){const sc=$('#ms_sc'),nt=$('#ms_nat');if(sc)UI.mis.sid=+sc.value;if(nt)UI.mis.nat=nt.value;}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(UI.m&&UI.m.type==='match'){if(UI.ms&&UI.ms.done)closeModal();return;}
    if(UI.m){closeModal();return;}
  }
  if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.dataset&&e.target.dataset.act==='player'&&e.target.tagName!=='BUTTON'){e.preventDefault();e.target.click();}
});
document.addEventListener('input',e=>{
  const t=e.target,id=t.id;if(!id)return;
  if(id==='mgr'){UI.setup.mgr=t.value;return;}
  if(id==='cc_city'){UI.setup.create.city=t.value;return;}if(id==='cc_phil'){UI.setup.create.phil=t.value;return;}if(id==='cc_suf'){UI.setup.create.suf=t.value;return;}if(id==='cc_stad'){UI.setup.create.stad=t.value;return;}
  if(id==='of_fee'||id==='of_wage'||id==='of_years'||id==='of_sell'){
    const v=+t.value,O=UI.offer,f={of_fee:EUR,of_wage:x=>EUR(x)+'/sem',of_years:x=>x+(x===1?' año':' años'),of_sell:x=>x+'%'}[id];
    O[{of_fee:'fee',of_wage:'wage',of_years:'years',of_sell:'sellOn'}[id]]=v;$('#'+id+'v').textContent=f(v);if(id==='of_wage'&&$('#wmeter'))$('#wmeter').innerHTML=wageMeter(v);if(typeof updAnalyst==='function')updAnalyst();return;}
  if(id==='rn_wage'||id==='rn_years'){const v=+t.value;UI.renewO[id==='rn_wage'?'wage':'years']=v;$('#'+id+'v').textContent=id==='rn_wage'?EUR(v)+'/sem':'+'+v;if(id==='rn_wage'&&$('#rnmeter')&&UI.m&&UI.m.pid!=null){const pp=S.players[UI.m.pid];$('#rnmeter').innerHTML=wageMeter(v,pp?pp.w:0);}return;}
  if(id==='tk'&&S&&userClub()){const c=userClub();c.price=Math.round(+t.value*2)/2;$('#tkv').textContent='€'+c.price.toFixed(1);const att=attendance(c);$('#tka').textContent=att.toLocaleString('es')+' ('+Math.round(att/c.cap*100)+'%)';}
});
document.addEventListener('change',e=>{
  const t=e.target,id=t.id;
  if(id==='cc_cc'){UI.setup.cc=t.value;return;}
  if(id==='cc_phil'){UI.setup.create.phil=t.value;return;}
  if(id==='tk'){save();return;}
  if(!S)return;
  if(t.dataset&&t.dataset.act==='mentor'){const p=S.players[+t.dataset.id];p.mentor=t.value?+t.value:null;save();render();return;}
  const F=UI.f.mk;
  if(false){}
  else if(id==='lgsel'){UI.f.lg=+t.value;render();}
  else if(id==='id_suf'){const c=userClub();c.suf=t.value||c.suf;c.name=c.city+' '+c.suf;save();render();}
  else if(id==='id_stad'){userClub().stad=t.value||userClub().stad;save();}
  else if(id==='ms_nat'||id==='ms_sc'){syncMis();renderModal();}
});
/* ================= arranque ================= */
try{const th=localStorage.getItem('gaffer.theme');if(th)document.documentElement.dataset.theme=th;}catch(e){}
S=null;UI.menu=true;render();
