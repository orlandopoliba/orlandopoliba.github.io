import { initModeSlide } from "./scripts/modeStats.js";
import { initMeanSlide } from "./scripts/meanStats.js";
import { initVarianceSlide } from "./scripts/varianceStats.js";
import { initQuartilesSlide } from "./scripts/quartilesStats.js";

import { applyRevealMobileGuards } from "../../common/mobileReveal.js";

applyRevealMobileGuards();

Reveal.initialize({
  hash: true,
  controls: true,
  progress: true,
  touch: true,
  plugins: [RevealMarkdown, RevealMath.KaTeX]
});

const runSlideInits = () => {
  initModeSlide();
  initMeanSlide();
  initVarianceSlide();
  initQuartilesSlide();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
