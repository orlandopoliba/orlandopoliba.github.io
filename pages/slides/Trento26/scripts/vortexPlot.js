(function () {
  function setupVortexPlot() {
    const canvas = document.getElementById('vortexCanvas');
    if (!canvas) return;

    const size = 8;
    const draw = () => {
      const scale = window.devicePixelRatio || 1;
      const width = Math.min(440, canvas.parentElement.clientWidth || 440);
      const height = Math.min(440, width * 0.68);
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const margin = 28;
      const step = Math.min((width - 2 * margin) / (size - 1), (height - 2 * margin) / (size - 1));
      const x0 = (width - step * (size - 1)) / 2;
      const y0 = (height - step * (size - 1)) / 2;
      const center = (size - 1) / 2;
      const arrowLength = Math.min(18, step * 0.55);
      const headLength = Math.min(6, arrowLength * 0.35);

      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
        const x = x0 + i * step, y = y0 + j * step;
        const dx = i - center, dy = j - center;
        const angle = Math.atan2(dy, dx);
        const hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;
        ctx.fillStyle = `hsl(${hue} 75% 68%)`;
        ctx.fillRect(x - step / 2, y - step / 2, step, step);
        const ax = Math.cos(angle) * arrowLength / 2;
        const ay = Math.sin(angle) * arrowLength / 2;
        ctx.strokeStyle = ctx.fillStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - ax, y - ay); ctx.lineTo(x + ax, y + ay); ctx.stroke();
        const tx = x + ax, ty = y + ay;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - Math.cos(angle - Math.PI / 6) * headLength, ty - Math.sin(angle - Math.PI / 6) * headLength);
        ctx.lineTo(tx - Math.cos(angle + Math.PI / 6) * headLength, ty - Math.sin(angle + Math.PI / 6) * headLength);
        ctx.closePath(); ctx.fill();
      }
    };
    window.addEventListener('resize', draw);
    draw();
  }
  function setupLimitPlot() {
    const canvas = document.getElementById('limitCanvas');
    if (!canvas) return;
    const draw = () => {
      const scale = window.devicePixelRatio || 1;
      const width = Math.min(440, canvas.parentElement.clientWidth || 440);
      const height = Math.min(440, width * 0.68);
      canvas.width = width * scale; canvas.height = height * scale;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.clearRect(0, 0, width, height);
      const cx = width / 2, cy = height / 2;
      const vortices = [[-.20, -.10], [.02, -.16], [.22, -.04], [-.08, .14], [.17, .16]];
      ctx.beginPath();
      ctx.moveTo(cx - width * .29, cy + height * .17);
      ctx.bezierCurveTo(cx - width * .42, cy + height * .02, cx - width * .35, cy - height * .25, cx - width * .12, cy - height * .29);
      ctx.bezierCurveTo(cx + width * .10, cy - height * .34, cx + width * .35, cy - height * .23, cx + width * .38, cy - height * .02);
      ctx.bezierCurveTo(cx + width * .42, cy + height * .20, cx + width * .22, cy + height * .31, cx - width * .02, cy + height * .29);
      ctx.bezierCurveTo(cx - width * .16, cy + height * .28, cx - width * .25, cy + height * .25, cx - width * .29, cy + height * .17);
      ctx.closePath();
      // The global map is the complex product of the five vortex maps:
      // arg(u) = sum_i arg(x - x_i), so its phase has no domain walls.
      ctx.save(); ctx.clip();
      const grid = 1;
      for (let x = 0; x < width; x += grid) for (let y = 0; y < height; y += grid) {
        const angle = vortices.reduce((phase, [px, py]) =>
          phase + Math.atan2(y - (cy + py * height), x - (cx + px * width)), 0);
        ctx.fillStyle = `hsl(${((angle + Math.PI) / (2 * Math.PI) % 1) * 360} 75% 68%)`;
        ctx.fillRect(x, y, grid, grid);
      }
      ctx.restore();
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2.5; ctx.stroke();
      vortices.forEach(([px, py], index) => {
        const vx = cx + px * width, vy = cy + py * height;
        const radius = Math.min(17, width * .035);
        ctx.strokeStyle = 'black'; ctx.fillStyle = 'black'; ctx.lineWidth = 2;
        for (let k = 0; k < 8; k++) {
          const radial = k * Math.PI / 4;
          const base = vortices.reduce((phase, [qx, qy]) => {
            if (qx === px && qy === py) return phase;
            return phase + Math.atan2(vy - (cy + qy * height), vx - (cx + qx * width));
          }, 0);
          const rx = Math.cos(radial), ry = Math.sin(radial);
          const a = base + radial;
          const ux = Math.cos(a), uy = Math.sin(a);
          const pointX = vx + rx * radius * .72, pointY = vy + ry * radius * .72;
          const lineLength = radius * .55;
          const x1 = pointX - ux * lineLength / 2, y1 = pointY - uy * lineLength / 2;
          const x2 = pointX + ux * lineLength / 2, y2 = pointY + uy * lineLength / 2;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          const head = radius * .22;
          const perpX = -uy, perpY = ux;
          const tipX = x2 + ux * head, tipY = y2 + uy * head;
          ctx.beginPath(); ctx.moveTo(tipX, tipY);
          ctx.lineTo(x2 + perpX * head * .5, y2 + perpY * head * .5);
          ctx.lineTo(x2 - perpX * head * .5, y2 - perpY * head * .5);
          ctx.closePath(); ctx.fill();
        }
      });
    };
    window.addEventListener('resize', draw); draw();
  }
  window.setupVortexPlot = setupVortexPlot;
  window.setupLimitPlot = setupLimitPlot;
})();
