import { NextRequest, NextResponse } from "next/server";
import { FAMILY_META, EMAIL_BASE } from "@/lib/email-drip/family-content";
import { renderEmailHtml, mdLiteToHtml, type EmailContent } from "@/lib/email-drip/render";
import { getOverride, getEffectiveContent, saveOverride, resetOverride } from "@/lib/email-drip/email-templates-store";
import { getDripForLang, buildUnsubUrl } from "@/lib/email-drip/registry";
import { sendDripEmail } from "@/lib/email-drip/send";

export const runtime = "nodejs";

/**
 * The signup drip (registry: welcome/meanings/etymology/visual/summary) is
 * code-rendered per language, not markdown-lite. We expose it here READ-ONLY
 * so Gadi can review and test-send it from the same editor. Editing this
 * series still happens in code. Keys are addressed as "signup:<step>".
 */
const SIGNUP_STEPS: { step: string; dayOffset: number; label: string }[] = [
  { step: "welcome", dayOffset: 0, label: "Signup · 1 · Welcome" },
  { step: "meanings", dayOffset: 2, label: "Signup · 2 · Meanings" },
  { step: "etymology", dayOffset: 5, label: "Signup · 3 · Etymology" },
  { step: "visual", dayOffset: 9, label: "Signup · 4 · Visual" },
  { step: "summary", dayOffset: 14, label: "Signup · 5 · Summary" },
];

function renderSignup(step: string, he: boolean): { subject: string; html: string } | null {
  const series = getDripForLang(he ? "he" : "en");
  const mail = series.find((m) => m.key.startsWith(`${step}-`)) ?? series.find((m) => m.key.startsWith(step));
  if (!mail) return null;
  const built = mail.build({ unsubscribeUrl: buildUnsubUrl("preview") });
  return { subject: built.subject, html: built.html };
}

/**
 * Admin email editor backend. Lets Gadi / Sharon edit the Family series
 * copy per language without touching code. Content is markdown-lite
 * (render.ts); overrides live in Firestore (emailTemplates/{key}).
 *
 * GET  ?secret=            → list of editable emails
 * GET  ?secret=&key=X      → he+en effective content + override flags
 * POST ?secret= {action:"save",   key, lang, content}
 * POST ?secret= {action:"reset",  key, lang}
 * POST ?secret= {action:"preview", key, lang, content} → { html }
 */

function authed(req: NextRequest): boolean {
  const s = req.nextUrl.searchParams.get("secret") ?? "";
  return !!process.env.ADMIN_SECRET && s === process.env.ADMIN_SECRET;
}

function renderPreview(key: string, he: boolean, c: EmailContent): string {
  const m = FAMILY_META.find((x) => x.key === key);
  const tab = m?.ctaUrlTab ?? "";
  const base = he ? `${EMAIL_BASE}/he` : EMAIL_BASE;
  return renderEmailHtml({
    he,
    eyebrow: he ? m?.eyebrow.he ?? "" : m?.eyebrow.en ?? "",
    heading: c.heading,
    bodyHtml: mdLiteToHtml(he, c.body),
    ctaText: c.ctaText,
    ctaUrl: `${base}${m?.ctaPath ?? "/family"}${tab}`,
    foot: he ? m?.foot.he ?? "" : m?.foot.en ?? "",
    unsubscribeUrl: `${EMAIL_BASE}/`,
  });
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const key = req.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json({
      emails: FAMILY_META.map((m) => ({ key: m.key, label: m.label, dayOffset: m.dayOffset })),
      signup: SIGNUP_STEPS.map((s) => ({ key: `signup:${s.step}`, label: s.label, dayOffset: s.dayOffset })),
    });
  }

  // Signup series: read-only rendered content for review + test-send.
  if (key.startsWith("signup:")) {
    const he = (req.nextUrl.searchParams.get("lang") ?? "he") === "he";
    const r = renderSignup(key.slice("signup:".length), he);
    if (!r) return NextResponse.json({ error: "unknown key" }, { status: 404 });
    return NextResponse.json({ key, readonly: true, subject: r.subject, html: r.html });
  }

  if (!FAMILY_META.find((m) => m.key === key)) {
    return NextResponse.json({ error: "unknown key" }, { status: 404 });
  }
  const ov = await getOverride(key);
  const he = await getEffectiveContent(key, true);
  const en = await getEffectiveContent(key, false);
  return NextResponse.json({
    key,
    he: { content: he, overridden: !!ov?.he },
    en: { content: en, overridden: !!ov?.en },
  });
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as
    | { action?: string; key?: string; lang?: string; content?: EmailContent; to?: string }
    | null;
  const isSignup = !!body?.key?.startsWith("signup:");
  const known = !!body?.key && (isSignup ? !!renderSignup(body.key.slice(7), true) : !!FAMILY_META.find((m) => m.key === body!.key));
  if (!body?.action || !body.key || !known) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const lang = body.lang === "he" ? "he" : "en";
  const he = lang === "he";

  // Render this email exactly as it would send: signup = code-rendered,
  // family = markdown-lite from the editor's live content.
  function renderNow(): { subject: string; html: string } | null {
    if (isSignup) return renderSignup(body!.key!.slice(7), he);
    const c = body!.content;
    if (!c) return null;
    return { subject: c.subject, html: renderPreview(body!.key!, he, c) };
  }

  if (body.action === "test") {
    const to = (body.to ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json({ error: "bad_email" }, { status: 400 });
    }
    const r = renderNow();
    if (!r) return NextResponse.json({ error: "no_content" }, { status: 400 });
    const sent = await sendDripEmail({ to, subject: `[TEST] ${r.subject}`, html: r.html });
    return sent.ok
      ? NextResponse.json({ ok: true, sent: true })
      : NextResponse.json({ error: "send_failed", reason: sent.reason }, { status: 502 });
  }

  if (body.action === "preview") {
    const r = renderNow();
    if (!r) return NextResponse.json({ error: "no_content" }, { status: 400 });
    return NextResponse.json({ html: r.html });
  }

  // Editing (save/reset) applies only to the family markdown-lite series.
  if (isSignup) {
    return NextResponse.json({ error: "readonly_series" }, { status: 400 });
  }
  if (body.action === "save") {
    const c = body.content;
    if (!c || typeof c.subject !== "string" || typeof c.body !== "string") {
      return NextResponse.json({ error: "no_content" }, { status: 400 });
    }
    await saveOverride(body.key, lang, {
      subject: c.subject.slice(0, 300),
      heading: (c.heading ?? "").slice(0, 200),
      body: c.body.slice(0, 8000),
      ctaText: (c.ctaText ?? "").slice(0, 120),
    });
    return NextResponse.json({ ok: true, saved: true });
  }
  if (body.action === "reset") {
    await resetOverride(body.key, lang);
    return NextResponse.json({ ok: true, reset: true });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
