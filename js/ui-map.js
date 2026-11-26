"use strict";
/* ================= mapa mundial de ojeo (SVG propio, sin imágenes) con zoom por regiones y misiones animadas ================= */
const NLL={ES:[-4,40],EN:[-1,52.5],DE:[10,51],IT:[12,42],PT:[-8,39],FR:[2,47],NL:[5,52],BE:[4.5,50.8],CH:[8,46.8],AT:[14,47.5],SC:[-4,56.5],DK:[10,56],NO:[9,61],PL:[19,52],CZ:[15,49.8],HU:[19,47],RO:[25,46],HR:[16,45],UA:[31,49],RU:[40,56],KZ:[67,48],AZ:[48,40.5],TR:[33,39],GR:[22,39],CY:[33,35],BR:[-50,-12],AR:[-64,-34],UY:[-56,-33],CO:[-74,4],CL:[-71,-33],EC:[-78,-1],PE:[-75,-10],PY:[-58,-23],BO:[-65,-17],MX:[-102,23],US:[-98,39],NG:[8,9],GH:[-1,8],SN:[-14,14],CI:[-5,7],CM:[12,6],MA:[-6,32],DZ:[3,28],EG:[30,27],CN:[104,35],KR:[128,36]};
/* ajustes manuales para que los países vecinos de Europa no se tapen */
const NLL_ADJ={BE:[3.4,50.4],NL:[5.4,52.6],CH:[8.2,46.6],AT:[14.2,47.4],DK:[9.8,56.2],SC:[-4.2,56.8],EN:[-1.2,52.4],CZ:[15.6,49.9],HR:[16.2,45.2],HU:[19.5,47.2],PL:[19.5,52.2],CY:[33,35]};
const LAND={
 na:[[-168,66],[-156,71],[-140,70],[-125,70],[-110,73],[-95,72],[-82,68],[-82,60],[-95,60],[-90,52],[-80,52],[-78,62],[-70,58],[-62,50],[-55,52],[-60,45],[-67,44],[-70,41],[-76,36],[-81,31],[-80,25],[-83,29],[-90,30],[-97,27],[-97,20],[-90,21],[-87,21],[-88,16],[-83,15],[-83,10],[-79,9],[-77,8],[-80,7],[-86,12],[-92,15],[-98,16],[-105,20],[-110,24],[-112,30],[-115,30],[-110,23],[-117,32],[-122,37],[-124,45],[-124,49],[-130,54],[-135,58],[-145,60],[-152,59],[-160,58],[-165,62]],
 gl:[[-55,60],[-45,60],[-20,70],[-20,82],[-60,82],[-70,76]],
 sa:[[-77,8],[-72,12],[-62,11],[-52,5],[-50,0],[-44,-2],[-35,-6],[-39,-14],[-41,-22],[-48,-26],[-54,-34],[-58,-38],[-65,-41],[-68,-50],[-69,-55],[-74,-52],[-74,-42],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0],[-78,5]],
 eu:[[-9,37],[-9,43],[-2,44],[-4,48],[2,51],[8,54],[8,57],[12,56],[11,59],[5,59],[5,62],[14,68],[25,71],[40,68],[43,66],[60,69],[70,73],[100,77],[115,74],[140,72],[160,70],[180,68],[180,65],[170,60],[160,55],[156,51],[142,52],[140,48],[135,43],[130,42],[127,38],[126,35],[121,40],[118,38],[122,31],[121,25],[110,20],[108,16],[109,11],[105,9],[100,13],[100,8],[103,1],[98,8],[98,16],[92,22],[87,21],[80,15],[78,8],[73,17],[72,22],[67,25],[57,26],[56,25],[50,30],[48,29],[51,24],[56,23],[59,22],[55,17],[44,12],[43,16],[35,28],[34,31],[36,36],[30,36],[27,37],[26,40],[23,38],[22,37],[19,41],[14,45],[12,44],[16,38],[12,38],[9,44],[3,43],[0,38],[-5,36]],
 af:[[-17,21],[-10,30],[-6,36],[10,37],[11,33],[20,31],[32,31],[35,28],[43,12],[51,12],[47,5],[40,-3],[40,-15],[35,-24],[32,-29],[27,-34],[18,-34],[15,-26],[12,-17],[13,-9],[9,-1],[9,4],[3,6],[-8,4],[-13,8],[-17,15]],
 au:[[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[131,-31],[115,-34]],
 uk:[[-6,50],[1,51],[2,53],[-3,56],[-5,58],[-6,56],[-3,54],[-5,52]],
 ie:[[-10,52],[-6,52],[-6,55],[-10,54]],
 jp:[[130,32],[136,34],[141,40],[142,45],[140,42],[135,36]],
 is:[[-24,64],[-14,64],[-15,66],[-23,66]],
 mg:[[44,-25],[50,-15],[47,-13],[44,-17]]
};
const MAPVIEWS={world:{n:'Mundo',v:[0,6,360,144]},eu:{n:'Europa',v:[166,20,66,42]},am:{n:'América',v:[48,30,110,114]},af:{n:'África',v:[150,36,70,70]},as:{n:'Asia',v:[205,18,100,64]}};

Object.assign(NLL,{SE:[18,60],FI:[26,62.5],IE:[-8,53],IS:[-19,65],LU:[6,49.6],MT:[14.4,35.9],SK:[19.7,48.7],SI:[14.8,46.1],RS:[20.5,44],BA:[17.8,44],BG:[25,42.7],ME:[19.3,42.7],MK:[21.7,41.6],AL:[20,41],GE:[43.5,42],AM:[45,40.2],BY:[28,53.7],LT:[24,55.3],LV:[25,57],EE:[25.5,58.7],MD:[28.5,47],
 CA:[-100,56],CR:[-84,10],PA:[-80,8.5],HN:[-86.5,14.8],GT:[-90.3,15.5],SV:[-88.9,13.7],JM:[-77.3,18.1],HT:[-72.3,19],CU:[-79.5,21.7],DO:[-70.2,18.9],TT:[-61.3,10.5],VE:[-66.5,7.5],
 ZA:[24,-29],TN:[9.5,34],ML:[-4,17],BF:[-1.5,12.2],GN:[-10.9,10.5],CD:[23.5,-3],GA:[11.7,-0.7],AO:[17.5,-12],MZ:[35,-17.5],KE:[37.9,0.2],UG:[32.4,1.4],TZ:[34.8,-6.4],ZW:[29.8,-19],ZM:[27.8,-13.1],CV:[-23.6,15.1],BJ:[2.3,9.3],TG:[1.2,8.6],CG:[15.2,-0.7],SD:[30,15.5],ET:[39.5,9],LY:[17,27],MG:[46.9,-19],
 JP:[138,36],SA:[45,24],IR:[53,32],IQ:[43.7,33],QA:[51.2,25.3],AE:[54,24],UZ:[64.6,41.4],JO:[36.8,31],SY:[38.5,35],IN:[78,22],TH:[101,15],VN:[106,16],ID:[113,-2],MY:[102,4],PH:[122,12.5],AU:[134,-25],NZ:[172,-41]});
Object.assign(NLL_ADJ,{LU:[6.6,49.9],SK:[19.9,48.9],SI:[14.6,46.2],ME:[19.2,42.5],MK:[21.8,41.4],AL:[19.9,41.1],CV:[-23.6,15.1],CR:[-84.2,10.2],PA:[-80.2,8.3],SV:[-89.1,13.5],GT:[-90.4,15.7],HN:[-86.5,14.9]});
Object.assign(LAND,{
 nz:[[172,-34.5],[178,-37.5],[175,-41.5],[172,-41],[170,-46],[167,-46],[171,-42]],
 su:[[95,5.5],[98,4],[104,-2],[106,-6],[101,-3],[96,2]],bo:[[109,1],[111,-3],[116,-4],[118,1],[117,6],[112,3]],jv:[[105,-6],[114,-7.5],[114,-8.5],[106,-7]],ph:[[120,18],[122,18],[124,12],[126,7],[122,7],[120,14]],
 sl:[[80,9.5],[82,7.5],[81,6],[80,6.5]],nf:[[-59,47.5],[-53,47],[-53,51],[-57,51.5]],cu:[[-85,22],[-74,20],[-77,20],[-84,21.5]]});
Object.assign(MAPVIEWS,{oc:{n:'Oceanía',v:[286,86,84,58]}});
const mx=lon=>lon+180,my=lat=>90-lat;
const nllOf=cc=>NLL_ADJ[cc]||NLL[cc];
function landPath(pts){return 'M'+pts.map(([lo,la])=>mx(lo).toFixed(1)+' '+my(la).toFixed(1)).join('L')+'Z';}
function worldMapHTML(sc){
  const view=UI.mapView||'world',V=MAPVIEWS[view].v,u=V[2]/680;
  const uc=userClub(),home=uc&&nllOf(uc.cc)?nllOf(uc.cc):null;
  const land=Object.values(LAND).map(p=>`<path d="${landPath(p)}" class="land"/>`).join('');
  const grid=[-60,-30,0,30,60].map(la=>`<line x1="0" x2="360" y1="${my(la)}" y2="${my(la)}" class="gr"/>`).join('')+[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lo=>`<line y1="0" y2="180" x1="${mx(lo)}" x2="${mx(lo)}" class="gr"/>`).join('');
  const missions=sc.map(s=>S.scout.miss[s.id]).filter(m=>m&&m.nat&&nllOf(m.nat)).map(m=>m.nat);
  const arcs=home?[...new Set(missions)].filter(cc=>cc!==(uc&&uc.cc)).map((cc,i)=>{
    const [lo,la]=nllOf(cc),x1=mx(home[0]),y1=my(home[1]),x2=mx(lo),y2=my(la),mxp=(x1+x2)/2,myp=Math.min(y1,y2)-Math.hypot(x2-x1,y2-y1)*0.28;
    const d=`M${x1.toFixed(1)} ${y1.toFixed(1)}Q${mxp.toFixed(1)} ${myp.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    return `<path d="${d}" class="arc"/><circle r="${(5*u).toFixed(2)}" class="plane"><animateMotion dur="${3.2+i*0.4}s" repeatCount="indefinite" path="${d}"/></circle>`;}).join(''):'';
  const dots=NATS.map(n=>{const cc=n[0],ll=nllOf(cc);if(!ll)return '';const lvl=natKnowLevel(cc),pin=missions.includes(cc),sel=UI.sel.nat===cc,lg=hasLeague(cc);
    const x=mx(ll[0]),y=my(ll[1]);
    return `<g class="nd k${lvl} ${lg?'lg':''} ${sel?'sel':''} ${pin?'pin':''}" data-act="nat" data-v="${cc}" role="button" tabindex="0" aria-label="${NAT[cc].nm}${pin?', con ojeador':''}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <circle class="hit" r="${(14*u).toFixed(2)}"/>${pin?`<circle class="halo" r="${(10*u).toFixed(2)}"/>`:''}<circle class="dot" r="${(6.5*u).toFixed(2)}"/>${sel?`<circle class="selring" r="${(10*u).toFixed(2)}"/>`:''}
      <text class="nl" y="${(-9*u).toFixed(2)}" font-size="${(11*u).toFixed(2)}" text-anchor="middle">${cc}</text></g>`;}).join('');
  const homeDot=home?`<g transform="translate(${mx(home[0]).toFixed(1)} ${my(home[1]).toFixed(1)})"><circle r="${(4.4*u).toFixed(2)}" class="homedot"/></g>`:'';
  return `<div class="wmap"><div class="wtabs" role="group" aria-label="Región">${Object.entries(MAPVIEWS).map(([k,o])=>`<button class="chipbtn ${view===k?'on':''}" data-act="mapz" data-v="${k}">${o.n}</button>`).join('')}</div>
   <svg id="worldsvg" viewBox="${V.join(' ')}" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Mapa mundial de ojeo" class="${view==='world'?'zw':'zr'}"><defs><radialGradient id="ocean" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="var(--s2)"/><stop offset="1" stop-color="var(--s1)"/></radialGradient></defs>
    <rect x="-20" y="-20" width="400" height="220" fill="url(#ocean)"/>${grid}${land}${arcs}${homeDot}${dots}</svg></div>`;
}
/* zoom animado entre regiones */
function mapZoom(key){
  const svg=document.getElementById('worldsvg');UI.mapView=key;
  if(!svg){render();return;}
  const from=svg.getAttribute('viewBox').split(' ').map(Number),to=MAPVIEWS[key].v,t0=performance.now(),dur=520;
  document.querySelectorAll('.wtabs .chipbtn').forEach(b=>b.classList.toggle('on',b.dataset.v===key));
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const rescale=vw=>{const u=vw/680;svg.querySelectorAll('.nd').forEach(g=>{const set=(sel,r)=>{const e=g.querySelector(sel);if(e)e.setAttribute('r',(r*u).toFixed(2));};set('.hit',14);set('.halo',10);set('.dot',6.5);set('.selring',10);const t=g.querySelector('.nl');if(t){t.setAttribute('font-size',(11*u).toFixed(2));t.setAttribute('y',(-9*u).toFixed(2));}});
    svg.querySelectorAll('.plane').forEach(c=>c.setAttribute('r',(5*u).toFixed(2)));const h=svg.querySelector('.homedot');if(h)h.setAttribute('r',(4.4*u).toFixed(2));};
  const step=now=>{const k=Math.min(1,(now-t0)/dur),e=ease(k),v=from.map((a,i)=>a+(to[i]-a)*e);svg.setAttribute('viewBox',v.map(x=>x.toFixed(2)).join(' '));rescale(v[2]);if(k<1)requestAnimationFrame(step);else svg.setAttribute('class',key==='world'?'zw':'zr');};
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){svg.setAttribute('viewBox',to.join(' '));rescale(to[2]);svg.setAttribute('class',key==='world'?'zw':'zr');}else requestAnimationFrame(step);
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act="mapz"]');if(!b)return;mapZoom(b.dataset.v);e.stopImmediatePropagation();e.preventDefault();
},true);
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.classList&&e.target.classList.contains('nd')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
