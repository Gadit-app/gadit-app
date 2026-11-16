import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { gradeOfMember, nextLevelWords } from "@/lib/journey/level-words";
import { oddQuestions } from "@/lib/journey/odd";
import { senseQuestions } from "@/lib/journey/sense";
import { buildable } from "@/lib/journey/build";
import { nextListWords } from "@/lib/journey/list-words";
import { cleanLook, cleanOwned, owns, shopItem } from "@/lib/journey/shop";
import { isNotFoundMeaning } from "@/lib/not-a-word";
import {
  addDays, answer, coinsOf, dayKeyOf, dueToday, frameOf, isDue, isKnown, newCard, pickFormat, summary, usedOn,
  DAILY_MAX, FRAME_COINS, NEW_PER_DAY, STARS_TO_KNOW, type Card,
} from "@/lib/journey/scheduler";

/**
 * The word cards of a profile (the journey, Gadi 2026-11-14).
 *
 * Storage: users/{uid}/journeyCards/{wordId}, the scheduler's card plus the
 * word it stands for (word, language, meaning, foundDay). The id is the
 * notebook id of the word, so a word has one card. Written by the server only.
 *
 * GET  /api/journey?tz=<IANA zone>&ui=<interface language>
 *   Makes a card for every notebook word that has none (face down, found on
 *   the day the word entered the notebook), and returns all the cards, the
 *   cards of today with the format to ask each in, the numbers and the coins.
 *   A child whose day is short of words also gets words of the school grade
 *   (lib/journey/level-words.ts), so a fortress never stands empty because
 *   the notebook is: enough unopened words to fill a day, and on a day with
 *   little else to do up to LEVEL_DAY of them are asked.
 * POST /api/journey  { id, choice, format, tz }
 *   `choice` is the id of the card the child picked as the answer. The
 *   scheduler decides what the answer does; the card after it is returned.
 * Any signed-in profile.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Formats an answer may carry ("meaning" from an older page is still read). */
const FORMATS = ["meaning", "word"];
/** What a card is asked in: the definition, and the child picks the word (Gadi 2026-11-16). */
const ASK = ["word"];
/** "Odd one out" is asked only of a card that has a checked question (lib/journey/odd.ts). */
const ODD = "odd";
/** "Does this sentence make sense?", asked only of a level card that has a checked sentence. */
const SENSE = "sense";
/** "Build the word" from letter tiles: recall, it cannot be guessed (lib/journey/build.ts). */
const BUILD = "build";
const MAX_CARDS = 500;
/** The words a fortress keeps on a day with nothing else to ask. */
const LEVEL_DAY = 6;
/** Words of the child's own lists (the school's words of the week) that may wait unopened at once. */
const LIST_WAITING = 12;
const UI_LANG = /^[a-z]{2}(-[A-Z]{2})?$/;

/** The school grade of the profile behind a token: its family member doc. */
async function gradeOf(token: string | null): Promise<number | null> {
  if (!token) return null;
  try {
    const d = await getAdminAuth().verifyIdToken(token);
    if (typeof d.familyId !== "string" || typeof d.memberId !== "string") return null;
    const m = await getAdminDb().collection("families").doc(d.familyId).collection("members").doc(d.memberId).get();
    return m.exists ? gradeOfMember(m.data()) : null;
  } catch { return null; }
}

const bearer = (req: NextRequest) => {
  const h = req.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : null;
};
const cardsOf = (uid: string) => getAdminDb().collection("users").doc(uid).collection("journeyCards");
/** The fortress the profile stands at (users/{uid}/journey/state), so a second device continues the same road. */
const stateOf = (uid: string) => getAdminDb().collection("users").doc(uid).collection("journey").doc("state");
const MAX_STAGE = 100000;
/** Coins for a word freed in the fortress (a real step of a card, not a practice round), so a
 *  new child can buy something small after the first game or two (Gadi 2026-11-15). Kept in
 *  the state doc as `bonus`; the coins of a profile are those of its known words plus these. */
const FREED_COINS = 3;
/** Coins for opening a whole fortress. */
const FORT_COINS = 5;
/** More coins for a word remembered after a long gap: by the gap that was waited (7, 30, 90, 365 days). */
const GAP_COINS = [3, 6, 10, 15];
/** The words freed by everyone on a day (UTC), one number with no names: journeyWorld/{day}. */
const worldOf = (d = new Date()) => getAdminDb().collection("journeyWorld").doc(d.toISOString().slice(0, 10));
const bonusOf = (v: unknown): number => (typeof v === "number" && v > 0 ? Math.floor(v) : 0);
/** The landscape the child chose for a fortress, by fortress number (three landscapes). */
const ROADS = 3;
function roadsOf(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (v && typeof v === "object") for (const [k, t] of Object.entries(v as Record<string, unknown>)) if (/^\d{1,6}$/.test(k) && typeof t === "number" && t >= 0 && t < ROADS) out[k] = Math.floor(t);
  return out;
}
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

  // The school's words: the lists the child, a parent or a teacher typed in
  // Homework wait in the fortress too (lib/journey/list-words.ts). They come
  // before the words of the grade.
  const ui0 = str(req.nextUrl.searchParams.get("ui"));
  const waitingList = cards.filter((c) => c.id.startsWith("list-") && !isKnown(c) && c.stars === 0).length;
  if (UI_LANG.test(ui0) && waitingList < LIST_WAITING && cards.length < MAX_CARDS) {
    try {
      const mine = await nextListWords(user.userId, ui0, have, cards.map((c) => c.word), Math.min(LIST_WAITING - waitingList, MAX_CARDS - cards.length));
      const found = addDays(today, -1);
      const add: Stored[] = mine.map((w) => ({ ...newCard(w.id, found), word: w.word, language: w.language, meaning: w.meaning, foundDay: found }));
      if (add.length && !user.impersonating) {
        const batch = db.batch();
        for (const c of add) { const { id, ...rest } = c; batch.create(cardsOf(user.userId).doc(id), { ...rest, source: "list" }); }
        try { await batch.commit(); } catch (e) { console.warn("journey: list cards not created", String(e)); }
      }
      for (const c of add) have.add(c.id);
      cards.push(...add);
    } catch (e) { console.warn("journey: list words not read", String(e)); }
  }

  // Words of the school grade, when the day is short of words. They are
  // found "yesterday", so they can be opened today.
  const used = usedOn(cards, today);
  const ui = str(req.nextUrl.searchParams.get("ui"));
  const unopened = cards.filter((c) => !isKnown(c) && c.stars === 0).length;
  if (UI_LANG.test(ui) && unopened < DAILY_MAX && cards.length < MAX_CARDS) {
    const grade = await gradeOf(bearer(req));
    if (grade !== null) {
      const level = await nextLevelWords(ui, grade, have, cards.map((c) => c.word), Math.min(DAILY_MAX - unopened, MAX_CARDS - cards.length));
      const found = addDays(today, -1);
      const add: Stored[] = level.map((w) => ({ ...newCard(w.id, found), word: w.word, language: w.language, meaning: w.meaning, foundDay: found }));
      if (add.length && !user.impersonating) {
        const batch = db.batch();
        for (const c of add) { const { id, ...rest } = c; batch.create(cardsOf(user.userId).doc(id), { ...rest, source: "level" }); }
        try { await batch.commit(); } catch (e) { console.warn("journey: level cards not created", String(e)); }
      }
      cards.push(...add);
    }
  }
  // A day with little to review asks more unopened words than the usual three.
  const older = cards.filter((c) => isDue(c, today) && (isKnown(c) || c.stars > 0)).length;
  const newMax = Math.max(NEW_PER_DAY, LEVEL_DAY - older);
  const due = dueToday(cards, today, { usedToday: used, newMax });
  const [odd, sense] = await Promise.all([oddQuestions(due as Stored[]), senseQuestions(due as Stored[], today)]);
  const todays = due.map((c) => {
    const o = odd.get(c.id), s = sense.get(c.id);
    // A word is known after three stars, so it is asked in three formats: the
    // two plain ones and a third. A card that has both checked questions gets
    // one of them by its id, so half the words meet each kind.
    // The third is "build the word" whenever the word is a single short one:
    // every other format is a choice, and a child who taps at random gets one
    // right in three, so three stars proved nothing (the AI review, 2026-11-15).
    // A phrase or a long word keeps a checked question as its third.
    let h = 0; for (let i = 0; i < c.id.length; i++) h = (h * 31 + c.id.charCodeAt(i)) >>> 0;
    const third = buildable((c as Stored).word) ? BUILD : o && s ? (h % 2 ? ODD : SENSE) : o ? ODD : s ? SENSE : null;
    const format = pickFormat(c, third ? [...ASK, third] : ASK);
    if (format === ODD && o) return { id: c.id, format, odd: o };
    if (format === SENSE && s) return { id: c.id, format, sense: s };
    return { id: c.id, format: format === ODD || format === SENSE ? ASK[0] : format };
  });
  const [stateSnap, worldSnap] = await Promise.all([stateOf(user.userId).get(), worldOf().get()]);
  const state = stateSnap.data() ?? {};
  const freedToday = worldSnap.get("freed");
  const st = state.stage;
  return NextResponse.json({
    stage: typeof st === "number" && st >= 0 ? Math.floor(st) : 0,
    roads: roadsOf(state.roads),
    // Words freed today by all the children together: a number only.
    world: { freedToday: typeof freedToday === "number" && freedToday > 0 ? Math.floor(freedToday) : 0 },
    // The shop: what was bought, what the runner wears and what was spent.
    shop: { owned: cleanOwned(state.owned), look: cleanLook(state.look), spent: typeof state.spent === "number" && state.spent > 0 ? Math.floor(state.spent) : 0 },
    today, dailyMax: DAILY_MAX, usedToday: used, starsToKnow: STARS_TO_KNOW,
    cards: cards.map((c) => view(c, today)), todays,
    summary: summary(cards, today), coins: coinsOf(cards) + bonusOf(state.bonus), frameCoins: FRAME_COINS,
  });
}

export async function POST(req: NextRequest) {
  const user = await verifyUserAndGetPlan(bearer(req));
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let body: { id?: unknown; choice?: unknown; format?: unknown; tz?: unknown; stage?: unknown; buy?: unknown; wear?: unknown; road?: unknown; forStage?: unknown };
  try { body = (await req.json()) as typeof body; } catch { return NextResponse.json({ error: "bad_body" }, { status: 400 }); }
  // { road, forStage }: the landscape the child chose for the next fortress
  // (only the fortress they stand at, or the one after it).
  if (typeof body.road === "number" && typeof body.forStage === "number") {
    const road = Math.floor(body.road), want = Math.floor(body.forStage);
    const ref = stateOf(user.userId);
    const cur = (await ref.get()).data() ?? {};
    const now = typeof cur.stage === "number" && cur.stage >= 0 ? Math.floor(cur.stage) : 0;
    if (!(road >= 0 && road < ROADS) || !(want === now || want === now + 1)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
    const roads = { ...roadsOf(cur.roads), [String(want)]: road };
    if (!user.impersonating) await ref.set({ roads }, { merge: true });
    return NextResponse.json({ roads });
  }
  // { buy: itemId }: a look from the shop, paid with the coins of the known
  // words. { wear: itemId }: put on a thing the child owns (a free one is
  // everyone's). A bought thing is kept for good and nothing is ever taken back.
  if (typeof body.buy === "string" || typeof body.wear === "string") {
    const item = shopItem(String(body.buy ?? body.wear));
    if (!item) return NextResponse.json({ error: "bad_request" }, { status: 400 });
    const ref = stateOf(user.userId);
    const cardSnap = typeof body.buy === "string" || item.need ? await cardsOf(user.userId).limit(MAX_CARDS).get() : null;
    const mine = cardSnap ? cardSnap.docs.map((d) => readCard(d.id, d.data())).filter((c): c is Stored => !!c) : [];
    const cardCoins = coinsOf(mine);
    // A thing that is earned, not sold: the child's once enough words are in the index.
    const known = mine.filter(isKnown).length;
    const out = await getAdminDb().runTransaction(async (tx) => {
      const cur = (await tx.get(ref)).data() ?? {};
      let owned = cleanOwned(cur.owned);
      const look = cleanLook(cur.look);
      let spent = typeof cur.spent === "number" && cur.spent > 0 ? Math.floor(cur.spent) : 0;
      if (typeof body.buy === "string") {
        if (item.need || owns(owned, item.id)) return { error: "owned" as const, owned, look, spent };
        if (cardCoins + bonusOf(cur.bonus) - spent < item.price) return { error: "short" as const, owned, look, spent };
        owned = [...owned, item.id];
        spent += item.price;
      } else if (!owns(owned, item.id, known)) return { error: "not_owned" as const, owned, look, spent };
      look[item.slot] = item.id;
      if (!user.impersonating) tx.set(ref, { owned, look, spent, at: new Date().toISOString() }, { merge: true });
      return { error: null, owned, look, spent };
    });
    return NextResponse.json({ ok: !out.error, error: out.error, shop: { owned: out.owned, look: out.look, spent: out.spent } }, { status: out.error ? 409 : 200 });
  }
  // { stage }: the child opened a fortress. The number only goes up, one fortress at a time.
  if (typeof body.stage === "number" && body.id === undefined) {
    const want = Math.floor(body.stage);
    if (!(want >= 0 && want <= MAX_STAGE)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
    const ref = stateOf(user.userId);
    const cur = (await ref.get()).get("stage");
    const now = typeof cur === "number" && cur >= 0 ? Math.floor(cur) : 0;
    const next = want === now + 1 ? want : now;
    if (next !== now && !user.impersonating) {
      const { FieldValue } = await import("firebase-admin/firestore");
      await ref.set({ stage: next, at: new Date().toISOString(), bonus: FieldValue.increment(FORT_COINS) }, { merge: true });
    }
    return NextResponse.json({ stage: next });
  }
  const id = str(body.id), choice = str(body.choice), format = str(body.format);
  if (!id || id.length > 200 || id.includes("/") || !choice || !(FORMATS.includes(format) || format === ODD || format === SENSE || format === BUILD)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
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
  const real = choice === id && (out.event === "star" || out.event === "known" || out.event === "kept");
  // A word of the index that was remembered after its gap pays more, the longer the gap.
  const freed = real ? FREED_COINS + (out.event === "kept" && !out.before.relearn ? GAP_COINS[Math.min(GAP_COINS.length - 1, out.before.gapStep)] : 0) : 0;
  if (freed && !user.impersonating) {
    const { FieldValue } = await import("firebase-admin/firestore");
    try {
      await Promise.all([
        stateOf(user.userId).set({ bonus: FieldValue.increment(freed) }, { merge: true }),
        worldOf().set({ freed: FieldValue.increment(1) }, { merge: true }),
      ]);
    } catch (e) { console.warn("journey: freed coins not saved", String(e)); }
  }
  return NextResponse.json({
    correct: choice === id, event: out.event, frameUp: out.frameUp, card: view(out.after, today),
    coinsUp: coinsOf([out.after]) - coinsOf([out.before]) + freed,
  });
}
