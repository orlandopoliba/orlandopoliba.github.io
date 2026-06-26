(function () {
  function init() {
    const canvas = document.getElementById('holderFrequencyCanvas');
    if (!canvas) return;
    if (canvas.dataset.holderFrequenciesInitialized === 'true') return;
    canvas.dataset.holderFrequenciesInitialized = 'true';

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const timeInput = document.getElementById('holderTime');
    const jInput = document.getElementById('holderJ');
    const timeValue = document.getElementById('holderTimeValue');
    const jValue = document.getElementById('holderJValue');
    const bandValue = document.getElementById('holderBandValue');
    const normValue = document.getElementById('holderNormValue');

    const alpha = 0.2;
    const xMin = -0.5;
    const xMax = 0.5;

    function omegaDelta(k) {
      return Math.pow(Math.abs(k), alpha);
    }

    function smoothStep(edge0, edge1, x) {
      if (x <= edge0) return 0;
      if (x >= edge1) return 1;
      const y = (x - edge0) / (edge1 - edge0);
      return y * y * (3 - 2 * y);
    }

    function psiBand(k, j) {
      const left = Math.pow(2, j - 1);
      const middle = Math.pow(2, j);
      const right = Math.pow(2, j + 1);

      if (k < left || k > right) return 0;
      if (k <= middle) return smoothStep(left, middle, k);
      return 1 - smoothStep(middle, right, k);
    }

    function getState() {
      return {
        t: timeInput ? parseFloat(timeInput.value) : 0,
        j: jInput ? parseInt(jInput.value, 10) : 4,
      };
    }

    function updateLabels(t, j, norm) {
      const left = Math.ceil(Math.pow(2, j - 1));
      const right = Math.floor(Math.pow(2, j + 1));

      if (timeValue) timeValue.textContent = t.toFixed(3);
      if (jValue) jValue.textContent = String(j);
      renderInlineMath(bandValue, `k = ${left},\\ldots,${right}`, `k = ${left},...,${right}`);
      renderInlineMath(
        normValue,
        `\\lVert P_j u\\rVert_\\infty = ${norm.toFixed(4)}`,
        `||P_j u||∞ = ${norm.toFixed(4)}`
      );
    }

    function renderInlineMath(element, math, fallback) {
      if (!element) return;
      if (window.katex && typeof window.katex.render === 'function') {
        window.katex.render(math, element, {
          displayMode: false,
          throwOnError: false,
        });
      } else {
        element.textContent = fallback;
      }
    }

    function evaluatePoint(x, t, j) {
      const left = Math.ceil(Math.pow(2, j - 1));
      const right = Math.floor(Math.pow(2, j + 1));
      let sum = 0;

      for (let k = left; k <= right; k++) {
        const psi = psiBand(k, j);
        if (psi === 0) continue;

        sum += (
          psi *
          Math.cos(omegaDelta(k) * t) *
          Math.sin(2 * Math.PI * k * x) /
          k
        );
      }

      return sum / Math.PI;
    }

    function drawAxes(plot, yToPx) {
      ctx.strokeStyle = '#d4d4d4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plot.x, plot.y + plot.h);
      ctx.lineTo(plot.x + plot.w, plot.y + plot.h);
      ctx.moveTo(plot.x, plot.y);
      ctx.lineTo(plot.x, plot.y + plot.h);
      ctx.stroke();

      ctx.strokeStyle = '#e7e7e7';
      ctx.beginPath();
      ctx.moveTo(plot.x, yToPx(0));
      ctx.lineTo(plot.x + plot.w, yToPx(0));
      ctx.stroke();

      ctx.fillStyle = '#555';
      ctx.font = '13px system-ui, sans-serif';
      // ctx.fillText('x', plot.x + plot.w - 12, plot.y + plot.h + 22);
      // ctx.fillText('P_j u', plot.x + 6, plot.y + 15);
    }

    function drawPoint(point, xToPx, yToPx) {
      ctx.fillStyle = '#A81C3A';
      ctx.beginPath();
      ctx.arc(xToPx(point.x), yToPx(point.y), 5, 0, 2 * Math.PI);
      ctx.fill();
    }

    function drawPointLabel(point, label, verticalOffset, xToPx, yToPx) {
      const x = xToPx(point.x);
      const y = yToPx(point.y);
      const textWidth = ctx.measureText(label).width;
      const labelX = x + textWidth + 10 > width ? x - textWidth - 8 : x + 8;
      const labelY = Math.max(14, Math.min(height - 8, y + verticalOffset));

      ctx.fillText(label, labelX, labelY);
    }

    function draw() {
      const { t, j } = getState();
      const kMax = Math.floor(Math.pow(2, j + 1));
      const sampleCount = Math.max(1200, Math.min(8192, 16 * kMax));
      const values = new Array(sampleCount);

      let minPoint = { x: 0, y: Infinity };
      let maxPoint = { x: 0, y: -Infinity };

      for (let i = 0; i < sampleCount; i++) {
        const x = xMin + (i / (sampleCount - 1)) * (xMax - xMin);
        const y = evaluatePoint(x, t, j);
        values[i] = { x, y };

        if (y < minPoint.y) minPoint = { x, y };
        if (y > maxPoint.y) maxPoint = { x, y };
      }

      const norm = Math.max(Math.abs(minPoint.y), Math.abs(maxPoint.y));
      updateLabels(t, j, norm);

      ctx.clearRect(0, 0, width, height);

      const plot = { x: 58, y: 18, w: width - 88, h: height - 52 };
      const yBound = Math.max(norm * 1.12, 0.005);
      const xToPx = (x) => plot.x + ((x - xMin) / (xMax - xMin)) * plot.w;
      const yToPx = (y) => plot.y + plot.h / 2 - (y / yBound) * (plot.h / 2);

      drawAxes(plot, yToPx);

      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      values.forEach((point, index) => {
        const x = xToPx(point.x);
        const y = yToPx(point.y);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      drawPoint(maxPoint, xToPx, yToPx);
      drawPoint(minPoint, xToPx, yToPx);

      ctx.fillStyle = '#A81C3A';
      ctx.font = '13px system-ui, sans-serif';
      // drawPointLabel(maxPoint, `max ${maxPoint.y.toFixed(4)}`, -8, xToPx, yToPx);
      // drawPointLabel(minPoint, `min ${minPoint.y.toFixed(4)}`, 16, xToPx, yToPx);
    }

    [timeInput, jInput].filter(Boolean).forEach((input) => {
      input.addEventListener('input', draw);
    });

    if (window.Reveal) {
      Reveal.on('slidechanged', (event) => {
        if (event.currentSlide && event.currentSlide.contains(canvas)) draw();
      });
      Reveal.on('ready', () => {
        if (canvas.isConnected) draw();
      });
    }

    draw();
  }

  if (window.SlideDeck && typeof window.SlideDeck.onReady === 'function') {
    window.SlideDeck.onReady(init);
  } else if (window.Reveal) {
    Reveal.on('ready', init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
