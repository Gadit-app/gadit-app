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
 * The grant is keyed by the expert's own uid: no other account, and no one in
 * the expert's family, can open the review. Every read and every save checks
 * it again on the server.
 */
import { getAdminDb } from "@/lib/firebase-admin";
import { PARTS, STATUS_OF, applyFixes, partOf, quoteOf, type Decision, type Meaning, type PartId } from "@/lib/review-parts";

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
    for (const p of PARTS) {
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

export { partOf };
