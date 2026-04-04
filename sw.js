const CACHE_NAME = 'finance-app-v2';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(['/money/index.html', '/money/manifest.json'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    try {
      // 網路優先：先去網路拿最新版本
      const response = await fetch(event.request);
      if (response && response.status === 200 && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      // 沒網路才用快取（離線模式）
      const cached = await caches.match(event.request);
      return cached || caches.match('/money/index.html');
    }
  })());
});
