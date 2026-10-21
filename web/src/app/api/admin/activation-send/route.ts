import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { familyHasChild, sendActivation, activationLang } from "@/lib/activation";
import type { ActivationKey, ActivationTarget } from "@/lib/email-drip/activation-content";

/**
 * Hand-picked activation emails (Gadi 2026-10-21, the subscriber-health plan).
 *   POST ?secret=…  { kind: "return" | "first-word" | "add-child", emails: [...], send?: true }
 * Without send: a dry run, who gets which email in which language and why
 * someone is skipped. With send: the real send (text from the email editor,
 * series "Activation"). Each email goes once per person (activationSent).
 * Action-triggered by Gadi, so it is not held for Shabbat.
 */

type Kind = "return" | "first-word" | "add-child";

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_SECRET || req.nextUrl.searchParams.get("secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { kind?: Kind; emails?: string[]; send?: boolean } | null;
  const kind = body?.kind;
  if (!kind || !["return", "first-word", "add-child"].includes(kind) || !Array.isArray(body?.emails)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const send = body.send === true;
  const db = getAdminDb();
  const auth = getAdminAuth();
  const out: { email: string; key?: ActivationKey; lang?: string; target?: ActivationTarget; status: string; reason?: string }[] = [];

  for (const raw of body.emails.slice(0, 100)) {
    const email = String(raw).trim().toLowerCase();
    let uid = "";
    let displayName = "";
    try { const u = await auth.getUserByEmail(email); uid = u.uid; displayName = u.displayName ?? ""; } catch { out.push({ email, status: "skipped", reason: "no_account" }); continue; }
    const d = (await db.collection("users").doc(uid).get()).data() ?? {};
    if (d.emailSuppressed === true) { out.push({ email, status: "skipped", reason: "suppressed" }); continue; }
    const family = d.familyId === uid;
    const hasChild = family ? await familyHasChild(db, uid) : false;
    let key: ActivationKey;
    let target: ActivationTarget = "search";
    if (kind === "return") {
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
    const sent = (d.activationSent as Record<string, unknown> | undefined) ?? {};
    const lang = activationLang(d);
    if (sent[key]) { out.push({ email, key, lang, target, status: "skipped", reason: "already_sent" }); continue; }
    if (!send) { out.push({ email, key, lang, target, status: "would_send" }); continue; }
    const nm = displayName.trim() || (typeof d.displayName === "string" ? d.displayName.trim() : "");
    const r = await sendActivation(db, { uid, email, d, key, target, firstName: nm.split(/\s+/)[0] || null, scheduled: false });
    out.push({ email, key, lang, target, status: r.ok ? "sent" : "failed", ...(r.ok ? {} : { reason: r.reason }) });
  }
  return NextResponse.json({ ok: true, send, results: out });
}
