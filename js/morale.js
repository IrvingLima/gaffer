"use strict";
/* ================= moral por jugador y plan de entrenamiento individual (propuestas a validar) ================= */
const MAX_PLANS=5;
function moraleWeek(){
  const c=userClub();if(!c)return;
  const L=lineup(c.id),starters=new Set(L.xi.map(x=>x.p.id)),pl=c.players.map(i=>S.players[i]).filter(Boolean);
  const sorted=pl.slice().sort((a,b)=>b.ovr-a.ovr),cut=sorted[Math.floor(sorted.length*0.5)]?sorted[Math.floor(sorted.length*0.5)].ovr:50;
  const form=(c.form5||[]).slice(-3),res=form.reduce((s,x)=>s+(x==='W'?1:x==='L'?-1:0),0);
  pl.forEach(p=>{
    if(p.mo==null)p.mo=70;
    let d=0;const why=[];
    const played=p.lp>0&&S.t-p.lp<=10;
    if(starters.has(p.id)&&played){d+=1.4;why.push(['up','Es titular y juega']);}
    else if(!played&&p.ovr>=cut&&!p.inj){d-=2.2;why.push(['dn','Merece jugar más y no lo hace']);}
    else if(!played&&p.age<=21){d-=0.8;why.push(['dn','Quiere minutos para crecer']);}
    if(res>0){d+=0.5*res;why.push(['up','Buenos resultados del equipo']);}else if(res<0){d+=0.5*res;why.push(['dn','Malos resultados del equipo']);}
    const fair=wageOf(p);
    if(p.ovr>=65&&p.w<fair*0.75){d-=1;why.push(['dn','Cobra menos de lo que vale']);}
    if(p.ce<=S.Y&&dateOf(S.t).getUTCMonth()+1>=3&&dateOf(S.t).getUTCMonth()+1<=6){d-=0.6;why.push(['dn','Su contrato termina en junio']);}
    if(p.nb){/* sin efecto */}
    d+=(70-p.mo)*0.05;
    p.mo=clamp(Math.round((p.mo+d)*10)/10,0,100);
    p.mr=why.slice(0,3);
  });
}
const moraleFactor=p=>p.mo==null?1:1+0.0006*(p.mo-70);
const moraleLabel=m=>m>=80?'Entusiasmado':m>=60?'Contento':m>=40?'Neutral':m>=25?'Descontento':'Quiere salir';
function moraleHTML(p){
  if(p.mo==null||p.club!==S.user)return '';
  return `<div class="evol"><div class="row spread" style="margin-bottom:6px"><b>Moral</b><span class="chip ${p.mo>=60?'good':p.mo>=40?'':'bad'}">${moraleLabel(p.mo)} · ${Math.round(p.mo)}</span></div><div class="bar ${p.mo<30?'low':p.mo<55?'mid':''}"><i style="width:${p.mo}%"></i></div>
   ${(p.mr||[]).map(r=>`<div class="why ${r[0]==='up'?'good':'bad'}">${esc(r[1])}</div>`).join('')}<div class="sub" style="margin-top:4px">Con la moral baja rinde hasta un 4 % menos; alta, hasta un 2 % más.</div></div>`;
}
function planHTML(p){
  if(p.club!==S.user||p.where==='retired')return '';
  const L=p.pos==='GK'?ATTL.gk:ATTL.out,used=userClub().players.map(i=>S.players[i]).filter(x=>x&&x.plan!=null).length;
  return `<div class="evol"><div class="row spread" style="margin-bottom:6px"><b>Plan individual</b><span class="sub">${used}/${MAX_PLANS} plazas usadas</span></div>
   <select id="plan_sel" data-id="${p.id}" aria-label="Plan de entrenamiento individual"><option value="">Sin plan (entrenamiento del equipo)</option>${L.map((n,i)=>`<option value="${i}" ${p.plan===i?'selected':''}>Reforzar ${n}</option>`).join('')}</select>
   <div class="sub" style="margin-top:4px">Un jugador con plan crece un 50 % más rápido y mejora ese atributo. Máximo ${MAX_PLANS} jugadores a la vez.</div></div>`;
}
if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('change',e=>{
  const t=e.target;if(!t||t.id!=='plan_sel'||!S)return;const p=S.players[+t.dataset.id];if(!p)return;
  const v=t.value===''?null:+t.value;
  if(v!=null&&p.plan==null&&userClub().players.map(i=>S.players[i]).filter(x=>x&&x.plan!=null).length>=MAX_PLANS){toast(`Solo puedes tener ${MAX_PLANS} planes individuales: quita uno primero.`);t.value='';return;}
  p.plan=v;save();toast(v==null?'Plan individual retirado.':'Plan individual asignado.');renderModal();
});
