(function () {
  function setupLatticeWithConstraintsPlot() {
    const canvas = document.getElementById('latticeWithConstraintsCanvas');
    const button = document.getElementById('generateLatticeWithConstraints');
    const colorToggle = document.getElementById('colorLatticeWithConstraints');
    const groundStateToggle = document.getElementById('groundStateLatticeWithConstraints');
    if (!canvas) return;
    let directions = [];
    let groundStateDirection = Math.random() < 0.5 ? -1 : 1;
    const generateDirections = () => {
      if (groundStateToggle && groundStateToggle.checked) {
        groundStateDirection = Math.random() < 0.5 ? -1 : 1;
        directions = Array(64).fill(groundStateDirection);
      } else {
        directions = Array.from({ length: 64 }, () => Math.random() < 0.5 ? -1 : 1);
      }
    };

    const draw = () => {
      const size = 8;
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
      const length = Math.min(18, step * 0.55);
      const headLength = Math.min(6, length * 0.35);
      if (directions.length !== size * size) generateDirections();
      ctx.strokeStyle = ctx.fillStyle = 'black';
      ctx.lineWidth = 2;
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
        const x = x0 + i * step, y = y0 + j * step;
        const direction = directions[i * size + j];
        if (colorToggle && colorToggle.checked) {
          ctx.fillStyle = direction > 0 ? 'hsl(90 75% 68%)' : 'hsl(270 75% 68%)';
        } else {
          ctx.fillStyle = 'white';
        }
        const cellSize = step * 1;
        ctx.fillRect(x - cellSize / 2, y - cellSize / 2, cellSize, cellSize);
        ctx.strokeStyle = ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(x, y - direction * length / 2);
        ctx.lineTo(x, y + direction * length / 2);
        ctx.stroke();
        const angle = direction * Math.PI / 2;
        const tipX = x;
        const tipY = y + direction * length / 2;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(
          tipX - Math.cos(angle - Math.PI / 6) * headLength,
          tipY - Math.sin(angle - Math.PI / 6) * headLength
        );
        ctx.lineTo(
          tipX - Math.cos(angle + Math.PI / 6) * headLength,
          tipY - Math.sin(angle + Math.PI / 6) * headLength
        );
        ctx.closePath();
        ctx.fill();
      }
    };
    if (button) button.addEventListener('click', () => {
      button.classList.add('generated');
      generateDirections();
      draw();
    });
    if (colorToggle) colorToggle.addEventListener('change', draw);
    if (groundStateToggle) groundStateToggle.addEventListener('change', () => {
      generateDirections();
      draw();
    });
    generateDirections();
    window.addEventListener('resize', draw);
    draw();
  }
  window.setupLatticeWithConstraintsPlot = setupLatticeWithConstraintsPlot;
})();
