/**
 * The etymology must say where the word came from, not what it means
 * (Gadi 2026-10-14: "גרב" came back with originalMeaning "כיסוי לרגל או
 * דלקת של כלי דם בעור", the two definitions again). When the model's
 * originalMeaning mostly repeats the words of the definitions, one dedicated
 * call (gpt-5.4, which knew the roots far better in a side-by-side test)
 * rewrites the source fields. It only runs in that case, about a cent.
 */
import { logAiUsage, usageFrom } from "@/lib/ai-cost";

type Ety = { sourceLanguage?: string; originalWord?: string; breakdown?: string; originalMeaning?: string; historyNote?: string; kidsExplanation?: string };
type Result = { meanings?: Array<{ meaning?: string }>; etymology?: Ety | null };

const STOP = new Set(["של", "או", "את", "על", "עם", "גם", "כמו", "זה", "זו", "the", "of", "or", "and", "a", "an", "to", "in"]);

function words(s: string): string[] {
  return (s || "")
    .normalize("NFD")
    .replace(/[֑-ׇ]/g, "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

/** True when originalMeaning is the definition again: most of its words
 *  appear in the definitions, or (Hebrew) it names neither a root like
 *  ג.ר.ב nor a source word in Latin letters, which is what "כיסוי לרגל" for
 *  "גרב" looked like (the definition said "המכסה את כף הרגל"). */
export function repeatsDefinition(r: Result): boolean {
  const raw = r?.etymology?.originalMeaning ?? "";
  const orig = words(raw);
  if (orig.length < 1) return false;
  const hebrew = /[א-ת]/.test(raw);
  const namesSource = /[א-ת]["'׳]?\.[א-ת]["'׳]?\.[א-ת]/.test(raw) || /[A-Za-zÀ-ɏ]{3,}/.test(raw);
  if (hebrew && !namesSource) return true;
  const defs = new Set(words((r.meanings ?? []).map((m) => m?.meaning ?? "").join(" ")));
  if (!defs.size) return false;
  const hit = orig.filter((w) => defs.has(w)).length;
  return hit / orig.length >= 0.6;
}

const strip = (s: unknown) => String(s ?? "").normalize("NFC").replace(/[֑-ׇ]/g, "").replace(/[–—]/g, ",").trim();

export async function fixEtymology<T>(result: T, word: string, uiLangName: string): Promise<T> {
  const r = result as unknown as Result;
  if (!r?.etymology || !repeatsDefinition(r)) return result;
  // Whatever happens below, the definition is never shown again as the origin.
  // The note that came with a repeated definition is usually as weak (for
  // "גרב" it cited a verse in Isaiah that is not there), so it goes too.
  const dropped = { ...(r as object), etymology: { ...r.etymology, originalMeaning: "", historyNote: "" } } as unknown as T;
  if (!process.env.OPENAI_API_KEY) return dropped;
  const defs = (r.meanings ?? []).map((m) => m?.meaning ?? "").filter(Boolean).join("; ");
  const sys = `You are an etymologist. The user gives a word and its current definitions. Explain WHERE THE WORD CAME FROM, not what it means today. All text in ${uiLangName}. Return JSON only:
{"sourceLanguage": "<the language the word came from, e.g. Persian, Arabic, Aramaic, Biblical Hebrew, Greek, written in ${uiLangName}>",
 "originalWord": "<the source word in Latin transliteration when the source language differs from the word's own language; else empty>",
 "originalMeaning": "<one sentence: the source word or the ROOT (for Hebrew/Arabic in dotted form, e.g. ס.מ.ר) and its original concrete sense, and the path it took. NEVER repeat or paraphrase the current definitions>",
 "historyNote": "<1-3 sentences: first appearance (Bible, Mishnah, Talmud, a coiner) and sister-language cognates. Never a law, a school subject or today's usage. Empty if unknown>",
 "confidence": "<high only when this etymology is the one standard dictionaries (Even-Shoshan, Klein, Wiktionary) give; otherwise low>"}
No niqqud. Never invent: a guessed origin is worse than none. If you are not sure, set confidence to low.`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({ model: "gpt-5.4", reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "system", content: sys }, { role: "user", content: `Word: ${word}\nCurrent definitions (do not repeat): ${defs}` }] }),
    });
    if (!res.ok) return dropped;
    const data = await res.json();
    const u = usageFrom(data);
    void logAiUsage({ feature: "etymology_fix", model: "gpt-5.4", tokensIn: u.tokensIn, tokensOut: u.tokensOut });
    const j = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as Ety & { confidence?: string };
    // Not sure: show no origin rather than a guessed one (the definition repeat goes too).
    if (String(j.confidence ?? "").toLowerCase() !== "high") {
      return dropped;
    }
    const fixed: Ety = {
      ...r.etymology,
      sourceLanguage: strip(j.sourceLanguage) || r.etymology.sourceLanguage,
      originalWord: strip(j.originalWord),
      originalMeaning: strip(j.originalMeaning),
      historyNote: strip(j.historyNote),
    };
    // Still a repeat, or empty: keep the source language, drop the repeat.
    if (!fixed.originalMeaning || repeatsDefinition({ meanings: r.meanings, etymology: fixed })) {
      return dropped;
    }
    console.info(`[define] etymology rewritten for "${word}" (repeated the definition)`);
    return { ...(r as object), etymology: fixed } as unknown as T;
  } catch {
    return dropped;
  }
}
