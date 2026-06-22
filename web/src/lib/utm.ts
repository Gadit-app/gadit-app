/**
 * UTM capture — first-touch attribution.
 *
 * When a visitor lands on the site with utm_* params in the URL (typical
 * after clicking a bio link on Instagram / Facebook / TikTok), we stash
 * the source, medium and campaign in localStorage. If they go on to
 * sign up later (immediately or days afterwards), the signup flow reads
 * these and persists them on the /users/{uid} doc so the /admin/campaigns
 * dashboard can attribute the signup to its source.
 *
 * "First-touch" rule: once we've captured a set of UTMs, we don't
 * overwrite them on subsequent visits as long as the original capture
 * is still within the 30-day TTL. The thinking: if someone clicked an
 * IG bio link, browsed around, then came back later via a Google search,
 * the IG link is what created the relationship — attribution belongs
 * there. After 30 days the stale capture expires and the next UTM-bearing
 * visit gets to set the new value.
 *
 * No PII, no tracking ID — just the campaign tag the marketer chose.
 * Stored in localStorage only (no cookie) so it's same-device-only and
 * never sent on any request the user didn't initiate.
 */

const UTM_STORAGE_KEY = "gadit_utm_v1";
const UTM_TTL_MS = 30 * 86_400_000; // 30 days

export type UtmData = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  capturedAt: number;       // epoch ms
  landingPath?: string;     // first page they hit, for context
};

const FIELDS: Array<keyof Omit<UtmData, "capturedAt" | "landingPath">> = [
  "source", "medium", "campaign", "term", "content",
];

/**
 * Read utm_* params off the current URL and persist them if any are
 * present. Idempotent — call from a top-level useEffect on every page
 * load; only the first UTM-bearing visit in any 30-day window actually
 * writes.
 */
export function captureUtmFromUrl(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const captured: UtmData = { capturedAt: Date.now() };
    let any = false;
    for (const f of FIELDS) {
      const v = params.get(`utm_${f}`);
      if (v) {
        // Cap each value at 100 chars — defensive against weird campaign
        // tags that try to stuff a payload into the URL.
        captured[f] = v.slice(0, 100);
        any = true;
      }
    }
    if (!any) return;

    // First-touch — don't overwrite a fresh existing record.
    const existing = getStoredUtms();
    if (existing && Date.now() - existing.capturedAt < UTM_TTL_MS) {
      return;
    }

    // Stash the landing path too — useful when interpreting attribution
    // ("the IG bio link points to /he/ — did they actually land there?").
    captured.landingPath = window.location.pathname.slice(0, 200);

    window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
  } catch {
    // localStorage can throw in private mode / quota exceeded — ignore.
  }
}

export function getStoredUtms(): UtmData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UtmData;
    if (!parsed || typeof parsed.capturedAt !== "number") return null;
    if (Date.now() - parsed.capturedAt > UTM_TTL_MS) {
      window.localStorage.removeItem(UTM_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredUtms(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(UTM_STORAGE_KEY); } catch { /* ignore */ }
}
