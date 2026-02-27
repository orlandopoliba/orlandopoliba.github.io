const NORMAL_X_MIN = -6;
const NORMAL_X_MAX = 6;
const NORMAL_MAX_SAMPLES = 5000;

const normalSample = (mu, sigma2) => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mu + Math.sqrt(sigma2) * z0;
};

const normalPdf = (mu, sigma2, x) => {
  if (sigma2 <= 0) {
    return 0;
  }
  const sigma = Math.sqrt(sigma2);
  const coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const exponent = -((x - mu) ** 2) / (2 * sigma2);
  return coeff * Math.exp(exponent);
};

const bindNormalSimulation = () => {
  const muSlider = document.getElementById("normal-sim-mu-slider");
  const sigma2Slider = document.getElementById("normal-sim-sigma2-slider");
  const muValue = document.getElementById("normal-sim-mu-value");
  const sigma2Value = document.getElementById("normal-sim-sigma2-value");
  const sampleBtn = document.getElementById("normal-sample-btn");
  const resetBtn = document.getElementById("normal-reset-btn");
  const resultEl = document.getElementById("normal-result");
  const totalEl = document.getElementById("normal-total");
  const plotEl = document.getElementById("normal-hist");
  const theoryToggle = document.getElementById("normal-theory-toggle");
  const binSlider = document.getElementById("normal-bin-slider");
  const binValue = document.getElementById("normal-bin-value");

  if (!muSlider || !sigma2Slider || !muValue || !sigma2Value || !sampleBtn || !resetBtn || !resultEl || !totalEl || !plotEl || !theoryToggle || !binSlider || !binValue) {
    return;
  }

  let samples = [];
  let binSize = Number.parseFloat(binSlider.value);

  const resetSamples = () => {
    samples = [];
    totalEl.textContent = "Esperimenti eseguiti: 0";
  };

  const updateHistogram = () => {
    const mu = Number.parseFloat(muSlider.value);
    const sigma2 = Number.parseFloat(sigma2Slider.value);
    const yMax = 1;

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
          start: NORMAL_X_MIN,
          end: NORMAL_X_MAX,
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
      const xValues = Array.from({ length: 300 }, (_, index) => NORMAL_X_MIN + ((NORMAL_X_MAX - NORMAL_X_MIN) * index) / 299);
      const yValues = xValues.map((x) => normalPdf(mu, sigma2, x));
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
        range: [NORMAL_X_MIN, NORMAL_X_MAX],
        showgrid: false,
        zeroline: false,
        showline: true,
        ticks: ""
      },
      yaxis: {
        range: [0, 1],
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
    const mu = Number.parseFloat(muSlider.value);
    const sigma2 = Number.parseFloat(sigma2Slider.value);
    resetSamples();
    resultEl.textContent = "Esito: -";
    if (window.katex) {
      window.katex.render(mu.toFixed(1), muValue, { throwOnError: false });
      window.katex.render(sigma2.toFixed(1), sigma2Value, { throwOnError: false });
    } else {
      muValue.textContent = mu.toFixed(1);
      sigma2Value.textContent = sigma2.toFixed(1);
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
    const mu = Number.parseFloat(muSlider.value);
    const sigma2 = Number.parseFloat(sigma2Slider.value);
    const sample = normalSample(mu, sigma2);
    if (samples.length < NORMAL_MAX_SAMPLES) {
      samples.push(sample);
    }
    resultEl.textContent = `Esito: ${sample.toFixed(2)}`;
    totalEl.textContent = `Esperimenti eseguiti: ${samples.length}`;
    updateHistogram();
  };

  if (muSlider.dataset.bound !== "true") {
    muSlider.addEventListener("input", updateParams);
    muSlider.dataset.bound = "true";
  }

  if (sigma2Slider.dataset.bound !== "true") {
    sigma2Slider.addEventListener("input", updateParams);
    sigma2Slider.dataset.bound = "true";
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

export const initNormalSimulation = () => {
  bindNormalSimulation();
};
