/**
 * Detect when the page is loaded inside an in-app webview — Instagram,
 * Facebook, TikTok, X, LinkedIn etc. Most of these block Google OAuth
 * popups (and Google itself refuses to authorise embedded user-agents
 * for security), so the sign-in flow has to fall back to email/password
 * or to opening the link in the real browser.
 *
 * Detection is best-effort UA sniffing. The flagged tokens come from
 * the actual UA strings each app injects:
 *   Instagram      — "Instagram x.x.x"
 *   Facebook       — "FBAN/FBAV" (FB App Name / Version)
 *   Facebook Lite  — "FB_IAB" (Facebook In-App Browser)
 *   Messenger      — "FBAN/Messenger" or "MessengerLiteForiOS"
 *   TikTok         — "musical_ly" or "Bytedance" or "tiktok"
 *   X / Twitter    — "Twitter for"
 *   LinkedIn       — "LinkedInApp"
 *   Snapchat       — "Snapchat"
 *   WeChat         — "MicroMessenger"
 *
 * Edge cases:
 *   - Apps update their UAs occasionally. False negatives are tolerable
 *     (the Google popup just won't open, user sees a generic error);
 *     false positives are worse (we'd hide Google in real browsers).
 *     The patterns below are conservative — only token-based, not
 *     prefix-loose.
 *   - SSR-safe: returns false when `navigator` is undefined so layouts
 *     don't diverge between server and first client render.
 *
 * Used by:
 *   - LoginModalV2 to hide the Google button + show an explainer
 *   - (future) install-prompt suppression already self-protects via
 *     beforeinstallprompt + isSafari() checks, no change needed there
 */

export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;

  // Match each app's signature token. Order doesn't matter — first hit
  // returns true.
  const patterns = [
    /Instagram/i,
    /FBAN|FBAV|FB_IAB/i,
    /Messenger/i,
    /musical_ly|Bytedance|TikTok/i,
    /Twitter for/i,
    /LinkedInApp/i,
    /Snapchat/i,
    /MicroMessenger/i,
  ];

  return patterns.some((re) => re.test(ua));
}

/**
 * A finer-grained variant that returns the app name when detected, so
 * UI can show "Open in Safari" or "Open in Chrome" with the originating
 * app's name. Returns null when not in a known webview.
 */
export function detectInAppBrowser(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;

  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if (/Messenger/i.test(ua)) return "Messenger";
  if (/musical_ly|Bytedance|TikTok/i.test(ua)) return "TikTok";
  if (/Twitter for/i.test(ua)) return "X";
  if (/LinkedInApp/i.test(ua)) return "LinkedIn";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  if (/MicroMessenger/i.test(ua)) return "WeChat";

  return null;
}
