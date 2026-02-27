const POISSON_MAX_SAMPLES = 10000;
const POISSON_DISPLAY_MAX = 15;

const simulationState = {
  lambda: 3,
  counts: Array.from({ length: POISSON_DISPLAY_MAX + 1 }, () => 0),
  total: 0
};

const poissonSample = (lambda) => {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  while (p > L) {
    k += 1;
    p *= Math.random();
  }
  return k - 1;
};

const poissonPmf = (lambda, maxK) => {
  const values = [];
  let current = Math.exp(-lambda);
  values.push(current);
  for (let k = 1; k <= maxK; k += 1) {
    current *= lambda / k;
    values.push(current);
  }
  return values;
};

const resetHistory = () => {
  simulationState.counts = Array.from({ length: POISSON_DISPLAY_MAX + 1 }, () => 0);
  simulationState.total = 0;
};

const updatePoissonBar = () => {
  const plotEl = document.getElementById("poisson-plot");
  const theoryToggle = document.getElementById("poisson-theory-toggle");
  if (!plotEl) {
    return;
  }

  const frequencies = simulationState.total === 0
    ? simulationState.counts.map(() => 0)
    : simulationState.counts.map((count) => count / simulationState.total);

  const xValues = Array.from({ length: POISSON_DISPLAY_MAX + 1 }, (_, index) => index);

  const data = [
    {
      x: xValues,
      y: frequencies,
      type: "bar",
      marker: { color: "#b3713b", opacity: 0.8 },
      name: "Frequenze osservate"
    }
  ];

  if (theoryToggle && theoryToggle.checked) {
    data.push({
      x: xValues,
      y: poissonPmf(simulationState.lambda, POISSON_DISPLAY_MAX),
      type: "bar",
      marker: { color: "#2e6f8e", opacity: 0.8 },
      name: "Legge teorica"
    });
  }

  const plotWidth = Math.max(320, Math.round(plotEl.clientWidth));
  const layout = {
    margin: { t: 10, r: 10, b: 40, l: 40 },
    height: 260,
    width: plotWidth,
    autosize: false,
    xaxis: {
      tickmode: "array",
      tickvals: xValues,
      ticktext: xValues.map((value) => String(value)),
      range: [-0.5, POISSON_DISPLAY_MAX + 0.5],
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

  Plotly.react(plotEl, data, layout, {displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true})
    .then(() => {
      if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
      }
    });
};

const bindPoissonTrial = () => {
  const poissonBtn = document.getElementById("poisson-btn");
  const resetBtn = document.getElementById("poisson-reset-btn");
  const poissonResult = document.getElementById("poisson-result");
  const poissonTotal = document.getElementById("poisson-total");
  const theoryToggle = document.getElementById("poisson-theory-toggle");
  const lambdaSlider = document.getElementById("poisson-lambda-slider");
  const lambdaValue = document.getElementById("poisson-lambda-value");

  if (!poissonBtn || !poissonTotal || !poissonResult || !theoryToggle || !lambdaSlider || !lambdaValue) {
    return;
  }

  const updateParameterValues = () => {
    const lambda = Number.parseFloat(lambdaSlider.value);

    if (simulationState.lambda !== lambda) {
      simulationState.lambda = lambda;
      resetHistory();
      poissonResult.textContent = "Esito: -";
      poissonTotal.textContent = "Esperimenti eseguiti: 0";
    }

    if (window.katex) {
      window.katex.render(lambda.toFixed(1), lambdaValue, { throwOnError: false });
    } else {
      lambdaValue.textContent = lambda.toFixed(1);
    }
    updatePoissonBar();
  };

  if (poissonBtn.dataset.bound !== "true") {
    lambdaSlider.addEventListener("input", updateParameterValues);
    updateParameterValues();

    theoryToggle.addEventListener("change", () => {
      updatePoissonBar();
    });

    const applyTrial = () => {
      if (simulationState.total >= POISSON_MAX_SAMPLES) {
        return false;
      }
      const result = poissonSample(simulationState.lambda);
      poissonResult.textContent = `Esito: ${result}`;
      poissonTotal.textContent = `Esperimenti eseguiti: ${simulationState.total + 1}`;
      const index = result > POISSON_DISPLAY_MAX ? POISSON_DISPLAY_MAX : result;
      simulationState.counts[index] += 1;
      simulationState.total += 1;
      updatePoissonBar();
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

    poissonBtn.addEventListener("mousedown", onPressStart);
    poissonBtn.addEventListener("touchstart", onPressStart, { passive: true });
    poissonBtn.addEventListener("mouseup", onPressEnd);
    poissonBtn.addEventListener("mouseleave", onPressEnd);
    poissonBtn.addEventListener("touchend", onPressEnd);
    poissonBtn.addEventListener("touchcancel", onPressEnd);
    poissonBtn.dataset.bound = "true";
  }

  if (resetBtn && resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      resetHistory();
      poissonResult.textContent = "Esito: -";
      poissonTotal.textContent = "Prove totali: 0";
      updatePoissonBar();
    });
    resetBtn.dataset.bound = "true";
  }
};

export const initPoissonSimulation = () => {
  bindPoissonTrial();
  updatePoissonBar();
};
