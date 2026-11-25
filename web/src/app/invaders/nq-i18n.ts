/**
 * The niqqud door of מילים פולשות: screen texts, approved by Gadi on
 * 2026-11-25 word for word (scratchpad wording page). Hebrew speaks to the
 * children in the plural. English is for a tester whose screen is in English;
 * other languages see the words door's "Hebrew only" note.
 */
export type NqCopy = {
  doorWords: string;
  doorWordsSub: string;
  doorNiqqud: string;
  doorNiqqudSub: string;
  stationsTitle: string;
  stageName: [string, string, string];
  locked: string;
  jumpNote: string;
  loading: string;
  failed: string;
  back: string;
  stationName: Record<string, string>;
  stationIntro: Record<string, string>;
  start: string;
  /** The line at the top: by sound ("אָ") or by the sign's name ("קָמָץ"). */
  callSound: (sound: string) => string;
  callName: (name: string) => string;
  hear: string;
  impostorSound: (sound: string) => string;
  impostorName: (name: string) => string;
  cleanCalls: (k: number, n: number) => string;
  passed: string;
  notPassed: string;
  stationDone: string;
  wordies: (n: number) => string;
  savedLater: string;
  nextStage: string;
  again: string;
  toStations: string;
};

const HE: NqCopy = {
  doorWords: "מילים",
  doorWordsSub: "תופסים את המשמעויות של מילה",
  doorNiqqud: "ניקוד",
  doorNiqqudSub: "תופסים את סימן הניקוד הנכון",
  stationsTitle: "התחנות של הניקוד",
  stageName: ["סימן", "אות", "מילה"],
  locked: "נפתחת אחרי התחנה הקודמת",
  jumpNote: "בודקים יכולים לפתוח כל תחנה וכל שלב",
  loading: "טוענים את התחנות",
  failed: "לא הצלחנו לטעון. נסו שוב בעוד רגע.",
  back: "חזרה",
  stationName: {
    "s-a": "הצליל אָ",
    "s-i": "הצליל אִי",
    "s-o": "הצליל אוֹ",
    "s-u": "הצליל אוּ",
    "s-e": "הצליל אֶ",
    "n-a": "קָמָץ או פַּתָּח",
    "n-e": "צֵירֵי או סֶגּוֹל",
    "n-u": "שׁוּרוּק או קֻבּוּץ",
    "x-o": "חוֹלָם עם ו ובלי ו",
    "x-i": "חִירִיק עם י ובלי י",
    "x-sh": "שְׁוָא",
  },
  stationIntro: {
    "s-a": "שני הסימנים האלה אומרים אָ. תפסו כל מה שאומר אָ.",
    "s-i": "הסימן הזה אומר אִי. תפסו כל מה שאומר אִי.",
    "s-o": "הסימן הזה אומר אוֹ. תפסו כל מה שאומר אוֹ.",
    "s-u": "שני הסימנים האלה אומרים אוּ. תפסו כל מה שאומר אוּ.",
    "s-e": "שני הסימנים האלה אומרים אֶ. תפסו כל מה שאומר אֶ.",
    "n-a": "קָמָץ ופַתָּח אומרים אותו צליל, אבל הם סימנים שונים. עכשיו תפסו רק את הסימן שקוראים בשמו.",
    "n-e": "צֵירֵי וסֶגּוֹל אומרים אותו צליל, אבל הם סימנים שונים. עכשיו תפסו רק את הסימן שקוראים בשמו.",
    "n-u": "שׁוּרוּק וקֻבּוּץ אומרים אותו צליל, אבל הם סימנים שונים. עכשיו תפסו רק את הסימן שקוראים בשמו.",
    "x-o": "את החוֹלָם כותבים בשתי דרכים: נקודה מעל האות, או ו עם נקודה מעליה. שתיהן אומרות אוֹ. היזהרו מהשׁוּרוּק, ו עם נקודה באמצע.",
    "x-i": "חִירִיק הוא נקודה אחת מתחת לאות. לפעמים באה אחריו י, ולפעמים לא, ותמיד הוא אומר אִי. היזהרו מצֵירֵי ומסֶגּוֹל.",
    "x-sh": "שְׁוָא הוא שתי נקודות אחת מעל השנייה. היזהרו מצֵירֵי, שתי נקודות אחת ליד השנייה.",
  },
  start: "מתחילים",
  callSound: (s) => `תפסו כל מה שאומר ${s}`,
  callName: (n) => `תפסו רק ${n}`,
  hear: "השמיעו שוב",
  impostorSound: (s) => `מתחזה! זה אומר ${s}`,
  impostorName: (n) => `מתחזה! זה ${n}`,
  cleanCalls: (k, n) => `${k} מתוך ${n} בלי טעות`,
  passed: "עברתם! השלב הבא נפתח",
  notPassed: "כמעט. צריך 4 מתוך 5 בלי טעות. עוד פעם?",
  stationDone: "סיימתם את התחנה!",
  wordies: (n) => `+${n} Wordies`,
  savedLater: "נשמור את זה ברגע שהחיבור יחזור",
  nextStage: "לשלב הבא",
  again: "עוד פעם",
  toStations: "לכל התחנות",
};

/** The Hebrew sounds and sign names as an English screen says them. */
const SOUND_EN: Record<string, string> = { "אָ": "AH", "אִי": "EE", "אוֹ": "OH", "אוּ": "OO", "אֶ": "EH" };
const NAME_EN: Record<string, string> = {
  "קָמָץ": "kamatz", "פַּתָּח": "patah", "צֵירֵי": "tsere", "סֶגּוֹל": "segol", "חִירִיק": "hirik",
  "חוֹלָם": "holam", "שׁוּרוּק": "shuruk", "קֻבּוּץ": "kubutz", "שְׁוָא": "shva",
};
const en = (map: Record<string, string>, s: string) => map[s] ?? s;

const EN: NqCopy = {
  doorWords: "Words",
  doorWordsSub: "Catch the meanings of a word",
  doorNiqqud: "Vowel signs",
  doorNiqqudSub: "Catch the right vowel sign",
  stationsTitle: "The vowel sign stations",
  stageName: ["Sign", "Letter", "Word"],
  locked: "Opens after the station before it",
  jumpNote: "Testers can open any station and stage",
  loading: "Loading the stations",
  failed: "We could not load this. Try again in a moment.",
  back: "Back",
  stationName: {
    "s-a": "The sound AH",
    "s-i": "The sound EE",
    "s-o": "The sound OH",
    "s-u": "The sound OO",
    "s-e": "The sound EH",
    "n-a": "Kamatz or patah",
    "n-e": "Tsere or segol",
    "n-u": "Shuruk or kubutz",
    "x-o": "Holam with and without vav",
    "x-i": "Hirik with and without yod",
    "x-sh": "Shva",
  },
  stationIntro: {
    "s-a": "Both of these signs say AH. Catch everything that says AH.",
    "s-i": "This sign says EE. Catch everything that says EE.",
    "s-o": "This sign says OH. Catch everything that says OH.",
    "s-u": "Both of these signs say OO. Catch everything that says OO.",
    "s-e": "Both of these signs say EH. Catch everything that says EH.",
    "n-a": "Kamatz and patah say the same sound, but they are different signs. Now catch only the sign that is named.",
    "n-e": "Tsere and segol say the same sound, but they are different signs. Now catch only the sign that is named.",
    "n-u": "Shuruk and kubutz say the same sound, but they are different signs. Now catch only the sign that is named.",
    "x-o": "Holam is written in two ways: a dot above the letter, or a vav with a dot above it. Both say OH. Watch out for shuruk, a vav with a dot in the middle.",
    "x-i": "Hirik is one dot under the letter. Sometimes a yod comes after it and sometimes not, and it always says EE. Watch out for tsere and segol.",
    "x-sh": "Shva is two dots, one above the other. Watch out for tsere, two dots side by side.",
  },
  start: "Start",
  callSound: (s) => `Catch everything that says ${en(SOUND_EN, s)}`,
  callName: (n) => `Catch only ${en(NAME_EN, n)}`,
  hear: "Hear it again",
  impostorSound: (s) => `Impostor! This one says ${en(SOUND_EN, s)}`,
  impostorName: (n) => `Impostor! This one is ${en(NAME_EN, n)}`,
  cleanCalls: (k, n) => `${k} of ${n} without a mistake`,
  passed: "You passed! The next stage is open",
  notPassed: "Almost. You need 4 of 5 without a mistake. Once more?",
  stationDone: "You finished the station!",
  wordies: (n) => `+${n} Wordies`,
  savedLater: "We will save this as soon as you are back online",
  nextStage: "Next stage",
  again: "Again",
  toStations: "All stations",
};

export const nqCopy = (lang: string): NqCopy => (lang === "he" ? HE : EN);
