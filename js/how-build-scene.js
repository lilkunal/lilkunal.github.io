/* Decorative Contra-style side-scroller — How I build section (20% opacity) */
(function () {
  "use strict";

  var canvas = document.querySelector("[data-how-build-scene]");
  if (!canvas) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var W = 320;
  var H = 400;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.scale(dpr, dpr);

  var scroll = 0;
  var frame = 0;
  var raf = null;

  var palette = {
    skyTop: "#1a2744",
    skyBot: "#3d5a80",
    mountFar: "#2d3f5c",
    mountNear: "#1e2d42",
    ground: "#3a3028",
    groundHi: "#4a4030",
    grass: "#2d5a27",
    soldier: "#c45c26",
    soldierDark: "#8b3a12",
    enemy: "#7c3aed",
    bullet: "#fbbf24",
    cloud: "rgba(255,255,255,0.35)",
  };

  function drawSky() {
    var g = ctx.createLinearGradient(0, 0, 0, H * 0.72);
    g.addColorStop(0, palette.skyTop);
    g.addColorStop(1, palette.skyBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawMountains(offset, color, yBase, amp) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (var x = 0; x <= W + 40; x += 20) {
      var nx = (x + offset) * 0.018;
      var y = yBase + Math.sin(nx) * amp + Math.sin(nx * 2.3) * (amp * 0.4);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  function drawClouds(offset) {
    ctx.fillStyle = palette.cloud;
    [0.15, 0.35, 0.55, 0.78].forEach(function (pct, i) {
      var cx = ((pct * W + offset * (0.3 + i * 0.1)) % (W + 80)) - 40;
      var cy = 40 + i * 22;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 28, 10, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 18, cy + 4, 22, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 16, cy + 3, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawGround(offset) {
    var groundY = H - 88;
    ctx.fillStyle = palette.grass;
    ctx.fillRect(0, groundY - 8, W, 10);
    ctx.fillStyle = palette.ground;
    ctx.fillRect(0, groundY + 2, W, H - groundY);

    var tileW = 24;
    for (var x = -tileW; x < W + tileW; x += tileW) {
      var tx = (x - (offset % tileW));
      ctx.fillStyle = palette.groundHi;
      ctx.fillRect(tx, groundY + 6, tileW - 2, 4);
      ctx.fillStyle = palette.ground;
      ctx.fillRect(tx + 2, groundY + 14, 8, 6);
    }
  }

  function drawSoldier(x, y, legFrame) {
    var bob = Math.sin(frame * 0.22) * 2;
    y += bob;

    ctx.fillStyle = palette.soldierDark;
    ctx.fillRect(x + 4, y + 18, 14, 16);

    ctx.fillStyle = palette.soldier;
    ctx.fillRect(x + 2, y + 6, 18, 14);

    ctx.fillStyle = "#f5d0a9";
    ctx.fillRect(x + 6, y - 2, 10, 10);

    ctx.fillStyle = "#1a1814";
    ctx.fillRect(x + 7, y + 1, 3, 2);
    ctx.fillRect(x + 12, y + 1, 3, 2);

    var leg = legFrame % 2 === 0 ? 0 : 4;
    ctx.fillStyle = palette.soldierDark;
    ctx.fillRect(x + 4 + leg, y + 32, 6, 10);
    ctx.fillRect(x + 12 - leg, y + 32, 6, 10);

    ctx.fillStyle = "#4a5568";
    ctx.fillRect(x + 20, y + 10, 22, 4);
    ctx.fillRect(x + 38, y + 8, 4, 8);
  }

  function drawEnemy(x, y) {
    ctx.fillStyle = palette.enemy;
    ctx.fillRect(x, y, 16, 20);
    ctx.fillStyle = "#1a1814";
    ctx.fillRect(x + 3, y + 4, 4, 4);
    ctx.fillRect(x + 9, y + 4, 4, 4);
    ctx.fillRect(x + 5, y + 14, 6, 3);
  }

  function drawBullets(offset) {
    ctx.fillStyle = palette.bullet;
    for (var i = 0; i < 4; i++) {
      var bx = ((frame * 4 + i * 90 + offset * 0.5) % (W + 60)) - 20;
      var by = H - 118 + (i % 2) * 12;
      ctx.fillRect(bx, by, 10, 3);
    }
  }

  function drawStars() {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (var i = 0; i < 18; i++) {
      var sx = (i * 47 + 13) % W;
      var sy = (i * 31 + 7) % 90;
      if (Math.sin(frame * 0.05 + i) > 0) {
        ctx.fillRect(sx, sy, 2, 2);
      }
    }
  }

  function drawCompanionBlob(x, y) {
    var bounce = Math.sin(frame * 0.18) * 3;
    y += bounce;

    ctx.fillStyle = "rgba(90, 138, 154, 0.9)";
    ctx.beginPath();
    ctx.ellipse(x + 14, y + 14, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f4f0ea";
    ctx.beginPath();
    ctx.arc(x + 9, y + 11, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 19, y + 11, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1a1814";
    ctx.fillRect(x + 8, y + 10, 2, 2);
    ctx.fillRect(x + 18, y + 10, 2, 2);

    ctx.strokeStyle = "#f4f0ea";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + 14, y + 17, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();

    var wave = Math.sin(frame * 0.15) * 0.4;
    ctx.fillStyle = palette.bullet;
    ctx.save();
    ctx.translate(x + 26, y + 8);
    ctx.rotate(-0.5 + wave);
    ctx.fillRect(0, 0, 10, 4);
    ctx.restore();
  }

  function render() {
    scroll += reduce ? 0 : 1.8;
    frame += 1;

    drawSky();
    drawStars();
    drawClouds(scroll * 0.4);
    drawMountains(scroll * 0.25, palette.mountFar, H - 160, 28);
    drawMountains(scroll * 0.55, palette.mountNear, H - 120, 18);
    drawGround(scroll);
    drawBullets(scroll);

    var legFrame = Math.floor(frame / 6);
    drawSoldier(52, H - 138, legFrame);
    drawCompanionBlob(18, H - 128);

    var enemyX = W - ((scroll * 1.2) % (W + 80));
    drawEnemy(enemyX, H - 132);

    if (!reduce) raf = requestAnimationFrame(render);
  }

  function onVis() {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else if (!raf && !reduce) {
      raf = requestAnimationFrame(render);
    }
  }

  document.addEventListener("visibilitychange", onVis);

  if (reduce) {
    scroll = 40;
    frame = 12;
    render();
  } else {
    raf = requestAnimationFrame(render);
  }
})();
