/**
 * Localised copy for the family word-alert notifications (push + email),
 * so a parent always gets them in THEIR language, not English. Keyed by
 * UI language code; family-notify falls back to English per-key.
 *
 * Placeholders (substituted in family-notify, keep them verbatim):
 *   {kid}  = the child's name
 *   {word} = the looked-up word
 *   {n}    = number of words in a daily digest
 *
 * digestTitle is phrased to read naturally for any n >= 1 (avoid a hard
 * "{n} words" plural that breaks in languages with complex plurals).
 */
export type NotifStrings = {
  /** push title, instant mode */
  instantTitle: string;   // "{kid} looked up a word"
  /** email subject, instant mode */
  instantSubject: string; // "{kid} looked up: {word}"
  /** email lead sentence, instant mode */
  instantLead: string;    // "{kid} just looked up a word in the dictionary:"
  /** push + email title, daily digest */
  digestTitle: string;    // "Today's summary: {n}"
  /** email lead sentence, daily digest */
  digestLead: string;     // "Words your kids looked up today:"
};

export const NOTIF_STRINGS: Record<string, NotifStrings> = {
  en: {
    instantTitle: "{kid} looked up a word",
    instantSubject: "{kid} looked up: {word}",
    instantLead: "{kid} just looked up a word in the dictionary:",
    digestTitle: "Today's summary: {n} words",
    digestLead: "Words your kids looked up today:",
  },
  he: {
    instantTitle: "{kid} חיפש/ה מילה",
    instantSubject: "{kid} חיפש/ה: {word}",
    instantLead: "{kid} חיפש/ה עכשיו מילה במילון:",
    digestTitle: "סיכום היום: {n} מילים",
    digestLead: "המילים שהילדים חיפשו היום:",
  },
  ar: {
    instantTitle: "{kid} بحث عن كلمة",
    instantSubject: "{kid} بحث عن: {word}",
    instantLead: "{kid} بحث الآن عن كلمة في القاموس:",
    digestTitle: "ملخص اليوم: {n} كلمة",
    digestLead: "الكلمات التي بحث عنها أطفالك اليوم:",
  },
  ru: {
    instantTitle: "{kid} искал(а) слово",
    instantSubject: "{kid} искал(а): {word}",
    instantLead: "{kid} только что искал(а) слово в словаре:",
    digestTitle: "Итоги дня: {n}",
    digestLead: "Слова, которые ваши дети искали сегодня:",
  },
  es: {
    instantTitle: "{kid} buscó una palabra",
    instantSubject: "{kid} buscó: {word}",
    instantLead: "{kid} acaba de buscar una palabra en el diccionario:",
    digestTitle: "Resumen de hoy: {n}",
    digestLead: "Palabras que tus hijos buscaron hoy:",
  },
  pt: {
    instantTitle: "{kid} pesquisou uma palavra",
    instantSubject: "{kid} pesquisou: {word}",
    instantLead: "{kid} acabou de pesquisar uma palavra no dicionário:",
    digestTitle: "Resumo de hoje: {n}",
    digestLead: "Palavras que seus filhos pesquisaram hoje:",
  },
  fr: {
    instantTitle: "{kid} a cherché un mot",
    instantSubject: "{kid} a cherché : {word}",
    instantLead: "{kid} vient de chercher un mot dans le dictionnaire :",
    digestTitle: "Résumé du jour : {n}",
    digestLead: "Les mots que vos enfants ont cherchés aujourd'hui :",
  },
  de: {
    instantTitle: "{kid} hat ein Wort nachgeschlagen",
    instantSubject: "{kid} hat nachgeschlagen: {word}",
    instantLead: "{kid} hat gerade ein Wort im Wörterbuch nachgeschlagen:",
    digestTitle: "Zusammenfassung heute: {n}",
    digestLead: "Wörter, die Ihre Kinder heute nachgeschlagen haben:",
  },
  cs: {
    instantTitle: "{kid} vyhledal(a) slovo",
    instantSubject: "{kid} vyhledal(a): {word}",
    instantLead: "{kid} právě vyhledal(a) slovo ve slovníku:",
    digestTitle: "Dnešní přehled: {n}",
    digestLead: "Slova, která vaše děti dnes vyhledaly:",
  },
  sk: {
    instantTitle: "{kid} vyhľadal(a) slovo",
    instantSubject: "{kid} vyhľadal(a): {word}",
    instantLead: "{kid} práve vyhľadal(a) slovo v slovníku:",
    digestTitle: "Dnešný prehľad: {n}",
    digestLead: "Slová, ktoré vaše deti dnes vyhľadali:",
  },
  it: {
    instantTitle: "{kid} ha cercato una parola",
    instantSubject: "{kid} ha cercato: {word}",
    instantLead: "{kid} ha appena cercato una parola nel dizionario:",
    digestTitle: "Riepilogo di oggi: {n}",
    digestLead: "Le parole che i tuoi figli hanno cercato oggi:",
  },
  ja: {
    instantTitle: "{kid}が単語を調べました",
    instantSubject: "{kid}が調べた単語: {word}",
    instantLead: "{kid}が辞書で単語を調べました:",
    digestTitle: "今日のまとめ: {n}語",
    digestLead: "今日お子さまが調べた単語:",
  },
  hi: {
    instantTitle: "{kid} ने एक शब्द खोजा",
    instantSubject: "{kid} ने खोजा: {word}",
    instantLead: "{kid} ने अभी शब्दकोश में एक शब्द खोजा:",
    digestTitle: "आज का सारांश: {n}",
    digestLead: "आपके बच्चों ने आज जो शब्द खोजे:",
  },
  am: {
    instantTitle: "{kid} ቃል ፈልጎ አገኘ",
    instantSubject: "{kid} ፈለገ: {word}",
    instantLead: "{kid} አሁን በመዝገበ ቃላት ውስጥ ቃል ፈልጎ አገኘ:",
    digestTitle: "የዛሬ ማጠቃለያ: {n}",
    digestLead: "ልጆችዎ ዛሬ የፈለጓቸው ቃላት:",
  },
  uk: {
    instantTitle: "{kid} шукав(ла) слово",
    instantSubject: "{kid} шукав(ла): {word}",
    instantLead: "{kid} щойно шукав(ла) слово у словнику:",
    digestTitle: "Підсумок дня: {n}",
    digestLead: "Слова, які ваші діти шукали сьогодні:",
  },
  tr: {
    instantTitle: "{kid} bir kelime aradı",
    instantSubject: "{kid} şunu aradı: {word}",
    instantLead: "{kid} sözlükte az önce bir kelime aradı:",
    digestTitle: "Bugünün özeti: {n}",
    digestLead: "Çocuklarınızın bugün aradığı kelimeler:",
  },
  pl: {
    instantTitle: "{kid} wyszukał(a) słowo",
    instantSubject: "{kid} wyszukał(a): {word}",
    instantLead: "{kid} właśnie wyszukał(a) słowo w słowniku:",
    digestTitle: "Podsumowanie dnia: {n}",
    digestLead: "Słowa, których wasze dzieci szukały dzisiaj:",
  },
  fa: {
    instantTitle: "{kid} یک کلمه جستجو کرد",
    instantSubject: "{kid} جستجو کرد: {word}",
    instantLead: "{kid} همین حالا یک کلمه در فرهنگ لغت جستجو کرد:",
    digestTitle: "خلاصه امروز: {n}",
    digestLead: "کلماتی که فرزندانتان امروز جستجو کردند:",
  },
  id: {
    instantTitle: "{kid} mencari sebuah kata",
    instantSubject: "{kid} mencari: {word}",
    instantLead: "{kid} baru saja mencari sebuah kata di kamus:",
    digestTitle: "Ringkasan hari ini: {n}",
    digestLead: "Kata-kata yang dicari anak Anda hari ini:",
  },
  nl: {
    instantTitle: "{kid} zocht een woord op",
    instantSubject: "{kid} zocht op: {word}",
    instantLead: "{kid} heeft net een woord in het woordenboek opgezocht:",
    digestTitle: "Samenvatting van vandaag: {n}",
    digestLead: "Woorden die je kinderen vandaag hebben opgezocht:",
  },
  el: {
    instantTitle: "Ο/Η {kid} αναζήτησε μια λέξη",
    instantSubject: "Ο/Η {kid} αναζήτησε: {word}",
    instantLead: "Ο/Η {kid} μόλις αναζήτησε μια λέξη στο λεξικό:",
    digestTitle: "Σύνοψη σήμερα: {n}",
    digestLead: "Λέξεις που αναζήτησαν τα παιδιά σας σήμερα:",
  },
  zu: {
    instantTitle: "{kid} ucinge igama",
    instantSubject: "{kid} ucinge: {word}",
    instantLead: "{kid} usanda kucinga igama esichazamazwini:",
    digestTitle: "Isifinyezo sanamuhla: {n}",
    digestLead: "Amagama izingane zakho eziwacingile namuhla:",
  },
};
