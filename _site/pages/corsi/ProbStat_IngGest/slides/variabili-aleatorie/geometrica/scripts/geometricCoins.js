const GEOMETRIC_MAX_SAMPLES = 10000;
const COIN_SUCCESS_PROBABILITY = 0.5;
const GEOMETRIC_DISPLAY_MAX = 20;

const experimentHistory = {
  counts: Array.from({ length: GEOMETRIC_DISPLAY_MAX }, () => 0),
  total: 0
};

const currentRun = {
  sequence: [],
  finished: false
};

const geometricPmfWithTail = (p) => {
  const values = [];
  for (let k = 1; k < GEOMETRIC_DISPLAY_MAX; k += 1) {
    values.push((1 - p) ** (k - 1) * p);
  }
  values.push((1 - p) ** (GEOMETRIC_DISPLAY_MAX - 1));
  return values;
};

const formatSequence = (sequence, maxShown = 14) => {
  if (sequence.length === 0) {
    return "-";
  }
  if (sequence.length <= maxShown) {
    return sequence.join(" ");
  }
  const prefix = sequence.slice(0, maxShown - 1).join(" ");
  return `${prefix} ... ${sequence[sequence.length - 1]}`;
};

const updateGeometricCoinsBar = () => {
  const plotEl = document.getElementById("geometric-coin-plot");
  const theoryToggle = document.getElementById("geometric-coin-theory-toggle");
  if (!plotEl) {
    return;
  }

  const frequencies = experimentHistory.total === 0
    ? experimentHistory.counts.map(() => 0)
    : experimentHistory.counts.map((count) => count / experimentHistory.total);

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
      y: geometricPmfWithTail(COIN_SUCCESS_PROBABILITY),
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

const bindGeometricCoins = () => {
  const coinBtn = document.getElementById("geometric-coin-btn");
  const resetBtn = document.getElementById("geometric-coin-reset-btn");
  const sequenceEl = document.getElementById("geometric-coin-sequence");
  const countEl = document.getElementById("geometric-coin-count");
  const totalEl = document.getElementById("geometric-coin-total");
  const theoryToggle = document.getElementById("geometric-coin-theory-toggle");

  if (!coinBtn || !totalEl || !sequenceEl || !countEl || !theoryToggle) {
    return;
  }

  if (coinBtn.dataset.bound !== "true") {
    theoryToggle.addEventListener("change", () => {
      updateGeometricCoinsBar();
    });

    const resetCurrentRun = () => {
      currentRun.sequence = [];
      currentRun.finished = false;
      sequenceEl.textContent = "Sequenza di lanci: -";
      countEl.textContent = "Prima testa: -";
    };

    const applyExperiment = () => {
      if (experimentHistory.total >= GEOMETRIC_MAX_SAMPLES) {
        return false;
      }
      if (currentRun.finished) {
        resetCurrentRun();
      }

      const result = Math.random() < COIN_SUCCESS_PROBABILITY ? 1 : 0;
      currentRun.sequence.push(result);
      sequenceEl.textContent = `Sequenza di lanci: ${formatSequence(currentRun.sequence)}`;

      if (result === 1) {
        const trials = currentRun.sequence.length;
        countEl.textContent = `Prima testa: ${trials}`;
        totalEl.textContent = `Esperimenti eseguiti: ${experimentHistory.total + 1}`;
        const index = trials >= GEOMETRIC_DISPLAY_MAX ? GEOMETRIC_DISPLAY_MAX - 1 : trials - 1;
        experimentHistory.counts[index] += 1;
        experimentHistory.total += 1;
        currentRun.finished = true;
        updateGeometricCoinsBar();
      }
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
          if (!applyExperiment()) {
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
        applyExperiment();
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

    coinBtn.addEventListener("mousedown", onPressStart);
    coinBtn.addEventListener("touchstart", onPressStart, { passive: true });
    coinBtn.addEventListener("mouseup", onPressEnd);
    coinBtn.addEventListener("mouseleave", onPressEnd);
    coinBtn.addEventListener("touchend", onPressEnd);
    coinBtn.addEventListener("touchcancel", onPressEnd);
    coinBtn.dataset.bound = "true";
  }

  if (resetBtn && resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      experimentHistory.counts = Array.from({ length: GEOMETRIC_DISPLAY_MAX }, () => 0);
      experimentHistory.total = 0;
      currentRun.sequence = [];
      currentRun.finished = false;
      sequenceEl.textContent = "Sequenza di lanci: -";
      countEl.textContent = "Prima testa: -";
      totalEl.textContent = "Esperimenti eseguiti: 0";
      updateGeometricCoinsBar();
    });
    resetBtn.dataset.bound = "true";
  }
};

export const initGeometricCoins = () => {
  bindGeometricCoins();
  updateGeometricCoinsBar();
};
