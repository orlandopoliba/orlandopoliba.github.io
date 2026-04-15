const randomVectorState = {
  x1: [],
  x2: [],
  x3: []
};

const sampleDiscreteUniform = () => Math.floor(Math.random() * 11);

const resetRandomVectorState = () => {
  randomVectorState.x1 = [];
  randomVectorState.x2 = [];
  randomVectorState.x3 = [];
};

const addRandomVectorSample = () => {
  randomVectorState.x1.push(sampleDiscreteUniform());
  randomVectorState.x2.push(sampleDiscreteUniform());
  randomVectorState.x3.push(sampleDiscreteUniform());
};

const updateRandomVectorPlot = () => {
  const plotEl = document.getElementById("random-vector-plot");

  if (!plotEl || typeof Plotly === "undefined") {
    return;
  }

  const plotWidth = Math.max(360, Math.round(plotEl.clientWidth));
  const hasSamples = randomVectorState.x1.length > 0;
  const data = hasSamples
    ? [
        {
          x: randomVectorState.x1,
          y: randomVectorState.x2,
          z: randomVectorState.x3,
          type: "scatter3d",
          mode: "markers",
          marker: {
            size: 5,
            color: "#111111",
            opacity: 0.9,
            line: {
              color: "#111111",
              width: 1
            }
          },
          hovertemplate: "X_1 = %{x}<br>X_2 = %{y}<br>X_3 = %{z}<extra></extra>",
          showlegend: false
        },
        {
          x: randomVectorState.x1,
          y: randomVectorState.x1.map(() => 0),
          z: randomVectorState.x1.map(() => 0),
          type: "scatter3d",
          mode: "markers",
          marker: {
            size: 4,
            color: "#d62828",
            opacity: 0.22
          },
          hovertemplate: "Proiezione su X_1: %{x}<extra></extra>",
          showlegend: false
        },
        {
          x: randomVectorState.x2.map(() => 0),
          y: randomVectorState.x2,
          z: randomVectorState.x2.map(() => 0),
          type: "scatter3d",
          mode: "markers",
          marker: {
            size: 4,
            color: "#2a9d2f",
            opacity: 0.22
          },
          hovertemplate: "Proiezione su X_2: %{y}<extra></extra>",
          showlegend: false
        },
        {
          x: randomVectorState.x3.map(() => 0),
          y: randomVectorState.x3.map(() => 0),
          z: randomVectorState.x3,
          type: "scatter3d",
          mode: "markers",
          marker: {
            size: 4,
            color: "#2e6fdb",
            opacity: 0.22
          },
          hovertemplate: "Proiezione su X_3: %{z}<extra></extra>",
          showlegend: false
        }
      ]
    : [];

  const layout = {
    margin: { t: 10, r: 10, b: 10, l: 10 },
    height: 460,
    width: plotWidth,
    autosize: false,
    paper_bgcolor: "rgb(247, 247, 247)",
    scene: {
      bgcolor: "rgb(247, 247, 247)",
      dragmode: "orbit",
      aspectmode: "cube",
      camera: {
        eye: { x: 1.45, y: 1.35, z: 1.1 }
      },
      xaxis: {
        title: "X_1",
        titlefont: { color: "#c85d34" },
        tickfont: { color: "#c85d34" },
        range: [-0.5, 10.5],
        dtick: 1,
        gridcolor: "#d8d8d8",
        zerolinecolor: "#c85d34"
      },
      yaxis: {
        title: "X_2",
        titlefont: { color: "#2a9d8f" },
        tickfont: { color: "#2a9d8f" },
        range: [-0.5, 10.5],
        dtick: 1,
        gridcolor: "#d8d8d8",
        zerolinecolor: "#2a9d8f"
      },
      zaxis: {
        title: "X_3",
        titlefont: { color: "#2e6f8e" },
        tickfont: { color: "#2e6f8e" },
        range: [-0.5, 10.5],
        dtick: 1,
        gridcolor: "#d8d8d8",
        zerolinecolor: "#2e6f8e"
      }
    }
  };

  Plotly.react(plotEl, data, layout, {
    displayModeBar: false,
    responsive: false,
    mathjax: "cdn",
    staticPlot: false,
    scrollZoom: false
  });
};

const bindRandomVectorSampling = () => {
  const sampleBtn = document.getElementById("random-vector-sample-btn");
  const resetBtn = document.getElementById("random-vector-reset-btn");

  if (!sampleBtn || !resetBtn) {
    return;
  }

  if (sampleBtn.dataset.bound !== "true") {
    let holdIntervalId = null;
    let longPressTimerId = null;
    let longPressActive = false;
    let isPressing = false;

    const applySample = () => {
      addRandomVectorSample();
      updateRandomVectorPlot();
    };

    const startHold = () => {
      if (holdIntervalId !== null) {
        return;
      }

      longPressActive = true;
      holdIntervalId = window.setInterval(() => {
        for (let i = 0; i < 5; i += 1) {
          addRandomVectorSample();
        }
        updateRandomVectorPlot();
      }, 50);
    };

    const stopHold = () => {
      if (!isPressing) {
        return;
      }

      if (holdIntervalId !== null) {
        window.clearInterval(holdIntervalId);
        holdIntervalId = null;
      }

      if (longPressTimerId !== null) {
        window.clearTimeout(longPressTimerId);
        longPressTimerId = null;
      }

      if (!longPressActive) {
        applySample();
      }

      longPressActive = false;
      isPressing = false;
    };

    const onPressStart = () => {
      if (longPressTimerId !== null) {
        return;
      }

      isPressing = true;
      longPressActive = false;
      longPressTimerId = window.setTimeout(startHold, 300);
    };

    const onPressEnd = () => {
      stopHold();
    };

    sampleBtn.addEventListener("mousedown", onPressStart);
    sampleBtn.addEventListener("touchstart", onPressStart, { passive: true });
    sampleBtn.addEventListener("mouseup", onPressEnd);
    sampleBtn.addEventListener("mouseleave", onPressEnd);
    sampleBtn.addEventListener("touchend", onPressEnd);
    sampleBtn.addEventListener("touchcancel", onPressEnd);
    sampleBtn.dataset.bound = "true";
  }

  if (resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      resetRandomVectorState();
      updateRandomVectorPlot();
    });
    resetBtn.dataset.bound = "true";
  }
};

export const initRandomVectorSampling = () => {
  bindRandomVectorSampling();
  updateRandomVectorPlot();
};
