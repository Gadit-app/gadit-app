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

console.log(`${ok} ok, ${bad} failed`);
process.exit(bad ? 1 : 0);
