(function () {
  function setupSNPlot() {
    const canvas = document.getElementById('SNCanvas');
    const slider = document.getElementById('SNSize');
    const output = document.getElementById('SNValue');
    if (!canvas || !slider) return;

    let selected = 0;
    let dragging = false;
    let geometry = {};

    function draw() {
      const scale = window.devicePixelRatio || 1;
      const width = Math.min(560, canvas.parentElement.clientWidth || 560);
      const height = Math.min(440, width * 0.72);
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const radius = Math.min(width, height) * 0.3;
      const cx = width / 2;
      const cy = height / 2;
      const n = Number(slider.value);
      selected = Math.min(selected, n - 1);
      geometry = { cx, cy, radius, n };
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.stroke();

      for (let k = 0; k < n; k++) {
        const angle = 2 * Math.PI * k / n;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        ctx.fillStyle = k === selected ? '#222' : '#A81C3A';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(4, Math.min(7, width / 70)), 0, 2 * Math.PI);
        ctx.fill();
      }

      // Direction arrow from the centre to the selected state.
      const angle = 2 * Math.PI * selected / n;
      const tipX = cx + radius * 0.95 * Math.cos(angle);
      const tipY = cy + radius * 0.95 * Math.sin(angle);
      const head = 12;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'black';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - head * Math.cos(angle - Math.PI / 6), tipY - head * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(tipX - head * Math.cos(angle + Math.PI / 6), tipY - head * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      if (output) output.value = n;
    }

    function pointerPosition(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    canvas.addEventListener('pointerdown', (event) => {
      const p = pointerPosition(event);
      const dx = p.x - geometry.cx;
      const dy = p.y - geometry.cy;
      if (Math.hypot(dx, dy) <= geometry.radius + 24) {
        dragging = true;
        canvas.setPointerCapture(event.pointerId);
        event.preventDefault();
      }
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const p = pointerPosition(event);
      let angle = Math.atan2(p.y - geometry.cy, p.x - geometry.cx);
      if (angle < 0) angle += 2 * Math.PI;
      selected = Math.round(angle / (2 * Math.PI) * geometry.n) % geometry.n;
      draw();
    });
    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointercancel', () => { dragging = false; });
    slider.addEventListener('input', draw);
    window.addEventListener('resize', draw);
    draw();
  }
  window.setupSNPlot = setupSNPlot;
})();
