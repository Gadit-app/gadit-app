"use client";

/**
 * GuideOverlay — reads ?guide=<id> from the URL and opens that walkthrough over
 * whatever screen the user is on. So one link from an email lands the user on
 * the action WITH the explanation playing. Mounted once, globally, in layout.
 *
 * Reads location.search directly (not useSearchParams) to avoid a Suspense
 * boundary, and clears the param on close so navigating away doesn't reopen it.
 */

import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { gt } from "@/lib/guide-i18n";
import { getGuide } from "@/lib/guides";
import { WalkthroughModal } from "@/components/Walkthrough";

export function GuideOverlay() {
  const { lang } = useLang();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    function readFromUrl() {
      try {
        const params = new URLSearchParams(window.location.search);
        const g = params.get("guide");
        if (g && getGuide(g)) setId(g);
      } catch { /* ignore */ }
    }
    readFromUrl();
    // A same-tab in-app navigation that adds ?guide= (e.g. back/forward) should
    // also open it.
    window.addEventListener("popstate", readFromUrl);
    return () => window.removeEventListener("popstate", readFromUrl);
  }, []);

  const g = getGuide(id);
  if (!g) return null;

  function close() {
    setId(null);
    // Strip ?guide= from the URL so it doesn't reopen on the next navigation.
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("guide");
      window.history.replaceState({}, "", url.toString());
    } catch { /* ignore */ }
  }

  return (
    <WalkthroughModal
      guideId={g.id}
      title={gt(lang, g.titleKey)}
      steps={g.steps(lang)}
      onClose={close}
    />
  );
}
