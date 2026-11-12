const V='aristem-v7',CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'],CDN=['cdnjs.cloudflare.com','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
if(r.method!=='GET'||(u.origin!==location.origin&&!CDN.includes(u.hostname)))return;
e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r);
const net=fetch(r).then(x=>{if(x.ok||x.type==='opaque')c.put(r,x.clone());return x}).catch(()=>hit||Response.error());
return hit||net}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const d=e.notification.data;e.waitUntil(clients.openWindow(/^https?:\/\//.test(d)?d:'./'))});