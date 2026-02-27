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

const drawBinomialBar = () => {
  const plotEl = document.getElementById("binomial-bar");
  const nSlider = document.getElementById("binomial-title-n-slider");
  const pSlider = document.getElementById("binomial-title-p-slider");
  const nValue = document.getElementById("binomial-title-n-value");
  const pValue = document.getElementById("binomial-title-p-value");
  if (!plotEl) {
    return;
  }

  const n = nSlider ? Number.parseInt(nSlider.value, 10) : 6;
  const p = pSlider ? Number.parseFloat(pSlider.value) : 0.5;
  if (nValue && pValue) {
    if (window.katex) {
      window.katex.render(String(n), nValue, { throwOnError: false });
      window.katex.render(p.toFixed(2), pValue, { throwOnError: false });
    } else {
      nValue.textContent = String(n);
      pValue.textContent = p.toFixed(2);
    }
  }
  const probabilities = binomialPmf(n, p);

  const data = [
    {
      x: Array.from({ length: n + 1 }, (_, index) => index),
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
      tickvals: Array.from({ length: n + 1 }, (_, index) => index),
      ticktext: Array.from({ length: n + 1 }, (_, index) => String(index)),
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

export const initBinomialBar = () => {
  const nSlider = document.getElementById("binomial-title-n-slider");
  const pSlider = document.getElementById("binomial-title-p-slider");
  if (nSlider && nSlider.dataset.bound !== "true") {
    nSlider.addEventListener("input", drawBinomialBar);
    nSlider.dataset.bound = "true";
  }
  if (pSlider && pSlider.dataset.bound !== "true") {
    pSlider.addEventListener("input", drawBinomialBar);
    pSlider.dataset.bound = "true";
  }
  drawBinomialBar();
};
