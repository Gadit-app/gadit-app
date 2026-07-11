"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { track } from "@/lib/track";

/**
 * Return page for the Payment Element flow. Stripe appends
 * redirect_status (+ setup_intent / payment_intent ids) to the
 * return_url after confirmSetup/confirmPayment.
 *
 * succeeded / processing → celebrate and route by tier. The webhook
 * provisions the plan asynchronously, usually within seconds, so the
 * copy promises "a moment", not instant features.
 * anything else → send back to /checkout to retry (the abandoned
 * subscription is reused there, no duplicates).
 */

const COPY = {
  he: {
    okTitle: "זהו, אתם בפנים",
    okBody: "14 ימי הניסיון התחילו. החשבון מתעדכן ממש בדקות הקרובות, ואם משהו לא נפתח מיד, רעננו את הדף.",
    ctaGeneral: "להתחיל לחפש מילים",
    ctaFamily: "לאזור המשפחה",
    ctaSchools: "לניהול בית הספר",
    failTitle: "התשלום לא הושלם",
    failBody: "לא בוצע חיוב. אפשר לנסות שוב, זה לוקח פחות מדקה.",
    retry: "לנסות שוב",
    toPricing: "לדף התמחור",
  },
  en: {
    okTitle: "You are in",
    okBody: "Your 14 day trial has started. Your account updates within moments. If something does not open right away, refresh the page.",
    ctaGeneral: "Start looking up words",
    ctaFamily: "Go to your family space",
    ctaSchools: "Manage your school",
    failTitle: "Payment was not completed",
    failBody: "You were not charged. You can try again, it takes less than a minute.",
    retry: "Try again",
    toPricing: "Go to pricing",
  },
};

function isFamilyPrice(priceId: string): boolean {
  return (
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY
  );
}

function isSchoolsPrice(priceId: string): boolean {
  return (
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_MONTHLY ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_YEARLY ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_YEARLY
  );
}

export default function DoneClient() {
  const params = useSearchParams();
  const { lang, dir } = useLang();
  const href = useHref();
  const c = lang === "he" ? COPY.he : COPY.en;

  const priceId = params.get("price") ?? "";
  // confirmSetup appends redirect_status; treat "processing" as success
  // (bank confirmation in flight, Stripe will settle it and the webhook
  // handles the outcome either way).
  const status = params.get("redirect_status") ?? "";
  const ok = status === "succeeded" || status === "processing";

  const trackedRef = useRef(false);
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    track(ok ? "checkout_completed" : "checkout_failed", {
      priceId,
      surface: "payment_element",
      status,
    });
  }, [ok, priceId, status]);

  const successHref = isSchoolsPrice(priceId)
    ? href("/schools/manage")
    : isFamilyPrice(priceId)
      ? `${href("/family")}?welcome=1`
      : `${href("/")}?success=1`;
  const successCta = isSchoolsPrice(priceId)
    ? c.ctaSchools
    : isFamilyPrice(priceId)
      ? c.ctaFamily
      : c.ctaGeneral;

  const retryHref = priceId
    ? `${href("/checkout")}?price=${encodeURIComponent(priceId)}&retry=1`
    : href("/pricing");

  return (
    <div dir={dir} style={styles.page}>
      <header style={styles.header}>
        <Link href={href("/")} style={styles.wordmark}>
          Gadit
        </Link>
      </header>
      <main style={styles.main}>
        <div style={styles.card}>
          {ok ? (
            <>
              <div style={styles.badgeOk} aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h1 style={styles.title}>{c.okTitle}</h1>
              <p style={styles.body}>{c.okBody}</p>
              <Link href={successHref} style={styles.primaryLink}>
                {successCta}
              </Link>
            </>
          ) : (
            <>
              <div style={styles.badgeFail} aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </div>
              <h1 style={styles.title}>{c.failTitle}</h1>
              <p style={styles.body}>{c.failBody}</p>
              <Link href={retryHref} style={styles.primaryLink}>
                {priceId ? c.retry : c.toPricing}
              </Link>
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
  header: { padding: "18px 24px" },
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
    padding: "32px 24px",
    height: "fit-content",
    textAlign: "center" as const,
  },
  badgeOk: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "rgba(14,165,165,0.12)",
    color: "#0EA5A5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  badgeFail: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "rgba(185,28,28,0.1)",
    color: "#b91c1c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 10px",
  },
  body: {
    color: "#6b7280",
    fontSize: 14.5,
    lineHeight: 1.6,
    margin: "0 0 20px",
  },
  primaryLink: {
    display: "inline-block",
    padding: "13px 22px",
    borderRadius: 14,
    background: "#0EA5A5",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 15,
    textDecoration: "none",
  },
};
