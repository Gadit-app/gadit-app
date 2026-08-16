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
import { LANGUAGES } from "@/lib/i18n";
import { FamilySetupChecklist } from "./FamilySetupChecklist";
import { enableOwnerPush, disableOwnerPush, hasLocalPushSubscription } from "@/lib/push-client";
import { db } from "@/lib/firebase";
import {
  FamilyMember,
  Family,
  isParentRole,
  memberColorFor,
  MAX_KIDS_PER_FAMILY,
  AVATARS,
  avatarUrl,
  type MemberRole,
} from "@/lib/family";
import { type RankKey } from "@/lib/gamification";
import { rankLabel, gameCopy } from "@/lib/gamification-labels";

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
  es: {
    title: "Tu familia",
    sub: "Cada miembro de la familia es su propio usuario, con su propio cuaderno e historial.",
    add: "+ Añadir",
    parents: "Padres",
    children: "Hijos",
    empty: "Todavía no hay miembros en la familia. Empieza añadiendo a tu primer hijo.",
    pair: "Vincular dispositivo",
    revoke: "Desvincular",
    paired: "Vinculado",
    owner: "Titular",
    notReady: "Se necesita una suscripción Family para gestionar los miembros.",
    goPricing: "Ver precios",
    welcome: "¡Bienvenido a Family! Añade a tus miembros para empezar.",
    back: "← Atrás",
    capReached: `Has alcanzado el límite de ${MAX_KIDS_PER_FAMILY} hijos en el plan Family.`,
  },
  pt: {
    title: "A sua família",
    sub: "Cada membro da família é o seu próprio utilizador, com o seu caderno e histórico.",
    add: "+ Adicionar",
    parents: "Pais",
    children: "Filhos",
    empty: "Ainda não há membros na família. Comece adicionando o seu primeiro filho.",
    pair: "Emparelhar dispositivo",
    revoke: "Desemparelhar",
    paired: "Emparelhado",
    owner: "Titular",
    notReady: "É necessária uma subscrição Family para gerir os membros.",
    goPricing: "Ver preços",
    welcome: "Bem-vindo ao Family! Adicione os seus membros para começar.",
    back: "← Voltar",
    capReached: `Atingiu o limite de ${MAX_KIDS_PER_FAMILY} filhos no plano Family.`,
  },
  fr: {
    title: "Votre famille",
    sub: "Chaque membre de la famille est son propre utilisateur, avec son carnet et son historique.",
    add: "+ Ajouter",
    parents: "Parents",
    children: "Enfants",
    empty: "Aucun membre de la famille pour l'instant. Commencez par ajouter votre premier enfant.",
    pair: "Associer l'appareil",
    revoke: "Dissocier",
    paired: "Associé",
    owner: "Titulaire",
    notReady: "Un abonnement Family est nécessaire pour gérer les membres.",
    goPricing: "Voir les tarifs",
    welcome: "Bienvenue dans Family ! Ajoutez vos membres pour commencer.",
    back: "← Retour",
    capReached: `Vous avez atteint la limite de ${MAX_KIDS_PER_FAMILY} enfants sur le forfait Family.`,
  },
  de: {
    title: "Deine Familie",
    sub: "Jedes Familienmitglied ist ein eigener Nutzer, mit eigenem Notizbuch und Verlauf.",
    add: "+ Hinzufügen",
    parents: "Eltern",
    children: "Kinder",
    empty: "Noch keine Familienmitglieder. Beginne, indem du dein erstes Kind hinzufügst.",
    pair: "Gerät koppeln",
    revoke: "Entkoppeln",
    paired: "Gekoppelt",
    owner: "Inhaber",
    notReady: "Für die Verwaltung der Mitglieder ist ein Family-Abo erforderlich.",
    goPricing: "Preise ansehen",
    welcome: "Willkommen bei Family! Füge deine Mitglieder hinzu, um loszulegen.",
    back: "← Zurück",
    capReached: `Du hast das Limit von ${MAX_KIDS_PER_FAMILY} Kindern im Family-Tarif erreicht.`,
  },
  cs: {
    title: "Vaše rodina",
    sub: "Každý člen rodiny je vlastní uživatel s vlastním sešitem a historií.",
    add: "+ Přidat",
    parents: "Rodiče",
    children: "Děti",
    empty: "Zatím žádní členové rodiny. Začněte přidáním svého prvního dítěte.",
    pair: "Spárovat zařízení",
    revoke: "Zrušit párování",
    paired: "Spárováno",
    owner: "Vlastník",
    notReady: "Ke správě členů je potřeba předplatné Family.",
    goPricing: "Zobrazit ceny",
    welcome: "Vítejte ve Family! Přidejte své členy a můžete začít.",
    back: "← Zpět",
    capReached: `Dosáhli jste limitu ${MAX_KIDS_PER_FAMILY} dětí v plánu Family.`,
  },
  sk: {
    title: "Vaša rodina",
    sub: "Každý člen rodiny je vlastný používateľ s vlastným zošitom a históriou.",
    add: "+ Pridať",
    parents: "Rodičia",
    children: "Deti",
    empty: "Zatiaľ žiadni členovia rodiny. Začnite pridaním svojho prvého dieťaťa.",
    pair: "Spárovať zariadenie",
    revoke: "Zrušiť párovanie",
    paired: "Spárované",
    owner: "Vlastník",
    notReady: "Na správu členov je potrebné predplatné Family.",
    goPricing: "Zobraziť ceny",
    welcome: "Vitajte vo Family! Pridajte svojich členov a môžete začať.",
    back: "← Späť",
    capReached: `Dosiahli ste limit ${MAX_KIDS_PER_FAMILY} detí v pláne Family.`,
  },
  it: {
    title: "La tua famiglia",
    sub: "Ogni membro della famiglia è un utente a sé, con il proprio quaderno e la propria cronologia.",
    add: "+ Aggiungi",
    parents: "Genitori",
    children: "Figli",
    empty: "Ancora nessun membro della famiglia. Inizia aggiungendo il tuo primo figlio.",
    pair: "Associa dispositivo",
    revoke: "Dissocia",
    paired: "Associato",
    owner: "Titolare",
    notReady: "Per gestire i membri è necessario un abbonamento Family.",
    goPricing: "Vedi i prezzi",
    welcome: "Benvenuto in Family! Aggiungi i tuoi membri per iniziare.",
    back: "← Indietro",
    capReached: `Hai raggiunto il limite di ${MAX_KIDS_PER_FAMILY} figli nel piano Family.`,
  },
  ja: {
    title: "あなたの家族",
    sub: "家族の一人ひとりが、自分のノートと履歴を持つ個別のユーザーです。",
    add: "+ 追加",
    parents: "保護者",
    children: "お子さま",
    empty: "まだ家族メンバーがいません。まずは最初のお子さまを追加しましょう。",
    pair: "デバイスを連携",
    revoke: "連携を解除",
    paired: "連携済み",
    owner: "オーナー",
    notReady: "メンバーを管理するには Family のサブスクリプションが必要です。",
    goPricing: "料金を見る",
    welcome: "Family へようこそ！メンバーを追加して始めましょう。",
    back: "← 戻る",
    capReached: `Family プランのお子さま ${MAX_KIDS_PER_FAMILY} 人の上限に達しました。`,
  },
  uk: {
    title: "Ваша сім'я",
    sub: "Кожен член сім'ї є окремим користувачем із власним зошитом та історією.",
    add: "+ Додати",
    parents: "Батьки",
    children: "Діти",
    empty: "Поки що немає членів сім'ї. Почніть із додавання першої дитини.",
    pair: "Підключити пристрій",
    revoke: "Відключити",
    paired: "Підключено",
    owner: "Власник",
    notReady: "Для керування членами потрібна підписка Family.",
    goPricing: "Переглянути ціни",
    welcome: "Ласкаво просимо до Family! Додайте членів, щоб почати.",
    back: "← Назад",
    capReached: `Ви досягли ліміту в ${MAX_KIDS_PER_FAMILY} дітей у плані Family.`,
  },
  tr: {
    title: "Aileniz",
    sub: "Her aile üyesi, kendi defteri ve geçmişiyle ayrı bir kullanıcıdır.",
    add: "+ Ekle",
    parents: "Ebeveynler",
    children: "Çocuklar",
    empty: "Henüz aile üyesi yok. İlk çocuğunuzu ekleyerek başlayın.",
    pair: "Cihazı eşle",
    revoke: "Eşlemeyi kaldır",
    paired: "Eşlendi",
    owner: "Sahip",
    notReady: "Üyeleri yönetmek için Family aboneliği gerekir.",
    goPricing: "Fiyatları gör",
    welcome: "Family'ye hoş geldiniz! Başlamak için üyelerinizi ekleyin.",
    back: "← Geri",
    capReached: `Family planında ${MAX_KIDS_PER_FAMILY} çocuk sınırına ulaştınız.`,
  },
  pl: {
    title: "Twoja rodzina",
    sub: "Każdy członek rodziny jest osobnym użytkownikiem z własnym zeszytem i historią.",
    add: "+ Dodaj",
    parents: "Rodzice",
    children: "Dzieci",
    empty: "Nie ma jeszcze członków rodziny. Zacznij od dodania pierwszego dziecka.",
    pair: "Sparuj urządzenie",
    revoke: "Rozparuj",
    paired: "Sparowano",
    owner: "Właściciel",
    notReady: "Do zarządzania członkami wymagana jest subskrypcja Family.",
    goPricing: "Zobacz cennik",
    welcome: "Witamy w Family! Dodaj członków, aby rozpocząć.",
    back: "← Wstecz",
    capReached: `Osiągnięto limit ${MAX_KIDS_PER_FAMILY} dzieci w planie Family.`,
  },
  fa: {
    title: "خانواده شما",
    sub: "هر عضو خانواده کاربر مستقل خودش است، با دفترچه و تاریخچه مخصوص خود.",
    add: "+ افزودن",
    parents: "والدین",
    children: "فرزندان",
    empty: "هنوز عضوی در خانواده نیست. با افزودن اولین فرزندتان شروع کنید.",
    pair: "اتصال دستگاه",
    revoke: "قطع اتصال",
    paired: "متصل شد",
    owner: "مالک",
    notReady: "برای مدیریت اعضا به اشتراک Family نیاز است.",
    goPricing: "مشاهده قیمت‌ها",
    welcome: "به Family خوش آمدید! برای شروع اعضای خود را اضافه کنید.",
    back: "← بازگشت",
    capReached: `شما به سقف ${MAX_KIDS_PER_FAMILY} فرزند در طرح Family رسیده‌اید.`,
  },
  id: {
    title: "Keluarga Anda",
    sub: "Setiap anggota keluarga adalah pengguna tersendiri, dengan buku catatan dan riwayatnya sendiri.",
    add: "+ Tambah",
    parents: "Orang tua",
    children: "Anak",
    empty: "Belum ada anggota keluarga. Mulailah dengan menambahkan anak pertama Anda.",
    pair: "Sambungkan perangkat",
    revoke: "Putuskan sambungan",
    paired: "Tersambung",
    owner: "Pemilik",
    notReady: "Diperlukan langganan Family untuk mengelola anggota.",
    goPricing: "Lihat harga",
    welcome: "Selamat datang di Family! Tambahkan anggota Anda untuk memulai.",
    back: "← Kembali",
    capReached: `Anda telah mencapai batas ${MAX_KIDS_PER_FAMILY} anak pada paket Family.`,
  },
  nl: {
    title: "Jouw gezin",
    sub: "Elk gezinslid is een eigen gebruiker, met een eigen notitieboek en geschiedenis.",
    add: "+ Toevoegen",
    parents: "Ouders",
    children: "Kinderen",
    empty: "Nog geen gezinsleden. Begin met het toevoegen van je eerste kind.",
    pair: "Apparaat koppelen",
    revoke: "Ontkoppelen",
    paired: "Gekoppeld",
    owner: "Eigenaar",
    notReady: "Een Family-abonnement is nodig om leden te beheren.",
    goPricing: "Bekijk prijzen",
    welcome: "Welkom bij Family! Voeg je leden toe om te beginnen.",
    back: "← Terug",
    capReached: `Je hebt de limiet van ${MAX_KIDS_PER_FAMILY} kinderen in het Family-abonnement bereikt.`,
  },
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
  zu: {
    title: "Umndeni wakho",
    sub: "Ilungu ngalinye lomndeni lingumsebenzisi walo, elinencwadi yalo yamanothi nomlando walo.",
    add: "+ Engeza",
    parents: "Abazali",
    children: "Izingane",
    empty: "Awekho amalungu omndeni okwamanje. Qala ngokwengeza ingane yakho yokuqala.",
    pair: "Xhuma idivayisi",
    revoke: "Susa ukuxhumana",
    paired: "Kuxhunyiwe",
    owner: "Umnikazi",
    notReady: "Kudingeka ukubhalisa kwe-Family ukuze uphathe amalungu.",
    goPricing: "Buka amanani",
    welcome: "Siyakwamukela ku-Family! Engeza amalungu akho ukuze uqale.",
    back: "← Emuva",
    capReached: `Ufinyelele umkhawulo wezingane ezingu-${MAX_KIDS_PER_FAMILY} ohlelweni lwe-Family.`,
  },
  el: {
    title: "Η οικογένειά σου",
    sub: "Κάθε μέλος της οικογένειας είναι ξεχωριστός χρήστης, με το δικό του τετράδιο και ιστορικό.",
    add: "+ Προσθήκη",
    parents: "Γονείς",
    children: "Παιδιά",
    empty: "Δεν υπάρχουν ακόμη μέλη οικογένειας. Ξεκίνα προσθέτοντας το πρώτο σου παιδί.",
    pair: "Σύνδεση συσκευής",
    revoke: "Αποσύνδεση",
    paired: "Συνδεδεμένο",
    owner: "Κάτοχος",
    notReady: "Απαιτείται συνδρομή Family για τη διαχείριση των μελών.",
    goPricing: "Δες τις τιμές",
    welcome: "Καλώς ήρθες στο Family! Πρόσθεσε τα μέλη σου για να ξεκινήσεις.",
    back: "← Πίσω",
    capReached: `Έφτασες το όριο των ${MAX_KIDS_PER_FAMILY} παιδιών στο πρόγραμμα Family.`,
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
  zu: { father: "Ubaba", mother: "Umama", boy: "Indodana", girl: "Indodakazi" },
  el: { father: "Μπαμπάς", mother: "Μαμά", boy: "Γιος", girl: "Κόρη" },
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
  streak: number;
  rankKey: RankKey;
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
  zu: {
    title: "Inqubekela phambili yezingane zakho",
    sub: "Mangaki amagama ingane ngayinye eziwafundile, futhi mangaki angezwe kuleli sonto. Buka isamba samagama sikhula.",
    familyTotal: "amagama asezincwadini zamanothi zomndeni",
    weekTotal: "amagama amasha kuleli sonto",
    wordsInNotebook: "amagama encwadini yamanothi",
    thisWeek: "kuleli sonto",
    recentWords: "Amagama akamuva",
    notLinked: "Idivayisi yale ngane ayikaxhunywa okwamanje. Yixhume ukuze ubone inqubekela phambili yayo.",
    pairCta: "Xhuma idivayisi",
    noneYet: "Awekho amagama encwadini yamanothi okwamanje. Ngokushesha nje ingane yakho iqala ukubheka amagama, azovela lapha.",
    loading: "Kulayishwa inqubekela phambili...",
  },
  el: {
    title: "Η πρόοδος των παιδιών σου",
    sub: "Πόσες λέξεις έμαθε κάθε παιδί και πόσες προστέθηκαν αυτή την εβδομάδα. Δες το λεξιλόγιο να μεγαλώνει.",
    familyTotal: "λέξεις στα τετράδια της οικογένειας",
    weekTotal: "νέες λέξεις αυτή την εβδομάδα",
    wordsInNotebook: "λέξεις στο τετράδιο",
    thisWeek: "αυτή την εβδομάδα",
    recentWords: "Πρόσφατες λέξεις",
    notLinked: "Η συσκευή αυτού του παιδιού δεν είναι ακόμη συνδεδεμένη. Σύνδεσέ την για να δεις την πρόοδό του.",
    pairCta: "Σύνδεση συσκευής",
    noneYet: "Δεν υπάρχουν ακόμη λέξεις στο τετράδιο. Μόλις το παιδί σου αρχίσει να ψάχνει λέξεις, θα εμφανιστούν εδώ.",
    loading: "Φόρτωση προόδου...",
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
          <div className="fam-dash-hero">
            <span className="fam-dash-num">{c.total}</span>
            <span className="fam-dash-label">{t.wordsInNotebook}</span>
          </div>
          {/* One clean, consistent badge row: streak, rank, this week. */}
          <div className="fam-dash-badges">
            {c.streak > 0 && (
              <span className="fam-dash-badge fam-dash-badge-streak">🔥 {gameCopy(lang).streakDays(c.streak)}</span>
            )}
            <span className="fam-dash-badge fam-dash-badge-rank">🏅 {rankLabel(c.rankKey, lang)}</span>
            {c.thisWeek > 0 && (
              <span className="fam-dash-badge fam-dash-badge-week">+{c.thisWeek} {t.thisWeek}</span>
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
          ) : avatarUrl(m.avatarId) ? (
            <img src={avatarUrl(m.avatarId) ?? ""} alt="" />
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
  zu: {
    home: "Ikhaya", members: "Umndeni", settings: "Izilungiselelo", dictionary: "Buyela esichazamazwini", addMember: "Engeza ilungu lomndeni",
    greetMorning: "Uvuke kahle", greetNoon: "Sawubona emini", greetEvening: "Sawubona kusihlwa", greetNight: "Ulale kahle",
    kids: (n) => (n === 1 ? "Ingane eyodwa emndenini" : `Izingane ezingu-${n} emndenini`), words: (n) => `Amagama angu-${n} afundiwe`,
    homeTitle: "Ukubuka konke", membersTitle: "Amalungu omndeni", settingsTitle: "Izilungiselelo",
    langLabel: "Ulimi lwesixhumanisi", accountLabel: "I-akhawunti yami", accountSub: "Imininingwane nokungena",
    subLabel: "Ukubhalisa kwami", subSub: "Phatha uhlelo nokukhokha",
  },
  el: {
    home: "Αρχική", members: "Οικογένεια", settings: "Ρυθμίσεις", dictionary: "Πίσω στο λεξικό", addMember: "Πρόσθεσε μέλος οικογένειας",
    greetMorning: "Καλημέρα", greetNoon: "Καλό απόγευμα", greetEvening: "Καλησπέρα", greetNight: "Καληνύχτα",
    kids: (n) => (n === 1 ? "1 παιδί στην οικογένεια" : `${n} παιδιά στην οικογένεια`), words: (n) => `${n} λέξεις που έμαθαν`,
    homeTitle: "Επισκόπηση", membersTitle: "Μέλη οικογένειας", settingsTitle: "Ρυθμίσεις",
    langLabel: "Γλώσσα διεπαφής", accountLabel: "Ο λογαριασμός μου", accountSub: "Στοιχεία και σύνδεση",
    subLabel: "Η συνδρομή μου", subSub: "Διαχείριση προγράμματος και χρέωσης",
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

// All 22 UI languages, native names, straight from the shared LANGUAGES
// registry so the family settings picker never drifts behind new languages
// (Gadi 2026-08-16: it was hardcoded to 12). Same source the main switcher
// uses.
const LANG_NATIVE: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.label]),
);

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
  // Tab lives in the URL (?tab=members) so a refresh (or an auto-update
  // reload) returns to the same screen instead of resetting to "home".
  const [tab, setTab] = useState<FamTab>(() => {
    const t = search.get("tab");
    return t === "members" || t === "settings" ? t : "home";
  });
  const changeTab = (tk: FamTab) => {
    setTab(tk);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tk === "home") url.searchParams.delete("tab");
      else url.searchParams.set("tab", tk);
      window.history.replaceState(null, "", url.toString());
    }
  };
  // Edit the primary parent (owner). The owner profile is auto-created as
  // "father" with no name, so a mother who registered sees "אבא". This
  // lets the owner set their own name + role (Gadi 2026-08-05, Lital).
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<MemberRole>("father");
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  // Per-member profile photo the parent can upload so a child is easy to
  // recognize in the profile switcher and cards. Held as a small resized
  // JPEG data URL (see resizeToAvatar); "" means "no photo / use the chip".
  const [editPhoto, setEditPhoto] = useState<string>("");
  const [editPhotoBusy, setEditPhotoBusy] = useState(false);
  // Picked illustrated avatar id ("" = none). A real photo still wins over it.
  const [editAvatarId, setEditAvatarId] = useState<string>("");

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
        setEditPhoto(m.avatarPhotoUrl || "");
        setEditAvatarId(m.avatarId || "");
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
        // "" clears the photo back to the colored chip. A resized data URL
        // (~10-20KB) sits comfortably inside the 1MB Firestore doc limit.
        avatarPhotoUrl: editPhoto || null,
        avatarId: editAvatarId || null,
      });
      setEditOpen(false);
    } catch (e) {
      console.error("edit member failed:", e);
    } finally {
      setEditSaving(false);
    }
  }

  // Read a chosen image file and downscale it to a small square avatar
  // (cover-cropped, centered) so we can store it inline in Firestore
  // without any storage bucket. Returns a JPEG data URL.
  async function resizeToAvatar(file: File): Promise<string> {
    const SIZE = 160;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode failed"));
      i.src = dataUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2;
    const sy = (img.height - side) / 2;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
    return canvas.toDataURL("image/jpeg", 0.82);
  }

  async function onPickPhoto(file: File | null) {
    if (!file) return;
    setEditPhotoBusy(true);
    try {
      const url = await resizeToAvatar(file);
      setEditPhoto(url);
    } catch (e) {
      console.error("avatar resize failed:", e);
    } finally {
      setEditPhotoBusy(false);
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
              {lang === "he" ? "השם, התמונה והתפקיד שיוצגו." : "The name, photo and role to show."}
            </p>
            {/* Profile photo: helps a parent recognize each child at a glance
                in the profile switcher. Optional; falls back to the chip. */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: "#F3F4F6", border: "1px solid rgba(17,24,39,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {editPhoto ? (
                  <img src={editPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "start" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 9, border: "1px solid rgba(14,165,165,0.4)", background: "rgba(14,165,165,0.06)", color: "#0E7490", fontWeight: 700, fontSize: 13, cursor: editPhotoBusy ? "default" : "pointer", fontFamily: "inherit", opacity: editPhotoBusy ? 0.6 : 1 }}>
                  {editPhotoBusy
                    ? (lang === "he" ? "טוען…" : lang === "ar" ? "جارٍ التحميل…" : lang === "ru" ? "Загрузка…" : "Loading…")
                    : editPhoto
                      ? (lang === "he" ? "החלפת תמונה" : lang === "ar" ? "تغيير الصورة" : lang === "ru" ? "Заменить фото" : "Change photo")
                      : (lang === "he" ? "הוספת תמונה" : lang === "ar" ? "إضافة صورة" : lang === "ru" ? "Добавить фото" : "Add a photo")}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={editPhotoBusy}
                    onChange={(e) => { void onPickPhoto(e.target.files?.[0] ?? null); e.currentTarget.value = ""; }}
                    style={{ display: "none" }}
                  />
                </label>
                {editPhoto && !editPhotoBusy && (
                  <button
                    type="button"
                    onClick={() => setEditPhoto("")}
                    style={{ background: "none", border: "none", padding: "2px 2px", color: "#9CA3AF", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {lang === "he" ? "הסרת התמונה" : lang === "ar" ? "إزالة الصورة" : lang === "ru" ? "Удалить фото" : "Remove photo"}
                  </button>
                )}
              </div>
            </div>
            {/* Avatar picker — pick an illustrated character (Gadi 2026-08-16).
                A real photo above still wins; this is the fun default. */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
                {lang === "he" ? "או בחרו דמות" : lang === "ar" ? "أو اختر شخصية" : lang === "ru" ? "Или выберите персонажа" : "Or pick a character"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {AVATARS.map((a) => {
                  const active = editAvatarId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setEditAvatarId(active ? "" : a.id)}
                      aria-pressed={active}
                      title={a.name[lang] ?? a.name.en}
                      style={{ width: 46, height: 46, borderRadius: 999, padding: 0, overflow: "hidden", cursor: "pointer", background: "#fff", border: active ? "2.5px solid #0EA5A5" : "2px solid rgba(17,24,39,0.1)", boxShadow: active ? "0 0 0 3px rgba(14,165,165,0.18)" : "none" }}
                    >
                      <img src={avatarUrl(a.id) ?? ""} alt={a.name[lang] ?? a.name.en} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  );
                })}
              </div>
            </div>
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
                onClick={() => changeTab(tk)}
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
              <ActivityFeed user={user} lang={lang} dir={dir} />
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
              <NotifSettings user={user} lang={lang} dir={dir} />
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

// ─── Recent-lookups activity feed (parent) ─────────────────────
const ACTIVITY_COPY: Record<string, { title: string; sub: string; empty: string; today: string; yesterday: string }> = {
  en: {
    title: "Recent lookups",
    sub: "Every word your kids looked up, newest first.",
    empty: "No lookups yet. When your kids search a word in Kids Mode, it shows up here.",
    today: "Today", yesterday: "Yesterday",
  },
  he: {
    title: "חיפושים אחרונים",
    sub: "כל מילה שהילדים חיפשו, מהחדש לישן.",
    empty: "עדיין אין חיפושים. כשהילדים יחפשו מילה במצב ילדים, זה יופיע כאן.",
    today: "היום", yesterday: "אתמול",
  },
};

type SearchItem = { word: string; language: string; kidName: string; memberId: string | null; at: string };

function ActivityFeed({
  user,
  lang,
  dir,
}: {
  user: { getIdToken: () => Promise<string> } | null;
  lang: string;
  dir: "ltr" | "rtl";
}) {
  const t = ACTIVITY_COPY[lang] ?? ACTIVITY_COPY.en;
  const [items, setItems] = useState<SearchItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/family/searches", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  function timeLabel(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const yd = new Date(now);
    yd.setDate(now.getDate() - 1);
    const hm = d.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" });
    if (d.toDateString() === now.toDateString()) return `${t.today} ${hm}`;
    if (d.toDateString() === yd.toDateString()) return `${t.yesterday} ${hm}`;
    return d.toLocaleDateString(lang, { day: "numeric", month: "short" });
  }

  if (items === null || items.length === 0) {
    // Hide entirely when there's nothing yet (keeps the dashboard clean);
    // the empty hint only shows once loaded AND still empty is not worth a
    // whole card, so render nothing until there's real activity.
    if (items === null) return null;
    return null;
  }

  const TEAL = "#0EA5A5";
  return (
    <div
      dir={dir}
      style={{
        marginTop: 18, background: "#fff", border: "1px solid #E7E5E4",
        borderRadius: 14, padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, color: "#1C1917" }}>{t.title}</div>
      <div style={{ fontSize: 13, color: "#78716C", marginTop: 3 }}>{t.sub}</div>
      <div style={{ marginTop: 12 }}>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "baseline", gap: 10,
              padding: "9px 0",
              borderTop: i === 0 ? "none" : "1px solid #F5F5F4",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: "#292524" }}>{it.word}</span>
            {it.kidName && (
              <span
                style={{
                  fontSize: 11, fontWeight: 700, color: TEAL,
                  background: "rgba(14,165,165,0.10)", padding: "1px 7px", borderRadius: 999,
                  whiteSpace: "nowrap",
                }}
              >
                {it.kidName}
              </span>
            )}
            <span style={{ marginInlineStart: "auto", fontSize: 12, color: "#A8A29E", whiteSpace: "nowrap" }}>
              {timeLabel(it.at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Word-alert notification settings (parent) ─────────────────
const NOTIF_COPY: Record<string, {
  title: string; sub: string; enable: string;
  instant: string; instantSub: string; daily: string; dailySub: string;
  pushOn: string; pushUnavailable: string; emailNote: string;
  enableHere: string; enableHereHint: string;
}> = {
  en: {
    title: "Word alerts",
    sub: "Get notified when your child looks up a word in the dictionary.",
    enable: "Notify me when my child looks up a word",
    instant: "Every word", instantSub: "A notification the moment they look one up.",
    daily: "Daily summary", dailySub: "One notification at the end of the day.",
    pushOn: "Phone alerts are on for this device.",
    pushUnavailable: "This device can't show a phone banner, but you'll still get emails.",
    emailNote: "Sent to your account email, and as a phone banner when available.",
    enableHere: "Turn on alerts on this device",
    enableHereHint: "Each phone or computer needs to be turned on once. Tap here on your phone (opened from the home screen) to get the banner there too.",
  },
  he: {
    title: "התראות על מילים",
    sub: "קבלו התראה כשהילד מחפש מילה במילון.",
    enable: "הודיעו לי כשהילד מחפש מילה",
    instant: "כל מילה", instantSub: "התראה ברגע שהילד מחפש מילה.",
    daily: "סיכום יומי", dailySub: "התראה אחת בסוף היום.",
    pushOn: "התראות לטלפון פעילות במכשיר הזה.",
    pushUnavailable: "המכשיר הזה לא יכול להציג באנר, אבל עדיין תקבלו אימיילים.",
    emailNote: "נשלח למייל של החשבון, וכבאנר בטלפון כשאפשר.",
    enableHere: "הפעל התראות במכשיר הזה",
    enableHereHint: "כל טלפון או מחשב צריך הפעלה פעם אחת. פתח את Gadit מהמסך הבית בטלפון ולחץ כאן כדי לקבל את הבאנר גם שם.",
  },
};

function NotifSettings({
  user,
  lang,
  dir,
}: {
  user: { getIdToken: () => Promise<string> } | null;
  lang: string;
  dir: "ltr" | "rtl";
}) {
  const t = NOTIF_COPY[lang] ?? NOTIF_COPY.en;
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"instant" | "daily">("instant");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  // The real on/off value only arrives after the notify-prefs fetch. Until
  // then the switch must NOT render a definitive OFF that then snaps ON when
  // the fetch lands (Gadi 2026-08-16: the toggle looked unstable, flashing
  // closed then opening). We gate the switch on `loaded` and mount it fresh,
  // so it appears already in its true state with no self-animating flip.
  const [loaded, setLoaded] = useState(false);
  // Whether THIS device has a live push subscription (null = still
  // checking). Push subscriptions are per-device, so a phone can need
  // turning on even when alerts are already enabled from a laptop.
  const [localSubscribed, setLocalSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sub = await hasLocalPushSubscription();
      if (!cancelled) setLocalSubscribed(sub);
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const res = await fetch("/api/family/notify-prefs", {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (res.ok && !cancelled) {
            const data = await res.json();
            if (data?.prefs) {
              setEnabled(!!data.prefs.enabled);
              setMode(data.prefs.mode === "daily" ? "daily" : "instant");
            }
          }
        } catch {
          /* nice-to-have */
        }
      }
      // Always resolve the loading gate, even for signed-out or failed
      // fetches, so the switch renders its (default OFF) state cleanly.
      if (!cancelled) setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  async function enableThisDevice() {
    if (!user || busy) return;
    setBusy(true);
    setNote("");
    try {
      const idToken = await user.getIdToken();
      const r = await enableOwnerPush(idToken);
      if (r.ok) {
        setLocalSubscribed(true);
        setNote(t.pushOn);
      } else {
        setNote(t.pushUnavailable);
      }
    } finally {
      setBusy(false);
    }
  }

  async function savePrefs(nextEnabled: boolean, nextMode: "instant" | "daily") {
    if (!user) return;
    const idToken = await user.getIdToken();
    await fetch("/api/family/notify-prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      // lang travels with every save so alerts always match the parent's
      // current language, even if they switch it later.
      body: JSON.stringify({ enabled: nextEnabled, mode: nextMode, lang }),
    });
  }

  async function onToggle() {
    if (!user || busy) return;
    setBusy(true);
    setNote("");
    try {
      if (!enabled) {
        const idToken = await user.getIdToken();
        const r = await enableOwnerPush(idToken);
        setNote(r.ok ? t.pushOn : t.pushUnavailable);
        setLocalSubscribed(r.ok);
        await savePrefs(true, mode); // email fallback works even if push didn't
        setEnabled(true);
      } else {
        await savePrefs(false, mode);
        const idToken = await user.getIdToken();
        await disableOwnerPush(idToken);
        setEnabled(false);
        setLocalSubscribed(false);
        setNote("");
      }
    } finally {
      setBusy(false);
    }
  }

  async function pickMode(m: "instant" | "daily") {
    if (busy || m === mode) return;
    setMode(m);
    if (enabled) await savePrefs(enabled, m);
  }

  const TEAL = "#0EA5A5";
  return (
    <div
      dir={dir}
      style={{
        background: "#fff",
        border: "1px solid #E7E5E4",
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 14,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, color: "#1C1917" }}>{t.title}</div>
      <div style={{ fontSize: 13, color: "#78716C", marginTop: 3, lineHeight: 1.6 }}>{t.sub}</div>

      <label
        style={{
          display: "flex", alignItems: "center", gap: 12, marginTop: 14,
          cursor: busy || !loaded ? "default" : "pointer",
        }}
      >
        {!loaded ? (
          // Loading placeholder — dimmed, non-interactive, so no false OFF
          // flashes before the real value lands.
          <span
            role="switch"
            aria-checked={false}
            aria-busy="true"
            style={{
              flex: "0 0 auto", width: 44, height: 26, borderRadius: 999,
              background: "#E7E5E4", position: "relative", opacity: 0.5,
              cursor: "default",
            }}
          >
            <span
              style={{
                position: "absolute", top: 3, insetInlineStart: 3,
                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              }}
            />
          </span>
        ) : (
          <span
            role="switch"
            aria-checked={enabled}
            onClick={onToggle}
            style={{
              flex: "0 0 auto", width: 44, height: 26, borderRadius: 999,
              background: enabled ? TEAL : "#D6D3D1", position: "relative",
              transition: "background 160ms ease", opacity: busy ? 0.6 : 1,
            }}
          >
            <span
              style={{
                position: "absolute", top: 3, insetInlineStart: enabled ? 21 : 3,
                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                transition: "inset-inline-start 160ms ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              }}
            />
          </span>
        )}
        <span style={{ fontSize: 14, fontWeight: 600, color: "#292524" }}>{t.enable}</span>
      </label>

      {enabled && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {(["instant", "daily"] as const).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => pickMode(m)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10, textAlign: "start",
                  padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                  border: `1.5px solid ${active ? TEAL : "#E7E5E4"}`,
                  background: active ? "rgba(14,165,165,0.06)" : "#fff",
                }}
              >
                <span
                  style={{
                    flex: "0 0 auto", marginTop: 2, width: 16, height: 16, borderRadius: "50%",
                    border: `4px solid ${active ? TEAL : "#D6D3D1"}`,
                    background: "#fff", boxSizing: "border-box",
                  }}
                />
                <span>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#292524" }}>
                    {m === "instant" ? t.instant : t.daily}
                  </span>
                  <span style={{ display: "block", fontSize: 12.5, color: "#78716C", marginTop: 1 }}>
                    {m === "instant" ? t.instantSub : t.dailySub}
                  </span>
                </span>
              </button>
            );
          })}
          {localSubscribed === false && (
            <div style={{ marginTop: 6 }}>
              <button
                type="button"
                onClick={enableThisDevice}
                disabled={busy}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10, cursor: busy ? "default" : "pointer",
                  border: "1.5px solid #0EA5A5", background: "rgba(14,165,165,0.06)",
                  color: "#0E7490", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                }}
              >
                🔔 {t.enableHere}
              </button>
              <div style={{ fontSize: 12, color: "#A8A29E", marginTop: 6, lineHeight: 1.6 }}>
                {t.enableHereHint}
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, color: "#A8A29E", marginTop: 2 }}>
            {note || t.emailNote}
          </div>
        </div>
      )}
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}
.fam-dash-card {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.09);
  border-radius: 22px;
  padding: 24px 24px 22px;
  box-shadow: 0 8px 24px rgba(31,41,55,0.06);
}
.fam-dash-head { display: flex; align-items: center; gap: 13px; margin-bottom: 18px; }
.fam-dash-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  color: #fff; font-weight: 800; font-size: 20px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  overflow: hidden;
}
.fam-dash-avatar img { width: 100%; height: 100%; object-fit: cover; }
.fam-dash-name { font-weight: 800; font-size: 17px; color: #1f2937; }
.fam-dash-role { font-size: 13px; color: #9ca3af; }
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
/* Hero number: words in the notebook. */
.fam-dash-hero { display: flex; align-items: baseline; gap: 9px; }
.fam-dash-num { font-size: 40px; font-weight: 800; color: #0b7d7d; line-height: 1; }
.fam-dash-label { font-size: 13.5px; color: #6b7280; font-weight: 600; }
/* One consistent badge row (streak / rank / this week), evenly weighted. */
.fam-dash-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.fam-dash-badge {
  display: inline-flex; align-items: center; gap: 6px;
  border-radius: 999px; padding: 7px 13px;
  font-size: 13px; font-weight: 700; white-space: nowrap;
}
.fam-dash-badge-streak { background: rgba(245,158,11,0.13); color: #b45309; }
.fam-dash-badge-rank   { background: rgba(124,58,237,0.11); color: #6d28d9; }
.fam-dash-badge-week   { background: rgba(14,165,165,0.12); color: #0f766e; }
.fam-dash-recent { margin-top: 18px; border-top: 1px dashed rgba(31,41,55,0.12); padding-top: 14px; }
.fam-dash-recent-label { font-size: 12px; color: #9ca3af; font-weight: 700; margin-bottom: 8px; }
.fam-dash-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.fam-dash-chip {
  background: rgba(14,165,165,0.09); color: #374151;
  border-radius: 999px; padding: 5px 12px;
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
