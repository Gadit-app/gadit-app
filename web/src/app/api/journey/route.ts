import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { isNotFoundMeaning } from "@/lib/not-a-word";
import {
  answer, coinsOf, dayKeyOf, dueToday, frameOf, isKnown, newCard, pickFormat, summary, usedOn,
  DAILY_MAX, FRAME_COINS, STARS_TO_KNOW, type Card,
} from "@/lib/journey/scheduler";

/**
 * The word cards of a profile (the journey, Gadi 2026-11-14).
 *
 * Storage: users/{uid}/journeyCards/{wordId}, the scheduler's card plus the
 * word it stands for (word, language, meaning, foundDay). The id is the
 * notebook id of the word, so a word has one card. Written by the server only.
 *
 * GET  /api/journey?tz=<IANA zone>
 *   Makes a card for every notebook word that has none (face down, found on
 *   the day the word entered the notebook), and returns all the cards, the
 *   cards of today with the format to ask each in, the numbers and the coins.
 * POST /api/journey  { id, choice, format, tz }
 *   `choice` is the id of the card the child picked as the answer. The
 *   scheduler decides what the answer does; the card after it is returned.
 * Any signed-in profile.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATS = ["meaning", "word"];
const MAX_CARDS = 500;

const bearer = (req: NextRequest) => {
  const h = req.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : null;
};
const cardsOf = (uid: string) => getAdminDb().collection("users").doc(uid).collection("journeyCards");
const zoneOf = (v: unknown) => (typeof v === "string" && v.length <= 64 ? v : "UTC");

type Stored = Card & { word: string; language: string; meaning: string; foundDay: string };
const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const day = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

/** A stored doc as a card; a doc that does not read as one is skipped. */
function readCard(id: string, d: FirebaseFirestore.DocumentData | undefined): Stored | null {
  if (!d) return null;
  const dueDay = day(d.dueDay);
  if (!dueDay || !str(d.word)) return null;
  return {
    id, stars: Math.max(0, Math.min(STARS_TO_KNOW, Math.floor(num(d.stars)))),
    starDays: Array.isArray(d.starDays) ? d.starDays.filter((x: unknown) => day(x)) : [],
    formats: Array.isArray(d.formats) ? d.formats.filter((x: unknown) => typeof x === "string") : [],
    knownDay: day(d.knownDay), dueDay, gapStep: Math.max(0, Math.floor(num(d.gapStep))), relearn: d.relearn === true,
    gapFrom: day(d.gapFrom), longestGap: Math.max(0, Math.floor(num(d.longestGap))),
    right: num(d.right), wrong: num(d.wrong), lastDay: day(d.lastDay), creditDay: day(d.creditDay),
    word: str(d.word), language: str(d.language), meaning: str(d.meaning), foundDay: day(d.foundDay) ?? dueDay,
  };
}

/** What the screen needs of a card. */
const view = (c: Stored, today: string) => ({
  id: c.id, word: c.word, language: c.language, meaning: c.meaning, foundDay: c.foundDay,
  stars: c.stars, known: isKnown(c), frame: frameOf(c.longestGap), dueDay: c.dueDay, due: c.dueDay <= today,
});

export async function GET(req: NextRequest) {
  const user = await verifyUserAndGetPlan(bearer(req));
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const tz = zoneOf(req.nextUrl.searchParams.get("tz"));
  const today = dayKeyOf(new Date(), tz);
  const db = getAdminDb();
  const [cardSnap, bookSnap] = await Promise.all([
    cardsOf(user.userId).limit(MAX_CARDS).get(),
    db.collection("users").doc(user.userId).collection("notebook").orderBy("addedAt", "desc").limit(MAX_CARDS).get(),
  ]);
  const cards: Stored[] = [];
  const have = new Set<string>();
  for (const d of cardSnap.docs) { have.add(d.id); const c = readCard(d.id, d.data()); if (c) cards.push(c); }

  // A card for every notebook word that has none yet.
  const fresh: Stored[] = [];
  for (const d of bookSnap.docs) {
    if (have.has(d.id) || cards.length + fresh.length >= MAX_CARDS) continue;
    const w = d.data();
    const word = str(w.word).trim(), meaning = str(w.meaning).trim();
    if (!word || !meaning || isNotFoundMeaning(meaning)) continue;
    const added = new Date(str(w.addedAt));
    const foundDay = Number.isNaN(added.getTime()) ? today : dayKeyOf(added, tz);
    fresh.push({ ...newCard(d.id, foundDay), word, language: str(w.language), meaning, foundDay });
  }
  if (fresh.length && !user.impersonating) {
    for (let i = 0; i < fresh.length; i += 400) {
      const batch = db.batch();
      // create(): two visits at once never overwrite a card that was just answered.
      for (const c of fresh.slice(i, i + 400)) { const { id, ...rest } = c; batch.create(cardsOf(user.userId).doc(id), rest); }
      // Another visit made the same cards a moment ago: they are there, nothing to do.
      try { await batch.commit(); } catch (e) { console.warn("journey: cards not created", String(e)); }
    }
  }
  cards.push(...fresh);

  const used = usedOn(cards, today);
  const todays = dueToday(cards, today, { usedToday: used }).map((c) => ({ id: c.id, format: pickFormat(c, FORMATS) }));
  return NextResponse.json({
    today, dailyMax: DAILY_MAX, usedToday: used, starsToKnow: STARS_TO_KNOW,
    cards: cards.map((c) => view(c, today)), todays,
    summary: summary(cards, today), coins: coinsOf(cards), frameCoins: FRAME_COINS,
  });
}

export async function POST(req: NextRequest) {
  const user = await verifyUserAndGetPlan(bearer(req));
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let body: { id?: unknown; choice?: unknown; format?: unknown; tz?: unknown };
  try { body = (await req.json()) as typeof body; } catch { return NextResponse.json({ error: "bad_body" }, { status: 400 }); }
  const id = str(body.id), choice = str(body.choice), format = str(body.format);
  if (!id || id.length > 200 || id.includes("/") || !choice || !FORMATS.includes(format)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const today = dayKeyOf(new Date(), zoneOf(body.tz));
  const ref = cardsOf(user.userId).doc(id);
  const db = getAdminDb();
  const out = await db.runTransaction(async (tx) => {
    const before = readCard(id, (await tx.get(ref)).data());
    if (!before) return null;
    const r = answer(before, { correct: choice === id, format, day: today });
    if (!user.impersonating) {
      const { id: _id, ...rest } = { ...before, ...r.card };
      void _id;
      tx.set(ref, rest);
    }
    return { before, after: { ...before, ...r.card } as Stored, event: r.event, frameUp: r.frameUp };
  });
  if (!out) return NextResponse.json({ error: "no_card" }, { status: 404 });
  return NextResponse.json({
    correct: choice === id, event: out.event, frameUp: out.frameUp, card: view(out.after, today),
    coinsUp: coinsOf([out.after]) - coinsOf([out.before]),
  });
}
