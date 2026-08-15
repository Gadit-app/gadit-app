"use client";

/**
 * PricingPageRoute — CrispTech pricing screen for the launch.
 *
 * 3 tier cards, each painted in its tier colour:
 *   Basic  = neutral gray   (free)
 *   Clear  = teal #0EA5A5   (mid)
 *   Deep   = purple #7C3AED (premium)
 *
 * Shares the wordbook palette + masthead with / and /word so the
 * whole product reads as one design system.
 *
 * Checkout flow: anonymous → promptLogin (signup); signed-in →
 * /checkout (in-app Payment Element page, user's own language).
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
import { SCHOOLS_TIERS, SCHOOLS_TIER_LIST, studentsUpTo, type SchoolsTierKey } from "@/lib/schools-prices";

type Billing = "monthly" | "yearly";

const PRICE_CLEAR_MONTHLY  = process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY  ?? "";
const PRICE_CLEAR_YEARLY   = process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_YEARLY   ?? "";
const PRICE_DEEP_MONTHLY   = process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY   ?? "";
const PRICE_DEEP_YEARLY    = process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_YEARLY    ?? "";
const PRICE_FAMILY_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY ?? "";
const PRICE_FAMILY_YEARLY  = process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY  ?? "";
// Schools prices are the 3-tier ladder in @/lib/schools-prices (hardcoded
// public IDs) so /pricing, /checkout and the webhook share one source.

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

/** Bold + tier-coloured highlight for the new "layer" word in a
 *  tier tagline (e.g. 'see' in Clear, 'remember forever' in Deep).
 *  The actual colour is inherited from the parent tier card via
 *  .wb-tier-clear / .wb-tier-deep selectors in globals.css. */
function Hl({ children }: { children: React.ReactNode }) {
  return <span className="wb-tier-tagline-hl">{children}</span>;
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface TierCardProps {
  id: "basic" | "clear" | "deep";
  name: string;
  price: string;
  period: string;
  subPrice?: string;
  tagline: React.ReactNode;
  features: string[];
  cta: string;
  ctaSub?: string;
  badge?: string;
  onCta: () => void;
}

function TierCard({ id, name, price, period, subPrice, tagline, features, cta, ctaSub, badge, onCta }: TierCardProps) {
  return (
    <div className={`wb-tier-card wb-tier-${id}`}>
      {badge && <div className="wb-tier-badge">{badge}</div>}
      <div className="wb-tier-name">{name}</div>
      <div className="wb-tier-tagline">{tagline}</div>
      <div className="wb-tier-price-row">
        <span className="wb-tier-price">{price}</span>
        {period && <span className="wb-tier-period">{period}</span>}
      </div>
      <div className="wb-tier-subprice">{subPrice ?? " "}</div>
      <button type="button" className="wb-tier-cta" onClick={onCta}>
        {cta}
      </button>
      {ctaSub && <div className="wb-tier-cta-sub">{ctaSub}</div>}
      <div className="wb-tier-sep" />
      <ul className="wb-tier-features">
        {features.map((f, i) => (
          <li key={i}>
            <span className="wb-tier-check"><CheckIcon /></span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Family and Schools copy fields are optional on the type so we only
// need to keep HE + EN proper. The JSX falls back to EN for any lang
// that doesn't supply its own strings. Add per-language ones over time.
interface FamilyCopy {
  name: string;
  eyebrow: string;
  tagline: React.ReactNode;
  cta: string;
  features: string[];
}
interface SchoolCopy {
  name: string;
  eyebrow: string;
  tagline: React.ReactNode;
  cta: string;
  features: string[];
}

const COPY: Record<string, {
  heroTitle: string;
  heroSub: string;
  monthly: string;
  yearly: string;
  save: string;
  signin: string;
  pricing: string;
  search: string;
  features: string;
  tierBasic: { name: string; tagline: React.ReactNode; cta: string; features: string[] };
  tierClear: { name: string; tagline: React.ReactNode; cta: string; badge: string; features: string[] };
  tierDeep:  { name: string; tagline: React.ReactNode; cta: string; features: string[] };
  family?: FamilyCopy;
  school?: SchoolCopy;
  mo: string; yr: string;
  freeForever: string;
  saveTrustBasic?: string;
  trustClear?: string;
}> = {
  uk: {
    heroTitle: "Почни безкоштовно.",
    heroSub: "Переходь на вищий рівень лише тоді, коли хочеш глибини.",
    monthly: "Щомісяця", yearly: "Щороку",
    save: "Заощаджуй 17%",
    signin: "Увійти",
    pricing: "Ціни",
    search: "Пошук",
    features: "Можливості",
    mo: "/міс", yr: "/рік",
    freeForever: "Безкоштовно назавжди",
    tierBasic: {
      name: "Basic",
      tagline: "Зрозумій слово",
      cta: "Почати зараз",
      features: [
        "20 пошуків слів на день",
        "Кожне значення слова",
        "Приклади речень за контекстом",
        "Ідіоми та вирази",
        "Походження слова",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Зрозумій і <Hl>побач</Hl> слово</>,
      cta: "Спробуй 14 днів безкоштовно",
      badge: "Найпопулярніший",
      features: [
        "Усе, що в Basic",
        "Необмежені пошуки",
        "Пояснення для дітей",
        "Слово у вигляді зображення",
        "Особистий зошит слів",
        "Склади речення й отримай відгук",
        "Повна історія пошуку",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Зрозумій, побач і <Hl>запамʼятай слово назавжди</Hl></>,
      cta: "Спробуй 14 днів безкоштовно",
      features: [
        "Усе, що в Clear",
        "Персональні тести",
        "Ігри зі словами",
        "Довготривала практика й запамʼятовування",
        "Експорт вмісту",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "План для шкіл",
      tagline: <>Кожен клас, кожен учитель, кожна дитина, <Hl>без обмежень</Hl></>,
      cta: "Спробуй 14 днів безкоштовно",
      features: [
        "Необмежена кількість класів, учителів та учнів",
        "Простий код класу з 6 символів, діти відкривають посилання на комп'ютері в класі без імені користувача чи пароля",
        "Кожна дитина отримує всі розширені можливості: пояснення для дітей, зображення до слова, ідіоми, етимологію",
        "Учитель бачить кожне слово, яке її клас шукав сьогодні",
        "Логотип вашої школи на дитячому екрані, відчувається як частина вашої школи",
        "Рахунок, який можна передати шкільній адміністрації",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "Сімейний план",
      tagline: <>Уся родина на одній підписці, <Hl>до 5 дітей</Hl></>,
      cta: "Спробуй 14 днів безкоштовно",
      features: [
        "Кожна дитина отримує власний профіль з особистим зошитом слів, історією та серією навчання",
        "Кожна дитина отримує всі розширені можливості: тести, ігри зі словами, дитячий режим та зображення до слова",
        "Панель для батьків, бачте кожне слово, яке шукала кожна дитина, і коли",
        "До 5 дітей на одній сімейній підписці",
        "Підключіть телефон дитини за секунди скануванням QR, звʼязок лишається назавжди",
      ],
    },
  },
  tr: {
    heroTitle: "Ücretsiz başla.",
    heroSub: "Yalnızca derinlik istediğinde yükselt.",
    monthly: "Aylık", yearly: "Yıllık",
    save: "%17 tasarruf",
    signin: "Giriş yap",
    pricing: "Fiyatlar",
    search: "Ara",
    features: "Özellikler",
    mo: "/ay", yr: "/yıl",
    freeForever: "Sonsuza kadar ücretsiz",
    tierBasic: {
      name: "Basic",
      tagline: "Kelimeyi anla",
      cta: "Hemen başla",
      features: [
        "Günde 20 kelime araması",
        "Kelimenin her anlamı",
        "Bağlama göre cümle örnekleri",
        "Deyimler ve kalıplar",
        "Kelimenin kökeni",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Kelimeyi anla ve <Hl>gör</Hl></>,
      cta: "14 gün ücretsiz dene",
      badge: "En popüler",
      features: [
        "Basic'teki her şey",
        "Sınırsız arama",
        "Çocuklara uygun açıklama",
        "Kelime bir görselle canlanır",
        "Kişisel kelime defteri",
        "Bir cümle kur ve geri bildirim al",
        "Tüm arama geçmişi",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Kelimeyi anla, gör ve <Hl>sonsuza kadar hatırla</Hl></>,
      cta: "14 gün ücretsiz dene",
      features: [
        "Clear'daki her şey",
        "Kişiselleştirilmiş testler",
        "Kelime oyunları",
        "Uzun vadeli alıştırma ve kalıcılık",
        "İçeriği dışa aktar",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "Okullar planı",
      tagline: <>Her sınıf, her öğretmen, her çocuk, <Hl>sınırsız</Hl></>,
      cta: "14 gün ücretsiz dene",
      features: [
        "Sınırsız sınıf, öğretmen ve öğrenci",
        "Basit 6 karakterli sınıf kodu, çocuklar sınıf bilgisayarında bağlantıyı açar, kullanıcı adı veya şifre gerekmez",
        "Her çocuk tüm gelişmiş özellikleri alır: çocuklara uygun açıklama, kelime başına görsel, deyimler, köken bilgisi",
        "Öğretmen, sınıfının bugün aradığı her kelimeyi görür",
        "Çocuk ekranında okulunuzun logosu, okulunuzun bir parçası gibi hissettirir",
        "Okul yönetimine verebileceğiniz fatura",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "Aile planı",
      tagline: <>Tüm aile tek bir abonelikte, <Hl>5 çocuğa kadar</Hl></>,
      cta: "14 gün ücretsiz dene",
      features: [
        "Her çocuk, kişisel kelime defteri, geçmiş ve öğrenme serisiyle kendi profilini alır",
        "Her çocuk tüm gelişmiş özellikleri alır: testler, kelime oyunları, çocuk modu ve kelime başına görsel",
        "Ebeveyn paneli, her çocuğun hangi kelimeye ne zaman baktığını görün",
        "Aynı aile aboneliği altında 5 çocuğa kadar",
        "Çocuğunuzun telefonunu bir QR taramasıyla saniyeler içinde eşleyin, sonsuza kadar bağlı kalır",
      ],
    },
  },
  pl: {
    heroTitle: "Zacznij za darmo.",
    heroSub: "Przejdź na wyższy plan, gdy zechcesz głębi.",
    monthly: "Miesięcznie", yearly: "Rocznie",
    save: "Oszczędź 17%",
    signin: "Zaloguj się",
    pricing: "Cennik",
    search: "Szukaj",
    features: "Funkcje",
    mo: "/mies.", yr: "/rok",
    freeForever: "Darmowy na zawsze",
    tierBasic: {
      name: "Basic",
      tagline: "Zrozum słowo",
      cta: "Zacznij teraz",
      features: [
        "20 wyszukiwań słów dziennie",
        "Każde znaczenie słowa",
        "Przykładowe zdania w kontekście",
        "Idiomy i wyrażenia",
        "Pochodzenie słowa",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Zrozum i <Hl>zobacz</Hl> słowo</>,
      cta: "Wypróbuj 14 dni za darmo",
      badge: "Najpopularniejszy",
      features: [
        "Wszystko z planu Basic",
        "Nieograniczone wyszukiwania",
        "Wyjaśnienie dla dzieci",
        "Słowo zilustrowane obrazem",
        "Osobisty zeszyt słów",
        "Ułóż zdanie i otrzymaj informację zwrotną",
        "Pełna historia wyszukiwań",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Zrozum, zobacz i <Hl>zapamiętaj słowo na zawsze</Hl></>,
      cta: "Wypróbuj 14 dni za darmo",
      features: [
        "Wszystko z planu Clear",
        "Spersonalizowane quizy",
        "Gry słowne",
        "Długoterminowa praktyka i utrwalanie",
        "Eksport treści",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "Plan dla szkół",
      tagline: <>Każda klasa, każdy nauczyciel, każde dziecko, <Hl>bez ograniczeń</Hl></>,
      cta: "Wypróbuj 14 dni za darmo",
      features: [
        "Nieograniczona liczba klas, nauczycieli i uczniów",
        "Prosty 6-znakowy kod klasy, dzieci otwierają link na komputerze w klasie bez nazwy użytkownika i hasła",
        "Każde dziecko otrzymuje wszystkie zaawansowane funkcje: wyjaśnienie dla dzieci, obraz do każdego słowa, idiomy, etymologię",
        "Nauczyciel widzi każde słowo, które jego klasa wyszukała dzisiaj",
        "Logo Twojej szkoły na ekranie dziecka, sprawia wrażenie części Twojej szkoły",
        "Faktura, którą możesz przekazać administracji szkoły",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "Plan rodzinny",
      tagline: <>Cała rodzina w jednej subskrypcji, <Hl>do 5 dzieci</Hl></>,
      cta: "Wypróbuj 14 dni za darmo",
      features: [
        "Każde dziecko otrzymuje własny profil z osobistym zeszytem słów, historią i serią nauki",
        "Każde dziecko otrzymuje wszystkie zaawansowane funkcje: quizy, gry słowne, tryb dla dzieci i obraz do każdego słowa",
        "Panel rodzica, zobacz każde słowo, które sprawdziło każde dziecko i kiedy",
        "Do 5 dzieci w ramach jednej subskrypcji rodzinnej",
        "Sparuj telefon dziecka w kilka sekund, skanując kod QR, pozostaje połączony na zawsze",
      ],
    },
  },
  fa: {
    heroTitle: "رایگان شروع کن.",
    heroSub: "فقط وقتی عمق بیشتری خواستی ارتقا بده.",
    monthly: "ماهانه", yearly: "سالانه",
    save: "۱۷٪ صرفه‌جویی",
    signin: "ورود",
    pricing: "قیمت‌ها",
    search: "جستجو",
    features: "امکانات",
    mo: "/mo", yr: "/yr",
    freeForever: "برای همیشه رایگان",
    tierBasic: {
      name: "Basic",
      tagline: "کلمه را بفهم",
      cta: "همین حالا شروع کن",
      features: [
        "۲۰ جستجوی کلمه در روز",
        "هر تعریف کلمه",
        "مثال‌های جمله بر اساس بافت",
        "اصطلاحات و عبارات",
        "ریشه کلمه",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>کلمه را بفهم و <Hl>ببین</Hl></>,
      cta: "۱۴ روز رایگان امتحان کن",
      badge: "محبوب‌ترین",
      features: [
        "همه چیز در Basic",
        "جستجوی نامحدود",
        "توضیح برای کودکان",
        "کلمه به شکل تصویر",
        "دفترچه کلمات شخصی",
        "یک جمله بساز و بازخورد بگیر",
        "تاریخچه کامل جستجو",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>کلمه را بفهم، ببین، و <Hl>برای همیشه به خاطر بسپار</Hl></>,
      cta: "۱۴ روز رایگان امتحان کن",
      features: [
        "همه چیز در Clear",
        "آزمون‌های شخصی‌سازی‌شده",
        "بازی‌های کلمه‌ای",
        "تمرین و ماندگاری بلندمدت",
        "خروجی گرفتن از محتوا",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "طرح مدارس",
      tagline: <>هر کلاس، هر معلم، هر کودک، <Hl>نامحدود</Hl></>,
      cta: "۱۴ روز رایگان امتحان کن",
      features: [
        "کلاس‌ها، معلم‌ها و دانش‌آموزان نامحدود",
        "کد کلاس ساده ۶ حرفی، کودکان لینک را روی کامپیوتر کلاس باز می‌کنند بدون نام کاربری یا رمز عبور",
        "هر کودک همه امکانات پیشرفته را می‌گیرد: توضیح برای کودکان، تصویر برای هر کلمه، اصطلاحات، ریشه‌شناسی",
        "معلم هر کلمه‌ای که کلاسش امروز جستجو کرده را می‌بیند",
        "لوگوی مدرسه شما روی صفحه کودک، انگار بخشی از مدرسه شماست",
        "فاکتوری که می‌توانی به مدیریت مدرسه تحویل دهی",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "طرح خانواده",
      tagline: <>کل خانواده با یک اشتراک، <Hl>تا ۵ کودک</Hl></>,
      cta: "۱۴ روز رایگان امتحان کن",
      features: [
        "هر کودک پروفایل خودش را دارد با دفترچه کلمات شخصی، تاریخچه، و زنجیره یادگیری",
        "هر کودک همه امکانات پیشرفته را می‌گیرد: آزمون‌ها، بازی‌های کلمه‌ای، حالت کودکان، و تصویر برای هر کلمه",
        "داشبورد والدین، هر کلمه‌ای که هر کودک جستجو کرده و چه زمانی را ببین",
        "تا ۵ کودک زیر یک اشتراک خانوادگی",
        "تلفن کودکت را در چند ثانیه با اسکن QR جفت کن، برای همیشه متصل می‌ماند",
      ],
    },
  },
  id: {
    heroTitle: "Mulai gratis.",
    heroSub: "Tingkatkan hanya saat kamu ingin lebih mendalam.",
    monthly: "Bulanan", yearly: "Tahunan",
    save: "Hemat 17%",
    signin: "Masuk",
    pricing: "Harga",
    search: "Cari",
    features: "Fitur",
    mo: "/bln", yr: "/thn",
    freeForever: "Gratis selamanya",
    tierBasic: {
      name: "Basic",
      tagline: "Pahami kata",
      cta: "Mulai sekarang",
      features: [
        "20 pencarian kata per hari",
        "Setiap definisi kata",
        "Contoh kalimat sesuai konteks",
        "Idiom & ungkapan",
        "Asal usul kata",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Pahami dan <Hl>lihat</Hl> kata</>,
      cta: "Coba gratis 14 hari",
      badge: "Paling populer",
      features: [
        "Semua yang ada di Basic",
        "Pencarian tanpa batas",
        "Penjelasan untuk anak",
        "Kata digambarkan sebagai gambar",
        "Buku catatan kata pribadi",
        "Susun kalimat dan dapatkan masukan",
        "Riwayat pencarian lengkap",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Pahami, lihat, dan <Hl>ingat kata selamanya</Hl></>,
      cta: "Coba gratis 14 hari",
      features: [
        "Semua yang ada di Clear",
        "Kuis yang dipersonalisasi",
        "Permainan kata",
        "Latihan & retensi jangka panjang",
        "Ekspor konten",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "Paket Sekolah",
      tagline: <>Setiap kelas, setiap guru, setiap anak, <Hl>tanpa batas</Hl></>,
      cta: "Coba gratis 14 hari",
      features: [
        "Kelas, guru, dan siswa tanpa batas",
        "Kode kelas sederhana 6 karakter, anak membuka tautan di komputer kelas tanpa nama pengguna atau kata sandi",
        "Setiap anak mendapatkan semua fitur canggih: penjelasan untuk anak, gambar per kata, idiom, etimologi",
        "Guru melihat setiap kata yang dicari kelasnya hari ini",
        "Logo sekolahmu di layar anak, terasa seperti bagian dari sekolahmu",
        "Faktur yang bisa kamu serahkan ke administrasi sekolah",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "Paket Keluarga",
      tagline: <>Seluruh keluarga dalam satu langganan, <Hl>hingga 5 anak</Hl></>,
      cta: "Coba gratis 14 hari",
      features: [
        "Setiap anak mendapatkan profilnya sendiri dengan buku catatan kata pribadi, riwayat, dan rangkaian belajar",
        "Setiap anak mendapatkan semua fitur canggih: kuis, permainan kata, mode anak, dan gambar per kata",
        "Dasbor orang tua, lihat setiap kata yang dicari tiap anak dan kapan",
        "Hingga 5 anak dalam satu langganan keluarga",
        "Sambungkan ponsel anakmu dalam hitungan detik dengan pindai QR, tetap terhubung selamanya",
      ],
    },
  },
  nl: {
    heroTitle: "Begin gratis.",
    heroSub: "Upgrade alleen wanneer je diepgang wilt.",
    monthly: "Maandelijks", yearly: "Jaarlijks",
    save: "Bespaar 17%",
    signin: "Inloggen",
    pricing: "Prijzen",
    search: "Zoeken",
    features: "Functies",
    mo: "/mnd", yr: "/jr",
    freeForever: "Voor altijd gratis",
    tierBasic: {
      name: "Basic",
      tagline: "Begrijp het woord",
      cta: "Begin nu",
      features: [
        "20 woordzoekopdrachten per dag",
        "Elke definitie van het woord",
        "Voorbeeldzinnen op basis van context",
        "Uitdrukkingen en gezegden",
        "Herkomst van het woord",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Begrijp en <Hl>zie</Hl> het woord</>,
      cta: "Probeer 14 dagen gratis",
      badge: "Meest gekozen",
      features: [
        "Alles uit Basic",
        "Onbeperkt zoeken",
        "Uitleg voor kinderen",
        "Woord verbeeld als afbeelding",
        "Persoonlijk woordenschrift",
        "Stel een zin op en krijg feedback",
        "Volledige zoekgeschiedenis",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Begrijp, zie en <Hl>onthoud het woord voor altijd</Hl></>,
      cta: "Probeer 14 dagen gratis",
      features: [
        "Alles uit Clear",
        "Gepersonaliseerde quizzen",
        "Woordspellen",
        "Oefenen en onthouden op de lange termijn",
        "Inhoud exporteren",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "Schoolabonnement",
      tagline: <>Elke klas, elke leraar, elk kind, <Hl>onbeperkt</Hl></>,
      cta: "Probeer 14 dagen gratis",
      features: [
        "Onbeperkt aantal klassen, leraren en leerlingen",
        "Eenvoudige klascode van 6 tekens, kinderen openen de link op de klascomputer zonder gebruikersnaam of wachtwoord",
        "Elk kind krijgt alle geavanceerde functies: uitleg voor kinderen, afbeelding per woord, uitdrukkingen, etymologie",
        "De leraar ziet elk woord dat de klas vandaag heeft gezocht",
        "Het logo van je school op het kinderscherm, voelt als een deel van je school",
        "Factuur die je aan de schoolleiding kunt geven",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "Gezinsabonnement",
      tagline: <>Het hele gezin op een abonnement, <Hl>tot 5 kinderen</Hl></>,
      cta: "Probeer 14 dagen gratis",
      features: [
        "Elk kind krijgt een eigen profiel met persoonlijk woordenschrift, geschiedenis en leerreeks",
        "Elk kind krijgt alle geavanceerde functies: quizzen, woordspellen, kindermodus en afbeelding per woord",
        "Ouderdashboard, zie elk woord dat elk kind heeft opgezocht en wanneer",
        "Tot 5 kinderen onder hetzelfde gezinsabonnement",
        "Koppel de telefoon van je kind in enkele seconden met een QR-scan, blijft voor altijd verbonden",
      ],
    },
  },
  he: {
    heroTitle: "התחילו חינם",
    heroSub: "שדרגו כשתרצו להעמיק.",
    monthly: "חודשי", yearly: "שנתי",
    save: "חיסכון 17%",
    signin: "התחברות",
    pricing: "תמחור",
    search: "חיפוש",
    features: "פיצ'רים",
    mo: "/חודש", yr: "/שנה",
    freeForever: "חינם לתמיד",
    tierBasic: {
      name: "Basic",
      tagline: "להבין את המילה",
      cta: "התחילו חינם",
      features: [
        "20 חיפושי מילים ליום",
        "מילה בכל שפה, מוסברת בשפה שלך",
        "כל ההגדרות למילה",
        "דוגמאות של משפטים לפי הקשר",
        "ניבים וצירופי מילים",
        "מקור המילה",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>להבין <Hl>ולראות</Hl> את המילה</>,
      cta: "נסו 14 יום חינם",
      badge: "הכי פופולרי",
      features: [
        "כל מה שיש ב-Basic",
        "חיפושים ללא הגבלה",
        "הסבר לילדים",
        "המחשת המילה בתמונה",
        "מחברת מילים אישית",
        "חיבור משפט עם המילה וקבלת משוב",
        "היסטוריית חיפוש מלאה",
        "שמירה וגישה אופליין",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>להבין, לראות <Hl>ולזכור את המילה לתמיד</Hl></>,
      cta: "נסו 14 יום חינם",
      features: [
        "כל מה שיש ב-Clear",
        "חידונים מותאמים אישית",
        "משחקי מילים",
        "תרגול ולמידה לטווח ארוך",
        "ייצוא תוכן",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "מנוי משפחתי",
      tagline: <>כל בני המשפחה תחת מנוי אחד, <Hl>עד 5 ילדים</Hl></>,
      cta: "נסו 14 יום חינם",
      features: [
        "פרופיל נפרד לכל ילד עם מחברת מילים, היסטוריה, ורצף ימי למידה אישי",
        "כל ילד מקבל את כל הפיצ'רים המתקדמים: חידונים, משחקי מילים, מצב ילדים, ותמונה לכל מילה",
        "לוח בקרה להורה, רואים את כל המילים שכל ילד חיפש ומתי",
        "עד 5 ילדים תחת אותו מנוי משפחתי",
        "חיבור הטלפון של הילד בסריקת QR פשוטה, נשאר מחובר לתמיד",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "מנוי לבית ספר",
      tagline: <>כל הכיתות, כל המורות, כל הילדים, <Hl>ללא הגבלה</Hl></>,
      cta: "נסו 14 יום חינם",
      features: [
        "ללא הגבלת כיתות, מורות וילדים",
        "קוד כיתה פשוט בן 6 תווים, הילדים פותחים את הלינק במחשב הכיתה בלי שם משתמש או סיסמה",
        "כל ילד מקבל את כל הפיצ'רים המתקדמים: הסבר לילדים, תמונה לכל מילה, ניבים, מקור היסטורי",
        "המורה רואה את כל המילים שהכיתה שלה חיפשה היום",
        "לוגו של בית הספר על מסך הילדים, מרגיש כמו חלק מבית הספר",
        "חשבונית מס שאפשר להגיש להנהלת בית הספר",
      ],
    },
  },
  en: {
    heroTitle: "Start free.",
    heroSub: "Upgrade only when you want depth.",
    monthly: "Monthly", yearly: "Yearly",
    save: "Save 17%",
    signin: "Sign in",
    pricing: "Pricing",
    search: "Search",
    features: "Features",
    mo: "/mo", yr: "/yr",
    freeForever: "Free forever",
    tierBasic: {
      name: "Basic",
      tagline: "Understand the word",
      cta: "Start now",
      features: [
        "20 word searches per day",
        "A word in any language, explained in yours",
        "Every definition of the word",
        "Sentence examples by context",
        "Idioms & expressions",
        "Word origin",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Understand and <Hl>see</Hl> the word</>,
      cta: "Try 14 days free",
      badge: "Most popular",
      features: [
        "Everything in Basic",
        "Unlimited searches",
        "Kids' explanation",
        "Word illustrated as an image",
        "Personal word notebook",
        "Compose a sentence and get feedback",
        "Full search history",
        "Offline saving and access",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Understand, see, and <Hl>remember the word forever</Hl></>,
      cta: "Try 14 days free",
      features: [
        "Everything in Clear",
        "Personalized quizzes",
        "Word games",
        "Long-term practice & retention",
        "Export content",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "Schools plan",
      tagline: <>Every classroom, every teacher, every kid, <Hl>unlimited</Hl></>,
      cta: "Try 14 days free",
      features: [
        "Unlimited classrooms, teachers, and students",
        "Simple 6-character class code, kids open the link on the classroom computer with no username or password",
        "Every child gets all the advanced features: kids' explanation, image per word, idioms, etymology",
        "The teacher sees every word her class searched today",
        "Your school logo on the kid screen, feels like a part of your school",
        "Invoice you can hand to school administration",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "Family plan",
      tagline: <>The whole family on one subscription, <Hl>up to 5 children</Hl></>,
      cta: "Try 14 days free",
      features: [
        "Each child gets their own profile with personal word notebook, history, and learning streak",
        "Every child gets all the advanced features: quizzes, word games, kids mode, and image-per-word",
        "Parent dashboard, see every word each child looked up and when",
        "Up to 5 children under the same family subscription",
        "Pair your child's phone in seconds with a QR scan, stays connected forever",
      ],
    },
  },
  zu: {
    heroTitle: "Qala mahhala.",
    heroSub: "Khuphukela ezingeni eliphezulu kuphela lapho ufuna ukujula.",
    monthly: "Nyanga zonke", yearly: "Nyaka zonke",
    save: "Onga u-17%",
    signin: "Ngena",
    pricing: "Amanani",
    search: "Sesha",
    features: "Izici",
    mo: "/nyanga", yr: "/nyaka",
    freeForever: "Mahhala unomphela",
    tierBasic: {
      name: "Basic",
      tagline: "Qonda igama",
      cta: "Qala manje",
      features: [
        "Ukusesha amagama okungu-20 ngosuku",
        "Zonke izincazelo zegama",
        "Izibonelo zemisho ngokomongo",
        "Izisho nezinkulumo",
        "Umsuka wegama",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Qonda futhi <Hl>ubone</Hl> igama</>,
      cta: "Zama izinsuku ezingu-14 mahhala",
      badge: "Edume kakhulu",
      features: [
        "Konke okuku-Basic",
        "Ukusesha okungenamkhawulo",
        "Incazelo yezingane",
        "Igama elifanekiselwe njengesithombe",
        "Incwadana yamagama yomuntu siqu",
        "Yakha umusho bese uthola impendulo",
        "Umlando ophelele wokusesha",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Qonda, ubone, futhi <Hl>ukhumbule igama unomphela</Hl></>,
      cta: "Zama izinsuku ezingu-14 mahhala",
      features: [
        "Konke okuku-Clear",
        "Izivivinyo ezenzelwe wena",
        "Imidlalo yamagama",
        "Ukuzijwayeza kwesikhathi eside nokugcina emqondweni",
        "Khiphela ngaphandle okuqukethwe",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "Uhlelo lwezikole",
      tagline: <>Wonke amakilasi, wonke othisha, zonke izingane, <Hl>ngokungenamkhawulo</Hl></>,
      cta: "Zama izinsuku ezingu-14 mahhala",
      features: [
        "Amakilasi, othisha, nabafundi abangenamkhawulo",
        "Ikhodi yekilasi elula enezinhlamvu ezingu-6, izingane zivula isixhumanisi kukhompiyutha yasekilasini ngaphandle kwegama lomsebenzisi noma iphasiwedi",
        "Yonke ingane ithola zonke izici ezithuthukisiwe: incazelo yezingane, isithombe segama ngalinye, izisho, umsuka wamagama",
        "Uthisha ubona wonke amagama ikilasi lakhe eliwaseshe namuhla",
        "Ilogo yesikole sakho esikrinini sengane, kuzwakala njengengxenye yesikole sakho",
        "I-invoyisi ongayinikeza abaphathi besikole",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "Uhlelo lomndeni",
      tagline: <>Umndeni wonke ngokubhalisa okukodwa, <Hl>kuze kufike ezinganeni ezi-5</Hl></>,
      cta: "Zama izinsuku ezingu-14 mahhala",
      features: [
        "Ingane ngayinye ithola iphrofayela yayo enencwadana yamagama yomuntu siqu, umlando, nochungechunge lokufunda",
        "Yonke ingane ithola zonke izici ezithuthukisiwe: izivivinyo, imidlalo yamagama, imodi yezingane, nesithombe segama ngalinye",
        "Ideshubhodi yomzali, bona wonke amagama ingane ngayinye eyawabhekayo nokuthi nini",
        "Kuze kufike ezinganeni ezi-5 ngaphansi kokubhalisa okukodwa komndeni",
        "Xhuma ifoni yengane yakho ngemizuzwana nge-QR scan, ihlala ixhunyiwe unomphela",
      ],
    },
  },
  el: {
    heroTitle: "Ξεκίνα δωρεάν.",
    heroSub: "Αναβάθμισε μόνο όταν θέλεις βάθος.",
    monthly: "Μηνιαία", yearly: "Ετήσια",
    save: "Εξοικονόμησε 17%",
    signin: "Σύνδεση",
    pricing: "Τιμές",
    search: "Αναζήτηση",
    features: "Δυνατότητες",
    mo: "/μήνα", yr: "/έτος",
    freeForever: "Δωρεάν για πάντα",
    tierBasic: {
      name: "Basic",
      tagline: "Κατάλαβε τη λέξη",
      cta: "Ξεκίνα τώρα",
      features: [
        "20 αναζητήσεις λέξεων την ημέρα",
        "Κάθε σημασία της λέξης",
        "Παραδείγματα προτάσεων ανά συμφραζόμενα",
        "Ιδιωματισμοί και εκφράσεις",
        "Προέλευση της λέξης",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Κατάλαβε και <Hl>δες</Hl> τη λέξη</>,
      cta: "Δοκίμασε 14 ημέρες δωρεάν",
      badge: "Το πιο δημοφιλές",
      features: [
        "Όλα όσα έχει το Basic",
        "Απεριόριστες αναζητήσεις",
        "Εξήγηση για παιδιά",
        "Η λέξη εικονογραφημένη ως εικόνα",
        "Προσωπικό τετράδιο λέξεων",
        "Σύνθεσε μια πρόταση και πάρε ανατροφοδότηση",
        "Πλήρες ιστορικό αναζήτησης",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Κατάλαβε, δες και <Hl>θυμήσου τη λέξη για πάντα</Hl></>,
      cta: "Δοκίμασε 14 ημέρες δωρεάν",
      features: [
        "Όλα όσα έχει το Clear",
        "Εξατομικευμένα κουίζ",
        "Παιχνίδια με λέξεις",
        "Μακροχρόνια εξάσκηση και απομνημόνευση",
        "Εξαγωγή περιεχομένου",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "Σχέδιο για σχολεία",
      tagline: <>Κάθε τάξη, κάθε εκπαιδευτικός, κάθε παιδί, <Hl>χωρίς όρια</Hl></>,
      cta: "Δοκίμασε 14 ημέρες δωρεάν",
      features: [
        "Απεριόριστες τάξεις, εκπαιδευτικοί και μαθητές",
        "Απλός κωδικός τάξης 6 χαρακτήρων, τα παιδιά ανοίγουν τον σύνδεσμο στον υπολογιστή της τάξης χωρίς όνομα χρήστη ή κωδικό",
        "Κάθε παιδί αποκτά όλες τις προηγμένες δυνατότητες: εξήγηση για παιδιά, εικόνα ανά λέξη, ιδιωματισμούς, ετυμολογία",
        "Ο εκπαιδευτικός βλέπει κάθε λέξη που αναζήτησε η τάξη του σήμερα",
        "Το λογότυπο του σχολείου σου στην οθόνη των παιδιών, νιώθει σαν κομμάτι του σχολείου σου",
        "Τιμολόγιο που μπορείς να δώσεις στη διοίκηση του σχολείου",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "Οικογενειακό σχέδιο",
      tagline: <>Όλη η οικογένεια σε μία συνδρομή, <Hl>έως 5 παιδιά</Hl></>,
      cta: "Δοκίμασε 14 ημέρες δωρεάν",
      features: [
        "Κάθε παιδί αποκτά το δικό του προφίλ με προσωπικό τετράδιο λέξεων, ιστορικό και σερί μάθησης",
        "Κάθε παιδί αποκτά όλες τις προηγμένες δυνατότητες: κουίζ, παιχνίδια με λέξεις, παιδική λειτουργία και εικόνα ανά λέξη",
        "Πίνακας γονέα, δες κάθε λέξη που αναζήτησε κάθε παιδί και πότε",
        "Έως 5 παιδιά κάτω από την ίδια οικογενειακή συνδρομή",
        "Σύνδεσε το τηλέφωνο του παιδιού σου σε δευτερόλεπτα με σάρωση QR, μένει συνδεδεμένο για πάντα",
      ],
    },
  },
  ar: {
    heroTitle: "ابدأ مجانًا.",
    heroSub: "ارتقِ متى أردت التعمّق.",
    monthly: "شهري", yearly: "سنوي",
    save: "وفّر 17%",
    signin: "تسجيل دخول",
    pricing: "الأسعار",
    search: "بحث",
    features: "المزايا",
    mo: "/شهر", yr: "/سنة",
    freeForever: "مجاني للأبد",
    tierBasic: {
      name: "Basic",
      tagline: "فهم الكلمة",
      cta: "ابدأ مجانًا",
      features: [
        "20 عملية بحث يوميًا",
        "كل تعريفات الكلمة",
        "أمثلة جمل حسب السياق",
        "تعابير وعبارات",
        "أصل الكلمة",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>فهم و<Hl>رؤية</Hl> الكلمة</>,
      cta: "جرّب 14 يومًا مجانًا",
      badge: "الأكثر شيوعًا",
      features: [
        "كل ما في Basic",
        "عمليات بحث بلا حدود",
        "شرح للأطفال",
        "صورة توضيحية للكلمة",
        "دفتر كلمات شخصي",
        "اكتب جملة وتلقَّ تعليقًا",
        "سجل بحث كامل",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>فهم ورؤية و<Hl>تذكّر للأبد</Hl></>,
      cta: "جرّب 14 يومًا مجانًا",
      features: [
        "كل ما في Clear",
        "اختبارات مخصصة",
        "ألعاب كلمات",
        "تمرين وحفظ طويل المدى",
        "تصدير المحتوى",
      ],
    },
  },
  ru: {
    heroTitle: "Начните бесплатно.",
    heroSub: "Обновите подписку, когда захотите углубиться.",
    monthly: "Ежемесячно", yearly: "Ежегодно",
    save: "Экономия 17%",
    signin: "Войти",
    pricing: "Цены",
    search: "Поиск",
    features: "Возможности",
    mo: "/мес", yr: "/год",
    freeForever: "Бесплатно навсегда",
    tierBasic: {
      name: "Basic",
      tagline: "Понять слово",
      cta: "Начать бесплатно",
      features: [
        "20 поисков слов в день",
        "Все определения слова",
        "Примеры предложений по контексту",
        "Идиомы и выражения",
        "Происхождение слова",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Понять и <Hl>увидеть</Hl> слово</>,
      cta: "Пробовать 14 дней",
      badge: "Самый популярный",
      features: [
        "Всё из Basic",
        "Безлимитные поиски",
        "Объяснение для детей",
        "Иллюстрация слова",
        "Личная тетрадь слов",
        "Составить фразу и получить отзыв",
        "Полная история поиска",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Понять, увидеть и <Hl>запомнить навсегда</Hl></>,
      cta: "Пробовать 14 дней",
      features: [
        "Всё из Clear",
        "Персональные викторины",
        "Игры со словами",
        "Долгосрочная практика и запоминание",
        "Экспорт контента",
      ],
    },
  },
  es: {
    heroTitle: "Empieza gratis.",
    heroSub: "Actualiza solo cuando quieras profundizar.",
    monthly: "Mensual", yearly: "Anual",
    save: "Ahorra 17%",
    signin: "Iniciar sesión",
    pricing: "Precios",
    search: "Búsqueda",
    features: "Funciones",
    mo: "/mes", yr: "/año",
    freeForever: "Gratis para siempre",
    tierBasic: {
      name: "Basic",
      tagline: "Entender la palabra",
      cta: "Empezar gratis",
      features: [
        "20 búsquedas por día",
        "Todas las definiciones de la palabra",
        "Ejemplos según contexto",
        "Modismos y expresiones",
        "Origen de la palabra",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Entender y <Hl>ver</Hl> la palabra</>,
      cta: "Prueba 14 días gratis",
      badge: "Más popular",
      features: [
        "Todo lo de Basic",
        "Búsquedas ilimitadas",
        "Explicación para niños",
        "Ilustración de la palabra",
        "Cuaderno personal de palabras",
        "Compón una frase y recibe feedback",
        "Historial de búsqueda completo",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Entender, ver y <Hl>recordar para siempre</Hl></>,
      cta: "Prueba 14 días gratis",
      features: [
        "Todo lo de Clear",
        "Pruebas personalizadas",
        "Juegos de palabras",
        "Práctica y retención a largo plazo",
        "Exportar contenido",
      ],
    },
  },
  pt: {
    heroTitle: "Comece grátis.",
    heroSub: "Atualize só quando quiser aprofundar.",
    monthly: "Mensal", yearly: "Anual",
    save: "Economize 17%",
    signin: "Entrar",
    pricing: "Preços",
    search: "Buscar",
    features: "Recursos",
    mo: "/mês", yr: "/ano",
    freeForever: "Grátis para sempre",
    tierBasic: {
      name: "Basic",
      tagline: "Entender a palavra",
      cta: "Começar grátis",
      features: [
        "20 buscas de palavras por dia",
        "Todas as definições da palavra",
        "Exemplos por contexto",
        "Expressões idiomáticas",
        "Origem da palavra",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Entender e <Hl>ver</Hl> a palavra</>,
      cta: "Experimente 14 dias grátis",
      badge: "Mais popular",
      features: [
        "Tudo do Basic",
        "Buscas ilimitadas",
        "Explicação para crianças",
        "Ilustração da palavra",
        "Caderno pessoal de palavras",
        "Componha uma frase e receba feedback",
        "Histórico completo de busca",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Entender, ver e <Hl>lembrar para sempre</Hl></>,
      cta: "Experimente 14 dias grátis",
      features: [
        "Tudo do Clear",
        "Quizzes personalizados",
        "Jogos com palavras",
        "Prática e retenção a longo prazo",
        "Exportar conteúdo",
      ],
    },
  },
  fr: {
    heroTitle: "Commencez gratuitement.",
    heroSub: "Passez au supérieur seulement quand vous voulez approfondir.",
    monthly: "Mensuel", yearly: "Annuel",
    save: "Économisez 17%",
    signin: "Connexion",
    pricing: "Tarifs",
    search: "Recherche",
    features: "Fonctionnalités",
    mo: "/mois", yr: "/an",
    freeForever: "Gratuit pour toujours",
    tierBasic: {
      name: "Basic",
      tagline: "Comprendre le mot",
      cta: "Commencer gratuitement",
      features: [
        "20 recherches de mots par jour",
        "Toutes les définitions du mot",
        "Exemples selon le contexte",
        "Idiomes et expressions",
        "Origine du mot",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Comprendre et <Hl>voir</Hl> le mot</>,
      cta: "Essayez 14 jours gratuits",
      badge: "Le plus populaire",
      features: [
        "Tout du Basic",
        "Recherches illimitées",
        "Explication pour enfants",
        "Illustration du mot",
        "Carnet personnel de mots",
        "Composez une phrase et recevez un retour",
        "Historique de recherche complet",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Comprendre, voir et <Hl>retenir à jamais</Hl></>,
      cta: "Essayez 14 jours gratuits",
      features: [
        "Tout du Clear",
        "Quiz personnalisés",
        "Jeux de mots",
        "Pratique et mémorisation à long terme",
        "Exporter du contenu",
      ],
    },
  },
  de: {
    heroTitle: "Kostenlos starten.",
    heroSub: "Upgrade nur, wenn du tiefer eintauchen willst.",
    monthly: "Monatlich", yearly: "Jährlich",
    save: "17% sparen",
    signin: "Anmelden",
    pricing: "Preise",
    search: "Suche",
    features: "Funktionen",
    mo: "/Monat", yr: "/Jahr",
    freeForever: "Für immer kostenlos",
    tierBasic: {
      name: "Basic",
      tagline: "Das Wort verstehen",
      cta: "Kostenlos starten",
      features: [
        "20 Wortsuchen pro Tag",
        "Jede Definition des Wortes",
        "Beispielsätze im Kontext",
        "Redewendungen & Ausdrücke",
        "Wortursprung",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Das Wort verstehen und <Hl>sehen</Hl></>,
      cta: "14 Tage kostenlos testen",
      badge: "Am beliebtesten",
      features: [
        "Alles aus Basic",
        "Unbegrenzte Suchen",
        "Erklärung für Kinder",
        "Wort als Bild dargestellt",
        "Persönliches Wörter-Notizbuch",
        "Satz schreiben und Feedback bekommen",
        "Vollständiger Suchverlauf",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Verstehen, sehen und <Hl>für immer behalten</Hl></>,
      cta: "14 Tage kostenlos testen",
      features: [
        "Alles aus Clear",
        "Personalisierte Quizze",
        "Wortspiele",
        "Langfristiges Üben & Behalten",
        "Inhalte exportieren",
      ],
    },
  },
  cs: {
    heroTitle: "Začni zdarma.",
    heroSub: "Upgraduj, jen když budeš chtít jít hlouběji.",
    monthly: "Měsíčně", yearly: "Ročně",
    save: "Ušetři 17%",
    signin: "Přihlásit se",
    pricing: "Ceník",
    search: "Hledat",
    features: "Funkce",
    mo: "/měsíc", yr: "/rok",
    freeForever: "Navždy zdarma",
    tierBasic: {
      name: "Basic",
      tagline: "Pochopit slovo",
      cta: "Začni zdarma",
      features: [
        "20 vyhledávání slov denně",
        "Každá definice slova",
        "Příklady vět podle kontextu",
        "Idiomy a slovní spojení",
        "Původ slova",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Pochopit a <Hl>vidět</Hl> slovo</>,
      cta: "Vyzkoušej 14 dní zdarma",
      badge: "Nejoblíbenější",
      features: [
        "Vše z Basic",
        "Neomezené vyhledávání",
        "Vysvětlení pro děti",
        "Slovo znázorněné obrázkem",
        "Osobní sešit slov",
        "Napiš větu a získej zpětnou vazbu",
        "Úplná historie vyhledávání",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Pochop, viď a <Hl>zapamatuj si navždy</Hl></>,
      cta: "Vyzkoušej 14 dní zdarma",
      features: [
        "Vše z Clear",
        "Personalizované kvízy",
        "Slovní hry",
        "Dlouhodobé procvičování & zapamatování",
        "Export obsahu",
      ],
    },
  },
  sk: {
    heroTitle: "Začni zadarmo.",
    heroSub: "Upgraduj, len keď budeš chcieť ísť hlbšie.",
    monthly: "Mesačne", yearly: "Ročne",
    save: "Ušetri 17%",
    signin: "Prihlásiť sa",
    pricing: "Cenník",
    search: "Hľadať",
    features: "Funkcie",
    mo: "/mesiac", yr: "/rok",
    freeForever: "Navždy zadarmo",
    tierBasic: {
      name: "Basic",
      tagline: "Pochopiť slovo",
      cta: "Začni zadarmo",
      features: [
        "20 vyhľadávaní slov denne",
        "Každá definícia slova",
        "Príklady viet podľa kontextu",
        "Idiómy a slovné spojenia",
        "Pôvod slova",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Pochopiť a <Hl>vidieť</Hl> slovo</>,
      cta: "Vyskúšaj 14 dní zadarmo",
      badge: "Najobľúbenejšie",
      features: [
        "Všetko z Basic",
        "Neobmedzené vyhľadávanie",
        "Vysvetlenie pre deti",
        "Slovo znázornené obrázkom",
        "Osobný zošit slov",
        "Napíš vetu a získaj spätnú väzbu",
        "Úplná história vyhľadávaní",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Pochop, viď a <Hl>zapamätaj si navždy</Hl></>,
      cta: "Vyskúšaj 14 dní zadarmo",
      features: [
        "Všetko z Clear",
        "Personalizované kvízy",
        "Slovné hry",
        "Dlhodobé precvičovanie & zapamätanie",
        "Export obsahu",
      ],
    },
  },
  it: {
    heroTitle: "Inizia gratis.",
    heroSub: "Fai l'upgrade solo quando vuoi andare più a fondo.",
    monthly: "Mensile", yearly: "Annuale",
    save: "Risparmia il 17%",
    signin: "Accedi",
    pricing: "Prezzi",
    search: "Cerca",
    features: "Funzionalità",
    mo: "/mese", yr: "/anno",
    freeForever: "Gratis per sempre",
    tierBasic: {
      name: "Basic",
      tagline: "Capire la parola",
      cta: "Inizia ora",
      features: [
        "20 ricerche di parole al giorno",
        "Tutte le definizioni della parola",
        "Frasi di esempio per contesto",
        "Modi di dire ed espressioni",
        "Origine della parola",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Capire e <Hl>vedere</Hl> la parola</>,
      cta: "Prova 14 giorni gratis",
      badge: "Il più popolare",
      features: [
        "Tutto quello che c'è in Basic",
        "Ricerche illimitate",
        "Spiegazione per bambini",
        "La parola illustrata in un'immagine",
        "Quaderno di parole personale",
        "Scrivi una frase e ricevi un feedback",
        "Cronologia di ricerca completa",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Capire, vedere e <Hl>ricordare la parola per sempre</Hl></>,
      cta: "Prova 14 giorni gratis",
      features: [
        "Tutto quello che c'è in Clear",
        "Quiz personalizzati",
        "Giochi di parole",
        "Pratica e memorizzazione a lungo termine",
        "Esportazione dei contenuti",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "Piano famiglia",
      tagline: <>Tutta la famiglia con un solo abbonamento, <Hl>fino a 5 bambini</Hl></>,
      cta: "Prova 14 giorni gratis",
      features: [
        "Ogni bambino ha il suo profilo con quaderno di parole personale, cronologia e serie di giorni di studio",
        "Ogni bambino ha tutte le funzionalità avanzate: quiz, giochi di parole, modalità bambini e un'immagine per ogni parola",
        "Dashboard per i genitori, vedi ogni parola che ogni bambino ha cercato e quando",
        "Fino a 5 bambini con lo stesso abbonamento famiglia",
        "Collega il telefono di tuo figlio in pochi secondi con una scansione QR, resta connesso per sempre",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "Piano per le scuole",
      tagline: <>Ogni classe, ogni insegnante, ogni bambino, <Hl>senza limiti</Hl></>,
      cta: "Prova 14 giorni gratis",
      features: [
        "Classi, insegnanti e studenti illimitati",
        "Un semplice codice classe di 6 caratteri, i bambini aprono il link sul computer della classe senza username né password",
        "Ogni bambino ha tutte le funzionalità avanzate: spiegazione per bambini, un'immagine per ogni parola, modi di dire, etimologia",
        "L'insegnante vede ogni parola che la sua classe ha cercato oggi",
        "Il logo della tua scuola sullo schermo dei bambini, sembra parte della scuola",
        "Fattura da consegnare all'amministrazione scolastica",
      ],
    },
  },
  ja: {
    heroTitle: "無料で始めましょう。",
    heroSub: "もっと深く学びたくなったときに、アップグレードしてください。",
    monthly: "月払い", yearly: "年払い",
    save: "17%お得",
    signin: "ログイン",
    pricing: "料金",
    search: "検索",
    features: "機能",
    mo: "/月", yr: "/年",
    freeForever: "ずっと無料",
    tierBasic: {
      name: "Basic",
      tagline: "単語を理解する",
      cta: "今すぐ始める",
      features: [
        "1日20回の単語検索",
        "単語のすべての定義",
        "文脈ごとの例文",
        "慣用句と表現",
        "単語の語源",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>単語を理解し、<Hl>目で見る</Hl></>,
      cta: "14日間無料で試す",
      badge: "一番人気",
      features: [
        "Basicのすべての機能",
        "検索回数無制限",
        "子ども向けのやさしい説明",
        "単語をイラスト画像で表示",
        "自分だけの単語ノート",
        "単語で文を作ってフィードバックをもらえます",
        "検索履歴をすべて保存",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>理解して、見て、<Hl>単語を一生忘れない</Hl></>,
      cta: "14日間無料で試す",
      features: [
        "Clearのすべての機能",
        "一人ひとりに合わせたクイズ",
        "単語ゲーム",
        "長期的な練習と定着",
        "コンテンツのエクスポート",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "ファミリープラン",
      tagline: <>家族みんなでひとつのサブスクリプション、<Hl>お子さま5人まで</Hl></>,
      cta: "14日間無料で試す",
      features: [
        "お子さま一人ひとりに専用プロフィール。単語ノート、履歴、学習の連続記録も個別に管理できます",
        "すべてのお子さまが高度な機能を使えます：クイズ、単語ゲーム、キッズモード、単語ごとの画像",
        "保護者用ダッシュボードで、どの子がいつどんな単語を調べたか確認できます",
        "ひとつのファミリープランでお子さま5人まで",
        "QRコードのスキャンで数秒でお子さまのスマホを接続。ずっとつながったままです",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "学校向けプラン",
      tagline: <>すべてのクラス、すべての先生、すべての子どもが<Hl>無制限</Hl>で使えます</>,
      cta: "14日間無料で試す",
      features: [
        "クラス数、先生、生徒の人数は無制限",
        "6文字のシンプルなクラスコード。子どもは教室のパソコンでリンクを開くだけで、ユーザー名もパスワードも不要です",
        "すべての子どもが高度な機能を使えます：子ども向け説明、単語ごとの画像、慣用句、語源",
        "先生は自分のクラスが今日検索した単語をすべて確認できます",
        "子どもの画面に学校のロゴを表示。学校の一部のように感じられます",
        "学校の管理部門に提出できる請求書を発行します",
      ],
    },
  },
  hi: {
    heroTitle: "मुफ्त शुरू करें।",
    heroSub: "अपग्रेड सिर्फ़ तब करें जब आप गहराई चाहें।",
    monthly: "मासिक", yearly: "सालाना",
    save: "17% बचत",
    signin: "साइन इन",
    pricing: "क़ीमत",
    search: "खोज",
    features: "सुविधाएँ",
    mo: "/महीना", yr: "/साल",
    freeForever: "हमेशा के लिए मुफ्त",
    tierBasic: {
      name: "Basic",
      tagline: "शब्द को समझें",
      cta: "अभी शुरू करें",
      features: [
        "रोज़ 20 शब्द खोजें",
        "शब्द की हर परिभाषा",
        "संदर्भ के अनुसार उदाहरण वाक्य",
        "मुहावरे और अभिव्यक्तियाँ",
        "शब्द की उत्पत्ति",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>शब्द को समझें और <Hl>देखें</Hl></>,
      cta: "14 दिन मुफ्त आज़माएँ",
      badge: "सबसे लोकप्रिय",
      features: [
        "Basic की हर सुविधा",
        "असीमित खोज",
        "बच्चों के लिए समझ",
        "शब्द एक तस्वीर में",
        "व्यक्तिगत शब्द-नोटबुक",
        "वाक्य लिखें और फ़ीडबैक पाएँ",
        "पूरा खोज इतिहास",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>समझें, देखें और <Hl>हमेशा के लिए शब्द को याद रखें</Hl></>,
      cta: "14 दिन मुफ्त आज़माएँ",
      features: [
        "Clear की हर सुविधा",
        "व्यक्तिगत क्विज़",
        "शब्द खेल",
        "लम्बे समय का अभ्यास और याद रखना",
        "कंटेंट निर्यात",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "पारिवारिक प्लान",
      tagline: <>एक सब्सक्रिप्शन में पूरा परिवार, <Hl>5 बच्चों तक</Hl></>,
      cta: "14 दिन मुफ्त आज़माएँ",
      features: [
        "हर बच्चे का अपना प्रोफ़ाइल, व्यक्तिगत शब्द-नोटबुक, इतिहास और सीखने का सिलसिला",
        "हर बच्चे को सभी उन्नत सुविधाएँ: क्विज़, शब्द-खेल, बच्चों का मोड और हर शब्द के लिए तस्वीर",
        "माता-पिता का डैशबोर्ड, देखें कि किस बच्चे ने कौन सा शब्द कब खोजा",
        "एक ही पारिवारिक सब्सक्रिप्शन में 5 बच्चों तक",
        "QR स्कैन से सेकंडों में बच्चे का फ़ोन जोड़ें, हमेशा जुड़ा रहता है",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "स्कूल प्लान",
      tagline: <>हर कक्षा, हर शिक्षक, हर बच्चा, <Hl>बिना सीमा</Hl></>,
      cta: "14 दिन मुफ्त आज़माएँ",
      features: [
        "बिना सीमा कक्षाएँ, शिक्षक और बच्चे",
        "6 अक्षरों का सरल कक्षा कोड, बच्चे क्लास के कंप्यूटर पर लिंक खोलते हैं, बिना यूज़रनेम या पासवर्ड",
        "हर बच्चे को सभी उन्नत सुविधाएँ: बच्चों के लिए समझ, हर शब्द की तस्वीर, मुहावरे, उत्पत्ति",
        "शिक्षक देखती है कि उसकी कक्षा ने आज कौन से शब्द खोजे",
        "बच्चों की स्क्रीन पर आपके स्कूल का लोगो, स्कूल का अपना हिस्सा महसूस होता है",
        "स्कूल प्रशासन को देने योग्य बिल",
      ],
    },
  },
  am: {
    heroTitle: "በነጻ ይጀምሩ።",
    heroSub: "ጥልቀት ሲፈልጉ ብቻ ያሻሽሉ።",
    monthly: "ወርሃዊ", yearly: "ዓመታዊ",
    save: "17% ይቆጥቡ",
    signin: "ይግቡ",
    pricing: "ዋጋዎች",
    search: "ፍለጋ",
    features: "ባህሪያት",
    mo: "/ወር", yr: "/ዓመት",
    freeForever: "ለዘላለም ነጻ",
    tierBasic: {
      name: "Basic",
      tagline: "ቃሉን መረዳት",
      cta: "አሁን ይጀምሩ",
      features: [
        "በቀን 20 የቃላት ፍለጋዎች",
        "የቃሉ እያንዳንዱ ትርጓሜ",
        "እንደ አውዱ የዓረፍተ ነገር ምሳሌዎች",
        "ፈሊጦች እና አገላለጾች",
        "የቃሉ መነሻ",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>ቃሉን መረዳት እና <Hl>ማየት</Hl></>,
      cta: "14 ቀን በነጻ ይሞክሩ",
      badge: "በጣም ተወዳጅ",
      features: [
        "በ Basic ውስጥ ያለው ሁሉ",
        "ያልተገደበ ፍለጋ",
        "ለልጆች ማብራሪያ",
        "ቃሉ በምስል ተገልጾ",
        "የግል የቃላት ማስታወሻ ደብተር",
        "ዓረፍተ ነገር ይጻፉ እና ግብረ መልስ ያግኙ",
        "ሙሉ የፍለጋ ታሪክ",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>መረዳት፣ ማየት እና <Hl>ቃሉን ለዘላለም ማስታወስ</Hl></>,
      cta: "14 ቀን በነጻ ይሞክሩ",
      features: [
        "በ Clear ውስጥ ያለው ሁሉ",
        "የተበጁ ኩዊዞች",
        "የቃላት ጨዋታዎች",
        "የረጅም ጊዜ ልምምድ እና ማስታወስ",
        "ይዘትን ወደ ውጭ መላክ",
      ],
    },
    family: {
      name: "Family",
      eyebrow: "የቤተሰብ ዕቅድ",
      tagline: <>መላው ቤተሰብ በአንድ ምዝገባ፣ <Hl>እስከ 5 ልጆች</Hl></>,
      cta: "14 ቀን በነጻ ይሞክሩ",
      features: [
        "እያንዳንዱ ልጅ የራሱ መገለጫ አለው፣ ከግል የቃላት ማስታወሻ ደብተር፣ ታሪክ እና የመማሪያ ተከታታይ ቀናት ጋር",
        "እያንዳንዱ ልጅ ሁሉንም የላቁ ባህሪያት ያገኛል፡ ኩዊዞች፣ የቃላት ጨዋታዎች፣ የልጆች ሁነታ እና ለእያንዳንዱ ቃል ምስል",
        "የወላጅ ዳሽቦርድ፣ እያንዳንዱ ልጅ የትኛውን ቃል መቼ እንደፈለገ ይመልከቱ",
        "በአንድ የቤተሰብ ምዝገባ እስከ 5 ልጆች",
        "የልጅዎን ስልክ በ QR ቅኝት በሰከንዶች ያገናኙ፣ ለዘላለም ተገናኝቶ ይቆያል",
      ],
    },
    school: {
      name: "Schools",
      eyebrow: "የትምህርት ቤት ዕቅድ",
      tagline: <>እያንዳንዱ ክፍል፣ እያንዳንዱ መምህር፣ እያንዳንዱ ልጅ፣ <Hl>ያለ ገደብ</Hl></>,
      cta: "14 ቀን በነጻ ይሞክሩ",
      features: [
        "ያልተገደቡ ክፍሎች፣ መምህራን እና ተማሪዎች",
        "ቀላል ባለ 6 ቁምፊ የክፍል ኮድ፣ ልጆቹ ሊንኩን በክፍሉ ኮምፒውተር ላይ ይከፍታሉ፣ ያለ የተጠቃሚ ስም ወይም የይለፍ ቃል",
        "እያንዳንዱ ልጅ ሁሉንም የላቁ ባህሪያት ያገኛል፡ ለልጆች ማብራሪያ፣ ለእያንዳንዱ ቃል ምስል፣ ፈሊጦች፣ የቃል መነሻ",
        "መምህሯ ክፍሏ ዛሬ የፈለጋቸውን ቃላት ሁሉ ታያለች",
        "የትምህርት ቤትዎ አርማ በልጆቹ ማያ ገጽ ላይ፣ የትምህርት ቤትዎ አካል ሆኖ ይሰማል",
        "ለትምህርት ቤቱ አስተዳደር ማቅረብ የሚችሉት ደረሰኝ",
      ],
    },
  },
};

// Desktop comparison matrix for the individual tiers (Basic/Clear/Deep).
// Gadi 2026-08-15: on DESKTOP show one feature column with checkmarks so a
// solo buyer sees at a glance what each tier adds; MOBILE keeps the stacked
// cards (checkmark tables don't read on a phone). `t` = which tiers include
// the row: "bcd" all, "cd" Clear+Deep, "d" Deep only. he + en native, en
// fallback for the rest.
const FEATURE_MATRIX: Record<
  string,
  {
    searchesLabel: string;
    searchesBasic: string;
    unlimited: string;
    rows: { l: string; t: string }[];
  }
> = {
  he: {
    searchesLabel: "חיפושי מילים",
    searchesBasic: "20 ליום",
    unlimited: "ללא הגבלה",
    rows: [
      { l: "מילה בכל שפה, מוסברת בשפה שלך", t: "bcd" },
      { l: "כל ההגדרות למילה", t: "bcd" },
      { l: "דוגמאות משפטים לפי הקשר", t: "bcd" },
      { l: "ניבים וצירופי מילים", t: "bcd" },
      { l: "מקור המילה", t: "bcd" },
      { l: "הסבר לילדים", t: "cd" },
      { l: "המחשת המילה בתמונה", t: "cd" },
      { l: "מחברת מילים אישית", t: "cd" },
      { l: "חיבור משפט וקבלת משוב", t: "cd" },
      { l: "היסטוריית חיפוש מלאה", t: "cd" },
      { l: "שמירה וגישה אופליין", t: "cd" },
      { l: "חידונים מותאמים אישית", t: "d" },
      { l: "משחקי מילים", t: "d" },
      { l: "תרגול ולמידה לטווח ארוך", t: "d" },
      { l: "ייצוא תוכן", t: "d" },
    ],
  },
  en: {
    searchesLabel: "Word searches",
    searchesBasic: "20 / day",
    unlimited: "Unlimited",
    rows: [
      { l: "A word in any language, explained in yours", t: "bcd" },
      { l: "Every definition of the word", t: "bcd" },
      { l: "Sentence examples by context", t: "bcd" },
      { l: "Idioms and expressions", t: "bcd" },
      { l: "Word origin", t: "bcd" },
      { l: "Kids' explanation", t: "cd" },
      { l: "Word illustrated as an image", t: "cd" },
      { l: "Personal word notebook", t: "cd" },
      { l: "Compose a sentence and get feedback", t: "cd" },
      { l: "Full search history", t: "cd" },
      { l: "Offline saving and access", t: "cd" },
      { l: "Personalized quizzes", t: "d" },
      { l: "Word games", t: "d" },
      { l: "Long-term practice and retention", t: "d" },
      { l: "Export content", t: "d" },
    ],
  },
  ar: {
    searchesLabel: "عمليات البحث عن الكلمات",
    searchesBasic: "20 يوميًا",
    unlimited: "بلا حدود",
    rows: [
      { l: "كلمة بأي لغة، مشروحة بلغتك", t: "bcd" },
      { l: "كل تعريفات الكلمة", t: "bcd" },
      { l: "أمثلة جمل حسب السياق", t: "bcd" },
      { l: "التعابير والمصطلحات", t: "bcd" },
      { l: "أصل الكلمة", t: "bcd" },
      { l: "شرح للأطفال", t: "cd" },
      { l: "الكلمة موضّحة بصورة", t: "cd" },
      { l: "دفتر كلمات شخصي", t: "cd" },
      { l: "أنشئ جملة واحصل على ملاحظات", t: "cd" },
      { l: "سجل البحث الكامل", t: "cd" },
      { l: "الحفظ والوصول دون اتصال", t: "cd" },
      { l: "اختبارات مخصّصة", t: "d" },
      { l: "ألعاب كلمات", t: "d" },
      { l: "تدريب وحفظ طويل الأمد", t: "d" },
      { l: "تصدير المحتوى", t: "d" },
    ],
  },
  ru: {
    searchesLabel: "Поиск слов",
    searchesBasic: "20 в день",
    unlimited: "Без ограничений",
    rows: [
      { l: "Слово на любом языке с объяснением на вашем", t: "bcd" },
      { l: "Все значения слова", t: "bcd" },
      { l: "Примеры предложений по контексту", t: "bcd" },
      { l: "Идиомы и выражения", t: "bcd" },
      { l: "Происхождение слова", t: "bcd" },
      { l: "Объяснение для детей", t: "cd" },
      { l: "Слово, показанное картинкой", t: "cd" },
      { l: "Личный словарь слов", t: "cd" },
      { l: "Составьте предложение и получите отзыв", t: "cd" },
      { l: "Полная история поиска", t: "cd" },
      { l: "Сохранение и доступ офлайн", t: "cd" },
      { l: "Персональные тесты", t: "d" },
      { l: "Игры со словами", t: "d" },
      { l: "Долгосрочная практика и запоминание", t: "d" },
      { l: "Экспорт материалов", t: "d" },
    ],
  },
  es: {
    searchesLabel: "Búsquedas de palabras",
    searchesBasic: "20 al día",
    unlimited: "Sin límite",
    rows: [
      { l: "Una palabra en cualquier idioma, explicada en el tuyo", t: "bcd" },
      { l: "Todas las definiciones de la palabra", t: "bcd" },
      { l: "Ejemplos de frases según el contexto", t: "bcd" },
      { l: "Modismos y expresiones", t: "bcd" },
      { l: "Origen de la palabra", t: "bcd" },
      { l: "Explicación para niños", t: "cd" },
      { l: "La palabra ilustrada con una imagen", t: "cd" },
      { l: "Cuaderno de palabras personal", t: "cd" },
      { l: "Escribe una frase y recibe comentarios", t: "cd" },
      { l: "Historial de búsqueda completo", t: "cd" },
      { l: "Guardado y acceso sin conexión", t: "cd" },
      { l: "Cuestionarios personalizados", t: "d" },
      { l: "Juegos de palabras", t: "d" },
      { l: "Práctica y retención a largo plazo", t: "d" },
      { l: "Exportar contenido", t: "d" },
    ],
  },
  pt: {
    searchesLabel: "Buscas de palavras",
    searchesBasic: "20 por dia",
    unlimited: "Ilimitado",
    rows: [
      { l: "Uma palavra em qualquer idioma, explicada no seu", t: "bcd" },
      { l: "Todas as definições da palavra", t: "bcd" },
      { l: "Exemplos de frases por contexto", t: "bcd" },
      { l: "Expressões e locuções", t: "bcd" },
      { l: "Origem da palavra", t: "bcd" },
      { l: "Explicação para crianças", t: "cd" },
      { l: "A palavra ilustrada em imagem", t: "cd" },
      { l: "Caderno de palavras pessoal", t: "cd" },
      { l: "Escreva uma frase e receba feedback", t: "cd" },
      { l: "Histórico de busca completo", t: "cd" },
      { l: "Salvamento e acesso offline", t: "cd" },
      { l: "Questionários personalizados", t: "d" },
      { l: "Jogos de palavras", t: "d" },
      { l: "Prática e retenção de longo prazo", t: "d" },
      { l: "Exportar conteúdo", t: "d" },
    ],
  },
  fr: {
    searchesLabel: "Recherches de mots",
    searchesBasic: "20 par jour",
    unlimited: "Illimité",
    rows: [
      { l: "Un mot dans n'importe quelle langue, expliqué dans la vôtre", t: "bcd" },
      { l: "Toutes les définitions du mot", t: "bcd" },
      { l: "Exemples de phrases selon le contexte", t: "bcd" },
      { l: "Expressions et locutions", t: "bcd" },
      { l: "Origine du mot", t: "bcd" },
      { l: "Explication pour les enfants", t: "cd" },
      { l: "Le mot illustré en image", t: "cd" },
      { l: "Carnet de mots personnel", t: "cd" },
      { l: "Composez une phrase et recevez un retour", t: "cd" },
      { l: "Historique de recherche complet", t: "cd" },
      { l: "Enregistrement et accès hors ligne", t: "cd" },
      { l: "Quiz personnalisés", t: "d" },
      { l: "Jeux de mots", t: "d" },
      { l: "Pratique et mémorisation à long terme", t: "d" },
      { l: "Exporter le contenu", t: "d" },
    ],
  },
  de: {
    searchesLabel: "Wortsuchen",
    searchesBasic: "20 pro Tag",
    unlimited: "Unbegrenzt",
    rows: [
      { l: "Ein Wort in jeder Sprache, erklärt in deiner", t: "bcd" },
      { l: "Alle Bedeutungen des Wortes", t: "bcd" },
      { l: "Beispielsätze je nach Kontext", t: "bcd" },
      { l: "Redewendungen und Ausdrücke", t: "bcd" },
      { l: "Wortherkunft", t: "bcd" },
      { l: "Erklärung für Kinder", t: "cd" },
      { l: "Das Wort als Bild dargestellt", t: "cd" },
      { l: "Persönliches Wörterheft", t: "cd" },
      { l: "Einen Satz schreiben und Rückmeldung erhalten", t: "cd" },
      { l: "Vollständiger Suchverlauf", t: "cd" },
      { l: "Offline speichern und abrufen", t: "cd" },
      { l: "Personalisierte Quizze", t: "d" },
      { l: "Wortspiele", t: "d" },
      { l: "Langfristiges Üben und Behalten", t: "d" },
      { l: "Inhalte exportieren", t: "d" },
    ],
  },
  cs: {
    searchesLabel: "Vyhledávání slov",
    searchesBasic: "20 denně",
    unlimited: "Bez omezení",
    rows: [
      { l: "Slovo v jakémkoli jazyce, vysvětlené ve tvém", t: "bcd" },
      { l: "Všechny významy slova", t: "bcd" },
      { l: "Příklady vět podle kontextu", t: "bcd" },
      { l: "Idiomy a slovní spojení", t: "bcd" },
      { l: "Původ slova", t: "bcd" },
      { l: "Vysvětlení pro děti", t: "cd" },
      { l: "Slovo znázorněné obrázkem", t: "cd" },
      { l: "Osobní sešit slov", t: "cd" },
      { l: "Napiš větu a získej zpětnou vazbu", t: "cd" },
      { l: "Úplná historie vyhledávání", t: "cd" },
      { l: "Ukládání a přístup offline", t: "cd" },
      { l: "Personalizované kvízy", t: "d" },
      { l: "Slovní hry", t: "d" },
      { l: "Dlouhodobé procvičování a zapamatování", t: "d" },
      { l: "Export obsahu", t: "d" },
    ],
  },
  sk: {
    searchesLabel: "Vyhľadávania slov",
    searchesBasic: "20 denne",
    unlimited: "Bez obmedzenia",
    rows: [
      { l: "Slovo v ľubovoľnom jazyku, vysvetlené v tvojom", t: "bcd" },
      { l: "Všetky významy slova", t: "bcd" },
      { l: "Príklady viet podľa kontextu", t: "bcd" },
      { l: "Idiómy a slovné spojenia", t: "bcd" },
      { l: "Pôvod slova", t: "bcd" },
      { l: "Vysvetlenie pre deti", t: "cd" },
      { l: "Slovo znázornené obrázkom", t: "cd" },
      { l: "Osobný zošit slov", t: "cd" },
      { l: "Napíš vetu a získaj spätnú väzbu", t: "cd" },
      { l: "Úplná história vyhľadávania", t: "cd" },
      { l: "Ukladanie a prístup offline", t: "cd" },
      { l: "Personalizované kvízy", t: "d" },
      { l: "Slovné hry", t: "d" },
      { l: "Dlhodobé precvičovanie a zapamätanie", t: "d" },
      { l: "Export obsahu", t: "d" },
    ],
  },
  it: {
    searchesLabel: "Ricerche di parole",
    searchesBasic: "20 al giorno",
    unlimited: "Illimitato",
    rows: [
      { l: "Una parola in qualsiasi lingua, spiegata nella tua", t: "bcd" },
      { l: "Tutte le definizioni della parola", t: "bcd" },
      { l: "Frasi di esempio in base al contesto", t: "bcd" },
      { l: "Modi di dire ed espressioni", t: "bcd" },
      { l: "Origine della parola", t: "bcd" },
      { l: "Spiegazione per bambini", t: "cd" },
      { l: "La parola illustrata in un'immagine", t: "cd" },
      { l: "Quaderno di parole personale", t: "cd" },
      { l: "Componi una frase e ricevi un riscontro", t: "cd" },
      { l: "Cronologia di ricerca completa", t: "cd" },
      { l: "Salvataggio e accesso offline", t: "cd" },
      { l: "Quiz personalizzati", t: "d" },
      { l: "Giochi di parole", t: "d" },
      { l: "Pratica e memorizzazione a lungo termine", t: "d" },
      { l: "Esporta contenuti", t: "d" },
    ],
  },
  ja: {
    searchesLabel: "単語の検索",
    searchesBasic: "1日20回",
    unlimited: "無制限",
    rows: [
      { l: "どんな言語の単語も、あなたの言語で解説", t: "bcd" },
      { l: "単語のすべての意味", t: "bcd" },
      { l: "文脈に応じた例文", t: "bcd" },
      { l: "慣用句と言い回し", t: "bcd" },
      { l: "単語の由来", t: "bcd" },
      { l: "子ども向けの説明", t: "cd" },
      { l: "単語を画像で図解", t: "cd" },
      { l: "個人用の単語ノート", t: "cd" },
      { l: "文を作ってフィードバックを受ける", t: "cd" },
      { l: "全検索履歴", t: "cd" },
      { l: "オフライン保存とアクセス", t: "cd" },
      { l: "個別対応のクイズ", t: "d" },
      { l: "言葉遊びゲーム", t: "d" },
      { l: "長期的な練習と定着", t: "d" },
      { l: "コンテンツの書き出し", t: "d" },
    ],
  },
  hi: {
    searchesLabel: "शब्द खोज",
    searchesBasic: "20 प्रतिदिन",
    unlimited: "असीमित",
    rows: [
      { l: "किसी भी भाषा का शब्द, आपकी भाषा में समझाया गया", t: "bcd" },
      { l: "शब्द के सभी अर्थ", t: "bcd" },
      { l: "संदर्भ के अनुसार वाक्य उदाहरण", t: "bcd" },
      { l: "मुहावरे और अभिव्यक्तियाँ", t: "bcd" },
      { l: "शब्द का मूल", t: "bcd" },
      { l: "बच्चों के लिए व्याख्या", t: "cd" },
      { l: "शब्द को चित्र में दर्शाया गया", t: "cd" },
      { l: "निजी शब्द नोटबुक", t: "cd" },
      { l: "वाक्य बनाएँ और प्रतिक्रिया पाएँ", t: "cd" },
      { l: "पूरा खोज इतिहास", t: "cd" },
      { l: "ऑफ़लाइन सहेजना और पहुँच", t: "cd" },
      { l: "व्यक्तिगत क्विज़", t: "d" },
      { l: "शब्द खेल", t: "d" },
      { l: "दीर्घकालिक अभ्यास और स्मरण", t: "d" },
      { l: "सामग्री निर्यात करें", t: "d" },
    ],
  },
  am: {
    searchesLabel: "የቃላት ፍለጋ",
    searchesBasic: "በቀን 20",
    unlimited: "ያለ ገደብ",
    rows: [
      { l: "በማንኛውም ቋንቋ ያለ ቃል፣ በቋንቋህ ተብራርቶ", t: "bcd" },
      { l: "የቃሉ ሁሉም ትርጉሞች", t: "bcd" },
      { l: "እንደ አውዱ የዓረፍተ ነገር ምሳሌዎች", t: "bcd" },
      { l: "አባባሎችና ፈሊጦች", t: "bcd" },
      { l: "የቃሉ ምንጭ", t: "bcd" },
      { l: "ለልጆች ማብራሪያ", t: "cd" },
      { l: "ቃሉ በምስል የተገለጸ", t: "cd" },
      { l: "የግል የቃላት ደብተር", t: "cd" },
      { l: "ዓረፍተ ነገር ጻፍና አስተያየት ተቀበል", t: "cd" },
      { l: "ሙሉ የፍለጋ ታሪክ", t: "cd" },
      { l: "ከመስመር ውጭ ማስቀመጥና መድረስ", t: "cd" },
      { l: "ለአንተ የተዘጋጁ ፈተናዎች", t: "d" },
      { l: "የቃላት ጨዋታዎች", t: "d" },
      { l: "የረጅም ጊዜ ልምምድና ማስታወስ", t: "d" },
      { l: "ይዘት ወደ ውጭ ላክ", t: "d" },
    ],
  },
  uk: {
    searchesLabel: "Пошук слів",
    searchesBasic: "20 на день",
    unlimited: "Без обмежень",
    rows: [
      { l: "Слово будь-якою мовою з поясненням вашою", t: "bcd" },
      { l: "Усі значення слова", t: "bcd" },
      { l: "Приклади речень за контекстом", t: "bcd" },
      { l: "Ідіоми та вирази", t: "bcd" },
      { l: "Походження слова", t: "bcd" },
      { l: "Пояснення для дітей", t: "cd" },
      { l: "Слово, показане зображенням", t: "cd" },
      { l: "Особистий словник слів", t: "cd" },
      { l: "Складіть речення й отримайте відгук", t: "cd" },
      { l: "Повна історія пошуку", t: "cd" },
      { l: "Збереження й доступ офлайн", t: "cd" },
      { l: "Персональні тести", t: "d" },
      { l: "Ігри зі словами", t: "d" },
      { l: "Довготривала практика й запам'ятовування", t: "d" },
      { l: "Експорт вмісту", t: "d" },
    ],
  },
  tr: {
    searchesLabel: "Kelime aramaları",
    searchesBasic: "Günde 20",
    unlimited: "Sınırsız",
    rows: [
      { l: "Herhangi bir dildeki kelime, kendi dilinde açıklanır", t: "bcd" },
      { l: "Kelimenin tüm anlamları", t: "bcd" },
      { l: "Bağlama göre örnek cümleler", t: "bcd" },
      { l: "Deyimler ve kalıp ifadeler", t: "bcd" },
      { l: "Kelimenin kökeni", t: "bcd" },
      { l: "Çocuklar için açıklama", t: "cd" },
      { l: "Kelimenin görselle anlatımı", t: "cd" },
      { l: "Kişisel kelime defteri", t: "cd" },
      { l: "Bir cümle kur ve geri bildirim al", t: "cd" },
      { l: "Tam arama geçmişi", t: "cd" },
      { l: "Çevrimdışı kaydetme ve erişim", t: "cd" },
      { l: "Kişiselleştirilmiş testler", t: "d" },
      { l: "Kelime oyunları", t: "d" },
      { l: "Uzun vadeli alıştırma ve kalıcılık", t: "d" },
      { l: "İçeriği dışa aktar", t: "d" },
    ],
  },
  pl: {
    searchesLabel: "Wyszukiwania słów",
    searchesBasic: "20 dziennie",
    unlimited: "Bez limitu",
    rows: [
      { l: "Słowo w dowolnym języku, wyjaśnione w twoim", t: "bcd" },
      { l: "Wszystkie znaczenia słowa", t: "bcd" },
      { l: "Przykładowe zdania według kontekstu", t: "bcd" },
      { l: "Idiomy i wyrażenia", t: "bcd" },
      { l: "Pochodzenie słowa", t: "bcd" },
      { l: "Wyjaśnienie dla dzieci", t: "cd" },
      { l: "Słowo zobrazowane obrazkiem", t: "cd" },
      { l: "Osobisty zeszyt słów", t: "cd" },
      { l: "Ułóż zdanie i otrzymaj informację zwrotną", t: "cd" },
      { l: "Pełna historia wyszukiwania", t: "cd" },
      { l: "Zapis i dostęp offline", t: "cd" },
      { l: "Spersonalizowane quizy", t: "d" },
      { l: "Gry słowne", t: "d" },
      { l: "Długoterminowa praktyka i zapamiętywanie", t: "d" },
      { l: "Eksport treści", t: "d" },
    ],
  },
  fa: {
    searchesLabel: "جستجوی واژه‌ها",
    searchesBasic: "۲۰ در روز",
    unlimited: "نامحدود",
    rows: [
      { l: "واژه‌ای به هر زبان، توضیح‌داده‌شده به زبان تو", t: "bcd" },
      { l: "همه‌ی معناهای واژه", t: "bcd" },
      { l: "نمونه‌جمله‌ها بر پایه‌ی بافت", t: "bcd" },
      { l: "اصطلاح‌ها و عبارت‌ها", t: "bcd" },
      { l: "ریشه‌ی واژه", t: "bcd" },
      { l: "توضیح برای کودکان", t: "cd" },
      { l: "واژه به‌صورت تصویر", t: "cd" },
      { l: "دفترچه‌ی واژگان شخصی", t: "cd" },
      { l: "جمله‌ای بساز و بازخورد بگیر", t: "cd" },
      { l: "تاریخچه‌ی کامل جستجو", t: "cd" },
      { l: "ذخیره و دسترسی آفلاین", t: "cd" },
      { l: "آزمون‌های شخصی‌سازی‌شده", t: "d" },
      { l: "بازی‌های واژه", t: "d" },
      { l: "تمرین و ماندگاری بلندمدت", t: "d" },
      { l: "برون‌بری محتوا", t: "d" },
    ],
  },
  id: {
    searchesLabel: "Pencarian kata",
    searchesBasic: "20 per hari",
    unlimited: "Tanpa batas",
    rows: [
      { l: "Kata dalam bahasa apa pun, dijelaskan dalam bahasamu", t: "bcd" },
      { l: "Semua makna kata", t: "bcd" },
      { l: "Contoh kalimat menurut konteks", t: "bcd" },
      { l: "Idiom dan ungkapan", t: "bcd" },
      { l: "Asal kata", t: "bcd" },
      { l: "Penjelasan untuk anak", t: "cd" },
      { l: "Kata digambarkan sebagai gambar", t: "cd" },
      { l: "Buku catatan kata pribadi", t: "cd" },
      { l: "Susun kalimat dan dapatkan masukan", t: "cd" },
      { l: "Riwayat pencarian lengkap", t: "cd" },
      { l: "Penyimpanan dan akses offline", t: "cd" },
      { l: "Kuis yang dipersonalisasi", t: "d" },
      { l: "Permainan kata", t: "d" },
      { l: "Latihan dan retensi jangka panjang", t: "d" },
      { l: "Ekspor konten", t: "d" },
    ],
  },
  nl: {
    searchesLabel: "Woordzoekopdrachten",
    searchesBasic: "20 per dag",
    unlimited: "Onbeperkt",
    rows: [
      { l: "Een woord in elke taal, uitgelegd in de jouwe", t: "bcd" },
      { l: "Alle betekenissen van het woord", t: "bcd" },
      { l: "Voorbeeldzinnen op basis van context", t: "bcd" },
      { l: "Uitdrukkingen en gezegden", t: "bcd" },
      { l: "Herkomst van het woord", t: "bcd" },
      { l: "Uitleg voor kinderen", t: "cd" },
      { l: "Het woord verbeeld als afbeelding", t: "cd" },
      { l: "Persoonlijk woordenschrift", t: "cd" },
      { l: "Stel een zin op en ontvang feedback", t: "cd" },
      { l: "Volledige zoekgeschiedenis", t: "cd" },
      { l: "Offline opslaan en openen", t: "cd" },
      { l: "Gepersonaliseerde quizzen", t: "d" },
      { l: "Woordspellen", t: "d" },
      { l: "Langdurig oefenen en onthouden", t: "d" },
      { l: "Inhoud exporteren", t: "d" },
    ],
  },
  el: {
    searchesLabel: "Αναζητήσεις λέξεων",
    searchesBasic: "20 την ημέρα",
    unlimited: "Χωρίς όριο",
    rows: [
      { l: "Μια λέξη σε οποιαδήποτε γλώσσα, εξηγημένη στη δική σου", t: "bcd" },
      { l: "Όλες οι σημασίες της λέξης", t: "bcd" },
      { l: "Παραδείγματα προτάσεων ανά συμφραζόμενα", t: "bcd" },
      { l: "Ιδιωματισμοί και εκφράσεις", t: "bcd" },
      { l: "Προέλευση της λέξης", t: "bcd" },
      { l: "Εξήγηση για παιδιά", t: "cd" },
      { l: "Η λέξη ως εικόνα", t: "cd" },
      { l: "Προσωπικό τετράδιο λέξεων", t: "cd" },
      { l: "Φτιάξε μια πρόταση και πάρε ανατροφοδότηση", t: "cd" },
      { l: "Πλήρες ιστορικό αναζήτησης", t: "cd" },
      { l: "Αποθήκευση και πρόσβαση εκτός σύνδεσης", t: "cd" },
      { l: "Εξατομικευμένα κουίζ", t: "d" },
      { l: "Παιχνίδια λέξεων", t: "d" },
      { l: "Μακροχρόνια εξάσκηση και απομνημόνευση", t: "d" },
      { l: "Εξαγωγή περιεχομένου", t: "d" },
    ],
  },
  zu: {
    searchesLabel: "Ukusesha amagama",
    searchesBasic: "20 ngosuku",
    unlimited: "Okungenamkhawulo",
    rows: [
      { l: "Igama nganoma yiluphi ulimi, lichazwe ngolwakho", t: "bcd" },
      { l: "Zonke izincazelo zegama", t: "bcd" },
      { l: "Izibonelo zemisho ngokomongo", t: "bcd" },
      { l: "Izisho nezimo zokukhuluma", t: "bcd" },
      { l: "Umsuka wegama", t: "bcd" },
      { l: "Incazelo yezingane", t: "cd" },
      { l: "Igama eliboniswe njengesithombe", t: "cd" },
      { l: "Incwadi yamagama yakho siqu", t: "cd" },
      { l: "Yakha umusho uthole impendulo", t: "cd" },
      { l: "Umlando wokusesha ophelele", t: "cd" },
      { l: "Ukulondoloza nokufinyelela ku-offline", t: "cd" },
      { l: "Izivivinyo ezenzelwe wena", t: "d" },
      { l: "Imidlalo yamagama", t: "d" },
      { l: "Ukuzilolonga nokugcina isikhathi eside", t: "d" },
      { l: "Thumela okuqukethwe ngaphandle", t: "d" },
    ],
  },
};

// Section headings for the three-product pricing page (Gadi 2026-08-15).
const SECTION_HEAD: Record<string, { ind: string; fam: string; sch: string }> = {
  he: { ind: "יחידים", fam: "משפחות", sch: "בתי ספר" },
  en: { ind: "Individuals", fam: "Families", sch: "Schools" },
  ar: { ind: "الأفراد", fam: "العائلات", sch: "المدارس" },
  ru: { ind: "Частные лица", fam: "Семьи", sch: "Школы" },
  es: { ind: "Particulares", fam: "Familias", sch: "Escuelas" },
  pt: { ind: "Individuais", fam: "Famílias", sch: "Escolas" },
  fr: { ind: "Particuliers", fam: "Familles", sch: "Écoles" },
  de: { ind: "Einzelpersonen", fam: "Familien", sch: "Schulen" },
  cs: { ind: "Jednotlivci", fam: "Rodiny", sch: "Školy" },
  sk: { ind: "Jednotlivci", fam: "Rodiny", sch: "Školy" },
  it: { ind: "Privati", fam: "Famiglie", sch: "Scuole" },
  ja: { ind: "個人", fam: "家族", sch: "学校" },
  hi: { ind: "व्यक्ति", fam: "परिवार", sch: "स्कूल" },
  am: { ind: "ግለሰቦች", fam: "ቤተሰቦች", sch: "ትምህርት ቤቶች" },
  uk: { ind: "Приватні особи", fam: "Сім'ї", sch: "Школи" },
  tr: { ind: "Bireyler", fam: "Aileler", sch: "Okullar" },
  pl: { ind: "Osoby prywatne", fam: "Rodziny", sch: "Szkoły" },
  fa: { ind: "افراد", fam: "خانواده‌ها", sch: "مدرسه‌ها" },
  id: { ind: "Perorangan", fam: "Keluarga", sch: "Sekolah" },
  nl: { ind: "Particulieren", fam: "Gezinnen", sch: "Scholen" },
  el: { ind: "Ιδιώτες", fam: "Οικογένειες", sch: "Σχολεία" },
  zu: { ind: "Abantu ngabanye", fam: "Imindeni", sch: "Izikole" },
};

export function PricingPageRoute() {
  const { lang, dir, setLang } = useLang();
  const { user, promptLogin } = useAuth();
  const href = useHref();
  const [billing, setBilling] = useState<Billing>("monthly");
  const c = COPY[lang] ?? COPY.en;
  const sh = SECTION_HEAD[lang] ?? SECTION_HEAD.en;
  const fm = FEATURE_MATRIX[lang] ?? FEATURE_MATRIX.en;

  // Send the user to the in-app payment page (/checkout, Payment
  // Element) in their own language. Replaced the hosted-Checkout
  // redirect on 2026-07-12 after Gadi's end-to-end test — hosted had
  // no Hebrew locale. /api/create-checkout stays deployed as a
  // fallback. checkout_started fires inside /checkout (no duplicates).
  function startCheckout(priceId: string) {
    if (!priceId) {
      console.error("Missing Stripe priceId");
      window.alert("Pricing is misconfigured. Please contact support.");
      return;
    }
    window.location.href = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`;
  }

  function clickBasic() {
    promptLogin({ mode: "signup", onSuccess: () => { window.location.href = "/"; } });
  }
  function clickClear() {
    const priceId = billing === "yearly" ? PRICE_CLEAR_YEARLY : PRICE_CLEAR_MONTHLY;
    promptLogin({ mode: "signup", onSuccess: () => startCheckout(priceId) });
  }
  function clickDeep() {
    const priceId = billing === "yearly" ? PRICE_DEEP_YEARLY : PRICE_DEEP_MONTHLY;
    promptLogin({ mode: "signup", onSuccess: () => startCheckout(priceId) });
  }
  function clickFamily() {
    const priceId = billing === "yearly" ? PRICE_FAMILY_YEARLY : PRICE_FAMILY_MONTHLY;
    promptLogin({ mode: "signup", onSuccess: () => startCheckout(priceId) });
  }
  function clickSchoolsTier(tier: SchoolsTierKey) {
    // Hebrew schools go through the ₪ order form on /schools (Invoice4U
    // bank transfer + Israeli tax invoice — the main Israeli channel).
    // Everyone else self-serves in USD via the in-app Payment Element.
    if (lang === "he") {
      window.location.href = href("/schools");
      return;
    }
    const t = SCHOOLS_TIERS[tier];
    const priceId = billing === "yearly" ? t.yearly : t.monthly;
    promptLogin({ mode: "signup", onSuccess: () => startCheckout(priceId) });
  }

  const clearMonthly   = "$2.99";
  const clearYearly    = "$29.99";
  const deepMonthly    = "$4.99";
  const deepYearly     = "$49.99";
  // Family repriced twice: $8.99 → $6.99 (2026-07-08), then → $5.99
  // (2026-07-16, Gadi: the family price must start with a 5 in dollars
  // and stay under ₪20 in shekels for the Israeli campaign). Yearly
  // keeps the ~2-months-free convention ($59 / ₪199). Existing
  // subscribers stay on their old Stripe prices automatically; the
  // webhook maps the retired price IDs so they never downgrade.
  const familyMonthly  = "$5.99";
  const familyYearly   = "$59";

  // One monthly/yearly toggle, rendered in two spots that share the same
  // `billing` state: inside the desktop comparison table's empty corner cell
  // (Gadi 2026-08-15), and at the top for mobile where the table is hidden.
  const billingToggle = (
    <div className="wb-pricing-toggle">
      <button
        type="button"
        className={billing === "monthly" ? "is-active" : ""}
        onClick={() => setBilling("monthly")}
      >
        {c.monthly}
      </button>
      <button
        type="button"
        className={billing === "yearly" ? "is-active" : ""}
        onClick={() => setBilling("yearly")}
      >
        {c.yearly}
        <span className="wb-pricing-save">{c.save}</span>
      </button>
    </div>
  );

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <WbShellNav active="pricing" />
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
        <WbShellBurger active="pricing" />
        </div>
      </header>

      <main className="wb-pricing-main">
        <div className="wb-pricing-hero">
          <h1 className="wb-pricing-title">{c.heroTitle}</h1>
          <p className="wb-pricing-sub">{c.heroSub}</p>
          {/* Mobile toggle (desktop shows it inside the table corner). */}
          <div className="wb-pricing-toggle-top">{billingToggle}</div>
        </div>

        <h2 className="wb-pricing-section-h">{sh.ind}</h2>
        {(() => {
          // "Single user" reminder under each personal-tier price so the
          // contrast with Family (unlimited kids) reads at a glance.
          // Falls back to EN if a lang doesn't define its own string.
          const singleUser =
            lang === "he" ? "למשתמש בודד"
            : lang === "ar" ? "لمستخدم واحد"
            : lang === "ru" ? "Для одного пользователя"
            : lang === "es" ? "Para un usuario"
            : lang === "pt" ? "Para um usuário"
            : lang === "fr" ? "Pour un utilisateur"
            : lang === "de" ? "Für einen Benutzer"
            : lang === "cs" ? "Pro jednoho uživatele"
            : lang === "sk" ? "Pre jedného používateľa"
            : lang === "it" ? "Per un utente"
            : lang === "ja" ? "1ユーザーあたり"
            : lang === "hi" ? "एक यूज़र के लिए"
            : "For one user";
          // Basic sub is just "for one user" — Gadi 2026-08-15: drop "free
          // forever" so the free tier isn't promoted.
          const basicSub = singleUser;
          const clearSub = billing === "yearly" ? `≈ $2.49 ${c.mo} · ${singleUser}` : singleUser;
          const deepSub  = billing === "yearly" ? `≈ $4.16 ${c.mo} · ${singleUser}` : singleUser;
          const clearPrice = billing === "yearly" ? clearYearly : clearMonthly;
          const deepPrice = billing === "yearly" ? deepYearly : deepMonthly;
          const period = billing === "yearly" ? c.yr : c.mo;
          const dash = <span className="wb-pc-dash">·</span>;
          return (
            <>
              {/* DESKTOP: one comparison table with checkmarks. Hidden on
                  mobile (see .wb-pc CSS) where the stacked cards render. */}
              <div className="wb-pc">
                <div className="wb-pc-row wb-pc-headrow">
                  <div className="wb-pc-cell wb-pc-corner">{billingToggle}</div>
                  <div className="wb-pc-cell wb-pc-col wb-pc-t-basic">
                    <div className="wb-pc-name">{c.tierBasic.name}</div>
                    <div className="wb-pc-price">$0</div>
                    <div className="wb-pc-sub">{basicSub}</div>
                    <button type="button" className="wb-pc-cta" onClick={clickBasic}>{c.tierBasic.cta}</button>
                  </div>
                  <div className="wb-pc-cell wb-pc-col wb-pc-t-clear is-pop">
                    <div className="wb-pc-name">{c.tierClear.name}</div>
                    <div className="wb-pc-price">{clearPrice}<span className="wb-pc-period">{period}</span></div>
                    <div className="wb-pc-sub">{clearSub}</div>
                    <button type="button" className="wb-pc-cta" onClick={clickClear}>{c.tierClear.cta}</button>
                  </div>
                  <div className="wb-pc-cell wb-pc-col wb-pc-t-deep">
                    <div className="wb-pc-name">{c.tierDeep.name}</div>
                    <div className="wb-pc-price">{deepPrice}<span className="wb-pc-period">{period}</span></div>
                    <div className="wb-pc-sub">{deepSub}</div>
                    <button type="button" className="wb-pc-cta" onClick={clickDeep}>{c.tierDeep.cta}</button>
                  </div>
                </div>
                <div className="wb-pc-row">
                  <div className="wb-pc-cell wb-pc-feat">{fm.searchesLabel}</div>
                  <div className="wb-pc-cell wb-pc-val wb-pc-t-basic">{fm.searchesBasic}</div>
                  <div className="wb-pc-cell wb-pc-val wb-pc-t-clear wb-pc-strong">{fm.unlimited}</div>
                  <div className="wb-pc-cell wb-pc-val wb-pc-t-deep wb-pc-strong">{fm.unlimited}</div>
                </div>
                {fm.rows.map((r, i) => (
                  <div className="wb-pc-row" key={i}>
                    <div className="wb-pc-cell wb-pc-feat">{r.l}</div>
                    <div className="wb-pc-cell wb-pc-val wb-pc-t-basic">{r.t.includes("b") ? <span className="wb-pc-check"><CheckIcon /></span> : dash}</div>
                    <div className="wb-pc-cell wb-pc-val wb-pc-t-clear">{r.t.includes("c") ? <span className="wb-pc-check"><CheckIcon /></span> : dash}</div>
                    <div className="wb-pc-cell wb-pc-val wb-pc-t-deep">{r.t.includes("d") ? <span className="wb-pc-check"><CheckIcon /></span> : dash}</div>
                  </div>
                ))}
              </div>

              {/* MOBILE: the original stacked cards (checkmark tables don't
                  read on a phone). Hidden on desktop. */}
              <div className="wb-pricing-grid">
                <TierCard
                  id="basic"
                  name={c.tierBasic.name}
                  tagline={c.tierBasic.tagline}
                  price={"$0"}
                  period={""}
                  subPrice={basicSub}
                  features={c.tierBasic.features}
                  cta={c.tierBasic.cta}
                  onCta={clickBasic}
                />
                <TierCard
                  id="clear"
                  name={c.tierClear.name}
                  tagline={c.tierClear.tagline}
                  price={clearPrice}
                  period={period}
                  subPrice={clearSub}
                  badge={c.tierClear.badge}
                  features={c.tierClear.features}
                  cta={c.tierClear.cta}
                  onCta={clickClear}
                />
                <TierCard
                  id="deep"
                  name={c.tierDeep.name}
                  tagline={c.tierDeep.tagline}
                  price={deepPrice}
                  period={period}
                  subPrice={deepSub}
                  features={c.tierDeep.features}
                  cta={c.tierDeep.cta}
                  onCta={clickDeep}
                />
              </div>
            </>
          );
        })()}

        <h2 className="wb-pricing-section-h">{sh.fam}</h2>
        <div className="wb-section-toggle">{billingToggle}</div>
        {/* Family — a single horizontal card below the three personal tiers.
            This is the volume play: one no-brainer price for the whole
            household. Falls back to EN copy for any UI language that
            hasn't supplied its own family strings yet. */}
        {(() => {
          const f = c.family ?? COPY.en.family!;
          return (
            <div className="wb-family-card-wrap">
              <div className="wb-family-card">
                <div className="wb-family-card-head">
                  <div className="wb-family-eyebrow">{f.eyebrow}</div>
                  <h3 className="wb-family-name">{f.name}</h3>
                  <p className="wb-family-tagline">{f.tagline}</p>
                </div>
                <ul className="wb-family-features">
                  {f.features.map((feat, i) => (
                    <li key={i}>
                      <span className="wb-family-check"><CheckIcon /></span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <div className="wb-family-cta-col">
                  <div className="wb-family-price-row">
                    <span className="wb-family-price">
                      {billing === "yearly" ? familyYearly : familyMonthly}
                    </span>
                    <span className="wb-family-period">
                      {billing === "yearly" ? c.yr : c.mo}
                    </span>
                  </div>
                  <div className="wb-family-subprice">
                    {billing === "yearly" ? `≈ $7.42 ${c.mo} · ` : ""}
                    {lang === "he" ? "עד 5 ילדים"
                      : lang === "ar" ? "حتى 5 أطفال"
                      : lang === "ru" ? "До 5 детей"
                      : lang === "es" ? "Hasta 5 niños"
                      : lang === "pt" ? "Até 5 crianças"
                      : lang === "fr" ? "Jusqu'à 5 enfants"
                      : lang === "de" ? "Bis zu 5 Kindern"
                      : lang === "cs" ? "Až 5 dětí"
                      : lang === "sk" ? "Až 5 detí"
                      : lang === "it" ? "Fino a 5 bambini"
                      : lang === "ja" ? "最大5人の子供"
                      : lang === "hi" ? "5 बच्चों तक"
                      : "Up to 5 children"}
                  </div>
                  <button type="button" className="wb-family-cta" onClick={clickFamily}>
                    {f.cta}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        <h2 className="wb-pricing-section-h">{sh.sch}</h2>
        <div className="wb-section-toggle">{billingToggle}</div>
        {/* Schools — fifth tier, sits below Family. Mustard accent
            (#CA8A04) deliberately distant from the four tiers above
            (Basic gray / Clear teal / Deep purple / Family blue) so a
            principal scanning the page lands on it without color
            confusion. Falls back to EN copy for languages that haven't
            supplied their own school strings yet. */}
        {(() => {
          const s = c.school ?? COPY.en.school!;
          const period = billing === "yearly" ? c.yr : c.mo;
          return (
            <>
              {/* Desktop: one mustard comparison table, mirroring the
                  individuals table above. All three tiers include every
                  feature, so every cell is a check; the tiers differ only
                  in student cap + price. Hidden below 900px, where the
                  stacked cards render instead (Gadi 2026-08-15: table on
                  desktop, keep cards on mobile). */}
              <div className="wb-sc">
                <div className="wb-sc-row wb-sc-headrow">
                  <div className="wb-sc-corner">
                    <div className="wb-sc-corner-eyebrow">{s.eyebrow}</div>
                    <div className="wb-sc-corner-name">{s.name}</div>
                    <p className="wb-sc-corner-tag">{s.tagline}</p>
                  </div>
                  {SCHOOLS_TIER_LIST.map((t) => (
                    <div key={t.key} className="wb-sc-head">
                      <div className="wb-sc-cap">{studentsUpTo(t.maxStudents, lang)}</div>
                      <div className="wb-sc-price">
                        {billing === "yearly" ? t.usdYearly : t.usdMonthly}
                        <span className="wb-sc-per">{period}</span>
                      </div>
                      <div className="wb-sc-sub">
                        {billing === "yearly" ? `≈ ${t.usdYearlyPerMonth} ${c.mo}` : " "}
                      </div>
                      <button
                        type="button"
                        className="wb-sc-cta"
                        onClick={() => clickSchoolsTier(t.key)}
                      >
                        {s.cta}
                      </button>
                    </div>
                  ))}
                </div>
                {s.features.map((feat, i) => (
                  <div key={i} className="wb-sc-row">
                    <div className="wb-sc-feat">{feat}</div>
                    {SCHOOLS_TIER_LIST.map((t) => (
                      <div key={t.key} className="wb-sc-check">
                        <CheckIcon />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Mobile: the same three tiers as stacked cards. */}
              <div className="wb-sc-cards">
                {SCHOOLS_TIER_LIST.map((t) => (
                  <div key={t.key} className="wb-school-card-wrap">
                    <div className="wb-school-card">
                      <div className="wb-school-card-head">
                        <div className="wb-school-eyebrow">{s.eyebrow}</div>
                        <h3 className="wb-school-name">
                          {s.name}{" "}
                          <span style={{ fontSize: "0.55em", fontWeight: 600, color: "#A16207", whiteSpace: "nowrap" }}>
                            {studentsUpTo(t.maxStudents, lang)}
                          </span>
                        </h3>
                        <p className="wb-school-tagline">{s.tagline}</p>
                      </div>
                      <ul className="wb-school-features">
                        {s.features.map((feat, i) => (
                          <li key={i}>
                            <span className="wb-school-check"><CheckIcon /></span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="wb-school-cta-col">
                        <div className="wb-school-price-row">
                          <span className="wb-school-price">
                            {billing === "yearly" ? t.usdYearly : t.usdMonthly}
                          </span>
                          <span className="wb-school-period">{period}</span>
                        </div>
                        <div className="wb-school-subprice">
                          {billing === "yearly" ? `≈ ${t.usdYearlyPerMonth} ${c.mo} · ` : ""}
                          {studentsUpTo(t.maxStudents, lang)}
                        </div>
                        <button
                          type="button"
                          className="wb-school-cta"
                          onClick={() => clickSchoolsTier(t.key)}
                        >
                          {s.cta}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {/* Enterprise — 500+ students. No Stripe price, just a
            mailto: with prefilled subject. Lives as a single line
            under the two school cards so the principal of a large
            district sees the path without us cluttering the page
            with a full third card. */}
        <div
          style={{
            textAlign: "center",
            margin: "clamp(20px, 3vw, 32px) 0 0",
            fontFamily: lang === "he" || lang === "ar" ? "var(--wb-he)" : "var(--wb-sans)",
            fontSize: 14,
            color: "var(--ink-soft, #6B7280)",
          }}
        >
          {lang === "he"
            ? "מעל 1,000 תלמידים? "
            : lang === "hi"
            ? "1,000 से ज़्यादा छात्र? "
            : lang === "ar"
            ? "أكثر من 1,000 طالب؟ "
            : lang === "ru"
            ? "Более 1 000 учеников? "
            : lang === "es"
            ? "¿Más de 1000 alumnos? "
            : lang === "pt"
            ? "Mais de 1000 alunos? "
            : lang === "fr"
            ? "Plus de 1000 élèves ? "
            : lang === "de"
            ? "Mehr als 1000 Schüler? "
            : lang === "cs"
            ? "Více než 1000 studentů? "
            : lang === "sk"
            ? "Viac ako 1000 študentov? "
            : lang === "it"
            ? "Più di 1000 studenti? "
            : lang === "ja"
            ? "1,000人を超える生徒? "
            : "More than 1,000 students? "}
          <a
            href="mailto:support@gadit.app?subject=Gadit Schools Enterprise"
            style={{ color: "#CA8A04", fontWeight: 600, textDecoration: "underline" }}
          >
            {lang === "he"
              ? "צרו קשר לקבלת הצעת מחיר"
              : lang === "hi"
              ? "क़ीमत के लिए संपर्क करें"
              : lang === "ar"
              ? "تواصلوا معنا للحصول على عرض"
              : lang === "ru"
              ? "Свяжитесь с нами"
              : lang === "es"
              ? "Contáctanos para un presupuesto"
              : lang === "pt"
              ? "Fale conosco para um orçamento"
              : lang === "fr"
              ? "Contactez-nous pour un devis"
              : lang === "de"
              ? "Kontaktieren Sie uns für ein Angebot"
              : lang === "cs"
              ? "Kontaktujte nás pro nabídku"
              : lang === "sk"
              ? "Kontaktujte nás pre cenovú ponuku"
              : lang === "it"
              ? "Contattaci per un preventivo"
              : lang === "ja"
              ? "お問い合わせください"
              : "Contact us for a quote"}
          </a>
        </div>
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
