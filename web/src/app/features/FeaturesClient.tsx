"use client";

/**
 * /features — landing page that shows everything Gadit does.
 * Same CrispTech shell as / and /pricing. The page walks the
 * visitor through the seven feature blocks (one per row), each
 * paired with the tier badge that unlocks it.
 */

import { useEffect, useRef, useState } from "react";
import { LANGUAGES } from "@/lib/i18n";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { GadVerbStamp } from "@/components/GadVerbStamp";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { GaditDemoAnimation } from "@/components/design/GaditDemoAnimation";

// Single source of truth: shared LANGUAGES registry (never drifts behind new langs).
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
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
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
      <button type="button" className="wb-lang-chip" onClick={() => setOpen((v) => !v)}>
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
              <button type="button" className={l.code === lang ? "is-active" : ""} onClick={() => { setLang(l.code); setOpen(false); }}>
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />{l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Tier = "basic" | "clear" | "deep" | "family";

type FeatureIconName =
  | "definitions" | "examples" | "idioms" | "origin"
  | "notebook" | "image" | "kids" | "compose"
  | "quiz" | "compare"
  | "profile" | "qr" | "dashboard" | "people";

interface Feature {
  id: string;
  title: string;
  body: string;
  tier: Tier;
  icon: FeatureIconName;
}

/**
 * Gadi 2026-06-26 transformation: the page used to be a flat 10-card
 * bento (a feature list). Now it tells a story.
 *
 *   1. Hero (problem the visitor recognizes)
 *   2. Demo animation (carries through from before)
 *   3. Three GROUPED feature sections that mirror the user's journey:
 *      Understand -> Learn -> Master. Tier color also walks the
 *      Basic -> Clear -> Deep ladder, so the visual hierarchy IS the
 *      pricing tie-back.
 *   4. Tier tie-back micro-section that names what each tier adds.
 *   5. Final CTA with the "Now I gad it!" character.
 *
 * 2026-07: GROUP_COPY now carries native translations for all 13 UI
 * languages (EN stays the fallback for any future language that has
 * not been translated yet).
 */
type GroupKey = "understand" | "learn" | "master";

const FEATURE_GROUPS: Record<GroupKey, Feature["id"][]> = {
  understand: ["definitions", "examples", "idioms", "origin"],
  learn:      ["kids", "image", "notebook", "compose"],
  master:     ["quiz", "compare"],
};

interface GroupCopy {
  // ReactNode so Clear / Deep / Family titles can wrap the new word
  // in a tier-coloured <Hl> highlight, matching the /pricing tagline
  // pattern. Each title's NEW addition over the tier below picks up
  // the tier accent so the visual journey reads at a glance.
  groupTitles: Record<GroupKey, React.ReactNode>;
  groupSubs: Record<GroupKey, string>;
  // Family renders as a 4th group on /features with the same card-
  // grid chrome as Basic / Clear / Deep above. Each feature carries
  // its own icon + title + body, identical shape to Feature in the
  // c.list array used by the three tier groups.
  family: {
    title: React.ReactNode;
    sub: string;
    features: Array<{
      id: string;
      icon: FeatureIconName;
      title: string;
      body: string;
    }>;
  };
  bubble: string;
}

/** Tier-coloured highlight span used inside the group titles. Colour
 *  is inherited from the parent .wb-feat-group-{tier} class via
 *  globals.css so the same component lights up the correct hue per
 *  tier without prop-drilling. */
function Hl({ children }: { children: React.ReactNode }) {
  return <span className="wb-feat-group-title-hl">{children}</span>;
}

const GROUP_COPY: Record<string, GroupCopy> = {
  uk: {
    groupTitles: {
      understand: "Зрозумій слово",
      learn: <>Зрозумій і <Hl>побач</Hl> слово</>,
      master: <>Зрозумій, побач і <Hl>запамʼятай слово назавжди</Hl></>,
    },
    groupSubs: {
      understand:
        "Кожне значення, справжні речення в контексті, ідіоми, у яких воно живе, і звідки воно походить.",
      learn:
        "Зображення до слова, версія для дітей, особистий зошит і речення, яке ти пишеш, з відгуком.",
      master:
        "Персональні тести та ігри зі словами, що закріплюють слово надовго.",
    },
    family: {
      title: <>Зрозумій, побач, запамʼятай <Hl>для всієї родини</Hl></>,
      sub: "Одна підписка дає кожному членові родини власний обліковий запис з усіма розширеними можливостями. До 5 дітей.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Окремий профіль для кожного члена родини",
          body: "Зошит слів, історія пошуку та особиста серія навчання для кожної дитини й кожного з батьків.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Підключіть пристрій за QR-кодом",
          body: "Дитина сканує QR на своєму телефоні й входить. Звʼязок лишається назавжди, без пароля.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Панель для батьків",
          body: "Бачте кожне слово, яке шукала кожна дитина, і коли, стежте за її темпом з одного погляду.",
        },
        {
          id: "people",
          icon: "people",
          title: "До 5 дітей на одній підписці",
          body: "Кожна дитина отримує всі можливості Deep. Батьки платять один раз за всю родину.",
        },
      ],
    },
    bubble: "Тепер я gad it!",
  },
  tr: {
    groupTitles: {
      understand: "Kelimeyi anla",
      learn: <>Kelimeyi anla ve <Hl>gör</Hl></>,
      master: <>Kelimeyi anla, gör ve <Hl>sonsuza kadar hatırla</Hl></>,
    },
    groupSubs: {
      understand:
        "Her anlam, bağlam içinde gerçek cümleler, içinde yaşadığı deyimler ve nereden geldiği.",
      learn:
        "Kelime için bir görsel, çocuklara uygun bir sürüm, kişisel bir defter ve geri bildirimle yazdığın bir cümle.",
      master:
        "Kelimeyi uzun vadede kalıcı kılan kişiselleştirilmiş testler ve kelime oyunları.",
    },
    family: {
      title: <>Anla, gör, hatırla <Hl>tüm aile için</Hl></>,
      sub: "Tek bir abonelik, ailenin her üyesine tüm gelişmiş özelliklerle kendi hesabını verir. 5 çocuğa kadar.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Her aile üyesi için ayrı bir profil",
          body: "Her çocuk ve ebeveyn için kelime defteri, arama geçmişi ve kişisel öğrenme serisi.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Bir cihazı QR koduyla eşle",
          body: "Çocuğunuz telefonunda bir QR tarar ve giriş yapar. Sonsuza kadar eşli kalır, şifre gerekmez.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Ebeveyn paneli",
          body: "Her çocuğun hangi kelimeye ne zaman baktığını görün, hızlarını bir bakışta takip edin.",
        },
        {
          id: "people",
          icon: "people",
          title: "Tek abonelikte 5 çocuğa kadar",
          body: "Her çocuk tüm Deep özelliklerini alır. Ebeveyn, tüm aile için bir kez öder.",
        },
      ],
    },
    bubble: "Şimdi anladım, gad it!",
  },
  pl: {
    groupTitles: {
      understand: "Zrozum słowo",
      learn: <>Zrozum i <Hl>zobacz</Hl> słowo</>,
      master: <>Zrozum, zobacz i <Hl>zapamiętaj słowo na zawsze</Hl></>,
    },
    groupSubs: {
      understand:
        "Każde znaczenie, prawdziwe zdania w kontekście, idiomy, w których żyje, i skąd pochodzi.",
      learn:
        "Obraz do słowa, wersja przyjazna dzieciom, osobisty zeszyt i zdanie, które piszesz, z informacją zwrotną.",
      master:
        "Spersonalizowane quizy i gry słowne, które utrwalają słowo na długo.",
    },
    family: {
      title: <>Zrozum, zobacz, zapamiętaj <Hl>dla całej rodziny</Hl></>,
      sub: "Jedna subskrypcja daje każdemu członkowi rodziny własne konto ze wszystkimi zaawansowanymi funkcjami. Do 5 dzieci.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Osobny profil dla każdego członka rodziny",
          body: "Zeszyt słów, historia wyszukiwań i osobista seria nauki dla każdego dziecka i rodzica.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Sparuj urządzenie kodem QR",
          body: "Dziecko skanuje kod QR na swoim telefonie i loguje się. Pozostaje sparowane na zawsze, bez hasła.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Panel rodzica",
          body: "Zobacz każde słowo, które sprawdziło każde dziecko i kiedy, śledź jego tempo jednym spojrzeniem.",
        },
        {
          id: "people",
          icon: "people",
          title: "Do 5 dzieci w jednej subskrypcji",
          body: "Każde dziecko otrzymuje pełne funkcje Deep. Rodzic płaci raz za całą rodzinę.",
        },
      ],
    },
    bubble: "Teraz to złapałem!",
  },
  fa: {
    groupTitles: {
      understand: "کلمه را بفهم",
      learn: <>کلمه را بفهم و <Hl>ببین</Hl></>,
      master: <>کلمه را بفهم، ببین، و <Hl>برای همیشه به خاطر بسپار</Hl></>,
    },
    groupSubs: {
      understand:
        "هر معنا، جمله‌های واقعی در بافت، اصطلاحاتی که کلمه در آن‌ها زندگی می‌کند، و اینکه از کجا آمده است.",
      learn:
        "یک تصویر برای کلمه، نسخه‌ای مناسب کودکان، یک دفترچه شخصی، و جمله‌ای که خودت می‌نویسی با بازخورد.",
      master:
        "آزمون‌های شخصی‌سازی‌شده و بازی‌های کلمه‌ای که کلمه را برای بلندمدت تثبیت می‌کنند.",
    },
    family: {
      title: <>بفهم، ببین، به خاطر بسپار <Hl>برای کل خانواده</Hl></>,
      sub: "یک اشتراک به هر عضو خانواده حساب خودش را می‌دهد، با همه امکانات پیشرفته. تا ۵ کودک.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "یک پروفایل جداگانه برای هر عضو خانواده",
          body: "دفترچه کلمات، تاریخچه جستجو، و زنجیره یادگیری شخصی برای هر کودک و والد.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "جفت کردن دستگاه با کد QR",
          body: "کودکت یک QR را روی تلفنش اسکن می‌کند و وارد می‌شود. برای همیشه جفت می‌ماند، بدون رمز عبور.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "داشبورد والدین",
          body: "هر کلمه‌ای که هر کودک جستجو کرده و چه زمانی را ببین، سرعتشان را در یک نگاه دنبال کن.",
        },
        {
          id: "people",
          icon: "people",
          title: "تا ۵ کودک با یک اشتراک",
          body: "هر کودک همه امکانات Deep را می‌گیرد. والد یک بار برای کل خانواده پرداخت می‌کند.",
        },
      ],
    },
    bubble: "حالا گرفتمش!",
  },
  id: {
    groupTitles: {
      understand: "Pahami kata",
      learn: <>Pahami dan <Hl>lihat</Hl> kata</>,
      master: <>Pahami, lihat, dan <Hl>ingat kata selamanya</Hl></>,
    },
    groupSubs: {
      understand:
        "Setiap makna, kalimat nyata dalam konteks, idiom tempat kata itu hidup, dan dari mana asalnya.",
      learn:
        "Gambar untuk kata, versi ramah anak, buku catatan pribadi, dan kalimat yang kamu tulis dengan masukan.",
      master:
        "Kuis yang dipersonalisasi dan permainan kata yang menancapkan kata itu untuk jangka panjang.",
    },
    family: {
      title: <>Pahami, lihat, ingat <Hl>untuk seluruh keluarga</Hl></>,
      sub: "Satu langganan memberi setiap anggota keluarga akun mereka sendiri, dengan semua fitur canggih. Hingga 5 anak.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Profil terpisah untuk tiap anggota keluarga",
          body: "Buku catatan kata, riwayat pencarian, dan rangkaian belajar pribadi untuk setiap anak dan orang tua.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Sambungkan perangkat dengan kode QR",
          body: "Anakmu memindai QR di ponselnya dan masuk. Tetap tersambung selamanya, tanpa kata sandi.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Dasbor orang tua",
          body: "Lihat setiap kata yang dicari tiap anak dan kapan, ikuti kecepatan mereka sekilas.",
        },
        {
          id: "people",
          icon: "people",
          title: "Hingga 5 anak dalam satu langganan",
          body: "Setiap anak mendapatkan fitur Deep lengkap. Orang tua membayar sekali untuk seluruh keluarga.",
        },
      ],
    },
    bubble: "Sekarang aku paham!",
  },
  nl: {
    groupTitles: {
      understand: "Begrijp het woord",
      learn: <>Begrijp en <Hl>zie</Hl> het woord</>,
      master: <>Begrijp, zie en <Hl>onthoud het woord voor altijd</Hl></>,
    },
    groupSubs: {
      understand:
        "Elke betekenis, echte zinnen in context, de uitdrukkingen waarin het leeft, en waar het vandaan komt.",
      learn:
        "Een afbeelding voor het woord, een kindvriendelijke versie, een persoonlijk schrift, en een zin die je schrijft met feedback.",
      master:
        "Gepersonaliseerde quizzen en woordspellen die het woord voor de lange termijn vastleggen.",
    },
    family: {
      title: <>Begrijp, zie, onthoud <Hl>voor het hele gezin</Hl></>,
      sub: "Een abonnement geeft elk gezinslid een eigen account, met alle geavanceerde functies. Tot 5 kinderen.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Een apart profiel per gezinslid",
          body: "Woordenschrift, zoekgeschiedenis en persoonlijke leerreeks voor elk kind en elke ouder.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Koppel een apparaat met een QR-code",
          body: "Je kind scant een QR op de telefoon en logt in. Blijft voor altijd gekoppeld, zonder wachtwoord.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Ouderdashboard",
          body: "Zie elk woord dat elk kind heeft opgezocht en wanneer, volg hun tempo in een oogopslag.",
        },
        {
          id: "people",
          icon: "people",
          title: "Tot 5 kinderen op een abonnement",
          body: "Elk kind krijgt volledige Deep-functies. De ouder betaalt een keer voor het hele gezin.",
        },
      ],
    },
    bubble: "Nu snap ik het!",
  },
  he: {
    groupTitles: {
      understand: "להבין את המילה",
      learn: <>להבין <Hl>ולראות</Hl> את המילה</>,
      master: <>להבין, לראות <Hl>ולזכור את המילה לתמיד</Hl></>,
    },
    groupSubs: {
      understand:
        "כל המשמעויות, דוגמאות בהקשר, ניבים שהיא חיה בהם, והמקור ההיסטורי שלה.",
      learn:
        "תמונה למילה, מצב ילדים בשפה פשוטה, מחברת אישית, וכתיבת משפט עם משוב.",
      master:
        "חידונים מותאמים אישית ומשחקי מילים שמטמיעים את המילה לטווח ארוך.",
    },
    family: {
      title: <>להבין, לראות, לזכור <Hl>לכל בני המשפחה</Hl></>,
      sub: "מנוי אחד שנותן לכל בן משפחה חשבון משלו, עם כל הפיצ'רים המתקדמים. עד 5 ילדים.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "פרופיל נפרד לכל בן משפחה",
          body: "מחברת מילים, היסטוריית חיפושים, ורצף ימי למידה אישי לכל ילד והורה.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "חיבור מכשיר בקוד QR",
          body: "הילד מצלם QR בטלפון שלו ונכנס לחשבון, נשאר מחובר לתמיד בלי סיסמה.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "לוח בקרה להורה",
          body: "רואים את כל המילים שכל ילד חיפש ומתי, ועוקבים אחרי הקצב של כל אחד.",
        },
        {
          id: "people",
          icon: "people",
          title: "עד 5 ילדים תחת אותו מנוי",
          body: "כל ילד מקבל את כל פיצ'רי Deep, ההורה משלם פעם אחת על כל המשפחה.",
        },
      ],
    },
    // Brand pun stays in Latin in every language - like the Gadit
    // wordmark itself. See feedback_brand_name_english memory.
    bubble: "Now I gad it!",
  },
  en: {
    groupTitles: {
      understand: "Understand the word",
      learn: <>Understand and <Hl>see</Hl> the word</>,
      master: <>Understand, see, and <Hl>remember the word forever</Hl></>,
    },
    groupSubs: {
      understand:
        "Every meaning, real sentences in context, the idioms it lives in, and where it came from.",
      learn:
        "An image for the word, a kid-friendly version, a personal notebook, and a sentence you write with feedback.",
      master:
        "Personalized quizzes and word games that lock the word in for the long run.",
    },
    family: {
      title: <>Understand, see, remember <Hl>for the whole family</Hl></>,
      sub: "One subscription gives every family member their own account, with all the advanced features. Up to 5 children.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "A separate profile per family member",
          body: "Word notebook, search history, and personal learning streak for every child and parent.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Pair a device with a QR code",
          body: "Your child scans a QR on their phone and signs in. Stays paired forever, no password.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Parent dashboard",
          body: "See every word each child looked up and when, follow their pace at a glance.",
        },
        {
          id: "people",
          icon: "people",
          title: "Up to 5 children on one subscription",
          body: "Every child gets full Deep features. Parent pays once for the whole family.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  zu: {
    groupTitles: {
      understand: "Qonda igama",
      learn: <>Qonda futhi <Hl>ubone</Hl> igama</>,
      master: <>Qonda, ubone, futhi <Hl>ukhumbule igama kuze kube phakade</Hl></>,
    },
    groupSubs: {
      understand:
        "Yonke incazelo, imisho yangempela ngomongo, izisho eliphila kuzo, nokuthi lisukaphi.",
      learn:
        "Isithombe segama, uhlobo olulungele izingane, incwadi yakho siqu, nomusho owubhalayo onempendulo.",
      master:
        "Imibuzo eyenzelwe wena nemidlalo yamagama egcina igama isikhathi eside.",
    },
    family: {
      title: <>Qonda, bona, khumbula <Hl>kuwo wonke umndeni</Hl></>,
      sub: "Ukubhalisa okukodwa kunikeza ilungu ngalinye lomndeni i-akhawunti yalo siqu, nazo zonke izici ezithuthukile. Kufika ezinganeni ezi-5.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Iphrofayela ehlukene esebenzela ilungu ngalinye lomndeni",
          body: "Incwadi yamagama, umlando wosesho, nochungechunge lokufunda oluqondene nengane ngayinye nomzali ngamunye.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Xhuma idivayisi ngekhodi ye-QR",
          body: "Ingane yakho iskena i-QR efonini yayo bese ingena. Ihlala ixhunywe kuze kube phakade, ngaphandle kwephasiwedi.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Ideshibhodi yomzali",
          body: "Bona wonke amagama ingane ngayinye eyawabhekayo nokuthi nini, ulandele ijubane layo ngokushesha.",
        },
        {
          id: "people",
          icon: "people",
          title: "Kufika ezinganeni ezi-5 ngokubhalisa okukodwa",
          body: "Ingane ngayinye ithola zonke izici ze-Deep. Umzali ukhokha kanye kuwo wonke umndeni.",
        },
      ],
    },
    bubble: "Manje sengiyi-gad it!",
  },
  el: {
    groupTitles: {
      understand: "Κατάλαβε τη λέξη",
      learn: <>Κατάλαβε και <Hl>δες</Hl> τη λέξη</>,
      master: <>Κατάλαβε, δες και <Hl>θυμήσου τη λέξη για πάντα</Hl></>,
    },
    groupSubs: {
      understand:
        "Κάθε σημασία, αληθινές προτάσεις σε συμφραζόμενα, οι εκφράσεις όπου ζει, και από πού προήλθε.",
      learn:
        "Μια εικόνα για τη λέξη, μια εκδοχή για παιδιά, ένα προσωπικό τετράδιο, και μια πρόταση που γράφεις εσύ με σχόλια.",
      master:
        "Εξατομικευμένα κουίζ και παιχνίδια λέξεων που κλειδώνουν τη λέξη για τα καλά.",
    },
    family: {
      title: <>Κατάλαβε, δες, θυμήσου <Hl>για όλη την οικογένεια</Hl></>,
      sub: "Μία συνδρομή δίνει σε κάθε μέλος της οικογένειας τον δικό του λογαριασμό, με όλες τις προηγμένες δυνατότητες. Έως 5 παιδιά.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Ξεχωριστό προφίλ για κάθε μέλος της οικογένειας",
          body: "Τετράδιο λέξεων, ιστορικό αναζήτησης και προσωπικό σερί μάθησης για κάθε παιδί και γονιό.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Σύνδεσε μια συσκευή με κωδικό QR",
          body: "Το παιδί σου σαρώνει ένα QR στο τηλέφωνό του και συνδέεται. Μένει συνδεδεμένο για πάντα, χωρίς κωδικό.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Πίνακας για γονείς",
          body: "Δες κάθε λέξη που αναζήτησε κάθε παιδί και πότε, και παρακολούθησε τον ρυθμό του με μια ματιά.",
        },
        {
          id: "people",
          icon: "people",
          title: "Έως 5 παιδιά σε μία συνδρομή",
          body: "Κάθε παιδί αποκτά όλες τις δυνατότητες Deep. Ο γονιός πληρώνει μία φορά για όλη την οικογένεια.",
        },
      ],
    },
    bubble: "Τώρα το έπιασα, gad it!",
  },
  hi: {
    groupTitles: {
      understand: "शब्द को समझें",
      learn: <>शब्द को समझें और <Hl>देखें</Hl></>,
      master: <>समझें, देखें और <Hl>हमेशा के लिए शब्द को याद रखें</Hl></>,
    },
    groupSubs: {
      understand:
        "हर अर्थ, संदर्भ में असली वाक्य, मुहावरे जिनमें यह शब्द जीता है, और यह कहाँ से आया।",
      learn:
        "शब्द की एक तस्वीर, बच्चों के लिए सरल समझ, व्यक्तिगत नोटबुक, और एक वाक्य जो आप लिखें और फ़ीडबैक पाएँ।",
      master:
        "व्यक्तिगत क्विज़ और शब्द-खेल जो शब्द को लम्बे समय तक पक्का करते हैं।",
    },
    family: {
      title: <>समझें, देखें, याद रखें <Hl>पूरे परिवार के लिए</Hl></>,
      sub: "एक सब्सक्रिप्शन हर बच्चे को अपना अलग खाता देता है, सभी उन्नत सुविधाओं के साथ। 5 बच्चों तक।",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "हर बच्चे के लिए अलग प्रोफ़ाइल",
          body: "शब्द-नोटबुक, खोज इतिहास और हर बच्चे और माता-पिता के लिए व्यक्तिगत सीखने का सिलसिला।",
        },
        {
          id: "qr",
          icon: "qr",
          title: "QR कोड से डिवाइस जोड़ें",
          body: "आपका बच्चा अपने फ़ोन पर QR स्कैन करे और साइन इन हो जाए। हमेशा जुड़ा रहता है, बिना पासवर्ड।",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "माता-पिता का डैशबोर्ड",
          body: "देखें हर बच्चे ने कौन-सा शब्द कब खोजा। एक नज़र में हर एक की रफ़्तार समझें।",
        },
        {
          id: "people",
          icon: "people",
          title: "एक सब्सक्रिप्शन में 5 बच्चे तक",
          body: "हर बच्चे को Deep की पूरी सुविधाएँ। माता-पिता एक बार पूरे परिवार के लिए भुगतान करें।",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  am: {
    groupTitles: {
      understand: "ቃሉን መረዳት",
      learn: <>ቃሉን መረዳት እና <Hl>ማየት</Hl></>,
      master: <>መረዳት፣ ማየት እና <Hl>ቃሉን ለዘላለም ማስታወስ</Hl></>,
    },
    groupSubs: {
      understand:
        "እያንዳንዱ ትርጉም፣ በአውድ ውስጥ እውነተኛ ዓረፍተ ነገሮች፣ ቃሉ የሚኖርባቸው ፈሊጦች፣ እና ከየት እንደመጣ።",
      learn:
        "ለቃሉ ምስል፣ ለልጆች የቀለለ ማብራሪያ፣ የግል ማስታወሻ ደብተር፣ እና እርስዎ የሚጽፉት ዓረፍተ ነገር ከግብረ መልስ ጋር።",
      master:
        "ቃሉን ለረጅም ጊዜ የሚያጸኑ የተበጁ ኩዊዞች እና የቃላት ጨዋታዎች።",
    },
    family: {
      title: <>መረዳት፣ ማየት፣ ማስታወስ <Hl>ለመላው ቤተሰብ</Hl></>,
      sub: "አንድ ምዝገባ ለእያንዳንዱ የቤተሰብ አባል የራሱን መለያ ይሰጣል፣ ከሁሉም የላቁ ባህሪያት ጋር። እስከ 5 ልጆች።",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "ለእያንዳንዱ የቤተሰብ አባል የተለየ መገለጫ",
          body: "የቃላት ማስታወሻ ደብተር፣ የፍለጋ ታሪክ፣ እና ለእያንዳንዱ ልጅ እና ወላጅ የግል የመማሪያ ተከታታይ ቀናት።",
        },
        {
          id: "qr",
          icon: "qr",
          title: "መሣሪያን በ QR ኮድ ማገናኘት",
          body: "ልጅዎ በስልኩ QR ኮድ ይቃኛል እና ይገባል። ያለ የይለፍ ቃል ለዘላለም ተገናኝቶ ይቆያል።",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "የወላጅ ዳሽቦርድ",
          body: "እያንዳንዱ ልጅ የትኛውን ቃል መቼ እንደፈለገ ይመልከቱ፣ የእያንዳንዱን ፍጥነት በአንድ እይታ ይከታተሉ።",
        },
        {
          id: "people",
          icon: "people",
          title: "በአንድ ምዝገባ እስከ 5 ልጆች",
          body: "እያንዳንዱ ልጅ ሙሉ የ Deep ባህሪያትን ያገኛል። ወላጅ ለመላው ቤተሰብ አንድ ጊዜ ይከፍላል።",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  ar: {
    groupTitles: {
      understand: "افهم الكلمة",
      learn: <>افهم الكلمة <Hl>وشاهدها</Hl></>,
      master: <>افهم الكلمة وشاهدها <Hl>وتذكّرها إلى الأبد</Hl></>,
    },
    groupSubs: {
      understand:
        "كل المعاني، جمل حقيقية في سياقها، التعابير التي تعيش فيها الكلمة، وأصلها التاريخي.",
      learn:
        "صورة للكلمة، شرح مبسّط للأطفال، دفتر شخصي، وجملة تكتبها بنفسك وتحصل على ملاحظات.",
      master:
        "اختبارات مخصّصة وألعاب كلمات ترسّخ الكلمة في الذاكرة لوقت طويل.",
    },
    family: {
      title: <>افهم، شاهد، تذكّر، <Hl>لكل أفراد العائلة</Hl></>,
      sub: "اشتراك واحد يمنح كل فرد من العائلة حساباً خاصاً به، مع كل الميزات المتقدمة. حتى 5 أطفال.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "ملف شخصي منفصل لكل فرد من العائلة",
          body: "دفتر كلمات، سجلّ بحث، وسلسلة تعلّم شخصية لكل طفل وكل والد.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "ربط الجهاز برمز QR",
          body: "يمسح طفلك رمز QR بهاتفه ويسجّل الدخول. يبقى متصلاً دائماً، من دون كلمة مرور.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "لوحة تحكّم للوالدين",
          body: "شاهد كل كلمة بحث عنها كل طفل ومتى، وتابع وتيرة تعلّمه بنظرة واحدة.",
        },
        {
          id: "people",
          icon: "people",
          title: "حتى 5 أطفال في اشتراك واحد",
          body: "كل طفل يحصل على كامل ميزات Deep. يدفع الوالد مرة واحدة عن العائلة كلها.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  ru: {
    groupTitles: {
      understand: "Понять слово",
      learn: <>Понять и <Hl>увидеть</Hl> слово</>,
      master: <>Понять, увидеть и <Hl>запомнить слово навсегда</Hl></>,
    },
    groupSubs: {
      understand:
        "Все значения, живые предложения в контексте, идиомы, в которых живёт слово, и его происхождение.",
      learn:
        "Картинка к слову, простая версия для детей, личная тетрадь и ваше собственное предложение с мгновенной обратной связью.",
      master:
        "Персональные викторины и игры со словами, которые закрепляют слово надолго.",
    },
    family: {
      title: <>Понять, увидеть, запомнить, <Hl>для всей семьи</Hl></>,
      sub: "Одна подписка даёт каждому члену семьи собственный аккаунт со всеми расширенными возможностями. До 5 детей.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Отдельный профиль для каждого члена семьи",
          body: "Тетрадь слов, история поиска и личная серия обучения для каждого ребёнка и родителя.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Подключение устройства по QR-коду",
          body: "Ребёнок сканирует QR на своём телефоне и входит в аккаунт. Остаётся подключённым навсегда, без пароля.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Панель для родителей",
          body: "Смотрите, какие слова искал каждый ребёнок и когда, и следите за темпом каждого.",
        },
        {
          id: "people",
          icon: "people",
          title: "До 5 детей в одной подписке",
          body: "Каждый ребёнок получает все возможности Deep. Родитель платит один раз за всю семью.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  es: {
    groupTitles: {
      understand: "Entiende la palabra",
      learn: <>Entiende y <Hl>ve</Hl> la palabra</>,
      master: <>Entiende, ve y <Hl>recuerda la palabra para siempre</Hl></>,
    },
    groupSubs: {
      understand:
        "Todos los significados, oraciones reales en contexto, los modismos donde vive la palabra y su origen.",
      learn:
        "Una imagen para la palabra, una versión para niños, un cuaderno personal y una oración que escribes con comentarios.",
      master:
        "Cuestionarios personalizados y juegos de palabras que fijan la palabra a largo plazo.",
    },
    family: {
      title: <>Entiende, ve, recuerda, <Hl>para toda la familia</Hl></>,
      sub: "Una sola suscripción le da a cada miembro de la familia su propia cuenta, con todas las funciones avanzadas. Hasta 5 niños.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Un perfil separado para cada miembro de la familia",
          body: "Cuaderno de palabras, historial de búsqueda y racha personal de aprendizaje para cada niño y cada padre.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Conecta un dispositivo con un código QR",
          body: "Tu hijo escanea un QR en su teléfono e inicia sesión. Queda conectado para siempre, sin contraseña.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Panel para padres",
          body: "Ve cada palabra que buscó cada niño y cuándo, y sigue su ritmo de un vistazo.",
        },
        {
          id: "people",
          icon: "people",
          title: "Hasta 5 niños en una sola suscripción",
          body: "Cada niño recibe todas las funciones de Deep. El padre paga una sola vez por toda la familia.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  pt: {
    groupTitles: {
      understand: "Entenda a palavra",
      learn: <>Entenda e <Hl>veja</Hl> a palavra</>,
      master: <>Entenda, veja e <Hl>lembre-se da palavra para sempre</Hl></>,
    },
    groupSubs: {
      understand:
        "Todos os significados, frases reais em contexto, as expressões em que a palavra vive e a origem dela.",
      learn:
        "Uma imagem para a palavra, uma versão para crianças, um caderno pessoal e uma frase que você escreve com feedback.",
      master:
        "Quizzes personalizados e jogos de palavras que fixam a palavra por muito tempo.",
    },
    family: {
      title: <>Entenda, veja, lembre, <Hl>para a família toda</Hl></>,
      sub: "Uma assinatura dá a cada membro da família uma conta própria, com todos os recursos avançados. Até 5 crianças.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Um perfil separado para cada membro da família",
          body: "Caderno de palavras, histórico de buscas e sequência pessoal de aprendizado para cada criança e cada responsável.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Conecte um aparelho com código QR",
          body: "Seu filho escaneia um QR no celular e entra na conta. Fica conectado para sempre, sem senha.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Painel para os pais",
          body: "Veja cada palavra que cada criança buscou e quando, e acompanhe o ritmo de todos num relance.",
        },
        {
          id: "people",
          icon: "people",
          title: "Até 5 crianças em uma assinatura",
          body: "Cada criança recebe todos os recursos do Deep. Os pais pagam uma vez pela família toda.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  fr: {
    groupTitles: {
      understand: "Comprendre le mot",
      learn: <>Comprendre et <Hl>voir</Hl> le mot</>,
      master: <>Comprendre, voir et <Hl>retenir le mot pour toujours</Hl></>,
    },
    groupSubs: {
      understand:
        "Tous les sens, de vraies phrases en contexte, les expressions où vit le mot, et son origine.",
      learn:
        "Une image pour le mot, une version pour les enfants, un carnet personnel et une phrase que vous écrivez avec un retour.",
      master:
        "Des quiz personnalisés et des jeux de mots qui ancrent le mot durablement.",
    },
    family: {
      title: <>Comprendre, voir, retenir, <Hl>pour toute la famille</Hl></>,
      sub: "Un seul abonnement donne à chaque membre de la famille son propre compte, avec toutes les fonctionnalités avancées. Jusqu'à 5 enfants.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Un profil distinct pour chaque membre de la famille",
          body: "Carnet de mots, historique de recherche et série d'apprentissage personnelle pour chaque enfant et chaque parent.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Associer un appareil avec un code QR",
          body: "Votre enfant scanne un QR sur son téléphone et se connecte. Il reste connecté pour toujours, sans mot de passe.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Tableau de bord parental",
          body: "Voyez chaque mot recherché par chaque enfant et quand, et suivez son rythme d'un coup d'œil.",
        },
        {
          id: "people",
          icon: "people",
          title: "Jusqu'à 5 enfants avec un seul abonnement",
          body: "Chaque enfant profite de toutes les fonctionnalités Deep. Le parent paie une seule fois pour toute la famille.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  de: {
    groupTitles: {
      understand: "Das Wort verstehen",
      learn: <>Das Wort verstehen und <Hl>sehen</Hl></>,
      master: <>Verstehen, sehen und <Hl>das Wort für immer behalten</Hl></>,
    },
    groupSubs: {
      understand:
        "Jede Bedeutung, echte Sätze im Kontext, die Redewendungen, in denen das Wort lebt, und seine Herkunft.",
      learn:
        "Ein Bild zum Wort, eine kindgerechte Version, ein persönliches Notizbuch und ein Satz, den du schreibst und Feedback bekommst.",
      master:
        "Personalisierte Quizze und Wortspiele, die das Wort langfristig verankern.",
    },
    family: {
      title: <>Verstehen, sehen, behalten, <Hl>für die ganze Familie</Hl></>,
      sub: "Ein Abo gibt jedem Familienmitglied ein eigenes Konto, mit allen erweiterten Funktionen. Bis zu 5 Kinder.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Ein eigenes Profil pro Familienmitglied",
          body: "Wörter-Notizbuch, Suchverlauf und persönliche Lernserie für jedes Kind und jeden Elternteil.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Gerät per QR-Code koppeln",
          body: "Dein Kind scannt einen QR auf seinem Handy und ist angemeldet. Bleibt für immer verbunden, ganz ohne Passwort.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Eltern-Dashboard",
          body: "Sieh jedes Wort, das jedes Kind nachgeschlagen hat und wann, und behalte das Tempo im Blick.",
        },
        {
          id: "people",
          icon: "people",
          title: "Bis zu 5 Kinder in einem Abo",
          body: "Jedes Kind bekommt alle Deep-Funktionen. Eltern zahlen einmal für die ganze Familie.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  cs: {
    groupTitles: {
      understand: "Porozumět slovu",
      learn: <>Porozumět slovu a <Hl>vidět ho</Hl></>,
      master: <>Porozumět, vidět a <Hl>zapamatovat si slovo navždy</Hl></>,
    },
    groupSubs: {
      understand:
        "Každý význam, skutečné věty v kontextu, idiomy, ve kterých slovo žije, a jeho původ.",
      learn:
        "Obrázek ke slovu, verze pro děti, osobní sešit a věta, kterou napíšeš a dostaneš zpětnou vazbu.",
      master:
        "Personalizované kvízy a slovní hry, které ti slovo uloží do paměti nadlouho.",
    },
    family: {
      title: <>Porozumět, vidět, zapamatovat si, <Hl>pro celou rodinu</Hl></>,
      sub: "Jedno předplatné dá každému členovi rodiny vlastní účet se všemi pokročilými funkcemi. Až 5 dětí.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Samostatný profil pro každého člena rodiny",
          body: "Sešit slov, historie hledání a osobní série učení pro každé dítě i rodiče.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Připojení zařízení QR kódem",
          body: "Dítě naskenuje QR na svém telefonu a je přihlášené. Zůstane připojené napořád, bez hesla.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Rodičovský přehled",
          body: "Vidíš každé slovo, které si každé dítě vyhledalo a kdy, a máš jeho tempo stále na očích.",
        },
        {
          id: "people",
          icon: "people",
          title: "Až 5 dětí v jednom předplatném",
          body: "Každé dítě dostane všechny funkce Deep. Rodič platí jednou za celou rodinu.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  sk: {
    groupTitles: {
      understand: "Porozumieť slovu",
      learn: <>Porozumieť slovu a <Hl>vidieť ho</Hl></>,
      master: <>Porozumieť, vidieť a <Hl>zapamätať si slovo navždy</Hl></>,
    },
    groupSubs: {
      understand:
        "Každý význam, skutočné vety v kontexte, idiómy, v ktorých slovo žije, a jeho pôvod.",
      learn:
        "Obrázok k slovu, verzia pre deti, osobný zošit a veta, ktorú napíšeš a dostaneš spätnú väzbu.",
      master:
        "Personalizované kvízy a slovné hry, ktoré ti slovo uložia do pamäti nadlho.",
    },
    family: {
      title: <>Porozumieť, vidieť, zapamätať si, <Hl>pre celú rodinu</Hl></>,
      sub: "Jedno predplatné dá každému členovi rodiny vlastný účet so všetkými pokročilými funkciami. Až 5 detí.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Samostatný profil pre každého člena rodiny",
          body: "Zošit slov, história hľadania a osobná séria učenia pre každé dieťa aj rodiča.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Pripojenie zariadenia QR kódom",
          body: "Dieťa naskenuje QR na svojom telefóne a je prihlásené. Zostane pripojené navždy, bez hesla.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Rodičovský prehľad",
          body: "Vidíš každé slovo, ktoré si každé dieťa vyhľadalo a kedy, a máš jeho tempo stále na očiach.",
        },
        {
          id: "people",
          icon: "people",
          title: "Až 5 detí v jednom predplatnom",
          body: "Každé dieťa dostane všetky funkcie Deep. Rodič platí raz za celú rodinu.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  it: {
    groupTitles: {
      understand: "Capire la parola",
      learn: <>Capire e <Hl>vedere</Hl> la parola</>,
      master: <>Capire, vedere e <Hl>ricordare la parola per sempre</Hl></>,
    },
    groupSubs: {
      understand:
        "Tutti i significati, frasi vere nel contesto, i modi di dire in cui vive la parola e la sua origine.",
      learn:
        "Un'immagine per la parola, una versione per bambini, un quaderno personale e una frase che scrivi con feedback.",
      master:
        "Quiz personalizzati e giochi di parole che fissano la parola nel lungo periodo.",
    },
    family: {
      title: <>Capire, vedere, ricordare, <Hl>per tutta la famiglia</Hl></>,
      sub: "Un solo abbonamento dà a ogni membro della famiglia un account personale, con tutte le funzionalità avanzate. Fino a 5 bambini.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "Un profilo separato per ogni membro della famiglia",
          body: "Quaderno delle parole, cronologia delle ricerche e serie personale di apprendimento per ogni bambino e genitore.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Collega un dispositivo con un codice QR",
          body: "Tuo figlio scansiona un QR sul suo telefono e accede. Resta collegato per sempre, senza password.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Pannello per i genitori",
          body: "Vedi ogni parola cercata da ogni bambino e quando, e segui il suo ritmo a colpo d'occhio.",
        },
        {
          id: "people",
          icon: "people",
          title: "Fino a 5 bambini con un solo abbonamento",
          body: "Ogni bambino ha tutte le funzionalità Deep. Il genitore paga una volta sola per tutta la famiglia.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  ja: {
    groupTitles: {
      understand: "単語を理解する",
      learn: <>単語を理解して<Hl>目で見る</Hl></>,
      master: <>理解して、見て、<Hl>単語をずっと覚えておく</Hl></>,
    },
    groupSubs: {
      understand:
        "すべての意味、文脈の中の実際の例文、その単語が使われる慣用句、そして語源まで。",
      learn:
        "単語の画像、子ども向けのやさしい説明、自分だけのノート、そしてフィードバック付きの作文練習。",
      master:
        "パーソナライズされたクイズと単語ゲームで、単語を長く記憶に定着させます。",
    },
    family: {
      title: <>理解して、見て、覚える。<Hl>家族みんなで</Hl></>,
      sub: "ひとつのサブスクリプションで、家族全員がそれぞれのアカウントを持てます。高度な機能もすべて使えて、お子さまは5人まで。",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "家族ひとりひとりに専用プロフィール",
          body: "単語ノート、検索履歴、学習の連続記録を、お子さまにも保護者にもひとりずつ用意します。",
        },
        {
          id: "qr",
          icon: "qr",
          title: "QRコードで端末を連携",
          body: "お子さまが自分のスマートフォンでQRを読み取るだけでログイン。パスワードなしで、ずっとつながったままです。",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "保護者用ダッシュボード",
          body: "お子さまがいつどの単語を調べたかをひと目で確認でき、学習のペースを見守れます。",
        },
        {
          id: "people",
          icon: "people",
          title: "ひとつの契約でお子さま5人まで",
          body: "すべてのお子さまがDeepの全機能を使えます。お支払いは家族全体で一度だけです。",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
};

function pickGroupCopy(lang: string): GroupCopy {
  return GROUP_COPY[lang] ?? GROUP_COPY.en;
}

const COPY: Record<string, {
  heroEyebrow: string;
  heroTitle: string;
  heroSub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  signin: string;
  pricing: string;
  search: string;
  features: string;
  sectionLabel: string;
  finalCtaTitle: string;
  finalCtaSub: string;
  finalCtaBtn: string;
  tierLabel: { basic: string; clear: string; deep: string };
  list: Feature[];
}> = {
  he: {
    heroEyebrow: "פיצ'רים",
    heroTitle: "סוף סוף מילון שלא עוצר בהגדרה.",
    heroSub: "Gadit מבין כל מילה עד הסוף. כל המשמעויות, דוגמאות בהקשר, ניבים, מקור היסטורי ותרגול. עד שהמילה באמת ברורה. אנחנו קוראים לזה לעשות GAD למילה.",
    ctaPrimary: "התחילו חינם",
    ctaSecondary: "צפו בתמחור",
    signin: "התחברות", pricing: "תמחור", search: "חיפוש", features: "פיצ'רים",
    sectionLabel: "מה תקבלו",
    finalCtaTitle: "מוכנים לנסות?",
    finalCtaSub: "התחילו עם Basic לגמרי חינם. שדרוג בשבריר שניה, רק כשתרצו לראות יותר.",
    finalCtaBtn: "התחילו עכשיו",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "כל ההגדרות למילה",                  body: "כל המשמעויות של המילה, גם הנדירות, מסודרות לפי שכיחות שימוש." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "דוגמאות לפי הקשר",                  body: "שלושה משפטים לכל משמעות, כדי שתראו איך המילה חיה בתוך משפט אמיתי." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "ניבים וצירופי מילים",               body: "ביטויים שהמילה חלק מהם, יחד עם פירוש הביטוי כולו." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "מקור המילה",                        body: "מאיזו שפה הגיעה המילה, ומה היא במקור הייתה." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "הסבר לילדים",                       body: "הסבר פשוט וברור, בשפה שילד יבין בלי מונחים מסובכים." },
      { id: "image",       icon: "image",       tier: "clear", title: "המילה כתמונה",                     body: "תמונה ייחודית לכל מילה, לפי המשמעות המדויקת שאתם קוראים." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "מחברת מילים אישית",                 body: "שמרו מילים שאתם רוצים לזכור. זמינות גם בלי חיבור לאינטרנט." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "כתבו משפט וקבלו משוב",             body: "כתבו משפט משלכם עם המילה, וקבלו תיקון ומשוב מיידי." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "חידונים מותאמים אישית",             body: "חידון יומי על המילים שלמדתם, כדי שהן יישארו אצלכם לזמן ארוך." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "משחקי מילים",                       body: "משחקים שבונים אוצר מילים: שיוך, ניחוש, יצירת קשרים בין מילים." },
    ],
  },
  en: {
    heroEyebrow: "Features",
    heroTitle: "A dictionary that doesn't stop at the definition.",
    heroSub: "Gadit understands a word all the way through. Every meaning, real sentences in context, idioms, origin and practice. Until the word actually clicks. That's what we call GAD-ing a word.",
    ctaPrimary: "Start free",
    ctaSecondary: "See pricing",
    signin: "Sign in", pricing: "Pricing", search: "Search", features: "Features",
    sectionLabel: "What you get",
    finalCtaTitle: "Ready to try it?",
    finalCtaSub: "Start with Basic, completely free. Upgrade in a tap, only when you want more.",
    finalCtaBtn: "Start now",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Every definition",                 body: "All meanings of the word, even the rare ones, ordered by how often they're used." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Real sentences in context",        body: "Three real sentences per meaning, so the context lands immediately." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Idioms and expressions",           body: "Every expression the word is part of, with the full meaning of the phrase." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Where the word came from",         body: "The language the word started in, and what it originally meant." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Kids' explanation",                body: "A clear, simple version a child can read without any jargon." },
      { id: "image",       icon: "image",       tier: "clear", title: "The word as an image",             body: "A unique image for the word, matched to the exact meaning you're reading." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Personal word notebook",           body: "Save the words you want to remember. Available even without internet." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Write a sentence, get feedback",   body: "Compose your own sentence with the word and get instant correction and feedback." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalized quizzes",             body: "A daily quiz on the words you learned, so they stay with you for the long run." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Word games",                       body: "Games that grow your vocabulary: matching, guessing, building connections between words." },
    ],
  },
  zu: {
    heroEyebrow: "Izici",
    heroTitle: "Isichazamazwi esingagcini encazelweni.",
    heroSub: "I-Gadit liqonda igama ngokugcwele. Yonke incazelo, imisho yangempela ngomongo, izisho, umsuka nokuzijwayeza. Kuze kube igama liqondakala ngempela. Yilokho esikubiza ngokuthi uku-GAD-a igama.",
    ctaPrimary: "Qala mahhala",
    ctaSecondary: "Bona amanani",
    signin: "Ngena", pricing: "Amanani", search: "Sesha", features: "Izici",
    sectionLabel: "Okutholayo",
    finalCtaTitle: "Usukulungele ukuyizama?",
    finalCtaSub: "Qala nge-Basic, mahhala ngokuphelele. Thuthukisa ngokuthepha kanye, kuphela lapho ufuna okwengeziwe.",
    finalCtaBtn: "Qala manje",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Zonke izincazelo",                  body: "Zonke izincazelo zegama, ngisho nezingavamile, zihlelwe ngokuthi zisetshenziswa kangakanani." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Imisho yangempela ngomongo",        body: "Imisho yangempela emithathu encazelweni ngayinye, ukuze umongo uqondakale ngokushesha." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Izisho nemishwana",                 body: "Wonke umshwana igama eliyingxenye yawo, nencazelo egcwele yomshwana." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Ukuthi igama lisukaphi",           body: "Ulimi igama eliqale kulo, nokuthi lalisho ukuthini ekuqaleni." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Incazelo yezingane",                body: "Uhlobo olucacile, olulula ingane engalufunda ngaphandle kwamagama anzima." },
      { id: "image",       icon: "image",       tier: "clear", title: "Igama njengesithombe",             body: "Isithombe esiyingqayizivele segama, esihambisana ncamashi nencazelo oyifundayo." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Incwadi yamagama yakho siqu",       body: "Londoloza amagama ofuna ukuwakhumbula. Ayatholakala ngisho ngaphandle kwe-inthanethi." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Bhala umusho, uthole impendulo",    body: "Yakha umusho wakho siqu ngegama bese uthola ukulungiswa nempendulo ngokushesha." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Imibuzo eyenzelwe wena",            body: "Umbuzo wansuku zonke ngamagama owawafundayo, ukuze ahlale nawe isikhathi eside." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Imidlalo yamagama",                 body: "Imidlalo ekhulisa isilulumagama sakho: ukuhambisanisa, ukuqagela, ukwakha ukuxhumana phakathi kwamagama." },
    ],
  },
  el: {
    heroEyebrow: "Δυνατότητες",
    heroTitle: "Ένα λεξικό που δεν σταματά στον ορισμό.",
    heroSub: "Το Gadit καταλαβαίνει μια λέξη ως το τέλος. Κάθε σημασία, αληθινές προτάσεις σε συμφραζόμενα, εκφράσεις, προέλευση και εξάσκηση. Μέχρι η λέξη να κάνει πραγματικά κλικ. Αυτό λέμε να GAD-άρεις μια λέξη.",
    ctaPrimary: "Ξεκίνα δωρεάν",
    ctaSecondary: "Δες τις τιμές",
    signin: "Σύνδεση", pricing: "Τιμές", search: "Αναζήτηση", features: "Δυνατότητες",
    sectionLabel: "Τι αποκτάς",
    finalCtaTitle: "Έτοιμος να το δοκιμάσεις;",
    finalCtaSub: "Ξεκίνα με το Basic, εντελώς δωρεάν. Αναβάθμισε με ένα άγγιγμα, μόνο όταν θέλεις περισσότερα.",
    finalCtaBtn: "Ξεκίνα τώρα",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Κάθε ορισμός",                        body: "Όλες οι σημασίες της λέξης, ακόμη και οι σπάνιες, ταξινομημένες κατά συχνότητα χρήσης." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Αληθινές προτάσεις σε συμφραζόμενα",  body: "Τρεις αληθινές προτάσεις ανά σημασία, ώστε τα συμφραζόμενα να γίνονται αμέσως σαφή." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Ιδιωματισμοί και εκφράσεις",         body: "Κάθε έκφραση στην οποία ανήκει η λέξη, με την πλήρη σημασία της φράσης." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Από πού προήλθε η λέξη",             body: "Η γλώσσα από την οποία ξεκίνησε η λέξη, και τι σήμαινε αρχικά." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Εξήγηση για παιδιά",                body: "Μια καθαρή, απλή εκδοχή που μπορεί να διαβάσει ένα παιδί χωρίς δύσκολους όρους." },
      { id: "image",       icon: "image",       tier: "clear", title: "Η λέξη ως εικόνα",                  body: "Μια μοναδική εικόνα για τη λέξη, ταιριασμένη με την ακριβή σημασία που διαβάζεις." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Προσωπικό τετράδιο λέξεων",         body: "Αποθήκευσε τις λέξεις που θέλεις να θυμάσαι. Διαθέσιμο ακόμη και χωρίς ίντερνετ." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Γράψε μια πρόταση, πάρε σχόλια",     body: "Σύνθεσε τη δική σου πρόταση με τη λέξη και πάρε άμεση διόρθωση και σχόλια." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Εξατομικευμένα κουίζ",              body: "Ένα καθημερινό κουίζ στις λέξεις που έμαθες, ώστε να μένουν μαζί σου για τα καλά." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Παιχνίδια λέξεων",                  body: "Παιχνίδια που μεγαλώνουν το λεξιλόγιό σου: αντιστοίχιση, μάντεμα, χτίσιμο συνδέσεων ανάμεσα στις λέξεις." },
    ],
  },
  de: {
    heroEyebrow: "Funktionen",
    heroTitle: "Was ein Wörterbuch längst tun sollte.",
    heroSub: "Gadit versteht ein Wort bis zum Ende. Nicht nur eine Definition. Jede Bedeutung, echte Beispielsätze im Kontext, Redewendungen, Herkunft und alles, was ein normales Wörterbuch nie zeigen konnte.",
    ctaPrimary: "Kostenlos starten",
    ctaSecondary: "Preise ansehen",
    signin: "Anmelden", pricing: "Preise", search: "Suche", features: "Funktionen",
    sectionLabel: "Das bekommst du",
    finalCtaTitle: "Bereit, es zu testen?",
    finalCtaSub: "Beginne mit Basic, völlig kostenlos. Upgrade in einem Tipp, sobald du mehr willst.",
    finalCtaBtn: "Jetzt starten",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Jede Definition",                   body: "Alle Bedeutungen eines Wortes, auch die seltenen, geordnet nach Häufigkeit." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Echte Sätze im Kontext",            body: "Drei echte Beispielsätze pro Bedeutung, damit der Kontext sofort sitzt." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Redewendungen und Ausdrücke",       body: "Jeder Ausdruck, in dem das Wort vorkommt, samt vollständiger Bedeutung der Phrase." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Woher das Wort stammt",             body: "Die Ursprungssprache des Wortes und seine ursprüngliche Bedeutung." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Erklärung für Kinder",              body: "Eine klare, einfache Version, die ein Kind ohne Fachjargon lesen kann." },
      { id: "image",       icon: "image",       tier: "clear", title: "Das Wort als Bild",                 body: "Ein einzigartiges KI-Bild zum Wort, generiert aus Bedeutung und Kontext." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Persönliches Wörter-Notizbuch",     body: "Speichere Wörter, die du dir merken willst. Auch ohne Internet verfügbar." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Satz schreiben, Feedback erhalten", body: "Schreibe deinen eigenen Satz mit dem Wort und erhalte sofort Korrektur und Feedback." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalisierte Quizze",            body: "Ein tägliches Quiz zu den Wörtern, die du gelernt hast, damit sie bleiben." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Wortspiele",                        body: "Spiele, die deinen Wortschatz aufbauen: Zuordnen, Raten, Verbindungen knüpfen." },
    ],
  },
  cs: {
    heroEyebrow: "Funkce",
    heroTitle: "Co měl slovník dělat odjakživa.",
    heroSub: "Gadit rozumí slovu úplně. Ne jen jedna definice a hotovo. Každý význam, skutečné věty v kontextu, idiomy, původ a to, co běžný slovník nikdy neuměl ukázat.",
    ctaPrimary: "Začni zdarma",
    ctaSecondary: "Zobrazit ceník",
    signin: "Přihlásit se", pricing: "Ceník", search: "Hledat", features: "Funkce",
    sectionLabel: "Co získáš",
    finalCtaTitle: "Připraven to zkusit?",
    finalCtaSub: "Začni s Basicem úplně zdarma. Upgrade jediným ťuknutím, jakmile budeš chtít víc.",
    finalCtaBtn: "Začni teď",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Každá definice",                     body: "Všechny významy slova, i ty vzácné, seřazené podle frekvence použití." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Skutečné věty v kontextu",           body: "Tři skutečné věty pro každý význam, abys kontext pochopil hned." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Idiomy a slovní spojení",            body: "Každý výraz, v němž se slovo vyskytuje, i s plným významem celé fráze." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Odkud slovo pochází",                body: "Z jakého jazyka slovo přišlo a co původně znamenalo." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Vysvětlení pro děti",                body: "Jasná, jednoduchá verze, kterou dítě přečte bez složitých pojmů." },
      { id: "image",       icon: "image",       tier: "clear", title: "Slovo jako obrázek",                 body: "Jedinečný obrázek ke slovu, vytvořený podle jeho významu a kontextu." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Osobní sešit slov",                  body: "Ulož si slova, která si chceš zapamatovat. Dostupné i bez internetu." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Napiš větu, dostaň zpětnou vazbu",   body: "Sestav vlastní větu se slovem a okamžitě dostaň opravu a zpětnou vazbu." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalizované kvízy",              body: "Denní kvíz na slova, která ses naučil, aby ti zůstala nadlouho." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Slovní hry",                         body: "Hry, které rozšiřují slovní zásobu: přiřazování, hádání, propojování slov." },
    ],
  },
  sk: {
    heroEyebrow: "Funkcie",
    heroTitle: "Čo mal slovník robiť odjakživa.",
    heroSub: "Gadit rozumie slovu úplne. Nielen jedna definícia a hotovo. Každý význam, skutočné vety v kontexte, idiómy, pôvod a to, čo bežný slovník nikdy nevedel ukázať.",
    ctaPrimary: "Začni zadarmo",
    ctaSecondary: "Zobraziť cenník",
    signin: "Prihlásiť sa", pricing: "Cenník", search: "Hľadať", features: "Funkcie",
    sectionLabel: "Čo získaš",
    finalCtaTitle: "Pripravený to vyskúšať?",
    finalCtaSub: "Začni s Basicom úplne zadarmo. Upgrade jediným klikom, len čo budeš chcieť viac.",
    finalCtaBtn: "Začni teraz",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Každá definícia",                    body: "Všetky významy slova, aj tie vzácne, zoradené podľa frekvencie použitia." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Skutočné vety v kontexte",           body: "Tri skutočné vety pre každý význam, aby si kontext pochopil hneď." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Idiómy a slovné spojenia",           body: "Každý výraz, v ktorom sa slovo vyskytuje, aj s plným významom celej frázy." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Odkiaľ slovo pochádza",              body: "Z akého jazyka slovo prišlo a čo pôvodne znamenalo." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Vysvetlenie pre deti",               body: "Jasná, jednoduchá verzia, ktorú dieťa prečíta bez zložitých pojmov." },
      { id: "image",       icon: "image",       tier: "clear", title: "Slovo ako obrázok",                  body: "Jedinečný obrázok ku slovu, vytvorený podľa jeho významu a kontextu." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Osobný zošit slov",                  body: "Ulož si slová, ktoré si chceš zapamätať. Dostupné aj bez internetu." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Napíš vetu, dostaň spätnú väzbu",    body: "Zostav vlastnú vetu so slovom a okamžite dostaň opravu a spätnú väzbu." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalizované kvízy",              body: "Denný kvíz na slová, ktoré si sa naučil, aby ti zostali nadlho." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Slovné hry",                         body: "Hry, ktoré rozširujú slovnú zásobu: priraďovanie, hádanie, prepájanie slov." },
    ],
  },
  hi: {
    heroEyebrow: "सुविधाएँ",
    heroTitle: "एक शब्दकोश जो परिभाषा पर नहीं रुकता।",
    heroSub: "Gadit हर शब्द को पूरी तरह समझता है। हर अर्थ, संदर्भ में असली वाक्य, मुहावरे, उत्पत्ति और अभ्यास। जब तक शब्द सच में क्लिक न कर जाए। इसी को हम शब्द को GAD करना कहते हैं।",
    ctaPrimary: "मुफ्त शुरू करें",
    ctaSecondary: "क़ीमत देखें",
    signin: "साइन इन", pricing: "क़ीमत", search: "खोज", features: "सुविधाएँ",
    sectionLabel: "आपको क्या मिलता है",
    finalCtaTitle: "आज़माने को तैयार?",
    finalCtaSub: "Basic से बिल्कुल मुफ्त शुरू करें। एक टैप में अपग्रेड करें, सिर्फ़ तब जब और चाहिए।",
    finalCtaBtn: "अभी शुरू करें",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "हर परिभाषा",                       body: "शब्द के सभी अर्थ, यहाँ तक कि दुर्लभ भी, उपयोग की आवृत्ति के क्रम में।" },
      { id: "examples",    icon: "examples",    tier: "basic", title: "संदर्भ में असली वाक्य",              body: "हर अर्थ के लिए तीन असली वाक्य, ताकि संदर्भ तुरंत समझ आए।" },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "मुहावरे और अभिव्यक्तियाँ",          body: "हर अभिव्यक्ति जिसमें यह शब्द आता है, पूरे मुहावरे के अर्थ के साथ।" },
      { id: "origin",      icon: "origin",      tier: "basic", title: "शब्द कहाँ से आया",                  body: "जिस भाषा से शब्द शुरू हुआ, और मूल रूप से उसका अर्थ क्या था।" },
      { id: "kids",        icon: "kids",        tier: "clear", title: "बच्चों के लिए समझ",                 body: "एक साफ़, सरल संस्करण जिसे बच्चा बिना भारी शब्दों के पढ़ सके।" },
      { id: "image",       icon: "image",       tier: "clear", title: "शब्द एक तस्वीर में",                body: "हर शब्द के लिए एक अनोखी तस्वीर, उसी अर्थ से मेल खाती जो आप पढ़ रहे हैं।" },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "व्यक्तिगत शब्द-नोटबुक",             body: "वे शब्द सहेजें जो आप याद रखना चाहते हैं। बिना इंटरनेट भी उपलब्ध।" },
      { id: "compose",     icon: "compose",     tier: "clear", title: "वाक्य लिखें, फ़ीडबैक पाएँ",          body: "शब्द के साथ अपना वाक्य बनाएँ और तुरंत सुधार और फ़ीडबैक पाएँ।" },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "व्यक्तिगत क्विज़",                    body: "आपके सीखे हुए शब्दों पर रोज़ की क्विज़, ताकि वे आपके साथ लम्बे समय तक रहें।" },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "शब्द खेल",                          body: "ऐसे खेल जो आपकी शब्दावली बढ़ाते हैं: मिलान, अनुमान, शब्दों के बीच कनेक्शन बनाना।" },
    ],
  },
  am: {
    heroEyebrow: "ባህሪያት",
    heroTitle: "በትርጓሜ ላይ የማይቆም መዝገበ ቃላት።",
    heroSub: "Gadit እያንዳንዱን ቃል እስከ መጨረሻው ይረዳል። እያንዳንዱ ትርጉም፣ በአውድ ውስጥ እውነተኛ ዓረፍተ ነገሮች፣ ፈሊጦች፣ መነሻ እና ልምምድ። ቃሉ በእውነት ግልጽ እስኪሆን ድረስ። ይህን ቃልን GAD ማድረግ እንለዋለን።",
    ctaPrimary: "በነጻ ይጀምሩ",
    ctaSecondary: "ዋጋዎችን ይመልከቱ",
    signin: "ይግቡ", pricing: "ዋጋዎች", search: "ፍለጋ", features: "ባህሪያት",
    sectionLabel: "ምን ያገኛሉ",
    finalCtaTitle: "ለመሞከር ዝግጁ ነዎት?",
    finalCtaSub: "በ Basic ሙሉ በሙሉ በነጻ ይጀምሩ። ተጨማሪ ሲፈልጉ ብቻ በአንድ ንክኪ ያሻሽሉ።",
    finalCtaBtn: "አሁን ይጀምሩ",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "እያንዳንዱ ትርጓሜ",                    body: "የቃሉ ሁሉም ትርጉሞች፣ ብርቅዬዎቹም ጭምር፣ በአጠቃቀም ድግግሞሽ ቅደም ተከተል።" },
      { id: "examples",    icon: "examples",    tier: "basic", title: "በአውድ ውስጥ እውነተኛ ዓረፍተ ነገሮች",      body: "ለእያንዳንዱ ትርጉም ሦስት እውነተኛ ዓረፍተ ነገሮች፣ አውዱ ወዲያውኑ እንዲገባዎት።" },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "ፈሊጦች እና አገላለጾች",                  body: "ቃሉ የሚገኝበት እያንዳንዱ አገላለጽ፣ ከሙሉ የሐረጉ ትርጉም ጋር።" },
      { id: "origin",      icon: "origin",      tier: "basic", title: "ቃሉ ከየት መጣ",                       body: "ቃሉ የጀመረበት ቋንቋ፣ እና በመጀመሪያ ምን ማለት እንደነበር።" },
      { id: "kids",        icon: "kids",        tier: "clear", title: "ለልጆች ማብራሪያ",                     body: "ልጅ ያለ ከባድ ቃላት ሊያነበው የሚችል ግልጽ እና ቀላል ቅጂ።" },
      { id: "image",       icon: "image",       tier: "clear", title: "ቃሉ እንደ ምስል",                      body: "ለቃሉ ልዩ ምስል፣ እያነበቡት ካለው ትክክለኛ ትርጉም ጋር የተዛመደ።" },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "የግል የቃላት ማስታወሻ ደብተር",            body: "ማስታወስ የሚፈልጓቸውን ቃላት ያስቀምጡ። ያለ ኢንተርኔትም ይገኛሉ።" },
      { id: "compose",     icon: "compose",     tier: "clear", title: "ዓረፍተ ነገር ይጻፉ፣ ግብረ መልስ ያግኙ",       body: "በቃሉ የራስዎን ዓረፍተ ነገር ይጻፉ እና ወዲያውኑ እርማት እና ግብረ መልስ ያግኙ።" },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "የተበጁ ኩዊዞች",                       body: "በተማሯቸው ቃላት ላይ ዕለታዊ ኩዊዝ፣ ለረጅም ጊዜ ከእርስዎ ጋር እንዲቆዩ።" },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "የቃላት ጨዋታዎች",                     body: "የቃላት ክምችትዎን የሚያሳድጉ ጨዋታዎች፡ ማዛመድ፣ መገመት፣ በቃላት መካከል ትስስር መፍጠር።" },
    ],
  },
  ar: {
    heroEyebrow: "الميزات",
    heroTitle: "قاموس لا يتوقف عند التعريف.",
    heroSub: "Gadit يفهم الكلمة حتى النهاية. كل المعاني، جمل حقيقية في سياقها، التعابير، الأصل والتمرين. حتى تتضح الكلمة فعلاً. هذا ما نسميه أن تعمل GAD للكلمة.",
    ctaPrimary: "ابدأ مجاناً",
    ctaSecondary: "اطّلع على الأسعار",
    signin: "تسجيل الدخول", pricing: "الأسعار", search: "بحث", features: "الميزات",
    sectionLabel: "ماذا ستحصل عليه",
    finalCtaTitle: "جاهز للتجربة؟",
    finalCtaSub: "ابدأ مع Basic مجاناً بالكامل. ورقِّ اشتراكك بلمسة واحدة، فقط عندما تريد المزيد.",
    finalCtaBtn: "ابدأ الآن",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "كل التعريفات",                       body: "جميع معاني الكلمة، حتى النادرة منها، مرتّبة حسب شيوع الاستخدام." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "جمل حقيقية في سياقها",               body: "ثلاث جمل حقيقية لكل معنى، ليتضح السياق فوراً." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "التعابير والمصطلحات",                body: "كل تعبير تدخل فيه الكلمة، مع المعنى الكامل للعبارة." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "أصل الكلمة",                         body: "اللغة التي جاءت منها الكلمة، وما كانت تعنيه في الأصل." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "شرح للأطفال",                        body: "نسخة واضحة وبسيطة يقرأها الطفل من دون مصطلحات معقّدة." },
      { id: "image",       icon: "image",       tier: "clear", title: "الكلمة كصورة",                       body: "صورة فريدة للكلمة، مطابقة للمعنى الذي تقرأه بالضبط." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "دفتر كلمات شخصي",                    body: "احفظ الكلمات التي تريد تذكّرها. متاح حتى من دون إنترنت." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "اكتب جملة واحصل على ملاحظات",        body: "ألّف جملتك الخاصة بالكلمة واحصل فوراً على تصحيح وملاحظات." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "اختبارات مخصّصة",                    body: "اختبار يومي على الكلمات التي تعلّمتها، لتبقى معك لوقت طويل." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "ألعاب كلمات",                        body: "ألعاب تنمّي مفرداتك: مطابقة، تخمين، وبناء روابط بين الكلمات." },
    ],
  },
  ru: {
    heroEyebrow: "Возможности",
    heroTitle: "Словарь, который не останавливается на определении.",
    heroSub: "Gadit понимает слово до конца. Все значения, живые предложения в контексте, идиомы, происхождение и практика. Пока слово действительно не станет ясным. Мы называем это GAD-нуть слово.",
    ctaPrimary: "Начать бесплатно",
    ctaSecondary: "Посмотреть цены",
    signin: "Войти", pricing: "Цены", search: "Поиск", features: "Возможности",
    sectionLabel: "Что вы получаете",
    finalCtaTitle: "Готовы попробовать?",
    finalCtaSub: "Начните с Basic, совершенно бесплатно. Обновление в одно касание, только когда захотите большего.",
    finalCtaBtn: "Начать сейчас",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Все определения",                          body: "Все значения слова, даже редкие, в порядке частоты употребления." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Живые предложения в контексте",            body: "Три настоящих предложения на каждое значение, чтобы контекст был понятен сразу." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Идиомы и выражения",                       body: "Каждое выражение, в котором живёт слово, с полным значением всей фразы." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Происхождение слова",                      body: "Из какого языка пришло слово и что оно значило изначально." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Объяснение для детей",                     body: "Ясная и простая версия, которую ребёнок прочитает без сложных терминов." },
      { id: "image",       icon: "image",       tier: "clear", title: "Слово как картинка",                       body: "Уникальная картинка для слова, подобранная под то значение, которое вы читаете." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Личная тетрадь слов",                      body: "Сохраняйте слова, которые хотите запомнить. Доступны даже без интернета." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Напишите предложение, получите разбор",    body: "Составьте своё предложение со словом и мгновенно получите исправления и обратную связь." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Персональные викторины",                   body: "Ежедневная викторина по выученным словам, чтобы они остались с вами надолго." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Игры со словами",                          body: "Игры, которые расширяют словарный запас: сопоставление, угадывание, связи между словами." },
    ],
  },
  es: {
    heroEyebrow: "Funciones",
    heroTitle: "Un diccionario que no se detiene en la definición.",
    heroSub: "Gadit entiende cada palabra hasta el fondo. Todos los significados, oraciones reales en contexto, modismos, origen y práctica. Hasta que la palabra de verdad haga clic. A eso lo llamamos hacerle GAD a una palabra.",
    ctaPrimary: "Empieza gratis",
    ctaSecondary: "Ver precios",
    signin: "Iniciar sesión", pricing: "Precios", search: "Buscar", features: "Funciones",
    sectionLabel: "Lo que obtienes",
    finalCtaTitle: "¿Listo para probarlo?",
    finalCtaSub: "Empieza con Basic, totalmente gratis. Mejora tu plan con un toque, solo cuando quieras más.",
    finalCtaBtn: "Empieza ahora",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Todas las definiciones",                    body: "Todos los significados de la palabra, incluso los raros, ordenados según su frecuencia de uso." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Oraciones reales en contexto",              body: "Tres oraciones reales por significado, para que el contexto se entienda de inmediato." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Modismos y expresiones",                    body: "Cada expresión de la que forma parte la palabra, con el significado completo de la frase." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "El origen de la palabra",                   body: "El idioma donde nació la palabra y lo que significaba originalmente." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Explicación para niños",                    body: "Una versión clara y sencilla que un niño puede leer sin términos complicados." },
      { id: "image",       icon: "image",       tier: "clear", title: "La palabra como imagen",                    body: "Una imagen única para la palabra, ajustada al significado exacto que estás leyendo." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Cuaderno personal de palabras",             body: "Guarda las palabras que quieres recordar. Disponibles incluso sin internet." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Escribe una oración y recibe comentarios",  body: "Crea tu propia oración con la palabra y recibe corrección y comentarios al instante." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Cuestionarios personalizados",              body: "Un cuestionario diario sobre las palabras que aprendiste, para que se queden contigo a largo plazo." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Juegos de palabras",                        body: "Juegos que amplían tu vocabulario: emparejar, adivinar y crear conexiones entre palabras." },
    ],
  },
  pt: {
    heroEyebrow: "Recursos",
    heroTitle: "Um dicionário que não para na definição.",
    heroSub: "O Gadit entende a palavra até o fim. Todos os significados, frases reais em contexto, expressões idiomáticas, origem e prática. Até a palavra realmente fazer sentido. É o que chamamos de dar um GAD na palavra.",
    ctaPrimary: "Comece grátis",
    ctaSecondary: "Ver preços",
    signin: "Entrar", pricing: "Preços", search: "Buscar", features: "Recursos",
    sectionLabel: "O que você recebe",
    finalCtaTitle: "Pronto para experimentar?",
    finalCtaSub: "Comece com o Basic, totalmente grátis. Faça upgrade em um toque, só quando quiser mais.",
    finalCtaBtn: "Comece agora",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Todas as definições",                  body: "Todos os significados da palavra, até os raros, em ordem de frequência de uso." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Frases reais em contexto",             body: "Três frases reais para cada significado, para o contexto ficar claro na hora." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Expressões idiomáticas",               body: "Cada expressão da qual a palavra faz parte, com o significado completo da frase." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "De onde a palavra veio",               body: "A língua em que a palavra nasceu e o que ela significava originalmente." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Explicação para crianças",             body: "Uma versão clara e simples que uma criança lê sem termos complicados." },
      { id: "image",       icon: "image",       tier: "clear", title: "A palavra em imagem",                  body: "Uma imagem única para a palavra, alinhada ao significado exato que você está lendo." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Caderno pessoal de palavras",          body: "Salve as palavras que você quer lembrar. Disponíveis até sem internet." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Escreva uma frase e receba feedback",  body: "Monte sua própria frase com a palavra e receba correção e feedback na hora." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Quizzes personalizados",               body: "Um quiz diário com as palavras que você aprendeu, para que fiquem com você por muito tempo." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Jogos de palavras",                    body: "Jogos que expandem seu vocabulário: combinar, adivinhar e criar conexões entre palavras." },
    ],
  },
  fr: {
    heroEyebrow: "Fonctionnalités",
    heroTitle: "Un dictionnaire qui ne s'arrête pas à la définition.",
    heroSub: "Gadit comprend chaque mot jusqu'au bout. Tous les sens, de vraies phrases en contexte, les expressions, l'origine et la pratique. Jusqu'à ce que le mot devienne vraiment clair. C'est ce que nous appelons faire un GAD sur un mot.",
    ctaPrimary: "Commencez gratuitement",
    ctaSecondary: "Voir les tarifs",
    signin: "Se connecter", pricing: "Tarifs", search: "Recherche", features: "Fonctionnalités",
    sectionLabel: "Ce que vous obtenez",
    finalCtaTitle: "Prêt à essayer ?",
    finalCtaSub: "Commencez avec Basic, entièrement gratuit. Passez au niveau supérieur en un geste, seulement quand vous en voulez plus.",
    finalCtaBtn: "Commencez maintenant",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Toutes les définitions",                  body: "Tous les sens du mot, même les plus rares, classés par fréquence d'usage." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "De vraies phrases en contexte",           body: "Trois phrases réelles par sens, pour que le contexte soit clair immédiatement." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Expressions et locutions",                body: "Chaque expression dont le mot fait partie, avec le sens complet de la tournure." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "L'origine du mot",                        body: "La langue d'où vient le mot et ce qu'il signifiait à l'origine." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Explication pour les enfants",            body: "Une version claire et simple qu'un enfant peut lire sans jargon." },
      { id: "image",       icon: "image",       tier: "clear", title: "Le mot en image",                         body: "Une image unique pour le mot, adaptée au sens exact que vous lisez." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Carnet de mots personnel",                body: "Enregistrez les mots que vous voulez retenir. Disponibles même sans internet." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Écrivez une phrase, recevez un retour",   body: "Composez votre propre phrase avec le mot et recevez correction et retour immédiats." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Quiz personnalisés",                      body: "Un quiz quotidien sur les mots que vous avez appris, pour qu'ils restent durablement." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Jeux de mots",                            body: "Des jeux qui enrichissent votre vocabulaire : associer, deviner, relier les mots entre eux." },
    ],
  },
  it: {
    heroEyebrow: "Funzionalità",
    heroTitle: "Un dizionario che non si ferma alla definizione.",
    heroSub: "Gadit capisce una parola fino in fondo. Tutti i significati, frasi vere nel contesto, modi di dire, origine e pratica. Finché la parola non diventa davvero chiara. È quello che chiamiamo fare GAD a una parola.",
    ctaPrimary: "Inizia gratis",
    ctaSecondary: "Vedi i prezzi",
    signin: "Accedi", pricing: "Prezzi", search: "Cerca", features: "Funzionalità",
    sectionLabel: "Cosa ottieni",
    finalCtaTitle: "Pronto a provarlo?",
    finalCtaSub: "Inizia con Basic, completamente gratis. Passa al piano superiore con un tocco, solo quando vuoi di più.",
    finalCtaBtn: "Inizia ora",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Tutte le definizioni",                 body: "Tutti i significati della parola, anche quelli rari, ordinati per frequenza d'uso." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Frasi vere nel contesto",              body: "Tre frasi reali per ogni significato, così il contesto è chiaro subito." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Modi di dire ed espressioni",          body: "Ogni espressione di cui la parola fa parte, con il significato completo della frase." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "L'origine della parola",               body: "La lingua da cui la parola è arrivata e cosa significava in origine." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Spiegazione per bambini",              body: "Una versione chiara e semplice che un bambino può leggere senza termini difficili." },
      { id: "image",       icon: "image",       tier: "clear", title: "La parola come immagine",              body: "Un'immagine unica per la parola, in linea con il significato esatto che stai leggendo." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Quaderno personale delle parole",      body: "Salva le parole che vuoi ricordare. Disponibili anche senza internet." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Scrivi una frase, ricevi feedback",    body: "Componi la tua frase con la parola e ricevi subito correzione e feedback." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Quiz personalizzati",                  body: "Un quiz quotidiano sulle parole che hai imparato, perché restino con te a lungo." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Giochi di parole",                     body: "Giochi che ampliano il tuo vocabolario: abbinare, indovinare, creare collegamenti tra le parole." },
    ],
  },
  ja: {
    heroEyebrow: "機能",
    heroTitle: "定義だけで終わらない辞書。",
    heroSub: "Gaditは単語を最後まで理解します。すべての意味、文脈の中の実際の例文、慣用句、語源、そして練習まで。単語が本当に腑に落ちるまで。私たちはこれを、単語をGADすると呼んでいます。",
    ctaPrimary: "無料で始める",
    ctaSecondary: "料金を見る",
    signin: "ログイン", pricing: "料金", search: "検索", features: "機能",
    sectionLabel: "できること",
    finalCtaTitle: "試してみませんか？",
    finalCtaSub: "Basicなら完全無料で始められます。もっと知りたくなったら、ワンタップでアップグレードできます。",
    finalCtaBtn: "今すぐ始める",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "すべての定義",                     body: "珍しいものも含めて、単語のすべての意味を使用頻度順に表示します。" },
      { id: "examples",    icon: "examples",    tier: "basic", title: "文脈の中の実際の例文",             body: "意味ごとに3つの実際の例文を用意。文脈がすぐに伝わります。" },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "慣用句と言い回し",                 body: "その単語が使われるすべての表現を、フレーズ全体の意味とあわせて紹介します。" },
      { id: "origin",      icon: "origin",      tier: "basic", title: "単語の由来",                       body: "その単語がどの言語から生まれ、もともと何を意味していたかがわかります。" },
      { id: "kids",        icon: "kids",        tier: "clear", title: "子ども向けの説明",                 body: "難しい用語を使わない、子どもでも読めるわかりやすい説明です。" },
      { id: "image",       icon: "image",       tier: "clear", title: "単語をイメージで",                 body: "読んでいる意味にぴったり合わせた、単語ごとの特別な画像です。" },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "自分だけの単語ノート",             body: "覚えたい単語を保存できます。インターネットがなくても使えます。" },
      { id: "compose",     icon: "compose",     tier: "clear", title: "文を書いてフィードバック",         body: "その単語を使って自分の文を作ると、すぐに添削とフィードバックが届きます。" },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "パーソナライズされたクイズ",       body: "学んだ単語の毎日のクイズで、長く記憶に残ります。" },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "単語ゲーム",                       body: "語彙を育てるゲーム。マッチング、推測、単語同士のつながりづくりで力がつきます。" },
    ],
  },
};

function FeatureIcon({ name, color }: { name: Feature["icon"]; color: string }) {
  // Crisper, more geometric icon set (lucide-inspired). 1.75 stroke
  // keeps the lines clearly visible at 38-48px without looking heavy,
  // square caps + miter joins replace the previous rounded "sketchy"
  // feel with something more precise + modern.
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "definitions": return <svg {...common}><path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z" /><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" /></svg>;
    case "examples":    return <svg {...common}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /><circle cx="3" cy="6" r="0.6" fill={color} stroke="none" /><circle cx="3" cy="12" r="0.6" fill={color} stroke="none" /><circle cx="3" cy="18" r="0.6" fill={color} stroke="none" /></svg>;
    case "idioms":      return <svg {...common}><path d="M21 12a8 8 0 1 1-2.5-5.8L21 5v4h-4" /><path d="M9 13h.01M12 13h.01M15 13h.01" /></svg>;
    case "origin":      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9z" /></svg>;
    case "notebook":    return <svg {...common}><path d="M6 4h12a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M9 4v17" /><path d="M12 9h4M12 13h4" /></svg>;
    case "image":       return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 16-4-4-8 8" /></svg>;
    case "kids":        return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" /></svg>;
    case "compose":     return <svg {...common}><path d="M14 4l6 6L8 22H2v-6z" /><path d="M13 5l6 6" /></svg>;
    case "quiz":        return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1.5 1-1.5 2.2" /><circle cx="12" cy="17" r="0.7" fill={color} stroke="none" /></svg>;
    case "compare":     return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></svg>;
    case "profile":     return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "qr":          return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M14 21h3M21 14v7M17 17h4" /></svg>;
    case "dashboard":   return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>;
    case "people":      return <svg {...common}><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M14 20a5 5 0 0 1 7-4" /></svg>;
  }
}

const TIER_COLOR: Record<Tier, { fg: string; bg: string }> = {
  basic:  { fg: "var(--basic-fg)",  bg: "var(--basic-bg)" },
  clear:  { fg: "var(--teal-edge)", bg: "var(--teal-soft)" },
  deep:   { fg: "var(--deep-fg)",   bg: "var(--deep-bg)" },
  family: { fg: "#1E40AF",          bg: "#DBEAFE" },
};

export function FeaturesPage() {
  const { lang, dir, setLang } = useLang();
  const { user, promptLogin } = useAuth();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;
  const gc = pickGroupCopy(lang);

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <WbShellNav active="features" />
        <div className="wb-shell-actions">
          {user && (
            <ShareButton
              url="https://www.gadit.app/" currentPage
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
              <button type="button" className="wb-shell-link" onClick={() => promptLogin({ mode: "signin" })}>
                {c.signin}
              </button>
            </>
          )}
        </div>
        <div className="wb-shell-mobile-cta">
          <StartFreeCTA />
        </div>
        {/* Mobile identity cluster — 2026-06-19 redesign. */}
        {user && (
          <div className="wb-shell-mobile-identity">
            <ShareButton
              url="https://www.gadit.app/" currentPage
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
        <WbShellBurger active="features" />
        </div>
      </header>

      <main className="wb-feat-main">
        {/* Hero, same eyebrow / italic display / two-CTA shape as
            before. The "it" character only appears at the very end now;
            anchoring it here floated awkwardly between the topbar and
            the title and didn't pay off the metaphor. */}
        <section className="wb-feat-hero">
          <div className="wb-feat-eyebrow">{c.heroEyebrow}</div>
          <h1 className="wb-feat-display">{c.heroTitle}</h1>
          <p className="wb-feat-lede">{c.heroSub}</p>
          <div className="wb-feat-cta-row">
            <Link href={href("/")} className="wb-feat-cta-primary">{c.ctaPrimary}</Link>
            <Link href={href("/pricing")} className="wb-feat-cta-ghost">{c.ctaSecondary}</Link>
          </div>
        </section>

        {/* Auto-cycling demo tour, walks the visitor through what each
            tier unlocks plus the partner program. See
            GaditDemoAnimation.tsx for the scene state machine. */}
        <GaditDemoAnimation />

        {/* Three feature groups, Understand -> Learn -> Master.
            Each group is one Basic / Clear / Deep tier respectively,
            so the visual journey IS the pricing ladder. Within each
            group the cards keep the original visual treatment from
            the bento grid, just smaller (always equal weight inside
            the group). */}
        <section className="wb-feat-groups">
          {(Object.keys(FEATURE_GROUPS) as GroupKey[]).map((groupKey) => {
            const ids = FEATURE_GROUPS[groupKey];
            const groupFeatures = c.list.filter((f) => ids.includes(f.id));
            if (groupFeatures.length === 0) return null;
            const groupTier: Tier =
              groupKey === "understand" ? "basic" : groupKey === "learn" ? "clear" : "deep";
            return (
              <div key={groupKey} className={`wb-feat-group wb-feat-group-${groupTier}`}>
                <div className="wb-feat-group-head">
                  <span className={`wb-feat-tier-chip wb-feat-tier-chip-${groupTier}`}>
                    {c.tierLabel[groupTier]}
                  </span>
                  <h2 className="wb-feat-group-title">{gc.groupTitles[groupKey]}</h2>
                  <p className="wb-feat-group-sub">{gc.groupSubs[groupKey]}</p>
                </div>
                <div className="wb-feat-group-cards">
                  {groupFeatures.map((f) => {
                    const t = TIER_COLOR[f.tier];
                    return (
                      <article key={f.id} className="wb-feat-card">
                        <div className="wb-feat-card-head">
                          <div className="wb-feat-card-icon" style={{ background: t.bg, color: t.fg }}>
                            <FeatureIcon name={f.icon} color={t.fg} />
                          </div>
                        </div>
                        <h3 className="wb-feat-card-title">{f.title}</h3>
                        {f.body && <p className="wb-feat-card-body">{f.body}</p>}
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* Family, rendered as a 4th group with the same card-grid
            chrome as Basic / Clear / Deep above so the visual rhythm
            stays consistent. Royal-blue accent (matches /pricing). */}
        <section className="wb-feat-groups wb-feat-groups-family">
          <div className="wb-feat-group wb-feat-group-family">
            <div className="wb-feat-group-head">
              <span className="wb-feat-tier-chip wb-feat-tier-chip-family">
                Family
              </span>
              <h2 className="wb-feat-group-title">{gc.family.title}</h2>
              <p className="wb-feat-group-sub">{gc.family.sub}</p>
            </div>
            <div className="wb-feat-group-cards">
              {gc.family.features.map((f) => {
                const t = TIER_COLOR.family;
                return (
                  <article key={f.id} className="wb-feat-card">
                    <div className="wb-feat-card-head">
                      <div className="wb-feat-card-icon" style={{ background: t.bg, color: t.fg }}>
                        <FeatureIcon name={f.icon} color={t.fg} />
                      </div>
                    </div>
                    <h3 className="wb-feat-card-title">{f.title}</h3>
                    {f.body && <p className="wb-feat-card-body">{f.body}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA, character + speech bubble + one big button.
            The bubble carries the brand verb ("Now I gad it!") so the
            page closes on the same metaphor it opened with. */}
        <section className="wb-feat-final">
          <div className="wb-feat-final-character">
            <div className="wb-feat-final-bubble">{gc.bubble}</div>
            <img
              src="/gad-it-character.png"
              alt=""
              aria-hidden="true"
              width={180}
              height={180}
              loading="lazy"
              decoding="async"
            />
          </div>
          <h2 className="wb-feat-final-title">{c.finalCtaTitle}</h2>
          <p className="wb-feat-final-sub">{c.finalCtaSub}</p>
          <Link href={href("/")} className="wb-feat-final-btn">{c.finalCtaBtn}</Link>
        </section>
      </main>

      <GadVerbStamp />

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/")}>{lang === "he" ? "בית" : "Home"}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>{v2(lang, "footerPrivacy")}</Link>
        <span>·</span>
        <Link href={href("/terms")}>{v2(lang, "footerTerms")}</Link>
      </footer>
    </div>
  );
}
