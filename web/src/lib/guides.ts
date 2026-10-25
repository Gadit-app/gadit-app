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
import {
  searchSteps, listenSteps, niqqudSteps, saveSteps, contextSteps, wordPageSteps, extrasSteps, kidsSteps,
} from "@/components/walkthroughs-start";
import {
  installSteps, addChildSteps, pairSteps, dashboardSteps, alertsSteps, homeworkSteps, ranksSteps,
} from "@/components/walkthroughs-family";
import { readerSteps, saySteps, practiceSteps, gamesSteps, duelSteps } from "@/components/walkthroughs-learn";
import { accountSteps, cancelSteps } from "@/components/walkthroughs-more";

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
  listen: { id: "listen", icon: "🔊", color: "#D98324", titleKey: "listen.title", descKey: "listen.desc", steps: listenSteps },
  niqqud: { id: "niqqud", icon: "🔡", color: "#0EA5A5", titleKey: "niqqud.title", descKey: "niqqud.desc", steps: niqqudSteps },
  save: { id: "save", icon: "📓", color: "#0EA5A5", titleKey: "save.title", descKey: "save.desc", steps: saveSteps },
  context: { id: "context", icon: "🎯", color: "#7C3AED", titleKey: "context.title", descKey: "context.desc", steps: contextSteps },
  wordpage: { id: "wordpage", icon: "✍️", color: "#0EA5A5", titleKey: "wordpage.title", descKey: "wordpage.desc", steps: wordPageSteps },
  extras: { id: "extras", icon: "💡", color: "#D98324", titleKey: "extras.title", descKey: "extras.desc", steps: extrasSteps },
  kids: { id: "kids", icon: "🧒", color: "#7C3AED", titleKey: "kids.title", descKey: "kids.desc", steps: kidsSteps },
  install: { id: "install", icon: "📲", color: "#155E75", titleKey: "install.title", descKey: "install.desc", steps: installSteps },
  addchild: { id: "addchild", icon: "👶", color: "#0EA5A5", titleKey: "addchild.title", descKey: "addchild.desc", steps: addChildSteps },
  pair: { id: "pair", icon: "🔗", color: "#0EA5A5", titleKey: "pair.title", descKey: "pair.desc", steps: pairSteps },
  dashboard: { id: "dashboard", icon: "📊", color: "#7C3AED", titleKey: "dash.title", descKey: "dash.desc", steps: dashboardSteps },
  alerts: { id: "alerts", icon: "🔔", color: "#D98324", titleKey: "alerts.title", descKey: "alerts.desc", steps: alertsSteps },
  homework: { id: "homework", icon: "🎒", color: "#D98324", titleKey: "homework.title", descKey: "homework.desc", steps: homeworkSteps },
  ranks: { id: "ranks", icon: "🏆", color: "#7C3AED", titleKey: "ranks.title", descKey: "ranks.desc", steps: ranksSteps },
  reader: { id: "reader", icon: "📖", color: "#0EA5A5", titleKey: "reader.title", descKey: "reader.desc", steps: readerSteps },
  say: { id: "say", icon: "🎤", color: "#D98324", titleKey: "say.title", descKey: "say.desc", steps: saySteps },
  practice: { id: "practice", icon: "📝", color: "#155E75", titleKey: "practice.title", descKey: "practice.desc", steps: practiceSteps },
  games: { id: "games", icon: "🎮", color: "#7C3AED", titleKey: "games.title", descKey: "games.desc", steps: gamesSteps },
  duel: { id: "duel", icon: "⚔️", color: "#D98324", titleKey: "duel.title", descKey: "duel.desc", steps: duelSteps },
  account: { id: "account", icon: "💳", color: "#155E75", titleKey: "account.title", descKey: "account.desc", steps: accountSteps },
  cancel: { id: "cancel", icon: "⏸️", color: "#155E75", titleKey: "cancel.title", descKey: "cancel.desc", steps: cancelSteps },
};

export type GuideSection = { titleKey: string; guideIds: string[] };

export const GUIDE_SECTIONS: GuideSection[] = [
  { titleKey: "sec.start", guideIds: ["search", "listen", "niqqud", "save", "context", "wordpage", "extras", "kids"] },
  { titleKey: "sec.family", guideIds: ["install", "addchild", "pair", "dashboard", "alerts", "homework", "ranks"] },
  { titleKey: "sec.learn", guideIds: ["reader", "say", "practice", "games", "duel"] },
  { titleKey: "sec.account", guideIds: ["account", "cancel"] },
];

export function getGuide(id: string | null | undefined): GuideDef | null {
  if (!id) return null;
  return GUIDES[id] ?? null;
}
