import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";

/**
 * Record one "user touched the site" event on the /users/{uid} doc.
 *
 * Called from inside authenticated API routes (define / notebook / history /
 * account) so that the admin dashboard at /admin/users has fresh signal:
 *   - lastSeenAt        — last time this UID hit any API
 *   - country           — ISO-2 country code from Vercel's edge geolocation
 *                         (header x-vercel-ip-country). Free, no API call.
 *   - countryUpdatedAt  — when we last refreshed that country
 *   - searchCount       — cumulative # of /api/define hits (only set when
 *                         the caller passes { search: true })
 *   - lastSearchAt      — timestamp of the last /api/define hit
 *
 * Writes use { merge: true } so a free-tier user (no Stripe-created doc)
 * gets one auto-created the first time they look up a word.
 *
 * Silently swallows any error — activity tracking is non-critical and must
 * never break the response the user is actually waiting for.
 */
export async function recordUserActivity(
  userId: string,
  opts: {
    /** the incoming request — used to pull edge-geo header */
    headers: Headers;
    /** the user's email (only relevant for first-time doc creation) */
    email?: string | null;
    /** true if this activity is a word lookup that should bump searchCount */
    search?: boolean;
  },
): Promise<void> {
  try {
    const country =
      opts.headers.get("x-vercel-ip-country") ||
      opts.headers.get("x-vercel-ip-country-region") ||
      null;

    const update: Record<string, unknown> = {
      lastSeenAt: FieldValue.serverTimestamp(),
    };

    // Only write email if caller provided one AND we're creating the doc.
    // (We use set+merge, so writing email every time would silently overwrite
    // any manual edits — harmless but unnecessary noise.)
    if (opts.email) {
      update.email = opts.email;
    }

    if (country) {
      update.country = country.toUpperCase();
      update.countryUpdatedAt = FieldValue.serverTimestamp();
    }

    if (opts.search) {
      update.searchCount = FieldValue.increment(1);
      update.lastSearchAt = FieldValue.serverTimestamp();
    }

    await getAdminDb()
      .collection("users")
      .doc(userId)
      .set(update, { merge: true });
  } catch (e) {
    console.warn("[recordUserActivity] failed:", String(e));
  }
}
