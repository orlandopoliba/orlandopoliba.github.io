const combination = (n, k) => {
  const safeK = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= safeK; i += 1) {
    result *= (n - safeK + i) / i;
  }
  return result;
};

const binomialPmf = (n, p) => {
  const values = [];
  for (let k = 0; k <= n; k += 1) {
    values.push(combination(n, k) * (p ** k) * ((1 - p) ** (n - k)));
  }
  return values;
};

const updateBinomialBar = () => {
  const plotEl = document.getElementById("binomial-plot-2");
  const nSlider = document.getElementById("binomial-n-slider-2");
  const pSlider = document.getElementById("binomial-p-slider-2");

  if (!plotEl) {
    return;
  }

  const n = nSlider ? Number.parseInt(nSlider.value, 10) : 10;
  const p = pSlider ? Number.parseFloat(pSlider.value) : 0.5;
  const probabilities = binomialPmf(n, p);
  const fixedTicks = Array.from({ length: 11 }, (_, index) => index);
  const fixedProbabilities = fixedTicks.map((k) => (k <= n ? probabilities[k] : 0));
  const mean = n * p;
  const variance = n * p * (1 - p);
  const stdDev = Math.sqrt(variance);
  const stdDevStart = mean - stdDev;
  const stdDevEnd = mean + stdDev;
  const maxY = Math.max(...probabilities);

  const data = [
    {
      x: fixedTicks,
      y: fixedProbabilities,
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
      tickvals: fixedTicks,
      ticktext: fixedTicks.map((value) => String(value)),
      range: [-0.5, 10.5],
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
    shapes: n < 10
      ? [
          {
            type: "rect",
            xref: "x",
            yref: "paper",
            x0: n + 0.5,
            x1: 10.5,
            y0: 0,
            y1: 1,
            fillcolor: "rgba(200, 200, 200, 0.35)",
            line: { width: 0 }
          }
        ]
      : [],
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

const bindBinomialStats = () => {
  const nSlider = document.getElementById("binomial-n-slider-2");
  const pSlider = document.getElementById("binomial-p-slider-2");
  const expectedValueSpan = document.getElementById("binomial-expected-value");
  const varianceValueSpan = document.getElementById("binomial-variance-value");
  const nValue = document.getElementById("binomial-n-value-2");
  const pValue = document.getElementById("binomial-p-value-2");

  if (!nSlider || !pSlider || !expectedValueSpan || !varianceValueSpan || !nValue || !pValue) {
    return;
  }

  const updateStats = () => {
    const n = Number.parseInt(nSlider.value, 10);
    const p = Number.parseFloat(pSlider.value);
    const expectedValue = n * p;
    const variance = n * p * (1 - p);

    updateBinomialBar();

    if (window.katex) {
      window.katex.render(String(n), nValue, { throwOnError: false });
      window.katex.render(p.toFixed(2), pValue, { throwOnError: false });
      window.katex.render(expectedValue.toFixed(2), expectedValueSpan, { throwOnError: false });
      window.katex.render(variance.toFixed(2), varianceValueSpan, { throwOnError: false });
    } else {
      nValue.textContent = String(n);
      pValue.textContent = p.toFixed(2);
      expectedValueSpan.textContent = expectedValue.toFixed(2);
      varianceValueSpan.textContent = variance.toFixed(2);
    }
  };

  nSlider.addEventListener("input", updateStats);
  pSlider.addEventListener("input", updateStats);
  updateStats();
};

export const initBinomialStats = () => {
  bindBinomialStats();
  updateBinomialBar();
};
