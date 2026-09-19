(function () {
  function setupIsingInterfacePlot() {
    const canvas = document.getElementById('IsingInterfaceCanvas');
    if (!canvas) return;
    const paintDirection = document.getElementById('isingPaintDirection');
    const size = 10;
    function updateCursor() {
      const down = !(paintDirection && paintDirection.checked);
      const color = down ? '#90c95a' : '#9050a8';
      const y1 = down ? 5 : 27, y2 = down ? 27 : 5;
      const head = down ? 'M11 21 L16 27 L21 21' : 'M11 11 L16 5 L21 11';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect x="2" y="2" width="28" height="28" fill="${color}"/><path d="M16 ${y1}v${y2 - y1}" stroke="#222" stroke-width="2"/><path d="${head}" fill="none" stroke="#222" stroke-width="2"/></svg>`;
      canvas.style.cursor = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, pointer`;
    }
    if (paintDirection) paintDirection.addEventListener('change', updateCursor);
    const spins = Array(size * size).fill(1);
    let width, height, step, x0, y0;

    function draw() {
      const scale = window.devicePixelRatio || 1;
      width = Math.min(520, canvas.parentElement.clientWidth || 520);
      height = Math.min(520, width * 0.68);
      canvas.width = width * scale; canvas.height = height * scale;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const margin = 28;
      step = Math.min((width - 2 * margin) / (size - 1), (height - 2 * margin) / (size - 1));
      x0 = (width - step * (size - 1)) / 2;
      y0 = (height - step * (size - 1)) / 2;
      const length = Math.min(18, step * 0.55);
      const head = Math.min(6, length * 0.35);
      ctx.lineWidth = 2;
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
        const x = x0 + i * step, y = y0 + j * step;
        const spin = spins[i * size + j];
        ctx.fillStyle = spin > 0 ? 'hsl(90 75% 68%)' : 'hsl(270 75% 68%)';
        ctx.fillRect(x - step / 2, y - step / 2, step, step);
        ctx.strokeStyle = ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(x, y - spin * length / 2);
        ctx.lineTo(x, y + spin * length / 2);
        ctx.stroke();
        const angle = spin * Math.PI / 2;
        const tipY = y + spin * length / 2;
        ctx.beginPath();
        ctx.moveTo(x, tipY);
        ctx.lineTo(x - Math.cos(angle - Math.PI / 6) * head, tipY - Math.sin(angle - Math.PI / 6) * head);
        ctx.lineTo(x - Math.cos(angle + Math.PI / 6) * head, tipY - Math.sin(angle + Math.PI / 6) * head);
        ctx.closePath();
        ctx.fill();
      }
    }
    let drawing = false;
    let lastCell = null;
    function toggleAt(event) {
      const rect = canvas.getBoundingClientRect();
      // Reveal may scale the whole deck, so convert screen coordinates back
      // to the canvas' logical drawing coordinates before locating a cell.
      const localX = (event.clientX - rect.left) * width / rect.width;
      const localY = (event.clientY - rect.top) * height / rect.height;
      const i = Math.round((localX - x0) / step);
      const j = Math.round((localY - y0) / step);
      if (i < 0 || i >= size || j < 0 || j >= size ||
          Math.hypot(localX - (x0 + i * step), localY - (y0 + j * step)) >= step / 2) return;
      const cell = `${i},${j}`;
      if (cell === lastCell) return;
      spins[i * size + j] = paintDirection && paintDirection.checked ? -1 : 1;
      lastCell = cell;
      draw();
    }
    canvas.addEventListener('pointerdown', (event) => {
      drawing = true;
      lastCell = null;
      canvas.setPointerCapture(event.pointerId);
      toggleAt(event);
      event.preventDefault();
    });
    canvas.addEventListener('pointermove', (event) => {
      if (drawing) toggleAt(event);
    });
    canvas.addEventListener('pointerup', (event) => {
      drawing = false;
      lastCell = null;
      canvas.releasePointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointercancel', () => {
      drawing = false;
      lastCell = null;
    });
    window.addEventListener('resize', draw);
    updateCursor();
    draw();
  }
  window.setupIsingInterfacePlot = setupIsingInterfacePlot;
})();
