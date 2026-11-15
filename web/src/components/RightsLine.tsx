"use client";

/** "© 2026 Gadit. All rights reserved to Gadit" in the page's language (Gadi 2026-11-15). */
import { useLang } from "@/lib/lang-context";
import BRAND from "@/lib/brand-i18n.json";

export function RightsLine() {
  const { lang } = useLang();
  const t = (BRAND as Record<string, { rights: string }>)[lang] ?? BRAND.en;
  return <span>© 2026 · {t.rights}</span>;
}
