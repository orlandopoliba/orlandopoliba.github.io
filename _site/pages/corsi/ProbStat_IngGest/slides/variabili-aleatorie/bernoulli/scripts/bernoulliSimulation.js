const BERNOULLI_MAX_SAMPLES = 10000;

const bernoulliHistory = {
  ones: 0,
  zeros: 0,
};

const getTotalTrials = () => bernoulliHistory.ones + bernoulliHistory.zeros;

const updateBernoulliBar = () => {
  const plotEl = document.getElementById("bernoulli-plot");
  const theoryToggle = document.getElementById("bernoulli-theory-toggle");
  const pSlider = document.getElementById("bernoulli-p-slider");
  if (!plotEl) {
    return;
  }

  const totalTrials = bernoulliHistory.ones + bernoulliHistory.zeros;
  const freqOnes = totalTrials === 0 ? 0 : bernoulliHistory.ones / totalTrials;
  const freqZeros = totalTrials === 0 ? 0 : bernoulliHistory.zeros / totalTrials;

  const data = [
    {
      x: [0, 1],
      y: [freqZeros, freqOnes],
      type: "bar",
      marker: { color: "#b3713b", opacity: 0.8 },
      name: "Frequenze osservate"
    }
  ];

  if (theoryToggle && theoryToggle.checked) {
    const pValue = pSlider ? Number.parseFloat(pSlider.value) : 0.5;
    data.push({
      x: [0, 1],
      y: [1 - pValue, pValue],
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
      tickvals: [0, 1],
      ticktext: ["0", "1"],
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

const bindBernoulliTrial = () => {
  const bernoulliBtn = document.getElementById("bernoulli-btn");
  const resetBtn = document.getElementById("bernoulli-reset-btn");
  const bernoulliResult = document.getElementById("bernoulli-result");
  const bernoulliTotal = document.getElementById("bernoulli-total");
  const theoryToggle = document.getElementById("bernoulli-theory-toggle");
  const pSlider = document.getElementById("bernoulli-p-slider");
  const pValue = document.getElementById("bernoulli-p-value");

  if (!bernoulliBtn || !bernoulliTotal || !bernoulliResult || !theoryToggle || !pSlider || !pValue) {
    return;
  }

  const updatePValue = () => {
    const value = Number.parseFloat(pSlider.value).toFixed(2);
    if (window.katex) {
        window.katex.render(value, pValue, { throwOnError: false });
    } else {
        pValue.textContent = value;
    }
    updateBernoulliBar();
  };

  if (bernoulliBtn.dataset.bound !== "true") {
    pSlider.addEventListener("input", updatePValue);
    updatePValue();

    theoryToggle.addEventListener("change", () => {
      updateBernoulliBar();
    });

    const applyTrial = () => {
      if (getTotalTrials() >= BERNOULLI_MAX_SAMPLES) {
        return false;
      }
      const pValue = Number.parseFloat(pSlider.value);
      const result = Math.random() < pValue ? "1" : "0";
      bernoulliResult.textContent = `Esito: ${result}`;
      bernoulliTotal.textContent = `Prove totali: ${getTotalTrials() + 1}`;
      if (result === "1") {
        bernoulliHistory.ones += 1;
      } else {
        bernoulliHistory.zeros += 1;
      }
      updateBernoulliBar();
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

    bernoulliBtn.addEventListener("mousedown", onPressStart);
    bernoulliBtn.addEventListener("touchstart", onPressStart, { passive: true });
    bernoulliBtn.addEventListener("mouseup", onPressEnd);
    bernoulliBtn.addEventListener("mouseleave", onPressEnd);
    bernoulliBtn.addEventListener("touchend", onPressEnd);
    bernoulliBtn.addEventListener("touchcancel", onPressEnd);
    bernoulliBtn.dataset.bound = "true";
  }

  if (resetBtn && resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      bernoulliHistory.ones = 0;
      bernoulliHistory.zeros = 0;
      bernoulliResult.textContent = "Esito: -";
      bernoulliTotal.textContent = "Prove totali: 0";
      updateBernoulliBar();
    });
    resetBtn.dataset.bound = "true";
  }
};

export const initBernoulliSimulation = () => {
  bindBernoulliTrial();
  updateBernoulliBar();
};
