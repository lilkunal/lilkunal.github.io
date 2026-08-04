/* Hidden easter egg: click the "Kunal Varshney" wordmark three times quickly.
   A flap-'em-up written from scratch — every repo on that GitHub topic page is
   unlicensed (so default copyright applies) and most ship sprite sheets, which
   we deliberately don't use. Everything here is drawn with canvas paths, so the
   whole game is a few KB, needs no network, and inherits the site's own theme
   tokens — including the light/dark toggle. */
(function () {
  "use strict";

  var TRIGGER_CLICKS = 3;
  var CLICK_WINDOW = 900;        /* ms allowed between clicks */
  var W = 360, H = 620;          /* logical world size; canvas scales to fit */
  var GROUND = 78;
  var PIPE_W = 62;
  var PIPE_GAP = 168;
  var PIPE_SPACING = 210;        /* horizontal distance between pipes */
  var SPEED = 2.0;
  var GRAVITY = 0.42;
  var FLAP = -7.2;
  var PLAYER_X = 96;
  var PLAYER_R = 15;
  var BEST_KEY = "kv-flap-best";
  var MUTE_KEY = "kv-flap-muted";

  var brand = document.querySelector(".nav__brand");
  if (!brand) return;

  var clicks = 0, lastClick = 0, overlay = null, canvas = null, ctx = null;
  var muteBtn = null;
  var raf = null, running = false;

  /* ------------------------------------------------------------------
     Sound — Web Audio, no external files; respects mute toggle
     ------------------------------------------------------------------ */
  var audioCtx = null;
  var muted = false;

  function loadMuted() {
    try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) { muted = false; }
    return muted;
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

  function playTone(freq, dur, type, vol, delay) {
    var ac = getAudio();
    if (!ac) return;
    var t0 = ac.currentTime + (delay || 0);
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol || 0.07, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function sfxFlap() {
    playTone(520, 0.07, "square", 0.05);
    playTone(740, 0.05, "square", 0.035, 0.04);
  }

  function sfxScore() {
    playTone(880, 0.09, "square", 0.06);
    playTone(1175, 0.07, "square", 0.045, 0.07);
  }

  function sfxLose() {
    playTone(240, 0.22, "sawtooth", 0.09);
    playTone(160, 0.28, "sawtooth", 0.07, 0.14);
    playTone(100, 0.35, "sawtooth", 0.05, 0.3);
  }

  function sfxWin() {
    playTone(523, 0.1, "square", 0.06);
    playTone(659, 0.1, "square", 0.06, 0.1);
    playTone(784, 0.1, "square", 0.06, 0.2);
    playTone(988, 0.14, "square", 0.07, 0.3);
  }

  function updateMuteBtn() {
    if (!muteBtn) return;
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
    muteBtn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    muteBtn.textContent = muted ? "🔇" : "🔊";
  }

  function toggleMute() {
    muted = !muted;
    saveMuted();
    updateMuteBtn();
    if (!muted) getAudio();
  }

  loadMuted();

  /* ------------------------------------------------------------------
     Theme — pulled live from the stylesheet so the game always matches
     whatever palette (and light/dark state) the site is currently in.
     ------------------------------------------------------------------ */
  var C = {};
  function readTheme() {
    var cs = getComputedStyle(document.documentElement);
    function v(name, fallback) {
      var got = cs.getPropertyValue(name).trim();
      return got || fallback;
    }
    C.paper = v("--paper", "#f5f7ff");
    C.surface = v("--surface", "#ffffff");
    C.surface2 = v("--surface-2", "#e8ecff");
    C.ink = v("--ink", "#21243d");
    C.inkSoft = v("--ink-soft", "#565a7a");
    C.inkFaint = v("--ink-faint", "#8b8fae");
    C.accent = v("--accent", "#ff6b8b");
    C.accent2 = v("--accent-2", "#4fc3f7");
    C.pixelFont = v("--font-display", '"Syne", system-ui, sans-serif');
  }

  /* Stepped corners, matching the --pixel-corner clip-path used site-wide. */
  function pixelRect(g, x, y, w, h, s) {
    g.beginPath();
    g.moveTo(x, y + s);
    g.lineTo(x + s, y + s);
    g.lineTo(x + s, y);
    g.lineTo(x + w - s, y);
    g.lineTo(x + w - s, y + s);
    g.lineTo(x + w, y + s);
    g.lineTo(x + w, y + h - s);
    g.lineTo(x + w - s, y + h - s);
    g.lineTo(x + w - s, y + h);
    g.lineTo(x + s, y + h);
    g.lineTo(x + s, y + h - s);
    g.lineTo(x, y + h - s);
    g.closePath();
  }

  function star(g, cx, cy, r) {
    g.beginPath();
    g.moveTo(cx, cy - r);
    g.lineTo(cx + r * 0.3, cy - r * 0.3);
    g.lineTo(cx + r, cy);
    g.lineTo(cx + r * 0.3, cy + r * 0.3);
    g.lineTo(cx, cy + r);
    g.lineTo(cx - r * 0.3, cy + r * 0.3);
    g.lineTo(cx - r, cy);
    g.lineTo(cx - r * 0.3, cy - r * 0.3);
    g.closePath();
  }

  /* ------------------------------------------------------------------
     State
     ------------------------------------------------------------------ */
  var S = null;
  function reset() {
    S = {
      mode: "ready",           /* ready | playing | dead */
      y: H / 2 - 60,
      vy: 0,
      rot: 0,
      pipes: [],
      score: 0,
      best: 0,
      t: 0,
      shake: 0,
      webT: 0,                 /* countdown for the web-strand flourish */
      motes: [],
      sky: []
    };
    try { S.best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { S.best = 0; }
    var i;
    for (i = 0; i < 16; i++) {
      S.motes.push({ x: Math.random() * W, y: Math.random() * (H - GROUND), r: 2 + Math.random() * 3, sp: 0.15 + Math.random() * 0.35, ph: Math.random() * 6.28 });
    }
    for (i = 0; i < 14; i++) {
      S.sky.push({ x: i * 34 + Math.random() * 10, w: 20 + Math.random() * 16, h: 40 + Math.random() * 90 });
    }
    /* Stagger the first pipes so there's a moment of runway. */
    for (i = 0; i < 3; i++) addPipe(W + 140 + i * PIPE_SPACING);
  }

  function addPipe(x) {
    var margin = 70;
    var playable = H - GROUND - margin * 2 - PIPE_GAP;
    S.pipes.push({ x: x, gapY: margin + Math.random() * Math.max(20, playable), scored: false });
  }

  function flap() {
    if (S.mode === "ready") { S.mode = "playing"; sfxFlap(); return; }
    if (S.mode === "playing") { S.vy = FLAP; S.webT = 10; sfxFlap(); }
    else if (S.mode === "dead" && S.t > 40) { reset(); S.mode = "playing"; S.vy = FLAP; sfxFlap(); }
  }

  function die() {
    if (S.mode !== "playing") return;
    S.mode = "dead";
    S.t = 0;
    S.shake = 12;
    var wasBest = S.score > S.best;
    if (wasBest) {
      S.best = S.score;
      try { localStorage.setItem(BEST_KEY, String(S.best)); } catch (e) {}
    }
    sfxLose();
    if (wasBest && S.score > 0) sfxWin();
  }

  /* One simulation step. Kept separate from rendering so the physics can be
     exercised without a live animation frame. */
  function step() {
    S.t++;
    if (S.shake > 0) S.shake--;
    if (S.webT > 0) S.webT--;

    var i, p;
    for (i = 0; i < S.motes.length; i++) {
      var m = S.motes[i];
      m.x -= m.sp;
      if (m.x < -6) { m.x = W + 6; m.y = Math.random() * (H - GROUND); }
    }

    if (S.mode === "ready") {
      S.y = H / 2 - 60 + Math.sin(S.t / 18) * 8;
      return;
    }
    if (S.mode === "dead") {
      /* Fall to the floor and stay there. */
      S.vy += GRAVITY;
      S.y += S.vy;
      if (S.y > H - GROUND - PLAYER_R) { S.y = H - GROUND - PLAYER_R; S.vy = 0; }
      S.rot = Math.min(1.5, S.rot + 0.08);
      return;
    }

    S.vy += GRAVITY;
    S.y += S.vy;
    S.rot = Math.max(-0.5, Math.min(1.4, S.vy / 11));

    for (i = 0; i < S.pipes.length; i++) {
      p = S.pipes[i];
      p.x -= SPEED;
      if (!p.scored && p.x + PIPE_W < PLAYER_X - PLAYER_R) {
        p.scored = true;
        S.score++;
        sfxScore();
      }
    }
    while (S.pipes.length && S.pipes[0].x < -PIPE_W - 10) S.pipes.shift();
    var lastX = S.pipes.length ? S.pipes[S.pipes.length - 1].x : 0;
    if (lastX < W - PIPE_SPACING) addPipe(lastX + PIPE_SPACING);

    /* Ceiling and floor */
    if (S.y < PLAYER_R) { S.y = PLAYER_R; S.vy = 0; }
    if (S.y > H - GROUND - PLAYER_R) { S.y = H - GROUND - PLAYER_R; die(); return; }

    /* Pipe collision — circle against the two rectangles. */
    for (i = 0; i < S.pipes.length; i++) {
      p = S.pipes[i];
      if (PLAYER_X + PLAYER_R < p.x || PLAYER_X - PLAYER_R > p.x + PIPE_W) continue;
      if (S.y - PLAYER_R < p.gapY || S.y + PLAYER_R > p.gapY + PIPE_GAP) { die(); return; }
    }
  }

  /* ------------------------------------------------------------------
     Drawing
     ------------------------------------------------------------------ */
  function drawHero(g, x, y, rot) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);

    /* Web strand, thrown as it flaps */
    if (S.webT > 0) {
      g.strokeStyle = C.inkFaint;
      g.lineWidth = 1.5;
      g.globalAlpha = S.webT / 10;
      g.beginPath();
      g.moveTo(PLAYER_R - 2, -4);
      g.lineTo(PLAYER_R + 26, -30);
      g.stroke();
      g.globalAlpha = 1;
    }

    /* Suit: the site's pink over sky-blue rather than any trademarked design */
    g.fillStyle = C.accent2;
    g.beginPath(); g.arc(0, 0, PLAYER_R, 0, 6.2832); g.fill();
    g.fillStyle = C.accent;
    g.beginPath(); g.arc(0, 0, PLAYER_R, Math.PI, 0); g.fill();

    /* Web lines across the mask */
    g.strokeStyle = C.ink;
    g.lineWidth = 1;
    g.globalAlpha = 0.5;
    var a;
    for (a = 0; a < 5; a++) {
      var ang = -Math.PI + (a / 4) * Math.PI;
      g.beginPath(); g.moveTo(0, 0);
      g.lineTo(Math.cos(ang) * PLAYER_R, Math.sin(ang) * PLAYER_R);
      g.stroke();
    }
    g.beginPath(); g.arc(0, 0, PLAYER_R * 0.6, Math.PI, 0); g.stroke();
    g.globalAlpha = 1;

    /* The big lenses — what actually sells it as a masked hero */
    g.fillStyle = "#ffffff";
    g.strokeStyle = C.ink;
    g.lineWidth = 1.5;
    [[-5.5, -2.5], [5.5, -2.5]].forEach(function (e, idx) {
      g.save();
      g.translate(e[0], e[1]);
      g.rotate(idx === 0 ? -0.35 : 0.35);
      g.beginPath();
      g.ellipse(0, 0, 5.2, 3.6, 0, 0, 6.2832);
      g.fill();
      g.stroke();
      g.restore();
    });

    g.strokeStyle = C.ink;
    g.lineWidth = 2;
    g.beginPath(); g.arc(0, 0, PLAYER_R, 0, 6.2832); g.stroke();
    g.restore();
  }

  function draw() {
    var g = ctx;
    g.save();
    if (S.shake > 0) g.translate((Math.random() - 0.5) * S.shake, (Math.random() - 0.5) * S.shake);

    g.fillStyle = C.paper;
    g.fillRect(-20, -20, W + 40, H + 40);

    /* Parallax skyline */
    g.fillStyle = C.surface2;
    for (var i = 0; i < S.sky.length; i++) {
      var b = S.sky[i];
      var bx = ((b.x - S.t * 0.25) % (W + 60) + W + 60) % (W + 60) - 30;
      g.fillRect(bx, H - GROUND - b.h, b.w, b.h);
    }

    /* Drifting sparkles, same motif as the hero's dust motes */
    for (i = 0; i < S.motes.length; i++) {
      var m = S.motes[i];
      g.fillStyle = i % 3 === 0 ? C.accent2 : C.accent;
      g.globalAlpha = 0.35 + Math.sin(S.t / 20 + m.ph) * 0.3;
      star(g, m.x, m.y, m.r);
      g.fill();
    }
    g.globalAlpha = 1;

    /* Towers */
    for (i = 0; i < S.pipes.length; i++) {
      var p = S.pipes[i];
      g.fillStyle = C.surface;
      g.strokeStyle = C.ink;
      g.lineWidth = 3;

      pixelRect(g, p.x, -40, PIPE_W, p.gapY + 40, 6); g.fill(); g.stroke();
      var by = p.gapY + PIPE_GAP;
      pixelRect(g, p.x, by, PIPE_W, H - GROUND - by + 10, 6); g.fill(); g.stroke();

      g.fillStyle = C.accent;
      g.fillRect(p.x + 6, p.gapY - 14, PIPE_W - 12, 8);
      g.fillStyle = C.accent2;
      g.fillRect(p.x + 6, by + 6, PIPE_W - 12, 8);
    }

    /* Ground */
    g.fillStyle = C.ink;
    g.fillRect(0, H - GROUND, W, GROUND);
    g.fillStyle = C.accent;
    for (i = 0; i < Math.ceil(W / 22) + 1; i++) {
      var gx = ((i * 22 - S.t * SPEED) % (W + 22) + W + 22) % (W + 22) - 22;
      g.fillRect(gx, H - GROUND, 11, 4);
    }

    drawHero(g, PLAYER_X, S.y, S.rot);

    /* Live scoreboard — Kunal is always exactly one ahead */
    if (S.mode === "playing" || S.mode === "ready") {
      drawLiveScore(g);
    } else {
      g.fillStyle = C.ink;
      g.font = "20px " + C.pixelFont;
      g.textAlign = "center";
      g.fillText(String(S.score), W / 2, 52);
    }

    if (S.mode === "ready") panel(g, "TAP TO SWING", ["Click, tap or press space", "Mind the towers"]);
    else if (S.mode === "dead") deathPanel(g);

    g.restore();
  }

  function drawLiveScore(g) {
    var rowL = 22, rowR = W - 22, kunalScore = S.score + 1;

    g.font = "8px " + C.pixelFont;

    g.fillStyle = C.accent2;
    g.globalAlpha = 0.35;
    g.fillRect(14, 24, W - 28, 22);
    g.globalAlpha = 1;

    g.textAlign = "left";
    g.fillStyle = C.ink;
    g.fillText("KUNAL", rowL, 40);
    g.textAlign = "right";
    g.fillText(String(kunalScore), rowR, 40);

    g.textAlign = "left";
    g.fillStyle = C.inkSoft;
    g.fillText("YOU", rowL, 58);
    g.textAlign = "right";
    g.fillText(String(S.score), rowR, 58);
  }

  /* However well you do, the leaderboard has other ideas. */
  function funnyLine(n) {
    if (n === 0) return "GRAVITY 1 - YOU 0";
    if (n <= 2) return "TWO WALLS. TRAGIC.";
    if (n <= 5) return "ALMOST COMPETENT.";
    if (n <= 9) return "NOT BAD. NOT ENOUGH.";
    if (n <= 19) return "OK, YOU CAN ACTUALLY PLAY";
    if (n <= 39) return "SHOW-OFF.";
    return "ARE YOU CHEATING?";
  }

  function deathPanel(g) {
    var bw = 292, bh = 186, bx = (W - bw) / 2, by = H / 2 - 140;
    g.fillStyle = C.surface;
    g.strokeStyle = C.ink;
    g.lineWidth = 3;
    pixelRect(g, bx, by, bw, bh, 8);
    g.fill(); g.stroke();

    g.textAlign = "center";
    g.fillStyle = C.accent;
    g.font = "15px " + C.pixelFont;
    g.fillText("SPLAT", W / 2, by + 34);

    g.fillStyle = C.inkSoft;
    g.font = "7px " + C.pixelFont;
    g.fillText(funnyLine(S.score), W / 2, by + 58);

    /* Leaderboard. Kunal always finishes exactly one ahead. */
    var rowL = bx + 18, rowR = bx + bw - 18, y1 = by + 92, y2 = by + 116;

    g.fillStyle = C.accent2;
    g.fillRect(bx + 12, y1 - 13, bw - 24, 20);

    g.font = "8px " + C.pixelFont;
    g.textAlign = "left";
    g.fillStyle = C.ink;
    g.fillText("KUNAL", rowL, y1);
    g.textAlign = "right";
    g.fillText(String(S.score + 1), rowR, y1);

    g.textAlign = "left";
    g.fillStyle = C.inkSoft;
    g.fillText("YOU", rowL, y2);
    g.textAlign = "right";
    g.fillText(String(S.score), rowR, y2);

    g.textAlign = "center";
    g.fillStyle = C.inkFaint;
    g.font = "7px " + C.pixelFont;
    g.fillText("YOUR BEST " + S.best, W / 2, by + 145);
    if (S.t > 40) g.fillText("TAP TO TRY AGAIN", W / 2, by + 166);
  }

  function panel(g, title, lines) {
    var bw = 268, bh = 118, bx = (W - bw) / 2, by = H / 2 - 110;
    g.fillStyle = C.surface;
    g.strokeStyle = C.ink;
    g.lineWidth = 3;
    pixelRect(g, bx, by, bw, bh, 8);
    g.fill(); g.stroke();

    g.textAlign = "center";
    g.fillStyle = C.accent;
    g.font = "15px " + C.pixelFont;
    g.fillText(title, W / 2, by + 38);

    g.fillStyle = C.inkSoft;
    g.font = "8px " + C.pixelFont;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i]) g.fillText(lines[i], W / 2, by + 66 + i * 18);
    }
  }

  /* ------------------------------------------------------------------
     Loop
     ------------------------------------------------------------------ */
  function frame() {
    if (!running) return;
    step();
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    readTheme();
    frame();
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  /* ------------------------------------------------------------------
     Overlay — built on first launch so it costs nothing until used
     ------------------------------------------------------------------ */
  function build() {
    overlay = document.createElement("div");
    overlay.className = "kvgame";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Hidden mini-game");
    overlay.innerHTML =
      '<div class="kvgame__box">' +
        '<div class="kvgame__bar">' +
          '<span class="kvgame__title">Kunal’s little secret</span>' +
          '<div class="kvgame__actions">' +
            '<button type="button" class="kvgame__mute" aria-label="Mute sound" aria-pressed="false">🔊</button>' +
            '<button type="button" class="kvgame__close" aria-label="Close game">✕</button>' +
          '</div>' +
        '</div>' +
        '<canvas class="kvgame__canvas" width="' + W + '" height="' + H + '" aria-label="Mini-game canvas"></canvas>' +
        '<p class="kvgame__hint">Space / click to swing · Esc to close · Kunal is always +1</p>' +
      '</div>';
    document.body.appendChild(overlay);

    canvas = overlay.querySelector(".kvgame__canvas");
    ctx = canvas.getContext("2d");
    muteBtn = overlay.querySelector(".kvgame__mute");
    updateMuteBtn();

    /* Sharpen on high-density screens without changing world coordinates. */
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    overlay.querySelector(".kvgame__close").addEventListener("click", close);
    if (muteBtn) muteBtn.addEventListener("click", function (e) { e.stopPropagation(); toggleMute(); });
    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay) { close(); return; }
      if (e.target === canvas) { e.preventDefault(); flap(); }
    });
    canvas.addEventListener("touchstart", function (e) { e.preventDefault(); flap(); }, { passive: false });

    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (overlay && !overlay.hasAttribute("hidden")) start();
    });
    /* Follow the site's own light/dark toggle while the game is open. */
    var themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", function () { setTimeout(readTheme, 30); });
  }

  function onKey(e) {
    if (!overlay || overlay.hasAttribute("hidden")) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key === " " || e.key === "ArrowUp" || e.key === "Spacebar") { e.preventDefault(); flap(); }
  }

  function open() {
    if (!overlay) build();
    overlay.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    reset();
    readTheme();
    updateMuteBtn();
    getAudio();
    start();
    var c = overlay.querySelector(".kvgame__close");
    if (c) c.focus();
  }

  function close() {
    stop();
    if (overlay) overlay.setAttribute("hidden", "");
    document.body.style.overflow = "";
    if (brand) brand.focus();
  }

  /* ------------------------------------------------------------------
     Trigger: three quick clicks on the wordmark
     ------------------------------------------------------------------ */
  brand.addEventListener("click", function (e) {
    var now = Date.now();
    clicks = (now - lastClick < CLICK_WINDOW) ? clicks + 1 : 1;
    lastClick = now;
    if (clicks >= TRIGGER_CLICKS) {
      clicks = 0;
      e.preventDefault();
      open();
    }
  });

  /* The footer hint opens it directly. Triple-clicking a nav link is fiddly on
     a phone, and a hint you can't act on is just a tease. */
  var egg = document.getElementById("footer-egg");
  if (egg) egg.addEventListener("click", open);

  /* Exposed purely so the physics and rendering can be verified without a live
     animation frame (headless checks drive step/draw directly). */
  window.__kvGame = {
    open: open, close: close, flap: flap, step: step, draw: draw,
    theme: function () { return C; },
    state: function () { return S; },
    reset: reset,
    toggleMute: toggleMute,
    isMuted: function () { return muted; },
    consts: { W: W, H: H, GROUND: GROUND, PIPE_W: PIPE_W, PIPE_GAP: PIPE_GAP, PLAYER_X: PLAYER_X, PLAYER_R: PLAYER_R }
  };
})();
