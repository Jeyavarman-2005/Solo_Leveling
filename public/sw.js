const CACHE_NAME = 'lifeos-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Fetch event (Required by Android Chrome to trigger true PWA install)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline mode not fully configured yet.');
    })
  );
});
