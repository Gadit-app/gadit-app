"use client";

/**
 * walkthroughs-more — step builders for the rest of the guides: listen, niqqud,
 * context mode, opposites & questions, add a child, word alerts, games,
 * characters & gift store, and account/plan management.
 */

import type { Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-i18n";
import type { WalkStep } from "@/components/Walkthrough";
import { navItems } from "@/components/walkthroughs-start";
import {
  Screen, TopBar, IconDot, Sheet, Eyebrow, Chip, Row, PrimaryBtn, GhostBtn, Toggle, WordCard, BottomNav, WT,
} from "@/components/walkthrough-ui";

// ── listen ──
export function listenSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "listen.s1"),
      tap: { x: "62%", y: "22%" },
      screen: (
        <Screen>
          <TopBar />
          <WordCard word={gt(lang, "demo.word")} pos={gt(lang, "demo.pos")} meaning={gt(lang, "demo.meaning")} example={gt(lang, "demo.example")} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "listen.s2"),
      screen: (
        <Screen>
          <TopBar />
          <Sheet style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: WT.ink }}>{gt(lang, "demo.word")}</div>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FBEFD9", display: "grid", placeItems: "center", fontSize: 28, boxShadow: "0 0 0 8px rgba(217,131,36,0.15)" }}>🔊</div>
            <div style={{ display: "flex", gap: 4 }}>{[10, 18, 26, 18, 10].map((h, k) => (<span key={k} style={{ width: 4, height: h, borderRadius: 2, background: WT.gold }} />))}</div>
          </Sheet>
        </Screen>
      ),
    },
  ];
}

// ── niqqud ──
export function niqqudSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "niqqud.s1"),
      tap: { x: "70%", y: "22%" },
      screen: (
        <Screen>
          <TopBar right={<span style={{ fontSize: 12, fontWeight: 700, color: WT.teal, border: `1px solid ${WT.teal}`, borderRadius: 999, padding: "5px 11px" }}>{gt(lang, "ui.niqqud")}</span>} />
          <WordCard word={gt(lang, "demo.word")} meaning={gt(lang, "demo.meaning")} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "niqqud.s2"),
      screen: (
        <Screen>
          <TopBar right={<span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: WT.teal, borderRadius: 999, padding: "5px 11px" }}>{gt(lang, "ui.niqqud")}</span>} />
          <Sheet style={{ display: "grid", placeItems: "center", padding: 26 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: WT.ink }}>{gt(lang, "demo.wordNiqqud")}</div>
          </Sheet>
        </Screen>
      ),
    },
  ];
}

// ── context mode ──
export function contextSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "context.s1"),
      tap: { x: "50%", y: "40%" },
      screen: (
        <Screen>
          <TopBar />
          <Eyebrow>{gt(lang, "ui.contextPaste")}</Eyebrow>
          <div style={{ background: WT.surface, border: `1.5px solid ${WT.teal}`, borderRadius: 14, padding: 14, fontSize: 15, color: WT.ink, lineHeight: 1.6, minHeight: 88 }}>
            {gt(lang, "demo.contextSentence")}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}><PrimaryBtn>{gt(lang, "demo.contextWord")}</PrimaryBtn></div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "context.s2"),
      screen: (
        <Screen>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: WT.ink }}>{gt(lang, "demo.contextWord")}</span>
            <span style={{ fontSize: 11, color: WT.purple, background: "#F1EBFD", borderRadius: 6, padding: "2px 8px" }}>{gt(lang, "ui.inContext")}</span>
          </div>
          <Sheet><span style={{ fontSize: 15, color: WT.ink, lineHeight: 1.5 }}>{gt(lang, "demo.contextMeaning")}</span></Sheet>
          <div style={{ fontSize: 13, color: WT.muted, lineHeight: 1.5 }}>{gt(lang, "demo.contextSentence")}</div>
        </Screen>
      ),
    },
  ];
}

// ── opposites & word questions ──
export function extrasSteps(lang: Lang): WalkStep[] {
  const chips = (opensFirst?: boolean) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Chip active={opensFirst}>{gt(lang, "ui.oppos")}</Chip>
      <Chip>{gt(lang, "ui.similar")}</Chip>
      <Chip>{gt(lang, "ui.mistakes")}</Chip>
      <Chip>{gt(lang, "ui.remember")}</Chip>
    </div>
  );
  return [
    {
      caption: gt(lang, "extras.s1"),
      tap: { x: "72%", y: "40%" },
      screen: (
        <Screen>
          <WordCard word={gt(lang, "demo.word")} meaning={gt(lang, "demo.meaning")} />
          <Eyebrow>{gt(lang, "demo.word")}</Eyebrow>
          {chips(false)}
        </Screen>
      ),
    },
    {
      caption: gt(lang, "extras.s2"),
      screen: (
        <Screen>
          {chips(true)}
          <Sheet style={{ marginTop: 6 }}>
            <div style={{ fontSize: 12.5, color: WT.muted, marginBottom: 4 }}>{gt(lang, "ui.oppos")}</div>
            <span style={{ fontSize: 17, fontWeight: 800, color: WT.ink }}>{gt(lang, "demo.oppositeWord")}</span>
          </Sheet>
        </Screen>
      ),
    },
  ];
}

// ── add a child ──
export function addChildSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "addchild.s1"),
      tap: { x: "50%", y: "78%" },
      screen: (
        <Screen>
          <TopBar />
          <Eyebrow>{gt(lang, "ui.family")}</Eyebrow>
          <Row icon="🧒" label={gt(lang, "demo.child1")} iconBg="#EAF6F3" />
          <div style={{ marginTop: 4 }}><PrimaryBtn full>＋ {gt(lang, "ui.addMember")}</PrimaryBtn></div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "addchild.s2"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.addMember")}</Eyebrow>
          <div style={{ background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 12, padding: "12px 14px", fontSize: 14, color: WT.muted }}>{gt(lang, "ui.name")}: {gt(lang, "demo.child2")}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip active>{gt(lang, "ui.roleKid")}</Chip>
            <Chip>{gt(lang, "ui.roleParent")}</Chip>
          </div>
          <div style={{ marginTop: 4 }}><PrimaryBtn full>{gt(lang, "ui.saveBtn")}</PrimaryBtn></div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "addchild.s3"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.family")}</Eyebrow>
          <Row icon="🧒" label={gt(lang, "demo.child1")} iconBg="#EAF6F3" />
          <div style={{ border: `2px solid ${WT.teal}`, borderRadius: 15 }}>
            <Row icon="👦" label={gt(lang, "demo.child2")} iconBg="#EAF6F3" trailing={<span style={{ color: WT.teal, fontWeight: 800 }}>✓</span>} />
          </div>
        </Screen>
      ),
    },
  ];
}

// ── word alerts ──
export function alertsSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "alerts.s1"),
      tap: { x: "50%", y: "34%" },
      screen: (
        <Screen>
          <TopBar />
          <Eyebrow>{gt(lang, "ui.family")}</Eyebrow>
          <Row icon="🔔" label={gt(lang, "ui.alertsLabel")} sub={gt(lang, "ui.settings")} iconBg="#FBEFD9" />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "alerts.s2"),
      tap: { x: "80%", y: "26%" },
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.alertsLabel")}</Eyebrow>
          <Toggle on label={gt(lang, "ui.alertsLabel")} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "alerts.s3"),
      screen: (
        <Screen>
          <div style={{ marginTop: 8, background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 14, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 6px 18px rgba(11,18,32,0.08)" }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: WT.teal, display: "grid", placeItems: "center", fontSize: 16, flex: "none" }}>G</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: WT.ink }}>Gadit</div>
              <div style={{ fontSize: 12.5, color: WT.muted }}>{gt(lang, "demo.alertText")}</div>
            </div>
          </div>
        </Screen>
      ),
    },
  ];
}

// ── games / quizzes ──
export function gamesSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "games.s1"),
      tap: { x: "82%", y: "92%" },
      screen: (
        <Screen>
          <TopBar right={<IconDot>👤</IconDot>} />
          <Sheet style={{ flex: 1, display: "grid", placeItems: "center", color: WT.faint, fontSize: 13 }}>Gad<span style={{ color: WT.teal }}>it</span></Sheet>
          <BottomNav items={navItems(lang)} active={3} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "games.s2"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.nav.games")}</Eyebrow>
          <Sheet>
            <div style={{ fontSize: 16, fontWeight: 700, color: WT.ink, marginBottom: 12 }}>{gt(lang, "demo.quizQ")}</div>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ border: `1px solid ${WT.line}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, color: WT.muted }}>{gt(lang, "demo.quizWrong")}</div>
              <div style={{ border: `2px solid ${WT.teal}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, color: WT.ink, fontWeight: 700 }}>{gt(lang, "demo.kidsMeaning")}</div>
            </div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "games.s3"),
      screen: (
        <Screen>
          <Sheet style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: WT.teal }}>{gt(lang, "ui.correct")}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: WT.gold }}>+10 {gt(lang, "ui.points")}</div>
          </Sheet>
        </Screen>
      ),
    },
  ];
}

// ── characters & gift store ──
export function rewardsSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "rewards.s1"),
      tap: { x: "36%", y: "48%" },
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.skins")}</Eyebrow>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["🦊", "🐼", "🦄", "🐯"].map((a, k) => (
              <div key={k} style={{ width: 58, height: 58, borderRadius: 16, background: WT.surface, border: `2px solid ${k === 0 ? WT.teal : WT.line}`, display: "grid", placeItems: "center", fontSize: 28 }}>{a}</div>
            ))}
          </div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "rewards.s2"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.giftStore")}</Eyebrow>
          <Sheet style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 26 }}>🎁</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: WT.ink }}>{gt(lang, "demo.giftName")}</div>
              <div style={{ fontSize: 13, color: WT.gold, fontWeight: 700 }}>50 {gt(lang, "ui.points")}</div>
            </div>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "rewards.s3"),
      tap: { x: "50%", y: "60%" },
      screen: (
        <Screen>
          <Sheet style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <span style={{ fontSize: 40 }}>🎁</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: WT.ink }}>{gt(lang, "demo.giftName")}</div>
            <PrimaryBtn color={WT.purple}>{gt(lang, "ui.redeem")}</PrimaryBtn>
          </Sheet>
        </Screen>
      ),
    },
  ];
}

// ── account / plan ──
export function accountSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "account.s1"),
      tap: { x: "50%", y: "60%" },
      screen: (
        <Screen>
          <TopBar right={<IconDot>👤</IconDot>} />
          <Eyebrow>{gt(lang, "ui.myAccount")}</Eyebrow>
          <Sheet style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: WT.ink }}>Basic</span>
            <GhostBtn>{gt(lang, "ui.plans")}</GhostBtn>
          </Sheet>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "account.s2"),
      tap: { x: "50%", y: "34%" },
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.plans")}</Eyebrow>
          <div style={{ border: `2px solid ${WT.teal}`, borderRadius: 12 }}>
            <Row icon="👨‍👩‍👧" label={gt(lang, "ui.planFamily")} iconBg="#EAF6F3" trailing={<span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", background: WT.teal, borderRadius: 999, padding: "5px 12px" }}>{gt(lang, "ui.upgrade")}</span>} />
          </div>
          <Row icon="🟣" label="Deep" iconBg="#F1EBFD" trailing={<span style={{ fontSize: 12.5, fontWeight: 700, color: WT.muted, border: `1px solid ${WT.line}`, borderRadius: 999, padding: "5px 12px" }}>{gt(lang, "ui.upgrade")}</span>} />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "account.s3"),
      screen: (
        <Screen>
          <Eyebrow>{gt(lang, "ui.card")}</Eyebrow>
          <div style={{ background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 12, padding: "13px 14px", fontSize: 15, color: WT.faint, letterSpacing: "0.12em" }}>•••• •••• •••• ____</div>
          <div style={{ marginTop: 4 }}><PrimaryBtn full>{gt(lang, "ui.planFamily")} · ₪19.90</PrimaryBtn></div>
        </Screen>
      ),
    },
  ];
}
