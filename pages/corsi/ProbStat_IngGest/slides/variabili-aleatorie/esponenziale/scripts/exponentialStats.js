const EXPONENTIAL_X_MAX = 8;
const EXPONENTIAL_POINTS = 200;

const exponentialPdf = (lambda, x) => (
  x < 0 ? 0 : lambda * Math.exp(-lambda * x)
);

const buildCurve = (lambda) => {
  const step = EXPONENTIAL_X_MAX / (EXPONENTIAL_POINTS - 1);
  const xValues = Array.from({ length: EXPONENTIAL_POINTS }, (_, index) => index * step);
  const yValues = xValues.map((x) => exponentialPdf(lambda, x));
  return { xValues, yValues };
};

const updateExponentialStatsPlot = () => {
  const plotEl = document.getElementById("exponential-plot-2");
  const lambdaSlider = document.getElementById("exponential-lambda-slider-2");

  if (!plotEl || !lambdaSlider) {
    return;
  }

  const lambda = Number.parseFloat(lambdaSlider.value);
  const mean = 1 / lambda;
  const variance = 1 / (lambda ** 2);
  const stdDev = Math.sqrt(variance);
  const stdDevStart = Math.max(0, mean - stdDev);
  const stdDevEnd = mean + stdDev;

  const { xValues, yValues } = buildCurve(lambda);
  const yMax = 3;

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
      y: [0, yMax],
      type: "scatter",
      mode: "lines",
      line: { color: "#255d58", width: 5 },
      name: "Valore atteso",
      hoverinfo: "skip"
    },
    {
      x: [stdDevStart, stdDevEnd],
      y: [yMax * 0.5, yMax * 0.5],
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
      range: [0, EXPONENTIAL_X_MAX],
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

const bindExponentialStats = () => {
  const lambdaSlider = document.getElementById("exponential-lambda-slider-2");
  const lambdaValue = document.getElementById("exponential-lambda-value-2");
  const expectedValueSpan = document.getElementById("exponential-expected-value");
  const varianceValueSpan = document.getElementById("exponential-variance-value");

  if (!lambdaSlider || !lambdaValue || !expectedValueSpan || !varianceValueSpan) {
    return;
  }

  const updateStats = () => {
    const lambda = Number.parseFloat(lambdaSlider.value);
    const expectedValue = 1 / lambda;
    const variance = 1 / (lambda ** 2);

    updateExponentialStatsPlot();

    if (window.katex) {
      window.katex.render(lambda.toFixed(1), lambdaValue, { throwOnError: false });
      window.katex.render(expectedValue.toFixed(2), expectedValueSpan, { throwOnError: false });
      window.katex.render(variance.toFixed(2), varianceValueSpan, { throwOnError: false });
    } else {
      lambdaValue.textContent = lambda.toFixed(1);
      expectedValueSpan.textContent = expectedValue.toFixed(2);
      varianceValueSpan.textContent = variance.toFixed(2);
    }
  };

  lambdaSlider.addEventListener("input", updateStats);
  updateStats();
};

export const initExponentialStats = () => {
  bindExponentialStats();
  updateExponentialStatsPlot();
};
