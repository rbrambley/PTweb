const CACHE_NAME = 'pt-tracker-v11';
const CDN_CACHE_NAME = 'pt-cdn-v1';
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

const CDN_PATTERNS = [
    /^https:\/\/cdn\.jsdelivr\.net/
];

function isCdnUrl(url) {
    return CDN_PATTERNS.some(pattern => pattern.test(url));
}

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

    // Cache known CDN assets (e.g. Chart.js) for offline use
    if (url.origin !== self.location.origin && isCdnUrl(url.href)) {
        event.respondWith(
            caches.open(CDN_CACHE_NAME).then(cache =>
                cache.match(request).then(cached =>
                    cached || fetch(request).then(response => {
                        cache.put(request, response.clone());
                        return response;
                    }).catch(() => cached)
                )
            )
        );
        return;
    }

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
