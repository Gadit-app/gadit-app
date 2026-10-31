/**
 * The world intro card's "mission" (Gadi 2026-11-01: kids did not know what the game wants).
 * Three short lines, one sentence each; {w} is the word to spell.
 */
const GOAL: Record<string, [string, string, string]> = {
  "en": ["Your mission: spell {w}.","At every fork, open the door with the next letter.","At the gate, spell the whole word."],
  "he": ["המשימה: לאיית את {w}.","בכל צומת פותחים את הדלת עם האות הבאה.","בשער מאייתים את כל המילה."],
  "fr": ["Ta mission, c'est d'épeler {w}.","À chaque croisement, ouvre la porte avec la lettre suivante.","À la porte, épelle le mot entier."],
  "cs": ["Tvůj úkol je napsat {w}.","Na každé odbočce otevři dveře s dalším písmenem.","U brány napiš celé slovo."],
  "pt": ["A tua missão é soletrar {w}.","Em cada bifurcação, abre a porta com a próxima letra.","No portão, soletra a palavra toda."],
  "ru": ["Тебе нужно написать {w}.","На каждой развилке открывай дверь со следующей буквой.","У ворот напиши всё слово."],
  "ar": ["مهمتكم هي تهجئة {w}.","عند كل مفترق، افتحوا الباب الذي عليه الحرف التالي.","عند البوابة، هجئوا الكلمة كلها."],
  "es": ["Tu misión es deletrear {w}.","En cada cruce, abre la puerta con la letra que sigue.","En la puerta final, deletrea la palabra completa."],
  "sk": ["Tvoja úloha je vyhláskovať {w}.","Keď sa cesta rozdelí, otvor dvere s ďalším písmenom.","Pri bráne vyhláskuj celé slovo."],
  "de": ["Deine Aufgabe: Schreib {w}.","An jeder Kreuzung öffne die Tür mit dem nächsten Buchstaben.","Am Tor schreib das ganze Wort."],
  "it": ["La tua missione è scrivere {w}.","A ogni bivio, apri la porta con la lettera giusta.","Al cancello, scrivi tutta la parola."],
  "fa": ["ماموریتت اینه که {w} را بنویسی.","سر هر دوراهی، درِ حرف بعدی را باز کن.","دمِ دروازه، همهٔ کلمه را بنویس."],
  "pl": ["Twoje zadanie to przeliterować {w}.","Na każdym rozwidleniu otwórz drzwi z następną literą.","Przy bramie przeliteruj całe słowo."],
  "tr": ["Görevin {w} yazmak.","Her yol ayrımında, sıradaki harfin olduğu kapıyı aç.","Kapıda kelimenin tamamını yaz."],
  "uk": ["Твоя місія: склади слово {w}.","На кожній розвилці відкривай двері з наступною літерою.","Біля воріт склади все слово."],
  "ja": ["{w} を つづってね。","わかれみちでは、つぎの もじの ドアを あけてね。","もんで、ことばを ぜんぶ つづってね。"],
  "hi": ["तुम्हारा काम {w} के हिज्जे लिखना है।","हर मोड़ पर अगले अक्षर वाला दरवाज़ा खोलो।","फाटक पर पूरा शब्द लिखो।"],
  "am": ["ተልእኳችሁ {w} መፃፍ ነው።","በእያንዳንዱ መለያ ላይ የሚቀጥለውን ፊደል ያለውን በር ክፈቱ።","በበሩ ላይ ሙሉውን ቃል ፃፉ።"],
  "vi": ["Nhiệm vụ của con là đánh vần {w}.","Ở mỗi ngã rẽ, hãy mở cánh cửa có chữ cái tiếp theo.","Ở cổng, hãy đánh vần cả từ."],
  "nl": ["Jouw taak is: spel {w}.","Kies bij elke splitsing de deur met de volgende letter.","Spel bij de poort het hele woord."],
  "af": ["Jou missie is om {w} te spel.","By elke vurk, maak die deur met die volgende letter oop.","By die hek, spel die hele woord."],
  "fil": ["Ang misyon mo ay baybayin ang {w}.","Sa bawat sangang daan, buksan mo ang pinto na may kasunod na letra.","Sa tarangkahan, baybayin mo ang buong salita."],
  "id": ["Tugasmu adalah mengeja {w}.","Di setiap belokan, buka pintu dengan huruf berikutnya.","Di gerbang, eja seluruh kata itu."],
  "el": ["Η αποστολή σου είναι να γράψεις το {w}.","Σε κάθε διχάλα, άνοιξε την πόρτα με το επόμενο γράμμα.","Στην πύλη, γράψε όλη τη λέξη."],
  "sw": ["Kazi yako ni kuandika {w}.","Kila njia ikigawanyika, fungua mlango wenye herufi inayofuata.","Ukiwa langoni, andika neno lote."],
  "zu": ["Umsebenzi wakho ukupela {w}.","Lapho indlela ihlukana, vula umnyango onohlamvu olulandelayo.","Esangweni, pela igama lonke."],
  "th": ["ภารกิจของหนูคือสะกดคำว่า {w}.","ทุกทางแยก ให้เปิดประตูที่มีตัวอักษรถัดไป.","ที่ประตูใหญ่ สะกดคำทั้งคำ."],
  "zh-TW": ["你的任務是拼出 {w}。","每次遇到岔路，就開有下一個字母的門。","到大門前，把整個單字拼出來。"],
  "zh-CN": ["你的任务是拼出 {w}。","每到路口，打开有下一个字母的门。","到了大门前，拼出整个单词。"],
  "da": ["Din opgave er at stave {w}.","Når vejen deler sig, vælg døren med det næste bogstav.","Ved porten staver du hele ordet."],
  "bn": ["তোমার কাজ {w} বানান করা।","প্রতি মোড়ে পরের অক্ষরের দরজা খোলো।","ফটকে পুরো শব্দটি বানান করো।"],
  "ko": ["네 임무는 {w}를 철자하는 거야.","갈림길마다 다음 글자 문을 열어.","문 앞에서 단어 전체를 철자해."],
  "hu": ["A feladatod: betűzd le ezt: {w}.","Minden elágazásnál azt az ajtót nyisd ki, amin a következő betű van.","A kapunál betűzd le az egész szót."],
  "xh": ["Umsebenzi wakho kukupela {w}.","Xa indlela yahlula, vula ucango olunobumba olandelayo.","Esangweni, pela lonke igama."],
  "tn": ["Tiro ya gago ke go peleta {w}.","Mo karoganong nngwe le nngwe, bula mojako o o nang le tlhaka e e latelang.","Kwa kgorong, peleta lefoko lotlhe."],
  "ss": ["Umsebenti wakho kupela {w}.","Nawufika ehlukeni, vula umnyango loneluhlavu lolulandzelako.","Esangweni, pela ligama lonkhe."],
  "st": ["Mosebetsi wa hao ke ho peleta {w}.","Ha tsela e arohana, bula monyako o nang le tlhaku e latelang.","Kgorang, peleta lentswe lohle."],
  "nso": ["Mošomo wa gago ke go peleta {w}.","Moo tsela e arogago, bula mojako wa letere la go latela.","Kgorong, peleta lentšu ka moka."],
  "ts": ["Ntirho wa wena i ku pela {w}.","Laha ndlela yi hambanaka kona, pfula nyangwa wa letere leri landzelaka.","Enyangweni, pela rito hinkwaro."],
  "nr": ["Umsebenzi wakho kukupeleta {w}.","Kuso sonke isiphambano, vula umnyango oneletha elilandelako.","Esangweni, peleta igama loke."],
  "ve": ["Mushumo wau ndi u peleta {w}.","Hune ndila dza fhambana, vula muṋango une wa vha na ḽeḓere ḽi tevhelaho.","Kha gethe, peleta ipfi ḽoṱhe."],
};

export function worldGoal(lang: string, w: string): string[] {
  return (GOAL[lang] ?? GOAL.en).map((s) => s.replace("{w}", w));
}
