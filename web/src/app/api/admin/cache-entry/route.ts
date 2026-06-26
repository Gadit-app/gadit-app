import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Inspect or bust a single `cache` document by (word, lang) — used
 * when a specific lookup returned a degenerate / hallucinated result
 * and we need to surgically drop just that entry so the next user
 * triggers a fresh OpenAI generation.
 *
 * Cache keys follow the format used in api/define/route.ts:
 *   auto2_<lang>_<tier>_<word>           (no context)
 *   ctx2_<lang>_<tier>_<word>_<ctx>      (with context sentence)
 * Tier is "base" (anonymous/basic) or "kids" (clear/deep).
 *
 * USAGE:
 *   GET    /api/admin/cache-entry?secret=$ADMIN_SECRET&word=חתול&lang=he
 *     → returns { keys: [...], entries: { key: <cached data>, ... } }
 *
 *   DELETE /api/admin/cache-entry?secret=$ADMIN_SECRET&word=חתול&lang=he
 *     → deletes both base + kids variants for the (word, lang)
 *       returns { deleted: [...keys] }
 *
 * The "word" param is the raw, untransformed query string the user
 * would type. We lowercase + trim it on the server, mirroring the
 * normalisation define/route.ts does when building the cache key,
 * so callers don't need to do it themselves.
 *
 * If you also want to drop ctx2_ entries (lookups made with a
 * context sentence), pass &includeContext=1 — the server will list
 * every doc whose ID starts with `ctx2_<lang>_*_<word>_` and delete
 * those too. Without the flag, context-keyed entries are left alone.
 */

export const maxDuration = 30;

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function baseKeys(word: string, lang: string): string[] {
  const w = normalize(word);
  return [
    `auto2_${lang}_base_${w}`,
    `auto2_${lang}_kids_${w}`,
  ];
}

async function authz(req: NextRequest): Promise<NextResponse | null> {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET env var not configured, refusing to run" },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

function readParams(req: NextRequest): { word: string; lang: string; includeContext: boolean } | NextResponse {
  const word = req.nextUrl.searchParams.get("word")?.trim() ?? "";
  const lang = req.nextUrl.searchParams.get("lang")?.trim() ?? "";
  const includeContext = req.nextUrl.searchParams.get("includeContext") === "1";
  if (!word) return NextResponse.json({ error: "word param required" }, { status: 400 });
  if (!lang) return NextResponse.json({ error: "lang param required" }, { status: 400 });
  return { word, lang, includeContext };
}

export async function GET(req: NextRequest) {
  const denied = await authz(req);
  if (denied) return denied;
  const parsed = readParams(req);
  if (parsed instanceof NextResponse) return parsed;
  const { word, lang } = parsed;

  const db = getAdminDb();
  const keys = baseKeys(word, lang);
  const entries: Record<string, unknown> = {};
  for (const key of keys) {
    const snap = await db.collection("cache").doc(key).get();
    if (snap.exists) entries[key] = snap.data();
  }
  return NextResponse.json({
    word,
    lang,
    keys,
    entries,
    found: Object.keys(entries).length,
  });
}

export async function DELETE(req: NextRequest) {
  const denied = await authz(req);
  if (denied) return denied;
  const parsed = readParams(req);
  if (parsed instanceof NextResponse) return parsed;
  const { word, lang, includeContext } = parsed;

  const db = getAdminDb();
  const deleted: string[] = [];
  const skipped: string[] = [];

  // Base keys first — straight deletes by ID.
  for (const key of baseKeys(word, lang)) {
    const ref = db.collection("cache").doc(key);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
      deleted.push(key);
    } else {
      skipped.push(key);
    }
  }

  // Optional: also drop ctx2_<lang>_*_<word>_<ctx>... entries.
  // Firestore can't do "doc ID starts-with" natively, so we scan the
  // collection. Cheap at our scale (thousands of docs).
  if (includeContext) {
    const w = normalize(word);
    const prefixes = [
      `ctx2_${lang}_base_${w}_`,
      `ctx2_${lang}_kids_${w}_`,
    ];
    const all = await db.collection("cache").get();
    for (const doc of all.docs) {
      if (prefixes.some((p) => doc.id.startsWith(p))) {
        await doc.ref.delete();
        deleted.push(doc.id);
      }
    }
  }

  return NextResponse.json({
    word,
    lang,
    deleted,
    skipped,
    deletedCount: deleted.length,
  });
}
