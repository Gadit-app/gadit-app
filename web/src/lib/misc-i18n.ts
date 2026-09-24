/**
 * misc-i18n — small UI strings that used to be inline `lang === "he" ? … : …`
 * ternaries (Hebrew/English only, or a partial set), now covering all 33 UI
 * languages (Gadi 2026-09-25 overnight i18n pass). Look up with `misc(key, lang)`;
 * English is the fallback. `{n}` is replaced by the caller.
 */
export type MiscKey =
  | "spellGate" | "seePlans" | "words" | "cancel" | "capture"
  | "offlineBanner" | "offlineBadge";

export const MISC: Record<string, Record<MiscKey, string>> = {
  en: { spellGate: "Dictation practice is available on the Family plan. Upgrade to practice.", seePlans: "See plans", words: "words", cancel: "Cancel", capture: "Take photo", offlineBanner: "You're offline · {n} words available", offlineBadge: "Offline" },
  he: { spellGate: "תרגול ההכתבה זמין במנוי Family. אפשר לשדרג כדי לתרגל.", seePlans: "לתוכניות", words: "מילים", cancel: "ביטול", capture: "צילום", offlineBanner: "אין חיבור לאינטרנט · {n} מילים זמינות", offlineBadge: "זמין אופליין" },
  ar: { spellGate: "تدريب الإملاء متاح في باقة Family. يمكنك الترقية للتدرّب.", seePlans: "عرض الباقات", words: "كلمات", cancel: "إلغاء", capture: "التقاط صورة", offlineBanner: "لا يوجد اتصال · {n} كلمات متاحة بدون إنترنت", offlineBadge: "متاح بدون إنترنت" },
  ru: { spellGate: "Тренировка диктантов доступна в тарифе Family. Обновите тариф, чтобы тренироваться.", seePlans: "Тарифы", words: "слов", cancel: "Отмена", capture: "Сделать фото", offlineBanner: "Нет интернета · {n} слов доступны офлайн", offlineBadge: "Доступно офлайн" },
  es: { spellGate: "La práctica de dictado está disponible en el plan Family. Mejora tu plan para practicar.", seePlans: "Ver planes", words: "palabras", cancel: "Cancelar", capture: "Tomar foto", offlineBanner: "Sin conexión · {n} palabras disponibles offline", offlineBadge: "Sin conexión" },
  pt: { spellGate: "A prática de ditado está disponível no plano Family. Faça upgrade para praticar.", seePlans: "Ver planos", words: "palavras", cancel: "Cancelar", capture: "Tirar foto", offlineBanner: "Sem conexão · {n} palavras disponíveis offline", offlineBadge: "Offline" },
  fr: { spellGate: "L'entraînement à la dictée est disponible avec l'offre Family. Passez à l'offre supérieure pour vous entraîner.", seePlans: "Voir les offres", words: "mots", cancel: "Annuler", capture: "Prendre une photo", offlineBanner: "Hors ligne · {n} mots disponibles", offlineBadge: "Hors ligne" },
  de: { spellGate: "Diktat-Training ist im Family-Tarif enthalten. Jetzt upgraden und üben.", seePlans: "Tarife ansehen", words: "Wörter", cancel: "Abbrechen", capture: "Foto aufnehmen", offlineBanner: "Offline · {n} Wörter verfügbar", offlineBadge: "Offline" },
  cs: { spellGate: "Procvičování diktátů je dostupné v tarifu Family. Pro procvičování přejděte na vyšší tarif.", seePlans: "Zobrazit tarify", words: "slov", cancel: "Zrušit", capture: "Vyfotit", offlineBanner: "Bez připojení · {n} slov dostupných offline", offlineBadge: "Offline" },
  sk: { spellGate: "Precvičovanie diktátov je dostupné v tarife Family. Na precvičovanie prejdite na vyšší tarif.", seePlans: "Zobraziť tarify", words: "slov", cancel: "Zrušiť", capture: "Odfotiť", offlineBanner: "Bez pripojenia · {n} slov dostupných offline", offlineBadge: "Offline" },
  it: { spellGate: "L'esercizio di dettato è disponibile con il piano Family. Passa a Family per esercitarti.", seePlans: "Vedi i piani", words: "parole", cancel: "Annulla", capture: "Scatta una foto", offlineBanner: "Offline · {n} parole disponibili", offlineBadge: "Offline" },
  ja: { spellGate: "書き取り練習は Family プランでご利用いただけます。アップグレードして練習しましょう。", seePlans: "プランを見る", words: "語", cancel: "キャンセル", capture: "写真を撮る", offlineBanner: "オフライン · {n} 語が利用可能", offlineBadge: "オフライン" },
  hi: { spellGate: "श्रुतलेख अभ्यास Family प्लान में उपलब्ध है। अभ्यास के लिए अपग्रेड करें।", seePlans: "प्लान देखें", words: "शब्द", cancel: "रद्द करें", capture: "फ़ोटो लें", offlineBanner: "ऑफ़लाइन · {n} शब्द उपलब्ध", offlineBadge: "ऑफ़लाइन" },
  am: { spellGate: "የቃላት ጽሕፈት ልምምድ በFamily ዕቅድ ውስጥ ይገኛል። ለመለማመድ ያሻሽሉ።", seePlans: "ዕቅዶችን ይመልከቱ", words: "ቃላት", cancel: "ሰርዝ", capture: "ፎቶ አንሳ", offlineBanner: "ከመስመር ውጭ · {n} ቃላት ይገኛሉ", offlineBadge: "ከመስመር ውጭ" },
  uk: { spellGate: "Тренування диктантів доступне в тарифі Family. Оновіть тариф, щоб тренуватися.", seePlans: "Тарифи", words: "слів", cancel: "Скасувати", capture: "Зробити фото", offlineBanner: "Немає інтернету · {n} слів доступно офлайн", offlineBadge: "Доступно офлайн" },
  tr: { spellGate: "Dikte alıştırması Family planında mevcut. Alıştırma yapmak için planını yükselt.", seePlans: "Planları gör", words: "kelime", cancel: "İptal", capture: "Fotoğraf çek", offlineBanner: "Çevrimdışı · {n} kelime kullanılabilir", offlineBadge: "Çevrimdışı" },
  pl: { spellGate: "Ćwiczenie dyktand jest dostępne w planie Family. Aby ćwiczyć, przejdź na wyższy plan.", seePlans: "Zobacz plany", words: "słów", cancel: "Anuluj", capture: "Zrób zdjęcie", offlineBanner: "Offline · dostępnych słów: {n}", offlineBadge: "Offline" },
  fa: { spellGate: "تمرین دیکته در طرح Family در دسترس است. برای تمرین، طرح خود را ارتقا دهید.", seePlans: "مشاهده طرح‌ها", words: "واژه", cancel: "لغو", capture: "گرفتن عکس", offlineBanner: "آفلاین · {n} واژه در دسترس", offlineBadge: "آفلاین" },
  id: { spellGate: "Latihan dikte tersedia di paket Family. Tingkatkan paket untuk berlatih.", seePlans: "Lihat paket", words: "kata", cancel: "Batal", capture: "Ambil foto", offlineBanner: "Offline · {n} kata tersedia", offlineBadge: "Offline" },
  nl: { spellGate: "Dictee oefenen is beschikbaar in het Family-abonnement. Upgrade om te oefenen.", seePlans: "Bekijk abonnementen", words: "woorden", cancel: "Annuleren", capture: "Foto maken", offlineBanner: "Offline · {n} woorden beschikbaar", offlineBadge: "Offline" },
  el: { spellGate: "Η εξάσκηση ορθογραφίας είναι διαθέσιμη στο πρόγραμμα Family. Αναβαθμίστε για να εξασκηθείτε.", seePlans: "Δείτε τα προγράμματα", words: "λέξεις", cancel: "Ακύρωση", capture: "Λήψη φωτογραφίας", offlineBanner: "Εκτός σύνδεσης · {n} λέξεις διαθέσιμες", offlineBadge: "Εκτός σύνδεσης" },
  zu: { spellGate: "Ukuzijwayeza ukubhala kutholakala ohlelweni lwe-Family. Thuthukisa ukuze uzijwayeze.", seePlans: "Bheka izinhlelo", words: "amagama", cancel: "Khansela", capture: "Thatha isithombe", offlineBanner: "Awuxhunyiwe · amagama angu-{n} ayatholakala", offlineBadge: "Ngaphandle kwe-inthanethi" },
  vi: { spellGate: "Luyện chính tả có trong gói Family. Nâng cấp để luyện tập.", seePlans: "Xem các gói", words: "từ", cancel: "Hủy", capture: "Chụp ảnh", offlineBanner: "Ngoại tuyến · {n} từ có sẵn", offlineBadge: "Ngoại tuyến" },
  fil: { spellGate: "Available ang pagsasanay sa dictation sa Family plan. Mag-upgrade para makapagsanay.", seePlans: "Tingnan ang mga plan", words: "salita", cancel: "Kanselahin", capture: "Kumuha ng litrato", offlineBanner: "Offline · {n} salita ang available", offlineBadge: "Offline" },
  af: { spellGate: "Diktee-oefening is beskikbaar op die Family-plan. Gradeer op om te oefen.", seePlans: "Sien planne", words: "woorde", cancel: "Kanselleer", capture: "Neem foto", offlineBanner: "Vanlyn · {n} woorde beskikbaar", offlineBadge: "Vanlyn" },
  sw: { spellGate: "Mazoezi ya imla yanapatikana kwenye mpango wa Family. Pandisha daraja ili kufanya mazoezi.", seePlans: "Tazama mipango", words: "maneno", cancel: "Ghairi", capture: "Piga picha", offlineBanner: "Nje ya mtandao · maneno {n} yanapatikana", offlineBadge: "Nje ya mtandao" },
  "zh-CN": { spellGate: "听写练习仅在 Family 方案中提供。升级即可开始练习。", seePlans: "查看方案", words: "个词", cancel: "取消", capture: "拍照", offlineBanner: "离线 · 可用 {n} 个词", offlineBadge: "离线可用" },
  "zh-TW": { spellGate: "聽寫練習僅在 Family 方案中提供。升級即可開始練習。", seePlans: "查看方案", words: "個詞", cancel: "取消", capture: "拍照", offlineBanner: "離線 · 可用 {n} 個詞", offlineBadge: "離線可用" },
  ko: { spellGate: "받아쓰기 연습은 Family 요금제에서 이용할 수 있습니다. 업그레이드하고 연습해 보세요.", seePlans: "요금제 보기", words: "단어", cancel: "취소", capture: "사진 찍기", offlineBanner: "오프라인 · 단어 {n}개 사용 가능", offlineBadge: "오프라인" },
  th: { spellGate: "การฝึกเขียนตามคำบอกมีในแพ็กเกจ Family อัปเกรดเพื่อเริ่มฝึก", seePlans: "ดูแพ็กเกจ", words: "คำ", cancel: "ยกเลิก", capture: "ถ่ายภาพ", offlineBanner: "ออฟไลน์ · มี {n} คำให้ใช้", offlineBadge: "ออฟไลน์" },
  bn: { spellGate: "শ্রুতলিখন অনুশীলন Family প্ল্যানে পাওয়া যায়। অনুশীলন করতে আপগ্রেড করুন।", seePlans: "প্ল্যান দেখুন", words: "শব্দ", cancel: "বাতিল", capture: "ছবি তুলুন", offlineBanner: "অফলাইন · {n}টি শব্দ উপলব্ধ", offlineBadge: "অফলাইন" },
  da: { spellGate: "Diktattræning er tilgængelig i Family-abonnementet. Opgrader for at øve.", seePlans: "Se abonnementer", words: "ord", cancel: "Annuller", capture: "Tag billede", offlineBanner: "Offline · {n} ord tilgængelige", offlineBadge: "Offline" },
  hu: { spellGate: "A tollbamondás-gyakorlás a Family csomagban érhető el. Válts csomagot a gyakorláshoz.", seePlans: "Csomagok megtekintése", words: "szó", cancel: "Mégse", capture: "Fotó készítése", offlineBanner: "Offline · {n} szó érhető el", offlineBadge: "Offline" },
};

export function misc(key: MiscKey, lang: string, n?: number): string {
  const s = MISC[lang]?.[key] ?? MISC.en[key];
  return n === undefined ? s : s.replace("{n}", String(n));
}
