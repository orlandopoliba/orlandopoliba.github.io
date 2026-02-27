const GEOMETRIC_DISPLAY_MAX = 12;

const geometricPmf = (p, maxK) => {
  const values = [];
  for (let k = 1; k < maxK; k += 1) {
    values.push((1 - p) ** (k - 1) * p);
  }
  values.push((1 - p) ** (maxK - 1));
  return values;
};

const drawGeometricBar = () => {
  const plotEl = document.getElementById("geometric-bar");
  const pSlider = document.getElementById("geometric-title-p-slider");
  const pValue = document.getElementById("geometric-title-p-value");
  if (!plotEl) {
    return;
  }

  const p = pSlider ? Number.parseFloat(pSlider.value) : 0.50;
  const pText = p.toFixed(2);
  if (pValue) {
    if (window.katex) {
      window.katex.render(pText, pValue, { throwOnError: false });
    } else {
      pValue.textContent = pText;
    }
  }
  const probabilities = geometricPmf(p, GEOMETRIC_DISPLAY_MAX);
  const xValues = Array.from({ length: GEOMETRIC_DISPLAY_MAX }, (_, index) => index + 1);
  const tickText = xValues.map((value, index) => (
    index === GEOMETRIC_DISPLAY_MAX - 1 ? `${GEOMETRIC_DISPLAY_MAX}+` : String(value)
  ));

  const data = [
    {
      x: xValues,
      y: probabilities,
      type: "bar",
      marker: { color: "#2e6f8e", opacity: 0.8 }
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
      tickvals: xValues,
      ticktext: tickText,
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

export const initGeometricBar = () => {
  const pSlider = document.getElementById("geometric-title-p-slider");
  if (pSlider && pSlider.dataset.bound !== "true") {
    pSlider.addEventListener("input", drawGeometricBar);
    pSlider.dataset.bound = "true";
  }
  drawGeometricBar();
};
