const COIN_MAX_SAMPLES = 10000;

const coinHistory = {
  heads: 0,
  tails: 0
};

const getTotalFlips = () => coinHistory.heads + coinHistory.tails;

const updateCoinBar = () => {
  const plotEl = document.getElementById("coin-plot");
  const theoryToggle = document.getElementById("theory-toggle");
  if (!plotEl) {
    return;
  }

  const totalFlips = coinHistory.heads + coinHistory.tails;
  const freqHeads = totalFlips === 0 ? 0 : coinHistory.heads / totalFlips;
  const freqTails = totalFlips === 0 ? 0 : coinHistory.tails / totalFlips;

  const data = [
    {
      x: [0, 1],
      y: [freqTails, freqHeads],
      type: "bar",
      marker: { color: "#b3713b", opacity: 0.8 },
      name: "Frequenze osservate"
    }
  ];

  if (theoryToggle && theoryToggle.checked) {
    data.push({
      x: [0, 1],
      y: [0.5, 0.5],
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

const bindCoinFlip = () => {
  const coinBtn = document.getElementById("coin-btn");
  const resetBtn = document.getElementById("coin-reset-btn");
  const coinResult = document.getElementById("coin-result");
  const coinTotal = document.getElementById("coin-total");
  const theoryToggle = document.getElementById("theory-toggle");

  if (!coinBtn || !coinTotal || !coinResult || !theoryToggle) {
    return;
  }

  if (coinBtn.dataset.bound !== "true") {
    theoryToggle.addEventListener("change", () => {
      updateCoinBar();
    });

    const applyFlip = () => {
      if (getTotalFlips() >= COIN_MAX_SAMPLES) {
        return false;
      }
      const result = Math.random() < 0.5 ? "1" : "0";
      coinResult.textContent = `Esito: ${result}`;
      coinTotal.textContent = `Lanci totali: ${getTotalFlips() + 1}`;
      if (result === "1") {
        coinHistory.heads += 1;
      } else {
        coinHistory.tails += 1;
      }
      updateCoinBar();
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
          if (!applyFlip()) {
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
        applyFlip();
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
      coinHistory.heads = 0;
      coinHistory.tails = 0;
      coinResult.textContent = "Esito: -";
      coinTotal.textContent = "Lanci totali: 0";
      updateCoinBar();
    });
    resetBtn.dataset.bound = "true";
  }
};

export const initCoin = () => {
  bindCoinFlip();
  updateCoinBar();
};
