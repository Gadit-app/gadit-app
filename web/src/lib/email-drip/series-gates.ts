/**
 * Gates for onboarding-series emails that only some people get (2026-10-26,
 * "key words by subject": he / en / de only). The drip cron calls this
 * before it picks the day's email; every gated email that is due and not
 * yet stamped comes back with the reason it is skipped, and the cron stamps
 * it { skippedAt, reason } like a stale email, so the series simply goes on.
 *
 *   lang       the series language is not in `langs` (never an English fallback)
 *   announced  the announcement `skipIfAnnounced` already reached this user
 *   order      a later email of the series is already stamped (sent or
 *              skipped): an email added mid-way never arrives out of order
 */
export type GatedMail = {
  key: string;
  dayOffset: number;
  langs?: readonly string[];
  skipIfAnnounced?: string;
  strictOrder?: boolean;
};

export type GateSkip = { key: string; reason: "lang" | "announced" | "order" };

export function seriesGateSkips(
  mails: GatedMail[],
  stamped: Record<string, unknown>,
  dayN: number,
  lang: string,
  d: Record<string, unknown>,
): GateSkip[] {
  const announced = (d.announcementsSent as Record<string, unknown> | undefined) ?? {};
  const out: GateSkip[] = [];
  for (const m of mails) {
    if (stamped[m.key] || m.dayOffset > dayN) continue;
    if (!m.langs && !m.skipIfAnnounced && !m.strictOrder) continue;
    if (m.langs && !m.langs.includes(lang)) out.push({ key: m.key, reason: "lang" });
    else if (m.skipIfAnnounced && announced[m.skipIfAnnounced]) out.push({ key: m.key, reason: "announced" });
    else if (m.strictOrder && mails.some((o) => o.dayOffset > m.dayOffset && stamped[o.key])) out.push({ key: m.key, reason: "order" });
  }
  return out;
}
