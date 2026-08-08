/* Webcam body tracking for Sky Glide — lazy-loads MediaPipe Pose (network only when enabled).
   Sky Peck uses full-body motion in Godot; in the browser we approximate:
   - Wrist span vs shoulder width  → wing spread (lift)
   - Nose vs shoulder midpoint Y   → pitch (nose up = climb) */
(function () {
  "use strict";

  var SCRIPTS = [
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm/vision_wasm_internal.js",
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.js"
  ];
  var WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
  var MODEL =
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

  var loaded = false;
  var loading = null;
  var landmarker = null;
  var video = null;
  var stream = null;
  var active = false;
  var last = { wing: 0.35, pitch: 0, ok: false };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function ensureMediaPipe() {
    if (loaded) return Promise.resolve();
    if (loading) return loading;
    loading = SCRIPTS.reduce(function (p, src) {
      return p.then(function () { return loadScript(src); });
    }, Promise.resolve()).then(function () {
      if (!window.FilesetResolver || !window.PoseLandmarker) {
        throw new Error("MediaPipe bundle missing");
      }
      return window.FilesetResolver.forVisionTasks(WASM_BASE);
    }).then(function (vision) {
      return window.PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1
      });
    }).then(function (lm) {
      landmarker = lm;
      loaded = true;
    });
    return loading;
  }

  function dist(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function analyse(landmarks) {
    if (!landmarks || !landmarks.length) {
      last.ok = false;
      return last;
    }
    var lm = landmarks[0];
    var lSh = lm[11];
    var rSh = lm[12];
    var lWr = lm[15];
    var rWr = lm[16];
    var nose = lm[0];
    if (!lSh || !rSh || !lWr || !rWr || !nose) {
      last.ok = false;
      return last;
    }

    var shoulderW = Math.max(0.08, dist(lSh, rSh));
    var wristSpan = dist(lWr, rWr);
    var wing = clamp((wristSpan / shoulderW - 0.9) / 1.1, 0, 1);

    var midY = (lSh.y + rSh.y) / 2;
    var pitch = clamp((midY - nose.y) * 4, -1, 1);

    last.wing = last.wing * 0.55 + wing * 0.45;
    last.pitch = last.pitch * 0.55 + pitch * 0.45;
    last.ok = true;
    return last;
  }

  function tick() {
    if (!active || !landmarker || !video || video.readyState < 2) return last;
    var now = performance.now();
    var result = landmarker.detectForVideo(video, now);
    if (result && result.landmarks) analyse(result.landmarks);
    return last;
  }

  window.KVPose = {
    start: function (previewEl) {
      if (active) return Promise.resolve(last);
      return ensureMediaPipe()
        .then(function () {
          return navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
          });
        })
        .then(function (media) {
          stream = media;
          video = document.createElement("video");
          video.setAttribute("playsinline", "");
          video.muted = true;
          video.srcObject = stream;
          if (previewEl) {
            previewEl.srcObject = stream;
            previewEl.hidden = false;
          }
          return video.play();
        })
        .then(function () {
          active = true;
          return last;
        });
    },

    stop: function (previewEl) {
      active = false;
      if (stream) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        stream = null;
      }
      if (video) {
        video.srcObject = null;
        video = null;
      }
      if (previewEl) {
        previewEl.srcObject = null;
        previewEl.hidden = true;
      }
      last = { wing: 0.35, pitch: 0, ok: false };
    },

    read: tick,
    isActive: function () { return active; }
  };
})();
