/**
 * The worlds of the world game (Gadi 2026-10-30). One world is a stage for
 * the child's own words: the words change, the world is the scenery.
 *
 * Order Gadi approved: jungle first, then a home world for each skin set
 * (space station, magic castle, ninja village, stadium, magic forest, city
 * at night). A new world = a folder of art in public/worlds/<id>/ plus an
 * entry in WORLDS. Each world opens once the child has spelled UNLOCK_WORDS
 * words in the world before it.
 */

import type { WorldKey } from "./world-i18n";

/** Worlds whose art is built. */
export type WorldId = WorldKey;

export type WorldDef = {
  id: WorldId;
  /** Folder under /public/worlds. */
  dir: string;
  /** Things a star can hide behind, between the forks. */
  spots: string[];
  /** Funny characters behind a wrong door. */
  animals: string[];
  /** Ground colours of the path band (top, bottom) and its edge. */
  ground: [string, string];
  edge: [string, string];
  /** Colour behind the far layer while it loads. */
  sky: string;
  /** Words to finish before a new area of the world opens. */
  areaSize: number;
  /** Door art: width / height, the plaque's centre (from the top, %) and its letter colour. */
  doorAspect: number;
  plaqueY: number;
  /** Where the doors sit in gate.webp, in % of the image (2026-11-01: the gate
   *  opens and the child walks through). ratio = image height / width.
   *  arch = how tall the rounded top is, in % of the door box (0 = square).
   *  shape "round" = a round hatch whose halves slide apart instead of swinging. */
  gate: { ratio: number; x0: number; x1: number; y0: number; y1: number; arch: number; shape?: "round" };
  letterColor: string;
};

export const WORLDS: Record<WorldId, WorldDef> = {
  jungle: {
    id: "jungle",
    dir: "/worlds/jungle",
    spots: ["bush", "hut", "rock", "log"],
    animals: ["monkey", "parrot", "toucan", "frog", "sloth"],
    ground: ["#9b7a4c", "#6f5432"],
    edge: ["#5f9e3c", "#4a8530"],
    sky: "#bfe3d0",
    areaSize: 5,
    doorAspect: 300 / 401,
    plaqueY: 47,
    gate: { ratio: 0.9004, x0: 29.5, x1: 70.5, y0: 34, y1: 99, arch: 0 },
    letterColor: "#3b2a14",
  },
  space: {
    id: "space",
    dir: "/worlds/space",
    spots: ["crate", "dish", "moonrock", "capsule"],
    animals: ["alien", "robot", "octopus", "spacecat", "robodog"],
    ground: ["#8f88a8", "#5d5778"],
    edge: ["#b9b2d4", "#a49cc4"],
    sky: "#1d2350",
    areaSize: 5,
    doorAspect: 300 / 330,
    plaqueY: 46,
    gate: { ratio: 0.832, x0: 21, x1: 79, y0: 29, y1: 89, arch: 0, shape: "round" },
    letterColor: "#1d2350",
  },
  castle: {
    id: "castle",
    dir: "/worlds/castle",
    spots: ["chest", "cauldron", "books", "armor"],
    animals: ["owl", "dragon", "ghost", "toad", "broom"],
    ground: ["#6d5a8e", "#4a3c66"],
    edge: ["#8e7bb0", "#7a679c"],
    sky: "#3a2f63",
    areaSize: 5,
    doorAspect: 300 / 457,
    plaqueY: 55,
    gate: { ratio: 0.8906, x0: 26, x1: 74, y0: 39, y1: 99, arch: 14 },
    letterColor: "#4a2a00",
  },
  ninja: {
    id: "ninja",
    dir: "/worlds/ninja",
    spots: ["lantern", "barrel", "bamboo", "shrine"],
    animals: ["panda", "frog2", "fox", "crane", "koi"],
    ground: ["#c9b28a", "#9c8460"],
    edge: ["#7fb069", "#6a9b55"],
    sky: "#f6c9b5",
    areaSize: 5,
    doorAspect: 300 / 399,
    plaqueY: 50,
    gate: { ratio: 0.7295, x0: 27.5, x1: 72.5, y0: 40, y1: 92, arch: 0 },
    letterColor: "#5a3410",
  },
  stadium: {
    id: "stadium",
    dir: "/worlds/stadium",
    spots: ["ballbag", "cones", "locker", "trophy"],
    animals: ["mascot", "ball", "whistle", "kangaroo", "sneaker"],
    ground: ["#d9734e", "#b45a3a"],
    edge: ["#ffffff", "#5fb34a"],
    sky: "#9fd3f5",
    areaSize: 5,
    doorAspect: 300 / 504,
    plaqueY: 35,
    gate: { ratio: 0.8193, x0: 22, x1: 78, y0: 45, y1: 97, arch: 12 },
    letterColor: "#1d4ed8",
  },
  forest: {
    id: "forest",
    dir: "/worlds/forest",
    spots: ["mushroom", "stump", "flower", "nest"],
    animals: ["hedgehog", "bunny", "deer", "raccoon", "firefly"],
    ground: ["#5b4a3a", "#3e3228"],
    edge: ["#3f8f6a", "#2f7357"],
    sky: "#16384a",
    areaSize: 5,
    doorAspect: 300 / 402,
    plaqueY: 55,
    gate: { ratio: 0.8682, x0: 25, x1: 75, y0: 28, y1: 97, arch: 28 },
    letterColor: "#4a2a10",
  },
  city: {
    id: "city",
    dir: "/worlds/city",
    spots: ["trashcan", "mailbox", "boombox", "foodcart"],
    animals: ["pigeon", "cat2", "rat", "dog2", "raccoon2"],
    ground: ["#7d7f93", "#5a5c70"],
    edge: ["#9fa1b5", "#6c6e82"],
    sky: "#1a1b3d",
    areaSize: 5,
    doorAspect: 300 / 456,
    plaqueY: 71,
    gate: { ratio: 0.8828, x0: 22, x1: 78, y0: 32, y1: 92, arch: 30 },
    letterColor: "#7a1f5c",
  },
};

/** Every approved world in map order; the ones without art show "coming soon". */
export const WORLD_ORDER: WorldKey[] = ["jungle", "space", "castle", "ninja", "stadium", "forest", "city"];
export const WORLD_ICON: Record<WorldKey, string> = { jungle: "🌴", space: "🚀", castle: "🏰", ninja: "🏯", stadium: "🏟️", forest: "🌳", city: "🌃" };

/** Words spelled in the world before that open the next one. */
export const UNLOCK_WORDS = 5;

/** Bump when the art files change: the service worker caches images by URL forever. */
export const WORLD_ART_V = 3;

export function worldArt(w: WorldDef, name: string): string {
  return `${w.dir}/${name}.webp?v=${WORLD_ART_V}`;
}

export function isWorldId(x: unknown): x is WorldId {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(WORLDS, x);
}

/** How many more words open `key` (0 = open), from the words in each world. */
export function wordsToOpen(key: WorldKey, counts: Partial<Record<string, number>>): number {
  const i = WORLD_ORDER.indexOf(key);
  if (i <= 0) return 0;
  const prev = WORLD_ORDER[i - 1];
  if (wordsToOpen(prev, counts) > 0) return UNLOCK_WORDS;
  return Math.max(0, UNLOCK_WORDS - (counts[prev] ?? 0));
}
