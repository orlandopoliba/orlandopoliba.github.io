import { initFrequencyTable } from "./scripts/frequencyTable.js";
import { initClassIntervalsChart } from "./scripts/classIntervals.js";

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
  initFrequencyTable();
  initClassIntervalsChart();
};

const runDeckInits = () => {
  runSlideInits();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
