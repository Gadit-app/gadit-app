/**
 * The runner of the journey and its looks (the shop, Gadi 2026-11-15).
 *
 * A figure made of boxes: head, body, two arms and two legs that swing, a
 * hat, something on the back and maybe a little companion beside it. What it
 * wears comes from the shop (lib/journey/shop.ts). The same builder draws the
 * runner on the road, the other runners and the figure in the shop window.
 *
 * The look is our own: plain boxes and cones, soft colours.
 */
import type * as THREE from "three";
import { DEFAULT_LOOK, shopItem, type Look } from "@/lib/journey/shop";

type T3 = typeof THREE;
export type Figure = { group: THREE.Group; arms: THREE.Group[]; legs: THREE.Group[]; pet: THREE.Group | null };

const SKIN = 0xf2c79a;

export function buildFigure(T: T3, look: Look = DEFAULT_LOOK, pants = 0x24415c): Figure {
  const lambert = (color: number) => new T.MeshLambertMaterial({ color });
  const box = (w: number, h: number, d: number, color: number) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), lambert(color)); m.castShadow = true; return m; };
  const cone = (r: number, h: number, seg: number, color: number) => { const m = new T.Mesh(new T.ConeGeometry(r, h, seg), lambert(color)); m.castShadow = true; return m; };
  const at = <O extends THREE.Object3D>(o: O, x: number, y: number, z: number): O => { o.position.set(x, y, z); return o; };

  const shirt = shopItem(look.shirt)?.color ?? 0x0a7472;
  const g = new T.Group();
  g.add(at(box(0.95, 1.05, 0.5, shirt), 0, 1.5, 0), at(box(0.62, 0.62, 0.62, SKIN), 0, 2.36, 0));

  // The hat.
  const gold = 0xf5b301;
  switch (look.hat) {
    case "hat-party":
      g.add(at(cone(0.3, 0.75, 10, 0xec4899), 0, 3.03, 0), at(box(0.14, 0.14, 0.14, 0xfde047), 0, 3.44, 0));
      break;
    case "hat-ears":
      for (const x of [-0.18, 0.18]) g.add(at(box(0.16, 0.7, 0.1, 0xffffff), x, 3.0, 0), at(box(0.08, 0.5, 0.02, 0xf9a8d4), x, 3.0, -0.06));
      break;
    case "hat-wizard":
      g.add(at(box(1.0, 0.07, 1.0, 0x5b21b6), 0, 2.7, 0), at(cone(0.4, 1.0, 12, 0x6d28d9), 0, 3.22, 0), at(box(0.12, 0.12, 0.02, 0xfde047), 0, 3.05, -0.34));
      break;
    case "hat-helmet":
      g.add(at(box(0.72, 0.42, 0.72, 0x9ca3af), 0, 2.6, 0), at(box(0.74, 0.1, 0.2, 0x6b7280), 0, 2.44, -0.3), at(box(0.1, 0.4, 0.5, 0xdc2626), 0, 2.98, 0.05));
      break;
    case "hat-crown":
      g.add(at(box(0.7, 0.16, 0.7, gold), 0, 2.75, 0));
      for (const [x, z] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28], [0, -0.28], [0, 0.28]]) g.add(at(box(0.13, 0.24, 0.13, gold), x, 2.92, z));
      g.add(at(box(0.1, 0.1, 0.04, 0xdc2626), 0, 2.76, -0.36));
      break;
    case "hat-flower":
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.add(at(box(0.2, 0.2, 0.2, [0xec4899, 0xfde047, 0xf97316, 0xa78bfa][k % 4]), Math.cos(a) * 0.36, 2.72, Math.sin(a) * 0.36)); }
      break;
    case "hat-chef":
      g.add(at(box(0.66, 0.5, 0.66, 0xffffff), 0, 2.9, 0), at(box(0.86, 0.34, 0.86, 0xffffff), 0, 3.3, 0));
      break;
    case "hat-pirate":
      g.add(at(box(1.1, 0.1, 0.9, 0x1f2937), 0, 2.72, 0), at(box(0.7, 0.42, 0.6, 0x1f2937), 0, 2.94, 0), at(box(0.2, 0.2, 0.02, 0xffffff), 0, 2.94, -0.31));
      break;
    case "hat-top":
      g.add(at(box(1.0, 0.08, 1.0, 0x111827), 0, 2.7, 0), at(box(0.6, 0.7, 0.6, 0x111827), 0, 3.08, 0), at(box(0.62, 0.12, 0.62, 0xdc2626), 0, 2.82, 0));
      break;
    case "hat-astro":
      g.add(at(box(0.86, 0.86, 0.86, 0xf1f5f9), 0, 2.4, 0.02), at(box(0.6, 0.44, 0.06, 0x1e3a8a), 0, 2.44, -0.43), at(box(0.1, 0.3, 0.1, 0x94a3b8), 0.3, 2.98, 0));
      break;
    case "hat-star":
      g.add(at(box(0.68, 0.2, 0.68, 0x1e3a8a), 0, 2.76, 0), at(box(0.5, 0.08, 0.3, 0x1e3a8a), 0, 2.68, -0.46));
      { const st = at(box(0.34, 0.34, 0.1, gold), 0, 3.1, 0); st.rotation.z = Math.PI / 4; g.add(st, at(box(0.34, 0.34, 0.1, gold), 0, 3.1, 0)); }
      break;
    case "hat-diamond":
      g.add(at(box(0.7, 0.16, 0.7, 0xe2e8f0), 0, 2.75, 0));
      for (const [x, z] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28], [0, -0.28], [0, 0.28]]) g.add(at(cone(0.09, 0.34, 4, 0x7dd3fc), x, 3.0, z));
      g.add(at(cone(0.16, 0.5, 4, 0x38bdf8), 0, 3.1, 0));
      break;
    default:
      g.add(at(box(0.68, 0.2, 0.68, 0xf5a400), 0, 2.76, 0), at(box(0.5, 0.08, 0.3, 0xf5a400), 0, 2.68, -0.46));
  }

  // On the back (the figure runs away from the camera, so the back is what the child sees).
  switch (look.back) {
    case "back-cape": {
      const cape = at(box(0.98, 1.45, 0.06, 0xdc2626), 0, 1.28, 0.36);
      cape.rotation.x = 0.16;
      g.add(cape, at(box(1.0, 0.14, 0.2, 0xb91c1c), 0, 2.0, 0.26));
      break;
    }
    case "back-shield":
      g.add(at(box(0.74, 0.86, 0.1, 0x2563eb), 0, 1.5, 0.34), at(box(0.14, 0.7, 0.04, 0xfde047), 0, 1.5, 0.4), at(box(0.56, 0.14, 0.04, 0xfde047), 0, 1.6, 0.4));
      break;
    case "back-wings":
      for (const side of [-1, 1]) {
        const w = new T.Group();
        w.add(at(box(0.78, 0.5, 0.06, 0xffffff), side * 0.42, 0.25, 0), at(box(0.6, 0.4, 0.06, 0xe0f2fe), side * 0.36, -0.18, 0), at(box(0.36, 0.3, 0.06, 0xffffff), side * 0.24, -0.5, 0));
        w.position.set(side * 0.2, 1.7, 0.32);
        w.rotation.y = side * -0.5;
        g.add(w);
      }
      break;
    case "back-jet":
      for (const x of [-0.24, 0.24]) {
        const flame = at(cone(0.13, 0.34, 8, 0xf97316), x, 0.96, 0.42);
        flame.rotation.x = Math.PI;
        g.add(at(box(0.3, 0.8, 0.3, 0x9ca3af), x, 1.56, 0.42), at(box(0.32, 0.12, 0.32, 0x4b5563), x, 2.0, 0.42), flame);
      }
      break;
    case "back-balloon":
      g.add(at(box(0.03, 1.5, 0.03, 0x64748b), 0.5, 2.5, 0.3), at(box(0.62, 0.72, 0.62, 0xef4444), 0.5, 3.6, 0.3), at(box(0.62, 0.7, 0.26, 0xf5a400), 0, 1.56, 0.36));
      break;
    case "back-guitar": {
      const gt = new T.Group();
      gt.add(at(box(0.6, 0.7, 0.14, 0xb45309), 0, 0, 0), at(box(0.16, 0.9, 0.1, 0x78350f), 0, 0.75, 0), at(box(0.24, 0.24, 0.02, 0x1f2937), 0, 0.05, 0.08));
      gt.position.set(0, 1.5, 0.36); gt.rotation.z = 0.5;
      g.add(gt);
      break;
    }
    case "back-sword": {
      const sw = new T.Group();
      sw.add(at(box(0.14, 1.3, 0.06, 0xd6b98c), 0, 0.3, 0), at(box(0.5, 0.1, 0.1, 0x92400e), 0, -0.36, 0), at(box(0.12, 0.3, 0.1, 0x92400e), 0, -0.54, 0));
      sw.position.set(0, 1.6, 0.34); sw.rotation.z = -0.6;
      g.add(sw);
      break;
    }
    case "back-butterfly":
    case "back-phoenix":
      for (const side of [-1, 1]) {
        const fire = look.back === "back-phoenix";
        const w = new T.Group();
        w.add(at(box(fire ? 1.1 : 0.8, 0.62, 0.06, fire ? 0xf97316 : 0xa855f7), side * (fire ? 0.6 : 0.44), 0.32, 0), at(box(fire ? 0.9 : 0.62, 0.5, 0.06, fire ? 0xef4444 : 0xec4899), side * (fire ? 0.5 : 0.36), -0.2, 0), at(box(0.2, 0.2, 0.08, fire ? 0xfde047 : 0xfde047), side * (fire ? 0.9 : 0.5), 0.36, 0.01));
        if (fire) w.add(at(box(0.5, 0.36, 0.06, 0xfde047), side * 0.3, -0.6, 0));
        w.position.set(side * 0.2, 1.7, 0.32);
        w.rotation.y = side * -0.5;
        g.add(w);
      }
      break;
    case "back-starcape": {
      const cape = at(box(0.98, 1.45, 0.06, 0x1e3a8a), 0, 1.28, 0.36);
      cape.rotation.x = 0.16;
      g.add(cape, at(box(1.0, 0.14, 0.2, 0x172554), 0, 2.0, 0.26));
      for (const [x, y] of [[-0.25, 1.7], [0.2, 1.5], [-0.1, 1.15], [0.28, 0.95], [-0.3, 0.8]]) g.add(at(box(0.1, 0.1, 0.02, 0xfde047), x, y, 0.42 + (1.6 - y) * 0.16));
      break;
    }
    default:
      g.add(at(box(0.62, 0.7, 0.26, 0xf5a400), 0, 1.56, 0.36));
  }

  const limb = (x: number, y: number, len: number, color: number, tip: number) => {
    const pivot = new T.Group();
    pivot.position.set(x, y, 0);
    pivot.add(at(box(0.3, len, 0.3, color), 0, -len / 2, 0), at(box(0.32, 0.2, 0.34, tip), 0, -len + 0.1, 0));
    g.add(pivot);
    return pivot;
  };
  const arms = [limb(-0.64, 2.0, 0.95, shirt, SKIN), limb(0.64, 2.0, 0.95, shirt, SKIN)];
  const legs = [limb(-0.25, 0.98, 0.98, pants, 0xffffff), limb(0.25, 0.98, 0.98, pants, 0xffffff)];

  // A little companion beside the runner.
  let pet: THREE.Group | null = null;
  if (look.pet !== "pet-none" && shopItem(look.pet)) {
    pet = new T.Group();
    const p = pet;
    const creature = (body: number, dark: number) => { p.add(at(box(0.46, 0.4, 0.66, body), 0, 0.36, 0), at(box(0.4, 0.38, 0.38, body), 0, 0.66, -0.34)); for (const [x, z] of [[-0.15, -0.2], [0.15, -0.2], [-0.15, 0.2], [0.15, 0.2]]) p.add(at(box(0.12, 0.2, 0.12, dark), x, 0.1, z)); };
    switch (look.pet) {
      case "pet-chick":
        p.add(at(box(0.42, 0.42, 0.42, 0xfde047), 0, 0.34, 0), at(box(0.3, 0.3, 0.3, 0xfde047), 0, 0.68, -0.1), at(box(0.12, 0.08, 0.14, 0xf97316), 0, 0.66, -0.3));
        for (const x of [-0.1, 0.1]) p.add(at(box(0.06, 0.14, 0.06, 0xf97316), x, 0.07, 0));
        break;
      case "pet-dog":
        creature(0xb7791f, 0x7c4a03);
        for (const x of [-0.2, 0.2]) p.add(at(box(0.1, 0.24, 0.16, 0x7c4a03), x, 0.7, -0.3));
        p.add(at(box(0.1, 0.1, 0.3, 0xb7791f), 0, 0.5, 0.42), at(box(0.12, 0.1, 0.08, 0x1f2937), 0, 0.62, -0.56));
        break;
      case "pet-cat":
        creature(0x9ca3af, 0x6b7280);
        for (const x of [-0.13, 0.13]) p.add(at(cone(0.09, 0.2, 4, 0x6b7280), x, 0.94, -0.34));
        p.add(at(box(0.08, 0.4, 0.08, 0x9ca3af), 0, 0.66, 0.36));
        break;
      case "pet-robot":
        p.add(at(box(0.44, 0.44, 0.4, 0xcbd5e1), 0, 0.4, 0), at(box(0.36, 0.3, 0.34, 0x94a3b8), 0, 0.8, 0), at(box(0.24, 0.08, 0.04, 0x38bdf8), 0, 0.82, -0.18), at(box(0.04, 0.2, 0.04, 0x475569), 0, 1.05, 0), at(box(0.1, 0.1, 0.1, 0xef4444), 0, 1.18, 0));
        for (const x of [-0.14, 0.14]) p.add(at(box(0.14, 0.16, 0.2, 0x475569), x, 0.08, 0));
        break;
      case "pet-bunny":
        creature(0xffffff, 0xe2e8f0);
        for (const x of [-0.1, 0.1]) p.add(at(box(0.1, 0.44, 0.08, 0xffffff), x, 1.05, -0.34), at(box(0.05, 0.3, 0.02, 0xf9a8d4), x, 1.05, -0.39));
        p.add(at(box(0.16, 0.16, 0.16, 0xffffff), 0, 0.42, 0.4));
        break;
      case "pet-fox":
        creature(0xea580c, 0x7c2d12);
        for (const x of [-0.13, 0.13]) p.add(at(cone(0.1, 0.24, 4, 0xea580c), x, 0.96, -0.34));
        p.add(at(box(0.14, 0.14, 0.4, 0xea580c), 0, 0.46, 0.5), at(box(0.15, 0.15, 0.14, 0xffffff), 0, 0.46, 0.74), at(box(0.2, 0.14, 0.1, 0xffffff), 0, 0.58, -0.56));
        break;
      case "pet-owl":
        p.add(at(box(0.46, 0.56, 0.4, 0x92400e), 0, 0.4, 0), at(box(0.5, 0.36, 0.42, 0xb45309), 0, 0.82, 0));
        for (const x of [-0.12, 0.12]) p.add(at(box(0.16, 0.16, 0.04, 0xfde047), x, 0.84, -0.22), at(box(0.07, 0.07, 0.04, 0x111827), x, 0.84, -0.24), at(cone(0.07, 0.16, 4, 0x92400e), x * 1.6, 1.08, 0));
        p.add(at(cone(0.05, 0.12, 4, 0xf97316), 0, 0.74, -0.26));
        break;
      case "pet-unicorn":
        creature(0xffffff, 0xf5d0fe);
        p.add(at(cone(0.06, 0.34, 6, 0xf5b301), 0, 1.02, -0.4));
        for (const z of [-0.2, 0, 0.18]) p.add(at(box(0.1, 0.2, 0.14, [0xec4899, 0xa78bfa, 0x38bdf8][Math.round((z + 0.2) * 5) % 3]), 0, 0.72, z));
        p.add(at(box(0.1, 0.34, 0.1, 0xec4899), 0, 0.42, 0.42));
        break;
      default:
        // The little dragon (and the golden one).
        creature(look.pet === "pet-golddragon" ? 0xf5b301 : 0x22c55e, look.pet === "pet-golddragon" ? 0xb45309 : 0x15803d);
        for (const z of [-0.1, 0.12, 0.3]) p.add(at(cone(0.07, 0.16, 4, look.pet === "pet-golddragon" ? 0xef4444 : 0xfde047), 0, 0.64, z));
        for (const side of [-1, 1]) { const w = at(box(0.36, 0.26, 0.04, look.pet === "pet-golddragon" ? 0xfde68a : 0x86efac), side * 0.34, 0.6, 0.04); w.rotation.y = side * -0.5; p.add(w); }
        p.add(at(box(0.1, 0.1, 0.34, look.pet === "pet-golddragon" ? 0xf5b301 : 0x22c55e), 0, 0.34, 0.48));
    }
    pet.position.set(1.15, 0, 0.5);
    g.add(pet);
  }
  return { group: g, arms, legs, pet };
}

/** The companion hops a little out of step with the runner. */
export function hop(f: { pet: THREE.Group | null }, t: number, still: boolean): void {
  if (f.pet) f.pet.position.y = still ? 0 : Math.abs(Math.sin(t * 11 + 1.3)) * 0.22;
}

export type PreviewHandle = { setLook: (look: Look) => void; dispose: () => void };

/** The figure in the shop window: it runs on the spot and turns slowly, so every side is seen. */
export async function startPreview(canvas: HTMLCanvasElement, first: Look): Promise<PreviewHandle> {
  const T = await import("three");
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(40, 1, 0.1, 50);
  cam.position.set(0, 2.2, 6.4);
  cam.lookAt(0, 1.55, 0);
  scene.add(new T.HemisphereLight(0xffffff, 0xbfe3c8, 1.25));
  const sun = new T.DirectionalLight(0xfff4d6, 1.3);
  sun.position.set(4, 8, 6);
  scene.add(sun);
  const floor = new T.Mesh(new T.CylinderGeometry(2.1, 2.1, 0.14, 40), new T.MeshLambertMaterial({ color: 0xe6cf95 }));
  floor.position.y = -0.07;
  scene.add(floor);

  let fig = buildFigure(T, first);
  scene.add(fig.group);
  const free = (o: THREE.Object3D) => o.traverse((x) => { const m = x as THREE.Mesh; m.geometry?.dispose?.(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; if (Array.isArray(mat)) mat.forEach((y) => y.dispose()); else mat?.dispose?.(); });

  // The whole figure, hat to shoes, whatever the shape of the window: a tall window stands further back.
  const size = () => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    const far = cam.aspect < 0.9 ? 9.2 : 7.6;
    cam.position.set(0, 2.5, far);
    cam.lookAt(0, 1.75, 0);
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(size);
  ro.observe(canvas);
  size();

  let stopped = false, raf = 0, turn = Math.PI;
  const t0 = performance.now();
  const frame = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    const a = Math.sin(t * 7) * 0.6;
    fig.arms[0].rotation.x = a; fig.arms[1].rotation.x = -a;
    fig.legs[0].rotation.x = -a; fig.legs[1].rotation.x = a;
    hop(fig, t * 0.64, false);
    // Mostly the back and the sides: that is what the child sees on the road.
    fig.group.rotation.y = turn + Math.sin(t * 0.5) * 2.4;
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(frame);

  return {
    setLook: (look) => { scene.remove(fig.group); free(fig.group); fig = buildFigure(T, look); scene.add(fig.group); turn = Math.PI; },
    dispose: () => { stopped = true; cancelAnimationFrame(raf); ro.disconnect(); free(scene); renderer.dispose(); },
  };
}
