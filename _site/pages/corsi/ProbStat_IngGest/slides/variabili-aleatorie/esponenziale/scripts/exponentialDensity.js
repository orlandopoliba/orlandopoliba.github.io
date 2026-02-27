const EXPONENTIAL_X_MAX = 4;
const EXPONENTIAL_POINTS = 200;
const exponentialPdf = (lambda, x) => (
  x < 0 ? 0 : lambda * Math.exp(-lambda * x)
);

const buildCurve = (lambda) => {
  const step = EXPONENTIAL_X_MAX / (EXPONENTIAL_POINTS - 1);
  const xValues = Array.from({ length: EXPONENTIAL_POINTS }, (_, index) => index * step);
  const yValues = xValues.map((x) => exponentialPdf(lambda, x));
  return { xValues, yValues };
};

const drawExponentialProbabilityPlot = () => {
  const plotEl = document.getElementById("exponential-probability-plot");
  const lambdaSlider = document.getElementById("exponential-probability-lambda-slider");
  const lambdaValue = document.getElementById("exponential-probability-lambda-value");
  const aSlider = document.getElementById("exponential-probability-a-slider");
  const bSlider = document.getElementById("exponential-probability-b-slider");
  const aValue = document.getElementById("exponential-probability-a-value");
  const bValue = document.getElementById("exponential-probability-b-value");
  const probabilityResult = document.getElementById("exponential-probability-result");

  if (!plotEl) {
    return;
  }

  const lambda = lambdaSlider ? Number.parseFloat(lambdaSlider.value) : 1;
  const lambdaText = lambda.toFixed(1);
  if (lambdaValue) {
    if (window.katex) {
      window.katex.render(lambdaText, lambdaValue, { throwOnError: false });
    } else {
      lambdaValue.textContent = lambdaText;
    }
  }

  const clampX = (value) => Math.min(Math.max(value, 0), EXPONENTIAL_X_MAX);
  const sliderMax = EXPONENTIAL_X_MAX.toFixed(2);
  if (aSlider && aSlider.max !== sliderMax) {
    aSlider.max = sliderMax;
  }
  if (bSlider && bSlider.max !== sliderMax) {
    bSlider.max = sliderMax;
  }
  const step = aSlider ? Number.parseFloat(aSlider.step || "0.01") : 0.01;
  let a = aSlider ? Number.parseFloat(aSlider.value) : 1;
  let b = bSlider ? Number.parseFloat(bSlider.value) : 3;

  if (a >= b) {
    if (aSlider === document.activeElement) {
      a = b - step;
      if (aSlider) {
        aSlider.value = a.toFixed(2);
      }
    } else {
      b = a + step;
      if (bSlider) {
        bSlider.value = b.toFixed(2);
      }
    }
  }

  a = clampX(a);
  b = clampX(b);

  if (aValue) {
    const aText = a.toFixed(2);
    if (window.katex) {
      window.katex.render(aText, aValue, { throwOnError: false });
    } else {
      aValue.textContent = aText;
    }
  }

  if (bValue) {
    const bText = b.toFixed(2);
    if (window.katex) {
      window.katex.render(bText, bValue, { throwOnError: false });
    } else {
      bValue.textContent = bText;
    }
  }

  if (probabilityResult) {
    const probability = Math.exp(-lambda * a) - Math.exp(-lambda * b);
    const percentText = `${(probability * 100).toFixed(2)}\\%`;
    const formula = String.raw`\displaystyle \mathbb{P}(\{a \leq X \leq b\}) = \int_a^b \lambda e^{-\lambda x} \, \mathrm{d} x = ${percentText}`;
    if (window.katex) {
      window.katex.render(formula, probabilityResult, { throwOnError: false });
    } else {
      probabilityResult.textContent = `P(a <= X <= b) = ${percentText}`;
    }
  }


  const { xValues, yValues } = buildCurve(lambda);
  const yMax = 2;

  const areaX = [];
  const areaY = [];
  xValues.forEach((x, index) => {
    if (x >= a && x <= b) {
      areaX.push(x);
      areaY.push(yValues[index]);
    }
  });
  if (areaX.length === 0) {
    areaX.push(a, b);
    areaY.push(exponentialPdf(lambda, a), exponentialPdf(lambda, b));
  }

  const data = [
    {
      x: xValues,
      y: yValues,
      type: "scatter",
      mode: "lines",
      line: { color: "#2e6f8e", width: 3 },
      hoverinfo: "skip"
    },
    {
      x: areaX,
      y: areaY,
      type: "scatter",
      mode: "lines",
      line: { color: "rgba(46, 111, 142, 0)" },
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
      range: [0, EXPONENTIAL_X_MAX],
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

  Plotly.react(plotEl, data, layout, {displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true})
    .then(() => {
      if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
      }
    });
};

export const initExponentialDensity = () => {
  const probabilitySlider = document.getElementById("exponential-probability-lambda-slider");
  if (probabilitySlider && probabilitySlider.dataset.bound !== "true") {
    probabilitySlider.addEventListener("input", drawExponentialProbabilityPlot);
    probabilitySlider.dataset.bound = "true";
  }
  const aSlider = document.getElementById("exponential-probability-a-slider");
  if (aSlider && aSlider.dataset.bound !== "true") {
    aSlider.addEventListener("input", drawExponentialProbabilityPlot);
    aSlider.dataset.bound = "true";
  }
  const bSlider = document.getElementById("exponential-probability-b-slider");
  if (bSlider && bSlider.dataset.bound !== "true") {
    bSlider.addEventListener("input", drawExponentialProbabilityPlot);
    bSlider.dataset.bound = "true";
  }
  drawExponentialProbabilityPlot();
};
