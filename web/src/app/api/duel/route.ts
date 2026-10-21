import { kidOf, recordKidActivity } from "@/lib/kid-activity";
import { recordPractice } from "@/lib/rank-points";
import { practiceDayFrom, recordPracticeDay } from "@/lib/practice-days";
import { NextRequest, NextResponse } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import {
  COUNTDOWN_MS, DUEL_ROUNDS, DUEL_TTL_MS, ROUND_MS,
  botScript, cleanQuestions, newDuelCode, nicknameFor, scriptedAt, seatResult, timeline, topicQuestions,
  shuffleDuel,
  type DuelAnswer, type DuelMode, type DuelPlayerPublic, type DuelQuestion, type DuelStatRow, type DuelView, type DuelVsRow, type ScriptStep, type Seat,
} from "@/lib/duel";

/**
 * Word Duel (Gadi 2026-10-11). Server-authoritative: questions, answer times
 * and scores live on duels/{code}; both screens poll GET and post answers.
 *
 *   GET  ?code=…            the caller's view of the room
 *   GET  ?permission=1      family owner: may the kids play online?
 *   POST {action:"create", questions?|topic, lang}   invite room → {code}
 *   POST {action:"join", code}                        second player sits, countdown starts
 *   POST {action:"answer", code, round, choice}
 *   POST {action:"queue", lang} / {action:"poll", ticket} / {action:"cancel", ticket}
 *                                                     match with whoever is online now
 *   POST {action:"ghost", lang}                       nobody online: a recorded game or the computer
 *   POST {action:"permission", allow}                 family owner sets the kids' online permission
 *
 * Online matches use our curated word sets only, show nicknames only, and a
 * kid needs the parent's permission to be matched with other kids.
 */

export const dynamic = "force-dynamic";

const DUELS = "duels";
const QUEUE = "duelQueue";
const RUNS = "duelRuns";
const QUEUE_FRESH_MS = 12_000; // a waiting player who stopped polling is gone

type PlayerDoc = {
  uid: string;
  name: string;
  avatar: string | null;
  kind: "person" | "ghost" | "bot";
  familyKey: string;
  band: "kid" | "adult";
  script?: ScriptStep[];
};
type DuelDoc = {
  code: string;
  mode: DuelMode;
  lang: string;
  bucket?: string;
  createdAt: number;
  startAt: number | null;
  questions: DuelQuestion[];
  players: { a: PlayerDoc; b: PlayerDoc | null };
  answers: Record<Seat, DuelAnswer[]>;
  archived?: boolean;
  /** Where the questions came from, so a rematch can make new ones. */
  source?: "own" | "topic";
  /** "Play again": the new room and who asked first. */
  rematch?: { code: string; by: Seat };
  rematchOf?: string;
  /** In a rematch room: who said yes (it starts when both did). */
  ready?: Partial<Record<Seat, boolean>>;
};

type Me = {
  uid: string;
  name: string;
  avatar: string | null;
  band: "kid" | "adult";
  familyKey: string; // one key per household, so we never match a family with itself
  familyId: string | null;
  isKid: boolean;
  plan: string;
};

/** Just the signed-in uid: all a poll or an answer needs (one local check, no reads). */
async function authToken(req: NextRequest): Promise<DecodedIdToken | null> {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  try { return await getAdminAuth().verifyIdToken(token); } catch { return null; }
}

async function whoAmI(req: NextRequest, decoded?: DecodedIdToken | null): Promise<Me | null> {
  const d = decoded ?? (await authToken(req));
  if (!d) return null;
  const db = getAdminDb();
  const uid = d.uid;
  const userDoc = await db.collection("users").doc(uid).get();
  const plan = String(userDoc.get("plan") ?? "basic");
  const famClaim = typeof d.familyId === "string" ? d.familyId : null;
  const memberClaim = typeof d.memberId === "string" ? d.memberId : null;
  let name = "";
  let avatar: string | null = null;
  let band: "kid" | "adult" = "adult";
  let familyId: string | null = famClaim;
  if (famClaim && memberClaim) {
    const m = await db.collection("families").doc(famClaim).collection("members").doc(memberClaim).get();
    name = String(m.get("name") ?? "");
    avatar = (m.get("avatarId") as string | null) ?? null;
    const role = String(m.get("role") ?? "");
    band = role === "boy" || role === "girl" || d.role === "kid" ? "kid" : "adult";
  } else {
    const fam = await db.collection("families").doc(uid).get();
    if (fam.exists) {
      familyId = uid;
      const own = await db.collection("families").doc(uid).collection("members").where("isOwner", "==", true).limit(1).get();
      if (!own.empty) { name = String(own.docs[0].get("name") ?? ""); avatar = (own.docs[0].get("avatarId") as string | null) ?? null; }
    }
    if (!name) {
      const dn = (await getAdminAuth().getUser(uid).catch(() => null))?.displayName ?? "";
      name = dn.trim().split(/\s+/)[0] ?? "";
    }
  }
  return {
    uid,
    name: name.trim().slice(0, 20),
    avatar,
    band,
    familyKey: familyId ?? uid,
    familyId,
    isKid: band === "kid",
    plan,
  };
}

const isPaid = (me: Me) => me.plan !== "basic";

/** May this player be matched with strangers (live or recorded)? Kids need the parent's yes. */
async function mayPlayOnline(me: Me): Promise<boolean> {
  if (!me.isKid) return true;
  if (!me.familyId) return false;
  const fam = await getAdminDb().collection("families").doc(me.familyId).get();
  return fam.get("allowOnlineDuels") === true;
}

// ─── Views ──────────────────────────────────────────────────────────

const scriptsOf = (d: DuelDoc): Partial<Record<Seat, ScriptStep[]>> => ({
  ...(d.players.a.script ? { a: d.players.a.script } : {}),
  ...(d.players.b?.script ? { b: d.players.b.script } : {}),
});

function publicPlayer(p: PlayerDoc, mode: DuelMode, lang: string): DuelPlayerPublic {
  // Online and recorded opponents are never shown by name.
  const name = mode === "invite" && p.kind === "person" ? (p.name || (lang === "he" ? "שחקן" : "Player")) : p.name;
  return { name, avatar: p.avatar, kind: p.kind };
}

function viewFor(d: DuelDoc, seat: Seat, now: number): DuelView {
  const scripts = scriptsOf(d);
  const total = d.questions.length;
  const { phase, starts } = timeline(d.startAt, total, d.answers, scripts, now);
  const scores: Record<Seat, number> = { a: 0, b: 0 };
  // Score every round that is over (a running round counts once revealed).
  const lastDone = phase.kind === "done" ? total - 1 : phase.kind === "reveal" ? phase.round : phase.kind === "round" ? phase.round - 1 : -1;
  for (let r = 0; r <= lastDone; r++) {
    for (const s of ["a", "b"] as Seat[]) scores[s] += seatResult(s, r, d.questions[r], starts[r], d.answers, scripts, now).points;
  }
  const v: DuelView = {
    code: d.code,
    mode: d.mode,
    you: seat,
    players: { a: publicPlayer(d.players.a, d.mode, d.lang), b: d.players.b ? publicPlayer(d.players.b, d.mode, d.lang) : null },
    scores,
    total,
    phase,
    serverNow: now,
    question: null,
    answered: { a: false, b: false },
  };
  if (phase.kind === "round") {
    const q = d.questions[phase.round];
    v.question = { prompt: q.prompt, options: q.options };
    for (const s of ["a", "b"] as Seat[]) {
      const sc = scripts[s]?.[phase.round];
      if (sc) { const at = scriptedAt(s, phase.round, phase.startedAt, d.answers, scripts); v.answered[s] = at != null && at <= now && sc.ms < ROUND_MS; }
      else v.answered[s] = !!d.answers[s]?.[phase.round];
    }
  }
  if (phase.kind === "reveal") {
    const q = d.questions[phase.round];
    v.question = { prompt: q.prompt, options: q.options, correctIdx: q.correctIdx };
    v.reveal = {
      correctIdx: q.correctIdx,
      a: seatResult("a", phase.round, q, starts[phase.round], d.answers, scripts, now),
      b: seatResult("b", phase.round, q, starts[phase.round], d.answers, scripts, now),
    };
  }
  if (d.rematch) v.rematch = { code: d.rematch.code, mine: d.rematch.by === seat };
  if (d.rematchOf) v.rematchOf = true;
  if (phase.kind === "done") {
    v.recap = d.questions.map((q, r) => {
      const ra = seatResult("a", r, q, starts[r], d.answers, scripts, now);
      const rb = seatResult("b", r, q, starts[r], d.answers, scripts, now);
      return {
        prompt: q.prompt,
        answer: q.options[q.correctIdx],
        correctIdx: q.correctIdx,
        a: ra.choice, b: rb.choice,
        aText: ra.choice == null ? null : q.options[ra.choice] ?? null,
        bText: rb.choice == null ? null : q.options[rb.choice] ?? null,
        aPoints: ra.points, bPoints: rb.points,
      };
    });
  }
  return v;
}

/** After an online or recorded game: keep each person's run as a future recorded opponent. */
async function archive(d: DuelDoc, now: number) {
  if (d.mode === "invite" || !d.bucket) return;
  const db = getAdminDb();
  const scripts = scriptsOf(d);
  const { starts } = timeline(d.startAt, d.questions.length, d.answers, scripts, now);
  for (const s of ["a", "b"] as Seat[]) {
    const p = d.players[s];
    if (!p || p.kind !== "person") continue;
    const script: ScriptStep[] = d.questions.map((_, r) => {
      const a = d.answers[s]?.[r];
      return a ? { choice: a.choice, ms: Math.max(0, a.at - starts[r]) } : { choice: -1, ms: ROUND_MS };
    });
    if (script.every((x) => x.choice < 0)) continue; // left without playing
    await db.collection(RUNS).add({
      bucket: d.bucket, questions: d.questions, script,
      name: p.name, avatar: p.avatar, uid: p.uid, familyKey: p.familyKey, at: now,
    });
  }
}

const STATS = "duelStats";

/** Who won, by final score. */
function finalScores(d: DuelDoc, now: number): Record<Seat, number> {
  const scripts = scriptsOf(d);
  const { starts } = timeline(d.startAt, d.questions.length, d.answers, scripts, now);
  const out: Record<Seat, number> = { a: 0, b: 0 };
  d.questions.forEach((q, r) => {
    for (const s of ["a", "b"] as Seat[]) out[s] += seatResult(s, r, q, starts[r], d.answers, scripts, now).points;
  });
  return out;
}

/** The wins table: one doc per player, totals against people (and
 *  recorded games of people), and a record against each opponent. Games
 *  against Word Bot are kept apart so they never fill the family table. */
async function recordStats(d: DuelDoc, now: number) {
  if (!d.players.b) return;
  const db = getAdminDb();
  const sc = finalScores(d, now);
  const inc = (n: number) => FieldValue.increment(n);
  for (const s of ["a", "b"] as Seat[]) {
    const p = d.players[s];
    const o = d.players[s === "a" ? "b" : "a"];
    if (!p || !o || p.kind !== "person") continue;
    // Didn't answer a single question: left the game, not a result.
    if (!(d.answers[s] ?? []).some(Boolean)) continue;
    const res = sc[s] > sc[s === "a" ? "b" : "a"] ? "w" : sc[s] < sc[s === "a" ? "b" : "a"] ? "l" : "t";
    const oppKey = o.kind === "person" ? o.uid : o.kind === "bot" ? "bot" : "ghost";
    const shown = publicPlayer(o, d.mode, d.lang);
    const human = o.kind !== "bot";
    await db.collection(STATS).doc(p.uid).set({
      ...(d.mode === "invite" && p.name ? { name: p.name } : {}), avatar: p.avatar, familyKey: p.familyKey, updatedAt: now,
      ...(human ? { games: inc(1), wins: inc(res === "w" ? 1 : 0), losses: inc(res === "l" ? 1 : 0), ties: inc(res === "t" ? 1 : 0) } : { botGames: inc(1), botWins: inc(res === "w" ? 1 : 0) }),
      vs: { [oppKey.replace(/[.$/[\]#]/g, "_")]: { name: shown.name, avatar: shown.avatar, kind: o.kind, w: inc(res === "w" ? 1 : 0), l: inc(res === "l" ? 1 : 0), t: inc(res === "t" ? 1 : 0), at: now } },
    }, { merge: true });
  }
}

/** A duel between people ended: each child's parent hears who played and
 *  the score (Gadi 2026-10-12: "the two siblings played each other and who
 *  won"). One alert per family, even when both players are its children. */
async function tellParents(d: DuelDoc, now: number) {
  if (!d.players.b) return;
  const sc = finalScores(d, now);
  const seats: Seat[] = ["a", "b"];
  const kids = await Promise.all(seats.map((s) => {
    const p = d.players[s];
    return p && p.kind === "person" && (d.answers[s] ?? []).some(Boolean) ? kidOf(p.uid) : Promise.resolve(null);
  }));
  const nameOf = (i: number) => kids[i]?.kidName ?? publicPlayer(d.players[seats[i]]!, d.mode, d.lang).name;
  const label = `${nameOf(0)} ${sc.a} : ${sc.b} ${nameOf(1)}`;
  const told = new Set<string>();
  for (let i = 0; i < 2; i++) {
    const k = kids[i];
    if (!k || told.has(k.ownerUid)) continue;
    told.add(k.ownerUid);
    // Same family, two children: name the winner as the one who finished.
    const both = kids[1 - i]?.ownerUid === k.ownerUid;
    const who = both && sc.a !== sc.b ? kids[sc.a > sc.b ? 0 : 1]! : k;
    await recordKidActivity(who, "duel", { label });
  }
}

/** A finished duel is a completed practice for each person who played in it
 *  (Gadi 2026-10-21, lib/rank-points: 10 points, at most 10 a day). */
async function countPractice(d: DuelDoc, now: number) {
  const day = practiceDayFrom(undefined, now);
  for (const s of ["a", "b"] as Seat[]) {
    const p = d.players[s];
    if (!p || p.kind !== "person" || !(d.answers[s] ?? []).some(Boolean)) continue;
    await recordPracticeDay(p.uid, day).catch(() => {});
    await recordPractice(p.uid, day);
  }
}

function seatOf(d: DuelDoc, uid: string): Seat | null {
  if (d.players.a.uid === uid) return "a";
  if (d.players.b?.uid === uid) return "b";
  return null;
}

async function createRoom(doc: Omit<DuelDoc, "code">): Promise<string> {
  const db = getAdminDb();
  for (let i = 0; i < 8; i++) {
    const code = newDuelCode();
    const ref = db.collection(DUELS).doc(code);
    const ok = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists && Date.now() - Number(snap.get("createdAt") ?? 0) < DUEL_TTL_MS) return false;
      tx.set(ref, { ...doc, code });
      return true;
    });
    if (ok) return code;
  }
  throw new Error("no_code");
}

function personDoc(me: Me, mode: DuelMode, lang: string): PlayerDoc {
  const anonymous = mode !== "invite";
  return {
    uid: me.uid,
    name: anonymous ? nicknameFor(me.uid, lang) : me.name,
    avatar: me.avatar,
    kind: "person",
    familyKey: me.familyKey,
    band: me.band,
  };
}

const bucketOf = (lang: string, me: Me) => `${lang}-${me.band}`;
const emptyAnswers = (): Record<Seat, DuelAnswer[]> => ({ a: [], b: [] });

// ─── Handlers ───────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const tok = await authToken(req);
  if (!tok) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const db = getAdminDb();
  if (req.nextUrl.searchParams.get("permission") === "1") {
    const me = await whoAmI(req, tok);
    if (!me) return NextResponse.json({ error: "login_required" }, { status: 401 });
    if (me.isKid || !me.familyId) return NextResponse.json({ allow: false, owner: false });
    const fam = await db.collection("families").doc(me.familyId).get();
    return NextResponse.json({ allow: fam.get("allowOnlineDuels") === true, owner: me.familyId === me.uid });
  }
  if (req.nextUrl.searchParams.get("stats") === "1") {
    const me = await whoAmI(req, tok);
    if (!me) return NextResponse.json({ error: "login_required" }, { status: 401 });
    // The family: the owner and every member with a device.
    const people: Array<{ uid: string; name: string; avatar: string | null }> = [];
    if (me.familyId) {
      const members = await db.collection("families").doc(me.familyId).collection("members").get();
      for (const m of members.docs) {
        const uid = m.get("isOwner") ? me.familyId : (m.get("userId") as string | null);
        if (uid) people.push({ uid, name: String(m.get("name") ?? ""), avatar: (m.get("avatarId") as string | null) ?? null });
      }
    }
    if (!people.some((p) => p.uid === me.uid)) people.push({ uid: me.uid, name: me.name, avatar: me.avatar });
    const snaps = await db.getAll(...people.map((p) => db.collection(STATS).doc(p.uid)));
    const rows: DuelStatRow[] = people.map((p, i) => {
      const x = snaps[i].data() ?? {};
      return { name: p.name || String(x.name ?? ""), avatar: p.avatar ?? (x.avatar as string | null) ?? null,
        wins: Number(x.wins ?? 0), losses: Number(x.losses ?? 0), ties: Number(x.ties ?? 0), games: Number(x.games ?? 0), isMe: p.uid === me.uid };
    }).sort((a, b) => b.wins - a.wins || b.games - a.games);
    const mine = snaps[people.findIndex((p) => p.uid === me.uid)]?.data() ?? {};
    const vs: DuelVsRow[] = Object.values((mine.vs ?? {}) as Record<string, DuelVsRow>)
      .map((v) => ({ name: String(v.name ?? ""), avatar: v.avatar ?? null, kind: v.kind ?? "person", w: Number(v.w ?? 0), l: Number(v.l ?? 0), t: Number(v.t ?? 0), at: Number(v.at ?? 0) }))
      .sort((a, b) => b.at - a.at)
      .slice(0, 12);
    return NextResponse.json({ rows, vs, bot: { games: Number(mine.botGames ?? 0), wins: Number(mine.botWins ?? 0) } });
  }
  const code = (req.nextUrl.searchParams.get("code") ?? "").replace(/\D/g, "");
  if (!code) return NextResponse.json({ error: "code_required" }, { status: 400 });
  const snap = await db.collection(DUELS).doc(code).get();
  if (!snap.exists) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const d = snap.data() as DuelDoc;
  const now = Date.now();
  if (now - d.createdAt > DUEL_TTL_MS) return NextResponse.json({ error: "expired" }, { status: 410 });
  const seat = seatOf(d, tok.uid);
  if (!seat) {
    // Not seated yet: enough to show the invite screen.
    return NextResponse.json({ invite: true, host: publicPlayer(d.players.a, d.mode, d.lang), full: !!d.players.b, mode: d.mode });
  }
  const view = viewFor(d, seat, now);
  if (view.phase.kind === "done" && !d.archived) {
    // Exactly once per game, however many screens are polling.
    const claimed = await db.runTransaction(async (tx) => {
      const s = await tx.get(snap.ref);
      if (s.get("archived")) return false;
      tx.update(snap.ref, { archived: true });
      return true;
    });
    if (claimed) {
      await recordStats(d, now).catch(() => { /* the table is a bonus, never a failure */ });
      void tellParents(d, now).catch(() => { /* an alert is a bonus, never a failure */ });
      void countPractice(d, now).catch(() => { /* points are a bonus, never a failure */ });
      void archive(d, now).catch(() => { /* a recorded opponent is a bonus, never a failure */ });
    }
  }
  return NextResponse.json(view);
}

export async function POST(req: NextRequest) {
  const tok = await authToken(req);
  if (!tok) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "");
  // A poll of the online queue and an answer need no profile.
  const me = action === "answer" || action === "poll" || action === "cancel"
    ? ({ uid: tok.uid } as Me)
    : await whoAmI(req, tok);
  if (!me) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const lang = typeof body.lang === "string" ? body.lang.slice(0, 8) : "he";
  const db = getAdminDb();
  const now = Date.now();

  if (action === "permission") {
    if (me.isKid || !me.familyId || me.familyId !== me.uid) return NextResponse.json({ error: "not_family_owner" }, { status: 403 });
    await db.collection("families").doc(me.familyId).set({ allowOnlineDuels: body.allow === true, allowOnlineDuelsAt: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ ok: true, allow: body.allow === true });
  }

  if (action === "create") {
    if (!isPaid(me)) return NextResponse.json({ error: "plan_required" }, { status: 403 });
    const own = cleanQuestions(body.questions);
    const questions = own ?? (typeof body.topic === "string" ? topicQuestions(body.topic === "all" ? undefined : body.topic) : null);
    if (!questions || questions.length < 3) return NextResponse.json({ error: "no_questions" }, { status: 400 });
    const code = await createRoom({
      mode: "invite", lang, createdAt: now, startAt: null, questions, source: own ? "own" : "topic",
      players: { a: personDoc(me, "invite", lang), b: null }, answers: emptyAnswers(),
    });
    return NextResponse.json({ code });
  }

  if (action === "join") {
    const code = String(body.code ?? "").replace(/\D/g, "");
    const ref = db.collection(DUELS).doc(code);
    const res = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return { error: "not_found", status: 404 };
      const d = snap.data() as DuelDoc;
      if (now - d.createdAt > DUEL_TTL_MS) return { error: "expired", status: 410 };
      if (seatOf(d, me.uid)) return { ok: true };
      if (d.players.b) return { error: "full", status: 409 };
      tx.update(ref, { "players.b": personDoc(me, d.mode, d.lang), startAt: now + COUNTDOWN_MS });
      return { ok: true };
    });
    return NextResponse.json(res, { status: "status" in res ? res.status : 200 });
  }

  if (action === "rematch") {
    const oldCode = String(body.code ?? "").replace(/\D/g, "");
    const oldRef = db.collection(DUELS).doc(oldCode);
    const res = await db.runTransaction(async (tx) => {
      const snap = await tx.get(oldRef);
      if (!snap.exists) return { error: "not_found", status: 404 };
      const d = snap.data() as DuelDoc;
      const seat = seatOf(d, me.uid);
      if (!seat || !d.players.b) return { error: "not_in_game", status: 403 };
      if (d.players.a.kind !== "person" || d.players.b.kind !== "person") return { error: "not_people", status: 400 };
      if (timeline(d.startAt, d.questions.length, d.answers, scriptsOf(d), now).phase.kind !== "done") return { error: "not_done", status: 409 };
      if (d.rematch) {
        // The other player already asked: say yes, and the game starts.
        const nref = db.collection(DUELS).doc(d.rematch.code);
        const n = await tx.get(nref);
        if (!n.exists) return { error: "not_found", status: 404 };
        const ready = { ...((n.get("ready") as Partial<Record<Seat, boolean>>) ?? {}), [seat]: true };
        tx.update(nref, { ready, ...(ready.a && ready.b && !n.get("startAt") ? { startAt: now + COUNTDOWN_MS } : {}) });
        return { code: d.rematch.code };
      }
      // First to ask: open the next room with the same two players.
      let code = "";
      for (let i = 0; i < 6 && !code; i++) {
        const c = newDuelCode();
        const e = await tx.get(db.collection(DUELS).doc(c));
        if (!e.exists || now - Number(e.get("createdAt") ?? 0) > DUEL_TTL_MS) code = c;
      }
      if (!code) return { error: "no_code", status: 503 };
      // New questions from the topics; the host's own words come back in a new order.
      const questions = d.source === "own"
        ? shuffleDuel(d.questions).map((q) => { const opts = shuffleDuel(q.options); return { prompt: q.prompt, options: opts, correctIdx: opts.indexOf(q.options[q.correctIdx]) }; })
        : topicQuestions();
      const next: DuelDoc = {
        code, mode: d.mode, lang: d.lang, ...(d.bucket ? { bucket: d.bucket } : {}), createdAt: now, startAt: null, questions,
        source: d.source ?? "topic", players: d.players, answers: emptyAnswers(), rematchOf: d.code, ready: { [seat]: true },
      };
      tx.set(db.collection(DUELS).doc(code), next);
      tx.update(oldRef, { rematch: { code, by: seat } });
      return { code };
    });
    return NextResponse.json(res, { status: "status" in res ? res.status : 200 });
  }

  if (action === "answer") {
    const code = String(body.code ?? "").replace(/\D/g, "");
    const round = Number(body.round);
    const choice = Number(body.choice);
    const ref = db.collection(DUELS).doc(code);
    const res = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return { error: "not_found", status: 404 };
      const d = snap.data() as DuelDoc;
      const seat = seatOf(d, me.uid);
      if (!seat) return { error: "not_in_game", status: 403 };
      const { phase } = timeline(d.startAt, d.questions.length, d.answers, scriptsOf(d), now);
      if (phase.kind !== "round" || phase.round !== round) return { error: "round_closed", status: 409 };
      const q = d.questions[round];
      if (!Number.isInteger(choice) || choice < 0 || choice >= q.options.length) return { error: "bad_choice", status: 400 };
      if (d.answers[seat]?.[round]) return { ok: true }; // first answer counts
      const arr: DuelAnswer[] = [...(d.answers[seat] ?? [])];
      while (arr.length < round) arr.push(null);
      arr[round] = { choice, at: now };
      tx.update(ref, { [`answers.${seat}`]: arr });
      return { ok: true };
    });
    return NextResponse.json(res, { status: "status" in res ? res.status : 200 });
  }

  if (action === "queue" || action === "poll" || action === "cancel") {
    if (action === "queue") {
      if (!isPaid(me)) return NextResponse.json({ error: "plan_required" }, { status: 403 });
      if (!(await mayPlayOnline(me))) return NextResponse.json({ error: "parent_permission" }, { status: 403 });
    }
    if (lang !== "he") return NextResponse.json({ error: "lang_unsupported" }, { status: 400 });
    // The ticket names its bucket, so a poll needs no profile.
    const bucket = action === "queue" ? bucketOf(lang, me) : String(body.bucket ?? "");
    if (!/^he-(kid|adult)$/.test(bucket)) return NextResponse.json({ error: "bad_bucket" }, { status: 400 });
    const ref = db.collection(QUEUE).doc(bucket);
    const ticket = typeof body.ticket === "string" ? body.ticket.slice(0, 40) : "";
    const res = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const q = (snap.data() ?? {}) as { waiting?: { uid: string; ticket: string; at: number; player: PlayerDoc } | null; matched?: Record<string, { code: string; at: number }> };
      const matched = Object.fromEntries(Object.entries(q.matched ?? {}).filter(([, m]) => now - m.at < 120_000));
      const waiting = q.waiting && now - q.waiting.at < QUEUE_FRESH_MS ? q.waiting : null;
      if (action === "cancel") {
        if (waiting?.ticket === ticket) tx.set(ref, { waiting: null, matched }, { merge: false });
        return { ok: true };
      }
      if (action === "poll") {
        if (ticket && matched[ticket]) return { code: matched[ticket].code };
        if (waiting?.ticket === ticket) { tx.set(ref, { waiting: { ...waiting, at: now }, matched }); return { waiting: true, ticket, bucket }; }
        return { gone: true };
      }
      // queue: pair with whoever is waiting from another household, else wait.
      if (waiting && waiting.uid !== me.uid && waiting.player.familyKey !== me.familyKey) {
        const code = newDuelCode();
        const questions = topicQuestions();
        const duel: DuelDoc = {
          code, mode: "online", lang, bucket, createdAt: now, startAt: now + COUNTDOWN_MS, questions,
          players: { a: waiting.player, b: personDoc(me, "online", lang) }, answers: emptyAnswers(),
        };
        tx.set(db.collection(DUELS).doc(code), duel);
        tx.set(ref, { waiting: null, matched: { ...matched, [waiting.ticket]: { code, at: now } } });
        return { code };
      }
      const t = waiting?.uid === me.uid ? waiting.ticket : `${me.uid.slice(0, 8)}-${now.toString(36)}`;
      tx.set(ref, { waiting: { uid: me.uid, ticket: t, at: now, player: personDoc(me, "online", lang) }, matched });
      return { waiting: true, ticket: t, bucket };
    });
    return NextResponse.json(res);
  }

  if (action === "ghost") {
    if (!isPaid(me)) return NextResponse.json({ error: "plan_required" }, { status: 403 });
    const bucket = bucketOf(lang, me);
    let opponent: PlayerDoc | null = null;
    let questions: DuelQuestion[] | null = null;
    // A recorded game of another household, only when this player may meet other players.
    if (lang === "he" && body.bot !== true && (await mayPlayOnline(me))) {
      const runs = await db.collection(RUNS).where("bucket", "==", bucket).limit(40).get();
      const pool = runs.docs.map((r) => r.data()).filter((r) => r.familyKey !== me.familyKey && Array.isArray(r.questions));
      const run = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
      if (run) {
        questions = run.questions as DuelQuestion[];
        opponent = { uid: "ghost", name: String(run.name ?? ""), avatar: (run.avatar as string | null) ?? null, kind: "ghost", familyKey: "ghost", band: me.band, script: run.script as ScriptStep[] };
      }
    }
    if (!opponent) {
      const own = cleanQuestions(body.questions);
      questions = own ?? (lang === "he" ? topicQuestions() : null);
      if (!questions) return NextResponse.json({ error: "no_questions" }, { status: 400 });
      opponent = { uid: "bot", name: lang === "he" ? "רובוט המילים" : "Word Bot", avatar: null, kind: "bot", familyKey: "bot", band: me.band, script: botScript(questions) };
    }
    const code = await createRoom({
      mode: "ghost", lang, ...(lang === "he" ? { bucket } : {}), createdAt: now, startAt: now + COUNTDOWN_MS, questions: questions!,
      players: { a: personDoc(me, "ghost", lang), b: opponent }, answers: emptyAnswers(),
    });
    return NextResponse.json({ code, opponent: opponent.kind });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
