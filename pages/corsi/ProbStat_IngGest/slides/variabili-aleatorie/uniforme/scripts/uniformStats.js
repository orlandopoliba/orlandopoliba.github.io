const UNIFORM_X_MIN = 0;
const UNIFORM_X_MAX = 8;

const updateUniformStatsPlot = () => {
  const plotEl = document.getElementById("uniform-plot-2");
  const aSlider = document.getElementById("uniform-stats-a-slider");
  const bSlider = document.getElementById("uniform-stats-b-slider");

  if (!plotEl || !aSlider || !bSlider) {
    return;
  }

  const step = Number.parseFloat(aSlider.step || "0.01");
  let a = Number.parseFloat(aSlider.value);
  let b = Number.parseFloat(bSlider.value);

  if (a >= b) {
    if (aSlider === document.activeElement) {
      a = b - step;
      aSlider.value = a.toFixed(2);
    } else {
      b = a + step;
      bSlider.value = b.toFixed(2);
    }
  }

  a = Math.max(UNIFORM_X_MIN, Math.min(a, UNIFORM_X_MAX));
  b = Math.max(UNIFORM_X_MIN, Math.min(b, UNIFORM_X_MAX));

  const density = b > a ? 1 / (b - a) : 0;
  const mean = (a + b) / 2;
  const variance = ((b - a) ** 2) / 12;
  const stdDev = Math.sqrt(variance);
  const stdDevStart = mean - stdDev;
  const stdDevEnd = mean + stdDev;
  const yMax = Math.max(1, density * 1.4);

  const data = [
    {
      x: [UNIFORM_X_MIN, a, a, b, b, UNIFORM_X_MAX],
      y: [0, 0, density, density, 0, 0],
      type: "scatter",
      mode: "lines",
      line: { color: "#2e6f8e", width: 3, shape: "hv" },
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
      range: [UNIFORM_X_MIN, UNIFORM_X_MAX],
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

const bindUniformStats = () => {
  const aSlider = document.getElementById("uniform-stats-a-slider");
  const bSlider = document.getElementById("uniform-stats-b-slider");
  const aValue = document.getElementById("uniform-stats-a-value");
  const bValue = document.getElementById("uniform-stats-b-value");
  const expectedValueSpan = document.getElementById("uniform-expected-value");
  const varianceValueSpan = document.getElementById("uniform-variance-value");

  if (!aSlider || !bSlider || !aValue || !bValue || !expectedValueSpan || !varianceValueSpan) {
    return;
  }

  const updateStats = () => {
    const step = Number.parseFloat(aSlider.step || "0.01");
    let a = Number.parseFloat(aSlider.value);
    let b = Number.parseFloat(bSlider.value);

    if (a >= b) {
      if (aSlider === document.activeElement) {
        a = b - step;
        aSlider.value = a.toFixed(2);
      } else {
        b = a + step;
        bSlider.value = b.toFixed(2);
      }
    }

    a = Math.max(UNIFORM_X_MIN, Math.min(a, UNIFORM_X_MAX));
    b = Math.max(UNIFORM_X_MIN, Math.min(b, UNIFORM_X_MAX));

    const expectedValue = (a + b) / 2;
    const variance = ((b - a) ** 2) / 12;

    updateUniformStatsPlot();

    if (window.katex) {
      window.katex.render(a.toFixed(2), aValue, { throwOnError: false });
      window.katex.render(b.toFixed(2), bValue, { throwOnError: false });
      window.katex.render(expectedValue.toFixed(2), expectedValueSpan, { throwOnError: false });
      window.katex.render(variance.toFixed(2), varianceValueSpan, { throwOnError: false });
    } else {
      aValue.textContent = a.toFixed(2);
      bValue.textContent = b.toFixed(2);
      expectedValueSpan.textContent = expectedValue.toFixed(2);
      varianceValueSpan.textContent = variance.toFixed(2);
    }
  };

  aSlider.addEventListener("input", updateStats);
  bSlider.addEventListener("input", updateStats);
  updateStats();
};

export const initUniformStats = () => {
  bindUniformStats();
  updateUniformStatsPlot();
};
