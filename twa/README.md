# Gadit Android app (TWA) — build & publish

The Gadit Android app is a **Trusted Web Activity**: a thin native shell around the existing PWA (`https://www.gadit.app`). One codebase, no second app to maintain — every web deploy updates the app automatically. This folder holds everything needed to build and ship it to Google Play.

- **App / package:** `com.gadit.app`
- **Wrapped site:** `https://www.gadit.app`
- **Billing model:** reader app — payment happens in the browser (Stripe), never in-app, so Google takes **0%**. The code already routes checkout to the external browser when it detects the TWA (`web/src/lib/twa.ts`, and the guard in `CheckoutClient`).

---

## Already done (in the repo, deployed with the web app)

1. **Web manifest** — `web/public/manifest.json` is TWA-ready (name, `display: standalone`, theme `#0EA5A5`, 192/512 + maskable icons).
2. **Digital Asset Links** — `web/public/.well-known/assetlinks.json`, served at `https://www.gadit.app/.well-known/assetlinks.json`. **Fingerprints are placeholders** — fill them in step 4 below.
3. **Bubblewrap config** — `twa/twa-manifest.json` (this folder).
4. **TWA runtime** — detection + external-browser payment (`web/src/lib/twa.ts`, `TwaInit`, checkout guard).

## What's left (needs a machine with the build tools; not doable on the current dev box, which has no JDK)

### 1. Install Bubblewrap
```bash
npm install -g @bubblewrap/cli
```
First run auto-downloads a JDK + the Android SDK (accept the prompts).

### 2. Build the app bundle (AAB)
From this `twa/` folder (it already contains `twa-manifest.json`):
```bash
cd twa
bubblewrap build
```
On the FIRST build Bubblewrap generates the signing keystore `android.keystore` (alias `android`). **Back this file + its passwords up somewhere safe — losing it means you can never update the app.**

Output: `app-release-bundle.aab` (upload this) and `app-release-signed.apk` (for testing on a device).

### 3. Get the signing SHA-256 fingerprints
```bash
bubblewrap fingerprint list
```
This prints the SHA-256 of your **upload key**. You also need the **Play App Signing** key's SHA-256, which Google shows in **Play Console → your app → Setup → App integrity → App signing** after the first upload.

### 4. Fill in assetlinks.json and redeploy the web app
Put both fingerprints into `web/public/.well-known/assetlinks.json` (replace the two `REPLACE_WITH_...` placeholders — you can keep both, one per line), commit, and push. Verify it serves:
```
https://www.gadit.app/.well-known/assetlinks.json
```
If assetlinks doesn't list the fingerprint of the key that actually signed the installed app, the app shows a Chrome URL bar instead of full-screen. So this step must be correct before release.

### 5. Publish on Google Play
1. Create the app in **Play Console** (name "Gadit", package `com.gadit.app`).
2. Keep **Play App Signing ON** (default) — that's the key whose SHA-256 goes in assetlinks.
3. Upload `app-release-bundle.aab` to an internal-testing (or production) release.
4. Fill the store listing: short + full description, screenshots (phone), a 512×512 icon (reuse `web/public/icon-512.png`), feature graphic, privacy-policy URL (`https://www.gadit.app/privacy`), content rating, data-safety form.
5. Roll out. Google review is usually a few days.

---

## Billing policy note (why payment is external)
If a digital subscription is bought **inside** the app, Google requires Play Billing (15–30%). Because Gadit's checkout opens in the **external browser** (a web/reader-app purchase), Google is not involved and takes nothing — all revenue stays on Stripe. Keep it that way: never render the Stripe/payment form inside the TWA. The `CheckoutClient` TWA guard enforces this; if you add new paid flows, route them through `openInBrowser()` from `web/src/lib/twa.ts`.

The same protects you on iOS: on iPhone the PWA installs via Safari with no App Store, so Apple's IAP rule never applies.

## Updating the app later
- **Content / features:** just deploy the website. The app reloads `www.gadit.app`, so it updates instantly. No Play resubmission.
- **App shell (icon, name, package, permissions, target SDK):** bump `appVersionCode` in `twa-manifest.json`, `bubblewrap build`, upload the new AAB.
