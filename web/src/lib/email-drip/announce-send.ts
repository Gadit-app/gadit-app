/**
 * The per-user loop of a "what's new" announcement (lib/email-drip/
 * announcements.ts), shared by the admin route (/api/admin/announce: dry
 * run, test, send=1) and the automatic send (/api/cron/announcements).
 *
 * Who gets it: the announcement's audience (inAudience), never an
 * unsubscribed or suppressed address, never our own accounts, once per user
 * (users.announcementsSent[id]). An announcement limited to some languages
 * (`langs`) skips everyone else ("skip_lang"), never sending the English.
 * Sends are scheduled, so a send that falls on Shabbat waits it out.
 *
 * A dry run reads only: no email, no write.
 */
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { Auth, UserRecord } from "firebase-admin/auth";
import type { Announcement } from "./announcements";
import { renderFamilyMail } from "./family-drip";
import { buildUnsubUrl } from "./registry";
import { sendDripEmail } from "./send";
import { isInternalEmail, isPayingStatus } from "@/lib/internal-accounts";

type Doc = Record<string, unknown>;

export type AnnounceStatus =
  | "would_send"
  | "sent"
  | "already"
  | "skip_lang"
  | "skip_ios"
  | "skip_series"
  | "skip_failed"
  | "pending"
  | `failed: ${string}`;

export type AnnounceRow = { uid: string; email: string; lang: string; status: AnnounceStatus };

/** The user's language, as the announcements have always computed it: the
 *  UI language, else Hebrew for an Israeli / Hebrew-drip account, else English. */
export function announcementLang(d: Doc): string {
  if (typeof d.uiLang === "string" && d.uiLang) return d.uiLang;
  return d.dripLang === "he" || d.country === "IL" ? "he" : "en";
}

/** Does this user belong to the announcement's audience? (Email, internal
 *  accounts and unsubscribe are checked by the loop.) */
export function inAudience(a: Announcement, uid: string, d: Doc): boolean {
  const status = d.subscriptionStatus;
  const subscriber = isPayingStatus(status) || status === "trialing";
  const familyOwner = d.familyId === uid;
  const individual = !d.familyId && !d.schoolId && (d.plan === "clear" || d.plan === "deep");
  switch (a.audience) {
    case "family":
      return subscriber && familyOwner;
    case "individual":
      // Individual subscribers on Deep: legacy Clear has no Practice.
      return subscriber && !d.familyId && !d.schoolId && d.plan === "deep";
    case "paying":
      // Family owners + Individual (Clear or Deep). Never a family member
      // (the owner hears it) or a school account.
      return subscriber && (familyOwner || individual);
    case "basic":
      // Signed-up adults with no paid or trial plan: never a kid or another
      // family member (familyId of someone else; the owner of an ended Family
      // is Basic again), never a school account (schoolId), never anyone a
      // plan still gives access to.
      return (
        !subscriber &&
        (!d.familyId || familyOwner) &&
        !d.schoolId &&
        d.plan !== "clear" &&
        d.plan !== "deep" &&
        d.familyRole !== "kid"
      );
  }
}

/** Uses the iOS app (Apple 3.1.3: no steering an app user to buy elsewhere,
 *  so no Basic upsell email). Play users are fine. */
export function isIosAppUser(d: Doc): boolean {
  const intent = d.appUpgradeIntent as { platform?: unknown } | undefined;
  return d.iosAppUser === true || intent?.platform === "ios";
}

/** The content and render language for a user language: Hebrew, a
 *  translation under `t`, else English. */
export function announcementContent(a: Announcement, lang: string) {
  if (lang === "he") return { lang: "he", content: a.he };
  if (lang !== "en" && a.t?.[lang]) return { lang, content: a.t[lang] };
  return { lang: "en", content: a.en };
}

/** Render the announcement email in a user language (same layout as the series). */
export function buildAnnouncementMail(a: Announcement, lang: string, uid: string, firstName: string | null) {
  const meta = { key: `announce-${a.id}`, label: a.id, dayOffset: 0, ctaUrlTab: "", ctaPath: a.ctaPath, v2: true };
  const { lang: use, content } = announcementContent(a, lang);
  return renderFamilyMail(meta, use, content, { unsubscribeUrl: buildUnsubUrl(uid), firstName });
}

/** Did an announcement reach this user on the Israel calendar day of `now`? */
export function announcedOnIlDay(d: Doc, now: number): boolean {
  const sent = d.announcementsSent as Record<string, unknown> | undefined;
  if (!sent) return false;
  const day = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date(ms));
  const today = day(now);
  for (const v of Object.values(sent)) {
    const ms = typeof (v as { toMillis?: unknown })?.toMillis === "function" ? (v as { toMillis: () => number }).toMillis() : NaN;
    if (Number.isFinite(ms) && day(ms) === today) return true;
  }
  return false;
}

async function listAuthUsers(auth: Auth): Promise<Map<string, UserRecord>> {
  const out = new Map<string, UserRecord>();
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const u of page.users) out.set(u.uid, u);
    pageToken = page.pageToken;
  } while (pageToken);
  return out;
}

export type RunAnnouncementOpts = {
  /** true = really send (and stamp); false = dry run (reads only). */
  send: boolean;
  /** Epoch ms: no new send starts after it; the rest is reported "pending". */
  deadline?: number;
  /** Minimum ms between two real sends (Resend's rate limit). */
  paceMs?: number;
  /** Users not to try again (failed too often in earlier runs). */
  skipUids?: Set<string>;
};

export type RunAnnouncementResult = {
  id: string;
  send: boolean;
  rows: AnnounceRow[];
  counts: Record<string, number>;
  /** language → status → count. */
  byLang: Record<string, Record<string, number>>;
  /** Some eligible users were not reached before the deadline. */
  stoppedEarly: boolean;
};

export async function runAnnouncement(db: Firestore, auth: Auth, a: Announcement, opts: RunAnnouncementOpts): Promise<RunAnnouncementResult> {
  const [snap, authUsers] = await Promise.all([db.collection("users").get(), listAuthUsers(auth)]);
  const rows: AnnounceRow[] = [];
  let lastSend = 0;
  for (const doc of snap.docs) {
    const d = doc.data() as Doc;
    if (!inAudience(a, doc.id, d)) continue;
    if (d.dripUnsubscribed === true || d.emailSuppressed === true) continue;
    // The account itself (Auth) gives the address and the name; a doc
    // without an account (deleted) or a disabled account gets nothing.
    const au = authUsers.get(doc.id);
    if (!au || au.disabled) continue;
    const email = au.email ?? (typeof d.email === "string" ? d.email : null);
    if (!email || isInternalEmail(email)) continue;
    const lang = announcementLang(d);
    const row = (status: AnnounceStatus) => rows.push({ uid: doc.id, email, lang, status });

    if ((d.announcementsSent as Doc | undefined)?.[a.id]) { row("already"); continue; }
    if (a.langs && !a.langs.includes(lang)) { row("skip_lang"); continue; }
    if (a.audience === "basic" && isIosAppUser(d)) { row("skip_ios"); continue; }
    if (a.skipIfSeriesSent?.length) {
      const fam = (d.familyDripSent as Record<string, { sentAt?: unknown }> | undefined) ?? {};
      const ind = (d.indivDripSent as Record<string, { sentAt?: unknown }> | undefined) ?? {};
      if (a.skipIfSeriesSent.some((k) => fam[k]?.sentAt || ind[k]?.sentAt)) { row("skip_series"); continue; }
    }
    if (opts.skipUids?.has(doc.id)) { row("skip_failed"); continue; }
    if (!opts.send) { row("would_send"); continue; }
    if (opts.deadline && Date.now() > opts.deadline) { row("pending"); continue; }

    if (opts.paceMs) {
      const wait = lastSend + opts.paceMs - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    }
    const name = (typeof d.displayName === "string" && d.displayName) || au.displayName || "";
    const mail = buildAnnouncementMail(a, lang, doc.id, name.trim().split(/\s+/)[0] || null);
    lastSend = Date.now();
    const r = await sendDripEmail({ to: email, subject: mail.subject, html: mail.html, scheduled: true });
    if (r.ok) await doc.ref.set({ announcementsSent: { [a.id]: FieldValue.serverTimestamp() } }, { merge: true });
    row(r.ok ? "sent" : `failed: ${r.reason}`);
  }

  const counts: Record<string, number> = {};
  const byLang: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const s = r.status.startsWith("failed") ? "failed" : r.status;
    counts[s] = (counts[s] ?? 0) + 1;
    (byLang[r.lang] ??= {})[s] = (byLang[r.lang][s] ?? 0) + 1;
  }
  return { id: a.id, send: opts.send, rows, counts, byLang, stoppedEarly: (counts.pending ?? 0) > 0 };
}
