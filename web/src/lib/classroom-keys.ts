import crypto from "node:crypto";

/**
 * Cache keys of the four projector steps (picture, examples, class quiz and
 * game), in one pure file with no app imports so a script can check them
 * (Gemara phase A, 2026-10-15).
 *
 * Two families of keys:
 *   - word keys (every set today): from the word and its definition text.
 *     These are byte-for-byte the keys the app used before this file existed;
 *     classroom-image.ts, word-examples.ts and class-activity re-export them.
 *   - meaning keys (a unit with `items`, Gemara first): from a stable meaning
 *     id `m` and its content revision `rev`. Rewording a definition does not
 *     orphan approved content, raising `rev` regenerates it on purpose, and
 *     the global VERSION / img_cls2 namespace is NOT part of the key, so a
 *     future version bump never strands an approved meaning.
 *   `variant` is reserved for a future level of the same meaning (an easier
 *   or harder explanation and quiz) without copying the meaning itself; an
 *   empty variant gives the plain key.
 */

export type ClassroomStyle = "kids" | "teen";

/** Picture of a word in a set: imageCache/img_cls2_<style>_<lang>_<hash>. */
export function classroomImageKey(word: string, meaning: string, lang: string, style: ClassroomStyle): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${lang}|${word.trim().toLowerCase()}|${meaning.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 24);
  return `img_cls2_${style}_${lang}_${hash}`;
}

/** Example sentences: exampleCache/ex_<lang>_<hash>. */
export function exampleCacheKey(word: string, meaning: string, uiLang: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${uiLang}|${word.trim().toLowerCase()}|${meaning.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 24);
  return `ex_${uiLang}_${hash}`;
}

/** Class quiz + game: classActivity/<sha1>. `version` is class-activity's VERSION. */
export function classActivityKey(version: string, lang: string, setId: string, word: string, meaning: string): string {
  return crypto.createHash("sha1").update(`${version}|${lang}|${setId}|${word}|${meaning}`).digest("hex");
}

// ── Meaning keys ──────────────────────────────────────────────────────────

/** A meaning id: a short prefix, six digits, a sense number (gmt-000185-s2). */
export const MEANING_ID = /^[a-z]{2,8}-\d{6}-s\d{1,3}$/;
export const isMeaningId = (m: unknown): m is string => typeof m === "string" && MEANING_ID.test(m);

export type MeaningRef = { m: string; rev?: number };
const VARIANT = /^[a-z0-9]{1,16}$/;
function tail(ref: MeaningRef, variant?: string): string {
  if (!isMeaningId(ref.m)) throw new Error("bad_meaning_id");
  const rev = Number.isInteger(ref.rev) && (ref.rev as number) > 0 ? ref.rev : 1;
  const v = variant && VARIANT.test(variant) ? `_${variant}` : "";
  return `${ref.m}_r${rev}${v}`;
}

export function itemImageKey(ref: MeaningRef, lang: string, style: ClassroomStyle, variant?: string): string {
  return `img_m_${style}_${lang}_${tail(ref, variant)}`;
}
export function itemExampleKey(ref: MeaningRef, uiLang: string, variant?: string): string {
  return `ex_m_${uiLang}_${tail(ref, variant)}`;
}
/** Shared by every unit holding the meaning (no unit id), so one quiz per meaning. */
export function itemActivityKey(ref: MeaningRef, lang: string, variant?: string): string {
  return `act_m_${lang}_${tail(ref, variant)}`;
}
