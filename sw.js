// sw.js
const CACHE_NAME = 'tkp-price-list-cache-v3';

// 현재 서비스워커가 서비스하는 경로(= 배포 경로)를 안전하게 계산
const SCOPE = self.registration.scope.endsWith('/')
  ? self.registration.scope
  : self.registration.scope + '/';

const urlsToCache = [
  SCOPE,
  SCOPE + 'index.html',
  SCOPE + 'manifest.json',
  SCOPE + 'icon-192x192.png',
  SCOPE + 'icon-512x512.png'
];

// 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// 활성화(이전 캐시 정리)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// 요청 가로채기(네트워크 우선)
self.addEventListener('fetch', (event) => {
  // HTML 파일과 같은 중요한 탐색 요청에 대해서만 네트워크 우선 전략 적용
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // 네트워크 요청이 성공하면, 응답을 캐시에 저장하고 반환
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // 네트워크 요청이 실패하면(오프라인), 캐시에서 찾아서 반환
          return caches.match(event.request);
        })
    );
    return;
  }

  // 이미지, CSS, JS 등 기타 정적 파일은 기존의 캐시 우선 전략 사용 (성능 최적화)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      });
    })
  );
});