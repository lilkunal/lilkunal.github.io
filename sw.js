/* Offline support. Deliberately conservative:
   - HTML is network-first, so a fresh deploy is never masked by a stale cache;
     the cached copy is only used when the network genuinely fails.
   - Static assets are cache-first, which is what makes the site (and the hidden
     game) usable with no connection at all.
   - Videos are never cached. They are ~21 MB and would blow past the origin's
     storage quota for no benefit.
   Bump CACHE_VERSION to retire every old cache on the next activation. */
var CACHE_VERSION = "kv-v4";

var PRECACHE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/main.js",
  "./js/animations.js",
  "./js/shader.js",
  "./js/carousel.js",
  "./js/work-parallax.js",
  "./js/game.js",
  "./js/vendor/anime.umd.min.js",
  "./js/vendor/motion.min.js",
  "./assets/favicon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      /* addAll is atomic — one 404 would reject the whole install, so add them
         individually and let any single miss pass. */
      return Promise.all(PRECACHE.map(function (url) {
        return cache.add(url).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE_VERSION ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isCacheable(url) {
  if (url.origin !== self.location.origin) return false;
  if (/\.(mp4|webm|mov|pdf)$/i.test(url.pathname)) return false;
  return true;
}

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (!isCacheable(url)) return;

  /* Navigations: try the network, fall back to cache when offline. */
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match("./index.html");
        });
      })
    );
    return;
  }

  /* Everything else: serve from cache, refresh it in the background. */
  event.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
