/**
 * POST /api/play/context  { words: string[], lang, ui, kids }
 *   → { rounds: [{ segments, answers, base, options, why }] }
 *
 * Context Detective (2026-11-01): 3 short stories in the words' language,
 * each with 2 (kids) or 3 blanks that the child's own practice words fill,
 * plus 2 distractors per story and a one-line "why" per blank in the UI
 * language. One gpt call writes all 3 stories; the result is cached in
 * `contextGameCache` by (lang, ui, kids, sorted words) so the same set is
 * never paid for twice. Broken stories are dropped (lib/context-game.ts).
 */
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom, TEXT_MODEL_FAST } from "@/lib/ai-cost";
import { hardCapReached } from "@/lib/ai-budget";
import { contextMessages, parseContextRounds, type ContextRound } from "@/lib/context-game";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_WORDS = 9;
const CODE = /^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$/;

function cacheKey(lang: string, ui: string, kids: boolean, words: string[]): string {
  const sorted = words.map((w) => w.normalize("NFC").toLowerCase()).sort();
  return crypto.createHash("sha256").update(`v1|${lang}|${ui}|${kids ? 1 : 0}|${sorted.join("|")}`).digest("hex").slice(0, 40);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null;
  const user = await verifyUserAndGetPlan(idToken);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  // The games are a Deep feature (the /play page sends the rest to /pricing).
  if (user.plan === "basic" || user.plan === "clear") return NextResponse.json({ error: "plan_required" }, { status: 403 });

  const words: string[] = [];
  let lang = "en";
  let ui = "en";
  let kids = false;
  try {
    const b = (await req.json()) as { words?: unknown; lang?: unknown; ui?: unknown; kids?: unknown };
    if (typeof b.lang === "string" && CODE.test(b.lang)) lang = b.lang;
    if (typeof b.ui === "string" && CODE.test(b.ui)) ui = b.ui;
    kids = b.kids === true;
    if (Array.isArray(b.words)) {
      const seen = new Set<string>();
      for (const x of b.words) {
        if (typeof x !== "string") continue;
        const w = x.replace(/\s+/g, " ").trim().slice(0, 60);
        const k = w.toLowerCase();
        if (!w || seen.has(k)) continue;
        seen.add(k);
        words.push(w);
        if (words.length >= MAX_WORDS) break;
      }
    }
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (words.length < 2) return NextResponse.json({ error: "too_few_words" }, { status: 400 });

  const db = getAdminDb();
  const ref = db.collection("contextGameCache").doc(cacheKey(lang, ui, kids, words));
  try {
    const snap = await ref.get();
    const hit = snap.exists ? (snap.data()?.rounds as ContextRound[] | undefined) : undefined;
    if (Array.isArray(hit) && hit.length) return NextResponse.json({ rounds: hit, cached: true });
  } catch { /* cache read is best-effort */ }

  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  if (await hardCapReached()) return NextResponse.json({ error: "busy" }, { status: 503 });

  let rounds: ContextRound[] = [];
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: TEXT_MODEL_FAST,
        temperature: 0.7,
        max_completion_tokens: 3000,
        response_format: { type: "json_object" },
        messages: contextMessages(words, lang, ui, kids),
      }),
    });
    if (!res.ok) return NextResponse.json({ error: "generation_failed" }, { status: 502 });
    const data = await res.json();
    const u = usageFrom(data);
    void logAiUsage({ feature: "context_game", model: TEXT_MODEL_FAST, tokensIn: u.tokensIn, tokensOut: u.tokensOut, plan: user.plan });
    rounds = parseContextRounds(String(data.choices?.[0]?.message?.content ?? ""), words, lang);
  } catch {
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
  if (rounds.length < 1) return NextResponse.json({ error: "generation_failed" }, { status: 502 });

  try {
    await ref.set({ rounds, lang, ui, kids, words, at: new Date().toISOString() });
  } catch { /* the game still plays */ }
  return NextResponse.json({ rounds });
}
