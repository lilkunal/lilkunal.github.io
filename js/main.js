(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Theme toggle */
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var stored = null;
  try { stored = localStorage.getItem("kv-theme"); } catch (e) {}
  root.setAttribute("data-theme", (stored === "light" || stored === "dark") ? stored : "light");

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
      clockEl.textContent = "Now screening · Aligarh, India · " + fmt.format(new Date());
    }
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* Identity ticker */
  var tickerWords = ["web designer", "football regular", "Ghibli defender", "Padma Enterprises founder", "technical support veteran", "old soul"];
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

  /* Persona switcher */
  var personaCaptions = {
    itguy: "Has fixed more Wi-Fi routers than he'd like to admit.",
    actor: "Could probably cry on command. Still can't dance.",
    businessman: "Owns exactly one good watch. Wears it to everything.",
    funnyguy: "The friend who ruins serious photos on purpose.",
    nextdoor: "Will help you move furniture. Will judge your paint choice silently."
  };
  var personaOrder = ["itguy", "actor", "businessman", "funnyguy", "nextdoor"];
  var personaTabs = Array.prototype.slice.call(document.querySelectorAll(".persona-tab"));
  var personaPhotos = Array.prototype.slice.call(document.querySelectorAll(".persona-photo"));
  var personaCaptionEl = document.getElementById("persona-caption");

  function activatePersona(persona) {
    personaTabs.forEach(function (t) { t.classList.toggle("is-active", t.getAttribute("data-persona") === persona); });
    personaPhotos.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-persona") === persona); });
    if (personaCaptionEl && personaCaptions[persona]) personaCaptionEl.textContent = personaCaptions[persona];
  }

  var personaAutoTimer = null;
  if (personaTabs.length && !reduceMotion) {
    var personaAutoIndex = 0;
    personaAutoTimer = setInterval(function () {
      personaAutoIndex = (personaAutoIndex + 1) % personaOrder.length;
      activatePersona(personaOrder[personaAutoIndex]);
    }, 4200);
  }
  personaTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (personaAutoTimer) { clearInterval(personaAutoTimer); personaAutoTimer = null; }
      activatePersona(tab.getAttribute("data-persona"));
    });
  });

  /* Project inquiry form -> hands off to the visitor's own email/WhatsApp app */
  var projectForm = document.getElementById("project-form");
  if (projectForm) {
    var emailBtn = document.getElementById("form-send-email");
    var waBtn = document.getElementById("form-send-whatsapp");

    function buildInquiryMessage() {
      var name = projectForm.name.value.trim();
      var business = projectForm.business.value.trim();
      var contact = projectForm.contact.value.trim();
      var message = projectForm.message.value.trim();
      var lines = ["Name: " + name];
      if (business) lines.push("Business: " + business);
      lines.push("Reach me at: " + contact);
      lines.push("");
      lines.push(message);
      return lines.join("\n");
    }

    function validateInquiry() {
      if (!projectForm.name.value.trim() || !projectForm.contact.value.trim() || !projectForm.message.value.trim()) {
        projectForm.reportValidity();
        return false;
      }
      return true;
    }

    if (emailBtn) {
      emailBtn.addEventListener("click", function () {
        if (!validateInquiry()) return;
        var subject = encodeURIComponent("New project inquiry from " + (projectForm.name.value.trim() || "your website"));
        var body = encodeURIComponent(buildInquiryMessage());
        window.location.href = "mailto:kunalvrshn@gmail.com?subject=" + subject + "&body=" + body;
      });
    }
    if (waBtn) {
      waBtn.addEventListener("click", function () {
        if (!validateInquiry()) return;
        var text = encodeURIComponent(buildInquiryMessage());
        window.open("https://wa.me/917017662533?text=" + text, "_blank", "noopener");
      });
    }
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

  /* Count-up stats */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count-to"), 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target; return; }
    var start = null;
    var duration = 1100;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var factStrip = document.querySelector(".fact-strip");
  if (factStrip && "IntersectionObserver" in window) {
    var countEls = Array.prototype.slice.call(factStrip.querySelectorAll(".count-num"));
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countEls.forEach(animateCount);
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    countObserver.observe(factStrip);
  }

  /* Spotlight hover on cards */
  if (window.matchMedia("(pointer: fine)").matches) {
    var spotlightEls = Array.prototype.slice.call(
      document.querySelectorAll(".service-card, .work-tile, .contact-card, .faq-item")
    );
    spotlightEls.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - rect.left) + "px");
        el.style.setProperty("--my", (e.clientY - rect.top) + "px");
      });
    });
  }

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
