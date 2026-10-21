/**
 * Rank points, server side (Gadi 2026-10-21). ONE place every API uses, so the
 * child's header, a grown up's rank card and top badge, the family dashboard
 * and the family leaderboard all show the same points and the same rank.
 *
 *   points = distinct notebook words * POINTS.seen
 *          + completed practices     * POINTS.practice
 *
 * A completed practice is a finished activity reported to
 * /api/family/notify-activity (dictation, "say it", listen-and-pick, lesson,
 * /play game, reading check, word-page quiz, word game) or a finished online
 * duel. Each one bumps users/{uid}.practiceCount["YYYY-MM-DD"] (the player's
 * local day); at most PRACTICE_DAILY_CAP a day count (countedPractices).
 *
 * No child ever goes down: users/{uid}.rankFloor holds the highest RankKey
 * reached (server-written only, the browser cannot write users/*). The rank
 * shown is max(rank from points, rankFloor), and whenever a higher rank is
 * computed here the floor is raised.
 */
import { getAdminDb } from "@/lib/firebase-admin";
import { isNotFoundMeaning } from "@/lib/not-a-word";
import {
  PRACTICE_DAILY_CAP,
  computeGamification,
  countedPractices,
  isRankKey,
  rankIndexOf,
  toLocalDateStr,
  type RankInfo,
  type RankKey,
} from "@/lib/gamification";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export type NotebookRow = { word: string; addedAt: string; source: string; understood: boolean };

export type RankState = {
  words: number;
  practices: number;
  points: number;
  rank: RankInfo;
  rankFloor: RankKey | null;
  streak: number;
  practiceDays: string[];
  /** Every notebook word that counts (has addedAt, not a "not found" lookup). */
  rows: NotebookRow[];
};

/** Record one completed practice for `uid` on local `day`. Returns whether it
 *  counts toward points (false once the day already has the cap). */
export async function recordPractice(uid: string, day: string): Promise<{ counted: boolean }> {
  if (!uid || !DAY_RE.test(day)) return { counted: false };
  const ref = getAdminDb().collection("users").doc(uid);
  return getAdminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const counts = (snap.get("practiceCount") ?? {}) as Record<string, unknown>;
    const cur = typeof counts[day] === "number" ? (counts[day] as number) : 0;
    tx.set(ref, { practiceCount: { [day]: cur + 1 } }, { merge: true });
    return { counted: cur < PRACTICE_DAILY_CAP };
  });
}

/** Read everything the rank needs for one user, compute it, and raise the
 *  stored floor when the computed rank is higher. */
export async function getRankState(uid: string, nowMs = Date.now()): Promise<RankState> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);
  const [userSnap, nbSnap] = await Promise.all([
    userRef.get(),
    userRef.collection("notebook").select("addedAt", "word", "source", "meaning", "understood").get(),
  ]);
  const rows: NotebookRow[] = [];
  for (const d of nbSnap.docs) {
    const x = d.data() as { addedAt?: unknown; word?: unknown; source?: unknown; meaning?: unknown; understood?: unknown };
    const addedAt = typeof x.addedAt === "string" ? x.addedAt : "";
    if (!addedAt) continue;
    // Same rule as GET /api/notebook: a "not found" lookup is not a word.
    if (isNotFoundMeaning(typeof x.meaning === "string" ? x.meaning : null)) continue;
    rows.push({
      word: typeof x.word === "string" ? x.word : "",
      addedAt,
      source: typeof x.source === "string" ? x.source : "",
      understood: x.understood === true,
    });
  }
  const pd = userSnap.get("practiceDays");
  const practiceDays = Array.isArray(pd) ? pd.filter((d): d is string => typeof d === "string" && DAY_RE.test(d)) : [];
  const storedFloor = userSnap.get("rankFloor");
  const rankFloor = isRankKey(storedFloor) ? storedFloor : null;
  const practices = countedPractices(userSnap.get("practiceCount"));
  const g = computeGamification(rows.map((r) => r.addedAt), nowMs, toLocalDateStr(new Date(nowMs).toISOString()), {
    practices,
    practiceDays,
    rankFloor,
  });
  let floor = rankFloor;
  // Scout is everyone's start, so it is never written.
  if (g.rank.index > Math.max(0, rankIndexOf(rankFloor))) {
    floor = g.rank.key;
    await userRef.set({ rankFloor: g.rank.key }, { merge: true }).catch((e) => {
      console.error(`[rank-points] rankFloor write failed for ${uid}:`, e);
    });
  }
  return {
    words: g.distinct,
    practices: g.practices,
    points: g.points,
    rank: g.rank,
    rankFloor: floor,
    streak: g.streak,
    practiceDays,
    rows,
  };
}
