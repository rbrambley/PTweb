const CACHE_NAME = 'pt-tracker-v30';
const CDN_CACHE_NAME = 'pt-cdn-v1';

// Paths are relative to this service worker's directory.
// This lets the PWA work when served from a subfolder, e.g. /PTweb/.
const APP_SHELL = [
    './',
    'index.html',
    'styles.css',
    'app.js',
    'state.js',
    'countdown.js',
    'settings.js',
    'exercises.js',
    'milestones.js',
    'progress.js',
    'daily.js',
    'reports.js',
    'calendar.js',
    'config.js',
    'utils.js',
    'storage.js',
    'manifest.json',
    'favicon.svg'
];

const CDN_PATTERNS = [
    /^https:\/\/cdn\.jsdelivr\.net/
];

function isCdnUrl(url) {
    return CDN_PATTERNS.some(pattern => pattern.test(url));
}

// Resolve a relative shell path to an absolute URL.
function shellUrl(path) {
    return new URL(path, self.location).toString();
}

// Resolve the set of app-shell pathnames for quick fetch matching.
const APP_SHELL_PATHNAMES = new Set(APP_SHELL.map(p => new URL(p, self.location).pathname));

// Try the request itself, and fall back to the cached index.html for root requests.
function matchShellCache(request, url) {
    return caches.match(request).then(cached => {
        if (cached) return cached;
        const rootPath = new URL('./', self.location).pathname;
        if (url.pathname === rootPath) {
            return caches.match(shellUrl('index.html'));
        }
        return undefined;
    });
}

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL.map(shellUrl)))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME && key !== CDN_CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', function(event) {
    const { request } = event;
    const url = new URL(request.url);

    // Cache known CDN assets (e.g. Chart.js) for offline use.
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

    // Only cache same-origin app shell requests.
    if (url.origin !== self.location.origin) {
        return;
    }

    const isAppShell = APP_SHELL_PATHNAMES.has(url.pathname);

    event.respondWith(
        matchShellCache(request, url).then(cached => {
            if (isAppShell) {
                return cached || fetch(request).then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, response.clone());
                        return response;
                    });
                });
            }

            // For other same-origin requests, try the network first, then fall back.
            return fetch(request).catch(() => cached);
        })
    );
});
