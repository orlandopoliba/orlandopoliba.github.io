(function () {
  function setupNFixedProofPlot() {
    const canvas = document.getElementById('NFixedProofCanvas');
    if (!canvas) return;
    const N = 9;
    let selected = 4;
    window.NFixedK = selected;
    let geometry;
    const plot = canvas.parentElement;
    const labelI = document.createElement('span'), labelJ = document.createElement('span');
    labelI.className = 'N-fixed-label n-fixed-label-i'; labelJ.className = 'N-fixed-label n-fixed-label-j';
    plot.append(labelI, labelJ);
    labelI.textContent = 'u(εi)';
    labelJ.textContent = 'u(εj)';
    function renderLabels() {
      if (!window.katex) return;
      window.katex.render('u(\\varepsilon i)', labelI, { throwOnError: false });
      window.katex.render('u(\\varepsilon j)', labelJ, { throwOnError: false });
    }
    renderLabels();
    setTimeout(renderLabels, 100);
    setTimeout(renderLabels, 500);

    function arrow(ctx, x, y, angle, length, head) {
      const tx = x + length * Math.cos(angle), ty = y + length * Math.sin(angle);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.lineTo(tx - head * Math.cos(angle - Math.PI / 6), ty - head * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(tx - head * Math.cos(angle + Math.PI / 6), ty - head * Math.sin(angle + Math.PI / 6));
      ctx.closePath(); ctx.fill();
    }
    function draw() {
      const d = devicePixelRatio || 1;
      const w = Math.min(560, canvas.parentElement.clientWidth || 560), h = w * .72;
      canvas.width = w * d; canvas.height = h * d; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const c = canvas.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, w, h);
      const r = Math.min(w, h) * .32, cx = w / 2, cy = h / 2;
      geometry = { cx, cy, r };
      c.strokeStyle = '#808080'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r, 0, 2 * Math.PI); c.stroke();
      for (let k = 0; k < N; k++) {
        const a = 2 * Math.PI * k / N, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        c.fillStyle = '#A81C3A'; c.beginPath(); c.arc(x, y, 4.5, 0, 2 * Math.PI); c.fill();
      }
      // The first spin is fixed at (1, 0); the second starts four clock points away.
      const a1 = 0, a2 = 2 * Math.PI * selected / N;
      const direction = selected <= N / 2 ? 1 : -1;
      const pathSteps = selected <= N / 2 ? selected : N - selected;
      c.strokeStyle = '#A81C3A'; c.lineWidth = 1.5;
      c.beginPath();
      for (let step = 0; step <= pathSteps; step++) {
        const angle = 2 * Math.PI * (step * direction) / N;
        c.moveTo(cx, cy);
        c.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      }
      c.stroke();
      // Height of the isosceles triangle: perpendicular to the chord u(εi)u(εj).
      const ax = cx + r * Math.cos(a1), ay = cy + r * Math.sin(a1);
      const bx = cx + r * Math.cos(a2), by = cy + r * Math.sin(a2);
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const norm = Math.hypot(mx - cx, my - cy) || 1;
      c.strokeStyle = '#222'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + (mx - cx) / norm * r * 1.35, cy + (my - cy) / norm * r * 1.35); c.stroke();
      c.strokeStyle = '#222'; c.fillStyle = '#222'; c.lineWidth = 3;
      arrow(c, cx, cy, a1, r * .92, 8);
      c.strokeStyle = '#222'; c.fillStyle = '#222'; arrow(c, cx, cy, a2, r * .92, 8);
      c.strokeStyle = '#222'; c.lineWidth = 2; c.setLineDash([5, 5]);
      c.beginPath();
      for (let step = 0; step < pathSteps; step++) {
        const from = 2 * Math.PI * (step * direction) / N;
        const to = 2 * Math.PI * ((step + 1) * direction) / N;
        c.moveTo(cx + r * Math.cos(from), cy + r * Math.sin(from));
        c.lineTo(cx + r * Math.cos(to), cy + r * Math.sin(to));
      }
      c.stroke(); c.setLineDash([]);
      // Straight chord joining the two endpoint spins.
      c.beginPath();
      c.moveTo(cx + r * Math.cos(a1), cy + r * Math.sin(a1));
      c.lineTo(cx + r * Math.cos(a2), cy + r * Math.sin(a2));
      c.stroke();
      labelI.style.left = `${(cx + r * 1.5 * Math.cos(a1)) / w * 100}%`;
      labelI.style.top = `${(cy + r * 1.5 * Math.sin(a1)) / h * 100}%`;
      labelJ.style.left = `${(cx + r * 1.5 * Math.cos(a2)) / w * 100}%`;
      labelJ.style.top = `${(cy + r * 1.5 * Math.sin(a2)) / h * 100}%`;
    }
    function choose(e) {
      const q = canvas.getBoundingClientRect(), x = e.clientX - q.left - geometry.cx, y = e.clientY - q.top - geometry.cy;
      let a = Math.atan2(y, x); if (a < 0) a += 2 * Math.PI;
      selected = Math.round(a * N / (2 * Math.PI)) % N; if (selected === 0) selected = 1; window.NFixedK = selected; draw(); window.dispatchEvent(new Event('NFixedKChanged'));
    }
    canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); choose(e); });
    canvas.addEventListener('pointermove', e => { if (e.buttons) choose(e); });
    addEventListener('resize', draw); draw();
  }
  window.setupNFixedProofPlot = setupNFixedProofPlot;
})();
