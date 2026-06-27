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
  de: "German",
  cs: "Czech",
  sk: "Slovak",
  it: "Italian",
  ja: "Japanese",
  hi: "Hindi",
};

const SYSTEM_PROMPT = `You are a warm, encouraging language tutor.

The user is learning a word. They saw a SPECIFIC meaning of it and wrote their own sentence to practice. Your ONE job: did they show they understand THIS meaning of the word?

You will receive:
- word: the word they're practicing
- meaning: the SPECIFIC meaning they're trying to use (the word may have other meanings, ignore those entirely)
- sentence: the sentence they wrote
- uiLang: the user's interface language, write all feedback in this language

Respond ONLY with valid JSON in this exact format:
{
  "status": "perfect" | "almost" | "incorrect",
  "message": "warm, brief feedback (1-2 sentences) in the user's UI language",
  "suggestion": "an improved or correct example sentence using the word in the same meaning, in the word's language. Only include this for 'incorrect'. Empty string for 'perfect' and 'almost'."
}

THE RULE, BE LENIENT ON GRAMMAR, STRICT ON MEANING:
The goal is to verify the user UNDERSTANDS this meaning. Not to teach writing, polish style, or fix every grammar detail. A native speaker reading the sentence should be able to tell the user knows what the word means in this sense.

Status guidelines:
- "perfect": The sentence uses the word in THIS specific meaning, and a reader understands what the user meant. Minor grammar quirks, awkward phrasing, missing articles, casual word order, all FINE. If the meaning is conveyed, it's perfect. → Encourage them warmly.
- "almost": The sentence uses the right meaning BUT something is genuinely confusing or wrong enough that a reader would pause. Reserve this for real problems, not stylistic preferences. → Acknowledge what's right, point out the one issue.
- "incorrect": The sentence uses the word in a DIFFERENT meaning than the one given, OR doesn't actually use the word, OR the sentence doesn't make sense at all. → Briefly explain the mismatch, give a correct example.

Critical: DO NOT mark a sentence "almost" because of minor grammar, style, or because you would phrase it differently. The user is not training to be a writer. They're checking that they got the meaning right.

Examples (Hebrew user, word "נבלה", meaning "אדם רע או מעשה חמור"):
- User writes: "איזה נבלה הוא, גנב לי את הארנק"
  → {"status": "perfect", "message": "השתמשת במילה 'נבלה' בדיוק במשמעות של אדם רע. ברור שאתה מבין את המשמעות הזאת.", "suggestion": ""}
- User writes: "הכלב מצא נבלה ביער" (used the OTHER meaning, dead animal)
  → {"status": "incorrect", "message": "במשפט הזה השתמשת במשמעות אחרת של 'נבלה', חיה מתה. נסה משפט שבו המילה מתייחסת לאדם רע או מעשה חמור.", "suggestion": "מה שעשה הוא נבלה אמיתית, אי אפשר לסלוח על כזה דבר."}
- User writes: "הוא נבלה" (very short but meaning is clear)
  → {"status": "perfect", "message": "קצר אבל ברור, אתה תופס את המשמעות של 'נבלה' כאדם רע.", "suggestion": ""}`;

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
