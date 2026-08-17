"use client";

import { useEffect, useState } from "react";
import { useAdminContext } from "./admin-context";
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

type ByTier = { clear: number; deep: number; family: number; schools: number };

type Overview = {
  generatedAt: string;
  businessTz?: string;
  users: {
    total: number;
    byPlan: { basic: number; clear: number; deep: number };
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
    compAccounts?: number;
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
    pastDueCount: number;
    scheduledCancelCount: number;
    endedThisWeekCount: number;
    unmappedPriceCount: number;
    unmappedPriceIds: string[];
  };
  activity: {
    searchesToday: number;
    searchesWeek: number;
    searchesMonth: number;
    topWords: Array<{ word: string; lang: string; count: number }>;
    byLang: Array<{ lang: string; count: number }>;
  };
  funnel: {
    anonymousMonth: number;
    signedUpMonth: number;
    paidMonth: number;
    anonToSignup: number;
    signupToPaid: number;
  };
  geo: {
    topCountries: Array<{ code: string; count: number }>;
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
    aPastDue: "Failed payments",
    aScheduled: "Scheduled cancels",
    aEnded: "Ended this week",
    aUnmapped: "Unmapped prices",
    // existing
    funnelTitle: "Conversion funnel · 30 days",
    funnelAnonymous: "Anonymous visitors who searched",
    funnelSignedUp: "Signed up",
    funnelPaid: "Paying customers",
    funnelAnonToSignup: "Anonymous → signup",
    funnelSignupToPaid: "Signup → paid",
    topLangsTitle: "Searches by language",
    topWordsTitle: "Top searched words",
    topCountriesTitle: "Top countries",
    noActivity: "No activity yet",
    generatedAtLabel: "Updated",
    thisWeek: "this week",
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
    aPastDue: "תשלומים שנכשלו",
    aScheduled: "ביטולים מתוזמנים",
    aEnded: "הסתיימו השבוע",
    aUnmapped: "מחירים לא ממופים",
    funnelTitle: "משפך המרה · 30 ימים",
    funnelAnonymous: "אנונימיים שחיפשו",
    funnelSignedUp: "נרשמו",
    funnelPaid: "משלמים",
    funnelAnonToSignup: "אנונימי → רישום",
    funnelSignupToPaid: "רישום → תשלום",
    topLangsTitle: "חיפושים לפי שפה",
    topWordsTitle: "מילים פופולריות",
    topCountriesTitle: "מדינות מובילות",
    noActivity: "אין פעילות עדיין",
    generatedAtLabel: "עודכן",
    thisWeek: "השבוע",
    perYear: "≈ $%/שנה",
  },
} as const;

const LANG_NAMES: Record<string, string> = {
  he: "עברית", en: "English", ar: "العربية", ru: "Русский",
  es: "Español", pt: "Português", fr: "Français", de: "Deutsch",
  cs: "Čeština", sk: "Slovenčina", it: "Italiano", ja: "日本語",
};

function FlagImg({ iso2 }: { iso2: string }) {
  return (
    <img
      src={`https://flagcdn.com/40x30/${iso2.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/80x60/${iso2.toLowerCase()}.png 2x`}
      width={18}
      height={13}
      alt=""
      loading="lazy"
      style={{ borderRadius: 2, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 0 0.5px rgba(15,23,42,0.18)" }}
    />
  );
}

export default function AdminOverviewClient() {
  const { secret, lang } = useAdminContext();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const alertItems = al
    ? [
        { label: t.aPastDue, count: al.pastDueCount },
        { label: t.aScheduled, count: al.scheduledCancelCount },
        { label: t.aEnded, count: al.endedThisWeekCount },
        { label: t.aUnmapped, count: al.unmappedPriceCount },
      ].filter((x) => x.count > 0)
    : [];

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
          {/* Total monthly forecast — the headline "what I'd earn per month
              if every trial converts" (Gadi 2026-08-17): current MRR + the
              full trial pipeline. */}
          <div style={{ ...cardStyle, padding: "12px 16px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderColor: TOKENS.tealBright, background: "rgba(14,165,165,0.06)" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.inkSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>{t.totalLabel}</div>
              <div dir="ltr" style={{ fontSize: 12, color: TOKENS.inkFaint, marginTop: 3, textAlign: "start" }}>
                {t.totalSub
                  .replace("%c", money(rev.mrrUsd))
                  .replace("%t", money(rev.trialingMrrUsd))
                  .replace("%y", Math.round(rev.totalMrrUsd * 12).toLocaleString("en-US"))}
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: TOKENS.teal }} dir="ltr">{money(rev.totalMrrUsd)}</div>
          </div>

          {/* §3.1 Money triplet */}
          <SectionGrid cols={3}>
            <Kpi
              label={t.mCurrentMrr}
              value={money(rev.mrrUsd)}
              accent={TOKENS.teal}
              hint={t.hMrr}
              detail={tierBreakdown(rev.payingByTier)}
              detailLtr
              note={rev.atRiskMrrUsd > 0 ? `${money(rev.atRiskMrrUsd)} ${t.atRisk}` : undefined}
              noteColor={TOKENS.danger}
            />
            <Kpi
              label={t.mTrialMrr}
              value={money(rev.trialingMrrUsd)}
              accent={TOKENS.amber}
              hint={t.hTrialMrr}
              detail={tierBreakdown(rev.trialingByTier)}
              detailLtr
              note={t.potentialNote}
            />
            <Kpi
              label={t.mNetNew}
              value={signed(rev.netNewMrrUsd)}
              accent={rev.netNewMrrUsd < 0 ? TOKENS.danger : TOKENS.purple}
              hint={t.hNetNew}
              detail={`+${money(rev.newMrrUsd)} · −${money(rev.churnedMrrUsd)}`}
              detailLtr
            />
          </SectionGrid>

          {/* §3.2 Four operational KPIs */}
          <SectionGrid cols={4}>
            <Kpi label={t.kPaying} value={rev.payingCustomers} accent={TOKENS.ink}
                 detail={`${rev.payingSubscriptions} ${t.subs}`} detailLtr />
            <Kpi label={t.kNew} value={rev.newCustomersThisMonth} accent={TOKENS.teal} />
            <Kpi label={t.kChurn} value={`${dec.monthlyChurnPct}%`}
                 accent={dec.monthlyChurnPct > 0 ? TOKENS.danger : TOKENS.ink}
                 hint={t.hChurn}
                 detail={`${rev.churnedCustomersThisMonth} ${t.churnedThisMonth}`} />
            <Kpi label={t.kTrialing} value={rev.trialingSubscriptions} accent={TOKENS.amber}
                 detail={tierBreakdown(rev.trialingByTier)} detailLtr />
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {alertItems.map((a) => (
                  <div key={a.label} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, border: "1px solid #FCA5A5", background: "#FFFFFF", fontSize: 13, color: "#7F1D1D" }}>
                    <span style={{ fontWeight: 500 }}>{a.label}</span>
                    <span style={{ fontWeight: 700, color: TOKENS.danger }}>{a.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing operational sections kept below the money layer */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
            <Kpi label={STRINGS[lang].title === "סקירה" ? "סך משתמשים" : "Total users"} value={data.users.total} accent={TOKENS.ink} detail={`+${data.users.signupsWeek} ${t.thisWeek}`} />
            <Kpi label={lang === "he" ? "הרשמות · 7 ימים" : "Signups · 7 days"} value={data.users.signupsWeek} accent={TOKENS.teal} />
            <Kpi label={lang === "he" ? "חיפושים היום" : "Searches today"} value={data.activity.searchesToday} accent={TOKENS.ink} detail={`${data.activity.searchesWeek} ${t.thisWeek}`} />
          </div>

          <div className="ov-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t.funnelTitle}</div>
              <FunnelRow label={t.funnelAnonymous} value={data.funnel.anonymousMonth} color={TOKENS.inkFaint} max={Math.max(data.funnel.anonymousMonth, 1)} />
              <FunnelRow label={t.funnelSignedUp} value={data.funnel.signedUpMonth} color={TOKENS.tealBright} max={Math.max(data.funnel.anonymousMonth, 1)} />
              <FunnelRow label={t.funnelPaid} value={data.funnel.paidMonth} color={TOKENS.purpleBright} max={Math.max(data.funnel.anonymousMonth, 1)} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px dashed #E5E7EB" }}>
                <span style={{ fontSize: 12, color: TOKENS.inkSoft }}>{t.funnelAnonToSignup}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink }}>{data.funnel.anonToSignup}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: TOKENS.inkSoft }}>{t.funnelSignupToPaid}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink }}>{data.funnel.signupToPaid}%</span>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t.topLangsTitle}</div>
              {data.activity.byLang.length === 0 ? (
                <div style={{ color: TOKENS.inkFaint, fontSize: 13, padding: "12px 0" }}>{t.noActivity}</div>
              ) : (
                <div>
                  {data.activity.byLang.slice(0, 8).map((row) => {
                    const max = data.activity.byLang[0].count;
                    const pct = (row.count / max) * 100;
                    return (
                      <div key={row.lang} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: "#374151" }}>{LANG_NAMES[row.lang] ?? row.lang}</span>
                          <span style={{ fontSize: 13, color: TOKENS.inkSoft }}>{row.count}</span>
                        </div>
                        <div style={{ background: "#F3F4F6", borderRadius: 4, height: 6, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: TOKENS.tealBright }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: 14 }}>
            <div style={sectionTitleStyle}>{t.topWordsTitle}</div>
            {data.activity.topWords.length === 0 ? (
              <div style={{ color: TOKENS.inkFaint, fontSize: 13, padding: "12px 0" }}>{t.noActivity}</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                {data.activity.topWords.map((w, i) => (
                  <div key={`${w.lang}_${w.word}_${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: TOKENS.bg, borderRadius: 6, fontSize: 13 }}>
                    <span>
                      <span style={{ color: TOKENS.inkFaint, marginInlineEnd: 8 }}>#{i + 1}</span>
                      <span style={{ fontWeight: 500, color: TOKENS.ink }}>{w.word}</span>
                      <span style={{ color: TOKENS.inkFaint, marginInlineStart: 6, fontSize: 11 }}>{w.lang}</span>
                    </span>
                    <span style={{ color: TOKENS.inkSoft, fontWeight: 600 }}>{w.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {data.geo.topCountries.length > 0 && (
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>{t.topCountriesTitle}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data.geo.topCountries.map(({ code, count }) => (
                  <div key={code} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, border: "1px solid #E5E7EB", background: "#FFFFFF", fontSize: 13, color: "#374151" }}>
                    {code === "?" ? <span>🌐</span> : <FlagImg iso2={code} />}
                    <span style={{ fontWeight: 500 }}>{code}</span>
                    <span style={{ color: TOKENS.inkFaint }}>·</span>
                    <span style={{ color: TOKENS.inkSoft }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <style>{OV_CSS}</style>
    </>
  );
}

// Paying subscribers by real tier, brand-order, non-zero only.
function tierBreakdown(t?: ByTier): string {
  if (!t) return "";
  const parts: string[] = [];
  if (t.clear)   parts.push(`${t.clear} Clear`);
  if (t.deep)    parts.push(`${t.deep} Deep`);
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
}
`;
