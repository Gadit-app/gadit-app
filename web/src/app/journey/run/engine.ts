/**
 * The run to the fortress: the 3D part (Gadi 2026-11-14).
 *
 * A blocky character always runs forward on a three-lane path; the child only
 * steers it left and right. Sparks on the path are for the race, a block on
 * the path makes the runner stumble for a moment. Nothing is ever taken away
 * and there is no clock. The path ends at the gate of a fortress.
 *
 * The look is our own: plain boxes, soft colours, three landscapes.
 */

import type * as THREE from "three";

export type Theme = { sky: number; ground: number; path: number; line: number; block: number; fort: number; roof: number; prop: "tree" | "cactus" | "ice" };
export const THEMES: Theme[] = [
  { sky: 0xbfe8ff, ground: 0x7cc46a, path: 0xe9d8a6, line: 0xfff7dc, block: 0x8a5a2b, fort: 0x9aa5b1, roof: 0xd9534f, prop: "tree" },
  { sky: 0xffe2b0, ground: 0xe8c07a, path: 0xf6e7c1, line: 0xffffff, block: 0xb5651d, fort: 0xc98d5a, roof: 0x6b3fa0, prop: "cactus" },
  { sky: 0xd8f1ff, ground: 0xf2fbff, path: 0xbfe3f5, line: 0xffffff, block: 0x7fc4e8, fort: 0x8fb7d9, roof: 0x2f6fb0, prop: "ice" },
];

export type Rival = { name: string; shirt: number };
export type RunOptions = {
  theme: number;
  rivals: Rival[];
  onSparks: (n: number) => void;
  onProgress: (part: number, place: number) => void;
  onSpark: () => void;
  onStumble: () => void;
  /** The runner reached the gate. `place` is 1 when nobody was ahead. */
  onArrive: (r: { place: number; sparks: number }) => void;
};
export type RunHandle = { steer: (dir: -1 | 1) => void; dispose: () => void };

const LANES = [-2.2, 0, 2.2];
const LENGTH = 300;
const ROW_GAP = 9;

type Runner = { group: THREE.Group; arms: THREE.Group[]; legs: THREE.Group[]; lane: number; x: number; dist: number; pace: number; stumble: number; done: boolean; decided: number };
type Item = { mesh: THREE.Object3D; lane: number; dist: number; kind: "block" | "spark"; hit: boolean };

export async function startRun(canvas: HTMLCanvasElement, o: RunOptions): Promise<RunHandle> {
  const T = await import("three");
  const th = THEMES[o.theme % THEMES.length];
  const renderer = new T.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new T.Scene();
  scene.background = new T.Color(th.sky);
  scene.fog = new T.Fog(th.sky, 45, 120);
  const cam = new T.PerspectiveCamera(62, 1, 0.1, 220);
  scene.add(new T.HemisphereLight(0xffffff, th.ground, 1.25));
  const sun = new T.DirectionalLight(0xffffff, 1.1);
  sun.position.set(6, 12, 8);
  scene.add(sun);

  const box = (w: number, h: number, d: number, color: number) => new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshLambertMaterial({ color }));
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  // The land, the path and its two lane lines.
  const land = box(160, 1, LENGTH + 160, th.ground);
  land.position.set(0, -0.5, -LENGTH / 2);
  scene.add(land);
  const path = box(7, 0.1, LENGTH + 60, th.path);
  path.position.set(0, 0.05, -LENGTH / 2);
  scene.add(path);
  for (const x of [-1.1, 1.1]) { const l = box(0.12, 0.02, LENGTH + 60, th.line); l.position.set(x, 0.11, -LENGTH / 2); scene.add(l); }

  // Things beside the path.
  const prop = (): THREE.Group => {
    const g = new T.Group();
    if (th.prop === "tree") {
      const trunk = new T.Mesh(new T.CylinderGeometry(0.3, 0.38, 1.6, 6), new T.MeshLambertMaterial({ color: 0x8a5a2b }));
      trunk.position.y = 0.8;
      const top = new T.Mesh(new T.ConeGeometry(1.5, 3.4, 7), new T.MeshLambertMaterial({ color: 0x2f8f4e }));
      top.position.y = 3.2;
      g.add(trunk, top);
    } else if (th.prop === "cactus") {
      const body = box(0.8, 2.6, 0.8, 0x3f9b5b); body.position.y = 1.3;
      const arm = box(0.5, 1.1, 0.5, 0x3f9b5b); arm.position.set(0.75, 1.7, 0);
      const arm2 = box(0.5, 0.8, 0.5, 0x3f9b5b); arm2.position.set(-0.75, 1.2, 0);
      g.add(body, arm, arm2);
    } else {
      const peak = new T.Mesh(new T.ConeGeometry(1.4, 3.6, 5), new T.MeshLambertMaterial({ color: 0xffffff }));
      peak.position.y = 1.8;
      g.add(peak);
    }
    const s = rnd(0.8, 1.5);
    g.scale.set(s, s, s);
    return g;
  };
  for (let d = -10; d < LENGTH + 30; d += 5) {
    for (const side of [-1, 1]) {
      if (Math.random() < 0.25) continue;
      const p = prop();
      p.position.set(side * rnd(8, 19), 0, -d + rnd(-2, 2));
      scene.add(p);
    }
  }

  // The fortress at the end of the path.
  const fort = new T.Group();
  const wall = box(18, 8, 4, th.fort); wall.position.set(0, 4, -3);
  const gate = box(4.2, 5.2, 0.6, 0x3a2a1c); gate.position.set(0, 2.6, -0.8);
  fort.add(wall, gate);
  for (const x of [-9, 9]) {
    const tower = new T.Mesh(new T.CylinderGeometry(2.2, 2.4, 12, 10), new T.MeshLambertMaterial({ color: th.fort }));
    tower.position.set(x, 6, -3);
    const roof = new T.Mesh(new T.ConeGeometry(2.9, 4, 10), new T.MeshLambertMaterial({ color: th.roof }));
    roof.position.set(x, 14, -3);
    fort.add(tower, roof);
  }
  for (let x = -7; x <= 7; x += 2) { const m = box(1, 1, 4, th.fort); m.position.set(x, 8.5, -3); fort.add(m); }
  fort.position.set(0, 0, -(LENGTH + 6));
  scene.add(fort);

  // A runner made of boxes: head, body, two arms and two legs that swing.
  const makeRunner = (shirt: number, pants: number, hat: number): Runner => {
    const g = new T.Group();
    const body = box(0.95, 1.05, 0.5, shirt); body.position.y = 1.5;
    const head = box(0.62, 0.62, 0.62, 0xf2c79a); head.position.y = 2.36;
    const cap = box(0.68, 0.2, 0.68, hat); cap.position.y = 2.76;
    g.add(body, head, cap);
    const limb = (x: number, y: number, len: number, color: number) => {
      const pivot = new T.Group();
      pivot.position.set(x, y, 0);
      const m = box(0.3, len, 0.3, color);
      m.position.y = -len / 2;
      pivot.add(m);
      g.add(pivot);
      return pivot;
    };
    const arms = [limb(-0.64, 2.0, 0.95, shirt), limb(0.64, 2.0, 0.95, shirt)];
    const legs = [limb(-0.25, 0.98, 0.98, pants), limb(0.25, 0.98, 0.98, pants)];
    scene.add(g);
    return { group: g, arms, legs, lane: 1, x: 0, dist: 0, pace: 1, stumble: 0, done: false, decided: -1 };
  };
  const me = makeRunner(0x0a7472, 0x24415c, 0xf5a400);
  const rivals: Runner[] = o.rivals.map((r, i) => {
    const k = makeRunner(r.shirt, 0x3b3b4f, 0xffffff);
    k.lane = i % 2 === 0 ? 0 : 2;
    k.x = LANES[k.lane];
    k.dist = 0;
    k.pace = 0.93 + i * 0.05;
    // The name floats above the head.
    const c = document.createElement("canvas");
    c.width = 256; c.height = 64;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "rgba(20,32,43,.78)";
      ctx.beginPath(); ctx.roundRect(4, 8, 248, 48, 24); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "700 28px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(r.name, 128, 33);
    }
    const tag = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true }));
    tag.scale.set(2.6, 0.65, 1);
    tag.position.y = 3.5;
    k.group.add(tag);
    return k;
  });

  // The course: every few steps a row with blocks in some lanes and sparks in a free one.
  const items: Item[] = [];
  const rows: Array<{ dist: number; blocked: boolean[] }> = [];
  const sparkGeo = new T.OctahedronGeometry(0.34);
  const sparkMat = new T.MeshLambertMaterial({ color: 0xffc928, emissive: 0xb37400 });
  for (let d = 34; d < LENGTH - 24; d += ROW_GAP) {
    const blocked = [false, false, false];
    const roll = Math.random();
    const n = roll < 0.15 ? 0 : roll < 0.75 ? 1 : 2;
    while (blocked.filter(Boolean).length < n) blocked[Math.floor(Math.random() * 3)] = true;
    rows.push({ dist: d, blocked });
    blocked.forEach((b, lane) => {
      if (!b) return;
      const m = box(1.7, 1.1, 1.0, th.block);
      m.position.set(LANES[lane], 0.6, -d);
      m.rotation.y = rnd(-0.2, 0.2);
      scene.add(m);
      items.push({ mesh: m, lane, dist: d, kind: "block", hit: false });
    });
    const free = [0, 1, 2].filter((l) => !blocked[l]);
    const lane = free[Math.floor(Math.random() * free.length)];
    for (let k = -1; k <= 1; k++) {
      const s = new T.Mesh(sparkGeo, sparkMat);
      s.position.set(LANES[lane], 1.2, -(d + k * 1.6));
      scene.add(s);
      items.push({ mesh: s, lane, dist: d + k * 1.6, kind: "spark", hit: false });
    }
  }

  let sparks = 0;
  let arrived = false;
  let stopped = false;
  let raf = 0;
  let last = performance.now();
  let clock = 0;

  const size = () => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.fov = w < h ? 74 : 62;
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(size);
  ro.observe(canvas);
  size();

  const swing = (r: Runner, t: number) => {
    const a = r.done ? 0 : Math.sin(t * 11) * (r.stumble > 0 ? 0.35 : 0.95);
    r.arms[0].rotation.x = a; r.arms[1].rotation.x = -a;
    r.legs[0].rotation.x = -a; r.legs[1].rotation.x = a;
    r.group.position.set(r.x, r.done ? 0 : Math.abs(Math.sin(t * 11)) * 0.12, -r.dist);
    r.group.rotation.z = r.stumble > 0 ? Math.sin(t * 30) * 0.12 : (LANES[r.lane] - r.x) * -0.08;
  };

  const step = (r: Runner, dt: number, mine: boolean) => {
    if (r.done) return;
    if (r.stumble > 0) r.stumble -= dt;
    const speed = (13 + 4 * Math.min(1, r.dist / LENGTH)) * r.pace * (r.stumble > 0 ? 0.35 : 1);
    r.dist += speed * dt;
    r.x += (LANES[r.lane] - r.x) * Math.min(1, dt * 12);
    for (const it of items) {
      if (it.hit || Math.abs(it.dist - r.dist) > 0.75 || Math.abs(LANES[it.lane] - r.x) > 0.95) continue;
      if (it.kind === "block") {
        it.hit = true;
        r.stumble = 0.9;
        it.mesh.rotation.x = -1.2;
        it.mesh.position.y = 0.3;
        if (mine) o.onStumble();
      } else if (mine) {
        it.hit = true;
        it.mesh.visible = false;
        sparks++;
        o.onSparks(sparks);
        o.onSpark();
      }
    }
    if (r.dist >= LENGTH) { r.done = true; r.dist = LENGTH; if (!mine) r.group.visible = false; }
  };

  // A rival looks one row ahead and usually moves out of a blocked lane.
  const think = (r: Runner) => {
    const i = rows.findIndex((row) => row.dist > r.dist && row.dist - r.dist < 8);
    if (i < 0 || r.decided === i) return;
    r.decided = i;
    const row = rows[i];
    if (!row.blocked[r.lane] || Math.random() > 0.8) return;
    const free = [0, 1, 2].filter((l) => !row.blocked[l]).sort((a, b) => Math.abs(a - r.lane) - Math.abs(b - r.lane));
    if (free.length) r.lane = free[0];
  };

  const frame = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    step(me, dt, true);
    for (const r of rivals) { think(r); step(r, dt, false); swing(r, clock + 0.4); }
    swing(me, clock);
    for (const it of items) if (it.kind === "spark" && !it.hit) it.mesh.rotation.y = clock * 3;
    cam.position.set(me.x * 0.55, 4.4, -me.dist + 7.6);
    cam.lookAt(me.x * 0.35, 1.7, -me.dist - 9);
    renderer.render(scene, cam);
    const place = 1 + rivals.filter((r) => r.dist > me.dist || (r.done && !me.done)).length;
    o.onProgress(Math.min(1, me.dist / LENGTH), place);
    if (me.done && !arrived) {
      arrived = true;
      const ahead = 1 + rivals.filter((r) => r.done).length;
      window.setTimeout(() => { if (!stopped) o.onArrive({ place: ahead, sparks }); }, 700);
    }
  };
  raf = requestAnimationFrame(frame);

  return {
    steer: (dir) => { if (!me.done) me.lane = Math.max(0, Math.min(2, me.lane + dir)); },
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
