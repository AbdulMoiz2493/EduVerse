import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSprings, animated } from '@react-spring/web';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Brain,
  Target,
  Clock,
  RefreshCw,
  LogOut,
  School,
  PenTool,
  Book,
  Info,
  Home,
  Contact,
  Menu,
  X,
  LayoutDashboard
} from "lucide-react";
import {
  Renderer,
  Program,
  Mesh,
  Triangle,
  Vec3,
  Camera,
  Transform
} from "ogl";
import SpotlightCard from "./SpotlightCard/SpotlightCard";
import Aurora from "./Aurora/Aurora";
import "./SpotlightCard/SpotlightCard.css";

// Orb Component
function Orb({
  hue = 322,
  hoverIntensity = 0.5,
  rotateOnHover = true,
  forceHoverState = false,
}) {
  const ctnDom = useRef(null);

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }
    
    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }
    
    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    const vec3 baseColor1 = vec3(0.611765, 0.262745, 0.996078);
    const vec3 baseColor2 = vec3(0.298039, 0.760784, 0.913725);
    const vec3 baseColor3 = vec3(0.062745, 0.078431, 0.600000);
    const float innerRadius = 0.6;
    const float noiseScale = 0.65;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }
    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);
      
      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;
      
      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      float d0 = distance(uv, (r0 * invLen) * uv);
      float v0 = light1(1.0, 10.0, d0);
      v0 *= smoothstep(r0 * 1.05, r0, len);
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;
      
      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(1.5, 5.0, d);
      v1 *= light1(1.0, 50.0, d0);
      
      float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
      
      vec3 col = mix(color1, color2, cl);
      col = mix(color3, col, v0);
      col = (col + v1) * v2 * v3;
      col = clamp(col, 0.0, 1.0);
      
      return extractAlpha(col);
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      
      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
      
      uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);
      
      return draw(uv);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = vec4(col.rgb * col.a, col.a);
    }
  `;

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ),
        },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + "px";
      gl.canvas.style.height = height + "px";
      program.uniforms.iResolution.value.set(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height
      );
    }
    window.addEventListener("resize", resize);
    resize();

    let targetHover = 0;
    let lastTime = 0;
    let currentRot = 0;
    const rotationSpeed = 0.3;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;
      const size = Math.min(width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const uvX = ((x - centerX) / size) * 2.0;
      const uvY = ((y - centerY) / size) * 2.0;

      if (Math.sqrt(uvX * uvX + uvY * uvY) < 0.8) {
        targetHover = 1;
      } else {
        targetHover = 0;
      }
    };

    const handleMouseLeave = () => {
      targetHover = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let rafId;
    const update = (t) => {
      rafId = requestAnimationFrame(update);
      const dt = (t - lastTime) * 0.001;
      lastTime = t;
      program.uniforms.iTime.value = t * 0.001;
      program.uniforms.hue.value = hue;
      program.uniforms.hoverIntensity.value = hoverIntensity;

      const effectiveHover = forceHoverState ? 1 : targetHover;
      program.uniforms.hover.value += (effectiveHover - program.uniforms.hover.value) * 0.1;

      if (rotateOnHover && effectiveHover > 0.5) {
        currentRot += dt * rotationSpeed;
      }
      program.uniforms.rot.value = currentRot;

      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

  return <div ref={ctnDom} className="orb-container" />;
}

// BlurText Component
const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = 'easeOutCubic',
  onAnimationComplete,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef();
  const animatedCount = useRef(0);

  const defaultFrom =
    direction === 'top'
      ? { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,-50px,0)' }
      : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,50px,0)' };

  const defaultTo = [
    {
      filter: 'blur(5px)',
      opacity: 0.5,
      transform: direction === 'top' ? 'translate3d(0,5px,0)' : 'translate3d(0,-5px,0)',
    },
    { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const springs = useSprings(
    elements.length,
    elements.map((_, i) => ({
      from: animationFrom || defaultFrom,
      to: inView
        ? async (next) => {
          for (const step of (animationTo || defaultTo)) {
            await next(step);
          }
          animatedCount.current += 1;
          if (animatedCount.current === elements.length && onAnimationComplete) {
            onAnimationComplete();
          }
        }
        : animationFrom || defaultFrom,
      delay: i * delay,
      config: { easing },
    }))
  );

  return (
    <p ref={ref} className={`blur-text ${className}`}>
      {springs.map((props, index) => (
        <animated.span
          key={index}
          style={{
            ...props,
            display: 'inline-block',
            willChange: 'transform, filter, opacity',
          }}
        >
          {elements[index] === ' ' ? '\u00A0' : elements[index]}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </animated.span>
      ))}
    </p>
  );
};

// MetaBalls Component
function parseHexColor(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function fract(x) {
  return x - Math.floor(x);
}

function hash31(p) {
  let r = [p * 0.1031, p * 0.1030, p * 0.0973].map(fract);
  const r_yzx = [r[1], r[2], r[0]];
  const dotVal = r[0] * (r_yzx[0] + 33.33) +
    r[1] * (r_yzx[1] + 33.33) +
    r[2] * (r_yzx[2] + 33.33);
  for (let i = 0; i < 3; i++) {
    r[i] = fract(r[i] + dotVal);
  }
  return r;
}

function hash33(v) {
  let p = [v[0] * 0.1031, v[1] * 0.1030, v[2] * 0.0973].map(fract);
  const p_yxz = [p[1], p[0], p[2]];
  const dotVal = p[0] * (p_yxz[0] + 33.33) +
    p[1] * (p_yxz[1] + 33.33) +
    p[2] * (p_yxz[2] + 33.33);
  for (let i = 0; i < 3; i++) {
    p[i] = fract(p[i] + dotVal);
  }
  const p_xxy = [p[0], p[0], p[1]];
  const p_yxx = [p[1], p[0], p[0]];
  const p_zyx = [p[2], p[1], p[0]];
  const result = [];
  for (let i = 0; i < 3; i++) {
    result[i] = fract((p_xxy[i] + p_yxx[i]) * p_zyx[i]);
  }
  return result;
}

const metaBallsVertex = `#version 300 es
precision highp float;
layout(location = 0) in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const metaBallsFragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iMouse;
uniform vec3 iColor;
uniform vec3 iCursorColor;
uniform float iAnimationSize;
uniform int iBallCount;
uniform float iCursorBallSize;
uniform vec3 iMetaBalls[50];
uniform float iClumpFactor;
uniform bool enableTransparency;
out vec4 outColor;
const float PI = 3.14159265359;

float getMetaBallValue(vec2 c, float r, vec2 p) {
  vec2 d = p - c;
  float dist2 = dot(d, d);
  return (r * r) / dist2;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float scale = iAnimationSize / iResolution.y;
  vec2 coord = (fc - iResolution.xy * 0.5) * scale;
  vec2 mouseW = (iMouse.xy - iResolution.xy * 0.5) * scale;
  float m1 = 0.0;
  for (int i = 0; i < 50; i++) {
    if (i >= iBallCount) break;
    m1 += getMetaBallValue(iMetaBalls[i].xy, iMetaBalls[i].z, coord);
  }
  float m2 = getMetaBallValue(mouseW, iCursorBallSize, coord);
  float total = m1 + m2;
  float f = smoothstep(-1.0, 1.0, (total - 1.3) / min(1.0, fwidth(total)));
  vec3 cFinal = vec3(0.0);
  if (total > 0.0) {
    float alpha1 = m1 / total;
    float alpha2 = m2 / total;
    cFinal = iColor * alpha1 + iCursorColor * alpha2;
  }
  outColor = vec4(cFinal * f, enableTransparency ? f : 1.0);
}
`;

const MetaBalls = ({
  color = "#7b61ff",
  speed = 0.3,
  enableMouseInteraction = true,
  hoverSmoothness = 0.05,
  animationSize = 30,
  ballCount = 15,
  clumpFactor = 1,
  cursorBallSize = 3,
  cursorBallColor = "#7b61ff",
  enableTransparency = false,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = 1;
    const renderer = new Renderer({ dpr, alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, enableTransparency ? 0 : 1);
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, {
      left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10,
    });
    camera.position.z = 1;

    const geometry = new Triangle(gl);
    const [r1, g1, b1] = parseHexColor(color);
    const [r2, g2, b2] = parseHexColor(cursorBallColor);

    const metaBallsUniform = [];
    for (let i = 0; i < 50; i++) {
      metaBallsUniform.push(new Vec3(0, 0, 0));
    }

    const program = new Program(gl, {
      vertex: metaBallsVertex,
      fragment: metaBallsFragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vec3(0, 0, 0) },
        iMouse: { value: new Vec3(0, 0, 0) },
        iColor: { value: new Vec3(r1, g1, b1) },
        iCursorColor: { value: new Vec3(r2, g2, b2) },
        iAnimationSize: { value: animationSize },
        iBallCount: { value: ballCount },
        iCursorBallSize: { value: cursorBallSize },
        iMetaBalls: { value: metaBallsUniform },
        iClumpFactor: { value: clumpFactor },
        enableTransparency: { value: enableTransparency },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    const scene = new Transform();
    mesh.setParent(scene);

    const maxBalls = 50;
    const effectiveBallCount = Math.min(ballCount, maxBalls);
    const ballParams = [];
    for (let i = 0; i < effectiveBallCount; i++) {
      const idx = i + 1;
      const h1 = hash31(idx);
      const st = h1[0] * (2 * Math.PI);
      const dtFactor = 0.1 * Math.PI + h1[1] * (0.4 * Math.PI - 0.1 * Math.PI);
      const baseScale = 5.0 + h1[1] * (10.0 - 5.0);
      const h2 = hash33(h1);
      const toggle = Math.floor(h2[0] * 2.0);
      const radiusVal = 0.5 + h2[2] * (2.0 - 0.5);
      ballParams.push({ st, dtFactor, baseScale, toggle, radius: radiusVal });
    }

    const mouseBallPos = { x: 0, y: 0 };
    let pointerInside = false;
    let pointerX = 0;
    let pointerY = 0;

    function resize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + "px";
      gl.canvas.style.height = height + "px";
      program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    function onPointerMove(e) {
      if (!enableMouseInteraction) return;
      const rect = container.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      pointerX = (px / rect.width) * gl.canvas.width;
      pointerY = (1 - py / rect.height) * gl.canvas.height;
    }
    function onPointerEnter() {
      if (!enableMouseInteraction) return;
      pointerInside = true;
    }
    function onPointerLeave() {
      if (!enableMouseInteraction) return;
      pointerInside = false;
    }
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerenter", onPointerEnter);
    container.addEventListener("pointerleave", onPointerLeave);

    const startTime = performance.now();
    let animationFrameId;
    function update(t) {
      animationFrameId = requestAnimationFrame(update);
      const elapsed = (t - startTime) * 0.001;
      program.uniforms.iTime.value = elapsed;

      for (let i = 0; i < effectiveBallCount; i++) {
        const p = ballParams[i];
        const dt = elapsed * speed * p.dtFactor;
        const th = p.st + dt;
        const x = Math.cos(th);
        const y = Math.sin(th + dt * p.toggle);
        const posX = x * p.baseScale * clumpFactor;
        const posY = y * p.baseScale * clumpFactor;
        metaBallsUniform[i].set(posX, posY, p.radius);
      }

      let targetX, targetY;
      if (pointerInside) {
        targetX = pointerX;
        targetY = pointerY;
      } else {
        const cx = gl.canvas.width * 0.5;
        const cy = gl.canvas.height * 0.5;
        const rx = gl.canvas.width * 0.15;
        const ry = gl.canvas.height * 0.15;
        targetX = cx + Math.cos(elapsed * speed) * rx;
        targetY = cy + Math.sin(elapsed * speed) * ry;
      }
      mouseBallPos.x += (targetX - mouseBallPos.x) * hoverSmoothness;
      mouseBallPos.y += (targetY - mouseBallPos.y) * hoverSmoothness;
      program.uniforms.iMouse.value.set(mouseBallPos.x, mouseBallPos.y, 0);

      renderer.render({ scene, camera });
    }
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [
    color,
    cursorBallColor,
    speed,
    enableMouseInteraction,
    hoverSmoothness,
    animationSize,
    ballCount,
    clumpFactor,
    cursorBallSize,
    enableTransparency,
  ]);

  return <div ref={containerRef} className="metaballs-container" style={{ position: 'relative', width: '100%', height: '100%' }} />;
};

// Slides data
const slides = [
  {
    title: "Experience Personalized Learning",
    subtitle: "Connect with expert tutors who will guide your unique educational journey.",
    icon: <GraduationCap className="w-16 h-16 text-indigo-600" />,
    bgGradient: "from-indigo-100 via-purple-50 to-blue-100",
    badge: "Smart Tutoring"
  },
  {
    title: "Learn Without Limits",
    subtitle: "Access course videos with AI-powered transcripts, summaries, and personalized recommendations.",
    icon: <Brain className="w-16 h-16 text-blue-600" />,
    bgGradient: "from-blue-100 via-indigo-50 to-purple-100",
    badge: "AI-Enhanced Learning"
  },
  {
    title: "Join a Thriving Community",
    subtitle: "Engage with tutors and fellow learners through interactive sessions and real-time discussions.",
    icon: <Users className="w-16 h-16 text-purple-600" />,
    bgGradient: "from-purple-100 via-indigo-50 to-blue-100",
    badge: "Community-Driven",
    final: true
  },
];

// Features data
const features = [
  {
    icon: <Target className="w-6 h-6 text-indigo-600" />,
    title: "Personalized Learning",
    description: "AI algorithms create custom learning journeys based on your goals and progress."
  },
  {
    icon: <Clock className="w-6 h-6 text-indigo-600" />,
    title: "Flexible Scheduling",
    description: "Book sessions with tutors that fit your calendar and learning preferences."
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-indigo-600" />,
    title: "Continuous Improvement",
    description: "Analytics and feedback help optimize your learning experience over time."
  },
  {
    icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
    title: "Comprehensive Library",
    description: "Access thousands of courses, tutorials, and resources across disciplines."
  }
];

// Testimonial data
const testimonials = [
  {
    quote: "EduVerse made learning so engaging! The AI recommendations helped me find courses I never knew I needed.",
    author: "Sarah K.",
    role: "College Student",
    rating: 5,
  },
  {
    quote: "The virtual classrooms are incredible. I feel like I'm in a real class, but with the flexibility I need.",
    author: "Michael P.",
    role: "Professional Learner",
    rating: 4,
  },
  {
    quote: "I love the community here. The tutors are amazing, and I’ve made so many friends through discussions!",
    author: "Emily R.",
    role: "High School Student",
    rating: 5,
  },
  {
    quote: "The personalized learning paths are a game-changer. I’m progressing faster than I ever thought possible.",
    author: "James L.",
    role: "Lifelong Learner",
    rating: 4,
  },
];

// Reusable Components
const Badge = ({ children, className, ...props }) => {
  return (
    <motion.span 
      className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-medium ${className}`}
      whileHover={{ scale: 1.1, rotate: 3 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.span>
  );
};

const Button = ({ children, className, ...props }) => {
  return (
    <motion.button 
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${className}`}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Main Component
function WelcomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage?.getItem('token');
      const user = localStorage?.getItem('user');
      setIsLoggedIn(!!token);
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          setUserRole(parsedUser.role); // Assuming user object has a 'role' field ('student' or 'tutor')
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const slide = slides[currentSlide];

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserRole(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserRole(null);
      navigate('/login');
    }
  };

  const handleDashboardNavigation = () => {
    const destination = userRole === 'tutor' ? '/tutor' : '/student';
    navigate(destination);
  };

  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    { name: "About", path: "/about", icon: <Info className="w-4 h-4" /> },
    { name: "Courses", path: "/courses", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Contact", path: "/contact", icon: <Contact className="w-4 h-4" /> },
    ...(isLoggedIn ? [{
      name: "Dashboard",
      path: userRole === 'tutor' ? '/tutor' : '/student',
      icon: <LayoutDashboard className="w-4 h-4" />
    }] : []),
  ];

  return (
    <div className="min-h-screen overflow-x-hidden relative bg-gray-50">
      <style>
        {`
          .orb-container {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            background: transparent;
          }

          .aurora-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            opacity: 0.2;
          }

          .mobile-menu-toggle {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 1000;
          }

          .section-bg {
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3));
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }

          .nav-link {
            position: relative;
            overflow: hidden;
          }

          .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(to right, #4f46e5, #a855f7);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .nav-link:hover::after {
            transform: translateX(0);
          }
        `}
      </style>
      <div className={`relative min-h-screen transition-all duration-700 bg-gradient-to-br ${slide.bgGradient}`}>
        

        {/* Navbar */}
        <div className="fixed top-4 left-0 right-0 flex justify-center z-50 px-6">
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`rounded-full py-1 px-3 transition-all duration-300 
              ${isScrolled ? 'bg-white/40 backdrop-blur-xl shadow-xl [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]' : 'bg-white/30 backdrop-blur-xl shadow-xl [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]'}
              flex items-center justify-between w-full max-w-4xl border border-white/20 h-11 relative`}
          >
            {/* Logo on the Left */}
            <div className="flex items-center gap-1.5">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-500 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <span className="font-bold text-base">E</span>
              </motion.div>
              <span className="font-bold text-base bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">EduVerse</span>
            </div>

            {/* Centered Navigation Items */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 gap-0.5 z-50">
              {navItems.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className="flex items-center gap-1 px-2.5 py-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all font-medium text-xs nav-link"
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Authentication Buttons on the Right */}
            <div className="hidden md:flex items-center gap-0.5">
              {isLoggedIn ? (
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-white py-1 px-2.5 rounded-full text-xs"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Log Out
                  </Button>
                </motion.div>
              ) : (
                <div className="flex gap-0.5">
                  <motion.div
                    whileHover={{ scale: 1.0, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => navigate('/login')}
                      className="hover:bg-indigo-50 hover:text-indigo-600 font-medium text-gray-600 py-1 px-2.5 rounded-full transition-all text-xs"
                    >
                      Log In
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => navigate('/signup')}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-white py-1 px-2.5 rounded-full text-xs"
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="relative z-50 md:hidden mobile-menu-toggle -translate-y-1 transition !hover:transform-none">
              <Button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative z-50 bg-transparent text-gray-600 hover:text-indigo-600"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div
          className={`mobile-nav-overlay ${menuOpen ? 'active' : ''}`}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(10, 10, 10, 0.9)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 999,
            opacity: menuOpen ? 1 : 0,
            visibility: menuOpen ? "visible" : "hidden",
            transition: "opacity 0.3s ease, visibility 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: menuOpen ? "auto" : "none",
          }}
        >
          <div
            className={`mobile-menu-container ${menuOpen ? 'active' : ''}`}
            style={{
              transform: menuOpen ? "scale(1)" : "scale(0.95)",
              opacity: menuOpen ? 1 : 0,
              transition: "transform 0.4s ease, opacity 0.4s ease",
            }}
          >
            <div className="flex flex-col items-center justify-center text-center w-full">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : 20 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="my-4"
                >
                  <Link
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className="text-white text-xl hover:text-indigo-400 transition-all flex items-center gap-2"
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              {isLoggedIn ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : 20 }}
                  transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
                  className="mt-4"
                >
                  <Button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : 20 }}
                  transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
                  className="mt-4 flex flex-col gap-3"
                >
                  <Button
                    onClick={() => {
                      navigate('/login');
                      setMenuOpen(false);
                    }}
                    className="bg-white text-indigo-600 hover:bg-gray-100 py-2 px-4 rounded-full"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/signup');
                      setMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-full"
                  >
                    Sign Up
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pt-24 min-h-screen z-40">
          <div className="flex flex-col md:flex-row items-center z-40">
            <div className="w-full md:w-1/2 pt-16 flex flex-col items-center md:items-start text-center md:text-left z-40">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                    className="mb-8 flex justify-center md:justify-start"
                  >
                    {slide.icon}
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    style={{zIndex: 50}}
                  >
                    <Badge className="mb-6 py-1.5 px-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm shadow-md rounded-full z-50">
                      {slide.badge}
                    </Badge>
                    
                    <BlurText
                      text={slide.title}
                      delay={150}
                      animateBy="words"
                      direction="top"
                      onAnimationComplete={handleAnimationComplete}
                      className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
                    />
                    
                    <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-md mx-auto md:mx-0">
                      {slide.subtitle}
                    </p>
                    
                    {slide.final && (
                      <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                      >
                        <Button
                          onClick={isLoggedIn ? handleDashboardNavigation : () => navigate('/signup')}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all z-10"
                        >
                          {isLoggedIn ? 'Go to Dashboard' : 'Start Your Learning Journey'}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
              
              <div className="flex space-x-3 mt-10">
                {slides.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSlideChange(index)}
                    className={`h-3 w-12 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? "bg-indigo-600 w-16" 
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="w-full md:w-1/2 h-96 flex items-center justify-center relative"
            >
              <MetaBalls
                color="#7b61ff"
                cursorBallColor="#7b61ff"
                cursorBallSize={2}
                ballCount={15}
                animationSize={30}
                enableMouseInteraction={true}
                enableTransparency={true}
                hoverSmoothness={0.05}
                clumpFactor={1}
                speed={0.3}
              />
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 15, 0] }}
          transition={{ delay: 1, duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-0 right-0 flex justify-center"
        >
          <div 
            className="flex flex-col items-center cursor-pointer" 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="text-sm text-gray-600 mb-2 font-medium tracking-wide pt-3">Scroll to Explore</span>
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="py-24 bg-white relative overflow-hidden section-bg">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-indigo-100 text-indigo-600 py-1 px-5 shadow-md rounded-full">IMMERSIVE LEARNING</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent pb-1">Experience Education Reimagined</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              EduVerse brings learning to life with interactive experiences and cutting-edge technology
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <School className="w-12 h-12 text-indigo-600" />,
                title: "Virtual Classrooms",
                description: "Immerse yourself in 3D learning environments with interactive whiteboards and real-time collaboration.",
              },
              {
                icon: <PenTool className="w-12 h-12 text-indigo-600" />,
                title: "Interactive Tools",
                description: "Engage with dynamic study tools like virtual labs, simulations, AI-driven quizzes and their solutions.",
              },
              {
                icon: <Book className="w-12 h-12 text-indigo-600" />,
                title: "Smart Resources",
                description: "Access a vast library of resources with AI-powered search and personalized recommendations.",
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
              >
                <SpotlightCard
                  spotlightColor="rgba(139, 92, 246, 0.25)"
                  className="group bg-white"
                >
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="bg-indigo-50 p-4 rounded-xl w-20 h-20 flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors"
                  >
                    {item.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24 bg-white section-bg" ref={featuresRef}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-indigo-100 text-indigo-600 py-1 px-5 shadow-md rounded-full">WHY CHOOSE EDUVERSE</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent pb-1">Transform Your Learning Experience</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with expert instruction to create a truly personalized educational journey.
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-48 h-48 mx-auto mt-8 relative"
            >
              <Orb
                hoverIntensity={0.5}
                rotateOnHover={true}
                hue={322}
                forceHoverState={false}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#7b61ff',
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                EduVerse
              </div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
              >
                <SpotlightCard
                  spotlightColor="rgba(139, 92, 246, 0.25)"
                  className="group bg-white"
                >
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="bg-indigo-50 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors"
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-gray-50 relative overflow-hidden section-bg">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-indigo-100 text-indigo-600 py-1 px-5 shadow-md rounded-full">
              TESTIMONIALS
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent pb-1">
              What Our Learners Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our community about how EduVerse has transformed their learning experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
              >
                <SpotlightCard
                  spotlightColor="rgba(139, 92, 246, 0.25)"
                  className="relative bg-white"
                >
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg
                        key={j}
                        className={`w-5 h-5 ${j < Math.floor(testimonial.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-24 bg-gradient-to-br from-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />
        <div className="container mx-auto px-4 relative z-10 warme text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
              Join EduVerse today and unlock a world of knowledge with personalized learning and a supportive community.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={isLoggedIn ? handleDashboardNavigation : () => navigate('/signup')}
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Get Started Now'}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg">
                  <span className="font-bold text-base">E</span>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  EduVerse
                </span>
              </div>
              <p className="text-sm opacity-80">
                Empowering learners worldwide with innovative education solutions.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { name: "Home", path: "/" },
                  { name: "About", path: "/about" },
                  { name: "Courses", path: "/courses" },
                  { name: "Contact", path: "/contact" },
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-sm hover:text-indigo-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                {[
                  { name: "Blog", path: "/blog" },
                  { name: "FAQ", path: "/faq" },
                  { name: "Support", path: "/support" },
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-sm hover:text-indigo-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: <a href="mailto:support@eduverse.com" className="hover:text-indigo-400 transition-colors">support@eduverse.com</a></li>
                <li>Phone: <a href="tel:+1234567890" className="hover:text-indigo-400 transition-colors">+1 234 567 890</a></li>
                <li>Address: 123 Learning Lane, EduCity, 90210</li>
              </ul>
            </motion.div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700 text-center">
            <p className="text-sm opacity-80">
              &copy; {new Date().getFullYear()} EduVerse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default WelcomePage;