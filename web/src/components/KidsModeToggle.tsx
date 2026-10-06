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
 *   - Family, schools and the older Clear / Deep plans: tap flips the
 *     boolean. The Individual plan gets the gate too: Kids Mode is a
 *     Family tool (Gadi 2026-10-06), so the caller shows the Family offer.
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
import { useAuth } from "@/lib/auth-context";

interface Props {
  plan: "basic" | "clear" | "deep";
  onBasicGate?: () => void;
  /** Always allowed (a class code on the classroom computer). */
  allowed?: boolean;
}

export function KidsModeToggle({ plan, onBasicGate, allowed }: Props) {
  const { lang } = useLang();
  const [on, setOn] = useKidsMode();
  const { kidsAccess } = useAuth();

  const isPaid = allowed || ((plan === "clear" || plan === "deep") && kidsAccess);

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
    // role="switch" takes aria-checked (not aria-pressed), and the accessible
    // name comes from the visible "Kids" label so screen-reader and voice-control
    // users hear/say what they see; the longer explanation stays in `title`.
    // Lighthouse a11y fix, Gadi 2026-09-25.
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      aria-checked={on}
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
