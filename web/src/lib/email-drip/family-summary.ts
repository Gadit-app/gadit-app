import { getAdminDb } from "@/lib/firebase-admin";
import { computeGamification, toLocalDateStr } from "@/lib/gamification";

/**
 * Each child's numbers for the "first two weeks" family email (Gadi
 * 2026-10-06): words in the notebook, words from the last week, the day
 * streak and the latest words. Rendered as markdown-lite lines that replace
 * {ילדים} / {children} in the email body. Same data as /api/family/progress.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Child = { name: string; total: number; week: number; streak: number; recent: string[] };

async function readChildren(familyId: string): Promise<Child[]> {
  const db = getAdminDb();
  const members = await db.collection("families").doc(familyId).collection("members").orderBy("createdAt", "asc").get();
  const cutoff = new Date(Date.now() - WEEK_MS).toISOString();
  const kids = members.docs
    .map((d) => d.data() as { role?: string; name?: string; userId?: string | null })
    .filter((m) => m.role !== "father" && m.role !== "mother");
  return Promise.all(kids.map(async (m) => {
    const base: Child = { name: (m.name || "").trim(), total: 0, week: 0, streak: 0, recent: [] };
    if (!m.userId) return base;
    try {
      const snap = await db.collection("users").doc(m.userId).collection("notebook").select("addedAt", "word").get();
      const rows = snap.docs
        .map((d) => ({ word: (d.get("word") as string) || "", at: (d.get("addedAt") as string) || "" }))
        .filter((r) => r.at);
      const now = Date.now();
      const g = computeGamification(rows.map((r) => r.at), now, toLocalDateStr(new Date(now).toISOString()));
      return {
        ...base,
        total: g.distinct,
        week: rows.filter((r) => r.at >= cutoff).length,
        streak: g.streak,
        recent: rows.sort((a, b) => b.at.localeCompare(a.at)).map((r) => r.word).filter(Boolean).slice(0, 3),
      };
    } catch {
      return base;
    }
  }));
}

function lineHe(c: Child): string {
  const who = c.name || "הילד";
  if (!c.total) return `**${who}:** עוד אין מילים במחברת. היום זה הזמן למילה הראשונה.`;
  const words = c.total === 1 ? "מילה אחת במחברת" : `${c.total} מילים במחברת`;
  const week = c.week ? (c.week === 1 ? ", אחת מהן מהשבוע האחרון" : `, ${c.week} מהן מהשבוע האחרון`) : "";
  const streak = c.streak > 1 ? ` רצף של ${c.streak} ימים.` : "";
  const recent = c.recent.length ? ` המילים האחרונות: ${c.recent.join(", ")}.` : "";
  return `**${who}:** ${words}${week}.${streak}${recent}`;
}

function lineEn(c: Child): string {
  const who = c.name || "Your child";
  if (!c.total) return `**${who}:** no words in the notebook yet. Today is a good day for the first one.`;
  const words = c.total === 1 ? "1 word in the notebook" : `${c.total} words in the notebook`;
  const week = c.week ? `, ${c.week} from the last week` : "";
  const streak = c.streak > 1 ? ` A ${c.streak}-day streak.` : "";
  const recent = c.recent.length ? ` Latest words: ${c.recent.join(", ")}.` : "";
  return `**${who}:** ${words}${week}.${streak}${recent}`;
}

const NONE_HE = "עוד לא חיברת ילד ל-Gadit. [מוסיפים ילד באזור המשפחה](/family?tab=members), ומחפשים יחד את המילה הראשונה.";
const NONE_EN = "You haven't connected a child to Gadit yet. [Add a child in your family area](/family?tab=members), and look up the first word together.";

/** The summary block in Hebrew, or English for every other language (the
 *  numbers read the same; a translated email keeps its own text around it). */
export async function familyChildrenSummary(familyId: string, lang: string): Promise<string> {
  const he = lang === "he";
  const kids = await readChildren(familyId).catch(() => [] as Child[]);
  if (!kids.length) return he ? NONE_HE : NONE_EN;
  return kids.map(he ? lineHe : lineEn).join("\n\n");
}

/** A sample block for the editor preview and test sends. */
export function sampleChildrenSummary(lang: string): string {
  const he = lang === "he";
  const kids: Child[] = he
    ? [{ name: "נועה", total: 14, week: 6, streak: 3, recent: ["פוטוסינתזה", "ענן", "מקור"] }, { name: "איתי", total: 0, week: 0, streak: 0, recent: [] }]
    : [{ name: "Noa", total: 14, week: 6, streak: 3, recent: ["photosynthesis", "cloud", "source"] }, { name: "Itai", total: 0, week: 0, streak: 0, recent: [] }];
  return kids.map(he ? lineHe : lineEn).join("\n\n");
}

/** Put the block into a body that has the placeholder. */
export const fillChildren = (body: string, block: string) => body.replace(/\{(?:ילדים|children)\}/g, block);
