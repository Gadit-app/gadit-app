import { getAdminDb } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom } from "@/lib/ai-cost";
import { getWordSet, registerWordSet, isCurriculumSetId, type WordSet } from "@/lib/word-sets";
import { curTopic, curSubject, curLevelHe, gradeLabel, SUBJECT_LANG } from "@/lib/curriculum-catalog";

// Server side of the curriculum catalog (Gadi 2026-10-03). A topic's key
// words and their in-lesson definitions are generated once with gpt-4o the
// first time anyone opens the topic, then served from Firestore
// curriculumSets/{topicId} forever. Only ids that exist in the catalog can
// be generated, so the total cost is bounded (~1,600 topics, ~1¢ each).

export type CurriculumSetDoc = { set: WordSet; defs: Record<string, string> };

const VERSION = "v1";
const LANG_NAME: Record<string, string> = {
  en: "English", ar: "Arabic", fr: "French", es: "Spanish", ru: "Russian", de: "German",
  it: "Italian", "zh-CN": "Simplified Chinese", am: "Amharic", pt: "Portuguese", fa: "Persian",
};

function clean(s: unknown, max: number): string {
  return String(s ?? "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+/g, " ").trim().slice(0, max);
}

async function generate(topicId: string): Promise<CurriculumSetDoc | null> {
  const t = curTopic(topicId);
  const subj = t ? curSubject(t.s) : undefined;
  if (!t || !subj) return null;
  const lang = SUBJECT_LANG[subj.key] ?? "he";
  const grade = gradeLabel(t.g) || curLevelHe(t.l);
  const foreign = lang !== "he";
  const sys = "אתה מומחה לתוכניות הלימודים של משרד החינוך בישראל ובונה רשימות מילות מפתח לשיעור. החזר JSON בלבד.";
  const user = `מקצוע: ${subj.he}${subj.dati ? " (חינוך ממלכתי דתי)" : ""}. שכבה: ${curLevelHe(t.l)}, ${grade}.
יחידת הלימוד: "${t.t}".

בחר 10 עד 12 מילות מפתח: המושגים שהמורה מלמד ביחידה הזו ותלמיד חייב להבין כדי להבין את השיעור.
כללים:
- רק מושגים אמיתיים של היחידה, מהבסיסי למתקדם, בלי מילים כלליות שכל תלמיד כבר מכיר ובלי כפילויות.
${foreign
    ? `- המילים עצמן ב${LANG_NAME[lang]} (${lang}), ברמה שמתאימה ל${grade} בבית ספר בישראל. ההגדרות ב${LANG_NAME[lang]} פשוטה מאוד.`
    : "- המילים בעברית תקנית בכתיב מלא, בלי ניקוד, בצורת הערך במילון (יחיד, בלי ה' הידיעה, אלא אם היא חלק מהמונח). ההגדרות בעברית פשוטה וברורה."}
- לכל מילה הגדרה אחת: משפט אחד או שניים (עד 160 תווים) שמסבירים את המשמעות שלה ביחידה הזו בלבד, ברמה שמתאימה ל${grade}.
- בלי מקפים ארוכים. ניסוח כללי, בלי פנייה לתלמיד.
החזר: {"words":[{"w":"","d":""}]}`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const u = usageFrom(json);
  void logAiUsage({ feature: "curriculum_set", model: "gpt-4o", tokensIn: u.tokensIn, tokensOut: u.tokensOut });
  const raw = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as { words?: Array<{ w?: unknown; d?: unknown }> };
  const defs: Record<string, string> = {};
  for (const x of raw.words ?? []) {
    const w = clean(x.w, 40).replace(/[.,;:]+$/, "");
    const d = clean(x.d, 220);
    if (w && d && !defs[w]) defs[w] = d;
  }
  const words = Object.keys(defs).slice(0, 12);
  if (words.length < 5) throw new Error("too_few_words");
  const set: WordSet = { id: t.id, subject: subj.key, title: t.t, grade, lang, words };
  return { set, defs: Object.fromEntries(words.map((w) => [w, defs[w]])) };
}

/** A curriculum set with its definitions, generated on first request when
 *  `create`. Registers it so getWordSet/classroomDef see it. */
export async function getCurriculumSetDoc(id: string, create = false): Promise<CurriculumSetDoc | null> {
  if (!isCurriculumSetId(id) || !curTopic(id)) return null;
  const ref = getAdminDb().collection("curriculumSets").doc(id);
  const snap = await ref.get();
  let doc = snap.exists ? (snap.data() as CurriculumSetDoc) : null;
  if (!doc && create) {
    doc = await generate(id);
    if (doc) await ref.set({ ...doc, version: VERSION, at: new Date().toISOString() });
  }
  if (doc) registerWordSet(doc.set, doc.defs);
  return doc ? { set: doc.set, defs: doc.defs } : null;
}

/** Any set by id: hand-made sets from code, curriculum sets from Firestore. */
export async function loadWordSet(id: string): Promise<WordSet | undefined> {
  return getWordSet(id) ?? (await getCurriculumSetDoc(id))?.set;
}
