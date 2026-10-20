/* Reed Rose — motion background
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
  if (!gl) { canvas.style.background = 'repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 3px,transparent 3px 10px),linear-gradient(90deg,#ee6145,#f48cae 45%,#b89fe0 85%)'; return; }

  const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const frag = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
// coral → pink → lavender, cooling to slate in the lower right (D12)
vec3 scene(vec2 uv){
  float T=t*.06;
  float n=noise(uv*vec2(2.,1.5)+vec2(T,-T));
  float k=uv.x+(n-.5)*.35+.08*sin(T*3.+uv.y*3.)+(m.x-.5)*.1;
  vec3 c=mix(vec3(.93,.38,.27),vec3(.96,.55,.68),smoothstep(.0,.45,k));
  c=mix(c,vec3(.72,.62,.88),smoothstep(.45,.85,k));
  c=mix(c,vec3(.95,.86,.86),.35*smoothstep(.6,1.,uv.y)*(1.-k));          // pale haze along the top
  float dark=smoothstep(.45,.0,uv.y)*smoothstep(.55,.95,uv.x+(n-.5)*.3);
  c=mix(c,vec3(.25,.3,.4),dark*.75);
  return c;
}
// Vertical reeded glass over scene(uv). Define \`vec3 scene(vec2 uv)\` before including.
// cell = rib width in px @900px tall, amt = how far each rib bends the scene, vary = rib width variation
vec3 reedwall(vec2 uv,float cell,float amt,float vary){
  float s=900./r.y;
  float px=gl_FragCoord.x*s;
  float c=px+vary*cell*2.*sin(px/(cell*7.))+vary*cell*sin(px/(cell*2.3)+1.7);   // uneven rib widths
  float f=fract(c/cell);
  vec2 suv=uv+vec2((f-.5)*amt,(f-.5)*amt*.18);
  vec3 col=scene(suv);
  col*=.82+.3*sin(f*3.14159);                         // each rib catches light in its middle
  col*=1.-.3*smoothstep(.9,1.,f);                     // dark seam between ribs
  col+=.05*smoothstep(.0,.08,f)*(1.-smoothstep(.08,.16,f));
  return col;
}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec3 col=reedwall(uv,10.,.06,.6);
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
