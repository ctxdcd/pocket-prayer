const CACHE_NAME = "pocket-prayer-v1";

const APP_ASSETS = [
  "./",
  "./index.html",
  "./salah.html",
  "./dhikr.html",
  "./dua.html",

  "./css/style.css",
  "./js/script.js",

  "./manifest.json",

  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* =========================================
   INSTALL
========================================= */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_ASSETS);
    })
  );

  self.skipWaiting();
});

/* =========================================
   ACTIVATE
========================================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/* =========================================
   FETCH
========================================= */

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request)
      );
    })
  );
});