/* Turns on gentle reveal animations before first paint (loaded in <head>).
   - Skipped entirely for visitors who prefer reduced motion.
   - Safety net: if main.js hasn't started within 3s, animations are switched
     off so every bit of content stays visible. Without JS, nothing is hidden. */
(function (h) {
  if (!window.matchMedia || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  h.classList.add("motion");
  setTimeout(function () { if (!window.__littleArrows) h.classList.remove("motion"); }, 3000);
})(document.documentElement);
