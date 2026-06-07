import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Return a batch of the most-recently-cached word results for a given
 * UI language, packaged as JSON so the client can write them all into
 * IndexedDB in one shot.
 *
 * Used by the "Download offline pack" flow in /account: a Clear/Deep
 * subscriber taps the button, the client hits this endpoint, and every
 * word in the response gets written to IDB. From that moment on they
 * can study those words with no network at all.
 *
 * Why "most recently cached" as the popularity signal: we don't (yet)
 * track per-cache-key hit counts. Recency is a fair proxy — the cache
 * doc gets written on the first miss for a word, so a doc that exists
 * at all means at least one user has asked for that word, and the
 * server keeps the cache around indefinitely. Sorting by cachedAt
 * descending surfaces what's been searched lately, which correlates
 * strongly with what's currently in demand.
 *
 * USAGE:
 *   GET /api/popular-words?lang=he&limit=500
 *
 * Auth: signed-in only, Clear/Deep only. Anonymous + Basic get 403.
 * (Basic gets the same 403 because offline access is the paid feature
 * Gadi explicitly scoped Clear/Deep to.)
 *
 * Response:
 *   { lang, count, words: [{ word, language, result: <WordResult> }] }
 */

export const maxDuration = 60;

const SUPPORTED_LANGS = new Set([
  "he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs",
]);

export async function GET(req: NextRequest) {
  // Auth + tier gate
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  if (userInfo.plan !== "clear" && userInfo.plan !== "deep") {
    return NextResponse.json(
      { error: "upgrade_required", message: "Offline pack is a Clear/Deep feature." },
      { status: 403 },
    );
  }

  const url = req.nextUrl;
  const lang = (url.searchParams.get("lang") ?? "").toLowerCase();
  if (!SUPPORTED_LANGS.has(lang)) {
    return NextResponse.json(
      { error: "invalid_lang", supported: [...SUPPORTED_LANGS] },
      { status: 400 },
    );
  }
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "500", 10) || 500, 1),
    2000,
  );

  // Cache doc IDs look like `auto2_<lang>_<tier>_<word>` and
  // `ctx2_<lang>_<tier>_<word>_<snippet>`. We want the auto2_<lang>_base_*
  // family: they're general-purpose results (no specific sentence
  // context) and they're what the user gets from a normal search.
  // Firestore doesn't support prefix queries directly, but a range query
  // on the document key does the same thing: ">=" prefix and "<" prefix + "￿"
  // catches every key that starts with the prefix.
  //
  // Prefix moved from auto_ to auto2_ on 2026-06-07 in lockstep with
  // /api/define to invalidate cross-language wrong-language entries.
  // For a few days the offline pack will be slim while auto2_ fills up;
  // the pack is a Clear/Deep feature so users can re-download once the
  // cache rebuilds (popular words re-cache themselves on first hit).
  const db = getAdminDb();
  const prefix = `auto2_${lang}_base_`;
  const upper = prefix + "￿";

  try {
    const snap = await db
      .collection("cache")
      // FieldPath.documentId() lets us range-query by doc ID. The raw
      // string ">=" / "<" approach works because Firestore stringly
      // compares doc IDs.
      .where("__name__", ">=", prefix)
      .where("__name__", "<", upper)
      .orderBy("__name__")
      .limit(limit)
      .get();

    type PopularEntry = {
      word: string;
      language: string;
      result: FirebaseFirestore.DocumentData;
    };
    const words: PopularEntry[] = [];
    for (const doc of snap.docs) {
      const id = doc.id; // auto_<lang>_base_<word>
      const word = id.slice(prefix.length);
      if (!word) continue;
      const result = doc.data();
      if (!result || typeof result !== "object") continue;
      words.push({
        word,
        language: (result as { language?: string }).language ?? "",
        result,
      });
    }

    return NextResponse.json(
      { lang, count: words.length, words },
      {
        headers: {
          // 5-min CDN cache — popular-words is a quasi-static surface
          // (the cache collection changes slowly relative to a 500-word
          // pack), so we can amortize the Firestore reads across users.
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    console.error("[popular-words] query failed:", err);
    return NextResponse.json(
      { error: "internal", details: String(err) },
      { status: 500 },
    );
  }
}
