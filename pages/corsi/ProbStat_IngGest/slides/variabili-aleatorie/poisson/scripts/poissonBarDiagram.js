const poissonPmf = (lambda, maxK) => {
  const values = [];
  let current = Math.exp(-lambda);
  values.push(current);
  for (let k = 1; k <= maxK; k += 1) {
    current *= lambda / k;
    values.push(current);
  }
  return values;
};

const drawPoissonBar = () => {
  const plotEl = document.getElementById("poisson-bar");
  const lambdaSlider = document.getElementById("poisson-title-lambda-slider");
  const lambdaValue = document.getElementById("poisson-title-lambda-value");
  if (!plotEl) {
    return;
  }

  const lambda = lambdaSlider ? Number.parseFloat(lambdaSlider.value) : 3;
  const lambdaText = lambda.toFixed(1);
  if (lambdaValue) {
    if (window.katex) {
      window.katex.render(lambdaText, lambdaValue, { throwOnError: false });
    } else {
      lambdaValue.textContent = lambdaText;
    }
  }

  const maxK = 15;
  const probabilities = poissonPmf(lambda, maxK);
  const xValues = Array.from({ length: maxK + 1 }, (_, index) => index);

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
      ticktext: xValues.map((value) => String(value)),
      range: [-0.5, maxK + 0.5],
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

export const initPoissonBar = () => {
  const lambdaSlider = document.getElementById("poisson-title-lambda-slider");
  if (lambdaSlider && lambdaSlider.dataset.bound !== "true") {
    lambdaSlider.addEventListener("input", drawPoissonBar);
    lambdaSlider.dataset.bound = "true";
  }
  drawPoissonBar();
};
