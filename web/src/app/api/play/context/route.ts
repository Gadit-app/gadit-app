/**
 * POST /api/play/context  { words: string[], lang, ui, kids }
 *   → { rounds: [{ segments, answers, base, options, why }] }
 *
 * Context Detective (2026-11-01): 3 short stories in the words' language,
 * each with 2 (kids) or 3 blanks that the child's own practice words fill,
 * plus 2 distractors per story and a one-line "why" per blank in the UI
 * language. One gpt call writes 4 or 5 stories with 4 distractors each, then
 * each story is solved blind (without the answers) by its own call, which also
 * writes the "why" lines; only the stories solved exactly are played, with the
 * distractors the check found wrong (lib/context-game.ts, 2026-11-09). The result is cached in
 * `contextGameCache` by (lang, ui, kids, sorted words) so the same set is
 * never paid for twice.
 *
 * With { stream: true } (2026-11-12, Gadi: the child waited about 20 s before
 * the game started) a new set comes back as lines of JSON, one story per line
 * the moment it passes its check, so the game starts on the first story while
 * the others are still being written:
 *   {"round":{...}} ... then {"done":true} or {"error":"generation_failed"}
 * Same model, same prompts, same number of calls. A cached set, and a caller
 * that does not ask for a stream, get the one JSON answer as before.
 */
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom, TEXT_MODEL_FAST } from "@/lib/ai-cost";
import { hardCapReached } from "@/lib/ai-budget";
import {
  CONTEXT_ROUNDS, applyContextCheck, contextCheckMessages, contextMessages, contextStoryScanner, parseContextRounds, type ContextRound,
} from "@/lib/context-game";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Writing + the blind check take 15 to 35 s; a retry and a slow call fit in 120.
export const maxDuration = 120;

const MAX_WORDS = 9;
const CODE = /^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$/;

function cacheKey(lang: string, ui: string, kids: boolean, words: string[]): string {
  const sorted = words.map((w) => w.normalize("NFC").toLowerCase()).sort();
  // v2 (2026-11-09): stories now pass the blind check; v1 sets were never checked.
  return crypto.createHash("sha256").update(`v2|${lang}|${ui}|${kids ? 1 : 0}|${sorted.join("|")}`).digest("hex").slice(0, 40);
}

async function chat(messages: { role: string; content: string }[], temperature: number, feature: string, plan: string, timeoutMs: number): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: TEXT_MODEL_FAST,
      temperature,
      max_completion_tokens: 3000,
      response_format: { type: "json_object" },
      messages,
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  const data = await res.json();
  const u = usageFrom(data);
  void logAiUsage({ feature, model: TEXT_MODEL_FAST, tokensIn: u.tokensIn, tokensOut: u.tokensOut, plan });
  return String(data.choices?.[0]?.message?.content ?? "");
}

/** The writer refused to stream (not a timeout): the one-answer call still works. */
class StreamRefused extends Error {}

/** The writer call, streamed: `onText` gets the answer piece by piece. */
async function writeStream(messages: { role: string; content: string }[], plan: string, timeoutMs: number, onText: (piece: string) => void): Promise<void> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: TEXT_MODEL_FAST,
      temperature: 0.5,
      max_completion_tokens: 3000,
      response_format: { type: "json_object" },
      messages,
      stream: true,
      // The last piece carries the token counts for the cost log.
      stream_options: { include_usage: true },
    }),
  });
  if (!res.ok || !res.body) throw new StreamRefused(`openai ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let usage: unknown = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const j = JSON.parse(payload) as { choices?: { delta?: { content?: unknown } }[]; usage?: unknown };
        const piece = j.choices?.[0]?.delta?.content;
        if (typeof piece === "string" && piece) onText(piece);
        if (j.usage) usage = j;
      } catch { /* a broken line is skipped */ }
    }
  }
  if (usage) {
    const u = usageFrom(usage);
    void logAiUsage({ feature: "context_game", model: TEXT_MODEL_FAST, tokensIn: u.tokensIn, tokensOut: u.tokensOut, plan });
  }
}

/** Write the stories and solve each one blind, keep the ones solved exactly.
 *  Each story goes to its check the moment the writer finishes it, and
 *  `onRound` hears of each one that passes, so the child waits for the first
 *  story only, not for all five. */
async function writeChecked(words: string[], lang: string, ui: string, kids: boolean, plan: string, onRound: (r: ContextRound) => void, room: () => number): Promise<void> {
  const checks: Promise<void>[] = [];
  const check = (r: ContextRound) => {
    // Enough stories already passed: a spare is not worth its check.
    if (room() <= 0) return;
    checks.push(
      // A check that hangs drops only its own story.
      chat(contextCheckMessages([r], lang, ui, kids), 0, "context_game_check", plan, 25_000)
        .then((c) => applyContextCheck([r], c))
        .catch(() => [] as ContextRound[])
        .then((ok) => { for (const x of ok) if (room() > 0) onRound(x); }),
    );
  };
  try {
    const scan = contextStoryScanner(words, lang);
    try {
      await writeStream(contextMessages(words, lang, kids), plan, 45_000, (piece) => scan.push(piece).forEach(check));
    } catch (e) {
      if (!(e instanceof StreamRefused)) throw e;
      parseContextRounds(await chat(contextMessages(words, lang, kids), 0.5, "context_game", plan, 45_000), words, lang).forEach(check);
    }
  } finally {
    // Also when the writer broke off in the middle: the stories it finished still count.
    await Promise.all(checks);
  }
}

/** A whole set: up to CONTEXT_ROUNDS checked stories, kept in the cache. */
async function makeSet(words: string[], lang: string, ui: string, kids: boolean, plan: string, ref: FirebaseFirestore.DocumentReference, onRound?: (r: ContextRound) => void): Promise<ContextRound[]> {
  const rounds: ContextRound[] = [];
  const add = (r: ContextRound) => { rounds.push(r); onRound?.(r); };
  const room = () => CONTEXT_ROUNDS - rounds.length;
  try {
    const t0 = Date.now();
    await writeChecked(words, lang, ui, kids, plan, add, room);
    // Too few passed: one more batch, so the child still gets a full game
    // (only when there is time left before the 120 s limit).
    if (rounds.length < 2 && Date.now() - t0 < 40_000) await writeChecked(words, lang, ui, kids, plan, add, room);
  } catch { /* what passed so far still plays */ }
  // A short set (1 story) still plays, but is not kept: the next try may do better.
  if (rounds.length >= 2) {
    try {
      await ref.set({ rounds, lang, ui, kids, words, at: new Date().toISOString() });
    } catch { /* the game still plays */ }
  }
  return rounds;
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
  let stream = false;
  try {
    const b = (await req.json()) as { words?: unknown; lang?: unknown; ui?: unknown; kids?: unknown; stream?: unknown };
    stream = b.stream === true;
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

  if (stream) {
    const enc = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        // The child may leave in the middle: the set is still finished and cached.
        let open = true;
        const send = (o: unknown) => {
          if (!open) return;
          try { controller.enqueue(enc.encode(JSON.stringify(o) + "\n")); } catch { open = false; }
        };
        const rounds = await makeSet(words, lang, ui, kids, user.plan, ref, (round) => send({ round })).catch(() => [] as ContextRound[]);
        send(rounds.length ? { done: true } : { error: "generation_failed" });
        if (open) { try { controller.close(); } catch { /* already closed */ } }
      },
    });
    return new Response(body, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  }

  const rounds = await makeSet(words, lang, ui, kids, user.plan, ref);
  if (rounds.length < 1) return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  return NextResponse.json({ rounds });
}
