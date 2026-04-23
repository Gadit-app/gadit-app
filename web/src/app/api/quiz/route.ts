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

const SYSTEM_PROMPT = `You are creating a short quiz to help a learner cement their understanding of a specific word and meaning.

You will receive:
- word: the word being practiced
- meaning: the SPECIFIC meaning the user just studied
- uiLang: the user's UI language — write all questions and options in this language

Generate EXACTLY 4 multiple-choice questions, mixing types:

Type A — "Which sentence uses '<word>' correctly to mean '<meaning>'?"
  4 options. ONE correct, three plausibly wrong:
  - one uses a different real meaning of the word (the most useful distractor)
  - one uses the word in nonsense context
  - one uses a similar-sounding word incorrectly

Type B — "What does '<word>' mean here: '<example sentence>'?"
  4 options. ONE matches the user's studied meaning, three are wrong meanings.
  Pick a sentence that clearly uses the studied meaning.

Type C — A synonym question.
  Phrase it as a NATURAL question in the user's UI language using the word "synonym" (or its native equivalent), NOT a clunky English translation.
  4 options. ONE is a real synonym for the studied meaning, three are unrelated words.

  ⚠️ TRANSLATION OF "synonym" IN EACH UI LANGUAGE — use these exact translations, never "synonyms/replacement" or any combined form:
   - English:    "synonym"            → "Which word is a synonym of '<word>' (in this meaning)?"
   - Hebrew:     "מילה נרדפת"         → "איזו מילה היא מילה נרדפת ל-'<word>' (במשמעות זו)?"
   - Arabic:     "مرادف"              → "ما هي الكلمة المرادفة لـ '<word>' (في هذا المعنى)؟"
   - Russian:    "синоним"            → "Какое слово является синонимом '<word>' (в этом значении)?"
   - Spanish:    "sinónimo"           → "¿Qué palabra es sinónimo de '<word>' (en este significado)?"
   - Portuguese: "sinônimo"           → "Qual palavra é sinônimo de '<word>' (neste significado)?"
   - French:     "synonyme"           → "Quel mot est un synonyme de '<word>' (dans ce sens) ?"

  NEVER use "סינונים", "החלפה", "replacement", or composite forms like "synonym/replacement". Pick ONE clean native word for synonym and stick with it.

Type D — "Which is NOT a correct usage of '<word>'?"
  4 options. THREE are correct usages of the studied meaning, ONE is wrong.

You may pick any 4 of these types (mix them — don't use all the same type). Aim for variety. Stay strictly within the studied meaning — do not test other meanings of the word.

Return ONLY valid JSON in this exact shape:
{
  "questions": [
    {
      "type": "A" | "B" | "C" | "D",
      "prompt": "the question text in user's UI language, including the word in quotes",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correctIndex": 0,
      "explanation": "1-sentence explanation in user's UI language of WHY the correct answer is right (and optionally why the most tempting wrong answer is wrong)"
    }
  ]
}

CRITICAL RULES:
- Each question's options must be DISTINCT and shuffled — don't always put the right answer first.
- Distractors must be PLAUSIBLE, not obviously wrong. A bad quiz is one where the right answer is the only sensible-looking option.
- All text in the user's UI language, EXCEPT the studied word itself which must remain in its original spelling.
- Keep prompts concise. No more than 2 lines per option.
- Use real, idiomatic sentences — not robotic textbook examples.`;

export async function POST(req: NextRequest) {
  try {
    const { word, meaning, uiLang } = await req.json();
    if (!word?.trim() || !meaning?.trim()) {
      return NextResponse.json({ error: "word and meaning required" }, { status: 400 });
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

    const userContent = `Word: "${word}"
Meaning being practiced: ${meaning}
User's UI language: ${uiLangName}

Generate 4 mixed-type questions about THIS specific meaning.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.5,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      return NextResponse.json({ error: "AI returned no content" }, { status: 500 });
    }
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("quiz error:", err);
    return NextResponse.json({ error: "internal_error", details: String(err) }, { status: 500 });
  }
}
