import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getDefaultBucket } from "@/lib/firebase-admin";
import { kidTesters, markPaid, paySlips, weekOf } from "@/lib/tester-pay";

/**
 * Game testers' notes (Gadi 2026-11-02), newest first.
 *   GET  ?secret=          → { notes }
 *   GET  ?secret=&audio=ID → the voice note itself
 *   GET  ?secret=&status=approved → only notes Gadi approved for Claude
 *   GET  ?secret=&pay=1&week=YYYY-MM-DD → the children's pay slips for that week
 *   POST ?secret=  { id, status, payAs? }  status: new | approved | liked | skip | done
 *                  payAs: bug | idea (what a note pays as; a voice note needs it)
 *   POST ?secret=  { action: "paid", uid, week, net } → the week was paid in Yooniz
 *
 * "approved" is Gadi's go-ahead: Claude reads these notes but acts on one
 * only after Gadi approves it here.
 */
export const maxDuration = 30;

const STATUSES = new Set(["new", "approved", "liked", "skip", "done"]);

function gate(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if ((req.nextUrl.searchParams.get("secret") ?? "") !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;
  const db = getAdminDb();
  const audioId = req.nextUrl.searchParams.get("audio");
  if (audioId) {
    const d = (await db.collection("testerFeedback").doc(audioId).get()).data();
    const path = d?.audioPath as string | undefined;
    if (!path) return NextResponse.json({ error: "no audio" }, { status: 404 });
    const file = getDefaultBucket().file(path);
    const [buf] = await file.download();
    const [meta] = await file.getMetadata();
    return new Response(buf as unknown as BodyInit, { headers: { "Content-Type": String(meta.contentType ?? "audio/webm"), "Cache-Control": "private, max-age=3600" } });
  }
  if (req.nextUrl.searchParams.get("pay") === "1") {
    const q = req.nextUrl.searchParams.get("week") ?? "";
    const week = /^\d{4}-\d{2}-\d{2}$/.test(q) ? weekOf(new Date(`${q}T12:00:00Z`)) : weekOf();
    return NextResponse.json({ week, thisWeek: weekOf(), slips: await paySlips(await kidTesters(), week) });
  }
  const status = req.nextUrl.searchParams.get("status");
  const snap = await db.collection("testerFeedback").orderBy("at", "desc").limit(300).get();
  const notes = snap.docs
    .map((x) => {
      const d = x.data();
      return {
        id: x.id, name: d.name ?? "", game: d.game ?? "", kind: d.kind ?? "", word: d.word ?? "", path: d.path ?? "",
        transcript: d.transcript ?? "", hasAudio: !!d.audioPath, status: d.status ?? "new", payAs: d.payAs ?? null,
        at: d.at?.toMillis?.() ?? null,
      };
    })
    .filter((n) => !status || n.status === status);
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;
  const b = (await req.json().catch(() => null)) as { id?: string; status?: string; payAs?: string; action?: string; uid?: string; week?: string; net?: number } | null;
  if (b?.action === "paid") {
    if (!b.uid || !b.week || !/^\d{4}-\d{2}-\d{2}$/.test(b.week)) return NextResponse.json({ error: "bad request" }, { status: 400 });
    await markPaid(b.uid, b.week, Number(b.net ?? 0));
    return NextResponse.json({ ok: true });
  }
  if (!b?.id || !b.status || !STATUSES.has(b.status)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const payAs = b.payAs === "bug" || b.payAs === "idea" ? b.payAs : undefined;
  await getAdminDb().collection("testerFeedback").doc(b.id).set({ status: b.status, statusAt: Date.now(), ...(payAs ? { payAs } : {}) }, { merge: true });
  return NextResponse.json({ ok: true });
}
