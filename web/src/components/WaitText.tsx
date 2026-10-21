/**
 * WaitText / WaitDots: the one visible "something is happening" signal.
 *
 * Every place where the user waits for a request (reading a file, preparing
 * a quiz, saving, sending...) shows its waiting copy followed by three dots
 * that keep moving, so the wait can't be mistaken for a frozen screen.
 *
 * Pure markup (no hooks, no "use client"), so it renders in server and
 * client components alike. The animation lives in globals.css (gd-wait-*):
 * the dots use currentColor so they match any button, card or kid skin, and
 * prefers-reduced-motion turns them into a static "...".
 *
 * <WaitText text={t.reading} />          inside a button or a label
 * <WaitText text={t.loading} live />     a standalone status line
 * <WaitDots />                           where only an indicator shows
 */

/** Drop a trailing "…", "...", "……" (and the space before it) from copy. */
export function stripEllipsis(text: string): string {
  return text.replace(/[\s ]*(?:…|\.{2,})+[\s ]*$/u, "");
}

export function WaitDots({ className }: { className?: string }) {
  return (
    <span className={className ? `gd-wait-dots ${className}` : "gd-wait-dots"} aria-hidden="true">
      <span className="gd-wait-dot" />
      <span className="gd-wait-dot" />
      <span className="gd-wait-dot" />
    </span>
  );
}

export function WaitText({
  text,
  live = false,
  className,
}: {
  text: string;
  /** Announce politely (role="status"). Leave off inside buttons. */
  live?: boolean;
  className?: string;
}) {
  const clean = stripEllipsis(text);
  // Keep the dots glued to the last word so they never wrap onto a line
  // of their own.
  const cut = clean.lastIndexOf(" ");
  const head = cut >= 0 ? clean.slice(0, cut + 1) : "";
  const tail = cut >= 0 ? clean.slice(cut + 1) : clean;
  return (
    <span
      className={className ? `gd-wait ${className}` : "gd-wait"}
      role={live ? "status" : undefined}
      aria-live={live ? "polite" : undefined}
    >
      {head}
      <span className="gd-wait-tail">
        {tail}
        <WaitDots />
      </span>
    </span>
  );
}

export default WaitText;
