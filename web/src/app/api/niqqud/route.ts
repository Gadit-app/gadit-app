/**
 * POST /api/niqqud  — body { texts: string[] } → { niqqud: string[] }
 *
 * Adds Hebrew vowel points (niqqud) to text so young readers (grades 1-2) can
 * read a word's meaning and examples. Uses Dicta's Nakdan (purpose-built and
 * far more accurate than an LLM at vocalization); results are deterministic
 * per string, so they are cached in Firestore. Non-Hebrew text is returned
 * unchanged. If Dicta is unreachable, the original text is returned so the UI
 * degrades to plain (un-vowelized) Hebrew rather than breaking. Gadi 2026-08-22.
 *
 * Auth: any signed-in user (a light gate so the Dicta proxy isn't public).
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 25;

const DICTA_URL = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
const HEBREW = /[֐-׿]/;

function hashKey(text: string): string {
  return crypto.createHash("sha256").update("v1:" + text).digest("hex").slice(0, 40);
}

/** Call Dicta Nakdan and rebuild the vowelized string from its token stream. */
async function vowelize(text: string): Promise<string> {
  const res = await fetch(DICTA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      task: "nakdan", data: text, genre: "modern", useTokenization: true,
      addmorph: false, keepmetagim: false, keepqq: false, nodageshdefmem: false, patachma: false,
    }),
  });
  if (!res.ok) throw new Error("dicta_" + res.status);
  const json = (await res.json()) as { data?: Array<{ nakdan?: { word?: string; options?: Array<{ w?: string }> }; word?: string }> };
  const toks = json.data ?? [];
  let out = "";
  for (const t of toks) {
    if (t.nakdan) {
      const w = t.nakdan.options?.[0]?.w ?? t.nakdan.word ?? "";
      out += w.replace(/\|/g, ""); // '|' separates prefix from stem in Dicta output
    } else if (typeof t.word === "string") {
      out += t.word;
    }
  }
  return out || text;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
  try {
    await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }

  let texts: string[] = [];
  try {
    const b = (await req.json()) as { texts?: unknown };
    if (Array.isArray(b.texts)) texts = b.texts.filter((x): x is string => typeof x === "string").slice(0, 40);
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const db = getAdminDb();
  const niqqud = await Promise.all(
    texts.map(async (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed || !HEBREW.test(trimmed)) return text; // nothing to vowelize
      const ref = db.collection("niqqudCache").doc(hashKey(trimmed));
      try {
        const snap = await ref.get();
        if (snap.exists) return (snap.data() as { niqqud?: string }).niqqud ?? text;
      } catch { /* cache read best-effort */ }
      try {
        const voweled = await vowelize(trimmed);
        try { await ref.set({ text: trimmed, niqqud: voweled, at: new Date().toISOString() }); } catch { /* ignore */ }
        // Preserve any surrounding whitespace the caller sent.
        return text.replace(trimmed, voweled);
      } catch {
        return text; // Dicta down → plain Hebrew, no break
      }
    }),
  );

  return NextResponse.json({ niqqud });
}
