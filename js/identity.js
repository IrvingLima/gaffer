"use strict";
/* ================= identidad de los clubes =================
   Nombres y escudos propios: ciudad real, referencia geográfica y colores. Los patrones son genéricos
   (franjas, mitades, aros, banda) y las formas son originales: no se copian escudos, símbolos ni marcas. */
const CREST_SHAPES=[
  'M4 3h32v17c0 10-7 16-16 20C11 36 4 30 4 20z',                      /* clásico */
  'M20 3a19 19 0 1 1-.01 0z',                                          /* redondo */
  'M9 3h22q5 0 5 5v28q0 5-5 5H9q-5 0-5-5V8q0-5 5-5z',                  /* tarjeta */
  'M20 2 37 11v22L20 42 3 33V11z',                                     /* hexágono */
  'M4 3h32v26L20 42 4 29z'                                             /* banderín */
];
/* 0 franja baja · 1 mitades · 2 aros · 3 banda · 4 galón · 5 franjas · 6 liso con ribete · 7 franja central · 8 laterales · 9 cuarteles · 10 jefe */
const NPATS=11,PAT_LIST=[0,1,2,3,4,5,6,7,8,9,10];
function crestPattern(k,R,c2){
  switch(k){
    case 0:return R(0,22,40,9);
    case 1:return R(20,0,20,44);
    case 2:return R(0,9,40,6)+R(0,21,40,6)+R(0,33,40,6);
    case 3:return `<path d="M0 8L40 30V40L0 18z" fill="${c2}"/>`;
    case 4:return `<path d="M0 20L20 8L40 20V29L20 17L0 29z" fill="${c2}"/>`;
    case 5:return R(7,0,6,44)+R(17,0,6,44)+R(27,0,6,44);
    case 6:return `<path d="M0 0H40V44H0z M7 7V37H33V7z" fill="${c2}" fill-rule="evenodd"/>`;
    case 7:return R(14,0,12,44);
    case 8:return R(0,0,10,44)+R(30,0,10,44);
    case 9:return R(20,0,20,22)+R(0,22,20,22);
    default:return R(0,0,40,13);
  }
}
/* patrón de cada club de 1ª (mismo orden que T1), según los colores con que se asocia a cada ciudad */
const T1PAT={
  ES:[6,5,5,10,6,5,5,6,5,6,1,5,6,5,0,5,6,2,6,3],
  EN:[6,6,6,10,6,6,5,10,5,10,6,6,6,5,6,5,5,6,10,5],
  DE:[6,6,1,6,5,0,6,7,5,6,6,6,6,6,7,6,6,1],
  IT:[5,5,5,6,6,6,6,5,1,5,6,6,5,1,5,6,5,9,0,7],
  FR:[7,6,7,3,6,5,1,5,6,4,6,6,6,10,6,6,6,1,1,5],
  PT:[6,2,5,10,6,5,5,6,5,6,6,5,6,5,9,5,1,6],
  RU:[6,1,6,7,6,6,10,6,6,6,6,1,6,5,6,6],
  NL:[7,1,5,6,6,3,7,5,5,5,1,6,6,3,6,6,7,6],
  TR:[1,5,5,1,6,3,5,5,5,6,6,1,5,6,1,5,5,6],
  BE:[6,5,6,6,6,6,3,5,6,6,6,6,6,1,6,6],
  SC:[2,6,6,10,6,6,6,6,5,6,0,6],
  AT:[6,6,6,6,6,5,6,6,6,6,6,6],
  CH:[1,3,6,6,6,6,6,6,6,6,6,6],
  DK:[6,6,6,5,6,6,5,6,6,6,5,6],
  PL:[6,6,6,6,5,6,6,6,6,6,1,6,6,6,6,5,6,6],
  GR:[5,5,5,5,5,6,6,6,6,5,6,6,6,5],
  BR:[0,6,6,2,3,6,5,5,6,5,6,5,5,2,5,6,6,6,6,6],
  AR:[0,3,6,5,5,6,3,0,1,5,6,5,6,5,5,6,6,6,6,5],
  MX:[6,6,6,5,5,5,6,3,6,6,5,6,2,5,2,6,6,6],
  US:[6,6,6,0,5,2,0,6,6,0,6,2,0,6,10,6,0,1,6,6]
};
const identPat=(cc,tier,idx,key)=>tier===1&&T1PAT[cc]&&T1PAT[cc][idx]!=null?T1PAT[cc][idx]:hsh(key)%NPATS;
const identShape=key=>hsh(key+'#')%CREST_SHAPES.length;
const STAD_FIX={'MX|Azteca':'Estadio Tlalpan','AR|Arroyito':'Estadio de la Ribera'};
function identStad(cc,city,suf){
  const fx=STAD_FIX[cc+'|'+suf];if(fx)return fx;
  const pre=STAD_PRE[cc][hsh(city+suf)%STAD_PRE[cc].length];
  return ['EN','SC','US'].includes(cc)?suf+' '+pre:pre+' '+suf;
}
/* sufijos que tocaban un apodo, una marca o un símbolo conocido: pasan a una referencia geográfica */
const T1RENAME={
  PT:{'Águia':'Carnide','Leão':'Lumiar','Dragão':'Antas'},EN:{Fox:'Soar',Claret:'Calder'},IT:{Neroverde:'Secchia'},
  NL:{Philips:'Strijp'},BR:{Corinto:'Tatuapé'},FR:{Merlus:'Rade'},DK:{Midtjylland:'Hede'},SC:{Tannadice:'Hilltown'},
  AR:{Gigante:'Arroyito',Granate:'Estación',Cervecero:'Ribera',Taladro:'Sur'}
};
/* categorías inferiores: sufijos geográficos (así no se forman por azar nombres de clubes que existen) */
const OLD_T2SUF={};
const GEO_SUF={
  ES:'Norte,Ribera,Costa,Sierra,Vega,Puerto,Mirador,Alameda,Vaguada,Ensanche,Faro,Ladera',
  EN:'Vale,Quay,Mills,Cross,Heath,Gate,Brook,Moorside,Wharf,Fields,Ridge,Market',
  DE:'Nord,Süd,Tal,Hafen,Höhe,Aue,Brücke,Altstadt,Wald,Ufer,Markt,Heide',
  IT:'Marina,Colle,Ponte,Valle,Porta,Riviera,Fonte,Piana,Borgo,Rocca,Torre,Lido',
  FR:'Rive,Colline,Port,Vallée,Pont,Plaine,Halles,Coteaux,Source,Rempart,Marais,Belvédère',
  PT:'Ribeira,Serra,Vale,Cais,Ponte,Colina,Praça,Encosta,Várzea,Mirante,Foz,Campina',
  RU:'Norte,Sur,Río,Puerto,Colina,Bosque,Puente,Llanura,Muelle,Parque,Ribera,Fortaleza',
  NL:'Noord,Zuid,Haven,Dijk,Brug,Markt,Veld,Kade,Polder,Hof,Meer,Poort',
  TR:'Liman,Vadi,Tepe,Sahil,Köprü,Ova,Çarşı,Kale,Bahçe,Pınar,Yayla,Merkez',
  BE:'Haven,Brug,Markt,Veld,Dijk,Vallei,Kouter,Poort,Rivier,Heuvel,Park,Kade',
  SC:'Glen,Brae,Quay,Cross,Heath,Burn,Firth,Wynd,Fields,Ridge,Shore,Mills',
  AT:'Nord,Süd,Tal,Au,Berg,Brücke,Markt,Wald,Ufer,Anger,Feld,Höhe',
  CH:'Nord,Süd,Tal,Ufer,Berg,Brücke,Markt,Wald,Matte,Halde,Feld,Höhe',
  DK:'Havn,Strand,Bakke,Dal,Skov,Bro,Torv,Eng,Vig,Mark,Park,Høj',
  PL:'Północ,Południe,Rzeka,Wzgórze,Przystań,Most,Rynek,Dolina,Park,Brzeg,Pole,Las',
  GR:'Limani,Lofos,Potamos,Akti,Kentro,Pediada,Kastro,Alsos,Gefyra,Agora,Dasos,Kolpos',
  BR:'Serra,Porto,Várzea,Colina,Ribeira,Ponte,Praça,Vale,Encosta,Mirante,Campo,Foz',
  AR:'Norte,Sur,Oeste,Ribera,Puerto,Estación,Parque,Barranca,Costanera,Alto,Plaza,Bajo',
  MX:'Norte,Cerro,Valle,Laguna,Puerto,Sierra,Plaza,Mirador,Ribera,Bosque,Llano,Barranca',
  US:'Harbor,Ridge,River,Valley,Bay,Heights,Crossing,Park,Lakes,Mesa,Bridge,Point'
};
Object.keys(GEO_SUF).forEach(cc=>{OLD_T2SUF[cc]=(T2SUF[cc]||[]).slice();T2SUF[cc]=GEO_SUF[cc].split(',');});
/* "ciudades" de categorías inferiores que eran nombres de clubes */
const CITYFIX={'Benfica Norte':'Odemira','Marítimo':'Machico','Nacional':'Santana','Académico':'Lamego','Oliveirense':'Oliveira do Bairro','Feirense':'Santa Comba','Torreense':'Torres Vedras',
  'Vitesse Sur':'Velp','Telstar':'Velsen','Cambuur':'Leeuwarden','Roda':'Kerkrade','Arandina':'Aranda','Arosa':'Vilagarcía','Port Vale':'Burslem','Oxford City':'Banbury',
  'Triestina':'Muggia','Carrarese':'Carrara','Lucchese':'Lucca','Pianese':'Piancastagnaio','Viterbese':'Orte','Turris':'Torre del Greco','Vigor':'Senigallia'};
[T2CITY,T3CITY,T4CITY].forEach(T=>Object.keys(T).forEach(cc=>{T[cc]=T[cc].split(',').map(x=>CITYFIX[x]||x).join(',');}));
Object.keys(T1).forEach(cc=>T1[cc].forEach(d=>{const r=(T1RENAME[cc]||{})[d[1]];if(r)d[1]=r;}));
/* partidas guardadas: aplica nombres, escudos y estadios nuevos sin tocar lo que el usuario haya personalizado */
function applyIdentity(){
  if(!S||!S.clubs||S.ident===1)return;
  const seen={},slot={};S.clubs.forEach(c=>{seen[c.short]=1;});
  Object.keys(T1).forEach(cc=>T1[cc].forEach((d,i)=>{slot[cc+'|'+d[0]+'|'+d[1]]=i;}));
  S.clubs.forEach(c=>{
    if(c.name!==c.city+' '+c.suf)return;
    if(c.id===S.user&&c.pat!==hsh(c.city+c.suf)%5)return;
    const oldCity=c.city,city=CITYFIX[c.city]||c.city;
    let suf=(T1RENAME[c.cc]||{})[c.suf]||c.suf;
    const idx=slot[c.cc+'|'+c.city+'|'+suf];
    if(idx==null){const i=(OLD_T2SUF[c.cc]||[]).indexOf(c.suf);if(i>=0)suf=T2SUF[c.cc][i%T2SUF[c.cc].length];}
    const stadDef=STAD_PRE[c.cc].some(p=>c.stad===p+' '+oldCity);
    if(city!==c.city||suf!==c.suf){c.city=city;c.suf=suf;c.name=city+' '+suf;c.short=shortFor(city,suf,seen);}
    c.pat=identPat(c.cc,idx!=null?1:2,idx,c.city+c.suf);c.sh=identShape(c.city+c.suf);
    if(stadDef&&idx!=null)c.stad=identStad(c.cc,c.city,c.suf);
  });
  S.ident=1;
}
