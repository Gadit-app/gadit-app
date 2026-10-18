"use client";

import { useEffect, useState } from "react";
import { useAdminContext, type AdminLang } from "./admin-context";
import { TOKENS } from "@/lib/admin-config";

/**
 * Admin overview dashboard — the morning-glance view, built to the locked
 * admin spec (v4, 2026-08-17):
 *   §3.1 money triplet · §3.2 four operational KPIs · §13 three decision
 *   metrics · §3.6 alerts. Cohorts + the 12-month MRR graph are DEFERRED
 *   to 200+ payers (spec §13) — the snapshot layer accrues the history now.
 *
 * Reads /api/admin/overview, which aggregates everything in one pass.
 */

type ByTier = { clear: number; deep: number; individual?: number; family: number; schools: number };

// Mirrors api/admin/overview/attention.ts (kept as a local type so this
// client never imports server code).
type AttentionKind = "payment" | "scheduled" | "ended" | "unmapped";
type AttentionPerson = {
  subId: string;
  email: string | null;
  name: string | null;
  uid: string | null;
  country: string | null;
  tier: string;
  billing: string;
  amount: number | null;
  currency: string;
  monthlyUsd: number;
  status: string;
  date: string | null;
  date2: string | null;
  reason: string | null;
  stripeCustomerId: string | null;
  priceId: string | null;
};

type Overview = {
  generatedAt: string;
  businessTz?: string;
  users: {
    total: number;
    byCategory?: { basic: number; individual: number; family: number; schools: number };
    signupsToday: number;
    signupsWeek: number;
    signupsMonth: number;
  };
  revenue: {
    mrrUsd: number;
    arrUsd: number;
    atRiskMrrUsd: number;
    trialingMrrUsd: number;
    trialingArrUsd: number;
    trialingCardedCount?: number;
    trialingCardlessCount?: number;
    totalMrrUsd: number;
    totalArrUsd: number;
    newMrrUsd: number;
    churnedMrrUsd: number;
    netNewMrrUsd: number;
    payingSubscriptions: number;
    payingCustomers: number;
    newCustomersThisMonth: number;
    churnedCustomersThisMonth: number;
    trialingSubscriptions: number;
    payingByTier?: ByTier;
    trialingByTier?: ByTier;
  };
  decision: {
    arpuUsd: number;
    monthlyChurnPct: number;
    trialConversionPct: number | null;
    trialResolvedCount: number;
    cacUsd: number;
    grossMargin: number;
    cacPaybackMonths: number | null;
  };
  alerts: {
    paymentProblemCount?: number;
    pastDueCount: number;
    scheduledCancelCount: number;
    endedThisWeekCount: number;
    unmappedPriceCount: number;
    unmappedPriceIds: string[];
    atRisk?: Array<{ email: string | null; tier: string; monthlyUsd: number; currency: string; status: string }>;
    lists?: Partial<Record<AttentionKind, AttentionPerson[]>>;
  };
  activity: {
    searchesToday: number;
    searchesWeek: number;
    searchesMonth: number;
    peopleToday?: number;
    peopleWeek?: number;
  };
  funnel: {
    anonymousMonth: number;
    signedUpMonth: number;
    paidMonth: number;
    trialingMonth?: number;
    anonToSignup: number;
    signupToPaid: number;
  };
};

const STRINGS = {
  en: {
    title: "Overview",
    loading: "Loading…",
    // money triplet
    mCurrentMrr: "Current MRR",
    mTrialMrr: "Potential MRR · trials",
    mNetNew: "Net-new MRR · month",
    atRisk: "at risk",
    potentialNote: "potential, not yet revenue",
    // plain-language explanations of the acronyms
    hMrr: "Monthly recurring revenue",
    hTrialMrr: "What trials would add if they convert",
    hNetNew: "Net change this month (new minus churn)",
    hArpu: "Average revenue per user",
    hPayback: "Months to recoup a customer's acquisition cost (CAC)",
    hChurn: "Share of customers who left this month",
    // total monthly forecast
    totalLabel: "Full monthly forecast · if every trial pays",
    totalSub: "current %c + trials %t · ≈ $%y/yr",
    confirmedLabel: "Confirmed · paying now",
    confirmedSub: "%n paying customers · real revenue",
    pendingLabel: "Pending · trials (not money yet)",
    pendingSub: "%n trials · counts only if they pay",
    forecastFoot: "Full forecast if every trial pays: %f · ≈ $%y/yr",
    perMonth: "/mo",
    totalLabel2: "Total · full forecast",
    totalSub2: "confirmed + pending · if every trial pays",
    // operational KPIs
    kPaying: "Paying customers",
    kNew: "New customers · month",
    kChurn: "Monthly churn",
    kTrialing: "In trial",
    subs: "subs",
    churnedThisMonth: "churned this month",
    ofPipeline: "in the pipeline",
    // decision metrics
    dConversion: "Trial → paid",
    dArpu: "ARPU",
    dPayback: "CAC payback",
    resolvedTrials: "resolved trials",
    perCustomer: "per paying customer",
    months: "mo",
    cacBasis: "CAC $% · %m margin",
    noData: "no data yet",
    // alerts
    alertsTitle: "Needs attention",
    aPastDue: "Payment problems",
    aScheduled: "Scheduled cancels",
    aEnded: "Ended this week",
    aUnmapped: "Unmapped prices",
    // who is behind each chip
    noName: "No name",
    emptyList: "No details to show",
    openUser: "Subscribers",
    openCustomer: "Customer in Stripe",
    openSub: "Subscription in Stripe",
    perMo: "/mo",
    perYr: "/yr",
    dPayment: "Failed charge",
    dPayment2: "Period ends",
    dScheduled: "Ends",
    dScheduled2: "Cancel requested",
    dEnded: "Ended",
    dEnded2: "Cancel requested",
    dUnmapped: "Since",
    stPastDue: "Card declined",
    stUnpaid: "Unpaid",
    stIncomplete: "First payment not completed",
    rsRequested: "Asked to cancel",
    rsFailed: "Payment failed",
    rsDisputed: "Payment disputed",
    unmappedIds: "Price IDs",
    // existing
    funnelTitle: "Conversion funnel · 30 days",
    funnelAnonymous: "Anonymous visitors who searched",
    funnelSignedUp: "Signed up",
    funnelPaid: "Of them paying now",
    funnelTrialing: "of them in a trial now",
    cardSplit: "%a with a card · %b without",
    usersTitle: "Accounts",
    usersSub: "+%t today · +%w in 7 days · +%m in 30 days",
    searchesTitle: "Searches today",
    searchesSub: "%p people · %w searches in 7 days",
    peopleWeekTitle: "Active people · 7 days",
    peopleWeekSub: "humans only, without our own accounts",
    catLine: "Basic %b · Individual %i · Family %f · Schools %s",
    funnelAnonToSignup: "Anonymous → signup",
    funnelSignupToPaid: "Signup → paid",
    generatedAtLabel: "Updated",
    perYear: "≈ $%/yr",
  },
  he: {
    title: "סקירה",
    loading: "טוען…",
    mCurrentMrr: "MRR נוכחי",
    mTrialMrr: "MRR פוטנציאלי · ניסיונות",
    mNetNew: "MRR נטו חדש · החודש",
    atRisk: "בסיכון",
    potentialNote: "פוטנציאל, עדיין לא הכנסה",
    hMrr: "הכנסה חודשית קבועה ממנויים",
    hTrialMrr: "מה שהניסיונות יוסיפו אם ישלמו",
    hNetNew: "שינוי נטו החודש (חדשים פחות נטישה)",
    hArpu: "הכנסה ממוצעת ללקוח משלם",
    hPayback: "חודשים להחזר עלות גיוס לקוח",
    hChurn: "אחוז הלקוחות שעזבו החודש",
    totalLabel: 'סה"כ צפי חודשי · אם כל ניסיון משלם',
    totalSub: "נוכחי %c + ניסיונות %t · ≈ $%y לשנה",
    confirmedLabel: "כסף ודאי · משלמים עכשיו",
    confirmedSub: "%n משלמים · הכנסה אמיתית",
    pendingLabel: "בהמתנה · ניסיונות (עוד לא כסף)",
    pendingSub: "%n ניסיונות · נספר רק אם ישלמו",
    forecastFoot: "צפי מלא אם כל הניסיונות ישלמו: %f · ≈ $%y לשנה",
    perMonth: "לחודש",
    totalLabel2: "סך הכל · צפי מלא",
    totalSub2: "ודאי + בהמתנה · אם כל הניסיונות ישלמו",
    kPaying: "לקוחות משלמים",
    kNew: "לקוחות חדשים · החודש",
    kChurn: "נטישה חודשית",
    kTrialing: "בתקופת ניסיון",
    subs: "מנויים",
    churnedThisMonth: "נטשו החודש",
    ofPipeline: "בצנרת",
    dConversion: "ניסיון ← תשלום",
    dArpu: "ARPU",
    dPayback: "החזר CAC",
    resolvedTrials: "ניסיונות שהוכרעו",
    perCustomer: "ללקוח משלם",
    months: "חודשים",
    cacBasis: "CAC $% · %m שולי רווח",
    noData: "אין נתונים עדיין",
    alertsTitle: "דורש טיפול",
    aPastDue: "בעיות תשלום",
    aScheduled: "ביטולים מתוזמנים",
    aEnded: "הסתיימו השבוע",
    aUnmapped: "מחירים לא ממופים",
    noName: "ללא שם",
    emptyList: "אין פרטים להצגה",
    openUser: "במנויים",
    openCustomer: "לקוח ב-Stripe",
    openSub: "מנוי ב-Stripe",
    perMo: "לחודש",
    perYr: "לשנה",
    dPayment: "חיוב שנכשל",
    dPayment2: "סוף התקופה",
    dScheduled: "מסתיים",
    dScheduled2: "בקשת ביטול",
    dEnded: "הסתיים",
    dEnded2: "בקשת ביטול",
    dUnmapped: "מנוי מאז",
    stPastDue: "חיוב נכשל",
    stUnpaid: "לא שולם",
    stIncomplete: "תשלום ראשון לא הושלם",
    rsRequested: "ביטול לבקשת הלקוח",
    rsFailed: "תשלום נכשל",
    rsDisputed: "מחלוקת על תשלום",
    unmappedIds: "מזהי מחיר",
    funnelTitle: "משפך המרה · 30 ימים",
    funnelAnonymous: "אנונימיים שחיפשו",
    funnelSignedUp: "נרשמו",
    funnelPaid: "מתוכם משלמים עכשיו",
    funnelTrialing: "מתוכם בתקופת ניסיון עכשיו",
    cardSplit: "%a עם כרטיס · %b בלי",
    usersTitle: "חשבונות",
    usersSub: "+%t היום · +%w ב-7 ימים · +%m ב-30 ימים",
    searchesTitle: "חיפושים היום",
    searchesSub: "%p אנשים · %w חיפושים ב-7 ימים",
    peopleWeekTitle: "אנשים פעילים · 7 ימים",
    peopleWeekSub: "בני אדם בלבד, בלי החשבונות שלנו",
    catLine: "Basic %b · Individual %i · Family %f · Schools %s",
    funnelAnonToSignup: "אנונימי → רישום",
    funnelSignupToPaid: "רישום → תשלום",
    generatedAtLabel: "עודכן",
    perYear: "≈ $%/שנה",
  },
} as const;

export default function AdminOverviewClient() {
  const { secret, lang } = useAdminContext();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Which "needs attention" chip is open (one at a time; click again closes).
  const [openKind, setOpenKind] = useState<AttentionKind | null>(null);
  const t = STRINGS[lang];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/admin/overview?secret=${encodeURIComponent(secret)}`)
      .then(async (r) => {
        if (!r.ok) {
          const j = (await r.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<Overview>;
      })
      .then((j) => setData(j))
      .catch((e) => setError(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));
  }, [secret]);

  const updatedTime = data ? new Date(data.generatedAt).toLocaleTimeString(lang === "he" ? "he-IL" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "";

  const rev = data?.revenue;
  const dec = data?.decision;
  const al = data?.alerts;
  const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const signed = (n: number) => `${n >= 0 ? "+" : "−"}${money(Math.abs(n))}`;
  // Annualized headline: monthly recurring × 12, rounded, thousands-grouped.
  const perYear = (n: number) => t.perYear.replace("%", Math.round(n * 12).toLocaleString("en-US"));

  const alertItems: Array<{ kind: AttentionKind; label: string; count: number }> = al
    ? ([
        { kind: "payment", label: t.aPastDue, count: al.paymentProblemCount ?? al.pastDueCount },
        { kind: "scheduled", label: t.aScheduled, count: al.scheduledCancelCount },
        { kind: "ended", label: t.aEnded, count: al.endedThisWeekCount },
        { kind: "unmapped", label: t.aUnmapped, count: al.unmappedPriceCount },
      ] as const).filter((x) => x.count > 0)
    : [];
  const openItem = alertItems.find((a) => a.kind === openKind) ?? null;
  const openList: AttentionPerson[] = openItem ? al?.lists?.[openItem.kind] ?? [] : [];

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: TOKENS.ink }}>{t.title}</h1>
        {data && (
          <div style={{ fontSize: 12, color: TOKENS.inkFaint, marginTop: 4 }}>
            {t.generatedAtLabel} · {updatedTime}
            {data.businessTz ? ` · ${data.businessTz}` : ""}
          </div>
        )}
      </div>

      {loading && <div style={{ padding: 32, textAlign: "center", color: TOKENS.inkSoft }}>{t.loading}</div>}
      {error && (
        <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {data && rev && dec && (
        <>
          {/* Money headline — three distinct blocks, each with a monthly AND an
              annual figure (Gadi 2026-08-19: wanted the yearly total, and no
              figure shown twice). Confirmed = solid teal / real money. Pending =
              dashed amber / not money yet. Total = purple / full forecast. The
              old duplicate "Current/Potential MRR" cards are gone; the tier
              breakdowns moved into these subs so nothing is lost. */}
          <div className="ov-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
            {/* Confirmed */}
            <div style={{ ...cardStyle, padding: "14px 18px", textAlign: "center", borderColor: TOKENS.tealBright, background: "rgba(14,165,165,0.08)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: TOKENS.tealBright, textTransform: "uppercase", letterSpacing: 0.5 }}>{t.confirmedLabel}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: TOKENS.teal, lineHeight: 1.1, marginTop: 4 }} dir="ltr">{money(rev.mrrUsd)}<span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.inkSoft }}> {t.perMonth}</span></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.teal, marginTop: 2 }} dir="ltr">{perYear(rev.mrrUsd)}</div>
              <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 5 }}>{t.confirmedSub.replace("%n", String(rev.payingCustomers))}</div>
              <div style={{ fontSize: 11, color: TOKENS.inkFaint, marginTop: 1 }} dir="ltr">{tierBreakdown(rev.payingByTier)}</div>
              {rev.atRiskMrrUsd > 0 && (
                <div style={{ fontSize: 11, fontWeight: 600, color: TOKENS.danger, marginTop: 2 }} dir="ltr">{money(rev.atRiskMrrUsd)} {t.atRisk}</div>
              )}
            </div>
            {/* Pending — deliberately dashed + amber so it never reads as money */}
            <div style={{ ...cardStyle, padding: "14px 18px", textAlign: "center", borderStyle: "dashed", borderColor: TOKENS.amber, background: "rgba(245,158,11,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: TOKENS.amber, textTransform: "uppercase", letterSpacing: 0.5 }}>⏳ {t.pendingLabel}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: TOKENS.amber, lineHeight: 1.1, marginTop: 4 }} dir="ltr">{money(rev.trialingMrrUsd)}<span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.inkSoft }}> {t.perMonth}</span></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.amber, marginTop: 2 }} dir="ltr">{perYear(rev.trialingMrrUsd)}</div>
              <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 5 }}>{t.pendingSub.replace("%n", String(rev.trialingSubscriptions))}</div>
              <div style={{ fontSize: 11, color: TOKENS.inkFaint, marginTop: 1 }} dir="ltr">{tierBreakdown(rev.trialingByTier)}</div>
              {rev.trialingCardedCount != null && rev.trialingSubscriptions > 0 && (
                <div style={{ fontSize: 11, color: TOKENS.inkFaint, marginTop: 1 }}>{t.cardSplit.replace("%a", String(rev.trialingCardedCount)).replace("%b", String(rev.trialingCardlessCount ?? 0))}</div>
              )}
            </div>
            {/* Total — confirmed + pending, the number Gadi asked for */}
            <div style={{ ...cardStyle, padding: "14px 18px", textAlign: "center", borderColor: TOKENS.purpleBright, background: "rgba(124,58,237,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: TOKENS.purpleBright, textTransform: "uppercase", letterSpacing: 0.5 }}>{t.totalLabel2}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: TOKENS.purple, lineHeight: 1.1, marginTop: 4 }} dir="ltr">{money(rev.totalMrrUsd)}<span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.inkSoft }}> {t.perMonth}</span></div>
              <div style={{ fontSize: 15, fontWeight: 800, color: TOKENS.purple, marginTop: 2 }} dir="ltr">{perYear(rev.totalMrrUsd)}</div>
              <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 5 }}>{t.totalSub2}</div>
            </div>
          </div>

          {/* §3.2 Operational KPIs — net-new leads (the only unique money card
              left), then customer counts. Trialing count dropped: it lived in
              the Pending block above. */}
          <SectionGrid cols={4}>
            <Kpi
              label={t.mNetNew}
              value={signed(rev.netNewMrrUsd)}
              accent={rev.netNewMrrUsd < 0 ? TOKENS.danger : TOKENS.purple}
              hint={t.hNetNew}
              detail={`+${money(rev.newMrrUsd)} · −${money(rev.churnedMrrUsd)}`}
              detailLtr
            />
            <Kpi label={t.kPaying} value={rev.payingCustomers} accent={TOKENS.ink}
                 detail={`${rev.payingSubscriptions} ${t.subs}`} detailLtr />
            <Kpi label={t.kNew} value={rev.newCustomersThisMonth} accent={TOKENS.teal} />
            <Kpi label={t.kChurn} value={`${dec.monthlyChurnPct}%`}
                 accent={dec.monthlyChurnPct > 0 ? TOKENS.danger : TOKENS.ink}
                 hint={t.hChurn}
                 detail={`${rev.churnedCustomersThisMonth} ${t.churnedThisMonth}`} />
          </SectionGrid>

          {/* §13 Three decision metrics */}
          <SectionGrid cols={3}>
            <Kpi
              label={t.dConversion}
              value={dec.trialConversionPct == null ? "—" : `${dec.trialConversionPct}%`}
              accent={TOKENS.purple}
              detail={dec.trialConversionPct == null ? t.noData : `${dec.trialResolvedCount} ${t.resolvedTrials}`}
            />
            <Kpi label={t.dArpu} value={money(dec.arpuUsd)} accent={TOKENS.teal} hint={t.hArpu} detail={t.perCustomer} />
            <Kpi
              label={t.dPayback}
              value={dec.cacPaybackMonths == null ? "—" : `${dec.cacPaybackMonths} ${t.months}`}
              accent={TOKENS.ink}
              hint={t.hPayback}
              detail={t.cacBasis.replace("$%", `$${dec.cacUsd}`).replace("%m", `${Math.round(dec.grossMargin * 100)}%`)}
              detailLtr
            />
          </SectionGrid>

          {/* §3.6 Alerts — only when something needs attention */}
          {alertItems.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: 16, borderColor: "#FECACA", background: "#FEF2F2" }}>
              <div style={{ ...sectionTitleStyle, color: "#991B1B" }}>{t.alertsTitle}</div>
              {/* Each chip opens the people behind it right under the chips
                  (Gadi 2026-10-18). One open at a time; click again closes. */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {alertItems.map((a) => {
                  const on = openKind === a.kind;
                  return (
                    <button
                      key={a.kind}
                      type="button"
                      aria-expanded={on}
                      aria-controls="ov-attention-list"
                      onClick={() => setOpenKind(on ? null : a.kind)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, border: `1px solid ${on ? TOKENS.danger : "#FCA5A5"}`, background: on ? "#FEE2E2" : "#FFFFFF", fontSize: 13, color: "#7F1D1D", font: "inherit", cursor: "pointer" }}
                    >
                      <span style={{ fontWeight: on ? 700 : 500, fontSize: 13 }}>{a.label}</span>
                      <span style={{ fontWeight: 700, color: TOKENS.danger, fontSize: 13 }}>{a.count}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: on ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  );
                })}
              </div>
              {openItem && (
                <div id="ov-attention-list" style={{ marginTop: 12, display: "grid", gap: 6 }}>
                  {openList.length === 0 && (
                    <div style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #FCA5A5", background: "#FFFFFF", fontSize: 13, color: TOKENS.inkSoft }}>
                      {t.emptyList}
                    </div>
                  )}
                  {openList.map((p) => (
                    <AttentionRow key={p.subId} p={p} kind={openItem.kind} t={t} lang={lang} />
                  ))}
                  {openItem.kind === "unmapped" && (al?.unmappedPriceIds?.length ?? 0) > 0 && (
                    <div style={{ fontSize: 12, color: TOKENS.inkSoft }}>
                      {t.unmappedIds}: <span dir="ltr">{al?.unmappedPriceIds.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Accounts and activity (Gadi 2026-10-10): one row, no number twice.
              Top words, languages and countries live on Activity and
              Subscribers. */}
          <div className="ov-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
            <Kpi label={t.usersTitle} value={data.users.total} accent={TOKENS.ink}
                 hint={t.usersSub.replace("%t", String(data.users.signupsToday)).replace("%w", String(data.users.signupsWeek)).replace("%m", String(data.users.signupsMonth))}
                 detail={data.users.byCategory ? t.catLine.replace("%b", String(data.users.byCategory.basic)).replace("%i", String(data.users.byCategory.individual)).replace("%f", String(data.users.byCategory.family)).replace("%s", String(data.users.byCategory.schools)) : undefined}
                 detailLtr />
            <Kpi label={t.searchesTitle} value={data.activity.searchesToday} accent={TOKENS.teal}
                 detail={t.searchesSub.replace("%p", String(data.activity.peopleToday ?? 0)).replace("%w", String(data.activity.searchesWeek))} />
            <Kpi label={t.peopleWeekTitle} value={data.activity.peopleWeek ?? 0} accent={TOKENS.ink} detail={t.peopleWeekSub} />
          </div>

          <div style={{ ...cardStyle, marginBottom: 14 }}>
            <div style={sectionTitleStyle}>{t.funnelTitle}</div>
            <FunnelRow label={t.funnelAnonymous} value={data.funnel.anonymousMonth} color={TOKENS.inkFaint} max={Math.max(data.funnel.anonymousMonth, data.funnel.signedUpMonth, 1)} />
            <FunnelRow label={t.funnelSignedUp} value={data.funnel.signedUpMonth} color={TOKENS.tealBright} max={Math.max(data.funnel.anonymousMonth, data.funnel.signedUpMonth, 1)} />
            <FunnelRow label={t.funnelPaid} value={data.funnel.paidMonth} color={TOKENS.purpleBright} max={Math.max(data.funnel.anonymousMonth, data.funnel.signedUpMonth, 1)} />
            {(data.funnel.trialingMonth ?? 0) > 0 && (
              <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: -4 }}>+{data.funnel.trialingMonth} {t.funnelTrialing}</div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px dashed #E5E7EB" }}>
              <span style={{ fontSize: 12, color: TOKENS.inkSoft }}>{t.funnelAnonToSignup}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink }}>{data.funnel.anonToSignup}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 12, color: TOKENS.inkSoft }}>{t.funnelSignupToPaid}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink }}>{data.funnel.signupToPaid}%</span>
            </div>
          </div>
        </>
      )}
      <style>{OV_CSS}</style>
    </>
  );
}

type Strings = (typeof STRINGS)[AdminLang];

const tierLabel = (tier: string) =>
  tier === "clear" || tier === "deep" ? "Individual" : tier.charAt(0).toUpperCase() + tier.slice(1);

function fmtAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

// Same real-flag images as Subscribers (flagcdn PNGs render on Windows too).
function FlagImg({ iso2 }: { iso2: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/40x30/${iso2.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/80x60/${iso2.toLowerCase()}.png 2x`}
      width={18}
      height={13}
      alt={iso2}
      title={iso2}
      loading="lazy"
      style={{ borderRadius: 2, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 0 0.5px rgba(15,23,42,0.18)", flexShrink: 0 }}
    />
  );
}

const linkStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: TOKENS.purple, textDecoration: "none", whiteSpace: "nowrap" };

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// One person behind a "needs attention" chip: who, what they pay, the date
// that matters for this chip, and where to open them.
function AttentionRow({ p, kind, t, lang }: { p: AttentionPerson; kind: AttentionKind; t: Strings; lang: AdminLang }) {
  const day = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jerusalem" })
      : null;
  const [l1, l2] =
    kind === "payment" ? [t.dPayment, t.dPayment2] :
    kind === "scheduled" ? [t.dScheduled, t.dScheduled2] :
    kind === "ended" ? [t.dEnded, t.dEnded2] :
    [t.dUnmapped, ""];
  const dates = [
    p.date ? `${l1} ${day(p.date)}` : null,
    p.date2 && l2 ? `${l2} ${day(p.date2)}` : null,
  ].filter(Boolean).join(" · ");
  const note =
    kind === "payment"
      ? (p.status === "past_due" ? t.stPastDue : p.status === "unpaid" ? t.stUnpaid : p.status === "incomplete" ? t.stIncomplete : p.status)
      : kind === "ended" && p.reason
        ? (p.reason === "cancellation_requested" ? t.rsRequested : p.reason === "payment_failed" ? t.rsFailed : p.reason === "payment_disputed" ? t.rsDisputed : p.reason)
        : null;
  const interval = p.billing === "monthly" ? t.perMo : p.billing === "yearly" ? t.perYr : "";
  const country = p.country && /^[A-Za-z]{2}$/.test(p.country) ? p.country.toUpperCase() : null;

  return (
    <div className="ov-att-row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1.4fr) auto", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 10, border: "1px solid #FCA5A5", background: "#FFFFFF", fontSize: 13 }}>
      {/* Who */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          {country && <FlagImg iso2={country} />}
          <span style={{ fontWeight: 700, color: p.name ? TOKENS.ink : TOKENS.inkFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {p.name || t.noName}
          </span>
          <span dir="ltr" style={{ fontSize: 11, fontWeight: 600, color: TOKENS.inkSoft, background: "#F3F4F6", borderRadius: 999, padding: "1px 7px", whiteSpace: "nowrap" }}>
            {tierLabel(p.tier)}
          </span>
        </div>
        {p.email && (
          <a href={`mailto:${p.email}`} dir="ltr" style={{ display: "block", marginTop: 2, fontSize: 12, color: "#B91C1C", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "start" }}>
            {p.email}
          </a>
        )}
      </div>
      {/* Money + dates */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {p.amount != null && (
            <span style={{ fontWeight: 700, color: TOKENS.ink }}>
              <span dir="ltr">{fmtAmount(p.amount, p.currency)}</span>
              {interval && <span style={{ fontWeight: 500, color: TOKENS.inkSoft }}> {interval}</span>}
            </span>
          )}
          {note && <span style={{ fontSize: 11, fontWeight: 700, color: TOKENS.danger }}>{note}</span>}
        </div>
        {dates && <div style={{ marginTop: 2, fontSize: 12, color: TOKENS.inkSoft }}>{dates}</div>}
        {kind === "unmapped" && p.priceId && <div dir="ltr" style={{ marginTop: 2, fontSize: 11, color: TOKENS.inkFaint, textAlign: "start" }}>{p.priceId}</div>}
      </div>
      {/* Where to open them */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
        {p.uid && (
          <a href={`/admin/users?q=${encodeURIComponent(p.email || p.uid)}`} style={linkStyle}>
            <UserIcon />
            {t.openUser}
          </a>
        )}
        {p.stripeCustomerId && (
          <a href={`https://dashboard.stripe.com/customers/${p.stripeCustomerId}`} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            <ExternalIcon />
            {t.openCustomer}
          </a>
        )}
        <a href={`https://dashboard.stripe.com/subscriptions/${p.subId}`} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <ExternalIcon />
          {t.openSub}
        </a>
      </div>
    </div>
  );
}

// Paying subscribers by real tier, brand-order, non-zero only.
function tierBreakdown(t?: ByTier): string {
  if (!t) return "";
  const parts: string[] = [];
  // Four categories (Gadi 2026-10-10): the legacy Clear and Deep are Individual.
  const individual = (t.clear ?? 0) + (t.deep ?? 0) + (t.individual ?? 0);
  if (individual) parts.push(`${individual} Individual`);
  if (t.family)  parts.push(`${t.family} Family`);
  if (t.schools) parts.push(`${t.schools} Schools`);
  return parts.join(" · ");
}

function SectionGrid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div
      className="ov-grid"
      style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, marginBottom: 10 }}
    >
      {children}
    </div>
  );
}

// Centered KPI card (spec §1). Value 28px in an AA-safe hue; the detail row
// is a FIXED-HEIGHT 18px slot with ellipsis so a 2-item card and a 4-item
// card stay the same height and the grid never jitters.
function Kpi({ label, value, accent, hint, detail, detailLtr, note, noteColor }: {
  label: string;
  value: string | number;
  accent?: string;
  hint?: string;
  detail?: string;
  detailLtr?: boolean;
  note?: string;
  noteColor?: string;
}) {
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.rule}`, borderRadius: 12, padding: "11px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: TOKENS.inkSoft, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
      {/* Plain-language explanation of an acronym (MRR / ARPU / CAC). Fixed
          height so cards with and without a hint stay aligned in the grid. */}
      <div style={{ height: 15, lineHeight: "15px", margin: "2px 0 3px", fontSize: 10.5, color: TOKENS.inkFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hint ?? ""}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent ?? TOKENS.ink, lineHeight: 1 }}>{value}</div>
      <div
        dir={detailLtr ? "ltr" : undefined}
        style={{ height: 16, lineHeight: "16px", marginTop: 4, fontSize: 11, color: TOKENS.inkFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {detail ?? ""}
      </div>
      {note && (
        <div style={{ marginTop: 1, fontSize: 11, fontWeight: 600, color: noteColor ?? TOKENS.inkFaint }} dir={noteColor === TOKENS.danger ? "ltr" : undefined}>
          {note}
        </div>
      )}
    </div>
  );
}

function FunnelRow({ label, value, color, max }: { label: string; value: number; color: string; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink }}>{value}</span>
      </div>
      <div style={{ background: "#F3F4F6", borderRadius: 4, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: TOKENS.surface,
  border: `1px solid ${TOKENS.rule}`,
  borderRadius: 12,
  padding: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: TOKENS.inkSoft,
  marginBottom: 12,
  letterSpacing: 0.5,
  textTransform: "uppercase",
};

// The fixed 3/4-col KPI grids collapse to 2 columns on tablet and 1 on
// phones so the 28px values never crush together.
const OV_CSS = `
@media (max-width: 900px) {
  .ov-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .ov-two { grid-template-columns: 1fr !important; }
}
@media (max-width: 520px) {
  .ov-grid { grid-template-columns: 1fr !important; }
  .ov-att-row { grid-template-columns: 1fr !important; gap: 6px !important; }
}
`;
