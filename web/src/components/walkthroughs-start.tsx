"use client";

/**
 * walkthroughs-start — step builders for the "Getting started" guides:
 * search a word, save a word, turn on Kids Mode. Each returns WalkStep[] for a
 * language, recreating real Gadit screens with the shared walkthrough-ui pieces.
 */

import type { Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-i18n";
import type { WalkStep } from "@/components/Walkthrough";
import {
  Screen, TopBar, IconDot, SearchField, WordCard, Sheet, Eyebrow, Chip, Toggle, BottomNav, WT,
} from "@/components/walkthrough-ui";

export function navItems(lang: Lang) {
  return [
    { icon: "📓", label: gt(lang, "ui.nav.notebook") },
    { icon: "🔊", label: gt(lang, "ui.nav.say") },
    { icon: "📖", label: gt(lang, "ui.nav.reader") },
    { icon: "🎮", label: gt(lang, "ui.nav.games") },
  ];
}

export function searchSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "search.s1"),
      tap: { x: "50%", y: "20%" },
      screen: (
        <Screen>
          <TopBar right={<><IconDot>👤</IconDot></>} />
          <SearchField placeholder={gt(lang, "ui.searchPlaceholder")} focused />
          <BottomNav items={navItems(lang)} active={-1} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "search.s2"),
      screen: (
        <Screen>
          <TopBar right={<><IconDot>👤</IconDot></>} />
          <SearchField text={gt(lang, "demo.word")} />
          <WordCard word={gt(lang, "demo.word")} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} example={gt(lang, "demo.example")} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "search.s3"),
      screen: (
        <Screen>
          <WordCard word={gt(lang, "demo.word")} meaning={gt(lang, "demo.meaning")} showImage />
          <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
            <Chip>🔊 {gt(lang, "ui.nav.say")}</Chip>
            <Chip>{gt(lang, "ui.save")}</Chip>
          </div>
        </Screen>
      ),
    },
  ];
}

export function saveSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "save.s1"),
      tap: { x: "50%", y: "62%" },
      screen: (
        <Screen>
          <WordCard word={gt(lang, "demo.word")} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} example={gt(lang, "demo.example")} />
          <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
            <Chip active>{gt(lang, "ui.save")}</Chip>
            <Chip>🔊 {gt(lang, "ui.nav.say")}</Chip>
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "save.s2"),
      screen: (
        <Screen>
          <TopBar />
          <Eyebrow>{gt(lang, "ui.nav.notebook")}</Eyebrow>
          <Sheet style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: WT.ink }}>{gt(lang, "demo.word")}</span>
            <span style={{ fontSize: 12, color: WT.teal, fontWeight: 700 }}>✓ {gt(lang, "ui.saved")}</span>
          </Sheet>
          <BottomNav items={navItems(lang)} active={0} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "save.s3"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.nav.notebook")}</Eyebrow>
          {[gt(lang, "demo.word"), gt(lang, "demo.word2"), gt(lang, "demo.word3")].map((w) => (
            <Sheet key={w} style={{ padding: "12px 14px" }}>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: WT.ink }}>{w}</span>
            </Sheet>
          ))}
          <BottomNav items={navItems(lang)} active={0} />
        </Screen>
      ),
    },
  ];
}

export function kidsSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "kids.s1"),
      tap: { x: "82%", y: "22%" },
      screen: (
        <Screen>
          <TopBar />
          <Toggle on={false} label={gt(lang, "ui.kidsMode")} />
          <WordCard word={gt(lang, "demo.word")} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "kids.s2"),
      screen: (
        <Screen>
          <TopBar />
          <Toggle on label={gt(lang, "ui.kidsMode")} />
          <WordCard word={gt(lang, "demo.word")} meaning={gt(lang, "demo.kidsMeaning")} showImage />
        </Screen>
      ),
    },
  ];
}
