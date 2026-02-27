import { gammaPdf } from "./gammaUtils.js";

const GAMMA_X_MIN = 0;
const GAMMA_X_MAX = 8;
const GAMMA_POINTS = 300;

const buildCurve = (alpha, lambda) => {
  const step = (GAMMA_X_MAX - GAMMA_X_MIN) / (GAMMA_POINTS - 1);
  const xValues = Array.from({ length: GAMMA_POINTS }, (_, index) => GAMMA_X_MIN + index * step);
  const yValues = xValues.map((x) => gammaPdf(alpha, lambda, x));
  return { xValues, yValues };
};

const updateGammaStatsPlot = () => {
  const plotEl = document.getElementById("gamma-plot-2");
  const alphaSlider = document.getElementById("gamma-stats-alpha-slider");
  const lambdaSlider = document.getElementById("gamma-stats-lambda-slider");

  if (!plotEl || !alphaSlider || !lambdaSlider) {
    return;
  }

  const alpha = Number.parseFloat(alphaSlider.value);
  const lambda = Number.parseFloat(lambdaSlider.value);
  const mean = alpha / lambda;
  const variance = alpha / (lambda ** 2);
  const stdDev = Math.sqrt(variance);
  const stdDevStart = Math.max(0, mean - stdDev);
  const stdDevEnd = mean + stdDev;

  const { xValues, yValues } = buildCurve(alpha, lambda);
  const yMax = 0.5;

  const data = [
    {
      x: xValues,
      y: yValues,
      type: "scatter",
      mode: "lines",
      line: { color: "#2e6f8e", width: 3 },
      name: "Densita",
      hoverinfo: "skip"
    },
    {
      x: [mean, mean],
      y: [0, 0.5],
      type: "scatter",
      mode: "lines",
      line: { color: "#255d58", width: 5 },
      name: "Valore atteso",
      hoverinfo: "skip"
    },
    {
      x: [stdDevStart, stdDevEnd],
      y: [0.25, 0.25],
      type: "scatter",
      mode: "lines",
      line: { color: "#913622", width: 5 },
      name: "Deviazione standard",
      hoverinfo: "skip"
    }
  ];

  const plotWidth = Math.max(320, Math.round(plotEl.clientWidth));
  const layout = {
    margin: { t: 10, r: 10, b: 70, l: 40 },
    height: 260,
    width: plotWidth,
    autosize: false,
    xaxis: {
      range: [GAMMA_X_MIN, GAMMA_X_MAX],
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, 0.5],
      showgrid: true,
      zeroline: false,
      showline: true,
      showticklabels: true,
      ticks: ""
    },
    paper_bgcolor: "rgb(247, 247, 247)",
    plot_bgcolor: "rgb(247, 247, 247)",
    showlegend: true,
    legend: {
      orientation: "h",
      y: -0.25,
      x: 0.5,
      xanchor: "center",
      yanchor: "top"
    }
  };

  Plotly.react(plotEl, data, layout, { displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true })
    .then(() => {
      if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
      }
    });
};

const bindGammaStats = () => {
  const alphaSlider = document.getElementById("gamma-stats-alpha-slider");
  const lambdaSlider = document.getElementById("gamma-stats-lambda-slider");
  const alphaValue = document.getElementById("gamma-stats-alpha-value");
  const lambdaValue = document.getElementById("gamma-stats-lambda-value");
  const expectedValueSpan = document.getElementById("gamma-expected-value");
  const varianceValueSpan = document.getElementById("gamma-variance-value");

  if (!alphaSlider || !lambdaSlider || !alphaValue || !lambdaValue || !expectedValueSpan || !varianceValueSpan) {
    return;
  }

  const updateStats = () => {
    const alpha = Number.parseFloat(alphaSlider.value);
    const lambda = Number.parseFloat(lambdaSlider.value);
    const expectedValue = alpha / lambda;
    const variance = alpha / (lambda ** 2);

    updateGammaStatsPlot();

    if (window.katex) {
      window.katex.render(alpha.toFixed(1), alphaValue, { throwOnError: false });
      window.katex.render(lambda.toFixed(1), lambdaValue, { throwOnError: false });
      window.katex.render(expectedValue.toFixed(2), expectedValueSpan, { throwOnError: false });
      window.katex.render(variance.toFixed(2), varianceValueSpan, { throwOnError: false });
    } else {
      alphaValue.textContent = alpha.toFixed(1);
      lambdaValue.textContent = lambda.toFixed(1);
      expectedValueSpan.textContent = expectedValue.toFixed(2);
      varianceValueSpan.textContent = variance.toFixed(2);
    }
  };

  alphaSlider.addEventListener("input", updateStats);
  lambdaSlider.addEventListener("input", updateStats);
  updateStats();
};

export const initGammaStats = () => {
  bindGammaStats();
  updateGammaStatsPlot();
};
