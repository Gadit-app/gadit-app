import fs from "fs";
import { execFileSync } from "child_process";
const HERE = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const PUB = HERE + "../../public/subjects/";
const env = fs.readFileSync(HERE + "../../.env.local", "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const concepts = {
  "english-home-language": "an open storybook with a speech bubble and a pencil",
  "natural-sciences-technology": "a sprouting seedling next to a small gear and a magnifying glass",
  "natural-sciences": "a glowing leaf beside a small planet with a ring",
  "technology": "a small wooden bridge model with a ruler and a set square",
  "economic-management-sciences": "a coin stack with a small shop awning and a bar chart",
  "life-orientation": "a compass with a small heart in the middle",
  "creative-arts": "a paint palette with a small drum and a theatre mask",
  "arabic-language": "an elegant reed calligraphy pen over an inkwell and an open book with geometric patterns",
  "hebrew-second-language": "two speech bubbles side by side with a small bridge between them",
  "islam": "a crescent moon beside an open book decorated with geometric arabesque patterns",
  "christianity": "an olive branch beside an open book with a small simple cross on the cover",
  "history-arab": "an hourglass beside an old arched gateway",
  "health-education": "an apple with a small heart and a water drop",
  "technological-education": "a light bulb with a small gear and a circuit line",
  "applied-engineering": "a hard hat with a wrench and a blueprint roll",
  "education-track": "a small teacher's desk with an apple and a stack of books",
  "academic-skills": "a graduation cap on top of a notebook with a checklist",
  "cat-religion": "a pomegranate, an olive branch and an open book with geometric patterns, harmonious",
};
const STYLE = "A premium soft 3D app icon: smooth matte rounded shapes, soft global illumination and a gentle shadow, palette of teal, mint, warm amber and soft coral, centered on a plain warm off-white background, generous padding around the object.";
const jobs = Object.entries(concepts).filter(([k]) => !fs.existsSync(PUB + k + ".webp"));
let i = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (i < jobs.length) {
    const [k, c] = jobs[i++];
    const r = await fetch("https://api.openai.com/v1/images/generations", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ model: "gpt-image-1", prompt: `${STYLE} The object: ${c}. Absolutely no letters, numbers, words or writing anywhere.`, size: "1024x1024", quality: "low", n: 1 }) });
    const j = await r.json();
    if (!r.ok) { console.log("FAIL", k, JSON.stringify(j).slice(0, 120)); continue; }
    const png = PUB + k + ".png";
    fs.writeFileSync(png, Buffer.from(j.data[0].b64_json, "base64"));
    execFileSync("python", ["-c", `from PIL import Image; im=Image.open(r'${png}').convert('RGB').resize((512,512)); im.save(r'${PUB + k}.webp', quality=82)`]);
    fs.unlinkSync(png);
    console.log("ok", k);
  }
}));
