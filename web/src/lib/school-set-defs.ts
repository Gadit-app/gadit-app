import "server-only";
import { logAiUsage, costWithCache, TEXT_MODEL } from "@/lib/ai-cost";
import { devDryAi } from "@/lib/dev-safety";
import { uiLangName } from "@/lib/word-examples";
import type { SchoolSetLevel } from "@/lib/school-set-ids";

/**
 * Per-set definitions of a school's own word set (Gadi 2026-10-17: "the
 * definition must be relevant to the word on screen"). One batched call per
 * save: every word that has no definition yet gets one short definition in
 * the sense of the lesson (the set's name is the lesson topic), at the set's
 * level and in its language. Same rules as the curriculum units'
 * definitions (lib/curriculum-sets.ts) and their quality pass
 * (scripts/curriculum/qa-hebrew-sets.mjs): one or two sentences, up to 160
 * characters, the meaning in this lesson only, no long dashes, no
 * addressing the student. The projector, the picture prompt, the examples
 * and the class quiz all read these through classroomDef.
 *
 * A second opinion checks every new definition before it is saved (Gadi
 * 2026-10-17: a wrong word such as "לגבולות" for "לטיפות" must never reach a
 * projector): the flagged ones are rewritten once with the reviewer's reason
 * and checked again; what still fails is saved without a definition and
 * written later (writeSetDefs). Costs: school_set_defs, school_set_defs_qa.
 */

const LEVEL_HE: Record<SchoolSetLevel, string> = {
  elementary: "בית ספר יסודי (כיתות א עד ו)",
  secondary: "חטיבת ביניים ותיכון (כיתות ז עד יב)",
};
const LEVEL_EN: Record<SchoolSetLevel, string> = {
  elementary: "primary school (grades 1 to 6, ages 6 to 12)",
  secondary: "middle and high school (grades 7 to 12, ages 12 to 18)",
};

function clean(s: unknown, max: number): string {
  return String(s ?? "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+/g, " ").trim().slice(0, max);
}
/** Same word for matching the model's reply: marks, quotes and case ignored. */
const norm = (w: string) => w.normalize("NFD").replace(/\p{M}/gu, "").replace(/["'״׳“”]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

/** `issues`: a second try of definitions the check rejected, with the reason. */
function prompts(words: string[], title: string, level: SchoolSetLevel, lang: string, issues?: Record<string, string>): { sys: string; user: string } {
  const list = words.map((w, i) => `${i + 1}. ${w}`).join("\n");
  const retry = issues ? words.map((w) => `- ${w}: ${issues[w] ?? ""}`).join("\n") : "";
  if (lang === "he") {
    return {
      sys: "אתה מומחה לתוכניות הלימודים של משרד החינוך בישראל וכותב הגדרות קצרות למילות מפתח של שיעור, כמו במילון בית ספרי. אתה קפדן ומדויק. החזר JSON בלבד.",
      user: `שכבה: ${LEVEL_HE[level]}.
נושא השיעור (השם שהמורה נתן לרשימה): "${title}".
מילות המפתח של השיעור:
${list}

כתוב לכל מילה הגדרה אחת במשמעות שלה בשיעור הזה.
כללים:
- כשלמילה יש כמה משמעויות, בחר את המשמעות שמתאימה לנושא השיעור ולשאר המילים ברשימה. מילה שלא קשורה לנושא מקבלת את המשמעות הנפוצה שלה בבית הספר.
- משפט אחד או שניים (עד 160 תווים), ברמה שמתאימה ל${LEVEL_HE[level]}, בעברית פשוטה וברורה בכתיב מלא, בלי ניקוד.
- ההגדרה לא פותחת בחזרה על המילה ("X הוא..."), אלא מסבירה את המשמעות ישירות.
- נכונה עובדתית ומדויקת להקשר. בדוק דקדוק: התאמה במין ובמספר.
- בלי מקפים ארוכים. ניסוח כללי, בלי פנייה לתלמיד.
- החזר את המילה בדיוק כפי שהיא כתובה ברשימה, ולכל מילה ברשימה הגדרה.${retry ? `\nהגדרות קודמות של המילים האלה נפסלו בבדיקה מהסיבות הבאות. כתוב הגדרות חדשות ונכונות:\n${retry}` : ""}
החזר: {"defs":[{"w":"","d":""}]}`,
    };
  }
  const langName = uiLangName(lang);
  const extra = lang === "ar"
    ? "\n- Write each definition in clear, simple Modern Standard Arabic (الفصحى), without tashkeel, with standard hamza spelling. Check grammar: gender and number agreement."
    : lang === "en" ? "" : `\n- Write each definition in simple, correct ${langName}.`;
  return {
    sys: "You are an expert school curriculum writer who writes short definitions of a lesson's key words, like a school dictionary. You are careful and precise. Return JSON only.",
    user: `Level: ${LEVEL_EN[level]}.
Lesson topic (the name the teacher gave the list): "${title}".
The lesson's key words (${langName}):
${list}

Write ONE definition for each word, in its meaning in THIS lesson.
Rules:
- When a word has several meanings, choose the one that fits the lesson topic and the other words of the list. A word unrelated to the topic gets its most common school meaning.
- One or two sentences (up to 160 characters), at the level of ${LEVEL_EN[level]}, in clear, simple language.${extra}
- The definition does not start by repeating the word ("X is..."); it explains the meaning directly.
- Factually correct and precise for the context.
- No long dashes. General wording, not addressing the student.
- Return each word exactly as written in the list, with a definition for every word.${retry ? `\nEarlier definitions of these words failed a review for these reasons. Write new, correct ones:\n${retry}` : ""}
Return: {"defs":[{"w":"","d":""}]}`,
  };
}

/** The second opinion (same idea as scripts/curriculum/qa-hebrew-sets.mjs):
 *  a strict reviewer flags each definition that must not reach a projector. */
function qaPrompts(defs: Record<string, string>, title: string, level: SchoolSetLevel, lang: string): { sys: string; user: string } {
  const rows = Object.entries(defs).map(([w, d], i) => `${i + 1}. ${w}: ${d}`).join("\n");
  if (lang === "he") {
    return {
      sys: "אתה עורך לשון ומומחה לתוכניות הלימודים של משרד החינוך בישראל, ובודק הגדרות של מילות מפתח לשיעור לפני שהן מוקרנות בכיתה. אתה קפדן מאוד. החזר JSON בלבד.",
      user: `שכבה: ${LEVEL_HE[level]}.
נושא השיעור: "${title}".
ההגדרות:
${rows}

סמן כל הגדרה שיש בה אחת מהבעיות האלה:
1. שגיאה עובדתית או הגדרה לא מדויקת.
2. לא המשמעות של המילה בשיעור הזה (משמעות אחרת של המילה).
3. שגיאת לשון: מילה שגויה או לא קיימת במקום מילה נכונה (למשל "לגבולות" במקום "לטיפות"), שגיאת כתיב, או חוסר התאמה במין ובמספר.
4. ההגדרה פותחת בחזרה על המילה עצמה.
5. מקף ארוך, או פנייה ישירה לתלמיד.
6. לא מתאימה לרמת השכבה.
אל תסמן הגדרה טובה בגלל ניסוח שאפשר לשפר. סמן רק בעיה אמיתית.
החזר: {"flags":[{"w":"","issue":"משפט קצר שמתאר את הבעיה"}]} (רשימה ריקה אם הכל תקין).`,
    };
  }
  return {
    sys: "You are a language editor and school curriculum expert who reviews the definitions of a lesson's key words before they are projected in class. You are very strict. Return JSON only.",
    user: `Level: ${LEVEL_EN[level]}.
Lesson topic: "${title}".
Language of the definitions: ${uiLangName(lang)}.
The definitions:
${rows}

Flag every definition that has one of these problems:
1. A factual error or an imprecise definition.
2. Not the word's meaning in THIS lesson (another sense of the word).
3. A language error: a wrong or non-existent word in place of the right one, a misspelling, or wrong gender or number agreement.
4. The definition starts by repeating the word itself.
5. A long dash, or addressing the student directly.
6. Not suited to the level.
Do not flag a good definition only because it could be worded better. Flag real problems only.
Return: {"flags":[{"w":"","issue":"one short sentence describing the problem"}]} (an empty list if all are fine).`,
  };
}

type Usage = { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } };
export type CallCost = { costUsd: number; tokensIn: number; tokensOut: number; cachedIn: number };

/** One JSON call to the main text model, its cost logged under `feature`. */
async function callJson(sys: string, user: string, feature: string, timeoutMs: number): Promise<{ data: Record<string, unknown> } & CallCost> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: TEXT_MODEL,
      // Reasoning models take an effort level instead of a temperature (as the curriculum units).
      ...(TEXT_MODEL.startsWith("gpt-5") ? { reasoning_effort: "low" } : { temperature: 0.2 }),
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
    }),
    signal: AbortSignal.timeout(Math.max(5_000, timeoutMs)),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; usage?: Usage };
  const tokensIn = json.usage?.prompt_tokens ?? 0, tokensOut = json.usage?.completion_tokens ?? 0;
  const cachedIn = json.usage?.prompt_tokens_details?.cached_tokens ?? 0;
  const costUsd = costWithCache(TEXT_MODEL, tokensIn, cachedIn, tokensOut);
  void logAiUsage({ feature, model: TEXT_MODEL, tokensIn, tokensOut, costUsd, plan: "schools" });
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as Record<string, unknown>; } catch { /* empty */ }
  return { data, costUsd, tokensIn, tokensOut, cachedIn };
}

/** The model's rows back on the words as the teacher wrote them. */
function byWord(words: string[], rows: unknown, field: "d" | "issue"): Record<string, string> {
  const list = Array.isArray(rows) ? (rows as Array<Record<string, unknown>>) : [];
  const byNorm = new Map(words.map((w) => [norm(w), w]));
  const out: Record<string, string> = {};
  list.forEach((r, i) => {
    const raw = String(r?.[field] ?? "");
    const v = field === "d" ? clean(raw, 300) : raw.replace(/\s+/g, " ").trim().slice(0, 200);
    if (!v) return;
    // By position when the model changed a word's spelling (definitions only).
    const w = byNorm.get(norm(String(r?.w ?? ""))) ?? (field === "d" && list.length === words.length ? words[i] : undefined);
    if (w && !out[w]) out[w] = v;
  });
  return out;
}

/** Problems found without a model: opening with the word, a long dash. */
function localIssues(raw: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [w, d] of Object.entries(raw)) {
    if (/[–—]/.test(d)) out[w] = "long dash";
    else if (norm(d).startsWith(norm(w) + " ")) out[w] = "starts by repeating the word";
  }
  return out;
}

export type SetDefsResult = CallCost & { defs: Record<string, string>; flagged: string[]; dropped: string[]; calls: number; ms: number };

/** Definitions for `words` only (no check), or throws. Exported for tests. */
export async function generateSetDefs(words: string[], title: string, level: SchoolSetLevel, lang: string, issues?: Record<string, string>, timeoutMs = 50_000): Promise<{ defs: Record<string, string>; raw: Record<string, string> } & CallCost> {
  const { sys, user } = prompts(words, title || "-", level, lang, issues);
  const out = await callJson(sys, user, "school_set_defs", timeoutMs);
  // Raw text kept for the dash check; the stored text has dashes replaced.
  const raw: Record<string, string> = {};
  const rows = Array.isArray(out.data.defs) ? (out.data.defs as Array<Record<string, unknown>>) : [];
  const words2 = byWord(words, rows, "d");
  for (const r of rows) {
    const w = Object.keys(words2).find((x) => norm(x) === norm(String(r?.w ?? "")));
    if (w) raw[w] = String(r?.d ?? "");
  }
  return { ...out, defs: words2, raw };
}

/** The check alone: word -> issue, for every definition that fails. Exported for tests. */
export async function checkSetDefs(defs: Record<string, string>, title: string, level: SchoolSetLevel, lang: string, timeoutMs = 40_000): Promise<{ flags: Record<string, string> } & CallCost> {
  if (!Object.keys(defs).length) return { flags: {}, costUsd: 0, tokensIn: 0, tokensOut: 0, cachedIn: 0 };
  const { sys, user } = qaPrompts(defs, title || "-", level, lang);
  const out = await callJson(sys, user, "school_set_defs_qa", timeoutMs);
  return { ...out, flags: byWord(Object.keys(defs), out.data.flags, "issue") };
}

/**
 * Write and check the definitions of `words`: generate (one call), review
 * (one call), rewrite only the flagged ones with the reviewer's reasons (one
 * call), review those again (one call). A definition still flagged, or not
 * reached within `budgetMs`, is left out: the set is saved without it and
 * the lazy retry writes it later (the dictionary is the last resort).
 * Throws only when the first call fails.
 */
export async function writeSetDefs(words: string[], title: string, level: SchoolSetLevel, lang: string, budgetMs = 85_000): Promise<SetDefsResult> {
  const t0 = Date.now();
  const left = () => budgetMs - (Date.now() - t0);
  const none = { costUsd: 0, tokensIn: 0, tokensOut: 0, cachedIn: 0 };
  if (!words.length) return { ...none, defs: {}, flagged: [], dropped: [], calls: 0, ms: 0 };
  // Local test mode: placeholder definitions, no model call.
  if (devDryAi()) return { ...none, defs: Object.fromEntries(words.map((w) => [w, `[dry] ${w} (${level})`])), flagged: [], dropped: [], calls: 0, ms: 0 };
  if (!process.env.OPENAI_API_KEY) throw new Error("not_configured");

  const total = { ...none };
  let calls = 0;
  const add = (c: CallCost) => { calls++; total.costUsd += c.costUsd; total.tokensIn += c.tokensIn; total.tokensOut += c.tokensOut; total.cachedIn += c.cachedIn; };

  const first = await generateSetDefs(words, title, level, lang, undefined, Math.min(55_000, left()));
  add(first);
  const defs = { ...first.defs };
  if (!Object.keys(defs).length) throw new Error("no_defs");

  /** Review `subset`: model flags plus the local checks; a failed review flags everything (never trusted unchecked). */
  const review = async (subset: Record<string, string>, raw: Record<string, string>): Promise<Record<string, string>> => {
    const local = localIssues(raw);
    if (left() < 8_000) return Object.fromEntries(Object.keys(subset).map((w) => [w, local[w] ?? "not reviewed in time"]));
    try {
      const qa = await checkSetDefs(subset, title, level, lang, Math.min(40_000, left()));
      add(qa);
      return { ...qa.flags, ...local };
    } catch {
      return Object.fromEntries(Object.keys(subset).map((w) => [w, local[w] ?? "review failed"]));
    }
  };

  let flags = await review(defs, first.raw);
  const flagged = Object.keys(flags);
  if (flagged.length && left() > 20_000) {
    try {
      const again = await generateSetDefs(flagged, title, level, lang, flags, Math.min(40_000, left()));
      add(again);
      for (const w of flagged) delete defs[w];
      Object.assign(defs, again.defs);
      flags = Object.keys(again.defs).length ? await review(again.defs, again.raw) : Object.fromEntries(flagged.map((w) => [w, "not rewritten"]));
      for (const w of flagged) if (!again.defs[w]) flags[w] = flags[w] ?? "not rewritten";
    } catch { /* the flagged ones stay flagged */ }
  }
  const dropped = Object.keys(flags);
  for (const w of dropped) delete defs[w];
  return { ...total, defs, flagged, dropped, calls, ms: Date.now() - t0 };
}

