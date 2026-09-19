(function () {
  function setupBallConstructionPlot() {
    const canvas = document.getElementById('ballConstructionCanvas');
    const slider = document.getElementById('ballConstructionSlider');
    if (!canvas || !slider) return;

    const positiveColor = '#d7191c';
    const negativeColor = '#2166ac';
    let width = 0;
    let height = 0;
    let vortices = [];
    let phases = [];
    let totalFrames = 1;
    let fieldLayer = null;

    const fractionalPart = value => value - Math.floor(value);
    const random = seed => fractionalPart(Math.sin(seed * 12.9898) * 43758.5453);

    // Generate four irregular, well-separated clouds of twelve vortices. The
    // clouds do not look like a grid, but their geometry makes each cloud form
    // one ball near four-sixths of the slider evolution. Each cloud contains
    // six vortices of each sign, hence every one of those four balls has degree
    // zero (and the total degree is zero as well).
    const makeVortices = () => {
      const centers = [[.27, .28], [.70, .21], [.34, .76], [.73, .69]];
      const cloudRadiusX = width * (60 / 760);
      const cloudRadiusY = height * (50 / 390);
      const minimumDistance = width * (26 / 760);
      const seed = 383;
      const result = [];

      centers.forEach(([centerX, centerY], cloud) => {
        const positions = [];
        for (let candidate = 0; positions.length < 12 && candidate < 5000; candidate++) {
          const offset = seed + cloud * 10000 + candidate * 3;
          const angle = 2 * Math.PI * random(offset + 1);
          const radius = Math.sqrt(random(offset + 2));
          const point = {
            x: centerX * width + Math.cos(angle) * radius * cloudRadiusX,
            y: centerY * height + Math.sin(angle) * radius * cloudRadiusY
          };
          const separated = positions.every(other =>
            Math.hypot(point.x - other.x, point.y - other.y) >= minimumDistance
          );
          if (separated) positions.push(point);
        }

        const degrees = [...new Array(6).fill(1), ...new Array(6).fill(-1)];
        for (let index = degrees.length - 1; index > 0; index--) {
          const swap = Math.floor(random(seed + cloud * 101 + index) * (index + 1));
          [degrees[index], degrees[swap]] = [degrees[swap], degrees[index]];
        }
        positions.forEach((point, index) => result.push({ ...point, degree: degrees[index] }));
      });

      return result;
    };

    const copyBalls = balls => balls.map(ball => ({
      x: ball.x,
      y: ball.y,
      r: ball.r,
      members: [...ball.members]
    }));
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const touching = (a, b) => distance(a, b) <= a.r + b.r + .05;
    const key = ball => [...ball.members].sort((a, b) => a - b).join(',');

    // Use the smallest ball containing two intersecting balls. At first
    // contact its radius is r1+r2; during an iterated merge it may be smaller,
    // while always satisfying the ball-construction bound R <= r1+r2.
    const mergePair = (first, second) => {
      const d = distance(first, second);
      const members = [...first.members, ...second.members].sort((a, b) => a - b);
      if (d < 1e-8 || first.r >= d + second.r) return { ...first, members };
      if (second.r >= d + first.r) return { ...second, members };

      const r = (d + first.r + second.r) / 2;
      const amount = (r - first.r) / d;
      return {
        x: first.x + (second.x - first.x) * amount,
        y: first.y + (second.y - first.y) * amount,
        r,
        members
      };
    };

    // Merge each connected component of touching balls.  A newly constructed
    // enclosing ball can meet a previously separate component; buildPhases
    // therefore repeats this operation until the family is disjoint again.
    const mergeRound = balls => {
      const parent = balls.map((_, index) => index);
      const root = index => {
        while (parent[index] !== index) {
          parent[index] = parent[parent[index]];
          index = parent[index];
        }
        return index;
      };
      const join = (a, b) => {
        a = root(a);
        b = root(b);
        if (a !== b) parent[b] = a;
      };
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          if (touching(balls[i], balls[j])) join(i, j);
        }
      }
      const components = new Map();
      balls.forEach((ball, index) => {
        const component = root(index);
        if (!components.has(component)) components.set(component, []);
        components.get(component).push(ball);
      });
      return Array.from(components.values()).map(component =>
        component.slice(1).reduce(mergePair, component[0])
      );
    };

    const hasTouchingPair = balls => {
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          if (touching(balls[i], balls[j])) return true;
        }
      }
      return false;
    };

    const nextCollisionFactor = balls => {
      let factor = Infinity;
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          factor = Math.min(factor, distance(balls[i], balls[j]) / (balls[i].r + balls[j].r));
        }
      }
      return factor;
    };

    const addPhase = (type, from, to, frames) => {
      phases.push({ type, from: copyBalls(from), to: copyBalls(to), frames });
    };

    const buildPhases = () => {
      phases = [];
      const initialRadius = Math.max(2.4, width * .0064);
      let balls = vortices.map((vortex, index) => ({
        x: vortex.x,
        y: vortex.y,
        r: initialRadius,
        members: [index]
      }));

      for (let event = 0; event < 100 && balls.length > 1; event++) {
        if (!hasTouchingPair(balls)) {
          const factor = nextCollisionFactor(balls);
          if (!Number.isFinite(factor)) break;
          const expanded = balls.map(ball => ({ ...ball, r: ball.r * factor, members: [...ball.members] }));
          const expansionFrames = Math.max(5, Math.min(18, Math.round(6 + 6 * Math.log(factor))));
          addPhase('expand', balls, expanded, expansionFrames);
          balls = expanded;
        }

        // Keep every step of an iterated merging cascade visible. Each step
        // occupies one sharp slider frame; once the family is disjoint, the
        // next phase resumes common expansion.
        let mergeSteps = 0;
        while (hasTouchingPair(balls) && mergeSteps++ < 100) {
          const merged = mergeRound(balls);
          if (merged.length === balls.length) break;
          addPhase('merge', balls, merged, 1);
          balls = merged;
        }
      }

      // The last slider position shows the final single ball without ghosts.
      addPhase('hold', balls, balls, 1);

      totalFrames = phases.reduce((sum, phase) => sum + phase.frames, 0) || 1;
      slider.max = String(Math.max(0, totalFrames - 1));
    };

    const phaseAt = frame => {
      let position = Math.max(0, Math.min(totalFrames - 1, Math.round(frame)));
      for (const phase of phases) {
        if (position < phase.frames) {
          const t = phase.type === 'expand' && phase.frames > 1
            ? position / (phase.frames - 1)
            : 1;
          return { phase, t };
        }
        position -= phase.frames;
      }
      const phase = phases[phases.length - 1];
      return { phase, t: 1 };
    };

    const fieldAngle = (x, y) => vortices.reduce((angle, vortex) =>
      angle + vortex.degree * Math.atan2(-(y - vortex.y), x - vortex.x), 0
    );

    const hslToRgb = hue => {
      const saturation = .75;
      const lightness = .68;
      const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
      const sector = ((hue / 60) % 6 + 6) % 6;
      const secondary = chroma * (1 - Math.abs(sector % 2 - 1));
      let red = 0;
      let green = 0;
      let blue = 0;
      if (sector < 1) [red, green, blue] = [chroma, secondary, 0];
      else if (sector < 2) [red, green, blue] = [secondary, chroma, 0];
      else if (sector < 3) [red, green, blue] = [0, chroma, secondary];
      else if (sector < 4) [red, green, blue] = [0, secondary, chroma];
      else if (sector < 5) [red, green, blue] = [secondary, 0, chroma];
      else [red, green, blue] = [chroma, 0, secondary];
      const offset = lightness - chroma / 2;
      return [red, green, blue].map(channel => Math.round((channel + offset) * 255));
    };

    const buildFieldLayer = () => {
      // The field is static, so render it once at half resolution and reuse it
      // while the range input moves.
      const pixelSize = 2;
      const layerWidth = Math.ceil(width / pixelSize);
      const layerHeight = Math.ceil(height / pixelSize);
      fieldLayer = document.createElement('canvas');
      fieldLayer.width = layerWidth;
      fieldLayer.height = layerHeight;
      const context = fieldLayer.getContext('2d');
      const image = context.createImageData(layerWidth, layerHeight);
      for (let y = 0; y < layerHeight; y++) {
        for (let x = 0; x < layerWidth; x++) {
          const angle = fieldAngle((x + .5) * pixelSize, (y + .5) * pixelSize);
          const [red, green, blue] = hslToRgb(angle * 180 / Math.PI);
          const offset = (y * layerWidth + x) * 4;
          image.data[offset] = red;
          image.data[offset + 1] = green;
          image.data[offset + 2] = blue;
          image.data[offset + 3] = 255;
        }
      }
      context.putImageData(image, 0, 0);
    };

    const drawField = context => {
      context.save();
      context.imageSmoothingEnabled = true;
      context.drawImage(fieldLayer, 0, 0, width, height);
      context.restore();
    };

    const drawBall = (context, ball, dashed = false, fill = true) => {
      context.save();
      context.beginPath();
      context.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
      if (fill) {
        context.fillStyle = 'rgba(255,255,255,.18)';
        context.fill();
      }
      context.setLineDash(dashed ? [7, 6] : []);
      context.strokeStyle = 'rgba(255,255,255,.94)';
      context.lineWidth = 5;
      context.stroke();
      context.strokeStyle = '#222';
      context.lineWidth = 2.3;
      context.stroke();
      context.restore();
    };

    const drawBalls = (context, phase, t) => {
      if (phase.type === 'expand') {
        phase.from.forEach((ball, index) => {
          const target = phase.to[index];
          drawBall(context, {
            ...ball,
            r: ball.r + (target.r - ball.r) * t
          });
        });
        return;
      }

      if (phase.type === 'hold') {
        phase.to.forEach(ball => drawBall(context, ball));
        return;
      }

      const fromByKey = new Map(phase.from.map(ball => [key(ball), ball]));
      const toByKey = new Map(phase.to.map(ball => [key(ball), ball]));

      // Draw the new enclosing circles first, then put the old touching
      // circles on top as dashed outlines. There is no interpolation or fade.
      phase.from.forEach(ball => {
        if (toByKey.has(key(ball))) drawBall(context, ball);
      });
      phase.to.forEach(ball => {
        if (!fromByKey.has(key(ball))) drawBall(context, ball);
      });
      phase.from.forEach(ball => {
        if (!toByKey.has(key(ball))) drawBall(context, ball, true, false);
      });
    };

    const draw = () => {
      if (!phases.length || !fieldLayer) return;
      const dpr = window.devicePixelRatio || 1;
      const context = canvas.getContext('2d');
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
      drawField(context);

      const { phase, t } = phaseAt(Number(slider.value));
      drawBalls(context, phase, t);

      vortices.forEach(vortex => {
        context.fillStyle = vortex.degree > 0 ? positiveColor : negativeColor;
        context.strokeStyle = 'rgba(255,255,255,.9)';
        context.lineWidth = 1.5;
        context.beginPath();
        context.arc(vortex.x, vortex.y, Math.max(2.4, width * .0047), 0, 2 * Math.PI);
        context.fill();
        context.stroke();
      });
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const previousProgress = Number(slider.max) > 0
        ? Number(slider.value) / Number(slider.max)
        : 0;
      width = Math.min(760, canvas.parentElement.clientWidth || 760);
      height = Math.min(390, width * .515);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      vortices = makeVortices();
      buildPhases();
      slider.value = String(Math.round(previousProgress * Number(slider.max)));
      buildFieldLayer();
      draw();
    };

    slider.addEventListener('input', draw);
    window.addEventListener('resize', resize);
    resize();
  }

  window.setupBallConstructionPlot = setupBallConstructionPlot;
})();
