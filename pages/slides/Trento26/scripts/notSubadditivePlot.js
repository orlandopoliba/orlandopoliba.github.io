(function () {
  function setupNotSubadditivePlot() {
    const canvas = document.getElementById('notSubadditiveCanvas');
    const diskToggle = document.getElementById('notSubadditiveBR');
    const annulusToggle = document.getElementById('notSubadditiveAnnulus');
    if (!canvas || !diskToggle || !annulusToggle) return;

    const innerRadius = 1 / 4;
    const middleRadius = 1 / 2;
    const quietOpacity = 0.3;
    const activeOpacity = 0.8;
    const hueSamples = 720;

    // Use the same S1 phase palette as the preceding plots.
    const phaseColors = Array.from({ length: hueSamples }, (_, index) => {
      const hue = index / hueSamples;
      const saturation = 0.75;
      const lightness = 0.68;
      const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
      const sector = hue * 6;
      const secondary = chroma * (1 - Math.abs(sector % 2 - 1));
      let red = 0, green = 0, blue = 0;
      if (sector < 1) [red, green, blue] = [chroma, secondary, 0];
      else if (sector < 2) [red, green, blue] = [secondary, chroma, 0];
      else if (sector < 3) [red, green, blue] = [0, chroma, secondary];
      else if (sector < 4) [red, green, blue] = [0, secondary, chroma];
      else if (sector < 5) [red, green, blue] = [secondary, 0, chroma];
      else [red, green, blue] = [chroma, 0, secondary];
      const offset = lightness - chroma / 2;
      return [red, green, blue].map(channel => Math.round((channel + offset) * 255));
    });

    const drawDiskLabel = (ctx, subscript, x, y) => {
      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,.9)';
      ctx.fillStyle = '#222';
      ctx.lineWidth = 4;
      ctx.font = 'italic 17px "Times New Roman", serif';
      ctx.strokeText('B', x, y);
      ctx.fillText('B', x, y);
      const offset = ctx.measureText('B').width;
      ctx.font = 'italic 11px "Times New Roman", serif';
      ctx.strokeText(subscript, x + offset, y + 4);
      ctx.fillText(subscript, x + offset, y + 4);
      ctx.restore();
    };

    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const size = Math.min(310, canvas.parentElement.clientWidth || 310);
      const pixelSize = Math.max(1, Math.round(size * dpr));
      canvas.width = pixelSize;
      canvas.height = pixelSize;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, pixelSize, pixelSize);

      const center = pixelSize / 2;
      const radius = pixelSize * 0.42;
      const image = ctx.createImageData(pixelSize, pixelSize);
      const data = image.data;
      const diskOn = diskToggle.checked;
      const annulusOn = annulusToggle.checked;

      for (let py = 0; py < pixelSize; py++) {
        const dy = py + 0.5 - center;
        for (let px = 0; px < pixelSize; px++) {
          const dx = px + 0.5 - center;
          const relativeRadius = Math.hypot(dx, dy) / radius;
          if (relativeRadius > 1) continue;

          let activeLayers = 0;
          if (diskOn && relativeRadius <= middleRadius) activeLayers++;
          if (annulusOn && relativeRadius >= innerRadius) activeLayers++;
          const opacity = activeLayers > 1 ? 1 : activeLayers === 1 ? activeOpacity : quietOpacity;

          let phase = Math.atan2(-dy, dx) / (2 * Math.PI);
          if (phase < 0) phase += 1;
          const color = phaseColors[Math.floor(phase * hueSamples) % hueSamples];
          const offset = (py * pixelSize + px) * 4;
          data[offset] = color[0];
          data[offset + 1] = color[1];
          data[offset + 2] = color[2];
          data[offset + 3] = Math.round(opacity * 255);
        }
      }
      ctx.putImageData(image, 0, 0);

      // All geometry below is expressed in CSS pixels.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cssCenter = size / 2;
      const cssRadius = size * 0.42;

      if (diskOn) {
        const cutRadius = annulusOn ? cssRadius : cssRadius * middleRadius;
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cssCenter, cssCenter);
        ctx.lineTo(cssCenter + cutRadius, cssCenter);
        ctx.stroke();
      }

      ctx.strokeStyle = '#222';
      [
        { radius: cssRadius, width: 2.5 },
        { radius: cssRadius * middleRadius, width: 1.7 },
        { radius: cssRadius * innerRadius, width: 1.7 },
      ].forEach(circle => {
        ctx.lineWidth = circle.width;
        ctx.beginPath();
        ctx.arc(cssCenter, cssCenter, circle.radius, 0, 2 * Math.PI);
        ctx.stroke();
      });

      drawDiskLabel(ctx, 'r', cssCenter + cssRadius * 0.25, cssCenter - cssRadius * 0.14);
      drawDiskLabel(ctx, 'R', cssCenter + cssRadius * 0.5, cssCenter - cssRadius * 0.27);
      drawDiskLabel(ctx, '1', cssCenter + cssRadius * 1, cssCenter - cssRadius * 0.45);
    };

    // The plot always starts with both sets inactive, independently of form
    // state restored by the browser on reload.
    diskToggle.checked = false;
    annulusToggle.checked = false;
    diskToggle.addEventListener('change', draw);
    annulusToggle.addEventListener('change', draw);
    window.addEventListener('resize', draw);
    draw();
  }

  window.setupNotSubadditivePlot = setupNotSubadditivePlot;
})();
