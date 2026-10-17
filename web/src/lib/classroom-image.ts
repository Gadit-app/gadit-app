import crypto from "node:crypto";
import { getAdminDb, getDefaultBucket } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom, IMAGE_MODEL, TEXT_MODEL_FAST } from "@/lib/ai-cost";
import { curatedImageHint, getWordSet, isGemaraSet, classroomVisual, normSetWord, type WordSet } from "@/lib/word-sets";
import { topicLevel } from "@/lib/curriculum-catalog";
import { classroomImageKey, itemImageKey, type ClassroomStyle, type MeaningRef } from "@/lib/classroom-keys";
import { devDryAi, DRY_IMAGE_URL } from "@/lib/dev-safety";

/**
 * The Gadit house style for word-set pictures (Gadi 2026-10-04). One
 * recognizable look, chosen by the set's school level:
 *   kids  (גן, יסודי)       soft modern 3D, the idea as the large hero,
 *                           and ALWAYS the same boy, drawn from a fixed
 *                           character reference (public/img-refs/kid.png)
 *   teen  (חטיבה, תיכון)    the same soft 3D, cleaner and older
 * Hebrew and Arabic letters can't be drawn by the image model, so concepts
 * that ARE letters (אות, ניקוד, דגושה... حرف, حركة, شدة, تاء مربوطة...)
 * start from the letters set in a
 * real font (public/img-refs/*.png) and the model only turns them into 3D,
 * at medium quality so the shapes survive.
 *
 * Cached in imageCache/img_cls2_<style>_<lang>_<hash>, a new namespace, so
 * every set picture is redrawn once in the new style.
 */

export type { ClassroomStyle } from "@/lib/classroom-keys";
export { classroomImageKey } from "@/lib/classroom-keys";

const SITE = "https://www.gadit.app";

export function classroomStyle(set: Pick<WordSet, "id"> & { level?: string }): ClassroomStyle {
  // A school's own set carries its level ("elementary" / "secondary").
  const l = topicLevel(set.id) ?? set.level ?? getWordSet(set.id)?.level;
  if (!l) return "kids"; // the hand-made sets are all elementary
  return l === "middle" || l === "high" || l === "senior" || l === "secondary" ? "teen" : "kids";
}

/** Gemara terms that never get an automatic picture (Gemara phase A,
 *  2026-10-15): intimate, violent or capital-punishment subjects. A unit can
 *  still give one an approved hint. Matched on whole words with niqqud
 *  removed ("ארבע מיתות בית דין" matches "מיתות"). To be reviewed by the
 *  Gemara expert. */
export const SENSITIVE_TERMS = [
  "ביאה", "בעילה", "ערווה", "עריות", "זנות", "זונה", "אונס", "מפתה", "ממזר", "נידה",
  "עונש מוות", "מיתה", "מיתות", "סקילה", "שריפה", "הרג", "חנק", "צליבה", "תלייה", "רציחה", "רוצח",
];
const tokens = (s: string) => normSetWord(s).split(/[\s\-־,]+/).filter(Boolean);
/** Whole words only: "הרג" matches "הרג נפש" but never "הרגל". */
export function isSensitiveTerm(word: string): boolean {
  const w = tokens(word);
  return SENSITIVE_TERMS.some((t) => {
    const tt = tokens(t);
    for (let i = 0; i + tt.length <= w.length; i++) if (tt.every((x, j) => w[i + j] === x)) return true;
    return false;
  });
}
const GEMARA_SAFE = "This is for a Talmud lesson in a religious school: respectful and modest, no people in intimate situations, no violence, no blood, no weapons aimed at anyone, no religious figures drawn as faces. Show the idea through symbolic objects (an open Talmud volume, scrolls, scales, a study table, two facing books).";

const KIDS = "Gadit house style for children: a soft modern 3D render like a premium animated film, smooth matte rounded shapes, warm soft global illumination with gentle shadows. A small scene with real depth: the idea itself is the hero, large, sharp and in the center of the frame; a calm, softly blurred, uncluttered warm off-white background. Simple enough for a young child to name it at once, like a picture-book page (Gadi 2026-10-17): a concrete thing is shown as ONE of it, whole and easy to recognize, in its real natural colors (hair is brown, black, blond or red; a tooth is white). Arrows, several objects or highlights only when the meaning itself is a movement, a direction, a change or an amount. Nothing else around it: no side objects, no small icons in circles, no extra props that compete with the idea. A body part is shown on a natural-looking child, with ONE soft highlight or ONE arrow on exactly that part. A greeting or polite phrase is the everyday moment people say it. The soft Gadit palette (teal, mint, warm amber, soft coral) is for the background and props, never for things that have their own real color.";
const KID_CHILD = "The child in the scene is EXACTLY the boy from the reference image: same face, same short brown hair, same teal t-shirt, natural slim proportions. Use the reference only for how the boy looks: he is busy doing the action in the description, a supporting part of the scene, never standing idle at the side, and the idea itself stays the large hero.";
const TEEN = "Gadit house style: a clean modern soft 3D render, smooth matte rounded shapes like premium app icons, soft global illumination and gentle shadows. The idea itself is the hero, large, sharp and centered, on a calm plain warm off-white background, with soft glowing cues on what matters. Palette only teal, mint, warm amber and soft coral. People, when needed, are stylized friendly 3D teenagers.";
const LETTERS = "Keep EVERY letter, dot and vowel mark in the reference image EXACTLY as drawn: same shapes, same order, same positions, nothing added, removed or changed. Turn them into big, chunky, smooth, matte 3D letters in teal and mint.";
const NO_TEXT = "Square composition. No letters, words, labels, chemical symbols or formulas anywhere; digits only when the idea itself is about numbers.";
const NO_OTHER_TEXT = "Square composition. No other letters, words, numbers or writing anywhere.";

/** Concepts that are letters themselves: a typeset reference + what to do with it. */
type LetterRef = { ref: string; child?: boolean; extra: string; high?: boolean };
const LETTER_REFS: Record<string, LetterRef> = {
  "אות": { ref: "letters-6.png", extra: "Six friendly 3D letter blocks in two rows standing on a soft surface." },
  "אלף-בית": { ref: "alphabet.png", extra: "A neat alphabet wall chart with a soft rounded board behind the letters." },
  "סדר האלף-בית": { ref: "alphabet.png", extra: "A neat alphabet wall chart with a soft rounded board behind the letters, a soft glowing arrow running along the rows from right to left." },
  "ניקוד": { ref: "nikud-4.png", extra: "The vowel marks under the letters are bold soft-coral 3D shapes that gently glow; they are the focus. Keep a generous empty margin, nothing touches the edges." },
  "אות דגושה": { ref: "dagesh.png", extra: "The dot inside the letter is a bold round soft-coral ball that gently glows, clearly standing out." },
  "אות רפויה": { ref: "rafa.png", extra: "The dot inside the right letter is a bold round soft-coral ball; the left letter is empty, with a faint soft glow on its empty inner space to show it has no dot." },
  "אותיות אהו\"י": { ref: "ehevi.png", extra: "Four friendly 3D letters side by side, gently glowing." },
  "צליל": { ref: "tzlil.png", child: true, extra: "The boy reads the big 3D letter aloud, soft glowing musical notes flowing from his open mouth." },
};

// Arabic letter concepts (Gadi 2026-10-04), set in Noto Naskh Arabic. Words
// are stored without tashkeel; each concept is listed in its common forms.
const MARK = "The vowel marks on the letters are bold soft-coral 3D shapes that gently glow; they are the focus. Keep a generous empty margin, nothing touches the edges.";
const AR_LETTER_REFS: Array<[string[], LetterRef]> = [
  [["حرف", "حروف", "أحرف", "الحرف", "الحروف", "شكل الحرف", "اسم الحرف"], { ref: "ar-letters-6.png", extra: "Six friendly 3D letter blocks in three rows standing on a soft surface." }],
  [["صوت الحرف"], { ref: "ar-letters-6.png", child: true, extra: "The boy reads the big 3D letters aloud, soft glowing musical notes flowing from his open mouth." }],
  [["أبجدية", "الأبجدية", "حروف الهجاء", "الحروف الهجائية", "ترتيب الحروف"], { ref: "ar-alphabet.png", high: true, extra: "A neat alphabet wall chart with a soft rounded board behind the letters." }],
  [["حركة", "حركات", "الحركات", "حركة قصيرة", "حركات قصيرة", "الحركات القصيرة", "تشكيل", "التشكيل"], { ref: "ar-harakat.png", extra: MARK }],
  [["فتحة", "الفتحة"], { ref: "ar-fatha.png", extra: MARK }],
  [["ضمة", "الضمة"], { ref: "ar-damma.png", extra: MARK }],
  [["كسرة", "الكسرة"], { ref: "ar-kasra.png", extra: MARK }],
  [["سكون", "السكون"], { ref: "ar-sukun.png", extra: "The small round mark above the letter is a bold soft-coral 3D ring that gently glows, clearly standing out." }],
  [["شدة", "الشدة"], { ref: "ar-shadda.png", extra: "The small mark above the letter is a bold soft-coral 3D shape that gently glows, clearly standing out." }],
  [["تنوين", "التنوين"], { ref: "ar-tanwin.png", extra: "The doubled vowel marks are bold soft-coral 3D shapes that gently glow; they are the focus. Keep a generous empty margin." }],
  [["حرف مد", "حرف المد", "حروف المد", "حركة طويلة", "الحركة الطويلة", "حرف علة", "حرف العلة", "حروف العلة", "أحرف العلة", "احرف العلة"], { ref: "ar-madd.png", extra: "Three friendly 3D letters side by side, gently glowing, with a soft glowing line stretching from each to show a long sound." }],
  [["تاء مربوطة", "التاء المربوطة", "علامة التأنيث"], { ref: "ar-taa.png", extra: "The two dots on top of the letter are bold round soft-coral balls that gently glow, clearly standing out." }],
  [["همزة", "الهمزة"], { ref: "ar-hamza.png", extra: "The small hamza marks are bold soft-coral 3D shapes that gently glow; they are the focus." }],
];
for (const [words, v] of AR_LETTER_REFS) for (const w of words) LETTER_REFS[w] = v;

async function brief(word: string, meaning: string, lang: string, admin = false, gemara = false): Promise<string> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: TEXT_MODEL_FAST,
        temperature: 0.3,
        max_completion_tokens: 110,
        messages: [
          { role: "system", content: "You turn a school vocabulary word and its meaning in a lesson into a short ENGLISH description of ONE clear illustration of that EXACT meaning, for a classroom projector. Make the idea itself the large central subject and keep it as simple as a picture-book page, so a child names it at once: a concrete thing is ONE recognizable object in its real colors, with nothing around it (no side objects, no small icons in circles); arrows, several objects or a highlight only when the meaning is a movement, a direction, a change or an amount; a body part is shown on a natural-looking child with ONE highlight or ONE arrow on exactly that part; a greeting, a polite phrase or a feeling is ONE everyday moment where people say or feel it, with those people in it. Include a child only when the idea is an action or experience a person does; otherwise show no people. Never use digits unless the idea is about numbers, and never chemical symbols or labels; show amounts as countable objects and substances as simple drops, bubbles or particles. Never write words or sentences in the picture (image models garble them), in any language: show language ideas with symbols, for example blank colorful word cards for a sentence or grey lines on a page for a paragraph. Single punctuation marks are fine. Reply with ONLY the description, one sentence, no preamble." + (gemara ? " " + GEMARA_SAFE : "") },
          { role: "user", content: `Word (${lang}): ${word}\nMeaning in the lesson: ${meaning}\n\nDescribe the illustration:` },
        ],
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    { const u = usageFrom(data); void logAiUsage({ feature: "image_brief", model: TEXT_MODEL_FAST, tokensIn: u.tokensIn, tokensOut: u.tokensOut, admin }); }
    return String(data?.choices?.[0]?.message?.content || "").replace(/\s+/g, " ").trim().slice(0, 360);
  } catch {
    return "";
  }
}

async function refBlob(name: string): Promise<Blob> {
  const r = await fetch(`${SITE}/img-refs/${name}`);
  if (!r.ok) throw new Error(`ref_${name}_${r.status}`);
  return new Blob([await r.arrayBuffer()], { type: "image/png" });
}

type Usage = { input_tokens_details?: { image_tokens?: number; text_tokens?: number }; output_tokens?: number };
/** IMAGE_MODEL token pricing: text in $5/M, image in $8/M, image out $30/M. */
const usageCost = (u?: Usage) =>
  u ? ((u.input_tokens_details?.text_tokens ?? 0) * 5 + (u.input_tokens_details?.image_tokens ?? 0) * 8 + (u.output_tokens ?? 0) * 30) / 1e6 : undefined;

async function render(prompt: string, refs: string[], quality: "low" | "medium" | "high"): Promise<{ b64: string; cost?: number }> {
  let res: Response;
  if (refs.length) {
    const fd = new FormData();
    fd.append("model", IMAGE_MODEL);
    for (const r of refs) fd.append("image[]", await refBlob(r), r);
    fd.append("prompt", prompt);
    fd.append("size", "1024x1024");
    fd.append("quality", quality);
    res = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: fd });
  } else {
    res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: IMAGE_MODEL, prompt, n: 1, size: "1024x1024", quality }),
    });
  }
  const j = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(j).slice(0, 200));
  const b64 = j.data?.[0]?.b64_json as string | undefined;
  if (!b64) throw new Error("no_image_returned");
  return { b64, cost: usageCost(j.usage) };
}

/** A dictionary word's picture in the Gadit house style (Gadi 2026-10-17:
 *  "the new pictures look great, keep them this way across all of Gadit").
 *  The same brief and style as the projector and the lessons: KIDS for
 *  Kids Mode, TEEN otherwise. The caller stores it. */
export async function houseImage(word: string, meaning: string, lang: string, kids: boolean): Promise<{ b64: string; cost?: number }> {
  const w = word.trim();
  const b = curatedImageHint(w) || (await brief(w, meaning, lang)) || `${w}: ${meaning}`;
  const person = /(child|children|boy|girl|kid|kids|student|students|person|people|teacher|man|woman|family)/i.test(b);
  const refs = kids && person ? ["kid.png"] : [];
  const prompt = `${kids ? KIDS : TEEN} ${refs.length ? KID_CHILD : ""} Draw this: ${b} ${NO_TEXT}`;
  return render(prompt.replace(/\s+/g, " "), refs, "low");
}

export type ClassroomImageResult =
  | { status: "cached"; url: string; cacheKey: string }
  | { status: "generated"; url: string; cacheKey: string }
  | { status: "skipped"; reason: "none" | "sensitive" | "not_approved" | "quota"; cacheKey: string }
  | { status: "error"; error: string; cacheKey: string };

/** The set picture for a word, from cache or drawn now in the house style. */
export async function generateClassroomImage(opts: {
  word: string;
  meaning: string;
  lang: string;
  set: Pick<WordSet, "id">;
  force?: boolean;
  uid?: string;
  /** A run from /admin: counted against the admin daily cap. */
  admin?: boolean;
  /** A meaning of a unit that lists meanings: keyed on its id, not the text. */
  item?: MeaningRef;
  /** Asked only when the picture is not cached yet: may a new one be drawn
   *  (the school's monthly picture cap, 2026-10-17)? */
  allowNew?: () => Promise<boolean>;
  /** Called once a new picture is drawn and stored. */
  onGenerated?: () => Promise<void>;
}): Promise<ClassroomImageResult> {
  const { word, meaning, lang } = opts;
  const style = classroomStyle(opts.set);
  const cKey = opts.item ? itemImageKey(opts.item, lang, style) : classroomImageKey(word, meaning, lang, style);
  const ref = getAdminDb().collection("imageCache").doc(cKey);
  // The unit's own picture setting, and the Gemara safety net.
  const gemara = isGemaraSet(getWordSet(opts.set.id));
  const visual = classroomVisual(opts.set.id, word, opts.item?.m);
  if (visual.mode === "none") return { status: "skipped", reason: "none", cacheKey: cKey };
  if (gemara && visual.mode !== "hint" && isSensitiveTerm(word)) return { status: "skipped", reason: "sensitive", cacheKey: cKey };
  const existing = (await ref.get()).data() as { url?: string; contentLocked?: boolean } | undefined;
  // Locked (approved) content is served even when a redraw is forced. The
  // field is contentLocked, new in phase A: the older `approved` flag some
  // pictures carry keeps its old meaning (none).
  if (existing?.url && (!opts.force || existing.contentLocked === true)) return { status: "cached", url: existing.url, cacheKey: cKey };
  // A meaning (phase C): its picture comes in with its approved content
  // (the publish tool), never drawn on view or by a forced redraw.
  if (opts.item) return { status: "skipped", reason: "not_approved", cacheKey: cKey };
  if (opts.allowNew && !(await opts.allowNew())) return { status: "skipped", reason: "quota", cacheKey: cKey };
  try {
    const w = word.trim();
    const letter = LETTER_REFS[w] ?? LETTER_REFS[w.replace(/[ً-ٰٟ]/g, "")];
    const base = style === "kids" ? KIDS : TEEN;
    let prompt: string;
    let refs: string[];
    let quality: "low" | "medium" | "high" = "low";
    if (letter) {
      refs = [letter.ref, ...(letter.child && style === "kids" ? ["kid.png"] : [])];
      prompt = `${base} ${LETTERS} ${letter.child && style === "kids" ? KID_CHILD : ""} ${letter.extra} ${NO_OTHER_TEXT}`;
      // 28 Arabic letters only survive at high quality (~17¢, drawn once).
      quality = letter.high ? "high" : "medium";
    } else {
      const approvedHint = visual.mode === "hint" ? visual.hint : undefined;
      const b = curatedImageHint(w) || approvedHint || (devDryAi() ? "" : await brief(w, meaning, lang, opts.admin === true, gemara)) || `${w}: ${meaning}`;
      // The fixed boy only when the scene has a person in it; a picture of
      // a thing stays a picture of the thing.
      const person = /(child|children|boy|girl|kid|kids|student|students|person|people|teacher|man|woman|family)/i.test(b);
      refs = style === "kids" && person ? ["kid.png"] : [];
      prompt = `${base} ${refs.length ? KID_CHILD : ""} Draw this: ${b} ${NO_TEXT}`;
    }
    if (devDryAi()) {
      // Local test mode: log what would be drawn, draw nothing, write nothing.
      const shown = prompt.includes("Draw this") ? prompt.slice(prompt.indexOf("Draw this")) : prompt;
      console.info(`[dry-image] ${cKey} gemara=${gemara} prompt=${JSON.stringify(shown.replace(/\s+/g, " ").slice(0, 400))}`);
      return { status: "generated", url: DRY_IMAGE_URL, cacheKey: cKey };
    }
    const out = await render(prompt.replace(/\s+/g, " "), refs, quality);
    void logAiUsage({ feature: "image_classroom", model: IMAGE_MODEL, images: 1, imageQuality: quality, costUsd: out.cost, admin: opts.admin === true });

    const storagePath = `word-images/${cKey}-${crypto.randomBytes(4).toString("hex")}.png`;
    const bucket = getDefaultBucket();
    const file = bucket.file(storagePath);
    await file.save(Buffer.from(out.b64, "base64"), {
      contentType: "image/png",
      metadata: { cacheControl: "public, max-age=31536000, immutable", metadata: { word, uiLang: lang, style, generatedAt: new Date().toISOString() } },
    });
    await file.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    await ref.set({ url, word, uiLang: lang, meaning: meaning.slice(0, 500), style, setId: opts.set.id, storagePath, createdAt: new Date().toISOString() });
    if (opts.onGenerated) await opts.onGenerated().catch(() => {});
    return { status: "generated", url, cacheKey: cKey };
  } catch (e) {
    return { status: "error", error: String(e).slice(0, 200), cacheKey: cKey };
  }
}
