"use client";

/**
 * KidsModeToggle — a small chip that switches the whole dictionary
 * into kid-friendly rendering. Persisted via useKidsMode in
 * localStorage; the /api/define route picks the flag up from each
 * search request and adjusts the prompt accordingly.
 *
 * Gating:
 *   - anonymous / Basic: tap fires onBasicGate() (the caller usually
 *     wires this to open UpgradeModal with feature="kids"). The toggle
 *     never enters the "on" state for these users — we only commit the
 *     localStorage write when the upgrade actually happens.
 *   - Clear / Deep: tap flips the boolean.
 *
 * Visual:
 *   - off: soft pill, neutral grey, friendly child-face icon.
 *   - on: filled teal pill with the same icon in white; small dot in
 *     the corner signals the active state. Subtle enough that it
 *     doesn't compete with the search bar above; obvious enough that
 *     a parent across the room can see whether it's lit.
 */

import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useKidsMode } from "@/lib/use-kids-mode";

interface Props {
  plan: "basic" | "clear" | "deep";
  onBasicGate?: () => void;
}

function KidIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Big bright smiley — wider head, oversized smile that arcs
          deep enough to read as a grin from across the room, plus two
          tall oval eyes for kid-clarity. Earlier 16px head + thin
          smile read as a generic emoji silhouette; this is friendly
          and obvious. */}
      <circle cx="12" cy="12" r="9.25" />
      <ellipse cx="8.5" cy="10" rx="0.9" ry="1.35" fill="currentColor" stroke="none" />
      <ellipse cx="15.5" cy="10" rx="0.9" ry="1.35" fill="currentColor" stroke="none" />
      <path d="M7.5 14c1.2 2 2.7 3 4.5 3s3.3-1 4.5-3" strokeWidth="1.8" />
    </svg>
  );
}

export function KidsModeToggle({ plan, onBasicGate }: Props) {
  const { lang } = useLang();
  const [on, setOn] = useKidsMode();

  const isPaid = plan === "clear" || plan === "deep";

  const handleClick = () => {
    if (!isPaid) {
      // Bounce Basic + anonymous through the upgrade flow instead of
      // letting them flip a flag whose effect they'll never see.
      onBasicGate?.();
      return;
    }
    setOn(!on);
  };

  const tooltip = on
    ? v2(lang, "kidsModeTooltipOn")
    : v2(lang, "kidsModeTooltipOff");

  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={on}
      className={`wb-kids-toggle${on ? " is-on" : ""}`}
    >
      <KidIcon size={16} />
      <span>{v2(lang, "kidsModeLabel")}</span>
    </button>
  );
}
