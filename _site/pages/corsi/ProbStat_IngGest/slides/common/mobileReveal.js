const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "label",
  "select",
  "textarea",
  "summary",
  "[contenteditable=\"true\"]",
  "[draggable=\"true\"]",
  ".js-plotly-plot",
  ".variable-item",
  ".variable-list",
  ".drop-list",
  ".frequency-data-list"
].join(", ");

const REVEAL_UI_SELECTOR = [
  ".reveal .controls",
  ".reveal .progress",
  ".reveal .slide-number"
].join(", ");

const isInteractiveTarget = (target) => {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.closest(REVEAL_UI_SELECTOR)) {
    return false;
  }

  return Boolean(target.closest(INTERACTIVE_SELECTOR));
};

const stopSwipePropagation = (event) => {
  if (!isInteractiveTarget(event.target)) {
    return;
  }

  event.stopPropagation();
};

let guardsInstalled = false;

export const applyRevealMobileGuards = (root = document) => {
  if (!guardsInstalled) {
    window.addEventListener("pointermove", stopSwipePropagation, true);
    window.addEventListener("touchmove", stopSwipePropagation, {
      capture: true,
      passive: true
    });
    guardsInstalled = true;
  }

  root.querySelectorAll(INTERACTIVE_SELECTOR).forEach((element) => {
    if (element.closest(REVEAL_UI_SELECTOR)) {
      return;
    }

    element.setAttribute("data-prevent-swipe", "");
  });
};
