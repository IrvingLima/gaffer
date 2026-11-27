"use strict";
/* ================= base de interfaz ================= */
const UI={tab:'home',sub:{team:'squad',acad:'squad',scout:'map',market:'hub',club:'staff',league:'table',career:'profile'},
  f:{sq:'ALL',cards:(typeof innerWidth!=='undefined'&&innerWidth<640),mk:{pos:'ALL',nat:'ALL',minOvr:0,maxAge:40,q:'',sort:'ovr',only:'ALL'},rep:{pos:'ALL',maxAge:40},lg:null,wl:null},
  sel:{nat:null},m:null,setup:{step:'country',cc:null,tier:1,idx:0,mgr:'',create:{city:'',suf:'',c1:'#2fbf84',c2:'#f2f2f0',pat:0,stad:''}},mt:null,drawer:{}};
const ICONS={
 home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
 tactics:'M3 5h18v14H3zM12 5v14M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0',sprout:'M12 22v-9M12 13c0-4 3-7 8-7 0 5-3 8-8 8M12 15c0-3-2-5-6-5 0 4 2 6 6 6',
 swap:'M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7',wallet:'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7V6a2 2 0 0 1 2-2h12M16 14h2',
 trophy:'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
 globe:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2c3 3 4.5 6.5 4.5 10S15 19 12 22c-3-3-4.5-6.5-4.5-10S9 5 12 2z',
 brief:'M3 8h18v12H3zM8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 13h18',plus:'M12 5v14M5 12h14',check:'M5 12l5 5 9-10',x:'M6 6l12 12M18 6L6 18',
 star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
 arrow:'M5 12h14M13 6l6 6-6 6',back:'M19 12H5M11 6l-6 6 6 6',bolt:'M13 2L4 14h7l-1 8 9-12h-7z',shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
 bell:'M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0',search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',cal:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
 flag:'M5 21V4M5 4h13l-2 4 2 4H5',cog:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 8.5 4 8l-1 3 2 1v2l-2 1 1 3 2-.5L7.5 19l-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1z',
 whistle:'M3 14a5 5 0 0 0 5 5h8a5 5 0 0 0 0-10H9L3 6v8M17 9V5',book:'M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4zM8 4v12'
};
const ic=(n,c)=>`<svg class="ic ${c||''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n]||ICONS.star}"/></svg>`;
let CID=0;
function crest(c,size){
  size=size||40;const id='cp'+(CID++),t=lum(c.c1)>0.4?'#111':'#fff';
  const shield=CREST_SHAPES[(c.sh||0)%CREST_SHAPES.length];
  const k=(c.pat||0)%NPATS,R=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.c2}"/>`,body=crestPattern(k,R,c.c2);
  /* en los diseños partidos las iniciales van sobre una placa para que se lean */
  const busy=[1,2,5,7,8,9].includes(k),ty=k===0?19:k===10?27:k===4?35:23;
  return `<svg width="${size}" height="${Math.round(size*1.1)}" viewBox="0 0 40 44" role="img" aria-label="Escudo ${esc(c.name)}" style="flex:none"><defs><clipPath id="${id}"><path d="${shield}"/></clipPath></defs>
   <path d="${shield}" fill="${c.c1}"/><g clip-path="url(#${id})">${body}</g><path d="${shield}" fill="none" stroke="${lum(c.c1)<0.12?'#ffffff55':'#00000055'}" stroke-width="1.4"/>${busy?`<rect x="8" y="${ty-11}" width="24" height="14" rx="3" fill="${c.c1}" opacity=".93"/>`:''}
   <text x="20" y="${ty}" text-anchor="middle" font-family="Big Shoulders Display,Arial Narrow,sans-serif" font-weight="800" font-size="12" letter-spacing=".5" fill="${t}" stroke="${t==='#fff'?'#0006':'#fff6'}" stroke-width=".5" paint-order="stroke">${esc(c.short)}</text></svg>`;
}
/* ---- acento del club ---- */
const isDark=()=>document.documentElement.dataset.theme!=='light';
function pickAccent(c1,c2,dark){
  const ok=h=>dark?lum(h)>=0.19:lum(h)<=0.15;
  const base=[c1,c2].sort((a,b)=>satur(b)-satur(a))[0];
  if(satur(base)>40){
    if(ok(base))return base;
    for(let t=0.05;t<=1;t+=0.05){const m=mixHex(base,dark?'#ffffff':'#000000',t);if(ok(m))return m;}
  }
  const cands=[c1,c2].filter(ok);
  if(cands.length)return cands[0];
  return dark?'#ffffff':'#000000';
}
function applyAccent(){
  const dark=isDark(),r=document.documentElement.style,c=userClub();
  const col=c?pickAccent(c.c1,c.c2,dark):(dark?'#2fbf84':'#157a42');
  r.setProperty('--acc',col);r.setProperty('--acc-ink',lum(col)>0.32?'#0a0e0d':'#ffffff');
}
/* ---- piezas de jugador ---- */
const tierOf=v=>v>=84?'elite':v>=75?'gold':v>=65?'silver':'bronze';
const posTag=(g,p)=>{const k=p&&p.sp?p.sp:null;return `<span class="pos ${g}" ${k?`title="${SPN[k]}"`:''}>${k?SPL[k]:POSL[g]}</span>`;};
function deltaChip(p,big){
  if(!S||seen(p).e1!==0)return '';
  const d=recentDelta(p,28)||0;if(!d)return '';
  return `<span class="dl ${d>0?'up':'dn'} ${big?'big':''}" title="${d>0?'Ha subido':'Ha bajado'} ${Math.abs(d)} de nivel en los últimos 28 días">${d>0?'▲':'▼'}${Math.abs(d)}</span>`;
}
function ovrChip(p){const s=showOvr(p),rg=s.includes('–');return `<span class="ovr ${tierOf(midOvr(p))} ${rg?'rg':''}">${s}</span>${deltaChip(p)}`;}
const fitBar=v=>`<div class="bar ${v<45?'low':v<70?'mid':''}" role="img" aria-label="Condición ${Math.round(v)}%"><i style="width:${v}%"></i></div>`;
function statLabels(p){return p.pos==='GK'?ATTL.gk:ATTL.out;}
function evolBlock(p){
  if(seen(p).e1!==0)return '';
  const chg=p.chg||[],tot=chg.reduce((s,x)=>s+x[1],0),base=p.ovr-tot;
  const vals=[base];chg.forEach(x=>vals.push(vals[vals.length-1]+x[1]));
  const lo=Math.min(...vals,p.ovr0),hi=Math.max(...vals,p.ovr0)+0.001,W=220,H=44;
  const pts=vals.map((v,i)=>[vals.length<2?W/2:6+i*(W-12)/(vals.length-1),H-6-(v-lo)/Math.max(1,hi-lo)*(H-12)]);
  const line=pts.length>1?`<polyline points="${pts.map(q=>q.join(',')).join(' ')}" fill="none" stroke="var(--acc)" stroke-width="2"/>`:`<line x1="6" x2="${W-6}" y1="${H/2}" y2="${H/2}" stroke="var(--line2)" stroke-width="2" stroke-dasharray="4 4"/>`;
  const dots=pts.map((q,i)=>`<circle cx="${q[0]}" cy="${q[1]}" r="${i===pts.length-1?3.6:2.4}" fill="${i===pts.length-1?'var(--acc)':'var(--s1)'}" stroke="var(--acc)" stroke-width="1.5"/>`).join('');
  const sd=p.ovr-p.ovr0,grows=p.age<=24&&p.ovr<p.pot,played=p.lp>0&&S.t-p.lp<=10;
  const note=p.age>=30?'Por edad, su nivel tiende a bajar poco a poco.':grows?(played?'Está jugando: crece a ritmo normal.':(p.where==='acad'?'Aún no suma minutos competitivos: su crecimiento va más lento.':'No está jugando: su crecimiento se frena. Dale minutos.')):(p.age>=27?'Está en su techo: rinde cerca de su nivel máximo.':'Ha tocado su potencial.');
  return `<div class="evol"><div class="row spread" style="margin-bottom:4px"><b>Evolución</b><span class="sub">Inicio de temporada ${p.ovr0} → ahora <b>${p.ovr}</b> ${sd?`<span class="dl ${sd>0?'up':'dn'}">${sd>0?'▲':'▼'}${Math.abs(sd)}</span>`:'<span class="sub">(sin cambios)</span>'}</span></div>
   <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${line}${dots}</svg>
   <div class="sub" style="margin:6px 0">${note}</div>
   <div class="ev-row"><span>Partidos esta temporada</span><b>${p.ap||0}${p.g?` · ${p.g} gol${p.g===1?'':'es'}`:''}</b></div>
   <div class="ev-row"><span>Último partido</span><b>${p.lp>0?'hace '+Math.max(0,S.t-p.lp)+' días':'—'}</b></div>
   ${chg.slice(-4).reverse().map(x=>`<div class="ev-row"><span>${fmtD(x[0])}</span><b class="${x[1]>0?'good':x[1]<0?'bad':''}">${x[1]?`${x[1]>0?'+':''}${x[1]} nivel`:''}${x[2]?` ${x[2]>0?'+':''}${x[2]} potencial`:''}</b></div>${x[3]?`<div class="sub why-row">${esc(x[3])}</div>`:''}`).join('')}</div>`;
}
function roleBlock(p){
  const known=seen(p).k>=40,alt=(p.alt||[]).map(k=>`<span class="pos alt ${SPG[k]}" title="Puede jugar de ${SPN[k]}">${SPL[k]}</span>`).join('');
  const st=n=>'★'.repeat(n||1)+'☆'.repeat(5-(n||1));
  return `<div class="rolebox"><div class="row" style="gap:6px"><span class="lbl">Posición</span>${posTag(p.pos,p)}<span class="sub">${p.sp?SPN[p.sp]:''}</span>${alt?`<span class="lbl" style="margin-left:6px">Alternativas</span>${alt}`:''}</div>
   <div class="row" style="gap:16px;margin-top:6px"><span class="sub">Regates <b class="stars-s">${known?st(p.sm):'?????'}</b></span><span class="sub">Pie malo <b class="stars-s">${known?st(p.wf):'?????'}</b></span></div>
   <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap">${known?((p.ps||[]).map(k=>`<span class="chip ps" title="${esc(PLAYSTYLES[k].d)}">${PLAYSTYLES[k].nm}</span>`).join('')||'<span class="sub">Sin estilos destacados</span>'):'<span class="sub">Ojéalo más para conocer sus estilos de juego</span>'}</div></div>`;
}
function fcard(p,opt){
  opt=opt||{};const s=seen(p),t=tierOf(Math.round((s.ovr[0]+s.ovr[1])/2));
  const gem=(p.age<=21&&s.pot[0]>=82)||(p.where==='acad'&&p.known&&p.pot>=85);
  const L=statLabels(p),show=s.k>=60;
  return `<div class="fc ${t} ${gem?'gem':''}" data-act="player" data-id="${p.id}" role="button" tabindex="0" aria-label="${esc(p.name)}, ${POSL[p.pos]}, nivel ${showOvr(p)}">
   <span class="tl">${flag(p.nat,13)}<small>${p.nat}</small></span>${opt.tag?`<span class="tag">${opt.tag}</span>`:''}
   <div class="fo ${s.e1?'rg':''}">${showOvr(p)}</div>${deltaChip(p,true)}<div class="fp">${p.sp?SPL[p.sp]:POSL[p.pos]}</div><div class="fn">${esc(p.name)}</div>
   <div class="fs">${p.a.map((v,i)=>`<span>${L[i]} <b>${show?v:'?'}</b></span>`).join('')}</div>
   <div class="st">${p.age} años${opt.extra?' · '+opt.extra:''}</div><div class="fk" title="Regates ${p.sm||1}★ · Pie malo ${p.wf||1}★"><span>RG ${'★'.repeat(p.sm||1)}</span><span>PM ${'★'.repeat(p.wf||1)}</span></div></div>`;
}
function radar(p,size){
  size=size||210;const c=size/2,r=size*0.36,L=statLabels(p),n=6;
  const pt=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n,rr=r*v/100;return [c+Math.cos(a)*rr,c+Math.sin(a)*rr];};
  const s=seen(p),exact=s.k>=60;
  const grid=[25,50,75,100].map(g=>`<polygon points="${[...Array(n)].map((_,i)=>pt(i,g).join(',')).join(' ')}" fill="none" stroke="var(--line2)" stroke-width=".8"/>`).join('');
  const poly=`<polygon points="${p.a.map((v,i)=>pt(i,exact?v:Math.min(v,s.ovr[1]+5)).join(',')).join(' ')}" fill="var(--acc)" fill-opacity="${exact?.3:.12}" stroke="var(--acc)" stroke-width="2" ${exact?'':'stroke-dasharray="4 3"'}/>`;
  const lab=L.map((l,i)=>{const [x,y]=pt(i,122);return `<text x="${x}" y="${y+3}" text-anchor="middle" font-size="10.5" font-weight="600" style="fill:var(--mute)">${l} ${exact?p.a[i]:'?'}</text>`;}).join('');
  return `<svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:${size}px;margin:0 auto" role="img" aria-label="Atributos">${grid}${poly}${lab}</svg>`;
}
function potBar(p){
  const s=seen(p),pct=v=>clamp(v,0,100)+'%';
  if(s.e2===0)return `<div class="pot" role="img" aria-label="Nivel ${p.ovr}, potencial ${p.pot}"><div class="cur" style="width:${pct(p.ovr)}"></div><div class="exact" style="left:calc(${pct(p.pot)} - 1px)"></div></div><div class="scale"><span>Nivel ${p.ovr}</span><span class="gold">Potencial ${p.pot}</span></div>`;
  return `<div class="pot" role="img" aria-label="Potencial estimado ${s.pot[0]} a ${s.pot[1]}"><div class="cur" style="width:${pct(s.ovr[0])}"></div><div class="rng" style="left:${pct(s.pot[0])};width:${Math.max(2,s.pot[1]-s.pot[0])}%"></div></div><div class="scale"><span>Nivel ${showOvr(p)}</span><span class="gold">Potencial ${s.pot[0]}–${s.pot[1]} · confianza ${Math.round(100-s.e2*100/16)}%</span></div>`;
}
const confChip=p=>{const k=Math.round(Math.min(kOf(p),(p.where==='acad'&&!p.known)?20+(p.wk||0)*5+staffAbSafe('youth')*2.5:100));return `<span class="chip ${k>=80?'good':k>=45?'info':''}">Info ${k}%</span>`;};
function avatar(p){const col={GK:'#e0b341',DEF:'#6aa5ff',MID:'#59d18c',FWD:'#ff8f5c'}[p.pos];return `<div class="avatar" style="color:${col};border-color:${col}66;background:${col}14">${esc(inits(p))}</div>`;}
/* ---- tablas de clubes ---- */
function miniTable(lg,focusId,rows){
  const t=sortedTable(lg),idx=Math.max(0,t.findIndex(r=>r.id===focusId)),n=rows||5,a=clamp(idx-Math.floor(n/2),0,Math.max(0,t.length-n));
  return `<table><tr><th>#</th><th>Club</th><th class="n">PJ</th><th class="n">DG</th><th class="n">Pts</th></tr>${t.slice(a,a+n).map(r=>{const cl=S.clubs[r.id];
   return `<tr class="${r.id===focusId?'me':''}"><td>${t.indexOf(r)+1}</td><td><div class="club">${crest(cl,22)}<span>${esc(cl.name)}</span></div></td><td class="n">${r.p}</td><td class="n">${r.gf-r.ga}</td><td class="n"><b>${r.pts}</b></td></tr>`;}).join('')}</table>`;
}
/* ---- toasts y modales ---- */
function toast(m){const el=document.createElement('div');el.className='toast';el.textContent=m;$('#toasts').appendChild(el);setTimeout(()=>el.remove(),3200);}
function openModal(m){UI.m=m;renderModal();}
function closeModal(){UI.m=null;UI._mt=null;if(UI.mt){clearInterval(UI.mt);UI.mt=null;}UI.ms=null;$('#modalRoot').innerHTML='';render();}
function ask(msg,onYes,label,danger){UI.ask=onYes;openModal({type:'confirm',msg,label:label||'Confirmar',danger});}
function modalShell(title,inner,cls){return `<div class="modal" data-act="mbg"><div class="box ${cls||''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mhead"><h2>${esc(title)}</h2><button class="xbtn" data-act="mclose" aria-label="Cerrar">${ic('x')}</button></div>${inner}</div></div>`;}
const bn=(t,cls,act,extra)=>`<button class="btn ${cls||''}" data-act="${act}" ${extra||''}>${t}</button>`;
const dt=t=>fmtD(t);
const money=EUR;
/* ---- helpers de entrada/formularios ---- */
const slider=(id,label,min,max,step,val,fmt)=>`<div class="field"><label for="${id}">${label}</label><div class="val" id="${id}v">${fmt(val)}</div><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-fmt="${id}"></div>`;
