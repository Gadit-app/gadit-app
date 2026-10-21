import type { Firestore, DocumentData } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { getEffectiveContent, hasLang } from "@/lib/email-drip/email-templates-store";
import { renderActivationMail, type ActivationKey, type ActivationTarget } from "@/lib/email-drip/activation-content";
import { sendDripEmail } from "@/lib/email-drip/send";
import { buildUnsubUrl } from "@/lib/email-drip/registry";

/**
 * Activation nudges (Gadi 2026-10-21): get a new subscriber to their first
 * word and a Family to its first child. Ledger: users/{uid}.activationSent
 * { [key]: ISO time }, so each email goes once per person. Switch:
 * emailConfig/activation.enabled (draft and off until Gadi approves the text).
 */

export const ACTIVATION_CONFIG_DOC = "emailConfig/activation";
const H = 3600_000;

export async function activationEnabled(db: Firestore): Promise<boolean> {
  try {
    const s = await db.doc(ACTIVATION_CONFIG_DOC).get();
    return s.exists && s.data()?.enabled === true;
  } catch {
    return false;
  }
}

const tsMs = (v: unknown): number => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  const t = v as { toMillis?: () => number };
  return t.toMillis ? t.toMillis() : 0;
};

/** When the paid plan (or its trial) started: card entered, else trial end - 14 days. */
export function planStartMs(d: DocumentData): number {
  const paid = tsMs(d.notifiedPaidAt) || tsMs(d.familyActivatedAt);
  if (paid) return paid;
  if (typeof d.trialEnd === "number") return d.trialEnd * 1000 - 14 * 24 * H;
  return 0;
}

/** Has anyone in the account (owner + family kid accounts) looked up a word or saved one? */
export async function accountHasUsed(db: Firestore, uid: string, d: DocumentData): Promise<boolean> {
  if ((d.searchCount ?? 0) > 0) return true;
  const ids = [uid];
  if (d.familyId === uid) {
    const mem = await db.collection("users").where("familyId", "==", uid).get();
    for (const m of mem.docs) { if ((m.data().searchCount ?? 0) > 0) return true; ids.push(m.id); }
  }
  for (const id of ids) {
    const nb = await db.collection("users").doc(id).collection("notebook").limit(1).get();
    if (!nb.empty) return true;
  }
  return false;
}

export async function familyHasChild(db: Firestore, uid: string): Promise<boolean> {
  const m = await db.collection("families").doc(uid).collection("members").get();
  return m.docs.some((x) => { const r = x.data().role; return r === "boy" || r === "girl"; });
}

/** The automatic email due today for this person, if any (cheap checks first). */
export async function activationDue(db: Firestore, uid: string, d: DocumentData, now: number): Promise<{ key: ActivationKey; target: ActivationTarget } | null> {
  const status = d.subscriptionStatus;
  if (status !== "trialing" && status !== "active") return null;
  if (d.schoolId) return null;
  if (d.familyId && d.familyId !== uid) return null; // a family member, not the payer
  const start = planStartMs(d);
  if (!start) return null;
  const age = now - start;
  const sent = (d.activationSent as Record<string, unknown> | undefined) ?? {};
  const family = d.familyId === uid;
  // Only inside the first 10 days: a late-arriving person never gets an old nudge.
  if (age < 20 * H || age > 10 * 24 * H) return null;
  const used = await accountHasUsed(db, uid, d);
  if (!used && status === "trialing") {
    const k1: ActivationKey = family ? "act-first-word-family" : "act-first-word-indiv";
    if (!sent[k1] && age <= 48 * H) return { key: k1, target: "search" };
    if (!sent["act-first-word-2"] && age >= 68 * H && age <= 120 * H) return { key: "act-first-word-2", target: "search" };
  }
  if (family && age >= 48 * H && !sent["act-add-child"] && !(await familyHasChild(db, uid))) {
    return { key: "act-add-child", target: "add-child" };
  }
  return null;
}

export function activationLang(d: DocumentData): string {
  if (typeof d.uiLang === "string" && d.uiLang) return d.uiLang;
  return d.dripLang === "he" || d.country === "IL" ? "he" : "en";
}

/** Render with the effective (editor-saved) content and send; marks the ledger. */
export async function sendActivation(
  db: Firestore,
  p: { uid: string; email: string; d: DocumentData; key: ActivationKey; target: ActivationTarget; firstName: string | null; scheduled: boolean },
): Promise<{ ok: boolean; reason?: string }> {
  const lang = activationLang(p.d);
  // An untranslated language gets the English email: render it in the
  // language it is written in, link in the person's own.
  const contentLang = lang === "he" || lang === "en" || (await hasLang(p.key, lang)) ? lang : "en";
  const c = await getEffectiveContent(p.key, contentLang);
  const { subject, html } = renderActivationMail(c, {
    lang: contentLang, linkLang: lang, key: p.key, target: p.target, firstName: p.firstName, unsubscribeUrl: buildUnsubUrl(p.uid),
  });
  const r = await sendDripEmail({ to: p.email, subject, html, scheduled: p.scheduled });
  if (r.ok) {
    await db.collection("users").doc(p.uid).set({ activationSent: { [p.key]: new Date().toISOString() }, activationLastAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  return r.ok ? { ok: true } : { ok: false, reason: r.reason };
}
