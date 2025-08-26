/* global clients */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, setDefaultHandler, setCatchHandler } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, NetworkOnly, CacheFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache manifest injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Default to network first for navigation
setDefaultHandler(new NetworkFirst());

// Enhanced runtime caching strategies

// Static assets - Cache first with long expiration
registerRoute(
  ({ request }) => ['script', 'style', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Images - Cache first with size limits
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 300,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// API calls - Network first with background sync
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') || url.pathname.startsWith('/graphql'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 5, // 5 minutes
      }),
    ],
  })
);

// Google Fonts - Cache first
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Background Sync for failed API writes
const bgSync = new BackgroundSyncPlugin('outbox', { maxRetentionTime: 24 * 60 });
registerRoute(
    ({ request, url }) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && url.pathname.startsWith('/api/'),
    new NetworkOnly({ plugins: [bgSync] }),
    'POST'
);
registerRoute(
    ({ request, url }) => ['PUT', 'PATCH', 'DELETE'].includes(request.method) && url.pathname.startsWith('/api/'),
    new NetworkOnly({ plugins: [bgSync] }),
    ['PUT', 'PATCH', 'DELETE']
);

// Offline fallback for pages
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  
  // For images, return a placeholder
  if (event.request.destination === 'image') {
    return new Response(
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" fill="#6b7280">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }

  return Response.error();
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_LOG') {
    // Log performance metrics
    console.log('Performance metrics:', event.data.metrics);
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
    try {
        const data = event.data ? event.data.json() : {};
        const title = data.title || 'IDEAS MEDIA COMPANY';
        const body = data.body || 'You have a new notification';
        const url = data.url || '/';
        const options = {
            body,
            data: { url },
            icon: '/icons/idealphotography-logo-192x192.png',
            badge: '/icons/idealphotography-logo-72x72.png',
            vibrate: [100, 50, 100],
            tag: data.tag || 'default',
            renotify: true,
            requireInteraction: data.requireInteraction || false,
            actions: data.actions || []
        };
        event.waitUntil(self.registration.showNotification(title, options));
    } catch (error) {
        console.error('Push notification error:', error);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});


