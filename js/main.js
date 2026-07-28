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

  /* Mobile nav: close on link click */
  var navToggleInput = document.getElementById("nav-toggle");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (navToggleInput) navToggleInput.checked = false;
    });
  });

  /* Live clock — Aligarh, India (IST) */
  var clockEl = document.getElementById("live-clock");
  if (clockEl) {
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    } catch (e) { fmt = null; }
    function tickClock() {
      if (!fmt) return;
      clockEl.textContent = "Aligarh, India · " + fmt.format(new Date());
    }
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* Identity ticker */
  var tickerWords = ["web designer", "football regular", "Ghibli defender", "Padma Enterprises founder", "technical support veteran"];
  var tickerEl = document.getElementById("ticker-word");
  if (tickerEl) {
    var tickerIndex = 0;
    setInterval(function () {
      tickerEl.classList.add("is-fading");
      setTimeout(function () {
        tickerIndex = (tickerIndex + 1) % tickerWords.length;
        tickerEl.textContent = tickerWords[tickerIndex];
        tickerEl.classList.remove("is-fading");
      }, 250);
    }, 2600);
  }

  /* Copy to clipboard */
  var copyBtns = Array.prototype.slice.call(document.querySelectorAll(".copy-btn"));
  copyBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var value = btn.getAttribute("data-copy");
      var original = btn.textContent;
      function flash(text) {
        btn.textContent = text;
        setTimeout(function () { btn.textContent = original; }, 1500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { flash("Copied"); }).catch(function () { flash("Copy failed"); });
      } else {
        flash("Copy failed");
      }
    });
  });

  /* FAQ toggle */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  var faqAnswer = document.getElementById("faq-answer");
  faqItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var alreadyActive = item.classList.contains("is-active");
      faqItems.forEach(function (i) { i.classList.remove("is-active"); });
      if (alreadyActive) {
        if (faqAnswer) faqAnswer.textContent = "";
      } else {
        item.classList.add("is-active");
        if (faqAnswer) faqAnswer.textContent = item.getAttribute("data-a");
      }
    });
  });

  /* Reveal on scroll */
  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll(".service-card, .step, .contact-card, .fact, .work, .personal-aside, .work-tile")
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window && revealTargets.length) {
    var reveal = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { reveal.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
