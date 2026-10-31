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
export type WorldId = Extract<WorldKey, "jungle" | "space" | "castle">;

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
    letterColor: "#4a2a00",
  },
};

/** Every approved world in map order; the ones without art show "coming soon". */
export const WORLD_ORDER: WorldKey[] = ["jungle", "space", "castle", "ninja", "stadium", "forest", "city"];
export const WORLD_ICON: Record<WorldKey, string> = { jungle: "🌴", space: "🚀", castle: "🏰", ninja: "🏯", stadium: "🏟️", forest: "🌳", city: "🌃" };

/** Words spelled in the world before that open the next one. */
export const UNLOCK_WORDS = 5;

export function worldArt(w: WorldDef, name: string): string {
  return `${w.dir}/${name}.webp`;
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
