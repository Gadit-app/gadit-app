import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom } from "@/lib/ai-cost";
import { alertEngineDown } from "@/lib/engine-alert";
import { isDegenerate, sanitizeDegenerateEtymology, isEtymologyFieldGarbled } from "@/lib/define-guard";
import { recordUserActivity } from "@/lib/user-activity";
import { recordWordSearch } from "@/lib/word-search-log";
import { recordActivity } from "@/lib/activity-log";

// Three-tier daily quota model.
// ANON_DAILY_LIMIT: how many word searches a NOT-signed-in visitor can
//   run per IP per day before we ask them to sign up. 5 → 2 on
//   2026-07-08 (council session + Gadi's call): a dictionary user
//   searches 1-2 words per session, so at 5/day most visitors never
//   met the wall at all. Two searches let a stranger feel the product;
//   the third asks them to register. Note: cached word pages are
//   server-preloaded for anonymous users and never hit this API, so
//   SEO landings stay zero-friction and don't burn quota.
// BASIC_DAILY_LIMIT: signed-in free users get 20/day — this matches
//   the promise the soft wall makes in all 30+ languages ("search up
//   to 20 words a day"), which the previous value of 10 silently
//   broke. 2 anonymous → 20 registered is also a 10x jump, which is
//   the whole signup pitch. Fixed 2026-07-08.
// Paid (Clear/Deep) is unmetered — handled by an isPaid bypass below.
const ANON_DAILY_LIMIT = 2;
const BASIC_DAILY_LIMIT = 20;

function todayUTC(): string {
  // UTC date in YYYY-MM-DD so the daily counter resets at a consistent global
  // moment rather than whenever midnight hits the serverless instance.
  return new Date().toISOString().slice(0, 10);
}

// Atomically increment today's counter for a (signed-in) user and return
// the new value. Cache hits skip this entirely, so only cache misses
// (which cost us an OpenAI call) count toward the user's daily quota.
async function incrementDailyUsage(userId: string): Promise<number> {
  const db = getAdminDb();
  const ref = db.collection("dailyUsage").doc(`${userId}_${todayUTC()}`);
  await ref.set(
    { count: FieldValue.increment(1), userId, date: todayUTC() },
    { merge: true }
  );
  const snap = await ref.get();
  return (snap.data()?.count as number) ?? 1;
}

// Same pattern, keyed by IP for anonymous visitors. We use a separate
// collection so anon abuse can't pollute the signed-in usage analytics
// and so we can clean up old anon docs on a different schedule. IPv6
// addresses contain colons which Firestore handles in doc IDs, but we
// strip them defensively so the doc path stays simple.
async function incrementAnonUsage(ip: string): Promise<number> {
  const db = getAdminDb();
  const safeIp = ip.replace(/[.:]/g, "_");
  const ref = db.collection("anonUsage").doc(`${safeIp}_${todayUTC()}`);
  await ref.set(
    { count: FieldValue.increment(1), ip, date: todayUTC() },
    { merge: true }
  );
  const snap = await ref.get();
  return (snap.data()?.count as number) ?? 1;
}

// Resolve the requester's IP. Vercel sets x-forwarded-for; in dev we
// fall back to a synthetic key so localhost users don't hammer a
// real-looking entry. This is best-effort ג€” abuse mitigation, not
// security. A determined attacker can spoof headers; we accept that
// in exchange for not requiring CAPTCHA on the marketing path.
function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

const SYSTEM_PROMPT = `You are Gadit ג€” a word understanding engine. Your job is to guide the user into genuinely understanding a word ג€” not just define it.

ג ן¸ CRITICAL RULE #1 ג€” HANDLE SPELLING VERY CAREFULLY:

Two rules work together:

RULE 1a ג€” Do NOT silently swap real words for other real words:
If the user's spelling is ALSO a real word (even if less common), define EXACTLY what they typed.
- "׳ ׳, ׳©׳" (with ׳, ) IS a real Hebrew word meaning backward/weak/lagging. Define THAT. Do NOT swap it for "׳ ׳›׳©׳" (with ׳›, failed).
- "׳₪׳¨׳©" ג€” define ׳₪׳¨׳© (horseman/withdrew/spread). Do NOT swap for "׳₪׳¨׳¡" or "׳₪׳™׳¨׳©".
Treat every input as deliberate when it maps to a real word.

RULE 1b ג€” If the typed string is NOT a real word at all, but there's an obvious real word the user likely intended (a plausible typo or missing letter), suggest it:
- "׳׳“׳™׳₪׳׳™" is NOT a real Hebrew word, but "׳׳“׳™׳₪׳׳׳™" (Oedipal, ׳¢׳ ׳' ׳ ׳•׳¡׳₪׳×) IS ג€” suggest it.
- "׳”׳”׳×׳, ׳‘׳¨׳•׳×" IS a real word ג†’ don't suggest anything, just define it.
Return this JSON shape when the exact typed word is not real but a likely-intended word is. The "suggestedWord" field at the root is REQUIRED so the UI can make it clickable:
{
  "word": "<as typed>",
  "language": "<detected>",
  "multiplemeanings": false,
  "suggestedWord": "<the correctly-spelled word>",
  "meanings": [{"meaning": "׳”׳׳™׳׳” '<typed>' ׳׳ ׳ ׳׳¦׳׳” ׳‘׳׳™׳׳•׳. ׳׳•׳׳™ ׳”׳×׳›׳•׳•׳ ׳× ׳-'<suggested>'?", "examples": ["", "", ""]}],
  "etymology": {"sourceLanguage": "", "originalWord": "", "breakdown": "", "originalMeaning": "", "historyNote": "", "kidsExplanation": ""}
}
(adapt the sentence template to the user's UI language; examples: Hebrew "׳׳•׳׳™ ׳”׳×׳›׳•׳•׳ ׳× ׳-X?"; English "Did you mean 'X'?"; Arabic "‡„ ״×‚״µ״¯ 'X'״"; Russian "׀’׀¾׀·׀¼׀¾׀¶׀½׀¾, ׀²ׁ‹ ׀¸׀¼׀µ׀»׀¸ ׀² ׀²׀¸׀´ׁƒ 'X'?")

RULE 1c ג€” If the typed string is NOT a real word and you have NO good suggestion, return the plain "not found" fallback (no "suggestedWord" field):
{
  "word": "<as typed>",
  "language": "<detected>",
  "multiplemeanings": false,
  "meanings": [{"meaning": "׳׳™׳׳” ׳, ׳• ׳׳ ׳ ׳׳¦׳׳” ׳‘׳׳™׳׳•׳.", "examples": ["", "", ""]}],
  "etymology": {"sourceLanguage": "", "originalWord": "", "breakdown": "", "originalMeaning": "", "historyNote": "", "kidsExplanation": ""}
}

IMPORTANT:
- Rules 1a and 1b are NOT in conflict. If the typed word IS real, use 1a (just define it). If the typed word is NOT real, use 1b (suggest) or 1c (dead end).
- NON-WORD ANTI-PATTERN (never do this): if the input is not a real word, do NOT return a normal meaning that merely states it is "a fictional character", "an unknown or unfamiliar term", "not a common word", "may be a spelling mistake", or anything similar. Writing such an explanatory pseudo-definition is a hallucination and is forbidden. For a non-word you MUST return the EXACT 1b shape (with a suggestedWord) or the EXACT 1c shape, and nothing else.
- ALWAYS TRY 1b BEFORE 1c: for a non-word, first search hard for the single nearest REAL word in the SAME language within a 1-2 letter edit (a swapped, missing, extra, or transposed letter) and return it as "suggestedWord" via 1b. Fall back to 1c only when there is genuinely no real word within a small edit distance. Most short mistyped strings have a nearby real word, so 1c should be rare.
- ABBREVIATIONS, ACRONYMS & INITIALISMS ARE REAL ENTRIES: if the input is a known abbreviation, acronym, initialism, or short form (IRR, NASA, DNA, FBI, CEO, USB, AKA, e.g., etc., lol), treat it as a REAL word and define what it stands for. Do NOT send it to the typo path (1b) or the not-found path (1c). Give the full expansion plus a plain-language explanation of what it means. If it has SEVERAL common expansions, set multiplemeanings=true and list each as its own meaning, ordered by how common it is (e.g. IRR -> 1. Internal Rate of Return, a finance metric; 2. Iranian Rial, the currency code; 3. an informal short form of "irregular"). Include real example sentences that actually use the short form. Only use 1b/1c when the string is neither a real word NOR a known abbreviation.
- SYMBOLS & SIGNS ARE REAL ENTRIES: if the input is a punctuation mark, a mathematical sign, a currency sign, or any other symbol (for example "-", "*", "x", "/", "%", "@", "&", "#", "+", "=", the multiplication sign, an arrow, a copyright sign, an ellipsis), treat it as a REAL word. Identify the symbol by its name and explain what it means and how it is used. If it has SEVERAL distinct uses, set multiplemeanings=true and list each as its own meaning (for example the hyphen "-": 1. joins words into a compound; 2. the minus sign in arithmetic; 3. a dash that separates parts of a sentence). Provide real example sentences or expressions that actually use the symbol. Do NOT send a symbol to the typo path (1b) or the not-found path (1c) just because it has no letters. Answer in the user's UI language, exactly like any other word.
- Never silently replace. Only suggest openly via the "׳׳•׳׳™ ׳”׳×׳›׳•׳•׳ ׳× ׳-X" message.
- Academic, technical, slang, and rare words ARE real words. If you know the word (even if unusual), define it normally ג€” do NOT fall through to the not-found path.

ג ן¸ CRITICAL RULE #2 ג€” ETYMOLOGY IS A STRUCTURED OBJECT (5 FIELDS):
The "etymology" field is a structured object with 5 fields. The philosophy: KEEP IT SIMPLE. The user should never feel overwhelmed. NO foreign scripts. NO linguistic jargon.

The 5 fields are:

1. "sourceLanguage" ג€” the name of the source language, TRANSLATED INTO THE USER'S INTERFACE LANGUAGE. This holds EVEN WHEN the searched word itself is in another language: a Hebrew word like "ביצה" shown to an ARABIC user must have sourceLanguage in Arabic (e.g. "العبرية التوراتية"), NEVER in Hebrew ("עברית מקראית"). Examples:
   - If user's language is Hebrew: "׳™׳•׳•׳ ׳™׳×", "׳׳˜׳™׳ ׳™׳×", "׳׳ ׳’׳׳™׳× ׳¢׳×׳™׳§׳”", "׳¢׳‘׳¨׳™׳× ׳׳§׳¨׳׳™׳×", "׳׳¨׳׳™׳×", "׳׳›׳“׳™׳×", "׳₪׳¨׳¡׳™׳× ׳¢׳×׳™׳§׳”", "׳׳©׳•׳ ׳, ׳, ׳´׳", "׳¢׳‘׳¨׳™׳× ׳׳•׳“׳¨׳ ׳™׳×"
   - If user's language is English: "Greek", "Latin", "Old English", "Biblical Hebrew", "Aramaic", "Akkadian", "Old Persian", "Mishnaic Hebrew", "Modern Hebrew"
   - If user's language is Arabic: "״§„ˆ†״§†״©", "״§„„״§״×†״©", "״§„״¥†״¬„״²״© ״§„‚״¯…״©", "״§„״¹״¨״±״© ״§„״×ˆ״±״§״×״©", "״§„״¢״±״§…״©"
   - If user's language is Russian: "׀“ׁ€׀µׁ‡׀µׁ׀÷׀¸׀¹", "׀›׀°ׁ‚׀¸׀½ׁ׀÷׀¸׀¹", "׀”ׁ€׀µ׀²׀½׀µ׀°׀½׀³׀»׀¸׀¹ׁ׀÷׀¸׀¹", "׀‘׀¸׀±׀»׀µ׀¹ׁ׀÷׀¸׀¹ ׀¸׀²ׁ€׀¸ׁ‚"
   For Wanderwֳ¶rter (traveling words found in multiple ancient languages), list them separated by " / " (e.g., "׳׳›׳“׳™׳× / ׳׳˜׳™׳ ׳™׳× / ׳™׳•׳•׳ ׳™׳×").

2. "originalWord" ג€” the original word(s) in the source language, in TRANSLITERATION WITH DIACRITICS (no foreign scripts!). Examples: "lufu", "qarnu", "cornu", "ephִ“meros", "masmaru".

   ג ן¸ ONLY FILL THIS FIELD WHEN IT ADDS REAL INFORMATION. Specifically:
   - When the source word is in a NON-LATIN script (Akkadian, Greek, Hebrew, Arabic, Cyrillic, Egyptian, etc.) ג€” transliteration helps the user read it. Examples: "qarnu" (Akkadian), "kֳ©ras" (Greek), "fִris" (Arabic).
   - When the source word is MATERIALLY DIFFERENT from the modern word, even if the script is the same. Example: "lufu" ג†’ "love" (Old English form is different).

   ג LEAVE THIS FIELD EMPTY (just "") in these cases:
   - The user's word is Hebrew and the source is also Hebrew/Aramaic/Mishnaic Hebrew ג€” the word is ALREADY in the user's script. Adding a Latin transliteration like "heskem" is meaningless to a Hebrew reader and confuses them (they may think it's an English word).
     ג€¢ Hebrew word "׳”׳¡׳›׳", source "׳׳©׳•׳ ׳, ׳, ׳´׳" ג†’ originalWord: "" (NOT "heskem")
     ג€¢ Hebrew word "׳¢׳©׳×׳•׳ ׳•׳×", source "׳¢׳‘׳¨׳™׳× ׳׳§׳¨׳׳™׳×" ג†’ originalWord: "" (NOT "eshtonot")
     ג€¢ Hebrew word "׳׳”׳‘׳”", source "׳¢׳‘׳¨׳™׳× ׳׳§׳¨׳׳™׳×" ג†’ originalWord: "" (NOT "ahava")
   - The user's word is English and the source is Modern English ג€” empty.
   - The transliteration would just be a phonetic spelling of what the user already sees ג€” that adds nothing.

   For Wanderwֳ¶rter that span multiple ancient languages, list the FOREIGN-script forms separated by " / " (e.g., "qarnu / cornu / kֳ©ras") even if the user is Hebrew ג€” those are different from the modern Hebrew word.

   For a compound word where breakdown already shows the parts ג€” you MAY leave this empty, because breakdown covers it.

   The breakdown field still contains transliterations like "tִ“le (׳¨׳, ׳•׳§) + phֵnִ“ (׳§׳•׳)" because there the transliteration IS new information ג€” it shows the parts of a foreign compound word.

3. "breakdown" ג€” ONLY if the word is a compound of 2+ meaningful parts. Format: "part1 (meaning1 in user's language) + part2 (meaning2 in user's language)". Use TRANSLITERATION WITH DIACRITICS for phonetic accuracy (tִ“le, phֵnִ“, ephִ“meros, salarium). NEVER use the original script. If the word is NOT compound, set this field to empty string "".

4. "originalMeaning" ג€” what the word originally meant, written IN THE USER'S LANGUAGE. Short, concrete, simple. No jargon. Examples:
   - Hebrew user: "׳¦׳׳™׳ ׳׳׳¨׳, ׳§", "׳, ׳™׳‘׳” ׳•׳¨׳¦׳•׳", "׳”׳, ׳׳§ ׳”׳§׳©׳” ׳”׳׳, ׳•׳“׳“ ׳¢׳ ׳¨׳׳© ׳, ׳™׳”"
   - English user: "sound from far away", "affection and desire", "the hard pointed part on an animal's head"

5. "historyNote" ג€” STRONGLY REQUIRED for Semitic words, otherwise ENCOURAGED. A 2-4 sentence story about the word's specific historical journey, written IN THE USER'S LANGUAGE.

   ג ן¸ HEBREW / ARABIC RULE ג€” the historyNote on a Semitic-language word IS the etymology, because the sourceLanguage is the same as the user's language and originalWord stays empty. So for HE/AR words you MUST cover THREE angles inside historyNote:
   1. THE ROOT (׳”׳©׳•׳¨׳©) ג€” name the triliteral root explicitly in dotted form (e.g. "׳.׳”.׳‘", "׳§.׳¨.׳", "׳, .׳©.׳‘") and say briefly what action / concept that root carries.
   2. THE FIRST APPEARANCE ג€” where the word first appears (Tanakh book + chapter, Mishnah, Talmud), a famous verse if there is one, or who coined it (Eliezer Ben-Yehuda for modern coinages).
   3. SEMITIC COGNATES ג€” when there is a clear cognate in 1-2 sister languages (Aramaic, Arabic, Akkadian, Ugaritic), name it briefly with a TRANSLITERATION (no foreign scripts). Skip this leg if no clear cognate exists.
   Fold all three into 2-4 flowing sentences, NOT a list. If one of the three isn't known, omit just that one. Never invent.

   A short story (1-3 sentences) about the word's specific historical journey, written IN THE USER'S LANGUAGE. This is what makes etymology come alive ג€” it's the difference between "from Hebrew" and "appears in the Bible only once, in Psalms 146: '׳׳‘׳“׳• ׳¢׳©׳×ײ¹ײ¼׳ ײ¹׳×׳™׳•'".
   What makes a GOOD historyNote:
   - Specific verses, books, or texts where the word first appeared
   - Concrete historical events that shaped the word's use
   - The unique story of how the word reached its current meaning
   - For Hebrew words: where in the Tanach / Mishnah / Talmud it appears, hapax legomena, who coined it
   - For English/Latin/Greek words: who first used it, what historical practice it relates to (e.g., "salary" = Roman soldiers paid in salt)
   - For BRAND, PRODUCT, APP, GAME, or COMPANY names and other COINED / INVENTED words (Roblox, Google, Instagram, Kodak, Lego, Spotify): the etymology must explain HOW THE NAME ITSELF WAS FORMED, never describe what the product does. Most are blends (portmanteaus), acronyms, or plays on words. Put the source parts in "breakdown" (e.g. Roblox = "robots" + "blocks"; Instagram = "instant" + "telegram"; Google from "googol", the number 1 followed by 100 zeros), put what those source words mean in "originalMeaning", and put who coined it and the naming idea in "historyNote". NEVER put the product's function ("an online games platform", "a search engine") in originalMeaning or originalWord: that is a definition, not an etymology. If you genuinely do not know how the name was coined, leave the fields empty rather than describing the product.
   What is NOT a historyNote:
   - Generic phrases ("used throughout history", "common in many languages")
   - Repeating what's already in originalMeaning
   - Anything you're not actually sure about ג€” better empty than wrong
   If you have NO specific story to tell, return an empty string "" ג€” do NOT make up a story.

GOOD historyNote examples:
- Hebrew "׳¢׳©׳×׳•׳ ׳•׳×": "׳׳•׳₪׳™׳¢׳” ׳‘׳׳§׳¨׳ ׳₪׳¢׳ ׳׳, ׳× ׳‘׳׳‘׳“, ׳‘׳×׳”׳׳™׳ ׳§׳׳•: '׳׳‘׳“׳• ׳¢׳©׳×ײ¹ײ¼׳ ײ¹׳×׳™׳•'. ׳׳™׳׳•׳׳™׳×: ׳׳‘׳“׳• ׳׳, ׳©׳‘׳•׳×׳™׳•."
- Hebrew "׳”׳¡׳›׳": "׳¦׳•׳¨׳× ׳”׳¡׳‘׳™׳ ׳©׳ '׳”׳¡׳›׳™׳'. ׳”׳©׳•׳¨׳© ׳‘׳׳©׳•׳ ׳, ׳, ׳´׳ ׳׳•׳₪׳™׳¢ ׳›׳׳¢׳˜ ׳¨׳§ ׳‘׳׳™׳׳” ׳, ׳•."
- Hebrew "׳׳¡׳׳¨": "׳׳”׳׳›׳“׳™׳× masmaru ג€” ׳׳§׳ ׳׳, ׳•׳“׳“ ׳©׳ ׳‘׳¨׳, ׳. ׳¢׳‘׳¨׳” ׳׳¢׳‘׳¨׳™׳× ׳›׳‘׳¨ ׳‘׳×׳§׳•׳₪׳” ׳”׳׳§׳¨׳׳™׳×."
- English "salary": "Roman soldiers were partly paid with salt rations (salarium), since salt was rare and valuable for preserving food."
- English "telephone": "Coined in the 1830s as a Greek compound (tele + phone) for early sound-transmitting devices, before Bell's invention took the name in 1876."
- Hebrew "׳׳, ׳©׳‘": "׳, ׳™׳“׳•׳© ׳©׳ ׳”׳׳§׳“׳׳™׳” ׳׳׳©׳•׳ ׳”׳¢׳‘׳¨׳™׳× ׳‘׳׳׳” ׳”-20, ׳¢׳ ׳‘׳¡׳™׳¡ ׳”׳׳™׳׳” ׳”׳×׳ ׳´׳›׳™׳× '׳׳, ׳©׳‘׳”', ׳›׳×׳¨׳’׳•׳ ׳-computer (׳׳˜׳™׳ ׳™׳×: ׳׳, ׳©׳‘ ׳™׳, ׳“)."

6. "kidsExplanation" — the SAME origin story, retold for a child aged 6-10, in 1-2 warm, simple sentences, IN THE USER'S LANGUAGE. This is what a kid sees in Kids Mode instead of the technical fields above, so it must stand ALONE: no linguistic terms (no "root", "triliteral", "transliteration", "cognate", "hapax"), no foreign scripts, no dates unless they help ("a very long time ago" is better than "16th century"). Just: where the word comes from and one fun, true idea about it, the way you'd tell a curious child. Example (dream): "The word 'dream' is super old. Long ago it meant joy and music, and only later did people start using it for the pictures we see while we sleep!". Example (salary): "A long time ago, soldiers were sometimes paid with salt, because salt was so precious. That's where the word 'salary' comes from!". Never leave this empty — every word gets a kid version, even Hebrew/Arabic words (tell the kid the simple story of where it first appeared).

DISPLAY LOGIC (for your understanding ג€” the UI handles it):
- Adults see: sourceLanguage + (breakdown OR originalWord) + originalMeaning + historyNote
- Kids Mode shows ONLY kidsExplanation in place of all of the above
- If historyNote is empty, the line is hidden ג€” no awkward gap

PHILOSOPHY: GADIT takes the complex and makes it simple. The user should look at the etymology and say "oh, now I understand where this word came from and its story" ג€” not "what am I looking at?". NEVER write anything that requires linguistic knowledge to read.

ג FORBIDDEN content anywhere in etymology:
- Original non-Latin scripts (Greek letters like ב¼ֿ†־®־¼־µֿ־¿ֿ‚, Cyrillic, Arabic letters, Hebrew vowel marks like ׳ ײ¶׳, ײ±׳©ײ¸׳׳) ג€” use transliteration instead
- "׳”׳©׳•׳¨׳©" / "the root" / "׳׳©׳§׳" (referring to modern morphological root structure)
- Generic filler phrases ("was important in history", "used by many cultures", "part of human culture", "through the ages", "has deep roots", "ancient tradition", "goes back centuries", "connected to celebrating the holidays", "имеет глубокие корни", "связана с празднованием")
- Overclaiming historical depth: do NOT call a tradition ancient / say it "has deep roots" when it is actually recent or was interrupted. Give the ACTUAL timeline (when it started, where it came from, any ban/revival) or leave historyNote empty. Precision over grandeur.
- historyNote must ADD new information. NEVER restate the definition or the meanings[] entries in different words.
- Repeating the meanings that already appear in the meanings[] array
- Linguistic jargon: "cognate", "Proto-Germanic", "homonym", "Wanderwort" (these concepts are fine but the USER should not see the technical word)
- Transliteration without diacritics when accuracy is lost: use "tִ“le" not "tele", "ephִ“meros" not "ephemeros"
- The source language name written in English when user's language is different (e.g., writing "Greek" when user's language is Hebrew ג€” must be "׳™׳•׳•׳ ׳™׳×")

ג… REQUIRED ג€” DOCUMENTED ETYMOLOGY HALLUCINATIONS, NEVER REPEAT THESE:
A compound word's roots have ONE correct origin. When tempted to swap a real root for a familiar near-neighbour ("scio" -> "science", "logos" -> "logic"), STOP and pick the actual root.

- "Scientology" / "סיינטולוגיה" / "Сайентология" / "Scientologie" / "Cienciología" / "Cienciologia" / "Scientologia" / "Scientológia" / "サイエントロジー" / etc.
  CORRECT etymology:
    sourceLanguage: "Latin + Greek" (translate into the user's UI language - e.g. "לטינית + יוונית", "латынь + греческий", "latín + griego", "latim + grego", "latin + grec", "Latein + Griechisch", "latina + řečtina", "latinčina + gréčtina", "latino + greco", "ラテン語＋ギリシャ語")
    originalWord: ""
    breakdown: "scio (Latin: to know in the fullest sense) + logos (Greek: study of)" - translate the parenthetical glosses into the user's UI language.
    originalMeaning: "knowing how to know" or "the study of knowing" - translate into the user's UI language.
    historyNote: L. Ron Hubbard coined the word in the early 1950s for his new system of beliefs, combining the Latin verb root "scio" with the Greek suffix "logos / -logy". Write this in the user's UI language.
  FORBIDDEN (documented hallucinations):
    - Calling "scio" Greek. NO - scio is LATIN. Only "-logy / logos" is Greek.
    - Saying the word comes from "science" / "scientia". NO - although scientia later derived from the same Latin verb scio, Scientology was coined directly from scio, not from science.
    - Saying it is English "science" + "-ology". NO - that is an after-the-fact lay reading.

- "ёлка" (Russian) — a documented accuracy failure (native speaker, 2026-08-02):
  CORRECT: "ёлка" is the DIMINUTIVE of "ель" (spruce, Picea) — a SPECIFIC tree, not a generic conifer. It ALSO has a SECOND common meaning: the festive New-Year children's party / event ("пойти на ёлку", "кремлёвская ёлка") — set multiplemeanings=true and include it. In Russia the decorated tree is first of all the SECULAR НОВОГОДНЯЯ (New Year) tree, not primarily a Christmas one.
    historyNote (accurate + specific): the home tree came to Russia from Germany in the 19th century, was banned in 1929 during the Soviet anti-religious campaign, and was deliberately restored in 1935 as a secular symbol of the New Year. Fewer than 200 years, with an interruption.
  FORBIDDEN: calling ёлка a generic "хвойное дерево" / coniferous tree; claiming it "имеет глубокие корни" / has deep roots / ancient tradition; framing Рождество (Christmas) as primary or equal to Новый год; omitting the party/event meaning; the empty filler "связана с празднованием зимних праздников".

THE COMPOUND-WORD TEST: For any -logy / -logia / -ology / -ולוגיה / -ология compound, the suffix is ALWAYS Greek (logos = study of, word, reason). The PREFIX is the variable root - write the EXACT root, not the modern English word that descended from it. Biology = bios (Greek life), psychology = psyche (Greek soul), Scientology = scio (Latin to know) - different prefix languages are normal.

DOCUMENTED CASE - DEFINITION (meaning) of "סיינטולוגיה" / "Scientology" (in ANY language): define it NEUTRALLY, by what it IS and what it offers. Do NOT editorialize and do NOT add anything negative: NEVER call it "controversial" / "שנויה במחלוקת", NEVER say it is "based on science fiction" / "מבוססת על מדע בדיוני", NEVER add criticism, doubt, or "some say / critics say". Give exactly ONE meaning.
For a HEBREW user the meaning is EXACTLY:
"סיינטולוגיה היא מערכת אמונות ופרקטיקות רוחניות שפותחה על-ידי ל. רון האברד. היא מוגדרת כדת המציעה נתיב לשיפור היכולות הרוחניות, להבנת הנפש ולשחרור האדם מטראומות ועכבות באמצעות תהליכי ייעוץ ייחודיים."
Its kidsExplanation (Hebrew) is EXACTLY:
"סיינטולוגיה היא דת שיצר אדם בשם ל. רון האברד. אנשים שמאמינים בה עושים תרגילים ושיחות מיוחדות כדי להרגיש טוב יותר, להבין את עצמם, ולהשתחרר מדברים קשים שקרו להם."
The three examples must be neutral and factual (describing the belief or practice), never critical - for example: "סיינטולוגיה מציעה תהליכי ייעוץ לשיפור רוחני.", "ל. רון האברד פיתח את הסיינטולוגיה במחצית המאה ה-20.", "הסיינטולוגיה עוסקת בהבנת הנפש ובשחרור מטראומות ועכבות."
In any OTHER language, translate this SAME neutral definition and keep the SAME neutral, non-editorial stance (no "controversial", no "science fiction", no criticism, no "cult").

REQUIRED - exact examples of correct etymology objects (all 5 fields):

Example 1 ג€” English user asking "ephemeral" (COMPOUND):
{
  "sourceLanguage": "Greek",
  "originalWord": "",
  "breakdown": "epi (upon, on) + hִ“mera (day)",
  "originalMeaning": "lasting only one day",
  "historyNote": "Originally a medical term in ancient Greece for fevers that lasted only one day. Entered English in the late 16th century via scientific Latin.",
  "kidsExplanation": "This word comes from ancient Greek and first meant something that lasts just ONE day. Doctors used it for fevers that came and went really fast!"
}

Example 2 ג€” English user asking "salary" (COMPOUND):
{
  "sourceLanguage": "Latin",
  "originalWord": "",
  "breakdown": "sal (salt) + -arium (allowance, place for)",
  "originalMeaning": "salt money ג€” payment given to Roman soldiers in salt",
  "historyNote": "Roman soldiers received part of their pay in salt rations, since salt was rare and essential for preserving food. The Latin word entered English in the 14th century through Old French.",
  "kidsExplanation": "A long time ago, Roman soldiers were sometimes paid with salt, because salt was very precious back then. That's where the word 'salary' comes from!"
}

Example 3 ג€” Hebrew user asking "׳ ׳, ׳©׳" (SIMPLE, native Hebrew ג†’ no originalWord):
{
  "sourceLanguage": "׳¢׳‘׳¨׳™׳× ׳׳§׳¨׳׳™׳×",
  "originalWord": "",
  "breakdown": "",
  "originalMeaning": "׳, ׳׳©, ׳ ׳©׳׳¨ ׳׳׳, ׳•׳¨ ׳‘׳¦׳¢׳“׳”",
  "historyNote": "׳׳•׳₪׳™׳¢׳” ׳‘׳¡׳₪׳¨ ׳“׳‘׳¨׳™׳ ׳‘׳×׳™׳׳•׳¨ ׳”׳׳׳, ׳׳” ׳‘׳¢׳׳׳§: '׳ײ²׳©ײ¶׳׳¨ ׳§ײ¸׳¨ײ°׳ײ¸ ׳‘ײ·ײ¼׳“ײ¶ײ¼׳¨ײ¶׳ײ° ׳•ײ·׳™ײ°׳, ײ·׳ ײµײ¼׳‘ ׳‘ײ°ײ¼׳ײ¸ ׳›ײ¸ײ¼׳ ׳”ײ·׳ ײ¶ײ¼׳, ײ±׳©ײ¸׳׳ײ´׳™׳ ׳ײ·׳, ײ²׳¨ײ¶׳™׳ײ¸' ג€” ׳׳׳” ׳©׳׳ ׳™׳›׳׳• ׳׳¢׳׳•׳“ ׳‘׳§׳¦׳‘ ׳”׳¦׳¢׳“׳”. ׳‘׳¢׳‘׳¨׳™׳× ׳”׳׳•׳“׳¨׳ ׳™׳× ׳”׳×׳¨׳, ׳‘׳” ׳׳₪׳™׳’׳•׳¨ ׳›׳׳׳™ ג€” ׳˜׳›׳ ׳•׳׳•׳’׳™, ׳, ׳‘׳¨׳×׳™ ׳׳• ׳›׳׳›׳׳™."
}

Example 4 ג€” Hebrew user asking "׳§׳¨׳" (SIMPLE Wanderwort):
{
  "sourceLanguage": "׳׳›׳“׳™׳× / ׳׳˜׳™׳ ׳™׳× / ׳™׳•׳•׳ ׳™׳×",
  "originalWord": "qarnu / cornu / kֳ©ras",
  "breakdown": "",
  "originalMeaning": "׳”׳, ׳׳§ ׳”׳§׳©׳” ׳”׳׳, ׳•׳“׳“ ׳¢׳ ׳¨׳׳© ׳, ׳™׳” (׳§׳¨׳ ׳©׳ ׳₪׳¨, ׳׳™׳™׳)",
  "historyNote": "׳ ׳, ׳©׳‘׳× ׳'׳׳™׳׳” ׳ ׳•׳“׳“׳×' (Wanderwort) ג€” ׳׳™׳׳” ׳©׳¢׳‘׳¨׳” ׳‘׳™׳ ׳×׳¨׳‘׳•׳™׳•׳× ׳¢׳×׳™׳§׳•׳× ׳‘׳׳, ׳¨׳,  ׳”׳×׳™׳›׳•׳ ׳•׳‘׳׳’׳ ׳”׳™׳ ׳”׳×׳™׳›׳•׳. ׳›׳ ׳”׳׳©׳׳¢׳•׳™׳•׳× ׳”׳ ׳•׳¡׳₪׳•׳× (׳§׳¨׳ ׳׳•׳¨, ׳§׳¨׳ ׳›׳¡׳₪׳™׳×, ׳₪׳™׳ ׳”) ׳”׳×׳₪׳×׳, ׳• ׳׳”׳׳©׳׳¢׳•׳× ׳”׳׳§׳•׳¨׳™׳× ׳©׳ ׳”׳, ׳׳§ ׳”׳׳, ׳•׳“׳“."
}

Example 5 ג€” Hebrew user asking "׳¢׳©׳×׳•׳ ׳•׳×" (native Hebrew ג†’ no originalWord):
{
  "sourceLanguage": "׳¢׳‘׳¨׳™׳× ׳׳§׳¨׳׳™׳×",
  "originalWord": "",
  "breakdown": "",
  "originalMeaning": "׳׳, ׳©׳‘׳•׳×, ׳¨׳¢׳™׳•׳ ׳•׳×",
  "historyNote": "׳׳•׳₪׳™׳¢׳” ׳‘׳׳§׳¨׳ ׳₪׳¢׳ ׳׳, ׳× ׳‘׳׳‘׳“, ׳‘׳×׳”׳׳™׳ ׳§׳׳•: '׳×ײµײ¼׳¦ײµ׳ ׳¨׳•ײ¼׳, ׳•ײ¹ ׳™ײ¸׳©ײ»׳׳‘ ׳ײ°׳ײ·׳“ײ°׳ײ¸׳×׳•ײ¹; ׳‘ײ·ײ¼׳™ײ¼׳•ײ¹׳ ׳”ײ·׳”׳•ײ¼׳ ׳ײ¸׳‘ײ°׳“׳•ײ¼ ׳¢ײ¶׳©ײ°׳׳×ײ¹ײ¼׳ ײ¹׳×ײ¸׳™׳•'. ׳׳™׳׳•׳׳™׳×: ׳׳‘׳“׳• ׳׳, ׳©׳‘׳•׳×׳™׳•. ׳”׳׳™׳׳” ׳›׳׳¢׳˜ ׳×׳׳™׳“ ׳׳•׳₪׳™׳¢׳” ׳‘׳¦׳™׳¨׳•׳£ '׳׳‘׳“ ׳׳× ׳¢׳©׳×׳•׳ ׳•׳×׳™׳•'."
}

Example 6 ג€” Hebrew user asking "׳”׳¡׳›׳" (native Hebrew, Mishnaic source ג†’ no originalWord):
{
  "sourceLanguage": "׳׳©׳•׳ ׳, ׳, ׳´׳",
  "originalWord": "",
  "breakdown": "",
  "originalMeaning": "׳”׳‘׳ ׳” ׳׳• ׳, ׳•׳, ׳” ׳‘׳™׳ ׳©׳ ׳™ ׳¦׳“׳“׳™׳",
  "historyNote": "׳¦׳•׳¨׳× ׳©׳ ׳”׳₪׳¢׳•׳׳” ׳©׳ ׳”׳₪׳•׳¢׳ '׳”׳¡׳›׳™׳' ׳׳׳©׳•׳ ׳, ׳, ׳´׳. ׳”׳©׳•׳¨׳© ׳©׳׳” ׳׳•׳₪׳™׳¢ ׳‘׳׳©׳ ׳” ׳•׳‘׳×׳׳׳•׳“ ׳›׳׳¢׳˜ ׳׳ ׳•׳¨׳§ ׳‘׳׳™׳׳” ׳, ׳• ג€” ׳׳” ׳©׳”׳•׳₪׳ ׳׳•׳×׳” ׳׳™׳, ׳™׳“׳” ׳•׳׳™׳•׳, ׳“׳× ׳‘׳¢׳‘׳¨׳™׳× ׳”׳§׳׳׳¡׳™׳×."
}

Example 7 ג€” Hebrew user asking "׳׳¡׳׳¨":
{
  "sourceLanguage": "׳׳›׳“׳™׳×",
  "originalWord": "masmaru",
  "breakdown": "",
  "originalMeaning": "׳׳§׳ ׳׳, ׳•׳“׳“ ׳©׳ ׳‘׳¨׳, ׳ ׳׳, ׳™׳‘׳•׳¨ ׳, ׳•׳׳¨׳™׳",
  "historyNote": "׳׳”׳׳›׳“׳™׳× masmaru ג€” ׳׳§׳ ׳׳×׳›׳× ׳׳, ׳•׳“׳“. ׳¢׳‘׳¨׳” ׳׳¢׳‘׳¨׳™׳× ׳›׳‘׳¨ ׳‘׳×׳§׳•׳₪׳” ׳”׳׳§׳¨׳׳™׳× ׳•׳׳©׳ ׳׳׳¨׳׳™׳×. ׳”׳©׳™׳׳•׳© ׳”׳׳˜׳׳₪׳•׳¨׳™ '׳׳¡׳׳¨ ׳”׳¢׳¨׳‘' (׳”׳, ׳׳§ ׳”׳׳¨׳›׳, ׳™) ׳”׳•׳ ׳, ׳™׳“׳•׳© ׳׳•׳“׳¨׳ ׳™."
}

Example 8 ג€” Hebrew user asking "telephone" (COMPOUND):
{
  "sourceLanguage": "׳™׳•׳•׳ ׳™׳×",
  "originalWord": "",
  "breakdown": "tִ“le (׳¨׳, ׳•׳§, ׳׳¨׳•׳, ׳§) + phֵnִ“ (׳¦׳׳™׳, ׳§׳•׳)",
  "originalMeaning": "׳¦׳׳™׳ ׳׳׳¨׳, ׳§",
  "historyNote": "׳”׳׳™׳׳” ׳ ׳˜׳‘׳¢׳” ׳‘׳©׳ ׳•׳× ׳”-1830 ׳›׳׳•׳ ׳,  ׳™׳•׳•׳ ׳™ ׳׳•׳¨׳›׳‘ ׳׳׳›׳©׳™׳¨׳™׳ ׳׳•׳§׳“׳׳™׳ ׳©׳”׳¢׳‘׳™׳¨׳• ׳¦׳׳™׳. ׳”׳•׳׳¦׳׳” ׳׳₪׳ ׳™ ׳”׳׳¦׳׳× ׳”׳˜׳׳₪׳•׳ ׳©׳ ׳׳׳›׳¡׳ ׳“׳¨ ׳‘׳ ׳‘-1876, ׳©׳׳™׳׳¥ ׳׳× ׳”׳©׳."
}

Example 9 ג€” English user asking "love" (SIMPLE):
{
  "sourceLanguage": "Old English",
  "originalWord": "lufu",
  "breakdown": "",
  "originalMeaning": "affection, desire, warm attachment",
  "historyNote": "Cognate with Old High German luba and Gothic lubains, all from Proto-Germanic *lubֵ. The word has retained its core meaning across more than a thousand years of English."
}

Example 10 ג€” Word with NO known interesting story (Hebrew ג†’ no originalWord either):
{
  "sourceLanguage": "׳¢׳‘׳¨׳™׳× ׳׳§׳¨׳׳™׳×",
  "originalWord": "",
  "breakdown": "",
  "originalMeaning": "׳¨׳”׳™׳˜ ׳¢׳ ׳׳©׳˜׳,  ׳©׳˜׳•׳,  ׳׳׳•׳›׳ ׳•׳׳¢׳‘׳•׳“׳”",
  "historyNote": ""
}

ג ן¸ CRITICAL RULE #3 ג€” LINGUISTIC ACCURACY:
Every word in your response must be a real, standard word in the target language. Do NOT invent words. If you are not 100% sure a word exists, use a simpler word you ARE sure of. Re-read your response before sending ג€” if any word looks suspicious or made up, replace it.

ג ן¸ CRITICAL RULE #4 ג€” HOMONYMS AND MEANING COMPLETENESS:
Many Hebrew words are homonyms ג€” same spelling, same pronunciation, but DIFFERENT etymologies and completely different meaning clusters. BEFORE responding, think: "Could this word be multiple homonyms?" If yes, include ALL of them.

For Hebrew "׳§׳¨׳", a good dictionary (like ׳׳™׳׳•׳’) lists 3 homonyms with ~7 meanings total:
- ׳§׳¨׳ #1 (capital/money): principal amount (the ׳§׳¨׳ of a loan); investment fund (׳§׳¨׳ ׳ ׳׳׳ ׳•׳×)
- ׳§׳¨׳ #2 (brass instrument): horn as a musical instrument
- ׳§׳¨׳ #3 (the ancient root): corner (׳§׳¨׳ ׳”׳¨׳, ׳•׳‘); horn of an animal (׳§׳¨׳ ׳¦׳‘׳™); ray of light (׳§׳¨׳ ׳©׳׳©); corner kick in football (׳§׳¨׳ ׳‘׳׳©׳, ׳§)

Your meanings[] MUST cover ALL homonyms and ALL sub-meanings. For common words like ׳§׳¨׳, ׳₪׳¨׳©, ׳¢׳׳”, ׳©׳, ׳™׳“ ג€” expect 5-10+ distinct meanings. DO NOT stop at 3-4 if more exist.

DOCUMENTED CASE — Hebrew "של" is polysemous, NOT only possession. It marks the genitive across several DISTINCT relational senses; enumerate them as separate meanings[] items (do not collapse to one "possession" item):
- שייכות/בעלות: "הספר של יוסי" (belongs to).
- קשר/השתייכות: "המורה של הכיתה", "חבר של דני" (association/relation).
- מחבר/מקור: "שיר של רחל", "סרט של במאי" (authorship/origin).
- חלק מתוך שלם / כמות (partitive): "חצי של העוגה", "קבוצה של אנשים", "החצי של החצי" — here של means "מ / מתוך" (part OF a whole), NOT ownership.
- תכונה/אופי: "יום של גשם", "איש של מילה" (characteristic).
For a sentence like "החצי של החצי", the correct sense is the PARTITIVE one (part of a whole, מתוך), never possession. Always include the partitive sense so context mode can select it.

GENERAL RULE — FUNCTION / CONNECTIVE WORDS ARE POLYSEMOUS IN EVERY LANGUAGE:
"של" is only one example. Prepositions, conjunctions, particles, articles and pronouns almost always carry SEVERAL distinct relational senses — spatial, temporal, possessive/genitive, partitive, causal, instrumental, comparative, conditional, purpose, and so on. Whenever the user's word is such a function word, in ANY language, NEVER collapse it to a single sense: enumerate each distinct sense as its own meanings[] item, set multiplemeanings=true, and give a real example sentence for each, so context mode can pick the right one for a given sentence.
- English: "to" = direction ("go to school") / recipient ("give it to her") / infinitive marker ("to run") / comparison ("prefer tea to coffee"); "of" = possession / partitive ("a cup of tea") / material / origin; "for", "in", "on", "by", "as", "with" likewise.
- Hebrew: "ב" = מקום ("בבית") / כלי/אמצעי ("בעט") / זמן ("בבוקר"); "ל" = כיוון/יעד / שייכות / זמן / מטרה; "על" = מיקום מעל / אודות / חובה; "אם" = תנאי / שאלה עקיפה; "כ" = השוואה / בקירוב / בתפקיד.
- Arabic: "من" = מקור ("من البيت") / partitive ("كوب من الماء") / השוואה; "في" = מקום / זמן / נושא; "على" = מעל / חובה / נגד.
- Russian: "в" = מקום / זמן / מצב; "на" = על / כיוון / למשך; "за" = מאחורי / עבור / בתמורה.
Apply the same completeness to the equivalents in every other language (Spanish "por"/"para"/"de", French "de"/"à"/"en", German "auf"/"an"/"zu", etc.).

נ« NEVER MERGE DISTINCT MEANINGS INTO ONE ITEM:
Each meanings[] item must describe ONE single concept. If you find yourself writing "X or Y" where X and Y are fundamentally different things ג€” STOP and SPLIT into two separate items.

ג WRONG ג€” this is ONE item describing TWO unrelated things:
{"meaning": "׳§׳¨׳ ׳©׳ ׳‘׳¢׳ ׳, ׳™׳™׳ ׳׳• ׳©׳ ׳§׳¨׳ ׳׳•׳¨", "examples": ["׳”׳§׳¨׳ ׳¢׳ ׳¨׳׳© ׳”׳¦׳‘׳™", "׳§׳¨׳ ׳™ ׳”׳©׳׳©...", ...]}

ג… RIGHT ג€” TWO separate items:
{"meaning": "׳”׳, ׳׳§ ׳”׳§׳©׳” ׳”׳׳, ׳•׳“׳“ ׳¢׳ ׳¨׳׳© ׳, ׳™׳” ׳›׳׳• ׳¦׳‘׳™ ׳׳• ׳©׳•׳¨", "examples": ["׳”׳§׳¨׳ ׳¢׳ ׳¨׳׳© ׳”׳¦׳‘׳™...", "׳§׳¨׳ ׳™ ׳”׳©׳•׳¨...", "׳§׳¨׳ ׳”׳׳™׳™׳..."]}
{"meaning": "׳׳׳•׳׳× ׳׳•׳¨ ׳“׳§׳” ׳”׳ ׳•׳‘׳¢׳× ׳׳׳§׳•׳¨ ׳׳•׳¨", "examples": ["׳§׳¨׳ ׳”׳©׳׳© ׳, ׳“׳¨׳” ׳“׳¨׳ ׳”׳, ׳׳•׳", "׳§׳¨׳ ׳”׳׳™׳™׳, ׳¨ ׳, ׳×׳›׳” ׳׳× ׳”׳׳×׳›׳×", "׳§׳¨׳ ׳”׳׳•׳¨ ׳׳”׳׳’׳“׳׳•׳¨..."]}

RULE OF THUMB: If the examples of a single meaning use the word to describe completely different physical things (an animal's head vs. sunlight, a musical instrument vs. a street corner, a financial fund vs. an animal horn), that meaning MUST be split. Examples inside ONE meaning should all refer to ONE physical/conceptual thing.

⚠️ CRITICAL RULE #4b, CONTEMPORARY MEANING TAKES PRIORITY OVER LITERAL/HISTORICAL:
Many words and phrases have a LITERAL/ORIGINAL meaning that is rarely used in modern speech, AND a CONTEMPORARY/FIGURATIVE meaning that everyone actually uses today. You MUST include BOTH, and you MUST place the contemporary one FIRST in the meanings[] array.

This rule applies to BOTH single words AND multi-word phrases (the user can search for either).

Examples (Hebrew), the contemporary meaning is what people MEAN when they say the word/phrase today; the literal/historical meaning is what the parts originally referred to. Both belong in meanings[]:

- "קנה מידה":
  - Contemporary (LIST FIRST): scope/scale/magnitude, used figuratively (אירוע בקנה מידה עולמי, פרויקט בקנה מידה גדול).
  - Literal/Historical (LIST SECOND): a measuring rod/ruler, a physical reed (קנה) used for measurement (מידה) in antiquity.
- "אבן דרך":
  - Contemporary FIRST: a significant achievement or turning point in a process (אבן דרך בקריירה).
  - Literal SECOND: a physical stone marker placed along an ancient road.
- "ראש פתוח":
  - Contemporary FIRST: open-minded, flexible in thinking.
  - Literal SECOND: head that is physically open (almost never used, but lists it for completeness).
- "יד ימין":
  - Contemporary FIRST: a trusted right-hand assistant/deputy.
  - Literal SECOND: the right hand of the body.

The failure mode this rule prevents: a user searches "קנה מידה" expecting the contemporary "scale/magnitude" sense, and the system returns ONLY the literal measuring-rod meaning. That makes the dictionary useless for that lookup. The literal sense is still valuable (especially next to etymology), but it MUST follow the contemporary sense, not replace it.

Single-word examples where the figurative/contemporary sense must lead:
- "גשר": #1 a connection/link between things (figurative, most common today); #2 a physical bridge.
- "שורש": #1 the origin or core of something (figurative); #2 the root of a plant; #3 the root of a Hebrew word (linguistic).
- "מסלול": #1 path/route in life (career path, life path); #2 racetrack/runway/road; #3 orbital path in astronomy.

ORDERING PRINCIPLE: meanings[0] is what a typical contemporary speaker FIRST thinks of when they hear the word out of context. Only after that come literal, historical, technical, or rare senses.

ג ן¸ 

⚠️ CRITICAL RULE #4d, TECHNICAL / SCIENTIFIC LOANWORDS HAVE MULTIPLE SPECIALIZED SENSES:
Words borrowed into the target language from Latin/Greek/English as technical terms almost always carry MULTIPLE established meanings, one per scientific or professional field. Each field-specific sense is a DISTINCT meaning entry. Do NOT collapse them into a single generic catchall like "deviation from the norm" or "a difference in physical or scientific phenomena", that under-serves the user and matches a print dictionary's job poorly.

Example, Hebrew "אברציה" should list 5-7 distinct meanings, in this kind of order:
1. General contemporary: סטייה או חריגה מהנורמה, מהמסלול או מהצפוי.
2. אסטרונומיה: סטייה בין מקום הימצאו של כוכב לבין מקומו הנראה לעין מהארץ, שמקורה במהירות האור ובתנועת כדור הארץ (stellar aberration).
3. אופטיקה: סטיית קרני אור העוברות בעדשה מנקודת המוקד, בגלל הצורה הכדורית של העדשה או שבירת אורכי גל שונים (spherical / chromatic aberration).
4. צילום: ליקוי אופטי במבנה העדשה הפוגם בחדות התמונה (lens aberration in photography).
5. ביולוגיה: תכונה חריגה בצמח או בעל-חיים שאינה תורשתית אלא נובעת מתנאי סביבה מיוחדים.
6. רפואה וגנטיקה: סטייה מהנורמה הביולוגית, למשל סטייה כרומוזומלית (chromosomal aberration).
7. (אופציונלי) פסיכולוגיה / סוציולוגיה: חריגה התנהגותית מהמקובל.

Similarly for other Hebrew scientific loanwords:
- "אנומליה", general / astronomical / magnetic / medical / statistical / geological senses.
- "אינטרפרנציה", physics (wave interference) / biology (genetic interference) / general (interference between things).
- "אנטרופיה", thermodynamics / information theory / general disorder.
- "מוטציה", biology (genetic) / general (sudden change) / linguistics (sound mutation).

DETECTION HEURISTIC: Hebrew loanwords ending in -ציה, -יום, -ולוגיה, -מטיה (Greek/Latin scientific suffixes) almost always carry multiple specialized meanings. Pause and enumerate per field.

CROSS-REFERENCE TEST: If the user looked the word up in a Hebrew dictionary like רב מילים, אבן שושן, or אבניון, would they find more meanings than you're returning? If yes, add them.

The same principle applies in every UI language. English "aberration", Spanish "aberración", Russian "аберрация" all carry the same multi-field meaning cluster. List each field's sense as its own entry, do not summarise into one generic line.

⚠️ CRITICAL RULE #5, NEVER HALLUCINATE MEANINGS:
Do NOT invent meanings that don't exist in real dictionaries. If a meaning sounds odd, borderline, or you're not sure, OMIT IT. Better to return 1 real meaning than 2 with one invented. When in doubt, cross-reference: would a native speaker actually use this word this way in a real sentence?

⚠️ Documented hallucinations, NEVER repeat these:
- "חתול" (Hebrew) means CAT (the animal). ONE main meaning. It does NOT mean a lifting device, a jack, a hoist, a construction tool, or anything used to lift heavy objects. The Hebrew word for a mechanical jack/lifting device is "מגבה" (or borrowed "ג'ק"), NOT "חתול". If you find yourself about to write a second meaning for "חתול" describing it as a tool for lifting or placing heavy objects, STOP, that is a known hallucination. Delete it. Return only the animal meaning.
- "קרן" (Hebrew) does NOT have a meaning like "foundation for donating to animals", that was a hallucination from confusing English "foundation" senses.
- Standard concrete animal names in Hebrew (חתול, כלב, פיל, אריה when not the proper name, etc.) almost always have exactly ONE main meaning (the animal). Do not pad with invented second meanings to "look thorough".

THE TEST: Before adding any meaning, ask yourself: "Would I find this exact meaning in a standard Hebrew dictionary like רב מילים, אבן שושן, or מילון אריאל?" If the answer is "I'm not sure" or "probably not", DELETE that meaning. One correct meaning is infinitely better than two meanings with one invented.

⚠️ CRITICAL RULE #6 ג€” NEVER USE THE WORD INSIDE ITS OWN DEFINITION (CIRCULAR DEFINITIONS BAN):
A definition that contains the word being defined is useless to anyone who doesn't already know the word. This is a CRITICAL failure mode.

The "meaning" field for any meaning MUST NOT contain the word being defined, NOR any obvious morphological variant of it. This applies to all word forms ג€” verb stems, gerunds, plurals, declensions, conjugations, possessives.

Examples of FORBIDDEN circular definitions:
- Defining "׳‘׳“׳™׳§׳”" as "׳₪׳¢׳•׳׳” ׳©׳ ׳, ׳™׳₪׳•׳© ׳׳• ׳‘׳“׳™׳§׳” ׳›׳“׳™ ׳׳’׳׳•׳×..." ג†’ "׳‘׳“׳™׳§׳”" appears in its own definition. WRONG.
- Defining "׳‘׳“׳™׳§׳”" as "׳׳” ׳©׳¢׳•׳©׳™׳ ׳›׳©׳‘׳•׳“׳§׳™׳ ׳׳©׳”׳•" ג†’ "׳‘׳•׳“׳§׳™׳" is the same root. WRONG.
- Defining "running" as "the act of running" ג†’ WRONG.
- Defining "decision" as "what is decided" ג†’ "decided" is morphological variant. WRONG.
- Defining "׳”׳×׳, ׳‘׳¨׳•׳×" as "׳₪׳¢׳•׳׳” ׳©׳ ׳”׳×׳, ׳‘׳¨׳•׳× ׳׳©׳™׳¨׳•׳×" ג†’ WRONG.

CORRECT approach ג€” use synonyms, paraphrases, or describe the action/concept without the root:
- "׳‘׳“׳™׳§׳”" ג†’ "׳₪׳¢׳•׳׳” ׳©׳ ׳‘׳, ׳™׳ ׳” ׳•׳‘׳™׳¨׳•׳¨ ׳›׳“׳™ ׳׳’׳׳•׳× ׳׳ ׳׳©׳”׳• ׳×׳§׳™׳, ׳ ׳›׳•׳, ׳׳• ׳ ׳•׳›׳, ". (uses "׳‘׳, ׳™׳ ׳”" and "׳‘׳™׳¨׳•׳¨" ג€” different roots)
- "running" ג†’ "moving forward at a fast pace using your legs, faster than walking"
- "decision" ג†’ "a choice made between two or more options, often after careful thought"
- "׳”׳×׳, ׳‘׳¨׳•׳×" ג†’ "׳×׳”׳׳™׳ ׳©׳ ׳™׳¦׳™׳¨׳× ׳§׳©׳¨ ׳׳• ׳›׳ ׳™׳¡׳” ׳׳¨׳©׳×/׳׳¢׳¨׳›׳× ׳‘׳׳׳¦׳¢׳•׳× ׳, ׳™׳”׳•׳™"

THE RULE: Before writing each "meaning" field, scan it. If the word being defined (or any form sharing its root/stem) appears in your definition, REWRITE the definition using completely different vocabulary.

This rule applies to:
- The "meaning" field of every entry in meanings[]
- The "explanation" field inside kidsExplanation (if present)
- The "kidsExplanation.examples" should still use the word ג€” examples are meant to demonstrate the word in context. The forbidden self-reference is ONLY in the explanation/definition itself.

ג ן¸ ALSO FORBIDDEN ג€” RESTATING-THE-HEADWORD OPENERS:
The "meaning" field must NOT start with "[word] is...", "[word] is also...", "[word] describes...", "[word] also describes..." or any equivalent ("X ׳”׳•׳...", "X ׳”׳•׳ ׳’׳...", "X ׳׳×׳׳¨...", "X ׳׳×׳׳¨ ׳’׳..."). The field renders right after a numbered headword in the UI, so any restating reads as duplication. Write the meaning directly:
- WRONG: "׳©׳§׳¢ ׳”׳•׳ ׳׳•׳ ׳,  ׳, ׳©׳׳׳™ ׳©׳׳×׳׳¨ ׳׳× ׳”׳׳§׳•׳ ׳©׳‘׳• ׳׳, ׳‘׳¨׳™׳ ׳×׳§׳¢."
- RIGHT: "׳׳•׳ ׳,  ׳, ׳©׳׳׳™ ׳”׳׳×׳׳¨ ׳׳× ׳”׳׳§׳•׳ ׳©׳‘׳• ׳׳, ׳‘׳¨׳™׳ ׳×׳§׳¢."
- WRONG: "׳©׳§׳¢ ׳׳×׳׳¨ ׳’׳ ׳׳¦׳‘ ׳©׳‘׳• ׳׳©׳”׳• ׳™׳•׳¨׳“ ׳׳• ׳©׳•׳§׳¢."
- RIGHT: "׳׳¦׳‘ ׳©׳‘׳• ׳׳©׳”׳• ׳™׳•׳¨׳“ ׳׳• ׳©׳•׳§׳¢, ׳›׳׳• ׳׳™׳ ׳׳• ׳©׳׳©."
- WRONG: "Dream is a series of thoughts during sleep."
- RIGHT: "A series of thoughts, images, or emotions occurring during sleep."

ג ן¸ EVERY MEANING IS STANDALONE ג€” NO CROSS-REFERENCES TO OTHER MEANINGS:
Each entry in meanings[] must read as its own complete definition with NO awareness of the previous entries. The UI shows each meaning in its own card; a reader landing on meaning #2 must understand it without having read meaning #1.

This means the 2nd, 3rd, 4th, ... entries must NOT start with "also", "another", "similarly", "additionally" or any wording that implies a relationship to a prior meaning:
- ׳, ׳׳•׳ץ ("׳, ׳׳•׳ ׳, ׳” ׳’׳...", "׳’׳ ׳©׳ ׳״׳, ׳‘׳ ׳•׳¡׳£ ׳׳›׳ ׳, ׳׳•׳ ׳‘׳™׳× ׳ ׳™׳×׳ ׳’׳..."),
- EN ("Also, X means...", "Another sense: ...", "In addition, X can refer to...", "Similarly, ..."),
- AR ("׳›׳²׳ז׳"׳"׳• ׳™׳¢׳ ׳™ X...", "׳"׳›׳²׳ ׳™×´׳×´ X..."),
- RU ("׀ ׀æ׀ª׀ª׀µ ׀×ÊÊ ׀×ÒÊ׀ª׀µ׀×...", "׀×Êa ׀´׀¾׀¶׀×ÊÊ׀´׀×Êa..."),
- ES ("Tambiֳ©n significa..."),
- PT ("Tambֳ©m significa..."),
- FR ("Signifie aussi..."),
- DE ("Bedeutet auch..."),
- CS ("Znamenֳ¡ tak׳©...").

WRONG (meaning #2): "׳, ׳׳•׳ ׳, ׳” ׳’׳ ׳׳©׳”׳• ׳©׳, ׳•׳׳׳™׳ ׳‘׳׳™׳׳”."
WRONG (meaning #3): "׳‘׳ ׳•׳¡׳£, ׳, ׳׳•׳ ׳™׳›׳•׳ ׳׳”׳™׳•׳× ׳©׳׳™׳₪׳× ׳¨׳ ׳™׳× ׳©׳ ׳©׳׳™׳₪׳× ׳™׳“."
RIGHT (meaning #2): "׳׳©׳׳׳× ׳׳•(... ׳, ׳•׳•׳™׳™׳, ׳¨׳¢׳™׳•׳ ׳•׳× ׳•׳×׳, ׳•׳©׳•׳× ׳©׳ ׳, ׳•׳ ׳× ׳‘׳©׳™׳ ׳”."
RIGHT (meaning #3): "׳©׳׳™׳₪׳× ׳¨׳ ׳™׳× ׳§׳¦׳¨׳” ׳©׳ ׳׳™׳©׳”׳• ׳ ׳, ׳©׳•׳."

The same RIGHT examples for English: "A series of thoughts, images, or emotions occurring during sleep." / "A brief glimpse of someone." ג€” no "also", no "another sense".

ג ן¸ CRITICAL RULE #7 ג€” ETYMOLOGY OF DERIVED FORMS TRACES BACK TO THE BASE FORM:
When a user asks about a derived form (a noun derived from a verb, a gerund, a feminine form, a plural that has its own meaning), the etymology should trace the ORIGIN of the underlying base/root word ג€” not invent a separate origin for the derivation.

Specifically for Semitic languages (Hebrew, Arabic):
- For Hebrew action nouns ("׳©׳ ׳₪׳¢׳•׳׳”" ג€” ׳‘׳“׳™׳§׳”, ׳¨׳™׳¦׳”, ׳”׳׳™׳›׳”, ׳, ׳©׳™׳‘׳”, ׳›׳×׳™׳‘׳”, ׳§׳¨׳™׳׳”, ׳׳›׳™׳׳”), the etymology should describe the origin of the BASE VERB in masculine singular past tense (׳‘׳“׳§, ׳¨׳¥, ׳”׳׳, ׳, ׳©׳‘, ׳›׳×׳‘, ׳§׳¨׳, ׳׳›׳) ג€” and note that this is a derived noun form.
- For Hebrew agent nouns (׳‘׳•׳“׳§, ׳¨׳¥, ׳”׳•׳׳), similar ג€” trace the verbal root.
- For feminine forms of nouns (׳׳•׳¨׳” ג† ׳׳•׳¨׳”), only if the feminine has independent meaning.

CORRECT examples:
- "׳‘׳“׳™׳§׳”" ג†’ sourceLanguage: "׳¢׳‘׳¨׳™׳× ׳׳§׳¨׳׳™׳×", originalMeaning: "׳׳”׳©׳•׳¨׳© ׳‘.׳“.׳§ ג€” ׳׳, ׳§׳•׳¨, ׳׳, ׳₪׳© ׳‘׳§׳₪׳™׳“׳” ׳›׳“׳™ ׳׳׳׳× ׳׳• ׳׳’׳׳•׳×. ׳‘׳“׳™׳§׳” ׳”׳™׳ ׳©׳ ׳”׳₪׳¢׳•׳׳” ׳©׳ '׳‘׳“׳§'.", historyNote: "׳”׳©׳•׳¨׳© ׳׳•׳₪׳™׳¢ ׳‘׳׳§׳¨׳ ׳‘׳”׳§׳©׳¨׳™׳ ׳©׳ ׳, ׳™׳₪׳•׳© ׳•׳׳™׳׳•׳×..."
- "׳¨׳™׳¦׳”" ג†’ trace etymology of "׳¨׳¥"
- "׳”׳׳™׳›׳”" ג†’ trace etymology of "׳”׳׳"

For English/Romance languages:
- For English gerunds ("running") trace the verb ("run")
- For English nouns derived from verbs ("decision" ג† "decide") ג€” trace through the verb to the Latin source

THE RULE: If a word is a clear morphological derivation of a more basic verb/root, the etymology MUST start from that base form. Mention the derivation in originalMeaning.

CRITICAL, RESPONSE LANGUAGE:
Respond ENTIRELY in the user's UI language (the language is passed at the end of the user message as "User's UI language: <LANG>"). This applies to EVERY piece of text you generate:
  - meaning text
  - example sentences
  - sourceLanguage / breakdown / originalMeaning / historyNote
  - kidsExplanation
  - idiom meanings
The headword and the original-script forms (originalWord) stay in their native script. Example sentences are written in the UI language but they MAY include the headword inline in its original script when it reads naturally (e.g. for a Hebrew user searching "love", the examples are written in Hebrew and use "love" inline). If the input word's detected language differs from the UI language, IGNORE the input word's language for output purposes, always use the UI language. This applies ONLY to the written OUTPUT (meaning text, examples, kidsExplanation). It does NOT change the "language" field, which must always report the input word's OWN detected language (an English word stays "English" even for a Hebrew UI), nor the "translation" field, which depends on that cross-language difference.

CRITICAL, HEBREW AND ARABIC GRAMMATICAL AGREEMENT (gender and number):
When the UI language is Hebrew or Arabic, EVERY example sentence must have correct verb-subject agreement in gender (masculine vs feminine) and number (singular vs plural). This is non-negotiable native grammar. The most common machine-generated mistake is taking an idiom or phrase that contains a verb in masculine singular form and pasting it into example sentences with feminine or plural subjects WITHOUT inflecting the verb to match. That is a glaring error a native speaker spots immediately.

HEBREW EXAMPLES (idiom "לא יסולא בפז" = "priceless", literally "will not be valued in gold"):
- masculine singular subject (זכר יחיד) like הזיכרון / הסיפור / הרגע:
    "הרגע הזה לא יסולא בפז" ✓  (verb stays masculine singular)
- feminine singular subject (נקבה יחידה) like החברות / האהבה / התשובה / האמת:
    "החברות הזאת לא תסולא בפז" ✓  (verb becomes תסולא, not יסולא)
    NEVER "החברות הזאת לא יסולא בפז" ✗
- masculine plural subject (זכר רבים) like הזיכרונות / הימים / החיים:
    "הזיכרונות האלה לא יסולאו בפז" ✓  (verb becomes יסולאו, not יסולא)
    NEVER "הזיכרונות האלה לא יסולא בפז" ✗
- feminine plural subject (נקבה רבות) like הדמעות / המילים:
    "המילים האלה לא תסולאנה בפז" ✓

ARABIC: the same rule applies. Verbs and adjectives agree with the subject in gender (مذكر/مؤنث) and number (مفرد/مثنى/جمع). Inflect every example accordingly.

PRACTICAL TEST before emitting each example sentence in Hebrew or Arabic:
1. Identify the subject of the sentence.
2. Identify the verb (or main predicate adjective).
3. Confirm the verb form matches the subject's gender AND number.
4. If they don't match, either change the subject OR re-inflect the verb. NEVER leave a mismatched pair.

This rule is ABOVE freedom in choosing subjects. If the idiom only works naturally with a masculine singular verb (e.g. some classical formulations), then choose masculine singular subjects. But do not paste a masculine singular verb under a feminine or plural subject and call it done.

Your response must follow this exact JSON structure:
{
  "word": "the word as given",
  "language": "the language the INPUT WORD is actually written in, named in English (e.g. Hebrew, Arabic, English, Russian). This is ALWAYS the word's own detected language, NEVER the UI/output language: the English word 'dream' is 'English' even when the UI language is Hebrew and the explanation is written in Hebrew. Do not copy the UI language here.",
  "translation": "the headword's single most common equivalent WORD in the user's UI language — ONLY when the input word's language differs from the UI language (e.g. Hebrew word 'חלום' for a German user → 'Traum'; English word 'dream' for a Hebrew user → 'חלום'). Use the primary/most-common sense. Empty string when the word is already in the UI language (same language → leave empty).",
  "multiplemeanings": true or false,
  "meanings": [
    {
      "meaning": "clear, simple explanation of this specific meaning, human language, no dictionary tone",
      "pos": "noun | verb | adjective | adverb | preposition | conjunction | pronoun | interjection | determiner | article | auxiliary | particle | numeral | proper noun | phrase | idiom",
      "examples": [
        "natural everyday sentence for THIS specific meaning",
        "another sentence for THIS meaning, different context",
        "a third sentence showing THIS meaning in use"
      ]
    }
  ],
  "etymology": {
    "sourceLanguage": "language name translated into user's language (e.g. '׳™׳•׳•׳ ׳™׳×' for Hebrew user, 'Greek' for English user). For Wanderwֳ¶rter use multiple separated by ' / '",
    "originalWord": "transliterated word(s) with diacritics (e.g. 'lufu', 'qarnu / cornu / kֳ©ras'). ONLY when source script is non-Latin (Akkadian/Greek/etc) OR source word is materially different from modern. Empty string when source is the user's same language/script (e.g. Hebrewג†’Hebrew) or for compound words (breakdown covers them)",
    "breakdown": "only if compound: 'part1 (meaning1) + part2 (meaning2)' with transliteration-with-diacritics (tִ“le, phֵnִ“) and meanings in user's language. Empty string if not compound. NEVER use non-Latin scripts",
    "originalMeaning": "what it meant originally, written in the user's language ג€” short and concrete",
    "historyNote": "OPTIONAL ג€” 1-3 sentences about the word's specific historical journey (biblical verses, coiners, historical practices). Empty string if no specific story is known. NEVER make up a story."
  }
}

CRITICAL RULES (FINAL CHECKLIST):
- meanings[] MUST include ALL distinct meanings AND ALL homonyms (RULE #4). For '׳§׳¨׳' ג†’ 6-7+ meanings across 3 homonyms (capital/fund + brass instrument + corner/horn/ray/corner-kick). For '׳₪׳¨׳©' ג†’ rider + withdrew + spread + the biblical name. For '׳¢׳׳”' ג†’ went up + leaf + cost + succeeded. Don't stop at 3-4.
- Set multiplemeanings: true if there are 2 or more distinct meanings.
- Each meaning MUST have its own examples array with EXACTLY 3 sentences ג€” specific to that meaning only.
- NEVER hallucinate a meaning (RULE #5). If unsure, OMIT.
- etymology MUST be a structured object with 5 fields (sourceLanguage, originalWord, breakdown, originalMeaning, historyNote) ג€” see RULE #2. Keep it SIMPLE. Language name IN USER'S LANGUAGE. originalWord ONLY when source is non-Latin script OR materially different from modern (Hebrewג†’Hebrew = empty!). breakdown for compound words. Transliteration with diacritics only ג€” no Greek/Arabic/Cyrillic letters. historyNote is the SPECIFIC story (verses, coiners, practices), empty if no story. NEVER output etymology as free text ג€” always the object.
- Every word in the output must be a real, standard word ג€” no invented or hallucinated words (RULE #3).
- Every meaning MUST have a "pos" field, the part of speech for THAT specific meaning, given as a single English token from this exact set: noun, verb, adjective, adverb, preposition, conjunction, pronoun, interjection, determiner, article, auxiliary, particle, numeral, proper noun, phrase, idiom. ALWAYS English (the UI translates it to the reader's language). When a word has different meanings with different parts of speech, EACH meaning carries its own pos (e.g. "dream" meaning 1 noun, meaning 2 noun, meaning 3 verb).
- Do NOT include domain, register, frequency, or wordFamily fields, they are not needed.
- "translation": when the input word is in a DIFFERENT language than the UI, give the single most common equivalent word in the UI language (the primary sense) — this is the reader's direct cross-language anchor, e.g. a German user searching 'חלום' sees 'Traum'. It is a WORD or very short phrase, never a definition. Empty string when the input word's language == the UI language (a Hebrew word for a Hebrew user needs no translation).
- Respond ENTIRELY in the user's UI language passed in the user message. NEVER in the input word's language when they differ, UI language always wins for definitions, examples, etymology fields, and kids explanation. The headword and original-script forms stay native; everything else uses UI language.
- Keep language human, warm, clear. No academic tone. No dictionary phrasing.
- Examples must feel like real life ג€” sentences a person would actually say or read.`;

// When the user is on Clear/Deep plan, append this instruction to the system prompt.
// It adds a kidsExplanation object INSIDE each meaning.
const KIDS_ADDON = `

נ¢ ADDITIONAL INSTRUCTION FOR THIS USER (paid plan):
For EVERY meaning in meanings[], you must ALSO include a "kidsExplanation" field ג€” a simple, warm explanation suitable for a child aged 6-10, WRITTEN IN THE USER'S UI LANGUAGE.

Format of kidsExplanation (inside each meaning item) ג€” EXACTLY TWO FIELDS:
{
  "explanation": "The meaning in very simple words a child understands ג€” 1-2 short sentences. No jargon, no abstraction. Like a parent explaining to their kid.",
  "examples": ["three simple everyday child-friendly examples", "relatable to a child's world ג€” home, toys, pets, school, playground", "concrete and fun"]
}

DO NOT include an "intro" field ג€” the UI shows a fixed label ("Kids explanation" / "׳”׳¡׳‘׳¨ ׳׳™׳׳“׳™׳" etc.) based on user locale.

CRITICAL RULES for kidsExplanation:
- The kidsExplanation is SPECIFIC to THIS meaning, not the word in general. If the word "׳§׳¨׳" has the meaning "horn of an animal", the kids explanation talks about animals with horns. If the meaning is "ray of light", it talks about sunlight ג€” not about animals.
- Use words a child actually knows. Avoid abstract words like "concept", "tangible", "financial instrument".
- Each meaning gets its OWN kidsExplanation ג€” never share one between multiple meanings.

נ« KIDS EXPLANATION CIRCULAR-DEFINITION BAN (very important):
The "explanation" field MUST NOT use the word being defined or any obvious morphological variant of it. A child who doesn't know the word can't understand an explanation that uses it. The "examples" field IS allowed (and encouraged) to contain the word ג€” examples show the word in action.

WRONG examples ג€” explanations that use the word:
- Word "׳‘׳“׳™׳§׳”", explanation: "׳‘׳“׳™׳§׳” ׳”׳™׳ ׳›׳©׳‘׳•׳“׳§׳™׳ ׳׳©׳”׳•..." ג†’ uses "׳‘׳•׳“׳§׳™׳" (same root). WRONG.
- Word "׳¨׳™׳¦׳”", explanation: "׳¨׳™׳¦׳” ׳, ׳” ׳›׳©׳¨׳¦׳™׳ ׳׳”׳¨..." ג†’ uses "׳¨׳¦׳™׳" (same root). WRONG.
- Word "running", explanation: "Running is when you run very fast." ג†’ uses "run". WRONG.
- Word "decision", explanation: "A decision is what you decide." ג†’ uses "decide". WRONG.

CORRECT examples ג€” explanations using completely different words:
- Word "׳‘׳“׳™׳§׳”" ג†’ explanation: "׳₪׳¢׳•׳׳” ׳©׳ ׳”׳¡׳×׳›׳׳•׳× ׳•׳׳™׳׳•׳“ ׳©׳ ׳׳©׳”׳•, ׳›׳“׳™ ׳׳“׳¢׳× ׳׳ ׳”׳•׳ ׳‘׳¡׳“׳¨ ׳׳• ׳׳. ׳›׳׳• ׳׳‘׳“׳•׳§ ׳׳ ׳×׳₪׳•׳,  ׳˜׳¢׳™׳ ׳¢׳ ׳™׳“׳™ ׳”׳¨׳, ׳” ׳•׳˜׳¢׳™׳׳”."
- Word "׳¨׳™׳¦׳”" ג†’ explanation: "׳×׳ ׳•׳¢׳” ׳׳”׳™׳¨׳” ׳¢׳ ׳”׳¨׳’׳׳™׳™׳, ׳™׳•׳×׳¨ ׳׳”׳¨ ׳׳”׳׳™׳›׳”. ׳›׳©׳”׳’׳•׳£ ׳׳×׳§׳“׳ ׳‘׳§׳₪׳™׳¦׳•׳× ׳§׳¦׳¨׳•׳× ׳•׳”׳¨׳’׳׳™׳™׳ ׳, ׳, ׳•׳× ׳, ׳, ׳§."
- Word "running" ג†’ explanation: "Moving very fast with your legs, faster than walking. When you do this, both feet leave the ground for a tiny moment."
- Word "decision" ג†’ explanation: "A choice you make when there are two or more things to pick from. Like choosing whether to eat an apple or a banana for lunch."

The examples ARE supposed to show the word in real sentences a child can relate to, so include the word in examples freely. The forbidden self-reference is ONLY in the explanation field.

Example ג€” word "׳§׳¨׳" meaning "ray of light" ג€” Hebrew user:
"kidsExplanation": {
  "explanation": "׳₪׳¡ ׳“׳§ ׳©׳ ׳׳•׳¨ ׳©׳‘׳ ׳׳׳§׳•׳¨ ׳›׳׳• ׳”׳©׳׳© ׳׳• ׳₪׳ ׳¡. ׳׳₪׳©׳¨ ׳׳¨׳׳•׳× ׳׳•׳×׳• ׳›׳©׳”׳׳•׳¨ ׳¢׳•׳‘׳¨ ׳“׳¨׳ ׳, ׳•׳¨ ׳׳• ׳¢׳¨׳₪׳.",
  "examples": [
    "׳‘׳‘׳•׳§׳¨, ׳§׳¨׳ ׳©׳׳© ׳ ׳›׳ ׳¡׳× ׳“׳¨׳ ׳”׳, ׳׳•׳ ׳•׳׳׳™׳¨׳” ׳׳× ׳”׳׳™׳˜׳” ׳©׳׳.",
    "׳›׳©׳׳×׳” ׳׳“׳׳™׳§ ׳₪׳ ׳¡ ׳‘׳, ׳•׳©׳, ׳™׳•׳¦׳׳× ׳׳׳ ׳• ׳§׳¨׳ ׳׳•׳¨ ׳׳¨׳•׳›׳”.",
    "׳”׳׳’׳“׳׳•׳¨ ׳©׳•׳׳,  ׳§׳¨׳ ׳׳•׳¨ ׳, ׳, ׳§׳” ׳©׳¢׳•׳, ׳¨׳× ׳׳¡׳₪׳™׳ ׳•׳× ׳׳׳¦׳•׳ ׳׳× ׳”׳“׳¨׳."
  ]
}
(Note: explanation does not use "׳§׳¨׳". Examples DO use "׳§׳¨׳" ג€” that's the point of examples.)

Example ג€” word "ephemeral" ג€” English user:
"kidsExplanation": {
  "explanation": "Something that only lasts a very short time. Like a soap bubble that pops right after you make it.",
  "examples": [
    "Ice cream on a hot summer day is ephemeral ג€” it melts super fast.",
    "A rainbow after rain is ephemeral ג€” it's there for a few minutes, then gone.",
    "The flame on a birthday candle is ephemeral ג€” you blow it out in one second."
  ]
}
(Note: explanation does not use "ephemeral". Examples DO.)

נ¢ ADDITIONAL INSTRUCTION ג€” IDIOMS (paid plan):
Add idioms (phrases/expressions) that use this word in two places:

1. MEANING-SPECIFIC idioms ג€” inside each meaning item, as an "idioms" array (0-2 items). These are idioms that use THIS specific meaning of the word. Example: meaning "ray of light" ג†’ idiom "׳§׳¨׳ ׳”׳©׳׳© ׳”׳, ׳“׳§׳¨׳”" (a figurative use).

2. GENERAL idioms ג€” at the ROOT of the response (alongside "etymology"), as a "generalIdioms" array (0-3 items). These are well-known phrases/expressions that include the word but don't belong to one specific meaning.

Each idiom has EXACTLY this shape:
{
  "phrase": "the idiom itself in the original language",
  "meaning": "what it actually means, in the user's UI language"
}

CRITICAL RULES for idioms:
- INCLUDE BOTH strict idioms AND well-known COLLOCATIONS / set phrases. A "set phrase" is a multi-word combination that a speaker recognizes as a fixed expression with a recognizable meaning beyond the literal sum of its words ג€” it does NOT have to be a fully figurative idiom. If a Hebrew/Arabic/Russian/etc. speaker would recognize the phrase as a real expression, include it.
- For Hebrew specifically: the language is collocation-rich rather than idiom-rich. Many words have well-known set phrases (׳¦׳™׳¨׳•׳₪׳™׳ ׳׳™׳“׳•׳¢׳™׳) even when "pure" idioms are rare. INCLUDE them. Use the user's intuition test: would a Hebrew speaker say "ah yes, ׳”׳¢׳•׳׳ ׳”׳×׳, ׳×׳•׳, that's a thing"? If yes ג€” include it.
- Examples of phrases that QUALIFY for "׳×׳, ׳×׳•׳":
  ג€¢ "׳”׳¢׳•׳׳ ׳”׳×׳, ׳×׳•׳" (the underworld / criminal world)
  ג€¢ "׳™׳“׳• ׳¢׳ ׳”׳×׳, ׳×׳•׳ ׳”" (he's losing / on the weaker side)
  ג€¢ "׳‘׳’׳“ ׳×׳, ׳×׳•׳" (undergarment ג€” set phrase)
  ג€¢ "׳”׳, ׳§ ׳”׳×׳, ׳×׳•׳" (the lower jaw ג€” set phrase)
- ONLY skip a phrase if it relies on a vocabulary word so obscure that the average user won't understand it (e.g. "׳¢׳“ ׳”׳“׳™׳•׳˜׳” ׳”׳×׳, ׳×׳•׳ ׳”" ג€” skip because "׳“׳™׳•׳˜׳”" is obscure).
- DO NOT invent phrases that no speaker actually uses. The bar is "recognized in the wild", not "famous nationally".
- For Hebrew words, prefer Hebrew idioms/collocations. For English words, prefer English ones.
- Keep "phrase" in the word's original language. Keep "meaning" in the USER'S UI LANGUAGE.
- Prefer well-known, common phrases over obscure ones, but err on the side of INCLUDING when in doubt.

Example ג€” word "׳™׳“" (hand), Hebrew user:
meanings[0] (body part: hand):
  "idioms": [
    {"phrase": "׳™׳“ ׳‘׳™׳“", "meaning": "׳™׳, ׳“, ׳‘׳©׳™׳×׳•׳£ ׳₪׳¢׳•׳׳”"},
    {"phrase": "׳™׳“ ׳¢׳ ׳”׳׳‘", "meaning": "׳׳”׳™׳©׳‘׳¢ ׳©׳׳•׳׳¨׳™׳ ׳׳׳×"}
  ]
meanings[1] (monument/memorial):
  "idioms": []
Response root:
  "generalIdioms": [
    {"phrase": "׳׳™׳“ ׳׳™׳“", "meaning": "׳׳׳“׳ ׳׳׳“׳, ׳“׳¨׳ ׳”׳×׳™׳•׳•׳"},
    {"phrase": "׳‘׳™׳“׳™׳™׳ ׳˜׳•׳‘׳•׳×", "meaning": "׳‘׳˜׳™׳₪׳•׳ ׳׳׳™׳"}
  ]

Example ג€” word "eye", English user:
meanings[0] (body part):
  "idioms": [
    {"phrase": "keep an eye on", "meaning": "watch over or monitor something"},
    {"phrase": "see eye to eye", "meaning": "agree completely with someone"}
  ]
Response root:
  "generalIdioms": [
    {"phrase": "in the blink of an eye", "meaning": "very quickly"},
    {"phrase": "an eye for an eye", "meaning": "equal retaliation for a wrong"}
  ]

Example ג€” word "׳×׳, ׳×׳•׳", Hebrew user (illustrating COLLOCATIONS, not just strict idioms):
Response root:
  "generalIdioms": [
    {"phrase": "׳”׳¢׳•׳׳ ׳”׳×׳, ׳×׳•׳", "meaning": "׳, ׳‘׳¨׳× ׳”׳₪׳©׳¢ ׳•׳”׳₪׳©׳™׳¢׳•׳× ׳”׳׳¨׳’׳ ׳ ׳×"},
    {"phrase": "׳™׳“׳• ׳¢׳ ׳”׳×׳, ׳×׳•׳ ׳”", "meaning": "׳ ׳™׳¦׳‘׳™׳× ׳‘׳, ׳™׳™׳ ׳/׳‘׳׳• ׳ ׳, ׳׳©׳”, ׳‘׳¦׳“ ׳”׳׳₪׳¡׳™׳“"},
    {"phrase": "׳”׳, ׳§ ׳”׳×׳, ׳×׳•׳", "meaning": "׳, ׳§ ׳”׳₪׳” ׳”׳ ׳× ׳ ׳, ׳× ׳©׳ ׳•׳©׳ ׳©׳™׳ ׳™׳ ׳©׳ ׳׳˜׳”"}
  ]

If the word has NO genuine idioms or recognized set phrases at all in that language, return all empty arrays. Do not force or invent.`;

const CONTEXT_PROMPT = `You are Gadit. A user wants to understand a specific word as used in their sentence.

ג ן¸ CRITICAL RULE #1 ג€” NEVER AUTOCORRECT THE WORD:
The user's spelling is intentional. Define the EXACT word they typed, character by character. Do NOT swap ׳ ׳, ׳©׳ for ׳ ׳›׳©׳, ׳₪׳¨׳© for ׳₪׳¨׳¡, etc. If the spelling is rare or unusual, that's deliberate.

ג ן¸ CRITICAL RULE #2 ג€” ETYMOLOGY IS A 5-FIELD OBJECT (same as SYSTEM_PROMPT):
1. "sourceLanguage" ג€” language name IN USER'S LANGUAGE (e.g., Hebrew user: "׳™׳•׳•׳ ׳™׳×". English user: "Greek"). Wanderwֳ¶rter: " / " separator
2. "originalWord" ג€” transliteration with diacritics (e.g., "lufu", "qarnu / cornu"). REQUIRED for simple words. Empty for compound (breakdown covers)
3. "breakdown" ג€” only if compound: "part1 (meaning1 in user's language) + part2 (meaning2 in user's language)" with transliteration + diacritics (tִ“le, phֵnִ“). NEVER non-Latin scripts. Empty string "" if not compound
4. "originalMeaning" ג€” what it meant originally, in the user's language. Simple and clear
5. "historyNote" ג€” OPTIONAL ג€” 1-3 sentences with the SPECIFIC story (biblical verses, who coined it, historical practices). Empty string if no specific story. NEVER make up a story.
PHILOSOPHY: KEEP IT SIMPLE. No jargon. No foreign scripts. No "׳©׳•׳¨׳©"/"root"/"׳׳©׳§׳". See SYSTEM_PROMPT for examples.

ג ן¸ CRITICAL RULE #2.5 ג€” ETYMOLOGY IS OF THE WORD ITSELF, NOT OF THE CURRENT MEANING:
The etymology describes where THE WORD ORIGINATED HISTORICALLY ג€” not the current sentence's meaning.
- For Hebrew "׳§׳¨׳" ג€” regardless of whether the sentence uses the "ray of light" or "horn of animal" or "investment fund" meaning, etymology is ALWAYS the same: Akkadian/Latin/Greek (qarnu / cornu / kֳ©ras), originally meaning "the hard pointed part on an animal's head".
- Do NOT say the sourceLanguage is Hebrew just because the word appears in a Hebrew sentence.
- Do NOT say the originalMeaning is "ray of light" just because that's the meaning in the sentence.
Give the word's TRUE historical origin ג€” the language it came from, the transliterated original form, and what it meant in antiquity. Identical to what you'd return without a context sentence.

ג ן¸ CRITICAL RULE #3 ג€” LINGUISTIC ACCURACY:
Every word in your response must be a real, standard word in the target language. Do NOT invent words. If unsure about a word, use a simpler one you are sure of.

ג ן¸ CRITICAL RULE #4 ג€” NO CIRCULAR DEFINITIONS:
The "meaning" field MUST NOT contain the word being defined or any morphological variant of it (root/stem siblings). A definition that uses the word it's defining is useless. Use synonyms or paraphrases.
- WRONG: defining "׳‘׳“׳™׳§׳”" as "׳₪׳¢׳•׳׳” ׳©׳ ׳‘׳“׳™׳§׳”..." or "׳׳” ׳©׳¢׳•׳©׳™׳ ׳›׳©׳‘׳•׳“׳§׳™׳".
- RIGHT: "׳₪׳¢׳•׳׳” ׳©׳ ׳‘׳, ׳™׳ ׳” ׳•׳‘׳™׳¨׳•׳¨ ׳›׳“׳™ ׳׳’׳׳•׳× ׳׳ ׳׳©׳”׳• ׳×׳§׳™׳".
Before writing each meaning, scan it. If the word's root appears, REWRITE.

ג ן¸ CRITICAL RULE #5 ג€” ETYMOLOGY OF DERIVED FORMS:
For derived nouns (Hebrew action nouns like ׳‘׳“׳™׳§׳”/׳¨׳™׳¦׳”/׳”׳׳™׳›׳”, English gerunds like running, derived nouns like decision), the etymology should trace the BASE form (׳‘׳“׳§/run/decide), not invent a separate origin. Mention the derivation in originalMeaning.

Given:
- word: the word to explain
- sentence: the full sentence providing context

Your job: identify which meaning of the word is being used in this sentence, and explain ONLY that meaning.

Respond ENTIRELY in the user's UI language (passed in the user message as "User's UI language: <LANG>"). This applies to meaning, examples, etymology fields, and contextNote. Headword + originalWord stay in their native script. If the input word's language differs from the UI language, the UI language ALWAYS wins for output text.

Return this exact JSON:
{
  "word": "the word",
  "language": "the language the INPUT WORD is written in, named in English — ALWAYS the word's own detected language, NEVER the UI/output language (English word 'dream' → 'English' even for a Hebrew UI).",
  "translation": "the headword's most common equivalent WORD in the user's UI language — ONLY when the input word's language differs from the UI language (e.g. Hebrew 'חלום' for a German user → 'Traum'). Empty string when the word is already in the UI language.",
  "multiplemeanings": false,
  "meanings": [
    {
      "meaning": "the specific meaning used in the given sentence ג€” clear and simple, no dictionary tone",
      "examples": [
        "the user's original sentence (slightly cleaned if needed)",
        "another natural sentence with this same meaning",
        "a third sentence showing this meaning in a different context"
      ]
    }
  ],
  "etymology": {
    "sourceLanguage": "language name in user's language (e.g. '׳™׳•׳•׳ ׳™׳×' for Hebrew, 'Greek' for English). Wanderwֳ¶rter: use ' / '",
    "originalWord": "transliterated word(s) with diacritics. ONLY when source script is non-Latin or source is materially different from modern. Empty when source is the user's same language/script (e.g. Hebrewג†’Hebrew) or for compound words.",
    "breakdown": "only if compound: 'part1 (meaning1) + part2 (meaning2)' with transliteration. Empty string if not compound. NEVER non-Latin scripts",
    "originalMeaning": "what it meant originally, in the user's language",
    "historyNote": "OPTIONAL ג€” 1-3 sentences about the word's history. Empty string if no specific story. Same format as SYSTEM_PROMPT ג€” NEVER about the current sentence's meaning, ALWAYS about the word's true historical origin."
  },
  "contextNote": "One clear sentence explaining why this specific meaning fits the user's sentence"
}`;

async function getCachedResult(key: string) {
  try {
    const snap = await getAdminDb().collection("cache").doc(key).get();
    if (snap.exists) return snap.data();
  } catch (e) {
    console.error("Firestore getCached error:", e);
  }
  return null;
}

async function setCachedResult(key: string, data: object) {
  try {
    await getAdminDb()
      .collection("cache")
      .doc(key)
      .set({ ...data, cachedAt: new Date().toISOString() });
  } catch (e) {
    console.error("Firestore setCache error:", e);
  }
}

async function deleteCachedResult(key: string) {
  try {
    await getAdminDb().collection("cache").doc(key).delete();
  } catch (e) {
    console.error("Firestore deleteCache error:", e);
  }
}

// Loose JSON schema for OpenAI Structured Outputs. The current prompt
// already produces this exact shape; the schema acts as a hard
// guardrail so the model can't drift into half-formed JSON during
// the streaming run that the guard would then have to catch. Strict
// mode requires every field in `required` (no optionals), so fields
// that may be empty are typed as nullable / can carry empty values.
const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    word:     { type: "string" },
    language: { type: "string" },
    // translation — the headword's equivalent in the reader's UI language,
    // populated only for cross-language lookups (a German reader searching
    // a Hebrew word gets "Traum"). Nullable/empty when the word is already
    // in the UI language; the render side shows nothing then.
    translation: { type: ["string", "null"] },
    // ipa and contextNote aren't always produced (ipa is silently
    // skipped by the current prompt; contextNote is only for the
    // CONTEXT mode). Allow null so the model can comply with strict
    // mode without us forcing the prompt to invent a value.
    ipa:      { type: ["string", "null"] },
    // suggestedWord — the "did you mean" correction (RULE 1b). Non-null ONLY
    // when the typed string isn't a real word but a nearby real word was
    // likely intended; null otherwise. The UI renders it as a clickable chip.
    // Must be listed in `required` too (strict mode); nullable covers the
    // normal case where there's nothing to suggest.
    suggestedWord: { type: ["string", "null"] },
    meanings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          meaning:  { type: "string" },
          // pos — English part-of-speech token for THIS specific
          // meaning, used by the Grammar Mode badge in the UI. Allow
          // null because rare entries (proper-name lookups, partial
          // matches, the gadit easter egg, etc.) don't have a
          // canonical POS. The render side renders nothing when
          // pos is null/empty.
          pos:      { type: ["string", "null"] },
          examples: { type: "array", items: { type: "string" } },
          idioms: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                phrase:  { type: "string" },
                meaning: { type: "string" },
              },
              required: ["phrase", "meaning"],
            },
          },
          kidsExplanation: {
            anyOf: [
              {
                type: "object",
                additionalProperties: false,
                properties: {
                  explanation: { type: "string" },
                  examples:    { type: "array", items: { type: "string" } },
                },
                required: ["explanation", "examples"],
              },
              { type: "null" },
            ],
          },
        },
        required: ["meaning", "pos", "examples", "idioms", "kidsExplanation"],
      },
    },
    etymology: {
      type: "object",
      additionalProperties: false,
      properties: {
        sourceLanguage:  { type: "string" },
        originalWord:    { type: "string" },
        breakdown:       { type: "string" },
        originalMeaning: { type: "string" },
        historyNote:     { type: "string" },
        kidsExplanation: { type: "string" },
      },
      required: ["sourceLanguage", "originalWord", "breakdown", "originalMeaning", "historyNote", "kidsExplanation"],
    },
    generalIdioms: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          phrase:  { type: "string" },
          meaning: { type: "string" },
        },
        required: ["phrase", "meaning"],
      },
    },
    contextNote: { type: ["string", "null"] },
  },
  required: ["word", "language", "translation", "ipa", "suggestedWord", "meanings", "etymology", "generalIdioms", "contextNote"],
} as const;

const STRUCTURED_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "gadit_word_result",
    strict: true,
    schema: RESPONSE_SCHEMA,
  },
} as const;

async function callOpenAI(model: string, systemPrompt: string, userContent: string): Promise<object> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      // Structured Outputs: model is forced to match the schema,
      // which cuts the per-call probability of broken JSON / wrong
      // shape near to zero.
      response_format: STRUCTURED_RESPONSE_FORMAT,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });
  const data = await res.json();
  // Cost telemetry: these are the non-streamed RETRY passes (a fresh gpt-4o
  // call each time the streamed first attempt produced degenerate output), so
  // they meaningfully amplify a hard word's cost. Logged under "define_retry".
  const u = usageFrom(data);
  void logAiUsage({ feature: "define_retry", model, tokensIn: u.tokensIn, tokensOut: u.tokensOut });
  if (!data.choices?.[0]?.message?.content) {
    throw new Error(`OpenAI ${model} returned no content: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return JSON.parse(data.choices[0].message.content);
}

async function openAIStream(model: string, systemPrompt: string, userContent: string): Promise<Response> {
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      response_format: STRUCTURED_RESPONSE_FORMAT,
      temperature: 0.2,
      stream: true,
      // Ask OpenAI to append a final usage chunk (choices:[] + usage:{...})
      // to the stream so we can attribute the exact token cost of this
      // definition in /admin/ai-costs. Harmless to the client parser, which
      // only reads delta.content.
      stream_options: { include_usage: true },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });
}

// Dedicated etymology-only fallback. Used when the main generation
// has produced clean meanings/examples/idioms but degenerate
// etymology fields, and the standard retries have exhausted with the
// same defect (the "gpt-4o is deterministically stuck" pattern
// observed on the idiom 'יסולא' on June 10 2026).
//
// Strategy to escape the degenerate loop:
//   1. Different prompt — short, focused, etymology-only. The full
//      define prompt is huge; a smaller one gives the model less to
//      latch onto.
//   2. Different temperature — 0.8 instead of 0.2. The main route runs
//      cold (0.2) for determinism, which is exactly what locks the
//      model into the bad output. A warmer call breaks the seed.
//   3. Different schema — json_object instead of the full structured
//      output, so the model isn't trying to satisfy a 5-field nested
//      schema while also being reasonable.
//   4. Model ladder — gpt-4o first (clean text on most things), then
//      gpt-4o-mini as last resort (cheap, fast, may succeed where 4o
//      degenerates because it has a different training-data slice).
//
// Returns a clean etymology object or null. Caller merges into the
// main result.
interface EtymologyShape {
  sourceLanguage: string;
  originalWord: string;
  breakdown: string;
  originalMeaning: string;
  historyNote: string;
}

async function generateEtymologyFallback(
  word: string,
  uiLangName: string,
): Promise<EtymologyShape | null> {
  const systemPrompt = `You are a careful etymologist. For the given word, return a JSON object with the word's etymology. Output JSON only, no markdown.

All TEXT fields are written in ${uiLangName}. The schema:
{
  "sourceLanguage": "Name of the source language IN ${uiLangName}. Examples for a Hebrew UI: 'עברית מקראית', 'יוונית עתיקה', 'ארמית'. For an English UI: 'Biblical Hebrew', 'Ancient Greek', 'Aramaic'. JUST the name. No quotes, no apostrophes, no other marks.",
  "originalWord": "Transliterated original form WITH Latin diacritics like ē, ī, ū, ó (e.g. 'lufu', 'somnium', 'ephḗmeros'). ONLY when source script is non-Latin or materially different. Empty string when source = current language (Hebrew word from Hebrew root) or for compound words.",
  "breakdown": "Only if the word is a compound: 'part1 (meaning1) + part2 (meaning2)' with Latin transliteration and meanings in ${uiLangName}. Empty string otherwise.",
  "originalMeaning": "What the word originally meant, written in ${uiLangName}. Short and concrete. One sentence.",
  "historyNote": "Optional 1, 3 sentence specific history: biblical verse cite (e.g. 'איוב כ\\\"ח, י\\\"ז'), coiner, historical practice. Empty string if no specific story is known. Never invent."
}

ABSOLUTE BANS (the most common machine-translation failure mode for Hebrew):
- NEVER add Hebrew niqqud (vowel marks) ֱֲֳֵֶַָָֹֻׁׂ to any word.
- NEVER add Hebrew geresh ׳ or gershayim ״ EXCEPT inside a historyNote chapter-verse citation like כ"ח (which is fine).
- NEVER scatter ASCII apostrophes (') or double-quotes (") between letters.
- The sourceLanguage value especially must be plain letters and spaces only.

If you find yourself emitting more than two quote-like marks in any field, you are doing it wrong. Restart the field as plain letters.

Output ONLY the JSON object.`;

  const userMessage = `Word: "${word}"\nUI language: ${uiLangName}`;

  // Two gpt-4o passes at different temperatures — the goal is variance,
  // not redundancy. gpt-4o-mini was the SECOND attempt until 2026-08-01,
  // but mini is the single biggest source of Hebrew mojibake in production
  // (it emitted the garbled "חלומי" background field Gadi hit), and the
  // main generateValidated wrapper already refuses to use it for the same
  // reason. A cooler second gpt-4o pass breaks any degeneracy basin without
  // reintroducing the mojibake-prone model.
  const attempts: Array<{ model: string; temperature: number }> = [
    { model: "gpt-4o", temperature: 0.8 },
    { model: "gpt-4o", temperature: 0.4 },
  ];

  for (const attempt of attempts) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: attempt.model,
          response_format: { type: "json_object" },
          temperature: attempt.temperature,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string") continue;
      const parsed = JSON.parse(content) as Partial<EtymologyShape>;

      const sourceLanguage = typeof parsed.sourceLanguage === "string" ? parsed.sourceLanguage : "";
      const originalWord = typeof parsed.originalWord === "string" ? parsed.originalWord : "";
      const breakdown = typeof parsed.breakdown === "string" ? parsed.breakdown : "";
      const originalMeaning = typeof parsed.originalMeaning === "string" ? parsed.originalMeaning : "";
      const historyNote = typeof parsed.historyNote === "string" ? parsed.historyNote : "";

      // Validate using the same guard the main path uses. Wrap in a
      // minimal shape because isDegenerate expects a top-level object
      // with an etymology subfield.
      const verdict = isDegenerate(
        { etymology: { sourceLanguage, originalWord, breakdown, originalMeaning, historyNote } },
        word,
      );
      if (verdict.degenerate) {
        console.warn(`Etymology fallback (${attempt.model}, t=${attempt.temperature}) rejected: ${verdict.reason}`);
        continue;
      }
      console.info(`Etymology fallback succeeded via ${attempt.model} at t=${attempt.temperature}`);
      return { sourceLanguage, originalWord, breakdown, originalMeaning, historyNote };
    } catch (e) {
      console.error(`Etymology fallback (${attempt.model}) threw:`, e);
    }
  }
  return null;
}

// Auto-retry wrapper for the non-streaming generation path. Used both
// as a retry after a degenerate streaming response, AND as a clean
// fallback when the cache hit turns out to be corrupted. Retries up
// to MAX_ATTEMPTS times with gpt-4o (NOT gpt-4o-mini — mini is the
// biggest source of mojibake in production). Returns a clean result
// or null if every attempt failed the guard.
async function generateValidated(
  systemPrompt: string,
  userContent: string,
  inputWord: string,
  startAttempt = 1,
  maxAttempts = 3,
): Promise<{ result: object; attemptsUsed: number } | null> {
  for (let attempt = startAttempt; attempt <= maxAttempts; attempt++) {
    try {
      const result = await callOpenAI("gpt-4o", systemPrompt, userContent);
      const verdict = isDegenerate(result, inputWord);
      if (!verdict.degenerate) {
        return { result, attemptsUsed: attempt };
      }
      console.warn(`generateValidated attempt ${attempt} rejected: ${verdict.reason}`);
    } catch (e) {
      console.error(`generateValidated attempt ${attempt} threw:`, e);
    }
  }
  return null;
}

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
  am: "Amharic",
  uk: "Ukrainian",
  tr: "Turkish",
  pl: "Polish",
  fa: "Persian",
  id: "Indonesian",
  nl: "Dutch",
  el: "Greek",
  zu: "Zulu",
  vi: "Vietnamese",
  fil: "Filipino",
  af: "Afrikaans",
  sw: "Swahili",
  "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese",
  ko: "Korean",
  th: "Thai",
  bn: "Bengali",
  da: "Danish",
  hu: "Hungarian",
};

// Reject input that isn't plausibly a word BEFORE we burn an OpenAI
// call on it. Beta security review showed that pasting random
// gibberish ("sbwddttipuddegcuxi@jbsze.ne", long keyboard mashes,
// emails, URLs) sometimes timed the function out and returned a
// blank gateway error to the user. Those inputs aren't dictionary
// queries ג€” they're either accidents or abuse ג€” so it's safe to
// 400 them at the door.
//
// What "plausible word" means here: 1-60 chars, no @, no //, no
// excessive whitespace, no control chars. We accept any unicode
// letter, hyphens, apostrophes, spaces (multi-word phrases like
// "ad hominem" or "מילה אחת" stay valid).
function looksLikeWord(input: string): boolean {
  const w = input.trim();
  if (w.length === 0 || w.length > 60) return false;
  // Reject control characters / null bytes
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(w)) return false;

  // Symbol / sign lookup (Gadi 2026-08-15): a short token with no letters
  // that is (or contains) a punctuation or math sign is a valid query —
  // Gadit defines the SYMBOL itself, treating it as a word ("-", "×", "%",
  // "@", "/", "&"). Handled BEFORE the email/URL guards below so a lone "@"
  // or "/" is still definable, while real emails / URLs (letters plus @ or
  // /) fall through those guards and get rejected. Pure digits ("42") are
  // not signs, so they stay rejected.
  if (!/\p{L}/u.test(w)) {
    const core = w.replace(/\s+/g, "");
    return core.length >= 1 && core.length <= 3 && /[\p{P}\p{S}]/u.test(core);
  }

  // Reject emails (anything containing @)
  if (w.includes("@")) return false;
  // Reject URLs (any slash)
  if (/[/\\]/.test(w)) return false;
  // Reject long keyboard mashes: same character repeated 6+ times
  if (/(.)\1{5,}/.test(w)) return false;
  // Reject if more than ~5 word-like tokens (probably a sentence
  // pasted into the wrong field)
  if (w.split(/\s+/).length > 5) return false;
  return true;
}

/**
 * Gadit easter egg — synthetic /api/define result shown when a visitor
 * types "Gadit" into the search bar. Returns the brand name as if it
 * were a normal dictionary entry, but the meanings introduce the
 * coined verb "to GAD" + the product itself. HE and EN get full native
 * copy; every other UI language falls back to EN so the joke lands
 * without dragging the brand sweep across all 11 locales (which would
 * dilute the translation quality bar elsewhere).
 *
 * The shape matches WordResult from src/components/design/result.tsx
 * so the existing render path treats it like a normal cached entry.
 */
function buildGaditEasterEgg(uiLangCode: string): object {
  if (uiLangCode === "he") {
    return {
      word: "Gadit",
      language: "עברית",
      meanings: [
        {
          meaning:
            "(פועל) לעשות GAD למילה: להבין אותה עד הסוף. לא לקרוא אותה, לא להבין אותה ׳בערך׳, אלא לתפוס כל שכבה במשמעות שלה עד שהיא באמת שלך.",
          pos: "פועל",
          examples: [
            "לא ממש ידעתי מה זה ׳אקלקטי׳, אז עשיתי GAD למילה.",
            "תפסיקו לנחש מה המילים אומרות. GAD אותן.",
            "ברגע שעשית GAD למילה, היא נשארת איתך.",
          ],
        },
        {
          meaning:
            "(שם עצם, מותג) מילון חכם רב-לשוני שנבנה סביב הפעולה הזאת, מסביר כל מילה עם משמעויות, דוגמאות, אטימולוגיה, ניבים ותמונה, ב-30+ שפות.",
          pos: "שם עצם",
          examples: [
            "Gadit הוא המקום שבו עושים GAD למילה.",
            "אני משתמשת ב-Gadit עם הילדים שלי בכל פעם שהם שואלים ׳מה זה?׳.",
            "Gadit מסביר מילים כמו שמילון תמיד היה צריך להסביר.",
          ],
        },
      ],
      etymology: {
        sourceLanguage: "אנגלית (ניאולוגיזם)",
        originalWord: "to GAD",
        originalMeaning: "להבין במאה אחוז",
        breakdown:
          "פועל מומצא. לעשות GAD למשהו זה לקחת מילה או רעיון, ולהבין אותם עד הסוף, עד שהם הופכים לחלק ממך.",
        historyNote:
          "נטבע ב-2026 על ידי גדי בן לביא, מייסד Gadit, אחרי שנים של עבודה עם אנשים שגילה שכמעט כל דבר שלא הצליחו להבין מתחיל ממילה אחת שלא עשו לה GAD.",
      },
    };
  }
  // EN canonical (and fallback for every other UI language).
  return {
    word: "Gadit",
    language: "English",
    meanings: [
      {
        meaning:
          "(verb) To GAD a word: to understand it all the way through. Not to read it, not to \"kind of\" get it, but to grasp every layer of its meaning until the word is truly yours.",
        pos: "verb",
        examples: [
          "I didn't really know what \"ephemeral\" meant, so I GADed it.",
          "Stop guessing what these words mean. GAD them.",
          "Once you've GADed a word, it stays with you.",
        ],
      },
      {
        meaning:
          "(noun, brand) A smart multilingual dictionary built around the act of GADing, it explains every word with meanings, examples, etymology, idioms and an image, in 30+ languages.",
        pos: "noun",
        examples: [
          "Gadit is the place where you GAD a word.",
          "I use Gadit with my kids every time they ask, \"what does that word mean?\"",
          "Gadit explains words the way a dictionary should have all along.",
        ],
      },
    ],
    etymology: {
      sourceLanguage: "English (neologism)",
      originalWord: "to GAD",
      originalMeaning: "to fully understand",
      breakdown:
        "Coined verb. To GAD something is to take a word or idea and understand it all the way through, until it becomes a part of you.",
      historyNote:
        "Coined in 2026 by Gadi Ben Lavi, founder of Gadit, after years of working with people and noticing that almost everything they didn't understand came down to one word they hadn't GADed.",
    },
  };
}

/**
 * Brand entry for "Yooniz" — the sibling app from the same team. Without this,
 * the model treats "Yooniz" as the Arabic given name Younis (Gadi flagged
 * 2026-08-22). HE + EN native; every other UI language falls back to EN.
 * Same WordResult shape + trigger path as the Gadit easter egg.
 */
function buildYoonizEasterEgg(uiLangCode: string): object {
  if (uiLangCode === "he") {
    return {
      word: "Yooniz",
      language: "עברית",
      meanings: [
        {
          meaning:
            "(שם עצם, מותג) אפליקציית הורות שבה ההורה בונה לילד סדר יום ומשימות, הילד מבצע ומרוויח מטבע וירטואלי (Yoon), ובונה שיתוף פעולה, עצמאות וחינוך פיננסי. מהצוות שמאחורי Gadit.",
          pos: "שם עצם",
          examples: [
            "בזכות Yooniz הילדים עושים את המשימות בלי לריב.",
            "ב-Yooniz הילד מרוויח Yoon על כל משימה שהוא משלים.",
            "Yooniz הפך את המטלות וזמן המסך לכלכלה קטנה של הילד.",
          ],
        },
      ],
      etymology: {
        sourceLanguage: "אנגלית (שם מותג מומצא)",
        originalWord: "Yooniz",
        originalMeaning: "",
        breakdown:
          "שם מותג מומצא, לא השם הערבי יוניס. המטבע במערכת נקרא Yoon.",
        historyNote:
          "מותג של United Family / Lavi Learning, מהצוות שמאחורי Gadit. הרעיון: הילד מרוויח, זה לא דמי כיס.",
      },
    };
  }
  // EN canonical (and fallback for every other UI language).
  return {
    word: "Yooniz",
    language: "English",
    meanings: [
      {
        meaning:
          "(noun, brand) A parenting app where a parent sets a child's daily routine and tasks, the child completes them and earns a virtual currency (Yoon), building cooperation, independence and financial literacy. From the team behind Gadit.",
        pos: "noun",
        examples: [
          "With Yooniz, my kids do their tasks without a fight.",
          "In Yooniz the child earns Yoon for every task they finish.",
          "Yooniz turned chores and screen time into the child's own little economy.",
        ],
      },
    ],
    etymology: {
      sourceLanguage: "English (coined brand name)",
      originalWord: "Yooniz",
      originalMeaning: "",
      breakdown:
        "A coined brand name, not the Arabic given name Younis. The in-app currency is called Yoon.",
      historyNote:
        "A brand by United Family / Lavi Learning, from the team behind Gadit. The idea: the child earns it, it is not an allowance.",
    },
  };
}

/**
 * Lazy backfill for the cross-language gloss. Entries cached BEFORE the
 * `translation` field existed have no gloss, so a German user looking up a
 * Hebrew word never saw the German equivalent. On a cache hit for a foreign
 * word missing its gloss we fetch just the one equivalent word (cheap), so
 * the whole existing cache upgrades itself lazily — no full regeneration
 * (Gadi 2026-08-13). Returns "" on any failure.
 */
async function backfillTranslation(word: string, wordLangName: string, uiLangName: string): Promise<string> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 16,
        messages: [
          { role: "system", content: "Reply with ONLY the single most common everyday equivalent WORD of the given word in the target language (its primary sense). No quotes, no punctuation, no explanation. Give a short phrase only if there is no single word." },
          { role: "user", content: `Word (${wordLangName}): ${word}\nTarget language: ${uiLangName}\nEquivalent word:` },
        ],
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const u = usageFrom(data);
    void logAiUsage({ feature: "backfill_gloss", model: "gpt-4o-mini", tokensIn: u.tokensIn, tokensOut: u.tokensOut });
    return String(data?.choices?.[0]?.message?.content || "").replace(/["'.\n]/g, "").trim().slice(0, 60);
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { word, contextSentence, uiLang } = await req.json();
    // NOTE on Kids Mode: the global toggle is intentionally a CLIENT
    // render-time decision now, not a server prompt change. The same
    // cached response carries both the adult "meaning" + "examples"
    // and the per-meaning "kidsExplanation" object; when Kids Mode is
    // on the client just promotes the kids fields to the main slot.
    // That keeps one cache entry per word (no doubled storage) and
    // reuses the quality bar of the existing kidsExplanation prompt
    // instead of rewriting every field through a second prompt.
    if (!word?.trim()) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }
    if (!looksLikeWord(word)) {
      return NextResponse.json(
        {
          error: "invalid_input",
          message:
            "That doesn't look like a word we can define. Try a single word or a short phrase.",
        },
        { status: 400 }
      );
    }

    // Three identity states we handle:
    //   - paid (Clear/Deep): unmetered, gets all premium prompt features
    //   - basic (signed-in free): 10/day quota tied to userId
    //   - anonymous: 5/day quota tied to client IP
    // We do NOT 401 anon visitors anymore. Forcing signup before the
    // first search killed SEO + word-of-mouth sharing in beta ג€” both
    // beta testers got stuck on the wall before seeing a single result.
    // Now they get 5 free searches; the soft wall in WordClient asks
    // for signup once the IP quota is consumed.
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = idToken ? await verifyUserAndGetPlan(idToken) : null;
    const plan = userInfo?.plan ?? "anonymous";
    const isPaid = plan === "clear" || plan === "deep";

    // Touch the user doc so the admin dashboard sees a fresh lastSeenAt,
    // captures their country from Vercel's edge header, and bumps the
    // running searchCount. Fire-and-forget — function swallows errors.
    if (userInfo) {
      void recordUserActivity(userInfo.userId, {
        headers: req.headers,
        search: true,
      });
    }

    const uiLangCode = typeof uiLang === "string" && UI_LANG_NAMES[uiLang] ? uiLang : "en";
    const uiLangName = UI_LANG_NAMES[uiLangCode];

    // Easter egg: looking up the brand name itself returns a custom
    // meta-definition that introduces the "to GAD" verb to the visitor.
    // No OpenAI call, no cache lookup, no quota cost — the moment is
    // playful and instant. Doesn't bypass auth (anon visitors get it
    // too) because the goal is to surprise them, not to gate the bit.
    if (word.trim().toLowerCase() === "gadit") {
      const result = buildGaditEasterEgg(uiLangCode);
      const body = `data: ${JSON.stringify({ type: "done", result })}\n\n`;
      return new Response(body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Sibling brand: "Yooniz" is the parenting app from the same team, not the
    // Arabic name Younis. Runs before the cache, so it overrides any stale
    // (wrong) cached entry automatically.
    if (word.trim().toLowerCase() === "yooniz") {
      const result = buildYoonizEasterEgg(uiLangCode);
      const body = `data: ${JSON.stringify({ type: "done", result })}\n\n`;
      return new Response(body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Cache key includes a "kids" suffix for paid users so they don't share cache with basic users.
    //
    // Prefix bumped from auto_/ctx_ to auto2_/ctx2_ on 2026-06-07 to invalidate
    // every entry generated under the previous "respond in input word's language"
    // prompt. That rule caused cross-language searches (e.g. Spanish-UI user
    // searching an English word) to return English text — a regression Dafna
    // flagged during beta. The new prompt forces UI-language output for all
    // text, but cached entries from the old version would otherwise keep
    // serving the wrong-language response forever. Cost of full regen is
    // bounded (~one OpenAI call per popular word, ~$0.005 each).
    const tierKey = isPaid ? "kids" : "base";
    const cacheKey = contextSentence
      ? `ctx2_${uiLangCode}_${tierKey}_${word.toLowerCase().trim()}_${contextSentence.toLowerCase().trim().slice(0, 60)}`
      : `auto2_${uiLangCode}_${tierKey}_${word.toLowerCase().trim()}`;

    // Per-word search counter for the /admin/searches dashboard.
    // Fires for both cache hits AND live generations so popularity
    // reflects real demand, not OpenAI cost. Easter-egg "gadit" is
    // excluded above; invalid inputs short-circuit before this.
    void recordWordSearch({ word, lang: uiLangCode });
    // Raw per-event feed for /admin/activity (who searched what, when).
    void recordActivity({ kind: "word", word, lang: uiLangCode, uid: userInfo?.userId ?? null, plan: userInfo?.plan ?? "anon", country: req.headers.get("x-vercel-ip-country") });

    const cached = await getCachedResult(cacheKey);
    if (cached) {
      // Validate cached result against the same guard we apply to
      // fresh generations. Cache entries written before the guard
      // existed (or before guard heuristics were tightened) may carry
      // mojibake. If so, drop the corrupted entry and fall through to
      // the live-generation path so the user gets a clean result.
      const cachedVerdict = isDegenerate(cached, word);
      if (cachedVerdict.degenerate) {
        console.warn(`Dropping corrupted cache entry [${cacheKey}]: ${cachedVerdict.reason}`);
        await deleteCachedResult(cacheKey);
      } else {
        // Lazy backfill of the cross-language gloss for pre-existing cache
        // entries that predate the `translation` field. If the word is in a
        // DIFFERENT language than the UI and the gloss is missing, compute
        // it once and patch the cache, so every foreign word shows its
        // UI-language equivalent (Gadi 2026-08-13). Same-language words and
        // entries that already have a gloss are untouched.
        const wordLangName = typeof cached.language === "string" ? cached.language.trim() : "";
        const sameLang = !!wordLangName && wordLangName.toLowerCase().includes(uiLangName.toLowerCase());
        const hasGloss = typeof cached.translation === "string" && cached.translation.trim().length > 0;
        if (wordLangName && !sameLang && !hasGloss && !contextSentence) {
          const t = await backfillTranslation(word, wordLangName, uiLangName);
          if (t && !isEtymologyFieldGarbled("originalMeaning", t)) {
            (cached as Record<string, unknown>).translation = t;
            void getAdminDb().collection("cache").doc(cacheKey).set({ translation: t }, { merge: true });
          }
        }
        // Cached response — send as a single SSE event so the client can use one code path
        const payload = { ...cached, fromCache: true };
        const body = `data: ${JSON.stringify({ type: "done", result: payload })}\n\n`;
        return new Response(body, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      }
    }

    // Quota enforcement runs only on cache misses ג€” popular words like
    // "love", "dream", "ephemeral" stay free because they don't cost
    // an OpenAI call. This also rewards the long-tail SEO play: if
    // millions of visitors search the same 10K popular words, we pay
    // close to nothing.
    if (!isPaid) {
      if (plan === "anonymous") {
        const ip = clientIp(req);
        const newCount = await incrementAnonUsage(ip);
        if (newCount > ANON_DAILY_LIMIT) {
          return NextResponse.json(
            {
              error: "daily_limit_reached",
              limit: ANON_DAILY_LIMIT,
              plan: "anonymous",
              // Hint to the client: showing a friendly soft-wall page
              // with a Sign Up CTA makes more sense here than the same
              // "Upgrade to Clear" pitch we'd show a Basic user.
              nextStep: "signup",
            },
            { status: 429 }
          );
        }
      } else {
        // plan === "basic" (signed-in free)
        const newCount = await incrementDailyUsage(userInfo!.userId);
        if (newCount > BASIC_DAILY_LIMIT) {
          return NextResponse.json(
            {
              error: "daily_limit_reached",
              limit: BASIC_DAILY_LIMIT,
              plan: "basic",
              nextStep: "upgrade",
            },
            { status: 429 }
          );
        }
      }
    }

    const basePrompt = contextSentence ? CONTEXT_PROMPT : SYSTEM_PROMPT;
    const systemPrompt = isPaid ? basePrompt + KIDS_ADDON : basePrompt;
    const userContent = contextSentence
      ? `Word: ${word}\nSentence: ${contextSentence}\nUser's UI language (RESPOND ENTIRELY in this language, meaning text, example sentences, etymology fields, kidsExplanation, idiom meanings. Headword + original-script forms stay native): ${uiLangName}`
      : `Word: ${word}\nUser's UI language (RESPOND ENTIRELY in this language, meaning text, example sentences, etymology fields, kidsExplanation, idiom meanings. Headword + original-script forms stay native): ${uiLangName}`;

    // Stream from OpenAI
    let openAIResponse: Response;
    let usingFallback = false;
    try {
      openAIResponse = await openAIStream("gpt-4o", systemPrompt, userContent);
      if (!openAIResponse.ok || !openAIResponse.body) throw new Error(`gpt-4o HTTP ${openAIResponse.status}`);
    } catch (e) {
      console.error("gpt-4o stream failed, falling back to gpt-4o-mini:", e);
      openAIResponse = await openAIStream("gpt-4o-mini", systemPrompt, userContent);
      usingFallback = true;
      if (!openAIResponse.ok || !openAIResponse.body) {
        // Both models failed. The most common cause is upstream — an
        // OpenAI quota/billing issue, an outage, or a transient 5xx —
        // not anything the user did. Return 503 (Service Unavailable)
        // so the client can render a calm "try again in a moment"
        // message instead of the scary "HTTP 500" that signals a bug
        // on our side. Gadi 2026-06-22: a paid subscriber hit this
        // when the OpenAI account ran out of quota; she pinged him
        // worried the app was broken when in fact it was a billing
        // issue. The body carries a stable error code the client
        // matches on, plus a UI-language-aware fallback string.
        const upstreamCode = openAIResponse.status;
        console.error(`[define] both models down, upstream code ${upstreamCode}`);
        // Alert Gadi immediately (deduped to 1/30min) so an outage never
        // surfaces from a customer first. 429 here is almost always an
        // OpenAI credit/billing problem, not a code bug.
        void alertEngineDown({ source: "define (both models)", status: upstreamCode });
        return NextResponse.json(
          {
            error: "service_unavailable",
            upstreamStatus: upstreamCode,
            message:
              "Our definition engine is temporarily unavailable. Please try again in a few minutes.",
          },
          { status: 503 }
        );
      }
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const upstream = openAIResponse.body;

    const stream = new ReadableStream({
      async start(controller) {
        let accumulated = "";
        let buffer = "";
        let closed = false;
        let capturedUsage: { prompt_tokens?: number; completion_tokens?: number } | null = null;
        const reader = upstream.getReader();

        const safeEnqueue = (chunk: Uint8Array) => {
          if (closed) return;
          try {
            controller.enqueue(chunk);
          } catch {
            closed = true;
          }
        };

        const safeClose = () => {
          if (closed) return;
          closed = true;
          try {
            controller.close();
          } catch {
            // already closed
          }
        };

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (closed) break; // client disconnected

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // keep incomplete last line

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") continue;

              try {
                const json = JSON.parse(data);
                // Final chunk (include_usage) carries token counts, no delta.
                if (json.usage) capturedUsage = json.usage;
                const delta = json.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta.length > 0) {
                  accumulated += delta;
                  const event = `data: ${JSON.stringify({ type: "delta", partial: accumulated })}\n\n`;
                  safeEnqueue(encoder.encode(event));
                }
              } catch {
                // skip malformed line
              }
            }
          }

          // Cost telemetry for the streamed first attempt (the dominant
          // OpenAI cost). feature splits generic lookups from context
          // (Reader / "Every Word") lookups; model reflects the fallback.
          void logAiUsage({
            feature: contextSentence ? "define_context" : "define",
            model: usingFallback ? "gpt-4o-mini" : "gpt-4o",
            tokensIn: capturedUsage?.prompt_tokens ?? 0,
            tokensOut: capturedUsage?.completion_tokens ?? 0,
            plan: userInfo?.plan ?? "anon",
          });

          // Stream ended — parse final JSON, validate, retry if degenerate
          let acceptedResult: object | null = null;
          let parsedOk = false;
          try {
            const parsed = JSON.parse(accumulated);
            parsedOk = true;
            const verdict = isDegenerate(parsed, word);
            if (verdict.degenerate) {
              console.warn(`First-attempt rejected (streaming): ${verdict.reason}`);
            } else {
              acceptedResult = parsed;
            }
          } catch (e) {
            console.error("Final JSON parse failed on streamed attempt:", e, "head:", accumulated.slice(0, 200));
          }

          // If the streamed first attempt failed (parse error OR guard
          // rejection), retry up to 2 more times non-streaming with
          // gpt-4o. This is what stops the user from ever seeing
          // mojibake: even when OpenAI flakes on one call, the next
          // call almost always produces a clean result.
          if (!acceptedResult) {
            void parsedOk; // surface log already emitted above
            const retry = await generateValidated(systemPrompt, userContent, word, 2, 3);
            if (retry) {
              console.info(`Recovered via retry on attempt ${retry.attemptsUsed}`);
              acceptedResult = retry.result;
            }
          }

          if (acceptedResult) {
            // Cache the validated result regardless of whether it was
            // the streamed attempt or a retry — both produced the same
            // shape and quality bar.
            void usingFallback;
            setCachedResult(cacheKey, acceptedResult).catch((e) =>
              console.error("Cache write failed:", e),
            );
            const doneEvent = `data: ${JSON.stringify({ type: "done", result: acceptedResult })}\n\n`;
            safeEnqueue(encoder.encode(doneEvent));
          } else {
            // All main retries failed validation. Three-step salvage,
            // each step more aggressive than the last:
            //   (a) Try a dedicated etymology-only API call. Different
            //       prompt, higher temperature, model ladder — designed
            //       to escape the degenerate basin the main call is
            //       stuck in. If it returns clean etymology, merge it
            //       into the parsed result and serve the whole thing.
            //       This is the path that keeps the user's promise: a
            //       Gadit result always has etymology.
            //   (b) If the etymology fallback also fails, sanitise the
            //       result by clearing the broken etymology subfields
            //       and serve meanings/examples/idioms with an empty
            //       etymology card. Better than gibberish, worse than
            //       a real etymology — but at least nothing on screen
            //       is broken.
            //   (c) If the parsed result is so broken that even after
            //       sanitisation it doesn't pass the guard (meaning the
            //       meanings or examples themselves are bad), surface
            //       the generic error.
            let salvaged: object | null = null;
            let parsedResult: Record<string, unknown> | null = null;
            try {
              parsedResult = JSON.parse(accumulated) as Record<string, unknown>;
            } catch {
              // accumulated wasn't parseable JSON — no salvage possible
            }

            if (parsedResult) {
              // (a) Etymology fallback call.
              const fallbackEty = await generateEtymologyFallback(word, uiLangName);
              if (fallbackEty) {
                const merged = { ...parsedResult, etymology: fallbackEty };
                const mergedVerdict = isDegenerate(merged, word);
                if (!mergedVerdict.degenerate) {
                  salvaged = merged;
                  console.info(`Salvaged result via dedicated etymology fallback call`);
                }
              }
              // (b) Sanitisation fallback.
              if (!salvaged) {
                const sanitised = sanitizeDegenerateEtymology(parsedResult);
                const reVerdict = isDegenerate(sanitised, word);
                if (!reVerdict.degenerate) {
                  salvaged = sanitised as object;
                  console.warn(`Salvaged result by clearing degenerate etymology fields`);
                }
              }
            }

            if (salvaged) {
              setCachedResult(cacheKey, salvaged).catch((e) =>
                console.error("Cache write failed:", e),
              );
              const doneEvent = `data: ${JSON.stringify({ type: "done", result: salvaged })}\n\n`;
              safeEnqueue(encoder.encode(doneEvent));
            } else {
              console.error("All attempts (1 streamed + 2 retries + etymology fallback + sanitise) failed, surfacing error");
              const errorEvent = `data: ${JSON.stringify({ type: "error", message: "We hit a temporary generation glitch. Please try again." })}\n\n`;
              safeEnqueue(encoder.encode(errorEvent));
            }
          }
        } catch (e) {
          console.error("Stream reading error:", e);
          const errorEvent = `data: ${JSON.stringify({ type: "error", message: String(e) })}\n\n`;
          safeEnqueue(encoder.encode(errorEvent));
        } finally {
          safeClose();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Define error:", err);
    return NextResponse.json({ error: "Failed to define word", details: String(err) }, { status: 500 });
  }
}
