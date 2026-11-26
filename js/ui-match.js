"use strict";
/* ================= partido: crónica en directo con mapa de tiros (sustituye al campo con puntos) ================= */
const shotHash=e=>{let h=(e.m*73856093)^((e.pid||0)*19349663)^((e.xg||0.1)*1e4|0);h=(h^(h>>>13))*1274126177;return Math.abs(h^(h>>>16));};
function shotXY(e){
  const h=shotHash(e),near=1-Math.min(0.95,(e.xg||0.1)*1.6),depth=4+(h%1000)/1000*(8+near*18),lat=((h>>>10)%1000)/1000*2-1;
  const x=e.home?105-depth:depth,y=34+lat*(6+near*13);return [x,Math.max(6,Math.min(62,y))];
}
function shotPitchSVG(){
  return `<svg viewBox="0 0 105 68" class="shotmap" id="p2d" role="img" aria-label="Mapa de tiros del partido"><rect x="1" y="1" width="103" height="66" rx="2" class="pl"/><path d="M52.5 1v66" class="pl"/><circle cx="52.5" cy="34" r="9" class="pl"/>
   <rect x="1" y="14" width="16" height="40" class="pl"/><rect x="88" y="14" width="16" height="40" class="pl"/><rect x="1" y="25" width="5" height="18" class="pl"/><rect x="99" y="25" width="5" height="18" class="pl"/><rect class="goalfx" x="1" y="1" width="103" height="66"/><g id="shots"></g></svg>`;
}
function addShot(e){
  if(!(e.t==='goal'||e.t==='save'||e.t==='miss'))return;
  const g=$('#shots');if(!g)return;const ms=UI.ms,M=ms.M,hc=M.tc?M.tc.h:S.clubs[M.hid],ac=M.tc?M.tc.a:S.clubs[M.aid],c=e.home?hc:ac,[x,y]=shotXY(e),r=1.3+(e.xg||0.1)*7;
  const ns='http://www.w3.org/2000/svg',pos=document.createElementNS(ns,'g'),el=document.createElementNS(ns,'g');pos.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`);el.setAttribute('class','shot '+e.t);pos.appendChild(el);
  const dot=document.createElementNS(ns,'circle');dot.setAttribute('r',r.toFixed(2));dot.setAttribute('fill',e.t==='miss'?'transparent':c.c1);dot.setAttribute('stroke',e.t==='miss'?c.c1:c.c2);dot.setAttribute('stroke-width',e.t==='goal'?'.9':'.6');
  el.appendChild(dot);
  if(e.t==='goal'){const ring=document.createElementNS(ns,'circle');ring.setAttribute('r',(r+1.5).toFixed(2));ring.setAttribute('class','ring');ring.setAttribute('stroke',c.c1);el.appendChild(ring);}
  g.appendChild(pos);
}
function pulseHTML(){
  return `<div class="pulse"><div class="row spread"><span class="lbl" id="mPossH">50%</span><span class="lbl">Posesión</span><span class="lbl" id="mPossA">50%</span></div>
   <div class="possbar"><i id="mPoss" style="width:50%"></i></div>
   <div class="row spread" style="margin-top:6px"><span class="num sm" id="mXgH">0.00</span><span class="lbl">xG · tiros</span><span class="num sm" id="mXgA">0.00</span></div></div>`;
}
function updatePulse(){
  const ms=UI.ms,M=ms.M;if(!$('#mPoss'))return;
  const ph=Math.round(M.pw/Math.max(1,M.m)*100);
  $('#mPoss').style.width=ph+'%';$('#mPossH').textContent=ph+'%';$('#mPossA').textContent=(100-ph)+'%';
  $('#mXgH').textContent=`${M.hx.toFixed(2)} · ${M.hs}`;$('#mXgA').textContent=`${M.ax.toFixed(2)} · ${M.as}`;
}
function drawMatch(){
  const ms=UI.ms,M=ms.M,hc=M.tc?M.tc.h:S.clubs[M.hid],ac=M.tc?M.tc.a:S.clubs[M.aid];
  let pauseHTpref=true;try{pauseHTpref=localStorage.getItem('gaffer.htpause')!=='0';}catch(e){}
  ms.pauseHT=pauseHTpref;
  $('#modalRoot').innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="Partido"><div class="box wide">
   <div class="score"><div class="tm">${crest(hc,48)}<span>${esc(hc.name)}</span></div><div class="res" id="mScore" aria-live="polite">0-0</div><div class="tm">${crest(ac,48)}<span>${esc(ac.name)}</span></div></div>
   <div class="lbl" style="text-align:center;margin-bottom:4px">${esc(M.nt?'Selecciones · '+M.ntFix.label:M.youth?'Liga juvenil':S.pend&&S.pend.nm?S.pend.nm+' · '+S.pend.rn:leagueOf(S.user).nm)}${(userClub().rival===M.hid||userClub().rival===M.aid)?' · DERBI':''}</div>
   <div class="row spread"><span class="lbl" id="mMin">Min 0'</span><div class="speed" id="mSpeed">${[0.5,1,2,4].map(v=>`<button class="btn xs ${ms.speed===v?'on':''}" data-act="mspeed" data-v="${v}">${v}×</button>`).join('')}<button class="btn xs" id="mPause" data-act="mpause" aria-label="Pausar">⏸</button></div></div>
   <div class="timeline"><i id="mBar" style="width:0"></i></div>
   ${shotPitchSVG()}${pulseHTML()}
   <div class="feed" id="mFeed" tabindex="0" aria-label="Cronología" style="margin-top:10px"></div><div id="mPanel"></div>
   <div class="matchctl"><div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn ${M.keyOn?'on':''}" id="mKey" data-act="mkeytoggle" title="Juegas solo las ocasiones de más peso">Momentos clave: ${M.keyOn?'ON':'OFF'}</button><button class="btn" id="mHT" data-act="mtoht">Hasta el descanso</button><button class="btn" id="mSkip" data-act="mskip">Simular hasta el final</button></div>
   <label class="chk"><input type="checkbox" id="mHTpref" ${pauseHTpref?'checked':''}> Parar en el descanso para cambios</label>
   <button class="btn pri" id="mClose" data-act="mend" disabled>Continuar</button></div></div></div>`;
  refreshAll();
}
function refreshAll(){
  const ms=UI.ms,M=ms.M;if(!M)return;const f=$('#mFeed');
  if(f)f.innerHTML=M.ev.slice().reverse().map(evLine).join('');
  const g=$('#shots');if(g){g.innerHTML='';M.ev.forEach(addShot);}
  const sc=$('#mScore');if(sc)sc.textContent=`${M.hg}-${M.ag}`;
  const mn=$('#mMin');if(mn)mn.textContent=`Min ${M.m}'${M.m>90?' (prórroga)':''}`;
  const b=$('#mBar');if(b)b.style.width=(M.m/(ms.lim||90)*100)+'%';updatePulse();
}
function moveBall(){}
function matchTick(){
  const ms=UI.ms;if(!ms||ms.done)return;const M=ms.M;
  const before=M.ev.length;runMinutes(M,M.m+1);
  if(M.keyPending){clearInterval(UI.mt);UI.mt=null;ms.paused=true;showKey();return;}
  for(let i=before;i<M.ev.length;i++){feedAdd(M.ev[i]);addShot(M.ev[i]);if(M.ev[i].t==='goal'){const s=$('#p2d');if(s){s.classList.add('goal');setTimeout(()=>s.classList.remove('goal'),900);}}}
  const lim=ms.lim||90;
  $('#mScore').textContent=`${M.hg}-${M.ag}`;$('#mMin').textContent=`Min ${M.m}'${M.m>90?' (prórroga)':''}`;$('#mBar').style.width=(M.m/lim*100)+'%';updatePulse();
  if(M.m===45&&!ms.ht){ms.ht=true;if(ms.pauseHT){pauseHT();return;}}
  if(M.m>=90&&!ms.etChk){ms.etChk=true;if(needsDeciderUI(M)){ms.lim=120;feedAdd({m:90,t:'inj',home:true,txt:'Empate: se juega la prórroga.'});}}
  if(M.m>=(ms.lim||90))endMatchUI();
}
/* simular de golpe hasta el final (sin parar en el descanso) */
function simToEnd(){
  const ms=UI.ms;if(!ms||ms.done)return;clearInterval(UI.mt);UI.mt=null;ms.paused=false;const M=ms.M;
  $('#mPanel').innerHTML='';
  if(M.keyPending)resolveKey(M,null);
  runAuto(M,90);ms.ht=true;ms.etChk=true;
  if(needsDeciderUI(M)){ms.lim=120;M.ev.push({m:90,t:'inj',home:true,txt:'Empate: se juega la prórroga.'});runAuto(M,120);}
  refreshAll();endMatchUI();
}
function simToHT(){
  const ms=UI.ms;if(!ms||ms.done||ms.ht)return;clearInterval(UI.mt);UI.mt=null;
  if(ms.M.keyPending)resolveKey(ms.M,null);
  runAuto(ms.M,45);ms.ht=true;refreshAll();pauseHT();
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');if(!b||!UI.ms||!UI.m||UI.m.type!=='match')return;const a=b.dataset.act;
  if(a==='mskip'){simToEnd();e.stopImmediatePropagation();e.preventDefault();return;}
  if(a==='mtoht'){simToHT();e.stopImmediatePropagation();e.preventDefault();return;}
  if(a==='mpause'){const ms=UI.ms;if(ms.done)return;if(ms.paused){ms.paused=false;b.textContent='⏸';$('#mPanel').innerHTML='';startTimer();}else if(!ms.paused){ms.paused=true;clearInterval(UI.mt);UI.mt=null;b.textContent='▶';}e.stopImmediatePropagation();e.preventDefault();return;}
},true);
document.addEventListener('change',e=>{
  if(e.target&&e.target.id==='mHTpref'){try{localStorage.setItem('gaffer.htpause',e.target.checked?'1':'0');}catch(x){}if(UI.ms)UI.ms.pauseHT=e.target.checked;}
});

/* ---- momentos clave ---- */
function showKey(){
  const ms=UI.ms,M=ms.M;if(!M.keyPending)return;
  const k=M.keyPending,info=keyOptions(M);
  $('#mMin').textContent=`Min ${M.m}'`;$('#mScore').textContent=`${M.hg}-${M.ag}`;updatePulse();
  $('#mPanel').innerHTML=`<div class="panel keycard" style="margin-top:12px"><div class="hd"><h2>Momento clave · min ${k.m}'</h2><span class="chip ${info.kind==='att'?'good':'bad'}">${info.kind==='att'?'Tu ocasión':'Ocasión rival'}</span></div>
   <p style="margin:6px 0 10px">${esc(info.txt)}</p>
   <div class="keyopts">${info.opts.map(o=>`<button class="btn ${o.k==='shoot'||o.k==='press'?'pri':''}" data-act="mkey" data-v="${o.k}"><b>${o.l}</b><span class="sub">${esc(o.h)}</span></button>`).join('')}</div>
   <p class="sub" style="margin:8px 0 0">Ninguna opción es siempre mejor: cambia el riesgo y la recompensa. Si no decides, lo hace el entrenador asistente.</p></div>`;
}
function keyHTML(M){
  const sum=[];const me=M.hid===S.user;
  const evs=M.ev.filter(e=>e.t==='goal'||(e.xg||0)>=0.2).map(e=>({e,w:(e.t==='goal'?1:0)+(e.xg||0)})).sort((a,b)=>b.w-a.w).slice(0,3).sort((a,b)=>a.e.m-b.e.m);
  const log=M.keyLog||[];
  let h=`<div class="lbl" style="margin-top:12px">Los momentos que decidieron el partido</div>`;
  h+=evs.length?evs.map(({e})=>`<div class="ev ${e.t==='goal'?'goal':''}"><span class="m">${e.m}'</span><span>${esc(e.txt)} <span class="mute">(xG ${e.xg})${e.key?' · lo jugaste tú':''}</span></span></div>`).join(''):'<div class="sub">Sin ocasiones claras.</div>';
  if(log.length){
    const mine=log.filter(x=>x.mine),goals=mine.filter(x=>x.res==='goal').length;
    h+=`<div class="lbl" style="margin-top:10px">Tus decisiones (${log.length} momento${log.length===1?'':'s'} jugado${log.length===1?'':'s'})</div>`+log.map(x=>`<div class="kv"><span>${x.m}' · ${esc(x.who)} · ${esc(x.choice)}</span><b class="${x.res==='goal'?(x.mine?'good':'bad'):''}">${x.res==='goal'?'Gol':x.res==='save'?'Parada':'Fuera'}</b></div>`).join('')+`<div class="sub">El resto del partido se simuló. Tus ocasiones jugadas dieron ${goals} gol${goals===1?'':'es'}.</div>`;
  }else h+=`<div class="sub" style="margin-top:6px">Partido sin momentos jugados: todo simulado.</div>`;
  return h;
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');if(!b||!UI.ms||!UI.m||UI.m.type!=='match')return;const a=b.dataset.act;
  if(a==='mkey'){const ms=UI.ms,M=ms.M,before=M.ev.length;resolveKey(M,b.dataset.v);for(let i=before;i<M.ev.length;i++){feedAdd(M.ev[i]);addShot(M.ev[i]);if(M.ev[i].t==='goal'){const s=$('#p2d');if(s){s.classList.add('goal');setTimeout(()=>s.classList.remove('goal'),900);}}}
    $('#mScore').textContent=`${M.hg}-${M.ag}`;updatePulse();$('#mPanel').innerHTML='';ms.paused=false;const pb=$('#mPause');if(pb)pb.textContent='⏸';startTimer();e.stopImmediatePropagation();e.preventDefault();return;}
  if(a==='mkeytoggle'){const ms=UI.ms,M=ms.M;M.keyOn=!M.keyOn;b.textContent='Momentos clave: '+(M.keyOn?'ON':'OFF');b.classList.toggle('on',M.keyOn);if(M.keyOn){ms.speed=4;document.querySelectorAll('#mSpeed .btn[data-v]').forEach(x=>x.classList.toggle('on',+x.dataset.v===4));if(!ms.done&&!ms.paused)startTimer();}e.stopImmediatePropagation();e.preventDefault();return;}
},true);
