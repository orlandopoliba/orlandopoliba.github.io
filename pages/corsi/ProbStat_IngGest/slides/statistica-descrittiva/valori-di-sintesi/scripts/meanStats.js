const MEAN_CATEGORIES = Array.from({ length: 19 }, (_, index) => index);
const MAX_TILT_DEG = 10;
const TILT_PER_LECTURE = 2;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getActiveValues = (buttons) => (
  buttons
    .filter((button) => !button.classList.contains("is-excluded"))
    .map((button) => Number(button.dataset.meanValue))
    .filter((value) => Number.isFinite(value))
);

const buildCounts = (values) => {
  const counts = new Map(MEAN_CATEGORIES.map((value) => [value, 0]));
  values.forEach((value) => {
    if (counts.has(value)) {
      counts.set(value, counts.get(value) + 1);
    }
  });
  return counts;
};

const updateMeanSummary = (values, meanEl) => {
  if (!meanEl) {
    return;
  }
  if (values.length === 0) {
    meanEl.textContent = "-";
    return;
  }
  const sum = values.reduce((total, value) => total + value, 0);
  meanEl.textContent = (sum / values.length).toFixed(2);
};

const renderMeanChart = (chart, counts, total, markerValue) => {
  if (!window.Plotly) {
    return;
  }
  const values = MEAN_CATEGORIES;
  const frequencies = MEAN_CATEGORIES.map((value) => (
    total > 0 ? counts.get(value) / total : 0
  ));
  const weightedSum = values.reduce((sum, value) => sum + value * counts.get(value), 0);
  const meanValue = total > 0 ? weightedSum / total : null;

  const plotHeight = 260;
  const xMin = MEAN_CATEGORIES[0];
  const xMax = MEAN_CATEGORIES[MEAN_CATEGORIES.length - 1];
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(260, Math.round(chart.clientWidth));
  const data = [
    {
      x: values,
      y: frequencies,
      type: "bar",
      marker: { color: "#b3713b", opacity: 0.85 },
      hoverinfo: "skip"
    }
  ];
  if (Number.isFinite(markerValue)) {
    data.push({
      x: [markerValue],
      y: [0],
      type: "scatter",
      mode: "markers",
      marker: { size: 10, color: "#2e6f8e" },
      hoverinfo: "skip",
      cliponaxis: false
    });
  }
  const layout = {
    margin: { t: 10, r: 10, b: 40, l: 10 },
    height: plotHeight,
    width: plotWidth,
    autosize: false,
    bargap: 0.25,
    xaxis: {
      type: "linear",
      range: [xMin - 0.5, xMax + 0.5],
      fixedrange: true,
      tickmode: "array",
      tickvals: values,
      ticktext: values.map((value) => value.toString()),
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [-0.05, 1],
      showgrid: false,
      zeroline: false,
      showline: false,
      showticklabels: false,
      ticks: ""
    },
    showlegend: false,
    paper_bgcolor: "rgba(0, 0, 0, 0)",
    plot_bgcolor: "rgba(0, 0, 0, 0)"
  };
  Plotly.react(chart, data, layout, {
    displayModeBar: false,
    responsive: false,
    staticPlot: true
  }).then(() => {
    const marker = Number.isFinite(markerValue) ? markerValue : null;
    const mean = Number.isFinite(meanValue) ? meanValue : null;
    const angle = (marker !== null && mean !== null)
      ? clamp((mean - marker) * TILT_PER_LECTURE, -MAX_TILT_DEG, MAX_TILT_DEG)
      : 0;
    const xRangeMin = xMin - 0.5;
    const xRangeMax = xMax + 0.5;
    const plotAreaWidth = plotWidth - layout.margin.l - layout.margin.r;
    const plotAreaHeight = plotHeight - layout.margin.t - layout.margin.b;
    const yMin = -0.05;
    const yMax = 1;
    const clampedMarker = marker !== null
      ? clamp(marker, xRangeMin, xRangeMax)
      : xRangeMin;
    const pivotX = layout.margin.l
      + ((clampedMarker - xRangeMin) / (xRangeMax - xRangeMin)) * plotAreaWidth;
    const pivotY = layout.margin.t
      + ((yMax - 0) / (yMax - yMin)) * plotAreaHeight;
    chart.style.transformOrigin = `${pivotX}px ${pivotY}px`;
    chart.style.transform = `rotate(${angle}deg)`;
  });
};

export const initMeanSlide = () => {
  const grid = document.querySelector("[data-mean-grid]");
  const chart = document.querySelector("[data-mean-chart]");
  const slider = document.getElementById("mean-balance-slider");
  const sliderValue = document.querySelector("[data-mean-slider-value]");
  const sliderMin = document.querySelector("[data-mean-slider-label=\"min\"]");
  const sliderMax = document.querySelector("[data-mean-slider-label=\"max\"]");
  if (!grid || !chart) {
    return;
  }
  const buttons = Array.from(grid.querySelectorAll(".mode-item"));
  const meanValueEl = document.querySelector("[data-mean-summary-value]");

  const update = () => {
    const activeValues = getActiveValues(buttons);
    const total = activeValues.length;
    const counts = buildCounts(activeValues);
    updateMeanSummary(activeValues, meanValueEl);
    const markerValue = slider ? Number(slider.value) : null;
    renderMeanChart(chart, counts, total, markerValue);
  };

  const updateSliderLabels = () => {
    if (!slider || !sliderValue) {
      return;
    }
    const min = Number(slider.min);
    const max = Number(slider.max);
    const value = Number(slider.value);
    sliderValue.textContent = Number.isFinite(value) ? value.toString() : "-";
    if (sliderMin) {
      sliderMin.textContent = Number.isFinite(min) ? min.toString() : "-";
    }
    if (sliderMax) {
      sliderMax.textContent = Number.isFinite(max) ? max.toString() : "-";
    }
    if (Number.isFinite(min) && Number.isFinite(max) && max > min) {
      const percent = ((value - min) / (max - min)) * 100;
      sliderValue.style.left = `${percent}%`;
    }
  };

  if (grid.dataset.initialized === "true") {
    update();
    updateSliderLabels();
    return;
  }
  grid.dataset.initialized = "true";

  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", "true");
    button.addEventListener("click", () => {
      button.classList.toggle("is-excluded");
      button.setAttribute(
        "aria-pressed",
        button.classList.contains("is-excluded") ? "false" : "true"
      );
      update();
    });
  });

  if (slider && slider.dataset.bound !== "true") {
    slider.addEventListener("input", () => {
      updateSliderLabels();
      update();
    });
    slider.dataset.bound = "true";
  }

  update();
  updateSliderLabels();
};
