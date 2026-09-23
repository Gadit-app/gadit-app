import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminDb, getDefaultBucket } from "@/lib/firebase-admin";
import { logAiUsage } from "@/lib/ai-cost";
import { cacheKey, buildKidsPrompt, englishBrief } from "@/app/api/generate-image/route";

/**
 * Admin — pre-warm the Kids Mode illustration cache for a list of words, so the
 * common lookups a child does return their picture INSTANTLY from cache instead
 * of waiting 5-15s for gpt-image-1 (Gadi 2026-09-23). This is the biggest
 * perceived-speed lever for word-finding: the image latency is inherent to the
 * model, so the fix is to have already paid it before the child searches.
 *
 * For each word we read the cached DEFINE result to get its meanings, then
 * generate a kids illustration per meaning (quality:low), storing it under the
 * same `img_kids_*` cache key the live route uses. Already-cached meanings are
 * skipped, so this is safe to re-run and cheap after the first pass.
 *
 *   POST /api/admin/warm-images?secret=$ADMIN_SECRET
 *   Body: { words: string[], lang?: string, max?: number }
 *
 * Bounded: caps total images per call (default 30) and runs 3 at a time, so one
 * call fits the serverless budget. Call it in batches for a big list.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Meaning = { meaning?: string };
type CachedWord = { meanings?: Meaning[] };

async function renderKidsImage(word: string, meaning: string, lang: string): Promise<string | null> {
  const brief = await englishBrief(word, meaning, "", lang);
  const prompt = brief
    ? `A modern flat illustration for a children's educational app, ages 5-12. Draw this: ${brief}. Bright cheerful colors, simple geometric shapes, friendly cartoon style with soft outlines, clean white background. The subject fills the frame and is instantly recognizable. Do not add any caption or descriptive words on top of the image.`
    : buildKidsPrompt(word, meaning);

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size: "1024x1024", quality: "low" }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const out = data.data?.[0] as { b64_json?: string; url?: string } | undefined;
  let buffer: Buffer;
  if (out?.b64_json) buffer = Buffer.from(out.b64_json, "base64");
  else if (out?.url) {
    const imgRes = await fetch(out.url);
    if (!imgRes.ok) return null;
    buffer = Buffer.from(await imgRes.arrayBuffer());
  } else return null;

  void logAiUsage({ feature: "image_kids", model: "gpt-image-1", images: 1, imageQuality: "low", plan: "deep" });

  const cKey = cacheKey(word, meaning, lang, true);
  const storagePath = `word-images/${cKey}-${crypto.randomBytes(4).toString("hex")}.png`;
  const bucket = getDefaultBucket();
  const file = bucket.file(storagePath);
  await file.save(buffer, {
    contentType: "image/png",
    metadata: { cacheControl: "public, max-age=31536000, immutable", metadata: { word, uiLang: lang, generatedAt: new Date().toISOString(), warmed: "1" } },
  });
  await file.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  await getAdminDb().collection("imageCache").doc(cKey).set({
    url: publicUrl, word, uiLang: lang, meaning: meaning.slice(0, 500), storagePath, createdAt: new Date().toISOString(), warmed: true,
  });
  return publicUrl;
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let words: string[] = [];
  let lang = "he";
  let max = 30;
  try {
    const b = (await req.json()) as { words?: unknown; lang?: unknown; max?: unknown };
    if (Array.isArray(b.words)) words = b.words.filter((w): w is string => typeof w === "string").map((w) => w.trim().toLowerCase()).filter(Boolean).slice(0, 60);
    if (typeof b.lang === "string") lang = b.lang;
    if (typeof b.max === "number") max = Math.max(1, Math.min(60, Math.floor(b.max)));
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (words.length === 0) return NextResponse.json({ error: "words required" }, { status: 400 });

  const db = getAdminDb();

  // Build the list of (word, meaning) image tasks from each word's cached
  // define result (kids tier, falling back to base). Words with no cached
  // definition are reported so the caller can define them first.
  type Task = { word: string; meaning: string };
  const tasks: Task[] = [];
  const noDefine: string[] = [];
  for (const w of words) {
    const kids = await db.collection("cache").doc(`auto2_${lang}_kids_${w}`).get();
    const base = kids.exists ? null : await db.collection("cache").doc(`auto2_${lang}_base_${w}`).get();
    const d = (kids.exists ? kids.data() : base?.data()) as CachedWord | undefined;
    const meanings = d?.meanings ?? [];
    if (meanings.length === 0) { noDefine.push(w); continue; }
    for (const m of meanings) {
      const meaning = (m?.meaning ?? "").trim();
      if (meaning) tasks.push({ word: w, meaning });
    }
  }

  // Skip meanings already cached; cap the rest to `max`.
  const pending: Task[] = [];
  let alreadyWarm = 0;
  for (const t of tasks) {
    if (pending.length >= max) break;
    const snap = await db.collection("imageCache").doc(cacheKey(t.word, t.meaning, lang, true)).get();
    if (snap.exists && snap.data()?.url) { alreadyWarm++; continue; }
    pending.push(t);
  }

  // Generate, 3 at a time.
  let warmed = 0, failed = 0;
  let i = 0;
  async function worker() {
    while (i < pending.length) {
      const t = pending[i++];
      try {
        const url = await renderKidsImage(t.word, t.meaning, lang);
        if (url) warmed++; else failed++;
      } catch { failed++; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, pending.length) }, () => worker()));

  return NextResponse.json({
    lang,
    requested: words.length,
    meaningsFound: tasks.length,
    alreadyWarm,
    warmed,
    failed,
    noDefinition: noDefine,
    hint: noDefine.length ? "Words in noDefinition have no cached definition yet — open them once (or warm the define cache) then re-run." : undefined,
  });
}
