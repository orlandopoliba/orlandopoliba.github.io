import { initPoissonBar } from "./scripts/poissonBarDiagram.js";
import { initPoissonLimit } from "./scripts/poissonBinomialLimit.js";
import { initPoissonSimulation } from "./scripts/poissonSimulation.js";
import { initPoissonStats } from "./scripts/poissonStats.js";

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
  initPoissonBar();
  initPoissonLimit();
  initPoissonSimulation();
  initPoissonStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
