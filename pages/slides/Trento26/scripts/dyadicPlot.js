(function () {
  function setupDyadicPlot() {
    const host = document.querySelector('.dyadicPlot');
    const canvas = document.getElementById('dyadicCanvas');
    const slider = document.getElementById('dyadicSlider');
    if (!host || !canvas || !slider) return;

    const TAU = 2 * Math.PI;

    // A smaller clock angle makes the epsilon-grid in the core visible. In
    // the actual construction s = epsilon/theta_epsilon; only ratios matter
    // in this scale-free drawing.
    const numberOfDirections = 32;
    const thetaEpsilon = TAU / numberOfDirections;
    const s = 1;
    const epsilon = s * thetaEpsilon;
    // The core occupies the central 2-by-2 block of the first dyadic grid.
    // Consequently every visible component of every layer is a full square.
    const coreHalfSize = 2 * s;

    // There are three dyadic layers outside the fine core. The last cell size
    // is 8s and the outer square has side 32s, hence exactly four last-layer
    // cells fit along each side.
    const lastLayer = 3;
    const outerHalfSize = 2 ** (lastLayer + 1) * s;

    const clockProjection = angle =>
      Math.round(angle / thetaEpsilon) * thetaEpsilon;

    const phaseColor = angle => {
      const degrees = ((angle * 180 / Math.PI) % 360 + 360) % 360;
      return `hsl(${degrees} 75% 68%)`;
    };

    function fillCell(context, mapX, mapY, x, y, side) {
      const centerX = x + side / 2;
      const centerY = y + side / 2;
      const phase = clockProjection(Math.atan2(centerY, centerX));
      context.fillStyle = phaseColor(phase);
      const left = mapX(x);
      const right = mapX(x + side);
      const top = mapY(y + side);
      const bottom = mapY(y);
      context.fillRect(left, top, right - left + 0.15, bottom - top + 0.15);
    }

    function drawSquareGrid(context, mapX, mapY, halfSize, cellSize, lineWidth) {
      const minimum = -halfSize;
      const cells = Math.round(2 * halfSize / cellSize);
      for (let row = 0; row < cells; row++) {
        for (let column = 0; column < cells; column++) {
          fillCell(
            context,
            mapX,
            mapY,
            minimum + column * cellSize,
            minimum + row * cellSize,
            cellSize
          );
        }
      }

      context.strokeStyle = 'rgba(25, 25, 25, .42)';
      context.lineWidth = lineWidth;
      for (let index = 0; index <= cells; index++) {
        const coordinate = minimum + index * cellSize;
        context.beginPath();
        context.moveTo(mapX(coordinate), mapY(-halfSize));
        context.lineTo(mapX(coordinate), mapY(halfSize));
        context.stroke();
        context.beginPath();
        context.moveTo(mapX(-halfSize), mapY(coordinate));
        context.lineTo(mapX(halfSize), mapY(coordinate));
        context.stroke();
      }
    }

    function drawFineCore(context, mapX, mapY, halfSize) {
      context.save();
      context.beginPath();
      context.rect(
        mapX(-halfSize),
        mapY(halfSize),
        mapX(halfSize) - mapX(-halfSize),
        mapY(-halfSize) - mapY(halfSize)
      );
      context.clip();

      // Keep the epsilon lattice anchored at the origin. Since the core size
      // need not be an integer multiple of epsilon, its boundary can cut the
      // outermost lattice squares, as in the discrete construction.
      const first = Math.floor(-halfSize / epsilon);
      const last = Math.ceil(halfSize / epsilon);
      for (let row = first; row < last; row++) {
        for (let column = first; column < last; column++) {
          fillCell(context, mapX, mapY, column * epsilon, row * epsilon, epsilon);
        }
      }

      context.strokeStyle = 'rgba(25, 25, 25, .34)';
      context.lineWidth = 0.45;
      for (let index = first; index <= last; index++) {
        const coordinate = index * epsilon;
        context.beginPath();
        context.moveTo(mapX(coordinate), mapY(-halfSize));
        context.lineTo(mapX(coordinate), mapY(halfSize));
        context.stroke();
        context.beginPath();
        context.moveTo(mapX(-halfSize), mapY(coordinate));
        context.lineTo(mapX(halfSize), mapY(coordinate));
        context.stroke();
      }
      context.restore();
    }

    function outlineSquare(context, mapX, mapY, halfSize, lineWidth) {
      context.strokeStyle = '#222';
      context.lineWidth = lineWidth;
      context.strokeRect(
        mapX(-halfSize),
        mapY(halfSize),
        mapX(halfSize) - mapX(-halfSize),
        mapY(-halfSize) - mapY(halfSize)
      );
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const availableWidth = host.clientWidth || 420;
      const size = Math.min(280, availableWidth);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const context = canvas.getContext('2d');
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, size, size);

      const margin = 3;
      const plotSize = size - 2 * margin;
      const scale = plotSize / (2 * outerHalfSize);
      const mapX = x => margin + plotSize / 2 + x * scale;
      const mapY = y => margin + plotSize / 2 - y * scale;

      // Add layers from the outside towards the origin. The unresolved inner
      // square remains on the epsilon lattice until the next slider step.
      const visibleLayers = Number(slider.value);
      const innermostVisibleLayer = lastLayer - visibleLayers + 1;
      for (let layer = lastLayer; layer >= innermostVisibleLayer; layer--) {
        const cellSize = 2 ** layer * s;
        const halfSize = 2 * cellSize;
        drawSquareGrid(context, mapX, mapY, halfSize, cellSize, 0.8);
      }
      const fineHalfSize = visibleLayers === 0
        ? outerHalfSize
        : Math.max(coreHalfSize, 2 ** innermostVisibleLayer * s);
      drawFineCore(context, mapX, mapY, fineHalfSize);

      // Draw only interfaces belonging to layers that have already appeared.
      for (let layer = lastLayer; layer >= innermostVisibleLayer; layer--) {
        outlineSquare(context, mapX, mapY, 2 ** layer * s, 1.35);
      }
      outlineSquare(context, mapX, mapY, outerHalfSize, 2.2);

      slider.setAttribute('aria-valuetext', `${visibleLayers} dyadic layers`);
      context.fillStyle = '#222';
      context.beginPath();
      context.arc(mapX(0), mapY(0), 2.1, 0, TAU);
      context.fill();
    }

    slider.addEventListener('input', draw);
    window.addEventListener('resize', draw);
    draw();
  }

  window.setupDyadicPlot = setupDyadicPlot;
})();
