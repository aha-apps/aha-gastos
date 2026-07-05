// sw.js — Service Worker offline-first con cache strategies
var CACHE = 'aha-gastos-v1';
var ASSETS = [
  '/',
  'index.html',
  'core/env.js',
  'core/db.js',
  'core/crypto.js',
  'core/ui.js',
  'core/theme.js',
  'core/app.js',
  'core/search-palette.js',
  'core/file-store.js',
  'core/sync.js',
  'core/license.js',
  'core/network.js',
  'core/seed.js',
  'core/main.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  // Network-first for navigation (HTML)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function() {
        return caches.match('index.html');
      })
    );
    return;
  }
  // Cache-first for assets
  e.respondWith(
    caches.match(req).then(function(r) {
      return r || fetch(req);
    })
  );
});
