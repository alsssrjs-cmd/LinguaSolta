const CACHE = 'lingua-solta-v1';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
// Red primero con límite de 4 s; si la red tarda o falla, se usa la copia guardada (nunca se queda colgado).
const conTiempo = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('tiempo')), ms))]);
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    conTiempo(fetch(e.request), 4000) // robustez-ignore: el tiempo límite lo pone conTiempo()
      .then(r => { if (r && r.ok){ const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)).catch(() => {}); } return r; })
      .catch(() => caches.match(e.request).then(m => m || Response.error()))
  );
});
