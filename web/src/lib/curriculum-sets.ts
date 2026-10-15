import { getAdminDb } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom, TEXT_MODEL, SMART_MODEL } from "@/lib/ai-cost";
import { getWordSet, registerWordSet, isCurriculumSetId, isGemaraSet, type WordSet, type SetExtras, type SetItem, type SetVisual, type SetDiagram, type DiagramBox } from "@/lib/word-sets";
import { isMeaningId } from "@/lib/classroom-keys";
import { devDryAi } from "@/lib/dev-safety";
import { curTopic, curSubject, curLevelHe, gradeLabel, SUBJECT_LANG, zaTopic, arTopic, arSubject, arLevel, arGradeLabel } from "@/lib/curriculum-catalog";
import zaSets from "@/lib/curriculum-sets-za.json";
import { isPilotTopicId } from "@/lib/pilot-topics";
import { mergeMixed } from "@/lib/mixed-units";

// Server side of the curriculum catalog (Gadi 2026-10-03). A topic's key
// words and their in-lesson definitions are generated once with gpt-4o the
// first time anyone opens the topic, then served from Firestore
// curriculumSets/{topicId} forever. Only ids that exist in the catalog can
// be generated, so the total cost is bounded (~1,600 Hebrew and ~800 Arab
// education topics, ~1¢ each).

export type CurriculumSetDoc = { set: WordSet; defs: Record<string, string> } & SetExtras;

const VERSION = "v1";
const LANG_NAME: Record<string, string> = {
  en: "English", ar: "Arabic", fr: "French", es: "Spanish", ru: "Russian", de: "German",
  it: "Italian", "zh-CN": "Simplified Chinese", am: "Amharic", pt: "Portuguese", fa: "Persian",
};

function clean(s: unknown, max: number): string {
  return String(s ?? "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+/g, " ").trim().slice(0, max);
}

async function chat(sys: string, user: string, model = TEXT_MODEL, admin = false): Promise<Array<{ w?: unknown; d?: unknown }>> {
  // Local test mode never generates a unit (tests use units seeded in the emulator).
  if (devDryAi()) throw new Error("dry_no_generate");
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
  void logAiUsage({ feature: "curriculum_set", model, tokensIn: u.tokensIn, tokensOut: u.tokensOut, admin });
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
async function generateAr(topicId: string, admin = false): Promise<CurriculumSetDoc | null> {
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
- Each definition in clear, simple Modern Standard Arabic suited to ${arGrade}, without tashkeel.
- Use each term exactly as it is worded in the most recent Arabic-language bagrut exams and Ministry materials for Arab schools in Israel. When the same term has another common wording, end its definition with that wording: "ويسمى أيضا ...", so a student recognizes both.`
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
  // It now and then returns an empty list: try once more, then gpt-4o.
  const meta = { id: t.id, subject: subj.key, title: t.t, grade, lang };
  for (const model of [SMART_MODEL, SMART_MODEL, TEXT_MODEL]) {
    try {
      return toDoc(await chat(sys, user, model, admin), meta, lang === "ar");
    } catch (e) {
      if (String(e).includes("openai_") || model === TEXT_MODEL) throw e;
    }
  }
  return null;
}

async function generate(topicId: string, admin = false): Promise<CurriculumSetDoc | null> {
  if (topicId.startsWith("cur-ar-")) return generateAr(topicId, admin);
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
  const rows = await chat(sys, user, undefined, admin);
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

const VISUAL_MODES = new Set(["auto", "none", "hint"]);
function cleanVisual(v: unknown): SetVisual | undefined {
  const o = v as { mode?: unknown; hint?: unknown } | null;
  if (!o || !VISUAL_MODES.has(String(o.mode))) return undefined;
  const hint = typeof o.hint === "string" ? o.hint.trim().slice(0, 600) : "";
  if (o.mode === "hint") return hint ? { mode: "hint", hint } : undefined;
  return { mode: o.mode as "auto" | "none" };
}

function cleanBox(v: unknown, small: boolean): DiagramBox | undefined {
  const o = v as Record<string, unknown> | null;
  const label = clean(o?.label, 40);
  const text = clean(o?.text, 140);
  if (!label || !text) return undefined;
  const s = small ? clean(o?.small, 60) : "";
  return { label, ...(s ? { small: s } : {}), text };
}
/** A stored teaching diagram, validated; anything incomplete is dropped
 *  (the meaning then shows no diagram, as before). */
function cleanDiagram(v: unknown): SetDiagram | undefined {
  const o = v as Record<string, unknown> | null;
  if (!o || o.layout !== "contrast") return undefined;
  const title = clean(o.title, 40);
  const sub = clean(o.sub, 160);
  const clash = clean(o.clash, 40);
  const a = cleanBox(o.a, true), b = cleanBox(o.b, true);
  const question = cleanBox(o.question, false), next = cleanBox(o.next, false);
  if (!title || !sub || !clash || !a || !b || !question || !next) return undefined;
  const note = clean(o.note, 160);
  return { layout: "contrast", title, sub, a, b, clash, question, next, ...(note ? { note } : {}) };
}

/** The optional phase-A fields of a stored unit, validated. Absent fields stay
 *  absent, so a unit without them is returned exactly as before. */
function readExtras(raw: Record<string, unknown>): SetExtras {
  const out: SetExtras = {};
  if (Array.isArray(raw.items)) {
    const seen = new Set<string>();
    const items: SetItem[] = [];
    for (const x of raw.items as Array<Record<string, unknown>>) {
      const m = x?.m;
      const w = clean(x?.w, 40);
      const d = clean(x?.d, 300);
      if (!isMeaningId(m) || seen.has(m) || !w || !d) continue;
      seen.add(m);
      const rev = Number.isInteger(x.rev) && (x.rev as number) > 0 ? (x.rev as number) : 1;
      const v = cleanVisual(x.v);
      const dg = cleanDiagram(x.dg);
      // Phase C placement, level and context (absent fields stay absent).
      const after = clean(x.after, 40), replaces = clean(x.replaces, 40), ctx = clean(x.ctx, 160);
      const lv = LEVELS.has(String(x.lv)) ? (x.lv as SetItem["lv"]) : undefined;
      items.push({ m, w, d, rev, ...(v ? { v } : {}), ...(dg ? { dg } : {}), ...(after ? { after } : {}), ...(replaces ? { replaces } : {}), ...(lv ? { lv } : {}), ...(ctx ? { ctx } : {}) });
    }
    if (items.length) out.items = items;
  }
  if (raw.visuals && typeof raw.visuals === "object") {
    const visuals: Record<string, SetVisual> = {};
    for (const [w, v] of Object.entries(raw.visuals as Record<string, unknown>)) {
      const cv = cleanVisual(v);
      if (cv) visuals[w.trim()] = cv;
    }
    if (Object.keys(visuals).length) out.visuals = visuals;
  }
  if (raw.locked === true) out.locked = true;
  if (raw.mixed === true && out.items) out.mixed = true;
  if (raw.wordIds && typeof raw.wordIds === "object") {
    const ids: Record<string, string> = {};
    for (const [w, id] of Object.entries(raw.wordIds as Record<string, unknown>)) if (isMeaningId(id) && clean(w, 40)) ids[clean(w, 40)] = id;
    if (Object.keys(ids).length) out.wordIds = ids;
  }
  return out;
}
const LEVELS = new Set(["beg", "adv", "yes"]);

export async function getCurriculumSetDoc(id: string, create = false, admin = false): Promise<CurriculumSetDoc | null> {
  const isZa = id.startsWith("cur-za-");
  // A pilot unit exists only from its imported document and is never generated.
  const pilot = isPilotTopicId(id);
  if (!isCurriculumSetId(id) || !(pilot || (isZa ? zaTopic(id) : arTopic(id) ?? curTopic(id)))) return null;
  const ref = getAdminDb().collection("curriculumSets").doc(id);
  const snap = await ref.get();
  // An admin edit lives in Firestore; a CAPS unit otherwise uses its built-in words.
  let doc = snap.exists ? (snap.data() as CurriculumSetDoc) : isZa ? zaDoc(id) : null;
  if (!doc && create && !pilot) {
    doc = await generate(id, admin);
    if (doc) await ref.set({ ...doc, version: VERSION, at: new Date().toISOString() });
  }
  if (!doc) return null;
  const extras = snap.exists ? readExtras(snap.data() as Record<string, unknown>) : {};
  let set = doc.set;
  let defs = doc.defs;
  // A unit that lists meanings: its words follow the meanings (a word can
  // appear twice), and a word's plain definition is its first meaning, for
  // every code path that knows only the word.
  if (extras.items && extras.mixed) {
    // Older words and meanings together (phase C): every stored word stays,
    // with its own definition; a meaning adds its definition only for a word
    // the unit did not have.
    const { entries } = mergeMixed(doc.set.words, doc.defs, extras.items, extras.wordIds);
    set = { ...set, words: entries.map((i) => i.w) };
    defs = { ...defs };
    for (const i of [...entries].reverse()) if (i.k !== "word" && !(i.w in doc.defs)) defs[i.w] = i.d;
    extras.items = entries;
  } else if (extras.items) {
    set = { ...set, words: extras.items.map((i) => i.w) };
    defs = { ...defs };
    for (const i of [...extras.items].reverse()) defs[i.w] = i.d;
  }
  registerWordSet(set, defs, extras);
  return { set, defs, ...extras };
}

/** Any set by id: hand-made sets from code, curriculum sets from Firestore.
 *  Curriculum sets are always re-read (one doc), so an edit made in
 *  /admin/curriculum shows up at once on every server instance. */
export async function loadWordSet(id: string): Promise<WordSet | undefined> {
  if (isCurriculumSetId(id)) return (await getCurriculumSetDoc(id))?.set;
  return getWordSet(id);
}

/** Admin edit (Gadi 2026-10-04): replace a unit's words and definitions.
 *  A locked unit (approved content) is saved only with `force`; a unit that
 *  lists meanings (`items`) is managed by script, never by this editor. */
export async function saveCurriculumSet(id: string, rows: Array<{ w: string; d: string }>, opts: { force?: boolean } = {}): Promise<CurriculumSetDoc | null> {
  const cur = await getCurriculumSetDoc(id, true, true);
  if (!cur) return null;
  if (cur.items) throw new Error("items_managed");
  if (cur.locked && !opts.force) throw new Error("locked");
  const defs: Record<string, string> = {};
  for (const r of rows) {
    const w = clean(r.w, 40);
    const d = clean(r.d, 300);
    if (w && !defs[w]) defs[w] = d;
  }
  const words = Object.keys(defs);
  if (!words.length) throw new Error("no_words");
  const doc: CurriculumSetDoc = { set: { ...cur.set, words }, defs };
  const ref = getAdminDb().collection("curriculumSets").doc(id);
  if (isGemaraSet(cur.set)) {
    // Gemara: keep the unit's other fields (qa, visuals, locked) instead of
    // writing the document from scratch; set and defs are replaced whole.
    await ref.set({ set: doc.set, defs: doc.defs, version: VERSION, editedAt: new Date().toISOString() }, { mergeFields: ["set", "defs", "version", "editedAt"] });
  } else {
    await ref.set({ ...doc, version: VERSION, editedAt: new Date().toISOString() });
  }
  const extras: SetExtras = { ...(cur.visuals ? { visuals: cur.visuals } : {}), ...(cur.locked ? { locked: true } : {}) };
  registerWordSet(doc.set, doc.defs, extras);
  return { ...doc, ...extras };
}

/** Admin: throw away a unit's words and generate them again. */
export async function regenerateCurriculumSet(id: string): Promise<CurriculumSetDoc | null> {
  if (!isCurriculumSetId(id) || !(curTopic(id) || zaTopic(id) || arTopic(id))) return null;
  // Never throw away approved content: a locked unit or one that lists meanings.
  const existing = await getAdminDb().collection("curriculumSets").doc(id).get();
  if (existing.exists) {
    const x = readExtras(existing.data() as Record<string, unknown>);
    if (x.locked || x.items) throw new Error("locked");
  }
  await getAdminDb().collection("curriculumSets").doc(id).delete();
  return getCurriculumSetDoc(id, true, true);
}
