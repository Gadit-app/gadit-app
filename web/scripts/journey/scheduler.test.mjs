// node --test scripts/journey/scheduler.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { newCard, answer, dueToday, pickFormat, summary, frameOf, dayKeyOf, addDays, diffDays, isKnown, DAILY_MAX } from "../../src/lib/journey/scheduler.ts";

const D0 = "2026-11-14";
const day = (n) => addDays(D0, n);
const ok = (c, d, format = "gap") => answer(c, { correct: true, format, day: d });
const no = (c, d, format = "gap") => answer(c, { correct: false, format, day: d });

test("days: the day in the child's own zone, month ends, differences", () => {
  assert.equal(dayKeyOf(new Date("2026-11-14T22:30:00Z"), "Africa/Johannesburg"), "2026-11-15");
  assert.equal(dayKeyOf(new Date("2026-11-14T22:30:00Z"), "America/New_York"), "2026-11-14");
  assert.equal(dayKeyOf(new Date("2026-11-14T22:30:00Z"), "not/a-zone"), "2026-11-14");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(diffDays("2026-11-14", "2027-11-14"), 365);
});

test("a new card is face down on its first day and opens the next day", () => {
  const c = newCard("he_shoresh", D0);
  assert.deepEqual(dueToday([c], D0), []);
  assert.deepEqual(dueToday([c], day(1)).map((x) => x.id), ["he_shoresh"]);
  const r = ok(c, D0);
  assert.equal(r.event, "practice"); assert.equal(r.card.stars, 0); assert.equal(r.card.right, 1);
});

test("three right answers on three different days put the card in the index", () => {
  let c = newCard("w", D0), r;
  r = ok(c, day(1), "gap"); c = r.card; assert.equal(r.event, "star"); assert.equal(c.stars, 1); assert.equal(c.dueDay, day(2));
  r = ok(c, day(2), "picture"); c = r.card; assert.equal(r.event, "star"); assert.equal(c.stars, 2); assert.equal(c.dueDay, day(4));
  assert.equal(isKnown(c), false);
  r = ok(c, day(4), "sound"); c = r.card; assert.equal(r.event, "known"); assert.equal(c.stars, 3); assert.equal(c.knownDay, day(4));
  assert.deepEqual(c.starDays, [day(1), day(2), day(4)]); assert.deepEqual(c.formats, ["gap", "picture", "sound"]);
  assert.equal(c.dueDay, day(11));
});

test("one star a day: more right answers the same day are practice", () => {
  let c = ok(newCard("w", D0), day(1)).card;
  for (let i = 0; i < 5; i++) { const r = ok(c, day(1)); assert.equal(r.event, "practice"); c = r.card; }
  assert.equal(c.stars, 1); assert.equal(c.right, 6); assert.equal(c.dueDay, day(2));
});

test("a wrong answer takes nothing away and the star waits for the next day", () => {
  let c = ok(newCard("w", D0), day(1)).card;
  let r = no(c, day(2)); c = r.card;
  assert.equal(r.event, "again"); assert.equal(c.stars, 1); assert.equal(c.dueDay, day(3)); assert.equal(c.wrong, 1);
  r = ok(c, day(2)); c = r.card; // right a minute later
  assert.equal(r.event, "practice"); assert.equal(c.stars, 1);
  r = ok(c, day(3)); assert.equal(r.event, "star"); assert.equal(r.card.stars, 2);
});

test("the original card is never changed", () => {
  const c = newCard("w", D0), copy = JSON.stringify(c);
  ok(c, day(1)); no(c, day(1));
  assert.equal(JSON.stringify(c), copy);
});

const known = () => { let c = newCard("w", D0); c = ok(c, day(1)).card; c = ok(c, day(2)).card; return ok(c, day(4)).card; };

test("reviews: a week, a month, three months, a year, and the frame follows the gap", () => {
  let c = known(), r;
  assert.equal(frameOf(c.longestGap), "plain");
  r = ok(c, day(11)); c = r.card; assert.equal(r.event, "kept"); assert.equal(r.frameUp, "silver"); assert.equal(c.dueDay, day(41));
  r = ok(c, day(41)); c = r.card; assert.equal(r.frameUp, "gold"); assert.equal(c.dueDay, day(131));
  r = ok(c, day(131)); c = r.card; assert.equal(r.frameUp, "rainbow"); assert.equal(c.dueDay, day(496));
  r = ok(c, day(496)); c = r.card; assert.equal(r.frameUp, "diamond"); assert.equal(c.dueDay, day(861));
  r = ok(c, day(861)); assert.equal(r.frameUp, null); assert.equal(r.card.dueDay, day(1226));
});

test("being away can only help: a card due a week later, answered after 40 days, is gold", () => {
  const r = ok(known(), day(44));
  assert.equal(r.card.longestGap, 40); assert.equal(r.frameUp, "gold");
});

test("a wrong review keeps the frame and the stars, and earns nothing by the old gap", () => {
  let c = ok(known(), day(11)).card; // silver, next in 30 days
  let r = no(c, day(41)); c = r.card;
  assert.equal(r.event, "again"); assert.equal(frameOf(c.longestGap), "silver"); assert.equal(c.stars, 3); assert.equal(isKnown(c), true);
  assert.equal(c.dueDay, day(42));
  r = ok(c, day(42)); c = r.card; // right the next day: a one-day gap, no gold
  assert.equal(r.event, "kept"); assert.equal(r.frameUp, null); assert.equal(frameOf(c.longestGap), "silver");
  assert.equal(c.dueDay, day(72)); // the same 30 days again, not 90
  r = ok(c, day(72)); assert.equal(r.frameUp, "gold"); assert.equal(r.card.dueDay, day(162));
});

test("the cards of the day: eight at most, no backlog, started first, one place kept for a new card", () => {
  const started = Array.from({ length: 12 }, (_, i) => ok(newCard("s" + String(i).padStart(2, "0"), day(-30)), day(-20 + i)).card);
  const fresh = Array.from({ length: 6 }, (_, i) => newCard("n" + i, day(-10 + i)));
  const today = dueToday([...fresh, ...started], D0);
  assert.equal(today.length, DAILY_MAX);
  assert.equal(today.filter((c) => c.id.startsWith("s")).length, 7);
  assert.deepEqual(today.slice(0, 2).map((c) => c.id), ["s00", "s01"]);
  assert.equal(today[7].id, "n0");
  assert.equal(dueToday([...fresh, ...started], D0, { usedToday: 6 }).length, 2);
  assert.deepEqual(dueToday([...fresh, ...started], D0, { usedToday: 8 }), []);
  assert.deepEqual(dueToday([...fresh, ...started], D0, { usedToday: 20 }), []);
});

test("the cards of the day: three new ones at most, and two stars come before one", () => {
  const fresh = Array.from({ length: 10 }, (_, i) => newCard("n" + i, day(-5)));
  assert.deepEqual(dueToday(fresh, D0).map((c) => c.id), ["n0", "n1", "n2"]);
  const one = ok(newCard("one", day(-9)), day(-8)).card;
  const two = ok(ok(newCard("two", day(-9)), day(-8)).card, day(-6)).card;
  assert.deepEqual(dueToday([one, two], D0).map((c) => c.id), ["two", "one"]);
});

test("the cards of the day: reviews fill the day when few cards are started, same answer every time", () => {
  const reviews = Array.from({ length: 5 }, (_, i) => ({ ...known(), id: "k" + i }));
  const fresh = [newCard("n0", day(-3))];
  const a = dueToday([...reviews, ...fresh], day(20)), b = dueToday([...fresh, ...[...reviews].reverse()], day(20));
  assert.deepEqual(a.map((c) => c.id), ["k0", "k1", "k2", "k3", "k4", "n0"]);
  assert.deepEqual(a.map((c) => c.id), b.map((c) => c.id));
});

test("a card answered on a day is not one of that day's cards again", () => {
  const c = ok(newCard("w", D0), day(1)).card;
  assert.deepEqual(dueToday([c], day(1)), []);
  assert.deepEqual(dueToday([no(newCard("x", D0), day(1)).card], day(1)), []);
});

test("formats: a new one each star, then the one used longest ago", () => {
  const all = ["gap", "picture", "sound"];
  let c = newCard("w", D0);
  assert.equal(pickFormat(c, all), "gap");
  c = ok(c, day(1), "gap").card; assert.equal(pickFormat(c, all), "picture");
  c = ok(c, day(2), "picture").card; assert.equal(pickFormat(c, all), "sound");
  c = ok(c, day(4), "sound").card; assert.equal(pickFormat(c, all), "gap");
  assert.equal(pickFormat(c, ["picture", "sound"]), "picture");
  assert.equal(pickFormat(c, []), null);
});

test("summary: the index, the started, the new, the frames", () => {
  const cards = [known(), { ...ok(known(), day(11)).card, id: "w2" }, ok(newCard("a", D0), day(1)).card, newCard("b", D0)];
  const s = summary(cards, day(12));
  assert.equal(s.index, 2); assert.equal(s.started, 1); assert.equal(s.fresh, 1);
  assert.deepEqual(s.frames, { plain: 1, silver: 1, gold: 0, rainbow: 0, diamond: 0 });
  assert.equal(s.due, 3);
});

test("a year of a child who plays three days a week never loses a star or a frame", () => {
  let cards = Array.from({ length: 40 }, (_, i) => newCard("w" + String(i).padStart(2, "0"), day(Math.floor(i / 2))));
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const rank = ["plain", "silver", "gold", "rainbow", "diamond"];
  for (let d = 1; d <= 365; d++) {
    if (d % 7 === 0 || d % 7 === 2 || d % 7 === 4 || d % 7 === 5) continue; // four days off a week
    const today = dueToday(cards, day(d));
    assert.ok(today.length <= DAILY_MAX);
    for (const t of today) {
      const r = answer(t, { correct: rnd() < 0.75, format: pickFormat(t, ["gap", "picture", "sound"]), day: day(d) });
      assert.ok(r.card.stars >= t.stars);
      assert.ok(rank.indexOf(frameOf(r.card.longestGap)) >= rank.indexOf(frameOf(t.longestGap)));
      assert.ok(r.card.dueDay > day(d));
      cards = cards.map((c) => (c.id === t.id ? r.card : c));
    }
  }
  const s = summary(cards, day(365));
  assert.equal(s.index, 40);
  assert.ok(s.frames.gold + s.frames.rainbow > 0);
  for (const c of cards) assert.equal(new Set(c.starDays).size, 3);
});
