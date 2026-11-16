// node --test scripts/journey/ladder.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { currentLevel, afterFirstAnswer, cleanLevel, LEVEL_START } from "../../src/lib/journey/ladder.ts";
import { readableIn, scriptOfText } from "../../src/lib/journey/readable.ts";
import { newCard, dueToday, addDays } from "../../src/lib/journey/scheduler.ts";

test("a level starts at the grade, else at grade 5, inside the range of its language", () => {
  assert.deepEqual(currentLevel("en", undefined, null), { g: LEVEL_START, from: null, log: [] });
  assert.equal(currentLevel("he", undefined, 2).g, 2);
  assert.equal(currentLevel("en", undefined, 11).g, 9);
  assert.equal(currentLevel("en", undefined, 3).g, 4);
  assert.equal(currentLevel("en", undefined, 2), null, "an English child below grade 3 has no fitting words");
  assert.equal(currentLevel("he", undefined, 0), null, "not in 1st grade yet");
  assert.equal(currentLevel("ru", undefined, null), null, "no curriculum held for Russian");
});

test("a stored level is kept, and starts again when the parent sets another grade", () => {
  const stored = { g: 7, from: null, log: [true, false] };
  assert.deepEqual(currentLevel("he", stored, null), stored);
  assert.deepEqual(currentLevel("he", stored, 3), { g: 3, from: 3, log: [] });
  assert.deepEqual(currentLevel("he", { g: 6, from: 3, log: [] }, 3).g, 6);
  assert.equal(cleanLevel("x"), null);
  assert.deepEqual(cleanLevel({ g: 4.7, from: "a", log: [true, 1, false] }), { g: 4, from: null, log: [true, false] });
});

test("seven right of eight first answers is a grade up, three or fewer a grade down", () => {
  let lv = currentLevel("en", undefined, null);
  for (let i = 0; i < 7; i++) lv = afterFirstAnswer("en", lv, true);
  assert.equal(lv.g, 5, "no move before eight answers");
  lv = afterFirstAnswer("en", lv, false);
  assert.deepEqual(lv, { g: 6, from: null, log: [] });
  for (const r of [true, true, true, false, false, false, false, false]) lv = afterFirstAnswer("en", lv, r);
  assert.equal(lv.g, 5);
  for (const r of [true, true, true, true, true, false, false, true]) lv = afterFirstAnswer("en", lv, r);
  assert.equal(lv.g, 5, "six of eight stays");
  assert.equal(lv.log.length, 8);
  let top = { g: 9, from: null, log: [] };
  for (let i = 0; i < 8; i++) top = afterFirstAnswer("en", top, true);
  assert.equal(top.g, 9, "never above the range");
  let low = { g: 1, from: null, log: [] };
  for (let i = 0; i < 8; i++) low = afterFirstAnswer("he", low, false);
  assert.equal(low.g, 1, "never below the range");
});

test("a meaning is shown only on a screen in its language", () => {
  assert.equal(scriptOfText("A long way that you travel"), "latin");
  assert.equal(readableIn("דרך ארוכה שעוברים ממקום למקום", "en"), false);
  assert.equal(readableIn("דרך ארוכה שעוברים ממקום למקום", "he"), true);
  assert.equal(readableIn("The word שלום means peace", "en"), true);
  assert.equal(readableIn("מילה באנגלית: cat", "he"), true);
  assert.equal(readableIn("A long way", "he"), false);
  assert.equal(readableIn("Длинная дорога", "ru"), true);
  assert.equal(readableIn("12, 13", "en"), true);
  assert.equal(readableIn("anything", "am"), true, "a screen language we cannot place hides nothing");
});

test("one of the day's new words is a word of the level when one waits", () => {
  const D = "2026-11-16";
  const book = Array.from({ length: 10 }, (_, i) => newCard(`en_w${i}`, addDays(D, -20 + i)));
  const lvl = [newCard("lvl-u1-0", addDays(D, -1)), newCard("lvl-u1-1", addDays(D, -1))];
  const plain = dueToday([...book, ...lvl], D);
  assert.equal(plain.filter((c) => c.id.startsWith("lvl-")).length, 0, "old notebook cards come first by date");
  const mixed = dueToday([...book, ...lvl], D, { oneNew: (c) => c.id.startsWith("lvl-") });
  assert.equal(mixed.length, 3);
  assert.equal(mixed.filter((c) => c.id.startsWith("lvl-")).length, 1);
  assert.deepEqual(mixed.slice(0, 2).map((c) => c.id), ["en_w0", "en_w1"]);
  const onlyBook = dueToday(book, D, { oneNew: (c) => c.id.startsWith("lvl-") });
  assert.deepEqual(onlyBook.map((c) => c.id), ["en_w0", "en_w1", "en_w2"], "no level word waiting: nothing changes");
});

test("Latin letters: a meaning in French or Spanish is not an English screen's", () => {
  assert.equal(readableIn("Un établissement où les enfants et les jeunes vont pour apprendre des choses.", "en"), false);
  assert.equal(readableIn("Lugar donde los niños van para aprender con un maestro.", "en"), false);
  assert.equal(readableIn("A common greeting used in French-speaking countries, equivalent to 'hello'.", "en"), true);
  assert.equal(readableIn("A short story or sentence that is meant to make people laugh.", "en"), true);
  assert.equal(readableIn("Hola", "en"), true, "too few small words to tell: shown");
});
