// Verify the short stored translations used in word-page titles for the
// smaller languages (Gadi 2026-10-06: Zulu "bile" was stored as ubuhlungu,
// "pain", instead of inyongo). Only a translation a stronger model confirms
// gets titleTranslationOk: true; lib/word-title.ts uses a translation in these
// languages only when that flag is set, and otherwise the title has none.
//   node scripts/seo/verify-title-translations.mjs
// Needs GOOGLE_APPLICATION_CREDENTIALS (runtime only) and OPENAI_API_KEY in .env.local.
import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(path.join(HERE, "../../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
export const SMALL = { zu: "Zulu", am: "Amharic", sw: "Swahili", af: "Afrikaans", fil: "Filipino" };

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();
const FP = admin.firestore.FieldPath;

const short = (t) => {
  if (typeof t !== "string") return "";
  const f = t.split(/[,;/|(\n]/)[0].trim();
  return f && f.length <= 25 ? f : "";
};

async function check(batch, target) {
  const list = batch.map((c, i) => `${i + 1}. "${c.word}" (${c.language}) -> "${c.t}"`).join("\n");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Each line is a word and a short translation into ${target}. Say "ok" only if the translation is a correct, common ${target} word for the word's most common meaning. Say "wrong" if it is wrong or means something else, and "unsure" if you are not certain. Reply as JSON mapping each number to "ok", "wrong" or "unsure".`,
        },
        { role: "user", content: list },
      ],
    }),
  });
  const j = await res.json();
  try {
    const map = JSON.parse(j.choices[0].message.content);
    return batch.map((_, i) => String(map[String(i + 1)] ?? "unsure").toLowerCase());
  } catch {
    return batch.map(() => "unsure");
  }
}

const tally = {};
for (const [lang, target] of Object.entries(SMALL)) {
  const prefix = `auto2_${lang}_base_`;
  const snap = await db.collection("cache").where(FP.documentId(), ">=", prefix).where(FP.documentId(), "<", `${prefix}`).select("translation", "language").get();
  const cands = snap.docs
    .map((d) => ({ ref: d.ref, word: d.id.slice(prefix.length), language: d.get("language") || "?", t: short(d.get("translation")) }))
    .filter((c) => c.t);
  tally[lang] = { ok: 0, wrong: 0, unsure: 0 };
  for (let i = 0; i < cands.length; i += 25) {
    const batch = cands.slice(i, i + 25);
    const labels = await check(batch, target);
    for (let k = 0; k < batch.length; k++) {
      const ok = labels[k] === "ok";
      tally[lang][labels[k]] = (tally[lang][labels[k]] || 0) + 1;
      await batch[k].ref.set({ titleTranslationOk: ok }, { merge: true });
      if (!ok) console.log(lang, labels[k], batch[k].word, "->", batch[k].t);
    }
  }
}
console.log(JSON.stringify(tally));
process.exit(0);
