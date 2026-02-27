const GEOMETRIC_MAX_SAMPLES = 10000;
const GEOMETRIC_DISPLAY_MAX = 20;

const simulationState = {
  p: 0.5,
  counts: Array.from({ length: GEOMETRIC_DISPLAY_MAX }, () => 0),
  total: 0
};

const geometricPmfWithTail = (p) => {
  const values = [];
  for (let k = 1; k < GEOMETRIC_DISPLAY_MAX; k += 1) {
    values.push((1 - p) ** (k - 1) * p);
  }
  values.push((1 - p) ** (GEOMETRIC_DISPLAY_MAX - 1));
  return values;
};

const formatSequence = (trials, maxShown = 14) => {
  if (trials <= maxShown) {
    const values = Array.from({ length: Math.max(0, trials - 1) }, () => 0).concat(1);
    return values.join(" ");
  }
  const prefix = Array.from({ length: Math.max(0, maxShown - 1) }, () => 0).join(" ");
  return `${prefix} ... 1`;
};

const resetHistory = () => {
  simulationState.counts = Array.from({ length: GEOMETRIC_DISPLAY_MAX }, () => 0);
  simulationState.total = 0;
};

const updateGeometricBar = () => {
  const plotEl = document.getElementById("geometric-plot");
  const theoryToggle = document.getElementById("geometric-theory-toggle");
  if (!plotEl) {
    return;
  }

  const frequencies = simulationState.total === 0
    ? simulationState.counts.map(() => 0)
    : simulationState.counts.map((count) => count / simulationState.total);

  const xValues = Array.from({ length: GEOMETRIC_DISPLAY_MAX }, (_, index) => index + 1);
  const tickText = xValues.map((value, index) => (
    index === GEOMETRIC_DISPLAY_MAX - 1 ? `${GEOMETRIC_DISPLAY_MAX}+` : String(value)
  ));

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
      y: geometricPmfWithTail(simulationState.p),
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
      ticktext: tickText,
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

const bindGeometricTrial = () => {
  const geometricBtn = document.getElementById("geometric-btn");
  const resetBtn = document.getElementById("geometric-reset-btn");
  const geometricResult = document.getElementById("geometric-result");
  const geometricCount = document.getElementById("geometric-count");
  const geometricTotal = document.getElementById("geometric-total");
  const theoryToggle = document.getElementById("geometric-theory-toggle");
  const pSlider = document.getElementById("geometric-p-slider");
  const pValue = document.getElementById("geometric-p-value");

  if (!geometricBtn || !geometricTotal || !geometricResult || !geometricCount || !theoryToggle || !pSlider || !pValue) {
    return;
  }

  const updateParameterValues = () => {
    const p = Number.parseFloat(pSlider.value);

    if (simulationState.p !== p) {
      simulationState.p = p;
      resetHistory();
      geometricResult.textContent = "Sequenza di esiti: -";
      geometricCount.textContent = "Primo successo: -";
      geometricTotal.textContent = "Esperimenti eseguiti: 0";
    }

    if (window.katex) {
      window.katex.render(p.toFixed(2), pValue, { throwOnError: false });
    } else {
      pValue.textContent = p.toFixed(2);
    }
    updateGeometricBar();
  };

  if (geometricBtn.dataset.bound !== "true") {
    pSlider.addEventListener("input", updateParameterValues);
    updateParameterValues();

    theoryToggle.addEventListener("change", () => {
      updateGeometricBar();
    });

    const applyTrial = () => {
      if (simulationState.total >= GEOMETRIC_MAX_SAMPLES) {
        return false;
      }
      let trials = 0;
      while (true) {
        trials += 1;
        if (Math.random() < simulationState.p) {
          break;
        }
      }

      geometricResult.textContent = `Sequenza di prove: ${formatSequence(trials)}`;
      geometricCount.textContent = `Primo successo: ${trials}`;
      geometricTotal.textContent = `Esperimenti eseguiti: ${simulationState.total + 1}`;

      const index = trials >= GEOMETRIC_DISPLAY_MAX ? GEOMETRIC_DISPLAY_MAX - 1 : trials - 1;
      simulationState.counts[index] += 1;
      simulationState.total += 1;
      updateGeometricBar();
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

    geometricBtn.addEventListener("mousedown", onPressStart);
    geometricBtn.addEventListener("touchstart", onPressStart, { passive: true });
    geometricBtn.addEventListener("mouseup", onPressEnd);
    geometricBtn.addEventListener("mouseleave", onPressEnd);
    geometricBtn.addEventListener("touchend", onPressEnd);
    geometricBtn.addEventListener("touchcancel", onPressEnd);
    geometricBtn.dataset.bound = "true";
  }

  if (resetBtn && resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      resetHistory();
      geometricResult.textContent = "Esito: -";
      geometricCount.textContent = "Numero di lanci: -";
      geometricTotal.textContent = "Prove totali: 0";
      updateGeometricBar();
    });
    resetBtn.dataset.bound = "true";
  }
};

export const initGeometricSimulation = () => {
  bindGeometricTrial();
  updateGeometricBar();
};
