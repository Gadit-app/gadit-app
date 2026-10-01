/**
 * POST /api/niqqud  — body { texts: string[] } → { niqqud: string[] }
 *
 * Adds vowel points to text so young readers (grades 1-2) can read a word's
 * meaning and examples. Hebrew uses Dicta's Nakdan (purpose-built, far more
 * accurate than an LLM at vocalization); Arabic uses the LLM tashkeel path
 * below (Arabic has no Dicta equivalent). Results are deterministic per string
 * so they are cached in Firestore (Hebrew and Arabic keyed separately). Text
 * that is neither Hebrew nor Arabic is returned unchanged. If the service is
 * unreachable the original text is returned so the UI degrades to plain
 * (un-vowelized) text rather than breaking. Gadi 2026-08-22, Arabic 2026-08-30.
 *
 * Auth: any signed-in user (a light gate so the Dicta proxy isn't public).
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom } from "@/lib/ai-cost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 25;

const DICTA_URL = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
const HEBREW = /[֐-׿]/;
const ARABIC = /[؀-ۿ]/;

function hashKey(text: string, prefix = "v1:"): string {
  return crypto.createHash("sha256").update(prefix + text).digest("hex").slice(0, 40);
}

/** Add full diacritics (tashkeel/harakat) to Arabic text via the LLM. Arabic
 *  has no Dicta equivalent; gpt-4o at temperature 0 vocalizes short definition
 *  and example text well, and every result is cached forever per string.
 *  Returns only the diacritized text; on any failure the caller falls back to
 *  plain (un-vocalized) Arabic so the UI never breaks. Gadi 2026-08-30. */
async function tashkeel(text: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0,
      messages: [
        { role: "system", content: "You add full Arabic diacritics (tashkeel/harakat) to text. Return ONLY the fully vocalized Arabic, with the exact same words, order, punctuation and spacing. Do not translate, explain, or change any wording. Leave any non-Arabic characters untouched." },
        { role: "user", content: text },
      ],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const u = usageFrom(json);
  void logAiUsage({ feature: "tashkeel_arabic", model: "gpt-4o", tokensIn: u.tokensIn, tokensOut: u.tokensOut });
  const out = json.choices?.[0]?.message?.content?.trim();
  return out || text;
}

const HOLAM = /[ֹֺ]/;
const KUBUTZ = /ֻ/;
const I_OR_E = /[ִֵֶ]/;

/** Dicta vocalizes in ktiv haser, dropping the vav/yod that ktiv male uses as
 *  vowel letters (תקשורת → תִּקְשֹׁרֶת, קיבלתי → קִבַּלְתִּי). Put those letters back
 *  on top of Dicta's points so the word keeps the spelling the reader saw:
 *  holam + ו → וֹ, kubutz + ו → וּ, a yod after an i/e vowel stays a bare yod,
 *  and a doubled consonantal vav/yod (האוויר) gets its second letter back.
 *  Any other difference means Dicta read a different word (נגיף → נִגָּף), so
 *  this returns null and the caller keeps the plain letters. Gadi 2026-10-01. */
function restoreMaleSpelling(orig: string, voc: string): string | null {
  const O = [...orig.normalize("NFC").replace(/\p{M}/gu, "")];
  const V = voc.normalize("NFD").match(/\P{M}\p{M}*/gu) ?? [];
  const out: string[] = [];
  let i = 0, j = 0;
  while (i < O.length) {
    const c = O[i];
    const v = V[j];
    if (v && v[0] === c) {
      if ((c === "ו" || c === "י") && O[i + 1] === c && V[j + 1]?.[0] !== c) { out.push(c); i++; continue; }
      out.push(v); i++; j++; continue;
    }
    const prev = out[out.length - 1] ?? "";
    if (c === "ו" && HOLAM.test(prev)) { out[out.length - 1] = prev.replace(HOLAM, ""); out.push("וֹ"); i++; continue; }
    if (c === "ו" && KUBUTZ.test(prev)) { out[out.length - 1] = prev.replace(KUBUTZ, ""); out.push("וּ"); i++; continue; }
    if (c === "י" && I_OR_E.test(prev)) { out.push("י"); i++; continue; }
    return null;
  }
  if (j !== V.length) return null;
  return out.join("").normalize("NFC");
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
  // Consonants only (drop niqqud/cantillation + the '|' prefix marker), so we can
  // check that vocalization never CHANGED a word's letters — only added points.
  const consonants = (s: string) => s.replace(/\|/g, "").normalize("NFD").replace(/\p{M}/gu, "");
  let out = "";
  for (const t of toks) {
    if (t.nakdan) {
      const orig = (t.nakdan.word ?? "").replace(/\|/g, "");
      const voc = (t.nakdan.options?.[0]?.w ?? t.nakdan.word ?? "").replace(/\|/g, "");
      // Only accept the vocalized form when it keeps the exact same letters as
      // the input. Dicta can re-spell ktiv male/haser or pick a different word
      // form (e.g. נגיף → נִגָּף), which would make Gadit show a word that is not
      // what was written. In that case keep the original letters (Gadi 2026-09-19),
      // unless the only difference is dropped ktiv-male vowel letters.
      out += consonants(voc) === consonants(orig) ? voc : restoreMaleSpelling(orig, voc) ?? orig;
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
      if (!trimmed) return text;
      const isHeb = HEBREW.test(trimmed);
      const isAr = !isHeb && ARABIC.test(trimmed);
      if (!isHeb && !isAr) return text; // nothing to vowelize
      const ref = db.collection("niqqudCache").doc(hashKey(trimmed, isAr ? "ar1:" : "v2:")); // v2: ktiv-male restore
      try {
        const snap = await ref.get();
        if (snap.exists) return (snap.data() as { niqqud?: string }).niqqud ?? text;
      } catch { /* cache read best-effort */ }
      try {
        const voweled = isAr ? await tashkeel(trimmed) : await vowelize(trimmed);
        try { await ref.set({ text: trimmed, niqqud: voweled, at: new Date().toISOString() }); } catch { /* ignore */ }
        // Preserve any surrounding whitespace the caller sent.
        return text.replace(trimmed, voweled);
      } catch {
        return text; // service down → plain text, no break
      }
    }),
  );

  return NextResponse.json({ niqqud });
}
