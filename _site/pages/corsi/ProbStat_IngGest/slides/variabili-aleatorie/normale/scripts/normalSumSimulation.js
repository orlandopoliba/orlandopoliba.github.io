const NORMAL_SUM_MAX_SAMPLES = 5000;

const normalSumState = {
  mu: 0,
  sigma2: 1,
  nu: 0,
  tau2: 1,
  binSize: 0.25,
  showTheory: false,
  samples: [],
  total: 0,
  lastX: null,
  lastY: null
};

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

const renderMathText = (element, expression, fallback) => {
  if (!element) {
    return;
  }

  if (window.katex) {
    window.katex.render(expression, element, { throwOnError: false });
    return;
  }

  element.textContent = fallback;
};

const resetSumSamples = () => {
  normalSumState.samples = [];
  normalSumState.total = 0;
  normalSumState.lastX = null;
  normalSumState.lastY = null;
};

const getSumRange = () => {
  const mean = normalSumState.mu + normalSumState.nu;
  const variance = normalSumState.sigma2 + normalSumState.tau2;
  const standardDeviation = Math.sqrt(variance);
  const halfSpan = Math.max(6, 4.5 * standardDeviation);
  return [mean - halfSpan, mean + halfSpan];
};

const updateNormalSumHistogram = (plotEl) => {
  if (!plotEl) {
    return;
  }

  const mean = normalSumState.mu + normalSumState.nu;
  const variance = normalSumState.sigma2 + normalSumState.tau2;
  const [xMin, xMax] = getSumRange();

  const data = normalSumState.samples.length === 0
    ? [{
      x: [0],
      y: [0],
      type: "scatter",
      mode: "markers",
      marker: { opacity: 0 },
      hoverinfo: "skip"
    }]
    : [{
      x: [...normalSumState.samples],
      type: "histogram",
      histnorm: "probability density",
      xbins: {
        start: xMin,
        end: xMax,
        size: normalSumState.binSize
      },
      marker: { color: "#b3713b", opacity: 0.8 },
      name: "Frequenze osservate"
    }];

  if (normalSumState.samples.length > 0) {
    data.push({
      x: [...normalSumState.samples],
      y: normalSumState.samples.map(() => 0),
      type: "scatter",
      mode: "markers",
      marker: { color: "#444444", size: 9, opacity: 0.6 },
      cliponaxis: false,
      name: "Campioni",
      hoverinfo: "skip"
    });
  }

  if (normalSumState.showTheory) {
    const xValues = Array.from(
      { length: 300 },
      (_, index) => xMin + ((xMax - xMin) * index) / 299
    );

    data.push({
      x: xValues,
      y: xValues.map((x) => normalPdf(mean, variance, x)),
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
      range: [xMin, xMax],
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

  Plotly.react(
    plotEl,
    data,
    layout,
    { displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true }
  ).then(() => {
    if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
      window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
    }
  });
};

const bindNormalSumSimulation = () => {
  const muSlider = document.getElementById("normal-sum-mu-slider");
  const sigma2Slider = document.getElementById("normal-sum-sigma2-slider");
  const nuSlider = document.getElementById("normal-sum-nu-slider");
  const tau2Slider = document.getElementById("normal-sum-tau2-slider");
  const muValue = document.getElementById("normal-sum-mu-value");
  const sigma2Value = document.getElementById("normal-sum-sigma2-value");
  const nuValue = document.getElementById("normal-sum-nu-value");
  const tau2Value = document.getElementById("normal-sum-tau2-value");
  const sampleBtn = document.getElementById("normal-sum-btn");
  const resetBtn = document.getElementById("normal-sum-reset-btn");
  const xLine = document.getElementById("normal-sum-x");
  const yLine = document.getElementById("normal-sum-y");
  const resultLine = document.getElementById("normal-sum-result");
  const totalLine = document.getElementById("normal-sum-total");
  const plotEl = document.getElementById("normal-sum-hist");
  const theoryToggle = document.getElementById("normal-sum-theory-toggle");
  const binSlider = document.getElementById("normal-sum-bin-slider");
  const binValue = document.getElementById("normal-sum-bin-value");

  if (
    !muSlider
    || !sigma2Slider
    || !nuSlider
    || !tau2Slider
    || !muValue
    || !sigma2Value
    || !nuValue
    || !tau2Value
    || !sampleBtn
    || !resetBtn
    || !xLine
    || !yLine
    || !resultLine
    || !totalLine
    || !plotEl
    || !theoryToggle
    || !binSlider
    || !binValue
  ) {
    return;
  }

  const renderSampleValues = () => {
    const xValue = normalSumState.lastX;
    const yValue = normalSumState.lastY;
    const sumValue = xValue === null || yValue === null ? null : xValue + yValue;

    renderMathText(
      xLine,
      `X = ${xValue === null ? "-" : xValue.toFixed(2)}`,
      `X = ${xValue === null ? "-" : xValue.toFixed(2)}`
    );
    renderMathText(
      yLine,
      `Y = ${yValue === null ? "-" : yValue.toFixed(2)}`,
      `Y = ${yValue === null ? "-" : yValue.toFixed(2)}`
    );
    renderMathText(
      resultLine,
      `X + Y = ${sumValue === null ? "-" : sumValue.toFixed(2)}`,
      `X + Y = ${sumValue === null ? "-" : sumValue.toFixed(2)}`
    );
  };

  const renderParameterValues = () => {
    if (window.katex) {
      window.katex.render(normalSumState.mu.toFixed(1), muValue, { throwOnError: false });
      window.katex.render(normalSumState.sigma2.toFixed(1), sigma2Value, { throwOnError: false });
      window.katex.render(normalSumState.nu.toFixed(1), nuValue, { throwOnError: false });
      window.katex.render(normalSumState.tau2.toFixed(1), tau2Value, { throwOnError: false });
      window.katex.render(normalSumState.binSize.toFixed(2), binValue, { throwOnError: false });
    } else {
      muValue.textContent = normalSumState.mu.toFixed(1);
      sigma2Value.textContent = normalSumState.sigma2.toFixed(1);
      nuValue.textContent = normalSumState.nu.toFixed(1);
      tau2Value.textContent = normalSumState.tau2.toFixed(1);
      binValue.textContent = normalSumState.binSize.toFixed(2);
    }
  };

  const syncView = () => {
    muSlider.value = normalSumState.mu.toFixed(1);
    sigma2Slider.value = normalSumState.sigma2.toFixed(1);
    nuSlider.value = normalSumState.nu.toFixed(1);
    tau2Slider.value = normalSumState.tau2.toFixed(1);
    binSlider.value = normalSumState.binSize.toFixed(2);
    theoryToggle.checked = normalSumState.showTheory;

    renderParameterValues();
    renderSampleValues();
    totalLine.textContent = `Esperimenti eseguiti: ${normalSumState.total}`;
    updateNormalSumHistogram(plotEl);
  };

  const updateParameters = () => {
    const nextMu = Number.parseFloat(muSlider.value);
    const nextSigma2 = Number.parseFloat(sigma2Slider.value);
    const nextNu = Number.parseFloat(nuSlider.value);
    const nextTau2 = Number.parseFloat(tau2Slider.value);

    if (
      normalSumState.mu !== nextMu
      || normalSumState.sigma2 !== nextSigma2
      || normalSumState.nu !== nextNu
      || normalSumState.tau2 !== nextTau2
    ) {
      normalSumState.mu = nextMu;
      normalSumState.sigma2 = nextSigma2;
      normalSumState.nu = nextNu;
      normalSumState.tau2 = nextTau2;
      resetSumSamples();
    }

    syncView();
  };

  const updateBinSize = () => {
    normalSumState.binSize = Number.parseFloat(binSlider.value);
    syncView();
  };

  const updateTheoryToggle = () => {
    normalSumState.showTheory = theoryToggle.checked;
    updateNormalSumHistogram(plotEl);
  };

  const applySample = () => {
    if (normalSumState.total >= NORMAL_SUM_MAX_SAMPLES) {
      return false;
    }

    const xValue = normalSample(normalSumState.mu, normalSumState.sigma2);
    const yValue = normalSample(normalSumState.nu, normalSumState.tau2);

    normalSumState.lastX = xValue;
    normalSumState.lastY = yValue;
    normalSumState.samples.push(xValue + yValue);
    normalSumState.total += 1;

    renderSampleValues();
    totalLine.textContent = `Esperimenti eseguiti: ${normalSumState.total}`;
    updateNormalSumHistogram(plotEl);
    return true;
  };

  if (muSlider.dataset.bound !== "true") {
    muSlider.addEventListener("input", updateParameters);
    muSlider.dataset.bound = "true";
  }

  if (sigma2Slider.dataset.bound !== "true") {
    sigma2Slider.addEventListener("input", updateParameters);
    sigma2Slider.dataset.bound = "true";
  }

  if (nuSlider.dataset.bound !== "true") {
    nuSlider.addEventListener("input", updateParameters);
    nuSlider.dataset.bound = "true";
  }

  if (tau2Slider.dataset.bound !== "true") {
    tau2Slider.addEventListener("input", updateParameters);
    tau2Slider.dataset.bound = "true";
  }

  if (binSlider.dataset.bound !== "true") {
    binSlider.addEventListener("input", updateBinSize);
    binSlider.dataset.bound = "true";
  }

  if (theoryToggle.dataset.bound !== "true") {
    theoryToggle.addEventListener("change", updateTheoryToggle);
    theoryToggle.dataset.bound = "true";
  }

  if (resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      resetSumSamples();
      syncView();
    });
    resetBtn.dataset.bound = "true";
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
        for (let index = 0; index < 5; index += 1) {
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

      const shouldApplySingleSample = !longPressActive;

      if (holdIntervalId !== null) {
        window.clearInterval(holdIntervalId);
        holdIntervalId = null;
      }

      if (longPressTimerId !== null) {
        window.clearTimeout(longPressTimerId);
        longPressTimerId = null;
      }

      isPressing = false;
      longPressActive = false;

      if (shouldApplySingleSample) {
        applySample();
      }
    };

    const onPressStart = (event) => {
      if (event.button !== undefined && event.button !== 0) {
        return;
      }

      if (isPressing) {
        return;
      }

      isPressing = true;
      longPressActive = false;
      longPressTimerId = window.setTimeout(startHold, 300);
    };

    sampleBtn.addEventListener("pointerdown", onPressStart);
    sampleBtn.addEventListener("pointercancel", stopHold);
    sampleBtn.addEventListener("lostpointercapture", stopHold);
    window.addEventListener("pointerup", stopHold);
    window.addEventListener("blur", stopHold);
    sampleBtn.dataset.bound = "true";
  }

  syncView();
};

const initNormalSumSimulation = () => {
  bindNormalSumSimulation();
};

export { initNormalSumSimulation };
