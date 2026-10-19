import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Admin tool — trials started, by campaign (2026-10-19).
 *
 * Reads LIVE from Stripe. A trial "started" = a subscription created in the
 * window that has a card on it (default_payment_method). Card-less subs are
 * abandoned checkouts and are not counted. The campaign comes from the
 * subscription metadata written at checkout (utm_source / utm_medium /
 * utm_campaign / utm_content / utm_term, utm_from = "visit" for the link
 * this visit came from, "signup" for the first-touch tag saved at signup).
 * Subscriptions created before this metadata existed show as "(none)".
 *
 * USAGE:
 *   GET /api/admin/trial-sources?secret=$ADMIN_SECRET
 *   Optional: &since=YYYY-MM-DD   (default: 30 days ago)
 *             &campaign=<utm_campaign>   only that campaign
 */

export const maxDuration = 60;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Row = {
  subscriptionId: string;
  createdAt: string;
  status: string;
  trial: boolean;
  priceId: string;
  uid: string | null;
  email: string | null;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  from: string;
};

function inc(m: Record<string, number>, k: string) {
  m[k] = (m[k] ?? 0) + 1;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sinceStr = req.nextUrl.searchParams.get("since") ?? "";
  const sinceParsed = sinceStr ? new Date(sinceStr).getTime() : NaN;
  const sinceMs = Number.isFinite(sinceParsed) ? sinceParsed : Date.now() - 30 * 86_400_000;
  const onlyCampaign = req.nextUrl.searchParams.get("campaign") ?? "";

  const subs: Stripe.Subscription[] = [];
  let startingAfter: string | undefined;
  do {
    const page = await stripe.subscriptions.list({
      status: "all",
      limit: 100,
      created: { gte: Math.floor(sinceMs / 1000) },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    subs.push(...page.data);
    startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    if (subs.length >= 3000) break;
  } while (startingAfter);

  const NONE = "(none)";
  const rows: Row[] = [];
  for (const s of subs) {
    if (!s.default_payment_method) continue; // abandoned checkout, no card
    const md = s.metadata ?? {};
    const row: Row = {
      subscriptionId: s.id,
      createdAt: new Date(s.created * 1000).toISOString(),
      status: s.status,
      trial: !!s.trial_start,
      priceId: s.items.data[0]?.price?.id ?? "",
      uid: md.uid ?? null,
      email: md.email ?? null,
      source: md.utm_source || NONE,
      medium: md.utm_medium || NONE,
      campaign: md.utm_campaign || NONE,
      content: md.utm_content || NONE,
      term: md.utm_term || NONE,
      from: md.utm_from || NONE,
    };
    if (onlyCampaign && row.campaign !== onlyCampaign) continue;
    rows.push(row);
  }

  const bySource: Record<string, number> = {};
  const byCampaign: Record<string, number> = {};
  const bySourceMediumCampaignContent: Record<string, number> = {};
  let trials = 0;
  for (const r of rows) {
    if (r.trial) trials++;
    inc(bySource, r.source);
    inc(byCampaign, r.campaign);
    inc(bySourceMediumCampaignContent, [r.source, r.medium, r.campaign, r.content].join(" | "));
  }
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    since: new Date(sinceMs).toISOString(),
    ...(onlyCampaign && { campaign: onlyCampaign }),
    totals: { withCard: rows.length, trials },
    bySource,
    byCampaign,
    bySourceMediumCampaignContent,
    rows: rows.slice(0, 500),
  });
}
