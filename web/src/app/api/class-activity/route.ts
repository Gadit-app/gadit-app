import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { getWordSet, classroomDef } from "@/lib/word-sets";
import { logAiUsage, usageFrom } from "@/lib/ai-cost";

/**
 * Whole-class activities for a word-set word on the teacher's projector
 * (Gadi 2026-10-03): a 3-question class quiz and a 5-statement "true or
 * false" class game, pinned to the word's curriculum meaning and the set's
 * grade. Curriculum words only (the word must belong to the set), so the
 * total is bounded (~450 words); every result is cached forever in
 * Firestore classActivity/{hash}, so each word is generated once.
 *
 * GET /api/class-activity?set=<setId>&word=<w>[&meaning=<m>]
 * → { quiz: QuizItem[], game: GameItem[], cached }
 */
export const runtime = "nodejs";
export const maxDuration = 45;

export type QuizItem = { q: string; options: string[]; answer: number; explain: string };
export type GameItem = { s: string; t: boolean; explain: string };

const VERSION = "v2"; // v2: stricter grammar + answers must match the given meaning

function shuffleQuiz(items: QuizItem[], seed: string): QuizItem[] {
  // Deterministic per word so a re-render never reshuffles mid-lesson.
  let h = parseInt(crypto.createHash("sha1").update(seed).digest("hex").slice(0, 8), 16);
  const rnd = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
  return items.map((it) => {
    const order = it.options.map((_, i) => i).sort(() => rnd() - 0.5);
    return { ...it, options: order.map((i) => it.options[i]), answer: order.indexOf(it.answer) };
  });
}

function clean(s: unknown, max: number): string {
  return String(s ?? "").replace(/[–—]/g, ",").replace(/\s+/g, " ").trim().slice(0, max);
}

async function generate(word: string, meaning: string, lang: string, grade: string, topic: string) {
  const he = lang === "he";
  const sys = he
    ? `אתה כותב פעילויות כיתתיות קצרות לתלמידי ${grade || "בית ספר יסודי"} בישראל, בעברית תקנית בכתיב מלא. הפעילות מוקרנת על הלוח והמורה מנהלת אותה מול כל הכיתה.
כללים: שפה פשוטה שמתאימה לגיל. בלי מקפים ארוכים. בלי פנייה בגוף שני יחיד (אפשר בלשון רבים לכיתה או בניסוח כללי). רק תשובה נכונה אחת בכל שאלה, והיא חייבת להתאים בדיוק להגדרה שקיבלת, בלי לשנות אותה. המסיחים סבירים אבל ברור שהם שגויים למי שהבין. בודקים הבנה של המשמעות, לא ידע על אותיות המילה. בדוק דקדוק לפני שאתה מחזיר: התאמה במין ובמספר (למשל "שתי מילים", לא "שני מילים"), וכל משפט "נכון" חייב להיות נכון לגמרי לפי ההגדרה.
החזר JSON בלבד.`
    : `You write short whole-class activities for ${grade || "primary school"} students, in clear, simple English. The activity is projected and the teacher runs it with the whole class.
Rules: age-appropriate wording. No long dashes. Exactly one correct answer per question, and it must match the given meaning exactly; distractors are plausible but clearly wrong to someone who understood. Every "true" statement must be fully true according to the given meaning. Test understanding of the meaning, not spelling trivia.
Return JSON only.`;
  const user = he
    ? `המילה: "${word}"\nהמשמעות בשיעור (נושא: ${topic}): ${meaning}\n\nכתוב:\n1. "quiz": 3 שאלות בחירה, לכל אחת 4 תשובות. שאלה 1 על המשמעות, שאלה 2 על שימוש במילה במשפט או במצב מהחיים, שאלה 3 שמבדילה בינה לבין מילה דומה או קשורה. שדות: q (עד 90 תווים), options (4, עד 45 תווים כל אחת), answer (מספר התשובה הנכונה 0-3), explain (משפט אחד קצר שמסביר למה).\n2. "game": 5 משפטי "נכון או לא נכון" על המילה, 3 נכונים ו־2 לא נכונים, בסדר מעורבב. שדות: s (עד 90 תווים), t (true/false), explain (משפט אחד קצר).`
    : `Word: "${word}"\nMeaning in this lesson (topic: ${topic}): ${meaning}\n\nWrite:\n1. "quiz": 3 multiple-choice questions, 4 options each. Q1 about the meaning, Q2 about using the word in a sentence or real situation, Q3 telling it apart from a similar or related word. Fields: q (max 90 chars), options (4, max 45 chars each), answer (index 0-3 of the correct option), explain (one short sentence why).\n2. "game": 5 true-or-false statements about the word, 3 true and 2 false, mixed order. Fields: s (max 90 chars), t (true/false), explain (one short sentence).`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const u = usageFrom(json);
  void logAiUsage({ feature: "class_activity", model: "gpt-4o", tokensIn: u.tokensIn, tokensOut: u.tokensOut });
  const raw = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as { quiz?: unknown[]; game?: unknown[] };
  const quiz: QuizItem[] = (raw.quiz ?? []).map((x) => {
    const o = x as Record<string, unknown>;
    const options = Array.isArray(o.options) ? o.options.slice(0, 4).map((v) => clean(v, 60)) : [];
    return { q: clean(o.q, 120), options, answer: Number(o.answer), explain: clean(o.explain, 160) };
  }).filter((q) => q.q && q.options.length === 4 && q.answer >= 0 && q.answer < 4 && q.options.every(Boolean)).slice(0, 3);
  const game: GameItem[] = (raw.game ?? []).map((x) => {
    const o = x as Record<string, unknown>;
    return { s: clean(o.s, 120), t: o.t === true || o.t === "true", explain: clean(o.explain, 160) };
  }).filter((g) => g.s).slice(0, 5);
  if (quiz.length < 2 || game.length < 3) throw new Error("bad_activity");
  return { quiz: shuffleQuiz(quiz, `${word}|${meaning}`), game };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const setId = (sp.get("set") ?? "").trim();
  const word = (sp.get("word") ?? "").trim();
  const set = setId ? getWordSet(setId) : undefined;
  if (!set || !word) return NextResponse.json({ error: "bad_params" }, { status: 400 });
  if (!set.words.some((w) => w.trim().toLowerCase() === word.toLowerCase())) {
    return NextResponse.json({ error: "not_in_set" }, { status: 404 });
  }
  const meaning = (classroomDef(set.id, word) ?? sp.get("meaning") ?? "").trim().slice(0, 300);
  if (!meaning) return NextResponse.json({ error: "no_meaning" }, { status: 404 });

  const db = getAdminDb();
  const key = crypto.createHash("sha1").update(`${VERSION}|${set.lang}|${set.id}|${word}|${meaning}`).digest("hex");
  const ref = db.collection("classActivity").doc(key);
  try {
    const snap = await ref.get();
    if (snap.exists) {
      const d = snap.data() as { quiz: QuizItem[]; game: GameItem[] };
      return NextResponse.json({ quiz: d.quiz, game: d.game, cached: true });
    }
  } catch { /* cache read best-effort */ }
  try {
    const out = await generate(word, meaning, set.lang, set.grade ?? "", set.title);
    try { await ref.set({ ...out, word, setId: set.id, lang: set.lang, meaning, at: new Date().toISOString() }); } catch { /* ignore */ }
    return NextResponse.json({ ...out, cached: false });
  } catch (e) {
    return NextResponse.json({ error: "generate_failed", detail: String(e) }, { status: 502 });
  }
}
