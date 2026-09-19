(function () {
  function setupNFixedSinusPlot() {
    const canvas = document.getElementById('NFixedSinusCanvas');
    if (!canvas) return;
    const plot = canvas.parentElement;
    const labels = ['0', '\\frac{\\pi}{2}', '4 \\sin^2\\big(\\frac{\\theta}{2}\\big)', '\\theta'];
    const spans = labels.map((text, i) => { const s = document.createElement('span'); s.className = `sinus-label sinus-label-${i}`; plot.appendChild(s); s.textContent = text; return s; });
    function renderLabels() { if (window.katex) spans.forEach((s, i) => window.katex.render(labels[i], s, { throwOnError: false })); }
    renderLabels(); setTimeout(renderLabels, 100); setTimeout(renderLabels, 500);
    function draw() {
      const d = devicePixelRatio || 1;
      const w = Math.min(360, canvas.parentElement.clientWidth || 360), h = w * .72;
      canvas.width = w * d; canvas.height = h * d; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const c = canvas.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, w, h);
      const left = 42, right = 18, top = 18, bottom = 34, pw = w - left - right, ph = h - top - bottom;
      const X = x => left + x / (Math.PI / 2) * pw, Y = y => top + (4 - y) / 4 * ph;
      c.strokeStyle = '#555'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(left, top); c.lineTo(left, h - bottom); c.lineTo(w - right, h - bottom); c.stroke();
      c.fillStyle = '#555';
      c.beginPath(); c.moveTo(left, top); c.lineTo(left - 5, top + 10); c.lineTo(left + 5, top + 10); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(w - right, h - bottom); c.lineTo(w - right - 10, h - bottom - 5); c.lineTo(w - right - 10, h - bottom + 5); c.closePath(); c.fill();
      c.strokeStyle = '#A81C3A'; c.lineWidth = 3; c.beginPath();
      for (let n = 0; n <= 120; n++) { const x = Math.PI / 2 * n / 120, y = 4 * Math.sin(x / 2) ** 2; n ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y)); }
      c.stroke();
      // For the current configuration, k=4 and θ=2π/9.
      const k = Math.min(window.NFixedK || 4, 9 - (window.NFixedK || 4)), markedX = k * Math.PI / 9, markedY = 4 * Math.sin(markedX / 2) ** 2;
      c.fillStyle = '#A81C3A'; c.beginPath(); c.arc(X(markedX), Y(markedY), 5, 0, 2 * Math.PI); c.fill();
      spans[0].style.left = `${left / w * 100}%`; spans[0].style.top = `${(h - bottom + 18) / h * 100}%`;
      spans[1].style.left = `${(w - right - 10) / w * 100}%`; spans[1].style.top = `${(h - bottom + 18) / h * 100}%`;
      spans[2].style.left = `${(left + 20) / w * 100}%`; spans[2].style.top = `${(top + 14) / h * 100}%`;
      spans[3].style.left = `${(w - right + 20) / w * 100}%`; spans[3].style.top = `${(h - bottom) / h * 100}%`;
    }
    addEventListener('resize', draw); window.addEventListener('NFixedKChanged', draw); draw();
  }
  window.setupNFixedSinusPlot = setupNFixedSinusPlot;
})();
