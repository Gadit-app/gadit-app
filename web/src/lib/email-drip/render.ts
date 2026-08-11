/**
 * Email renderer for the editable Family series. Non-technical editors
 * (Gadi / Sharon) write "markdown-lite" text and this turns it into the
 * branded, RTL-safe HTML email. No raw HTML for them to break.
 *
 * Markdown-lite:
 *   ## Heading            → section heading
 *   1. step  /  - step    → a numbered/bulleted step list (consecutive lines)
 *   **bold**              → bold
 *   blank line            → new paragraph
 * Latin runs (Gadit, ChatGPT, ...) are auto-isolated in RTL so brand names
 * don't scramble the Hebrew word order.
 */

export type EmailContent = { subject: string; heading: string; body: string; ctaText: string };

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

// Bold, then isolate Latin runs (RTL only). Order matters: escape first.
function inline(he: boolean, s: string): string {
  let out = esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  if (he) {
    // Wrap runs of Latin letters/digits (and internal spaces/&/.) so an
    // embedded brand name keeps its own left-to-right order inside RTL text.
    out = out.replace(/[A-Za-z][A-Za-z0-9]*(?:[ .&][A-Za-z0-9]+)*/g, (m) => `<span dir="ltr">${m}</span>`);
  }
  return out;
}

const P = (he: boolean, html: string) =>
  `<p dir="${he ? "rtl" : "ltr"}" style="text-align:${he ? "right" : "left"};font-size:15px;line-height:1.7;margin:0 0 14px;color:#374151;">${html}</p>`;
const H = (he: boolean, html: string) =>
  `<div dir="${he ? "rtl" : "ltr"}" style="text-align:${he ? "right" : "left"};font-size:16px;font-weight:800;color:#1C1917;margin:20px 0 8px;">${html}</div>`;
const OL = (he: boolean, items: string[]) =>
  `<ol dir="${he ? "rtl" : "ltr"}" style="margin:0 0 14px;padding-${he ? "right" : "left"}:22px;text-align:${he ? "right" : "left"};font-size:15px;line-height:1.75;color:#374151;">` +
  items.map((it) => `<li style="margin-bottom:7px;">${it}</li>`).join("") +
  `</ol>`;

const STEP_RE = /^\s*(?:\d+\.|-)\s+(.*)$/;

export function mdLiteToHtml(he: boolean, body: string): string {
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
    out.push(P(he, inline(he, lines.join(" "))));
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
  return `<!DOCTYPE html><html dir="${dir}"><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F9FAFB;color:#111827;">
  <div dir="${dir}" style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;border:1px solid #E5E7EB;overflow:hidden;text-align:${align};">
    <div style="background:linear-gradient(135deg,#0EA5A5,#0E7490);padding:26px 24px;color:#fff;">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;opacity:.85;" dir="ltr">GADIT FAMILY</div>
      <div dir="${dir}" style="text-align:${align};font-size:22px;font-weight:700;margin-top:6px;">${esc(opts.heading)}</div>
    </div>
    <div dir="${dir}" style="padding:24px;text-align:${align};">
      <div dir="${dir}" style="text-align:${align};font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#0EA5A5;margin:0 0 10px;">${esc(opts.eyebrow)}</div>
      ${opts.bodyHtml}
      <div style="text-align:center;margin-top:22px;">
        <a href="${opts.ctaUrl}" style="display:inline-block;background:#0EA5A5;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:650;font-size:15px;">${esc(opts.ctaText)}</a>
      </div>
      <p dir="${dir}" style="text-align:${align};font-size:13px;color:#6B7280;line-height:1.5;margin:22px 0 0;">${esc(opts.foot)}</p>
      <p dir="${dir}" style="text-align:${align};font-size:11px;color:#B4B4B4;margin:16px 0 0;"><a href="${opts.unsubscribeUrl}" style="color:#B4B4B4;">${he ? "להסרה מרשימת התפוצה" : "Unsubscribe"}</a></p>
    </div>
  </div>
</body></html>`;
}
