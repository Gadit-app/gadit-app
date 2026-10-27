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

import { AppIntentPing } from "@/components/AppIntentPing";
import { WaitText, WaitDots } from "@/components/WaitText";
import { useEffect, useState } from "react";
import { familyUi } from "@/lib/family-ui-i18n";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { BackLink } from "@/components/BackLink";
import { DuelPermission } from "@/components/play/duel/DuelPermission";
import { learnCopy } from "@/components/play/learn/learn-i18n";
import { LANGUAGES } from "@/lib/i18n";
import { FamilySetupChecklist } from "./FamilySetupChecklist";
import { ageLabelFor } from "./add/FamilyAddClient";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { CoachesSection } from "@/components/design/CoachesSection";
import { FamilyLeaderboard } from "@/components/design/FamilyLeaderboard";
import { enableOwnerPush, disableOwnerPush, hasLocalPushSubscription } from "@/lib/push-client";
import { db } from "@/lib/firebase";
import {
  FamilyMember,
  Family,
  isParentRole,
  memberColorFor,
  MAX_KIDS_PER_FAMILY,
  kidLimitFor,
  avatarsForRole,
  avatarUrl,
  type MemberRole,
} from "@/lib/family";
import { type RankKey } from "@/lib/gamification";
import { rankLabel, gameCopy } from "@/lib/gamification-labels";
import { playNotActive } from "@/lib/play-copy";
import { ChildLearnSetting, type LearnSetup } from "./ChildLearnSetting";

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
    back: "→ بازگشت",
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
  xh: {
    title: "Usapho lwakho",
    sub: "Ilungu ngalinye losapho ngumsebenzisi ngokwakhe, onencwadi yakhe nembali yakhe.",
    add: "+ Yongeza",
    parents: "Abazali",
    children: "Abantwana",
    empty: "Akukabikho malungu osapho. Qalisa ngokongeza umntwana wakho wokuqala.",
    pair: "Dibanisa isixhobo",
    revoke: "Qhawula unxibelelwano",
    paired: "Kudityanisiwe",
    owner: "Umnini",
    notReady: "Kufuneka umrhumo we-Family ukuze ulawule amalungu.",
    goPricing: "Jonga amaxabiso",
    welcome: "Wamkelekile kwi-Family! Yongeza amalungu akho ukuze uqalise.",
    back: "← Buyela umva",
    capReached: `Ufikelele kumda wabantwana aba-${MAX_KIDS_PER_FAMILY} kwisicwangciso se-Family.`,
  },
  nso: {
    title: "Lapa la gago",
    sub: "Leloko le lengwe le le lengwe la lapa ke modiriši wa gagwe, a na le puku ya gagwe ya mantšu le histori ya gagwe.",
    add: "+ Oketša",
    parents: "Batswadi",
    children: "Bana",
    empty: "Ga go eso be le maloko a lapa. Thoma ka go oketša ngwana wa gago wa mathomo.",
    pair: "Kopanya sedirišwa",
    revoke: "Aroganya",
    paired: "Se kopantšwe",
    owner: "Mong",
    notReady: "Peeletšo ya Family e a nyakega gore o laole maloko.",
    goPricing: "Bona ditheko",
    welcome: "O amogelwa go Family! Oketša maloko a gago gore le thome.",
    back: "← Morago",
    capReached: `O fihlile mollwaneng wa bana ba ${MAX_KIDS_PER_FAMILY} lenaneong la Family.`,
  },
  tn: {
    title: "Lelapa la gago",
    sub: "Leloko lengwe le lengwe la lelapa ke modirisi ka boene, yo o nang le bukana le hisitori ya gagwe.",
    add: "+ Tsenya",
    parents: "Batsadi",
    children: "Bana",
    empty: "Ga go ise go nne le maloko a lelapa. Simolola ka go tsenya ngwana wa gago wa ntlha.",
    pair: "Golaganya sedirisiwa",
    revoke: "Kgaola kgolagano",
    paired: "Se golagantswe",
    owner: "Mong",
    notReady: "Ikwadiso ya Family e a tlhokega go laola maloko.",
    goPricing: "Bona ditlhwatlhwa",
    welcome: "O amogelesegile mo Family! Tsenya maloko a gago go simolola.",
    back: "← Morago",
    capReached: `O fitlhile kwa selekanyong sa bana ba le ${MAX_KIDS_PER_FAMILY} mo leanong la Family.`,
  },
  st: {
    title: "Lelapa la Hao",
    sub: "Setho se seng le se seng sa lelapa ke mosebedisi wa sona, se na le bukana ya sona le nalane ya sona.",
    add: "+ Kenya",
    parents: "Batswadi",
    children: "Bana",
    empty: "Ha ho ditho tsa lelapa hajwale. Qala ka ho kenya ngwana wa hao wa pele.",
    pair: "Hokela sesebediswa",
    revoke: "Kgaola",
    paired: "Se hokahantswe",
    owner: "Mong",
    notReady: "Ngodiso ya Family ya hlokahala ho laola ditho.",
    goPricing: "Sheba ditheko",
    welcome: "Re a o amohela ho Family! Kenya ditho tsa hao ho qala.",
    back: "← Morao",
    capReached: `O fihlile moeling wa bana ba ${MAX_KIDS_PER_FAMILY} moralong wa Family.`,
  },
  ts: {
    title: "Ndyangu wa n'wina",
    sub: "Xirho xin'wana na xin'wana xa ndyangu i mutirhisi hi xoxe, xi ri na buku ya xona ya marito na matimu ya xona.",
    add: "+ Engetela",
    parents: "Vatswari",
    children: "Vana",
    empty: "A ku si va na swirho swa ndyangu. Sungulani hi ku engetela n'wana wa n'wina wo sungula.",
    pair: "Hlanganisa xitirhisiwa",
    revoke: "Hambanisa",
    paired: "Xi hlanganisiwile",
    owner: "N'wini",
    notReady: "Mbhaliso wa Family wa laveka leswaku mi lawula swirho.",
    goPricing: "Vona minxavo",
    welcome: "Mi amukeriwile eka Family! Engetelani swirho swa n'wina leswaku mi sungula.",
    back: "← Endzhaku",
    capReached: `Mi fikile eka ndzilakano wa vana va ${MAX_KIDS_PER_FAMILY} eka pulani ya Family.`,
  },
  ss: {
    title: "Umndeni Wakho",
    sub: "Lilunga ngalinye lemndeni ngumsebentisi lotimele, lonencwadzi yakhe nemlandvo wakhe.",
    add: "+ Engeta",
    parents: "Batali",
    children: "Bantfwana",
    empty: "Kute emalunga emndeni okwamanje. Cala ngekwengeta umntfwana wakho wekucala.",
    pair: "Xhuma lithuluzi",
    revoke: "Khipha kuxhuma",
    paired: "Kuxhunyiwe",
    owner: "Umnikati",
    notReady: "Kudzingeka kubhalisa kwe-Family kute uphatse emalunga.",
    goPricing: "Buka emanani",
    welcome: "Wemukelekile ku-Family! Engeta emalunga akho kute ucale.",
    back: "← Emuva",
    capReached: `Sewufike emkhawulweni webantfwana labangu-${MAX_KIDS_PER_FAMILY} kulihlelo le-Family.`,
  },
  ve: {
    title: "Muṱa waṋu",
    sub: "Muraḓo muṅwe na muṅwe wa muṱa ndi mushumisi wawe, u na bugu yawe na zwe a ṱoḓa.",
    add: "+ Engedzani",
    parents: "Vhabebi",
    children: "Vhana",
    empty: "A hu athu u vha na miraḓo ya muṱa. Thomani nga u engedza ṅwana waṋu wa u thoma.",
    pair: "Ṱumanyani tshishumiswa",
    revoke: "Khaulani",
    paired: "Zwo ṱumanywa",
    owner: "Muṋe",
    notReady: "Ṅwaliso wa Family u a ṱoḓea uri ni lange miraḓo.",
    goPricing: "Vhonani mitengo",
    welcome: "Ri a ni ṱanganedza kha Family! Engedzani miraḓo yaṋu uri ni thome.",
    back: "← Murahu",
    capReached: `No swikela mukano wa vhana vha ${MAX_KIDS_PER_FAMILY} kha pulane ya Family.`,
  },
  nr: {
    title: "Umndeni Wakho",
    sub: "Ilunga ngalinye lomndeni msebenzisi ngokwalo, linebhuku lalo lamezwi nomlando walo.",
    add: "+ Faka",
    parents: "Ababelethi",
    children: "Abantwana",
    empty: "Akukabikhona amalunga womndeni. Thoma ngokufaka umntwana wakho wokuthoma.",
    pair: "Hlanganisa idivayisi",
    revoke: "Khipha ukuhlanganiswa",
    paired: "Kuhlanganisiwe",
    owner: "Umnikazi",
    notReady: "Kutlhogeka ukubhalisela kwe-Family bona ulawule amalunga.",
    goPricing: "Bona amanani",
    welcome: "Wamukelekile ku-Family! Faka amalunga wakho bona uthome.",
    back: "← Emuva",
    capReached: `Ufikile emkhawulweni wabantwana abali-${MAX_KIDS_PER_FAMILY} ehlelweni le-Family.`,
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
  vi: {
    title: "Gia đình của bạn",
    sub: "Mỗi thành viên trong gia đình là một người dùng riêng, có sổ tay và lịch sử riêng.",
    add: "+ Thêm",
    parents: "Phụ huynh",
    children: "Con",
    empty: "Chưa có thành viên nào. Hãy bắt đầu bằng cách thêm con đầu tiên.",
    pair: "Ghép nối thiết bị",
    revoke: "Hủy ghép nối",
    paired: "Đã ghép nối",
    owner: "Chủ tài khoản",
    notReady: "Cần gói Family để quản lý thành viên.",
    goPricing: "Xem bảng giá",
    welcome: "Chào mừng đến với Family! Hãy thêm các thành viên để bắt đầu.",
    back: "← Quay lại",
    capReached: `Bạn đã đạt giới hạn ${MAX_KIDS_PER_FAMILY} con trong gói Family.`,
  },
  fil: {
    title: "Ang Iyong Pamilya",
    sub: "Bawat miyembro ng pamilya ay may sariling user, may sariling notebook at history.",
    add: "+ Idagdag",
    parents: "Mga Magulang",
    children: "Mga Anak",
    empty: "Wala pang miyembro ng pamilya. Magsimula sa pagdagdag ng iyong unang anak.",
    pair: "I-pair ang device",
    revoke: "I-unpair",
    paired: "Naka-pair",
    owner: "May-ari",
    notReady: "Kailangan ng Family subscription para pamahalaan ang mga miyembro.",
    goPricing: "Tingnan ang presyo",
    welcome: "Maligayang pagdating sa Family! Idagdag ang iyong mga miyembro para magsimula.",
    back: "← Bumalik",
    capReached: `Naabot mo na ang limitasyong ${MAX_KIDS_PER_FAMILY} anak sa Family plan.`,
  },
  af: {
    title: "Jou gesin",
    sub: "Elke gesinslid is 'n eie gebruiker, met 'n eie notaboek en geskiedenis.",
    add: "+ Voeg by",
    parents: "Ouers",
    children: "Kinders",
    empty: "Nog geen gesinslede nie. Begin deur jou eerste kind by te voeg.",
    pair: "Koppel toestel",
    revoke: "Ontkoppel",
    paired: "Gekoppel",
    owner: "Eienaar",
    notReady: "'n Family-intekening is nodig om lede te bestuur.",
    goPricing: "Sien pryse",
    welcome: "Welkom by Family! Voeg jou gesinslede by om te begin.",
    back: "← Terug",
    capReached: `Jy het die maksimum van ${MAX_KIDS_PER_FAMILY} kinders op die Family-plan bereik.`,
  },
  sw: {
    title: "Familia Yako",
    sub: "Kila mwanafamilia ni mtumiaji wake mwenyewe, akiwa na daftari na historia yake.",
    add: "+ Ongeza",
    parents: "Wazazi",
    children: "Watoto",
    empty: "Bado hakuna wanafamilia. Anza kwa kumwongeza mtoto wako wa kwanza.",
    pair: "Unganisha kifaa",
    revoke: "Tenganisha",
    paired: "Imeunganishwa",
    owner: "Mmiliki",
    notReady: "Usajili wa Family unahitajika ili kusimamia wanafamilia.",
    goPricing: "Angalia bei",
    welcome: "Karibu Family! Ongeza wanafamilia wako ili kuanza.",
    back: "← Rudi",
    capReached: `Umefikia kikomo cha watoto ${MAX_KIDS_PER_FAMILY} kwenye mpango wa Family.`,
  },
  "zh-CN": {
    title: "你的家庭",
    sub: "每位家庭成员都是独立用户，拥有自己的单词本和记录。",
    add: "+ 添加",
    parents: "家长",
    children: "孩子",
    empty: "还没有家庭成员。先添加你的第一个孩子吧。",
    pair: "配对设备",
    revoke: "取消配对",
    paired: "已配对",
    owner: "账户所有者",
    notReady: "管理成员需要 Family 订阅。",
    goPricing: "查看价格",
    welcome: "欢迎使用 Family！添加家庭成员即可开始。",
    back: "← 返回",
    capReached: `Family 方案最多可添加 ${MAX_KIDS_PER_FAMILY} 个孩子，你已达到上限。`,
  },
  "zh-TW": {
    title: "你的家庭",
    sub: "每位家庭成員都是獨立使用者，擁有自己的單字本和紀錄。",
    add: "+ 新增",
    parents: "家長",
    children: "孩子",
    empty: "還沒有家庭成員。先新增你的第一個孩子吧。",
    pair: "配對裝置",
    revoke: "取消配對",
    paired: "已配對",
    owner: "帳戶擁有者",
    notReady: "管理成員需要 Family 訂閱。",
    goPricing: "查看價格",
    welcome: "歡迎使用 Family！新增家庭成員即可開始。",
    back: "← 返回",
    capReached: `Family 方案最多可新增 ${MAX_KIDS_PER_FAMILY} 個孩子，你已達到上限。`,
  },
  ko: {
    title: "우리 가족",
    sub: "가족 구성원마다 각자의 사용자로, 자신만의 단어장과 기록을 가져요.",
    add: "+ 추가",
    parents: "부모",
    children: "자녀",
    empty: "아직 가족 구성원이 없어요. 첫 자녀를 추가해 시작해 보세요.",
    pair: "기기 연결",
    revoke: "연결 해제",
    paired: "연결됨",
    owner: "소유자",
    notReady: "구성원을 관리하려면 Family 구독이 필요해요.",
    goPricing: "요금 보기",
    welcome: "Family에 오신 것을 환영해요! 가족 구성원을 추가해 시작하세요.",
    back: "← 뒤로",
    capReached: `Family 요금제의 자녀 최대 인원(${MAX_KIDS_PER_FAMILY}명)에 도달했어요.`,
  },
  th: {
    title: "ครอบครัวของคุณ",
    sub: "สมาชิกแต่ละคนในครอบครัวเป็นผู้ใช้ของตัวเอง มีสมุดคำศัพท์และประวัติของตัวเอง",
    add: "+ เพิ่ม",
    parents: "ผู้ปกครอง",
    children: "ลูก ๆ",
    empty: "ยังไม่มีสมาชิกในครอบครัว เริ่มต้นด้วยการเพิ่มลูกคนแรกของคุณ",
    pair: "จับคู่อุปกรณ์",
    revoke: "ยกเลิกการจับคู่",
    paired: "จับคู่แล้ว",
    owner: "เจ้าของบัญชี",
    notReady: "ต้องสมัครสมาชิก Family เพื่อจัดการสมาชิก",
    goPricing: "ดูราคา",
    welcome: "ยินดีต้อนรับสู่ Family! เพิ่มสมาชิกในครอบครัวเพื่อเริ่มต้น",
    back: "← ย้อนกลับ",
    capReached: `คุณเพิ่มลูกครบ ${MAX_KIDS_PER_FAMILY} คนตามขีดจำกัดของแพ็กเกจ Family แล้ว`,
  },
  bn: {
    title: "আপনার পরিবার",
    sub: "পরিবারের প্রত্যেক সদস্য আলাদা ব্যবহারকারী, নিজের নোটবুক আর ইতিহাস সহ।",
    add: "+ যোগ করুন",
    parents: "অভিভাবক",
    children: "সন্তান",
    empty: "এখনো পরিবারের কোনো সদস্য নেই। আপনার প্রথম সন্তানকে যোগ করে শুরু করুন।",
    pair: "ডিভাইস যুক্ত করুন",
    revoke: "সংযোগ বাতিল",
    paired: "যুক্ত",
    owner: "মালিক",
    notReady: "সদস্যদের পরিচালনা করতে Family সাবস্ক্রিপশন প্রয়োজন।",
    goPricing: "মূল্য দেখুন",
    welcome: "Family-তে স্বাগতম! শুরু করতে পরিবারের সদস্যদের যোগ করুন।",
    back: "← ফিরে যান",
    capReached: `Family প্ল্যানে সর্বোচ্চ ${MAX_KIDS_PER_FAMILY} জন সন্তান যোগ করা যায়, আপনি সেই সীমায় পৌঁছেছেন।`,
  },
  da: {
    title: "Din familie",
    sub: "Hvert familiemedlem er sin egen bruger, med sin egen notesbog og historik.",
    add: "+ Tilføj",
    parents: "Forældre",
    children: "Børn",
    empty: "Ingen familiemedlemmer endnu. Start med at tilføje dit første barn.",
    pair: "Par enhed",
    revoke: "Fjern parring",
    paired: "Parret",
    owner: "Ejer",
    notReady: "Et Family-abonnement er påkrævet for at administrere medlemmer.",
    goPricing: "Se priser",
    welcome: "Velkommen til Family! Tilføj dine medlemmer for at komme i gang.",
    back: "← Tilbage",
    capReached: `Du har nået grænsen på ${MAX_KIDS_PER_FAMILY} børn i Family-abonnementet.`,
  },
  hu: {
    title: "A családod",
    sub: "Minden családtag külön felhasználó, saját füzettel és előzményekkel.",
    add: "+ Hozzáadás",
    parents: "Szülők",
    children: "Gyerekek",
    empty: "Még nincsenek családtagok. Kezdd az első gyereked hozzáadásával.",
    pair: "Eszköz párosítása",
    revoke: "Párosítás megszüntetése",
    paired: "Párosítva",
    owner: "Tulajdonos",
    notReady: "A tagok kezeléséhez Family előfizetés szükséges.",
    goPricing: "Árak megtekintése",
    welcome: "Üdv a Family csomagban! Add hozzá a családtagokat a kezdéshez.",
    back: "← Vissza",
    capReached: `Elérted a Family csomag korlátját: legfeljebb ${MAX_KIDS_PER_FAMILY} gyerek.`,
  },
};

const ROLE_LABEL: Record<string, Record<"father" | "mother" | "boy" | "girl", string>> = {
  fr: { father: "Papa", mother: "Maman", boy: "Fils", girl: "Fille" },
  es: { father: "Papá", mother: "Mamá", boy: "Hijo", girl: "Hija" },
  pt: { father: "Pai", mother: "Mãe", boy: "Filho", girl: "Filha" },
  it: { father: "Papà", mother: "Mamma", boy: "Figlio", girl: "Figlia" },
  de: { father: "Papa", mother: "Mama", boy: "Sohn", girl: "Tochter" },
  nl: { father: "Papa", mother: "Mama", boy: "Zoon", girl: "Dochter" },
  cs: { father: "Táta", mother: "Máma", boy: "Syn", girl: "Dcera" },
  sk: { father: "Ocko", mother: "Mamka", boy: "Syn", girl: "Dcéra" },
  uk: { father: "Тато", mother: "Мама", boy: "Син", girl: "Донька" },
  pl: { father: "Tata", mother: "Mama", boy: "Syn", girl: "Córka" },
  tr: { father: "Baba", mother: "Anne", boy: "Oğul", girl: "Kız" },
  ja: { father: "お父さん", mother: "お母さん", boy: "息子", girl: "娘" },
  fa: { father: "بابا", mother: "مامان", boy: "پسر", girl: "دختر" },
  id: { father: "Ayah", mother: "Ibu", boy: "Putra", girl: "Putri" },
  he: { father: "אבא", mother: "אמא", boy: "בן", girl: "בת" },
  en: { father: "Dad", mother: "Mom", boy: "Son", girl: "Daughter" },
  zu: { father: "Ubaba", mother: "Umama", boy: "Indodana", girl: "Indodakazi" },
  xh: { father: "Utata", mother: "Umama", boy: "Unyana", girl: "Intombi" },
  nso: { father: "Tate", mother: "Mma", boy: "Morwa", girl: "Morwedi" },
  tn: { father: "Rre", mother: "Mme", boy: "Morwa", girl: "Morwadi" },
  st: { father: "Ntate", mother: "Mme", boy: "Mora", girl: "Moradi" },
  ts: { father: "Tatana", mother: "Manana", boy: "N'wana wa jaha", girl: "N'wana wa nhwanyana" },
  ss: { father: "Babe", mother: "Make", boy: "Indvodzana", girl: "Indvodzakati" },
  ve: { father: "Khotsi", mother: "Mme", boy: "Murwa", girl: "Ṅwananyana" },
  nr: { father: "Ubaba", mother: "Umma", boy: "Indodana", girl: "Indodakazi" },
  el: { father: "Μπαμπάς", mother: "Μαμά", boy: "Γιος", girl: "Κόρη" },
  ru: { father: "Папа", mother: "Мама", boy: "Сын", girl: "Дочь" },
  hi: { father: "पापा", mother: "मम्मी", boy: "बेटा", girl: "बेटी" },
  am: { father: "አባት", mother: "እናት", boy: "ወንድ ልጅ", girl: "ሴት ልጅ" },
  ar: { father: "أبي", mother: "أمي", boy: "ابن", girl: "ابنة" },
  vi: { father: "Bố", mother: "Mẹ", boy: "Con trai", girl: "Con gái" },
  fil: { father: "Tatay", mother: "Nanay", boy: "Anak na lalaki", girl: "Anak na babae" },
  af: { father: "Pa", mother: "Ma", boy: "Seun", girl: "Dogter" },
  sw: { father: "Baba", mother: "Mama", boy: "Mwana wa kiume", girl: "Binti" },
  "zh-CN": { father: "爸爸", mother: "妈妈", boy: "儿子", girl: "女儿" },
  "zh-TW": { father: "爸爸", mother: "媽媽", boy: "兒子", girl: "女兒" },
  ko: { father: "아빠", mother: "엄마", boy: "아들", girl: "딸" },
  th: { father: "พ่อ", mother: "แม่", boy: "ลูกชาย", girl: "ลูกสาว" },
  bn: { father: "বাবা", mother: "মা", boy: "ছেলে", girl: "মেয়ে" },
  da: { father: "Far", mother: "Mor", boy: "Søn", girl: "Datter" },
  hu: { father: "Apa", mother: "Anya", boy: "Fiú", girl: "Lány" },
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
  learning?: { lang: "en" | "he"; learnedWeek: number; learnedTotal: number; reinforce: number; list: { total: number; ready: number; testDate: string | null } | null } | null;
  /** The learning setting the parent can change (2026-10-22). */
  learnSetup?: LearnSetup;
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
  fr: {
    title: "Les progrès de vos enfants",
    sub: "Combien de mots chaque enfant a appris, et combien ont été ajoutés cette semaine. Regardez le vocabulaire s'enrichir.",
    familyTotal: "mots dans les carnets de la famille",
    weekTotal: "nouveaux mots cette semaine",
    wordsInNotebook: "mots dans le carnet",
    thisWeek: "cette semaine",
    recentWords: "Mots récents",
    notLinked: "L'appareil de cet enfant n'est pas encore relié. Associez-le pour voir ses progrès.",
    pairCta: "Associer l'appareil",
    noneYet: "Aucun mot dans le carnet pour l'instant. Dès que votre enfant commence à chercher des mots, ils apparaissent ici.",
    loading: "Chargement des progrès...",
  },
  es: {
    title: "El progreso de tus hijos",
    sub: "Cuántas palabras ha aprendido cada hijo y cuántas se añadieron esta semana. Mira cómo crece el vocabulario.",
    familyTotal: "palabras en los cuadernos de la familia",
    weekTotal: "palabras nuevas esta semana",
    wordsInNotebook: "palabras en el cuaderno",
    thisWeek: "esta semana",
    recentWords: "Palabras recientes",
    notLinked: "El dispositivo de este hijo aún no está vinculado. Vincúlalo para ver su progreso.",
    pairCta: "Vincular dispositivo",
    noneYet: "Aún no hay palabras en el cuaderno. En cuanto tu hijo empiece a buscar palabras, aparecerán aquí.",
    loading: "Cargando el progreso...",
  },
  pt: {
    title: "O progresso dos seus filhos",
    sub: "Quantas palavras cada filho aprendeu e quantas foram adicionadas esta semana. Veja o vocabulário crescer.",
    familyTotal: "palavras nos cadernos da família",
    weekTotal: "palavras novas esta semana",
    wordsInNotebook: "palavras no caderno",
    thisWeek: "esta semana",
    recentWords: "Palavras recentes",
    notLinked: "O dispositivo deste filho ainda não está vinculado. Vincule-o para ver o progresso dele.",
    pairCta: "Vincular dispositivo",
    noneYet: "Ainda não há palavras no caderno. Assim que o seu filho começar a procurar palavras, elas aparecem aqui.",
    loading: "A carregar o progresso...",
  },
  it: {
    title: "I progressi dei tuoi figli",
    sub: "Quante parole ha imparato ogni figlio e quante ne sono state aggiunte questa settimana. Guarda crescere il vocabolario.",
    familyTotal: "parole nei quaderni della famiglia",
    weekTotal: "parole nuove questa settimana",
    wordsInNotebook: "parole nel quaderno",
    thisWeek: "questa settimana",
    recentWords: "Parole recenti",
    notLinked: "Il dispositivo di questo figlio non è ancora collegato. Collegalo per vedere i suoi progressi.",
    pairCta: "Collega il dispositivo",
    noneYet: "Ancora nessuna parola nel quaderno. Appena tuo figlio inizia a cercare parole, compaiono qui.",
    loading: "Caricamento dei progressi...",
  },
  de: {
    title: "Der Fortschritt deiner Kinder",
    sub: "Wie viele Wörter jedes Kind gelernt hat und wie viele diese Woche dazugekommen sind. Sieh dem Wortschatz beim Wachsen zu.",
    familyTotal: "Wörter in den Notizbüchern der Familie",
    weekTotal: "neue Wörter diese Woche",
    wordsInNotebook: "Wörter im Notizbuch",
    thisWeek: "diese Woche",
    recentWords: "Neueste Wörter",
    notLinked: "Das Gerät dieses Kindes ist noch nicht verknüpft. Verbinde es, um den Fortschritt zu sehen.",
    pairCta: "Gerät verbinden",
    noneYet: "Noch keine Wörter im Notizbuch. Sobald dein Kind Wörter nachschlägt, erscheinen sie hier.",
    loading: "Fortschritt wird geladen...",
  },
  nl: {
    title: "De vooruitgang van je kinderen",
    sub: "Hoeveel woorden elk kind heeft geleerd, en hoeveel er deze week zijn bijgekomen. Zie de woordenschat groeien.",
    familyTotal: "woorden in de notitieboekjes van het gezin",
    weekTotal: "nieuwe woorden deze week",
    wordsInNotebook: "woorden in notitieboekje",
    thisWeek: "deze week",
    recentWords: "Recente woorden",
    notLinked: "Het apparaat van dit kind is nog niet gekoppeld. Koppel het om de vooruitgang te zien.",
    pairCta: "Apparaat koppelen",
    noneYet: "Nog geen woorden in het notitieboekje. Zodra je kind woorden gaat opzoeken, verschijnen ze hier.",
    loading: "Vooruitgang laden...",
  },
  cs: {
    title: "Pokrok vašich dětí",
    sub: "Kolik slov se každé dítě naučilo a kolik jich přibylo tento týden. Sledujte, jak slovní zásoba roste.",
    familyTotal: "slov v poznámkových blocích rodiny",
    weekTotal: "nových slov tento týden",
    wordsInNotebook: "slov v poznámkovém bloku",
    thisWeek: "tento týden",
    recentWords: "Poslední slova",
    notLinked: "Zařízení tohoto dítěte ještě není propojené. Spárujte ho, abyste viděli jeho pokrok.",
    pairCta: "Spárovat zařízení",
    noneYet: "V poznámkovém bloku zatím nejsou žádná slova. Jakmile vaše dítě začne vyhledávat slova, objeví se zde.",
    loading: "Načítání pokroku...",
  },
  sk: {
    title: "Pokrok vašich detí",
    sub: "Koľko slov sa každé dieťa naučilo a koľko ich pribudlo tento týždeň. Sledujte, ako slovná zásoba rastie.",
    familyTotal: "slov v poznámkových blokoch rodiny",
    weekTotal: "nových slov tento týždeň",
    wordsInNotebook: "slov v poznámkovom bloku",
    thisWeek: "tento týždeň",
    recentWords: "Posledné slová",
    notLinked: "Zariadenie tohto dieťaťa ešte nie je prepojené. Spárujte ho, aby ste videli jeho pokrok.",
    pairCta: "Spárovať zariadenie",
    noneYet: "V poznámkovom bloku zatiaľ nie sú žiadne slová. Hneď ako vaše dieťa začne vyhľadávať slová, objavia sa tu.",
    loading: "Načítava sa pokrok...",
  },
  uk: {
    title: "Успіхи ваших дітей",
    sub: "Скільки слів вивчила кожна дитина і скільки додалося цього тижня. Спостерігайте, як зростає словниковий запас.",
    familyTotal: "слів у сімейних зошитах",
    weekTotal: "нових слів цього тижня",
    wordsInNotebook: "слів у зошиті",
    thisWeek: "цього тижня",
    recentWords: "Нещодавні слова",
    notLinked: "Пристрій цієї дитини ще не підключено. Підключіть його, щоб бачити її успіхи.",
    pairCta: "Підключити пристрій",
    noneYet: "У зошиті ще немає слів. Щойно дитина почне шукати слова, вони з'являться тут.",
    loading: "Завантаження успіхів...",
  },
  pl: {
    title: "Postępy Twoich dzieci",
    sub: "Ile słów nauczyło się każde dziecko i ile dodano w tym tygodniu. Obserwuj, jak rośnie słownictwo.",
    familyTotal: "słów w rodzinnych zeszytach",
    weekTotal: "nowych słów w tym tygodniu",
    wordsInNotebook: "słów w zeszycie",
    thisWeek: "w tym tygodniu",
    recentWords: "Ostatnie słowa",
    notLinked: "Urządzenie tego dziecka nie jest jeszcze połączone. Sparuj je, aby zobaczyć postępy.",
    pairCta: "Sparuj urządzenie",
    noneYet: "W zeszycie nie ma jeszcze żadnych słów. Gdy tylko dziecko zacznie wyszukiwać słowa, pojawią się tutaj.",
    loading: "Wczytywanie postępów...",
  },
  tr: {
    title: "Çocuklarınızın ilerlemesi",
    sub: "Her çocuğun kaç kelime öğrendiğini ve bu hafta kaç kelime eklendiğini görün. Kelime dağarcığının büyümesini izleyin.",
    familyTotal: "ailenin defterlerindeki kelime",
    weekTotal: "bu hafta yeni kelime",
    wordsInNotebook: "defterdeki kelime",
    thisWeek: "bu hafta",
    recentWords: "Son kelimeler",
    notLinked: "Bu çocuğun cihazı henüz bağlı değil. İlerlemesini görmek için eşleştirin.",
    pairCta: "Cihazı eşleştir",
    noneYet: "Defterde henüz kelime yok. Çocuğunuz kelime aramaya başlar başlamaz burada görünürler.",
    loading: "İlerleme yükleniyor...",
  },
  ja: {
    title: "お子さまの学習の進み具合",
    sub: "それぞれのお子さまが覚えた単語の数と、今週新しく増えた単語の数です。語彙が育っていく様子を見守りましょう。",
    familyTotal: "家族のノートにある単語",
    weekTotal: "今週の新しい単語",
    wordsInNotebook: "ノートの単語数",
    thisWeek: "今週",
    recentWords: "最近の単語",
    notLinked: "このお子さまの端末はまだ連携されていません。ペア設定をすると進み具合を見られます。",
    pairCta: "端末をペア設定",
    noneYet: "ノートにはまだ単語がありません。お子さまが単語を調べ始めると、ここに表示されます。",
    loading: "進み具合を読み込んでいます...",
  },
  hi: {
    title: "आपके बच्चों की प्रगति",
    sub: "हर बच्चे ने कितने शब्द सीखे हैं, और इस हफ़्ते कितने नए जुड़े। उनकी शब्दावली को बढ़ते हुए देखिए।",
    familyTotal: "परिवार की नोटबुक में शब्द",
    weekTotal: "इस हफ़्ते के नए शब्द",
    wordsInNotebook: "नोटबुक में शब्द",
    thisWeek: "इस हफ़्ते",
    recentWords: "हाल के शब्द",
    notLinked: "इस बच्चे का डिवाइस अभी जुड़ा नहीं है। प्रगति देखने के लिए इसे जोड़ें।",
    pairCta: "डिवाइस जोड़ें",
    noneYet: "नोटबुक में अभी कोई शब्द नहीं है। जैसे ही आपका बच्चा शब्द खोजना शुरू करेगा, वे यहाँ दिखेंगे।",
    loading: "प्रगति लोड हो रही है...",
  },
  fa: {
    title: "پیشرفت فرزندان شما",
    sub: "هر فرزند چند واژه یاد گرفته و این هفته چند واژه‌ی تازه اضافه شده است. رشد دایره واژگان را تماشا کنید.",
    familyTotal: "واژه‌ها در دفترچه‌های خانواده",
    weekTotal: "واژه‌های تازه این هفته",
    wordsInNotebook: "واژه‌ها در دفترچه",
    thisWeek: "این هفته",
    recentWords: "واژه‌های اخیر",
    notLinked: "دستگاه این فرزند هنوز متصل نشده است. برای دیدن پیشرفت او آن را جفت کنید.",
    pairCta: "جفت‌کردن دستگاه",
    noneYet: "هنوز واژه‌ای در دفترچه نیست. به‌محض اینکه فرزندتان جست‌وجوی واژه‌ها را شروع کند، اینجا نمایان می‌شوند.",
    loading: "در حال بارگذاری پیشرفت...",
  },
  id: {
    title: "Perkembangan anak-anak Anda",
    sub: "Berapa banyak kata yang telah dipelajari setiap anak, dan berapa yang ditambahkan minggu ini. Saksikan kosakata mereka bertumbuh.",
    familyTotal: "kata di buku catatan keluarga",
    weekTotal: "kata baru minggu ini",
    wordsInNotebook: "kata di buku catatan",
    thisWeek: "minggu ini",
    recentWords: "Kata terbaru",
    notLinked: "Perangkat anak ini belum ditautkan. Pasangkan untuk melihat perkembangannya.",
    pairCta: "Pasangkan perangkat",
    noneYet: "Belum ada kata di buku catatan. Begitu anak Anda mulai mencari kata, kata-kata itu akan muncul di sini.",
    loading: "Memuat perkembangan...",
  },
  am: {
    title: "የልጆችዎ እድገት",
    sub: "እያንዳንዱ ልጅ ስንት ቃላት እንደተማረ፣ በዚህ ሳምንት ስንት እንደተጨመሩ። የቃላት ዕውቀቱ ሲያድግ ይመልከቱ።",
    familyTotal: "በቤተሰቡ ማስታወሻ ደብተሮች ውስጥ ያሉ ቃላት",
    weekTotal: "በዚህ ሳምንት አዲስ ቃላት",
    wordsInNotebook: "በማስታወሻ ደብተር ውስጥ ያሉ ቃላት",
    thisWeek: "በዚህ ሳምንት",
    recentWords: "የቅርብ ጊዜ ቃላት",
    notLinked: "የዚህ ልጅ መሣሪያ ገና አልተያያዘም። እድገቱን ለማየት ያያይዙት።",
    pairCta: "መሣሪያ ያያይዙ",
    noneYet: "በማስታወሻ ደብተሩ ውስጥ ገና ቃላት የሉም። ልጅዎ ቃላት መፈለግ እንደጀመረ፣ እዚህ ይታያሉ።",
    loading: "እድገትን በመጫን ላይ...",
  },
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
  xh: {
    title: "Inkqubela yabantwana bakho",
    sub: "Mangaphi amagama umntwana ngamnye awafundileyo, nokuba mangaphi ongezwe kule veki. Bona isigama sikhula.",
    familyTotal: "amagama asezincwadini zosapho",
    weekTotal: "amagama amatsha kule veki",
    wordsInNotebook: "amagama asencwadini",
    thisWeek: "kule veki",
    recentWords: "Amagama akutshanje",
    notLinked: "Isixhobo salo mntwana asikadityaniswa. Sidibanise ukuze ubone inkqubela yakhe.",
    pairCta: "Dibanisa isixhobo",
    noneYet: "Akukabikho magama encwadini. Kwakuba umntwana wakho eqalisa ukukhangela amagama, aza kuvela apha.",
    loading: "Silayisha inkqubela...",
  },
  nso: {
    title: "Tšwelopele ya bana ba gago",
    sub: "Ke mantšu a makae ao ngwana yo mongwe le yo mongwe a ithutilego ona, le a makae ao a okeditšwego beke ye. Bona mantšu a gola.",
    familyTotal: "mantšu dipukung tša lapa",
    weekTotal: "mantšu a mafsa beke ye",
    wordsInNotebook: "mantšu pukung",
    thisWeek: "beke ye",
    recentWords: "Mantšu a morago bjale",
    notLinked: "Sedirišwa sa ngwana yo ga se eso kopanywe. Se kopanye gore o bone tšwelopele ya gagwe.",
    pairCta: "Kopanya sedirišwa",
    noneYet: "Ga go eso be le mantšu pukung. Ge feela ngwana wa gago a thoma go nyaka mantšu, a tla bonagala mo.",
    loading: "Re laiša tšwelopele...",
  },
  tn: {
    title: "Kgatelopele ya bana ba gago",
    sub: "Gore ngwana mongwe le mongwe o ithutile mafoko a le kae, le gore ke a le kae a a okeditsweng mo bekeng e. Bona mafoko a gola.",
    familyTotal: "mafoko mo dibukaneng tsa lelapa",
    weekTotal: "mafoko a mašwa mo bekeng e",
    wordsInNotebook: "mafoko mo bukaneng",
    thisWeek: "mo bekeng e",
    recentWords: "Mafoko a bosheng",
    notLinked: "Sedirisiwa sa ngwana yo ga se ise se golagangwe. Se golaganye go bona kgatelopele ya gagwe.",
    pairCta: "Golaganya sedirisiwa",
    noneYet: "Ga go ise go nne le mafoko mo bukaneng. Fa fela ngwana wa gago a simolola go batla mafoko, a tla bonala fa.",
    loading: "Re laisa kgatelopele...",
  },
  st: {
    title: "Tswelopele ya bana ba hao",
    sub: "Hore na ngwana ka mong o ithutile mantswe a makae, le hore na ke a makae a ekeditsweng bekeng ena. Bona tlotlontswe e hola.",
    familyTotal: "mantswe a dibukaneng tsa lelapa",
    weekTotal: "mantswe a matjha bekeng ena",
    wordsInNotebook: "mantswe bukaneng",
    thisWeek: "bekeng ena",
    recentWords: "Mantswe a morao tjena",
    notLinked: "Sesebediswa sa ngwana enwa ha se eso hokelwe. Se hokele hore o bone tswelopele ya hae.",
    pairCta: "Hokela sesebediswa",
    noneYet: "Ha ho mantswe bukaneng hajwale. Hang ha ngwana wa hao a qala ho batla mantswe, a tla hlaha mona.",
    loading: "Re laela tswelopele...",
  },
  ts: {
    title: "Ku ya emahlweni ka vana va n'wina",
    sub: "Marito mangani lawa n'wana un'wana na un'wana a ma dyondzeke, na mangani lama engeteriweke vhiki leri. Vonani vutivi bya marito byi kula.",
    familyTotal: "marito eti bukwini ta marito ta ndyangu",
    weekTotal: "marito lamantshwa vhiki leri",
    wordsInNotebook: "marito ebukwini",
    thisWeek: "vhiki leri",
    recentWords: "Marito ya sweswinyana",
    notLinked: "Xitirhisiwa xa n'wana loyi a xi si hlanganisiwa. Xi hlanganiseni leswaku mi vona ku ya emahlweni ka yena.",
    pairCta: "Hlanganisa xitirhisiwa",
    noneYet: "A ku si va na marito ebukwini. Loko n'wana wa n'wina a sungula ku lava marito, ma ta humelela laha.",
    loading: "Hi layicha ku ya emahlweni...",
  },
  ss: {
    title: "Inchubekelembili yebantfwana bakho",
    sub: "Kutsi umntfwana ngamunye sewufundze emagama langakhi, nekutsi langakhi lengetiwe kuleliviki. Bona emagama akhula.",
    familyTotal: "emagama lasetincwadzini temndeni",
    weekTotal: "emagama lamasha kuleliviki",
    wordsInNotebook: "emagama encwadzini",
    thisWeek: "kuleliviki",
    recentWords: "Emagama lamasha",
    notLinked: "Lithuluzi lalomntfwana alikaxhunywa. Lixhume kute ubone inchubekelembili yakhe.",
    pairCta: "Xhuma lithuluzi",
    noneYet: "Kute emagama encwadzini okwamanje. Nangabe umntfwana wakho acala kusesha emagama, atawuvela lapha.",
    loading: "Kulayishwa inchubekelembili...",
  },
  ve: {
    title: "Mvelaphanḓa ya vhana vhaṋu",
    sub: "Uri ṅwana muṅwe na muṅwe o guda maipfi mangana, na uri mangana o engedzwa vhege iyi. Vhonani maipfi a tshi engedzea.",
    familyTotal: "maipfi kha bugu dza muṱa",
    weekTotal: "maipfi maswa vhege iyi",
    wordsInNotebook: "maipfi kha bugu",
    thisWeek: "vhege iyi",
    recentWords: "Maipfi a zwenezwino",
    notLinked: "Tshishumiswa tsha ṅwana uyu a tshi athu u ṱumanywa. Tshi ṱumanyeni uri ni vhone mvelaphanḓa yawe.",
    pairCta: "Ṱumanyani tshishumiswa",
    noneYet: "A hu athu u vha na maipfi kha bugu. Musi ṅwana waṋu a tshi thoma u ṱoḓa maipfi, a ḓo vhonala fhano.",
    loading: "Ri khou ḓisa mvelaphanḓa...",
  },
  nr: {
    title: "Ukuthuthuka kwabantwana bakho",
    sub: "Bona mangaki amezwi umntwana ngamunye awafundileko, nokobana mangaki angezwe ngeveke le. Bona amezwi akhula.",
    familyTotal: "amezwi asemabhukwini wamezwi womndeni",
    weekTotal: "amezwi amatjha ngeveke le",
    wordsInNotebook: "amezwi ebhukwini",
    thisWeek: "ngeveke le",
    recentWords: "Amezwi wakutjhanje",
    notLinked: "Idivayisi yomntwana lo ayikahlanganiswa okwanje. Yihlanganise bona ubone ukuthuthuka kwakhe.",
    pairCta: "Hlanganisa idivayisi",
    noneYet: "Akukabikhona amezwi ebhukwini. Msinyana nje umntwana wakho nakathoma ukufuna amezwi, azakuvela lapha.",
    loading: "Kulayitha ukuthuthuka...",
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
  vi: {
    title: "Tiến bộ của các con",
    sub: "Mỗi con đã học được bao nhiêu từ, và tuần này đã thêm bao nhiêu từ. Cùng xem vốn từ lớn lên.",
    familyTotal: "từ trong sổ tay của cả gia đình",
    weekTotal: "từ mới tuần này",
    wordsInNotebook: "từ trong sổ tay",
    thisWeek: "tuần này",
    recentWords: "Từ gần đây",
    notLinked: "Thiết bị của con chưa được liên kết. Hãy ghép nối để xem sự tiến bộ.",
    pairCta: "Ghép nối thiết bị",
    noneYet: "Sổ tay chưa có từ nào. Ngay khi con bắt đầu tra từ, các từ sẽ hiện ở đây.",
    loading: "Đang tải tiến độ...",
  },
  fil: {
    title: "Ang pag-unlad ng iyong mga anak",
    sub: "Ilang salita ang natutunan ng bawat anak, at ilan ang naidagdag ngayong linggo. Panoorin ang paglago ng bokabularyo.",
    familyTotal: "salita sa mga notebook ng pamilya",
    weekTotal: "bagong salita ngayong linggo",
    wordsInNotebook: "salita sa notebook",
    thisWeek: "ngayong linggo",
    recentWords: "Mga kamakailang salita",
    notLinked: "Hindi pa naka-link ang device ng batang ito. I-pair ito para makita ang kanyang pag-unlad.",
    pairCta: "I-pair ang device",
    noneYet: "Wala pang salita sa notebook. Kapag nagsimulang maghanap ng salita ang iyong anak, lalabas ang mga ito rito.",
    loading: "Nilo-load ang pag-unlad...",
  },
  af: {
    title: "Jou kinders se vordering",
    sub: "Hoeveel woorde elke kind geleer het, en hoeveel hierdie week bygevoeg is. Kyk hoe die woordeskat groei.",
    familyTotal: "woorde in die gesin se notaboeke",
    weekTotal: "nuwe woorde hierdie week",
    wordsInNotebook: "woorde in notaboek",
    thisWeek: "hierdie week",
    recentWords: "Onlangse woorde",
    notLinked: "Hierdie kind se toestel is nog nie gekoppel nie. Koppel dit om die vordering te sien.",
    pairCta: "Koppel toestel",
    noneYet: "Nog geen woorde in die notaboek nie. Sodra jou kind woorde begin opsoek, verskyn hulle hier.",
    loading: "Laai vordering...",
  },
  sw: {
    title: "Maendeleo ya watoto wako",
    sub: "Kila mtoto amejifunza maneno mangapi, na mangapi yameongezwa wiki hii. Tazama msamiati ukikua.",
    familyTotal: "maneno katika madaftari ya familia",
    weekTotal: "maneno mapya wiki hii",
    wordsInNotebook: "maneno kwenye daftari",
    thisWeek: "wiki hii",
    recentWords: "Maneno ya hivi karibuni",
    notLinked: "Kifaa cha mtoto huyu bado hakijaunganishwa. Kiunganishe ili kuona maendeleo yake.",
    pairCta: "Unganisha kifaa",
    noneYet: "Bado hakuna maneno kwenye daftari. Mtoto wako akianza kutafuta maneno, yataonekana hapa.",
    loading: "Inapakia maendeleo...",
  },
  "zh-CN": {
    title: "孩子们的进步",
    sub: "每个孩子学会了多少词，本周又新增了多少。一起见证词汇量的增长。",
    familyTotal: "家庭单词本中的词",
    weekTotal: "本周新词",
    wordsInNotebook: "单词本中的词",
    thisWeek: "本周",
    recentWords: "最近的词",
    notLinked: "这个孩子的设备还没有连接。配对后即可查看进度。",
    pairCta: "配对设备",
    noneYet: "单词本里还没有词。孩子一开始查词，就会显示在这里。",
    loading: "正在加载进度...",
  },
  "zh-TW": {
    title: "孩子們的進步",
    sub: "每個孩子學會了多少字詞，本週又新增了多少。一起見證詞彙量的成長。",
    familyTotal: "家庭單字本中的字詞",
    weekTotal: "本週新字詞",
    wordsInNotebook: "單字本中的字詞",
    thisWeek: "本週",
    recentWords: "最近的字詞",
    notLinked: "這個孩子的裝置還沒有連結。配對後即可查看進度。",
    pairCta: "配對裝置",
    noneYet: "單字本裡還沒有字詞。孩子一開始查字詞，就會顯示在這裡。",
    loading: "正在載入進度...",
  },
  ko: {
    title: "아이들의 성장",
    sub: "아이마다 몇 개의 단어를 배웠는지, 이번 주에 몇 개가 추가됐는지 보여 드려요. 어휘가 자라는 모습을 지켜보세요.",
    familyTotal: "가족 단어장의 단어",
    weekTotal: "이번 주 새 단어",
    wordsInNotebook: "단어장의 단어",
    thisWeek: "이번 주",
    recentWords: "최근 단어",
    notLinked: "이 아이의 기기가 아직 연결되지 않았어요. 연결하면 성장 기록을 볼 수 있어요.",
    pairCta: "기기 연결",
    noneYet: "단어장에 아직 단어가 없어요. 아이가 단어를 찾아보기 시작하면 여기에 나타나요.",
    loading: "성장 기록 불러오는 중...",
  },
  th: {
    title: "พัฒนาการของลูก ๆ",
    sub: "ลูกแต่ละคนเรียนรู้คำไปกี่คำ และสัปดาห์นี้เพิ่มคำใหม่กี่คำ มาดูคลังคำศัพท์เติบโตไปด้วยกัน",
    familyTotal: "คำในสมุดคำศัพท์ของครอบครัว",
    weekTotal: "คำใหม่สัปดาห์นี้",
    wordsInNotebook: "คำในสมุดคำศัพท์",
    thisWeek: "สัปดาห์นี้",
    recentWords: "คำล่าสุด",
    notLinked: "อุปกรณ์ของเด็กคนนี้ยังไม่ได้เชื่อมต่อ จับคู่อุปกรณ์เพื่อดูพัฒนาการ",
    pairCta: "จับคู่อุปกรณ์",
    noneYet: "ยังไม่มีคำในสมุดคำศัพท์ เมื่อลูกเริ่มค้นหาคำ คำเหล่านั้นจะแสดงที่นี่",
    loading: "กำลังโหลดพัฒนาการ...",
  },
  bn: {
    title: "আপনার সন্তানদের অগ্রগতি",
    sub: "প্রতিটি সন্তান কতগুলো শব্দ শিখেছে, আর এই সপ্তাহে কতগুলো যোগ হয়েছে। শব্দভান্ডার বাড়তে দেখুন।",
    familyTotal: "পরিবারের নোটবুকে থাকা শব্দ",
    weekTotal: "এই সপ্তাহের নতুন শব্দ",
    wordsInNotebook: "নোটবুকে থাকা শব্দ",
    thisWeek: "এই সপ্তাহে",
    recentWords: "সাম্প্রতিক শব্দ",
    notLinked: "এই সন্তানের ডিভাইস এখনো যুক্ত হয়নি। অগ্রগতি দেখতে ডিভাইসটি যুক্ত করুন।",
    pairCta: "ডিভাইস যুক্ত করুন",
    noneYet: "নোটবুকে এখনো কোনো শব্দ নেই। আপনার সন্তান শব্দ খোঁজা শুরু করলেই সেগুলো এখানে দেখা যাবে।",
    loading: "অগ্রগতি লোড হচ্ছে...",
  },
  da: {
    title: "Dine børns fremskridt",
    sub: "Hvor mange ord hvert barn har lært, og hvor mange der er kommet til i denne uge. Se ordforrådet vokse.",
    familyTotal: "ord i familiens notesbøger",
    weekTotal: "nye ord i denne uge",
    wordsInNotebook: "ord i notesbogen",
    thisWeek: "i denne uge",
    recentWords: "Seneste ord",
    notLinked: "Dette barns enhed er ikke forbundet endnu. Par den for at se fremskridtene.",
    pairCta: "Par enhed",
    noneYet: "Ingen ord i notesbogen endnu. Så snart dit barn begynder at slå ord op, vises de her.",
    loading: "Indlæser fremskridt...",
  },
  hu: {
    title: "A gyerekeid fejlődése",
    sub: "Hány szót tanult meg az egyes gyerekek, és hány új szó került be ezen a héten. Nézd, hogyan bővül a szókincs.",
    familyTotal: "szó a család füzeteiben",
    weekTotal: "új szó ezen a héten",
    wordsInNotebook: "szó a füzetben",
    thisWeek: "ezen a héten",
    recentWords: "Legutóbbi szavak",
    notLinked: "Ennek a gyereknek az eszköze még nincs összekapcsolva. Párosítsd, hogy lásd a fejlődését.",
    pairCta: "Eszköz párosítása",
    noneYet: "Még nincs szó a füzetben. Amint a gyereked elkezd szavakat keresni, itt jelennek meg.",
    loading: "Fejlődés betöltése...",
  },
};


function ProgressCard({ c, t, lang, onLearnSaved }: { c: ChildProgress; t: (typeof PROGRESS_COPY)["en"]; lang: string; onLearnSaved?: () => void }) {
  const href = useHref();
  const color = memberColorFor({ colorIndex: c.colorIndex });
  const initial = (c.name || "?").trim().charAt(0).toUpperCase() || "?";
  const roleName = (ROLE_LABEL[lang] ?? ROLE_LABEL.en)[c.role as "boy" | "girl"] ?? "";

  return (
    <div className="fam-dash-card" style={{ ["--m-color" as string]: color }}>
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
        !c.learning && <div className="fam-dash-note">{t.noneYet}</div>
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
      {/* Learning mode (Gadi 2026-10-11): real numbers, never a level. */}
      {c.linked && c.learning && (() => {
        const lc = learnCopy(lang);
        const L = c.learning;
        return (
          <div className="fam-dash-learn">
            <b>🎒 {lc.learning(L.lang === "en" ? lc.english : lc.hebrew)}</b>
            <span>{L.learnedWeek} {lc.learnedWeek} · {L.reinforce} {lc.reinforce}</span>
            {L.list && <span className="is-list">📝 {L.list.ready}/{L.list.total} {lc.listReady(L.list.testDate)}</span>}
          </div>
        );
      })()}
      {/* The parent sets learning mode for the child too (2026-10-22). */}
      {c.linked && c.learnSetup && <ChildLearnSetting memberId={c.memberId} setup={c.learnSetup} lang={lang} onSaved={onLearnSaved} />}
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
    <div className="wb-family-member-card" style={{ ["--m-color" as string]: color }}>
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
  fr: {
    home: "Accueil", members: "Famille", settings: "Réglages", dictionary: "Retour au dictionnaire", addMember: "Ajouter un membre de la famille", greetMorning: "Bonjour", greetNoon: "Bon après-midi", greetEvening: "Bonsoir", greetNight: "Bonne nuit",
    kids: (n) => (n === 1 ? "1 enfant dans la famille" : "{n} enfants dans la famille".replace("{n}", String(n))), words: (n) => "{n} mots appris".replace("{n}", String(n)),
    homeTitle: "Aperçu", membersTitle: "Membres de la famille", settingsTitle: "Réglages", langLabel: "Langue de l'interface", accountLabel: "Mon compte", accountSub: "Détails et connexion", subLabel: "Mon abonnement", subSub: "Gérer l'offre et la facturation",
  },
  es: {
    home: "Inicio", members: "Familia", settings: "Ajustes", dictionary: "Volver al diccionario", addMember: "Añadir un miembro de la familia", greetMorning: "Buenos días", greetNoon: "Buenas tardes", greetEvening: "Buenas noches", greetNight: "Buenas noches",
    kids: (n) => (n === 1 ? "1 niño en la familia" : "{n} niños en la familia".replace("{n}", String(n))), words: (n) => "{n} palabras aprendidas".replace("{n}", String(n)),
    homeTitle: "Resumen", membersTitle: "Miembros de la familia", settingsTitle: "Ajustes", langLabel: "Idioma de la interfaz", accountLabel: "Mi cuenta", accountSub: "Datos e inicio de sesión", subLabel: "Mi suscripción", subSub: "Gestionar el plan y la facturación",
  },
  pt: {
    home: "Início", members: "Família", settings: "Definições", dictionary: "Voltar ao dicionário", addMember: "Adicionar um membro da família", greetMorning: "Bom dia", greetNoon: "Boa tarde", greetEvening: "Boa noite", greetNight: "Boa noite",
    kids: (n) => (n === 1 ? "1 criança na família" : "{n} crianças na família".replace("{n}", String(n))), words: (n) => "{n} palavras aprendidas".replace("{n}", String(n)),
    homeTitle: "Visão geral", membersTitle: "Membros da família", settingsTitle: "Definições", langLabel: "Idioma da interface", accountLabel: "A minha conta", accountSub: "Detalhes e início de sessão", subLabel: "A minha subscrição", subSub: "Gerir o plano e a faturação",
  },
  it: {
    home: "Home", members: "Famiglia", settings: "Impostazioni", dictionary: "Torna al dizionario", addMember: "Aggiungi un membro della famiglia", greetMorning: "Buongiorno", greetNoon: "Buon pomeriggio", greetEvening: "Buonasera", greetNight: "Buonanotte",
    kids: (n) => (n === 1 ? "1 bambino nella famiglia" : "{n} bambini nella famiglia".replace("{n}", String(n))), words: (n) => "{n} parole imparate".replace("{n}", String(n)),
    homeTitle: "Panoramica", membersTitle: "Membri della famiglia", settingsTitle: "Impostazioni", langLabel: "Lingua dell'interfaccia", accountLabel: "Il mio account", accountSub: "Dettagli e accesso", subLabel: "Il mio abbonamento", subSub: "Gestisci piano e fatturazione",
  },
  de: {
    home: "Start", members: "Familie", settings: "Einstellungen", dictionary: "Zurück zum Wörterbuch", addMember: "Familienmitglied hinzufügen", greetMorning: "Guten Morgen", greetNoon: "Guten Tag", greetEvening: "Guten Abend", greetNight: "Gute Nacht",
    kids: (n) => (n === 1 ? "1 Kind in der Familie" : "{n} Kinder in der Familie".replace("{n}", String(n))), words: (n) => "{n} Wörter gelernt".replace("{n}", String(n)),
    homeTitle: "Übersicht", membersTitle: "Familienmitglieder", settingsTitle: "Einstellungen", langLabel: "Sprache der Oberfläche", accountLabel: "Mein Konto", accountSub: "Details und Anmeldung", subLabel: "Mein Abo", subSub: "Plan und Abrechnung verwalten",
  },
  nl: {
    home: "Start", members: "Gezin", settings: "Instellingen", dictionary: "Terug naar woordenboek", addMember: "Gezinslid toevoegen", greetMorning: "Goedemorgen", greetNoon: "Goedemiddag", greetEvening: "Goedenavond", greetNight: "Goedenacht",
    kids: (n) => (n === 1 ? "1 kind in het gezin" : "{n} kinderen in het gezin".replace("{n}", String(n))), words: (n) => "{n} woorden geleerd".replace("{n}", String(n)),
    homeTitle: "Overzicht", membersTitle: "Gezinsleden", settingsTitle: "Instellingen", langLabel: "Taal van de interface", accountLabel: "Mijn account", accountSub: "Gegevens en inloggen", subLabel: "Mijn abonnement", subSub: "Plan en facturering beheren",
  },
  cs: {
    home: "Domů", members: "Rodina", settings: "Nastavení", dictionary: "Zpět do slovníku", addMember: "Přidat člena rodiny", greetMorning: "Dobré ráno", greetNoon: "Dobré odpoledne", greetEvening: "Dobrý večer", greetNight: "Dobrou noc",
    kids: (n) => (n === 1 ? "1 dítě v rodině" : "{n} dětí v rodině".replace("{n}", String(n))), words: (n) => "naučeno {n} slov".replace("{n}", String(n)),
    homeTitle: "Přehled", membersTitle: "Členové rodiny", settingsTitle: "Nastavení", langLabel: "Jazyk rozhraní", accountLabel: "Můj účet", accountSub: "Údaje a přihlášení", subLabel: "Moje předplatné", subSub: "Správa plánu a plateb",
  },
  sk: {
    home: "Domov", members: "Rodina", settings: "Nastavenia", dictionary: "Späť do slovníka", addMember: "Pridať člena rodiny", greetMorning: "Dobré ráno", greetNoon: "Dobré popoludnie", greetEvening: "Dobrý večer", greetNight: "Dobrú noc",
    kids: (n) => (n === 1 ? "1 dieťa v rodine" : "{n} detí v rodine".replace("{n}", String(n))), words: (n) => "naučených {n} slov".replace("{n}", String(n)),
    homeTitle: "Prehľad", membersTitle: "Členovia rodiny", settingsTitle: "Nastavenia", langLabel: "Jazyk rozhrania", accountLabel: "Môj účet", accountSub: "Údaje a prihlásenie", subLabel: "Moje predplatné", subSub: "Správa plánu a platieb",
  },
  uk: {
    home: "Головна", members: "Сім'я", settings: "Налаштування", dictionary: "Назад до словника", addMember: "Додати члена сім'ї", greetMorning: "Доброго ранку", greetNoon: "Доброго дня", greetEvening: "Доброго вечора", greetNight: "Доброї ночі",
    kids: (n) => (n === 1 ? "1 дитина в сім'ї" : "{n} дітей у сім'ї".replace("{n}", String(n))), words: (n) => "{n} вивчених слів".replace("{n}", String(n)),
    homeTitle: "Огляд", membersTitle: "Члени сім'ї", settingsTitle: "Налаштування", langLabel: "Мова інтерфейсу", accountLabel: "Мій обліковий запис", accountSub: "Дані та вхід", subLabel: "Моя підписка", subSub: "Керування планом і оплатою",
  },
  pl: {
    home: "Start", members: "Rodzina", settings: "Ustawienia", dictionary: "Powrót do słownika", addMember: "Dodaj członka rodziny", greetMorning: "Dzień dobry", greetNoon: "Dzień dobry", greetEvening: "Dobry wieczór", greetNight: "Dobranoc",
    kids: (n) => (n === 1 ? "1 dziecko w rodzinie" : "{n} dzieci w rodzinie".replace("{n}", String(n))), words: (n) => "{n} nauczonych słów".replace("{n}", String(n)),
    homeTitle: "Przegląd", membersTitle: "Członkowie rodziny", settingsTitle: "Ustawienia", langLabel: "Język interfejsu", accountLabel: "Moje konto", accountSub: "Dane i logowanie", subLabel: "Moja subskrypcja", subSub: "Zarządzaj planem i płatnościami",
  },
  tr: {
    home: "Ana sayfa", members: "Aile", settings: "Ayarlar", dictionary: "Sözlüğe dön", addMember: "Aile üyesi ekle", greetMorning: "Günaydın", greetNoon: "İyi günler", greetEvening: "İyi akşamlar", greetNight: "İyi geceler",
    kids: (n) => (n === 1 ? "Ailede 1 çocuk" : "Ailede {n} çocuk".replace("{n}", String(n))), words: (n) => "{n} kelime öğrenildi".replace("{n}", String(n)),
    homeTitle: "Genel bakış", membersTitle: "Aile üyeleri", settingsTitle: "Ayarlar", langLabel: "Arayüz dili", accountLabel: "Hesabım", accountSub: "Bilgiler ve giriş", subLabel: "Aboneliğim", subSub: "Planı ve ödemeyi yönet",
  },
  ja: {
    home: "ホーム", members: "家族", settings: "設定", dictionary: "辞書に戻る", addMember: "家族を追加", greetMorning: "おはようございます", greetNoon: "こんにちは", greetEvening: "こんばんは", greetNight: "おやすみなさい",
    kids: (n) => (n === 1 ? "家族に1人のお子さま" : "家族に{n}人のお子さま".replace("{n}", String(n))), words: (n) => "{n}語を習得".replace("{n}", String(n)),
    homeTitle: "概要", membersTitle: "家族のメンバー", settingsTitle: "設定", langLabel: "表示言語", accountLabel: "アカウント", accountSub: "詳細とサインイン", subLabel: "サブスクリプション", subSub: "プランと支払いの管理",
  },
  fa: {
    home: "خانه", members: "خانواده", settings: "تنظیمات", dictionary: "بازگشت به فرهنگ لغت", addMember: "افزودن عضو خانواده", greetMorning: "صبح بخیر", greetNoon: "ظهر بخیر", greetEvening: "عصر بخیر", greetNight: "شب بخیر",
    kids: (n) => (n === 1 ? "۱ کودک در خانواده" : "{n} کودک در خانواده".replace("{n}", String(n))), words: (n) => "{n} واژه یاد گرفته شد".replace("{n}", String(n)),
    homeTitle: "نمای کلی", membersTitle: "اعضای خانواده", settingsTitle: "تنظیمات", langLabel: "زبان رابط کاربری", accountLabel: "حساب من", accountSub: "جزئیات و ورود", subLabel: "اشتراک من", subSub: "مدیریت طرح و صورت‌حساب",
  },
  id: {
    home: "Beranda", members: "Keluarga", settings: "Pengaturan", dictionary: "Kembali ke kamus", addMember: "Tambah anggota keluarga", greetMorning: "Selamat pagi", greetNoon: "Selamat siang", greetEvening: "Selamat malam", greetNight: "Selamat tidur",
    kids: (n) => (n === 1 ? "1 anak dalam keluarga" : "{n} anak dalam keluarga".replace("{n}", String(n))), words: (n) => "{n} kata dipelajari".replace("{n}", String(n)),
    homeTitle: "Ikhtisar", membersTitle: "Anggota keluarga", settingsTitle: "Pengaturan", langLabel: "Bahasa antarmuka", accountLabel: "Akun saya", accountSub: "Detail dan masuk", subLabel: "Langganan saya", subSub: "Kelola paket dan penagihan",
  },
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
  xh: {
    home: "Ekhaya", members: "Usapho", settings: "Iisetingi", dictionary: "Buyela kwisichazi-magama", addMember: "Yongeza ilungu losapho",
    greetMorning: "Molo, kusasa", greetNoon: "Molo, emva kwemini", greetEvening: "Molo, ngokuhlwa", greetNight: "Ubusuku obuhle",
    kids: (n) => (n === 1 ? "Umntwana omnye osapheni" : `Abantwana aba-${n} osapheni`), words: (n) => `Amagama angama-${n} afundiweyo`,
    homeTitle: "Isishwankathelo", membersTitle: "Amalungu osapho", settingsTitle: "Iisetingi",
    langLabel: "Ulwimi lojongano", accountLabel: "Iakhawunti yam", accountSub: "Iinkcukacha nokungena",
    subLabel: "Umrhumo wam", subSub: "Lawula isicwangciso neentlawulo",
  },
  nso: {
    home: "Gae", members: "Lapa", settings: "Dipeakanyo", dictionary: "Boela pukuntšung", addMember: "Oketša leloko la lapa",
    greetMorning: "Dumela, ke mesong", greetNoon: "Thapama ye botse", greetEvening: "Mantšiboa a mabotse", greetNight: "Robala gabotse",
    kids: (n) => (n === 1 ? "Ngwana o 1 lapeng" : `Bana ba ${n} lapeng`), words: (n) => `Mantšu a ${n} a ithutilwe`,
    homeTitle: "Kakaretšo", membersTitle: "Maloko a lapa", settingsTitle: "Dipeakanyo",
    langLabel: "Polelo ya tšhebedišo", accountLabel: "Akhaonto ya ka", accountSub: "Dintlha le go tsena",
    subLabel: "Peeletšo ya ka", subSub: "Laola leano le ditefo",
  },
  tn: {
    home: "Gae", members: "Lelapa", settings: "Dithulaganyo", dictionary: "Boela kwa thanoding", addMember: "Tsenya leloko la lelapa",
    greetMorning: "Mosong o o monate", greetNoon: "Motshegare o o monate", greetEvening: "Maitseboa a a monate", greetNight: "Robala sentle",
    kids: (n) => (n === 1 ? "Ngwana a le 1 mo lelapeng" : `Bana ba le ${n} mo lelapeng`), words: (n) => `Mafoko a le ${n} a ithutilwe`,
    homeTitle: "Kakaretso", membersTitle: "Maloko a lelapa", settingsTitle: "Dithulaganyo",
    langLabel: "Puo ya tiriso", accountLabel: "Akhaonto ya me", accountSub: "Dintlha le go tsena",
    subLabel: "Ikwadiso ya me", subSub: "Laola leano le dituelo",
  },
  st: {
    home: "Lapeng", members: "Lelapa", settings: "Disetting", dictionary: "Kgutlela bukantsweng", addMember: "Kenya setho sa lelapa",
    greetMorning: "Dumela hoseng", greetNoon: "Dumela motsheare", greetEvening: "Dumela mantsiboya", greetNight: "Robala hantle",
    kids: (n) => (n === 1 ? "Ngwana a le 1 lelapeng" : `Bana ba ${n} lelapeng`), words: (n) => `Mantswe a ${n} a ithutilwe`,
    homeTitle: "Kakaretso", membersTitle: "Ditho tsa lelapa", settingsTitle: "Disetting",
    langLabel: "Puo ya sebopeho", accountLabel: "Akhaonte ya ka", accountSub: "Dintlha le ho kena",
    subLabel: "Ngodiso ya ka", subSub: "Laola moralo le ditefo",
  },
  ts: {
    home: "Ekaya", members: "Ndyangu", settings: "Swiyimiso", dictionary: "Tlhelela eka dikixinari", addMember: "Engetela xirho xa ndyangu",
    greetMorning: "Avuxeni", greetNoon: "Inhlekanhi", greetEvening: "Riperile", greetNight: "Etlela kahle",
    kids: (n) => (n === 1 ? "N'wana un'we endyangwini" : `Vana va ${n} endyangwini`), words: (n) => `Marito ya ${n} ma dyondziwile`,
    homeTitle: "Nkatsakanyo", membersTitle: "Swirho swa ndyangu", settingsTitle: "Swiyimiso",
    langLabel: "Ririmi ra xitirhisiwa", accountLabel: "Akhawunti ya mina", accountSub: "Vuxokoxoko na ku nghena",
    subLabel: "Mbhaliso wa mina", subSub: "Lawula pulani na ku hakela",
  },
  ss: {
    home: "Ekhaya", members: "Umndeni", settings: "Tilungiselelo", dictionary: "Buyela esichazamagameni", addMember: "Engeta lilunga lemndeni",
    greetMorning: "Sawubona ekuseni", greetNoon: "Sawubona emini", greetEvening: "Sawubona kusihlwa", greetNight: "Lala kahle",
    kids: (n) => (n === 1 ? "Umntfwana munye emndenini" : `Bantfwana labangu-${n} emndenini`), words: (n) => `Emagama langu-${n} lafundziwe`,
    homeTitle: "Kubuka konkhe", membersTitle: "Emalunga emndeni", settingsTitle: "Tilungiselelo",
    langLabel: "Lulwimi lwesikrini", accountLabel: "I-akhawunti yami", accountSub: "Imininingwane nekungena",
    subLabel: "Kubhalisa kwami", subSub: "Phatsa lihlelo netinkhokhelo",
  },
  ve: {
    home: "Hayani", members: "Muṱa", settings: "Mavhekanyele", dictionary: "Humelani kha bugu ya maipfi", addMember: "Engedzani muraḓo wa muṱa",
    greetMorning: "Ndi matsheloni", greetNoon: "Ndi masiari", greetEvening: "Ndi madekwana", greetNight: "Vhusiku havhuḓi",
    kids: (n) => (n === 1 ? "Ṅwana muthihi kha muṱa" : `Vhana vha ${n} kha muṱa`), words: (n) => `Maipfi a ${n} o gudiwa`,
    homeTitle: "Tshivhumbeo tshoṱhe", membersTitle: "Miraḓo ya muṱa", settingsTitle: "Mavhekanyele",
    langLabel: "Luambo lwa tshikirini", accountLabel: "Akhaunthu yanga", accountSub: "Zwidodombedzwa na u dzhena",
    subLabel: "Ṅwaliso wanga", subSub: "Langani pulane na mbadelo",
  },
  nr: {
    home: "Ekhaya", members: "Umndeni", settings: "Iinlungiselelo", dictionary: "Buyela esihlathululimezwini", addMember: "Faka ilunga lomndeni",
    greetMorning: "Livukile", greetNoon: "Litjhisile", greetEvening: "Litjhonile", greetNight: "Ulale kuhle",
    kids: (n) => (n === 1 ? "Umntwana munye emndenini" : `Abantwana abali-${n} emndenini`), words: (n) => `Amezwi ali-${n} afundiweko`,
    homeTitle: "Ukuqala koke", membersTitle: "Amalunga womndeni", settingsTitle: "Iinlungiselelo",
    langLabel: "Ilimi lokusebenzisa", accountLabel: "I-akhawunti yami", accountSub: "Imininingwana nokungena",
    subLabel: "Ukubhalisela kwami", subSub: "Lawula ihlelo nokubhadela",
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
  vi: {
    home: "Trang chủ",
    members: "Gia đình",
    settings: "Cài đặt",
    dictionary: "Quay lại từ điển",
    addMember: "Thêm thành viên gia đình",
    greetMorning: "Chào buổi sáng",
    greetNoon: "Chào buổi chiều",
    greetEvening: "Chào buổi tối",
    greetNight: "Chúc ngủ ngon",
    kids: (n) => `${n} con trong gia đình`,
    words: (n) => `${n} từ đã học`,
    homeTitle: "Tổng quan",
    membersTitle: "Thành viên gia đình",
    settingsTitle: "Cài đặt",
    langLabel: "Ngôn ngữ giao diện",
    accountLabel: "Tài khoản của tôi",
    accountSub: "Thông tin và đăng nhập",
    subLabel: "Gói đăng ký của tôi",
    subSub: "Quản lý gói và thanh toán",
  },
  fil: {
    home: "Home",
    members: "Pamilya",
    settings: "Settings",
    dictionary: "Bumalik sa diksiyonaryo",
    addMember: "Magdagdag ng miyembro ng pamilya",
    greetMorning: "Magandang umaga",
    greetNoon: "Magandang hapon",
    greetEvening: "Magandang gabi",
    greetNight: "Magandang gabi",
    kids: (n) => (n === 1 ? "1 anak sa pamilya" : `${n} anak sa pamilya`),
    words: (n) => `${n} salitang natutunan`,
    homeTitle: "Pangkalahatang-tanaw",
    membersTitle: "Mga miyembro ng pamilya",
    settingsTitle: "Settings",
    langLabel: "Wika ng interface",
    accountLabel: "Aking account",
    accountSub: "Mga detalye at pag-sign in",
    subLabel: "Aking subscription",
    subSub: "Pamahalaan ang plan at billing",
  },
  af: {
    home: "Tuis",
    members: "Gesin",
    settings: "Instellings",
    dictionary: "Terug na woordeboek",
    addMember: "Voeg 'n gesinslid by",
    greetMorning: "Goeiemôre",
    greetNoon: "Goeiemiddag",
    greetEvening: "Goeienaand",
    greetNight: "Goeienag",
    kids: (n) => (n === 1 ? "1 kind in die gesin" : `${n} kinders in die gesin`),
    words: (n) => `${n} woorde geleer`,
    homeTitle: "Oorsig",
    membersTitle: "Gesinslede",
    settingsTitle: "Instellings",
    langLabel: "Koppelvlaktaal",
    accountLabel: "My rekening",
    accountSub: "Besonderhede en aanmelding",
    subLabel: "My intekening",
    subSub: "Bestuur plan en betaling",
  },
  sw: {
    home: "Mwanzo",
    members: "Familia",
    settings: "Mipangilio",
    dictionary: "Rudi kwenye kamusi",
    addMember: "Ongeza mwanafamilia",
    greetMorning: "Habari za asubuhi",
    greetNoon: "Habari za mchana",
    greetEvening: "Habari za jioni",
    greetNight: "Usiku mwema",
    kids: (n) => (n === 1 ? "Mtoto 1 katika familia" : `Watoto ${n} katika familia`),
    words: (n) => `Maneno ${n} yamejifunzwa`,
    homeTitle: "Muhtasari",
    membersTitle: "Wanafamilia",
    settingsTitle: "Mipangilio",
    langLabel: "Lugha ya kiolesura",
    accountLabel: "Akaunti yangu",
    accountSub: "Maelezo na kuingia",
    subLabel: "Usajili wangu",
    subSub: "Simamia mpango na malipo",
  },
  "zh-CN": {
    home: "首页",
    members: "家庭",
    settings: "设置",
    dictionary: "返回词典",
    addMember: "添加家庭成员",
    greetMorning: "早上好",
    greetNoon: "下午好",
    greetEvening: "晚上好",
    greetNight: "晚安",
    kids: (n) => `家里有 ${n} 个孩子`,
    words: (n) => `已学会 ${n} 个词`,
    homeTitle: "概览",
    membersTitle: "家庭成员",
    settingsTitle: "设置",
    langLabel: "界面语言",
    accountLabel: "我的账户",
    accountSub: "资料与登录",
    subLabel: "我的订阅",
    subSub: "管理方案与账单",
  },
  "zh-TW": {
    home: "首頁",
    members: "家庭",
    settings: "設定",
    dictionary: "返回字典",
    addMember: "新增家庭成員",
    greetMorning: "早安",
    greetNoon: "午安",
    greetEvening: "晚上好",
    greetNight: "晚安",
    kids: (n) => `家裡有 ${n} 個孩子`,
    words: (n) => `已學會 ${n} 個字詞`,
    homeTitle: "概覽",
    membersTitle: "家庭成員",
    settingsTitle: "設定",
    langLabel: "介面語言",
    accountLabel: "我的帳戶",
    accountSub: "資料與登入",
    subLabel: "我的訂閱",
    subSub: "管理方案與帳單",
  },
  ko: {
    home: "홈",
    members: "가족",
    settings: "설정",
    dictionary: "사전으로 돌아가기",
    addMember: "가족 구성원 추가",
    greetMorning: "좋은 아침이에요",
    greetNoon: "좋은 오후예요",
    greetEvening: "좋은 저녁이에요",
    greetNight: "편안한 밤 되세요",
    kids: (n) => `가족 중 아이 ${n}명`,
    words: (n) => `배운 단어 ${n}개`,
    homeTitle: "개요",
    membersTitle: "가족 구성원",
    settingsTitle: "설정",
    langLabel: "인터페이스 언어",
    accountLabel: "내 계정",
    accountSub: "정보 및 로그인",
    subLabel: "내 구독",
    subSub: "요금제 및 결제 관리",
  },
  th: {
    home: "หน้าแรก",
    members: "ครอบครัว",
    settings: "การตั้งค่า",
    dictionary: "กลับไปที่พจนานุกรม",
    addMember: "เพิ่มสมาชิกครอบครัว",
    greetMorning: "อรุณสวัสดิ์",
    greetNoon: "สวัสดีตอนบ่าย",
    greetEvening: "สวัสดีตอนเย็น",
    greetNight: "ราตรีสวัสดิ์",
    kids: (n) => `มีลูก ${n} คนในครอบครัว`,
    words: (n) => `เรียนรู้แล้ว ${n} คำ`,
    homeTitle: "ภาพรวม",
    membersTitle: "สมาชิกครอบครัว",
    settingsTitle: "การตั้งค่า",
    langLabel: "ภาษาของหน้าจอ",
    accountLabel: "บัญชีของฉัน",
    accountSub: "รายละเอียดและการเข้าสู่ระบบ",
    subLabel: "การสมัครสมาชิกของฉัน",
    subSub: "จัดการแพ็กเกจและการชำระเงิน",
  },
  bn: {
    home: "হোম",
    members: "পরিবার",
    settings: "সেটিংস",
    dictionary: "অভিধানে ফিরে যান",
    addMember: "পরিবারের সদস্য যোগ করুন",
    greetMorning: "সুপ্রভাত",
    greetNoon: "শুভ অপরাহ্ন",
    greetEvening: "শুভ সন্ধ্যা",
    greetNight: "শুভ রাত্রি",
    kids: (n) => `পরিবারে ${n} জন শিশু`,
    words: (n) => `${n}টি শব্দ শেখা হয়েছে`,
    homeTitle: "সারসংক্ষেপ",
    membersTitle: "পরিবারের সদস্যরা",
    settingsTitle: "সেটিংস",
    langLabel: "ইন্টারফেসের ভাষা",
    accountLabel: "আমার অ্যাকাউন্ট",
    accountSub: "বিবরণ ও সাইন ইন",
    subLabel: "আমার সাবস্ক্রিপশন",
    subSub: "প্ল্যান ও বিলিং পরিচালনা করুন",
  },
  da: {
    home: "Hjem",
    members: "Familie",
    settings: "Indstillinger",
    dictionary: "Tilbage til ordbogen",
    addMember: "Tilføj et familiemedlem",
    greetMorning: "Godmorgen",
    greetNoon: "God eftermiddag",
    greetEvening: "Godaften",
    greetNight: "Godnat",
    kids: (n) => (n === 1 ? "1 barn i familien" : `${n} børn i familien`),
    words: (n) => `${n} ord lært`,
    homeTitle: "Overblik",
    membersTitle: "Familiemedlemmer",
    settingsTitle: "Indstillinger",
    langLabel: "Sprog i brugerfladen",
    accountLabel: "Min konto",
    accountSub: "Oplysninger og login",
    subLabel: "Mit abonnement",
    subSub: "Administrer abonnement og betaling",
  },
  hu: {
    home: "Kezdőlap",
    members: "Család",
    settings: "Beállítások",
    dictionary: "Vissza a szótárhoz",
    addMember: "Családtag hozzáadása",
    greetMorning: "Jó reggelt",
    greetNoon: "Szép délutánt",
    greetEvening: "Jó estét",
    greetNight: "Jó éjszakát",
    kids: (n) => `${n} gyerek a családban`,
    words: (n) => `${n} megtanult szó`,
    homeTitle: "Áttekintés",
    membersTitle: "Családtagok",
    settingsTitle: "Beállítások",
    langLabel: "Felület nyelve",
    accountLabel: "Fiókom",
    accountSub: "Adatok és bejelentkezés",
    subLabel: "Előfizetésem",
    subSub: "Csomag és számlázás kezelése",
  },
};

// All 30+ UI languages, native names, straight from the shared LANGUAGES
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

/** A prominent first step when no child is connected yet (Gadi 2026-10-12). */
const CONNECT_CARD: Record<string, [string, string, string]> = {
  en: ["You haven't connected a child yet", "It takes a minute, and from then on you'll see every word your child learns right here.", "Connect your child"],
  he: ["עוד לא חיברתם ילד", "זה לוקח דקה, ומהרגע הזה תראו כאן כל מילה שהילד לומד.", "חברו את הילד"],
  ar: ["لم تربطوا طفلًا بعد", "يستغرق ذلك دقيقة، ومن بعدها سترون هنا كل كلمة يتعلمها طفلكم.", "اربطوا طفلكم"],
  ru: ["Вы ещё не подключили ребёнка", "Это займёт минуту, и потом вы будете видеть здесь каждое слово, которое учит ребёнок.", "Подключить ребёнка"],
  es: ["Todavía no has conectado a un niño", "Lleva un minuto, y desde entonces verás aquí cada palabra que aprende tu hijo.", "Conectar a tu hijo"],
  pt: ["Você ainda não conectou uma criança", "Leva um minuto, e a partir daí você verá aqui cada palavra que seu filho aprende.", "Conectar seu filho"],
  fr: ["Vous n'avez pas encore connecté d'enfant", "Cela prend une minute, et ensuite vous verrez ici chaque mot appris par votre enfant.", "Connecter votre enfant"],
  de: ["Ihr habt noch kein Kind verbunden", "Das dauert eine Minute, und danach seht ihr hier jedes Wort, das euer Kind lernt.", "Kind verbinden"],
  cs: ["Zatím jste nepřipojili dítě", "Zabere to minutu a pak tady uvidíte každé slovo, které se dítě naučí.", "Připojit dítě"],
  sk: ["Zatiaľ ste nepripojili dieťa", "Zaberie to minútu a potom tu uvidíte každé slovo, ktoré sa dieťa naučí.", "Pripojiť dieťa"],
  it: ["Non hai ancora collegato un bambino", "Ci vuole un minuto, e da lì vedrai qui ogni parola che tuo figlio impara.", "Collega tuo figlio"],
  ja: ["まだお子さんがつながっていません", "1分で終わります。その後はお子さんが覚えた単語をここで見られます。", "お子さんをつなぐ"],
  hi: ["आपने अभी तक बच्चे को नहीं जोड़ा है", "इसमें एक मिनट लगता है, फिर आप यहाँ बच्चे का सीखा हर शब्द देखेंगे।", "बच्चे को जोड़ें"],
  am: ["እስካሁን ልጅ አላገናኛችሁም", "አንድ ደቂቃ ይወስዳል፣ ከዚያ ልጁ የሚማረውን እያንዳንዱን ቃል እዚህ ታያላችሁ።", "ልጁን አገናኙ"],
  uk: ["Ви ще не під'єднали дитину", "Це займе хвилину, і потім ви бачитимете тут кожне слово, яке вивчає дитина.", "Під'єднати дитину"],
  tr: ["Henüz bir çocuk bağlamadınız", "Bir dakika sürer, sonra çocuğunuzun öğrendiği her kelimeyi burada görürsünüz.", "Çocuğunuzu bağlayın"],
  pl: ["Nie połączyliście jeszcze dziecka", "To zajmie minutę, a potem zobaczycie tu każde słowo, którego uczy się dziecko.", "Połącz dziecko"],
  fa: ["هنوز کودکی را وصل نکرده‌اید", "یک دقیقه طول می‌کشد و از آن به بعد هر کلمه‌ای را که کودک یاد می‌گیرد اینجا می‌بینید.", "کودک را وصل کنید"],
  id: ["Anda belum menghubungkan anak", "Hanya satu menit, lalu Anda akan melihat setiap kata yang dipelajari anak di sini.", "Hubungkan anak"],
  nl: ["Je hebt nog geen kind gekoppeld", "Het duurt een minuut, en daarna zie je hier elk woord dat je kind leert.", "Kind koppelen"],
  el: ["Δεν έχετε συνδέσει ακόμα παιδί", "Παίρνει ένα λεπτό, και μετά θα βλέπετε εδώ κάθε λέξη που μαθαίνει το παιδί.", "Σύνδεση παιδιού"],
  zu: ["Anikayixhumi ingane okwamanje", "Kuthatha umzuzu, bese nibona lapha wonke amagama ingane ewafundayo.", "Xhumani ingane"],
  xh: ["Akukadibanisi mntwana", "Kuthatha umzuzu, kwaye ukusukela ngoko uza kubona apha lonke igama umntwana wakho alifundayo.", "Dibanisa umntwana wakho"],
  nso: ["Ga o eso kopanye ngwana", "Go tšea motsotso, gomme go tloga fao o tla bona mo lentšu le lengwe le le lengwe leo ngwana wa gago a ithutago lona.", "Kopanya ngwana wa gago"],
  tn: ["Ga o ise o golaganye ngwana", "Go tsaya motsotso, mme go tloga foo o tla bona lefoko lengwe le lengwe le ngwana wa gago a ithutang lone fa.", "Golaganya ngwana wa gago"],
  st: ["Ha o eso hokele ngwana", "Ho nka motsotso, mme ho tloha moo o tla bona lentswe le leng le le leng leo ngwana wa hao a ithutang lona mona.", "Hokela ngwana wa hao"],
  ts: ["A mi si hlanganisa n'wana", "Swi teka minete, naswona ku sukela kwalaho mi ta vona rito rin'wana na rin'wana leri n'wana wa n'wina a ri dyondzaka laha.", "Hlanganisa n'wana wa n'wina"],
  ss: ["Awukaxhumi umntfwana okwamanje", "Kutsatsa umzuzu, futsi kusukela lapho utawubona lapha onkhe emagama umntfwana wakho lawafundzako.", "Xhuma umntfwana wakho"],
  ve: ["A ni athu u ṱumanya ṅwana", "Zwi dzhia minithi nthihi, nahone u bva zwenezwo ni ḓo vhona ipfi ḽiṅwe na ḽiṅwe ḽine ṅwana waṋu a ḽi guda fhano.", "Ṱumanyani ṅwana waṋu"],
  nr: ["Awukahlanganisi umntwana okwanje", "Kuthatha umzuzu, begodu ukusukela lapho uzakubona lapha ilizwi ngalinye umntwana wakho alifundako.", "Hlanganisa umntwana wakho"],
  vi: ["Bạn chưa kết nối con", "Chỉ mất một phút, sau đó bạn sẽ thấy ở đây mọi từ con học.", "Kết nối con"],
  fil: ["Hindi ka pa nakakakonekta ng bata", "Isang minuto lang, at mula noon makikita mo rito ang bawat salitang natututunan ng anak mo.", "Ikonekta ang anak mo"],
  af: ["Julle het nog nie 'n kind gekoppel nie", "Dit neem 'n minuut, en daarna sien julle hier elke woord wat julle kind leer.", "Koppel julle kind"],
  sw: ["Bado hamjamuunganisha mtoto", "Inachukua dakika moja, kisha mtaona hapa kila neno mtoto analojifunza.", "Unganisheni mtoto"],
  "zh-CN": ["您还没有连接孩子", "只需一分钟，之后您就能在这里看到孩子学的每个词。", "连接孩子"],
  "zh-TW": ["您還沒有連接孩子", "只需一分鐘，之後您就能在這裡看到孩子學的每個詞。", "連接孩子"],
  ko: ["아직 아이를 연결하지 않았어요", "1분이면 돼요. 그다음부터 아이가 배우는 모든 단어를 여기서 볼 수 있어요.", "아이 연결하기"],
  th: ["คุณยังไม่ได้เชื่อมต่อลูก", "ใช้เวลาแค่นาทีเดียว หลังจากนั้นคุณจะเห็นทุกคำที่ลูกเรียนที่นี่", "เชื่อมต่อลูก"],
  bn: ["আপনি এখনও সন্তানকে যুক্ত করেননি", "এক মিনিট লাগে, তারপর থেকে সন্তান যে শব্দই শিখুক, এখানে দেখতে পাবেন।", "সন্তানকে যুক্ত করুন"],
  da: ["I har ikke forbundet et barn endnu", "Det tager et minut, og derefter ser I her hvert ord, jeres barn lærer.", "Forbind jeres barn"],
  hu: ["Még nem kapcsoltatok gyereket", "Egy perc az egész, utána itt láthatjátok minden szót, amit a gyerek tanul.", "Gyerek kapcsolása"],
};

export function FamilyClient() {
  const { user, loading, setShowLoginModal } = useAuth();
  const { lang, dir, setLang, t: ui } = useLang();
  const href = useHref();
  const router = useRouter();
  const search = useSearchParams();
  const c = COPY[lang] ?? COPY.en;
  const roleLabel = ROLE_LABEL[lang] ?? ROLE_LABEL.en;
  const nav = NAV_COPY[lang] ?? NAV_COPY.en;

  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyChecked, setFamilyChecked] = useState(false);
  // The family's own child limit (users/{owner}.maxKids, e.g. a 6th child we
  // granted, Gadi 2026-10-20). Only the owner can read that doc; anyone else
  // sees the plan's 5 here, and the add page checks again.
  const [kidLimit, setKidLimit] = useState(MAX_KIDS_PER_FAMILY);
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => setKidLimit(kidLimitFor(snap.data()?.maxKids)))
      .catch(() => {});
  }, [user]);
  const [progress, setProgress] = useState<{ children: ChildProgress[]; totalWords: number; weekWords: number } | null>(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  // Bumped after the parent changes a child's learning setting: reload the numbers.
  const [progressTick, setProgressTick] = useState(0);
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
  // A child's age, editable after adding (Gadi 2026-10-22: a grandmother
  // could not fix a grandchild's age). "" = not set.
  const [editAge, setEditAge] = useState<string>("");

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
  }, [user, family, members.length, progressTick]);

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

  if (loading) {
    return <div className="wordbook wb-family-page" dir={dir}><div className="gd-wait-page"><WaitDots className="gd-wait-big" /></div></div>;
  }

  // Not signed in on this host (e.g. bought on gadit.app, opened an email
  // link on www): ask to sign in instead of a blank page or a bounce to
  // pricing (Gadi 2026-10-11, Yehuda Koren). The session bridge may still
  // sign them in a moment later; the page then fills in by itself.
  if (!user) {
    return (
      <div className="wordbook wb-family-page" dir={dir}>
        <main className="wb-family-main">
          <div className="wb-family-empty-state">
            <p style={{ fontSize: 40, margin: 0 }} aria-hidden="true">👨‍👩‍👧</p>
            <button type="button" className="wb-family-cta" onClick={() => setShowLoginModal(true)}>{ui.login}</button>
          </div>
        </main>
      </div>
    );
  }

  if (!familyChecked) {
    return <div className="wordbook wb-family-page" dir={dir}><div className="gd-wait-page"><WaitDots className="gd-wait-big" /></div></div>;
  }

  // No family doc = no Family subscription. Soft redirect with a message.
  if (!family) {
    return (
      <div className="wordbook wb-family-page" dir={dir}>
        <main className="wb-family-main">
          <div className="wb-family-empty-state">
            {/* Inside the Play / iOS app: one neutral line, no plan or link. */}
            <p className="gd-buy">{c.notReady}</p>
            <p className="gd-play-only">{playNotActive(lang)}</p>
            <AppIntentPing feature="family" />
            <Link href={href("/pricing")} className="wb-family-cta gd-buy">
              {c.goPricing}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const parents = members.filter((m) => isParentRole(m.role));
  const children = members.filter((m) => !isParentRole(m.role));
  const atCap = children.length >= kidLimit;
  const hour = new Date().getHours();
  const ownerMember = members.find((m) => m.isOwner);
  // Greet by first name. Skip a name that's just the role word ("אבא" /
  // "Mom") — an un-personalised default — and fall back to the mother label,
  // not the father (Gadi 2026-08-17: the primary parent defaults to mother).
  const ownerName = ownerMember?.name?.trim() || "";
  const nameIsRole = ownerName === roleLabel.father || ownerName === roleLabel.mother;
  const firstName =
    (user.displayName && user.displayName.trim().split(/\s+/)[0]) ||
    (ownerName && !nameIsRole ? ownerName.split(/\s+/)[0] : "") ||
    roleLabel.mother;
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
        setEditAge(typeof (m as { age?: unknown }).age === "number" ? String((m as { age?: number }).age) : "");
        setEditOpen(true);
      }}
      editLabel={familyUi(lang).edit}
      onDelete={!m.isOwner ? () => {
        const label = m.name || roleLabel[m.role];
        const msg = familyUi(lang).removeConfirm(label);
        if (window.confirm(msg)) void deleteMember(m.id);
      } : undefined}
      deleteLabel={familyUi(lang).remove}
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
        // Only a child has an age (3 to 18); clearing the field removes it.
        ...(!isParentRole(editRole)
          ? { age: editAge.trim() ? Math.max(3, Math.min(18, parseInt(editAge, 10) || 0)) || null : null }
          : {}),
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
            style={{ background: "var(--surface)", borderRadius: 16, padding: "22px 20px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(17,24,39,0.25)" }}
          >
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
              {familyUi(lang).edit}
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "#6b7280" }}>
              {familyUi(lang).editSub}
            </p>
            {/* Profile photo: helps a parent recognize each child at a glance
                in the profile switcher. Optional; falls back to the chip. */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: "var(--mist)", border: "1px solid rgba(17,24,39,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {editPhoto ? (
                  <img src={editPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "start" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 9, border: "1px solid rgba(14,165,165,0.4)", background: "rgba(14,165,165,0.06)", color: "#0E7490", fontWeight: 700, fontSize: 13, cursor: editPhotoBusy ? "default" : "pointer", fontFamily: "inherit", opacity: editPhotoBusy ? 0.6 : 1 }}>
                  {editPhotoBusy
                    ? <WaitText text={familyUi(lang).loading} />
                    : editPhoto
                      ? familyUi(lang).changePhoto
                      : familyUi(lang).addPhoto}
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
                    style={{ background: "none", border: "none", padding: "2px 2px", color: "var(--ink-faint)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {familyUi(lang).removePhoto}
                  </button>
                )}
              </div>
            </div>
            {/* Avatar picker — pick an illustrated character (Gadi 2026-08-16).
                A real photo above still wins; this is the fun default. */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>
                {familyUi(lang).pickCharacter}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {avatarsForRole(editRole).map((a) => {
                  const active = editAvatarId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setEditAvatarId(active ? "" : a.id)}
                      aria-pressed={active}
                      title={a.name[lang] ?? a.name.en}
                      style={{ width: 46, height: 46, borderRadius: 999, padding: 0, overflow: "hidden", cursor: "pointer", background: "var(--surface)", border: active ? "2.5px solid #0EA5A5" : "2px solid rgba(17,24,39,0.1)", boxShadow: active ? "0 0 0 3px rgba(14,165,165,0.18)" : "none" }}
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
              placeholder={familyUi(lang).name}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(17,24,39,0.18)", fontSize: 15, fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box" }}
            />
            {!isParentRole(editRole) && (
              <label style={{ display: "block", marginBottom: 12 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 4 }}>{ageLabelFor(lang)}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={3}
                  max={18}
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  dir="ltr"
                  style={{ width: 120, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(17,24,39,0.18)", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", background: "var(--surface)", color: "var(--ink)" }}
                />
              </label>
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {(isParentRole(editRole) ? (["father", "mother"] as const) : (["boy", "girl"] as const)).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setEditRole(r)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: editRole === r ? "2px solid #0EA5A5" : "1px solid rgba(17,24,39,0.18)", background: editRole === r ? "rgba(14,165,165,0.08)" : "var(--surface)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)" }}
                >
                  {roleLabel[r]}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setEditOpen(false)} disabled={editSaving} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid rgba(17,24,39,0.18)", background: "var(--surface)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "var(--ink-soft)" }}>
                {familyUi(lang).cancel}
              </button>
              <button type="button" onClick={saveMember} disabled={editSaving} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#0EA5A5", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", opacity: editSaving ? 0.6 : 1 }}>
                {editSaving ? <WaitDots /> : familyUi(lang).save}
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
            <BackLink href={href("/")} className="fam-nav-item fam-nav-back">
              <NavIcon name="dictionary" />
              <span>{nav.dictionary}</span>
            </BackLink>
          </div>
        </aside>

        {/* Main panel */}
        <main className="fam-shell-body">
          <header className={`fam-shell-top ${tab === "home" ? "is-home" : ""}`}>
            {tab === "home" ? (
              <div className="fam-shell-greet">
                <h1>
                  {greetingFor(nav, hour)} {firstName}{" "}
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
              {/* No child yet: one clear first step on top (Gadi 2026-10-12:
                  14 of 18 idle paying families had never connected a child). */}
              {children.length === 0 && (
                <div className="fam-connect-card">
                  <b>{(CONNECT_CARD[lang] ?? CONNECT_CARD.en)[0]}</b>
                  <span>{(CONNECT_CARD[lang] ?? CONNECT_CARD.en)[1]}</span>
                  <Link href={href("/family/add")} className="fam-connect-go">{(CONNECT_CARD[lang] ?? CONNECT_CARD.en)[2]}</Link>
                </div>
              )}
              {/* First-steps checklist — hides itself once the family is
                  set up or the owner dismisses it. */}
              <FamilySetupChecklist placement="family" members={members} lang={lang} />
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
                      <ProgressCard key={cp.memberId} c={cp} t={pt} lang={lang} onLearnSaved={() => setProgressTick((n) => n + 1)} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="fam-shell-empty">
                  <p>{members.length === 0 ? c.empty : pt.sub}</p>
                  <Link href={href("/family/add")} className="wb-family-cta">{c.add}</Link>
                </div>
              )}
              {/* Family leaderboard (Gadi 2026-10-17): parents and kids on one board. */}
              <FamilyLeaderboard lang={lang} dir={dir} />
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
              {/* Shared-device Kids Mode lives with the family members (like
                  Yooniz), not in Settings (Gadi 2026-08-27). */}
              <Link href={href("/kids")} className="fam-set-row fam-set-link" style={{ marginTop: 14 }}>
                <div className="fam-set-icon" style={{ fontSize: 20 }} aria-hidden="true">🧒</div>
                <div className="fam-set-main">
                  <label className="fam-set-label">{familyUi(lang).kidsScreen}</label>
                </div>
              </Link>
            </div>
          )}

          {tab === "settings" && (
            <div className="fam-tab fam-settings">
              <NotifSettings user={user} lang={lang} dir={dir} />
              <DuelPermission user={user} lang={lang} dir={dir} />
              <CoachesSection />
              <div className="fam-set-row">
                <div className="fam-set-icon"><NavIcon name="settings" /></div>
                <div className="fam-set-main">
                  <label className="fam-set-label" htmlFor="fam-lang">{nav.langLabel}</label>
                </div>
                {/* Custom dropdown (not a native <select>) so it shows a flag
                    per language — a native select renders text-only on mobile,
                    losing the flags a non-reader relies on (Gadi 2026-08). */}
                <LangSwitcher variant="muted" />
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
  fr: {
    title: "Recherches récentes",
    sub: "Chaque mot que vos enfants ont cherché, du plus récent au plus ancien.",
    empty: "Aucune recherche pour l'instant. Quand vos enfants cherchent un mot en Mode Enfant, il apparaît ici.",
    today: "Aujourd'hui",
    yesterday: "Hier",
  },
  es: {
    title: "Búsquedas recientes",
    sub: "Cada palabra que tus hijos buscaron, de la más reciente a la más antigua.",
    empty: "Aún no hay búsquedas. Cuando tus hijos buscan una palabra en Modo Niños, aparece aquí.",
    today: "Hoy",
    yesterday: "Ayer",
  },
  pt: {
    title: "Pesquisas recentes",
    sub: "Cada palavra que os seus filhos procuraram, da mais recente para a mais antiga.",
    empty: "Ainda não há pesquisas. Quando os seus filhos procuram uma palavra no Modo Criança, ela aparece aqui.",
    today: "Hoje",
    yesterday: "Ontem",
  },
  it: {
    title: "Ricerche recenti",
    sub: "Ogni parola che i tuoi figli hanno cercato, dalla più recente alla meno recente.",
    empty: "Ancora nessuna ricerca. Quando i tuoi figli cercano una parola in Modalità Bambini, compare qui.",
    today: "Oggi",
    yesterday: "Ieri",
  },
  de: {
    title: "Neueste Suchen",
    sub: "Jedes Wort, das deine Kinder nachgeschlagen haben, das neueste zuerst.",
    empty: "Noch keine Suchen. Wenn deine Kinder im Kindermodus ein Wort suchen, erscheint es hier.",
    today: "Heute",
    yesterday: "Gestern",
  },
  nl: {
    title: "Recente zoekopdrachten",
    sub: "Elk woord dat je kinderen hebben opgezocht, het nieuwste eerst.",
    empty: "Nog geen zoekopdrachten. Als je kinderen in de Kindermodus een woord opzoeken, verschijnt het hier.",
    today: "Vandaag",
    yesterday: "Gisteren",
  },
  cs: {
    title: "Poslední vyhledávání",
    sub: "Každé slovo, které vaše děti vyhledaly, nejnovější první.",
    empty: "Zatím žádná vyhledávání. Když vaše děti vyhledají slovo v Dětském režimu, objeví se zde.",
    today: "Dnes",
    yesterday: "Včera",
  },
  sk: {
    title: "Posledné vyhľadávania",
    sub: "Každé slovo, ktoré vaše deti vyhľadali, najnovšie ako prvé.",
    empty: "Zatiaľ žiadne vyhľadávania. Keď vaše deti vyhľadajú slovo v Detskom režime, objaví sa tu.",
    today: "Dnes",
    yesterday: "Včera",
  },
  uk: {
    title: "Нещодавні пошуки",
    sub: "Усі слова, які шукали ваші діти, найновіші вгорі.",
    empty: "Пошуків ще немає. Коли ваші діти шукатимуть слово в Дитячому режимі, воно з'явиться тут.",
    today: "Сьогодні",
    yesterday: "Учора",
  },
  pl: {
    title: "Ostatnie wyszukiwania",
    sub: "Wszystkie słowa wyszukane przez Twoje dzieci, najnowsze na górze.",
    empty: "Nie ma jeszcze wyszukiwań. Gdy Twoje dzieci wyszukają słowo w Trybie dla dzieci, pojawi się tutaj.",
    today: "Dziś",
    yesterday: "Wczoraj",
  },
  tr: {
    title: "Son aramalar",
    sub: "Çocuklarınızın aradığı tüm kelimeler, en yenisi üstte.",
    empty: "Henüz arama yok. Çocuklarınız Çocuk Modunda bir kelime aradığında burada görünür.",
    today: "Bugün",
    yesterday: "Dün",
  },
  ru: {
    title: "Недавние поиски",
    sub: "Все слова, которые искали ваши дети, самые новые вверху.",
    empty: "Поисков пока нет. Когда ваши дети найдут слово в Детском режиме, оно появится здесь.",
    today: "Сегодня",
    yesterday: "Вчера",
  },
  ja: {
    title: "最近調べた単語",
    sub: "お子さまが調べたすべての単語を、新しい順に表示します。",
    empty: "まだ調べた単語はありません。お子さまがキッズモードで単語を検索すると、ここに表示されます。",
    today: "今日",
    yesterday: "昨日",
  },
  hi: {
    title: "हाल में खोजे गए शब्द",
    sub: "आपके बच्चों ने जो भी शब्द खोजे, सबसे नए पहले।",
    empty: "अभी तक कोई शब्द नहीं खोजा गया। जब आपके बच्चे किड्स मोड में कोई शब्द खोजेंगे, तो वह यहाँ दिखेगा।",
    today: "आज",
    yesterday: "कल",
  },
  fa: {
    title: "جست‌وجوهای اخیر",
    sub: "هر واژه‌ای که فرزندانتان جست‌وجو کرده‌اند، جدیدترین‌ها اول.",
    empty: "هنوز جست‌وجویی انجام نشده است. وقتی فرزندانتان در حالت کودکان واژه‌ای را جست‌وجو کنند، اینجا نمایان می‌شود.",
    today: "امروز",
    yesterday: "دیروز",
  },
  id: {
    title: "Pencarian terbaru",
    sub: "Setiap kata yang dicari anak-anak Anda, terbaru lebih dulu.",
    empty: "Belum ada pencarian. Saat anak-anak Anda mencari kata di Mode Anak, kata itu akan muncul di sini.",
    today: "Hari ini",
    yesterday: "Kemarin",
  },
  am: {
    title: "የቅርብ ጊዜ ፍለጋዎች",
    sub: "ልጆችዎ የፈለጉት እያንዳንዱ ቃል፣ አዲሱ መጀመሪያ።",
    empty: "ገና ፍለጋዎች የሉም። ልጆችዎ በKids Mode ውስጥ ቃል ሲፈልጉ፣ እዚህ ይታያል።",
    today: "ዛሬ",
    yesterday: "ትናንት",
  },
  el: {
    title: "Πρόσφατες αναζητήσεις",
    sub: "Κάθε λέξη που αναζήτησαν τα παιδιά σας, με τις πιο πρόσφατες πρώτες.",
    empty: "Δεν υπάρχουν ακόμη αναζητήσεις. Όταν τα παιδιά σας αναζητούν μια λέξη στο Kids Mode, εμφανίζεται εδώ.",
    today: "Σήμερα",
    yesterday: "Χθες",
  },
  zu: {
    title: "Ukubheka kwakamuva",
    sub: "Wonke amagama izingane zakho eziwabhekile, amasha kuqala.",
    empty: "Akukho ukubheka okwamanje. Lapho izingane zakho zisesha igama ku-Kids Mode, livela lapha.",
    today: "Namuhla",
    yesterday: "Izolo",
  },
  xh: {
    title: "Ukhangelo lwakutshanje",
    sub: "Lonke igama abantwana bakho abalikhangeleyo, elitsha kuqala.",
    empty: "Akukabikho khangelo. Xa abantwana bakho bekhangela igama kwiMo yabantwana, liza kuvela apha.",
    today: "Namhlanje", yesterday: "Izolo",
  },
  nso: {
    title: "Dinyakišišo tša morago bjale",
    sub: "Lentšu le lengwe le le lengwe leo bana ba gago ba le nyakilego, la morago bjale pele.",
    empty: "Ga go eso be le dinyakišišo. Ge bana ba gago ba nyaka lentšu ka Mokgwa wa bana, le tla bonagala mo.",
    today: "Lehono", yesterday: "Maabane",
  },
  tn: {
    title: "Dipatlo tsa bosheng",
    sub: "Lefoko lengwe le lengwe le bana ba gago ba le batlileng, a bosheng pele.",
    empty: "Ga go ise go nne le dipatlo. Fa bana ba gago ba batla lefoko mo Mokgweng wa bana, le tla bonala fa.",
    today: "Gompieno", yesterday: "Maabane",
  },
  st: {
    title: "Dipatlo tsa morao tjena",
    sub: "Lentswe le leng le le leng leo bana ba hao ba le batlileng, la morao tjena pele.",
    empty: "Ha ho dipatlo hajwale. Ha bana ba hao ba batla lentswe ka Mokgwa wa bana, le tla hlaha mona.",
    today: "Kajeno", yesterday: "Maobane",
  },
  ts: {
    title: "Ku lava ka sweswinyana",
    sub: "Rito rin'wana na rin'wana leri vana va n'wina va ri laveke, lama nga mantshwa ma sungula.",
    empty: "A ku si laviwa nchumu. Loko vana va n'wina va lava rito eka Xiyimo xa vana, ri ta humelela laha.",
    today: "Namuntlha", yesterday: "Tolo",
  },
  ss: {
    title: "Lokusandza kuseshwa",
    sub: "Onkhe emagama bantfwana bakho labawaseshile, lamasha kucala.",
    empty: "Akukaseshwa lutfo. Nangabe bantfwana bakho basesha ligama eSimweni sebantfwana, litawuvela lapha.",
    today: "Lamuhla", yesterday: "Itolo",
  },
  ve: {
    title: "Zwe zwa ṱoḓiwa zwenezwino",
    sub: "Ipfi ḽiṅwe na ḽiṅwe ḽe vhana vhaṋu vha ḽi ṱoḓa, a zwenezwino u thoma.",
    empty: "A hu athu u vha na zwe zwa ṱoḓiwa. Musi vhana vhaṋu vha tshi ṱoḓa ipfi kha Tshiimo tsha vhana, ḽi ḓo vhonala fhano.",
    today: "Ṋamusi", yesterday: "Mulovha",
  },
  nr: {
    title: "Okufunwe kwakutjhanje",
    sub: "Ilizwi ngalinye abantwana bakho abalifunileko, kuthoma okutjha.",
    empty: "Akukabikhona okufunwako. Lokha abantwana bakho nabafuna ilizwi ngeModi yabantwana, lizakuvela lapha.",
    today: "Namhlanje", yesterday: "Izolo",
  },
  ar: {
    title: "عمليات البحث الأخيرة",
    sub: "كل كلمة بحث عنها أطفالك، الأحدث أولًا.",
    empty: "لا توجد عمليات بحث بعد. عندما يبحث أطفالك عن كلمة في Kids Mode، ستظهر هنا.",
    today: "اليوم",
    yesterday: "أمس",
  },
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
  vi: {
    title: "Tra cứu gần đây",
    sub: "Mọi từ con bạn đã tra, mới nhất trước.",
    empty: "Chưa có lượt tra cứu nào. Khi con bạn tìm một từ ở Chế độ Trẻ em, từ đó sẽ hiện ở đây.",
    today: "Hôm nay",
    yesterday: "Hôm qua",
  },
  fil: {
    title: "Mga kamakailang hinanap",
    sub: "Bawat salitang hinanap ng mga anak mo, pinakabago muna.",
    empty: "Wala pang hinanap. Kapag naghanap ng salita ang mga anak mo sa Kids Mode, lalabas ito rito.",
    today: "Ngayon",
    yesterday: "Kahapon",
  },
  af: {
    title: "Onlangse soektogte",
    sub: "Elke woord wat jou kinders opgesoek het, nuutste eerste.",
    empty: "Nog geen soektogte nie. Wanneer jou kinders 'n woord in Kindermodus soek, verskyn dit hier.",
    today: "Vandag",
    yesterday: "Gister",
  },
  sw: {
    title: "Utafutaji wa hivi karibuni",
    sub: "Kila neno ambalo watoto wako walitafuta, jipya kwanza.",
    empty: "Bado hakuna utafutaji. Watoto wako wakitafuta neno katika Hali ya Watoto, litaonekana hapa.",
    today: "Leo",
    yesterday: "Jana",
  },
  "zh-CN": {
    title: "最近查询",
    sub: "孩子们查过的每个词，最新的在前。",
    empty: "还没有查询记录。孩子在儿童模式下查词后，会显示在这里。",
    today: "今天",
    yesterday: "昨天",
  },
  "zh-TW": {
    title: "最近查詢",
    sub: "孩子們查過的每個字詞，最新的在前。",
    empty: "還沒有查詢紀錄。孩子在兒童模式下查字詞後，會顯示在這裡。",
    today: "今天",
    yesterday: "昨天",
  },
  ko: {
    title: "최근 검색",
    sub: "아이들이 찾아본 모든 단어를 최신순으로 보여 드려요.",
    empty: "아직 검색 기록이 없어요. 아이들이 키즈 모드에서 단어를 찾으면 여기에 표시돼요.",
    today: "오늘",
    yesterday: "어제",
  },
  th: {
    title: "คำที่ค้นหาล่าสุด",
    sub: "ทุกคำที่ลูก ๆ ค้นหา เรียงจากล่าสุด",
    empty: "ยังไม่มีการค้นหา เมื่อลูก ๆ ค้นหาคำในโหมดเด็ก คำนั้นจะแสดงที่นี่",
    today: "วันนี้",
    yesterday: "เมื่อวาน",
  },
  bn: {
    title: "সাম্প্রতিক খোঁজ",
    sub: "আপনার সন্তানেরা যত শব্দ খুঁজেছে, নতুনগুলো আগে।",
    empty: "এখনো কোনো খোঁজ নেই। আপনার সন্তানেরা কিডস মোডে কোনো শব্দ খুঁজলে তা এখানে দেখা যাবে।",
    today: "আজ",
    yesterday: "গতকাল",
  },
  da: {
    title: "Seneste opslag",
    sub: "Hvert ord dine børn har slået op, nyeste først.",
    empty: "Ingen opslag endnu. Når dine børn søger efter et ord i Børnetilstand, vises det her.",
    today: "I dag",
    yesterday: "I går",
  },
  hu: {
    title: "Legutóbbi keresések",
    sub: "Minden szó, amit a gyerekeid kikerestek, a legújabb elöl.",
    empty: "Még nincs keresés. Amikor a gyerekeid Gyerek módban rákeresnek egy szóra, itt jelenik meg.",
    today: "Ma",
    yesterday: "Tegnap",
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
        marginTop: 18, background: "var(--surface)", border: "1px solid var(--rule)",
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
              borderTop: i === 0 ? "none" : "1px solid var(--mist)",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{it.word}</span>
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

// ─── Alerts about the kids (parent): words looked up and everything they finish (Gadi 2026-10-12) ───
const NOTIF_COPY: Record<string, {
  title: string; sub: string; enable: string;
  instant: string; instantSub: string; daily: string; dailySub: string;
  pushOn: string; pushUnavailable: string; emailNote: string;
  enableHere: string; enableHereHint: string;
}> = {
  fr: {
    title: "Alertes sur vos enfants",
    sub: "Soyez averti de tout ce que vos enfants font dans Gadit : mots cherchés, dictées, leçons, jeux et lecture.",
    enable: "M'informer de ce que font mes enfants dans Gadit",
    instant: "Tout, tout de suite",
    instantSub: "Une notification dès qu'ils cherchent un mot ou terminent un exercice.",
    daily: "Résumé quotidien",
    dailySub: "Une seule notification à la fin de la journée.",
    pushOn: "Les alertes téléphone sont activées pour cet appareil.",
    pushUnavailable: "Cet appareil ne peut pas afficher de bannière, mais vous recevrez tout de même les e-mails.",
    emailNote: "Envoyé à l'adresse e-mail de votre compte, et sous forme de bannière quand c'est possible.",
    enableHere: "Activer les alertes sur cet appareil",
    enableHereHint: "Chaque téléphone ou ordinateur doit être activé une fois. Touchez ici sur votre téléphone (ouvert depuis l'écran d'accueil) pour recevoir aussi la bannière.",
  },
  es: {
    title: "Avisos sobre tus hijos",
    sub: "Recibe un aviso de todo lo que tus hijos hacen en Gadit: palabras que buscan, dictados, lecciones, juegos y lectura.",
    enable: "Avisarme de lo que hacen mis hijos en Gadit",
    instant: "Todo, al momento",
    instantSub: "Un aviso en cuanto buscan una palabra o terminan una práctica.",
    daily: "Resumen diario",
    dailySub: "Un solo aviso al final del día.",
    pushOn: "Los avisos en el teléfono están activados para este dispositivo.",
    pushUnavailable: "Este dispositivo no puede mostrar un aviso en pantalla, pero seguirás recibiendo los correos.",
    emailNote: "Se envía al correo de tu cuenta y como aviso en el teléfono cuando es posible.",
    enableHere: "Activar los avisos en este dispositivo",
    enableHereHint: "Cada teléfono u ordenador debe activarse una vez. Toca aquí en tu teléfono (abierto desde la pantalla de inicio) para recibir también el aviso allí.",
  },
  pt: {
    title: "Alertas sobre os seus filhos",
    sub: "Receba uma notificação de tudo o que os seus filhos fazem no Gadit: palavras que procuram, ditados, lições, jogos e leitura.",
    enable: "Avisar-me do que os meus filhos fazem no Gadit",
    instant: "Tudo, na hora",
    instantSub: "Uma notificação assim que procuram uma palavra ou terminam uma prática.",
    daily: "Resumo diário",
    dailySub: "Uma única notificação no fim do dia.",
    pushOn: "Os alertas no telemóvel estão ativados para este dispositivo.",
    pushUnavailable: "Este dispositivo não consegue mostrar um alerta no ecrã, mas continua a receber os e-mails.",
    emailNote: "Enviado para o e-mail da sua conta e como alerta no ecrã quando possível.",
    enableHere: "Ativar os alertas neste dispositivo",
    enableHereHint: "Cada telemóvel ou computador precisa de ser ativado uma vez. Toque aqui no seu telemóvel (aberto a partir do ecrã inicial) para receber também o alerta aí.",
  },
  it: {
    title: "Avvisi sui tuoi figli",
    sub: "Ricevi un avviso su tutto ciò che i tuoi figli fanno in Gadit: parole cercate, dettati, lezioni, giochi e lettura.",
    enable: "Avvisami di ciò che fanno i miei figli in Gadit",
    instant: "Tutto, subito",
    instantSub: "Un avviso appena cercano una parola o finiscono un esercizio.",
    daily: "Riepilogo giornaliero",
    dailySub: "Un solo avviso a fine giornata.",
    pushOn: "Gli avvisi sul telefono sono attivi per questo dispositivo.",
    pushUnavailable: "Questo dispositivo non può mostrare un avviso a schermo, ma riceverai comunque le e-mail.",
    emailNote: "Inviato all'e-mail del tuo account e come avviso a schermo quando è possibile.",
    enableHere: "Attiva gli avvisi su questo dispositivo",
    enableHereHint: "Ogni telefono o computer va attivato una volta. Tocca qui sul tuo telefono (aperto dalla schermata Home) per ricevere l'avviso anche lì.",
  },
  de: {
    title: "Benachrichtigungen zu euren Kindern",
    sub: "Erfahrt alles, was eure Kinder in Gadit machen: gesuchte Wörter, Diktate, Lektionen, Spiele und Lesen.",
    enable: "Mir mitteilen, was meine Kinder in Gadit machen",
    instant: "Alles, sofort",
    instantSub: "Eine Nachricht, sobald ein Wort gesucht oder eine Übung beendet wird.",
    daily: "Tägliche Zusammenfassung",
    dailySub: "Eine Benachrichtigung am Ende des Tages.",
    pushOn: "Telefon-Benachrichtigungen sind für dieses Gerät aktiviert.",
    pushUnavailable: "Dieses Gerät kann kein Telefon-Banner anzeigen, aber du erhältst weiterhin E-Mails.",
    emailNote: "Wird an die E-Mail-Adresse deines Kontos gesendet und als Telefon-Banner, wenn verfügbar.",
    enableHere: "Benachrichtigungen auf diesem Gerät aktivieren",
    enableHereHint: "Jedes Telefon oder jeder Computer muss einmal aktiviert werden. Tippe hier auf deinem Telefon (vom Startbildschirm aus geöffnet), um das Banner auch dort zu erhalten.",
  },
  nl: {
    title: "Meldingen over je kinderen",
    sub: "Krijg een melding van alles wat je kinderen in Gadit doen: opgezochte woorden, dictees, lessen, spellen en lezen.",
    enable: "Laat me weten wat mijn kinderen in Gadit doen",
    instant: "Alles, meteen",
    instantSub: "Een melding zodra ze een woord opzoeken of een oefening afmaken.",
    daily: "Dagelijkse samenvatting",
    dailySub: "Eén melding aan het eind van de dag.",
    pushOn: "Telefoonmeldingen staan aan voor dit apparaat.",
    pushUnavailable: "Dit apparaat kan geen telefoonbanner tonen, maar je ontvangt nog steeds e-mails.",
    emailNote: "Verzonden naar het e-mailadres van je account, en als telefoonbanner wanneer beschikbaar.",
    enableHere: "Meldingen op dit apparaat inschakelen",
    enableHereHint: "Elke telefoon of computer moet één keer worden ingeschakeld. Tik hier op je telefoon (geopend vanaf het startscherm) om de banner ook daar te krijgen.",
  },
  cs: {
    title: "Upozornění na děti",
    sub: "Dostávejte zprávy o všem, co děti v Gadit dělají: hledaná slova, diktáty, lekce, hry a čtení.",
    enable: "Dávat mi vědět, co děti v Gadit dělají",
    instant: "Všechno, hned",
    instantSub: "Upozornění, jakmile hledají slovo nebo dokončí cvičení.",
    daily: "Denní souhrn",
    dailySub: "Jedno upozornění na konci dne.",
    pushOn: "Upozornění na telefonu jsou pro toto zařízení zapnutá.",
    pushUnavailable: "Toto zařízení nedokáže zobrazit banner na telefonu, ale e-maily budete stále dostávat.",
    emailNote: "Odesláno na e-mail vašeho účtu a jako banner na telefonu, když je to možné.",
    enableHere: "Zapnout upozornění na tomto zařízení",
    enableHereHint: "Každý telefon nebo počítač je potřeba jednou zapnout. Klepněte sem na svém telefonu (otevřeném z domovské obrazovky), abyste banner dostávali i tam.",
  },
  sk: {
    title: "Upozornenia na deti",
    sub: "Dostávajte správy o všetkom, čo deti v Gadit robia: hľadané slová, diktáty, lekcie, hry a čítanie.",
    enable: "Dávať mi vedieť, čo deti v Gadit robia",
    instant: "Všetko, hneď",
    instantSub: "Upozornenie, hneď ako hľadajú slovo alebo dokončia cvičenie.",
    daily: "Denný súhrn",
    dailySub: "Jedno upozornenie na konci dňa.",
    pushOn: "Upozornenia na telefóne sú pre toto zariadenie zapnuté.",
    pushUnavailable: "Toto zariadenie nedokáže zobraziť banner na telefóne, ale e-maily budete stále dostávať.",
    emailNote: "Odoslané na e-mail vášho účtu a ako banner na telefóne, keď je to možné.",
    enableHere: "Zapnúť upozornenia na tomto zariadení",
    enableHereHint: "Každý telefón alebo počítač je potrebné raz zapnúť. Ťuknite sem na svojom telefóne (otvorenom z domovskej obrazovky), aby ste banner dostávali aj tam.",
  },
  uk: {
    title: "Сповіщення про дітей",
    sub: "Дізнавайтеся про все, що діти роблять у Gadit: слова, які шукають, диктанти, уроки, ігри та читання.",
    enable: "Повідомляти мені, що діти роблять у Gadit",
    instant: "Усе й одразу",
    instantSub: "Сповіщення, щойно дитина шукає слово або закінчує заняття.",
    daily: "Щоденний підсумок",
    dailySub: "Одне сповіщення наприкінці дня.",
    pushOn: "Сповіщення на телефон увімкнено для цього пристрою.",
    pushUnavailable: "Цей пристрій не може показувати банер на телефоні, але ви все одно отримуватимете листи.",
    emailNote: "Надсилається на пошту вашого облікового запису, а також банером на телефон, коли це можливо.",
    enableHere: "Увімкнути сповіщення на цьому пристрої",
    enableHereHint: "Кожен телефон чи комп'ютер потрібно увімкнути один раз. Натисніть тут на своєму телефоні (відкривши з головного екрана), щоб отримувати банер і там.",
  },
  pl: {
    title: "Powiadomienia o dzieciach",
    sub: "Otrzymujcie powiadomienia o wszystkim, co dzieci robią w Gadit: wyszukane słowa, dyktanda, lekcje, gry i czytanie.",
    enable: "Informuj mnie, co dzieci robią w Gadit",
    instant: "Wszystko, od razu",
    instantSub: "Powiadomienie, gdy tylko wyszukają słowo lub skończą ćwiczenie.",
    daily: "Codzienne podsumowanie",
    dailySub: "Jedno powiadomienie na koniec dnia.",
    pushOn: "Powiadomienia na telefon są włączone dla tego urządzenia.",
    pushUnavailable: "To urządzenie nie może wyświetlać banera na telefonie, ale nadal będziesz otrzymywać e-maile.",
    emailNote: "Wysyłane na adres e-mail Twojego konta oraz jako baner na telefon, gdy jest to możliwe.",
    enableHere: "Włącz powiadomienia na tym urządzeniu",
    enableHereHint: "Każdy telefon i komputer trzeba włączyć raz. Naciśnij tutaj na swoim telefonie (otwartym z ekranu głównego), aby otrzymywać baner także tam.",
  },
  tr: {
    title: "Çocuklarınızla ilgili bildirimler",
    sub: "Çocuklarınızın Gadit'te yaptığı her şeyden haberdar olun: aradıkları kelimeler, dikteler, dersler, oyunlar ve okuma.",
    enable: "Çocuklarımın Gadit'te ne yaptığını bana bildir",
    instant: "Her şey, hemen",
    instantSub: "Bir kelime aradıklarında ya da bir çalışmayı bitirdiklerinde bildirim.",
    daily: "Günlük özet",
    dailySub: "Günün sonunda tek bir bildirim.",
    pushOn: "Bu cihaz için telefon bildirimleri açık.",
    pushUnavailable: "Bu cihaz telefon başlığı gösteremiyor ama yine de e-posta almaya devam edeceksiniz.",
    emailNote: "Hesap e-postanıza ve mümkün olduğunda telefon başlığı olarak gönderilir.",
    enableHere: "Bu cihazda bildirimleri aç",
    enableHereHint: "Her telefon veya bilgisayarın bir kez açılması gerekir. Başlığı orada da almak için telefonunuzda (ana ekrandan açarak) buraya dokunun.",
  },
  ru: {
    title: "Уведомления о детях",
    sub: "Узнавайте обо всём, что дети делают в Gadit: слова, которые они ищут, диктанты, уроки, игры и чтение.",
    enable: "Сообщать мне, что дети делают в Gadit",
    instant: "Всё и сразу",
    instantSub: "Уведомление, как только ребёнок ищет слово или заканчивает занятие.",
    daily: "Сводка за день",
    dailySub: "Одно уведомление в конце дня.",
    pushOn: "Оповещения на телефон включены для этого устройства.",
    pushUnavailable: "Это устройство не может показывать баннер на телефоне, но вы всё равно будете получать письма.",
    emailNote: "Отправляется на почту вашего аккаунта, а также баннером на телефон, когда это возможно.",
    enableHere: "Включить оповещения на этом устройстве",
    enableHereHint: "Каждый телефон или компьютер нужно включить один раз. Нажмите здесь на своём телефоне (открыв с домашнего экрана), чтобы получать баннер и там.",
  },
  ja: {
    title: "お子さんについてのお知らせ",
    sub: "お子さんがGaditでしたことをすべてお知らせします：調べた単語、書き取り、レッスン、ゲーム、読み物。",
    enable: "子どもがGaditでしたことを知らせる",
    instant: "すべて、すぐに",
    instantSub: "単語を調べたり練習を終えたりしたらすぐにお知らせします。",
    daily: "1日のまとめ",
    dailySub: "1日の終わりにまとめて1回お知らせします。",
    pushOn: "この端末では通知がオンになっています。",
    pushUnavailable: "この端末では通知バナーを表示できませんが、メールは届きます。",
    emailNote: "アカウントのメールに送られ、可能な場合は通知バナーでもお届けします。",
    enableHere: "この端末で通知をオンにする",
    enableHereHint: "スマートフォンやパソコンごとに一度オンにする必要があります。バナーを受け取るには、ホーム画面から開いたスマートフォンでここをタップしてください。",
  },
  hi: {
    title: "बच्चों के बारे में सूचनाएँ",
    sub: "बच्चे Gadit में जो कुछ भी करते हैं, उसकी सूचना पाएँ: खोजे गए शब्द, श्रुतलेख, पाठ, खेल और पढ़ना।",
    enable: "मुझे बताएँ कि बच्चे Gadit में क्या करते हैं",
    instant: "सब कुछ, तुरंत",
    instantSub: "शब्द खोजते ही या अभ्यास पूरा करते ही सूचना।",
    daily: "दैनिक सारांश",
    dailySub: "दिन के अंत में एक सूचना।",
    pushOn: "इस डिवाइस पर फ़ोन सूचनाएँ चालू हैं।",
    pushUnavailable: "यह डिवाइस फ़ोन बैनर नहीं दिखा सकता, लेकिन आपको ईमेल फिर भी मिलेंगे।",
    emailNote: "आपके खाते के ईमेल पर भेजी जाती हैं, और उपलब्ध होने पर फ़ोन बैनर के रूप में भी।",
    enableHere: "इस डिवाइस पर सूचनाएँ चालू करें",
    enableHereHint: "हर फ़ोन या कंप्यूटर को एक बार चालू करना होता है। वहाँ भी बैनर पाने के लिए, होम स्क्रीन से खोले गए अपने फ़ोन पर यहाँ टैप करें।",
  },
  fa: {
    title: "اعلان‌های مربوط به بچه‌ها",
    sub: "از هر کاری که بچه‌ها در Gadit انجام می‌دهند باخبر شوید: کلمه‌هایی که جستجو می‌کنند، دیکته، درس، بازی و خواندن.",
    enable: "به من بگو بچه‌ها در Gadit چه می‌کنند",
    instant: "همه‌چیز، فوری",
    instantSub: "اعلان به محض جستجوی یک کلمه یا پایان یک تمرین.",
    daily: "خلاصه روزانه",
    dailySub: "یک اعلان در پایان روز.",
    pushOn: "اعلان‌های تلفن برای این دستگاه روشن است.",
    pushUnavailable: "این دستگاه نمی‌تواند بنر تلفن را نشان دهد، اما همچنان ایمیل دریافت می‌کنید.",
    emailNote: "به ایمیل حساب شما ارسال می‌شود و در صورت امکان به‌صورت بنر تلفن هم نمایش داده می‌شود.",
    enableHere: "روشن‌کردن اعلان‌ها روی این دستگاه",
    enableHereHint: "هر تلفن یا رایانه باید یک‌بار روشن شود. برای دریافت بنر روی آن هم، روی تلفن خود (بازشده از صفحه اصلی) اینجا را لمس کنید.",
  },
  id: {
    title: "Pemberitahuan tentang anak-anak",
    sub: "Dapatkan pemberitahuan tentang semua yang dilakukan anak di Gadit: kata yang dicari, dikte, pelajaran, permainan, dan membaca.",
    enable: "Beri tahu saya apa yang dilakukan anak-anak di Gadit",
    instant: "Semuanya, langsung",
    instantSub: "Pemberitahuan begitu mereka mencari kata atau menyelesaikan latihan.",
    daily: "Ringkasan harian",
    dailySub: "Satu pemberitahuan di akhir hari.",
    pushOn: "Peringatan ponsel aktif untuk perangkat ini.",
    pushUnavailable: "Perangkat ini tidak dapat menampilkan banner ponsel, tetapi Anda tetap akan menerima email.",
    emailNote: "Dikirim ke email akun Anda, dan sebagai banner ponsel bila tersedia.",
    enableHere: "Aktifkan peringatan di perangkat ini",
    enableHereHint: "Setiap ponsel atau komputer perlu diaktifkan sekali. Ketuk di sini pada ponsel Anda (dibuka dari layar utama) untuk mendapatkan banner di sana juga.",
  },
  am: {
    title: "ስለ ልጆቹ ማሳወቂያዎች",
    sub: "ልጆቹ በGadit የሚያደርጉትን ሁሉ ይወቁ፦ የፈለጓቸው ቃላት፣ ቃላት መጻፍ፣ ትምህርቶች፣ ጨዋታዎች እና ንባብ።",
    enable: "ልጆቼ በGadit የሚያደርጉትን አሳውቁኝ",
    instant: "ሁሉንም፣ ወዲያውኑ",
    instantSub: "ቃል እንደፈለጉ ወይም ልምምድ እንደጨረሱ ማሳወቂያ።",
    daily: "የቀኑ ማጠቃለያ",
    dailySub: "በቀኑ መጨረሻ አንድ ማሳወቂያ።",
    pushOn: "ለዚህ መሣሪያ የስልክ ማንቂያዎች በርተዋል።",
    pushUnavailable: "ይህ መሣሪያ የስልክ ባነር ማሳየት አይችልም፣ ግን አሁንም ኢሜይሎችን ያገኛሉ።",
    emailNote: "ወደ መለያዎ ኢሜይል ይላካል፣ እና ሲገኝ እንደ ስልክ ባነር።",
    enableHere: "በዚህ መሣሪያ ላይ ማንቂያዎችን ያብሩ",
    enableHereHint: "እያንዳንዱ ስልክ ወይም ኮምፒውተር አንድ ጊዜ መብራት አለበት። ባነሩን እዚያም ለማግኘት (ከመነሻ ማያ ገጹ የተከፈተውን) በስልክዎ እዚህ ይንኩ።",
  },
  el: {
    title: "Ειδοποιήσεις για τα παιδιά",
    sub: "Μάθετε ό,τι κάνουν τα παιδιά στο Gadit: λέξεις που αναζητούν, υπαγορεύσεις, μαθήματα, παιχνίδια και ανάγνωση.",
    enable: "Ενημερώστε με τι κάνουν τα παιδιά μου στο Gadit",
    instant: "Τα πάντα, αμέσως",
    instantSub: "Μια ειδοποίηση μόλις αναζητήσουν λέξη ή τελειώσουν μια εξάσκηση.",
    daily: "Ημερήσια σύνοψη",
    dailySub: "Μία ειδοποίηση στο τέλος της ημέρας.",
    pushOn: "Οι ειδοποιήσεις τηλεφώνου είναι ενεργές για αυτή τη συσκευή.",
    pushUnavailable: "Αυτή η συσκευή δεν μπορεί να εμφανίσει banner τηλεφώνου, αλλά θα λαμβάνετε ακόμη email.",
    emailNote: "Αποστέλλεται στο email του λογαριασμού σας και ως banner τηλεφώνου όταν είναι διαθέσιμο.",
    enableHere: "Ενεργοποιήστε τις ειδοποιήσεις σε αυτή τη συσκευή",
    enableHereHint: "Κάθε τηλέφωνο ή υπολογιστής χρειάζεται να ενεργοποιηθεί μία φορά. Πατήστε εδώ στο τηλέφωνό σας (ανοιγμένο από την αρχική οθόνη) για να λαμβάνετε το banner και εκεί.",
  },
  zu: {
    title: "Izaziso ngezingane",
    sub: "Yaziswa ngakho konke izingane ezikwenzayo ku-Gadit: amagama aziwafunayo, ukupela, izifundo, imidlalo nokufunda.",
    enable: "Ngazise ukuthi izingane zami zenzani ku-Gadit",
    instant: "Konke, ngokushesha",
    instantSub: "Isaziso uma befuna igama noma beqeda ukuzijwayeza.",
    daily: "Isifinyezo sansuku zonke",
    dailySub: "Isaziso esisodwa ekupheleni kosuku.",
    pushOn: "Izaziso zefoni zivuliwe kule divayisi.",
    pushUnavailable: "Le divayisi ayikwazi ukubonisa ibhena yefoni, kodwa usazothola ama-imeyili.",
    emailNote: "Ithunyelwa ku-imeyili ye-akhawunti yakho, futhi njengebhena yefoni lapho itholakala.",
    enableHere: "Vula izaziso kule divayisi",
    enableHereHint: "Yonke ifoni noma ikhompyutha idinga ukuvulwa kanye. Thepha lapha efonini yakho (evulwe kusikrini sasekhaya) ukuze uthole ibhena nalapho.",
  },
  xh: {
    title: "Izaziso ngabantwana bakho",
    sub: "Yaziswa ngayo yonke into abayenzayo abantwana bakho kwi-Gadit: amagama abawakhangelayo, upelo, izifundo, imidlalo nokufunda.",
    enable: "Ndixelele into abayenzayo abantwana bam kwi-Gadit",
    instant: "Yonke into, ngoko nangoko", instantSub: "Isaziso kwakuba bekhangela igama okanye begqiba ukuziqhelisa.",
    daily: "Isishwankathelo semihla ngemihla", dailySub: "Isaziso esinye ekupheleni kosuku.",
    pushOn: "Izaziso zefowuni zivuliwe kwesi sixhobo.",
    pushUnavailable: "Esi sixhobo asinakubonisa isaziso sefowuni, kodwa usaza kufumana ii-imeyile.",
    emailNote: "Zithunyelwa kwi-imeyile yeakhawunti yakho, nanjengesaziso sefowuni xa sifumaneka.",
    enableHere: "Vula izaziso kwesi sixhobo",
    enableHereHint: "Ifowuni okanye ikhompyutha nganye kufuneka ivulwe kanye. Cofa apha kwifowuni yakho (evulwe kwisikrini sasekhaya) ukuze ufumane isaziso nalapho.",
  },
  nso: {
    title: "Ditemošo ka bana ba gago",
    sub: "Tsebišwa ka tšohle tšeo bana ba gago ba di dirago go Gadit: mantšu ao ba a nyakago, mopeleto, dithuto, dipapadi le go bala.",
    enable: "Mpotše seo bana ba ka ba se dirago go Gadit",
    instant: "Tšohle, gateetee", instantSub: "Tsebišo ge feela ba nyaka lentšu goba ba fetša tlwaetšo.",
    daily: "Kakaretšo ya letšatši", dailySub: "Tsebišo e tee mafelelong a letšatši.",
    pushOn: "Ditemošo tša mogala di bulegile sedirišweng se.",
    pushUnavailable: "Sedirišwa se ga se kgone go bontšha tsebišo ya mogala, eupša o tla hwetša diimeile.",
    emailNote: "Di romelwa imeileng ya akhaonto ya gago, le bjalo ka tsebišo ya mogala ge e hwetšagala.",
    enableHere: "Bula ditemošo sedirišweng se",
    enableHereHint: "Mogala o mongwe le o mongwe goba khomphutha e nngwe le e nngwe e swanetše go bulwa gatee. Kgotla mo mogaleng wa gago (o bulwe go tšwa sekirining sa gae) gore o hwetše tsebišo le fao.",
  },
  tn: {
    title: "Dikitsiso ka bana ba gago",
    sub: "Itsisiwe ka sengwe le sengwe se bana ba gago ba se dirang mo Gadit: mafoko a ba a batlang, mopeleto, dithuto, metshameko le go bala.",
    enable: "Mpolelele se bana ba me ba se dirang mo Gadit",
    instant: "Sengwe le sengwe, ka bonako", instantSub: "Kitsiso fa fela ba batla lefoko kgotsa ba fetsa boikatiso.",
    daily: "Kakaretso ya letsatsi", dailySub: "Kitsiso e le nngwe kwa bofelong jwa letsatsi.",
    pushOn: "Dikitsiso tsa mogala di butswe mo sedirisweng se.",
    pushUnavailable: "Sedirisiwa se ga se kgone go bontsha kitsiso ya mogala, mme o tla nna o amogela diimeile.",
    emailNote: "Di romelwa kwa imeileng ya akhaonto ya gago, le jaaka kitsiso ya mogala fa e le teng.",
    enableHere: "Bula dikitsiso mo sedirisweng se",
    enableHereHint: "Mogala mongwe le mongwe kgotsa khomputara nngwe le nngwe e tshwanetse go bulwa gangwe. Tobetsa fa mo mogaleng wa gago (o o butsweng go tswa mo sekirining sa gae) go bona kitsiso le teng.",
  },
  st: {
    title: "Ditemoso ka bana ba hao",
    sub: "Tsebiswa ka tsohle tseo bana ba hao ba di etsang ho Gadit: mantswe ao ba a batlang, mopeleto, dithuto, dipapadi le ho bala.",
    enable: "Mpolelle seo bana ba ka ba se etsang ho Gadit",
    instant: "Tsohle, hang hang", instantSub: "Tsebiso hang ha ba batla lentswe kapa ba qeta boikwetliso.",
    daily: "Kakaretso ya letsatsi", dailySub: "Tsebiso e le nngwe qetellong ya letsatsi.",
    pushOn: "Ditemoso tsa fono di butswe sesebedisweng sena.",
    pushUnavailable: "Sesebediswa sena se ke ke sa bontsha tsebiso ya fono, empa o ntse o tla fumana diimeile.",
    emailNote: "Di romelwa imeileng ya akhaonte ya hao, le jwalo ka tsebiso ya fono ha e fumaneha.",
    enableHere: "Bulela ditemoso sesebedisweng sena",
    enableHereHint: "Fono kapa khomphutha e nngwe le e nngwe e hloka ho bulelwa hang. Tobetsa mona fonong ya hao (e butsweng skrineng sa lapeng) hore o fumane tsebiso le moo.",
  },
  ts: {
    title: "Swilemukiso hi vana va n'wina",
    sub: "Kumani swilemukiso hi hinkwaswo leswi vana va n'wina va swi endlaka eka Gadit: marito lawa va ma lavaka, mapeletelo, tidyondzo, mintlangu na ku hlaya.",
    enable: "Ndzi byeleni leswi vana va mina va swi endlaka eka Gadit",
    instant: "Hinkwaswo, hi ku hatlisa", instantSub: "Xilemukiso hi ku hatlisa loko va lava rito kumbe va heta ntoloveto.",
    daily: "Nkatsakanyo wa siku", dailySub: "Xilemukiso xin'we emakumu ka siku.",
    pushOn: "Swilemukiso swa riqingho swi pfuriwile eka xitirhisiwa lexi.",
    pushUnavailable: "Xitirhisiwa lexi a xi koti ku kombisa xilemukiso xa riqingho, kambe mi ta ha kuma timeyili.",
    emailNote: "Swi rhumeriwa eka imeyili ya akhawunti ya n'wina, ni tanihi xilemukiso xa riqingho loko swi koteka.",
    enableHere: "Pfula swilemukiso eka xitirhisiwa lexi",
    enableHereHint: "Riqingho kumbe khompyuta yin'wana na yin'wana yi fanele ku pfuriwa kan'we. Thintani laha eka riqingho ra n'wina (leri pfuriweke eka xikirini xa le kaya) leswaku mi kuma xilemukiso kwalaho na kona.",
  },
  ss: {
    title: "Tatiso ngebantfwana bakho",
    sub: "Yatiswa ngako konkhe bantfwana bakho labakwentako ku-Gadit: emagama labawaseshako, kupela, tifundvo, imidlalo nekufundza.",
    enable: "Ngitjele loko bantfwana bami labakwentako ku-Gadit",
    instant: "Konkhe, masinyane", instantSub: "Satiso nje nangabe basesha ligama nobe baceda kuticecesha.",
    daily: "Sifinyeto salilanga", dailySub: "Satiso sinye ekupheleni kwelilanga.",
    pushOn: "Tatiso tefoni tivuliwe kulelithuluzi.",
    pushUnavailable: "Lelithuluzi alikhoni kukhombisa satiso sefoni, kodvwa usatawutfola ema-imeyili.",
    emailNote: "Kutfunyelwa ku-imeyili ye-akhawunti yakho, nanjengesatiso sefoni nakukhona.",
    enableHere: "Vula tatiso kulelithuluzi",
    enableHereHint: "Lifoni nobe likhompyutha ngalinye kudzingeka livulwe kanye. Cindzetela lapha efonini yakho (uyivule esikrinini sasekhaya) kute utfole satiso nalapho.",
  },
  ve: {
    title: "Ndivhadzo nga ha vhana vhaṋu",
    sub: "Wanani ndivhadzo nga ha zwoṱhe zwine vhana vhaṋu vha zwi ita kha Gadit: maipfi ane vha a ṱoḓa, mipeleto, ngudo, mitambo na u vhala.",
    enable: "Mpfhani zwine vhana vhanga vha zwi ita kha Gadit",
    instant: "Zwoṱhe, nga u ṱavhanya", instantSub: "Ndivhadzo nga u ṱavhanya musi vha tshi ṱoḓa ipfi kana vha tshi fhedza nḓowelo.",
    daily: "Manweledzo a ḓuvha", dailySub: "Ndivhadzo nthihi magumoni a ḓuvha.",
    pushOn: "Ndivhadzo dza founu dzi khou shuma kha tshishumiswa itshi.",
    pushUnavailable: "Tshishumiswa itshi a tshi koni u sumbedza ndivhadzo ya founu, fhedzi ni ḓo kha ḓi wana dziimeiḽi.",
    emailNote: "Dzi rumelwa kha imeiḽi ya akhaunthu yaṋu, na sa ndivhadzo ya founu musi zwi tshi konadzea.",
    enableHere: "Ḓisani ndivhadzo kha tshishumiswa itshi",
    enableHereHint: "Founu iṅwe na iṅwe kana khomphyutha iṅwe na iṅwe i fanela u thomiwa luthihi. Kwamani fhano kha founu yaṋu (yo vulwaho u bva kha tshikirini tsha hayani) uri ni wane ndivhadzo na henefho.",
  },
  nr: {
    title: "Iimlayezo ngabantwana bakho",
    sub: "Yaziswa ngakho koke abantwana bakho abakwenza ku-Gadit: amezwi abawafunako, ukupela, izifundo, imidlalo nokufunda.",
    enable: "Ngazisa ngalokho abantwana bami abakwenza ku-Gadit",
    instant: "Koke, khonokho", instantSub: "Isaziso msinyana nje nabafuna ilizwi namkha baqeda ukuzilolonga.",
    daily: "Isifinyezo selanga", dailySub: "Isaziso sinye ekupheleni kwelanga.",
    pushOn: "Iimlayezo zefowuni zivuliwe kudivayisi le.",
    pushUnavailable: "Idivayisi le ayikghoni ukutjengisa isaziso sefowuni, kodwana usazakuthola ama-imeyili.",
    emailNote: "Kuthunyelwa ku-imeyili ye-akhawunti yakho, nanjengesaziso sefowuni lapho kukghonakala khona.",
    enableHere: "Vula iimlayezo kudivayisi le",
    enableHereHint: "Ifowuni ngayinye namkha ikhomphyutha kufuze ivulwe kanye. Thinta lapha efowunini yakho (evulwe esikrinini sekhaya) bona uthole isaziso nalapho.",
  },
  ar: {
    title: "تنبيهات عن الأطفال",
    sub: "احصلوا على إشعار بكل ما يفعله أطفالكم في Gadit: الكلمات التي بحثوا عنها، الإملاء، الدروس، الألعاب والقراءة.",
    enable: "أخبروني بما يفعله أطفالي في Gadit",
    instant: "كل شيء، فورًا",
    instantSub: "إشعار فور البحث عن كلمة أو إنهاء تمرين.",
    daily: "ملخّص يومي",
    dailySub: "إشعار واحد في نهاية اليوم.",
    pushOn: "تنبيهات الهاتف مُفعّلة على هذا الجهاز.",
    pushUnavailable: "لا يستطيع هذا الجهاز عرض إشعار على الهاتف، لكنك ستظل تتلقى رسائل البريد الإلكتروني.",
    emailNote: "تُرسل إلى بريد حسابك الإلكتروني، وكإشعار على الهاتف عند توفّره.",
    enableHere: "فعّل التنبيهات على هذا الجهاز",
    enableHereHint: "كل هاتف أو حاسوب يحتاج إلى تفعيل مرة واحدة. انقر هنا على هاتفك (المفتوح من الشاشة الرئيسية) لتصلك الإشعارات هناك أيضًا.",
  },
  en: {
    title: "Alerts about your kids",
    sub: "Get notified about everything your kids do in Gadit: words they look up, dictations, lessons, games and reading.",
    enable: "Tell me what my kids do in Gadit",
    instant: "Everything, right away", instantSub: "A notification as soon as they look up a word or finish a practice.",
    daily: "Daily summary", dailySub: "One notification at the end of the day.",
    pushOn: "Phone alerts are on for this device.",
    pushUnavailable: "This device can't show a phone banner, but you'll still get emails.",
    emailNote: "Sent to your account email, and as a phone banner when available.",
    enableHere: "Turn on alerts on this device",
    enableHereHint: "Each phone or computer needs to be turned on once. Tap here on your phone (opened from the home screen) to get the banner there too.",
  },
  he: {
    title: "התראות על הילדים",
    sub: "קבלו הודעה על כל מה שהילדים עושים ב-Gadit: מילים שחיפשו, הכתבות, שיעורים, משחקים וקריאה.",
    enable: "עדכנו אותי על מה שהילדים עושים ב-Gadit",
    instant: "כל דבר, מיד", instantSub: "הודעה ברגע שמחפשים מילה או מסיימים תרגול.",
    daily: "סיכום יומי", dailySub: "התראה אחת בסוף היום.",
    pushOn: "התראות לטלפון פעילות במכשיר הזה.",
    pushUnavailable: "המכשיר הזה לא יכול להציג באנר, אבל עדיין תקבלו אימיילים.",
    emailNote: "נשלח למייל של החשבון, וכבאנר בטלפון כשאפשר.",
    enableHere: "הפעל התראות במכשיר הזה",
    enableHereHint: "כל טלפון או מחשב צריך הפעלה פעם אחת. פתח את Gadit מהמסך הבית בטלפון ולחץ כאן כדי לקבל את הבאנר גם שם.",
  },
  vi: {
    title: "Thông báo về các con",
    sub: "Nhận thông báo về mọi việc các con làm trong Gadit: từ đã tra, chính tả, bài học, trò chơi và đọc.",
    enable: "Cho tôi biết các con làm gì trong Gadit",
    instant: "Mọi thứ, ngay lập tức",
    instantSub: "Thông báo ngay khi con tra một từ hoặc làm xong bài luyện.",
    daily: "Tóm tắt hằng ngày",
    dailySub: "Một thông báo vào cuối ngày.",
    pushOn: "Thông báo trên điện thoại đã bật cho thiết bị này.",
    pushUnavailable: "Thiết bị này không hiển thị được thông báo trên màn hình, nhưng bạn vẫn sẽ nhận được email.",
    emailNote: "Gửi đến email tài khoản của bạn, và dưới dạng thông báo trên điện thoại khi có thể.",
    enableHere: "Bật thông báo trên thiết bị này",
    enableHereHint: "Mỗi điện thoại hoặc máy tính cần bật một lần. Hãy nhấn vào đây trên điện thoại của bạn (mở từ màn hình chính) để nhận thông báo ở đó nữa.",
  },
  fil: {
    title: "Mga abiso tungkol sa mga bata",
    sub: "Maabisuhan sa lahat ng ginagawa ng mga bata sa Gadit: mga salitang hinahanap, pagbaybay, aralin, laro at pagbasa.",
    enable: "Sabihin sa akin ang ginagawa ng mga anak ko sa Gadit",
    instant: "Lahat, agad",
    instantSub: "Abiso sa sandaling maghanap sila ng salita o matapos ang pagsasanay.",
    daily: "Pang-araw-araw na buod",
    dailySub: "Isang abiso sa pagtatapos ng araw.",
    pushOn: "Naka-on ang mga alerto sa phone para sa device na ito.",
    pushUnavailable: "Hindi makapagpakita ng banner ang device na ito, pero makakatanggap ka pa rin ng mga email.",
    emailNote: "Ipinapadala sa email ng iyong account, at bilang banner sa phone kapag posible.",
    enableHere: "I-on ang mga alerto sa device na ito",
    enableHereHint: "Kailangang i-on nang isang beses ang bawat phone o computer. I-tap ito sa iyong phone (binuksan mula sa home screen) para makuha rin doon ang banner.",
  },
  af: {
    title: "Kennisgewings oor julle kinders",
    sub: "Kry 'n kennisgewing oor alles wat julle kinders in Gadit doen: woorde wat hulle opsoek, diktees, lesse, speletjies en lees.",
    enable: "Laat my weet wat my kinders in Gadit doen",
    instant: "Alles, dadelik",
    instantSub: "'n Kennisgewing sodra hulle 'n woord opsoek of 'n oefening klaarmaak.",
    daily: "Daaglikse opsomming",
    dailySub: "Een kennisgewing aan die einde van die dag.",
    pushOn: "Foonwaarskuwings is aan vir hierdie toestel.",
    pushUnavailable: "Hierdie toestel kan nie 'n foonbanier wys nie, maar jy kry steeds e-posse.",
    emailNote: "Gestuur na jou rekening se e-posadres, en as 'n foonbanier waar moontlik.",
    enableHere: "Skakel waarskuwings op hierdie toestel aan",
    enableHereHint: "Elke foon of rekenaar moet een keer aangeskakel word. Tik hier op jou foon (oopgemaak vanaf die tuisskerm) om die banier ook daar te kry.",
  },
  sw: {
    title: "Arifa kuhusu watoto",
    sub: "Pata arifa kuhusu kila kitu watoto wanachofanya kwenye Gadit: maneno wanayotafuta, imla, masomo, michezo na kusoma.",
    enable: "Niambie watoto wangu wanachofanya kwenye Gadit",
    instant: "Kila kitu, mara moja",
    instantSub: "Arifa mara tu wanapotafuta neno au kumaliza zoezi.",
    daily: "Muhtasari wa kila siku",
    dailySub: "Arifa moja mwishoni mwa siku.",
    pushOn: "Arifa za simu zimewashwa kwa kifaa hiki.",
    pushUnavailable: "Kifaa hiki hakiwezi kuonyesha bango la arifa, lakini bado utapokea barua pepe.",
    emailNote: "Hutumwa kwa barua pepe ya akaunti yako, na kama bango kwenye simu inapowezekana.",
    enableHere: "Washa arifa kwenye kifaa hiki",
    enableHereHint: "Kila simu au kompyuta inahitaji kuwashwa mara moja. Gusa hapa kwenye simu yako (iliyofunguliwa kutoka skrini ya mwanzo) ili kupata bango huko pia.",
  },
  "zh-CN": {
    title: "孩子动态提醒",
    sub: "孩子在Gadit做的每件事都会通知您：查过的词、听写、课程、游戏和阅读。",
    enable: "告诉我孩子在Gadit做了什么",
    instant: "每件事，马上通知",
    instantSub: "孩子一查词或完成练习就会收到通知。",
    daily: "每日总结",
    dailySub: "每天结束时发送一条通知。",
    pushOn: "此设备已开启手机提醒。",
    pushUnavailable: "此设备无法显示横幅通知，但你仍会收到电子邮件。",
    emailNote: "发送到你的账户邮箱，条件允许时也会以手机横幅通知。",
    enableHere: "在此设备上开启提醒",
    enableHereHint: "每部手机或电脑都需要开启一次。在手机上（从主屏幕打开）点这里，也能在手机上收到横幅通知。",
  },
  "zh-TW": {
    title: "孩子動態提醒",
    sub: "孩子在Gadit做的每件事都會通知您：查過的詞、聽寫、課程、遊戲和閱讀。",
    enable: "告訴我孩子在Gadit做了什麼",
    instant: "每件事，馬上通知",
    instantSub: "孩子一查詞或完成練習就會收到通知。",
    daily: "每日摘要",
    dailySub: "每天結束時傳送一則通知。",
    pushOn: "此裝置已開啟手機提醒。",
    pushUnavailable: "此裝置無法顯示橫幅通知，但你仍會收到電子郵件。",
    emailNote: "傳送到你的帳戶信箱，可行時也會以手機橫幅通知。",
    enableHere: "在此裝置上開啟提醒",
    enableHereHint: "每支手機或電腦都需要開啟一次。在手機上（從主畫面開啟）點這裡，也能在手機上收到橫幅通知。",
  },
  ko: {
    title: "아이 활동 알림",
    sub: "아이들이 Gadit에서 하는 모든 일을 알려 드려요: 찾아본 단어, 받아쓰기, 수업, 게임, 읽기.",
    enable: "아이들이 Gadit에서 하는 일을 알려 주세요",
    instant: "모든 것, 바로",
    instantSub: "단어를 찾거나 연습을 마치면 바로 알림이 와요.",
    daily: "하루 요약",
    dailySub: "하루가 끝날 때 알림 한 번.",
    pushOn: "이 기기에서 휴대폰 알림이 켜져 있어요.",
    pushUnavailable: "이 기기는 배너 알림을 표시할 수 없지만, 이메일은 계속 받을 수 있어요.",
    emailNote: "계정 이메일로 보내고, 가능하면 휴대폰 배너로도 알려요.",
    enableHere: "이 기기에서 알림 켜기",
    enableHereHint: "휴대폰이나 컴퓨터마다 한 번씩 켜야 해요. 휴대폰에서(홈 화면에서 열어서) 여기를 누르면 그곳에서도 배너를 받을 수 있어요.",
  },
  th: {
    title: "การแจ้งเตือนเกี่ยวกับลูก",
    sub: "รับการแจ้งเตือนทุกอย่างที่ลูกทำใน Gadit: คำที่ค้นหา การเขียนตามคำบอก บทเรียน เกม และการอ่าน",
    enable: "แจ้งฉันว่าลูกทำอะไรใน Gadit",
    instant: "ทุกอย่าง ทันที",
    instantSub: "แจ้งเตือนทันทีที่ค้นหาคำหรือฝึกเสร็จ",
    daily: "สรุปรายวัน",
    dailySub: "แจ้งเตือนครั้งเดียวตอนสิ้นวัน",
    pushOn: "เปิดการแจ้งเตือนทางโทรศัพท์สำหรับอุปกรณ์นี้แล้ว",
    pushUnavailable: "อุปกรณ์นี้แสดงแบนเนอร์แจ้งเตือนไม่ได้ แต่คุณจะยังได้รับอีเมล",
    emailNote: "ส่งไปยังอีเมลของบัญชีคุณ และเป็นแบนเนอร์บนโทรศัพท์เมื่อทำได้",
    enableHere: "เปิดการแจ้งเตือนบนอุปกรณ์นี้",
    enableHereHint: "โทรศัพท์หรือคอมพิวเตอร์แต่ละเครื่องต้องเปิดหนึ่งครั้ง แตะที่นี่บนโทรศัพท์ของคุณ (เปิดจากหน้าจอหลัก) เพื่อรับแบนเนอร์ที่นั่นด้วย",
  },
  bn: {
    title: "বাচ্চাদের নিয়ে সতর্কবার্তা",
    sub: "বাচ্চারা Gadit-এ যা কিছু করে সব জানুন: খোঁজা শব্দ, শ্রুতলিপি, পাঠ, খেলা ও পড়া।",
    enable: "বাচ্চারা Gadit-এ কী করে আমাকে জানান",
    instant: "সবকিছু, সঙ্গে সঙ্গে",
    instantSub: "শব্দ খুঁজলে বা অনুশীলন শেষ করলেই সতর্কবার্তা।",
    daily: "দৈনিক সারসংক্ষেপ",
    dailySub: "দিনের শেষে একটি নোটিফিকেশন।",
    pushOn: "এই ডিভাইসে ফোন সতর্কতা চালু আছে।",
    pushUnavailable: "এই ডিভাইস ফোন ব্যানার দেখাতে পারে না, তবে আপনি ইমেইল পেতে থাকবেন।",
    emailNote: "আপনার অ্যাকাউন্টের ইমেইলে পাঠানো হয়, আর সম্ভব হলে ফোন ব্যানার হিসেবেও।",
    enableHere: "এই ডিভাইসে সতর্কতা চালু করুন",
    enableHereHint: "প্রতিটি ফোন বা কম্পিউটারে একবার চালু করতে হয়। ফোনে (হোম স্ক্রিন থেকে খুলে) এখানে ট্যাপ করুন, তাহলে সেখানেও ব্যানার পাবেন।",
  },
  da: {
    title: "Besked om jeres børn",
    sub: "Få besked om alt, hvad jeres børn laver i Gadit: ord de slår op, diktater, lektioner, spil og læsning.",
    enable: "Fortæl mig, hvad mine børn laver i Gadit",
    instant: "Alt, med det samme",
    instantSub: "En besked, så snart de slår et ord op eller afslutter en øvelse.",
    daily: "Daglig opsummering",
    dailySub: "Én notifikation sidst på dagen.",
    pushOn: "Telefonadvarsler er slået til på denne enhed.",
    pushUnavailable: "Denne enhed kan ikke vise et banner, men du får stadig e-mails.",
    emailNote: "Sendes til din kontos e-mail, og som banner på telefonen, når det er muligt.",
    enableHere: "Slå advarsler til på denne enhed",
    enableHereHint: "Hver telefon eller computer skal slås til én gang. Tryk her på din telefon (åbnet fra hjemmeskærmen) for også at få banneret der.",
  },
  hu: {
    title: "Értesítések a gyerekekről",
    sub: "Értesüljetek mindenről, amit a gyerekek a Gaditban csinálnak: keresett szavak, tollbamondás, leckék, játékok és olvasás.",
    enable: "Szóljatok, mit csinálnak a gyerekeim a Gaditban",
    instant: "Mindent, azonnal",
    instantSub: "Értesítés, amint szót keresnek vagy befejeznek egy gyakorlást.",
    daily: "Napi összefoglaló",
    dailySub: "Egyetlen értesítés a nap végén.",
    pushOn: "A telefonos értesítések be vannak kapcsolva ezen az eszközön.",
    pushUnavailable: "Ez az eszköz nem tud értesítési sávot megjeleníteni, de az e-maileket továbbra is megkapod.",
    emailNote: "A fiókod e-mail-címére küldjük, és ha lehet, telefonos értesítésként is.",
    enableHere: "Értesítések bekapcsolása ezen az eszközön",
    enableHereHint: "Minden telefonon vagy számítógépen egyszer be kell kapcsolni. Koppints ide a telefonodon (a kezdőképernyőről megnyitva), hogy ott is megkapd az értesítést.",
  },
};

/** What the parent wants alerts about (Gadi 2026-10-12): q, search, games, homework. */
const NOTIF_CATS: Record<string, [string, string, string, string]> = {
  en: ["What should we tell you about?", "Words they look up", "Games and duels", "Homework and practice"],
  he: ["על מה לעדכן אתכם?", "מילים שחיפשו", "משחקים ודו-קרב", "שיעורי בית ותרגולים"],
  ar: ["عمّ نخبركم؟", "الكلمات التي بحثوا عنها", "الألعاب والمبارزات", "الواجبات والتمارين"],
  ru: ["О чём сообщать?", "Слова, которые искали", "Игры и дуэли", "Домашка и занятия"],
  es: ["¿De qué te avisamos?", "Palabras que buscan", "Juegos y duelos", "Deberes y prácticas"],
  pt: ["Sobre o que avisamos?", "Palavras que procuram", "Jogos e duelos", "Tarefas e práticas"],
  fr: ["De quoi vous informer ?", "Les mots cherchés", "Jeux et duels", "Devoirs et exercices"],
  de: ["Worüber sollen wir euch informieren?", "Gesuchte Wörter", "Spiele und Duelle", "Hausaufgaben und Übungen"],
  it: ["Su cosa ti avvisiamo?", "Parole cercate", "Giochi e sfide", "Compiti ed esercizi"],
  nl: ["Waarover laten we het je weten?", "Opgezochte woorden", "Spellen en duels", "Huiswerk en oefenen"],
  cs: ["O čem vám dát vědět?", "Hledaná slova", "Hry a souboje", "Úkoly a procvičování"],
  sk: ["O čom vám dať vedieť?", "Hľadané slová", "Hry a súboje", "Úlohy a precvičovanie"],
  uk: ["Про що повідомляти?", "Слова, які шукали", "Ігри та дуелі", "Домашка й заняття"],
  pl: ["O czym was informować?", "Wyszukane słowa", "Gry i pojedynki", "Prace domowe i ćwiczenia"],
  tr: ["Size neyi bildirelim?", "Aradıkları kelimeler", "Oyunlar ve düellolar", "Ödevler ve çalışmalar"],
  ja: ["何をお知らせしますか？", "調べた単語", "ゲームと対戦", "宿題と練習"],
  hi: ["किस बारे में बताएँ?", "खोजे गए शब्द", "खेल और मुकाबले", "होमवर्क और अभ्यास"],
  fa: ["دربارهٔ چه چیزی خبرتان کنیم؟", "کلمه‌هایی که جستجو کردند", "بازی‌ها و دوئل‌ها", "تکالیف و تمرین‌ها"],
  id: ["Tentang apa kami beri tahu?", "Kata yang dicari", "Permainan dan duel", "PR dan latihan"],
  am: ["ስለ ምን እናሳውቃችሁ?", "የፈለጓቸው ቃላት", "ጨዋታዎችና ውድድሮች", "የቤት ሥራና ልምምድ"],
  el: ["Για τι να σας ενημερώνουμε;", "Λέξεις που αναζητούν", "Παιχνίδια και μονομαχίες", "Εργασίες και εξάσκηση"],
  zu: ["Sinazise ngani?", "Amagama abawafunayo", "Imidlalo nemincintiswano", "Umsebenzi wasekhaya nokuzijwayeza"],
  xh: ["Sikwazise ngantoni?", "Amagama abawakhangelayo", "Imidlalo nemiceli-mngeni", "Umsebenzi wasekhaya nokuziqhelisa"],
  nso: ["Re go botše ka eng?", "Mantšu ao ba a nyakago", "Dipapadi le dintwa tša mantšu", "Mošomo wa gae le tlwaetšo"],
  tn: ["Re go itsise ka eng?", "Mafoko a ba a batlang", "Metshameko le dikgaisano", "Tiro ya gae le boikatiso"],
  st: ["Re o tsebise ka eng?", "Mantswe ao ba a batlang", "Dipapadi le ditlhodisano", "Mosebetsi wa hae le boikwetliso"],
  ts: ["Hi fanele ku mi byela hi yini?", "Marito lawa va ma lavaka", "Mintlangu na mphikizano", "Ntirho wa le kaya na ntoloveto"],
  ss: ["Sikutjele ngani?", "Emagama labawaseshako", "Imidlalo nemincintiswano", "Umsebenti wasekhaya nekuticecesha"],
  ve: ["Ri ni vhudze nga ha mini?", "Maipfi ane vha a ṱoḓa", "Mitambo na mitambo ya u lwa", "Mushumo wa hayani na nḓowelo"],
  nr: ["Sikwazise ngani?", "Amezwi abawafunako", "Imidlalo neempikiswano", "Umsebenzi wekhaya nokuzilolonga"],
  vi: ["Thông báo cho bạn về điều gì?", "Từ các con đã tra", "Trò chơi và thi đấu", "Bài tập và luyện tập"],
  fil: ["Tungkol saan ka namin aabisuhan?", "Mga salitang hinahanap", "Mga laro at duelo", "Takdang-aralin at pagsasanay"],
  af: ["Waaroor moet ons julle laat weet?", "Woorde wat hulle opsoek", "Speletjies en tweestryde", "Huiswerk en oefening"],
  sw: ["Tukujulishe kuhusu nini?", "Maneno wanayotafuta", "Michezo na mashindano", "Kazi ya nyumbani na mazoezi"],
  "zh-CN": ["要通知您哪些内容？", "查过的词", "游戏和对战", "作业和练习"],
  "zh-TW": ["要通知您哪些內容？", "查過的詞", "遊戲和對戰", "作業和練習"],
  ko: ["무엇을 알려 드릴까요?", "찾아본 단어", "게임과 대결", "숙제와 연습"],
  th: ["ให้แจ้งเรื่องอะไรบ้าง?", "คำที่ค้นหา", "เกมและการแข่งขัน", "การบ้านและการฝึก"],
  bn: ["কোন বিষয়ে জানাব?", "খোঁজা শব্দ", "খেলা ও প্রতিযোগিতা", "বাড়ির কাজ ও অনুশীলন"],
  da: ["Hvad skal vi give besked om?", "Ord de slår op", "Spil og dueller", "Lektier og øvelser"],
  hu: ["Miről értesítsünk?", "Keresett szavak", "Játékok és párbajok", "Házi feladat és gyakorlás"],
};

type NotifCats = { search: boolean; games: boolean; homework: boolean };

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
  const [cats, setCats] = useState<NotifCats>({ search: true, games: true, homework: true });
  const tc = NOTIF_CATS[lang] ?? NOTIF_CATS.en;
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
              const c = data.prefs.cats ?? {};
              setCats({ search: c.search !== false, games: c.games !== false, homework: c.homework !== false });
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

  async function savePrefs(nextEnabled: boolean, nextMode: "instant" | "daily", nextCats: NotifCats = cats) {
    if (!user) return;
    const idToken = await user.getIdToken();
    await fetch("/api/family/notify-prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      // lang travels with every save so alerts always match the parent's
      // current language, even if they switch it later.
      body: JSON.stringify({ enabled: nextEnabled, mode: nextMode, cats: nextCats, lang }),
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

  async function toggleCat(k: keyof NotifCats) {
    if (busy) return;
    const next = { ...cats, [k]: !cats[k] };
    setCats(next);
    if (enabled) await savePrefs(enabled, mode, next);
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
        background: "var(--surface)",
        border: "1px solid var(--rule)",
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
              background: "var(--rule)", position: "relative", opacity: 0.5,
              cursor: "default",
            }}
          >
            <span
              style={{
                position: "absolute", top: 3, insetInlineStart: 3,
                width: 20, height: 20, borderRadius: "50%", background: "var(--surface)",
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
                width: 20, height: 20, borderRadius: "50%", background: "var(--surface)",
                transition: "inset-inline-start 160ms ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              }}
            />
          </span>
        )}
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{t.enable}</span>
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
                  border: `1.5px solid ${active ? TEAL : "var(--rule)"}`,
                  background: active ? "rgba(14,165,165,0.06)" : "var(--surface)",
                }}
              >
                <span
                  style={{
                    flex: "0 0 auto", marginTop: 2, width: 16, height: 16, borderRadius: "50%",
                    border: `4px solid ${active ? TEAL : "#D6D3D1"}`,
                    background: "var(--surface)", boxSizing: "border-box",
                  }}
                />
                <span>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                    {m === "instant" ? t.instant : t.daily}
                  </span>
                  <span style={{ display: "block", fontSize: 12.5, color: "#78716C", marginTop: 1 }}>
                    {m === "instant" ? t.instantSub : t.dailySub}
                  </span>
                </span>
              </button>
            );
          })}
          {/* What to hear about: tick any of the three (all on at first). */}
          <div style={{ marginTop: 6, fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{tc[0]}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(["search", "games", "homework"] as const).map((k, i) => (
              <label key={k} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, cursor: "pointer", border: `1.5px solid ${cats[k] ? TEAL : "var(--rule)"}`, background: cats[k] ? "rgba(14,165,165,0.06)" : "var(--surface)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>
                <input type="checkbox" checked={cats[k]} onChange={() => void toggleCat(k)} style={{ accentColor: TEAL, width: 16, height: 16, margin: 0 }} />
                {tc[i + 1]}
              </label>
            ))}
          </div>
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
.fam-dash-summary { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 22px; }
.fam-dash-sumcard {
  flex: 1; min-width: 160px;
  background: linear-gradient(135deg, #10B6B6, #0B7D7D);
  border: none;
  border-radius: 20px;
  padding: 20px 20px 18px;
  display: flex; flex-direction: column; gap: 3px;
  position: relative; overflow: hidden;
  box-shadow: 0 16px 32px -18px rgba(14,165,165,0.65);
}
.fam-dash-sumcard::after {
  content: ""; position: absolute; inset-inline-end: -20px; top: -20px;
  width: 90px; height: 90px; border-radius: 50%;
  background: rgba(255,255,255,0.14);
}
.fam-dash-sumcard-week {
  background: linear-gradient(135deg, #9366F2, #7C3AED);
  box-shadow: 0 16px 32px -18px rgba(124,58,237,0.65);
}
.fam-dash-sumnum { font-size: 34px; font-weight: 800; color: #fff; line-height: 1; position: relative; }
.fam-dash-sumcard-week .fam-dash-sumnum { color: #fff; }
.fam-dash-sumlabel { font-size: 13px; color: rgba(255,255,255,0.9); font-weight: 600; position: relative; }
.fam-dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 18px;
}
.fam-dash-card {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.09);
  border-radius: 22px;
  padding: 24px 24px 22px;
  box-shadow: 0 8px 24px rgba(31,41,55,0.06);
  position: relative;
  overflow: hidden;
}
.fam-dash-card::before {
  content: ""; position: absolute; inset-inline: 0; top: 0; height: 5px;
  background: linear-gradient(90deg, var(--m-color, var(--teal)), color-mix(in srgb, var(--m-color, var(--teal)) 50%, #ffffff));
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
.fam-dash-role { font-size: 13px; color: var(--ink-faint); }
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
.fam-dash-learn { margin-top: 14px; padding: 10px 12px; border-radius: 12px; background: #FFF8E8; display: grid; gap: 3px; font-size: 13.5px; color: #4A5A55; }
.fam-dash-learn b { font-size: 14.5px; color: #172320; }
.fam-dash-learn .is-list { color: #8A5A00; font-weight: 700; }
.fam-dash-learnset { margin-top: 12px; padding: 10px 12px; border-radius: 12px; border: 1px solid #EFE3C8; background: #FFFCF5; display: grid; gap: 8px; font-size: 13.5px; color: #4A5A55; }
.fam-dash-learnset-h { font-size: 14.5px; font-weight: 700; color: #172320; }
.fam-dash-learnset-q { font-weight: 700; color: #172320; }
.fam-dash-learnset-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.fam-dash-learnset-chip { font: inherit; font-size: 13.5px; font-weight: 700; min-height: 36px; padding: 6px 14px; border-radius: 999px; border: 1.5px solid #D9CFB8; background: #fff; color: #172320; cursor: pointer; }
.fam-dash-learnset-chip.is-on { background: #0B7F7F; border-color: #0B7F7F; color: #fff; }
.fam-dash-learnset-chip:disabled { cursor: default; opacity: .7; }
.fam-dash-learnset-chip:focus-visible { outline: 2px solid #0A7472; outline-offset: 2px; }
.fam-dash-learnset-note { font-size: 12.5px; color: #6B7280; line-height: 1.5; }
.fam-dash-learnset-msg { font-size: 13px; font-weight: 700; color: #0A7472; }
.fam-dash-recent-label { font-size: 12px; color: var(--ink-faint); font-weight: 700; margin-bottom: 8px; }
.fam-dash-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.fam-dash-chip {
  background: rgba(14,165,165,0.09); color: var(--ink-soft);
  border-radius: 999px; padding: 5px 12px;
  font-size: 13px; font-weight: 600;
}
/* Reward prompt: tie the parent's gift to something the child DID. Warms up
   when there's a live achievement (streak / strong week). */
.fam-dash-reward {
  margin-top: 16px; padding-top: 13px; border-top: 1px dashed rgba(31,41,55,0.12);
  display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
}
.fam-dash-reward-head { font-size: 12.5px; font-weight: 700; color: var(--ink-soft); }
.fam-dash-reward.has-achievement {
  border-top-color: rgba(245,158,11,0.35);
  background: linear-gradient(0deg, rgba(245,158,11,0.05), transparent);
  border-radius: 0 0 14px 14px; margin-inline: -18px; padding-inline: 18px; margin-bottom: -16px; padding-bottom: 14px;
}
.fam-dash-reward.has-achievement .fam-dash-reward-head { color: #b45309; font-weight: 800; }
.fam-dash-reward-chips { display: inline-flex; gap: 6px; }
.fam-dash-reward-chip {
  background: rgba(14,165,165,0.1); color: #0f766e;
  border: 1px solid rgba(14,165,165,0.28); border-radius: 999px;
  padding: 5px 11px; font-size: 13px; font-weight: 800; cursor: pointer;
  font-family: inherit; font-variant-numeric: tabular-nums; transition: background 140ms ease, transform 140ms ease;
}
.fam-dash-reward-chip:hover { background: rgba(14,165,165,0.18); }
.fam-dash-reward-chip:active { transform: scale(0.95); }
.fam-dash-reward-chip:disabled { opacity: 0.5; cursor: default; }
.fam-dash-reward-sent { font-size: 13px; font-weight: 800; color: #0f766e; }
`;

// Dashboard shell: side nav + greeting + tabbed panels. RTL puts the nav
// on the right automatically (flex row reverses); on narrow screens the
// nav collapses to a horizontal bar on top.
const FAM_SHELL_CSS = `
/* The parent dashboard is an ADULT surface — it must not wear the theme the
   kids toggle (a dark skin turned the token-driven cards dark while this
   hardcoded-light shell stayed cream = a broken half-dark look). Pin the whole
   area to the light adult palette so member cards / notifications / rewards /
   coaches all stay consistent regardless of the global data-theme. High
   specificity (extra class) to beat html[data-theme="dark"] .wordbook. */
html[data-theme] .wordbook.fam-shell-page {
  --paper: #F2F6F4; --surface: #FFFFFF; --mist: #EAF1EE;
  --ink: #0B0F19; --ink-soft: #3A3F4B; --ink-muted: #5C6270; --ink-faint: #8B91A0;
  --rule: #E6E8EC; --rule-soft: #EDEFF2; --rule-faint: #F1F2F6;
  --accent: #0EA5A5; --accent-2: #7C3AED; --accent-ink: #FFFFFF;
  --wb-card: #FFFFFF; --wb-surface: #FFFFFF; --wb-bg: #F2F6F4;
  --wb-ink: #0B0F19; --wb-ink-soft: #3A3F4B; --wb-border: #E6E8EC;
}
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
.fam-nav-item svg { flex-shrink: 0; color: var(--ink-faint); transition: color 140ms ease; }
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
  text-transform: uppercase; color: var(--ink-faint); margin: 24px 0 12px;
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
.fam-set-sub { font-size: 13px; color: var(--ink-faint); margin-top: 2px; }
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
