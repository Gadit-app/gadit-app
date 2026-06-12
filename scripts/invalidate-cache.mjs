#!/usr/bin/env node
/**
 * One-shot cache invalidator for /api/define entries.
 *
 * Usage:
 *   node scripts/invalidate-cache.mjs <lang> <word> [<word2> ...]
 *
 * Deletes both `auto2_<lang>_base_<word>` and `auto2_<lang>_kids_<word>`
 * from Firestore /cache so the next lookup regenerates from a fresh
 * prompt.
 *
 * Requires FIREBASE_SERVICE_ACCOUNT in web/.env.local (already there
 * for the runtime API).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../web/.env.local");

// Tiny .env parser — only what we need.
const env = {};
for (const raw of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq < 0) continue;
  let val = line.slice(eq + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  env[line.slice(0, eq).trim()] = val;
}

const svc = env.FIREBASE_SERVICE_ACCOUNT;
if (!svc) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT in web/.env.local");
  process.exit(1);
}
const parsed = JSON.parse(svc);
initializeApp({ credential: cert(parsed), projectId: parsed.project_id });

const db = getFirestore();

const [, , lang, ...words] = process.argv;
if (!lang || words.length === 0) {
  console.error("Usage: node scripts/invalidate-cache.mjs <lang> <word> [<word2> ...]");
  process.exit(1);
}

for (const word of words) {
  const norm = word.toLowerCase().trim();
  const keys = [`auto2_${lang}_base_${norm}`, `auto2_${lang}_kids_${norm}`];
  for (const key of keys) {
    const ref = db.collection("cache").doc(key);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
      console.log(`✓ deleted  ${key}`);
    } else {
      console.log(`· not found ${key}`);
    }
  }
}

process.exit(0);
