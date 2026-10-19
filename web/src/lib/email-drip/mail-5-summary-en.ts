import { layoutEn } from "./layout-en";

/**
 * Mail 5 EN: Summary + upgrade invite + partner program (day 14).
 * Mirrors the Hebrew mail 5 structure: faces of a word vs Gadit features
 * clearly separated, no journey-thanks, the Individual upgrade is the
 * explicit primary ask, the partner program is the secondary invite.
 * P.S. opens a feature-request channel via reply.
 * Updated 2026-10-19: team voice (no "I"), the current Individual feature
 * list, and one line about Family for parents.
 */
export function summaryEn(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `Hi ${name},` : "Hi,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">Over the past two weeks we've gotten to know the different sides of a word. All its meanings, and its history.</p>
    <p style="margin:0 0 16px;">Alongside that, we've gotten to know the features that make Gadit a tool for deeper understanding: Kids Mode, and a picture for every meaning.</p>
    <p style="margin:0 0 16px;">Some of these features are open to every user. A free account includes 10 searches a day and a notebook of up to 30 words.</p>
    <p style="margin:0 0 16px;">The rest unlock with <strong>Individual</strong>: unlimited searches, a picture for every meaning, a notebook that saves every word with smart practice, games and quizzes, Every Word (photograph a page and tap any word), Say it for pronunciation practice, and composing a sentence with feedback. If Gadit has become part of your daily routine, these are the features that make the difference.</p>
    <p style="margin:0 0 16px;">Have kids at home? The <a href="https://www.gadit.app/families?utm_source=email&amp;utm_medium=drip&amp;utm_campaign=summary" style="color:#0EA5A5;text-decoration:underline;">Family</a> plan covers up to 5 children, with Kids Mode and a parent dashboard.</p>
    <p style="margin:0 0 16px;">And we have a partner program too: a personal link that earns you a commission on every paying signup that comes through it. A convenient way to share something you love, and earn along the way.</p>
  `;

  const signature = `
    <p style="margin:0;">Yours,</p>
    <p style="margin:0 0 14px;">The Gadit team</p>
    <p style="margin:0;color:#6B7280;font-size:14px;line-height:1.55;">P.S. We'd always love to hear about features you'd like to see in Gadit. Just reply to this email.</p>
  `;

  return {
    subject: "Two weeks, one word",
    preheader: "The journey, and two ways to continue from here.",
    html: layoutEn({
      preheader: "The journey, and two ways to continue from here.",
      bodyHtml,
      ctaText: "Meet Individual",
      ctaUrl: "https://www.gadit.app/en/pricing?utm_source=email&utm_medium=drip&utm_campaign=summary",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
