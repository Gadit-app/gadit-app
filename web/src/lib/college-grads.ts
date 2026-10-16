import { createHash } from "node:crypto";

/**
 * Coach-track graduates of the college (New Education), as published by the
 * college site: sha256 of each e-mail (trim + lowercase) and of the last 9
 * digits of each phone. No plain address or number ever reaches Gadit.
 * Graduate = anyone who ever enrolled in the track, finished or not.
 *
 * The list lives only in this process's memory for an hour (Gadi
 * 2026-10-16: never persisted to the database). If the college endpoint is
 * down, every check answers "not a graduate" and the next call tries again,
 * so a signup is never delayed or failed by it.
 */
const URL = "https://neweducation.co.il/wp-json/yooniz-grads/v1/hashes";
const TTL_MS = 60 * 60 * 1000;
const RETRY_MS = 5 * 60 * 1000; // after a failure, don't hammer the college site

type GradSets = { emails: Set<string>; phones: Set<string> };
let cache: { at: number; sets: GradSets | null } | null = null;
let inflight: Promise<GradSets | null> | null = null;

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export function emailHash(email: string | null | undefined): string | null {
  const e = (email ?? "").trim().toLowerCase();
  return e.includes("@") ? sha(e) : null;
}

export function phoneHash(phone: string | null | undefined): string | null {
  const d = (phone ?? "").replace(/\D/g, "");
  return d.length >= 9 ? sha(d.slice(-9)) : null;
}

async function fetchSets(): Promise<GradSets | null> {
  const secret = process.env.COLLEGE_GRADS_SECRET;
  if (!secret) return null;
  try {
    const res = await fetch(URL, {
      headers: { "X-College-Secret": secret, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.warn(`[college-grads] list unavailable: HTTP ${res.status}`);
      return null;
    }
    const body = (await res.json()) as { emails?: unknown; phones?: unknown };
    const clean = (a: unknown) =>
      new Set((Array.isArray(a) ? a : []).filter((h): h is string => typeof h === "string" && /^[0-9a-f]{64}$/i.test(h)).map((h) => h.toLowerCase()));
    return { emails: clean(body.emails), phones: clean(body.phones) };
  } catch (e) {
    console.warn("[college-grads] list fetch failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** The graduate hash sets, or null when the college list can't be read now. */
export async function getGradSets(): Promise<GradSets | null> {
  const now = Date.now();
  if (cache && now - cache.at < (cache.sets ? TTL_MS : RETRY_MS)) return cache.sets;
  if (!inflight) {
    inflight = fetchSets().then((sets) => {
      cache = { at: Date.now(), sets };
      inflight = null;
      return sets;
    });
  }
  return inflight;
}

/** true = matched the list, false = not on it, null = list unavailable. */
export async function isCollegeGrad(email: string | null | undefined, phones: (string | null | undefined)[] = []): Promise<boolean | null> {
  const sets = await getGradSets();
  if (!sets) return null;
  const eh = emailHash(email);
  if (eh && sets.emails.has(eh)) return true;
  for (const p of phones) {
    const ph = phoneHash(p);
    if (ph && sets.phones.has(ph)) return true;
  }
  return false;
}
