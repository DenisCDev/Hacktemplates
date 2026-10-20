/* Aura — motion background
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
  if (!gl) { canvas.style.background = 'radial-gradient(circle at 50% 50%,#ff7a2e,#ffb07a 22%,#ffd9ec 40%,#fffdf9 60%)'; return; }

  const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const frag = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m; uniform vec2 o;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float blob(vec2 p,vec2 c,float rad){vec2 d=p-c;return exp(-dot(d,d)/(rad*rad));}
void main(){
  float asp=r.x/r.y;
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=vec2(uv.x*asp,uv.y);
  vec2 c=vec2(o.x*asp,o.y)+(m-.5)*vec2(asp,1.)*.04;
  float S=min(1.,asp)*.95;                            // orb scale tracks the short side
  float T=t*.35;
  // warp space a little so the orb's edge breathes
  vec2 q=p+(vec2(noise(p*2.+T*.3),noise(p*2.-T*.3+5.))-.5)*.08*S;

  vec3 col=vec3(1.,.992,.975);                        // warm paper
  col=mix(col,vec3(1.,.72,.84),.55*blob(q,c+S*vec2(-.2,-.02),.42*S));                         // pink haze
  col=mix(col,vec3(1.,.83,.6),.6*blob(q,c,.48*S));                                           // peach halo
  col=mix(col,vec3(1.,.47,.18),.9*blob(q,c+S*vec2(.03*sin(T),-.06),.26*S));                  // orange core
  col=mix(col,vec3(1.,.15,.22),.8*blob(q,c+S*vec2(-.17+.04*sin(T*.7),.05*cos(T*.9)),.13*S)); // red flare
  col=mix(col,vec3(1.,.42,.14),.6*blob(q,c+S*vec2(-.05,.05),.17*S));
  col=mix(col,vec3(1.,.72,.1),.85*blob(q,c+S*vec2(.1+.05*cos(T*.8),.13+.04*sin(T)),.15*S)); // yellow crest
  col=mix(col,vec3(1.,.8,.2),.5*blob(q,c+S*vec2(.22,.05+.03*sin(T*1.2)),.1*S));
  col+=(h21(gl_FragCoord.xy+fract(t))-.5)*.02;
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
    if (uo) gl.uniform2f(uo, focus[0], focus[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);
})();
