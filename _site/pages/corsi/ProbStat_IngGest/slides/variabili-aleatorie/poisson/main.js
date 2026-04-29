import { initPoissonBar } from "./scripts/poissonBarDiagram.js";
import { initPoissonLimit } from "./scripts/poissonBinomialLimit.js";
import { initPoissonSimulation } from "./scripts/poissonSimulation.js";
import { initPoissonSumSimulation } from "./scripts/poissonSumSimulation.js";
import { initPoissonTaylorExponential } from "./scripts/poissonTaylorExponential.js";
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
  initPoissonTaylorExponential();
  initPoissonLimit();
  initPoissonSimulation();
  initPoissonSumSimulation();
  initPoissonStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
