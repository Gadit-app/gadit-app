"use client";

/**
 * Kid avatar skins (Gadi 2026-10-30): the "My skins" panel and the
 * "new skin unlocked" moment. Skins open by completed practice (lib/looks.ts);
 * the server checks the unlock and saves the choice (/api/kids/skin), and the
 * new avatar shows everywhere the member avatar already shows.
 *
 * Mounted from AppearancePicker, which sits in the topbar of every kid page.
 */

import { useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { KID_AVATARS, avatarUrl } from "@/lib/family";
import { LOOKS, LOOK_SETS, isLookUnlocked, unlockedCount, type LookDef, type LookSet } from "@/lib/looks";

type SkinCopy = {
  open: string;
  title: string;
  sub: (n: number, total: number) => string;
  locked: (n: number) => string;
  wearing: string;
  classics: string;
  sets: Record<LookSet, string>;
  newTitle: string;
  putOn: string;
  later: string;
  close: string;
  backgrounds: string;
};

// "N more practices" plural pickers: ru/uk one / few (2-4, not 12-14) / many;
// pl the same but only exactly 1 takes "one"; sk 1 / 2-4 / 5+.
function pluralRu(n: number, one: string, few: string, many: string): string {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
}
function pluralPl(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const a = n % 10, b = n % 100;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
}
function pluralCs(n: number, one: string, few: string, many: string): string {
  return n === 1 ? one : n >= 2 && n <= 4 ? few : many;
}

// Kid-facing: each language's informal "you" (Hebrew, Arabic and Amharic in
// the plural so the copy stays gender-neutral). The word for "skin" matches
// the guide strings (guide-i18n-translations "ui.newSkin").
const COPY: Record<string, SkinCopy> = {
  en: {
    open: "My skins",
    title: "My skins",
    sub: (n, total) => `You've unlocked ${n} of ${total}. Every finished practice brings the next one closer`,
    locked: (n) => (n === 1 ? "1 more practice" : `${n} more practices`),
    wearing: "Wearing",
    classics: "Classics",
    sets: { space: "Space Crew", magic: "Word Wizards", street: "Street Style", ninja: "Shadow Ninjas", sport: "Game Day", hoodie: "Wild Hoodies" },
    newTitle: "New skin unlocked",
    putOn: "Put it on",
    later: "Later",
    close: "Close",
    backgrounds: "Backgrounds",
  },
  he: {
    open: "הסקינים שלי",
    title: "הסקינים שלי",
    sub: (n, total) => `פתחתם ${n} מתוך ${total}. כל תרגול שמסיימים מקרב אתכם לסקין הבא`,
    locked: (n) => (n === 1 ? "עוד תרגול אחד" : `עוד ${n} תרגולים`),
    wearing: "עליכם עכשיו",
    classics: "הקלאסיים",
    sets: { space: "צוות החלל", magic: "קוסמי המילים", street: "סטייל רחוב", ninja: "נינג׳ות הצללים", sport: "יום משחק", hoodie: "קפוצ׳וני חיות" },
    newTitle: "נפתח סקין חדש",
    putOn: "ללבוש עכשיו",
    later: "אחר כך",
    close: "סגירה",
    backgrounds: "רקעים",
  },
  ar: {
    open: "سكناتي",
    title: "سكناتي",
    sub: (n, total) => `فتحتم ${n} من ${total}. كل تدريب تنهونه يقرّبكم من السكن التالي`,
    locked: (n) => (n === 1 ? "بقي تدريب واحد" : n === 2 ? "بقي تدريبان" : n % 100 >= 3 && n % 100 <= 10 ? `بقيت ${n} تدريبات` : `بقي ${n} تدريبًا`),
    wearing: "تلبسونه الآن",
    classics: "الكلاسيكية",
    sets: { space: "طاقم الفضاء", magic: "سحرة الكلمات", street: "ستايل الشارع", ninja: "نينجا الظلال", sport: "يوم المباراة", hoodie: "هوديات برّية" },
    newTitle: "تم فتح سكن جديد",
    putOn: "البسوه الآن",
    later: "لاحقًا",
    close: "إغلاق",
    backgrounds: "الخلفيات",
  },
  ru: {
    open: "Мои скины",
    title: "Мои скины",
    sub: (n, total) => `Открыто ${n} из ${total}. Каждая законченная тренировка приближает следующий скин`,
    locked: (n) => `ещё ${n} ${pluralRu(n, "тренировка", "тренировки", "тренировок")}`,
    wearing: "Надето",
    classics: "Классика",
    sets: { space: "Космический экипаж", magic: "Волшебники слов", street: "Уличный стиль", ninja: "Ниндзя теней", sport: "День матча", hoodie: "Дикие худи" },
    newTitle: "Открыт новый скин",
    putOn: "Надеть",
    later: "Потом",
    close: "Закрыть",
    backgrounds: "Фоны",
  },
  es: {
    open: "Mis skins",
    title: "Mis skins",
    sub: (n, total) => `Has desbloqueado ${n} de ${total}. Cada práctica terminada te acerca a la siguiente`,
    locked: (n) => (n === 1 ? "1 práctica más" : `${n} prácticas más`),
    wearing: "La llevas puesta",
    classics: "Clásicas",
    sets: { space: "Tripulación espacial", magic: "Magos de palabras", street: "Estilo urbano", ninja: "Ninjas de la sombra", sport: "Día de partido", hoodie: "Sudaderas salvajes" },
    newTitle: "Nueva skin desbloqueada",
    putOn: "Póntela",
    later: "Luego",
    close: "Cerrar",
    backgrounds: "Fondos",
  },
  pt: {
    open: "Minhas skins",
    title: "Minhas skins",
    sub: (n, total) => `Você desbloqueou ${n} de ${total}. Cada prática concluída deixa a próxima mais perto`,
    locked: (n) => (n === 1 ? "mais 1 prática" : `mais ${n} práticas`),
    wearing: "Usando agora",
    classics: "Clássicas",
    sets: { space: "Tripulação espacial", magic: "Magos das palavras", street: "Estilo de rua", ninja: "Ninjas das sombras", sport: "Dia de jogo", hoodie: "Moletons selvagens" },
    newTitle: "Nova skin desbloqueada",
    putOn: "Usar agora",
    later: "Depois",
    close: "Fechar",
    backgrounds: "Fundos",
  },
  fr: {
    open: "Mes skins",
    title: "Mes skins",
    sub: (n, total) => `Tu as débloqué ${n} sur ${total}. Chaque exercice terminé te rapproche du suivant`,
    locked: (n) => (n === 1 ? "encore 1 exercice" : `encore ${n} exercices`),
    wearing: "Porté",
    classics: "Classiques",
    sets: { space: "Équipage spatial", magic: "Magiciens des mots", street: "Style urbain", ninja: "Ninjas de l'ombre", sport: "Jour de match", hoodie: "Sweats sauvages" },
    newTitle: "Nouveau skin débloqué",
    putOn: "Le mettre",
    later: "Plus tard",
    close: "Fermer",
    backgrounds: "Fonds",
  },
  de: {
    open: "Meine Skins",
    title: "Meine Skins",
    sub: (n, total) => `Du hast ${n} von ${total} freigeschaltet. Jede fertige Übung bringt dich dem nächsten näher`,
    locked: (n) => (n === 1 ? "noch 1 Übung" : `noch ${n} Übungen`),
    wearing: "Trägst du",
    classics: "Klassiker",
    sets: { space: "Weltraum-Crew", magic: "Wortzauberer", street: "Streetstyle", ninja: "Schattenninjas", sport: "Spieltag", hoodie: "Wilde Hoodies" },
    newTitle: "Neuer Skin freigeschaltet",
    putOn: "Anziehen",
    later: "Später",
    close: "Schließen",
    backgrounds: "Hintergründe",
  },
  cs: {
    open: "Moje skiny",
    title: "Moje skiny",
    sub: (n, total) => `Odemčeno ${n} z ${total}. Každé dokončené cvičení tě přiblíží k dalšímu`,
    locked: (n) => `ještě ${n} cvičení`,
    wearing: "Máš na sobě",
    classics: "Klasika",
    sets: { space: "Vesmírná posádka", magic: "Kouzelníci slov", street: "Pouliční styl", ninja: "Stínoví nindžové", sport: "Den zápasu", hoodie: "Divoké mikiny" },
    newTitle: "Odemčen nový skin",
    putOn: "Obléct",
    later: "Později",
    close: "Zavřít",
    backgrounds: "Pozadí",
  },
  sk: {
    open: "Moje skiny",
    title: "Moje skiny",
    sub: (n, total) => `Odomknuté ${n} z ${total}. Každé dokončené cvičenie ťa priblíži k ďalšiemu`,
    locked: (n) => `ešte ${n} ${pluralCs(n, "cvičenie", "cvičenia", "cvičení")}`,
    wearing: "Máš na sebe",
    classics: "Klasika",
    sets: { space: "Vesmírna posádka", magic: "Čarodejníci slov", street: "Pouličný štýl", ninja: "Tieňoví nindžovia", sport: "Deň zápasu", hoodie: "Divoké mikiny" },
    newTitle: "Odomknutý nový skin",
    putOn: "Obliecť",
    later: "Neskôr",
    close: "Zavrieť",
    backgrounds: "Pozadia",
  },
  it: {
    open: "Le mie skin",
    title: "Le mie skin",
    sub: (n, total) => `Hai sbloccato ${n} su ${total}. Ogni esercizio finito ti avvicina alla prossima`,
    locked: (n) => (n === 1 ? "ancora 1 esercizio" : `ancora ${n} esercizi`),
    wearing: "Indossata",
    classics: "Classiche",
    sets: { space: "Equipaggio spaziale", magic: "Maghi delle parole", street: "Stile street", ninja: "Ninja delle ombre", sport: "Giorno di partita", hoodie: "Felpe selvagge" },
    newTitle: "Nuova skin sbloccata",
    putOn: "Indossala",
    later: "Dopo",
    close: "Chiudi",
    backgrounds: "Sfondi",
  },
  ja: {
    open: "マイスキン",
    title: "マイスキン",
    sub: (n, total) => `${total}こ中 ${n}こ 解放。練習を1つ終えるたびに、次のスキンに近づくよ`,
    locked: (n) => `あと${n}回の練習`,
    wearing: "着てるよ",
    classics: "クラシック",
    sets: { space: "宇宙クルー", magic: "ことばの魔法使い", street: "ストリート", ninja: "影の忍者", sport: "試合の日", hoodie: "ワイルドパーカー" },
    newTitle: "新しいスキンを解放",
    putOn: "着てみる",
    later: "あとで",
    close: "閉じる",
    backgrounds: "背景",
  },
  hi: {
    open: "मेरी स्किन",
    title: "मेरी स्किन",
    sub: (n, total) => `तुमने ${total} में से ${n} खोल लीं। हर पूरा अभ्यास अगली स्किन को पास लाता है`,
    locked: (n) => `${n} और अभ्यास`,
    wearing: "पहनी हुई",
    classics: "क्लासिक",
    sets: { space: "अंतरिक्ष दल", magic: "शब्दों के जादूगर", street: "स्ट्रीट स्टाइल", ninja: "छाया निंजा", sport: "मैच का दिन", hoodie: "जंगली हुडी" },
    newTitle: "नई स्किन अनलॉक हुई",
    putOn: "पहन लो",
    later: "बाद में",
    close: "बंद करो",
    backgrounds: "बैकग्राउंड",
  },
  am: {
    open: "የእኔ ስኪኖች",
    title: "የእኔ ስኪኖች",
    sub: (n, total) => `ከ${total} ውስጥ ${n} ከፍታችኋል። እያንዳንዱ የጨረሳችሁት ልምምድ ቀጣዩን ያቀርባል`,
    locked: (n) => (n === 1 ? "1 ተጨማሪ ልምምድ" : `${n} ተጨማሪ ልምምዶች`),
    wearing: "የለበሳችሁት",
    classics: "ክላሲኮች",
    sets: { space: "የጠፈር ቡድን", magic: "የቃላት ጠንቋዮች", street: "የመንገድ ስታይል", ninja: "የጥላ ኒንጃዎች", sport: "የጨዋታ ቀን", hoodie: "የዱር ሁዲዎች" },
    newTitle: "አዲስ ስኪን ተከፍቷል",
    putOn: "አሁን ልበሱት",
    later: "በኋላ",
    close: "ዝጋ",
    backgrounds: "ዳራዎች",
  },
  uk: {
    open: "Мої скіни",
    title: "Мої скіни",
    sub: (n, total) => `Відкрито ${n} з ${total}. Кожне завершене тренування наближає наступний скін`,
    locked: (n) => `ще ${n} ${pluralRu(n, "тренування", "тренування", "тренувань")}`,
    wearing: "Вдягнено",
    classics: "Класика",
    sets: { space: "Космічний екіпаж", magic: "Чарівники слів", street: "Вуличний стиль", ninja: "Ніндзя тіней", sport: "День гри", hoodie: "Дикі худі" },
    newTitle: "Відкрито новий скін",
    putOn: "Вдягнути",
    later: "Пізніше",
    close: "Закрити",
    backgrounds: "Фони",
  },
  tr: {
    open: "Skinlerim",
    title: "Skinlerim",
    sub: (n, total) => `${total} skinden ${n} tanesini açtın. Bitirdiğin her alıştırma sonrakini yaklaştırır`,
    locked: (n) => `${n} alıştırma daha`,
    wearing: "Üstünde",
    classics: "Klasikler",
    sets: { space: "Uzay Ekibi", magic: "Kelime Büyücüleri", street: "Sokak Stili", ninja: "Gölge Ninjalar", sport: "Maç Günü", hoodie: "Vahşi Kapüşonlular" },
    newTitle: "Yeni skin açıldı",
    putOn: "Giy",
    later: "Sonra",
    close: "Kapat",
    backgrounds: "Arka planlar",
  },
  pl: {
    open: "Moje skiny",
    title: "Moje skiny",
    sub: (n, total) => `Odblokowano ${n} z ${total}. Każde ukończone ćwiczenie przybliża cię do następnego`,
    locked: (n) => `jeszcze ${n} ${pluralPl(n, "ćwiczenie", "ćwiczenia", "ćwiczeń")}`,
    wearing: "Masz na sobie",
    classics: "Klasyki",
    sets: { space: "Kosmiczna załoga", magic: "Czarodzieje słów", street: "Uliczny styl", ninja: "Ninja cienia", sport: "Dzień meczu", hoodie: "Dzikie bluzy" },
    newTitle: "Odblokowano nowy skin",
    putOn: "Załóż",
    later: "Później",
    close: "Zamknij",
    backgrounds: "Tła",
  },
  fa: {
    open: "اسکین‌های من",
    title: "اسکین‌های من",
    sub: (n, total) => `${n} از ${total} را باز کردی. هر تمرینی که تمام کنی، اسکین بعدی را نزدیک‌تر می‌کند`,
    locked: (n) => `${n} تمرین دیگر`,
    wearing: "پوشیده‌ای",
    classics: "کلاسیک‌ها",
    sets: { space: "خدمه‌ی فضایی", magic: "جادوگران واژه", street: "استایل خیابانی", ninja: "نینجاهای سایه", sport: "روز مسابقه", hoodie: "هودی‌های وحشی" },
    newTitle: "اسکین جدید باز شد",
    putOn: "بپوش",
    later: "بعداً",
    close: "بستن",
    backgrounds: "پس‌زمینه‌ها",
  },
  id: {
    open: "Skin-ku",
    title: "Skin-ku",
    sub: (n, total) => `Kamu sudah membuka ${n} dari ${total}. Setiap latihan yang selesai mendekatkan skin berikutnya`,
    locked: (n) => `${n} latihan lagi`,
    wearing: "Dipakai",
    classics: "Klasik",
    sets: { space: "Kru Luar Angkasa", magic: "Penyihir Kata", street: "Gaya Jalanan", ninja: "Ninja Bayangan", sport: "Hari Pertandingan", hoodie: "Hoodie Liar" },
    newTitle: "Skin baru terbuka",
    putOn: "Pakai",
    later: "Nanti",
    close: "Tutup",
    backgrounds: "Latar",
  },
  nl: {
    open: "Mijn skins",
    title: "Mijn skins",
    sub: (n, total) => `Je hebt ${n} van de ${total} vrijgespeeld. Elke afgeronde oefening brengt de volgende dichterbij`,
    locked: (n) => (n === 1 ? "nog 1 oefening" : `nog ${n} oefeningen`),
    wearing: "Draag je nu",
    classics: "Klassiekers",
    sets: { space: "Ruimtecrew", magic: "Woordtovenaars", street: "Straatstijl", ninja: "Schaduwninja's", sport: "Wedstrijddag", hoodie: "Wilde hoodies" },
    newTitle: "Nieuwe skin vrijgespeeld",
    putOn: "Aantrekken",
    later: "Later",
    close: "Sluiten",
    backgrounds: "Achtergronden",
  },
  el: {
    open: "Τα skins μου",
    title: "Τα skins μου",
    sub: (n, total) => `Ξεκλείδωσες ${n} από ${total}. Κάθε εξάσκηση που τελειώνεις φέρνει πιο κοντά το επόμενο`,
    locked: (n) => (n === 1 ? "1 εξάσκηση ακόμα" : `${n} εξασκήσεις ακόμα`),
    wearing: "Το φοράς",
    classics: "Κλασικά",
    sets: { space: "Πλήρωμα του διαστήματος", magic: "Μάγοι των λέξεων", street: "Στυλ δρόμου", ninja: "Νίντζα της σκιάς", sport: "Μέρα αγώνα", hoodie: "Άγρια φούτερ" },
    newTitle: "Ξεκλείδωσε νέο skin",
    putOn: "Φόρεσέ το",
    later: "Αργότερα",
    close: "Κλείσιμο",
    backgrounds: "Φόντα",
  },
  zu: {
    open: "Ama-skin ami",
    title: "Ama-skin ami",
    sub: (n, total) => `Usuvule angu-${n} kwangu-${total}. Ukuzilolonga ngakunye okuqediwe kusondeza i-skin elandelayo`,
    locked: (n) => (n === 1 ? "Kusele isivivinyo esi-1" : `Kusele izivivinyo ezingu-${n}`),
    wearing: "Oyigqokile",
    classics: "Ezakudala",
    sets: { space: "Iqembu Lasemkhathini", magic: "Osomlingo Bamagama", street: "Isitayela Sasemgwaqweni", ninja: "AmaNinja Esithunzi", sport: "Usuku Lomdlalo", hoodie: "Ama-hoodie Asendle" },
    newTitle: "Kuvulwe i-skin entsha",
    putOn: "Yigqoke",
    later: "Kamuva",
    close: "Vala",
    backgrounds: "Izizinda",
  },
  xh: {
    open: "Ii-skin zam",
    title: "Ii-skin zam",
    sub: (n, total) => `Uvule ezi-${n} kwezi-${total}. Umthambo ngamnye ogqityiweyo usondeza i-skin elandelayo`,
    locked: (n) => (n === 1 ? "Kusele umthambo omnye" : `Kusele imithambo eli-${n}`),
    wearing: "Oyinxibileyo",
    classics: "Ezakudala",
    sets: { space: "Iqela Lasemajukujukwini", magic: "Abenzi-mmangaliso Bamagama", street: "Isitayile Sasesitratweni", ninja: "AmaNinja Esithunzi", sport: "Usuku Lomdlalo", hoodie: "Ii-hoodie Zasendle" },
    newTitle: "Kuvulwe i-skin entsha",
    putOn: "Yinxibe",
    later: "Kamva",
    close: "Vala",
    backgrounds: "Imvelaphi",
  },
  nso: {
    open: "Di-skin tša ka",
    title: "Di-skin tša ka",
    sub: (n, total) => `O butše tše ${n} go tše ${total}. Tlwaetšo ye nngwe le ye nngwe ye o e feditšego e batametša skin ye e latelago`,
    locked: (n) => (n === 1 ? "Tlwaetšo e 1 gape" : `Ditlwaetšo tše ${n} gape`),
    wearing: "O e apere",
    classics: "Tša kgale",
    sets: { space: "Sehlopha sa Sepeisi", magic: "Bo-ramaleatlana ba Mantšu", street: "Setaele sa Seterateng", ninja: "Dininja tša Moriti", sport: "Letšatši la Papadi", hoodie: "Di-hoodie tša Naga" },
    newTitle: "Skin ye mpsha e butšwe",
    putOn: "E apare",
    later: "Ka morago",
    close: "Tswalela",
    backgrounds: "Bokamorago",
  },
  tn: {
    open: "Di-skin tsa me",
    title: "Di-skin tsa me",
    sub: (n, total) => `O butse di le ${n} mo go di le ${total}. Katiso nngwe le nngwe e o e weditseng e atametsa skin e e latelang`,
    locked: (n) => (n === 1 ? "Katiso e le 1 gape" : `Dikatiso di le ${n} gape`),
    wearing: "O e apere",
    classics: "Tsa bogologolo",
    sets: { space: "Setlhopha sa Sebaka", magic: "Baselamose ba Mafoko", street: "Setaele sa Mmila", ninja: "Dininja tsa Moriti", sport: "Letsatsi la Motshameko", hoodie: "Di-hoodie tsa Naga" },
    newTitle: "Skin e ntšha e butswe",
    putOn: "E apare",
    later: "Moragonyana",
    close: "Tswala",
    backgrounds: "Bokamorago",
  },
  st: {
    open: "Di-skin tsa ka",
    title: "Di-skin tsa ka",
    sub: (n, total) => `O notlolotse tse ${n} ho tse ${total}. Boikwetliso bo bong le bo bong boo o bo qetang bo atametsa skin e latelang`,
    locked: (n) => (n === 1 ? "Boikwetliso bo le 1 hape" : `Maikwetliso a ${n} hape`),
    wearing: "O e apere",
    classics: "Tsa kgale",
    sets: { space: "Sehlopha sa Sebaka", magic: "Boramehlolo ba Mantswe", street: "Setaele sa Seterata", ninja: "Dininja tsa Moriti", sport: "Letsatsi la Papadi", hoodie: "Di-hoodie tsa Naha" },
    newTitle: "Skin e ntjha e notlolotswe",
    putOn: "E apare",
    later: "Hamorao",
    close: "Kwala",
    backgrounds: "Bokamorao",
  },
  ts: {
    open: "Ti-skin ta mina",
    title: "Ti-skin ta mina",
    sub: (n, total) => `U pfule ${n} eka ${total}. Ndzetelo yin'wana ni yin'wana leyi u yi heteke yi tshinetela skin leyi landzelaka`,
    locked: (n) => (n === 1 ? "Ku sale ndzetelo yin'we" : `Ku sale tindzetelo ta ${n}`),
    wearing: "U yi ambale",
    classics: "Ta khale",
    sets: { space: "Ntlawa wa Xibakabaka", magic: "Vaendli va Masingita ya Marito", street: "Xitayela xa Xitarata", ninja: "Ti-ninja ta Ndzhuti", sport: "Siku ra Ntlangu", hoodie: "Ti-hoodie ta Nhova" },
    newTitle: "Skin leyintshwa yi pfuriwile",
    putOn: "Yi ambale",
    later: "Endzhaku",
    close: "Pfala",
    backgrounds: "Tindzhaku",
  },
  ss: {
    open: "Ema-skin ami",
    title: "Ema-skin ami",
    sub: (n, total) => `Uvule la-${n} kulala-${total}. Kuzijwayeta ngakunye lokucedzile kusondzeta i-skin lelandzelako`,
    locked: (n) => (n === 1 ? "Kusele sivivinyo sinye" : `Kusele tivivinyo letingu-${n}`),
    wearing: "Loyigcokile",
    classics: "Takadzala",
    sets: { space: "Licembu Lasemkhatsini", magic: "Balumbi Bemagama", street: "Sitayela Sasemgwaceni", ninja: "Emaninja Esitfunti", sport: "Lilanga Lemdlalo", hoodie: "Ema-hoodie Asendle" },
    newTitle: "Kuvulwe i-skin lensha",
    putOn: "Yigcoke",
    later: "Ngemuva",
    close: "Vala",
    backgrounds: "Tindzawo tangemuva",
  },
  ve: {
    open: "Dziskin dzanga",
    title: "Dziskin dzanga",
    sub: (n, total) => `No vula ${n} kha ${total}. Nḓowedzo iṅwe na iṅwe ye na i fhedza i sendedza skin i tevhelaho`,
    locked: (n) => (n === 1 ? "Nḓowedzo nthihi yo salaho" : `Nḓowedzo dza ${n} dzo salaho`),
    wearing: "Ye na i ambara",
    classics: "Dza kale",
    sets: { space: "Tshigwada tsha Ṱaḓulu", magic: "Vhangome vha Maipfi", street: "Tshitaela tsha Zwiṱaraṱa", ninja: "Vhaninja vha Murunzi", sport: "Ḓuvha ḽa Mutambo", hoodie: "Dzihoodie dza Ḓaka" },
    newTitle: "Skin ntswa yo vulwa",
    putOn: "I ambareni",
    later: "Nga murahu",
    close: "Valani",
    backgrounds: "Zwa murahu",
  },
  nr: {
    open: "Ama-skin wami",
    title: "Ama-skin wami",
    sub: (n, total) => `Uvule ali-${n} kwali-${total}. Ukuzilolonga ngakunye okuqediweko kusondeza i-skin elandelako`,
    locked: (n) => (n === 1 ? "Kusele ukuzilolonga okukodwa" : `Kusele iinkhathi ezi-${n} zokuzilolonga`),
    wearing: "Oyifakileko",
    classics: "Zakade",
    sets: { space: "Isiqhema Somkhathi", magic: "Abalumbi Bamezwi", street: "Isitayela Sesitarada", ninja: "AmaNinja Wesithunzi", sport: "Ilanga Lomdlalo", hoodie: "Ama-hoodie Wesigangeni" },
    newTitle: "Kuvulwe i-skin etjha",
    putOn: "Yifake",
    later: "Ngemva",
    close: "Vala",
    backgrounds: "Ingemuva",
  },
  vi: {
    open: "Skin của mình",
    title: "Skin của mình",
    sub: (n, total) => `Bạn đã mở ${n}/${total}. Mỗi bài luyện xong lại đưa skin tiếp theo đến gần hơn`,
    locked: (n) => `Thêm ${n} bài luyện`,
    wearing: "Đang mặc",
    classics: "Cổ điển",
    sets: { space: "Đội phi hành gia", magic: "Phù thủy từ ngữ", street: "Phong cách đường phố", ninja: "Ninja bóng tối", sport: "Ngày thi đấu", hoodie: "Hoodie hoang dã" },
    newTitle: "Đã mở khóa skin mới",
    putOn: "Mặc ngay",
    later: "Để sau",
    close: "Đóng",
    backgrounds: "Hình nền",
  },
  fil: {
    open: "Mga skin ko",
    title: "Mga skin ko",
    sub: (n, total) => `Na-unlock mo na ang ${n} sa ${total}. Bawat natapos na pagsasanay ay naglalapit sa susunod`,
    locked: (n) => `${n} pang pagsasanay`,
    wearing: "Suot mo",
    classics: "Mga klasik",
    sets: { space: "Barkada sa Kalawakan", magic: "Salamangkero ng Salita", street: "Street Style", ninja: "Ninja ng Anino", sport: "Araw ng Laro", hoodie: "Wild na Hoodie" },
    newTitle: "Bagong skin na-unlock",
    putOn: "Isuot",
    later: "Mamaya",
    close: "Isara",
    backgrounds: "Mga background",
  },
  af: {
    open: "My skins",
    title: "My skins",
    sub: (n, total) => `Jy het ${n} van ${total} oopgesluit. Elke klaar oefening bring die volgende nader`,
    locked: (n) => (n === 1 ? "nog 1 oefening" : `nog ${n} oefeninge`),
    wearing: "Jy dra dit",
    classics: "Klassieke",
    sets: { space: "Ruimtespan", magic: "Woordtowenaars", street: "Straatstyl", ninja: "Skaduninjas", sport: "Wedstryddag", hoodie: "Wilde hoodies" },
    newTitle: "Nuwe skin oopgesluit",
    putOn: "Trek aan",
    later: "Later",
    close: "Maak toe",
    backgrounds: "Agtergronde",
  },
  sw: {
    open: "Skin zangu",
    title: "Skin zangu",
    sub: (n, total) => `Umefungua ${n} kati ya ${total}. Kila zoezi unalomaliza linaleta skin inayofuata karibu`,
    locked: (n) => (n === 1 ? "Zoezi 1 zaidi" : `Mazoezi ${n} zaidi`),
    wearing: "Umevaa",
    classics: "Za zamani",
    sets: { space: "Kikosi cha Anga", magic: "Wachawi wa Maneno", street: "Mtindo wa Mtaani", ninja: "Ninja wa Kivuli", sport: "Siku ya Mechi", hoodie: "Hoodie za Porini" },
    newTitle: "Skin mpya imefunguliwa",
    putOn: "Ivae",
    later: "Baadaye",
    close: "Funga",
    backgrounds: "Mandhari",
  },
  "zh-CN": {
    open: "我的皮肤",
    title: "我的皮肤",
    sub: (n, total) => `已解锁 ${n}/${total}。每完成一次练习，下一个皮肤就更近一步`,
    locked: (n) => `还差 ${n} 次练习`,
    wearing: "穿着中",
    classics: "经典款",
    sets: { space: "太空小队", magic: "单词魔法师", street: "街头潮流", ninja: "暗影忍者", sport: "比赛日", hoodie: "狂野卫衣" },
    newTitle: "解锁新皮肤",
    putOn: "穿上",
    later: "稍后",
    close: "关闭",
    backgrounds: "背景",
  },
  "zh-TW": {
    open: "我的造型",
    title: "我的造型",
    sub: (n, total) => `已解鎖 ${n}/${total}。每完成一次練習，下一個造型就更近一步`,
    locked: (n) => `還差 ${n} 次練習`,
    wearing: "穿著中",
    classics: "經典款",
    sets: { space: "太空小隊", magic: "單字魔法師", street: "街頭潮流", ninja: "暗影忍者", sport: "比賽日", hoodie: "狂野帽T" },
    newTitle: "解鎖新造型",
    putOn: "穿上",
    later: "稍後",
    close: "關閉",
    backgrounds: "背景",
  },
  ko: {
    open: "내 스킨",
    title: "내 스킨",
    sub: (n, total) => `${total}개 중 ${n}개를 열었어요. 연습을 끝낼 때마다 다음 스킨이 가까워져요`,
    locked: (n) => `연습 ${n}번 더`,
    wearing: "착용 중",
    classics: "클래식",
    sets: { space: "우주 크루", magic: "단어 마법사", street: "스트리트 스타일", ninja: "그림자 닌자", sport: "경기의 날", hoodie: "와일드 후디" },
    newTitle: "새 스킨 잠금 해제",
    putOn: "입기",
    later: "나중에",
    close: "닫기",
    backgrounds: "배경",
  },
  th: {
    open: "สกินของฉัน",
    title: "สกินของฉัน",
    sub: (n, total) => `ปลดล็อกแล้ว ${n} จาก ${total} ทุกการฝึกที่ทำจบจะพาสกินถัดไปมาใกล้ขึ้น`,
    locked: (n) => `ฝึกอีก ${n} ครั้ง`,
    wearing: "ใส่อยู่",
    classics: "คลาสสิก",
    sets: { space: "ทีมอวกาศ", magic: "พ่อมดคำศัพท์", street: "สตรีทสไตล์", ninja: "นินจาเงา", sport: "วันแข่ง", hoodie: "ฮู้ดดี้สุดป่า" },
    newTitle: "ปลดล็อกสกินใหม่แล้ว",
    putOn: "ใส่เลย",
    later: "ไว้ทีหลัง",
    close: "ปิด",
    backgrounds: "พื้นหลัง",
  },
  bn: {
    open: "আমার স্কিন",
    title: "আমার স্কিন",
    sub: (n, total) => `${total}টির মধ্যে ${n}টি খুলেছ। প্রতিটি শেষ করা প্র্যাকটিস পরের স্কিনটাকে কাছে আনে`,
    locked: (n) => `আর ${n}টি প্র্যাকটিস`,
    wearing: "পরে আছ",
    classics: "ক্লাসিক",
    sets: { space: "মহাকাশ দল", magic: "শব্দের জাদুকর", street: "স্ট্রিট স্টাইল", ninja: "ছায়া নিনজা", sport: "খেলার দিন", hoodie: "বুনো হুডি" },
    newTitle: "নতুন স্কিন আনলক হয়েছে",
    putOn: "পরে নাও",
    later: "পরে",
    close: "বন্ধ করো",
    backgrounds: "ব্যাকগ্রাউন্ড",
  },
  da: {
    open: "Mine skins",
    title: "Mine skins",
    sub: (n, total) => `Du har låst ${n} af ${total} op. Hver færdig øvelse bringer det næste tættere på`,
    locked: (n) => (n === 1 ? "1 øvelse mere" : `${n} øvelser mere`),
    wearing: "Har du på",
    classics: "Klassikere",
    sets: { space: "Rumholdet", magic: "Ordtroldmænd", street: "Gadestil", ninja: "Skyggeninjaer", sport: "Kampdag", hoodie: "Vilde hoodies" },
    newTitle: "Nyt skin låst op",
    putOn: "Tag det på",
    later: "Senere",
    close: "Luk",
    backgrounds: "Baggrunde",
  },
  hu: {
    open: "Skinjeim",
    title: "Skinjeim",
    sub: (n, total) => `${total} közül ${n} feloldva. Minden befejezett gyakorlás közelebb hozza a következőt`,
    locked: (n) => `még ${n} gyakorlás`,
    wearing: "Rajtad van",
    classics: "Klasszikusok",
    sets: { space: "Űrlegénység", magic: "Szóvarázslók", street: "Utcai stílus", ninja: "Árnyéknindzsák", sport: "Meccsnap", hoodie: "Vad kapucnisok" },
    newTitle: "Új skin feloldva",
    putOn: "Felveszem",
    later: "Később",
    close: "Bezárás",
    backgrounds: "Hátterek",
  },
};

export function skinCopy(lang: string): SkinCopy {
  return COPY[lang] ?? COPY.en;
}

async function putOn(user: User, skinId: string): Promise<boolean> {
  try {
    const r = await fetch("/api/kids/skin", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
      body: JSON.stringify({ skinId }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

function SkinCircle({ src, size, locked, active }: { src: string | null; size: number; locked?: boolean; active?: boolean }) {
  return (
    <span
      style={{
        position: "relative", width: size, height: size, borderRadius: "50%", display: "block", flexShrink: 0,
        outline: active ? "3px solid #8B5CF6" : "none", outlineOffset: 2,
      }}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src} alt="" width={size} height={size} loading="lazy"
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", filter: locked ? "grayscale(1) brightness(0.7)" : "none", opacity: locked ? 0.55 : 1 }}
        />
      )}
      {locked && (
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3 }}>🔒</span>
      )}
    </span>
  );
}

export function SkinsPanel({ user, lang, dir, practices, avatarId, onClose }: {
  user: User; lang: string; dir: "rtl" | "ltr"; practices: number; avatarId: string | null; onClose: () => void;
}) {
  const c = skinCopy(lang);
  // The skin just tapped shows at once; the live member doc (avatarId) wins
  // once it updates.
  const [picked, setPicked] = useState<string | null>(null);
  const current = picked ?? avatarId;
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function choose(id: string) {
    if (busy) return;
    setBusy(id);
    setPicked(id);
    const ok = await putOn(user, id);
    if (!ok) setPicked(null);
    setBusy(null);
  }

  const bySet = (set: LookSet) => LOOKS.filter((l) => l.set === set).sort((a, b) => a.tier - b.tier);

  function cell(id: string, look: LookDef | null) {
    const unlocked = !look || isLookUnlocked(look, practices);
    const active = current === id;
    return (
      <button
        key={id}
        type="button"
        disabled={!unlocked || busy !== null}
        onClick={() => unlocked && !active && choose(id)}
        aria-pressed={active}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 4, border: "none",
          background: "transparent", color: "var(--ink)", cursor: unlocked ? "pointer" : "default", minWidth: 0,
        }}
      >
        <SkinCircle src={avatarUrl(id)} size={64} locked={!unlocked} active={active} />
        <span style={{ fontSize: 11, lineHeight: 1.25, color: active ? "#8B5CF6" : "var(--ink-soft, #667085)", fontWeight: active ? 700 : 500, textAlign: "center" }}>
          {active ? c.wearing : !unlocked && look ? c.locked(look.unlockAt - practices) : look?.tier === 4 ? "⭐" : " "}
        </span>
      </button>
    );
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label={c.title} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(10,14,20,0.55)", backdropFilter: "blur(3px)" }}
    >
      <div
        className="wordbook" dir={dir} onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, maxHeight: "88dvh", overflowY: "auto", background: "var(--surface, #fff)", color: "var(--ink)", borderRadius: 22, padding: "22px 18px", boxShadow: "0 24px 70px rgba(0,0,0,0.34)" }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{c.title}</div>
        <div style={{ fontSize: 13.5, color: "var(--ink-soft, #667085)", marginBottom: 14 }}>{c.sub(unlockedCount(practices), LOOKS.length)}</div>

        {LOOK_SETS.map((set) => (
          <div key={set} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em", marginBottom: 2 }}>{c.sets[set]}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 4 }}>
              {bySet(set).map((l) => cell(l.id, l))}
            </div>
          </div>
        ))}

        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em", margin: "6px 0 2px" }}>{c.classics}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 4 }}>
          {KID_AVATARS.map((a) => cell(a.id, null))}
        </div>

        <button
          type="button" onClick={onClose}
          style={{ marginTop: 16, width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid var(--rule, #E2E5EA)", background: "transparent", color: "var(--ink)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          {c.close}
        </button>
      </div>
    </div>
  );
}

const SEEN_KEY = "gadit-skins-seen";

/** Shows "New skin unlocked" once, the first time the child's practices pass
 *  a skin's threshold. Remembers per device how many skins were already seen;
 *  on the very first run it only records the count, so existing kids are not
 *  flooded with old unlocks. */
export function SkinUnlockMoment({ user, lang, dir, practices, onCelebrate }: {
  user: User; lang: string; dir: "rtl" | "ltr"; practices: number | null; onCelebrate?: () => void;
}) {
  const c = skinCopy(lang);
  const [fresh, setFresh] = useState<LookDef | null>(null);
  const [done, setDone] = useState(false);
  const celebrateRef = useRef(onCelebrate);
  useEffect(() => { celebrateRef.current = onCelebrate; });

  useEffect(() => {
    if (practices === null) return;
    const n = unlockedCount(practices);
    const key = `${SEEN_KEY}:${user.uid}`;
    try {
      const raw = window.localStorage.getItem(key);
      window.localStorage.setItem(key, String(n));
      if (raw === null) return;
      const seen = Number(raw);
      if (Number.isFinite(seen) && n > seen) {
        const newest = LOOKS.filter((l) => isLookUnlocked(l, practices)).sort((a, b) => b.unlockAt - a.unlockAt)[0];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one moment per new unlock, read from the device
        if (newest) { setFresh(newest); celebrateRef.current?.(); }
      }
    } catch { /* storage blocked: no moment, no harm */ }
  }, [practices, user.uid]);

  if (!fresh || done) return null;
  return (
    <div
      role="dialog" aria-modal="true" aria-label={c.newTitle} onClick={() => setDone(true)}
      style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(10,14,20,0.55)", backdropFilter: "blur(3px)" }}
    >
      <div
        className="wordbook" dir={dir} onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 340, background: "var(--surface, #fff)", color: "var(--ink)", borderRadius: 22, padding: "26px 22px 20px", boxShadow: "0 24px 70px rgba(0,0,0,0.34)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}
      >
        <div style={{ fontSize: 21, fontWeight: 800 }}>{c.newTitle}</div>
        <SkinCircle src={avatarUrl(fresh.id)} size={150} />
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <button
            type="button"
            onClick={async () => { await putOn(user, fresh.id); setDone(true); }}
            style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "none", background: "#8B5CF6", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}
          >
            {c.putOn}
          </button>
          <button
            type="button" onClick={() => setDone(true)}
            style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid var(--rule, #E2E5EA)", background: "transparent", color: "var(--ink)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            {c.later}
          </button>
        </div>
      </div>
    </div>
  );
}
