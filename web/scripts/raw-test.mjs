import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(path.resolve(__dirname, "..", ".env.local"), "utf-8");
function getEnv(k) {
  const m =
    envText.match(new RegExp(`^${k}='([^]+?)'\\s*$`, "m")) ||
    envText.match(new RegExp(`^${k}="([^]+?)"\\s*$`, "m")) ||
    envText.match(new RegExp(`^${k}=(.+)$`, "m"));
  return m ? m[1].trim() : null;
}

const word = process.argv[2] || "אדיפלי";

const res = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getEnv("OPENAI_API_KEY")}`,
  },
  body: JSON.stringify({
    model: "gpt-4o",
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: `Is "${word}" a real word in any language? If yes, tell me: what language, what it means, how it's used. Answer in Hebrew (2-3 sentences).`,
      },
    ],
  }),
});
const data = await res.json();
console.log("Raw gpt-4o response:");
console.log(data.choices?.[0]?.message?.content || JSON.stringify(data));
process.exit(0);
