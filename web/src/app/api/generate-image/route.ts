import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminDb, getDefaultBucket, verifyUserAndGetPlan } from "@/lib/firebase-admin";

const MONTHLY_LIMIT_CLEAR = 30;
const MONTHLY_LIMIT_DEEP = 100;

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function cacheKey(word: string, meaning: string, uiLang: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${uiLang}|${word.trim().toLowerCase()}|${meaning.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 24);
  return `img_${uiLang}_${hash}`;
}

function buildDallePrompt(word: string, meaning: string): string {
  // V2 prompt — rewritten after Andrea (CZ beta) hit a consistent
  // 'image_generation_failed' on Czech words. The old prompt stacked
  // four double-negatives ('NOT artistic, NOT abstract, NOT decorative,
  // ABSOLUTELY NO text') which DALL-E sometimes treats as a safety
  // signal and refuses outright. We also wrapped the headword in
  // straight quotes, and a Czech meaning that happens to contain its
  // OWN quotes ('např. "košile"') broke the sentence boundary.
  //
  // New approach: positive instructions only, no quote-wrapped headword,
  // meaning truncated tight, single instruction about text.
  const trimmedMeaning = meaning.length > 180 ? meaning.slice(0, 180).replace(/[“”"]+/g, "") : meaning.replace(/[“”"]+/g, "");
  const cleanWord = word.replace(/[“”"]+/g, "");
  return `A clean, realistic photograph of ${cleanWord}. Context: ${trimmedMeaning}. Show the actual everyday object or scene, well-lit, with a plain neutral background. The subject fills the frame and is instantly recognizable. The image contains no text, no letters, no numbers, and no written characters.`;
}

export async function POST(req: NextRequest) {
  try {
    const { word, meaning, uiLang } = await req.json();

    if (!word?.trim() || !meaning?.trim()) {
      return NextResponse.json({ error: "word and meaning required" }, { status: 400 });
    }

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
    const cKey = cacheKey(word, meaning, uiLangCode);
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
      // OpenAI removed support for the `response_format` parameter on
      // this endpoint (Vercel logs showed:
      // 'Unknown parameter: response_format. invalid_request_error').
      // We now send the minimal request and accept whichever shape
      // comes back — recent dall-e-3 responses include both a `url`
      // field and a `b64_json` field on the result object, and our
      // consumer below already handles both.
      return fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      });
    }
    const dallePrompt = buildDallePrompt(word, meaning);
    let dalleRes = await callDalle(dallePrompt);

    if (!dalleRes.ok) {
      const errText = await dalleRes.text();
      console.error("DALL-E error (attempt 1):", dalleRes.status, errText.slice(0, 400));
      // Content-policy refusal — retry with a minimal, photo-only prompt
      // that omits the meaning entirely. This recovers cases where the
      // meaning carried a sensitive token (medical, anatomical, etc.)
      // without dropping the user's request.
      const isPolicyRefusal =
        errText.includes("content_policy_violation") ||
        errText.includes("safety system") ||
        dalleRes.status === 400;
      if (isPolicyRefusal) {
        const cleanWord = word.replace(/[“”"]+/g, "");
        const minimalPrompt = `A clean realistic photograph of ${cleanWord}. Plain neutral background. The subject fills the frame. No text in the image.`;
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
