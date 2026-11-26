"use strict";
/* ================= alineación, ratings y motor de partido ================= */
const eff=p=>p.ovr*(0.8+0.2*p.fit/100);
const staffAb=role=>{const c=userClub();if(!c||!S.staff)return 8;const s=S.staff.hired.find(x=>x.role===role);return s?s.ab:3;};
const aiAb=c=>clamp(Math.round(5+(c.skill-60)/3.2),3,15);
const sAb=(cid,role)=>cid===S.user?staffAb(role):aiAb(S.clubs[cid]);

/* asignación óptima jugador→hueco (algoritmo húngaro): nadie «roba» el sitio de un especialista */
function hungarian(cost){
  const n=cost.length,m=cost[0]?cost[0].length:0,INF=1e15,u=Array(n+1).fill(0),v=Array(m+1).fill(0),p=Array(m+1).fill(0),way=Array(m+1).fill(0);
  for(let i=1;i<=n;i++){
    p[0]=i;let j0=0;const minv=Array(m+1).fill(INF),used=Array(m+1).fill(false);
    do{used[j0]=true;const i0=p[j0];let delta=INF,j1=0;
      for(let j=1;j<=m;j++)if(!used[j]){const cur=cost[i0-1][j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0;}if(minv[j]<delta){delta=minv[j];j1=j;}}
      for(let j=0;j<=m;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else minv[j]-=delta;}
      j0=j1;}while(p[j0]!==0);
    do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);
  }
  const res=Array(n).fill(-1);for(let j=1;j<=m;j++)if(p[j])res[p[j]-1]=j-1;return res;
}
function lineup(cid,useOut){
  const c=S.clubs[cid],fk=useOut?(c.formOut||c.form):c.form,f=FORMS[fk];
  let pl=c.players.map(i=>S.players[i]).filter(p=>p&&!p.inj&&!(p.away&&p.away>=S.t));
  if(pl.length<11)pl=c.players.map(i=>S.players[i]).filter(Boolean);
  const SL=FSLOTS[fk]||FSLOTS['4-4-2'];
  const grpOf=i=>i===0?'GK':i<=f[0]?'DEF':i<=f[0]+f[1]?'MID':'FWD';
  const sc=p=>eff(p)+(p.lock==='start'?100:0);
  const slots=Array(SL.length).fill(null),used=new Set();
  // 1) huecos fijados a mano por el entrenador
  const fix=(c.fix&&c.fix[fk])||{};
  Object.keys(fix).forEach(k=>{const i=+k,p=S.players[fix[k]];if(p&&c.players.includes(p.id)&&!p.inj&&!(p.away&&p.away>=S.t)&&!used.has(p.id)&&i<SL.length){slots[i]=p;used.add(p.id);}});
  // 2) el resto, por asignación óptima
  const freeIdx=SL.map((_,i)=>i).filter(i=>!slots[i]);
  const cand=pl.filter(p=>!used.has(p.id)&&p.lock!=='rest');
  if(freeIdx.length&&cand.length){
    const cost=freeIdx.map(i=>cand.map(p=>{const grp=grpOf(i);if((grp==='GK')!==(p.pos==='GK'))return 1e6;return -(sc(p)-posPen(p,SL[i])+psBonus(p,grp));}));
    const asg=hungarian(cost);
    freeIdx.forEach((i,k)=>{const j=asg[k];if(j>=0&&cost[k][j]<1e5){slots[i]=cand[j];used.add(cand[j].id);}});
  }
  // 3) huecos sin candidato natural: cualquiera disponible, con castigo
  freeIdx.forEach(i=>{if(slots[i])return;const grp=grpOf(i),rest=pl.filter(p=>!used.has(p.id)&&(grp==='GK'||p.pos!=='GK')).sort((a,b)=>sc(b)-sc(a));if(rest[0]){slots[i]=rest[0];used.add(rest[0].id);slots[i]._forced=true;}});
  const xi=SL.map((sp,i)=>{const p=slots[i],grp=grpOf(i);
    if(!p)return {p:{id:-1-i,name:'—',pos:grp,ovr:40,fit:100,a:[40,40,40,40,40,40],ps:[]},slot:grp,spos:sp,lat:2,e:40,pen:99,idx:i};
    const forced=p._forced;delete p._forced;const pen=forced?14:posPen(p,sp);
    return {p,slot:grp,spos:sp,lat:SPLAT[sp]!==undefined?SPLAT[sp]:2,e:eff(p)-pen+psBonus(p,grp),pen,idx:i,fixed:!!(fix[i]&&fix[i]===p.id)};});
  return {xi,bench:pl.filter(p=>!used.has(p.id)).sort((a,b)=>eff(b)-eff(a)).slice(0,9),form:fk};
}
/* compara todos los sistemas con tu plantilla: fuerza total y cuántos juegan en su posición natural */
function formationReport(cid){
  const c=S.clubs[cid],bak=c.form,res=[];
  Object.keys(FORMS).forEach(fk=>{c.form=fk;const L=lineup(cid),nat=L.xi.filter(x=>x.pen===0).length,near=L.xi.filter(x=>x.pen>0&&x.pen<=1.5).length,r=ratings(cid,L,false);
    res.push({fk,score:L.xi.reduce((s,x)=>s+x.e,0)/11,nat,near,off:L.xi.filter(x=>x.pen>=4).length,att:r.att,mid:r.mid,def:r.def});});
  c.form=bak;return res.sort((a,b)=>b.score-a.score);
}
function ratings(cid,L,home,mod){
  const c=S.clubs[cid],isU=cid===S.user;
  const avg=pos=>{const a=L.xi.filter(x=>x.slot===pos);return a.length?a.reduce((s,x)=>s+x.e,0)/a.length:40;};
  const r={gk:avg('GK'),def:avg('DEF'),mid:avg('MID'),att:avg('FWD')};
  r.def=r.def*0.85+r.gk*0.15;
  const tc=(mod&&mod.tactic)||c.tactic;
  if(tc==='attack'){r.att+=4.5;r.def-=6.5;}
  if(tc==='defense'){r.att-=4.5;r.def+=3.5;}
  const ins=(mod&&mod.ins)||c.ins||{};
  if(ins.press){r.att+=1;r.mid+=1.5;r.def+=0.5;}
  if(ins.line==='high'){r.mid+=1.2;r.def-=1.2;}
  if(ins.line==='deep'){r.def+=1.5;r.att-=2;}
  if(ins.width==='wide'){r.att+=1;r.mid-=1.2;}
  if(ins.width==='narrow'){r.mid+=1;r.att-=1;}
  if(mod&&mod.late){if(ins.press){r.mid-=4.5;r.att-=2.5;r.def-=1;}if(ins.tempo==='fast'){r.mid-=2;r.att-=1.2;}}
  {const a=sAb(cid,'asst'),g=sAb(cid,'gk');r.att+=a*0.1;r.mid+=a*0.1;r.def+=a*0.1;r.gk+=g*0.12;r.def+=g*0.02;}
  if(home){r.att+=3;r.mid+=3;}
  if(isU&&typeof preBonus==='function'){const pb=preBonus(cid);if(pb){r.att+=pb;r.mid+=pb;r.def+=pb*0.5;}}
  return r;
}
function weightedShooter(xi){
  const w={FWD:6,MID:2.5,DEF:0.8,GK:0.02},ws=xi.map(x=>w[x.slot]*Math.pow(x.p.ovr/60,2)*(1+0.12*((x.p.ps||[]).filter(k=>k==='definicion'||k==='canon').length)));
  let t=ws.reduce((a,b)=>a+b,0),r=Math.random()*t;
  for(let i=0;i<xi.length;i++){r-=ws[i];if(r<=0)return xi[i].p;}
  return xi[xi.length-1].p;
}
/* ----- estado de partido (se puede pausar al descanso) ----- */
function newMatch(hid,aid,detail){
  const hc=S.clubs[hid],ac=S.clubs[aid];
  // sin balón: el que está defendiendo usa su formación defensiva (aprox.: se mezcla)
  const M={hid,aid,detail:!!detail,m:0,hg:0,ag:0,hs:0,as:0,hx:0,ax:0,hsot:0,asot:0,pw:0,ev:[],goals:[],inj:[],subs:{h:0,a:0},mod:{h:{},a:{}}};
  M.H=lineup(hid);M.A=lineup(aid);M.recalc=()=>{M.hr=ratings(hid,M.H,true,{...M.mod.h,late:M.late});M.ar=ratings(aid,M.A,false,{...M.mod.a,late:M.late});
    // la formación "sin balón" empuja un poco hacia la defensa si tiene más defensas
    [[hc,M.hr,'h'],[ac,M.ar,'a']].forEach(([c,r])=>{const fi=FORMS[c.form],fo=FORMS[c.formOut||c.form];const d=fo[0]-fi[0];if(d){r.def+=d*1.2;r.att-=d*0.8;}});};
  M.recalc();return M;
}
function runMinutes(M,to){
  const hc=S.clubs[M.hid],ac=S.clubs[M.aid];
  const hu=M.hid===S.user,au=M.aid===S.user;
  const hi=(hu?hc.ins:hc.ins)||{},ai=ac.ins||{};
  while(M.m<to){
    M.m++;const m=M.m;if(m===60&&!M.late){M.late=true;M.recalc();}
    const ph=Math.pow(M.hr.mid,2.2)/(Math.pow(M.hr.mid,2.2)+Math.pow(M.ar.mid,2.2));M.pw+=ph;
    const rate=0.235*((hi.tempo==='fast'?1.12:hi.tempo==='slow'?0.9:1)+(ai.tempo==='fast'?1.12:ai.tempo==='slow'?0.9:1))/2;
    if(Math.random()<rate){
      const home=Math.random()<ph,T=home?M.hr:M.ar,O=home?M.ar:M.hr,XI=home?M.H.xi:M.A.xi;
      const q=1/(1+Math.exp(-(T.att-O.def)/14)),sh=weightedShooter(XI),xg=clamp(0.05+0.25*q,0.03,0.5);
      // modo «momentos clave»: las ocasiones de peso se detienen para que decidas
      if(M.keyOn&&(M.keyCount||0)<6&&m-(M.keyLast==null?-99:M.keyLast)>=8&&xg>=0.15&&((home&&hu)||(!home&&au&&xg>=0.26))){M.keyCount=(M.keyCount||0)+1;M.keyLast=m;M.keyPending={m,home,q,xg,sh:sh.id,mine:(home&&hu)||(!home&&au)};return;}
      shotOutcome(M,m,home,sh,xg,q,O,null);
    }
    if(M.detail&&Math.random()<0.012){const home=Math.random()<0.5,x=pick((home?M.H:M.A).xi);M.ev.push({m,t:'card',home,pid:x.p.id,txt:`Tarjeta amarilla para ${sname(x.p)}.`});}
    const fitC=(hu?staffAb('fit'):au?0:0);
    if(Math.random()<0.0042){
      const home=Math.random()<0.5,x=pick((home?M.H:M.A).xi),isU=(home?hu:au);
      const prot=1-sAb(isU?S.user:(home?M.hid:M.aid),'fit')*0.02;
      if(!x.p._hurt&&Math.random()<prot*(traitOf(x.p)==='Frágil'?1.5:1)){x.p._hurt=true;M.inj.push(x.p.id);if(M.detail)M.ev.push({m,t:'inj',home,pid:x.p.id,txt:`${sname(x.p)} se lesiona.`});}
    }
  }
}
/* resultado de una ocasión; mod = {on: prob. de ir a puerta ×, g: prob. de gol ×} cuando decide el jugador */
function shotOutcome(M,m,home,sh,xg,q,O,mod){
  if(home){M.hs++;M.hx+=xg;}else{M.as++;M.ax+=xg;}
  let kind='miss';
  const on=mod?mod.on:1,gm=mod?mod.g:1;
  if(Math.random()<(0.4+0.2*q)*on){
    if(home)M.hsot++;else M.asot++;
    const pg=clamp((0.23+0.3*(q-0.5)-(O.gk-65)*0.003)*gm,0.05,0.6);
    if(Math.random()<pg){kind='goal';if(home)M.hg++;else M.ag++;M.goals.push({pid:sh.id,home,m});}
    else kind='save';
  }
  if(M.detail||kind==='goal')M.ev.push({m,t:kind,home,pid:sh.id,xg:+xg.toFixed(2),key:!!mod,
    txt:kind==='goal'?`¡Gol de ${sh.name}! (${M.hg}-${M.ag})`:kind==='save'?`El portero detiene el remate de ${sname(sh)}.`:pick([`${sname(sh)} dispara desviado.`,`${sname(sh)} la manda por encima del larguero.`,`Ocasión clara perdida por ${sname(sh)}.`])});
  return kind;
}
/* opciones del momento clave, con su pista contextual (todas valen lo mismo «de media»: cambia el riesgo) */
function keyOptions(M){
  const k=M.keyPending,home=k.home,O=home?M.ar:M.hr,sh=(home?M.H:M.A).xi.find(x=>x.p.id===k.sh).p;
  if(k.mine){
    const fin=(sh.ps||[]).some(x=>x==='definicion'||x==='canon'),gk=O.gk;
    return {kind:'att',sh,txt:`${sh.name} se planta ante el área con una ocasión clara (xG ${k.xg.toFixed(2)}).`,opts:[
      {k:'shoot',l:'Rematar ya',h:fin?'Es un finalizador nato.':'La opción directa.',on:1,g:1+(fin?0.1:0)-(gk>=76?0.08:0)},
      {k:'pass',l:'Buscar el pase',h:gk>=76?'El portero rival es muy bueno: mejor ceder.':'Menos tiros, más calidad.',on:0.85,g:1.18+(gk>=76?0.06:0)},
      {k:'dribble',l:'Regatear',h:'Arriesgado: sale caro o sale redondo.',on:0.8,g:1.3}]};
  }
  return {kind:'def',sh,txt:`Peligro: ${sh.name} (rival) queda en una ocasión muy clara (xG ${k.xg.toFixed(2)}).`,opts:[
    {k:'press',l:'Salir a presionar',h:'Menos remates a puerta, pero mejores.',on:0.82,g:1.22},
    {k:'drop',l:'Replegar y cerrar',h:'Más tiros, de peor calidad.',on:1.1,g:0.91},
    {k:'hold',l:'Mantener la línea',h:'Sin cambios.',on:1,g:1}]};
}
function resolveKey(M,choice){
  const k=M.keyPending;if(!k)return null;M.keyPending=null;
  const home=k.home,O=home?M.ar:M.hr,sh=(home?M.H:M.A).xi.find(x=>x.p.id===k.sh).p,info=keyOptions({...M,keyPending:k});
  const o=info.opts.find(x=>x.k===choice)||info.opts[0];
  const kind=shotOutcome(M,k.m,home,sh,k.xg,k.q,O,{on:o.on,g:o.g});
  (M.keyLog=M.keyLog||[]).push({m:k.m,mine:k.mine,choice:o.l,res:kind,who:sh.name,xg:+k.xg.toFixed(2)});
  return kind;
}
/* simula hasta el minuto `to` resolviendo solos los momentos clave (modo automático) */
function runAuto(M,to){
  let g=0;while(M.m<to&&g++<400){runMinutes(M,to);if(M.keyPending)resolveKey(M,null);}
}
function matchSummary(M){
  const pos=Math.round(M.pw/Math.max(1,M.m)*100);
  const me=M.hid===S.user,my=me?M.hg:M.ag,op=me?M.ag:M.hg,mx=me?M.hx:M.ax,ox=me?M.ax:M.hx,msh=me?M.hs:M.as,mst=me?M.hsot:M.asot,mp=me?pos:100-pos;
  let why;
  if(my>op&&mx>=ox)why=`Victoria merecida: generaste más peligro (xG ${mx.toFixed(1)} vs ${ox.toFixed(1)}).`;
  else if(my>op)why=`Ganaste con algo de fortuna: el rival creó más (xG ${ox.toFixed(1)} vs ${mx.toFixed(1)}).`;
  else if(my<op&&mx>ox+0.4)why=`Perdiste pese a dominar (xG ${mx.toFixed(1)} vs ${ox.toFixed(1)}): ${mst} tiros a puerta y solo ${my} gol${my===1?'':'es'}. Mala suerte y acierto del portero rival.`;
  else if(my<op)why=`Derrota justa: el rival generó más (xG ${ox.toFixed(1)} vs ${mx.toFixed(1)})${mp<45?' y dominó la posesión':''}.`;
  else if(mx>ox+0.5)why=`Empate injusto: merecías más (xG ${mx.toFixed(1)} vs ${ox.toFixed(1)}).`;
  else if(ox>mx+0.5)why=`Empate valioso: el rival tuvo más peligro (xG ${ox.toFixed(1)} vs ${mx.toFixed(1)}).`;
  else why=`Partido equilibrado (xG ${mx.toFixed(1)} vs ${ox.toFixed(1)}).`;
  return {pos,why,my,op};
}
