
const CACHE_NAME = 'attendance-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  'https://i.ibb.co/Nbhqk4f/36465.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // استراتيجية: الشبكة أولاً، ثم الكاش في حال الفشل (Network-First)
  // هذا يضمن الحصول على أحدث نسخة لو النت موجود، وفتح التطبيق لو النت مقطوع
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
