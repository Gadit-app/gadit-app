"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { Lang, LANGUAGES, getLangDir } from "@/lib/i18n";

type LocaleContent = { title: string; body: React.ReactNode };

const FALLBACK_NOTICE: Record<string, { prefix: string; link: string; suffix: string }> = {
  en: {
    prefix: "This translation is provided for convenience only. In case of any conflict between the translated version and the English version, ",
    link: "the English version",
    suffix: " shall prevail.",
  },
  he: {
    prefix: "תרגום זה ניתן לנוחות בלבד. בכל מקרה של סתירה בין הנוסח המתורגם לנוסח האנגלי, ",
    link: "הנוסח האנגלי",
    suffix: " הוא המחייב.",
  },
  ar: {
    prefix: "هذه الترجمة مقدَّمة للراحة فقط. في حال وجود أي تعارض بين النسخة المترجمة والنسخة الإنجليزية، ",
    link: "النسخة الإنجليزية",
    suffix: " هي النسخة المعتمدة.",
  },
  ru: {
    prefix: "Этот перевод предоставлен только для удобства. В случае любого расхождения между переведённой версией и английской, ",
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
  de: {
    prefix: "Diese Übersetzung dient nur der Bequemlichkeit. Bei Widersprüchen zwischen der übersetzten und der englischen Fassung gilt ",
    link: "die englische Fassung",
    suffix: " vorrangig.",
  },
  cs: {
    prefix: "Tento překlad je poskytován pouze pro pohodlí. V případě jakéhokoliv rozporu mezi přeloženou verzí a anglickou verzí má přednost ",
    link: "anglická verze",
    suffix: ".",
  },
  sk: {
    prefix: "Tento preklad je poskytovaný len pre pohodlie. V prípade akéhokoľvek rozporu medzi preloženou verziou a anglickou verziou má prednosť ",
    link: "anglická verzia",
    suffix: ".",
  },
  it: {
    prefix: "Questa traduzione è fornita solo per comodità. In caso di conflitto tra la versione tradotta e quella in inglese, prevarrà ",
    link: "la versione in inglese",
    suffix: ".",
  },
  ja: {
    prefix: "この翻訳は便宜上の参考訳です。翻訳版と英語版に相違がある場合は、",
    link: "英語版",
    suffix: "が優先されます。",
  },
  hi: {
    prefix: "यह अनुवाद सिर्फ़ सुविधा के लिए दिया गया है। अनुवादित और अंग्रेज़ी संस्करण में अंतर होने पर ",
    link: "अंग्रेज़ी संस्करण",
    suffix: " मान्य होगा।",
  },
  am: {
    prefix: "ይህ ትርጉም ለእርስዎ ምቾት ብቻ የቀረበ ነው። በተተረጎመው ቅጂ እና በእንግሊዝኛው ቅጂ መካከል ልዩነት ቢፈጠር ",
    link: "የእንግሊዝኛው ቅጂ",
    suffix: " ተፈጻሚ ይሆናል።",
  },
};

const LAST_UPDATED_LABEL: Record<string, string> = {
  en: "Last updated: ",
  he: "עודכן לאחרונה: ",
  ar: "آخر تحديث: ",
  ru: "Последнее обновление: ",
  es: "Última actualización: ",
  pt: "Última atualização: ",
  fr: "Dernière mise à jour : ",
  de: "Zuletzt aktualisiert: ",
  cs: "Naposledy aktualizováno: ",
  sk: "Naposledy aktualizované: ",
  it: "Ultimo aggiornamento: ",
  ja: "最終更新: ",
  hi: "आख़िरी बार अपडेट: ",
  am: "ለመጨረሻ ጊዜ የተሻሻለው: ",
};

const BACK_LABEL: Record<string, string> = {
  en: "← Back to Gadit",
  he: "→ חזרה ל-Gadit",
  ar: "→ العودة إلى Gadit",
  ru: "← Вернуться в Gadit",
  es: "← Volver a Gadit",
  pt: "← Voltar para o Gadit",
  fr: "← Retour à Gadit",
  de: "← Zurück zu Gadit",
  cs: "← Zpět do Gaditu",
  sk: "← Späť do Gaditu",
  it: "← Torna a Gadit",
  ja: "← Gaditに戻る",
  hi: "← Gadit पर वापस",
  am: "← ወደ Gadit ተመለስ",
};

export default function LegalPage({
  locales,
  lastUpdated,
}: {
  locales: Partial<Record<Lang, LocaleContent>>;
  lastUpdated: string;
}) {
  const { lang: uiLang } = useLang();
  const href = useHref();

  // Prefer the UI language, otherwise English
  const initial: Lang = locales[uiLang] ? uiLang : "en";
  const [locale, setLocale] = useState<Lang>(initial);

  useEffect(() => {
    setLocale(locales[uiLang] ? uiLang : "en");
  }, [uiLang, locales]);

  const active = locales[locale] ?? locales.en!;
  const dir = getLangDir(locale);
  const notice = FALLBACK_NOTICE[locale] ?? FALLBACK_NOTICE.en;

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
            {LAST_UPDATED_LABEL[locale] ?? LAST_UPDATED_LABEL.en}
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
          href={href("/")}
          className="block text-center mt-8 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          {BACK_LABEL[locale] ?? BACK_LABEL.en}
        </Link>
      </div>
    </main>
  );
}
