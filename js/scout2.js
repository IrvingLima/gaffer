"use strict";
/* ================= ojeo con encargos, informes periódicos y avisos (también cuando no hay resultados) ================= */
DECISIONS.push('scoutrep');
setMission=function(sid,cfg){
  S.scout.miss[sid]={nat:cfg.nat,pos:cfg.pos||'ALL',maxAge:cfg.maxAge||23,minPot:cfg.minPot||0,maxVal:cfg.maxVal||0,only:cfg.only||'all',
    dur:cfg.dur||0,every:cfg.every||2,wk:0,follow:null,found:[],pending:[]};
};
const SC_TESTS={
  pos:(p,m)=>m.pos==='ALL'||p.pos===m.pos,
  age:(p,m)=>p.age<=m.maxAge,
  pot:(p,m)=>p.pot>=m.minPot,
  val:(p,m)=>!m.maxVal||valueOf(p)<=m.maxVal,
  only:(p,m)=>!m.only||m.only==='all'||(m.only==='ending'&&(p.club==null||p.ce<=S.Y))
};
const SC_NAMES={pos:'posición',age:'edad máxima',pot:'potencial mínimo',val:'precio máximo',only:'situación de contrato'};
const scoutPool=m=>playersOfCountry(m.nat).filter(p=>p&&p.club!==S.user&&p.where!=='retired');
const scoutMatches=(m,all,skip)=>all.filter(p=>Object.keys(SC_TESTS).every(k=>k===skip||SC_TESTS[k](p,m)));
/* si no hay nadie, dice qué filtro está sobrando */
function emptyReason(m,all,match){
  const nm=NAT[m.nat].nm;
  if(!match.length){
    const opts=Object.keys(SC_TESTS).map(k=>[k,scoutMatches(m,all,k).length]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
    return opts.length?`Nadie en ${nm} cumple todos los requisitos. Si quitas el filtro de ${SC_NAMES[opts[0][0]]}, aparecen ${opts[0][1]} jugadores.`:`Nadie en ${nm} cumple los requisitos. Afloja varios filtros o cambia de país.`;
  }
  const fresh=match.filter(p=>(S.know[p.id]||0)<60).length;
  return fresh?`No ha habido hallazgos nuevos en ${nm} en este periodo. Quedan ${fresh} candidatos por ver.`:`Ya conoces bien a los ${match.length} jugadores de ${nm} que cumplen. Cambia de país o de filtros.`;
}
function deliverReport(s,o){
  S.scout.deliv=S.scout.deliv||[];
  const rec={id:S.uid++,t:S.t,sid:s.id,sname:s.nm,nat:o.nat,pids:o.pids||[],note:o.note||'',done:!!o.done,follow:!!o.follow,wk:o.wk||0,read:false};
  S.scout.deliv.unshift(rec);if(S.scout.deliv.length>30)S.scout.deliv.length=30;
  const n=rec.pids.length,nm=NAT[o.nat]?NAT[o.nat].nm:o.nat,best=n?S.players[rec.pids[0]]:null;
  const title=rec.follow?`Informe completo: ${best.name}`:n?`Ojeo en ${nm}: ${n} jugador${n===1?'':'es'}`:`Ojeo en ${nm}: sin resultados`;
  const body=rec.follow?`${s.nm} ha terminado el seguimiento. ${rec.note}`:n?`${s.nm} destaca a ${best.name} (${best.age} años, ${POSL[best.pos]}, potencial ${showPot(best)}).${rec.done?' La misión ha terminado.':''}`:`${s.nm}: ${rec.note}${rec.done?' La misión ha terminado.':''}`;
  S.inbox.forEach(x=>{if(x.ty==='scoutrep'&&!x.done&&x.sid===s.id)x.done=true;});
  inbox({ty:'scoutrep',title,body,rep:rec.id,sid:s.id,exp:S.t+28,ch:[{k:'see',l:'Ver informe'},{k:'ok',l:'Entendido'}]});
  return rec;
}
scoutWeek=function(){
  const c=userClub();if(!c)return;
  S.staff.hired.filter(s=>s.role==='scout').forEach(s=>{
    const m=S.scout.miss[s.id];if(!m)return;m.wk++;c.budget-=2500+(NAT[m.nat].reg!==NAT[c.cc].reg?3500:0);
    m.found=m.found||[];m.pending=m.pending||[];m.every=m.every||2;
    const kn=s.kn[m.nat]||3;
    if(m.follow){
      const p=S.players[m.follow];
      if(!p||p.where==='retired'||p.club===S.user){m.follow=null;}
      else{raiseK(p,s,10+kn*0.7);
        if((S.know[p.id]||0)>=100){deliverReport(s,{nat:m.nat,pids:[p.id],follow:true,note:`Nivel real ${p.ovr}, potencial ${p.pot}.`,wk:m.wk});m.follow=null;}
        return;}
    }
    const all=scoutPool(m),match=scoutMatches(m,all);
    const pool=match.filter(p=>S.know[p.id]===undefined||S.know[p.id]<60);
    if(pool.length){
      pool.sort((a,b)=>(b.pot+gauss()*s.jp*0.8)-(a.pot+gauss()*s.jp*0.8));
      const n=Math.max(1,Math.round(0.6+(kn+s.ja)/16));
      for(let i=0;i<n&&i<pool.length;i++){
        const p=pool[ri(0,Math.min(pool.length-1,Math.floor(pool.length*0.35)))];
        const was=S.know[p.id]!==undefined&&S.know[p.id]>=35;
        raiseK(p,s,was?10:Math.max(0,38+kn*1.3-(kOf(p))));
        if(!S.reports.some(r=>r.pid===p.id&&S.t-r.t<60))S.reports.unshift({t:S.t,sid:s.id,pid:p.id,nat:m.nat});
        if(!m.found.includes(p.id)){m.found.push(p.id);m.pending.push(p.id);}
      }
    }
    if(m.found.length>120)m.found=m.found.slice(-120);
    const done=!!m.dur&&m.wk>=m.dur;
    if(done||m.wk%m.every===0||(m.wk===1&&!match.length)){
      const pids=m.pending.filter(i=>S.players[i]&&S.players[i].club!==S.user).sort((a,b)=>midPot(S.players[b])-midPot(S.players[a])).slice(0,8);
      deliverReport(s,{nat:m.nat,pids,note:pids.length?'':emptyReason(m,all,match),done,wk:m.wk});
      m.pending=[];
      if(done)delete S.scout.miss[s.id];
    }
  });
  if(S.reports.length>150)S.reports.length=150;
};
/* valoración del ojeador: ¿merece la pena? */
function scoutGrade(p){
  const c=userClub(),fee=p.where==='free'||p.where==='pool'&&p.club==null?0:estFee(p),line=lineup(c.id).xi.filter(x=>x.slot===p.pos&&x.p.id>0).map(x=>x.p.ovr),weak=line.length?Math.min(...line):60;
  const ovr=midOvr(p),pot=midPot(p),now=ovr-weak,future=pot-weak,pay=fee<=c.budget,k=S.know[p.id]||0;
  const score=now*2+future*1.2+(p.age<=21?4:0)-(p.age>=31?6:0)-(pay?0:10);
  if((now>=0||future>=6)&&!pay)return {l:'Fuera de presupuesto',cls:'warn',score,why:`Pedirían unos ${EUR(fee)} y tienes ${EUR(c.budget)}.`};
  if(now>=1&&p.age<=30)return {l:'Fichar ya',cls:'good',score,why:`Mejora a tu titular más flojo de la línea (+${now}).`};
  if(future>=5&&p.age<=23)return {l:k<70?'Seguir observando':'Apuesta de futuro',cls:'info',score,why:`Puede superar a tus titulares en ${future} puntos.`};
  return {l:'No encaja',cls:'',score,why:now<0?`Hoy está ${-now} puntos por debajo de tu once.`:'No aporta una mejora clara.'};
}
