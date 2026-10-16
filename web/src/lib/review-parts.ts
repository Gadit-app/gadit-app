/**
 * The parts of a Gemara pilot meaning an expert decides on, one by one
 * (content review, Gadi 2026-10-15). Shared by the review page, its API and
 * the admin export, so a field means the same thing everywhere. Mirrors
 * scripts/gemara/pilot-sheet.mjs (the CSV round trip) and works on the same
 * content format (reports/gemara/pilot/pilot-content.json, schema 3).
 */
import type { SetDiagram } from "@/lib/word-sets";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Meaning = Record<string, any>;

export type LevelId = "beg" | "adv" | "yes";
export type PartId = "definition" | "examples" | "quote" | "visual" | "quiz" | "game" | "diagram" | `level_${LevelId}`;
export type Decision = "approve" | "fix" | "reject";
export type Field = {
  key: string;
  label: string;
  get: (x: Meaning) => string;
  /** null: shown for context, not editable. */
  set: ((x: Meaning, v: string) => void) | null;
  long?: boolean;
  /** "answer": 1 to 4; "bool": true / false. */
  kind?: "answer" | "bool";
  /** A context field that is left out of the screen when it is empty. */
  hideEmpty?: boolean;
};
export type Part = { id: PartId; label: string; fields: Field[] };

export const PART_IDS: PartId[] = ["definition", "examples", "quote", "visual", "quiz", "game", "diagram", "level_beg", "level_adv", "level_yes"];

/**
 * Text per learning level (Gadi 2026-10-17). A level has its own part only when
 * the meaning has its own text for it; nothing is ever written for a level that
 * has none. The publish tool (scripts/gemara/meanings-publish.mjs, levelOf and
 * levelOfUnit) shows a level's text only once that level's part is approved;
 * otherwise, and for a level with no text, the projector shows the base
 * definition. Approving the base definition approves no level.
 */
export const LEVELS: Array<{ id: LevelId; label: string; where: string }> = [
  { id: "beg", label: "הסבר למתחילים", where: "ביחידות של בית הספר היסודי" },
  { id: "adv", label: "הסבר למתקדמים", where: "ביחידות של חטיבת הביניים והתיכון" },
  { id: "yes", label: "הסבר לישיבות ולמבוגרים", where: "ביחידות לישיבות ולמבוגרים" },
];
export const levelText = (x: Meaning, lv: LevelId): string => String(x.levels?.[lv]?.d ?? "").trim();
export const levelPart = (lv: LevelId) => `level_${lv}` as PartId;
export const DECISIONS: Decision[] = ["approve", "fix", "reject"];
export const STATUS_OF: Record<Decision, "approved" | "draft" | "rejected"> = { approve: "approved", fix: "draft", reject: "rejected" };

export const quoteOf = (x: Meaning) => (x.examples ?? []).find((e: Meaning) => e.kind === "quote") ?? null;
const oursOf = (x: Meaning) => (x.examples ?? []).filter((e: Meaning) => e.kind === "ours");
const setOurs = (i: number) => (x: Meaning, v: string) => {
  const ours = oursOf(x);
  if (ours[i]) ours[i].text = v;
  else x.examples.splice(ours.length, 0, { kind: "ours", text: v });
};
const dgOf = (x: Meaning) => x.visual?.diagram ?? null;
const boxOf = (x: Meaning, id: string) => (dgOf(x)?.boxes ?? []).find((b: Meaning) => b.id === id) ?? null;
const box = (id: string, f: string, label: string): Field => ({
  key: `diagram_${id}_${f}`,
  label,
  get: (x) => boxOf(x, id)?.[f] ?? "",
  set: (x, v) => { const b = boxOf(x, id); if (b) b[f] = v; },
});
const field = (key: string, label: string, path: [string, string?], long = false): Field => ({
  key, label, long,
  get: (x) => String((path[1] ? x[path[0]]?.[path[1]] : x[path[0]]) ?? ""),
  set: (x, v) => { if (path[1]) { x[path[0]] = x[path[0]] ?? {}; x[path[0]][path[1]] = v; } else x[path[0]] = v; },
});

const quizFields: Field[] = [];
for (let i = 0; i < 3; i++) {
  const n = i + 1;
  quizFields.push({ key: `q${n}_question`, label: `שאלה ${n}`, get: (x) => x.quiz?.[i]?.q ?? "", set: (x, v) => (x.quiz[i].q = v), long: true });
  for (let o = 0; o < 4; o++) quizFields.push({ key: `q${n}_option${o + 1}`, label: `שאלה ${n}, תשובה ${o + 1}`, get: (x) => x.quiz?.[i]?.options?.[o] ?? "", set: (x, v) => (x.quiz[i].options[o] = v) });
  quizFields.push({ key: `q${n}_correct`, label: `שאלה ${n}, מספר התשובה הנכונה (1 עד 4)`, get: (x) => String((x.quiz?.[i]?.answer ?? 0) + 1), set: (x, v) => (x.quiz[i].answer = Number(v) - 1), kind: "answer" });
  quizFields.push({ key: `q${n}_explain`, label: `שאלה ${n}, הסבר`, get: (x) => x.quiz?.[i]?.explain ?? "", set: (x, v) => (x.quiz[i].explain = v), long: true });
}
const gameFields: Field[] = [];
for (let i = 0; i < 5; i++) {
  const n = i + 1;
  gameFields.push({ key: `tf${n}_statement`, label: `משפט ${n}`, get: (x) => x.game?.[i]?.s ?? "", set: (x, v) => (x.game[i].s = v), long: true });
  gameFields.push({ key: `tf${n}_true`, label: `משפט ${n}: נכון או לא נכון`, get: (x) => (x.game?.[i]?.t ? "true" : "false"), set: (x, v) => (x.game[i].t = v === "true"), kind: "bool" });
  gameFields.push({ key: `tf${n}_explain`, label: `משפט ${n}, הסבר`, get: (x) => x.game?.[i]?.explain ?? "", set: (x, v) => (x.game[i].explain = v), long: true });
}

const formsText = (x: Meaning) => (x.forms ?? []).map((f: Meaning | string) => (typeof f === "string" ? f : f?.t ?? "")).filter(Boolean).join(", ");
const levelFields = (lv: LevelId): Field[] => [
  { key: `level_${lv}_definition`, label: "הנוסח לרמה הזאת", get: (x) => String(x.levels?.[lv]?.d ?? ""), set: (x, v) => { x.levels = x.levels ?? {}; x.levels[lv] = { ...(x.levels[lv] ?? {}), d: v }; }, long: true },
  { key: `level_${lv}_simple`, label: "הסבר פשוט לרמה הזאת", get: (x) => String(x.levels?.[lv]?.simple ?? ""), set: (x, v) => { x.levels = x.levels ?? {}; x.levels[lv] = { ...(x.levels[lv] ?? {}), simple: v }; }, long: true },
  { key: `level_${lv}_base`, label: "הגדרת הבסיס, להשוואה", get: (x) => String(x.d ?? ""), set: null },
];

export const PARTS: Part[] = [
  { id: "definition", label: "הגדרה", fields: [
    field("word", "המילה", ["w"]),
    field("pointed", "בניקוד", ["pointed"]),
    field("role", "תפקיד", ["role"]),
    field("definition", "ההגדרה", ["d"], true),
    field("simple_explanation", "הסבר פשוט", ["simple"], true),
    { key: "forms", label: "כתיבים וקיצורים של אותה משמעות", get: formsText, set: null, hideEmpty: true },
    { key: "related_phrases", label: "צירופים קשורים (לא כתיב של המילה)", get: (x) => (x.relatedPhrases ?? []).join(", "), set: null, hideEmpty: true },
  ] },
  { id: "examples", label: "דוגמאות שלנו", fields: [
    { key: "example_ours_1", label: "דוגמה 1", get: (x) => oursOf(x)[0]?.text ?? "", set: setOurs(0), long: true },
    { key: "example_ours_2", label: "דוגמה 2", get: (x) => oursOf(x)[1]?.text ?? "", set: setOurs(1), long: true },
  ] },
  { id: "quote", label: "ציטוט מהגמרא", fields: [
    { key: "quote_text", label: "הציטוט", get: (x) => quoteOf(x)?.text ?? "", set: null, long: true },
    { key: "quote_source", label: "המקור", get: (x) => { const q = quoteOf(x); return q?.text ? `בבלי, מסכת ${q.tractate}, דף ${q.daf} עמוד ${q.amud}` : ""; }, set: null },
    { key: "quote_tool_status", label: "בדיקת הכלי", get: (x) => quoteOf(x)?.status ?? "אין ציטוט", set: null },
    { key: "quote_explanation_ours", label: "ההסבר שלנו לציטוט", get: (x) => quoteOf(x)?.explanationOurs ?? "", set: (x, v) => { const q = quoteOf(x); if (q) q.explanationOurs = v; }, long: true },
  ] },
  { id: "visual", label: "תמונה", fields: [
    field("visual_type", "סוג ההמחשה", ["visual", "type"]),
    field("visual_choice", "הבחירה", ["visual", "choice"]),
    field("visual_reason", "הנימוק", ["visual", "reason"], true),
    field("visual_sensitivity", "רגישות", ["visual", "sensitivity"], true),
    field("image_hint", "תיאור התמונה (באנגלית, למחולל התמונות)", ["visual", "image_hint"], true),
  ] },
  { id: "quiz", label: "חידון", fields: quizFields },
  { id: "game", label: "משחק נכון או לא נכון", fields: gameFields },
  { id: "diagram", label: "תרשים", fields: [
    { key: "diagram_title", label: "כותרת", get: (x) => dgOf(x)?.title ?? "", set: (x, v) => { if (dgOf(x)) x.visual.diagram.title = v; } },
    { key: "diagram_subtitle", label: "שורת הסבר", get: (x) => dgOf(x)?.subtitle ?? "", set: (x, v) => { if (dgOf(x)) x.visual.diagram.subtitle = v; }, long: true },
    box("r", "label", "מקור ראשון: תווית"), box("r", "small", "מקור ראשון: שורה קטנה"), box("r", "text", "מקור ראשון: טקסט"),
    box("l", "label", "מקור שני: תווית"), box("l", "small", "מקור שני: שורה קטנה"), box("l", "text", "מקור שני: טקסט"),
    box("x", "label", "הסתירה"), box("q", "text", "השאלה"), box("n", "text", "מה בא אחר כך"),
    { key: "diagram_note", label: "הערה בתחתית", get: (x) => dgOf(x)?.note ?? "", set: (x, v) => { if (dgOf(x)) x.visual.diagram.note = v; }, long: true },
  ] },
  ...LEVELS.map((l): Part => ({ id: levelPart(l.id), label: l.label, fields: levelFields(l.id) })),
];
export const partOf = (id: string) => PARTS.find((p) => p.id === id);
/** The parts of one meaning: the diagram only when it has one, a level only when it has its own text. */
export const partsFor = (x: Meaning) => PARTS.filter((p) => {
  if (p.id === "diagram") return !!dgOf(x);
  const lv = LEVELS.find((l) => levelPart(l.id) === p.id);
  return lv ? !!levelText(x, lv.id) : true;
});

/** What the projector shows for each level, by the publish rule, after the expert's
 *  decisions so far: a level's own text once approved, else the base definition. */
export function projectorByLevel(x: Meaning, statusOf: (part: PartId) => string | undefined) {
  return LEVELS.map((l) => {
    const own = levelText(x, l.id);
    const status = own ? statusOf(levelPart(l.id)) : undefined;
    const shows: "own" | "base" = own && status === "approved" ? "own" : "base";
    return { ...l, own, status, shows, text: shows === "own" ? own : String(x.d ?? "") };
  });
}

export const DASH = /[–—]/;
export const MAX_FIELD = 600;

/** Corrections for a part, validated: only its editable fields, no dashes,
 *  answers 1 to 4, true / false. Returns the problems found. */
export function checkFixes(part: Part, fixes: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const [k, raw] of Object.entries(fixes)) {
    const f = part.fields.find((x) => x.key === k);
    if (!f || !f.set) { out.push(`field_not_editable:${k}`); continue; }
    if (typeof raw !== "string") { out.push(`not_text:${k}`); continue; }
    const v = raw.trim();
    if (!v) out.push(`empty:${k}`);
    if (v.length > MAX_FIELD) out.push(`too_long:${k}`);
    if (DASH.test(v)) out.push(`dash:${k}`);
    if (f.kind === "answer" && !/^[1-4]$/.test(v)) out.push(`answer_1_to_4:${k}`);
    if (f.kind === "bool" && v !== "true" && v !== "false") out.push(`true_or_false:${k}`);
  }
  return out;
}

/** A part's fields as shown to the expert, after the corrections. */
export function snapshotOf(part: Part, x: Meaning, fixes: Record<string, string> = {}): Record<string, string> {
  const s: Record<string, string> = {};
  for (const f of part.fields) s[f.key] = fixes[f.key] ?? f.get(x);
  return s;
}
export function applyFixes(part: Part, x: Meaning, fixes: Record<string, string>) {
  for (const [k, v] of Object.entries(fixes)) part.fields.find((f) => f.key === k)?.set?.(x, v.trim());
}

/** The projector board of a diagram spec (same rule as scripts/gemara/import-pilot.mjs). */
export function diagramBoard(x: Meaning): SetDiagram | null {
  const g = dgOf(x);
  const b = (id: string) => boxOf(x, id);
  const r = b("r"), l = b("l"), cl = b("x"), q = b("q"), n = b("n");
  if (!g?.title || !g?.subtitle || !r || !l || !cl || !q || !n) return null;
  return {
    layout: "contrast", title: g.title, sub: g.subtitle,
    a: { label: r.label, ...(r.small ? { small: r.small } : {}), text: r.text },
    b: { label: l.label, ...(l.small ? { small: l.small } : {}), text: l.text },
    clash: cl.label, question: { label: q.label, text: q.text }, next: { label: n.label, text: n.text },
    ...(g.note ? { note: g.note } : {}),
  };
}
