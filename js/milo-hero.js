/* Milo-style hero — slide deck navigation + sticker parallax */
(function () {
  "use strict";

  var deck = document.querySelector("[data-deck]");
  if (!deck) return;

  var slides = Array.prototype.slice.call(deck.querySelectorAll(".deck__slide"));
  var prevBtn = document.querySelector("[data-deck-prev]");
  var nextBtn = document.querySelector("[data-deck-next]");
  var countEl = document.querySelector("[data-deck-count]");
  var idx = 0;

  function show(next) {
    idx = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach(function (slide, n) {
      var active = n === idx;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    if (countEl) countEl.textContent = (idx + 1) + " / " + slides.length;
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === slides.length - 1;
    deck.dispatchEvent(new CustomEvent("deck-change", {
      detail: { index: idx, slide: slides[idx] }
    }));
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () { show(idx - 1); });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () { show(idx + 1); });
  }

  document.addEventListener("keydown", function (e) {
    if (!deck.closest(".hero--milo")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      show(idx + 1);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      show(idx - 1);
    }
  });

  /* Touch swipe — phones & tablets */
  var touchStartX = 0;
  deck.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  deck.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return;
    show(dx < 0 ? idx + 1 : idx - 1);
  }, { passive: true });

  /* Subtle parallax on stickers — desktop only */
  var field = document.querySelector("[data-sticker-field]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (field && !reduce && window.matchMedia("(pointer: fine)").matches) {
    var stickers = Array.prototype.slice.call(field.querySelectorAll(".sticker"));
    var baseRot = stickers.map(function (st) {
      var rot = getComputedStyle(st).getPropertyValue("--rot").trim() || "0deg";
      return parseFloat(rot) || 0;
    });

    window.addEventListener("mousemove", function (e) {
      var cx = window.innerWidth * 0.5;
      var cy = window.innerHeight * 0.5;
      var dx = (e.clientX - cx) / cx;
      var dy = (e.clientY - cy) / cy;
      stickers.forEach(function (st, i) {
        var factor = 6 + (i % 4) * 3;
        st.style.transform =
          "rotate(" + baseRot[i] + "deg) translate(" +
          (dx * factor).toFixed(1) + "px," +
          (dy * factor).toFixed(1) + "px)";
      });
    });
  }

  show(0);
})();
