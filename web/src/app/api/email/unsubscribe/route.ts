import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyUnsubToken } from "@/lib/email-drip/registry";

/**
 * One-click unsubscribe endpoint linked from every drip email's
 * footer. The link is stateless — the token is an HMAC of the user's
 * uid signed with EMAIL_UNSUB_SECRET, so we can verify without
 * looking up a one-time token in Firestore.
 *
 * GET /api/email/unsubscribe?uid=<uid>&t=<token>
 *
 * Responds with a tiny HTML confirmation page that works in any
 * webmail preview pane (no JS, RTL-aware). Sets dripUnsubscribed=true
 * on /users/{uid} so the cron skips that user from then on.
 */

export const maxDuration = 15;

function htmlResponse(opts: {
  title: string;
  body: string;
  lang: "he" | "en";
}): string {
  const isRtl = opts.lang === "he";
  return `<!DOCTYPE html>
<html lang="${opts.lang}" dir="${isRtl ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'Rubik','Heebo',Arial,sans-serif;color:#111827;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="max-width:480px;width:100%;padding:32px;text-align:center;">
    <div style="font-family:'Inter',Arial,sans-serif;font-size:32px;font-weight:700;color:#111827;letter-spacing:-0.02em;line-height:1;direction:ltr;margin-bottom:24px;">Gad<span style="color:#0EA5A5;font-style:italic;">it</span></div>
    <h1 style="font-size:20px;margin:0 0 12px;color:#111827;">${opts.title}</h1>
    <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">${opts.body}</p>
    <a href="https://www.gadit.app" style="display:inline-block;background:#0EA5A5;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;font-size:14px;">
      ${isRtl ? "חזרה ל-Gadit" : "Back to Gadit"}
    </a>
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const uid = (req.nextUrl.searchParams.get("uid") || "").trim();
  const token = (req.nextUrl.searchParams.get("t") || "").trim();

  if (!uid || !token || !verifyUnsubToken(uid, token)) {
    return new Response(
      htmlResponse({
        title: "קישור לא תקף",
        body: "הקישור פג תוקף או אינו תקין. אם רצית לבטל את הרצף, אפשר לחזור לאחד מהמיילים האחרונים וללחוץ שם.",
        lang: "he",
      }),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  try {
    const db = getAdminDb();
    await db.collection("users").doc(uid).set(
      {
        dripUnsubscribed: true,
        dripUnsubscribedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.error("[unsubscribe] firestore write failed:", err);
    return new Response(
      htmlResponse({
        title: "משהו השתבש",
        body: "הסרת ההרשמה נכשלה זמנית. אפשר לנסות שוב בעוד דקה.",
        lang: "he",
      }),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  return new Response(
    htmlResponse({
      title: "הסרה הושלמה",
      body: "הוסרת מרצף האימיילים של Gadit. תודה שניסית אותנו. החשבון נשאר פעיל ואפשר להמשיך לחפש מילים מתי שמתחשק.",
      lang: "he",
    }),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
