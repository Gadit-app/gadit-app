"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { Lang, LANGUAGES, getLangDir } from "@/lib/i18n";

type LocaleContent = { title: string; body: React.ReactNode };

const FALLBACK_NOTICE: Record<string, { prefix: string; link: string; suffix: string }> = {
  en: { prefix: "The legally binding version of this document is ", link: "the English version", suffix: "." },
  he: { prefix: "הגרסה המחייבת מבחינה משפטית של מסמך זה היא ", link: "הגרסה האנגלית", suffix: "." },
  ar: { prefix: "النسخة الملزمة قانونًا من هذه الوثيقة هي ", link: "النسخة الإنجليزية", suffix: "." },
  ru: { prefix: "Юридически обязательной версией настоящего документа является ", link: "английская версия", suffix: "." },
  es: { prefix: "La versión jurídicamente vinculante de este documento es ", link: "la versión en inglés", suffix: "." },
  pt: { prefix: "A versão juridicamente vinculativa deste documento é ", link: "a versão em inglês", suffix: "." },
  fr: { prefix: "La version juridiquement contraignante de ce document est ", link: "la version anglaise", suffix: "." },
  de: { prefix: "Die rechtsverbindliche Fassung dieses Dokuments ist ", link: "die englische Fassung", suffix: "." },
  cs: { prefix: "Právně závaznou verzí tohoto dokumentu je ", link: "anglická verze", suffix: "." },
  sk: { prefix: "Právne záväznou verziou tohto dokumentu je ", link: "anglická verzia", suffix: "." },
  it: { prefix: "La versione giuridicamente vincolante di questo documento è ", link: "la versione inglese", suffix: "." },
  ja: { prefix: "この文書の法的拘束力を持つ版は", link: "英語版", suffix: "です。" },
  hi: { prefix: "इस दस्तावेज़ का कानूनी रूप से बाध्यकारी संस्करण ", link: "अंग्रेज़ी संस्करण", suffix: " है।" },
  am: { prefix: "የዚህ ሰነድ በሕግ አስገዳጅ የሆነው ቅጂ ", link: "የእንግሊዝኛው ቅጂ", suffix: " ነው።" },
  uk: { prefix: "Юридично обов'язковою версією цього документа є ", link: "англійська версія", suffix: "." },
  tr: { prefix: "Bu belgenin yasal olarak bağlayıcı sürümü ", link: "İngilizce sürümdür", suffix: "." },
  pl: { prefix: "Prawnie wiążącą wersją tego dokumentu jest ", link: "wersja angielska", suffix: "." },
  fa: { prefix: "نسخهٔ الزام‌آور قانونی این سند ", link: "نسخهٔ انگلیسی", suffix: " است." },
  id: { prefix: "Versi yang mengikat secara hukum dari dokumen ini adalah ", link: "versi bahasa Inggris", suffix: "." },
  nl: { prefix: "De juridisch bindende versie van dit document is ", link: "de Engelse versie", suffix: "." },
  el: { prefix: "Η νομικά δεσμευτική έκδοση αυτού του εγγράφου είναι ", link: "η αγγλική έκδοση", suffix: "." },
  zu: { prefix: "Inguqulo ebophezelayo ngokomthetho yalo mbhalo ", link: "yinguqulo yesiNgisi", suffix: "." },
  vi: { prefix: "Phiên bản có giá trị pháp lý ràng buộc của tài liệu này là ", link: "phiên bản tiếng Anh", suffix: "." },
  fil: { prefix: "Ang bersyong may bisang legal ng dokumentong ito ay ", link: "ang bersyong Ingles", suffix: "." },
  af: { prefix: "Die regsbindende weergawe van hierdie dokument is ", link: "die Engelse weergawe", suffix: "." },
  sw: { prefix: "Toleo linalofunga kisheria la hati hii ni ", link: "toleo la Kiingereza", suffix: "." },
  "zh-CN": { prefix: "本文件具有法律约束力的版本为", link: "英文版本", suffix: "。" },
  "zh-TW": { prefix: "本文件具有法律約束力的版本為", link: "英文版本", suffix: "。" },
  ko: { prefix: "이 문서의 법적 구속력이 있는 버전은 ", link: "영어 버전", suffix: "입니다." },
  th: { prefix: "ฉบับที่มีผลผูกพันทางกฎหมายของเอกสารนี้คือ", link: "ฉบับภาษาอังกฤษ", suffix: "" },
  bn: { prefix: "এই নথির আইনগতভাবে বাধ্যতামূলক সংস্করণটি হল ", link: "ইংরেজি সংস্করণ", suffix: "।" },
  da: { prefix: "Den juridisk bindende version af dette dokument er ", link: "den engelske version", suffix: "." },
  hu: { prefix: "E dokumentum jogilag kötelező érvényű változata ", link: "az angol nyelvű változat", suffix: "." },
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
  hi: "अंतिम बार अपडेट किया गया: ",
  am: "መጨረሻ የተዘመነው: ",
  uk: "Останнє оновлення: ",
  tr: "Son güncelleme: ",
  pl: "Ostatnia aktualizacja: ",
  fa: "آخرین به‌روزرسانی: ",
  id: "Terakhir diperbarui: ",
  nl: "Laatst bijgewerkt: ",
  el: "Τελευταία ενημέρωση: ",
  zu: "Kugcine ukubuyekezwa: ",
  vi: "Cập nhật lần cuối: ",
  fil: "Huling na-update: ",
  af: "Laas opgedateer: ",
  sw: "Ilisasishwa mwisho: ",
  "zh-CN": "最后更新: ",
  "zh-TW": "最後更新: ",
  ko: "마지막 업데이트: ",
  th: "อัปเดตล่าสุด: ",
  bn: "সর্বশেষ আপডেট: ",
  da: "Senest opdateret: ",
  hu: "Utolsó frissítés: ",
};

const BACK_LABEL: Record<string, string> = {
  en: "Back to Gadit",
  he: "חזרה ל-Gadit",
  ar: "العودة إلى Gadit",
  ru: "Назад к Gadit",
  es: "Volver a Gadit",
  pt: "Voltar para Gadit",
  fr: "Retour à Gadit",
  de: "Zurück zu Gadit",
  cs: "Zpět na Gadit",
  sk: "Späť na Gadit",
  it: "Torna a Gadit",
  ja: "Gaditに戻る",
  hi: "Gadit पर वापस जाएँ",
  am: "ወደ Gadit ተመለስ",
  uk: "Назад до Gadit",
  tr: "Gadit'e dön",
  pl: "Powrót do Gadit",
  fa: "بازگشت به Gadit",
  id: "Kembali ke Gadit",
  nl: "Terug naar Gadit",
  el: "Επιστροφή στο Gadit",
  zu: "Buyela ku-Gadit",
  vi: "Quay lại Gadit",
  fil: "Bumalik sa Gadit",
  af: "Terug na Gadit",
  sw: "Rudi kwa Gadit",
  "zh-CN": "返回 Gadit",
  "zh-TW": "返回 Gadit",
  ko: "Gadit으로 돌아가기",
  th: "กลับไปที่ Gadit",
  bn: "Gadit-এ ফিরে যান",
  da: "Tilbage til Gadit",
  hu: "Vissza a Gadithoz",
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
  // The binding-version notice always shows in the reader's own language: when a
  // translation is shown, in that language; when we fall back to the English body
  // (the reader's UI language has no translation), still in the reader's UI
  // language, so every visitor understands that the English version governs.
  const noticeLang: Lang = locale !== "en" ? locale : uiLang;
  const notice = FALLBACK_NOTICE[noticeLang] ?? FALLBACK_NOTICE.en;
  const showNotice = locale !== "en" || uiLang !== "en";

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

          {showNotice && (
            <p dir={getLangDir(noticeLang)} style={{ textAlign: "start" }} className="text-xs text-slate-400 mt-10 pt-6 border-t border-slate-100">
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
          {dir === "rtl" ? "→ " : "← "}{BACK_LABEL[locale] ?? BACK_LABEL.en}
        </Link>
      </div>
    </main>
  );
}
