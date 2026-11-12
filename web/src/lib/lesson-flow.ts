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

/** Inside a lesson, "Play again" restarts only the current step: the games' own
 *  replay reloads the page, which threw the child back to step 1 of the lesson. */
let replayStep: (() => void) | null = null;
export function setLessonReplay(fn: (() => void) | null) { replayStep = fn; }
export function getLessonReplay(): (() => void) | null { return replayStep; }
