/**
 * The run to the fortress: the 3D part (Gadi 2026-11-14).
 *
 * A blocky character always runs forward on a three-lane path; the child
 * steers it left and right and can jump. Sparks on the path are for the race,
 * a block on the path makes the runner stumble for a moment. Nothing is ever
 * taken away and there is no clock. The path ends at the gate of a fortress:
 * the gate rises and the runner goes in.
 *
 * The look is our own: plain boxes, soft colours, three landscapes.
 */

import type * as THREE from "three";

export type Theme = {
  skyTop: string; sky: string; haze: number; ground: number; hill: number; path: number; curb: number; block: number;
  fort: number; fortDark: number; roof: number; flag: number; dots: number[]; prop: "tree" | "cactus" | "ice";
};
export const THEMES: Theme[] = [
  { skyTop: "#4aa8f0", sky: "#cfefff", haze: 0xcfefff, ground: 0x6fbf5c, hill: 0x4f9f4a, path: 0xe6cf95, curb: 0xb89a5e, block: 0x8a5a2b, fort: 0xa3adb8, fortDark: 0x7d8a99, roof: 0xd9534f, flag: 0xffc928, dots: [0xffffff, 0xff8fb1, 0xffd84a], prop: "tree" },
  { skyTop: "#f29b4b", sky: "#ffe9c2", haze: 0xffe9c2, ground: 0xe6bd74, hill: 0xcf9d55, path: 0xf7e9c6, curb: 0xc79a5b, block: 0xb5651d, fort: 0xc98d5a, fortDark: 0xa56e41, roof: 0x6b3fa0, flag: 0x14b8a6, dots: [0xd98b4a, 0xc0503a, 0x8f6a3a], prop: "cactus" },
  { skyTop: "#5c9fe0", sky: "#e4f6ff", haze: 0xe4f6ff, ground: 0xf4fbff, hill: 0xcfe6f5, path: 0xbfe3f5, curb: 0x8fc3e0, block: 0x7fc4e8, fort: 0x8fb7d9, fortDark: 0x6f97bd, roof: 0x2f6fb0, flag: 0xff6b6b, dots: [0xffffff, 0xcfeeff, 0xa8d8f0], prop: "ice" },
];

export type Rival = { name: string; shirt: number };
export type RunOptions = {
  theme: number;
  rivals: Rival[];
  onSparks: (n: number) => void;
  onProgress: (part: number, place: number) => void;
  onSpark: () => void;
  onStumble: () => void;
  /** The runner reached the gate and the gate starts to rise. */
  onGate: () => void;
  /** The runner is inside. `place` is 1 when nobody was ahead. */
  onArrive: (r: { place: number; sparks: number }) => void;
};
export type RunHandle = { steer: (dir: -1 | 1) => void; jump: () => void; dispose: () => void };

const LANES = [-2.2, 0, 2.2];
const LENGTH = 300;
const ROW_GAP = 9;

type Runner = { group: THREE.Group; arms: THREE.Group[]; legs: THREE.Group[]; lane: number; x: number; dist: number; pace: number; stumble: number; done: boolean; decided: number; up: number; vy: number };
type Item = { mesh: THREE.Object3D; lane: number; dist: number; kind: "block" | "spark"; hit: boolean };

export async function startRun(canvas: HTMLCanvasElement, o: RunOptions): Promise<RunHandle> {
  const T = await import("three");
  const th = THEMES[o.theme % THEMES.length];
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  // The sky is a soft gradient behind the picture.
  canvas.style.background = `linear-gradient(${th.skyTop} 0%, ${th.sky} 58%)`;
  const scene = new T.Scene();
  scene.fog = new T.Fog(th.haze, 50, 150);
  const cam = new T.PerspectiveCamera(62, 1, 0.1, 260);
  scene.add(new T.HemisphereLight(0xffffff, th.ground, 1.15));
  const sun = new T.DirectionalLight(0xfff4d6, 1.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera;
  sc.left = -24; sc.right = 24; sc.top = 30; sc.bottom = -30; sc.near = 1; sc.far = 80;
  scene.add(sun, sun.target);

  const lambert = (color: number) => new T.MeshLambertMaterial({ color });
  const box = (w: number, h: number, d: number, color: number) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), lambert(color)); m.castShadow = true; return m; };
  const cone = (r: number, h: number, seg: number, color: number) => { const m = new T.Mesh(new T.ConeGeometry(r, h, seg), lambert(color)); m.castShadow = true; return m; };
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const pick = <X,>(a: X[]): X => a[Math.floor(Math.random() * a.length)];

  // The land, the path with its two curbs and its lane marks.
  const land = box(240, 1, LENGTH + 220, th.ground);
  land.position.set(0, -0.5, -LENGTH / 2);
  land.castShadow = false; land.receiveShadow = true;
  scene.add(land);
  const path = box(7, 0.1, LENGTH + 60, th.path);
  path.position.set(0, 0.05, -LENGTH / 2);
  path.castShadow = false; path.receiveShadow = true;
  scene.add(path);
  for (const x of [-3.7, 3.7]) { const c = box(0.45, 0.32, LENGTH + 60, th.curb); c.position.set(x, 0.16, -LENGTH / 2); c.receiveShadow = true; scene.add(c); }
  {
    const marks = new T.InstancedMesh(new T.BoxGeometry(0.14, 0.02, 1.6), new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }), 2 * Math.ceil((LENGTH + 40) / 4));
    const m4 = new T.Matrix4();
    let i = 0;
    for (let d = -10; d < LENGTH + 30; d += 4) for (const x of [-1.1, 1.1]) marks.setMatrixAt(i++, m4.makeTranslation(x, 0.115, -d));
    marks.count = i;
    scene.add(marks);
  }

  // Small things on the ground: flowers, pebbles or snow bumps.
  {
    const n = 420;
    const dots = new T.InstancedMesh(new T.IcosahedronGeometry(0.22, 0), new T.MeshLambertMaterial({ color: 0xffffff }), n);
    const m4 = new T.Matrix4(), col = new T.Color();
    for (let i = 0; i < n; i++) {
      const s = rnd(0.6, 1.6);
      m4.makeScale(s, s * 0.8, s).setPosition((Math.random() < 0.5 ? -1 : 1) * rnd(4.6, 26), 0.12, -rnd(-10, LENGTH + 30));
      dots.setMatrixAt(i, m4);
      dots.setColorAt(i, col.setHex(pick(th.dots)));
    }
    scene.add(dots);
  }

  // Far hills and clouds.
  for (let d = -20; d < LENGTH + 120; d += 26) {
    for (const side of [-1, 1]) {
      const r = rnd(16, 30);
      const hill = new T.Mesh(new T.SphereGeometry(r, 14, 10), lambert(th.hill));
      hill.scale.y = rnd(0.35, 0.6);
      hill.position.set(side * rnd(48, 90), -2, -d + rnd(-8, 8));
      scene.add(hill);
    }
  }
  const cloudMat = new T.MeshLambertMaterial({ color: 0xffffff, fog: false });
  for (let i = 0; i < 16; i++) {
    const g = new T.Group();
    for (let k = 0; k < 4; k++) {
      const puff = new T.Mesh(new T.SphereGeometry(rnd(2.2, 4), 10, 8), cloudMat);
      puff.position.set(k * 3.2 - 5, rnd(-0.6, 0.8), rnd(-1, 1));
      puff.scale.y = 0.6;
      g.add(puff);
    }
    g.position.set(rnd(-90, 90), rnd(26, 44), -rnd(0, LENGTH + 120));
    scene.add(g);
  }

  // Things beside the path.
  const prop = (): THREE.Group => {
    const g = new T.Group();
    if (th.prop === "tree") {
      const trunk = new T.Mesh(new T.CylinderGeometry(0.28, 0.4, 1.8, 7), lambert(0x8a5a2b));
      trunk.position.y = 0.9; trunk.castShadow = true;
      g.add(trunk);
      const greens = [0x2f8f4e, 0x38a35a, 0x46b868];
      [[1.7, 2.2, 2.3], [1.35, 2.0, 3.5], [0.95, 1.8, 4.6]].forEach(([r, h, y], i) => { const c = cone(r, h, 8, greens[i]); c.position.y = y; g.add(c); });
    } else if (th.prop === "cactus") {
      const green = 0x3f9b5b;
      const body = box(0.8, 2.8, 0.8, green); body.position.y = 1.4;
      const arm = box(0.9, 0.42, 0.42, green); arm.position.set(0.75, 1.5, 0);
      const armUp = box(0.42, 1.0, 0.42, green); armUp.position.set(1.0, 2.0, 0);
      const arm2 = box(0.8, 0.42, 0.42, green); arm2.position.set(-0.7, 1.1, 0);
      const arm2Up = box(0.42, 0.8, 0.42, green); arm2Up.position.set(-0.9, 1.5, 0);
      const bloom = box(0.36, 0.26, 0.36, 0xff6b9a); bloom.position.y = 2.93;
      g.add(body, arm, armUp, arm2, arm2Up, bloom);
      if (Math.random() < 0.4) { const rock = new T.Mesh(new T.IcosahedronGeometry(0.8, 0), lambert(0xb08a5e)); rock.position.set(1.8, 0.4, 0.6); rock.castShadow = true; g.add(rock); }
    } else {
      const a = cone(1.5, 3.8, 6, 0xdff2fb); a.position.y = 1.9;
      const cap = cone(0.75, 1.9, 6, 0xffffff); cap.position.y = 2.86;
      const b = cone(0.9, 2.2, 6, 0xcfe9f7); b.position.set(1.4, 1.1, 0.4);
      g.add(a, cap, b);
    }
    const s = rnd(0.8, 1.5);
    g.scale.set(s, s, s);
    g.rotation.y = rnd(0, 6);
    return g;
  };
  for (let d = -10; d < LENGTH + 30; d += 4.5) {
    for (const side of [-1, 1]) {
      if (Math.random() < 0.2) continue;
      const p = prop();
      p.position.set(side * rnd(8, 30), 0, -d + rnd(-2, 2));
      scene.add(p);
    }
  }

  // The fortress at the end of the path.
  const fort = new T.Group();
  for (const x of [-6.2, 6.2]) { const w = box(8.2, 8, 4, th.fort); w.position.set(x, 4, -3); w.receiveShadow = true; fort.add(w); }
  const lintel = box(4.2, 2.6, 4, th.fort); lintel.position.set(0, 6.7, -3);
  const hall = box(4.2, 5.4, 0.4, 0x1b1410); hall.position.set(0, 2.7, -4.6);
  const gate = box(4.2, 5.4, 0.5, 0x5a3b22); gate.position.set(0, 2.7, -1.2);
  for (const x of [-1.4, 0, 1.4]) { const bar = box(0.22, 5.4, 0.12, 0x2d2d33); bar.position.set(x, 0, 0.3); gate.add(bar); }
  fort.add(lintel, hall, gate);
  for (const x of [-10.5, 10.5]) {
    const tower = new T.Mesh(new T.CylinderGeometry(2.4, 2.7, 13, 12), lambert(th.fortDark));
    tower.position.set(x, 6.5, -3); tower.castShadow = true;
    const roof = cone(3.2, 4.4, 12, th.roof); roof.position.set(x, 15.2, -3);
    const pole = box(0.14, 2.6, 0.14, 0x3a2a1c); pole.position.set(x, 18.6, -3);
    const flag = box(1.5, 0.9, 0.08, th.flag); flag.position.set(x + 0.8, 19.3, -3);
    const win = box(0.8, 1.5, 0.3, 0x1b1410); win.position.set(x, 9, -0.45);
    fort.add(tower, roof, pole, flag, win);
  }
  for (let x = -9; x <= 9; x += 2) { const m = box(1.1, 1.1, 4, th.fortDark); m.position.set(x, 8.55, -3); fort.add(m); }
  for (const x of [-5.5, 5.5]) { const banner = box(1.6, 3.4, 0.12, th.roof); banner.position.set(x, 4.6, -0.9); fort.add(banner); }
  fort.position.set(0, 0, -(LENGTH + 6));
  scene.add(fort);

  // A runner made of boxes: head, body, a pack, two arms and two legs that swing.
  const makeRunner = (shirt: number, pants: number, hat: number): Runner => {
    const g = new T.Group();
    const body = box(0.95, 1.05, 0.5, shirt); body.position.y = 1.5;
    const pack = box(0.62, 0.7, 0.26, hat); pack.position.set(0, 1.56, 0.36);
    const head = box(0.62, 0.62, 0.62, 0xf2c79a); head.position.y = 2.36;
    const cap = box(0.68, 0.2, 0.68, hat); cap.position.y = 2.76;
    const peak = box(0.5, 0.08, 0.3, hat); peak.position.set(0, 2.68, -0.46);
    g.add(body, pack, head, cap, peak);
    const limb = (x: number, y: number, len: number, color: number, tip: number) => {
      const pivot = new T.Group();
      pivot.position.set(x, y, 0);
      const m = box(0.3, len, 0.3, color);
      m.position.y = -len / 2;
      const end = box(0.32, 0.2, 0.34, tip);
      end.position.y = -len + 0.1;
      pivot.add(m, end);
      g.add(pivot);
      return pivot;
    };
    const arms = [limb(-0.64, 2.0, 0.95, shirt, 0xf2c79a), limb(0.64, 2.0, 0.95, shirt, 0xf2c79a)];
    const legs = [limb(-0.25, 0.98, 0.98, pants, 0xffffff), limb(0.25, 0.98, 0.98, pants, 0xffffff)];
    scene.add(g);
    return { group: g, arms, legs, lane: 1, x: 0, dist: 0, pace: 1, stumble: 0, done: false, decided: -1, up: 0, vy: 0 };
  };
  const me = makeRunner(0x0a7472, 0x24415c, 0xf5a400);
  const rivals: Runner[] = o.rivals.map((r, i) => {
    const k = makeRunner(r.shirt, 0x3b3b4f, 0xffffff);
    k.lane = i % 2 === 0 ? 0 : 2;
    k.x = LANES[k.lane];
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
    tag.position.y = 3.6;
    k.group.add(tag);
    return k;
  });

  // The course: every few steps a row with blocks in some lanes and sparks in a free one.
  const items: Item[] = [];
  const rows: Array<{ dist: number; blocked: boolean[] }> = [];
  const sparkGeo = new T.OctahedronGeometry(0.36);
  const sparkMat = new T.MeshLambertMaterial({ color: 0xffc928, emissive: 0xb37400 });
  for (let d = 34; d < LENGTH - 24; d += ROW_GAP) {
    const blocked = [false, false, false];
    const roll = Math.random();
    const n = roll < 0.15 ? 0 : roll < 0.75 ? 1 : 2;
    while (blocked.filter(Boolean).length < n) blocked[Math.floor(Math.random() * 3)] = true;
    rows.push({ dist: d, blocked });
    blocked.forEach((b, lane) => {
      if (!b) return;
      const m = new T.Group();
      const crate = box(1.7, 1.1, 1.0, th.block);
      const band = box(1.76, 0.2, 1.06, 0x2d2d33);
      m.add(crate, band);
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
  let entering = -1;
  let placeAtGate = 1;
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

  const swing = (r: Runner, t: number, still: boolean) => {
    const a = still ? 0 : Math.sin(t * 11) * (r.stumble > 0 ? 0.35 : r.up > 0 ? 0.5 : 0.95);
    r.arms[0].rotation.x = a; r.arms[1].rotation.x = -a;
    r.legs[0].rotation.x = -a; r.legs[1].rotation.x = a;
    r.group.position.set(r.x, still ? 0 : r.up + (r.up > 0 ? 0 : Math.abs(Math.sin(t * 11)) * 0.12), -r.dist);
    r.group.rotation.z = r.stumble > 0 ? Math.sin(t * 30) * 0.12 : (LANES[r.lane] - r.x) * -0.08;
  };

  const step = (r: Runner, dt: number, mine: boolean) => {
    if (r.done) return;
    if (r.stumble > 0) r.stumble -= dt;
    const speed = (13 + 4 * Math.min(1, r.dist / LENGTH)) * r.pace * (r.stumble > 0 ? 0.35 : 1);
    r.dist += speed * dt;
    r.x += (LANES[r.lane] - r.x) * Math.min(1, dt * 12);
    // A jump: up and down again, high enough to clear a block.
    if (r.vy !== 0 || r.up > 0) { r.up += r.vy * dt; r.vy -= 30 * dt; if (r.up <= 0) { r.up = 0; r.vy = 0; } }
    for (const it of items) {
      if (it.hit || Math.abs(it.dist - r.dist) > 0.75 || Math.abs(LANES[it.lane] - r.x) > 0.95) continue;
      if (it.kind === "block") {
        if (r.up > 0.75) continue;
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
    if (r.dist >= LENGTH) { r.done = true; r.dist = LENGTH; r.up = 0; r.stumble = 0; if (!mine) r.group.visible = false; }
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
    for (const r of rivals) { think(r); step(r, dt, false); swing(r, clock + 0.4, r.done); }
    if (me.done && entering < 0) {
      entering = 0;
      placeAtGate = 1 + rivals.filter((r) => r.done).length;
      me.lane = 1;
      o.onGate();
    }
    if (entering >= 0) {
      // The gate rises and the runner goes in through the middle.
      entering += dt;
      gate.position.y = Math.min(8.4, 2.7 + entering * 7);
      me.x += (0 - me.x) * Math.min(1, dt * 8);
      if (entering > 0.35) me.dist += 9 * dt;
      if (entering > 1.5 && !arrived) { arrived = true; o.onArrive({ place: placeAtGate, sparks }); }
    }
    swing(me, clock, false);
    for (const it of items) if (it.kind === "spark" && !it.hit) { it.mesh.rotation.y = clock * 3; it.mesh.position.y = 1.2 + Math.sin(clock * 4 + it.dist) * 0.12; }
    const camDist = Math.min(me.dist, LENGTH + 1);
    cam.position.set(me.x * 0.55, 4.4, -camDist + 7.6);
    cam.lookAt(me.x * 0.35, 1.7, -camDist - 9);
    sun.position.set(me.x + 9, 22, -me.dist + 4);
    sun.target.position.set(me.x, 0, -me.dist - 10);
    renderer.render(scene, cam);
    const place = 1 + rivals.filter((r) => r.dist > me.dist || (r.done && !me.done)).length;
    o.onProgress(Math.min(1, me.dist / LENGTH), entering >= 0 ? placeAtGate : place);
  };
  raf = requestAnimationFrame(frame);

  return {
    steer: (dir) => { if (!me.done) me.lane = Math.max(0, Math.min(2, me.lane + dir)); },
    jump: () => { if (!me.done && me.up === 0 && me.stumble <= 0) me.vy = 10.5; },
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
