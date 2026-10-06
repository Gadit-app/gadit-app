// The site's own feature names in every UI language, read from the code, so
// a translation quotes a tool exactly as the app shows it (Gadi 2026-10-06).
// Exported as a function for the translation scripts.
//   node scripts/ui-feature-names.mjs ru
import fs from "node:fs";
import path from "node:path";
const SRC = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "../src");
const read = (p) => fs.readFileSync(path.join(SRC, p), "utf8").replace(/\r\n/g, "\n");

/** A `const NAME: Record<string, string> = { xx: "...", ... }` table. */
function table(file, name) {
  const s = read(file);
  const i = s.indexOf(`const ${name}`);
  const body = s.slice(s.indexOf("{", i), s.indexOf("\n};", i));
  const out = {};
  const re = /(?:^|[\s,{])"?([a-z]{2,3}(?:-[A-Z]{2})?)"?\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  for (const m of body.matchAll(re)) out[m[1]] = JSON.parse(`"${m[2]}"`);
  return out;
}

const IDENT = { zhCN: "zh-CN", zhTW: "zh-TW" };
/** One key across the language tables of i18n-v2.ts: `const xx: V2Strings = {`,
 *  `const xx: Partial<V2Strings> = {` and later `Object.assign(xx, {` blocks.
 *  A language without its own value shows the English one in the app. */
function v2key(key) {
  const s = read("lib/i18n-v2.ts");
  const opens = [...s.matchAll(/\n(?:const ([A-Za-z]+): (?:Partial<)?V2Strings>? = \{|Object\.assign\(([A-Za-z]+), \{)/g)];
  const keyRe = new RegExp(`\\n\\s*"?${key}"?\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const out = {};
  for (let k = 0; k < opens.length; k++) {
    const id = opens[k][1] || opens[k][2];
    const lang = IDENT[id] ?? id;
    const block = s.slice(opens[k].index, k + 1 < opens.length ? opens[k + 1].index : s.length);
    const m = block.match(keyRe);
    if (m && !out[lang]) out[lang] = JSON.parse(`"${m[1]}"`);
  }
  return out;
}

let cache = null;
export function featureNames(lang) {
  cache ??= {
    say: table("components/design/WbShellChrome.tsx", "SAY_NAV"),
    readT: table("components/design/WbShellChrome.tsx", "READ_NAV"),
    spell: table("components/design/WbShellChrome.tsx", "SPELL_NAV"),
    kids: v2key("kidsModeLabel"),
    compose: v2key("actionCompose"),
    notebook: v2key("navNotebook"),
    idioms: v2key("idiomsEyebrow"),
    origin: v2key("wordOriginEyebrow"),
    toFamily: v2key("accountUpgradeToFamily"),
  };
  const c = cache;
  const pick = (t) => t[lang] ?? t.en;
  return {
    "Say it": pick(c.say),
    "Every Word": pick(c.readT),
    "Dictation practice": pick(c.spell),
    "Kids Mode (its switch reads)": pick(c.kids),
    "Compose a sentence": pick(c.compose),
    "Notebook": pick(c.notebook),
    "Idioms and phrases": pick(c.idioms),
    "Word origin": pick(c.origin),
    "Switch to Family (account button)": pick(c.toFamily),
  };
}

if (process.argv[2]) console.log(featureNames(process.argv[2]));
