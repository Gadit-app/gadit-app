"use client";

/**
 * Whether the help assistant is on for this user right now (2026-11-16), so
 * other screens can offer it: the contact page, and the cancel flow's
 * "technical problem" step. HelpChat sets it; anyone reads it.
 */
import { useSyncExternalStore } from "react";
import type { HelpUi } from "./ui-base";

let current: HelpUi | null = null;
const subs = new Set<() => void>();

export function setHelpReady(ui: HelpUi | null): void {
  if (current === ui) return;
  current = ui;
  subs.forEach((f) => f());
}

/** The window's words when the assistant is available, else null. */
export function useHelpReady(): HelpUi | null {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => current,
    () => null,
  );
}

export function openHelp(): void {
  window.dispatchEvent(new Event("gadit:open-help"));
}
