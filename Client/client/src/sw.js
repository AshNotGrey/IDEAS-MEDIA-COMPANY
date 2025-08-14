/* global self, clients */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, setDefaultHandler } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache manifest injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Default to network first for navigation
setDefaultHandler(new NetworkFirst());

// Runtime caching examples already configured via vite config

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
            icon: '/images/idealphotography-logo-main.jpg',
            badge: '/images/idealphotography-logo-main.jpg',
            vibrate: [100, 50, 100]
        };
        event.waitUntil(self.registration.showNotification(title, options));
    } catch (_) { /* ignore */ }
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


