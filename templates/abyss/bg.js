/* Abyss — motion background
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
  if (!gl) { canvas.style.background = 'linear-gradient(180deg,#020708,#04201f 45%,#11605c 80%,#3fc7bd)'; return; }

  const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const frag = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
// water height: interfering directional swells, gently warped by noise
float H(vec2 p,float T){
  p*=2.6;
  p+=vec2(noise(p*.3+T*.1),noise(p*.3-T*.1+7.))*2.2;
  float v=0.;
  v+=.50*sin(dot(p,vec2(.9,.4))*2.1+T*1.1);
  v+=.35*sin(dot(p,vec2(-.6,.8))*2.9-T*1.3);
  v+=.22*sin(dot(p,vec2(.2,-1.))*4.3+T*1.7);
  v+=.14*sin(dot(p,vec2(-.95,-.3))*6.1-T*2.1);
  v+=.08*sin(dot(p,vec2(.7,.7))*9.7+T*2.6);
  v+=.05*sin(dot(p,vec2(-.3,.95))*14.3-T*3.1);
  v+=.03*sin(dot(p,vec2(.99,-.1))*21.1+T*3.7);
  return v*.5+.5;
}
void main(){
  float asp=r.x/r.y;
  vec2 uv=gl_FragCoord.xy/r;
  float T=t*.25;
  // perspective: bottom of screen is near, top recedes far away
  float depth=1./(1.08-uv.y*.92);
  vec2 w=vec2((uv.x-.5)*asp*depth*1.6,depth*2.2);
  w+=(m-.5)*vec2(.6,.3);                              // pointer sways the surface
  float e=.01;
  float h0=H(w,T), hx=H(w+vec2(e,0.),T), hy=H(w+vec2(0.,e),T);
  vec3 n=normalize(vec3((h0-hx)/e,(h0-hy)/e,4.5));
  float light=pow(max(dot(n,normalize(vec3(.35,-.55,.75))),0.),4.);
  float glint=pow(max(dot(n,normalize(vec3(-.2,-.4,.9))),0.),40.);

  float bright=pow(smoothstep(.95,-.1,uv.y),2.2);   // light comes from below
  vec3 deep=vec3(.008,.035,.04), teal=vec3(.12,.62,.6), foam=vec3(.45,.95,.9);
  vec3 col=mix(deep,teal*.5,bright);
  col+=teal*light*(.025+.8*bright);
  col+=foam*glint*(.05+.5*bright);
  col+=(h21(gl_FragCoord.xy+fract(t))-.5)*.025;
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

  const SCALE = 0.75; // render scale vs CSS pixels — lower = faster, softer
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
