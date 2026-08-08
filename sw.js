const CACHE_NAME = 'pt-tracker-v7';
const APP_SHELL = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/config.js',
    '/utils.js',
    '/storage.js',
    '/manifest.json',
    '/favicon.svg'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', function(event) {
    const { request } = event;
    const url = new URL(request.url);

    // Only cache same-origin app shell requests
    if (url.origin !== self.location.origin) {
        return;
    }

    const isAppShell = APP_SHELL.includes(url.pathname);

    event.respondWith(
        caches.match(request).then(cached => {
            if (isAppShell) {
                return cached || fetch(request).then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, response.clone());
                        return response;
                    });
                });
            }

            // For other same-origin requests, try network then cache
            return fetch(request).catch(() => cached);
        })
    );
});
