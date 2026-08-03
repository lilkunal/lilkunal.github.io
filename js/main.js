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
  root.setAttribute("data-theme", (stored === "light" || stored === "dark") ? stored : "dark");

  function syncThemeToggle() {
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", currentTheme() === "dark" ? "true" : "false");
  }

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
      document.documentElement.dispatchEvent(new CustomEvent("data-theme-set"));
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

  /* Identity ticker */
  var tickerWords = ["web designer", "football regular", "cinephile", "Padma Enterprises' online guy", "technical support veteran", "old soul"];
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

  /* FAQ accordion — each answer expands directly under its own question */
  var faqEntries = Array.prototype.slice.call(document.querySelectorAll(".faq-entry"));

  function setEntryState(entry, isOpen) {
    entry.classList.toggle("is-active", isOpen);
    var btn = entry.querySelector(".faq-item");
    if (btn) btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
  function closeAllFaq() {
    faqEntries.forEach(function (e) { setEntryState(e, false); });
  }
  function openFaq(entry) {
    closeAllFaq();
    setEntryState(entry, true);
  }
  faqEntries.forEach(function (entry) {
    var btn = entry.querySelector(".faq-item");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var alreadyActive = entry.classList.contains("is-active");
      closeAllFaq();
      if (!alreadyActive) setEntryState(entry, true);
    });
  });

  /* Ask search — checks this page's answers first by keyword. If nothing here
     fits, hands the question off to WhatsApp with the text pre-filled so Kunal
     can answer it directly. Not a live AI, and it can't send on the visitor's
     behalf — they still hit send in their own WhatsApp. */
  var WHATSAPP_NUMBER = "917017662533";
  var askInput = document.getElementById("ask-input");
  var askBtn = document.getElementById("ask-search-btn");
  var askStatus = document.getElementById("ask-status");

  function whatsappAskUrl(question) {
    var msg = "Hi Kunal — I was on your portfolio and the site didn't have an answer for this:\n\n" + question;
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  if (askInput && askBtn && faqEntries.length) {
    function runAskSearch() {
      var raw = (askInput.value || "").trim();
      if (!raw) {
        if (askStatus) askStatus.textContent = "Type a question first — then I'll either answer it here or pass it to me on WhatsApp.";
        return;
      }
      var query = raw.toLowerCase();
      var stop = ["the","and","you","your","are","for","with","how","what","why","when","does","did","can","this","that","have","from","about","much","site","website"];
      var words = query.split(/\s+/).filter(function (w) {
        return w.length > 2 && stop.indexOf(w) === -1;
      });
      var best = null;
      var bestScore = 0;
      faqEntries.forEach(function (entry) {
        var corpus = entry.textContent.toLowerCase();
        var score = 0;
        words.forEach(function (w) { if (corpus.indexOf(w) !== -1) score++; });
        if (score > bestScore) { bestScore = score; best = entry; }
      });

      /* Require at least two matching words (or one when that's all they typed)
         so a single incidental word doesn't return an unrelated answer. */
      var needed = words.length > 1 ? 2 : 1;
      if (best && bestScore >= needed) {
        openFaq(best);
        best.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        if (askStatus) {
          askStatus.innerHTML = "";
          askStatus.appendChild(document.createTextNode("Found an answer on this page — opened below. Not what you meant? "));
          var a = document.createElement("a");
          a.className = "ask-status__link";
          a.href = whatsappAskUrl(raw);
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = "Ask me on WhatsApp instead →";
          askStatus.appendChild(a);
        }
        return;
      }

      /* Nothing on the page fits — hand it to WhatsApp. */
      closeAllFaq();
      var url = whatsappAskUrl(raw);
      if (askStatus) {
        askStatus.innerHTML = "";
        askStatus.appendChild(document.createTextNode("Nothing on this page covers that, so I'm sending it to me — "));
        var link = document.createElement("a");
        link.className = "ask-status__link";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "open WhatsApp to send it →";
        askStatus.appendChild(link);
      }
      /* Runs inside the click/Enter gesture, so popup blockers allow it. The
         status link above is the fallback if a blocker stops it anyway. */
      window.open(url, "_blank", "noopener");
    }
    askBtn.addEventListener("click", runAskSearch);
    askInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); runAskSearch(); }
    });
  }

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
      document.querySelectorAll(".service-card, .work-tile, .contact-card, .faq-entry, .value-pillar")
    );
    spotlightEls.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - rect.left) + "px");
        el.style.setProperty("--my", (e.clientY - rect.top) + "px");
      });
    });
  }

  /* Professional-background tabs. Formal content, switched by pixel tabs. */
  var bgTabs = Array.prototype.slice.call(document.querySelectorAll(".bg-tab"));
  var bgPanels = Array.prototype.slice.call(document.querySelectorAll("[data-bg-panel]"));

  function showBackground(key) {
    bgTabs.forEach(function (t) {
      var on = t.getAttribute("data-bg") === key;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    bgPanels.forEach(function (p) {
      var on = p.getAttribute("data-bg-panel") === key;
      p.classList.toggle("is-active", on);
      if (on) { p.removeAttribute("hidden"); } else { p.setAttribute("hidden", ""); }
    });
  }

  bgTabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      showBackground(tab.getAttribute("data-bg"));
    });
    /* Arrow-key navigation, which a tablist is expected to support. */
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = bgTabs[(i + dir + bgTabs.length) % bgTabs.length];
      showBackground(next.getAttribute("data-bg"));
      next.focus();
    });
  });

  /* Background dropdown in the nav */
  var bgMenuBtn = document.getElementById("bg-menu-btn");
  var bgMenu = document.getElementById("bg-menu");

  function closeBgMenu() {
    if (!bgMenu || !bgMenuBtn) return;
    bgMenu.setAttribute("hidden", "");
    bgMenuBtn.setAttribute("aria-expanded", "false");
  }
  function openBgMenu() {
    if (!bgMenu || !bgMenuBtn) return;
    bgMenu.removeAttribute("hidden");
    bgMenuBtn.setAttribute("aria-expanded", "true");
  }

  if (bgMenuBtn && bgMenu) {
    bgMenuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (bgMenuBtn.getAttribute("aria-expanded") === "true") { closeBgMenu(); } else { openBgMenu(); }
    });
    /* Menu items that point at a tab select it, then scroll the section in. */
    Array.prototype.slice.call(bgMenu.querySelectorAll("[data-bg-jump]")).forEach(function (link) {
      link.addEventListener("click", function () {
        showBackground(link.getAttribute("data-bg-jump"));
        closeBgMenu();
        if (navToggleInput) navToggleInput.checked = false;
      });
    });
    document.addEventListener("click", function (e) {
      if (!bgMenu.contains(e.target) && e.target !== bgMenuBtn) closeBgMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeBgMenu();
    });
  }

  /* Footer easter egg — collapsed by default, holds the acting clips. */
  var secretToggle = document.getElementById("secret-toggle");
  var secretPanel = document.getElementById("secret-panel");
  if (secretToggle && secretPanel) {
    secretToggle.addEventListener("click", function () {
      var open = secretToggle.getAttribute("aria-expanded") === "true";
      secretToggle.setAttribute("aria-expanded", open ? "false" : "true");
      if (open) {
        secretPanel.setAttribute("hidden", "");
        /* Stop playback when it's folded away again. */
        Array.prototype.slice.call(secretPanel.querySelectorAll("video")).forEach(function (v) {
          if (!v.paused) v.pause();
        });
      } else {
        secretPanel.removeAttribute("hidden");
      }
    });
  }

  /* Scroll reveals now live in js/animations.js (Motion `inView`), which
     replaced the CSS-class observer that used to run here. */
})();
