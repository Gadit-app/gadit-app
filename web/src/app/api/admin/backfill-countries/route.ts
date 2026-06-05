import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin tool — backfill `country` on existing /users/{uid} docs.
 *
 * Country normally fills in automatically the next time a user hits any
 * authenticated API endpoint (the recordUserActivity helper reads
 * `x-vercel-ip-country` from Vercel's edge geo header). This endpoint
 * fills it in proactively, before they return, by joining against two
 * deterministic data sources we already have:
 *
 *   1. STRIPE BILLING COUNTRY  (highest confidence)
 *      Anyone with a stripeCustomerId on their /users/{uid} doc has a
 *      Stripe Customer record whose address.country is the ISO-2 their
 *      card was issued in. We pull that.
 *
 *   2. (optional, opt-in) IP GEOLOCATION via ipapi.co
 *      Reserved for the rare case where we've stored a `lastIp` on the
 *      doc but no country (e.g. if the Vercel edge header was empty for
 *      that request). Disabled by default because we don't actually
 *      store lastIp anywhere today, and adding it has GDPR implications.
 *
 *   Free users with no Stripe Customer get no backfill — they'll get a
 *   country on next visit automatically. This is fine; the admin UI
 *   shows "—" until then.
 *
 * USAGE:
 *   POST /api/admin/backfill-countries?secret=$ADMIN_SECRET
 *   Optional: &dryRun=1     report what would change, no writes
 *
 * Response:
 *   {
 *     dryRun, scanned, alreadyHadCountry,
 *     filledFromStripe, filledFromIp, noSource,
 *     errors,
 *   }
 */

export const maxDuration = 300;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET env var not configured — refusing to run" },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";

  const auth = getAdminAuth();
  const db   = getAdminDb();

  // 1) Enumerate every Auth user (paginated, 1000/page max from Firebase Auth)
  type UidEmail = { uid: string; email: string | null };
  const all: UidEmail[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    page.users.forEach((u) => all.push({ uid: u.uid, email: u.email ?? null }));
    pageToken = page.pageToken;
  } while (pageToken);

  // 2) Bulk-load Firestore docs
  const docs = new Map<string, FirebaseFirestore.DocumentData>();
  const CHUNK = 400;
  for (let i = 0; i < all.length; i += CHUNK) {
    const refs = all.slice(i, i + CHUNK).map((u) => db.collection("users").doc(u.uid));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) {
      if (snap.exists) docs.set(snap.id, snap.data() ?? {});
    }
  }

  let alreadyHadCountry = 0;
  let filledFromStripe = 0;
  const filledFromIp = 0;
  let noSource = 0;
  const errors: Array<{ uid: string; reason: string }> = [];

  for (const u of all) {
    const data = docs.get(u.uid) ?? {};
    if (data.country) {
      alreadyHadCountry++;
      continue;
    }

    // -- Source 1: Stripe billing address --
    const customerId = data.stripeCustomerId as string | undefined;
    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted) {
          // address.country is ISO 3166-1 alpha-2 when present
          const country = customer.address?.country?.toUpperCase() ?? null;
          if (country) {
            if (!dryRun) {
              await db.collection("users").doc(u.uid).set(
                {
                  country,
                  countryUpdatedAt: FieldValue.serverTimestamp(),
                  countrySource: "stripe_billing",
                },
                { merge: true },
              );
            }
            filledFromStripe++;
            continue;
          }
        }
      } catch (e) {
        errors.push({ uid: u.uid, reason: `stripe lookup failed: ${String(e)}` });
      }
    }

    // -- Source 2: ipapi.co on a stored lastIp --
    // Not enabled by default. We don't persist lastIp today; flip this on
    // only if you start storing it in recordUserActivity. Stub left here
    // as documentation for the future.
    //
    // const lastIp = data.lastIp as string | undefined;
    // if (lastIp) {
    //   try {
    //     const r = await fetch(`https://ipapi.co/${encodeURIComponent(lastIp)}/country/`);
    //     if (r.ok) {
    //       const country = (await r.text()).trim().toUpperCase();
    //       if (country && /^[A-Z]{2}$/.test(country)) {
    //         if (!dryRun) {
    //           await db.collection("users").doc(u.uid).set(
    //             { country, countryUpdatedAt: FieldValue.serverTimestamp(), countrySource: "ipapi" },
    //             { merge: true },
    //           );
    //         }
    //         filledFromIp++;
    //         continue;
    //       }
    //     }
    //   } catch (e) {
    //     errors.push({ uid: u.uid, reason: `ipapi lookup failed: ${String(e)}` });
    //   }
    // }

    noSource++;
  }

  return NextResponse.json({
    dryRun,
    scanned: all.length,
    alreadyHadCountry,
    filledFromStripe,
    filledFromIp,
    noSource,
    errors,
    note:
      noSource > 0
        ? "Users in `noSource` will get a country automatically the next time they hit an authenticated API endpoint."
        : undefined,
  });
}
