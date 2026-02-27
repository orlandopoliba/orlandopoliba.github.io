import { tPdf } from "./tStudentUtils.js";

const T_X_MIN = -6;
const T_X_MAX = 6;
const T_POINTS = 300;
const T_Y_MAX = 0.5;

const buildCurve = (n) => {
  const step = (T_X_MAX - T_X_MIN) / (T_POINTS - 1);
  const xValues = Array.from({ length: T_POINTS }, (_, index) => T_X_MIN + index * step);
  const yValues = xValues.map((x) => tPdf(n, x));
  return { xValues, yValues };
};

const drawTStudentTitleDensity = () => {
  const plotEl = document.getElementById("tstudent-density");
  const nSlider = document.getElementById("tstudent-title-n-slider");
  const nValue = document.getElementById("tstudent-title-n-value");

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
      range: [T_X_MIN, T_X_MAX],
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, T_Y_MAX],
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

export const initTStudentTitleDensity = () => {
  const nSlider = document.getElementById("tstudent-title-n-slider");

  if (nSlider && nSlider.dataset.bound !== "true") {
    nSlider.addEventListener("input", drawTStudentTitleDensity);
    nSlider.dataset.bound = "true";
  }

  drawTStudentTitleDensity();
};
