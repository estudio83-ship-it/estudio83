const CACHE='radio-v10';
const FILES=['radio-cilindro-standalone.html','radio-manifest.json'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(FILES);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('radio-')&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(url.origin!==self.location.origin||request.method!=='GET')return;
  event.respondWith((async()=>{
    const cached=await caches.match(request);
    try{const response=await fetch(request);if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone());}return response;}
    catch(error){return cached||((request.mode==='navigate')?await caches.match('./radio-cilindro-standalone.html'):undefined)||Response.error();}
  })());
});
