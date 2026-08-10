"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { track } from "@/lib/track";
import { consumePendingInstallOpen, subscribeInstallOpen } from "@/lib/install-bus";

/**
 * Gentle PWA install prompt.
 *
 * Triggered ONLY after we have strong signal the visitor got value
 * — specifically, 8 seconds after their first successful word search
 * (the `gadit_first_search_done` localStorage flag is set by
 * WordClient when a result fully renders).
 *
 * Platform behaviour:
 *   - iOS Safari: the OS does NOT fire beforeinstallprompt, so we
 *     show a soft instructions modal pointing at the Share button.
 *   - Android Chrome / Desktop Chrome / Edge: we listen for the
 *     `beforeinstallprompt` event, stash it, and trigger the native
 *     install dialog when the user taps Install.
 *
 * Suppression:
 *   - Hidden if the app is already installed (display-mode: standalone
 *     or iOS-specific navigator.standalone).
 *   - "Later" dismissal snoozes the prompt for 14 days.
 *   - "Install" / "Got it" hides it for good (we mark installed=true).
 *
 * Motivation: Joshua (early tester, 2026-06-18) loved the dictionary
 * but couldn't find it in the App Store and didn't know about Add to
 * Home Screen. Gadi flagged that as a friction signal — surface the
 * install path proactively instead of waiting for users to discover it.
 */

const STORAGE_KEY        = "gadit_install_prompt_state_v1";
const SEARCH_SIGNAL_KEY  = "gadit_first_search_done";
// 14 → 3 days (Gadi 2026-07-09): users kept asking him "how do I
// install it?" — one reflexive "Later" silenced the prompt for two
// weeks. Three days keeps it a recurring nudge without being a nag,
// and the burger menu now carries a permanent "Install the app"
// entry so the path is always discoverable between nudges.
const DISMISS_SNOOZE_DAYS = 3;
const APPEAR_DELAY_MS     = 8_000;

/** Dispatched (window) by the burger-menu "Install the app" item.
 *  The mounted InstallPwaPrompt picks it up and opens the right flow
 *  for the platform: native prompt on Android Chrome, instructions
 *  sheet otherwise. */
export const INSTALL_OPEN_EVENT = "gadit-open-install";

/** True when Gadit is running as an installed app, or the user
 *  completed installation at some point on this browser profile.
 *  Shared with the burger menu so it can hide its install entry. */
export function isPwaInstalledOrDone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = navigator as unknown as { standalone?: boolean };
  if (nav.standalone === true) return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && (JSON.parse(raw) as { installed?: boolean }).installed) return true;
  } catch { /* ignore */ }
  return false;
}

const TEAL       = "#0E7490";
const TEAL_DEEP  = "#155E75";

type Platform = "ios" | "android" | "desktop" | "other";

// Per-lang copy. Local to this component so adding strings is one edit
// and the 12-lang dictionary doesn't sprawl across i18n-v2.ts.
type Copy = {
  title: string;
  bodyAndroid: string;
  bodyIos: string;
  install: string;
  later: string;
  iosTitle: string;
  iosLead: string;
  iosStep1: string;
  iosStep1Hint: string;
  iosStep2: string;
  iosStep3: string;
  androidStep1: string;
  androidStep2: string;
  androidStep3: string;
  iosClose: string;
  closeLabel: string;
};

const COPY: Record<string, Copy> = {
  he: {
    title: "הוסיפו את Gadit לטלפון",
    bodyAndroid: "התקנה בלחיצה אחת, Gadit יפתח כמו אפליקציה ממסך הבית.",
    bodyIos: "הפכו את Gadit לאפליקציה אמיתית במסך הבית של האייפון.",
    install: "התקן",
    later: "אחר כך",
    iosTitle: "ככה מתקינים את Gadit",
    iosLead: "ב-3 הקשות פשוטות:",
    iosStep1: "הקישו על כפתור השיתוף",
    iosStep1Hint: "(הריבוע עם החץ למעלה, בתחתית הסאפארי)",
    iosStep2: "גללו ובחרו \"הוסף למסך הבית\"",
    iosStep3: "הקישו \"הוסף\" בפינה הימנית העליונה",
    androidStep1: "פתחו את תפריט Chrome (⋮)",
    androidStep2: "בחרו \"הוספה למסך הבית\"",
    androidStep3: "אשרו בלחיצה על \"הוסף\"",
    iosClose: "הבנתי",
    closeLabel: "סגור",
  },
  en: {
    title: "Add Gadit to your phone",
    bodyAndroid: "One-tap install, Gadit opens like a real app from your home screen.",
    bodyIos: "Turn Gadit into a real app on your iPhone home screen.",
    install: "Install",
    later: "Later",
    iosTitle: "How to install Gadit",
    iosLead: "3 quick taps:",
    iosStep1: "Tap the Share button",
    iosStep1Hint: "(the square with an arrow pointing up, at the bottom of Safari)",
    iosStep2: "Scroll and choose \"Add to Home Screen\"",
    iosStep3: "Tap \"Add\" in the top-right corner",
    androidStep1: "Open the Chrome menu (⋮)",
    androidStep2: "Choose \"Add to Home screen\"",
    androidStep3: "Tap \"Add\" to confirm",
    iosClose: "Got it",
    closeLabel: "Close",
  },
  zu: {
    title: "Faka i-Gadit efonini yakho",
    bodyAndroid: "Ukufaka ngokuthinta kanye, i-Gadit ivuleka njengohlelo lwangempela lokusebenza esikrinini sakho sasekhaya.",
    bodyIos: "Yenza i-Gadit ibe uhlelo lwangempela lokusebenza esikrinini sasekhaya se-iPhone yakho.",
    install: "Faka",
    later: "Kamuva",
    iosTitle: "Indlela yokufaka i-Gadit",
    iosLead: "Ukuthinta okusheshayo okungu-3:",
    iosStep1: "Thinta inkinobho yokwabelana",
    iosStep1Hint: "(isikwele esinomcibisholo okhomba phezulu, ngezansi kwe-Safari)",
    iosStep2: "Skrola bese ukhetha \"Engeza Esikrinini Sasekhaya\"",
    iosStep3: "Thinta \"Engeza\" ekhoneni eliphezulu ngakwesokudla",
    androidStep1: "Vula imenyu ye-Chrome (⋮)",
    androidStep2: "Khetha \"Engeza Esikrinini Sasekhaya\"",
    androidStep3: "Thinta \"Engeza\" ukuze uqinisekise",
    iosClose: "Ngiyezwa",
    closeLabel: "Vala",
  },
  el: {
    title: "Πρόσθεσε το Gadit στο τηλέφωνό σου",
    bodyAndroid: "Εγκατάσταση με ένα πάτημα, το Gadit ανοίγει σαν κανονική εφαρμογή από την αρχική οθόνη σου.",
    bodyIos: "Κάνε το Gadit κανονική εφαρμογή στην αρχική οθόνη του iPhone σου.",
    install: "Εγκατάσταση",
    later: "Αργότερα",
    iosTitle: "Πώς να εγκαταστήσεις το Gadit",
    iosLead: "3 γρήγορα πατήματα:",
    iosStep1: "Πάτησε το κουμπί Κοινή χρήση",
    iosStep1Hint: "(το τετράγωνο με το βέλος προς τα πάνω, στο κάτω μέρος του Safari)",
    iosStep2: "Κύλησε και διάλεξε \"Προσθήκη στην αρχική οθόνη\"",
    iosStep3: "Πάτησε \"Προσθήκη\" πάνω δεξιά",
    androidStep1: "Άνοιξε το μενού του Chrome (⋮)",
    androidStep2: "Διάλεξε \"Προσθήκη στην αρχική οθόνη\"",
    androidStep3: "Πάτησε \"Προσθήκη\" για επιβεβαίωση",
    iosClose: "Το κατάλαβα",
    closeLabel: "Κλείσιμο",
  },
  ar: {
    title: "أضف Gadit إلى هاتفك",
    bodyAndroid: "تثبيت بضغطة واحدة, يفتح Gadit كتطبيق حقيقي من شاشتك الرئيسية.",
    bodyIos: "حوّل Gadit إلى تطبيق حقيقي على شاشة آيفون الرئيسية.",
    install: "تثبيت",
    later: "لاحقًا",
    iosTitle: "طريقة تثبيت Gadit",
    iosLead: "3 ضغطات سريعة:",
    iosStep1: "اضغط على زر المشاركة",
    iosStep1Hint: "(المربع مع السهم لأعلى، أسفل سفاري)",
    iosStep2: "مرر واختر \"إضافة إلى الشاشة الرئيسية\"",
    iosStep3: "اضغط \"إضافة\" في الزاوية العلوية اليمنى",
    androidStep1: "افتح قائمة Chrome (⋮)",
    androidStep2: "اختر \"إضافة إلى الشاشة الرئيسية\"",
    androidStep3: "اضغط \"إضافة\" للتأكيد",
    iosClose: "فهمت",
    closeLabel: "إغلاق",
  },
  ru: {
    title: "Добавьте Gadit на телефон",
    bodyAndroid: "Установка в один тап, Gadit откроется как настоящее приложение с домашнего экрана.",
    bodyIos: "Превратите Gadit в настоящее приложение на главном экране iPhone.",
    install: "Установить",
    later: "Позже",
    iosTitle: "Как установить Gadit",
    iosLead: "3 быстрых тапа:",
    iosStep1: "Нажмите кнопку «Поделиться»",
    iosStep1Hint: "(квадрат со стрелкой вверх, внизу Safari)",
    iosStep2: "Прокрутите и выберите «На экран Домой»",
    iosStep3: "Нажмите «Добавить» в правом верхнем углу",
    androidStep1: "Откройте меню Chrome (⋮)",
    androidStep2: "Выберите «Добавить на главный экран»",
    androidStep3: "Нажмите «Добавить» для подтверждения",
    iosClose: "Понятно",
    closeLabel: "Закрыть",
  },
  es: {
    title: "Añade Gadit a tu teléfono",
    bodyAndroid: "Instalación en un toque, Gadit se abre como una app real desde tu pantalla de inicio.",
    bodyIos: "Convierte Gadit en una app real en la pantalla de inicio de tu iPhone.",
    install: "Instalar",
    later: "Más tarde",
    iosTitle: "Cómo instalar Gadit",
    iosLead: "3 toques rápidos:",
    iosStep1: "Toca el botón Compartir",
    iosStep1Hint: "(el cuadrado con la flecha hacia arriba, abajo en Safari)",
    iosStep2: "Desliza y elige \"Añadir a pantalla de inicio\"",
    iosStep3: "Toca \"Añadir\" en la esquina superior derecha",
    androidStep1: "Abre el menú de Chrome (⋮)",
    androidStep2: "Elige \"Añadir a pantalla de inicio\"",
    androidStep3: "Toca \"Añadir\" para confirmar",
    iosClose: "Entendido",
    closeLabel: "Cerrar",
  },
  pt: {
    title: "Adicione o Gadit ao seu telefone",
    bodyAndroid: "Instalação em um toque, o Gadit abre como um app real a partir da tela inicial.",
    bodyIos: "Transforme o Gadit em um app real na tela inicial do seu iPhone.",
    install: "Instalar",
    later: "Depois",
    iosTitle: "Como instalar o Gadit",
    iosLead: "3 toques rápidos:",
    iosStep1: "Toque no botão Compartilhar",
    iosStep1Hint: "(o quadrado com a seta para cima, na parte inferior do Safari)",
    iosStep2: "Role e escolha \"Adicionar à Tela de Início\"",
    iosStep3: "Toque em \"Adicionar\" no canto superior direito",
    androidStep1: "Abra o menu do Chrome (⋮)",
    androidStep2: "Escolha \"Adicionar à tela inicial\"",
    androidStep3: "Toque em \"Adicionar\" para confirmar",
    iosClose: "Entendi",
    closeLabel: "Fechar",
  },
  fr: {
    title: "Ajoute Gadit à ton téléphone",
    bodyAndroid: "Installation en un toucher, Gadit s'ouvre comme une vraie app depuis ton écran d'accueil.",
    bodyIos: "Transforme Gadit en une vraie app sur l'écran d'accueil de ton iPhone.",
    install: "Installer",
    later: "Plus tard",
    iosTitle: "Installer Gadit",
    iosLead: "3 touchers rapides :",
    iosStep1: "Appuie sur le bouton Partager",
    iosStep1Hint: "(le carré avec une flèche vers le haut, en bas de Safari)",
    iosStep2: "Fais défiler et choisis \"Sur l'écran d'accueil\"",
    iosStep3: "Appuie sur \"Ajouter\" en haut à droite",
    androidStep1: "Ouvre le menu Chrome (⋮)",
    androidStep2: "Choisis \"Ajouter à l'écran d'accueil\"",
    androidStep3: "Appuie sur \"Ajouter\" pour confirmer",
    iosClose: "Compris",
    closeLabel: "Fermer",
  },
  de: {
    title: "Füge Gadit zum Handy hinzu",
    bodyAndroid: "Ein-Klick-Installation, Gadit öffnet sich wie eine echte App vom Startbildschirm.",
    bodyIos: "Mache Gadit zu einer echten App auf deinem iPhone-Startbildschirm.",
    install: "Installieren",
    later: "Später",
    iosTitle: "Gadit installieren",
    iosLead: "3 schnelle Tipps:",
    iosStep1: "Tippe auf \"Teilen\"",
    iosStep1Hint: "(das Quadrat mit dem Pfeil nach oben, unten in Safari)",
    iosStep2: "Scrolle und wähle \"Zum Home-Bildschirm\"",
    iosStep3: "Tippe rechts oben auf \"Hinzufügen\"",
    androidStep1: "Öffne das Chrome-Menü (⋮)",
    androidStep2: "Wähle \"Zum Startbildschirm hinzufügen\"",
    androidStep3: "Tippe zur Bestätigung auf \"Hinzufügen\"",
    iosClose: "Verstanden",
    closeLabel: "Schließen",
  },
  cs: {
    title: "Přidejte Gadit do telefonu",
    bodyAndroid: "Instalace jedním klepnutím, Gadit se otevře jako skutečná aplikace z plochy.",
    bodyIos: "Proměňte Gadit v opravdovou aplikaci na ploše iPhonu.",
    install: "Instalovat",
    later: "Později",
    iosTitle: "Jak nainstalovat Gadit",
    iosLead: "3 rychlá klepnutí:",
    iosStep1: "Klepněte na tlačítko Sdílet",
    iosStep1Hint: "(čtverec se šipkou nahoru, dole v Safari)",
    iosStep2: "Posuňte se a vyberte \"Přidat na plochu\"",
    iosStep3: "Klepněte na \"Přidat\" vpravo nahoře",
    androidStep1: "Otevřete nabídku Chrome (⋮)",
    androidStep2: "Zvolte \"Přidat na plochu\"",
    androidStep3: "Potvrďte klepnutím na \"Přidat\"",
    iosClose: "Rozumím",
    closeLabel: "Zavřít",
  },
  sk: {
    title: "Pridajte Gadit do telefónu",
    bodyAndroid: "Inštalácia jedným klepnutím, Gadit sa otvorí ako skutočná aplikácia z plochy.",
    bodyIos: "Premeňte Gadit na skutočnú aplikáciu na ploche iPhonu.",
    install: "Inštalovať",
    later: "Neskôr",
    iosTitle: "Ako nainštalovať Gadit",
    iosLead: "3 rýchle klepnutia:",
    iosStep1: "Klepnite na tlačidlo Zdieľať",
    iosStep1Hint: "(štvorec so šípkou hore, dole v Safari)",
    iosStep2: "Posuňte sa a vyberte \"Pridať na plochu\"",
    iosStep3: "Klepnite na \"Pridať\" vpravo hore",
    androidStep1: "Otvorte menu Chrome (⋮)",
    androidStep2: "Zvoľte \"Pridať na plochu\"",
    androidStep3: "Potvrďte klepnutím na \"Pridať\"",
    iosClose: "Rozumiem",
    closeLabel: "Zavrieť",
  },
  it: {
    title: "Aggiungi Gadit al telefono",
    bodyAndroid: "Installazione con un tocco, Gadit si apre come un'app vera dalla schermata Home.",
    bodyIos: "Trasforma Gadit in un'app vera sulla schermata Home dell'iPhone.",
    install: "Installa",
    later: "Più tardi",
    iosTitle: "Come installare Gadit",
    iosLead: "3 tocchi veloci:",
    iosStep1: "Tocca il pulsante Condividi",
    iosStep1Hint: "(il quadrato con la freccia in alto, in basso su Safari)",
    iosStep2: "Scorri e scegli \"Aggiungi a Home\"",
    iosStep3: "Tocca \"Aggiungi\" in alto a destra",
    androidStep1: "Apri il menu di Chrome (⋮)",
    androidStep2: "Scegli \"Aggiungi a schermata Home\"",
    androidStep3: "Tocca \"Aggiungi\" per confermare",
    iosClose: "Capito",
    closeLabel: "Chiudi",
  },
  ja: {
    title: "Gadit をスマホに追加",
    bodyAndroid: "ワンタップでインストール, ホーム画面から本物のアプリのように起動します。",
    bodyIos: "Gadit を iPhone のホーム画面に本物のアプリとして追加。",
    install: "インストール",
    later: "あとで",
    iosTitle: "Gadit のインストール方法",
    iosLead: "3 タップで完了:",
    iosStep1: "共有ボタンをタップ",
    iosStep1Hint: "(Safari の下にある、上矢印の付いた四角)",
    iosStep2: "スクロールして「ホーム画面に追加」を選択",
    iosStep3: "右上の「追加」をタップ",
    androidStep1: "Chrome のメニュー (⋮) を開く",
    androidStep2: "「ホーム画面に追加」を選択",
    androidStep3: "「追加」をタップして確定",
    iosClose: "わかりました",
    closeLabel: "閉じる",
  },
  hi: {
    title: "Gadit अपने फ़ोन में जोड़ें",
    bodyAndroid: "एक टैप में इंस्टॉल करें, होम स्क्रीन से असली ऐप की तरह खोलें।",
    bodyIos: "Gadit को अपने iPhone की होम स्क्रीन में असली ऐप की तरह जोड़ें।",
    install: "इंस्टॉल करें",
    later: "बाद में",
    iosTitle: "Gadit इंस्टॉल कैसे करें",
    iosLead: "3 टैप में पूरा हुआ:",
    iosStep1: "शेयर बटन दबाएँ",
    iosStep1Hint: "(Safari में नीचे का चौकोर बटन जिसमें ऊपर तीर है)",
    iosStep2: "स्क्रॉल करके \"होम स्क्रीन में जोड़ें\" चुनें",
    iosStep3: "ऊपर दाएँ \"जोड़ें\" दबाएँ",
    androidStep1: "Chrome मेनू (⋮) खोलें",
    androidStep2: "\"होम स्क्रीन में जोड़ें\" चुनें",
    androidStep3: "पुष्टि के लिए \"जोड़ें\" दबाएँ",
    iosClose: "समझ गया",
    closeLabel: "बंद करें",
  },
  am: {
    title: "Gaditን ወደ ስልክዎ ይጨምሩ",
    bodyAndroid: "በአንድ ንክኪ ይጫኑት፣ ከመነሻ ማያ ገጽዎ እንደ እውነተኛ መተግበሪያ ይክፈቱት።",
    bodyIos: "Gaditን በ iPhone መነሻ ማያ ገጽዎ ላይ እንደ እውነተኛ መተግበሪያ ይጨምሩ።",
    install: "ጫን",
    later: "በኋላ",
    iosTitle: "Gaditን እንዴት እንደሚጭኑ",
    iosLead: "በ3 ንክኪ ይጠናቀቃል:",
    iosStep1: "የማጋራት ቁልፉን ይንኩ",
    iosStep1Hint: "(በ Safari ታች ያለው ወደ ላይ ቀስት ያለው ካሬ)",
    iosStep2: "ወደ ታች ሸብልለው \"ወደ መነሻ ማያ ገጽ አክል\" ይምረጡ",
    iosStep3: "ከላይ በስተቀኝ \"አክል\" ይንኩ",
    androidStep1: "የ Chrome ምናሌን (⋮) ይክፈቱ",
    androidStep2: "\"ወደ መነሻ ማያ ገጽ አክል\" ይምረጡ",
    androidStep3: "ለማረጋገጥ \"አክል\" ይንኩ",
    iosClose: "ገባኝ",
    closeLabel: "ዝጋ",
  },
};

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type PromptState = {
  dismissedAt?: string;
  installed?: boolean;
  /** First time this browser profile ever evaluated the prompt. Lets
   *  the banner appear for returning visitors who never searched
   *  (they were told "download the app", opened the site, browsed,
   *  left) — after 24h the search-signal requirement is waived. */
  firstSeenAt?: string;
};

function readState(): PromptState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PromptState) : {};
  } catch {
    return {};
  }
}

function writeState(s: PromptState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  // iPadOS 13+ reports as Mac with touch — detect via touch points too.
  if (/iphone|ipod/.test(ua)) return "ios";
  const isMacTouch =
    /mac/.test(ua) &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;
  if (/ipad/.test(ua) || isMacTouch) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

function isAlreadyInstalled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = navigator as unknown as { standalone?: boolean };
  if (nav.standalone === true) return true;
  return false;
}

function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
}

export function InstallPwaPrompt() {
  const { lang, dir } = useLang();
  const t = COPY[lang] ?? COPY.en;

  const [visible, setVisible] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("other");

  // Resolve platform after hydration so SSR doesn't write UA-specific markup.
  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Listen for the deferred prompt — only Android Chrome / Desktop
  // Chromium fire this. iOS Safari never does.
  useEffect(() => {
    function onBip(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBip);
    function onInstalled() {
      track("install_accepted", { platform: "appinstalled_event" });
      writeState({ ...readState(), installed: true });
      setVisible(false);
      setShowIosSheet(false);
    }
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Decide whether to ever show the card.
  useEffect(() => {
    if (isAlreadyInstalled()) return;
    const state = readState();
    if (state.installed) return;
    if (state.dismissedAt) {
      const dismissedMs = new Date(state.dismissedAt).getTime();
      if (!Number.isNaN(dismissedMs) && Date.now() - dismissedMs < DISMISS_SNOOZE_DAYS * 86_400_000) return;
    }

    // iOS Safari: we can show even without a deferred prompt (we'll
    // route Install → instructions sheet).
    // Android Chrome: only show once we have a deferred prompt —
    // otherwise the Install button has nothing to fire.
    //
    // Desktop is intentionally excluded: the prompt copy says "Add
    // Gadit to your phone" / "הוסיפו את Gadit לטלפון", which reads
    // wrong on a laptop, and desktop users who want a PWA install
    // already know to use the browser's address-bar install button.
    // Gadi flagged this when the card popped up during his own
    // desktop test on 2026-06-19.
    //
    // Other browsers (Firefox iOS, Brave, Edge mobile etc.) won't get
    // either signal — skip them rather than show a button that does
    // nothing.
    const eligible =
      (platform === "ios" && isSafari()) ||
      (platform === "android" && deferred);
    if (!eligible) return;

    // Stamp the first evaluation so returning visitors qualify below.
    if (!state.firstSeenAt) {
      writeState({ ...state, firstSeenAt: new Date().toISOString() });
    }
    // Value signal: they searched a word — OR they're a returning
    // visitor (first seen over 24h ago). The original search-only
    // gate meant someone who was told "download the app", opened the
    // site and browsed without searching never saw the prompt at all.
    // Gadi 2026-07-09.
    const returning =
      !!state.firstSeenAt &&
      Date.now() - new Date(state.firstSeenAt).getTime() > 86_400_000;
    const checkSignal = () =>
      returning ||
      (typeof window !== "undefined" &&
        localStorage.getItem(SEARCH_SIGNAL_KEY) === "1");

    let appearTimer: ReturnType<typeof setTimeout> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const scheduleAppear = () => {
      if (appearTimer) return;
      appearTimer = setTimeout(() => {
        // Never pop the banner over the payment page — a bottom sheet
        // sliding over the card form mid-checkout is the one overlay
        // that can cost real money (Yooniz playbook: exclude checkout
        // routes from every popup/gate).
        if (window.location.pathname.includes("/checkout")) return;
        setVisible(true);
        track("install_prompt_shown", { platform, source: "auto" });
      }, APPEAR_DELAY_MS);
    };

    if (checkSignal()) {
      scheduleAppear();
    } else {
      pollTimer = setInterval(() => {
        if (checkSignal()) {
          if (pollTimer) clearInterval(pollTimer);
          scheduleAppear();
        }
      }, 2_000);
    }

    return () => {
      if (appearTimer) clearTimeout(appearTimer);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [platform, deferred]);

  const handleInstall = useCallback(async () => {
    if (platform === "ios" || !deferred) {
      // iOS never fires beforeinstallprompt; Android without a
      // captured prompt (menu-triggered before Chrome offered one)
      // gets the same sheet with Android-specific steps.
      setShowIosSheet(true);
      return;
    }
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        track("install_accepted", { platform });
        writeState({ ...readState(), installed: true });
        setVisible(false);
      } else {
        // User declined the native dialog — snooze like a Later tap.
        writeState({ ...readState(), dismissedAt: new Date().toISOString() });
        setVisible(false);
      }
    } catch {
      // The prompt() can throw if called twice. Best-effort dismiss.
      setVisible(false);
    } finally {
      setDeferred(null);
    }
  }, [platform, deferred]);

  const handleLater = useCallback(() => {
    writeState({ ...readState(), dismissedAt: new Date().toISOString() });
    setVisible(false);
    setShowIosSheet(false);
  }, []);

  // Burger-menu "Install the app" entry → open the right flow now,
  // regardless of banner eligibility/snooze. A user who ASKS to
  // install should never be blocked by the nudge schedule.
  //
  // Wired through the queued install-bus (plus the window event for
  // belt-and-braces): a fire-and-forget event alone can vanish if
  // this component is remounting at tap time — a US tester tapped
  // the menu entry on iOS Safari and nothing opened (2026-07-09).
  // The bus keeps the request pending until a subscriber consumes it.
  useEffect(() => {
    function onOpenRequest() {
      track("install_prompt_shown", { platform, source: "menu" });
      if (platform === "android" && deferred) {
        void handleInstall();
      } else {
        setShowIosSheet(true);
      }
    }
    // Consume a request that fired while we weren't mounted.
    if (consumePendingInstallOpen()) onOpenRequest();
    const unsubscribe = subscribeInstallOpen(() => {
      consumePendingInstallOpen();
      onOpenRequest();
    });
    window.addEventListener(INSTALL_OPEN_EVENT, onOpenRequest);
    return () => {
      unsubscribe();
      window.removeEventListener(INSTALL_OPEN_EVENT, onOpenRequest);
    };
  }, [platform, deferred, handleInstall]);

  if (!visible && !showIosSheet) return null;

  return (
    <>
      {visible && (
      <div
        role="dialog"
        aria-label={t.title}
        dir={dir}
        style={{
          position: "fixed",
          left: "50%",
          bottom: "max(16px, env(safe-area-inset-bottom))",
          transform: "translateX(-50%)",
          zIndex: 9999,
          width: "calc(100% - 32px)",
          maxWidth: 440,
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 20px 50px -10px rgba(15, 23, 42, 0.22), 0 10px 25px -8px rgba(15, 23, 42, 0.12)",
          display: "grid",
          gridTemplateColumns: "56px 1fr",
          gap: 12,
          alignItems: "center",
          animation: "gd-install-slide-up 240ms cubic-bezier(0.23, 1, 0.32, 1) both",
        }}
      >
        <img
          src="/icon-192.png"
          alt=""
          width={56}
          height={56}
          style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(15,23,42,0.12)" }}
        />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1220", lineHeight: 1.2 }}>
            {t.title}
          </div>
          <div style={{ fontSize: 13, color: "#4B5563", marginTop: 4, lineHeight: 1.35 }}>
            {platform === "ios" ? t.bodyIos : t.bodyAndroid}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={handleInstall}
              style={{
                background: TEAL,
                color: "white",
                border: "none",
                borderRadius: 999,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "transform 160ms ease-out, background 160ms ease-out",
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {t.install}
            </button>
            <button
              type="button"
              onClick={handleLater}
              style={{
                background: "transparent",
                color: "#6B7280",
                border: "none",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {t.later}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLater}
          aria-label={t.closeLabel}
          style={{
            position: "absolute",
            top: 8,
            right: dir === "rtl" ? "auto" : 8,
            left: dir === "rtl" ? 8 : "auto",
            background: "transparent",
            border: "none",
            color: "#9CA3AF",
            cursor: "pointer",
            padding: 4,
            lineHeight: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <style>{`
          @keyframes gd-install-slide-up {
            from { opacity: 0; transform: translate(-50%, 16px); }
            to   { opacity: 1; transform: translate(-50%, 0); }
          }
        `}</style>
      </div>
      )}

      {showIosSheet && (
        <div
          role="dialog"
          aria-label={t.iosTitle}
          dir={dir}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
            animation: "gd-install-fade-in 220ms ease-out both",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleLater(); }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "white",
              borderRadius: 20,
              padding: 24,
              animation: "gd-install-sheet-up 260ms cubic-bezier(0.23, 1, 0.32, 1) both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <img src="/icon-192.png" alt="" width={48} height={48} style={{ borderRadius: 10 }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0B1220" }}>{t.iosTitle}</div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>{t.iosLead}</div>
              </div>
            </div>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {platform === "ios" ? (
                <>
                  <li style={iosStepStyle}>
                    <span style={iosBadgeStyle(1)}>1</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0B1220" }}>
                        {t.iosStep1}
                        <ShareIcon />
                      </div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{t.iosStep1Hint}</div>
                    </div>
                  </li>
                  <li style={iosStepStyle}>
                    <span style={iosBadgeStyle(2)}>2</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0B1220" }}>{t.iosStep2}</div>
                  </li>
                  <li style={iosStepStyle}>
                    <span style={iosBadgeStyle(3)}>3</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0B1220" }}>{t.iosStep3}</div>
                  </li>
                </>
              ) : (
                /* Android without a captured beforeinstallprompt (menu
                   trigger before Chrome offered one) — manual steps. */
                <>
                  <li style={iosStepStyle}>
                    <span style={iosBadgeStyle(1)}>1</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0B1220" }}>{t.androidStep1}</div>
                  </li>
                  <li style={iosStepStyle}>
                    <span style={iosBadgeStyle(2)}>2</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0B1220" }}>{t.androidStep2}</div>
                  </li>
                  <li style={iosStepStyle}>
                    <span style={iosBadgeStyle(3)}>3</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0B1220" }}>{t.androidStep3}</div>
                  </li>
                </>
              )}
            </ol>
            <button
              type="button"
              onClick={handleLater}
              style={{
                marginTop: 20,
                width: "100%",
                background: TEAL,
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t.iosClose}
            </button>
          </div>
          <style>{`
            @keyframes gd-install-fade-in {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes gd-install-sheet-up {
              from { opacity: 0; transform: translateY(24px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

const iosStepStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "32px 1fr",
  alignItems: "start",
  gap: 12,
  padding: "10px 0",
};

function iosBadgeStyle(_n: number): React.CSSProperties {
  return {
    background: TEAL_DEEP,
    color: "white",
    width: 28,
    height: 28,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
  };
}

function ShareIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        border: "1px solid #0E7490",
        borderRadius: 5,
        background: "#ECFEFF",
        color: "#0E7490",
        marginInlineStart: 8,
        verticalAlign: "middle",
      }}
      aria-hidden="true"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V4" />
        <path d="M8 8l4-4 4 4" />
        <path d="M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
      </svg>
    </span>
  );
}
