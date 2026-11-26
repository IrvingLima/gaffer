"use strict";
/* ================= posiciones reales, posiciones alternativas, skills y estilos de juego (tipo FIFA) ================= */
const SPN={GK:'Portero',CB:'Defensa central',LB:'Lateral izquierdo',RB:'Lateral derecho',LWB:'Carrilero izquierdo',RWB:'Carrilero derecho',CDM:'Mediocentro defensivo',CM:'Mediocentro',CAM:'Mediapunta',LM:'Interior izquierdo',RM:'Interior derecho',LW:'Extremo izquierdo',RW:'Extremo derecho',CF:'Segundo delantero',ST:'Delantero centro'};
const SPL={GK:'POR',CB:'DFC',LB:'LI',RB:'LD',LWB:'CAI',RWB:'CAD',CDM:'MCD',CM:'MC',CAM:'MCO',LM:'MI',RM:'MD',LW:'EI',RW:'ED',CF:'SD',ST:'DC'};
const SPG={GK:'GK',CB:'DEF',LB:'DEF',RB:'DEF',LWB:'DEF',RWB:'DEF',CDM:'MID',CM:'MID',CAM:'MID',LM:'MID',RM:'MID',LW:'FWD',RW:'FWD',CF:'FWD',ST:'FWD'};
const SPLAT={LB:0,LWB:0,LM:0,LW:0,CB:2,CDM:2,CM:2,CAM:2,CF:2,ST:2,GK:2,RB:4,RWB:4,RM:4,RW:4};
const SP_BY_GROUP={GK:['GK'],DEF:['CB','LB','RB','LWB','RWB'],MID:['CM','CDM','CAM','LM','RM'],FWD:['ST','CF','LW','RW']};
/* alineación de posiciones concretas por sistema (el reparto por líneas sigue FORMS) */
const FSLOTS={
 '4-4-2':['GK','LB','CB','CB','RB','LM','CM','CM','RM','ST','ST'],
 '4-3-3':['GK','LB','CB','CB','RB','CM','CDM','CM','LW','ST','RW'],
 '3-5-2':['GK','CB','CB','CB','LWB','CM','CDM','CM','RWB','ST','ST'],
 '5-3-2':['GK','LWB','CB','CB','CB','RWB','CM','CDM','CM','ST','ST'],
 '4-5-1':['GK','LB','CB','CB','RB','LM','CM','CDM','CM','RM','ST'],
 '4-2-3-1':['GK','LB','CB','CB','RB','CDM','CDM','LM','CAM','RM','ST'],
 '3-4-3':['GK','CB','CB','CB','LM','CM','CM','RM','LW','ST','RW'],
 '5-4-1':['GK','LWB','CB','CB','CB','RWB','LM','CM','CM','RM','ST'],
 '4-3-1-2':['GK','LB','CB','CB','RB','CDM','CM','CM','CAM','ST','ST'],
 '4-4-1-1':['GK','LB','CB','CB','RB','LM','CM','CM','RM','CF','ST'],
 '4-1-4-1':['GK','LB','CB','CB','RB','CDM','LM','CM','CM','RM','ST'],
 '4-3-2-1':['GK','LB','CB','CB','RB','CM','CM','CM','CAM','CAM','ST'],
 '4-2-2-2':['GK','LB','CB','CB','RB','CDM','CDM','CAM','CAM','ST','ST'],
 '3-4-1-2':['GK','CB','CB','CB','LM','CM','CM','RM','CAM','ST','ST']
};
/* penalización por jugar fuera de su sitio (pares simétricos) */
const PENPAIR={'LB|RB':2.5,'LB|LWB':1,'RB|RWB':1,'LWB|RWB':2.5,'LB|RWB':3,'LWB|RB':3,'CB|LB':4,'CB|RB':4,'CB|LWB':5,'CB|RWB':5,'CB|CDM':3.5,'CDM|CM':1.5,'CAM|CM':1.5,'CAM|CDM':3.5,'CM|LM':2,'CM|RM':2,'LM|RM':2.5,'LM|LW':1.5,'RM|RW':1.5,'LW|RW':2.5,'LW|ST':3,'RW|ST':3,'CF|ST':1,'CAM|CF':2,'CAM|ST':3,'CF|LW':2,'CF|RW':2,'LB|LM':3,'RB|RM':3,'LWB|LM':1.5,'RWB|RM':1.5,'CDM|LB':4.5,'CDM|RB':4.5,'LM|RW':3.5,'RM|LW':3.5,'LM|RM':2.5,'CAM|LW':3,'CAM|RW':3,'CAM|LM':2.5,'CAM|RM':2.5,'CDM|LM':3.5,'CDM|RM':3.5};
function posPen(p,sp){
  const mine=p.sp||SP_BY_GROUP[p.pos][0];
  if(mine===sp)return 0;
  if(p.alt&&p.alt.includes(sp))return 1;
  const k=[mine,sp].sort().join('|'),k2=mine+'|'+sp,k3=sp+'|'+mine;
  const base=PENPAIR[k2]!==undefined?PENPAIR[k2]:PENPAIR[k3]!==undefined?PENPAIR[k3]:PENPAIR[k]!==undefined?PENPAIR[k]:(SPG[mine]===SPG[sp]?4:mine==='GK'||sp==='GK'?40:11);
  return base;
}
/* estilos de juego (PlayStyles): pequeñas ventajas visibles */
const PLAYSTYLES={
 canon:{nm:'Disparo cañón',g:['FWD','MID'],d:'Remata con potencia desde lejos.'},
 definicion:{nm:'Definición',g:['FWD'],d:'Letal cara a cara con el portero.'},
 regate:{nm:'Regate encadenado',g:['FWD','MID'],d:'Se escapa de rivales con facilidad.'},
 pase_largo:{nm:'Pase largo',g:['MID','DEF','GK'],d:'Cambios de juego y pases en profundidad.'},
 vision:{nm:'Visión de juego',g:['MID'],d:'Encuentra el pase que otros no ven.'},
 recuperador:{nm:'Recuperador',g:['MID','DEF'],d:'Roba y recupera balones sin parar.'},
 muro:{nm:'Muro',g:['DEF'],d:'Cierra espacios y gana duelos.'},
 anticipacion:{nm:'Anticipación',g:['DEF','MID'],d:'Lee el juego y corta pases.'},
 velocista:{nm:'Velocista',g:['FWD','DEF','MID'],d:'Arrancadas explosivas.'},
 aereo:{nm:'Juego aéreo',g:['DEF','FWD','GK'],d:'Domina el balón por alto.'},
 balon_parado:{nm:'Balón parado',g:['MID','FWD','DEF'],d:'Faltas y córners peligrosos.'},
 paradon:{nm:'Paradón',g:['GK'],d:'Reflejos para atajar lo imposible.'},
 saque:{nm:'Saque largo',g:['GK'],d:'Inicia el contraataque con la mano o el pie.'},
 incansable:{nm:'Incansable',g:['MID','DEF','FWD'],d:'Mantiene el ritmo los 90 minutos.'},
 pase_corto:{nm:'Tiki-taka',g:['MID'],d:'Pases cortos y precisos.'},
 cabeceador:{nm:'Cabeceador',g:['FWD','DEF'],d:'Peligro constante en el área.'}
};
const PS_KEYS=Object.keys(PLAYSTYLES);
function psCount(p,grp){return (p.ps||[]).filter(k=>PLAYSTYLES[k]&&PLAYSTYLES[k].g.includes(grp)).length;}
function psBonus(p,grp){return Math.min(1.6,psCount(p,grp)*0.55);}
function pickWeighted(arr){const t=arr.reduce((s,x)=>s+x[1],0);let r=Math.random()*t;for(const [k,w] of arr){r-=w;if(r<=0)return k;}return arr[0][0];}
const SP_W={DEF:[['CB',55],['LB',18],['RB',18],['LWB',5],['RWB',4]],MID:[['CM',38],['CDM',25],['CAM',20],['LM',8.5],['RM',8.5]],FWD:[['ST',48],['CF',10],['LW',21],['RW',21]],GK:[['GK',1]]};
const ALT_OF={CB:['CDM','LB','RB'],LB:['LWB','LM','RB'],RB:['RWB','RM','LB'],LWB:['LB','LM'],RWB:['RB','RM'],CDM:['CM','CB'],CM:['CDM','CAM','LM','RM'],CAM:['CM','CF','LW','RW'],LM:['LW','CM','LWB'],RM:['RW','CM','RWB'],LW:['LM','ST','RW'],RW:['RM','ST','LW'],CF:['ST','CAM'],ST:['CF','LW','RW'],GK:[]};
/* asigna posición concreta, alternativas, regate (skill moves), pie malo y estilos */
function addRole(p){
  if(p.sp)return p;
  p.sp=pickWeighted(SP_W[p.pos]);
  p.alt=[];
  const alts=ALT_OF[p.sp]||[];
  alts.forEach(k=>{if(Math.random()<(p.ovr>=70?0.45:0.28)&&p.alt.length<2)p.alt.push(k);});
  const base=p.pos==='FWD'?3:p.pos==='MID'?2.6:p.pos==='DEF'?1.8:1.2;
  p.sm=clamp(Math.round(base+(p.ovr-62)/14+gauss()*0.8),1,5);
  p.wf=clamp(Math.round(2.9+gauss()*0.9+(p.ovr>=80?0.4:0)),1,5);
  const n=p.ovr>=76?ri(2,3):p.ovr>=66?ri(1,2):ri(0,1);
  const pool=PS_KEYS.filter(k=>PLAYSTYLES[k].g.includes(p.pos));
  p.ps=[];
  for(let i=0;i<n&&pool.length;i++){const k=pick(pool);if(!p.ps.includes(k))p.ps.push(k);}
  return p;
}
