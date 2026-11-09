import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { isDegenerate, sanitizeDegenerateEtymology } from "@/lib/define-guard";
import { dropSoundAlikeMeanings } from "@/lib/homophones-he";
import { repeatsDefinition, dropRepeatedOrigin } from "@/lib/etymology-guard";

export const maxDuration = 60;

/**
 * Cache seeding (Gadi 2026-11-09: the 17k Hebrew words + phrases). The
 * definitions are generated with the OpenAI Batch API (half price) by a local
 * script; this route takes the model's raw answers and runs the same checks a
 * live search runs before anything is cached:
 *   - unreadable or broken answers are rejected (a live search regenerates them);
 *   - a garbled origin is cleared (the define route repairs it on the first real view);
 *   - correctedFrom is decided from what was typed, as in the define route;
 *   - sound-alike meanings are dropped;
 *   - "not sure" answers are rejected (a live search escalates them);
 *   - an origin that repeats the definition is dropped (repaired on first view).
 * Never overwrites: an entry that already exists stays as it is.
 *
 *   POST /api/admin/seed-ingest?secret=$ADMIN_SECRET
 *   {"lang":"he","tier":"kids","items":[{"word":"...","content":"<model JSON>"}]}
 */

type Item = { word?: string; content?: string };

function isUncertain(r: unknown): boolean {
  const o = r as { uncertain?: boolean; meanings?: Array<{ meaning?: string }> };
  if (o?.uncertain === true) return true;
  const m = o?.meanings?.[0]?.meaning ?? "";
  return (o?.meanings?.length ?? 0) === 1 && /לא בטוחים במילה הזאת|not sure about this word/i.test(m);
}

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || req.nextUrl.searchParams.get("secret") !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { lang?: string; tier?: string; items?: Item[]; dryRun?: boolean };
  const lang = String(body.lang || "");
  const tier = body.tier === "base" ? "base" : body.tier === "kids" ? "kids" : "";
  const items = Array.isArray(body.items) ? body.items.slice(0, 100) : [];
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(lang) || !tier || !items.length) {
    return NextResponse.json({ error: "lang, tier and items required" }, { status: 400 });
  }

  const db = getAdminDb();
  const results: Array<{ word: string; status: string; reason?: string }> = [];
  await Promise.all(
    items.map(async (it) => {
      const word = String(it.word || "").trim();
      if (!word) return;
      let r: Record<string, unknown>;
      try {
        r = JSON.parse(String(it.content || ""));
      } catch {
        results.push({ word, status: "rejected", reason: "parse" });
        return;
      }
      let verdict = isDegenerate(r, word, lang);
      if (verdict.degenerate === true && verdict.reason.startsWith("etymology.")) {
        r = sanitizeDegenerateEtymology(r) as Record<string, unknown>;
        verdict = isDegenerate(r, word, lang);
      }
      if (verdict.degenerate === true) {
        results.push({ word, status: "rejected", reason: verdict.reason });
        return;
      }
      // Same rule as the define route: correctedFrom only when what was typed
      // differs from the word that was defined and looks like a typo of it.
      const cn = (s: string) => (s || "").normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
      const inN = cn(word);
      const wN = cn(String(r.word || ""));
      const hasDef = Array.isArray(r.meanings) && r.meanings.length > 0 && !r.suggestedWord;
      const typoLike = inN.length > 0 && wN.length > 0 && inN !== wN && Math.abs(inN.length - wN.length) <= 4;
      r.correctedFrom = hasDef && typoLike ? word : null;
      r = dropSoundAlikeMeanings(r, word);
      if (isUncertain(r)) {
        results.push({ word, status: "rejected", reason: "uncertain" });
        return;
      }
      if (repeatsDefinition(r)) r = dropRepeatedOrigin(r);

      const key = `auto2_${lang}_${tier}_${word.toLowerCase().trim()}`;
      if (body.dryRun) {
        const exists = (await db.collection("cache").doc(key).get()).exists;
        results.push({ word, status: exists ? "exists" : "would_write" });
        return;
      }
      try {
        await db.collection("cache").doc(key).create({ ...r, cachedAt: new Date().toISOString() });
        results.push({ word, status: "written" });
      } catch (e) {
        const code = (e as { code?: number }).code;
        results.push({ word, status: code === 6 ? "exists" : "error", reason: code === 6 ? undefined : String(e).slice(0, 200) });
      }
    }),
  );

  const counts: Record<string, number> = {};
  for (const x of results) counts[x.status] = (counts[x.status] || 0) + 1;
  return NextResponse.json({ ok: true, counts, results });
}
