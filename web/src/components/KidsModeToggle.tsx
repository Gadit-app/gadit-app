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

function KidIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Friendly face — small head with a smile and a tuft of hair */}
      <circle cx="12" cy="13" r="6.5" />
      <path d="M8.5 11.5h.01M15.5 11.5h.01" strokeWidth="2" />
      <path d="M9.5 15.5c.7.6 1.6 1 2.5 1s1.8-.4 2.5-1" />
      <path d="M6.5 8.5c1-2 2.5-3 5.5-3s4.5 1 5.5 3" />
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
