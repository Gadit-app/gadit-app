import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin view of the help assistant (2026-11-15).
 *
 * GET  /api/admin/help-chat?secret=...  -> { config, today, logs, evalRun }
 * POST /api/admin/help-chat?secret=...  { enabled?, audience? } -> { config }
 *
 * config/helpChat is the switch: enabled false turns the assistant off for
 * everyone at once, without a deploy. audience "testers" = testers and our own
 * accounts; "all" = every signed-in adult.
 */

export const maxDuration = 30;

function gate(req: NextRequest): NextResponse | null {
  const want = process.env.ADMIN_SECRET;
  if (!want) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (req.nextUrl.searchParams.get("secret") !== want) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

const iso = (v: unknown) => (v && typeof v === "object" && "toDate" in v ? (v as { toDate: () => Date }).toDate().toISOString() : v instanceof Date ? v.toISOString() : null);

export async function GET(req: NextRequest) {
  const bad = gate(req);
  if (bad) return bad;
  const db = getAdminDb();
  const today = new Date().toISOString().slice(0, 10);
  const [cfg, daily, logs, evals] = await Promise.all([
    db.collection("config").doc("helpChat").get(),
    db.collection("helpChatDaily").doc(today).get(),
    db.collection("helpLogs").orderBy("ts", "desc").limit(400).get(),
    db.collection("helpEval").orderBy("at", "desc").limit(1).get(),
  ]);
  const ev = evals.docs[0];
  return NextResponse.json({
    config: cfg.exists ? cfg.data() : { enabled: false, audience: "testers" },
    today: daily.exists ? daily.data() : { count: 0, cost: 0, escalated: 0 },
    logs: logs.docs.map((d) => {
      const x = d.data();
      return { id: d.id, ts: iso(x.ts), email: x.email ?? "", lang: x.lang, platform: x.platform, plan: x.plan, convId: x.convId, question: x.question, answer: x.answer, escalate: !!x.escalate, reason: x.reason, linkId: x.linkId, helped: x.helped ?? null, cost: x.cost ?? 0, tester: !!x.tester, internal: !!x.internal };
    }),
    evalRun: ev ? { id: ev.id, at: iso(ev.get("at")), pass: ev.get("pass"), total: ev.get("total"), cost: ev.get("cost"), cases: ev.get("cases") } : null,
  });
}

export async function POST(req: NextRequest) {
  const bad = gate(req);
  if (bad) return bad;
  const body = (await req.json().catch(() => ({}))) as { enabled?: unknown; audience?: unknown };
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
  if (body.audience === "testers" || body.audience === "all") patch.audience = body.audience;
  const ref = getAdminDb().collection("config").doc("helpChat");
  await ref.set(patch, { merge: true });
  return NextResponse.json({ config: (await ref.get()).data() });
}
