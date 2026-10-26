/**
 * Automatic "what's new" sends (2026-10-26). /api/cron/announcements runs
 * every hour; each run sends every announcement that is approved
 * (`approved: true`) and due (`sendAt` passed), once per user, through the
 * same loop as the admin route (announce-send.ts), with scheduled sends.
 *
 * One-time: an announcement is one run over the list, spread over as many
 * hourly passes as it needs (a pass stops starting sends after a time
 * budget; the next pass goes on, skipping everyone already stamped). When a
 * pass reaches everyone (nothing pending, no failure left to retry), the run
 * is finished (announcementRuns/{id}.finishedAt): it never runs again, so
 * someone who subscribes next week does not get "new in Gadit". Gadi gets
 * one short notice with the counts by language.
 *
 * Never before sendAt; no pass STARTS on Shabbat (Friday 15:00 to Saturday
 * 21:00 Israel time, lib/shabbat.ts) or at night (21:00 to 07:00 Israel
 * time); a user who failed 3 passes is left out.
 */
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import { ANNOUNCEMENTS, type Announcement } from "./announcements";
import { runAnnouncement, type RunAnnouncementResult } from "./announce-send";
import { isShabbatIL } from "@/lib/shabbat";
import { sendMail } from "@/lib/mail";

const MAX_TRIES = 3;
const PACE_MS = 550; // Resend: about two sends a second
const LOCK_MS = 330_000;

export function ilHour(at: Date = new Date()): number {
  const h = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jerusalem", hour: "numeric", hourCycle: "h23" }).format(at);
  return Number(h);
}

/** Why no automatic pass may start now, or null. */
export function autoSendBlocked(at: Date = new Date()): "shabbat" | "night" | null {
  if (isShabbatIL(at)) return "shabbat";
  const h = ilHour(at);
  if (h < 7 || h >= 21) return "night";
  return null;
}

export function dueAnnouncements(now: number): Announcement[] {
  return ANNOUNCEMENTS.filter((a) => a.approved === true && !!a.sendAt && Number.isFinite(Date.parse(a.sendAt)) && Date.parse(a.sendAt) <= now);
}

type RunState = {
  startedAt?: number;
  finishedAt?: number;
  lockUntil?: number;
  sent?: number;
  failed?: number;
  sentByLang?: Record<string, number>;
  failures?: Record<string, number>;
};

export type AutoPass = {
  id: string;
  sent: number;
  failed: number;
  pending: number;
  finished: boolean;
  counts: Record<string, number>;
};

function esc(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

async function notifyOwner(a: Announcement, st: RunState, res: RunAnnouncementResult, sentNow: Record<string, number>) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  const total: Record<string, number> = { ...(st.sentByLang ?? {}) };
  for (const [l, n] of Object.entries(sentNow)) total[l] = (total[l] ?? 0) + n;
  const sentAll = Object.values(total).reduce((x, y) => x + y, 0);
  const langLine = Object.entries(total).sort((x, y) => y[1] - x[1]).map(([l, n]) => `${l} ${n}`).join(" · ") || "0";
  const skipLang = Object.entries(res.byLang)
    .map(([l, m]) => [l, m.skip_lang ?? 0] as const)
    .filter(([, n]) => n > 0)
    .sort((x, y) => y[1] - x[1])
    .map(([l, n]) => `${l} ${n}`)
    .join(" · ");
  const c = (k: string) => res.counts[k] ?? 0;
  const lines = [
    `<p><b>${esc(a.id)}</b> (${esc(a.audience)}) נשלח לכולם, והסבב הסתיים.</p>`,
    `<p>נשלחו בסבב האוטומטי: <b>${sentAll}</b><br>לפי שפה: ${esc(langLine)}</p>`,
    `<p>כבר קיבלו קודם (כולל שליחה ידנית): ${Math.max(0, c("already") - (sentAll - Object.values(sentNow).reduce((x, y) => x + y, 0)))}<br>`,
    `דילגנו בגלל השפה: ${c("skip_lang")}${skipLang ? ` (${esc(skipLang)})` : ""}<br>`,
    `דילגנו כי כבר קיבלו את המייל בסדרה: ${c("skip_series")}<br>`,
    `דילגנו על משתמשי אפליקציית האייפון: ${c("skip_ios")}<br>`,
    `נכשלו ${MAX_TRIES} פעמים ולא נשלח להם: ${c("skip_failed")}</p>`,
  ];
  await sendMail({
    from: "Gadit <notify@gadit.app>",
    to,
    subject: `📣 ${a.id}: נשלח ל-${sentAll}`,
    html: `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7">${lines.join("")}</div>`,
  }).catch(() => {});
}

/** One automatic pass over every due announcement. `budgetMs` is how long
 *  the pass may keep starting sends. */
export async function runDueAnnouncements(db: Firestore, auth: Auth, opts: { now?: number; budgetMs: number }): Promise<{ blocked?: string; passes: AutoPass[] }> {
  const now = opts.now ?? Date.now();
  const blocked = autoSendBlocked(new Date(now));
  if (blocked) return { blocked, passes: [] };
  const deadline = now + opts.budgetMs;
  const passes: AutoPass[] = [];
  for (const a of dueAnnouncements(now)) {
    if (Date.now() > deadline) break;
    const ref = db.collection("announcementRuns").doc(a.id);
    const st = ((await ref.get()).data() ?? {}) as RunState;
    if (st.finishedAt) continue;
    if ((st.lockUntil ?? 0) > Date.now()) continue; // another pass is running
    await ref.set({ id: a.id, startedAt: st.startedAt ?? now, lastRunAt: now, runs: FieldValue.increment(1), lockUntil: Date.now() + LOCK_MS }, { merge: true });

    const failures = st.failures ?? {};
    const skipUids = new Set(Object.keys(failures).filter((u) => failures[u] >= MAX_TRIES));
    let res: RunAnnouncementResult;
    try {
      res = await runAnnouncement(db, auth, a, { send: true, deadline, paceMs: PACE_MS, skipUids });
    } catch (e) {
      await ref.set({ lockUntil: 0, lastError: String(e).slice(0, 500) }, { merge: true });
      console.error(`[announcements] ${a.id} failed: ${String(e)}`);
      continue;
    }

    const sentNow: Record<string, number> = {};
    const failUpd: Record<string, FieldValue> = {};
    let sent = 0, failed = 0;
    for (const r of res.rows) {
      if (r.status === "sent") { sent++; sentNow[r.lang] = (sentNow[r.lang] ?? 0) + 1; }
      else if (r.status.startsWith("failed")) { failed++; failUpd[r.uid] = FieldValue.increment(1); }
    }
    const pending = res.counts.pending ?? 0;
    // Finished when everyone was reached: nothing pending, and no failure
    // left to retry (a user who failed MAX_TRIES passes is left out).
    const finished = pending === 0 && failed === 0;
    const byLangInc: Record<string, FieldValue> = {};
    for (const [l, n] of Object.entries(sentNow)) byLangInc[l] = FieldValue.increment(n);
    await ref.set({
      lockUntil: 0,
      sent: FieldValue.increment(sent),
      failed: FieldValue.increment(failed),
      ...(Object.keys(byLangInc).length ? { sentByLang: byLangInc } : {}),
      ...(Object.keys(failUpd).length ? { failures: failUpd } : {}),
      lastPass: { at: now, counts: res.counts },
      ...(finished ? { finishedAt: Date.now(), final: { counts: res.counts, byLang: res.byLang } } : {}),
    }, { merge: true });

    const c = res.counts;
    console.log(`[announcements] ${a.id}: sent=${sent} failed=${failed} pending=${pending} already=${c.already ?? 0} skip_lang=${c.skip_lang ?? 0} skip_series=${c.skip_series ?? 0} skip_ios=${c.skip_ios ?? 0} finished=${finished}`);
    if (finished) await notifyOwner(a, st, res, sentNow);
    passes.push({ id: a.id, sent, failed, pending, finished, counts: res.counts });
    if (pending > 0) break; // out of time: the next hourly pass goes on
  }
  return { passes };
}
