/**
 * The Homework section's title and subtitle (Gadi 2026-10-11: "Dictation"
 * became "Homework", everything school sent home: dictation, a lesson from
 * the workbook's pages, lessons by topic). Same words as the nav label.
 */
export const HOMEWORK_COPY: Record<string, { title: string; sub: string }> = {
  en: { title: "Homework", sub: "Tonight's practice: spelling, workbook pages and lessons by topic." },
  he: { title: "שיעורי בית", sub: "התרגול של הערב: הכתבה, עמודים מהחוברת ושיעורים לפי נושא." },
  ar: { title: "الواجبات", sub: "تدريب الليلة: الإملاء وصفحات الكراسة ودروس حسب الموضوع." },
  ru: { title: "Домашка", sub: "Практика на вечер: диктант, страницы из тетради и уроки по темам." },
  es: { title: "Deberes", sub: "La práctica de esta noche: dictado, páginas del cuaderno y lecciones por tema." },
  pt: { title: "Tarefas", sub: "A prática de hoje à noite: ditado, páginas da apostila e lições por tema." },
  fr: { title: "Devoirs", sub: "L'entraînement du soir : dictée, pages du cahier et leçons par thème." },
  de: { title: "Hausaufgaben", sub: "Üben für heute Abend: Diktat, Seiten aus dem Arbeitsheft und Lektionen nach Themen." },
  cs: { title: "Úkoly", sub: "Procvičování na dnešní večer: diktát, stránky z pracovního sešitu a lekce podle témat." },
  sk: { title: "Úlohy", sub: "Precvičovanie na dnešný večer: diktát, strany z pracovného zošita a lekcie podľa tém." },
  it: { title: "Compiti", sub: "L'esercizio di stasera: dettato, pagine del quaderno e lezioni per argomento." },
  ja: { title: "宿題", sub: "今夜の練習：書き取り、ワークブックのページ、テーマ別のレッスン。" },
  hi: { title: "होमवर्क", sub: "आज रात का अभ्यास: श्रुतलेख, वर्कबुक के पन्ने और विषय के अनुसार पाठ।" },
  am: { title: "የቤት ሥራ", sub: "የዛሬ ምሽት ልምምድ፦ ቃላት መጻፍ፣ ከመልመጃ መጽሐፉ ገጾች እና በርዕስ የተደራጁ ትምህርቶች።" },
  uk: { title: "Домашка", sub: "Практика на вечір: диктант, сторінки з робочого зошита та уроки за темами." },
  tr: { title: "Ödevler", sub: "Bu akşamın çalışması: dikte, çalışma kitabı sayfaları ve konulara göre dersler." },
  pl: { title: "Prace domowe", sub: "Ćwiczenia na dziś wieczór: dyktando, strony z ćwiczeń i lekcje według tematów." },
  fa: { title: "تکالیف", sub: "تمرین امشب: دیکته، صفحه‌های کتاب کار و درس‌ها بر اساس موضوع." },
  id: { title: "PR", sub: "Latihan malam ini: dikte, halaman buku latihan, dan pelajaran per topik." },
  nl: { title: "Huiswerk", sub: "Oefenen voor vanavond: dictee, bladzijden uit het werkboek en lessen per onderwerp." },
  el: { title: "Εργασίες", sub: "Η εξάσκηση της βραδιάς: υπαγόρευση, σελίδες από το τετράδιο εργασιών και μαθήματα ανά θέμα." },
  zu: { title: "Umsebenzi wasekhaya", sub: "Ukuzijwayeza kwanamuhla kusihlwa: ukupela, amakhasi encwadi yokusebenza nezifundo ngezihloko." },
  vi: { title: "Bài tập", sub: "Bài luyện tối nay: chính tả, các trang trong sách bài tập và bài học theo chủ đề." },
  fil: { title: "Takdang-aralin", sub: "Ang pagsasanay ngayong gabi: pagbaybay, mga pahina ng workbook at mga aralin ayon sa paksa." },
  af: { title: "Huiswerk", sub: "Vanaand se oefening: spelling, bladsye uit die werkboek en lesse volgens onderwerp." },
  sw: { title: "Kazi ya nyumbani", sub: "Mazoezi ya leo usiku: imla, kurasa za kitabu cha mazoezi na masomo kwa mada." },
  "zh-CN": { title: "作业", sub: "今晚的练习：听写、练习册的页面和按主题的课程。" },
  "zh-TW": { title: "作業", sub: "今晚的練習：聽寫、作業簿的頁面和依主題的課程。" },
  ko: { title: "숙제", sub: "오늘 밤 연습: 받아쓰기, 문제집 페이지, 주제별 수업." },
  th: { title: "การบ้าน", sub: "การฝึกของคืนนี้: เขียนตามคำบอก หน้าจากแบบฝึกหัด และบทเรียนตามหัวข้อ" },
  bn: { title: "বাড়ির কাজ", sub: "আজ রাতের অনুশীলন: শ্রুতলিপি, ওয়ার্কবুকের পাতা আর বিষয় অনুযায়ী পাঠ।" },
  da: { title: "Lektier", sub: "Aftenens øvelse: diktat, sider fra arbejdsbogen og lektioner efter emne." },
  hu: { title: "Házi feladat", sub: "Az esti gyakorlás: tollbamondás, a munkafüzet oldalai és témák szerinti leckék." },
};

export function homeworkCopy(lang: string) {
  return HOMEWORK_COPY[lang] ?? HOMEWORK_COPY.en;
}
