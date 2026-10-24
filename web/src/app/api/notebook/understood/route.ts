import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { getRankState } from "@/lib/rank-points";
import { creditYoonizLearning } from "@/lib/yooniz-learning";

/**
 * Mark a notebook word as UNDERSTOOD (kids gamification v2, LLM council
 * 2026-08). Called by the quiz / word-game success handlers when the child
 * answers correctly on the CURRENT word. Fires ONCE per word (understoodAt is
 * set the first time).
 *
 * Since 2026-10-21 (Gadi) an understood word earns NO rank points: the rank
 * counts new words and completed practices (lib/rank-points.ts), and the
 * finished quiz/game itself is the practice. `points` in the answer is that
 * same server rank total, so it never contradicts what the rank shows.
 *
 *   POST { word, language, source?: "quiz" | "game" | "self" }
 *   "self" = the reader tapped "Gad it" on the word page (Gadi 2026-10-24: no
 *   question any more, the tap itself says "I understood").
 *   Auth: Firebase ID token (Bearer). Paid plans only (Family kids = deep).
 *   → { understood, awarded: 0, points } | { alreadyUnderstood, points } | { skipped }
 */
export const maxDuration = 20;

function makeWordId(language: string, word: string): string {
  const safe = `${language}_${word}`
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}_]/gu, "");
  return safe.slice(0, 200) || "untitled";
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (userInfo.plan !== "clear" && userInfo.plan !== "deep") {
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  let word = "", language = "", source = "quiz";
  try {
    const b = (await req.json()) as { word?: string; language?: string; source?: string };
    word = (b.word ?? "").trim();
    language = (b.language ?? "").trim();
    if (b.source === "game" || b.source === "quiz" || b.source === "self") source = b.source;
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!word || !language) return NextResponse.json({ error: "word_and_language_required" }, { status: 400 });

  const db = getAdminDb();
  const uid = userInfo.userId;
  const wordId = makeWordId(language, word);
  const wordRef = db.collection("users").doc(uid).collection("notebook").doc(wordId);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(wordRef);
      // The word must already be in the notebook (games/quizzes run on saved
      // words). If it isn't, do nothing rather than invent an entry.
      if (!snap.exists) return { status: "skipped" as const };
      if (snap.data()?.understood === true) return { status: "already" as const };
      const now = new Date().toISOString();
      tx.update(wordRef, { understood: true, understoodAt: now });
      return { status: "awarded" as const, now };
    });

    if (result.status === "skipped") return NextResponse.json({ skipped: "not_in_notebook" });

    // The rank points total, from the one server helper every surface uses.
    const points = await getRankState(uid).then((r) => r.points).catch(() => null);

    if (result.status === "already") return NextResponse.json({ alreadyUnderstood: true, points });

    // Append-only ledger entry (audit trail + future "word world" feed).
    await db.collection("users").doc(uid).collection("ledger").add({
      delta: 0, // no rank points since 2026-10-21
      reason: "understood",
      source,
      word,
      language,
      ts: result.now,
    });

    // Direction B of the Yooniz bridge: credit "learning Yoon" in the kid's
    // linked Yooniz family. Best-effort + bounded; a no-op for non-kids or
    // families not linked/opted-in, never blocks or fails this response.
    // A self-reported "Gad it" tap earns no Yooniz learning credit: only a
    // passed quiz or game does, so a child cannot tap their way to screen time.
    if (source !== "self") await creditYoonizLearning(uid);

    return NextResponse.json({ understood: true, awarded: 0, points });
  } catch (err) {
    console.error("[notebook/understood] failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
