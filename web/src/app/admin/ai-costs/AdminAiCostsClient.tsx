"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminContext } from "../admin-context";
import { CATEGORY_LABEL } from "@/lib/internal-accounts";

/**
 * Admin — Engine cost breakdown (OpenAI plus the Gemini Hebrew voice).
 *
 * Answers the question the providers' own dashboards can't: WHICH product feature
 * burned the money. Reads /api/admin/ai-costs (the aiUsage daily rollups).
 * The feature table is the decision surface — e.g. it shows what the Reader
 * "understand every word" taps actually cost, to price them if needed.
 */

type Bucket = { key: string; cost: number; calls: number; tokensIn?: number; tokensOut?: number; images?: number };
type Series = { day: string; cost: number; calls: number };
type Payload = {
  generatedAt: string;
  windowDays: number;
  daysWithData: number;
  totalCost: number;
  totalCalls: number;
  avgPerDay: number;
  features: Bucket[];
  models: Bucket[];
  plans: Bucket[];
  series: Series[];
  /** The price table the costs were estimated from (lib/ai-cost.ts). */
  pricing?: { chat?: Record<string, { in: number; out: number }>; image?: Record<string, number> };
};

const TEAL = "#0EA5A5";
const INK = "#111827";
const MUTED = "#6B7280";
const RULE = "#E5E7EB";
const SOFT = "#F3F4F6";

const FEATURE_LABELS: Record<string, { he: string; en: string; note?: { he: string; en: string } }> = {
  define: { he: "הגדרה מלאה", en: "Full definition", note: { he: "gpt-4o, המנוע היקר", en: "gpt-4o, the costly model" } },
  define_context: { he: "הגדרה לפי הקשר", en: "Definition in context", note: { he: "חיפוש עם משפט", en: "search with a sentence" } },
  define_retry: { he: "ניסיון חוזר (הגדרה)", en: "Definition retry", note: { he: "מילה קשה נשלחת שוב", en: "hard word re-sent" } },
  reader_word_tap: { he: "לחיצה על מילה (קורא)", en: "Word tap (Reader)", note: { he: "פיצ'ר כל מילה, לא נשמר במטמון קבוע", en: "every-word feature, not in the permanent cache" } },
  quick_define: { he: "תצוגה מקדימה", en: "Quick preview" },
  quick_define_miss: { he: "תצוגה מקדימה (לא במטמון)", en: "Quick preview (miss)" },
  reader_sentence: { he: "הבנת משפט (קורא)", en: "Sentence (Reader)" },
  image: { he: "תמונה", en: "Image", note: { he: "gpt-image-2.5-flare", en: "gpt-image-2.5-flare" } },
  image_kids: { he: "תמונה (מצב ילדים)", en: "Image (Kids Mode)", note: { he: "מטמון נפרד = חיוב כפול לאותה מילה", en: "separate cache = double bill per word" } },
  image_brief: { he: "תיאור לתמונה", en: "Image brief" },
  tashkeel_arabic: { he: "ניקוד ערבי", en: "Arabic tashkeel", note: { he: "gpt-4o", en: "gpt-4o" } },
  backfill_gloss: { he: "השלמת תרגום", en: "Gloss backfill" },
  etymology_fallback: { he: "אטימולוגיה (גיבוי)", en: "Etymology fallback", note: { he: "מקור המילה נשלח שוב", en: "origin re-asked" } },
  quick_define_kids: { he: "תצוגה מקדימה (ילדים)", en: "Quick preview (Kids)" },
  tts_he: { he: "הקראה בעברית", en: "Hebrew read-aloud", note: { he: "Gemini", en: "Gemini" } },
  word_idioms: { he: "ניבים וביטויים", en: "Idioms" },
  word_question: { he: "שאלות על מילה", en: "Word questions" },
  spell_set: { he: "תרגול כתיב", en: "Spelling set" },
  spell_set_list: { he: "רשימת כתיב", en: "Spelling list" },
  play_pairs: { he: "משחק זוגות", en: "Pairs game" },
  passage_words: { he: "מילים מטקסט", en: "Passage words" },
  image_classroom: { he: "תמונה (כיתה)", en: "Image (classroom)" },
  curriculum_set: { he: "סט מתוכנית לימודים", en: "Curriculum set" },
  class_activity: { he: "פעילות כיתתית", en: "Class activity" },
  seo_vet: { he: "בדיקת מילים (אדמין)", en: "Word vetting (admin)" },
};

/** Plan keys as logged at call time, shown as the four customer categories.
 *  Legacy "clear" is Individual. "deep" is logged by Individual, Family and
 *  Schools alike, so that row can only be named as all three. */
const PLAN_LABELS: Record<string, { he: string; en: string }> = {
  basic: { he: CATEGORY_LABEL.basic, en: CATEGORY_LABEL.basic },
  clear: { he: CATEGORY_LABEL.individual, en: CATEGORY_LABEL.individual },
  deep: {
    he: `${CATEGORY_LABEL.individual}, ${CATEGORY_LABEL.family}, ${CATEGORY_LABEL.schools}`,
    en: `${CATEGORY_LABEL.individual}, ${CATEGORY_LABEL.family}, ${CATEGORY_LABEL.schools}`,
  },
  family: { he: CATEGORY_LABEL.family, en: CATEGORY_LABEL.family },
  schools: { he: CATEGORY_LABEL.schools, en: CATEGORY_LABEL.schools },
  admin: { he: "כלי אדמין", en: "Admin tools" },
  anon: { he: "אנונימי", en: "anonymous" },
  unknown: { he: "לא ידוע", en: "Unknown" },
};

function usd(n: number): string {
  if (n >= 100) return "$" + n.toFixed(0);
  if (n >= 1) return "$" + n.toFixed(2);
  if (n >= 0.01) return "$" + n.toFixed(3);
  return "$" + n.toFixed(4);
}
function num(n: number): string {
  return n.toLocaleString("en-US");
}

export default function AdminAiCostsClient() {
  const { secret, lang } = useAdminContext();
  const he = lang === "he";
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    fetch(`/api/admin/ai-costs?secret=${encodeURIComponent(secret)}&days=${days}`)
      .then((r) => (r.ok ? r.json() : r.json().then((j) => Promise.reject(j.error || r.status))))
      .then((j: Payload) => { if (alive) { setData(j); setLoading(false); } })
      .catch((e) => { if (alive) { setErr(String(e)); setLoading(false); } });
    return () => { alive = false; };
  }, [secret, days]);

  const maxDay = useMemo(() => Math.max(1, ...(data?.series ?? []).map((s) => s.cost)), [data]);
  const projMonthly = (data?.avgPerDay ?? 0) * 30;

  const t = (o: { he: string; en: string }) => (he ? o.he : o.en);
  const featLabel = (k: string) => FEATURE_LABELS[k] ?? { he: k, en: k };
  const planLabel = (k: string) => PLAN_LABELS[k] ?? { he: k, en: k };

  // Footer price list, from the table the API estimated with.
  const chatPrices = Object.entries(data?.pricing?.chat ?? {});
  const imagePrices = Object.entries(data?.pricing?.image ?? {});

  return (
    <div dir={he ? "rtl" : "ltr"} style={{ color: INK, fontFamily: "inherit" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
          {he ? "עלויות מנוע" : "Engine costs"}
        </h1>
        <div style={{ display: "flex", gap: 6 }}>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                border: `1px solid ${days === d ? TEAL : RULE}`,
                background: days === d ? "rgba(14,165,165,0.10)" : "white",
                color: days === d ? TEAL : MUTED,
                fontWeight: 700, fontSize: 13, padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              }}
            >
              {he ? `${d} ימים` : `${d}d`}
            </button>
          ))}
        </div>
      </div>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: MUTED }}>
        {he
          ? "מאיפה בדיוק הלך הכסף על המנוע (OpenAI ו-Gemini), מפורק לפי פיצ'ר. המספרים מוערכים ממחירון קבוע (ראו תחתית) לצורך שיוך יחסי."
          : "Exactly where engine spend (OpenAI and Gemini) went, split by feature. Figures are estimated from a fixed price table (see footer) for relative attribution."}
      </p>

      {loading && <div style={{ color: MUTED, fontSize: 14 }}>{he ? "טוען..." : "Loading..."}</div>}
      {err && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FBD5D5", color: "#B91C1C", borderRadius: 10, padding: 14, fontSize: 14 }}>
          {he ? "שגיאה בטעינה: " : "Load error: "}{err}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Summary triplet */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 22 }}>
            <Stat label={he ? `סה"כ ב-${data.daysWithData} ימים` : `Total, ${data.daysWithData}d`} value={usd(data.totalCost)} accent />
            <Stat label={he ? "ממוצע ליום" : "Avg / day"} value={usd(data.avgPerDay)} />
            <Stat label={he ? "תחזית חודשית" : "Projected / mo"} value={usd(projMonthly)} sub={he ? "ממוצע × 30" : "avg × 30"} />
            <Stat label={he ? "קריאות" : "Calls"} value={num(data.totalCalls)} />
          </div>

          {/* Per-day chart */}
          {data.series.length > 0 && (
            <Card title={he ? "עלות יומית" : "Daily cost"}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120, overflowX: "auto", paddingTop: 8 }}>
                {data.series.map((s) => (
                  <div key={s.day} title={`${s.day}: ${usd(s.cost)}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 14 }}>
                    <div style={{ width: 14, height: Math.max(2, Math.round((s.cost / maxDay) * 100)), background: TEAL, borderRadius: "3px 3px 0 0", opacity: 0.85 }} />
                    <span style={{ fontSize: 9, color: MUTED, whiteSpace: "nowrap", transform: "rotate(-45deg)", transformOrigin: "center", marginTop: 6 }}>
                      {s.day.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* FEATURE breakdown — the decision table */}
          <Card title={he ? "לפי פיצ'ר (החשוב ביותר)" : "By feature (the one that matters)"}>
            <BreakdownTable
              rows={data.features}
              total={data.totalCost}
              he={he}
              labelFor={(k) => t(featLabel(k))}
              isKnown={(k) => k in FEATURE_LABELS}
              noteFor={(k) => { const n = featLabel(k).note; return n ? t(n) : ""; }}
              showUnits
            />
          </Card>

          {/* MODEL breakdown — cross-checks against OpenAI's own dashboard */}
          <Card title={he ? "לפי מודל (להשוואה מול לוחות הספקים)" : "By model (cross-check vs the providers)"}>
            <BreakdownTable rows={data.models} total={data.totalCost} he={he} labelFor={(k) => k} />
          </Card>

          {/* PLAN breakdown — who generates the cost */}
          <Card title={he ? "לפי תוכנית (מי מייצר את העלות)" : "By plan (who drives cost)"}>
            <BreakdownTable rows={data.plans} total={data.totalCost} he={he} labelFor={(k) => t(planLabel(k))} isKnown={(k) => k in PLAN_LABELS} />
          </Card>

          <div style={{ fontSize: 12, color: MUTED, marginTop: 18, lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {he ? "מחירון מוערך (lib/ai-cost.ts):" : "Estimated prices (lib/ai-cost.ts):"}
            </div>
            {chatPrices.length === 0 && imagePrices.length === 0 ? (
              <div>{he ? "המחירון לא הוחזר מהשרת." : "The server returned no price table."}</div>
            ) : (
              <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                {chatPrices.map(([model, p]) => (
                  <li key={model}>
                    <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{model}</span>
                    {": "}
                    <span dir="ltr" style={{ unicodeBidi: "isolate" }}>${p.in} / ${p.out}</span>
                    {he ? " לכל מיליון טוקן (קלט / פלט)" : " per 1M tokens (in / out)"}
                  </li>
                ))}
                {imagePrices.map(([quality, cost]) => (
                  <li key={quality}>
                    {he ? "תמונה" : "Image"} ({quality}): <span dir="ltr" style={{ unicodeBidi: "isolate" }}>~${cost}</span>
                    {he ? " לתמונה" : " per image"}
                  </li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: 4 }}>
              {he
                ? "עלויות נרשמות רק על קריאה אמיתית למנוע, לא על תוצאה מהמטמון. כשספק משנה מחירים, מעדכנים את המחירון ב-lib/ai-cost.ts."
                : "Only real engine calls are logged, never cache hits. Update the table in lib/ai-cost.ts when a provider changes prices."}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: "white", border: `1px solid ${accent ? TEAL : RULE}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 12.5, color: MUTED, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent ? TEAL : INK, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: `1px solid ${RULE}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: INK, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function BreakdownTable({
  rows, total, he, labelFor, isKnown, noteFor, showUnits,
}: {
  rows: Bucket[];
  total: number;
  he: boolean;
  labelFor: (k: string) => string;
  /** False for a key with no label yet: it shows raw and muted. */
  isKnown?: (k: string) => boolean;
  noteFor?: (k: string) => string;
  showUnits?: boolean;
}) {
  if (!rows.length) return <div style={{ color: MUTED, fontSize: 13 }}>{he ? "אין נתונים עדיין. הנתונים מצטברים מרגע הפריסה." : "No data yet. Collection starts at deploy."}</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {rows.map((r) => {
        const pct = total > 0 ? (r.cost / total) * 100 : 0;
        const perCall = r.calls > 0 ? r.cost / r.calls : 0;
        const units = (r.images ?? 0) > 0
          ? (he ? `${num(r.images ?? 0)} תמונות` : `${num(r.images ?? 0)} images`)
          : ((r.tokensIn ?? 0) + (r.tokensOut ?? 0) > 0
              ? (he ? `${num((r.tokensIn ?? 0) + (r.tokensOut ?? 0))} טוקנים` : `${num((r.tokensIn ?? 0) + (r.tokensOut ?? 0))} tokens`)
              : "");
        return (
          <div key={r.key} style={{ padding: "9px 4px", borderBottom: `1px solid ${SOFT}` }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                {isKnown && !isKnown(r.key) ? (
                  <span dir="ltr" title={he ? "מפתח ללא תווית" : "unlabelled key"} style={{ fontSize: 13, fontWeight: 600, color: MUTED, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", unicodeBidi: "isolate" }}>{r.key}</span>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{labelFor(r.key)}</span>
                )}
                {noteFor && noteFor(r.key) && (
                  <span style={{ fontSize: 11.5, color: MUTED, marginInlineStart: 8 }}>{noteFor(r.key)}</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: INK, fontVariantNumeric: "tabular-nums" }}>{usd(r.cost)}</span>
                <span style={{ fontSize: 12, color: MUTED, fontVariantNumeric: "tabular-nums", minWidth: 42, textAlign: he ? "left" : "right" }}>{pct.toFixed(1)}%</span>
              </div>
            </div>
            <div style={{ height: 5, background: SOFT, borderRadius: 999, marginTop: 6, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: TEAL, borderRadius: 999 }} />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 5, fontSize: 11.5, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
              <span>{he ? "קריאות: " : "calls: "}{num(r.calls)}</span>
              <span>{he ? "לקריאה: " : "per call: "}{usd(perCall)}</span>
              {showUnits && units && <span>{units}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
