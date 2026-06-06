import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * Word notebook (Deep tier).
 *
 * Schema: users/{uid}/notebook/{wordId} where wordId is a sanitized
 * representation of `${language}_${word}` (lowercased, trimmed).
 *
 * Document fields:
 *   word: string                    — original spelling as user saved it
 *   language: string                — detected language ("Hebrew", "English"...)
 *   meaning: string                 — short meaning summary saved with the word
 *   addedAt: ISO string             — when the word was first saved
 *   nextReviewAt: ISO string        — when the word becomes due for SR review
 *   intervalDays: number            — current SM-2-style interval
 *   timesReviewed: number           — total review attempts
 *   timesCorrect: number            — count of "I knew it" answers
 */

function makeWordId(language: string, word: string): string {
  // Firestore doc IDs cannot contain "/", but we keep it simple and just
  // strip whitespace and lowercase. Two-language words don't collide because
  // we prefix with the language.
  const safe = `${language}_${word}`
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}_]/gu, ""); // keep only letters/numbers/underscore from any script
  return safe.slice(0, 200) || "untitled";
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
    if (userInfo.plan !== "clear" && userInfo.plan !== "deep") {
      return NextResponse.json(
        { error: "upgrade_required", requiredPlan: "clear" },
        { status: 402 }
      );
    }

    const db = getAdminDb();
    const snap = await db
      .collection("users")
      .doc(userInfo.userId)
      .collection("notebook")
      .orderBy("addedAt", "desc")
      .limit(500)
      .get();

    const items = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("notebook GET error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { word, language, meaning } = await req.json();
    if (!word?.trim() || !language?.trim() || !meaning?.trim()) {
      return NextResponse.json(
        { error: "word, language, meaning required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
    if (userInfo.plan !== "clear" && userInfo.plan !== "deep") {
      return NextResponse.json(
        { error: "upgrade_required", requiredPlan: "clear" },
        { status: 402 }
      );
    }

    const wordId = makeWordId(language, word);
    const db = getAdminDb();
    const ref = db
      .collection("users")
      .doc(userInfo.userId)
      .collection("notebook")
      .doc(wordId);

    const existing = await ref.get();
    if (existing.exists) {
      return NextResponse.json({ id: wordId, alreadySaved: true });
    }

    const now = new Date().toISOString();
    await ref.set({
      word: word.trim(),
      language: language.trim(),
      meaning: meaning.trim().slice(0, 500),
      addedAt: now,
      nextReviewAt: now, // due immediately for first review
      intervalDays: 1,
      timesReviewed: 0,
      timesCorrect: 0,
    });

    return NextResponse.json({ id: wordId, saved: true });
  } catch (err) {
    console.error("notebook POST error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}

/**
 * Bulk-add entries to the notebook — used by the "Download offline pack"
 * flow in /account so the user actually SEES the 500 popular words they
 * just downloaded, instead of them living invisibly in IndexedDB. Now
 * 'offline pack' = 'these words are in your Notebook AND available
 * without WiFi' — one user-visible concept, one place to browse them.
 *
 * Body: { entries: Array<{ word, language, meaning }> }
 * Caps the input at 500 entries per call so a single malformed request
 * can't blow up Firestore quotas.
 *
 * Already-saved words are skipped quietly (returns count in `skipped`)
 * so re-downloading a pack doesn't duplicate or reset review timers.
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const entries = Array.isArray(body?.entries) ? body.entries : [];
    if (entries.length === 0) {
      return NextResponse.json({ error: "entries array required" }, { status: 400 });
    }
    if (entries.length > 500) {
      return NextResponse.json({ error: "max 500 entries per call" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
    if (userInfo.plan !== "clear" && userInfo.plan !== "deep") {
      return NextResponse.json(
        { error: "upgrade_required", requiredPlan: "clear" },
        { status: 402 }
      );
    }

    const db = getAdminDb();
    const colRef = db
      .collection("users")
      .doc(userInfo.userId)
      .collection("notebook");

    // Bulk-load existing IDs so we can skip duplicates without a per-entry
    // read. getAll caps around 500 refs per call — safe since the request
    // body is already capped at 500.
    const refs = entries.map((e: { word?: string; language?: string }) =>
      colRef.doc(makeWordId(String(e.language ?? ""), String(e.word ?? "")))
    );
    const existingSnaps = refs.length > 0 ? await db.getAll(...refs) : [];
    const existingIds = new Set(
      existingSnaps.filter((s) => s.exists).map((s) => s.id)
    );

    const now = new Date().toISOString();
    const batch = db.batch();
    let added = 0;
    let skipped = 0;
    let invalid = 0;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i] as { word?: unknown; language?: unknown; meaning?: unknown };
      const word = typeof e.word === "string" ? e.word.trim() : "";
      const language = typeof e.language === "string" ? e.language.trim() : "";
      const meaning = typeof e.meaning === "string" ? e.meaning.trim() : "";
      if (!word || !language || !meaning) { invalid++; continue; }
      const ref = refs[i];
      if (existingIds.has(ref.id)) { skipped++; continue; }
      batch.set(ref, {
        word,
        language,
        meaning: meaning.slice(0, 500),
        addedAt: now,
        nextReviewAt: now,
        intervalDays: 1,
        timesReviewed: 0,
        timesCorrect: 0,
        // Flag pack-sourced entries so the UI can group / badge them
        // separately from the user's personal saves if we want.
        source: "popular-pack",
      });
      added++;
    }
    if (added > 0) await batch.commit();

    return NextResponse.json({ added, skipped, invalid });
  } catch (err) {
    console.error("notebook PUT (bulk) error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
    if (userInfo.plan !== "clear" && userInfo.plan !== "deep") {
      return NextResponse.json(
        { error: "upgrade_required", requiredPlan: "clear" },
        { status: 402 }
      );
    }

    const db = getAdminDb();
    await db
      .collection("users")
      .doc(userInfo.userId)
      .collection("notebook")
      .doc(id)
      .delete();

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("notebook DELETE error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
