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

const erf = (x) => {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * absX);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const poly = (((a5 * t + a4) * t + a3) * t + a2) * t + a1;
  const approx = 1 - poly * t * Math.exp(-absX * absX);
  return sign * approx;
};

const normalCdf = (mu, sigma2, x) => {
  const z = (x - mu) / Math.sqrt(2 * sigma2);
  return 0.5 * (1 + erf(z));
};

const buildCurve = (mu, sigma2) => {
  const step = (NORMAL_X_MAX - NORMAL_X_MIN) / (NORMAL_POINTS - 1);
  const xValues = Array.from({ length: NORMAL_POINTS }, (_, index) => NORMAL_X_MIN + index * step);
  const yValues = xValues.map((x) => normalPdf(mu, sigma2, x));
  return { xValues, yValues };
};

const drawNormalProbabilityPlot = () => {
  const plotEl = document.getElementById("normal-probability-plot");
  const muSlider = document.getElementById("normal-probability-mu-slider");
  const sigma2Slider = document.getElementById("normal-probability-sigma2-slider");
  const muValue = document.getElementById("normal-probability-mu-value");
  const sigma2Value = document.getElementById("normal-probability-sigma2-value");
  const x1Slider = document.getElementById("normal-probability-x1-slider");
  const x2Slider = document.getElementById("normal-probability-x2-slider");
  const x1Value = document.getElementById("normal-probability-x1-value");
  const x2Value = document.getElementById("normal-probability-x2-value");
  const probabilityResult = document.getElementById("normal-probability-result");

  if (!plotEl || !muSlider || !sigma2Slider || !x1Slider || !x2Slider) {
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

  const step = Number.parseFloat(x1Slider.step || "0.01");
  let x1 = Number.parseFloat(x1Slider.value);
  let x2 = Number.parseFloat(x2Slider.value);

  if (x1 >= x2) {
    if (x1Slider === document.activeElement) {
      x1 = x2 - step;
      x1Slider.value = x1.toFixed(2);
    } else {
      x2 = x1 + step;
      x2Slider.value = x2.toFixed(2);
    }
  }

  x1 = Math.max(NORMAL_X_MIN, Math.min(x1, NORMAL_X_MAX));
  x2 = Math.max(NORMAL_X_MIN, Math.min(x2, NORMAL_X_MAX));

  if (x1Value) {
    const text = x1.toFixed(2);
    if (window.katex) {
      window.katex.render(text, x1Value, { throwOnError: false });
    } else {
      x1Value.textContent = text;
    }
  }

  if (x2Value) {
    const text = x2.toFixed(2);
    if (window.katex) {
      window.katex.render(text, x2Value, { throwOnError: false });
    } else {
      x2Value.textContent = text;
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
      hoverinfo: "skip"
    }
  ];

  const shadeStart = Math.max(x1, NORMAL_X_MIN);
  const shadeEnd = Math.min(x2, NORMAL_X_MAX);

  if (shadeEnd > shadeStart) {
    const areaX = [];
    const areaY = [];
    xValues.forEach((x, index) => {
      if (x >= shadeStart && x <= shadeEnd) {
        areaX.push(x);
        areaY.push(yValues[index]);
      }
    });
    if (areaX.length === 0) {
      areaX.push(shadeStart, shadeEnd);
      areaY.push(normalPdf(mu, sigma2, shadeStart), normalPdf(mu, sigma2, shadeEnd));
    }
    data.push({
      x: areaX,
      y: areaY,
      type: "scatter",
      mode: "lines",
      line: { color: "rgba(46, 111, 142, 0)" },
      fill: "tozeroy",
      fillcolor: "rgba(46, 111, 142, 0.8)",
      hoverinfo: "skip"
    });
  }

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

  if (probabilityResult) {
    const probability = normalCdf(mu, sigma2, x2) - normalCdf(mu, sigma2, x1);
    const percentText = `${(probability * 100).toFixed(2)}\\%`;
    const formula = String.raw`\displaystyle \mathbb{P}(\{x_1 \leq X \leq x_2\}) = \frac{1}{\sigma\sqrt{2\pi}}\int_{x_1}^{x_2} e^{-\frac{1}{2}(\frac{x - \mu}{\sigma})^2} \, \mathrm{d} x = ${percentText}`;
    if (window.katex) {
      window.katex.render(formula, probabilityResult, { throwOnError: false });
    } else {
      probabilityResult.textContent = `P(x1 <= X <= x2) = ${percentText}`;
    }
  }
};

export const initNormalProbability = () => {
  const muSlider = document.getElementById("normal-probability-mu-slider");
  const sigma2Slider = document.getElementById("normal-probability-sigma2-slider");
  const x1Slider = document.getElementById("normal-probability-x1-slider");
  const x2Slider = document.getElementById("normal-probability-x2-slider");

  if (muSlider && muSlider.dataset.bound !== "true") {
    muSlider.addEventListener("input", drawNormalProbabilityPlot);
    muSlider.dataset.bound = "true";
  }

  if (sigma2Slider && sigma2Slider.dataset.bound !== "true") {
    sigma2Slider.addEventListener("input", drawNormalProbabilityPlot);
    sigma2Slider.dataset.bound = "true";
  }

  if (x1Slider && x1Slider.dataset.bound !== "true") {
    x1Slider.addEventListener("input", drawNormalProbabilityPlot);
    x1Slider.dataset.bound = "true";
  }

  if (x2Slider && x2Slider.dataset.bound !== "true") {
    x2Slider.addEventListener("input", drawNormalProbabilityPlot);
    x2Slider.dataset.bound = "true";
  }

  drawNormalProbabilityPlot();
};
