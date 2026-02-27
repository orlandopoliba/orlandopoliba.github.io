const UNIFORM_X_MIN = 0;
const UNIFORM_X_MAX = 8;
const UNIFORM_MAX_SAMPLES = 5000;

const uniformSample = (a, b) => a + Math.random() * (b - a);

const uniformPdf = (a, b, x) => {
  if (x < a || x > b || b <= a) {
    return 0;
  }
  return 1 / (b - a);
};

const bindUniformSimulation = () => {
  const aSlider = document.getElementById("uniform-sim-a-slider");
  const bSlider = document.getElementById("uniform-sim-b-slider");
  const aValue = document.getElementById("uniform-sim-a-value");
  const bValue = document.getElementById("uniform-sim-b-value");
  const sampleBtn = document.getElementById("uniform-sample-btn");
  const resetBtn = document.getElementById("uniform-reset-btn");
  const resultEl = document.getElementById("uniform-result");
  const totalEl = document.getElementById("uniform-total");
  const plotEl = document.getElementById("uniform-hist");
  const theoryToggle = document.getElementById("uniform-theory-toggle");
  const binSlider = document.getElementById("uniform-bin-slider");
  const binValue = document.getElementById("uniform-bin-value");

  if (!aSlider || !bSlider || !aValue || !bValue || !sampleBtn || !resetBtn || !resultEl || !totalEl || !plotEl || !theoryToggle || !binSlider || !binValue) {
    return;
  }

  let samples = [];
  let binSize = Number.parseFloat(binSlider.value);

  const resetSamples = () => {
    samples = [];
    totalEl.textContent = "Esperimenti eseguiti: 0";
  };

  const getInterval = () => {
    const step = Number.parseFloat(aSlider.step || "0.01");
    let a = Number.parseFloat(aSlider.value);
    let b = Number.parseFloat(bSlider.value);

    if (a >= b) {
      if (aSlider === document.activeElement) {
        a = b - step;
        aSlider.value = a.toFixed(2);
      } else {
        b = a + step;
        bSlider.value = b.toFixed(2);
      }
    }

    a = Math.max(UNIFORM_X_MIN, Math.min(a, UNIFORM_X_MAX));
    b = Math.max(UNIFORM_X_MIN, Math.min(b, UNIFORM_X_MAX));

    if (aValue) {
      const text = a.toFixed(2);
      if (window.katex) {
        window.katex.render(text, aValue, { throwOnError: false });
      } else {
        aValue.textContent = text;
      }
    }

    if (bValue) {
      const text = b.toFixed(2);
      if (window.katex) {
        window.katex.render(text, bValue, { throwOnError: false });
      } else {
        bValue.textContent = text;
      }
    }

    return { a, b };
  };

  const updateHistogram = () => {
    const { a, b } = getInterval();
    const density = b > a ? 1 / (b - a) : 0;
    const yMax = Math.max(1.5, density * 1.4);

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
          start: UNIFORM_X_MIN,
          end: UNIFORM_X_MAX,
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

    if (theoryToggle.checked && b > a) {
      const density = 1 / (b - a);
      const stepX = [UNIFORM_X_MIN, a, a, b, b, UNIFORM_X_MAX];
      const stepY = [0, 0, density, density, 0, 0];
      data.push({
        x: stepX,
        y: stepY,
        type: "scatter",
        mode: "lines",
        line: { color: "#2e6f8e", width: 3, shape: "hv" },
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
        range: [UNIFORM_X_MIN, UNIFORM_X_MAX],
        showgrid: false,
        zeroline: false,
        showline: true,
        ticks: ""
      },
      yaxis: {
        range: [0, yMax],
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

  const updateInterval = () => {
    resetSamples();
    resultEl.textContent = "Esito: -";
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
    const { a, b } = getInterval();
    if (b <= a) {
      return;
    }
    const sample = uniformSample(a, b);
    if (samples.length < UNIFORM_MAX_SAMPLES) {
      samples.push(sample);
    }
    resultEl.textContent = `Esito: ${sample.toFixed(2)}`;
    totalEl.textContent = `Esperimenti eseguiti: ${samples.length}`;
    updateHistogram();
  };

  if (aSlider.dataset.bound !== "true") {
    aSlider.addEventListener("input", updateInterval);
    aSlider.dataset.bound = "true";
  }

  if (bSlider.dataset.bound !== "true") {
    bSlider.addEventListener("input", updateInterval);
    bSlider.dataset.bound = "true";
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

  updateInterval();
  updateBinValue();
  updateHistogram();
};

export const initUniformSimulation = () => {
  bindUniformSimulation();
};
