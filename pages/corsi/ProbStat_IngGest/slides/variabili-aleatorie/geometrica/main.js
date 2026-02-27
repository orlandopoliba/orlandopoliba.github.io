import { initGeometricBar } from "./scripts/geometricBarDiagram.js";
import { initGeometricCoins } from "./scripts/geometricCoins.js";
import { initGeometricSimulation } from "./scripts/geometricSimulation.js";
import { initGeometricStats } from "./scripts/geometricStats.js";

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
  initGeometricBar();
  initGeometricCoins();
  initGeometricSimulation();
  initGeometricStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
