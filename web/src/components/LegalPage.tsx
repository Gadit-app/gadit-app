"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { Lang, LANGUAGES, getLangDir } from "@/lib/i18n";

type LocaleContent = { title: string; body: React.ReactNode };

const FALLBACK_NOTICE: Record<Lang, { prefix: string; link: string; suffix: string }> = {
  en: {
    prefix: "This translation is provided for convenience only. In case of any conflict between the translated version and the English version, ",
    link: "the English version",
    suffix: " shall prevail.",
  },
  he: {
    prefix: "תרגום זה ניתן לנוחות בלבד. בכל מקרה של סתירה בין הנוסח המתורגם לנוסח האנגלי — ",
    link: "הנוסח האנגלי",
    suffix: " הוא המחייב.",
  },
  ar: {
    prefix: "هذه الترجمة مقدَّمة للراحة فقط. في حال وجود أي تعارض بين النسخة المترجمة والنسخة الإنجليزية، ",
    link: "النسخة الإنجليزية",
    suffix: " هي النسخة المعتمدة.",
  },
  ru: {
    prefix: "Этот перевод предоставлен только для удобства. В случае любого расхождения между переведённой версией и английской — ",
    link: "английская версия",
    suffix: " имеет преимущественную силу.",
  },
  es: {
    prefix: "Esta traducción se proporciona solo por conveniencia. En caso de cualquier conflicto entre la versión traducida y la versión en inglés, ",
    link: "la versión en inglés",
    suffix: " prevalecerá.",
  },
  pt: {
    prefix: "Esta tradução é fornecida apenas por conveniência. Em caso de qualquer conflito entre a versão traduzida e a versão em inglês, ",
    link: "a versão em inglês",
    suffix: " prevalecerá.",
  },
  fr: {
    prefix: "Cette traduction est fournie uniquement pour votre commodité. En cas de conflit entre la version traduite et la version anglaise, ",
    link: "la version anglaise",
    suffix: " prévaudra.",
  },
};

const LAST_UPDATED_LABEL: Record<Lang, string> = {
  en: "Last updated: ",
  he: "עודכן לאחרונה: ",
  ar: "آخر تحديث: ",
  ru: "Последнее обновление: ",
  es: "Última actualización: ",
  pt: "Última atualização: ",
  fr: "Dernière mise à jour : ",
};

const BACK_LABEL: Record<Lang, string> = {
  en: "← Back to Gadit",
  he: "→ חזרה ל-Gadit",
  ar: "→ العودة إلى Gadit",
  ru: "← Вернуться в Gadit",
  es: "← Volver a Gadit",
  pt: "← Voltar para o Gadit",
  fr: "← Retour à Gadit",
};

export default function LegalPage({
  locales,
  lastUpdated,
}: {
  locales: Partial<Record<Lang, LocaleContent>>;
  lastUpdated: string;
}) {
  const { lang: uiLang } = useLang();

  // Prefer the UI language, otherwise English
  const initial: Lang = locales[uiLang] ? uiLang : "en";
  const [locale, setLocale] = useState<Lang>(initial);

  useEffect(() => {
    setLocale(locales[uiLang] ? uiLang : "en");
  }, [uiLang, locales]);

  const active = locales[locale] ?? locales.en!;
  const dir = getLangDir(locale);
  const notice = FALLBACK_NOTICE[locale];

  // Languages available for this doc (in the same order as LANGUAGES)
  const available = LANGUAGES.filter((l) => locales[l.code]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
      <div className="max-w-2xl mx-auto">
        {/* Language toggle */}
        <div className="flex justify-end mb-6" dir="ltr">
          <div className="inline-flex flex-wrap rounded-full bg-white border border-slate-200 p-1 text-xs gap-0.5">
            {available.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className="px-3 py-1 rounded-full transition-all"
                style={{
                  background: locale === code ? "rgb(37 99 235)" : "transparent",
                  color: locale === code ? "white" : "rgb(100 116 139)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <article
          className="bg-white rounded-3xl px-6 sm:px-10 py-8 sm:py-10"
          style={{
            border: "1px solid rgb(226 232 240 / 0.9)",
            boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)",
          }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
            {active.title}
          </h1>
          <p className="text-xs text-slate-400 mb-8">
            {LAST_UPDATED_LABEL[locale]}
            {lastUpdated}
          </p>

          <div className="legal-body">{active.body}</div>

          {locale !== "en" && (
            <p className="text-xs text-slate-400 mt-10 pt-6 border-t border-slate-100">
              {notice.prefix}
              <button
                type="button"
                onClick={() => setLocale("en")}
                className="underline hover:text-blue-600"
              >
                {notice.link}
              </button>
              {notice.suffix}
            </p>
          )}
        </article>

        <Link
          href="/"
          className="block text-center mt-8 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          {BACK_LABEL[locale]}
        </Link>
      </div>
    </main>
  );
}
