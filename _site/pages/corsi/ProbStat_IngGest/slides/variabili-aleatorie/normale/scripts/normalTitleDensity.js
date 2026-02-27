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

const drawNormalTitleDensity = () => {
  const plotEl = document.getElementById("normal-density");
  const muSlider = document.getElementById("normal-title-mu-slider");
  const sigma2Slider = document.getElementById("normal-title-sigma2-slider");
  const muValue = document.getElementById("normal-title-mu-value");
  const sigma2Value = document.getElementById("normal-title-sigma2-value");

  if (!plotEl || !muSlider || !sigma2Slider) {
    return;
  }

  const mu = Number.parseFloat(muSlider.value);
  const sigma2 = Number.parseFloat(sigma2Slider.value);

  if (muValue) {
    const text = mu.toFixed(1);
    if (window.katex) {
      window.katex.render(text, muValue, { throwOnError: false });
    } else {
      muValue.textContent = text;
    }
  }

  if (sigma2Value) {
    const text = sigma2.toFixed(1);
    if (window.katex) {
      window.katex.render(text, sigma2Value, { throwOnError: false });
    } else {
      sigma2Value.textContent = text;
    }
  }

  const { xValues, yValues } = buildCurve(mu, sigma2);
  const yMax = 1;

  const data = [
    {
      x: xValues,
      y: yValues,
      type: "scatter",
      mode: "lines",
      line: { color: "#2e6f8e", width: 3 },
      fill: "tozeroy",
      fillcolor: "rgba(46, 111, 142, 0.8)",
      hoverinfo: "skip"
    }
  ];

  const plotWidth = Math.max(320, Math.round(plotEl.clientWidth));
  const layout = {
    margin: { t: 10, r: 10, b: 40, l: 50 },
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
    showlegend: false
  };

  Plotly.react(plotEl, data, layout, { displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true })
    .then(() => {
      if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
      }
    });
};

export const initNormalTitleDensity = () => {
  const muSlider = document.getElementById("normal-title-mu-slider");
  const sigma2Slider = document.getElementById("normal-title-sigma2-slider");

  if (muSlider && muSlider.dataset.bound !== "true") {
    muSlider.addEventListener("input", drawNormalTitleDensity);
    muSlider.dataset.bound = "true";
  }

  if (sigma2Slider && sigma2Slider.dataset.bound !== "true") {
    sigma2Slider.addEventListener("input", drawNormalTitleDensity);
    sigma2Slider.dataset.bound = "true";
  }

  drawNormalTitleDensity();
};
