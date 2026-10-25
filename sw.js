/* Offline-Zwischenspeicher: erst Netz (max. 2,5 s), sonst gespeicherte Kopie. */
const V = 'vermietung-v11';
const CORE = ['./', './index.html', './apple-touch-icon.png', './fonts/plexmono-400.woff', './fonts/plexmono-600.woff', './fonts/bricolage-700.woff'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  const fromCache = () => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('./index.html') : undefined));
  const net = fetch(r).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; });
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2500));
  e.respondWith(Promise.race([net, timeout]).catch(() => fromCache().then(m => m || net)));
});
