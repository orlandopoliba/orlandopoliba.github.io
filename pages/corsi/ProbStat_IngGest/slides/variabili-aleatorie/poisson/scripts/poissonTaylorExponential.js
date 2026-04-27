const TAYLOR_MAX_ORDER = 5;
const TAYLOR_X_MIN = -2.5;
const TAYLOR_X_MAX = 2.5;
const TAYLOR_STEP = 0.05;
const EXPONENTIAL_COLOR = "#2e6fdb";
const TAYLOR_POLYNOMIAL_COLOR = "#f56111";
const TAYLOR_ERROR_COLOR = "#c10000";

const factorial = (n) => {
  let result = 1;

  for (let k = 2; k <= n; k += 1) {
    result *= k;
  }

  return result;
};

const buildTaylorTerms = (order) => {
  const terms = [];

  for (let k = 0; k <= order; k += 1) {
    if (k === 0) {
      terms.push("1");
    } else if (k === 1) {
      terms.push("x");
    } else {
      terms.push(`\\frac{x^{${k}}}{${k}!}`);
    }
  }

  return terms;
};

const taylorPolynomial = (x, order) => {
  let sum = 0;

  for (let k = 0; k <= order; k += 1) {
    sum += (x ** k) / factorial(k);
  }

  return sum;
};

const buildFormula = (order, showError) => {
  const terms = buildTaylorTerms(order).join(" + ");

  if (showError) {
    return `\\textcolor{${EXPONENTIAL_COLOR}}{e^x} - \\textcolor{${TAYLOR_POLYNOMIAL_COLOR}}{\\left(${terms}\\right)} = \\textcolor{${TAYLOR_ERROR_COLOR}}{\\text{errore}}`;
  }

  return `\\textcolor{${EXPONENTIAL_COLOR}}{e^x} \\approx \\textcolor{${TAYLOR_POLYNOMIAL_COLOR}}{${terms}} + \\textcolor{${TAYLOR_ERROR_COLOR}}{\\text{errore}}`;
};

const updateTaylorFormula = (order, showError) => {
  const formulaEl = document.getElementById("poisson-taylor-formula");

  if (!formulaEl) {
    return;
  }

  const formula = buildFormula(order, showError);

  if (window.katex) {
    window.katex.render(formula, formulaEl, {
      throwOnError: false,
      displayMode: true
    });
    return;
  }

  formulaEl.textContent = formula;
};

const updateTaylorPlot = (order, showError) => {
  const plotEl = document.getElementById("poisson-taylor-plot");

  if (!plotEl) {
    return;
  }

  const xValues = [];
  const expValues = [];
  const polyValues = [];
  const errorValues = [];

  for (let x = TAYLOR_X_MIN; x <= TAYLOR_X_MAX + 1e-9; x += TAYLOR_STEP) {
    const expValue = Math.exp(x);
    const polyValue = taylorPolynomial(x, order);

    xValues.push(Number(x.toFixed(4)));
    expValues.push(expValue);
    polyValues.push(polyValue);
    errorValues.push(expValue - polyValue);
  }

  const data = showError
    ? [
        {
          x: xValues,
          y: errorValues,
          type: "scatter",
          mode: "lines",
          line: { color: TAYLOR_ERROR_COLOR, width: 3 },
          name: "Errore",
          hovertemplate: "x = %{x}<br>errore = %{y:.4f}<extra></extra>"
        }
      ]
    : [
        {
          x: xValues,
          y: expValues,
          type: "scatter",
          mode: "lines",
          line: { color: EXPONENTIAL_COLOR, width: 3 },
          name: "e^x",
          hovertemplate: "x = %{x}<br>e^x = %{y:.4f}<extra></extra>"
        },
        {
          x: xValues,
          y: polyValues,
          type: "scatter",
          mode: "lines",
          line: { color: TAYLOR_POLYNOMIAL_COLOR, width: 3 },
          name: "Polinomio di Taylor",
          hovertemplate: "x = %{x}<br>T_%{text}(x) = %{y:.4f}<extra></extra>",
          text: xValues.map(() => String(order))
        },
        {
          x: [0],
          y: [1],
          type: "scatter",
          mode: "markers",
          marker: {
            size: 9,
            color: "#111111"
          },
          name: "(0,1)",
          hovertemplate: "(0, 1)<extra></extra>"
        }
      ];

  const plotWidth = Math.max(320, Math.round(plotEl.clientWidth));
  const layout = {
    margin: { t: 10, r: 10, b: 45, l: 50 },
    height: 300,
    width: plotWidth,
    autosize: false,
    xaxis: {
      range: [TAYLOR_X_MIN, TAYLOR_X_MAX],
      showgrid: true,
      zeroline: true,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [-1, 10],
      showgrid: true,
      zeroline: true,
      showline: true,
      ticks: ""
    },
    paper_bgcolor: "rgb(247, 247, 247)",
    plot_bgcolor: "rgb(247, 247, 247)",
    showlegend: true,
    legend: {
      orientation: "h",
      y: -0.18,
      x: 0.5,
      xanchor: "center",
      yanchor: "top"
    }
  };

  Plotly.react(plotEl, data, layout, {
    displayModeBar: false,
    responsive: false,
    mathjax: "cdn",
    staticPlot: true
  }).then(() => {
    if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
      window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
    }
  });
};

const bindTaylorControls = () => {
  const orderSlider = document.getElementById("poisson-taylor-order-slider");
  const orderValue = document.getElementById("poisson-taylor-order-value");
  const errorToggle = document.getElementById("poisson-taylor-error-toggle");

  if (!orderSlider || !orderValue || !errorToggle) {
    return;
  }

  const updateView = () => {
    const order = Number.parseInt(orderSlider.value, 10);
    const showError = errorToggle.checked;

    if (window.katex) {
      window.katex.render(String(order), orderValue, { throwOnError: false });
    } else {
      orderValue.textContent = String(order);
    }

    updateTaylorFormula(order, showError);
    updateTaylorPlot(order, showError);
  };

  if (orderSlider.dataset.bound !== "true") {
    orderSlider.addEventListener("input", updateView);
    errorToggle.addEventListener("change", updateView);
    orderSlider.dataset.bound = "true";
  }

  updateView();
};

export const initPoissonTaylorExponential = () => {
  bindTaylorControls();
};
