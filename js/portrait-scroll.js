import * as THREE from "./vendor/three.module.js";

(function () {
  var stage = document.getElementById("face-stage");
  var canvas = document.getElementById("face-canvas");
  if (!stage || !canvas) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power"
    });
  } catch (err) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
  camera.position.z = 1.35;

  var mesh = null;
  var extraY = 0;
  var startY = 0;
  var endY = 0;
  var targetProgress = 0;
  var renderProgress = 0;
  var mouseX = 0;
  var mouseY = 0;
  var renderMouseX = 0;
  var renderMouseY = 0;
  var raf = 0;
  var running = false;

  function sizeRenderer() {
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    fitMesh();
  }

  function visibleSize() {
    var visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    return { visH: visH, visW: visH * camera.aspect };
  }

  function fitMesh() {
    if (!mesh) return;
    var img = mesh.material.map && mesh.material.map.image;
    if (!img || !img.width) return;
    var vis = visibleSize();
    var imgAspect = img.width / img.height;
    var viewAspect = vis.visW / vis.visH;
    var planeW;
    var planeH;
    if (imgAspect > viewAspect) {
      planeH = vis.visH * 1.08;
      planeW = planeH * imgAspect;
    } else {
      planeW = vis.visW * 1.08;
      planeH = planeW / imgAspect;
    }
    mesh.scale.set(planeW, planeH, 1);
    extraY = Math.max(0, (planeH - vis.visH) / 2);
    startY = extraY * 0.72;
    endY = -extraY * 0.55;
  }

  function stageProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 1) return 0;
    return Math.min(1, Math.max(0, window.scrollY / max));
  }

  function kick() {
    if (!running) {
      running = true;
      raf = requestAnimationFrame(tick);
    }
  }

  function onScroll() {
    targetProgress = stageProgress();
    kick();
  }

  function onPointerMove(event) {
    mouseX = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
    mouseY = (event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
    kick();
  }

  function onPointerLeave() {
    mouseX = 0;
    mouseY = 0;
    kick();
  }

  function tick() {
    renderProgress += (targetProgress - renderProgress) * 0.12;
    renderMouseX += (mouseX - renderMouseX) * 0.08;
    renderMouseY += (mouseY - renderMouseY) * 0.08;
    if (mesh) {
      var t = renderProgress;
      mesh.position.x = renderMouseX * 0.09;
      mesh.position.y = startY + (endY - startY) * t - renderMouseY * 0.05;
      camera.position.z = 1.35 - t * 0.18;
    }
    renderer.render(scene, camera);
    var moving =
      Math.abs(targetProgress - renderProgress) > 0.001 ||
      Math.abs(mouseX - renderMouseX) > 0.001 ||
      Math.abs(mouseY - renderMouseY) > 0.001;
    if (moving) {
      raf = requestAnimationFrame(tick);
    } else {
      running = false;
      renderer.render(scene, camera);
    }
  }

  var loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  loader.load(
    "assets/photos/site-bg-illustration.png",
    function (tex) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      var mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 1,
        depthWrite: false
      });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), mat);
      scene.add(mesh);
      document.documentElement.classList.add("has-face-gl");
      sizeRenderer();
      onScroll();
    },
    undefined,
    function () {
      renderer.dispose();
    }
  );

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("resize", function () {
    sizeRenderer();
    onScroll();
  });
})();
