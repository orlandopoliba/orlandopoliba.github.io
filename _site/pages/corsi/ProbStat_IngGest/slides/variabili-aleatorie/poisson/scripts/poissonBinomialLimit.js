const LIMIT_MAX_K = 15;

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

const combination = (n, k) => {
  const safeK = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= safeK; i += 1) {
    result *= (n - safeK + i) / i;
  }
  return result;
};

const binomialPmf = (n, p, maxK) => {
  const values = [];
  for (let k = 0; k <= maxK; k += 1) {
    if (k > n) {
      values.push(0);
    } else {
      values.push(combination(n, k) * (p ** k) * ((1 - p) ** (n - k)));
    }
  }
  return values;
};

const state = {
  lambda: 3,
  n: 10,
  p: 0.3
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateSliderValue = (slider, value, valueEl, decimals = 0) => {
  const formatted = value.toFixed(decimals);
  slider.value = formatted;
  if (window.katex) {
    window.katex.render(formatted, valueEl, { throwOnError: false });
  } else {
    valueEl.textContent = formatted;
  }
};

const updateLimitPlot = () => {
  const plotEl = document.getElementById("poisson-limit-plot");
  const toggle = document.getElementById("poisson-limit-theory-toggle");
  if (!plotEl) {
    return;
  }

  const xValues = Array.from({ length: LIMIT_MAX_K + 1 }, (_, index) => index);
  const binomialValues = binomialPmf(state.n, state.p, LIMIT_MAX_K);
  const data = [
    {
      x: xValues,
      y: binomialValues,
      type: "bar",
      marker: { color: "#b3713b", opacity: 0.8 },
      name: "Legge binomiale"
    }
  ];

  if (toggle && toggle.checked) {
    data.push({
      x: xValues,
      y: poissonPmf(state.lambda, LIMIT_MAX_K),
      type: "bar",
      marker: { color: "#2e6f8e", opacity: 0.8 },
      name: "Legge di Poisson"
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
      range: [-0.5, LIMIT_MAX_K + 0.5],
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, 0.7],
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

const bindLimitControls = () => {
  const lambdaSlider = document.getElementById("poisson-limit-lambda-slider");
  const nSlider = document.getElementById("poisson-limit-n-slider");
  const pSlider = document.getElementById("poisson-limit-p-slider");
  const lambdaValue = document.getElementById("poisson-limit-lambda-value");
  const nValue = document.getElementById("poisson-limit-n-value");
  const pValue = document.getElementById("poisson-limit-p-value");
  const toggle = document.getElementById("poisson-limit-theory-toggle");

  if (!lambdaSlider || !nSlider || !pSlider || !lambdaValue || !nValue || !pValue || !toggle) {
    return;
  }

  const minP = Number.parseFloat(pSlider.min);
  const maxP = Number.parseFloat(pSlider.max);
  const minN = Number.parseInt(nSlider.min, 10);
  const maxN = Number.parseInt(nSlider.max, 10);

  const applyState = () => {
    updateSliderValue(lambdaSlider, state.lambda, lambdaValue, 1);
    updateSliderValue(nSlider, state.n, nValue, 0);
    updateSliderValue(pSlider, state.p, pValue, 3);
    updateLimitPlot();
  };

  if (lambdaSlider.dataset.bound !== "true") {
    lambdaSlider.addEventListener("input", () => {
      state.lambda = Number.parseFloat(lambdaSlider.value);
      const computedP = state.lambda / state.n;
      state.p = clamp(computedP, minP, maxP);
      state.lambda = state.n * state.p;
      applyState();
    });
    lambdaSlider.dataset.bound = "true";
  }

  if (nSlider.dataset.bound !== "true") {
    nSlider.addEventListener("input", () => {
      state.n = Number.parseInt(nSlider.value, 10);
      const computedP = state.lambda / state.n;
      state.p = clamp(computedP, minP, maxP);
      state.lambda = state.n * state.p;
      applyState();
    });
    nSlider.dataset.bound = "true";
  }

  if (pSlider.dataset.bound !== "true") {
    pSlider.addEventListener("input", () => {
      state.p = Number.parseFloat(pSlider.value);
      const computedN = state.lambda / state.p;
      state.n = clamp(Math.round(computedN), minN, maxN);
      state.lambda = state.n * state.p;
      applyState();
    });
    pSlider.dataset.bound = "true";
  }

  if (toggle.dataset.bound !== "true") {
    toggle.addEventListener("change", () => {
      updateLimitPlot();
    });
    toggle.dataset.bound = "true";
  }

  applyState();
};

export const initPoissonLimit = () => {
  bindLimitControls();
  updateLimitPlot();
};
