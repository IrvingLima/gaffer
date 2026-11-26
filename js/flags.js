"use strict";
/* ================= banderas esquemáticas (SVG en línea, sin imágenes externas) ================= */
const FLAG_SPEC={
ES:{b:'h',c:['#aa151b','#f1bf00','#aa151b'],w:[1,2,1]},
EN:{b:'h',c:['#ffffff'],o:[['r',12,0,6,20,'#cf142b'],['r',0,7,30,6,'#cf142b']]},
DE:{b:'h',c:['#000000','#dd0000','#ffce00']},
IT:{b:'v',c:['#009246','#ffffff','#ce2b37']},
PT:{b:'v',c:['#046a38','#da291c'],w:[2,3],o:[['c',12,10,4,'#ffe000']]},
FR:{b:'v',c:['#0055a4','#ffffff','#ef4135']},
NL:{b:'h',c:['#ae1c28','#ffffff','#21468b']},
BE:{b:'v',c:['#000000','#fae042','#ed2939']},
CH:{b:'h',c:['#da291c'],o:[['r',12,4,6,12,'#fff'],['r',9,7,12,6,'#fff']]},
AT:{b:'h',c:['#ed2939','#ffffff','#ed2939']},
SC:{b:'h',c:['#0065bd'],o:[['l',0,0,30,20,'#fff',3],['l',0,20,30,0,'#fff',3]]},
DK:{b:'h',c:['#c8102e'],o:[['r',9,0,4,20,'#fff'],['r',0,8,30,4,'#fff']]},
NO:{b:'h',c:['#ba0c2f'],o:[['r',8,0,6,20,'#fff'],['r',0,7,30,6,'#fff'],['r',9.5,0,3,20,'#00205b'],['r',0,8.5,30,3,'#00205b']]},
PL:{b:'h',c:['#ffffff','#dc143c']},
CZ:{b:'h',c:['#ffffff','#d7141a'],o:[['t',0,0,0,20,15,10,'#11457e']]},
HU:{b:'h',c:['#ce2939','#ffffff','#477050']},
RO:{b:'v',c:['#002b7f','#fcd116','#ce1126']},
HR:{b:'h',c:['#ff0000','#ffffff','#171796'],o:[['r',12,6,6,7,'#c8102e']]},
UA:{b:'h',c:['#0057b7','#ffd700']},
RU:{b:'h',c:['#ffffff','#0039a6','#d52b1e']},
KZ:{b:'h',c:['#00afca'],o:[['c',15,10,4.5,'#fec50c']]},
AZ:{b:'h',c:['#00b5e2','#ef3340','#509e2f'],o:[['c',15,10,2.5,'#fff']]},
TR:{b:'h',c:['#e30a17'],o:[['c',11,10,5,'#fff'],['c',12.5,10,4,'#e30a17'],['c',17,10,1.6,'#fff']]},
GR:{b:'h',c:['#0d5eaf','#ffffff','#0d5eaf','#ffffff','#0d5eaf'],o:[['r',0,0,11,11,'#0d5eaf'],['r',4.5,0,2,11,'#fff'],['r',0,4.5,11,2,'#fff']]},
CY:{b:'h',c:['#ffffff'],o:[['c',15,9,5,'#d57800']]},
BR:{b:'h',c:['#009c3b'],o:[['d',15,10,12,8,'#ffdf00'],['c',15,10,4,'#002776']]},
AR:{b:'h',c:['#74acdf','#ffffff','#74acdf'],o:[['c',15,10,2.2,'#f6b40e']]},
UY:{b:'h',c:['#ffffff','#0038a8','#ffffff','#0038a8','#ffffff','#0038a8'],o:[['r',0,0,11,11,'#fff'],['c',5.5,5.5,3,'#fcd116']]},
CO:{b:'h',c:['#fcd116','#003893','#ce1126'],w:[2,1,1]},
CL:{b:'h',c:['#ffffff','#d52b1e'],o:[['r',0,0,10,10,'#0039a6'],['c',5,5,2,'#fff']]},
EC:{b:'h',c:['#ffdd00','#034ea2','#ed1c24'],w:[2,1,1]},
PE:{b:'v',c:['#d91023','#ffffff','#d91023']},
PY:{b:'h',c:['#d52b1e','#ffffff','#0038a8'],o:[['c',15,10,2.4,'#3b8a3e']]},
BO:{b:'h',c:['#d52b1e','#f9e300','#007a33']},
MX:{b:'v',c:['#006847','#ffffff','#ce1126'],o:[['c',15,10,2.6,'#8c6a2f']]},
US:{b:'h',c:['#b22234','#ffffff','#b22234','#ffffff','#b22234','#ffffff','#b22234'],o:[['r',0,0,13,11,'#3c3b6e']]},
NG:{b:'v',c:['#008751','#ffffff','#008751']},
GH:{b:'h',c:['#ce1126','#fcd116','#006b3f'],o:[['c',15,10,2.6,'#000']]},
SN:{b:'v',c:['#00853f','#fdef42','#e31b23'],o:[['c',15,10,2.4,'#00853f']]},
CI:{b:'v',c:['#f77f00','#ffffff','#009e60']},
CM:{b:'v',c:['#007a5e','#ce1126','#fcd116'],o:[['c',15,10,2.4,'#fcd116']]},
MA:{b:'h',c:['#c1272d'],o:[['c',15,10,4.5,'#006233'],['c',15,10,3,'#c1272d']]},
DZ:{b:'v',c:['#006233','#ffffff'],o:[['c',15,10,4.2,'#d21034'],['c',16.2,10,3.4,'#fff']]},
EG:{b:'h',c:['#ce1126','#ffffff','#000000'],o:[['c',15,10,2.2,'#c09300']]},
CN:{b:'h',c:['#de2910'],o:[['c',6,6,3.2,'#ffde00']]},
KR:{b:'h',c:['#ffffff'],o:[['c',15,10,5,'#cd2e3a'],['c',15,12.5,2.5,'#0047a0']]}
};
const _flagCache={};
function flagSVG(cc){
  const f=FLAG_SPEC[cc];if(!f)return '';
  let s='',n=f.c.length,w=f.w||f.c.map(()=>1),tot=w.reduce((a,b)=>a+b,0),acc=0;
  f.c.forEach((col,i)=>{const sz=w[i]/tot*(f.b==='h'?20:30);
    s+=f.b==='h'?`<rect x="0" y="${acc}" width="30" height="${sz+0.05}" fill="${col}"/>`:`<rect x="${acc}" y="0" width="${sz+0.05}" height="20" fill="${col}"/>`;acc+=sz;});
  (f.o||[]).forEach(o=>{
    if(o[0]==='r')s+=`<rect x="${o[1]}" y="${o[2]}" width="${o[3]}" height="${o[4]}" fill="${o[5]}"/>`;
    else if(o[0]==='c')s+=`<circle cx="${o[1]}" cy="${o[2]}" r="${o[3]}" fill="${o[4]}"/>`;
    else if(o[0]==='d')s+=`<polygon points="${o[1]},${o[2]-o[4]/2} ${o[1]+o[3]/2},${o[2]} ${o[1]},${o[2]+o[4]/2} ${o[1]-o[3]/2},${o[2]}" fill="${o[5]}"/>`;
    else if(o[0]==='l')s+=`<line x1="${o[1]}" y1="${o[2]}" x2="${o[3]}" y2="${o[4]}" stroke="${o[5]}" stroke-width="${o[6]}"/>`;
    else if(o[0]==='t')s+=`<polygon points="${o[1]},${o[2]} ${o[5]},${o[6]} ${o[3]},${o[4]}" fill="${o[7]}"/>`;
  });
  return s;
}
/* devuelve una bandera pequeña; h = alto en px */
function flag(cc,h){
  const k=cc+'|'+(h||14);if(_flagCache[k])return _flagCache[k];
  const body=flagSVG(cc),hh=h||14,w=Math.round(hh*1.5);
  const out=body?`<svg class="flag" width="${w}" height="${hh}" viewBox="0 0 30 20" role="img" aria-label="${(typeof NAT!=='undefined'&&NAT[cc]?NAT[cc].nm:cc)}" preserveAspectRatio="none">${body}<rect width="30" height="20" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1"/></svg>`:`<span class="flag-x">${cc}</span>`;
  return _flagCache[k]=out;
}
