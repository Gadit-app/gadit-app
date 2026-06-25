import { layoutEn } from "./layout-en";

/**
 * Mail 5 EN — Summary + upgrade invite + affiliate (day 14).
 * Mirrors the Hebrew mail 5 final structure Gadi approved: faces of a
 * word vs Gadit features clearly separated, no journey-thanks, the
 * Clear/Deep upgrade is the explicit primary ask, affiliate is the
 * secondary invite. P.S. opens a feature-request channel via reply.
 */
export function summaryEn(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `Hi ${name},` : "Hi,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">Over the past two weeks we've gotten to know the different sides of a word. All its meanings, and its history.</p>
    <p style="margin:0 0 16px;">Alongside that, we've gotten to know the features that make Gadit a tool for deeper understanding: Kids Mode, and generating an image for a word.</p>
    <p style="margin:0 0 16px;">Some of these features are open to every user, and some unlock with <strong>Clear</strong> and <strong>Deep</strong>. There you'll find unlimited searches, images, sentence composition, and smart practice through quizzes and word games. If Gadit has become part of your daily routine, these are the features that make the difference.</p>
    <p style="margin:0 0 16px;">And <strong>Clear</strong> and <strong>Deep</strong> subscribers also get a personal link that earns you a commission on every signup that comes through it. A convenient way to share something you love, and earn along the way.</p>
  `;

  const signature = `
    <p style="margin:0;">Yours,</p>
    <p style="margin:0 0 4px;">Gadi</p>
    <p style="margin:0 0 14px;color:#6B7280;font-size:14px;">Founder, Gadit</p>
    <p style="margin:0;color:#6B7280;font-size:14px;line-height:1.55;">P.S. I'd always love to hear about features you'd like to see in the app. Just reply to this email.</p>
  `;

  return {
    subject: "Two weeks, one word",
    preheader: "The journey, and two ways to continue from here.",
    html: layoutEn({
      preheader: "The journey, and two ways to continue from here.",
      bodyHtml,
      ctaText: "Meet Clear and Deep",
      ctaUrl: "https://www.gadit.app/en/pricing?utm_source=email&utm_medium=drip&utm_campaign=summary",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
