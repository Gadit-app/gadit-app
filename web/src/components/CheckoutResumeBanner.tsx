"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { isPlayModeClient } from "@/lib/play-copy";
import { isIosApp } from "@/lib/native-app";

/**
 * "Pick up where you left off" (Gadi 2026-10-21): a small banner on the
 * Families, Individuals and Pricing pages for a signed-in person who opened
 * /checkout and left before entering a card. One button back to the same
 * plan's checkout, which reuses the saved subscription (api/subscribe).
 * Never in the Play or iOS app: .gd-buy hides it there, and it does not
 * even ask the server.
 *
 * Copy: Hebrew and English; other languages show English until added here.
 */

const COPY: Record<string, { title: string; body: (plan: string) => string; cta: string }> = {
  he: {
    title: "המשיכו מאיפה שעצרתם",
    body: (plan) => `ההרשמה שלכם ל-${plan} שמורה, וחסר רק הצעד האחרון.`,
    cta: "להשלמת ההרשמה",
  },
  en: {
    title: "Pick up where you left off",
    body: (plan) => `Your ${plan} signup is saved, only the last step is left.`,
    cta: "Finish signing up",
  },
};

const PLAN_NAME: Record<string, string> = { family: "Gadit Family", individual: "Gadit Individual", other: "Gadit" };

export default function CheckoutResumeBanner() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const [pending, setPending] = useState<{ priceId: string; plan: string } | null>(null);

  useEffect(() => {
    if (!user || isPlayModeClient() || isIosApp()) return;
    let alive = true;
    (async () => {
      try {
        const token = await user.getIdToken();
        const r = await fetch("/api/checkout/pending", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as { priceId?: string; plan?: string; none?: boolean };
        if (alive && j.priceId) setPending({ priceId: j.priceId, plan: j.plan ?? "other" });
      } catch { /* the banner is optional */ }
    })();
    return () => { alive = false; };
  }, [user]);

  if (!pending || !user) return null;
  const c = COPY[lang] ?? COPY.en;
  const url = `${href("/checkout")}?price=${encodeURIComponent(pending.priceId)}&utm_source=recovery&utm_medium=site&utm_campaign=checkout_recovery&utm_content=banner`;
  return (
    <div className="gd-buy" dir={dir} style={{ padding: "12px 16px 0", boxSizing: "border-box" }}>
      <div
        role="region"
        aria-label={c.title}
        style={{
          maxWidth: 880, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          background: "#ECFBF9", border: "1px solid #BFE9E4", borderRadius: 14, padding: "12px 16px",
          fontFamily: "inherit", color: "#0B1220", textAlign: "start",
        }}
      >
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{c.title}</div>
          <div style={{ fontSize: 14, color: "#374151", marginTop: 2, lineHeight: 1.45 }}>
            <bdi>{c.body(PLAN_NAME[pending.plan] ?? "Gadit")}</bdi>
          </div>
        </div>
        <a
          href={url}
          style={{
            flex: "0 0 auto", display: "inline-block", background: "#0EA5A5", color: "#fff", padding: "10px 20px",
            borderRadius: 999, textDecoration: "none", fontWeight: 650, fontSize: 15,
          }}
        >
          {c.cta}
        </a>
      </div>
    </div>
  );
}
