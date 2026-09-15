"use client";

/**
 * walkthroughs-family — step builders for the "Family & install" guides:
 * install to home screen, pair a child's device, the parent dashboard.
 */

import type { Lang } from "@/lib/i18n";
import { gt, gtf } from "@/lib/guide-i18n";
import type { WalkStep } from "@/components/Walkthrough";
import {
  Screen, TopBar, Sheet, Eyebrow, Row, PrimaryBtn, GhostBtn, KidStat, QrBlock, WT,
} from "@/components/walkthrough-ui";

export function installSteps(lang: Lang): WalkStep[] {
  const browserBar = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${WT.line}`, borderRadius: 999, padding: "8px 14px", fontSize: 13, color: WT.muted }}>
      <span>🔒</span><span style={{ direction: "ltr" }}>gadit.app</span>
      <span style={{ marginInlineStart: "auto" }}>⬆️</span>
    </div>
  );
  return [
    {
      caption: gt(lang, "install.s1"),
      tap: { x: "88%", y: "9%" },
      screen: (
        <Screen>
          {browserBar}
          <Sheet style={{ flex: 1, display: "grid", placeItems: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: WT.ink }}>Gad<span style={{ color: WT.teal }}>it</span></div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "install.s2"),
      tap: { x: "50%", y: "58%" },
      screen: (
        <Screen bg="#E9ECEF">
          <div style={{ marginTop: "auto" }} />
          <Sheet style={{ padding: 8 }}>
            <Row icon="📤" label={gt(lang, "ui.share")} iconBg="#EAF2FF" />
            <div style={{ height: 8 }} />
            <div style={{ border: `2px solid ${WT.teal}`, borderRadius: 14 }}>
              <Row icon="➕" label={gt(lang, "ui.addHome")} iconBg="#EAF6F3" />
            </div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "install.s3"),
      screen: (
        <Screen bg="linear-gradient(160deg,#DCE7F0,#CBD9E6)">
          <div style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 74, height: 74, borderRadius: 18, background: WT.teal, display: "grid", placeItems: "center", color: "#fff", fontSize: 30, fontWeight: 800, boxShadow: "0 10px 24px rgba(14,165,165,0.4)" }}>G</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: WT.ink }}>Gadit</div>
          </div>
        </Screen>
      ),
    },
  ];
}

export function pairSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "pair.s1"),
      tap: { x: "82%", y: "36%" },
      screen: (
        <Screen>
          <TopBar />
          <Eyebrow>{gt(lang, "ui.family")}</Eyebrow>
          <Row icon="🧒" label={gt(lang, "demo.child1")} iconBg="#EAF6F3"
            trailing={<span style={{ fontSize: 12.5, fontWeight: 700, color: WT.teal, border: `1px solid ${WT.teal}`, borderRadius: 999, padding: "5px 11px" }}>{gt(lang, "ui.pairDevice")}</span>} />
          <Row icon="🧒" label={gt(lang, "demo.child2")} iconBg="#EAF6F3"
            trailing={<span style={{ fontSize: 12.5, fontWeight: 700, color: WT.muted, border: `1px solid ${WT.line}`, borderRadius: 999, padding: "5px 11px" }}>{gt(lang, "ui.pairDevice")}</span>} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "pair.s2"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.pairDevice")}</Eyebrow>
          <Sheet style={{ flex: 1, display: "grid", placeItems: "center" }}>
            <QrBlock code="048213" />
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "pair.s3"),
      tap: { x: "50%", y: "82%" },
      screen: (
        <Screen bg="rgba(11,18,32,0.35)">
          <div style={{ margin: "auto 4px", width: "100%" }}>
            <Sheet>
              <div style={{ fontSize: 17, fontWeight: 800, color: WT.ink, textAlign: "center", marginBottom: 12 }}>Gad<span style={{ color: WT.teal }}>it</span></div>
              <div style={{ background: WT.paper, borderRadius: 10, padding: "10px 12px", fontSize: 13, color: WT.muted, marginBottom: 8 }}>{gt(lang, "ui.signIn")}…</div>
              <div style={{ textAlign: "center", fontSize: 13.5, fontWeight: 600, color: WT.tealDeep }}>{gt(lang, "ui.joinCode")}</div>
            </Sheet>
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "pair.s4"),
      screen: (
        <Screen>
          <div style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" }}>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "0.2em", color: WT.ink, direction: "ltr" }}>048213</div>
            <div style={{ width: "80%" }}><PrimaryBtn full>✓</PrimaryBtn></div>
            <div style={{ fontSize: 14, color: WT.teal, fontWeight: 700 }}>{gt(lang, "demo.child1")} ✓</div>
          </div>
        </Screen>
      ),
    },
  ];
}

export function dashboardSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "dash.s1"),
      tap: { x: "50%", y: "88%" },
      screen: (
        <Screen>
          <TopBar />
          <Sheet style={{ flex: 1, display: "grid", placeItems: "center", color: WT.faint, fontSize: 13 }}>Gad<span style={{ color: WT.teal }}>it</span></Sheet>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GhostBtn>👨‍👩‍👧 {gt(lang, "ui.family")}</GhostBtn>
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "dash.s2"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.family")}</Eyebrow>
          <KidStat name={gt(lang, "demo.child1")} avatar="🧒" words="128" weekly={gtf(lang, "ui.weekly", { n: 12 })} />
          <KidStat name={gt(lang, "demo.child2")} avatar="👦" words="74" weekly={gtf(lang, "ui.weekly", { n: 8 })} />
        </Screen>
      ),
    },
  ];
}
