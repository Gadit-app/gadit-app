/**
 * Inside the fortress (the journey, Gadi 2026-11-15).
 *
 * The run ends at the gate; behind it is a stone hall. The monster sits on a
 * step in front of the far door and keeps today's words in cages that hang
 * from the ceiling, one glowing word in each. The child's own runner, in the
 * look bought in the shop, stands in the hall.
 *
 *   free(i)  the cage of word i opens and the word flies to the child;
 *   hold(i)  the cage shakes and stays shut: the word waits for tomorrow;
 *   now(i)   the cage being asked about swings a little;
 *   open()   every word is free: the monster steps aside and the far door rises.
 *
 * Nothing here is scary: a funny monster, warm torches, no dark corners.
 * The look is our own: plain boxes, cones and soft colours.
 */
import type * as THREE from "three";
import { DEFAULT_LOOK, type Look } from "@/lib/journey/shop";
import { buildFigure, hop } from "./figure";
import { THEMES } from "./engine";
import { loadModel, type ModelName } from "./models";

export type HallOptions = { theme: number; look?: Look; total: number; monster: number; monsterColor: number; /** The first word hangs on the right (Hebrew). */ rtl?: boolean; /** Words the child looked up themselves: a marked cage. */ own?: boolean[] };
export type HallHandle = { free: (i: number) => void; hold: (i: number) => void; now: (i: number) => void; open: () => void; dispose: () => void };

type Cage = { group: THREE.Group; bars: THREE.Object3D[]; orb: THREE.Mesh; state: "shut" | "free" | "held"; t: number; shake: number; from: THREE.Vector3 | null };

export async function startHall(canvas: HTMLCanvasElement, o: HallOptions): Promise<HallHandle> {
  const T = await import("three");
  const th = THEMES[o.theme % THEMES.length];
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  const scene = new T.Scene();
  scene.background = new T.Color(0x2a2f3a);
  scene.fog = new T.Fog(0x2a2f3a, 16, 34);
  const cam = new T.PerspectiveCamera(50, 1, 0.1, 80);

  const lambert = (color: number, emissive = 0x000000) => new T.MeshLambertMaterial({ color, emissive });
  const box = (w: number, h: number, d: number, color: number) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), lambert(color)); m.castShadow = true; m.receiveShadow = true; return m; };
  const at = <O extends THREE.Object3D>(ob: O, x: number, y: number, z: number): O => { ob.position.set(x, y, z); return ob; };
  const shade = (c: number, k: number) => new T.Color(c).multiplyScalar(k).getHex();

  // The hall: floor, a carpet in the fortress colour, the far wall of stones, pillars.
  scene.add(at(box(110, 0.4, 26, shade(th.fortDark, 0.8)), 0, -0.2, -1));
  scene.add(at(box(4.4, 0.06, 16, th.roof), 0, 0.03, 1));
  const WALL_Z = -7;
  // Wide enough for the widest screen: the wall has no end in sight.
  scene.add(at(box(110, 16, 0.8, th.fort), 0, 8, WALL_Z));
  for (let i = 0; i < 150; i++) {
    const w = 1.2 + Math.random() * 1.4, x = -46 + Math.random() * 92, y = 0.6 + Math.random() * 13;
    if (Math.abs(x) < 3 && y < 7.4) continue; // the door stays clear
    scene.add(at(box(w, 0.7, 0.2, shade(th.fort, 0.86 + Math.random() * 0.22)), x, y, WALL_Z + 0.42));
  }
  for (const x of [-34, -26, -18, -9.5, -5.2, 5.2, 9.5, 18, 26, 34]) {
    scene.add(at(box(1.2, 12, 1.2, th.fortDark), x, 6, WALL_Z + 1.4), at(box(1.6, 0.5, 1.6, shade(th.fortDark, 1.2)), x, 0.25, WALL_Z + 1.4), at(box(1.6, 0.5, 1.6, shade(th.fortDark, 1.2)), x, 11.2, WALL_Z + 1.4));
  }
  // Banners in the fortress colour.
  for (const x of [-22, -14, -7.3, 7.3, 14, 22]) scene.add(at(box(1.5, 3.6, 0.08, th.roof), x, 7.4, WALL_Z + 0.5), at(box(0.5, 0.5, 0.1, th.flag), x, 7.6, WALL_Z + 0.56));

  // The far door, and the light of the road behind it.
  const frame = new T.Group();
  frame.add(at(box(0.6, 7.2, 0.9, th.fortDark), -2.5, 3.6, 0), at(box(0.6, 7.2, 0.9, th.fortDark), 2.5, 3.6, 0), at(box(5.6, 0.7, 0.9, th.fortDark), 0, 7.5, 0));
  frame.position.z = WALL_Z + 0.5;
  scene.add(frame);
  const glow = new T.Mesh(new T.PlaneGeometry(4.4, 7), new T.MeshBasicMaterial({ color: 0xfff1b8 }));
  scene.add(at(glow, 0, 3.6, WALL_Z + 0.46));
  const door = new T.Group();
  door.add(at(box(4.4, 7, 0.3, 0x7a4a22), 0, 0, 0));
  for (const y of [-2.2, 0, 2.2]) door.add(at(box(4.5, 0.3, 0.36, 0x3b2a1a), 0, y, 0));
  door.add(at(box(0.4, 0.4, 0.5, 0xf5b301), 1.5, 0, 0));
  door.position.set(0, 3.5, WALL_Z + 0.75);
  scene.add(door);

  // Light: a soft room light and two torches that flicker.
  scene.add(new T.HemisphereLight(0xffe6c0, 0x3a3340, 0.85));
  const key = new T.DirectionalLight(0xfff0d0, 0.9);
  key.position.set(3, 12, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  const kc = key.shadow.camera; kc.left = -14; kc.right = 14; kc.top = 14; kc.bottom = -6; kc.near = 1; kc.far = 40;
  scene.add(key);
  const torches: Array<{ light: THREE.PointLight; flame: THREE.Mesh; seed: number }> = [];
  for (const x of [-3.9, 3.9]) {
    scene.add(at(box(0.18, 1.2, 0.18, 0x3a2a1c), x, 5.0, WALL_Z + 0.8), at(box(0.5, 0.2, 0.5, 0x4b5563), x, 5.6, WALL_Z + 0.8));
    const flame = new T.Mesh(new T.ConeGeometry(0.28, 0.8, 8), new T.MeshBasicMaterial({ color: 0xffb020 }));
    scene.add(at(flame, x, 6.2, WALL_Z + 0.8));
    const light = new T.PointLight(0xffa040, 26, 16, 1.6);
    light.position.set(x, 6.3, WALL_Z + 1.6);
    scene.add(light);
    torches.push({ light, flame, seed: Math.random() * 10 });
  }

  // The monster: a round, funny creature on a stone step in front of the door.
  scene.add(at(box(6.4, 0.5, 3.2, shade(th.fort, 1.1)), 0, 0.25, -3.6), at(box(5.2, 0.5, 2.4, shade(th.fort, 1.2)), 0, 0.75, -3.8));
  const mon = new T.Group();
  const body = new T.Mesh(new T.SphereGeometry(1.5, 20, 16), lambert(o.monsterColor));
  body.scale.set(1.15, 1, 1);
  body.castShadow = true;
  body.position.y = 1.45;
  mon.add(body);
  const pupils: THREE.Mesh[] = [];
  const eye = (x: number, r: number) => {
    const w = new T.Mesh(new T.SphereGeometry(r, 16, 12), lambert(0xffffff)); w.position.set(x, 1.85, 1.28);
    const p = new T.Mesh(new T.SphereGeometry(r * 0.46, 12, 10), lambert(0x14202b)); p.position.set(x, 1.85, 1.28 + r * 0.72);
    mon.add(w, p); pupils.push(p);
  };
  const k = o.monster % 3;
  if (k === 1) eye(0, 0.56); else { eye(-0.56, 0.38); eye(0.56, 0.38); }
  if (k === 0) for (const x of [-0.8, 0.8]) { const h = new T.Mesh(new T.ConeGeometry(0.24, 0.8, 8), lambert(0xfde68a)); h.position.set(x, 2.95, 0.2); h.rotation.z = x < 0 ? 0.35 : -0.35; mon.add(h); }
  if (k === 2) for (const x of [-0.5, 0.5]) { mon.add(at(box(0.08, 0.8, 0.08, o.monsterColor), x, 3.2, 0.2)); const b = new T.Mesh(new T.SphereGeometry(0.18, 10, 8), lambert(0xfde68a)); b.position.set(x, 3.65, 0.2); mon.add(b); }
  const mouth = at(box(0.9, 0.16, 0.1, 0x14202b), 0, 1.05, 1.42);
  mon.add(mouth);
  for (const x of [-1.0, 1.0]) mon.add(at(box(0.5, 0.36, 0.7, shade(o.monsterColor, 0.82)), x, 0.18, 0.6));
  mon.position.set(0, 1.0, -3.7);
  scene.add(mon);
  // The real monster (run/models.ts): when it arrives, the shapes above are
  // hidden and the model takes their place; the breathing, the sad shrink and
  // the step aside work on the group, so they move the model too.
  void loadModel(T, `monster${(o.monster % 3) + 1}` as ModelName, { height: 3.3 }).then((m) => {
    if (stopped) return;
    for (const ch of mon.children) ch.visible = false;
    m.position.set(0, 0, 0.2);
    mon.add(m);
  }).catch(() => undefined);

  // The cages: one for every word of the day, hanging in a row.
  const n = Math.max(1, Math.min(8, o.total));
  const span = Math.min(12.5, 2.1 * (n - 1));
  const orbGeo = new T.IcosahedronGeometry(0.34, 1);
  const cages: Cage[] = [];
  for (let i = 0; i < n; i++) {
    const g = new T.Group();
    const x = (n === 1 ? 0 : -span / 2 + (span * i) / (n - 1)) * (o.rtl ? -1 : 1);
    g.add(at(box(0.05, 2.4, 0.05, 0x4b5563), 0, 1.75, 0), at(box(1.0, 0.12, 1.0, 0x374151), 0, 0.56, 0), at(box(1.0, 0.12, 1.0, 0x374151), 0, -0.56, 0));
    const bars: THREE.Object3D[] = [];
    for (const [bx, bz] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42], [0, 0.42], [0, -0.42], [-0.42, 0], [0.42, 0]]) { const b = at(box(0.07, 1.0, 0.07, 0x6b7280), bx, 0, bz); g.add(b); bars.push(b); }
    // A word the child looked up: a golden cap on the cage and a small flag.
    if (o.own?.[i]) g.add(at(box(1.08, 0.14, 1.08, 0xf5b301), 0, 0.66, 0), at(box(0.05, 0.6, 0.05, 0x4b5563), 0.4, 1.0, 0), at(box(0.42, 0.26, 0.04, 0xf5b301), 0.62, 1.16, 0));
    const orb = new T.Mesh(orbGeo, new T.MeshLambertMaterial({ color: 0xffd34d, emissive: 0xb37400 }));
    g.add(orb);
    // Lower in the middle, like a garland, and clear of the door's light.
    g.position.set(x, 8.2 - Math.cos(((n === 1 ? 0 : i / (n - 1)) - 0.5) * Math.PI) * 0.7, -2.2);
    scene.add(g);
    cages.push({ group: g, bars, orb, state: "shut", t: 0, shake: 0, from: null });
  }

  // The child: the same runner, in the look from the shop, standing in the hall.
  const kid = buildFigure(T, o.look ?? DEFAULT_LOOK);
  kid.group.position.set(-3.6, 0, 0.6);
  kid.group.rotation.y = -0.3;
  scene.add(kid.group);

  let nowAt = 0, opening = -1, cheer = 0, sad = 0, stopped = false, raf = 0;
  let last = performance.now(), clock = 0;
  const kidHead = new T.Vector3(-3.6, 3.4, 0.6);

  const size = () => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    // A tall, narrow screen stands further back so the whole row of cages is seen.
    const narrow = w / h < 1.25;
    cam.fov = narrow ? 62 : 46;
    cam.position.set(0, narrow ? 5.2 : 4.8, narrow ? 17 : 12.5);
    cam.lookAt(0, narrow ? 4.4 : 4.0, -3);
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(size);
  ro.observe(canvas);
  size();

  const frame2 = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(frame2);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; clock += dt;

    for (const t of torches) {
      const f = 0.82 + Math.sin(clock * 9 + t.seed) * 0.1 + Math.sin(clock * 23 + t.seed * 2) * 0.08;
      t.light.intensity = 26 * f;
      t.flame.scale.set(1, 0.9 + f * 0.25, 1);
    }
    // The monster breathes; for a moment after a word goes free it looks sad.
    sad = Math.max(0, sad - dt);
    const down = opening >= 0 ? 1 : Math.min(1, sad * 1.6);
    mon.scale.set(1 + Math.sin(clock * 2.2) * 0.02 - down * 0.06, 1 + Math.sin(clock * 2.2 + 1) * 0.03 - down * 0.12, 1);
    for (const p of pupils) p.position.y = 1.85 - down * 0.14;
    mouth.rotation.z = 0; mouth.scale.x = 1 - down * 0.35;

    for (let i = 0; i < cages.length; i++) {
      const c = cages[i];
      c.orb.rotation.y = clock * 1.6;
      if (c.state === "shut") {
        const swing = i === nowAt ? Math.sin(clock * 3) * 0.12 : Math.sin(clock * 1.1 + i) * 0.03;
        c.group.rotation.z = swing;
        const s = i === nowAt ? 1.12 + Math.sin(clock * 5) * 0.1 : 1;
        c.orb.scale.setScalar(s);
      } else if (c.state === "held") {
        c.shake = Math.max(0, c.shake - dt);
        c.group.rotation.z = Math.sin(clock * 34) * 0.16 * (c.shake / 0.7);
        c.orb.scale.setScalar(0.9);
      } else {
        // Free: the bars fall away, the word rises out and flies to the child.
        c.t += dt;
        c.group.rotation.z *= 0.9;
        for (const b of c.bars) { b.scale.y = Math.max(0.001, 1 - c.t * 3); b.position.y = -Math.min(0.5, c.t * 1.5); b.visible = c.t < 0.4; }
        if (!c.from) { c.from = new T.Vector3(); c.orb.getWorldPosition(c.from); scene.attach(c.orb); }
        const u = Math.min(1, Math.max(0, (c.t - 0.25) / 1.1));
        const e = u * u * (3 - 2 * u);
        const ring = (i / cages.length) * Math.PI * 2 + clock * 1.3;
        const tx = kidHead.x + Math.cos(ring) * 0.9, ty = kidHead.y + 0.3 + Math.sin(clock * 2 + i) * 0.15, tz = kidHead.z + Math.sin(ring) * 0.9;
        c.orb.position.set(c.from.x + (tx - c.from.x) * e, c.from.y + (ty - c.from.y) * e + Math.sin(e * Math.PI) * 1.4, c.from.z + (tz - c.from.z) * e);
        c.orb.scale.setScalar(1 - e * 0.35);
      }
    }

    // The child bobs on the spot and jumps for joy when a word goes free.
    cheer = Math.max(0, cheer - dt);
    const jump = cheer > 0 ? Math.abs(Math.sin((1 - cheer / 0.9) * Math.PI * 2)) * 0.7 : 0;
    kid.group.position.y = jump;
    const arm = cheer > 0 ? -2.6 : Math.sin(clock * 1.6) * 0.08;
    kid.arms[0].rotation.x = arm; kid.arms[1].rotation.x = cheer > 0 ? -2.6 : -arm;
    hop(kid, clock * 0.4, false);

    if (opening >= 0) {
      // The monster shuffles aside and the far door rises.
      opening += dt;
      mon.position.x += (4.6 - mon.position.x) * Math.min(1, dt * 2.2);
      door.position.y = 3.5 + Math.min(7.2, Math.max(0, opening - 0.5) * 3.2);
    }
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(frame2);

  return {
    free: (i) => { const c = cages[i]; if (c && c.state !== "free") { c.state = "free"; c.t = 0; cheer = 0.9; sad = 1.6; } },
    hold: (i) => { const c = cages[i]; if (c && c.state === "shut") { c.state = "held"; c.shake = 0.7; } },
    now: (i) => { nowAt = i; },
    open: () => { if (opening < 0) { opening = 0; cheer = 0.9; } },
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
