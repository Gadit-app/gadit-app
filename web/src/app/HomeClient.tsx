"use client";

/**
 * Homepage — CrispTech aesthetic. Search-as-CTA hero, minimal chrome,
 * shares the wordbook palette + typography with the word result page.
 *
 * Designed for the launch demo: land → type a word → /word/<word>.
 * No marketing fluff, no animated chrome, no V2 navy.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useAuth } from "@/lib/auth-context";
import { useHref, wordPath } from "@/lib/href";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { GadVerbStamp } from "@/components/GadVerbStamp";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import VoiceInput from "@/components/VoiceInput";
import { KidsModeToggle } from "@/components/KidsModeToggle";
import { KidsGameHeader } from "@/components/design/KidsGameHeader";
import { UpgradeModal, type UpgradeTrigger } from "@/components/UpgradeModal";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { LANGUAGES } from "@/lib/i18n";

// Single source of truth: the shared LANGUAGES registry, so the homepage
// switcher never drifts behind newly-added UI languages (it used to be a
// hand-maintained copy that got stuck at 14).
const LANGS = LANGUAGES;

function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button
        type="button"
        className="wb-lang-chip"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {active.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { setLang(l.code); setOpen(false); }}
              >
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />{l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const COPY: Record<
  string,
  {
    tagline: string;
    placeholder: string;
    tryLabel: string;
    signin: string;
    pricing: string;
    search: string;
    features: string;
    addSentence: string;
    sentencePlaceholder: string;
    optional: string;
    founderNote: string;
    founderSign: string;
  }
> = {
  uk: { tagline: "Розумій слова до кінця", placeholder: "Введіть слово", tryLabel: "Спробувати", signin: "Увійти", pricing: "Ціни", search: "Пошук", features: "Можливості", addSentence: "Додайте речення, у якому вживається слово, щоб отримати одне точне визначення", sentencePlaceholder: "(Необовʼязково) Введіть речення, у якому вживається слово, щоб отримати одне точне визначення", optional: "Необовʼязково", founderNote: "Щоразу, коли щось не сходиться, на шляху стоїть одне слово. Впіймай його, і все відкриється.", founderSign: "Ґаді, засновник Gadit" },
  tr: { tagline: "Kelimeleri sonuna kadar anla", placeholder: "Bir kelime yaz", tryLabel: "Dene", signin: "Giriş yap", pricing: "Fiyatlar", search: "Ara", features: "Özellikler", addSentence: "Tek ve kesin bir tanım almak için kelimenin geçtiği cümleyi ekle", sentencePlaceholder: "(İsteğe bağlı) Tek ve kesin bir tanım almak için kelimenin geçtiği cümleyi yaz", optional: "İsteğe bağlı", founderNote: "Bir şey her oturmadığında, yolda duran tek bir kelime vardır. Onu yakala, her şey açılsın.", founderSign: "Gadi, Gadit'in kurucusu" },
  pl: { tagline: "Zrozum słowa do końca", placeholder: "Wpisz słowo", tryLabel: "Wypróbuj", signin: "Zaloguj się", pricing: "Cennik", search: "Szukaj", features: "Funkcje", addSentence: "Dodaj zdanie, w którym występuje słowo, aby otrzymać jedną precyzyjną definicję", sentencePlaceholder: "(Opcjonalnie) Wpisz zdanie, w którym występuje słowo, aby otrzymać jedną precyzyjną definicję", optional: "Opcjonalnie", founderNote: "Za każdym razem, gdy coś nie zaskakuje, na drodze stoi jedno słowo. Złap je, a wszystko się otworzy.", founderSign: "Gadi, założyciel Gadit" },
  fa: { tagline: "کلمه‌ها را تا آخر بفهم", placeholder: "یک کلمه بنویس", tryLabel: "امتحان", signin: "ورود", pricing: "قیمت‌ها", search: "جستجو", features: "امکانات", addSentence: "جمله‌ای که کلمه در آن آمده را اضافه کن تا یک تعریف دقیق بگیری", sentencePlaceholder: "(اختیاری) جمله‌ای که کلمه در آن آمده را بنویس تا یک تعریف دقیق بگیری", optional: "اختیاری", founderNote: "هر بار که چیزی جا نمی‌افتد، یک کلمه سر راه است. آن را بگیر، و همه چیز باز می‌شود.", founderSign: "گادی، بنیان‌گذار Gadit" },
  id: { tagline: "Pahami kata sampai tuntas", placeholder: "Ketik sebuah kata", tryLabel: "Coba", signin: "Masuk", pricing: "Harga", search: "Cari", features: "Fitur", addSentence: "Tambahkan kalimat tempat kata itu muncul untuk mendapatkan satu definisi yang tepat", sentencePlaceholder: "(Opsional) Ketik kalimat tempat kata itu muncul untuk mendapatkan satu definisi yang tepat", optional: "Opsional", founderNote: "Setiap kali sesuatu terasa tidak masuk, ada satu kata yang menghalangi. Tangkap kata itu, dan semuanya terbuka.", founderSign: "Gadi, pendiri Gadit" },
  nl: { tagline: "Begrijp woorden tot het einde", placeholder: "Typ een woord", tryLabel: "Probeer", signin: "Inloggen", pricing: "Prijzen", search: "Zoeken", features: "Functies", addSentence: "Voeg de zin toe waarin het woord voorkomt voor een precieze definitie", sentencePlaceholder: "(Optioneel) Typ de zin waarin het woord voorkomt voor een precieze definitie", optional: "Optioneel", founderNote: "Elke keer dat iets niet klikt, staat er een woord in de weg. Vang het, en alles gaat open.", founderSign: "Gadi, oprichter van Gadit" },
  he: { tagline: "להבין כל מילה עד הסוף", placeholder: "הקלידו מילה",       tryLabel: "לדוגמה", signin: "התחברות",     pricing: "תמחור", search: "חיפוש", features: "פיצ'רים", addSentence: "הוסיפו את המשפט שבו מופיעה המילה כדי לקבל הגדרה אחת מדויקת", sentencePlaceholder: "(אופציונלי) הקלידו את המשפט שבו מופיעה המילה כדי לקבל הגדרה אחת מדויקת", optional: "אופציונלי", founderNote: "בכל פעם שמשהו לא ברור, יש שם מילה אחת. תפסת אותה, הבנת הכל.", founderSign: "גדי, מייסד Gadit" },
  en: { tagline: "Understand words to the end", placeholder: "Type a word", tryLabel: "Try", signin: "Sign in", pricing: "Pricing", search: "Search", features: "Features", addSentence: "Add the sentence where the word appears to get one precise definition", sentencePlaceholder: "(Optional) Type the sentence where the word appears to get one precise definition", optional: "Optional", founderNote: "Every time something doesn't click, there's one word in the way. Catch it, and everything opens.", founderSign: "Gadi, founder of Gadit" },
  zu: { tagline: "Qonda amagama kuze kube sekugcineni", placeholder: "Bhala igama", tryLabel: "Zama", signin: "Ngena", pricing: "Amanani", search: "Sesha", features: "Izici", addSentence: "Faka umusho lapho igama livela khona ukuthola incazelo eyodwa enembayo", sentencePlaceholder: "(Okukhethwayo) Bhala umusho lapho igama livela khona ukuthola incazelo eyodwa enembayo", optional: "Okukhethwayo", founderNote: "Njalo lapho okuthile kunganamathiseli, kukhona igama elilodwa endleleni. Libambe, futhi konke kuvuleke.", founderSign: "UGadi, umsunguli weGadit" },
  el: { tagline: "Κατάλαβε τις λέξεις μέχρι το τέλος", placeholder: "Γράψε μια λέξη", tryLabel: "Δοκίμασε", signin: "Σύνδεση", pricing: "Τιμές", search: "Αναζήτηση", features: "Δυνατότητες", addSentence: "Πρόσθεσε την πρόταση όπου εμφανίζεται η λέξη για να πάρεις έναν ακριβή ορισμό", sentencePlaceholder: "(Προαιρετικό) Γράψε την πρόταση όπου εμφανίζεται η λέξη για να πάρεις έναν ακριβή ορισμό", optional: "Προαιρετικό", founderNote: "Κάθε φορά που κάτι δεν κουμπώνει, υπάρχει μία λέξη στη μέση. Πιάσε την, και όλα ανοίγουν.", founderSign: "Ο Γκάντι, ιδρυτής του Gadit" },
  ar: { tagline: "افهم الكلمات حتى النهاية", placeholder: "اكتب كلمة",     tryLabel: "جرّب", signin: "تسجيل دخول",  pricing: "الأسعار", search: "بحث", features: "المزايا", addSentence: "أضف الجملة التي تظهر فيها الكلمة للحصول على تعريف واحد دقيق", sentencePlaceholder: "(اختياري) اكتب الجملة التي تظهر فيها الكلمة للحصول على تعريف واحد دقيق", optional: "اختياري", founderNote: "في كل مرة لا يتضح فيها شيء، هناك كلمة واحدة في الطريق. التقطها، وكل شيء ينفتح.", founderSign: "غادي، مؤسس Gadit" },
  ru: { tagline: "Понять слова до конца",   placeholder: "Введите слово", tryLabel: "Пример", signin: "Войти",     pricing: "Цены", search: "Поиск", features: "Возможности", addSentence: "Добавьте предложение со словом, чтобы получить одно точное определение", sentencePlaceholder: "(Необязательно) Введите предложение со словом, чтобы получить одно точное определение", optional: "Необязательно", founderNote: "Каждый раз, когда что-то не складывается, на пути есть одно слово. Найди его, и всё открывается.", founderSign: "Гади, основатель Gadit" },
  es: { tagline: "Entender palabras hasta el final", placeholder: "Escribe una palabra", tryLabel: "Prueba", signin: "Iniciar sesión", pricing: "Precios", search: "Búsqueda", features: "Funciones", addSentence: "Añade la frase donde aparece la palabra para obtener una definición precisa", sentencePlaceholder: "(Opcional) Escribe la frase donde aparece la palabra para obtener una definición precisa", optional: "Opcional", founderNote: "Cada vez que algo no encaja, hay una palabra en el camino. Atrápala, y todo se abre.", founderSign: "Gadi, fundador de Gadit" },
  pt: { tagline: "Entender palavras até o fim", placeholder: "Escreva uma palavra", tryLabel: "Exemplo", signin: "Entrar", pricing: "Preços", search: "Buscar", features: "Recursos", addSentence: "Adicione a frase onde a palavra aparece para obter uma definição precisa", sentencePlaceholder: "(Opcional) Escreva a frase onde a palavra aparece para obter uma definição precisa", optional: "Opcional", founderNote: "Toda vez que algo não faz sentido, há uma palavra no caminho. Pegue-a, e tudo se abre.", founderSign: "Gadi, fundador do Gadit" },
  fr: { tagline: "Comprendre les mots jusqu'au bout", placeholder: "Tapez un mot", tryLabel: "Essayez", signin: "Connexion", pricing: "Tarifs", search: "Recherche", features: "Fonctionnalités", addSentence: "Ajoutez la phrase où le mot apparaît pour obtenir une définition précise", sentencePlaceholder: "(Optionnel) Tapez la phrase où le mot apparaît pour obtenir une définition précise", optional: "Optionnel", founderNote: "Chaque fois que quelque chose ne tilte pas, il y a un mot sur le chemin. Saisissez-le, et tout s'ouvre.", founderSign: "Gadi, fondateur de Gadit" },
  de: { tagline: "Wörter bis zum Ende verstehen", placeholder: "Wort eingeben", tryLabel: "Beispiel", signin: "Anmelden", pricing: "Preise", search: "Suche", features: "Funktionen", addSentence: "Füge den Satz hinzu, in dem das Wort vorkommt, um eine genaue Definition zu erhalten", sentencePlaceholder: "(Optional) Tippe den Satz ein, in dem das Wort vorkommt, um eine genaue Definition zu erhalten", optional: "Optional", founderNote: "Jedes Mal, wenn etwas nicht klickt, steht ein Wort im Weg. Fang es ein, und alles öffnet sich.", founderSign: "Gadi, Gründer von Gadit" },
  cs: { tagline: "Pochopit slova až do konce", placeholder: "Napiš slovo", tryLabel: "Příklad", signin: "Přihlásit se", pricing: "Ceník", search: "Hledat", features: "Funkce", addSentence: "Přidej větu, ve které se slovo objevuje, abys získal přesnou definici", sentencePlaceholder: "(Volitelné) Napiš větu, ve které se slovo objevuje, abys získal jednu přesnou definici", optional: "Volitelné", founderNote: "Pokaždé, když něco nedává smysl, je v cestě jedno slovo. Zachyť ho, a všechno se otevře.", founderSign: "Gadi, zakladatel Gaditu" },
  sk: { tagline: "Pochopiť slová až do konca", placeholder: "Napíš slovo", tryLabel: "Príklad", signin: "Prihlásiť sa", pricing: "Cenník", search: "Hľadať", features: "Funkcie", addSentence: "Pridaj vetu, v ktorej sa slovo nachádza, aby si získal presnú definíciu", sentencePlaceholder: "(Voliteľné) Napíš vetu, v ktorej sa slovo nachádza, aby si získal jednu presnú definíciu", optional: "Voliteľné", founderNote: "Zakaždým, keď niečo nedáva zmysel, stojí v ceste jedno slovo. Zachyť ho, a všetko sa otvorí.", founderSign: "Gadi, zakladateľ Gaditu" },
  it: { tagline: "Capire le parole fino in fondo", placeholder: "Scrivi una parola", tryLabel: "Prova", signin: "Accedi", pricing: "Prezzi", search: "Cerca", features: "Funzionalità", addSentence: "Aggiungi la frase in cui appare la parola per ottenere una definizione precisa", sentencePlaceholder: "(Opzionale) Scrivi la frase in cui appare la parola per ottenere una definizione precisa", optional: "Opzionale", founderNote: "Ogni volta che qualcosa non torna, c'è una parola sulla strada. Coglila, e tutto si apre.", founderSign: "Gadi, fondatore di Gadit" },
  ja: { tagline: "言葉を最後まで理解する", placeholder: "単語を入力", tryLabel: "例", signin: "ログイン", pricing: "料金", search: "検索", features: "機能", addSentence: "単語が出てくる文を追加すると、ぴったりの意味が一つだけ表示されます", sentencePlaceholder: "（任意）単語が出てくる文を入力すると、ぴったりの意味が一つだけ表示されます", optional: "任意", founderNote: "何かがしっくりこないとき、必ず一つの言葉が間にある。それを掴めば、すべてが開く。", founderSign: "ガディ、Gadit 創業者" },
  hi: { tagline: "शब्दों को पूरी तरह समझें", placeholder: "कोई शब्द लिखें", tryLabel: "आज़माएँ", signin: "साइन इन", pricing: "क़ीमत", search: "खोज", features: "सुविधाएँ", addSentence: "वह वाक्य जोड़ें जिसमें शब्द आया है, सटीक एक परिभाषा मिलेगी", sentencePlaceholder: "(वैकल्पिक) वह वाक्य लिखें जिसमें शब्द आया है, सटीक एक परिभाषा मिलेगी", optional: "वैकल्पिक", founderNote: "जब भी कुछ क्लिक नहीं करता, बीच में एक शब्द होता है। उसे पकड़ लो, सब खुल जाता है।", founderSign: "गादी, Gadit के संस्थापक" },
  am: { tagline: "ቃላትን እስከ መጨረሻው መረዳት", placeholder: "ቃል ይጻፉ", tryLabel: "ይሞክሩ", signin: "ይግቡ", pricing: "ዋጋዎች", search: "ፍለጋ", features: "ባህሪያት", addSentence: "ቃሉ የሚገኝበትን ዓረፍተ ነገር ያክሉ፣ አንድ ትክክለኛ ትርጉም ያገኛሉ", sentencePlaceholder: "(አማራጭ) ቃሉ የሚገኝበትን ዓረፍተ ነገር ይጻፉ፣ አንድ ትክክለኛ ትርጉም ያገኛሉ", optional: "አማራጭ", founderNote: "አንድ ነገር ግልጽ ባልሆነ ቁጥር በመንገዱ ላይ አንድ ቃል አለ። ያዙት፣ ሁሉም ነገር ይከፈታል።", founderSign: "ጋዲ፣ የGadit መስራች" },
};

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function HomePage() {
  const { lang, dir, setLang } = useLang();
  const { user, plan, schoolId, promptLogin, familyRole } = useAuth();
  const router = useRouter();
  const href = useHref();
  const [query, setQuery] = useState("");
  const [sentence, setSentence] = useState("");
  const [upgradeTrigger, setUpgradeTrigger] = useState<UpgradeTrigger | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const c = COPY[lang] ?? COPY.en;

  // Kids gamification on the child's landing page — the first thing they
  // see when they open their profile (Gadi 2026-08-12). Kid profiles only;
  // fetches the notebook's addedAt dates to drive streak/goal/rank.
  const [kidDates, setKidDates] = useState<string[] | null>(null);
  useEffect(() => {
    if (familyRole !== "kid" || !user) { setKidDates(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/notebook", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) return;
        const data = (await res.json()) as { items?: Array<{ addedAt?: string }> };
        if (!cancelled) setKidDates((data.items ?? []).map((i) => i.addedAt || "").filter(Boolean));
      } catch { /* gamification is a nice-to-have; stay silent */ }
    })();
    return () => { cancelled = true; };
  }, [familyRole, user]);

  async function getIdToken(): Promise<string | null> {
    if (!user) return null;
    try { return await user.getIdToken(); } catch { return null; }
  }

  function go(word: string, ctxSentence?: string) {
    const trimmed = word.trim();
    if (!trimmed) return;
    const ctx = (ctxSentence ?? sentence).trim();
    const qs = ctx ? `?sentence=${encodeURIComponent(ctx)}` : "";
    router.push(href(wordPath(trimmed, qs)));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    go(query);
  }

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr" translate="no">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <WbShellNav active="home" />
        <div className="wb-shell-actions">
          {user && (
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
          )}
          <LangSwitch />
          {user ? (
            <WbUserMenu />
          ) : (
            <>
              <StartFreeCTA />
              <button
                type="button"
                className="wb-shell-link"
                onClick={() => promptLogin({ mode: "signin" })}
              >
                {c.signin}
              </button>
            </>
          )}
        </div>
        <div className="wb-shell-mobile-cta">
          <StartFreeCTA />
        </div>
        {/* Mobile identity cluster, sits inline next to the wordmark
            so the share button visually attaches to the Gadit logo
            (Gadi's 2026-06-19 ask: "את הכופתור שיתוף הייתי שם טיפה
            יותר ימינה צמוד לגדית, ללוגו"), and the avatar lives in
            the natural corner exactly like Google's mobile chrome. */}
        {user && (
          <div className="wb-shell-mobile-identity">
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <WbUserMenu />
          </div>
        )}
        <div className="wb-shell-mobile-menu-cluster">
        <LangSwitchMobile />
        <WbShellBurger active="home" />
        </div>
      </header>

      <main className="wb-home-main">
        <div className="wb-home-center">
          <div className="wb-home-logo" translate="no">
            Gad<span className="wb-home-logo-it">it</span>
          </div>
          <p className="wb-home-tagline">{c.tagline}</p>

          <form className="wb-home-search" onSubmit={onSubmit}>
            <div className="wb-home-search-box">
              {/* Convention layout, LLM Council R3 2026-06-20 ruled
                  4-of-5 that input lives on the START edge (where the
                  caret lands when reading begins) and the magnifier
                  submit lives on the END edge (where the search
                  terminates). The mic is an alternative submit (auto-
                  fires go() on transcription), so it sits adjacent to
                  the magnifier in the END cluster. Kids stays inline
                  between input and the submit cluster — it modifies
                  the lookup the user is about to fire.
                  Pattern matches Google / YouTube / Bing / Wikipedia
                  / Amazon / DuckDuckGo / Spotify / ChatGPT. RTL
                  auto-mirrors via the wordbook[dir] cascade — no
                  manual swap. */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c.placeholder}
                autoFocus
                className="wb-home-search-input"
                aria-label={c.placeholder}
              />
              <div className="wb-home-search-kids">
                <KidsModeToggle
                  plan={plan}
                  onBasicGate={() => {
                    if (!user) {
                      promptLogin(v2(lang, "kidsModeBasicGate"));
                      return;
                    }
                    setUpgradeTrigger({ feature: "kids", tier: "clear" });
                  }}
                />
              </div>
              <div className="wb-home-search-mic">
                <VoiceInput
                  uiLang={lang}
                  getIdToken={getIdToken}
                  onResult={(text) => {
                    setQuery(text);
                    go(text);
                  }}
                  enabled={true}
                  title="חיפוש קולי"
                  size="sm"
                />
              </div>
              <button
                type="submit"
                className="wb-home-search-submit"
                aria-label={c.search}
                title={c.search}
                onClick={(e) => {
                  // iOS Safari fallback. When the keyboard is open and
                  // the user taps the round submit button, iOS sometimes
                  // routes the touch as a blur on the input instead of
                  // a click on the button, eating the form's onSubmit
                  // entirely. A friend pilot-testing on iPhone reported
                  // typing "Supply", hitting search, and the page going
                  // blank (input cleared, no navigation). By calling
                  // go() directly here we guarantee navigation. The
                  // preventDefault stops a duplicate submission if the
                  // form's onSubmit DOES fire. Keyboard "Go" path stays
                  // unaffected — it bypasses the button entirely.
                  e.preventDefault();
                  go(query);
                }}
              >
                <SearchIcon size={22} />
              </button>
            </div>
            {/* Sentence input, Gadi 2026-06-19 v2: the OPTIONAL cue
                lives INSIDE the field now (prepended to the
                placeholder in parens) so the marker disappears the
                moment the user starts typing — no separate eyebrow
                competing for attention above the field. */}
            <div className="wb-home-sentence-wrap">
              <textarea
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder={c.sentencePlaceholder}
                rows={2}
                className="wb-home-sentence-input"
                aria-label={c.sentencePlaceholder}
              />
            </div>
          </form>

          {/* Kid's own progress, right under the search — their streak,
              weekly goal and explorer rank the moment they open the app. */}
          {familyRole === "kid" && kidDates && kidDates.length > 0 && (
            <div className="wb-home-game">
              <KidsGameHeader addedAtDates={kidDates} lang={lang} dir={dir} />
            </div>
          )}
        </div>
      </main>

      <UpgradeModal
        trigger={upgradeTrigger}
        lang={lang as "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr" | "de" | "cs" | "sk" | "it" | "ja"}
        dir={dir}
        onClose={() => setUpgradeTrigger(null)}
      />

      <GadVerbStamp />

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>{c.pricing}</Link>
        <span>·</span>
        <Link href={href("/contact")}>{v2(lang, "footerContact")}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>{v2(lang, "footerPrivacy")}</Link>
        <span>·</span>
        <Link href={href("/terms")}>{v2(lang, "footerTerms")}</Link>
      </footer>
    </div>
  );
}
