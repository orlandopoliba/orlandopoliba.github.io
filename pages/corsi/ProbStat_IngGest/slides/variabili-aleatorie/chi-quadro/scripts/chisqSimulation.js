import { gammaPdf, gammaSample } from "./chisqUtils.js";

const CHISQ_X_MIN = 0;
const CHISQ_X_MAX = 20;
const CHISQ_Y_MAX = 0.5;
const CHISQ_MAX_SAMPLES = 5000;

const chisqSample = (n) => {
  const alpha = n / 2;
  const lambda = 0.5;
  return gammaSample(alpha, lambda);
};

const bindChiSqSimulation = () => {
  const nSlider = document.getElementById("chisq-sim-n-slider");
  const nValue = document.getElementById("chisq-sim-n-value");
  const sampleBtn = document.getElementById("chisq-sample-btn");
  const resetBtn = document.getElementById("chisq-reset-btn");
  const resultEl = document.getElementById("chisq-result");
  const totalEl = document.getElementById("chisq-total");
  const plotEl = document.getElementById("chisq-hist");
  const theoryToggle = document.getElementById("chisq-theory-toggle");
  const binSlider = document.getElementById("chisq-bin-slider");
  const binValue = document.getElementById("chisq-bin-value");

  if (!nSlider || !nValue || !sampleBtn || !resetBtn || !resultEl || !totalEl || !plotEl || !theoryToggle || !binSlider || !binValue) {
    return;
  }

  let samples = [];
  let binSize = Number.parseFloat(binSlider.value);

  const resetSamples = () => {
    samples = [];
    totalEl.textContent = "Esperimenti eseguiti: 0";
  };

  const updateHistogram = () => {
    const n = Number.parseInt(nSlider.value, 10);
    const alpha = n / 2;
    const lambda = 0.5;

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
          start: CHISQ_X_MIN,
          end: CHISQ_X_MAX,
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
      const xValues = Array.from({ length: 300 }, (_, index) => CHISQ_X_MIN + ((CHISQ_X_MAX - CHISQ_X_MIN) * index) / 299);
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
        range: [CHISQ_X_MIN, CHISQ_X_MAX],
        showgrid: false,
        zeroline: false,
        showline: true,
        ticks: ""
      },
      yaxis: {
        range: [0, CHISQ_Y_MAX],
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
    const n = Number.parseInt(nSlider.value, 10);
    resetSamples();
    resultEl.textContent = "Esito: -";
    if (window.katex) {
      window.katex.render(String(n), nValue, { throwOnError: false });
    } else {
      nValue.textContent = String(n);
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
    const n = Number.parseInt(nSlider.value, 10);
    const sample = chisqSample(n);
    if (samples.length < CHISQ_MAX_SAMPLES) {
      samples.push(sample);
    }
    resultEl.textContent = `Esito: ${sample.toFixed(2)}`;
    totalEl.textContent = `Esperimenti eseguiti: ${samples.length}`;
    updateHistogram();
  };

  if (nSlider.dataset.bound !== "true") {
    nSlider.addEventListener("input", updateParams);
    nSlider.dataset.bound = "true";
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

export const initChiSqSimulation = () => {
  bindChiSqSimulation();
};
