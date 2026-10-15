/**
 * Local test mode (Gemara phase A, 2026-10-15): run the projector steps with
 * no OpenAI call and no cache write. On only when ALL hold:
 *   - not a production build (NODE_ENV !== "production"),
 *   - GADIT_DEV_DRY_AI=1,
 *   - the server talks to the Firestore emulator (FIRESTORE_EMULATOR_HOST),
 * so it can never switch on in a deployed app or against live data.
 */
export function devDryAi(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.GADIT_DEV_DRY_AI === "1" && !!process.env.FIRESTORE_EMULATOR_HOST;
}

/** Placeholder content returned in test mode instead of a generated one. */
export const DRY_IMAGE_URL = "/icons/photo.webp";
export const dryExamples = (word: string) => [`[dry] ${word} 1`, `[dry] ${word} 2`, `[dry] ${word} 3`];
export const dryActivity = (word: string) => ({
  quiz: [0, 1, 2].map((i) => ({ q: `[dry] ${word} ${i + 1}?`, options: ["a", "b", "c", "d"], answer: 0, explain: "[dry]" })),
  game: [true, false, true, false, true].map((t, i) => ({ s: `[dry] ${word} ${i + 1}`, t, explain: "[dry]" })),
});
