import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { openGrant, logReview, reviewRef, reviewMeaning, saveDecision, historyOf, type PartDecision } from "@/lib/content-review";
import { DECISIONS, STATUS_OF, checkFixes, partOf, partsFor, quoteOf, snapshotOf, type Decision } from "@/lib/review-parts";

/**
 * The expert's content review (Gemara pilot, 2026-10-15).
 *   GET  /api/review?view=access           { open, expiresAt, name } (anyone signed in)
 *   GET  /api/review?view=list             the meanings and the decisions so far
 *   GET  /api/review?view=meaning&m=<id>   one draft meaning, its decisions, the questions
 *                                          for the expert on it and the expert's OWN
 *                                          history records on it (never another's)
 *   POST /api/review  { m, part, decision, notes, fixes, quoteCheck }
 *                     saves the decision and a history record together; there is no
 *                     way here to change or delete a history record.
 * Bearer token required. Everything but view=access needs an open grant for
 * this exact uid (reviewGrants/{uid}); without one the answer is 404, as if
 * there were no review. Every view, save and refusal is logged.
 */
export const runtime = "nodejs";

const NO = () => NextResponse.json({ error: "not_found" }, { status: 404 });
const PRIVATE = { "Cache-Control": "private, no-store" };

async function caller(req: NextRequest): Promise<{ uid: string; email: string } | null> {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  try {
    const t = await getAdminAuth().verifyIdToken(token);
    return { uid: t.uid, email: t.email ?? "" };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const who = await caller(req);
  if (!who) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const view = req.nextUrl.searchParams.get("view") ?? "list";
  const g = await openGrant(who.uid);
  if (view === "access") {
    return NextResponse.json(g ? { open: true, expiresAt: g.expiresAt, name: g.name } : { open: false }, { headers: PRIVATE });
  }
  if (!g) return NO();
  const head = (await reviewRef(g.reviewId).get()).data();
  if (!head) return NO();
  if (view === "list") {
    const ds = await reviewRef(g.reviewId).collection("decisions").get();
    const dec = Object.fromEntries(ds.docs.map((d) => [d.id, d.data().parts ?? {}]));
    await logReview(g.reviewId, { uid: who.uid, email: who.email, action: "list" });
    return NextResponse.json({
      title: head.title, expiresAt: g.expiresAt, name: g.name, email: who.email,
      // Review groups (2026-10-17): absent for a review loaded without them, like the pilot.
      ...(Array.isArray(head.groups) && head.groups.length ? { groups: head.groups } : {}),
      meanings: (head.meanings ?? []).map((x: { m: string; w: string; rev: number; parts: string[] }) => ({
        ...x,
        decided: Object.fromEntries(Object.entries(dec[x.m] ?? {}).filter(([, d]) => (d as PartDecision).rev === x.rev).map(([p, d]) => [p, (d as PartDecision).decision === "clarify" ? "clarify" : (d as PartDecision).status])),
      })),
    }, { headers: PRIVATE });
  }
  if (view === "meaning") {
    const m = req.nextUrl.searchParams.get("m") ?? "";
    if (!(head.meanings ?? []).some((x: { m: string }) => x.m === m)) return NO();
    const doc = (await reviewRef(g.reviewId).collection("meanings").doc(m).get()).data();
    const x = doc?.data ?? null;
    if (!x) return NO();
    const [d, history] = await Promise.all([reviewRef(g.reviewId).collection("decisions").doc(m).get().then((s) => s.data()), historyOf(g.reviewId, m, who.uid)]);
    await logReview(g.reviewId, { uid: who.uid, email: who.email, action: "view", m });
    return NextResponse.json({
      meaning: x, parts: partsFor(x).map((p) => p.id), decisions: d?.parts ?? {},
      questions: Array.isArray(doc?.questions) ? doc.questions : [],
      history: history.map(({ id, part, rev, at, before, after, notes, changed, textBefore, textAfter }) => ({ id, part, rev, at, before: before ? { decision: before.decision.decision, status: before.decision.status, at: before.decision.at, recordedInHistory: before.recordedInHistory } : null, after, notes, changed, textBefore, textAfter })),
    }, { headers: PRIVATE });
  }
  return NextResponse.json({ error: "bad_view" }, { status: 400 });
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  const who = await caller(req);
  if (!who) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const g = await openGrant(who.uid);
  if (!g) return NO();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const m = clean(body?.m, 40);
  const part = partOf(clean(body?.part, 20));
  const decision = clean(body?.decision, 10) as Decision;
  const refuse = async (error: string, status = 400) => {
    await logReview(g.reviewId, { uid: who.uid, email: who.email, action: "refused", m, part: part?.id ?? "", error });
    return NextResponse.json({ error }, { status });
  };
  const x = m ? await reviewMeaning(g.reviewId, m) : null;
  if (!x) return NO();
  if (!part || !partsFor(x).some((p) => p.id === part.id)) return refuse("bad_part");
  if (!DECISIONS.includes(decision)) return refuse("bad_decision");
  const notes = clean(body?.notes, 2000);
  const rawFixes = body?.fixes && typeof body.fixes === "object" ? (body.fixes as Record<string, unknown>) : {};
  const problems = checkFixes(part, rawFixes);
  if (problems.length) return refuse(problems.join(","));
  // Only real changes are corrections.
  const fixes: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawFixes)) {
    const f = part.fields.find((y) => y.key === k);
    if (f && String(v).trim() !== f.get(x)) fixes[k] = String(v).trim();
  }
  let quoteCheck: PartDecision["quoteCheck"];
  if (part.id === "quote" && decision === "approve") {
    if (!quoteOf(x)?.text) return refuse("no_quote");
    const qc = (body?.quoteCheck ?? {}) as Record<string, unknown>;
    quoteCheck = { edition: clean(qc.edition, 120), tractate: clean(qc.tractate, 40), daf: clean(qc.daf, 10), amud: clean(qc.amud, 4) };
    if (!quoteCheck.edition || !quoteCheck.tractate || !quoteCheck.daf || !quoteCheck.amud) return refuse("quote_check_required");
  }
  if (decision === "fix" && !Object.keys(fixes).length && !notes) return refuse("fix_needs_a_change_or_a_note");
  if (!g.name) return refuse("grant_has_no_name", 409);
  const d: PartDecision = {
    decision, status: STATUS_OF[decision], notes, fixes,
    snapshot: snapshotOf(part, x, fixes),
    ...(quoteCheck ? { quoteCheck } : {}),
    by: { uid: who.uid, email: who.email, name: g.name },
    at: new Date().toISOString(),
    rev: Number(x.rev) || 1,
  };
  // One part at a time: the other parts' decisions stay as they are; that one part is
  // replaced whole (a merge would keep an old correction), and the history record of
  // the change is created in the same transaction.
  const saved = await saveDecision(g.reviewId, x, part, d);
  await logReview(g.reviewId, { uid: who.uid, email: who.email, action: "save", m, part: part.id, decision, changes: Object.keys(fixes), historyId: saved.decision.historyId });
  return NextResponse.json({ ok: true, decision: saved.decision }, { headers: PRIVATE });
}
