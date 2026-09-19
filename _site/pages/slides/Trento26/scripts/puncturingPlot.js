(function () {
  function setupPuncturingPlot() {
    const canvas = document.getElementById('puncturingCanvas');
    if (!canvas) return;
    const degreeInputs = document.querySelectorAll('input[name="puncturing-degree"]');
    const vortices = [];
    let currentPath;
    let plotWidth = 0;
    let plotHeight = 0;

    const hue = angle => {
      const degrees = (angle * 180 / Math.PI) % 360;
      return `hsl(${(degrees + 360) % 360} 75% 68%)`;
    };
    const vortexColor = degree => degree > 0 ? '#d7191c' : '#2166ac';

    // Keep the boundary points alongside the Path2D. They are used to find
    // the shortest boundary connection for an unpaired vortex.
    const makeOmega = (width, height) => {
      const cx = width / 2, cy = height / 2;
      const points = [
        [cx - width * .29, cy + height * .17],
        [cx - width * .42, cy + height * .02, cx - width * .35, cy - height * .25, cx - width * .12, cy - height * .29],
        [cx + width * .10, cy - height * .34, cx + width * .35, cy - height * .23, cx + width * .38, cy - height * .02],
        [cx + width * .42, cy + height * .20, cx + width * .22, cy + height * .31, cx - width * .02, cy + height * .29],
        [cx - width * .16, cy + height * .28, cx - width * .25, cy + height * .25, cx - width * .29, cy + height * .17]
      ];
      const path = new Path2D();
      path.moveTo(...points[0]);
      points.slice(1).forEach(segment => path.bezierCurveTo(...segment));
      path.closePath();

      const boundary = [];
      const cubic = (p0, p1, p2, p3, t) => {
        const s = 1 - t;
        return {
          x: s ** 3 * p0[0] + 3 * s ** 2 * t * p1[0] + 3 * s * t ** 2 * p2[0] + t ** 3 * p3[0],
          y: s ** 3 * p0[1] + 3 * s ** 2 * t * p1[1] + 3 * s * t ** 2 * p2[1] + t ** 3 * p3[1]
        };
      };
      for (let segment = 0; segment < points.length - 1; segment++) {
        // Each segment is [control1, control2, end].  In particular, the
        // next segment starts at indices 4 and 5 (not 3 and 4).  Using a
        // control coordinate here produced sampled "boundary" points in the
        // interior, so otherwise-valid cuts could stop before reaching ∂Ω.
        const p0 = segment === 0 ? points[0] : points[segment].slice(4, 6);
        const p1 = points[segment + 1].slice(0, 2);
        const p2 = points[segment + 1].slice(2, 4);
        const p3 = points[segment + 1].slice(4, 6);
        // A dense sampling keeps the chosen endpoint on the visible curve,
        // even when a vortex is very close to the boundary.
        for (let i = 0; i < 256; i++) boundary.push(cubic(p0, p1, p2, p3, i / 256));
      }
      return { path, boundary };
    };

    const point = vortex => ({ x: vortex.x * plotWidth, y: vortex.y * plotHeight });
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    const pathLength = path => path.slice(1).reduce(
      (total, item, index) => total + distance(path[index], item), 0
    );

    const shortestConnections = (boundary, ctx, domain) => {
      const n = vortices.length;
      if (!n) return [];
      const positions = vortices.map(point);

      // A chord is admissible only if all of its interior lies in Ω.  This is
      // needed because Ω is not convex: canvas clipping can hide the part of
      // a bad chord outside Ω and make the cut appear to end in the interior.
      const segmentInside = (a, b) => {
        const steps = Math.max(2, Math.ceil(distance(a, b) / 1.5));
        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          if (!ctx.isPointInPath(domain, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
        }
        return true;
      };

      // For a point in a domain, its shortest connection to the boundary is
      // a straight segment.  Prefer the nearest sampled point whose segment
      // is visibly contained; the visibility check also makes this robust to
      // discretisation of the Bézier boundary.
      const boundaryChoices = positions.map(position => {
        const candidates = boundary
          .map(candidate => ({ point: candidate, distance: distance(position, candidate) }))
          .sort((a, b) => a.distance - b.distance);
        const sampledChoice = candidates.find(candidate => segmentInside(position, candidate.point));
        if (sampledChoice) return sampledChoice;

        // Defensive fallback for extremely small canvases: cast rays and use
        // their first exit, so the endpoint is certified to be on ∂Ω rather
        // than silently reverting to a possibly inadmissible sampled chord.
        let best = { point: position, distance: Infinity };
        const limit = Math.hypot(plotWidth, plotHeight);
        for (let i = 0; i < 180; i++) {
          const angle = i * 2 * Math.PI / 180;
          const dx = Math.cos(angle), dy = Math.sin(angle);
          let insideDistance = 0, outsideDistance = 1;
          while (outsideDistance < limit && ctx.isPointInPath(
            domain,
            position.x + dx * outsideDistance,
            position.y + dy * outsideDistance
          )) {
            insideDistance = outsideDistance;
            outsideDistance += 1;
          }
          if (outsideDistance >= limit) continue;
          for (let iteration = 0; iteration < 12; iteration++) {
            const middle = (insideDistance + outsideDistance) / 2;
            if (ctx.isPointInPath(domain, position.x + dx * middle, position.y + dy * middle)) {
              insideDistance = middle;
            } else {
              outsideDistance = middle;
            }
          }
          if (outsideDistance < best.distance) {
            best = {
              point: { x: position.x + dx * outsideDistance, y: position.y + dy * outsideDistance },
              distance: outsideDistance
            };
          }
        }
        return best;
      });

      // Find a shortest in-domain polyline when a straight vortex-to-vortex
      // chord crosses the non-convex boundary.  A small 8-neighbour grid is
      // used only for such pairs, then line-of-sight smoothing removes the
      // grid staircase.
      let navigationGrid;
      const makeNavigationGrid = () => {
        if (navigationGrid) return navigationGrid;
        const spacing = 3;
        const columns = Math.ceil(plotWidth / spacing);
        const rows = Math.ceil(plotHeight / spacing);
        const nodes = new Array(columns * rows).fill(false);
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < columns; x++) {
            nodes[y * columns + x] = ctx.isPointInPath(domain, (x + .5) * spacing, (y + .5) * spacing);
          }
        }
        navigationGrid = { spacing, columns, rows, nodes };
        return navigationGrid;
      };
      const gridPath = (start, end) => {
        if (segmentInside(start, end)) return [start, end];
        const grid = makeNavigationGrid();
        const { spacing, columns, rows, nodes } = grid;
        const nearestNode = position => {
          const centerX = Math.floor(position.x / spacing);
          const centerY = Math.floor(position.y / spacing);
          let best = -1, bestDistance = Infinity;
          for (let radius = 0; radius <= 4 && best < 0; radius++) {
            for (let y = centerY - radius; y <= centerY + radius; y++) {
              for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (x < 0 || y < 0 || x >= columns || y >= rows) continue;
                const index = y * columns + x;
                if (!nodes[index]) continue;
                const candidate = { x: (x + .5) * spacing, y: (y + .5) * spacing };
                const candidateDistance = distance(position, candidate);
                if (candidateDistance < bestDistance && segmentInside(position, candidate)) {
                  best = index;
                  bestDistance = candidateDistance;
                }
              }
            }
          }
          return best;
        };
        const source = nearestNode(start), target = nearestNode(end);
        if (source < 0 || target < 0) return null;

        const costs = new Float64Array(nodes.length);
        costs.fill(Infinity);
        costs[source] = 0;
        const previous = new Int32Array(nodes.length);
        previous.fill(-1);
        const heap = [];
        const push = item => {
          heap.push(item);
          let child = heap.length - 1;
          while (child) {
            const parent = (child - 1) >> 1;
            if (heap[parent].score <= item.score) break;
            heap[child] = heap[parent];
            child = parent;
          }
          heap[child] = item;
        };
        const pop = () => {
          const first = heap[0], last = heap.pop();
          if (heap.length) {
            let parent = 0;
            while (true) {
              let child = parent * 2 + 1;
              if (child >= heap.length) break;
              if (child + 1 < heap.length && heap[child + 1].score < heap[child].score) child++;
              if (heap[child].score >= last.score) break;
              heap[parent] = heap[child];
              parent = child;
            }
            heap[parent] = last;
          }
          return first;
        };
        const targetPoint = { x: (target % columns + .5) * spacing, y: (Math.floor(target / columns) + .5) * spacing };
        push({ index: source, score: distance(start, end) });
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        while (heap.length) {
          const current = pop();
          if (current.index === target) break;
          const x = current.index % columns, y = Math.floor(current.index / columns);
          const currentPoint = { x: (x + .5) * spacing, y: (y + .5) * spacing };
          for (const [dx, dy] of directions) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= columns || ny >= rows) continue;
            const next = ny * columns + nx;
            if (!nodes[next]) continue;
            const nextPoint = { x: (nx + .5) * spacing, y: (ny + .5) * spacing };
            if (!segmentInside(currentPoint, nextPoint)) continue;
            const nextCost = costs[current.index] + spacing * (dx && dy ? Math.SQRT2 : 1);
            if (nextCost >= costs[next]) continue;
            costs[next] = nextCost;
            previous[next] = current.index;
            push({ index: next, score: nextCost + distance(nextPoint, targetPoint) });
          }
        }
        if (target !== source && previous[target] < 0) return null;
        const raw = [end];
        for (let index = target; index >= 0; index = previous[index]) {
          raw.push({ x: (index % columns + .5) * spacing, y: (Math.floor(index / columns) + .5) * spacing });
          if (index === source) break;
        }
        raw.push(start);
        raw.reverse();
        const smooth = [raw[0]];
        for (let i = 0; i < raw.length - 1;) {
          let next = raw.length - 1;
          while (next > i + 1 && !segmentInside(raw[i], raw[next])) next--;
          smooth.push(raw[next]);
          i = next;
        }
        return smooth;
      };
      const pairPaths = new Map();
      const getPairPath = (first, second) => {
        const key = `${first}:${second}`;
        if (!pairPaths.has(key)) pairPaths.set(key, gridPath(positions[first], positions[second]));
        return pairPaths.get(key);
      };

      // Dynamic programming over pairings. A pair is allowed only for
      // opposite degrees; otherwise a vortex is sent to the boundary.
      if (n > 20) return vortices.map((vortex, i) => ({ kind: 'boundary', index: i, end: boundaryChoices[i].point }));
      const memo = new Map();
      const solve = mask => {
        if (!mask) return { cost: 0, connections: [] };
        if (memo.has(mask)) return memo.get(mask);
        let first = 0;
        while (!(mask & (1 << first))) first++;
        const withoutFirst = mask & ~(1 << first);
        let best = solve(withoutFirst);
        best = {
          cost: best.cost + boundaryChoices[first].distance,
          connections: [{ kind: 'boundary', index: first, end: boundaryChoices[first].point }, ...best.connections]
        };
        for (let j = first + 1; j < n; j++) {
          if (!(mask & (1 << j)) || vortices[first].degree === vortices[j].degree) continue;
          const rest = withoutFirst & ~(1 << j);
          const candidate = solve(rest);
          const pairPath = getPairPath(first, j);
          // If the discretised navigator cannot certify an in-domain route,
          // do not offer this pairing; boundary cuts remain a valid fallback.
          if (!pairPath) continue;
          const pairCost = pathLength(pairPath);
          if (candidate.cost + pairCost < best.cost) {
            best = {
              cost: candidate.cost + pairCost,
              connections: [{ kind: 'pair', first, second: j, path: pairPath }, ...candidate.connections]
            };
          }
        }
        memo.set(mask, best);
        return best;
      };
      return solve((1 << n) - 1).connections;
    };

    const drawPath = (ctx, path) => {
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.slice(1).forEach(item => ctx.lineTo(item.x, item.y));
      ctx.stroke();

      // The fibre current [[S¹]] is taken counterclockwise.  The order of the
      // points in `path` is therefore the orientation of L.  Distribute
      // arrowheads uniformly in arclength, leaving equal margins at the ends.
      const totalLength = pathLength(path);
      if (totalLength < 2) return;
      const arrowCount = Math.max(1, Math.round(totalLength / 34));
      const arrowLength = Math.min(12, Math.max(6, totalLength / (arrowCount + 1) * .36));
      const halfWidth = arrowLength * .5;
      let segmentIndex = 1;
      let segmentStartLength = 0;
      for (let arrow = 1; arrow <= arrowCount; arrow++) {
        const targetLength = totalLength * arrow / (arrowCount + 1);
        while (segmentIndex < path.length) {
          const segmentLength = distance(path[segmentIndex - 1], path[segmentIndex]);
          if (segmentLength && segmentStartLength + segmentLength >= targetLength) {
            const t = (targetLength - segmentStartLength) / segmentLength;
            const ux = (path[segmentIndex].x - path[segmentIndex - 1].x) / segmentLength;
            const uy = (path[segmentIndex].y - path[segmentIndex - 1].y) / segmentLength;
            const center = {
              x: path[segmentIndex - 1].x + (path[segmentIndex].x - path[segmentIndex - 1].x) * t,
              y: path[segmentIndex - 1].y + (path[segmentIndex].y - path[segmentIndex - 1].y) * t
            };
            // Centre the triangle itself at the equispaced position.  Since a
            // triangle's centroid lies one third of the way from its base to
            // its tip, placing the tip at the sample point made every marker
            // look shifted backwards along the cut.
            const tip = {
              x: center.x + ux * arrowLength * 2 / 3,
              y: center.y + uy * arrowLength * 2 / 3
            };
            const base = {
              x: center.x - ux * arrowLength / 3,
              y: center.y - uy * arrowLength / 3
            };
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.moveTo(tip.x, tip.y);
            ctx.lineTo(base.x - uy * halfWidth, base.y + ux * halfWidth);
            ctx.lineTo(base.x + uy * halfWidth, base.y - ux * halfWidth);
            ctx.closePath();
            ctx.fill();
            break;
          }
          segmentStartLength += segmentLength;
          segmentIndex++;
        }
      }
    };

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.min(440, canvas.parentElement.clientWidth || 440);
      const height = width * 0.68;
      plotWidth = width;
      plotHeight = height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const omega = makeOmega(width, height);
      currentPath = omega.path;

      // The constant field is the constant phase 0. Multiplication by each
      // (x-x_i)/|x-x_i| adds its signed polar angle.
      ctx.save();
      ctx.clip(omega.path);
      for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
          let angle = 0;
          vortices.forEach(vortex => {
            angle += vortex.degree * Math.atan2(-(y - vortex.y * height), x - vortex.x * width);
          });
          ctx.fillStyle = hue(angle);
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Close the punctures with the minimum-total-length collection of
      // in-domain cuts: opposite vortices may be paired, while remaining
      // vortices connect to the nearest visible point on the boundary.
      // isPointInPath tests in CSS-pixel coordinates.  Remove the DPR
      // transform while computing visibility; otherwise the tested domain is
      // scaled while the vortex/boundary points are not, and clipping leaves
      // only a short stub beside the vortex on high-DPI screens.
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const connections = shortestConnections(omega.boundary, ctx, omega.path);
      ctx.restore();
      connections.forEach(connection => {
        if (connection.kind === 'boundary') {
          const start = point(vortices[connection.index]);
          const end = connection.end;
          const length = distance(start, end) || 1;
          // Extend slightly past the boundary; clipping makes the visible
          // endpoint meet the boundary stroke instead of ending short.
          const visibleEnd = {
            x: end.x + (end.x - start.x) * 5 / length,
            y: end.y + (end.y - start.y) * 5 / length
          };
          // With counterclockwise orientation on S¹, ∂L has coefficient +1
          // at a positive vortex and -1 at a negative one.  Thus arrows end
          // at + vortices and start at - vortices; the other endpoint lies on
          // ∂Ω and does not contribute to the boundary inside Ω.
          const path = [start, visibleEnd];
          drawPath(ctx, vortices[connection.index].degree > 0 ? path.reverse() : path);
          return;
        }
        // For a paired cut this is the same convention: - → +.
        const firstDegree = vortices[connection.first].degree;
        drawPath(ctx, firstDegree < 0 ? connection.path : [...connection.path].reverse());
      });
      ctx.restore();

      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2.5;
      ctx.stroke(omega.path);
      vortices.forEach(vortex => {
        const position = point(vortex);
        ctx.fillStyle = vortexColor(vortex.degree);
        ctx.beginPath();
        ctx.arc(position.x, position.y, Math.max(3, width * .012), 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    canvas.addEventListener('pointerdown', event => {
      if (!currentPath) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * plotWidth / rect.width;
      const y = (event.clientY - rect.top) * plotHeight / rect.height;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const inside = ctx.isPointInPath(currentPath, x, y);
      ctx.restore();
      if (!inside) return;
      const selected = Array.from(degreeInputs).find(input => input.checked);
      const degree = selected ? Number(selected.value) : 1;
      vortices.push({ x: x / plotWidth, y: y / plotHeight, degree });
      draw();
    });

    window.addEventListener('resize', draw);
    draw();
  }
  window.setupPuncturingPlot = setupPuncturingPlot;
})();
