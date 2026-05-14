const SAMPLE_SIZE = 30;
const HISTOGRAM_X_MIN = -4;
const HISTOGRAM_X_MAX = 4;
const MAX_STANDARDIZED_SAMPLES = 5000;

const simulationConfigs = [
  {
    key: "clt-uniform",
    sampleButtonId: "clt-uniform-sample-btn",
    resetButtonId: "clt-uniform-reset-btn",
    sampleGridId: "clt-uniform-sample-grid",
    meanOutputId: "clt-uniform-mean-output",
    standardizedOutputId: "clt-uniform-standardized-output",
    histogramId: "clt-uniform-histogram",
    binSliderId: "clt-uniform-bin-slider",
    binValueId: "clt-uniform-bin-value",
    densityToggleId: "clt-uniform-density-toggle",
    mu: 0.5,
    sigma: Math.sqrt(1 / 12),
    sampler: () => Math.random()
  },
  {
    key: "clt-exp",
    sampleButtonId: "clt-exp-sample-btn",
    resetButtonId: "clt-exp-reset-btn",
    sampleGridId: "clt-exp-sample-grid",
    meanOutputId: "clt-exp-mean-output",
    standardizedOutputId: "clt-exp-standardized-output",
    histogramId: "clt-exp-histogram",
    binSliderId: "clt-exp-bin-slider",
    binValueId: "clt-exp-bin-value",
    densityToggleId: "clt-exp-density-toggle",
    mu: 1,
    sigma: 1,
    sampler: () => -Math.log(1 - Math.random())
  }
];

const simulationStates = Object.fromEntries(
  simulationConfigs.map((config) => [
    config.key,
    {
      currentSample: [],
      standardizedSamples: [],
      binSize: 0.25
    }
  ])
);

const renderMath = (element, latex) => {
  if (!element) {
    return;
  }
  if (window.katex) {
    window.katex.render(latex, element, { throwOnError: false });
  } else {
    element.textContent = latex;
  }
};

const standardNormalPdf = (x) => Math.exp(-(x ** 2) / 2) / Math.sqrt(2 * Math.PI);

const computeSampleMean = (sample) => sample.reduce((sum, value) => sum + value, 0) / sample.length;

const computeStandardizedMean = (sampleMean, config) => (sampleMean - config.mu) / (config.sigma / Math.sqrt(SAMPLE_SIZE));

const renderSampleGrid = (sampleGridEl, state) => {
  if (!sampleGridEl) {
    return;
  }

  sampleGridEl.innerHTML = "";

  if (state.currentSample.length === 0) {
    for (let index = 0; index < SAMPLE_SIZE; index += 1) {
      const cell = document.createElement("div");
      cell.className = "sample-cell";
      if (window.katex && window.katex.renderToString) {
        cell.innerHTML = window.katex.renderToString(`X_{${index + 1}}`, { throwOnError: false });
      } else {
        cell.textContent = `X_${index + 1}`;
      }
      sampleGridEl.appendChild(cell);
    }
    return;
  }

  state.currentSample.forEach((value) => {
    const cell = document.createElement("div");
    cell.className = "sample-cell";
    cell.textContent = value.toFixed(3);
    sampleGridEl.appendChild(cell);
  });
};

const renderStatistics = (meanOutputEl, standardizedOutputEl, state, config) => {
  if (state.currentSample.length === 0) {
    renderMath(meanOutputEl, String.raw`\bar{X}_n = -`);
    renderMath(standardizedOutputEl, String.raw`\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} = -`);
    return;
  }

  const sampleMean = computeSampleMean(state.currentSample);
  const standardizedMean = computeStandardizedMean(sampleMean, config);
  renderMath(meanOutputEl, String.raw`\bar{X}_n = ${sampleMean.toFixed(4)}`);
  renderMath(standardizedOutputEl, String.raw`\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} = ${standardizedMean.toFixed(4)}`);
};

const updateHistogram = (plotEl, densityToggle, state) => {
  if (!plotEl || typeof Plotly === "undefined") {
    return;
  }

  const data = state.standardizedSamples.length === 0
    ? [{
      x: [0],
      y: [0],
      type: "scatter",
      mode: "markers",
      marker: { opacity: 0 },
      hoverinfo: "skip"
    }]
    : [{
      x: [...state.standardizedSamples],
      type: "histogram",
      histnorm: "probability density",
      xbins: {
        start: HISTOGRAM_X_MIN,
        end: HISTOGRAM_X_MAX,
        size: state.binSize
      },
      marker: { color: "#b3713b", opacity: 0.82 },
      hoverinfo: "skip"
    }];

  if (densityToggle.checked) {
    const xValues = Array.from({ length: 300 }, (_, index) => HISTOGRAM_X_MIN + ((HISTOGRAM_X_MAX - HISTOGRAM_X_MIN) * index) / 299);
    const yValues = xValues.map((x) => standardNormalPdf(x));
    data.push({
      x: xValues,
      y: yValues,
      type: "scatter",
      mode: "lines",
      line: { color: "#2e6f8e", width: 3 },
      hoverinfo: "skip"
    });
  }

  const plotWidth = Math.max(340, Math.round(plotEl.clientWidth));
  const layout = {
    margin: { t: 8, r: 10, b: 40, l: 50 },
    height: 260,
    width: plotWidth,
    autosize: false,
    xaxis: {
      range: [HISTOGRAM_X_MIN, HISTOGRAM_X_MAX],
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, 0.5],
      showgrid: true,
      zeroline: false,
      showline: true,
      showticklabels: true,
      ticks: ""
    },
    paper_bgcolor: "rgb(247, 247, 247)",
    plot_bgcolor: "rgb(247, 247, 247)",
    showlegend: false
  };

  Plotly.react(plotEl, data, layout, { displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true });
};

const sampleOnce = (elements, state, config) => {
  const sample = Array.from({ length: SAMPLE_SIZE }, config.sampler);
  const sampleMean = computeSampleMean(sample);
  const standardizedMean = computeStandardizedMean(sampleMean, config);

  state.currentSample = sample;
  if (state.standardizedSamples.length < MAX_STANDARDIZED_SAMPLES) {
    state.standardizedSamples.push(standardizedMean);
  }

  renderSampleGrid(elements.sampleGridEl, state);
  renderStatistics(elements.meanOutputEl, elements.standardizedOutputEl, state, config);
  updateHistogram(elements.plotEl, elements.densityToggle, state);
};

const resetState = (elements, state, config) => {
  state.currentSample = [];
  state.standardizedSamples = [];
  renderSampleGrid(elements.sampleGridEl, state);
  renderStatistics(elements.meanOutputEl, elements.standardizedOutputEl, state, config);
  updateHistogram(elements.plotEl, elements.densityToggle, state);
};

const bindSimulation = (config) => {
  const sampleBtn = document.getElementById(config.sampleButtonId);
  const resetBtn = document.getElementById(config.resetButtonId);
  const sampleGridEl = document.getElementById(config.sampleGridId);
  const meanOutputEl = document.getElementById(config.meanOutputId);
  const standardizedOutputEl = document.getElementById(config.standardizedOutputId);
  const plotEl = document.getElementById(config.histogramId);
  const binSlider = document.getElementById(config.binSliderId);
  const binValue = document.getElementById(config.binValueId);
  const densityToggle = document.getElementById(config.densityToggleId);

  if (!sampleBtn || !resetBtn || !sampleGridEl || !meanOutputEl || !standardizedOutputEl || !plotEl || !binSlider || !binValue || !densityToggle) {
    return;
  }

  const state = simulationStates[config.key];
  const elements = {
    sampleGridEl,
    meanOutputEl,
    standardizedOutputEl,
    plotEl,
    densityToggle
  };

  const renderBinValue = () => {
    state.binSize = Number.parseFloat(binSlider.value);
    renderMath(binValue, state.binSize.toFixed(2));
    updateHistogram(plotEl, densityToggle, state);
  };

  if (sampleBtn.dataset.bound !== "true") {
    let holdIntervalId = null;
    let longPressTimerId = null;
    let longPressActive = false;
    let isPressing = false;

    const startHold = () => {
      if (holdIntervalId !== null) {
        return;
      }
      longPressActive = true;
      holdIntervalId = window.setInterval(() => {
        for (let index = 0; index < 4; index += 1) {
          sampleOnce(elements, state, config);
        }
      }, 60);
    };

    const stopHold = () => {
      if (!isPressing) {
        return;
      }
      if (holdIntervalId !== null) {
        window.clearInterval(holdIntervalId);
        holdIntervalId = null;
      }
      if (longPressTimerId !== null) {
        window.clearTimeout(longPressTimerId);
        longPressTimerId = null;
      }
      if (!longPressActive) {
        sampleOnce(elements, state, config);
      }
      longPressActive = false;
      isPressing = false;
    };

    const onPressStart = () => {
      if (longPressTimerId !== null) {
        return;
      }
      isPressing = true;
      longPressActive = false;
      longPressTimerId = window.setTimeout(startHold, 300);
    };

    sampleBtn.addEventListener("mousedown", onPressStart);
    sampleBtn.addEventListener("touchstart", onPressStart, { passive: true });
    sampleBtn.addEventListener("mouseup", stopHold);
    sampleBtn.addEventListener("mouseleave", stopHold);
    sampleBtn.addEventListener("touchend", stopHold);
    sampleBtn.addEventListener("touchcancel", stopHold);
    sampleBtn.dataset.bound = "true";
  }

  if (resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      resetState(elements, state, config);
    });
    resetBtn.dataset.bound = "true";
  }

  if (binSlider.dataset.bound !== "true") {
    binSlider.addEventListener("input", renderBinValue);
    binSlider.dataset.bound = "true";
  }

  if (densityToggle.dataset.bound !== "true") {
    densityToggle.addEventListener("change", () => updateHistogram(plotEl, densityToggle, state));
    densityToggle.dataset.bound = "true";
  }

  renderSampleGrid(sampleGridEl, state);
  renderStatistics(meanOutputEl, standardizedOutputEl, state, config);
  renderBinValue();
};

export const initCltSampleMeanLaw = () => {
  simulationConfigs.forEach(bindSimulation);
};
