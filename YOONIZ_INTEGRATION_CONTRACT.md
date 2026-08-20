# Yooniz ⇄ Gadit — Integration Contract (v1)

The single source of truth both Claude sessions build against (Yooniz side +
Gadit side). Goal: a Yooniz parent links their family to Gadit once; then each
Yooniz kid opens **their own** Gadit vocabulary notebook from inside Yooniz, with
zero password typing and zero cross-charging.

Both apps already share the same family model (parent + up to 5 kids, roles
father/mother/boy/girl, per-member Firestore uid + notebook). Gadit's `family.ts`
literally says it "mirrors Yooniz". So this is a thin trust bridge between two
apps that already speak the same shape.

- **Yooniz** — Firebase project `unitedapp-623c2`, `yooniz.com`.
- **Gadit** — Firebase project `gadit-app`, `gadit.app`. Family billing → plan `"deep"`.
- **Never merge the Firebase projects.** Each app authenticates in its own project.
  Yooniz never gets a Gadit session and vice-versa; the bridge is a signed launch
  token, not a shared login.

---

## 0. The shared secret

`YOONIZ_GADIT_SSO_SECRET` — one random 32-byte hex string, set as an env var in
**both** Vercel projects (Yooniz + Gadit), Production (and Preview). It signs the
launch token below. Rotating it means updating both. Never committed to git.

---

## 1. The launch token (Yooniz mints → Gadit verifies)

Compact, HMAC-signed, short-lived. Not a Firebase token — a cross-app claim.

**Encoding:** `token = base64url(payloadJson) + "." + base64url(HMAC_SHA256(base64url(payloadJson), secret))`

**Payload (member-generic — any family member opens their own Gadit space):**
```json
{
  "v": 1,
  "yoonizFamilyId": "<Yooniz family doc id>",
  "parentEmail": "<the Family OWNER's email, lowercased>",  // the Gadit Family owner key
  "memberId": "<Yooniz member id — STABLE per member>",     // → one Gadit member + personal area
  "memberName": "<display name, e.g. אבא / דין>",
  "role": "father" | "mother" | "boy" | "girl",
  "isOwner": true | false,   // true → the Gadit Family OWNER account (ignore memberId there)
  "iat": 1712345678,         // unix seconds
  "nonce": "<16+ random hex>"
}
```

**Gadit verification (reject on any failure):**
1. Recompute the HMAC over the received `base64url(payloadJson)` and constant-time
   compare. Reject if mismatch.
2. `iat` within the last **120 seconds** (launch tokens are single-use, immediate).
3. `nonce` not seen before (optional replay cache, TTL 120s; recommended).
4. `v === 1`.

`parentEmail` is the linking key (§2). `kidId` is the stable per-kid key that maps
to one Gadit member + one notebook (§3).

---

## 2. Linking & entitlement (CORRECTED — Gadi 19/8)

**There is NO free trial without a card, and NO auto-provisioning.** Gadit's only
entry is its own paid **Family** subscription (Gadit's standard 14-day trial always
captures a credit card in Stripe). Yooniz never creates a Gadit account or grants
any Gadit entitlement. The model is exactly:

- **Registered to BOTH Yooniz and Gadit** (the `parentEmail` owns an *active* Gadit
  Family) → immediate SSO into their **existing** Gadit profile for the relevant
  member (§3). No new account, no duplicate profile.
- **Not registered to Gadit** (no active Gadit Family for that email) → do NOT
  provision anything. Instead show the **Gadit promo** ("הצטרפו למנוי המשפחתי של
  גדית") and send them to Gadit's landing / Stripe Family checkout
  (`GADIT_SIGNUP_URL`). Once they subscribe there, the next launch resolves them as
  a subscriber.

On a successful subscribed SSO, Gadit persists the mapping
`yoonizLinks/{yoonizFamilyId} = { gaditFamilyId, linkedAt }`.

### 2.1 Status endpoint (so Yooniz shows promo-vs-launch)

So Yooniz can render the promo instead of a dead launch button, Gadit exposes an
HMAC-signed status check (same secret + token encoding as §1, minus member fields):

`POST https://gadit.app/api/yooniz/status` → `{ subscribed: boolean }` for the
family's `parentEmail`. Yooniz calls it to decide: subscribed → show the per-member
launch list; not subscribed → show the Gadit promo card → `GADIT_SIGNUP_URL`.

---

## 3. SSO — the child opens their notebook (per kid, every launch)

**Yooniz side:** kid taps "המילון שלי" → Yooniz server mints a launch token for that
kid → full-page navigate to `https://gadit.app/api/yooniz/sso?token=<token>`
(Phase 1). Later, embed via `milon.yooniz.com` first-party subdomain (§5).

**Gadit `GET /api/yooniz/sso` (new route):**
1. Verify the token (§1).
2. Resolve `gaditFamilyId` for `yoonizFamilyId` (§2). Enforce entitlement (§4).
3. Resolve the Gadit **member** for `memberId` — **match the EXISTING profile, never
   duplicate** (Gadi 19/8 hit this: opening דין/אושר from Yooniz created a second
   profile instead of connecting to their real Gadit one). Resolution order:
   - `families/{gaditFamilyId}/members` carrying `yoonizKidId === memberId` → use it.
   - Else match an existing member by **normalized name** within that Gadit family
     (trim/casefold). On a hit, backfill `yoonizKidId: memberId` onto that member so
     the link is stable from then on. This is what connects Gadi's pre-existing
     Gadit kids to their Yooniz members.
   - Only if there is genuinely no matching member: create one (role from token,
     name from token, `yoonizKidId: memberId`), respecting `MAX_KIDS_PER_FAMILY = 5`,
     with its synthetic user `users/{familyId}_${memberId}` `{ plan:"deep", ... }`.
   - `syntheticUid = ${gaditFamilyId}_${memberId}`.
4. Mint a Gadit custom token: `createCustomToken(syntheticUid, { role, familyId: gaditFamilyId, memberId })`.
5. Respond with a tiny HTML page that runs `signInWithCustomToken(token)` then
   `location.replace("/he/notebook")` (custom-token sign-in is client-side).
   **If the family has no active Gadit Family, do NOT sign anyone in and do NOT mint
   a trial** — redirect to Gadit's landing / Stripe Family checkout (the promo).

**Result:** the child lands in *their own* `users/{syntheticUid}/notebook` — the
existing per-uid structure needs no change. Reuse `family.ts`,
`api/family/pair/redeem/route.ts`, `firebase-admin.ts`.

**Any member opens their own Gadit space — `isOwner` picks the branch.** Every
Yooniz family member (owner parent, co-parent, or kid) has their own personal
area in Gadit; Yooniz sends ONE member per launch:
- **isOwner === true** → sign the parent into the **Gadit Family OWNER account**
  (the real Gadit user for `parentEmail`; auto-provision by `parentEmail` per §2
  if missing). This is the paying account + Family management. Ignore `memberId`.
- **isOwner === false** (co-parent or kid) → resolve/create a Gadit **member** for
  `memberId` (role from the token), mint its custom token, land on their personal
  area. Same as the kid flow above, for any non-owner member.
Same entitlement rule (§4) either way: active Family → in; else → Family upsell.

**Smooth redirect (polish, Gadi 19/8):** the SSO page must NOT render Gadit's
dictionary home first. Make it a minimal loading page (spinner only) that runs
`signInWithCustomToken` then `location.replace("/he/notebook")`, so there's no
flash of the dictionary before the notebook.

---

## 4. Entitlement & billing (zero cross-charge)

- Gadit gates itself. Access is granted **only** if the `parentEmail` owns an active
  Gadit Family (`users/{ownerUid}.plan === "deep"` via the Family price, incl. Gadit's
  own **card-required** 14-day trial). The Yooniz subscription grants nothing in Gadit.
- **No free trial without a card. No auto-provisioning.** (Corrected 19/8 — the earlier
  Phase-1 "auto free trial" is removed; it made Yooniz users show up as free Family
  subscribers in Gadit's dashboard, which must never happen.) A non-subscriber is sent
  to Gadit's landing / Stripe Family checkout, nowhere else.
- Cleanup: any family auto-provisioned under the old rule (Shimrit, תהילה מאיר, ADI,
  צליל חסיד…) must be reconciled in Gadit — they are not paying and must not be
  counted or treated as Family subscribers.
- Yooniz never sees Gadit card data; Gadit never charges through Yooniz.

---

## 5. Embedding vs full-page (start simple)

- **Phase 1: full-page redirect** to `gadit.app/api/yooniz/sso`. No iframe, no
  third-party-cookie problem, works in Safari. Ship this first.
- **Phase 2: first-party iframe** at `milon.yooniz.com` (Vercel rewrite/proxy to
  Gadit) so it feels in-app. Requires: (a) Gadit adds a CSP `frame-ancestors
  https://*.yooniz.com` header, (b) Gadit activates its first-party Firebase
  auth-domain rewrite (`next.config.ts:53`) so `signInWithCustomToken` works inside
  the frame. Do NOT attempt the iframe before both are in place.

---

## 6. What each side builds

**Yooniz (this session):**
- "תוספות / Add-ons" area. Calls Gadit's `/api/yooniz/status`: subscribed → per-member
  launch list; not subscribed → **Gadit promo card** → `GADIT_SIGNUP_URL`.
- Server: mint the launch token (HMAC over the payload with `YOONIZ_GADIT_SSO_SECRET`).
- Per-member launch action → navigate to the Gadit SSO URL with a fresh token.

**Gadit (the separate Gadit Claude session):**
- `POST /api/yooniz/status` → `{ subscribed }` for the family's `parentEmail` (§2.1).
- `GET /api/yooniz/sso` (verify token → resolve family → **match EXISTING member, no
  duplicates** → mint custom token → sign-in page). Model it on `api/family/pair/redeem`.
- `yoonizLinks/{yoonizFamilyId}` doc + the `yoonizKidId` field on members.
- Entitlement branch: **active Family → existing-profile notebook; else → Stripe
  Family checkout / landing. Never a card-less trial, never auto-provision.**
- Reconcile the old auto-provisioned families (not paying → not Family).
- Phase 2: `frame-ancestors` CSP + first-party auth-domain rewrite + `/link` route.

**Both:** add `YOONIZ_GADIT_SSO_SECRET` to their Vercel.

---

## 7. Security notes
- HTTPS only. Token TTL 120s. Constant-time HMAC compare. Optional nonce replay cache.
- The token authorizes creating/entering a member in the *linked* family only —
  Gadit must bind `kidId → yoonizKidId` and never let one family's token touch
  another's members.
- `MAX_KIDS_PER_FAMILY = 5` still applies; surface a clear message if exceeded.

## 8. Phase 1 (MVP) checklist
1. `YOONIZ_GADIT_SSO_SECRET` in both Vercels; `GADIT_SIGNUP_URL` in Yooniz.
2. Gadit: `POST /api/yooniz/status` → `{ subscribed }`.
3. Yooniz: Add-ons area → status-gated (subscribed = launch list, else = promo →
   `GADIT_SIGNUP_URL`) + token mint + per-member launch.
4. Gadit: `GET /api/yooniz/sso` — active Family → **existing** member notebook (no
   duplicate); no active Family → Stripe Family checkout. No card-less trial.
5. Full-page redirect (no iframe yet).
Result: a subscriber opens their existing Gadit notebook in one tap; a non-subscriber
is sent to Gadit's paid Family checkout.
