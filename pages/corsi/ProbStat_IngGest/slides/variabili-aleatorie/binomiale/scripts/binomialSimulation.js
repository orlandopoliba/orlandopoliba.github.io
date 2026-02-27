const BINOMIAL_MAX_SAMPLES = 10000;

const simulationState = {
  n: 10,
  p: 0.5,
  counts: Array.from({ length: 11 }, () => 0),
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

const resetHistory = () => {
  simulationState.counts = Array.from({ length: simulationState.n + 1 }, () => 0);
  simulationState.total = 0;
};

const updateBinomialBar = () => {
  const plotEl = document.getElementById("binomial-plot");
  const theoryToggle = document.getElementById("binomial-theory-toggle");
  if (!plotEl) {
    return;
  }

  const frequencies = simulationState.total === 0
    ? simulationState.counts.map(() => 0)
    : simulationState.counts.map((count) => count / simulationState.total);

  const data = [
    {
      x: Array.from({ length: simulationState.n + 1 }, (_, index) => index),
      y: frequencies,
      type: "bar",
      marker: { color: "#b3713b", opacity: 0.8 },
      name: "Frequenze osservate"
    }
  ];

  if (theoryToggle && theoryToggle.checked) {
    const theoretical = binomialPmf(simulationState.n, simulationState.p);
    data.push({
      x: Array.from({ length: simulationState.n + 1 }, (_, index) => index),
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
      tickvals: Array.from({ length: simulationState.n + 1 }, (_, index) => index),
      ticktext: Array.from({ length: simulationState.n + 1 }, (_, index) => String(index)),
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

const bindBinomialTrial = () => {
  const binomialBtn = document.getElementById("binomial-btn");
  const resetBtn = document.getElementById("binomial-reset-btn");
  const binomialResult = document.getElementById("binomial-result");
  const binomialTotal = document.getElementById("binomial-total");
  const theoryToggle = document.getElementById("binomial-theory-toggle");
  const nSlider = document.getElementById("binomial-n-slider");
  const pSlider = document.getElementById("binomial-p-slider");
  const nValue = document.getElementById("binomial-n-value");
  const pValue = document.getElementById("binomial-p-value");

  if (!binomialBtn || !binomialTotal || !binomialResult || !theoryToggle || !nSlider || !pSlider || !nValue || !pValue) {
    return;
  }

  const updateParameterValues = () => {
    const n = Number.parseInt(nSlider.value, 10);
    const p = Number.parseFloat(pSlider.value);

    if (simulationState.n !== n || simulationState.p !== p) {
      simulationState.n = n;
      simulationState.p = p;
      resetHistory();
      binomialResult.textContent = "Esito: -";
      binomialTotal.textContent = "Esperimenti eseguiti: 0";
    }

    if (window.katex) {
      window.katex.render(String(n), nValue, { throwOnError: false });
      window.katex.render(p.toFixed(2), pValue, { throwOnError: false });
    } else {
      nValue.textContent = String(n);
      pValue.textContent = p.toFixed(2);
    }
    updateBinomialBar();
  };

  if (binomialBtn.dataset.bound !== "true") {
    nSlider.addEventListener("input", updateParameterValues);
    pSlider.addEventListener("input", updateParameterValues);
    updateParameterValues();

    theoryToggle.addEventListener("change", () => {
      updateBinomialBar();
    });

    const applyTrial = () => {
      if (simulationState.total >= BINOMIAL_MAX_SAMPLES) {
        return false;
      }
      let successes = 0;
      for (let i = 0; i < simulationState.n; i += 1) {
        if (Math.random() < simulationState.p) {
          successes += 1;
        }
      }
      binomialResult.textContent = `Esito: ${successes}`;
      binomialTotal.textContent = `Esperimenti eseguiti: ${simulationState.total + 1}`;
      simulationState.counts[successes] += 1;
      simulationState.total += 1;
      updateBinomialBar();
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

    binomialBtn.addEventListener("mousedown", onPressStart);
    binomialBtn.addEventListener("touchstart", onPressStart, { passive: true });
    binomialBtn.addEventListener("mouseup", onPressEnd);
    binomialBtn.addEventListener("mouseleave", onPressEnd);
    binomialBtn.addEventListener("touchend", onPressEnd);
    binomialBtn.addEventListener("touchcancel", onPressEnd);
    binomialBtn.dataset.bound = "true";
  }

  if (resetBtn && resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      resetHistory();
      binomialResult.textContent = "Esito: -";
      binomialTotal.textContent = "Prove totali: 0";
      updateBinomialBar();
    });
    resetBtn.dataset.bound = "true";
  }
};

export const initBinomialSimulation = () => {
  bindBinomialTrial();
  updateBinomialBar();
};
