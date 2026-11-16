/**
 * Translates the "Switch to Family" box (lib/family-switch/ui-base.ts) into
 * every interface language.
 *
 *   npx tsx --env-file=.env.local scripts/family-switch-i18n.ts [--only ar,ru] [--force]
 *
 * Writes src/lib/family-switch/ui-i18n.json, a few languages at a time.
 */
import fs from "node:fs";
import path from "node:path";
import { LANGUAGES } from "@/lib/i18n";
import { FAMILY_SWITCH_EN, FAMILY_SWITCH_HE } from "@/lib/family-switch/ui-base";

const OUT = path.join(process.cwd(), "src/lib/family-switch/ui-i18n.json");
const read = () => { try { return JSON.parse(fs.readFileSync(OUT, "utf8")) as Record<string, unknown>; } catch { return {}; } };

async function translate(code: string, label: string): Promise<Record<string, string>> {
  let en = "";
  try { en = new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? ""; } catch { /* label only */ }
  const prompt = `Translate the JSON values below into ${en || label} (${label}, code ${code}) for the account page of Gadit, a dictionary and learning app for families. This box lets a paying subscriber switch their plan to the Family plan.
Rules:
- Natural, clear words a parent in that language would use; polite address to the reader (plural or polite "you" where the language has one).
- Keep "Gadit", "Family" (the plan's name) and "support@gadit.app" exactly in Latin letters.
- Keep the placeholders {amount} and {price} exactly as they are.
- No long dashes (— or –).
- Keep the JSON keys; translate only the values.
English source:
${JSON.stringify(FAMILY_SWITCH_EN, null, 1)}
Hebrew version, for meaning:
${JSON.stringify(FAMILY_SWITCH_HE, null, 1)}`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "gpt-5.4", temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }),
  });
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number } };
  const j = JSON.parse(data.choices?.[0]?.message?.content ?? "") as Record<string, string>;
  const keys = Object.keys(FAMILY_SWITCH_EN);
  if (!keys.every((k) => typeof j[k] === "string" && j[k].length > 0)) throw new Error(`${code}: bad shape`);
  if (!j.now.includes("{amount}") || !j.nextMonth.includes("{price}") || !j.nextYear.includes("{price}") || !j.fail.includes("support@gadit.app")) throw new Error(`${code}: lost a placeholder`);
  if (/[—–]/.test(Object.values(j).join(" "))) throw new Error(`${code}: long dash`);
  const u = data.usage ?? {};
  console.log(`${code}: ok ($${(((u.prompt_tokens ?? 0) * 2.5 + (u.completion_tokens ?? 0) * 15) / 1e6).toFixed(4)})`);
  return Object.fromEntries(keys.map((k) => [k, j[k]]));
}

async function main() {
  const onlyArg = process.argv.indexOf("--only");
  const only = onlyArg > 0 ? new Set(process.argv[onlyArg + 1].split(",")) : null;
  const force = process.argv.includes("--force");
  const out = read();
  const todo = LANGUAGES.filter((l) => l.code !== "he" && l.code !== "en" && (!only || only.has(l.code)) && (force || !out[l.code]));
  for (let i = 0; i < todo.length; i += 6) {
    const batch = todo.slice(i, i + 6);
    const got = await Promise.allSettled(batch.map((l) => translate(l.code, l.label)));
    got.forEach((g, k) => { if (g.status === "fulfilled") out[batch[k].code] = g.value; else console.error(`${batch[k].code}: FAILED ${g.reason}`); });
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
  }
  console.log(`${Object.keys(out).length} languages`);
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
