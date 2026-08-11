import { NextRequest, NextResponse } from "next/server";
import { FAMILY_META, EMAIL_BASE } from "@/lib/email-drip/family-content";
import { renderEmailHtml, mdLiteToHtml, type EmailContent } from "@/lib/email-drip/render";
import { getOverride, getEffectiveContent, saveOverride, resetOverride } from "@/lib/email-drip/email-templates-store";

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
  return renderEmailHtml({
    he,
    eyebrow: he ? m?.eyebrow.he ?? "" : m?.eyebrow.en ?? "",
    heading: c.heading,
    bodyHtml: mdLiteToHtml(he, c.body),
    ctaText: c.ctaText,
    ctaUrl: (he ? `${EMAIL_BASE}/he/family` : `${EMAIL_BASE}/family`) + tab,
    foot: he ? m?.foot.he ?? "" : m?.foot.en ?? "",
    unsubscribeUrl: `${EMAIL_BASE}/`,
  });
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const key = req.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ emails: FAMILY_META.map((m) => ({ key: m.key, label: m.label, dayOffset: m.dayOffset })) });
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
    | { action?: string; key?: string; lang?: string; content?: EmailContent }
    | null;
  if (!body?.action || !body.key || !FAMILY_META.find((m) => m.key === body.key)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const lang = body.lang === "he" ? "he" : "en";

  if (body.action === "preview") {
    const c = body.content;
    if (!c) return NextResponse.json({ error: "no_content" }, { status: 400 });
    return NextResponse.json({ html: renderPreview(body.key, lang === "he", c) });
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
