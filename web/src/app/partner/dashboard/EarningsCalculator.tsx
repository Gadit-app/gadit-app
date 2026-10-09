"use client";

import { useState } from "react";

/**
 * Partner earnings calculator (Gadi 2026-10-09): how much a partner can earn
 * from a mix of referred Families, Individuals and Schools, with the
 * partner's OWN rates (year one, then for life). Pure arithmetic on list
 * prices, an estimate only; commissions are really paid on each actual
 * payment (see lib/partners.ts).
 *
 * Prices per month: Family ₪19.90 / $5.99, Individual ₪14.90 / $3.99.
 * Schools: Israel is billed per school year by tax invoice (₪3,950 / ₪6,950 /
 * ₪9,950 including VAT, so the partner's share is on the pre-VAT amount);
 * elsewhere monthly in USD ($97 / $297 / $497).
 */

type Cur = "ILS" | "USD";
type Size = "s" | "m" | "l";

const VAT = 1.18;
const PRICES = {
  ILS: { family: 19.9, individual: 14.9, school: { s: 3950 / VAT / 12, m: 6950 / VAT / 12, l: 9950 / VAT / 12 } },
  USD: { family: 5.99, individual: 3.99, school: { s: 97, m: 297, l: 497 } },
} as const;

const COPY = {
  he: {
    title: "מחשבון הכנסות",
    hint: "כמה תרוויחו לפי מספר המנויים שיגיעו דרככם. החישוב לפי אחוזי העמלה שלכם.",
    families: "משפחות",
    familiesSub: "מנוי Family ב-₪19.90 לחודש",
    familiesSubUsd: "מנוי Family ב-$5.99 לחודש",
    individuals: "יחידים",
    individualsSub: "מנוי Individual ב-₪14.90 לחודש",
    individualsSubUsd: "מנוי Individual ב-$3.99 לחודש",
    schools: "בתי ספר",
    schoolsSub: "מנוי שנתי לבית ספר",
    sizeS: "עד 100 תלמידים",
    sizeM: "101 עד 500",
    sizeL: "501 עד 1,000",
    currency: "מטבע",
    yearOne: "בשנה הראשונה",
    later: "מהשנה השנייה והלאה",
    perMonth: "לחודש",
    perYear: "לשנה",
    note: "הערכה בלבד, לפי מחירי המחירון. העמלה משולמת על כל תשלום אמיתי של לקוח שהגיע דרככם. בבתי ספר בישראל העמלה לפי הסכום לפני מע״מ.",
    minus: "פחות",
    plus: "עוד",
  },
  en: {
    title: "Earnings calculator",
    hint: "See what you can earn from the subscribers who join through you, at your own commission rates.",
    families: "Families",
    familiesSub: "Family, ₪19.90 a month",
    familiesSubUsd: "Family, $5.99 a month",
    individuals: "Individuals",
    individualsSub: "Individual, ₪14.90 a month",
    individualsSubUsd: "Individual, $3.99 a month",
    schools: "Schools",
    schoolsSub: "School subscription",
    sizeS: "Up to 100 students",
    sizeM: "101 to 500",
    sizeL: "501 to 1,000",
    currency: "Currency",
    yearOne: "In the first year",
    later: "From year two on",
    perMonth: "a month",
    perYear: "a year",
    note: "An estimate at list prices. Commission is paid on every real payment by a customer who joined through you. For schools in Israel, commission is on the amount before VAT.",
    minus: "Less",
    plus: "More",
  },
};

function fmt(n: number, cur: Cur): string {
  const v = Math.round(n);
  return cur === "ILS" ? `₪${v.toLocaleString("en-US")}` : `$${v.toLocaleString("en-US")}`;
}

function Stepper({ value, onChange, labelMinus, labelPlus }: { value: number; onChange: (v: number) => void; labelMinus: string; labelPlus: string }) {
  const btn: React.CSSProperties = { width: 34, height: 34, borderRadius: 999, border: "1px solid #D1D5DB", background: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", lineHeight: 1, color: "#111827" };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }} dir="ltr">
      <button type="button" aria-label={labelMinus} style={btn} onClick={() => onChange(Math.max(0, value - 1))}>−</button>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(100000, Math.floor(Number(e.target.value) || 0))))}
        style={{ width: 64, textAlign: "center", fontSize: 16, fontWeight: 700, padding: "6px 4px", borderRadius: 8, border: "1px solid #D1D5DB", fontFamily: "inherit" }}
      />
      <button type="button" aria-label={labelPlus} style={btn} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export function EarningsCalculator({ lang, rateYearOne, rateLifetime }: { lang: string; rateYearOne: number; rateLifetime: number }) {
  const t = lang === "he" ? COPY.he : COPY.en;
  const [cur, setCur] = useState<Cur>(lang === "he" ? "ILS" : "USD");
  const [families, setFamilies] = useState(10);
  const [individuals, setIndividuals] = useState(10);
  const [schools, setSchools] = useState(1);
  const [size, setSize] = useState<Size>("m");

  const p = PRICES[cur];
  const gross = families * p.family + individuals * p.individual + schools * p.school[size];
  const y1Month = gross * rateYearOne;
  const laterMonth = gross * rateLifetime;

  const row: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid #F1F3F5", flexWrap: "wrap" };
  const name: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: "#111827" };
  const sub: React.CSSProperties = { fontSize: 12.5, color: "#6B7280", marginTop: 2 };
  const box: React.CSSProperties = { flex: "1 1 200px", borderRadius: 14, padding: "14px 16px", minWidth: 0 };
  const big: React.CSSProperties = { fontSize: 26, fontWeight: 800, letterSpacing: -0.5 };

  return (
    <div style={{ background: "#fff", border: "1px solid #E9ECEF", borderRadius: 16, padding: 22, boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", letterSpacing: 0.4, textTransform: "uppercase" }}>{t.title}</div>
        <div role="radiogroup" aria-label={t.currency} style={{ display: "inline-flex", border: "1px solid #D1D5DB", borderRadius: 999, overflow: "hidden" }}>
          {(["ILS", "USD"] as Cur[]).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={cur === c}
              onClick={() => setCur(c)}
              style={{ padding: "6px 14px", border: 0, cursor: "pointer", fontWeight: 700, fontSize: 13.5, fontFamily: "inherit", background: cur === c ? "#0EA5A5" : "#fff", color: cur === c ? "#fff" : "#374151" }}
            >
              {c === "ILS" ? "₪" : "$"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: "#6B7280", margin: "8px 0 6px", lineHeight: 1.5 }}>{t.hint}</div>

      <div style={row}>
        <div>
          <div style={name}>{t.families}</div>
          <div style={sub}>{cur === "ILS" ? t.familiesSub : t.familiesSubUsd}</div>
        </div>
        <Stepper value={families} onChange={setFamilies} labelMinus={t.minus} labelPlus={t.plus} />
      </div>
      <div style={row}>
        <div>
          <div style={name}>{t.individuals}</div>
          <div style={sub}>{cur === "ILS" ? t.individualsSub : t.individualsSubUsd}</div>
        </div>
        <Stepper value={individuals} onChange={setIndividuals} labelMinus={t.minus} labelPlus={t.plus} />
      </div>
      <div style={{ ...row, borderBottom: 0 }}>
        <div>
          <div style={name}>{t.schools}</div>
          <div style={sub}>{t.schoolsSub}</div>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as Size)}
            style={{ marginTop: 8, fontSize: 13.5, padding: "5px 8px", borderRadius: 8, border: "1px solid #D1D5DB", background: "#fff", fontFamily: "inherit" }}
          >
            <option value="s">{t.sizeS}</option>
            <option value="m">{t.sizeM}</option>
            <option value="l">{t.sizeL}</option>
          </select>
        </div>
        <Stepper value={schools} onChange={setSchools} labelMinus={t.minus} labelPlus={t.plus} />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
        <div style={{ ...box, background: "#E8F6F6" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0b7d7d" }}>{t.yearOne} · {Math.round(rateYearOne * 100)}%</div>
          <div style={{ ...big, color: "#0b7d7d" }} dir="ltr">{fmt(y1Month, cur)}</div>
          <div style={{ fontSize: 13, color: "#0b7d7d" }}>{t.perMonth} · <span dir="ltr">{fmt(y1Month * 12, cur)}</span> {t.perYear}</div>
        </div>
        <div style={{ ...box, background: "#F5F1FF" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#6D28D9" }}>{t.later} · {Math.round(rateLifetime * 100)}%</div>
          <div style={{ ...big, color: "#6D28D9" }} dir="ltr">{fmt(laterMonth, cur)}</div>
          <div style={{ fontSize: 13, color: "#6D28D9" }}>{t.perMonth} · <span dir="ltr">{fmt(laterMonth * 12, cur)}</span> {t.perYear}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 12, lineHeight: 1.55 }}>{t.note}</div>
    </div>
  );
}
