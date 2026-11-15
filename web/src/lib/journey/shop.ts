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

export type ShopItem = { id: string; slot: Slot; price: number; he: string; en: string; icon: string; color?: number };

export const SHOP: ShopItem[] = [
  // Shirts: a colour.
  { id: "shirt-teal", slot: "shirt", price: 0, he: "טורקיז", en: "Teal", icon: "●", color: 0x0a7472 },
  { id: "shirt-red", slot: "shirt", price: 0, he: "אדום", en: "Red", icon: "●", color: 0xdc2626 },
  { id: "shirt-blue", slot: "shirt", price: 0, he: "כחול", en: "Blue", icon: "●", color: 0x2563eb },
  { id: "shirt-green", slot: "shirt", price: 0, he: "ירוק", en: "Green", icon: "●", color: 0x16a34a },
  { id: "shirt-purple", slot: "shirt", price: 10, he: "סגול", en: "Purple", icon: "●", color: 0x7c3aed },
  { id: "shirt-pink", slot: "shirt", price: 10, he: "ורוד", en: "Pink", icon: "●", color: 0xec4899 },
  { id: "shirt-orange", slot: "shirt", price: 10, he: "כתום", en: "Orange", icon: "●", color: 0xf97316 },
  { id: "shirt-gold", slot: "shirt", price: 40, he: "זהב", en: "Gold", icon: "●", color: 0xe0a100 },
  // Hats.
  { id: "hat-cap", slot: "hat", price: 0, he: "כובע מצחייה", en: "Cap", icon: "🧢" },
  { id: "hat-party", slot: "hat", price: 10, he: "כובע מסיבה", en: "Party hat", icon: "🎉" },
  { id: "hat-ears", slot: "hat", price: 20, he: "אוזני ארנב", en: "Bunny ears", icon: "🐰" },
  { id: "hat-wizard", slot: "hat", price: 30, he: "כובע קוסמים", en: "Wizard hat", icon: "🧙" },
  { id: "hat-helmet", slot: "hat", price: 30, he: "קסדת אבירים", en: "Knight helmet", icon: "🪖" },
  { id: "hat-crown", slot: "hat", price: 60, he: "כתר", en: "Crown", icon: "👑" },
  // On the back.
  { id: "back-pack", slot: "back", price: 0, he: "תיק גב", en: "Backpack", icon: "🎒" },
  { id: "back-cape", slot: "back", price: 20, he: "גלימה", en: "Cape", icon: "🦸" },
  { id: "back-shield", slot: "back", price: 30, he: "מגן", en: "Shield", icon: "🛡️" },
  { id: "back-wings", slot: "back", price: 50, he: "כנפיים", en: "Wings", icon: "🪽" },
  { id: "back-jet", slot: "back", price: 80, he: "תיק סילון", en: "Jetpack", icon: "🚀" },
  // A companion that runs beside the runner.
  { id: "pet-none", slot: "pet", price: 0, he: "בלי חיה", en: "No companion", icon: "✕" },
  { id: "pet-chick", slot: "pet", price: 20, he: "אפרוח", en: "Chick", icon: "🐥" },
  { id: "pet-dog", slot: "pet", price: 40, he: "כלבלב", en: "Puppy", icon: "🐶" },
  { id: "pet-cat", slot: "pet", price: 40, he: "חתלתול", en: "Kitten", icon: "🐱" },
  { id: "pet-robot", slot: "pet", price: 70, he: "רובוט", en: "Robot", icon: "🤖" },
  { id: "pet-dragon", slot: "pet", price: 120, he: "דרקון קטן", en: "Little dragon", icon: "🐲" },
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

export const owns = (owned: string[], id: string): boolean => { const it = BY_ID.get(id); return !!it && (it.price === 0 || owned.includes(id)); };
