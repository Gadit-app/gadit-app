/**
 * Translates the help window's words (lib/help-chat/ui.ts) and the brand line
 * of every page (components/BrandMark.tsx) into every interface language.
 *
 *   npx tsx --env-file=.env.local scripts/help-chat-ui-i18n.ts [--only ar,ru]
 *
 * Writes src/lib/help-chat/ui-i18n.json and src/lib/brand-i18n.json. Runs in
 * parallel, a few languages at a time; a language that already has both keeps
 * them unless --force.
 */
import fs from "node:fs";
import path from "node:path";
import { LANGUAGES } from "@/lib/i18n";
import { HELP_UI_EN, HELP_UI_HE } from "@/lib/help-chat/ui-base";

const HELP_OUT = path.join(process.cwd(), "src/lib/help-chat/ui-i18n.json");
const BRAND_OUT = path.join(process.cwd(), "src/lib/brand-i18n.json");
const BRAND_EN = { rights: "All rights reserved to Gadit", home: "Back to Gadit" };
const BRAND_HE = { rights: "כל הזכויות שמורות ל-Gadit", home: "חזרה ל-Gadit" };

const read = (p: string) => { try { return JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, unknown>; } catch { return {}; } };

async function translate(code: string, label: string): Promise<{ help: unknown; brand: unknown }> {
  let en = "";
  try { en = new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? ""; } catch { /* label only */ }
  const prompt = `Translate the JSON values below into ${en || label} (${label}, code ${code}) for the interface of Gadit, a dictionary and learning app for families.
Rules:
- Natural, warm, everyday words a parent in that language would use. Polite address to the reader; where the language has a plural or polite "you", use it.
- The assistant speaks as "we" (the team), never "I".
- Keep "Gadit" in Latin letters, and keep "support@gadit.app" exactly.
- No long dashes (— or –).
- Keep the JSON shape and keys exactly; translate only the values. "starters" are questions a parent taps.
English source:
${JSON.stringify({ help: HELP_UI_EN, brand: BRAND_EN }, null, 1)}
Hebrew version, for meaning:
${JSON.stringify({ help: HELP_UI_HE, brand: BRAND_HE }, null, 1)}`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "gpt-5.4", temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }),
  });
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number } };
  const raw = data.choices?.[0]?.message?.content ?? "";
  const j = JSON.parse(raw) as { help?: Record<string, unknown>; brand?: Record<string, unknown> };
  const keys = Object.keys(HELP_UI_EN);
  if (!j.help || !keys.every((k) => k in j.help!) || !Array.isArray(j.help.starters) || (j.help.starters as unknown[]).length !== 6 || !j.brand?.rights || !j.brand?.home) throw new Error(`${code}: bad shape`);
  const u = data.usage ?? {};
  console.log(`${code}: ok ($${(((u.prompt_tokens ?? 0) * 2.5 + (u.completion_tokens ?? 0) * 15) / 1e6).toFixed(4)})`);
  return { help: j.help, brand: j.brand };
}

async function main() {
  const onlyArg = process.argv.indexOf("--only");
  const only = onlyArg > 0 ? new Set(process.argv[onlyArg + 1].split(",")) : null;
  const force = process.argv.includes("--force");
  const help = read(HELP_OUT), brand = read(BRAND_OUT);
  brand.he = BRAND_HE; brand.en = BRAND_EN;
  const todo = LANGUAGES.filter((l) => l.code !== "he" && l.code !== "en" && (!only || only.has(l.code)) && (force || !help[l.code] || !brand[l.code]));
  for (let i = 0; i < todo.length; i += 6) {
    const batch = todo.slice(i, i + 6);
    const got = await Promise.allSettled(batch.map((l) => translate(l.code, l.label)));
    got.forEach((g, k) => {
      const code = batch[k].code;
      if (g.status === "fulfilled") { help[code] = g.value.help; brand[code] = g.value.brand; } else console.error(`${code}: FAILED ${g.reason}`);
    });
    fs.writeFileSync(HELP_OUT, JSON.stringify(help, null, 1) + "\n");
    fs.writeFileSync(BRAND_OUT, JSON.stringify(brand, null, 1) + "\n");
  }
  console.log(`help: ${Object.keys(help).length} languages, brand: ${Object.keys(brand).length}`);
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
