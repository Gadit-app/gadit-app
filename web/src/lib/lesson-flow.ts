"use client";

/**
 * A workbook lesson plays several games in a row (Gadi 2026-10-11, Ziv's
 * English unit). While one runs, its results screen offers "next step"
 * instead of "back to games", and no duel button. Set by LessonPath.
 */
let nextLabel: string | null = null;

export function setLessonNext(label: string | null) {
  nextLabel = label;
}

export function getLessonNext(): string | null {
  return nextLabel;
}
