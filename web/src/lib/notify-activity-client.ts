import type { User } from "firebase/auth";

/**
 * Tell the server a child finished something (Gadi 2026-10-12: the parent
 * hears about everything the child finishes, instantly or in the daily
 * summary, as they chose). The server ignores grown-ups. Best-effort, and
 * `keepalive` so leaving the page right after does not drop it.
 */
export async function notifyActivity(
  user: User | null | undefined,
  body: { kind: "spell" | "say" | "pick" | "lesson" | "game" | "read"; label: string; score?: number; total?: number },
): Promise<void> {
  if (!user) return;
  try {
    const idToken = await user.getIdToken();
    await fetch("/api/family/notify-activity", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(body),
    });
  } catch { /* best-effort */ }
}
