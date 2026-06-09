"use client";

/**
 * KidsModeToggle — iOS-style switch that flips the dictionary into
 * kid-friendly rendering. Persisted via useKidsMode in localStorage;
 * /api/define and the per-meaning render swap pick up the flag.
 *
 * Gating:
 *   - anonymous / Basic: tap fires onBasicGate() (caller usually opens
 *     UpgradeModal with feature="kids"). The toggle never enters the
 *     "on" state for these users — we only commit the localStorage
 *     write when the upgrade actually happens.
 *   - Clear / Deep: tap flips the boolean.
 *
 * Visual:
 *   - off: muted grey track + label in neutral ink. Quiet enough that
 *     it sits beside Share/Lang without competing for attention.
 *   - on: amber-filled track, thumb slides to the active side, label
 *     darkens. The track colour alone signals state — no extra dot,
 *     no icon-driven mood. Reads exactly like the iOS Settings toggle
 *     a parent already knows by muscle memory.
 */

import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useKidsMode } from "@/lib/use-kids-mode";

interface Props {
  plan: "basic" | "clear" | "deep";
  onBasicGate?: () => void;
}

export function KidsModeToggle({ plan, onBasicGate }: Props) {
  const { lang } = useLang();
  const [on, setOn] = useKidsMode();

  const isPaid = plan === "clear" || plan === "deep";

  const handleClick = () => {
    if (!isPaid) {
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
      role="switch"
      className={`wb-kids-toggle${on ? " is-on" : ""}`}
    >
      <span className="wb-kids-toggle-label">
        {v2(lang, "kidsModeLabel")}
      </span>
      <span className="wb-kids-toggle-track" aria-hidden="true">
        <span className="wb-kids-toggle-thumb" />
      </span>
    </button>
  );
}
