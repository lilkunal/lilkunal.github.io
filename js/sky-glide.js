/* Sky Glide — Sky Peck-inspired browser flyer for the portfolio.
   Spread wings (Space / hold click / webcam arms) to glide through a painted sky.
   Physics + canvas only; optional body control via KVPose (MediaPipe). */
(function () {
  "use strict";

  var W = 420;
  var H = 640;
  var BEST_KEY = "kv-sky-best";
  var MUTE_KEY = "kv-sky-muted";

  var overlay = null;
  var canvas = null;
  var ctx = null;
  var preview = null;
  var camBtn = null;
  var muteBtn = null;
  var hintEl = null;
  var raf = null;
  var running = false;
  var camOn = false;
  var muted = false;
  var audioCtx = null;
  var C = {};
  var S = null;

  function loadMuted() {
    try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) { muted = false; }
  }
  function saveMuted() {
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
  }
  function getAudio() {
    if (muted) return null;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function playTone(freq, dur, vol) {
    var ac = getAudio();
    if (!ac) return;
    var t0 = ac.currentTime;
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.05, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function readTheme() {
    var cs = getComputedStyle(document.documentElement);
    function v(n, fb) { var x = cs.getPropertyValue(n).trim(); return x || fb; }
    C.paper = v("--paper", "#0f1220");
    C.ink = v("--ink", "#f0f2ff");
    C.accent = v("--accent", "#ff6b8b");
    C.accent2 = v("--accent-2", "#60a5fa");
    C.skyTop = v("--accent-2", "#4fc3f7");
    C.skyBot = v("--paper", "#1a1f35");
  }

  function reset() {
    S = {
      mode: "ready",
      x: 90,
      y: H * 0.45,
      vx: 2.4,
      vy: 0,
      angle: -0.15,
      wing: 0.35,
      targetPitch: -0.15,
      world: 0,
      score: 0,
      best: 0,
      t: 0,
      clouds: [],
      hills: [],
      rings: [],
      stars: []
    };
    try { S.best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { S.best = 0; }
    var i;
    for (i = 0; i < 8; i++) {
      S.hills.push({ layer: i % 3, x: i * 180, h: 80 + Math.random() * 120, hue: 200 + i * 12 });
    }
    for (i = 0; i < 12; i++) {
      S.clouds.push({
        x: Math.random() * W * 2,
        y: 40 + Math.random() * (H * 0.55),
        s: 0.6 + Math.random() * 1.2,
        sp: 0.25 + Math.random() * 0.5
      });
    }
    for (i = 0; i < 6; i++) addRing(W + 200 + i * 260);
    for (i = 0; i < 20; i++) {
      S.stars.push({ x: Math.random() * W, y: Math.random() * H * 0.5, r: 0.5 + Math.random() * 1.5, ph: Math.random() * 6.28 });
    }
  }

  function addRing(x) {
    S.rings.push({
      x: x,
      y: 120 + Math.random() * (H - 280),
      r: 28,
      got: false
    });
  }

  var pointer = { x: W * 0.5, y: H * 0.4, down: false };

  function inputPitch() {
    if (camOn && window.KVPose && KVPose.isActive()) {
      var p = KVPose.read();
      if (p.ok) return p.pitch * 0.85;
    }
    return ((pointer.y / H) - 0.45) * -1.8;
  }

  function inputWing() {
    var w = pointer.down ? 1 : 0.35;
    if (camOn && window.KVPose && KVPose.isActive()) {
      var p = KVPose.read();
      if (p.ok) w = Math.max(w, p.wing);
    }
    return w;
  }

  function step() {
    S.t++;
    if (S.mode === "ready") {
      S.y = H * 0.45 + Math.sin(S.t / 22) * 10;
      S.angle = -0.12 + Math.sin(S.t / 30) * 0.05;
      return;
    }
    if (S.mode === "dead") {
      S.vy += 0.18;
      S.y += S.vy;
      S.angle = Math.min(1.2, S.angle + 0.04);
      return;
    }

    S.wing = S.wing * 0.82 + inputWing() * 0.18;
    S.targetPitch = inputPitch();
    S.angle = S.angle * 0.9 + S.targetPitch * 0.1;

    var lift = S.wing * 0.22;
    var gravity = 0.11 * (1 - S.wing * 0.65);
    S.vx = 2.2 + S.wing * 1.6;
    S.vy += gravity - lift;
    S.vy *= 0.985;
    S.y += S.vy;
    S.world += S.vx;

    if (S.y < 36) { S.y = 36; S.vy = Math.max(S.vy, 0); }
    if (S.y > H - 48) { die(); return; }

    var i, c, h, r;
    for (i = 0; i < S.clouds.length; i++) {
      c = S.clouds[i];
      c.x -= c.sp * (1 + S.wing * 0.3);
      if (c.x < -80) { c.x = W + 60; c.y = 40 + Math.random() * (H * 0.55); }
    }
    for (i = 0; i < S.hills.length; i++) {
      h = S.hills[i];
      h.x -= 0.4 + h.layer * 0.35;
      if (h.x < -220) h.x += S.hills.length * 60;
    }

    S.score = Math.floor(S.world / 40);
    if (S.score > S.best) {
      S.best = S.score;
      try { localStorage.setItem(BEST_KEY, String(S.best)); } catch (e) {}
    }

    for (i = 0; i < S.rings.length; i++) {
      r = S.rings[i];
      r.x -= S.vx;
      if (!r.got && Math.abs(r.x - S.x) < 34 && Math.abs(r.y - S.y) < 34) {
        r.got = true;
        playTone(660, 0.12, 0.06);
        playTone(880, 0.1, 0.05);
      }
    }
    while (S.rings.length && S.rings[0].x < -40) S.rings.shift();
    var last = S.rings.length ? S.rings[S.rings.length - 1].x : 0;
    if (last < W + 100) addRing(S.world + W + 180 + Math.random() * 120);
  }

  function die() {
    if (S.mode !== "playing") return;
    S.mode = "dead";
    playTone(180, 0.3, 0.07);
    if (camOn) stopCam();
  }

  function startFly() {
    if (S.mode === "ready" || S.mode === "dead") {
      S.mode = "playing";
      S.vy = -0.5;
      playTone(440, 0.08, 0.05);
    }
  }

  function drawCloud(g, x, y, s) {
    g.save();
    g.globalAlpha = 0.35;
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(x, y, 22 * s, 0, 6.28);
    g.arc(x + 18 * s, y - 8 * s, 18 * s, 0, 6.28);
    g.arc(x + 36 * s, y, 20 * s, 0, 6.28);
    g.fill();
    g.restore();
  }

  function drawHills(g) {
    var i, h, base = H - 40;
    for (i = 0; i < S.hills.length; i++) {
      h = S.hills[i];
      g.fillStyle = "hsla(" + h.hue + ", 45%, " + (28 + h.layer * 8) + "%, 0.85)";
      g.beginPath();
      g.moveTo(h.x - 100, base);
      g.quadraticCurveTo(h.x, base - h.h, h.x + 100, base);
      g.fill();
    }
  }

  function drawBird(g, x, y, ang, wing) {
    g.save();
    g.translate(x, y);
    g.rotate(ang);
    var span = 18 + wing * 22;
    g.fillStyle = C.accent;
    g.strokeStyle = C.ink;
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(10, 0);
    g.quadraticCurveTo(-6, -span * 0.5, -14, -span);
    g.quadraticCurveTo(-4, -4, -10, 0);
    g.quadraticCurveTo(-4, 4, -14, span);
    g.quadraticCurveTo(-6, span * 0.5, 10, 0);
    g.fill();
    g.stroke();
    g.fillStyle = C.ink;
    g.beginPath();
    g.arc(4, -3, 2.5, 0, 6.28);
    g.fill();
    g.restore();
  }

  function draw() {
    if (!ctx || !S) return;
    readTheme();
    var g = ctx;
    var grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, C.skyTop);
    grad.addColorStop(1, C.skyBot);
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    var i;
    for (i = 0; i < S.stars.length; i++) {
      var st = S.stars[i];
      g.globalAlpha = 0.35 + Math.sin(S.t / 40 + st.ph) * 0.25;
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(st.x, st.y, st.r, 0, 6.28);
      g.fill();
    }
    g.globalAlpha = 1;

    for (i = 0; i < S.clouds.length; i++) drawCloud(g, S.clouds[i].x, S.clouds[i].y, S.clouds[i].s);
    drawHills(g);

    for (i = 0; i < S.rings.length; i++) {
      var r = S.rings[i];
      g.strokeStyle = r.got ? "rgba(255,255,255,0.15)" : C.accent2;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(r.x, r.y, r.r, 0, 6.28);
      g.stroke();
    }

    drawBird(g, S.x, S.y, S.angle, S.wing);

    g.fillStyle = C.ink;
    g.font = '600 14px "Space Grotesk", system-ui, sans-serif';
    g.fillText("Distance " + S.score + " m", 14, 26);
    g.fillText("Best " + S.best, 14, 46);

    if (S.mode === "ready") {
      g.fillStyle = "rgba(255,255,255,0.92)";
      g.font = '700 18px "Space Grotesk", system-ui, sans-serif';
      g.fillText("Spread wings to fly", W / 2 - 98, H / 2 - 10);
      g.font = '500 12px "DM Sans", system-ui, sans-serif';
      g.fillText("Space / hold click · or enable webcam", W / 2 - 108, H / 2 + 14);
    }
    if (S.mode === "dead") {
      g.fillStyle = "rgba(255,255,255,0.92)";
      g.font = '700 20px "Space Grotesk", system-ui, sans-serif';
      g.fillText("Stalled — tap to retry", W / 2 - 88, H / 2);
    }
  }

  function frame() {
    if (!running) return;
    step();
    draw();
    raf = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (running) return;
    running = true;
    frame();
  }
  function stopLoop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function toggleCam() {
    if (!window.KVPose) return;
    if (camOn) {
      stopCam();
      return;
    }
    camBtn.disabled = true;
    camBtn.textContent = "Starting…";
    KVPose.start(preview)
      .then(function () {
        camOn = true;
        camBtn.textContent = "Webcam on";
        camBtn.setAttribute("aria-pressed", "true");
        if (hintEl) hintEl.textContent = "Arms wide = lift · lean / nose = pitch · Esc to close";
      })
      .catch(function () {
        camBtn.textContent = "Webcam off";
        alert("Camera access failed. Use mouse + Space instead.");
      })
      .finally(function () { camBtn.disabled = false; });
  }

  function stopCam() {
    camOn = false;
    if (window.KVPose) KVPose.stop(preview);
    if (camBtn) {
      camBtn.textContent = "Webcam off";
      camBtn.setAttribute("aria-pressed", "false");
    }
  }

  function build() {
    overlay = document.createElement("div");
    overlay.className = "kvgame kvgame--sky";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Sky Glide mini-game");
    overlay.innerHTML =
      '<div class="kvgame__box">' +
        '<div class="kvgame__bar">' +
          '<span class="kvgame__title">Sky Glide · fly like a bird</span>' +
          '<div class="kvgame__actions">' +
            '<button type="button" class="kvgame__cam" aria-pressed="false">Webcam off</button>' +
            '<button type="button" class="kvgame__mute" aria-pressed="false">🔊</button>' +
            '<button type="button" class="kvgame__close" aria-label="Close game">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="kvgame__stage">' +
          '<canvas class="kvgame__canvas" width="' + W + '" height="' + H + '"></canvas>' +
          '<video class="kvgame__cam-preview" playsinline muted hidden aria-hidden="true"></video>' +
        '</div>' +
        '<p class="kvgame__hint">Space / hold click = wings · move mouse = pitch · fly through blue rings</p>' +
      '</div>';
    document.body.appendChild(overlay);

    canvas = overlay.querySelector(".kvgame__canvas");
    ctx = canvas.getContext("2d");
    preview = overlay.querySelector(".kvgame__cam-preview");
    camBtn = overlay.querySelector(".kvgame__cam");
    muteBtn = overlay.querySelector(".kvgame__mute");
    hintEl = overlay.querySelector(".kvgame__hint");

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    overlay.querySelector(".kvgame__close").addEventListener("click", close);
    muteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      muted = !muted;
      saveMuted();
      muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
      muteBtn.textContent = muted ? "🔇" : "🔊";
    });
    camBtn.addEventListener("click", function (e) { e.stopPropagation(); toggleCam(); });

    canvas.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * W;
      pointer.y = ((e.clientY - rect.top) / rect.height) * H;
    });
    canvas.addEventListener("mousedown", function (e) { e.preventDefault(); pointer.down = true; startFly(); });
    canvas.addEventListener("mouseup", function () { pointer.down = false; });
    canvas.addEventListener("touchstart", function (e) {
      e.preventDefault();
      pointer.down = true;
      var t = e.touches[0];
      var rect = canvas.getBoundingClientRect();
      pointer.x = ((t.clientX - rect.left) / rect.width) * W;
      pointer.y = ((t.clientY - rect.top) / rect.height) * H;
      startFly();
    }, { passive: false });
    canvas.addEventListener("touchend", function () { pointer.down = false; });

    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopLoop();
      else if (overlay && !overlay.hasAttribute("hidden")) startLoop();
    });
  }

  function onKey(e) {
    if (!overlay || overlay.hasAttribute("hidden")) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
      pointer.down = true;
      startFly();
    }
  }
  function onKeyUp(e) {
    if (e.key === " " || e.key === "ArrowUp") pointer.down = false;
  }
  document.addEventListener("keyup", onKeyUp);

  function open() {
    if (!overlay) build();
    loadMuted();
    overlay.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    reset();
    readTheme();
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
    muteBtn.textContent = muted ? "🔇" : "🔊";
    getAudio();
    startLoop();
  }

  function close() {
    stopLoop();
    stopCam();
    if (overlay) overlay.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  window.KVSkyGlide = { open: open, close: close, step: step, draw: draw, state: function () { return S; } };
})();
