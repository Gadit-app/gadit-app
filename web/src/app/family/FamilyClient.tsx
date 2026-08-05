"use client";

/**
 * /family — owner dashboard for the Family subscription.
 *
 * Responsibilities:
 *   - Verify the signed-in user owns a Family subscription. If not, send
 *     them to /pricing with a soft message.
 *   - Show the family roster split into Parents + Children rows
 *     (mirrors Yooniz's pattern).
 *   - Each card surfaces "Pair device" (generates code, navigates to
 *     /family/[memberId]/pair) and, once linked, "Revoke".
 *   - "+ Add member" navigates to /family/add.
 *
 * Auth model: the owner has a real Firebase Auth uid that matches
 * familyId. Paired members signed in via custom tokens should NOT see
 * this page — they're redirected to /. (Future: kids get their own
 * landing page; for v1 they just use the main app.)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { FamilySetupChecklist } from "./FamilySetupChecklist";
import { db } from "@/lib/firebase";
import {
  FamilyMember,
  Family,
  isParentRole,
  memberColorFor,
  MAX_KIDS_PER_FAMILY,
  type MemberRole,
} from "@/lib/family";

const COPY: Record<string, {
  title: string;
  sub: string;
  add: string;
  parents: string;
  children: string;
  empty: string;
  pair: string;
  revoke: string;
  paired: string;
  owner: string;
  notReady: string;
  goPricing: string;
  welcome: string;
  back: string;
  capReached: string;
}> = {
  he: {
    title: "המשפחה שלכם",
    sub: "כל בן משפחה הוא משתמש בפני עצמו, עם המחברת וההיסטוריה שלו.",
    add: "+ הוספה",
    parents: "הורים",
    children: "ילדים",
    empty: "עדיין לא הוספתם בני משפחה. התחילו עם הילד הראשון.",
    pair: "חיבור מכשיר",
    revoke: "ניתוק",
    paired: "מחובר",
    owner: "ההורה הראשי",
    notReady: "כדי לנהל משפחה אתם צריכים את מנוי Family.",
    goPricing: "לתמחור",
    welcome: "ברוכים הבאים ל-Family! הוסיפו את חברי המשפחה כדי להתחיל.",
    back: "→ חזרה",
    capReached: `הגעתם למקסימום של ${MAX_KIDS_PER_FAMILY} ילדים במנוי המשפחתי.`,
  },
  en: {
    title: "Your Family",
    sub: "Every family member is their own user, with their own notebook and history.",
    add: "+ Add",
    parents: "Parents",
    children: "Children",
    empty: "No family members yet. Start by adding your first child.",
    pair: "Pair device",
    revoke: "Unpair",
    paired: "Paired",
    owner: "Owner",
    notReady: "Family subscription is required to manage members.",
    goPricing: "See pricing",
    welcome: "Welcome to Family! Add your members to get started.",
    back: "← Back",
    capReached: `You've reached the cap of ${MAX_KIDS_PER_FAMILY} children on the Family plan.`,
  },
  hi: {
    title: "आपका परिवार",
    sub: "हर सदस्य का अपना खाता है, अपनी नोटबुक और इतिहास के साथ।",
    add: "+ जोड़ें",
    parents: "माता-पिता",
    children: "बच्चे",
    empty: "अभी कोई परिवारजन नहीं। पहले बच्चे को जोड़ने से शुरू करें।",
    pair: "डिवाइस जोड़ें",
    revoke: "अलग करें",
    paired: "जुड़ा हुआ",
    owner: "मुख्य",
    notReady: "सदस्यों को प्रबंधित करने के लिए Family सब्सक्रिप्शन ज़रूरी है।",
    goPricing: "क़ीमत देखें",
    welcome: "Family में स्वागत है! शुरू करने के लिए अपने सदस्य जोड़ें।",
    back: "← वापस",
    capReached: `आप Family प्लान में ${MAX_KIDS_PER_FAMILY} बच्चों की सीमा तक पहुँच गए हैं।`,
  },
  am: {
    title: "ቤተሰብዎ",
    sub: "እያንዳንዱ የቤተሰብ አባል የራሱ ተጠቃሚ ነው፣ የራሱ ማስታወሻ ደብተር እና ታሪክ አለው።",
    add: "+ ጨምር",
    parents: "ወላጆች",
    children: "ልጆች",
    empty: "እስካሁን የቤተሰብ አባላት የሉም። የመጀመሪያውን ልጅ በመጨመር ይጀምሩ።",
    pair: "መሳሪያ ያገናኙ",
    revoke: "ግንኙነት አቋርጥ",
    paired: "ተገናኝቷል",
    owner: "ዋና ወላጅ",
    notReady: "አባላትን ለማስተዳደር የFamily ምዝገባ ያስፈልጋል።",
    goPricing: "ዋጋዎችን ይመልከቱ",
    welcome: "እንኳን ወደ Family በደህና መጡ! ለመጀመር የቤተሰብ አባላትዎን ይጨምሩ።",
    back: "← ተመለስ",
    capReached: `በFamily እቅድ ላይ ያለውን የ${MAX_KIDS_PER_FAMILY} ልጆች ጣሪያ ደርሰዋል።`,
  },
  ru: {
    title: "Ваша семья",
    sub: "Каждый член семьи — отдельный пользователь, со своей тетрадью и историей.",
    add: "+ Добавить",
    parents: "Родители",
    children: "Дети",
    empty: "Членов семьи пока нет. Начните с первого ребёнка.",
    pair: "Подключить устройство",
    revoke: "Отключить",
    paired: "Подключено",
    owner: "Главный родитель",
    notReady: "Чтобы управлять семьёй, нужна подписка Family.",
    goPricing: "К ценам",
    welcome: "Добро пожаловать в Family! Добавьте членов семьи, чтобы начать.",
    back: "← Назад",
    capReached: `Вы достигли максимума в ${MAX_KIDS_PER_FAMILY} детей на семейном плане.`,
  },
  ar: {
    title: "عائلتك",
    sub: "كل فرد من العائلة مستخدم مستقل، مع دفتره وسجلّه الخاص.",
    add: "+ إضافة",
    parents: "الوالدان",
    children: "الأطفال",
    empty: "لا يوجد أفراد عائلة بعد. ابدأ بإضافة طفلك الأول.",
    pair: "ربط جهاز",
    revoke: "فصل",
    paired: "مرتبط",
    owner: "الوالد الرئيسي",
    notReady: "لإدارة العائلة تحتاج إلى اشتراك Family.",
    goPricing: "الأسعار",
    welcome: "مرحباً بك في Family! أضف أفراد عائلتك للبدء.",
    back: "→ رجوع",
    capReached: `وصلت إلى الحد الأقصى ${MAX_KIDS_PER_FAMILY} أطفال في خطة العائلة.`,
  },
};

const ROLE_LABEL: Record<string, Record<"father" | "mother" | "boy" | "girl", string>> = {
  he: { father: "אבא", mother: "אמא", boy: "בן", girl: "בת" },
  en: { father: "Dad", mother: "Mom", boy: "Son", girl: "Daughter" },
  ru: { father: "Папа", mother: "Мама", boy: "Сын", girl: "Дочь" },
  hi: { father: "पापा", mother: "मम्मी", boy: "बेटा", girl: "बेटी" },
  am: { father: "አባት", mother: "እናት", boy: "ወንድ ልጅ", girl: "ሴት ልጅ" },
  ar: { father: "أبي", mother: "أمي", boy: "ابن", girl: "ابنة" },
};

// ─── Progress dashboard ────────────────────────────────────────────
// The parent's report card: per child, how their vocabulary is
// growing (total words, words this week, recent words). This is the
// feature that answers "why pay when ChatGPT is free" — ChatGPT is a
// conversation that vanishes, Gadit accumulates and shows the growth.
type ChildProgress = {
  memberId: string;
  name: string;
  role: string;
  colorIndex: number;
  linked: boolean;
  total: number;
  thisWeek: number;
  recent: string[];
};

const PROGRESS_COPY: Record<string, {
  title: string;
  sub: string;
  familyTotal: string;
  weekTotal: string;
  wordsInNotebook: string;
  thisWeek: string;
  recentWords: string;
  notLinked: string;
  pairCta: string;
  noneYet: string;
  loading: string;
}> = {
  he: {
    title: "ההתקדמות של הילדים",
    sub: "כמה מילים כל ילד למד, וכמה נוספו השבוע. אוצר המילים גדל לנגד עיניכם.",
    familyTotal: "מילים במחברות המשפחה",
    weekTotal: "מילים חדשות השבוע",
    wordsInNotebook: "מילים במחברת",
    thisWeek: "השבוע",
    recentWords: "מילים אחרונות",
    notLinked: "המכשיר של הילד עדיין לא מחובר. חברו אותו כדי לראות את ההתקדמות.",
    pairCta: "חיבור מכשיר",
    noneYet: "עדיין אין מילים במחברת. ברגע שהילד יתחיל לחפש, הן יופיעו כאן.",
    loading: "טוענים את ההתקדמות...",
  },
  en: {
    title: "Your children's progress",
    sub: "How many words each child has learned, and how many were added this week. Watch the vocabulary grow.",
    familyTotal: "words in the family's notebooks",
    weekTotal: "new words this week",
    wordsInNotebook: "words in notebook",
    thisWeek: "this week",
    recentWords: "Recent words",
    notLinked: "This child's device is not linked yet. Pair it to see their progress.",
    pairCta: "Pair device",
    noneYet: "No words in the notebook yet. As soon as your child starts looking words up, they appear here.",
    loading: "Loading progress...",
  },
  ru: {
    title: "Прогресс детей",
    sub: "Сколько слов выучил каждый ребёнок и сколько добавилось за неделю. Словарный запас растёт на ваших глазах.",
    familyTotal: "слов в тетрадях семьи",
    weekTotal: "новых слов за неделю",
    wordsInNotebook: "слов в тетради",
    thisWeek: "за неделю",
    recentWords: "Последние слова",
    notLinked: "Устройство ребёнка ещё не подключено. Подключите его, чтобы видеть прогресс.",
    pairCta: "Подключить устройство",
    noneYet: "В тетради пока нет слов. Как только ребёнок начнёт искать слова, они появятся здесь.",
    loading: "Загрузка прогресса...",
  },
  ar: {
    title: "تقدّم أطفالك",
    sub: "كم كلمة تعلّم كل طفل، وكم أُضيفت هذا الأسبوع. شاهد الحصيلة اللغوية تنمو أمام عينيك.",
    familyTotal: "كلمة في دفاتر العائلة",
    weekTotal: "كلمة جديدة هذا الأسبوع",
    wordsInNotebook: "كلمة في الدفتر",
    thisWeek: "هذا الأسبوع",
    recentWords: "أحدث الكلمات",
    notLinked: "جهاز هذا الطفل غير مرتبط بعد. اربطه لرؤية تقدّمه.",
    pairCta: "ربط جهاز",
    noneYet: "لا توجد كلمات في الدفتر بعد. حالما يبدأ طفلك بالبحث عن الكلمات، ستظهر هنا.",
    loading: "جارٍ تحميل التقدّم...",
  },
};

function ProgressCard({ c, t, lang }: { c: ChildProgress; t: (typeof PROGRESS_COPY)["en"]; lang: string }) {
  const href = useHref();
  const color = memberColorFor({ colorIndex: c.colorIndex });
  const initial = (c.name || "?").trim().charAt(0).toUpperCase() || "?";
  const roleName = (ROLE_LABEL[lang] ?? ROLE_LABEL.en)[c.role as "boy" | "girl"] ?? "";
  return (
    <div className="fam-dash-card">
      <div className="fam-dash-head">
        <div className="fam-dash-avatar" style={{ background: color }}>{initial}</div>
        <div>
          <div className="fam-dash-name">{c.name || roleName}</div>
          <div className="fam-dash-role">{roleName}</div>
        </div>
      </div>
      {!c.linked ? (
        <>
          <div className="fam-dash-note">{t.notLinked}</div>
          <Link href={href(`/family/${c.memberId}/pair`)} className="fam-dash-pair">{t.pairCta}</Link>
        </>
      ) : c.total === 0 ? (
        <div className="fam-dash-note">{t.noneYet}</div>
      ) : (
        <>
          <div className="fam-dash-stats">
            <div className="fam-dash-big">
              <span className="fam-dash-num">{c.total}</span>
              <span className="fam-dash-label">{t.wordsInNotebook}</span>
            </div>
            {c.thisWeek > 0 && (
              <div className="fam-dash-week">+{c.thisWeek} {t.thisWeek}</div>
            )}
          </div>
          {c.recent.length > 0 && (
            <div className="fam-dash-recent">
              <div className="fam-dash-recent-label">{t.recentWords}</div>
              <div className="fam-dash-chips">
                {c.recent.slice(0, 5).map((w, i) => (
                  <span key={i} className="fam-dash-chip">{w}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MemberCard({
  m,
  onPair,
  onRevoke,
  pairLabel,
  revokeLabel,
  pairedLabel,
  ownerLabel,
  roleLabel,
  onEdit,
  editLabel,
  onDelete,
  deleteLabel,
}: {
  m: FamilyMember;
  onPair: () => void;
  onRevoke: () => void;
  pairLabel: string;
  revokeLabel: string;
  pairedLabel: string;
  ownerLabel: string;
  roleLabel: string;
  onEdit?: () => void;
  editLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
}) {
  const color = memberColorFor(m);
  const initial = (m.name || roleLabel || "?").trim().charAt(0).toUpperCase();
  const linked = !!m.userId && !m.isOwner;
  return (
    <div className="wb-family-member-card">
      {(onEdit || onDelete) && (
        <div className="wb-family-member-icons">
          {onEdit && (
            <button type="button" className="wb-family-member-icon" onClick={onEdit} title={editLabel} aria-label={editLabel}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
            </button>
          )}
          {onDelete && (
            <button type="button" className="wb-family-member-icon wb-family-member-icon-danger" onClick={onDelete} title={deleteLabel} aria-label={deleteLabel}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
            </button>
          )}
        </div>
      )}
      <div className="wb-family-member-top">
        <div className="wb-family-member-avatar" style={{ background: color }}>
          {m.avatarPhotoUrl ? (
            <img src={m.avatarPhotoUrl} alt="" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="wb-family-member-meta">
          <div className="wb-family-member-name">{m.name || roleLabel}</div>
          <div className="wb-family-member-role">
            <span>{m.isOwner ? ownerLabel : roleLabel}</span>
            {linked && <span className="wb-family-member-paired-dot">{pairedLabel}</span>}
          </div>
        </div>
      </div>
      {!m.isOwner && (
        <div className="wb-family-member-actions">
          <button type="button" className="wb-family-member-pair" onClick={onPair}>
            {pairLabel}
          </button>
          {linked && (
            <button type="button" className="wb-family-member-revoke" onClick={onRevoke}>
              {revokeLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard shell ───────────────────────────────────────────────
// The /family area is the flagship product surface (Family + Schools),
// so it reads as a real control panel: a side nav, a personal greeting,
// and tabbed sections, with a one-tap route back to the dictionary
// (Gadi 2026-07-28).
type FamTab = "home" | "members" | "settings";

const NAV_COPY: Record<string, {
  home: string; members: string; settings: string; dictionary: string; addMember: string;
  greetMorning: string; greetNoon: string; greetEvening: string; greetNight: string;
  kids: (n: number) => string; words: (n: number) => string;
  homeTitle: string; membersTitle: string; settingsTitle: string;
  langLabel: string; accountLabel: string; accountSub: string; subLabel: string; subSub: string;
}> = {
  he: {
    home: "דף הבית", members: "בני המשפחה", settings: "הגדרות", dictionary: "חזרה למילון", addMember: "הוספת בן משפחה",
    greetMorning: "בוקר טוב", greetNoon: "צהריים טובים", greetEvening: "ערב טוב", greetNight: "לילה טוב",
    kids: (n) => (n === 1 ? "ילד אחד במשפחה" : `${n} ילדים במשפחה`), words: (n) => `${n} מילים נלמדו`,
    homeTitle: "מבט על", membersTitle: "בני המשפחה", settingsTitle: "הגדרות",
    langLabel: "שפת הממשק", accountLabel: "החשבון שלי", accountSub: "פרטים והתחברות",
    subLabel: "המנוי שלי", subSub: "ניהול מסלול וחיוב",
  },
  en: {
    home: "Home", members: "Family", settings: "Settings", dictionary: "Back to dictionary", addMember: "Add a family member",
    greetMorning: "Good morning", greetNoon: "Good afternoon", greetEvening: "Good evening", greetNight: "Good night",
    kids: (n) => (n === 1 ? "1 kid in the family" : `${n} kids in the family`), words: (n) => `${n} words learned`,
    homeTitle: "Overview", membersTitle: "Family members", settingsTitle: "Settings",
    langLabel: "Interface language", accountLabel: "My account", accountSub: "Details and sign in",
    subLabel: "My subscription", subSub: "Manage plan and billing",
  },
  ar: {
    home: "الرئيسية", members: "أفراد العائلة", settings: "الإعدادات", dictionary: "العودة إلى القاموس", addMember: "إضافة فرد للعائلة",
    greetMorning: "صباح الخير", greetNoon: "طاب يومك", greetEvening: "مساء الخير", greetNight: "طابت ليلتك",
    kids: (n) => (n === 1 ? "طفل واحد في العائلة" : `${n} أطفال في العائلة`), words: (n) => `${n} كلمة تعلّمها`,
    homeTitle: "نظرة عامة", membersTitle: "أفراد العائلة", settingsTitle: "الإعدادات",
    langLabel: "لغة الواجهة", accountLabel: "حسابي", accountSub: "التفاصيل وتسجيل الدخول",
    subLabel: "اشتراكي", subSub: "إدارة الخطة والدفع",
  },
  hi: {
    home: "होम", members: "परिवार", settings: "सेटिंग्स", dictionary: "शब्दकोश पर वापस", addMember: "परिवार सदस्य जोड़ें",
    greetMorning: "सुप्रभात", greetNoon: "शुभ दोपहर", greetEvening: "शुभ संध्या", greetNight: "शुभ रात्रि",
    kids: (n) => (n === 1 ? "परिवार में 1 बच्चा" : `परिवार में ${n} बच्चे`), words: (n) => `${n} शब्द सीखे`,
    homeTitle: "अवलोकन", membersTitle: "परिवार के सदस्य", settingsTitle: "सेटिंग्स",
    langLabel: "इंटरफ़ेस भाषा", accountLabel: "मेरा खाता", accountSub: "विवरण और साइन-इन",
    subLabel: "मेरी सदस्यता", subSub: "प्लान और बिलिंग प्रबंधित करें",
  },
  am: {
    home: "መነሻ", members: "ቤተሰብ", settings: "ቅንብሮች", dictionary: "ወደ መዝገበ ቃላት ተመለስ", addMember: "የቤተሰብ አባል ጨምር",
    greetMorning: "እንደምን አደሩ", greetNoon: "እንደምን ዋሉ", greetEvening: "እንደምን አመሹ", greetNight: "መልካም ሌሊት",
    kids: (n) => (n === 1 ? "1 ልጅ በቤተሰብ" : `${n} ልጆች በቤተሰብ`), words: (n) => `${n} ቃላት ተምረዋል`,
    homeTitle: "አጠቃላይ እይታ", membersTitle: "የቤተሰብ አባላት", settingsTitle: "ቅንብሮች",
    langLabel: "የገጽታ ቋንቋ", accountLabel: "የእኔ መለያ", accountSub: "ዝርዝሮች እና መግቢያ",
    subLabel: "የእኔ ምዝገባ", subSub: "እቅድ እና ክፍያ ያስተዳድሩ",
  },
  ru: {
    home: "Главная", members: "Семья", settings: "Настройки", dictionary: "Назад к словарю", addMember: "Добавить члена семьи",
    greetMorning: "Доброе утро", greetNoon: "Добрый день", greetEvening: "Добрый вечер", greetNight: "Доброй ночи",
    kids: (n) => (n === 1 ? "1 ребёнок в семье" : `${n} детей в семье`), words: (n) => `${n} слов выучено`,
    homeTitle: "Обзор", membersTitle: "Члены семьи", settingsTitle: "Настройки",
    langLabel: "Язык интерфейса", accountLabel: "Мой аккаунт", accountSub: "Данные и вход",
    subLabel: "Моя подписка", subSub: "Управление планом и оплатой",
  },
};

const LANG_NATIVE: Record<string, string> = {
  he: "עברית", en: "English", ar: "العربية", ru: "Русский", de: "Deutsch",
  cs: "Čeština", es: "Español", hi: "हिन्दी", am: "አማርኛ", it: "Italiano",
  ja: "日本語", sk: "Slovenčina",
};

function greetingFor(n: (typeof NAV_COPY)["en"], hour: number): string {
  if (hour < 5) return n.greetNight;
  if (hour < 12) return n.greetMorning;
  if (hour < 17) return n.greetNoon;
  if (hour < 22) return n.greetEvening;
  return n.greetNight;
}
function greetingEmoji(hour: number): string {
  if (hour < 5 || hour >= 22) return "🌙";
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  return "🌆";
}

function NavIcon({ name }: { name: FamTab | "dictionary" }) {
  const p = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "home") return (<svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>);
  if (name === "members") return (<svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16.5 5.2a3 3 0 0 1 0 5.6M18 20c-.3-2.4-1.4-4-3-4.9" /></svg>);
  if (name === "settings") return (<svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.2-1.3L14 3h-4l-.4 2.1a7 7 0 0 0-2.2 1.3l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .45.03.88.1 1.3l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.2 1.3L10 21h4l.4-2.1a7 7 0 0 0 2.2-1.3l2.3.9 2-3.4-2-1.5c.07-.42.1-.85.1-1.3z" /></svg>);
  return (<svg {...p}><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z" /><path d="M9 3v18" /></svg>);
}

export function FamilyClient() {
  const { user, loading } = useAuth();
  const { lang, dir, setLang } = useLang();
  const href = useHref();
  const router = useRouter();
  const search = useSearchParams();
  const c = COPY[lang] ?? COPY.en;
  const roleLabel = ROLE_LABEL[lang] ?? ROLE_LABEL.en;
  const nav = NAV_COPY[lang] ?? NAV_COPY.en;

  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyChecked, setFamilyChecked] = useState(false);
  const [progress, setProgress] = useState<{ children: ChildProgress[]; totalWords: number; weekWords: number } | null>(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [tab, setTab] = useState<FamTab>("home");
  // Edit the primary parent (owner). The owner profile is auto-created as
  // "father" with no name, so a mother who registered sees "אבא". This
  // lets the owner set their own name + role (Gadi 2026-08-05, Lital).
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<MemberRole>("father");
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const isWelcome = search.get("welcome") === "1";
  const pt = PROGRESS_COPY[lang] ?? PROGRESS_COPY.en;

  // Load the progress dashboard once we know the user owns a family.
  // Refetch when members change (a newly paired child should appear).
  useEffect(() => {
    if (!user || !family) return;
    let cancelled = false;
    (async () => {
      try {
        const { getIdToken } = await import("firebase/auth");
        const idToken = await getIdToken(user);
        const res = await fetch("/api/family/progress", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setProgress(data);
        }
      } catch {
        /* progress is a nice-to-have; never block the roster */
      } finally {
        // Mark loaded either way so the home tab stops showing the loading
        // skeleton and settles on the real content (or empty state).
        if (!cancelled) setProgressLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user, family, members.length]);

  // Subscribe to families/{ownerUid} doc + its members subcollection.
  useEffect(() => {
    if (!user) return;
    const famRef = doc(db, "families", user.uid);
    const unsubFamily = onSnapshot(
      famRef,
      (snap) => {
        if (snap.exists()) {
          setFamily(snap.data() as Family);
        } else {
          setFamily(null);
        }
        setFamilyChecked(true);
      },
      () => setFamilyChecked(true)
    );
    const membersQ = query(
      collection(db, "families", user.uid, "members"),
      orderBy("createdAt", "asc")
    );
    const unsubMembers = onSnapshot(
      membersQ,
      (snap) => {
        setMembers(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FamilyMember, "id">) }))
        );
      },
      () => {}
    );
    return () => {
      unsubFamily();
      unsubMembers();
    };
  }, [user]);

  if (loading || !familyChecked) {
    return <div className="wordbook wb-family-page" dir={dir}>&nbsp;</div>;
  }

  if (!user) {
    router.replace(href("/pricing"));
    return null;
  }

  // No family doc = no Family subscription. Soft redirect with a message.
  if (!family) {
    return (
      <div className="wordbook wb-family-page" dir={dir}>
        <main className="wb-family-main">
          <div className="wb-family-empty-state">
            <p>{c.notReady}</p>
            <Link href={href("/pricing")} className="wb-family-cta">
              {c.goPricing}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const parents = members.filter((m) => isParentRole(m.role));
  const children = members.filter((m) => !isParentRole(m.role));
  const atCap = children.length >= MAX_KIDS_PER_FAMILY;
  const hour = new Date().getHours();
  const ownerMember = members.find((m) => m.isOwner);
  const firstName =
    (user.displayName && user.displayName.trim().split(/\s+/)[0]) ||
    (ownerMember?.name && ownerMember.name.trim()) ||
    roleLabel.father;
  const totalWords = progress?.totalWords ?? 0;

  const memberCard = (m: FamilyMember) => (
    <MemberCard
      key={m.id}
      m={m}
      onPair={() => router.push(href(`/family/${m.id}/pair`))}
      onRevoke={() => revokeMember(user.uid, m.id)}
      pairLabel={c.pair}
      revokeLabel={c.revoke}
      pairedLabel={c.paired}
      ownerLabel={c.owner}
      roleLabel={roleLabel[m.role]}
      onEdit={() => {
        setEditMemberId(m.id);
        setEditName(m.name || "");
        setEditRole(m.role);
        setEditOpen(true);
      }}
      editLabel={lang === "he" ? "עריכה" : lang === "ar" ? "تعديل" : lang === "ru" ? "Изменить" : "Edit"}
      onDelete={!m.isOwner ? () => {
        const label = m.name || roleLabel[m.role];
        const msg = lang === "he" ? `להסיר את ${label} מהמשפחה?` : `Remove ${label} from the family?`;
        if (window.confirm(msg)) void deleteMember(m.id);
      } : undefined}
      deleteLabel={lang === "he" ? "הסרה" : lang === "ar" ? "إزالة" : lang === "ru" ? "Удалить" : "Remove"}
    />
  );

  async function saveMember() {
    if (!user || !editMemberId || editSaving) return;
    setEditSaving(true);
    try {
      await updateDoc(doc(db, "families", user.uid, "members", editMemberId), {
        name: editName.trim(),
        role: editRole,
      });
      setEditOpen(false);
    } catch (e) {
      console.error("edit member failed:", e);
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="wordbook fam-shell-page" dir={dir}>
      <style>{FAM_SHELL_CSS}</style>
      <style>{FAM_DASH_CSS}</style>
      {editOpen && (
        <div
          onClick={() => !editSaving && setEditOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            dir={dir}
            style={{ background: "#fff", borderRadius: 16, padding: "22px 20px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(17,24,39,0.25)" }}
          >
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#111827" }}>
              {lang === "he" ? "עריכה" : lang === "ar" ? "تعديل" : lang === "ru" ? "Изменить" : "Edit"}
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "#6b7280" }}>
              {lang === "he" ? "השם והתפקיד שיוצגו." : "The name and role to show."}
            </p>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={lang === "he" ? "שם" : "Name"}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(17,24,39,0.18)", fontSize: 15, fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {(isParentRole(editRole) ? (["father", "mother"] as const) : (["boy", "girl"] as const)).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setEditRole(r)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: editRole === r ? "2px solid #0EA5A5" : "1px solid rgba(17,24,39,0.18)", background: editRole === r ? "rgba(14,165,165,0.08)" : "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#111827" }}
                >
                  {roleLabel[r]}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setEditOpen(false)} disabled={editSaving} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid rgba(17,24,39,0.18)", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
                {lang === "he" ? "ביטול" : "Cancel"}
              </button>
              <button type="button" onClick={saveMember} disabled={editSaving} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#0EA5A5", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", opacity: editSaving ? 0.6 : 1 }}>
                {editSaving ? "…" : (lang === "he" ? "שמירה" : "Save")}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="fam-shell">
        {/* Side navigation */}
        <aside className="fam-shell-side">
          <Link href={href("/")} className="fam-shell-brand" dir="ltr" translate="no">
            Gad<span className="fam-shell-brand-it">it</span>
          </Link>
          <nav className="fam-shell-nav">
            {(["home", "members", "settings"] as FamTab[]).map((tk) => (
              <button
                key={tk}
                type="button"
                className={`fam-nav-item ${tab === tk ? "is-active" : ""}`}
                onClick={() => setTab(tk)}
              >
                <NavIcon name={tk} />
                <span>{nav[tk]}</span>
              </button>
            ))}
          </nav>
          <div className="fam-shell-side-foot">
            <Link href={href("/")} className="fam-nav-item fam-nav-back">
              <NavIcon name="dictionary" />
              <span>{nav.dictionary}</span>
            </Link>
          </div>
        </aside>

        {/* Main panel */}
        <main className="fam-shell-body">
          <header className={`fam-shell-top ${tab === "home" ? "is-home" : ""}`}>
            {tab === "home" ? (
              <div className="fam-shell-greet">
                <h1>
                  {greetingFor(nav, hour)}, {firstName}{" "}
                  <span className="fam-shell-emoji">{greetingEmoji(hour)}</span>
                </h1>
                <p>
                  {nav.kids(children.length)}
                  {totalWords > 0 ? ` · ${nav.words(totalWords)}` : ""}
                </p>
              </div>
            ) : (
              <div className="fam-shell-greet">
                <h1>{tab === "members" ? nav.membersTitle : nav.settingsTitle}</h1>
              </div>
            )}
          </header>

          {isWelcome && <div className="fam-shell-welcome">{c.welcome}</div>}

          {tab === "home" && (
            <div className="fam-tab">
              {/* First-steps checklist — hides itself once the family is
                  set up or the owner dismisses it. */}
              <FamilySetupChecklist members={members} lang={lang} />
              {!progressLoaded ? (
                <div className="fam-dash-grid">
                  {Array.from({ length: children.length > 0 ? children.length : 2 }).map((_, i) => (
                    <div key={i} className="fam-skel-card" />
                  ))}
                </div>
              ) : progress && progress.children.length > 0 ? (
                <>
                  {progress.totalWords > 0 && (
                    <div className="fam-dash-summary">
                      <div className="fam-dash-sumcard">
                        <span className="fam-dash-sumnum">{progress.totalWords}</span>
                        <span className="fam-dash-sumlabel">{pt.familyTotal}</span>
                      </div>
                      <div className="fam-dash-sumcard fam-dash-sumcard-week">
                        <span className="fam-dash-sumnum">+{progress.weekWords}</span>
                        <span className="fam-dash-sumlabel">{pt.weekTotal}</span>
                      </div>
                    </div>
                  )}
                  <h2 className="fam-shell-h2">{nav.homeTitle}</h2>
                  <div className="fam-dash-grid">
                    {progress.children.map((cp) => (
                      <ProgressCard key={cp.memberId} c={cp} t={pt} lang={lang} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="fam-shell-empty">
                  <p>{members.length === 0 ? c.empty : pt.sub}</p>
                  <Link href={href("/family/add")} className="wb-family-cta">{c.add}</Link>
                </div>
              )}
            </div>
          )}

          {tab === "members" && (
            <div className="fam-tab">
              {members.length === 0 ? (
                <div className="wb-family-empty-state">
                  <p>{c.empty}</p>
                  <Link href={href("/family/add")} className="wb-family-cta">{c.add}</Link>
                </div>
              ) : (
                <>
                  {parents.length > 0 && (
                    <section className="wb-family-section">
                      <h2 className="wb-family-section-title">{c.parents}</h2>
                      <div className="wb-family-grid">{parents.map(memberCard)}</div>
                    </section>
                  )}
                  {children.length > 0 && (
                    <section className="wb-family-section">
                      <h2 className="wb-family-section-title">{c.children}</h2>
                      <div className="wb-family-grid">{children.map(memberCard)}</div>
                    </section>
                  )}
                  {atCap ? (
                    <div className="fam-add-note">{c.capReached}</div>
                  ) : (
                    <Link href={href("/family/add")} className="fam-add-member">
                      <span className="fam-add-plus" aria-hidden>+</span>
                      {nav.addMember}
                    </Link>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "settings" && (
            <div className="fam-tab fam-settings">
              <div className="fam-set-row">
                <div className="fam-set-icon"><NavIcon name="settings" /></div>
                <div className="fam-set-main">
                  <label className="fam-set-label" htmlFor="fam-lang">{nav.langLabel}</label>
                </div>
                <select
                  id="fam-lang"
                  className="fam-set-select"
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Parameters<typeof setLang>[0])}
                >
                  {Object.entries(LANG_NATIVE).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>

              <Link href={href("/account")} className="fam-set-row fam-set-link">
                <div className="fam-set-icon"><NavIcon name="members" /></div>
                <div className="fam-set-main">
                  <div className="fam-set-label">{nav.accountLabel}</div>
                  <div className="fam-set-sub">{nav.accountSub}</div>
                </div>
                <span className="fam-set-arrow" aria-hidden>{dir === "rtl" ? "‹" : "›"}</span>
              </Link>

              <Link href={href("/account")} className="fam-set-row fam-set-link">
                <div className="fam-set-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 9.5h19" />
                  </svg>
                </div>
                <div className="fam-set-main">
                  <div className="fam-set-label">{nav.subLabel}</div>
                  <div className="fam-set-sub">{nav.subSub}</div>
                </div>
                <span className="fam-set-arrow" aria-hidden>{dir === "rtl" ? "‹" : "›"}</span>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

async function revokeMember(_ownerUid: string, memberId: string) {
  const { getAuth, getIdToken } = await import("firebase/auth");
  const u = getAuth().currentUser;
  if (!u) return;
  const idToken = await getIdToken(u);
  await fetch("/api/family/pair/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ memberId }),
  });
}

async function deleteMember(memberId: string) {
  const { getAuth, getIdToken } = await import("firebase/auth");
  const u = getAuth().currentUser;
  if (!u) return;
  const idToken = await getIdToken(u);
  await fetch("/api/family/pair/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ memberId }),
  });
}

// Scoped styles for the progress dashboard. Kept local (not in
// globals.css) so this feature is fully self-contained.
const FAM_DASH_CSS = `
.fam-dash { margin: 8px 0 30px; }
.fam-dash-sub { color: #6b7280; font-size: 14.5px; margin: 4px 0 16px; line-height: 1.5; }
.fam-dash-summary { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
.fam-dash-sumcard {
  flex: 1; min-width: 150px;
  background: linear-gradient(140deg, rgba(14,165,165,0.12), rgba(14,165,165,0.04));
  border: 1px solid rgba(14,165,165,0.2);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 2px;
}
.fam-dash-sumcard-week {
  background: linear-gradient(140deg, rgba(124,58,237,0.12), rgba(124,58,237,0.04));
  border-color: rgba(124,58,237,0.2);
}
.fam-dash-sumnum { font-size: 30px; font-weight: 800; color: #1f2937; line-height: 1; }
.fam-dash-sumcard-week .fam-dash-sumnum { color: #6d28d9; }
.fam-dash-sumlabel { font-size: 13px; color: #6b7280; font-weight: 600; }
.fam-dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.fam-dash-card {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.09);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 6px 18px rgba(31,41,55,0.05);
}
.fam-dash-head { display: flex; align-items: center; gap: 11px; margin-bottom: 14px; }
.fam-dash-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  color: #fff; font-weight: 800; font-size: 18px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.fam-dash-name { font-weight: 700; font-size: 16px; color: #1f2937; }
.fam-dash-role { font-size: 12.5px; color: #9ca3af; }
.fam-dash-note { color: #6b7280; font-size: 13.5px; line-height: 1.5; padding: 4px 0; }
.fam-dash-pair {
  display: inline-block; margin-top: 10px;
  background: #0EA5A5; color: #fff; text-decoration: none;
  font-weight: 700; font-size: 13.5px;
  padding: 8px 16px; border-radius: 10px;
  box-shadow: 0 3px 10px rgba(14,165,165,0.22);
  transition: transform 160ms ease-out;
}
.fam-dash-pair:active { transform: scale(0.97); }
.fam-dash-stats { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }
.fam-dash-big { display: flex; flex-direction: column; }
.fam-dash-num { font-size: 34px; font-weight: 800; color: #0b7d7d; line-height: 1; }
.fam-dash-label { font-size: 12.5px; color: #6b7280; font-weight: 600; margin-top: 3px; }
.fam-dash-week {
  background: rgba(124,58,237,0.1); color: #6d28d9;
  font-weight: 800; font-size: 13px;
  border-radius: 999px; padding: 5px 11px;
  white-space: nowrap;
}
.fam-dash-recent { margin-top: 14px; border-top: 1px dashed rgba(31,41,55,0.12); padding-top: 12px; }
.fam-dash-recent-label { font-size: 12px; color: #9ca3af; font-weight: 700; margin-bottom: 7px; }
.fam-dash-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.fam-dash-chip {
  background: rgba(14,165,165,0.09); color: #374151;
  border-radius: 999px; padding: 4px 11px;
  font-size: 13px; font-weight: 600;
}
`;

// Dashboard shell: side nav + greeting + tabbed panels. RTL puts the nav
// on the right automatically (flex row reverses); on narrow screens the
// nav collapses to a horizontal bar on top.
const FAM_SHELL_CSS = `
.fam-shell-page { min-height: 100dvh; background: #f6f4ee; }
.fam-shell {
  display: flex;
  gap: 20px;
  max-width: 1140px;
  margin: 0 auto;
  padding: 20px 18px 48px;
  align-items: flex-start;
}
.fam-shell-side {
  width: 232px; flex-shrink: 0;
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 20px;
  padding: 16px 14px;
  position: sticky; top: 18px;
  box-shadow: 0 8px 24px rgba(31,41,55,0.05);
  display: flex; flex-direction: column;
  min-height: 420px;
}
.fam-shell-brand {
  font-family: var(--font-inter), 'Inter', system-ui, sans-serif;
  font-weight: 600; font-size: 26px; letter-spacing: -0.03em;
  color: #0B0F19; text-decoration: none; direction: ltr;
  padding: 4px 12px 16px; text-align: center;
}
.fam-shell-brand-it { color: #0EA5A5; font-style: italic; font-weight: 500; }
.fam-shell-nav { display: flex; flex-direction: column; gap: 4px; }
.fam-nav-item {
  display: flex; align-items: center; gap: 11px;
  width: 100%; padding: 11px 14px;
  border-radius: 12px; border: none; background: transparent;
  color: #4b5563; font-size: 15px; font-weight: 600;
  font-family: inherit; cursor: pointer; text-decoration: none;
  text-align: start;
  transition: background 140ms ease, color 140ms ease;
}
.fam-nav-item svg { flex-shrink: 0; color: #9ca3af; transition: color 140ms ease; }
.fam-nav-item:hover { background: #f6f4ee; color: #1f2937; }
.fam-nav-item.is-active { background: rgba(14,165,165,0.12); color: #0b7d7d; }
.fam-nav-item.is-active svg { color: #0b7d7d; }
.fam-shell-side-foot { margin-top: auto; padding-top: 14px; border-top: 1px solid rgba(31,41,55,0.07); }
/* The dictionary link is an ACTION, not another tab: a bordered teal pill
   so it reads differently from the plain nav items above it. */
.fam-nav-back {
  color: #0b7d7d; font-weight: 700;
  background: rgba(14,165,165,0.08);
  border: 1px solid rgba(14,165,165,0.22);
  justify-content: center;
}
.fam-nav-back:hover { background: rgba(14,165,165,0.15); color: #0b7d7d; }
.fam-nav-back svg { color: #0EA5A5; }

.fam-shell-body { flex: 1; min-width: 0; }
.fam-shell-top {
  display: flex; flex-direction: column; align-items: flex-start;
  text-align: start; gap: 4px; margin-bottom: 24px;
}
/* Home greets the parent, centered; other tabs show their title, at the start. */
.fam-shell-top.is-home { align-items: center; text-align: center; }
.fam-add-member {
  display: inline-flex; align-items: center; gap: 8px;
  margin-top: 6px; padding: 12px 22px;
  border-radius: 14px;
  border: 1.5px dashed rgba(14,165,165,0.42);
  background: rgba(14,165,165,0.05);
  color: #0b7d7d; font-weight: 700; font-size: 15px;
  text-decoration: none; transition: background 150ms ease;
}
.fam-add-member:hover { background: rgba(14,165,165,0.13); }
.fam-add-plus { font-size: 18px; font-weight: 800; line-height: 1; }
.fam-add-note {
  margin-top: 6px; color: #b45309;
  background: rgba(217,119,6,0.1); border-radius: 12px;
  padding: 12px 16px; font-size: 14px; font-weight: 600;
}
.fam-shell-greet h1 {
  font-size: clamp(20px, 3.2vw, 26px); font-weight: 800;
  color: #1f2937; margin: 0; letter-spacing: -0.01em;
}
.fam-shell-emoji { font-weight: 400; }
.fam-shell-greet p { margin: 5px 0 0; color: #6b7280; font-size: 14px; font-weight: 500; }
.fam-shell-add {
  background: #0EA5A5; color: #fff; text-decoration: none;
  font-weight: 700; font-size: 15px;
  padding: 11px 20px; border-radius: 12px;
  box-shadow: 0 4px 14px rgba(14,165,165,0.22);
  white-space: nowrap; transition: transform 160ms ease-out;
}
.fam-shell-add:active { transform: scale(0.97); }
.fam-shell-cap {
  background: rgba(217,119,6,0.1); color: #b45309;
  border-radius: 999px; padding: 8px 14px; font-size: 13.5px; font-weight: 700;
}
.fam-shell-welcome {
  background: rgba(14,165,165,0.09); border: 1px solid rgba(14,165,165,0.22);
  color: #0b7d7d; font-weight: 600; font-size: 14.5px;
  border-radius: 14px; padding: 12px 16px; margin-bottom: 18px;
}
.fam-shell-h2 {
  font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: #9ca3af; margin: 24px 0 12px;
}
.fam-shell-empty {
  background: #fff; border: 1px dashed rgba(31,41,55,0.18);
  border-radius: 20px; padding: 40px 24px; text-align: center;
}
.fam-shell-empty p { color: #6b7280; font-size: 15px; margin: 0 0 16px; line-height: 1.6; }
/* Loading skeleton for the home tab, so the empty-state CTA never flashes
   before the real progress cards arrive (Gadi 2026-07-28). */
.fam-skel-card {
  height: 150px; border-radius: 18px;
  background: linear-gradient(100deg, #efece5 30%, #f6f4ee 50%, #efece5 70%);
  background-size: 200% 100%;
  animation: fam-skel 1.3s ease-in-out infinite;
}
@keyframes fam-skel { 0% { background-position: 150% 0; } 100% { background-position: -50% 0; } }
@media (prefers-reduced-motion: reduce) { .fam-skel-card { animation: none; } }

.fam-settings { display: flex; flex-direction: column; gap: 12px; max-width: 620px; }
.fam-set-row {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 1px solid rgba(31,41,55,0.08);
  border-radius: 16px; padding: 15px 18px; text-decoration: none;
}
.fam-set-link { transition: box-shadow 150ms ease, transform 150ms ease; cursor: pointer; }
.fam-set-link:hover { box-shadow: 0 8px 22px rgba(31,41,55,0.07); transform: translateY(-1px); }
.fam-set-icon {
  width: 40px; height: 40px; flex-shrink: 0; border-radius: 12px;
  background: rgba(14,165,165,0.1); color: #0b7d7d;
  display: flex; align-items: center; justify-content: center;
}
.fam-set-main { flex: 1; min-width: 0; }
.fam-set-label { font-size: 15.5px; font-weight: 700; color: #1f2937; }
.fam-set-sub { font-size: 13px; color: #9ca3af; margin-top: 2px; }
.fam-set-select {
  font-family: inherit; font-size: 14.5px; font-weight: 600; color: #1f2937;
  background: #f6f4ee; border: 1px solid rgba(31,41,55,0.12);
  border-radius: 10px; padding: 8px 12px; cursor: pointer;
}
.fam-set-arrow { color: #c4c9d0; font-size: 22px; font-weight: 700; line-height: 1; }

@media (max-width: 820px) {
  .fam-shell { flex-direction: column; gap: 14px; padding: 14px 12px 40px; }
  .fam-shell-side {
    width: 100%; position: static; min-height: 0;
    flex-direction: row; align-items: center; gap: 8px;
    padding: 10px; overflow-x: auto;
  }
  .fam-shell-brand { display: none; }
  .fam-shell-nav { flex-direction: row; gap: 6px; }
  .fam-nav-item { padding: 9px 13px; white-space: nowrap; }
  .fam-shell-side-foot {
    margin-top: 0; padding-top: 0; padding-inline-start: 8px;
    border-top: none; border-inline-start: 1px solid rgba(31,41,55,0.08);
  }
}
`;
