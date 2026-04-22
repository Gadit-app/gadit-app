import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

const UI_LANG_NAMES: Record<string, string> = {
  he: "Hebrew",
  en: "English",
  ar: "Arabic",
  ru: "Russian",
};

const KIDS_SYSTEM_PROMPT = `You are Gadit, explaining a word to a young child (age 6-10).

Your job: take a word and its meaning, and explain it in a way that a child would instantly understand.

RULES:
- Use VERY simple language. Short sentences. Everyday words a child knows.
- Be warm, friendly, playful. Like a parent explaining to their kid.
- Use a concrete everyday example the child can picture (their home, a toy, a pet, school, playground).
- NEVER use academic words, jargon, or abstract concepts.
- If the word has a complex meaning, simplify it until a child can understand.
- Respond ENTIRELY in the user's UI language.

Your response must be a JSON object with this exact structure:
{
  "intro": "A warm opening sentence inviting the child. E.g. 'בואו נסביר את המילה הזאת לילדים!' or 'Let's explain this word in a way kids understand!'",
  "explanation": "The main simple explanation — 1-2 short sentences in child-friendly language.",
  "examples": [
    "A simple everyday example a child can relate to",
    "Another simple relatable example",
    "A third simple example from a child's world"
  ]
}

EXAMPLES:

For Hebrew user, word "אהבה":
{
  "intro": "בואו נסביר את המילה הזאת לילדים!",
  "explanation": "אהבה זה כשאתה מרגיש חם בלב למישהו או למשהו. זה הרגש הכי טוב שיש.",
  "examples": [
    "אבא ואמא אוהבים אותך - הם מחבקים אותך חזק ודואגים לך.",
    "אתה אוהב את הכלב שלך - כיף לך לשחק איתו ולגדל אותו.",
    "אתה אוהב גלידה - כל פעם שאתה אוכל גלידה אתה מחייך."
  ]
}

For English user, word "ephemeral":
{
  "intro": "Let's explain this word in a way kids understand!",
  "explanation": "Ephemeral means something that only lasts for a very short time. Like a soap bubble that pops the moment you touch it.",
  "examples": [
    "The ice cream on a hot day is ephemeral — it melts super fast!",
    "A rainbow after rain is ephemeral — it's there for a few minutes, then gone.",
    "A birthday candle's flame is ephemeral — you blow it out in a second."
  ]
}

For Hebrew user, word "קרן" (horn of an animal):
{
  "intro": "בואו נסביר את המילה הזאת לילדים!",
  "explanation": "קרן זה החלק הקשה והמחודד על הראש של חיות מסוימות. היא עוזרת להן להגן על עצמן.",
  "examples": [
    "לאייל יש שתי קרניים גדולות על הראש שנראות כמו ענפים.",
    "הקרנף הוא חיה ענקית שיש לה קרן אחת ענקית באמצע האף.",
    "אם תראה פרה או שור, שים לב שיש להם קרניים קטנות בצדי הראש."
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { word, meaning, uiLang } = await req.json();

    if (!word?.trim() || !meaning?.trim()) {
      return NextResponse.json({ error: "word and meaning required" }, { status: 400 });
    }

    // Check auth — Clear/Deep only
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);

    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    if (userInfo.plan === "basic") {
      return NextResponse.json({ error: "upgrade_required", requiredPlan: "clear" }, { status: 402 });
    }

    const uiLangCode = typeof uiLang === "string" && UI_LANG_NAMES[uiLang] ? uiLang : "en";
    const uiLangName = UI_LANG_NAMES[uiLangCode];

    const cacheKey = `kids_${uiLangCode}_${word.toLowerCase().trim()}_${meaning.toLowerCase().trim().slice(0, 40)}`;

    // Check cache
    try {
      const snap = await getAdminDb().collection("kidsCache").doc(cacheKey).get();
      if (snap.exists) {
        return NextResponse.json({ ...snap.data(), fromCache: true });
      }
    } catch (e) {
      console.error("Kids cache read failed:", e);
    }

    const userContent = `Word: ${word}\nMeaning: ${meaning}\nUser's UI language: ${uiLangName}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          { role: "system", content: KIDS_SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    const data = await res.json();
    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json({ error: "AI did not return content" }, { status: 500 });
    }

    const result = JSON.parse(data.choices[0].message.content);

    // Save to cache
    try {
      await getAdminDb()
        .collection("kidsCache")
        .doc(cacheKey)
        .set({ ...result, cachedAt: new Date().toISOString() });
    } catch (e) {
      console.error("Kids cache write failed:", e);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("explain-for-kids error:", err);
    return NextResponse.json({ error: "Failed to explain", details: String(err) }, { status: 500 });
  }
}
