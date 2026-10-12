/**
 * Parent alerts for everything a child finishes (Gadi 2026-10-12: "the
 * parent gets an alert, by their choice, on everything the child does and
 * finished": instantly, or in the daily summary). Dictation and Say it keep
 * their own lines in family-notify; these cover the rest: a lesson, a game,
 * "listen and pick", reading a text. 33 languages.
 *   title / lead take {kid} and {act}; actsTitle takes {n}.
 */
export type ActivityNotifyCopy = {
  title: string; lead: string;
  lesson: string; game: string; read: string; pick: string;
  actsTitle: string; actsLead: string;
};

export const ACTIVITY_NOTIFY: Record<string, ActivityNotifyCopy> = {
  en: { title: "{kid} finished: {act}", lead: "{kid} just finished:", lesson: "A lesson", game: "A game", read: "Reading a text", pick: "Listen and pick", actsTitle: "Today's summary: {n} activities", actsLead: "What your kids did today:" },
  he: { title: "{kid} סיים/ה: {act}", lead: "{kid} סיים/ה עכשיו:", lesson: "שיעור", game: "משחק", read: "קריאת טקסט", pick: "הקשיבו ובחרו", actsTitle: "סיכום היום: {n} פעילויות", actsLead: "מה הילדים עשו היום:" },
  ar: { title: "{kid} أنهى: {act}", lead: "أنهى {kid} للتو:", lesson: "درس", game: "لعبة", read: "قراءة نص", pick: "استمعوا واختاروا", actsTitle: "ملخص اليوم: {n} نشاطات", actsLead: "ما فعله أطفالك اليوم:" },
  ru: { title: "{kid}: {act}, готово", lead: "{kid} только что закончил(а):", lesson: "Урок", game: "Игра", read: "Чтение текста", pick: "Послушай и выбери", actsTitle: "Итог дня: занятий {n}", actsLead: "Чем занимались дети сегодня:" },
  es: { title: "{kid} terminó: {act}", lead: "{kid} acaba de terminar:", lesson: "Una lección", game: "Un juego", read: "Leer un texto", pick: "Escucha y elige", actsTitle: "Resumen del día: {n} actividades", actsLead: "Lo que hicieron tus hijos hoy:" },
  pt: { title: "{kid} terminou: {act}", lead: "{kid} acabou de terminar:", lesson: "Uma lição", game: "Um jogo", read: "Ler um texto", pick: "Ouça e escolha", actsTitle: "Resumo do dia: {n} atividades", actsLead: "O que seus filhos fizeram hoje:" },
  fr: { title: "{kid} a terminé : {act}", lead: "{kid} vient de terminer :", lesson: "Une leçon", game: "Un jeu", read: "Lire un texte", pick: "Écoute et choisis", actsTitle: "Résumé du jour : {n} activités", actsLead: "Ce que vos enfants ont fait aujourd'hui :" },
  de: { title: "{kid} ist fertig: {act}", lead: "{kid} hat gerade beendet:", lesson: "Eine Lektion", game: "Ein Spiel", read: "Einen Text lesen", pick: "Hören und wählen", actsTitle: "Tagesübersicht: {n} Aktivitäten", actsLead: "Was eure Kinder heute gemacht haben:" },
  cs: { title: "{kid} dokončil(a): {act}", lead: "{kid} právě dokončil(a):", lesson: "Lekci", game: "Hru", read: "Čtení textu", pick: "Poslouchej a vyber", actsTitle: "Shrnutí dne: aktivit {n}", actsLead: "Co dnes děti dělaly:" },
  sk: { title: "{kid} dokončil(a): {act}", lead: "{kid} práve dokončil(a):", lesson: "Lekciu", game: "Hru", read: "Čítanie textu", pick: "Počúvaj a vyber", actsTitle: "Zhrnutie dňa: aktivít {n}", actsLead: "Čo dnes deti robili:" },
  it: { title: "{kid} ha finito: {act}", lead: "{kid} ha appena finito:", lesson: "Una lezione", game: "Un gioco", read: "Leggere un testo", pick: "Ascolta e scegli", actsTitle: "Riepilogo del giorno: {n} attività", actsLead: "Cosa hanno fatto oggi i vostri figli:" },
  ja: { title: "{kid}が終わりました：{act}", lead: "{kid}がたった今終えました：", lesson: "レッスン", game: "ゲーム", read: "文章を読む", pick: "聞いてえらぶ", actsTitle: "今日のまとめ：{n}件の活動", actsLead: "今日お子さんがしたこと：" },
  hi: { title: "{kid} ने पूरा किया: {act}", lead: "{kid} ने अभी पूरा किया:", lesson: "एक पाठ", game: "एक खेल", read: "पाठ पढ़ना", pick: "सुनें और चुनें", actsTitle: "आज का सारांश: {n} गतिविधियाँ", actsLead: "आज बच्चों ने क्या किया:" },
  am: { title: "{kid} ጨረሰ/ች፦ {act}", lead: "{kid} አሁን ጨረሰ/ች፦", lesson: "ትምህርት", game: "ጨዋታ", read: "ጽሑፍ ማንበብ", pick: "አዳምጡና ምረጡ", actsTitle: "የዛሬ ማጠቃለያ፦ {n} እንቅስቃሴዎች", actsLead: "ልጆቹ ዛሬ ያደረጉት፦" },
  uk: { title: "{kid}: {act}, готово", lead: "{kid} щойно закінчив(ла):", lesson: "Урок", game: "Гра", read: "Читання тексту", pick: "Послухай і вибери", actsTitle: "Підсумок дня: занять {n}", actsLead: "Чим діти займалися сьогодні:" },
  tr: { title: "{kid} bitirdi: {act}", lead: "{kid} az önce bitirdi:", lesson: "Bir ders", game: "Bir oyun", read: "Metin okuma", pick: "Dinle ve seç", actsTitle: "Günün özeti: {n} etkinlik", actsLead: "Çocuklarınızın bugün yaptıkları:" },
  pl: { title: "{kid} skończył(a): {act}", lead: "{kid} właśnie skończył(a):", lesson: "Lekcję", game: "Grę", read: "Czytanie tekstu", pick: "Posłuchaj i wybierz", actsTitle: "Podsumowanie dnia: aktywności {n}", actsLead: "Co dzieci robiły dzisiaj:" },
  fa: { title: "{kid} تمام کرد: {act}", lead: "{kid} همین الان تمام کرد:", lesson: "یک درس", game: "یک بازی", read: "خواندن متن", pick: "گوش کنید و انتخاب کنید", actsTitle: "خلاصهٔ امروز: {n} فعالیت", actsLead: "کارهایی که بچه‌ها امروز انجام دادند:" },
  id: { title: "{kid} selesai: {act}", lead: "{kid} baru saja menyelesaikan:", lesson: "Sebuah pelajaran", game: "Sebuah permainan", read: "Membaca teks", pick: "Dengar dan pilih", actsTitle: "Ringkasan hari ini: {n} kegiatan", actsLead: "Yang dilakukan anak-anak hari ini:" },
  nl: { title: "{kid} is klaar: {act}", lead: "{kid} heeft net afgerond:", lesson: "Een les", game: "Een spel", read: "Een tekst lezen", pick: "Luister en kies", actsTitle: "Dagoverzicht: {n} activiteiten", actsLead: "Wat je kinderen vandaag deden:" },
  el: { title: "{kid} ολοκλήρωσε: {act}", lead: "{kid} μόλις ολοκλήρωσε:", lesson: "Ένα μάθημα", game: "Ένα παιχνίδι", read: "Ανάγνωση κειμένου", pick: "Άκου και διάλεξε", actsTitle: "Σύνοψη ημέρας: {n} δραστηριότητες", actsLead: "Τι έκαναν τα παιδιά σήμερα:" },
  zu: { title: "{kid} uqedile: {act}", lead: "{kid} usanda kuqeda:", lesson: "Isifundo", game: "Umdlalo", read: "Ukufunda umbhalo", pick: "Lalela ukhethe", actsTitle: "Isifinyezo sanamuhla: imisebenzi engu-{n}", actsLead: "Okwenziwe yizingane namuhla:" },
  vi: { title: "{kid} đã xong: {act}", lead: "{kid} vừa hoàn thành:", lesson: "Một bài học", game: "Một trò chơi", read: "Đọc văn bản", pick: "Nghe và chọn", actsTitle: "Tóm tắt hôm nay: {n} hoạt động", actsLead: "Hôm nay các con đã làm:" },
  fil: { title: "Natapos ni {kid}: {act}", lead: "Kakatapos lang ni {kid}:", lesson: "Isang aralin", game: "Isang laro", read: "Pagbasa ng teksto", pick: "Makinig at pumili", actsTitle: "Buod ngayong araw: {n} gawain", actsLead: "Ang ginawa ng mga bata ngayon:" },
  af: { title: "{kid} is klaar: {act}", lead: "{kid} het pas klaargemaak:", lesson: "'n Les", game: "'n Speletjie", read: "'n Teks lees", pick: "Luister en kies", actsTitle: "Vandag se opsomming: {n} aktiwiteite", actsLead: "Wat julle kinders vandag gedoen het:" },
  sw: { title: "{kid} amemaliza: {act}", lead: "{kid} amemaliza sasa hivi:", lesson: "Somo", game: "Mchezo", read: "Kusoma maandishi", pick: "Sikiliza na uchague", actsTitle: "Muhtasari wa leo: shughuli {n}", actsLead: "Watoto walichofanya leo:" },
  "zh-CN": { title: "{kid}完成了：{act}", lead: "{kid}刚刚完成了：", lesson: "一节课", game: "一个游戏", read: "阅读文章", pick: "听一听，选一选", actsTitle: "今日小结：{n}项活动", actsLead: "孩子们今天做了这些：" },
  "zh-TW": { title: "{kid}完成了：{act}", lead: "{kid}剛剛完成了：", lesson: "一堂課", game: "一個遊戲", read: "閱讀文章", pick: "聽一聽，選一選", actsTitle: "今日小結：{n}項活動", actsLead: "孩子們今天做了這些：" },
  ko: { title: "{kid}이(가) 끝냈어요: {act}", lead: "{kid}이(가) 방금 끝냈어요:", lesson: "수업", game: "게임", read: "글 읽기", pick: "듣고 고르기", actsTitle: "오늘의 요약: 활동 {n}개", actsLead: "오늘 아이들이 한 일:" },
  th: { title: "{kid} ทำเสร็จแล้ว: {act}", lead: "{kid} เพิ่งทำเสร็จ:", lesson: "บทเรียน", game: "เกม", read: "อ่านข้อความ", pick: "ฟังแล้วเลือก", actsTitle: "สรุปวันนี้: {n} กิจกรรม", actsLead: "สิ่งที่ลูกๆ ทำวันนี้:" },
  bn: { title: "{kid} শেষ করেছে: {act}", lead: "{kid} এইমাত্র শেষ করেছে:", lesson: "একটি পাঠ", game: "একটি খেলা", read: "লেখা পড়া", pick: "শুনুন ও বেছে নিন", actsTitle: "আজকের সারাংশ: {n}টি কাজ", actsLead: "আজ বাচ্চারা যা করেছে:" },
  da: { title: "{kid} er færdig: {act}", lead: "{kid} er lige blevet færdig med:", lesson: "En lektion", game: "Et spil", read: "At læse en tekst", pick: "Lyt og vælg", actsTitle: "Dagens opsummering: {n} aktiviteter", actsLead: "Det har jeres børn lavet i dag:" },
  hu: { title: "{kid} befejezte: {act}", lead: "{kid} épp most fejezte be:", lesson: "Egy leckét", game: "Egy játékot", read: "Szövegolvasást", pick: "Hallgasd és válassz", actsTitle: "A nap összefoglalója: {n} tevékenység", actsLead: "Amit a gyerekek ma csináltak:" },
};

export function activityNotifyCopy(lang: string): ActivityNotifyCopy {
  return ACTIVITY_NOTIFY[lang] ?? ACTIVITY_NOTIFY.en;
}
