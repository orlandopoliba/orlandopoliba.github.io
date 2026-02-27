import { initBinomialBar } from "./scripts/binomialBarDiagram.js";
import { initBinomialCoins } from "./scripts/binomialCoins.js";
import { initBinomialSimulation } from "./scripts/binomialSimulation.js";
import { initBinomialStats } from "./scripts/binomialStats.js";

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
  initBinomialBar();
  initBinomialCoins();
  initBinomialSimulation();
  initBinomialStats();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
