(function () {
  function setupMHXYPlot() {
    const canvas = document.getElementById('MHXYSimulationCanvas');
    const slider = document.getElementById('temperatureXY');
    if (!canvas || !slider) return;

    const N = 200;
    const CLOCK = 16;
    const states = new Int8Array(N * N);
    states.fill(0);
    let beta = Number(slider.value);

    function draw() {
      const scale = devicePixelRatio || 1;
      const width = Math.min(520, canvas.parentElement.clientWidth || 520);
      const height = Math.min(520, width * 0.68);
      canvas.width = width * scale; canvas.height = height * scale;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const margin = 8, step = Math.min((width - 2 * margin) / N, (height - 2 * margin) / N);
      const x0 = (width - step * N) / 2, y0 = (height - step * N) / 2;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const x = x0 + (i + 0.5) * step, y = y0 + (j + 0.5) * step;
        ctx.fillStyle = `hsl(${states[i * N + j] * 360 / CLOCK} 75% 68%)`;
        ctx.fillRect(x - step / 2, y - step / 2, step, step);
      }

      // Mark plaquettes whose angle winding is approximately +/- 2*pi.
      const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
      const angle = (i, j) => states[i * N + j] * 2 * Math.PI / CLOCK;
      for (let i = 0; i < N - 1; i++) for (let j = 0; j < N - 1; j++) {
        const winding = wrap(angle(i + 1, j) - angle(i, j))
          + wrap(angle(i + 1, j + 1) - angle(i + 1, j))
          + wrap(angle(i, j + 1) - angle(i + 1, j + 1))
          + wrap(angle(i, j) - angle(i, j + 1));
        if (Math.abs(winding) > Math.PI) {
          const x = x0 + (i + 1) * step, y = y0 + (j + 1) * step;
          ctx.fillStyle = winding > 0 ? '#d7191c' : '#2166ac';
          ctx.beginPath();
          ctx.arc(x, y, Math.max(2, step * 0.8), 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    function sweep() {
      for (let parity = 0; parity < 2; parity++) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        if ((i + j) % 2 !== parity) continue;
        const k = i * N + j, old = states[k];
        const proposal = (old + (Math.random() < 0.5 ? -1 : 1) + CLOCK) % CLOCK;
        let sr = 0, si = 0;
        if (i) { const a = states[(i - 1) * N + j] * 2 * Math.PI / CLOCK; sr += Math.cos(a); si += Math.sin(a); }
        if (i + 1 < N) { const a = states[(i + 1) * N + j] * 2 * Math.PI / CLOCK; sr += Math.cos(a); si += Math.sin(a); }
        if (j) { const a = states[i * N + j - 1] * 2 * Math.PI / CLOCK; sr += Math.cos(a); si += Math.sin(a); }
        if (j + 1 < N) { const a = states[i * N + j + 1] * 2 * Math.PI / CLOCK; sr += Math.cos(a); si += Math.sin(a); }
        const oldA = old * 2 * Math.PI / CLOCK, newA = proposal * 2 * Math.PI / CLOCK;
        const deltaH = -(Math.cos(newA) - Math.cos(oldA)) * sr - (Math.sin(newA) - Math.sin(oldA)) * si;
        if (deltaH <= 0 || Math.random() < Math.exp(-beta * deltaH)) states[k] = proposal;
      }
    }

    function animate() { sweep(); sweep(); draw(); requestAnimationFrame(animate); }
    slider.addEventListener('input', () => { beta = Number(slider.value); });
    window.addEventListener('resize', draw);
    draw(); animate();
  }
  window.setupMHXYPlot = setupMHXYPlot;
})();
