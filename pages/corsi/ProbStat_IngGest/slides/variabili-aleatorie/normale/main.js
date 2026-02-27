import { initNormalTitleDensity } from "./scripts/normalTitleDensity.js";
import { initNormalSimulation } from "./scripts/normalSimulation.js";
import { initNormalProbability } from "./scripts/normalProbability.js";
import { initNormalStats } from "./scripts/normalStats.js";

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
  initNormalTitleDensity();
  initNormalSimulation();
  initNormalProbability();
  initNormalStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
