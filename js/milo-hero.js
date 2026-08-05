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
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var A = window.anime && window.anime.animate ? window.anime : null;
  var animating = false;

  function show(next) {
    var target = Math.max(0, Math.min(slides.length - 1, next));
    if (target === idx || animating) return;

    var outgoing = slides[idx];
    var incoming = slides[target];
    var dir = target > idx ? 1 : -1;

    function finish() {
      outgoing.classList.remove("is-active", "is-leaving");
      outgoing.setAttribute("aria-hidden", "true");
      outgoing.style.transform = "";
      outgoing.style.opacity = "";
      outgoing.style.filter = "";

      incoming.classList.add("is-active");
      incoming.classList.remove("is-entering");
      incoming.setAttribute("aria-hidden", "false");
      incoming.style.transform = "";
      incoming.style.opacity = "";
      incoming.style.filter = "";

      idx = target;
      if (countEl) countEl.textContent = (idx + 1) + " / " + slides.length;
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) nextBtn.disabled = idx === slides.length - 1;

      deck.dispatchEvent(new CustomEvent("deck-change", {
        detail: { index: idx, slide: incoming, direction: dir }
      }));
      animating = false;
    }

    if (reduce || !A) {
      slides.forEach(function (slide, n) {
        var active = n === target;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      idx = target;
      if (countEl) countEl.textContent = (idx + 1) + " / " + slides.length;
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) nextBtn.disabled = idx === slides.length - 1;
      deck.dispatchEvent(new CustomEvent("deck-change", {
        detail: { index: idx, slide: incoming, direction: dir }
      }));
      return;
    }

    animating = true;
    outgoing.classList.add("is-leaving");
    incoming.classList.add("is-entering");
    incoming.classList.add("is-active");
    incoming.setAttribute("aria-hidden", "false");

    var outY = dir > 0 ? -14 : 14;
    var inY = dir > 0 ? 18 : -18;

    A.animate(outgoing, {
      opacity: [1, 0],
      y: [0, outY],
      scale: [1, 0.96],
      filter: ["blur(0px)", "blur(4px)"],
      duration: 380,
      ease: "in(3)"
    });

    incoming.style.opacity = "0";
    incoming.style.transform = "translateY(" + inY + "px) scale(0.96)";
    incoming.style.filter = "blur(4px)";

    A.animate(incoming, {
      opacity: [0, 1],
      y: [inY, 0],
      scale: [0.96, 1],
      filter: ["blur(4px)", "blur(0px)"],
      duration: 520,
      ease: "out(4)",
      delay: 70
    }).then(finish);
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

  /* Parallax on stickers + headphone bg — desktop only */
  var field = document.querySelector("[data-sticker-field]");
  var heroFloat = document.querySelector("[data-hero-float]");
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    var stickers = field
      ? Array.prototype.slice.call(field.querySelectorAll(".sticker"))
      : [];
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

      if (heroFloat) {
        var hf = 18 + Math.abs(dx) * 8;
        heroFloat.style.transform =
          "translate(calc(-50% + " + (dx * hf).toFixed(1) + "px), calc(-50% + " +
          (dy * hf).toFixed(1) + "px))";
      }
    });
  }

  slides.forEach(function (slide, n) {
    slide.classList.toggle("is-active", n === 0);
    slide.setAttribute("aria-hidden", n === 0 ? "false" : "true");
  });
  if (countEl) countEl.textContent = "1 / " + slides.length;
  if (prevBtn) prevBtn.disabled = true;
  if (nextBtn) nextBtn.disabled = slides.length <= 1;
})();
