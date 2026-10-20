/* Beam — motion background
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
  if (!gl) { canvas.style.background = 'radial-gradient(30% 6% at 50% 88%,#ff1a14,transparent),linear-gradient(90deg,#000 49.6%,#ff2a1a 50%,#000 50.4%)'; return; }

  const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const frag = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m; uniform vec2 o;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float capsule(vec2 p,vec2 a,vec2 b,float rr){vec2 pa=p-a,ba=b-a;float k=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*k)-rr;}
void main(){
  float asp=r.x/r.y;
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=vec2(uv.x*asp,uv.y);
  float floorY=.13;
  float bx=o.x*asp+(m.x-.5)*.01;
  float flick=.9+.06*sin(t*13.)*sin(t*7.3)+.04*noise(vec2(t*3.,0.));
  float dx=abs(p.x-bx);
  float hgt=max(uv.y-floorY,0.);

  // beam: razor core + soft cone that widens as it nears the floor
  float wcore=.0025+.004*smoothstep(.6,.0,hgt);
  float wglow=.012+.09*smoothstep(.55,.0,hgt);
  float core=exp(-pow(dx/wcore,2.));
  float glow=exp(-dx/wglow)*.55;
  float haze=exp(-dx/(.18+.2*smoothstep(.4,.0,hgt)))*.12;
  float beam=(core+glow+haze)*step(floorY,uv.y)*flick;
  vec3 red=vec3(1.,.06,.05);
  vec3 col=red*beam;
  col+=vec3(1.,.5,.45)*core*.5*step(floorY,uv.y);      // white-hot center

  // floor: glossy pool of light + faint reflection of the beam
  float fy=uv.y-floorY;
  float pool=exp(-(pow((p.x-bx)*1.6,2.)+pow(fy*9.,2.)));
  float rim=exp(-(pow((p.x-bx)*1.5,2.)+pow(fy*80.,2.)));
  col+=red*(pool*.55+rim*.7)*flick;
  if(fy<0.){
    float refl=exp(-dx/(.03+.06*(-fy)*8.))*exp(fy*14.)*.35;
    col+=red*refl*(.8+.2*noise(vec2(p.x*40.,t*2.)));
  }

  // dust motes drifting through the light
  vec2 g=p*vec2(55.,55.)+vec2(0.,-t*1.5);
  vec2 id=floor(g),f=fract(g)-.5;
  float rnd=h21(id);
  vec2 off=vec2(h21(id+3.1),h21(id+7.7))-.5;
  float mote=smoothstep(.09,.0,length(f-off*.7))*step(.86,rnd);
  col+=red*mote*exp(-dx/.09)*1.2*step(floorY,uv.y);

  // lone figure, backlit by the beam
  vec2 fp=vec2(bx,floorY);
  float fs=.075;
  vec2 q=(p-fp)/fs;
  float body=capsule(q,vec2(0.,.42),vec2(0.,1.05),.2);
  body=min(body,capsule(q,vec2(-.08,0.),vec2(-.07,.55),.08));
  body=min(body,capsule(q,vec2(.08,0.),vec2(.07,.55),.08));
  body=min(body,capsule(q,vec2(-.2,.98),vec2(-.24,.5),.06));
  body=min(body,capsule(q,vec2(.2,.98),vec2(.24,.5),.06));
  body=min(body,length(q-vec2(0.,1.36))-.15);
  float fig=smoothstep(.03,-.03,body);
  float edge=smoothstep(.09,.0,abs(body))*(1.-fig);
  col=mix(col,vec3(.02,0.,0.),fig);
  col+=red*edge*.4;
  // shadow cast toward the viewer
  vec2 sq=vec2(q.x*1.6,-q.y*4.);
  col*=1.-.8*smoothstep(.5,-.2,capsule(sq,vec2(0.),vec2(-.6,3.),.35))*step(q.y,0.);

  col*=1.-.4*length((uv-.5)*vec2(1.,.8));             // vignette
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
