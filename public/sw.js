const CACHE='encore-offline-v2.1';
const SHELL=['/offline.html','/offline.js','/offline.css','/manifest.webmanifest','/favicon.svg','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('encore-offline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;const path=new URL(event.request.url).pathname;
 if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>response.ok?response:caches.match('/offline.html')).catch(()=>caches.match('/offline.html')));return;}
 if(SHELL.includes(path)){event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));}
});