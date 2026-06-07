import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

/**
 * /api/affiliate/embed-token — exchange a Firebase ID token for an
 * Affonso publicToken that the client can paste into the embedded
 * dashboard iframe.
 *
 * Why server-side only: the AFFONSO_API_KEY env var is the secret
 * key for our Affonso program — exposing it to the browser would let
 * anyone mint tokens against our account. This route is the trust
 * boundary: we verify the caller's Firebase identity, then talk to
 * Affonso on their behalf using OUR API key. The returned
 * publicToken is short-lived (30 minutes) and scoped to one partner.
 *
 * Auto-onboarding: when we POST a partner Affonso has never seen,
 * Affonso creates the partner record on the fly using the email and
 * name we sent. That means a Gadit user can land on
 * /affiliate/dashboard, this route runs once, and they have a live
 * Affonso partner account without ever leaving gadit.app. The
 * externalUserId we pass (the Firebase uid) is the durable foreign
 * key — re-calling with the same uid returns the same partner.
 */

const PROGRAM_ID = "cmq3oz349000p11r2lloq0xb2";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }

    if (!process.env.AFFONSO_API_KEY) {
      // The env var hasn't been set on Vercel yet. Surface this as a
      // distinct error code so the client UI can show a clear "the
      // dashboard isn't configured yet" message instead of looking
      // broken.
      return NextResponse.json(
        { error: "affiliate_not_configured" },
        { status: 503 },
      );
    }

    // Decode the Firebase ID token to get the caller's email + name.
    // We can't use verifyUserAndGetPlan here because it only returns
    // { userId, plan } — we need the decoded.email / decoded.name
    // fields that Firebase puts on the token claims.
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const email = decoded.email;
    const name =
      decoded.name ??
      (typeof email === "string" ? email.split("@")[0] : null) ??
      "Partner";

    if (!email) {
      return NextResponse.json(
        { error: "email_required", details: "Firebase user has no email" },
        { status: 400 },
      );
    }

    const res = await fetch("https://api.affonso.io/v1/embed/token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AFFONSO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        programId: PROGRAM_ID,
        partner: { email, name },
        externalUserId: decoded.uid,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        "[affiliate/embed-token] Affonso API failed:",
        res.status,
        errText.slice(0, 400),
      );
      return NextResponse.json(
        { error: "affonso_error", status: res.status },
        { status: 502 },
      );
    }

    const body = (await res.json()) as { data?: { publicToken?: string } };
    const token = body.data?.publicToken;
    if (!token) {
      return NextResponse.json(
        { error: "no_token_in_response" },
        { status: 502 },
      );
    }

    return NextResponse.json({ token });
  } catch (err) {
    console.error("[affiliate/embed-token] internal error:", err);
    return NextResponse.json(
      { error: "internal", details: String(err) },
      { status: 500 },
    );
  }
}
