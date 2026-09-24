"use client";

/**
 * Classroom Notebook — aggregated view of every word the class has
 * looked up. Anonymous (no auth), reaches the API via the classroom
 * code. Lets the teacher (or any kid) see "what did we search today"
 * and filter by student name when the roster is set up.
 *
 * Built 2026-06-29 alongside the topbar redesign so that pressing
 * "Class Notebook" in the topbar lands on a useful page rather than a
 * 404. Mirrors the look-and-feel of the regular /notebook page so a
 * kid switching between contexts feels at home.
 */

import { useEffect, useMemo, useState } from "react";
import { skinStyleVars, readStashedSkin } from "@/lib/school-skin";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

type SearchEntry = {
  word: string;
  language: string;
  studentName: string;
  createdAt: string;
};

const COPY: Record<string, {
  title: string;
  emptyTitle: string;
  emptyBody: string;
  filterAll: string;
  filterLabel: string;
  errorTitle: string;
  errorBody: string;
  backToClassroom: string;
}> = {
  he: {
    title: "מחברת הכיתה",
    emptyTitle: "עוד אין חיפושים",
    emptyBody: "כשתלמיד יחפש מילה, היא תופיע כאן.",
    filterAll: "כל התלמידים",
    filterLabel: "סנן לפי תלמיד",
    errorTitle: "אופס, משהו השתבש",
    errorBody: "נסו לרענן את הדף.",
    backToClassroom: "← חזרה לכיתה",
  },
  en: {
    title: "Class Notebook",
    emptyTitle: "No searches yet",
    emptyBody: "When a student looks up a word it will show here.",
    filterAll: "All students",
    filterLabel: "Filter by student",
    errorTitle: "Something went wrong",
    errorBody: "Try refreshing the page.",
    backToClassroom: "← Back to classroom",
  },
  zu: {
    title: "Incwadi Yekilasi",
    emptyTitle: "Akukho kusesha okwamanje",
    emptyBody: "Uma umfundi ebheka igama, lizovela lapha.",
    filterAll: "Bonke abafundi",
    filterLabel: "Hlunga ngomfundi",
    errorTitle: "Kukhona okungahambanga kahle",
    errorBody: "Zama ukuvuselela ikhasi.",
    backToClassroom: "← Buyela ekilasini",
  },
  el: {
    title: "Τετράδιο τάξης",
    emptyTitle: "Δεν υπάρχουν αναζητήσεις ακόμη",
    emptyBody: "Όταν ένας μαθητής αναζητήσει μια λέξη, θα εμφανιστεί εδώ.",
    filterAll: "Όλοι οι μαθητές",
    filterLabel: "Φιλτράρισμα κατά μαθητή",
    errorTitle: "Κάτι πήγε στραβά",
    errorBody: "Δοκίμασε να ανανεώσεις τη σελίδα.",
    backToClassroom: "← Πίσω στην τάξη",
  },
  ar: {
    title: "دفتر الفصل",
    emptyTitle: "لا توجد عمليات بحث بعد",
    emptyBody: "عندما يبحث الطلاب عن كلمة، ستظهر هنا.",
    filterAll: "كل الطلاب",
    filterLabel: "تصفية حسب الطالب",
    errorTitle: "حدث خطأ",
    errorBody: "حاول تحديث الصفحة.",
    backToClassroom: "← العودة إلى الصف",
  },
  ru: {
    title: "Тетрадь класса",
    emptyTitle: "Пока нет поисков",
    emptyBody: "Когда ученик найдёт слово, оно появится здесь.",
    filterAll: "Все ученики",
    filterLabel: "Фильтр по ученику",
    errorTitle: "Что-то пошло не так",
    errorBody: "Попробуйте обновить страницу.",
    backToClassroom: "← Вернуться в класс",
  },
  hi: {
    title: "कक्षा की नोटबुक",
    emptyTitle: "अभी तक कोई खोज नहीं",
    emptyBody: "जब कोई छात्र शब्द खोजेगा, वह यहाँ दिखाई देगा।",
    filterAll: "सभी छात्र",
    filterLabel: "छात्र के अनुसार छानें",
    errorTitle: "कुछ गलत हो गया",
    errorBody: "पेज को रीफ्रेश करने का प्रयास करें।",
    backToClassroom: "← कक्षा में वापस",
  },
  am: {
    title: "የክፍል ማስታወሻ ደብተር",
    emptyTitle: "እስካሁን ምንም ፍለጋ የለም",
    emptyBody: "አንድ ተማሪ ቃል ሲፈልግ፣ እዚህ ይታያል።",
    filterAll: "ሁሉም ተማሪዎች",
    filterLabel: "በተማሪ ማጣራት",
    errorTitle: "የሆነ ስህተት ተፈጥሯል",
    errorBody: "ገጹን ለማደስ ሞክሩ።",
    backToClassroom: "← ወደ ክፍል ተመለሱ",
  },
  es: {
    title: "Cuaderno de la clase",
    emptyTitle: "Todavía no hay búsquedas",
    emptyBody: "Cuando alguien de la clase busque una palabra, aparecerá aquí.",
    filterAll: "Todos los alumnos",
    filterLabel: "Filtrar por alumno",
    errorTitle: "Algo salió mal",
    errorBody: "Prueba a recargar la página.",
    backToClassroom: "← Volver a la clase",
  },
  pt: {
    title: "Caderno da turma",
    emptyTitle: "Ainda não há buscas",
    emptyBody: "Quando alguém da turma procurar uma palavra, ela aparece aqui.",
    filterAll: "Todos os alunos",
    filterLabel: "Filtrar por aluno",
    errorTitle: "Algo deu errado",
    errorBody: "Tente atualizar a página.",
    backToClassroom: "← Voltar para a turma",
  },
  fr: {
    title: "Cahier de la classe",
    emptyTitle: "Aucune recherche pour l'instant",
    emptyBody: "Quand un élève cherche un mot, il apparaît ici.",
    filterAll: "Tous les élèves",
    filterLabel: "Filtrer par élève",
    errorTitle: "Oups, un problème est survenu",
    errorBody: "Essaie de recharger la page.",
    backToClassroom: "← Retour à la classe",
  },
  de: {
    title: "Klassenheft",
    emptyTitle: "Noch keine Suchen",
    emptyBody: "Wenn jemand aus der Klasse ein Wort nachschlägt, erscheint es hier.",
    filterAll: "Alle Schüler",
    filterLabel: "Nach Schüler filtern",
    errorTitle: "Da ist etwas schiefgelaufen",
    errorBody: "Lade die Seite einfach neu.",
    backToClassroom: "← Zurück zur Klasse",
  },
  cs: {
    title: "Sešit třídy",
    emptyTitle: "Zatím žádné hledání",
    emptyBody: "Když někdo ze třídy vyhledá slovo, objeví se tady.",
    filterAll: "Všichni žáci",
    filterLabel: "Filtrovat podle žáka",
    errorTitle: "Něco se pokazilo",
    errorBody: "Zkus stránku načíst znovu.",
    backToClassroom: "← Zpět do třídy",
  },
  sk: {
    title: "Zošit triedy",
    emptyTitle: "Zatiaľ žiadne hľadanie",
    emptyBody: "Keď niekto z triedy vyhľadá slovo, objaví sa tu.",
    filterAll: "Všetci žiaci",
    filterLabel: "Filtrovať podľa žiaka",
    errorTitle: "Niečo sa pokazilo",
    errorBody: "Skús stránku načítať znova.",
    backToClassroom: "← Späť do triedy",
  },
  it: {
    title: "Quaderno della classe",
    emptyTitle: "Ancora nessuna ricerca",
    emptyBody: "Quando qualcuno della classe cerca una parola, la trovi qui.",
    filterAll: "Tutti gli studenti",
    filterLabel: "Filtra per studente",
    errorTitle: "Qualcosa è andato storto",
    errorBody: "Prova a ricaricare la pagina.",
    backToClassroom: "← Torna alla classe",
  },
  ja: {
    title: "クラスのノート",
    emptyTitle: "まだ調べたことばはありません",
    emptyBody: "クラスのだれかがことばを調べると、ここに出てきます。",
    filterAll: "クラス全員",
    filterLabel: "人でしぼりこむ",
    errorTitle: "うまくいきませんでした",
    errorBody: "ページを読みこみなおしてみてね。",
    backToClassroom: "← クラスにもどる",
  },
  uk: {
    title: "Зошит класу",
    emptyTitle: "Поки що немає пошуків",
    emptyBody: "Коли хтось із класу знайде слово, воно з'явиться тут.",
    filterAll: "Усі учні",
    filterLabel: "Фільтр за учнем",
    errorTitle: "Щось пішло не так",
    errorBody: "Спробуй оновити сторінку.",
    backToClassroom: "← Повернутися до класу",
  },
  tr: {
    title: "Sınıf Defteri",
    emptyTitle: "Henüz arama yok",
    emptyBody: "Sınıftan biri bir kelime aradığında burada görünecek.",
    filterAll: "Tüm öğrenciler",
    filterLabel: "Öğrenciye göre filtrele",
    errorTitle: "Bir şeyler ters gitti",
    errorBody: "Sayfayı yenilemeyi dene.",
    backToClassroom: "← Sınıfa dön",
  },
  pl: {
    title: "Zeszyt klasy",
    emptyTitle: "Na razie brak wyszukiwań",
    emptyBody: "Gdy ktoś z klasy wyszuka słowo, pojawi się ono tutaj.",
    filterAll: "Wszyscy uczniowie",
    filterLabel: "Filtruj według ucznia",
    errorTitle: "Coś poszło nie tak",
    errorBody: "Spróbuj odświeżyć stronę.",
    backToClassroom: "← Wróć do klasy",
  },
  fa: {
    title: "دفترچه کلاس",
    emptyTitle: "هنوز جست‌وجویی نشده",
    emptyBody: "وقتی کسی از کلاس کلمه‌ای را جست‌وجو کند، اینجا نشان داده می‌شود.",
    filterAll: "همه دانش‌آموزان",
    filterLabel: "فیلتر بر اساس دانش‌آموز",
    errorTitle: "اوه، مشکلی پیش آمد",
    errorBody: "صفحه را دوباره بارگذاری کن.",
    backToClassroom: "← بازگشت به کلاس",
  },
  id: {
    title: "Buku Catatan Kelas",
    emptyTitle: "Belum ada pencarian",
    emptyBody: "Saat ada teman sekelas mencari kata, kata itu akan muncul di sini.",
    filterAll: "Semua siswa",
    filterLabel: "Saring per siswa",
    errorTitle: "Ada yang salah",
    errorBody: "Coba muat ulang halamannya.",
    backToClassroom: "← Kembali ke kelas",
  },
  nl: {
    title: "Klasschrift",
    emptyTitle: "Nog geen zoekopdrachten",
    emptyBody: "Als iemand uit de klas een woord opzoekt, zie je het hier.",
    filterAll: "Alle leerlingen",
    filterLabel: "Filter op leerling",
    errorTitle: "Er ging iets mis",
    errorBody: "Probeer de pagina te vernieuwen.",
    backToClassroom: "← Terug naar de klas",
  },
  vi: {
    title: "Sổ tay của lớp",
    emptyTitle: "Chưa có lượt tra từ nào",
    emptyBody: "Khi một bạn trong lớp tra một từ, từ đó sẽ hiện ở đây.",
    filterAll: "Tất cả học sinh",
    filterLabel: "Lọc theo học sinh",
    errorTitle: "Có lỗi xảy ra",
    errorBody: "Hãy thử tải lại trang nhé.",
    backToClassroom: "← Quay lại lớp học",
  },
  fil: {
    title: "Kuwaderno ng Klase",
    emptyTitle: "Wala pang hinahanap",
    emptyBody: "Kapag may kaklaseng naghanap ng salita, lalabas ito rito.",
    filterAll: "Lahat ng estudyante",
    filterLabel: "I-filter ayon sa estudyante",
    errorTitle: "May nangyaring mali",
    errorBody: "Subukang i-refresh ang page.",
    backToClassroom: "← Bumalik sa klase",
  },
  af: {
    title: "Klasnotaboek",
    emptyTitle: "Nog geen soektogte nie",
    emptyBody: "Wanneer iemand in die klas 'n woord opsoek, sal dit hier verskyn.",
    filterAll: "Alle leerders",
    filterLabel: "Filtreer volgens leerder",
    errorTitle: "Iets het verkeerd geloop",
    errorBody: "Probeer die bladsy herlaai.",
    backToClassroom: "← Terug na die klas",
  },
  sw: {
    title: "Daftari la Darasa",
    emptyTitle: "Bado hakuna utafutaji",
    emptyBody: "Mwanafunzi akitafuta neno, litaonekana hapa.",
    filterAll: "Wanafunzi wote",
    filterLabel: "Chuja kwa mwanafunzi",
    errorTitle: "Kuna tatizo limetokea",
    errorBody: "Jaribu kupakia upya ukurasa.",
    backToClassroom: "← Rudi darasani",
  },
  "zh-CN": {
    title: "班级笔记本",
    emptyTitle: "还没有人查过单词",
    emptyBody: "同学查了单词后，就会出现在这里。",
    filterAll: "全部同学",
    filterLabel: "按同学筛选",
    errorTitle: "哎呀，出了点问题",
    errorBody: "试试刷新页面吧。",
    backToClassroom: "← 返回班级",
  },
  "zh-TW": {
    title: "班級筆記本",
    emptyTitle: "還沒有人查過單字",
    emptyBody: "同學查了單字後，就會出現在這裡。",
    filterAll: "全部同學",
    filterLabel: "依同學篩選",
    errorTitle: "哎呀，出了點問題",
    errorBody: "試試重新整理頁面吧。",
    backToClassroom: "← 返回班級",
  },
  ko: {
    title: "우리 반 단어장",
    emptyTitle: "아직 찾아본 단어가 없어요",
    emptyBody: "반 친구가 단어를 찾아보면 여기에 나타나요.",
    filterAll: "모든 학생",
    filterLabel: "학생별로 보기",
    errorTitle: "앗, 문제가 생겼어요",
    errorBody: "페이지를 새로고침해 보세요.",
    backToClassroom: "← 반으로 돌아가기",
  },
  th: {
    title: "สมุดของห้องเรียน",
    emptyTitle: "ยังไม่มีการค้นหา",
    emptyBody: "เมื่อเพื่อนในห้องค้นหาคำ คำนั้นจะขึ้นที่นี่",
    filterAll: "นักเรียนทุกคน",
    filterLabel: "กรองตามนักเรียน",
    errorTitle: "อุ๊ย มีบางอย่างผิดพลาด",
    errorBody: "ลองรีเฟรชหน้านี้ดูนะ",
    backToClassroom: "← กลับไปที่ห้องเรียน",
  },
  bn: {
    title: "ক্লাসের খাতা",
    emptyTitle: "এখনো কোনো খোঁজ নেই",
    emptyBody: "ক্লাসের কেউ কোনো শব্দ খুঁজলে সেটা এখানে দেখা যাবে।",
    filterAll: "সব শিক্ষার্থী",
    filterLabel: "শিক্ষার্থী অনুযায়ী দেখো",
    errorTitle: "কিছু একটা গোলমাল হয়েছে",
    errorBody: "পেজটা রিফ্রেশ করে দেখো।",
    backToClassroom: "← ক্লাসে ফিরে যাও",
  },
  da: {
    title: "Klassens notesbog",
    emptyTitle: "Ingen søgninger endnu",
    emptyBody: "Når nogen i klassen slår et ord op, dukker det op her.",
    filterAll: "Alle elever",
    filterLabel: "Filtrer efter elev",
    errorTitle: "Noget gik galt",
    errorBody: "Prøv at genindlæse siden.",
    backToClassroom: "← Tilbage til klassen",
  },
  hu: {
    title: "Osztályfüzet",
    emptyTitle: "Még nincs keresés",
    emptyBody: "Ha valaki az osztályból rákeres egy szóra, itt fog megjelenni.",
    filterAll: "Minden diák",
    filterLabel: "Szűrés diák szerint",
    errorTitle: "Valami hiba történt",
    errorBody: "Próbáld meg frissíteni az oldalt.",
    backToClassroom: "← Vissza az osztályhoz",
  },
};

type State =
  | { kind: "loading" }
  | { kind: "ok"; searches: SearchEntry[] }
  | { kind: "error" };

// Top-students strip copy (en fallback), kept separate from the main COPY.
const TOP_COPY: Record<string, { heading: string; words: (n: number) => string }> = {
  en: { heading: "Top students", words: (n) => `${n} ${n === 1 ? "word" : "words"}` },
  he: { heading: "התלמידים המובילים", words: (n) => `${n} מילים` },
  ar: { heading: "الطلاب الأكثر نشاطًا", words: (n) => `${n} كلمات` },
  ru: { heading: "Самые активные", words: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? "слово" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "слова" : "слов"}` },
  es: { heading: "Mejores alumnos", words: (n) => `${n} palabras` },
  fr: { heading: "Meilleurs élèves", words: (n) => `${n} mots` },
  pt: { heading: "Alunos em destaque", words: (n) => `${n} ${n === 1 ? "palavra" : "palavras"}` },
  de: { heading: "Top-Schüler", words: (n) => `${n} ${n === 1 ? "Wort" : "Wörter"}` },
  it: { heading: "Studenti più attivi", words: (n) => `${n} ${n === 1 ? "parola" : "parole"}` },
  nl: { heading: "Topleerlingen", words: (n) => `${n} ${n === 1 ? "woord" : "woorden"}` },
  da: { heading: "Mest aktive elever", words: (n) => `${n} ord` },
  af: { heading: "Topleerders", words: (n) => `${n} ${n === 1 ? "woord" : "woorde"}` },
  cs: { heading: "Nejaktivnější žáci", words: (n) => `${n} ${n === 1 ? "slovo" : n >= 2 && n <= 4 ? "slova" : "slov"}` },
  sk: { heading: "Najaktívnejší žiaci", words: (n) => `${n} ${n === 1 ? "slovo" : n >= 2 && n <= 4 ? "slová" : "slov"}` },
  pl: { heading: "Najaktywniejsi uczniowie", words: (n) => `${n} ${n === 1 ? "słowo" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "słowa" : "słów"}` },
  uk: { heading: "Найактивніші учні", words: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? "слово" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "слова" : "слів"}` },
  el: { heading: "Κορυφαίοι μαθητές", words: (n) => `${n} ${n === 1 ? "λέξη" : "λέξεις"}` },
  hu: { heading: "Legaktívabb diákok", words: (n) => `${n} szó` },
  tr: { heading: "En aktif öğrenciler", words: (n) => `${n} kelime` },
  fa: { heading: "دانش‌آموزان برتر", words: (n) => `${n} کلمه` },
  id: { heading: "Siswa teraktif", words: (n) => `${n} kata` },
  vi: { heading: "Học sinh tích cực nhất", words: (n) => `${n} từ` },
  fil: { heading: "Pinakaaktibong estudyante", words: (n) => `${n} salita` },
  sw: { heading: "Wanafunzi bora", words: (n) => `${n === 1 ? "neno" : "maneno"} ${n}` },
  zu: { heading: "Abafundi abaphambili", words: (n) => `${n === 1 ? "igama" : "amagama"} ${n}` },
  hi: { heading: "सबसे सक्रिय छात्र", words: (n) => `${n} शब्द` },
  bn: { heading: "সবচেয়ে সক্রিয় শিক্ষার্থী", words: (n) => `${n}টি শব্দ` },
  am: { heading: "ግንባር ቀደም ተማሪዎች", words: (n) => `${n} ቃላት` },
  ja: { heading: "トップの生徒", words: (n) => `${n}語` },
  ko: { heading: "가장 활발한 학생", words: (n) => `${n}개 단어` },
  th: { heading: "นักเรียนที่ค้นมากที่สุด", words: (n) => `${n} คำ` },
  "zh-CN": { heading: "最活跃的同学", words: (n) => `${n} 个词` },
  "zh-TW": { heading: "最活躍的同學", words: (n) => `${n} 個詞` },
};

function useClassroomSkin(code: string) {
  const [skin, setSkin] = useState<string | null>(null);
  useEffect(() => { setSkin(readStashedSkin(code)); }, [code]);
  return skinStyleVars(skin);
}

export function ClassroomNotebookClient({ code }: { code: string }) {
  const { lang, dir } = useLang();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;
  const [state, setState] = useState<State>({ kind: "loading" });
  const [studentFilter, setStudentFilter] = useState<string>("");
  const skinVars = useClassroomSkin(code);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/classroom/searches?code=${encodeURIComponent(code)}`);
        if (cancelled) return;
        if (!res.ok) {
          setState({ kind: "error" });
          return;
        }
        const data = (await res.json()) as { searches: SearchEntry[] };
        setState({ kind: "ok", searches: data.searches });
      } catch {
        if (!cancelled) setState({ kind: "error" });
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  // Build the list of student names appearing in the search history,
  // for the filter dropdown. Empty strings (anonymous searches) get
  // collapsed into the "All" choice rather than shown as their own row.
  const studentOptions = useMemo(() => {
    if (state.kind !== "ok") return [] as string[];
    const set = new Set<string>();
    for (const s of state.searches) {
      if (s.studentName) set.add(s.studentName);
    }
    return Array.from(set).sort();
  }, [state]);

  const filteredSearches = useMemo(() => {
    if (state.kind !== "ok") return [] as SearchEntry[];
    if (!studentFilter) return state.searches;
    return state.searches.filter((s) => s.studentName === studentFilter);
  }, [state, studentFilter]);

  // Top students by number of lookups (named only), so the teacher always
  // sees who is most active at a glance. (Gadi 2026-08-25.)
  const topStudents = useMemo(() => {
    if (state.kind !== "ok") return [] as { name: string; count: number }[];
    const counts = new Map<string, number>();
    for (const s of state.searches) {
      const n = (s.studentName ?? "").trim();
      if (n) counts.set(n, (counts.get(n) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [state]);

  return (
    <div className="wordbook wb-school-page" dir={dir} style={skinVars}>
      <header className="wb-classroom-topbar">
        <Link href={href("/")} aria-label="Gadit" dir="ltr" className="wb-classroom-wordmark">
          Gad<span className="wb-classroom-wordmark-it">it</span>
        </Link>
        <nav className="wb-classroom-nav">
          <Link href={href(`/c/${code}`)} className="wb-classroom-nav-link">
            {c.backToClassroom}
          </Link>
        </nav>
      </header>

      <main className="wb-school-main" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <h1 style={{
          fontFamily: "var(--wb-serif)",
          fontSize: "clamp(26px, 4vw, 36px)",
          fontWeight: 700,
          color: "var(--ink)",
          margin: "0 0 24px",
        }}>
          {c.title}
        </h1>

        {state.kind === "loading" && (
          <div className="wb-classroom-notebook-skeleton" aria-hidden="true" />
        )}

        {state.kind === "error" && (
          <div className="wb-classroom-notebook-empty">
            <div className="wb-classroom-notebook-empty-title">{c.errorTitle}</div>
            <p>{c.errorBody}</p>
          </div>
        )}

        {state.kind === "ok" && state.searches.length === 0 && (
          <div className="wb-classroom-notebook-empty">
            <div className="wb-classroom-notebook-empty-title">{c.emptyTitle}</div>
            <p>{c.emptyBody}</p>
          </div>
        )}

        {state.kind === "ok" && state.searches.length > 0 && (
          <>
            {topStudents.length > 0 && (() => {
              const tc = TOP_COPY[lang] ?? TOP_COPY.en;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div
                  style={{
                    marginBottom: 20, padding: "14px 16px", borderRadius: 14,
                    background: "color-mix(in srgb, var(--accent, #0EA5A5) 8%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--accent, #0EA5A5) 25%, transparent)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--accent, #0EA5A5)", marginBottom: 10 }}>
                    {tc.heading}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {topStudents.map((s, i) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setStudentFilter(s.name)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 8,
                          padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                          background: "var(--surface, #fff)",
                          border: "1px solid var(--rule, #E5E7EB)",
                        }}
                      >
                        <span style={{ fontSize: 18 }} aria-hidden="true">{medals[i]}</span>
                        <span style={{ fontWeight: 700, color: "var(--ink, #111827)" }}>{s.name}</span>
                        <span style={{ fontSize: 12, color: "var(--ink-soft, #6B7280)", fontVariantNumeric: "tabular-nums" }}>{tc.words(s.count)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
            {studentOptions.length > 0 && (
              <div className="wb-classroom-notebook-filter">
                <label htmlFor="student-filter">{c.filterLabel}:</label>
                <select
                  id="student-filter"
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                >
                  <option value="">{c.filterAll}</option>
                  {studentOptions.map((sn) => (
                    <option key={sn} value={sn}>{sn}</option>
                  ))}
                </select>
              </div>
            )}

            <ul className="wb-classroom-notebook-list">
              {filteredSearches.map((s, i) => (
                // Student name leads (right in RTL, left in LTR) so a teacher
                // can scan by pupil; the word + time sit on the far side.
                // (Gadi 2026-08-25.)
                <li key={i} className="wb-classroom-notebook-row">
                  <span className="wb-classroom-notebook-student">
                    {s.studentName || c.filterAll}
                  </span>
                  <div className="wb-classroom-notebook-meta">
                    <Link
                      href={href(`/word/${encodeURIComponent(s.word)}?cls=${encodeURIComponent(code)}`)}
                      className="wb-classroom-notebook-word"
                      lang={s.language || undefined}
                    >
                      {s.word}
                    </Link>
                    <span className="wb-classroom-notebook-time">
                      {formatRelativeTime(s.createdAt, lang)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

/** Lightweight relative-time formatter that doesn't drag in
 *  Intl.RelativeTimeFormat (which has spotty support across the older
 *  browsers a school computer might run). Returns short labels: "5m",
 *  "2h", "3d", or a calendar date for entries more than 7 days old. */
function formatRelativeTime(iso: string, lang: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) {
    return lang === "he" ? "עכשיו" : lang === "ar" ? "الآن" : lang === "ru" ? "сейчас" : lang === "hi" ? "अभी" : lang === "am" ? "አሁን" : "now";
  }
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  try {
    return new Date(iso).toLocaleDateString(lang);
  } catch {
    return new Date(iso).toLocaleDateString();
  }
}
