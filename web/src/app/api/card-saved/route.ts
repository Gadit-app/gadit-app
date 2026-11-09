import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * GET /api/card-saved?session_id=cs_... — where the no-login card link
 * (admin billing-action "card_link") lands after the customer saves a card.
 * Only acts on a completed setup session we created (metadata.purpose), so
 * the session id alone can do nothing else. Then:
 *   1. the new card becomes the customer's default and every live
 *      subscription's card;
 *   2. any open invoice is paid now with it.
 * Shows a short thank-you page. Idempotent. Gadi 2026-11-09.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("session_id") || "";
  let ok = false;
  if (id.startsWith("cs_")) {
    try {
      const session = await stripe.checkout.sessions.retrieve(id, { expand: ["setup_intent"] });
      const si = session.setup_intent as Stripe.SetupIntent | null;
      const customer = typeof session.customer === "string" ? session.customer : session.customer?.id;
      const pm = typeof si?.payment_method === "string" ? si.payment_method : si?.payment_method?.id;
      if (session.mode === "setup" && session.status === "complete" && session.metadata?.purpose === "card_update" && customer && pm) {
        await stripe.customers.update(customer, { invoice_settings: { default_payment_method: pm } });
        const subs = await stripe.subscriptions.list({ customer, status: "all", limit: 20 });
        for (const s of subs.data) {
          if (!["active", "trialing", "past_due", "unpaid"].includes(s.status)) continue;
          const cur = typeof s.default_payment_method === "string" ? s.default_payment_method : s.default_payment_method?.id;
          if (cur !== pm) await stripe.subscriptions.update(s.id, { default_payment_method: pm });
        }
        const open = await stripe.invoices.list({ customer, status: "open", limit: 10 });
        for (const inv of open.data) {
          if ((inv.amount_due ?? 0) <= 0 || !inv.id) continue;
          try {
            await stripe.invoices.pay(inv.id, { payment_method: pm });
          } catch (e) {
            console.error("[card-saved] pay failed", inv.id, String(e));
          }
        }
        ok = true;
      }
    } catch (e) {
      console.error("[card-saved] error:", e);
    }
  }

  const he = ok ? "הכרטיס נשמר בהצלחה" : "משהו לא הסתדר";
  const heSub = ok ? "החיובים הבאים יהיו מהכרטיס החדש. תודה!" : "אפשר לשלוח לנו הודעה ונעזור.";
  const en = ok ? "Your card is saved" : "Something went wrong";
  const enSub = ok ? "Your next payments will use this card. Thank you!" : "Send us a message and we'll help.";
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gadit</title>
<style>body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Rubik,Arial,sans-serif;background:#f6f7f5;color:#1d2321;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
.c{background:#fff;border:1px solid #dde3e0;border-radius:16px;padding:32px 28px;max-width:420px;width:100%;text-align:center}
h1{font-size:22px;margin:0 0 8px}p{margin:0 0 20px;color:#5d6b66;line-height:1.5}.en{direction:ltr;border-top:1px solid #dde3e0;padding-top:18px;margin-top:6px}
a{display:inline-block;background:#0b7d6e;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600}</style></head>
<body><div class="c"><h1>${he}</h1><p>${heSub}</p><div class="en"><h1>${en}</h1><p>${enSub}</p></div><a href="https://www.gadit.app/">Gadit</a></div></body></html>`;
  return new NextResponse(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
