const BINOMIAL_SUM_MAX_SAMPLES = 10000;

const sumSimulationState = {
  n: 4,
  m: 3,
  p: 0.5,
  counts: Array.from({ length: 8 }, () => 0),
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

const resetSumHistory = () => {
  sumSimulationState.counts = Array.from(
    { length: sumSimulationState.n + sumSimulationState.m + 1 },
    () => 0
  );
  sumSimulationState.total = 0;
};

const sampleBinomial = (trials, probability) => {
  let successes = 0;

  for (let i = 0; i < trials; i += 1) {
    if (Math.random() < probability) {
      successes += 1;
    }
  }

  return successes;
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
  const plotEl = document.getElementById("binomial-sum-plot");
  const theoryToggle = document.getElementById("binomial-sum-theory-toggle");

  if (!plotEl) {
    return;
  }

  const frequencies = sumSimulationState.total === 0
    ? sumSimulationState.counts.map(() => 0)
    : sumSimulationState.counts.map((count) => count / sumSimulationState.total);

  const support = Array.from(
    { length: sumSimulationState.n + sumSimulationState.m + 1 },
    (_, index) => index
  );

  const plotWidth = Math.max(320, Math.round(plotEl.clientWidth));
  const layout = {
    margin: { t: 10, r: 10, b: 40, l: 40 },
    height: 260,
    width: plotWidth,
    autosize: false,
    xaxis: {
      tickmode: "array",
      tickvals: support,
      ticktext: support.map((value) => String(value)),
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
      y: binomialPmf(sumSimulationState.n + sumSimulationState.m, sumSimulationState.p),
      type: "bar",
      marker: { color: "#2e6f8e", opacity: 0.8 },
      name: "Legge teorica"
    });
  }

  layout.barmode = "overlay";

  Plotly.react(plotEl, data, layout, { displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true })
    .then(() => {
      if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
      }
    });
};

const bindBinomialSumSimulation = () => {
  const sampleBtn = document.getElementById("binomial-sum-btn");
  const resetBtn = document.getElementById("binomial-sum-reset-btn");
  const nSlider = document.getElementById("binomial-sum-n-slider");
  const mSlider = document.getElementById("binomial-sum-m-slider");
  const topPSlider = document.getElementById("binomial-sum-p-slider-top");
  const bottomPSlider = document.getElementById("binomial-sum-p-slider-bottom");
  const nValue = document.getElementById("binomial-sum-n-value");
  const mValue = document.getElementById("binomial-sum-m-value");
  const topPValue = document.getElementById("binomial-sum-p-value-top");
  const bottomPValue = document.getElementById("binomial-sum-p-value-bottom");
  const x1Line = document.getElementById("binomial-sum-x1");
  const x2Line = document.getElementById("binomial-sum-x2");
  const resultLine = document.getElementById("binomial-sum-result");
  const totalLine = document.getElementById("binomial-sum-total");
  const theoryToggle = document.getElementById("binomial-sum-theory-toggle");

  if (
    !sampleBtn
    || !nSlider
    || !mSlider
    || !topPSlider
    || !bottomPSlider
    || !nValue
    || !mValue
    || !topPValue
    || !bottomPValue
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

  const updateParameterValues = (pSource = null) => {
    if (pSource === "top") {
      bottomPSlider.value = topPSlider.value;
    } else if (pSource === "bottom") {
      topPSlider.value = bottomPSlider.value;
    }

    const n = Number.parseInt(nSlider.value, 10);
    const m = Number.parseInt(mSlider.value, 10);
    const p = Number.parseFloat(topPSlider.value);

    if (sumSimulationState.n !== n || sumSimulationState.m !== m || sumSimulationState.p !== p) {
      sumSimulationState.n = n;
      sumSimulationState.m = m;
      sumSimulationState.p = p;
      resetSumHistory();
      renderSampleValues();
      totalLine.textContent = "Esperimenti eseguiti: 0";
    }

    if (window.katex) {
      window.katex.render(String(n), nValue, { throwOnError: false });
      window.katex.render(String(m), mValue, { throwOnError: false });
      window.katex.render(p.toFixed(2), topPValue, { throwOnError: false });
      window.katex.render(p.toFixed(2), bottomPValue, { throwOnError: false });
    } else {
      nValue.textContent = String(n);
      mValue.textContent = String(m);
      topPValue.textContent = p.toFixed(2);
      bottomPValue.textContent = p.toFixed(2);
    }

    updateSumBar();
  };

  if (sampleBtn.dataset.bound !== "true") {
    nSlider.addEventListener("input", () => updateParameterValues());
    mSlider.addEventListener("input", () => updateParameterValues());
    topPSlider.addEventListener("input", () => updateParameterValues("top"));
    bottomPSlider.addEventListener("input", () => updateParameterValues("bottom"));
    theoryToggle.addEventListener("change", () => updateSumBar());
    updateParameterValues();

    const applyTrial = () => {
      if (sumSimulationState.total >= BINOMIAL_SUM_MAX_SAMPLES) {
        return false;
      }

      const x1 = sampleBinomial(sumSimulationState.n, sumSimulationState.p);
      const x2 = sampleBinomial(sumSimulationState.m, sumSimulationState.p);
      const sum = x1 + x2;

      renderSampleValues(x1, x2);
      sumSimulationState.counts[sum] += 1;
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

export const initBinomialSumSimulation = () => {
  bindBinomialSumSimulation();
  updateSumBar();
};
