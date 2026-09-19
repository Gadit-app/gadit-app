/**
 * signup-guard — blocks throwaway / relay email domains at sign-up.
 *
 * Gadit kept getting bot signups from DuckDuckGo relay aliases (random word
 * triads like roast-ahoy-cringe@duck.com) that start a phantom card-less trial
 * and spam the signup notification (Gadi 2026-09). These domains are of no use
 * to a real family (they can sign up with a normal address), so we refuse them
 * at the signup form. Extend the list as new patterns appear.
 */
const BLOCKED_DOMAINS = new Set<string>([
  // DuckDuckGo email relay — the repeat offender.
  "duck.com",
  // Common disposable / throwaway providers.
  "mailinator.com", "guerrillamail.com", "guerrillamail.info", "sharklasers.com",
  "grr.la", "guerrillamail.net", "guerrillamail.org", "guerrillamail.biz",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
  "trashmail.com", "yopmail.com", "getnada.com", "nada.email", "dispostable.com",
  "mailnesia.com", "throwawaymail.com", "maildrop.cc", "fakeinbox.com",
  "mohmal.com", "emailondeck.com", "tempmailo.com", "mintemail.com",
  "moakt.com", "spam4.me", "byom.de", "discard.email", "mailcatch.com",
]);

/** True if the email's domain is a blocked throwaway / relay provider. */
export function isBlockedSignupEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return BLOCKED_DOMAINS.has(domain);
}
