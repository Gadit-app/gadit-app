import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { summarizeStripeRevenue } from "@/lib/admin-revenue";
import { sendPartnerWelcome } from "@/lib/partner-email";
import {
  generatePartnerCode,
  generateDashboardToken,
  FOUNDER_RATE_YEAR_ONE,
  DEFAULT_RATE_LIFETIME,
  Partner,
} from "@/lib/partners";

/**
 * ADMIN, one-off: turn every current Family subscriber who isn't already a
 * partner into a FOUNDER partner (30% year one / 10% for life) and send them
 * the partner welcome email (Gadi 2026-08-17).
 *
 * Source of truth = Stripe Family-tier subscriptions (active / trialing /
 * past_due) — those carry the real billing email. Idempotent by email: a
 * customer who is already a partner is skipped (never a duplicate, never a
 * second email). Welcome-email language: Israeli billing address → Hebrew,
 * otherwise English (a safe default; a partner can read it in any language
 * once in the dashboard).
 *
 * ALWAYS DRY-RUN FIRST: `?dryRun=1` returns exactly who WOULD be created +
 * emailed, creating nothing and sending nothing. Drop dryRun to execute.
 *
 * USAGE:
 *   GET/POST /api/admin/partners/bootstrap-family?secret=$ADMIN_SECRET&dryRun=1
 *   GET/POST /api/admin/partners/bootstrap-family?secret=$ADMIN_SECRET
 */

export const maxDuration = 120;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Candidate = {
  email: string;
  name: string;
  country: string | null;
  status: string;
  lang: string;
  alreadyPartner: boolean;
};

async function run(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const db = getAdminDb();

  // 1) Every current Family subscriber, from Stripe (the billing email).
  const rev = await summarizeStripeRevenue(stripe);
  const familySubs = rev.active.filter(
    (s) => s.tier === "family" && (s.status === "active" || s.status === "trialing" || s.status === "past_due"),
  );

  // Dedupe by email (a customer with two family subs = one candidate).
  const byEmail = new Map<string, Candidate>();
  for (const s of familySubs) {
    const email = (s.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    if (byEmail.has(email)) continue;
    byEmail.set(email, {
      email,
      name: "",
      country: s.country,
      status: s.status,
      // Provisional; refined below from the customer's real UI language.
      lang: s.country === "IL" ? "he" : "en",
      alreadyPartner: false,
    });
  }

  // 2) Resolve each customer's REAL UI language from their Gadit account
  //    (users/{uid}.uiLang), so the welcome email lands in the language they
  //    actually use. Stripe billing country is null for almost everyone, so
  //    the country heuristic alone would wrongly default a Hebrew base to
  //    English. Fall back: country → he/en, then en. Also grab their name.
  const auth = getAdminAuth();
  for (const cand of byEmail.values()) {
    try {
      const u = await auth.getUserByEmail(cand.email);
      if (u.displayName) cand.name = u.displayName;
      const udoc = await db.collection("users").doc(u.uid).get();
      const uiLang = udoc.exists ? (udoc.data()?.uiLang as string | undefined) : undefined;
      if (uiLang && typeof uiLang === "string") cand.lang = uiLang;
    } catch {
      /* no matching Gadit account (e.g. billing email differs) — keep the
         country-based provisional language. */
    }
  }

  // 3) Which of them are already partners (idempotent, no dup / no re-email).
  for (const cand of byEmail.values()) {
    const existing = await db.collection("partners").where("email", "==", cand.email).limit(1).get();
    cand.alreadyPartner = !existing.empty;
  }

  const candidates = [...byEmail.values()];
  const toCreate = candidates.filter((c) => !c.alreadyPartner);

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      familySubscribers: candidates.length,
      alreadyPartners: candidates.filter((c) => c.alreadyPartner).length,
      wouldCreate: toCreate.length,
      candidates: candidates.map((c) => ({ email: c.email, status: c.status, country: c.country, lang: c.lang, alreadyPartner: c.alreadyPartner })),
    });
  }

  // 4) Execute: create each as a FOUNDER partner + send the welcome email.
  const created: Array<{ email: string; code: string; lang: string; emailed: boolean }> = [];
  const failed: Array<{ email: string; error: string }> = [];

  for (const cand of toCreate) {
    try {
      // Mint a unique code.
      let code = "";
      for (let i = 0; i < 6; i++) {
        const candidate = generatePartnerCode();
        const clash = await db.collection("partners").where("code", "==", candidate).limit(1).get();
        if (clash.empty) { code = candidate; break; }
      }
      if (!code) { failed.push({ email: cand.email, error: "code_generation_failed" }); continue; }

      const dashboardToken = generateDashboardToken();
      const doc: Omit<Partner, "id"> = {
        code,
        name: cand.name,
        email: cand.email,
        tier: "founder",
        rateYearOne: FOUNDER_RATE_YEAR_ONE,
        rateLifetime: DEFAULT_RATE_LIFETIME,
        status: "active",
        dashboardToken,
        audience: "Family subscriber (auto-enrolled founder 2026-08-17)",
        clicks: 0,
        signups: 0,
        ownerUid: null,
        createdAt: new Date().toISOString(),
      };
      await db.collection("partners").add(doc);

      let emailed = false;
      try {
        await sendPartnerWelcome({ code, name: cand.name, email: cand.email, dashboardToken, rateYearOne: doc.rateYearOne, rateLifetime: doc.rateLifetime }, cand.lang);
        emailed = true;
      } catch (e) {
        console.error("[bootstrap-family] welcome email failed for", cand.email, e);
      }
      created.push({ email: cand.email, code, lang: cand.lang, emailed });
    } catch (e) {
      failed.push({ email: cand.email, error: String(e instanceof Error ? e.message : e) });
    }
  }

  return NextResponse.json({
    dryRun: false,
    familySubscribers: candidates.length,
    alreadyPartners: candidates.filter((c) => c.alreadyPartner).length,
    createdCount: created.length,
    emailedCount: created.filter((c) => c.emailed).length,
    created,
    failed,
  });
}

export async function GET(req: NextRequest) { return run(req); }
export async function POST(req: NextRequest) { return run(req); }
