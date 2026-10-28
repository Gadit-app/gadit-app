import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { subjectsCatalog, subjectsLangs, subjectTopicWords, subjectWordIndex, type SubjectsLang } from "@/lib/subject-words";

/**
 * Key words by subject (/subjects), read-only. Bearer: a Firebase ID token.
 * Paying plans only (Clear / Deep; Family members and Individual map there).
 *
 * GET ?lang=he|en|de   (de only once its catalog files exist)
 *   -> { lang, subjects: [{ key, age, name, icon, topics: [{ id, title, age: "younger"|"older" }] }] }
 *      one entry per subject card and level (lib/subject-words.ts): younger
 *      has the elementary subjects, older the secondary ones; a key can
 *      appear once per level ("mathematics" is חשבון / מתמטיקה)
 * GET ?lang=he|en|de&subject=<key>&age=younger|older
 *   -> { words: [{ w, d, t: topicId, tt: topicTitle }] } every key word of that
 *      subject card, for the search inside a subject (2026-10-28)
 * GET ?lang=he|en|de&topic=<id>
 *   -> { id, subject, subjectName, icon, title, age, words: [{ w, d }] }
 *
 * 401 signed out, 402 { error: "upgrade_required" } on Basic, 404 for an id
 * that is not one of this language's catalog topics (a school's own set
 * never is) or has no stored words.
 */
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("Authorization") || "";
  const user = await verifyUserAndGetPlan(auth.startsWith("Bearer ") ? auth.slice(7) : null);
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (user.plan !== "clear" && user.plan !== "deep") return NextResponse.json({ error: "upgrade_required" }, { status: 402 });

  const sp = req.nextUrl.searchParams;
  const lang = (sp.get("lang") || "he") as SubjectsLang;
  if (!subjectsLangs().includes(lang)) return NextResponse.json({ error: "lang_not_available" }, { status: 404 });
  const topic = (sp.get("topic") ?? "").trim().slice(0, 40);
  const headers = { "Cache-Control": "private, max-age=60" };
  const subject = (sp.get("subject") ?? "").trim().slice(0, 40);
  const age = sp.get("age");
  try {
    if (subject && (age === "younger" || age === "older")) {
      const words = await subjectWordIndex(lang, subject, age);
      if (!words) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return NextResponse.json({ words }, { headers: { "Cache-Control": "private, max-age=300" } });
    }
    if (topic) {
      const words = await subjectTopicWords(lang, topic);
      if (!words) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return NextResponse.json(words, { headers });
    }
    return NextResponse.json(await subjectsCatalog(lang), { headers });
  } catch (e) {
    console.error("subjects GET failed:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
