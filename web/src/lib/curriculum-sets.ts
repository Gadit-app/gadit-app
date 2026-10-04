import { getAdminDb } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom } from "@/lib/ai-cost";
import { getWordSet, registerWordSet, isCurriculumSetId, type WordSet } from "@/lib/word-sets";
import { curTopic, curSubject, curLevelHe, gradeLabel, SUBJECT_LANG, zaTopic, arTopic, arSubject, arLevel, arGradeLabel } from "@/lib/curriculum-catalog";
import zaSets from "@/lib/curriculum-sets-za.json";

// Server side of the curriculum catalog (Gadi 2026-10-03). A topic's key
// words and their in-lesson definitions are generated once with gpt-4o the
// first time anyone opens the topic, then served from Firestore
// curriculumSets/{topicId} forever. Only ids that exist in the catalog can
// be generated, so the total cost is bounded (~1,600 Hebrew and ~800 Arab
// education topics, ~1¢ each).

export type CurriculumSetDoc = { set: WordSet; defs: Record<string, string> };

const VERSION = "v1";
const LANG_NAME: Record<string, string> = {
  en: "English", ar: "Arabic", fr: "French", es: "Spanish", ru: "Russian", de: "German",
  it: "Italian", "zh-CN": "Simplified Chinese", am: "Amharic", pt: "Portuguese", fa: "Persian",
};

function clean(s: unknown, max: number): string {
  return String(s ?? "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+/g, " ").trim().slice(0, max);
}

async function chat(sys: string, user: string, model = "gpt-4o"): Promise<Array<{ w?: unknown; d?: unknown }>> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model,
      // Reasoning models take an effort level instead of a temperature.
      ...(model.startsWith("gpt-5") ? { reasoning_effort: "low" } : { temperature: 0.2 }),
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const u = usageFrom(json);
  void logAiUsage({ feature: "curriculum_set", model, tokensIn: u.tokensIn, tokensOut: u.tokensOut });
  return (JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as { words?: Array<{ w?: unknown; d?: unknown }> }).words ?? [];
}

function toDoc(rows: Array<{ w?: unknown; d?: unknown }>, set: Omit<WordSet, "words">, marks = false): CurriculumSetDoc {
  const defs: Record<string, string> = {};
  for (const x of rows) {
    let w = clean(x.w, 40).replace(/[.,;:،]+$/, "");
    // Words are stored bare; the teacher adds tashkeel on the projector.
    if (marks) w = w.replace(/[ً-ٰٟ]/g, "");
    const d = clean(x.d, 220);
    if (w && d && !defs[w]) defs[w] = d;
  }
  const words = Object.keys(defs).slice(0, 12);
  if (words.length < 5) throw new Error("too_few_words");
  return { set: { ...set, words }, defs: Object.fromEntries(words.map((w) => [w, defs[w]])) };
}

// Arab state education (Gadi 2026-10-04): words in Modern Standard Arabic,
// except the Hebrew and English subjects, whose words are in that language.
const AR_SUBJECT_LANG: Record<string, string> = { "hebrew-second-language": "he", english: "en" };
async function generateAr(topicId: string): Promise<CurriculumSetDoc | null> {
  const t = arTopic(topicId);
  const subj = t ? arSubject(t.s) : undefined;
  if (!t || !subj) return null;
  const lang = AR_SUBJECT_LANG[subj.key] ?? "ar";
  const arGrade = arGradeLabel(t.g) || arLevel(t.l)?.ar || "";
  const grade = lang === "ar" ? arGrade
    : lang === "he" ? gradeLabel(t.g) || curLevelHe(t.l)
    : arGrade.replace("الصفوف", "Grades").replace(" إلى ", " to ").replace("الصف", "Grade").replace("الروضة", "Kindergarten");
  const sys = "You are an expert on the curriculum of Arab state schools in Israel (the Ministry of Education's Arab sector programs) and you build lists of a lesson's key words. Return JSON only.";
  const where = `Subject: ${subj.ar} (${subj.he}). Stage: ${arLevel(t.l)?.ar ?? t.l}, ${arGrade}.\nLearning unit: "${t.t}" (${t.th}).`;
  const rules = lang === "ar"
    ? `- The words themselves in Modern Standard Arabic (الفصحى), in their dictionary form: singular, without the article ال unless it is part of the term, without tashkeel, with standard hamza spelling (أ إ ؤ ئ).
- Each definition in clear, simple Modern Standard Arabic suited to ${arGrade}, without tashkeel.`
    : lang === "he"
      ? `- This is Hebrew taught as a second language to Arabic-speaking students. The words in standard Hebrew (full spelling, no niqqud, dictionary form), at the level of ${grade} in an Arab school.
- Each definition in very simple Hebrew that an Arabic-speaking student learning Hebrew can follow.`
      : `- This is English taught as a foreign language to Arabic-speaking students. The words in English, at the level of ${grade} in an Arab school in Israel.
- Each definition in very simple English.`;
  const user = `${where}

Choose 10 to 12 key words: the concepts the teacher teaches in this unit and that a student must understand to follow the lesson.
Rules:
- Only real concepts of this unit, from basic to advanced, no general words every student already knows, no duplicates.
- Prefer the terms specific to this unit over words that come up in every lesson of the subject. No general study words (learning, practice, training, correct, mistake, understanding, beginning, end) unless the unit is about exactly that.
- A term of more than one word stays whole, exactly as it is taught in this unit. Never split a term into separate words, and never list a bare word that only makes sense as part of a longer term.
- No near-duplicates: one entry per idea, not the same idea in singular and plural or with a small variation.
- Every word must belong to THIS unit's content; do not bring in terms from other units of the subject.
- The definition does not start by repeating the word ("X is..."); it explains the meaning directly.
${rules}
- One definition per word: one or two sentences (up to 160 characters) explaining its meaning in this unit only.
- No long dashes. General wording, not addressing the student.
Return: {"words":[{"w":"","d":""}]}`;
  // gpt-5.4 (Gadi 2026-10-04): in a side-by-side test it gave the unit's
  // real grammar terms where gpt-4o stayed generic, at about 1 cent a unit.
  const rows = await chat(sys, user, "gpt-5.4");
  return toDoc(rows, { id: t.id, subject: subj.key, title: t.t, grade, lang }, lang === "ar");
}

async function generate(topicId: string): Promise<CurriculumSetDoc | null> {
  if (topicId.startsWith("cur-ar-")) return generateAr(topicId);
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
  const rows = await chat(sys, user);
  return toDoc(rows, { id: t.id, subject: subj.key, title: t.t, grade, lang });
}

/** A curriculum set with its definitions, generated on first request when
 *  `create`. Registers it so getWordSet/classroomDef see it. */
/** A South African CAPS unit's built-in words (scripts/curriculum-za). */
function zaDoc(id: string): CurriculumSetDoc | null {
  const t = zaTopic(id);
  const w = (zaSets as Record<string, { words: string[]; defs: Record<string, string> }>)[id];
  if (!t || !w) return null;
  return { set: { id, subject: t.s, title: t.t, grade: `Grade ${t.g}`, lang: "en", words: w.words }, defs: w.defs };
}

export async function getCurriculumSetDoc(id: string, create = false): Promise<CurriculumSetDoc | null> {
  const isZa = id.startsWith("cur-za-");
  if (!isCurriculumSetId(id) || !(isZa ? zaTopic(id) : arTopic(id) ?? curTopic(id))) return null;
  const ref = getAdminDb().collection("curriculumSets").doc(id);
  const snap = await ref.get();
  // An admin edit lives in Firestore; a CAPS unit otherwise uses its built-in words.
  let doc = snap.exists ? (snap.data() as CurriculumSetDoc) : isZa ? zaDoc(id) : null;
  if (!doc && create) {
    doc = await generate(id);
    if (doc) await ref.set({ ...doc, version: VERSION, at: new Date().toISOString() });
  }
  if (doc) registerWordSet(doc.set, doc.defs);
  return doc ? { set: doc.set, defs: doc.defs } : null;
}

/** Any set by id: hand-made sets from code, curriculum sets from Firestore.
 *  Curriculum sets are always re-read (one doc), so an edit made in
 *  /admin/curriculum shows up at once on every server instance. */
export async function loadWordSet(id: string): Promise<WordSet | undefined> {
  if (isCurriculumSetId(id)) return (await getCurriculumSetDoc(id))?.set;
  return getWordSet(id);
}

/** Admin edit (Gadi 2026-10-04): replace a unit's words and definitions. */
export async function saveCurriculumSet(id: string, rows: Array<{ w: string; d: string }>): Promise<CurriculumSetDoc | null> {
  const cur = await getCurriculumSetDoc(id, true);
  if (!cur) return null;
  const defs: Record<string, string> = {};
  for (const r of rows) {
    const w = clean(r.w, 40);
    const d = clean(r.d, 300);
    if (w && !defs[w]) defs[w] = d;
  }
  const words = Object.keys(defs);
  if (!words.length) throw new Error("no_words");
  const doc: CurriculumSetDoc = { set: { ...cur.set, words }, defs };
  await getAdminDb().collection("curriculumSets").doc(id).set({ ...doc, version: VERSION, editedAt: new Date().toISOString() });
  registerWordSet(doc.set, doc.defs);
  return doc;
}

/** Admin: throw away a unit's words and generate them again. */
export async function regenerateCurriculumSet(id: string): Promise<CurriculumSetDoc | null> {
  if (!isCurriculumSetId(id) || !(curTopic(id) || zaTopic(id) || arTopic(id))) return null;
  await getAdminDb().collection("curriculumSets").doc(id).delete();
  return getCurriculumSetDoc(id, true);
}
