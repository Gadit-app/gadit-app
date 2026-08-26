/**
 * Disposable / throwaway email detection.
 *
 * Junk signups (bots, tire-kickers, someone dodging our card wall with a
 * fake Schools trial) often use a throwaway inbox. Sending a welcome mail
 * and the whole drip sequence to a mailinator/tempmail address does two bad
 * things: it wastes send volume, and — worse — those addresses bounce or get
 * marked as spam, which drags down the gadit.app sender reputation for the
 * REAL users. So we detect the obvious throwaway domains and suppress email
 * to them (the account is still created; we just don't mail it).
 *
 * This is a curated static list, not a live lookup — no network call, no
 * dependency, and it covers the domains that actually show up. It will never
 * catch a fake Gmail (a real deliverable inbox), and that's fine: the schools
 * card-upfront rule is what stops the fake-B2B-trial abuse; this only protects
 * deliverability from the throwaway-domain class.
 */

// Lower-cased bare domains. Kept deliberately tight — only unambiguous
// disposable providers, so we never suppress a real user's mail.
const DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "sharklasers.com",
  "grr.la",
  "10minutemail.com",
  "10minutemail.net",
  "temp-mail.org",
  "tempmail.com",
  "tempmailo.com",
  "tempr.email",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.net",
  "getnada.com",
  "nada.email",
  "dispostable.com",
  "trashmail.com",
  "trashmail.de",
  "maildrop.cc",
  "mailnesia.com",
  "mohmal.com",
  "fakeinbox.com",
  "fakemailgenerator.com",
  "spamgourmet.com",
  "mailcatch.com",
  "emailondeck.com",
  "mintemail.com",
  "mytemp.email",
  "burnermail.io",
  "moakt.com",
  "tmpmail.org",
  "tmpmail.net",
  "1secmail.com",
  "1secmail.org",
  "1secmail.net",
  "inboxkitten.com",
  "harakirimail.com",
  "discard.email",
  "wegwerfmail.de",
]);

/** Does this email use a known disposable / throwaway domain? */
export function isDisposableEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).trim().toLowerCase();
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  // Catch sub-addressed throwaways (e.g. foo@x.mailinator.com).
  for (const d of DISPOSABLE_DOMAINS) {
    if (domain.endsWith("." + d)) return true;
  }
  return false;
}
