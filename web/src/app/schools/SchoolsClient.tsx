"use client";

/**
 * /schools — owner dashboard for the Schools subscription.
 *
 * Responsibilities:
 *   - Verify the signed-in user owns a Schools subscription. If not, soft
 *     redirect to /pricing.
 *   - Let the principal name the school + upload a logo (shown on the
 *     kid-facing /c/<CODE> page so the classroom feels like part of the
 *     school).
 *   - List every classroom with its 6-character class code and "Open"
 *     button to the teacher view at /classroom/[id].
 *   - "+ Add classroom" creates a new classroom with a random code,
 *     server-validated for uniqueness within the school.
 *
 * Auth model: the owner has a real Firebase Auth uid that matches
 * schoolId. Kids reach /c/<CODE> WITHOUT authenticating (no accounts,
 * no PII) — that's why this page never shows kid data; only aggregate
 * counts per classroom.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { PrincipalOverview } from "./PrincipalOverview";
import { SchoolStudentsPanel } from "./SchoolStudentsPanel";
import { DEFAULT_ACCENT, dominantColorFromImage, darkenHex, isHex, skinStyleVars } from "@/lib/school-skin";
import { useHref } from "@/lib/href";
import { LANGUAGES } from "@/lib/i18n";
import { db } from "@/lib/firebase";
import type { Classroom, School } from "@/lib/school";
import {
  ALLOWED_LOGO_MIMES,
  CLASSROOM_COLORS,
  MAX_LOGO_BYTES,
  classroomColorFor,
} from "@/lib/school";

const COPY: Record<string, {
  title: string;
  sub: string;
  schoolNameLabel: string;
  schoolNamePh: string;
  logoLabel: string;
  logoCta: string;
  logoReplace: string;
  logoTooBig: string;
  logoBadType: string;
  logoUploading: string;
  classroomsHeading: string;
  tabOverview: string;
  tabClassrooms: string;
  tabStudents: string;
  tabSettings: string;
  settingsHeading: string;
  langLabel: string;
  addClassroom: string;
  classroomNameLabel: string;
  classroomNamePh: string;
  teacherNameLabel: string;
  teacherNamePh: string;
  colorLabel: string;
  empty: string;
  open: string;
  codeLabel: string;
  wordsLabel: string;
  editAria: string;
  deleteAria: string;
  copyLinkAria: string;
  copiedBadge: string;
  deleteConfirm: string;
  saveBtn: string;
  cancelBtn: string;
  notReady: string;
  goPricing: string;
  welcome: string;
  back: string;
  saving: string;
  creating: string;
  studentsLabel: string;
  studentsHelp: string;
  studentsPh: string;
  studentsCount: (n: number) => string;
}> = {
  he: {
    title: "בית הספר שלך",
    sub: "כיתות, קודים, ומה הילדים חיפשו היום.",
    schoolNameLabel: "שם בית הספר",
    schoolNamePh: "בית הספר היסודי שלי",
    logoLabel: "לוגו בית הספר",
    logoCta: "העלאת לוגו",
    logoReplace: "החלפת לוגו",
    logoTooBig: "הלוגו גדול מדי. עד 500KB.",
    logoBadType: "רק קבצי PNG או JPG.",
    logoUploading: "מעלה...",
    classroomsHeading: "כיתות",
    tabOverview: "מבט על",
    tabClassrooms: "כיתות",
    tabStudents: "תלמידים",
    tabSettings: "הגדרות",
    settingsHeading: "הגדרות בית הספר",
    langLabel: "שפת הממשק",
    addClassroom: "+ הוספת כיתה",
    classroomNameLabel: "שם הכיתה",
    classroomNamePh: "ז'1",
    teacherNameLabel: "שם המחנכת (אופציונלי)",
    teacherNamePh: "שרה כהן",
    colorLabel: "צבע הכיתה",
    empty: "עדיין לא הוספתם כיתות. הוסיפו את הראשונה.",
    open: "פתח",
    codeLabel: "קוד",
    wordsLabel: "מילים",
    editAria: "עריכת הכיתה",
    deleteAria: "מחיקת כיתה",
    copyLinkAria: "העתקת לינק לכיתה",
    copiedBadge: "הועתק",
    deleteConfirm: "למחוק את הכיתה הזו לתמיד? כל היסטוריית החיפושים שלה תאבד.",
    saveBtn: "שמירה",
    cancelBtn: "ביטול",
    notReady: "כדי לנהל בית ספר אתם צריכים את מנוי Schools.",
    goPricing: "לתמחור",
    welcome: "ברוכים הבאים ל-Schools! הוסיפו כיתה ראשונה כדי להתחיל.",
    back: "→ חזרה",
    saving: "שומר...",
    creating: "יוצר...",
    studentsLabel: "רשימת תלמידים (אופציונלי)",
    studentsHelp: "שורה אחת לכל ילד, רק שם פרטי. הילדים יבחרו את שמם לפני החיפוש כדי שתדעו מי חיפש מה.",
    studentsPh: "רותם\nיואב\nמיה\nנעם",
    studentsCount: (n) => n === 0 ? "ללא רשימה" : n === 1 ? "תלמיד אחד" : `${n} תלמידים`,
  },
  en: {
    title: "Your School",
    sub: "Classrooms, codes, and what the kids looked up today.",
    schoolNameLabel: "School name",
    schoolNamePh: "My Elementary School",
    logoLabel: "School logo",
    logoCta: "Upload logo",
    logoReplace: "Replace logo",
    logoTooBig: "Logo too big. Max 500KB.",
    logoBadType: "PNG or JPG only.",
    logoUploading: "Uploading…",
    classroomsHeading: "Classrooms",
    tabOverview: "Overview",
    tabClassrooms: "Classrooms",
    tabStudents: "Students",
    tabSettings: "Settings",
    settingsHeading: "School settings",
    langLabel: "Interface language",
    addClassroom: "+ Add classroom",
    classroomNameLabel: "Classroom name",
    classroomNamePh: "7B",
    teacherNameLabel: "Teacher's name (optional)",
    teacherNamePh: "Sara Cohen",
    colorLabel: "Classroom color",
    empty: "No classrooms yet. Add your first.",
    open: "Open",
    codeLabel: "Code",
    wordsLabel: "words",
    editAria: "Edit classroom",
    deleteAria: "Delete classroom",
    copyLinkAria: "Copy class link",
    copiedBadge: "Copied",
    deleteConfirm: "Delete this classroom forever? All its search history will be lost.",
    saveBtn: "Save",
    cancelBtn: "Cancel",
    notReady: "Schools subscription is required to manage classrooms.",
    goPricing: "See pricing",
    welcome: "Welcome to Schools! Add your first classroom to get started.",
    back: "← Back",
    saving: "Saving…",
    creating: "Creating…",
    studentsLabel: "Student roster (optional)",
    studentsHelp: "One name per line, first names only. Kids pick their name before searching so you see who looked up what.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "No roster" : n === 1 ? "1 student" : `${n} students`,
  },
  zu: {
    title: "Isikole Sakho",
    sub: "Amakilasi, amakhodi, nalokho izingane ezikubhekile namuhla.",
    schoolNameLabel: "Igama lesikole",
    schoolNamePh: "Isikole Sami Samabanga Aphansi",
    logoLabel: "Ilogo yesikole",
    logoCta: "Layisha ilogo",
    logoReplace: "Shintsha ilogo",
    logoTooBig: "Ilogo inkulu kakhulu. Ubukhulu obungeqi 500KB.",
    logoBadType: "I-PNG noma i-JPG kuphela.",
    logoUploading: "Iyalayisha…",
    classroomsHeading: "Amakilasi",
    tabOverview: "Ukubuka konke",
    tabClassrooms: "Amakilasi",
    tabStudents: "Abafundi",
    tabSettings: "Izilungiselelo",
    settingsHeading: "Izilungiselelo zesikole",
    langLabel: "Ulimi lwesixhumanisi",
    addClassroom: "+ Engeza ikilasi",
    classroomNameLabel: "Igama lekilasi",
    classroomNamePh: "7B",
    teacherNameLabel: "Igama likathisha (akuphoqelekile)",
    teacherNamePh: "Sara Cohen",
    colorLabel: "Umbala wekilasi",
    empty: "Awekho amakilasi okwamanje. Engeza elakho lokuqala.",
    open: "Vula",
    codeLabel: "Ikhodi",
    wordsLabel: "amagama",
    editAria: "Hlela ikilasi",
    deleteAria: "Susa ikilasi",
    copyLinkAria: "Kopisha isixhumanisi sezingane",
    copiedBadge: "Kukopishiwe",
    deleteConfirm: "Susa leli kilasi unomphelo? Wonke umlando walo wokusesha uzolahleka.",
    saveBtn: "Londoloza",
    cancelBtn: "Khansela",
    notReady: "Kudingeka ukubhalisa kwe-Schools ukuze uphathe amakilasi.",
    goPricing: "Buka amanani",
    welcome: "Siyakwamukela ku-Schools! Engeza ikilasi lakho lokuqala ukuze uqale.",
    back: "← Emuva",
    saving: "Iyalondoloza…",
    creating: "Iyadala…",
    studentsLabel: "Uhlu lwabafundi (akuphoqelekile)",
    studentsHelp: "Igama elilodwa emugqeni ngamunye, amagama okuqala kuphela. Izingane zikhetha igama lazo ngaphambi kokusesha ukuze ubone ukuthi ubani obheke ini.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Alukho uhlu" : n === 1 ? "Umfundi oyedwa" : `Abafundi abangu-${n}`,
  },
  el: {
    title: "Το σχολείο σας",
    sub: "Τάξεις, κωδικοί, και τι αναζήτησαν τα παιδιά σήμερα.",
    schoolNameLabel: "Όνομα σχολείου",
    schoolNamePh: "Το δημοτικό μου σχολείο",
    logoLabel: "Λογότυπο σχολείου",
    logoCta: "Μεταφόρτωση λογότυπου",
    logoReplace: "Αντικατάσταση λογότυπου",
    logoTooBig: "Το λογότυπο είναι πολύ μεγάλο. Έως 500KB.",
    logoBadType: "Μόνο PNG ή JPG.",
    logoUploading: "Μεταφόρτωση…",
    classroomsHeading: "Τάξεις",
    tabOverview: "Επισκόπηση",
    tabClassrooms: "Τάξεις",
    tabStudents: "Μαθητές",
    tabSettings: "Ρυθμίσεις",
    settingsHeading: "Ρυθμίσεις σχολείου",
    langLabel: "Γλώσσα διεπαφής",
    addClassroom: "+ Προσθήκη τάξης",
    classroomNameLabel: "Όνομα τάξης",
    classroomNamePh: "7B",
    teacherNameLabel: "Όνομα εκπαιδευτικού (προαιρετικό)",
    teacherNamePh: "Σάρα Κοέν",
    colorLabel: "Χρώμα τάξης",
    empty: "Δεν υπάρχουν τάξεις ακόμη. Προσθέστε την πρώτη σας.",
    open: "Άνοιγμα",
    codeLabel: "Κωδικός",
    wordsLabel: "λέξεις",
    editAria: "Επεξεργασία τάξης",
    deleteAria: "Διαγραφή τάξης",
    copyLinkAria: "Αντιγραφή συνδέσμου για τα παιδιά",
    copiedBadge: "Αντιγράφηκε",
    deleteConfirm: "Οριστική διαγραφή αυτής της τάξης; Όλο το ιστορικό αναζητήσεων θα χαθεί.",
    saveBtn: "Αποθήκευση",
    cancelBtn: "Ακύρωση",
    notReady: "Απαιτείται συνδρομή Schools για τη διαχείριση τάξεων.",
    goPricing: "Δείτε τις τιμές",
    welcome: "Καλώς ήρθατε στο Schools! Προσθέστε την πρώτη σας τάξη για να ξεκινήσετε.",
    back: "← Πίσω",
    saving: "Αποθήκευση…",
    creating: "Δημιουργία…",
    studentsLabel: "Κατάλογος μαθητών (προαιρετικό)",
    studentsHelp: "Ένα όνομα ανά γραμμή, μόνο μικρά ονόματα. Τα παιδιά επιλέγουν το όνομά τους πριν την αναζήτηση, ώστε να βλέπετε ποιος αναζήτησε τι.",
    studentsPh: "Γιώργος\nΜαρία\nΝίκος\nΕλένη",
    studentsCount: (n) => n === 0 ? "Χωρίς κατάλογο" : n === 1 ? "1 μαθητής" : `${n} μαθητές`,
  },
  hi: {
    title: "आपका स्कूल",
    sub: "कक्षाएँ, कोड, और बच्चों ने आज क्या खोजा।",
    schoolNameLabel: "स्कूल का नाम",
    schoolNamePh: "मेरा प्राथमिक स्कूल",
    logoLabel: "स्कूल का लोगो",
    logoCta: "लोगो अपलोड करें",
    logoReplace: "लोगो बदलें",
    logoTooBig: "लोगो बहुत बड़ा है। अधिकतम 500KB।",
    logoBadType: "केवल PNG या JPG।",
    logoUploading: "अपलोड हो रहा है…",
    classroomsHeading: "कक्षाएँ",
    tabOverview: "अवलोकन",
    tabClassrooms: "कक्षाएँ",
    tabStudents: "छात्र",
    tabSettings: "सेटिंग्स",
    settingsHeading: "स्कूल सेटिंग्स",
    langLabel: "इंटरफ़ेस भाषा",
    addClassroom: "+ कक्षा जोड़ें",
    classroomNameLabel: "कक्षा का नाम",
    classroomNamePh: "7B",
    teacherNameLabel: "शिक्षक का नाम (वैकल्पिक)",
    teacherNamePh: "सारा कोहेन",
    colorLabel: "कक्षा का रंग",
    empty: "अभी कोई कक्षा नहीं। पहली जोड़ें।",
    open: "खोलें",
    codeLabel: "कोड",
    wordsLabel: "शब्द",
    editAria: "कक्षा संपादित करें",
    deleteAria: "कक्षा हटाएँ",
    copyLinkAria: "बच्चों का लिंक कॉपी करें",
    copiedBadge: "कॉपी हो गया",
    deleteConfirm: "इस कक्षा को हमेशा के लिए हटाएँ? सारा खोज इतिहास खो जाएगा।",
    saveBtn: "सहेजें",
    cancelBtn: "रद्द करें",
    notReady: "कक्षाएँ प्रबंधित करने के लिए Schools सब्सक्रिप्शन ज़रूरी है।",
    goPricing: "क़ीमत देखें",
    welcome: "Schools में स्वागत है! शुरू करने के लिए पहली कक्षा जोड़ें।",
    back: "← वापस",
    saving: "सहेजा जा रहा है…",
    creating: "बनाया जा रहा है…",
    studentsLabel: "छात्रों की सूची (वैकल्पिक)",
    studentsHelp: "प्रति पंक्ति एक नाम, केवल पहला नाम। बच्चे खोज से पहले अपना नाम चुनेंगे, इससे आप देख सकेंगे कि किसने क्या खोजा।",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "कोई सूची नहीं" : n === 1 ? "1 छात्र" : `${n} छात्र`,
  },
  am: {
    title: "የእርስዎ ትምህርት ቤት",
    sub: "ክፍሎች፣ ኮዶች፣ እና ልጆቹ ዛሬ የፈለጓቸው ቃላት።",
    schoolNameLabel: "የትምህርት ቤቱ ስም",
    schoolNamePh: "የእኔ አንደኛ ደረጃ ትምህርት ቤት",
    logoLabel: "የትምህርት ቤቱ አርማ",
    logoCta: "አርማ ይስቀሉ",
    logoReplace: "አርማ ይቀይሩ",
    logoTooBig: "አርማው በጣም ትልቅ ነው። ቢበዛ 500KB።",
    logoBadType: "PNG ወይም JPG ብቻ።",
    logoUploading: "በመስቀል ላይ…",
    classroomsHeading: "ክፍሎች",
    tabOverview: "አጠቃላይ እይታ",
    tabClassrooms: "ክፍሎች",
    tabStudents: "ተማሪዎች",
    tabSettings: "ቅንብሮች",
    settingsHeading: "የትምህርት ቤት ቅንብሮች",
    langLabel: "የገጽታ ቋንቋ",
    addClassroom: "+ ክፍል ጨምር",
    classroomNameLabel: "የክፍሉ ስም",
    classroomNamePh: "7ለ",
    teacherNameLabel: "የመምህሩ ስም (አማራጭ)",
    teacherNamePh: "ሳራ ኮሄን",
    colorLabel: "የክፍሉ ቀለም",
    empty: "እስካሁን ክፍል የለም። የመጀመሪያውን ይጨምሩ።",
    open: "ክፈት",
    codeLabel: "ኮድ",
    wordsLabel: "ቃላት",
    editAria: "ክፍሉን አርትዕ",
    deleteAria: "ክፍሉን ሰርዝ",
    copyLinkAria: "የልጆቹን ሊንክ ቅዳ",
    copiedBadge: "ተቀድቷል",
    deleteConfirm: "ይህን ክፍል ለዘላለም መሰረዝ ይፈልጋሉ? ሙሉ የፍለጋ ታሪኩ ይጠፋል።",
    saveBtn: "አስቀምጥ",
    cancelBtn: "ይቅር",
    notReady: "ክፍሎችን ለማስተዳደር የ Schools ምዝገባ ያስፈልጋል።",
    goPricing: "ዋጋዎችን ይመልከቱ",
    welcome: "ወደ Schools እንኳን በደህና መጡ! ለመጀመር የመጀመሪያውን ክፍል ይጨምሩ።",
    back: "← ተመለስ",
    saving: "በማስቀመጥ ላይ…",
    creating: "በመፍጠር ላይ…",
    studentsLabel: "የተማሪዎች ዝርዝር (አማራጭ)",
    studentsHelp: "በእያንዳንዱ መስመር አንድ ስም፣ የመጀመሪያ ስም ብቻ። ልጆቹ ከመፈለጋቸው በፊት ስማቸውን ይመርጣሉ፣ ስለዚህ ማን ምን እንደፈለገ ያያሉ።",
    studentsPh: "አቤል\nሊያ\nናኦሚ\nዳዊት",
    studentsCount: (n) => n === 0 ? "ዝርዝር የለም" : n === 1 ? "1 ተማሪ" : `${n} ተማሪዎች`,
  },
  ar: {
    title: "مدرستك",
    sub: "الصفوف والرموز وما بحث عنه الأطفال اليوم.",
    schoolNameLabel: "اسم المدرسة",
    schoolNamePh: "مدرستي الابتدائية",
    logoLabel: "شعار المدرسة",
    logoCta: "رفع الشعار",
    logoReplace: "استبدال الشعار",
    logoTooBig: "الشعار كبير جدًا. الحد الأقصى 500KB.",
    logoBadType: "ملفات PNG أو JPG فقط.",
    logoUploading: "جارٍ الرفع…",
    classroomsHeading: "الصفوف",
    tabOverview: "نظرة عامة",
    tabClassrooms: "الصفوف",
    tabStudents: "الطلاب",
    tabSettings: "الإعدادات",
    settingsHeading: "إعدادات المدرسة",
    langLabel: "لغة الواجهة",
    addClassroom: "+ إضافة صف",
    classroomNameLabel: "اسم الصف",
    classroomNamePh: "7B",
    teacherNameLabel: "اسم المعلم (اختياري)",
    teacherNamePh: "سارة كوهين",
    colorLabel: "لون الصف",
    empty: "لا توجد صفوف بعد. أضف أول صف.",
    open: "فتح",
    codeLabel: "الرمز",
    wordsLabel: "كلمات",
    editAria: "تعديل الصف",
    deleteAria: "حذف الصف",
    copyLinkAria: "نسخ رابط الصف",
    copiedBadge: "تم النسخ",
    deleteConfirm: "حذف هذا الصف نهائيًا؟ سيُفقد كل سجل البحث الخاص به.",
    saveBtn: "حفظ",
    cancelBtn: "إلغاء",
    notReady: "إدارة الصفوف تتطلب اشتراك المدارس.",
    goPricing: "عرض الأسعار",
    welcome: "أهلًا بك في Gadit للمدارس! أضف أول صف للبدء.",
    back: "→ رجوع",
    saving: "جارٍ الحفظ…",
    creating: "جارٍ الإنشاء…",
    studentsLabel: "قائمة الطلاب (اختياري)",
    studentsHelp: "اسم واحد في كل سطر، الاسم الأول فقط. يختار الأطفال أسماءهم قبل البحث حتى ترى من بحث عن ماذا.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "لا توجد قائمة" : n === 1 ? "طالب واحد" : `${n} طالب`,
  },
  ru: {
    title: "Ваша школа",
    sub: "Классы, коды и то, что дети искали сегодня.",
    schoolNameLabel: "Название школы",
    schoolNamePh: "Моя начальная школа",
    logoLabel: "Логотип школы",
    logoCta: "Загрузить логотип",
    logoReplace: "Заменить логотип",
    logoTooBig: "Логотип слишком большой. Максимум 500KB.",
    logoBadType: "Только PNG или JPG.",
    logoUploading: "Загрузка…",
    classroomsHeading: "Классы",
    tabOverview: "Обзор",
    tabClassrooms: "Классы",
    tabStudents: "Ученики",
    tabSettings: "Настройки",
    settingsHeading: "Настройки школы",
    langLabel: "Язык интерфейса",
    addClassroom: "+ Добавить класс",
    classroomNameLabel: "Название класса",
    classroomNamePh: "7Б",
    teacherNameLabel: "Имя учителя (необязательно)",
    teacherNamePh: "Анна Иванова",
    colorLabel: "Цвет класса",
    empty: "Классов пока нет. Добавьте первый.",
    open: "Открыть",
    codeLabel: "Код",
    wordsLabel: "слов",
    editAria: "Изменить класс",
    deleteAria: "Удалить класс",
    copyLinkAria: "Скопировать ссылку на класс",
    copiedBadge: "Скопировано",
    deleteConfirm: "Удалить этот класс навсегда? Вся история поиска будет потеряна.",
    saveBtn: "Сохранить",
    cancelBtn: "Отмена",
    notReady: "Для управления классами нужна подписка для школ.",
    goPricing: "Посмотреть цены",
    welcome: "Добро пожаловать в Gadit для школ! Добавьте первый класс, чтобы начать.",
    back: "← Назад",
    saving: "Сохранение…",
    creating: "Создание…",
    studentsLabel: "Список учеников (необязательно)",
    studentsHelp: "Одно имя на строку, только имена. Дети выбирают своё имя перед поиском, и вы видите, кто что искал.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Нет списка" : n === 1 ? "1 ученик" : `Учеников: ${n}`,
  },
  es: {
    title: "Tu escuela",
    sub: "Aulas, códigos y lo que buscaron los niños hoy.",
    schoolNameLabel: "Nombre de la escuela",
    schoolNamePh: "Mi escuela primaria",
    logoLabel: "Logo de la escuela",
    logoCta: "Subir logo",
    logoReplace: "Cambiar logo",
    logoTooBig: "El logo es demasiado grande. Máximo 500KB.",
    logoBadType: "Solo PNG o JPG.",
    logoUploading: "Subiendo…",
    classroomsHeading: "Aulas",
    tabOverview: "Resumen",
    tabClassrooms: "Aulas",
    tabStudents: "Alumnos",
    tabSettings: "Ajustes",
    settingsHeading: "Ajustes de la escuela",
    langLabel: "Idioma de la interfaz",
    addClassroom: "+ Añadir aula",
    classroomNameLabel: "Nombre del aula",
    classroomNamePh: "7B",
    teacherNameLabel: "Nombre del docente (opcional)",
    teacherNamePh: "Sara García",
    colorLabel: "Color del aula",
    empty: "Aún no hay aulas. Añade la primera.",
    open: "Abrir",
    codeLabel: "Código",
    wordsLabel: "palabras",
    editAria: "Editar aula",
    deleteAria: "Eliminar aula",
    copyLinkAria: "Copiar enlace del aula",
    copiedBadge: "Copiado",
    deleteConfirm: "¿Eliminar esta aula para siempre? Se perderá todo su historial de búsquedas.",
    saveBtn: "Guardar",
    cancelBtn: "Cancelar",
    notReady: "Para gestionar aulas se necesita la suscripción para escuelas.",
    goPricing: "Ver precios",
    welcome: "¡Te damos la bienvenida a Gadit para escuelas! Añade tu primera aula para empezar.",
    back: "← Volver",
    saving: "Guardando…",
    creating: "Creando…",
    studentsLabel: "Lista de alumnos (opcional)",
    studentsHelp: "Un nombre por línea, solo el nombre de pila. Los niños eligen su nombre antes de buscar para que veas quién buscó qué.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Sin lista" : n === 1 ? "1 alumno" : `${n} alumnos`,
  },
  pt: {
    title: "Sua escola",
    sub: "Turmas, códigos e o que as crianças pesquisaram hoje.",
    schoolNameLabel: "Nome da escola",
    schoolNamePh: "Minha escola primária",
    logoLabel: "Logo da escola",
    logoCta: "Enviar logo",
    logoReplace: "Trocar logo",
    logoTooBig: "Logo grande demais. Máximo de 500KB.",
    logoBadType: "Apenas PNG ou JPG.",
    logoUploading: "Enviando…",
    classroomsHeading: "Turmas",
    tabOverview: "Visão geral",
    tabClassrooms: "Turmas",
    tabStudents: "Alunos",
    tabSettings: "Configurações",
    settingsHeading: "Configurações da escola",
    langLabel: "Idioma da interface",
    addClassroom: "+ Adicionar turma",
    classroomNameLabel: "Nome da turma",
    classroomNamePh: "7B",
    teacherNameLabel: "Nome do professor (opcional)",
    teacherNamePh: "Sara Silva",
    colorLabel: "Cor da turma",
    empty: "Ainda não há turmas. Adicione a primeira.",
    open: "Abrir",
    codeLabel: "Código",
    wordsLabel: "palavras",
    editAria: "Editar turma",
    deleteAria: "Excluir turma",
    copyLinkAria: "Copiar link da turma",
    copiedBadge: "Copiado",
    deleteConfirm: "Excluir esta turma para sempre? Todo o histórico de pesquisas será perdido.",
    saveBtn: "Salvar",
    cancelBtn: "Cancelar",
    notReady: "É preciso ter a assinatura para escolas para gerenciar turmas.",
    goPricing: "Ver preços",
    welcome: "Boas-vindas ao Gadit para escolas! Adicione sua primeira turma para começar.",
    back: "← Voltar",
    saving: "Salvando…",
    creating: "Criando…",
    studentsLabel: "Lista de alunos (opcional)",
    studentsHelp: "Um nome por linha, só o primeiro nome. As crianças escolhem o nome antes de pesquisar, assim você vê quem pesquisou o quê.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Sem lista" : n === 1 ? "1 aluno" : `${n} alunos`,
  },
  fr: {
    title: "Votre école",
    sub: "Classes, codes et ce que les enfants ont cherché aujourd'hui.",
    schoolNameLabel: "Nom de l'école",
    schoolNamePh: "Mon école primaire",
    logoLabel: "Logo de l'école",
    logoCta: "Importer un logo",
    logoReplace: "Remplacer le logo",
    logoTooBig: "Logo trop lourd. 500KB maximum.",
    logoBadType: "PNG ou JPG uniquement.",
    logoUploading: "Envoi…",
    classroomsHeading: "Classes",
    tabOverview: "Vue d'ensemble",
    tabClassrooms: "Classes",
    tabStudents: "Élèves",
    tabSettings: "Paramètres",
    settingsHeading: "Paramètres de l'école",
    langLabel: "Langue de l'interface",
    addClassroom: "+ Ajouter une classe",
    classroomNameLabel: "Nom de la classe",
    classroomNamePh: "CM2 B",
    teacherNameLabel: "Nom de l'enseignant (facultatif)",
    teacherNamePh: "Sarah Martin",
    colorLabel: "Couleur de la classe",
    empty: "Aucune classe pour l'instant. Ajoutez la première.",
    open: "Ouvrir",
    codeLabel: "Code",
    wordsLabel: "mots",
    editAria: "Modifier la classe",
    deleteAria: "Supprimer la classe",
    copyLinkAria: "Copier le lien de la classe",
    copiedBadge: "Copié",
    deleteConfirm: "Supprimer définitivement cette classe ? Tout son historique de recherche sera perdu.",
    saveBtn: "Enregistrer",
    cancelBtn: "Annuler",
    notReady: "Un abonnement Écoles est nécessaire pour gérer les classes.",
    goPricing: "Voir les tarifs",
    welcome: "Bienvenue dans Gadit pour les écoles ! Ajoutez votre première classe pour commencer.",
    back: "← Retour",
    saving: "Enregistrement…",
    creating: "Création…",
    studentsLabel: "Liste des élèves (facultatif)",
    studentsHelp: "Un nom par ligne, prénoms uniquement. Les enfants choisissent leur prénom avant de chercher, pour que vous sachiez qui a cherché quoi.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Aucune liste" : n === 1 ? "1 élève" : `${n} élèves`,
  },
  de: {
    title: "Ihre Schule",
    sub: "Klassen, Codes und was die Kinder heute nachgeschlagen haben.",
    schoolNameLabel: "Name der Schule",
    schoolNamePh: "Meine Grundschule",
    logoLabel: "Schullogo",
    logoCta: "Logo hochladen",
    logoReplace: "Logo ersetzen",
    logoTooBig: "Logo zu groß. Maximal 500KB.",
    logoBadType: "Nur PNG oder JPG.",
    logoUploading: "Wird hochgeladen…",
    classroomsHeading: "Klassen",
    tabOverview: "Übersicht",
    tabClassrooms: "Klassen",
    tabStudents: "Schüler",
    tabSettings: "Einstellungen",
    settingsHeading: "Schuleinstellungen",
    langLabel: "Sprache der Oberfläche",
    addClassroom: "+ Klasse hinzufügen",
    classroomNameLabel: "Name der Klasse",
    classroomNamePh: "7B",
    teacherNameLabel: "Name der Lehrkraft (optional)",
    teacherNamePh: "Sara Müller",
    colorLabel: "Farbe der Klasse",
    empty: "Noch keine Klassen. Legen Sie die erste an.",
    open: "Öffnen",
    codeLabel: "Code",
    wordsLabel: "Wörter",
    editAria: "Klasse bearbeiten",
    deleteAria: "Klasse löschen",
    copyLinkAria: "Klassenlink kopieren",
    copiedBadge: "Kopiert",
    deleteConfirm: "Diese Klasse endgültig löschen? Der gesamte Suchverlauf geht verloren.",
    saveBtn: "Speichern",
    cancelBtn: "Abbrechen",
    notReady: "Zum Verwalten von Klassen ist ein Schul-Abo nötig.",
    goPricing: "Preise ansehen",
    welcome: "Willkommen bei Gadit für Schulen! Legen Sie Ihre erste Klasse an, um loszulegen.",
    back: "← Zurück",
    saving: "Wird gespeichert…",
    creating: "Wird erstellt…",
    studentsLabel: "Klassenliste (optional)",
    studentsHelp: "Ein Name pro Zeile, nur Vornamen. Die Kinder wählen vor der Suche ihren Namen, so sehen Sie, wer was nachgeschlagen hat.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Keine Liste" : n === 1 ? "1 Kind" : `${n} Kinder`,
  },
  cs: {
    title: "Vaše škola",
    sub: "Třídy, kódy a co děti dnes hledaly.",
    schoolNameLabel: "Název školy",
    schoolNamePh: "Moje základní škola",
    logoLabel: "Logo školy",
    logoCta: "Nahrát logo",
    logoReplace: "Nahradit logo",
    logoTooBig: "Logo je příliš velké. Maximálně 500KB.",
    logoBadType: "Pouze PNG nebo JPG.",
    logoUploading: "Nahrávání…",
    classroomsHeading: "Třídy",
    tabOverview: "Přehled",
    tabClassrooms: "Třídy",
    tabStudents: "Žáci",
    tabSettings: "Nastavení",
    settingsHeading: "Nastavení školy",
    langLabel: "Jazyk rozhraní",
    addClassroom: "+ Přidat třídu",
    classroomNameLabel: "Název třídy",
    classroomNamePh: "7.B",
    teacherNameLabel: "Jméno učitele (nepovinné)",
    teacherNamePh: "Jana Nováková",
    colorLabel: "Barva třídy",
    empty: "Zatím žádné třídy. Přidejte první.",
    open: "Otevřít",
    codeLabel: "Kód",
    wordsLabel: "slov",
    editAria: "Upravit třídu",
    deleteAria: "Smazat třídu",
    copyLinkAria: "Kopírovat odkaz na třídu",
    copiedBadge: "Zkopírováno",
    deleteConfirm: "Smazat tuto třídu natrvalo? Celá historie vyhledávání bude ztracena.",
    saveBtn: "Uložit",
    cancelBtn: "Zrušit",
    notReady: "Ke správě tříd je potřeba předplatné pro školy.",
    goPricing: "Zobrazit ceny",
    welcome: "Vítejte v Gadit pro školy! Začněte přidáním první třídy.",
    back: "← Zpět",
    saving: "Ukládání…",
    creating: "Vytváření…",
    studentsLabel: "Seznam žáků (nepovinné)",
    studentsHelp: "Jedno jméno na řádek, jen křestní jména. Děti si před hledáním vyberou své jméno, takže uvidíte, kdo co hledal.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Bez seznamu" : n === 1 ? "1 žák" : `Žáků: ${n}`,
  },
  sk: {
    title: "Vaša škola",
    sub: "Triedy, kódy a čo deti dnes hľadali.",
    schoolNameLabel: "Názov školy",
    schoolNamePh: "Moja základná škola",
    logoLabel: "Logo školy",
    logoCta: "Nahrať logo",
    logoReplace: "Nahradiť logo",
    logoTooBig: "Logo je príliš veľké. Maximálne 500KB.",
    logoBadType: "Iba PNG alebo JPG.",
    logoUploading: "Nahráva sa…",
    classroomsHeading: "Triedy",
    tabOverview: "Prehľad",
    tabClassrooms: "Triedy",
    tabStudents: "Žiaci",
    tabSettings: "Nastavenia",
    settingsHeading: "Nastavenia školy",
    langLabel: "Jazyk rozhrania",
    addClassroom: "+ Pridať triedu",
    classroomNameLabel: "Názov triedy",
    classroomNamePh: "7.B",
    teacherNameLabel: "Meno učiteľa (nepovinné)",
    teacherNamePh: "Jana Nováková",
    colorLabel: "Farba triedy",
    empty: "Zatiaľ žiadne triedy. Pridajte prvú.",
    open: "Otvoriť",
    codeLabel: "Kód",
    wordsLabel: "slov",
    editAria: "Upraviť triedu",
    deleteAria: "Odstrániť triedu",
    copyLinkAria: "Kopírovať odkaz na triedu",
    copiedBadge: "Skopírované",
    deleteConfirm: "Odstrániť túto triedu natrvalo? Celá história vyhľadávania sa stratí.",
    saveBtn: "Uložiť",
    cancelBtn: "Zrušiť",
    notReady: "Na správu tried je potrebné predplatné pre školy.",
    goPricing: "Zobraziť ceny",
    welcome: "Vitajte v Gadit pre školy! Začnite pridaním prvej triedy.",
    back: "← Späť",
    saving: "Ukladá sa…",
    creating: "Vytvára sa…",
    studentsLabel: "Zoznam žiakov (nepovinné)",
    studentsHelp: "Jedno meno na riadok, iba krstné mená. Deti si pred hľadaním vyberú svoje meno, takže uvidíte, kto čo hľadal.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Bez zoznamu" : n === 1 ? "1 žiak" : `Žiakov: ${n}`,
  },
  it: {
    title: "La tua scuola",
    sub: "Classi, codici e cosa hanno cercato oggi i bambini.",
    schoolNameLabel: "Nome della scuola",
    schoolNamePh: "La mia scuola primaria",
    logoLabel: "Logo della scuola",
    logoCta: "Carica logo",
    logoReplace: "Sostituisci logo",
    logoTooBig: "Logo troppo grande. Massimo 500KB.",
    logoBadType: "Solo PNG o JPG.",
    logoUploading: "Caricamento…",
    classroomsHeading: "Classi",
    tabOverview: "Panoramica",
    tabClassrooms: "Classi",
    tabStudents: "Studenti",
    tabSettings: "Impostazioni",
    settingsHeading: "Impostazioni della scuola",
    langLabel: "Lingua dell'interfaccia",
    addClassroom: "+ Aggiungi classe",
    classroomNameLabel: "Nome della classe",
    classroomNamePh: "2B",
    teacherNameLabel: "Nome dell'insegnante (facoltativo)",
    teacherNamePh: "Sara Rossi",
    colorLabel: "Colore della classe",
    empty: "Ancora nessuna classe. Aggiungi la prima.",
    open: "Apri",
    codeLabel: "Codice",
    wordsLabel: "parole",
    editAria: "Modifica classe",
    deleteAria: "Elimina classe",
    copyLinkAria: "Copia link della classe",
    copiedBadge: "Copiato",
    deleteConfirm: "Eliminare questa classe per sempre? Tutta la cronologia delle ricerche andrà persa.",
    saveBtn: "Salva",
    cancelBtn: "Annulla",
    notReady: "Per gestire le classi serve l'abbonamento per le scuole.",
    goPricing: "Vedi i prezzi",
    welcome: "Benvenuti in Gadit per le scuole! Aggiungi la prima classe per iniziare.",
    back: "← Indietro",
    saving: "Salvataggio…",
    creating: "Creazione…",
    studentsLabel: "Elenco studenti (facoltativo)",
    studentsHelp: "Un nome per riga, solo il nome di battesimo. I bambini scelgono il proprio nome prima di cercare, così vedi chi ha cercato cosa.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Nessun elenco" : n === 1 ? "1 studente" : `${n} studenti`,
  },
  ja: {
    title: "あなたの学校",
    sub: "クラス、コード、そして今日子どもたちが調べたこと。",
    schoolNameLabel: "学校名",
    schoolNamePh: "〇〇小学校",
    logoLabel: "学校のロゴ",
    logoCta: "ロゴをアップロード",
    logoReplace: "ロゴを変更",
    logoTooBig: "ロゴが大きすぎます。500KB までです。",
    logoBadType: "PNG または JPG のみ。",
    logoUploading: "アップロード中…",
    classroomsHeading: "クラス",
    tabOverview: "概要",
    tabClassrooms: "クラス",
    tabStudents: "生徒",
    tabSettings: "設定",
    settingsHeading: "学校の設定",
    langLabel: "表示言語",
    addClassroom: "+ クラスを追加",
    classroomNameLabel: "クラス名",
    classroomNamePh: "3年B組",
    teacherNameLabel: "担任の名前 (任意)",
    teacherNamePh: "佐藤 さくら",
    colorLabel: "クラスの色",
    empty: "まだクラスがありません。最初のクラスを追加しましょう。",
    open: "開く",
    codeLabel: "コード",
    wordsLabel: "語",
    editAria: "クラスを編集",
    deleteAria: "クラスを削除",
    copyLinkAria: "クラスのリンクをコピー",
    copiedBadge: "コピーしました",
    deleteConfirm: "このクラスを完全に削除しますか？検索履歴はすべて失われます。",
    saveBtn: "保存",
    cancelBtn: "キャンセル",
    notReady: "クラスを管理するには学校向けプランが必要です。",
    goPricing: "料金を見る",
    welcome: "学校向け Gadit へようこそ！まずは最初のクラスを追加しましょう。",
    back: "← 戻る",
    saving: "保存中…",
    creating: "作成中…",
    studentsLabel: "生徒名簿 (任意)",
    studentsHelp: "1行に1人、下の名前のみ。子どもたちは検索前に自分の名前を選ぶので、誰が何を調べたかがわかります。",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "名簿なし" : n === 1 ? "生徒 1 人" : `生徒 ${n} 人`,
  },
  uk: {
    title: "Ваша школа",
    sub: "Класи, коди й те, що діти шукали сьогодні.",
    schoolNameLabel: "Назва школи",
    schoolNamePh: "Моя початкова школа",
    logoLabel: "Логотип школи",
    logoCta: "Завантажити логотип",
    logoReplace: "Замінити логотип",
    logoTooBig: "Логотип завеликий. Максимум 500KB.",
    logoBadType: "Лише PNG або JPG.",
    logoUploading: "Завантаження…",
    classroomsHeading: "Класи",
    tabOverview: "Огляд",
    tabClassrooms: "Класи",
    tabStudents: "Учні",
    tabSettings: "Налаштування",
    settingsHeading: "Налаштування школи",
    langLabel: "Мова інтерфейсу",
    addClassroom: "+ Додати клас",
    classroomNameLabel: "Назва класу",
    classroomNamePh: "7-Б",
    teacherNameLabel: "Ім'я вчителя (необов'язково)",
    teacherNamePh: "Олена Коваленко",
    colorLabel: "Колір класу",
    empty: "Класів поки немає. Додайте перший.",
    open: "Відкрити",
    codeLabel: "Код",
    wordsLabel: "слів",
    editAria: "Редагувати клас",
    deleteAria: "Видалити клас",
    copyLinkAria: "Скопіювати посилання на клас",
    copiedBadge: "Скопійовано",
    deleteConfirm: "Видалити цей клас назавжди? Уся історія пошуку буде втрачена.",
    saveBtn: "Зберегти",
    cancelBtn: "Скасувати",
    notReady: "Щоб керувати класами, потрібна підписка для шкіл.",
    goPricing: "Переглянути ціни",
    welcome: "Вітаємо в Gadit для шкіл! Додайте перший клас, щоб почати.",
    back: "← Назад",
    saving: "Збереження…",
    creating: "Створення…",
    studentsLabel: "Список учнів (необов'язково)",
    studentsHelp: "Одне ім'я на рядок, лише імена. Діти обирають своє ім'я перед пошуком, тож ви бачите, хто що шукав.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Немає списку" : n === 1 ? "1 учень" : `Учнів: ${n}`,
  },
  tr: {
    title: "Okulunuz",
    sub: "Sınıflar, kodlar ve çocukların bugün aradıkları.",
    schoolNameLabel: "Okul adı",
    schoolNamePh: "İlkokulum",
    logoLabel: "Okul logosu",
    logoCta: "Logo yükle",
    logoReplace: "Logoyu değiştir",
    logoTooBig: "Logo çok büyük. En fazla 500KB.",
    logoBadType: "Yalnızca PNG veya JPG.",
    logoUploading: "Yükleniyor…",
    classroomsHeading: "Sınıflar",
    tabOverview: "Genel bakış",
    tabClassrooms: "Sınıflar",
    tabStudents: "Öğrenciler",
    tabSettings: "Ayarlar",
    settingsHeading: "Okul ayarları",
    langLabel: "Arayüz dili",
    addClassroom: "+ Sınıf ekle",
    classroomNameLabel: "Sınıf adı",
    classroomNamePh: "7-B",
    teacherNameLabel: "Öğretmen adı (isteğe bağlı)",
    teacherNamePh: "Ayşe Yılmaz",
    colorLabel: "Sınıf rengi",
    empty: "Henüz sınıf yok. İlkini ekleyin.",
    open: "Aç",
    codeLabel: "Kod",
    wordsLabel: "kelime",
    editAria: "Sınıfı düzenle",
    deleteAria: "Sınıfı sil",
    copyLinkAria: "Sınıf bağlantısını kopyala",
    copiedBadge: "Kopyalandı",
    deleteConfirm: "Bu sınıf kalıcı olarak silinsin mi? Tüm arama geçmişi kaybolacak.",
    saveBtn: "Kaydet",
    cancelBtn: "İptal",
    notReady: "Sınıfları yönetmek için okul aboneliği gerekir.",
    goPricing: "Fiyatları gör",
    welcome: "Okullar için Gadit uygulamasına hoş geldiniz! Başlamak için ilk sınıfınızı ekleyin.",
    back: "← Geri",
    saving: "Kaydediliyor…",
    creating: "Oluşturuluyor…",
    studentsLabel: "Öğrenci listesi (isteğe bağlı)",
    studentsHelp: "Her satıra bir ad, yalnızca ilk adlar. Çocuklar aramadan önce adlarını seçer, böylece kimin neyi aradığını görürsünüz.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Liste yok" : n === 1 ? "1 öğrenci" : `${n} öğrenci`,
  },
  pl: {
    title: "Twoja szkoła",
    sub: "Klasy, kody i to, czego dzieci szukały dzisiaj.",
    schoolNameLabel: "Nazwa szkoły",
    schoolNamePh: "Moja szkoła podstawowa",
    logoLabel: "Logo szkoły",
    logoCta: "Prześlij logo",
    logoReplace: "Zmień logo",
    logoTooBig: "Logo jest za duże. Maksymalnie 500KB.",
    logoBadType: "Tylko PNG lub JPG.",
    logoUploading: "Przesyłanie…",
    classroomsHeading: "Klasy",
    tabOverview: "Przegląd",
    tabClassrooms: "Klasy",
    tabStudents: "Uczniowie",
    tabSettings: "Ustawienia",
    settingsHeading: "Ustawienia szkoły",
    langLabel: "Język interfejsu",
    addClassroom: "+ Dodaj klasę",
    classroomNameLabel: "Nazwa klasy",
    classroomNamePh: "7B",
    teacherNameLabel: "Imię i nazwisko nauczyciela (opcjonalnie)",
    teacherNamePh: "Anna Kowalska",
    colorLabel: "Kolor klasy",
    empty: "Nie ma jeszcze klas. Dodaj pierwszą.",
    open: "Otwórz",
    codeLabel: "Kod",
    wordsLabel: "słów",
    editAria: "Edytuj klasę",
    deleteAria: "Usuń klasę",
    copyLinkAria: "Kopiuj link do klasy",
    copiedBadge: "Skopiowano",
    deleteConfirm: "Usunąć tę klasę na zawsze? Cała historia wyszukiwań zostanie utracona.",
    saveBtn: "Zapisz",
    cancelBtn: "Anuluj",
    notReady: "Do zarządzania klasami potrzebna jest subskrypcja dla szkół.",
    goPricing: "Zobacz ceny",
    welcome: "Witamy w Gadit dla szkół! Dodaj pierwszą klasę, aby zacząć.",
    back: "← Wstecz",
    saving: "Zapisywanie…",
    creating: "Tworzenie…",
    studentsLabel: "Lista uczniów (opcjonalnie)",
    studentsHelp: "Jedno imię w wierszu, tylko imiona. Dzieci wybierają swoje imię przed wyszukiwaniem, więc widzisz, kto czego szukał.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Brak listy" : n === 1 ? "1 uczeń" : `Uczniowie: ${n}`,
  },
  fa: {
    title: "مدرسه شما",
    sub: "کلاس‌ها، کدها و آنچه بچه‌ها امروز جست‌وجو کردند.",
    schoolNameLabel: "نام مدرسه",
    schoolNamePh: "دبستان من",
    logoLabel: "لوگوی مدرسه",
    logoCta: "بارگذاری لوگو",
    logoReplace: "تعویض لوگو",
    logoTooBig: "لوگو خیلی بزرگ است. حداکثر 500KB.",
    logoBadType: "فقط PNG یا JPG.",
    logoUploading: "در حال بارگذاری…",
    classroomsHeading: "کلاس‌ها",
    tabOverview: "نمای کلی",
    tabClassrooms: "کلاس‌ها",
    tabStudents: "دانش‌آموزان",
    tabSettings: "تنظیمات",
    settingsHeading: "تنظیمات مدرسه",
    langLabel: "زبان رابط کاربری",
    addClassroom: "+ افزودن کلاس",
    classroomNameLabel: "نام کلاس",
    classroomNamePh: "7B",
    teacherNameLabel: "نام معلم (اختیاری)",
    teacherNamePh: "سارا احمدی",
    colorLabel: "رنگ کلاس",
    empty: "هنوز کلاسی وجود ندارد. اولین کلاس را اضافه کنید.",
    open: "باز کردن",
    codeLabel: "کد",
    wordsLabel: "واژه",
    editAria: "ویرایش کلاس",
    deleteAria: "حذف کلاس",
    copyLinkAria: "کپی لینک کلاس",
    copiedBadge: "کپی شد",
    deleteConfirm: "این کلاس برای همیشه حذف شود؟ تمام سابقه جست‌وجوی آن از بین می‌رود.",
    saveBtn: "ذخیره",
    cancelBtn: "لغو",
    notReady: "برای مدیریت کلاس‌ها به اشتراک مدارس نیاز است.",
    goPricing: "مشاهده قیمت‌ها",
    welcome: "به Gadit برای مدارس خوش آمدید! برای شروع، اولین کلاس را اضافه کنید.",
    back: "→ بازگشت",
    saving: "در حال ذخیره…",
    creating: "در حال ساخت…",
    studentsLabel: "فهرست دانش‌آموزان (اختیاری)",
    studentsHelp: "در هر خط یک نام، فقط نام کوچک. بچه‌ها پیش از جست‌وجو نام خود را انتخاب می‌کنند تا ببینید چه کسی چه چیزی را جست‌وجو کرده است.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "بدون فهرست" : n === 1 ? "۱ دانش‌آموز" : `${n} دانش‌آموز`,
  },
  id: {
    title: "Sekolah Anda",
    sub: "Kelas, kode, dan kata yang dicari anak-anak hari ini.",
    schoolNameLabel: "Nama sekolah",
    schoolNamePh: "Sekolah Dasar Saya",
    logoLabel: "Logo sekolah",
    logoCta: "Unggah logo",
    logoReplace: "Ganti logo",
    logoTooBig: "Logo terlalu besar. Maksimal 500KB.",
    logoBadType: "Hanya PNG atau JPG.",
    logoUploading: "Mengunggah…",
    classroomsHeading: "Kelas",
    tabOverview: "Ringkasan",
    tabClassrooms: "Kelas",
    tabStudents: "Murid",
    tabSettings: "Pengaturan",
    settingsHeading: "Pengaturan sekolah",
    langLabel: "Bahasa tampilan",
    addClassroom: "+ Tambah kelas",
    classroomNameLabel: "Nama kelas",
    classroomNamePh: "7B",
    teacherNameLabel: "Nama guru (opsional)",
    teacherNamePh: "Sari Wijaya",
    colorLabel: "Warna kelas",
    empty: "Belum ada kelas. Tambahkan yang pertama.",
    open: "Buka",
    codeLabel: "Kode",
    wordsLabel: "kata",
    editAria: "Edit kelas",
    deleteAria: "Hapus kelas",
    copyLinkAria: "Salin tautan kelas",
    copiedBadge: "Tersalin",
    deleteConfirm: "Hapus kelas ini selamanya? Semua riwayat pencariannya akan hilang.",
    saveBtn: "Simpan",
    cancelBtn: "Batal",
    notReady: "Langganan untuk sekolah diperlukan untuk mengelola kelas.",
    goPricing: "Lihat harga",
    welcome: "Selamat datang di Gadit untuk sekolah! Tambahkan kelas pertama untuk memulai.",
    back: "← Kembali",
    saving: "Menyimpan…",
    creating: "Membuat…",
    studentsLabel: "Daftar murid (opsional)",
    studentsHelp: "Satu nama per baris, nama depan saja. Anak-anak memilih namanya sebelum mencari, jadi Anda bisa melihat siapa mencari apa.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Tanpa daftar" : n === 1 ? "1 murid" : `${n} murid`,
  },
  nl: {
    title: "Jouw school",
    sub: "Klassen, codes en wat de kinderen vandaag hebben opgezocht.",
    schoolNameLabel: "Naam van de school",
    schoolNamePh: "Mijn basisschool",
    logoLabel: "Schoollogo",
    logoCta: "Logo uploaden",
    logoReplace: "Logo vervangen",
    logoTooBig: "Logo te groot. Maximaal 500KB.",
    logoBadType: "Alleen PNG of JPG.",
    logoUploading: "Uploaden…",
    classroomsHeading: "Klassen",
    tabOverview: "Overzicht",
    tabClassrooms: "Klassen",
    tabStudents: "Leerlingen",
    tabSettings: "Instellingen",
    settingsHeading: "Schoolinstellingen",
    langLabel: "Taal van de interface",
    addClassroom: "+ Klas toevoegen",
    classroomNameLabel: "Naam van de klas",
    classroomNamePh: "Groep 7B",
    teacherNameLabel: "Naam leerkracht (optioneel)",
    teacherNamePh: "Sara de Vries",
    colorLabel: "Kleur van de klas",
    empty: "Nog geen klassen. Voeg de eerste toe.",
    open: "Openen",
    codeLabel: "Code",
    wordsLabel: "woorden",
    editAria: "Klas bewerken",
    deleteAria: "Klas verwijderen",
    copyLinkAria: "Klaslink kopiëren",
    copiedBadge: "Gekopieerd",
    deleteConfirm: "Deze klas definitief verwijderen? De hele zoekgeschiedenis gaat verloren.",
    saveBtn: "Opslaan",
    cancelBtn: "Annuleren",
    notReady: "Voor het beheren van klassen is een abonnement voor scholen nodig.",
    goPricing: "Prijzen bekijken",
    welcome: "Welkom bij Gadit voor scholen! Voeg je eerste klas toe om te beginnen.",
    back: "← Terug",
    saving: "Opslaan…",
    creating: "Aanmaken…",
    studentsLabel: "Klassenlijst (optioneel)",
    studentsHelp: "Eén naam per regel, alleen voornamen. Kinderen kiezen hun naam voordat ze zoeken, zo zie je wie wat heeft opgezocht.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Geen lijst" : n === 1 ? "1 leerling" : `${n} leerlingen`,
  },
  vi: {
    title: "Trường của bạn",
    sub: "Các lớp, mã lớp và những gì các em đã tra hôm nay.",
    schoolNameLabel: "Tên trường",
    schoolNamePh: "Trường tiểu học của tôi",
    logoLabel: "Logo của trường",
    logoCta: "Tải logo lên",
    logoReplace: "Thay logo",
    logoTooBig: "Logo quá lớn. Tối đa 500KB.",
    logoBadType: "Chỉ PNG hoặc JPG.",
    logoUploading: "Đang tải lên…",
    classroomsHeading: "Các lớp",
    tabOverview: "Tổng quan",
    tabClassrooms: "Các lớp",
    tabStudents: "Học sinh",
    tabSettings: "Cài đặt",
    settingsHeading: "Cài đặt trường",
    langLabel: "Ngôn ngữ giao diện",
    addClassroom: "+ Thêm lớp",
    classroomNameLabel: "Tên lớp",
    classroomNamePh: "7B",
    teacherNameLabel: "Tên giáo viên (không bắt buộc)",
    teacherNamePh: "Nguyễn Thu Hà",
    colorLabel: "Màu của lớp",
    empty: "Chưa có lớp nào. Hãy thêm lớp đầu tiên.",
    open: "Mở",
    codeLabel: "Mã",
    wordsLabel: "từ",
    editAria: "Sửa lớp",
    deleteAria: "Xóa lớp",
    copyLinkAria: "Sao chép link lớp",
    copiedBadge: "Đã sao chép",
    deleteConfirm: "Xóa vĩnh viễn lớp này? Toàn bộ lịch sử tra cứu sẽ bị mất.",
    saveBtn: "Lưu",
    cancelBtn: "Hủy",
    notReady: "Cần gói dành cho trường học để quản lý các lớp.",
    goPricing: "Xem bảng giá",
    welcome: "Chào mừng đến với Gadit cho trường học! Hãy thêm lớp đầu tiên để bắt đầu.",
    back: "← Quay lại",
    saving: "Đang lưu…",
    creating: "Đang tạo…",
    studentsLabel: "Danh sách học sinh (không bắt buộc)",
    studentsHelp: "Mỗi dòng một tên, chỉ ghi tên gọi. Các em chọn tên mình trước khi tra, nhờ đó bạn biết ai đã tra từ gì.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Chưa có danh sách" : n === 1 ? "1 học sinh" : `${n} học sinh`,
  },
  fil: {
    title: "Ang Iyong Paaralan",
    sub: "Mga klase, mga code, at ang hinanap ng mga bata ngayong araw.",
    schoolNameLabel: "Pangalan ng paaralan",
    schoolNamePh: "Ang Aking Elementarya",
    logoLabel: "Logo ng paaralan",
    logoCta: "Mag-upload ng logo",
    logoReplace: "Palitan ang logo",
    logoTooBig: "Masyadong malaki ang logo. Hanggang 500KB lang.",
    logoBadType: "PNG o JPG lang.",
    logoUploading: "Nag-a-upload…",
    classroomsHeading: "Mga klase",
    tabOverview: "Pangkalahatang-tanaw",
    tabClassrooms: "Mga klase",
    tabStudents: "Mga estudyante",
    tabSettings: "Mga setting",
    settingsHeading: "Mga setting ng paaralan",
    langLabel: "Wika ng interface",
    addClassroom: "+ Magdagdag ng klase",
    classroomNameLabel: "Pangalan ng klase",
    classroomNamePh: "7B",
    teacherNameLabel: "Pangalan ng guro (opsyonal)",
    teacherNamePh: "Sara Santos",
    colorLabel: "Kulay ng klase",
    empty: "Wala pang klase. Idagdag ang una.",
    open: "Buksan",
    codeLabel: "Code",
    wordsLabel: "salita",
    editAria: "I-edit ang klase",
    deleteAria: "Burahin ang klase",
    copyLinkAria: "Kopyahin ang link ng klase",
    copiedBadge: "Nakopya",
    deleteConfirm: "Burahin nang tuluyan ang klaseng ito? Mawawala ang lahat ng kasaysayan ng paghahanap nito.",
    saveBtn: "I-save",
    cancelBtn: "Kanselahin",
    notReady: "Kailangan ang subscription para sa paaralan para mapamahalaan ang mga klase.",
    goPricing: "Tingnan ang presyo",
    welcome: "Maligayang pagdating sa Gadit para sa paaralan! Magdagdag ng unang klase para magsimula.",
    back: "← Bumalik",
    saving: "Sine-save…",
    creating: "Ginagawa…",
    studentsLabel: "Listahan ng estudyante (opsyonal)",
    studentsHelp: "Isang pangalan bawat linya, unang pangalan lang. Pinipili ng mga bata ang pangalan nila bago maghanap para makita mo kung sino ang naghanap ng ano.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Walang listahan" : n === 1 ? "1 estudyante" : `${n} estudyante`,
  },
  af: {
    title: "Jou skool",
    sub: "Klasse, kodes en wat die kinders vandag opgesoek het.",
    schoolNameLabel: "Skool se naam",
    schoolNamePh: "My Laerskool",
    logoLabel: "Skoollogo",
    logoCta: "Laai logo op",
    logoReplace: "Vervang logo",
    logoTooBig: "Logo te groot. Hoogstens 500KB.",
    logoBadType: "Slegs PNG of JPG.",
    logoUploading: "Laai tans op…",
    classroomsHeading: "Klasse",
    tabOverview: "Oorsig",
    tabClassrooms: "Klasse",
    tabStudents: "Leerders",
    tabSettings: "Instellings",
    settingsHeading: "Skoolinstellings",
    langLabel: "Koppelvlaktaal",
    addClassroom: "+ Voeg klas by",
    classroomNameLabel: "Klas se naam",
    classroomNamePh: "7B",
    teacherNameLabel: "Onderwyser se naam (opsioneel)",
    teacherNamePh: "Sara van der Merwe",
    colorLabel: "Klas se kleur",
    empty: "Nog geen klasse nie. Voeg die eerste by.",
    open: "Maak oop",
    codeLabel: "Kode",
    wordsLabel: "woorde",
    editAria: "Wysig klas",
    deleteAria: "Skrap klas",
    copyLinkAria: "Kopieer klasskakel",
    copiedBadge: "Gekopieer",
    deleteConfirm: "Skrap hierdie klas vir altyd? Al sy soekgeskiedenis sal verlore gaan.",
    saveBtn: "Stoor",
    cancelBtn: "Kanselleer",
    notReady: "'n Skole-intekening is nodig om klasse te bestuur.",
    goPricing: "Sien pryse",
    welcome: "Welkom by Gadit vir skole! Voeg jou eerste klas by om te begin.",
    back: "← Terug",
    saving: "Stoor tans…",
    creating: "Skep tans…",
    studentsLabel: "Klaslys (opsioneel)",
    studentsHelp: "Een naam per reël, net voorname. Kinders kies hul naam voordat hulle soek, sodat jy sien wie wat opgesoek het.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Geen lys nie" : n === 1 ? "1 leerder" : `${n} leerders`,
  },
  sw: {
    title: "Shule Yako",
    sub: "Madarasa, misimbo, na kile watoto walichotafuta leo.",
    schoolNameLabel: "Jina la shule",
    schoolNamePh: "Shule Yangu ya Msingi",
    logoLabel: "Nembo ya shule",
    logoCta: "Pakia nembo",
    logoReplace: "Badilisha nembo",
    logoTooBig: "Nembo ni kubwa mno. Isizidi 500KB.",
    logoBadType: "PNG au JPG pekee.",
    logoUploading: "Inapakia…",
    classroomsHeading: "Madarasa",
    tabOverview: "Muhtasari",
    tabClassrooms: "Madarasa",
    tabStudents: "Wanafunzi",
    tabSettings: "Mipangilio",
    settingsHeading: "Mipangilio ya shule",
    langLabel: "Lugha ya kiolesura",
    addClassroom: "+ Ongeza darasa",
    classroomNameLabel: "Jina la darasa",
    classroomNamePh: "7B",
    teacherNameLabel: "Jina la mwalimu (si lazima)",
    teacherNamePh: "Sara Mwangi",
    colorLabel: "Rangi ya darasa",
    empty: "Bado hakuna madarasa. Ongeza la kwanza.",
    open: "Fungua",
    codeLabel: "Msimbo",
    wordsLabel: "maneno",
    editAria: "Hariri darasa",
    deleteAria: "Futa darasa",
    copyLinkAria: "Nakili kiungo cha darasa",
    copiedBadge: "Imenakiliwa",
    deleteConfirm: "Ufute darasa hili kabisa? Historia yake yote ya utafutaji itapotea.",
    saveBtn: "Hifadhi",
    cancelBtn: "Ghairi",
    notReady: "Usajili wa shule unahitajika ili kusimamia madarasa.",
    goPricing: "Tazama bei",
    welcome: "Karibu Gadit kwa shule! Ongeza darasa lako la kwanza ili kuanza.",
    back: "← Rudi",
    saving: "Inahifadhi…",
    creating: "Inaunda…",
    studentsLabel: "Orodha ya wanafunzi (si lazima)",
    studentsHelp: "Jina moja kwa kila mstari, majina ya kwanza tu. Watoto huchagua jina lao kabla ya kutafuta ili uone nani alitafuta nini.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Hakuna orodha" : n === 1 ? "Mwanafunzi 1" : `Wanafunzi ${n}`,
  },
  "zh-CN": {
    title: "你的学校",
    sub: "班级、代码，以及孩子们今天查了什么。",
    schoolNameLabel: "学校名称",
    schoolNamePh: "我的小学",
    logoLabel: "学校标志",
    logoCta: "上传标志",
    logoReplace: "更换标志",
    logoTooBig: "标志文件太大，最大 500KB。",
    logoBadType: "仅支持 PNG 或 JPG。",
    logoUploading: "上传中…",
    classroomsHeading: "班级",
    tabOverview: "概览",
    tabClassrooms: "班级",
    tabStudents: "学生",
    tabSettings: "设置",
    settingsHeading: "学校设置",
    langLabel: "界面语言",
    addClassroom: "+ 添加班级",
    classroomNameLabel: "班级名称",
    classroomNamePh: "七年级2班",
    teacherNameLabel: "教师姓名 (可选)",
    teacherNamePh: "王老师",
    colorLabel: "班级颜色",
    empty: "还没有班级，添加第一个吧。",
    open: "打开",
    codeLabel: "代码",
    wordsLabel: "个单词",
    editAria: "编辑班级",
    deleteAria: "删除班级",
    copyLinkAria: "复制班级链接",
    copiedBadge: "已复制",
    deleteConfirm: "要永久删除这个班级吗？所有查询记录都会丢失。",
    saveBtn: "保存",
    cancelBtn: "取消",
    notReady: "需要学校订阅才能管理班级。",
    goPricing: "查看价格",
    welcome: "欢迎使用 Gadit 学校版！添加第一个班级即可开始。",
    back: "← 返回",
    saving: "保存中…",
    creating: "创建中…",
    studentsLabel: "学生名单 (可选)",
    studentsHelp: "每行一个名字，只写名。孩子们查询前先选自己的名字，这样你就能看到谁查了什么。",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "暂无名单" : n === 1 ? "1 名学生" : `${n} 名学生`,
  },
  "zh-TW": {
    title: "你的學校",
    sub: "班級、代碼，以及孩子們今天查了什麼。",
    schoolNameLabel: "學校名稱",
    schoolNamePh: "我的國小",
    logoLabel: "學校標誌",
    logoCta: "上傳標誌",
    logoReplace: "更換標誌",
    logoTooBig: "標誌檔案太大，最大 500KB。",
    logoBadType: "僅支援 PNG 或 JPG。",
    logoUploading: "上傳中…",
    classroomsHeading: "班級",
    tabOverview: "總覽",
    tabClassrooms: "班級",
    tabStudents: "學生",
    tabSettings: "設定",
    settingsHeading: "學校設定",
    langLabel: "介面語言",
    addClassroom: "+ 新增班級",
    classroomNameLabel: "班級名稱",
    classroomNamePh: "七年二班",
    teacherNameLabel: "教師姓名 (選填)",
    teacherNamePh: "王老師",
    colorLabel: "班級顏色",
    empty: "還沒有班級，新增第一個吧。",
    open: "開啟",
    codeLabel: "代碼",
    wordsLabel: "個單字",
    editAria: "編輯班級",
    deleteAria: "刪除班級",
    copyLinkAria: "複製班級連結",
    copiedBadge: "已複製",
    deleteConfirm: "要永久刪除這個班級嗎？所有查詢紀錄都會遺失。",
    saveBtn: "儲存",
    cancelBtn: "取消",
    notReady: "需要學校訂閱才能管理班級。",
    goPricing: "查看價格",
    welcome: "歡迎使用 Gadit 學校版！新增第一個班級即可開始。",
    back: "← 返回",
    saving: "儲存中…",
    creating: "建立中…",
    studentsLabel: "學生名單 (選填)",
    studentsHelp: "每行一個名字，只寫名。孩子們查詢前先選自己的名字，這樣你就能看到誰查了什麼。",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "尚無名單" : n === 1 ? "1 名學生" : `${n} 名學生`,
  },
  ko: {
    title: "우리 학교",
    sub: "학급, 코드, 그리고 오늘 아이들이 찾아본 단어.",
    schoolNameLabel: "학교 이름",
    schoolNamePh: "우리 초등학교",
    logoLabel: "학교 로고",
    logoCta: "로고 업로드",
    logoReplace: "로고 바꾸기",
    logoTooBig: "로고가 너무 큽니다. 최대 500KB.",
    logoBadType: "PNG 또는 JPG만 가능합니다.",
    logoUploading: "업로드 중…",
    classroomsHeading: "학급",
    tabOverview: "개요",
    tabClassrooms: "학급",
    tabStudents: "학생",
    tabSettings: "설정",
    settingsHeading: "학교 설정",
    langLabel: "화면 언어",
    addClassroom: "+ 학급 추가",
    classroomNameLabel: "학급 이름",
    classroomNamePh: "1학년 2반",
    teacherNameLabel: "담임 이름 (선택)",
    teacherNamePh: "김서연",
    colorLabel: "학급 색상",
    empty: "아직 학급이 없습니다. 첫 학급을 추가해 보세요.",
    open: "열기",
    codeLabel: "코드",
    wordsLabel: "단어",
    editAria: "학급 편집",
    deleteAria: "학급 삭제",
    copyLinkAria: "학급 링크 복사",
    copiedBadge: "복사됨",
    deleteConfirm: "이 학급을 영구 삭제할까요? 모든 검색 기록이 사라집니다.",
    saveBtn: "저장",
    cancelBtn: "취소",
    notReady: "학급을 관리하려면 학교 구독이 필요합니다.",
    goPricing: "요금 보기",
    welcome: "학교용 Gadit에 오신 것을 환영합니다! 첫 학급을 추가해 시작하세요.",
    back: "← 뒤로",
    saving: "저장 중…",
    creating: "만드는 중…",
    studentsLabel: "학생 명단 (선택)",
    studentsHelp: "한 줄에 한 명, 이름만 적어 주세요. 아이들이 검색 전에 자기 이름을 고르므로 누가 무엇을 찾았는지 볼 수 있습니다.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "명단 없음" : n === 1 ? "학생 1명" : `학생 ${n}명`,
  },
  th: {
    title: "โรงเรียนของคุณ",
    sub: "ห้องเรียน รหัส และคำที่เด็ก ๆ ค้นหาวันนี้",
    schoolNameLabel: "ชื่อโรงเรียน",
    schoolNamePh: "โรงเรียนประถมของฉัน",
    logoLabel: "โลโก้โรงเรียน",
    logoCta: "อัปโหลดโลโก้",
    logoReplace: "เปลี่ยนโลโก้",
    logoTooBig: "โลโก้ใหญ่เกินไป สูงสุด 500KB",
    logoBadType: "เฉพาะ PNG หรือ JPG",
    logoUploading: "กำลังอัปโหลด…",
    classroomsHeading: "ห้องเรียน",
    tabOverview: "ภาพรวม",
    tabClassrooms: "ห้องเรียน",
    tabStudents: "นักเรียน",
    tabSettings: "การตั้งค่า",
    settingsHeading: "การตั้งค่าโรงเรียน",
    langLabel: "ภาษาของหน้าจอ",
    addClassroom: "+ เพิ่มห้องเรียน",
    classroomNameLabel: "ชื่อห้องเรียน",
    classroomNamePh: "ม.1/2",
    teacherNameLabel: "ชื่อครู (ไม่บังคับ)",
    teacherNamePh: "สุดา ใจดี",
    colorLabel: "สีของห้องเรียน",
    empty: "ยังไม่มีห้องเรียน เพิ่มห้องแรกได้เลย",
    open: "เปิด",
    codeLabel: "รหัส",
    wordsLabel: "คำ",
    editAria: "แก้ไขห้องเรียน",
    deleteAria: "ลบห้องเรียน",
    copyLinkAria: "คัดลอกลิงก์ห้องเรียน",
    copiedBadge: "คัดลอกแล้ว",
    deleteConfirm: "ลบห้องเรียนนี้ถาวรหรือไม่? ประวัติการค้นหาทั้งหมดจะหายไป",
    saveBtn: "บันทึก",
    cancelBtn: "ยกเลิก",
    notReady: "ต้องมีการสมัครแพ็กเกจโรงเรียนเพื่อจัดการห้องเรียน",
    goPricing: "ดูราคา",
    welcome: "ยินดีต้อนรับสู่ Gadit สำหรับโรงเรียน! เพิ่มห้องเรียนแรกเพื่อเริ่มต้น",
    back: "← กลับ",
    saving: "กำลังบันทึก…",
    creating: "กำลังสร้าง…",
    studentsLabel: "รายชื่อนักเรียน (ไม่บังคับ)",
    studentsHelp: "หนึ่งชื่อต่อหนึ่งบรรทัด ใส่เฉพาะชื่อต้น เด็ก ๆ จะเลือกชื่อตัวเองก่อนค้นหา คุณจึงเห็นว่าใครค้นหาอะไร",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "ไม่มีรายชื่อ" : n === 1 ? "นักเรียน 1 คน" : `นักเรียน ${n} คน`,
  },
  bn: {
    title: "আপনার স্কুল",
    sub: "ক্লাস, কোড, আর আজ বাচ্চারা কী খুঁজেছে।",
    schoolNameLabel: "স্কুলের নাম",
    schoolNamePh: "আমার প্রাথমিক বিদ্যালয়",
    logoLabel: "স্কুলের লোগো",
    logoCta: "লোগো আপলোড করুন",
    logoReplace: "লোগো বদলান",
    logoTooBig: "লোগোটি খুব বড়। সর্বোচ্চ 500KB।",
    logoBadType: "শুধু PNG বা JPG।",
    logoUploading: "আপলোড হচ্ছে…",
    classroomsHeading: "ক্লাস",
    tabOverview: "সারসংক্ষেপ",
    tabClassrooms: "ক্লাস",
    tabStudents: "শিক্ষার্থী",
    tabSettings: "সেটিংস",
    settingsHeading: "স্কুলের সেটিংস",
    langLabel: "ইন্টারফেসের ভাষা",
    addClassroom: "+ ক্লাস যোগ করুন",
    classroomNameLabel: "ক্লাসের নাম",
    classroomNamePh: "7B",
    teacherNameLabel: "শিক্ষকের নাম (ঐচ্ছিক)",
    teacherNamePh: "সারা রহমান",
    colorLabel: "ক্লাসের রং",
    empty: "এখনও কোনো ক্লাস নেই। প্রথমটি যোগ করুন।",
    open: "খুলুন",
    codeLabel: "কোড",
    wordsLabel: "শব্দ",
    editAria: "ক্লাস সম্পাদনা",
    deleteAria: "ক্লাস মুছুন",
    copyLinkAria: "ক্লাসের লিংক কপি করুন",
    copiedBadge: "কপি হয়েছে",
    deleteConfirm: "এই ক্লাসটি চিরতরে মুছবেন? এর সব খোঁজের ইতিহাস হারিয়ে যাবে।",
    saveBtn: "সংরক্ষণ",
    cancelBtn: "বাতিল",
    notReady: "ক্লাস পরিচালনা করতে স্কুলের সাবস্ক্রিপশন লাগবে।",
    goPricing: "দাম দেখুন",
    welcome: "স্বাগতম! এটি স্কুলের জন্য Gadit। শুরু করতে প্রথম ক্লাসটি যোগ করুন।",
    back: "← ফিরে যান",
    saving: "সংরক্ষণ হচ্ছে…",
    creating: "তৈরি হচ্ছে…",
    studentsLabel: "শিক্ষার্থীর তালিকা (ঐচ্ছিক)",
    studentsHelp: "প্রতি লাইনে একটি নাম, শুধু প্রথম নাম। বাচ্চারা খোঁজার আগে নিজের নাম বেছে নেয়, তাই আপনি দেখতে পাবেন কে কী খুঁজেছে।",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "কোনো তালিকা নেই" : n === 1 ? "১ জন শিক্ষার্থী" : `${n} জন শিক্ষার্থী`,
  },
  da: {
    title: "Din skole",
    sub: "Klasser, koder og hvad børnene slog op i dag.",
    schoolNameLabel: "Skolens navn",
    schoolNamePh: "Min skole",
    logoLabel: "Skolens logo",
    logoCta: "Upload logo",
    logoReplace: "Udskift logo",
    logoTooBig: "Logoet er for stort. Maks. 500KB.",
    logoBadType: "Kun PNG eller JPG.",
    logoUploading: "Uploader…",
    classroomsHeading: "Klasser",
    tabOverview: "Overblik",
    tabClassrooms: "Klasser",
    tabStudents: "Elever",
    tabSettings: "Indstillinger",
    settingsHeading: "Skoleindstillinger",
    langLabel: "Sprog i brugerfladen",
    addClassroom: "+ Tilføj klasse",
    classroomNameLabel: "Klassens navn",
    classroomNamePh: "7.B",
    teacherNameLabel: "Lærerens navn (valgfrit)",
    teacherNamePh: "Sara Jensen",
    colorLabel: "Klassens farve",
    empty: "Ingen klasser endnu. Tilføj den første.",
    open: "Åbn",
    codeLabel: "Kode",
    wordsLabel: "ord",
    editAria: "Redigér klasse",
    deleteAria: "Slet klasse",
    copyLinkAria: "Kopiér klasselink",
    copiedBadge: "Kopieret",
    deleteConfirm: "Slet denne klasse for altid? Hele dens søgehistorik går tabt.",
    saveBtn: "Gem",
    cancelBtn: "Annullér",
    notReady: "Der kræves et skoleabonnement for at administrere klasser.",
    goPricing: "Se priser",
    welcome: "Velkommen til Gadit for skoler! Tilføj din første klasse for at komme i gang.",
    back: "← Tilbage",
    saving: "Gemmer…",
    creating: "Opretter…",
    studentsLabel: "Klasseliste (valgfrit)",
    studentsHelp: "Ét navn pr. linje, kun fornavne. Børnene vælger deres navn, før de søger, så du kan se, hvem der slog hvad op.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Ingen liste" : n === 1 ? "1 elev" : `${n} elever`,
  },
  hu: {
    title: "Az Ön iskolája",
    sub: "Osztályok, kódok, és hogy mit kerestek ma a gyerekek.",
    schoolNameLabel: "Az iskola neve",
    schoolNamePh: "Az én általános iskolám",
    logoLabel: "Iskolai logó",
    logoCta: "Logó feltöltése",
    logoReplace: "Logó cseréje",
    logoTooBig: "A logó túl nagy. Legfeljebb 500KB.",
    logoBadType: "Csak PNG vagy JPG.",
    logoUploading: "Feltöltés…",
    classroomsHeading: "Osztályok",
    tabOverview: "Áttekintés",
    tabClassrooms: "Osztályok",
    tabStudents: "Tanulók",
    tabSettings: "Beállítások",
    settingsHeading: "Iskolai beállítások",
    langLabel: "Felület nyelve",
    addClassroom: "+ Osztály hozzáadása",
    classroomNameLabel: "Osztály neve",
    classroomNamePh: "7.B",
    teacherNameLabel: "Tanár neve (nem kötelező)",
    teacherNamePh: "Kovács Sára",
    colorLabel: "Osztály színe",
    empty: "Még nincs osztály. Adja hozzá az elsőt.",
    open: "Megnyitás",
    codeLabel: "Kód",
    wordsLabel: "szó",
    editAria: "Osztály szerkesztése",
    deleteAria: "Osztály törlése",
    copyLinkAria: "Osztálylink másolása",
    copiedBadge: "Másolva",
    deleteConfirm: "Végleg törli ezt az osztályt? A teljes keresési előzmény elvész.",
    saveBtn: "Mentés",
    cancelBtn: "Mégse",
    notReady: "Az osztályok kezeléséhez iskolai előfizetés szükséges.",
    goPricing: "Árak megtekintése",
    welcome: "Üdvözöljük a Gadit iskolai változatában! Kezdésként adja hozzá az első osztályt.",
    back: "← Vissza",
    saving: "Mentés…",
    creating: "Létrehozás…",
    studentsLabel: "Osztálynévsor (nem kötelező)",
    studentsHelp: "Soronként egy név, csak keresztnév. A gyerekek keresés előtt kiválasztják a nevüket, így látja, ki mit keresett.",
    studentsPh: "Rotem\nYoav\nMaya\nNoam",
    studentsCount: (n) => n === 0 ? "Nincs névsor" : n === 1 ? "1 tanuló" : `${n} tanuló`,
  },
};

// Appearance (skin) copy — kept as a separate map (en fallback) so adding it
// doesn't force editing every language block of the main COPY object.
const APPEARANCE_COPY: Record<string, {
  heading: string;
  note: string;
  autoFromLogo: string;
  autoFail: string;
  presets: string;
  custom: string;
  reset: string;
  previewLabel: string;
  saving: string;
}> = {
  en: {
    heading: "Classroom appearance",
    note: "Pick an accent colour for what students see at your /c code. Match it to your logo.",
    autoFromLogo: "Auto from logo",
    autoFail: "Could not read the logo's colours. Pick one below.",
    presets: "Presets",
    custom: "Custom",
    reset: "Reset to default",
    previewLabel: "Preview",
    saving: "Saving…",
  },
  he: {
    heading: "מראה הכיתה",
    note: "בחר צבע הדגשה למה שהתלמידים רואים בקוד ה-/c שלך. אפשר להתאים ללוגו.",
    autoFromLogo: "אוטומטי מהלוגו",
    autoFail: "לא הצלחנו לקרוא את צבעי הלוגו. בחר צבע למטה.",
    presets: "צבעים מוכנים",
    custom: "מותאם אישית",
    reset: "איפוס לברירת מחדל",
    previewLabel: "תצוגה מקדימה",
    saving: "שומר…",
  },
  ar: {
    heading: "مظهر الصف",
    note: "اختر لونًا مميزًا لما يراه الطلاب عبر رمز /c الخاص بك. طابقه مع شعارك.",
    autoFromLogo: "تلقائي من الشعار",
    autoFail: "تعذّرت قراءة ألوان الشعار. اختر لونًا من الأسفل.",
    presets: "ألوان جاهزة",
    custom: "مخصص",
    reset: "استعادة الافتراضي",
    previewLabel: "معاينة",
    saving: "جارٍ الحفظ…",
  },
  ru: {
    heading: "Оформление класса",
    note: "Выберите акцентный цвет для страницы, которую ученики видят по вашему коду /c. Подберите его под логотип.",
    autoFromLogo: "Авто по логотипу",
    autoFail: "Не удалось определить цвета логотипа. Выберите цвет ниже.",
    presets: "Готовые цвета",
    custom: "Свой",
    reset: "Сбросить",
    previewLabel: "Предпросмотр",
    saving: "Сохранение…",
  },
  es: {
    heading: "Apariencia del aula",
    note: "Elige un color de acento para lo que ven los alumnos en tu código /c. Combínalo con tu logo.",
    autoFromLogo: "Automático desde el logo",
    autoFail: "No pudimos leer los colores del logo. Elige uno abajo.",
    presets: "Predefinidos",
    custom: "Personalizado",
    reset: "Restablecer",
    previewLabel: "Vista previa",
    saving: "Guardando…",
  },
  pt: {
    heading: "Aparência da turma",
    note: "Escolha uma cor de destaque para o que os alunos veem no seu código /c. Combine com o seu logo.",
    autoFromLogo: "Automático pelo logo",
    autoFail: "Não conseguimos ler as cores do logo. Escolha uma abaixo.",
    presets: "Predefinidas",
    custom: "Personalizada",
    reset: "Restaurar padrão",
    previewLabel: "Prévia",
    saving: "Salvando…",
  },
  fr: {
    heading: "Apparence de la classe",
    note: "Choisissez une couleur d'accent pour ce que les élèves voient avec votre code /c. Accordez-la à votre logo.",
    autoFromLogo: "Automatique depuis le logo",
    autoFail: "Impossible de lire les couleurs du logo. Choisissez-en une ci-dessous.",
    presets: "Préréglages",
    custom: "Personnalisé",
    reset: "Rétablir par défaut",
    previewLabel: "Aperçu",
    saving: "Enregistrement…",
  },
  de: {
    heading: "Aussehen der Klasse",
    note: "Wählen Sie eine Akzentfarbe für das, was die Kinder unter Ihrem /c Code sehen. Passend zu Ihrem Logo.",
    autoFromLogo: "Automatisch aus Logo",
    autoFail: "Die Farben des Logos konnten nicht gelesen werden. Wählen Sie unten eine Farbe.",
    presets: "Vorlagen",
    custom: "Eigene",
    reset: "Auf Standard zurücksetzen",
    previewLabel: "Vorschau",
    saving: "Wird gespeichert…",
  },
  cs: {
    heading: "Vzhled třídy",
    note: "Vyberte barvu zvýraznění pro to, co žáci vidí pod vaším kódem /c. Sladěte ji s logem.",
    autoFromLogo: "Automaticky z loga",
    autoFail: "Barvy loga se nepodařilo načíst. Vyberte barvu níže.",
    presets: "Předvolby",
    custom: "Vlastní",
    reset: "Obnovit výchozí",
    previewLabel: "Náhled",
    saving: "Ukládání…",
  },
  sk: {
    heading: "Vzhľad triedy",
    note: "Vyberte farbu zvýraznenia pre to, čo žiaci vidia pod vaším kódom /c. Zlaďte ju s logom.",
    autoFromLogo: "Automaticky z loga",
    autoFail: "Farby loga sa nepodarilo načítať. Vyberte farbu nižšie.",
    presets: "Predvoľby",
    custom: "Vlastná",
    reset: "Obnoviť predvolené",
    previewLabel: "Náhľad",
    saving: "Ukladá sa…",
  },
  it: {
    heading: "Aspetto della classe",
    note: "Scegli un colore di accento per ciò che gli studenti vedono con il tuo codice /c. Abbinalo al tuo logo.",
    autoFromLogo: "Automatico dal logo",
    autoFail: "Impossibile leggere i colori del logo. Scegline uno qui sotto.",
    presets: "Predefiniti",
    custom: "Personalizzato",
    reset: "Ripristina predefinito",
    previewLabel: "Anteprima",
    saving: "Salvataggio…",
  },
  ja: {
    heading: "クラスの見た目",
    note: "/c コードで生徒に表示される画面のアクセントカラーを選びます。ロゴに合わせましょう。",
    autoFromLogo: "ロゴから自動設定",
    autoFail: "ロゴの色を読み取れませんでした。下から選んでください。",
    presets: "プリセット",
    custom: "カスタム",
    reset: "初期設定に戻す",
    previewLabel: "プレビュー",
    saving: "保存中…",
  },
  hi: {
    heading: "कक्षा का रूप",
    note: "आपके /c कोड पर छात्रों को जो दिखता है, उसके लिए एक मुख्य रंग चुनें। इसे अपने लोगो से मिलाएँ।",
    autoFromLogo: "लोगो से अपने आप",
    autoFail: "लोगो के रंग नहीं पढ़े जा सके। नीचे से कोई रंग चुनें।",
    presets: "तैयार रंग",
    custom: "अपना रंग",
    reset: "डिफ़ॉल्ट पर लौटाएँ",
    previewLabel: "पूर्वावलोकन",
    saving: "सहेजा जा रहा है…",
  },
  am: {
    heading: "የክፍሉ ገጽታ",
    note: "ተማሪዎች በ /c ኮድዎ የሚያዩትን ገጽ የሚያጎላ ቀለም ይምረጡ። ከሎጎዎ ጋር ያዛምዱት።",
    autoFromLogo: "ከሎጎ በራስ-ሰር",
    autoFail: "የሎጎውን ቀለሞች ማንበብ አልተቻለም። ከታች አንድ ይምረጡ።",
    presets: "ዝግጁ ቀለሞች",
    custom: "የራስ ምርጫ",
    reset: "ወደ ነባሪ መልስ",
    previewLabel: "ቅድመ እይታ",
    saving: "በማስቀመጥ ላይ…",
  },
  uk: {
    heading: "Вигляд класу",
    note: "Оберіть акцентний колір для сторінки, яку учні бачать за вашим кодом /c. Підберіть його під логотип.",
    autoFromLogo: "Авто з логотипа",
    autoFail: "Не вдалося визначити кольори логотипа. Оберіть колір нижче.",
    presets: "Готові кольори",
    custom: "Власний",
    reset: "Скинути",
    previewLabel: "Попередній перегляд",
    saving: "Збереження…",
  },
  tr: {
    heading: "Sınıf görünümü",
    note: "Öğrencilerin /c kodunuzda gördüğü sayfa için bir vurgu rengi seçin. Logonuzla uyumlu olsun.",
    autoFromLogo: "Logodan otomatik",
    autoFail: "Logonun renkleri okunamadı. Aşağıdan bir renk seçin.",
    presets: "Hazır renkler",
    custom: "Özel",
    reset: "Varsayılana dön",
    previewLabel: "Önizleme",
    saving: "Kaydediliyor…",
  },
  pl: {
    heading: "Wygląd klasy",
    note: "Wybierz kolor akcentu dla tego, co uczniowie widzą pod Twoim kodem /c. Dopasuj go do logo.",
    autoFromLogo: "Automatycznie z logo",
    autoFail: "Nie udało się odczytać kolorów logo. Wybierz kolor poniżej.",
    presets: "Gotowe kolory",
    custom: "Własny",
    reset: "Przywróć domyślny",
    previewLabel: "Podgląd",
    saving: "Zapisywanie…",
  },
  fa: {
    heading: "ظاهر کلاس",
    note: "برای صفحه‌ای که دانش‌آموزان با کد /c شما می‌بینند یک رنگ تأکیدی انتخاب کنید. آن را با لوگوی خود هماهنگ کنید.",
    autoFromLogo: "خودکار از لوگو",
    autoFail: "خواندن رنگ‌های لوگو ممکن نشد. یک رنگ از پایین انتخاب کنید.",
    presets: "رنگ‌های آماده",
    custom: "سفارشی",
    reset: "بازگشت به پیش‌فرض",
    previewLabel: "پیش‌نمایش",
    saving: "در حال ذخیره…",
  },
  id: {
    heading: "Tampilan kelas",
    note: "Pilih warna aksen untuk halaman yang dilihat murid di kode /c Anda. Sesuaikan dengan logo Anda.",
    autoFromLogo: "Otomatis dari logo",
    autoFail: "Warna logo tidak dapat dibaca. Pilih satu di bawah.",
    presets: "Warna siap pakai",
    custom: "Kustom",
    reset: "Kembalikan ke bawaan",
    previewLabel: "Pratinjau",
    saving: "Menyimpan…",
  },
  nl: {
    heading: "Uiterlijk van de klas",
    note: "Kies een accentkleur voor wat leerlingen zien bij je /c code. Laat hem passen bij je logo.",
    autoFromLogo: "Automatisch uit logo",
    autoFail: "De kleuren van het logo konden niet worden gelezen. Kies hieronder een kleur.",
    presets: "Voorinstellingen",
    custom: "Aangepast",
    reset: "Standaard herstellen",
    previewLabel: "Voorbeeld",
    saving: "Opslaan…",
  },
  el: {
    heading: "Εμφάνιση τάξης",
    note: "Διαλέξτε ένα χρώμα έμφασης για ό,τι βλέπουν οι μαθητές στον κωδικό /c σας. Ταιριάξτε το με το λογότυπό σας.",
    autoFromLogo: "Αυτόματα από το λογότυπο",
    autoFail: "Δεν ήταν δυνατή η ανάγνωση των χρωμάτων του λογότυπου. Διαλέξτε ένα παρακάτω.",
    presets: "Έτοιμα χρώματα",
    custom: "Προσαρμοσμένο",
    reset: "Επαναφορά προεπιλογής",
    previewLabel: "Προεπισκόπηση",
    saving: "Αποθήκευση…",
  },
  zu: {
    heading: "Ukubukeka kwekilasi",
    note: "Khetha umbala ogqamile walokho abafundi abakubonayo ekhodini yakho ye-/c. Wuhambisane nelogo yakho.",
    autoFromLogo: "Ngokuzenzakalelayo kusuka kulogo",
    autoFail: "Asikwazanga ukufunda imibala yelogo. Khetha owodwa ngezansi.",
    presets: "Imibala esilungile",
    custom: "Okwakho",
    reset: "Buyisela kokujwayelekile",
    previewLabel: "Ukubuka kuqala",
    saving: "Iyalondoloza…",
  },
  vi: {
    heading: "Giao diện lớp học",
    note: "Chọn màu nhấn cho trang học sinh nhìn thấy qua mã /c của bạn. Hãy chọn màu hợp với logo.",
    autoFromLogo: "Tự động theo logo",
    autoFail: "Không đọc được màu của logo. Hãy chọn một màu bên dưới.",
    presets: "Màu có sẵn",
    custom: "Tùy chỉnh",
    reset: "Khôi phục mặc định",
    previewLabel: "Xem trước",
    saving: "Đang lưu…",
  },
  fil: {
    heading: "Itsura ng klase",
    note: "Pumili ng accent na kulay para sa nakikita ng mga estudyante sa iyong /c code. Itugma ito sa iyong logo.",
    autoFromLogo: "Awtomatiko mula sa logo",
    autoFail: "Hindi mabasa ang mga kulay ng logo. Pumili ng isa sa ibaba.",
    presets: "Mga handang kulay",
    custom: "Custom",
    reset: "Ibalik sa default",
    previewLabel: "Preview",
    saving: "Sine-save…",
  },
  af: {
    heading: "Voorkoms van die klas",
    note: "Kies 'n aksentkleur vir wat leerders by jou /c kode sien. Laat dit by jou logo pas.",
    autoFromLogo: "Outomaties uit logo",
    autoFail: "Kon nie die logo se kleure lees nie. Kies een hieronder.",
    presets: "Voorafstellings",
    custom: "Pasgemaak",
    reset: "Herstel na verstek",
    previewLabel: "Voorskou",
    saving: "Stoor tans…",
  },
  sw: {
    heading: "Mwonekano wa darasa",
    note: "Chagua rangi ya kuangazia kwa kile wanafunzi wanachokiona kwenye msimbo wako wa /c. Ilinganishe na nembo yako.",
    autoFromLogo: "Otomatiki kutoka kwenye nembo",
    autoFail: "Imeshindwa kusoma rangi za nembo. Chagua moja hapa chini.",
    presets: "Rangi zilizo tayari",
    custom: "Maalum",
    reset: "Rejesha chaguo-msingi",
    previewLabel: "Onyesho la awali",
    saving: "Inahifadhi…",
  },
  "zh-CN": {
    heading: "班级外观",
    note: "为学生通过你的 /c 代码看到的页面选择一个强调色，可与学校标志搭配。",
    autoFromLogo: "从标志自动取色",
    autoFail: "无法读取标志的颜色，请在下方选择一种。",
    presets: "预设颜色",
    custom: "自定义",
    reset: "恢复默认",
    previewLabel: "预览",
    saving: "保存中…",
  },
  "zh-TW": {
    heading: "班級外觀",
    note: "為學生透過你的 /c 代碼看到的頁面選擇一個強調色，可與學校標誌搭配。",
    autoFromLogo: "從標誌自動取色",
    autoFail: "無法讀取標誌的顏色，請在下方選擇一種。",
    presets: "預設顏色",
    custom: "自訂",
    reset: "恢復預設",
    previewLabel: "預覽",
    saving: "儲存中…",
  },
  ko: {
    heading: "학급 화면 모양",
    note: "학생들이 /c 코드로 보는 화면의 강조 색상을 고르세요. 로고와 어울리게 맞출 수 있습니다.",
    autoFromLogo: "로고에서 자동으로",
    autoFail: "로고 색상을 읽지 못했습니다. 아래에서 골라 주세요.",
    presets: "기본 색상",
    custom: "직접 선택",
    reset: "기본값으로 되돌리기",
    previewLabel: "미리 보기",
    saving: "저장 중…",
  },
  th: {
    heading: "รูปลักษณ์ของห้องเรียน",
    note: "เลือกสีเน้นสำหรับหน้าที่นักเรียนเห็นผ่านรหัส /c ของคุณ ให้เข้ากับโลโก้ได้",
    autoFromLogo: "อัตโนมัติจากโลโก้",
    autoFail: "อ่านสีของโลโก้ไม่ได้ เลือกสีด้านล่างแทน",
    presets: "สีสำเร็จรูป",
    custom: "กำหนดเอง",
    reset: "คืนค่าเริ่มต้น",
    previewLabel: "ตัวอย่าง",
    saving: "กำลังบันทึก…",
  },
  bn: {
    heading: "ক্লাসের চেহারা",
    note: "আপনার /c কোডে শিক্ষার্থীরা যা দেখে, তার জন্য একটি প্রধান রং বেছে নিন। লোগোর সঙ্গে মিলিয়ে নিন।",
    autoFromLogo: "লোগো থেকে স্বয়ংক্রিয়",
    autoFail: "লোগোর রং পড়া যায়নি। নিচ থেকে একটি বেছে নিন।",
    presets: "তৈরি রং",
    custom: "নিজের পছন্দ",
    reset: "ডিফল্টে ফেরান",
    previewLabel: "প্রিভিউ",
    saving: "সংরক্ষণ হচ্ছে…",
  },
  da: {
    heading: "Klassens udseende",
    note: "Vælg en accentfarve til det, eleverne ser under din /c kode. Match den med dit logo.",
    autoFromLogo: "Automatisk fra logo",
    autoFail: "Vi kunne ikke læse logoets farver. Vælg en nedenfor.",
    presets: "Forvalg",
    custom: "Tilpasset",
    reset: "Nulstil til standard",
    previewLabel: "Eksempel",
    saving: "Gemmer…",
  },
  hu: {
    heading: "Az osztály megjelenése",
    note: "Válasszon kiemelőszínt ahhoz, amit a tanulók a /c kódnál látnak. Igazítsa a logójához.",
    autoFromLogo: "Automatikusan a logóból",
    autoFail: "Nem sikerült kiolvasni a logó színeit. Válasszon lent egyet.",
    presets: "Kész színek",
    custom: "Egyéni",
    reset: "Alapértelmezés visszaállítása",
    previewLabel: "Előnézet",
    saving: "Mentés…",
  },
};

const DIGEST_COPY: Record<string, { heading: string; note: string; toggle: string; timeLabel: string }> = {
  en: {
    heading: "Daily summary email",
    note: "Once a day we email you every word your students looked up. On by default; turn it off any time.",
    toggle: "Send me a daily summary",
    timeLabel: "Send at",
  },
  he: {
    heading: "סיכום יומי במייל",
    note: "פעם ביום נשלח לך במייל את כל המילים שהתלמידים חיפשו. פעיל כברירת מחדל; אפשר לכבות בכל רגע.",
    toggle: "שלחו לי סיכום יומי",
    timeLabel: "שליחה בשעה",
  },
  ar: {
    heading: "ملخص يومي بالبريد الإلكتروني",
    note: "نرسل إليك مرة واحدة يوميًا كل الكلمات التي بحث عنها طلابك. الميزة مفعّلة افتراضيًا، ويمكن إيقافها في أي وقت.",
    toggle: "أرسلوا لي ملخصًا يوميًا",
    timeLabel: "وقت الإرسال",
  },
  ru: {
    heading: "Ежедневная сводка на почту",
    note: "Раз в день мы присылаем на почту все слова, которые искали ваши ученики. Включено по умолчанию, отключить можно в любой момент.",
    toggle: "Присылать ежедневную сводку",
    timeLabel: "Время отправки",
  },
  es: {
    heading: "Resumen diario por correo",
    note: "Una vez al día te enviamos por correo todas las palabras que buscaron tus alumnos. Está activado por defecto; puedes desactivarlo cuando quieras.",
    toggle: "Enviarme un resumen diario",
    timeLabel: "Enviar a las",
  },
  pt: {
    heading: "Resumo diário por e-mail",
    note: "Uma vez por dia enviamos por e-mail todas as palavras que seus alunos pesquisaram. Vem ativado por padrão; você pode desativar quando quiser.",
    toggle: "Enviar um resumo diário",
    timeLabel: "Enviar às",
  },
  fr: {
    heading: "Résumé quotidien par e-mail",
    note: "Une fois par jour, nous vous envoyons par e-mail tous les mots recherchés par vos élèves. Activé par défaut, désactivable à tout moment.",
    toggle: "M'envoyer un résumé quotidien",
    timeLabel: "Envoi à",
  },
  de: {
    heading: "Tägliche Zusammenfassung per E-Mail",
    note: "Einmal am Tag schicken wir Ihnen per E-Mail alle Wörter, die Ihre Schülerinnen und Schüler nachgeschlagen haben. Standardmäßig aktiv, jederzeit abschaltbar.",
    toggle: "Tägliche Zusammenfassung senden",
    timeLabel: "Senden um",
  },
  cs: {
    heading: "Denní souhrn e-mailem",
    note: "Jednou denně vám e-mailem pošleme všechna slova, která vaši žáci vyhledali. Ve výchozím stavu zapnuto, vypnout lze kdykoli.",
    toggle: "Posílat mi denní souhrn",
    timeLabel: "Odeslat v",
  },
  sk: {
    heading: "Denný súhrn e-mailom",
    note: "Raz denne vám e-mailom pošleme všetky slová, ktoré vaši žiaci vyhľadali. Predvolene zapnuté, vypnúť sa dá kedykoľvek.",
    toggle: "Posielať mi denný súhrn",
    timeLabel: "Odoslať o",
  },
  it: {
    heading: "Riepilogo giornaliero via email",
    note: "Una volta al giorno ti inviamo via email tutte le parole cercate dai tuoi studenti. Attivo di default; puoi disattivarlo quando vuoi.",
    toggle: "Inviami un riepilogo giornaliero",
    timeLabel: "Invia alle",
  },
  ja: {
    heading: "毎日のまとめメール",
    note: "生徒が調べた単語をすべて、1日1回メールでお届けします。初期設定でオンになっており、いつでもオフにできます。",
    toggle: "毎日のまとめを受け取る",
    timeLabel: "送信時刻",
  },
  hi: {
    heading: "रोज़ का सारांश ईमेल",
    note: "दिन में एक बार हम आपको ईमेल पर वे सभी शब्द भेजते हैं जो आपके छात्रों ने खोजे। यह डिफ़ॉल्ट रूप से चालू है; इसे कभी भी बंद किया जा सकता है।",
    toggle: "मुझे रोज़ का सारांश भेजें",
    timeLabel: "भेजने का समय",
  },
  am: {
    heading: "ዕለታዊ ማጠቃለያ ኢሜይል",
    note: "በቀን አንድ ጊዜ ተማሪዎችዎ የፈለጓቸውን ቃላት በሙሉ በኢሜይል እንልካለን። በነባሪ በርቷል፣ በማንኛውም ጊዜ ማጥፋት ይቻላል።",
    toggle: "ዕለታዊ ማጠቃለያ ላኩልኝ",
    timeLabel: "የሚላክበት ሰዓት",
  },
  uk: {
    heading: "Щоденний підсумок на пошту",
    note: "Раз на день ми надсилаємо на пошту всі слова, які шукали ваші учні. Увімкнено за замовчуванням, вимкнути можна будь-коли.",
    toggle: "Надсилати щоденний підсумок",
    timeLabel: "Час надсилання",
  },
  tr: {
    heading: "Günlük özet e-postası",
    note: "Öğrencilerinizin aradığı tüm kelimeleri günde bir kez e-postayla gönderiyoruz. Varsayılan olarak açıktır, istediğiniz zaman kapatabilirsiniz.",
    toggle: "Bana günlük özet gönder",
    timeLabel: "Gönderim saati",
  },
  pl: {
    heading: "Codzienne podsumowanie e-mailem",
    note: "Raz dziennie wysyłamy e-mailem wszystkie słowa, które sprawdzali Twoi uczniowie. Domyślnie włączone, można wyłączyć w każdej chwili.",
    toggle: "Wysyłaj mi codzienne podsumowanie",
    timeLabel: "Wyślij o",
  },
  fa: {
    heading: "خلاصه روزانه با ایمیل",
    note: "روزی یک بار همه واژه‌هایی را که دانش‌آموزان شما جست‌وجو کرده‌اند برایتان ایمیل می‌کنیم. به‌طور پیش‌فرض فعال است و هر زمان می‌توان آن را خاموش کرد.",
    toggle: "خلاصه روزانه برایم بفرستید",
    timeLabel: "ساعت ارسال",
  },
  id: {
    heading: "Email ringkasan harian",
    note: "Sekali sehari kami mengirim email berisi semua kata yang dicari murid Anda. Aktif secara bawaan; bisa dimatikan kapan saja.",
    toggle: "Kirimi saya ringkasan harian",
    timeLabel: "Kirim pukul",
  },
  nl: {
    heading: "Dagelijkse samenvatting per e-mail",
    note: "Eén keer per dag mailen we je alle woorden die je leerlingen hebben opgezocht. Standaard aan; je kunt het altijd uitzetten.",
    toggle: "Stuur me een dagelijkse samenvatting",
    timeLabel: "Versturen om",
  },
  el: {
    heading: "Ημερήσια σύνοψη με email",
    note: "Μία φορά την ημέρα σας στέλνουμε με email όλες τις λέξεις που αναζήτησαν οι μαθητές σας. Ενεργό από προεπιλογή, μπορείτε να το απενεργοποιήσετε οποιαδήποτε στιγμή.",
    toggle: "Στείλτε μου ημερήσια σύνοψη",
    timeLabel: "Αποστολή στις",
  },
  zu: {
    heading: "I-imeyili yesifinyezo sansuku zonke",
    note: "Kanye ngosuku sikuthumelela nge-imeyili wonke amagama abafundi bakho abawabhekile. Kuvuliwe ngokuzenzakalelayo; ungakuvala noma nini.",
    toggle: "Ngithumelele isifinyezo sansuku zonke",
    timeLabel: "Thumela ngo",
  },
  vi: {
    heading: "Email tóm tắt hằng ngày",
    note: "Mỗi ngày một lần, chúng tôi gửi email cho bạn tất cả các từ mà học sinh đã tra. Mặc định được bật; có thể tắt bất cứ lúc nào.",
    toggle: "Gửi cho tôi bản tóm tắt hằng ngày",
    timeLabel: "Gửi lúc",
  },
  fil: {
    heading: "Pang-araw-araw na buod sa email",
    note: "Isang beses kada araw, ipinapadala namin sa email ang lahat ng salitang hinanap ng iyong mga estudyante. Naka-on ito bilang default; puwede itong i-off anumang oras.",
    toggle: "Padalhan ako ng pang-araw-araw na buod",
    timeLabel: "Ipadala nang",
  },
  af: {
    heading: "Daaglikse opsomming per e-pos",
    note: "Een keer per dag e-pos ons vir jou elke woord wat jou leerders opgesoek het. Dit is by verstek aan; jy kan dit enige tyd afskakel.",
    toggle: "Stuur vir my 'n daaglikse opsomming",
    timeLabel: "Stuur om",
  },
  sw: {
    heading: "Barua pepe ya muhtasari wa kila siku",
    note: "Mara moja kwa siku tunakutumia kwa barua pepe maneno yote ambayo wanafunzi wako walitafuta. Imewashwa kwa chaguo-msingi; unaweza kuizima wakati wowote.",
    toggle: "Nitumie muhtasari wa kila siku",
    timeLabel: "Tuma saa",
  },
  "zh-CN": {
    heading: "每日摘要邮件",
    note: "我们每天会把学生查过的所有单词发送到你的邮箱一次。默认开启，可随时关闭。",
    toggle: "给我发送每日摘要",
    timeLabel: "发送时间",
  },
  "zh-TW": {
    heading: "每日摘要郵件",
    note: "我們每天會把學生查過的所有單字寄到你的信箱一次。預設開啟，可隨時關閉。",
    toggle: "寄給我每日摘要",
    timeLabel: "寄送時間",
  },
  ko: {
    heading: "일일 요약 이메일",
    note: "하루에 한 번, 학생들이 찾아본 모든 단어를 이메일로 보내 드립니다. 기본으로 켜져 있으며 언제든 끌 수 있습니다.",
    toggle: "일일 요약 받기",
    timeLabel: "발송 시간",
  },
  th: {
    heading: "อีเมลสรุปรายวัน",
    note: "วันละครั้ง เราจะส่งอีเมลรวมทุกคำที่นักเรียนของคุณค้นหา เปิดไว้เป็นค่าเริ่มต้น และปิดได้ทุกเมื่อ",
    toggle: "ส่งสรุปรายวันให้ฉัน",
    timeLabel: "ส่งเวลา",
  },
  bn: {
    heading: "প্রতিদিনের সারাংশ ইমেইল",
    note: "দিনে একবার আমরা আপনাকে ইমেইলে সেই সব শব্দ পাঠাই যা আপনার শিক্ষার্থীরা খুঁজেছে। এটি ডিফল্টভাবে চালু থাকে; যেকোনো সময় বন্ধ করা যায়।",
    toggle: "আমাকে প্রতিদিনের সারাংশ পাঠান",
    timeLabel: "পাঠানোর সময়",
  },
  da: {
    heading: "Daglig opsummering på mail",
    note: "Én gang om dagen mailer vi dig alle de ord, dine elever har slået op. Slået til som standard; du kan slå det fra når som helst.",
    toggle: "Send mig en daglig opsummering",
    timeLabel: "Send kl.",
  },
  hu: {
    heading: "Napi összefoglaló e-mailben",
    note: "Naponta egyszer e-mailben elküldjük az összes szót, amelyet a tanulói kerestek. Alapértelmezetten be van kapcsolva, bármikor kikapcsolható.",
    toggle: "Napi összefoglaló küldése",
    timeLabel: "Küldés ideje",
  },
};

export function SchoolsClient() {
  const { user, loading } = useAuth();
  const { lang, dir, setLang } = useLang();
  const href = useHref();
  const router = useRouter();
  const search = useSearchParams();
  const c = COPY[lang] ?? COPY.en;

  const [tab, setTab] = useState<"home" | "classrooms" | "students" | "settings">("home");
  const [school, setSchool] = useState<School | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  // The school account's own lookups (general use, not through a classroom).
  const [ownerSearches, setOwnerSearches] = useState(0);
  const [schoolChecked, setSchoolChecked] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newColorIndex, setNewColorIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  // Whether the "+ Add classroom" form is expanded. Default false so
  // the principal only sees one open form at a time (theirs OR an
  // edit-in-progress). Gadi (2026-06-28) flagged the always-open form
  // at the bottom as visual clutter while editing a classroom above.
  const [showCreateForm, setShowCreateForm] = useState(false);
  // Editing the school name in place. The h1 is now the editable
  // title (click to edit) so we don't show both a heading AND a
  // "School name" label below it. Gadi (2026-06-28) called the
  // duplication out: when the name is set, it IS the page title.
  const [editingSchoolName, setEditingSchoolName] = useState(false);
  // Which classroom row most recently had its kids link copied, so
  // we can flash the copy button green for a moment as feedback.
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyKidsLink(cls: Classroom) {
    if (typeof window === "undefined") return;
    const link = `${window.location.origin}/c/${cls.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(cls.id);
      setTimeout(() => setCopiedId((curr) => curr === cls.id ? null : curr), 1500);
    } catch {
      // Some browsers without secure context. Silent — the link is
      // also surfaced inside /classroom/<id> for manual copy.
    }
  }
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  // School skin (accent colour for the /c/<CODE> classroom surface).
  const [skinSaving, setSkinSaving] = useState(false);
  const [skinAutoNote, setSkinAutoNote] = useState<string | null>(null);

  async function saveSkin(accent: string | null) {
    if (!user || skinSaving) return;
    setSkinSaving(true);
    setSkinAutoNote(null);
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/schools/skin", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ accent: accent ?? "" }),
      });
      // The live onSnapshot listener reflects the new colour automatically.
    } catch {
      /* swallow — non-critical cosmetic save */
    } finally {
      setSkinSaving(false);
    }
  }

  // Daily-summary preference. Opt-out model: a missing value = on.
  async function saveDigest(patch: { enabled?: boolean; hour?: number }) {
    if (!user) return;
    const current = school?.dailyDigest ?? {};
    try {
      await updateDoc(doc(db, "schools", user.uid), {
        dailyDigest: { enabled: current.enabled !== false, hour: typeof current.hour === "number" ? current.hour : 15, ...patch },
      });
    } catch { /* non-critical */ }
  }

  // "Auto from logo": load the logo through our same-origin proxy (loading the
  // Firebase URL directly taints the canvas) and pull its dominant colour.
  function autoSkinFromLogo(schoolId: string) {
    setSkinAutoNote(null);
    const img = new Image();
    img.onload = () => {
      const hex = dominantColorFromImage(img);
      if (hex) saveSkin(hex);
      else setSkinAutoNote((APPEARANCE_COPY[lang] ?? APPEARANCE_COPY.en).autoFail);
    };
    img.onerror = () => setSkinAutoNote((APPEARANCE_COPY[lang] ?? APPEARANCE_COPY.en).autoFail);
    img.src = `/api/schools/logo-proxy?schoolId=${encodeURIComponent(schoolId)}`;
  }
  // Per-row classroom edit. The pencil button on a row opens a full
  // expanded form (name + teacher + color) so the principal can
  // change every editable property in one place, not just the name.
  // Gadi (2026-06-28) flagged that the previous name-only edit was
  // useless if he wanted to change the teacher or colour.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNameDraft, setEditingNameDraft] = useState("");
  const [editingTeacherDraft, setEditingTeacherDraft] = useState("");
  const [editingColorDraft, setEditingColorDraft] = useState(0);
  // Students roster — newline-separated names. The kid view at /c/<CODE>
  // shows these as a name-picker before search so each search log gets
  // tagged with the kid's name. Empty = anonymous classroom (skip the
  // picker). Gadi (2026-06-29) flagged that the dashboard was missing
  // any UI for this; principals were having to hand-edit Firestore.
  const [editingStudentsDraft, setEditingStudentsDraft] = useState("");

  const isWelcome = search.get("welcome") === "1";

  // Subscribe to schools/{ownerUid} doc + classrooms subcollection.
  useEffect(() => {
    if (!user) return;
    const schoolRef = doc(db, "schools", user.uid);
    const unsubSchool = onSnapshot(
      schoolRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as School;
          setSchool(data);
          // Sync name draft from server on first load only — once the
          // user is typing, don't clobber their in-flight edits.
          setNameDraft((prev) => (prev === "" ? data.name : prev));
        } else {
          setSchool(null);
        }
        setSchoolChecked(true);
      },
      () => setSchoolChecked(true)
    );
    const classroomsQ = query(
      collection(db, "schools", user.uid, "classrooms"),
      orderBy("createdAt", "asc")
    );
    const unsubClassrooms = onSnapshot(
      classroomsQ,
      (snap) => {
        setClassrooms(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Classroom, "id">) }))
        );
      },
      () => {}
    );
    // The account's OWN searchCount (general lookups) so the header total isn't
    // just classroom searches — a school using Gadit directly shouldn't read 0.
    const unsubUser = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => setOwnerSearches((snap.data()?.searchCount as number) ?? 0),
      () => {},
    );
    return () => {
      unsubSchool();
      unsubClassrooms();
      unsubUser();
    };
  }, [user]);

  if (loading || !schoolChecked) {
    return <div className="wordbook wb-school-page" dir={dir}>&nbsp;</div>;
  }

  if (!user) {
    router.replace(href("/pricing"));
    return null;
  }

  // No school doc = no Schools subscription. Soft message + pricing link.
  if (!school) {
    return (
      <div className="wordbook wb-school-page" dir={dir}>
        <main className="wb-school-main">
          <p>{c.notReady}</p>
          <Link href={href("/pricing")} className="wb-school-cta" style={{ display: "inline-block", marginTop: 16 }}>
            {c.goPricing}
          </Link>
        </main>
      </div>
    );
  }

  async function saveSchoolName(next: string) {
    if (!user || !school) return;
    if (next === school.name) return;
    setNameSaving(true);
    try {
      await updateDoc(doc(db, "schools", user.uid), {
        name: next,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("save school name failed:", err);
    } finally {
      setNameSaving(false);
    }
  }

  async function saveClassroomEdit(classroomId: string) {
    if (!user) return;
    const name = editingNameDraft.trim();
    const teacherName = editingTeacherDraft.trim();
    const colorIndex = editingColorDraft;
    // Parse the students textarea: split on newlines, trim each, drop
    // empties, drop duplicates (case-insensitive — "rotem" and "Rotem"
    // collapse to the first occurrence so the kid picker doesn't show
    // the same name twice). Cap at 60 students per classroom — beyond
    // that the picker grid gets unwieldy and the school should split
    // into more classrooms.
    const studentLines = editingStudentsDraft
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length <= 40);
    const seen = new Set<string>();
    const students: string[] = [];
    for (const sn of studentLines) {
      const key = sn.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      students.push(sn);
      if (students.length >= 60) break;
    }
    setEditingId(null);
    try {
      await updateDoc(
        doc(db, "schools", user.uid, "classrooms", classroomId),
        {
          name,
          teacherName: teacherName || null,
          colorIndex,
          students,
        }
      );
    } catch (err) {
      console.error("save classroom edit failed:", err);
    }
  }

  function openEdit(cls: Classroom) {
    setEditingId(cls.id);
    setEditingNameDraft(cls.name ?? "");
    setEditingTeacherDraft(cls.teacherName ?? "");
    setEditingColorDraft(typeof cls.colorIndex === "number" ? cls.colorIndex : 0);
    // Pre-fill the students textarea with the current roster, one
    // name per line, so the teacher can edit in place rather than
    // re-type the whole list.
    setEditingStudentsDraft((cls.students ?? []).join("\n"));
    // Mutually exclusive with the create form.
    setShowCreateForm(false);
  }

  function openCreateForm() {
    setShowCreateForm(true);
    // Mutually exclusive with any open edit.
    setEditingId(null);
  }

  async function deleteClassroom(classroomId: string) {
    if (!user) return;
    if (!window.confirm(c.deleteConfirm)) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/schools/delete-classroom?id=${encodeURIComponent(classroomId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        console.error("delete classroom failed:", await res.text());
      }
    } catch (err) {
      console.error("delete classroom failed:", err);
    }
  }

  async function createClassroom() {
    if (!user || creating) return;
    if (!newClassroomName.trim()) return; // name is required now
    setCreating(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/schools/create-classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          name: newClassroomName.trim(),
          teacherName: newTeacherName.trim(),
          colorIndex: newColorIndex,
        }),
      });
      if (res.ok) {
        setNewClassroomName("");
        setNewTeacherName("");
        setNewColorIndex(0);
        setShowCreateForm(false);
      } else {
        console.error("create classroom failed:", await res.text());
      }
    } catch (err) {
      console.error("create classroom failed:", err);
    } finally {
      setCreating(false);
    }
  }

  async function onLogoPicked(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLogoError(null);
    if (!(ALLOWED_LOGO_MIMES as readonly string[]).includes(file.type)) {
      setLogoError(c.logoBadType);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError(c.logoTooBig);
      return;
    }
    setLogoUploading(true);
    try {
      const idToken = await user.getIdToken();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/schools/logo", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: form,
      });
      if (!res.ok) {
        setLogoError(c.logoBadType);
      }
    } catch (err) {
      console.error("logo upload failed:", err);
    } finally {
      setLogoUploading(false);
    }
  }

  const totalSearches = classrooms.reduce((s, cl) => s + (cl.searchCount ?? 0), 0) + ownerSearches;
  const NAV: Array<"home" | "classrooms" | "students" | "settings"> = ["home", "classrooms", "students", "settings"];

  return (
    <div className="wordbook school-shell-page" dir={dir} style={skinStyleVars(school.skinAccent)}>
      <style>{SCHOOL_SHELL_CSS}</style>
      <div className="school-shell">
        {/* Right-side (RTL start) navigation, mirroring the Family
            dashboard shell + Yooniz. */}
        <aside className="school-shell-side">
          <Link href={href("/")} className="school-shell-brand" dir="ltr" translate="no" aria-label="Gadit">
            Gad<span className="school-shell-brand-it">it</span>
          </Link>
          <nav className="school-shell-nav">
            {NAV.map((tk) => (
              <button
                key={tk}
                type="button"
                className={`school-nav-item ${tab === tk ? "is-active" : ""}`}
                onClick={() => setTab(tk)}
              >
                <SchoolNavIcon name={tk} />
                <span>
                  {tk === "home" ? c.tabOverview : tk === "classrooms" ? c.tabClassrooms : tk === "students" ? c.tabStudents : c.tabSettings}
                </span>
              </button>
            ))}
          </nav>
          <div className="school-shell-side-foot">
            <Link href={href("/")} className="school-nav-item school-nav-back">
              <SchoolNavIcon name="dictionary" />
              <span>{c.back}</span>
            </Link>
          </div>
        </aside>

        <main className="school-shell-body">
          <div className="school-shell-top">
            <div className="school-shell-logo" aria-hidden>
              {school.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={school.logoUrl} alt="" />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M21 10v6" /><path d="M5 9v5c0 2 3 4 7 4s7-2 7-4V9" /></svg>
              )}
            </div>
            <div>
              <h1>{school.name || c.title}</h1>
              <p>{classrooms.length} {c.classroomsHeading} · {totalSearches.toLocaleString()} {lang === "he" ? "חיפושים" : lang === "hi" ? "खोजें" : lang === "am" ? "ፍለጋዎች" : "lookups"}</p>
            </div>
          </div>

        {tab === "settings" && (
        <>
        <h2 className="school-sec-title">{c.settingsHeading}</h2>
        <header className="wb-school-header">
          {/* Logo slot. Universal "click to upload image" pattern:
              the slot itself shows the current logo (or a placeholder
              icon), AND a small camera badge in the bottom-end corner
              signals it's an upload target. Replaces the previous
              ambiguous design where the graduation cap looked like
              decoration; tested user (Gadi 2026-06-28) didn't realise
              he could click. */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              type="button"
              className="wb-school-logo-slot"
              onClick={() => logoInputRef.current?.click()}
              title={school.logoUrl ? c.logoReplace : c.logoCta}
              aria-label={school.logoUrl ? c.logoReplace : c.logoCta}
              style={{
                // When a logo is uploaded the mustard fill becomes
                // visual noise behind any transparent-PNG logo (the
                // user-uploaded "computer + cap" logo had its
                // background showing through in V1). Swap to white in
                // the with-logo state so the user's logo reads clean;
                // keep mustard for the empty placeholder state.
                background: school.logoUrl ? "var(--surface)" : undefined,
                border: school.logoUrl ? "1px solid var(--hairline, var(--rule))" : "1px solid rgba(14, 165, 165, 0.3)",
                cursor: "pointer",
              }}
            >
              {school.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={school.logoUrl} alt="" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7l9-4 9 4-9 4-9-4z" />
                  <path d="M21 10v6" />
                  <path d="M5 9v5c0 2 3 4 7 4s7-2 7-4V9" />
                </svg>
              )}
            </button>
            {/* Edit pencil badge. Sits half-on, half-off the slot's
                bottom-end corner. Mustard pill with a white pencil
                glyph — Gadi (2026-06-28) found the camera icon
                ambiguous; a pencil reads as "edit" immediately. The
                glyph is sized so it fits comfortably inside the
                circle without overflow. Pointer events pass through
                to the underlying button so a click on the badge ALSO
                opens the file picker. */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: -4,
                insetInlineEnd: -4,
                width: 24,
                height: 24,
                borderRadius: 999,
                background: "#0EA5A5",
                border: "2px solid var(--surface, #FFFFFF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                boxShadow: "0 2px 4px rgba(14, 165, 165, 0.35)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </span>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={onLogoPicked}
            hidden
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Editable in place. When name is set, it IS the page
                title (click pencil-ish hover or the text itself to
                edit). When empty, an input field with placeholder
                takes over. Gadi (2026-06-28) flagged the previous
                separate-label-and-field-below-the-title pattern as
                redundant: "ברגע שהוא כותב את שם בית הספר, זה השם
                של בית הספר". */}
            {editingSchoolName || !school.name ? (
              <input
                type="text"
                value={nameDraft}
                placeholder={c.schoolNamePh}
                autoFocus={editingSchoolName}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={() => {
                  saveSchoolName(nameDraft.trim());
                  setEditingSchoolName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveSchoolName(nameDraft.trim());
                    setEditingSchoolName(false);
                  } else if (e.key === "Escape") {
                    setNameDraft(school.name);
                    setEditingSchoolName(false);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1.5px solid var(--rule)",
                  borderRadius: 10,
                  background: "var(--surface)",
                  fontFamily: "var(--wb-serif)",
                  fontWeight: 700,
                  fontSize: "clamp(22px, 2.6vw, 30px)",
                  color: "var(--ink)",
                  outline: "none",
                  marginBottom: 6,
                }}
              />
            ) : (
              <h1
                className="wb-school-title"
                onClick={() => {
                  setNameDraft(school.name);
                  setEditingSchoolName(true);
                }}
                title={c.schoolNameLabel}
                style={{ cursor: "pointer" }}
              >
                {school.name}
              </h1>
            )}
            {/* The marketing tagline (c.sub) was removed here: this block
                now lives only inside the Settings tab, where a tagline is
                out of place. The click-to-edit name + logo are the point. */}
            {nameSaving && (
              <div className="wb-school-sub" style={{ marginTop: 4, fontSize: 12 }}>{c.saving}</div>
            )}
          </div>
        </header>

        {logoUploading && (
          <div className="wb-school-sub" style={{ marginBottom: 12 }}>{c.logoUploading}</div>
        )}
        {logoError && (
          <div className="wb-school-sub" style={{ color: "#B91C1C", marginBottom: 12 }}>{logoError}</div>
        )}
        {/* Each setting group sits in its own clean card so it reads as a
            distinct block. Order (Gadi 2026-08-25): language, notification,
            design. */}

        {/* 1 · Interface language */}
        <div className="school-set-card">
          <div className="school-set-row" style={{ margin: 0 }}>
            <span className="school-set-label">{c.langLabel}</span>
            <select
              className="school-set-select"
              value={lang}
              onChange={(e) => setLang(e.target.value as Parameters<typeof setLang>[0])}
            >
              {Object.entries(SCHOOL_LANG_NATIVE).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2 · Daily summary email (notification) — opt-out, on by default. */}
        {(() => {
          const d = DIGEST_COPY[lang] ?? DIGEST_COPY.en;
          const enabled = school.dailyDigest?.enabled !== false;
          const hour = typeof school.dailyDigest?.hour === "number" ? school.dailyDigest.hour : 15;
          return (
            <div className="school-set-card">
              <div className="school-set-label" style={{ marginBottom: 4 }}>{d.heading}</div>
              <p className="wb-school-sub" style={{ margin: "0 0 12px", fontSize: 13 }}>{d.note}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => saveDigest({ enabled: !enabled })}
                    style={{ width: 44, height: 26, borderRadius: 999, border: "none", cursor: "pointer", position: "relative", background: enabled ? "#0EA5A5" : "#D1D5DB", transition: "background 160ms" }}
                  >
                    <span style={{ position: "absolute", top: 3, insetInlineStart: enabled ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "inset-inline-start 160ms" }} />
                  </button>
                  {d.toggle}
                </label>
                {enabled && (
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)" }}>
                    {d.timeLabel}
                    <select value={hour} onChange={(e) => saveDigest({ hour: parseInt(e.target.value, 10) })} className="school-set-select" style={{ width: "auto", padding: "6px 10px" }}>
                      {Array.from({ length: 24 }, (_, h) => (
                        <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            </div>
          );
        })()}

        {/* 3 · Classroom appearance (design) — accent for the /c/<CODE> surface. */}
        {(() => {
          const a = APPEARANCE_COPY[lang] ?? APPEARANCE_COPY.en;
          const current = school.skinAccent && isHex(school.skinAccent) ? school.skinAccent : DEFAULT_ACCENT;
          return (
            <div className="school-set-card">
              <div className="school-set-label" style={{ marginBottom: 4 }}>{a.heading}</div>
              <p className="wb-school-sub" style={{ margin: "0 0 12px", fontSize: 13 }}>{a.note}</p>

              {/* Preview: a mini classroom topbar + button in the chosen colour. */}
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                  padding: "12px 14px", borderRadius: 12, border: "1px solid var(--rule)",
                  background: "var(--surface)", marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--ink-soft, #6B7280)" }}>{a.previewLabel}:</span>
                <span style={{ fontFamily: "var(--wb-sans)", fontWeight: 600, color: current, fontSize: 15 }} dir="ltr">
                  Gad<span style={{ fontStyle: "italic", fontWeight: 400, color: "#0EA5A5" }}>it</span>
                </span>
                <span style={{ fontSize: 13, color: current, fontWeight: 600 }}>{a.previewLabel === "Preview" ? "Class Notebook" : "מחברת הכיתה"}</span>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 30, height: 30, borderRadius: 999, background: current, color: "#fff",
                    boxShadow: `0 1px 3px ${darkenHex(current)}55`,
                  }}
                  aria-hidden="true"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.5-3.5" /></svg>
                </span>
              </div>

              {/* Theme: the clean Gadit default, or one generated from the logo.
                  No arbitrary colour palette (Gadi 2026-08-25): keep it on-brand. */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                {school.logoUrl && (
                  <button
                    type="button"
                    onClick={() => autoSkinFromLogo(school.ownerUid)}
                    disabled={skinSaving}
                    className="school-set-select"
                    style={{ cursor: "pointer", fontSize: 13, padding: "6px 12px", width: "auto" }}
                  >
                    {a.autoFromLogo}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => saveSkin(null)}
                  disabled={skinSaving || current.toLowerCase() === DEFAULT_ACCENT.toLowerCase()}
                  style={{ background: "none", border: "none", color: "var(--ink-soft, #6B7280)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
                >
                  {a.reset}
                </button>
                {skinSaving && <span className="wb-school-sub" style={{ fontSize: 12 }}>{a.saving}</span>}
              </div>
              {skinAutoNote && (
                <div className="wb-school-sub" style={{ color: "#B91C1C", fontSize: 12, marginTop: 8 }}>{skinAutoNote}</div>
              )}
            </div>
          );
        })()}

        </>
        )}

        {isWelcome && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(14, 165, 165, 0.10)",
              border: "1px solid rgba(14, 165, 165, 0.3)",
              borderRadius: 12,
              color: "#0E7490",
              fontFamily: "var(--wb-sans)",
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            {c.welcome}
          </div>
        )}

        {tab === "home" && <PrincipalOverview lang={lang} />}

        {tab === "students" && <SchoolStudentsPanel lang={lang} />}

        {/* Classrooms list */}
        {tab === "classrooms" && (
        <section>
          <h2
            style={{
              fontFamily: "var(--wb-serif)",
              fontWeight: 700,
              fontSize: 20,
              color: "var(--ink)",
              margin: "0 0 14px",
            }}
          >
            {c.classroomsHeading}
          </h2>

          {/* The account's OWN searches — lookups the school did directly, not
              through a classroom /c/<code> link. Shown as its own line so the
              count is visible here too (and never falsely attributed to a
              specific classroom). Gadi 2026-08-27. */}
          {ownerSearches > 0 && (
            <div
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "var(--surface)", border: "1px solid var(--hairline)",
                borderRadius: 14, padding: "12px 16px", marginBottom: 12,
              }}
            >
              <span aria-hidden style={{ fontSize: 18 }}>🔎</span>
              <span style={{ flex: 1, fontWeight: 600, color: "var(--ink)" }}>
                {lang === "he" ? "חיפושים כלליים של החשבון" : "The account's own searches"}
              </span>
              <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                {ownerSearches.toLocaleString()} {c.wordsLabel}
              </span>
            </div>
          )}

          {classrooms.length === 0 ? (
            <p className="wb-school-sub" style={{ marginBottom: 16 }}>{c.empty}</p>
          ) : (
            <div style={{ marginBottom: 20 }}>
              {classrooms.map((cls) => {
                const kidsLink = typeof window !== "undefined"
                  ? `${window.location.origin}/c/${cls.code}`
                  : `https://www.gadit.app/c/${cls.code}`;
                return editingId === cls.id ? (
                // Expanded edit form REPLACES the row. Same three
                // fields as the create form so the principal can
                // rename, reassign teacher, and recolor in one place.
                <div
                  key={cls.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    padding: 18,
                    background: "var(--surface)",
                    border: "1.5px solid var(--teal)",
                    borderRadius: 14,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontFamily: "var(--wb-sans)",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--teal)",
                        marginBottom: 6,
                      }}
                    >
                      {c.classroomNameLabel}
                    </label>
                    <input
                      type="text"
                      value={editingNameDraft}
                      autoFocus
                      onChange={(e) => setEditingNameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveClassroomEdit(cls.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1.5px solid var(--rule)",
                        borderRadius: 10,
                        background: "var(--surface)",
                        fontFamily: "var(--wb-sans)",
                        fontSize: 15,
                        color: "var(--ink)",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontFamily: "var(--wb-sans)",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--teal)",
                        marginBottom: 6,
                      }}
                    >
                      {c.teacherNameLabel}
                    </label>
                    <input
                      type="text"
                      value={editingTeacherDraft}
                      onChange={(e) => setEditingTeacherDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveClassroomEdit(cls.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1.5px solid var(--rule)",
                        borderRadius: 10,
                        background: "var(--surface)",
                        fontFamily: "var(--wb-sans)",
                        fontSize: 15,
                        color: "var(--ink)",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontFamily: "var(--wb-sans)",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--teal)",
                        marginBottom: 6,
                      }}
                    >
                      {c.colorLabel}
                    </label>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {CLASSROOM_COLORS.map((hex, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditingColorDraft(i)}
                          aria-label={hex}
                          aria-pressed={editingColorDraft === i}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            background: hex,
                            border: editingColorDraft === i ? "3px solid var(--ink)" : "2px solid transparent",
                            boxShadow: editingColorDraft === i ? "0 0 0 2px var(--surface)" : "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Students roster — newline-separated names. Stored
                      on the classroom doc as a string[]. The kid view at
                      /c/<CODE> shows a name picker pre-search if this
                      list is non-empty; otherwise the search box appears
                      directly. Helper text explains the privacy story
                      (first names only). */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontFamily: "var(--wb-sans)",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--teal)",
                        marginBottom: 6,
                      }}
                    >
                      {c.studentsLabel}
                    </label>
                    <textarea
                      value={editingStudentsDraft}
                      onChange={(e) => setEditingStudentsDraft(e.target.value)}
                      placeholder={c.studentsPh}
                      rows={8}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1.5px solid var(--rule)",
                        borderRadius: 10,
                        background: "var(--surface)",
                        fontFamily: "var(--wb-sans)",
                        fontSize: 15,
                        lineHeight: 1.5,
                        color: "var(--ink)",
                        outline: "none",
                        resize: "vertical",
                        minHeight: 120,
                        boxSizing: "border-box",
                      }}
                    />
                    <p
                      style={{
                        marginTop: 6,
                        marginBottom: 0,
                        fontFamily: "var(--wb-sans)",
                        fontSize: 13,
                        color: "var(--ink-soft, var(--ink-muted))",
                        lineHeight: 1.5,
                      }}
                    >
                      {c.studentsHelp}
                    </p>
                    <p
                      style={{
                        marginTop: 4,
                        marginBottom: 0,
                        fontFamily: "var(--wb-sans)",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--teal)",
                      }}
                    >
                      {c.studentsCount(
                        editingStudentsDraft
                          .split(/\r?\n/)
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0).length
                      )}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      className="wb-school-cta"
                      onClick={() => saveClassroomEdit(cls.id)}
                      disabled={!editingNameDraft.trim()}
                      style={{
                        width: "auto",
                        padding: "10px 22px",
                        opacity: !editingNameDraft.trim() ? 0.5 : 1,
                      }}
                    >
                      {c.saveBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: "10px 22px",
                        background: "transparent",
                        border: "1px solid var(--hairline, var(--rule))",
                        borderRadius: 10,
                        fontFamily: "var(--wb-sans)",
                        fontSize: 15,
                        color: "var(--ink-soft, var(--ink-muted))",
                        cursor: "pointer",
                      }}
                    >
                      {c.cancelBtn}
                    </button>
                  </div>
                </div>
              ) : (
                // Two-row layout per classroom: action row on top,
                // visible kids-link row underneath. Gadi (2026-06-28)
                // flagged the chain-icon-only copy button as opaque
                // ("לא ברור מה זה") — surfacing the actual URL as
                // text plus a copy affordance makes the link real.
                <div
                  key={cls.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--hairline)",
                    borderRadius: 14,
                    marginBottom: 10,
                    transition: "border-color 180ms var(--wb-ease-out)",
                  }}
                >
                  <div
                    className="wb-classroom-row"
                    style={{ marginBottom: 0, border: "none", borderRadius: 0, background: "transparent" }}
                  >
                  {/* Color dot. Lets a principal scan 30 classrooms
                      and spot one by colour. Sits in the inline-start
                      gutter next to the mustard code chip. */}
                  <span
                    aria-hidden="true"
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      background: classroomColorFor(cls),
                      flexShrink: 0,
                    }}
                  />
                  <span className="wb-classroom-code">{cls.code}</span>
                  <span className="wb-classroom-name">
                    {cls.name || c.classroomsHeading}
                  </span>
                  <span className="wb-classroom-count">
                    {cls.searchCount ?? 0} {c.wordsLabel}
                  </span>
                  {/* Edit pencil opens the full expanded form above
                      (name + teacher + colour). Gadi (2026-06-28)
                      flagged the previous name-only edit as useless
                      if he wanted to change teacher or colour. */}
                  <button
                    type="button"
                    onClick={() => openEdit(cls)}
                    aria-label={c.editAria}
                    title={c.editAria}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: "transparent",
                      border: "1px solid var(--hairline, var(--rule))",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--ink-soft, var(--ink-muted))",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  {/* Delete trash. window.confirm() before the destructive
                      call. Server endpoint removes the classroom doc AND
                      the matching classroomCodes lookup so the code can
                      be reused by a future classroom. */}
                  <button
                    type="button"
                    onClick={() => deleteClassroom(cls.id)}
                    aria-label={c.deleteAria}
                    title={c.deleteAria}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: "transparent",
                      border: "1px solid var(--hairline, var(--rule))",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#B91C1C",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                  <Link
                    href={href(`/classroom/${cls.id}`)}
                    className="wb-school-cta"
                    style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}
                  >
                    {c.open}
                  </Link>
                  </div>
                  {/* Kids-link row — the actual URL is visible so a
                      teacher knows what they're about to copy. Click
                      anywhere on the link row to copy. The button +
                      URL both turn green for 1.5s after copy. */}
                  <button
                    type="button"
                    onClick={() => copyKidsLink(cls)}
                    aria-label={c.copyLinkAria}
                    title={c.copyLinkAria}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 18px",
                      borderTop: "1px dashed var(--hairline, var(--rule))",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: dir === "rtl" ? "right" : "left",
                      borderInline: 0,
                      borderBottom: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--wb-sans)",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--teal)",
                        flexShrink: 0,
                      }}
                    >
                      {lang === "he" ? "לינק לכיתה" : lang === "hi" ? "कक्षा लिंक" : "Class link"}
                    </span>
                    <span
                      dir="ltr"
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: 13,
                        color: copiedId === cls.id ? "#10B981" : "var(--ink, #111827)",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        transition: "color 200ms",
                      }}
                    >
                      {kidsLink}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--wb-sans)",
                        fontSize: 12,
                        fontWeight: 600,
                        color: copiedId === cls.id ? "#10B981" : "var(--ink-soft, var(--ink-muted))",
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {copiedId === cls.id ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {c.copiedBadge}
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          {lang === "he" ? "העתק" : lang === "hi" ? "कॉपी" : "Copy"}
                        </>
                      )}
                    </span>
                  </button>
                </div>
              );
              })}
            </div>
          )}

          {/* Add-classroom affordance. Collapsed by default to a
              single "+ Add classroom" button so the dashboard reads
              clean. Click expands the full three-field form below
              the classroom list. Mutually exclusive with any open
              edit (opening one closes the other). */}
          {!showCreateForm && (
            <button
              type="button"
              className="wb-school-cta"
              onClick={openCreateForm}
              style={{ width: "auto", padding: "12px 24px" }}
            >
              {c.addClassroom}
            </button>
          )}
          {showCreateForm && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 18,
              background: "var(--surface)",
              border: "1px solid var(--hairline)",
              borderRadius: 14,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--wb-sans)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--teal)",
                  marginBottom: 6,
                }}
              >
                {c.classroomNameLabel}
              </label>
              <input
                type="text"
                value={newClassroomName}
                placeholder={c.classroomNamePh}
                onChange={(e) => setNewClassroomName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createClassroom(); }}
                disabled={creating}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid var(--rule)",
                  borderRadius: 10,
                  background: "var(--surface)",
                  fontFamily: "var(--wb-sans)",
                  fontSize: 15,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--wb-sans)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--teal)",
                  marginBottom: 6,
                }}
              >
                {c.teacherNameLabel}
              </label>
              <input
                type="text"
                value={newTeacherName}
                placeholder={c.teacherNamePh}
                onChange={(e) => setNewTeacherName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createClassroom(); }}
                disabled={creating}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid var(--rule)",
                  borderRadius: 10,
                  background: "var(--surface)",
                  fontFamily: "var(--wb-sans)",
                  fontSize: 15,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--wb-sans)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--teal)",
                  marginBottom: 6,
                }}
              >
                {c.colorLabel}
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {CLASSROOM_COLORS.map((hex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewColorIndex(i)}
                    aria-label={hex}
                    aria-pressed={newColorIndex === i}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: hex,
                      border: newColorIndex === i ? "3px solid var(--ink)" : "2px solid transparent",
                      boxShadow: newColorIndex === i ? "0 0 0 2px var(--surface)" : "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="wb-school-cta"
                onClick={createClassroom}
                disabled={creating || !newClassroomName.trim()}
                style={{
                  width: "auto",
                  padding: "10px 22px",
                  opacity: !newClassroomName.trim() ? 0.5 : 1,
                }}
              >
                {creating ? c.creating : c.addClassroom}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewClassroomName("");
                  setNewTeacherName("");
                  setNewColorIndex(0);
                }}
                style={{
                  padding: "10px 22px",
                  background: "transparent",
                  border: "1px solid var(--hairline, var(--rule))",
                  borderRadius: 10,
                  fontFamily: "var(--wb-sans)",
                  fontSize: 15,
                  color: "var(--ink-soft, var(--ink-muted))",
                  cursor: "pointer",
                }}
              >
                {c.cancelBtn}
              </button>
            </div>
          </div>
          )}
        </section>
        )}
        </main>
      </div>
    </div>
  );
}

// All 30+ UI languages from the shared registry, so the classroom-language
// picker never drifts behind new languages (Gadi 2026-08-16: was hardcoded
// to 12). Same source the main switcher + family picker use.
const SCHOOL_LANG_NATIVE: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.label]),
);

function SchoolNavIcon({ name }: { name: "home" | "classrooms" | "students" | "settings" | "dictionary" }) {
  const p = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "home") return (<svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>);
  if (name === "classrooms") return (<svg {...p}><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8h18" /><path d="M8 21h8" /></svg>);
  if (name === "students") return (<svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16.5 5.2a3 3 0 0 1 0 5.6M18 20c-.3-2.4-1.4-4-3-4.9" /></svg>);
  if (name === "settings") return (<svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.2-1.3L14 3h-4l-.4 2.1a7 7 0 0 0-2.2 1.3l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .45.03.88.1 1.3l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.2 1.3L10 21h4l.4-2.1a7 7 0 0 0 2.2-1.3l2.3.9 2-3.4-2-1.5c.07-.42.1-.85.1-1.3z" /></svg>);
  return (<svg {...p}><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z" /><path d="M9 3v18" /></svg>);
}

const SCHOOL_SHELL_CSS = `
/* The school dashboard is an adult admin surface — pin it to a clean light
   palette so a device set to dark mode (or a kid skin) never turns the cards
   dark and breaks contrast. Mirrors the family dashboard. High specificity to
   beat html[data-theme="dark"] .wordbook. (Gadi 2026-08-23) */
html[data-theme] .wordbook.school-shell-page {
  --paper: #F2F6F4; --surface: #FFFFFF; --mist: #EAF1EE;
  --ink: #0B0F19; --ink-soft: #3A3F4B; --ink-muted: #5C6270; --ink-faint: #8B91A0;
  --rule: #E4EAE8; --rule-soft: #EDEFF2; --rule-faint: #F1F2F6;
  --accent: #0EA5A5; --accent-2: #7C3AED; --accent-ink: #FFFFFF;
  --wb-card: #FFFFFF; --wb-surface: #FFFFFF; --wb-bg: #F2F6F4;
  --wb-ink: #0B0F19; --wb-ink-soft: #3A3F4B; --wb-border: #E4EAE8;
}
/* Exactly the main dictionary's page ground (--paper #F2F6F4), so the school
   dashboard reads as the same premium Gadit surface. (Gadi 2026-08-25.) */
.school-shell-page { min-height: 100dvh; background: #F2F6F4; }
.school-shell {
  display: flex; gap: 20px; max-width: 1140px; margin: 0 auto;
  padding: 20px 18px 48px; align-items: flex-start;
}
.school-shell-side {
  width: 232px; flex-shrink: 0; background: #fff;
  border: 1px solid rgba(31,41,55,0.08); border-radius: 20px;
  padding: 16px 14px; position: sticky; top: 18px;
  box-shadow: 0 8px 24px rgba(31,41,55,0.05);
  display: flex; flex-direction: column; min-height: 420px;
}
.school-shell-brand {
  font-family: var(--font-inter), 'Inter', system-ui, sans-serif;
  font-weight: 600; font-size: 26px; letter-spacing: -0.03em;
  color: var(--ink); text-decoration: none; direction: ltr;
  padding: 4px 12px 16px; text-align: center;
}
.school-shell-brand-it { color: #0EA5A5; font-style: italic; font-weight: 500; }
.school-shell-nav { display: flex; flex-direction: column; gap: 4px; }
.school-nav-item {
  display: flex; align-items: center; gap: 11px; width: 100%;
  padding: 11px 14px; border-radius: 12px; border: none; background: transparent;
  color: #57534E; font-size: 15px; font-weight: 600; font-family: inherit;
  cursor: pointer; text-decoration: none; text-align: start;
  transition: background 140ms ease, color 140ms ease;
}
.school-nav-item svg { flex-shrink: 0; color: var(--ink-faint); transition: color 140ms ease; }
.school-nav-item:hover { background: var(--mist); color: var(--ink); }
.school-nav-item.is-active { background: rgba(14, 165, 165,0.12); color: #0E7490; }
.school-nav-item.is-active svg { color: #0E7490; }
.school-shell-side-foot { margin-top: auto; padding-top: 14px; border-top: 1px solid rgba(31,41,55,0.07); }
.school-nav-back {
  color: #0E7490; font-weight: 700; background: rgba(14, 165, 165,0.08);
  border: 1px solid rgba(14, 165, 165,0.22); justify-content: center;
}
.school-nav-back:hover { background: rgba(14, 165, 165,0.15); color: #0E7490; }
.school-nav-back svg { color: #0EA5A5; }

.school-shell-body { flex: 1; min-width: 0; }
.school-shell-top { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.school-shell-top h1 { font-size: clamp(22px, 3.4vw, 30px); font-weight: 800; color: var(--ink); margin: 0; letter-spacing: -0.01em; }
.school-shell-top p { margin: 4px 0 0; color: var(--ink-muted); font-size: 14px; font-weight: 500; }
.school-shell-logo {
  width: 48px; height: 48px; flex-shrink: 0; border-radius: 14px;
  background: rgba(14, 165, 165,0.1); display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.school-shell-logo img { width: 100%; height: 100%; object-fit: contain; }
.school-sec-title { font-size: 20px; font-weight: 800; color: var(--ink); margin: 0 0 16px; }
/* Uniform settings-group card, so language / notification / design each read as
   a clean distinct block. */
.school-set-card {
  background: #fff; border: 1px solid rgba(31,41,55,0.08); border-radius: 16px;
  padding: 16px 18px; margin-top: 14px; max-width: 620px;
}
.school-set-row {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
}
.school-set-label { font-size: 15.5px; font-weight: 700; color: var(--ink); }
.school-set-select {
  font-family: inherit; font-size: 14.5px; font-weight: 600; color: var(--ink);
  background: var(--mist); border: 1px solid rgba(31,41,55,0.12); border-radius: 10px;
  padding: 8px 12px; cursor: pointer;
}
@media (max-width: 720px) {
  .school-shell { flex-direction: column; }
  .school-shell-side { width: 100%; position: static; min-height: 0; flex-direction: column; }
  .school-shell-nav { flex-direction: row; flex-wrap: wrap; }
  .school-nav-item { width: auto; }
}

/* Unify the Schools dashboard to the mustard SKU accent. The classroom
   management chrome (buttons, code pills) was built with the core teal;
   inside the mustard shell that read as two accents in one view (Gadi QA
   2026-08-03). Scoped to this page only, so the /c/<CODE> kid surface and
   other teal chrome are untouched. */
.school-shell-page .wb-school-cta {
  background: #0EA5A5 !important;
  box-shadow: 0 1px 2px rgba(14, 165, 165,0.28), 0 8px 22px -8px rgba(14, 165, 165,0.42) !important;
}
.school-shell-page .wb-school-cta:hover { background: #0B8A8A !important; }
.school-shell-page .wb-school-cta:focus-visible { outline: 2px solid #0EA5A5 !important; }
.school-shell-page .wb-classroom-code { color: #0E7490; background: rgba(14, 165, 165,0.12); }
`;
