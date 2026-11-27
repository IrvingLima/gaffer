"use strict";
/* ================= generación del mundo ================= */
const STAD_PRE={ES:['Estadio','Estadio Municipal','Campo'],EN:['Stadium','Park','Ground'],DE:['Stadion','Arena','Sportpark'],IT:['Stadio','Stadio Comunale','Arena'],FR:['Stade','Stade Municipal','Parc'],PT:['Estádio','Estádio Municipal','Campo'],RU:['Stadion','Arena','Dinamo Park'],NL:['Stadion','Arena','Sportpark'],TR:['Stadyum','Arena','Şehir Stadı'],BE:['Stadion','Stade','Arena'],SC:['Park','Stadium','Ground'],AT:['Stadion','Arena','Sportplatz'],CH:['Stadion','Stade','Arena'],DK:['Stadion','Park','Arena'],PL:['Stadion','Arena','Stadion Miejski'],GR:['Stadio','Arena','Stadio Dimotiko'],BR:['Estádio','Arena','Estádio Municipal'],AR:['Estadio','Cancha','Estadio Municipal'],MX:['Estadio','Estadio Olímpico','Estadio Municipal'],US:['Stadium','Field','Park']};
const FORM_LIST=['4-4-2','4-3-3','3-5-2','4-2-3-1','5-3-2','4-5-1','3-4-3','4-3-1-2','4-1-4-1','4-3-2-1','4-2-2-2'];
function pickNat(cc){
  if(Math.random()<0.7)return cc;
  const tot=NATS.reduce((s,n)=>s+n[4],0);let r=Math.random()*tot;
  for(const n of NATS){r-=n[4];if(r<=0)return n[0];}return 'ES';
}
function randAge(){const r=Math.random();return r<0.2?ri(17,21):r<0.78?ri(22,29):ri(30,35);}
function genSched(lg,Y){
  const n=lg.ids.length,L=LG_BY_CC[lg.cc];
  const rounds=[];let ids=lg.ids.slice();
  for(let r=0;r<n-1;r++){const m=[];for(let i=0;i<n/2;i++){const a=ids[i],b=ids[n-1-i];m.push(r%2?[b,a]:[a,b]);}rounds.push(m);ids=[ids[0],ids[n-1],...ids.slice(1,n-1)];}
  const all=rounds.concat(rounds.map(r=>r.map(([h,a])=>[a,h])));
  const R=all.length,s=dayOf(Y,L.start[0],L.start[1]),e=dayOf(L.cal?Y:Y+1,L.end[0],L.end[1]);
  const brk=L.brk.map(([m1,d1,m2,d2])=>[dayOf(L.cal||m1>=7?Y:Y+1,m1,d1),dayOf(L.cal||m2>=7?Y:Y+1,m2,d2)]);
  const inBrk=d=>brk.some(([a,b])=>d>=a&&d<=b);
  const sats=[];let d=s;while(dowOf(d)!==6)d++;
  for(;d<=e;d+=7){if(!inBrk(d))sats.push(d);}
  let dates=sats.slice();
  if(L.cal&&sats.length>R){dates=[];for(let i=0;i<R;i++)dates.push(sats[Math.round(i*(sats.length-1)/(R-1))]);dates=[...new Set(dates)];}
  for(const off of [4,3]){for(let i=0;i<sats.length&&dates.length<R;i++){const x=sats[i]-off;if(x>s&&!inBrk(x)&&!dates.includes(x))dates.push(x);}}
  dates.sort((a,b)=>a-b);
  let extra=e+1;while(dates.length<R){dates.push(extra);extra+=7;}
  dates=dates.slice(0,R);
  return all.map((m,i)=>({t:dates[i],m}));
}
function resetTables(lg){lg.tab={};lg.ids.forEach(id=>{lg.tab[id]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};});lg.yt={};lg.ids.forEach(id=>{lg.yt[id]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};});}
function shortFor(city,suf,seen){
  const words=city.split(' '),cc=words.length>1?words.map(w=>w[0]).join('').slice(0,2):city.slice(0,2);
  const opts=[cc+suf[0],cc[0]+suf.slice(0,2),city.slice(0,3),suf.slice(0,3),cc[0]+suf[0]+suf[suf.length-1]].map(s=>strip(s).toUpperCase());
  let s=opts.find(x=>!seen[x]);
  if(!s){const a=strip(city+suf).replace(/[^A-Za-z]/g,'').toUpperCase();for(let i=1;i<a.length-1&&!s;i++)for(let j=i+1;j<a.length&&!s;j++){const x=a[0]+a[i]+a[j];if(!seen[x])s=x;}}
  s=s||opts[0]+Object.keys(seen).length;seen[s]=1;return s;
}
function mkClub(L,ti,idx,n,def,lgId,seen){
  const [city,suf,c1,c2]=def,range=L.t[ti][2],tier=ti+1;
  const skill=Math.round(clamp(range[1]-(idx/(n-1))*(range[1]-range[0])+ri(-1,1),range[0]-1,range[1]+1));
  const cap=tier===1?Math.round((12000+(skill-70)*3300+ri(-3000,6000))/1000)*1000:tier===2?Math.round((4000+(skill-60)*1900+ri(-1500,3000))/500)*500:tier===3?Math.round((2500+(skill-45)*350+ri(-700,1300))/500)*500:Math.round((1500+(skill-35)*180+ri(-400,800))/500)*500;
  const rep=tier===1?Math.round(clamp(45+(skill-70)*2.3,30,95)):tier===2?Math.round(clamp(22+(skill-60)*2.2,10,50)):tier===3?Math.round(clamp(8+(skill-40)*1.2,5,30)):Math.round(clamp(3+(skill-30)*0.9,2,16));
  const c={id:S.clubs.length,cc:L.cc,tier,lg:lgId,city,suf,name:city+' '+suf,short:shortFor(city,suf,seen),c1,c2,pat:identPat(L.cc,tier,idx,city+suf),sh:identShape(city+suf),skill,cap:Math.max(1500,cap),rep,
    players:[],form:pick(FORM_LIST),formOut:null,tactic:'balance',ins:{},train:'bal',budget:0,mg:null,price:0,price0:0,tv:0,sp:0,staffC:0,board:60,
    stad:tier===1?(pick(STAD_PRE[L.cc]),identStad(L.cc,city,suf)):pick(STAD_PRE[L.cc])+' '+city,vac:0,hist:{titles:0,best:99,seasons:0}};
  S.clubs.push(c);buildSquad(c);setFinance(c);
  c.mg={n:genName(pick([L.cc,L.cc,'EN','ES','DE','IT'])),rep:Math.round(clamp(rep+ri(-12,10),5,95)),since:S.Y};
  return c;
}
const clubQ=c=>65+(c.skill-70)*0.85;
function buildSquad(c){
  const q=clubQ(c);
  [['GK',3,1],['DEF',8,4],['MID',8,4],['FWD',6,3]].forEach(([pos,n,st])=>{
    for(let k=0;k<n;k++){
      const young=Math.random()<0.2;
      const p=mkPlayer(pos,q+(k<st?3:-5),young?17:randAge(),young?21:Math.max(22,randAge()),pickNat(c.cc),c.id,{yq:1});
      S.players[p.id]=p;c.players.push(p.id);
    }
  });
}
function wageBill(c){return c.players.reduce((s,i)=>s+(S.players[i]?S.players[i].w:0),0);}
function setFinance(c){
  const W=wageBill(c),R=W*1.32;
  const base=c.tier===1?22+(c.skill-70)*1.4:c.tier===2?12+(c.skill-60)*0.8:c.tier===3?6+(c.skill-40)*0.25:4+(c.skill-30)*0.2;
  let price=Math.max(8,base);const fill=clamp(0.42+c.rep/160,0.2,1);let gateW=c.cap*fill*price*0.5;
  if(gateW>0.5*R){price*=0.5*R/gateW;gateW=0.5*R;}
  c.price0=Math.round(price*10)/10;c.price=c.price0;
  const rest=R-gateW;c.tv=Math.round(rest*0.5);c.sp=Math.round(rest*0.5);c.staffC=Math.round(W*0.04);
  c.budget=Math.round(W*52*rnd(0.5,0.95)*[1.1,1,0.95,0.9][c.tier-1]/1e4)*1e4;
  c.wageCap=Math.round(W*1.12);
}
/* clase de agentes libres de cada verano: estrellas veteranas, jugadores sólidos, promesas liberadas y relleno */
function genFreeClass(scale){
  const POS=['GK','DEF','DEF','DEF','MID','MID','MID','FWD','FWD'],mk=(target,a0,a1,tag,opt)=>{
    const p=mkPlayer(pick(POS),target,a0,a1,pickNat(pick(LEAGUES).cc),null,opt);p.where='free';p.fa=S.t;p.fc=tag;S.players[p.id]=p;S.free.push(p.id);return p;};
  const k=scale||1;
  for(let i=0;i<Math.round(11*k);i++)mk(rnd(77,86),31,35,'star');            // veteranos de renombre
  for(let i=0;i<Math.round(4*k);i++)mk(rnd(73,79),27,29,'star');            // estrellas cuyo club no pudo pagarlas
  for(let i=0;i<Math.round(36*k);i++)mk(rnd(65,76),25,32,'solid');          // jugadores sólidos de ligas medias
  for(let i=0;i<Math.round(40*k);i++)mk(rnd(57,66),23,34,'mid');
  for(let i=0;i<Math.round(24*k);i++){const p=mk(rnd(52,64),18,22,'gem',{yq:1.15});}   // promesas liberadas por sus clubes
  for(let i=0;i<Math.round(30*k);i++)mk(rnd(42,58),20,34,'low');
}
/* goteo semanal: clubes que rescinden, jugadores en conflicto, cracks sin equipo… el mercado de libres nunca se seca */
function genFreeTrickle(){
  const r=Math.random(),POS=['GK','DEF','DEF','DEF','MID','MID','MID','FWD','FWD'];
  const [tag,t0,t1,a0,a1]=r<0.06?['star',76,84,29,34]:r<0.34?['solid',64,74,24,32]:r<0.62?['mid',56,65,22,33]:r<0.8?['gem',52,64,18,22]:['low',42,56,20,34];
  const p=mkPlayer(pick(POS),rnd(t0,t1),a0,a1,pickNat(pick(LEAGUES).cc),null,tag==='gem'?{yq:1.15}:undefined);p.where='free';p.fa=S.t;p.fc=tag;S.players[p.id]=p;S.free.push(p.id);
}
function genWorld(){
  S={v:4,ident:2,nid:1,Y:2026,t:dayOf(2026,7,1),players:{},clubs:[],leagues:[],free:[],pools:{},know:{},kq:{},short:[],reports:[],news:[],inbox:[],mgrs:[],ledger:[],
     hist:{champs:[],seasons:[]},staff:{hired:[],market:[]},scout:{miss:{}},ac:null,user:null,mgr:null,pend:null,summary:null,uid:1,tr:[],obj:{},mid:1,watch:{},records:{},mres:[],tn:{},ev:{}};
  LEAGUES.forEach(L=>{
    L.t.forEach((T,ti)=>{
      const lg={id:S.leagues.length,cc:L.cc,tier:ti+1,nm:T[0],ids:[],sched:[],rd:0,tab:{},yt:{},Y:calOf(L.cc)?S.Y+1:S.Y};S.leagues.push(lg);
      const seen={},n=T[1];
      for(let i=0;i<n;i++){
        let def;
        if(ti===0)def=T1[L.cc][i];
        else{
          const cities=(ti===1?T2CITY:ti===2?T3CITY:T4CITY)[L.cc].split(','),suf=T2SUF[L.cc],city=cities[i%cities.length],pal=PAL[hsh(city+L.cc+ti)%PAL.length];
          def=[city,identNick(L.cc,city),pal[0],pal[1]];
        }
        const c=mkClub(L,ti,i,n,def,lg.id,seen);lg.ids.push(c.id);
      }
      resetTables(lg);lg.sched=genSched(lg,lg.Y);
    });
  });
  S.nextQual=qualifyBySkill();buildTournaments(S.nextQual);
  genFreeClass(1.6);
  for(let i=0;i<50;i++){S.mgrs.push(mkMgr());}
  return S;
}
function mkMgr(rep){return {n:genName(pick(['ES','EN','DE','IT','FR','PT','NL','BR','AR','RU','TR'])),rep:rep||ri(15,75),id:S.mid++};}

/* ================= pools extranjeros (ojeo en naciones sin liga simulada) ================= */
function poolFor(nat){
  if(!S.pools[nat]){
    const q=NAT[nat].yq,ids=[];
    for(let i=0;i<40;i++){
      const age=ri(15,26),pos=pick(['GK','DEF','DEF','MID','MID','FWD','FWD']);
      const target=36+q*10+(age-15)*1.6+gauss()*4;
      let p=mkPlayer(pos,target,age,age,nat,null,{yq:q*1.15});
      for(let t=0;t<6&&ids.some(i=>S.players[i].name===p.name);t++)p.name=genName(nat);p.where='pool';
      p.vc=`${pick(FIN_SUF)} ${pick(FIN_SUF2)}`;p.ce=S.Y+ri(1,3);
      S.players[p.id]=p;ids.push(p.id);
    }
    S.pools[nat]=ids;
  }
  return S.pools[nat];
}
const hasLeague=cc=>!!LG_BY_CC[cc];
function playersOfCountry(cc){
  if(hasLeague(cc)){const out=[];S.clubs.forEach(c=>{if(c.cc===cc)c.players.forEach(i=>out.push(S.players[i]));});return out;}
  return poolFor(cc).map(i=>S.players[i]).filter(p=>p&&p.where==='pool');
}
function clubLabel(p){
  if(p.club!=null&&S.clubs[p.club])return S.clubs[p.club].name;
  if(p.where==='pool')return p.vc+' ('+NAT[p.nat].nm+')';
  return 'Sin club';
}

/* ================= tablas, partidos, resultados ================= */
const leagueOf=cid=>S.leagues[S.clubs[cid].lg];
function sortedTable(lg){
  return lg.ids.map(id=>({id,...lg.tab[id]})).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||a.id-b.id);
}
const posOf=cid=>sortedTable(leagueOf(cid)).findIndex(r=>r.id===cid)+1;
function attendance(c){
  const fill=clamp(0.42+c.rep/160-(c.price/c.price0-1)*0.9,0.2,1);
  return Math.round(c.cap*fill);
}
function injuryWeeks(p,isUser){
  let w=ri(1,6);if(Math.random()<0.15)w+=ri(3,10);
  w=Math.max(1,Math.round(w*(1-(isUser?staffAb('phys'):aiAb(S.clubs[p.club]||{skill:60}))*0.03)));
  return w;
}
function applyResult(lg,M){
  const {hid,aid,hg,ag}=M,th=lg.tab[hid],ta=lg.tab[aid];
  th.p++;ta.p++;th.gf+=hg;th.ga+=ag;ta.gf+=ag;ta.ga+=hg;
  if(hg>ag){th.w++;ta.l++;th.pts+=3;}else if(hg<ag){ta.w++;th.l++;ta.pts+=3;}else{th.d++;ta.d++;th.pts++;ta.pts++;}
  [[hid,hg,ag],[aid,ag,hg]].forEach(([id,my,op])=>{const c=S.clubs[id];c.form5=(c.form5||[]).concat(my>op?'W':my<op?'L':'D').slice(-6);});
  M.goals.forEach(g=>{const p=S.players[g.pid];if(p)p.g++;});
  [[M.H,hid],[M.A,aid]].forEach(([L,cid])=>{
    const c=S.clubs[cid],ids=new Set(L.xi.map(x=>x.p.id)),isU=cid===S.user;
    const mult=((c.ins&&c.ins.press)?1.35:1)*((c.ins&&c.ins.tempo==='fast')?1.1:1)*(1-sAb(cid,'fit')*0.015);
    c.players.forEach(id=>{const p=S.players[id];if(!p)return;
      if(ids.has(p.id)){p.ap++;p.lp=S.t;p.fit=clamp(p.fit-ri(8,14)*mult,15,100);}
      else if(L.bench.some(b=>b.id===p.id)&&isU&&p.h&&p.age<=21){p.ap++;p.lp=S.t;p.fit=clamp(p.fit-4,15,100);}
    });
  });
  M.inj.forEach(id=>{const p=S.players[id];if(p){p.inj=injuryWeeks(p,p.club===S.user);}});
  [...M.H.xi,...M.A.xi].forEach(x=>{delete x.p._hurt;});
  // taquilla para el local
  const hc=S.clubs[hid],gate=attendance(hc)*hc.price;hc.budget+=gate;
  if(hid===S.user)S.ledger.unshift({t:S.t,k:'gate',v:gate,txt:'Taquilla vs '+S.clubs[aid].name});
  S.ledger.length=Math.min(S.ledger.length,60);
}
function quickSim(lg,h,a){const M=newMatch(h,a,false);runMinutes(M,90);applyResult(lg,M);return M;}
function playRound(lg,r){
  let pend=false;
  r.m.forEach(([h,a])=>{
    if(S.user!=null&&(h===S.user||a===S.user)){S.pend={lg:lg.id,h,a,t:r.t};pend=true;return;}
    quickSim(lg,h,a);
  });
  if(!pend)lg.rd++;
}
function commitUserMatch(M){
  const p=S.pend;if(!p)return;const lg=S.leagues[p.lg];
  applyResult(lg,M);recordStats(M);lg.rd++;S.pend=null;
  const my=M.hid===S.user?M.hg:M.ag,op=M.hid===S.user?M.ag:M.hg,c=userClub();
  challengeResult(M);
  if(my>op){c.rep=Math.min(95,c.rep+0.8);c.board=clamp(c.board+1.5,0,100);}
  else if(my<op){c.rep=Math.max(5,c.rep-0.4);c.board=clamp(c.board-2,0,100);}
  c.board=Math.round(c.board*10)/10;
  S.lastRes={h:M.hid,a:M.aid,hg:M.hg,ag:M.ag,t:S.t,sum:matchSummary(M)};
  news(`J${lg.rd}: ${S.clubs[M.hid].name} ${M.hg}-${M.ag} ${S.clubs[M.aid].name}.`,'m');
  M.inj.forEach(id=>{const p=S.players[id];if(p&&p.club===S.user){inbox({ty:'info',title:'Lesión',body:`${p.name} estará de baja ${p.inj} semana${p.inj===1?'':'s'}.`,pid:p.id});}});
  const hat=M.goals.reduce((o,g)=>{o[g.pid]=(o[g.pid]||0)+1;return o;},{});
  Object.keys(hat).forEach(id=>{const p=S.players[id];if(p&&hat[id]>=3&&p.club===S.user)news(`¡Hat-trick de ${p.name}!`,'g');});
}

/* ================= bucle diario ================= */
function nextUserMatch(){
  const c=userClub();if(!c)return null;const lg=leagueOf(c.id);let best=null;
  for(let i=lg.rd;i<lg.sched.length;i++){const r=lg.sched[i];const m=r.m.find(([h,a])=>h===c.id||a===c.id);if(m){best={t:r.t,h:m[0],a:m[1],rd:i+1,lg:lg.id,kind:'league',label:lg.nm+' · J'+(i+1)};break;}}
  const ev=userTournEvents().find(e=>e.h!=null);
  if(ev&&(!best||ev.t<best.t))best={t:ev.t,h:ev.h,a:ev.a,rd:0,lg:lg.id,kind:ev.kind,label:ev.label};
  return best;
}
function dayTick(){
  const t=S.t,d=dateOf(t),mo=d.getUTCMonth()+1,dd=d.getUTCDate();
  S.leagues.forEach(lg=>{const r=lg.sched[lg.rd];if(r&&r.t===t)playRound(lg,r);else if(r&&r.t<t&&!(S.pend&&S.pend.lg===lg.id)){playRound(lg,r);}});
  tournDay();
  if(d.getUTCDay()===1)weeklyTick();
  windowDay(mo,dd);
  LEAGUES.forEach(L=>{if(!L.cal||S.pend)return;const ls=S.leagues.filter(l=>l.cc===L.cc);if(!ls.length||!ls.every(l=>l.rd>=l.sched.length))return;
    const cup=S.tn['cup:'+L.cc];if(cup&&cup.Y===ls[0].Y&&cup.champion==null)return;
    const last=Math.max(...ls.map(l=>l.sched[l.sched.length-1].t));if(t>=last+3)closeCalYear(L.cc);});
  if(mo===6&&dd===30)endSeason();
}
function windowDay(mo,dd){
  const t=S.t;let any=false;
  LEAGUES.forEach(L=>{
    const w=winInfo(L.cc,t);
    if(L.cc===ucc()||L.cc==='EN'){
      if(w.open&&w.left===0&&L.cc===ucc()){news(`¡DEADLINE DAY! Hoy cierra el mercado en ${L.nm}.`,'d');if(S.user!=null)inbox({ty:'deadline',title:'Deadline Day',body:'Último día del mercado. Vívelo hora a hora: oportunidades de última hora, ofertas y pujas rivales. Después solo quedan agentes libres.',ch:[{k:'dd',l:'Vivir el Deadline Day'},{k:'skip',l:'Ahora no'}]});}
      const opened=w.open&&winOpen(L.cc,t-1)===false;
      if(opened&&L.cc===ucc())news(`Se abre el mercado de fichajes en ${L.nm}.`,'d');
      if(!w.open&&winOpen(L.cc,t-1)&&L.cc===ucc())news(`Cierra el mercado de fichajes en ${L.nm}.`,'d');
    }
    if(w.open)any=true;
  });
  if(any){
    const dl=LEAGUES.some(L=>{const w=winInfo(L.cc,t);return w.open&&w.left===0;});
    aiTransfers(dl?70:14);
    if(S.user!=null)offersForUser();
  }
}

function weeklyTick(){
  genFreeTrickle();if(Math.random()<0.5)genFreeTrickle();
  aiFreeSignings();
  const wk=Math.floor((S.t-dayOf(S.Y,7,1))/7);
  if(wk%4===0){const c0=userClub();if(c0)c0.players.forEach(id=>{const p=S.players[id];if(p)p.mv=Math.round((0.85+Math.random()*0.3)*100)/100;});}
  S.clubs.forEach(c=>{
    const W=wageBill(c);let staff=c.staffC;
    if(c.id===S.user){staff=S.staff.hired.reduce((s,x)=>s+x.w,0)+academyCost();}
    const inc=c.tv+c.sp;c.budget+=inc-W-staff;
    c.players.forEach(id=>{const p=S.players[id];if(!p)return;
      if(p.inj>0)p.inj--;
      let rec=6+sAb(c.id,'fit')*0.4;
      if(c.train==='fit'&&c.id===S.user)rec+=5;
      p.fit=clamp(p.fit+rec,0,100);
    });
    if(c.id===S.user){
      S.ledger.unshift({t:S.t,k:'wk',v:inc-W-staff,txt:'Semana: ingresos '+EUR(inc)+' · salarios '+EUR(W)+' · staff '+EUR(staff)});
      S.ledger.length=Math.min(S.ledger.length,60);
    }
  });
  if(S.user!=null){
    trackOvr();checkPromises();loanOptionWeek();trainingWeek();moraleWeek();academyWeek();youthRound();scoutWeek();eventsWeek();contractsWeek();loanWeek();
    boardWeek();challengeWeek();preseasonOffer();sponsorPickOffer();callupWeek();ntOfferWeek();ntWeek();
  }
  aiWeek();
  mgrWeek();
  S.lastWeekly=S.t;
}

/* ================= calendario del mercado y fichajes de la IA ================= */
function moveTo(p,toId,fee,note){
  const from=p.club,fc=from!=null?S.clubs[from]:null,tc=S.clubs[toId];
  if(fc){fc.players=fc.players.filter(i=>i!==p.id);fc.budget+=fee;}
  else if(p.where==='free')S.free=S.free.filter(i=>i!==p.id);
  else if(p.where==='pool'&&S.pools[p.nat])S.pools[p.nat]=S.pools[p.nat].filter(i=>i!==p.id);
  p.club=toId;p.where='first';tc.players.push(p.id);tc.budget-=fee;
  p.ce=S.Y+ri(1,4);p.w=Math.max(300,Math.round(Math.max(p.w*0.9,wageOf(p)*rnd(1,1.12))/100)*100);p.lock=null;
  delete p.vc;if(S.short.includes(p.id)&&false)0;
  if(fc&&fc.players.length<21&&fc.id!==S.user)refillClub(fc);
  if(tc.players.length>27&&tc.id!==S.user)releaseWorst(tc);
}
function refillClub(c,min){
  min=min||22;
  while(c.players.length<min){
    const need=['GK','DEF','MID','FWD'].map(pos=>[pos,c.players.filter(i=>S.players[i].pos===pos).length]);
    const [pos]=need.sort((a,b)=>a[1]/(a[0]==='GK'?2:a[0]==='DEF'?6:a[0]==='MID'?6:4)-b[1]/(b[0]==='GK'?2:b[0]==='DEF'?6:b[0]==='MID'?6:4))[0];
    const fa=S.free.length>120?S.free.map(i=>S.players[i]).filter(p=>p&&p.pos===pos&&p.ovr>=clubQ(c)-9).sort((a,b)=>b.ovr-a.ovr)[0]:null;
    if(fa){S.free=S.free.filter(i=>i!==fa.id);fa.club=c.id;fa.where='first';fa.ce=S.Y+ri(1,2);fa.w=Math.round(wageOf(fa)/100)*100;c.players.push(fa.id);}
    else{const p=mkPlayer(pos,clubQ(c)-6,17,20,pickNat(c.cc),c.id,{yq:1});p.where='first';S.players[p.id]=p;c.players.push(p.id);}
  }
}
function releaseWorst(c){
  const w=c.players.map(i=>S.players[i]).sort((a,b)=>a.ovr-b.ovr)[0];
  c.players=c.players.filter(i=>i!==w.id);w.club=null;w.where='free';S.free.push(w.id);
}
function aiTransfers(tries){
  while(tries-->0){
    const c=pick(S.clubs);if(c.id===S.user||!winOpen(c.cc,S.t)||c.players.length>=27)continue;
    const cnt={GK:0,DEF:0,MID:0,FWD:0};c.players.forEach(i=>cnt[S.players[i].pos]++);
    let need=null;[['GK',2],['DEF',6],['MID',6],['FWD',4]].forEach(([p,m])=>{if(cnt[p]<m)need=p;});
    if(!need&&Math.random()>0.45)continue;
    const pos=need||pick(['DEF','MID','FWD','MID','DEF','FWD','GK']);
    const mine=c.players.map(i=>S.players[i]).filter(p=>p.pos===pos).sort((a,b)=>b.ovr-a.ovr);
    const th=need?0:(mine[Math.min(mine.length-1,pos==='GK'?0:pos==='FWD'?1:3)]||{ovr:50}).ovr+1;
    let best=null,bestFee=0;
    for(let k=0;k<26;k++){
      const oc=pick(S.clubs);if(oc.id===c.id||oc.id===S.user||!winOpen(oc.cc,S.t)||oc.players.length<=21)continue;
      const p=S.players[pick(oc.players)];if(!p||p.pos!==pos||p.ovr<th)continue;
      const fee=Math.round(valueOf(p)*rnd(1.0,1.3)/1000)*1000;
      if(fee>c.budget*0.7||p.w>c.wageCap*0.12)continue;
      if(!best||p.ovr>best.ovr){best=p;bestFee=fee;}
    }
    for(let k=0;k<8&&S.free.length;k++){
      const p=S.players[pick(S.free)];if(!p||p.pos!==pos||p.ovr<th||p.ovr<clubQ(c)-11)continue;
      if(p.ovr>=60&&S.t-(p.fa==null?-999:p.fa)<(p.fc==='star'?70:30))continue;
      if(!best||p.ovr>best.ovr+3){best=p;bestFee=0;}
    }
    if(best){
      const from=best.club;moveTo(best,c.id,bestFee);
      if(bestFee>=12e6||(bestFee>=3e6&&c.tier===1&&Math.random()<0.25))news(`${best.name} (${POSL[best.pos]} ${best.ovr}) ficha por ${c.name}${from!=null?' desde '+S.clubs[from].name:''} por ${EUR(bestFee)}.`,'t');
    }
  }
}
function offersForUser(){
  const c=userClub();if(!c||!winOpen(c.cc,S.t))return;
  const tl=c.players.map(i=>S.players[i]).filter(x=>x.tl&&!x.nb&&!x.lo&&!lockDays(x)&&!(x.src==='free'&&S.t-(x.since||0)<365));
  if(Math.random()>(tl.length?0.22:0.1))return;
  const pl=c.players.map(i=>S.players[i]).filter(x=>!x.nb&&!x.lo&&!lockDays(x)&&!(x.src==='free'&&S.t-(x.since||0)<365)).sort((a,b)=>valueOf(b)-valueOf(a)).slice(0,14);
  const p=tl.length&&Math.random()<0.7?pick(tl):pick(pl);if(!p||S.inbox.some(m=>m.ty==='offer'&&!m.done&&m.pid===p.id))return;
  const buyers=S.clubs.filter(b=>b.id!==c.id&&winOpen(b.cc,S.t)&&b.budget>valueOf(p)*1.1&&b.skill>=c.skill-8&&b.players.length<27);
  if(!buyers.length)return;const b=pick(buyers);
  const fee=Math.round(valueOf(p)*rnd(0.9,1.15)/1000)*1000,max=Math.round(Math.max(fee,valueOf(p)*rnd(1.1,1.45))/1000)*1000;
  // la CPU propone a veces un canje: un jugador suyo + dinero
  if(Math.random()<0.2){
    const qs=b.players.map(x=>S.players[x]).filter(q=>q&&q.age<=30&&valueOf(q)>=fee*0.3&&valueOf(q)<=fee*0.85&&q.ovr>=p.ovr-9&&!q.inj);
    if(qs.length){const q=pick(qs),cash=Math.max(0,Math.round((fee-valueOf(q)*0.9)/1000)*1000);
      inbox({ty:'offer',title:`Canje: ${b.name} ofrece a ${q.name} por ${p.name}`,body:`${b.name} te ofrece a ${q.name} (${POSL[q.pos]} ${q.ovr}, ${q.age} años) y ${EUR(cash)} por ${p.name} (${POSL[p.pos]} ${p.ovr}). Vence en 7 días.`,pid:p.id,cid:b.id,fee:cash,max:cash,swap:q.id,soft:!p.tl,exp:S.t+7,ch:[{k:'accept',l:'Aceptar el canje'},{k:'reject',l:'Rechazar'}]});
      return;}
  }
  inbox({ty:'offer',title:`Oferta por ${p.name}`,body:`${b.name} ofrece ${EUR(fee)} por ${p.name} (${POSL[p.pos]} ${p.ovr}, ${p.age} años). Vence en 7 días. Puedes aceptar, contraofertar o rechazar.`,pid:p.id,cid:b.id,fee,max,exp:S.t+7,soft:!p.tl,
    ch:[{k:'accept',l:'Aceptar'},{k:'counter',l:'Contraofertar'},{k:'reject',l:'Rechazar'}]});
}

/* ================= entrenadores (mercado de mánagers) ================= */
function expectedRank(c){const lg=S.leagues[c.lg];const s=lg.ids.map(id=>S.clubs[id]).sort((a,b)=>b.skill-a.skill||b.rep-a.rep);return s.findIndex(x=>x.id===c.id)+1;}
function mgrWeek(){
  const t=S.t;
  S.clubs.forEach(c=>{
    if(c.id===S.user)return;
    if(c.mg){
      const lg=S.leagues[c.lg];
      if(lg.rd>=8&&lg.rd<lg.sched.length-3){
        const pos=posOf(c.id),exp=expectedRank(c),n=lg.ids.length;
        const bad=pos-exp>Math.max(4,n*0.28);
        if(bad&&Math.random()<0.07){S.mgrs.push({n:c.mg.n,rep:Math.max(5,c.mg.rep-4),id:S.mid++});news(`${c.name} destituye a su entrenador ${c.mg.n}.`,'j');c.mg=null;c.vac=0;}
      }
    }else{
      c.vac++;
      if(c.vac>=7||Math.random()<0.1){
        const cand=S.mgrs.filter(m=>m.rep>=c.rep-30&&m.rep<=c.rep+12).sort((a,b)=>Math.abs(a.rep-c.rep)-Math.abs(b.rep-c.rep));
        const app=S.apps&&S.apps.find(a=>a.cid===c.id&&!a.done);
        let hire=cand[0];
        if(app){
          const u=S.mgr,us=u.rep-Math.abs(u.rep-c.rep)*0.5+rnd(-5,5),them=hire?hire.rep-Math.abs(hire.rep-c.rep)*0.5+rnd(-5,5):-99;
          app.done=true;
          if(us>=them&&u.rep>=c.rep-22){
            inbox({ty:'jobOffer',title:`${c.name} acepta tu candidatura`,body:`La directiva de ${c.name} (${S.leagues[c.lg].nm}, ${LG_BY_CC[c.cc].nm}) te ofrece el puesto de entrenador.`,cid:c.id,ch:[{k:'accept',l:'Aceptar el puesto'},{k:'reject',l:'Rechazar'}],exp:S.t+10});
            return;
          }else{inbox({ty:'info',title:`${c.name} elige a otro entrenador`,body:`Tu candidatura no ha convencido: se ha contratado a ${hire?hire.n+' (reputación '+Math.round(hire.rep)+')':'otro perfil'}.`});}
        }
        if(hire){c.mg={n:hire.n,rep:hire.rep,since:S.Y};S.mgrs=S.mgrs.filter(m=>m!==hire);news(`${c.name} ficha a ${hire.n} como entrenador.`,'j');c.vac=0;}
        else if(c.vac>20){c.mg={n:genName(pick([c.cc,'EN','ES'])),rep:Math.round(c.rep+ri(-12,4)),since:S.Y};c.vac=0;}
      }
    }
  });
  while(S.mgrs.length<40)S.mgrs.push(mkMgr());
  if(S.mgrs.length>70)S.mgrs.splice(0,S.mgrs.length-70);
}
