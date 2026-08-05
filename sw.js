/* Offline support. Deliberately conservative:
   - HTML is network-first, so a fresh deploy is never masked by a stale cache;
     the cached copy is only used when the network genuinely fails.
   - Static assets are cache-first, which is what makes the site (and the hidden
     game) usable with no connection at all.
   - Videos are never cached. They are ~21 MB and would blow past the origin's
     storage quota for no benefit.
   Bump CACHE_VERSION to retire every old cache on the next activation. */
var CACHE_VERSION = "kv-v37";

var PRECACHE = [
  "./",
  "./index.html",
  "./resume/",
  "./resume/index.html",
  "./css/style.css",
  "./css/milo-hero.css",
  "./css/work-fly.css",
  "./css/nav-theme.css",
  "./css/cv-carousel.css",
  "./css/svgator-effects.css",
  "./css/theme-motion.css",
  "./css/minimal.css",
  "./css/contact-panel.css",
  "./css/cursor-water.css",
  "./resume/css/style.css",
  "./resume/css/resume-theme.css",
  "./assets/brand-mark.svg",
  "./assets/portraits/kunal-portrait.png",
  "./assets/portraits/kunal-headphones.png",
  "./assets/Kunal-Varshney-Resume.docx",
  "./assets/Kunal-Varshney-Resume.pdf",
  "./assets/work/padma-gate-light.jpg",
  "./assets/work/jai-home-care.jpg",
  "./assets/work/portfolio.jpg",
  "./assets/cv/cv-now.jpg",
  "./assets/cv/cv-support.jpg",
  "./assets/cv/cv-school.jpg",
  "./assets/cv/cv-skills.jpg",
  "./assets/cv/cv-reels.jpg",
  "./assets/cv/cv-vault.jpg",
  "./assets/cv/cv-poster-1.jpg",
  "./assets/cv/cv-poster-2.jpg",
  "./assets/stickers/sticker-01.jpg",
  "./assets/stickers/sticker-02.jpg",
  "./assets/stickers/sticker-03.jpg",
  "./assets/stickers/sticker-04.jpg",
  "./assets/stickers/sticker-05.jpg",
  "./assets/stickers/sticker-06.jpg",
  "./assets/stickers/sticker-07.jpg",
  "./assets/stickers/sticker-08.jpg",
  "./assets/stickers/sticker-09.jpg",
  "./assets/stickers/sticker-10.jpg",
  "./assets/stickers/sticker-13.jpg",
  "./assets/stickers/sticker-14.jpg",
  "./assets/stickers/sticker-15.jpg",
  "./assets/stickers/sticker-16.jpg",
  "./assets/stickers/sticker-17.jpg",
  "./assets/stickers/sticker-18.jpg",
  "./assets/stickers/sticker-19.jpg",
  "./js/main.js",
  "./js/animations.js",
  "./js/milo-hero.js",
  "./js/carousel.js",
  "./js/svgator-effects.js",
  "./js/lottie-accents.js",
  "./js/cv-carousel.js",
  "./js/work-fly.js",
  "./js/cursor-water.js",
  "./js/instagram.js",
  "./js/stretch-reveal.js",
  "./js/game.js",
  "./js/vendor/anime.umd.min.js",
  "./js/vendor/motion.min.js",
  "./resume/js/main.js",
  "./assets/favicon.svg",
  "./resume/assets/favicon.svg"
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
