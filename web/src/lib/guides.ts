/**
 * guides — the single source of truth for the in-app walkthroughs.
 *
 * GUIDES maps a stable id to its metadata + a step-builder. GUIDE_SECTIONS
 * groups them into the order a new user should meet them. Everything that
 * renders a guide (the /help index, the "?" GuideButton, the ?guide= overlay,
 * a /help#id deep link) reads from here, so adding a guide is one entry.
 *
 * Text lives in guide-i18n (titleKey/descKey resolve via gt()); an optional
 * `video` field can point at recorded footage where an animation isn't enough.
 */

import type { Lang } from "@/lib/i18n";
import type { WalkStep } from "@/components/Walkthrough";
import { searchSteps, saveSteps, kidsSteps } from "@/components/walkthroughs-start";
import { installSteps, pairSteps, dashboardSteps } from "@/components/walkthroughs-family";
import { readerSteps, saySteps } from "@/components/walkthroughs-learn";

export type GuideDef = {
  id: string;
  icon: string;
  color: string;
  titleKey: string;
  descKey: string;
  steps: (lang: Lang) => WalkStep[];
  /** Optional recorded video URL, for the rare case an animation can't show it. */
  video?: string;
};

export const GUIDES: Record<string, GuideDef> = {
  search: { id: "search", icon: "🔍", color: "#0EA5A5", titleKey: "search.title", descKey: "search.desc", steps: searchSteps },
  kids: { id: "kids", icon: "🧒", color: "#7C3AED", titleKey: "kids.title", descKey: "kids.desc", steps: kidsSteps },
  save: { id: "save", icon: "📓", color: "#0EA5A5", titleKey: "save.title", descKey: "save.desc", steps: saveSteps },
  install: { id: "install", icon: "📲", color: "#155E75", titleKey: "install.title", descKey: "install.desc", steps: installSteps },
  pair: { id: "pair", icon: "🔗", color: "#0EA5A5", titleKey: "pair.title", descKey: "pair.desc", steps: pairSteps },
  dashboard: { id: "dashboard", icon: "📊", color: "#7C3AED", titleKey: "dash.title", descKey: "dash.desc", steps: dashboardSteps },
  reader: { id: "reader", icon: "📖", color: "#0EA5A5", titleKey: "reader.title", descKey: "reader.desc", steps: readerSteps },
  say: { id: "say", icon: "🔊", color: "#D98324", titleKey: "say.title", descKey: "say.desc", steps: saySteps },
};

export type GuideSection = { titleKey: string; guideIds: string[] };

export const GUIDE_SECTIONS: GuideSection[] = [
  { titleKey: "sec.start", guideIds: ["search", "kids", "save"] },
  { titleKey: "sec.family", guideIds: ["install", "pair", "dashboard"] },
  { titleKey: "sec.learn", guideIds: ["reader", "say"] },
];

export function getGuide(id: string | null | undefined): GuideDef | null {
  if (!id) return null;
  return GUIDES[id] ?? null;
}
