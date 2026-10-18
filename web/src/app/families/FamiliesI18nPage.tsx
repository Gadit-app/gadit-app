"use client";

import FamiliesLandingClient from "./FamiliesLandingClient";
import { FAM_LOADERS } from "./i18n";
import type { FamI18n } from "./i18n/types";
import { useLandingCopy } from "@/lib/landing-i18n-client";
import { useLang } from "@/lib/lang-context";

/** Hebrew: the Hebrew page as it is. Every other language: the same page from its copy file (2026-10-17). */
export function FamiliesI18nPage({ initial, withNav = false }: { initial: { lang: string; copy: FamI18n }; withNav?: boolean }) {
  const { lang: ui } = useLang();
  const { lang, copy } = useLandingCopy(FAM_LOADERS, initial);
  // The copy of another language than the UI's (still loading): the English file covers it.
  return ui === "he" ? <FamiliesLandingClient withNav={withNav} /> : <FamiliesLandingClient key={lang} i18n={copy} withNav={withNav} />;
}
