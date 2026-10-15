/**
 * Curated dictation sets in the learner's own language for the UI languages
 * whose sets are not generated on demand (South Africa, 2026-10-15). Same set
 * ids and the same English words, in the same order, as DICTATION_SETS; the
 * `he` field is the non-English side, as everywhere in the trainer.
 */
import type { WordPair } from "@/lib/dictation-sets";

export const NATIVE_DICTATION_SETS: Record<string, Record<string, { title: string; words: WordPair[] }>> = {
 "xh": {
  "colors": {
   "title": "Imibala",
   "words": [
    {
     "en": "red",
     "he": "bomvu"
    },
    {
     "en": "blue",
     "he": "luhlaza okwesibhakabhaka"
    },
    {
     "en": "green",
     "he": "luhlaza"
    },
    {
     "en": "yellow",
     "he": "mthubi"
    },
    {
     "en": "black",
     "he": "mnyama"
    },
    {
     "en": "white",
     "he": "mhlophe"
    },
    {
     "en": "orange",
     "he": "orenji"
    },
    {
     "en": "purple",
     "he": "mfusa"
    },
    {
     "en": "pink",
     "he": "pinki"
    },
    {
     "en": "brown",
     "he": "mdaka"
    },
    {
     "en": "gray",
     "he": "ngwevu"
    }
   ]
  },
  "numbers": {
   "title": "Amanani",
   "words": [
    {
     "en": "one",
     "he": "inye"
    },
    {
     "en": "two",
     "he": "zimbini"
    },
    {
     "en": "three",
     "he": "zintathu"
    },
    {
     "en": "four",
     "he": "zine"
    },
    {
     "en": "five",
     "he": "zintlanu"
    },
    {
     "en": "six",
     "he": "zintandathu"
    },
    {
     "en": "seven",
     "he": "isixhenxe"
    },
    {
     "en": "eight",
     "he": "isibhozo"
    },
    {
     "en": "nine",
     "he": "ithoba"
    },
    {
     "en": "ten",
     "he": "ishumi"
    },
    {
     "en": "eleven",
     "he": "ishumi elinanye"
    },
    {
     "en": "twelve",
     "he": "ishumi elinesibini"
    }
   ]
  },
  "family": {
   "title": "Usapho",
   "words": [
    {
     "en": "mother",
     "he": "umama"
    },
    {
     "en": "father",
     "he": "utata"
    },
    {
     "en": "brother",
     "he": "ubhuti"
    },
    {
     "en": "sister",
     "he": "usisi"
    },
    {
     "en": "grandmother",
     "he": "umakhulu"
    },
    {
     "en": "grandfather",
     "he": "utat'omkhulu"
    },
    {
     "en": "baby",
     "he": "usana"
    },
    {
     "en": "son",
     "he": "unyana"
    },
    {
     "en": "daughter",
     "he": "intombi"
    },
    {
     "en": "family",
     "he": "usapho"
    }
   ]
  },
  "animals": {
   "title": "Izilwanyana",
   "words": [
    {
     "en": "dog",
     "he": "inja"
    },
    {
     "en": "cat",
     "he": "ikati"
    },
    {
     "en": "bird",
     "he": "intaka"
    },
    {
     "en": "fish",
     "he": "intlanzi"
    },
    {
     "en": "cow",
     "he": "inkomo"
    },
    {
     "en": "horse",
     "he": "ihashe"
    },
    {
     "en": "lion",
     "he": "ingonyama"
    },
    {
     "en": "elephant",
     "he": "indlovu"
    },
    {
     "en": "monkey",
     "he": "inkawu"
    },
    {
     "en": "rabbit",
     "he": "umvundla"
    },
    {
     "en": "bear",
     "he": "ibhere"
    },
    {
     "en": "duck",
     "he": "idada"
    }
   ]
  },
  "body": {
   "title": "Umzimba",
   "words": [
    {
     "en": "head",
     "he": "intloko"
    },
    {
     "en": "hand",
     "he": "isandla"
    },
    {
     "en": "eye",
     "he": "iliso"
    },
    {
     "en": "ear",
     "he": "indlebe"
    },
    {
     "en": "nose",
     "he": "impumlo"
    },
    {
     "en": "mouth",
     "he": "umlomo"
    },
    {
     "en": "leg",
     "he": "umlenze"
    },
    {
     "en": "hair",
     "he": "iinwele"
    },
    {
     "en": "finger",
     "he": "umnwe"
    },
    {
     "en": "tooth",
     "he": "izinyo"
    }
   ]
  },
  "food": {
   "title": "Ukutya",
   "words": [
    {
     "en": "bread",
     "he": "isonka"
    },
    {
     "en": "milk",
     "he": "ubisi"
    },
    {
     "en": "water",
     "he": "amanzi"
    },
    {
     "en": "apple",
     "he": "iapile"
    },
    {
     "en": "banana",
     "he": "ibhanana"
    },
    {
     "en": "egg",
     "he": "iqanda"
    },
    {
     "en": "cheese",
     "he": "itshizi"
    },
    {
     "en": "cake",
     "he": "ikhekhe"
    },
    {
     "en": "rice",
     "he": "irayisi"
    },
    {
     "en": "meat",
     "he": "inyama"
    }
   ]
  },
  "clothes": {
   "title": "Iimpahla",
   "words": [
    {
     "en": "shirt",
     "he": "ihempe"
    },
    {
     "en": "pants",
     "he": "ibhulukhwe"
    },
    {
     "en": "dress",
     "he": "ilokhwe"
    },
    {
     "en": "hat",
     "he": "umnqwazi"
    },
    {
     "en": "shoes",
     "he": "izihlangu"
    },
    {
     "en": "socks",
     "he": "iikawusi"
    },
    {
     "en": "coat",
     "he": "idyasi"
    },
    {
     "en": "skirt",
     "he": "isiketi"
    }
   ]
  },
  "weather": {
   "title": "Imozulu",
   "words": [
    {
     "en": "sun",
     "he": "ilanga"
    },
    {
     "en": "rain",
     "he": "imvula"
    },
    {
     "en": "cloud",
     "he": "ilifu"
    },
    {
     "en": "wind",
     "he": "umoya"
    },
    {
     "en": "snow",
     "he": "ikhephu"
    },
    {
     "en": "hot",
     "he": "shushu"
    },
    {
     "en": "cold",
     "he": "banda"
    },
    {
     "en": "storm",
     "he": "uqhwithela"
    }
   ]
  },
  "days": {
   "title": "Iintsuku neenyanga",
   "words": [
    {
     "en": "Sunday",
     "he": "iCawa"
    },
    {
     "en": "Monday",
     "he": "uMvulo"
    },
    {
     "en": "Tuesday",
     "he": "uLwesibini"
    },
    {
     "en": "Wednesday",
     "he": "uLwesithathu"
    },
    {
     "en": "Thursday",
     "he": "uLwesine"
    },
    {
     "en": "Friday",
     "he": "uLwesihlanu"
    },
    {
     "en": "Saturday",
     "he": "uMgqibelo"
    },
    {
     "en": "day",
     "he": "usuku"
    },
    {
     "en": "week",
     "he": "iveki"
    },
    {
     "en": "month",
     "he": "inyanga"
    }
   ]
  },
  "verbs": {
   "title": "Izenzi zentshukumo",
   "words": [
    {
     "en": "go",
     "he": "ukuhamba"
    },
    {
     "en": "run",
     "he": "ukubaleka"
    },
    {
     "en": "jump",
     "he": "ukutsiba"
    },
    {
     "en": "eat",
     "he": "ukutya"
    },
    {
     "en": "drink",
     "he": "ukusela"
    },
    {
     "en": "read",
     "he": "ukufunda"
    },
    {
     "en": "write",
     "he": "ukubhala"
    },
    {
     "en": "play",
     "he": "ukudlala"
    },
    {
     "en": "sleep",
     "he": "ukulala"
    },
    {
     "en": "sit",
     "he": "ukuhlala"
    }
   ]
  }
 },
 "nso": {
  "colors": {
   "title": "Mebala",
   "words": [
    {
     "en": "red",
     "he": "khubedu"
    },
    {
     "en": "blue",
     "he": "talalerata"
    },
    {
     "en": "green",
     "he": "talamorogo"
    },
    {
     "en": "yellow",
     "he": "serolwana"
    },
    {
     "en": "black",
     "he": "ntsho"
    },
    {
     "en": "white",
     "he": "tšhweu"
    },
    {
     "en": "orange",
     "he": "namune"
    },
    {
     "en": "purple",
     "he": "pherese"
    },
    {
     "en": "pink",
     "he": "pinki"
    },
    {
     "en": "brown",
     "he": "sootho"
    },
    {
     "en": "gray",
     "he": "putswa"
    }
   ]
  },
  "numbers": {
   "title": "Dinomoro",
   "words": [
    {
     "en": "one",
     "he": "tee"
    },
    {
     "en": "two",
     "he": "pedi"
    },
    {
     "en": "three",
     "he": "tharo"
    },
    {
     "en": "four",
     "he": "nne"
    },
    {
     "en": "five",
     "he": "hlano"
    },
    {
     "en": "six",
     "he": "tshela"
    },
    {
     "en": "seven",
     "he": "šupa"
    },
    {
     "en": "eight",
     "he": "seswai"
    },
    {
     "en": "nine",
     "he": "senyane"
    },
    {
     "en": "ten",
     "he": "lesome"
    },
    {
     "en": "eleven",
     "he": "lesometee"
    },
    {
     "en": "twelve",
     "he": "lesomepedi"
    }
   ]
  },
  "family": {
   "title": "Lapa",
   "words": [
    {
     "en": "mother",
     "he": "mma"
    },
    {
     "en": "father",
     "he": "tate"
    },
    {
     "en": "brother",
     "he": "morwarre"
    },
    {
     "en": "sister",
     "he": "kgaetšedi"
    },
    {
     "en": "grandmother",
     "he": "koko"
    },
    {
     "en": "grandfather",
     "he": "rakgolo"
    },
    {
     "en": "baby",
     "he": "lesea"
    },
    {
     "en": "son",
     "he": "morwa"
    },
    {
     "en": "daughter",
     "he": "morwedi"
    },
    {
     "en": "family",
     "he": "lapa"
    }
   ]
  },
  "animals": {
   "title": "Diphoofolo",
   "words": [
    {
     "en": "dog",
     "he": "mpša"
    },
    {
     "en": "cat",
     "he": "katse"
    },
    {
     "en": "bird",
     "he": "nonyana"
    },
    {
     "en": "fish",
     "he": "hlapi"
    },
    {
     "en": "cow",
     "he": "kgomo"
    },
    {
     "en": "horse",
     "he": "pere"
    },
    {
     "en": "lion",
     "he": "tau"
    },
    {
     "en": "elephant",
     "he": "tlou"
    },
    {
     "en": "monkey",
     "he": "kgabo"
    },
    {
     "en": "rabbit",
     "he": "mmutla"
    },
    {
     "en": "bear",
     "he": "bere"
    },
    {
     "en": "duck",
     "he": "pidipidi"
    }
   ]
  },
  "body": {
   "title": "Mmele",
   "words": [
    {
     "en": "head",
     "he": "hlogo"
    },
    {
     "en": "hand",
     "he": "seatla"
    },
    {
     "en": "eye",
     "he": "leihlo"
    },
    {
     "en": "ear",
     "he": "tsebe"
    },
    {
     "en": "nose",
     "he": "nko"
    },
    {
     "en": "mouth",
     "he": "molomo"
    },
    {
     "en": "leg",
     "he": "leoto"
    },
    {
     "en": "hair",
     "he": "moriri"
    },
    {
     "en": "finger",
     "he": "monwana"
    },
    {
     "en": "tooth",
     "he": "leino"
    }
   ]
  },
  "food": {
   "title": "Dijo",
   "words": [
    {
     "en": "bread",
     "he": "borotho"
    },
    {
     "en": "milk",
     "he": "maswi"
    },
    {
     "en": "water",
     "he": "meetse"
    },
    {
     "en": "apple",
     "he": "apola"
    },
    {
     "en": "banana",
     "he": "panana"
    },
    {
     "en": "egg",
     "he": "lee"
    },
    {
     "en": "cheese",
     "he": "tšhese"
    },
    {
     "en": "cake",
     "he": "khekhe"
    },
    {
     "en": "rice",
     "he": "reisi"
    },
    {
     "en": "meat",
     "he": "nama"
    }
   ]
  },
  "clothes": {
   "title": "Diaparo",
   "words": [
    {
     "en": "shirt",
     "he": "hempe"
    },
    {
     "en": "pants",
     "he": "borokgo"
    },
    {
     "en": "dress",
     "he": "roko"
    },
    {
     "en": "hat",
     "he": "kefa"
    },
    {
     "en": "shoes",
     "he": "dieta"
    },
    {
     "en": "socks",
     "he": "dikausu"
    },
    {
     "en": "coat",
     "he": "baki"
    },
    {
     "en": "skirt",
     "he": "sekhethe"
    }
   ]
  },
  "weather": {
   "title": "Boemo bja leratadima",
   "words": [
    {
     "en": "sun",
     "he": "letšatši"
    },
    {
     "en": "rain",
     "he": "pula"
    },
    {
     "en": "cloud",
     "he": "leru"
    },
    {
     "en": "wind",
     "he": "phefo"
    },
    {
     "en": "snow",
     "he": "lehlwa"
    },
    {
     "en": "hot",
     "he": "fiša"
    },
    {
     "en": "cold",
     "he": "tonya"
    },
    {
     "en": "storm",
     "he": "ledimo"
    }
   ]
  },
  "days": {
   "title": "Matšatši le Dikgwedi",
   "words": [
    {
     "en": "Sunday",
     "he": "Lamorena"
    },
    {
     "en": "Monday",
     "he": "Mošupologo"
    },
    {
     "en": "Tuesday",
     "he": "Labobedi"
    },
    {
     "en": "Wednesday",
     "he": "Laboraro"
    },
    {
     "en": "Thursday",
     "he": "Labone"
    },
    {
     "en": "Friday",
     "he": "Labohlano"
    },
    {
     "en": "Saturday",
     "he": "Mokibelo"
    },
    {
     "en": "day",
     "he": "letšatši"
    },
    {
     "en": "week",
     "he": "beke"
    },
    {
     "en": "month",
     "he": "kgwedi"
    }
   ]
  },
  "verbs": {
   "title": "Madiri a tiro",
   "words": [
    {
     "en": "go",
     "he": "sepela"
    },
    {
     "en": "run",
     "he": "kitima"
    },
    {
     "en": "jump",
     "he": "fofa"
    },
    {
     "en": "eat",
     "he": "ja"
    },
    {
     "en": "drink",
     "he": "nwa"
    },
    {
     "en": "read",
     "he": "bala"
    },
    {
     "en": "write",
     "he": "ngwala"
    },
    {
     "en": "play",
     "he": "raloka"
    },
    {
     "en": "sleep",
     "he": "robala"
    },
    {
     "en": "sit",
     "he": "dula"
    }
   ]
  }
 },
 "tn": {
  "colors": {
   "title": "Mebala",
   "words": [
    {
     "en": "red",
     "he": "khibidu"
    },
    {
     "en": "blue",
     "he": "bolou"
    },
    {
     "en": "green",
     "he": "tala"
    },
    {
     "en": "yellow",
     "he": "serolwana"
    },
    {
     "en": "black",
     "he": "ntsho"
    },
    {
     "en": "white",
     "he": "tshweu"
    },
    {
     "en": "orange",
     "he": "namune"
    },
    {
     "en": "purple",
     "he": "pherese"
    },
    {
     "en": "pink",
     "he": "pinki"
    },
    {
     "en": "brown",
     "he": "borokwa"
    },
    {
     "en": "gray",
     "he": "pududu"
    }
   ]
  },
  "numbers": {
   "title": "Dipalo",
   "words": [
    {
     "en": "one",
     "he": "nngwe"
    },
    {
     "en": "two",
     "he": "pedi"
    },
    {
     "en": "three",
     "he": "tharo"
    },
    {
     "en": "four",
     "he": "nne"
    },
    {
     "en": "five",
     "he": "tlhano"
    },
    {
     "en": "six",
     "he": "thataro"
    },
    {
     "en": "seven",
     "he": "supa"
    },
    {
     "en": "eight",
     "he": "robedi"
    },
    {
     "en": "nine",
     "he": "robongwe"
    },
    {
     "en": "ten",
     "he": "lesome"
    },
    {
     "en": "eleven",
     "he": "lesome le bongwe"
    },
    {
     "en": "twelve",
     "he": "lesome le bobedi"
    }
   ]
  },
  "family": {
   "title": "Lelapa",
   "words": [
    {
     "en": "mother",
     "he": "mme"
    },
    {
     "en": "father",
     "he": "rre"
    },
    {
     "en": "brother",
     "he": "morwarre"
    },
    {
     "en": "sister",
     "he": "kgaitsadi"
    },
    {
     "en": "grandmother",
     "he": "nkoko"
    },
    {
     "en": "grandfather",
     "he": "rremogolo"
    },
    {
     "en": "baby",
     "he": "lesea"
    },
    {
     "en": "son",
     "he": "morwa"
    },
    {
     "en": "daughter",
     "he": "morwadi"
    },
    {
     "en": "family",
     "he": "lelapa"
    }
   ]
  },
  "animals": {
   "title": "Diphologolo",
   "words": [
    {
     "en": "dog",
     "he": "ntša"
    },
    {
     "en": "cat",
     "he": "katse"
    },
    {
     "en": "bird",
     "he": "nonyane"
    },
    {
     "en": "fish",
     "he": "tlhapi"
    },
    {
     "en": "cow",
     "he": "kgomo"
    },
    {
     "en": "horse",
     "he": "pitse"
    },
    {
     "en": "lion",
     "he": "tau"
    },
    {
     "en": "elephant",
     "he": "tlou"
    },
    {
     "en": "monkey",
     "he": "kgabo"
    },
    {
     "en": "rabbit",
     "he": "mmutla"
    },
    {
     "en": "bear",
     "he": "bere"
    },
    {
     "en": "duck",
     "he": "pidipidi"
    }
   ]
  },
  "body": {
   "title": "Mmele",
   "words": [
    {
     "en": "head",
     "he": "tlhogo"
    },
    {
     "en": "hand",
     "he": "seatla"
    },
    {
     "en": "eye",
     "he": "leitlho"
    },
    {
     "en": "ear",
     "he": "tsebe"
    },
    {
     "en": "nose",
     "he": "nko"
    },
    {
     "en": "mouth",
     "he": "molomo"
    },
    {
     "en": "leg",
     "he": "leoto"
    },
    {
     "en": "hair",
     "he": "moriri"
    },
    {
     "en": "finger",
     "he": "monwana"
    },
    {
     "en": "tooth",
     "he": "leino"
    }
   ]
  },
  "food": {
   "title": "Dijo",
   "words": [
    {
     "en": "bread",
     "he": "borotho"
    },
    {
     "en": "milk",
     "he": "mashi"
    },
    {
     "en": "water",
     "he": "metsi"
    },
    {
     "en": "apple",
     "he": "apole"
    },
    {
     "en": "banana",
     "he": "panana"
    },
    {
     "en": "egg",
     "he": "lee"
    },
    {
     "en": "cheese",
     "he": "kase"
    },
    {
     "en": "cake",
     "he": "kuku"
    },
    {
     "en": "rice",
     "he": "reise"
    },
    {
     "en": "meat",
     "he": "nama"
    }
   ]
  },
  "clothes": {
   "title": "Diaparo",
   "words": [
    {
     "en": "shirt",
     "he": "hempe"
    },
    {
     "en": "pants",
     "he": "borokgwe"
    },
    {
     "en": "dress",
     "he": "mosese"
    },
    {
     "en": "hat",
     "he": "hutshe"
    },
    {
     "en": "shoes",
     "he": "ditlhako"
    },
    {
     "en": "socks",
     "he": "dikausu"
    },
    {
     "en": "coat",
     "he": "jase"
    },
    {
     "en": "skirt",
     "he": "sekhete"
    }
   ]
  },
  "weather": {
   "title": "Maemo a bosa",
   "words": [
    {
     "en": "sun",
     "he": "letsatsi"
    },
    {
     "en": "rain",
     "he": "pula"
    },
    {
     "en": "cloud",
     "he": "leru"
    },
    {
     "en": "wind",
     "he": "phefo"
    },
    {
     "en": "snow",
     "he": "kapoko"
    },
    {
     "en": "hot",
     "he": "mogote"
    },
    {
     "en": "cold",
     "he": "tsididi"
    },
    {
     "en": "storm",
     "he": "sefefo"
    }
   ]
  },
  "days": {
   "title": "Malatsi le Dikgwedi",
   "words": [
    {
     "en": "Sunday",
     "he": "Tshipi"
    },
    {
     "en": "Monday",
     "he": "Mosupologo"
    },
    {
     "en": "Tuesday",
     "he": "Labobedi"
    },
    {
     "en": "Wednesday",
     "he": "Laboraro"
    },
    {
     "en": "Thursday",
     "he": "Labone"
    },
    {
     "en": "Friday",
     "he": "Labotlhano"
    },
    {
     "en": "Saturday",
     "he": "Lamatlhatso"
    },
    {
     "en": "day",
     "he": "letsatsi"
    },
    {
     "en": "week",
     "he": "beke"
    },
    {
     "en": "month",
     "he": "kgwedi"
    }
   ]
  },
  "verbs": {
   "title": "Madiri a ditiro",
   "words": [
    {
     "en": "go",
     "he": "tsamaya"
    },
    {
     "en": "run",
     "he": "siana"
    },
    {
     "en": "jump",
     "he": "tlola"
    },
    {
     "en": "eat",
     "he": "ja"
    },
    {
     "en": "drink",
     "he": "nwa"
    },
    {
     "en": "read",
     "he": "bala"
    },
    {
     "en": "write",
     "he": "kwala"
    },
    {
     "en": "play",
     "he": "tshameka"
    },
    {
     "en": "sleep",
     "he": "robala"
    },
    {
     "en": "sit",
     "he": "nna"
    }
   ]
  }
 },
 "st": {
  "colors": {
   "title": "Mebala",
   "words": [
    {
     "en": "red",
     "he": "kgubedu"
    },
    {
     "en": "blue",
     "he": "putswa"
    },
    {
     "en": "green",
     "he": "tala"
    },
    {
     "en": "yellow",
     "he": "tshehla"
    },
    {
     "en": "black",
     "he": "ntsho"
    },
    {
     "en": "white",
     "he": "tshweu"
    },
    {
     "en": "orange",
     "he": "lamunu"
    },
    {
     "en": "purple",
     "he": "pherese"
    },
    {
     "en": "pink",
     "he": "pinki"
    },
    {
     "en": "brown",
     "he": "sootho"
    },
    {
     "en": "gray",
     "he": "thokwa"
    }
   ]
  },
  "numbers": {
   "title": "Dipalo",
   "words": [
    {
     "en": "one",
     "he": "nngwe"
    },
    {
     "en": "two",
     "he": "pedi"
    },
    {
     "en": "three",
     "he": "tharo"
    },
    {
     "en": "four",
     "he": "nne"
    },
    {
     "en": "five",
     "he": "hlano"
    },
    {
     "en": "six",
     "he": "tshelela"
    },
    {
     "en": "seven",
     "he": "supa"
    },
    {
     "en": "eight",
     "he": "robedi"
    },
    {
     "en": "nine",
     "he": "robong"
    },
    {
     "en": "ten",
     "he": "leshome"
    },
    {
     "en": "eleven",
     "he": "leshome le motso o mong"
    },
    {
     "en": "twelve",
     "he": "leshome le metso e mmedi"
    }
   ]
  },
  "family": {
   "title": "Lelapa",
   "words": [
    {
     "en": "mother",
     "he": "mme"
    },
    {
     "en": "father",
     "he": "ntate"
    },
    {
     "en": "brother",
     "he": "abuti"
    },
    {
     "en": "sister",
     "he": "ausi"
    },
    {
     "en": "grandmother",
     "he": "nkgono"
    },
    {
     "en": "grandfather",
     "he": "ntatemoholo"
    },
    {
     "en": "baby",
     "he": "lesea"
    },
    {
     "en": "son",
     "he": "mora"
    },
    {
     "en": "daughter",
     "he": "moradi"
    },
    {
     "en": "family",
     "he": "lelapa"
    }
   ]
  },
  "animals": {
   "title": "Diphoofolo",
   "words": [
    {
     "en": "dog",
     "he": "ntja"
    },
    {
     "en": "cat",
     "he": "katse"
    },
    {
     "en": "bird",
     "he": "nonyana"
    },
    {
     "en": "fish",
     "he": "tlhapi"
    },
    {
     "en": "cow",
     "he": "kgomo"
    },
    {
     "en": "horse",
     "he": "pere"
    },
    {
     "en": "lion",
     "he": "tau"
    },
    {
     "en": "elephant",
     "he": "tlou"
    },
    {
     "en": "monkey",
     "he": "tshwene"
    },
    {
     "en": "rabbit",
     "he": "mmutla"
    },
    {
     "en": "bear",
     "he": "bere"
    },
    {
     "en": "duck",
     "he": "letata"
    }
   ]
  },
  "body": {
   "title": "Mmele",
   "words": [
    {
     "en": "head",
     "he": "hlooho"
    },
    {
     "en": "hand",
     "he": "letsoho"
    },
    {
     "en": "eye",
     "he": "leihlo"
    },
    {
     "en": "ear",
     "he": "tsebe"
    },
    {
     "en": "nose",
     "he": "nko"
    },
    {
     "en": "mouth",
     "he": "molomo"
    },
    {
     "en": "leg",
     "he": "leoto"
    },
    {
     "en": "hair",
     "he": "moriri"
    },
    {
     "en": "finger",
     "he": "monwana"
    },
    {
     "en": "tooth",
     "he": "leino"
    }
   ]
  },
  "food": {
   "title": "Dijo",
   "words": [
    {
     "en": "bread",
     "he": "bohobe"
    },
    {
     "en": "milk",
     "he": "lebese"
    },
    {
     "en": "water",
     "he": "metsi"
    },
    {
     "en": "apple",
     "he": "apole"
    },
    {
     "en": "banana",
     "he": "banana"
    },
    {
     "en": "egg",
     "he": "lehe"
    },
    {
     "en": "cheese",
     "he": "tjhese"
    },
    {
     "en": "cake",
     "he": "kuku"
    },
    {
     "en": "rice",
     "he": "raese"
    },
    {
     "en": "meat",
     "he": "nama"
    }
   ]
  },
  "clothes": {
   "title": "Diaparo",
   "words": [
    {
     "en": "shirt",
     "he": "hempe"
    },
    {
     "en": "pants",
     "he": "borikgwe"
    },
    {
     "en": "dress",
     "he": "mose"
    },
    {
     "en": "hat",
     "he": "katiba"
    },
    {
     "en": "shoes",
     "he": "dieta"
    },
    {
     "en": "socks",
     "he": "dikausu"
    },
    {
     "en": "coat",
     "he": "jase"
    },
    {
     "en": "skirt",
     "he": "sekete"
    }
   ]
  },
  "weather": {
   "title": "Boemo ba lehodimo",
   "words": [
    {
     "en": "sun",
     "he": "letsatsi"
    },
    {
     "en": "rain",
     "he": "pula"
    },
    {
     "en": "cloud",
     "he": "leru"
    },
    {
     "en": "wind",
     "he": "moya"
    },
    {
     "en": "snow",
     "he": "lehlwa"
    },
    {
     "en": "hot",
     "he": "tjhesa"
    },
    {
     "en": "cold",
     "he": "bata"
    },
    {
     "en": "storm",
     "he": "sefefo"
    }
   ]
  },
  "days": {
   "title": "Matsatsi le Dikgwedi",
   "words": [
    {
     "en": "Sunday",
     "he": "Sontaha"
    },
    {
     "en": "Monday",
     "he": "Mantaha"
    },
    {
     "en": "Tuesday",
     "he": "Labobedi"
    },
    {
     "en": "Wednesday",
     "he": "Laboraro"
    },
    {
     "en": "Thursday",
     "he": "Labone"
    },
    {
     "en": "Friday",
     "he": "Labohlano"
    },
    {
     "en": "Saturday",
     "he": "Moqebelo"
    },
    {
     "en": "day",
     "he": "letsatsi"
    },
    {
     "en": "week",
     "he": "beke"
    },
    {
     "en": "month",
     "he": "kgwedi"
    }
   ]
  },
  "verbs": {
   "title": "Maetsi a ketso",
   "words": [
    {
     "en": "go",
     "he": "tsamaya"
    },
    {
     "en": "run",
     "he": "matha"
    },
    {
     "en": "jump",
     "he": "tlola"
    },
    {
     "en": "eat",
     "he": "ja"
    },
    {
     "en": "drink",
     "he": "nwa"
    },
    {
     "en": "read",
     "he": "bala"
    },
    {
     "en": "write",
     "he": "ngola"
    },
    {
     "en": "play",
     "he": "bapala"
    },
    {
     "en": "sleep",
     "he": "robala"
    },
    {
     "en": "sit",
     "he": "dula"
    }
   ]
  }
 },
 "ts": {
  "colors": {
   "title": "Mihlovo",
   "words": [
    {
     "en": "red",
     "he": "tshwuka"
    },
    {
     "en": "blue",
     "he": "wasi"
    },
    {
     "en": "green",
     "he": "rihlaza"
    },
    {
     "en": "yellow",
     "he": "xitshopana"
    },
    {
     "en": "black",
     "he": "ntima"
    },
    {
     "en": "white",
     "he": "basa"
    },
    {
     "en": "orange",
     "he": "oranji"
    },
    {
     "en": "purple",
     "he": "phephula"
    },
    {
     "en": "pink",
     "he": "pinki"
    },
    {
     "en": "brown",
     "he": "buraweni"
    },
    {
     "en": "gray",
     "he": "mpunga"
    }
   ]
  },
  "numbers": {
   "title": "Tinomboro",
   "words": [
    {
     "en": "one",
     "he": "n'we"
    },
    {
     "en": "two",
     "he": "mbirhi"
    },
    {
     "en": "three",
     "he": "nharhu"
    },
    {
     "en": "four",
     "he": "mune"
    },
    {
     "en": "five",
     "he": "ntlhanu"
    },
    {
     "en": "six",
     "he": "ntsevu"
    },
    {
     "en": "seven",
     "he": "nkombo"
    },
    {
     "en": "eight",
     "he": "nhungu"
    },
    {
     "en": "nine",
     "he": "nkaye"
    },
    {
     "en": "ten",
     "he": "khume"
    },
    {
     "en": "eleven",
     "he": "khume n'we"
    },
    {
     "en": "twelve",
     "he": "khume mbirhi"
    }
   ]
  },
  "family": {
   "title": "Ndyangu",
   "words": [
    {
     "en": "mother",
     "he": "manana"
    },
    {
     "en": "father",
     "he": "tatana"
    },
    {
     "en": "brother",
     "he": "buti"
    },
    {
     "en": "sister",
     "he": "sesi"
    },
    {
     "en": "grandmother",
     "he": "kokwana wa xisati"
    },
    {
     "en": "grandfather",
     "he": "kokwana wa xinuna"
    },
    {
     "en": "baby",
     "he": "ricece"
    },
    {
     "en": "son",
     "he": "n'wana wa jaha"
    },
    {
     "en": "daughter",
     "he": "n'wana wa nhwanyana"
    },
    {
     "en": "family",
     "he": "ndyangu"
    }
   ]
  },
  "animals": {
   "title": "Swiharhi",
   "words": [
    {
     "en": "dog",
     "he": "mbyana"
    },
    {
     "en": "cat",
     "he": "ximanga"
    },
    {
     "en": "bird",
     "he": "xinyenyana"
    },
    {
     "en": "fish",
     "he": "nhlampfi"
    },
    {
     "en": "cow",
     "he": "homu"
    },
    {
     "en": "horse",
     "he": "hanci"
    },
    {
     "en": "lion",
     "he": "nghala"
    },
    {
     "en": "elephant",
     "he": "ndlopfu"
    },
    {
     "en": "monkey",
     "he": "nkawu"
    },
    {
     "en": "rabbit",
     "he": "mpfundla"
    },
    {
     "en": "bear",
     "he": "bere"
    },
    {
     "en": "duck",
     "he": "sekwa"
    }
   ]
  },
  "body": {
   "title": "Miri",
   "words": [
    {
     "en": "head",
     "he": "nhloko"
    },
    {
     "en": "hand",
     "he": "voko"
    },
    {
     "en": "eye",
     "he": "tihlo"
    },
    {
     "en": "ear",
     "he": "ndleve"
    },
    {
     "en": "nose",
     "he": "nhompfu"
    },
    {
     "en": "mouth",
     "he": "nomu"
    },
    {
     "en": "leg",
     "he": "nenge"
    },
    {
     "en": "hair",
     "he": "misisi"
    },
    {
     "en": "finger",
     "he": "ritiho"
    },
    {
     "en": "tooth",
     "he": "tino"
    }
   ]
  },
  "food": {
   "title": "Swakudya",
   "words": [
    {
     "en": "bread",
     "he": "xinkwa"
    },
    {
     "en": "milk",
     "he": "masi"
    },
    {
     "en": "water",
     "he": "mati"
    },
    {
     "en": "apple",
     "he": "apula"
    },
    {
     "en": "banana",
     "he": "banana"
    },
    {
     "en": "egg",
     "he": "tandza"
    },
    {
     "en": "cheese",
     "he": "chisi"
    },
    {
     "en": "cake",
     "he": "khekhe"
    },
    {
     "en": "rice",
     "he": "rhayisi"
    },
    {
     "en": "meat",
     "he": "nyama"
    }
   ]
  },
  "clothes": {
   "title": "Swiambalo",
   "words": [
    {
     "en": "shirt",
     "he": "hembe"
    },
    {
     "en": "pants",
     "he": "bulukwa"
    },
    {
     "en": "dress",
     "he": "rokho"
    },
    {
     "en": "hat",
     "he": "xihuku"
    },
    {
     "en": "shoes",
     "he": "tintangu"
    },
    {
     "en": "socks",
     "he": "masokisi"
    },
    {
     "en": "coat",
     "he": "jasi"
    },
    {
     "en": "skirt",
     "he": "siketi"
    }
   ]
  },
  "weather": {
   "title": "Maxelo",
   "words": [
    {
     "en": "sun",
     "he": "dyambu"
    },
    {
     "en": "rain",
     "he": "mpfula"
    },
    {
     "en": "cloud",
     "he": "papa"
    },
    {
     "en": "wind",
     "he": "moya"
    },
    {
     "en": "snow",
     "he": "gamboko"
    },
    {
     "en": "hot",
     "he": "hisa"
    },
    {
     "en": "cold",
     "he": "titimela"
    },
    {
     "en": "storm",
     "he": "xidzedze"
    }
   ]
  },
  "days": {
   "title": "Masiku na tin'hweti",
   "words": [
    {
     "en": "Sunday",
     "he": "Sonto"
    },
    {
     "en": "Monday",
     "he": "Musumbhunuku"
    },
    {
     "en": "Tuesday",
     "he": "Ravumbirhi"
    },
    {
     "en": "Wednesday",
     "he": "Ravunharhu"
    },
    {
     "en": "Thursday",
     "he": "Ravumune"
    },
    {
     "en": "Friday",
     "he": "Ravuntlhanu"
    },
    {
     "en": "Saturday",
     "he": "Mugqivela"
    },
    {
     "en": "day",
     "he": "siku"
    },
    {
     "en": "week",
     "he": "vhiki"
    },
    {
     "en": "month",
     "he": "n'hweti"
    }
   ]
  },
  "verbs": {
   "title": "Maendli ya swiendlo",
   "words": [
    {
     "en": "go",
     "he": "famba"
    },
    {
     "en": "run",
     "he": "tsutsuma"
    },
    {
     "en": "jump",
     "he": "tlula"
    },
    {
     "en": "eat",
     "he": "dya"
    },
    {
     "en": "drink",
     "he": "nwa"
    },
    {
     "en": "read",
     "he": "hlaya"
    },
    {
     "en": "write",
     "he": "tsala"
    },
    {
     "en": "play",
     "he": "tlanga"
    },
    {
     "en": "sleep",
     "he": "etlela"
    },
    {
     "en": "sit",
     "he": "tshama"
    }
   ]
  }
 },
 "ss": {
  "colors": {
   "title": "Imibala",
   "words": [
    {
     "en": "red",
     "he": "bovu"
    },
    {
     "en": "blue",
     "he": "luhlata kwesibhakabhaka"
    },
    {
     "en": "green",
     "he": "luhlata"
    },
    {
     "en": "yellow",
     "he": "phuzi"
    },
    {
     "en": "black",
     "he": "mnyama"
    },
    {
     "en": "white",
     "he": "mhlophe"
    },
    {
     "en": "orange",
     "he": "orenji"
    },
    {
     "en": "purple",
     "he": "phephuli"
    },
    {
     "en": "pink",
     "he": "phinki"
    },
    {
     "en": "brown",
     "he": "nsundvu"
    },
    {
     "en": "gray",
     "he": "mpunga"
    }
   ]
  },
  "numbers": {
   "title": "Tinombolo",
   "words": [
    {
     "en": "one",
     "he": "kunye"
    },
    {
     "en": "two",
     "he": "kubili"
    },
    {
     "en": "three",
     "he": "kutsatfu"
    },
    {
     "en": "four",
     "he": "kune"
    },
    {
     "en": "five",
     "he": "kuhlanu"
    },
    {
     "en": "six",
     "he": "sitfupha"
    },
    {
     "en": "seven",
     "he": "sikhombisa"
    },
    {
     "en": "eight",
     "he": "siphohlongo"
    },
    {
     "en": "nine",
     "he": "lithoba"
    },
    {
     "en": "ten",
     "he": "lishumi"
    },
    {
     "en": "eleven",
     "he": "lishumi nakunye"
    },
    {
     "en": "twelve",
     "he": "lishumi nakubili"
    }
   ]
  },
  "family": {
   "title": "Umndeni",
   "words": [
    {
     "en": "mother",
     "he": "make"
    },
    {
     "en": "father",
     "he": "babe"
    },
    {
     "en": "brother",
     "he": "umfowetfu"
    },
    {
     "en": "sister",
     "he": "dzadzewetfu"
    },
    {
     "en": "grandmother",
     "he": "gogo"
    },
    {
     "en": "grandfather",
     "he": "mkhulu"
    },
    {
     "en": "baby",
     "he": "lusana"
    },
    {
     "en": "son",
     "he": "indvodzana"
    },
    {
     "en": "daughter",
     "he": "indvodzakati"
    },
    {
     "en": "family",
     "he": "umndeni"
    }
   ]
  },
  "animals": {
   "title": "Tilwane",
   "words": [
    {
     "en": "dog",
     "he": "inja"
    },
    {
     "en": "cat",
     "he": "likati"
    },
    {
     "en": "bird",
     "he": "inyoni"
    },
    {
     "en": "fish",
     "he": "inhlanti"
    },
    {
     "en": "cow",
     "he": "inkhomo"
    },
    {
     "en": "horse",
     "he": "lihhashi"
    },
    {
     "en": "lion",
     "he": "libhubesi"
    },
    {
     "en": "elephant",
     "he": "indlovu"
    },
    {
     "en": "monkey",
     "he": "inkhawu"
    },
    {
     "en": "rabbit",
     "he": "logwaja"
    },
    {
     "en": "bear",
     "he": "libhele"
    },
    {
     "en": "duck",
     "he": "lidada"
    }
   ]
  },
  "body": {
   "title": "Umtimba",
   "words": [
    {
     "en": "head",
     "he": "inhloko"
    },
    {
     "en": "hand",
     "he": "sandla"
    },
    {
     "en": "eye",
     "he": "liso"
    },
    {
     "en": "ear",
     "he": "indlebe"
    },
    {
     "en": "nose",
     "he": "likhala"
    },
    {
     "en": "mouth",
     "he": "umlomo"
    },
    {
     "en": "leg",
     "he": "umlente"
    },
    {
     "en": "hair",
     "he": "tinwele"
    },
    {
     "en": "finger",
     "he": "umunwe"
    },
    {
     "en": "tooth",
     "he": "litinyo"
    }
   ]
  },
  "food": {
   "title": "Kudla",
   "words": [
    {
     "en": "bread",
     "he": "sinkhwa"
    },
    {
     "en": "milk",
     "he": "lubisi"
    },
    {
     "en": "water",
     "he": "emanti"
    },
    {
     "en": "apple",
     "he": "liapula"
    },
    {
     "en": "banana",
     "he": "libhanana"
    },
    {
     "en": "egg",
     "he": "licandza"
    },
    {
     "en": "cheese",
     "he": "shizi"
    },
    {
     "en": "cake",
     "he": "likhekhe"
    },
    {
     "en": "rice",
     "he": "lilayisi"
    },
    {
     "en": "meat",
     "he": "inyama"
    }
   ]
  },
  "clothes": {
   "title": "Timphahla",
   "words": [
    {
     "en": "shirt",
     "he": "lihembe"
    },
    {
     "en": "pants",
     "he": "libhulukwe"
    },
    {
     "en": "dress",
     "he": "lirokho"
    },
    {
     "en": "hat",
     "he": "sigcoko"
    },
    {
     "en": "shoes",
     "he": "ticatfulo"
    },
    {
     "en": "socks",
     "he": "emasokisi"
    },
    {
     "en": "coat",
     "he": "lijazi"
    },
    {
     "en": "skirt",
     "he": "siketi"
    }
   ]
  },
  "weather": {
   "title": "Simo selitulu",
   "words": [
    {
     "en": "sun",
     "he": "lilanga"
    },
    {
     "en": "rain",
     "he": "imvula"
    },
    {
     "en": "cloud",
     "he": "lifu"
    },
    {
     "en": "wind",
     "he": "umoya"
    },
    {
     "en": "snow",
     "he": "lichwa"
    },
    {
     "en": "hot",
     "he": "kushisa"
    },
    {
     "en": "cold",
     "he": "kubandza"
    },
    {
     "en": "storm",
     "he": "siphepho"
    }
   ]
  },
  "days": {
   "title": "Emalanga netinyanga",
   "words": [
    {
     "en": "Sunday",
     "he": "Lisontfo"
    },
    {
     "en": "Monday",
     "he": "uMsombuluko"
    },
    {
     "en": "Tuesday",
     "he": "Lesibili"
    },
    {
     "en": "Wednesday",
     "he": "Lesitsatfu"
    },
    {
     "en": "Thursday",
     "he": "Lesine"
    },
    {
     "en": "Friday",
     "he": "Lesihlanu"
    },
    {
     "en": "Saturday",
     "he": "uMgcibelo"
    },
    {
     "en": "day",
     "he": "lilanga"
    },
    {
     "en": "week",
     "he": "liviki"
    },
    {
     "en": "month",
     "he": "inyanga"
    }
   ]
  },
  "verbs": {
   "title": "Tento",
   "words": [
    {
     "en": "go",
     "he": "kuhamba"
    },
    {
     "en": "run",
     "he": "kugijima"
    },
    {
     "en": "jump",
     "he": "kugcuma"
    },
    {
     "en": "eat",
     "he": "kudla"
    },
    {
     "en": "drink",
     "he": "kunatsa"
    },
    {
     "en": "read",
     "he": "kufundza"
    },
    {
     "en": "write",
     "he": "kubhala"
    },
    {
     "en": "play",
     "he": "kudlala"
    },
    {
     "en": "sleep",
     "he": "kulala"
    },
    {
     "en": "sit",
     "he": "kuhlala"
    }
   ]
  }
 },
 "ve": {
  "colors": {
   "title": "Mivhala",
   "words": [
    {
     "en": "red",
     "he": "tswuku"
    },
    {
     "en": "blue",
     "he": "lutombo"
    },
    {
     "en": "green",
     "he": "dala"
    },
    {
     "en": "yellow",
     "he": "tshitaḓa"
    },
    {
     "en": "black",
     "he": "ntswu"
    },
    {
     "en": "white",
     "he": "tshena"
    },
    {
     "en": "orange",
     "he": "ourenzhi"
    },
    {
     "en": "purple",
     "he": "pephuḽu"
    },
    {
     "en": "pink",
     "he": "pinki"
    },
    {
     "en": "brown",
     "he": "buraweni"
    },
    {
     "en": "gray",
     "he": "girei"
    }
   ]
  },
  "numbers": {
   "title": "Nomboro",
   "words": [
    {
     "en": "one",
     "he": "thihi"
    },
    {
     "en": "two",
     "he": "mbili"
    },
    {
     "en": "three",
     "he": "tharu"
    },
    {
     "en": "four",
     "he": "ṋa"
    },
    {
     "en": "five",
     "he": "ṱhanu"
    },
    {
     "en": "six",
     "he": "rathi"
    },
    {
     "en": "seven",
     "he": "sumbe"
    },
    {
     "en": "eight",
     "he": "malo"
    },
    {
     "en": "nine",
     "he": "ṱahe"
    },
    {
     "en": "ten",
     "he": "fumi"
    },
    {
     "en": "eleven",
     "he": "fumi na thihi"
    },
    {
     "en": "twelve",
     "he": "fumi na mbili"
    }
   ]
  },
  "family": {
   "title": "Muṱa",
   "words": [
    {
     "en": "mother",
     "he": "mme"
    },
    {
     "en": "father",
     "he": "khotsi"
    },
    {
     "en": "brother",
     "he": "mukomana"
    },
    {
     "en": "sister",
     "he": "khaladzi"
    },
    {
     "en": "grandmother",
     "he": "makhulu"
    },
    {
     "en": "grandfather",
     "he": "makhulu wa munna"
    },
    {
     "en": "baby",
     "he": "lushie"
    },
    {
     "en": "son",
     "he": "murwa"
    },
    {
     "en": "daughter",
     "he": "ṅwananyana"
    },
    {
     "en": "family",
     "he": "muṱa"
    }
   ]
  },
  "animals": {
   "title": "Zwipuka",
   "words": [
    {
     "en": "dog",
     "he": "mmbwa"
    },
    {
     "en": "cat",
     "he": "tshimange"
    },
    {
     "en": "bird",
     "he": "tshiṋoni"
    },
    {
     "en": "fish",
     "he": "khovhe"
    },
    {
     "en": "cow",
     "he": "kholomo"
    },
    {
     "en": "horse",
     "he": "bere"
    },
    {
     "en": "lion",
     "he": "ndau"
    },
    {
     "en": "elephant",
     "he": "ndou"
    },
    {
     "en": "monkey",
     "he": "thoho"
    },
    {
     "en": "rabbit",
     "he": "muvhuda"
    },
    {
     "en": "bear",
     "he": "bea"
    },
    {
     "en": "duck",
     "he": "dada"
    }
   ]
  },
  "body": {
   "title": "Muvhili",
   "words": [
    {
     "en": "head",
     "he": "ṱhoho"
    },
    {
     "en": "hand",
     "he": "tshanḓa"
    },
    {
     "en": "eye",
     "he": "iṱo"
    },
    {
     "en": "ear",
     "he": "nḓevhe"
    },
    {
     "en": "nose",
     "he": "ningo"
    },
    {
     "en": "mouth",
     "he": "mulomo"
    },
    {
     "en": "leg",
     "he": "mulenzhe"
    },
    {
     "en": "hair",
     "he": "mavhudzi"
    },
    {
     "en": "finger",
     "he": "munwe"
    },
    {
     "en": "tooth",
     "he": "ḽino"
    }
   ]
  },
  "food": {
   "title": "Zwiḽiwa",
   "words": [
    {
     "en": "bread",
     "he": "vhurotho"
    },
    {
     "en": "milk",
     "he": "mafhi"
    },
    {
     "en": "water",
     "he": "maḓi"
    },
    {
     "en": "apple",
     "he": "apula"
    },
    {
     "en": "banana",
     "he": "muomva"
    },
    {
     "en": "egg",
     "he": "tshiṱuku"
    },
    {
     "en": "cheese",
     "he": "tshizi"
    },
    {
     "en": "cake",
     "he": "khekhe"
    },
    {
     "en": "rice",
     "he": "raisi"
    },
    {
     "en": "meat",
     "he": "nama"
    }
   ]
  },
  "clothes": {
   "title": "Zwiambaro",
   "words": [
    {
     "en": "shirt",
     "he": "hembe"
    },
    {
     "en": "pants",
     "he": "bulukhwe"
    },
    {
     "en": "dress",
     "he": "rokho"
    },
    {
     "en": "hat",
     "he": "tshipeu"
    },
    {
     "en": "shoes",
     "he": "zwienda"
    },
    {
     "en": "socks",
     "he": "masokisi"
    },
    {
     "en": "coat",
     "he": "jasi"
    },
    {
     "en": "skirt",
     "he": "sikete"
    }
   ]
  },
  "weather": {
   "title": "Mutsho",
   "words": [
    {
     "en": "sun",
     "he": "ḓuvha"
    },
    {
     "en": "rain",
     "he": "mvula"
    },
    {
     "en": "cloud",
     "he": "gole"
    },
    {
     "en": "wind",
     "he": "muya"
    },
    {
     "en": "snow",
     "he": "gwamba"
    },
    {
     "en": "hot",
     "he": "dudu"
    },
    {
     "en": "cold",
     "he": "mutsiko"
    },
    {
     "en": "storm",
     "he": "ḓaḓamuya"
    }
   ]
  },
  "days": {
   "title": "Maḓuvha na Minwedzi",
   "words": [
    {
     "en": "Sunday",
     "he": "Swondaha"
    },
    {
     "en": "Monday",
     "he": "Musumbuluwo"
    },
    {
     "en": "Tuesday",
     "he": "Ḽavhuvhili"
    },
    {
     "en": "Wednesday",
     "he": "Ḽavhuraru"
    },
    {
     "en": "Thursday",
     "he": "Ḽavhuṋa"
    },
    {
     "en": "Friday",
     "he": "Ḽavhuṱanu"
    },
    {
     "en": "Saturday",
     "he": "Mugivhela"
    },
    {
     "en": "day",
     "he": "ḓuvha"
    },
    {
     "en": "week",
     "he": "vhege"
    },
    {
     "en": "month",
     "he": "ṅwedzi"
    }
   ]
  },
  "verbs": {
   "title": "Maiti a nyito",
   "words": [
    {
     "en": "go",
     "he": "u ya"
    },
    {
     "en": "run",
     "he": "u gidima"
    },
    {
     "en": "jump",
     "he": "u fhufha"
    },
    {
     "en": "eat",
     "he": "u ḽa"
    },
    {
     "en": "drink",
     "he": "u nwa"
    },
    {
     "en": "read",
     "he": "u vhala"
    },
    {
     "en": "write",
     "he": "u ṅwala"
    },
    {
     "en": "play",
     "he": "u tamba"
    },
    {
     "en": "sleep",
     "he": "u lala"
    },
    {
     "en": "sit",
     "he": "u dzula"
    }
   ]
  }
 },
 "nr": {
  "colors": {
   "title": "Imibala",
   "words": [
    {
     "en": "red",
     "he": "okubomvu"
    },
    {
     "en": "blue",
     "he": "okwesibhakabhaka"
    },
    {
     "en": "green",
     "he": "okuhlaza"
    },
    {
     "en": "yellow",
     "he": "okuphuzi"
    },
    {
     "en": "black",
     "he": "okunzima"
    },
    {
     "en": "white",
     "he": "okumhlophe"
    },
    {
     "en": "orange",
     "he": "okuwolintjhi"
    },
    {
     "en": "purple",
     "he": "okuphephuli"
    },
    {
     "en": "pink",
     "he": "okupinki"
    },
    {
     "en": "brown",
     "he": "okunsundu"
    },
    {
     "en": "gray",
     "he": "okumpunga"
    }
   ]
  },
  "numbers": {
   "title": "Iinomboro",
   "words": [
    {
     "en": "one",
     "he": "kunye"
    },
    {
     "en": "two",
     "he": "kubili"
    },
    {
     "en": "three",
     "he": "kuthathu"
    },
    {
     "en": "four",
     "he": "kune"
    },
    {
     "en": "five",
     "he": "kuhlanu"
    },
    {
     "en": "six",
     "he": "isithandathu"
    },
    {
     "en": "seven",
     "he": "ilikhomba"
    },
    {
     "en": "eight",
     "he": "ibunane"
    },
    {
     "en": "nine",
     "he": "ilithoba"
    },
    {
     "en": "ten",
     "he": "itjhumi"
    },
    {
     "en": "eleven",
     "he": "itjhumi nanye"
    },
    {
     "en": "twelve",
     "he": "itjhumi nambili"
    }
   ]
  },
  "family": {
   "title": "Umndeni",
   "words": [
    {
     "en": "mother",
     "he": "umma"
    },
    {
     "en": "father",
     "he": "ubaba"
    },
    {
     "en": "brother",
     "he": "umfowethu"
    },
    {
     "en": "sister",
     "he": "udadwethu"
    },
    {
     "en": "grandmother",
     "he": "ugogo"
    },
    {
     "en": "grandfather",
     "he": "umkhulu"
    },
    {
     "en": "baby",
     "he": "usana"
    },
    {
     "en": "son",
     "he": "indodana"
    },
    {
     "en": "daughter",
     "he": "indodakazi"
    },
    {
     "en": "family",
     "he": "umndeni"
    }
   ]
  },
  "animals": {
   "title": "Iinlwana",
   "words": [
    {
     "en": "dog",
     "he": "inja"
    },
    {
     "en": "cat",
     "he": "ikati"
    },
    {
     "en": "bird",
     "he": "inyoni"
    },
    {
     "en": "fish",
     "he": "ifesi"
    },
    {
     "en": "cow",
     "he": "ikomo"
    },
    {
     "en": "horse",
     "he": "ipere"
    },
    {
     "en": "lion",
     "he": "ibhubesi"
    },
    {
     "en": "elephant",
     "he": "indlovu"
    },
    {
     "en": "monkey",
     "he": "ifene"
    },
    {
     "en": "rabbit",
     "he": "umvundla"
    },
    {
     "en": "bear",
     "he": "ibhere"
    },
    {
     "en": "duck",
     "he": "idada"
    }
   ]
  },
  "body": {
   "title": "Umzimba",
   "words": [
    {
     "en": "head",
     "he": "ihloko"
    },
    {
     "en": "hand",
     "he": "isandla"
    },
    {
     "en": "eye",
     "he": "ilihlo"
    },
    {
     "en": "ear",
     "he": "indlebe"
    },
    {
     "en": "nose",
     "he": "ipumulo"
    },
    {
     "en": "mouth",
     "he": "umlomo"
    },
    {
     "en": "leg",
     "he": "umlenze"
    },
    {
     "en": "hair",
     "he": "iinwele"
    },
    {
     "en": "finger",
     "he": "umunwe"
    },
    {
     "en": "tooth",
     "he": "ilizinyo"
    }
   ]
  },
  "food": {
   "title": "Ukudla",
   "words": [
    {
     "en": "bread",
     "he": "isinkwa"
    },
    {
     "en": "milk",
     "he": "ubisi"
    },
    {
     "en": "water",
     "he": "amanzi"
    },
    {
     "en": "apple",
     "he": "i-apula"
    },
    {
     "en": "banana",
     "he": "ibhanana"
    },
    {
     "en": "egg",
     "he": "iqanda"
    },
    {
     "en": "cheese",
     "he": "itjhizi"
    },
    {
     "en": "cake",
     "he": "ikhekhe"
    },
    {
     "en": "rice",
     "he": "irayisi"
    },
    {
     "en": "meat",
     "he": "inyama"
    }
   ]
  },
  "clothes": {
   "title": "Izambatho",
   "words": [
    {
     "en": "shirt",
     "he": "ihembe"
    },
    {
     "en": "pants",
     "he": "ibhurugu"
    },
    {
     "en": "dress",
     "he": "irokho"
    },
    {
     "en": "hat",
     "he": "isigqoko"
    },
    {
     "en": "shoes",
     "he": "izicathulo"
    },
    {
     "en": "socks",
     "he": "amasokisi"
    },
    {
     "en": "coat",
     "he": "ijazi"
    },
    {
     "en": "skirt",
     "he": "isiketi"
    }
   ]
  },
  "weather": {
   "title": "Isimo sezulu",
   "words": [
    {
     "en": "sun",
     "he": "ilanga"
    },
    {
     "en": "rain",
     "he": "izulu"
    },
    {
     "en": "cloud",
     "he": "ifu"
    },
    {
     "en": "wind",
     "he": "umoya"
    },
    {
     "en": "snow",
     "he": "ikhephu"
    },
    {
     "en": "hot",
     "he": "kuyatjhisa"
    },
    {
     "en": "cold",
     "he": "kuyabanda"
    },
    {
     "en": "storm",
     "he": "isiphepho"
    }
   ]
  },
  "days": {
   "title": "Amalanga neenyanga",
   "words": [
    {
     "en": "Sunday",
     "he": "iSonto"
    },
    {
     "en": "Monday",
     "he": "uMvulo"
    },
    {
     "en": "Tuesday",
     "he": "uLesibili"
    },
    {
     "en": "Wednesday",
     "he": "uLesithathu"
    },
    {
     "en": "Thursday",
     "he": "uLesine"
    },
    {
     "en": "Friday",
     "he": "uLesihlanu"
    },
    {
     "en": "Saturday",
     "he": "uMgqibelo"
    },
    {
     "en": "day",
     "he": "ilanga"
    },
    {
     "en": "week",
     "he": "iveke"
    },
    {
     "en": "month",
     "he": "inyanga"
    }
   ]
  },
  "verbs": {
   "title": "Izenzo",
   "words": [
    {
     "en": "go",
     "he": "ukuya"
    },
    {
     "en": "run",
     "he": "ukugijima"
    },
    {
     "en": "jump",
     "he": "ukweqa"
    },
    {
     "en": "eat",
     "he": "ukudla"
    },
    {
     "en": "drink",
     "he": "ukusela"
    },
    {
     "en": "read",
     "he": "ukufunda"
    },
    {
     "en": "write",
     "he": "ukutlola"
    },
    {
     "en": "play",
     "he": "ukudlala"
    },
    {
     "en": "sleep",
     "he": "ukulala"
    },
    {
     "en": "sit",
     "he": "ukuhlala"
    }
   ]
  }
 }
};

export function nativeSet(lang: string, id: string): { title: string; words: WordPair[] } | null {
  return NATIVE_DICTATION_SETS[lang]?.[id] ?? null;
}
