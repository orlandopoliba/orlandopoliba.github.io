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

const drawGammaTitleDensity = () => {
  const plotEl = document.getElementById("gamma-density");
  const alphaSlider = document.getElementById("gamma-title-alpha-slider");
  const lambdaSlider = document.getElementById("gamma-title-lambda-slider");
  const alphaValue = document.getElementById("gamma-title-alpha-value");
  const lambdaValue = document.getElementById("gamma-title-lambda-value");

  if (!plotEl || !alphaSlider || !lambdaSlider) {
    return;
  }

  const alpha = Number.parseFloat(alphaSlider.value);
  const lambda = Number.parseFloat(lambdaSlider.value);

  if (alphaValue) {
    const text = alpha.toFixed(1);
    if (window.katex) {
      window.katex.render(text, alphaValue, { throwOnError: false });
    } else {
      alphaValue.textContent = text;
    }
  }

  if (lambdaValue) {
    const text = lambda.toFixed(1);
    if (window.katex) {
      window.katex.render(text, lambdaValue, { throwOnError: false });
    } else {
      lambdaValue.textContent = text;
    }
  }

  const { xValues, yValues } = buildCurve(alpha, lambda);
  const yMax = 1.5;

  const data = [
    {
      x: xValues,
      y: yValues,
      type: "scatter",
      mode: "lines",
      line: { color: "#2e6f8e", width: 3 },
      fill: "tozeroy",
      fillcolor: "rgba(46, 111, 142, 0.8)",
      hoverinfo: "skip"
    }
  ];

  const plotWidth = Math.max(320, Math.round(plotEl.clientWidth));
  const layout = {
    margin: { t: 10, r: 10, b: 40, l: 50 },
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
      range: [0, yMax],
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

  Plotly.react(plotEl, data, layout, { displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true })
    .then(() => {
      if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
      }
    });
};

export const initGammaTitleDensity = () => {
  const alphaSlider = document.getElementById("gamma-title-alpha-slider");
  const lambdaSlider = document.getElementById("gamma-title-lambda-slider");

  if (alphaSlider && alphaSlider.dataset.bound !== "true") {
    alphaSlider.addEventListener("input", drawGammaTitleDensity);
    alphaSlider.dataset.bound = "true";
  }

  if (lambdaSlider && lambdaSlider.dataset.bound !== "true") {
    lambdaSlider.addEventListener("input", drawGammaTitleDensity);
    lambdaSlider.dataset.bound = "true";
  }

  drawGammaTitleDensity();
};
