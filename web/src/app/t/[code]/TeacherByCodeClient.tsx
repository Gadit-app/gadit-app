"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import {
  computeClassroomInsights,
  classroomLangLabel,
  type RawSearch,
} from "@/lib/classroom-insights";

/**
 * Read-only, no-login teacher view for one classroom, reached by the
 * class code. Reuses the shared computeClassroomInsights helper so it
 * shows exactly what the principal-authed /classroom/[id] view shows for
 * that class: language map, stuck words, total, private support signal.
 */

type ApiResponse = {
  name?: string;
  searchCount?: number;
  searches?: Array<{ word: string; language?: string; studentName?: string }>;
};

type Copy = {
  title: string;
  loading: string;
  notFound: string;
  basedOn: (n: number) => string;
  totalLabel: string;
  totalAllTime: string;
  langMapTitle: string;
  langMapSub: string;
  notEnough: string;
  stuckTitle: string;
  stuckSub: string;
  supportTitle: string;
  supportSub: string;
  supportRosterHint: string;
  lookupsLabel: string;
  empty: string;
};

const COPY: Record<string, Copy> = {
  he: {
    title: "תובנות הכיתה",
    loading: "טוען...",
    notFound: "כיתה לא נמצאה. כדאי לבדוק את הקוד.",
    basedOn: (n) => `מבוסס על ${n} החיפושים האחרונים`,
    totalLabel: "סה\"כ חיפושים",
    totalAllTime: "מתחילת הדרך",
    langMapTitle: "השפות שהכיתה לומדת בהן",
    langMapSub: "כל חיפוש נענה בשפה של התלמיד. זו מפת השפות האמיתית של הכיתה.",
    notEnough: "עדיין אין מספיק נתונים.",
    stuckTitle: "מילים שהכיתה נתקעת עליהן",
    stuckSub: "כדאי ללמד אותן מראש לפני השיעור הבא.",
    supportTitle: "אולי צריכים תשומת לב נוספת",
    supportSub: "פרטי. ריבוי חיפושים יכול להעיד על קושי או פשוט על סקרנות.",
    supportRosterHint: "כשמוסיפים שמות תלמידים לרשימת הכיתה, יופיע כאן איתות תמיכה פרטי.",
    lookupsLabel: "חיפושים",
    empty: "עדיין לא חיפשו מילים בכיתה הזאת.",
  },
  en: {
    title: "Class insights",
    loading: "Loading…",
    notFound: "Classroom not found. Please check the code.",
    basedOn: (n) => `Based on the last ${n} lookups`,
    totalLabel: "Total lookups",
    totalAllTime: "all time",
    langMapTitle: "Languages your class learns in",
    langMapSub: "Every lookup is answered in the student's own language. This is your class's real language map.",
    notEnough: "Not enough data yet.",
    stuckTitle: "Words your class gets stuck on",
    stuckSub: "Worth pre-teaching before the next lesson.",
    supportTitle: "May need extra attention",
    supportSub: "Private. Lots of lookups can mean a struggle or simply curiosity.",
    supportRosterHint: "Add student names to the class roster to see a private support signal here.",
    lookupsLabel: "lookups",
    empty: "This class hasn't looked anything up yet.",
  },
  ar: {
    title: "رؤى الصف",
    loading: "جارٍ التحميل…",
    notFound: "لم يتم العثور على الصف. تحقق من الرمز.",
    basedOn: (n) => `استنادًا إلى آخر ${n} عملية بحث`,
    totalLabel: "إجمالي عمليات البحث",
    totalAllTime: "منذ البداية",
    langMapTitle: "اللغات التي يتعلم بها صفك",
    langMapSub: "كل بحث يُجاب عليه بلغة الطالب. هذه خريطة اللغات الحقيقية لصفك.",
    notEnough: "لا توجد بيانات كافية بعد.",
    stuckTitle: "كلمات يتعثر فيها الصف",
    stuckSub: "يُستحسن تعليمها مسبقًا قبل الدرس القادم.",
    supportTitle: "قد يحتاجون إلى اهتمام إضافي",
    supportSub: "خاص. كثرة البحث قد تعني صعوبة أو مجرد فضول.",
    supportRosterHint: "أضف أسماء الطلاب إلى قائمة الصف لعرض إشارة دعم خاصة هنا.",
    lookupsLabel: "عمليات بحث",
    empty: "لم يبحث هذا الصف عن أي شيء بعد.",
  },
  ru: {
    title: "Аналитика класса",
    loading: "Загрузка…",
    notFound: "Класс не найден. Проверьте код.",
    basedOn: (n) => `На основе последних ${n} запросов`,
    totalLabel: "Всего запросов",
    totalAllTime: "за всё время",
    langMapTitle: "Языки, на которых учится класс",
    langMapSub: "Каждый запрос отвечается на языке ученика. Это настоящая языковая карта класса.",
    notEnough: "Пока недостаточно данных.",
    stuckTitle: "Слова, на которых класс застревает",
    stuckSub: "Стоит разобрать их заранее перед следующим уроком.",
    supportTitle: "Возможно, нужно больше внимания",
    supportSub: "Приватно. Много запросов может означать трудность или просто любопытство.",
    supportRosterHint: "Добавьте имена учеников в список класса, чтобы увидеть здесь приватный сигнал поддержки.",
    lookupsLabel: "запросов",
    empty: "Этот класс пока ничего не искал.",
  },
};

export function TeacherByCodeClient({ code }: { code: string }) {
  const { lang, dir } = useLang();
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/classroom/searches?code=${encodeURIComponent(code)}`);
        if (!res.ok) {
          if (!cancelled) setError(true);
          return;
        }
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  const raw: RawSearch[] = useMemo(
    () => (data?.searches ?? []).map((s) => ({ word: s.word, lang: s.language, studentName: s.studentName })),
    [data],
  );
  const insights = useMemo(() => computeClassroomInsights(raw), [raw]);

  return (
    <div dir={dir} style={{ minHeight: "100vh", background: "#FAFAF9", padding: "40px 20px", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href={href("/")} translate="no" dir="ltr" style={{ display: "inline-block", fontSize: 22, fontWeight: 800, color: "#1C1917", textDecoration: "none", marginBottom: 20 }}>
          Gad<span style={{ color: "#CA8A04", fontStyle: "italic" }}>it</span>
        </Link>

        {loading ? (
          <p style={{ color: "#78716C", fontSize: 15 }}>{t.loading}</p>
        ) : error || !data ? (
          <p style={{ color: "#B45309", fontSize: 15 }}>{t.notFound}</p>
        ) : (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1C1917", margin: "0 0 4px" }}>
              {data.name || t.title}
            </h1>
            <p style={{ fontSize: 12.5, color: "#A8A29E", margin: "0 0 24px" }}>
              {t.basedOn(insights.sampleSize)}
            </p>

            {insights.sampleSize === 0 ? (
              <p style={{ color: "#78716C", fontSize: 15 }}>{t.empty}</p>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                  {/* Total */}
                  <div style={card}>
                    <div style={label}>{t.totalLabel}</div>
                    <div style={{ fontSize: 40, fontWeight: 800, color: "#CA8A04", lineHeight: 1.05 }}>
                      {(data.searchCount ?? 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: "#A8A29E" }}>{t.totalAllTime}</div>
                  </div>

                  {/* Language map */}
                  <div style={card}>
                    <div style={label}>{t.langMapTitle}</div>
                    <p style={sub}>{t.langMapSub}</p>
                    {insights.languages.length === 0 ? (
                      <p style={{ fontSize: 13, color: "#A8A29E", margin: 0 }}>{t.notEnough}</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                        {insights.languages.map((l) => (
                          <div key={l.lang} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1917", minWidth: 78 }}>{classroomLangLabel(l.lang)}</span>
                            <span style={{ flex: 1, height: 8, background: "#F0EEEB", borderRadius: 999, overflow: "hidden" }}>
                              <span style={{ display: "block", height: "100%", width: `${Math.max(l.pct, 3)}%`, background: "#CA8A04", borderRadius: 999 }} />
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#78716C", minWidth: 34, textAlign: "end" }}>{l.pct}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stuck words */}
                <div style={{ ...card, marginTop: 14 }}>
                  <div style={label}>{t.stuckTitle}</div>
                  <p style={sub}>{t.stuckSub}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {insights.topWords.map((w) => (
                      <Link key={w.word} href={href(`/word/${encodeURIComponent(w.word)}`)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600, color: "#92400E" }}>
                        <span>{w.word}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#CA8A04", background: "#FEF3C7", borderRadius: 999, padding: "1px 7px" }}>{w.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Private support signal */}
                <div style={{ ...card, marginTop: 14 }}>
                  <div style={label}>{t.supportTitle}</div>
                  <p style={sub}>{t.supportSub}</p>
                  {insights.students.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#A8A29E", margin: 0 }}>{t.supportRosterHint}</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                      {insights.students.map((st) => (
                        <div key={st.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1C1917", flex: 1 }}>{st.name}</span>
                          <span style={{ fontSize: 12.5, color: "#78716C" }}>{st.count} {t.lookupsLabel}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #EAE7E3",
  borderRadius: 14,
  padding: "16px 18px",
};
const label: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#1C1917", marginBottom: 4 };
const sub: React.CSSProperties = { fontSize: 12.5, color: "#78716C", lineHeight: 1.45, margin: "0 0 12px" };
