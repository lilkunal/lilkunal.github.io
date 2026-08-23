/* Offline support. Deliberately conservative:
   - HTML is network-first, so a fresh deploy is never masked by a stale cache;
     the cached copy is only used when the network genuinely fails.
   - Static assets are cache-first, which is what makes the site (and the hidden
     game) usable with no connection at all.
   - Videos are never cached.
   Bump CACHE_VERSION to retire every old cache on the next activation. */
var CACHE_VERSION = "kv-v78";

var PRECACHE = [
  "./",
  "./index.html",
  "./work/",
  "./work/index.html",
  "./portfolios/",
  "./portfolios/index.html",
  "./resume/",
  "./resume/index.html",
  "./assets/hire-me.html",
  "./css/style.css",
  "./css/editorial-hero.css",
  "./css/show-pages.css",
  "./css/nav-theme.css",
  "./css/cv-scroll.css",
  "./css/contact-panel.css",
  "./css/upgrade-sections.css",
  "./resume/css/style.css",
  "./resume/css/resume-theme.css",
  "./assets/brand-mark.svg",
  "./assets/photos/kunal-hero-profile.png",
  "./assets/photos/site-bg-illustration.png",
  "./assets/Kunal-Varshney-Resume.pdf",
  "./assets/cv/cv-now.jpg",
  "./assets/cv/cv-support.jpg",
  "./assets/cv/cv-school.jpg",
  "./assets/cv/cv-skills.jpg",
  "./assets/cv/cv-reels.jpg",
  "./assets/cv/cv-vault.jpg",
  "./assets/cv/cv-poster-1.jpg",
  "./assets/cv/cv-poster-2.jpg",
  "./js/main.js",
  "./js/cv-scroll.js",
  "./js/site-config.js",
  "./js/seo-head.js",
  "./js/analytics.js",
  "./js/game.js",
  "./resume/js/main.js",
  "./assets/favicon.svg",
  "./resume/assets/favicon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
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
