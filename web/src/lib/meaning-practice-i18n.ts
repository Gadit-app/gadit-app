/**
 * The two text links under each meaning's examples (Gadi 2026-10-24):
 * "More example sentences" and "Write a sentence of your own and check you
 * understood", which opens the sentence box in place. Every UI language.
 */

export type MeaningPracticeCopy = { more: string; compose: string };

export const MEANING_PRACTICE_COPY: Record<string, MeaningPracticeCopy> = {
  he: { more: "עוד משפטים לדוגמה", compose: "חברו משפט משלכם ובדקו שהבנתם" },
  en: { more: "More example sentences", compose: "Write a sentence of your own and check you understood" },
  ar: { more: "المزيد من الجمل كأمثلة", compose: "اكتبوا جملة خاصة بكم وتحققوا من أنكم فهمتم" },
  ru: { more: "Ещё примеры предложений", compose: "Составьте своё предложение и проверьте, что поняли" },
  es: { more: "Más frases de ejemplo", compose: "Escribe tu propia frase y comprueba que lo entendiste" },
  pt: { more: "Mais frases de exemplo", compose: "Escreva sua própria frase e confira se entendeu" },
  fr: { more: "Plus de phrases d'exemple", compose: "Écrivez votre propre phrase et vérifiez que vous avez compris" },
  de: { more: "Mehr Beispielsätze", compose: "Schreib einen eigenen Satz und prüfe, ob du es verstanden hast" },
  cs: { more: "Další příkladové věty", compose: "Napište vlastní větu a ověřte si, že jste pochopili" },
  sk: { more: "Ďalšie príkladové vety", compose: "Napíšte vlastnú vetu a overte si, že ste pochopili" },
  it: { more: "Altre frasi di esempio", compose: "Scrivi una frase tua e verifica di aver capito" },
  ja: { more: "例文をもっと見る", compose: "自分で文を作って、理解できたか確かめましょう" },
  hi: { more: "और उदाहरण वाक्य", compose: "अपना वाक्य बनाइए और जाँचिए कि आप समझ गए" },
  am: { more: "ተጨማሪ ምሳሌ ዓረፍተ ነገሮች", compose: "የራሳችሁን ዓረፍተ ነገር ጻፉና እንደተረዳችሁ አረጋግጡ" },
  uk: { more: "Ще приклади речень", compose: "Складіть власне речення й перевірте, що зрозуміли" },
  tr: { more: "Daha fazla örnek cümle", compose: "Kendi cümleni kur ve anladığını kontrol et" },
  pl: { more: "Więcej przykładowych zdań", compose: "Ułóż własne zdanie i sprawdź, czy rozumiesz" },
  fa: { more: "جمله‌های نمونهٔ بیشتر", compose: "جملهٔ خودتان را بسازید و ببینید درست فهمیده‌اید" },
  id: { more: "Contoh kalimat lainnya", compose: "Buat kalimatmu sendiri dan cek apakah kamu sudah paham" },
  nl: { more: "Meer voorbeeldzinnen", compose: "Maak je eigen zin en check of je het begrijpt" },
  el: { more: "Περισσότερα παραδείγματα προτάσεων", compose: "Γράψε δική σου πρόταση και έλεγξε αν το κατάλαβες" },
  zu: { more: "Eminye imisho eyisibonelo", compose: "Bhala owakho umusho bese uhlola ukuthi uqondile" },
  vi: { more: "Thêm câu ví dụ", compose: "Tự đặt một câu và kiểm tra xem bạn đã hiểu chưa" },
  fil: { more: "Iba pang halimbawang pangungusap", compose: "Bumuo ng sariling pangungusap at tingnan kung naintindihan mo" },
  af: { more: "Meer voorbeeldsinne", compose: "Skryf jou eie sin en kyk of jy dit verstaan" },
  sw: { more: "Sentensi zaidi za mfano", compose: "Tunga sentensi yako mwenyewe na uhakikishe umeelewa" },
  "zh-CN": { more: "更多例句", compose: "自己造个句子，看看是否理解了" },
  "zh-TW": { more: "更多例句", compose: "自己造個句子，看看是否理解了" },
  ko: { more: "예문 더 보기", compose: "직접 문장을 만들어 이해했는지 확인해 보세요" },
  th: { more: "ประโยคตัวอย่างเพิ่มเติม", compose: "แต่งประโยคของคุณเองแล้วตรวจดูว่าเข้าใจแล้ว" },
  bn: { more: "আরও উদাহরণ বাক্য", compose: "নিজের একটি বাক্য লিখুন এবং দেখুন বুঝেছেন কি না" },
  da: { more: "Flere eksempelsætninger", compose: "Skriv din egen sætning, og tjek, at du har forstået det" },
  hu: { more: "További példamondatok", compose: "Írj egy saját mondatot, és nézd meg, hogy jól értetted-e" },
  xh: { more: "Eminye imizekelo yezivakalisi", compose: "Bhala esakho isivakalisi uze ujonge ukuba uqondile" },
  nso: { more: "Mehlala e mengwe ya mafoko", compose: "Ngwala lefoko la gago o lekole gore o kwešišitše" },
  tn: { more: "Dikai tse dingwe tsa dipolelo", compose: "Kwala polelo ya gago mme o tlhatlhobe gore o tlhaloganye" },
  st: { more: "Mehlala e meng ya dipolelo", compose: "Ngola polelo ya hao mme o hlahlobe hore o utlwisisitse" },
  ts: { more: "Swikombiso swin'wana swa swivulwa", compose: "Tsala xivulwa xa wena u kambela leswaku u twisisile" },
  ss: { more: "Leminye imisho yesibonelo", compose: "Bhala umusho wakho bese uhlola kutsi uvisisile" },
  ve: { more: "Zwiṅwe zwitaladzi zwa mitaladzi", compose: "Ṅwalani mutaladzi waṋu ni sedze arali no pfesesa" },
  nr: { more: "Eminye imitjho eyisibonelo", compose: "Tlola umutjho wakho bese uhlola bona uzwisisile" },
};

export function meaningPracticeCopy(lang: string): MeaningPracticeCopy {
  return MEANING_PRACTICE_COPY[lang] ?? MEANING_PRACTICE_COPY.en;
}
