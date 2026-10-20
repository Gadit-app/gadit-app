/**
 * Expert content review (Gemara pilot, Gadi 2026-10-15): one named expert
 * checks the draft content inside Gadit, part by part, until a set date.
 *
 * Data, all server-only (no client rule opens these collections):
 *   reviewGrants/{uid}                       who may review what, until when
 *   contentReviews/{reviewId}                the review: title, meaning list
 *   contentReviews/{reviewId}/meanings/{m}   one draft meaning (content format)
 *   contentReviews/{reviewId}/decisions/{m}  the expert's decision per part
 *   contentReviews/{reviewId}/log/{auto}     every view, save and refusal
 *   contentReviews/{reviewId}/history/{auto} one record per saved decision: who, which
 *                                            part, on which revision, the decision and
 *                                            the text before and after (2026-10-17).
 *                                            Written only with create() in the same
 *                                            transaction as the decision; nothing in the
 *                                            app updates or deletes a record.
 * The grant is keyed by the expert's own uid: no other account, and no one in
 * the expert's family, can open the review. Every read and every save checks
 * it again on the server.
 */
import crypto from "node:crypto";
import { FieldPath } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { PARTS, STATUS_OF, applyFixes, partOf, partsFor, quoteOf, snapshotOf, type Decision, type Meaning, type Part, type PartId } from "@/lib/review-parts";

export type Grant = { uid: string; reviewId: string; email: string; name: string; expiresAt: string; active: boolean };
export type PartDecision = {
  decision: Decision;
  status: "approved" | "draft" | "rejected";
  notes: string;
  fixes: Record<string, string>;
  /** The part as the expert decided on it (after the corrections). */
  snapshot: Record<string, string>;
  quoteCheck?: { edition: string; tractate: string; daf: string; amud: string };
  by: { uid: string; email: string; name: string };
  at: string;
  rev: number;
  /** The history record of this save (absent on decisions saved before 2026-10-17). */
  historyId?: string;
};
export type HistoryRecord = {
  reviewId: string;
  m: string;
  w: string;
  part: PartId;
  rev: number;
  /** sha256 of the meaning as the expert saw it. */
  contentHash: string;
  by: { uid: string; email: string; name: string };
  at: string;
  /** The decision this save replaced, whole, as it was stored; null for the first.
   *  recordedInHistory is false when it was saved before the history existed. */
  before: { decision: PartDecision; recordedInHistory: boolean } | null;
  after: { decision: Decision; status: PartDecision["status"]; fixes: Record<string, string>; quoteCheck?: PartDecision["quoteCheck"] };
  notes: string;
  /** The part's text before this save (the earlier decision's, on the same revision,
   *  else the content) and after it; changed: the fields that differ. */
  textBefore: Record<string, string>;
  textAfter: Record<string, string>;
  changed: string[];
};

const db = () => getAdminDb();
export const reviewRef = (id: string) => db().collection("contentReviews").doc(id);

/** The uid's grant when it is open now, else null. */
export async function openGrant(uid: string, now = Date.now()): Promise<Grant | null> {
  if (!uid) return null;
  const s = await db().collection("reviewGrants").doc(uid).get();
  if (!s.exists) return null;
  const g = s.data() as Partial<Grant>;
  if (g.uid !== uid || g.active !== true || !g.reviewId || !g.expiresAt) return null;
  const end = Date.parse(g.expiresAt);
  if (!Number.isFinite(end) || now > end) return null;
  return { uid, reviewId: g.reviewId, email: g.email ?? "", name: g.name ?? "", expiresAt: g.expiresAt, active: true };
}

export async function logReview(reviewId: string, entry: Record<string, unknown>) {
  try {
    await reviewRef(reviewId).collection("log").add({ ...entry, at: new Date().toISOString() });
  } catch { /* the log never blocks the review */ }
}

const canon = (v: unknown): unknown => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon((v as Record<string, unknown>)[k])])) : v);
export const contentHash = (x: Meaning) => crypto.createHash("sha256").update(JSON.stringify(canon(x))).digest("hex");

/**
 * Saves one part's decision and its history record in ONE transaction: the current
 * decision is replaced (the other parts stay as they are), the record of what it
 * replaced is created, never overwritten. A decision saved before the history
 * existed is kept whole as the record's "before": no history is invented for it.
 */
export async function saveDecision(reviewId: string, x: Meaning, part: Part, d: PartDecision): Promise<{ decision: PartDecision; history: HistoryRecord }> {
  const ref = reviewRef(reviewId).collection("decisions").doc(x.m);
  const hRef = reviewRef(reviewId).collection("history").doc();
  const decision: PartDecision = { ...d, historyId: hRef.id };
  let history!: HistoryRecord;
  await db().runTransaction(async (t) => {
    const cur = await t.get(ref);
    const prev = (cur.exists ? (cur.data()?.parts ?? {})[part.id] : undefined) as PartDecision | undefined;
    const textBefore = prev && prev.rev === d.rev && prev.snapshot ? prev.snapshot : snapshotOf(part, x);
    history = {
      reviewId, m: x.m, w: String(x.w ?? ""), part: part.id, rev: d.rev, contentHash: contentHash(x),
      by: d.by, at: d.at,
      before: prev ? { decision: prev, recordedInHistory: !!prev.historyId } : null,
      after: { decision: d.decision, status: d.status, fixes: d.fixes, ...(d.quoteCheck ? { quoteCheck: d.quoteCheck } : {}) },
      notes: d.notes, textBefore, textAfter: d.snapshot,
      changed: Object.keys(d.snapshot).filter((k) => (textBefore[k] ?? "") !== d.snapshot[k]),
    };
    if (cur.exists) t.update(ref, new FieldPath("parts", part.id), decision, "updatedAt", d.at);
    else t.set(ref, { m: x.m, updatedAt: d.at, parts: { [part.id]: decision } });
    t.create(hRef, history);
  });
  return { decision, history };
}

/** One expert's own history records on one meaning of the review, oldest first. */
export async function historyOf(reviewId: string, m: string, uid: string): Promise<Array<HistoryRecord & { id: string }>> {
  const s = await reviewRef(reviewId).collection("history").where("m", "==", m).get();
  return s.docs.map((h) => ({ id: h.id, ...(h.data() as HistoryRecord) })).filter((h) => h.by?.uid === uid).sort((a, b) => a.at.localeCompare(b.at));
}

export async function reviewMeaning(reviewId: string, m: string): Promise<Meaning | null> {
  const s = await reviewRef(reviewId).collection("meanings").doc(m).get();
  return s.exists ? ((s.data() as { data?: Meaning }).data ?? null) : null;
}

/** The content file as it stands after the expert's decisions, in the same
 *  format as reports/gemara/pilot/pilot-content.json, ready for
 *  scripts/gemara/import-pilot.mjs. Decisions on an older revision of a
 *  meaning are left out and reported. */
export async function exportReview(reviewId: string) {
  const r = await reviewRef(reviewId).get();
  if (!r.exists) return null;
  const head = r.data() as Meaning;
  const meanings: Meaning[] = [];
  const problems: string[] = [];
  const summary: Array<{ m: string; w: string; parts: Record<string, string> }> = [];
  const [ms, ds] = await Promise.all([reviewRef(reviewId).collection("meanings").get(), reviewRef(reviewId).collection("decisions").get()]);
  const dec = new Map(ds.docs.map((d) => [d.id, d.data() as { parts?: Record<string, PartDecision> }]));
  const order = (head.meanings ?? []).map((x: Meaning) => x.m);
  const docs = ms.docs.map((d) => (d.data() as { data: Meaning }).data).sort((a, b) => order.indexOf(a.m) - order.indexOf(b.m));
  for (const base of docs) {
    const x: Meaning = JSON.parse(JSON.stringify(base));
    const parts = dec.get(x.m)?.parts ?? {};
    const line: Record<string, string> = {};
    const present = new Set(partsFor(x).map((p) => p.id));
    for (const p of PARTS) {
      // A level with no text of its own has no part, nor does a meaning without a
      // category or a term function: nothing to export for them.
      if ((p.id.startsWith("level_") || p.id === "category" || p.id === "function") && !present.has(p.id)) continue;
      const d = parts[p.id];
      if (!d) { line[p.id] = x.approvals?.[p.id]?.status ?? (p.id === "diagram" ? "-" : "draft"); continue; }
      if (d.rev !== x.rev) { problems.push(`${x.m}/${p.id}: decided on rev ${d.rev}, the meaning is rev ${x.rev}: left out`); line[p.id] = "stale"; continue; }
      if (d.decision !== "reject") applyFixes(p, x, d.fixes ?? {});
      if (p.id === "quote") {
        const q = quoteOf(x);
        if (d.decision === "approve" && q?.text) {
          const c = d.quoteCheck;
          const same = !!c && c.tractate === q.tractate && c.daf === q.daf && c.amud === q.amud;
          if (!same) {
            problems.push(`${x.m}/quote: the place the expert checked (${c?.tractate} ${c?.daf} ${c?.amud}) is not the quote's (${q.tractate} ${q.daf} ${q.amud}): not verified`);
            x.approvals.quote = { status: "draft", by: "", at: d.at, notes: d.notes };
            line.quote = "draft (place differs)";
            continue;
          }
          Object.assign(q, { expertVerified: true, verifiedBy: d.by.name, checkedAgainst: `${c.edition}, מסכת ${c.tractate} דף ${c.daf} עמוד ${c.amud}`, verifiedAt: d.at, status: "אומת על ידי המומחה" });
        }
        if (d.decision === "reject" && q?.text) { q.expertVerified = false; q.status = "נדחה על ידי המומחה"; }
      }
      x.approvals = x.approvals ?? {};
      x.approvals[p.id as PartId] = { status: STATUS_OF[d.decision], by: d.decision === "approve" ? d.by.name : "", at: d.at, notes: d.notes ?? "" };
      x.review = [...(x.review ?? []), { at: d.at, by: d.by.name, byUid: d.by.uid, part: p.id, decision: d.decision, notes: d.notes ?? "", changes: Object.keys(d.fixes ?? {}), via: "gadit-review" }];
      line[p.id] = STATUS_OF[d.decision];
    }
    x.status = x.approvals?.definition?.status ?? x.status;
    meanings.push(x);
    summary.push({ m: x.m, w: x.w, parts: line });
  }
  const content = { ...(head.content ?? {}), meanings, exportedAt: new Date().toISOString(), exportedFrom: `contentReviews/${reviewId}` };
  return { content, summary, problems };
}

/**
 * A short blind pass before the full review (second expert, 2026-10-20). A review head may
 * carry `blind`: a few words and a few open questions, with no definitions, proposals or
 * hints. Until the expert submits it, the review's meanings stay closed to them. Answers
 * are kept apart from the decisions:
 *   contentReviews/{id}/blind/{uid}             the expert's draft (save and continue)
 *   contentReviews/{id}/blindSubmissions/{uid}  the submitted answers, written once with
 *                                               create(): nothing in the app overwrites it
 * Reviews without `blind` (the first pilot) are not affected at all.
 */
export type Blind = { version: string; title: string; intro: string; items: Array<{ key: string; w: string }>; questions: Array<{ key: string; q: string; required?: boolean }> };
export const blindOf = (head: Meaning | undefined): (Blind & { hash: string }) | null => {
  const b = head?.blind as Blind | undefined;
  if (!b || !b.version || !Array.isArray(b.items) || !b.items.length || !Array.isArray(b.questions) || !b.questions.length) return null;
  const clean = { version: b.version, title: b.title ?? "", intro: b.intro ?? "", items: b.items.map((i) => ({ key: i.key, w: i.w })), questions: b.questions.map((q) => ({ key: q.key, q: q.q, ...(q.required ? { required: true } : {}) })) };
  return { ...clean, hash: crypto.createHash("sha256").update(JSON.stringify(canon(clean))).digest("hex") };
};
export const MAX_ANSWER = 3000;
/** Only the known item/question keys, as trimmed text. */
export function blindAnswers(b: Blind, raw: unknown): Record<string, Record<string, string>> {
  const r = raw && typeof raw === "object" ? (raw as Record<string, Record<string, unknown>>) : {};
  return Object.fromEntries(b.items.map((i) => [i.key, Object.fromEntries(b.questions.map((q) => [q.key, typeof r[i.key]?.[q.key] === "string" ? String(r[i.key][q.key]).trim().slice(0, MAX_ANSWER) : ""]))]));
}
export const blindMissing = (b: Blind, a: Record<string, Record<string, string>>) => b.items.flatMap((i) => b.questions.filter((q) => q.required && !a[i.key]?.[q.key]).map((q) => `${i.key}.${q.key}`));
export async function blindSubmission(reviewId: string, uid: string) {
  const s = await reviewRef(reviewId).collection("blindSubmissions").doc(uid).get();
  return s.exists ? s.data() : null;
}
/** Saves the draft, or submits once: the submission is created in the same transaction that
 *  checks there is none, so a second submit or a later draft save is refused. */
export async function saveBlind(reviewId: string, b: Blind & { hash: string }, who: { uid: string; email: string; name: string }, answers: Record<string, Record<string, string>>, submit: boolean) {
  const sub = reviewRef(reviewId).collection("blindSubmissions").doc(who.uid);
  const draft = reviewRef(reviewId).collection("blind").doc(who.uid);
  const at = new Date().toISOString();
  await db().runTransaction(async (t) => {
    if ((await t.get(sub)).exists) throw new Error("already_submitted");
    if (submit) {
      const record = { reviewId, by: who, version: b.version, questionsHash: b.hash, items: b.items, questions: b.questions, answers, submittedAt: at };
      t.create(sub, { ...record, answersHash: crypto.createHash("sha256").update(JSON.stringify(canon(answers))).digest("hex") });
      t.set(draft, { answers, version: b.version, updatedAt: at, submittedAt: at });
    } else t.set(draft, { answers, version: b.version, updatedAt: at });
  });
  return at;
}

/** One summary question at the end of a review (head.summaryQuestion). Every save is a new
 *  record, created and never changed; the latest one is the expert's current answer. */
export const summaryOf = (head: Meaning | undefined): { version: string; q: string } | null => (head?.summaryQuestion?.q && head?.summaryQuestion?.version ? { version: String(head.summaryQuestion.version), q: String(head.summaryQuestion.q) } : null);
export async function latestSummary(reviewId: string, uid: string) {
  const s = await reviewRef(reviewId).collection("summaries").where("by.uid", "==", uid).get();
  return s.docs.map((d) => d.data()).sort((a, b) => String(b.at).localeCompare(String(a.at)))[0] ?? null;
}
export async function saveSummary(reviewId: string, sq: { version: string; q: string }, who: { uid: string; email: string; name: string }, answer: string) {
  const at = new Date().toISOString();
  await reviewRef(reviewId).collection("summaries").doc().create({ reviewId, by: who, version: sq.version, q: sq.q, answer, at });
  return at;
}

export { partOf };
