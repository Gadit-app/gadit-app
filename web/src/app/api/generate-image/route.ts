import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminDb, getDefaultBucket, verifyUserAndGetPlan } from "@/lib/firebase-admin";

// gpt-image-1 at quality:low typically completes in 5-15s; quality:medium
// can run 10-30s and sometimes >45s when OpenAI is busy. Raise the
// serverless cap so we don't kill a request that would have succeeded.
export const maxDuration = 60;

const MONTHLY_LIMIT_CLEAR = 30;
const MONTHLY_LIMIT_DEEP = 100;

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function cacheKey(word: string, meaning: string, uiLang: string, kidsMode = false): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${uiLang}|${word.trim().toLowerCase()}|${meaning.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 24);
  // Kids-mode images use a separate cache namespace so a kid-friendly
  // flat illustration never gets returned to an adult who searches the
  // same word, and vice versa. Existing adult cache keys (img_<lang>_*)
  // are preserved exactly — only kids get the new `img_kids_<lang>_*`
  // shape, so we don't accidentally invalidate the corpus we've already
  // paid to generate.
  return kidsMode ? `img_kids_${uiLang}_${hash}` : `img_${uiLang}_${hash}`;
}

function clean(s: string): string {
  return s.replace(/[“”"]+/g, "");
}

/**
 * Kids-mode prompt builder — locked to Style B (Modern flat illustration,
 * Duolingo / Khan Academy Kids aesthetic) after a 4-style A/B test on
 * 5 sample words (חתול, אהבה, חלום, גשם, מלאך) on 2026-06-19. Gadi
 * picked B as the cleanest cross-age look (5-12), fast to read for a
 * child mid-search and warm enough for parents to feel good about it.
 *
 * We deliberately DON'T use the example-sentence prompt variant the
 * adult path uses. For kids the priority is "one clear object filling
 * the frame" over "a faithful illustration of this sentence". Abstract
 * words still work because the meaning text anchors what to draw.
 *
 * Safety language ("no scary or dark imagery") is in the prompt itself,
 * NOT a stack of negations — OpenAI's filter treats long negation lists
 * as risk signals and refuses borderline-fine requests.
 */
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
  // V3 prompt — scene-based when we have an example sentence.
  //
  // Why: gpt-image-1 at quality:medium does fine on concrete nouns
  // ("גשם" → recognizable rain photo) but consistently mis-fires on
  // abstract concepts ("חוויה" / "experience" → ambiguous arms-raised
  // figures that don't read as the concept). Telling the model to
  // "show the object" only works when an object exists. Telling it
  // to "illustrate the scene described in this sentence" works for
  // both: the example sentence is already a concrete scenario that
  // exemplifies the word — concrete words get a contextual photo
  // (rain on a street), abstract words get a meaningful moment
  // (a memorable trip in Egypt).
  //
  // V2 history we keep: positive instructions only (no stacks of
  // double-negatives — they read as safety signals); no quote-wrapped
  // headword; meaning truncated and stripped of curly quotes.
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
  // Fallback (no example): the V2 object-first prompt. Still works
  // fine for concrete nouns; abstract words just won't be great.
  return `A clean, realistic photograph of ${cleanWord}. Context: ${cleanMeaning}. Show the actual everyday object or scene, well-lit, with a plain neutral background. The subject fills the frame and is instantly recognizable. The image contains no text, no letters, no numbers, and no written characters.`;
}

export async function POST(req: NextRequest) {
  try {
    const { word, meaning, uiLang, example, kidsMode } = await req.json();

    if (!word?.trim() || !meaning?.trim()) {
      return NextResponse.json({ error: "word and meaning required" }, { status: 400 });
    }
    const safeExample = typeof example === "string" ? example.trim() : "";
    const isKidsMode = kidsMode === true;

    // Auth check
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    if (userInfo.plan === "basic") {
      return NextResponse.json({ error: "upgrade_required", requiredPlan: "clear" }, { status: 402 });
    }

    const uiLangCode = typeof uiLang === "string" ? uiLang : "en";
    const cKey = cacheKey(word, meaning, uiLangCode, isKidsMode);
    const db = getAdminDb();

    // Check cache
    const cachedDoc = await db.collection("imageCache").doc(cKey).get();
    if (cachedDoc.exists) {
      const data = cachedDoc.data();
      if (data?.url) {
        return NextResponse.json({ url: data.url, cached: true });
      }
    }

    // Rate limit: check this user's usage this month (cached images don't count — we already returned above)
    const monthKey = currentMonthKey();
    const usageRef = db.collection("users").doc(userInfo.userId).collection("imageUsage").doc(monthKey);
    const usageSnap = await usageRef.get();
    const used = (usageSnap.data()?.count as number | undefined) ?? 0;
    const limit = userInfo.plan === "deep" ? MONTHLY_LIMIT_DEEP : MONTHLY_LIMIT_CLEAR;
    if (used >= limit) {
      return NextResponse.json(
        { error: "monthly_limit_reached", used, limit },
        { status: 429 }
      );
    }

    // Generate image via DALL-E 3. If the rich prompt is refused by
    // the safety filter (content_policy_violation) we retry once with
    // a minimal prompt that strips the meaning down to just the
    // headword — safer for the filter, still useful as an
    // illustration.
    async function callDalle(prompt: string) {
      // gpt-image-1 replaced dall-e-3 in OpenAI's public API. The new
      // model uses quality enum 'low' / 'medium' / 'high' / 'auto',
      // returns b64_json by default (no response_format needed), and
      // supports the same 1024-square output.
      //
      // Picked 'low' for speed (Gadi user feedback 2026-06-13: 'תמונות
      // לוקחות הרבה זמן'). Low is roughly 3x faster than medium
      // (~5-15s vs ~10-30s+) and 3x cheaper (~$0.02/image vs ~$0.07).
      // For a dictionary illustration we just need the subject to be
      // recognizable, not photo-realistic — 'low' clears that bar.
      // Cache means the per-popular-word amortized cost is well below
      // either tier.
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
    const dallePrompt = isKidsMode
      ? buildKidsPrompt(word, meaning)
      : buildDallePrompt(word, meaning, safeExample || undefined);
    let dalleRes = await callDalle(dallePrompt);

    if (!dalleRes.ok) {
      const errText = await dalleRes.text();
      console.error("DALL-E error (attempt 1):", dalleRes.status, errText.slice(0, 400));
      // Content-policy refusal — retry with a minimal prompt that omits
      // the meaning entirely. This recovers cases where the meaning
      // carried a sensitive token (medical, anatomical, etc.) without
      // dropping the user's request. Kids-mode fallback stays in the
      // flat-illustration aesthetic; adult fallback uses the photo
      // wording the rest of the surface expects.
      const isPolicyRefusal =
        errText.includes("content_policy_violation") ||
        errText.includes("safety system") ||
        dalleRes.status === 400;
      if (isPolicyRefusal) {
        const cleanWord = word.replace(/[“”"]+/g, "");
        const minimalPrompt = isKidsMode
          ? `A simple modern flat illustration of ${cleanWord} for a children's book. Bright cheerful colors, clean white background, friendly cartoon style. No text, no letters, no scary imagery.`
          : `A clean realistic photograph of ${cleanWord}. Plain neutral background. The subject fills the frame. No text in the image.`;
        dalleRes = await callDalle(minimalPrompt);
        if (!dalleRes.ok) {
          const errText2 = await dalleRes.text();
          console.error("DALL-E error (attempt 2):", dalleRes.status, errText2.slice(0, 400));
          return NextResponse.json(
            { error: "image_generation_failed", details: errText2.slice(0, 300) },
            { status: 502 },
          );
        }
      } else {
        return NextResponse.json(
          { error: "image_generation_failed", details: errText.slice(0, 300) },
          { status: 502 },
        );
      }
    }

    const dalleData = await dalleRes.json();
    // The API now returns either a base64 payload OR a hosted URL,
    // depending on the model/endpoint version. Handle both.
    const result = dalleData.data?.[0] as { b64_json?: string; url?: string } | undefined;
    let buffer: Buffer;
    if (result?.b64_json) {
      buffer = Buffer.from(result.b64_json, "base64");
    } else if (result?.url) {
      // Hosted URL path — download the bytes once so we can re-host on
      // Firebase Storage (OpenAI hosted URLs expire after ~1 hour).
      const imgRes = await fetch(result.url);
      if (!imgRes.ok) {
        return NextResponse.json({ error: "image_fetch_failed", details: `${imgRes.status}` }, { status: 502 });
      }
      buffer = Buffer.from(await imgRes.arrayBuffer());
    } else {
      console.error("[generate-image] OpenAI response missing both b64_json and url:", JSON.stringify(dalleData).slice(0, 400));
      return NextResponse.json({ error: "no_image_returned" }, { status: 502 });
    }

    // Upload to Firebase Storage
    const storagePath = `word-images/${cKey}.png`;
    const bucket = getDefaultBucket();
    const file = bucket.file(storagePath);
    await file.save(buffer, {
      contentType: "image/png",
      metadata: {
        cacheControl: "public, max-age=31536000, immutable",
        metadata: {
          word,
          uiLang: uiLangCode,
          generatedAt: new Date().toISOString(),
        },
      },
    });
    // Make it publicly readable (our storage rules allow public read of word-images/*)
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Save to cache (per word+meaning, shared across users)
    await db.collection("imageCache").doc(cKey).set({
      url: publicUrl,
      word,
      uiLang: uiLangCode,
      meaning: meaning.slice(0, 500),
      storagePath,
      createdAt: new Date().toISOString(),
    });

    // Increment this user's usage this month (only on fresh generation)
    await usageRef.set(
      {
        count: used + 1,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ url: publicUrl, cached: false, usage: used + 1, limit });
  } catch (err) {
    console.error("generate-image error:", err);
    return NextResponse.json({ error: "internal_error", details: String(err) }, { status: 500 });
  }
}
