import { getAdminDb } from "@/lib/firebase-admin";
import { computeGamification, toLocalDateStr } from "@/lib/gamification";

/**
 * An individual subscriber's own numbers for the "first two weeks" email
 * (Gadi 2026-10-06): words in the notebook, words from the last week, the
 * day streak and the latest words. Replaces {מספרים} / {numbers}.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
type Numbers = { total: number; week: number; streak: number; recent: string[] };

async function readNumbers(uid: string): Promise<Numbers> {
  const base: Numbers = { total: 0, week: 0, streak: 0, recent: [] };
  try {
    const snap = await getAdminDb().collection("users").doc(uid).collection("notebook").select("addedAt", "word").get();
    const rows = snap.docs
      .map((d) => ({ word: (d.get("word") as string) || "", at: (d.get("addedAt") as string) || "" }))
      .filter((r) => r.at);
    const now = Date.now();
    const cutoff = new Date(now - WEEK_MS).toISOString();
    const g = computeGamification(rows.map((r) => r.at), now, toLocalDateStr(new Date(now).toISOString()));
    return {
      total: g.distinct,
      week: rows.filter((r) => r.at >= cutoff).length,
      streak: g.streak,
      recent: rows.sort((a, b) => b.at.localeCompare(a.at)).map((r) => r.word).filter(Boolean).slice(0, 3),
    };
  } catch {
    return base;
  }
}

function lineHe(n: Numbers): string {
  if (!n.total) return "**המחברת שלך:** עוד אין בה מילים. היום זה הזמן למילה הראשונה.";
  const words = n.total === 1 ? "מילה אחת" : `${n.total} מילים`;
  const week = n.week ? (n.week === 1 ? ", אחת מהן מהשבוע האחרון" : `, ${n.week} מהן מהשבוע האחרון`) : "";
  const streak = n.streak > 1 ? `\nרצף של ${n.streak} ימים.` : "";
  const recent = n.recent.length ? `\nהמילים האחרונות: ${n.recent.join(", ")}.` : "";
  return `**המחברת שלך:** ${words}${week}.${streak}${recent}`;
}

function lineEn(n: Numbers): string {
  if (!n.total) return "**Your notebook:** no words yet. Today is a good day for the first one.";
  const words = n.total === 1 ? "1 word" : `${n.total} words`;
  const week = n.week ? `, ${n.week} from the last week` : "";
  const streak = n.streak > 1 ? `\nA ${n.streak}-day streak.` : "";
  const recent = n.recent.length ? `\nThe latest words: ${n.recent.join(", ")}.` : "";
  return `**Your notebook:** ${words}${week}.${streak}${recent}`;
}

export async function indivNumbersSummary(uid: string, lang: string): Promise<string> {
  const n = await readNumbers(uid);
  return lang === "he" ? lineHe(n) : lineEn(n);
}

/** A realistic sample for the editor preview and test sends. */
export function sampleNumbersSummary(lang: string): string {
  const n: Numbers = { total: 23, week: 9, streak: 4, recent: lang === "he" ? ["פוטוסינתזה", "אמביוולנטי", "קרן"] : ["ambivalent", "photosynthesis", "bank"] };
  return lang === "he" ? lineHe(n) : lineEn(n);
}

export function fillNumbers(text: string, summary: string): string {
  return text.replace(/\{מספרים\}|\{numbers\}/g, summary);
}
