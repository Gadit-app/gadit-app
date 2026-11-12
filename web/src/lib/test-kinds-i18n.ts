/**
 * "Getting ready for a test": the first question and the one tile that has no
 * name elsewhere (Gadi 2026-11-12, after the AI panel: ask which test, with
 * pictures). The other tiles reuse names the site already has.
 */
export type TestKindsCopy = { q: string; other: string };

const COPY: Record<string, TestKindsCopy> = {
  en: { q: "Which test are you getting ready for?", other: "Something else" },
  he: { q: "לאיזה מבחן מתכוננים?", other: "משהו אחר" },
  ar: { q: "لأي اختبار تستعدون؟", other: "شيء آخر" },
  ru: { q: "К какой контрольной вы готовитесь?", other: "Что-то другое" },
  es: { q: "¿Para qué examen te preparas?", other: "Otra cosa" },
  pt: { q: "Para que prova você está se preparando?", other: "Outra coisa" },
  fr: { q: "Quel contrôle préparez-vous ?", other: "Autre chose" },
  de: { q: "Für welchen Test lernst du?", other: "Etwas anderes" },
  cs: { q: "Na jaký test se připravuješ?", other: "Něco jiného" },
  sk: { q: "Na aký test sa pripravuješ?", other: "Niečo iné" },
  it: { q: "Per quale verifica ti prepari?", other: "Qualcos'altro" },
  ja: { q: "どのテストの準備をしますか？", other: "そのほか" },
  hi: { q: "आप किस परीक्षा की तैयारी कर रहे हैं?", other: "कुछ और" },
  am: { q: "ለየትኛው ፈተና እየተዘጋጁ ነው?", other: "ሌላ ነገር" },
  uk: { q: "До якої контрольної ви готуєтеся?", other: "Щось інше" },
  tr: { q: "Hangi sınava hazırlanıyorsun?", other: "Başka bir şey" },
  pl: { q: "Do jakiego sprawdzianu się przygotowujesz?", other: "Coś innego" },
  fa: { q: "برای کدام آزمون آماده می‌شوید؟", other: "چیز دیگر" },
  id: { q: "Kamu bersiap untuk ujian apa?", other: "Yang lain" },
  nl: { q: "Voor welke toets oefen je?", other: "Iets anders" },
  el: { q: "Για ποιο τεστ ετοιμάζεσαι;", other: "Κάτι άλλο" },
  vi: { q: "Bạn đang ôn cho bài kiểm tra nào?", other: "Việc khác" },
  fil: { q: "Anong pagsusulit ang pinaghahandaan mo?", other: "Iba pa" },
  af: { q: "Vir watter toets berei jy voor?", other: "Iets anders" },
  sw: { q: "Unajiandaa kwa mtihani gani?", other: "Kitu kingine" },
  ko: { q: "어떤 시험을 준비하나요?", other: "그 밖의 것" },
  th: { q: "กำลังเตรียมสอบอะไร?", other: "อย่างอื่น" },
  bn: { q: "কোন পরীক্ষার জন্য প্রস্তুতি নিচ্ছেন?", other: "অন্য কিছু" },
  da: { q: "Hvilken prøve øver du dig til?", other: "Noget andet" },
  hu: { q: "Melyik dolgozatra készülsz?", other: "Valami más" },
};

/** Languages without their own line read the English one. */
export function testKindsCopy(lang: string): TestKindsCopy {
  return COPY[lang] ?? COPY.en;
}
