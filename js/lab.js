/* Lab: three.js demos. Nothing loads until a demo is chosen, and each demo
   fetches only its own model. Unlisted page — see the noindex in the head. */

const stage = document.getElementById("stage");
const startBtn = document.getElementById("start");
const panel = document.getElementById("panel");
const statusEl = document.getElementById("status");
const tabs = document.getElementById("tabs");

const MODELS = {
  character: { file: "RobotExpressive.glb", kb: 454, label: "Blending + morph targets" },
  additive: { file: "Xbot.glb", kb: 2790, label: "Additive blending" },
  ik: { file: "kira.glb", kb: 940, label: "Inverse kinematics", draco: true },
};

let core = null;      // renderer, scene, camera, controls — built once
let demo = null;      // the live demo: { root, update(dt), dispose() }
let THREE = null;

const say = (m) => { statusEl.textContent = m; };

startBtn.addEventListener("click", () => load("character"));

tabs.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-demo]");
  if (btn && !btn.disabled) load(btn.dataset.demo);
});

async function load(name) {
  const meta = MODELS[name];
  tabs.querySelectorAll("button[data-demo]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.demo === name));
    b.disabled = true;
  });
  say(`Loading ${meta.label} — ${meta.kb} KB…`);

  try {
    if (!core) core = await makeCore();
    if (demo) { demo.dispose(); demo = null; }

    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const loader = new GLTFLoader();
    // kira.glb is DRACO-compressed; the decoder is only fetched for that demo.
    if (meta.draco) {
      const { DRACOLoader } = await import("three/addons/loaders/DRACOLoader.js");
      const draco = new DRACOLoader();
      draco.setDecoderPath("../js/vendor/three/draco/gltf/");
      loader.setDRACOLoader(draco);
    }
    const gltf = await loader.loadAsync(`../assets/models/${meta.file}`);

    demo = name === "character" ? characterDemo(gltf)
         : name === "additive" ? await additiveDemo(gltf)
         : await ikDemo(gltf);

    core.scene.add(demo.root);
    frameOn(demo.focus || demo.root, demo.frameScale || 2.1);
    startBtn.hidden = true;
    tabs.hidden = false;
    renderPanel(demo.controls);
    say("");
  } catch (err) {
    say("Could not load that demo: " + err.message);
  } finally {
    tabs.querySelectorAll("button[data-demo]").forEach((b) => { b.disabled = false; });
  }
}

async function makeCore() {
  THREE = await import("three");
  const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8d7b63, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.18 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  /* Mouse: drag to orbit, wheel to zoom, right-drag to pan. Damping makes it
     feel weighted instead of twitchy. */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 1.5;
  controls.maxDistance = 40;
  controls.maxPolarAngle = Math.PI * 0.52;   // stop the camera going under the floor

  function resize() {
    const r = stage.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(r.height, 1);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  let onScreen = true;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(stage);

  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    const dt = clock.getDelta();
    if (!onScreen || document.hidden) return;
    if (demo) demo.update(dt);
    controls.update();
    renderer.render(scene, camera);
  })();

  return { renderer, scene, camera, controls, floor };
}

/* Fit the camera to whatever model is loaded, so each demo is framed the same way. */
function frameOn(root, scale) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const mid = box.getCenter(new THREE.Vector3());
  const reach = Math.max(size.x, size.y, size.z);
  const dist = (reach / 2) / Math.tan((core.camera.fov * Math.PI) / 360) * scale;
  core.camera.position.set(mid.x - dist * 0.45, mid.y + size.y * 0.3, mid.z + dist);
  core.controls.target.copy(mid);
  core.controls.update();
  core.floor.position.y = box.min.y;
}

function shadows(root) {
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
}

function disposer(root, mixer) {
  return () => {
    if (mixer) mixer.stopAllAction();
    core.scene.remove(root);
    root.traverse((o) => {
      if (o.isMesh) {
        o.geometry?.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m?.dispose());
      }
    });
  };
}

/* ---- 1. crossfade blending + one-shots + morph targets ------------------ */

function characterDemo(gltf) {
  const root = gltf.scene;
  shadows(root);
  const mixer = new THREE.AnimationMixer(root);
  const actions = {};
  const ONCE = ["Jump", "Yes", "No", "Wave", "Punch", "ThumbsUp", "Death"];

  gltf.animations.forEach((clip) => {
    const a = mixer.clipAction(clip);
    if (ONCE.includes(clip.name)) { a.clampWhenFinished = true; a.loop = THREE.LoopOnce; }
    actions[clip.name] = a;
  });

  let current = actions.Idle;
  current.play();

  const fadeTo = (name) => {
    const next = actions[name];
    if (!next || next === current) return;
    next.reset().setEffectiveWeight(1).fadeIn(0.4).play();
    current.fadeOut(0.4);
    current = next;
  };

  const oneShot = (name) => {
    const a = actions[name];
    if (!a) return;
    const base = current;
    mixer.addEventListener("finished", function back(e) {
      if (e.action !== a) return;
      mixer.removeEventListener("finished", back);
      a.fadeOut(0.25);
      base.reset().fadeIn(0.25).play();
      current = base;
    });
    base.fadeOut(0.2);
    a.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.2).play();
    current = a;
  };

  const faces = [];
  root.traverse((o) => { if (o.isMesh && o.morphTargetDictionary) faces.push(o); });
  const setFace = (name) => faces.forEach((m) =>
    Object.entries(m.morphTargetDictionary).forEach(([k, i]) => { m.morphTargetInfluences[i] = k === name ? 1 : 0; }));

  return {
    root,
    update: (dt) => mixer.update(dt),
    dispose: disposer(root, mixer),
    controls: [
      { title: "Locomotion", note: "crossfaded over 0.4s", kind: "radio", first: "Idle",
        items: ["Idle", "Walking", "Running", "Dance", "Sitting"], on: fadeTo },
      { title: "One-shot", note: "clamps, then returns to the base clip", kind: "push",
        items: ["Jump", "Wave", "Punch", "ThumbsUp", "Yes", "No"], on: oneShot },
      { title: "Expression", note: "morph targets", kind: "radio", first: "Neutral",
        items: ["Angry", "Surprised", "Sad", "Neutral"], on: (n) => setFace(n === "Neutral" ? null : n) },
    ],
  };
}

/* ---- 2. additive blending ----------------------------------------------- */

async function additiveDemo(gltf) {
  const root = gltf.scene;
  shadows(root);
  const mixer = new THREE.AnimationMixer(root);

  const base = {};
  const additive = {};

  gltf.animations.forEach((clip) => {
    const name = clip.name;
    if (["idle", "walk", "run"].includes(name)) {
      base[name] = mixer.clipAction(clip);
      return;
    }
    /* An additive clip stores the DIFFERENCE from the first frame, so it can be
       layered on top of a base clip instead of replacing it. A *_pose clip is
       reduced to a single frame first: it is a pose, not a movement. */
    let c = clip;
    if (name.endsWith("_pose")) c = THREE.AnimationUtils.subclip(clip, name, 2, 3, 30);
    THREE.AnimationUtils.makeClipAdditive(c);
    const a = mixer.clipAction(c);
    a.blendMode = THREE.AdditiveAnimationBlendMode;
    a.setEffectiveWeight(0).play();
    additive[name] = a;
  });

  let current = base.idle;
  current.play();

  const fadeTo = (name) => {
    const next = base[name];
    if (!next || next === current) return;
    next.reset().setEffectiveWeight(1).fadeIn(0.35).play();
    current.fadeOut(0.35);
    current = next;
  };

  // Additive layers toggle their weight; the walk underneath keeps running.
  const toggle = (name, el) => {
    const a = additive[name];
    if (!a) return;
    const onNow = a.getEffectiveWeight() < 0.5;
    a.setEffectiveWeight(onNow ? 1 : 0);
    el.setAttribute("aria-pressed", String(onNow));
  };

  return {
    root,
    update: (dt) => mixer.update(dt),
    dispose: disposer(root, mixer),
    controls: [
      { title: "Base clip", note: "ordinary crossfade", kind: "radio", first: "idle",
        items: ["idle", "walk", "run"], on: fadeTo },
      { title: "Additive layers", note: "stack on top of the base, toggle freely", kind: "toggle",
        items: Object.keys(additive), on: toggle },
    ],
  };
}

/* ---- 3. inverse kinematics ---------------------------------------------- */

async function ikDemo(gltf) {
  const { CCDIKSolver } = await import("three/addons/animation/CCDIKSolver.js");
  const root = gltf.scene;
  shadows(root);

  let skinned = null;
  root.traverse((o) => { if (o.isSkinnedMesh && !skinned) skinned = o; });
  if (!skinned) throw new Error("no skinned mesh in the model");

  const bones = skinned.skeleton.bones;
  const at = (name) => bones.findIndex((b) => b.name === name);
  const chain = { target: at("target_hand_l"), effector: at("hand_l"),
                  links: [{ index: at("lowerarm_l") }, { index: at("Upperarm_l") }] };
  if (chain.target < 0 || chain.effector < 0) throw new Error("expected IK bones are missing");

  /* CCD walks the chain from the hand back up the arm, rotating one joint at a
     time until the hand reaches the target. The target is itself a bone, so
     moving it is all the animation this demo needs. */
  const solver = new CCDIKSolver(skinned, [chain]);
  const targetBone = bones[chain.target];
  const home = targetBone.position.clone();

  let followPointer = false;
  const aim = new THREE.Vector2();
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    aim.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  });

  let t = 0;
  return {
    root,
    focus: skinned,
    frameScale: 5.5,
    update: (dt) => {
      t += dt;
      if (followPointer) {
        targetBone.position.set(home.x + aim.x * 18, home.y + aim.y * 14, home.z + 6);
      } else {
        targetBone.position.set(home.x + Math.sin(t) * 12, home.y + Math.cos(t * 1.3) * 9, home.z);
      }
      solver.update();
    },
    dispose: disposer(root, null),
    controls: [
      { title: "Hand target", note: "the arm solves itself to reach it", kind: "radio", first: "Orbit path",
        items: ["Orbit path", "Follow my cursor"],
        on: (name) => {
          followPointer = name === "Follow my cursor";
          core.controls.enabled = !followPointer;   // stop the drag fighting the hand
        } },
    ],
  };
}

/* ---- control panel ------------------------------------------------------ */

function renderPanel(groups) {
  panel.innerHTML = "";
  groups.forEach((g) => {
    const wrap = document.createElement("div");
    wrap.className = "lab-group";
    const title = document.createElement("span");
    title.className = "lab-group__title";
    title.innerHTML = `${g.title} <em>${g.note}</em>`;
    wrap.appendChild(title);

    g.items.forEach((name) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = name;
      b.setAttribute("aria-pressed", String(g.kind === "radio" && name === g.first));
      b.addEventListener("click", () => {
        if (g.kind === "radio") {
          wrap.querySelectorAll("button").forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
          g.on(name);
        } else if (g.kind === "toggle") {
          g.on(name, b);
        } else {
          g.on(name);
        }
      });
      wrap.appendChild(b);
    });
    panel.appendChild(wrap);
  });
  panel.hidden = false;
}
