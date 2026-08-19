#!/usr/bin/env node
/**
 * Dev helper: mint a Yooniz→Gadit launch token and print the launch URL.
 * Mirrors the Yooniz side of YOONIZ_INTEGRATION_CONTRACT.md §1 exactly, so
 * you can end-to-end test GET /api/yooniz/sso without the Yooniz app.
 *
 * The secret is READ FROM THE ENVIRONMENT, never hardcoded (public repo):
 *
 *   # against production:
 *   YOONIZ_GADIT_SSO_SECRET=<the prod secret> \
 *     node scripts/yooniz-mint-token.mjs \
 *     --base=https://www.gadit.app \
 *     --email=parent@example.com --kid=demo-kid-1 --name="נועם" --role=boy
 *
 * Then open the printed URL in a browser. Each run uses a fresh nonce (the
 * endpoint refuses replays), and the token is valid for 120 seconds.
 */
import crypto from "node:crypto";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
  }),
);

const secret = process.env.YOONIZ_GADIT_SSO_SECRET;
if (!secret) {
  console.error("Set YOONIZ_GADIT_SSO_SECRET in the environment first.");
  process.exit(1);
}

const b64url = (buf) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// Member-generic token. --owner mints the Family-owner launch; otherwise a
// per-member launch (--role father|mother|boy|girl, --member <id>, --name).
const isOwner = args["owner"] === true || args["owner"] === "true" || args["isOwner"] === "true";
const payload = {
  v: 1,
  yoonizFamilyId: args["yfam"] || "demo-yooniz-family-1",
  parentEmail: args["email"] || "parent@example.com",
  isOwner,
  iat: Math.floor(Date.now() / 1000),
  nonce: crypto.randomBytes(16).toString("hex"),
};
if (isOwner) {
  payload.memberName = args["name"] || "Demo Parent";
} else {
  const role = ["father", "mother", "boy", "girl"].includes(args["role"]) ? args["role"] : "boy";
  payload.memberId = args["member"] || args["kid"] || "demo-member-1";
  payload.memberName = args["name"] || "Demo Member";
  payload.role = role;
}

const p = b64url(Buffer.from(JSON.stringify(payload)));
const sig = b64url(crypto.createHmac("sha256", secret).update(p).digest());
const token = `${p}.${sig}`;

const base = (args["base"] || "http://localhost:3000").replace(/\/$/, "");
console.log("payload:", payload);
console.log("\nlaunch URL (valid 120s):\n");
console.log(`${base}/api/yooniz/sso?token=${token}`);
