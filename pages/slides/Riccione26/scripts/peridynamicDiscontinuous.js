(function () {
  const canvas = document.getElementById('peridynamicDiscontinuousCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  // new: get sliders
  const time = document.getElementById('time4');
  const tVal  = document.getElementById('tVal4');

  // ω(ξ) approximation
  function omega(xi) {
    const alpha = 0.2;
    return Math.pow(Math.abs(xi), alpha);
  }

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

const hat_u = Array.from({ length: 100 }, (_, k) => 1 / (k + 1));

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
  const N = Math.max(400, Math.floor(colW));   // tie resolution to panel width
  const xs = new Array(N), ySum = new Array(N), yR = new Array(N), yLtrav = new Array(N);

  let minSum =  Infinity, maxSum = -Infinity;
  let minR   =  Infinity, maxR   = -Infinity;
  let minL   =  Infinity, maxL   = -Infinity;

  for (let i = 0; i < N; i++) {
    const x = i / (N - 1);   // x in [0,1]
    xs[i] = x;

    const theta = 2 * Math.PI * (x-0.5);

    let uSum = 0, uRight = 0, uLeft = 0;

    for (let k = 1; k <= hat_u.length; k++) {
        uSum += hat_u[k-1] * Math.sin(k*theta) * Math.cos(omega(k) * t) / 2;
        uRight += hat_u[k-1] * 0.5 * Math.sin(k * theta - omega(k) * t);
        uLeft  += hat_u[k-1] * 0.5 * Math.sin(k * theta + omega(k) * t);
    }
   

    ySum[i]  = uSum; yR[i]    = 0.65*uRight; yLtrav[i]= 0.65*uLeft;

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
