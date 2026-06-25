import { layoutEn } from "./layout-en";

/**
 * Mail 4 EN — Kids Mode + image (day 9).
 * Same restructure Gadi approved on the Hebrew version: lead with the
 * Kids Mode use case (a child asks, the definition is too hard), then
 * pivot to image generation as a secondary tool.
 */
export function visualEn(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `Hi ${name},` : "Hi,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">One of the most common requests I've received was simple. A child asks what a word means, and the official definition is too complicated for them.</p>
    <p style="margin:0 0 16px;">That's why Gadit has Kids Mode. Turn it on, and every word is explained in the language of a five-to-ten-year-old. The same depth, without the big words.</p>
    <p style="margin:0 0 16px;">Take &ldquo;spirit&rdquo;. In regular mode, it's explained in several layers. In Kids Mode, it becomes something a child grasps right away, like the feeling of being part of a team and wanting to do well together.</p>
    <p style="margin:0 0 16px;">And this isn't only for kids. Sometimes, when a word is genuinely hard, the simple explanation is exactly what adults need to grasp it too.</p>
    <p style="margin:0 0 16px;">Alongside Kids Mode, Gadit also lets you generate an image that gives a full visualization of the word. Understanding lands faster and stays longer.</p>
    <p style="margin:0 0 16px;">If there's a child around, sit with them for a minute, turn on Kids Mode, search a word together and create an image for it. This is what the moment of effortless understanding looks like.</p>
  `;

  const signature = `
    <p style="margin:0;">Yours,</p>
    <p style="margin:0;">Gadi</p>
  `;

  return {
    subject: "A word at eye level",
    preheader: "Kids Mode: every word explained in a child's language, without losing the depth.",
    html: layoutEn({
      preheader: "Kids Mode: every word explained in a child's language, without losing the depth.",
      bodyHtml,
      ctaText: "Turn on Kids Mode",
      ctaUrl: "https://www.gadit.app/en?kids=1&utm_source=email&utm_medium=drip&utm_campaign=visual",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
