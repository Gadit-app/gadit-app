/**
 * Learning mode, the 2026-10-22 additions, in every UI language:
 *  - pre-reader lessons ("not yet" to "do they already read it?"): the
 *    picture step when its pictures are not ready yet;
 *  - "wrong translation?" on a Hebrew-as-a-second-language word card;
 *  - the parent's learning setting per child on the family dashboard.
 * Hebrew speaks to the reader in the plural; no dashes.
 */
export type LearnExtraCopy = {
  /** The picture step has too few pictures yet (they are drawn once per word). */
  picFew: string;
  /** The flag on a word card, its screen-reader label, and the thanks. */
  flag: string; flagAria: string; flagThanks: string;
  /** The parent's setting: title, the "off" chip, saved, the reading question and a note on "not yet". */
  setTitle: string; setOff: string; setSaved: string; setReadsQ: string; setNote: string;
};

const COPY: Record<string, LearnExtraCopy> = {
  he: {
    picFew: "התמונות של המילים האלה עוד לא מוכנות. ממשיכים הלאה.",
    flag: "תרגום לא נכון?", flagAria: "דיווח על תרגום לא נכון של המילה", flagThanks: "תודה! נבדוק את זה.",
    setTitle: "לימוד שפה", setOff: "כבוי", setSaved: "נשמר", setReadsQ: "כבר קוראים בשפה הזאת?",
    setNote: "\"עוד לא\": השיעורים בתמונות ובקול, בלי קריאה.",
  },
  en: {
    picFew: "The pictures for these words aren't ready yet. Let's go on.",
    flag: "Wrong translation?", flagAria: "Report a wrong translation of this word", flagThanks: "Thanks! We'll check it.",
    setTitle: "Learning a language", setOff: "Off", setSaved: "Saved", setReadsQ: "Reads this language already?",
    setNote: "\"Not yet\": the lessons use pictures and sound, no reading.",
  },
  ar: {
    picFew: "صور هذه الكلمات ليست جاهزة بعد. لنكمل.",
    flag: "ترجمة خاطئة؟", flagAria: "الإبلاغ عن ترجمة خاطئة لهذه الكلمة", flagThanks: "شكرًا! سنتحقق من ذلك.",
    setTitle: "تعلّم لغة", setOff: "متوقف", setSaved: "تم الحفظ", setReadsQ: "هل يقرأ بهذه اللغة بالفعل؟",
    setNote: "\"ليس بعد\": الدروس بالصور والصوت، بدون قراءة.",
  },
  ru: {
    picFew: "Картинки для этих слов ещё не готовы. Идём дальше.",
    flag: "Неверный перевод?", flagAria: "Сообщить о неверном переводе слова", flagThanks: "Спасибо! Мы проверим.",
    setTitle: "Изучение языка", setOff: "Выключено", setSaved: "Сохранено", setReadsQ: "Уже читает на этом языке?",
    setNote: "\"Ещё нет\": уроки с картинками и звуком, без чтения.",
  },
  es: {
    picFew: "Las imágenes de estas palabras aún no están listas. Sigamos.",
    flag: "¿Traducción incorrecta?", flagAria: "Informar de una traducción incorrecta de esta palabra", flagThanks: "¡Gracias! Lo revisaremos.",
    setTitle: "Aprender un idioma", setOff: "Desactivado", setSaved: "Guardado", setReadsQ: "¿Ya lee en este idioma?",
    setNote: "\"Todavía no\": las lecciones usan imágenes y sonido, sin lectura.",
  },
  pt: {
    picFew: "As imagens destas palavras ainda não estão prontas. Vamos em frente.",
    flag: "Tradução errada?", flagAria: "Avisar sobre uma tradução errada desta palavra", flagThanks: "Obrigado! Vamos verificar.",
    setTitle: "Aprender um idioma", setOff: "Desligado", setSaved: "Salvo", setReadsQ: "Já lê neste idioma?",
    setNote: "\"Ainda não\": as lições usam imagens e som, sem leitura.",
  },
  fr: {
    picFew: "Les images de ces mots ne sont pas encore prêtes. On continue.",
    flag: "Traduction fausse ?", flagAria: "Signaler une traduction fausse de ce mot", flagThanks: "Merci ! Nous allons vérifier.",
    setTitle: "Apprendre une langue", setOff: "Désactivé", setSaved: "Enregistré", setReadsQ: "Lit déjà cette langue ?",
    setNote: "\"Pas encore\" : les leçons passent par les images et le son, sans lecture.",
  },
  de: {
    picFew: "Die Bilder für diese Wörter sind noch nicht fertig. Weiter geht's.",
    flag: "Falsche Übersetzung?", flagAria: "Eine falsche Übersetzung dieses Worts melden", flagThanks: "Danke! Wir sehen es uns an.",
    setTitle: "Eine Sprache lernen", setOff: "Aus", setSaved: "Gespeichert", setReadsQ: "Liest schon in dieser Sprache?",
    setNote: "\"Noch nicht\": Die Lektionen arbeiten mit Bildern und Ton, ohne Lesen.",
  },
  cs: {
    picFew: "Obrázky k těmto slovům ještě nejsou hotové. Jdeme dál.",
    flag: "Špatný překlad?", flagAria: "Nahlásit špatný překlad tohoto slova", flagThanks: "Díky! Podíváme se na to.",
    setTitle: "Učení jazyka", setOff: "Vypnuto", setSaved: "Uloženo", setReadsQ: "Už v tomto jazyce čte?",
    setNote: "\"Ještě ne\": lekce s obrázky a zvukem, bez čtení.",
  },
  sk: {
    picFew: "Obrázky k týmto slovám ešte nie sú hotové. Ideme ďalej.",
    flag: "Zlý preklad?", flagAria: "Nahlásiť zlý preklad tohto slova", flagThanks: "Ďakujeme! Pozrieme sa na to.",
    setTitle: "Učenie jazyka", setOff: "Vypnuté", setSaved: "Uložené", setReadsQ: "Už v tomto jazyku číta?",
    setNote: "\"Ešte nie\": lekcie s obrázkami a zvukom, bez čítania.",
  },
  it: {
    picFew: "Le immagini di queste parole non sono ancora pronte. Andiamo avanti.",
    flag: "Traduzione sbagliata?", flagAria: "Segnala una traduzione sbagliata di questa parola", flagThanks: "Grazie! Lo controlleremo.",
    setTitle: "Imparare una lingua", setOff: "Spento", setSaved: "Salvato", setReadsQ: "Legge già in questa lingua?",
    setNote: "\"Non ancora\": le lezioni usano immagini e suoni, senza lettura.",
  },
  ja: {
    picFew: "このことばの絵はまだできていません。先に進みましょう。",
    flag: "訳がまちがってる？", flagAria: "このことばの訳のまちがいを報告", flagThanks: "ありがとう！確認します。",
    setTitle: "ことばの学習", setOff: "オフ", setSaved: "保存しました", setReadsQ: "この言語はもう読めますか？",
    setNote: "「まだ」：レッスンは絵と音で進み、読む練習はありません。",
  },
  hi: {
    picFew: "इन शब्दों की तस्वीरें अभी तैयार नहीं हैं। आगे बढ़ते हैं।",
    flag: "अनुवाद गलत है?", flagAria: "इस शब्द के गलत अनुवाद की सूचना दें", flagThanks: "धन्यवाद! हम इसे देखेंगे।",
    setTitle: "भाषा सीखना", setOff: "बंद", setSaved: "सहेजा गया", setReadsQ: "क्या इस भाषा में पढ़ना आता है?",
    setNote: "\"अभी नहीं\": पाठ तस्वीरों और आवाज़ से चलते हैं, पढ़ना नहीं।",
  },
  am: {
    picFew: "የእነዚህ ቃላት ሥዕሎች ገና አልተዘጋጁም። እንቀጥል።",
    flag: "ትርጉሙ ስህተት ነው?", flagAria: "የዚህን ቃል የተሳሳተ ትርጉም ሪፖርት አድርጉ", flagThanks: "እናመሰግናለን! እንፈትሸዋለን።",
    setTitle: "ቋንቋ መማር", setOff: "ጠፍቷል", setSaved: "ተቀምጧል", setReadsQ: "በዚህ ቋንቋ ማንበብ ይችላል?",
    setNote: "\"ገና ነው\"፦ ትምህርቶቹ በሥዕልና በድምፅ ናቸው፣ ንባብ የለም።",
  },
  uk: {
    picFew: "Малюнки для цих слів ще не готові. Ідемо далі.",
    flag: "Неправильний переклад?", flagAria: "Повідомити про неправильний переклад слова", flagThanks: "Дякуємо! Ми перевіримо.",
    setTitle: "Вивчення мови", setOff: "Вимкнено", setSaved: "Збережено", setReadsQ: "Уже читає цією мовою?",
    setNote: "\"Ще ні\": уроки з малюнками і звуком, без читання.",
  },
  tr: {
    picFew: "Bu kelimelerin resimleri henüz hazır değil. Devam edelim.",
    flag: "Çeviri yanlış mı?", flagAria: "Bu kelimenin yanlış çevirisini bildir", flagThanks: "Teşekkürler! Kontrol edeceğiz.",
    setTitle: "Dil öğrenme", setOff: "Kapalı", setSaved: "Kaydedildi", setReadsQ: "Bu dilde okuyabiliyor mu?",
    setNote: "\"Henüz değil\": dersler resim ve sesle ilerler, okuma yok.",
  },
  pl: {
    picFew: "Obrazki do tych słów nie są jeszcze gotowe. Idziemy dalej.",
    flag: "Zły przekład?", flagAria: "Zgłoś zły przekład tego słowa", flagThanks: "Dzięki! Sprawdzimy to.",
    setTitle: "Nauka języka", setOff: "Wyłączone", setSaved: "Zapisano", setReadsQ: "Czyta już w tym języku?",
    setNote: "\"Jeszcze nie\": lekcje z obrazkami i dźwiękiem, bez czytania.",
  },
  fa: {
    picFew: "تصویرهای این واژه‌ها هنوز آماده نیستند. ادامه می‌دهیم.",
    flag: "ترجمه اشتباه است؟", flagAria: "گزارش ترجمهٔ اشتباه این واژه", flagThanks: "ممنون! بررسی می‌کنیم.",
    setTitle: "یادگیری زبان", setOff: "خاموش", setSaved: "ذخیره شد", setReadsQ: "به این زبان می‌خواند؟",
    setNote: "\"هنوز نه\": درس‌ها با تصویر و صدا، بدون خواندن.",
  },
  id: {
    picFew: "Gambar untuk kata-kata ini belum siap. Kita lanjut.",
    flag: "Terjemahan salah?", flagAria: "Laporkan terjemahan yang salah untuk kata ini", flagThanks: "Terima kasih! Kami akan memeriksanya.",
    setTitle: "Belajar bahasa", setOff: "Mati", setSaved: "Tersimpan", setReadsQ: "Sudah bisa membaca bahasa ini?",
    setNote: "\"Belum\": pelajaran memakai gambar dan suara, tanpa membaca.",
  },
  nl: {
    picFew: "De plaatjes bij deze woorden zijn nog niet klaar. We gaan verder.",
    flag: "Verkeerde vertaling?", flagAria: "Meld een verkeerde vertaling van dit woord", flagThanks: "Bedankt! We kijken ernaar.",
    setTitle: "Een taal leren", setOff: "Uit", setSaved: "Opgeslagen", setReadsQ: "Leest al in deze taal?",
    setNote: "\"Nog niet\": de lessen werken met plaatjes en geluid, zonder lezen.",
  },
  el: {
    picFew: "Οι εικόνες για αυτές τις λέξεις δεν είναι ακόμα έτοιμες. Συνεχίζουμε.",
    flag: "Λάθος μετάφραση;", flagAria: "Αναφορά λάθος μετάφρασης αυτής της λέξης", flagThanks: "Ευχαριστούμε! Θα το ελέγξουμε.",
    setTitle: "Εκμάθηση γλώσσας", setOff: "Ανενεργό", setSaved: "Αποθηκεύτηκε", setReadsQ: "Διαβάζει ήδη σε αυτή τη γλώσσα;",
    setNote: "\"Όχι ακόμα\": τα μαθήματα με εικόνες και ήχο, χωρίς ανάγνωση.",
  },
  zu: {
    picFew: "Izithombe zala magama azikakulungi. Ake siqhubeke.",
    flag: "Ukuhumusha akulungile?", flagAria: "Bika ukuhumusha okungalungile kwaleli gama", flagThanks: "Siyabonga! Sizokuhlola.",
    setTitle: "Ukufunda ulimi", setOff: "Kuvaliwe", setSaved: "Kulondoloziwe", setReadsQ: "Usuyakwazi ukufunda ngalolu limi?",
    setNote: "\"Cha okwamanje\": izifundo ezinezithombe nomsindo, ngaphandle kokufunda.",
  },
  xh: {
    picFew: "Imifanekiso yala magama ayikalungi. Masiqhubeke.",
    flag: "Inguqulelo ayichanekanga?", flagAria: "Xela inguqulelo engachanekanga yeli gama", flagThanks: "Enkosi! Siza kuyijonga.",
    setTitle: "Ukufunda ulwimi", setOff: "Kucinyiwe", setSaved: "Kugciniwe", setReadsQ: "Sele ekwazi ukufunda ngolu lwimi?",
    setNote: "\"Hayi okwangoku\": izifundo ezinemifanekiso nesandi, ngaphandle kokufunda.",
  },
  nso: {
    picFew: "Diswantšho tša mantšu a ga di šo loka. A re tšwele pele.",
    flag: "Phetolelo e fošagetše?", flagAria: "Bega phetolelo ye e fošagetšego ya lentšu le", flagThanks: "Re a leboga! Re tla e lekola.",
    setTitle: "Go ithuta polelo", setOff: "E tima", setSaved: "E bolokilwe", setReadsQ: "O šetše a kgona go bala polelo ye?",
    setNote: "\"Ga e sešo\": dithuto ka diswantšho le modumo, ntle le go bala.",
  },
  tn: {
    picFew: "Ditshwantsho tsa mafoko a ga di ise di siame. A re tswelele.",
    flag: "Phetolelo e phoso?", flagAria: "Bega phetolelo e e phoso ya lefoko le", flagThanks: "Re a leboga! Re tla e tlhola.",
    setTitle: "Go ithuta puo", setOff: "E timilwe", setSaved: "E bolokilwe", setReadsQ: "A o setse a kgona go bala puo e?",
    setNote: "\"Ga ke ise\": dithuto ka ditshwantsho le modumo, kwantle ga go bala.",
  },
  st: {
    picFew: "Ditshwantsho tsa mantswe ana ha di eso lokiswe. Ha re tswele pele.",
    flag: "Phetolelo e fosahetse?", flagAria: "Tlaleha phetolelo e fosahetseng ya lentswe lena", flagThanks: "Re a leboha! Re tla e hlahloba.",
    setTitle: "Ho ithuta puo", setOff: "E tjhesitswe", setSaved: "E bolokilwe", setReadsQ: "Na o se a kgona ho bala puo ena?",
    setNote: "\"Eseng hajwale\": dithuto ka ditshwantsho le modumo, ntle le ho bala.",
  },
  ts: {
    picFew: "Swifaniso swa marito lawa a swi si lunghekela. A hi yeni emahlweni.",
    flag: "Vuhundzuluxeri byi hoxile?", flagAria: "Vika vuhundzuluxeri lebyi hoxeke bya rito leri", flagThanks: "Hi khensa! Hi ta swi kambela.",
    setTitle: "Ku dyondza ririmi", setOff: "Ri timiwile", setSaved: "Swi hlayisiwile", setReadsQ: "Xana u se a kota ku hlaya ririmi leri?",
    setNote: "\"Ku nga si\": tidyondzo hi swifaniso na mpfumawulo, handle ka ku hlaya.",
  },
  ss: {
    picFew: "Titfombe talamagama atikalungi. Asichubeke.",
    flag: "Kuhumusha akulungi?", flagAria: "Bika kuhumusha lokungakalungi kwaleligama", flagThanks: "Siyabonga! Sitawuwuhlola.",
    setTitle: "Kufundza lulwimi", setOff: "Kuvaliwe", setSaved: "Kugcinwe", setReadsQ: "Sewuyakhona kufundza ngalolulwimi?",
    setNote: "\"Akukabi\": tifundvo tinetitfombe nemsindvo, ngaphandle kwekufundza.",
  },
  ve: {
    picFew: "Zwifanyiso zwa maipfi aya a zwi athu lugela. Kha ri bvele phanḓa.",
    flag: "Ṱalutshedzo yo khakhea?", flagAria: "Vhigani ṱalutshedzo yo khakheaho ya ipfi ili", flagThanks: "Ri a livhuwa! Ri ḓo zwi ṱola.",
    setTitle: "U guda luambo", setOff: "Zwo dzimiwa", setSaved: "Zwo vhulungwa", setReadsQ: "U a kona u vhala luambo ulu?",
    setNote: "\"A thi athu\": ngudo nga zwifanyiso na mubvumo, hu si na u vhala.",
  },
  nr: {
    picFew: "Iinthombe zamagama la azikalungi. Asiragele phambili.",
    flag: "Ukutjhugululwa akukalungi?", flagAria: "Bika ukutjhugululwa okungakalungi kwegama leli", flagThanks: "Ngiyathokoza! Sizakulihlola.",
    setTitle: "Ukufunda ilimi", setOff: "Kuvaliwe", setSaved: "Kubulungiwe", setReadsQ: "Sewukghona ukufunda ngelimi leli?",
    setNote: "\"Akukabi\": iimfundo ezineenthombe nomsindo, ngaphandle kokufunda.",
  },
  vi: {
    picFew: "Hình của những từ này chưa sẵn sàng. Mình đi tiếp nhé.",
    flag: "Dịch sai?", flagAria: "Báo lỗi dịch sai của từ này", flagThanks: "Cảm ơn! Chúng tôi sẽ kiểm tra.",
    setTitle: "Học ngôn ngữ", setOff: "Tắt", setSaved: "Đã lưu", setReadsQ: "Đã đọc được ngôn ngữ này chưa?",
    setNote: "\"Chưa\": bài học dùng hình ảnh và âm thanh, không cần đọc.",
  },
  fil: {
    picFew: "Hindi pa handa ang mga larawan ng mga salitang ito. Tuloy tayo.",
    flag: "Mali ang salin?", flagAria: "I-report ang maling salin ng salitang ito", flagThanks: "Salamat! Titingnan namin ito.",
    setTitle: "Pag-aaral ng wika", setOff: "Naka-off", setSaved: "Na-save", setReadsQ: "Nakakabasa na ba sa wikang ito?",
    setNote: "\"Hindi pa\": mga aralin na may larawan at tunog, walang pagbasa.",
  },
  af: {
    picFew: "Die prente vir hierdie woorde is nog nie gereed nie. Ons gaan aan.",
    flag: "Verkeerde vertaling?", flagAria: "Meld 'n verkeerde vertaling van hierdie woord", flagThanks: "Dankie! Ons sal dit nagaan.",
    setTitle: "'n Taal leer", setOff: "Af", setSaved: "Gestoor", setReadsQ: "Lees al in hierdie taal?",
    setNote: "\"Nog nie\": die lesse werk met prente en klank, sonder lees.",
  },
  sw: {
    picFew: "Picha za maneno haya bado hazijawa tayari. Tuendelee.",
    flag: "Tafsiri si sahihi?", flagAria: "Ripoti tafsiri isiyo sahihi ya neno hili", flagThanks: "Asante! Tutaliangalia.",
    setTitle: "Kujifunza lugha", setOff: "Imezimwa", setSaved: "Imehifadhiwa", setReadsQ: "Tayari anasoma lugha hii?",
    setNote: "\"Bado\": masomo kwa picha na sauti, bila kusoma.",
  },
  "zh-CN": {
    picFew: "这些单词的图片还没准备好。我们继续吧。",
    flag: "翻译不对？", flagAria: "报告这个单词的翻译错误", flagThanks: "谢谢！我们会检查。",
    setTitle: "学语言", setOff: "关闭", setSaved: "已保存", setReadsQ: "已经能读这种语言了吗？",
    setNote: "“还不会”：课程用图片和声音，不需要阅读。",
  },
  "zh-TW": {
    picFew: "這些單字的圖片還沒準備好。我們繼續吧。",
    flag: "翻譯不對？", flagAria: "回報這個單字的翻譯錯誤", flagThanks: "謝謝！我們會檢查。",
    setTitle: "學語言", setOff: "關閉", setSaved: "已儲存", setReadsQ: "已經會讀這種語言了嗎？",
    setNote: "「還不會」：課程用圖片和聲音，不需要閱讀。",
  },
  ko: {
    picFew: "이 단어들의 그림이 아직 준비되지 않았어요. 계속 가요.",
    flag: "번역이 틀렸나요?", flagAria: "이 단어의 잘못된 번역 신고", flagThanks: "고마워요! 확인할게요.",
    setTitle: "언어 배우기", setOff: "끄기", setSaved: "저장됨", setReadsQ: "이 언어를 벌써 읽을 수 있나요?",
    setNote: "\"아직요\": 수업은 그림과 소리로 진행되고, 읽기는 없어요.",
  },
  th: {
    picFew: "รูปของคำเหล่านี้ยังไม่พร้อม ไปต่อกันเลย",
    flag: "แปลผิดหรือเปล่า?", flagAria: "แจ้งคำแปลที่ผิดของคำนี้", flagThanks: "ขอบคุณ! เราจะตรวจสอบ",
    setTitle: "การเรียนภาษา", setOff: "ปิด", setSaved: "บันทึกแล้ว", setReadsQ: "อ่านภาษานี้ได้แล้วหรือยัง?",
    setNote: "\"ยังไม่ได้\": บทเรียนใช้รูปภาพและเสียง ไม่ต้องอ่าน",
  },
  bn: {
    picFew: "এই শব্দগুলোর ছবি এখনো তৈরি হয়নি। চলো এগিয়ে যাই।",
    flag: "অনুবাদ ভুল?", flagAria: "এই শব্দের ভুল অনুবাদ জানান", flagThanks: "ধন্যবাদ! আমরা দেখে নেব।",
    setTitle: "ভাষা শেখা", setOff: "বন্ধ", setSaved: "সংরক্ষিত", setReadsQ: "এই ভাষায় কি পড়তে পারে?",
    setNote: "\"এখনো না\": পাঠ চলে ছবি আর আওয়াজে, পড়া ছাড়া।",
  },
  da: {
    picFew: "Billederne til disse ord er ikke klar endnu. Vi går videre.",
    flag: "Forkert oversættelse?", flagAria: "Meld en forkert oversættelse af dette ord", flagThanks: "Tak! Vi kigger på det.",
    setTitle: "At lære et sprog", setOff: "Fra", setSaved: "Gemt", setReadsQ: "Læser allerede dette sprog?",
    setNote: "\"Ikke endnu\": lektionerne bruger billeder og lyd, uden læsning.",
  },
  hu: {
    picFew: "Ezeknek a szavaknak a képei még nincsenek kész. Menjünk tovább.",
    flag: "Rossz fordítás?", flagAria: "A szó rossz fordításának jelentése", flagThanks: "Köszönjük! Megnézzük.",
    setTitle: "Nyelvtanulás", setOff: "Ki", setSaved: "Mentve", setReadsQ: "Olvas már ezen a nyelven?",
    setNote: "\"Még nem\": a leckék képekkel és hanggal mennek, olvasás nélkül.",
  },
};

export function learnExtraCopy(lang: string): LearnExtraCopy {
  return COPY[lang] ?? COPY.en;
}
