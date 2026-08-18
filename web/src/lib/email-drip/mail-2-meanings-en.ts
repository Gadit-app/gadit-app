import { layoutEn } from "./layout-en";

/**
 * Mail 2 EN — Multiple meanings + examples (day 2).
 * Uses "spirit" as the showcase word: same conceptual range as Hebrew
 * "rooach" (life-force, mood, essence, ghost) and Latin "spiritus" maps
 * cleanly into mail 3's etymology.
 */
export function meaningsEn(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `Hi ${name},` : "Hi,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">Take the word &ldquo;spirit&rdquo;, and see how one word can open a whole world.</p>
    <p style="margin:0 0 16px;">Spirit is the essence of something, the spirit of the law. It's a person's mood, in good spirits. It's an alcoholic drink, distilled spirits. It's a non-physical being, an evil spirit. It's enthusiasm or courage, team spirit, fighting spirit. It's a guiding presence, the spirit of an age, the spirit of a place.</p>
    <p style="margin:0 0 16px;">One word, layers you hadn't seen in it, each living in its own world.</p>
    <p style="margin:0 0 16px;">In Gadit you'll find three real examples for every definition. Sentences where the word works in practice, not in theory. That way you see not just what the word says, but how it sounds when used.</p>
    <p style="margin:0 0 16px;">This is the heart of Gadit. One word, all the way through, across all its definitions.</p>
    <p style="margin:0 0 16px;">Try searching &ldquo;spirit&rdquo;, and maybe another word you think you already understand. You might be surprised.</p>
  `;

  const signature = `
    <p style="margin:0;">Yours,</p>
    <p style="margin:0 0 12px;">Gadi</p>
    <p style="margin:0;color:#6B7280;font-size:14px;line-height:1.55;">P.S. When you find a surprising meaning, there's a share button next to it. Worth sending to someone who'd appreciate it.</p>
  `;

  return {
    subject: "One word, layers you haven't seen",
    preheader: "Most tools stop at the definition. Gadit keeps going until it sticks.",
    html: layoutEn({
      preheader: "Most tools stop at the definition. Gadit keeps going until it sticks.",
      bodyHtml,
      ctaText: 'Search "spirit" and see all the faces',
      ctaUrl: "https://www.gadit.app/en/word/spirit?utm_source=email&utm_medium=drip&utm_campaign=meanings",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
