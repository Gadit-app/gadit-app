"use client";

/**
 * GaditDemoAnimation — wide, desktop-style tour that walks visitors
 * through a real Gadit lookup, tier by tier, in their UI language.
 *
 * Architecture choice (locked after Gadi's June 9 feedback):
 *   1. Each language renders ONLY its own content — no English fallback,
 *      no language-mixing inside the frame. Showing a Hebrew visitor
 *      "ephemeral" while the UI is in עברית reads as broken.
 *   2. We pick one word per language ("dream" in every locale) so the
 *      tour structure is identical across languages but the content is
 *      always native. Dream was chosen because it carries the same
 *      duality (sleep vision / aspiration) in every culture, has rich
 *      examples and idioms in every language, and a clean etymology.
 *   3. Layout is desktop-wide (~720px) — earlier mobile-frame felt
 *      like we were hiding the product behind a phone shell.
 *
 * Scenes:
 *   basic     8.0s — search bar + word title + 2 meanings × 3 examples
 *                   + idioms + etymology (the whole Basic experience)
 *   clear     8.0s — same word + kids toggle on + kids explanation
 *                   replaces the meaning text + image preview + compose
 *                   sentence with a "Perfect ✓"
 *   deep      6.5s — quiz card with correct-answer pulse, anagram
 *                   letters, compare-two-words preview
 *
 * The partner scene was removed 2026-06-26 — /features should sell the
 * product, not the affiliate program. The Partner content + PartnerScene
 * stay in the file as dead code so we can re-enable it cheaply by adding
 * "partner" back to SCENE_ORDER if we ever want it.
 *
 * Reduced-motion freezes on the active scene with everything visible.
 * Hover pauses. Click a dot to jump.
 */

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";

type Scene = "basic" | "clear" | "deep" | "partner";

const SCENE_ORDER: Scene[] = ["basic", "clear", "deep"];
const SCENE_DURATION_MS: Record<Scene, number> = {
  basic: 8000,
  clear: 8000,
  deep: 6500,
  partner: 8500,
};

interface DemoContent {
  word: string;
  searchPlaceholder: string;
  // Basic content
  meanings: Array<{ definition: string; examples: string[] }>;
  idioms: string[];
  etymology: { from: string; original: string; meant: string };
  // Clear content
  kidsExplanation: string;
  composeSentence: string;
  composeStatus: string;
  imageDescription: string;
  // Deep content
  quizQuestion: string;
  quizOptions: string[];
  quizCorrect: number;
  anagramLetters: string;
  compareWords: string;
  compareNote: string;
  // Partner
  partnerHeroTitle: string;
  partnerHeroBody: string;
  partnerLink: string;
  partnerEarnings: string;
  partnerSubs: string;
  partnerRate: string;
  partnerStatus: string;
  // Labels — short, per-language
  l: {
    watchEyebrow: string;
    watchTitle: string;
    watchLede: string;
    tierBasic: string;
    tierClear: string;
    tierDeep: string;
    tierPartner: string;
    searchBtn: string;
    meaningsLabel: string;
    meaningN: (n: number) => string;
    examplesLabel: string;
    idiomsLabel: string;
    etymologyLabel: string;
    etyFromLabel: string;
    etyMeantLabel: string;
    kidsToggle: string;
    kidsLabel: string;
    composeLabel: string;
    imageLabel: string;
    saved: string;
    plusBasic: string;
    plusClear: string;
    quizLabel: string;
    gameLabel: string;
    compareLabel: string;
    dashTitle: string;
    linkLabel: string;
    earningsLabel: string;
    subsLabel: string;
    rateLabel: string;
  };
}

const DEMO: Record<string, DemoContent> = {
  en: {
    word: "dream",
    searchPlaceholder: "Type a word",
    meanings: [
      {
        definition: "Images, thoughts, and sensations occurring in the mind during sleep.",
        examples: [
          "I had a strange dream last night.",
          "She woke up from a peaceful dream.",
          "Children often dream about flying.",
        ],
      },
      {
        definition: "A cherished aspiration, ambition, or ideal.",
        examples: [
          "It was her dream to become a writer.",
          "He worked hard to make his dream a reality.",
          "Never give up on your dreams.",
        ],
      },
    ],
    idioms: ["a dream come true", "in your wildest dreams", "the American Dream"],
    etymology: {
      from: "Old English",
      original: "drēam",
      meant: "joy, music, the night-vision sense emerged in Middle English",
    },
    kidsExplanation:
      "When you sleep, your brain plays little movies in your head, those are dreams. A dream can also be something amazing you really want to happen one day.",
    composeSentence: "Her dream of becoming a doctor finally came true.",
    composeStatus: "Perfect ✓",
    imageDescription: "dream",
    quizQuestion: "Which word means \"an aspiration you hope to achieve\"?",
    quizOptions: ["thought", "dream", "fact", "memory"],
    quizCorrect: 1,
    anagramLetters: "amerd",
    compareWords: "dream vs. ambition",
    compareNote: "Both about wanting something, see the exact difference.",
    partnerHeroTitle: "Spread Gadit. Earn with us.",
    partnerHeroBody: "Love Gadit? Share your personal link with parents, students, language learners, and earn 30% on every subscription, for the first year. Hit 10 active subscribers and you unlock 10% lifetime commission on all of them.",
    partnerLink: "gadit.app/?ref=alex",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% year 1 · 10% lifetime",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Watch Gadit",
      watchTitle: "See how every word opens, tier by tier.",
      watchLede: "A live walkthrough of a real word, in your language. Hover to pause.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Search",
      meaningsLabel: "Meanings",
      meaningN: (n) => `Meaning ${n}`,
      examplesLabel: "Examples",
      idiomsLabel: "Idioms & expressions",
      etymologyLabel: "Word origin",
      etyFromLabel: "From",
      etyMeantLabel: "Originally meant",
      kidsToggle: "Kids mode",
      kidsLabel: "Kids explanation",
      composeLabel: "Write your sentence",
      imageLabel: "Visual",
      saved: "Saved to notebook ★",
      plusBasic: "Plus everything in Basic",
      plusClear: "Plus everything in Clear",
      quizLabel: "Quiz",
      gameLabel: "Word game",
      compareLabel: "Compare two words",
      dashTitle: "Partner dashboard",
      linkLabel: "Your personal link",
      earningsLabel: "This month",
      subsLabel: "Active subscribers",
      rateLabel: "Commission",
    },
  },
  zu: {
    word: "iphupho",
    searchPlaceholder: "Bhala igama",
    meanings: [
      {
        definition: "Izithombe, imicabango, nemizwa evela engqondweni ngesikhathi umuntu elele.",
        examples: [
          "Ngibe nephupho eliyinqaba izolo ebusuku.",
          "Uvuke ephusheni elizolile.",
          "Izingane zivame ukuphupha ngokundiza.",
        ],
      },
      {
        definition: "Isifiso esiligugu, inhloso, noma umgomo womuntu.",
        examples: [
          "Bekuyiphupho lakhe ukuba umbhali.",
          "Usebenze kanzima ukwenza iphupho lakhe libe yiqiniso.",
          "Ungalokothi uyeke amaphupho akho.",
        ],
      },
    ],
    idioms: ["iphupho eligcwalisekile", "ngisho emaphusheni akho amabi kunawo wonke", "Iphupho LaseMelika"],
    etymology: {
      from: "isiZulu sasendulo",
      original: "-phupha",
      meant: "umbono womuntu elele, kamuva kwaqhamuka nomqondo wesifiso nenhloso",
    },
    kidsExplanation:
      "Uma ulele ebusuku, ubuchopho bakho budlala amabhayisikobho amancane ekhanda lakho, lawo ngamaphupho. Iphupho lingaba yinto emangalisayo ofisa ukuthi yenzeke ngelinye ilanga.",
    composeSentence: "Iphupho lakhe lokuba udokotela ekugcineni lagcwaliseka.",
    composeStatus: "Kuphelele ✓",
    imageDescription: "iphupho",
    quizQuestion: "Yiliphi igama elisho \"isifiso othemba ukusifeza\"?",
    quizOptions: ["umcabango", "iphupho", "iqiniso", "inkumbulo"],
    quizCorrect: 1,
    anagramLetters: "phupohi",
    compareWords: "iphupho vs. inhloso",
    compareNote: "Kokubili kumayelana nokufisa okuthile, bona umehluko oqondile.",
    partnerHeroTitle: "Sabalalisa i-Gadit. Hola nathi.",
    partnerHeroBody: "Uyayithanda i-Gadit? Yabelana ngesixhumanisi sakho somuntu siqu nabazali, abafundi, nabafunda izilimi, bese uhola u-30% kuwo wonke umbhaliso, onyakeni wokuqala. Finyelela kubabhalisi abangu-10 abasebenzayo bese uvula ikhomishini engu-10% yempilo yonke kubo bonke.",
    partnerLink: "gadit.app/?ref=sipho",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% unyaka 1 · 10% impilo yonke",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Buka i-Gadit",
      watchTitle: "Bona ukuthi igama ngalinye livuleka kanjani, izinga ngezinga.",
      watchLede: "Uhambo oluqondile lwegama langempela, ngolimi lwakho. Beka isikhombi ukuze umise.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Umlingani",
      searchBtn: "Sesha",
      meaningsLabel: "Izincazelo",
      meaningN: (n) => `Incazelo ${n}`,
      examplesLabel: "Izibonelo",
      idiomsLabel: "Izisho nezinkulumo",
      etymologyLabel: "Umsuka wegama",
      etyFromLabel: "Kusukela",
      etyMeantLabel: "Ekuqaleni lalisho",
      kidsToggle: "Imodi yezingane",
      kidsLabel: "Incazelo yezingane",
      composeLabel: "Bhala umusho wakho",
      imageLabel: "Isithombe",
      saved: "Kugciniwe ebhukwini ★",
      plusBasic: "Kanye nakho konke okuku-Basic",
      plusClear: "Kanye nakho konke okuku-Clear",
      quizLabel: "Uquiz",
      gameLabel: "Umdlalo wamagama",
      compareLabel: "Qhathanisa amagama amabili",
      dashTitle: "Ideshibhodi yomlingani",
      linkLabel: "Isixhumanisi sakho somuntu siqu",
      earningsLabel: "Le nyanga",
      subsLabel: "Ababhalisi abasebenzayo",
      rateLabel: "Ikhomishini",
    },
  },
  el: {
    word: "όνειρο",
    searchPlaceholder: "Γράψε μια λέξη",
    meanings: [
      {
        definition: "Εικόνες, σκέψεις και αισθήσεις που εμφανίζονται στο μυαλό κατά τη διάρκεια του ύπνου.",
        examples: [
          "Είδα ένα παράξενο όνειρο χθες βράδυ.",
          "Ξύπνησε από ένα ήρεμο όνειρο.",
          "Τα παιδιά συχνά ονειρεύονται ότι πετούν.",
        ],
      },
      {
        definition: "Μια βαθιά επιθυμία, φιλοδοξία ή ιδανικό.",
        examples: [
          "Όνειρό της ήταν να γίνει συγγραφέας.",
          "Δούλεψε σκληρά για να κάνει το όνειρό του πραγματικότητα.",
          "Μην εγκαταλείπεις ποτέ τα όνειρά σου.",
        ],
      },
    ],
    idioms: ["όνειρο που έγινε πραγματικότητα", "ούτε στα πιο τρελά σου όνειρα", "το Αμερικανικό Όνειρο"],
    etymology: {
      from: "Αρχαία ελληνικά",
      original: "ὄνειρος",
      meant: "όραμα στον ύπνο, το μήνυμα που φέρνει ένα όνειρο",
    },
    kidsExplanation:
      "Όταν κοιμάσαι, ο εγκέφαλός σου παίζει μικρές ταινίες στο κεφάλι σου, αυτά είναι τα όνειρα. Ένα όνειρο μπορεί να είναι και κάτι υπέροχο που θέλεις πραγματικά να συμβεί μια μέρα.",
    composeSentence: "Το όνειρό της να γίνει γιατρός επιτέλους έγινε πραγματικότητα.",
    composeStatus: "Τέλεια ✓",
    imageDescription: "όνειρο",
    quizQuestion: "Ποια λέξη σημαίνει \"μια φιλοδοξία που ελπίζεις να πετύχεις\";",
    quizOptions: ["σκέψη", "όνειρο", "γεγονός", "ανάμνηση"],
    quizCorrect: 1,
    anagramLetters: "νεόριο",
    compareWords: "όνειρο εναντίον φιλοδοξία",
    compareNote: "Και τα δύο αφορούν την επιθυμία για κάτι, δες την ακριβή διαφορά.",
    partnerHeroTitle: "Διάδωσε το Gadit. Κέρδισε μαζί μας.",
    partnerHeroBody: "Σου αρέσει το Gadit; Μοιράσου τον προσωπικό σου σύνδεσμο με γονείς, μαθητές και όσους μαθαίνουν γλώσσες, και κέρδισε 30% από κάθε συνδρομή τον πρώτο χρόνο. Φτάσε τους 10 ενεργούς συνδρομητές και ξεκλειδώνεις 10% προμήθεια εφ' όρου ζωής για όλους τους.",
    partnerLink: "gadit.app/?ref=nikos",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% τον 1ο χρόνο · 10% εφ' όρου ζωής",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Δες το Gadit",
      watchTitle: "Δες πώς ανοίγει κάθε λέξη, επίπεδο προς επίπεδο.",
      watchLede: "Μια ζωντανή περιήγηση σε μια πραγματική λέξη, στη γλώσσα σου. Πέρασε τον δείκτη για παύση.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Συνεργάτης",
      searchBtn: "Αναζήτηση",
      meaningsLabel: "Σημασίες",
      meaningN: (n) => `Σημασία ${n}`,
      examplesLabel: "Παραδείγματα",
      idiomsLabel: "Ιδιωματισμοί & εκφράσεις",
      etymologyLabel: "Προέλευση λέξης",
      etyFromLabel: "Από",
      etyMeantLabel: "Αρχικά σήμαινε",
      kidsToggle: "Λειτουργία για παιδιά",
      kidsLabel: "Εξήγηση για παιδιά",
      composeLabel: "Γράψε την πρότασή σου",
      imageLabel: "Εικόνα",
      saved: "Αποθηκεύτηκε στο τετράδιο ★",
      plusBasic: "Συν όλα όσα έχει το Basic",
      plusClear: "Συν όλα όσα έχει το Clear",
      quizLabel: "Κουίζ",
      gameLabel: "Παιχνίδι λέξεων",
      compareLabel: "Σύγκρινε δύο λέξεις",
      dashTitle: "Πίνακας συνεργάτη",
      linkLabel: "Ο προσωπικός σου σύνδεσμος",
      earningsLabel: "Αυτόν τον μήνα",
      subsLabel: "Ενεργοί συνδρομητές",
      rateLabel: "Προμήθεια",
    },
  },
  he: {
    word: "חלום",
    searchPlaceholder: "הקלידו מילה",
    meanings: [
      {
        definition: "תמונות, מחשבות ותחושות שעולות במוח בזמן השינה.",
        examples: [
          "חלמתי חלום מוזר אתמול בלילה.",
          "היא התעוררה מחלום שליו.",
          "ילדים חולמים הרבה על תעופה.",
        ],
      },
      {
        definition: "שאיפה יקרה, חזון, מטרה אישית.",
        examples: [
          "החלום שלה היה להיות סופרת.",
          "הוא עבד קשה כדי להגשים את החלום.",
          "לעולם אל תוותר על החלומות שלך.",
        ],
      },
    ],
    idioms: ["חלום שהתגשם", "מעבר לכל החלומות", "החלום האמריקאי"],
    etymology: {
      from: "עברית מקראית",
      original: "ח־ל־ם",
      meant: "חזון, מראה ליל, שורש המופיע בסיפורי יוסף ודניאל",
    },
    kidsExplanation:
      "כשאתם ישנים בלילה, המוח שלכם מציג סרטונים קטנים בראש, אלה נקראים חלומות. חלום זה גם משהו ממש נפלא שאתם רוצים שיקרה יום אחד.",
    composeSentence: "החלום שלה להיות רופאה סוף סוף התגשם.",
    composeStatus: "מושלם ✓",
    imageDescription: "חלום",
    quizQuestion: "איזו מילה אומרת \"שאיפה שאתם רוצים להגשים\"?",
    quizOptions: ["מחשבה", "חלום", "עובדה", "זיכרון"],
    quizCorrect: 1,
    anagramLetters: "םוחל",
    compareWords: "חלום מול שאיפה",
    compareNote: "שתיהן על רצון להשיג, ראו את ההבדל המדויק.",
    partnerHeroTitle: "הפיצו את Gadit. תרוויחו איתנו.",
    partnerHeroBody: "אוהבים את Gadit? שתפו את הלינק האישי שלכם עם הורים, סטודנטים, לומדי שפות, וקבלו 30% מכל מנוי בשנה הראשונה. הגעתם ל-10 מנויים פעילים? פתחתם 10% עמלה לכל החיים על כולם.",
    partnerLink: "gadit.app/?ref=anna",
    partnerEarnings: "₪175",
    partnerSubs: "18",
    partnerRate: "30% בשנה הראשונה · 10% לכל החיים",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "צפו ב-Gadit",
      watchTitle: "ראו איך כל מילה נפתחת, מסלול אחרי מסלול.",
      watchLede: "סיור חי על מילה אמיתית, בשפה שלכם. ריחפו כדי לעצור.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "שותף",
      searchBtn: "חיפוש",
      meaningsLabel: "משמעויות",
      meaningN: (n) => `משמעות ${n}`,
      examplesLabel: "דוגמאות",
      idiomsLabel: "ניבים וצירופים",
      etymologyLabel: "מקור המילה",
      etyFromLabel: "מקור",
      etyMeantLabel: "במקור הכוונה",
      kidsToggle: "מצב ילדים",
      kidsLabel: "הסבר לילדים",
      composeLabel: "כתבו משפט משלכם",
      imageLabel: "תמונה",
      saved: "נשמר במחברת ★",
      plusBasic: "וכל מה שיש ב-Basic",
      plusClear: "וכל מה שיש ב-Clear",
      quizLabel: "חידון",
      gameLabel: "משחק מילים",
      compareLabel: "השוואת מילים",
      dashTitle: "לוח השותפים",
      linkLabel: "הלינק האישי שלכם",
      earningsLabel: "החודש",
      subsLabel: "מנויים פעילים",
      rateLabel: "עמלה",
    },
  },
  ar: {
    word: "حلم",
    searchPlaceholder: "اكتب كلمة",
    meanings: [
      {
        definition: "صور وأفكار وأحاسيس تظهر في الذهن أثناء النوم.",
        examples: [
          "رأيت حلمًا غريبًا الليلة الماضية.",
          "استيقظت من حلم هادئ.",
          "كثيرًا ما يحلم الأطفال بالطيران.",
        ],
      },
      {
        definition: "أمنية عزيزة أو طموح أو هدف بعيد.",
        examples: [
          "كان حلمها أن تصبح كاتبة.",
          "عمل بجدّ ليحقق حلمه.",
          "لا تتخلَّ أبدًا عن أحلامك.",
        ],
      },
    ],
    idioms: ["حلم تحقق", "أحلام وردية", "الحلم الأمريكي"],
    etymology: {
      from: "العربية الفصحى",
      original: "ح‐ل‐م",
      meant: "رؤيا في النوم؛ وكذلك الأناة والصبر في معنى آخر",
    },
    kidsExplanation:
      "حين تنام في الليل، يعرض دماغك أفلامًا صغيرة في رأسك, هذه تسمى أحلام. والحلم أيضًا شيء جميل جدًا تتمنى أن يتحقق يومًا ما.",
    composeSentence: "تحقق حلمها أخيرًا في أن تصبح طبيبة.",
    composeStatus: "ممتاز ✓",
    imageDescription: "حلم",
    quizQuestion: "أيُّ كلمة تعني \"أمنية تتمنى تحقيقها\"؟",
    quizOptions: ["فكرة", "حلم", "حقيقة", "ذكرى"],
    quizCorrect: 1,
    anagramLetters: "ملح",
    compareWords: "حلم مقابل طموح",
    compareNote: "كلاهما عن الرغبة في شيء, شاهد الفرق الدقيق.",
    partnerHeroTitle: "انشر Gadit. اربح معنا.",
    partnerHeroBody: "تحب Gadit؟ شارك رابطك الشخصي مع الأهل والطلاب ومتعلمي اللغات, واحصل على 30% من كل اشتراك في السنة الأولى. وعندما تصل إلى 10 مشتركين نشطين، تفتح 10% عمولة مدى الحياة على جميعهم.",
    partnerLink: "gadit.app/?ref=layla",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% السنة الأولى · 10% مدى الحياة",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "شاهد Gadit",
      watchTitle: "شاهد كيف تنفتح كل كلمة, طبقة بعد طبقة.",
      watchLede: "جولة حية على كلمة حقيقية بلغتك. مرر للإيقاف.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "شريك",
      searchBtn: "بحث",
      meaningsLabel: "المعاني",
      meaningN: (n) => `المعنى ${n}`,
      examplesLabel: "أمثلة",
      idiomsLabel: "تعابير وعبارات",
      etymologyLabel: "أصل الكلمة",
      etyFromLabel: "من",
      etyMeantLabel: "كانت تعني أصلًا",
      kidsToggle: "وضع الأطفال",
      kidsLabel: "شرح للأطفال",
      composeLabel: "اكتب جملتك",
      imageLabel: "صورة",
      saved: "حُفظ في الدفتر ★",
      plusBasic: "بالإضافة إلى كل ما في Basic",
      plusClear: "بالإضافة إلى كل ما في Clear",
      quizLabel: "اختبار",
      gameLabel: "لعبة كلمات",
      compareLabel: "قارن كلمتين",
      dashTitle: "لوحة الشريك",
      linkLabel: "رابطك الشخصي",
      earningsLabel: "هذا الشهر",
      subsLabel: "مشتركون نشطون",
      rateLabel: "عمولة",
    },
  },
  ru: {
    word: "мечта",
    searchPlaceholder: "Введите слово",
    meanings: [
      {
        definition: "Заветное желание, стремление, идеал, к которому человек стремится.",
        examples: [
          "Её мечта, стать писательницей.",
          "Он много работал, чтобы осуществить свою мечту.",
          "Никогда не отказывайся от своей мечты.",
        ],
      },
      {
        definition: "Образ чего-то желанного, рисуемый воображением (нередко далёкий от реальности).",
        examples: [
          "Это была мечта о тихой жизни у моря.",
          "Дом её мечты, небольшая хижина в горах.",
          "Он лелеял мечту о путешествии в Японию.",
        ],
      },
    ],
    idioms: ["мечта всей жизни", "мечтать не вредно", "сбылась мечта"],
    etymology: {
      from: "Старославянский",
      original: "мьчьта",
      meant: "видение, грёза, изначально связано с воображением, а не со сном",
    },
    kidsExplanation:
      "Мечта, это что-то очень-очень хорошее, чего ты сильно хочешь, чтобы случилось. Например, стать космонавтом или иметь собаку.",
    composeSentence: "Её мечта стать врачом наконец сбылась.",
    composeStatus: "Отлично ✓",
    imageDescription: "мечта",
    quizQuestion: "Какое слово означает \"заветное желание, к которому стремишься\"?",
    quizOptions: ["мысль", "мечта", "факт", "память"],
    quizCorrect: 1,
    anagramLetters: "тачме",
    compareWords: "мечта vs. цель",
    compareNote: "Обе о желаниях, посмотрите точное различие.",
    partnerHeroTitle: "Расскажите о Gadit. Зарабатывайте с нами.",
    partnerHeroBody: "Любите Gadit? Поделитесь личной ссылкой с родителями, студентами, изучающими языки, и получайте 30% с каждой подписки в течение первого года. Приведите 10 активных подписчиков, откроется 10% пожизненная комиссия на всех.",
    partnerLink: "gadit.app/?ref=ivan",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% первый год · 10% навсегда",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Посмотрите Gadit",
      watchTitle: "Как раскрывается каждое слово, уровень за уровнем.",
      watchLede: "Живая прогулка по реальному слову на вашем языке. Наведите курсор, чтобы остановить.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Партнёр",
      searchBtn: "Поиск",
      meaningsLabel: "Значения",
      meaningN: (n) => `Значение ${n}`,
      examplesLabel: "Примеры",
      idiomsLabel: "Идиомы и выражения",
      etymologyLabel: "Происхождение",
      etyFromLabel: "Из",
      etyMeantLabel: "Изначально значило",
      kidsToggle: "Детский режим",
      kidsLabel: "Объяснение для детей",
      composeLabel: "Напишите своё предложение",
      imageLabel: "Изображение",
      saved: "Сохранено в тетрадь ★",
      plusBasic: "Плюс всё из Basic",
      plusClear: "Плюс всё из Clear",
      quizLabel: "Викторина",
      gameLabel: "Игра в слова",
      compareLabel: "Сравнить два слова",
      dashTitle: "Панель партнёра",
      linkLabel: "Ваша личная ссылка",
      earningsLabel: "В этом месяце",
      subsLabel: "Активные подписчики",
      rateLabel: "Комиссия",
    },
  },
  es: {
    word: "sueño",
    searchPlaceholder: "Escribe una palabra",
    meanings: [
      {
        definition: "Imágenes, pensamientos y sensaciones que ocurren en la mente durante el sueño.",
        examples: [
          "Tuve un sueño extraño anoche.",
          "Se despertó de un sueño tranquilo.",
          "Los niños a menudo sueñan con volar.",
        ],
      },
      {
        definition: "Aspiración o ideal que se desea alcanzar.",
        examples: [
          "Su sueño era ser escritora.",
          "Trabajó duro para hacer realidad su sueño.",
          "Nunca renuncies a tus sueños.",
        ],
      },
    ],
    idioms: ["un sueño hecho realidad", "ni en sueños", "el sueño americano"],
    etymology: {
      from: "Latín",
      original: "somnium",
      meant: "visión durante el sueño, emparentado con somnus, dormir",
    },
    kidsExplanation:
      "Cuando duermes, tu cerebro proyecta pequeñas películas en tu cabeza, son los sueños. Un sueño también puede ser algo maravilloso que quieres que pase algún día.",
    composeSentence: "Su sueño de ser doctora por fin se cumplió.",
    composeStatus: "Perfecto ✓",
    imageDescription: "sueño",
    quizQuestion: "¿Qué palabra significa \"una aspiración que esperas alcanzar\"?",
    quizOptions: ["pensamiento", "sueño", "hecho", "recuerdo"],
    quizCorrect: 1,
    anagramLetters: "oñues",
    compareWords: "sueño vs. ambición",
    compareNote: "Ambos sobre desear algo, observa la diferencia exacta.",
    partnerHeroTitle: "Difunde Gadit. Gana con nosotros.",
    partnerHeroBody: "¿Te encanta Gadit? Comparte tu enlace personal con padres, estudiantes y aprendices de idiomas, y gana el 30% de cada suscripción durante el primer año. Alcanza 10 suscriptores activos y desbloqueas el 10% de comisión de por vida sobre todos ellos.",
    partnerLink: "gadit.app/?ref=maria",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% año 1 · 10% de por vida",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Mira Gadit",
      watchTitle: "Mira cómo se abre cada palabra, plan por plan.",
      watchLede: "Un recorrido en vivo de una palabra real, en tu idioma. Pasa el cursor para pausar.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Socio",
      searchBtn: "Buscar",
      meaningsLabel: "Significados",
      meaningN: (n) => `Significado ${n}`,
      examplesLabel: "Ejemplos",
      idiomsLabel: "Modismos y expresiones",
      etymologyLabel: "Origen de la palabra",
      etyFromLabel: "De",
      etyMeantLabel: "Significaba originalmente",
      kidsToggle: "Modo niños",
      kidsLabel: "Explicación para niños",
      composeLabel: "Escribe tu frase",
      imageLabel: "Imagen",
      saved: "Guardado en el cuaderno ★",
      plusBasic: "Más todo lo de Basic",
      plusClear: "Más todo lo de Clear",
      quizLabel: "Quiz",
      gameLabel: "Juego de palabras",
      compareLabel: "Compara dos palabras",
      dashTitle: "Panel de socio",
      linkLabel: "Tu enlace personal",
      earningsLabel: "Este mes",
      subsLabel: "Suscriptores activos",
      rateLabel: "Comisión",
    },
  },
  pt: {
    word: "sonho",
    searchPlaceholder: "Digite uma palavra",
    meanings: [
      {
        definition: "Imagens, pensamentos e sensações que ocorrem na mente durante o sono.",
        examples: [
          "Tive um sonho estranho ontem à noite.",
          "Ela acordou de um sonho tranquilo.",
          "Crianças muitas vezes sonham em voar.",
        ],
      },
      {
        definition: "Aspiração, ideal ou desejo profundo que se quer realizar.",
        examples: [
          "Era seu sonho tornar-se escritora.",
          "Ele trabalhou duro para realizar seu sonho.",
          "Nunca desista dos seus sonhos.",
        ],
      },
    ],
    idioms: ["um sonho realizado", "nem em sonhos", "o sonho americano"],
    etymology: {
      from: "Latim",
      original: "somnium",
      meant: "visão durante o sono, da mesma raiz que somnus, dormir",
    },
    kidsExplanation:
      "Quando você dorme, seu cérebro mostra pequenos filmes na sua cabeça, esses são os sonhos. Um sonho também pode ser algo muito legal que você quer que aconteça um dia.",
    composeSentence: "Seu sonho de ser médica finalmente se realizou.",
    composeStatus: "Perfeito ✓",
    imageDescription: "sonho",
    quizQuestion: "Qual palavra significa \"uma aspiração que você espera alcançar\"?",
    quizOptions: ["pensamento", "sonho", "fato", "memória"],
    quizCorrect: 1,
    anagramLetters: "ohnos",
    compareWords: "sonho vs. ambição",
    compareNote: "Ambos sobre querer algo, veja a diferença exata.",
    partnerHeroTitle: "Divulgue o Gadit. Ganhe com a gente.",
    partnerHeroBody: "Ama o Gadit? Compartilhe seu link pessoal com pais, estudantes e aprendizes de idiomas, e ganhe 30% de cada assinatura no primeiro ano. Chegue a 10 assinantes ativos e desbloqueie 10% de comissão vitalícia em todos eles.",
    partnerLink: "gadit.app/?ref=joao",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% ano 1 · 10% vitalício",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Veja o Gadit",
      watchTitle: "Veja como cada palavra se abre, plano a plano.",
      watchLede: "Um passeio ao vivo por uma palavra real, no seu idioma. Passe o mouse para pausar.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Parceiro",
      searchBtn: "Buscar",
      meaningsLabel: "Significados",
      meaningN: (n) => `Significado ${n}`,
      examplesLabel: "Exemplos",
      idiomsLabel: "Expressões e ditados",
      etymologyLabel: "Origem da palavra",
      etyFromLabel: "Do",
      etyMeantLabel: "Significava originalmente",
      kidsToggle: "Modo crianças",
      kidsLabel: "Explicação para crianças",
      composeLabel: "Escreva sua frase",
      imageLabel: "Imagem",
      saved: "Salvo no caderno ★",
      plusBasic: "Mais tudo do Basic",
      plusClear: "Mais tudo do Clear",
      quizLabel: "Quiz",
      gameLabel: "Jogo de palavras",
      compareLabel: "Compare duas palavras",
      dashTitle: "Painel do parceiro",
      linkLabel: "Seu link pessoal",
      earningsLabel: "Este mês",
      subsLabel: "Assinantes ativos",
      rateLabel: "Comissão",
    },
  },
  fr: {
    word: "rêve",
    searchPlaceholder: "Tapez un mot",
    meanings: [
      {
        definition: "Images, pensées et sensations qui se produisent dans l'esprit pendant le sommeil.",
        examples: [
          "J'ai fait un rêve étrange hier soir.",
          "Elle s'est réveillée d'un rêve paisible.",
          "Les enfants rêvent souvent de voler.",
        ],
      },
      {
        definition: "Aspiration profonde, idéal que l'on souhaite réaliser.",
        examples: [
          "Son rêve était de devenir écrivaine.",
          "Il a travaillé dur pour réaliser son rêve.",
          "N'abandonne jamais tes rêves.",
        ],
      },
    ],
    idioms: ["un rêve devenu réalité", "rêve éveillé", "le rêve américain"],
    etymology: {
      from: "Ancien français",
      original: "resver",
      meant: "divaguer, errer, le sens onirique apparaît au XVIIe siècle",
    },
    kidsExplanation:
      "Quand tu dors la nuit, ton cerveau passe de petits films dans ta tête, ce sont les rêves. Un rêve, c'est aussi quelque chose de merveilleux que tu veux voir arriver un jour.",
    composeSentence: "Son rêve de devenir médecin s'est enfin réalisé.",
    composeStatus: "Parfait ✓",
    imageDescription: "rêve",
    quizQuestion: "Quel mot signifie \"une aspiration que l'on espère réaliser\" ?",
    quizOptions: ["pensée", "rêve", "fait", "mémoire"],
    quizCorrect: 1,
    anagramLetters: "êver",
    compareWords: "rêve vs. ambition",
    compareNote: "Les deux concernent un désir, observez la différence précise.",
    partnerHeroTitle: "Faites connaître Gadit. Gagnez avec nous.",
    partnerHeroBody: "Vous adorez Gadit ? Partagez votre lien personnel avec parents, étudiants, apprenants de langues, et gagnez 30 % sur chaque abonnement la première année. Atteignez 10 abonnés actifs et débloquez 10 % de commission à vie sur tous.",
    partnerLink: "gadit.app/?ref=marie",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% année 1 · 10% à vie",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Regardez Gadit",
      watchTitle: "Comment chaque mot s'ouvre, palier par palier.",
      watchLede: "Une visite en direct d'un vrai mot, dans votre langue. Survolez pour mettre en pause.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partenaire",
      searchBtn: "Rechercher",
      meaningsLabel: "Significations",
      meaningN: (n) => `Sens ${n}`,
      examplesLabel: "Exemples",
      idiomsLabel: "Expressions et locutions",
      etymologyLabel: "Origine du mot",
      etyFromLabel: "Du",
      etyMeantLabel: "Signifiait à l'origine",
      kidsToggle: "Mode enfants",
      kidsLabel: "Explication pour enfants",
      composeLabel: "Écrivez votre phrase",
      imageLabel: "Image",
      saved: "Enregistré dans le carnet ★",
      plusBasic: "Plus tout de Basic",
      plusClear: "Plus tout de Clear",
      quizLabel: "Quiz",
      gameLabel: "Jeu de mots",
      compareLabel: "Comparez deux mots",
      dashTitle: "Tableau du partenaire",
      linkLabel: "Votre lien personnel",
      earningsLabel: "Ce mois-ci",
      subsLabel: "Abonnés actifs",
      rateLabel: "Commission",
    },
  },
  de: {
    word: "Traum",
    searchPlaceholder: "Wort eingeben",
    meanings: [
      {
        definition: "Bilder, Gedanken und Empfindungen, die während des Schlafs im Geist erscheinen.",
        examples: [
          "Ich hatte gestern Nacht einen seltsamen Traum.",
          "Sie wachte aus einem friedlichen Traum auf.",
          "Kinder träumen oft vom Fliegen.",
        ],
      },
      {
        definition: "Ein sehnlicher Wunsch, ein Ideal, ein Lebensziel.",
        examples: [
          "Es war ihr Traum, Schriftstellerin zu werden.",
          "Er arbeitete hart, um seinen Traum zu verwirklichen.",
          "Gib deine Träume niemals auf.",
        ],
      },
    ],
    idioms: ["ein Traum wird wahr", "nicht im Traum", "der amerikanische Traum"],
    etymology: {
      from: "Althochdeutsch",
      original: "troum",
      meant: "Trugbild, Vision im Schlaf, verwandt mit altenglisch dréam (Freude, Musik)",
    },
    kidsExplanation:
      "Wenn du nachts schläfst, spielt dein Gehirn kleine Filme in deinem Kopf ab, das sind Träume. Ein Traum kann auch etwas Wunderbares sein, das du dir für dein Leben wünschst.",
    composeSentence: "Ihr Traum, Ärztin zu werden, ging endlich in Erfüllung.",
    composeStatus: "Perfekt ✓",
    imageDescription: "Traum",
    quizQuestion: "Welches Wort bedeutet \"ein Ziel, das man erreichen möchte\"?",
    quizOptions: ["Gedanke", "Traum", "Tatsache", "Erinnerung"],
    quizCorrect: 1,
    anagramLetters: "marTu",
    compareWords: "Traum vs. Ziel",
    compareNote: "Beide drehen sich um Wünsche, sieh den genauen Unterschied.",
    partnerHeroTitle: "Verbreite Gadit. Verdiene mit uns.",
    partnerHeroBody: "Du liebst Gadit? Teile deinen persönlichen Link mit Eltern, Schülerinnen, Sprachlernenden, und verdiene im ersten Jahr 30 % auf jedes Abonnement. Erreichst du 10 aktive Abonnenten, schaltest du 10 % Lebenslang-Provision auf alle frei.",
    partnerLink: "gadit.app/?ref=lena",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% Jahr 1 · 10% lebenslang",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Schau Gadit",
      watchTitle: "Wie sich jedes Wort öffnet, Stufe für Stufe.",
      watchLede: "Eine Live-Tour durch ein echtes Wort, in deiner Sprache. Hover zum Pausieren.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Suchen",
      meaningsLabel: "Bedeutungen",
      meaningN: (n) => `Bedeutung ${n}`,
      examplesLabel: "Beispiele",
      idiomsLabel: "Redewendungen",
      etymologyLabel: "Wortherkunft",
      etyFromLabel: "Aus",
      etyMeantLabel: "Bedeutete ursprünglich",
      kidsToggle: "Kindermodus",
      kidsLabel: "Erklärung für Kinder",
      composeLabel: "Schreibe deinen Satz",
      imageLabel: "Bild",
      saved: "Im Notizbuch gespeichert ★",
      plusBasic: "Plus alles aus Basic",
      plusClear: "Plus alles aus Clear",
      quizLabel: "Quiz",
      gameLabel: "Wortspiel",
      compareLabel: "Zwei Wörter vergleichen",
      dashTitle: "Partner-Dashboard",
      linkLabel: "Dein persönlicher Link",
      earningsLabel: "Diesen Monat",
      subsLabel: "Aktive Abonnenten",
      rateLabel: "Provision",
    },
  },
  cs: {
    word: "sen",
    searchPlaceholder: "Napiš slovo",
    meanings: [
      {
        definition: "Obrazy, myšlenky a pocity, které vznikají v mysli během spánku.",
        examples: [
          "Měl jsem včera v noci podivný sen.",
          "Probudila se z klidného snu.",
          "Děti často sní o létání.",
        ],
      },
      {
        definition: "Vroucí touha, ideál nebo cíl, který si přejeme dosáhnout.",
        examples: [
          "Jejím snem bylo stát se spisovatelkou.",
          "Tvrdě pracoval, aby si splnil svůj sen.",
          "Nikdy se nevzdávej svých snů.",
        ],
      },
    ],
    idioms: ["sen, který se splnil", "ani ve snu", "americký sen"],
    etymology: {
      from: "Praslovanština",
      original: "sъnъ",
      meant: "spánek a obrazy ve spánku, společné s ruským сон a polským sen",
    },
    kidsExplanation:
      "Když v noci spíš, tvůj mozek ti v hlavě pouští krátké filmy, tomu se říká sen. Sen je taky něco moc krásného, co bys chtěl, aby se ti jednou splnilo.",
    composeSentence: "Její sen stát se lékařkou se konečně splnil.",
    composeStatus: "Skvělé ✓",
    imageDescription: "sen",
    quizQuestion: "Které slovo znamená \"přání, kterého chceš dosáhnout\"?",
    quizOptions: ["myšlenka", "sen", "fakt", "vzpomínka"],
    quizCorrect: 1,
    anagramLetters: "nse",
    compareWords: "sen vs. cíl",
    compareNote: "Obojí o touze, podívej se na přesný rozdíl.",
    partnerHeroTitle: "Šiř Gadit. Vydělávej s námi.",
    partnerHeroBody: "Miluješ Gadit? Sdílej svůj osobní odkaz s rodiči, studenty a těmi, kdo se učí jazyk, a vydělej 30 % z každého předplatného v prvním roce. Dosáhneš 10 aktivních předplatitelů a odemkneš 10 % doživotní provize na všechny.",
    partnerLink: "gadit.app/?ref=andrea",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% první rok · 10% navždy",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Podívej se na Gadit",
      watchTitle: "Jak se otevírá každé slovo, úroveň po úrovni.",
      watchLede: "Živá ukázka skutečného slova ve tvém jazyce. Najeď myší pro pauzu.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Hledat",
      meaningsLabel: "Významy",
      meaningN: (n) => `Význam ${n}`,
      examplesLabel: "Příklady",
      idiomsLabel: "Idiomy a výrazy",
      etymologyLabel: "Původ slova",
      etyFromLabel: "Z",
      etyMeantLabel: "Původně znamenalo",
      kidsToggle: "Dětský režim",
      kidsLabel: "Vysvětlení pro děti",
      composeLabel: "Napiš svou větu",
      imageLabel: "Obrázek",
      saved: "Uloženo do sešitu ★",
      plusBasic: "Plus vše z Basic",
      plusClear: "Plus vše z Clear",
      quizLabel: "Kvíz",
      gameLabel: "Slovní hra",
      compareLabel: "Porovnat dvě slova",
      dashTitle: "Přehled partnera",
      linkLabel: "Tvůj osobní odkaz",
      earningsLabel: "Tento měsíc",
      subsLabel: "Aktivní předplatitelé",
      rateLabel: "Provize",
    },
  },
  sk: {
    word: "sen",
    searchPlaceholder: "Napíš slovo",
    meanings: [
      {
        definition: "Obrazy, myšlienky a pocity, ktoré vznikajú v mysli počas spánku.",
        examples: [
          "Mal som včera v noci čudný sen.",
          "Zobudila sa z pokojného sna.",
          "Deti často snívajú o lietaní.",
        ],
      },
      {
        definition: "Hlboká túžba, ideál alebo cieľ, ktorý si želáme dosiahnuť.",
        examples: [
          "Jej snom bolo stať sa spisovateľkou.",
          "Tvrdo pracoval, aby si splnil svoj sen.",
          "Nikdy sa nevzdávaj svojich snov.",
        ],
      },
    ],
    idioms: ["sen, ktorý sa splnil", "ani vo sne", "americký sen"],
    etymology: {
      from: "Praslovančina",
      original: "sъnъ",
      meant: "spánok a obrazy v spánku, spoločné s ruským сон a poľským sen",
    },
    kidsExplanation:
      "Keď v noci spíš, tvoj mozog ti v hlave púšťa krátke filmy, to sa nazýva sen. Sen je tiež niečo veľmi pekné, čo by si chcel, aby sa ti raz splnilo.",
    composeSentence: "Jej sen stať sa lekárkou sa konečne splnil.",
    composeStatus: "Skvelé ✓",
    imageDescription: "sen",
    quizQuestion: "Ktoré slovo znamená \"prianie, ktoré chceš dosiahnuť\"?",
    quizOptions: ["myšlienka", "sen", "fakt", "spomienka"],
    quizCorrect: 1,
    anagramLetters: "nse",
    compareWords: "sen vs. cieľ",
    compareNote: "Oboje o túžbe, pozri sa na presný rozdiel.",
    partnerHeroTitle: "Šír Gadit. Zarábaj s nami.",
    partnerHeroBody: "Miluješ Gadit? Zdieľaj svoj osobný odkaz s rodičmi, študentmi a tými, ktorí sa učia jazyk, a zaroby 30 % z každého predplatného v prvom roku. Dosiahneš 10 aktívnych predplatiteľov a odomkneš 10 % doživotnú províziu na všetkých.",
    partnerLink: "gadit.app/?ref=zuzana",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% prvý rok · 10% navždy",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Pozri si Gadit",
      watchTitle: "Ako sa otvára každé slovo, úroveň za úrovňou.",
      watchLede: "Živá ukážka skutočného slova v tvojom jazyku. Nájazd myšou pre pauzu.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Hľadať",
      meaningsLabel: "Významy",
      meaningN: (n) => `Význam ${n}`,
      examplesLabel: "Príklady",
      idiomsLabel: "Idiómy a výrazy",
      etymologyLabel: "Pôvod slova",
      etyFromLabel: "Z",
      etyMeantLabel: "Pôvodne znamenalo",
      kidsToggle: "Detský režim",
      kidsLabel: "Vysvetlenie pre deti",
      composeLabel: "Napíš svoju vetu",
      imageLabel: "Obrázok",
      saved: "Uložené do zošita ★",
      plusBasic: "Plus všetko z Basic",
      plusClear: "Plus všetko z Clear",
      quizLabel: "Kvíz",
      gameLabel: "Slovná hra",
      compareLabel: "Porovnať dve slová",
      dashTitle: "Prehľad partnera",
      linkLabel: "Tvoj osobný odkaz",
      earningsLabel: "Tento mesiac",
      subsLabel: "Aktívni predplatitelia",
      rateLabel: "Provízia",
    },
  },
  it: {
    word: "sogno",
    searchPlaceholder: "Scrivi una parola",
    meanings: [
      {
        definition: "Immagini, pensieri e sensazioni che si manifestano nella mente durante il sonno.",
        examples: [
          "Ho fatto uno strano sogno la notte scorsa.",
          "Si è svegliata da un sogno tranquillo.",
          "I bambini sognano spesso di volare.",
        ],
      },
      {
        definition: "Aspirazione profonda, ideale o desiderio che si vuole realizzare.",
        examples: [
          "Il suo sogno era diventare scrittrice.",
          "Ha lavorato sodo per realizzare il suo sogno.",
          "Non rinunciare mai ai tuoi sogni.",
        ],
      },
    ],
    idioms: ["un sogno che si avvera", "nemmeno per sogno", "il sogno americano"],
    etymology: {
      from: "Latino",
      original: "somnium",
      meant: "visione nel sonno, dalla stessa radice di somnus, dormire",
    },
    kidsExplanation:
      "Quando dormi la notte, il tuo cervello ti fa vedere piccoli film nella testa, quelli sono i sogni. Un sogno può anche essere qualcosa di bellissimo che vuoi che accada un giorno.",
    composeSentence: "Il suo sogno di diventare medico si è finalmente avverato.",
    composeStatus: "Perfetto ✓",
    imageDescription: "sogno",
    quizQuestion: "Quale parola significa \"un'aspirazione che speri di realizzare\"?",
    quizOptions: ["pensiero", "sogno", "fatto", "ricordo"],
    quizCorrect: 1,
    anagramLetters: "ognso",
    compareWords: "sogno vs. ambizione",
    compareNote: "Entrambi parlano di desiderio, guarda la differenza precisa.",
    partnerHeroTitle: "Diffondi Gadit. Guadagna con noi.",
    partnerHeroBody: "Adori Gadit? Condividi il tuo link personale con genitori, studenti, chi impara una lingua, e guadagna il 30 % su ogni abbonamento nel primo anno. Raggiungi 10 abbonati attivi e sblocchi il 10 % di commissione a vita su tutti loro.",
    partnerLink: "gadit.app/?ref=luca",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% anno 1 · 10% a vita",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Guarda Gadit",
      watchTitle: "Come si apre ogni parola, piano per piano.",
      watchLede: "Un tour dal vivo di una vera parola, nella tua lingua. Passa il mouse per mettere in pausa.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Cerca",
      meaningsLabel: "Significati",
      meaningN: (n) => `Significato ${n}`,
      examplesLabel: "Esempi",
      idiomsLabel: "Modi di dire ed espressioni",
      etymologyLabel: "Origine della parola",
      etyFromLabel: "Da",
      etyMeantLabel: "Significava originariamente",
      kidsToggle: "Modalità bambini",
      kidsLabel: "Spiegazione per bambini",
      composeLabel: "Scrivi la tua frase",
      imageLabel: "Immagine",
      saved: "Salvato nel quaderno ★",
      plusBasic: "Più tutto di Basic",
      plusClear: "Più tutto di Clear",
      quizLabel: "Quiz",
      gameLabel: "Gioco di parole",
      compareLabel: "Confronta due parole",
      dashTitle: "Dashboard partner",
      linkLabel: "Il tuo link personale",
      earningsLabel: "Questo mese",
      subsLabel: "Abbonati attivi",
      rateLabel: "Commissione",
    },
  },
  ja: {
    word: "夢",
    searchPlaceholder: "単語を入力",
    meanings: [
      {
        definition: "睡眠中に心に浮かぶ映像、考え、感覚。",
        examples: [
          "昨夜、不思議な夢を見た。",
          "彼女は穏やかな夢から目を覚ました。",
          "子どもはよく空を飛ぶ夢を見る。",
        ],
      },
      {
        definition: "心から望む将来の目標や理想。",
        examples: [
          "彼女の夢は作家になることだった。",
          "夢を実現するために懸命に働いた。",
          "決して夢をあきらめないで。",
        ],
      },
    ],
    idioms: ["夢が叶う", "夢にも思わない", "アメリカン・ドリーム"],
    etymology: {
      from: "古代日本語",
      original: "いめ",
      meant: "寝目（いめ）,  「寝ているときに見るもの」が語源。後に「願い」の意味も加わった",
    },
    kidsExplanation:
      "夜にねむると、頭の中で小さな映画みたいなものが流れるんだ。それが「夢」。夢は、いつかかなえたい大きな願いのことでもあるよ。",
    composeSentence: "彼女の医師になるという夢がついに叶った。",
    composeStatus: "完璧 ✓",
    imageDescription: "夢",
    quizQuestion: "「叶えたい願い」を意味する語はどれ?",
    quizOptions: ["考え", "夢", "事実", "記憶"],
    quizCorrect: 1,
    anagramLetters: "夢",
    compareWords: "夢 と 目標",
    compareNote: "どちらも望みについて, 正確な違いを見てみよう。",
    partnerHeroTitle: "Gadit を広めよう。一緒に稼ごう。",
    partnerHeroBody: "Gadit がお気に入りなら、あなたの個人リンクを保護者・生徒・語学学習者にシェアしてみませんか。初年度はサブスクごとに 30% の報酬。アクティブな購読者が10人になると、全員に対して 10% の生涯コミッションがアンロックされます。",
    partnerLink: "gadit.app/?ref=yuki",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "初年度30% · 永続10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gadit を見る",
      watchTitle: "ひとつの単語がどう開かれるか, プランごとに。",
      watchLede: "あなたの言語で、実際の単語のライブツアー。ホバーで一時停止。",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "パートナー",
      searchBtn: "検索",
      meaningsLabel: "意味",
      meaningN: (n) => `意味 ${n}`,
      examplesLabel: "例文",
      idiomsLabel: "イディオム・表現",
      etymologyLabel: "語源",
      etyFromLabel: "出典",
      etyMeantLabel: "元の意味",
      kidsToggle: "子どもモード",
      kidsLabel: "子ども向け説明",
      composeLabel: "あなたの文を書く",
      imageLabel: "ビジュアル",
      saved: "ノートに保存 ★",
      plusBasic: "Basic のすべて＋",
      plusClear: "Clear のすべて＋",
      quizLabel: "クイズ",
      gameLabel: "単語ゲーム",
      compareLabel: "2つの単語を比較",
      dashTitle: "パートナーダッシュボード",
      linkLabel: "あなたの個人リンク",
      earningsLabel: "今月",
      subsLabel: "アクティブ会員",
      rateLabel: "コミッション",
    },
  },
  hi: {
    word: "सपना",
    searchPlaceholder: "कोई शब्द लिखें",
    meanings: [
      {
        definition: "नींद के दौरान मन में आने वाली तस्वीरें, विचार और संवेदनाएँ।",
        examples: [
          "मुझे कल रात एक अजीब सपना आया।",
          "वह एक शांत सपने से जागी।",
          "बच्चे अक्सर उड़ने के सपने देखते हैं।",
        ],
      },
      {
        definition: "एक भविष्य का लक्ष्य या आदर्श जिसकी आप दिल से चाहत रखते हैं।",
        examples: [
          "उसका सपना लेखक बनने का था।",
          "उसने अपने सपने को सच करने के लिए कड़ी मेहनत की।",
          "अपने सपनों को कभी मत छोड़ो।",
        ],
      },
    ],
    idioms: ["सपना सच होना", "सपने में भी न सोचना", "अमेरिकन ड्रीम"],
    etymology: {
      from: "संस्कृत",
      original: "स्वप्न",
      meant: "स्वप्न (svapna), जिसका अर्थ है 'नींद में दिखने वाला दृश्य'। बाद में 'इच्छा' और 'महत्वाकांक्षा' का अर्थ भी जुड़ा।",
    },
    kidsExplanation:
      "जब आप सोते हैं, तो आपका दिमाग आपके सिर में छोटी फ़िल्में चलाता है, उन्हीं को सपने कहते हैं। सपना वह चीज़ भी है जिसे आप वाक़ई किसी दिन सच करना चाहते हैं।",
    composeSentence: "उसका डॉक्टर बनने का सपना आख़िरकार सच हो गया।",
    composeStatus: "एकदम सही ✓",
    imageDescription: "सपना",
    quizQuestion: "कौन सा शब्द 'एक चाहत जो आप पूरी करना चाहते हैं' का अर्थ देता है?",
    quizOptions: ["विचार", "सपना", "तथ्य", "स्मृति"],
    quizCorrect: 1,
    anagramLetters: "सपना",
    compareWords: "सपना बनाम लक्ष्य",
    compareNote: "दोनों चाहत के बारे में हैं, सटीक अंतर देखें।",
    partnerHeroTitle: "Gadit का प्रसार करें। साथ कमाएँ।",
    partnerHeroBody: "अगर आपको Gadit पसंद है, तो अपना निजी लिंक माता-पिता, छात्रों और भाषा सीखने वालों के साथ साझा करें। पहले साल हर सब्सक्रिप्शन पर 30% कमाएँ। जब आपके 10 सक्रिय सब्सक्राइबर हों, तब सब पर आजीवन 10% कमीशन अनलॉक हो जाता है।",
    partnerLink: "gadit.app/?ref=arjun",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "पहला साल 30% · आजीवन 10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gadit देखें",
      watchTitle: "एक शब्द कैसे खुलता है, हर टियर के साथ।",
      watchLede: "आपकी भाषा में, असली शब्द का लाइव टूर। रोकने के लिए होवर करें।",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "पार्टनर",
      searchBtn: "खोज",
      meaningsLabel: "अर्थ",
      meaningN: (n) => `अर्थ ${n}`,
      examplesLabel: "उदाहरण",
      idiomsLabel: "मुहावरे और अभिव्यक्तियाँ",
      etymologyLabel: "उत्पत्ति",
      etyFromLabel: "स्रोत",
      etyMeantLabel: "मूल अर्थ",
      kidsToggle: "बच्चों का मोड",
      kidsLabel: "बच्चों के लिए समझ",
      composeLabel: "अपना वाक्य लिखें",
      imageLabel: "तस्वीर",
      saved: "नोटबुक में सहेजा ★",
      plusBasic: "Basic के सब कुछ +",
      plusClear: "Clear के सब कुछ +",
      quizLabel: "क्विज़",
      gameLabel: "शब्द खेल",
      compareLabel: "दो शब्दों की तुलना",
      dashTitle: "पार्टनर डैशबोर्ड",
      linkLabel: "आपका निजी लिंक",
      earningsLabel: "इस महीने",
      subsLabel: "सक्रिय सब्सक्राइबर",
      rateLabel: "कमीशन",
    },
  },
  am: {
    word: "ሕልም",
    searchPlaceholder: "ማንኛውንም ቃል ይጻፉ",
    meanings: [
      {
        definition: "በእንቅልፍ ወቅት በአእምሮ ውስጥ የሚመጡ ምስሎች፣ ሀሳቦች እና ስሜቶች።",
        examples: [
          "ትናንት ማታ እንግዳ ሕልም አየሁ።",
          "ከረጋ ሕልም ነቃች።",
          "ልጆች ብዙ ጊዜ ስለ መብረር ያልማሉ።",
        ],
      },
      {
        definition: "ከልብ የሚመኙት የወደፊት ግብ ወይም ራዕይ።",
        examples: [
          "ሕልሟ ጸሐፊ መሆን ነበር።",
          "ሕልሙን እውን ለማድረግ ጠንክሮ ሠራ።",
          "ሕልሞችዎን በፍጹም አይተዉ።",
        ],
      },
    ],
    idioms: ["ሕልም እውን ሆነ", "በሕልሜም አላስበውም", "የአሜሪካ ሕልም"],
    etymology: {
      from: "ግዕዝ",
      original: "ሐለመ",
      meant: "ሐለመ (ḥalama)፣ ትርጉሙም 'በእንቅልፍ ውስጥ ማየት'። በኋላ 'ምኞት' እና 'ራዕይ' የሚል ትርጉምም ተጨመረበት።",
    },
    kidsExplanation:
      "በሚተኙበት ጊዜ አእምሮዎ በጭንቅላትዎ ውስጥ ትንንሽ ፊልሞችን ያሳያል፣ እነዚህ ሕልሞች ይባላሉ። ሕልም ማለት አንድ ቀን በእውነት እንዲሆን የሚፈልጉት ነገርም ነው።",
    composeSentence: "ሐኪም የመሆን ሕልሟ በመጨረሻ እውን ሆነ።",
    composeStatus: "ፍጹም ✓",
    imageDescription: "ሕልም",
    quizQuestion: "'እውን ማድረግ የሚፈልጉት ምኞት' የሚል ትርጉም የሚሰጠው የትኛው ቃል ነው?",
    quizOptions: ["ሀሳብ", "ሕልም", "እውነታ", "ትውስታ"],
    quizCorrect: 1,
    anagramLetters: "ሕልም",
    compareWords: "ሕልም እና ግብ",
    compareNote: "ሁለቱም ስለ ምኞት ናቸው፣ ትክክለኛውን ልዩነት ይመልከቱ።",
    partnerHeroTitle: "Gaditን ያስፋፉ። ከእኛ ጋር ገቢ ያግኙ።",
    partnerHeroBody: "Gadit ከወደዱት፣ የግል አገናኝዎን ለወላጆች፣ ለተማሪዎች እና ቋንቋ ለሚማሩ ሰዎች ያጋሩ። በመጀመሪያው ዓመት ከእያንዳንዱ ምዝገባ 30% ያግኙ። 10 ንቁ ተመዝጋቢዎች ሲኖሩዎት፣ በሁሉም ላይ የዕድሜ ልክ 10% ኮሚሽን ይከፈታል።",
    partnerLink: "gadit.app/?ref=abebe",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "የመጀመሪያ ዓመት 30% · የዕድሜ ልክ 10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gaditን ይመልከቱ",
      watchTitle: "አንድ ቃል እንዴት እንደሚከፈት፣ በእያንዳንዱ ደረጃ።",
      watchLede: "በእርስዎ ቋንቋ፣ የእውነተኛ ቃል የቀጥታ ጉብኝት። ለማቆም ጠቋሚውን በላዩ ላይ ያሳርፉ።",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "አጋር",
      searchBtn: "ፈልግ",
      meaningsLabel: "ትርጉሞች",
      meaningN: (n) => `ትርጉም ${n}`,
      examplesLabel: "ምሳሌዎች",
      idiomsLabel: "ፈሊጣዊ አገላለጾች",
      etymologyLabel: "ሥርወ ቃል",
      etyFromLabel: "ምንጭ",
      etyMeantLabel: "የመጀመሪያ ትርጉም",
      kidsToggle: "የልጆች ሁነታ",
      kidsLabel: "ለልጆች ማብራሪያ",
      composeLabel: "የራስዎን ዓረፍተ ነገር ይጻፉ",
      imageLabel: "ምስል",
      saved: "በማስታወሻ ደብተር ተቀምጧል ★",
      plusBasic: "የ Basic ሁሉም ነገር +",
      plusClear: "የ Clear ሁሉም ነገር +",
      quizLabel: "ኩዊዝ",
      gameLabel: "የቃላት ጨዋታ",
      compareLabel: "ሁለት ቃላትን ማወዳደር",
      dashTitle: "የአጋር ዳሽቦርድ",
      linkLabel: "የእርስዎ የግል አገናኝ",
      earningsLabel: "በዚህ ወር",
      subsLabel: "ንቁ ተመዝጋቢዎች",
      rateLabel: "ኮሚሽን",
    },
  },
  uk: {
    word: "мрія",
    searchPlaceholder: "Введіть слово",
    meanings: [
      {
        definition: "Заповітне бажання, мета чи ідеал, до якого людина прагне.",
        examples: [
          "Стати письменницею було її мрією.",
          "Він наполегливо працював, щоб здійснити свою мрію.",
          "Ніколи не відмовляйся від своєї мрії.",
        ],
      },
      {
        definition: "Уявний образ чогось бажаного, часто далекого від реальності.",
        examples: [
          "Це була мрія про тихе життя біля моря.",
          "Будинок її мрії, маленька хатинка в горах.",
          "Він плекав мрію про подорож до Японії.",
        ],
      },
    ],
    idioms: ["мрія всього життя", "мрії здійснюються", "американська мрія"],
    etymology: {
      from: "Українська",
      original: "мріти",
      meant: "ледь виднітися, мерехтіти вдалині; споріднене зі словом мряка",
    },
    kidsExplanation:
      "Мрія означає щось дуже гарне, чого тобі дуже хочеться. Наприклад, стати космонавтом або мати собаку.",
    composeSentence: "Її мрія стати лікаркою нарешті здійснилася.",
    composeStatus: "Чудово ✓",
    imageDescription: "мрія",
    quizQuestion: "Яке слово означає \"заповітне бажання, до якого прагнеш\"?",
    quizOptions: ["думка", "мрія", "факт", "пам'ять"],
    quizCorrect: 1,
    anagramLetters: "ріям",
    compareWords: "мрія vs. мета",
    compareNote: "Обидва слова про бажання, подивись точну різницю.",
    partnerHeroTitle: "Розкажи про Gadit. Заробляй разом з нами.",
    partnerHeroBody: "Подобається Gadit? Поділися своїм особистим посиланням з батьками, учнями та тими, хто вивчає мови, і отримуй 30% з кожної підписки протягом першого року. Набери 10 активних підписників і відкрий довічну комісію 10% з усіх.",
    partnerLink: "gadit.app/?ref=oksana",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% перший рік · 10% довічно",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Подивись Gadit",
      watchTitle: "Як розкривається кожне слово, рівень за рівнем.",
      watchLede: "Жива екскурсія реальним словом твоєю мовою. Наведи курсор, щоб зупинити.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Партнер",
      searchBtn: "Пошук",
      meaningsLabel: "Значення",
      meaningN: (n) => `Значення ${n}`,
      examplesLabel: "Приклади",
      idiomsLabel: "Ідіоми та вирази",
      etymologyLabel: "Походження слова",
      etyFromLabel: "Від",
      etyMeantLabel: "Спочатку означало",
      kidsToggle: "Дитячий режим",
      kidsLabel: "Пояснення для дітей",
      composeLabel: "Напиши своє речення",
      imageLabel: "Зображення",
      saved: "Збережено в зошит ★",
      plusBasic: "Плюс усе з Basic",
      plusClear: "Плюс усе з Clear",
      quizLabel: "Вікторина",
      gameLabel: "Гра в слова",
      compareLabel: "Порівняй два слова",
      dashTitle: "Панель партнера",
      linkLabel: "Твоє особисте посилання",
      earningsLabel: "Цього місяця",
      subsLabel: "Активні підписники",
      rateLabel: "Комісія",
    },
  },
  tr: {
    word: "rüya",
    searchPlaceholder: "Bir kelime yaz",
    meanings: [
      {
        definition: "Uyku sırasında zihinde beliren görüntüler, düşünceler ve duygular.",
        examples: [
          "Dün gece çok garip bir rüya gördüm.",
          "Huzurlu bir rüyadan uyandı.",
          "Çocuklar sık sık uçtuklarını rüyalarında görür.",
        ],
      },
      {
        definition: "Gerçekleşmesi çok istenen bir hedef, hayal veya ideal.",
        examples: [
          "Yazar olmak onun en büyük rüyasıydı.",
          "Rüyasını gerçeğe dönüştürmek için çok çalıştı.",
          "Rüyalarından asla vazgeçme.",
        ],
      },
    ],
    idioms: ["rüya gibi", "rüyasında görse inanmaz", "Amerikan rüyası"],
    etymology: {
      from: "Arapça",
      original: "رؤيا (ruʾyā)",
      meant: "uykuda görülen şey, görü; \"görmek\" anlamındaki ra'ā kökünden",
    },
    kidsExplanation:
      "Uyuduğunda beynin kafanın içinde küçük filmler oynatır, işte bunlar rüyalardır. Rüya, bir gün gerçekten olmasını istediğin harika bir şey de olabilir.",
    composeSentence: "Doktor olma rüyası sonunda gerçek oldu.",
    composeStatus: "Mükemmel ✓",
    imageDescription: "rüya",
    quizQuestion: "Hangi kelime \"uyurken zihinde görülen görüntüler\" anlamına gelir?",
    quizOptions: ["düşünce", "rüya", "gerçek", "anı"],
    quizCorrect: 1,
    anagramLetters: "yüra",
    compareWords: "rüya vs. hayal",
    compareNote: "İkisi de zihindeki görüntülerle ilgili, aradaki tam farkı gör.",
    partnerHeroTitle: "Gadit'i yay. Bizimle kazan.",
    partnerHeroBody: "Gadit'i seviyor musun? Kişisel bağlantını ebeveynler, öğrenciler ve dil öğrenenlerle paylaş, ilk yıl boyunca her abonelikten %30 kazan. 10 aktif aboneye ulaştığında hepsinden ömür boyu %10 komisyonun kilidini açarsın.",
    partnerLink: "gadit.app/?ref=elif",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "1. yıl %30 · ömür boyu %10",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gadit'i izle",
      watchTitle: "Her kelimenin seviye seviye nasıl açıldığını gör.",
      watchLede: "Gerçek bir kelimenin kendi dilinde canlı tanıtımı. Durdurmak için imleci üzerine getir.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Ortak",
      searchBtn: "Ara",
      meaningsLabel: "Anlamlar",
      meaningN: (n) => `Anlam ${n}`,
      examplesLabel: "Örnekler",
      idiomsLabel: "Deyimler ve ifadeler",
      etymologyLabel: "Kelimenin kökeni",
      etyFromLabel: "Kaynak",
      etyMeantLabel: "İlk anlamı",
      kidsToggle: "Çocuk modu",
      kidsLabel: "Çocuklar için açıklama",
      composeLabel: "Cümleni yaz",
      imageLabel: "Görsel",
      saved: "Deftere kaydedildi ★",
      plusBasic: "Artı Basic'teki her şey",
      plusClear: "Artı Clear'daki her şey",
      quizLabel: "Test",
      gameLabel: "Kelime oyunu",
      compareLabel: "İki kelimeyi karşılaştır",
      dashTitle: "Ortak paneli",
      linkLabel: "Kişisel bağlantın",
      earningsLabel: "Bu ay",
      subsLabel: "Aktif aboneler",
      rateLabel: "Komisyon",
    },
  },
  pl: {
    word: "marzenie",
    searchPlaceholder: "Wpisz słowo",
    meanings: [
      {
        definition: "Gorące pragnienie, cel lub ideał, do którego ktoś dąży.",
        examples: [
          "Jej marzeniem było zostać pisarką.",
          "Ciężko pracował, żeby spełnić swoje marzenie.",
          "Nigdy nie rezygnuj ze swoich marzeń.",
        ],
      },
      {
        definition: "Wyobrażenie czegoś przyjemnego, często dalekiego od rzeczywistości.",
        examples: [
          "To było marzenie o spokojnym życiu nad morzem.",
          "Dom jej marzeń to mała chatka w górach.",
          "Pogrążył się w marzeniach o podróży do Japonii.",
        ],
      },
    ],
    idioms: ["spełnienie marzeń", "o czymś takim nawet nie marzyłem", "amerykański sen"],
    etymology: {
      from: "Staropolski",
      original: "marzyć",
      meant: "widzieć przywidzenia, łączone ze słowem mara (zjawa, senne widziadło)",
    },
    kidsExplanation:
      "Marzenie to coś bardzo fajnego, czego naprawdę chcesz. Na przykład zostać astronautą albo mieć psa.",
    composeSentence: "Jej marzenie, żeby zostać lekarką, w końcu się spełniło.",
    composeStatus: "Świetnie ✓",
    imageDescription: "marzenie",
    quizQuestion: "Które słowo oznacza \"pragnienie, które chcesz spełnić\"?",
    quizOptions: ["myśl", "marzenie", "fakt", "wspomnienie"],
    quizCorrect: 1,
    anagramLetters: "zeniarme",
    compareWords: "marzenie vs. cel",
    compareNote: "Oba dotyczą tego, czego chcemy, zobacz dokładną różnicę.",
    partnerHeroTitle: "Poleć Gadit. Zarabiaj z nami.",
    partnerHeroBody: "Lubisz Gadit? Udostępnij swój osobisty link rodzicom, uczniom i osobom uczącym się języków, a przez pierwszy rok otrzymasz 30% z każdej subskrypcji. Zdobądź 10 aktywnych subskrybentów i odblokuj dożywotnią prowizję 10% od nich wszystkich.",
    partnerLink: "gadit.app/?ref=kasia",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% w 1. roku · 10% dożywotnio",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Zobacz Gadit",
      watchTitle: "Zobacz, jak otwiera się każde słowo, poziom po poziomie.",
      watchLede: "Pokaz na żywo prawdziwego słowa w Twoim języku. Najedź kursorem, aby zatrzymać.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Szukaj",
      meaningsLabel: "Znaczenia",
      meaningN: (n) => `Znaczenie ${n}`,
      examplesLabel: "Przykłady",
      idiomsLabel: "Idiomy i wyrażenia",
      etymologyLabel: "Pochodzenie słowa",
      etyFromLabel: "Z",
      etyMeantLabel: "Pierwotnie znaczyło",
      kidsToggle: "Tryb dla dzieci",
      kidsLabel: "Wyjaśnienie dla dzieci",
      composeLabel: "Napisz swoje zdanie",
      imageLabel: "Obraz",
      saved: "Zapisano w zeszycie ★",
      plusBasic: "Plus wszystko z Basic",
      plusClear: "Plus wszystko z Clear",
      quizLabel: "Quiz",
      gameLabel: "Gra słowna",
      compareLabel: "Porównaj dwa słowa",
      dashTitle: "Panel partnera",
      linkLabel: "Twój osobisty link",
      earningsLabel: "W tym miesiącu",
      subsLabel: "Aktywni subskrybenci",
      rateLabel: "Prowizja",
    },
  },
  fa: {
    word: "رویا",
    searchPlaceholder: "یک کلمه بنویسید",
    meanings: [
      {
        definition: "تصویرها، فکرها و حس‌هایی که هنگام خواب در ذهن پدید می‌آیند.",
        examples: [
          "دیشب رویای عجیبی دیدم.",
          "او از یک رویای آرام بیدار شد.",
          "بچه‌ها اغلب در رویا می‌بینند که پرواز می‌کنند.",
        ],
      },
      {
        definition: "آرزوی بزرگ، هدف یا آرمانی که کسی برای رسیدن به آن تلاش می‌کند.",
        examples: [
          "رویای او نویسنده شدن بود.",
          "او سخت کار کرد تا رویایش را به واقعیت تبدیل کند.",
          "هرگز از رویاهایت دست نکش.",
        ],
      },
    ],
    idioms: ["رویایی که به حقیقت پیوست", "حتی در رویا هم نمی‌دیدم", "رویای آمریکایی"],
    etymology: {
      from: "عربی",
      original: "رؤیا",
      meant: "آنچه در خواب دیده می‌شود؛ از ریشهٔ رأی به معنای «دیدن»",
    },
    kidsExplanation:
      "وقتی می‌خوابی، مغزت فیلم‌های کوچکی توی سرت پخش می‌کند، به این‌ها رویا می‌گویند. رویا می‌تواند چیز فوق‌العاده‌ای هم باشد که دلت می‌خواهد یک روز واقعاً اتفاق بیفتد.",
    composeSentence: "رویای او برای پزشک شدن سرانجام به حقیقت پیوست.",
    composeStatus: "عالی ✓",
    imageDescription: "رویا",
    quizQuestion: "کدام کلمه یعنی \"آرزویی که امیدواری به آن برسی\"؟",
    quizOptions: ["فکر", "رویا", "واقعیت", "خاطره"],
    quizCorrect: 1,
    anagramLetters: "ایرو",
    compareWords: "رویا در برابر آرزو",
    compareNote: "هر دو دربارهٔ خواستن چیزی هستند، تفاوت دقیقشان را ببینید.",
    partnerHeroTitle: "Gadit را معرفی کنید. با ما درآمد داشته باشید.",
    partnerHeroBody: "Gadit را دوست دارید؟ لینک شخصی‌تان را با والدین، دانش‌آموزان و زبان‌آموزان به اشتراک بگذارید و در سال اول از هر اشتراک 30% درآمد داشته باشید. به 10 مشترک فعال برسید تا کمیسیون مادام‌العمر 10% برای همهٔ آن‌ها فعال شود.",
    partnerLink: "gadit.app/?ref=sara",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% سال اول · 10% مادام‌العمر",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gadit را ببینید",
      watchTitle: "ببینید هر کلمه چگونه، سطح به سطح، باز می‌شود.",
      watchLede: "نمایش زندهٔ یک کلمهٔ واقعی، به زبان شما. برای توقف، نشانگر را روی آن ببرید.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "همکار",
      searchBtn: "جستجو",
      meaningsLabel: "معناها",
      meaningN: (n) => `معنای ${n}`,
      examplesLabel: "مثال‌ها",
      idiomsLabel: "اصطلاحات و تعبیرها",
      etymologyLabel: "ریشهٔ کلمه",
      etyFromLabel: "از",
      etyMeantLabel: "معنای اولیه",
      kidsToggle: "حالت کودک",
      kidsLabel: "توضیح برای کودکان",
      composeLabel: "جملهٔ خودت را بنویس",
      imageLabel: "تصویر",
      saved: "در دفترچه ذخیره شد ★",
      plusBasic: "به‌علاوهٔ همهٔ امکانات Basic",
      plusClear: "به‌علاوهٔ همهٔ امکانات Clear",
      quizLabel: "آزمونک",
      gameLabel: "بازی کلمات",
      compareLabel: "مقایسهٔ دو کلمه",
      dashTitle: "داشبورد همکار",
      linkLabel: "لینک شخصی شما",
      earningsLabel: "این ماه",
      subsLabel: "مشترکان فعال",
      rateLabel: "کمیسیون",
    },
  },
  id: {
    word: "mimpi",
    searchPlaceholder: "Ketik sebuah kata",
    meanings: [
      {
        definition: "Gambaran, pikiran, dan perasaan yang muncul di dalam pikiran saat tidur.",
        examples: [
          "Tadi malam aku bermimpi aneh sekali.",
          "Dia terbangun dari mimpi yang indah.",
          "Anak-anak sering bermimpi bisa terbang.",
        ],
      },
      {
        definition: "Cita-cita atau keinginan besar yang ingin dicapai.",
        examples: [
          "Mimpinya adalah menjadi penulis.",
          "Dia bekerja keras untuk mewujudkan mimpinya.",
          "Jangan pernah menyerah pada mimpimu.",
        ],
      },
    ],
    idioms: ["mimpi yang jadi kenyataan", "bagai mimpi di siang bolong", "impian Amerika"],
    etymology: {
      from: "Proto-Melayu-Polinesia",
      original: "*hipi",
      meant: "mimpi saat tidur, akar kata yang sama ada di banyak bahasa Nusantara",
    },
    kidsExplanation:
      "Saat kamu tidur, otakmu memutar film-film kecil di dalam kepalamu, itulah mimpi. Mimpi juga bisa berarti sesuatu yang luar biasa yang sangat kamu inginkan terjadi suatu hari nanti.",
    composeSentence: "Mimpinya menjadi dokter akhirnya terwujud.",
    composeStatus: "Sempurna ✓",
    imageDescription: "mimpi",
    quizQuestion: "Kata mana yang berarti \"cita-cita yang ingin kamu capai\"?",
    quizOptions: ["pikiran", "mimpi", "fakta", "kenangan"],
    quizCorrect: 1,
    anagramLetters: "pimim",
    compareWords: "mimpi vs. cita-cita",
    compareNote: "Keduanya tentang menginginkan sesuatu, lihat perbedaan tepatnya.",
    partnerHeroTitle: "Sebarkan Gadit. Dapatkan penghasilan bersama kami.",
    partnerHeroBody: "Suka Gadit? Bagikan tautan pribadimu kepada orang tua, pelajar, dan pembelajar bahasa, lalu dapatkan 30% dari setiap langganan selama tahun pertama. Capai 10 pelanggan aktif dan buka komisi seumur hidup 10% dari semuanya.",
    partnerLink: "gadit.app/?ref=putri",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% tahun ke-1 · 10% seumur hidup",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Tonton Gadit",
      watchTitle: "Lihat bagaimana setiap kata terbuka, tingkat demi tingkat.",
      watchLede: "Panduan langsung sebuah kata nyata, dalam bahasamu. Arahkan kursor untuk menjeda.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Mitra",
      searchBtn: "Cari",
      meaningsLabel: "Arti",
      meaningN: (n) => `Arti ${n}`,
      examplesLabel: "Contoh",
      idiomsLabel: "Idiom & ungkapan",
      etymologyLabel: "Asal kata",
      etyFromLabel: "Dari",
      etyMeantLabel: "Arti awalnya",
      kidsToggle: "Mode anak",
      kidsLabel: "Penjelasan untuk anak",
      composeLabel: "Tulis kalimatmu",
      imageLabel: "Gambar",
      saved: "Tersimpan di buku catatan ★",
      plusBasic: "Plus semua yang ada di Basic",
      plusClear: "Plus semua yang ada di Clear",
      quizLabel: "Kuis",
      gameLabel: "Permainan kata",
      compareLabel: "Bandingkan dua kata",
      dashTitle: "Dasbor mitra",
      linkLabel: "Tautan pribadimu",
      earningsLabel: "Bulan ini",
      subsLabel: "Pelanggan aktif",
      rateLabel: "Komisi",
    },
  },
  nl: {
    word: "droom",
    searchPlaceholder: "Typ een woord",
    meanings: [
      {
        definition: "Beelden, gedachten en gevoelens die tijdens de slaap in je hoofd opkomen.",
        examples: [
          "Ik had vannacht een rare droom.",
          "Ze werd wakker uit een rustige droom.",
          "Kinderen dromen vaak dat ze kunnen vliegen.",
        ],
      },
      {
        definition: "Een grote wens, ambitie of een ideaal.",
        examples: [
          "Het was haar droom om schrijver te worden.",
          "Hij werkte hard om zijn droom waar te maken.",
          "Geef je dromen nooit op.",
        ],
      },
    ],
    idioms: ["een droom die uitkomt", "dat had ik in mijn stoutste dromen niet gedacht", "de Amerikaanse droom"],
    etymology: {
      from: "Middelnederlands",
      original: "droom",
      meant: "beelden in de slaap, uit Oergermaans *draumaz, verwant aan Duits Traum en Engels dream",
    },
    kidsExplanation:
      "Als je slaapt, speelt je brein kleine filmpjes af in je hoofd, dat zijn dromen. Een droom kan ook iets geweldigs zijn dat je heel graag een keer wilt laten uitkomen.",
    composeSentence: "Haar droom om dokter te worden kwam eindelijk uit.",
    composeStatus: "Perfect ✓",
    imageDescription: "droom",
    quizQuestion: "Welk woord betekent \"een wens die je hoopt te bereiken\"?",
    quizOptions: ["gedachte", "droom", "feit", "herinnering"],
    quizCorrect: 1,
    anagramLetters: "rodmo",
    compareWords: "droom vs. ambitie",
    compareNote: "Allebei gaan ze over iets willen, bekijk het precieze verschil.",
    partnerHeroTitle: "Deel Gadit. Verdien met ons.",
    partnerHeroBody: "Ben je fan van Gadit? Deel je persoonlijke link met ouders, leerlingen en taalleerders, en verdien het eerste jaar 30% op elk abonnement. Bereik 10 actieve abonnees en je ontgrendelt 10% levenslange commissie op allemaal.",
    partnerLink: "gadit.app/?ref=sanne",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% jaar 1 · 10% levenslang",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Bekijk Gadit",
      watchTitle: "Zie hoe elk woord zich opent, niveau voor niveau.",
      watchLede: "Een live rondleiding langs een echt woord, in jouw taal. Beweeg erover om te pauzeren.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Zoeken",
      meaningsLabel: "Betekenissen",
      meaningN: (n) => `Betekenis ${n}`,
      examplesLabel: "Voorbeelden",
      idiomsLabel: "Uitdrukkingen & gezegden",
      etymologyLabel: "Herkomst van het woord",
      etyFromLabel: "Van",
      etyMeantLabel: "Betekende oorspronkelijk",
      kidsToggle: "Kindermodus",
      kidsLabel: "Uitleg voor kinderen",
      composeLabel: "Schrijf je zin",
      imageLabel: "Beeld",
      saved: "Opgeslagen in je schrift ★",
      plusBasic: "Plus alles van Basic",
      plusClear: "Plus alles van Clear",
      quizLabel: "Quiz",
      gameLabel: "Woordspel",
      compareLabel: "Vergelijk twee woorden",
      dashTitle: "Partnerdashboard",
      linkLabel: "Je persoonlijke link",
      earningsLabel: "Deze maand",
      subsLabel: "Actieve abonnees",
      rateLabel: "Commissie",
    },
  },
  vi: {
    word: "giấc mơ",
    searchPlaceholder: "Nhập một từ",
    meanings: [
      {
        definition: "Những hình ảnh, suy nghĩ và cảm giác xuất hiện trong đầu khi ngủ.",
        examples: [
          "Đêm qua mình có một giấc mơ rất lạ.",
          "Cô ấy tỉnh dậy sau một giấc mơ êm đềm.",
          "Trẻ em thường mơ thấy mình bay.",
        ],
      },
      {
        definition: "Điều mong ước lớn, hoài bão hoặc lý tưởng.",
        examples: [
          "Giấc mơ của cô ấy là trở thành nhà văn.",
          "Anh ấy làm việc chăm chỉ để biến giấc mơ thành hiện thực.",
          "Đừng bao giờ từ bỏ giấc mơ của mình.",
        ],
      },
    ],
    idioms: ["giấc mơ thành hiện thực", "nằm mơ cũng không nghĩ tới", "giấc mơ Mỹ"],
    etymology: {
      from: "Tiếng Việt thuần",
      original: "mơ",
      meant: "thấy hình ảnh trong lúc ngủ; \"giấc\" chỉ một lần ngủ, về sau có thêm nghĩa ước mong",
    },
    kidsExplanation:
      "Khi bạn ngủ, bộ não chiếu những bộ phim nhỏ trong đầu bạn, đó chính là giấc mơ. Giấc mơ cũng có thể là một điều tuyệt vời mà bạn thật sự muốn xảy ra vào một ngày nào đó.",
    composeSentence: "Giấc mơ trở thành bác sĩ của cô ấy cuối cùng đã thành hiện thực.",
    composeStatus: "Hoàn hảo ✓",
    imageDescription: "giấc mơ",
    quizQuestion: "Từ nào có nghĩa là \"điều mong ước mà bạn hy vọng đạt được\"?",
    quizOptions: ["suy nghĩ", "giấc mơ", "sự thật", "kỷ niệm"],
    quizCorrect: 1,
    anagramLetters: "cơgimấ",
    compareWords: "giấc mơ vs. hoài bão",
    compareNote: "Cả hai đều nói về điều mong muốn, hãy xem sự khác biệt chính xác.",
    partnerHeroTitle: "Lan tỏa Gadit. Cùng kiếm thu nhập với chúng tôi.",
    partnerHeroBody: "Bạn yêu thích Gadit? Hãy chia sẻ đường liên kết cá nhân với phụ huynh, học sinh và người học ngoại ngữ, và nhận 30% từ mỗi gói đăng ký trong năm đầu tiên. Đạt 10 người đăng ký đang hoạt động, bạn sẽ mở khóa hoa hồng trọn đời 10% trên tất cả.",
    partnerLink: "gadit.app/?ref=linh",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% năm đầu · 10% trọn đời",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Xem Gadit",
      watchTitle: "Xem mỗi từ được mở ra như thế nào, từng cấp độ một.",
      watchLede: "Hướng dẫn trực tiếp với một từ thật, bằng ngôn ngữ của bạn. Di chuột vào để tạm dừng.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Đối tác",
      searchBtn: "Tìm",
      meaningsLabel: "Các nghĩa",
      meaningN: (n) => `Nghĩa ${n}`,
      examplesLabel: "Ví dụ",
      idiomsLabel: "Thành ngữ & cách nói",
      etymologyLabel: "Nguồn gốc từ",
      etyFromLabel: "Từ",
      etyMeantLabel: "Nghĩa ban đầu",
      kidsToggle: "Chế độ trẻ em",
      kidsLabel: "Giải thích cho trẻ em",
      composeLabel: "Viết câu của bạn",
      imageLabel: "Hình ảnh",
      saved: "Đã lưu vào sổ tay ★",
      plusBasic: "Cộng tất cả trong Basic",
      plusClear: "Cộng tất cả trong Clear",
      quizLabel: "Câu đố",
      gameLabel: "Trò chơi chữ",
      compareLabel: "So sánh hai từ",
      dashTitle: "Bảng điều khiển đối tác",
      linkLabel: "Đường liên kết cá nhân của bạn",
      earningsLabel: "Tháng này",
      subsLabel: "Người đăng ký đang hoạt động",
      rateLabel: "Hoa hồng",
    },
  },
  fil: {
    word: "panaginip",
    searchPlaceholder: "Mag-type ng salita",
    meanings: [
      {
        definition: "Mga larawan, isipin, at pakiramdam na lumilitaw sa isipan habang natutulog.",
        examples: [
          "Kakaiba ang panaginip ko kagabi.",
          "Nagising siya mula sa isang payapang panaginip.",
          "Madalas managinip ang mga bata na lumilipad sila.",
        ],
      },
      {
        definition: "Isang bagay na napakaganda o parang hindi totoo.",
        examples: [
          "Parang panaginip ang bakasyon namin sa dagat.",
          "Hindi siya makapaniwala, para bang nasa panaginip siya.",
          "Parang panaginip ang araw na nanalo ang koponan namin.",
        ],
      },
    ],
    idioms: ["parang panaginip", "kahit sa panaginip ay hindi ko inisip", "panaginip na naging totoo"],
    etymology: {
      from: "Tagalog",
      original: "taginip",
      meant: "ang makakita ng mga larawan habang natutulog; ang pang- at taginip ang bumuo sa panaginip",
    },
    kidsExplanation:
      "Kapag natutulog ka, nagpapalabas ang utak mo ng maliliit na pelikula sa loob ng ulo mo, iyon ang mga panaginip. Minsan masaya ang panaginip, minsan naman nakakatakot.",
    composeSentence: "Napanaginipan ko kagabi na lumilipad ako sa ibabaw ng dagat.",
    composeStatus: "Perpekto ✓",
    imageDescription: "panaginip",
    quizQuestion: "Aling salita ang ibig sabihin ay \"mga larawang nakikita habang natutulog\"?",
    quizOptions: ["isip", "panaginip", "katotohanan", "alaala"],
    quizCorrect: 1,
    anagramLetters: "ginapnaip",
    compareWords: "panaginip vs. pangarap",
    compareNote: "Parehong may kinalaman sa isip, tingnan ang eksaktong pagkakaiba.",
    partnerHeroTitle: "Ipakalat ang Gadit. Kumita kasama namin.",
    partnerHeroBody: "Gusto mo ang Gadit? Ibahagi ang iyong personal na link sa mga magulang, estudyante, at nag-aaral ng wika, at kumita ng 30% sa bawat subscription sa unang taon. Umabot sa 10 aktibong subscriber at mabubuksan mo ang 10% panghabambuhay na komisyon sa lahat sila.",
    partnerLink: "gadit.app/?ref=joy",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% unang taon · 10% panghabambuhay",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Panoorin ang Gadit",
      watchTitle: "Tingnan kung paano nabubuksan ang bawat salita, antas sa antas.",
      watchLede: "Isang live na paglilibot sa isang tunay na salita, sa iyong wika. I-hover para i-pause.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Hanapin",
      meaningsLabel: "Mga kahulugan",
      meaningN: (n) => `Kahulugan ${n}`,
      examplesLabel: "Mga halimbawa",
      idiomsLabel: "Mga idyoma at pahayag",
      etymologyLabel: "Pinagmulan ng salita",
      etyFromLabel: "Mula sa",
      etyMeantLabel: "Orihinal na kahulugan",
      kidsToggle: "Kids mode",
      kidsLabel: "Paliwanag para sa bata",
      composeLabel: "Isulat ang iyong pangungusap",
      imageLabel: "Larawan",
      saved: "Nai-save sa notebook ★",
      plusBasic: "Dagdag ang lahat ng nasa Basic",
      plusClear: "Dagdag ang lahat ng nasa Clear",
      quizLabel: "Pagsusulit",
      gameLabel: "Laro ng salita",
      compareLabel: "Paghambingin ang dalawang salita",
      dashTitle: "Dashboard ng partner",
      linkLabel: "Ang iyong personal na link",
      earningsLabel: "Ngayong buwan",
      subsLabel: "Aktibong subscriber",
      rateLabel: "Komisyon",
    },
  },
  af: {
    word: "droom",
    searchPlaceholder: "Tik 'n woord",
    meanings: [
      {
        definition: "Beelde, gedagtes en gevoelens wat in jou kop opkom terwyl jy slaap.",
        examples: [
          "Ek het gisteraand 'n vreemde droom gehad.",
          "Sy het uit 'n rustige droom wakker geword.",
          "Kinders droom dikwels dat hulle kan vlieg.",
        ],
      },
      {
        definition: "'n Groot wens, ambisie of ideaal.",
        examples: [
          "Dit was haar droom om 'n skrywer te word.",
          "Hy het hard gewerk om sy droom waar te maak.",
          "Moet nooit jou drome opgee nie.",
        ],
      },
    ],
    idioms: ["'n droom wat waar word", "nie eens in my wildste drome nie", "die Amerikaanse droom"],
    etymology: {
      from: "Nederlands",
      original: "droom",
      meant: "beelde in die slaap, uit Oergermaans *draumaz, verwant aan Engels dream en Duits Traum",
    },
    kidsExplanation:
      "Wanneer jy slaap, speel jou brein klein fliekies in jou kop, dit is drome. 'n Droom kan ook iets wonderliks wees wat jy regtig graag eendag wil hê moet gebeur.",
    composeSentence: "Haar droom om 'n dokter te word het uiteindelik waar geword.",
    composeStatus: "Perfek ✓",
    imageDescription: "droom",
    quizQuestion: "Watter woord beteken \"'n wens wat jy hoop om te bereik\"?",
    quizOptions: ["gedagte", "droom", "feit", "herinnering"],
    quizCorrect: 1,
    anagramLetters: "rodmo",
    compareWords: "droom vs. ambisie",
    compareNote: "Albei gaan oor iets wil hê, sien die presiese verskil.",
    partnerHeroTitle: "Versprei Gadit. Verdien saam met ons.",
    partnerHeroBody: "Hou jy van Gadit? Deel jou persoonlike skakel met ouers, leerders en taalleerders, en verdien 30% op elke intekening vir die eerste jaar. Bereik 10 aktiewe intekenaars en jy ontsluit 10% lewenslange kommissie op almal.",
    partnerLink: "gadit.app/?ref=annelie",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% jaar 1 · 10% lewenslank",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Kyk na Gadit",
      watchTitle: "Sien hoe elke woord oopgaan, vlak vir vlak.",
      watchLede: "'n Regstreekse toer deur 'n regte woord, in jou taal. Beweeg die muis daaroor om te pouseer.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Vennoot",
      searchBtn: "Soek",
      meaningsLabel: "Betekenisse",
      meaningN: (n) => `Betekenis ${n}`,
      examplesLabel: "Voorbeelde",
      idiomsLabel: "Idiome & uitdrukkings",
      etymologyLabel: "Woordoorsprong",
      etyFromLabel: "Van",
      etyMeantLabel: "Het oorspronklik beteken",
      kidsToggle: "Kindermodus",
      kidsLabel: "Verduideliking vir kinders",
      composeLabel: "Skryf jou sin",
      imageLabel: "Beeld",
      saved: "Gestoor in notaboek ★",
      plusBasic: "Plus alles in Basic",
      plusClear: "Plus alles in Clear",
      quizLabel: "Vasvra",
      gameLabel: "Woordspeletjie",
      compareLabel: "Vergelyk twee woorde",
      dashTitle: "Vennootpaneelbord",
      linkLabel: "Jou persoonlike skakel",
      earningsLabel: "Hierdie maand",
      subsLabel: "Aktiewe intekenaars",
      rateLabel: "Kommissie",
    },
  },
  sw: {
    word: "ndoto",
    searchPlaceholder: "Andika neno",
    meanings: [
      {
        definition: "Picha, mawazo na hisia zinazojitokeza akilini mtu anapolala.",
        examples: [
          "Jana usiku niliota ndoto ya ajabu.",
          "Aliamka kutoka katika ndoto tulivu.",
          "Watoto mara nyingi huota wakiruka angani.",
        ],
      },
      {
        definition: "Tamaa kubwa, lengo au matarajio ya mtu.",
        examples: [
          "Ndoto yake ilikuwa kuwa mwandishi.",
          "Alifanya kazi kwa bidii ili kutimiza ndoto yake.",
          "Usiache kamwe ndoto zako.",
        ],
      },
    ],
    idioms: ["ndoto iliyotimia", "hata ndotoni sikuwaza", "ndoto ya Kimarekani"],
    etymology: {
      from: "Kibantu cha kale",
      original: "-ota",
      meant: "kuona picha usingizini; ndoto ni nomino inayotokana na kitenzi kuota",
    },
    kidsExplanation:
      "Unapolala, ubongo wako huonyesha filamu ndogo kichwani mwako, hizo ndizo ndoto. Ndoto pia inaweza kuwa jambo zuri sana unalotamani litokee siku moja.",
    composeSentence: "Ndoto yake ya kuwa daktari hatimaye ilitimia.",
    composeStatus: "Safi kabisa ✓",
    imageDescription: "ndoto",
    quizQuestion: "Neno gani linamaanisha \"tamaa unayotarajia kuifikia\"?",
    quizOptions: ["wazo", "ndoto", "ukweli", "kumbukumbu"],
    quizCorrect: 1,
    anagramLetters: "otdno",
    compareWords: "ndoto vs. lengo",
    compareNote: "Yote mawili yanahusu kutaka kitu, ona tofauti halisi.",
    partnerHeroTitle: "Eneza Gadit. Pata kipato pamoja nasi.",
    partnerHeroBody: "Unaipenda Gadit? Shiriki kiungo chako binafsi na wazazi, wanafunzi na wanaojifunza lugha, na upate 30% ya kila usajili katika mwaka wa kwanza. Fikisha wasajili 10 walio hai na ufungue kamisheni ya maisha ya 10% kwa wote.",
    partnerLink: "gadit.app/?ref=amani",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% mwaka 1 · 10% maisha yote",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Tazama Gadit",
      watchTitle: "Ona jinsi kila neno linavyofunguka, ngazi kwa ngazi.",
      watchLede: "Matembezi ya moja kwa moja ya neno halisi, kwa lugha yako. Weka kipanya juu ili kusitisha.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Mshirika",
      searchBtn: "Tafuta",
      meaningsLabel: "Maana",
      meaningN: (n) => `Maana ${n}`,
      examplesLabel: "Mifano",
      idiomsLabel: "Nahau na misemo",
      etymologyLabel: "Asili ya neno",
      etyFromLabel: "Kutoka",
      etyMeantLabel: "Awali ilimaanisha",
      kidsToggle: "Hali ya watoto",
      kidsLabel: "Maelezo kwa watoto",
      composeLabel: "Andika sentensi yako",
      imageLabel: "Picha",
      saved: "Imehifadhiwa kwenye daftari ★",
      plusBasic: "Pamoja na yote ya Basic",
      plusClear: "Pamoja na yote ya Clear",
      quizLabel: "Chemsha bongo",
      gameLabel: "Mchezo wa maneno",
      compareLabel: "Linganisha maneno mawili",
      dashTitle: "Dashibodi ya mshirika",
      linkLabel: "Kiungo chako binafsi",
      earningsLabel: "Mwezi huu",
      subsLabel: "Wasajili walio hai",
      rateLabel: "Kamisheni",
    },
  },
  "zh-CN": {
    word: "梦",
    searchPlaceholder: "输入一个词",
    meanings: [
      {
        definition: "睡觉时脑海中出现的画面、想法和感受。",
        examples: [
          "我昨晚做了一个奇怪的梦。",
          "她从一个安静的梦里醒来。",
          "孩子们常常梦见自己会飞。",
        ],
      },
      {
        definition: "心中珍视的愿望、理想或目标。",
        examples: [
          "成为作家是她从小的梦。",
          "他努力工作，让自己的梦变成现实。",
          "永远不要放弃心中的梦。",
        ],
      },
    ],
    idioms: ["美梦成真", "做梦也没想到", "美国梦"],
    etymology: {
      from: "古汉语",
      original: "夢",
      meant: "睡眠中看到的景象，后来也指美好的愿望和理想",
    },
    kidsExplanation:
      "你睡觉的时候，大脑会在你的脑袋里放小电影，这就是梦。梦也可以是你特别希望有一天能实现的美好事情。",
    composeSentence: "她当医生的梦终于实现了。",
    composeStatus: "完美 ✓",
    imageDescription: "梦",
    quizQuestion: "哪个词的意思是\"希望实现的理想\"？",
    quizOptions: ["想法", "梦", "事实", "回忆"],
    quizCorrect: 1,
    anagramLetters: "梦",
    compareWords: "梦 vs. 理想",
    compareNote: "两者都和心中的愿望有关，看看它们的确切区别。",
    partnerHeroTitle: "分享 Gadit，和我们一起赚钱。",
    partnerHeroBody: "喜欢 Gadit 吗？把你的专属链接分享给家长、学生和语言学习者，第一年每笔订阅都能获得 30% 佣金。达到 10 位活跃订阅用户，即可解锁所有订阅的 10% 终身佣金。",
    partnerLink: "gadit.app/?ref=xiaoming",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "第 1 年 30% · 终身 10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "观看 Gadit",
      watchTitle: "看看每个词如何一层层展开。",
      watchLede: "用你的语言，现场演示一个真实的词。鼠标悬停即可暂停。",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "合作伙伴",
      searchBtn: "搜索",
      meaningsLabel: "词义",
      meaningN: (n) => `词义 ${n}`,
      examplesLabel: "例句",
      idiomsLabel: "习语和表达",
      etymologyLabel: "词源",
      etyFromLabel: "来自",
      etyMeantLabel: "最初的意思",
      kidsToggle: "儿童模式",
      kidsLabel: "儿童版解释",
      composeLabel: "写下你的句子",
      imageLabel: "图片",
      saved: "已保存到单词本 ★",
      plusBasic: "包含 Basic 的全部功能",
      plusClear: "包含 Clear 的全部功能",
      quizLabel: "小测验",
      gameLabel: "单词游戏",
      compareLabel: "比较两个词",
      dashTitle: "合作伙伴面板",
      linkLabel: "你的专属链接",
      earningsLabel: "本月",
      subsLabel: "活跃订阅用户",
      rateLabel: "佣金",
    },
  },
  "zh-TW": {
    word: "夢",
    searchPlaceholder: "輸入一個詞",
    meanings: [
      {
        definition: "睡覺時腦海中出現的畫面、想法和感受。",
        examples: [
          "我昨晚做了一個奇怪的夢。",
          "她從一個安靜的夢裡醒來。",
          "孩子們常常夢見自己會飛。",
        ],
      },
      {
        definition: "心中珍視的願望、理想或目標。",
        examples: [
          "成為作家是她從小的夢。",
          "他努力工作，讓自己的夢變成現實。",
          "永遠不要放棄心中的夢。",
        ],
      },
    ],
    idioms: ["美夢成真", "做夢也沒想到", "美國夢"],
    etymology: {
      from: "古漢語",
      original: "夢",
      meant: "睡眠中看到的景象，後來也指美好的願望和理想",
    },
    kidsExplanation:
      "你睡覺的時候，大腦會在你的腦袋裡播放小電影，這就是夢。夢也可以是你特別希望有一天能實現的美好事情。",
    composeSentence: "她當醫生的夢終於實現了。",
    composeStatus: "完美 ✓",
    imageDescription: "夢",
    quizQuestion: "哪個詞的意思是\"希望實現的理想\"？",
    quizOptions: ["想法", "夢", "事實", "回憶"],
    quizCorrect: 1,
    anagramLetters: "夢",
    compareWords: "夢 vs. 理想",
    compareNote: "兩者都和心中的願望有關，看看它們的確切差別。",
    partnerHeroTitle: "分享 Gadit，和我們一起賺錢。",
    partnerHeroBody: "喜歡 Gadit 嗎？把你的專屬連結分享給家長、學生和語言學習者，第一年每筆訂閱都能獲得 30% 佣金。達到 10 位活躍訂閱用戶，即可解鎖所有訂閱的 10% 終身佣金。",
    partnerLink: "gadit.app/?ref=yating",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "第 1 年 30% · 終身 10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "觀看 Gadit",
      watchTitle: "看看每個詞如何一層層展開。",
      watchLede: "用你的語言，現場示範一個真實的詞。滑鼠停留即可暫停。",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "合作夥伴",
      searchBtn: "搜尋",
      meaningsLabel: "詞義",
      meaningN: (n) => `詞義 ${n}`,
      examplesLabel: "例句",
      idiomsLabel: "慣用語和表達",
      etymologyLabel: "詞源",
      etyFromLabel: "來自",
      etyMeantLabel: "最初的意思",
      kidsToggle: "兒童模式",
      kidsLabel: "兒童版解釋",
      composeLabel: "寫下你的句子",
      imageLabel: "圖片",
      saved: "已儲存到單字本 ★",
      plusBasic: "包含 Basic 的全部功能",
      plusClear: "包含 Clear 的全部功能",
      quizLabel: "小測驗",
      gameLabel: "單字遊戲",
      compareLabel: "比較兩個詞",
      dashTitle: "合作夥伴面板",
      linkLabel: "你的專屬連結",
      earningsLabel: "本月",
      subsLabel: "活躍訂閱用戶",
      rateLabel: "佣金",
    },
  },
  ko: {
    word: "꿈",
    searchPlaceholder: "단어를 입력하세요",
    meanings: [
      {
        definition: "잠을 자는 동안 머릿속에 떠오르는 장면, 생각, 느낌.",
        examples: [
          "어젯밤에 이상한 꿈을 꿨어요.",
          "그녀는 평화로운 꿈에서 깨어났어요.",
          "아이들은 하늘을 나는 꿈을 자주 꿔요.",
        ],
      },
      {
        definition: "이루고 싶은 소중한 바람이나 목표.",
        examples: [
          "그녀의 꿈은 작가가 되는 것이었어요.",
          "그는 꿈을 이루기 위해 열심히 노력했어요.",
          "절대 꿈을 포기하지 마세요.",
        ],
      },
    ],
    idioms: ["꿈은 이루어진다", "꿈에도 몰랐다", "아메리칸 드림"],
    etymology: {
      from: "중세 국어",
      original: "꾸다 + -ㅁ",
      meant: "잠자며 무언가를 보다라는 뜻의 동사 '꾸다'에 '-ㅁ'이 붙은 말, 나중에 '이루고 싶은 바람'의 뜻이 더해짐",
    },
    kidsExplanation:
      "잠을 잘 때 뇌가 머릿속에서 작은 영화를 틀어 줘요, 그게 바로 꿈이에요. 꿈은 언젠가 꼭 이루어졌으면 하는 멋진 바람이기도 해요.",
    composeSentence: "의사가 되고 싶었던 그녀의 꿈이 마침내 이루어졌어요.",
    composeStatus: "완벽해요 ✓",
    imageDescription: "꿈",
    quizQuestion: "\"이루고 싶은 바람\"이라는 뜻의 단어는 무엇일까요?",
    quizOptions: ["생각", "꿈", "사실", "기억"],
    quizCorrect: 1,
    anagramLetters: "꿈",
    compareWords: "꿈 vs. 목표",
    compareNote: "둘 다 무언가를 바라는 말이에요, 정확한 차이를 확인해 보세요.",
    partnerHeroTitle: "Gadit을 알려 주세요. 함께 수익을 만들어요.",
    partnerHeroBody: "Gadit이 마음에 드시나요? 개인 링크를 부모님, 학생, 언어 학습자와 공유하고 첫해 동안 모든 구독의 30%를 받으세요. 활성 구독자 10명을 달성하면 모든 구독자에 대해 평생 10% 수수료가 열립니다.",
    partnerLink: "gadit.app/?ref=jiwoo",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "첫해 30% · 평생 10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gadit 보기",
      watchTitle: "모든 단어가 단계별로 어떻게 열리는지 확인해 보세요.",
      watchLede: "실제 단어를 내 언어로 보여 주는 라이브 둘러보기. 마우스를 올리면 멈춰요.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "파트너",
      searchBtn: "검색",
      meaningsLabel: "뜻",
      meaningN: (n) => `뜻 ${n}`,
      examplesLabel: "예문",
      idiomsLabel: "관용구와 표현",
      etymologyLabel: "단어의 기원",
      etyFromLabel: "출처",
      etyMeantLabel: "원래 뜻",
      kidsToggle: "키즈 모드",
      kidsLabel: "어린이용 설명",
      composeLabel: "문장을 써 보세요",
      imageLabel: "그림",
      saved: "단어장에 저장됨 ★",
      plusBasic: "Basic의 모든 기능 포함",
      plusClear: "Clear의 모든 기능 포함",
      quizLabel: "퀴즈",
      gameLabel: "단어 게임",
      compareLabel: "두 단어 비교",
      dashTitle: "파트너 대시보드",
      linkLabel: "개인 링크",
      earningsLabel: "이번 달",
      subsLabel: "활성 구독자",
      rateLabel: "수수료",
    },
  },
  th: {
    word: "ความฝัน",
    searchPlaceholder: "พิมพ์คำศัพท์",
    meanings: [
      {
        definition: "ภาพ ความคิด และความรู้สึกที่เกิดขึ้นในใจขณะนอนหลับ",
        examples: [
          "เมื่อคืนฉันฝันแปลกมาก",
          "เธอตื่นขึ้นมาจากความฝันที่สงบ",
          "เด็กๆ มักฝันว่าตัวเองบินได้",
        ],
      },
      {
        definition: "สิ่งที่ปรารถนาอย่างแรงกล้า เป้าหมาย หรืออุดมคติ",
        examples: [
          "ความฝันของเธอคือการเป็นนักเขียน",
          "เขาทำงานหนักเพื่อทำความฝันให้เป็นจริง",
          "อย่ายอมแพ้ต่อความฝันของตัวเอง",
        ],
      },
    ],
    idioms: ["ฝันที่เป็นจริง", "ฝันไปเถอะ", "ความฝันแบบอเมริกัน"],
    etymology: {
      from: "ภาษาไทดั้งเดิม",
      original: "*fan",
      meant: "การเห็นภาพขณะหลับ เป็นคำไทยแท้ที่พบในภาษาตระกูลไทหลายภาษา",
    },
    kidsExplanation:
      "เวลาที่เราหลับ สมองจะฉายหนังเรื่องเล็กๆ ในหัวของเรา นั่นแหละคือความฝัน ความฝันยังหมายถึงสิ่งดีๆ ที่เราอยากให้เกิดขึ้นจริงสักวันหนึ่งด้วย",
    composeSentence: "ความฝันที่จะเป็นหมอของเธอเป็นจริงในที่สุด",
    composeStatus: "สมบูรณ์แบบ ✓",
    imageDescription: "ความฝัน",
    quizQuestion: "คำไหนหมายถึง \"สิ่งที่หวังว่าจะทำให้สำเร็จ\"?",
    quizOptions: ["ความคิด", "ความฝัน", "ข้อเท็จจริง", "ความทรงจำ"],
    quizCorrect: 1,
    anagramLetters: "ฝัน",
    compareWords: "ความฝัน vs. เป้าหมาย",
    compareNote: "ทั้งสองคำเกี่ยวกับสิ่งที่อยากได้ ดูความแตกต่างที่แท้จริง",
    partnerHeroTitle: "บอกต่อ Gadit รับรายได้ไปกับเรา",
    partnerHeroBody: "ชอบ Gadit ไหม? แชร์ลิงก์ส่วนตัวให้พ่อแม่ นักเรียน และผู้เรียนภาษา แล้วรับ 30% จากทุกการสมัครสมาชิกตลอดปีแรก เมื่อมีสมาชิกที่ใช้งานอยู่ครบ 10 คน จะปลดล็อกค่าคอมมิชชัน 10% ตลอดชีพจากทุกคน",
    partnerLink: "gadit.app/?ref=nong",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "ปีแรก 30% · ตลอดชีพ 10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "ดู Gadit",
      watchTitle: "ดูว่าแต่ละคำเปิดออกอย่างไร ทีละระดับ",
      watchLede: "ชมคำจริงแบบสดๆ ในภาษาของคุณ วางเมาส์เพื่อหยุดชั่วคราว",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "พาร์ตเนอร์",
      searchBtn: "ค้นหา",
      meaningsLabel: "ความหมาย",
      meaningN: (n) => `ความหมายที่ ${n}`,
      examplesLabel: "ตัวอย่าง",
      idiomsLabel: "สำนวนและวลี",
      etymologyLabel: "ที่มาของคำ",
      etyFromLabel: "จาก",
      etyMeantLabel: "ความหมายเดิม",
      kidsToggle: "โหมดเด็ก",
      kidsLabel: "คำอธิบายสำหรับเด็ก",
      composeLabel: "เขียนประโยคของคุณ",
      imageLabel: "ภาพ",
      saved: "บันทึกลงสมุดแล้ว ★",
      plusBasic: "พร้อมทุกอย่างใน Basic",
      plusClear: "พร้อมทุกอย่างใน Clear",
      quizLabel: "แบบทดสอบ",
      gameLabel: "เกมคำศัพท์",
      compareLabel: "เปรียบเทียบสองคำ",
      dashTitle: "แดชบอร์ดพาร์ตเนอร์",
      linkLabel: "ลิงก์ส่วนตัวของคุณ",
      earningsLabel: "เดือนนี้",
      subsLabel: "สมาชิกที่ใช้งานอยู่",
      rateLabel: "ค่าคอมมิชชัน",
    },
  },
  bn: {
    word: "স্বপ্ন",
    searchPlaceholder: "একটি শব্দ লিখুন",
    meanings: [
      {
        definition: "ঘুমের সময় মনের মধ্যে যে ছবি, ভাবনা আর অনুভূতি আসে।",
        examples: [
          "কাল রাতে আমি একটা অদ্ভুত স্বপ্ন দেখেছি।",
          "সে একটা শান্ত স্বপ্ন থেকে জেগে উঠল।",
          "ছোটরা প্রায়ই উড়ে বেড়ানোর স্বপ্ন দেখে।",
        ],
      },
      {
        definition: "মনের গভীর ইচ্ছা, লক্ষ্য বা আদর্শ।",
        examples: [
          "লেখক হওয়াই ছিল তার স্বপ্ন।",
          "স্বপ্ন সত্যি করতে সে কঠোর পরিশ্রম করেছে।",
          "কখনো নিজের স্বপ্ন ছেড়ে দিও না।",
        ],
      },
    ],
    idioms: ["স্বপ্ন সত্যি হওয়া", "স্বপ্নেও ভাবিনি", "আমেরিকান ড্রিম"],
    etymology: {
      from: "সংস্কৃত",
      original: "স্বপ্ন",
      meant: "স্বপ্ন (svapna), অর্থাৎ 'ঘুমের মধ্যে দেখা দৃশ্য'। পরে 'ইচ্ছা' ও 'লক্ষ্য' অর্থও যুক্ত হয়।",
    },
    kidsExplanation:
      "তুমি যখন ঘুমাও, তোমার মস্তিষ্ক মাথার ভেতরে ছোট ছোট সিনেমা চালায়, সেগুলোই স্বপ্ন। স্বপ্ন মানে এমন দারুণ কিছুও, যা তুমি সত্যিই চাও একদিন ঘটুক।",
    composeSentence: "ডাক্তার হওয়ার তার স্বপ্ন অবশেষে সত্যি হলো।",
    composeStatus: "নিখুঁত ✓",
    imageDescription: "স্বপ্ন",
    quizQuestion: "কোন শব্দের অর্থ \"যে ইচ্ছা তুমি পূরণ করতে চাও\"?",
    quizOptions: ["চিন্তা", "স্বপ্ন", "বাস্তব", "স্মৃতি"],
    quizCorrect: 1,
    anagramLetters: "স্বপ্ন",
    compareWords: "স্বপ্ন বনাম লক্ষ্য",
    compareNote: "দুটোই কিছু চাওয়ার কথা বলে, সঠিক পার্থক্যটা দেখে নাও।",
    partnerHeroTitle: "Gadit ছড়িয়ে দিন। আমাদের সঙ্গে আয় করুন।",
    partnerHeroBody: "Gadit ভালো লাগে? আপনার ব্যক্তিগত লিংক অভিভাবক, শিক্ষার্থী ও ভাষা শিখছেন এমন মানুষদের সঙ্গে শেয়ার করুন, আর প্রথম বছর প্রতিটি সাবস্ক্রিপশন থেকে 30% আয় করুন। 10 জন সক্রিয় সাবস্ক্রাইবার হলে সবার ওপর আজীবন 10% কমিশন খুলে যাবে।",
    partnerLink: "gadit.app/?ref=rahul",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "প্রথম বছর 30% · আজীবন 10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gadit দেখুন",
      watchTitle: "দেখুন প্রতিটি শব্দ কীভাবে ধাপে ধাপে খুলে যায়।",
      watchLede: "আপনার ভাষায় একটি আসল শব্দের লাইভ ঝলক। থামাতে কার্সর রাখুন।",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "পার্টনার",
      searchBtn: "খুঁজুন",
      meaningsLabel: "অর্থ",
      meaningN: (n) => `অর্থ ${n}`,
      examplesLabel: "উদাহরণ",
      idiomsLabel: "বাগধারা ও অভিব্যক্তি",
      etymologyLabel: "শব্দের উৎস",
      etyFromLabel: "থেকে",
      etyMeantLabel: "মূল অর্থ",
      kidsToggle: "কিডস মোড",
      kidsLabel: "ছোটদের জন্য ব্যাখ্যা",
      composeLabel: "তোমার বাক্য লেখো",
      imageLabel: "ছবি",
      saved: "নোটবুকে সেভ হয়েছে ★",
      plusBasic: "সাথে Basic-এর সবকিছু",
      plusClear: "সাথে Clear-এর সবকিছু",
      quizLabel: "কুইজ",
      gameLabel: "শব্দের খেলা",
      compareLabel: "দুটি শব্দ তুলনা করুন",
      dashTitle: "পার্টনার ড্যাশবোর্ড",
      linkLabel: "আপনার ব্যক্তিগত লিংক",
      earningsLabel: "এই মাসে",
      subsLabel: "সক্রিয় সাবস্ক্রাইবার",
      rateLabel: "কমিশন",
    },
  },
  da: {
    word: "drøm",
    searchPlaceholder: "Skriv et ord",
    meanings: [
      {
        definition: "Billeder, tanker og følelser, der opstår i hovedet, mens man sover.",
        examples: [
          "Jeg havde en mærkelig drøm i nat.",
          "Hun vågnede fra en rolig drøm.",
          "Børn drømmer tit om at kunne flyve.",
        ],
      },
      {
        definition: "Et stort ønske, en ambition eller et ideal.",
        examples: [
          "Det var hendes drøm at blive forfatter.",
          "Han arbejdede hårdt for at gøre sin drøm til virkelighed.",
          "Giv aldrig op på dine drømme.",
        ],
      },
    ],
    idioms: ["en drøm, der går i opfyldelse", "ikke i mine vildeste drømme", "den amerikanske drøm"],
    etymology: {
      from: "Oldnordisk",
      original: "draumr",
      meant: "billeder i søvne, fra urgermansk *draumaz, beslægtet med engelsk dream og tysk Traum",
    },
    kidsExplanation:
      "Når du sover, viser din hjerne små film inde i dit hoved, det er drømme. En drøm kan også være noget fantastisk, som du rigtig gerne vil have skal ske en dag.",
    composeSentence: "Hendes drøm om at blive læge gik endelig i opfyldelse.",
    composeStatus: "Perfekt ✓",
    imageDescription: "drøm",
    quizQuestion: "Hvilket ord betyder \"et ønske, man håber at opnå\"?",
    quizOptions: ["tanke", "drøm", "fakta", "minde"],
    quizCorrect: 1,
    anagramLetters: "mødr",
    compareWords: "drøm vs. ambition",
    compareNote: "Begge handler om at ville noget, se den præcise forskel.",
    partnerHeroTitle: "Del Gadit. Tjen penge sammen med os.",
    partnerHeroBody: "Er du glad for Gadit? Del dit personlige link med forældre, elever og sprogelever, og tjen 30% af hvert abonnement det første år. Nå 10 aktive abonnenter, og du låser op for 10% livslang provision på dem alle.",
    partnerLink: "gadit.app/?ref=freja",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% år 1 · 10% livslangt",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Se Gadit",
      watchTitle: "Se hvordan hvert ord åbner sig, niveau for niveau.",
      watchLede: "En live gennemgang af et rigtigt ord på dit sprog. Hold musen over for at sætte på pause.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Søg",
      meaningsLabel: "Betydninger",
      meaningN: (n) => `Betydning ${n}`,
      examplesLabel: "Eksempler",
      idiomsLabel: "Idiomer og udtryk",
      etymologyLabel: "Ordets oprindelse",
      etyFromLabel: "Fra",
      etyMeantLabel: "Betød oprindeligt",
      kidsToggle: "Børnetilstand",
      kidsLabel: "Forklaring til børn",
      composeLabel: "Skriv din sætning",
      imageLabel: "Billede",
      saved: "Gemt i notesbogen ★",
      plusBasic: "Plus alt i Basic",
      plusClear: "Plus alt i Clear",
      quizLabel: "Quiz",
      gameLabel: "Ordspil",
      compareLabel: "Sammenlign to ord",
      dashTitle: "Partnerdashboard",
      linkLabel: "Dit personlige link",
      earningsLabel: "Denne måned",
      subsLabel: "Aktive abonnenter",
      rateLabel: "Provision",
    },
  },
  hu: {
    word: "álom",
    searchPlaceholder: "Írj be egy szót",
    meanings: [
      {
        definition: "Képek, gondolatok és érzések, amelyek alvás közben jelennek meg a fejünkben.",
        examples: [
          "Furcsa álmom volt az éjjel.",
          "Egy nyugodt álomból ébredt fel.",
          "A gyerekek gyakran álmodnak arról, hogy repülnek.",
        ],
      },
      {
        definition: "Nagy vágy, cél vagy eszmény.",
        examples: [
          "Az volt az álma, hogy író legyen.",
          "Keményen dolgozott, hogy valóra váltsa az álmát.",
          "Soha ne add fel az álmaidat.",
        ],
      },
    ],
    idioms: ["valóra vált álom", "álmomban sem gondoltam volna", "az amerikai álom"],
    etymology: {
      from: "Ősi magyar szó",
      original: "al- (alszik)",
      meant: "alvás és az alvás közben látott képek; ugyanabból a tőből való, mint az alszik ige",
    },
    kidsExplanation:
      "Amikor alszol, az agyad kis filmeket vetít a fejedben, ezek az álmok. Az álom lehet valami csodás dolog is, amit nagyon szeretnél, hogy egyszer megtörténjen.",
    composeSentence: "Az álma, hogy orvos legyen, végre valóra vált.",
    composeStatus: "Tökéletes ✓",
    imageDescription: "álom",
    quizQuestion: "Melyik szó jelenti azt, hogy \"egy vágy, amelyet el szeretnél érni\"?",
    quizOptions: ["gondolat", "álom", "tény", "emlék"],
    quizCorrect: 1,
    anagramLetters: "moál",
    compareWords: "álom vs. ambíció",
    compareNote: "Mindkettő arról szól, hogy akarunk valamit, nézd meg a pontos különbséget.",
    partnerHeroTitle: "Ajánld a Gadit alkalmazást. Keress velünk.",
    partnerHeroBody: "Szereted a Gadit alkalmazást? Oszd meg a személyes linkedet szülőkkel, diákokkal és nyelvtanulókkal, és az első évben minden előfizetés után 30% jutalékot kapsz. Ha eléred a 10 aktív előfizetőt, mindegyikük után 10% élethosszig tartó jutalék jár.",
    partnerLink: "gadit.app/?ref=reka",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "1. év 30% · élethosszig 10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gadit bemutató",
      watchTitle: "Nézd meg, hogyan nyílik ki minden szó, szintről szintre.",
      watchLede: "Élő bemutató egy valódi szóval, a saját nyelveden. Vidd fölé az egeret a megállításhoz.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Keresés",
      meaningsLabel: "Jelentések",
      meaningN: (n) => `${n}. jelentés`,
      examplesLabel: "Példák",
      idiomsLabel: "Szólások és kifejezések",
      etymologyLabel: "A szó eredete",
      etyFromLabel: "Forrás",
      etyMeantLabel: "Eredeti jelentése",
      kidsToggle: "Gyerekmód",
      kidsLabel: "Magyarázat gyerekeknek",
      composeLabel: "Írd meg a mondatod",
      imageLabel: "Kép",
      saved: "Mentve a füzetbe ★",
      plusBasic: "Plusz minden, ami a Basic csomagban van",
      plusClear: "Plusz minden, ami a Clear csomagban van",
      quizLabel: "Kvíz",
      gameLabel: "Szójáték",
      compareLabel: "Két szó összehasonlítása",
      dashTitle: "Partner irányítópult",
      linkLabel: "A személyes linked",
      earningsLabel: "Ebben a hónapban",
      subsLabel: "Aktív előfizetők",
      rateLabel: "Jutalék",
    },
  },
};

function pickDemo(lang: Lang): DemoContent {
  return DEMO[lang] ?? DEMO.en;
}

export function GaditDemoAnimation() {
  const { lang } = useLang();
  const d = pickDemo(lang);
  const c = d.l;
  const [scene, setScene] = useState<Scene>("basic");
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) return;
    const dur = SCENE_DURATION_MS[scene];
    timeoutRef.current = setTimeout(() => {
      const idx = SCENE_ORDER.indexOf(scene);
      setScene(SCENE_ORDER[(idx + 1) % SCENE_ORDER.length]);
    }, dur);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scene, paused]);

  return (
    <div
      className="wb-demo-anim"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Gadit feature tour"
    >
      {/* The intro sits on the PAGE background, so it follows the page
          theme (page tokens, readable on dark). Only the mockup FRAME
          below is force-light — it's a "screenshot" of the light app. */}
      <div className="wb-demo-anim-headstrip">
        <div className="wb-demo-anim-eyebrow">{c.watchEyebrow}</div>
        <h2 className="wb-demo-anim-title">{c.watchTitle}</h2>
        <p className="wb-demo-anim-lede">{c.watchLede}</p>
      </div>

      <div className="wb-demo-anim-frame wb-force-light">
        <div className="wb-demo-anim-topbar">
          <div className="wb-demo-anim-wordmark">
            Gad<span className="wb-demo-anim-wordmark-it">it</span>
          </div>
          <div className={`wb-demo-anim-tier wb-demo-anim-tier-${scene}`}>
            {scene === "basic" ? c.tierBasic :
             scene === "clear" ? c.tierClear :
             scene === "deep" ? c.tierDeep :
             c.tierPartner}
          </div>
        </div>

        {/* Search bar, always visible except on the partner scene,
            because the partner scene reframes the chrome as a dashboard
            rather than a lookup. The input shows the word "typed" so
            the visitor sees the connection between search → result. */}
        {scene !== "partner" && (
          <div className="wb-demo-anim-search">
            <input
              className="wb-demo-anim-search-input"
              value={d.word}
              readOnly
              aria-label={d.searchPlaceholder}
            />
            <button type="button" className="wb-demo-anim-search-btn" tabIndex={-1}>
              {c.searchBtn}
            </button>
          </div>
        )}

        <div className="wb-demo-anim-stage">
          {scene === "basic" && <BasicScene d={d} c={c} />}
          {scene === "clear" && <ClearScene d={d} c={c} />}
          {scene === "deep" && <DeepScene d={d} c={c} />}
          {scene === "partner" && <PartnerScene d={d} c={c} />}
        </div>

        <div className="wb-demo-anim-dots" role="tablist">
          {SCENE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={scene === s}
              aria-label={
                s === "basic" ? c.tierBasic :
                s === "clear" ? c.tierClear :
                s === "deep" ? c.tierDeep :
                c.tierPartner
              }
              className={`wb-demo-anim-dot${scene === s ? " is-active" : ""}`}
              onClick={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setScene(s);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Scenes ─────────────────────────────────────────────────────

function BasicScene({ d, c }: { d: DemoContent; c: DemoContent["l"] }) {
  return (
    <div className="wb-demo-anim-scene">
      <div className="wb-demo-anim-word" style={{ animationDelay: "0ms" }}>
        {d.word}
      </div>

      <div className="wb-demo-anim-section-label" style={{ animationDelay: "150ms" }}>
        {c.meaningsLabel} ({d.meanings.length})
      </div>

      {d.meanings.map((m, mi) => (
        <div
          key={mi}
          className="wb-demo-anim-meaning"
          style={{ animationDelay: `${300 + mi * 250}ms` }}
        >
          <div className="wb-demo-anim-meaning-n">{c.meaningN(mi + 1)}</div>
          <div className="wb-demo-anim-meaning-body">{m.definition}</div>
          <ul className="wb-demo-anim-list">
            {m.examples.map((ex, ei) => (
              <li
                key={ei}
                className="wb-demo-anim-li"
                style={{ animationDelay: `${600 + mi * 250 + ei * 180}ms` }}
              >
                {ex}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="wb-demo-anim-section-label" style={{ animationDelay: "2400ms" }}>
        {c.idiomsLabel}
      </div>
      <div className="wb-demo-anim-idiom-row" style={{ animationDelay: "2550ms" }}>
        {d.idioms.map((idiom, i) => (
          <span key={i} className="wb-demo-anim-idiom-pill">{idiom}</span>
        ))}
      </div>

      <div className="wb-demo-anim-section-label" style={{ animationDelay: "3000ms" }}>
        {c.etymologyLabel}
      </div>
      <div className="wb-demo-anim-origin" style={{ animationDelay: "3150ms" }}>
        <div className="wb-demo-anim-origin-row">
          <span className="wb-demo-anim-origin-label">{c.etyFromLabel}</span>
          <span className="wb-demo-anim-origin-value">{d.etymology.from} · <em>{d.etymology.original}</em></span>
        </div>
        <div className="wb-demo-anim-origin-row">
          <span className="wb-demo-anim-origin-label">{c.etyMeantLabel}</span>
          <span className="wb-demo-anim-origin-value">{d.etymology.meant}</span>
        </div>
      </div>
    </div>
  );
}

function ClearScene({ d, c }: { d: DemoContent; c: DemoContent["l"] }) {
  return (
    <div className="wb-demo-anim-scene">
      <div className="wb-demo-anim-word" style={{ animationDelay: "0ms" }}>
        {d.word}
      </div>

      <div className="wb-demo-anim-toggle-row" style={{ animationDelay: "200ms" }}>
        <span className="wb-demo-anim-toggle-label">{c.kidsToggle}</span>
        <span className="wb-demo-anim-toggle">
          <span className="wb-demo-anim-toggle-thumb" />
        </span>
      </div>

      <div className="wb-demo-anim-section-label" style={{ animationDelay: "600ms" }}>
        {c.kidsLabel}
      </div>
      <div className="wb-demo-anim-kids-card" style={{ animationDelay: "750ms" }}>
        {d.kidsExplanation}
      </div>

      <div className="wb-demo-anim-clear-grid">
        {/* Image preview, a gradient swatch as a stand-in for a real
            Gadit-generated illustration. We deliberately do NOT load an
            actual image: the demo card already weighs a lot and a real
            image would hurt LCP on /features. The gradient + sparkle
            reads as "AI imagery" at a glance. */}
        <div className="wb-demo-anim-image-block" style={{ animationDelay: "1300ms" }}>
          <div className="wb-demo-anim-image-frame">
            <div className="wb-demo-anim-image-sparkle">✨</div>
          </div>
          <div className="wb-demo-anim-image-meta">
            <div className="wb-demo-anim-mini-eyebrow">{c.imageLabel}</div>
            <div className="wb-demo-anim-mini-body">{d.imageDescription}</div>
          </div>
        </div>

        <div className="wb-demo-anim-compose" style={{ animationDelay: "1700ms" }}>
          <div className="wb-demo-anim-mini-eyebrow">{c.composeLabel}</div>
          <div className="wb-demo-anim-compose-input">{d.composeSentence}</div>
          <div className="wb-demo-anim-compose-status">{d.composeStatus}</div>
        </div>
      </div>

      <div className="wb-demo-anim-pill-row" style={{ animationDelay: "2300ms" }}>
        <div className="wb-demo-anim-pill is-success">{c.saved}</div>
      </div>

      <div className="wb-demo-anim-fineprint" style={{ animationDelay: "2700ms" }}>
        {c.plusBasic}
      </div>
    </div>
  );
}

function DeepScene({ d, c }: { d: DemoContent; c: DemoContent["l"] }) {
  return (
    <div className="wb-demo-anim-scene">
      <div className="wb-demo-anim-word" style={{ animationDelay: "0ms" }}>
        {d.word}
      </div>

      <div className="wb-demo-anim-card is-deep" style={{ animationDelay: "200ms" }}>
        <div className="wb-demo-anim-label">{c.quizLabel}</div>
        <div className="wb-demo-anim-body">{d.quizQuestion}</div>
        <div className="wb-demo-anim-quiz-options">
          {d.quizOptions.map((opt, i) => (
            <span
              key={i}
              className={`wb-demo-anim-quiz-opt${i === d.quizCorrect ? " is-correct" : ""}`}
            >
              {opt}
            </span>
          ))}
        </div>
      </div>

      <div className="wb-demo-anim-deep-grid">
        <div className="wb-demo-anim-game-row" style={{ animationDelay: "1300ms" }}>
          <div className="wb-demo-anim-mini-eyebrow">{c.gameLabel}</div>
          <div className="wb-demo-anim-letters">
            {d.anagramLetters.split("").map((ch, i) => (
              <span key={i} className="wb-demo-anim-letter">{ch}</span>
            ))}
          </div>
        </div>

        <div className="wb-demo-anim-compare-row" style={{ animationDelay: "1700ms" }}>
          <div className="wb-demo-anim-mini-eyebrow">{c.compareLabel}</div>
          <div className="wb-demo-anim-compare-words">{d.compareWords}</div>
          <div className="wb-demo-anim-compare-body">{d.compareNote}</div>
        </div>
      </div>

      <div className="wb-demo-anim-fineprint" style={{ animationDelay: "2400ms" }}>
        {c.plusClear}
      </div>
    </div>
  );
}

function PartnerScene({ d, c }: { d: DemoContent; c: DemoContent["l"] }) {
  return (
    <div className="wb-demo-anim-scene">
      {/* Lead with the WHY before the dashboard. The earlier version
          opened straight on "Partner dashboard" which read as "wait,
          why am I looking at this?" to visitors who hadn't even heard
          of the partner program yet. Now the title + body frame it as
          an invitation; the dashboard preview comes after as proof. */}
      <div className="wb-demo-anim-partner-hero" style={{ animationDelay: "0ms" }}>
        <h3 className="wb-demo-anim-partner-hero-title">{d.partnerHeroTitle}</h3>
        <p className="wb-demo-anim-partner-hero-body">{d.partnerHeroBody}</p>
      </div>

      <div className="wb-demo-anim-section-label" style={{ animationDelay: "400ms" }}>
        {c.dashTitle}
      </div>

      <div className="wb-demo-anim-link" style={{ animationDelay: "550ms" }}>
        <div className="wb-demo-anim-mini-eyebrow">{c.linkLabel}</div>
        <div className="wb-demo-anim-link-value">{d.partnerLink}</div>
      </div>

      <div className="wb-demo-anim-stats">
        <div className="wb-demo-anim-stat" style={{ animationDelay: "900ms" }}>
          <div className="wb-demo-anim-stat-label">{c.earningsLabel}</div>
          <div className="wb-demo-anim-stat-value">{d.partnerEarnings}</div>
        </div>
        <div className="wb-demo-anim-stat" style={{ animationDelay: "1200ms" }}>
          <div className="wb-demo-anim-stat-label">{c.subsLabel}</div>
          <div className="wb-demo-anim-stat-value">{d.partnerSubs}</div>
        </div>
      </div>

      <div className="wb-demo-anim-rate" style={{ animationDelay: "1500ms" }}>
        <div className="wb-demo-anim-mini-eyebrow">{c.rateLabel}</div>
        <div className="wb-demo-anim-rate-value">{d.partnerRate}</div>
      </div>

      <div className="wb-demo-anim-status" style={{ animationDelay: "1900ms" }}>
        {d.partnerStatus}
      </div>
    </div>
  );
}
