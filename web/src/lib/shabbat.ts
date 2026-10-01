/**
 * Shabbat guard for outgoing email. Gadit never sends its own emails on
 * Shabbat (Gadi 2026-10-01: "אף פעם לא שולחים מיילים ביום שבת").
 *
 * Israel time, with a safe margin around candle lighting and havdalah all
 * year: from Friday 15:00 until Saturday 21:00 (Asia/Jerusalem, so summer
 * and winter time are handled). A mail that falls in that window waits for
 * the next run after it.
 */
export function isShabbatIL(at: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(at);
  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  if (weekday === "Fri") return hour >= 15;
  if (weekday === "Sat") return hour < 21;
  return false;
}
