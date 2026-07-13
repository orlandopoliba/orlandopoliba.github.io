import { initCltSampleMeanLaw } from "./scripts/cltSampleMeanLaw.js";
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
  initCltSampleMeanLaw();
  applyRevealMobileGuards();
};

Reveal.on("ready", runDeckInits);
Reveal.on("slidechanged", runDeckInits);
