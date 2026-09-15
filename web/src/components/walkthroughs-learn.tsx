"use client";

/**
 * walkthroughs-learn — step builders for the "Learning tools" guides:
 * the Reader ("Every word") and pronunciation practice ("Say it").
 */

import type { Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-i18n";
import type { WalkStep } from "@/components/Walkthrough";
import {
  Screen, TopBar, Sheet, Eyebrow, Chip, PrimaryBtn, WT,
} from "@/components/walkthrough-ui";

export function readerSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "reader.s1"),
      tap: { x: "32%", y: "52%" },
      screen: (
        <Screen>
          <TopBar />
          <Eyebrow>{gt(lang, "ui.nav.reader")}</Eyebrow>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
            <PrimaryBtn full>📷 {gt(lang, "ui.photo")}</PrimaryBtn>
            <div style={{ display: "block", textAlign: "center", background: WT.surface, color: WT.ink, fontSize: 15, fontWeight: 600, padding: "12px 20px", borderRadius: 12, border: `1px solid ${WT.line}` }}>📋 {gt(lang, "ui.paste")}</div>
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "reader.s2"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.keyWords")}</Eyebrow>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Chip active>{gt(lang, "demo.kw1")}</Chip>
            <Chip active>{gt(lang, "demo.kw2")}</Chip>
            <Chip active>{gt(lang, "demo.kw3")}</Chip>
          </div>
          <Sheet style={{ marginTop: 4, fontSize: 15, lineHeight: 1.7, color: WT.ink }}>
            {gt(lang, "demo.passage")}
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "reader.s3"),
      tap: { x: "44%", y: "34%" },
      screen: (
        <Screen>
          <Sheet style={{ fontSize: 15, lineHeight: 1.8, color: WT.ink }}>
            {gt(lang, "demo.passage")}
          </Sheet>
          <Sheet style={{ marginTop: 6, borderColor: WT.teal }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: WT.ink, marginBottom: 4 }}>{gt(lang, "demo.kw2")}</div>
            <div style={{ fontSize: 13.5, color: WT.muted, lineHeight: 1.5 }}>{gt(lang, "demo.meaning")}</div>
          </Sheet>
        </Screen>
      ),
    },
  ];
}

export function saySteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "say.s1"),
      tap: { x: "50%", y: "40%" },
      screen: (
        <Screen>
          <TopBar />
          <Eyebrow>{gt(lang, "ui.nav.say")}</Eyebrow>
          <Sheet style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: WT.ink }}>{gt(lang, "demo.word")}</div>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#EAF6F3", display: "grid", placeItems: "center", fontSize: 26 }}>🔊</div>
            <div style={{ fontSize: 13, color: WT.muted }}>{gt(lang, "ui.listen")}</div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "say.s2"),
      tap: { x: "50%", y: "62%" },
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.nav.say")}</Eyebrow>
          <Sheet style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: WT.ink }}>{gt(lang, "demo.word")}</div>
            <div style={{ width: 66, height: 66, borderRadius: "50%", background: WT.teal, display: "grid", placeItems: "center", fontSize: 28, color: "#fff", boxShadow: "0 0 0 8px rgba(14,165,165,0.18)" }}>🎤</div>
            <div style={{ fontSize: 13, color: WT.muted }}>{gt(lang, "ui.record")}</div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "say.s3"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.nav.say")}</Eyebrow>
          <Sheet style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: WT.ink }}>{gt(lang, "demo.word")}</div>
            <div style={{ fontSize: 44 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: WT.teal }}>{gt(lang, "demo.feedback")}</div>
          </Sheet>
        </Screen>
      ),
    },
  ];
}
