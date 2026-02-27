const drawBernoulliBar = () => {
  const plotEl = document.getElementById("bernoulli-bar");
  const pSlider = document.getElementById("bernoulli-title-p-slider");
  const pValue = document.getElementById("bernoulli-title-p-value");
  if (!plotEl) {
    return;
  }

  const p = pSlider ? Number.parseFloat(pSlider.value) : 0.75;
  const pText = p.toFixed(2);
  if (pValue) {
    if (window.katex) {
      window.katex.render(pText, pValue, { throwOnError: false });
    } else {
      pValue.textContent = pText;
    }
  }
  const data = [
    {
      x: [0, 1],
      y: [1 - p, p],
      type: "bar",
      marker: { color: "#2e6f8e", opacity: 0.8}
    }
  ];

  const plotWidth = Math.max(320, Math.round(plotEl.clientWidth));
  const layout = {
    margin: { t: 10, r: 10, b: 40, l: 40 },
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
    plot_bgcolor: "rgb(247, 247, 247)"
  };

  Plotly.react(plotEl, data, layout, {displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true})
    .then(() => {
      if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
      }
    });
};

export const initBernoulliBar = () => {
  const pSlider = document.getElementById("bernoulli-title-p-slider");
  if (pSlider && pSlider.dataset.bound !== "true") {
    pSlider.addEventListener("input", drawBernoulliBar);
    pSlider.dataset.bound = "true";
  }
  drawBernoulliBar();
};
