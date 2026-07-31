(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Theme toggle */
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var stored = null;
  try { stored = localStorage.getItem("kv-theme"); } catch (e) {}
  if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);

  function currentTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("kv-theme", next); } catch (e) {}
    });
  }

  /* Mobile nav */
  var navToggleInput = document.getElementById("nav-toggle");
  var railLinks = Array.prototype.slice.call(document.querySelectorAll(".rail__link"));
  railLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (navToggleInput) navToggleInput.checked = false;
    });
  });

  /* Scroll-spy */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .section"));
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute("id");
          var link = document.querySelector('.rail__link[data-section="' + id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            railLinks.forEach(function (l) { l.classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* Reveal on scroll */
  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll(".timeline__item, .venture, .credential-card, .project-card, .achievements, .contact-card")
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window && revealTargets.length) {
    var reveal = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { reveal.observe(el); });

    /* Safety net. Scroll-reveal must never be able to permanently hide real
       content — if the observer never fires for an element on some device or
       browser (in-app browsers embedded in Instagram/LinkedIn/etc. are known
       to be inconsistent with IntersectionObserver), the visitor should still
       see everything, just without the entrance animation. This was very
       likely the actual cause of "can't see anything" on mobile: almost
       every section below the hero — timeline, credentials, contact cards —
       depended entirely on this observer firing, with nothing to fall back on. */
    setTimeout(function () {
      revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
    }, 1800);
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Copy email */
  var copyBtn = document.querySelector(".copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var value = copyBtn.getAttribute("data-copy") || "";
      var done = function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        copyBtn.classList.add("is-copied");
        setTimeout(function () {
          copyBtn.textContent = original;
          copyBtn.classList.remove("is-copied");
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }
})();
