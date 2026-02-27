const EXPONENTIAL_X_MAX = 8;
const EXPONENTIAL_MAX_SAMPLES = 5000;

const exponentialSample = (lambda) => -Math.log(Math.random()) / lambda;

const bindExponentialSimulation = () => {
  const lambdaSlider = document.getElementById("exponential-lambda-slider");
  const lambdaValue = document.getElementById("exponential-lambda-value");
  const sampleBtn = document.getElementById("exponential-sample-btn");
  const resetBtn = document.getElementById("exponential-reset-btn");
  const resultEl = document.getElementById("exponential-result");
  const totalEl = document.getElementById("exponential-total");
  const modeToggle = document.getElementById("exponential-mode-toggle");
  const realLabel = document.getElementById("exponential-mode-real-label");
  const simLabel = document.getElementById("exponential-mode-sim-label");
  const plotEl = document.getElementById("exponential-hist");
  const theoryToggle = document.getElementById("exponential-theory-toggle");
  const binSlider = document.getElementById("exponential-bin-slider");
  const binValue = document.getElementById("exponential-bin-value");

  if (!lambdaSlider || !lambdaValue || !sampleBtn || !resetBtn || !resultEl || !totalEl || !modeToggle || !realLabel || !simLabel || !plotEl || !theoryToggle || !binSlider || !binValue) {
    return;
  }

  let waitIntervalId = null;
  let waitTarget = 0;
  let waitElapsed = 0;
  let samples = [];
  let binSize = Number.parseFloat(binSlider.value);

  const clearWaitTimer = () => {
    if (waitIntervalId !== null) {
      window.clearInterval(waitIntervalId);
      waitIntervalId = null;
    }
    waitTarget = 0;
    waitElapsed = 0;
  };

  const resetSamples = () => {
    samples = [];
    totalEl.textContent = "Esperimenti eseguiti: 0";
  };

  const updateHistogram = () => {
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
          start: 0,
          end: EXPONENTIAL_X_MAX,
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
      const xValues = Array.from({ length: 200 }, (_, index) => (EXPONENTIAL_X_MAX * index) / 199);
      const lambda = Number.parseFloat(lambdaSlider.value);
      const yValues = xValues.map((x) => (x < 0 ? 0 : lambda * Math.exp(-lambda * x)));
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
        range: [0, EXPONENTIAL_X_MAX],
        showgrid: false,
        zeroline: false,
        showline: true,
        ticks: ""
      },
      yaxis: {
        range: [0, 2],
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

    Plotly.react(plotEl, data, layout, {displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true})
      .then(() => {
        if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
          window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
        }
      });
  };

  const updateLambdaValue = () => {
    const lambda = Number.parseFloat(lambdaSlider.value);
    resetSamples();
    clearWaitTimer();
    resultEl.textContent = "Tempo atteso: -";
    sampleBtn.disabled = false;
    if (window.katex) {
      window.katex.render(lambda.toFixed(1), lambdaValue, { throwOnError: false });
    } else {
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

  const applySimulatedSample = () => {
    const lambda = Number.parseFloat(lambdaSlider.value);
    const sample = exponentialSample(lambda);
    if (samples.length < EXPONENTIAL_MAX_SAMPLES) {
      samples.push(sample);
    }
    resultEl.textContent = `Tempo atteso: ${sample.toFixed(2)}s`;
    totalEl.textContent = `Esperimenti eseguiti: ${samples.length}`;
    updateHistogram();
  };

  const applyRealSample = () => {
    const lambda = Number.parseFloat(lambdaSlider.value);
    const sample = exponentialSample(lambda);
    if (samples.length < EXPONENTIAL_MAX_SAMPLES) {
      samples.push(sample);
    }
    totalEl.textContent = `Esperimenti eseguiti: ${samples.length}`;
    waitTarget = sample;
    waitElapsed = 0;
    sampleBtn.disabled = true;
    resultEl.textContent = "Tempo atteso: 0.00s";
    waitIntervalId = window.setInterval(() => {
      waitElapsed += 0.01;
      if (waitElapsed >= waitTarget) {
        waitElapsed = waitTarget;
      }
      resultEl.textContent = `Tempo atteso: ${waitElapsed.toFixed(2)}s`;
      if (waitElapsed >= waitTarget) {
        clearWaitTimer();
        sampleBtn.disabled = false;
        updateHistogram();
      }
    }, 10);
  };

  const applySample = () => {
    if (modeToggle.checked) {
      applySimulatedSample();
      return true;
    }
    if (waitIntervalId !== null) {
      return false;
    }
    applyRealSample();
    return false;
  };

  const updateMode = () => {
    const isSim = modeToggle.checked;
    sampleBtn.disabled = isSim ? false : waitIntervalId !== null;
    realLabel.classList.toggle("is-muted", isSim);
    simLabel.classList.toggle("is-muted", !isSim);
    if (isSim && waitIntervalId !== null) {
      clearWaitTimer();
      sampleBtn.disabled = false;
    }
  };

  if (lambdaSlider.dataset.bound !== "true") {
    lambdaSlider.addEventListener("input", updateLambdaValue);
    lambdaSlider.dataset.bound = "true";
  }

  if (sampleBtn.dataset.bound !== "true") {
    let holdIntervalId = null;
    let longPressTimerId = null;
    let longPressActive = false;
    let isPressing = false;

    const startHold = () => {
      if (!modeToggle.checked) {
        return;
      }
      if (holdIntervalId !== null) {
        return;
      }
      longPressActive = true;
      holdIntervalId = window.setInterval(() => {
        for (let i = 0; i < 5; i += 1) {
          if (!applySample()) {
            stopHold();
            break;
          }
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
      if (!modeToggle.checked) {
        applySample();
        return;
      }
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

  if (modeToggle.dataset.bound !== "true") {
    modeToggle.addEventListener("change", updateMode);
    modeToggle.dataset.bound = "true";
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
      clearWaitTimer();
      resetSamples();
      resultEl.textContent = "Tempo atteso: -";
      updateHistogram();
      if (!modeToggle.checked) {
        sampleBtn.disabled = false;
      }
    });
    resetBtn.dataset.bound = "true";
  }

  updateLambdaValue();
  updateMode();
  updateBinValue();
  updateHistogram();
};

export const initExponentialSimulation = () => {
  bindExponentialSimulation();
};
