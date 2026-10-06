// Service worker de Fluent: la página siempre se pide a la red primero (para no quedarse con versiones viejas)
// y los íconos se guardan en caché. También recibe los avisos de pago.
const CACHE = 'fluent-static-v7';
const ASSETS = ['./manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  if (new URL(e.request.url).searchParams.has('check')) return; // revisión de versión nueva: siempre a la red
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (e.request.mode === 'navigate' || url.pathname === '/' || /\.(html|js)$/.test(url.pathname)) { e.respondWith(fetch(e.request).then((r) => { if (r.ok && url.pathname.endsWith('.js')) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request).then((h) => h || caches.match('./index.html')))); return; }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); } return r; })));
});
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: "Fluent", body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Fluent", { body: d.body || '', tag: d.tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: d.url || '/' }, vibrate: [120, 60, 120] }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => { for (const c of cs) { if ('focus' in c) return c.focus(); } return self.clients.openWindow(url); }));
});
