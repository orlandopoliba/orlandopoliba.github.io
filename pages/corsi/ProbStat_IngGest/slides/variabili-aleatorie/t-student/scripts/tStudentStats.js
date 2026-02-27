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

const updateTStudentStatsPlot = () => {
  const plotEl = document.getElementById("tstudent-plot-2");
  const nSlider = document.getElementById("tstudent-stats-n-slider");

  if (!plotEl || !nSlider) {
    return;
  }

  const n = Number.parseInt(nSlider.value, 10);
  const mean = 0;
  const variance = n > 2 ? n / (n - 2) : null;
  const stdDev = variance !== null ? Math.sqrt(variance) : null;
  const stdDevStart = stdDev !== null ? mean - stdDev : null;
  const stdDevEnd = stdDev !== null ? mean + stdDev : null;

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
      y: [0, T_Y_MAX],
      type: "scatter",
      mode: "lines",
      line: { color: "#255d58", width: 5 },
      name: "Valore atteso",
      hoverinfo: "skip"
    }
  ];

  if (stdDevStart !== null && stdDevEnd !== null) {
    data.push({
      x: [stdDevStart, stdDevEnd],
      y: [T_Y_MAX * 0.5, T_Y_MAX * 0.5],
      type: "scatter",
      mode: "lines",
      line: { color: "#913622", width: 5 },
      name: "Deviazione standard",
      hoverinfo: "skip"
    });
  }

  const plotWidth = Math.max(320, Math.round(plotEl.clientWidth));
  const layout = {
    margin: { t: 10, r: 10, b: 70, l: 40 },
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

const bindTStudentStats = () => {
  const nSlider = document.getElementById("tstudent-stats-n-slider");
  const nValue = document.getElementById("tstudent-stats-n-value");
  const expectedValueSpan = document.getElementById("tstudent-expected-value");
  const varianceValueSpan = document.getElementById("tstudent-variance-value");

  if (!nSlider || !nValue || !expectedValueSpan || !varianceValueSpan) {
    return;
  }

  const updateStats = () => {
    const n = Number.parseInt(nSlider.value, 10);
    const expectedValue = n > 1 ? 0 : null;
    const variance = n > 2 ? n / (n - 2) : null;

    updateTStudentStatsPlot();

    if (window.katex) {
      window.katex.render(String(n), nValue, { throwOnError: false });
      window.katex.render(expectedValue === null ? "n.d." : expectedValue.toFixed(2), expectedValueSpan, { throwOnError: false });
      window.katex.render(variance === null ? "n.d." : variance.toFixed(2), varianceValueSpan, { throwOnError: false });
    } else {
      nValue.textContent = String(n);
      expectedValueSpan.textContent = expectedValue === null ? "n.d." : expectedValue.toFixed(2);
      varianceValueSpan.textContent = variance === null ? "n.d." : variance.toFixed(2);
    }
  };

  nSlider.addEventListener("input", updateStats);
  updateStats();
};

export const initTStudentStats = () => {
  bindTStudentStats();
  updateTStudentStatsPlot();
};
