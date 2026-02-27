import { gammaPdf, regularizedGammaP } from "./chisqUtils.js";

const CHISQ_X_MIN = 0;
const CHISQ_X_MAX = 20;
const CHISQ_POINTS = 300;
const CHISQ_Y_MAX = 0.5;

const buildCurve = (n) => {
  const alpha = n / 2;
  const lambda = 0.5;
  const step = (CHISQ_X_MAX - CHISQ_X_MIN) / (CHISQ_POINTS - 1);
  const xValues = Array.from({ length: CHISQ_POINTS }, (_, index) => CHISQ_X_MIN + index * step);
  const yValues = xValues.map((x) => gammaPdf(alpha, lambda, x));
  return { xValues, yValues };
};

const chisqCdf = (n, x) => {
  if (x <= 0) {
    return 0;
  }
  return regularizedGammaP(n / 2, x / 2);
};

const drawChiSqProbabilityPlot = () => {
  const plotEl = document.getElementById("chisq-probability-plot");
  const nSlider = document.getElementById("chisq-probability-n-slider");
  const nValue = document.getElementById("chisq-probability-n-value");
  const x1Slider = document.getElementById("chisq-probability-x1-slider");
  const x2Slider = document.getElementById("chisq-probability-x2-slider");
  const x1Value = document.getElementById("chisq-probability-x1-value");
  const x2Value = document.getElementById("chisq-probability-x2-value");
  const probabilityResult = document.getElementById("chisq-probability-result");

  if (!plotEl || !nSlider || !x1Slider || !x2Slider) {
    return;
  }

  const n = Number.parseInt(nSlider.value, 10);

  if (nValue) {
    const text = String(n);
    if (window.katex) {
      window.katex.render(text, nValue, { throwOnError: false });
    } else {
      nValue.textContent = text;
    }
  }

  const step = Number.parseFloat(x1Slider.step || "0.05");
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

  x1 = Math.max(CHISQ_X_MIN, Math.min(x1, CHISQ_X_MAX));
  x2 = Math.max(CHISQ_X_MIN, Math.min(x2, CHISQ_X_MAX));

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

  const { xValues, yValues } = buildCurve(n);

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

  if (x2 > x1) {
    const areaX = [];
    const areaY = [];
    xValues.forEach((x, index) => {
      if (x >= x1 && x <= x2) {
        areaX.push(x);
        areaY.push(yValues[index]);
      }
    });
    if (areaX.length === 0) {
      areaX.push(x1, x2);
      areaY.push(gammaPdf(n / 2, 0.5, x1), gammaPdf(n / 2, 0.5, x2));
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
      range: [CHISQ_X_MIN, CHISQ_X_MAX],
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, CHISQ_Y_MAX],
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
    const probability = chisqCdf(n, x2) - chisqCdf(n, x1);
    const percentText = `${(probability * 100).toFixed(2)}\\%`;
    const formula = String.raw`\displaystyle \mathbb{P}(\{x_1 \leq X \leq x_2\}) = \int_{x_1}^{x_2} \frac{1}{2^\frac{n}{2}\Gamma(\frac{n}{2})} x^{\frac{n}{2} - 1} e^{-\frac{x}{2}} \, \mathrm{d} x = ${percentText}`;
    if (window.katex) {
      window.katex.render(formula, probabilityResult, { throwOnError: false });
    } else {
      probabilityResult.textContent = `P(x1 <= X <= x2) = ${percentText}`;
    }
  }
};

export const initChiSqProbability = () => {
  const nSlider = document.getElementById("chisq-probability-n-slider");
  const x1Slider = document.getElementById("chisq-probability-x1-slider");
  const x2Slider = document.getElementById("chisq-probability-x2-slider");

  if (nSlider && nSlider.dataset.bound !== "true") {
    nSlider.addEventListener("input", drawChiSqProbabilityPlot);
    nSlider.dataset.bound = "true";
  }

  if (x1Slider && x1Slider.dataset.bound !== "true") {
    x1Slider.addEventListener("input", drawChiSqProbabilityPlot);
    x1Slider.dataset.bound = "true";
  }

  if (x2Slider && x2Slider.dataset.bound !== "true") {
    x2Slider.addEventListener("input", drawChiSqProbabilityPlot);
    x2Slider.dataset.bound = "true";
  }

  drawChiSqProbabilityPlot();
};
