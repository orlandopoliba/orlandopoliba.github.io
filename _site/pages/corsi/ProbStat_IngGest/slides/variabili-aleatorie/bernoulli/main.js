import { initBernoulliBar } from "./scripts/bernoulliBarDiagram.js";
import { initCoin } from "./scripts/coin.js";
import { initBernoulliSimulation } from "./scripts/bernoulliSimulation.js";
import { initBernoulliStats } from "./scripts/bernoulliStats.js";

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
  initBernoulliBar();
  initCoin();
  initBernoulliSimulation();
  initBernoulliStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
