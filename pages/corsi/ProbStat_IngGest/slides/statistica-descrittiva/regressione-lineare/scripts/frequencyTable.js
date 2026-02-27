const formatRelative = (value) => `${(value * 100).toFixed(2)}%`;
const PIE_COLORS = ["#b3713b", "#2e6f8e", "#4f8a6d", "#b84b4b", "#d49a6a"];

const pickColors = (count) => Array.from({ length: count }, (_, index) => (
  PIE_COLORS[index % PIE_COLORS.length]
));

const sanitizeValue = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.round(parsed);
};

export const initFrequencyTable = () => {
  const tables = document.querySelectorAll("[data-frequency-table]");
  tables.forEach((table) => {
    if (table.dataset.initialized === "true") {
      if (table._frequencyUpdate) {
        table._frequencyUpdate();
      }
      return;
    }
    table.dataset.initialized = "true";

    const inputs = Array.from(table.querySelectorAll(".frequency-input"));
    const relativeCells = Array.from(table.querySelectorAll(".frequency-relative"));
    const lab = table.closest("[data-frequency-lab]");
    const listContainer = lab?.querySelector("[data-frequency-list]");
    const chartContainer = lab?.querySelector("[data-frequency-chart]");
    const rowLabels = Array.from(table.querySelectorAll("tbody tr")).map((row) => {
      const cell = row.querySelector("td");
      return cell ? cell.textContent.trim() : "";
    });
    const titleEl = lab?.querySelector("[data-frequency-title]");
    const modeInputs = Array.from(lab?.querySelectorAll(".frequency-switch-input") || []);
    const getMode = () => modeInputs.find((input) => input.checked)?.value || "absolute";
    let scaleMode = getMode();

    const updateTitle = () => {
      const title = scaleMode === "relative"
        ? "Diagramma a barre delle frequenze relative"
        : scaleMode === "pareto"
          ? "Diagramma di Pareto delle frequenze relative"
          : scaleMode === "pie"
            ? "Diagramma a torta delle frequenze relative"
            : "Diagramma a barre delle frequenze assolute";
      if (titleEl) {
        titleEl.textContent = title;
      }
      if (chartContainer) {
        chartContainer.setAttribute("aria-label", title);
      }
    };

    const update = () => {
      scaleMode = getMode();
      updateTitle();

      const values = inputs.map((input) => sanitizeValue(input.value));
      const total = values.reduce((sum, value) => sum + value, 0);
      const relatives = values.map((value) => (total > 0 ? value / total : 0));
      const entries = rowLabels.map((label, index) => ({
        label,
        value: values[index],
        relative: relatives[index],
        index
      }));
      const ordered = scaleMode === "pareto"
        ? [...entries].sort((a, b) => {
          if (b.relative !== a.relative) {
            return b.relative - a.relative;
          }
          return a.index - b.index;
        })
        : entries;
      const xLabels = ordered.map((entry) => entry.label);
      const yValues = scaleMode === "absolute"
        ? ordered.map((entry) => entry.value)
        : ordered.map((entry) => entry.relative);

      relativeCells.forEach((cell, index) => {
        cell.textContent = formatRelative(relatives[index]);
      });

      if (listContainer) {
        listContainer.innerHTML = "";
        rowLabels.forEach((label, index) => {
          const count = values[index] || 0;
          for (let i = 0; i < count; i += 1) {
            const item = document.createElement("span");
            item.className = "frequency-data-item";
            item.textContent = label;
            listContainer.appendChild(item);
          }
        });
      }

      if (chartContainer && window.Plotly) {
        const plotHeight = 260;
        chartContainer.style.height = `${plotHeight}px`;
        chartContainer.style.width = "100%";
        const plotWidth = Math.max(260, Math.round(chartContainer.clientWidth));
        const isPie = scaleMode === "pie";
        const data = isPie
          ? [
            {
              labels: rowLabels,
              values: relatives,
              type: "pie",
              textinfo: "label+percent",
              textposition: "inside",
              sort: false,
              marker: { colors: pickColors(rowLabels.length) }
            }
          ]
          : [
            {
              x: xLabels,
              y: yValues,
              type: "bar",
              marker: { color: "#b3713b", opacity: 0.8 }
            }
          ];
        const layout = isPie
          ? {
            margin: { t: 10, r: 10, b: 10, l: 10 },
            height: plotHeight,
            width: plotWidth,
            autosize: false,
            showlegend: false,
            paper_bgcolor: "rgb(247, 247, 247)",
            plot_bgcolor: "rgb(247, 247, 247)"
          }
          : {
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
              range: scaleMode === "absolute" ? undefined : [0, 1],
              showgrid: true,
              zeroline: false,
              showline: true,
              ticks: ""
            },
            paper_bgcolor: "rgb(247, 247, 247)",
            plot_bgcolor: "rgb(247, 247, 247)"
          };
        Plotly.react(chartContainer, data, layout, {
          displayModeBar: false,
          responsive: false,
          staticPlot: true
        });
      }
    };
    table._frequencyUpdate = update;

    modeInputs.forEach((input) => {
      input.addEventListener("change", update);
    });

    inputs.forEach((input) => {
      input.addEventListener("input", update);
      input.addEventListener("change", () => {
        input.value = sanitizeValue(input.value).toString();
        update();
      });
    });

    update();
  });
};
