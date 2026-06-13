// Service worker for PWA installability, Push Notifications, and Offline Fallback

const OFFLINE_CACHE_NAME = 'offline-v1';
const OFFLINE_URL = '/~offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== OFFLINE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Intercept main page navigations (navigating to any URL in the browser)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedResponse = await caches.match(OFFLINE_URL);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Return a basic HTML response if cache match fails to prevent uncaught promise rejection
        return new Response(
          '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Offline | IJITEST</title><style>body{font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:50px;background:#f8fafc;color:#1e293b;}h1{font-size:24px;margin-bottom:10px;color:#1e293b;}p{color:#64748b;margin-bottom:20px;font-size:14px;}button{background:#000066;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold;}</style></head><body><h1>Connection Lost</h1><p>You are offline and no cached version of this page is available.</p><button onclick="window.location.reload()">Retry Connection</button></body></html>',
          {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          }
        );
      })
    );
  }
  
  // For other requests (images, stylesheets, scripts, API calls), we don't call event.respondWith.
  // The browser will handle these requests natively, preventing unhandled fetch promise rejections in the console.
});

// Handle Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/favicon_io/apple-touch-icon.png',
      badge: data.badge || '/favicon_io/favicon-32x32.png',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'IJITEST', options)
    );
  } catch (err) {
    console.error('Error in push event handler:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window tab open with this URL
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});
