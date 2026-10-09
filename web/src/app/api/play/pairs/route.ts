/**
 * POST /api/play/pairs  { uiLang, items: [{ word, language }] }
 *   → { pairs: { [word]: { pair, pairLang } } }
 *
 * The word in the other language, for the "word cards" game (Gadi
 * 2026-10-09: see a word, say it in English or another language, flip to
 * check). Cheapest source first:
 *   1. A foreign word (not in the UI language) already carries its
 *      UI-language equivalent in the define cache (`result.translation`,
 *      e.g. weather → מזג אוויר). Free.
 *   2. Our own `wordPairs` cache from an earlier call. Free.
 *   3. Otherwise one small gpt-4o-mini call for all the missing words at
 *      once, stored in `wordPairs` so each word is paid for once, ever.
 * A word in the UI language pairs with English; with an English UI the
 * English words have no pair and are skipped by the game.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom } from "@/lib/ai-cost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 25;

const LANG_NAME: Record<string, string> = {
  he: "Hebrew", en: "English", ar: "Arabic", ru: "Russian", es: "Spanish", pt: "Portuguese", fr: "French",
  de: "German", cs: "Czech", sk: "Slovak", it: "Italian", ja: "Japanese", hi: "Hindi", am: "Amharic",
  uk: "Ukrainian", tr: "Turkish", pl: "Polish", fa: "Persian", id: "Indonesian", nl: "Dutch", el: "Greek",
  zu: "Zulu", vi: "Vietnamese", fil: "Filipino", af: "Afrikaans", sw: "Swahili", "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese", ko: "Korean", th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian",
};
const MAX_ITEMS = 20;

type Pair = { pair: string; pairLang: string; wordLang: string };

/** The letters of each UI language that has its own script. A notebook
 *  entry's `language` is not always the English name ("עברית" showed up),
 *  so the letters decide: a word written in the UI language's script IS in
 *  the UI language. Without this, Hebrew words were "translated" to Hebrew
 *  and the card showed the same word on both sides (Gadi 2026-10-09). */
const range = (a: number, b: number) => new RegExp(`[${String.fromCharCode(a)}-${String.fromCharCode(b)}]`);
const SCRIPT: Record<string, RegExp> = {
  he: range(0x05d0, 0x05ea), ar: range(0x0620, 0x064a), fa: range(0x0620, 0x06cc),
  ru: range(0x0400, 0x04ff), uk: range(0x0400, 0x04ff), el: range(0x0370, 0x03ff),
  hi: range(0x0900, 0x097f), bn: range(0x0980, 0x09ff), am: range(0x1200, 0x137f),
  th: range(0x0e00, 0x0e7f), ko: range(0xac00, 0xd7af), ja: range(0x3040, 0x30ff),
  "zh-CN": range(0x4e00, 0x9fff), "zh-TW": range(0x4e00, 0x9fff),
};
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const keyOf = (ui: string, w: string) => `${ui}_${w.trim().toLowerCase()}`.slice(0, 300).replace(/\//g, "_");

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : null;
  const user = await verifyUserAndGetPlan(idToken);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });

  let uiLang = "he";
  let items: Array<{ word: string; language: string }> = [];
  try {
    const b = (await req.json()) as { uiLang?: unknown; items?: unknown };
    if (typeof b.uiLang === "string" && LANG_NAME[b.uiLang]) uiLang = b.uiLang;
    if (Array.isArray(b.items)) {
      items = b.items
        .map((x) => (x ?? {}) as { word?: unknown; language?: unknown })
        .filter((x) => typeof x.word === "string" && x.word.trim())
        .map((x) => ({ word: String(x.word).trim().slice(0, 80), language: typeof x.language === "string" ? x.language : "" }))
        .slice(0, MAX_ITEMS);
    }
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const uiName = LANG_NAME[uiLang];
  const db = getAdminDb();
  const pairs: Record<string, Pair> = {};

  // 1 + 2: free sources.
  const need: Array<{ word: string; target: string; wordLang: string }> = [];
  await Promise.all(items.map(async ({ word, language }) => {
    const script = SCRIPT[uiLang];
    const foreign = script ? !script.test(word) : !!language && language !== uiName;
    const target = foreign ? uiName : uiLang === "en" ? "" : "English";
    const wordLang = foreign ? (language && language !== uiName ? language : "English") : uiName;
    if (!target) return;
    const w = word.toLowerCase();
    if (foreign) {
      const docs = await db.getAll(
        db.collection("cache").doc(`auto2_${uiLang}_kids_${w}`),
        db.collection("cache").doc(`auto2_${uiLang}_base_${w}`),
      );
      for (const d of docs) {
        const tr = d.exists ? ((d.data()?.result ?? d.data()) as { translation?: unknown }).translation : null;
        if (typeof tr === "string" && tr.trim() && !same(tr, word)) { pairs[word] = { pair: tr.trim(), pairLang: target, wordLang }; return; }
      }
    }
    const own = await db.collection("wordPairs").doc(keyOf(uiLang, word)).get();
    const p = own.exists ? (own.data() as { pair?: string; pairLang?: string }) : null;
    if (p?.pair && p.pairLang === target && !same(p.pair, word)) { pairs[word] = { pair: p.pair, pairLang: target, wordLang }; return; }
    need.push({ word, target, wordLang });
  }));

  // 3: one small call for whatever is still missing.
  if (need.length && process.env.OPENAI_API_KEY) {
    try {
      const list = need.map((n, i) => `${i + 1}. ${n.word} -> ${n.target}`).join("\n");
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          max_tokens: 600,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "For each numbered word, give its most common everyday equivalent in the target language named after the arrow: 1 to 3 words, no explanation, no quotes, child-safe. Reply as JSON mapping each number to the equivalent, e.g. {\"1\":\"weather\"}." },
            { role: "user", content: list },
          ],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const u = usageFrom(json);
        void logAiUsage({ feature: "play_pairs", model: "gpt-4o-mini", tokensIn: u.tokensIn, tokensOut: u.tokensOut, plan: user.plan });
        let map: Record<string, unknown> = {};
        try { map = JSON.parse(json.choices?.[0]?.message?.content ?? "{}"); } catch { /* ignore */ }
        await Promise.all(need.map(async (n, i) => {
          const v = map[String(i + 1)];
          if (typeof v !== "string" || !v.trim() || v.length > 60 || same(v, n.word)) return;
          const pair = v.trim();
          pairs[n.word] = { pair, pairLang: n.target, wordLang: n.wordLang };
          try { await db.collection("wordPairs").doc(keyOf(uiLang, n.word)).set({ word: n.word, uiLang, pair, pairLang: n.target, at: new Date().toISOString() }); } catch { /* ignore */ }
        }));
      }
    } catch (e) {
      console.error("[play/pairs]", e);
    }
  }

  return NextResponse.json({ pairs });
}
