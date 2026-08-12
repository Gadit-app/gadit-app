import { NextRequest, NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin, READ-ONLY — kids search-behaviour analysis.
 *
 * Answers the LLM-council "measure first" question before we consider any
 * search-count gamification (Gadi 2026-08-12): are kids genuinely exploring
 * words, or would a rewards mechanic just invite junk-farming? It reads the
 * data that already exists and computes, per linked family child:
 *   - distinct words in their notebook (kids auto-save every lookup; the
 *     notebook is one doc per word, so its size = distinct words)
 *   - total searches ever (sum of dailyUsage/{uid}_{date} counters)
 *   - a "junk" share of the notebook words (single chars, repeated chars,
 *     non-letter strings) as a crude gibberish signal
 *
 * Then aggregates so we can see whether there's even enough kid data to
 * justify building anything, and what the baseline junk rate looks like.
 *
 * USAGE: GET /api/admin/kids-analysis?secret=$ADMIN_SECRET
 */

export const maxDuration = 60;

function isJunkWord(raw: string): boolean {
  const w = (raw || "").trim();
  if (!w) return true;
  // Strip to letters across scripts; if nothing letter-like remains it's junk.
  const letters = w.replace(/[^\p{L}]/gu, "");
  if (letters.length === 0) return true;         // digits / punctuation only
  if (letters.length <= 1) return true;          // single character
  if (/^(.)\1{2,}$/u.test(letters)) return true; // "aaa", repeated same char
  return false;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getAdminDb();

  // All families → their child members that are linked to a uid.
  const famSnap = await db.collection("families").get();
  type Kid = { ownerUid: string; memberId: string; name: string; uid: string };
  const kids: Kid[] = [];
  for (const fam of famSnap.docs) {
    const membersSnap = await fam.ref.collection("members").get();
    for (const m of membersSnap.docs) {
      const d = m.data() as { role?: string; name?: string; userId?: string | null };
      const isChild = d.role === "boy" || d.role === "girl";
      if (isChild && d.userId) {
        kids.push({ ownerUid: fam.id, memberId: m.id, name: d.name || "", uid: d.userId });
      }
    }
  }

  const perKid = await Promise.all(
    kids.map(async (k) => {
      const notebook = db.collection("users").doc(k.uid).collection("notebook");
      let distinct = 0;
      let junk = 0;
      const sampleJunk: string[] = [];
      try {
        const nb = await notebook.get();
        distinct = nb.size;
        for (const doc of nb.docs) {
          const word = (doc.data().word as string) || "";
          if (isJunkWord(word)) {
            junk++;
            if (sampleJunk.length < 8) sampleJunk.push(word);
          }
        }
      } catch { /* unreadable notebook — leave zeros */ }

      // Total searches ever = sum of dailyUsage/{uid}_{date} counters.
      // Prefix range over the document id: [uid_ , uid_<0xF8FF>) spans all
      // of this kid's daily counters regardless of date.
      let totalSearches = 0;
      try {
        const lo = `${k.uid}_`;
        const hi = lo + String.fromCodePoint(0xf8ff);
        const usage = await db
          .collection("dailyUsage")
          .where(FieldPath.documentId(), ">=", lo)
          .where(FieldPath.documentId(), "<", hi)
          .get();
        for (const doc of usage.docs) {
          const c = doc.data().count;
          if (typeof c === "number") totalSearches += c;
        }
      } catch { /* leave zero */ }

      return {
        name: k.name,
        ownerUid: k.ownerUid,
        distinctWords: distinct,
        totalSearches,
        // > 1 means repeats (some grinding/re-looking); ~1 means each search
        // was a new word. Meaningful only once there's real volume.
        searchesPerDistinct: distinct > 0 ? Math.round((totalSearches / distinct) * 100) / 100 : 0,
        junkWords: junk,
        junkPct: distinct > 0 ? Math.round((junk / distinct) * 1000) / 10 : 0,
        sampleJunk,
      };
    }),
  );

  const active = perKid.filter((k) => k.distinctWords > 0);
  const totalDistinct = perKid.reduce((s, k) => s + k.distinctWords, 0);
  const totalSearches = perKid.reduce((s, k) => s + k.totalSearches, 0);
  const totalJunk = perKid.reduce((s, k) => s + k.junkWords, 0);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      linkedKids: kids.length,
      kidsWithActivity: active.length,
      totalDistinctWords: totalDistinct,
      totalSearches,
      overallSearchesPerDistinct: totalDistinct > 0 ? Math.round((totalSearches / totalDistinct) * 100) / 100 : 0,
      junkWords: totalJunk,
      junkPct: totalDistinct > 0 ? Math.round((totalJunk / totalDistinct) * 1000) / 10 : 0,
      medianDistinctPerActiveKid: median(active.map((k) => k.distinctWords)),
    },
    // Sorted by activity, most active first.
    kids: perKid.sort((a, b) => b.distinctWords - a.distinctWords),
  });
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round(((s[mid - 1] + s[mid]) / 2) * 10) / 10;
}
