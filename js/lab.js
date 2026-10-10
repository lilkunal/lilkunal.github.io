/* Lab: three.js character animation demo.
   Nothing here loads until the visitor asks for it — the import() and the 454 KB
   model are both behind the button, so every other page keeps its budget. */

const stage = document.getElementById("stage");
const startBtn = document.getElementById("start");
const panel = document.getElementById("panel");
const statusEl = document.getElementById("status");

let api = null;

function say(msg) {
  statusEl.textContent = msg;
}

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  say("Loading three.js…");
  try {
    api = await boot();
    startBtn.hidden = true;
    panel.hidden = false;
    say("");
  } catch (err) {
    startBtn.disabled = false;
    say("Could not start the demo: " + err.message);
  }
});

async function boot() {
  const THREE = await import("three");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8d7b63, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShadowMaterial({ opacity: 0.18 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  say("Loading the character… 454 KB");
  const gltf = await new GLTFLoader().loadAsync("../assets/models/RobotExpressive.glb");
  const model = gltf.scene;
  model.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(model);

  /* Frame the camera from the model's real bounds rather than guessed numbers,
     so a different model would still be centred and whole. */
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const mid = box.getCenter(new THREE.Vector3());
  const reach = Math.max(size.x, size.y, size.z);
  const dist = (reach / 2) / Math.tan((camera.fov * Math.PI) / 360) * 1.9;
  camera.position.set(mid.x - dist * 0.45, mid.y + size.y * 0.35, mid.z + dist);
  camera.lookAt(mid.x, mid.y, mid.z);
  floor.position.y = box.min.y;

  const mixer = new THREE.AnimationMixer(model);
  const actions = {};
  gltf.animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    // One-shot moves should stop on their last frame, not snap back mid-pose.
    if (["Jump", "Yes", "No", "Wave", "Punch", "ThumbsUp", "Death"].includes(clip.name)) {
      action.clampWhenFinished = true;
      action.loop = THREE.LoopOnce;
    }
    actions[clip.name] = action;
  });

  const LOCOMOTION = ["Idle", "Walking", "Running"];
  let current = actions.Idle;
  current.play();

  /* Crossfade, the technique from the skinning-blending example: both clips run,
     their weights are interpolated, so the skeleton never pops between poses. */
  function fadeTo(name, seconds = 0.4) {
    const next = actions[name];
    if (!next || next === current) return;
    next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(seconds).play();
    current.fadeOut(seconds);
    current = next;
  }

  function oneShot(name) {
    const action = actions[name];
    if (!action) return;
    const base = current;
    mixer.addEventListener("finished", function back(e) {
      if (e.action !== action) return;
      mixer.removeEventListener("finished", back);
      action.fadeOut(0.25);
      base.reset().fadeIn(0.25).play();
      current = base;
    });
    base.fadeOut(0.2);
    action.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.2).play();
    current = action;
  }

  // Face morph targets, when the model carries them.
  const faces = [];
  model.traverse((o) => {
    if (o.isMesh && o.morphTargetDictionary) faces.push(o);
  });
  const expressions = faces.length ? Object.keys(faces[0].morphTargetDictionary) : [];

  function setExpression(name) {
    faces.forEach((mesh) => {
      Object.entries(mesh.morphTargetDictionary).forEach(([key, i]) => {
        mesh.morphTargetInfluences[i] = key === name ? 1 : 0;
      });
    });
  }

  function resize() {
    const r = stage.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(r.height, 1);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  // Pause when off-screen or on a hidden tab: an idle rAF loop is wasted battery.
  let running = true;
  const io = new IntersectionObserver(([e]) => { running = e.isIntersecting; });
  io.observe(stage);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false;
  });

  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    const dt = clock.getDelta();
    if (!running && !document.hidden) running = true;
    if (!running) return;
    mixer.update(dt);
    model.rotation.y += dt * 0.15;
    renderer.render(scene, camera);
  })();

  return { fadeTo, oneShot, setExpression, expressions, LOCOMOTION, actions };
}

/* Controls */
panel.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn || !api) return;
  panel.querySelectorAll("button[data-group='" + btn.dataset.group + "']")
    .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  if (btn.dataset.group === "move") api.fadeTo(btn.dataset.action);
  else if (btn.dataset.group === "once") api.oneShot(btn.dataset.action);
  else if (btn.dataset.group === "face") api.setExpression(btn.dataset.action);
});
