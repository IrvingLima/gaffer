/* Gaffer — service worker: abre sin conexión. Súbele la versión V en cada publicación (debe coincidir con ?v= de index.html). */
const V='4.37';
const CACHE='gaffer-'+V,FONTS='gaffer-fonts';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    // leemos index.html para precargar exactamente los archivos (con su ?v=) que pide esta versión
    const res=await fetch('index.html',{cache:'reload'});
    const html=await res.clone().text();
    const urls=new Set(SHELL);
    for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
      const u=m[1];if(/^(https?:)?\/\//.test(u)||u.startsWith('data:'))continue;urls.add(u);
    }
    await c.put('index.html',res);
    await Promise.all([...urls].filter(u=>u!=='index.html').map(async u=>{try{const r=await fetch(u,{cache:'reload'});if(r.ok)await c.put(u,r);}catch(_){}}));
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()){if(k.startsWith('gaffer-')&&k!==CACHE&&k!==FONTS)await caches.delete(k);}
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // tipografías de Google: se guardan al verlas por primera vez
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith((async()=>{const c=await caches.open(FONTS),hit=await c.match(req);
      const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r;}).catch(()=>hit);
      return hit||net;})());
    return;
  }
  if(url.origin!==location.origin)return;
  // navegación: red primero (para recibir actualizaciones) y, sin conexión, la copia guardada
  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      try{const r=await fetch(req);return r;}
      catch(_){const c=await caches.open(CACHE);return (await c.match('index.html'))||(await c.match('./'))||Response.error();}
    })());
    return;
  }
  // resto de archivos: copia guardada primero (están versionados con ?v=)
  e.respondWith((async()=>{
    const c=await caches.open(CACHE),hit=await c.match(req);
    if(hit)return hit;
    try{const r=await fetch(req);if(r.ok)c.put(req,r.clone());return r;}
    catch(_){const alt=await c.match(req,{ignoreSearch:true});return alt||Response.error();}
  })());
});
