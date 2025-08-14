/* global self, clients */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { setDefaultHandler } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();
setDefaultHandler(new NetworkFirst());

self.addEventListener('push', (event) => {
    try {
        const data = event.data ? event.data.json() : {};
        const title = data.title || 'Admin Notification';
        const body = data.body || 'You have a new admin alert';
        const url = data.url || '/';
        const options = {
            body,
            data: { url },
            icon: '/images/idealphotography-logo-main.jpg',
            badge: '/images/idealphotography-logo-main.jpg'
        };
        event.waitUntil(self.registration.showNotification(title, options));
    } catch (_) { /* ignore */ }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
    event.waitUntil(
        clients.openWindow ? clients.openWindow(url) : Promise.resolve()
    );
});


