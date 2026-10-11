"use client";

/**
 * Kids Mode under every tool's title (Gadi 2026-10-11/12: it switches the
 * whole app to kid language and kid games, so it belongs to every section;
 * keep the mascot he liked from the games banner, in a small strip that
 * says whether it is on or off). Family members only, like before.
 */
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useKidsMode } from "@/lib/use-kids-mode";
import { KIDS_BANNER_COPY } from "@/lib/kids-banner-copy";

export function ToolKidsToggle() {
  const { user, plan, kidsAccess } = useAuth();
  const { lang, dir } = useLang();
  const [on, setOn] = useKidsMode();
  if (!user || !kidsAccess || (plan !== "clear" && plan !== "deep")) return null;
  const c = KIDS_BANNER_COPY[lang] ?? KIDS_BANNER_COPY.en;
  const label = (on ? c.onTitle : c.offTitle).replace(/^✓\s*/, "");
  return (
    <div className="wb-tool-kids">
      <button type="button" role="switch" aria-checked={on} className={`wb-kids-strip${on ? " is-on" : ""}`} onClick={() => setOn(!on)} dir={dir}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={on ? "/play/kids-mascot.webp" : "/play/kids-mascot-sleep.webp"} alt="" width={36} height={36} />
        <span className="wb-kids-strip-label">{label}</span>
        <span className="wb-kids-strip-track" aria-hidden="true"><span /></span>
      </button>
    </div>
  );
}
