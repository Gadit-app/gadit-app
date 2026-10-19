/**
 * "Listen and pick the picture" in Homework (approved 2026-10-14): the copy,
 * spoken to the child like the rest of Homework. 41 languages, English for
 * any other. name and sub are the card; prep is shown while the pictures are
 * made (once per word, for everyone); few when a topic has too few pictures.
 */
export type PicCopy = Record<"name" | "sub" | "prep" | "few", string>;

export const PIC_COPY: Record<string, PicCopy> = {
  en: { name: "Listen and pick the picture", sub: "Hear a word and pick its picture from three", prep: "Getting the pictures ready", few: "There aren't enough pictures for this topic yet. Try another topic." },
  he: { name: "הקשיבו ובחרו תמונה", sub: "שומעים מילה ובוחרים את התמונה שלה מבין שלוש", prep: "מכינים את התמונות", few: "לנושא הזה אין עדיין מספיק תמונות. נסו נושא אחר." },
  ar: { name: "استمعوا واختاروا الصورة", sub: "نسمع كلمة ونختار صورتها من بين ثلاث", prep: "نحضّر الصور", few: "لا توجد صور كافية لهذا الموضوع بعد. جرّبوا موضوعًا آخر." },
  ru: { name: "Послушай и выбери картинку", sub: "Слушаем слово и выбираем его картинку из трёх", prep: "Готовим картинки", few: "Для этой темы пока мало картинок. Попробуйте другую тему." },
  es: { name: "Escucha y elige la imagen", sub: "Escucha una palabra y elige su imagen entre tres", prep: "Preparando las imágenes", few: "Todavía no hay suficientes imágenes para este tema. Prueba otro tema." },
  pt: { name: "Ouça e escolha a imagem", sub: "Ouça uma palavra e escolha a imagem dela entre três", prep: "Preparando as imagens", few: "Ainda não há imagens suficientes para este tema. Tente outro tema." },
  fr: { name: "Écoute et choisis l'image", sub: "Écoutez un mot et choisissez son image parmi trois", prep: "Préparation des images", few: "Il n'y a pas encore assez d'images pour ce thème. Essayez un autre thème." },
  de: { name: "Hören und Bild wählen", sub: "Ein Wort hören und sein Bild aus drei auswählen", prep: "Die Bilder werden vorbereitet", few: "Für dieses Thema gibt es noch nicht genug Bilder. Probiert ein anderes Thema." },
  cs: { name: "Poslouchej a vyber obrázek", sub: "Uslyšíte slovo a vyberete jeho obrázek ze tří", prep: "Připravujeme obrázky", few: "K tomuto tématu zatím není dost obrázků. Zkuste jiné téma." },
  sk: { name: "Počúvaj a vyber obrázok", sub: "Počujete slovo a vyberiete jeho obrázok z troch", prep: "Pripravujeme obrázky", few: "K tejto téme zatiaľ nie je dosť obrázkov. Skúste inú tému." },
  it: { name: "Ascolta e scegli l'immagine", sub: "Ascolta una parola e scegli la sua immagine tra tre", prep: "Prepariamo le immagini", few: "Per questo tema non ci sono ancora abbastanza immagini. Prova un altro tema." },
  ja: { name: "聞いて絵をえらぶ", sub: "単語を聞いて3つの絵からえらびます", prep: "絵をじゅんびしています", few: "このテーマにはまだ絵が足りません。ほかのテーマをえらんでください。" },
  hi: { name: "सुनें और तस्वीर चुनें", sub: "शब्द सुनिए और तीन में से उसकी तस्वीर चुनिए", prep: "तस्वीरें तैयार हो रही हैं", few: "इस विषय के लिए अभी पर्याप्त तस्वीरें नहीं हैं। कोई दूसरा विषय चुनिए।" },
  am: { name: "አዳምጡና ስዕሉን ምረጡ", sub: "ቃል ሰምታችሁ ስዕሉን ከሦስቱ ትመርጣላችሁ", prep: "ስዕሎቹን እያዘጋጀን ነው", few: "ለዚህ ርዕስ እስካሁን በቂ ስዕሎች የሉም። ሌላ ርዕስ ሞክሩ።" },
  uk: { name: "Послухай і вибери малюнок", sub: "Слухаємо слово й вибираємо його малюнок із трьох", prep: "Готуємо малюнки", few: "Для цієї теми поки замало малюнків. Спробуйте іншу тему." },
  tr: { name: "Dinle ve resmi seç", sub: "Bir kelime dinle ve resmini üç resim arasından seç", prep: "Resimler hazırlanıyor", few: "Bu konu için henüz yeterli resim yok. Başka bir konu deneyin." },
  pl: { name: "Posłuchaj i wybierz obrazek", sub: "Słyszycie słowo i wybieracie jego obrazek z trzech", prep: "Przygotowujemy obrazki", few: "Do tego tematu nie ma jeszcze dość obrazków. Spróbujcie innego tematu." },
  fa: { name: "گوش کنید و تصویر را انتخاب کنید", sub: "کلمه را بشنوید و تصویرش را از میان سه تصویر انتخاب کنید", prep: "در حال آماده کردن تصویرها", few: "برای این موضوع هنوز تصویر کافی نداریم. موضوع دیگری را امتحان کنید." },
  id: { name: "Dengar dan pilih gambar", sub: "Dengar kata lalu pilih gambarnya dari tiga", prep: "Menyiapkan gambar", few: "Belum ada cukup gambar untuk topik ini. Coba topik lain." },
  nl: { name: "Luister en kies het plaatje", sub: "Hoor een woord en kies het plaatje uit drie", prep: "De plaatjes worden klaargezet", few: "Voor dit onderwerp zijn er nog niet genoeg plaatjes. Probeer een ander onderwerp." },
  el: { name: "Άκου και διάλεξε την εικόνα", sub: "Ακούμε μια λέξη και διαλέγουμε την εικόνα της ανάμεσα σε τρεις", prep: "Ετοιμάζουμε τις εικόνες", few: "Δεν υπάρχουν ακόμη αρκετές εικόνες για αυτό το θέμα. Δοκιμάστε άλλο θέμα." },
  zu: { name: "Lalela ukhethe isithombe", sub: "Lalela igama ukhethe isithombe salo phakathi kwezintathu", prep: "Silungisa izithombe", few: "Azikho izithombe ezanele zalesi sihloko okwamanje. Zama esinye isihloko." },
  vi: { name: "Nghe và chọn hình", sub: "Nghe một từ và chọn hình của từ đó trong ba hình", prep: "Đang chuẩn bị hình", few: "Chủ đề này chưa có đủ hình. Hãy thử chủ đề khác." },
  fil: { name: "Makinig at piliin ang larawan", sub: "Pakinggan ang salita at piliin ang larawan nito sa tatlo", prep: "Inihahanda ang mga larawan", few: "Wala pang sapat na larawan para sa paksang ito. Subukan ang ibang paksa." },
  af: { name: "Luister en kies die prent", sub: "Hoor 'n woord en kies sy prent uit drie", prep: "Die prente word voorberei", few: "Daar is nog nie genoeg prente vir hierdie onderwerp nie. Probeer 'n ander onderwerp." },
  sw: { name: "Sikiliza na uchague picha", sub: "Sikiliza neno kisha uchague picha yake kati ya tatu", prep: "Tunaandaa picha", few: "Bado hakuna picha za kutosha kwa mada hii. Jaribuni mada nyingine." },
  "zh-CN": { name: "听一听，选图片", sub: "听一个词，从三张图片中选出它", prep: "正在准备图片", few: "这个主题的图片还不够。请换一个主题。" },
  "zh-TW": { name: "聽一聽，選圖片", sub: "聽一個詞，從三張圖片中選出它", prep: "正在準備圖片", few: "這個主題的圖片還不夠。請換一個主題。" },
  ko: { name: "듣고 그림 고르기", sub: "단어를 듣고 세 그림 중에서 골라요", prep: "그림을 준비하고 있어요", few: "이 주제는 아직 그림이 부족해요. 다른 주제를 골라 보세요." },
  th: { name: "ฟังแล้วเลือกรูป", sub: "ฟังคำแล้วเลือกรูปของคำนั้นจากสามรูป", prep: "กำลังเตรียมรูปภาพ", few: "หัวข้อนี้ยังมีรูปไม่พอ ลองเลือกหัวข้ออื่น" },
  bn: { name: "শুনুন ও ছবি বেছে নিন", sub: "শব্দ শুনে তিনটি ছবির মধ্যে থেকে তার ছবি বেছে নিন", prep: "ছবিগুলো তৈরি হচ্ছে", few: "এই বিষয়ে এখনও যথেষ্ট ছবি নেই। অন্য বিষয় চেষ্টা করুন।" },
  da: { name: "Lyt og vælg billedet", sub: "Hør et ord og vælg dets billede blandt tre", prep: "Billederne gøres klar", few: "Der er endnu ikke nok billeder til dette emne. Prøv et andet emne." },
  hu: { name: "Hallgasd és válaszd ki a képet", sub: "Halld a szót, és válaszd ki a képét a háromból", prep: "Készítjük a képeket", few: "Ehhez a témához még nincs elég kép. Próbáljatok másik témát." },
  xh: { name: "Mamela ukhethe umfanekiso", sub: "Mamela igama ukhethe umfanekiso walo phakathi kwemithathu", prep: "Silungiselela imifanekiso", few: "Akukabikho mifanekiso yaneleyo yesi sihloko. Zama esinye isihloko." },
  nso: { name: "Theeletša o kgethe seswantšho", sub: "Theeletša lentšu o kgethe seswantšho sa lona go tše tharo", prep: "Re lokišetša diswantšho", few: "Ga go sešo go ba le diswantšho tše di lekanego tša hlogo ye. Leka hlogo ye nngwe." },
  tn: { name: "Reetsa o tlhophe setshwantsho", sub: "Reetsa lefoko mme o tlhophe setshwantsho sa lone mo go tse tharo", prep: "Re baakanya ditshwantsho", few: "Ga go ise go nne le ditshwantsho tse di lekaneng tsa setlhogo se. Leka setlhogo se sengwe." },
  st: { name: "Mamela mme o kgethe setshwantsho", sub: "Mamela lentswe mme o kgethe setshwantsho sa lona hara tse tharo", prep: "Re lokisa ditshwantsho", few: "Ha ho eso be le ditshwantsho tse lekaneng tsa sehlooho sena. Leka sehlooho se seng." },
  ts: { name: "Yingisa u hlawula xifaniso", sub: "Yingisa rito u hlawula xifaniso xa rona eka swinharhu", prep: "Hi lulamisa swifaniso", few: "A swi si va kona swifaniso swo ringanela swa nhloko leyi. Ringeta nhloko yin'wana." },
  ss: { name: "Lalela ukhetse sitfombe", sub: "Lalela ligama ukhetse sitfombe salo kuletintsatfu", prep: "Silungisa titfombe", few: "Kute titfombe letanele talesihloko okwanyalo. Zama lesinye sihloko." },
  ve: { name: "Thetshelesani ni khethe tshifanyiso", sub: "Pfani ipfi ni khethe tshifanyiso tshaḽo kha zwiraru", prep: "Ri khou lugisela zwifanyiso", few: "A hu athu vha na zwifanyiso zwo linganaho zwa thero iyi. Lingedzani iṅwe thero." },
  nr: { name: "Lalela bese ukhetha isithombe", sub: "Lalela ilizwi bese ukhetha isithombe salo ezithombeni ezintathu", prep: "Silungisa iinthombe", few: "Azikabi khona iinthombe ezaneleko zalesi sihloko. Linga esinye isihloko." },
};

export function picCopy(lang: string): PicCopy {
  return PIC_COPY[lang] ?? PIC_COPY.en;
}
