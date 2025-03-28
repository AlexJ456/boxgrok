// Define the cache name and version
const CACHE_NAME = 'box-breathing-cache-v1';

// List of files to cache (add all critical resources here)
const urlsToCache = [
    '/index.html',          // Main HTML file
    '/manifest.json',       // Web manifest for PWA features
    '/icons/icon-192x192.png' // App icon (adjust path/name as needed)
    // Add more resources like CSS, JS, or images if your app uses them
];

// Install event: Cache resources and activate immediately
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting()) // Activate the new service worker immediately
    );
});

// Activate event: Clean up old caches and take control
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName); // Remove outdated caches
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control of all pages immediately
    );
});

// Fetch event: Use "Cache First" strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if available
                if (response) {
                    return response;
                }
                // If not in cache, fetch from network and cache it
                return fetch(event.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                });
            })
    );
});