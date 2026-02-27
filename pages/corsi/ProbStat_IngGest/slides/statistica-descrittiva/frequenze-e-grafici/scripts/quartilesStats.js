const SAMPLE_SIZE = 30;
const NORMAL_MEAN = 7;
const NORMAL_STD_DEV = 1;
const RNG_SEED = 20260223;
const DEFAULT_X_MIN = 0;
const DEFAULT_X_MAX = 14;
const FORCED_ANOMALY_VALUE = 14.25;

const BOX_STYLE = {
  fillColor: "rgba(46, 111, 142, 0.22)",
  lineColor: "#2e6f8e",
  lineWidth: 2,
  whiskerWidth: 2
};

const BASELINE_Y = 0;
const POINT_SIZE = 12;
const BOX_CENTER_Y = 0.22;
const BOX_HEIGHT = 0.14;
const WHISKER_CAP_HALF = 0.04;
const Y_MIN = -0.08;
const Y_MAX = 0.36;
const OUTLIER_MARGIN_MIN = 0.05;
const OUTLIER_MARGIN_RATIO = 0.08;

const createSeededRng = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const sampleNormal = (rng, mean, stdDev) => {
  let u1 = 0;
  let u2 = 0;
  while (u1 <= Number.EPSILON) {
    u1 = rng();
  }
  while (u2 <= Number.EPSILON) {
    u2 = rng();
  }
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z0;
};

const buildNormalSample = (size, mean, stdDev, seed) => {
  const rng = createSeededRng(seed);
  return Array.from({ length: size }, () => sampleNormal(rng, mean, stdDev));
};

const parseStoredSample = (value) => {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const values = parsed.map((item) => Number(item));
    return values.every(Number.isFinite) ? values : null;
  } catch {
    return null;
  }
};

const quantileExclusive = (sortedValues, probability) => {
  if (!Array.isArray(sortedValues) || sortedValues.length === 0) {
    return null;
  }
  if (sortedValues.length === 1) {
    return sortedValues[0];
  }
  const n = sortedValues.length;
  const position = probability * (n + 1);
  if (position <= 1) {
    return sortedValues[0];
  }
  if (position >= n) {
    return sortedValues[n - 1];
  }
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const weight = position - lowerIndex;
  const lowerValue = sortedValues[lowerIndex - 1];
  const upperValue = sortedValues[upperIndex - 1];
  return lowerValue + ((upperValue - lowerValue) * weight);
};

const computeQuartileSummaryExclusive = (values) => {
  if (!Array.isArray(values) || values.length < 2) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantileExclusive(sorted, 0.25);
  const median = quantileExclusive(sorted, 0.5);
  const q3 = quantileExclusive(sorted, 0.75);
  if (!Number.isFinite(q1) || !Number.isFinite(median) || !Number.isFinite(q3)) {
    return null;
  }
  const iqr = q3 - q1;
  const lowerFence = q1 - (1.5 * iqr);
  const upperFence = q3 + (3 * iqr);
  const inlierValues = sorted.filter((value) => value >= lowerFence && value <= upperFence);
  const lowerWhisker = inlierValues.length > 0 ? inlierValues[0] : q1;
  const upperWhisker = inlierValues.length > 0 ? inlierValues[inlierValues.length - 1] : q3;
  return {
    sorted,
    min: sorted[0],
    q1,
    median,
    q3,
    max: sorted[sorted.length - 1],
    iqr,
    lowerFence,
    upperFence,
    lowerWhisker,
    upperWhisker
  };
};

const forceExtremesByQuartileFences = (values) => {
  if (!Array.isArray(values) || values.length < 2) {
    return [];
  }

  const rounded = values
    .map((value) => Number(value.toFixed(3)))
    .sort((a, b) => a - b);

  const baseSummary = computeQuartileSummaryExclusive(rounded);
  if (!baseSummary) {
    return rounded;
  }

  const margin = Math.max(OUTLIER_MARGIN_MIN, Math.abs(baseSummary.iqr) * OUTLIER_MARGIN_RATIO);
  let suspectValue = baseSummary.q1 - (1.5 * baseSummary.iqr) - margin;
  let anomalyValue = FORCED_ANOMALY_VALUE;

  const forced = [...baseSummary.sorted];
  forced[0] = suspectValue;
  forced[forced.length - 1] = anomalyValue;

  if (forced[0] >= forced[1]) {
    forced[0] = forced[1] - margin;
  }
  if (forced[forced.length - 1] <= forced[forced.length - 2]) {
    forced[forced.length - 1] = forced[forced.length - 2] + margin;
  }

  const finalSummary = computeQuartileSummaryExclusive(forced);
  if (finalSummary) {
    const lowerFence = finalSummary.q1 - (1.5 * finalSummary.iqr);
    const upperFence = finalSummary.q3 + (3 * finalSummary.iqr);

    if (!(forced[0] < lowerFence)) {
      forced[0] = lowerFence - margin;
    }
    if (!(forced[forced.length - 1] > upperFence)) {
      forced[forced.length - 1] = upperFence + margin;
    }

    if (forced[0] >= forced[1]) {
      forced[0] = forced[1] - margin;
    }
    if (forced[forced.length - 1] <= forced[forced.length - 2]) {
      forced[forced.length - 1] = forced[forced.length - 2] + margin;
    }
  }

  return forced
    .map((value) => Number(value.toFixed(3)))
    .sort((a, b) => a - b);
};

const getSample = (chart) => {
  const stored = parseStoredSample(chart.dataset.quartileSample);
  const source = stored || buildNormalSample(SAMPLE_SIZE, NORMAL_MEAN, NORMAL_STD_DEV, RNG_SEED);
  const forcedSample = forceExtremesByQuartileFences(source);
  chart.dataset.quartileSample = JSON.stringify(forcedSample);
  return forcedSample;
};

const getGraphRange = (chart) => {
  const xMinRaw = Number(chart?.dataset?.quartileXMin);
  const xMaxRaw = Number(chart?.dataset?.quartileXMax);
  const xMin = Number.isFinite(xMinRaw) ? xMinRaw : DEFAULT_X_MIN;
  const xMax = Number.isFinite(xMaxRaw) ? xMaxRaw : DEFAULT_X_MAX;
  if (xMax <= xMin) {
    return { xMin: DEFAULT_X_MIN, xMax: DEFAULT_X_MAX };
  }
  return { xMin, xMax };
};

const getActiveValues = (buttons) => (
  buttons
    .filter((button) => !button.classList.contains("is-excluded"))
    .map((button) => Number(button.dataset.quartileValue))
    .filter((value) => Number.isFinite(value))
);

const buildQuartileGrid = (grid, values) => {
  grid.innerHTML = "";
  values.forEach((value) => {
    const button = document.createElement("button");
    button.className = "mode-item";
    button.type = "button";
    button.dataset.quartileValue = value.toString();
    button.textContent = value.toFixed(2);
    button.setAttribute("aria-pressed", "true");
    grid.appendChild(button);
  });
};

const isApproximatelyEqual = (value, target, epsilon = 1e-6) => Math.abs(value - target) <= epsilon;

const isValueActive = (values, target) => values.some((value) => isApproximatelyEqual(value, target));

const computeQ2Exclusive = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  return quantileExclusive(sorted, 0.5);
};

const renderQuartileQ2Formula = (formulaEl, q2Value) => {
  if (!formulaEl) {
    return;
  }
  if (!Number.isFinite(q2Value)) {
    formulaEl.textContent = "Q_2 = -";
    return;
  }
  const q2Text = q2Value.toFixed(3);
  const latex = `Q_2 = ${q2Text}`;
  if (window.katex && typeof window.katex.render === "function") {
    window.katex.render(latex, formulaEl, {
      displayMode: true,
      throwOnError: false
    });
    return;
  }
  formulaEl.textContent = `Q_2 = ${q2Text}`;
};

const buildBoxShapes = (summary) => {
  if (!summary) {
    return [];
  }
  const boxBottom = BOX_CENTER_Y - (BOX_HEIGHT / 2);
  const boxTop = BOX_CENTER_Y + (BOX_HEIGHT / 2);
  return [
    {
      type: "line",
      x0: summary.lowerWhisker,
      x1: summary.q1,
      y0: BOX_CENTER_Y,
      y1: BOX_CENTER_Y,
      line: { color: BOX_STYLE.lineColor, width: BOX_STYLE.whiskerWidth }
    },
    {
      type: "line",
      x0: summary.q3,
      x1: summary.upperWhisker,
      y0: BOX_CENTER_Y,
      y1: BOX_CENTER_Y,
      line: { color: BOX_STYLE.lineColor, width: BOX_STYLE.whiskerWidth }
    },
    {
      type: "line",
      x0: summary.lowerWhisker,
      x1: summary.lowerWhisker,
      y0: BOX_CENTER_Y - WHISKER_CAP_HALF,
      y1: BOX_CENTER_Y + WHISKER_CAP_HALF,
      line: { color: BOX_STYLE.lineColor, width: BOX_STYLE.lineWidth }
    },
    {
      type: "line",
      x0: summary.upperWhisker,
      x1: summary.upperWhisker,
      y0: BOX_CENTER_Y - WHISKER_CAP_HALF,
      y1: BOX_CENTER_Y + WHISKER_CAP_HALF,
      line: { color: BOX_STYLE.lineColor, width: BOX_STYLE.lineWidth }
    },
    {
      type: "rect",
      x0: summary.q1,
      x1: summary.q3,
      y0: boxBottom,
      y1: boxTop,
      line: { color: BOX_STYLE.lineColor, width: BOX_STYLE.lineWidth },
      fillcolor: BOX_STYLE.fillColor
    },
    {
      type: "line",
      x0: summary.median,
      x1: summary.median,
      y0: boxBottom,
      y1: boxTop,
      line: { color: BOX_STYLE.lineColor, width: BOX_STYLE.lineWidth }
    }
  ];
};

const renderQuartileChart = (chart, values, range, suspectValue, anomalyValue) => {
  if (!chart || !window.Plotly) {
    return;
  }

  const plotHeight = 220;
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(260, Math.round(chart.clientWidth));

  const hasValues = values.length > 0;
  const hasSuspectValue = Number.isFinite(suspectValue) && isValueActive(values, suspectValue);
  const hasAnomalyValue = Number.isFinite(anomalyValue) && isValueActive(values, anomalyValue);
  const summary = computeQuartileSummaryExclusive(values);

  const data = [];
  if (hasValues) {
    data.push({
      x: values,
      y: values.map(() => BASELINE_Y),
      type: "scatter",
      mode: "markers",
      marker: {
        size: POINT_SIZE,
        color: "#2e6f8e",
        line: {
          color: "#1f4c62",
          width: 1
        }
      },
      hoverinfo: "skip"
    });
  }

  if (hasSuspectValue) {
    data.push({
      x: [suspectValue],
      y: [BOX_CENTER_Y],
      type: "scatter",
      mode: "markers",
      marker: {
        symbol: "circle",
        size: 10,
        color: "#2e6f8e",
        line: {
          color: "#1f4c62",
          width: 1
        }
      },
      hoverinfo: "skip"
    });
  }

  if (hasAnomalyValue) {
    data.push({
      x: [anomalyValue],
      y: [BOX_CENTER_Y],
      type: "scatter",
      mode: "markers",
      marker: {
        symbol: "x",
        size: 12,
        color: "#b84b4b",
        line: {
          color: "#b84b4b",
          width: 2
        }
      },
      hoverinfo: "skip"
    });
  }

  const shapes = [
    {
      type: "line",
      x0: range.xMin,
      x1: range.xMax,
      y0: BASELINE_Y,
      y1: BASELINE_Y,
      line: {
        color: "#3f3f3f",
        width: 2
      }
    },
    ...buildBoxShapes(summary)
  ];

  const layout = {
    margin: { t: 8, r: 20, b: 52, l: 20 },
    height: plotHeight,
    width: plotWidth,
    autosize: false,
    xaxis: {
      range: [range.xMin, range.xMax],
      tick0: Math.floor(range.xMin),
      dtick: 1,
      showgrid: false,
      zeroline: false,
      showline: false,
      ticks: "",
      fixedrange: true
    },
    yaxis: {
      range: [Y_MIN, Y_MAX],
      showgrid: false,
      zeroline: false,
      showline: false,
      showticklabels: false,
      ticks: "",
      fixedrange: true
    },
    shapes,
    annotations: hasValues
      ? []
      : [
        {
          text: "Nessun dato attivo",
          x: (range.xMin + range.xMax) / 2,
          y: 0.5,
          xref: "x",
          yref: "paper",
          yanchor: "middle",
          showarrow: false,
          font: { size: 14, color: "#6a6a6a" }
        }
      ],
    showlegend: false,
    paper_bgcolor: "rgb(247, 247, 247)",
    plot_bgcolor: "rgb(247, 247, 247)"
  };

  Plotly.react(chart, data, layout, {
    displayModeBar: false,
    responsive: false,
    staticPlot: true
  });
};

export const initQuartilesSlide = () => {
  const chart = document.querySelector("[data-quartile-chart]");
  const grid = document.querySelector("[data-quartile-grid]");
  const q2FormulaEl = document.querySelector("[data-quartile-q2-formula]");
  if (!chart || !grid) {
    return;
  }

  const values = getSample(chart);
  const range = getGraphRange(chart);
  const suspectValue = values.length > 0 ? values[0] : null;
  const anomalyValue = values.length > 1 ? values[values.length - 1] : null;

  const update = () => {
    const buttons = Array.from(grid.querySelectorAll(".mode-item"));
    const activeValues = getActiveValues(buttons);
    const q2Value = computeQ2Exclusive(activeValues);
    renderQuartileQ2Formula(q2FormulaEl, q2Value);
    renderQuartileChart(chart, activeValues, range, suspectValue, anomalyValue);
  };

  if (grid.dataset.initialized === "true") {
    update();
    return;
  }

  buildQuartileGrid(grid, values);
  const buttons = Array.from(grid.querySelectorAll(".mode-item"));
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("is-excluded");
      button.setAttribute(
        "aria-pressed",
        button.classList.contains("is-excluded") ? "false" : "true"
      );
      update();
    });
  });

  grid.dataset.initialized = "true";
  update();
};
