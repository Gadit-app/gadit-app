import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan, getAdminDb } from "@/lib/firebase-admin";

/**
 * The offline dictionary for /account ("Download offline pack"): every word
 * in the shared cache for one UI language, in pages, so a paying user's
 * device can keep all of them in IndexedDB and look words up with no
 * internet (Gadi 2026-11-09, with the 17k Hebrew seeding).
 *
 *   GET /api/popular-words?lang=he&count=1          → { lang, total, approxMB }
 *   GET /api/popular-words?lang=he&after=<word>     → { lang, words, next }
 *
 * Pages follow the cache doc ids (`auto2_<lang>_kids_<word>`), 800 per page,
 * so a response stays far below the function body limit. The kids tier is
 * the version paying users get from a normal search.
 *
 * Until 2026-11-09 this returned the first 500 BASE entries in alphabetical
 * order (for Hebrew: punctuation and English words) and the client also put
 * them in the Notebook; both are gone.
 *
 * Auth: signed-in Clear/Deep (Individual, Family and Schools map to these).
 */

export const maxDuration = 60;

const PAGE = 800;
// Measured 2026-11-09 on the Hebrew cache: 2.6 KB per entry as stored.
const KB_PER_ENTRY = 2.6;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  if (userInfo.plan !== "clear" && userInfo.plan !== "deep") {
    return NextResponse.json(
      { error: "upgrade_required", message: "Offline pack is a paid feature." },
      { status: 403 },
    );
  }

  const url = req.nextUrl;
  const lang = url.searchParams.get("lang") ?? "";
  if (!/^[a-z]{2,3}(-[A-Z]{2})?$/.test(lang)) {
    return NextResponse.json({ error: "invalid_lang" }, { status: 400 });
  }

  const db = getAdminDb();
  const prefix = `auto2_${lang}_kids_`;
  const upper = prefix + "￿";
  const headers = { "Cache-Control": "private, no-store" };

  try {
    if (url.searchParams.get("count") === "1") {
      const agg = await db.collection("cache")
        .where("__name__", ">=", prefix)
        .where("__name__", "<", upper)
        .count()
        .get();
      const total = agg.data().count;
      return NextResponse.json(
        { lang, total, approxMB: Math.max(1, Math.round((total * KB_PER_ENTRY) / 1024)) },
        { headers },
      );
    }

    const after = url.searchParams.get("after");
    const start = after ? prefix + after : prefix;
    const snap = await db.collection("cache")
      .where("__name__", after ? ">" : ">=", start)
      .where("__name__", "<", upper)
      .orderBy("__name__")
      .limit(PAGE)
      .get();

    const words: Array<{ word: string; result: FirebaseFirestore.DocumentData }> = [];
    for (const doc of snap.docs) {
      const word = doc.id.slice(prefix.length);
      const result = doc.data();
      if (!word || !result || typeof result !== "object") continue;
      words.push({ word, result });
    }
    const last = snap.docs[snap.docs.length - 1]?.id.slice(prefix.length) ?? null;
    return NextResponse.json(
      { lang, words, next: snap.docs.length === PAGE ? last : null },
      { headers },
    );
  } catch (err) {
    console.error("[popular-words] query failed:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
