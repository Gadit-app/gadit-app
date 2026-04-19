import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

function getDb() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return getFirestore(app);
}

const SYSTEM_PROMPT = `You are Gadit — a word understanding engine. Your job is to guide the user into genuinely understanding a word — not just define it.

When given a word, detect its language and respond ENTIRELY in that same language.

Your response must follow this exact JSON structure:
{
  "word": "the word as given",
  "language": "detected language name in English (e.g. Hebrew, Arabic, English, Russian)",
  "multiplemeanings": true or false,
  "meanings": [
    {
      "meaning": "clear, simple explanation of this specific meaning — human language, no dictionary tone",
      "examples": [
        "natural everyday sentence for THIS specific meaning",
        "another sentence for THIS meaning — different context",
        "a third sentence showing THIS meaning in use"
      ]
    }
  ],
  "etymology": "The TRUE historical origin of this word — NOT its root structure, but its actual historical journey: which ancient language it came from (Greek, Latin, Arabic, Akkadian, Old French, Proto-Semitic, etc.), the original word in that language, and what it originally meant. How did it travel into today's language? Example: 'ephemeral' comes from Greek ephḗmeros (epi=on + hēmera=day), meaning 'lasting only one day'. For Hebrew words: did it come from Biblical Hebrew, Aramaic, Arabic, Akkadian, Greek, or another language? Give the oldest traceable origin and the story of how it arrived. NEVER describe the modern root structure — always give the historical/cross-language origin. NEVER say 'unknown' — always give the best available etymology."
}

CRITICAL RULES:
- meanings[] MUST include ALL distinct meanings of the word — do not limit to 2 or 3 if more exist. Think carefully: a word like 'קרן' has 6+ meanings (horn, ray of light, fund/capital, corner, unicorn horn, musical instrument). A word like 'set' has 10+. List EVERY genuinely distinct meaning.
- Set multiplemeanings: true if there are 2 or more distinct meanings.
- Each meaning MUST have its own examples array with EXACTLY 3 sentences — specific to that meaning only.
- etymology MUST always describe historical/cross-language origin. Never describe modern root structure. Never leave empty.
- Do NOT include partOfSpeech, domain, register, frequency, or wordFamily fields — they are not needed.
- Respond ENTIRELY in the input word's language.
- Keep language human, warm, clear. No academic tone. No dictionary phrasing.
- Examples must feel like real life — sentences a person would actually say or read.`;

const CONTEXT_PROMPT = `You are Gadit. A user wants to understand a specific word as used in their sentence.

Given:
- word: the word to explain
- sentence: the full sentence providing context

Your job: identify which meaning of the word is being used in this sentence, and explain ONLY that meaning.

Respond ENTIRELY in the same language as the input word.

Return this exact JSON:
{
  "word": "the word",
  "language": "detected language in English",
  "multiplemeanings": false,
  "meanings": [
    {
      "meaning": "the specific meaning used in the given sentence — clear and simple, no dictionary tone",
      "examples": [
        "the user's original sentence (slightly cleaned if needed)",
        "another natural sentence with this same meaning",
        "a third sentence showing this meaning in a different context"
      ]
    }
  ],
  "etymology": "The TRUE historical origin of this word: source language, original word/root, original meaning. Be specific.",
  "contextNote": "One clear sentence explaining why this specific meaning fits the user's sentence"
}`;

async function getCachedResult(key: string) {
  try {
    const ref = doc(getDb(), "cache", key);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
  } catch {}
  return null;
}

async function setCachedResult(key: string, data: object) {
  try {
    const ref = doc(getDb(), "cache", key);
    await setDoc(ref, { ...data, cachedAt: new Date().toISOString() });
  } catch {}
}

async function callGemini(prompt: string): Promise<object> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text: " + JSON.stringify(data).slice(0, 200));
  return JSON.parse(text);
}

async function callOpenAI(systemPrompt: string, userContent: string): Promise<object> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function POST(req: NextRequest) {
  try {
    const { word, contextSentence } = await req.json();
    if (!word?.trim()) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    const cacheKey = contextSentence
      ? `ctx_${word.toLowerCase().trim()}_${contextSentence.toLowerCase().trim().slice(0, 60)}`
      : `auto_${word.toLowerCase().trim()}`;

    const cached = await getCachedResult(cacheKey);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });

    let result: object;
    if (contextSentence) {
      const userContent = `Word: ${word}\nSentence: ${contextSentence}`;
      try {
        result = await callGemini(`${CONTEXT_PROMPT}\n\n${userContent}`);
      } catch {
        result = await callOpenAI(CONTEXT_PROMPT, userContent);
      }
    } else {
      try {
        result = await callGemini(`${SYSTEM_PROMPT}\n\nWord: ${word}`);
      } catch {
        result = await callOpenAI(SYSTEM_PROMPT, `Word: ${word}`);
      }
    }

    await setCachedResult(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Define error:", err);
    return NextResponse.json({ error: "Failed to define word", details: String(err) }, { status: 500 });
  }
}
