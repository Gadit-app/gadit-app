/**
 * The 3D models of the journey (Gadi 2026-11-15: "the six models look good,
 * make them and turn them into 3D").
 *
 * Three monsters and three fortresses, one for each landscape (forest,
 * desert, ice). Each was made from a picture of our own (in the style of the
 * reference pictures Gadi chose, never from them) and turned into a model,
 * then shrunk: textures to 512px WebP and a compressed mesh, 80 to 190 KB a
 * file. Files: public/journey/models/{monster|fortress}{1|2|3}.glb.
 *
 * A model is loaded once and copied for every use. When it cannot load (no
 * network, an old device), the caller keeps the shapes built in code.
 */
import type * as THREE from "three";

type T3 = typeof THREE;
export type ModelName = `monster${1 | 2 | 3}` | `fortress${1 | 2 | 3}`;

const cache = new Map<string, Promise<THREE.Object3D>>();

async function loadRaw(name: ModelName): Promise<THREE.Object3D> {
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/libs/meshopt_decoder.module.js"),
  ]);
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(`/journey/models/${name}.glb`);
  return gltf.scene;
}

/**
 * A copy of the model, facing the camera (+z), standing on y = 0, centred on
 * x and z, and scaled so that its height is `height` (or its width is
 * `width`, when given). Shadows on.
 */
export async function loadModel(T: T3, name: ModelName, size: { height?: number; width?: number }): Promise<THREE.Group> {
  let p = cache.get(name);
  if (!p) { p = loadRaw(name); cache.set(name, p); p.catch(() => cache.delete(name)); }
  const raw = await p;
  const inner = raw.clone(true);
  // The models are made facing +x; turn them to face the camera.
  inner.rotation.y = -Math.PI / 2;
  inner.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  const holder = new T.Group();
  holder.add(inner);
  const box = new T.Box3().setFromObject(holder);
  const dims = box.getSize(new T.Vector3());
  const s = size.width ? size.width / Math.max(0.001, dims.x) : (size.height ?? 1) / Math.max(0.001, dims.y);
  const c = box.getCenter(new T.Vector3());
  inner.position.set(-c.x, -box.min.y, -c.z);
  const out = new T.Group();
  holder.scale.setScalar(s);
  out.add(holder);
  return out;
}

/** The depth of a model as it stands (for placing its front). */
export function depthOf(T: T3, g: THREE.Object3D): number {
  return new T.Box3().setFromObject(g).getSize(new T.Vector3()).z;
}
