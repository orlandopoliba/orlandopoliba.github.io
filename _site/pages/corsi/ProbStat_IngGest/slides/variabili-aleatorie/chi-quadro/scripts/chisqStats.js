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

const updateChiSqStatsPlot = () => {
  const plotEl = document.getElementById("chisq-plot-2");
  const nSlider = document.getElementById("chisq-stats-n-slider");

  if (!plotEl || !nSlider) {
    return;
  }

  const n = Number.parseInt(nSlider.value, 10);
  const mean = n;
  const variance = 2 * n;
  const stdDev = Math.sqrt(variance);
  const stdDevStart = Math.max(0, mean - stdDev);
  const stdDevEnd = mean + stdDev;

  const { xValues, yValues } = buildCurve(n);

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
      y: [0, CHISQ_Y_MAX],
      type: "scatter",
      mode: "lines",
      line: { color: "#255d58", width: 5 },
      name: "Valore atteso",
      hoverinfo: "skip"
    },
    {
      x: [stdDevStart, stdDevEnd],
      y: [CHISQ_Y_MAX * 0.5, CHISQ_Y_MAX * 0.5],
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

const bindChiSqStats = () => {
  const nSlider = document.getElementById("chisq-stats-n-slider");
  const nValue = document.getElementById("chisq-stats-n-value");
  const expectedValueSpan = document.getElementById("chisq-expected-value");
  const varianceValueSpan = document.getElementById("chisq-variance-value");

  if (!nSlider || !nValue || !expectedValueSpan || !varianceValueSpan) {
    return;
  }

  const updateStats = () => {
    const n = Number.parseInt(nSlider.value, 10);
    const expectedValue = n;
    const variance = 2 * n;

    updateChiSqStatsPlot();

    if (window.katex) {
      window.katex.render(String(n), nValue, { throwOnError: false });
      window.katex.render(String(expectedValue), expectedValueSpan, { throwOnError: false });
      window.katex.render(String(variance), varianceValueSpan, { throwOnError: false });
    } else {
      nValue.textContent = String(n);
      expectedValueSpan.textContent = String(expectedValue);
      varianceValueSpan.textContent = String(variance);
    }
  };

  nSlider.addEventListener("input", updateStats);
  updateStats();
};

export const initChiSqStats = () => {
  bindChiSqStats();
  updateChiSqStatsPlot();
};
