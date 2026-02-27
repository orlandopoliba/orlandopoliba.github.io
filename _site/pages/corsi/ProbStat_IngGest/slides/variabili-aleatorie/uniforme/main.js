import { initUniformTitleDensity } from "./scripts/uniformTitleDensity.js";
import { initUniformSimulation } from "./scripts/uniformSimulation.js";
import { initUniformProbability } from "./scripts/uniformProbability.js";
import { initUniformStats } from "./scripts/uniformStats.js";

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
  initUniformTitleDensity();
  initUniformSimulation();
  initUniformProbability();
  initUniformStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
