/**
 * Practice days (Gadi 2026-10-12: one streak, "days practised"). A day counts
 * when the child looked up a new word (the notebook's addedAt) OR finished a
 * game, lesson, dictation, "listen and pick", reading or "say it". The second
 * kind is stored here, as local YYYY-MM-DD strings on users/{uid}.practiceDays.
 */
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** The client's local day if it is sane (within a day of the server's), else
 *  the server's UTC day. */
export function practiceDayFrom(clientDay: unknown, now = Date.now()): string {
  const server = new Date(now).toISOString().slice(0, 10);
  if (typeof clientDay !== "string" || !DAY_RE.test(clientDay)) return server;
  const diff = Math.abs(Date.parse(`${clientDay}T12:00:00Z`) - Date.parse(`${server}T12:00:00Z`));
  return diff <= 86_400_000 ? clientDay : server;
}

export async function recordPracticeDay(uid: string, day: string): Promise<void> {
  await getAdminDb().collection("users").doc(uid).set({ practiceDays: FieldValue.arrayUnion(day) }, { merge: true });
}

export async function readPracticeDays(uid: string): Promise<string[]> {
  const v = (await getAdminDb().collection("users").doc(uid).get()).get("practiceDays");
  return Array.isArray(v) ? v.filter((d): d is string => typeof d === "string" && DAY_RE.test(d)) : [];
}
