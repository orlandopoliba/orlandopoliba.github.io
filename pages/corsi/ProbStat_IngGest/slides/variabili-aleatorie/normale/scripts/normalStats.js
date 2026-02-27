const NORMAL_X_MIN = -6;
const NORMAL_X_MAX = 6;
const NORMAL_POINTS = 300;

const normalPdf = (mu, sigma2, x) => {
  if (sigma2 <= 0) {
    return 0;
  }
  const sigma = Math.sqrt(sigma2);
  const coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const exponent = -((x - mu) ** 2) / (2 * sigma2);
  return coeff * Math.exp(exponent);
};

const buildCurve = (mu, sigma2) => {
  const step = (NORMAL_X_MAX - NORMAL_X_MIN) / (NORMAL_POINTS - 1);
  const xValues = Array.from({ length: NORMAL_POINTS }, (_, index) => NORMAL_X_MIN + index * step);
  const yValues = xValues.map((x) => normalPdf(mu, sigma2, x));
  return { xValues, yValues };
};

const updateNormalStatsPlot = () => {
  const plotEl = document.getElementById("normal-plot-2");
  const muSlider = document.getElementById("normal-stats-mu-slider");
  const sigma2Slider = document.getElementById("normal-stats-sigma2-slider");

  if (!plotEl || !muSlider || !sigma2Slider) {
    return;
  }

  const mu = Number.parseFloat(muSlider.value);
  const sigma2 = Number.parseFloat(sigma2Slider.value);
  const variance = sigma2;
  const stdDev = Math.sqrt(variance);
  const stdDevStart = mu - stdDev;
  const stdDevEnd = mu + stdDev;

  const { xValues, yValues } = buildCurve(mu, sigma2);
  const yMax = 1;

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
      x: [mu, mu],
      y: [0, 1],
      type: "scatter",
      mode: "lines",
      line: { color: "#255d58", width: 5 },
      name: "Valore atteso",
      hoverinfo: "skip"
    },
    {
      x: [stdDevStart, stdDevEnd],
      y: [0.5, 0.5],
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
      range: [NORMAL_X_MIN, NORMAL_X_MAX],
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

const bindNormalStats = () => {
  const muSlider = document.getElementById("normal-stats-mu-slider");
  const sigma2Slider = document.getElementById("normal-stats-sigma2-slider");
  const muValue = document.getElementById("normal-stats-mu-value");
  const sigma2Value = document.getElementById("normal-stats-sigma2-value");
  const expectedValueSpan = document.getElementById("normal-expected-value");
  const varianceValueSpan = document.getElementById("normal-variance-value");

  if (!muSlider || !sigma2Slider || !muValue || !sigma2Value || !expectedValueSpan || !varianceValueSpan) {
    return;
  }

  const updateStats = () => {
    const mu = Number.parseFloat(muSlider.value);
    const sigma2 = Number.parseFloat(sigma2Slider.value);
    const expectedValue = mu;
    const variance = sigma2;

    updateNormalStatsPlot();

    if (window.katex) {
      window.katex.render(mu.toFixed(1), muValue, { throwOnError: false });
      window.katex.render(sigma2.toFixed(1), sigma2Value, { throwOnError: false });
      window.katex.render(expectedValue.toFixed(2), expectedValueSpan, { throwOnError: false });
      window.katex.render(variance.toFixed(2), varianceValueSpan, { throwOnError: false });
    } else {
      muValue.textContent = mu.toFixed(1);
      sigma2Value.textContent = sigma2.toFixed(1);
      expectedValueSpan.textContent = expectedValue.toFixed(2);
      varianceValueSpan.textContent = variance.toFixed(2);
    }
  };

  muSlider.addEventListener("input", updateStats);
  sigma2Slider.addEventListener("input", updateStats);
  updateStats();
};

export const initNormalStats = () => {
  bindNormalStats();
  updateNormalStatsPlot();
};
