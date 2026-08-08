/* Game picker — triple-click name or footer hint opens Flap vs Sky Glide */
(function () {
  "use strict";

  var TRIGGER_CLICKS = 3;
  var CLICK_WINDOW = 900;
  var clicks = 0;
  var lastClick = 0;
  var picker = null;

  function buildPicker() {
    picker = document.createElement("div");
    picker.className = "kvgame kvgame-picker";
    picker.setAttribute("role", "dialog");
    picker.setAttribute("aria-modal", "true");
    picker.setAttribute("aria-label", "Choose a mini-game");
    picker.innerHTML =
      '<div class="kvgame__box kvgame-picker__box">' +
        '<div class="kvgame__bar">' +
          '<span class="kvgame__title">Pick a game</span>' +
          '<button type="button" class="kvgame__close kvgame-picker__close" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="kvgame-picker__grid">' +
          '<button type="button" class="kvgame-picker__card" data-game="sky">' +
            '<span class="kvgame-picker__name">Sky Glide</span>' +
            '<span class="kvgame-picker__desc">Fly like Sky Peck — wings, rings, optional webcam body control</span>' +
          '</button>' +
          '<button type="button" class="kvgame-picker__card" data-game="flap">' +
            '<span class="kvgame-picker__name">Web Swing</span>' +
            '<span class="kvgame-picker__desc">Classic flap through the city — space / tap</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(picker);

    picker.querySelector(".kvgame-picker__close").addEventListener("click", closePicker);
    picker.addEventListener("click", function (e) {
      if (e.target === picker) closePicker();
    });
    picker.querySelector('[data-game="sky"]').addEventListener("click", function () {
      closePicker();
      if (window.KVSkyGlide) KVSkyGlide.open();
    });
    picker.querySelector('[data-game="flap"]').addEventListener("click", function () {
      closePicker();
      if (window.__kvGame) __kvGame.open();
    });
  }

  function openPicker() {
    if (!picker) buildPicker();
    picker.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  }

  function closePicker() {
    if (picker) picker.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  function registerTrigger(el) {
    if (!el) return;
    el.addEventListener("click", function (e) {
      var now = Date.now();
      clicks = now - lastClick < CLICK_WINDOW ? clicks + 1 : 1;
      lastClick = now;
      if (clicks >= TRIGGER_CLICKS) {
        clicks = 0;
        e.preventDefault();
        openPicker();
      }
    });
  }

  registerTrigger(document.querySelector(".nav__brand"));
  registerTrigger(document.getElementById("footer-egg"));

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && picker && !picker.hasAttribute("hidden")) closePicker();
  });

  window.KVGameLauncher = { open: openPicker, close: closePicker };
})();
