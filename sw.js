// ── Service Worker — Finanças Pessoais ───────────────────────────────────────
const CACHE_NAME = 'financas-v1';

// Files to pre-cache on install (app shell + CDN deps)
const PRECACHE = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  // CDN scripts — cached on first fetch, listed here for pre-cache attempt
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

// JS component files (will be pre-cached relative to sw.js scope)
const APP_FILES = [
  './js/config.js',
  './js/storage.js',
  './js/helpers.js',
  './js/parsers.js',
  './js/components/Icons.jsx',
  './js/components/Calc.jsx',
  './js/components/Shared.jsx',
  './js/components/Auth.jsx',
  './js/components/NotifImporter.jsx',
  './js/components/Banners.jsx',
  './js/components/FilterModal.jsx',
  './js/components/FabTxRow.jsx',
  './js/components/Pages.jsx',
  './js/components/Modals.jsx',
  './js/app.jsx',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        [...PRECACHE, ...APP_FILES].map(url =>
          cache.add(url).catch(() => {/* ignore CDN failures on install */})
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for HTML, cache-first for everything else
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always fetch HTML fresh so updates are picked up
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return resp;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-first for assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        if (resp && resp.status === 200 && resp.type !== 'opaque') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
