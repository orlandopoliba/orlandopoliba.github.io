(function () {
  const canvas = document.getElementById('dispersionCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  const deltaInput = document.getElementById('delta');
  const deltaOut   = document.getElementById('deltaValue');

  function getAlpha() { return 0.2; }
  function getDelta() { return deltaInput ? parseFloat(deltaInput.value) : 1.0; }

  // Simpson on [a,b] with even n
  function simpson(f, a, b, n) {
    if (n <= 0) return 0;
    if (n % 2 === 1) n += 1;
    const h = (b - a) / n;
    let s0 = f(a) + f(b), s1 = 0, s2 = 0;
    for (let k = 1; k < n; k++) {
      const x = a + k * h;
      (k % 2 ? (s1 += f(x)) : (s2 += f(x)));
    }
    return (h / 3) * (s0 + 4 * s1 + 2 * s2);
  }

  // ω(ξ) using Taylor near 0 and numeric tail
  function omega(xi, delta, alpha) {
    const ax = Math.abs(xi);
    if (ax === 0) return 0;
    const twoPi = 2 * Math.PI;

    // small-phase threshold
    const theta0 = 0.5;
    const y0 = Math.min(delta, theta0 / (twoPi * ax));

    // analytic piece on [0, y0]
    const eps = 1e-12;
    let I0;
    if (Math.abs(1 - alpha) > 1e-8) {
      I0 = (2 * Math.PI * Math.PI) * (ax * ax) * (Math.pow(y0, 2 - 2 * alpha) / (2 - 2 * alpha));
    } else {
      I0 = (2 * Math.PI * Math.PI) * (ax * ax) * Math.log(y0 / eps);
    }

    // numeric tail on [y0, δ]
    const integrand = (y) => {
      const denom = Math.pow(y, 1 + 2 * alpha);
      const num = 1 - Math.cos(twoPi * xi * y);
      return num / denom;
    };

    const osc = Math.max(1, Math.floor((twoPi * ax * (delta - y0)) / Math.PI));
    const N = Math.min(4000, 600 + 200 * osc);
    const I1 = y0 < delta ? simpson(integrand, y0, delta, N) : 0;

    const I = 2 * (I0 + I1); // even integrand
    return Math.sqrt(1 / Math.pow(delta, 2 * (1 - alpha)) * Math.max(I, 0));
  }

  function drawAxesLinear(x, y, wPlot, hPlot) {
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + hPlot); ctx.lineTo(x + wPlot, y + hPlot); // x-axis
    ctx.moveTo(x, y);         ctx.lineTo(x, y + hPlot);          // y-axis
    ctx.stroke();
    // label
    ctx.fillStyle = '#555';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('linear', x + 6, y + 14);
  }

  function drawAxesLog(x, y, wPlot, hPlot) {
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + hPlot); ctx.lineTo(x + wPlot, y + hPlot);
    ctx.moveTo(x, y);         ctx.lineTo(x, y + hPlot);
    ctx.stroke();
    ctx.fillStyle = '#555';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('log–log', x + 6, y + 14);
  }

  function drawCurve() {
    const alpha = getAlpha();
    const delta = getDelta();

    ctx.clearRect(0, 0, w, h);

    // layout: two side-by-side panels
    const outerM = { top: 20, right: 20, bottom: 34, left: 50, mid: 50 };
    const panelW = (w - outerM.left - outerM.right - outerM.mid) / 2;
    const panelH = h - outerM.top - outerM.bottom;
    const p1 = { x: outerM.left, y: outerM.top, w: panelW, h: panelH };
    const p2 = { x: outerM.left + panelW + outerM.mid, y: outerM.top, w: panelW, h: panelH };

    // data
    const xiMax = 30;
    const samples = 500;

    const xs = new Array(samples);
    const ys = new Array(samples);

    let yMax = 0;
    for (let i = 0; i < samples; i++) {
      const xi = (i / (samples - 1)) * xiMax;  // includes xi=0
      const val = omega(xi, delta, alpha);
      xs[i] = xi;
      ys[i] = val;
      if (val > yMax) yMax = val;
    }
    if (!isFinite(yMax) || yMax <= 0) yMax = 1;

    // --- left panel: linear ---
    drawAxesLinear(p1.x, p1.y, p1.w, p1.h);

    const xToPxLin = (xi) => p1.x + (xi / xiMax) * p1.w;
    const yToPxLin = (v)  => p1.y + p1.h - (v / yMax) * p1.h;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < samples; i++) {
      const xp = xToPxLin(xs[i]);
      const yp = yToPxLin(ys[i]);
      if (i === 0) ctx.moveTo(xp, yp); else ctx.lineTo(xp, yp);
    }
    ctx.stroke();

    // --- right panel: log–log ---
    drawAxesLog(p2.x, p2.y, p2.w, p2.h);

    // exclude zero; find min positive xi and y
    const xiMin = xs[1] > 0 ? xs[1] : (xiMax / (samples - 1));
    let yMin = Infinity, yMaxPos = 0;
    for (let i = 1; i < samples; i++) {
      const v = ys[i];
      if (v > 0 && v < yMin) yMin = v;
      if (v > yMaxPos) yMaxPos = v;
    }
    if (!isFinite(yMin) || yMin <= 0) yMin = 1e-6;
    if (!(yMaxPos > 0)) yMaxPos = 1;

    const log10 = (z) => Math.log(z) / Math.LN10;

    const xToPxLog = (xi) => {
      const t = (log10(xi) - log10(xiMin)) / (log10(xiMax) - log10(xiMin));
      return p2.x + Math.max(0, Math.min(1, t)) * p2.w;
    };
    const yToPxLog = (v) => {
      const t = (log10(v) - log10(yMin)) / (log10(yMaxPos) - log10(yMin));
      return p2.y + p2.h - Math.max(0, Math.min(1, t)) * p2.h;
    };

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let i = 1; i < samples; i++) { // start from i=1 to skip xi=0
      const xi = xs[i];
      const v  = ys[i];
      if (xi <= 0 || v <= 0) { started = false; continue; }
      const xp = xToPxLog(xi);
      const yp = yToPxLog(v);
      if (!started) { ctx.moveTo(xp, yp); started = true; }
      else { ctx.lineTo(xp, yp); }
    }
    ctx.stroke();

    // simple x-axis labels
    ctx.fillStyle = '#333';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('ξ', p1.x + p1.w - 10, p1.y + p1.h + 24);
    ctx.fillText('ω(ξ)', p1.x - 36, p1.y + 8);
    ctx.fillText('ξ', p2.x + p2.w - 16, p2.y + p2.h + 24);
    ctx.fillText('ω(ξ)', p2.x - 34, p2.y + 8);
  }

  function updateLabels() {
    if (deltaOut) deltaOut.textContent = getDelta().toFixed(2);
  }

  function update() {
    updateLabels();
    drawCurve();
  }

  // UI events
  if (deltaInput) deltaInput.addEventListener('input', update);

  // Redraw when entering this slide
  Reveal.on('slidechanged', (e) => {
    if (e.currentSlide && e.currentSlide.contains(canvas)) update();
  });
  Reveal.on('ready', () => {
    if (canvas.isConnected) update();
  });

  update();
})(); 
