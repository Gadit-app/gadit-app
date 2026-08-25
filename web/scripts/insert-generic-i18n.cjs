/* Generic i18n splicer. Usage:
 *   node insert-generic-i18n.cjs <configName>
 * Each config lists a target .tsx file and one or more maps to fill. For each
 * map: a marker (unique substring of the map's declaration) and a function that,
 * given the per-language JSON value, returns the TS entry VALUE text (what goes
 * after "<key>: "). Entries are spliced before the map's closing "\n};".
 * Languages already present in a map are skipped. */
const fs = require("fs");
const path = require("path");

const SCRATCH = "C:\\Users\\gadib\\AppData\\Local\\Temp\\claude\\c--Users-gadib-gadit-app\\a58faa26-e863-4fc7-a78f-e012b1299627\\scratchpad\\";
const ROOT = path.resolve(__dirname, "..");
const keyLit = (l) => (/[^a-z]/.test(l) ? JSON.stringify(l) : l);

// scoreLineTpl "{s} of {t}" -> arrow function source
function tplToFn(tpl) {
  const body = tpl.replace(/\{s\}/g, "${s}").replace(/\{t\}/g, "${t}");
  return "(s, t) => `" + body + "`";
}

const CONFIGS = {
  home: {
    file: "src/app/HomeClient.tsx",
    json: "home-i18n.json",
    maps: [{ marker: "const COPY:", value: (v) => JSON.stringify(v) }],
  },
  install: {
    file: "src/components/InstallPwaPrompt.tsx",
    json: "install-i18n.json",
    maps: [{ marker: "const COPY: Record<string, Copy>", value: (v) => JSON.stringify(v) }],
  },
  wbmenu: {
    file: "src/components/design/WbUserMenu.tsx",
    json: "wbmenu-i18n.json",
    maps: [
      { marker: "const DARK_LABEL:", value: (v) => JSON.stringify(v.darkLabel) },
      { marker: "const COPY: Record<string, Copy>", value: (v) => JSON.stringify(v.menu) },
    ],
  },
  wordgame: {
    file: "src/components/design/WordGameModal.tsx",
    json: "wordgame-i18n.json",
    maps: [{
      marker: "const COPY: Record<string, {",
      value: (v) => {
        const { scoreLineTpl, ...rest } = v;
        // Build a TS object literal preserving order, with scoreLine as a fn.
        const parts = [];
        for (const [k, val] of Object.entries(rest)) parts.push(`${k}: ${JSON.stringify(val)}`);
        parts.push(`scoreLine: ${tplToFn(scoreLineTpl)}`);
        return `{ ${parts.join(", ")} }`;
      },
    }],
  },
};

const name = process.argv[2];
const cfg = CONFIGS[name];
if (!cfg) { console.error("unknown config", name); process.exit(1); }

const data = JSON.parse(fs.readFileSync(SCRATCH + cfg.json, "utf8"));
const langs = Object.keys(data);
const file = path.join(ROOT, cfg.file);
let src = fs.readFileSync(file, "utf8");

for (const m of cfg.maps) {
  const i = src.indexOf(m.marker);
  if (i < 0) throw new Error("marker not found: " + m.marker + " in " + cfg.file);
  const end = src.indexOf("\n};", i);
  if (end < 0) throw new Error("closing not found: " + m.marker);
  const already = src.slice(i, end);
  const blocks = [];
  for (const l of langs) {
    const kl = keyLit(l);
    if (already.includes("\n  " + kl + ":")) continue;
    blocks.push(`  ${kl}: ${m.value(data[l])},`);
  }
  if (!blocks.length) { console.log("nothing to add:", m.marker); continue; }
  console.log("adding", blocks.length, "langs to", m.marker);
  src = src.slice(0, end) + "\n" + blocks.join("\n") + src.slice(end);
}

fs.writeFileSync(file, src);
console.log("done", cfg.file);
