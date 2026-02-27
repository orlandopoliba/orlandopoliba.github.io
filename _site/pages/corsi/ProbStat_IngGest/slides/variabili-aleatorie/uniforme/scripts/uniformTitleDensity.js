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

const drawUniformTitleDensity = () => {
  const plotEl = document.getElementById("uniform-density");
  const aSlider = document.getElementById("uniform-title-a-slider");
  const bSlider = document.getElementById("uniform-title-b-slider");
  const aValue = document.getElementById("uniform-title-a-value");
  const bValue = document.getElementById("uniform-title-b-value");

  if (!plotEl || !aSlider || !bSlider) {
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

  const density = b > a ? 1 / (b - a) : 0;
  const stepX = [UNIFORM_X_MIN, a, a, b, b, UNIFORM_X_MAX];
  const stepY = [0, 0, density, density, 0, 0];
  const yMax = Math.max(1, density * 1.2);

  const data = [
    {
      x: stepX,
      y: stepY,
      type: "scatter",
      mode: "lines",
      line: { color: "#2e6f8e", width: 3, shape: "hv" },
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
};

export const initUniformTitleDensity = () => {
  const aSlider = document.getElementById("uniform-title-a-slider");
  const bSlider = document.getElementById("uniform-title-b-slider");

  if (aSlider && aSlider.dataset.bound !== "true") {
    aSlider.addEventListener("input", drawUniformTitleDensity);
    aSlider.dataset.bound = "true";
  }

  if (bSlider && bSlider.dataset.bound !== "true") {
    bSlider.addEventListener("input", drawUniformTitleDensity);
    bSlider.dataset.bound = "true";
  }

  drawUniformTitleDensity();
};
