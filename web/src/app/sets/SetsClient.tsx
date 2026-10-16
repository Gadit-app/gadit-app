"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHref } from "@/lib/href";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import { setsBySubject, type WordSet } from "@/lib/word-sets";
import CurriculumBrowser from "./CurriculumBrowser";

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
  xh: {
    title: "Amaqela amagama",
    sub: "Khetha isifundo, vula iqela, uze ulibonise eklasini. Gadit icacisa igama ngalinye ngomfanekiso nemizekelo.",
    present: "Bonisa eklasini",
    words: "amagama",
  },
  nso: {
    title: "Dihlopha tša mantšu",
    sub: "Kgetha thuto, bula sehlopha, gomme o se bontšhe phapoši. Gadit e hlaloša lentšu le lengwe le le lengwe ka seswantšho le mehlala.",
    present: "Bontšha phapoši",
    words: "mantšu",
  },
  tn: {
    title: "Disete tsa mafoko",
    sub: "Tlhopha serutwa, bula sete, mme o e bontshe phaposi. Gadit e tlhalosa lefoko lengwe le lengwe ka setshwantsho le dikai.",
    present: "Bontsha phaposi",
    words: "mafoko",
  },
  st: {
    title: "Dihlopha tsa mantswe",
    sub: "Kgetha thuto, bula sehlopha, mme o se bontshe tlelase ka projeketara. Gadit e hlalosa lentswe le leng le le leng ka setshwantsho le mehlala.",
    present: "Bontsha tlelase",
    words: "mantswe",
  },
  ts: {
    title: "Mintlawa ya marito",
    sub: "Hlawulani dyondzo, pfulani ntlawa, kutani mi wu kombisa eka tlilasi. Gadit yi hlamusela rito rin'wana na rin'wana hi xifaniso na swikombiso.",
    present: "Kombisa eka tlilasi",
    words: "marito",
  },
  ss: {
    title: "Emaceba emagama",
    sub: "Khetsa sifundvo, vula liceba, bese ulikhombisa likilasi. Gadit ichaza ligama ngalinye ngesitfombe netibonelo.",
    present: "Khombisa likilasi",
    words: "emagama",
  },
  ve: {
    title: "Zwigwada zwa maipfi",
    sub: "Khethani thero, vulani tshigwada, ni tshi sumbedze kilasini. Gadit i ṱalutshedza ipfi ḽiṅwe na ḽiṅwe nga tshifanyiso na tsumbo.",
    present: "Sumbedzani kilasini",
    words: "maipfi",
  },
  nr: {
    title: "Amaqoqo wamezwi",
    sub: "Khetha isifundo, vula iqoqo, bese ulitjengisa ekilasini. I-Gadit ihlathulula ilizwi ngalinye ngesithombe nezibonelo.",
    present: "Tjengisa ekilasini",
    words: "amezwi",
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
  const { user, schoolId, planReady } = useAuth();
  // Word sets are a schools product (Gadi 2026-10-04): only school
  // accounts get in. Hebrew shows the full Israeli curriculum catalog.
  if (!planReady) return <div className="wordbook" style={S.page} />;
  if (!user || !schoolId) return <SchoolsOnly lang={lang} dir={dir} />;

  const presentSet = (set: WordSet) =>
    router.push(href(`/word/${encodeURIComponent(set.words[0])}?present=1&set=${encodeURIComponent(set.id)}`));

  // The school's national curriculum (Israel, South Africa CAPS...); the old
  // hand-made view stays for schools marked "legacy" (Greenwarth for now).
  const legacy = (
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
  return <CurriculumBrowser legacy={legacy} />;
}

const SCHOOLS_ONLY_COPY: Record<string, [string, string, string, string]> = {
  en: ["Word sets are for schools","Every subject with key words to project in class.","Access is open to schools that work with Gadit.","Gadit for schools"],
  he: ["קבוצות המילים פתוחות לבתי ספר","כל מקצועות הלימוד, מגן ועד תיכון, עם מילות מפתח להקרנה בכיתה.","הגישה פתוחה לבתי ספר שעובדים עם Gadit.","לפרטים על Gadit לבתי ספר"],
  ar: ["مجموعات الكلمات مخصّصة للمدارس","كل المواد الدراسية مع كلمات مفتاحية لعرضها في الصف.","الوصول متاح للمدارس التي تعمل مع Gadit.","Gadit للمدارس"],
  ru: ["Наборы слов для школ","Все предметы с ключевыми словами для показа в классе.","Доступ открыт школам, которые работают с Gadit.","Gadit для школ"],
  es: ["Los conjuntos de palabras son para colegios","Todas las asignaturas con palabras clave para proyectar en clase.","El acceso está abierto a los colegios que trabajan con Gadit.","Gadit para colegios"],
  pt: ["Os conjuntos de palavras são para escolas","Todas as disciplinas com palavras-chave para projetar na aula.","O acesso está aberto às escolas que trabalham com o Gadit.","Gadit para escolas"],
  fr: ["Les listes de mots sont réservées aux écoles","Chaque matière avec ses mots clés à projeter en classe.","L'accès est ouvert aux écoles qui travaillent avec Gadit.","Gadit pour les écoles"],
  de: ["Wortsammlungen sind für Schulen","Jedes Fach mit Schlüsselwörtern zum Projizieren im Unterricht.","Der Zugang steht Schulen offen, die mit Gadit arbeiten.","Gadit für Schulen"],
  cs: ["Sady slov jsou pro školy","Každý předmět s klíčovými slovy k promítání ve třídě.","Přístup mají školy, které s Gadit spolupracují.","Gadit pro školy"],
  sk: ["Sady slov sú pre školy","Každý predmet s kľúčovými slovami na premietanie v triede.","Prístup majú školy, ktoré s Gadit spolupracujú.","Gadit pre školy"],
  it: ["Le raccolte di parole sono per le scuole","Ogni materia con le parole chiave da proiettare in classe.","L'accesso è aperto alle scuole che lavorano con Gadit.","Gadit per le scuole"],
  ja: ["単語セットは学校向けです","すべての教科のキーワードを授業で投影できます。","Gaditを導入している学校が利用できます。","学校向けGadit"],
  hi: ["शब्द-सेट स्कूलों के लिए हैं","हर विषय, कक्षा में दिखाने के लिए मुख्य शब्दों के साथ।","यह सुविधा उन स्कूलों के लिए है जो Gadit के साथ काम करते हैं।","स्कूलों के लिए Gadit"],
  am: ["የቃላት ስብስቦች ለትምህርት ቤቶች ናቸው","እያንዳንዱ የትምህርት ዓይነት በክፍል ውስጥ የሚታዩ ቁልፍ ቃላት አሉት።","ከGadit ጋር ለሚሰሩ ትምህርት ቤቶች ክፍት ነው።","Gadit ለትምህርት ቤቶች"],
  uk: ["Набори слів для шкіл","Усі предмети з ключовими словами для показу в класі.","Доступ відкритий школам, які працюють із Gadit.","Gadit для шкіл"],
  tr: ["Kelime setleri okullar içindir","Her ders, sınıfta yansıtılacak anahtar kelimelerle.","Erişim, Gadit ile çalışan okullara açıktır.","Okullar için Gadit"],
  pl: ["Zestawy słów są dla szkół","Każdy przedmiot ze słowami kluczowymi do wyświetlenia w klasie.","Dostęp mają szkoły, które współpracują z Gadit.","Gadit dla szkół"],
  fa: ["مجموعه‌های واژه برای مدارس است","همه درس‌ها با واژه‌های کلیدی برای نمایش در کلاس.","دسترسی برای مدارسی است که با Gadit کار می‌کنند.","Gadit برای مدارس"],
  id: ["Set kata khusus untuk sekolah","Setiap mata pelajaran dengan kata kunci untuk ditampilkan di kelas.","Akses terbuka untuk sekolah yang bekerja sama dengan Gadit.","Gadit untuk sekolah"],
  nl: ["Woordensets zijn voor scholen","Elk vak met kernwoorden om in de klas te projecteren.","De toegang staat open voor scholen die met Gadit werken.","Gadit voor scholen"],
  el: ["Τα σύνολα λέξεων είναι για σχολεία","Κάθε μάθημα με λέξεις-κλειδιά για προβολή στην τάξη.","Η πρόσβαση είναι ανοιχτή στα σχολεία που συνεργάζονται με το Gadit.","Gadit για σχολεία"],
  zu: ["Amaqoqo amagama awezikole","Zonke izifundo ezinamagama abalulekile okuwaveza ekilasini.","Ukufinyelela kuvulelwe izikole ezisebenza ne-Gadit.","I-Gadit yezikole"],
  xh: ["Amaqela amagama ngawezikolo","Sonke isifundo esinamagama aphambili okuwabonisa eklasini.","Ukufikelela kuvulelekile kwizikolo ezisebenza ne-Gadit.","Gadit yezikolo"],
  nso: ["Dihlopha tša mantšu ke tša dikolo","Thuto ye nngwe le ye nngwe e na le mantšu a bohlokwa a go bontšhwa phapošing.","Phihlelelo e bulegetše dikolo tšeo di šomago le Gadit.","Gadit ya dikolo"],
  tn: ["Disete tsa mafoko ke tsa dikolo","Serutwa sengwe le sengwe se na le mafoko a botlhokwa a go bontshiwa mo phaposing.","Phitlhelelo e bulegetse dikolo tse di dirang le Gadit.","Gadit ya dikolo"],
  st: ["Dihlopha tsa mantswe ke tsa dikolo","Thuto e nngwe le e nngwe e na le mantswe a bohlokwa a ho bontshwa tlelaseng.","Ho kena ho bulehetse dikolo tse sebetsang le Gadit.","Gadit bakeng sa dikolo"],
  ts: ["Mintlawa ya marito i ya swikolo","Dyondzo yin'wana na yin'wana yi na marito ya nkoka yo kombisa etlilasini.","Ku nghena ku pfulekele swikolo leswi tirhaka na Gadit.","Gadit ya swikolo"],
  ss: ["Emaceba emagama ngewetikolwa","Sifundvo ngasinye sinemagama lamcoka lokufanele akhonjiswe ekilasini.","Kungena kuvulekele tikolwa letisebenta ne-Gadit.","Gadit yetikolwa"],
  ve: ["Zwigwada zwa maipfi ndi zwa zwikolo","Thero iṅwe na iṅwe i na maipfi a ndeme a u sumbedza kilasini.","U dzhena ho vulelwa zwikolo zwine zwa shuma na Gadit.","Gadit kha zwikolo"],
  nr: ["Amaqoqo wamezwi ngewezikolo","Isifundo ngasinye sinamezwi aqakathekileko wokutjengiswa ekilasini.","Ukungena kuvulekele izikolo ezisebenzisana ne-Gadit.","I-Gadit yezikolo"],
  vi: ["Bộ từ dành cho trường học","Mọi môn học với các từ khóa để trình chiếu trên lớp.","Quyền truy cập dành cho các trường hợp tác với Gadit.","Gadit cho trường học"],
  fil: ["Para sa mga paaralan ang mga word set","Bawat asignatura na may mga susing salita na ipapakita sa klase.","Bukas ang access sa mga paaralang nakikipagtulungan sa Gadit.","Gadit para sa mga paaralan"],
  af: ["Woordstelle is vir skole","Elke vak met sleutelwoorde om in die klas te projekteer.","Toegang is oop vir skole wat met Gadit werk.","Gadit vir skole"],
  sw: ["Seti za maneno ni kwa ajili ya shule","Kila somo pamoja na maneno muhimu ya kuonyesha darasani.","Ufikiaji uko wazi kwa shule zinazofanya kazi na Gadit.","Gadit kwa shule"],
  "zh-CN": ["词汇集面向学校","每个学科都有可在课堂上投屏的关键词。","与 Gadit 合作的学校可以使用。","Gadit 学校版"],
  "zh-TW": ["詞彙集專為學校提供","每個學科都有可在課堂上投影的關鍵詞。","與 Gadit 合作的學校可以使用。","Gadit 學校版"],
  ko: ["단어 세트는 학교용입니다","모든 과목의 핵심 단어를 수업 시간에 화면에 띄울 수 있습니다.","Gadit과 함께하는 학교에 열려 있습니다.","학교용 Gadit"],
  th: ["ชุดคำศัพท์สำหรับโรงเรียน","ทุกวิชาพร้อมคำสำคัญสำหรับฉายในห้องเรียน","เปิดให้โรงเรียนที่ทำงานร่วมกับ Gadit ใช้งาน","Gadit สำหรับโรงเรียน"],
  bn: ["শব্দ-সেট স্কুলের জন্য","প্রতিটি বিষয়, ক্লাসে দেখানোর জন্য মূল শব্দসহ।","Gadit-এর সাথে কাজ করা স্কুলগুলোর জন্য প্রবেশাধিকার খোলা।","স্কুলের জন্য Gadit"],
  da: ["Ordsæt er til skoler","Alle fag med nøgleord, der kan vises i klassen.","Adgangen er åben for skoler, der arbejder med Gadit.","Gadit til skoler"],
  hu: ["A szókészletek iskoláknak szólnak","Minden tantárgy kulcsszavakkal, amelyeket az órán ki lehet vetíteni.","A hozzáférés a Gadittel dolgozó iskolák számára nyitott.","Gadit iskoláknak"],
};

function SchoolsOnly({ lang, dir }: { lang: string; dir: "rtl" | "ltr" }) {
  const href = useHref();
  const [title, sub1, sub2, cta] = SCHOOLS_ONLY_COPY[lang] ?? SCHOOLS_ONLY_COPY.en;
  return (
    <div className="wordbook" dir={dir} style={S.page}>
      <header style={S.header}>
        <Link href={href("/")} style={S.wordmark} dir="ltr" aria-label="Gadit home">
          Gad<span style={{ fontStyle: "italic", color: "#0EA5A5" }}>it</span>
        </Link>
      </header>
      <main style={{ ...S.main, textAlign: "center", paddingTop: 72 }}>
        <h1 style={S.h1}>{title}</h1>
        <p style={{ ...S.subtitle, margin: "0 auto 26px" }}>
          {sub1}
          <br />
          {sub2}
        </p>
        <Link href={href("/schools")} style={{ ...S.presentBtn, display: "inline-flex", width: "auto", padding: "12px 26px", textDecoration: "none" }}>
          {cta}
        </Link>
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
