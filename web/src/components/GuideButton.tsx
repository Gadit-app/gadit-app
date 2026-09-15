"use client";

/**
 * GuideButton — a small "?" placed next to an action anywhere in the app. Tapping
 * it opens the relevant walkthrough right there, so the explanation sits where
 * the user is stuck instead of in a separate library. Pass the guide id.
 */

import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { gt } from "@/lib/guide-i18n";
import { getGuide } from "@/lib/guides";
import { WalkthroughModal } from "@/components/Walkthrough";

export function GuideButton({ guide, size = 20, title }: { guide: string; size?: number; title?: string }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const g = getGuide(guide);
  if (!g) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        aria-label={title || gt(lang, g.titleKey)}
        title={title || gt(lang, g.titleKey)}
        style={{
          width: size, height: size, flex: "none", borderRadius: "50%",
          border: "1px solid var(--hairline,#E5E7EB)", background: "var(--surface,#fff)",
          color: "var(--teal-deep,#0A7472)", fontSize: Math.round(size * 0.62), fontWeight: 800,
          cursor: "pointer", display: "grid", placeItems: "center", lineHeight: 1, padding: 0,
        }}
      >
        ?
      </button>
      {open && (
        <WalkthroughModal
          guideId={g.id}
          title={gt(lang, g.titleKey)}
          steps={g.steps(lang)}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
