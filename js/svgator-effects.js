/* SVGator-style effects — line draw, split type, ambient motion, section reveals */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var M = window.Motion && window.Motion.animate ? window.Motion : null;

  function splitTitle(el) {
    if (!el || el.dataset.splitDone) return;
    var text = el.textContent.trim();
    if (!text) return;
    el.dataset.splitDone = "1";
    el.classList.add("deck__title--split");
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split("").map(function (ch, i) {
      if (ch === " ") return "<span class=\"char space\" style=\"--ci:" + i + "\">&nbsp;</span>";
      return "<span class=\"char\" style=\"--ci:" + i + "\">" + ch + "</span>";
    }).join("");
    requestAnimationFrame(function () {
      el.classList.add("is-revealed");
    });
  }

  function revealDeckTitle(slide) {
    if (!slide || reduce) return;
    var title = slide.querySelector(".deck__title");
    if (!title) return;
    if (title.classList.contains("deck__title--split")) {
      title.classList.remove("is-revealed");
      requestAnimationFrame(function () {
        title.classList.add("is-revealed");
      });
    } else {
      splitTitle(title);
    }
  }

  /* Expressive typography on hero deck (#4) */
  var deck = document.querySelector("[data-deck]");
  if (deck) {
    revealDeckTitle(deck.querySelector(".deck__slide.is-active"));
    deck.addEventListener("deck-change", function (e) {
      if (e.detail && e.detail.slide) revealDeckTitle(e.detail.slide);
    });
  }

  /* Self-drawing section lines (#7/#8) — replay when section enters view */
  if (!reduce && M && M.inView) {
    Array.prototype.slice.call(document.querySelectorAll("[data-svg-draw]")).forEach(function (svg) {
      var path = svg.querySelector("path");
      if (!path) return;
      path.setAttribute("pathLength", "1");
      var stop = M.inView(svg, function () {
        path.style.animation = "none";
        void path.offsetWidth;
        path.style.animation = "";
        svg.classList.add("is-drawn");
      }, { amount: 0.4 });
    });
  }

  /* Fact counter pop with scale microinteraction (#12) */
  if (!reduce && M && M.inView) {
    Array.prototype.slice.call(document.querySelectorAll(".fact")).forEach(function (fact) {
      M.inView(fact, function () {
        M.animate(fact, { scale: [0.94, 1] }, { duration: 0.55, ease: [0.16, 1, 0.3, 1] });
      }, { amount: 0.5 });
    });
  }

  /* Contact card tilt hover — faux 3D (#14) */
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    Array.prototype.slice.call(document.querySelectorAll(".contact-card")).forEach(function (card) {
      if (card.tagName === "A" || card.querySelector("a")) {
        card.addEventListener("mousemove", function (e) {
          var r = card.getBoundingClientRect();
          var rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
          var ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
          card.style.transform = "perspective(800px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-3px)";
        });
        card.addEventListener("mouseleave", function () {
          card.style.transform = "";
        });
      }
    });
  }

  /* Copy button microinteraction feedback */
  Array.prototype.slice.call(document.querySelectorAll(".copy-btn")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (reduce || !M) return;
      M.animate(btn, { scale: [1, 0.88, 1] }, { duration: 0.35, ease: "easeOut" });
    });
  });
})();
