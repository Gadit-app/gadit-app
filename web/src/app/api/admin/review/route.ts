import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { exportReview, reviewRef } from "@/lib/content-review";

/**
 * Admin side of the expert content review (Gemara pilot, 2026-10-15).
 *   GET  ?secret=…&action=status&review=<id>   grants, decisions so far, the last log entries
 *   GET  ?secret=…&action=history&review=<id>[&m=<meaning>]   every history record, oldest first
 *   GET  ?secret=…&action=blind&review=<id>    the blind pass: submitted answers (as written once)
 *                                              and drafts not yet submitted; the closing answers
 *   GET  ?secret=…&action=export&review=<id>   the content after the decisions, in the
 *                                              pilot-content.json format (for import-pilot.mjs)
 *   POST ?secret=…  { action: "grant", uid, email, name, review, expiresAt }
 *                   { action: "extend", uid, expiresAt }
 *                   { action: "close", uid }
 *                   { action: "archive", review } | { action: "unarchive", review }
 *                   An archived review (the first pilot once it is done, 2026-10-18)
 *                   stays whole for the admin: status, history and export keep
 *                   working, nothing is deleted. It can't be granted again, and it
 *                   is refused while an expert's grant on it is still open.
 * A grant is for one uid only; its email must be that account's email.
 */
export const runtime = "nodejs";

function authz(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  if ((req.nextUrl.searchParams.get("secret") ?? "") !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}
const REVIEW_ID = /^[a-z0-9-]{3,40}$/;
const validEnd = (v: unknown) => typeof v === "string" && Number.isFinite(Date.parse(v)) && Date.parse(v) > Date.now();

export async function GET(req: NextRequest) {
  const bad = authz(req);
  if (bad) return bad;
  const id = req.nextUrl.searchParams.get("review") ?? "";
  if (!REVIEW_ID.test(id)) return NextResponse.json({ error: "bad_review" }, { status: 400 });
  const action = req.nextUrl.searchParams.get("action") ?? "status";
  if (action === "export") {
    const out = await exportReview(id);
    return out ? NextResponse.json(out) : NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (action === "blind") {
    const [subs, drafts, sums] = await Promise.all([reviewRef(id).collection("blindSubmissions").get(), reviewRef(id).collection("blind").get(), reviewRef(id).collection("summaries").get()]);
    return NextResponse.json({
      submissions: subs.docs.map((d) => ({ uid: d.id, ...d.data() })),
      drafts: drafts.docs.filter((d) => !d.get("submittedAt")).map((d) => ({ uid: d.id, ...d.data() })),
      summaries: sums.docs.map((d) => d.data()).sort((a, b) => String(a.at).localeCompare(String(b.at))),
    });
  }
  if (action === "history") {
    const m = req.nextUrl.searchParams.get("m") ?? "";
    const col = reviewRef(id).collection("history");
    const s = await (m ? col.where("m", "==", m) : col).get();
    return NextResponse.json({ history: s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String((a as { at?: string }).at).localeCompare(String((b as { at?: string }).at))) });
  }
  const head = await reviewRef(id).get();
  if (!head.exists) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const [grants, decisions, log] = await Promise.all([
    getAdminDb().collection("reviewGrants").where("reviewId", "==", id).get(),
    reviewRef(id).collection("decisions").get(),
    reviewRef(id).collection("log").orderBy("at", "desc").limit(50).get(),
  ]);
  return NextResponse.json({
    title: head.get("title"),
    meanings: (head.get("meanings") ?? []).length,
    grants: grants.docs.map((d) => d.data()),
    decisions: decisions.docs.map((d) => ({ m: d.id, parts: Object.fromEntries(Object.entries(d.get("parts") ?? {}).map(([p, v]) => [p, (v as { status: string }).status])) })),
    log: log.docs.map((d) => d.data()),
  });
}

export async function POST(req: NextRequest) {
  const bad = authz(req);
  if (bad) return bad;
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (b?.action === "archive" || b?.action === "unarchive") {
    const review = String(b.review ?? "");
    if (!REVIEW_ID.test(review) || !(await reviewRef(review).get()).exists) return NextResponse.json({ error: "no_such_review" }, { status: 404 });
    const at = new Date().toISOString();
    if (b.action === "archive") {
      const open = await getAdminDb().collection("reviewGrants").where("reviewId", "==", review).get();
      const live = open.docs.filter((d) => d.get("active") === true && Date.parse(String(d.get("expiresAt"))) > Date.now());
      if (live.length) return NextResponse.json({ error: "review_in_use", openGrants: live.length }, { status: 409 });
    }
    await reviewRef(review).set(b.action === "archive" ? { archived: true, archivedAt: at } : { archived: false, unarchivedAt: at }, { merge: true });
    await reviewRef(review).collection("log").add({ action: b.action, at, by: "admin" });
    return NextResponse.json({ ok: true, review, archived: b.action === "archive" });
  }
  const uid = typeof b?.uid === "string" ? b.uid.trim() : "";
  if (!uid) return NextResponse.json({ error: "uid_required" }, { status: 400 });
  const ref = getAdminDb().collection("reviewGrants").doc(uid);
  const now = new Date().toISOString();
  if (b?.action === "grant") {
    const review = String(b.review ?? "");
    const email = String(b.email ?? "").trim().toLowerCase();
    const name = String(b.name ?? "").trim().slice(0, 80);
    const head = await reviewRef(review).get();
    if (!REVIEW_ID.test(review) || !head.exists) return NextResponse.json({ error: "no_such_review" }, { status: 404 });
    if (head.get("archived") === true) return NextResponse.json({ error: "review_archived" }, { status: 409 });
    if (!name || !validEnd(b.expiresAt)) return NextResponse.json({ error: "name_and_future_expiresAt_required" }, { status: 400 });
    let account = "";
    try { account = ((await getAdminAuth().getUser(uid)).email ?? "").toLowerCase(); } catch { return NextResponse.json({ error: "no_such_user" }, { status: 404 }); }
    if (!email || account !== email) return NextResponse.json({ error: "email_does_not_match_uid" }, { status: 409 });
    const g = { uid, reviewId: review, email, name, expiresAt: new Date(String(b.expiresAt)).toISOString(), active: true, createdAt: now };
    await ref.set(g);
    await reviewRef(review).collection("log").add({ action: "grant", uid, expiresAt: g.expiresAt, at: now, by: "admin" });
    return NextResponse.json({ ok: true, grant: g });
  }
  const cur = await ref.get();
  if (!cur.exists) return NextResponse.json({ error: "no_grant" }, { status: 404 });
  const review = String(cur.get("reviewId"));
  if (b?.action === "extend") {
    if (!validEnd(b.expiresAt)) return NextResponse.json({ error: "future_expiresAt_required" }, { status: 400 });
    const expiresAt = new Date(String(b.expiresAt)).toISOString();
    await ref.update({ expiresAt, active: true, updatedAt: now });
    await reviewRef(review).collection("log").add({ action: "extend", uid, expiresAt, at: now, by: "admin" });
    return NextResponse.json({ ok: true, expiresAt });
  }
  if (b?.action === "close") {
    await ref.update({ active: false, closedAt: now });
    await reviewRef(review).collection("log").add({ action: "close", uid, at: now, by: "admin" });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}
