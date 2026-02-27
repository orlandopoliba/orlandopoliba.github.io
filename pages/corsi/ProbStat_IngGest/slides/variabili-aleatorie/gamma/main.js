import { initGammaTitleDensity } from "./scripts/gammaTitleDensity.js";
import { initGammaSimulation } from "./scripts/gammaSimulation.js";
import { initGammaProbability } from "./scripts/gammaProbability.js";
import { initGammaStats } from "./scripts/gammaStats.js";

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
  initGammaTitleDensity();
  initGammaSimulation();
  initGammaProbability();
  initGammaStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
