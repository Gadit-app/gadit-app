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

const SYSTEM_PROMPT = `You are Gadit — a word understanding engine. Your job is not to give definitions. Your job is to guide the user into genuinely understanding a word.

When given a word, detect its language and respond ENTIRELY in that same language.

Your response must follow this exact JSON structure:
{
  "word": "the word as given",
  "language": "detected language name in English (e.g. Hebrew, Arabic, English, Russian)",
  "multiplemeanings": true or false,
  "meanings": [
    {
      "meaning": "clear, simple explanation of this meaning — no academic language, no dictionary tone",
      "partOfSpeech": "noun / verb / adjective / adverb / etc.",
      "domain": "general / finance / nature / emotion / etc. (optional label)"
    }
  ],
  "examples": [
    "natural everyday sentence using the word",
    "another natural sentence — different context",
    "a third sentence that shows a different nuance"
  ],
  "etymology": "The TRUE linguistic origin: which ancient or source language this word came from (Greek, Latin, Arabic, Akkadian, Hebrew root, etc.), the original root/word, and what it originally meant. Be specific and interesting. Example: 'ephemeral' comes from Greek 'ephḗmeros' — epi (on) + hēmera (day), meaning 'lasting only a day'. If the word is Hebrew — trace it to its Hebrew root (shoresh) and explain the root meaning. If Arabic — trace to the Arabic root. Always connect origin to current meaning.",
  "opposite": "the most natural opposite word or phrase in the same language (single word or short phrase)",
  "confusable": "one word people often confuse this with — explain the difference in one clear sentence",
  "register": "formal / informal / slang / literary / technical / neutral",
  "frequency": "very common / common / uncommon / rare",
  "wordFamily": ["related form 1", "related form 2", "related form 3"]
}

IMPORTANT RULES:
- meanings[] must have AT LEAST 1 item. If multiple meanings exist, include all of them (up to 5).
- Set multiplemeanings: true if there are 2 or more genuinely distinct meanings.
- examples[] must have EXACTLY 3 items — always. Real sentences, not definitions in disguise.
- etymology must always be filled. Never leave it empty or say "unknown". Give the best available origin.
- Respond ENTIRELY in the input word's language — including meaning, examples, etymology.
- Keep it human, warm, clear. No academic tone. No dictionary phrasing.
- examples must feel like real life — things a person would actually say or read.`;

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
      "meaning": "the specific meaning used in the given sentence — clear and simple",
      "partOfSpeech": "noun / verb / adjective / etc.",
      "domain": "optional domain label"
    }
  ],
  "examples": [
    "the user's original sentence",
    "another natural sentence with the same meaning",
    "a third sentence showing the same usage"
  ],
  "etymology": "brief origin of the word — source language, root, original meaning",
  "opposite": "natural opposite in the same language",
  "confusable": "word people confuse this with and why they differ (1 sentence)",
  "register": "formal / informal / slang / literary / technical / neutral",
  "frequency": "very common / common / uncommon / rare",
  "wordFamily": ["related form 1", "related form 2", "related form 3"],
  "contextNote": "brief explanation of why this specific meaning fits the given sentence"
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
