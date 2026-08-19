/**
 * GET /api/yooniz/sso?token=<launch token>
 *
 * Gadit side of the Yooniz ⇄ Gadit SSO bridge (Phase-1 MVP). A Yooniz kid
 * taps "המילון שלי" → Yooniz mints a signed launch token → full-page navigate
 * here → this route verifies the token, resolves (or auto-provisions) the
 * linked Gadit Family, resolves (or creates) the Gadit member for that kid,
 * mints a Gadit custom token, and returns a tiny page that signs the child in
 * and drops them into THEIR OWN notebook. Zero password, zero cross-charge.
 *
 * Source of truth: YOONIZ_INTEGRATION_CONTRACT.md (repo root). Built by
 * extending the existing family-pairing pattern — this reuses the exact
 * synthetic-user + custom-token shape from api/family/pair/redeem, and the
 * bootstrap-family shape from the Stripe webhook. The pairing routes
 * themselves are untouched.
 *
 * Security (contract §7): HTTPS only, 120s token TTL, constant-time HMAC
 * compare, one-time nonce (replay cache). A token only ever touches members
 * of ITS linked family — every member is bound to its Yooniz kidId.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { syntheticUidFor, MAX_KIDS_PER_FAMILY, type MemberRole } from "@/lib/family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

type Payload = {
  v: number;
  yoonizFamilyId: string;
  kidId: string;
  kidName: string;
  role: "boy" | "girl";
  parentEmail: string;
  iat: number;
  nonce: string;
};

function b64urlToBuf(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/** Verify the launch token (contract §1). Returns the payload or null. */
function verifyToken(token: string, secret: string): Payload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [p, sig] = parts;
  const expected = crypto.createHmac("sha256", secret).update(p).digest();
  const got = b64urlToBuf(sig);
  if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) return null;
  let payload: Payload;
  try {
    payload = JSON.parse(b64urlToBuf(p).toString("utf8"));
  } catch {
    return null;
  }
  if (payload.v !== 1) return null;
  if (payload.role !== "boy" && payload.role !== "girl") return null;
  if (!payload.yoonizFamilyId || !payload.kidId || !payload.parentEmail || !payload.nonce) return null;
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.iat !== "number" || Math.abs(nowSec - payload.iat) > 120) return null;
  return payload;
}

/** Full-screen message page (errors + the sign-in handoff share this shell). */
function page(bodyMsg: string, script = ""): NextResponse {
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gadit</title>
<style>html,body{height:100%}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Rubik,sans-serif;display:flex;align-items:center;justify-content:center;background:#F2F6F4;color:#14181F;text-align:center;padding:24px}
.wm{font-weight:800;font-size:26px;margin-bottom:14px}.wm i{color:#0EA5A5;font-style:italic}.msg{font-size:16px;color:#3A3F4B}</style></head>
<body><div><div class="wm" dir="ltr">Gad<i>it</i></div><div class="msg" id="msg">${bodyMsg}</div></div>${script}</body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(req: NextRequest) {
  const secret = process.env.YOONIZ_GADIT_SSO_SECRET;
  if (!secret) return page("שירות ההתחברות אינו מוגדר.");

  const token = req.nextUrl.searchParams.get("token") || "";
  if (!token) return page("קישור לא תקין.");

  const payload = verifyToken(token, secret);
  if (!payload) return page("הקישור פג תוקף או אינו תקין. נסו שוב מ-Yooniz.");

  const db = getAdminDb();
  const auth = getAdminAuth();
  const iso = new Date().toISOString();

  try {
    // One-time nonce (replay guard, contract §1.3 / §7).
    const nonceRef = db.collection("yoonizNonces").doc(payload.nonce);
    if ((await nonceRef.get()).exists) return page("הקישור כבר נוצל. נסו שוב מ-Yooniz.");
    await nonceRef.set({ at: Date.now() });

    // ── §2 Resolve (or auto-provision) the linked Gadit Family ────────────
    const email = payload.parentEmail.toLowerCase().trim();
    const linkRef = db.collection("yoonizLinks").doc(payload.yoonizFamilyId);
    const linkSnap = await linkRef.get();
    let gaditFamilyId: string;
    if (linkSnap.exists && (linkSnap.data() as { gaditFamilyId?: string }).gaditFamilyId) {
      gaditFamilyId = (linkSnap.data() as { gaditFamilyId: string }).gaditFamilyId;
    } else {
      // Find the Gadit auth user for this parent email, or create one.
      let ownerUid: string;
      try {
        ownerUid = (await auth.getUserByEmail(email)).uid;
      } catch {
        ownerUid = (await auth.createUser({ email })).uid;
      }
      // Ensure a Family exists on that owner. If not, bootstrap it with a
      // Phase-1 free trial (mirrors the webhook's bootstrapFamily).
      const famRef = db.collection("families").doc(ownerUid);
      if (!(await famRef.get()).exists) {
        await famRef.set({ ownerUid, plan: "monthly", createdAt: iso, yoonizProvisioned: true });
        await famRef.collection("members").doc(ownerUid).set({
          id: ownerUid, role: "mother", name: "", colorIndex: 0, isOwner: true, userId: ownerUid, createdAt: iso,
        });
        // Grant the entitlement (Family === feature-plan "deep") so the kid's
        // access passes. Phase-1 = free trial; Phase-2 enforces the trial end.
        await db.collection("users").doc(ownerUid).set(
          { plan: "deep", familyId: ownerUid, yoonizTrial: true, updatedAt: iso },
          { merge: true },
        );
      }
      gaditFamilyId = ownerUid;
      await linkRef.set({ gaditFamilyId, linkedAt: iso }, { merge: true });
    }

    // ── §4 Entitlement: only enter the notebook if the Family is active ───
    const ownerUserSnap = await db.collection("users").doc(gaditFamilyId).get();
    if ((ownerUserSnap.data() as { plan?: string })?.plan !== "deep") {
      // Lapsed / never-active Family → upsell instead of the notebook.
      return NextResponse.redirect(new URL("/he/families", req.url), 302);
    }

    // ── §3 Resolve (or create) the Gadit member for this Yooniz kid ───────
    const membersRef = db.collection("families").doc(gaditFamilyId).collection("members");
    const existing = await membersRef.where("yoonizKidId", "==", payload.kidId).limit(1).get();
    let memberId: string;
    const role = payload.role as MemberRole; // "boy" | "girl"
    if (!existing.empty) {
      memberId = existing.docs[0].id;
    } else {
      const all = await membersRef.get();
      const kidCount = all.docs.filter((d) => {
        const r = (d.data() as { role?: string }).role;
        return r === "boy" || r === "girl";
      }).length;
      if (kidCount >= MAX_KIDS_PER_FAMILY) {
        return page("המשפחה כבר הגיעה למקסימום הילדים בגדית. הסירו ילד קיים כדי להוסיף חדש.");
      }
      const newRef = membersRef.doc();
      memberId = newRef.id;
      await newRef.set({
        id: memberId, role, name: payload.kidName || "", colorIndex: all.size % 8,
        isOwner: false, yoonizKidId: payload.kidId, createdAt: iso,
      });
    }

    // Synthetic user + custom token — exactly the pair/redeem shape.
    const syntheticUid = syntheticUidFor(gaditFamilyId, memberId);
    try {
      await auth.getUser(syntheticUid);
    } catch {
      await auth.createUser({ uid: syntheticUid, displayName: payload.kidName || undefined });
    }
    await db.collection("users").doc(syntheticUid).set(
      { plan: "deep", familyId: gaditFamilyId, memberId, memberRole: role, familyRole: "kid", yoonizKidId: payload.kidId, createdAt: iso },
      { merge: true },
    );
    await membersRef.doc(memberId).set({ userId: syntheticUid, deviceLinkedAt: iso }, { merge: true });

    const customToken = await auth.createCustomToken(syntheticUid, {
      role: "kid",
      familyId: gaditFamilyId,
      memberId,
    });

    // ── §3.5 Client-side sign-in handoff → the child's own notebook ───────
    const cfg = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    const script = `<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
(async () => {
  try {
    const app = initializeApp(${JSON.stringify(cfg)});
    const auth = getAuth(app);
    await signInWithCustomToken(auth, ${JSON.stringify(customToken)});
    location.replace("/he/notebook");
  } catch (e) {
    console.error(e);
    document.getElementById("msg").textContent = "שגיאת התחברות. נסו שוב מ-Yooniz.";
  }
})();
</script>`;
    return page("מתחבר למחברת אוצר המילים…", script);
  } catch (err) {
    console.error("[/api/yooniz/sso] error:", err);
    return page("שגיאה זמנית. נסו שוב עוד רגע.");
  }
}
