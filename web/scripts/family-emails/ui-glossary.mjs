// Glossary of the site's own UI labels for translating the family emails
// (Gadi 2026-10-05). The Hebrew emails quote buttons and tabs ("המשפחה שלי",
// "הגדרות"...); a translated email has to quote the label exactly as the
// site shows it in that language. For every quoted label we find the
// property that holds it in the code (myFamily: "המשפחה שלי") and read the
// same property in the other language blocks of that file.
//
//   node scripts/family-emails/ui-glossary.mjs <emails.json> [out.json]
// emails.json: { "<key>": { subject, body, ctaText, next, ... } } (Hebrew)
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "../../src");
const LANGS = ["en","ar","ru","es","pt","fr","de","cs","sk","it","ja","hi","am","uk","tr","pl","fa","id","nl","el","zu","vi","fil","af","sw","zh-CN","zh-TW","ko","th","bn","da","hu"];
const emails = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

// Quoted labels in the Hebrew emails: "..." and [...] link texts.
const labels = new Set();
for (const c of Object.values(emails)) {
  const text = [c.subject, c.body, c.ctaText, c.next].join("\n");
  for (const m of text.matchAll(/"([^"\n]{2,40})"/g)) if (/[֐-׿]/.test(m[1])) labels.add(m[1].trim());
  for (const m of text.matchAll(/\[([^\]\n]{2,40})\]\(/g)) labels.add(m[1].replace(/^"|"$/g, "").trim());
  if (c.ctaText) labels.add(c.ctaText.trim());
}

function walk(d, out = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (/\.(tsx?|json)$/.test(f.name) && !p.includes("email-drip")) out.push(p);
  }
  return out;
}
const files = walk(ROOT).map((p) => ({ p, s: fs.readFileSync(p, "utf8") }));

// Language of a position in a file: the nearest preceding `xx: {` block opener.
const LANG_OPEN = new RegExp(`(?:^|[\\s,{])"?(he|${LANGS.map((l) => l.replace("-", "\\-")).join("|")})"?\\s*:\\s*\\{`, "g");
function langAt(s, pos) {
  let best = null;
  LANG_OPEN.lastIndex = 0;
  for (let m; (m = LANG_OPEN.exec(s)) && m.index < pos; ) best = m[1];
  return best;
}

const glossary = {}; // label -> { lang: value }
for (const label of labels) {
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prop = new RegExp(`([A-Za-z_$][\\w$]*)\\s*:\\s*"${esc}"`, "g");
  for (const { s } of files) {
    for (let m; (m = prop.exec(s)); ) {
      if (langAt(s, m.index) !== "he") continue;
      const key = m[1];
      // The same property name can repeat in a file (title, label...): match
      // by position, the k-th `key:` in the Hebrew block ↔ the k-th in each
      // other language block.
      const byLang = {};
      const any = new RegExp(`\\b${key}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g");
      for (let n; (n = any.exec(s)); ) {
        const l = langAt(s, n.index);
        if (l) (byLang[l] ||= []).push({ at: n.index, v: n[1] });
      }
      const k = (byLang.he ?? []).findIndex((x) => x.at === m.index);
      if (k < 0) continue;
      const vals = {};
      for (const [l, arr] of Object.entries(byLang)) {
        if (l === "he" || arr.length !== byLang.he.length) continue; // shapes differ: not trustworthy
        vals[l] = arr[k].v;
      }
      if (Object.keys(vals).length > Object.keys(glossary[label] ?? {}).length) glossary[label] = vals;
    }
  }
}
const found = Object.keys(glossary).length;
console.log(`labels ${labels.size}, found in the site ${found}`);
console.log("not found:", [...labels].filter((l) => !glossary[l]).join(" | "));
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(glossary, null, 1));
