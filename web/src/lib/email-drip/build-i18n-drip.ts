import type { Lang } from "@/lib/i18n";
import type { DripMail } from "./registry";
import { renderDripLayout } from "./i18n-layout";
import { DRIP_CONTENT, type DripEmail } from "./mail-content";

const BASE = "https://www.gadit.app";

function ctaUrl(urlKey: string, lang: Lang, word?: string): string {
  const u = `utm_source=email&utm_medium=drip&utm_campaign=${urlKey}`;
  switch (urlKey) {
    case "meanings": return `${BASE}/${lang}/word/${encodeURIComponent(word || "")}?${u}`;
    case "visual":   return `${BASE}/${lang}?kids=1&${u}`;
    case "summary":  return `${BASE}/${lang}/pricing?${u}`;
    default:         return `${BASE}/${lang}?${u}`; // welcome, etymology
  }
}

function bodyHtml(greeting: string, e: DripEmail): string {
  const paras = [greeting, ...e.paras]
    .map((p) => `<p style="margin:0 0 16px;">${p}</p>`)
    .join("\n");
  const ps = e.ps ? `\n<p style="margin:0;color:#6B7280;font-size:14px;line-height:1.55;">${e.ps}</p>` : "";
  return paras + ps;
}

function signatureHtml(e: DripEmail): string | undefined {
  if (!e.signOff || e.signOff.length === 0) return undefined;
  const last = e.signOff.length - 1;
  return e.signOff
    .map((line, i) =>
      i === last
        ? `<p style="margin:0;color:#6B7280;font-size:14px;">${line}</p>`
        : `<p style="margin:0;">${line}</p>`,
    )
    .join("\n");
}

/**
 * Build the 5-mail drip for a data-driven language, or null if that language
 * has no content yet (caller falls back to English).
 */
export function buildI18nDrip(lang: Lang): DripMail[] | null {
  const c = DRIP_CONTENT[lang];
  if (!c) return null;

  const specs: Array<{ key: string; dayOffset: number; email: DripEmail; urlKey: string }> = [
    { key: `welcome-${lang}`,   dayOffset: 0,  email: c.welcome,   urlKey: "welcome" },
    { key: `meanings-${lang}`,  dayOffset: 2,  email: c.meanings,  urlKey: "meanings" },
    { key: `etymology-${lang}`, dayOffset: 5,  email: c.etymology, urlKey: "etymology" },
    { key: `visual-${lang}`,    dayOffset: 9,  email: c.visual,    urlKey: "visual" },
    { key: `summary-${lang}`,   dayOffset: 14, email: c.summary,   urlKey: "summary" },
  ];

  return specs.map(({ key, dayOffset, email, urlKey }) => ({
    key,
    dayOffset,
    build({ displayName, unsubscribeUrl }) {
      const name = displayName?.trim();
      const greeting = name ? c.greetNamed.replace("{name}", name) : c.greetPlain;
      return {
        subject: email.subject,
        preheader: email.preheader,
        html: renderDripLayout({
          lang,
          preheader: email.preheader,
          bodyHtml: bodyHtml(greeting, email),
          ctaText: email.cta,
          ctaUrl: ctaUrl(urlKey, lang, email.exampleWord),
          unsubscribeUrl,
          signature: signatureHtml(email),
          footerReason: c.footerReason,
          unsubscribeLabel: c.unsubscribeLabel,
        }),
      };
    },
  }));
}
