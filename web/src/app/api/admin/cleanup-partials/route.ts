import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";

/**
 * One-off cleanup for the streaming-prefix junk (fixed in 0681a9a): the
 * kid auto-save + activity log briefly fired on partial streamed words,
 * so a lookup of "חפץ" left behind "ח" and "חפ" too. This finds and
 * removes any entry whose word is a STRICT prefix of a longer word from
 * the SAME child within a few seconds (the bug's signature), in both:
 *   - families/{owner}/kidSearches   (the parent activity feed)
 *   - users/{kidUid}/notebook        (the child's saved words)
 *
 * Safe by construction: it only deletes a short word when a longer word
 * that starts with it was created within WINDOW_MS. Legit lookups of two
 * unrelated words, or the same prefix minutes apart, are never touched.
 *
 *   GET /api/admin/cleanup-partials?secret=$ADMIN_SECRET&email=<owner>&dryRun=1
 *   (or &uid=<ownerUid>)
 */

export const maxDuration = 60;

const WINDOW_MS = 8000;

function tms(iso: unknown): number {
  const t = typeof iso === "string" ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : 0;
}

/** Given [{id, word, t}], return the ids that are a strict prefix of a
 *  longer word within WINDOW_MS. */
function prefixJunkIds(rows: { id: string; word: string; t: number }[]): Set<string> {
  const junk = new Set<string>();
  for (const a of rows) {
    if (!a.word) continue;
    for (const b of rows) {
      if (a.id === b.id) continue;
      if (
        b.word.length > a.word.length &&
        b.word.startsWith(a.word) &&
        Math.abs(a.t - b.t) <= WINDOW_MS
      ) {
        junk.add(a.id);
        break;
      }
    }
  }
  return junk;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ error: "no ADMIN_SECRET" }, { status: 503 });
  if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const email = req.nextUrl.searchParams.get("email")?.trim();
  let ownerUid = req.nextUrl.searchParams.get("uid")?.trim() || "";
  if (!ownerUid && email) {
    try {
      ownerUid = (await getAdminAuth().getUserByEmail(email)).uid;
    } catch {
      return NextResponse.json({ error: "owner not found for email" }, { status: 404 });
    }
  }
  if (!ownerUid) return NextResponse.json({ error: "email or uid required" }, { status: 400 });

  const db = getAdminDb();
  const famRef = db.collection("families").doc(ownerUid);
  if (!(await famRef.get()).exists) {
    return NextResponse.json({ error: "not a family owner", ownerUid }, { status: 404 });
  }

  const result: {
    ownerUid: string;
    dryRun: boolean;
    kidSearches: { scanned: number; deleted: string[] };
    notebooks: Record<string, { scanned: number; deleted: string[] }>;
  } = { ownerUid, dryRun, kidSearches: { scanned: 0, deleted: [] }, notebooks: {} };

  // 1) kidSearches (activity feed) — group by child, then prefix-detect.
  const ksSnap = await famRef.collection("kidSearches").get();
  result.kidSearches.scanned = ksSnap.size;
  const byMember = new Map<string, { id: string; word: string; t: number }[]>();
  for (const d of ksSnap.docs) {
    const x = d.data() as { word?: string; memberId?: string; at?: string };
    const key = x.memberId || "_";
    const arr = byMember.get(key) ?? [];
    arr.push({ id: d.id, word: (x.word ?? "").trim(), t: tms(x.at) });
    byMember.set(key, arr);
  }
  const ksJunk: string[] = [];
  for (const rows of byMember.values()) for (const id of prefixJunkIds(rows)) ksJunk.push(id);
  if (!dryRun) {
    for (let i = 0; i < ksJunk.length; i += 400) {
      const batch = db.batch();
      for (const id of ksJunk.slice(i, i + 400)) batch.delete(famRef.collection("kidSearches").doc(id));
      await batch.commit();
    }
  }
  result.kidSearches.deleted = ksJunk;

  // 2) Each child's notebook.
  const membersSnap = await famRef.collection("members").get();
  for (const m of membersSnap.docs) {
    const kidUid = (m.data() as { userId?: string }).userId;
    if (!kidUid) continue;
    const nbRef = db.collection("users").doc(kidUid).collection("notebook");
    const nbSnap = await nbRef.get();
    const rows = nbSnap.docs.map((d) => {
      const x = d.data() as { word?: string; addedAt?: string };
      return { id: d.id, word: (x.word ?? "").trim(), t: tms(x.addedAt) };
    });
    const junk = [...prefixJunkIds(rows)];
    if (!dryRun && junk.length) {
      for (let i = 0; i < junk.length; i += 400) {
        const batch = db.batch();
        for (const id of junk.slice(i, i + 400)) batch.delete(nbRef.doc(id));
        await batch.commit();
      }
    }
    result.notebooks[kidUid] = { scanned: nbSnap.size, deleted: junk };
  }

  return NextResponse.json(result);
}
