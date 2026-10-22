import { getAdminDb } from "@/lib/firebase-admin";
import { type RankKey } from "@/lib/gamification";
import { getRankState } from "@/lib/rank-points";

/**
 * Per-child progress of one family, the one source for the parent dashboard
 * (GET /api/family/progress) and the weekly parent report email, so the two
 * always show the same numbers.
 *
 * Data model: each family member (families/{ownerUid}/members/{id})
 * carries a `userId` once their device is paired; that member's saved
 * words live at users/{userId}/notebook/{wordId} with an ISO `addedAt`.
 * Aggregated server-side with the Admin SDK, so one call returns every
 * child's stats regardless of client security rules. The caller checks
 * that the requester owns the family.
 */

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type ChildProgress = {
  memberId: string;
  name: string;
  role: string;
  colorIndex: number;
  linked: boolean;
  total: number;
  thisWeek: number;
  recent: string[];
  // Gamification (Gadi 2026-08-12): forgiving daily streak + explorer rank,
  // computed from the same notebook addedAt dates. 0 / "scout" when empty.
  streak: number;
  rankKey: RankKey;
  /** Learning mode (Gadi 2026-10-11): real numbers only, never a level. */
  learning?: { lang: "en" | "he"; learnedWeek: number; learnedTotal: number; reinforce: number; list: { total: number; ready: number; testDate: string | null } | null } | null;
};

/** A child plus the words added in the last 7 days (newest first, distinct),
 *  used by the weekly email; the dashboard response leaves it out. */
export type ChildProgressFull = ChildProgress & { weekList: string[] };

export type FamilyProgress<C extends ChildProgress = ChildProgress> = { children: C[]; totalWords: number; weekWords: number };

/** A child's learning-mode numbers, or null when not learning a language. */
async function learningOf(uid: string): Promise<ChildProgress["learning"]> {
  const db = getAdminDb();
  const learn = (await db.collection("users").doc(uid).get()).get("learn") as
    { lang?: "en" | "he" | null; list?: { lang: string; items: Array<{ w: string }>; testDate?: string | null; at: number } | null } | undefined;
  const lang = learn?.lang;
  if (lang !== "en" && lang !== "he") return null;
  const snap = await db.collection("users").doc(uid).collection("learnWords").where("lang", "==", lang).get();
  const now = Date.now();
  const rows = snap.docs.map((d) => d.data() as { box?: number; wrong?: number; learnedAt?: number; w?: string });
  const byWord = new Map(rows.map((r) => [String(r.w ?? "").toLowerCase(), r]));
  const l = learn?.list && learn.list.lang === lang ? learn.list : null;
  const listOn = !!l && (l.testDate ? now <= Date.parse(`${l.testDate}T23:59:59+03:00`) + 86_400_000 : now - l.at < 14 * 86_400_000);
  return {
    lang,
    learnedWeek: rows.filter((r) => (r.learnedAt ?? 0) >= now - WEEK_MS).length,
    learnedTotal: rows.filter((r) => (r.box ?? 0) >= 3).length,
    reinforce: rows.filter((r) => (r.box ?? 0) < 3 && (r.wrong ?? 0) > 0).length,
    list: listOn && l ? { total: l.items.length, ready: l.items.filter((x) => (byWord.get(x.w.toLowerCase())?.box ?? 0) >= 2).length, testDate: l.testDate ?? null } : null,
  };
}

/**
 * Words each account LOOKED UP in the last 7 days, from the activity log
 * (Gadi 2026-10-22: an active family's report showed 0 because only words
 * saved to the notebook counted). One query for the whole week, filtered in
 * memory (no composite index needed), cached for 10 minutes so the Sunday
 * cron reads it once for every family.
 */
let weekLookupsCache: { at: number; byUid: Map<string, string[]> } | null = null;
async function weekLookups(): Promise<Map<string, string[]>> {
  if (weekLookupsCache && Date.now() - weekLookupsCache.at < 10 * 60_000) return weekLookupsCache.byUid;
  const since = Date.now() - WEEK_MS;
  const snap = await getAdminDb().collection("activityLog").where("atMs", ">=", since).select("uid", "word", "kind", "atMs").get();
  const rows = snap.docs
    .map((d) => d.data() as { uid?: string; word?: string; kind?: string; atMs?: number })
    .filter((x) => x.uid && x.word && (x.kind ?? "word") === "word")
    .sort((a, b) => (b.atMs ?? 0) - (a.atMs ?? 0));
  const byUid = new Map<string, string[]>();
  for (const x of rows) {
    const list = byUid.get(x.uid!) ?? [];
    list.push(String(x.word).trim());
    byUid.set(x.uid!, list);
  }
  weekLookupsCache = { at: Date.now(), byUid };
  return byUid;
}

/** Every non-parent member of families/{ownerUid}, in the order they were added. */
export async function loadFamilyProgress(ownerUid: string): Promise<FamilyProgress<ChildProgressFull>> {
  const db = getAdminDb();
  const membersSnap = await db
    .collection("families")
    .doc(ownerUid)
    .collection("members")
    .orderBy("createdAt", "asc")
    .get();

  const cutoffIso = new Date(Date.now() - WEEK_MS).toISOString();
  const lookups = await weekLookups().catch(() => new Map<string, string[]>());

  type MemberDoc = {
    id: string;
    role?: string;
    name?: string;
    colorIndex?: number;
    userId?: string | null;
  };
  const children = await Promise.all(
    membersSnap.docs
      .map((d): MemberDoc => ({ id: d.id, ...(d.data() as Omit<MemberDoc, "id">) }))
      // Children only (parents don't need a progress card of their own here).
      .filter((m) => m.role !== "father" && m.role !== "mother")
      .map(async (m): Promise<ChildProgressFull> => {
        const base: ChildProgressFull = {
          memberId: m.id,
          name: m.name || "",
          role: m.role || "kid",
          colorIndex: typeof m.colorIndex === "number" ? m.colorIndex : 0,
          linked: false,
          total: 0,
          thisWeek: 0,
          recent: [],
          streak: 0,
          rankKey: "scout",
          weekList: [],
        };
        const uid = m.userId;
        if (!uid) return base;
        base.learning = await learningOf(uid).catch(() => null);

        try {
          // Words, practices, streak and rank from the one server helper
          // (lib/rank-points), so the dashboard shows the rank the child sees.
          const st = await getRankState(uid);
          const sorted = [...st.rows].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
          const recent = sorted
            .slice(0, 6)
            .map((r) => r.word)
            .filter(Boolean);
          const week = sorted.filter((r) => r.addedAt >= cutoffIso);
          // This week's new words: the ones saved to the notebook, then the
          // ones only looked up, each word once.
          const seen = new Set<string>();
          const weekList: string[] = [];
          for (const w0 of [...week.map((r) => r.word), ...(lookups.get(uid) ?? [])]) {
            const w = (w0 ?? "").trim();
            if (!w || seen.has(w.toLowerCase())) continue;
            seen.add(w.toLowerCase());
            weekList.push(w);
          }
          return {
            ...base,
            linked: true,
            total: st.words,
            thisWeek: weekList.length,
            recent,
            streak: st.streak,
            rankKey: st.rank.key,
            weekList,
          };
        } catch (e) {
          console.error(`[family-progress] notebook read failed for ${uid}:`, e);
          return { ...base, linked: true };
        }
      }),
  );

  const totalWords = children.reduce((sum, c) => sum + c.total, 0);
  const weekWords = children.reduce((sum, c) => sum + c.thisWeek, 0);
  return { children, totalWords, weekWords };
}

/** The dashboard's response shape (exactly what /api/family/progress returned before). */
export function publicFamilyProgress(p: FamilyProgress<ChildProgressFull>): FamilyProgress {
  return {
    children: p.children.map((c) => {
      const out: ChildProgress & { weekList?: string[] } = { ...c };
      delete out.weekList;
      return out;
    }),
    totalWords: p.totalWords,
    weekWords: p.weekWords,
  };
}
