const SAMPLE_SIZE = 10;
const MU = 10;
const SIGMA2 = 1;
const DEFAULT_BETA = 0.95;
const SAMPLE_HOLD_DELAY_MS = 300;
const SAMPLE_HOLD_INTERVAL_MS = 70;

const confidenceMeaningState = {
  sample: [],
  beta: DEFAULT_BETA,
  successCount: 0,
  totalCount: 0
};

const normalSample = (mu, sigma2) => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mu + Math.sqrt(sigma2) * z0;
};

const inverseStandardNormalCdf = (p) => {
  const a = [
    -3.969683028665376e+01,
    2.209460984245205e+02,
    -2.759285104469687e+02,
    1.38357751867269e+02,
    -3.066479806614716e+01,
    2.506628277459239
  ];
  const b = [
    -5.447609879822406e+01,
    1.615858368580409e+02,
    -1.556989798598866e+02,
    6.680131188771972e+01,
    -1.328068155288572e+01
  ];
  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783
  ];
  const d = [
    7.784695709041462e-03,
    3.224671290700398e-01,
    2.445134137142996,
    3.754408661907416
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p <= 0) {
    return Number.NEGATIVE_INFINITY;
  }

  if (p >= 1) {
    return Number.POSITIVE_INFINITY;
  }

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5])
      / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q
      / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5])
    / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
};

const renderMath = (element, expression, fallback, displayMode = true) => {
  if (!element) {
    return;
  }

  if (window.katex) {
    window.katex.render(expression, element, { throwOnError: false, displayMode });
    return;
  }

  element.textContent = fallback;
};

const renderInitialSamplePlaceholder = (outputEl) => {
  renderMath(
    outputEl,
    String.raw`X_1,\; X_2,\; X_3,\; X_4,\; X_5,\; X_6,\; X_7,\; X_8,\; X_9,\; X_{10}`,
    "X1, X2, X3, X4, X5, X6, X7, X8, X9, X10"
  );
};

const computeInterval = (sample, beta) => {
  const alpha = 1 - beta;
  const tailAlpha = alpha / 2;
  const zCritical = inverseStandardNormalCdf(1 - tailAlpha);
  const mean = sample.reduce((sum, value) => sum + value, 0) / SAMPLE_SIZE;
  const margin = (Math.sqrt(SIGMA2) / Math.sqrt(SAMPLE_SIZE)) * zCritical;
  const lower = mean - margin;
  const upper = mean + margin;
  const containsMu = lower <= MU && MU <= upper;

  return {
    alpha,
    tailAlpha,
    zCritical,
    mean,
    margin,
    lower,
    upper,
    containsMu
  };
};

const bindConfidenceMeaningSample = () => {
  const sampleBtn = document.getElementById("confidence-sample-btn");
  const resetBtn = document.getElementById("confidence-reset-btn");
  const outputEl = document.getElementById("confidence-sample-output");
  const intervalEl = document.getElementById("confidence-interval-output");
  const intervalStatusEl = document.getElementById("confidence-interval-status");
  const detailsEl = document.getElementById("confidence-interval-details");
  const betaSlider = document.getElementById("confidence-beta-slider");
  const betaValue = document.getElementById("confidence-beta-value");
  const successRateEl = document.getElementById("confidence-success-rate");

  if (
    !sampleBtn
    || !resetBtn
    || !outputEl
    || !intervalEl
    || !intervalStatusEl
    || !detailsEl
    || !betaSlider
    || !betaValue
    || !successRateEl
  ) {
    return;
  }

  const renderSample = (values) => {
    const sampleText = values.map((value) => value.toFixed(2)).join(",\\; ");
    const expression = `${sampleText}`;
    const fallback = values.map((value) => value.toFixed(2)).join(", ");

    renderMath(outputEl, expression, fallback);
  };

  const renderBetaValue = () => {
    renderMath(betaValue, confidenceMeaningState.beta.toFixed(2), confidenceMeaningState.beta.toFixed(2), false);
  };

  const renderIntervalStatus = (containsMu) => {
    if (containsMu === null) {
      intervalStatusEl.textContent = "";
      intervalStatusEl.className = "interval-status";
      return;
    }

    intervalStatusEl.textContent = containsMu ? "✓" : "✗";
    intervalStatusEl.className = `interval-status ${containsMu ? "is-success" : "is-failure"}`;
  };

  const renderSuccessRate = () => {
    const percentage = confidenceMeaningState.totalCount === 0
      ? 0
      : (100 * confidenceMeaningState.successCount) / confidenceMeaningState.totalCount;

    renderMath(
      successRateEl,
      String.raw`\text{Frequenza relativa successi} = ${percentage.toFixed(1)}\%`,
      `Frequenza relativa successi = ${percentage.toFixed(1)}%`
    );
  };

  const renderConfidenceInterval = () => {
    if (confidenceMeaningState.sample.length === 0) {
      renderMath(intervalEl, "IC = [U,V]", "IC = [U,V]");
      renderIntervalStatus(null);
      // renderMath(
      //   detailsEl,
      //   String.raw`\alpha = 1 - \beta = ${alpha.toFixed(2)},\qquad u = \bar{x} - \frac{1}{\sqrt{10}} z_{${tailAlpha.toFixed(3)}},\qquad v = \bar{x} + \frac{1}{\sqrt{10}} z_{${tailAlpha.toFixed(3)}}`,
      //   `alpha = 1 - beta = ${alpha.toFixed(2)}; u = xbar - 1/sqrt(10) z_${tailAlpha.toFixed(3)}; v = xbar + 1/sqrt(10) z_${tailAlpha.toFixed(3)}`
      // );
      return;
    }

    const { alpha, tailAlpha, lower, upper, containsMu } = computeInterval(
      confidenceMeaningState.sample,
      confidenceMeaningState.beta
    );

    renderMath(
      intervalEl,
      String.raw`IC = [${lower.toFixed(2)},\, ${upper.toFixed(2)}]`,
      `IC = [${lower.toFixed(2)}, ${upper.toFixed(2)}]`
    );
    renderIntervalStatus(containsMu);
    // renderMath(
    //   detailsEl,
    //   String.raw`\alpha = 1 - \beta = ${alpha.toFixed(2)},\quad u = \bar{x} - \frac{1}{\sqrt{10}} z_{${tailAlpha.toFixed(3)}} = ${lower.toFixed(2)},\quad v = \bar{x} + \frac{1}{\sqrt{10}} z_{${tailAlpha.toFixed(3)}} = ${upper.toFixed(2)}`,
    //   `alpha = 1 - beta = ${alpha.toFixed(2)}; u = ${lower.toFixed(2)}; v = ${upper.toFixed(2)}`
    // );
  };

  const resetState = () => {
    confidenceMeaningState.sample = [];
    confidenceMeaningState.successCount = 0;
    confidenceMeaningState.totalCount = 0;
  };

  const applySample = () => {
    confidenceMeaningState.sample = Array.from(
      { length: SAMPLE_SIZE },
      () => normalSample(MU, SIGMA2)
    );
    const { containsMu } = computeInterval(confidenceMeaningState.sample, confidenceMeaningState.beta);
    confidenceMeaningState.totalCount += 1;
    if (containsMu) {
      confidenceMeaningState.successCount += 1;
    }
    renderSample(confidenceMeaningState.sample);
    renderConfidenceInterval();
    renderSuccessRate();
  };

  const syncView = () => {
    betaSlider.value = confidenceMeaningState.beta.toFixed(2);
    renderBetaValue();
    if (confidenceMeaningState.sample.length === 0) {
      renderInitialSamplePlaceholder(outputEl);
    }
    renderConfidenceInterval();
    renderSuccessRate();
  };

  if (sampleBtn.dataset.bound !== "true") {
    let holdIntervalId = null;
    let longPressTimerId = null;
    let longPressActive = false;
    let isPressing = false;

    const startHold = () => {
      if (holdIntervalId !== null) {
        return;
      }

      longPressActive = true;
      holdIntervalId = window.setInterval(() => {
        applySample();
      }, SAMPLE_HOLD_INTERVAL_MS);
    };

    const stopHold = () => {
      if (!isPressing) {
        return;
      }

      const shouldApplySingleSample = !longPressActive;

      if (holdIntervalId !== null) {
        window.clearInterval(holdIntervalId);
        holdIntervalId = null;
      }

      if (longPressTimerId !== null) {
        window.clearTimeout(longPressTimerId);
        longPressTimerId = null;
      }

      isPressing = false;
      longPressActive = false;

      if (shouldApplySingleSample) {
        applySample();
      }
    };

    const onPressStart = (event) => {
      if (event.button !== undefined && event.button !== 0) {
        return;
      }

      if (isPressing) {
        return;
      }

      isPressing = true;
      longPressActive = false;
      longPressTimerId = window.setTimeout(startHold, SAMPLE_HOLD_DELAY_MS);
    };

    sampleBtn.addEventListener("pointerdown", onPressStart);
    sampleBtn.addEventListener("pointercancel", stopHold);
    sampleBtn.addEventListener("lostpointercapture", stopHold);
    window.addEventListener("pointerup", stopHold);
    window.addEventListener("blur", stopHold);
    sampleBtn.dataset.bound = "true";
  }

  if (resetBtn.dataset.bound !== "true") {
    resetBtn.addEventListener("click", () => {
      resetState();
      syncView();
    });
    resetBtn.dataset.bound = "true";
  }

  if (betaSlider.dataset.bound !== "true") {
    betaSlider.addEventListener("input", () => {
      confidenceMeaningState.beta = Number.parseFloat(betaSlider.value);
      if (confidenceMeaningState.sample.length > 0) {
        const { containsMu } = computeInterval(confidenceMeaningState.sample, confidenceMeaningState.beta);
        confidenceMeaningState.successCount = containsMu ? 1 : 0;
        confidenceMeaningState.totalCount = 1;
      } else {
        confidenceMeaningState.successCount = 0;
        confidenceMeaningState.totalCount = 0;
      }
      syncView();
    });
    betaSlider.dataset.bound = "true";
  }

  syncView();
};

const initConfidenceMeaningSample = () => {
  bindConfidenceMeaningSample();
};

export { initConfidenceMeaningSample };
