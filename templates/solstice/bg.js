/* Solstice — motion background
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
  if (!gl) { canvas.style.background = 'radial-gradient(circle at 50% 31%,#fff21a 0,#ff8c05 16%,#e85204 22%,#5a0a02 24%,#2a0302 60%)'; return; }

  const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const frag = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m; uniform vec2 o;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.3,7.7);a*=.5;}return v;}
float capsule(vec2 p,vec2 a,vec2 b,float rr){vec2 pa=p-a,ba=b-a;float k=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*k)-rr;}
void main(){
  float asp=r.x/r.y;
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=vec2(uv.x*asp,uv.y);
  float horizon=.27;
  float T=t;

  // sky: deep maroon, warming toward the horizon
  vec3 col=mix(vec3(.4,.045,.01),vec3(.17,.012,.008),smoothstep(horizon,.9,uv.y));

  // the sun — slowly breathing, with soft convection on its face
  float S=min(asp,1.)*.31;
  vec2 sc=vec2(o.x*asp,.69+.012*sin(T*.25))+(m-.5)*vec2(asp,1.)*.015;
  float d=length(p-sc);
  float R=S*(1.+.01*sin(T*.6));
  vec2 lp=(p-sc)/R;
  float face=smoothstep(1.,.985,d/R);
  float conv=fbm(lp*3.+vec2(T*.03,-T*.05));
  vec3 sun=mix(vec3(1.,.97,.15),vec3(1.,.55,.02),smoothstep(.0,1.1,length(lp-vec2(.35,.3))));
  sun=mix(sun,vec3(.92,.32,.02),smoothstep(.75,1.,d/R));
  sun*=.94+.1*conv;
  col+=vec3(1.,.35,.05)*.55*exp(-max(d-R,0.)*6./S*.35)*(1.-face);   // halo
  col=mix(col,sun,face);

  // ground fog: bright band at the horizon, rolling slowly sideways
  {
    float k=max(horizon-uv.y,0.)/horizon;
    float fog=fbm(vec2(p.x*1.5-T*.05,uv.y*6.)+fbm(p*2.+T*.03));
    vec3 g=mix(vec3(1.,.55,.08),vec3(.95,.38,.03),smoothstep(0.,.35,k));
    g=mix(g,vec3(.85,.3,.02),smoothstep(.3,1.,k));
    g*=.88+.22*fog;
    col=mix(col,g,smoothstep(horizon+.025,horizon-.03,uv.y));
  }
  // haze band straddling the horizon
  col=mix(col,vec3(1.,.55,.12),.45*exp(-pow((uv.y-horizon)*18.,2.)));

  // tiny figure standing on the fog, with a long shadow toward the viewer
  vec2 fp=vec2(o.x*asp,.1);
  float fs=.032;
  vec2 q=(p-fp)/fs;
  float body=capsule(q,vec2(0.,.35),vec2(0.,1.1),.28);
  body=min(body,capsule(q,vec2(-.12,0.),vec2(-.1,.6),.12));
  body=min(body,capsule(q,vec2(.12,0.),vec2(.1,.6),.12));
  body=min(body,length(q-vec2(0.,1.48))-.24);
  float fig=smoothstep(.04,-.04,body);
  vec2 sq=vec2(q.x+q.y*1.6,-q.y*3.);                  // skewed, squashed shadow
  float sh=smoothstep(.6,-.3,capsule(sq,vec2(0.,.0),vec2(-1.4,.5),.25))*step(q.y,0.);
  col*=1.-.35*sh;
  col=mix(col,vec3(.12,.03,.01),fig);

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
    if (uo) gl.uniform2f(uo, focus[0], focus[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);
})();
