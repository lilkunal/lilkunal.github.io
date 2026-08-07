/* Injects Google Search Console verification meta when gscVerification is set.
   Must run synchronously in <head> before crawlers finish parsing. */
(function () {
  "use strict";
  var code = (window.KV_SITE && window.KV_SITE.gscVerification || "").trim();
  if (!code) return;
  var m = document.createElement("meta");
  m.name = "google-site-verification";
  m.content = code;
  document.head.appendChild(m);
})();
