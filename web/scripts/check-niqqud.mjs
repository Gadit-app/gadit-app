// Checks of the niqqud door of מילים פולשות (Gadi 2026-11-25): the signs, the
// stations, the words and the calls (lib/invaders/niqqud.ts), and the rules of
// progress and Wordies (lib/invaders/niqqud-progress.ts). Both modules import
// nothing, so they are transpiled on the fly and run here.
//   node web/scripts/check-niqqud.mjs        → "<n> ok, <m> failed", exit 1 on a failure
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = path.join(here, "..", "src", "lib", "invaders");
const require = createRequire(import.meta.url);
const ts = require("typescript");

async function load(file) {
  const src = fs.readFileSync(path.join(lib, file), "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
}

let ok = 0, bad = 0;
const check = (name, cond, info = "") => { if (cond) ok++; else { bad++; console.log("FAIL", name, info); } };
const eq = (name, a, b) => check(name, JSON.stringify(a) === JSON.stringify(b), `${JSON.stringify(a)} != ${JSON.stringify(b)}`);

/** A seeded random, so a failing case can be replayed. */
const seeded = (seed) => () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

/* ---------- niqqud.ts ---------- */
const nq = await load("niqqud.ts");
const { words } = JSON.parse(fs.readFileSync(path.join(lib, "niqqud-he.json"), "utf8"));

const firstCases = [
  ["דָּג", "kamatz"], ["הַר", "patah"], ["נֵר", "tsere"], ["כֶּלֶב", "segol"], ["פִּיל", "hiriqMale"], ["מִטָּה", "hiriqHaser"],
  ["קוֹף", "holamMale"], ["שׁוֹקוֹלָד", "holamMale"], ["אֹהֶל", "holamHaser"], ["שֹׁרֶשׁ", "holamHaser"], ["סוּס", "shuruk"],
  ["שֻׁלְחָן", "kubutz"], ["גְּלִידָה", "shva"], ["שְׂמִיכָה", "shva"],
];
for (const [w, s] of firstCases) eq(`firstSign ${w}`, nq.firstSign(w), s);

const seen = new Set();
const perGroup = {};
for (const x of words) {
  eq(`word ${x.w} is ${x.g}`, nq.firstSign(x.w), x.g);
  check(`word ${x.w} once`, !seen.has(x.w));
  seen.add(x.w);
  perGroup[x.g] = (perGroup[x.g] ?? 0) + 1;
}
for (const s of Object.keys(nq.SIGNS)) check(`group ${s} has 8 words`, (perGroup[s] ?? 0) >= 8, String(perGroup[s] ?? 0));

// Letter first, then its marks, exactly as GameVowelSteps builds them (the recordings are keyed on that string).
const BET = "בּ", HIRIQ = "ִ";
eq("syllable hiriqHaser", nq.syllable(BET, "hiriqHaser"), { text: BET + HIRIQ, say: BET + HIRIQ + "י" });
eq("syllable hiriqMale", nq.syllable(BET, "hiriqMale"), { text: BET + HIRIQ + "י", say: BET + HIRIQ + "י" });
eq("syllable kubutz says shuruk", nq.syllable("ס", "kubutz"), { text: "סֻ", say: "סוּ" });
eq("syllable holamHaser says holamMale", nq.syllable("ל", "holamHaser"), { text: "לֹ", say: "לוֹ" });
eq("syllable shva says its name", nq.syllable("מ", "shva"), { text: "מְ", say: "שְׁוָא" });
eq("syllable kamatz", nq.syllable("ד", "kamatz"), { text: "דָ", say: "דָ" });
eq("soundOf kubutz", typeof nq.soundOf === "function" ? nq.soundOf("kubutz") : null, "אוּ");
eq("soundOf shva", typeof nq.soundOf === "function" ? nq.soundOf("shva") : null, "שְׁוָא");
eq("signAlone kamatz", nq.signAlone("kamatz"), "◌ָ");
eq("signAlone holamMale", nq.signAlone("holamMale"), "וֹ");
eq("signAlone shuruk", nq.signAlone("shuruk"), "וּ");
eq("signAlone hiriqMale", nq.signAlone("hiriqMale"), "◌ִי");

eq("11 stations", nq.STATIONS.map((s) => s.id), ["s-a", "s-i", "s-o", "s-u", "s-e", "n-a", "n-e", "n-u", "x-o", "x-i", "x-sh"]);
const SOUND = { kamatz: "a", patah: "a", hiriqHaser: "i", hiriqMale: "i", holamMale: "o", holamHaser: "o", shuruk: "u", kubutz: "u", tsere: "e", segol: "e", shva: "-" };
for (const st of nq.STATIONS) {
  for (let call = 0; call < 5; call++) {
    for (const stage of [1, 2, 3]) {
      for (let seed = 1; seed <= 50; seed++) {
        const tag = `${st.id} call ${call} stage ${stage} seed ${seed}`;
        const { tpl, trues, imps } = nq.buildCall(st, call, stage, words, seeded(seed));
        const okSet = new Set(stage === 3 ? tpl.okWords : tpl.ok);
        check(`${tag}: 3 trues`, trues.length === 3, String(trues.length));
        check(`${tag}: keys distinct`, new Set([...trues, ...imps].map((t) => t.key)).size === trues.length + imps.length);
        if (stage === 1) {
          // a sign alone: the same sign may fall three times, and the impostor pool repeats a sign to weight it
          check(`${tag}: impostors`, imps.length >= 1);
        } else {
          check(`${tag}: trues distinct`, new Set(trues.map((t) => t.text)).size === trues.length);
          check(`${tag}: 6 impostors`, imps.length >= 6 && new Set(imps.map((t) => t.text)).size === imps.length, String(imps.length));
        }
        check(`${tag}: trues are ok`, trues.every((t) => t.ok && okSet.has(t.sign) && t.stage === stage));
        check(`${tag}: no impostor is ok for the call`, imps.every((t) => !t.ok && !new Set([...tpl.ok, ...tpl.okWords]).has(t.sign)));
        if (st.id.startsWith("s-")) {
          const sounds = new Set(tpl.ok.map((s) => SOUND[s]));
          check(`${tag}: no impostor sounds the same`, imps.every((t) => !sounds.has(SOUND[t.sign])));
          check(`${tag}: no shva or holamHaser yet`, imps.every((t) => t.sign !== "shva" && t.sign !== "holamHaser"));
        }
        if (stage === 2) {
          const letters = trues.map((t) => [...t.text][0]);
          check(`${tag}: 3 letters`, new Set(letters).size === 3);
          const same = imps.filter((t) => letters.includes([...t.text][0])).length;
          check(`${tag}: impostors reuse the letters`, same * 2 >= imps.length, `${same}/${imps.length}`);
        }
        if (stage === 3) {
          check(`${tag}: pictures differ`, new Set(trues.map((t) => t.p)).size === 3);
          check(`${tag}: words carry a picture word`, [...trues, ...imps].every((t) => typeof t.p === "string" && t.p));
        }
        if (st.id === "x-o") check(`${tag}: half shuruk`, imps.filter((t) => t.sign === "shuruk").length * 2 >= imps.length);
      }
    }
  }
}

/* ---------- niqqud-progress.ts ---------- */
const pr = await load("niqqud-progress.ts");
const ORDER = nq.STATIONS.map((s) => s.id);
const SIGN_IDS = Object.keys(nq.SIGNS);
const D1 = "2026-11-25", D2 = "2026-11-26";
let rid = 0;
/** A round of 5 calls, `clean` of them clean. */
const round = (station, stage, clean, extra = {}) => ({
  rid: `r-${++rid}-abcdef`, station, stage,
  calls: [0, 1, 2, 3, 4].map((i) => ({ clean: i < clean, ok: ["kamatz"], mix: i < clean ? [] : [["kamatz", "tsere"]] })),
  ...extra,
});
const apply = (s, r, day = D1, jump = false) => pr.applyNqRound(s, r, ORDER, day, jump);

let r = apply(pr.emptyNq(), round("s-a", 1, 4));
check("pass at 4", r.counted && r.passed && r.firstPass && r.wordies === 2, JSON.stringify(r));
eq("pass at 4: st", r.state.st["s-a"], 1);
r = apply(pr.emptyNq(), round("s-a", 1, 3));
check("no pass at 3", r.counted && !r.passed && r.wordies === 0 && !r.state.st["s-a"], JSON.stringify(r));

let s = apply(pr.emptyNq(), round("s-a", 1, 4)).state;
r = apply(s, round("s-a", 1, 4));
check("replay pays 0", r.counted && r.passed && !r.firstPass && r.wordies === 0);

s = apply(apply(pr.emptyNq(), round("s-a", 1, 4)).state, round("s-a", 2, 4)).state;
r = apply(s, round("s-a", 3, 4));
check("station done +3 once", r.stationDone && r.wordies === 5 && r.state.done["s-a"] === D1, JSON.stringify(r));
r = apply(r.state, round("s-a", 3, 4));
check("station done +3 once: again 0", !r.stationDone && r.wordies === 0);

s = pr.emptyNq();
let paid = 0;
for (let i = 0; i < 6; i++) { const x = apply(s, round("s-a", 1, 5)); s = x.state; paid += x.wordies; }
eq("clean cap: 2 for the pass + 5 clean", paid, 7);
r = apply(s, round("s-a", 1, 5), D2);
eq("clean cap: next day pays again", r.wordies, 1);
// the day comes from the device's time zone: going back a day must not open the cap again
r = apply(r.state, round("s-a", 1, 5), D1);
eq("clean cap: an earlier day does not reset it", [r.wordies, r.state.clean.day], [1, D2]);
for (let i = 0; i < 6; i++) r = apply(r.state, round("s-a", 1, 5), i % 2 ? D2 : D1);
eq("clean cap: flipping days stops at the cap", r.state.clean, { day: D2, n: 5 });

r = apply(pr.emptyNq(), round("s-a", 2, 5));
check("locked stage", !r.counted && r.wordies === 0 && !r.state.st["s-a"], JSON.stringify(r));
r = apply(pr.emptyNq(), round("s-a", 2, 4), D1, true);
check("jump", r.counted && r.passed && r.state.st["s-a"] === 2 && r.wordies === 2, JSON.stringify(r));
s = apply(apply(pr.emptyNq(), round("s-a", 1, 4)).state, round("s-a", 2, 4)).state;
r = apply(s, round("s-i", 1, 4));
check("next station locked", !r.counted, JSON.stringify(r));
check("unlocked after 3 stages", pr.unlocked(apply(s, round("s-a", 3, 4)).state, ORDER, "s-i", 1));

const once = round("s-a", 1, 5);
const a = apply(pr.emptyNq(), once);
const b = apply(a.state, once);
check("dup rid", a.counted && !b.counted && b.wordies === 0 && JSON.stringify(b.state) === JSON.stringify(a.state));
const short = round("s-a", 1, 4);
short.calls = short.calls.slice(0, 4);
check("short round", !apply(pr.emptyNq(), short).counted);

const cleaned = pr.cleanNq({ st: { "s-a": 7, zz: 2 }, done: { zz: D1 }, signs: { qq: { ok: 3, mix: {} }, tsere: { ok: 2, mix: { qq: 1, shva: 4 } } }, clean: { day: D1, n: 2 }, rids: ["x"] }, ORDER, SIGN_IDS);
eq("clean unknown ids", cleaned, { st: { "s-a": 3 }, done: {}, signs: { tsere: { ok: 2, mix: { shva: 4 } } }, clean: { day: D1, n: 2 }, rids: ["x"] });
eq("clean garbage", pr.cleanNq("nonsense", ORDER, SIGN_IDS), pr.emptyNq());

const mixRound = round("s-e", 1, 3);
mixRound.calls = mixRound.calls.map((c) => ({ ...c, ok: ["tsere"], mix: [["tsere", "shva"]] }));
r = apply(pr.emptyNq(), mixRound, D1, true);
eq("mix counted", r.state.signs.tsere.mix.shva, 5);
eq("ok counted", r.state.signs.tsere.ok, 5);

console.log(`${ok} ok, ${bad} failed`);
process.exit(bad ? 1 : 0);
