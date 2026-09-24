"use client";

/**
 * Kid-facing classroom landing.
 *
 * Resolves the code via /api/classroom/lookup. On success:
 *   - Shows the school logo + school name as the page chrome.
 *   - Shows the classroom name as the welcome line.
 *   - Renders a single search box. Submit routes to /word/<word>?cls=<CODE>
 *     so the result page knows to log this search to the classroom log.
 *
 * On invalid/expired code:
 *   - Soft error: "ask your teacher for the link again."
 *
 * Deliberately spartan: no nav, no footer, no upsell. A kid on a shared
 * classroom computer should see exactly one job-to-be-done: type a word.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import { useHref, wordPath } from "@/lib/href";
import { LANGUAGES } from "@/lib/i18n";
import { KidsModeToggle } from "@/components/KidsModeToggle";
import { useKidsMode } from "@/lib/use-kids-mode";
import VoiceInput from "@/components/VoiceInput";
import { skinStyleVars, stashSkin } from "@/lib/school-skin";

// Inline SearchIcon — kept local to avoid a primitives import cycle and
// to match the homepage's identical SVG so the two surfaces look the
// same down to the pixel.
function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m15 15 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

type LookupOk = {
  schoolId: string;
  classroomId: string;
  schoolName: string;
  schoolLogoUrl: string | null;
  skinAccent: string | null;
  classroomName: string;
  students: string[];
  inSession: boolean;
  schedule: {
    startMinute: number;
    endMinute: number;
    days: number[];
    timezone: string;
  };
};
type LookupState =
  | { kind: "loading" }
  | { kind: "ok"; data: LookupOk }
  | { kind: "error" };

const COPY: Record<string, {
  welcomeTo: string;
  greetingPrefix: string;
  switchUser: string;
  pickName: string;
  classroomDefault: string;
  searchPh: string;
  searchBtn: string;
  sentencePh: string;
  errorTitle: string;
  errorBody: string;
  games: string;
  notebook: string;
}> = {
  he: {
    welcomeTo: "ברוכים הבאים",
    greetingPrefix: "שלום",
    switchUser: "(לא אני)",
    pickName: "שלום! בחרו את השם שלכם",
    classroomDefault: "כיתה",
    searchPh: "הקלידו מילה",
    searchBtn: "חיפוש",
    sentencePh: "(אופציונלי) הקלידו את המשפט שבו מופיעה המילה כדי לקבל הגדרה מדויקת אחת",
    errorTitle: "הקוד לא תקין",
    errorBody: "בקשו מהמורה את הלינק שוב.",
    games: "משחקי מילים",
    notebook: "מחברת הכיתה",
  },
  en: {
    welcomeTo: "Welcome to",
    greetingPrefix: "Hi",
    switchUser: "(not me)",
    pickName: "Hi! Pick your name",
    classroomDefault: "Classroom",
    searchPh: "Type a word",
    searchBtn: "Look up",
    sentencePh: "(Optional) Type the sentence where the word appears to get one precise definition",
    errorTitle: "Code not valid",
    errorBody: "Ask your teacher for the link again.",
    games: "Word Games",
    notebook: "Class Notebook",
  },
  zu: {
    welcomeTo: "Siyakwamukela ku-",
    greetingPrefix: "Sawubona",
    switchUser: "(akumina)",
    pickName: "Sawubona! Khetha igama lakho",
    classroomDefault: "Igumbi lokufunda",
    searchPh: "Thayipha igama",
    searchBtn: "Bheka",
    sentencePh: "(Kungakhethwa) Thayipha umusho igama elivela kuwo ukuze uthole incazelo eyodwa enembayo",
    errorTitle: "Ikhodi ayilungile",
    errorBody: "Cela uthisha wakho isixhumanisi futhi.",
    games: "Imidlalo Yamagama",
    notebook: "Incwadi Yekilasi",
  },
  el: {
    welcomeTo: "Καλώς ήρθες στην",
    greetingPrefix: "Γεια",
    switchUser: "(δεν είμαι εγώ)",
    pickName: "Γεια! Διάλεξε το όνομά σου",
    classroomDefault: "Τάξη",
    searchPh: "Πληκτρολόγησε μια λέξη",
    searchBtn: "Αναζήτηση",
    sentencePh: "(Προαιρετικό) Πληκτρολόγησε την πρόταση όπου εμφανίζεται η λέξη για να λάβεις έναν ακριβή ορισμό",
    errorTitle: "Μη έγκυρος κωδικός",
    errorBody: "Ζήτησε ξανά τον σύνδεσμο από τον δάσκαλό σου.",
    games: "Παιχνίδια λέξεων",
    notebook: "Τετράδιο τάξης",
  },
  hi: {
    welcomeTo: "स्वागत है",
    greetingPrefix: "नमस्ते",
    switchUser: "(मैं नहीं)",
    pickName: "नमस्ते! अपना नाम चुनें",
    classroomDefault: "कक्षा",
    searchPh: "कोई शब्द लिखें",
    searchBtn: "खोजें",
    sentencePh: "(वैकल्पिक) वह वाक्य लिखें जिसमें शब्द आया है, सटीक एक परिभाषा मिलेगी",
    errorTitle: "कोड मान्य नहीं है",
    errorBody: "अपने शिक्षक से लिंक फिर से माँगें।",
    games: "शब्द खेल",
    notebook: "कक्षा की नोटबुक",
  },
  am: {
    welcomeTo: "እንኳን ደህና መጣችሁ ወደ",
    greetingPrefix: "ሰላም",
    switchUser: "(እኔ አይደለሁም)",
    pickName: "ሰላም! ስማችሁን ምረጡ",
    classroomDefault: "ክፍል",
    searchPh: "ቃል ጻፉ",
    searchBtn: "ፈልጉ",
    sentencePh: "(ካስፈለገ) ቃሉ ያለበትን ዓረፍተ ነገር ጻፉ፣ አንድ ትክክለኛ ትርጉም ታገኛላችሁ",
    errorTitle: "ኮዱ ትክክል አይደለም",
    errorBody: "መምህራችሁን ሊንኩን እንደገና ጠይቁ።",
    games: "የቃላት ጨዋታዎች",
    notebook: "የክፍል ማስታወሻ ደብተር",
  },
  ar: {
    welcomeTo: "أهلًا بك في",
    greetingPrefix: "مرحبًا",
    switchUser: "(لست أنا)",
    pickName: "مرحبًا! اختر اسمك",
    classroomDefault: "الصف",
    searchPh: "اكتب كلمة",
    searchBtn: "ابحث",
    sentencePh: "(اختياري) اكتب الجملة التي وردت فيها الكلمة لتحصل على معنى واحد دقيق",
    errorTitle: "الرمز غير صحيح",
    errorBody: "اطلب الرابط من معلمك مرة أخرى.",
    games: "ألعاب الكلمات",
    notebook: "دفتر الصف",
  },
  ru: {
    welcomeTo: "Добро пожаловать в класс",
    greetingPrefix: "Привет",
    switchUser: "(это не я)",
    pickName: "Привет! Выбери своё имя",
    classroomDefault: "Класс",
    searchPh: "Напиши слово",
    searchBtn: "Найти",
    sentencePh: "(Необязательно) Напиши предложение, где встретилось слово, и получишь одно точное значение",
    errorTitle: "Код неверный",
    errorBody: "Попроси у учителя ссылку ещё раз.",
    games: "Игры со словами",
    notebook: "Тетрадь класса",
  },
  es: {
    welcomeTo: "Te damos la bienvenida a",
    greetingPrefix: "Hola",
    switchUser: "(no soy yo)",
    pickName: "¡Hola! Elige tu nombre",
    classroomDefault: "Clase",
    searchPh: "Escribe una palabra",
    searchBtn: "Buscar",
    sentencePh: "(Opcional) Escribe la frase donde aparece la palabra para obtener una definición precisa",
    errorTitle: "Código no válido",
    errorBody: "Pide a tu profe el enlace otra vez.",
    games: "Juegos de palabras",
    notebook: "Cuaderno de la clase",
  },
  pt: {
    welcomeTo: "Boas-vindas à",
    greetingPrefix: "Oi",
    switchUser: "(não sou eu)",
    pickName: "Oi! Escolha seu nome",
    classroomDefault: "Turma",
    searchPh: "Digite uma palavra",
    searchBtn: "Buscar",
    sentencePh: "(Opcional) Digite a frase em que a palavra aparece para ter uma definição exata",
    errorTitle: "Código inválido",
    errorBody: "Peça o link de novo para seu professor.",
    games: "Jogos de palavras",
    notebook: "Caderno da turma",
  },
  fr: {
    welcomeTo: "Bienvenue dans",
    greetingPrefix: "Salut",
    switchUser: "(ce n'est pas moi)",
    pickName: "Salut ! Choisis ton prénom",
    classroomDefault: "la classe",
    searchPh: "Écris un mot",
    searchBtn: "Chercher",
    sentencePh: "(Facultatif) Écris la phrase où se trouve le mot pour avoir une seule définition précise",
    errorTitle: "Code non valide",
    errorBody: "Redemande le lien à ton enseignant.",
    games: "Jeux de mots",
    notebook: "Cahier de la classe",
  },
  de: {
    welcomeTo: "Willkommen in",
    greetingPrefix: "Hallo",
    switchUser: "(nicht ich)",
    pickName: "Hallo! Wähl deinen Namen",
    classroomDefault: "der Klasse",
    searchPh: "Schreib ein Wort",
    searchBtn: "Nachschlagen",
    sentencePh: "(Optional) Schreib den Satz, in dem das Wort vorkommt, dann bekommst du genau eine passende Erklärung",
    errorTitle: "Code ungültig",
    errorBody: "Frag deine Lehrkraft noch einmal nach dem Link.",
    games: "Wortspiele",
    notebook: "Klassenheft",
  },
  cs: {
    welcomeTo: "Vítej ve třídě",
    greetingPrefix: "Ahoj",
    switchUser: "(to nejsem já)",
    pickName: "Ahoj! Vyber si své jméno",
    classroomDefault: "Třída",
    searchPh: "Napiš slovo",
    searchBtn: "Hledat",
    sentencePh: "(Nepovinné) Napiš větu, ve které se slovo objevilo, a dostaneš jeden přesný význam",
    errorTitle: "Neplatný kód",
    errorBody: "Požádej učitele znovu o odkaz.",
    games: "Slovní hry",
    notebook: "Sešit třídy",
  },
  sk: {
    welcomeTo: "Vitaj v triede",
    greetingPrefix: "Ahoj",
    switchUser: "(to nie som ja)",
    pickName: "Ahoj! Vyber si svoje meno",
    classroomDefault: "Trieda",
    searchPh: "Napíš slovo",
    searchBtn: "Hľadať",
    sentencePh: "(Nepovinné) Napíš vetu, v ktorej sa slovo objavilo, a dostaneš jeden presný význam",
    errorTitle: "Neplatný kód",
    errorBody: "Popros učiteľa znova o odkaz.",
    games: "Slovné hry",
    notebook: "Zošit triedy",
  },
  it: {
    welcomeTo: "Benvenuti in",
    greetingPrefix: "Ciao",
    switchUser: "(non sono io)",
    pickName: "Ciao! Scegli il tuo nome",
    classroomDefault: "classe",
    searchPh: "Scrivi una parola",
    searchBtn: "Cerca",
    sentencePh: "(Facoltativo) Scrivi la frase in cui compare la parola per avere una definizione precisa",
    errorTitle: "Codice non valido",
    errorBody: "Chiedi di nuovo il link all'insegnante.",
    games: "Giochi di parole",
    notebook: "Quaderno della classe",
  },
  ja: {
    welcomeTo: "ようこそ",
    greetingPrefix: "こんにちは",
    switchUser: "(わたしじゃない)",
    pickName: "こんにちは！自分の名前をえらんでね",
    classroomDefault: "クラス",
    searchPh: "ことばを入力してね",
    searchBtn: "しらべる",
    sentencePh: "(なくてもOK) そのことばが出てきた文を入力すると、ぴったりの意味がひとつわかるよ",
    errorTitle: "コードがちがいます",
    errorBody: "先生にもう一度リンクをもらってね。",
    games: "ことばゲーム",
    notebook: "クラスのノート",
  },
  uk: {
    welcomeTo: "Вітаємо в класі",
    greetingPrefix: "Привіт",
    switchUser: "(це не я)",
    pickName: "Привіт! Обери своє ім'я",
    classroomDefault: "Клас",
    searchPh: "Напиши слово",
    searchBtn: "Знайти",
    sentencePh: "(Необов'язково) Напиши речення, де трапилося слово, і отримаєш одне точне значення",
    errorTitle: "Код неправильний",
    errorBody: "Попроси в учителя посилання ще раз.",
    games: "Ігри зі словами",
    notebook: "Зошит класу",
  },
  tr: {
    welcomeTo: "Hoş geldin,",
    greetingPrefix: "Merhaba",
    switchUser: "(ben değilim)",
    pickName: "Merhaba! Adını seç",
    classroomDefault: "Sınıf",
    searchPh: "Bir kelime yaz",
    searchBtn: "Ara",
    sentencePh: "(İsteğe bağlı) Kelimenin geçtiği cümleyi yaz, tek ve doğru bir anlam bul",
    errorTitle: "Kod geçersiz",
    errorBody: "Öğretmeninden bağlantıyı tekrar iste.",
    games: "Kelime Oyunları",
    notebook: "Sınıf Defteri",
  },
  pl: {
    welcomeTo: "Witaj w klasie",
    greetingPrefix: "Cześć",
    switchUser: "(to nie ja)",
    pickName: "Cześć! Wybierz swoje imię",
    classroomDefault: "Klasa",
    searchPh: "Wpisz słowo",
    searchBtn: "Szukaj",
    sentencePh: "(Opcjonalnie) Wpisz zdanie, w którym pojawiło się słowo, a dostaniesz jedno dokładne znaczenie",
    errorTitle: "Nieprawidłowy kod",
    errorBody: "Poproś nauczyciela jeszcze raz o link.",
    games: "Gry słowne",
    notebook: "Zeszyt klasy",
  },
  fa: {
    welcomeTo: "خوش آمدی به",
    greetingPrefix: "سلام",
    switchUser: "(من نیستم)",
    pickName: "سلام! اسمت را انتخاب کن",
    classroomDefault: "کلاس",
    searchPh: "یک کلمه بنویس",
    searchBtn: "جست‌وجو",
    sentencePh: "(اختیاری) جمله‌ای را که کلمه در آن آمده بنویس تا یک معنی دقیق بگیری",
    errorTitle: "کد درست نیست",
    errorBody: "دوباره لینک را از معلمت بخواه.",
    games: "بازی‌های کلمه",
    notebook: "دفتر کلاس",
  },
  id: {
    welcomeTo: "Selamat datang di",
    greetingPrefix: "Hai",
    switchUser: "(bukan aku)",
    pickName: "Hai! Pilih namamu",
    classroomDefault: "Kelas",
    searchPh: "Ketik sebuah kata",
    searchBtn: "Cari",
    sentencePh: "(Opsional) Ketik kalimat tempat kata itu muncul untuk mendapat satu arti yang tepat",
    errorTitle: "Kode tidak valid",
    errorBody: "Minta tautannya lagi ke gurumu.",
    games: "Permainan Kata",
    notebook: "Buku Catatan Kelas",
  },
  nl: {
    welcomeTo: "Welkom in",
    greetingPrefix: "Hoi",
    switchUser: "(ben ik niet)",
    pickName: "Hoi! Kies je naam",
    classroomDefault: "de klas",
    searchPh: "Typ een woord",
    searchBtn: "Opzoeken",
    sentencePh: "(Optioneel) Typ de zin waarin het woord staat voor één precieze betekenis",
    errorTitle: "Code niet geldig",
    errorBody: "Vraag je leerkracht nog een keer om de link.",
    games: "Woordspellen",
    notebook: "Klassenschrift",
  },
  vi: {
    welcomeTo: "Chào mừng đến với",
    greetingPrefix: "Chào",
    switchUser: "(không phải mình)",
    pickName: "Chào bạn! Chọn tên của mình nhé",
    classroomDefault: "Lớp học",
    searchPh: "Gõ một từ",
    searchBtn: "Tra từ",
    sentencePh: "(Không bắt buộc) Gõ câu có chứa từ đó để nhận một nghĩa chính xác",
    errorTitle: "Mã không hợp lệ",
    errorBody: "Hãy xin thầy cô gửi lại đường link.",
    games: "Trò chơi từ vựng",
    notebook: "Sổ tay của lớp",
  },
  fil: {
    welcomeTo: "Maligayang pagdating sa",
    greetingPrefix: "Hi",
    switchUser: "(hindi ako)",
    pickName: "Hi! Piliin ang pangalan mo",
    classroomDefault: "Klase",
    searchPh: "Mag-type ng salita",
    searchBtn: "Hanapin",
    sentencePh: "(Opsyonal) I-type ang pangungusap kung saan lumabas ang salita para makuha ang isang eksaktong kahulugan",
    errorTitle: "Mali ang code",
    errorBody: "Hingin ulit sa guro mo ang link.",
    games: "Mga Laro sa Salita",
    notebook: "Kuwaderno ng Klase",
  },
  af: {
    welcomeTo: "Welkom by",
    greetingPrefix: "Hallo",
    switchUser: "(nie ek nie)",
    pickName: "Hallo! Kies jou naam",
    classroomDefault: "die klas",
    searchPh: "Tik 'n woord",
    searchBtn: "Soek op",
    sentencePh: "(Opsioneel) Tik die sin waarin die woord voorkom om een presiese betekenis te kry",
    errorTitle: "Kode is ongeldig",
    errorBody: "Vra jou onderwyser weer vir die skakel.",
    games: "Woordspeletjies",
    notebook: "Klasnotaboek",
  },
  sw: {
    welcomeTo: "Karibu",
    greetingPrefix: "Habari",
    switchUser: "(si mimi)",
    pickName: "Habari! Chagua jina lako",
    classroomDefault: "Darasa",
    searchPh: "Andika neno",
    searchBtn: "Tafuta",
    sentencePh: "(Si lazima) Andika sentensi ambamo neno limetokea upate maana moja sahihi",
    errorTitle: "Msimbo si sahihi",
    errorBody: "Mwombe mwalimu wako kiungo tena.",
    games: "Michezo ya Maneno",
    notebook: "Daftari la Darasa",
  },
  "zh-CN": {
    welcomeTo: "欢迎来到",
    greetingPrefix: "你好",
    switchUser: "(不是我)",
    pickName: "你好！选一下你的名字",
    classroomDefault: "班级",
    searchPh: "输入一个词",
    searchBtn: "查一查",
    sentencePh: "(可选) 输入这个词所在的句子，就能得到一个准确的意思",
    errorTitle: "代码无效",
    errorBody: "请再向老师要一次链接。",
    games: "单词游戏",
    notebook: "班级笔记本",
  },
  "zh-TW": {
    welcomeTo: "歡迎來到",
    greetingPrefix: "你好",
    switchUser: "(不是我)",
    pickName: "你好！選一下你的名字",
    classroomDefault: "班級",
    searchPh: "輸入一個詞",
    searchBtn: "查一查",
    sentencePh: "(可選) 輸入這個詞所在的句子，就能得到一個準確的意思",
    errorTitle: "代碼無效",
    errorBody: "請再向老師要一次連結。",
    games: "單字遊戲",
    notebook: "班級筆記本",
  },
  ko: {
    welcomeTo: "어서 와요,",
    greetingPrefix: "안녕",
    switchUser: "(내가 아니에요)",
    pickName: "안녕! 네 이름을 골라 줘",
    classroomDefault: "우리 반",
    searchPh: "낱말을 입력해 봐",
    searchBtn: "찾아보기",
    sentencePh: "(선택) 낱말이 나온 문장을 입력하면 딱 맞는 뜻 하나를 알려 줘요",
    errorTitle: "코드가 올바르지 않아요",
    errorBody: "선생님께 링크를 다시 받아 줘.",
    games: "낱말 게임",
    notebook: "우리 반 공책",
  },
  th: {
    welcomeTo: "ยินดีต้อนรับสู่",
    greetingPrefix: "สวัสดี",
    switchUser: "(ไม่ใช่ฉัน)",
    pickName: "สวัสดี! เลือกชื่อของตัวเองเลย",
    classroomDefault: "ห้องเรียน",
    searchPh: "พิมพ์คำศัพท์",
    searchBtn: "ค้นหา",
    sentencePh: "(ไม่บังคับ) พิมพ์ประโยคที่มีคำนั้น เพื่อรับความหมายที่ตรงที่สุดหนึ่งความหมาย",
    errorTitle: "รหัสไม่ถูกต้อง",
    errorBody: "ขอลิงก์จากคุณครูอีกครั้งนะ",
    games: "เกมคำศัพท์",
    notebook: "สมุดของห้องเรียน",
  },
  bn: {
    welcomeTo: "স্বাগতম,",
    greetingPrefix: "হাই",
    switchUser: "(আমি নই)",
    pickName: "হাই! তোমার নাম বেছে নাও",
    classroomDefault: "ক্লাস",
    searchPh: "একটা শব্দ লেখো",
    searchBtn: "খোঁজো",
    sentencePh: "(ঐচ্ছিক) শব্দটা যে বাক্যে আছে সেটা লেখো, একটা সঠিক অর্থ পাবে",
    errorTitle: "কোডটা ঠিক নয়",
    errorBody: "শিক্ষকের কাছে লিংকটা আবার চাও।",
    games: "শব্দের খেলা",
    notebook: "ক্লাসের খাতা",
  },
  da: {
    welcomeTo: "Velkommen til",
    greetingPrefix: "Hej",
    switchUser: "(ikke mig)",
    pickName: "Hej! Vælg dit navn",
    classroomDefault: "klassen",
    searchPh: "Skriv et ord",
    searchBtn: "Slå op",
    sentencePh: "(Valgfrit) Skriv sætningen, hvor ordet står, så får du én præcis betydning",
    errorTitle: "Koden er ikke gyldig",
    errorBody: "Spørg din lærer om linket igen.",
    games: "Ordspil",
    notebook: "Klassens notesbog",
  },
  hu: {
    welcomeTo: "Üdv itt:",
    greetingPrefix: "Szia",
    switchUser: "(nem én vagyok)",
    pickName: "Szia! Válaszd ki a neved",
    classroomDefault: "Osztály",
    searchPh: "Írj be egy szót",
    searchBtn: "Keresés",
    sentencePh: "(Nem kötelező) Írd be a mondatot, amelyben a szó szerepel, és pontosan egy jelentést kapsz",
    errorTitle: "Érvénytelen kód",
    errorBody: "Kérd el újra a linket a tanárodtól.",
    games: "Szójátékok",
    notebook: "Osztályfüzet",
  },
};

/** Off-hours hint copy. Shown at the bottom of the kid view when the
 *  classroom code is reached outside the school's active-hours window.
 *  The search still works (basic dictionary) but image / kids'
 *  explanation / classroom game are off. The hint upsells to Family
 *  so a kid asking their parent gets pointed at the right product. */
const OFFHOURS_LINK_URL = "www.gadit.app/families";
const OFFHOURS_HINT: Record<string, { lead: string; link: string }> = {
  he: { lead: "רוצים את Gadit בבית? שלחו להורים את הקישור:", link: "/families" },
  en: { lead: "Want Gadit at home? Send your parents this link:", link: "/families" },
  zu: { lead: "Ufuna i-Gadit ekhaya? Thumela abazali bakho leli khophi:", link: "/families" },
  el: { lead: "Θέλεις το Gadit στο σπίτι; Στείλε στους γονείς σου αυτόν τον σύνδεσμο:", link: "/families" },
  hi: { lead: "घर पर Gadit चाहिए? अपने माता-पिता को यह लिंक भेजें:", link: "/families" },
  am: { lead: "ቤት ውስጥ Gadit ትፈልጋላችሁ? ይህን ሊንክ ለወላጆቻችሁ ላኩ:", link: "/families" },
  ar: { lead: "تريد Gadit في البيت؟ أرسل هذا الرابط لأهلك:", link: "/families" },
  ru: { lead: "Хочешь Gadit дома? Отправь родителям эту ссылку:", link: "/families" },
  es: { lead: "¿Quieres Gadit en casa? Envía este enlace a tus padres:", link: "/families" },
  pt: { lead: "Quer o Gadit em casa? Mande este link para seus pais:", link: "/families" },
  fr: { lead: "Tu veux Gadit à la maison ? Envoie ce lien à tes parents :", link: "/families" },
  de: { lead: "Du willst Gadit auch zu Hause? Schick deinen Eltern diesen Link:", link: "/families" },
  cs: { lead: "Chceš Gadit i doma? Pošli rodičům tenhle odkaz:", link: "/families" },
  sk: { lead: "Chceš Gadit aj doma? Pošli rodičom tento odkaz:", link: "/families" },
  it: { lead: "Vuoi Gadit anche a casa? Manda questo link ai tuoi genitori:", link: "/families" },
  ja: { lead: "おうちでも Gadit を使いたい？おうちの人にこのリンクを送ってね：", link: "/families" },
  uk: { lead: "Хочеш Gadit удома? Надішли батькам це посилання:", link: "/families" },
  tr: { lead: "Evde de Gadit kullanmak ister misin? Bu bağlantıyı ailene gönder:", link: "/families" },
  pl: { lead: "Chcesz mieć Gadit w domu? Wyślij rodzicom ten link:", link: "/families" },
  fa: { lead: "Gadit را در خانه هم می‌خواهی؟ این لینک را برای پدر و مادرت بفرست:", link: "/families" },
  id: { lead: "Mau pakai Gadit di rumah? Kirim tautan ini ke orang tuamu:", link: "/families" },
  nl: { lead: "Wil je Gadit ook thuis? Stuur je ouders deze link:", link: "/families" },
  vi: { lead: "Muốn dùng Gadit ở nhà? Gửi đường link này cho bố mẹ nhé:", link: "/families" },
  fil: { lead: "Gusto mo ba ng Gadit sa bahay? Ipadala ang link na ito sa mga magulang mo:", link: "/families" },
  af: { lead: "Wil jy Gadit by die huis hê? Stuur hierdie skakel vir jou ouers:", link: "/families" },
  sw: { lead: "Unataka Gadit nyumbani? Watumie wazazi wako kiungo hiki:", link: "/families" },
  "zh-CN": { lead: "想在家里也用 Gadit 吗？把这个链接发给爸爸妈妈吧：", link: "/families" },
  "zh-TW": { lead: "想在家裡也用 Gadit 嗎？把這個連結傳給爸爸媽媽吧：", link: "/families" },
  ko: { lead: "집에서도 Gadit을 쓰고 싶나요? 부모님께 이 링크를 보내 주세요:", link: "/families" },
  th: { lead: "อยากใช้ Gadit ที่บ้านไหม? ส่งลิงก์นี้ให้พ่อแม่เลย:", link: "/families" },
  bn: { lead: "বাড়িতেও Gadit চাও? মা-বাবাকে এই লিংকটা পাঠাও:", link: "/families" },
  da: { lead: "Vil du have Gadit derhjemme? Send dine forældre dette link:", link: "/families" },
  hu: { lead: "Otthon is szeretnéd használni a Gadit alkalmazást? Küldd el a szüleidnek ezt a linket:", link: "/families" },
};

export function ClassroomKidClient({ code }: { code: string }) {
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = COPY[lang] ?? COPY.en;
  const [state, setState] = useState<LookupState>({ kind: "loading" });
  const [word, setWord] = useState("");
  const [sentence, setSentence] = useState("");
  // Persisted student identity. localStorage key is scoped to the
  // class code so the same browser used in two classrooms keeps two
  // independent identities. Anonymous kids leave this empty and the
  // search log gets stored without a studentName.
  const [studentName, setStudentName] = useState<string>("");
  // Kids Mode is on by default in the classroom view — kids reading on
  // a shared computer get the simpler, more visual renderings without
  // having to flip a switch. The toggle stays visible in the search
  // pill so an older student can turn it off if they want adult-level
  // definitions.
  const [, setKidsMode] = useKidsMode();
  const kidsAutoEnabledRef = useRef(false);
  useEffect(() => {
    if (kidsAutoEnabledRef.current) return;
    kidsAutoEnabledRef.current = true;
    setKidsMode(true);
  }, [setKidsMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(`gadit-student-${code}`);
    if (saved) setStudentName(saved);
  }, [code]);

  function pickStudent(name: string) {
    setStudentName(name);
    try {
      window.localStorage.setItem(`gadit-student-${code}`, name);
    } catch {
      // private mode or storage disabled — name lives in memory only,
      // will be lost on refresh but the search bar still works.
    }
  }

  function clearStudent() {
    setStudentName("");
    try {
      window.localStorage.removeItem(`gadit-student-${code}`);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/classroom/lookup?code=${encodeURIComponent(code)}`);
        if (cancelled) return;
        if (!res.ok) {
          setState({ kind: "error" });
          return;
        }
        const data = (await res.json()) as LookupOk;
        // Stash the school's skin so the word page + sub-pages theme to it
        // without another round trip.
        stashSkin(code, data.skinAccent);
        setState({ kind: "ok", data });
      } catch {
        if (!cancelled) setState({ kind: "error" });
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = word.trim();
    if (!trimmed) return;
    if (state.kind !== "ok") return;
    const sent = sentence.trim();
    // Pass the optional context sentence through as ?sentence=… so the
    // word page picks the right meaning when the word is multi-sense.
    // Mirrors the homepage's optional-sentence input, restored after
    // Gadi (2026-06-28) noticed the kid view was missing it. Also pass
    // the picked student name as ?sn= so the log-search call from the
    // word page can tag the entry with who searched. And pass `&in=1`
    // when the classroom is currently in-session so the word page
    // unlocks image / kids' explanation / classroom game — those
    // features are gated to active classroom hours to prevent the
    // school code from becoming a free Family substitute at home.
    const sentenceParam = sent ? `&sentence=${encodeURIComponent(sent)}` : "";
    const studentParam = studentName ? `&sn=${encodeURIComponent(studentName)}` : "";
    const sessionParam = state.data.inSession ? `&in=1` : "";
    router.push(href(wordPath(trimmed, `cls=${encodeURIComponent(code)}${sentenceParam}${studentParam}${sessionParam}`)));
  }

  if (state.kind === "loading") {
    return (
      <div className="wordbook wb-school-page" dir={dir} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        &nbsp;
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="wordbook wb-school-page" dir={dir} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <main style={{ maxWidth: 480, padding: "0 24px", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--wb-serif)",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--ink)",
            margin: "0 0 12px",
          }}>{c.errorTitle}</h1>
          <p style={{
            fontFamily: "var(--wb-sans)",
            fontSize: 16,
            color: "var(--ink-soft)",
            margin: 0,
          }}>{c.errorBody}</p>
        </main>
      </div>
    );
  }

  const { data } = state;
  // Layout mirrors the official Gadit homepage exactly. Per Gadi's
  // 2026-06-29 spec: classroom users see the same chrome the rest of
  // the product has, so the brand carries across surfaces. The only
  // differences from the public homepage:
  //   - Top nav: only "School Notebook" and "Play" (no Features /
  //     Pricing / Affiliates — those would confuse a kid in class).
  //   - Top right: lang switcher, SCHOOL tier chip, school avatar
  //     (no Share button, no login CTA — anonymous surface).
  //   - Hero: school logo + school name in place of the Gadit
  //     wordmark + tagline. The school IS the brand here.
  return (
    <div className="wordbook wb-shell-page wb-school-page" dir={dir} style={skinStyleVars(data.skinAccent)}>
      <header className="wb-shell-topbar">
        <Link href={href(`/c/${code}`)} className="wb-shell-wordmark" dir="ltr" aria-label="Gadit">
          Gad<span className="wb-shell-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href={href(`/c/${code}/notebook`)} className="wb-shell-navlink">{c.notebook}</Link>
          <Link href={href(`/c/${code}/games`)} className="wb-shell-navlink">{c.games}</Link>
        </nav>
        <div className="wb-shell-actions">
          <ClassroomLangSwitch />
          <span className="wb-classroom-tier-chip">SCHOOL</span>
          {data.schoolLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.schoolLogoUrl}
              alt={data.schoolName || "School"}
              className="wb-classroom-avatar"
            />
          ) : (
            <div className="wb-classroom-avatar wb-classroom-avatar-fallback" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7l9-4 9 4-9 4-9-4z" />
                <path d="M5 9v5c0 2 3 4 7 4s7-2 7-4V9" />
              </svg>
            </div>
          )}
        </div>
      </header>

      <main className="wb-home-main">
        <div className="wb-home-center">
          {/* School hero — replaces the Gadit wordmark + tagline.
              Per spec, the school logo and name take the center stage
              here while everything around them stays Gadit chrome. */}
          <div className="wb-classroom-hero">
            <div className="wb-classroom-hero-logo">
              {data.schoolLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.schoolLogoUrl} alt="" />
              ) : (
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7l9-4 9 4-9 4-9-4z" />
                  <path d="M21 10v6" />
                  <path d="M5 9v5c0 2 3 4 7 4s7-2 7-4V9" />
                </svg>
              )}
            </div>
            {data.schoolName && (
              <div className="wb-classroom-hero-name">{data.schoolName}</div>
            )}
            <p className="wb-home-tagline">
              {studentName
                ? `${c.greetingPrefix} ${studentName},`
                : `${c.welcomeTo} ${data.classroomName || c.classroomDefault}`}
            </p>
            {studentName && (
              <button
                type="button"
                onClick={clearStudent}
                className="wb-classroom-switch-user"
              >
                {c.switchUser}
              </button>
            )}
          </div>

          {/* Student picker — only when there's a roster and no name picked yet. */}
          {data.students.length > 0 && !studentName && (
            <div className="wb-classroom-student-picker">
              <p className="wb-classroom-student-picker-prompt">{c.pickName}</p>
              {/* Alphabetical (A first, on the left), filling left to right and
                  wrapping down, so a student finds their name fast. dir=ltr
                  keeps A on the left even in an RTL school UI. (Gadi 2026-08-25.) */}
              <div className="wb-classroom-student-picker-chips" dir="ltr">
                {[...data.students].sort((a, b) => a.localeCompare(b)).map((sn) => (
                  <button
                    key={sn}
                    type="button"
                    onClick={() => pickStudent(sn)}
                    className="wb-classroom-student-chip"
                  >
                    {sn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* The search pill — exact same structure as the homepage's
              wb-home-search-box so the layout matches pixel-for-pixel.
              Kids toggle defaults ON (set on mount) but stays visible
              so a kid can flip it. plan="deep" passed to bypass the
              tier gate — classroom users get paid-tier features via
              the school subscription. */}
          {(data.students.length === 0 || studentName) && (
            <form className="wb-home-search" onSubmit={onSubmit}>
              <div className="wb-home-search-box">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder={c.searchPh}
                  autoFocus
                  className="wb-home-search-input"
                  aria-label={c.searchPh}
                />
                <div className="wb-home-search-kids">
                  <KidsModeToggle plan="deep" />
                </div>
                <div className="wb-home-search-mic">
                  <VoiceInput
                    uiLang={lang}
                    getIdToken={async () => null}
                    onResult={(text) => {
                      setWord(text);
                    }}
                    enabled={true}
                    size="sm"
                    title="Voice"
                  />
                </div>
                <button
                  type="submit"
                  className="wb-home-search-submit"
                  aria-label={c.searchBtn}
                  title={c.searchBtn}
                >
                  <SearchIcon size={20} />
                </button>
              </div>
              <div className="wb-home-sentence-wrap">
                <textarea
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  placeholder={c.sentencePh}
                  rows={2}
                  className="wb-home-sentence-input"
                  aria-label={c.sentencePh}
                />
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Off-hours soft hint — a real bottom footer (margin-top:auto pins it to
          the viewport bottom) so it never floats up with the hero + names. */}
      {!data.inSession && (
        <footer className="wb-classroom-offhours">
          <div className="wb-classroom-offhours-line1">
            {(OFFHOURS_HINT[lang] ?? OFFHOURS_HINT.en).lead}
          </div>
          <Link
            href={href((OFFHOURS_HINT[lang] ?? OFFHOURS_HINT.en).link)}
            className="wb-classroom-offhours-cta"
            dir="ltr"
          >
            {OFFHOURS_LINK_URL}
          </Link>
        </footer>
      )}
    </div>
  );
}

// Lang switcher for the classroom topbar. Small, kid-friendly — just
// the active language label with a popover of the four supported langs.
// Anonymous (no auth), persists via lang-context like the rest of /c.
// Shared LANGUAGES registry so a classroom kid can pick any UI language
// (a Dutch student in Belgium needs Dutch, not a curated 5-lang subset).
const CLASSROOM_LANGS = LANGUAGES;

function ClassroomLangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  const active = CLASSROOM_LANGS.find((l) => l.code === lang) ?? CLASSROOM_LANGS[1];
  return (
    <div ref={wrapRef} className="wb-classroom-lang">
      <button
        type="button"
        className="wb-classroom-lang-chip"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        <span>{active.label}</span>
      </button>
      {open && (
        <ul className="wb-classroom-lang-menu" role="listbox">
          {CLASSROOM_LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { setLang(l.code as typeof lang); setOpen(false); }}
              >
                <img
                  className="wb-classroom-lang-flag"
                  src={`https://flagcdn.com/40x30/${l.flag}.png`}
                  srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`}
                  width="20"
                  height="15"
                  alt=""
                  loading="lazy"
                />
                <span>{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
