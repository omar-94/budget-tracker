console.log('This is your service-worker.js file.');

const FILES_TO_CACHE = [
  '/',
  '/db.js',
  '/index.html',
  '/index.js',
  '/styles.css',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// Install
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(DATA_CACHE_NAME)
      .then((cache) => cache.add('/api/transaction'))
  );

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );

  self.skipWaiting();
});

// Activate
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('Removing old cache data', key);
          }
        })
      )
    })
  )

  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', function (event) {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
        .then(response => {
          if (response.satus === 200) {
            cache.put(event.request.url, response.clone());
          }
          return response;
        })
        .catch(err => {
          return cache.match(event.request);
        });
      })
      .catch(err => console.log(err))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    })
  )
});

