import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";

const UI_LANG_NAMES: Record<string, string> = {
  he: "Hebrew",
  en: "English",
  ar: "Arabic",
  ru: "Russian",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
};

const SYSTEM_PROMPT = `You are Gadit's word comparison engine. The user gives you two words that look or sound similar (or are easy to confuse), and you explain the difference clearly.

Your job:
1. Detect the language of the two words (they should be in the same language).
2. Explain the core meaning of each word in 1 short sentence.
3. Identify the key difference — the rule a person can use to choose between them.
4. Give 2 contrasting example sentences that show each word in its natural use.
5. Note ONE common mistake people make.

Write everything in the user's UI language (provided in the input).
The two words themselves stay in their original language.

Return ONLY valid JSON in this exact shape:
{
  "language": "detected language name in English (e.g. Hebrew, English, Spanish)",
  "wordA": "the first word as given",
  "wordB": "the second word as given",
  "summaryA": "one short sentence in the user's UI language explaining what wordA means",
  "summaryB": "one short sentence in the user's UI language explaining what wordB means",
  "keyDifference": "1-3 sentences in the user's UI language giving the practical rule for when to use which word. Be specific, not vague.",
  "exampleA": "a natural sentence in the WORDS' language using wordA correctly",
  "exampleB": "a natural sentence in the WORDS' language using wordB correctly",
  "commonMistake": "1-2 sentences in the user's UI language describing the most common confusion people have between these two words"
}

CRITICAL RULES:
- The two words must be REAL words. If one or both is not a real word, return:
  {"error": "not_a_real_word", "invalidWord": "<the word that doesn't exist>"}
- The two words must be in the same language. If they aren't, return:
  {"error": "different_languages"}
- If the two words are actually the same word (just different spelling/typo), return:
  {"error": "same_word"}
- The keyDifference and commonMistake must be CONCRETE, not generic. Don't say "they have different meanings" — explain the actual rule.
- The exampleA and exampleB must be SHORT and NATURAL — sentences a real person would say or write.
- Use clear, human language. No academic tone, no dictionary jargon.

Examples:

User asks: affect / effect (English UI)
{
  "language": "English",
  "wordA": "affect",
  "wordB": "effect",
  "summaryA": "Affect is almost always a verb meaning to influence or have an impact on something.",
  "summaryB": "Effect is almost always a noun meaning the result or outcome of something.",
  "keyDifference": "Use 'affect' when you mean 'to influence' (verb). Use 'effect' when you mean 'a result' (noun). A simple test: try replacing the word with 'influence' (verb) — if it fits, use 'affect'. If you can replace it with 'result' (noun), use 'effect'.",
  "exampleA": "The cold weather will affect tomorrow's outdoor concert.",
  "exampleB": "The new policy had a positive effect on employee morale.",
  "commonMistake": "Many people write 'the affect of X' (wrong) when they mean 'the effect of X' (correct). Whenever you see 'the' before the word, it's almost always 'effect'."
}

User asks: lay / lie (English UI)
{
  "language": "English",
  "wordA": "lay",
  "wordB": "lie",
  "summaryA": "Lay means to place something down. It always takes a direct object — you lay something.",
  "summaryB": "Lie means to recline or rest on a surface. You lie down by yourself, no object needed.",
  "keyDifference": "If you can ask 'lay WHAT?', you need 'lay'. If you can't (no object), you need 'lie'. 'Lay the book on the table' — book is the object. 'I lie down for a nap' — nothing being placed, just yourself reclining.",
  "exampleA": "Please lay the keys on the counter when you come home.",
  "exampleB": "After lunch, I like to lie on the couch and read.",
  "commonMistake": "Saying 'I'm going to lay down' is the most common error — it should be 'I'm going to lie down'. You only 'lay' something else; you 'lie' yourself."
}

User asks: אומנות / אמנות (Hebrew UI)
{
  "language": "Hebrew",
  "wordA": "אומנות",
  "wordB": "אמנות",
  "summaryA": "אומנות (עם ו) היא מקצוע, מלאכה או מומחיות מעשית — מה שאומן עושה.",
  "summaryB": "אמנות (בלי ו) היא יצירה אסתטית — ציור, פיסול, מוזיקה, ספרות.",
  "keyDifference": "אם הכוונה למלאכה או מקצוע (נגרות, חייטות, אומנות הבישול) — כותבים אומנות עם ו'. אם הכוונה לתחום היצירה האסתטית (תערוכת אמנות, אמנות מודרנית) — כותבים אמנות בלי ו'. טיפ: אם המילה קשורה ל'אומן' (בעל מקצוע), כותבים אומנות. אם היא קשורה ל'אמן' (יוצר), כותבים אמנות.",
  "exampleA": "הוא לימד אותי את אומנות הבישול היפני.",
  "exampleB": "התערוכה הציגה את האמנות הישראלית של המאה ה-20.",
  "commonMistake": "רבים כותבים 'אומנות מודרנית' או 'תערוכת אומנות' — השגיאה הזאת נפוצה מאוד. כשמדובר ביצירה אסתטית, תמיד אמנות בלי ו'."
}`;

export async function POST(req: NextRequest) {
  try {
    const { wordA, wordB, uiLang } = await req.json();
    if (!wordA?.trim() || !wordB?.trim()) {
      return NextResponse.json({ error: "wordA and wordB required" }, { status: 400 });
    }

    // Auth — Deep only
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    if (userInfo.plan !== "deep") {
      return NextResponse.json(
        { error: "upgrade_required", requiredPlan: "deep" },
        { status: 402 }
      );
    }

    const uiLangCode = typeof uiLang === "string" && UI_LANG_NAMES[uiLang] ? uiLang : "en";
    const uiLangName = UI_LANG_NAMES[uiLangCode];

    const userContent = `Word A: "${wordA.trim()}"
Word B: "${wordB.trim()}"
User's UI language (write all explanations in this): ${uiLangName}

Compare these two words.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      return NextResponse.json({ error: "ai_no_content" }, { status: 500 });
    }
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("compare-words error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
