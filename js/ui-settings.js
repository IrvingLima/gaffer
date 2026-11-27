"use strict";
/* ================= ajustes dentro de la partida ================= */
const pref=(k,def)=>{try{const v=localStorage.getItem('gaffer.'+k);return v==null?def:v;}catch(e){return def;}};
const setPref=(k,v)=>{try{localStorage.setItem('gaffer.'+k,String(v));}catch(e){}};
const setSeg=(label,act,items,cur)=>`<div class="setrow"><div class="lbl">${label}</div><div class="seg setseg" role="group" aria-label="${label}">${items.map(([v,l])=>`<button class="${String(cur)===String(v)?'on':''}" aria-pressed="${String(cur)===String(v)}" data-act="${act}" data-v="${v}">${l}</button>`).join('')}</div></div>`;
function mSettings(){
  const c=userClub(),d=S.diff||'normal',onoff=[['1','Sí'],['0','No']];
  return modalShell('Ajustes',`
   <h3 class="seth">Mánager y partida</h3>
   <div class="field"><label for="set_name">Tu nombre</label><input id="set_name" type="text" maxlength="24" autocomplete="off" value="${esc(S.mgr.name)}"></div>
   ${setSeg('Dificultad','setdiff',Object.entries(DIFFS).map(([k,x])=>[k,x.nm]),d)}
   <p class="sub">${DIFFS[d].d} Se aplica desde ahora a la masa salarial, los precios que piden y la competencia por fichar. El presupuesto que ya tienes no cambia.${c?` Límite salarial actual: <b>${EXACT(wageLimit(c))}/sem</b>.`:''}</p>
   ${c?'<button class="btn" data-act="setclub">Editar nombre, colores y escudo del club</button>':''}
   <h3 class="seth">Pantalla</h3>
   ${setSeg('Tema','settheme',[['dark','Oscuro'],['light','Claro']],isDark()?'dark':'light')}
   <h3 class="seth">Partidos</h3>
   ${setSeg('Velocidad al empezar','setspeed',[['0.5','0.5×'],['1','1×'],['2','2×'],['4','4×']],pref('speed','1'))}
   ${setSeg('Parar en el descanso','setht',onoff,pref('htpause','1'))}
   ${setSeg('Momentos clave activados','setkey',onoff,pref('key','0'))}
   <h3 class="seth">Información</h3>
   ${setSeg('Medias exactas de todos los jugadores','setexact',onoff,S.opt&&S.opt.exact?'1':'0')}
   <p class="sub">Si está en No, los jugadores poco ojeados se muestran con un rango.</p>
   <h3 class="seth">Guardado</h3>
   <p class="sub">La partida se guarda sola en este dispositivo (ranura ${(S.slot||0)+1}).</p>
   <div class="setbtns"><button class="btn" data-act="setsave">Guardar ahora</button><button class="btn" data-act="setexport">Exportar a un archivo</button><button class="btn" data-act="setmenu">Salir al menú principal</button></div>`,'settings');
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');if(!b||!/^(settings$|set[a-z]+$)/.test(b.dataset.act)||!S)return;
  const a=b.dataset.act,v=b.dataset.v,done=()=>{render();};
  if(a==='settings')openModal({type:'settings'});
  else if(a==='setdiff'){if(DIFFS[v]&&v!==(S.diff||'normal')){S.diff=v;save();done();toast('Dificultad: '+DIFFS[v].nm+'.');}}
  else if(a==='settheme'){document.documentElement.dataset.theme=v;setPref('theme',v);done();}
  else if(a==='setspeed'){setPref('speed',v);done();}
  else if(a==='setht'){setPref('htpause',v);done();}
  else if(a==='setkey'){setPref('key',v);done();}
  else if(a==='setexact'){S.opt=S.opt||{};S.opt.exact=v==='1';save();done();}
  else if(a==='setsave'){save();Promise.resolve(flushSave()).then(()=>toast(SAVE_ERR?'No se pudo guardar: '+SAVE_ERR:'Partida guardada.'));}
  else if(a==='setexport'){save();exportSlot(S.slot||0);}
  else if(a==='setclub'){UI.m=null;$('#modalRoot').innerHTML='';UI.tab='club';UI.sub.club='identity';render();window.scrollTo(0,0);}
  else if(a==='setmenu'){save();flushSave();UI.m=null;$('#modalRoot').innerHTML='';UI.menu=true;render();window.scrollTo(0,0);}
  else return;
  e.stopImmediatePropagation();e.preventDefault();
},true);
document.addEventListener('change',e=>{
  const t=e.target;if(!t||t.id!=='set_name'||!S||!S.mgr)return;
  const n=t.value.trim().slice(0,24);
  if(!n){t.value=S.mgr.name;toast('El nombre no puede quedar vacío.');return;}
  if(n!==S.mgr.name){S.mgr.name=n;save();setTimeout(()=>{render();toast('Nombre actualizado.');},0);}
});
