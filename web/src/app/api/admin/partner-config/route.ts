/**
 * Admin — the editable partner "opening" (welcome) email, for the editor
 * on /admin/partners.
 *
 *   GET   → { config, previewHe, previewEn }  (config merged with defaults;
 *           previews are the full email HTML rendered from the SAVED config
 *           against a sample partner)
 *   PATCH → save { he?, en? } (merge) to partnerConfig/welcomeEmail
 *
 * Auth: ADMIN_SECRET via ?secret= (same as the other admin routes).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { loadWelcomeConfig, buildWelcomeEmail, WelcomeConfig, WELCOME_FIELDS, DEFAULT_WELCOME_CONFIG } from "@/lib/partner-email";

export const maxDuration = 30;

function gate(req: NextRequest): NextResponse | null {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

const SAMPLE = {
  code: "ABC123",
  name: "Dana",
  email: "dana@example.com",
  dashboardToken: "sample-token",
  rateYearOne: 0.25,
  rateLifetime: 0.1,
};

export async function GET(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;
  const config = await loadWelcomeConfig();
  return NextResponse.json({
    config,
    defaults: DEFAULT_WELCOME_CONFIG,
    previewHe: buildWelcomeEmail(SAMPLE, "he", config).html,
    previewEn: buildWelcomeEmail(SAMPLE, "en", config).html,
  });
}

export async function PATCH(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;

  let body: Partial<WelcomeConfig>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  // Only accept the known fields, trimmed and length-capped, so nothing
  // arbitrary lands in the doc.
  const clean = (o: unknown) => {
    const s = (o ?? {}) as Record<string, unknown>;
    const pick = (k: string) => (typeof s[k] === "string" ? (s[k] as string).slice(0, 1500) : undefined);
    const out: Record<string, string> = {};
    for (const k of WELCOME_FIELDS) {
      const v = pick(k);
      if (v !== undefined) out[k] = v;
    }
    return out;
  };

  const update: Record<string, unknown> = {};
  if (body.he) update.he = clean(body.he);
  if (body.en) update.en = clean(body.en);
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  await getAdminDb().collection("partnerConfig").doc("welcomeEmail").set(update, { merge: true });
  return NextResponse.json({ ok: true });
}
