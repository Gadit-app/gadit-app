"use client";

/**
 * Games report each answer here (Gadi 2026-10-11, learning mode). When the
 * kid is in learning mode, the play page installs a listener that batches
 * the answers to /api/learn; otherwise reporting does nothing. A game only
 * calls reportAnswer(word, ok): it never needs to know about the mode.
 */
type Listener = (word: string, ok: boolean) => void;
let listener: Listener | null = null;

export function setAnswerListener(fn: Listener | null) {
  listener = fn;
}

export function reportAnswer(word: string | undefined | null, ok: boolean) {
  if (!word || !listener) return;
  try { listener(word, ok); } catch { /* reporting never breaks a game */ }
}
