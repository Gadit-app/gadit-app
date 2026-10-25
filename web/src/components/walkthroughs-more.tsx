"use client";

/**
 * walkthroughs-more — step builders for the account guides: upgrade and
 * manage a plan, and cancel / pause / stop renewal. Both recreate
 * account/AccountClient.tsx (the Plan card and the RetentionModal steps,
 * wording from lib/retention-i18n.json).
 */

import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { gt, gtf } from "@/lib/guide-i18n";
import type { WalkStep } from "@/components/Walkthrough";
import {
  Screen, AppBar, Sheet, PrimaryBtn, GhostBtn, WT,
} from "@/components/walkthrough-ui";

function PlanCard({ lang, plan, children }: { lang: Lang; plan: "basic" | "family"; children?: ReactNode }) {
  return (
    <Sheet style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, borderRadius: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: WT.muted }}>{gt(lang, "ui.planCard")}</div>
      <span style={{ alignSelf: "flex-start", fontSize: 15, fontWeight: 800, padding: "3px 10px", borderRadius: 8, color: plan === "family" ? "#1D4ED8" : "#6B7280", background: plan === "family" ? "#DBEAFE" : "#F3F4F6" }}>{plan === "family" ? "Family" : "Basic"}</span>
      <div style={{ fontSize: 12.5, color: WT.soft }}>{gt(lang, plan === "family" ? "ui.familyLine" : "ui.basicLine")}</div>
      {children}
    </Sheet>
  );
}

function AccountHead({ lang }: { lang: Lang }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: WT.teal }}>{gt(lang, "ui.myAccount")}</div>
      <div style={{ fontSize: 19, fontWeight: 800, color: WT.ink }}>{gtf(lang, "ui.yourSpace", { name: gt(lang, "demo.parent") })}</div>
    </div>
  );
}

/** The cancel pop-up (RetentionModal): title, body, optional content, then
 *  the red "cancel" button first and the teal "keep" button second. */
function Modal({ title, body, children, red, teal }: { title: string; body?: string; children?: ReactNode; red: string; teal: string }) {
  return (
    <Screen bg="rgba(11,18,32,0.4)">
      <div style={{ margin: "auto 0", background: WT.surface, borderRadius: 18, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: WT.ink, lineHeight: 1.3 }}>{title}</div>
        {body && <div style={{ fontSize: 12.5, color: WT.soft, lineHeight: 1.5 }}>{body}</div>}
        {children}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 4 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#B91C1C", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 11, padding: "9px 12px" }}>{red}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", background: WT.teal, borderRadius: 11, padding: "9px 12px" }}>{teal}</span>
        </div>
      </div>
    </Screen>
  );
}

// ── account / plan ──
export function accountSteps(lang: Lang): WalkStep[] {
  return [
    {
      caption: gt(lang, "account.s1"),
      tap: { x: lang === "he" ? "21%" : "79%", y: "5.5%" },
      screen: (
        <Screen>
          <AppBar help highlight="avatar" />
          <AccountHead lang={lang} />
          <PlanCard lang={lang} plan="basic" />
        </Screen>
      ),
    },
    {
      caption: gt(lang, "account.s2"),
      tap: { x: "50%", y: "36%" },
      screen: (
        <Screen>
          <AccountHead lang={lang} />
          <PlanCard lang={lang} plan="basic">
            <PrimaryBtn full>{gt(lang, "ui.upFamily")}</PrimaryBtn>
            <div style={{ textAlign: "center", border: `1.5px solid ${WT.teal}`, color: WT.tealDeep, borderRadius: 12, padding: "11px 14px", fontSize: 14.5, fontWeight: 700 }}>{gt(lang, "ui.upIndividual")}</div>
          </PlanCard>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "account.s3"),
      screen: (
        <Screen>
          <div style={{ fontSize: 17, fontWeight: 800, color: WT.ink }}>Family</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: WT.soft }}>{gt(lang, "ui.card")}</div>
          <div style={{ background: WT.surface, border: `1.5px solid ${WT.teal}`, borderRadius: 12, padding: "13px 14px", fontSize: 15, color: WT.faint, letterSpacing: "0.12em", direction: "ltr" }}>•••• •••• •••• ____</div>
        </Screen>
      ),
    },
    {
      caption: gt(lang, "account.s4"),
      screen: (
        <Screen>
          <AccountHead lang={lang} />
          <PlanCard lang={lang} plan="family">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <PrimaryBtn>{gt(lang, "ui.manageBilling")}</PrimaryBtn>
              <GhostBtn>{gt(lang, "ui.changePlan")}</GhostBtn>
            </div>
          </PlanCard>
        </Screen>
      ),
    },
  ];
}

// ── cancel, pause or stop renewal ──
export function cancelSteps(lang: Lang): WalkStep[] {
  const reasons = ["ui.rsAuto", "ui.rsUse", "ui.rsPrice", "ui.rsKids"];
  return [
    {
      caption: gt(lang, "cancel.s1"),
      tap: { x: lang === "he" ? "70%" : "30%", y: "50%" },
      screen: (
        <Modal title={gt(lang, "ui.cxTitle")} body={gt(lang, "ui.cxBody")} red={gt(lang, "ui.continue")} teal={gt(lang, "ui.cxKeep")}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: WT.ink }}>{gt(lang, "ui.cxWhy")}</div>
          {reasons.map((k, i) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: WT.ink }}>
              <span style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${i === 1 ? WT.teal : WT.faint}`, display: "grid", placeItems: "center", flex: "none" }}>{i === 1 && <span style={{ width: 7, height: 7, borderRadius: "50%", background: WT.teal }} />}</span>
              {gt(lang, k)}
            </div>
          ))}
          <div style={{ fontSize: 12, color: WT.faint }}>…</div>
        </Modal>
      ),
    },
    {
      caption: gt(lang, "cancel.s2"),
      tap: { x: lang === "he" ? "29%" : "70%", y: lang === "he" ? "57%" : "63%" },
      screen: <Modal title={gt(lang, "ui.pauseTitle")} body={gt(lang, "ui.pauseBody")} red={gt(lang, "ui.cxAnyway")} teal={gt(lang, "ui.pauseBtn")} />,
    },
    {
      caption: gt(lang, "cancel.s3"),
      screen: <Modal title={gt(lang, "ui.renewTitle")} body={gt(lang, "ui.renewBody")} red={gt(lang, "ui.cxAnyway")} teal={gt(lang, "ui.renewBtn")} />,
    },
    {
      caption: gt(lang, "cancel.s4"),
      tap: { x: "50%", y: "39%" },
      screen: (
        <Screen>
          <AccountHead lang={lang} />
          <PlanCard lang={lang} plan="family">
            <div style={{ fontSize: 12, color: "#B45309" }}>{gt(lang, "ui.cancelsAtEnd")}</div>
            <div style={{ textAlign: "center", border: `1.5px solid ${WT.teal}`, color: WT.tealDeep, borderRadius: 12, padding: "10px 12px", fontSize: 13, fontWeight: 700 }}>{gt(lang, "ui.mistake")}</div>
          </PlanCard>
        </Screen>
      ),
    },
  ];
}
