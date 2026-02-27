const EXPONENTIAL_X_MAX = 8;
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

const drawExponentialDensity = () => {
  const plotEl = document.getElementById("exponential-density");
  const lambdaSlider = document.getElementById("exponential-title-lambda-slider");
  const lambdaValue = document.getElementById("exponential-title-lambda-value");

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

  const { xValues, yValues } = buildCurve(lambda);
  const yMax = 3;

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

  Plotly.react(plotEl, data, layout, { displayModeBar: false, responsive: false, mathjax: "cdn", staticPlot: true })
    .then(() => {
      if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, plotEl]);
      }
    });
};

export const initExponentialTitleDensity = () => {
  const lambdaSlider = document.getElementById("exponential-title-lambda-slider");
  if (lambdaSlider && lambdaSlider.dataset.bound !== "true") {
    lambdaSlider.addEventListener("input", drawExponentialDensity);
    lambdaSlider.dataset.bound = "true";
  }
  drawExponentialDensity();
};
