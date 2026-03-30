const SVG_NS = "http://www.w3.org/2000/svg";
const GRID_SIZE = 10;
const MARGIN = 35;
const SQUARE_SIZE = 360;
const CELL_SIZE = SQUARE_SIZE / GRID_SIZE;
const DOT_RADIUS = 11;
const EVENT_LABEL_OFFSET_Y = 16;
const EVENT_B_BACKGROUND_FILL = "#f0e7c0";
const EVENT_B_COMPLEMENT_BACKGROUND_FILL = "#ffffff";
const PROBABILITY_B_CARD_BACKGROUND_FILL = EVENT_B_BACKGROUND_FILL;
const EVENT_A_DOT_FILL = "#f56111";
const EVENT_NOT_A_DOT_FILL = "#80aabd";

const createSvgNode = (tagName, attributes = {}) => {
  const node = document.createElementNS(SVG_NS, tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });

  return node;
};

const renderMath = (element, expression, displayMode = false) => {
  if (!element) {
    return;
  }

  if (window.katex) {
    window.katex.render(expression, element, {
      throwOnError: false,
      displayMode
    });
    return;
  }

  element.textContent = expression;
};

const formatProbability = (value) => value.toFixed(2);

const appendEventLabel = (svg, x, y, textContent) => {
  const label = createSvgNode("text", {
    x,
    y,
    "text-anchor": "middle",
    "font-size": 24,
    "font-style": "italic",
    fill: "#1f1f1f"
  });
  label.textContent = textContent;
  svg.appendChild(label);
};

const readState = (elements) => {
  const b1 = Number(elements.b1Slider.value) / 10;
  const aGivenB1 = Number(elements.aGivenB1Slider.value) / 10;
  const aGivenB2 = Number(elements.aGivenB2Slider.value) / 10;

  return {
    b1,
    b2: 1 - b1,
    aGivenB1,
    aGivenB2
  };
};

const drawSampleSpace = (svg, state) => {
  const b1Columns = Math.round(state.b1 * GRID_SIZE);
  const aGivenB1Rows = Math.round(state.aGivenB1 * GRID_SIZE);
  const aGivenB2Rows = Math.round(state.aGivenB2 * GRID_SIZE);
  const xBoundary = MARGIN + b1Columns * CELL_SIZE;
  const yLeftBoundary = MARGIN + (GRID_SIZE - aGivenB1Rows) * CELL_SIZE;
  const yRightBoundary = MARGIN + (GRID_SIZE - aGivenB2Rows) * CELL_SIZE;

  svg.replaceChildren();

  svg.appendChild(createSvgNode("rect", {
    x: MARGIN,
    y: MARGIN,
    width: b1Columns * CELL_SIZE,
    height: SQUARE_SIZE,
    fill: EVENT_B_BACKGROUND_FILL
  }));

  svg.appendChild(createSvgNode("rect", {
    x: xBoundary,
    y: MARGIN,
    width: (GRID_SIZE - b1Columns) * CELL_SIZE,
    height: SQUARE_SIZE,
    fill: EVENT_B_COMPLEMENT_BACKGROUND_FILL
  }));

  svg.appendChild(createSvgNode("rect", {
    x: MARGIN,
    y: MARGIN,
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    fill: "none",
    stroke: "#383838",
    "stroke-width": 3
  }));

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const inB1 = col < b1Columns;
      const isRed = inB1
        ? row >= GRID_SIZE - aGivenB1Rows
        : row >= GRID_SIZE - aGivenB2Rows;

      svg.appendChild(createSvgNode("circle", {
        cx: MARGIN + (col + 0.5) * CELL_SIZE,
        cy: MARGIN + (row + 0.5) * CELL_SIZE,
        r: DOT_RADIUS,
        fill: isRed ? EVENT_A_DOT_FILL : EVENT_NOT_A_DOT_FILL,
        stroke: isRed ? EVENT_A_DOT_FILL : EVENT_NOT_A_DOT_FILL,
        "stroke-width": 2
      }));
    }
  }

  svg.appendChild(createSvgNode("line", {
    x1: xBoundary,
    y1: MARGIN,
    x2: xBoundary,
    y2: MARGIN + SQUARE_SIZE,
    stroke: "#1f1f1f",
    "stroke-width": 3
  }));

  svg.appendChild(createSvgNode("line", {
    x1: MARGIN,
    y1: yLeftBoundary,
    x2: xBoundary,
    y2: yLeftBoundary,
    stroke: "#1f1f1f",
    "stroke-width": 3
  }));

  svg.appendChild(createSvgNode("line", {
    x1: xBoundary,
    y1: yRightBoundary,
    x2: MARGIN + SQUARE_SIZE,
    y2: yRightBoundary,
    stroke: "#1f1f1f",
    "stroke-width": 3
  }));

  const leftCenter = MARGIN + (b1Columns * CELL_SIZE) / 2;
  const rightCenter = xBoundary + ((GRID_SIZE - b1Columns) * CELL_SIZE) / 2;

  appendEventLabel(svg, leftCenter, MARGIN - EVENT_LABEL_OFFSET_Y, "B");
  appendEventLabel(svg, rightCenter, MARGIN - EVENT_LABEL_OFFSET_Y, "Ω ∖ B");
};

const renderResultFormula = (elements, state, formulaKind) => {
  const totalProbability = state.aGivenB1 * state.b1 + state.aGivenB2 * state.b2;
  const bayesProbability = (state.aGivenB1 * state.b1) / totalProbability;

  renderMath(elements.b1Formula, `\\mathbb{P}(B) = ${formatProbability(state.b1)}`);
  renderMath(elements.aGivenB1Formula, `\\mathbb{P}(A\\mid B) = ${formatProbability(state.aGivenB1)}`);
  renderMath(elements.aGivenB2Formula, `\\mathbb{P}(A\\mid \\Omega \\setminus B) = ${formatProbability(state.aGivenB2)}`);

  if (formulaKind === "bayes") {
    renderMath(
      elements.totalFormula,
      `\\begin{aligned}
\\mathbb{P}(B\\mid A) &= \\frac{\\mathbb{P}(A\\mid B) \\cdot \\mathbb{P}(B)}{\\mathbb{P}(A)}
= \\frac{${formatProbability(state.aGivenB1)} \\cdot ${formatProbability(state.b1)}}{${formatProbability(totalProbability)}} = ${formatProbability(bayesProbability)}
\\end{aligned}`,
      true
    );
  } else {
    renderMath(
      elements.totalFormula,
      `\\begin{aligned}
\\mathbb{P}(A) &= \\mathbb{P}(A\\mid B) \\cdot \\mathbb{P}(B) + \\mathbb{P}(A\\mid \\Omega \\setminus B) \\cdot \\mathbb{P}(\\Omega \\setminus B) \\\\
&= ${formatProbability(state.aGivenB1)} \\cdot ${formatProbability(state.b1)} + ${formatProbability(state.aGivenB2)} \\cdot ${formatProbability(state.b2)} = ${formatProbability(totalProbability)}
\\end{aligned}`,
      true
    );
  }

  elements.b1Percent.textContent = `${Math.round(state.b1 * 100)}%`;
  elements.aGivenB1Percent.textContent = `${Math.round(state.aGivenB1 * 100)}%`;
  elements.aGivenB2Percent.textContent = `${Math.round(state.aGivenB2 * 100)}%`;
};

const renderProbabilityDemo = (elements, formulaKind) => {
  const state = readState(elements);
  drawSampleSpace(elements.svg, state);
  renderResultFormula(elements, state, formulaKind);
};

export const initTotalProbability = () => {
  const roots = document.querySelectorAll(".probability-demo");

  roots.forEach((root) => {
    const svg = root.querySelector('[data-role="grid"]');
    const b1Slider = root.querySelector('[data-role="prob-b-slider"]');
    const aGivenB1Slider = root.querySelector('[data-role="prob-a-given-b-slider"]');
    const aGivenB2Slider = root.querySelector('[data-role="prob-a-given-b-complement-slider"]');
    const b1Formula = root.querySelector('[data-role="prob-b-formula"]');
    const aGivenB1Formula = root.querySelector('[data-role="prob-a-given-b-formula"]');
    const aGivenB2Formula = root.querySelector('[data-role="prob-a-given-b-complement-formula"]');
    const totalFormula = root.querySelector('[data-role="result-formula"]');
    const b1Percent = root.querySelector('[data-role="prob-b-percent"]');
    const aGivenB1Percent = root.querySelector('[data-role="prob-a-given-b-percent"]');
    const aGivenB2Percent = root.querySelector('[data-role="prob-a-given-b-complement-percent"]');
    const b1Card = b1Formula ? b1Formula.closest(".control-block") : null;
    const formulaKind = root.dataset.formulaKind || "total";

    if (
      !svg
      || !b1Slider
      || !aGivenB1Slider
      || !aGivenB2Slider
      || !b1Formula
      || !aGivenB1Formula
      || !aGivenB2Formula
      || !totalFormula
      || !b1Percent
      || !aGivenB1Percent
      || !aGivenB2Percent
      || !b1Card
    ) {
      return;
    }

    const elements = {
      svg,
      b1Slider,
      aGivenB1Slider,
      aGivenB2Slider,
      b1Formula,
      aGivenB1Formula,
      aGivenB2Formula,
      totalFormula,
      b1Percent,
      aGivenB1Percent,
      aGivenB2Percent,
      b1Card
    };

    if (root.dataset.bound !== "true") {
      const rerender = () => {
        renderProbabilityDemo(elements, formulaKind);
      };

      b1Slider.addEventListener("input", rerender);
      aGivenB1Slider.addEventListener("input", rerender);
      aGivenB2Slider.addEventListener("input", rerender);
      root.dataset.bound = "true";
    }

    b1Card.style.backgroundColor = PROBABILITY_B_CARD_BACKGROUND_FILL;
    renderProbabilityDemo(elements, formulaKind);
  });
};
