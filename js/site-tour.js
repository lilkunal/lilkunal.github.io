/* 60-second guided site tour — free alternative to a Loom until you record one */
(function () {
  "use strict";

  var btn = document.querySelector("[data-site-tour-start]");
  var stopBtn = document.querySelector("[data-site-tour-stop]");
  var bar = document.querySelector("[data-site-tour-bar]");
  var status = document.querySelector("[data-site-tour-status]");
  if (!btn) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var stops = [
    { id: "top", label: "Hero — who I am & live proof links", ms: 8000 },
    { id: "how-i-build", label: "How I build with AI — Claude + Cursor, human QA", ms: 8000 },
    { id: "work", label: "Client work + Padma case study", ms: 9000 },
    { id: "proof", label: "Metrics & testimonials — real outcomes", ms: 7000 },
    { id: "experience", label: "Background timeline — full career context", ms: 8000 },
    { id: "contact", label: "Contact — WhatsApp, email, résumé download", ms: 7000 }
  ];

  var running = false;
  var timer = null;
  var idx = 0;
  var startedAt = 0;
  var totalMs = stops.reduce(function (s, x) { return s + x.ms; }, 0);

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function setProgress(p) {
    if (bar) bar.style.width = Math.min(100, Math.max(0, p * 100)).toFixed(1) + "%";
  }

  function scrollToId(id) {
    var el = id === "top" ? document.querySelector(".hero--milo") : document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function stopTour() {
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    btn.hidden = false;
    if (stopBtn) stopBtn.hidden = true;
    setStatus("");
    setProgress(0);
  }

  function nextStop() {
    if (!running || idx >= stops.length) {
      setProgress(1);
      setStatus("Tour complete — reach out anytime.");
      stopTour();
      return;
    }

    var stop = stops[idx];
    scrollToId(stop.id);
    setStatus("Stop " + (idx + 1) + "/" + stops.length + ": " + stop.label);

    var elapsed = Date.now() - startedAt;
    setProgress(elapsed / totalMs);

    idx += 1;
    timer = setTimeout(nextStop, stop.ms);
  }

  btn.addEventListener("click", function () {
    if (running) return;
    running = true;
    idx = 0;
    startedAt = Date.now();
    btn.hidden = true;
    if (stopBtn) stopBtn.hidden = false;
    setStatus("Starting tour…");
    nextStop();
  });

  if (stopBtn) {
    stopBtn.hidden = true;
    stopBtn.addEventListener("click", stopTour);
  }
})();
