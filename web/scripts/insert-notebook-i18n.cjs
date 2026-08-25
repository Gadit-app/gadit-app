/* Splice the 11 missing-language entries into NotebookClient's two copy maps
 * (TREASURE_COPY = header, COPY = full). Inserts before each map's closing
 * "\n};". Skips a language already present. */
const fs = require("fs");
const path = require("path");

const JSON_PATH = "C:\\Users\\gadib\\AppData\\Local\\Temp\\claude\\c--Users-gadib-gadit-app\\a58faa26-e863-4fc7-a78f-e012b1299627\\scratchpad\\notebook-i18n.json";
const FILE = path.resolve(__dirname, "..", "src", "app", "notebook", "NotebookClient.tsx");

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const langs = Object.keys(data);
const keyLit = (l) => (/[^a-z]/.test(l) ? JSON.stringify(l) : l);

function spliceInto(src, marker, buildBlock) {
  const i = src.indexOf(marker);
  if (i < 0) throw new Error("marker not found: " + marker);
  const end = src.indexOf("\n};", i);
  if (end < 0) throw new Error("closing not found for: " + marker);
  const already = src.slice(i, end);
  const blocks = [];
  for (const l of langs) {
    const kl = keyLit(l);
    if (already.includes("\n  " + kl + ":")) continue;
    blocks.push(buildBlock(l, kl, data[l]));
  }
  if (!blocks.length) { console.log("nothing to add for", marker); return src; }
  console.log("adding", blocks.length, "langs for", marker);
  return src.slice(0, end) + "\n" + blocks.join("\n") + src.slice(end);
}

let src = fs.readFileSync(FILE, "utf8");

src = spliceInto(src, "const TREASURE_COPY:", (l, kl, d) => {
  const h = d.header;
  return `  ${kl}: { title: ${JSON.stringify(h.title)}, subtitle: ${JSON.stringify(h.subtitle)} },`;
});

src = spliceInto(src, "const COPY: Record<string, {", (l, kl, d) => {
  const c = d.copy;
  return `  ${kl}: {
    title: ${JSON.stringify(c.title)},
    subtitle: ${JSON.stringify(c.subtitle)},
    empty: ${JSON.stringify(c.empty)},
    emptyHint: ${JSON.stringify(c.emptyHint)},
    goSearch: ${JSON.stringify(c.goSearch)},
  },`;
});

fs.writeFileSync(FILE, src);
console.log("done");
