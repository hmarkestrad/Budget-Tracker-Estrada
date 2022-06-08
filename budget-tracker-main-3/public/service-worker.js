const CACHE_NAME = 'BudgetTracker-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/styles.css",
  "/js/index.js",
  "/js/idb.js",
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Installing cache : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE);
    })
  );
})

self.addEventListener('activate', function (event) {
  console.log({ 'activateEvent': event });
  event.waitUntil(caches.keys().then(keyList => {
    console.log({ 'caches': caches }, { 'keyList': keyList });
    return Promise.all(
      keyList.map(key => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('Removing old cache', key);
          return caches.delete(key);
        }
      })
    )
  }))
})

self.addEventListener('fetch', function (event) {
  console.log({ 'fetchEvent': event });
  if (event.request.url.includes('/api')) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then(cache => {
          return fetch(event.request)
            .then(res => {
              if (res.status === 200) {
                cache.put(event.request.url, res.clone());
              }
              return res;
            })
            .catch(err => {
              return cache.match(event.request);
            })
        })
        .catch(err => console.log(err))
    )
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function (request) {
      return request || fetch(event.request);
    })
  )
})