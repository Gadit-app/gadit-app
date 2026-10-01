/**
 * Shared brand pieces for every customer email (Gadi 2026-10-01): the real
 * Gadit wordmark ("Gad" ink + "it" teal italic, rendered to a PNG so it looks
 * the same in every mail client), centered on white, with a thin divider
 * under it. Yooniz-style roomy card. Admin-only notices keep their own look.
 */

export const EMAIL_SITE = "https://www.gadit.app";
/** 92x45 CSS px, rendered at 3x from the site's wordmark (Inter 600 + teal italic "it"). */
export const EMAIL_LOGO_URL = `${EMAIL_SITE}/email/gadit-logo.png`;
export const EMAIL_ICON_URL = `${EMAIL_SITE}/icon-192.png`;
/** Outer background around the white card. */
export const EMAIL_BG = "#EEF5F3";
export const EMAIL_CARD_MAX = 600;

/** Centered logo on white + divider. Goes first inside the white card. */
export function emailHeaderHtml(): string {
  return `<div style="text-align:center;padding:28px 24px 22px;background:#FFFFFF;">
      <a href="${EMAIL_SITE}" style="text-decoration:none;"><img src="${EMAIL_LOGO_URL}" width="92" height="45" alt="Gadit" style="display:inline-block;width:92px;height:45px;border:0;outline:none;text-decoration:none;" /></a>
    </div>
    <div style="height:1px;line-height:1px;font-size:0;background:#E6ECEA;margin:0 32px;">&nbsp;</div>`;
}

/** Team signature with the app icon (like the Yooniz signature block). */
export function emailSignatureHtml(he: boolean): string {
  const dir = he ? "rtl" : "ltr";
  const align = he ? "right" : "left";
  const name = he ? `הצוות של <span dir="ltr" translate="no">Gadit</span>` : `The <span translate="no">Gadit</span> team`;
  return `<table role="presentation" dir="${dir}" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 18px;">
      <tr>
        <td style="padding-${he ? "left" : "right"}:12px;vertical-align:middle;"><img src="${EMAIL_ICON_URL}" width="40" height="40" alt="" style="display:block;width:40px;height:40px;border-radius:10px;border:0;" /></td>
        <td style="vertical-align:middle;text-align:${align};font-size:15px;font-weight:700;color:#111827;line-height:1.3;">${name}</td>
      </tr>
    </table>`;
}
