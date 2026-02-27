const CLASS_BOUNDS_DEFAULT = [5.5, 5.567, 5.633, 5.7, 5.767, 5.833, 5.9];
const CLASS_MIN = CLASS_BOUNDS_DEFAULT[0];
const CLASS_MAX = CLASS_BOUNDS_DEFAULT[CLASS_BOUNDS_DEFAULT.length - 1];
const CLASS_STEP = 0.001;
const INTERNAL_COUNT = CLASS_BOUNDS_DEFAULT.length - 2;

const formatBound = (value) => value.toFixed(3);

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

const updateDatasetBoundaries = (bounds, mode) => {
  const container = getDatasetContainer();
  if (!container) {
    return;
  }
  const spans = Array.from(container.querySelectorAll("span"));
  spans.forEach((span) => span.classList.remove("dataset-boundary"));
  const showBoundaries = mode === "class-freq" || mode === "class-density";
  container.classList.toggle("show-boundaries", showBoundaries);
  if (!showBoundaries) {
    return;
  }
  const values = spans.map((span) => Number(span.textContent.trim()))
    .filter((value) => Number.isFinite(value));
  if (values.length === 0) {
    return;
  }
  const internalBounds = bounds.slice(1, -1);
  internalBounds.forEach((bound) => {
    let index = -1;
    for (let i = 0; i < values.length; i += 1) {
      if (values[i] < bound) {
        index = i;
      } else {
        break;
      }
    }
    if (index >= 0 && spans[index]) {
      spans[index].classList.add("dataset-boundary");
    }
  });
};

const normalizeBounds = (values, activeIndex) => {
  const step = CLASS_STEP;
  const clamped = values.map((value) => clampValue(value, CLASS_MIN, CLASS_MAX));
  if (clamped.length === 0) {
    return [];
  }
  if (Number.isInteger(activeIndex)) {
    const minNeighbor = activeIndex === 0 ? CLASS_MIN : clamped[activeIndex - 1] + step;
    const maxNeighbor = activeIndex === clamped.length - 1
      ? CLASS_MAX
      : clamped[activeIndex + 1] - step;
    clamped[activeIndex] = clampValue(clamped[activeIndex], minNeighbor, maxNeighbor);
  }
  for (let i = 0; i < clamped.length; i += 1) {
    const minValue = i === 0 ? CLASS_MIN : clamped[i - 1] + step;
    clamped[i] = Math.max(clamped[i], minValue);
  }
  for (let i = clamped.length - 1; i >= 0; i -= 1) {
    const maxValue = i === clamped.length - 1 ? CLASS_MAX : clamped[i + 1] - step;
    clamped[i] = Math.min(clamped[i], maxValue);
  }
  for (let i = 0; i < clamped.length; i += 1) {
    const minValue = i === 0 ? CLASS_MIN : clamped[i - 1] + step;
    clamped[i] = Math.max(clamped[i], minValue);
  }
  return clamped;
};

const syncSliderBounds = (sliderRow) => {
  if (!sliderRow) {
    return;
  }
  const inputs = Array.from(sliderRow.querySelectorAll("input[type=\"range\"]"));
  const internalBounds = CLASS_BOUNDS_DEFAULT.slice(1, -1);
  inputs.forEach((input, index) => {
    const value = internalBounds[index];
    if (value === undefined) {
      return;
    }
    input.min = CLASS_MIN;
    input.max = CLASS_MAX;
    input.step = CLASS_STEP.toString();
    input.value = formatBound(value);
  });
};

const updateSliderLabels = (sliderRow, bounds) => {
  if (!sliderRow) {
    return;
  }
  const labelMin = sliderRow.querySelector("[data-class-boundary-label=\"min\"]");
  const labelMax = sliderRow.querySelector("[data-class-boundary-label=\"max\"]");
  if (labelMin) {
    labelMin.textContent = formatBound(bounds[0]);
  }
  if (labelMax) {
    labelMax.textContent = formatBound(bounds[bounds.length - 1]);
  }
  const range = bounds[bounds.length - 1] - bounds[0];
  if (range <= 0) {
    return;
  }
  for (let i = 1; i < bounds.length - 1; i += 1) {
    const label = sliderRow.querySelector(`[data-class-boundary-label=\"${i}\"]`);
    if (!label) {
      continue;
    }
    const percent = ((bounds[i] - bounds[0]) / range) * 100;
    label.style.left = `${percent}%`;
    label.textContent = formatBound(bounds[i]);
  }
};

const buildRelativeFrequencies = (values) => {
  const counts = new Map();
  values.forEach((value) => {
    const label = value.toFixed(3);
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  const total = values.length || 1;
  const entries = Array.from(counts.entries()).map(([label, count]) => ({
    label,
    value: count / total,
    numeric: Number(label)
  }));
  entries.sort((a, b) => {
    if (Number.isFinite(a.numeric) && Number.isFinite(b.numeric)) {
      return a.numeric - b.numeric;
    }
    return String(a.label).localeCompare(String(b.label));
  });
  return {
    labels: entries.map((entry) => entry.label),
    values: entries.map((entry) => entry.value)
  };
};

const getDatasetContainer = () => document.querySelector(".dataset-grid");

const readDatasetValues = () => {
  const container = getDatasetContainer();
  if (!container) {
    return [];
  }
  return Array.from(container.querySelectorAll("span"))
    .map((span) => span.textContent.trim())
    .map((text) => Number(text))
    .filter((value) => Number.isFinite(value));
};

const getBoundsFromSlider = (sliderRow) => {
  if (!sliderRow) {
    return CLASS_BOUNDS_DEFAULT.slice();
  }
  const inputs = Array.from(sliderRow.querySelectorAll("input[type=\"range\"]"));
  if (inputs.length < INTERNAL_COUNT) {
    return CLASS_BOUNDS_DEFAULT.slice();
  }
  const internal = inputs.map((input) => Number.parseFloat(input.value))
    .filter((value) => Number.isFinite(value));
  if (internal.length < INTERNAL_COUNT) {
    return CLASS_BOUNDS_DEFAULT.slice();
  }
  return [CLASS_MIN, ...internal, CLASS_MAX];
};

const buildClassLabels = (bounds) => bounds.slice(0, -1).map((bound, index) => {
  const upper = bounds[index + 1];
  const closing = index === bounds.length - 2 ? "]" : ")";
  return `[${formatBound(bound)}, ${formatBound(upper)}${closing}`;
});

const computeClassCounts = (values, bounds) => {
  const bins = bounds.length - 1;
  const counts = new Array(bins).fill(0);
  values.forEach((value) => {
    for (let i = 0; i < bins; i += 1) {
      const lower = bounds[i];
      const upper = bounds[i + 1];
      const isLast = i === bins - 1;
      if (value >= lower && (isLast ? value <= upper : value < upper)) {
        counts[i] += 1;
        return;
      }
    }
  });
  return counts;
};

const buildClassFrequencies = (values, bounds) => {
  const counts = computeClassCounts(values, bounds);
  const total = values.length || 1;
  const frequencies = counts.map((count) => count / total);
  const labels = buildClassLabels(bounds);
  return { frequencies, labels };
};

const buildHistogram = (values, bounds) => {
  const counts = computeClassCounts(values, bounds);
  const bins = bounds.length - 1;
  const total = values.length || 1;
  const widths = bounds.slice(0, -1).map((bound, index) => (
    bounds[index + 1] - bound
  ));
  const densities = counts.map((count, index) => (count / total) / widths[index]);
  const midpoints = bounds.slice(0, -1).map((bound, index) => (
    (bound + bounds[index + 1]) / 2
  ));
  const maxDensity = Math.max(...densities, 0);
  return {
    midpoints,
    widths,
    densities,
    maxDensity
  };
};

const renderValuesChart = (chart, values) => {
  const { labels: xLabels, values: yValues } = buildRelativeFrequencies(values);
  const plotHeight = 260;
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(260, Math.round(chart.clientWidth));
  const data = [
    {
      x: xLabels,
      y: yValues,
      type: "bar",
      marker: { color: "#b3713b", opacity: 0.8 }
    }
  ];
  const layout = {
    margin: { t: 10, r: 10, b: 50, l: 40 },
    height: plotHeight,
    width: plotWidth,
    autosize: false,
    bargap: 0.25,
    xaxis: {
      type: "category",
      categoryorder: "array",
      categoryarray: xLabels,
      tickmode: "array",
      tickvals: xLabels,
      ticktext: xLabels,
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
      ticks: ""
    },
    paper_bgcolor: "rgb(247, 247, 247)",
    plot_bgcolor: "rgb(247, 247, 247)"
  };
  Plotly.react(chart, data, layout, {
    displayModeBar: false,
    responsive: false,
    staticPlot: true
  });
};

const renderHistogramChart = (chart, values, bounds, fixedMax) => {
  const { midpoints, widths, densities, maxDensity } = buildHistogram(values, bounds);
  const yMax = fixedMax ?? maxDensity;
  const plotHeight = 260;
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(260, Math.round(chart.clientWidth));
  const data = [
    {
      x: midpoints,
      y: densities,
      width: widths,
      type: "bar",
      marker: { color: "#2e6f8e", opacity: 0.8 },
      hoverinfo: "skip"
    }
  ];
  const layout = {
    margin: { t: 10, r: 10, b: 50, l: 50 },
    height: plotHeight,
    width: plotWidth,
    autosize: false,
    bargap: 0,
    xaxis: {
      type: "linear",
      range: [bounds[0], bounds[bounds.length - 1]],
      tickmode: "array",
      tickvals: bounds,
      ticktext: bounds.map(formatBound),
      showgrid: false,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    yaxis: {
      range: [0, yMax > 0 ? yMax * 1.2 : 1],
      showgrid: true,
      zeroline: false,
      showline: true,
      ticks: ""
    },
    paper_bgcolor: "rgb(247, 247, 247)",
    plot_bgcolor: "rgb(247, 247, 247)"
  };
  Plotly.react(chart, data, layout, {
    displayModeBar: false,
    responsive: false,
    staticPlot: true
  });
};

const renderClassFrequencyChart = (chart, values, bounds) => {
  const { frequencies, labels } = buildClassFrequencies(values, bounds);
  const plotHeight = 260;
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(260, Math.round(chart.clientWidth));
  const data = [
    {
      x: labels,
      y: frequencies,
      type: "bar",
      marker: { color: "#b3713b", opacity: 0.8 }
    }
  ];
  const layout = {
    margin: { t: 10, r: 10, b: 50, l: 50 },
    height: plotHeight,
    width: plotWidth,
    autosize: false,
    bargap: 0.25,
    xaxis: {
      type: "category",
      categoryorder: "array",
      categoryarray: labels,
      tickmode: "array",
      tickvals: labels,
      ticktext: labels,
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
      ticks: ""
    },
    paper_bgcolor: "rgb(247, 247, 247)",
    plot_bgcolor: "rgb(247, 247, 247)"
  };
  Plotly.react(chart, data, layout, {
    displayModeBar: false,
    responsive: false,
    staticPlot: true
  });
};

export const initClassIntervalsChart = () => {
  const valuesChart = document.querySelector("[data-class-interval-chart]");
  const classChart = document.querySelector("[data-class-interval-class-chart]");
  const histogramChart = document.querySelector("[data-class-interval-histogram]");
  const sliderRow = document.querySelector("[data-class-interval-slider]");
  if (!valuesChart || !classChart || !histogramChart) {
    return;
  }
  const titleEl = document.querySelector("[data-class-interval-title]");
  const modeInputs = Array.from(document.querySelectorAll(".class-toggle-input"));
  const getMode = () => modeInputs.find((input) => input.checked)?.value || "values";
  let fixedHistogramMax = null;

  const update = () => {
    const values = readDatasetValues();
    if (values.length === 0 || !window.Plotly) {
      return;
    }
    const mode = getMode();
    const isValues = mode === "values";
    const isClassFreq = mode === "class-freq";
    const isClassDensity = mode === "class-density";
    valuesChart.classList.toggle("is-hidden", !isValues);
    classChart.classList.toggle("is-hidden", !isClassFreq);
    histogramChart.classList.toggle("is-hidden", !isClassDensity);
    if (sliderRow) {
      sliderRow.classList.toggle("is-hidden", isValues);
    }
    const bounds = getBoundsFromSlider(sliderRow);
    if (fixedHistogramMax === null) {
      fixedHistogramMax = buildHistogram(values, CLASS_BOUNDS_DEFAULT).maxDensity;
    }
    updateSliderLabels(sliderRow, bounds);
    updateDatasetBoundaries(bounds, mode);
    const title = isValues
      ? "Diagramma a barre delle frequenze relative"
      : isClassFreq
        ? "Diagramma a barre delle frequenze relative per classi"
        : "Istogramma delle densità di frequenze relative";
    if (titleEl) {
      titleEl.textContent = title;
    }
    if (isValues) {
      valuesChart.setAttribute("aria-label", title);
      renderValuesChart(valuesChart, values);
    } else if (isClassFreq) {
      classChart.setAttribute("aria-label", title);
      renderClassFrequencyChart(classChart, values, bounds);
    } else {
      histogramChart.setAttribute("aria-label", title);
      renderHistogramChart(histogramChart, values, bounds, fixedHistogramMax);
    }
  };

  if (valuesChart.dataset.initialized === "true") {
    update();
    return;
  }
  valuesChart.dataset.initialized = "true";
  valuesChart._classIntervalUpdate = update;
  syncSliderBounds(sliderRow);
  updateSliderLabels(sliderRow, getBoundsFromSlider(sliderRow));
  if (sliderRow) {
    const boundaryInputs = Array.from(sliderRow.querySelectorAll("input[type=\"range\"]"));
    boundaryInputs.forEach((input, index) => {
      if (input.dataset.bound === "true") {
        return;
      }
      input.addEventListener("input", () => {
        const values = boundaryInputs.map((item) => Number.parseFloat(item.value));
        const normalized = normalizeBounds(values, index);
        normalized.forEach((value, idx) => {
          boundaryInputs[idx].value = formatBound(value);
        });
        update();
      });
      input.dataset.bound = "true";
    });
  }
  modeInputs.forEach((input) => input.addEventListener("change", update));
  update();
};
