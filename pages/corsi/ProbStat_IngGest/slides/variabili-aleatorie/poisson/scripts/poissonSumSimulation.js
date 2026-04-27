const POISSON_SUM_MAX_SAMPLES = 10000;

const sumSimulationState = {
  lambda1: 3,
  lambda2: 2,
  displayMax: 15,
  counts: Array.from({ length: 16 }, () => 0),
  total: 0
};

const poissonSample = (lambda) => {
  const threshold = Math.exp(-lambda);
  let k = 0;
  let product = 1;

  while (product > threshold) {
    k += 1;
    product *= Math.random();
  }

  return k - 1;
};

const getDisplayMax = (lambdaSum) => Math.max(15, Math.ceil(lambdaSum + 4 * Math.sqrt(lambdaSum)));

const resetSumHistory = () => {
  const lambdaSum = sumSimulationState.lambda1 + sumSimulationState.lambda2;
  sumSimulationState.displayMax = getDisplayMax(lambdaSum);
  sumSimulationState.counts = Array.from({ length: sumSimulationState.displayMax + 1 }, () => 0);
  sumSimulationState.total = 0;
};

const poissonPmfWithTail = (lambda, maxK) => {
  const values = [];
  let current = Math.exp(-lambda);
  let partialSum = current;

  values.push(current);

  for (let k = 1; k < maxK; k += 1) {
    current *= lambda / k;
    values.push(current);
    partialSum += current;
  }

  values.push(Math.max(0, 1 - partialSum));
  return values;
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

const updateSumBar = () => {
  const plotEl = document.getElementById("poisson-sum-plot");
  const theoryToggle = document.getElementById("poisson-sum-theory-toggle");

  if (!plotEl) {
    return;
  }

  const frequencies = sumSimulationState.total === 0
    ? sumSimulationState.counts.map(() => 0)
    : sumSimulationState.counts.map((count) => count / sumSimulationState.total);

  const support = Array.from({ length: sumSimulationState.displayMax + 1 }, (_, index) => index);
  const tickText = support.map((value, index) => (
    index === sumSimulationState.displayMax ? `${value}+` : String(value)
  ));

  const plotWidth = Math.max(320, Math.round(plotEl.clientWidth));
  const layout = {
    margin: { t: 10, r: 10, b: 40, l: 40 },
    height: 260,
    width: plotWidth,
    autosize: false,
    xaxis: {
      tickmode: "array",
      tickvals: support,
      ticktext: tickText,
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, 0.4],
      showgrid: true,
      zeroline: false,
      showline: true,
      showticklabels: true,
      ticks: ""
    },
    paper_bgcolor: "rgb(247, 247, 247)",
    plot_bgcolor: "rgb(247, 247, 247)",
    barmode: "overlay",
    showlegend: false
  };

  const data = [
    {
      x: support,
      y: frequencies,
      type: "bar",
      marker: { color: "#b3713b", opacity: 0.8 },
      name: "Frequenze osservate"
    }
  ];

  if (theoryToggle && theoryToggle.checked) {
    data.push({
      x: support,
      y: poissonPmfWithTail(sumSimulationState.lambda1 + sumSimulationState.lambda2, sumSimulationState.displayMax),
      type: "bar",
      marker: { color: "#2e6f8e", opacity: 0.8 },
      name: "Legge teorica"
    });
  }

  Plotly.react(plotEl, data, layout, { displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true })
    .then(() => {
      if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
      }
    });
};

const bindPoissonSumSimulation = () => {
  const sampleBtn = document.getElementById("poisson-sum-btn");
  const resetBtn = document.getElementById("poisson-sum-reset-btn");
  const lambda1Slider = document.getElementById("poisson-sum-lambda-1-slider");
  const lambda2Slider = document.getElementById("poisson-sum-lambda-2-slider");
  const lambda1Value = document.getElementById("poisson-sum-lambda-1-value");
  const lambda2Value = document.getElementById("poisson-sum-lambda-2-value");
  const x1Line = document.getElementById("poisson-sum-x1");
  const x2Line = document.getElementById("poisson-sum-x2");
  const resultLine = document.getElementById("poisson-sum-result");
  const totalLine = document.getElementById("poisson-sum-total");
  const theoryToggle = document.getElementById("poisson-sum-theory-toggle");

  if (
    !sampleBtn
    || !lambda1Slider
    || !lambda2Slider
    || !lambda1Value
    || !lambda2Value
    || !x1Line
    || !x2Line
    || !resultLine
    || !totalLine
    || !theoryToggle
  ) {
    return;
  }

  const renderSampleValues = (x1 = null, x2 = null) => {
    const sum = x1 === null || x2 === null ? null : x1 + x2;

    renderMathText(x1Line, `X_1 = ${x1 === null ? "-" : x1}`, `X1 = ${x1 === null ? "-" : x1}`);
    renderMathText(x2Line, `X_2 = ${x2 === null ? "-" : x2}`, `X2 = ${x2 === null ? "-" : x2}`);
    renderMathText(
      resultLine,
      `X_1 + X_2 = ${sum === null ? "-" : sum}`,
      `X1 + X2 = ${sum === null ? "-" : sum}`
    );
  };

  const updateParameterValues = () => {
    const lambda1 = Number.parseFloat(lambda1Slider.value);
    const lambda2 = Number.parseFloat(lambda2Slider.value);

    if (sumSimulationState.lambda1 !== lambda1 || sumSimulationState.lambda2 !== lambda2) {
      sumSimulationState.lambda1 = lambda1;
      sumSimulationState.lambda2 = lambda2;
      resetSumHistory();
      renderSampleValues();
      totalLine.textContent = "Esperimenti eseguiti: 0";
    }

    if (window.katex) {
      window.katex.render(lambda1.toFixed(1), lambda1Value, { throwOnError: false });
      window.katex.render(lambda2.toFixed(1), lambda2Value, { throwOnError: false });
    } else {
      lambda1Value.textContent = lambda1.toFixed(1);
      lambda2Value.textContent = lambda2.toFixed(1);
    }

    updateSumBar();
  };

  if (sampleBtn.dataset.bound !== "true") {
    lambda1Slider.addEventListener("input", updateParameterValues);
    lambda2Slider.addEventListener("input", updateParameterValues);
    theoryToggle.addEventListener("change", () => updateSumBar());
    updateParameterValues();

    const applyTrial = () => {
      if (sumSimulationState.total >= POISSON_SUM_MAX_SAMPLES) {
        return false;
      }

      const x1 = poissonSample(sumSimulationState.lambda1);
      const x2 = poissonSample(sumSimulationState.lambda2);
      const sum = x1 + x2;
      const bucket = Math.min(sum, sumSimulationState.displayMax);

      renderSampleValues(x1, x2);
      sumSimulationState.counts[bucket] += 1;
      sumSimulationState.total += 1;
      totalLine.textContent = `Esperimenti eseguiti: ${sumSimulationState.total}`;
      updateSumBar();
      return true;
    };

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
          if (!applyTrial()) {
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
        applyTrial();
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

  if (resetBtn && resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      resetSumHistory();
      renderSampleValues();
      totalLine.textContent = "Esperimenti eseguiti: 0";
      updateSumBar();
    });
    resetBtn.dataset.bound = "true";
  }

  renderSampleValues();
};

export const initPoissonSumSimulation = () => {
  bindPoissonSumSimulation();
  updateSumBar();
};
