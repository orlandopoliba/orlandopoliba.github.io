const POISSON_DISPLAY_MAX = 15;

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

const updatePoissonBar = () => {
  const plotEl = document.getElementById("poisson-plot-2");
  const lambdaSlider = document.getElementById("poisson-lambda-slider-2");

  if (!plotEl) {
    return;
  }

  const lambda = lambdaSlider ? Number.parseFloat(lambdaSlider.value) : 3;
  const probabilities = poissonPmf(lambda, POISSON_DISPLAY_MAX);
  const mean = lambda;
  const variance = lambda;
  const stdDev = Math.sqrt(variance);
  const stdDevStart = Math.max(0, mean - stdDev);
  const stdDevEnd = mean + stdDev;

  const xValues = Array.from({ length: POISSON_DISPLAY_MAX + 1 }, (_, index) => index);

  const data = [
    {
      x: xValues,
      y: probabilities,
      type: "bar",
      marker: { color: "#2e6f8e", opacity: 0.5 },
      name: "Legge teorica",
      showlegend: false
    },
    {
      x: [mean, mean],
      y: [0, 1],
      type: "scatter",
      mode: "lines",
      line: { color: "#255d58", width: 5 },
      name: "Valore atteso",
      hoverinfo: "skip"
    },
    {
      x: [stdDevStart, stdDevEnd],
      y: [0.2, 0.2],
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
      tickmode: "array",
      tickvals: xValues,
      ticktext: xValues.map((value) => String(value)),
      range: [-0.5, POISSON_DISPLAY_MAX + 0.5],
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, 0.4],
      showgrid: true,
      zeroline: false,
      showline: true,
      showticklabels: true,
      ticks: ""
    },
    paper_bgcolor: "rgb(247, 247, 247)",
    plot_bgcolor: "rgb(247, 247, 247)",
    barmode: "overlay",
    showlegend: true,
    legend: {
      orientation: "h",
      y: -0.25,
      x: 0.5,
      xanchor: "center",
      yanchor: "top"
    }
  };

  Plotly.react(plotEl, data, layout, {displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true})
    .then(() => {
      if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
      }
    });
};

const bindPoissonStats = () => {
  const lambdaSlider = document.getElementById("poisson-lambda-slider-2");
  const expectedValueSpan = document.getElementById("poisson-expected-value");
  const varianceValueSpan = document.getElementById("poisson-variance-value");
  const lambdaValue = document.getElementById("poisson-lambda-value-2");

  if (!lambdaSlider || !expectedValueSpan || !varianceValueSpan || !lambdaValue) {
    return;
  }

  const updateStats = () => {
    const lambda = Number.parseFloat(lambdaSlider.value);
    const expectedValue = lambda;
    const variance = lambda;

    updatePoissonBar();

    if (window.katex) {
      window.katex.render(lambda.toFixed(1), lambdaValue, { throwOnError: false });
      window.katex.render(expectedValue.toFixed(1), expectedValueSpan, { throwOnError: false });
      window.katex.render(variance.toFixed(1), varianceValueSpan, { throwOnError: false });
    } else {
      lambdaValue.textContent = lambda.toFixed(1);
      expectedValueSpan.textContent = expectedValue.toFixed(1);
      varianceValueSpan.textContent = variance.toFixed(1);
    }
  };

  lambdaSlider.addEventListener("input", updateStats);
  updateStats();
};

export const initPoissonStats = () => {
  bindPoissonStats();
  updatePoissonBar();
};
