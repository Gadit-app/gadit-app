import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { gradeOfMember, nextLevelWords } from "@/lib/journey/level-words";

/**
 * Words of the child's school grade for the games (Gadi 2026-11-15: "the
 * games open for everyone, with or without words in the notebook").
 *
 * GET /api/play/level-words?ui=<interface language>
 *   The grade is read from the family member behind the token (level, grade
 *   or age). The words and their short definitions come from the curriculum
 *   units we already hold (lib/journey/level-words.ts); nothing is generated.
 *   { grade, words: [{ word, meaning }] }, empty when the profile has no
 *   grade or the interface language has no units.
 * Any signed-in profile.
 */

const UI_LANG = /^[a-z]{2}(-[A-Z]{2})?$/;
const NEED = 80;

export async function GET(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  const token = h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : null;
  if (!token) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const ui = req.nextUrl.searchParams.get("ui") || "";
  try {
    const d = await getAdminAuth().verifyIdToken(token);
    if (!UI_LANG.test(ui) || typeof d.familyId !== "string" || typeof d.memberId !== "string") {
      return NextResponse.json({ grade: null, words: [] });
    }
    const m = await getAdminDb().collection("families").doc(d.familyId).collection("members").doc(d.memberId).get();
    const grade = m.exists ? gradeOfMember(m.data()) : null;
    if (grade === null) return NextResponse.json({ grade: null, words: [] });
    const words = await nextLevelWords(ui, grade, new Set(), [], NEED);
    return NextResponse.json({ grade, words: words.map((w) => ({ word: w.word, meaning: w.meaning })) });
  } catch {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
}
