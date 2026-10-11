"use client";

/**
 * "Play this against someone" on a game's results screen (Gadi 2026-10-11:
 * the chip on every game card hid the pictures). The play page sets the
 * launcher while a duel-able game runs; GameResult shows the button when
 * one is set. Games themselves never need to know about Word Duel.
 */
type Launcher = { label: string; launch: () => void } | null;
let current: Launcher = null;

export function setDuelLauncher(l: Launcher) {
  current = l;
}

export function getDuelLauncher(): Launcher {
  return current;
}
