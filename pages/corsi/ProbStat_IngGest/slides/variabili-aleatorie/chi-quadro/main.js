import { initChiSqTitleDensity } from "./scripts/chisqTitleDensity.js";
import { initChiSqSimulation } from "./scripts/chisqSimulation.js";
import { initChiSqProbability } from "./scripts/chisqProbability.js";
import { initChiSqStats } from "./scripts/chisqStats.js";

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
  initChiSqTitleDensity();
  initChiSqSimulation();
  initChiSqProbability();
  initChiSqStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
