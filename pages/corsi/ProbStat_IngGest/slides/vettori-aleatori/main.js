import { initJointMarginalsSampling } from "./scripts/jointMarginalsSampling.js";
import { initRandomVectorSampling } from "./scripts/randomVectorSampling.js";
import { applyRevealMobileGuards } from "../common/mobileReveal.js";

applyRevealMobileGuards();

Reveal.initialize({
  hash: true,
  controls: true,
  progress: true,
  touch: true,
  plugins: [RevealMarkdown, RevealMath.KaTeX]
});

const runDeckInits = () => {
  initJointMarginalsSampling();
  initRandomVectorSampling();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
