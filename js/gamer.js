/* Gaming page: the SVG gamer follows the cursor. Every part is a separate element with an id,
   so more cursor-driven animation can be hung off the same parts later. */
(function () {
  "use strict";

  var svg = document.getElementById("gamer");
  if (!svg) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var part = function (id) { return document.getElementById(id); };
  var head = part("g-head");
  var pupils = part("g-pupils");
  var brows = part("g-brows");
  var armLeft = part("g-arm-left");
  var armRight = part("g-arm-right");
  var lids = part("g-lids");

  // Pointer position as -1..1 from the middle of the stage.
  var aimX = 0;
  var aimY = 0;
  var atX = 0;
  var atY = 0;
  var raf = 0;

  function onPointer(event) {
    var box = svg.getBoundingClientRect();
    aimX = Math.max(-1, Math.min(1, (event.clientX - (box.left + box.width / 2)) / (box.width / 2)));
    aimY = Math.max(-1, Math.min(1, (event.clientY - (box.top + box.height / 2)) / (box.height / 2)));
    start();
  }

  function frame() {
    raf = 0;
    atX += (aimX - atX) * 0.12;
    atY += (aimY - atY) * 0.12;

    if (head) head.setAttribute("transform", "translate(" + (atX * 7).toFixed(2) + " " + (atY * 5).toFixed(2) + ") rotate(" + (atX * 5).toFixed(2) + ")");
    if (pupils) pupils.setAttribute("transform", "translate(" + (atX * 5).toFixed(2) + " " + (atY * 3.5).toFixed(2) + ")");
    if (brows) brows.setAttribute("transform", "translate(0 " + (atY * 2.5).toFixed(2) + ")");
    if (armLeft) armLeft.setAttribute("transform", "rotate(" + (atX * 6 - atY * 3).toFixed(2) + ")");
    if (armRight) armRight.setAttribute("transform", "rotate(" + (atX * 6 + atY * 3).toFixed(2) + ")");

    if (Math.abs(aimX - atX) > 0.001 || Math.abs(aimY - atY) > 0.001) start();
  }

  function start() {
    if (raf || reduceMotion) return;
    raf = window.requestAnimationFrame(frame);
  }

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerleave", function () {
    aimX = 0;
    aimY = 0;
    start();
  });

  /* Blink: squash the lids for a moment, at a human-ish random interval. */
  if (lids && !reduceMotion) {
    (function blink() {
      window.setTimeout(function () {
        lids.setAttribute("transform", "scale(1 0.08)");
        window.setTimeout(function () { lids.setAttribute("transform", "scale(1 1)"); }, 110);
        blink();
      }, 2200 + Math.random() * 3800);
    })();
  }

  /* Copy the Valorant ID. */
  var copy = document.querySelector("[data-copy-id]");
  if (copy && navigator.clipboard) {
    copy.addEventListener("click", function () {
      navigator.clipboard.writeText(copy.getAttribute("data-copy-id")).then(function () {
        var original = copy.textContent;
        copy.textContent = "Copied";
        window.setTimeout(function () { copy.textContent = original; }, 1600);
      }).catch(function () {});
    });
  }
})();
