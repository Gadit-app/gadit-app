"use client";

/**
 * /family/[memberId]/pair — owner sees a QR + 6-digit code to hand off
 * to a member's device.
 *
 * On mount, calls POST /api/family/pair/create to generate a code.
 * The page shows:
 *   - The QR (encodes `${origin}/join?code=XXXXXX`)
 *   - The 6-digit code in big legible type
 *   - A countdown to expiration (mm:ss)
 *   - "Generate new code" button
 *   - Once the member's `userId` field is populated server-side
 *     (via redeem), this page surfaces a success state ("Linked!") via
 *     a real-time subscription on the member doc and offers to return.
 */

import { relinkCopy } from "@/lib/family-relink-i18n";
import { WaitText, WaitDots } from "@/components/WaitText";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { BackLink } from "@/components/BackLink";
import { db } from "@/lib/firebase";
import { FamilyMember, PAIRING_CODE_TTL_MS } from "@/lib/family";

const COPY: Record<string, {
  title: string;
  sub: string;
  yourCode: string;
  ttlPrefix: string;
  ttlSuffix: string;
  expired: string;
  newCode: string;
  generating: string;
  pairedTitle: string;
  pairedSub: string;
  done: string;
  back: string;
  qrAlt: string;
  // Two clearly separated ways to connect (Gadi 2026-08-12): a QR to scan,
  // OR a link to open + the code to type. Keys optional per lang: the
  // effective copy merges each language over the English defaults.
  qrTitle?: string;
  qrHint?: string;
  orDivider?: string;
  linkTitle?: string;
  linkHint?: string;
  thenEnter?: string;
}> = {
  he: {
    title: "חיבור מכשיר",
    sub: "יש שתי דרכים לחבר את המכשיר של הילד. בחרו את הנוחה לכם.",
    qrTitle: "1. חיבור עם קוד QR",
    qrHint: "סרקו את הקוד הזה מהמכשיר של הילד, והחיבור יקרה מיד.",
    orDivider: "או",
    linkTitle: "2. חיבור עם קישור",
    linkHint: "מהמכשיר של הילד, כנסו לכתובת:",
    thenEnter: "ואז הקלידו את הקוד הזה:",
    yourCode: "הקוד שלכם",
    ttlPrefix: "פג בעוד",
    ttlSuffix: "דקות",
    expired: "הקוד פג. ייצרו קוד חדש.",
    newCode: "קוד חדש",
    generating: "מייצר...",
    pairedTitle: "המכשיר חובר ✓",
    pairedSub: "המכשיר עכשיו מחובר תמידית לחשבון של בן המשפחה.",
    done: "← חזרה לדף המשפחה",
    back: "→ חזרה",
    qrAlt: "QR לחיבור מכשיר",
  },
  en: {
    title: "Pair device",
    sub: "There are two ways to connect the child's device. Pick whichever is easier.",
    qrTitle: "1. Connect with a QR code",
    qrHint: "Scan this code from the child's device and they're connected instantly.",
    orDivider: "or",
    linkTitle: "2. Connect with a link",
    linkHint: "On the child's device, open:",
    thenEnter: "then enter this code:",
    yourCode: "Your code",
    ttlPrefix: "Expires in",
    ttlSuffix: "min",
    expired: "Code expired. Generate a new one.",
    newCode: "New code",
    generating: "Generating...",
    pairedTitle: "Device paired ✓",
    pairedSub: "The device is now permanently linked to this member's account.",
    done: "← Back to family",
    back: "← Back",
    qrAlt: "QR pairing code",
  },
  zu: {
    title: "Xhuma idivayisi",
    sub: "Kunezindlela ezimbili zokuxhuma idivayisi yengane. Khetha leyo elula kakhulu kuwe.",
    qrTitle: "1. Xhuma ngekhodi ye-QR",
    qrHint: "Skena le khodi kusukela kudivayisi yengane, futhi izoxhumeka ngokushesha.",
    orDivider: "noma",
    linkTitle: "2. Xhuma ngelinki",
    linkHint: "Kudivayisi yengane, vula:",
    thenEnter: "bese uthayipha le khodi:",
    yourCode: "Ikhodi yakho",
    ttlPrefix: "Iphelelwa yisikhathi ku",
    ttlSuffix: "imizuzu",
    expired: "Ikhodi iphelelwe yisikhathi. Yenza entsha.",
    newCode: "Ikhodi entsha",
    generating: "Kuyakhiqizwa...",
    pairedTitle: "Idivayisi ixhunyiwe ✓",
    pairedSub: "Idivayisi manje ixhumeke unomphelo ku-akhawunti yaleli lungu.",
    done: "← Buyela emndenini",
    back: "← Emuva",
    qrAlt: "Ikhodi ye-QR yokuxhuma",
  },
  xh: {
    title: "Dibanisa isixhobo",
    sub: "Kukho iindlela ezimbini zokudibanisa isixhobo somntwana. Khetha naleyo ilula ngakumbi.",
    qrTitle: "1. Dibanisa ngekhowudi ye-QR",
    qrHint: "Skena le khowudi ngesixhobo somntwana kwaye uya kudityaniswa ngoko nangoko.",
    orDivider: "okanye",
    linkTitle: "2. Dibanisa ngelinki",
    linkHint: "Kwisixhobo somntwana, vula:",
    thenEnter: "uze ufake le khowudi:",
    yourCode: "Ikhowudi yakho",
    ttlPrefix: "Iphelelwa ngexesha kwi",
    ttlSuffix: "mz",
    expired: "Ikhowudi iphelelwe lixesha. Yenza entsha.",
    newCode: "Ikhowudi entsha",
    generating: "Siyayenza...",
    pairedTitle: "Isixhobo sidityanisiwe ✓",
    pairedSub: "Isixhobo ngoku sidityaniswe ngokusisigxina neakhawunti yeli lungu.",
    done: "← Buyela kusapho",
    back: "← Buyela umva",
    qrAlt: "Ikhowudi ye-QR yokudibanisa",
  },
  nso: {
    title: "Kopanya sedirišwa",
    sub: "Go na le ditsela tše pedi tša go kopanya sedirišwa sa ngwana. Kgetha ye e lego bonolo.",
    qrTitle: "1. Kopanya ka khoutu ya QR",
    qrHint: "Skena khoutu ye ka sedirišwa sa ngwana gomme o kopantšwe gateetee.",
    orDivider: "goba",
    linkTitle: "2. Kopanya ka linki",
    linkHint: "Sedirišweng sa ngwana, bula:",
    thenEnter: "ke moka o tsenye khoutu ye:",
    yourCode: "Khoutu ya gago",
    ttlPrefix: "E fela ka",
    ttlSuffix: "mots.",
    expired: "Nako ya khoutu e fedile. Dira ye mpsha.",
    newCode: "Khoutu ye mpsha",
    generating: "Re a dira...",
    pairedTitle: "Sedirišwa se kopantšwe ✓",
    pairedSub: "Bjale sedirišwa se kopantšwe ka mo go sa felego le akhaonto ya leloko le.",
    done: "← Boela lapeng",
    back: "← Morago",
    qrAlt: "Khoutu ya QR ya go kopanya",
  },
  tn: {
    title: "Golaganya sedirisiwa",
    sub: "Go na le ditsela di le pedi tsa go golaganya sedirisiwa sa ngwana. Tlhopha e e bonolo mo go wena.",
    qrTitle: "1. Golaganya ka khoutu ya QR",
    qrHint: "Sekena khoutu e ka sedirisiwa sa ngwana mme o tla golagana ka bonako.",
    orDivider: "kgotsa",
    linkTitle: "2. Golaganya ka kgolagano",
    linkHint: "Mo sedirisweng sa ngwana, bula:",
    thenEnter: "morago o tsenye khoutu e:",
    yourCode: "Khoutu ya gago",
    ttlPrefix: "E fela mo",
    ttlSuffix: "metsotso",
    expired: "Khoutu e fedile. Dira e nngwe e ntšha.",
    newCode: "Khoutu e ntšha",
    generating: "Re a dira...",
    pairedTitle: "Sedirisiwa se golagantswe ✓",
    pairedSub: "Sedirisiwa jaanong se golagantswe ka metlha le akhaonto ya leloko le.",
    done: "← Boela kwa lelapeng",
    back: "← Morago",
    qrAlt: "Khoutu ya QR ya kgolagano",
  },
  st: {
    title: "Hokela sesebediswa",
    sub: "Ho na le ditsela tse pedi tsa ho hokela sesebediswa sa ngwana. Kgetha e bonolo ho wena.",
    qrTitle: "1. Hokela ka khoutu ya QR",
    qrHint: "Skena khoutu ena ka sesebediswa sa ngwana mme o tla hokelwa hang hang.",
    orDivider: "kapa",
    linkTitle: "2. Hokela ka lehokela",
    linkHint: "Sesebedisweng sa ngwana, bula:",
    thenEnter: "ebe o kenya khoutu ena:",
    yourCode: "Khoutu ya hao",
    ttlPrefix: "E fela ka mora",
    ttlSuffix: "mets.",
    expired: "Khoutu e feletswe ke nako. Etsa e ntjha.",
    newCode: "Khoutu e ntjha",
    generating: "Re a e etsa...",
    pairedTitle: "Sesebediswa se hokahantswe ✓",
    pairedSub: "Sesebediswa jwale se hokahantswe ka ho sa feleng le akhaonte ya setho sena.",
    done: "← Kgutlela lelapeng",
    back: "← Morao",
    qrAlt: "Khoutu ya QR ya ho hokela",
  },
  ts: {
    title: "Hlanganisa xitirhisiwa",
    sub: "Ku na tindlela timbirhi to hlanganisa xitirhisiwa xa n'wana. Hlawulani leyi olovaka.",
    qrTitle: "1. Hlanganisa hi khodi ya QR",
    qrHint: "Skenani khodi leyi hi xitirhisiwa xa n'wana kutani xi hlanganisiwa hi ku hatlisa.",
    orDivider: "kumbe",
    linkTitle: "2. Hlanganisa hi linki",
    linkHint: "Eka xitirhisiwa xa n'wana, pfulani:",
    thenEnter: "kutani mi tsala khodi leyi:",
    yourCode: "Khodi ya n'wina",
    ttlPrefix: "Yi hela endzhaku ka",
    ttlSuffix: "min",
    expired: "Khodi yi herile. Endlani yintshwa.",
    newCode: "Khodi yintshwa",
    generating: "Ku endla...",
    pairedTitle: "Xitirhisiwa xi hlanganisiwile ✓",
    pairedSub: "Xitirhisiwa sweswi xi hlanganisiwile hi masiku hinkwawo na akhawunti ya xirho lexi.",
    done: "← Tlhelela endyangwini",
    back: "← Endzhaku",
    qrAlt: "Khodi ya QR yo hlanganisa",
  },
  ss: {
    title: "Xhuma lithuluzi",
    sub: "Kunetindlela letimbili tekuxhuma lithuluzi lemntfwana. Khetsa lelula kakhulu.",
    qrTitle: "1. Xhuma ngekhodi ye-QR",
    qrHint: "Skena lekhodi ngelithuluzi lemntfwana futsi utawuxhumeka masinyane.",
    orDivider: "nobe",
    linkTitle: "2. Xhuma ngelilinki",
    linkHint: "Elithuluzini lemntfwana, vula:",
    thenEnter: "bese ufaka lekhodi:",
    yourCode: "Ikhodi yakho",
    ttlPrefix: "Iphelelwa sikhatsi ngemuva kwa",
    ttlSuffix: "imiz.",
    expired: "Ikhodi iphelelwe sikhatsi. Dala lensha.",
    newCode: "Ikhodi lensha",
    generating: "Kuyadalwa...",
    pairedTitle: "Lithuluzi lixhunyiwe ✓",
    pairedSub: "Lithuluzi nyalo lixhunywe unomphela ku-akhawunti yalelilunga.",
    done: "← Buyela emndenini",
    back: "← Emuva",
    qrAlt: "Ikhodi ye-QR yekuxhuma",
  },
  ve: {
    title: "Ṱumanyani tshishumiswa",
    sub: "Hu na nḓila mbili dza u ṱumanya tshishumiswa tsha ṅwana. Khethani ine ya leluwa.",
    qrTitle: "1. Ṱumanyani nga khoudu ya QR",
    qrHint: "Sekenani khoudu iyi nga tshishumiswa tsha ṅwana, nahone vha ḓo ṱumana nga u ṱavhanya.",
    orDivider: "kana",
    linkTitle: "2. Ṱumanyani nga vhukwamani",
    linkHint: "Kha tshishumiswa tsha ṅwana, vulani:",
    thenEnter: "nga murahu ni dzhenise khoudu iyi:",
    yourCode: "Khoudu yaṋu",
    ttlPrefix: "I fhela nga",
    ttlSuffix: "min",
    expired: "Khoudu yo fhela. Itani iṅwe ntswa.",
    newCode: "Khoudu ntswa",
    generating: "Ri khou ita...",
    pairedTitle: "Tshishumiswa tsho ṱumanywa ✓",
    pairedSub: "Tshishumiswa zwino tsho ṱumanywa tshoṱhe na akhaunthu ya muraḓo uyu.",
    done: "← Humelani kha muṱa",
    back: "← Murahu",
    qrAlt: "Khoudu ya QR ya u ṱumanya",
  },
  nr: {
    title: "Hlanganisa idivayisi",
    sub: "Kuneendlela ezimbili zokuhlanganisa idivayisi yomntwana. Khetha leyo elula.",
    qrTitle: "1. Hlanganisa ngekhowudi ye-QR",
    qrHint: "Skena ikhowudi le ngedivayisi yomntwana, bazakuhlanganiswa khonokho.",
    orDivider: "namkha",
    linkTitle: "2. Hlanganisa ngelinki",
    linkHint: "Kudivayisi yomntwana, vula:",
    thenEnter: "bese utlola ikhowudi le:",
    yourCode: "Ikhowudi yakho",
    ttlPrefix: "Iphela ngemva kwa",
    ttlSuffix: "imiz",
    expired: "Ikhowudi iphelelwe sikhathi. Yenza etjha.",
    newCode: "Ikhowudi etjha",
    generating: "Kuyenziwa...",
    pairedTitle: "Idivayisi ihlanganisiwe ✓",
    pairedSub: "Idivayisi nje ihlanganiswe unomphela ne-akhawunti yelunga leli.",
    done: "← Buyela emndenini",
    back: "← Emuva",
    qrAlt: "Ikhowudi ye-QR yokuhlanganisa",
  },
  el: {
    title: "Σύνδεση συσκευής",
    sub: "Υπάρχουν δύο τρόποι να συνδέσεις τη συσκευή του παιδιού. Διάλεξε όποιον σε βολεύει.",
    qrTitle: "1. Σύνδεση με κωδικό QR",
    qrHint: "Σάρωσε αυτόν τον κωδικό από τη συσκευή του παιδιού και η σύνδεση γίνεται αμέσως.",
    orDivider: "ή",
    linkTitle: "2. Σύνδεση με σύνδεσμο",
    linkHint: "Στη συσκευή του παιδιού, άνοιξε:",
    thenEnter: "και μετά πληκτρολόγησε αυτόν τον κωδικό:",
    yourCode: "Ο κωδικός σου",
    ttlPrefix: "Λήγει σε",
    ttlSuffix: "λεπτά",
    expired: "Ο κωδικός έληξε. Δημιούργησε νέον.",
    newCode: "Νέος κωδικός",
    generating: "Δημιουργία...",
    pairedTitle: "Η συσκευή συνδέθηκε ✓",
    pairedSub: "Η συσκευή είναι πλέον μόνιμα συνδεδεμένη με τον λογαριασμό αυτού του μέλους.",
    done: "← Πίσω στην οικογένεια",
    back: "← Πίσω",
    qrAlt: "Κωδικός QR σύνδεσης",
  },
  ru: {
    title: "Подключение устройства",
    sub: "Есть два способа подключить устройство ребёнка. Выберите тот, что удобнее.",
    qrTitle: "1. Подключение по QR-коду",
    qrHint: "Отсканируйте этот код с устройства ребёнка, и оно сразу подключится.",
    orDivider: "или",
    linkTitle: "2. Подключение по ссылке",
    linkHint: "На устройстве ребёнка откройте:",
    thenEnter: "затем введите этот код:",
    yourCode: "Ваш код",
    ttlPrefix: "Истекает через",
    ttlSuffix: "мин",
    expired: "Код истёк. Создайте новый.",
    newCode: "Новый код",
    generating: "Создаём...",
    pairedTitle: "Устройство подключено ✓",
    pairedSub: "Теперь устройство постоянно привязано к аккаунту этого члена семьи.",
    done: "← Назад к семье",
    back: "← Назад",
    qrAlt: "QR-код для подключения",
  },
  hi: {
    title: "डिवाइस जोड़ें",
    sub: "बच्चे का डिवाइस जोड़ने के दो तरीके हैं। जो आसान लगे, वह चुनें।",
    qrTitle: "1. QR कोड से जोड़ें",
    qrHint: "बच्चे के डिवाइस से यह कोड स्कैन करें, और डिवाइस तुरंत जुड़ जाएगा।",
    orDivider: "या",
    linkTitle: "2. लिंक से जोड़ें",
    linkHint: "बच्चे के डिवाइस पर यह खोलें:",
    thenEnter: "फिर यह कोड डालें:",
    yourCode: "आपका कोड",
    ttlPrefix: "समाप्ति में",
    ttlSuffix: "मिनट",
    expired: "कोड समाप्त। नया कोड बनाएँ।",
    newCode: "नया कोड",
    generating: "बना रहे हैं...",
    pairedTitle: "डिवाइस जुड़ गया ✓",
    pairedSub: "यह डिवाइस अब इस सदस्य के खाते से हमेशा के लिए जुड़ा है।",
    done: "← परिवार पर वापस",
    back: "← वापस",
    qrAlt: "QR जोड़ने का कोड",
  },
  am: {
    title: "መሳሪያ ማገናኘት",
    sub: "የልጁን መሳሪያ ለማገናኘት ሁለት መንገዶች አሉ። ቀላል የሆነልዎትን ይምረጡ።",
    qrTitle: "1. በQR ኮድ ማገናኘት",
    qrHint: "ይህን ኮድ ከልጁ መሳሪያ ይቃኙ፣ ወዲያውኑ ይገናኛል።",
    orDivider: "ወይም",
    linkTitle: "2. በሊንክ ማገናኘት",
    linkHint: "በልጁ መሳሪያ ላይ ይህን ይክፈቱ፦",
    thenEnter: "ከዚያ ይህን ኮድ ያስገቡ፦",
    yourCode: "ኮድዎ",
    ttlPrefix: "የሚያበቃው በ",
    ttlSuffix: "ደቂቃ ውስጥ ነው",
    expired: "ኮዱ ጊዜው አልፎበታል። አዲስ ኮድ ያዘጋጁ።",
    newCode: "አዲስ ኮድ",
    generating: "እየተዘጋጀ ነው...",
    pairedTitle: "መሳሪያው ተገናኝቷል ✓",
    pairedSub: "መሳሪያው አሁን ከዚህ አባል መለያ ጋር በቋሚነት ተገናኝቷል።",
    done: "← ወደ ቤተሰብ ገጹ ተመለሱ",
    back: "← ተመለስ",
    qrAlt: "የመሳሪያ ማገናኛ QR ኮድ",
  },
  ar: {
    title: "ربط جهاز",
    sub: "هناك طريقتان لربط جهاز الطفل. اختر الطريقة الأسهل لك.",
    qrTitle: "1. الربط برمز QR",
    qrHint: "امسح هذا الرمز من جهاز الطفل وسيتم الربط فورًا.",
    orDivider: "أو",
    linkTitle: "2. الربط برابط",
    linkHint: "على جهاز الطفل، افتح:",
    thenEnter: "ثم أدخل هذا الرمز:",
    yourCode: "رمزك",
    ttlPrefix: "ينتهي خلال",
    ttlSuffix: "دقيقة",
    expired: "انتهت صلاحية الرمز. أنشئ رمزًا جديدًا.",
    newCode: "رمز جديد",
    generating: "جارٍ الإنشاء...",
    pairedTitle: "تم ربط الجهاز ✓",
    pairedSub: "أصبح الجهاز الآن مرتبطًا بشكل دائم بحساب فرد العائلة هذا.",
    done: "← العودة إلى صفحة العائلة",
    back: "→ رجوع",
    qrAlt: "رمز QR لربط الجهاز",
  },
  es: {
    title: "Vincular dispositivo",
    sub: "Hay dos formas de conectar el dispositivo del niño. Elige la que te resulte más fácil.",
    qrTitle: "1. Conectar con un código QR",
    qrHint: "Escanea este código desde el dispositivo del niño y se conectará al instante.",
    orDivider: "o",
    linkTitle: "2. Conectar con un enlace",
    linkHint: "En el dispositivo del niño, abre:",
    thenEnter: "y luego escribe este código:",
    yourCode: "Tu código",
    ttlPrefix: "Caduca en",
    ttlSuffix: "min",
    expired: "El código caducó. Genera uno nuevo.",
    newCode: "Nuevo código",
    generating: "Generando...",
    pairedTitle: "Dispositivo vinculado ✓",
    pairedSub: "El dispositivo ya está vinculado de forma permanente a la cuenta de este miembro.",
    done: "← Volver a la familia",
    back: "← Atrás",
    qrAlt: "Código QR de vinculación",
  },
  pt: {
    title: "Conectar dispositivo",
    sub: "Há duas formas de conectar o dispositivo da criança. Escolha a mais fácil para você.",
    qrTitle: "1. Conectar com um código QR",
    qrHint: "Escaneie este código no dispositivo da criança e a conexão é feita na hora.",
    orDivider: "ou",
    linkTitle: "2. Conectar com um link",
    linkHint: "No dispositivo da criança, abra:",
    thenEnter: "e depois digite este código:",
    yourCode: "Seu código",
    ttlPrefix: "Expira em",
    ttlSuffix: "min",
    expired: "O código expirou. Gere um novo.",
    newCode: "Novo código",
    generating: "Gerando...",
    pairedTitle: "Dispositivo conectado ✓",
    pairedSub: "O dispositivo agora está vinculado de forma permanente à conta deste membro.",
    done: "← Voltar para a família",
    back: "← Voltar",
    qrAlt: "Código QR de conexão",
  },
  fr: {
    title: "Associer un appareil",
    sub: "Il existe deux façons de connecter l'appareil de l'enfant. Choisissez la plus simple.",
    qrTitle: "1. Se connecter avec un code QR",
    qrHint: "Scannez ce code depuis l'appareil de l'enfant, la connexion est immédiate.",
    orDivider: "ou",
    linkTitle: "2. Se connecter avec un lien",
    linkHint: "Sur l'appareil de l'enfant, ouvrez :",
    thenEnter: "puis saisissez ce code :",
    yourCode: "Votre code",
    ttlPrefix: "Expire dans",
    ttlSuffix: "min",
    expired: "Le code a expiré. Générez-en un nouveau.",
    newCode: "Nouveau code",
    generating: "Génération...",
    pairedTitle: "Appareil associé ✓",
    pairedSub: "L'appareil est désormais lié de façon permanente au compte de ce membre.",
    done: "← Retour à la famille",
    back: "← Retour",
    qrAlt: "Code QR d'association",
  },
  de: {
    title: "Gerät verbinden",
    sub: "Es gibt zwei Wege, das Gerät des Kindes zu verbinden. Wählen Sie den einfacheren.",
    qrTitle: "1. Mit einem QR-Code verbinden",
    qrHint: "Scannen Sie diesen Code mit dem Gerät des Kindes, und die Verbindung steht sofort.",
    orDivider: "oder",
    linkTitle: "2. Mit einem Link verbinden",
    linkHint: "Öffnen Sie auf dem Gerät des Kindes:",
    thenEnter: "und geben Sie dann diesen Code ein:",
    yourCode: "Ihr Code",
    ttlPrefix: "Läuft ab in",
    ttlSuffix: "Min.",
    expired: "Der Code ist abgelaufen. Erstellen Sie einen neuen.",
    newCode: "Neuer Code",
    generating: "Wird erstellt...",
    pairedTitle: "Gerät verbunden ✓",
    pairedSub: "Das Gerät ist jetzt dauerhaft mit dem Konto dieses Mitglieds verknüpft.",
    done: "← Zurück zur Familie",
    back: "← Zurück",
    qrAlt: "QR-Code zum Verbinden",
  },
  cs: {
    title: "Připojit zařízení",
    sub: "Zařízení dítěte můžete připojit dvěma způsoby. Vyberte ten, který je pro vás jednodušší.",
    qrTitle: "1. Připojení pomocí QR kódu",
    qrHint: "Naskenujte tento kód zařízením dítěte a připojení proběhne okamžitě.",
    orDivider: "nebo",
    linkTitle: "2. Připojení pomocí odkazu",
    linkHint: "Na zařízení dítěte otevřete:",
    thenEnter: "a pak zadejte tento kód:",
    yourCode: "Váš kód",
    ttlPrefix: "Vyprší za",
    ttlSuffix: "min",
    expired: "Platnost kódu vypršela. Vytvořte nový.",
    newCode: "Nový kód",
    generating: "Vytváříme...",
    pairedTitle: "Zařízení připojeno ✓",
    pairedSub: "Zařízení je nyní trvale propojeno s účtem tohoto člena.",
    done: "← Zpět na rodinu",
    back: "← Zpět",
    qrAlt: "QR kód pro připojení",
  },
  sk: {
    title: "Pripojiť zariadenie",
    sub: "Zariadenie dieťaťa môžete pripojiť dvoma spôsobmi. Vyberte ten, ktorý je pre vás jednoduchší.",
    qrTitle: "1. Pripojenie cez QR kód",
    qrHint: "Naskenujte tento kód zariadením dieťaťa a pripojenie prebehne okamžite.",
    orDivider: "alebo",
    linkTitle: "2. Pripojenie cez odkaz",
    linkHint: "Na zariadení dieťaťa otvorte:",
    thenEnter: "a potom zadajte tento kód:",
    yourCode: "Váš kód",
    ttlPrefix: "Vyprší o",
    ttlSuffix: "min",
    expired: "Platnosť kódu vypršala. Vytvorte nový.",
    newCode: "Nový kód",
    generating: "Vytvárame...",
    pairedTitle: "Zariadenie pripojené ✓",
    pairedSub: "Zariadenie je teraz natrvalo prepojené s účtom tohto člena.",
    done: "← Späť na rodinu",
    back: "← Späť",
    qrAlt: "QR kód na pripojenie",
  },
  it: {
    title: "Collega dispositivo",
    sub: "Ci sono due modi per collegare il dispositivo del bambino. Scegli quello più comodo.",
    qrTitle: "1. Collega con un codice QR",
    qrHint: "Scansiona questo codice dal dispositivo del bambino e il collegamento è immediato.",
    orDivider: "oppure",
    linkTitle: "2. Collega con un link",
    linkHint: "Sul dispositivo del bambino, apri:",
    thenEnter: "poi inserisci questo codice:",
    yourCode: "Il tuo codice",
    ttlPrefix: "Scade tra",
    ttlSuffix: "min",
    expired: "Il codice è scaduto. Generane uno nuovo.",
    newCode: "Nuovo codice",
    generating: "Generazione...",
    pairedTitle: "Dispositivo collegato ✓",
    pairedSub: "Il dispositivo ora è collegato in modo permanente all'account di questo membro.",
    done: "← Torna alla famiglia",
    back: "← Indietro",
    qrAlt: "Codice QR di collegamento",
  },
  ja: {
    title: "端末を接続",
    sub: "お子さまの端末を接続する方法は2つあります。使いやすい方を選んでください。",
    qrTitle: "1. QRコードで接続",
    qrHint: "お子さまの端末でこのコードを読み取ると、すぐに接続されます。",
    orDivider: "または",
    linkTitle: "2. リンクで接続",
    linkHint: "お子さまの端末で次のページを開きます:",
    thenEnter: "次に、このコードを入力します:",
    yourCode: "あなたのコード",
    ttlPrefix: "有効期限まで",
    ttlSuffix: "分",
    expired: "コードの有効期限が切れました。新しいコードを発行してください。",
    newCode: "新しいコード",
    generating: "発行中...",
    pairedTitle: "端末を接続しました ✓",
    pairedSub: "この端末は、このメンバーのアカウントに常に接続された状態になりました。",
    done: "← 家族ページに戻る",
    back: "← 戻る",
    qrAlt: "接続用QRコード",
  },
  uk: {
    title: "Підключення пристрою",
    sub: "Є два способи підключити пристрій дитини. Оберіть зручніший.",
    qrTitle: "1. Підключення через QR-код",
    qrHint: "Відскануйте цей код із пристрою дитини, і підключення відбудеться одразу.",
    orDivider: "або",
    linkTitle: "2. Підключення через посилання",
    linkHint: "На пристрої дитини відкрийте:",
    thenEnter: "а потім введіть цей код:",
    yourCode: "Ваш код",
    ttlPrefix: "Спливає через",
    ttlSuffix: "хв",
    expired: "Термін дії коду минув. Створіть новий.",
    newCode: "Новий код",
    generating: "Створюємо...",
    pairedTitle: "Пристрій підключено ✓",
    pairedSub: "Тепер пристрій постійно пов'язаний з акаунтом цього члена родини.",
    done: "← Назад до родини",
    back: "← Назад",
    qrAlt: "QR-код для підключення",
  },
  tr: {
    title: "Cihaz bağla",
    sub: "Çocuğun cihazını bağlamanın iki yolu var. Size en kolay geleni seçin.",
    qrTitle: "1. QR koduyla bağlan",
    qrHint: "Bu kodu çocuğun cihazıyla tarayın, bağlantı hemen kurulur.",
    orDivider: "veya",
    linkTitle: "2. Bağlantı linkiyle bağlan",
    linkHint: "Çocuğun cihazında şunu açın:",
    thenEnter: "sonra bu kodu girin:",
    yourCode: "Kodunuz",
    ttlPrefix: "Süresi doluyor:",
    ttlSuffix: "dk",
    expired: "Kodun süresi doldu. Yeni bir kod oluşturun.",
    newCode: "Yeni kod",
    generating: "Oluşturuluyor...",
    pairedTitle: "Cihaz bağlandı ✓",
    pairedSub: "Cihaz artık bu üyenin hesabına kalıcı olarak bağlı.",
    done: "← Aileye dön",
    back: "← Geri",
    qrAlt: "Bağlantı QR kodu",
  },
  pl: {
    title: "Połącz urządzenie",
    sub: "Urządzenie dziecka można połączyć na dwa sposoby. Wybierz ten, który jest wygodniejszy.",
    qrTitle: "1. Połącz za pomocą kodu QR",
    qrHint: "Zeskanuj ten kod na urządzeniu dziecka, a połączenie nastąpi od razu.",
    orDivider: "lub",
    linkTitle: "2. Połącz za pomocą linku",
    linkHint: "Na urządzeniu dziecka otwórz:",
    thenEnter: "a następnie wpisz ten kod:",
    yourCode: "Twój kod",
    ttlPrefix: "Wygasa za",
    ttlSuffix: "min",
    expired: "Kod wygasł. Wygeneruj nowy.",
    newCode: "Nowy kod",
    generating: "Generowanie...",
    pairedTitle: "Urządzenie połączone ✓",
    pairedSub: "Urządzenie jest teraz na stałe połączone z kontem tego członka rodziny.",
    done: "← Wróć do rodziny",
    back: "← Wstecz",
    qrAlt: "Kod QR do połączenia",
  },
  fa: {
    title: "اتصال دستگاه",
    sub: "دو راه برای اتصال دستگاه کودک وجود دارد. هر کدام برایتان راحت‌تر است انتخاب کنید.",
    qrTitle: "1. اتصال با کد QR",
    qrHint: "این کد را با دستگاه کودک اسکن کنید تا فوراً متصل شود.",
    orDivider: "یا",
    linkTitle: "2. اتصال با لینک",
    linkHint: "در دستگاه کودک، این نشانی را باز کنید:",
    thenEnter: "سپس این کد را وارد کنید:",
    yourCode: "کد شما",
    ttlPrefix: "منقضی می‌شود تا",
    ttlSuffix: "دقیقه",
    expired: "کد منقضی شده است. یک کد جدید بسازید.",
    newCode: "کد جدید",
    generating: "در حال ساخت...",
    pairedTitle: "دستگاه متصل شد ✓",
    pairedSub: "این دستگاه اکنون به‌طور دائمی به حساب این عضو خانواده متصل است.",
    done: "← بازگشت به صفحه خانواده",
    back: "→ بازگشت",
    qrAlt: "کد QR اتصال دستگاه",
  },
  id: {
    title: "Hubungkan perangkat",
    sub: "Ada dua cara untuk menghubungkan perangkat anak. Pilih yang paling mudah bagi Anda.",
    qrTitle: "1. Hubungkan dengan kode QR",
    qrHint: "Pindai kode ini dari perangkat anak dan perangkat langsung terhubung.",
    orDivider: "atau",
    linkTitle: "2. Hubungkan dengan tautan",
    linkHint: "Di perangkat anak, buka:",
    thenEnter: "lalu masukkan kode ini:",
    yourCode: "Kode Anda",
    ttlPrefix: "Kedaluwarsa dalam",
    ttlSuffix: "menit",
    expired: "Kode sudah kedaluwarsa. Buat kode baru.",
    newCode: "Kode baru",
    generating: "Membuat...",
    pairedTitle: "Perangkat terhubung ✓",
    pairedSub: "Perangkat ini sekarang terhubung secara permanen ke akun anggota ini.",
    done: "← Kembali ke keluarga",
    back: "← Kembali",
    qrAlt: "Kode QR untuk menghubungkan",
  },
  nl: {
    title: "Apparaat koppelen",
    sub: "Je kunt het apparaat van het kind op twee manieren koppelen. Kies wat voor jou het makkelijkst is.",
    qrTitle: "1. Koppelen met een QR-code",
    qrHint: "Scan deze code met het apparaat van het kind en het is meteen gekoppeld.",
    orDivider: "of",
    linkTitle: "2. Koppelen met een link",
    linkHint: "Open op het apparaat van het kind:",
    thenEnter: "en voer daarna deze code in:",
    yourCode: "Je code",
    ttlPrefix: "Verloopt over",
    ttlSuffix: "min",
    expired: "De code is verlopen. Maak een nieuwe aan.",
    newCode: "Nieuwe code",
    generating: "Bezig met aanmaken...",
    pairedTitle: "Apparaat gekoppeld ✓",
    pairedSub: "Het apparaat is nu blijvend gekoppeld aan het account van dit gezinslid.",
    done: "← Terug naar gezin",
    back: "← Terug",
    qrAlt: "QR-code om te koppelen",
  },
  vi: {
    title: "Kết nối thiết bị",
    sub: "Có hai cách để kết nối thiết bị của con. Hãy chọn cách thuận tiện nhất.",
    qrTitle: "1. Kết nối bằng mã QR",
    qrHint: "Quét mã này từ thiết bị của con và thiết bị sẽ được kết nối ngay.",
    orDivider: "hoặc",
    linkTitle: "2. Kết nối bằng đường dẫn",
    linkHint: "Trên thiết bị của con, mở:",
    thenEnter: "rồi nhập mã này:",
    yourCode: "Mã của bạn",
    ttlPrefix: "Hết hạn sau",
    ttlSuffix: "phút",
    expired: "Mã đã hết hạn. Hãy tạo mã mới.",
    newCode: "Mã mới",
    generating: "Đang tạo...",
    pairedTitle: "Đã kết nối thiết bị ✓",
    pairedSub: "Thiết bị giờ đã được liên kết vĩnh viễn với tài khoản của thành viên này.",
    done: "← Quay lại gia đình",
    back: "← Quay lại",
    qrAlt: "Mã QR kết nối",
  },
  fil: {
    title: "Ikonekta ang device",
    sub: "May dalawang paraan para ikonekta ang device ng bata. Piliin kung alin ang mas madali.",
    qrTitle: "1. Kumonekta gamit ang QR code",
    qrHint: "I-scan ang code na ito mula sa device ng bata at agad itong makokonekta.",
    orDivider: "o",
    linkTitle: "2. Kumonekta gamit ang link",
    linkHint: "Sa device ng bata, buksan ang:",
    thenEnter: "pagkatapos ay ilagay ang code na ito:",
    yourCode: "Ang code mo",
    ttlPrefix: "Mag-e-expire sa loob ng",
    ttlSuffix: "min",
    expired: "Nag-expire na ang code. Gumawa ng bago.",
    newCode: "Bagong code",
    generating: "Ginagawa...",
    pairedTitle: "Nakakonekta na ang device ✓",
    pairedSub: "Permanente nang naka-link ang device sa account ng miyembrong ito.",
    done: "← Bumalik sa pamilya",
    back: "← Bumalik",
    qrAlt: "QR code para sa pagkonekta",
  },
  af: {
    title: "Koppel toestel",
    sub: "Daar is twee maniere om die kind se toestel te koppel. Kies die een wat die maklikste is.",
    qrTitle: "1. Koppel met 'n QR-kode",
    qrHint: "Skandeer hierdie kode met die kind se toestel en dit word dadelik gekoppel.",
    orDivider: "of",
    linkTitle: "2. Koppel met 'n skakel",
    linkHint: "Maak op die kind se toestel oop:",
    thenEnter: "en tik dan hierdie kode in:",
    yourCode: "Jou kode",
    ttlPrefix: "Verval oor",
    ttlSuffix: "min",
    expired: "Die kode het verval. Skep 'n nuwe een.",
    newCode: "Nuwe kode",
    generating: "Skep tans...",
    pairedTitle: "Toestel gekoppel ✓",
    pairedSub: "Die toestel is nou permanent aan hierdie lid se rekening gekoppel.",
    done: "← Terug na gesin",
    back: "← Terug",
    qrAlt: "QR-kode vir koppeling",
  },
  sw: {
    title: "Unganisha kifaa",
    sub: "Kuna njia mbili za kuunganisha kifaa cha mtoto. Chagua iliyo rahisi kwako.",
    qrTitle: "1. Unganisha kwa msimbo wa QR",
    qrHint: "Changanua msimbo huu kutoka kwenye kifaa cha mtoto na kitaunganishwa mara moja.",
    orDivider: "au",
    linkTitle: "2. Unganisha kwa kiungo",
    linkHint: "Kwenye kifaa cha mtoto, fungua:",
    thenEnter: "kisha weka msimbo huu:",
    yourCode: "Msimbo wako",
    ttlPrefix: "Unaisha baada ya",
    ttlSuffix: "dakika",
    expired: "Muda wa msimbo umeisha. Unda mpya.",
    newCode: "Msimbo mpya",
    generating: "Inaunda...",
    pairedTitle: "Kifaa kimeunganishwa ✓",
    pairedSub: "Kifaa sasa kimeunganishwa kwa kudumu na akaunti ya mwanafamilia huyu.",
    done: "← Rudi kwa familia",
    back: "← Rudi",
    qrAlt: "Msimbo wa QR wa kuunganisha",
  },
  "zh-CN": {
    title: "连接设备",
    sub: "有两种方式可以连接孩子的设备，选择你觉得方便的一种即可。",
    qrTitle: "1. 用二维码连接",
    qrHint: "用孩子的设备扫描这个二维码，即可立即连接。",
    orDivider: "或",
    linkTitle: "2. 用链接连接",
    linkHint: "在孩子的设备上打开：",
    thenEnter: "然后输入这个代码：",
    yourCode: "你的代码",
    ttlPrefix: "剩余有效时间",
    ttlSuffix: "分钟",
    expired: "代码已过期，请生成新代码。",
    newCode: "新代码",
    generating: "正在生成...",
    pairedTitle: "设备已连接 ✓",
    pairedSub: "该设备现已永久绑定到这位成员的账户。",
    done: "← 返回家庭",
    back: "← 返回",
    qrAlt: "设备连接二维码",
  },
  "zh-TW": {
    title: "連接裝置",
    sub: "有兩種方式可以連接孩子的裝置，選擇你覺得方便的一種即可。",
    qrTitle: "1. 用 QR 碼連接",
    qrHint: "用孩子的裝置掃描這個 QR 碼，即可立即連接。",
    orDivider: "或",
    linkTitle: "2. 用連結連接",
    linkHint: "在孩子的裝置上開啟：",
    thenEnter: "然後輸入這組代碼：",
    yourCode: "你的代碼",
    ttlPrefix: "剩餘有效時間",
    ttlSuffix: "分鐘",
    expired: "代碼已過期，請產生新代碼。",
    newCode: "新代碼",
    generating: "正在產生...",
    pairedTitle: "裝置已連接 ✓",
    pairedSub: "這個裝置現在已永久綁定到這位成員的帳戶。",
    done: "← 返回家庭",
    back: "← 返回",
    qrAlt: "裝置連接 QR 碼",
  },
  ko: {
    title: "기기 연결",
    sub: "아이의 기기를 연결하는 방법은 두 가지예요. 편한 방법을 골라 주세요.",
    qrTitle: "1. QR 코드로 연결",
    qrHint: "아이의 기기로 이 코드를 스캔하면 바로 연결돼요.",
    orDivider: "또는",
    linkTitle: "2. 링크로 연결",
    linkHint: "아이의 기기에서 다음 주소를 열어 주세요:",
    thenEnter: "그런 다음 이 코드를 입력하세요:",
    yourCode: "내 코드",
    ttlPrefix: "만료까지",
    ttlSuffix: "분",
    expired: "코드가 만료되었어요. 새 코드를 만들어 주세요.",
    newCode: "새 코드",
    generating: "만드는 중...",
    pairedTitle: "기기가 연결되었어요 ✓",
    pairedSub: "이제 이 기기는 이 구성원의 계정에 계속 연결되어 있어요.",
    done: "← 가족으로 돌아가기",
    back: "← 뒤로",
    qrAlt: "기기 연결 QR 코드",
  },
  th: {
    title: "เชื่อมต่ออุปกรณ์",
    sub: "เชื่อมต่ออุปกรณ์ของลูกได้ 2 วิธี เลือกวิธีที่สะดวกที่สุด",
    qrTitle: "1. เชื่อมต่อด้วยคิวอาร์โค้ด",
    qrHint: "สแกนโค้ดนี้จากอุปกรณ์ของลูก แล้วจะเชื่อมต่อทันที",
    orDivider: "หรือ",
    linkTitle: "2. เชื่อมต่อด้วยลิงก์",
    linkHint: "บนอุปกรณ์ของลูก ให้เปิด:",
    thenEnter: "จากนั้นกรอกรหัสนี้:",
    yourCode: "รหัสของคุณ",
    ttlPrefix: "หมดอายุใน",
    ttlSuffix: "นาที",
    expired: "รหัสหมดอายุแล้ว สร้างรหัสใหม่",
    newCode: "รหัสใหม่",
    generating: "กำลังสร้าง...",
    pairedTitle: "เชื่อมต่ออุปกรณ์แล้ว ✓",
    pairedSub: "ตอนนี้อุปกรณ์นี้เชื่อมกับบัญชีของสมาชิกคนนี้อย่างถาวรแล้ว",
    done: "← กลับไปที่ครอบครัว",
    back: "← ย้อนกลับ",
    qrAlt: "คิวอาร์โค้ดสำหรับเชื่อมต่อ",
  },
  bn: {
    title: "ডিভাইস যুক্ত করুন",
    sub: "শিশুর ডিভাইস যুক্ত করার দুটি উপায় আছে। যেটি আপনার জন্য সহজ সেটি বেছে নিন।",
    qrTitle: "1. QR কোড দিয়ে যুক্ত করুন",
    qrHint: "শিশুর ডিভাইস থেকে এই কোডটি স্ক্যান করুন, সঙ্গে সঙ্গে যুক্ত হয়ে যাবে।",
    orDivider: "অথবা",
    linkTitle: "2. লিংক দিয়ে যুক্ত করুন",
    linkHint: "শিশুর ডিভাইসে খুলুন:",
    thenEnter: "তারপর এই কোডটি লিখুন:",
    yourCode: "আপনার কোড",
    ttlPrefix: "মেয়াদ শেষ হবে",
    ttlSuffix: "মিনিটে",
    expired: "কোডের মেয়াদ শেষ। নতুন কোড তৈরি করুন।",
    newCode: "নতুন কোড",
    generating: "তৈরি হচ্ছে...",
    pairedTitle: "ডিভাইস যুক্ত হয়েছে ✓",
    pairedSub: "ডিভাইসটি এখন এই সদস্যের অ্যাকাউন্টের সঙ্গে স্থায়ীভাবে যুক্ত।",
    done: "← পরিবারে ফিরে যান",
    back: "← ফিরে যান",
    qrAlt: "ডিভাইস যুক্ত করার QR কোড",
  },
  da: {
    title: "Tilknyt enhed",
    sub: "Der er to måder at forbinde barnets enhed på. Vælg den, der er nemmest.",
    qrTitle: "1. Forbind med en QR-kode",
    qrHint: "Scan denne kode med barnets enhed, så er den forbundet med det samme.",
    orDivider: "eller",
    linkTitle: "2. Forbind med et link",
    linkHint: "Åbn på barnets enhed:",
    thenEnter: "og indtast derefter denne kode:",
    yourCode: "Din kode",
    ttlPrefix: "Udløber om",
    ttlSuffix: "min.",
    expired: "Koden er udløbet. Lav en ny.",
    newCode: "Ny kode",
    generating: "Opretter...",
    pairedTitle: "Enhed tilknyttet ✓",
    pairedSub: "Enheden er nu permanent knyttet til dette medlems konto.",
    done: "← Tilbage til familien",
    back: "← Tilbage",
    qrAlt: "QR-kode til tilknytning",
  },
  hu: {
    title: "Eszköz csatlakoztatása",
    sub: "A gyerek eszközét kétféleképpen csatlakoztathatod. Válaszd azt, amelyik egyszerűbb.",
    qrTitle: "1. Csatlakozás QR-kóddal",
    qrHint: "Olvasd be ezt a kódot a gyerek eszközével, és azonnal csatlakozik.",
    orDivider: "vagy",
    linkTitle: "2. Csatlakozás linkkel",
    linkHint: "A gyerek eszközén nyisd meg:",
    thenEnter: "majd írd be ezt a kódot:",
    yourCode: "A kódod",
    ttlPrefix: "Lejár:",
    ttlSuffix: "perc múlva",
    expired: "A kód lejárt. Hozz létre újat.",
    newCode: "Új kód",
    generating: "Létrehozás...",
    pairedTitle: "Eszköz csatlakoztatva ✓",
    pairedSub: "Az eszköz mostantól tartósan ehhez a családtag fiókjához kapcsolódik.",
    done: "← Vissza a családhoz",
    back: "← Vissza",
    qrAlt: "QR-kód a csatlakoztatáshoz",
  },
};

function formatMs(ms: number): string {
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function FamilyPairClient() {
  const { user, loading } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const params = useParams<{ memberId: string }>();
  const memberId = params.memberId;
  // Merge per-key so a language that hasn't translated the newer two-option
  // strings still shows English for just those, not a broken undefined.
  const c = { ...COPY.en, ...(COPY[lang] ?? {}) };

  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [generating, setGenerating] = useState(false);
  const [member, setMember] = useState<FamilyMember | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://gadit.app";
  const qrUrl = useMemo(
    () => (code ? `${origin}/join?code=${code}` : ""),
    [code, origin]
  );

  // Subscribe to member doc to detect successful pair.
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, "families", user.uid, "members", memberId),
      (snap) => {
        if (snap.exists()) {
          setMember({ id: snap.id, ...(snap.data() as Omit<FamilyMember, "id">) });
        }
      }
    );
    return unsub;
  }, [user, memberId]);

  // Generate a fresh pairing code on mount.
  useEffect(() => {
    if (!user || member?.userId) return;
    void generateCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, member?.userId]);

  // Tick clock so the countdown re-renders.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const [relink, setRelink] = useState(false);

  async function generateCode() {
    if (!user) return;
    setGenerating(true);
    try {
      const { getIdToken } = await import("firebase/auth");
      const idToken = await getIdToken(user);
      const res = await fetch("/api/family/pair/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (data.code) {
        setCode(data.code);
        setRelink(data.relink === true);
        // Base the countdown on the CLIENT clock, not the server's absolute
        // expiresAt: a device whose clock runs ahead was showing "expired"
        // the instant the code was generated (Sheli, 2026-07-30). The server
        // still validates the real expiry against its own clock on redeem.
        setExpiresAt(Date.now() + PAIRING_CODE_TTL_MS);
      }
    } catch (e) {
      console.error("generate code failed:", e);
    } finally {
      setGenerating(false);
    }
  }

  if (loading || !user) {
    return <div className="wordbook wb-family-page" dir={dir}><div className="gd-wait-page"><WaitDots className="gd-wait-big" /></div></div>;
  }

  // Success state — the member just paired their device.
  if (member?.userId) {
    return (
      <div className="wordbook wb-family-page" dir={dir}>
        <main className="wb-family-main">
          <div className="wb-family-pair-card">
            <h1 className="wb-family-title">{c.pairedTitle}</h1>
            <p className="wb-family-sub">{c.pairedSub}</p>
            <BackLink href={href("/family")} className="wb-family-cta">{c.done}</BackLink>
          </div>
        </main>
      </div>
    );
  }

  const msLeft = expiresAt ? expiresAt - now : 0;
  const expired = expiresAt !== null && msLeft <= 0;

  return (
    <div className="wordbook wb-family-page" dir={dir}>
      <main className="wb-family-main">
        <BackLink href={href("/family")} anyPrevious className="wb-family-back">{c.back}</BackLink>

        <header className="wb-family-header">
          <h1 className="wb-family-title">{c.title}</h1>
          <p className="wb-family-sub">{c.sub}</p>
          {relink && <p className="wb-family-sub" style={{ color: "var(--teal-deep, #0B8A8A)", fontWeight: 600 }}>✓ {relinkCopy(lang).relinkNote}</p>}
        </header>

        <div className="wb-family-pair-card">
          {code && !expired && (
            <>
              {/* Option 1 — scan the QR. Instant, no typing. */}
              <div className="wb-pair-option">
                <div className="wb-pair-option-title">{c.qrTitle}</div>
                <p className="wb-pair-option-hint">{c.qrHint}</p>
                <div className="wb-family-qr-frame" dir="ltr">
                  <QRCodeSVG value={qrUrl} size={200} bgColor="#FFFFFF" fgColor="#0F172A" level="M" />
                </div>
              </div>

              <div className="wb-pair-or"><span>{c.orDivider}</span></div>

              {/* Option 2 — open the link, then type the code. */}
              <div className="wb-pair-option">
                <div className="wb-pair-option-title">{c.linkTitle}</div>
                <p className="wb-pair-option-hint">{c.linkHint}</p>
                <a
                  href={`${origin}/join`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wb-pair-joinlink"
                  dir="ltr"
                >
                  gadit.app/join
                </a>
                <p className="wb-pair-option-hint" style={{ marginTop: 14 }}>{c.thenEnter}</p>
                <div className="wb-family-code-label">{c.yourCode}</div>
                <div className="wb-family-code" dir="ltr">{code}</div>
              </div>

              <div className="wb-family-code-ttl">
                {c.ttlPrefix} {formatMs(msLeft)} {c.ttlSuffix}
              </div>
            </>
          )}
          {(expired || !code) && (
            <div className="wb-family-code-expired">
              {expired ? c.expired : ""}
            </div>
          )}
          <button
            type="button"
            className="wb-family-cta-ghost"
            onClick={generateCode}
            disabled={generating}
          >
            {generating ? <WaitText text={c.generating} /> : c.newCode}
          </button>
        </div>
      </main>
    </div>
  );
}
