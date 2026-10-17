import type { RankKey } from "./gamification";

/** The rank pictures (Gadi 2026-10-17): one series for the whole family, a
 *  tree growing out of an open book, seed to golden tree, on a wood, stone,
 *  silver or gold pedestal. 256px webp in public/ranks/<key>.webp. */
export function rankIconSrc(key: RankKey): string {
  return `/ranks/${key}.webp`;
}
