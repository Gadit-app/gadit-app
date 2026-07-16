"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  loadStripe,
  type Stripe as StripeJs,
  type StripeElements,
  type StripeElementLocale,
} from "@stripe/stripe-js";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { track } from "@/lib/track";

/**
 * In-app checkout with the Stripe Payment Element (Yooniz playbook,
 * ported 2026-07-12). Built for Hebrew (hosted Checkout has no "he"
 * locale) but works in any UI language — the Element itself follows
 * the user's lang.
 *
 * Flow: auth guard → POST /api/subscribe (creates a trialing
 * subscription with default_incomplete) → mount Payment Element with
 * the returned client secret → confirmSetup (trial: first invoice is
 * $0, the card is saved via SetupIntent) or confirmPayment when an
 * amount is due → Stripe redirects to /checkout/done → the webhook's
 * subscription-metadata path provisions the account.
 */

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

// Locales the Payment Element actually supports; anything else falls
// back to Stripe's auto-detection (hi is the only Gadit lang missing).
const STRIPE_ELEMENT_LOCALES = new Set([
  "he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja",
]);

type TierInfo = {
  name: string;
  cycle: "monthly" | "yearly";
  amount: string; // display string, USD
  amountIls: string; // display string, ILS — Hebrew users are billed in shekels
  kind: "clear" | "deep" | "family" | "schools";
};

// Mirrors the display prices in PricingClient — the Payment Element
// shows no order summary of its own, so this card is the only place
// the user sees what they are agreeing to. ILS amounts must match the
// currency_options set on the Stripe prices (2026-07-16); the API
// bills lang==="he" in shekels.
function tierForPrice(priceId: string): TierInfo | null {
  const map: Array<[string | undefined, TierInfo]> = [
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY, { name: "Clear", cycle: "monthly", amount: "$2.99", amountIls: "₪9.90", kind: "clear" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_YEARLY, { name: "Clear", cycle: "yearly", amount: "$29.99", amountIls: "₪99", kind: "clear" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY, { name: "Deep", cycle: "monthly", amount: "$4.99", amountIls: "₪16.90", kind: "deep" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_YEARLY, { name: "Deep", cycle: "yearly", amount: "$49.99", amountIls: "₪169", kind: "deep" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY, { name: "Family", cycle: "monthly", amount: "$6.99", amountIls: "₪23.90", kind: "family" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY, { name: "Family", cycle: "yearly", amount: "$69", amountIls: "₪239", kind: "family" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_MONTHLY, { name: "Schools", cycle: "monthly", amount: "$69", amountIls: "₪239", kind: "schools" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_YEARLY, { name: "Schools", cycle: "yearly", amount: "$690", amountIls: "₪2,390", kind: "schools" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY, { name: "Schools Large", cycle: "monthly", amount: "$149", amountIls: "₪499", kind: "schools" }],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_YEARLY, { name: "Schools Large", cycle: "yearly", amount: "$1,490", amountIls: "₪4,990", kind: "schools" }],
  ];
  for (const [id, info] of map) if (id && id === priceId) return info;
  return null;
}

// Local copy, Hebrew first (the page's raison d'être) + English
// fallback for every other lang. Startup voice, no dashes.
const COPY = {
  he: {
    title: "עוד צעד אחד וזה שלכם",
    planLabel: "המסלול שבחרתם",
    perMonth: "לחודש",
    perYear: "לשנה",
    trialToday: "היום תשלמו: 0 ₪",
    trialLine: "14 ימי ניסיון חינם. החיוב הראשון רק בסוף הניסיון.",
    afterTrial: "לאחר הניסיון:",
    cancelNote: "אפשר לבטל בכל רגע מדף החשבון, בלחיצה אחת.",
    couponApplied: (code: string) => `קוד ${code} הופעל ויחול על החיוב הראשון.`,
    payButton: "אישור והתחלת הניסיון",
    processing: "רק רגע...",
    secureNote: "התשלום מאובטח על ידי Stripe. פרטי הכרטיס לא נשמרים אצלנו.",
    needAuthTitle: "כדי להמשיך צריך חשבון Gadit",
    needAuthBody: "ההרשמה לוקחת חצי דקה, והמנוי נשמר על החשבון שלכם.",
    needAuthCta: "הרשמה או התחברות",
    invalidPrice: "המסלול לא נמצא. אפשר לבחור מסלול בדף התמחור.",
    toPricing: "לדף התמחור",
    genericError: "משהו השתבש. נסו שוב.",
    invalidCode: "קוד הקופון לא תקף. אפשר להמשיך בלי קוד או לבדוק את האיות.",
    loading: "מכינים את הטופס...",
  },
  en: {
    title: "One step away",
    planLabel: "Your plan",
    perMonth: "per month",
    perYear: "per year",
    trialToday: "Due today: $0",
    trialLine: "14 day free trial. The first charge comes only when the trial ends.",
    afterTrial: "After the trial:",
    cancelNote: "Cancel anytime from your account page, one click.",
    couponApplied: (code: string) => `Code ${code} applied. It will apply to your first charge.`,
    payButton: "Confirm and start trial",
    processing: "One moment...",
    secureNote: "Payment secured by Stripe. We never store your card details.",
    needAuthTitle: "You need a Gadit account to continue",
    needAuthBody: "Signing up takes half a minute, and your subscription is saved to your account.",
    needAuthCta: "Sign up or sign in",
    invalidPrice: "Plan not found. Pick a plan on the pricing page.",
    toPricing: "Go to pricing",
    genericError: "Something went wrong. Please try again.",
    invalidCode: "That coupon code is not valid. Continue without it or check the spelling.",
    loading: "Preparing the form...",
  },
};

type Phase = "boot" | "need-auth" | "form" | "bad-price" | "error";

export default function CheckoutClient() {
  const params = useSearchParams();
  const priceId = params.get("price") ?? "";
  const code = params.get("code") ?? "";
  const { user, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const c = lang === "he" ? COPY.he : COPY.en;
  const tier = tierForPrice(priceId);

  const [phase, setPhase] = useState<Phase>("boot");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [elementReady, setElementReady] = useState(false);

  const stripeRef = useRef<StripeJs | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const modeRef = useRef<"setup" | "payment">("setup");
  const mountRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  // Auth gate. promptLogin no-ops into onSuccess for signed-in users,
  // and the auth state change re-runs the subscribe effect below.
  useEffect(() => {
    if (loading) return;
    if (!tier) {
      setPhase("bad-price");
      return;
    }
    if (!user) {
      setPhase("need-auth");
      return;
    }
  }, [loading, user, tier]);

  // Create the subscription + mount the Payment Element once we have
  // a signed-in user. startedRef guards double-run (Strict Mode) and
  // re-renders — /api/subscribe reuses abandoned subs anyway, this
  // just avoids pointless requests.
  useEffect(() => {
    if (loading || !user || !tier || startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ priceId, ...(code && { code }), lang }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          clientSecret?: string;
          mode?: "setup" | "payment";
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.clientSecret || !data.mode) {
          setErrMsg(data.error === "invalid_code" ? c.invalidCode : c.genericError);
          setPhase("error");
          startedRef.current = false;
          return;
        }

        const stripe = await stripePromise;
        if (cancelled) return;
        if (!stripe) {
          setErrMsg(c.genericError);
          setPhase("error");
          return;
        }
        stripeRef.current = stripe;
        modeRef.current = data.mode;

        const locale = (STRIPE_ELEMENT_LOCALES.has(lang) ? lang : "auto") as StripeElementLocale;
        const elements = stripe.elements({
          clientSecret: data.clientSecret,
          locale,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#0EA5A5",
              colorText: "#1f2937",
              borderRadius: "12px",
              fontSizeBase: "16px",
            },
          },
        });
        elementsRef.current = elements;
        setPhase("form");
        track("checkout_started", { priceId, surface: "payment_element", lang });
      } catch (err) {
        console.error("[checkout] init failed:", err);
        if (!cancelled) {
          setErrMsg(c.genericError);
          setPhase("error");
          startedRef.current = false;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, priceId, code, lang]);

  // Mount the element once its container exists (phase === "form").
  useEffect(() => {
    if (phase !== "form" || !elementsRef.current || !mountRef.current) return;
    const el = elementsRef.current.create("payment", { layout: "tabs" });
    el.on("ready", () => setElementReady(true));
    el.mount(mountRef.current);
    return () => {
      el.destroy();
      setElementReady(false);
    };
  }, [phase]);

  async function onPay() {
    const stripe = stripeRef.current;
    const elements = elementsRef.current;
    if (!stripe || !elements || submitting) return;
    setSubmitting(true);
    setErrMsg(null);
    track("checkout_pay_clicked", { priceId, surface: "payment_element" });

    const returnUrl =
      `${window.location.origin}${href("/checkout/done")}?price=${encodeURIComponent(priceId)}`;
    const confirmParams = { return_url: returnUrl };
    const { error } =
      modeRef.current === "setup"
        ? await stripe.confirmSetup({ elements, confirmParams })
        : await stripe.confirmPayment({ elements, confirmParams });

    // Only reached when confirmation failed synchronously (validation,
    // card declined without redirect). Success navigates away.
    if (error) {
      setErrMsg(error.message ?? c.genericError);
      setSubmitting(false);
    }
  }

  const cycleLabel = tier?.cycle === "yearly" ? c.perYear : c.perMonth;

  return (
    <div dir={dir} style={styles.page}>
      <header style={styles.header}>
        <Link href={href("/")} style={styles.wordmark}>
          Gadit
        </Link>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          {phase === "bad-price" && (
            <>
              <h1 style={styles.title}>{c.invalidPrice}</h1>
              <Link href={href("/pricing")} style={styles.primaryLink}>
                {c.toPricing}
              </Link>
            </>
          )}

          {phase === "need-auth" && (
            <>
              <h1 style={styles.title}>{c.needAuthTitle}</h1>
              <p style={styles.muted}>{c.needAuthBody}</p>
              <button
                type="button"
                style={styles.payButton}
                onClick={() => promptLogin({ mode: "signup", reason: "checkout" })}
              >
                {c.needAuthCta}
              </button>
            </>
          )}

          {(phase === "boot" || phase === "error" || phase === "form") && tier && (
            <>
              <h1 style={styles.title}>{c.title}</h1>

              <div style={styles.summary}>
                <div style={styles.summaryRow}>
                  <span style={styles.muted}>{c.planLabel}</span>
                  <span style={styles.planName}>
                    Gadit {tier.name}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.muted}>{c.afterTrial}</span>
                  <span style={styles.amount}>
                    {lang === "he" ? tier.amountIls : tier.amount} {cycleLabel}
                  </span>
                </div>
                <div style={styles.trialBox}>
                  <div style={styles.trialToday}>{c.trialToday}</div>
                  <div style={styles.trialLine}>{c.trialLine}</div>
                </div>
                {code && phase === "form" && (
                  <div style={styles.coupon}>{c.couponApplied(code.toUpperCase())}</div>
                )}
              </div>

              {phase !== "form" && !errMsg && <p style={styles.muted}>{c.loading}</p>}

              <div ref={mountRef} style={{ minHeight: phase === "form" ? 200 : 0 }} />

              {errMsg && (
                <p role="alert" style={styles.error}>
                  {errMsg}
                </p>
              )}

              {phase === "form" && (
                <button
                  type="button"
                  style={{
                    ...styles.payButton,
                    opacity: elementReady && !submitting ? 1 : 0.6,
                    cursor: elementReady && !submitting ? "pointer" : "default",
                  }}
                  disabled={!elementReady || submitting}
                  onClick={onPay}
                >
                  {submitting ? c.processing : c.payButton}
                </button>
              )}

              <p style={styles.secure}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <span>{c.secureNote}</span>
              </p>
              <p style={styles.cancelNote}>{c.cancelNote}</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#f6f4ee",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "18px 24px",
  },
  wordmark: {
    fontWeight: 800,
    fontSize: 20,
    color: "#1f2937",
    textDecoration: "none",
    letterSpacing: "-0.02em",
  },
  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "8px 16px 48px",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    background: "#ffffff",
    borderRadius: 20,
    border: "1px solid rgba(31,41,55,0.08)",
    boxShadow: "0 10px 30px rgba(31,41,55,0.07)",
    padding: "28px 24px",
    height: "fit-content",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 18px",
    letterSpacing: "-0.01em",
  },
  summary: {
    marginBottom: 20,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
    padding: "6px 0",
  },
  planName: {
    fontWeight: 700,
    color: "#1f2937",
    fontSize: 16,
  },
  amount: {
    fontWeight: 700,
    color: "#1f2937",
    fontSize: 16,
    direction: "ltr" as const,
  },
  trialBox: {
    marginTop: 10,
    background: "rgba(14,165,165,0.08)",
    border: "1px solid rgba(14,165,165,0.25)",
    borderRadius: 12,
    padding: "10px 14px",
  },
  trialToday: {
    fontWeight: 800,
    color: "#0b7d7d",
    fontSize: 15,
  },
  trialLine: {
    color: "#0b7d7d",
    fontSize: 13.5,
    marginTop: 2,
  },
  coupon: {
    marginTop: 10,
    fontSize: 13.5,
    color: "#7C3AED",
    fontWeight: 600,
  },
  muted: {
    color: "#6b7280",
    fontSize: 14,
    margin: 0,
  },
  error: {
    color: "#b91c1c",
    fontSize: 14,
    margin: "12px 0 0",
  },
  payButton: {
    width: "100%",
    marginTop: 18,
    padding: "14px 16px",
    borderRadius: 14,
    border: "none",
    background: "#0EA5A5",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
  },
  primaryLink: {
    display: "inline-block",
    marginTop: 8,
    padding: "12px 18px",
    borderRadius: 14,
    background: "#0EA5A5",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 15,
    textDecoration: "none",
  },
  secure: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#6b7280",
    fontSize: 12.5,
    margin: "14px 0 0",
  },
  cancelNote: {
    color: "#6b7280",
    fontSize: 12.5,
    margin: "6px 0 0",
  },
};
