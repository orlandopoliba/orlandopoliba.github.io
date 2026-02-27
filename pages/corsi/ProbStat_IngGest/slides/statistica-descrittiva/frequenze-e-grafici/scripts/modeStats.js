const MODE_CATEGORIES = Array.from({ length: 19 }, (_, index) => index);

const formatPercent = (value) => `${(value * 100).toFixed(2)}%`;

const getActiveValues = (buttons) => (
  buttons
    .filter((button) => !button.classList.contains("is-excluded"))
    .map((button) => Number(button.dataset.modeValue))
    .filter((value) => Number.isFinite(value))
);

const buildCounts = (values) => {
  const counts = new Map(MODE_CATEGORIES.map((value) => [value, 0]));
  values.forEach((value) => {
    if (counts.has(value)) {
      counts.set(value, counts.get(value) + 1);
    }
  });
  return counts;
};

const updateModeSummary = (counts, total, modeValueEl, modeFreqEl) => {
  if (!modeValueEl || !modeFreqEl) {
    return;
  }
  if (total === 0) {
    modeValueEl.textContent = "-";
    modeFreqEl.textContent = "-";
    return;
  }
  const maxCount = Math.max(...counts.values());
  const modes = MODE_CATEGORIES.filter((value) => counts.get(value) === maxCount);
  modeValueEl.textContent = modes.join(", ");
  modeFreqEl.textContent = formatPercent(maxCount / total);
};

const renderModeChart = (chart, counts, total) => {
  if (!window.Plotly) {
    return;
  }
  const values = MODE_CATEGORIES.map((value) => value.toString());
  const frequencies = MODE_CATEGORIES.map((value) => (
    total > 0 ? counts.get(value) / total : 0
  ));
  const maxCount = total > 0 ? Math.max(...counts.values()) : 0;
  const colors = MODE_CATEGORIES.map((value) => (
    maxCount > 0 && counts.get(value) === maxCount ? "#2e6f8e" : "#b3713b"
  ));

  const plotHeight = 260;
  chart.style.height = `${plotHeight}px`;
  chart.style.width = "100%";
  const plotWidth = Math.max(260, Math.round(chart.clientWidth));
  const data = [
    {
      x: values,
      y: frequencies,
      type: "bar",
      marker: { color: colors, opacity: 0.85 },
      hoverinfo: "skip"
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
      categoryarray: values,
      tickmode: "array",
      tickvals: values,
      ticktext: values,
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

export const initModeSlide = () => {
  const grid = document.querySelector("[data-mode-grid]");
  const chart = document.querySelector("[data-mode-chart]");
  if (!grid || !chart) {
    return;
  }
  const buttons = Array.from(grid.querySelectorAll(".mode-item"));
  const modeValueEl = document.querySelector("[data-mode-summary-value]");
  const modeFreqEl = document.querySelector("[data-mode-summary-frequency]");

  const update = () => {
    const activeValues = getActiveValues(buttons);
    const total = activeValues.length;
    const counts = buildCounts(activeValues);
    updateModeSummary(counts, total, modeValueEl, modeFreqEl);
    renderModeChart(chart, counts, total);
  };

  if (grid.dataset.initialized === "true") {
    update();
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

  update();
};
