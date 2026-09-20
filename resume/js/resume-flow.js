// Résumé intro: a three.js dragon chases a flaming pearl through the intro paragraph, and Pretext
// (github.com/chenglou/pretext, vendored in js/vendor/pretext) re-lays the text every frame so each line
// splits around both of them and flows on either side — the slot-carving technique from Pretext's own
// "Editorial Engine" demo. Screen-only enhancement for widths ≥ 700px: the original
// <p class="hero__lede"> stays in the DOM as the accessible text and is what print/PDF shows, and any
// failure leaves the page as it was. three.js and Pretext load lazily, so phones never download them.

const hero = document.querySelector(".hero--resume");
const lede = hero && hero.querySelector(".hero__lede");

const MIN_WIDTH = 700; // below this the intro keeps its normal centred paragraph
const WIDE = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");

const MIN_SLOT = 46; // px; narrower gaps beside a creature stay empty
const H_PAD = 10; // px of air left and right of a creature
const V_PAD = 2; // px of air above and below a creature
const EXTRA_LINES = 1; // spare line under the text so the buttons below never jump
const SEGMENTS = 26; // dragon body spheres
const SPACING = 9; // px between body spheres along the trail
const BODY_R = 11; // thickest body radius; tapers towards the tail
const HEAD_R = 14;
const PEARL_R = 12;
const TRAIL_GLOWS = 6;

let THREE = null;
let pretext = null;

let flow = null;
let stage = null;
let renderer = null;
let scene = null;
let camera = null;
let dummy = null;
let bodyMesh = null;
let spikeMesh = null;
let headGroup = null;
let wingUp = null;
let wingDown = null;
let pearlMesh = null;
let pearlHalo = null;
const trailGlows = [];
const materials = {};

let prepared = null;
let fonts = { regular: "", bold: "" };
let itemBold = [];
let fontsReady = false;
let lh = 20;
let W = 0;
let H = 0;

const head = { x: 0, y: 0, angle: 0 };
const pearl = { x: 0, y: 0 };
const pointer = { x: 0, y: 0, active: false };
const body = Array.from({ length: SEGMENTS }, () => ({ x: 0, y: 0 }));
const pearlHistory = [];
let trail = [];
let time = 0;

const obstacles = [];
const blocked = [];
let nextLines = []; // flat: text, x, y, bold, text, x, y, bold, …
let shownLines = [];
const pool = [];

let boot = null;
let active = false;
let visible = true;
let raf = 0;
let last = 0;
let lastWidth = 0;
let heightTimer = 0;

// innerWidth is read directly: some viewport emulators never update matchMedia on resize.
function isWide() {
  return window.innerWidth >= MIN_WIDTH;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrapAngle(angle) {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

async function loadLibraries() {
  const [three, richInline, layout] = await Promise.all([
    import("../../js/vendor/three.module.js"),
    import("../../js/vendor/pretext/rich-inline.js"),
    import("../../js/vendor/pretext/layout.js")
  ]);
  THREE = three;
  pretext = {
    prepareRichInline: richInline.prepareRichInline,
    layoutNextRichInlineLineRange: richInline.layoutNextRichInlineLineRange,
    materializeRichInlineLineRange: richInline.materializeRichInlineLineRange,
    clearCache: layout.clearCache
  };
}

/* ---------- creatures: motion ---------- */

function segmentRadius(index) {
  return Math.max(3, BODY_R * (1 - (index / SEGMENTS) * 0.78));
}

// The dragon enters from the left edge, the pearl from the right.
function resetCreatures() {
  time = 0;
  head.x = HEAD_R;
  head.y = H * 0.55;
  head.angle = -0.15;
  trail = [];
  for (let d = 0; d <= SEGMENTS * SPACING + SPACING; d += 4) {
    trail.push({ x: head.x - d, y: head.y + d * 0.08 });
  }
  pearl.x = W - PEARL_R - 6;
  pearl.y = H * 0.4;
  pearlHistory.length = 0;
  resampleBody();
}

function stepCreatures(dt) {
  time += dt;

  // The pearl follows the pointer while it hovers the paragraph, otherwise a slow loop across the stage.
  let tx;
  let ty;
  if (pointer.active) {
    tx = pointer.x;
    ty = pointer.y;
  } else {
    tx = W * (0.5 + 0.38 * Math.sin(time * 0.37 + 1.2));
    ty = H * (0.5 + 0.32 * Math.sin(time * 0.61));
  }
  const follow = 1 - Math.exp(-dt * (pointer.active ? 9 : 2.2));
  pearl.x = clamp(pearl.x + (tx - pearl.x) * follow, PEARL_R + 4, W - PEARL_R - 4);
  pearl.y = clamp(pearl.y + (ty - pearl.y) * follow, PEARL_R + 4, H - PEARL_R - 4);

  // The head steers at the pearl with a capped turn rate, so it overshoots and loops around it.
  const dx = pearl.x - head.x;
  const dy = pearl.y - head.y;
  const dist = Math.hypot(dx, dy);
  const maxTurn = 2.4 * dt;
  head.angle = wrapAngle(head.angle + clamp(wrapAngle(Math.atan2(dy, dx) - head.angle), -maxTurn, maxTurn));
  const speed = clamp(dist * 1.6, 70, 150);
  head.x = clamp(head.x + Math.cos(head.angle) * speed * dt, HEAD_R, W - HEAD_R);
  head.y = clamp(head.y + Math.sin(head.angle) * speed * dt, HEAD_R, H - HEAD_R);

  const newest = trail[0];
  if (!newest || Math.hypot(head.x - newest.x, head.y - newest.y) >= 1) {
    trail.unshift({ x: head.x, y: head.y });
  }
}

// Body spheres sit at fixed arc-length spacing along the path the head has travelled.
function resampleBody() {
  body[0].x = trail[0].x;
  body[0].y = trail[0].y;
  let seg = 1;
  let travelled = 0;
  let i = 1;
  for (; i < trail.length && seg < SEGMENTS; i++) {
    const p = trail[i - 1];
    const q = trail[i];
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d === 0) continue;
    while (seg < SEGMENTS && travelled + d >= seg * SPACING) {
      const t = (seg * SPACING - travelled) / d;
      body[seg].x = p.x + (q.x - p.x) * t;
      body[seg].y = p.y + (q.y - p.y) * t;
      seg++;
    }
    travelled += d;
  }
  for (; seg < SEGMENTS; seg++) {
    body[seg].x = body[seg - 1].x;
    body[seg].y = body[seg - 1].y;
  }
  if (trail.length > i + 1) trail.length = i + 1;
}

function wingPose() {
  const angle = Math.atan2(body[2].y - body[4].y, body[2].x - body[4].x);
  return { x: body[3].x, y: body[3].y, angle, flap: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 7)) };
}

function collectObstacles() {
  obstacles.length = 0;
  obstacles.push({ cx: pearl.x, cy: pearl.y, r: PEARL_R + 4 });
  obstacles.push({
    cx: head.x + Math.cos(head.angle) * 8,
    cy: head.y + Math.sin(head.angle) * 8,
    r: HEAD_R + 2
  });
  for (let i = 1; i < SEGMENTS; i += 2) {
    obstacles.push({ cx: body[i].x, cy: body[i].y, r: segmentRadius(i) + 1 });
  }
  const wing = wingPose();
  const span = 26 * wing.flap;
  const nx = -Math.sin(wing.angle);
  const ny = Math.cos(wing.angle);
  obstacles.push({ cx: wing.x + nx * span * 0.6, cy: wing.y + ny * span * 0.6, r: span * 0.5 + 3 });
  obstacles.push({ cx: wing.x - nx * span * 0.6, cy: wing.y - ny * span * 0.6, r: span * 0.5 + 3 });
}

/* ---------- Pretext: lines carved around the creatures ---------- */

function fontFor(el) {
  const cs = getComputedStyle(el);
  const family = cs.fontFamily.split(",")[0].trim() || "sans-serif";
  const style = cs.fontStyle === "italic" ? "italic " : "";
  return `${style}${cs.fontWeight} ${cs.fontSize} ${family}, sans-serif`;
}

function lineHeightPx() {
  const cs = getComputedStyle(lede);
  const value = parseFloat(cs.lineHeight);
  return Number.isFinite(value) ? value : parseFloat(cs.fontSize) * 1.55;
}

async function prepareText() {
  const regular = fontFor(lede);
  const strongEl = lede.querySelector("strong");
  const bold = strongEl ? fontFor(strongEl) : regular;

  if (document.fonts && document.fonts.load) {
    await Promise.all([document.fonts.load(regular), document.fonts.load(bold)]).catch(() => {});
    fontsReady = document.fonts.check(regular) && document.fonts.check(bold);
  } else {
    fontsReady = true;
  }

  const items = [];
  const bolds = [];
  lede.childNodes.forEach((node) => {
    let text = node.textContent;
    if (!text) return;
    const isStrong = node.nodeType === Node.ELEMENT_NODE && node.tagName === "STRONG";
    // Punctuation straight after a bold name ("Pvt. Ltd.,") joins that name, so a line never starts with it.
    const previous = items[items.length - 1];
    if (!isStrong && previous && bolds[bolds.length - 1]) {
      const punctuation = text.match(/^[,.;:!?)\]]+/);
      if (punctuation) {
        previous.text += punctuation[0];
        text = text.slice(punctuation[0].length);
        if (!text) return;
      }
    }
    items.push({ text, font: isStrong ? bold : regular });
    bolds.push(isStrong && bold !== regular);
  });

  fonts = { regular, bold };
  itemBold = bolds;
  prepared = pretext.prepareRichInline(items);
}

function circleInterval(obstacle, top, bottom) {
  const { cx, cy, r } = obstacle;
  if (top >= cy + r || bottom <= cy - r) return null;
  const minDy = cy >= top && cy <= bottom ? 0 : cy < top ? top - cy : cy - bottom;
  if (minDy >= r) return null;
  const dx = Math.sqrt(r * r - minDy * minDy);
  return { left: cx - dx - H_PAD, right: cx + dx + H_PAD };
}

function carveSlots(intervals) {
  let slots = [{ left: 0, right: W }];
  for (let b = 0; b < intervals.length; b++) {
    const cut = intervals[b];
    const next = [];
    for (let s = 0; s < slots.length; s++) {
      const slot = slots[s];
      if (cut.right <= slot.left || cut.left >= slot.right) {
        next.push(slot);
        continue;
      }
      if (cut.left > slot.left) next.push({ left: slot.left, right: cut.left });
      if (cut.right < slot.right) next.push({ left: cut.right, right: slot.right });
    }
    slots = next;
  }
  return slots.filter((slot) => slot.right - slot.left >= MIN_SLOT).sort((a, b) => a.left - b.left);
}

function emitLine(line, left, top) {
  let x = left;
  for (let f = 0; f < line.fragments.length; f++) {
    const frag = line.fragments[f];
    x += frag.gapBefore;
    nextLines.push(frag.text, Math.round(x * 2) / 2, top, itemBold[frag.itemIndex] ? 1 : 0);
    x += frag.occupiedWidth;
  }
}

// Lays the paragraph out band by band, filling every free slot left to right. Returns bands used.
function layoutText(measureOnly) {
  if (!measureOnly) nextLines.length = 0;
  let cursor;
  let used = 0;
  for (let band = 0; band < 160; band++) {
    const top = band * lh;
    const bottom = top + lh;
    blocked.length = 0;
    for (let i = 0; i < obstacles.length; i++) {
      const interval = circleInterval(obstacles[i], top - V_PAD, bottom + V_PAD);
      if (interval) blocked.push(interval);
    }
    const slots = carveSlots(blocked);
    let exhausted = false;
    for (let s = 0; s < slots.length; s++) {
      const slot = slots[s];
      const width = slot.right - slot.left;
      const range = pretext.layoutNextRichInlineLineRange(prepared, width, cursor);
      if (range === null) {
        exhausted = true;
        break;
      }
      // A narrow slot beside a creature must not split a word; leave it empty instead.
      if (width < W - 1 && range.end.graphemeIndex !== 0) continue;
      if (!measureOnly) emitLine(pretext.materializeRichInlineLineRange(prepared, range), slot.left, top);
      cursor = range.end;
      used = band + 1;
    }
    if (exhausted) break;
  }
  return used;
}

function projectLines() {
  const count = nextLines.length / 4;
  if (nextLines.length === shownLines.length) {
    let same = true;
    for (let i = 0; i < nextLines.length; i++) {
      if (nextLines[i] !== shownLines[i]) {
        same = false;
        break;
      }
    }
    if (same) return;
  }
  while (pool.length < count) {
    const el = document.createElement("span");
    el.style.font = fonts.regular;
    el.style.lineHeight = `${lh}px`;
    flow.appendChild(el);
    pool.push(el);
  }
  for (let i = 0; i < pool.length; i++) {
    const el = pool[i];
    if (i >= count) {
      if (!el.hidden) el.hidden = true;
      continue;
    }
    const k = i * 4;
    const text = nextLines[k];
    const bold = nextLines[k + 3] === 1;
    el.hidden = false;
    if (el.textContent !== text) el.textContent = text;
    const className = bold ? "is-bold" : "";
    if (el.className !== className) {
      el.className = className;
      el.style.font = bold ? fonts.bold : fonts.regular;
      el.style.lineHeight = `${lh}px`;
    }
    el.style.transform = `translate(${nextLines[k + 1]}px, ${nextLines[k + 2]}px)`;
  }
  shownLines = nextLines.slice();
}

function computeStageHeight() {
  obstacles.length = 0;
  const natural = layoutText(true);
  let height = (natural + 4) * lh;

  const saved = {
    head: { ...head },
    pearl: { ...pearl },
    time,
    trail: trail.map((p) => ({ ...p })),
    pointerActive: pointer.active
  };
  pointer.active = false;

  // Simulate the autonomous chase for ~30 s and keep the tallest layout it ever needs.
  for (let pass = 0; pass < 2; pass++) {
    H = height;
    resetCreatures();
    let most = natural;
    for (let step = 0; step < 900; step++) {
      stepCreatures(1 / 30);
      resampleBody();
      if (step % 6 === 0) {
        collectObstacles();
        most = Math.max(most, layoutText(true));
      }
    }
    height = (most + EXTRA_LINES) * lh;
  }

  Object.assign(head, saved.head);
  Object.assign(pearl, saved.pearl);
  time = saved.time;
  trail = saved.trail.length ? saved.trail : trail;
  pointer.active = saved.pointerActive;
  resampleBody();
  return Math.ceil(height);
}

/* ---------- three.js scene ---------- */

function cssColor(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(value || fallback);
}

function makeGlowTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Built facing +x with "up" at +y; the frame update mirrors it when the dragon heads left.
function buildHead() {
  const group = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R * 0.92, 18, 14), materials.body);

  const snout = new THREE.Mesh(new THREE.ConeGeometry(HEAD_R * 0.62, HEAD_R * 1.5, 12), materials.body);
  snout.rotation.z = -Math.PI / 2;
  snout.position.set(HEAD_R * 1.05, -HEAD_R * 0.08, 0);

  const jaw = new THREE.Mesh(new THREE.ConeGeometry(HEAD_R * 0.34, HEAD_R * 1.1, 10), materials.accent);
  jaw.rotation.z = -Math.PI / 2;
  jaw.position.set(HEAD_R * 0.8, -HEAD_R * 0.55, -1);

  const horn = new THREE.Mesh(new THREE.ConeGeometry(HEAD_R * 0.2, HEAD_R * 1.3, 8), materials.accent);
  horn.rotation.z = Math.PI * 0.28;
  horn.position.set(-HEAD_R * 0.55, HEAD_R * 0.85, 1);
  const hornBack = horn.clone();
  hornBack.position.set(-HEAD_R * 0.1, HEAD_R * 0.95, 0.5);
  hornBack.scale.setScalar(0.8);

  const eye = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R * 0.2, 10, 8), materials.eye);
  eye.position.set(HEAD_R * 0.35, HEAD_R * 0.35, HEAD_R * 0.8);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R * 0.1, 8, 6), materials.pupil);
  pupil.position.set(HEAD_R * 0.45, HEAD_R * 0.35, HEAD_R * 0.97);

  group.add(skull, snout, jaw, horn, hornBack, eye, pupil);
  return group;
}

function buildWingGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, 0);
  shape.quadraticCurveTo(-0.9, 0.55, -0.35, 1);
  shape.lineTo(-0.1, 0.72);
  shape.lineTo(0.15, 0.95);
  shape.lineTo(0.3, 0.62);
  shape.quadraticCurveTo(0.55, 0.3, 0.5, 0);
  shape.lineTo(-0.5, 0);
  return new THREE.ShapeGeometry(shape);
}

function mount() {
  flow = document.createElement("div");
  flow.className = "hero__flow";
  flow.setAttribute("aria-hidden", "true");
  flow.hidden = true;
  stage = document.createElement("canvas");
  stage.className = "hero__stage";
  flow.appendChild(stage);
  lede.after(flow);
}

function buildScene() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: stage, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (err) {
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(0, 1, 0, -1, -200, 200);
  dummy = new THREE.Object3D();

  materials.body = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.2 });
  materials.accent = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.35 });
  materials.wing = new THREE.MeshStandardMaterial({
    roughness: 0.8,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide
  });
  materials.eye = new THREE.MeshBasicMaterial({ color: 0xfff7e0 });
  materials.pupil = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
  materials.pearl = new THREE.MeshStandardMaterial({ roughness: 0.15, metalness: 0.1, emissiveIntensity: 0.85 });
  materials.halo = new THREE.SpriteMaterial({ map: makeGlowTexture(), transparent: true, depthWrite: false, opacity: 0.85 });

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8178, 1.4));
  const sun = new THREE.DirectionalLight(0xffffff, 1.8);
  sun.position.set(-0.6, 1, 1.2);
  scene.add(sun);

  bodyMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), materials.body, SEGMENTS);
  spikeMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 6), materials.accent, SEGMENTS);
  bodyMesh.frustumCulled = false;
  spikeMesh.frustumCulled = false;

  const wingGeometry = buildWingGeometry();
  wingUp = new THREE.Mesh(wingGeometry, materials.wing);
  wingDown = new THREE.Mesh(wingGeometry, materials.wing);
  headGroup = buildHead();

  pearlMesh = new THREE.Mesh(new THREE.SphereGeometry(PEARL_R, 20, 16), materials.pearl);
  pearlHalo = new THREE.Sprite(materials.halo);
  for (let i = 0; i < TRAIL_GLOWS; i++) {
    const glow = new THREE.Sprite(materials.halo.clone());
    glow.visible = false;
    trailGlows.push(glow);
    scene.add(glow);
  }

  scene.add(wingUp, wingDown, bodyMesh, spikeMesh, headGroup, pearlHalo, pearlMesh);
  applyTheme();
  return true;
}

function applyTheme() {
  if (!renderer) return;
  const teal = cssColor("--teal-600", "#0d9488");
  const brass = cssColor("--brass-500", "#b45309");
  materials.body.color.copy(teal);
  materials.wing.color.copy(teal);
  materials.accent.color.copy(brass);
  materials.pearl.color.copy(brass);
  materials.pearl.emissive.copy(brass);
  materials.halo.color.copy(brass);
  for (const glow of trailGlows) glow.material.color.copy(brass);
  if (active) renderer.render(scene, camera);
}

function sizeStage(width, height) {
  W = width;
  H = height;
  flow.style.height = `${H}px`;
  renderer.setSize(W, H, false);
  camera.left = 0;
  camera.right = W;
  camera.top = 0;
  camera.bottom = -H;
  camera.updateProjectionMatrix();
}

// Scene space is CSS pixels with y flipped (world y = -page y).
function updateScene() {
  for (let i = 0; i < SEGMENTS; i++) {
    const r = segmentRadius(i);
    dummy.position.set(body[i].x, -body[i].y, -i * 0.01);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(r, r, r);
    dummy.updateMatrix();
    bodyMesh.setMatrixAt(i, dummy.matrix);

    // Dorsal spikes point to the screen-top side of the body, like a dragon seen side-on.
    const prev = body[Math.max(0, i - 1)];
    const next = body[Math.min(SEGMENTS - 1, i + 1)];
    const along = Math.atan2(prev.y - next.y, prev.x - next.x);
    let nx = -Math.sin(along);
    let ny = Math.cos(along);
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const spiky = i >= 3 && i <= SEGMENTS - 4 && i % 2 === 1;
    const s = spiky ? r * 0.55 : 0.0001;
    dummy.position.set(body[i].x + nx * r * 0.85, -(body[i].y + ny * r * 0.85), 1);
    dummy.rotation.set(0, 0, Math.atan2(-ny, nx) - Math.PI / 2);
    dummy.scale.set(s, s * 1.7, s);
    dummy.updateMatrix();
    spikeMesh.setMatrixAt(i, dummy.matrix);
  }
  bodyMesh.instanceMatrix.needsUpdate = true;
  spikeMesh.instanceMatrix.needsUpdate = true;

  headGroup.position.set(head.x, -head.y, 3);
  headGroup.rotation.z = -head.angle;
  headGroup.scale.y = Math.cos(head.angle) < 0 ? -1 : 1;

  const wing = wingPose();
  const theta = Math.PI - wing.angle;
  wingUp.position.set(wing.x, -wing.y, 0.5);
  wingUp.rotation.z = theta;
  wingUp.scale.set(20, 26 * wing.flap, 1);
  wingDown.position.copy(wingUp.position);
  wingDown.rotation.z = theta + Math.PI;
  wingDown.scale.copy(wingUp.scale);

  const pulse = 1 + 0.12 * Math.sin(time * 4);
  pearlMesh.position.set(pearl.x, -pearl.y, 4);
  pearlHalo.position.set(pearl.x, -pearl.y, 3.5);
  pearlHalo.scale.set(PEARL_R * 5 * pulse, PEARL_R * 5 * pulse, 1);

  const newest = pearlHistory[0];
  if (!newest || Math.hypot(pearl.x - newest.x, pearl.y - newest.y) > 7) {
    pearlHistory.unshift({ x: pearl.x, y: pearl.y });
    if (pearlHistory.length > TRAIL_GLOWS) pearlHistory.length = TRAIL_GLOWS;
  }
  for (let i = 0; i < TRAIL_GLOWS; i++) {
    const glow = trailGlows[i];
    const point = pearlHistory[i + 1];
    glow.visible = Boolean(point);
    if (!point) continue;
    const fade = 1 - (i + 1) / (TRAIL_GLOWS + 1);
    glow.position.set(point.x, -point.y, 2);
    glow.scale.set(PEARL_R * 2.6 * fade, PEARL_R * 2.6 * fade, 1);
    glow.material.opacity = 0.5 * fade;
  }
}

/* ---------- frame loop ---------- */

function frame(dt) {
  if (dt > 0) stepCreatures(dt);
  resampleBody();
  collectObstacles();
  const used = layoutText(false);
  projectLines();
  const needed = Math.ceil((used + EXTRA_LINES) * lh);
  if (needed > H) sizeStage(W, needed);
  updateScene();
  renderer.render(scene, camera);
}

function tick(now) {
  raf = 0;
  if (!active || !visible || document.hidden || REDUCED.matches) return;
  const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
  last = now;
  frame(dt);
  raf = requestAnimationFrame(tick);
}

function play() {
  if (raf || !active || !visible || document.hidden) return;
  if (REDUCED.matches) {
    frame(0);
    return;
  }
  last = 0;
  raf = requestAnimationFrame(tick);
}

function pause() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

// Opt-in with ?flowdebug: lets a test step the animation where requestAnimationFrame is paused.
function exposeDebugHook() {
  if (!/[?&]flowdebug\b/.test(window.location.search) || window.__resumeFlow) return;
  window.__resumeFlow = {
    step(seconds = 1, fps = 60) {
      for (let i = 0; i < Math.round(seconds * fps); i++) frame(1 / fps);
      return { head: { ...head }, pearl: { ...pearl }, width: W, height: H, fragments: nextLines.length / 4 };
    },
    point(x, y) {
      pointer.active = typeof x === "number";
      if (pointer.active) {
        pointer.x = x;
        pointer.y = y;
      }
    }
  };
}

/* ---------- lifecycle ---------- */

function activate() {
  if (active) return;
  hero.classList.add("hero--flowing");
  // Only take over when the stage stylesheet is really applied. A stale cached CSS file would otherwise
  // leave an unstyled canvas in the paragraph. That lasts for the whole page load, so give up cleanly.
  if (getComputedStyle(stage).position !== "absolute") {
    teardown();
    return;
  }
  active = true;
  lede.classList.add("u-sr-only");
  flow.hidden = false;
  W = flow.clientWidth;
  lastWidth = W;
  lh = lineHeightPx();
  sizeStage(W, computeStageHeight());
  resetCreatures();
  if (REDUCED.matches) {
    for (let step = 0; step < 135; step++) {
      stepCreatures(1 / 30);
      resampleBody();
    }
  }
  frame(0);
  play();
  exposeDebugHook();
}

function deactivate() {
  active = false;
  pause();
  clearTimeout(heightTimer);
  if (hero) hero.classList.remove("hero--flowing");
  if (lede) lede.classList.remove("u-sr-only");
  if (flow) flow.hidden = true;
}

// Runs synchronously: resizes can skip the media-query change event, and requestAnimationFrame
// may be paused in a background window, so neither is relied on to switch the flow off.
function syncWidth() {
  if (isWide() !== active) onWide();
}

function wireEvents() {
  new ResizeObserver(() => {
    if (isWide() !== active) {
      syncWidth();
      return;
    }
    if (!active) return;
    const width = flow.clientWidth;
    if (!width || width === lastWidth) return;
    lastWidth = width;
    sizeStage(width, H);
    frame(0);
    clearTimeout(heightTimer);
    heightTimer = setTimeout(() => {
      if (!active) return;
      sizeStage(W, computeStageHeight());
      frame(0);
    }, 180);
  }).observe(hero);

  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) play();
      else pause();
    }).observe(hero);
  }

  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : play()));
  REDUCED.addEventListener("change", () => {
    pause();
    play();
  });

  flow.addEventListener(
    "pointermove",
    (event) => {
      const box = flow.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.active = true;
    },
    { passive: true }
  );
  flow.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  // If DM Sans arrives after the first measurement, re-measure once with the real font.
  if (document.fonts) {
    document.fonts.addEventListener("loadingdone", () => {
      if (fontsReady || !flow) return;
      if (!(document.fonts.check(fonts.regular) && document.fonts.check(fonts.bold))) return;
      pretext.clearCache();
      prepareText()
        .then(() => {
          if (!active) return;
          sizeStage(W, computeStageHeight());
          frame(0);
        })
        .catch(teardown);
    });
  }
}

async function bootOnce() {
  await loadLibraries();
  mount();
  if (!buildScene()) throw new Error("WebGL unavailable");
  await prepareText();
  wireEvents();
}

function teardown() {
  deactivate();
  WIDE.removeEventListener("change", onWide);
  window.removeEventListener("resize", syncWidth);
  if (renderer) renderer.dispose();
  if (flow) flow.remove();
  renderer = null;
  flow = null;
  stage = null;
}

async function onWide() {
  if (!isWide()) {
    deactivate();
    return;
  }
  try {
    boot = boot || bootOnce();
    await boot;
    if (isWide() && flow) activate();
  } catch (err) {
    teardown();
  }
}

if (hero && lede && typeof Intl !== "undefined" && "Segmenter" in Intl) {
  WIDE.addEventListener("change", onWide);
  window.addEventListener("resize", syncWidth, { passive: true });
  onWide();
}
