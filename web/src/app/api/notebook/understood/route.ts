import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { POINTS } from "@/lib/gamification";

/**
 * Mark a notebook word as UNDERSTOOD and award comprehension points
 * (kids gamification v2, LLM council 2026-08). Called by the quiz / word-game
 * success handlers when the child answers correctly on the CURRENT word.
 *
 * Comprehension is a multiplier, not a gate: looking a word up already earned
 * a little on save; proving understanding here earns POINTS.understood. This
 * only fires ONCE per word (understoodAt is set the first time), so a child
 * can't farm the same word for points. Points go to the EARNED wallet
 * (users/{uid}.points) which drives ranks + the parent dashboard; parent/
 * Yooniz gift points live in a separate capped wallet elsewhere.
 *
 *   POST { word, language, source?: "quiz" | "game" }
 *   Auth: Firebase ID token (Bearer). Paid plans only (Family kids = deep).
 *   → { understood, awarded, points } | { alreadyUnderstood, points } | { skipped }
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
    if (b.source === "game" || b.source === "quiz") source = b.source;
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!word || !language) return NextResponse.json({ error: "word_and_language_required" }, { status: 400 });

  const db = getAdminDb();
  const uid = userInfo.userId;
  const wordId = makeWordId(language, word);
  const wordRef = db.collection("users").doc(uid).collection("notebook").doc(wordId);
  const userRef = db.collection("users").doc(uid);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(wordRef);
      // The word must already be in the notebook (games/quizzes run on saved
      // words). If it isn't, do nothing rather than invent an entry.
      if (!snap.exists) return { status: "skipped" as const };
      if (snap.data()?.understood === true) return { status: "already" as const };
      const now = new Date().toISOString();
      tx.update(wordRef, { understood: true, understoodAt: now });
      tx.set(userRef, { points: FieldValue.increment(POINTS.understood) }, { merge: true });
      return { status: "awarded" as const, now };
    });

    if (result.status === "skipped") return NextResponse.json({ skipped: "not_in_notebook" });

    // Read the fresh points total for the client (cheap single read).
    const points = (await userRef.get()).data()?.points ?? 0;

    if (result.status === "already") return NextResponse.json({ alreadyUnderstood: true, points });

    // Append-only ledger entry (audit trail + future "word world" feed).
    await db.collection("users").doc(uid).collection("ledger").add({
      delta: POINTS.understood,
      reason: "understood",
      source,
      word,
      language,
      ts: result.now,
    });

    return NextResponse.json({ understood: true, awarded: POINTS.understood, points });
  } catch (err) {
    console.error("[notebook/understood] failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
