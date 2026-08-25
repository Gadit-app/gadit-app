/* Splice the 17 missing-language entries into WordPopover + UpgradeModal.
 * Reads scratchpad/modals-i18n.json (keyed by lang), inserts each surface's
 * entries just before its COPY object's closing "\n};". Idempotent-ish: it
 * skips a language that already appears as a key in that object. */
const fs = require("fs");
const path = require("path");

const JSON_PATH = "C:\\Users\\gadib\\AppData\\Local\\Temp\\claude\\c--Users-gadib-gadit-app\\a58faa26-e863-4fc7-a78f-e012b1299627\\scratchpad\\modals-i18n.json";
const ROOT = path.resolve(__dirname, "..");
const WP = path.join(ROOT, "src", "components", "design", "WordPopover.tsx");
const UM = path.join(ROOT, "src", "components", "UpgradeModal.tsx");

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const langs = Object.keys(data);

function keyLit(l) {
  return /[^a-z]/.test(l) ? JSON.stringify(l) : l; // "zh-CN" needs quotes
}
function spliceInto(file, marker, buildBlock) {
  let src = fs.readFileSync(file, "utf8");
  const i = src.indexOf(marker);
  if (i < 0) throw new Error("marker not found in " + file);
  const end = src.indexOf("\n};", i);
  if (end < 0) throw new Error("closing not found in " + file);
  const already = src.slice(i, end);
  const blocks = [];
  for (const l of langs) {
    const kl = keyLit(l);
    if (already.includes("\n  " + kl + ":") ) continue; // already present
    blocks.push(buildBlock(l, kl, data[l]));
  }
  if (!blocks.length) { console.log("nothing to add to", path.basename(file)); return; }
  const out = src.slice(0, end) + "\n" + blocks.join("\n") + src.slice(end);
  fs.writeFileSync(file, out);
  console.log("added", blocks.length, "langs to", path.basename(file));
}

// WordPopover: one-line entries
spliceInto(WP, "const COPY:", (l, kl, d) => {
  const w = d.wordPopover;
  return `  ${kl}: { openFull: ${JSON.stringify(w.openFull)}, loading: ${JSON.stringify(w.loading)}, noPreview: ${JSON.stringify(w.noPreview)} },`;
});

// UpgradeModal: full multi-line Copy blocks
spliceInto(UM, "const COPY: Record<string, Copy>", (l, kl, d) => {
  const u = d.upgrade;
  const fn = u.featureNames, fb = u.featureBlurbs;
  return `  ${kl}: {
    featureNames: {
      image: ${JSON.stringify(fn.image)},
      kids: ${JSON.stringify(fn.kids)},
      compose: ${JSON.stringify(fn.compose)},
      notebook: ${JSON.stringify(fn.notebook)},
      quiz: ${JSON.stringify(fn.quiz)},
      compare: ${JSON.stringify(fn.compare)},
    },
    featureBlurbs: {
      image: ${JSON.stringify(fb.image)},
      kids: ${JSON.stringify(fb.kids)},
      compose: ${JSON.stringify(fb.compose)},
      notebook: ${JSON.stringify(fb.notebook)},
      quiz: ${JSON.stringify(fb.quiz)},
      compare: ${JSON.stringify(fb.compare)},
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: ${JSON.stringify(u.tierIs.clear)}, deep: ${JSON.stringify(u.tierIs.deep)} },
    pricePerMonth: { clear: ${JSON.stringify(u.pricePerMonth.clear)}, deep: ${JSON.stringify(u.pricePerMonth.deep)} },
    trialNote: ${JSON.stringify(u.trialNote)},
    primaryCta: ${JSON.stringify(u.primaryCta)},
    secondaryCta: ${JSON.stringify(u.secondaryCta)},
    closeAria: ${JSON.stringify(u.closeAria)},
  },`;
});
