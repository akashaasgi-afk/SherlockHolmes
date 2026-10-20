const CACHE = 'tele-sitter-v1';
const OFFLINE = ['/SherlockHolmes/', '/SherlockHolmes/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // За API заявки — винаги мрежа
  if (e.request.url.includes('workers.dev') || e.request.url.includes('supabase.co')) {
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Push нотификации
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Tele-Sitter Alert', body: 'Patient needs attention' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/SherlockHolmes/icon-192.png',
      badge: '/SherlockHolmes/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'tele-alert',
      requireInteraction: true
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/SherlockHolmes/'));
});
