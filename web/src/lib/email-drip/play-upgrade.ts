import { planCopy } from "@/lib/plan-copy";
import { payUrl } from "@/lib/pay-url";
import { renderEmailHtmlV2, mdLiteToHtml, applyName } from "./render";
import { EMAIL_BASE } from "./family-content";

/**
 * One email to a free user who came from the Android (Play) app, where
 * nothing may be sold and no in-app text may point to buying elsewhere
 * (Google Play policy). Email is outside the app, so it carries the upgrade
 * link, to the purchase host that always opens in the browser
 * (lib/pay-url.ts). Gadi 2026-10-06, after Johanna could not upgrade.
 */

const H = 3_600_000;

/** Due once: a Play-app user, a day after we first saw them, still free. */
export function playUpgradeDue(d: FirebaseFirestore.DocumentData, now: number): boolean {
  if (d.playUser !== true || d.playUpgradeSentAt) return false;
  const first = typeof d.playFirstSeenAt === "number" ? d.playFirstSeenAt : 0;
  if (!first || now - first < 24 * H) return false;
  const paying = d.subscriptionStatus === "active" || d.subscriptionStatus === "trialing" || d.subscriptionStatus === "past_due";
  if (paying || d.familyId || d.schoolId) return false;
  return true;
}

export function buildPlayUpgrade(lang: string, firstName: string | null, unsubscribeUrl: string): { subject: string; html: string } {
  const base = lang === "en" ? EMAIL_BASE : `${EMAIL_BASE}/${lang}`;
  return {
    subject: planCopy(lang, "pupSubject"),
    html: renderEmailHtmlV2({
      he: lang === "he",
      lang,
      bodyHtml: mdLiteToHtml(lang, applyName(planCopy(lang, "pupBody"), firstName)),
      ctaText: planCopy(lang, "pupCta"),
      ctaUrl: payUrl(`/${lang}/pricing?utm_source=email&utm_medium=play&utm_campaign=play_upgrade`),
      next: "",
      helpUrl: `${base}/help`,
      unsubscribeUrl,
    }),
  };
}
