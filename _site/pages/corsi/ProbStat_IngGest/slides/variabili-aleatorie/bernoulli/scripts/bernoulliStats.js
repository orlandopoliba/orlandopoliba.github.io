const updateBernoulliBar = () => {
  const plotEl = document.getElementById("bernoulli-plot-2");
  const pSlider = document.getElementById("bernoulli-p-slider-2");
  
  if (!plotEl) {
    return;
  }

  const pValue = pSlider ? Number.parseFloat(pSlider.value) : 0.5;
  const variance = pValue * (1 - pValue);
  const stdDev = Math.sqrt(variance);
  const halfStdDev = stdDev / 2;
  const stdDevStart = pValue - halfStdDev;
  const stdDevEnd = pValue + halfStdDev;

  const data = [
    {
      x: [0, 1],
      y: [1 - pValue, pValue],
      type: "bar",
      marker: { color: "#2e6f8e", opacity: 0.5 },
      name: "Legge teorica",
      showlegend: false
    },
    {
      x: [pValue, pValue],
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
      tickvals: [0, 1],
      ticktext: ["0", "1"],
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

const bindBernoulliStats = () => {
    const pSlider = document.getElementById('bernoulli-p-slider-2');
    const expectedValueSpan = document.getElementById('bernoulli-expected-value');
    const varianceValueSpan = document.getElementById('bernoulli-variance-value');
    const pValue = document.getElementById("bernoulli-p-value-2");

    if (!pSlider || !expectedValueSpan || !varianceValueSpan || !pValue) {
        return;
    }

    const updateStats = () => {
        const p = Number.parseFloat(pSlider.value);
        const expectedValue = p;
        const variance = p * (1 - p);

        updateBernoulliBar();

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

    pSlider.addEventListener('input', updateStats);
    updateStats();
};

export const initBernoulliStats = () => {
    bindBernoulliStats();
    updateBernoulliBar();
}
