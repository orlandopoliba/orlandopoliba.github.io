(function () {
  // Match the XY-vortex palette: angle 0 is red and upward (pi/2) is green.
  const hue = a => { const degrees=(a * 180 / Math.PI) % 360; return `hsl(${(degrees+360)%360} 75% 68% / 100%)`; };
  function setupSingularityPlot() {
    const c = document.getElementById('singularityCanvas'); if (!c) return;
    let movableAngle = Math.PI / 3, dragging = false; window._movableAngle = movableAngle;
    const draw = () => {
      const d = devicePixelRatio || 1, w = Math.min(320, c.parentElement.clientWidth || 320), h = w;
      c.width=w*d; c.height=h*d; c.style.width=`${w}px`; c.style.height=`${h}px`;
      const x0=w/2,y0=h/2,r=Math.min(w,h)*.38, x=c.getContext('2d'); x.setTransform(d,0,0,d,0,0); x.clearRect(0,0,w,h);
      const phiAt=(q,t,a)=>{ const raw=t<=a ? 2*Math.PI*t/a : 2*Math.PI*(2*Math.PI-t)/(2*Math.PI-a); const s=Math.min(1,q/.22); const smooth=s*s*(3-2*s); return Math.PI+(raw-Math.PI)*smooth; };
      for(let y=y0-r;y<y0+r;y+=2) for(let xx=x0-r;xx<x0+r;xx+=2) { let dx=xx-x0,dy=y-y0; if(dx*dx+dy*dy<=r*r){let t=Math.atan2(-dy,dx);if(t<0)t+=2*Math.PI;let a=((movableAngle%(2*Math.PI))+2*Math.PI)%(2*Math.PI),phi=phiAt(Math.hypot(dx,dy)/r,t,a);x.fillStyle=hue(phi);x.fillRect(xx,y,2.2,2.2);} }
      x.strokeStyle='#222';x.lineWidth=3;x.beginPath();x.arc(x0,y0,r,0,7);x.stroke();
      x.strokeStyle='rgba(0,0,0,.72)';x.fillStyle='#222';x.lineWidth=1.25;let s=Math.max(14,r/10);
      const n=Math.ceil(r/s)+1;
      for(let j=-n;j<=n;j++) for(let i=-n;i<=n;i++){let xx=x0+i*s,y=y0+j*s,dx=xx-x0,dy=y-y0,q=Math.hypot(dx,dy);if(q>r-5||q<4)continue;let t=Math.atan2(-dy,dx);if(t<0)t+=2*Math.PI;let a0=((movableAngle%(2*Math.PI))+2*Math.PI)%(2*Math.PI),phi=phiAt(q/r,t,a0),ux=Math.cos(phi),uy=-Math.sin(phi),l=Math.min(12,s*.34),tx=xx+ux*l,ty=y+uy*l,a=phi;x.beginPath();x.moveTo(xx-ux*l,y-uy*l);x.lineTo(tx,ty);x.stroke();x.beginPath();x.moveTo(tx,ty);x.lineTo(tx-Math.cos(a-.55)*4,ty+Math.sin(a-.55)*4);x.lineTo(tx-Math.cos(a+.55)*4,ty+Math.sin(a+.55)*4);x.fill();}
      x.lineWidth=3; x.strokeStyle='#111';
      // Fixed radius to (1,0), and the draggable radius.
      x.beginPath(); x.moveTo(x0,y0); x.lineTo(x0+r,y0); x.stroke();
      x.strokeStyle='#111'; x.beginPath(); x.moveTo(x0,y0); x.lineTo(x0+r*Math.cos(movableAngle),y0-r*Math.sin(movableAngle)); x.stroke();
      x.fillStyle='#000';x.beginPath();x.arc(x0,y0,7,0,7);x.fill();
    };
    const moveRadius = e => { const box=c.getBoundingClientRect(), px=e.clientX-box.left, py=e.clientY-box.top;
      if (Math.hypot(px-w0(c), py-h0(c)) <= 1) return;
      movableAngle=Math.atan2(-(py-h0(c)),px-w0(c)); window._movableAngle=movableAngle; draw(); window._redrawSingularity3d?.(); };
    const w0=() => c.clientWidth/2, h0=() => c.clientHeight/2;
    c.addEventListener('pointerdown', e => { const dx=e.offsetX-w0(),dy=e.offsetY-h0(); if(Math.hypot(dx,dy)<c.clientWidth*.48){dragging=true;c.setPointerCapture(e.pointerId);moveRadius(e);} });
    c.addEventListener('pointermove', e => { if(dragging) moveRadius(e); });
    c.addEventListener('pointerup', () => dragging=false);
    window.addEventListener('resize',draw); draw();
  }
  function setupSingularity3dPlot(){
    const c=document.getElementById('singularity3dCanvas'); if(!c)return;
    // Graph of the unique lifting on B_1 \ {(t,0): t >= 0}: theta in (0,2 pi).
    // Polar strips make the cut explicit and avoid interpolating across its jump.
    let drag=false,yaw=-.65,pitch=.48,sx,sy;
    const draw=()=>{
      const d=devicePixelRatio||1,w=Math.min(320,c.parentElement.clientWidth||320),h=w;
      c.width=w*d;c.height=h*d;c.style.width=`${w}px`;c.style.height=`${h}px`;
      const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
      const scale=w*.29, cx=w/2, cy=h*.58;
      const project=(X,Y,Z)=>[cx+(X*Math.cos(yaw)-Y*Math.sin(yaw))*scale,
        cy-(Z*Math.cos(pitch)+(X*Math.sin(yaw)+Y*Math.cos(yaw))*Math.sin(pitch))*scale];
      const n=72,m=32, tris=[];
      for(let j=0;j<m;j++) for(let i=0;i<n;i++){
        const a=2*Math.PI*i/n, b=2*Math.PI*(i+1)/n, r=j/m, q=(j+1)/m;
        const cutAngle=((window._movableAngle ?? Math.PI/3)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
        const theta=(t)=>t<=cutAngle ? 2*t/cutAngle : 2*(2*Math.PI-t)/(2*Math.PI-cutAngle);
        // Smooth the lifting to its angular average pi near the singularity.
        const arc=Math.min(cutAngle,2*Math.PI-cutAngle);
        const smoothRadius=Math.max(.06,.22*arc);
        const smooth=(s)=>s*s*(3-2*s);
        const thetaAt=(rr,t)=>{
          const q=Math.min(1,rr/smoothRadius);
          const value=1+(theta(t)-1)*smooth(q);
          return Math.max(0,Math.min(2,value));
        };
        const P=(rr,t)=>project(rr*Math.cos(t),rr*Math.sin(t),thetaAt(rr,t));
        // Each cell is wholly on one side of the cut (a=0 is never joined to 2pi).
        const mid=(r+q)/2, ang=(a+b)/2;
        const depth=mid*Math.sin(ang+yaw)*Math.cos(pitch)-thetaAt(mid,ang)*Math.sin(pitch);
        const colorAngle=Math.PI*thetaAt(mid,ang);
        tris.push({v:[P(r,a),P(q,a),P(q,b)],t:colorAngle,d:depth});
        tris.push({v:[P(r,a),P(q,b),P(r,b)],t:colorAngle,d:depth});
      }
      // Draw the domain boundary first so it cannot appear through the graph.
      g.strokeStyle='#333';g.lineWidth=3;g.beginPath();
      for(let i=0;i<=96;i++){const a=2*Math.PI*i/96,p=project(Math.cos(a),Math.sin(a),0);if(i===0)g.moveTo(...p);else g.lineTo(...p);} g.stroke();
      // The same two radii shown in the planar plot: the fixed cut and the movable one.
      const movable=window._movableAngle ?? Math.PI/3;
      g.strokeStyle='#111';g.lineWidth=3;
      [0,movable].forEach(a=>{const p=project(Math.cos(a),Math.sin(a),0);g.beginPath();g.moveTo(...project(0,0,0));g.lineTo(...p);g.stroke();});
      tris.sort((A,B)=>B.d-A.d);
      // Periodic copies: phi is defined modulo 2, so theta -> theta +/- 2.
      const drawMesh=(offset,opacity)=>{
        g.globalAlpha=opacity;
        const dy=-offset*Math.cos(pitch)*scale;
        tris.forEach(T=>{g.beginPath();g.moveTo(T.v[0][0],T.v[0][1]+dy);T.v.slice(1).forEach(p=>g.lineTo(p[0],p[1]+dy));g.closePath();g.fillStyle=hue(T.t);g.fill();g.strokeStyle='rgba(40,40,40,.16)';g.lineWidth=.45;g.stroke();});
      };
      drawMesh(-2,.18); drawMesh(2,.18); g.globalAlpha=1;
      drawMesh(0,1);
      // Along the moving-radius seam, show the full angular transition 0 -> 2pi.
      g.lineWidth=7;
      for(let j=0;j<48;j++){
        const z0=2*j/48,z1=2*(j+1)/48;
        g.strokeStyle=hue(Math.PI*(z0+z1)/2);g.beginPath();
        g.moveTo(...project(.72*Math.cos(cutAngle),.72*Math.sin(cutAngle),z0));
        g.lineTo(...project(.72*Math.cos(cutAngle),.72*Math.sin(cutAngle),z1));g.stroke();
      }

    };
    window._redrawSingularity3d=draw;
    c.addEventListener('pointerdown',e=>{drag=true;sx=e.clientX;sy=e.clientY;c.setPointerCapture(e.pointerId)});
    c.addEventListener('pointermove',e=>{if(drag){yaw+=(e.clientX-sx)*.01;pitch=Math.max(-.9,Math.min(1.3,pitch+(e.clientY-sy)*.01));sx=e.clientX;sy=e.clientY;draw()}});
    c.addEventListener('pointerup',()=>drag=false);c.addEventListener('pointercancel',()=>drag=false);
    window.addEventListener('resize',draw);draw();
  }
  window.setupSingularityPlot=setupSingularityPlot;window.setupSingularity3dPlot=setupSingularity3dPlot;
})();
