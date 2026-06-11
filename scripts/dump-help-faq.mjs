#!/usr/bin/env node
/**
 * Dump the Help Center Q&A from web/src/lib/help-i18n.ts into a
 * single Markdown document organised by language → category → item.
 *
 * Usage:
 *   node scripts/dump-help-faq.mjs > HELP_CENTER_REVIEW.md
 *
 * Output goes to stdout so the caller controls the filename.
 *
 * Why: Gadi wants to hand the full Help Center copy to several AIs
 * (Claude / GPT / Gemini / etc.) at once for a copy-review pass. A
 * flat Markdown document is the universal interchange format; every
 * model accepts pasted Markdown and can react to it directly.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const helpPath = resolve(__dirname, "../web/src/lib/help-i18n.ts");
const source = readFileSync(helpPath, "utf8");

// The Object.assign block is a TypeScript literal. We pull the literal
// out as a string, run it through a tiny `eval` in a sandbox-ish way
// to materialise the JS object. Since the file is in our own repo and
// is read-only here, that's acceptable for a one-shot dump tool — we'd
// never do this in production runtime.
const start = source.indexOf("Object.assign(HELP, {");
const end = source.indexOf("} satisfies Partial<");
if (start < 0 || end < 0) {
  console.error("Couldn't find the HELP literal in help-i18n.ts");
  process.exit(1);
}
const literal = source.slice(start + "Object.assign(HELP, ".length, end + 1);

// Wrap in parens so it parses as an expression. The literal contains
// JS-only syntax (template literals, `as const`, etc. — we already cut
// the satisfies clause). It's safe to eval here because the input is
// our own committed source code.
let helpObject;
try {
  // eslint-disable-next-line no-eval
  helpObject = (0, eval)("(" + literal + ")");
} catch (e) {
  console.error("Failed to parse the HELP literal:", e.message);
  process.exit(1);
}

const langs = ["en", "he"];
const langNames = { en: "English", he: "עברית (Hebrew)" };

let out = "";
out += "# Gadit Help Center — Copy Review\n\n";
out += "Generated automatically from `web/src/lib/help-i18n.ts`.\n\n";
out += "**For the reviewer:** this is the full Help Center copy as it currently ships at https://www.gadit.app/contact in English and Hebrew. Please review for:\n\n";
out += "- Tone and voice (first person, no marketing fluff, founder style)\n";
out += "- Accuracy of the technical instructions (actual product behaviour)\n";
out += "- Clarity (each answer should end with a concrete next step)\n";
out += "- Style consistency (no em-dashes, no double-quotes mid-letter, no AI tells)\n";
out += "- Coverage gaps (questions a real user would ask that we don't answer)\n";
out += "- Localisation quality on the Hebrew side specifically\n\n";
out += "Reply with a list of specific corrections per item id, e.g. `billing.change-card paragraph 2: …`.\n\n";
out += "---\n\n";

for (const lang of langs) {
  const c = helpObject[lang];
  if (!c) continue;

  out += `# ${langNames[lang]}\n\n`;
  out += `**Page heading:** ${c.heading}\n\n`;
  out += `**Lede:** ${c.lede}\n\n`;
  out += `**Still stuck heading:** ${c.stillNeedHelpHeading}\n\n`;
  out += `**Still stuck body:** ${c.stillNeedHelpBody}\n\n`;
  out += `**Email CTA:** ${c.emailCta}\n\n`;
  out += `**Response time line:** ${c.responseTime}\n\n`;
  out += "---\n\n";

  for (const cat of c.categories) {
    out += `## ${cat.icon}  ${cat.title} (\`${cat.id}\`)\n\n`;
    for (const item of cat.items) {
      out += `### \`${item.id}\`\n\n`;
      out += `**Q:** ${item.q}\n\n`;
      out += `**A:**\n\n`;
      for (const para of item.a) {
        out += `> ${para}\n\n`;
      }
    }
    out += "---\n\n";
  }
}

process.stdout.write(out);
