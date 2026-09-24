"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHref } from "@/lib/href";
import { useLang } from "@/lib/lang-context";
import { setsBySubject, type WordSet } from "@/lib/word-sets";

// One color per subject, so the sections read as clearly separate topics.
const SUBJECT_COLORS: Record<string, { accent: string; soft: string; border: string }> = {
  language:  { accent: "#2563EB", soft: "#EFF6FF", border: "#DBEAFE" }, // blue
  math:      { accent: "#0D9488", soft: "#F0FDFA", border: "#CCFBF1" }, // teal
  english:   { accent: "#7C3AED", soft: "#F5F3FF", border: "#EDE9FE" }, // violet
  geography: { accent: "#16A34A", soft: "#F0FDF4", border: "#DCFCE7" }, // green
  history:   { accent: "#B45309", soft: "#FFFBEB", border: "#FDE68A" }, // amber
  torah:     { accent: "#BE123C", soft: "#FFF1F2", border: "#FECDD3" }, // rose
  science:   { accent: "#0891B2", soft: "#ECFEFF", border: "#CFF9FE" }, // cyan
  _default:  { accent: "var(--teal)", soft: "#F0FDFA", border: "#CCFBF1" },
};

/**
 * /sets — themed vocabulary sets for teachers (schools council 2026-08-05).
 * Browse curated word groups by subject; "Present to class" opens the
 * first word in present mode with ?set= so the teacher steps through the
 * whole set on the classroom screen. A single word chip opens just that
 * word. Content lives in lib/word-sets.ts.
 */

const COPY: Record<string, { title: string; sub: string; present: string; words: string }> = {
  he: {
    title: "קבוצות מילים",
    sub: "בוחרים נושא, פותחים קבוצה, ומקרינים לכיתה. גדית מסביר כל מילה עם תמונה ודוגמאות.",
    present: "הצגה בכיתה",
    words: "מילים",
  },
  en: {
    title: "Word sets",
    sub: "Pick a subject, open a set, and project it to the class. Gadit explains each word with a picture and examples.",
    present: "Present to class",
    words: "words",
  },
  zu: {
    title: "Amasethi amagama",
    sub: "Khetha isihloko, uvule isethi, bese uyibonisa ekilasini. I-Gadit ichaza igama ngalinye ngesithombe nezibonelo.",
    present: "Yibonise ekilasini",
    words: "amagama",
  },
  el: {
    title: "Σετ λέξεων",
    sub: "Διάλεξε ένα θέμα, άνοιξε ένα σετ και πρόβαλέ το στην τάξη. Το Gadit εξηγεί κάθε λέξη με μια εικόνα και παραδείγματα.",
    present: "Προβολή στην τάξη",
    words: "λέξεις",
  },
  ar: {
    title: "مجموعات الكلمات",
    sub: "اختر موضوعًا، وافتح مجموعة، واعرضها على الصف. يشرح Gadit كل كلمة بصورة وأمثلة.",
    present: "العرض على الصف",
    words: "كلمات",
  },
  ru: {
    title: "Наборы слов",
    sub: "Выберите тему, откройте набор и выведите его на экран в классе. Gadit объясняет каждое слово с картинкой и примерами.",
    present: "Показать классу",
    words: "слов",
  },
  es: {
    title: "Grupos de palabras",
    sub: "Elige un tema, abre un grupo y proyéctalo en clase. Gadit explica cada palabra con una imagen y ejemplos.",
    present: "Presentar a la clase",
    words: "palabras",
  },
  pt: {
    title: "Conjuntos de palavras",
    sub: "Escolha um tema, abra um conjunto e projete para a turma. O Gadit explica cada palavra com uma imagem e exemplos.",
    present: "Apresentar à turma",
    words: "palavras",
  },
  fr: {
    title: "Séries de mots",
    sub: "Choisissez un thème, ouvrez une série et projetez-la en classe. Gadit explique chaque mot avec une image et des exemples.",
    present: "Présenter à la classe",
    words: "mots",
  },
  de: {
    title: "Wortsammlungen",
    sub: "Thema wählen, Sammlung öffnen und für die Klasse projizieren. Gadit erklärt jedes Wort mit einem Bild und Beispielen.",
    present: "Der Klasse zeigen",
    words: "Wörter",
  },
  cs: {
    title: "Sady slov",
    sub: "Vyberte téma, otevřete sadu a promítněte ji třídě. Gadit vysvětlí každé slovo obrázkem a příklady.",
    present: "Promítnout třídě",
    words: "slov",
  },
  sk: {
    title: "Sady slov",
    sub: "Vyberte tému, otvorte sadu a premietnite ju triede. Gadit vysvetlí každé slovo obrázkom a príkladmi.",
    present: "Premietnuť triede",
    words: "slov",
  },
  it: {
    title: "Gruppi di parole",
    sub: "Scegli un argomento, apri un gruppo e proiettalo in classe. Gadit spiega ogni parola con un'immagine ed esempi.",
    present: "Mostra alla classe",
    words: "parole",
  },
  ja: {
    title: "単語セット",
    sub: "テーマを選んでセットを開き、クラスに映し出しましょう。Gadit が各単語を画像と例文で説明します。",
    present: "クラスに表示",
    words: "語",
  },
  hi: {
    title: "शब्द समूह",
    sub: "एक विषय चुनें, एक समूह खोलें और उसे कक्षा में दिखाएँ। Gadit हर शब्द को एक चित्र और उदाहरणों के साथ समझाता है।",
    present: "कक्षा को दिखाएँ",
    words: "शब्द",
  },
  am: {
    title: "የቃላት ስብስቦች",
    sub: "ርዕስ ይምረጡ፣ ስብስብ ይክፈቱ እና ለክፍሉ ያሳዩ። Gadit እያንዳንዱን ቃል በምስልና በምሳሌዎች ያብራራል።",
    present: "ለክፍሉ አሳይ",
    words: "ቃላት",
  },
  uk: {
    title: "Набори слів",
    sub: "Оберіть тему, відкрийте набір і виведіть його на екран у класі. Gadit пояснює кожне слово з малюнком і прикладами.",
    present: "Показати класу",
    words: "слів",
  },
  tr: {
    title: "Kelime setleri",
    sub: "Bir konu seçin, bir set açın ve sınıfa yansıtın. Gadit her kelimeyi bir resim ve örneklerle açıklar.",
    present: "Sınıfa göster",
    words: "kelime",
  },
  pl: {
    title: "Zestawy słów",
    sub: "Wybierz temat, otwórz zestaw i wyświetl go klasie. Gadit wyjaśnia każde słowo za pomocą obrazka i przykładów.",
    present: "Pokaż klasie",
    words: "słów",
  },
  fa: {
    title: "مجموعه‌های واژه",
    sub: "یک موضوع انتخاب کنید، یک مجموعه را باز کنید و آن را برای کلاس نمایش دهید. Gadit هر واژه را با تصویر و مثال توضیح می‌دهد.",
    present: "نمایش برای کلاس",
    words: "واژه",
  },
  id: {
    title: "Kumpulan kata",
    sub: "Pilih topik, buka satu kumpulan, lalu tampilkan ke kelas. Gadit menjelaskan setiap kata dengan gambar dan contoh.",
    present: "Tampilkan ke kelas",
    words: "kata",
  },
  nl: {
    title: "Woordensets",
    sub: "Kies een onderwerp, open een set en projecteer die voor de klas. Gadit legt elk woord uit met een afbeelding en voorbeelden.",
    present: "Aan de klas tonen",
    words: "woorden",
  },
  vi: {
    title: "Bộ từ vựng",
    sub: "Chọn một chủ đề, mở một bộ từ và chiếu lên cho cả lớp. Gadit giải thích từng từ bằng hình ảnh và ví dụ.",
    present: "Trình chiếu cho lớp",
    words: "từ",
  },
  fil: {
    title: "Mga set ng salita",
    sub: "Pumili ng paksa, magbukas ng set, at i-project ito sa klase. Ipinapaliwanag ng Gadit ang bawat salita gamit ang larawan at mga halimbawa.",
    present: "Ipakita sa klase",
    words: "salita",
  },
  af: {
    title: "Woordstelle",
    sub: "Kies 'n onderwerp, maak 'n stel oop en projekteer dit vir die klas. Gadit verduidelik elke woord met 'n prent en voorbeelde.",
    present: "Wys vir die klas",
    words: "woorde",
  },
  sw: {
    title: "Seti za maneno",
    sub: "Chagua mada, fungua seti, kisha ionyeshe darasani. Gadit inaeleza kila neno kwa picha na mifano.",
    present: "Onyesha darasani",
    words: "maneno",
  },
  "zh-CN": {
    title: "单词组",
    sub: "选择一个主题，打开一个单词组，投屏给全班。Gadit 会用图片和例句讲解每个单词。",
    present: "投屏给全班",
    words: "个单词",
  },
  "zh-TW": {
    title: "單字組",
    sub: "選擇一個主題，打開一個單字組，投影給全班。Gadit 會用圖片和例句講解每個單字。",
    present: "投影給全班",
    words: "個單字",
  },
  ko: {
    title: "단어 세트",
    sub: "주제를 고르고 세트를 연 다음 반 전체 화면에 띄워 보세요. Gadit이 단어마다 그림과 예문으로 설명합니다.",
    present: "수업 화면에 띄우기",
    words: "단어",
  },
  th: {
    title: "ชุดคำศัพท์",
    sub: "เลือกหัวข้อ เปิดชุดคำ แล้วฉายให้ทั้งห้องดู Gadit อธิบายทุกคำพร้อมภาพและตัวอย่าง",
    present: "ฉายให้ห้องเรียน",
    words: "คำ",
  },
  bn: {
    title: "শব্দের সেট",
    sub: "একটি বিষয় বেছে নিন, একটি সেট খুলুন এবং ক্লাসে প্রজেক্ট করুন। Gadit প্রতিটি শব্দ ছবি ও উদাহরণ দিয়ে বুঝিয়ে দেয়।",
    present: "ক্লাসে দেখান",
    words: "শব্দ",
  },
  da: {
    title: "Ordsæt",
    sub: "Vælg et emne, åbn et sæt, og vis det for klassen på storskærm. Gadit forklarer hvert ord med et billede og eksempler.",
    present: "Vis for klassen",
    words: "ord",
  },
  hu: {
    title: "Szócsoportok",
    sub: "Válasszon témát, nyisson meg egy csoportot, és vetítse ki az osztálynak. A Gadit minden szót képpel és példákkal magyaráz el.",
    present: "Kivetítés az osztálynak",
    words: "szó",
  },
};

export default function SetsClient() {
  const href = useHref();
  const router = useRouter();
  const { lang, dir } = useLang();
  const c = COPY[lang] ?? COPY.en;
  const groups = setsBySubject();

  const presentSet = (set: WordSet) =>
    router.push(href(`/word/${encodeURIComponent(set.words[0])}?present=1&set=${encodeURIComponent(set.id)}`));

  return (
    <div className="wordbook" dir={dir} style={S.page}>
      <header style={S.header}>
        <Link href={href("/")} style={S.wordmark} dir="ltr" aria-label="Gadit home">
          Gad<span style={{ fontStyle: "italic", color: "#0EA5A5" }}>it</span>
        </Link>
      </header>

      <main style={S.main}>
        <h1 style={S.h1}>{c.title}</h1>
        <p style={S.subtitle}>{c.sub}</p>

        {groups.map((g) => {
          const col = SUBJECT_COLORS[g.key] ?? SUBJECT_COLORS._default;
          return (
          <section key={g.key} style={S.section}>
            <h2 style={{ ...S.h2, color: col.accent }}>{g.he}</h2>
            <div style={S.grid}>
              {g.sets.map((set) => (
                <div key={set.id} style={{ ...S.card, borderTop: `3px solid ${col.accent}` }}>
                  <div style={S.cardHead}>
                    <span style={S.cardTitle}>{set.title}</span>
                    {set.grade && <span style={S.grade}>{set.grade}</span>}
                  </div>
                  <div style={S.chips} dir={set.lang === "en" ? "ltr" : "rtl"}>
                    {set.words.map((w) => (
                      <Link
                        key={w}
                        href={href(`/word/${encodeURIComponent(w)}?present=1&set=${encodeURIComponent(set.id)}`)}
                        style={{ ...S.chip, background: col.soft, color: col.accent, border: `1px solid ${col.border}` }}
                      >
                        {w}
                      </Link>
                    ))}
                  </div>
                  {/* Button pinned to the bottom so every card's CTA lines
                      up at the same height, regardless of word count. */}
                  <button type="button" style={{ ...S.presentBtn, background: col.accent, marginTop: "auto" }} onClick={() => presentSet(set)}>
                    {c.present}
                    <span style={{ fontSize: 12, opacity: 0.85 }}>· {set.words.length} {c.words}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
          );
        })}
      </main>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100dvh", background: "var(--paper)", color: "var(--ink)" },
  header: { padding: "18px 24px", borderBottom: "1px solid var(--rule)" },
  wordmark: { fontWeight: 800, fontSize: 20, color: "var(--ink)", textDecoration: "none", letterSpacing: "-0.02em" },
  main: { maxWidth: 1080, margin: "0 auto", padding: "28px 20px 64px" },
  h1: { fontSize: 30, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.01em" },
  subtitle: { color: "var(--ink-muted)", fontSize: 15.5, margin: "0 0 28px", maxWidth: 640 },
  section: { marginBottom: 34 },
  h2: { fontSize: 20, fontWeight: 800, margin: "0 0 14px", color: "var(--teal)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 },
  card: { background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: 16, padding: "16px 16px 14px", display: "flex", flexDirection: "column", gap: 12 },
  cardHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
  cardTitle: { fontWeight: 700, fontSize: 16.5 },
  grade: { fontSize: 12.5, fontWeight: 700, color: "var(--ink-faint)", flexShrink: 0 },
  chips: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: { fontSize: 13.5, fontWeight: 600, color: "var(--ink-soft)", background: "var(--mist)", borderRadius: 8, padding: "4px 9px", textDecoration: "none", border: "1px solid transparent" },
  presentBtn: { marginTop: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", background: "var(--teal)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" },
};
