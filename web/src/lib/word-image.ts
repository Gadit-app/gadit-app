import crypto from "node:crypto";
import { getAdminDb, getDefaultBucket } from "@/lib/firebase-admin";
import { curatedImageHint } from "@/lib/word-sets";

/**
 * Admin-side image generation for classroom word sets.
 *
 * This is a DELIBERATE, minimal REPLICATION of the core of
 * /api/generate-image (englishBrief -> gpt-image-1 -> Firebase Storage
 * -> imageCache doc). The live user route is left completely untouched
 * (its auth + monthly rate-limit + response shape must not change), but
 * this helper writes the SAME imageCache/<cacheKey> docs with the SAME
 * key formula, so an image warmed here is exactly the one the classroom
 * present view will find on a cache hit. Duplication is intentional and
 * accepted for an admin tool (see task guardrails).
 */

/**
 * Same cache key formula as /api/generate-image:
 *   sha256(`${uiLang}|${word}|${meaning}` lower/trimmed).slice(0,24)
 *   prefixed `img_${uiLang}_` (adult) or `img_kids_${uiLang}_` (kids).
 */
export function imageCacheKey(word: string, meaning: string, uiLang: string, kidsMode = false): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${uiLang}|${word.trim().toLowerCase()}|${meaning.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 24);
  return kidsMode ? `img_kids_${uiLang}_${hash}` : `img_${uiLang}_${hash}`;
}

function clean(s: string): string {
  return s.replace(/[“”"]+/g, "");
}

function buildKidsPrompt(word: string, meaning: string): string {
  const cleanWord = clean(word);
  const cleanMeaning = clean(meaning.length > 180 ? meaning.slice(0, 180) : meaning);
  return [
    `A modern flat illustration of ${cleanWord} (${cleanMeaning}), for a children's educational app.`,
    `Bright cheerful colors, simple geometric shapes, friendly cartoon style with soft outlines, clean white background.`,
    `Designed for kids ages 5-12. The subject fills the frame and is instantly recognizable.`,
    `No text, no letters, no numbers, no scary or dark imagery.`,
  ].join(" ");
}

function buildDallePrompt(word: string, meaning: string, example?: string): string {
  const cleanWord = clean(word);
  const cleanMeaning = clean(meaning.length > 180 ? meaning.slice(0, 180) : meaning);
  const cleanExample = example ? clean(example.length > 180 ? example.slice(0, 180) : example) : "";
  if (cleanExample) {
    return [
      `A clean, realistic photograph of the real-world moment described in this scene: ${cleanExample}.`,
      `The scene depicts the meaning of the word ${cleanWord}, specifically: ${cleanMeaning}.`,
      `Natural lighting, plain neutral background, the key elements of the scene fill the frame and are instantly recognizable.`,
      `The image contains no text, no letters, no numbers, and no written characters.`,
    ].join(" ");
  }
  return `A clean, realistic photograph of ${cleanWord}. Context: ${cleanMeaning}. Show the actual everyday object or scene, well-lit, with a plain neutral background. The subject fills the frame and is instantly recognizable. The image contains no text, no letters, no numbers, and no written characters.`;
}

/** English visual brief so gpt-image-1 understands non-English terms. */
async function englishBrief(word: string, meaning: string, example: string, uiLang: string): Promise<string> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 90,
        messages: [
          { role: "system", content: "You turn a dictionary word and its meaning into a short ENGLISH description of ONE clear, literal illustration that represents that EXACT meaning, for a children's educational app. Describe a single concrete subject or a simple scene, instantly recognizable. If the word is itself about letters, vowel marks, punctuation, digits or numbers, DO show those symbols clearly (this is the one case where letters or numbers belong in the picture, e.g. Hebrew letters with vowel points for the word ניקוד). Otherwise avoid written text. Reply with ONLY the description, one sentence, no preamble." },
          { role: "user", content: `Word (${uiLang}): ${word}\nMeaning: ${meaning}${example ? `\nExample: ${example}` : ""}\n\nDescribe the illustration:` },
        ],
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return String(data?.choices?.[0]?.message?.content || "").replace(/\s+/g, " ").trim().slice(0, 320);
  } catch {
    return "";
  }
}

async function callGptImage(prompt: string) {
  return fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "low",
    }),
  });
}

export type WordImageResult =
  | { status: "cached"; url: string; cacheKey: string }
  | { status: "generated"; url: string; cacheKey: string }
  | { status: "error"; error: string; cacheKey: string };

/**
 * Generate (or return the cached) classroom image for a word+meaning,
 * writing the SAME imageCache/<cacheKey> doc the live route writes.
 *
 * @param force  regenerate even on a cache hit (busts the old doc first).
 */
export async function generateWordImage(opts: {
  word: string;
  meaning: string;
  example?: string;
  uiLang: string;
  kidsMode?: boolean;
  force?: boolean;
}): Promise<WordImageResult> {
  const { word, meaning, uiLang, kidsMode = false, force = false } = opts;
  const example = (opts.example ?? "").trim();
  const cKey = imageCacheKey(word, meaning, uiLang, kidsMode);
  const db = getAdminDb();
  const ref = db.collection("imageCache").doc(cKey);

  if (!force) {
    const cachedDoc = await ref.get();
    const url = cachedDoc.data()?.url as string | undefined;
    if (url) return { status: "cached", url, cacheKey: cKey };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { status: "error", error: "OPENAI_API_KEY not configured", cacheKey: cKey };
  }

  // A curated per-word hint (word-sets.ts) OVERRIDES the AI-guessed brief:
  // it pins the exact, pedagogically-correct picture (Hebrew letters, the
  // right open/closed mouth for vowel/consonant, etc.). Everything else
  // below — the kids/adult wrapper, gpt-image-1 call, versioned storage
  // path, cacheKey and imageCache write — stays identical, so a warmed
  // image is still found by the classroom on a cache hit.
  const hint = curatedImageHint(word);
  const brief = hint || (await englishBrief(word, meaning, example, uiLang));
  const prompt = brief
    ? (kidsMode
        ? `A modern flat illustration for a children's educational app, ages 5-12. Draw this: ${brief}. Bright cheerful colors, simple geometric shapes, friendly cartoon style with soft outlines, clean white background. The subject fills the frame and is instantly recognizable. Do not add any caption or descriptive words on top of the image.`
        : `A clean, clear illustration. Draw this: ${brief}. Natural lighting, plain neutral background, the key subject fills the frame and is instantly recognizable. Do not add any caption or descriptive words on top of the image.`)
    : (kidsMode
        ? buildKidsPrompt(word, meaning)
        : buildDallePrompt(word, meaning, example || undefined));

  try {
    let imgRes = await callGptImage(prompt);
    if (!imgRes.ok) {
      const errText = await imgRes.text();
      const isPolicyRefusal =
        errText.includes("content_policy_violation") ||
        errText.includes("safety system") ||
        imgRes.status === 400;
      if (isPolicyRefusal) {
        const cleanWord = clean(word);
        const minimalPrompt = kidsMode
          ? `A simple modern flat illustration of ${cleanWord} for a children's book. Bright cheerful colors, clean white background, friendly cartoon style. No text, no letters, no scary imagery.`
          : `A clean realistic photograph of ${cleanWord}. Plain neutral background. The subject fills the frame. No text in the image.`;
        imgRes = await callGptImage(minimalPrompt);
        if (!imgRes.ok) {
          const t2 = await imgRes.text();
          return { status: "error", error: t2.slice(0, 200), cacheKey: cKey };
        }
      } else {
        return { status: "error", error: errText.slice(0, 200), cacheKey: cKey };
      }
    }

    const data = await imgRes.json();
    const result = data.data?.[0] as { b64_json?: string; url?: string } | undefined;
    let buffer: Buffer;
    if (result?.b64_json) {
      buffer = Buffer.from(result.b64_json, "base64");
    } else if (result?.url) {
      const dl = await fetch(result.url);
      if (!dl.ok) return { status: "error", error: `image_fetch_failed ${dl.status}`, cacheKey: cKey };
      buffer = Buffer.from(await dl.arrayBuffer());
    } else {
      return { status: "error", error: "no_image_returned", cacheKey: cKey };
    }

    const storagePath = `word-images/${cKey}-${crypto.randomBytes(4).toString("hex")}.png`;
    const bucket = getDefaultBucket();
    const file = bucket.file(storagePath);
    await file.save(buffer, {
      contentType: "image/png",
      metadata: {
        cacheControl: "public, max-age=31536000, immutable",
        metadata: { word, uiLang, generatedAt: new Date().toISOString() },
      },
    });
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    await ref.set({
      url: publicUrl,
      word,
      uiLang,
      meaning: meaning.slice(0, 500),
      storagePath,
      createdAt: new Date().toISOString(),
    });

    return { status: "generated", url: publicUrl, cacheKey: cKey };
  } catch (err) {
    return { status: "error", error: String(err).slice(0, 200), cacheKey: cKey };
  }
}
