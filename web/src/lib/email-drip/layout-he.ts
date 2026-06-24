/**
 * Hebrew email layout — shared chrome for every mail in the
 * /lib/email-drip series. Builds the outer HTML wrapper: dir="rtl",
 * Hebrew font fallbacks, white card on gray background, Gadit
 * wordmark header, CTA button, footer with unsubscribe.
 *
 * All inline-styled (no <style> blocks) because every major email
 * client strips or mangles class-based CSS. Tables for layout because
 * Outlook still ignores flex.
 */

export function layoutHe(opts: {
  preheader: string;
  /** Raw HTML for the body (already wrapped in <p> tags, etc.) */
  bodyHtml: string;
  ctaText: string;
  ctaUrl: string;
  unsubscribeUrl: string;
  signature?: string;
}): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="he" dir="rtl">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gadit</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'Rubik','Heebo',Arial,sans-serif;direction:rtl;color:#111827;">
  <span style="display:none !important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:#F9FAFB;">${opts.preheader}</span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F9FAFB;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;box-shadow:0 1px 3px rgba(15,23,42,0.04);">
          <tr>
            <td align="center" style="padding:32px 32px 8px;direction:ltr;">
              <span style="font-family:'Inter',Arial,sans-serif;font-size:32px;font-weight:700;color:#111827;letter-spacing:-0.02em;line-height:1;">Gad<span style="color:#0EA5A5;font-style:italic;">it</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 8px;font-size:16px;line-height:1.75;color:#111827;text-align:right;direction:rtl;">
              ${opts.bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 32px 24px;">
              <a href="${opts.ctaUrl}" style="display:inline-block;background:#0EA5A5;color:#FFFFFF;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:600;font-size:15px;direction:rtl;">${opts.ctaText}</a>
            </td>
          </tr>
          ${opts.signature ? `<tr>
            <td style="padding:0 32px 28px;font-size:16px;line-height:1.6;color:#374151;text-align:right;direction:rtl;">
              ${opts.signature}
            </td>
          </tr>` : ""}
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #F3F4F6;font-size:12px;color:#9CA3AF;text-align:center;direction:rtl;line-height:1.6;">
              קיבלת את המייל הזה כי נרשמת ל-Gadit.<br/>
              <a href="${opts.unsubscribeUrl}" style="color:#9CA3AF;text-decoration:underline;">להסיר הרשמה</a>
              &nbsp;·&nbsp;
              <a href="https://www.gadit.app" style="color:#9CA3AF;text-decoration:underline;">gadit.app</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
