const SAMPLE_SIZE = 30;
const NORMAL_MEAN = 10;
const NORMAL_STD_DEV = 1;
const RNG_SEED = 20260222;
const DEFAULT_DISPERSION = 1;
const DEFAULT_TARGET_MEAN = NORMAL_MEAN;
const DEFAULT_GRAPH_X_MIN = 0;
const DEFAULT_GRAPH_X_MAX = 14;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

const getSample = (chart) => {
  const stored = parseStoredSample(chart.dataset.varianceSample);
  if (stored) {
    return stored;
  }
  const sample = buildNormalSample(SAMPLE_SIZE, NORMAL_MEAN, NORMAL_STD_DEV, RNG_SEED)
    .map((value) => Number(value.toFixed(3)));
  chart.dataset.varianceSample = JSON.stringify(sample);
  return sample;
};

const computeMean = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
};

const buildTransformedValues = (centeredValues, targetMean, dispersion) => {
  if (!Array.isArray(centeredValues) || centeredValues.length === 0) {
    return [];
  }
  const factor = Number.isFinite(dispersion) && dispersion > 0
    ? dispersion
    : DEFAULT_DISPERSION;
  const mean = Number.isFinite(targetMean) ? targetMean : DEFAULT_TARGET_MEAN;
  return centeredValues.map((value) => mean + (value * factor));
};

const computeSampleVariance = (values) => {
  if (!Array.isArray(values) || values.length < 2) {
    return null;
  }
  const mean = computeMean(values);
  if (!Number.isFinite(mean)) {
    return null;
  }
  const squaredDiffSum = values.reduce(
    (total, value) => total + ((value - mean) ** 2),
    0
  );
  return squaredDiffSum / (values.length - 1);
};

const renderVarianceFormula = (formulaEl, variance) => {
  if (!formulaEl || !Number.isFinite(variance)) {
    return;
  }
  const varianceText = variance.toFixed(3);
  const latex = `s_x^2 = \\frac{1}{n-1} \\sum_{i=1}^{n} (x_i - \\bar{x})^2 = ${varianceText}`;
  if (window.katex && typeof window.katex.render === "function") {
    window.katex.render(latex, formulaEl, {
      displayMode: true,
      throwOnError: false
    });
    return;
  }
  formulaEl.textContent = `s_x^2 = 1/(n-1) * sum((x_i - x̄)^2) = ${varianceText}`;
};

const renderMeanFormula = (formulaEl, mean) => {
  if (!formulaEl || !Number.isFinite(mean)) {
    return;
  }
  const meanText = mean.toFixed(3);
  const latex = `\\bar{x} = \\frac{1}{n} \\sum_{i=1}^{n} x_i = ${meanText}`;
  if (window.katex && typeof window.katex.render === "function") {
    window.katex.render(latex, formulaEl, {
      displayMode: true,
      throwOnError: false
    });
    return;
  }
  formulaEl.textContent = `x̄ = (1/n) * sum(x_i) = ${meanText}`;
};

const getGraphRange = (chart) => {
  const xMinRaw = Number(chart?.dataset?.varianceXMin);
  const xMaxRaw = Number(chart?.dataset?.varianceXMax);
  const xMin = Number.isFinite(xMinRaw) ? xMinRaw : DEFAULT_GRAPH_X_MIN;
  const xMax = Number.isFinite(xMaxRaw) ? xMaxRaw : DEFAULT_GRAPH_X_MAX;
  if (xMax <= xMin) {
    return {
      xMin: DEFAULT_GRAPH_X_MIN,
      xMax: DEFAULT_GRAPH_X_MAX
    };
  }
  return { xMin, xMax };
};

const updateMeanIndicator = (indicator, slider) => {
  if (!indicator || !slider) {
    return;
  }
  const min = Number(slider.min);
  const max = Number(slider.max);
  const value = Number(slider.value);
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(value) || max <= min) {
    indicator.style.left = "50%";
    return;
  }
  const percent = ((value - min) / (max - min)) * 100;
  indicator.style.left = `${clamp(percent, 0, 100)}%`;
};

const renderVarianceLine = (chart, values, meanValue, fixedRange = null) => {
  if (!window.Plotly) {
    return;
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = 0.8;
  const xMin = fixedRange && Number.isFinite(fixedRange.xMin)
    ? fixedRange.xMin
    : minValue - padding;
  const xMax = fixedRange && Number.isFinite(fixedRange.xMax)
    ? fixedRange.xMax
    : maxValue + padding;
  const yValues = values.map(() => 0);

  const plotHeight = 260;
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(260, Math.round(chart.clientWidth));

  const data = [
    {
      x: values,
      y: yValues,
      type: "scatter",
      mode: "markers",
      marker: {
        size: 12,
        color: "#2e6f8e",
        line: {
          color: "#1f4c62",
          width: 1
        }
      },
      hoverinfo: "skip"
    },
    {
      x: [meanValue],
      y: [0],
      type: "scatter",
      mode: "markers",
      marker: {
        size: 14,
        color: "#b84b4b",
        line: {
          color: "#7f3131",
          width: 1
        }
      },
      hoverinfo: "skip"
    }
  ];

  const layout = {
    margin: { t: 20, r: 20, b: 55, l: 20 },
    height: plotHeight,
    width: plotWidth,
    autosize: false,
    xaxis: {
      range: [xMin, xMax],
      tick0: Math.floor(xMin),
      dtick: 1,
      showgrid: false,
      zeroline: false,
      showline: false,
      ticks: "",
      fixedrange: true
    },
    yaxis: {
      range: [-0.01, 0.1],
      showgrid: false,
      zeroline: false,
      showline: false,
      showticklabels: false,
      fixedrange: true
    },
    shapes: [
      {
        type: "line",
        x0: xMin,
        x1: xMax,
        y0: 0,
        y1: 0,
        line: {
          color: "#3f3f3f",
          width: 2
        }
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

export const initVarianceSlide = () => {
  const chart = document.querySelector("[data-variance-line-chart]");
  const meanFormulaEl = document.querySelector("[data-mean-formula]");
  const formulaEl = document.querySelector("[data-variance-formula]");
  const meanSlider = document.getElementById("variance-mean-slider");
  const meanIndicator = document.querySelector("[data-variance-mean-indicator]");
  const dispersionSlider = document.getElementById("variance-dispersion-slider");
  if (!chart) {
    return;
  }

  const baseValues = getSample(chart);
  const baseMean = computeMean(baseValues);
  const centeredValues = Number.isFinite(baseMean)
    ? baseValues.map((value) => value - baseMean)
    : [];
  const fixedRange = getGraphRange(chart);

  const update = () => {
    const targetMean = meanSlider
      ? Number(meanSlider.value)
      : DEFAULT_TARGET_MEAN;
    const dispersion = dispersionSlider
      ? Number(dispersionSlider.value)
      : DEFAULT_DISPERSION;
    const transformedValues = buildTransformedValues(centeredValues, targetMean, dispersion);
    const sampleMean = computeMean(transformedValues);
    const sampleVariance = computeSampleVariance(transformedValues);
    renderMeanFormula(meanFormulaEl, sampleMean);
    renderVarianceFormula(formulaEl, sampleVariance);
    updateMeanIndicator(meanIndicator, meanSlider);
    renderVarianceLine(chart, transformedValues, sampleMean, fixedRange);
  };

  if (meanSlider && meanSlider.dataset.bound !== "true") {
    meanSlider.addEventListener("input", update);
    meanSlider.dataset.bound = "true";
  }

  if (dispersionSlider && dispersionSlider.dataset.bound !== "true") {
    dispersionSlider.addEventListener("input", update);
    dispersionSlider.dataset.bound = "true";
  }

  update();
};
