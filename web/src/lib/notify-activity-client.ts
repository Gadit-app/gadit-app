import type { User } from "firebase/auth";
import { toLocalDateStr } from "@/lib/gamification";

/**
 * Tell the server a child finished something (Gadi 2026-10-12: the parent
 * hears about everything the child finishes, instantly or in the daily
 * summary, as they chose). The server ignores grown-ups. Best-effort, and
 * `keepalive` so leaving the page right after does not drop it.
 *
 * Every call is also a completed practice for the rank (10 points, at most 10
 * a day, counted on the server). Resolves to whether this one counted.
 */
export async function notifyActivity(
  user: User | null | undefined,
  body: { kind: "spell" | "say" | "pick" | "lesson" | "game" | "read"; label: string; score?: number; total?: number },
): Promise<{ counted: boolean }> {
  if (!user) return { counted: false };
  try {
    const idToken = await user.getIdToken();
    const r = await fetch("/api/family/notify-activity", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ ...body, day: toLocalDateStr(new Date().toISOString()) }),
    });
    forgetRank();
    const j = (await r.json().catch(() => null)) as { practice?: { counted?: boolean } } | null;
    return { counted: j?.practice?.counted === true };
  } catch { return { counted: false }; }
}

/** Drop the cached rank (see lib/use-rank-state) so the next surface refetches
 *  the points after a practice. */
export function forgetRank(): void {
  try {
    sessionStorage.removeItem("gadit-rank-state");
    sessionStorage.removeItem("gadit-kid-rankindex");
  } catch { /* storage blocked */ }
}
