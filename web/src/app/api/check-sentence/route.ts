import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a language tutor. A user learned a word and now wrote a sentence using it.
Evaluate if they used the word correctly based on its definition.

Respond ONLY with valid JSON in this exact format:
{"status": "perfect" | "almost" | "not quite", "message": "brief feedback in the same language as the sentence"}

- "perfect": word is used correctly and naturally
- "almost": word is used in a way that makes sense but could be improved — include a better version
- "not quite": word is used incorrectly — explain why briefly and show a correct example

Keep feedback short (1-2 sentences max). Be warm and encouraging.`;

export async function POST(req: NextRequest) {
  try {
    const { word, sentence, definition } = await req.json();
    if (!word || !sentence) {
      return NextResponse.json({ status: "error", message: "Missing fields" }, { status: 400 });
    }

    const prompt = `Word: "${word}"\nDefinition: ${definition}\nUser's sentence: "${sentence}"`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from AI");

    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    return NextResponse.json({ status: "error", message: "Could not check sentence." }, { status: 500 });
  }
}
