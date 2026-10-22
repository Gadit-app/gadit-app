import { DICTATION_SETS } from "@/lib/dictation-sets";
import { BAND_SETS } from "@/lib/band-sets";

/**
 * "Listen and pick the picture" (Homework, for children who don't read yet,
 * approved 2026-10-14): the child hears a word and picks its picture out of
 * three. Only on the ready topics, and only those a picture can tell apart:
 * not days and months, not Band I's actions, describing words, feelings,
 * time or numbers past twelve, and not Band II (middle school). One picture
 * per English word, made on first use and shared by every child and every
 * language (lib/classroom-image.ts, pickImage).
 */

/** The curated Homework topics that work as pictures. */
export const PIC_DICT_SET_IDS = new Set(DICTATION_SETS.map((s) => s.id).filter((id) => id !== "days"));
/** Band I topics that work as pictures. */
export const PIC_BAND_TOPICS = new Set([
  "animals", "food and drink", "family and people", "body", "clothes", "home and furniture", "school",
  "colours", "weather and nature", "places in town", "transport", "sports and games", "jobs", "shapes and sizes",
]);
export const isPicBandSet = (b: { band: string; topic: string }) => b.band === "band1" && PIC_BAND_TOPICS.has(b.topic);

const key = (w: string) => w.trim().toLowerCase();

// Every English word a picture may be made for, with its topic (it tells the
// picture brief which meaning: "orange" the colour or the fruit is decided
// by the first topic that asks).
const PIC_WORDS = new Map<string, string>();
for (const s of DICTATION_SETS) {
  if (!PIC_DICT_SET_IDS.has(s.id)) continue;
  for (const w of s.words) if (!PIC_WORDS.has(key(w.en))) PIC_WORDS.set(key(w.en), s.titleEn);
}
// Words from the Ministry's Band I list that never get a picture in a
// children's game (Gadi 2026-10-22).
const NOT_FOR_KIDS = new Set(["wine", "beer"]);
for (const b of BAND_SETS) {
  if (!isPicBandSet(b)) continue;
  for (const w of b.words) if (!NOT_FOR_KIDS.has(key(w)) && !PIC_WORDS.has(key(w))) PIC_WORDS.set(key(w), b.topic);
}

/** The topic of a word a picture may be made for, else undefined. */
export const picWordTopic = (w: string) => PIC_WORDS.get(key(w));

// ── The two other pictures of a round (Gadi 2026-10-19) ────────────────────
// "dad" showed a family and parents with a child next to it: two pictures
// could both be right. So only ONE picture of a round may fit the word:
//   - the other two come from a DIFFERENT ready topic when they can
//     (a cat and a chair next to "dad"), from the topics that cannot hold
//     the word's own picture (no farm animals next to "farm");
//   - never two words of one confusable group (cup and glass, car and taxi),
//     never two people (dad, man, family, teacher), never a word and the
//     topic word above it (fruit and apple), never a scene and a thing it
//     holds (kitchen and stove);
//   - a colour, a number, a body part, an action or a shape only next to its
//     own topic (every picture has colours, people and shapes in it).

type PicKind = "people" | "jobs" | "animals" | "food" | "body" | "clothes" | "home" | "school" | "colours"
  | "numbers" | "weather" | "places" | "transport" | "sports" | "verbs" | "shapes";
const TOPIC_KIND: Record<string, PicKind> = {
  colors: "colours", colours: "colours", numbers: "numbers", family: "people", "family and people": "people",
  animals: "animals", body: "body", food: "food", "food and drink": "food", clothes: "clothes",
  weather: "weather", "weather and nature": "weather", "action verbs": "verbs", "home and furniture": "home",
  school: "school", "places in town": "places", transport: "transport", "sports and games": "sports",
  jobs: "jobs", "shapes and sizes": "shapes",
};
const kindOf = (w: string): PicKind | undefined => {
  const t = picWordTopic(w);
  return t ? TOPIC_KIND[t.toLowerCase()] : undefined;
};
/** Topics whose pictures are told apart only inside the topic. */
const OWN_TOPIC_ONLY = new Set<PicKind>(["colours", "numbers", "body", "verbs", "shapes"]);
/** The topics the other two pictures may come from, for a word of each topic. */
const CROSS: Record<PicKind, PicKind[]> = {
  people: ["animals", "food", "home", "transport", "clothes", "school"],
  jobs: ["home", "animals"],
  animals: ["home", "transport", "clothes", "school"],
  food: ["home", "transport", "clothes", "school"],
  clothes: ["animals", "food", "home", "transport", "school"],
  home: ["animals", "food", "transport", "clothes", "school"],
  school: ["animals", "food", "home", "transport", "clothes"],
  transport: ["animals", "food", "home", "clothes", "school"],
  sports: ["animals", "home", "transport", "school"],
  weather: ["animals", "home", "school"],
  places: ["home", "clothes", "school"],
  colours: [], numbers: [], body: [], verbs: [], shapes: [],
};
/** People (a picture of one could be any of them). */
const PERSON_EXTRA = ["pupil", "student", "classmate", "player", "runner", "teacher", "customer", "visitor", "neighbor"];
/** Words above the others of their topic (a fruit is also an apple). */
const GENERIC = new Set([
  "food", "fruit", "vegetable", "meal", "snack", "animal", "pet", "clothes", "family", "people", "person",
  "parent", "grandparent", "adult", "child", "kid", "home", "room", "game", "sport", "job", "worker", "weather",
  "nature", "color", "colour", "body", "number", "size", "school", "class", "subject", "journey",
]);
/** Ideas more than things (a test, a corner): never the other topic's picture. */
const ABSTRACT = new Set([
  "grade", "exam", "quiz", "test", "homework", "lesson", "subject", "science", "journey", "engine", "railway",
  "corner", "floor", "wall", "board", "seat", "box", "ice", "oil", "salt", "sugar", "cream", "grill", "medical",
]);
/** Scenes: a picture of a place or a meal holds many things. */
const SCENE_EXTRA = [
  "kitchen", "bathroom", "bedroom", "dining room", "room", "home", "house", "upstairs", "stairs", "classroom",
  "school", "class", "lesson", "breakfast", "lunch", "dinner", "supper", "meal", "picnic",
];
/** Words whose pictures look alike or hold each other. */
const CONFUSABLE: string[][] = [
  ["cup", "glass", "bottle", "mug", "milk", "water", "juice", "tea", "coffee", "drink", "wine", "beer"],
  ["glass", "glasses"], ["baby", "bottle"],
  ["car", "taxi", "ambulance", "police"], ["train", "railway", "engine", "station"], ["bus", "station", "road", "street"],
  ["car", "road", "street", "driver"], ["helicopter", "pilot"], ["boat", "sea", "river", "fish", "island", "beach", "water"],
  ["bird", "chicken", "duck", "egg"], ["cow", "milk", "meat", "steak", "cheese"], ["horse", "donkey"],
  ["sheep", "goat", "lamb"], ["mouse", "rat"], ["fly", "bee"], ["dog", "puppy"], ["cat", "kitten"],
  ["farm", "farmer", "cow", "horse", "sheep", "pig", "countryside", "field"], ["zoo", "elephant", "monkey", "lion", "bear", "snake"],
  ["biscuit", "cookie", "cake", "snack", "candy", "chocolate"],
  ["breakfast", "lunch", "dinner", "supper", "meal", "picnic", "food", "snack"],
  ["bread", "sandwich", "butter", "jam", "cheese"], ["salt", "sugar"], ["tea", "coffee"],
  ["cream", "yogurt", "milk", "ice cream", "ice"], ["ice", "snow", "cold", "winter"],
  ["salad", "vegetable", "tomato", "onion", "garlic", "potato"], ["meat", "steak", "grill", "chicken"],
  ["pizza", "cheese", "tomato"], ["fruit", "apple", "banana", "orange"],
  ["garden", "park", "flower", "grass", "tree", "field", "countryside", "forest", "nature", "spring", "ground"],
  ["hill", "mountain"], ["sun", "sunny", "hot", "summer", "sky"], ["rain", "storm", "cloud", "raincoat", "weather", "autumn"],
  ["wind", "storm", "air", "sky"], ["snow", "winter", "cold"],
  ["table", "desk"], ["chair", "seat"], ["bed", "bedroom"], ["bath", "bathroom", "toilet"],
  ["kitchen", "stove", "refrigerator"], ["door", "gate"], ["window", "wall", "corner", "floor", "room"],
  ["house", "home", "roof", "stairs", "upstairs"],
  ["board", "classroom", "class", "lesson", "school", "teacher"], ["pen", "pencil", "ruler"],
  ["notebook", "homework", "test", "exam", "quiz", "lesson", "grade", "subject", "science"],
  ["shirt", "blouse"], ["coat", "jacket", "raincoat", "suit"], ["jeans", "tights", "trousers", "pants"],
  ["dress", "skirt"], ["shoe", "shoes", "sock", "socks"], ["hat", "cap"], ["bag", "pocket"],
  ["ball", "football", "game", "goal", "sport", "tennis", "player", "runner"],
  ["shop", "store", "supermarket", "market"], ["town", "city", "village", "street", "road", "country", "countryside"],
  ["hotel", "hospital", "office", "bank", "museum", "cinema", "hall", "club", "police station", "restaurant", "school"],
  ["doctor", "nurse", "hospital", "ambulance", "medical"], ["police", "police station"],
  ["waiter", "waitress", "restaurant"], ["singer", "film star", "artist"],
  ["hand", "finger", "arm", "shoulder"], ["leg", "foot", "knee"], ["head", "neck", "shoulder"],
  ["face", "head", "eye"], ["face", "head", "nose"], ["face", "head", "mouth", "lip", "tooth"], ["face", "head", "ear"],
  ["face", "head", "hair", "beard"],
  ["go", "run", "walk"], ["eat", "drink"], ["circle", "round"],
];
const CONF = new Map<string, Set<string>>();
for (const g of CONFUSABLE) for (const a of g) {
  const s = CONF.get(a) ?? new Set<string>();
  for (const b of g) if (b !== a) s.add(b);
  CONF.set(a, s);
}
const PERSON = new Set(PERSON_EXTRA);
const SCENE = new Set(SCENE_EXTRA);
for (const [w] of PIC_WORDS) {
  const k = kindOf(w);
  if (k === "people" || k === "jobs") PERSON.add(w);
  if (k === "places") SCENE.add(w);
}

/** May `b`'s picture stand next to the picture of `a` (the word heard)?
 *  false when both could fit. */
function canPair(a: string, b: string): boolean {
  if (a === b) return false;
  if (CONF.get(a)?.has(b)) return false;
  if (PERSON.has(a) && PERSON.has(b)) return false;
  const ka = kindOf(a), kb = kindOf(b);
  if (!ka || !kb) return false;
  if (ka === kb) {
    if (GENERIC.has(a) || GENERIC.has(b)) return false;
    if (SCENE.has(a) !== SCENE.has(b)) return false;
    return true;
  }
  // Another topic: only a topic that cannot hold the word's own picture,
  // and only a single thing (not a person, a scene or a topic word).
  if (OWN_TOPIC_ONLY.has(ka) || !CROSS[ka].includes(kb)) return false;
  return !PERSON.has(b) && !SCENE.has(b) && !GENERIC.has(b) && !ABSTRACT.has(b);
}
/** Another topic's picture (the preferred kind of other picture). */
const isCross = (a: string, b: string) => kindOf(a) !== kindOf(b);

function seeded(items: string[], salt: string): string[] {
  const h = (s: string) => { let x = 2166136261; for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619); return x >>> 0; };
  return [...items].sort((p, q) => h(salt + p) - h(salt + q));
}

/** The two other pictures of a round for `target`, out of the words that have
 *  a picture: another topic's first, then the target's own topic. Fewer than
 *  two when no safe ones are there yet. */
export function picDistractors(target: string, withPicture: string[], salt: string, n = 2): string[] {
  const t = key(target);
  const ok = [...new Set(withPicture.map(key))].filter((w) => canPair(t, w));
  const cross = seeded(ok.filter((w) => isCross(t, w)), salt);
  const own = seeded(ok.filter((w) => !isCross(t, w)), salt);
  return [...cross, ...own].slice(0, n);
}

// Well-told-apart pictures drawn first when a topic has no pictures from
// another topic yet (drawn once, then shared by everyone).
const ANCHORS = [
  "cat", "chair", "car", "apple", "hat", "pencil", "dog", "bed", "bus", "banana", "shoe", "clock",
  "elephant", "cake", "boat", "dress", "ruler", "rabbit", "door", "bicycle", "egg", "fish", "window", "train",
];
export const PIC_ANCHORS: readonly string[] = ANCHORS;

/** Learning-mode lessons for a child who doesn't read yet (2026-10-22): the
 *  two other pictures for a lesson word. The ready topics' rules first
 *  (picDistractors); a word outside them (hello, happy, under) gets anchors,
 *  single well-told-apart things, never from the word's own lesson topic
 *  (`sameTopic`, English words) and never confusable with it. A colour, a
 *  number, a body part, an action or a shape gets no anchors (an apple is
 *  red, a cat has ears). */
export function lessonPicDistractors(target: string, withPicture: string[], salt: string, sameTopic: Set<string>): string[] {
  const t = key(target);
  const first = picDistractors(t, withPicture, salt);
  if (first.length >= 2) return first;
  const k = kindOf(t);
  if (k && OWN_TOPIC_ONLY.has(k)) return first;
  const have = new Set(withPicture.map(key));
  const extra = seeded(ANCHORS.filter((a) => have.has(a) && a !== t && !first.includes(a) && !sameTopic.has(a)
    && !CONF.get(t)?.has(a) && !CONF.get(a)?.has(t)), salt);
  return [...first, ...extra].slice(0, 2);
}

/** Other topics' words worth looking up for the words of a set: the
 *  anchors first, then the rest in a stable order. */
export function picPool(setWords: string[], max = 40): string[] {
  const set = new Set(setWords.map(key));
  const kinds = new Set(setWords.map(kindOf).filter((k): k is PicKind => !!k));
  const allowed = new Set([...kinds].flatMap((k) => CROSS[k]));
  const fits = (w: string) => !set.has(w) && allowed.has(kindOf(w) as PicKind) && !PERSON.has(w) && !SCENE.has(w) && !GENERIC.has(w)
    && !ABSTRACT.has(w) && setWords.some((s) => canPair(key(s), w));
  const anchors = ANCHORS.filter(fits);
  const rest = seeded([...PIC_WORDS.keys()].filter((w) => fits(w) && !anchors.includes(w)), "pool");
  return [...anchors, ...rest].slice(0, max);
}

/** Which of `pool` (not yet drawn) to draw first, so that every word of the
 *  set has `want` pictures from another topic next to it. Up to `max`. */
export function picPoolToDraw(setWords: string[], pool: string[], have: Set<string>, want = 3, max = 4): string[] {
  const words = setWords.map(key).filter((w) => {
    const k = kindOf(w);
    return k && !OWN_TOPIC_ONLY.has(k);
  });
  const haveK = new Set([...have].map(key));
  const draw: string[] = [];
  const count = (t: string) => [...haveK, ...draw].filter((w) => isCross(t, w) && canPair(t, w)).length;
  for (const p of pool) {
    if (draw.length >= max) break;
    if (haveK.has(p)) continue;
    if (words.some((t) => count(t) < want && canPair(t, p))) draw.push(p);
  }
  return draw;
}
