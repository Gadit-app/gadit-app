import { layoutEn } from "./layout-en";

/**
 * Mail 3 EN — Etymology (day 5).
 * Traces "spirit" back to Latin "spiritus" (breath). Mirrors the
 * Hebrew mail 3's journey from physical breath to abstract spirit,
 * with the bonus that English readers see "respire", "inspire",
 * "perspire" share the same root — they meet familiar words from a
 * new angle.
 */
export function etymologyEn(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `Hi ${name},` : "Hi,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">We've reached my favorite part. Where the word comes from.</p>
    <p style="margin:0 0 16px;">Every word has a past. And sometimes that past explains the present better than any definition.</p>
    <p style="margin:0 0 16px;">Spirit is a beautiful example. Its root is the Latin &ldquo;spiritus&rdquo;, which literally meant breath, the air you take in and let out. It's the same root behind &ldquo;respire&rdquo;, &ldquo;inspire&rdquo;, and &ldquo;perspire&rdquo;. All of them, at their core, are about breath.</p>
    <p style="margin:0 0 16px;">From physical breath grew the idea of the life-force inside us, the breath that animates a body. And from that grew something more abstract, the human spirit, the inner essence of a person.</p>
    <p style="margin:0 0 16px;">A whole journey in one word. From the most physical thing, breath, to the most non-physical thing, the spirit of a person. All in one word that has stayed with us for thousands of years.</p>
    <p style="margin:0 0 16px;">Whoever knows this not only remembers the word better. They also understand why all its meanings are connected. They don't live together by accident.</p>
    <p style="margin:0 0 16px;">In Gadit, under the definitions of each word, there's a section that explains its origin. The historical background, where it came from. That's what turns a dictionary from a list of definitions into a story.</p>
  `;

  const signature = `
    <p style="margin:0;">Yours,</p>
    <p style="margin:0;">Gadi</p>
  `;

  return {
    subject: "Where a word really comes from",
    preheader: "Every word has a past, and sometimes it explains the present.",
    html: layoutEn({
      preheader: "Every word has a past, and sometimes it explains the present.",
      bodyHtml,
      ctaText: "Discover the origin of the next word",
      ctaUrl: "https://www.gadit.app/en?utm_source=email&utm_medium=drip&utm_campaign=etymology",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
