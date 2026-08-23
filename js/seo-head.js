/* Head helpers. Must run synchronously in <head> before crawlers finish parsing. */
(function () {
  "use strict";
  var vp = document.querySelector('meta[name="viewport"]');
  if (vp) {
    vp.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
  }

  var code = (window.KV_SITE && window.KV_SITE.gscVerification || "").trim();
  if (!code) return;
  var m = document.createElement("meta");
  m.name = "google-site-verification";
  m.content = code;
  document.head.appendChild(m);
})();
