/**
 * Subtle Three.js hero background — low-poly floating shapes.
 * Progressive enhancement: page works if this module or Three.js fails.
 */
import * as THREE from "three";

(function initHeroAccent() {
  "use strict";

  var container = document.querySelector("[data-three-hero]");
  if (!container) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isRunning = false;
  var rafId = null;
  var renderer = null;
  var scene = null;
  var camera = null;
  var shapes = [];
  var clock = new THREE.Clock();

  function readCssVar(name, fallback) {
    var value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function themeColors() {
    return {
      accent: readCssVar("--accent", "#d4a853"),
      accent2: readCssVar("--accent-2", "#e8a598"),
      paper: readCssVar("--paper", "#050505"),
    };
  }

  function makeShape(kind, color, scale, position) {
    var geometry;
    if (kind === "ico") geometry = new THREE.IcosahedronGeometry(scale, 0);
    else if (kind === "oct") geometry = new THREE.OctahedronGeometry(scale, 0);
    else geometry = new THREE.TetrahedronGeometry(scale, 0);

    var material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.userData.spin = {
      x: (Math.random() - 0.5) * 0.35,
      y: (Math.random() - 0.5) * 0.45,
      z: (Math.random() - 0.5) * 0.25,
    };
    mesh.userData.drift = {
      x: (Math.random() - 0.5) * 0.08,
      y: (Math.random() - 0.5) * 0.06,
      phase: Math.random() * Math.PI * 2,
    };
    return mesh;
  }

  function buildScene() {
    var colors = themeColors();
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(new THREE.Color(colors.paper), 0.045);

    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 0, 9);

    var palette = [colors.accent, colors.accent2, colors.accent];
    var kinds = ["ico", "oct", "tet", "ico", "oct", "tet", "ico"];
    var positions = [
      [-3.2, 1.4, -2],
      [3.4, 0.6, -1.5],
      [-2.1, -1.8, -2.5],
      [2.6, -1.2, -3],
      [0.4, 2.2, -4],
      [-0.8, -2.4, -2.2],
      [1.2, 0.2, -1.8],
    ];

    shapes = kinds.map(function (kind, i) {
      var mesh = makeShape(kind, palette[i % palette.length], 0.55 + (i % 3) * 0.18, positions[i]);
      scene.add(mesh);
      return mesh;
    });

    /* Soft particle field — very light */
    var particleCount = 48;
    var positionsArr = new Float32Array(particleCount * 3);
    for (var p = 0; p < particleCount; p += 1) {
      positionsArr[p * 3] = (Math.random() - 0.5) * 14;
      positionsArr[p * 3 + 1] = (Math.random() - 0.5) * 8;
      positionsArr[p * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    var particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positionsArr, 3));
    var particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(colors.accent),
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    });
    var particles = new THREE.Points(particleGeo, particleMat);
    particles.userData.isParticles = true;
    scene.add(particles);
    shapes.push(particles);
  }

  function applyTheme() {
    if (!scene) return;
    var colors = themeColors();
    scene.fog.color.set(colors.paper);
    shapes.forEach(function (obj, i) {
      if (obj.userData.isParticles) {
        obj.material.color.set(colors.accent);
        return;
      }
      obj.material.color.set(i % 2 === 0 ? colors.accent : colors.accent2);
    });
  }

  function resize() {
    if (!renderer || !camera) return;
    var w = container.clientWidth || window.innerWidth;
    var h = container.clientHeight || window.innerHeight;
    if (w < 1 || h < 1) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function tick() {
    if (!isRunning) return;
    var elapsed = clock.getElapsedTime();

    shapes.forEach(function (obj) {
      if (obj.userData.isParticles) return;
      var spin = obj.userData.spin;
      var drift = obj.userData.drift;
      if (!reduceMotion) {
        obj.rotation.x += spin.x * 0.012;
        obj.rotation.y += spin.y * 0.012;
        obj.rotation.z += spin.z * 0.008;
        obj.position.y += Math.sin(elapsed * 0.6 + drift.phase) * drift.y * 0.008;
        obj.position.x += Math.cos(elapsed * 0.45 + drift.phase) * drift.x * 0.006;
      }
    });

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (isRunning || reduceMotion) return;
    isRunning = true;
    clock.start();
    tick();
  }

  function stop() {
    isRunning = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function renderStatic() {
    if (!renderer || !scene || !camera) return;
    shapes.forEach(function (obj, i) {
      if (obj.userData.isParticles) return;
      obj.rotation.set(i * 0.4, i * 0.55, i * 0.25);
    });
    renderer.render(scene, camera);
  }

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    buildScene();
    resize();

    if (reduceMotion) {
      renderStatic();
    } else {
      start();
    }

    window.addEventListener("resize", resize, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (!reduceMotion) start();
    });

    document.documentElement.addEventListener("data-theme-set", applyTheme);

    /* Pause when hero scrolls mostly out of view */
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (reduceMotion) return;
            if (entry.isIntersecting) start();
            else stop();
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(container.closest(".hero--editorial") || container);
    }
  } catch (err) {
    if (container.parentNode) container.parentNode.removeChild(container);
  }
})();
