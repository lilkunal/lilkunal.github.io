/* Background timeline — vertical scroll drives horizontal panel track.
   Desktop: sticky pin + Motion scroll. Mobile: native horizontal snap. */
(function () {
  "use strict";

  var root = document.querySelector("[data-cv-scroll]");
  if (!root) return;

  var runway = root.querySelector("[data-cv-scroll-runway]");
  var track = root.querySelector("[data-cv-scroll-track]");
  var viewport = root.querySelector(".cv-scroll__viewport");
  var bar = root.querySelector("[data-cv-scroll-bar]");
  var counter = root.querySelector("[data-cv-scroll-counter]");
  var rail = root.querySelector("[data-cv-scroll-rail]");
  var panels = Array.prototype.slice.call(root.querySelectorAll("[data-cv-panel]"));

  if (!runway || !track || !panels.length) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(max-width: 860px)").matches;
  var M = window.Motion && window.Motion.scroll ? window.Motion : null;
  var activeIndex = 0;

  function setActiveIndex(i) {
    activeIndex = i;
    panels.forEach(function (p, idx) {
      p.classList.toggle("is-active", idx === i);
      p.classList.toggle("is-near", Math.abs(idx - i) === 1);
    });
    if (rail) {
      var items = rail.querySelectorAll(".cv-scroll__rail-item");
      items.forEach(function (item, idx) {
        item.classList.toggle("is-active", idx === i);
      });
    }
    if (counter) counter.textContent = String(i + 1).padStart(2, "0") + " / " + String(panels.length).padStart(2, "0");
  }

  function buildRail() {
    if (!rail) return;
    var labels = ["Now", "Padma", "Support", "School", "Skills", "Reels", "Résumé"];
    rail.innerHTML = "";
    panels.forEach(function (_, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cv-scroll__rail-item" + (i === 0 ? " is-active" : "");
      btn.textContent = labels[i] || String(i + 1);
      btn.addEventListener("click", function () {
        scrollToPanel(i);
      });
      rail.appendChild(btn);
    });
  }

  function scrollToPanel(i) {
    if (coarse && viewport) {
      var panel = panels[i];
      if (panel) panel.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setActiveIndex(i);
      return;
    }
    var maxScroll = runway.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    var target = (i / Math.max(panels.length - 1, 1)) * maxScroll;
    var top = runway.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + target, behavior: reduce ? "auto" : "smooth" });
  }

  function setupDesktopPin() {
    if (coarse || reduce) {
      runway.style.height = "auto";
      setActiveIndex(0);
      panels.forEach(function (p) {
        p.classList.add("is-near");
      });
      return;
    }

    var panelScroll = Math.max(window.innerHeight * 0.75, 520);
    runway.style.height = panelScroll * panels.length + "px";

    function update(progress) {
      var maxX = Math.max(track.scrollWidth - viewport.clientWidth, 0);
      var x = progress * maxX;
      track.style.transform = "translate3d(" + (-x).toFixed(1) + "px, 0, 0)";
      if (bar) bar.style.width = (progress * 100).toFixed(1) + "%";

      var idx = Math.round(progress * Math.max(panels.length - 1, 1));
      idx = Math.min(Math.max(idx, 0), panels.length - 1);
      if (idx !== activeIndex) setActiveIndex(idx);
    }

    if (M) {
      M.scroll(function (progress) {
        update(progress);
      }, { target: runway, offset: ["start start", "end end"] });
    } else {
      window.addEventListener("scroll", function () {
        var rect = runway.getBoundingClientRect();
        var total = runway.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        var scrolled = Math.min(Math.max(-rect.top, 0), total);
        update(scrolled / total);
      }, { passive: true });
    }

    setActiveIndex(0);
  }

  function setupMobileSnap() {
    if (!coarse || !viewport) return;
    viewport.addEventListener("scroll", function () {
      var center = viewport.scrollLeft + viewport.clientWidth / 2;
      var best = 0;
      var bestDist = Infinity;
      panels.forEach(function (p, i) {
        var mid = p.offsetLeft + p.offsetWidth / 2;
        var dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      if (best !== activeIndex) setActiveIndex(best);
      if (bar && viewport.scrollWidth > viewport.clientWidth) {
        var p = viewport.scrollLeft / (viewport.scrollWidth - viewport.clientWidth);
        bar.style.width = (p * 100).toFixed(1) + "%";
      }
    }, { passive: true });
  }

  buildRail();
  setupDesktopPin();
  setupMobileSnap();

  window.addEventListener("resize", function () {
    coarse = window.matchMedia("(max-width: 860px)").matches;
    track.style.transform = "";
    setupDesktopPin();
  }, { passive: true });
})();
