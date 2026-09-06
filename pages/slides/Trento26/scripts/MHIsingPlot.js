(function () {
  function setupMHIsingPlot() {
    const canvas = document.getElementById('MHIsingSimulationCanvas');
    const slider = document.getElementById('temperatureIsing');
    if (!canvas || !slider) return;

    const N = 200;
    const spins = new Int8Array(N * N);
    spins.fill(1);
    let beta = Number(slider.value);
    let phase = 0;

    function draw() {
      const scale = devicePixelRatio || 1;
      const width = Math.min(520, canvas.parentElement.clientWidth || 520);
      const height = Math.min(520, width * 0.68);
      canvas.width = width * scale; canvas.height = height * scale;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const margin = 8;
      const step = Math.min((width - 2 * margin) / N, (height - 2 * margin) / N);
      const x0 = (width - step * N) / 2, y0 = (height - step * N) / 2;
      const cellSize = step;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const x = x0 + (i + 0.5) * step, y = y0 + (j + 0.5) * step;
        const sign = spins[i * N + j];
        ctx.fillStyle = sign > 0 ? 'hsl(90 75% 68%)' : 'hsl(270 75% 68%)';
        ctx.fillRect(x - cellSize / 2, y - cellSize / 2, cellSize, cellSize);
      }
    }

    function sweep() {
      for (let parity = 0; parity < 2; parity++) {
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
          if ((i + j) % 2 !== parity) continue;
          const k = i * N + j, s = spins[k];
          // Zero-valued outside sites provide padded (free) boundary conditions.
          let neighbours = 0;
          if (i) neighbours += spins[(i - 1) * N + j];
          if (i + 1 < N) neighbours += spins[(i + 1) * N + j];
          if (j) neighbours += spins[i * N + j - 1];
          if (j + 1 < N) neighbours += spins[i * N + j + 1];
          const deltaH = 2 * s * neighbours;
          if (deltaH <= 0 || Math.random() < Math.exp(-beta * deltaH)) spins[k] = -s;
        }
      }
    }

    function animate() {
      for (let n = 0; n < 2; n++) sweep();
      draw();
      requestAnimationFrame(animate);
    }
    slider.addEventListener('input', () => { beta = Number(slider.value); });
    window.addEventListener('resize', draw);
    draw(); animate();
  }
  window.setupMHIsingPlot = setupMHIsingPlot;
})();
