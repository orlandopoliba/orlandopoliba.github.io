(function () {
  function setupLatticePlot() {
    const canvas = document.getElementById('latticeCanvas');
    const button = document.getElementById('generateLattice');
    const colorToggle = document.getElementById('colorLattice');
    const groundStateToggle = document.getElementById('groundStateLattice');
    if (!canvas) return;
    let angles = [];
    let groundStateAngle = Math.random() * 2 * Math.PI;

    const generateAngles = (size) => {
      if (groundStateToggle && groundStateToggle.checked) {
        groundStateAngle = Math.random() * 2 * Math.PI;
        angles = Array(size * size).fill(groundStateAngle);
      } else {
        angles = Array.from({ length: size * size }, () => Math.random() * 2 * Math.PI);
      }
    };

    const draw = () => {
      const size = Number(8);
      const scale = window.devicePixelRatio || 1;
      const width = Math.min(520, canvas.parentElement.clientWidth || 520);
      const height = Math.min(520, width * 0.68);
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
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'black';
      ctx.lineWidth = 2;
      const arrowLength = Math.min(18, step * 0.55);
      const headLength = Math.min(6, arrowLength * 0.35);
      if (angles.length !== size * size) generateAngles(size);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const x = x0 + i * step;
          const y = y0 + j * step;
          const angle = angles[i * size + j];
          const cellSize = step * 1;
          const hue = (angle / (2 * Math.PI)) * 360;
          ctx.fillStyle = colorToggle && colorToggle.checked
            ? `hsl(${hue} 75% 68%)`
            : 'white';
          ctx.fillRect(x - cellSize / 2, y - cellSize / 2, cellSize, cellSize);
          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'black';
          const dx = Math.cos(angle) * arrowLength / 2;
          const dy = Math.sin(angle) * arrowLength / 2;
          ctx.beginPath();
          ctx.moveTo(x - dx, y - dy);
          ctx.lineTo(x + dx, y + dy);
          ctx.stroke();
          const tipX = x + dx;
          const tipY = y + dy;
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX - Math.cos(angle - Math.PI / 6) * headLength, tipY - Math.sin(angle - Math.PI / 6) * headLength);
          ctx.lineTo(tipX - Math.cos(angle + Math.PI / 6) * headLength, tipY - Math.sin(angle + Math.PI / 6) * headLength);
          ctx.closePath();
          ctx.fill();
        }
      }
    };

    if (button) {
      button.addEventListener('click', () => {
        generateAngles(sizeForPlot());
        draw();
      });
    }
    if (colorToggle) {
      colorToggle.addEventListener('change', draw);
    }
    if (groundStateToggle) {
      groundStateToggle.addEventListener('change', () => {
        generateAngles(sizeForPlot());
        draw();
      });
    }
    const sizeForPlot = () => 8;
    generateAngles(sizeForPlot());
    window.addEventListener('resize', draw);
    draw();
  }

  window.setupLatticePlot = setupLatticePlot;
})();
