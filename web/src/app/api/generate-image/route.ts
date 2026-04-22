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
  // Goal: a simple, instantly-recognizable photograph of the concept.
  // We give DALL-E both the word AND the definition to anchor the subject,
  // and demand a plain, realistic image — not artistic interpretations.
  const trimmedMeaning = meaning.length > 200 ? meaning.slice(0, 200) : meaning;
  return `A clear, simple, realistic photograph that unambiguously shows: "${word}" — defined as: ${trimmedMeaning}. The image must show the actual everyday thing the word refers to, exactly as a person would recognize it in real life. Plain neutral background, well-lit, the subject is the main focus and clearly identifiable. NOT artistic, NOT abstract, NOT decorative — just a clean recognizable example of the thing itself. ABSOLUTELY NO text, letters, words, numbers, captions, or written characters anywhere in the image.`;
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

    // Generate image via DALL-E 3
    const dallePrompt = buildDallePrompt(word, meaning);
    const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: dallePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json",
      }),
    });

    if (!dalleRes.ok) {
      const errText = await dalleRes.text();
      console.error("DALL-E error:", dalleRes.status, errText);
      return NextResponse.json({ error: "image_generation_failed", details: errText.slice(0, 300) }, { status: 502 });
    }

    const dalleData = await dalleRes.json();
    const b64 = dalleData.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "no_image_returned" }, { status: 502 });
    }

    // Upload to Firebase Storage
    const buffer = Buffer.from(b64, "base64");
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
