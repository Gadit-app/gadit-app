import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom, TEXT_MODEL_FAST } from "@/lib/ai-cost";
import { uiLangName } from "@/lib/word-examples";

/**
 * "More example sentences" under a meaning (Gadi 2026-10-24): three NEW
 * examples for THIS meaning, in the same language as the examples already
 * shown. Paying plans only. Each (lang, kids, word, meaning, round) is
 * cached in Firestore moreExamples/<key>, so a second reader of the same
 * word gets them free.
 *
 * POST { word, meaning, examples: string[] (already on screen), uiLang, kids?, round }
 *   -> { examples: string[] }
 */

export const maxDuration = 30;

const MAX_ROUNDS = 2;

export async function POST(req: NextRequest) {
  let body: { word?: string; meaning?: string; examples?: unknown; uiLang?: string; kids?: boolean; round?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }
  const word = String(body.word ?? "").trim().slice(0, 80);
  const meaning = String(body.meaning ?? "").trim().slice(0, 600);
  const shown = (Array.isArray(body.examples) ? body.examples : []).map((s) => String(s ?? "").trim()).filter(Boolean).slice(0, 12);
  const uiLang = String(body.uiLang ?? "en");
  const kids = body.kids === true;
  const round = Math.max(1, Math.min(MAX_ROUNDS, Number(body.round) || 1));
  if (!word || !meaning) return NextResponse.json({ error: "word_and_meaning_required" }, { status: 400 });

  const authHeader = req.headers.get("Authorization") || "";
  const user = await verifyUserAndGetPlan(authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (user.plan !== "clear" && user.plan !== "deep") return NextResponse.json({ error: "upgrade_required" }, { status: 402 });

  const key = crypto.createHash("sha256").update(`mx1|${uiLang}|${kids ? "k" : "a"}|${word.toLowerCase()}|${meaning}|${round}`).digest("hex").slice(0, 40);
  const ref = getAdminDb().collection("moreExamples").doc(key);
  try {
    const snap = await ref.get();
    const cached = snap.exists ? (snap.get("examples") as string[] | undefined) : undefined;
    if (cached?.length) return NextResponse.json({ examples: cached });
  } catch { /* cache read best-effort */ }

  const sys = `You write example sentences for a dictionary. Write exactly 3 NEW example sentences that use the word "${word}" in THIS meaning only: ${meaning}
Rules:
- Write them in the SAME language as the examples already shown below (that is the language of the word). If none are shown, write in ${uiLangName(uiLang)}.
- Each sentence makes the meaning clear from its context, is natural and everyday, and is different in situation and wording from the ones shown.${kids ? "\n- For a child about 8 years old: very simple everyday words, short sentences." : "\n- One short sentence each, 8 to 16 words."}
- Never use the characters "–" or "—".
Return STRICT JSON: {"examples":["...","...","..."]}`;
  const userMsg = `Examples already shown:\n${shown.map((s) => `- ${s}`).join("\n") || "(none)"}`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: TEXT_MODEL_FAST,
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_completion_tokens: 400,
        messages: [{ role: "system", content: sys }, { role: "user", content: userMsg }],
      }),
    });
    if (!res.ok) return NextResponse.json({ error: "generation_failed" }, { status: 502 });
    const data = await res.json();
    const u = usageFrom(data);
    void logAiUsage({ feature: "more_examples", model: TEXT_MODEL_FAST, tokensIn: u.tokensIn, tokensOut: u.tokensOut, plan: user.plan });
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as { examples?: unknown };
    const seen = new Set(shown.map((s) => s.toLowerCase()));
    const examples = (Array.isArray(parsed.examples) ? parsed.examples : [])
      .map((s) => String(s ?? "").replace(/[–—]/g, ",").trim())
      .filter((s) => s && !seen.has(s.toLowerCase()))
      .slice(0, 3);
    if (!examples.length) return NextResponse.json({ error: "generation_failed" }, { status: 502 });
    try { await ref.set({ word, meaning, uiLang, kids, round, examples, at: new Date().toISOString() }); } catch { /* best-effort */ }
    return NextResponse.json({ examples });
  } catch (e) {
    console.warn("[more-examples] failed:", e);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
