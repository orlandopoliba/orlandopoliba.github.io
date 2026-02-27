import { gammaPdf } from "./chisqUtils.js";

const CHISQ_X_MIN = 0;
const CHISQ_X_MAX = 20;
const CHISQ_POINTS = 300;
const CHISQ_Y_MAX = 0.5;

const buildCurve = (n) => {
  const alpha = n / 2;
  const lambda = 0.5;
  const step = (CHISQ_X_MAX - CHISQ_X_MIN) / (CHISQ_POINTS - 1);
  const xValues = Array.from({ length: CHISQ_POINTS }, (_, index) => CHISQ_X_MIN + index * step);
  const yValues = xValues.map((x) => gammaPdf(alpha, lambda, x));
  return { xValues, yValues };
};

const drawChiSqTitleDensity = () => {
  const plotEl = document.getElementById("chisq-density");
  const nSlider = document.getElementById("chisq-title-n-slider");
  const nValue = document.getElementById("chisq-title-n-value");

  if (!plotEl || !nSlider) {
    return;
  }

  const n = Number.parseInt(nSlider.value, 10);

  if (nValue) {
    const text = String(n);
    if (window.katex) {
      window.katex.render(text, nValue, { throwOnError: false });
    } else {
      nValue.textContent = text;
    }
  }

  const { xValues, yValues } = buildCurve(n);

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
      range: [CHISQ_X_MIN, CHISQ_X_MAX],
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, CHISQ_Y_MAX],
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

export const initChiSqTitleDensity = () => {
  const nSlider = document.getElementById("chisq-title-n-slider");

  if (nSlider && nSlider.dataset.bound !== "true") {
    nSlider.addEventListener("input", drawChiSqTitleDensity);
    nSlider.dataset.bound = "true";
  }

  drawChiSqTitleDensity();
};
