(function () {
  const canvas = document.getElementById('waveContinuousCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  // new: get sliders
  const time = document.getElementById('time2');   
  const tVal  = document.getElementById('tVal2');  


//   // Simpson on [a,b] with even n
//   function simpson(f, a, b, n) {
//     if (n <= 0) return 0;
//     if (n % 2 === 1) n += 1;
//     const h = (b - a) / n;
//     let s0 = f(a) + f(b), s1 = 0, s2 = 0;
//     for (let k = 1; k < n; k++) {
//       const x = a + k * h;
//       (k % 2 ? (s1 += f(x)) : (s2 += f(x)));
//     }
//     return (h / 3) * (s0 + 4 * s1 + 2 * s2);
//   }

//   // ω(ξ) using Taylor near 0 and numeric tail
//   function omega(xi) {
//     const delta = 0.99;
//     const alpha = 0.2;
//     const ax = Math.abs(xi);
//     if (ax === 0) return 0;
//     const twoPi = 2 * Math.PI;

//     // small-phase threshold
//     const theta0 = 0.5;
//     const y0 = Math.min(delta, theta0 / (twoPi * ax));

//     // analytic piece on [0, y0]
//     const eps = 1e-12;
//     let I0;
//     if (Math.abs(1 - alpha) > 1e-8) {
//       I0 = (2 * Math.PI * Math.PI) * (ax * ax) * (Math.pow(y0, 2 - 2 * alpha) / (2 - 2 * alpha));
//     } else {
//       I0 = (2 * Math.PI * Math.PI) * (ax * ax) * Math.log(y0 / eps);
//     }

//     // numeric tail on [y0, δ]
//     const integrand = (y) => {
//       const denom = Math.pow(y, 1 + 2 * alpha);
//       const num = 1 - Math.cos(twoPi * xi * y);
//       return num / denom;
//     };

//     const osc = Math.max(1, Math.floor((twoPi * ax * (delta - y0)) / Math.PI));
//     const N = Math.min(4000, 600 + 200 * osc);
//     const I1 = y0 < delta ? simpson(integrand, y0, delta, N) : 0;

//     const I = 2 * (I0 + I1); // even integrand
//     return Math.sqrt(1 / Math.pow(delta, 2 * (1 - alpha)) * Math.max(I, 0));
//   }

  function axes(x, y, wPlot, hPlot, label) {
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  // frame axes
  ctx.beginPath();
  ctx.moveTo(x, y + hPlot); ctx.lineTo(x + wPlot, y + hPlot); // x-axis
  ctx.moveTo(x, y);         ctx.lineTo(x, y + hPlot);          // y-axis
  ctx.stroke();
  // y=0 line
  ctx.strokeStyle = '#e5e5e5';
  ctx.beginPath();
  ctx.moveTo(x, y + hPlot/2); ctx.lineTo(x + wPlot, y + hPlot/2);
  ctx.stroke();
  // label
  ctx.fillStyle = '#555';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(label, x + 6, y + 14);
}


function draw(t) {
  ctx.clearRect(0, 0, w, h);

  // ---- layout: left panel; right column split into two rows ----
  const m = { top: 14, right: 14, bottom: 28, left: 50, midX: 40, midY: 24 };
  const colW = (w - m.left - m.right - m.midX) / 2;
  const colH = h - m.top - m.bottom;

  const left    = { x: m.left,                  y: m.top,              w: colW, h: colH };
  const rightT  = { x: m.left + colW + m.midX,  y: m.top,              w: colW, h: (colH - m.midY) / 2 };
  const rightB  = { x: rightT.x,                y: rightT.y + rightT.h + m.midY, w: colW, h: (colH - m.midY) / 2 };

  // ---- x sampling (same domain as before) ----
  const N = Math.max(100, Math.floor(colW));   // tie resolution to panel width
  const xs = new Array(N), ySum = new Array(N), yR = new Array(N), yLtrav = new Array(N);

  let minSum =  Infinity, maxSum = -Infinity;
  let minR   =  Infinity, maxR   = -Infinity;
  let minL   =  Infinity, maxL   = -Infinity;

  for (let i = 0; i < N; i++) {
    const x = i / (N - 1);   // x in [0,1]
    xs[i] = x;

    const theta = 2 * Math.PI * x;
    const hat_u = [0.2, 0.5, 0.3, 0.8];

    let uSum = 0, uRight = 0, uLeft = 0;

    for (let k = 1; k <= hat_u.length; k++) {
        uSum += hat_u[k-1] * Math.sin(k*theta) * Math.cos(k * t) / 2;
        uRight += hat_u[k-1] * 0.5 * Math.sin(k * theta - k * t);
        uLeft  += hat_u[k-1] * 0.5 * Math.sin(k * theta + k * t);
    }
   

    ySum[i]  = uSum; yR[i]    = uRight; yLtrav[i]= uLeft;

    if (uSum  < minSum) minSum = uSum;  if (uSum  > maxSum) maxSum = uSum;
    if (uRight< minR)   minR   = uRight;if (uRight> maxR)   maxR   = uRight;
    if (uLeft < minL)   minL   = uLeft; if (uLeft > maxL)   maxL   = uLeft;
  }

  // ---- per-panel symmetric scaling (clean & comparable inside each subplot) ----
  const pad = 0.8; 

  // Fixed vertical bound for the LEFT plot so it doesn't quantize
  const yBoundLeft = 1.2;             // ← tune here if you change slider ranges
  const sSum = (left.h * 0.5 * pad) / yBoundLeft;

  const yBoundRight = 1.2;            // ← tune here if you change slider ranges
  const sR   = (rightT.h* 0.5 * pad) / yBoundRight;
  const sL   = (rightB.h* 0.5 * pad) / yBoundRight;

  // mappers
  const xToPx = (panel) => (x) => panel.x + x * panel.w;
  const yToPx = (panel, s) => (v) => panel.y + panel.h/2 - v * s;

  const xL = xToPx(left),   yL = yToPx(left,   sSum);
  const xRT= xToPx(rightT), yRT= yToPx(rightT, sR);
  const xRB= xToPx(rightB), yRB= yToPx(rightB, sL);

  // axes
  axes(left.x,  left.y,  left.w,  left.h, 'solution');
  axes(rightT.x,rightT.y,rightT.w,rightT.h,'right-travelling');
  axes(rightB.x,rightB.y,rightB.w,rightB.h,'left-travelling');

  // draw curves
  ctx.lineWidth = 2;

  // left panel (black)
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const xp = xL(xs[i]), yp = yL(ySum[i]);
    if (i === 0) ctx.moveTo(xp, yp); else ctx.lineTo(xp, yp);
  }
  ctx.stroke();

  // top-right 
  ctx.strokeStyle = '#828282';
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const xp = xRT(xs[i]), yp = yRT(yR[i]);
    if (i === 0) ctx.moveTo(xp, yp); else ctx.lineTo(xp, yp);
  }
  ctx.stroke();

  // bottom-right 
  ctx.strokeStyle = '#828282';
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const xp = xRB(xs[i]), yp = yRB(yLtrav[i]);
    if (i === 0) ctx.moveTo(xp, yp); else ctx.lineTo(xp, yp);
  }
  ctx.stroke();

  

  // optional x labels
  ctx.fillStyle = '#333';
  ctx.font = '12px system-ui, sans-serif';
//   ctx.fillText('x', left.x  + left.w  - 10, left.y  + left.h  + 22);
//   ctx.fillText('x', rightT.x+ rightT.w - 10, rightT.y+ rightT.h + 22);
//   ctx.fillText('x', rightB.x+ rightB.w - 10, rightB.y+ rightB.h + 22);
}



  function update() {
    const t = time ? parseFloat(time.value) : 0; 

    if (tVal) tVal.textContent = t.toFixed(2);   

    draw(t);
    }


// update on slider input
[time].filter(Boolean).forEach(el => el.addEventListener('input', update)); // NEW


// redraw when the slide becomes visible
if (window.Reveal) {
  Reveal.on('slidechanged', e => {
    if (e.currentSlide && e.currentSlide.contains(canvas)) update();
  });
  Reveal.on('ready', () => { if (canvas.isConnected) update(); });
}

update(); // initial draw


})();
