import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";

const UI_LANG_NAMES: Record<string, string> = {
  he: "Hebrew",
  en: "English",
  ar: "Arabic",
  ru: "Russian",
};

const SYSTEM_PROMPT = `You are a warm, encouraging language tutor.

The user is learning a word. They saw its definition and now they're writing their own sentence using that specific meaning. Your job: evaluate whether their sentence uses the word correctly, in the right meaning.

You will receive:
- word: the word they're practicing
- meaning: the SPECIFIC meaning they're trying to use (one of several meanings the word might have)
- sentence: the sentence they wrote
- uiLang: the user's interface language — write all feedback in this language

Respond ONLY with valid JSON in this exact format:
{
  "status": "perfect" | "almost" | "incorrect",
  "message": "warm, brief feedback (1-2 sentences) in the user's UI language",
  "suggestion": "an improved or correct example sentence using the word in the same meaning, in the word's language. Only include this for 'almost' or 'incorrect'. Empty string for 'perfect'."
}

Status guidelines:
- "perfect": The word is used correctly AND in the meaning the user was trying to practice. Sentence is grammatical and natural. → Encourage them.
- "almost": The word is used in the right meaning, but the sentence has a small grammar issue, awkwardness, or could be more natural. → Acknowledge the right idea, gently suggest an improvement.
- "incorrect": The word is used in a different meaning than the one specified, OR used in a way that doesn't make sense, OR the sentence has a fundamental problem. → Be kind, explain the mismatch briefly, give a correct example.

Be specific. Don't say "good job" generically — explain WHAT was right or wrong.

Examples (Hebrew user, word "קרן", meaning "אלומת אור דקה"):
- User writes: "קרן השמש האירה את החדר בבוקר"
  → {"status": "perfect", "message": "מצוין! השתמשת במילה 'קרן' בדיוק במשמעות של אלומת אור — קרן שמש שמאירה.", "suggestion": ""}
- User writes: "השקעתי כסף בקרן" (used the wrong meaning — money fund)
  → {"status": "incorrect", "message": "במשפט שלך השתמשת במשמעות אחרת של המילה 'קרן' — קרן השקעות, ולא קרן אור. נסה משפט שמתייחס לאור.", "suggestion": "קרן אור דקה חדרה דרך החלון."}
- User writes: "אני ראיתי קרן שמש"
  → {"status": "almost", "message": "השתמשת במשמעות הנכונה (קרן אור), אבל המשפט קצת קצוע. אפשר להוסיף תיאור.", "suggestion": "ראיתי קרן שמש מבעד לחלון."}`;

export async function POST(req: NextRequest) {
  try {
    const { word, meaning, sentence, uiLang } = await req.json();

    if (!word?.trim() || !meaning?.trim() || !sentence?.trim()) {
      return NextResponse.json(
        { error: "word, meaning, sentence required" },
        { status: 400 }
      );
    }

    // Auth — Clear/Deep only
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    if (userInfo.plan === "basic") {
      return NextResponse.json(
        { error: "upgrade_required", requiredPlan: "clear" },
        { status: 402 }
      );
    }

    const uiLangCode = typeof uiLang === "string" && UI_LANG_NAMES[uiLang] ? uiLang : "en";
    const uiLangName = UI_LANG_NAMES[uiLangCode];

    const userContent = `Word: "${word}"
Meaning to practice: ${meaning}
User's sentence: "${sentence}"
User's UI language (write all feedback in this): ${uiLangName}`;

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
      return NextResponse.json(
        { error: "AI did not return content" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(text);

    // Validate status
    const validStatuses = ["perfect", "almost", "incorrect"];
    if (!validStatuses.includes(parsed.status)) {
      parsed.status = "almost";
    }

    return NextResponse.json({
      status: parsed.status,
      message: parsed.message || "",
      suggestion: parsed.suggestion || "",
    });
  } catch (err) {
    console.error("check-sentence error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
