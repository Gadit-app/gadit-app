import { layoutEn } from "./layout-en";

/**
 * Mail 4 EN: Kids Mode + picture (day 9).
 * Same restructure Gadi approved on the Hebrew version: lead with the
 * Kids Mode use case (a child asks, the definition is too hard), then
 * pivot to the picture as a secondary tool.
 * Updated 2026-10-19: team voice (no "I"), and the current plan facts
 * (Kids Mode is a Family tool; a picture for every meaning comes with
 * Individual and Family).
 */
export function visualEn(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `Hi ${name},` : "Hi,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">One of the most common requests we've received was simple. A child asks what a word means, and the official definition is too complicated for them.</p>
    <p style="margin:0 0 16px;">That's why Gadit has Kids Mode. Turn it on, and every word is explained in the language of a five-to-ten-year-old. The same depth, without the big words.</p>
    <p style="margin:0 0 16px;">Take &ldquo;spirit&rdquo;. In regular mode, it's explained in several layers. In Kids Mode, it becomes something a child grasps right away, like the feeling of being part of a team and wanting to do well together.</p>
    <p style="margin:0 0 16px;">And this isn't only for kids. Sometimes, when a word is genuinely hard, the simple explanation is exactly what adults need to grasp it too.</p>
    <p style="margin:0 0 16px;">Alongside Kids Mode, Gadit also shows a picture for every meaning, so a child can see the word as well as read it. Understanding lands faster and stays longer.</p>
    <p style="margin:0 0 16px;">Kids Mode is part of the Family plan, made for families with children. A picture for every meaning also comes with the Individual plan.</p>
    <p style="margin:0 0 16px;">If there's a child around, sit with them for a minute, turn on Kids Mode, search a word together and look at its picture. This is what the moment of effortless understanding looks like.</p>
  `;

  const signature = `
    <p style="margin:0;">Yours,</p>
    <p style="margin:0;">The Gadit team</p>
  `;

  return {
    subject: "A word at eye level",
    preheader: "Kids Mode: every word explained in a child's language, without losing the depth.",
    html: layoutEn({
      preheader: "Kids Mode: every word explained in a child's language, without losing the depth.",
      bodyHtml,
      ctaText: "See Kids Mode",
      ctaUrl: "https://www.gadit.app/en/families?utm_source=email&utm_medium=drip&utm_campaign=visual",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
