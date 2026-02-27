import { initTStudentTitleDensity } from "./scripts/tStudentTitleDensity.js";
import { initTStudentSimulation } from "./scripts/tStudentSimulation.js";
import { initTStudentProbability } from "./scripts/tStudentProbability.js";
import { initTStudentStats } from "./scripts/tStudentStats.js";

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
  initTStudentTitleDensity();
  initTStudentSimulation();
  initTStudentProbability();
  initTStudentStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
