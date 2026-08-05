/* Instagram section.
   ------------------------------------------------------------------
   TO SHOW REAL POSTS: open any post on your profile, copy its URL from
   the address bar, and paste it into IG_POSTS below. Three works best.

     var IG_POSTS = [
       "https://www.instagram.com/p/ABC123xyz/",
       "https://www.instagram.com/reel/DEF456uvw/",
       "https://www.instagram.com/p/GHI789rst/"
     ];

   Leave it empty and the section still renders — it falls back to an
   on-brand profile card, so the page is never broken or half-built.
   ------------------------------------------------------------------
   Why not a live auto-updating feed: that needs the Instagram Graph API,
   which requires a Business/Creator account, a Facebook app, and access
   tokens that expire and must be refreshed server-side. This site has no
   backend, so there's nowhere to do that refresh. Official post embeds
   need no key, no token, and never expire.

   Instagram's embed script is third-party Meta code, so it is loaded
   lazily — only if a visitor actually scrolls to this section, and only
   when there are posts to render. Nobody who never reaches the bottom of
   the page pays for it, in bandwidth or in tracking. */
(function () {
  "use strict";

  var IG_POSTS = [
    // Paste your post URLs here — see the note above.
  ];

  var PROFILE_URL = "https://www.instagram.com/old_soul_______/";
  var HANDLE = "@old_soul_______";

  var root = document.querySelector("[data-ig-feed]");
  if (!root) return;

  var grid = root.querySelector("[data-ig-grid]");
  if (!grid) return;

  /* --- No posts configured: render the fallback card and stop. --- */
  if (!IG_POSTS.length) {
    var card = document.createElement("a");
    card.className = "ig-card";
    card.href = PROFILE_URL;
    card.target = "_blank";
    card.rel = "noopener";
    card.innerHTML =
      '<span class="ig-card__glyph" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
          '<rect x="3" y="3" width="18" height="18" rx="5.5"/>' +
          '<circle cx="12" cy="12" r="4.2"/>' +
          '<circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/>' +
        '</svg>' +
      '</span>' +
      '<span class="ig-card__body">' +
        '<span class="ig-card__handle">' + HANDLE + '</span>' +
        '<span class="ig-card__note">Films, football, and questionable acting. Mostly the last one.</span>' +
      '</span>' +
      '<span class="ig-card__go">Open →</span>';
    grid.appendChild(card);
    return;
  }

  /* --- Posts configured: build the blockquotes Instagram's script upgrades. --- */
  IG_POSTS.forEach(function (url) {
    var clean = String(url).split("?")[0];
    if (clean.charAt(clean.length - 1) !== "/") clean += "/";
    var bq = document.createElement("blockquote");
    bq.className = "instagram-media";
    bq.setAttribute("data-instgrm-permalink", clean);
    bq.setAttribute("data-instgrm-version", "14");
    /* Shown only until Instagram's script swaps in the real embed, and left
       in place permanently if that script is blocked or fails to load. */
    bq.innerHTML = '<a href="' + clean + '" target="_blank" rel="noopener">View this post on Instagram</a>';
    grid.appendChild(bq);
  });

  var loaded = false;
  function loadEmbedScript() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.instagram.com/embed.js";
    s.onload = function () {
      if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
    };
    document.body.appendChild(s);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { loadEmbedScript(); io.disconnect(); }
      });
    }, { rootMargin: "300px" });
    io.observe(root);
    /* Same lesson as the résumé reveal bug: never let content depend solely on
       an observer firing. If it never does, load anyway rather than leaving
       empty boxes on the page. */
    setTimeout(loadEmbedScript, 4000);
  } else {
    loadEmbedScript();
  }
})();
