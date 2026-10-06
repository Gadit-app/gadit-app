/**
 * Email renderer for the editable Family series. Non-technical editors
 * (Gadi / Sharon) write "markdown-lite" text and this turns it into the
 * branded, RTL-safe HTML email. No raw HTML for them to break.
 *
 * Markdown-lite:
 *   ## Heading            → section heading
 *   1. step  /  - step    → a numbered/bulleted step list (consecutive lines)
 *   **bold**              → bold
 *   [text](/family)       → a link with that text; a path starting with "/"
 *                           opens that screen on gadit.app (in the email's
 *                           language), a full https:// address is used as is
 *   blank line            → new paragraph
 * Latin runs (Gadit, ChatGPT, ...) are auto-isolated in RTL so brand names
 * don't scramble the Hebrew word order.
 */

import { emailHeaderHtml, emailSignatureHtml, EMAIL_BG, EMAIL_CARD_MAX } from "../email-brand";
import { FAMILY_FIXED, RTL_LANGS, isFamilyLang } from "./family-i18n";

/** The email's language: `true`/`false` are the old Hebrew/English flag,
 *  a string is any UI language (Gadi 2026-10-05, family series in all 33). */
type LangArg = boolean | string;
function loc(l: LangArg) {
  const lang = l === true ? "he" : l === false ? "en" : l;
  return { lang, rtl: RTL_LANGS.has(lang), prefix: lang === "en" ? "" : `/${lang}` };
}

export type EmailContent = {
  subject: string;
  heading: string;
  body: string;
  ctaText: string;
  /** v2 (Yooniz-style) series only: the one line under the button that
   *  bridges to the next email ("מחר נדבר על..."). Empty on the last one. */
  next?: string;
  /** v2 only, editable since 2026-10-04 (Gadi: every part of the email):
   *  the closing line, the team signature and the guides link text. An
   *  empty string removes that part from the email. */
  closing?: string;
  signature?: string;
  helpText?: string;
};

/** What the v2 email says when a field was never edited, per language. */
export function v2Defaults(l: LangArg): { closing: string; signature: string; helpText: string } {
  const { lang } = loc(l);
  return FAMILY_FIXED[isFamilyLang(lang) ? lang : "en"];
}

/** Fill {שם} / {name} with the parent's first name; without a name the
 *  placeholder (and the space before it) simply drops: "היי {שם}," → "היי,". */
export function applyName(s: string, firstName?: string | null): string {
  const n = (firstName ?? "").trim();
  if (n) return s.replace(/\{(?:שם|name)\}/g, n);
  return s.replace(/ ?\{(?:שם|name)\}/g, "");
}

const SITE = "https://www.gadit.app";

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

// Bold, then isolate Latin runs (RTL only). Order matters: escape first.
function inline(l: LangArg, s: string): string {
  const L = loc(l);
  // Pull links out first (as private-use markers) so the bold/Latin passes
  // can't break their hrefs, then put them back as real <a> tags.
  // Labeled links [text](url) first, so their URL isn't caught by the bare
  // URL pass. A "/path" opens that screen in the email's language.
  const named: { text: string; url: string }[] = [];
  let out = esc(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, url: string) => {
    const abs = url.startsWith("/") ? `${SITE}${L.prefix}${url === "/" && L.prefix ? "" : url}` : url;
    named.push({ text, url: abs });
    return `\uE004${named.length - 1}\uE005`;
  });
  const links: string[] = [];
  out = out.replace(/\bhttps?:\/\/[^\s<]+[^\s<.,:;)"']/g, (url) => {
    links.push(url);
    return `\uE000${links.length - 1}\uE001`;
  });
  // Bold as markers too: the Latin pass below must not touch the "b" in <b>
  // (it rendered a literal "<b>" in Hebrew emails).
  out = out.replace(/\*\*([^*]+)\*\*/g, "\uE002$1\uE003");
  if (L.rtl) {
    // Wrap runs of Latin letters/digits (and internal spaces/&/./slash) so an
    // embedded brand name or address (gadit.app/join) keeps its own
    // left-to-right order inside RTL text.
    out = out.replace(/[A-Za-z][A-Za-z0-9]*(?:[ .&/][A-Za-z0-9]+)*/g, (m) => `<span dir="ltr">${m}</span>`);
  }
  out = out.replace(/\uE002/g, "<b>").replace(/\uE003/g, "</b>");
  out = out.replace(/\uE000(\d+)\uE001/g, (_, i) => {
    const url = links[Number(i)];
    return `<a href="${url}" dir="ltr" style="color:#0E7490;word-break:break-all;">${url}</a>`;
  });
  out = out.replace(/\uE004(\d+)\uE005/g, (_, i) => {
    const { text, url } = named[Number(i)];
    const label = L.rtl ? text.replace(/[A-Za-z][A-Za-z0-9]*(?:[ .&/][A-Za-z0-9]+)*/g, (m) => `<span dir="ltr">${m}</span>`) : text;
    return `<a href="${url}" style="color:#0E7490;font-weight:600;text-decoration:underline;">${label}</a>`;
  });
  return out;
}

const rtlOf = (l: LangArg) => loc(l).rtl;
const P = (l: LangArg, html: string, he = rtlOf(l)) =>
  `<p dir="${he ? "rtl" : "ltr"}" style="text-align:${he ? "right" : "left"};font-size:16px;line-height:1.75;margin:0 0 16px;color:#374151;">${html}</p>`;
const H = (l: LangArg, html: string, he = rtlOf(l)) =>
  `<div dir="${he ? "rtl" : "ltr"}" style="text-align:${he ? "right" : "left"};font-size:16px;line-height:1.75;font-weight:700;color:#1C1917;margin:22px 0 8px;">${html}</div>`;
const OL = (l: LangArg, items: string[], he = rtlOf(l)) =>
  `<ol dir="${he ? "rtl" : "ltr"}" style="margin:0 0 14px;padding-${he ? "right" : "left"}:22px;text-align:${he ? "right" : "left"};font-size:16px;line-height:1.75;color:#374151;">` +
  items.map((it) => `<li style="margin-bottom:7px;">${it}</li>`).join("") +
  `</ol>`;

const STEP_RE = /^\s*(?:\d+\.|-)\s+(.*)$/;

export function mdLiteToHtml(he: LangArg, body: string): string {
  const blocks = body.replace(/\r\n/g, "\n").split(/\n\s*\n/); // blank-line separated
  const out: string[] = [];
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split("\n");
    // A block whose lines are ALL step markers → an ordered list.
    if (lines.every((l) => STEP_RE.test(l))) {
      out.push(OL(he, lines.map((l) => inline(he, l.replace(STEP_RE, "$1")))));
      continue;
    }
    if (lines[0].startsWith("## ")) {
      out.push(H(he, inline(he, lines[0].slice(3))));
      const rest = lines.slice(1);
      if (rest.length && rest.every((l) => STEP_RE.test(l))) {
        out.push(OL(he, rest.map((l) => inline(he, l.replace(STEP_RE, "$1")))));
      } else if (rest.join(" ").trim()) {
        out.push(P(he, inline(he, rest.join(" "))));
      }
      continue;
    }
    // A paragraph that opens with a bold label ("**טיפ מהשטח:**", "**מומלץ:**",
    // "**המחשה:**") puts the label on its own line and the text under it
    // (Gadi 2026-10-04), and each sentence of that text on a line of its own
    // so a tip never runs into one long line (Gadi 2026-10-05).
    const text = lines.join(" ");
    const lab = text.match(/^\*\*([^*\n]{1,30}?):?\*\*:?\s+([\s\S]+)$/);
    if (lab && /:\*\*|\*\*:/.test(text.slice(0, lab[1].length + 6))) {
      const sentences = lab[2].trim().split(/(?<=[.!?]["”׳']?)\s+(?=\S)/);
      out.push(P(he, `${inline(he, `**${lab[1]}:**`)}<br>${sentences.map((x) => inline(he, x)).join("<br>")}`));
      continue;
    }
    out.push(P(he, inline(he, text)));
  }
  return out.join("");
}

/** Wrap the rendered body in the branded shell. */
export function renderEmailHtml(opts: {
  he: boolean;
  eyebrow: string;
  heading: string;
  bodyHtml: string;
  ctaText: string;
  ctaUrl: string;
  foot: string;
  unsubscribeUrl: string;
}): string {
  const { he } = opts;
  const dir = he ? "rtl" : "ltr";
  const align = he ? "right" : "left";
  return `<!DOCTYPE html><html dir="${dir}"><body style="margin:0;padding:28px 12px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:${EMAIL_BG};color:#111827;">
  <div dir="${dir}" style="max-width:${EMAIL_CARD_MAX}px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #E1EAE7;overflow:hidden;text-align:${align};">
    ${emailHeaderHtml()}
    <div dir="${dir}" style="padding:30px 36px 24px;text-align:${align};">
      ${opts.heading ? `<div dir="${dir}" style="text-align:${align};font-size:22px;font-weight:700;color:#111827;margin:0 0 16px;">${esc(opts.heading)}</div>` : ""}
      <div dir="${dir}" style="text-align:${align};font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#0EA5A5;margin:0 0 10px;">${esc(opts.eyebrow)}</div>
      ${opts.bodyHtml}
      <div style="text-align:center;margin-top:22px;">
        <a href="${opts.ctaUrl}" style="display:inline-block;background:#0EA5A5;color:#fff;padding:13px 32px;border-radius:999px;text-decoration:none;font-weight:650;font-size:16px;">${esc(opts.ctaText)}</a>
      </div>
      <div dir="${dir}" style="text-align:${align};margin:26px 0 0;font-size:15px;line-height:1.6;color:#111827;">
        <p style="margin:0;">${he ? "שלך," : "Yours,"}</p>
        <p style="margin:0;font-weight:600;">${he ? "גדי" : "Gadi"}</p>
        <p style="margin:0;color:#6B7280;font-size:14px;" dir="${dir}">${he ? "מייסד, " : "Founder, "}<span dir="ltr" translate="no">Gadit</span></p>
      </div>
      <p dir="${dir}" style="text-align:${align};font-size:13px;color:#6B7280;line-height:1.5;margin:22px 0 0;">${esc(opts.foot)}</p>
      <p dir="${dir}" style="text-align:${align};font-size:11px;color:#B4B4B4;margin:16px 0 0;"><a href="${opts.unsubscribeUrl}" style="color:#B4B4B4;">${he ? "להסרה מרשימת התפוצה" : "Unsubscribe"}</a></p>
    </div>
  </div>
</body></html>`;
}

/**
 * v2 shell for the Yooniz-style Family series (Gadi 2026-09-28): the body
 * carries its own "היי {שם}," greeting; then one optional button (no button
 * when the email has nowhere to send), the bridge line to the next email,
 * "אנחנו כאן לכל שאלה ועזרה.", and the team signature. Same spacing between
 * every paragraph. Signed by the team, never by a person.
 */
export function renderEmailHtmlV2(opts: {
  he: boolean;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl: string;
  next?: string;
  closing?: string;
  signature?: string;
  helpText?: string;
  helpUrl: string;
  unsubscribeUrl: string;
  /** Any UI language; overrides `he` when given. */
  lang?: string;
}): string {
  const L = loc(opts.lang ?? opts.he);
  const he = L.rtl; // direction below; texts come from the language
  const F = FAMILY_FIXED[isFamilyLang(L.lang) ? L.lang : "en"];
  const D = v2Defaults(L.lang);
  const closing = (opts.closing ?? D.closing).trim();
  const signature = (opts.signature ?? D.signature).trim();
  const helpText = (opts.helpText ?? D.helpText).trim();
  const dir = he ? "rtl" : "ltr";
  const align = he ? "right" : "left";
  const para = (html: string, extra = "") =>
    `<p dir="${dir}" style="text-align:${align};font-size:15px;line-height:1.7;margin:0 0 14px;color:#374151;${extra}">${html}</p>`;
  const cta = opts.ctaText?.trim()
    ? `<div style="text-align:center;margin:30px 0 30px;"><a href="${opts.ctaUrl}" style="display:inline-block;background:#0EA5A5;color:#fff;padding:13px 32px;border-radius:999px;text-decoration:none;font-weight:650;font-size:16px;">${esc(opts.ctaText.trim())}</a></div>`
    : "";
  const next = opts.next?.trim() ? para(inline(L.lang, opts.next.trim())) : "";
  return `<!DOCTYPE html><html dir="${dir}"><body style="margin:0;padding:28px 12px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:${EMAIL_BG};color:#111827;">
  <div dir="${dir}" style="max-width:${EMAIL_CARD_MAX}px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #E1EAE7;overflow:hidden;text-align:${align};">
    ${emailHeaderHtml()}
    <div dir="${dir}" style="padding:30px 36px 10px;text-align:${align};">
      ${opts.bodyHtml}
      ${cta}
      ${next}
      ${closing ? para(inline(L.lang, closing), "margin-top:26px;") : ""}
      ${signature ? emailSignatureHtml(he, signature) : ""}
      ${helpText ? `<p dir="${dir}" style="text-align:${align};font-size:14px;margin:0 0 22px;"><a href="${opts.helpUrl}" style="color:#0E7490;">${esc(helpText)}</a></p>` : ""}
    </div>
    <div style="border-top:1px solid #EEF2F1;padding:16px 24px 20px;text-align:center;">
      <p dir="${dir}" style="margin:0 0 6px;font-size:12px;color:#9CA3AF;"><span dir="ltr" translate="no">Gadit</span>${F.tagline ? ` · ${esc(F.tagline)}` : ""}</p>
      ${opts.unsubscribeUrl ? `<p style="margin:0;font-size:11px;"><a href="${opts.unsubscribeUrl}" style="color:#B4B4B4;">${esc(F.unsub)}</a></p>` : ""}
    </div>
  </div>
</body></html>`;
}
