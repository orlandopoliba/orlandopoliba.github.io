(function () {
  function setupLimsupPlot() {
    const host = document.querySelector('.limsupPlot');
    const canvas = document.getElementById('limsupCanvas');
    const slider = document.getElementById('limsupSlider');
    if (!host || !canvas || !slider) return;

    const vortices = [
      { x: 0.29, y: 0.34, degree: 1 },
      { x: 0.43, y: 0.47, degree: -1 },
      { x: 0.72, y: 0.61, degree: 2 },
    ];
    const TAU = 2 * Math.PI;
    let width = 0;
    let height = 0;
    let domain;
    let cuts = [];
    let smoothAngles;

    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const shortestAngle = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

    function hslToRgb(angle) {
      let hue = (angle / TAU) % 1;
      if (hue < 0) hue += 1;
      const saturation = 0.75;
      const lightness = 0.68;
      const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
      const sector = hue * 6;
      const x = chroma * (1 - Math.abs(sector % 2 - 1));
      let red = 0, green = 0, blue = 0;
      if (sector < 1) [red, green] = [chroma, x];
      else if (sector < 2) [red, green] = [x, chroma];
      else if (sector < 3) [green, blue] = [chroma, x];
      else if (sector < 4) [green, blue] = [x, chroma];
      else if (sector < 5) [red, blue] = [x, chroma];
      else [red, blue] = [chroma, x];
      const match = lightness - chroma / 2;
      return [
        Math.round((red + match) * 255),
        Math.round((green + match) * 255),
        Math.round((blue + match) * 255),
      ];
    }

    function basePhase(nx, ny) {
      return vortices.reduce((phase, vortex) => {
        const dx = (nx - vortex.x) * domain.width;
        const dy = -(ny - vortex.y) * domain.height;
        return phase + vortex.degree * Math.atan2(dy, dx);
      }, 0);
    }

    function buildCutGeometry() {
      const point = ({ x, y }) => ({
        x: domain.x + x * domain.width,
        y: domain.y + y * domain.height,
      });
      const positive = point(vortices[0]);
      const negative = point(vortices[1]);
      const double = point(vortices[2]);
      const elbow = { x: positive.x, y: negative.y };
      return [
        {
          multiplicity: 1,
          points: [negative, elbow, positive],
        },
        {
          multiplicity: 2,
          points: [
            double,
            { x: double.x, y: domain.y + domain.height + 2 },
          ],
        },
      ];
    }

    function gaussianConvolution(source, imageWidth, imageHeight, sigma) {
      const radius = Math.max(1, Math.ceil(3 * sigma));
      const kernel = new Float32Array(2 * radius + 1);
      let kernelMass = 0;
      for (let offset = -radius; offset <= radius; offset++) {
        const weight = Math.exp(-0.5 * (offset / sigma) ** 2);
        kernel[offset + radius] = weight;
        kernelMass += weight;
      }
      for (let index = 0; index < kernel.length; index++) kernel[index] /= kernelMass;

      const horizontal = new Float32Array(source.length);
      const result = new Float32Array(source.length);
      for (let y = 0; y < imageHeight; y++) {
        for (let x = 0; x < imageWidth; x++) {
          let value = 0, mass = 0;
          for (let offset = -radius; offset <= radius; offset++) {
            const sampleX = x + offset;
            if (sampleX < 0 || sampleX >= imageWidth) continue;
            const weight = kernel[offset + radius];
            value += source[y * imageWidth + sampleX] * weight;
            mass += weight;
          }
          horizontal[y * imageWidth + x] = value / mass;
        }
      }
      for (let y = 0; y < imageHeight; y++) {
        for (let x = 0; x < imageWidth; x++) {
          let value = 0, mass = 0;
          for (let offset = -radius; offset <= radius; offset++) {
            const sampleY = y + offset;
            if (sampleY < 0 || sampleY >= imageHeight) continue;
            const weight = kernel[offset + radius];
            value += horizontal[sampleY * imageWidth + x] * weight;
            mass += weight;
          }
          result[y * imageWidth + x] = value / mass;
        }
      }
      return result;
    }

    // Construct a single-valued angular lifting on the slit domain.  Grid
    // edges crossing a cut are removed, then the wrapped phase is unwrapped
    // by integration along the remaining edges.  Convolving this scalar
    // lifting creates the smooth transition layers used in steps 3--5.
    function buildSmoothAngularLifting() {
      const imageWidth = Math.max(1, Math.round(domain.width));
      const imageHeight = Math.max(1, Math.round(domain.height));
      const length = imageWidth * imageHeight;
      const wrapped = new Float32Array(length);
      const lifting = new Float32Array(length);
      const visited = new Uint8Array(length);
      const valid = new Uint8Array(length);
      valid.fill(1);

      for (let y = 0; y < imageHeight; y++) {
        for (let x = 0; x < imageWidth; x++) {
          wrapped[y * imageWidth + x] = shortestAngle(basePhase(
            (x + 0.5) / imageWidth,
            (y + 0.5) / imageHeight
          ));
        }
      }

      // Remove a tiny disk around each singular point, so that the rasterized
      // cut really ends at the puncture and cannot be bypassed by one pixel.
      vortices.forEach(vortex => {
        const centerX = vortex.x * imageWidth;
        const centerY = vortex.y * imageHeight;
        const radius = 2.5;
        for (let y = Math.max(0, Math.floor(centerY - radius)); y <= Math.min(imageHeight - 1, Math.ceil(centerY + radius)); y++) {
          for (let x = Math.max(0, Math.floor(centerX - radius)); x <= Math.min(imageWidth - 1, Math.ceil(centerX + radius)); x++) {
            if (Math.hypot(x + 0.5 - centerX, y + 0.5 - centerY) <= radius) {
              valid[y * imageWidth + x] = 0;
            }
          }
        }
      });

      const blockedRight = new Uint8Array(length);
      const blockedDown = new Uint8Array(length);
      const toImagePoint = point => ({
        x: (point.x - domain.x) * imageWidth / domain.width,
        y: (point.y - domain.y) * imageHeight / domain.height,
      });
      cuts.forEach(cut => {
        for (let index = 1; index < cut.points.length; index++) {
          const start = toImagePoint(cut.points[index - 1]);
          const end = toImagePoint(cut.points[index]);
          if (Math.abs(start.y - end.y) < 0.01) {
            const edgeY = Math.floor((start.y + end.y) / 2 - 0.5);
            if (edgeY < 0 || edgeY >= imageHeight - 1) continue;
            const minimumX = Math.min(start.x, end.x);
            const maximumX = Math.max(start.x, end.x);
            for (let x = 0; x < imageWidth; x++) {
              if (x + 0.5 >= minimumX && x + 0.5 <= maximumX) {
                blockedDown[edgeY * imageWidth + x] = 1;
              }
            }
          } else {
            const edgeX = Math.floor((start.x + end.x) / 2 - 0.5);
            if (edgeX < 0 || edgeX >= imageWidth - 1) continue;
            const minimumY = Math.min(start.y, end.y);
            const maximumY = Math.max(start.y, end.y);
            for (let y = 0; y < imageHeight; y++) {
              if (y + 0.5 >= minimumY && y + 0.5 <= maximumY) {
                blockedRight[y * imageWidth + edgeX] = 1;
              }
            }
          }
        }
      });

      const queue = new Int32Array(length);
      const unwrapComponent = seed => {
        let head = 0, tail = 0;
        queue[tail++] = seed;
        visited[seed] = 1;
        lifting[seed] = wrapped[seed];
        while (head < tail) {
          const current = queue[head++];
          const x = current % imageWidth;
          const y = Math.floor(current / imageWidth);
          const visit = neighbor => {
            if (!valid[neighbor] || visited[neighbor]) return;
            visited[neighbor] = 1;
            lifting[neighbor] = lifting[current] + shortestAngle(wrapped[neighbor] - wrapped[current]);
            queue[tail++] = neighbor;
          };
          if (x + 1 < imageWidth && !blockedRight[current]) visit(current + 1);
          if (x > 0 && !blockedRight[current - 1]) visit(current - 1);
          if (y + 1 < imageHeight && !blockedDown[current]) visit(current + imageWidth);
          if (y > 0 && !blockedDown[current - imageWidth]) visit(current - imageWidth);
        }
      };
      for (let index = 0; index < length; index++) {
        if (valid[index] && !visited[index]) unwrapComponent(index);
      }

      // Extend the lifting through the tiny punctures before convolution.
      for (let index = 0; index < length; index++) {
        if (valid[index]) continue;
        const x = index % imageWidth;
        const y = Math.floor(index / imageWidth);
        let source = -1;
        for (let radius = 1; radius <= 5 && source < 0; radius++) {
          for (let dy = -radius; dy <= radius && source < 0; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const sampleX = x + dx, sampleY = y + dy;
              if (sampleX < 0 || sampleY < 0 || sampleX >= imageWidth || sampleY >= imageHeight) continue;
              const candidate = sampleY * imageWidth + sampleX;
              if (valid[candidate]) { source = candidate; break; }
            }
          }
        }
        lifting[index] = source >= 0
          ? lifting[source] + shortestAngle(wrapped[index] - wrapped[source])
          : wrapped[index];
      }

      // Use a broad mollifier: the visible transition spans roughly six
      // mesoscopic cells.
      const sigma = 1.5 * domain.cellSize * imageWidth / domain.width;
      smoothAngles = {
        width: imageWidth,
        height: imageHeight,
        data: gaussianConvolution(lifting, imageWidth, imageHeight, sigma),
      };
    }

    function smoothPhase(nx, ny) {
      if (!smoothAngles) return basePhase(nx, ny);
      const x = clamp(nx * smoothAngles.width - 0.5, 0, smoothAngles.width - 1);
      const y = clamp(ny * smoothAngles.height - 0.5, 0, smoothAngles.height - 1);
      const x0 = Math.floor(x), y0 = Math.floor(y);
      const x1 = Math.min(smoothAngles.width - 1, x0 + 1);
      const y1 = Math.min(smoothAngles.height - 1, y0 + 1);
      const tx = x - x0, ty = y - y0;
      const top = smoothAngles.data[y0 * smoothAngles.width + x0] * (1 - tx)
        + smoothAngles.data[y0 * smoothAngles.width + x1] * tx;
      const bottom = smoothAngles.data[y1 * smoothAngles.width + x0] * (1 - tx)
        + smoothAngles.data[y1 * smoothAngles.width + x1] * tx;
      return top * (1 - ty) + bottom * ty;
    }

    function fillPhaseField(context, sampler) {
      const imageWidth = Math.max(1, Math.round(domain.width));
      const imageHeight = Math.max(1, Math.round(domain.height));
      const image = context.createImageData(imageWidth, imageHeight);
      for (let y = 0; y < imageHeight; y++) {
        const ny = (y + 0.5) / imageHeight;
        for (let x = 0; x < imageWidth; x++) {
          const nx = (x + 0.5) / imageWidth;
          const [red, green, blue] = hslToRgb(sampler(nx, ny));
          const offset = (y * imageWidth + x) * 4;
          image.data[offset] = red;
          image.data[offset + 1] = green;
          image.data[offset + 2] = blue;
          image.data[offset + 3] = 255;
        }
      }
      const layer = document.createElement('canvas');
      layer.width = imageWidth;
      layer.height = imageHeight;
      layer.getContext('2d').putImageData(image, 0, 0);
      context.drawImage(layer, domain.x, domain.y, domain.width, domain.height);
    }

    function drawDomainOutline(context) {
      context.strokeStyle = '#222';
      context.lineWidth = 2.2;
      context.strokeRect(domain.x, domain.y, domain.width, domain.height);
    }

    function drawVortices(context) {
      const markerRadius = Math.max(4.5, width * 0.007);
      vortices.forEach(vortex => {
        const x = domain.x + vortex.x * domain.width;
        const y = domain.y + vortex.y * domain.height;
        const color = vortex.degree < 0 ? '#2166ac' : '#d7191c';
        context.fillStyle = color;
        context.strokeStyle = 'rgba(255,255,255,.95)';
        context.lineWidth = 1.8;
        context.beginPath();
        context.arc(x, y, markerRadius, 0, TAU);
        context.fill();
        context.stroke();
      });
    }

    function strokePolyline(context, points) {
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(point => context.lineTo(point.x, point.y));
      context.stroke();
    }

    function drawCuts(context) {
      context.save();
      context.beginPath();
      context.rect(domain.x, domain.y, domain.width, domain.height);
      context.clip();
      cuts.forEach(cut => {
        if (cut.multiplicity === 1) {
          context.strokeStyle = 'rgba(255,255,255,.9)';
          context.lineWidth = 7;
          context.lineCap = 'round';
          context.lineJoin = 'round';
          strokePolyline(context, cut.points);
          context.strokeStyle = '#171717';
          context.lineWidth = 3.2;
          strokePolyline(context, cut.points);
          return;
        }

        const [start, end] = cut.points;
        [-3.2, 3.2].forEach(offset => {
          const points = [
            { x: start.x + offset, y: start.y },
            { x: end.x + offset, y: end.y },
          ];
          context.strokeStyle = 'rgba(255,255,255,.9)';
          context.lineWidth = 5.5;
          context.lineCap = 'round';
          strokePolyline(context, points);
          context.strokeStyle = '#171717';
          context.lineWidth = 2.5;
          strokePolyline(context, points);
        });
      });
      context.restore();
    }

    function coarseValues() {
      const values = [];
      for (let row = 0; row < domain.rows; row++) {
        const line = [];
        for (let column = 0; column < domain.columns; column++) {
          line.push(smoothPhase(
            (column + 0.5) / domain.columns,
            (row + 0.5) / domain.rows
          ));
        }
        values.push(line);
      }
      return values;
    }

    function drawMesoscopicGrid(context, values) {
      const size = domain.cellSize;
      for (let row = 0; row < domain.rows; row++) {
        for (let column = 0; column < domain.columns; column++) {
          const [red, green, blue] = hslToRgb(values[row][column]);
          context.fillStyle = `rgb(${red} ${green} ${blue})`;
          context.fillRect(
            domain.x + column * size,
            domain.y + row * size,
            size + 0.25,
            size + 0.25
          );
        }
      }
      context.strokeStyle = 'rgba(30,30,30,.48)';
      context.lineWidth = 1;
      for (let column = 0; column <= domain.columns; column++) {
        const x = domain.x + column * size;
        context.beginPath();
        context.moveTo(x, domain.y);
        context.lineTo(x, domain.y + domain.height);
        context.stroke();
      }
      for (let row = 0; row <= domain.rows; row++) {
        const y = domain.y + row * size;
        context.beginPath();
        context.moveTo(domain.x, y);
        context.lineTo(domain.x + domain.width, y);
        context.stroke();
      }
    }

    function axisBlend(coordinate, count, band) {
      const scaled = clamp(coordinate * count, 0, count - Number.EPSILON);
      const index = Math.floor(scaled);
      const local = scaled - index;
      if (local < band && index > 0) {
        return { first: index - 1, second: index, amount: 0.5 + local / (2 * band) };
      }
      if (local > 1 - band && index < count - 1) {
        return { first: index, second: index + 1, amount: (local - (1 - band)) / (2 * band) };
      }
      return { first: index, second: index, amount: 0 };
    }

    function transitionedValue(values, nx, ny) {
      const horizontal = axisBlend(nx, domain.columns, 0.28);
      const vertical = axisBlend(ny, domain.rows, 0.28);
      const samples = [
        [horizontal.first, vertical.first, (1 - horizontal.amount) * (1 - vertical.amount)],
        [horizontal.second, vertical.first, horizontal.amount * (1 - vertical.amount)],
        [horizontal.first, vertical.second, (1 - horizontal.amount) * vertical.amount],
        [horizontal.second, vertical.second, horizontal.amount * vertical.amount],
      ].filter(sample => sample[2] > 0);
      const reference = values[samples[0][1]][samples[0][0]];
      let phase = reference;
      samples.forEach(([column, row, weight]) => {
        phase += shortestAngle(values[row][column] - reference) * weight;
      });
      const clockStates = 32;
      return Math.round(phase * clockStates / TAU) * TAU / clockStates;
    }

    function drawFineLattice(context, values) {
      const refinement = 6;
      const columns = domain.columns * refinement;
      const rows = domain.rows * refinement;
      const cellWidth = domain.width / columns;
      const cellHeight = domain.height / rows;
      context.fillStyle = '#fff';
      context.fillRect(domain.x, domain.y, domain.width, domain.height);
      for (let row = 0; row < rows; row++) {
        const ny = (row + 0.5) / rows;
        for (let column = 0; column < columns; column++) {
          const nx = (column + 0.5) / columns;
          const [red, green, blue] = hslToRgb(transitionedValue(values, nx, ny));
          context.fillStyle = `rgb(${red} ${green} ${blue})`;
          context.fillRect(
            domain.x + column * cellWidth,
            domain.y + row * cellHeight,
            cellWidth + 0.15,
            cellHeight + 0.15
          );
        }
      }
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const context = canvas.getContext('2d');
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);

      const step = Number(slider.value);
      if (step <= 3) {
        fillPhaseField(context, step === 3 ? smoothPhase : basePhase);
        if (step === 2) drawCuts(context);
        if (step <= 2) drawVortices(context);
      } else {
        const values = coarseValues();
        if (step === 4) drawMesoscopicGrid(context, values);
        else drawFineLattice(context, values);
      }
      drawDomainOutline(context);
      slider.setAttribute('aria-valuetext', [
        'BV map',
        'optimal anisotropic cuts',
        'smooth approximation',
        'mesoscopic discretization',
        'fine lattice recovery sequence',
      ][step - 1]);
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = Math.min(720, host.clientWidth || 720);
      height = Math.round(width * 0.32);
      // Use a genuinely mesoscopic grid whose cells are half the side length
      // of the previous 6-row construction.
      const rows = 12;
      const cellSize = (height - 18) / rows;
      const columns = Math.max(8, Math.floor((width - 32) / cellSize));
      domain = {
        rows,
        columns,
        cellSize,
        width: columns * cellSize,
        height: rows * cellSize,
      };
      domain.x = (width - domain.width) / 2;
      domain.y = (height - domain.height) / 2;
      cuts = buildCutGeometry();
      smoothAngles = undefined;
      buildSmoothAngularLifting();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      draw();
    }

    slider.addEventListener('input', draw);
    window.addEventListener('resize', resize);
    resize();
  }

  window.setupLimsupPlot = setupLimsupPlot;
})();
