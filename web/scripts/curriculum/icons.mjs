// Subject + category icons in the chosen Gadit soft-3D style.
// 1) one gpt-4o call: an English icon concept per subject/category
// 2) gpt-image-1 (quality low) per icon -> web/public/subjects/<key>.webp (512px)
import fs from "fs";
import { execFileSync } from "child_process";
const HERE = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const PUB = HERE + "../../public/subjects/";
fs.mkdirSync(PUB, { recursive: true });
const env = fs.readFileSync(HERE + "../../.env.local", "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const canon = JSON.parse(fs.readFileSync(HERE + "canon2.json", "utf8"));
const CATS = [...new Set(canon.subjects.map((s) => s.category))];
const CAT_KEYS = { "שפה וספרות": "language", "שפות זרות": "foreign-languages", "מתמטיקה": "math", "מדעים": "sciences", "יהדות ומורשת": "jewish-studies", "היסטוריה, חברה ואזרחות": "history-civics", "גאוגרפיה וסביבה": "geography-environment", "מדעי החברה": "social-sciences", "מחשבים וטכנולוגיה": "computers", "הנדסה ומגמות טכנולוגיות": "engineering", "מגמות מקצועיות": "vocational", "אמנויות ותקשורת": "arts-media", "גוף, בריאות וכישורי חיים": "body-health", "גיל הרך": "early-childhood" };
const catKey = (c) => "cat-" + CAT_KEYS[c];
const CONCEPTS = HERE + "icon-concepts.json";
let concepts = fs.existsSync(CONCEPTS) ? JSON.parse(fs.readFileSync(CONCEPTS, "utf8")) : null;
if (!concepts) {
  const items = canon.subjects.map((s) => `${s.key}: ${s.name}`).concat(CATS.map((c) => `${catKey(c)}: תחום "${c}"`));
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: "gpt-4o", temperature: 0.3, response_format: { type: "json_object" }, messages: [
      { role: "system", content: "You design icon concepts for school subjects in an Israeli education app. Return JSON only." },
      { role: "user", content: `For each item, write ONE short English icon concept: one or two simple, instantly recognizable objects that represent the school subject (for example mathematics: "a stacked abacus and a ruler"; Bible studies: "an open scroll"; physics: "a glowing atom"). No letters, words or numbers in the objects. Jewish studies items use respectful objects (scroll, open book, candles, pomegranate). Distinct subjects must get visibly distinct objects.\n\n${items.join("\n")}\n\nReturn {"concepts": {"<key>": "<concept>"}}` },
    ] }),
  });
  concepts = (await r.json()).choices[0].message.content;
  concepts = JSON.parse(concepts).concepts;
  fs.writeFileSync(CONCEPTS, JSON.stringify(concepts, null, 1));
}
const STYLE = "A premium soft 3D app icon: smooth matte rounded shapes, soft global illumination and a gentle shadow, palette of teal, mint, warm amber and soft coral, centered on a plain warm off-white background, generous padding around the object.";
const jobs = Object.entries(concepts).filter(([k]) => !fs.existsSync(PUB + k + ".webp"));
console.log("icons to make", jobs.length, "of", Object.keys(concepts).length);
let i = 0, made = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (i < jobs.length) {
    const [k, concept] = jobs[i++];
    for (let a = 0; a < 2; a++) {
      try {
        const r = await fetch("https://api.openai.com/v1/images/generations", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
          body: JSON.stringify({ model: "gpt-image-2.5-flare", prompt: `${STYLE} The object: ${concept}. Absolutely no letters, numbers, words or writing anywhere.`, size: "1024x1024", quality: "low", n: 1 }) });
        const j = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 150));
        const png = PUB + k + ".png";
        fs.writeFileSync(png, Buffer.from(j.data[0].b64_json, "base64"));
        execFileSync("python", ["-c", `from PIL import Image; im=Image.open(r'${png}').convert('RGB').resize((512,512)); im.save(r'${PUB + k}.webp', quality=82)`]);
        fs.unlinkSync(png);
        made++;
        break;
      } catch (e) { if (a === 1) console.log("FAIL", k, String(e).slice(0, 120)); }
    }
  }
}));
fs.writeFileSync(HERE + "cat-keys.json", JSON.stringify(Object.fromEntries(CATS.map((c) => [c, catKey(c)])), null, 1));
console.log("made", made);
