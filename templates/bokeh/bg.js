/* Bokeh — motion background
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
  if (!gl) { canvas.style.background = 'radial-gradient(40% 40% at 40% 70%,#16b4c6,transparent),radial-gradient(20% 20% at 32% 28%,#f0857a,transparent),radial-gradient(25% 20% at 92% 5%,#e85cb8,transparent),#1d1c21'; return; }

  const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const frag = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m;
float h(float n){return fract(sin(n*127.1)*43758.5453);}
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){
  float asp=r.x/r.y;
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=vec2(uv.x*asp,uv.y);
  vec2 par=(m-.5)*vec2(asp,1.);
  vec3 col=mix(vec3(.12,.12,.14),vec3(.19,.17,.21),uv.y);

  // large soft light blobs
  for(int i=0;i<14;i++){
    float fi=float(i);
    float k=i<7?.42:.6;
    vec2 s=vec2(h(fi*1.31+.2),h(fi*7.17+2.3));
    vec2 pos; vec3 c; float rad=.14+.16*h(fi*3.7);
    if(i<7){        pos=vec2(.22+.45*s.x,.14+.34*s.y); c=mix(vec3(.04,.72,.84),vec3(.14,.8,.72),s.x); }
    else if(i<10){  pos=vec2(.24+.14*s.x,.66+.12*s.y); c=vec3(.95,.52,.46); rad*=.8; }
    else if(i<12){  pos=vec2(.1+.22*s.x,.86+.1*s.y);   c=vec3(.18,.42,.86); }
    else{           pos=vec2(.78+.22*s.x,.9+.1*s.y);   c=vec3(.92,.36,.72); }
    pos.x*=asp;
    pos+=.09*vec2(sin(t*.13*(.6+s.y)+fi*2.1),cos(t*.11*(.6+s.x)+fi*1.7));
    pos+=par*.05*(.4+s.x);
    vec2 d=p-pos;
    col+=c*exp(-dot(d,d)/(rad*rad))*k;
  }
  // small crisp bokeh discs rising slowly, nearer = bigger + more parallax
  for(int i=0;i<16;i++){
    float fi=float(i);
    float z=h(fi*5.3+1.);
    float rad=.012+.035*z;
    vec2 pos=vec2(h(fi*2.9)*asp,fract(h(fi*8.1)+t*.012*(.4+z)));
    pos.y=pos.y*1.3-.15;
    pos+=par*.12*z;
    float d=length(p-pos);
    float disc=smoothstep(rad,rad*.82,d)*(.6+.4*smoothstep(rad*.5,rad,d)); // brighter rim like real bokeh
    vec3 c=mix(vec3(.4,.9,1.),vec3(1.,.6,.75),h(fi*4.4));
    col+=c*disc*(.06+.12*z);
  }
  col=1.-exp(-col*1.6);                                    // soft tonemap, no clipped cyan
  col*=1.-.35*length(uv-.5);                                // vignette
  col+=(h21(gl_FragCoord.xy+fract(t))-.5)*.04;
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
