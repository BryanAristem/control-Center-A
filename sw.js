const V='aristem-v9',CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'],CDN=['cdnjs.cloudflare.com','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'];
/* Ajoute fix.js à la page sans modifier index.html (ignoré si la ligne est déjà dans index.html) */
const FIX='<script src="fix.js"></script>';
const inject=async res=>{const t=await res.text();return new Response(t.includes('fix.js')?t:t.replace('</body>',FIX+'</body>'),{status:res.status,headers:{'content-type':'text/html; charset=utf-8'}})};
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
if(r.method!=='GET'||(u.origin!==location.origin&&!CDN.includes(u.hostname)))return;
if(u.origin===location.origin&&(r.mode==='navigate'||u.pathname==='/'||u.pathname.endsWith('/index.html'))){
e.respondWith((async()=>{const c=await caches.open(V);
try{const net=await fetch(r);if(net.ok){c.put('./index.html',net.clone());return await inject(net)}}catch(_){}
const hit=await c.match('./index.html');return hit?inject(hit):Response.error()})());return}
e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r);
const net=fetch(r).then(x=>{if(x.ok||x.type==='opaque')c.put(r,x.clone());return x}).catch(()=>hit||Response.error());
return hit||net}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const d=e.notification.data;e.waitUntil(clients.openWindow(/^https?:\/\//.test(d)?d:'./'))});