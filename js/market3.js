"use strict";
/* ================= agentes libres todo el año y mercado de cada final de temporada ================= */
const POS_MIN={GK:2,DEF:6,MID:6,FWD:4},SQUAD_TOP=26;
/* el mercado de libres nunca se vacía: quedan siempre jugadores de nivel para quien quiera ficharlos */
const FREE_MIN=320,FREE_GOOD=14;
const goodFree=()=>S.free.reduce((n,i)=>n+(S.players[i]&&S.players[i].ovr>=75?1:0),0);
const posCount=c=>{const n={GK:0,DEF:0,MID:0,FWD:0};c.players.forEach(i=>{const p=S.players[i];if(p)n[p.pos]++;});return n;};
/* ¿le interesa este jugador al club?: hueco en la posición o mejora de sus titulares */
function clubWants(c,p,cnt){
  if(c.players.length>=26)return false;
  const q=clubQ(c);if(p.ovr<q-9||p.ovr>q+9)return false;
  if(p.age>=34&&p.ovr<q+2)return false;
  if(Math.max(300,wageOf(p))>Math.max(2000,c.wageCap*0.14))return false;
  const fit=c.players.reduce((n,i)=>{const x=S.players[i];return n+(x&&x.pos===p.pos&&!(x.inj>2)?1:0);},0);
  if(cnt[p.pos]<POS_MIN[p.pos]||fit<POS_MIN[p.pos]-1)return true;
  /* fuera de la ventana solo se cubren huecos; dentro, solo se ficha a quien mejora claramente a un titular */
  if(!winOpen(c.cc,S.t))return false;
  const mine=c.players.map(i=>S.players[i]).filter(x=>x&&x.pos===p.pos).sort((a,b)=>b.ovr-a.ovr);
  const ref=mine[Math.min(mine.length-1,p.pos==='GK'?0:p.pos==='FWD'?1:3)];
  return !ref||p.ovr>ref.ovr+1||(c.players.length<23&&p.age<=21&&p.pot>ref.ovr+6);
}
/* aviso si el que se va a otro club era de tu interés */
function warnLostTarget(p,c){
  const neg=S.neg&&S.neg[p.id],mine=S.short.includes(p.id)||(neg&&neg.stage!=='done'&&neg.log.length);
  if(neg&&neg.stage!=='done')delete S.neg[p.id];
  if(!mine||S.user==null)return;
  inbox({ty:'info',title:`${p.name} ya tiene equipo`,body:`${p.name} (${POSL[p.pos]} ${p.ovr}) ha firmado con ${c.name}. Lo tenías en tu lista o estabas negociando.`,pid:p.id});
}
function signFree(p,c,quiet){
  warnLostTarget(p,c);moveTo(p,c.id,0);p.src=null;p.fa=null;
  if(!quiet&&p.ovr>=78)news(`Agente libre: ${p.name} (${POSL[p.pos]} ${p.ovr}) firma con ${c.name}.`,'t');
}
/* reposición: rescisiones y jugadores sin equipo mantienen vivo el mercado temporada tras temporada */
function replenishFree(){
  for(let i=0,miss=Math.min(40,FREE_MIN+60-S.free.length);i<miss;i++)genFreeTrickle();
  for(let i=0,miss=Math.min(3,FREE_GOOD+4-goodFree());i<miss;i++){
    const p=mkPlayer(pick(['GK','DEF','DEF','DEF','MID','MID','MID','FWD','FWD']),rnd(75,82),27,34,pickNat(pick(LEAGUES).cc),null);
    p.where='free';p.fa=S.t;p.fc='star';S.players[p.id]=p;S.free.push(p.id);
  }
}
/* cada semana, todo el año (con o sin ventana abierta), los clubes fichan jugadores sin equipo */
function aiFreeSignings(max){
  if(!S.free)return 0;
  replenishFree();
  if(S.free.length<FREE_MIN)return 0;
  let done=0,good=goodFree();max=max||9;
  const pool=S.free.map(i=>S.players[i]).filter(p=>p&&p.where==='free');
  /* los mejores primero: se revisan siempre, y además una muestra del resto */
  const top=pool.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,40),rest=[];for(let k=0;k<110;k++)rest.push(pick(pool));
  for(const p of [...new Set(top.concat(rest))]){
    if(done>=max)break;
    if(p.where!=='free'||p.fa===undefined&&Math.random()<0.5){if(p.where==='free'&&p.fa===undefined)p.fa=S.t;continue;}
    if(p.fa==null)p.fa=S.t;
    const days=S.t-p.fa,grace=p.fc==='star'||p.ovr>=80?21:7;
    if(days<grace)continue;
    if(Math.random()>clamp((p.ovr-48)/110+days/600,0.03,0.45))continue;
    for(let k=0;k<60;k++){
      const c=pick(S.clubs);if(c.id===S.user)continue;
      if(!clubWants(c,p,posCount(c)))continue;
      if(p.ovr>=75){if(good<=FREE_GOOD)break;good--;}
      signFree(p,c);done++;break;
    }
  }
  return done;
}
/* salidas: las plantillas demasiado largas sueltan a los que menos aportan */
function trimSquad(c){
  while(c.players.length>SQUAD_TOP){
    const cnt=posCount(c);
    const out=c.players.map(i=>S.players[i]).filter(p=>p&&cnt[p.pos]>POS_MIN[p.pos]&&!(p.age<=20&&p.pot-p.ovr>=10)&&!p.lo).sort((a,b)=>(a.ovr+(a.age<=23?3:0)-(a.age>=32?3:0))-(b.ovr+(b.age<=23?3:0)-(b.age>=32?3:0)))[0];
    if(!out)return;
    c.players=c.players.filter(i=>i!==out.id);out.club=null;out.where='free';out.fa=S.t;S.free.push(out.id);
  }
}
/* mercado de final de temporada: de los clubes grandes a los pequeños, cada uno refuerza su línea más débil */
function offseasonMarket(sum,filter){
  const moves=[],clubs=S.clubs.filter(c=>c.id!==S.user&&(!filter||filter(c.cc))).sort((a,b)=>b.rep-a.rep||b.skill-a.skill);
  if(!clubs.length)return;
  const byPos={GK:[],DEF:[],MID:[],FWD:[]};
  S.clubs.forEach(c=>{if(c.id===S.user)return;c.players.forEach(i=>{const p=S.players[i];if(p&&!p.lo&&!p.pre&&p.where==='first')byPos[p.pos].push(p);});});
  const moved=new Set();let good=goodFree(),fromFree=0;
  clubs.forEach(c=>{
    trimSquad(c);
    const lead=c.tier===1&&S.leagues[c.lg]&&S.leagues[c.lg].ids.every(i=>S.clubs[i].skill<=c.skill);
    const tries=lead?1:c.tier===1?2:1;
    for(let n=0;n<tries;n++){
      if(c.players.length>=SQUAD_TOP||Math.random()<(c.tier===1?0.2:0.5))continue;
      const cnt=posCount(c);
      const lines=Object.keys(POS_MIN).map(pos=>{const m=c.players.map(i=>S.players[i]).filter(x=>x&&x.pos===pos).sort((a,b)=>b.ovr-a.ovr).slice(0,pos==='GK'?1:pos==='FWD'?2:4);
        return {pos,short:cnt[pos]<POS_MIN[pos],lv:m.length?m.reduce((s,x)=>s+x.ovr,0)/m.length:0};}).sort((a,b)=>b.short-a.short||a.lv-b.lv);
      const need=lines[Math.random()<0.7?0:1],list=byPos[need.pos];let best=null,fee=0;
      for(let k=0;k<40&&list.length;k++){
        const p=pick(list);if(moved.has(p.id)||p.club==null||p.club===c.id||p.club===S.user)continue;
        const from=S.clubs[p.club];
        if(from.players.length<=20||from.rep>c.rep+4||p.age>31||p.ovr<=need.lv||p.ovr>clubQ(c)+9)continue;
        const f=Math.round(valueOf(p)*rnd(1.05,1.4)/1000)*1000;
        if(f>c.budget*0.75||wageOf(p)>c.wageCap*0.14)continue;
        if(!best||p.ovr+(p.pot-p.ovr)*0.4>best.ovr+(best.pot-best.ovr)*0.4){best=p;fee=f;}
      }
      for(let k=0;k<20&&S.free.length>FREE_MIN&&fromFree<140;k++){
        const p=S.players[pick(S.free)];if(!p||p.pos!==need.pos||p.ovr<=need.lv||(p.ovr>=75&&good<=FREE_GOOD)||!clubWants(c,p,cnt))continue;
        if(!best||p.ovr>best.ovr+2){best=p;fee=0;}
      }
      if(!best)continue;
      const from=best.club!=null?S.clubs[best.club]:null,free=!from;
      if(free){fromFree++;if(best.ovr>=75)good--;signFree(best,c,true);}else{warnLostTarget(best,c);moveTo(best,c.id,fee);}
      moved.add(best.id);
      moves.push({n:best.name,pid:best.id,ovr:best.ovr,pos:best.pos,from:from?from.name:null,to:c.name,fee,cc:c.cc});
    }
  });
  /* los que se quedaron cortos vuelven a completar plantilla */
  clubs.forEach(c=>{if(c.players.length<20)refillClub(c,20);c.wageCap=Math.max(c.wageCap,Math.round(wageBill(c)*1.12));});
  /* tras el verano queda un mercado de libres abastecido */
  for(let i=0;i<500&&S.free.length<FREE_MIN+80;i++)genFreeTrickle();
  for(let i=0;i<12;i++)replenishFree();
  const my=ucc();
  const top=moves.slice().sort((a,b)=>b.fee-a.fee||b.ovr-a.ovr);
  const free=moves.filter(m=>!m.fee).sort((a,b)=>b.ovr-a.ovr);
  S.offseason={Y:sum?sum.label:String(S.Y),t:S.t,total:moves.length,spent:moves.reduce((s,m)=>s+m.fee,0),top:top.slice(0,12),local:top.filter(m=>m.cc===my).slice(0,8),free:free.slice(0,6)};
  if(sum)sum.market=S.offseason;
  if(top[0])news(`Mercado de final de temporada: ${moves.length} fichajes. El más caro, ${top[0].n} a ${top[0].to} por ${EUR(top[0].fee)}.`,'t');
}
