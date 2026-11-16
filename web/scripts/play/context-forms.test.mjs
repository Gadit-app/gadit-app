// node --test scripts/play/context-forms.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { isFormOf } from "../../src/lib/context-game.ts";

test("Hebrew: other tenses and persons of an infinitive count as its forms", () => {
  for (const [a, b] of [
    ["גילה", "לגלות"], ["גילינו", "לגלות"], ["מגלים", "לגלות"], ["גילתה", "לגלות"],
    ["חילקה", "לחלוק"], ["חולקים", "לחלוק"], ["הקשיבה", "להקשיב"], ["מקשיבים", "להקשיב"],
    ["עזרה", "לעזור"], ["עוזרת", "לעזור"], ["חלמה", "לחלום"], ["חולם", "לחלום"], ["ושיחקו", "לשחק"],
  ]) assert.equal(isFormOf(a, b, "he"), true, `${a} of ${b}`);
});

test("Hebrew: the old forms still pass and other words still fail", () => {
  for (const [a, b] of [["אמיצה", "אמיץ"], ["סקרנים", "סקרן"], ["בהתמדה", "התמדה"], ["חברים", "חבר"]]) assert.equal(isFormOf(a, b, "he"), true, `${a} of ${b}`);
  for (const [a, b] of [["נזהרו", "ירא"], ["שמחה", "לגלות"], ["ספר", "לחלוק"], ["רצו", "להקשיב"], ["כלב", "חתול"], ["ירוק", "לעזור"]]) assert.equal(isFormOf(a, b, "he"), false, `${a} is not ${b}`);
});

test("other languages are unchanged", () => {
  assert.equal(isFormOf("served", "serve", "en"), true);
  assert.equal(isFormOf("jumped", "sing", "en"), false);
});
