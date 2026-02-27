const UNIFORM_X_MIN = 0;
const UNIFORM_X_MAX = 8;
const UNIFORM_POINTS = 200;

const uniformPdf = (a, b, x) => {
  if (x < a || x > b || b <= a) {
    return 0;
  }
  return 1 / (b - a);
};

const buildCurve = (a, b) => {
  const step = (UNIFORM_X_MAX - UNIFORM_X_MIN) / (UNIFORM_POINTS - 1);
  const xValues = Array.from({ length: UNIFORM_POINTS }, (_, index) => UNIFORM_X_MIN + index * step);
  const yValues = xValues.map((x) => uniformPdf(a, b, x));
  return { xValues, yValues };
};

const drawUniformProbabilityPlot = () => {
  const plotEl = document.getElementById("uniform-probability-plot");
  const aSlider = document.getElementById("uniform-probability-a-slider");
  const bSlider = document.getElementById("uniform-probability-b-slider");
  const aValue = document.getElementById("uniform-probability-a-value");
  const bValue = document.getElementById("uniform-probability-b-value");
  const x1Slider = document.getElementById("uniform-probability-x1-slider");
  const x2Slider = document.getElementById("uniform-probability-x2-slider");
  const x1Value = document.getElementById("uniform-probability-x1-value");
  const x2Value = document.getElementById("uniform-probability-x2-value");
  const probabilityResult = document.getElementById("uniform-probability-result");

  if (!plotEl || !aSlider || !bSlider || !x1Slider || !x2Slider) {
    return;
  }

  const step = Number.parseFloat(aSlider.step || "0.01");
  let a = Number.parseFloat(aSlider.value);
  let b = Number.parseFloat(bSlider.value);

  if (a >= b) {
    if (aSlider === document.activeElement) {
      a = b - step;
      aSlider.value = a.toFixed(2);
    } else {
      b = a + step;
      bSlider.value = b.toFixed(2);
    }
  }

  a = Math.max(UNIFORM_X_MIN, Math.min(a, UNIFORM_X_MAX));
  b = Math.max(UNIFORM_X_MIN, Math.min(b, UNIFORM_X_MAX));

  if (aValue) {
    const text = a.toFixed(2);
    if (window.katex) {
      window.katex.render(text, aValue, { throwOnError: false });
    } else {
      aValue.textContent = text;
    }
  }

  if (bValue) {
    const text = b.toFixed(2);
    if (window.katex) {
      window.katex.render(text, bValue, { throwOnError: false });
    } else {
      bValue.textContent = text;
    }
  }

  const xStep = Number.parseFloat(x1Slider.step || "0.01");
  let x1 = Number.parseFloat(x1Slider.value);
  let x2 = Number.parseFloat(x2Slider.value);

  if (x1 >= x2) {
    if (x1Slider === document.activeElement) {
      x1 = x2 - xStep;
      x1Slider.value = x1.toFixed(2);
    } else {
      x2 = x1 + xStep;
      x2Slider.value = x2.toFixed(2);
    }
  }

  x1 = Math.max(UNIFORM_X_MIN, Math.min(x1, UNIFORM_X_MAX));
  x2 = Math.max(UNIFORM_X_MIN, Math.min(x2, UNIFORM_X_MAX));

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

  const { xValues, yValues } = buildCurve(a, b);
  const density = b > a ? 1 / (b - a) : 0;
  const yMax = Math.max(1, density * 1.2);

  const data = [
    {
      x: [UNIFORM_X_MIN, a, a, b, b, UNIFORM_X_MAX],
      y: [0, 0, density, density, 0, 0],
      type: "scatter",
      mode: "lines",
      line: { color: "#2e6f8e", width: 3, shape: "hv" },
      hoverinfo: "skip"
    }
  ];

  const shadeStart = Math.max(a, x1);
  const shadeEnd = Math.min(b, x2);

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
      areaY.push(uniformPdf(a, b, shadeStart), uniformPdf(a, b, shadeEnd));
    }
    data.push({
      x: areaX,
      y: areaY,
      type: "scatter",
      mode: "lines",
      line: { color: "rgba(46, 111, 142, 0)" },
      fill: "tozeroy",
      fillcolor: "rgba(46, 111, 142, 0.35)",
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
      range: [UNIFORM_X_MIN, UNIFORM_X_MAX],
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, yMax],
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
    const intervalLength = b - a;
    let probability = 0;
    if (intervalLength > 0) {
      const upper = Math.min(b, x2);
      const lower = Math.max(a, x1);
      probability = Math.max(0, upper - lower) / intervalLength;
    }
    const percentText = `${(probability * 100).toFixed(2)}\\%`;
    const formula = String.raw`\displaystyle \mathbb{P}(\{x_1 \leq X \leq x_2\}) = \int_{x_1}^{x_2} f(x) \, \mathrm{d} x = ${percentText}`;
    if (window.katex) {
      window.katex.render(formula, probabilityResult, { throwOnError: false });
    } else {
      probabilityResult.textContent = `P(x1 <= X <= x2) = ${percentText}`;
    }
  }
};

export const initUniformProbability = () => {
  const aSlider = document.getElementById("uniform-probability-a-slider");
  const bSlider = document.getElementById("uniform-probability-b-slider");
  const x1Slider = document.getElementById("uniform-probability-x1-slider");
  const x2Slider = document.getElementById("uniform-probability-x2-slider");

  if (aSlider && aSlider.dataset.bound !== "true") {
    aSlider.addEventListener("input", drawUniformProbabilityPlot);
    aSlider.dataset.bound = "true";
  }

  if (bSlider && bSlider.dataset.bound !== "true") {
    bSlider.addEventListener("input", drawUniformProbabilityPlot);
    bSlider.dataset.bound = "true";
  }

  if (x1Slider && x1Slider.dataset.bound !== "true") {
    x1Slider.addEventListener("input", drawUniformProbabilityPlot);
    x1Slider.dataset.bound = "true";
  }

  if (x2Slider && x2Slider.dataset.bound !== "true") {
    x2Slider.addEventListener("input", drawUniformProbabilityPlot);
    x2Slider.dataset.bound = "true";
  }

  drawUniformProbabilityPlot();
};
