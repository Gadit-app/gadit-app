"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminContext } from "../admin-context";

/**
 * /admin/partners — run the in-house partner (affiliate) program.
 *
 * Add partners by hand with custom per-partner rates (like Yooniz), or let
 * them self-signup at /partners. Each card shows clicks / signups / paying
 * customers and an earnings breakdown by currency; the payable balance is
 * each currency's `released` bucket (held 30 days, not yet paid). Actions:
 * mark paid (the monthly payout), promote to founder, set rates, suspend,
 * copy the referral / dashboard links, and re-send the welcome email.
 */

type Bucket = { pending: number; released: number; paid: number };
type Row = {
  id: string;
  code: string;
  name: string;
  email: string;
  tier: "standard" | "founder";
  rateYearOne: number;
  rateLifetime: number;
  status: "active" | "suspended";
  clicks: number;
  signups: number;
  payingCustomers: number;
  commissionCount: number;
  earnings: Record<string, Bucket>;
  dashboardUrl: string;
  createdAt: string;
};

const T = {
  en: {
    title: "Partners",
    sub: "In-house affiliate program. Payable = released earnings held 30 days, not yet paid.",
    none: "No partners yet. Add one below, or share /partners for self-signup.",
    loading: "Loading…",
    addTitle: "Add a partner",
    fName: "Full name",
    fEmail: "Email",
    fCode: "Code (optional)",
    fY1: "Year 1 %",
    fLife: "Lifetime %",
    fSend: "Email them the link",
    fCreate: "Create partner",
    creating: "Creating…",
    created: "Created ✓",
    errEmail: "Enter a valid email.",
    errExists: "A partner with that email or code already exists.",
    errGeneric: "Couldn't create. Try again.",
    rate: "Rate",
    funnel: "Clicks / Signups / Paying",
    payable: "Payable (owed)",
    pending: "Pending",
    paidTotal: "Paid to date",
    standard: "Standard",
    founder: "Founder",
    promote: "Make founder",
    demote: "Make standard",
    suspend: "Suspend",
    activate: "Activate",
    markPaid: "Mark payable as paid",
    copyRef: "Copy referral link",
    copyDash: "Copy portal link",
    resend: "Resend email",
    copied: "Copied ✓",
    sent: "Sent ✓",
    confirmPaid: "Mark all released (payable) commissions as PAID for this partner? This records that you've sent the money.",
    suspended: "Suspended",
  },
  he: {
    title: "שותפים",
    sub: "תוכנית שותפים עצמאית. לתשלום = רווחים ששוחררו אחרי 30 יום ועדיין לא שולמו.",
    none: "עדיין אין שותפים. הוסיפו אחד למטה, או שתפו את /partners להרשמה עצמית.",
    loading: "טוען…",
    addTitle: "הוספת שותף",
    fName: "שם מלא",
    fEmail: "אימייל",
    fCode: "קוד (רשות)",
    fY1: "% שנה א׳",
    fLife: "% לכל החיים",
    fSend: "שליחת הקישור אליו במייל",
    fCreate: "יצירת שותף",
    creating: "יוצר…",
    created: "נוצר ✓",
    errEmail: "הזינו אימייל תקין.",
    errExists: "כבר קיים שותף עם האימייל או הקוד הזה.",
    errGeneric: "היצירה נכשלה. נסו שוב.",
    rate: "אחוז",
    funnel: "קליקים / נרשמו / משלמים",
    payable: "לתשלום (חוב)",
    pending: "בהמתנה",
    paidTotal: "שולם עד היום",
    standard: "רגיל",
    founder: "מייסד",
    promote: "הפוך למייסד",
    demote: "הפוך לרגיל",
    suspend: "השהה",
    activate: "הפעל",
    markPaid: "סמן חוב כשולם",
    copyRef: "העתק קישור שיווק",
    copyDash: "העתק קישור פורטל",
    resend: "שלח מייל שוב",
    copied: "הועתק ✓",
    sent: "נשלח ✓",
    confirmPaid: "לסמן את כל העמלות ששוחררו (לתשלום) של השותף הזה כשולמו? זה התיעוד שהעברת את הכסף.",
    suspended: "מושהה",
  },
};

const CUR_SYMBOL: Record<string, string> = { ils: "₪", usd: "$", eur: "€", gbp: "£" };
function money(minor: number, currency: string): string {
  const sym = CUR_SYMBOL[currency] ?? currency.toUpperCase() + " ";
  return `${sym}${(minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function sumBuckets(e: Record<string, Bucket>, key: keyof Bucket): { cur: string; val: number }[] {
  return Object.entries(e).map(([cur, b]) => ({ cur, val: b[key] })).filter((x) => x.val > 0);
}
function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function AdminPartnersClient() {
  const { secret, lang } = useAdminContext();
  const t = T[lang];
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null); // `${id}:${kind}`

  // Add-partner form
  const [fName, setFName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fCode, setFCode] = useState("");
  const [fY1, setFY1] = useState("25");
  const [fLife, setFLife] = useState("10");
  const [fSend, setFSend] = useState(true);
  const [addState, setAddState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [addErr, setAddErr] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/partners?secret=${encodeURIComponent(secret)}`);
    if (res.ok) setRows((await res.json()).partners ?? []);
  }, [secret]);

  useEffect(() => { void load(); }, [load]);

  async function createPartner(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(fEmail)) { setAddErr(t.errEmail); setAddState("error"); return; }
    setAddState("sending"); setAddErr("");
    try {
      const res = await fetch(`/api/admin/partners?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fName, email: fEmail, code: fCode,
          rateYearOne: fY1, rateLifetime: fLife,
          sendEmail: fSend, lang,
        }),
      });
      if (res.status === 409) { setAddErr(t.errExists); setAddState("error"); return; }
      if (!res.ok) { setAddErr(t.errGeneric); setAddState("error"); return; }
      setAddState("done");
      setFName(""); setFEmail(""); setFCode(""); setFY1("25"); setFLife("10");
      await load();
      setTimeout(() => setAddState("idle"), 1600);
    } catch {
      setAddErr(t.errGeneric); setAddState("error");
    }
  }

  async function act(partnerId: string, action: string) {
    if (action === "markPaid" && !window.confirm(t.confirmPaid)) return;
    setBusy(partnerId + action);
    try {
      await fetch(`/api/admin/partners?secret=${encodeURIComponent(secret)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, action, lang }),
      });
      if (action === "resendEmail") { setFlash(partnerId + ":sent"); setTimeout(() => setFlash(null), 1600); }
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFlash(key);
      setTimeout(() => setFlash(null), 1600);
    } catch { /* ignore */ }
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#111827" }}>{t.title}</h1>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6B7280" }}>{t.sub}</p>

      {/* Add-partner form */}
      <form onSubmit={createPartner} style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{t.addTitle}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 0.9fr 0.7fr 0.7fr", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input style={input} placeholder={t.fName} value={fName} onChange={(e) => setFName(e.target.value)} />
          <input style={input} type="email" placeholder={t.fEmail} value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
          <input style={{ ...input, direction: "ltr" }} placeholder={t.fCode} value={fCode} onChange={(e) => setFCode(e.target.value)} />
          <input style={input} inputMode="numeric" title={t.fY1} placeholder={t.fY1} value={fY1} onChange={(e) => setFY1(e.target.value)} />
          <input style={input} inputMode="numeric" title={t.fLife} placeholder={t.fLife} value={fLife} onChange={(e) => setFLife(e.target.value)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#374151", cursor: "pointer" }}>
            <input type="checkbox" checked={fSend} onChange={(e) => setFSend(e.target.checked)} />
            {t.fSend}
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {addState === "error" && <span style={{ color: "#991B1B", fontSize: 13 }}>{addErr}</span>}
            {addState === "done" && <span style={{ color: "#0b7d7d", fontSize: 13, fontWeight: 700 }}>{t.created}</span>}
            <button type="submit" style={btnPrimary} disabled={addState === "sending"}>
              {addState === "sending" ? t.creating : t.fCreate}
            </button>
          </div>
        </div>
      </form>

      {rows === null && <div style={{ color: "#6B7280" }}>{t.loading}</div>}
      {rows !== null && rows.length === 0 && <div style={{ color: "#6B7280" }}>{t.none}</div>}

      {rows !== null && rows.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((r) => {
            const payable = sumBuckets(r.earnings, "released");
            const pending = sumBuckets(r.earnings, "pending");
            const paid = sumBuckets(r.earnings, "paid");
            const refLink = `https://www.gadit.app/p/${r.code}`;
            return (
              <div key={r.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{r.name || r.email}</span>
                      <span style={{ ...pill, ...(r.tier === "founder" ? pillFounder : pillStd) }}>
                        {r.tier === "founder" ? t.founder : t.standard}
                      </span>
                      {r.status === "suspended" && <span style={{ ...pill, background: "#FEE2E2", color: "#991B1B" }}>{t.suspended}</span>}
                      <span style={{ ...pill, background: "#F3F4F6", color: "#374151", direction: "ltr" }}>{r.code}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 4 }}>{r.email}</div>
                    <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 2, direction: "ltr", textAlign: "start" }}>
                      {t.rate}: {Math.round(r.rateYearOne * 100)}% · {Math.round(r.rateLifetime * 100)}%
                    </div>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{t.funnel}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", direction: "ltr" }}>
                      {r.clicks} / {r.signups} / {r.payingCustomers}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 12, paddingTop: 12, borderTop: "1px solid #F3F4F6" }}>
                  <Money label={t.payable} items={payable} strong />
                  <Money label={t.pending} items={pending} />
                  <Money label={t.paidTotal} items={paid} />
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  {payable.length > 0 && (
                    <button style={btnPrimary} disabled={busy === r.id + "markPaid"} onClick={() => act(r.id, "markPaid")}>{t.markPaid}</button>
                  )}
                  {r.tier === "standard"
                    ? <button style={btn} onClick={() => act(r.id, "promote")}>{t.promote}</button>
                    : <button style={btn} onClick={() => act(r.id, "demote")}>{t.demote}</button>}
                  {r.status === "active"
                    ? <button style={btn} onClick={() => act(r.id, "suspend")}>{t.suspend}</button>
                    : <button style={btn} onClick={() => act(r.id, "activate")}>{t.activate}</button>}
                  <button style={btn} onClick={() => copy(refLink, r.id + ":ref")}>{flash === r.id + ":ref" ? t.copied : t.copyRef}</button>
                  <button style={btn} onClick={() => copy(r.dashboardUrl, r.id + ":dash")}>{flash === r.id + ":dash" ? t.copied : t.copyDash}</button>
                  <button style={btn} disabled={busy === r.id + "resendEmail"} onClick={() => act(r.id, "resendEmail")}>
                    {flash === r.id + ":sent" ? t.sent : t.resend}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Money({ label, items, strong }: { label: string; items: { cur: string; val: number }[]; strong?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: strong ? 18 : 15, fontWeight: strong ? 800 : 600, color: strong ? "#0EA5A5" : "#374151", direction: "ltr", textAlign: "start" }}>
        {items.length === 0 ? "—" : items.map((x) => money(x.val, x.cur)).join(" · ")}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 18 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "inherit", outline: "none" };
const pill: React.CSSProperties = { fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 };
const pillStd: React.CSSProperties = { background: "rgba(14,165,165,0.12)", color: "#0b7d7d" };
const pillFounder: React.CSSProperties = { background: "rgba(124,58,237,0.12)", color: "#6D28D9" };
const btn: React.CSSProperties = { background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnPrimary: React.CSSProperties = { background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
