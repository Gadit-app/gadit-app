import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { familyHasChild, sendActivation, activationLang } from "@/lib/activation";
import { isActivationKey, renderActivationMail, type ActivationKey, type ActivationTarget } from "@/lib/email-drip/activation-content";
import { getEffectiveContent, hasLang } from "@/lib/email-drip/email-templates-store";
import { sendDripEmail } from "@/lib/email-drip/send";
import { buildUnsubUrl } from "@/lib/email-drip/registry";
import type { EmailContent } from "@/lib/email-drip/render";

/**
 * Hand-picked activation emails (Gadi 2026-10-21, the subscriber-health plan).
 *   POST ?secret=…  { kind: "return" | "first-word" | "add-child", emails: [...], send?: true }
 * Since 2026-11-01 (Gadi: full control from the health table) also:
 *   { key: <ActivationKey>, ... }        one exact email from the editor
 *   { custom: { subject, body, cta }, ... } a message Gadi writes himself
 *   force: true                          send again even if sent before
 *   preview: true                        render the first person's email, send nothing
 * Without send: a dry run, who gets which email in which language and why
 * someone is skipped. With send: the real send. Every send is logged in
 * users.activationHistory ({ key, at }) and the one-per-key activationSent.
 * Action-triggered by Gadi, so it is not held for Shabbat.
 */

type Kind = "return" | "first-word" | "add-child";
type Custom = { subject?: string; body?: string; cta?: string };

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SECRET || req.nextUrl.searchParams.get("secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as
    | { kind?: Kind; key?: string; custom?: Custom; emails?: string[]; send?: boolean; force?: boolean; preview?: boolean }
    | null;
  const kind = body?.kind;
  const exactKey = body?.key && isActivationKey(body.key) ? (body.key as ActivationKey) : null;
  const custom = body?.custom && String(body.custom.subject ?? "").trim() && String(body.custom.body ?? "").trim() ? body.custom : null;
  if ((!kind || !["return", "first-word", "add-child"].includes(kind)) && !exactKey && !custom) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!Array.isArray(body?.emails)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const send = body.send === true && body.preview !== true;
  const force = body.force === true;
  const db = getAdminDb();
  const auth = getAdminAuth();
  const out: { email: string; key?: string; lang?: string; target?: ActivationTarget; status: string; reason?: string }[] = [];

  for (const raw of body.emails.slice(0, 100)) {
    const email = String(raw).trim().toLowerCase();
    let uid = "";
    let displayName = "";
    try { const u = await auth.getUserByEmail(email); uid = u.uid; displayName = u.displayName ?? ""; } catch { out.push({ email, status: "skipped", reason: "no_account" }); continue; }
    const d = (await db.collection("users").doc(uid).get()).data() ?? {};
    if (d.emailSuppressed === true) { out.push({ email, status: "skipped", reason: "suppressed" }); continue; }
    const family = d.familyId === uid;
    const hasChild = family ? await familyHasChild(db, uid) : false;
    const lang = activationLang(d);
    const nm = displayName.trim() || (typeof d.displayName === "string" ? d.displayName.trim() : "");
    const firstName = nm.split(/\s+/)[0] || null;

    // A message Gadi wrote: sent as written, the button to the search page.
    if (custom) {
      const urlKey: ActivationKey = family ? "act-return-family" : "act-return-indiv";
      const c: EmailContent = { subject: String(custom.subject).trim(), heading: "", body: String(custom.body).trim(), ctaText: String(custom.cta ?? "").trim() || (lang === "he" ? "לפתוח את Gadit" : "Open Gadit"), next: "", closing: "", helpText: "" };
      const target: ActivationTarget = family && !hasChild ? "add-child" : "search";
      // Laid out in the language it is written in (Hebrew text right to left),
      // the button in the person's own language.
      const writtenHe = /[֐-׿]/.test(c.body + c.subject);
      const renderLang = writtenHe ? "he" : lang === "he" ? "en" : lang;
      const mail = renderActivationMail(c, { lang: renderLang, linkLang: lang, key: urlKey, target, firstName, unsubscribeUrl: buildUnsubUrl(uid) });
      if (body.preview) return NextResponse.json({ ok: true, preview: { email, lang, ...mail } });
      if (!send) { out.push({ email, key: "custom", lang, target, status: "would_send" }); continue; }
      const r = await sendDripEmail({ to: email, subject: mail.subject, html: mail.html, scheduled: false });
      if (r.ok) await logSend(uid, "custom");
      out.push({ email, key: "custom", lang, target, status: r.ok ? "sent" : "failed", ...(r.ok ? {} : { reason: r.reason }) });
      continue;
    }

    let key: ActivationKey;
    let target: ActivationTarget = "search";
    if (exactKey) {
      key = exactKey;
      if (key === "act-add-child" && !family) { out.push({ email, key, status: "skipped", reason: "not_family" }); continue; }
      if (key === "act-add-child" || (key === "act-return-family" && family && !hasChild)) target = "add-child";
    } else if (kind === "return") {
      key = family ? "act-return-family" : "act-return-indiv";
      if (family && !hasChild) target = "add-child";
    } else if (kind === "first-word") {
      key = family ? "act-first-word-family" : "act-first-word-indiv";
    } else {
      if (!family) { out.push({ email, status: "skipped", reason: "not_family" }); continue; }
      if (hasChild) { out.push({ email, status: "skipped", reason: "has_child" }); continue; }
      key = "act-add-child";
      target = "add-child";
    }
    if (body.preview) {
      const contentLang = lang === "he" || lang === "en" || (await hasLang(key, lang)) ? lang : "en";
      const c = await getEffectiveContent(key, contentLang);
      const mail = renderActivationMail(c, { lang: contentLang, linkLang: lang, key, target, firstName, unsubscribeUrl: buildUnsubUrl(uid) });
      return NextResponse.json({ ok: true, preview: { email, lang: contentLang, ...mail } });
    }
    const sent = (d.activationSent as Record<string, unknown> | undefined) ?? {};
    if (sent[key] && !force) { out.push({ email, key, lang, target, status: "skipped", reason: "already_sent" }); continue; }
    if (!send) { out.push({ email, key, lang, target, status: "would_send" }); continue; }
    const r = await sendActivation(db, { uid, email, d, key, target, firstName, scheduled: false });
    if (r.ok) await logSend(uid, key);
    out.push({ email, key, lang, target, status: r.ok ? "sent" : "failed", ...(r.ok ? {} : { reason: r.reason }) });
  }
  return NextResponse.json({ ok: true, send, results: out });

  async function logSend(uid: string, key: string) {
    await db.collection("users").doc(uid).set(
      { activationHistory: FieldValue.arrayUnion({ key, at: new Date().toISOString() }), activationLastAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  }
}
