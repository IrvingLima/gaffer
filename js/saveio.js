"use strict";
/* ================= exportar / importar partidas a un archivo (para pasar la partida entre móvil y ordenador) ================= */
const slug=s=>String(s||'partida').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,30)||'partida';
async function gzipText(text){
  if(typeof CompressionStream==='undefined')return new Blob([text],{type:'application/json'});
  const stream=new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return await new Response(stream).blob();
}
async function gunzipBuffer(buf){
  const b=new Uint8Array(buf);
  if(b[0]===0x1f&&b[1]===0x8b){
    if(typeof DecompressionStream==='undefined')throw new Error('Este navegador no puede abrir archivos comprimidos.');
    return await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  }
  return new TextDecoder().decode(b);
}
async function slotData(sl){
  if(S&&S.slot===sl&&S.leagues)return S;
  const keep=S;const ok=await loadSaveAsync(sl);const d=ok?S:null;S=keep;return d;
}
async function exportSlot(sl){
  const d=await slotData(sl);if(!d){toast('No hay datos que exportar en esa ranura.');return;}
  toast('Preparando archivo…');
  const c=d.clubs&&d.user!=null?d.clubs[d.user]:null;
  const blob=await gzipText(JSON.stringify(d));
  const a=document.createElement('a'),url=URL.createObjectURL(blob);
  a.href=url;a.download=`gaffer-${slug(c?c.name:'partida')}-${new Date().toISOString().slice(0,10)}.gaffer`;
  document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url);},1500);
  toast(`Partida exportada (${(blob.size/1e6).toFixed(1)} MB).`);
}
async function importSaveFile(file,slot){
  try{
    toast('Leyendo archivo…');
    const text=await gunzipBuffer(await file.arrayBuffer()),data=JSON.parse(text);
    if(!data||data.v!==4||!worldOk(data)){toast('Ese archivo no es una partida de esta versión (o es de un mundo distinto).');return false;}
    data.slot=slot;S=data;await flushSave();
    S=null;UI.menu=true;render();toast('Partida importada en la ranura '+(slot+1)+'.');return true;
  }catch(e){toast('No se pudo importar: '+(e&&e.message?e.message:'archivo dañado')+'.');return false;}
}
document.addEventListener('change',e=>{
  const t=e.target;if(!t||t.id!=='importfile'||!t.files||!t.files[0])return;
  const f=t.files[0];t.value='';
  let sl=firstFreeSlot();
  const go=()=>importSaveFile(f,sl<0?NSLOTS-1:sl);
  if(sl<0){ask('Todas las ranuras están ocupadas: se sustituirá la última. ¿Continuar?',go,'Sustituir');}else go();
});
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act="expslot"],[data-act="impbtn"]');if(!b)return;
  if(b.dataset.act==='expslot'){exportSlot(+b.dataset.v);e.stopImmediatePropagation();e.preventDefault();}
  else{const f=document.getElementById('importfile');if(f)f.click();e.stopImmediatePropagation();e.preventDefault();}
},true);
