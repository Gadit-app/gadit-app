import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { INTERNAL_EMAILS } from "@/lib/internal-accounts";

/**
 * Admin — activity statistics by day, week, month or year (Gadi
 * 2026-10-10), for the top of /admin/activity. Humans only (crawlers are
 * flagged on each row) and never our own accounts.
 *
 * GET ?secret=…&range=day|week|month|year
 *   → { range, buckets: [{ key, label, searches, images, people, words }], current, previous }
 * day = the last 30 days, week = 12 weeks, month = 12 months, year = 3 years.
 * Times in Israel time; weeks start on Sunday.
 */
export const maxDuration = 30;

type Range = "day" | "week" | "month" | "year";
const SPAN: Record<Range, number> = { day: 30, week: 12, month: 12, year: 3 };

function ilParts(ms: number): { y: number; m: number; d: number; dow: number } {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(new Date(ms));
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { y: +g("year"), m: +g("month"), d: +g("day"), dow: dows.indexOf(g("weekday")) };
}
const pad = (n: number) => String(n).padStart(2, "0");

function bucketKey(ms: number, r: Range): string {
  const { y, m, d, dow } = ilParts(ms);
  if (r === "year") return `${y}`;
  if (r === "month") return `${y}-${pad(m)}`;
  if (r === "day") return `${y}-${pad(m)}-${pad(d)}`;
  const t = new Date(Date.UTC(y, m - 1, d - dow));
  return t.toISOString().slice(0, 10);
}

/** The last N bucket keys, oldest first. */
function lastKeys(r: Range, now: number): string[] {
  const keys: string[] = [];
  const { y, m, d, dow } = ilParts(now);
  for (let i = SPAN[r] - 1; i >= 0; i--) {
    if (r === "year") keys.push(`${y - i}`);
    else if (r === "month") { const t = new Date(Date.UTC(y, m - 1 - i, 1)); keys.push(`${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}`); }
    else if (r === "day") keys.push(new Date(Date.UTC(y, m - 1, d - i)).toISOString().slice(0, 10));
    else keys.push(new Date(Date.UTC(y, m - 1, d - dow - 7 * i)).toISOString().slice(0, 10));
  }
  return keys;
}

function startMs(r: Range, keys: string[]): number {
  const k = keys[0];
  const iso = r === "year" ? `${k}-01-01` : r === "month" ? `${k}-01` : k;
  return Date.parse(`${iso}T00:00:00+03:00`) - 86_400_000; // a day of slack for the time zone
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rp = req.nextUrl.searchParams.get("range");
  const range: Range = rp === "week" || rp === "month" || rp === "year" ? rp : "day";

  const now = Date.now();
  const keys = lastKeys(range, now);
  const db = getAdminDb();

  // Our own accounts, by uid.
  const internal = new Set<string>();
  await Promise.all([...INTERNAL_EMAILS].map(async (e) => { try { internal.add((await getAdminAuth().getUserByEmail(e)).uid); } catch { /* none */ } }));

  const snap = await db.collection("activityLog")
    .where("atMs", ">=", startMs(range, keys))
    .select("kind", "count", "uid", "ua", "country", "isBot", "atMs", "word")
    .get();

  const B = new Map(keys.map((k) => [k, { key: k, searches: 0, images: 0, people: new Set<string>(), words: new Set<string>() }]));
  for (const doc of snap.docs) {
    const x = doc.data() as { kind?: string; count?: number; uid?: string | null; ua?: string | null; country?: string | null; isBot?: boolean; atMs?: number; word?: string };
    if (x.isBot) continue;
    if (x.uid && (internal.has(x.uid) || internal.has(x.uid.split("_")[0]))) continue;
    const b = B.get(bucketKey(x.atMs ?? 0, range));
    if (!b) continue;
    const n = Number(x.count ?? 1);
    if (x.kind === "image") b.images += n;
    else { b.searches += n; if (x.word) b.words.add(x.word.toLowerCase()); }
    b.people.add(x.uid || `anon:${x.country ?? ""}:${x.ua ?? ""}`);
  }
  const buckets = keys.map((k) => { const b = B.get(k)!; return { key: k, searches: b.searches, images: b.images, people: b.people.size, words: b.words.size }; });
  return NextResponse.json({ range, buckets, current: buckets.at(-1), previous: buckets.at(-2) ?? null });
}
