"use client";

/**
 * Native content for the curated games in the 29 languages beyond
 * he/en/ar/ru (Gadi 2026-10-11: every question in the player's own
 * language). The rounds ship as /play-content/<lang>/<game>.json and are
 * registered into each game's table before the game starts, so the pick
 * functions stay synchronous and the four built-in languages cost nothing.
 */
import { registerBuildAWordRounds } from "./build-a-word";
import { registerEtymologyArtistRounds } from "./etymology-artist";
import { registerIdiomDecoderRounds } from "./idiom-decoder";
import { registerMeaningLensRounds } from "./meaning-lens";
import { registerRootRushRounds } from "./root-rush";
import { registerShadeSliderRounds } from "./shade-slider";
import { registerTimeTravelerRounds } from "./time-traveler";
import { registerTwinTrapRounds } from "./twin-trap";
import { registerWordPassportRounds, registerPassportLabels } from "./word-passport";
import { registerFalseFriendsRounds } from "./false-friends";

const BUILT_IN = new Set(["en", "he", "ar", "ru"]);

/* eslint-disable @typescript-eslint/no-explicit-any */
const REGISTER: Record<string, (lang: string, f: { rounds: any[]; kids?: any[]; labels?: Record<string, string> }) => void> = {
  "build-a-word": (l, f) => registerBuildAWordRounds(l, f.rounds),
  "etymology-artist": (l, f) => registerEtymologyArtistRounds(l, f.rounds, f.kids),
  "idiom-decoder": (l, f) => registerIdiomDecoderRounds(l, f.rounds, f.kids),
  "meaning-lens": (l, f) => registerMeaningLensRounds(l, f.rounds, f.kids),
  "root-rush": (l, f) => registerRootRushRounds(l, f.rounds),
  "shade-slider": (l, f) => registerShadeSliderRounds(l, f.rounds),
  "time-traveler": (l, f) => registerTimeTravelerRounds(l, f.rounds),
  "twin-trap": (l, f) => registerTwinTrapRounds(l, f.rounds, f.kids),
  "word-passport": (l, f) => { registerWordPassportRounds(l, f.rounds); if (f.labels) registerPassportLabels(l, f.labels); },
  "false-friends": (l, f) => registerFalseFriendsRounds(l, f.rounds),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const loaded = new Map<string, Promise<void>>();

/** Load and register every game's content for `lang` (once per visit). A
 *  missing file leaves that game on English content. */
export function ensurePlayContent(lang: string): Promise<void> {
  if (BUILT_IN.has(lang)) return Promise.resolve();
  let p = loaded.get(lang);
  if (!p) {
    p = Promise.all(
      Object.entries(REGISTER).map(async ([game, register]) => {
        try {
          const res = await fetch(`/play-content/${lang}/${game}.json`);
          if (!res.ok) return;
          register(lang, await res.json());
        } catch { /* stays on English */ }
      }),
    ).then(() => undefined);
    loaded.set(lang, p);
  }
  return p;
}
