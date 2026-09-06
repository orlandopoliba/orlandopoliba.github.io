(function () {
  const hue = (angle) =>
    `hsl(${((angle * 180 / Math.PI) % 360 + 360) % 360} 75% 68%)`;

  function setupStructureTheoremPlot() {
    const flatCanvas = document.getElementById('structure2dCanvas');
    const canvas = document.getElementById('structure3dCanvas');
    if (!flatCanvas || !canvas) return;

    const toggles = ['structureA', 'structureS', 'structureC']
      .map((id) => document.getElementById(id));
    let yaw = -0.65;
    let pitch = 0.48;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const enabled = () => toggles.map((toggle) => toggle && toggle.checked);
    const L = 0;

    // The height of the graph is the angular value divided by pi.  Keeping
    // this convention for both the graph and the vertical faces is important:
    // a full turn is then a height of 2.
    const value = (x, y) => {
      const flags = enabled();
      let angle = Math.atan2(y, x);
      if (angle < 0) angle += 2 * Math.PI;

      let z = flags[0] ? Math.PI / 2 * x : 0;
      const jumpAngle = (angle - L + 2 * Math.PI) % (2 * Math.PI);
      if (flags[1] && jumpAngle < Math.PI / 2) z += Math.PI / 2;
      if (flags[2] && Math.sin(angle - L) > 0) z += 2 * Math.PI;
      return z;
    };

    const resizeCanvas = (element) => {
      const ratio = window.devicePixelRatio || 1;
      const width = Math.min(240, element.parentElement.clientWidth || 240);
      element.width = width * ratio;
      element.height = width * ratio;
      element.style.width = `${width}px`;
      element.style.height = `${width}px`;
      return [width, ratio];
    };

    function draw2d() {
      const [width, ratio] = resizeCanvas(flatCanvas);
      const context = flatCanvas.getContext('2d');
      const centerX = width / 2;
      const centerY = width / 2;
      const radius = width * 0.38;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, width);

      for (let y = centerY - radius; y < centerY + radius; y += 2) {
        for (let x = centerX - radius; x < centerX + radius; x += 2) {
          const X = (x - centerX) / radius;
          const Y = (centerY - y) / radius;
          if (X * X + Y * Y <= 1) {
            context.fillStyle = hue(value(X, Y));
            context.fillRect(x, y, 2.2, 2.2);
          }
        }
      }

      context.strokeStyle = '#222';
      context.lineWidth = 3;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      context.stroke();

      // Show the supports of the singular parts in the 2D domain.  Match the
      // thickness of the domain boundary rather than changing the 3D plot.
      const flags = enabled();
      const pointOnDomain = (angle, distance) => [
        centerX + Math.cos(angle) * distance,
        centerY - Math.sin(angle) * distance
      ];
      context.lineWidth = 3;
      context.lineCap = 'round';
      if (flags[1]) {
        context.strokeStyle = '#000';
        for (const angle of [L, L + Math.PI / 2]) {
          const [x, y] = pointOnDomain(angle, radius);
          context.beginPath();
          context.moveTo(centerX, centerY);
          context.lineTo(x, y);
          context.stroke();
        }
      }
      if (flags[2]) {
        const [x0, y0] = pointOnDomain(L, -radius);
        const [x1, y1] = pointOnDomain(L, radius);
        context.strokeStyle = '#1677cc';
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
      }
      context.lineCap = 'butt';

      const spacing = Math.max(14, radius / 10);
      for (let j = -7; j <= 7; j++) {
        for (let i = -7; i <= 7; i++) {
          const x = centerX + i * spacing;
          const y = centerY + j * spacing;
          const X = (x - centerX) / radius;
          const Y = (centerY - y) / radius;
          if (X * X + Y * Y > 0.88 || X * X + Y * Y < 0.02) continue;

          const angle = value(X, Y);
          const dx = Math.cos(angle);
          const dy = -Math.sin(angle);
          const length = Math.min(12, spacing * 0.34);
          const tipX = x + dx * length;
          const tipY = y + dy * length;

          context.strokeStyle = 'rgba(0,0,0,.72)';
          context.lineWidth = 1.25;
          context.beginPath();
          context.moveTo(x - dx * length, y - dy * length);
          context.lineTo(tipX, tipY);
          context.stroke();
          context.fillStyle = '#222';
          context.beginPath();
          context.moveTo(tipX, tipY);
          context.lineTo(
            tipX - Math.cos(angle - 0.55) * 4,
            tipY + Math.sin(angle - 0.55) * 4
          );
          context.lineTo(
            tipX - Math.cos(angle + 0.55) * 4,
            tipY + Math.sin(angle + 0.55) * 4
          );
          context.fill();
        }
      }
    }

    function draw3d() {
      const [width, ratio] = resizeCanvas(canvas);
      const context = canvas.getContext('2d');
      const scale = width * 0.265;
      const centerX = width / 2;
      const centerY = width * 0.58;
      const flags = enabled();
      const faces = [];

      // U is the screen-horizontal coordinate, H is the horizontal depth
      // coordinate.  The latter must contain both X and Y.  The old code
      // used only Y here, which made faces swap front/back as yaw changed.
      const project = (X, Y, Z) => {
        const U = X * Math.cos(yaw) - Y * Math.sin(yaw);
        const H = X * Math.sin(yaw) + Y * Math.cos(yaw);
        return [
          centerX + U * scale,
          centerY - (Z * Math.cos(pitch) + H * Math.sin(pitch)) * scale
        ];
      };
      const depth = (X, Y, Z) => {
        const H = X * Math.sin(yaw) + Y * Math.cos(yaw);
        return H * Math.cos(pitch) - Z * Math.sin(pitch);
      };
      const addFace = (points, faceDepth, color, outline, opacity = 1) => {
        faces.push({ points, depth: faceDepth, color, outline, opacity });
      };

      // Clip graph tiles at every active jump/concentration support.  Without
      // this, a square crossing the 90-degree ray interpolates its two traces
      // and protrudes a little beyond the vertical wall.
      const pCoordinate = (X, Y) => X * Math.cos(L) + Y * Math.sin(L);
      const qCoordinate = (X, Y) => -X * Math.sin(L) + Y * Math.cos(L);
      const clipToHalfPlane = (polygon, coordinate, positive) => {
        const clipped = [];
        for (let i = 0; i < polygon.length; i++) {
          const previous = polygon[(i + polygon.length - 1) % polygon.length];
          const current = polygon[i];
          const previousDistance = coordinate(previous[0], previous[1]);
          const currentDistance = coordinate(current[0], current[1]);
          const previousInside = positive
            ? previousDistance >= -1e-10
            : previousDistance <= 1e-10;
          const currentInside = positive
            ? currentDistance >= -1e-10
            : currentDistance <= 1e-10;

          if (currentInside !== previousInside) {
            const denominator = previousDistance - currentDistance;
            const t = denominator ? previousDistance / denominator : 0;
            clipped.push([
              previous[0] + (current[0] - previous[0]) * t,
              previous[1] + (current[1] - previous[1]) * t
            ]);
          }
          if (currentInside) clipped.push(current);
        }
        return clipped;
      };
      const graphHeight = (X, Y, jumpBranch, concentrationBranch) =>
        (flags[0] ? Math.PI / 2 * X : 0) +
        (jumpBranch ? Math.PI / 2 : 0) +
        (concentrationBranch ? 2 * Math.PI : 0);
      const supportCoordinates = flags[1]
        ? [pCoordinate, qCoordinate]
        : (flags[2] ? [qCoordinate] : []);
      const regionCount = 1 << supportCoordinates.length;
      const addGraphFace = (polygon, X, Y, centerHeight, jumpBranch, concentrationBranch) => {
        // Copies one full turn above and below the principal graph.  They are
        // real 3D copies (rather than screen-space offsets), so their depth
        // remains correct while rotating the plot.
        for (const periodicOffset of [-2, 0, 2]) {
          const opacity = periodicOffset === 0 ? 1 : 0.18;
          addFace(
            polygon.map(([pointX, pointY]) => project(
              pointX,
              pointY,
              graphHeight(pointX, pointY, jumpBranch, concentrationBranch) / Math.PI + periodicOffset
            )),
            depth(X, Y, centerHeight + periodicOffset),
            hue(Math.PI * centerHeight),
            true,
            opacity
          );
        }
      };
      const addPeriodicWallFace = (worldPoints, X, Y, centerHeight) => {
        for (const periodicOffset of [-2, 0, 2]) {
          const opacity = periodicOffset === 0 ? 1 : 0.18;
          addFace(
            worldPoints.map(([pointX, pointY, pointZ]) =>
              project(pointX, pointY, pointZ + periodicOffset)
            ),
            depth(X, Y, centerHeight + periodicOffset),
            hue(Math.PI * (centerHeight + periodicOffset)),
            false,
            opacity
          );
        }
      };
      const N = 128;
      const M = 128;

      for (let j = 0; j < M; j++) {
        for (let i = 0; i < N; i++) {
          const x0 = -1 + 2 * i / N;
          const y0 = -1 + 2 * j / M;
          const x1 = -1 + 2 * (i + 1) / N;
          const y1 = -1 + 2 * (j + 1) / M;
          const square = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
          if (square.some(([X, Y]) => X * X + Y * Y > 1)) continue;

          for (let region = 0; region < regionCount; region++) {
            let polygon = square;
            for (let k = 0; k < supportCoordinates.length && polygon.length; k++) {
              polygon = clipToHalfPlane(
                polygon,
                supportCoordinates[k],
                Boolean(region & (1 << k))
              );
            }
            if (polygon.length < 3) continue;

            const X = polygon.reduce((sum, point) => sum + point[0], 0) / polygon.length;
            const Y = polygon.reduce((sum, point) => sum + point[1], 0) / polygon.length;
            const jumpBranch = flags[1] && pCoordinate(X, Y) >= 0 && qCoordinate(X, Y) >= 0;
            const concentrationBranch = flags[2] && qCoordinate(X, Y) >= 0;
            const centerHeight = graphHeight(X, Y, jumpBranch, concentrationBranch) / Math.PI;
            addGraphFace(
              polygon,
              X,
              Y,
              centerHeight,
              jumpBranch,
              concentrationBranch
            );
          }
        }
      }

      // The jump part has two radial supports.  Each is subdivided in both
      // directions so its transition is coloured, and so its depth can be
      // sorted with the graph rather than painted on top of it afterwards.
      if (flags[1]) {
        const radialSteps = 64;
        // Keep the colour-band size constant even when another component
        // makes the jump span more than one turn.
        const verticalStep = 0.5 / 24;
        const sideEpsilon = 1e-6;

        // A jump wall must join the two traces of the graph.  Its height is
        // therefore not constant: with the a-part enabled, for example, the
        // wall on the x-axis starts at s / 2 and ends at s / 2 + 1 / 2.
        const traces = (s, angle) => {
          // Use a tiny radial probe at the origin, where atan2(0, 0) has no
          // meaningful side from which to evaluate the two traces.
          const probe = s || 1e-8;
          const before = value(
            probe * Math.cos(angle - sideEpsilon),
            probe * Math.sin(angle - sideEpsilon)
          ) / Math.PI;
          const after = value(
            probe * Math.cos(angle + sideEpsilon),
            probe * Math.sin(angle + sideEpsilon)
          ) / Math.PI;
          return [Math.min(before, after), Math.max(before, after)];
        };

        for (const angle of [L, L + Math.PI / 2]) {
          const ux = Math.abs(Math.cos(angle)) < 1e-12 ? 0 : Math.cos(angle);
          const uy = Math.abs(Math.sin(angle)) < 1e-12 ? 0 : Math.sin(angle);
          for (let i = 0; i < radialSteps; i++) {
            const s0 = i / radialSteps;
            const s1 = (i + 1) / radialSteps;
            const [low0, high0] = traces(s0, angle);
            const [low1, high1] = traces(s1, angle);
            const heightSteps = Math.max(
              1,
              Math.ceil(Math.max(high0 - low0, high1 - low1) / verticalStep)
            );
            for (let j = 0; j < heightSteps; j++) {
              const t0 = j / heightSteps;
              const t1 = (j + 1) / heightSteps;
              const z00 = low0 + (high0 - low0) * t0;
              const z01 = low1 + (high1 - low1) * t0;
              const z10 = low1 + (high1 - low1) * t1;
              const z11 = low0 + (high0 - low0) * t1;
              const z = (z00 + z01 + z10 + z11) / 4;
              const s = (s0 + s1) / 2;
              addPeriodicWallFace(
                [
                  [s0 * ux, s0 * uy, z00],
                  [s1 * ux, s1 * uy, z01],
                  [s1 * ux, s1 * uy, z10],
                  [s0 * ux, s0 * uy, z11]
                ],
                s * ux,
                s * uy,
                z
              );
            }
          }
        }
      }

      // The concentration part is a full-turn vertical wall over its
      // diameter.  It belongs to the same depth-sorted list as every other
      // face; drawing it after the graph was the source of the incorrect
      // occlusion when the plot was rotated.
      if (flags[2]) {
        const ux = Math.abs(Math.cos(L)) < 1e-12 ? 0 : Math.cos(L);
        const uy = Math.abs(Math.sin(L)) < 1e-12 ? 0 : Math.sin(L);
        const radialSteps = 64;
        // The right half can be taller when j is enabled as well.  Subdivide
        // according to the physical height rather than using 32 strips for
        // both halves.
        const verticalStep = 2 / 32;
        const sideEpsilon = 1e-6;
        const traces = (s) => {
          // As with the jump walls, use the two one-sided traces of the
          // graph.  This makes the wall follow the a-part instead of starting
          // at height zero everywhere.
          const probe = s || 1e-8;
          const before = value(
            probe * Math.cos(L - sideEpsilon),
            probe * Math.sin(L - sideEpsilon)
          ) / Math.PI;
          const after = value(
            probe * Math.cos(L + sideEpsilon),
            probe * Math.sin(L + sideEpsilon)
          ) / Math.PI;
          return [Math.min(before, after), Math.max(before, after)];
        };

        for (let i = 0; i < radialSteps; i++) {
          const s0 = -1 + 2 * i / radialSteps;
          const s1 = -1 + 2 * (i + 1) / radialSteps;
          const [low0, high0] = traces(s0);
          const [low1, high1] = traces(s1);
          const heightSteps = Math.max(
            1,
            Math.ceil(Math.max(high0 - low0, high1 - low1) / verticalStep)
          );
          for (let j = 0; j < heightSteps; j++) {
            const t0 = j / heightSteps;
            const t1 = (j + 1) / heightSteps;
            const z00 = low0 + (high0 - low0) * t0;
            const z01 = low1 + (high1 - low1) * t0;
            const z10 = low1 + (high1 - low1) * t1;
            const z11 = low0 + (high0 - low0) * t1;
            const z = (z00 + z01 + z10 + z11) / 4;
            const s = (s0 + s1) / 2;
            addPeriodicWallFace(
              [
                [s0 * ux, s0 * uy, z00],
                [s1 * ux, s1 * uy, z01],
                [s1 * ux, s1 * uy, z10],
                [s0 * ux, s0 * uy, z11]
              ],
              s * ux,
              s * uy,
              z
            );
          }
        }
      }

      // Draw the boundary as depth-sorted geometry too.  The rear half is
      // naturally hidden by the graph, while the front half remains visible.
      const boundarySteps = 96;
      for (let i = 0; i < boundarySteps; i++) {
        const a = i * 2 * Math.PI / boundarySteps;
        const b = (i + 1) * 2 * Math.PI / boundarySteps;
        const mid = (a + b) / 2;
        addFace(
          [project(Math.cos(a), Math.sin(a), 0), project(Math.cos(b), Math.sin(b), 0)],
          depth(Math.cos(mid), Math.sin(mid), 0),
          '#333',
          false
        );
      }

      // With the depth coordinate above, larger values are farther from the
      // viewer (the same convention as the orthographic projection).  Every
      // wall and graph tile is sorted together before it is painted.
      faces.sort((a, b) => b.depth - a.depth);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, width);
      context.globalAlpha = 1;
      context.lineJoin = 'round';

      for (const face of faces) {
        context.globalAlpha = face.opacity;
        context.beginPath();
        context.moveTo(face.points[0][0], face.points[0][1]);
        for (let i = 1; i < face.points.length; i++) {
          context.lineTo(face.points[i][0], face.points[i][1]);
        }
        if (face.points.length > 2) {
          context.closePath();
          context.fillStyle = face.color;
          context.fill();
          if (face.outline) {
            context.strokeStyle = 'rgba(40,40,40,.15)';
            context.lineWidth = 0.4;
            context.stroke();
          }
        } else {
          context.strokeStyle = face.color;
          context.lineWidth = 3;
          context.stroke();
        }
      }
      context.globalAlpha = 1;
    }

    const redraw = () => {
      draw2d();
      draw3d();
    };
    toggles.forEach((toggle) => toggle && toggle.addEventListener('change', redraw));
    canvas.addEventListener('pointerdown', (event) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      yaw += (event.clientX - lastX) * 0.01;
      pitch = Math.max(-0.9, Math.min(1.3, pitch + (event.clientY - lastY) * 0.01));
      lastX = event.clientX;
      lastY = event.clientY;
      draw3d();
    });
    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointercancel', () => { dragging = false; });
    window.addEventListener('resize', redraw);
    redraw();
  }

  window.setupStructureTheoremPlot = setupStructureTheoremPlot;
})();
