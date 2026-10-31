/**
 * The Word Worlds card on /play: only its title and line, so the games page
 * does not load the whole game's copy (41 languages). Generated from
 * world-i18n.ts; keep the two in step when the card text changes.
 */

const CARD: Record<string, [title: string, desc: string]> = {
  en: ["Word Worlds", "Pick the right letter at every door and open the gate"],
  he: ["עולמות המילים", "בוחרים את האות הנכונה בכל דלת ופותחים את השער"],
  ar: ["عوالم الكلمات", "اختر الحرف الصحيح عند كل باب وافتح البوابة"],
  ru: ["Миры слов", "Выбирай нужную букву у каждой двери и открой ворота"],
  uk: ["Світи слів", "Обирай правильну літеру біля кожних дверей і відчини браму"],
  es: ["Mundos de palabras", "Elige la letra correcta en cada puerta y abre el portal"],
  pt: ["Mundos das Palavras", "Escolha a letra certa em cada porta e abra o portão"],
  fr: ["Les mondes des mots", "Choisis la bonne lettre à chaque porte et ouvre le portail"],
  de: ["Wörterwelten", "Wähle an jeder Tür den richtigen Buchstaben und öffne das Tor"],
  cs: ["Světy slov", "U každých dveří vyber správné písmeno a otevři bránu"],
  sk: ["Svety slov", "Pri každých dverách vyber správne písmeno a otvor bránu"],
  pl: ["Światy słów", "Przy każdych drzwiach wybierz właściwą literę i otwórz bramę"],
  it: ["Mondi di parole", "Scegli la lettera giusta a ogni porta e apri il cancello"],
  nl: ["Woordwerelden", "Kies bij elke deur de goede letter en open de poort"],
  da: ["Ordverdener", "Vælg det rigtige bogstav ved hver dør og åbn porten"],
  el: ["Κόσμοι λέξεων", "Διάλεξε το σωστό γράμμα σε κάθε πόρτα και άνοιξε την πύλη"],
  hu: ["Szóvilágok", "Minden ajtónál válaszd ki a jó betűt, és nyisd ki a kaput"],
  tr: ["Kelime Dünyaları", "Her kapıda doğru harfi seç ve büyük kapıyı aç"],
  id: ["Dunia Kata", "Pilih huruf yang benar di setiap pintu dan buka gerbangnya"],
  vi: ["Thế giới từ ngữ", "Chọn đúng chữ cái ở mỗi cánh cửa và mở cổng"],
  fil: ["Mga Mundo ng Salita", "Piliin ang tamang titik sa bawat pinto at buksan ang tarangkahan"],
  af: ["Woordwêrelde", "Kies die regte letter by elke deur en maak die hek oop"],
  sw: ["Dunia za Maneno", "Chagua herufi sahihi kwenye kila mlango na ufungue lango"],
  ja: ["ことばの世界", "ドアごとに正しい文字をえらんで、門をあけよう"],
  "zh-CN": ["单词世界", "在每扇门前选对字母，打开大门"],
  "zh-TW": ["單字世界", "在每扇門前選對字母，打開大門"],
  ko: ["단어 세상", "문마다 알맞은 글자를 골라 성문을 열어 봐"],
  th: ["โลกแห่งคำ", "เลือกตัวอักษรที่ถูกต้องที่ประตูทุกบาน แล้วเปิดประตูใหญ่"],
  hi: ["शब्दों की दुनिया", "हर दरवाज़े पर सही अक्षर चुनो और फाटक खोलो"],
  bn: ["শব্দের জগৎ", "প্রতিটি দরজায় ঠিক অক্ষরটি বেছে নাও আর ফটক খোলো"],
  am: ["የቃላት ዓለማት", "በእያንዳንዱ በር ትክክለኛውን ፊደል ምረጥ እና ዋናውን በር ክፈት"],
  fa: ["دنیاهای کلمه", "پشت هر در حرف درست را انتخاب کن و دروازه را باز کن"],
  zu: ["Imihlaba Yamagama", "Khetha uhlamvu olulungile emnyango ngamunye bese uvula isango"],
  xh: ["Amahlabathi Amagama", "Khetha unobumba ochanekileyo kumnyango ngamnye uze uvule isango"],
  nso: ["Mafase a Mantšu", "Kgetha tlhaka ye e nepagetšego mojakong o mongwe le o mongwe gomme o bule kgoro"],
  tn: ["Mafatshe a Mafoko", "Tlhopha tlhaka e e siameng kwa lebating lengwe le lengwe mme o bule kgoro"],
  st: ["Mafatshe a Mantswe", "Kgetha tlhaku e nepahetseng monyako ka mong mme o bule heke"],
  ts: ["Misava ya Marito", "Hlawula letere leri faneleke eka nyangwa yin'wana na yin'wana kutani u pfula gede"],
  ss: ["Imihlaba Yemagama", "Khetsa luhlamvu loluliko kuwo wonkhe umnyango bese uvula lisango"],
  ve: ["Shango ḽa Maipfi", "Nanga ḽeḓere ḽo teaho kha vothi ḽiṅwe na ḽiṅwe u vule gethe"],
  nr: ["Iphasi Lamezwi", "Khetha ilitlhaka elifaneleko emnyango ngamunye bese uvula isango"],
};

export function worldCardCopy(lang: string): { mapTitle: string; cardDesc: string } {
  const [mapTitle, cardDesc] = CARD[lang] ?? CARD.en;
  return { mapTitle, cardDesc };
}
