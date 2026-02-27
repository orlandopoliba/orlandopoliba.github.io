import { initExponentialDensity } from "./scripts/exponentialDensity.js";
import { initExponentialTitleDensity } from "./scripts/exponentialTitleDensity.js";
import { initExponentialSimulation } from "./scripts/exponentialSimulation.js";
import { initExponentialStats } from "./scripts/exponentialStats.js";

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
  initExponentialTitleDensity();
  initExponentialDensity();
  initExponentialSimulation();
  initExponentialStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
