/* Lottie accents — web player (lottie-android is native; site uses lottie-player) */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var ACCENTS = [
    { sel: "[data-lottie-hero]", src: "https://assets2.lottiefiles.com/packages/lf20_xyadps.json" },
    { sel: "[data-lottie-work]", src: "https://assets9.lottiefiles.com/packages/lf20_myejiggj.json" },
    { sel: "[data-lottie-contact]", src: "https://assets4.lottiefiles.com/packages/lf20_uu0x8lqv.json" }
  ];

  function mountPlayers() {
    if (!window.customElements || !customElements.get("lottie-player")) return;

    ACCENTS.forEach(function (item) {
      var host = document.querySelector(item.sel);
      if (!host || host.querySelector("lottie-player")) return;

      var player = document.createElement("lottie-player");
      player.setAttribute("src", item.src);
      player.setAttribute("background", "transparent");
      player.setAttribute("speed", "0.85");
      player.setAttribute("loop", "");
      player.setAttribute("autoplay", "");
      player.setAttribute("aria-hidden", "true");
      host.appendChild(player);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        pauseAll(true);
      } else {
        pauseAll(false);
      }
    });
  }

  function pauseAll(pause) {
    Array.prototype.slice.call(document.querySelectorAll("lottie-player")).forEach(function (p) {
      try {
        if (pause && p.pause) p.pause();
        else if (!pause && p.play) p.play();
      } catch (e) {}
    });
  }

  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  if (customElements.get("lottie-player")) {
    mountPlayers();
  } else {
    loadScript("https://unpkg.com/@lottiefiles/lottie-player@2.0.4/dist/lottie-player.js", mountPlayers);
  }
})();
