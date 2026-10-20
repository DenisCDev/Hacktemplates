/* Prism — motion background
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
  if (!gl) { canvas.style.background = 'conic-gradient(from 200deg at 47% 53%,#ff0029,#ff6100,#0df226,#d1ff4d,#bf0d1f,#05031a,#05066b,#5200a0,#d9007f,#ff0029)'; return; }

  const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const frag = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
// colour stops by angle (turns, CCW from +x), sampled from the reference photo
vec3 wheel(float a){
  a=fract(a);
  vec3 c=vec3(.82,1.,.3);
  c=mix(c,vec3(.05,.95,.15),smoothstep(.0,.12,a));
  c=mix(c,vec3(1.,.38,0.),smoothstep(.18,.3,a));
  c=mix(c,vec3(1.,0.,.16),smoothstep(.3,.4,a));
  c=mix(c,vec3(.85,0.,.5),smoothstep(.4,.48,a));
  c=mix(c,vec3(.32,0.,.62),smoothstep(.48,.6,a));
  c=mix(c,vec3(.02,.02,.42),smoothstep(.6,.7,a));
  c=mix(c,vec3(.02,.01,.16),smoothstep(.7,.79,a));
  c=mix(c,vec3(.75,.05,.12),smoothstep(.8,.92,a));
  c=mix(c,vec3(.82,1.,.3),smoothstep(.92,1.,a));
  return c;
}
void main(){
  float asp=r.x/r.y;
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=vec2(uv.x*asp,uv.y);
  // dark core sits a little right of center and leans toward the pointer
  vec2 c=vec2(asp*.47,.47)+(m-.5)*vec2(asp,1.)*.18;
  vec2 d=p-c;
  float n=noise(p*1.2+t*.08);
  float a=atan(d.y,d.x)/6.2831853;
  float dist=length(d*vec2(.85,1.));
  float ang=a+.06*sin(t*.15)+.06*sin(t*.3-dist*4.)+(n-.5)*.1;   // slow liquid swirl
  float v=smoothstep(.04,.75,dist+(n-.5)*.12);
  vec3 col=wheel(ang)*v;
  col=mix(col,col+.18,smoothstep(.9,1.5,dist));       // corners glow a touch hotter
  col=pow(col,vec3(1.1));
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
  const U = n => gl.getUniformLocation(prog, n), ur = U('r'), ut = U('t'), um = U('m');

  const SCALE = 0.6; // render scale vs CSS pixels — lower = faster, softer
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
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);
})();
