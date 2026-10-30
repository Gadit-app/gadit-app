/**
 * Avatar skins ("looks") a child unlocks by completed practice (Gadi
 * 2026-10-30). Ranks count words; practice opens skins. Every skin is one
 * full head-and-shoulders portrait at /avatars/<id>.webp, so it shows
 * wherever the member avatar already shows (profile switcher, user menu,
 * family leaderboard, Word Duel).
 *
 * Rules (from the skins research, 2026-10-30): no purchase, no randomness,
 * no timers, a skin once unlocked is never taken away, and every locked skin
 * says exactly how many practices it needs. The 12 KID_AVATARS stay free.
 *
 * Pure module: safe on the server (/api/kids/skin checks the unlock) and in
 * the browser (the picker).
 */

export type LookSet = "space" | "magic" | "street" | "ninja" | "sport" | "hoodie";
export type LookTier = 1 | 2 | 3 | 4; // 4 = the rare "gold" look of a set

export type LookDef = {
  id: string;
  set: LookSet;
  tier: LookTier;
  /** Completed practices (countedPractices) needed to unlock. */
  unlockAt: number;
  emoji: string;
};

/** Set order on screen. */
export const LOOK_SETS: LookSet[] = ["space", "magic", "street", "ninja", "sport", "hoodie"];

/** Unlock ladder: the first look of each set comes fast (first week), then
 *  the gaps grow; the gold look of each set is the long-term chase. */
const LADDER: Record<LookTier, number[]> = {
  1: [1, 2, 3, 5, 8, 12],
  2: [16, 20, 25, 30, 35, 40],
  3: [50, 60, 70, 80, 95, 110],
  4: [130, 150, 175, 200, 250, 300],
};

const SET_EMOJI: Record<LookSet, string> = {
  space: "🚀", magic: "🪄", street: "🎧", ninja: "🥷", sport: "⚽", hoodie: "🦊",
};

export const LOOKS: LookDef[] = ([1, 2, 3, 4] as LookTier[]).flatMap((tier) =>
  LOOK_SETS.map((set, i) => ({
    id: `look-${set}-${tier}`,
    set,
    tier,
    unlockAt: LADDER[tier][i],
    emoji: SET_EMOJI[set],
  })),
).sort((a, b) => a.unlockAt - b.unlockAt);

const BY_ID = new Map(LOOKS.map((l) => [l.id, l]));

export function lookById(id: unknown): LookDef | null {
  return typeof id === "string" ? BY_ID.get(id) ?? null : null;
}

export function isLookUnlocked(look: LookDef, practices: number): boolean {
  return Math.max(0, practices) >= look.unlockAt;
}

/** The next locked look and how many practices are still missing. */
export function nextLook(practices: number): { look: LookDef; missing: number } | null {
  const l = LOOKS.find((x) => !isLookUnlocked(x, practices));
  return l ? { look: l, missing: l.unlockAt - Math.max(0, practices) } : null;
}

export function unlockedCount(practices: number): number {
  return LOOKS.filter((l) => isLookUnlocked(l, practices)).length;
}
