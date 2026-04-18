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

const SYSTEM_PROMPT = `You are Gadit — a word explanation assistant. Your job is to explain words clearly and simply.

When given a word, detect its language and respond ENTIRELY in that same language.

Your response must follow this exact JSON structure:
{
  "word": "the word",
  "language": "detected language in English",
  "definition": "simple, clear definition — no academic language",
  "examples": ["example 1", "example 2", "example 3"],
  "etymology": "brief, simple origin story",
  "forKids": "super simple explanation a child would understand",
  "multiplemeanings": false
}

If the word has multiple meanings, set multiplemeanings to true and ask the user for context in the definition field.

Rules:
- Always respond in the SAME language as the input word
- Never use complex academic language
- Keep it human, warm, and simple
- Examples must be everyday real-life sentences`;

async function getCachedResult(word: string, language: string) {
  try {
    const key = `${language}_${word.toLowerCase().trim()}`;
    const ref = doc(getDb(), "cache", key);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
  } catch {}
  return null;
}

async function setCachedResult(word: string, language: string, data: object) {
  try {
    const key = `${language}_${word.toLowerCase().trim()}`;
    const ref = doc(getDb(), "cache", key);
    await setDoc(ref, { ...data, cachedAt: new Date().toISOString() });
  } catch {}
}

async function callGemini(word: string): Promise<object> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nWord: ${word}` }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );
  const data = await res.json();
  console.log("Gemini response:", JSON.stringify(data).slice(0, 500));
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text: " + JSON.stringify(data).slice(0, 200));
  return JSON.parse(text);
}

async function callOpenAI(word: string): Promise<object> {
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
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Word: ${word}` },
      ],
    }),
  });
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function POST(req: NextRequest) {
  try {
    const { word } = await req.json();
    if (!word?.trim()) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    const cached = await getCachedResult(word, "auto");
    if (cached) return NextResponse.json({ ...cached, fromCache: true });

    let result: object;
    try {
      result = await callGemini(word);
    } catch {
      result = await callOpenAI(word);
    }

    await setCachedResult(word, "auto", result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Define error:", err);
    return NextResponse.json({ error: "Failed to define word", details: String(err) }, { status: 500 });
  }
}
