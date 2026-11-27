"use strict";
/* ================= núcleo: utilidades, tiempo, jugadores ================= */
let S=null;
const rnd=(a,b)=>a+Math.random()*(b-a), ri=(a,b)=>Math.floor(rnd(a,b+1)), pick=a=>a[ri(0,a.length-1)];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const hsh=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h);};
const strip=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'');
const EUR=n=>{const a=Math.abs(n),s=a>=1e9?(a/1e9).toFixed(2)+'MM':a>=1e6?(a/1e6).toFixed(a>=1e7?1:2)+'M':a>=1e3?Math.round(a/1e3)+'k':String(Math.round(a));return (n<0?'-':'')+'€'+s;};
const EXACT=v=>((v||0)<0?'-':'')+'€'+Math.round(Math.abs(v||0)).toLocaleString('de-DE');
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const lum=h=>{const [r,g,b]=hex2rgb(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*r+.7152*g+.0722*b;};
const mixHex=(a,b,t)=>{const A=hex2rgb(a),B=hex2rgb(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
const satur=h=>{const c=hex2rgb(h);return Math.max(...c)-Math.min(...c);};

/* ---- tiempo: días desde 1-ene-2026 ---- */
const EPOCH=Date.UTC(2026,0,1);
const dayOf=(y,m,d)=>Math.round((Date.UTC(y,m-1,d)-EPOCH)/864e5);
const dateOf=t=>new Date(EPOCH+t*864e5);
const yOf=t=>dateOf(t).getUTCFullYear();
const dowOf=t=>dateOf(t).getUTCDay();
const fmtD=(t,long)=>dateOf(t).toLocaleDateString('es',{weekday:long?'long':undefined,day:'numeric',month:'short',year:long?'numeric':undefined,timeZone:'UTC'});
const seasonLabel=(Y,cal)=>cal?String(Y):`${Y}/${String((Y+1)%100).padStart(2,'0')}`;
const userSeasonLabel=()=>{const c=S&&S.user!=null?S.clubs[S.user]:null;if(c&&calOf(c.cc)){const lg=S.leagues[c.lg];return String(lg&&lg.Y?lg.Y:S.Y);}return seasonLabel(S.Y);};
const userYear=()=>{const c=S&&S.user!=null?S.clubs[S.user]:null;if(c&&calOf(c.cc)){const lg=S.leagues[c.lg];if(lg&&lg.Y)return lg.Y;}return S.Y;};
const seasonKey=()=>{const c=S&&S.user!=null?S.clubs[S.user]:null;return c&&calOf(c.cc)?(S.sumN||0):S.Y*1000+(S.sumN||0);};
const DIFFS={
  easy:{nm:'Relajado',d:'Más margen salarial y presupuesto, rivales menos agresivos.',wage:1.45,budget:1.6,rival:0.5,ask:0.92},
  normal:{nm:'Equilibrado',d:'La experiencia pensada: exigente pero justa.',wage:1.2,budget:1,rival:1,ask:1},
  hard:{nm:'Exigente',d:'Presupuesto y masa salarial ajustados, mercado competitivo.',wage:1.0,budget:0.75,rival:1.5,ask:1.08}};
const dif=()=>DIFFS[(typeof S!=='undefined'&&S&&S.diff)||'normal'];
const wageLimit=c=>Math.round(c.wageCap*dif().wage);
const calOf=cc=>!!(LG_BY_CC[cc]&&LG_BY_CC[cc].cal);

/* ---- acceso rápido al estado ---- */
const userClub=()=>S&&S.user!=null?S.clubs[S.user]:null;
const ucc=()=>{const c=userClub();return c?c.cc:(S&&S.mgr?S.mgr.cc:'ES');};
const clubName=id=>S.clubs[id]?S.clubs[id].name:'—';

/* ---- jugadores ---- */
function genName(nat){const P=POOLS[NAT[nat].pool];return pick(P[0])+' '+pick(P[1]);}
function attrs(pos,ovr){
  const off=pos==='GK'?[0,0,0,0,0,0]:pos==='DEF'?[-4,-18,-6,-10,8,6]:pos==='MID'?[-2,-6,6,3,-4,-1]:[4,8,-3,4,-22,-2];
  return off.map(o=>clamp(Math.round(ovr+o+ri(-5,5)),18,97));
}
/* ---- precios tipo FIFA: el valor lo marca sobre todo el nivel actual; el potencial solo da una prima limitada a los jovenes ---- */
/* margen máximo de crecimiento según la edad: el potencial siempre es coherente con la edad (y con el precio, que lo premia con tope) */
const potHead=a=>a<=16?40:a===17?35:a===18?29:a===19?23:a===20?18:a===21?14:a===22?10:a===23?7:a===24?5:a===25?3:a===26?2:0;
const baseVal=ovr=>450000*Math.exp(0.19*(ovr-60));
const ageF=a=>a<=26?1:a===27?0.95:a===28?0.85:a===29?0.74:a===30?0.62:a===31?0.5:a===32?0.38:a===33?0.28:a===34?0.2:0.12;
/* precio de traspaso: curva propia más suave que la de los salarios (los fichajes son asequibles; la propuesta se valida con CANTERA) */
const feeBase=ovr=>324000*Math.exp(0.175*(ovr-60));
function valueOf(p){
  let v=feeBase(p.ovr)*ageF(p.age)*(p.pos==='GK'?0.8:p.pos==='FWD'?1.08:1);
  if(p.age<=25&&p.pot>p.ovr){const w=p.age<=19?1:p.age<=21?0.65:p.age<=23?0.3:0.12;v*=1+Math.min(1.2,(p.pot-p.ovr)*0.028)*w;}
  if(v>1.2e8)v=1.2e8+(v-1.2e8)*0.35;
  v=Math.max(15000,v);
  const q=v<1e6?5000:v<1e7?50000:1e5;
  return Math.round(v/q)*q;
}
function wageOf(p){
  const v=baseVal(p.ovr)*(p.age<=20?0.55:p.age>=31?0.75:1)*(p.pos==='GK'?0.8:1);
  const base=v<2e7?v*0.0065:0.0065*2e7*Math.pow(v/2e7,0.75);
  return Math.max(300,Math.min(650000,Math.round(base/100)*100));
}
function mkPlayer(pos,target,ageMin,ageMax,nat,clubId,opt){
  opt=opt||{};
  const age=ri(ageMin,ageMax),ageCap=age<=17?66:age<=18?72:age<=19?77:age<=20?81:age<=21?85:94,ovr=clamp(Math.round(target+gauss()*4),30,Math.min(94,ageCap));
  let pot=ovr;
  const head=potHead(age);
  if(head>0){pot=ovr+Math.round(rnd(0,head)*(opt.yq||1)*(ovr>=80?0.55:ovr>=72?0.8:1));if(Math.random()<0.05)pot+=ri(3,Math.max(3,Math.round(head*0.35)));}
  pot=clamp(Math.min(pot,ovr+Math.round(head*1.2)),ovr,96);
  const p={id:S.nid++,name:genName(nat),nat,pos,age,ovr,pot,a:attrs(pos,ovr),tr:ri(0,TRAITS.length-1),fit:100,inj:0,club:clubId,g:0,ap:0,lock:null,
    bo:rnd(-1,1),bp:rnd(-1,1),h:0,lp:-9,ovr0:ovr,where:clubId!=null?'first':'free'};
  p.w=Math.round(wageOf(p)*rnd(0.85,1.2)/100)*100;p.ce=S.Y+ri(0,3);
  return addRole(p);
}
const staffAbSafe=role=>{const s=S&&S.staff&&S.staff.hired.find(x=>x.role===role);return s?s.ab:3;};
const rateOf=p=>TRAITS[p.tr][1];
const traitOf=p=>TRAITS[p.tr][0];
const sname=p=>{const parts=p.name.split(' ');return parts.length>1?parts.slice(1).join(' '):p.name;};
const inits=p=>p.name.split(' ').map(w=>w[0]).join('').slice(0,2);

/* ---- conocimiento (niebla de guerra del ojeo) ---- */
function kOf(p){
  if(!S)return 100;
  if(p.club===S.user||p.where==='acad'||p.where==='loan')return 100;
  const k=S.know[p.id];if(k!==undefined)return k;
  const c=p.club!=null?S.clubs[p.club]:null;
  if(!c)return 15;
  return c.cc===ucc()?50:25;
}
function seen(p){
  if(S&&S.opt&&S.opt.exact)return {k:100,e1:0,e2:0,ovr:[p.ovr,p.ovr],pot:[p.pot,p.pot],exact:true};
  let kO=kOf(p),kP=kO;const q=S.kq[p.id]||[8,8];
  if(p.where==='acad'||p.where==='loan'){kO=100;kP=p.known?100:clamp(20+(p.wk||0)*5+(S.staff?staffAbSafe('youth'):5)*2.5,0,95);}
  const k=kO,f=(100-kO)/100,f2=(100-kP)/100;
  const qy=(p.where==='acad'||p.where==='loan')?[12,Math.min(20,8+(S.staff?staffAbSafe('youth'):5))]:q;
  const e1=Math.max(0,Math.round(f*8*Math.max(0.35,1.2-q[0]/25))),e2=Math.max(0,Math.round(f2*16*Math.max(0.35,1.2-qy[1]/25)));
  const co=p.ovr+Math.round(p.bo*e1*0.7),cp=p.pot+Math.round(p.bp*e2*0.7);
  return {k,e1,e2,ovr:[clamp(co-e1,1,99),clamp(co+e1,1,99)],pot:[clamp(cp-e2,1,99),clamp(cp+e2,1,99)],exact:e1===0&&e2===0};
}
const fmtR=(r,exact)=>r[0]===r[1]?String(r[0]):r[0]+'–'+r[1];
const showOvr=p=>{const s=seen(p);return s.e1===0?String(p.ovr):fmtR(s.ovr);};
const showPot=p=>{const s=seen(p);return s.e2===0?String(p.pot):fmtR(s.pot);};
const midOvr=p=>{const s=seen(p);return Math.round((s.ovr[0]+s.ovr[1])/2);};
const midPot=p=>{const s=seen(p);return Math.round((s.pot[0]+s.pot[1])/2);};

/* ---- fechas de ventanas de fichajes por país ---- */
function winOpen(cc,t){
  const L=LG_BY_CC[cc],Y=yOf(t);
  for(const [m1,d1,m2,d2] of L.win){if(t>=dayOf(Y,m1,d1)&&t<=dayOf(Y,m2,d2))return true;}
  return false;
}
function winInfo(cc,t){
  const L=LG_BY_CC[cc],Y=yOf(t),cand=[];
  L.win.forEach(([m1,d1,m2,d2])=>{[Y,Y+1].forEach(y=>{cand.push([dayOf(y,m1,d1),dayOf(y,m2,d2)]);});});
  cand.sort((a,b)=>a[0]-b[0]);
  for(const [a,b] of cand){if(t>=a&&t<=b)return {open:true,closes:b,left:b-t};}
  const nx=cand.find(c=>c[0]>t);return {open:false,opens:nx[0],left:nx[0]-t};
}

/* ---- guardado automatico: IndexedDB (mundo grande), sin cuenta y sin conexion; varias carreras en paralelo (slots) ---- */
const SAVE_KEY='gaffer.save.v4',META_KEY='gaffer.meta4',SLOTS_KEY='gaffer.slots5',NSLOTS=6;
let _db=null,_saveT=null,SAVE_ERR=null;
function idbOpen(){return new Promise((res,rej)=>{if(_db)return res(_db);const r=indexedDB.open('gaffer',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>{_db=r.result;res(_db);};r.onerror=()=>rej(r.error);});}
function slotsMeta(){
  try{const j=JSON.parse(localStorage.getItem(SLOTS_KEY));if(j&&Array.isArray(j.list))return j;}catch(e){}
  const j={last:0,list:Array(NSLOTS).fill(null)};
  try{const old=JSON.parse(localStorage.getItem(META_KEY));if(old){j.list[0]=old;}}catch(e){}
  return j;
}
function writeSlotsMeta(j){try{localStorage.setItem(SLOTS_KEY,JSON.stringify(j));}catch(e){}}
function metaFor(){const c=userClub();return {club:c?c.name:'Sin club',cc:c?c.cc:null,t:S.t,Y:S.Y,ylab:userSeasonLabel(),mgr:S.mgr&&S.mgr.name,diff:S.diff||'normal',ts:Date.now()};}
function save(){
  if(!S)return true;
  if(typeof indexedDB==='undefined'){try{localStorage.setItem(SAVE_KEY+'.'+(S.slot||0),JSON.stringify(S));const j=slotsMeta();j.last=S.slot||0;j.list[S.slot||0]=metaFor();writeSlotsMeta(j);}catch(e){SAVE_ERR=e.message;}return true;}
  clearTimeout(_saveT);_saveT=setTimeout(flushSave,250);return true;
}
async function flushSave(){
  if(!S||typeof indexedDB==='undefined')return;
  try{
    const db=await idbOpen(),sl=S.slot||0;
    await new Promise((res,rej)=>{const tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(S,'slot:'+sl);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error);});
    const j=slotsMeta();j.last=sl;j.list[sl]=metaFor();writeSlotsMeta(j);SAVE_ERR=null;
  }catch(e){SAVE_ERR=e.message;}
}
const worldOk=s=>!!(s&&s.leagues&&LEAGUES.every(L=>s.leagues.some(l=>l.cc===L.cc)));
async function loadSaveAsync(slot){
  try{
    const j=slotsMeta(),sl=slot==null?j.last:slot;
    if(typeof indexedDB==='undefined'){const r=localStorage.getItem(SAVE_KEY+'.'+sl)||(sl===0?localStorage.getItem(SAVE_KEY):null);if(r){const s=JSON.parse(r);if(s&&s.v===4&&worldOk(s)){s.slot=sl;S=s;applyIdentity();return true;}}return false;}
    const db=await idbOpen();
    const get=k=>new Promise((res,rej)=>{const r=db.transaction('kv').objectStore('kv').get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
    let data=await get('slot:'+sl);
    if(!data&&sl===0)data=await get('save');
    if(data&&data.v===4&&worldOk(data)){data.slot=sl;S=data;applyIdentity();return true;}
  }catch(e){SAVE_ERR=e.message;}
  return false;
}
async function deleteSlot(sl){
  try{if(typeof indexedDB!=='undefined'){const db=await idbOpen();await new Promise((res,rej)=>{const tx=db.transaction('kv','readwrite');tx.objectStore('kv').delete('slot:'+sl);if(sl===0)tx.objectStore('kv').delete('save');tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
    else localStorage.removeItem(SAVE_KEY+'.'+sl);}catch(e){}
  const j=slotsMeta();j.list[sl]=null;if(j.last===sl){const k=j.list.findIndex(x=>x);j.last=k<0?0:k;}writeSlotsMeta(j);
}
function hasSave(){try{return slotsMeta().list.some(x=>x);}catch(e){return false;}}
function saveMeta(){try{const j=slotsMeta();return j.list[j.last]||j.list.find(x=>x)||null;}catch(e){return null;}}
function firstFreeSlot(){const j=slotsMeta(),k=j.list.findIndex(x=>!x);return k<0?-1:k;}
function news(t,type){S.news.unshift({t:S.t,txt:t,ty:type||'n'});if(S.news.length>80)S.news.length=80;}
if(typeof document!=='undefined'&&document.addEventListener){document.addEventListener('visibilitychange',()=>{if(document.hidden)flushSave();});window.addEventListener('pagehide',()=>flushSave());}
