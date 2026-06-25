import { layoutEn } from "./layout-en";

/**
 * Mail 1 EN — Welcome (sent on day 0, immediately after signup).
 * English counterpart of mail-1-welcome-he. Same beats, same warmth,
 * adapted for an English-speaking reader (no Israeli cultural anchor).
 */
export function welcomeEn(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `Hi ${name},` : "Hi,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">Congratulations on joining Gadit.</p>
    <p style="margin:0 0 16px;">Gadit is a dictionary with one mission: to crack a word fully. Not a one-line definition, not a dry translation. All the meanings, the idioms, the word's origin, and the ways people actually use it today.</p>
    <p style="margin:0 0 16px;">When you grasp a word completely, the idea behind it becomes clear, and with it the way you think, learn, and decide.</p>
    <p style="margin:0 0 16px;">Gadit is a living platform that keeps growing. If you spot a mistake in any definition, example, or other part, there's a report button worth pressing. The team and I read everything and fix it.</p>
    <p style="margin:0 0 16px;">Ready to start?</p>
  `;

  const signature = `
    <p style="margin:0;">Yours,</p>
    <p style="margin:0;">Gadi</p>
    <p style="margin:0;color:#6B7280;font-size:14px;">Founder, Gadit</p>
  `;

  return {
    subject: "Welcome to Gadit",
    preheader: "One dictionary, one mission. To crack a word fully. Here's how to start.",
    html: layoutEn({
      preheader: "One dictionary, one mission. To crack a word fully. Here's how to start.",
      bodyHtml,
      ctaText: "Search your first word",
      ctaUrl: "https://www.gadit.app/en?utm_source=email&utm_medium=drip&utm_campaign=welcome",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
