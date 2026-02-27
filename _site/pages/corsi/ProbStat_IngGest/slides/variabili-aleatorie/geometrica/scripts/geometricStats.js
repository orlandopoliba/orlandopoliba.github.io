const GEOMETRIC_DISPLAY_MAX = 20;

const geometricPmfWithTail = (p) => {
  const values = [];
  for (let k = 1; k < GEOMETRIC_DISPLAY_MAX; k += 1) {
    values.push((1 - p) ** (k - 1) * p);
  }
  values.push((1 - p) ** (GEOMETRIC_DISPLAY_MAX - 1));
  return values;
};

const updateGeometricBar = () => {
  const plotEl = document.getElementById("geometric-plot-2");
  const pSlider = document.getElementById("geometric-p-slider-2");

  if (!plotEl) {
    return;
  }

  const p = pSlider ? Number.parseFloat(pSlider.value) : 0.5;
  const probabilities = geometricPmfWithTail(p);
  const mean = 1 / p;
  const variance = (1 - p) / (p ** 2);
  const stdDev = Math.sqrt(variance);
  const stdDevStart = Math.max(1, mean - stdDev);
  const stdDevEnd = Math.min(GEOMETRIC_DISPLAY_MAX, mean + stdDev);

  const xValues = Array.from({ length: GEOMETRIC_DISPLAY_MAX }, (_, index) => index + 1);
  const tickText = xValues.map((value, index) => (
    index === GEOMETRIC_DISPLAY_MAX - 1 ? `${GEOMETRIC_DISPLAY_MAX}+` : String(value)
  ));

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
      tickmode: "array",
      tickvals: xValues,
      ticktext: tickText,
      range: [0.5, GEOMETRIC_DISPLAY_MAX + 0.5],
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

const bindGeometricStats = () => {
  const pSlider = document.getElementById("geometric-p-slider-2");
  const expectedValueSpan = document.getElementById("geometric-expected-value");
  const varianceValueSpan = document.getElementById("geometric-variance-value");
  const pValue = document.getElementById("geometric-p-value-2");

  if (!pSlider || !expectedValueSpan || !varianceValueSpan || !pValue) {
    return;
  }

  const updateStats = () => {
    const p = Number.parseFloat(pSlider.value);
    const expectedValue = 1 / p;
    const variance = (1 - p) / (p ** 2);

    updateGeometricBar();

    if (window.katex) {
      window.katex.render(p.toFixed(2), pValue, { throwOnError: false });
      window.katex.render(expectedValue.toFixed(2), expectedValueSpan, { throwOnError: false });
      window.katex.render(variance.toFixed(2), varianceValueSpan, { throwOnError: false });
    } else {
      pValue.textContent = p.toFixed(2);
      expectedValueSpan.textContent = expectedValue.toFixed(2);
      varianceValueSpan.textContent = variance.toFixed(2);
    }
  };

  pSlider.addEventListener("input", updateStats);
  updateStats();
};

export const initGeometricStats = () => {
  bindGeometricStats();
  updateGeometricBar();
};
