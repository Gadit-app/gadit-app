"use client";

/**
 * /contact — full Help Center.
 *
 * Replaced the old minimalist "email us" card (June 10) after Gadi's
 * call: users like Ziv kept hitting the same handful of self-fixable
 * issues (wrong card on a subscription, no verification email, can't
 * generate an image because they hit the monthly quota) and pinging
 * him on WhatsApp. The Help Center surfaces those as searchable
 * accordion items so most users solve it themselves; the email CTA
 * still lives at the bottom as the fallback.
 *
 * The actual content lives in @/lib/help-i18n.ts. This client is just
 * the shell + the existing topbar/footer chrome.
 */

import { useLang } from "@/lib/lang-context";
import { MarketingHeader } from "@/components/design/MarketingHeader";
import { HomeFooter } from "@/components/design/home";
import { HelpCenter } from "@/components/HelpCenter";

export function ContactClient() {
  const { dir } = useLang();

  return (
    <div className="gd-stage" style={{ minHeight: "100vh" }} dir={dir}>
      <div className="gd-stars" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <MarketingHeader />
        <main
          style={{
            maxWidth: 880,
            margin: "0 auto",
            padding: "clamp(40px, 6vw, 72px) clamp(20px, 3vw, 32px) clamp(56px, 8vw, 96px)",
          }}
        >
          <HelpCenter />
        </main>
        <HomeFooter />
      </div>
    </div>
  );
}
