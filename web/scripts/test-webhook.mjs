// Manually triggers a minor update on an existing Stripe subscription
// so Stripe fires a `customer.subscription.updated` webhook event.
// Use this once to verify the live webhook is wired correctly.
import Stripe from "stripe";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.local");
const envText = readFileSync(envPath, "utf-8");

function getEnv(key) {
  const m =
    envText.match(new RegExp(`^${key}='([^]+?)'\\s*$`, "m")) ||
    envText.match(new RegExp(`^${key}="([^]+?)"\\s*$`, "m")) ||
    envText.match(new RegExp(`^${key}=(.+)$`, "m"));
  return m ? m[1].trim() : null;
}

const stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"));
const subId = process.argv[2];
if (!subId) {
  console.error("Usage: node test-webhook.mjs <subscription_id>");
  process.exit(1);
}

// Set/update metadata — this fires customer.subscription.updated without changing billing
const ts = new Date().toISOString();
const sub = await stripe.subscriptions.update(subId, {
  metadata: { webhook_test_at: ts },
});

console.log(`✓ Triggered subscription.updated on ${sub.id}`);
console.log(`  status: ${sub.status}`);
console.log(`  metadata.webhook_test_at: ${sub.metadata.webhook_test_at}`);
console.log(`\nWait ~5-10 seconds, then check Firestore to verify update propagated.`);
process.exit(0);
