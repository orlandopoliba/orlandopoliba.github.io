(function () {
  const cols = 20, rows = 6, N = 8;
  function arrow(ctx, x, y, angle, length, head) {
    const dx = Math.cos(angle) * length, dy = Math.sin(angle) * length;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke();
    const tx = x + dx, ty = y + dy;
    ctx.beginPath(); ctx.moveTo(tx, ty);
    ctx.lineTo(tx - Math.cos(angle - Math.PI / 6) * head, ty - Math.sin(angle - Math.PI / 6) * head);
    ctx.lineTo(tx - Math.cos(angle + Math.PI / 6) * head, ty - Math.sin(angle + Math.PI / 6) * head);
    ctx.closePath(); ctx.fill();
  }
  function arrowCentered(ctx, x, y, angle, length, head) {
    arrow(ctx, x - Math.cos(angle) * length / 2, y - Math.sin(angle) * length / 2, angle, length, head);
  }
  function setupNClockPlot() {
    const canvas = document.getElementById('nClockInterfacesCanvas'), control = document.getElementById('nClockAngleCanvas');
    const label = control && control.parentElement.querySelector('.angle-label');
    if (!canvas || !control) return;
    let theta = Math.PI;
    function draw() {
      const d = devicePixelRatio || 1, w = Math.min(900, canvas.parentElement.clientWidth || 900), h = Math.min(300, w * rows / cols);
      canvas.width = w*d; canvas.height = h*d; canvas.style.width = w+'px'; canvas.style.height = h+'px';
      const c = canvas.getContext('2d'); c.setTransform(d,0,0,d,0,0); c.clearRect(0,0,w,h);
      const step = Math.min((w-56)/(cols-1),(h-56)/(rows-1)), x0=(w-step*(cols-1))/2, y0=(h-step*(rows-1))/2;
      const k = Math.max(1, Math.ceil(Math.PI/theta)), start=(cols-1-k)/2;
      for(let i=0;i<cols;i++) for(let j=0;j<rows;j++) { const f=Math.max(0,Math.min(1,(i-start)/k)), a=-f*Math.PI, x=x0+i*step,y=y0+j*step;
        c.fillStyle=`hsl(${((a*180/Math.PI)+360)%360} 75% 68%)`; c.fillRect(x-step/2,y-step/2,step,step); c.strokeStyle=c.fillStyle='#222'; c.lineWidth=2; arrowCentered(c,x,y,a,Math.min(18,step*.55),6); }
    }
    function drawControl() {
      const d=devicePixelRatio||1,w=560,h=220; control.width=w*d;control.height=h*d;control.style.width=w+'px';control.style.height=h+'px';
      const c=control.getContext('2d');c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);const x=w/2,y=110,l=68;
      c.strokeStyle=c.fillStyle='#222';c.lineWidth=2.5;arrow(c,x,y,0,l,9);arrow(c,x,y,-theta,l,9);c.beginPath();c.arc(x,y,l,-theta,0);c.stroke();
      c.font='italic 24px DM Sans, sans-serif'; c.textAlign='center'; c.textBaseline='middle';
      const labelAngle=-theta/2, labelRadius=l+15;
      if (label) { label.style.left='50%'; label.style.top=`${y}px`; label.style.transform=`translate(${Math.cos(-theta/2)*(l+15)}px, ${Math.sin(-theta/2)*(l+15)}px) translate(-50%, -50%)`; }
      for(let i=0;i<N;i++){const a=-i*Math.PI/(N-1);c.beginPath();c.arc(x+Math.cos(a)*l,y+Math.sin(a)*l,5,0,2*Math.PI);c.fill();}
    }
    function update(e){const r=control.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-110;let a=Math.atan2(-y,x);if(a<0)a+=2*Math.PI;let i=Math.round(Math.min(Math.PI,a)*(N-1)/Math.PI);theta=Math.max(Math.PI/(N-1),i*Math.PI/(N-1));drawControl();draw();}
    control.addEventListener('pointerdown',e=>{control.setPointerCapture(e.pointerId);update(e)});control.addEventListener('pointermove',e=>{if(e.buttons)update(e)});
    addEventListener('resize',()=>{draw();drawControl()});draw();drawControl();
  }
  window.setupNClockPlot=setupNClockPlot;
})();
