import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { sendPushToOwner } from "@/lib/push";

/**
 * VAPID / Web Push health check + per-owner diagnostics. Admin-only.
 *
 *   GET /api/family/push/status?secret=$ADMIN_SECRET
 *     → VAPID env presence + key match (booleans only, no secrets).
 *
 *   ...&email=<owner>  (or &uid=<ownerUid>)
 *     → also reports how many push subscriptions that owner has stored.
 *
 *   ...&email=<owner>&test=1
 *     → also sends a test push to that owner and reports how many
 *       devices it reached (0 = no live subscription).
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const secret = sp.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not set" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const pub = process.env.VAPID_PUBLIC_KEY ?? "";
  const pubClient = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const priv = process.env.VAPID_PRIVATE_KEY ?? "";
  const subject = process.env.VAPID_SUBJECT ?? "";
  const ready = !!pub && !!pubClient && !!priv && pub === pubClient;

  const out: Record<string, unknown> = {
    ready,
    VAPID_PUBLIC_KEY: !!pub,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: !!pubClient,
    VAPID_PRIVATE_KEY: !!priv,
    VAPID_SUBJECT: subject || null,
    publicKeysMatch: !!pub && pub === pubClient,
    publicKeyLen: pub.length,
    privateKeyLen: priv.length,
  };

  const email = sp.get("email")?.trim();
  let ownerUid = sp.get("uid")?.trim() || "";
  if (!ownerUid && email) {
    try {
      ownerUid = (await getAdminAuth().getUserByEmail(email)).uid;
    } catch {
      out.ownerLookup = "not_found";
    }
  }
  if (ownerUid) {
    out.ownerUid = ownerUid;
    const subs = await getAdminDb().collection("families").doc(ownerUid).collection("pushSubs").get();
    out.pushSubscriptions = subs.size;
    out.pushEndpoints = subs.docs.map((d) => {
      const ep = (d.data()?.endpoint as string | undefined) ?? "";
      // just the push service host, no token — enough to tell devices apart
      try { return new URL(ep).host; } catch { return "?"; }
    });
    if (sp.get("test") === "1") {
      out.testPushDelivered = await sendPushToOwner(ownerUid, {
        title: "Gadit",
        body: "בדיקת התראה ✓ Test alert",
        url: "/family",
        tag: "gadit-test",
      });
    }
  }

  return NextResponse.json(out);
}
