/**
 * The shop of the journey (Gadi 2026-11-15: "a child buys all kinds of
 * things in an avatar shop, let's take the idea from there").
 *
 * What is sold is LOOKS for the child's runner, in four places: the shirt,
 * the hat, what is carried on the back and a little companion that runs
 * beside the runner. A look changes nothing in the game itself.
 *
 * Rules that never bend:
 *   - coins are earned by knowing words (scheduler coinsOf) and by nothing
 *     else; nothing here is sold for money;
 *   - a thing that was bought is the child's for good, nothing expires,
 *     there is no sale, no timer and no surprise box;
 *   - every place has a free choice, so a child with no coins still chooses.
 *
 * Kept on the server: users/{uid}/journey/state { owned, look, spent }.
 * The balance is the coins of the known words minus what was spent.
 * Pure data and pure functions, shared by the server and the screens.
 */

export type Slot = "shirt" | "hat" | "back" | "pet";
export const SLOTS: Slot[] = ["shirt", "hat", "back", "pet"];
export type Look = Record<Slot, string>;

/** `need`: a thing that is not sold but EARNED, the child's once this many words are in the index. */
export type ShopItem = { id: string; slot: Slot; price: number; he: string; en: string; icon: string; color?: number; need?: number };

export const SHOP: ShopItem[] = [
  // Shirts: a colour.
  { id: "shirt-teal", slot: "shirt", price: 0, he: "טורקיז", en: "Teal", icon: "●", color: 0x0a7472 },
  { id: "shirt-red", slot: "shirt", price: 0, he: "אדום", en: "Red", icon: "●", color: 0xdc2626 },
  { id: "shirt-blue", slot: "shirt", price: 0, he: "כחול", en: "Blue", icon: "●", color: 0x2563eb },
  { id: "shirt-green", slot: "shirt", price: 0, he: "ירוק", en: "Green", icon: "●", color: 0x16a34a },
  { id: "shirt-purple", slot: "shirt", price: 10, he: "סגול", en: "Purple", icon: "●", color: 0x7c3aed },
  { id: "shirt-pink", slot: "shirt", price: 10, he: "ורוד", en: "Pink", icon: "●", color: 0xec4899 },
  { id: "shirt-orange", slot: "shirt", price: 10, he: "כתום", en: "Orange", icon: "●", color: 0xf97316 },
  { id: "shirt-black", slot: "shirt", price: 15, he: "שחור", en: "Black", icon: "●", color: 0x1f2937 },
  { id: "shirt-white", slot: "shirt", price: 15, he: "לבן", en: "White", icon: "●", color: 0xf1f5f9 },
  { id: "shirt-gold", slot: "shirt", price: 40, he: "זהב", en: "Gold", icon: "●", color: 0xe0a100 },
  { id: "shirt-silver", slot: "shirt", price: 60, he: "כסף", en: "Silver", icon: "●", color: 0xc0c7d1 },
  { id: "shirt-ice", slot: "shirt", price: 200, he: "יהלום", en: "Diamond", icon: "●", color: 0x7dd3fc },
  // Hats.
  { id: "hat-cap", slot: "hat", price: 0, he: "כובע מצחייה", en: "Cap", icon: "🧢" },
  { id: "hat-party", slot: "hat", price: 10, he: "כובע מסיבה", en: "Party hat", icon: "🎉" },
  { id: "hat-ears", slot: "hat", price: 20, he: "אוזני ארנב", en: "Bunny ears", icon: "🐰" },
  { id: "hat-wizard", slot: "hat", price: 30, he: "כובע קוסמים", en: "Wizard hat", icon: "🧙" },
  { id: "hat-helmet", slot: "hat", price: 30, he: "קסדת אבירים", en: "Knight helmet", icon: "🪖" },
  { id: "hat-flower", slot: "hat", price: 15, he: "זר פרחים", en: "Flower crown", icon: "🌸" },
  { id: "hat-chef", slot: "hat", price: 20, he: "כובע טבחים", en: "Chef hat", icon: "🧑‍🍳" },
  { id: "hat-pirate", slot: "hat", price: 25, he: "כובע פיראטים", en: "Pirate hat", icon: "🏴‍☠️" },
  { id: "hat-top", slot: "hat", price: 45, he: "מגבעת", en: "Top hat", icon: "🎩" },
  { id: "hat-crown", slot: "hat", price: 60, he: "כתר", en: "Crown", icon: "👑" },
  { id: "hat-astro", slot: "hat", price: 180, he: "קסדת חלל", en: "Space helmet", icon: "🧑‍🚀" },
  { id: "hat-star", slot: "hat", price: 0, need: 10, he: "כובע הכוכב", en: "Star cap", icon: "⭐" },
  { id: "hat-diamond", slot: "hat", price: 0, need: 100, he: "כתר היהלום", en: "Diamond crown", icon: "💎" },
  // On the back.
  { id: "back-pack", slot: "back", price: 0, he: "תיק גב", en: "Backpack", icon: "🎒" },
  { id: "back-cape", slot: "back", price: 20, he: "גלימה", en: "Cape", icon: "🦸" },
  { id: "back-shield", slot: "back", price: 30, he: "מגן", en: "Shield", icon: "🛡️" },
  { id: "back-wings", slot: "back", price: 50, he: "כנפיים", en: "Wings", icon: "🪽" },
  { id: "back-balloon", slot: "back", price: 25, he: "בלון", en: "Balloon", icon: "🎈" },
  { id: "back-guitar", slot: "back", price: 35, he: "גיטרה", en: "Guitar", icon: "🎸" },
  { id: "back-sword", slot: "back", price: 60, he: "חרב עץ", en: "Wooden sword", icon: "🗡️" },
  { id: "back-jet", slot: "back", price: 80, he: "תיק סילון", en: "Jetpack", icon: "🚀" },
  { id: "back-butterfly", slot: "back", price: 90, he: "כנפי פרפר", en: "Butterfly wings", icon: "🦋" },
  { id: "back-phoenix", slot: "back", price: 300, he: "כנפי אש", en: "Fire wings", icon: "🔥" },
  { id: "back-starcape", slot: "back", price: 0, need: 25, he: "גלימת הכוכבים", en: "Cape of stars", icon: "🌟" },
  // A companion that runs beside the runner.
  { id: "pet-none", slot: "pet", price: 0, he: "בלי חיה", en: "No companion", icon: "✕" },
  { id: "pet-chick", slot: "pet", price: 20, he: "אפרוח", en: "Chick", icon: "🐥" },
  { id: "pet-dog", slot: "pet", price: 40, he: "כלבלב", en: "Puppy", icon: "🐶" },
  { id: "pet-cat", slot: "pet", price: 40, he: "חתלתול", en: "Kitten", icon: "🐱" },
  { id: "pet-robot", slot: "pet", price: 70, he: "רובוט", en: "Robot", icon: "🤖" },
  { id: "pet-bunny", slot: "pet", price: 30, he: "ארנבון", en: "Bunny", icon: "🐰" },
  { id: "pet-fox", slot: "pet", price: 60, he: "שועלון", en: "Little fox", icon: "🦊" },
  { id: "pet-dragon", slot: "pet", price: 120, he: "דרקון קטן", en: "Little dragon", icon: "🐲" },
  { id: "pet-unicorn", slot: "pet", price: 250, he: "חד קרן", en: "Unicorn", icon: "🦄" },
  { id: "pet-golddragon", slot: "pet", price: 400, he: "דרקון הזהב", en: "Golden dragon", icon: "🐉" },
  { id: "pet-owl", slot: "pet", price: 0, need: 50, he: "ינשוף חכם", en: "Wise owl", icon: "🦉" },
];

export const DEFAULT_LOOK: Look = { shirt: "shirt-teal", hat: "hat-cap", back: "back-pack", pet: "pet-none" };

const BY_ID = new Map(SHOP.map((i) => [i.id, i]));
export const shopItem = (id: string): ShopItem | undefined => BY_ID.get(id);

/** A stored look made safe: every place holds an item of that place, else the free one. */
export function cleanLook(v: unknown): Look {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const out = { ...DEFAULT_LOOK };
  for (const s of SLOTS) { const it = typeof o[s] === "string" ? BY_ID.get(o[s] as string) : undefined; if (it && it.slot === s) out[s] = it.id; }
  return out;
}

/** The ids a child owns: what was bought, as stored. Free items are everyone's. */
export function cleanOwned(v: unknown): string[] {
  return Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && BY_ID.has(x)))] : [];
}

/** Whether the thing is the child's: bought, free, or earned by the number of words in the index. */
export const owns = (owned: string[], id: string, known = 0): boolean => {
  const it = BY_ID.get(id);
  if (!it) return false;
  if (it.need) return known >= it.need;
  return it.price === 0 || owned.includes(id);
};
