"use client";

import { useEffect, useRef, useState } from "react";
import type * as Three from "three";
import { MapPin } from "lucide-react";
import { LAND_H, LAND_RES, LAND_RLE, LAND_W } from "@/lib/land";
import { emitSignal, uiStore } from "@/lib/ui-store";

export type JourneyStep = {
  id: string;
  role: string;
  company: string;
  companyFull: string;
  location: string;
  city: string;
  lat: number;
  lon: number;
  period: string;
  tenure: string;
  current?: boolean;
  summary: string;
  highlights: string[];
  stack: string[];
};

const DEG = Math.PI / 180;
const FOV = 35;
const EARTH_KM = 6371;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const wrap180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

function decodeLand() {
  const mask = new Uint8Array(LAND_W * LAND_H);
  let cell = 0;
  let col = 0;
  let value = 0;
  for (let i = 0; i < LAND_RLE.length; i += 2) {
    const run = parseInt(LAND_RLE.slice(i, i + 2), 36);
    if (value) mask.fill(1, cell, cell + run);
    cell += run;
    col += run;
    value ^= 1;
    if (col >= LAND_W) {
      col = 0;
      value = 0;
    }
  }
  return mask;
}

/** Unit vector for a lat/lon in degrees. lat 0, lon 0 faces +Z, so rotating the globe by (lat, -lon) brings a point to the camera. */
function unit(lat: number, lon: number): [number, number, number] {
  const la = lat * DEG;
  const lo = lon * DEG;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

const DOT_VERT = /* glsl */ `
  attribute float aLand;
  uniform float uScale;
  uniform float uSize;
  uniform vec3 uFocus;
  uniform float uFocusAmt;
  uniform float uRipple;
  uniform float uTime;
  varying float vGlow;
  varying float vRim;
  varying float vLand;
  varying float vFade;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vec3 n = normalize(normalMatrix * position);
    vRim = smoothstep(0.0, 0.42, dot(n, normalize(-mv.xyz)));
    vLand = aLand;
    float d = distance(position, uFocus);
    float core = smoothstep(0.075, 0.0, d);
    // A slow, soft wave rolling out from the city rather than a sharp flashing ring.
    float r = fract(uTime * 0.09) * 0.4;
    float wave = exp(-pow((d - r) / 0.045, 2.0)) * smoothstep(0.4, 0.05, r) * smoothstep(0.0, 0.06, r) * uRipple;
    vGlow = clamp(core + wave * 0.32, 0.0, 1.0) * uFocusAmt * mix(0.45, 1.0, aLand);
    float px = uSize * mix(0.55, 1.0, aLand) * uScale / -mv.z * (1.0 + vGlow * 0.4);
    vFade = clamp(px / 2.6, 0.0, 1.0);
    gl_PointSize = max(px, 2.6);
  }
`;

const DOT_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uAlpha;
  uniform float uOcean;
  varying float vGlow;
  varying float vRim;
  varying float vLand;
  varying float vFade;
  void main() {
    float l = length(gl_PointCoord - 0.5);
    if (l > 0.5) discard;
    float soft = smoothstep(0.5, 0.2, l) * vFade;
    float base = uAlpha * mix(uOcean, 1.0, vLand);
    gl_FragColor = vec4(mix(uColor, uAccent, vGlow), soft * vRim * mix(base, 1.0, vGlow));
    #include <colorspace_fragment>
  }
`;

const SHELL_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const BODY_FRAG = /* glsl */ `
  uniform vec3 uBody;
  uniform vec3 uRim;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6);
    gl_FragColor = vec4(mix(uBody, uRim, f * 0.55), 1.0);
    #include <colorspace_fragment>
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uGlow;
  uniform float uStrength;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float i = pow(clamp(-dot(vN, vV) * 1.7, 0.0, 1.0), 2.2);
    gl_FragColor = vec4(uGlow, i * uStrength);
    #include <colorspace_fragment>
  }
`;

const BEAM_VERT = /* glsl */ `
  varying float vH;
  void main() {
    vH = uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vH;
  void main() {
    gl_FragColor = vec4(uColor, pow(1.0 - vH, 1.6) * uOpacity);
    #include <colorspace_fragment>
  }
`;

type Stop = { lat: number; lon: number; dist: number; city: string | null };

export function ExperienceJourney({ steps }: { steps: JourneyStep[] }) {
  const n = steps.length;
  const panelRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const latRef = useRef<HTMLSpanElement>(null);
  const lonRef = useRef<HTMLSpanElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  // A dev refresh hands us a new array with identical contents; keying on the content means the
  // globe is only rebuilt when the jobs really change.
  const stepsKey = JSON.stringify(steps);

  useEffect(() => {
    const steps = JSON.parse(stepsKey) as JourneyStep[];
    const n = steps.length;
    let disposed = false;
    let teardown = () => {};

    (async () => {
      let THREE: typeof Three;
      try {
        THREE = await import("three");
      } catch {
        if (!disposed) setStatus("failed");
        return;
      }
      const host = hostRef.current;
      const panel = panelRef.current;
      if (disposed || !host || !panel) return;

      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        setStatus("failed");
        return;
      }

      const desktop = window.matchMedia("(min-width: 1024px)");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 100);
      const globe = new THREE.Group();
      scene.add(globe);

      // Land dots: an even spiral of points over the sphere, keeping only those that land on a land cell.
      const mask = decodeLand();
      // Ocean keeps every 5th point, drawn small and faint, so the sphere still reads over open water.
      const total = desktop.matches ? 420_000 : 220_000;
      const golden = Math.PI * (3 - Math.sqrt(5));
      const pts: number[] = [];
      const landAttr: number[] = [];
      for (let i = 0; i < total; i++) {
        const y = 1 - (2 * (i + 0.5)) / total;
        const lat = Math.asin(y);
        const lon = ((i * golden) % (2 * Math.PI)) - Math.PI;
        const row = Math.min(LAND_H - 1, Math.floor((90 - lat / DEG) / LAND_RES));
        const col = Math.min(LAND_W - 1, Math.floor((lon / DEG + 180) / LAND_RES));
        const isLand = mask[row * LAND_W + col];
        // Hash the index so the thinned ocean points don't line up into visible stripes.
        if (!isLand && Math.imul(i, 2654435761) >>> 27 > 5) continue;
        pts.push(Math.cos(lat) * Math.sin(lon), y, Math.cos(lat) * Math.cos(lon));
        landAttr.push(isLand);
      }
      const dotGeo = new THREE.BufferGeometry();
      dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      dotGeo.setAttribute("aLand", new THREE.Float32BufferAttribute(landAttr, 1));
      const spacing = Math.sqrt((4 * Math.PI) / total);
      const dotMat = new THREE.ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: DOT_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uScale: { value: 1 },
          uSize: { value: spacing * 0.5 },
          uOcean: { value: 0.22 },
          uFocus: { value: new THREE.Vector3(0, 0, 1) },
          uFocusAmt: { value: 0 },
          uRipple: { value: 0 },
          uTime: { value: 0 },
          uColor: { value: new THREE.Color() },
          uAccent: { value: new THREE.Color() },
          uAlpha: { value: 0.5 },
        },
      });
      const dots = new THREE.Points(dotGeo, dotMat);
      dots.renderOrder = 2;
      globe.add(dots);

      // Solid body hides the far side of the dot cloud and gives the globe some volume.
      const bodyMat = new THREE.ShaderMaterial({
        vertexShader: SHELL_VERT,
        fragmentShader: BODY_FRAG,
        uniforms: { uBody: { value: new THREE.Color() }, uRim: { value: new THREE.Color() } },
      });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.996, 96, 64), bodyMat);
      globe.add(body);

      const atmoMat = new THREE.ShaderMaterial({
        vertexShader: SHELL_VERT,
        fragmentShader: ATMO_FRAG,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        uniforms: { uGlow: { value: new THREE.Color() }, uStrength: { value: 0.6 } },
      });
      const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.16, 64, 48), atmoMat);
      scene.add(atmo);

      // Distant stars, rotated a little with the globe for parallax.
      const starPos: number[] = [];
      for (let i = 0; i < 1400; i++) {
        const v = new THREE.Vector3().randomDirection().multiplyScalar(9 + Math.random() * 7);
        starPos.push(v.x, v.y, v.z);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({ size: 0.05, transparent: true, opacity: 0.25, depthWrite: false });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      // City markers: core dot, pulsing rings and a light beam pointing out of the surface.
      const Z = new THREE.Vector3(0, 0, 1);
      type Marker = {
        city: string;
        local: Three.Vector3;
        core: Three.MeshBasicMaterial;
        rings: Three.Mesh[];
        ringMat: Three.MeshBasicMaterial[];
        beam: Three.Mesh;
        beamMat: Three.ShaderMaterial;
        em: number;
      };
      const markers = new Map<string, Marker>();
      const beamGeo = new THREE.CylinderGeometry(0.0013, 0.0013, 1, 10, 1, true).rotateX(Math.PI / 2).translate(0, 0, 0.5);
      const ringGeo = new THREE.RingGeometry(0.0072, 0.0088, 48);
      const coreGeo = new THREE.CircleGeometry(0.0055, 32);
      for (const s of steps) {
        if (markers.has(s.city)) continue;
        const local = new THREE.Vector3(...unit(s.lat, s.lon));
        const g = new THREE.Group();
        g.position.copy(local);
        g.quaternion.setFromUnitVectors(Z, local);
        const core = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
        const coreMesh = new THREE.Mesh(coreGeo, core);
        coreMesh.position.z = 0.002;
        g.add(coreMesh);
        const rings: Three.Mesh[] = [];
        const ringMat: Three.MeshBasicMaterial[] = [];
        for (let r = 0; r < 2; r++) {
          const m = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(ringGeo, m);
          mesh.position.z = 0.0015;
          g.add(mesh);
          rings.push(mesh);
          ringMat.push(m);
        }
        const beamMat = new THREE.ShaderMaterial({
          vertexShader: BEAM_VERT,
          fragmentShader: BEAM_FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uColor: { value: new THREE.Color() }, uOpacity: { value: 1 } },
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        g.add(beam);
        g.renderOrder = 3;
        globe.add(g);
        markers.set(s.city, { city: s.city, local, core, rings, ringMat, beam, beamMat, em: 0 });
      }

      // Flight arcs between consecutive roles in different cities, drawn as you scroll.
      type Arc = { from: number; geo: Three.TubeGeometry; mat: Three.MeshBasicMaterial; curve: Three.CatmullRomCurve3; head: Three.Mesh };
      const ARC_SEG = 120;
      const ARC_RADIAL = 6;
      const arcs: Arc[] = [];
      const headGeo = new THREE.SphereGeometry(0.0045, 16, 12);
      for (let i = 1; i < n; i++) {
        const a = steps[i - 1];
        const b = steps[i];
        if (a.city === b.city) continue;
        const va = new THREE.Vector3(...unit(a.lat, a.lon));
        const vb = new THREE.Vector3(...unit(b.lat, b.lon));
        const angle = va.angleTo(vb);
        const lift = 0.015 + angle * 0.28;
        const points: Three.Vector3[] = [];
        for (let k = 0; k <= 48; k++) {
          const t = k / 48;
          const q = new THREE.Quaternion().slerpQuaternions(new THREE.Quaternion(), new THREE.Quaternion().setFromUnitVectors(va, vb), t);
          points.push(va.clone().applyQuaternion(q).multiplyScalar(1 + lift * Math.sin(Math.PI * t)));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const geo = new THREE.TubeGeometry(curve, ARC_SEG, 0.0012, ARC_RADIAL, false);
        geo.setDrawRange(0, 0);
        const mat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
        const tube = new THREE.Mesh(geo, mat);
        tube.renderOrder = 4;
        const head = new THREE.Mesh(headGeo, mat);
        head.visible = false;
        globe.add(tube, head);
        arcs.push({ from: i, geo, mat, curve, head });
      }

      let atmoBase = 0.7;
      const applyTheme = () => {
        const cs = getComputedStyle(document.documentElement);
        const read = (name: string, fallback: string) => new THREE.Color(cs.getPropertyValue(name).trim() || fallback);
        const light = document.documentElement.dataset.theme === "light";
        const accent = read("--accent", "#ff5a1f");
        const fg = read("--fg", "#ededef");
        dotMat.uniforms.uColor.value.copy(fg);
        dotMat.uniforms.uAccent.value.copy(accent);
        dotMat.uniforms.uAlpha.value = light ? 0.5 : 0.48;
        dotMat.uniforms.uOcean.value = light ? 0.28 : 0.22;
        bodyMat.uniforms.uBody.value.copy(read("--surface", "#17171a"));
        bodyMat.uniforms.uRim.value.copy(accent);
        atmoMat.uniforms.uGlow.value.copy(accent);
        atmoBase = light ? 0.35 : 0.7;
        starMat.color.copy(fg);
        starMat.opacity = light ? 0 : 0.22;
        for (const m of markers.values()) {
          m.core.color.copy(accent);
          m.ringMat.forEach((r) => r.color.copy(accent));
          m.beamMat.uniforms.uColor.value.copy(accent);
          m.beamMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
          m.beamMat.needsUpdate = true;
        }
        for (const a of arcs) a.mat.color.copy(accent);
      };
      applyTheme();
      const unsubTheme = uiStore.subscribe((s, prev) => {
        if (s.theme !== prev.theme) applyTheme();
      });

      let width = 1;
      let height = 1;
      let farDist = 3.3;
      const resize = () => {
        width = Math.max(1, host.clientWidth);
        height = Math.max(1, host.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const hHalf = Math.atan(Math.tan((FOV / 2) * DEG) * camera.aspect);
        farDist = Math.max(3.1, 1.32 / Math.sin(Math.min(hHalf, (FOV / 2) * DEG)));
        dotMat.uniforms.uScale.value = (height * dpr) / (2 * Math.tan((FOV / 2) * DEG));
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // Scroll position → continuous progress p in [0, n]: 0 is the overview, k is "arrived at role k".
      const measure = () => {
        const cards = cardRefs.current;
        const centers = cards.map((c) => {
          if (!c) return 0;
          const r = c.getBoundingClientRect();
          return r.top + r.height / 2;
        });
        const pr = panel.getBoundingClientRect();
        const vh = window.innerHeight;
        const focus = desktop.matches ? vh * 0.5 : pr.bottom + (vh - pr.bottom) * 0.42;
        let f: number;
        if (focus <= centers[0]) {
          const span = n > 1 ? centers[1] - centers[0] : vh;
          f = -1 + clamp(1 - (centers[0] - focus) / span);
        } else if (focus >= centers[n - 1]) {
          f = n - 1;
        } else {
          f = n - 1;
          for (let i = 0; i < n - 1; i++) {
            if (focus < centers[i + 1]) {
              f = i + (focus - centers[i]) / (centers[i + 1] - centers[i]);
              break;
            }
          }
        }
        return f + 1;
      };

      const nearDist = desktop.matches ? 1.78 : 1.95;
      let idleSpin = 0;
      const stopAt = (k: number): Stop => {
        if (k <= 0) return { lat: 16, lon: 78 + idleSpin, dist: farDist, city: null };
        const s = steps[k - 1];
        return { lat: s.lat, lon: s.lon, dist: nearDist, city: s.city };
      };

      let p = -1;
      let shown = -2;
      let time = 0;
      let last = performance.now();
      let raf = 0;
      const v = new THREE.Vector3();
      const n3 = new THREE.Vector3();
      const camDir = new THREE.Vector3();

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        time += dt;

        const target = measure();
        p = p < 0 ? target : p + (target - p) * (1 - Math.exp(-dt * 2.8));

        if (p < 0.02 && !reduced) idleSpin = wrap180(idleSpin - dt * 9);

        const k = Math.min(Math.floor(p), n);
        const frac = p - k;
        const e = k >= n ? 0 : smooth(0.12, 0.88, frac);
        const A = stopAt(k);
        const B = stopAt(Math.min(k + 1, n));
        const lonB = A.lon + wrap180(B.lon - A.lon);
        const spin = reduced || k >= n ? 0 : 360 * e;
        const lat = lerp(A.lat, B.lat, e);
        const lon = lerp(A.lon, lonB, e) + spin;
        // Between roles the camera pulls right back so you watch the whole globe turn, then dives in again.
        const pull = reduced || k === 0 ? 0 : Math.pow(Math.sin(Math.PI * e), 0.75);
        const dist = lerp(lerp(A.dist, B.dist, e), farDist * 0.9, pull);

        globe.rotation.set(lat * DEG, -lon * DEG, 0);
        stars.rotation.set(lat * DEG * 0.15, -lon * DEG * 0.12, 0);

        // Close in, the camera tilts to show the curve of the horizon; far out it looks straight at the globe.
        const near = smooth(farDist * 0.8, nearDist, dist);
        const alt = dist - 1;
        const tilt = 0.5 * near;
        camera.position.set(0, -Math.sin(tilt) * alt, 1 + Math.cos(tilt) * alt);
        camera.lookAt(0, 0, near * 0.85);
        atmoMat.uniforms.uStrength.value = atmoBase * (1 - 0.6 * near);

        // Which stop is "in focus": the nearer end of the current transition.
        const focusStop = e < 0.5 ? A : B;
        const closeness = e < 0.5 ? 1 - e * 2 : (e - 0.5) * 2;
        const focusAmt = focusStop.city ? smooth(0.35, 1, closeness) : 0;
        const fm = focusStop.city ? markers.get(focusStop.city) : undefined;
        if (fm) dotMat.uniforms.uFocus.value.copy(fm.local);
        dotMat.uniforms.uFocusAmt.value = focusAmt;
        dotMat.uniforms.uRipple.value = reduced ? 0 : focusAmt;
        dotMat.uniforms.uTime.value = time;

        for (const m of markers.values()) {
          const want = m === fm ? 1 : p > 0.4 ? 0.35 : 0.2;
          m.em += (want - m.em) * (1 - Math.exp(-dt * 6));
          const beamH = 0.02 + 0.16 * m.em * (m === fm ? focusAmt : 0.4);
          m.beam.scale.set(1 + m.em * 0.5, 1 + m.em * 0.5, beamH);
          m.beamMat.uniforms.uOpacity.value = 0.35 + 0.65 * m.em;
          m.core.opacity = 0.5 + 0.5 * m.em;
          m.rings.forEach((r, i) => {
            const ph = reduced ? 0.35 : (time * 0.28 + i * 0.5) % 1;
            r.scale.setScalar(1 + ph * 4.5);
            m.ringMat[i].opacity = Math.sin(Math.PI * ph) * (1 - ph) * m.em * 0.55;
          });
        }

        for (const a of arcs) {
          const t = p <= a.from ? 0 : p >= a.from + 1 ? 1 : smooth(0.12, 0.88, p - a.from);
          a.geo.setDrawRange(0, Math.floor(t * ARC_SEG) * ARC_RADIAL * 6);
          a.head.visible = t > 0.01 && t < 0.99;
          if (a.head.visible) a.head.position.copy(a.curve.getPointAt(t));
        }

        // HUD: live coordinates of the point under the camera, altitude, step progress.
        if (latRef.current) latRef.current.textContent = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
        const lw = wrap180(lon);
        if (lonRef.current) lonRef.current.textContent = `${Math.abs(lw).toFixed(4)}° ${lw >= 0 ? "E" : "W"}`;
        if (altRef.current) altRef.current.textContent = `${Math.round(alt * EARTH_KM).toLocaleString("en-IN")} km`;
        barRefs.current.forEach((b, i) => {
          if (b) b.style.transform = `scaleX(${clamp(p - i)})`;
        });

        // City label follows its marker on screen, and hides when the marker turns away.
        const label = labelRef.current;
        if (label) {
          if (fm && focusAmt > 0.4) {
            globe.updateMatrixWorld();
            v.copy(fm.local).applyMatrix4(globe.matrixWorld);
            n3.copy(v).normalize();
            camDir.copy(camera.position).sub(v).normalize();
            const facing = n3.dot(camDir);
            v.project(camera);
            label.style.transform = `translate(${((v.x + 1) / 2) * width}px, ${((1 - v.y) / 2) * height}px)`;
            label.style.opacity = String(smooth(0.15, 0.4, facing) * smooth(0.4, 0.8, focusAmt));
            const text = `${fm.city}, India`;
            if (labelTextRef.current && labelTextRef.current.textContent !== text) labelTextRef.current.textContent = text;
          } else {
            label.style.opacity = "0";
          }
        }

        const nearest = p < 0.5 ? -1 : clamp(Math.round(p) - 1, 0, n - 1);
        const idx = shown === -2 || Math.abs(p - (shown + 1)) > 0.62 ? nearest : shown;
        if (idx !== shown) {
          shown = idx;
          setActive(idx);
          if (idx >= 0) emitSignal("experience:step", { id: steps[idx].id, city: steps[idx].city });
        }

        renderer.render(scene, camera);
      };

      // Only animate while the section is on screen.
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      });
      io.observe(panel.parentElement ?? panel);

      const onLost = (ev: Event) => {
        ev.preventDefault();
        setStatus("failed");
      };
      renderer.domElement.addEventListener("webglcontextlost", onLost);

      setStatus("ready");

      teardown = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        unsubTheme();
        renderer.domElement.removeEventListener("webglcontextlost", onLost);
        scene.traverse((o) => {
          const mesh = o as Three.Mesh;
          mesh.geometry?.dispose();
          const mat = mesh.material as Three.Material | Three.Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
      if (disposed) teardown();
    })();

    return () => {
      disposed = true;
      teardown();
    };
  }, [stepsKey]);

  const step = active >= 0 ? steps[active] : null;
  const dim = status === "ready";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
      <div ref={panelRef} className="sticky top-[4.75rem] z-10 h-[44vh] self-start sm:h-[50vh] lg:top-24 lg:h-[calc(100vh-8rem)] lg:max-h-[780px]">
        <div className="relative h-full overflow-hidden rounded-3xl border border-line bg-elev shadow-2xl shadow-black/20">
          <div aria-hidden className="bg-grid absolute inset-0 opacity-70" />
          <div aria-hidden className="glow absolute -bottom-1/3 left-1/2 h-2/3 w-[140%] -translate-x-1/2 opacity-60" />
          <div ref={hostRef} aria-hidden data-testid="experience-globe" data-status={status} className="absolute inset-0" />

          {status === "loading" && (
            <div aria-hidden className="absolute inset-0 grid place-items-center">
              <span className="size-40 rounded-full border border-line-strong bg-surface/60 sm:size-56" />
            </div>
          )}
          {status === "failed" && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div>
                <MapPin className="mx-auto size-8 text-accent" />
                <p className="mt-3 font-mono text-xs uppercase tracking-wider text-subtle">Nagpur → Bengaluru</p>
              </div>
            </div>
          )}

          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-elev via-elev/70 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute left-4 top-4 space-y-1 font-mono text-[10px] uppercase tracking-wider text-subtle sm:left-5 sm:top-5 sm:text-[11px]">
            <p>
              Lat <span ref={latRef} className="ml-1 tabular-nums text-fg">--</span>
            </p>
            <p>
              Lon <span ref={lonRef} className="ml-1 tabular-nums text-fg">--</span>
            </p>
            <p>
              Alt <span ref={altRef} className="ml-1 tabular-nums text-fg">--</span>
            </p>
          </div>

          <div aria-hidden className="pointer-events-none absolute right-4 top-4 text-right sm:right-5 sm:top-5">
            <p className="font-mono text-[11px] text-subtle">
              <span className="text-fg">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </p>
            <div className="mt-2 flex justify-end gap-1">
              {steps.map((s, i) => (
                <span key={s.id} className="h-0.5 w-6 overflow-hidden rounded-full bg-line-strong">
                  <span
                    ref={(el) => {
                      barRefs.current[i] = el;
                    }}
                    className="block h-full w-full origin-left bg-accent"
                    style={{ transform: "scaleX(0)" }}
                  />
                </span>
              ))}
            </div>
          </div>

          <div ref={labelRef} aria-hidden className="pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform">
            <div className="flex -translate-y-1/2 items-center gap-1.5 pl-3">
              <span className="h-px w-5 bg-accent" />
              <span
                ref={labelTextRef}
                className="whitespace-nowrap rounded-full border border-accent/40 bg-bg/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-fg backdrop-blur sm:text-[11px]"
              />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-elev via-elev/85 to-transparent px-4 pb-4 pt-14 sm:px-6 sm:pb-6">
            {step ? (
              <div key={step.id} className="fade-up">
                <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                  {step.city} · {step.period}
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight sm:text-3xl">{step.company}</p>
                <p className="mt-0.5 text-sm text-muted">{step.role}</p>
              </div>
            ) : (
              <div className="fade-up">
                <p className="font-mono text-[11px] uppercase tracking-wider text-accent">The journey</p>
                <p className="mt-1 text-xl font-semibold tracking-tight sm:text-3xl">Nagpur → Bengaluru</p>
                <p className="mt-0.5 text-sm text-muted">Scroll to fly through each role</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ol className="relative lg:py-[12vh]">
        {steps.map((job, i) => {
          const on = active === i;
          return (
            <li
              key={job.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              data-testid={`exp-${job.id}`}
              data-active={on || undefined}
              className="flex min-h-[72vh] items-center py-6 lg:min-h-[80vh]"
            >
              <article
                aria-labelledby={`job-${job.id}`}
                className={`w-full rounded-2xl border bg-elev p-6 transition duration-500 sm:p-8 ${
                  !dim || on ? "border-line-strong opacity-100" : "border-line opacity-45"
                } ${on ? "shadow-2xl shadow-black/20 lg:-translate-x-1" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-subtle">
                  <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span>{job.period}</span>
                  <span>·</span>
                  <span>{job.tenure}</span>
                  {job.current && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 text-accent">
                      <span className="size-1.5 rounded-full bg-ok" /> Current
                    </span>
                  )}
                </div>
                <h3 id={`job-${job.id}`} className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                  {job.role} <span className="text-muted">·</span> <span className="text-accent">{job.company}</span>
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-subtle">
                  <MapPin className="size-3.5" /> {job.companyFull} · {job.location}
                </p>
                <p className="mt-4 text-pretty text-[15px] leading-relaxed text-fg/85">{job.summary}</p>
                <ul className="mt-4 space-y-2.5">
                  {job.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                      <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="text-pretty">{h}</span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
                  {job.stack.map((s) => (
                    <li key={s} className="rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
                      {s}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
