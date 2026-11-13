/**
 * POST /api/play/arrow-clues  { words: string[], lang: "he" | "en" }
 *   → { clues: { [word]: string } }
 *
 * Short arrowword (תשחץ) clues, 1-4 words, in the words' own language, the
 * way a newspaper arrowword writes them (Gadi 2026-11-11, Osher's idea).
 * Written once per word by the text model and kept in `arrowClues`, so a
 * word costs a fraction of a cent once and nothing after. A clue never
 * contains the word or a form of it. Words that get no valid clue are
 * simply missing from the answer; the game then uses the meaning instead.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom, TEXT_MODEL_FAST } from "@/lib/ai-cost";
import { limitBump } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_WORDS = 24;
const NIQQUD = /[֑-ׇ]/g;
const norm = (w: string) => w.normalize("NFC").replace(NIQQUD, "").trim().toLowerCase();
const keyOf = (lang: string, w: string) => crypto.createHash("sha1").update(`v1|${lang}|${norm(w)}`).digest("hex").slice(0, 32);

const LANG_NAME: Record<string, string> = { he: "Hebrew", en: "English" };

/** A clue is good when it is short and does not give the word away. */
function valid(word: string, clue: string, lang: string): boolean {
  const c = clue.replace(/\s+/g, " ").trim();
  if (!c || c.split(" ").length > 5 || c.length > 40) return false;
  const w = norm(word), cc = norm(c);
  if (cc.includes(w)) return false;
  // a Hebrew root shows as 3 shared letters in order; English as the word's stem
  const stem = lang === "en" ? w.slice(0, Math.max(4, w.length - 2)) : w.slice(0, 3);
  if (stem.length >= 3 && cc.includes(stem) && (lang === "en" || w.length <= 4)) return false;
  return true;
}

async function writeClues(words: string[], lang: string, plan: string): Promise<Record<string, string>> {
  const language = LANG_NAME[lang] ?? "English";
  const system = `You write arrowword (crossword-in-the-grid) clues for children aged 7 to 12, in ${language}.
For each word give exactly ONE clue of 1 to 4 words, like a newspaper arrowword: a short definition, a synonym, or a "what / where / who" phrase. Plain, concrete, child-friendly.
Never use the word itself, its root, or any form of it in the clue. No vowel points (niqqud). No trailing period.
Answer with JSON only: {"clues": {"<word exactly as given>": "<clue>", ...}}.`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(40000),
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: TEXT_MODEL_FAST,
      temperature: 0.3,
      max_completion_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: `Words:\n${words.join("\n")}` }],
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  const data = await res.json();
  const u = usageFrom(data);
  void logAiUsage({ feature: "arrow_clues", model: TEXT_MODEL_FAST, tokensIn: u.tokensIn, tokensOut: u.tokensOut, plan });
  let parsed: { clues?: Record<string, unknown> } = {};
  try { parsed = JSON.parse(String(data.choices?.[0]?.message?.content ?? "{}")); } catch { /* no clues */ }
  const out: Record<string, string> = {};
  const byNorm = new Map(words.map((w) => [norm(w), w]));
  for (const [k, v] of Object.entries(parsed.clues ?? {})) {
    const w = byNorm.get(norm(k));
    if (!w || typeof v !== "string") continue;
    const clue = v.replace(/\s+/g, " ").replace(/[.。]$/, "").trim();
    if (valid(w, clue, lang)) out[w] = clue;
  }
  return out;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null;
  const user = await verifyUserAndGetPlan(idToken);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (user.plan === "basic" || user.plan === "clear") return NextResponse.json({ error: "plan_required" }, { status: 403 });

  let body: { words?: unknown; lang?: unknown } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_body" }, { status: 400 }); }
  const lang = body.lang === "he" ? "he" : "en";
  const words = Array.isArray(body.words)
    ? [...new Set(body.words.filter((w): w is string => typeof w === "string").map((w) => w.trim()).filter((w) => w && w.length <= 30))].slice(0, MAX_WORDS)
    : [];
  if (!words.length) return NextResponse.json({ clues: {} });

  const db = getAdminDb();
  const refs = words.map((w) => db.collection("arrowClues").doc(keyOf(lang, w)));
  const snaps = await db.getAll(...refs);
  const clues: Record<string, string> = {};
  const missing: string[] = [];
  snaps.forEach((s, i) => { const c = s.get("clue"); if (typeof c === "string" && c) clues[words[i]] = c; else missing.push(words[i]); });

  // Stored clues always come back; writing new ones has a daily ceiling per
  // profile, far above real play.
  if (missing.length && process.env.OPENAI_API_KEY && (await limitBump("arrowclues", user.userId, 86400)) <= 300) {
    try {
      const fresh = await writeClues(missing, lang, user.plan);
      const batch = db.batch();
      for (const [w, clue] of Object.entries(fresh)) {
        clues[w] = clue;
        batch.set(db.collection("arrowClues").doc(keyOf(lang, w)), { word: w, lang, clue, createdAt: new Date().toISOString() });
      }
      await batch.commit();
    } catch (e) {
      console.warn("[arrow-clues] generation failed:", e instanceof Error ? e.message : e);
    }
  }
  return NextResponse.json({ clues });
}
