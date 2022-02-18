const NAVIGATION_CACHE = "navigation-cache-v1";
const ERROR_CACHE = "error-cache-v1";
const OFFLINE_URL = "offline.html";
const urlsToCache = ["/", "/contact.html", "/about.html"];

// Add to cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // Handles the navigation cache
      await caches
        .open(NAVIGATION_CACHE)
        .then((cache) => {
          return cache.addAll(urlsToCache);
        })
        .catch((err) => {
          console.log(err);
        });

      // Handles the error cache
      await caches.open(ERROR_CACHE).then((cache) => {
        return cache.add(
          new Request(OFFLINE_URL, {
            cache: "reload",
          })
        );
      });
    })()
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported.
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  self.clients.claim();
});

// Fetch from cache
self.addEventListener("fetch", function (event) {
  event.respondWith(
    (async () => {
      try {
        // Use network first strategy
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        console.log("Fetch failed; returning offline page instead.", error);
        var cache = await caches.open(NAVIGATION_CACHE);
        // load pages from cache
        var cachedResponse = await cache.match(event.request);

        if (!cachedResponse) {
          cache = await caches.open(ERROR_CACHE);
          cachedResponse = await cache.match(OFFLINE_URL);
        }

        return cachedResponse;
      }
    })()
  );
});
