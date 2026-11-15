/**
 * The opening screen of the run (Gadi 2026-11-15: "the two green backgrounds
 * look boring, put a fortress behind, something more modern and premium").
 *
 * A 3D scene behind the card: the fortress of today's landscape at the end of
 * a path, the monster at its gate, trees of the landscape, golden sparks that
 * rise slowly, a sky at golden hour. The camera sways a little. On a wide
 * screen the fortress stands beside the card (the card is on the reading
 * side); on a phone it stands above it.
 *
 * The look is our own: the models of run/models.ts and plain shapes.
 */
import type * as THREE from "three";
import { THEMES } from "./engine";
import { loadModel, type ModelName } from "./models";

export type IntroHandle = { dispose: () => void };

// Sky at golden hour, one per landscape: top, horizon.
const SKIES: Array<[string, string, number]> = [
  ["#3f6fb5", "#f7d9a8", 0xf7d9a8],
  ["#6a4b9c", "#ffc285", 0xffc285],
  ["#24477f", "#cdeeff", 0xcdeeff],
];

export async function startIntro(canvas: HTMLCanvasElement, o: { theme: number; monster: number; rtl: boolean }): Promise<IntroHandle> {
  const T = await import("three");
  const ti = o.theme % THEMES.length;
  const th = THEMES[ti];
  const [skyTop, skyLow, haze] = SKIES[ti % SKIES.length];
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  canvas.style.background = `linear-gradient(${skyTop} 0%, ${skyLow} 62%)`;
  const scene = new T.Scene();
  scene.fog = new T.Fog(haze, 34, 95);
  const cam = new T.PerspectiveCamera(42, 1, 0.1, 200);

  scene.add(new T.HemisphereLight(0xfff3dc, th.ground, 1.15));
  const sun = new T.DirectionalLight(0xffe2b0, 1.6);
  sun.position.set(-14, 22, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 80;
  scene.add(sun);
  const glow = new T.PointLight(0xffb45a, 30, 18, 1.6);
  glow.position.set(0, 3, -1);
  scene.add(glow);

  const lambert = (color: number) => new T.MeshLambertMaterial({ color });
  const at = <O extends THREE.Object3D>(ob: O, x: number, y: number, z: number): O => { ob.position.set(x, y, z); return ob; };

  // The ground and the path to the gate.
  const ground = new T.Mesh(new T.CircleGeometry(120, 48), lambert(th.ground));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const path = new T.Mesh(new T.PlaneGeometry(4.2, 40), lambert(th.path));
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.02, 12);
  path.receiveShadow = true;
  scene.add(path);

  // Trees of the landscape, never on the path.
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  for (let i = 0; i < 70; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * rnd(6.5, 40), z = rnd(-40, 30);
    if (Math.abs(x) < 9 && z < -2 && z > -14) continue; // the fortress stands there
    if (z > 6 && Math.abs(x) < 20) continue; // nothing between the camera and the fortress
    const g = new T.Group();
    const s = rnd(0.8, 1.6);
    if (th.prop === "cactus") {
      g.add(at(new T.Mesh(new T.BoxGeometry(0.6, 2.6, 0.6), lambert(0x3f9d57)), 0, 1.3, 0), at(new T.Mesh(new T.BoxGeometry(0.4, 1.1, 0.4), lambert(0x3f9d57)), 0.55, 1.6, 0));
    } else {
      g.add(at(new T.Mesh(new T.CylinderGeometry(0.18, 0.24, 1.2, 6), lambert(0x7a4a22)), 0, 0.6, 0));
      g.add(at(new T.Mesh(new T.ConeGeometry(1.2, 2.8, 7), lambert(th.prop === "ice" ? 0xe8f6ff : 0x2f8f4a)), 0, 2.4, 0));
    }
    g.traverse((m) => { (m as THREE.Mesh).castShadow = true; });
    g.scale.setScalar(s);
    g.position.set(x, 0, z);
    scene.add(g);
  }

  // Golden sparks that rise slowly and come back.
  const sparkMat = new T.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.85 });
  const sparkGeo = new T.OctahedronGeometry(0.12);
  const sparks: Array<{ m: THREE.Mesh; v: number; x: number; z: number; ph: number }> = [];
  for (let i = 0; i < 46; i++) {
    const m = new T.Mesh(sparkGeo, sparkMat);
    const s = { m, v: rnd(0.25, 0.7), x: rnd(-14, 14), z: rnd(-10, 14), ph: rnd(0, 6.3) };
    m.position.set(s.x, rnd(0, 10), s.z);
    scene.add(m);
    sparks.push(s);
  }

  let stopped = false;
  // The fortress and the monster of today (they appear as they load).
  void loadModel(T, `fortress${ti + 1}` as ModelName, { width: 15 }).then((m) => { if (!stopped) { m.position.set(0, 0, -8); scene.add(m); } }).catch(() => undefined);
  let mon: THREE.Group | null = null;
  void loadModel(T, `monster${(o.monster % 3) + 1}` as ModelName, { height: 2.6 }).then((m) => { if (!stopped) { m.position.set(0, 0, 0.6); scene.add(m); mon = m; } }).catch(() => undefined);

  // On a wide screen the scene is drawn as if the screen were wider, and only
  // the side away from the card is shown: the fortress stands beside the card.
  let w = 1, h = 1;
  const size = () => {
    w = canvas.clientWidth || 1; h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    const wide = w >= 760 && w / h > 1.15;
    if (wide) cam.setViewOffset(w * 1.55, h, o.rtl ? w * 0.55 : 0, 0, w, h);
    else cam.clearViewOffset();
    cam.fov = wide ? 40 : 46;
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(size);
  ro.observe(canvas);
  size();

  const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  let raf = 0;
  const t0 = performance.now();
  const frame = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    const a = calm ? 0.12 : 0.12 + Math.sin(t * 0.18) * 0.22;
    cam.position.set(Math.sin(a) * 22, 7.6 + (calm ? 0 : Math.sin(t * 0.23) * 0.4), 19 + Math.cos(a) * 5);
    cam.lookAt(0, 4.4, -4);
    if (mon && !calm) { mon.position.y = Math.abs(Math.sin(t * 2.2)) * 0.18; mon.rotation.y = Math.sin(t * 0.7) * 0.25; }
    if (!calm) for (const s of sparks) {
      s.m.position.y += s.v * 0.016;
      s.m.position.x = s.x + Math.sin(t + s.ph) * 0.4;
      s.m.rotation.y = t * 2 + s.ph;
      if (s.m.position.y > 11) s.m.position.y = 0;
    }
    glow.intensity = 26 + Math.sin(t * 7) * 3;
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(frame);

  return {
    dispose: () => {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
      });
      renderer.dispose();
    },
  };
}
