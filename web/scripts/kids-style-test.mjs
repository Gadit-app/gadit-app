/**
 * Kids Mode image-style test — generates 4 styles × 5 test words = 20
 * sample images so Gadi can pick the right look for the auto-image-on-
 * search feature before we wire it into /api/generate-image.
 *
 * Total cost at quality:low (~$0.02/image): ~$0.40.
 *
 * Run from web/:    node scripts/kids-style-test.mjs
 * Output:           scripts/kids-style-test/<STYLE>-<word>.png
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const envPath = path.resolve(webRoot, ".env.local");
const outDir = path.resolve(__dirname, "kids-style-test");

// Parse .env.local for OPENAI_API_KEY (same approach as dump-searches)
const envText = fs.readFileSync(envPath, "utf8");
const envLine = envText.split(/\r?\n/).find((l) => l.startsWith("OPENAI_API_KEY="));
if (!envLine) {
  console.error("OPENAI_API_KEY not found in .env.local");
  process.exit(1);
}
let apiKey = envLine.slice("OPENAI_API_KEY=".length).trim();
if ((apiKey.startsWith('"') && apiKey.endsWith('"')) ||
    (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
  apiKey = apiKey.slice(1, -1);
}

// 5 test words spanning concrete + abstract + imaginary so we see how
// each style handles each category.
const WORDS = [
  { word: "חתול", meaning: "a small domesticated cat with soft fur, often kept as a pet", en: "cat" },
  { word: "אהבה", meaning: "a deep feeling of affection, care, and warmth toward someone", en: "love" },
  { word: "חלום", meaning: "a series of thoughts, images, or feelings occurring during sleep", en: "dream" },
  { word: "גשם", meaning: "water drops falling from clouds to the ground", en: "rain" },
  { word: "מלאך", meaning: "a spiritual messenger often depicted with wings", en: "angel" },
];

const STYLES = {
  A: {
    name: "Storybook watercolor (Eric Carle / Beatrice Alemagna)",
    build: (w, m) =>
      `A warm children's storybook illustration of ${w} (${m}). Hand-painted watercolor style, soft pastel colors, friendly rounded shapes, like an illustration from a kindergarten picture book. No text, no letters, no numbers. Safe, warm, gentle imagery suitable for ages 5-10.`,
  },
  B: {
    name: "Modern flat (Duolingo / Khan Academy Kids)",
    build: (w, m) =>
      `A modern flat illustration of ${w} (${m}) for a children's educational app. Bright cheerful colors, simple geometric shapes, friendly cartoon style with soft outlines, clean white background. Designed for kids ages 5-12. No text, no letters, no numbers, no scary or dark imagery.`,
  },
  C: {
    name: "Pixar-style 3D cartoon",
    build: (w, m) =>
      `A friendly Pixar-style 3D cartoon illustration of ${w} (${m}). Warm lighting, expressive characters, vibrant but soft colors, like a frame from a Disney/Pixar movie aimed at young children. No text, no letters, no numbers.`,
  },
  D: {
    name: "Child's crayon drawing",
    build: (w, m) =>
      `A simple crayon and marker drawing of ${w} (${m}) in the style of a child's own artwork. Bright primary colors, slightly imperfect lines, joyful and playful, like a drawing on white paper. No text, no letters, no numbers.`,
  },
};

fs.mkdirSync(outDir, { recursive: true });

async function callOpenAI(prompt) {
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "low",
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`OpenAI ${r.status}: ${t.slice(0, 200)}`);
  }
  const j = await r.json();
  const result = j.data?.[0];
  if (result?.b64_json) return Buffer.from(result.b64_json, "base64");
  if (result?.url) {
    const imgRes = await fetch(result.url);
    return Buffer.from(await imgRes.arrayBuffer());
  }
  throw new Error("no image in response");
}

const tasks = [];
for (const styleKey of Object.keys(STYLES)) {
  for (const w of WORDS) {
    tasks.push({ styleKey, w });
  }
}

console.log(`Generating ${tasks.length} images (4 styles × 5 words)…`);
const CONCURRENCY = 4;
let inflight = 0;
let cursor = 0;
let done = 0;
let failed = 0;

await new Promise((resolve) => {
  function pump() {
    while (inflight < CONCURRENCY && cursor < tasks.length) {
      const task = tasks[cursor++];
      inflight++;
      const prompt = STYLES[task.styleKey].build(task.w.word, task.w.meaning);
      const filename = `${task.styleKey}-${task.w.en}.png`;
      const file = path.join(outDir, filename);
      console.log(`  → ${filename}`);
      callOpenAI(prompt)
        .then((buf) => {
          fs.writeFileSync(file, buf);
          done++;
          console.log(`    ✓ ${filename} (${done}/${tasks.length})`);
        })
        .catch((e) => {
          failed++;
          console.error(`    ✗ ${filename}: ${e.message}`);
        })
        .finally(() => {
          inflight--;
          if (cursor >= tasks.length && inflight === 0) resolve();
          else pump();
        });
    }
  }
  pump();
});

console.log(`\nDone. ${done} ok, ${failed} failed.`);
console.log(`Files in: ${outDir}`);
