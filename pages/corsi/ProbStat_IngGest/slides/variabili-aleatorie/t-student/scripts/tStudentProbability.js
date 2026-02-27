import { tPdf, tCdf } from "./tStudentUtils.js";

const T_X_MIN = -6;
const T_X_MAX = 6;
const T_POINTS = 300;
const T_Y_MAX = 0.5;

const buildCurve = (n) => {
  const step = (T_X_MAX - T_X_MIN) / (T_POINTS - 1);
  const xValues = Array.from({ length: T_POINTS }, (_, index) => T_X_MIN + index * step);
  const yValues = xValues.map((x) => tPdf(n, x));
  return { xValues, yValues };
};

const drawTStudentProbabilityPlot = () => {
  const plotEl = document.getElementById("tstudent-probability-plot");
  const nSlider = document.getElementById("tstudent-probability-n-slider");
  const nValue = document.getElementById("tstudent-probability-n-value");
  const x1Slider = document.getElementById("tstudent-probability-x1-slider");
  const x2Slider = document.getElementById("tstudent-probability-x2-slider");
  const x1Value = document.getElementById("tstudent-probability-x1-value");
  const x2Value = document.getElementById("tstudent-probability-x2-value");
  const probabilityResult = document.getElementById("tstudent-probability-result");

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

  x1 = Math.max(T_X_MIN, Math.min(x1, T_X_MAX));
  x2 = Math.max(T_X_MIN, Math.min(x2, T_X_MAX));

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
      areaY.push(tPdf(n, x1), tPdf(n, x2));
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
      range: [T_X_MIN, T_X_MAX],
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, T_Y_MAX],
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
    const probability = tCdf(n, x2) - tCdf(n, x1);
    const percentText = `${(probability * 100).toFixed(2)}\\%`;
    const formula = String.raw`\displaystyle \mathbb{P}(\{x_1 \leq T_n \leq x_2\}) = \int_{x_1}^{x_2} f_{T_n}(t) \, \mathrm{d} t = ${percentText}`;
    if (window.katex) {
      window.katex.render(formula, probabilityResult, { throwOnError: false });
    } else {
      probabilityResult.textContent = `P(x1 <= T_n <= x2) = ${percentText}`;
    }
  }
};

export const initTStudentProbability = () => {
  const nSlider = document.getElementById("tstudent-probability-n-slider");
  const x1Slider = document.getElementById("tstudent-probability-x1-slider");
  const x2Slider = document.getElementById("tstudent-probability-x2-slider");

  if (nSlider && nSlider.dataset.bound !== "true") {
    nSlider.addEventListener("input", drawTStudentProbabilityPlot);
    nSlider.dataset.bound = "true";
  }

  if (x1Slider && x1Slider.dataset.bound !== "true") {
    x1Slider.addEventListener("input", drawTStudentProbabilityPlot);
    x1Slider.dataset.bound = "true";
  }

  if (x2Slider && x2Slider.dataset.bound !== "true") {
    x2Slider.addEventListener("input", drawTStudentProbabilityPlot);
    x2Slider.dataset.bound = "true";
  }

  drawTStudentProbabilityPlot();
};
