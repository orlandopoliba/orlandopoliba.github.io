import { gammaPdf } from "./gammaUtils.js";

const GAMMA_X_MIN = 0;
const GAMMA_X_MAX = 8;
const GAMMA_MAX_SAMPLES = 5000;

const gammaSample = (alpha, lambda) => {
  if (alpha < 1) {
    const u = Math.random();
    return gammaSample(alpha + 1, lambda) * (u ** (1 / alpha));
  }
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x = 0;
    let v = 0;
    do {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      x = z;
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * (x ** 4)) {
      return (d * v) / lambda;
    }
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return (d * v) / lambda;
    }
  }
};

const bindGammaSimulation = () => {
  const alphaSlider = document.getElementById("gamma-sim-alpha-slider");
  const lambdaSlider = document.getElementById("gamma-sim-lambda-slider");
  const alphaValue = document.getElementById("gamma-sim-alpha-value");
  const lambdaValue = document.getElementById("gamma-sim-lambda-value");
  const sampleBtn = document.getElementById("gamma-sample-btn");
  const resetBtn = document.getElementById("gamma-reset-btn");
  const resultEl = document.getElementById("gamma-result");
  const totalEl = document.getElementById("gamma-total");
  const plotEl = document.getElementById("gamma-hist");
  const theoryToggle = document.getElementById("gamma-theory-toggle");
  const binSlider = document.getElementById("gamma-bin-slider");
  const binValue = document.getElementById("gamma-bin-value");

  if (!alphaSlider || !lambdaSlider || !alphaValue || !lambdaValue || !sampleBtn || !resetBtn || !resultEl || !totalEl || !plotEl || !theoryToggle || !binSlider || !binValue) {
    return;
  }

  let samples = [];
  let binSize = Number.parseFloat(binSlider.value);

  const resetSamples = () => {
    samples = [];
    totalEl.textContent = "Esperimenti eseguiti: 0";
  };

  const updateHistogram = () => {
    const alpha = Number.parseFloat(alphaSlider.value);
    const lambda = Number.parseFloat(lambdaSlider.value);
    const yMax = 0.5;

    const data = samples.length === 0
      ? [{
        x: [0],
        y: [0],
        type: "scatter",
        mode: "markers",
        marker: { opacity: 0 },
        hoverinfo: "skip"
      }]
      : [{
        x: [...samples],
        type: "histogram",
        histnorm: "probability density",
        xbins: {
          start: GAMMA_X_MIN,
          end: GAMMA_X_MAX,
          size: binSize
        },
        marker: { color: "#b3713b", opacity: 0.8 },
        name: "Frequenze osservate"
      }];

    if (samples.length > 0) {
      data.push({
        x: [...samples],
        y: samples.map(() => 0),
        type: "scatter",
        mode: "markers",
        marker: { color: "#444444", size: 9, opacity: 0.6 },
        cliponaxis: false,
        name: "Campioni",
        hoverinfo: "skip"
      });
    }

    if (theoryToggle.checked) {
      const xValues = Array.from({ length: 300 }, (_, index) => GAMMA_X_MIN + ((GAMMA_X_MAX - GAMMA_X_MIN) * index) / 299);
      const yValues = xValues.map((x) => gammaPdf(alpha, lambda, x));
      data.push({
        x: xValues,
        y: yValues,
        type: "scatter",
        mode: "lines",
        line: { color: "#2e6f8e", width: 3 },
        name: "Densita teorica",
        hoverinfo: "skip"
      });
    }

    const plotWidth = Math.max(320, Math.round(plotEl.clientWidth));
    const layout = {
      margin: { t: 10, r: 10, b: 40, l: 50 },
      height: 260,
      width: plotWidth,
      autosize: false,
      xaxis: {
        range: [GAMMA_X_MIN, GAMMA_X_MAX],
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

    Plotly.react(plotEl, data, layout, { displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true })
      .then(() => {
        if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
          window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
        }
      });
  };

  const updateParams = () => {
    const alpha = Number.parseFloat(alphaSlider.value);
    const lambda = Number.parseFloat(lambdaSlider.value);
    resetSamples();
    resultEl.textContent = "Esito: -";
    if (window.katex) {
      window.katex.render(alpha.toFixed(1), alphaValue, { throwOnError: false });
      window.katex.render(lambda.toFixed(1), lambdaValue, { throwOnError: false });
    } else {
      alphaValue.textContent = alpha.toFixed(1);
      lambdaValue.textContent = lambda.toFixed(1);
    }
    updateHistogram();
  };

  const updateBinValue = () => {
    binSize = Number.parseFloat(binSlider.value);
    if (window.katex) {
      window.katex.render(binSize.toFixed(2), binValue, { throwOnError: false });
    } else {
      binValue.textContent = binSize.toFixed(2);
    }
    updateHistogram();
  };

  const applySample = () => {
    const alpha = Number.parseFloat(alphaSlider.value);
    const lambda = Number.parseFloat(lambdaSlider.value);
    const sample = gammaSample(alpha, lambda);
    if (samples.length < GAMMA_MAX_SAMPLES) {
      samples.push(sample);
    }
    resultEl.textContent = `Esito: ${sample.toFixed(2)}`;
    totalEl.textContent = `Esperimenti eseguiti: ${samples.length}`;
    updateHistogram();
  };

  if (alphaSlider.dataset.bound !== "true") {
    alphaSlider.addEventListener("input", updateParams);
    alphaSlider.dataset.bound = "true";
  }

  if (lambdaSlider.dataset.bound !== "true") {
    lambdaSlider.addEventListener("input", updateParams);
    lambdaSlider.dataset.bound = "true";
  }

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
        for (let i = 0; i < 5; i += 1) {
          applySample();
        }
      }, 50);
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
        applySample();
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

    const onPressEnd = () => {
      stopHold();
    };

    sampleBtn.addEventListener("mousedown", onPressStart);
    sampleBtn.addEventListener("touchstart", onPressStart, { passive: true });
    sampleBtn.addEventListener("mouseup", onPressEnd);
    sampleBtn.addEventListener("mouseleave", onPressEnd);
    sampleBtn.addEventListener("touchend", onPressEnd);
    sampleBtn.addEventListener("touchcancel", onPressEnd);
    sampleBtn.dataset.bound = "true";
  }

  if (theoryToggle.dataset.bound !== "true") {
    theoryToggle.addEventListener("change", updateHistogram);
    theoryToggle.dataset.bound = "true";
  }

  if (binSlider.dataset.bound !== "true") {
    binSlider.addEventListener("input", updateBinValue);
    binSlider.dataset.bound = "true";
  }

  if (resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      resetSamples();
      resultEl.textContent = "Esito: -";
      updateHistogram();
    });
    resetBtn.dataset.bound = "true";
  }

  updateParams();
  updateBinValue();
  updateHistogram();
};

export const initGammaSimulation = () => {
  bindGammaSimulation();
};
