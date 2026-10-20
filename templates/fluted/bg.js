/* Fluted — motion background
 * Usage: <canvas data-bg></canvas> inside any positioned container, then <script src="bg.js"></script>.
 * No canvas found → a fixed full-screen one is created behind the page.
 */
(() => {
  let canvas = document.querySelector('canvas[data-bg]');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.setAttribute('data-bg', '');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;display:block';
    document.body.prepend(canvas);
  }
  const gl = canvas.getContext('webgl', { antialias:false, alpha:false });
  if (!gl) { canvas.style.background = 'repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 4px,transparent 4px 9px),linear-gradient(110deg,#7a0606,#e3502f 70%,#f78a63)'; return; }

  const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const frag = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
// Reeded glass. Call reedTaps(uv, cell) to get a lens offset + rib highlight for a vertical rib of \`cell\` px.
// Each rib acts like a little cylinder lens: it squeezes and mirrors the scene behind it.
vec3 reed(float coord,float cell){
  float f=fract(coord/cell);
  float bend=(f-.5);
  float shade=sin(f*3.14159);
  return vec3(bend,shade,f);
}

// behind the glass: red wash, a dark drifting brush shape, and a light that follows the pointer
vec3 scene(vec2 uv,float asp){
  vec3 c=mix(vec3(.5,.02,.03),vec3(.98,.42,.3),clamp(uv.x*.85+uv.y*.25,0.,1.));
  float T=t*.25;
  float y1=.62+.09*sin(uv.x*4.+T)+.04*sin(uv.x*9.-T*1.7);
  float band=smoothstep(.085,.0,abs(uv.y-y1)*.75+(noise(uv*vec2(9.,3.)+T)-.5)*.06)*smoothstep(.75,.15,uv.x+.15*sin(T*.7));
  vec2 b2=vec2(.62+.12*sin(T*.8),.38+.08*cos(T*.6));
  vec2 d2=(uv-b2)*vec2(asp,1.);
  float blob=smoothstep(.2,.05,length(d2*vec2(1.,1.6))+(noise(uv*6.+T)-.5)*.12);
  c=mix(c,vec3(.3,0.,.02),max(band*.9,blob*.85));
  vec2 dl=(uv-m)*vec2(asp,1.);
  c+=vec3(1.,.72,.45)*exp(-dot(dl,dl)*40.)*1.1+vec3(1.,.3,.15)*exp(-dot(dl,dl)*5.)*.35;
  return c;
}
void main(){
  float asp=r.x/r.y;
  vec2 uv=gl_FragCoord.xy/r;
  float N=asp>1.2?5.:3.;
  float k=mod(floor(uv.x*N),5.);
  vec2 px=gl_FragCoord.xy*(900./r.y);                 // pattern scale independent of resolution
  vec2 off=vec2(0.); float shade=0.;
  // five panels, five reeding patterns (like the reference sheet)
  if(k<.5){       vec3 q=reed(px.x,22.);         off.x=q.x*.11; shade=q.y; }
  else if(k<1.5){ vec3 q=reed(px.y,26.);        off.y=q.x*.13;  shade=q.y; }
  else if(k<2.5){ vec3 a=reed(px.x,26.),b=reed(px.y,26.); off=vec2(a.x,b.x)*.1; shade=a.y*b.y; }
  else if(k<3.5){ vec3 q=reed(px.x+px.y,30.);   off=vec2(.7)*q.x*.14; shade=q.y; }
  else{           vec3 q=reed(px.x*.5+px.y,44.); off=vec2(.45,.9)*q.x*.2; shade=q.y; }
  vec2 suv=uv+off;
  vec3 col=vec3(0.);
  for(int i=0;i<4;i++){                               // a little frosting
    float a=float(i)*1.5708+h21(gl_FragCoord.xy)*.6;
    col+=scene(suv+vec2(cos(a),sin(a))*.008,asp);
  }
  col*=.25;
  col*=.86+.22*shade;
  float seam=abs(fract(uv.x*N)-.5)*2.;
  col*=1.-.22*smoothstep(.985,1.,seam);
  col+=(h21(gl_FragCoord.xy+fract(t))-.5)*.03;
  gl_FragColor=vec4(col,1.);
}
`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(prog, 0, 'p');
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n), ur = U('r'), ut = U('t'), um = U('m'), uo = U('o');
  const focus = (canvas.dataset.focus || '.5,.5').split(',').map(Number); // optional: <canvas data-bg data-focus="x,y">

  const SCALE = 1; // render scale vs CSS pixels — lower = faster, softer
  const resize = () => { canvas.width = canvas.clientWidth * SCALE; canvas.height = canvas.clientHeight * SCALE; gl.viewport(0, 0, canvas.width, canvas.height); };
  new ResizeObserver(resize).observe(canvas); resize();

  let mx = .5, my = .5, tx = mx, ty = my, visible = true;
  addEventListener('pointermove', e => { const b = canvas.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width; ty = 1 - (e.clientY - b.top) / b.height; });
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(canvas);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();
  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible) return;
    mx += (tx - mx) * .04; my += (ty - my) * .04;
    gl.uniform2f(ur, canvas.width, canvas.height);
    gl.uniform1f(ut, still ? 20 : (now - t0) / 1000);
    gl.uniform2f(um, mx, my);
    if (uo) gl.uniform2f(uo, focus[0], focus[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);
})();
