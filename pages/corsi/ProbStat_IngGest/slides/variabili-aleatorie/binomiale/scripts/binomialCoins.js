const BINOMIAL_MAX_SAMPLES = 10000;
const COINS_PER_EXPERIMENT = 4;

const experimentHistory = {
  counts: Array.from({ length: COINS_PER_EXPERIMENT + 1 }, () => 0),
  total: 0
};

const combination = (n, k) => {
  const safeK = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= safeK; i += 1) {
    result *= (n - safeK + i) / i;
  }
  return result;
};

const binomialPmf = (n, p) => {
  const values = [];
  for (let k = 0; k <= n; k += 1) {
    values.push(combination(n, k) * (p ** k) * ((1 - p) ** (n - k)));
  }
  return values;
};

const updateBinomialCoinsBar = () => {
  const plotEl = document.getElementById("binomial-coins-plot");
  const theoryToggle = document.getElementById("binomial-coins-theory-toggle");
  if (!plotEl) {
    return;
  }

  const frequencies = experimentHistory.total === 0
    ? experimentHistory.counts.map(() => 0)
    : experimentHistory.counts.map((count) => count / experimentHistory.total);

  const data = [
    {
      x: Array.from({ length: COINS_PER_EXPERIMENT + 1 }, (_, index) => index),
      y: frequencies,
      type: "bar",
      marker: { color: "#b3713b", opacity: 0.8 },
      name: "Frequenze osservate"
    }
  ];

  if (theoryToggle && theoryToggle.checked) {
    const theoretical = binomialPmf(COINS_PER_EXPERIMENT, 0.5);
    data.push({
      x: Array.from({ length: COINS_PER_EXPERIMENT + 1 }, (_, index) => index),
      y: theoretical,
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
      tickvals: Array.from({ length: COINS_PER_EXPERIMENT + 1 }, (_, index) => index),
      ticktext: Array.from({ length: COINS_PER_EXPERIMENT + 1 }, (_, index) => String(index)),
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

const bindBinomialCoins = () => {
  const coinBtn = document.getElementById("binomial-coins-btn");
  const resetBtn = document.getElementById("binomial-coins-reset-btn");
  const resultEl = document.getElementById("binomial-coins-result");
  const countEl = document.getElementById("binomial-coins-count");
  const totalEl = document.getElementById("binomial-coins-total");
  const theoryToggle = document.getElementById("binomial-coins-theory-toggle");

  if (!coinBtn || !totalEl || !resultEl || !countEl || !theoryToggle) {
    return;
  }

  if (coinBtn.dataset.bound !== "true") {
    theoryToggle.addEventListener("change", () => {
      updateBinomialCoinsBar();
    });

    const applyExperiment = () => {
      if (experimentHistory.total >= BINOMIAL_MAX_SAMPLES) {
        return false;
      }
      const results = Array.from({ length: COINS_PER_EXPERIMENT }, () => (Math.random() < 0.5 ? 1 : 0));
      const headsCount = results.reduce((sum, value) => sum + value, 0);
      resultEl.textContent = `Esito: ${results.join(" ")}`;
      countEl.textContent = `Numero di teste: ${headsCount}`;
      totalEl.textContent = `Esperimenti eseguiti: ${experimentHistory.total + 1}`;
      experimentHistory.counts[headsCount] += 1;
      experimentHistory.total += 1;
      updateBinomialCoinsBar();
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
      experimentHistory.counts = Array.from({ length: COINS_PER_EXPERIMENT + 1 }, () => 0);
      experimentHistory.total = 0;
      resultEl.textContent = "Esito: -";
      countEl.textContent = "Numero di teste: -";
      totalEl.textContent = "Esperimenti eseguiti: 0";
      updateBinomialCoinsBar();
    });
    resetBtn.dataset.bound = "true";
  }
};

export const initBinomialCoins = () => {
  bindBinomialCoins();
  updateBinomialCoinsBar();
};
