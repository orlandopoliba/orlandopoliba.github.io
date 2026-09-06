(function () {
  function setupNoInterfacesPlot() {
    const canvas = document.getElementById('noInterfacesCanvas');
    if (!canvas) return;

    const columns = 20;
    const rows = 6;
    let angles = [];

    function setTransitionAngle(theta) {
      const steps = Math.max(1, Math.ceil(Math.PI / Math.max(theta, 0.1)));
      const start = (columns - 1 - steps) / 2;
      angles = Array.from({ length: columns * rows }, (_, index) => {
        const column = Math.floor(index / rows);
        const fraction = Math.max(0, Math.min(1, (column - start) / steps));
        return -fraction * Math.PI;
      });
    }

    function draw() {
      const scale = window.devicePixelRatio || 1;
      const width = Math.min(900, canvas.parentElement.clientWidth || 900);
      const height = Math.min(300, width * rows / columns);
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const margin = 28;
      const step = Math.min((width - 2 * margin) / (columns - 1), (height - 2 * margin) / (rows - 1));
      const x0 = (width - step * (columns - 1)) / 2;
      const y0 = (height - step * (rows - 1)) / 2;
      const arrowLength = Math.min(18, step * 0.55);
      const headLength = Math.min(6, arrowLength * 0.35);

      for (let i = 0; i < columns; i++) for (let j = 0; j < rows; j++) {
        const x = x0 + i * step;
        const y = y0 + j * step;
        const angle = angles[i * rows + j];
        ctx.fillStyle = `hsl(${((angle * 180 / Math.PI) + 360) % 360} 75% 68%)`;
        ctx.fillRect(x - step / 2, y - step / 2, step, step);
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';
        ctx.lineWidth = 2;
        const dx = Math.cos(angle) * arrowLength / 2;
        const dy = Math.sin(angle) * arrowLength / 2;
        ctx.beginPath();
        ctx.moveTo(x - dx, y - dy);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
        const tipX = x + dx, tipY = y + dy;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - Math.cos(angle - Math.PI / 6) * headLength, tipY - Math.sin(angle - Math.PI / 6) * headLength);
        ctx.lineTo(tipX - Math.cos(angle + Math.PI / 6) * headLength, tipY - Math.sin(angle + Math.PI / 6) * headLength);
        ctx.closePath();
        ctx.fill();
      }
    }

    window.addEventListener('resize', draw);
    window.addEventListener('transition-angle-changed', (event) => {
      setTransitionAngle(event.detail.theta);
      draw();
    });
    setTransitionAngle(Math.PI);
    draw();
  }

  function setupTransitionAngleControl() {
    const canvas = document.getElementById('transitionAngleCanvas');
    const label = canvas && canvas.parentElement.querySelector('.angle-label');
    if (!canvas) return;
    let angle = Math.PI;
    let dragging = false;

    function draw() {
      const scale = window.devicePixelRatio || 1;
      const width = 560, height = 220;
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2, cy = 110, length = 68, head = 9;
      const arcRadius = length;

      ctx.strokeStyle = '#222';
      ctx.fillStyle = '#222';
      ctx.lineWidth = 2.5;
      function arrow(a) {
        const dx = Math.cos(a) * length;
        const dy = Math.sin(a) * length;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();
        const x = cx + dx, y = cy + dy;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - Math.cos(a - Math.PI / 6) * head, y - Math.sin(a - Math.PI / 6) * head);
        ctx.lineTo(x - Math.cos(a + Math.PI / 6) * head, y - Math.sin(a + Math.PI / 6) * head);
        ctx.closePath();
        ctx.fill();
      }
      arrow(0);
      arrow(-angle);

      // The arc shows the angle between the two vectors.
      ctx.beginPath();
      ctx.arc(cx, cy, arcRadius, -angle, 0);
      ctx.stroke();
      const labelRadius = arcRadius + 15;
      const labelAngle = -angle / 2;
      ctx.font = 'italic 24px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (label) {
        label.style.left = '50%';
        label.style.top = `${cy}px`;
        label.style.transform = `translate(${Math.cos(labelAngle) * labelRadius}px, ${Math.sin(labelAngle) * labelRadius}px) translate(-50%, -50%)`;
      }
    }

    function update(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - 110;
      // Restrict the second arrow to the lower half-plane, from 180° to 0°.
      const selectedAngle = Math.atan2(-y, x);
      if (selectedAngle < 0) {
        // Clockwise angles near 0° map to the minimum; those past 180° cap at π.
        angle = x >= 0 ? 0.01 : Math.PI;
      } else {
        angle = Math.max(0.01, Math.min(Math.PI, selectedAngle));
      }
      draw();
      window.dispatchEvent(new CustomEvent('transition-angle-changed', { detail: { theta: angle } }));
    }
    canvas.addEventListener('pointerdown', (event) => {
      dragging = true;
      canvas.setPointerCapture(event.pointerId);
      update(event);
    });
    canvas.addEventListener('pointermove', (event) => { if (dragging) update(event); });
    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointercancel', () => { dragging = false; });
    draw();
  }

  window.setupNoInterfacesPlot = setupNoInterfacesPlot;
  window.setupTransitionAngleControl = setupTransitionAngleControl;
})();
