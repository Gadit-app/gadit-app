import "server-only";
import { getAdminDb } from "./firebase-admin";

/**
 * Deletion audit log. Every account removal — whether the user deleted
 * their OWN account (/api/account/delete) or an admin removed it
 * (/api/admin/delete-user) — writes one row to the `deletionLog`
 * collection, so "who/what deleted this account and when" is never a
 * mystery again (Gadi 2026-08-03, after corinne/shannon self-deleted and
 * it looked like accounts had vanished). Non-blocking: a logging failure
 * must never break the deletion itself.
 */

export type DeletionSource = "self" | "admin";

export interface DeletionLogEntry {
  uid: string;
  email: string | null;
  source: DeletionSource;
  plan?: string | null;
  subscriptionStatus?: string | null;
  isFamily?: boolean;
  isSchool?: boolean;
  canceledSubs?: number; // live subs canceled as part of the deletion
  // Exit survey (Gadi 2026-08-13): the reason the user picked + any free
  // text they left, so churn feedback is captured at the moment of leaving.
  reason?: string | null;
  comment?: string | null;
  at: string; // ISO timestamp
}

export async function logDeletion(entry: Omit<DeletionLogEntry, "at">): Promise<void> {
  try {
    await getAdminDb()
      .collection("deletionLog")
      .add({ ...entry, at: new Date().toISOString() });
  } catch (e) {
    console.warn("[deletion-log] write failed (non-blocking):", e);
  }
}
