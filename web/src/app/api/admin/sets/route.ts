import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getWordSet } from "@/lib/word-sets";
import { resolveClassroomMeaning } from "@/lib/classroom-word";
import { generateWordImage, imageCacheKey } from "@/lib/word-image";
import { exampleCacheKey, getOrGenerateExamples } from "@/lib/word-examples";

/**
 * Admin API backing the /admin/sets review grid.
 *
 * GET  ?secret=...&set=<id>
 *   Read-only (no OpenAI spend). For each word in the set, return its
 *   resolved classroom meaning + the CACHED projector image + the CACHED
 *   examples, so the grid can show every word's picture/definition/
 *   examples and flag outliers. Missing image/examples come back null/[].
 *
 * POST ?secret=...   body: { action, set, word }
 *   action "image"    → bust + regenerate that one word's projector image
 *   action "examples" → regenerate that one word's examples
 *   action "both"     → both
 *   Returns the fresh { imageUrl, examples } for the word.
 */
export const maxDuration = 60;

const KIDS_MODE = false;

function auth(req: NextRequest): NextResponse | null {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

type WordRow = {
  word: string;
  meaning: string;
  meaningSource: "curated" | "cache" | null;
  imageUrl: string | null;
  examples: string[];
};

export async function GET(req: NextRequest) {
  const unauth = auth(req);
  if (unauth) return unauth;

  const setId = req.nextUrl.searchParams.get("set") ?? "";
  const set = getWordSet(setId);
  if (!set) return NextResponse.json({ error: "set_not_found", setId }, { status: 404 });

  const db = getAdminDb();
  const lang = set.lang;

  const rows: WordRow[] = await Promise.all(
    set.words.map(async (word) => {
      const resolved = await resolveClassroomMeaning(word, lang);
      if (!resolved) {
        return { word, meaning: "", meaningSource: null, imageUrl: null, examples: [] };
      }
      const imgKey = imageCacheKey(word, resolved.meaning, lang, KIDS_MODE);
      const exKey = exampleCacheKey(word, resolved.meaning, lang);
      const [imgSnap, exSnap] = await Promise.all([
        db.collection("imageCache").doc(imgKey).get(),
        db.collection("exampleCache").doc(exKey).get(),
      ]);
      const imageUrl = (imgSnap.data()?.url as string | undefined) ?? null;
      const examples = (exSnap.data()?.examples as string[] | undefined) ?? [];
      return { word, meaning: resolved.meaning, meaningSource: resolved.source, imageUrl, examples };
    }),
  );

  return NextResponse.json({
    ok: true,
    set: { id: set.id, title: set.title, subject: set.subject, grade: set.grade ?? null, lang },
    words: rows,
  });
}

export async function POST(req: NextRequest) {
  const unauth = auth(req);
  if (unauth) return unauth;

  const body = (await req.json().catch(() => ({}))) as {
    action?: "image" | "examples" | "both";
    set?: string;
    word?: string;
  };
  const action = body.action ?? "image";
  const word = (body.word ?? "").trim();
  const set = getWordSet(body.set ?? "");
  if (!word) return NextResponse.json({ error: "word required" }, { status: 400 });
  if (!set) return NextResponse.json({ error: "set_not_found" }, { status: 404 });

  const lang = set.lang;
  const resolved = await resolveClassroomMeaning(word, lang);
  if (!resolved) {
    return NextResponse.json(
      { error: "no_meaning", detail: "No curated def and no cached define result to key on." },
      { status: 409 },
    );
  }

  let imageUrl: string | null = null;
  let imageStatus: string | undefined;
  let examples: string[] = [];

  if (action === "image" || action === "both") {
    const img = await generateWordImage({
      word,
      meaning: resolved.meaning,
      example: resolved.example,
      uiLang: lang,
      kidsMode: KIDS_MODE,
      force: true,
    });
    imageStatus = img.status;
    if (img.status !== "error") imageUrl = img.url;
    else return NextResponse.json({ error: "image_failed", detail: img.error }, { status: 502 });
  }

  if (action === "examples" || action === "both") {
    const ex = await getOrGenerateExamples(word, resolved.meaning, lang, { force: true });
    examples = ex.examples;
  }

  return NextResponse.json({
    ok: true,
    word,
    meaning: resolved.meaning,
    meaningSource: resolved.source,
    imageUrl,
    imageStatus,
    examples,
  });
}
