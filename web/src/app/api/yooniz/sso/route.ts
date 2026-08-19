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
import { syntheticUidFor, isParentRole, MAX_KIDS_PER_FAMILY, type MemberRole } from "@/lib/family";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

// Member-generic token: any family member opens their own Gadit space.
type Payload = {
  v: number;
  yoonizFamilyId: string;
  parentEmail: string; // the Gadit Family owner key (always)
  isOwner: boolean; // true → sign into the Family OWNER account (memberId ignored)
  memberId?: string; // non-owner only → one Gadit member + personal area
  memberName?: string; // display name, e.g. "אבא" / "דין"
  role?: "father" | "mother" | "boy" | "girl";
  iat: number;
  nonce: string;
};

function b64urlToBuf(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/** Casefold + collapse whitespace, for matching a Yooniz member to an existing
 *  Gadit profile by name (the fallback when there's no stable id link yet). */
function normalizeName(s?: unknown): string {
  return typeof s === "string" ? s.trim().replace(/\s+/g, " ").toLowerCase() : "";
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
  payload.isOwner = payload.isOwner === true;
  if (!payload.yoonizFamilyId || !payload.parentEmail || !payload.nonce) return null;
  if (!payload.isOwner) {
    // Non-owner tokens must carry a stable memberId + a valid family role.
    if (!payload.memberId) return null;
    if (!["father", "mother", "boy", "girl"].includes(payload.role as string)) return null;
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.iat !== "number" || Math.abs(nowSec - payload.iat) > 120) return null;
  return payload;
}

/** Full-screen message page — used ONLY for error/blocked states (a token that
 *  failed, a full family). Shows the wordmark + a short line of text. */
function page(bodyMsg: string): NextResponse {
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gadit</title>
<style>html,body{height:100%}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Rubik,sans-serif;display:flex;align-items:center;justify-content:center;background:#F2F6F4;color:#14181F;text-align:center;padding:24px}
.wm{font-weight:800;font-size:26px;margin-bottom:14px}.wm i{color:#0EA5A5;font-style:italic}.msg{font-size:16px;color:#3A3F4B}</style></head>
<body><div><div class="wm" dir="ltr">Gad<i>it</i></div><div class="msg">${bodyMsg}</div></div></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

/** Minimal sign-in handoff page: ONLY a spinner — no dictionary UI, no wordmark
 *  flash. The child never sees a screen; `location.replace` drops them straight
 *  into their notebook. On failure the script reveals #err. */
function spinnerPage(script: string): NextResponse {
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gadit</title>
<style>html,body{height:100%}body{margin:0;background:#F2F6F4;display:flex;align-items:center;justify-content:center}
.spin{width:38px;height:38px;border-radius:50%;border:3px solid rgba(14,165,165,.25);border-top-color:#0EA5A5;animation:r .8s linear infinite}
.err{display:none;font-family:system-ui,-apple-system,Segoe UI,Rubik,sans-serif;color:#3A3F4B;font-size:16px;text-align:center;padding:24px}
@keyframes r{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.spin{animation-duration:2s}}</style></head>
<body><div class="spin" id="spin" role="status" aria-label="טוען"></div><div class="err" id="err"></div>${script}</body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

/** The client-side sign-in handoff: signs in with the minted custom token, then
 *  hard-replaces into the notebook. Shared by the kid and parent branches. */
function signInScript(customToken: string): string {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  return `<script type="module">
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
    document.getElementById("spin").style.display = "none";
    const el = document.getElementById("err");
    el.style.display = "block";
    el.textContent = "שגיאת התחברות. נסו שוב מ-Yooniz.";
  }
})();
</script>`;
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

    // ── §2/§4 Resolve the Gadit Family owner by email. NO auto-provision, NO
    //    card-less trial (contract corrected 19/8): entry requires an ACTIVE
    //    PAID Gadit Family (plan "deep" + a families doc). A non-subscriber is
    //    sent to the Stripe Family checkout / landing — nowhere else, nothing
    //    created. Once they subscribe there, the next launch resolves them. ────
    const email = payload.parentEmail.toLowerCase().trim();
    const upsell = () => NextResponse.redirect(new URL("/he/families", req.url), 302);

    let ownerUid: string | null = null;
    try {
      ownerUid = (await auth.getUserByEmail(email)).uid;
    } catch {
      ownerUid = null; // no Gadit account for this email → promo, don't provision
    }
    if (!ownerUid) return upsell();

    const [ownerUserSnap, famSnap] = await Promise.all([
      db.collection("users").doc(ownerUid).get(),
      db.collection("families").doc(ownerUid).get(),
    ]);
    const activeFamily = famSnap.exists && (ownerUserSnap.data() as { plan?: string })?.plan === "deep";
    if (!activeFamily) return upsell();

    const gaditFamilyId = ownerUid;
    // Persist the mapping now that we've confirmed a real active subscriber.
    await db.collection("yoonizLinks").doc(payload.yoonizFamilyId).set({ gaditFamilyId, linkedAt: iso }, { merge: true });

    // ── isOwner === true: sign into the Family OWNER account (the real Gadit
    //    user for parentEmail). gaditFamilyId IS the owner uid in our model
    //    (families doc id === ownerUid). memberId is ignored here. ────────────
    if (payload.isOwner) {
      const ownerToken = await auth.createCustomToken(gaditFamilyId, {
        role: "parent",
        familyId: gaditFamilyId,
      });
      return spinnerPage(signInScript(ownerToken));
    }

    // ── §3 isOwner === false: match the member to their EXISTING Gadit
    //    profile — NEVER duplicate (Gadi 19/8: opening דין/אושר from Yooniz
    //    spawned second profiles). Fetch all members once, resolve in memory:
    //      1. exact stable id link (yoonizKidId OR legacy yoonizMemberId)
    //      2. else normalized name within the same kid/parent class → backfill
    //         the id onto that existing profile so the link is stable after
    //      3. only if genuinely no match: create a new member ─────────────────
    const membersRef = db.collection("families").doc(gaditFamilyId).collection("members");
    const role = payload.role as MemberRole; // father | mother | boy | girl
    const familyRole = isParentRole(role) ? "parent" : "kid";
    const wantName = normalizeName(payload.memberName);

    const all = await membersRef.get();
    const docs = all.docs.map((d) => ({ id: d.id, ref: d.ref, m: d.data() as Record<string, unknown> }));
    let memberId: string | null = null;

    const byId = docs.find((x) => x.m.yoonizKidId === payload.memberId || x.m.yoonizMemberId === payload.memberId);
    if (byId) {
      memberId = byId.id;
    } else if (wantName) {
      const cands = docs.filter(
        (x) =>
          !x.m.isOwner &&
          isParentRole(x.m.role as MemberRole) === (familyRole === "parent") &&
          normalizeName(x.m.name) === wantName,
      );
      const pick = cands.find((x) => !x.m.yoonizKidId && !x.m.yoonizMemberId) || cands[0];
      if (pick) {
        memberId = pick.id;
        await pick.ref.set({ yoonizKidId: payload.memberId }, { merge: true }); // stable link from now on
      }
    }

    if (!memberId) {
      // Genuinely new member. The 5-member cap applies to KIDS only.
      if (familyRole === "kid") {
        const kidCount = docs.filter((x) => x.m.role === "boy" || x.m.role === "girl").length;
        if (kidCount >= MAX_KIDS_PER_FAMILY) {
          return page("המשפחה כבר הגיעה למקסימום הילדים בגדית. הסירו ילד קיים כדי להוסיף חדש.");
        }
      }
      const newRef = membersRef.doc();
      memberId = newRef.id;
      await newRef.set({
        id: memberId, role, name: payload.memberName || "", colorIndex: docs.length % 8,
        isOwner: false, yoonizKidId: payload.memberId, createdAt: iso,
      });
    }

    // Synthetic user + custom token — exactly the pair/redeem shape.
    const syntheticUid = syntheticUidFor(gaditFamilyId, memberId);
    try {
      await auth.getUser(syntheticUid);
    } catch {
      await auth.createUser({ uid: syntheticUid, displayName: payload.memberName || undefined });
    }
    await db.collection("users").doc(syntheticUid).set(
      { plan: "deep", familyId: gaditFamilyId, memberId, memberRole: role, familyRole, yoonizKidId: payload.memberId, createdAt: iso },
      { merge: true },
    );
    await membersRef.doc(memberId).set({ userId: syntheticUid, deviceLinkedAt: iso }, { merge: true });

    const customToken = await auth.createCustomToken(syntheticUid, {
      role: familyRole,
      familyId: gaditFamilyId,
      memberId,
    });

    // ── §3.5 Client-side sign-in handoff → the member's own space ─────────
    return spinnerPage(signInScript(customToken));
  } catch (err) {
    console.error("[/api/yooniz/sso] error:", err);
    return page("שגיאה זמנית. נסו שוב עוד רגע.");
  }
}
