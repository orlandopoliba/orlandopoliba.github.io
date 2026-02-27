import { gammaPdf, regularizedGammaP } from "./gammaUtils.js";

const GAMMA_X_MIN = 0;
const GAMMA_X_MAX = 8;
const GAMMA_POINTS = 300;

const buildCurve = (alpha, lambda) => {
  const step = (GAMMA_X_MAX - GAMMA_X_MIN) / (GAMMA_POINTS - 1);
  const xValues = Array.from({ length: GAMMA_POINTS }, (_, index) => GAMMA_X_MIN + index * step);
  const yValues = xValues.map((x) => gammaPdf(alpha, lambda, x));
  return { xValues, yValues };
};

const gammaCdf = (alpha, lambda, x) => {
  if (x <= 0) {
    return 0;
  }
  return regularizedGammaP(alpha, lambda * x);
};

const drawGammaProbabilityPlot = () => {
  const plotEl = document.getElementById("gamma-probability-plot");
  const alphaSlider = document.getElementById("gamma-probability-alpha-slider");
  const lambdaSlider = document.getElementById("gamma-probability-lambda-slider");
  const alphaValue = document.getElementById("gamma-probability-alpha-value");
  const lambdaValue = document.getElementById("gamma-probability-lambda-value");
  const x1Slider = document.getElementById("gamma-probability-x1-slider");
  const x2Slider = document.getElementById("gamma-probability-x2-slider");
  const x1Value = document.getElementById("gamma-probability-x1-value");
  const x2Value = document.getElementById("gamma-probability-x2-value");
  const probabilityResult = document.getElementById("gamma-probability-result");

  if (!plotEl || !alphaSlider || !lambdaSlider || !x1Slider || !x2Slider) {
    return;
  }

  const alpha = Number.parseFloat(alphaSlider.value);
  const lambda = Number.parseFloat(lambdaSlider.value);

  if (alphaValue) {
    const text = alpha.toFixed(1);
    if (window.katex) {
      window.katex.render(text, alphaValue, { throwOnError: false });
    } else {
      alphaValue.textContent = text;
    }
  }

  if (lambdaValue) {
    const text = lambda.toFixed(1);
    if (window.katex) {
      window.katex.render(text, lambdaValue, { throwOnError: false });
    } else {
      lambdaValue.textContent = text;
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

  x1 = Math.max(GAMMA_X_MIN, Math.min(x1, GAMMA_X_MAX));
  x2 = Math.max(GAMMA_X_MIN, Math.min(x2, GAMMA_X_MAX));

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

  const { xValues, yValues } = buildCurve(alpha, lambda);
  const yMax = 0.5;

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
      areaY.push(gammaPdf(alpha, lambda, x1), gammaPdf(alpha, lambda, x2));
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
      range: [GAMMA_X_MIN, GAMMA_X_MAX],
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, 0.5],
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
    const probability = gammaCdf(alpha, lambda, x2) - gammaCdf(alpha, lambda, x1);
    const percentText = `${(probability * 100).toFixed(2)}\\%`;
    const formula = String.raw`\displaystyle \mathbb{P}(\{x_1 \leq X \leq x_2\}) = \int_{x_1}^{x_2} \frac{\lambda^\alpha}{\Gamma(\alpha)} x^{\alpha - 1} e^{-\lambda x} \, \mathrm{d} x = ${percentText}`;
    if (window.katex) {
      window.katex.render(formula, probabilityResult, { throwOnError: false });
    } else {
      probabilityResult.textContent = `P(x1 <= X <= x2) = ${percentText}`;
    }
  }
};

export const initGammaProbability = () => {
  const alphaSlider = document.getElementById("gamma-probability-alpha-slider");
  const lambdaSlider = document.getElementById("gamma-probability-lambda-slider");
  const x1Slider = document.getElementById("gamma-probability-x1-slider");
  const x2Slider = document.getElementById("gamma-probability-x2-slider");

  if (alphaSlider && alphaSlider.dataset.bound !== "true") {
    alphaSlider.addEventListener("input", drawGammaProbabilityPlot);
    alphaSlider.dataset.bound = "true";
  }

  if (lambdaSlider && lambdaSlider.dataset.bound !== "true") {
    lambdaSlider.addEventListener("input", drawGammaProbabilityPlot);
    lambdaSlider.dataset.bound = "true";
  }

  if (x1Slider && x1Slider.dataset.bound !== "true") {
    x1Slider.addEventListener("input", drawGammaProbabilityPlot);
    x1Slider.dataset.bound = "true";
  }

  if (x2Slider && x2Slider.dataset.bound !== "true") {
    x2Slider.addEventListener("input", drawGammaProbabilityPlot);
    x2Slider.dataset.bound = "true";
  }

  drawGammaProbabilityPlot();
};
