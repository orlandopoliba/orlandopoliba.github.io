(function () {
  function setupNepsPlot() {
    const slide = document.querySelector('.N-eps-row');
    if (!slide) return;
    const latticeHost = slide.querySelector('.lattice-to-zero-plot');
    const circleHost = slide.querySelector('.N-to-infty-plot');
    const epsInput = slide.querySelector('#eps-to-zero-slider');
    const rateInput = slide.querySelector('#rate-slider');
    const epsValue = slide.querySelector('.eps-value');
    const lattice = document.createElement('canvas'), circle = document.createElement('canvas');
    latticeHost.appendChild(lattice); circleHost.appendChild(circle);
    function value() { return +epsInput.value; }
    function draw() {
      const d = devicePixelRatio || 1, eps = value(), rate = +rateInput.value;
      if (epsValue) epsValue.textContent = eps.toFixed(2).replace(/\.00$/, '');
      const w = Math.min(520, latticeHost.clientWidth || 520), h = 270;
      [lattice, circle].forEach(c => { c.width=w*d; c.height=h*d; c.style.width=w+'px'; c.style.height=h+'px'; });
      const lc=lattice.getContext('2d'), cc=circle.getContext('2d');
      lc.setTransform(d,0,0,d,0,0); cc.setTransform(d,0,0,d,0,0);
      lc.clearRect(0,0,w,h); cc.clearRect(0,0,w,h);
      // A fixed viewing window makes the shrinking lattice spacing visible.
      const spacing = Math.max(5, Math.min(70, eps * 145));
      lc.fillStyle='#222';
      for (let x=spacing/2; x<w; x+=spacing) for (let y=spacing/2; y<h; y+=spacing) {
        lc.beginPath(); lc.arc(x,y,Math.max(1.8, Math.min(4, spacing*.09)),0,Math.PI*2); lc.fill();
      }
      // The rate controls the power p in N_epsilon ~ epsilon^(-p).
      // A positive minimum exponent keeps even the slow setting growing.
      const p = 3 - 2.75 * rate;
      const N = Math.max(4, Math.round(4 * Math.pow(1 / eps, p)));
      const cx=w/2, cy=h/2, r=Math.min(w,h)*.34;
      cc.strokeStyle='#222'; cc.lineWidth=2; cc.beginPath(); cc.arc(cx,cy,r,0,Math.PI*2); cc.stroke();
      cc.fillStyle='#222'; for(let i=0;i<N;i++){ const a=2*Math.PI*i/N; cc.beginPath(); cc.arc(cx+r*Math.cos(a),cy+r*Math.sin(a),5,0,Math.PI*2); cc.fill(); }
    }
    [epsInput, rateInput].forEach(input => input.addEventListener('input', draw));
    addEventListener('resize', draw); draw();
  }
  window.setupNepsPlot = setupNepsPlot;
})();
