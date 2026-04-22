import admin from "firebase-admin";
import Stripe from "stripe";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.local");
const envText = readFileSync(envPath, "utf-8");

function getEnv(key) {
  const singleMatch = envText.match(new RegExp(`^${key}='([^]+?)'\\s*$`, "m"));
  if (singleMatch) return singleMatch[1];
  const doubleMatch = envText.match(new RegExp(`^${key}="([^]+?)"\\s*$`, "m"));
  if (doubleMatch) return doubleMatch[1];
  const bareMatch = envText.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (bareMatch) return bareMatch[1].trim();
  return null;
}

const sa = JSON.parse(getEnv("FIREBASE_SERVICE_ACCOUNT"));
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });

const stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"));
const auth = admin.auth();
const db = admin.firestore();

const email = process.argv[2];
if (!email) {
  console.error("Usage: node sync-stripe-to-firestore.mjs <email>");
  process.exit(1);
}

// Plan price map from env
const PRICE_TO_PLAN = {
  [getEnv("STRIPE_PRICE_CLEAR_MONTHLY")]: "clear",
  [getEnv("STRIPE_PRICE_CLEAR_YEARLY")]: "clear",
  [getEnv("STRIPE_PRICE_DEEP_MONTHLY")]: "deep",
  [getEnv("STRIPE_PRICE_DEEP_YEARLY")]: "deep",
};

// Step 1: find Firebase user
const userRecord = await auth.getUserByEmail(email);
console.log(`\nFirebase user: ${userRecord.email} (${userRecord.uid})`);

// Step 2: find Stripe customer by email
const customers = await stripe.customers.list({ email, limit: 5 });
console.log(`\nStripe customers with this email: ${customers.data.length}`);

if (customers.data.length === 0) {
  console.log("No Stripe customer found for this email.");
  process.exit(0);
}

// Pick the most recent customer
const customer = customers.data.sort((a, b) => b.created - a.created)[0];
console.log(`Using customer: ${customer.id} (created ${new Date(customer.created * 1000).toISOString()})`);

// Step 3: get active subscriptions
const subs = await stripe.subscriptions.list({
  customer: customer.id,
  status: "all",
  limit: 10,
});
console.log(`\nSubscriptions: ${subs.data.length}`);
for (const s of subs.data) {
  const priceId = s.items.data[0]?.price?.id;
  const plan = PRICE_TO_PLAN[priceId] ?? "unknown";
  console.log(`  ${s.id} — status=${s.status} plan=${plan} priceId=${priceId}`);
}

const active = subs.data.find((s) => s.status === "active" || s.status === "trialing");

if (!active) {
  console.log("\nNo active subscription. Setting plan=basic.");
  await db.collection("users").doc(userRecord.uid).set(
    {
      plan: "basic",
      email: userRecord.email,
      stripeCustomerId: customer.id,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  process.exit(0);
}

const priceId = active.items.data[0]?.price?.id ?? "";
const plan = PRICE_TO_PLAN[priceId] ?? "basic";

await db.collection("users").doc(userRecord.uid).set(
  {
    plan,
    email: userRecord.email,
    stripeCustomerId: customer.id,
    subscriptionId: active.id,
    subscriptionStatus: active.status,
    priceId,
    updatedAt: new Date().toISOString(),
  },
  { merge: true }
);

console.log(`\n✓ Synced: user ${userRecord.uid} -> plan=${plan}, subscription ${active.id}`);
process.exit(0);
