(function () {
  const TWO_PI = 2 * Math.PI;
  const CLOCK_STATES = 16;
  const hue = (angle) =>
    `hsl(${((angle * 180 / Math.PI) % 360 + 360) % 360} 75% 68%)`;

  const normalizeAngle = (angle) => {
    const normalized = angle % TWO_PI;
    return normalized < 0 ? normalized + TWO_PI : normalized;
  };

  // The representative is in (-pi, pi]; in particular, -pi is represented
  // by +pi. This is the convention used to construct the lifting below.
  const principalDifference = (to, from) => {
    let difference = (to - from) % TWO_PI;
    if (difference <= -Math.PI) difference += TWO_PI;
    if (difference > Math.PI) difference -= TWO_PI;
    return difference;
  };

  function setupPiecewiseGraphPlot() {
    const control = document.getElementById('piecewiseGraphControlCanvas');
    const graph = document.getElementById('piecewiseGraph3dCanvas');
    if (!control || !graph) return;

    // Quadrants are ordered counter-clockwise: I, II, III, IV. Initially all
    // four arrows point in the direction (1, 0).
    const angles = [0, 0, 0, 0];
    let activeQuadrant = -1;
    let controlGeometry = null;
    let yaw = -0.65;
    let pitch = 0.48;
    let rotating = false;
    let lastX = 0;
    let lastY = 0;

    const resizeSquareCanvas = (canvas, maximum) => {
      const ratio = window.devicePixelRatio || 1;
      const width = Math.min(maximum, canvas.parentElement.clientWidth || maximum);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(width * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${width}px`;
      return [width, ratio];
    };

    const drawCenteredArrow = (context, x, y, angle, length, headSize) => {
      const dx = Math.cos(angle);
      const dy = -Math.sin(angle);
      const tailX = x - dx * length / 2;
      const tailY = y - dy * length / 2;
      const tipX = x + dx * length / 2;
      const tipY = y + dy * length / 2;

      context.strokeStyle = '#222';
      context.fillStyle = '#222';
      context.lineWidth = 4;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(tipX, tipY);
      context.stroke();

      const screenAngle = -angle;
      context.beginPath();
      context.moveTo(tipX, tipY);
      context.lineTo(
        tipX - Math.cos(screenAngle - 0.52) * headSize,
        tipY - Math.sin(screenAngle - 0.52) * headSize
      );
      context.lineTo(
        tipX - Math.cos(screenAngle + 0.52) * headSize,
        tipY - Math.sin(screenAngle + 0.52) * headSize
      );
      context.closePath();
      context.fill();

      context.lineCap = 'butt';
    };

    function drawControl() {
      const [width, ratio] = resizeSquareCanvas(control, 350);
      const context = control.getContext('2d');
      const inset = Math.max(8, width * 0.045);
      const size = width - 2 * inset;
      const half = size / 2;
      const centers = [
        [inset + 3 * size / 4, inset + size / 4],
        [inset + size / 4, inset + size / 4],
        [inset + size / 4, inset + 3 * size / 4],
        [inset + 3 * size / 4, inset + 3 * size / 4]
      ];
      controlGeometry = { inset, size, centers };

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, width);

      context.fillStyle = hue(angles[1]);
      context.fillRect(inset, inset, half, half);
      context.fillStyle = hue(angles[0]);
      context.fillRect(inset + half, inset, half, half);
      context.fillStyle = hue(angles[2]);
      context.fillRect(inset, inset + half, half, half);
      context.fillStyle = hue(angles[3]);
      context.fillRect(inset + half, inset + half, half, half);

      context.strokeStyle = '#222';
      context.lineWidth = 3;
      context.strokeRect(inset, inset, size, size);
      context.beginPath();
      context.moveTo(inset + half, inset);
      context.lineTo(inset + half, inset + size);
      context.moveTo(inset, inset + half);
      context.lineTo(inset + size, inset + half);
      context.stroke();

      const arrowLength = half * 0.54;
      centers.forEach(([x, y], index) => {
        drawCenteredArrow(
          context,
          x,
          y,
          angles[index],
          arrowLength,
          Math.max(9, width * 0.033)
        );
      });
    }

    const liftedAngles = () => {
      const values = [normalizeAngle(angles[0])];
      const differences = [];
      for (let index = 0; index < 3; index++) {
        const difference = principalDifference(angles[index + 1], angles[index]);
        differences.push(difference);
        values.push(values[index] + difference);
      }
      differences.push(principalDifference(angles[0], angles[3]));
      return { values, differences };
    };

    function draw3d() {
      const [width, ratio] = resizeSquareCanvas(graph, 370);
      const context = graph.getContext('2d');
      const scale = width * 0.245;
      const centerX = width / 2;
      const centerY = width * 0.54;
      const { values, differences } = liftedAngles();
      const heights = values.map((angle) => angle / Math.PI);
      const closingHeight = (values[3] + differences[3]) / Math.PI;
      const visibleHeights = heights.concat(closingHeight);
      const heightCenter = (
        Math.min(...visibleHeights) + Math.max(...visibleHeights)
      ) / 2;
      const faces = [];

      const project = (X, Y, Z) => {
        const U = X * Math.cos(yaw) - Y * Math.sin(yaw);
        const H = X * Math.sin(yaw) + Y * Math.cos(yaw);
        return [
          centerX + U * scale,
          centerY - ((Z - heightCenter) * Math.cos(pitch) + H * Math.sin(pitch)) * scale
        ];
      };
      const depth = (X, Y, Z) => {
        const H = X * Math.sin(yaw) + Y * Math.cos(yaw);
        return H * Math.cos(pitch) - (Z - heightCenter) * Math.sin(pitch);
      };
      const addFace = (worldPoints, X, Y, Z, color, outline, opacity, lineWidth) => {
        faces.push({
          points: worldPoints.map(([pointX, pointY, pointZ]) =>
            project(pointX, pointY, pointZ)
          ),
          depth: depth(X, Y, Z),
          color,
          outline,
          opacity,
          lineWidth
        });
      };

      const quadrantAt = (X, Y) => {
        if (Y >= 0) return X >= 0 ? 0 : 1;
        return X < 0 ? 2 : 3;
      };

      // Tile each constant sheet so it interleaves correctly with the walls
      // while the graph is rotated. As in the structure-theorem plot, faded
      // copies one full turn above and below show that angles are periodic.
      const tileCount = 24;
      for (let row = 0; row < tileCount; row++) {
        for (let column = 0; column < tileCount; column++) {
          const x0 = -1 + 2 * column / tileCount;
          const x1 = -1 + 2 * (column + 1) / tileCount;
          const y0 = -1 + 2 * row / tileCount;
          const y1 = -1 + 2 * (row + 1) / tileCount;
          const X = (x0 + x1) / 2;
          const Y = (y0 + y1) / 2;
          const quadrant = quadrantAt(X, Y);
          const baseHeight = heights[quadrant];

          for (const periodicOffset of [-2, 0, 2]) {
            const Z = baseHeight + periodicOffset;
            addFace(
              [[x0, y0, Z], [x1, y0, Z], [x1, y1, Z], [x0, y1, Z]],
              X,
              Y,
              Z,
              hue(values[quadrant]),
              true,
              periodicOffset === 0 ? 1 : 0.18,
              0.45
            );
          }
        }
      }

      // Interfaces are traversed I -> II -> III -> IV -> I. The last wall
      // ends on the appropriate periodic copy of quadrant I; this exposes a
      // non-zero winding without changing the chosen four lifted values.
      const interfaces = [
        { from: 0, segment: [[0, 0], [0, 1]] },
        { from: 1, segment: [[0, 0], [-1, 0]] },
        { from: 2, segment: [[0, 0], [0, -1]] },
        { from: 3, segment: [[0, 0], [1, 0]] }
      ];
      const horizontalSteps = 18;
      const targetVerticalStep = 1 / 28;

      interfaces.forEach(({ from, segment }, interfaceIndex) => {
        const startAngle = values[from];
        const angleDifference = differences[interfaceIndex];
        const startHeight = startAngle / Math.PI;
        const endHeight = (startAngle + angleDifference) / Math.PI;
        const verticalSteps = Math.max(
          1,
          Math.ceil(Math.abs(endHeight - startHeight) / targetVerticalStep)
        );

        for (let along = 0; along < horizontalSteps; along++) {
          const s0 = along / horizontalSteps;
          const s1 = (along + 1) / horizontalSteps;
          const x0 = segment[0][0] + (segment[1][0] - segment[0][0]) * s0;
          const y0 = segment[0][1] + (segment[1][1] - segment[0][1]) * s0;
          const x1 = segment[0][0] + (segment[1][0] - segment[0][0]) * s1;
          const y1 = segment[0][1] + (segment[1][1] - segment[0][1]) * s1;

          for (let vertical = 0; vertical < verticalSteps; vertical++) {
            const t0 = vertical / verticalSteps;
            const t1 = (vertical + 1) / verticalSteps;
            const z0 = startHeight + (endHeight - startHeight) * t0;
            const z1 = startHeight + (endHeight - startHeight) * t1;
            const middleAngle = startAngle + angleDifference * (t0 + t1) / 2;

            for (const periodicOffset of [-2, 0, 2]) {
              const middleZ = (z0 + z1) / 2 + periodicOffset;
              addFace(
                [
                  [x0, y0, z0 + periodicOffset],
                  [x1, y1, z0 + periodicOffset],
                  [x1, y1, z1 + periodicOffset],
                  [x0, y0, z1 + periodicOffset]
                ],
                (x0 + x1) / 2,
                (y0 + y1) / 2,
                middleZ,
                hue(middleAngle),
                false,
                periodicOffset === 0 ? 1 : 0.18,
                0
              );
            }
          }
        }
      });

      // The square and its quadrant division are shown in the xy-plane.
      const baseLines = [
        [[-1, -1], [1, -1]],
        [[1, -1], [1, 1]],
        [[1, 1], [-1, 1]],
        [[-1, 1], [-1, -1]],
        [[-1, 0], [1, 0]],
        [[0, -1], [0, 1]]
      ];
      baseLines.forEach(([start, end], lineIndex) => {
        const steps = lineIndex < 4 ? 16 : 24;
        for (let index = 0; index < steps; index++) {
          const t0 = index / steps;
          const t1 = (index + 1) / steps;
          const x0 = start[0] + (end[0] - start[0]) * t0;
          const y0 = start[1] + (end[1] - start[1]) * t0;
          const x1 = start[0] + (end[0] - start[0]) * t1;
          const y1 = start[1] + (end[1] - start[1]) * t1;
          addFace(
            [[x0, y0, 0], [x1, y1, 0]],
            (x0 + x1) / 2,
            (y0 + y1) / 2,
            0,
            lineIndex < 4 ? '#333' : 'rgba(40,40,40,.72)',
            false,
            1,
            lineIndex < 4 ? 3 : 2
          );
        }
      });

      faces.sort((a, b) => b.depth - a.depth);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, width);
      context.lineJoin = 'round';

      faces.forEach((face) => {
        context.globalAlpha = face.opacity;
        context.beginPath();
        context.moveTo(face.points[0][0], face.points[0][1]);
        for (let index = 1; index < face.points.length; index++) {
          context.lineTo(face.points[index][0], face.points[index][1]);
        }
        if (face.points.length > 2) {
          context.closePath();
          context.fillStyle = face.color;
          context.fill();
          if (face.outline) {
            context.strokeStyle = 'rgba(40,40,40,.15)';
            context.lineWidth = face.lineWidth;
            context.stroke();
          }
        } else {
          context.strokeStyle = face.color;
          context.lineWidth = face.lineWidth;
          context.stroke();
        }
      });
      context.globalAlpha = 1;
    }

    const updateAngle = (event) => {
      if (activeQuadrant < 0 || !controlGeometry) return;
      const bounds = control.getBoundingClientRect();
      const scaleX = control.clientWidth / bounds.width;
      const scaleY = control.clientHeight / bounds.height;
      const pointerX = (event.clientX - bounds.left) * scaleX;
      const pointerY = (event.clientY - bounds.top) * scaleY;
      const [centerX, centerY] = controlGeometry.centers[activeQuadrant];
      const dx = pointerX - centerX;
      const dy = centerY - pointerY;
      if (Math.hypot(dx, dy) < 2) return;

      const pointerAngle = normalizeAngle(Math.atan2(dy, dx));
      const clockStep = TWO_PI / CLOCK_STATES;
      angles[activeQuadrant] = normalizeAngle(
        Math.round(pointerAngle / clockStep) * clockStep
      );
      drawControl();
      draw3d();
    };

    control.addEventListener('pointerdown', (event) => {
      if (!controlGeometry) return;
      const bounds = control.getBoundingClientRect();
      const x = (event.clientX - bounds.left) * control.clientWidth / bounds.width;
      const y = (event.clientY - bounds.top) * control.clientHeight / bounds.height;
      const { inset, size } = controlGeometry;
      if (x < inset || x > inset + size || y < inset || y > inset + size) return;

      const right = x >= inset + size / 2;
      const bottom = y >= inset + size / 2;
      activeQuadrant = bottom ? (right ? 3 : 2) : (right ? 0 : 1);
      control.setPointerCapture(event.pointerId);
      updateAngle(event);
    });
    control.addEventListener('pointermove', (event) => {
      if (activeQuadrant >= 0) updateAngle(event);
    });
    const releaseControl = () => {
      activeQuadrant = -1;
      drawControl();
    };
    control.addEventListener('pointerup', releaseControl);
    control.addEventListener('pointercancel', releaseControl);

    graph.addEventListener('pointerdown', (event) => {
      rotating = true;
      lastX = event.clientX;
      lastY = event.clientY;
      graph.setPointerCapture(event.pointerId);
    });
    graph.addEventListener('pointermove', (event) => {
      if (!rotating) return;
      yaw += (event.clientX - lastX) * 0.01;
      pitch = Math.max(-0.9, Math.min(1.3, pitch + (event.clientY - lastY) * 0.01));
      lastX = event.clientX;
      lastY = event.clientY;
      draw3d();
    });
    graph.addEventListener('pointerup', () => { rotating = false; });
    graph.addEventListener('pointercancel', () => { rotating = false; });

    const redraw = () => {
      drawControl();
      draw3d();
    };
    window.addEventListener('resize', redraw);
    redraw();
  }

  window.setupPiecewiseGraphPlot = setupPiecewiseGraphPlot;
})();
