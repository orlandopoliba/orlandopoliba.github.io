const SAMPLE_SIZE = 36;
const X_MIN = 1;
const X_MAX = 12;
const LINEAR_INTERCEPT = 2.4;
const LINEAR_SLOPE = 0.95;
const NEGATIVE_LINEAR_INTERCEPT = 13.4;
const NEGATIVE_LINEAR_SLOPE = -0.78;
const NON_LINEAR_INTERCEPT = 4.8;
const NON_LINEAR_AMPLITUDE = 2.7;
const NON_LINEAR_FREQUENCY = 0.75;
const EXP_LOG10_MIN = 0;
const EXP_LOG10_MAX = 4;
const EXP_LOG10_NOISE_STD_DEV = 0.06;
const EXP_TICK_VALUES = [1, 10, 100, 1000, 10000];
const UNCORRELATED_Y_MIN = 1.5;
const UNCORRELATED_Y_MAX = 12.5;
const NOISE_STD_DEV = 1.15;
const NOISE_STD_DEV_NON_LINEAR = 0.45;
const RNG_SEED_LINEAR = 20260224;
const RNG_SEED_LINEAR_NEGATIVE = 20260227;
const RNG_SEED_NON_LINEAR = 20260225;
const RNG_SEED_UNCORRELATED = 20260226;
const RNG_SEED_EXPONENTIAL = 20260228;
const REGRESSION_FIT_SAMPLE_SIZE = 28;
const REGRESSION_FIT_SEED = 20260229;
const REGRESSION_FIT_TRUE_SLOPE = 1.55;
const REGRESSION_FIT_TRUE_INTERCEPT = 1.65;
const REGRESSION_FIT_NOISE_STD_DEV = 0.95;
const REGRESSION_FIT_Y_MIN = 0;
const REGRESSION_FIT_Y_MAX = 25;
const LEAST_SQUARES_SURFACE_A_MIN = 0.2;
const LEAST_SQUARES_SURFACE_A_MAX = 2.6;
const LEAST_SQUARES_SURFACE_B_MIN = -1;
const LEAST_SQUARES_SURFACE_B_MAX = 5;
const LEAST_SQUARES_SURFACE_GRID_SIZE = 45;
const RHO_SAMPLE_SIZE = 220;
const RHO_SAMPLE_SEED = 20260230;
const RHO_AXIS_MIN = -3.4;
const RHO_AXIS_MAX = 3.4;
const FIREWORK_COLORS = ["#f25f5c", "#ffe066", "#70c1b3", "#247ba0", "#f7b267"];

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
  return mean + (stdDev * z0);
};

const normalizeRegressionChoice = (rawChoice) => {
  if (rawChoice === "non-linear" || rawChoice === "nonlinear") {
    return "non-linear";
  }
  if (rawChoice === "none" || rawChoice === "uncorrelated") {
    return "none";
  }
  return "linear";
};

const buildXValues = (rng) => (
  Array.from({ length: SAMPLE_SIZE }, (_, index) => {
    const base = X_MIN + ((index / (SAMPLE_SIZE - 1)) * (X_MAX - X_MIN));
    const jitter = sampleNormal(rng, 0, 0.18);
    return Number((base + jitter).toFixed(3));
  }).sort((a, b) => a - b)
);

const sampleUniform = (rng, min, max) => min + (rng() * (max - min));

const buildLinearData = () => {
  const rng = createSeededRng(RNG_SEED_LINEAR);
  const xValues = buildXValues(rng);
  const yValues = xValues.map((xValue) => {
    const noise = sampleNormal(rng, 0, NOISE_STD_DEV);
    return Number((LINEAR_INTERCEPT + (LINEAR_SLOPE * xValue) + noise).toFixed(3));
  });
  return { xValues, yValues };
};

const buildNegativeLinearData = () => {
  const rng = createSeededRng(RNG_SEED_LINEAR_NEGATIVE);
  const xValues = buildXValues(rng);
  const yValues = xValues.map((xValue) => {
    const noise = sampleNormal(rng, 0, NOISE_STD_DEV);
    return Number((NEGATIVE_LINEAR_INTERCEPT + (NEGATIVE_LINEAR_SLOPE * xValue) + noise).toFixed(3));
  });
  return { xValues, yValues };
};

const buildNonLinearData = () => {
  const rng = createSeededRng(RNG_SEED_NON_LINEAR);
  const xValues = buildXValues(rng);
  const yValues = xValues.map((xValue) => {
    const noise = sampleNormal(rng, 0, NOISE_STD_DEV_NON_LINEAR);
    const signal = NON_LINEAR_INTERCEPT + (NON_LINEAR_AMPLITUDE * Math.sin(NON_LINEAR_FREQUENCY * xValue));
    return Number((signal + noise).toFixed(3));
  });
  return { xValues, yValues };
};

const buildUncorrelatedData = () => {
  const rng = createSeededRng(RNG_SEED_UNCORRELATED);
  const xValues = Array.from(
    { length: SAMPLE_SIZE },
    () => Number(sampleUniform(rng, X_MIN, X_MAX).toFixed(3))
  );
  const yValues = Array.from(
    { length: SAMPLE_SIZE },
    () => Number(sampleUniform(rng, UNCORRELATED_Y_MIN, UNCORRELATED_Y_MAX).toFixed(3))
  );
  return { xValues, yValues };
};

const buildExponentialData = () => {
  const rng = createSeededRng(RNG_SEED_EXPONENTIAL);
  const xValues = buildXValues(rng);
  const xMin = xValues[0];
  const xMax = xValues[xValues.length - 1];
  const xRange = Math.max(xMax - xMin, Number.EPSILON);
  const yValues = xValues.map((xValue) => {
    const normalizedX = (xValue - xMin) / xRange;
    const log10Signal = EXP_LOG10_MIN + (normalizedX * (EXP_LOG10_MAX - EXP_LOG10_MIN));
    const log10Noise = sampleNormal(rng, 0, EXP_LOG10_NOISE_STD_DEV);
    const log10Value = Math.min(
      EXP_LOG10_MAX,
      Math.max(EXP_LOG10_MIN, log10Signal + log10Noise)
    );
    const yValue = 10 ** log10Value;
    return Number(yValue.toFixed(6));
  });
  return { xValues, yValues };
};

const buildDatasetByChoice = (choice) => {
  const normalizedChoice = normalizeRegressionChoice(choice);
  if (choice === "linear-negative") {
    return buildNegativeLinearData();
  }
  if (choice === "exp-log-y") {
    return buildExponentialData();
  }
  if (normalizedChoice === "non-linear") {
    return buildNonLinearData();
  }
  if (normalizedChoice === "none") {
    return buildUncorrelatedData();
  }
  return buildLinearData();
};

const parseStoredDataset = (raw) => {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.xValues) || !Array.isArray(parsed?.yValues)) {
      return null;
    }
    if (parsed.xValues.length !== parsed.yValues.length || parsed.xValues.length === 0) {
      return null;
    }
    const xValues = parsed.xValues.map((value) => Number(value));
    const yValues = parsed.yValues.map((value) => Number(value));
    if (!xValues.every(Number.isFinite) || !yValues.every(Number.isFinite)) {
      return null;
    }
    return { xValues, yValues };
  } catch {
    return null;
  }
};

const getDataset = (chart) => {
  const stored = parseStoredDataset(chart.dataset.regressionData);
  if (stored) {
    return stored;
  }
  const generated = buildDatasetByChoice(chart.dataset.regressionPattern);
  chart.dataset.regressionData = JSON.stringify(generated);
  return generated;
};

const buildRegressionFitData = (seed = REGRESSION_FIT_SEED) => {
  const rng = createSeededRng(seed);
  const xValues = Array.from(
    { length: REGRESSION_FIT_SAMPLE_SIZE },
    () => Number(sampleUniform(rng, X_MIN, X_MAX).toFixed(3))
  ).sort((a, b) => a - b);
  const yValues = xValues.map((xValue) => {
    const noise = sampleNormal(rng, 0, REGRESSION_FIT_NOISE_STD_DEV);
    return Number((REGRESSION_FIT_TRUE_INTERCEPT + (REGRESSION_FIT_TRUE_SLOPE * xValue) + noise).toFixed(3));
  });
  return { xValues, yValues };
};

const storeRegressionFitDataset = (chart, dataset) => {
  if (!chart || !dataset) {
    return;
  }
  chart.dataset.regressionFitData = JSON.stringify(dataset);
};

const getRegressionFitDataset = (chart) => {
  const stored = parseStoredDataset(chart.dataset.regressionFitData);
  if (stored) {
    return stored;
  }
  const generated = buildRegressionFitData();
  storeRegressionFitDataset(chart, generated);
  return generated;
};

const parseStoredRhoBase = (raw) => {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.xValues) || !Array.isArray(parsed?.zValues)) {
      return null;
    }
    if (parsed.xValues.length !== parsed.zValues.length || parsed.xValues.length === 0) {
      return null;
    }
    const xValues = parsed.xValues.map((value) => Number(value));
    const zValues = parsed.zValues.map((value) => Number(value));
    if (!xValues.every(Number.isFinite) || !zValues.every(Number.isFinite)) {
      return null;
    }
    return { xValues, zValues };
  } catch {
    return null;
  }
};

const buildRhoSampleBase = () => {
  const rng = createSeededRng(RHO_SAMPLE_SEED);
  const xValues = Array.from(
    { length: RHO_SAMPLE_SIZE },
    () => Number(sampleNormal(rng, 0, 1).toFixed(4))
  );
  const zValues = Array.from(
    { length: RHO_SAMPLE_SIZE },
    () => Number(sampleNormal(rng, 0, 1).toFixed(4))
  );
  return { xValues, zValues };
};

const getRhoSampleBase = (chart) => {
  const stored = parseStoredRhoBase(chart.dataset.rhoSampleBase);
  if (stored) {
    return stored;
  }
  const generated = buildRhoSampleBase();
  chart.dataset.rhoSampleBase = JSON.stringify(generated);
  return generated;
};

const clampRho = (value) => Math.max(-0.999, Math.min(0.999, value));

const buildRhoDataset = (baseSample, rho) => {
  const safeRho = clampRho(rho);
  const yScale = Math.sqrt(1 - (safeRho ** 2));
  const yValues = baseSample.xValues.map(
    (xValue, index) => Number(((safeRho * xValue) + (yScale * baseSample.zValues[index])).toFixed(4))
  );
  return {
    xValues: baseSample.xValues,
    yValues
  };
};

const renderRhoCorrelationChart = (chart, dataset) => {
  if (!window.Plotly) {
    return;
  }

  const plotHeight = 300;
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(260, Math.round(chart.clientWidth));

  const data = [
    {
      x: dataset.xValues,
      y: dataset.yValues,
      type: "scatter",
      mode: "markers",
      marker: {
        size: 8,
        color: "#2e6f8e",
        opacity: 0.7,
        line: {
          color: "#1f4c62",
          width: 0.6
        }
      },
      hoverinfo: "skip"
    }
  ];

  const layout = {
    margin: { t: 12, r: 18, b: 44, l: 46 },
    height: plotHeight,
    width: plotWidth,
    autosize: false,
    xaxis: {
      range: [RHO_AXIS_MIN, RHO_AXIS_MAX],
      showgrid: true,
      zeroline: false,
      showline: true,
      ticks: "",
      title: { text: "X", standoff: 6 }
    },
    yaxis: {
      range: [RHO_AXIS_MIN, RHO_AXIS_MAX],
      showgrid: true,
      zeroline: false,
      showline: true,
      ticks: "",
      title: { text: "Y", standoff: 6 }
    },
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

const initRhoCorrelationSlide = () => {
  const chart = document.querySelector("[data-rho-correlation-chart]");
  const slider = document.querySelector("[data-rho-correlation-slider]");
  const valueEl = document.querySelector("[data-rho-correlation-value]");
  if (!chart || !slider || !valueEl) {
    return;
  }

  const baseSample = getRhoSampleBase(chart);

  const update = () => {
    const rho = Number(slider.value);
    if (!Number.isFinite(rho)) {
      return;
    }
    const dataset = buildRhoDataset(baseSample, rho);
    renderRhoCorrelationChart(chart, dataset);
    valueEl.textContent = rho.toFixed(2);
  };

  if (chart.dataset.rhoBound === "true") {
    update();
    return;
  }
  chart.dataset.rhoBound = "true";

  slider.addEventListener("input", update);
  update();
};

const computeSse = (dataset, slope, intercept) => (
  dataset.xValues.reduce((total, xValue, index) => {
    const yValue = dataset.yValues[index];
    const residual = ((slope * xValue) + intercept) - yValue;
    return total + (residual ** 2);
  }, 0)
);

const renderLeastSquaresSurfaceFormula = (formulaEl) => {
  if (!formulaEl) {
    return;
  }
  const latex = "e(a,b)=\\sum_{i=1}^{n}(a x_i + b - y_i)^2";
  if (window.katex && typeof window.katex.render === "function") {
    window.katex.render(latex, formulaEl, {
      displayMode: true,
      throwOnError: false
    });
    return;
  }
  formulaEl.textContent = "e(a,b) = sum((a*x_i + b - y_i)^2)";
};

const buildLeastSquaresSurfaceGrid = () => {
  const stepA = (LEAST_SQUARES_SURFACE_A_MAX - LEAST_SQUARES_SURFACE_A_MIN)
    / (LEAST_SQUARES_SURFACE_GRID_SIZE - 1);
  const stepB = (LEAST_SQUARES_SURFACE_B_MAX - LEAST_SQUARES_SURFACE_B_MIN)
    / (LEAST_SQUARES_SURFACE_GRID_SIZE - 1);

  const aValues = Array.from(
    { length: LEAST_SQUARES_SURFACE_GRID_SIZE },
    (_, index) => LEAST_SQUARES_SURFACE_A_MIN + (index * stepA)
  );
  const bValues = Array.from(
    { length: LEAST_SQUARES_SURFACE_GRID_SIZE },
    (_, index) => LEAST_SQUARES_SURFACE_B_MIN + (index * stepB)
  );
  return { aValues, bValues };
};

const computeLeastSquaresMinimum = (dataset) => {
  if (!dataset?.xValues?.length || dataset.xValues.length !== dataset.yValues?.length) {
    return null;
  }
  const count = dataset.xValues.length;
  if (count === 0) {
    return null;
  }
  const xMean = dataset.xValues.reduce((acc, value) => acc + value, 0) / count;
  const yMean = dataset.yValues.reduce((acc, value) => acc + value, 0) / count;
  const varianceX = dataset.xValues.reduce((acc, value) => acc + ((value - xMean) ** 2), 0);
  const covarianceXY = dataset.xValues.reduce(
    (acc, xValue, index) => acc + ((xValue - xMean) * (dataset.yValues[index] - yMean)),
    0
  );
  const slope = varianceX > 0 ? covarianceXY / varianceX : 0;
  const intercept = yMean - (slope * xMean);
  const sse = computeSse(dataset, slope, intercept);
  if (!Number.isFinite(slope) || !Number.isFinite(intercept) || !Number.isFinite(sse)) {
    return null;
  }
  return { slope, intercept, sse };
};

const renderLeastSquaresSurfaceChart = (chart, dataset) => {
  if (!chart || !window.Plotly) {
    return;
  }
  const minimum = computeLeastSquaresMinimum(dataset);
  const { aValues, bValues } = buildLeastSquaresSurfaceGrid();
  const zValues = bValues.map((bValue) => (
    aValues.map((aValue) => computeSse(dataset, aValue, bValue))
  ));

  const plotHeight = 430;
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(320, Math.round(chart.clientWidth));

  const data = [
    {
      type: "surface",
      x: aValues,
      y: bValues,
      z: zValues,
      colorscale: "Viridis",
      contours: {
        z: {
          show: true,
          usecolormap: true,
          project: { z: true }
        }
      },
      hoverinfo: "skip"
    }
  ];
  if (minimum) {
    data.push({
      type: "scatter3d",
      mode: "markers",
      x: [minimum.slope],
      y: [minimum.intercept],
      z: [minimum.sse],
      marker: {
        size: 5,
        color: "#c24b4b"
      },
      hoverinfo: "skip"
    });
  }

  const layout = {
    margin: { t: 16, r: 14, b: 0, l: 0 },
    height: plotHeight,
    width: plotWidth,
    autosize: false,
    scene: {
      xaxis: { title: "a", range: [LEAST_SQUARES_SURFACE_A_MIN, LEAST_SQUARES_SURFACE_A_MAX] },
      yaxis: { title: "b", range: [LEAST_SQUARES_SURFACE_B_MIN, LEAST_SQUARES_SURFACE_B_MAX] },
      zaxis: { title: "e(a,b)", range: [0, 4000] },
      camera: {
        eye: { x: 0.8, y: 2.0, z: 1.0 }
      }
    },
    paper_bgcolor: "rgb(247, 247, 247)"
  };

  Plotly.react(chart, data, layout, {
    displayModeBar: false,
    responsive: false,
    staticPlot: false,
    scrollZoom: false
  });
};

const initLeastSquaresSurfaceSlide = () => {
  const chart = document.querySelector("[data-least-squares-surface-chart]");
  if (!chart) {
    return;
  }
  const section = chart.closest("section");
  const formulaEl = section?.querySelector("[data-least-squares-surface-formula]")
    || document.querySelector("[data-least-squares-surface-formula]");
  const generateButton = section?.querySelector("[data-least-squares-generate]")
    || document.querySelector("[data-least-squares-generate]");
  renderLeastSquaresSurfaceFormula(formulaEl);

  const renderCurrent = () => {
    const dataset = getRegressionFitDataset(chart);
    renderLeastSquaresSurfaceChart(chart, dataset);
  };

  if (chart.dataset.leastSquaresBound === "true") {
    renderCurrent();
    return;
  }
  chart.dataset.leastSquaresBound = "true";

  if (generateButton) {
    generateButton.addEventListener("click", () => {
      const previousSeed = Number(chart.dataset.leastSquaresSeed || REGRESSION_FIT_SEED);
      const nextSeed = previousSeed + 1;
      chart.dataset.leastSquaresSeed = String(nextSeed);
      const newDataset = buildRegressionFitData(nextSeed);
      storeRegressionFitDataset(chart, newDataset);
      renderLeastSquaresSurfaceChart(chart, newDataset);
    });
  }

  renderCurrent();
};

const renderRegressionFitSseFormula = (formulaEl, sse) => {
  if (!formulaEl || !Number.isFinite(sse)) {
    return;
  }
  const latex = `\\text{SSE} = \\sum_{i=1}^{N} (a x_i + b - y_i)^2 = ${sse.toFixed(3)}`;
  if (window.katex && typeof window.katex.render === "function") {
    window.katex.render(latex, formulaEl, {
      displayMode: true,
      throwOnError: false
    });
    return;
  }
  formulaEl.textContent = `SSE = sum((a*x_i + b - y_i)^2) = ${sse.toFixed(3)}`;
};

const computeRegressionFitRanges = (dataset) => {
  const xDataMin = Math.min(...dataset.xValues);
  const xDataMax = Math.max(...dataset.xValues);
  const xMin = xDataMin - 0.6;
  const xMax = xDataMax + 0.6;

  return {
    xMin,
    xMax,
    yMin: REGRESSION_FIT_Y_MIN,
    yMax: REGRESSION_FIT_Y_MAX
  };
};

const renderRegressionFitChart = (chart, dataset, slope, intercept, ranges) => {
  if (!window.Plotly) {
    return;
  }

  const segmentX = [];
  const segmentY = [];
  dataset.xValues.forEach((xValue, index) => {
    const yValue = dataset.yValues[index];
    const yHat = (slope * xValue) + intercept;
    segmentX.push(xValue, xValue, null);
    segmentY.push(yValue, yHat, null);
  });

  const lineX = [ranges.xMin, ranges.xMax];
  const lineY = lineX.map((xValue) => (slope * xValue) + intercept);

  const plotHeight = 290;
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(260, Math.round(chart.clientWidth));

  const data = [
    {
      x: segmentX,
      y: segmentY,
      type: "scatter",
      mode: "lines",
      line: {
        color: "rgba(46, 111, 142, 0.45)",
        width: 1.4
      },
      hoverinfo: "skip"
    },
    {
      x: dataset.xValues,
      y: dataset.yValues,
      type: "scatter",
      mode: "markers",
      marker: {
        size: 10,
        color: "#2e6f8e",
        line: {
          color: "#1f4c62",
          width: 1
        }
      },
      hoverinfo: "skip"
    },
    {
      x: lineX,
      y: lineY,
      type: "scatter",
      mode: "lines",
      line: {
        color: "#c24b4b",
        width: 3
      },
      hoverinfo: "skip"
    }
  ];

  const layout = {
    margin: { t: 12, r: 18, b: 46, l: 50 },
    height: plotHeight,
    width: plotWidth,
    autosize: false,
    xaxis: {
      range: [ranges.xMin, ranges.xMax],
      showgrid: true,
      zeroline: false,
      showline: true,
      ticks: "",
      title: { text: "x", standoff: 6 }
    },
    yaxis: {
      range: [ranges.yMin, ranges.yMax],
      showgrid: true,
      zeroline: false,
      showline: true,
      ticks: "",
      title: { text: "y", standoff: 6 }
    },
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

const initRegressionFitSlide = () => {
  const chart = document.querySelector("[data-regression-fit-chart]");
  if (!chart) {
    return;
  }
  const section = chart.closest("section");
  const formulaEl = section?.querySelector("[data-regression-fit-sse-formula]")
    || document.querySelector("[data-regression-fit-sse-formula]");
  const aSlider = section?.querySelector("[data-regression-fit-a]")
    || document.querySelector("[data-regression-fit-a]");
  const bSlider = section?.querySelector("[data-regression-fit-b]")
    || document.querySelector("[data-regression-fit-b]");
  const aValueEl = section?.querySelector("[data-regression-fit-a-value]")
    || document.querySelector("[data-regression-fit-a-value]");
  const bValueEl = section?.querySelector("[data-regression-fit-b-value]")
    || document.querySelector("[data-regression-fit-b-value]");
  if (!aSlider || !bSlider) {
    return;
  }

  const dataset = getRegressionFitDataset(chart);
  const ranges = computeRegressionFitRanges(dataset);

  const update = () => {
    const slope = Number(aSlider.value);
    const intercept = Number(bSlider.value);
    if (!Number.isFinite(slope) || !Number.isFinite(intercept)) {
      return;
    }
    if (aValueEl) {
      aValueEl.textContent = slope.toFixed(2);
    }
    if (bValueEl) {
      bValueEl.textContent = intercept.toFixed(2);
    }
    renderRegressionFitChart(chart, dataset, slope, intercept, ranges);
    const sse = computeSse(dataset, slope, intercept);
    renderRegressionFitSseFormula(formulaEl, sse);
  };

  if (chart.dataset.regressionFitBound === "true") {
    update();
    return;
  }
  chart.dataset.regressionFitBound = "true";

  aSlider.addEventListener("input", update);
  bSlider.addEventListener("input", update);
  update();
};

const buildFireworks = (container) => {
  container.innerHTML = "";
  const burstCount = 4;
  const sparkCount = 12;

  for (let i = 0; i < burstCount; i += 1) {
    const firework = document.createElement("div");
    firework.className = "regression-firework";
    firework.style.left = `${10 + Math.random() * 80}%`;
    firework.style.top = `${10 + Math.random() * 60}%`;

    for (let j = 0; j < sparkCount; j += 1) {
      const spark = document.createElement("span");
      const angle = (360 / sparkCount) * j;
      const color = FIREWORK_COLORS[(i + j) % FIREWORK_COLORS.length];
      const delay = `${Math.random() * 0.2}s`;
      spark.className = "regression-spark";
      spark.style.setProperty("--angle", `${angle}deg`);
      spark.style.setProperty("--color", color);
      spark.style.setProperty("--delay", delay);
      firework.appendChild(spark);
    }

    container.appendChild(firework);
  }
};

const launchFireworks = (container) => {
  if (!container) {
    return;
  }
  container.classList.remove("active");
  buildFireworks(container);
  window.requestAnimationFrame(() => {
    container.classList.add("active");
  });
};

const resetFireworks = (container) => {
  if (!container) {
    return;
  }
  container.classList.remove("active");
  container.innerHTML = "";
};

const initRegressionChoiceControls = (controls) => {
  if (!controls) {
    return;
  }

  const choiceButtons = Array.from(controls.querySelectorAll("[data-regression-choice]"));
  const verifyButton = controls.querySelector("[data-regression-verify]");
  const fireworks = controls.querySelector("[data-regression-fireworks]");
  const correctChoice = normalizeRegressionChoice(controls.dataset.regressionCorrectChoice);
  if (choiceButtons.length === 0) {
    return;
  }

  const setSelectedButton = (selectedButton) => {
    choiceButtons.forEach((button) => {
      const isSelected = button === selectedButton;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  };

  let hasVerified = false;

  const resetVerificationState = () => {
    hasVerified = false;
    choiceButtons.forEach((button) => {
      button.classList.remove("is-correct", "is-incorrect");
    });
    resetFireworks(fireworks);
  };

  if (controls.dataset.initialized === "true") {
    return;
  }
  controls.dataset.initialized = "true";

  choiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (hasVerified) {
        resetVerificationState();
      }
      setSelectedButton(button);
    });
  });

  if (verifyButton) {
    verifyButton.addEventListener("click", () => {
      const selectedButton = choiceButtons.find((button) => button.classList.contains("is-selected"));
      if (!selectedButton) {
        resetVerificationState();
        return;
      }

      hasVerified = true;
      choiceButtons.forEach((button) => {
        button.classList.remove("is-correct", "is-incorrect");
      });

      if (normalizeRegressionChoice(selectedButton.dataset.regressionChoice) === correctChoice) {
        selectedButton.classList.add("is-correct");
        launchFireworks(fireworks);
      } else {
        selectedButton.classList.add("is-incorrect");
        resetFireworks(fireworks);
      }
    });
  }
};

const renderRegressionScatter = (chart, dataset) => {
  if (!window.Plotly) {
    return;
  }
  const { xValues, yValues } = dataset;
  const isLogYScale = chart.dataset.regressionYScale === "log";
  const xMin = Math.min(...xValues) - 0.6;
  const xMax = Math.max(...xValues) + 0.6;
  const rawYMin = Math.min(...yValues);
  const rawYMax = Math.max(...yValues);

  const plotHeight = 300;
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(260, Math.round(chart.clientWidth));

  const data = [
    {
      x: xValues,
      y: yValues,
      type: "scatter",
      mode: "markers",
      marker: {
        size: 10,
        color: "#2e6f8e",
        opacity: 0.9,
        line: {
          color: "#1f4c62",
          width: 1
        }
      },
      hoverinfo: "skip"
    }
  ];

  const layout = {
    margin: { t: 14, r: 18, b: 44, l: 46 },
    height: plotHeight,
    width: plotWidth,
    autosize: false,
    xaxis: {
      range: [xMin, xMax],
      showgrid: true,
      zeroline: false,
      showline: true,
      ticks: "",
      title: { text: "x", standoff: 6 }
    },
    yaxis: {
      ...(isLogYScale
        ? {
            type: "log",
            range: [EXP_LOG10_MIN, EXP_LOG10_MAX],
            tickmode: "array",
            tickvals: EXP_TICK_VALUES,
            ticktext: EXP_TICK_VALUES.map((value) => value.toString()),
            ticks: "",
            title: { text: "y", standoff: 6 }
          }
        : {
            range: [rawYMin - 1.0, rawYMax + 1.0],
            ticks: "",
            title: { text: "y", standoff: 6 }
      }),
      showgrid: true,
      zeroline: false,
      showline: true
    },
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

export const initRegressionSlide = () => {
  const charts = Array.from(document.querySelectorAll("[data-regression-scatter-chart]"));
  charts.forEach((chart) => {
    const dataset = getDataset(chart);
    renderRegressionScatter(chart, dataset);
  });

  const controlsBlocks = Array.from(document.querySelectorAll("[data-regression-controls]"));
  controlsBlocks.forEach((controls) => {
    initRegressionChoiceControls(controls);
  });

  initRegressionFitSlide();
  initLeastSquaresSurfaceSlide();
  initRhoCorrelationSlide();
};
