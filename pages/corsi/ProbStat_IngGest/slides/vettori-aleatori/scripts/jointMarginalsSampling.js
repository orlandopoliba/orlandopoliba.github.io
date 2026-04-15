const JOINT_MARGINALS_MIN = 0;
const JOINT_MARGINALS_MAX = 10;
const HOLD_DELAY_MS = 300;
const HOLD_INTERVAL_MS = 50;
const HOLD_BATCH_SIZE = 5;

const jointMarginalsState = {
  first: {
    x1: [],
    x2: [],
    x3: []
  },
  second: {
    x1: [],
    x2: [],
    x3: []
  }
};

const sampleDiscreteUniform = () => (
  Math.floor(Math.random() * (JOINT_MARGINALS_MAX - JOINT_MARGINALS_MIN + 1)) + JOINT_MARGINALS_MIN
);

const resetJointMarginalsState = () => {
  jointMarginalsState.first.x1 = [];
  jointMarginalsState.first.x2 = [];
  jointMarginalsState.first.x3 = [];
  jointMarginalsState.second.x1 = [];
  jointMarginalsState.second.x2 = [];
  jointMarginalsState.second.x3 = [];
};

const addSampleToState = (state) => {
  state.x1.push(sampleDiscreteUniform());
  state.x2.push(sampleDiscreteUniform());
  state.x3.push(sampleDiscreteUniform());
};

const addDiagonalSampleToState = (state) => {
  const u = sampleDiscreteUniform();
  state.x1.push(u);
  state.x2.push(u);
  state.x3.push(u);
};

const buildVectorData = (state) => {
  if (state.x1.length === 0) {
    return [];
  }

  return [
    {
      x: state.x1,
      y: state.x2,
      z: state.x3,
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
      x: state.x1,
      y: state.x1.map(() => 0),
      z: state.x1.map(() => 0),
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
      x: state.x2.map(() => 0),
      y: state.x2,
      z: state.x2.map(() => 0),
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
      x: state.x3.map(() => 0),
      y: state.x3.map(() => 0),
      z: state.x3,
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
  ];
};

const createVectorLayout = (plotWidth) => ({
  margin: { t: 10, r: 10, b: 10, l: 10 },
  height: 420,
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
      range: [JOINT_MARGINALS_MIN - 0.5, JOINT_MARGINALS_MAX + 0.5],
      dtick: 1,
      gridcolor: "#d8d8d8",
      zerolinecolor: "#c85d34"
    },
    yaxis: {
      title: "X_2",
      titlefont: { color: "#2a9d8f" },
      tickfont: { color: "#2a9d8f" },
      range: [JOINT_MARGINALS_MIN - 0.5, JOINT_MARGINALS_MAX + 0.5],
      dtick: 1,
      gridcolor: "#d8d8d8",
      zerolinecolor: "#2a9d8f"
    },
    zaxis: {
      title: "X_3",
      titlefont: { color: "#2e6f8e" },
      tickfont: { color: "#2e6f8e" },
      range: [JOINT_MARGINALS_MIN - 0.5, JOINT_MARGINALS_MAX + 0.5],
      dtick: 1,
      gridcolor: "#d8d8d8",
      zerolinecolor: "#2e6f8e"
    }
  }
});

const updateJointMarginalsPlots = () => {
  const plotA = document.getElementById("joint-marginals-plot-a");
  const plotB = document.getElementById("joint-marginals-plot-b");

  if (!plotA || !plotB || typeof Plotly === "undefined") {
    return;
  }

  const widthA = Math.max(320, Math.round(plotA.clientWidth));
  const widthB = Math.max(320, Math.round(plotB.clientWidth));

  Plotly.react(plotA, buildVectorData(jointMarginalsState.first), createVectorLayout(widthA), {
    displayModeBar: false,
    responsive: false,
    mathjax: "cdn",
    staticPlot: false,
    scrollZoom: false
  });

  Plotly.react(plotB, buildVectorData(jointMarginalsState.second), createVectorLayout(widthB), {
    displayModeBar: false,
    responsive: false,
    mathjax: "cdn",
    staticPlot: false,
    scrollZoom: false
  });
};

const bindJointMarginalsSampling = () => {
  const sampleBtn = document.getElementById("joint-marginals-sample-btn");
  const resetBtn = document.getElementById("joint-marginals-reset-btn");

  if (!sampleBtn || !resetBtn) {
    return;
  }

  if (sampleBtn.dataset.bound !== "true") {
    let holdTimerId = null;
    let holdIntervalId = null;
    let pressed = false;
    let suppressClick = false;

    const renderBatch = (batchSize) => {
      for (let i = 0; i < batchSize; i += 1) {
        addSampleToState(jointMarginalsState.first);
        addDiagonalSampleToState(jointMarginalsState.second);
      }
      updateJointMarginalsPlots();
    };

    const clearHold = () => {
      if (holdTimerId !== null) {
        window.clearTimeout(holdTimerId);
        holdTimerId = null;
      }

      if (holdIntervalId !== null) {
        window.clearInterval(holdIntervalId);
        holdIntervalId = null;
      }
    };

    const stopPress = () => {
      if (!pressed) {
        return;
      }

      clearHold();
      pressed = false;
    };

    sampleBtn.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.pointerType !== "touch") {
        return;
      }

      pressed = true;
      suppressClick = false;
      clearHold();

      holdTimerId = window.setTimeout(() => {
        if (!pressed) {
          return;
        }

        suppressClick = true;
        renderBatch(HOLD_BATCH_SIZE);
        holdIntervalId = window.setInterval(() => {
          renderBatch(HOLD_BATCH_SIZE);
        }, HOLD_INTERVAL_MS);
      }, HOLD_DELAY_MS);
    });

    sampleBtn.addEventListener("click", () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }

      renderBatch(1);
    });

    window.addEventListener("pointerup", stopPress);
    window.addEventListener("pointercancel", stopPress);
    sampleBtn.addEventListener("pointerleave", stopPress);
    sampleBtn.dataset.bound = "true";
  }

  if (resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      resetJointMarginalsState();
      updateJointMarginalsPlots();
    });
    resetBtn.dataset.bound = "true";
  }
};

export const initJointMarginalsSampling = () => {
  bindJointMarginalsSampling();
  updateJointMarginalsPlots();
};
