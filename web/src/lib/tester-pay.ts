import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Testers' pay (Gadi 2026-11-02): Osher and Din earn Yoon (the Yooniz coin)
 * for what they DO in Gadit, counted from their own actions only:
 *   - a test run: rating a game with 🧪 after playing 5+ rounds that day, once per game a day   5
 *   - a bug Gadi approved                                                                      10
 *   - an idea Gadi liked                                                                        5
 *   - a recorded note pays x1.5 (a bug 15, an idea 8)
 *   - an idea that was built                                                                   +50
 *   - team bonus: both found different things in the same game this week                     +5 each
 * Weekly cap 150; 10% goes to the family pot; the rest is paid in Yooniz.
 * The week runs Sunday to Saturday, Israel time.
 */

export const PAY = { run: 5, bug: 10, idea: 5, built: 50, team: 5, voiceX: 1.5, cap: 150, tax: 0.1, runRounds: 5 } as const;
const RATINGS = new Set(["fun", "boring", "hard", "easy"]);

export type PayRow = {
  id: string; day: string; type: "run" | "bug" | "idea" | "built" | "team" | "note";
  game: string; word: string; text: string; audio: boolean; ticket: number | null;
  yoon: number; state: "paid" | "pending" | "no"; need?: number;
};
export type PaySlip = {
  uid: string; name: string; week: string; rows: PayRow[];
  earned: number; capped: boolean; tax: number; net: number; pending: number;
  level: { key: "junior" | "tester" | "senior" | "lead"; tickets: number; next: number | null };
  shipped: { id: string; type: "bug" | "idea"; game: string; text: string; day: string }[];
  paid: { at: number; net: number } | null;
};

const IL = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" });
export const ilDay = (d: Date) => IL.format(d);
const addDays = (day: string, n: number) => { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
/** The Sunday that starts the week of `d` (Israel time). */
export function weekOf(d = new Date()): string {
  const day = ilDay(d);
  const wd = new Date(`${day}T12:00:00Z`).getUTCDay();
  return addDays(day, -wd);
}
export const weekEnd = (week: string) => addDays(week, 7);

type Note = { id: string; uid: string; game: string; kind: string; word: string; transcript: string; audio: boolean; status: string; payAs: string | null; day: string; atMs: number };

async function notesOf(uid: string): Promise<Note[]> {
  const snap = await getAdminDb().collection("testerFeedback").where("uid", "==", uid).get();
  return snap.docs.map((x) => {
    const d = x.data();
    const at: Date = d.at?.toDate?.() ?? new Date(0);
    return { id: x.id, uid, game: d.game ?? "", kind: d.kind ?? "", word: d.word ?? "", transcript: d.transcript ?? "", audio: !!d.audioPath, status: d.status ?? "new", payAs: d.payAs ?? null, day: ilDay(at), atMs: at.getTime() };
  }).sort((a, b) => a.atMs - b.atMs);
}

/** Rounds played per day this week (the kid's activity log). */
async function roundsByDay(uid: string, week: string): Promise<Record<string, number>> {
  const cut = uid.indexOf("_");
  if (cut < 0) return {};
  const fid = uid.slice(0, cut), mid = uid.slice(cut + 1);
  const from = `${addDays(week, -1)}T00:00:00.000Z`;
  const snap = await getAdminDb().collection("families").doc(fid).collection("kidActivity").where("at", ">=", from).get();
  const out: Record<string, number> = {};
  const end = weekEnd(week);
  for (const x of snap.docs) {
    const d = x.data();
    if (d.memberId !== mid) continue;
    const day = ilDay(new Date(d.at));
    if (day < week || day >= end) continue;
    out[day] = (out[day] ?? 0) + 1;
  }
  return out;
}

/** What a note pays as: the type Gadi chose, else what the child pressed. */
const payType = (n: Note): "bug" | "idea" | null => (n.payAs === "bug" || n.payAs === "idea" ? n.payAs : n.kind === "bug" ? "bug" : n.kind === "idea" ? "idea" : null);
const isPaidStatus = (s: string) => s === "approved" || s === "liked" || s === "done";

export async function nameOf(uid: string): Promise<string> {
  const db = getAdminDb();
  const cut = uid.indexOf("_");
  if (cut > 0) {
    const m = (await db.doc(`families/${uid.slice(0, cut)}/members/${uid.slice(cut + 1)}`).get()).data();
    if (m?.name) return String(m.name);
  }
  const u = (await db.collection("users").doc(uid).get()).data();
  return String(u?.displayName ?? u?.email ?? uid);
}

/** The pay slips of a week for these testers (team bonus needs them all). */
export async function paySlips(uids: string[], week: string): Promise<PaySlip[]> {
  const end = weekEnd(week);
  const today = ilDay(new Date());
  const all = await Promise.all(uids.map(async (uid) => ({ uid, name: await nameOf(uid), notes: await notesOf(uid), rounds: await roundsByDay(uid, week) })));
  // games where each tester has a paid bug or idea this week
  const paidGames = new Map<string, Set<string>>();
  for (const t of all) for (const n of t.notes) {
    if (n.day < week || n.day >= end || !payType(n) || !isPaidStatus(n.status)) continue;
    if (!paidGames.has(t.uid)) paidGames.set(t.uid, new Set());
    paidGames.get(t.uid)!.add(n.game);
  }
  const db = getAdminDb();
  return Promise.all(all.map(async (t) => {
    const rows: PayRow[] = [];
    const ticketOf = new Map(t.notes.filter((n) => payType(n) || n.kind === "voice").map((n, i) => [n.id, i + 1]));
    const seenRun = new Set<string>();
    for (const n of t.notes) {
      if (n.day < week || n.day >= end) continue;
      const text = n.transcript || n.word;
      if (RATINGS.has(n.kind)) {
        const key = `${n.day}:${n.game}`;
        if (seenRun.has(key)) continue;
        seenRun.add(key);
        const played = t.rounds[n.day] ?? 0;
        const ok = played >= PAY.runRounds;
        rows.push({ id: n.id, day: n.day, type: "run", game: n.game, word: n.word, text: "", audio: false, ticket: null, yoon: ok ? PAY.run : 0, state: ok ? "paid" : n.day === today ? "pending" : "no", ...(ok ? {} : { need: PAY.runRounds - played }) });
        continue;
      }
      const pt = payType(n);
      if (!pt && n.kind !== "voice") continue;
      const base = pt === "bug" ? PAY.bug : PAY.idea;
      const yoon = Math.ceil(base * (n.audio ? PAY.voiceX : 1));
      const state: PayRow["state"] = n.status === "skip" ? "no" : isPaidStatus(n.status) && pt ? "paid" : "pending";
      rows.push({ id: n.id, day: n.day, type: pt ?? "note", game: n.game, word: n.word, text, audio: n.audio, ticket: ticketOf.get(n.id) ?? null, yoon: pt && state !== "no" ? yoon : 0, state });
      if (pt === "idea" && n.status === "done") rows.push({ id: `${n.id}-built`, day: n.day, type: "built", game: n.game, word: n.word, text, audio: false, ticket: ticketOf.get(n.id) ?? null, yoon: PAY.built, state: "paid" });
    }
    // team bonus: a game where the others found something too
    const mine = paidGames.get(t.uid) ?? new Set<string>();
    for (const g of mine) {
      const others = [...paidGames.entries()].some(([u, gs]) => u !== t.uid && gs.has(g));
      if (others) rows.push({ id: `team-${g}`, day: week, type: "team", game: g, word: "", text: "", audio: false, ticket: null, yoon: PAY.team, state: "paid" });
    }
    rows.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
    const sum = rows.filter((r) => r.state === "paid").reduce((s, r) => s + r.yoon, 0);
    const earned = Math.min(PAY.cap, sum);
    const tax = Math.round(earned * PAY.tax);
    const pending = rows.filter((r) => r.state === "pending").reduce((s, r) => s + r.yoon, 0);
    const tickets = t.notes.filter((n) => payType(n) && isPaidStatus(n.status)).length;
    const lv = tickets >= 30 ? "lead" : tickets >= 15 ? "senior" : tickets >= 5 ? "tester" : "junior";
    const next = lv === "junior" ? 5 : lv === "tester" ? 15 : lv === "senior" ? 30 : null;
    const shipped = t.notes.filter((n) => n.status === "done" && payType(n)).slice(-6).reverse()
      .map((n) => ({ id: n.id, type: payType(n)!, game: n.game, text: n.transcript || n.word, day: n.day }));
    const pr = (await db.collection("testerPayroll").doc(`${t.uid}_${week}`).get()).data();
    return {
      uid: t.uid, name: t.name, week, rows, earned, capped: sum > PAY.cap, tax, net: earned - tax, pending,
      level: { key: lv, tickets, next }, shipped,
      paid: pr?.paidAt ? { at: Number(pr.paidAt), net: Number(pr.net ?? 0) } : null,
    } satisfies PaySlip;
  }));
}

/** Every child tester (users.tester and a kid profile). */
export async function kidTesters(): Promise<string[]> {
  const snap = await getAdminDb().collection("users").where("tester", "==", true).get();
  return snap.docs.filter((d) => d.id.includes("_")).map((d) => d.id);
}

export async function markPaid(uid: string, week: string, net: number): Promise<void> {
  await getAdminDb().collection("testerPayroll").doc(`${uid}_${week}`).set({ uid, week, net, paidAt: Date.now(), at: Timestamp.now() }, { merge: true });
}
