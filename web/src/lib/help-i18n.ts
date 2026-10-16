/**
 * Help Center content — categorised troubleshooting Q&A rendered on
 * /contact. Each category becomes a section; each item renders as a
 * native <details> accordion so we get free open/close + a11y without
 * shipping client-side state.
 *
 * Editorial rules (Gadi, June 10 2026):
 *   - **No em-dashes (—) or en-dashes (–) anywhere.** They read as
 *     "AI wrote this" and break the founder voice. Use periods,
 *     commas, or restructure. See [[feedback_no_em_dashes]].
 *   - Startup-collective voice. "We read every message", not "I'll get back".
 *     Never use "I"/"me"/"my" — Gadit is a team, not one founder. Never
 *     mention "AI" — the mechanism is irrelevant to the user.
 *   - Every answer ends with a concrete next step.
 *   - Email address shown in the footer is the canonical contact;
 *     answers don't need to repeat "email me at <address>" since the
 *     same address appears under the CTA at the bottom of the page.
 *
 * Coverage philosophy:
 * - Lead with billing. That's where real users (Ziv) actually get
 *   stuck and pull Gadi onto WhatsApp. Cover every Stripe Customer
 *   Portal surface so the user solves it themself.
 * - Account & sign-in next. Firebase auth gotchas, verification
 *   email spam-folder issue, and so on.
 * - Product / usage third. Kids mode, voice, offline, reporting
 *   wrong content.
 * - Partner program fourth. The in-house program (/partners, /p/<code>,
 *   partner dashboard): standard 25% year one, 10% for life after,
 *   plus payout questions.
 * - General last. What Gadit is, languages, kids safety, data.
 */

import { planCopy } from "./plan-copy";
import { LANGUAGES, type Lang } from "./i18n";
import { HELP_MORE_1 } from "./help-i18n-more-1";
import { HELP_MORE_2 } from "./help-i18n-more-2";
import { HELP_MORE_3 } from "./help-i18n-more-3";
import { HELP_MORE_4 } from "./help-i18n-more-4";
import { HELP_MORE_5 } from "./help-i18n-more-5";

export interface HelpItem {
  /** Stable id so we can deep-link via #q-<id>. */
  id: string;
  q: string;
  /** Multi-paragraph answer. Each entry becomes a <p>. Keep paragraphs
      short. Readers skim. */
  a: string[];
}

export interface HelpCategory {
  /** Stable id so /account can deep-link via #billing, #account, etc. */
  id: string;
  /** Single-character emoji or short svg-friendly label; rendered as
      a small leading chip on each category header. */
  icon: string;
  title: string;
  items: HelpItem[];
}

export interface HelpContent {
  eyebrow: string;
  heading: string;
  lede: string;
  stillNeedHelpHeading: string;
  stillNeedHelpBody: string;
  emailCta: string;
  responseTime: string;
  categories: HelpCategory[];
}

export const HELP = {} as Record<Lang, HelpContent>;

Object.assign(HELP, {
  en: {
    eyebrow: "Help Center",
    heading: "Find an answer, fast.",
    lede: "Common questions and step by step fixes, organised by area. If you don't see your issue, get in touch with the team at the bottom.",
    stillNeedHelpHeading: "Still stuck?",
    stillNeedHelpBody: "Write to us directly. Every message gets read by the team and a reply within a day or two.",
    emailCta: "Email us",
    responseTime: "Typical reply: within 24 to 48 hours.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Billing & subscription",
        items: [
          {
            id: "change-card",
            q: "How do I change the credit card on my subscription?",
            a: [
              "You can switch to a new card in under a minute without cancelling. Your current subscription keeps running, just on the new card.",
              "1. Sign in at gadit.app and open your Account page (top right). 2. Click \"Manage billing\". 3. A secure Stripe page opens. Click \"Add payment method\", enter the new card, and mark it as Default. 4. Optionally remove the old card.",
              "From the next billing cycle on, everything goes to the new card. The previous charge (already collected) stays on the old card. No refund needed unless you want one specifically.",
            ],
          },
          {
            id: "cancel",
            q: "How do I cancel my subscription?",
            a: [
              "Self-serve, any time. Sign in, open Account, and tap Cancel subscription under your plan.",
              "Your access continues until the end of the period you already paid for. After that the account drops back to Basic (free). Your saved words, history, and notebook stay safe and accessible.",
              "If you cancel by mistake or change your mind, you can resume the subscription from the same page before the period ends.",
            ],
          },
          {
            id: "switch-plan",
            q: "How do I switch from Clear to Deep (or the other way)?",
            a: [
              "Account, then Manage billing, then Update subscription. Pick the new plan.",
              "Stripe calculates the price difference automatically, pro-rated by the days remaining in the current period. If you're upgrading, you'll be charged just the difference for the rest of the period. If you're switching to a lower tier, the credit applies to your next bill.",
            ],
          },
          {
            id: "invoice",
            q: "How do I download an invoice or receipt?",
            a: [
              "Account, then Manage billing, then Invoice history. Every charge has a downloadable PDF receipt with the billing details you saved.",
              "If you need a different name, address, or tax ID on the invoice (for example a company name for tax purposes), update your billing details on the same page before downloading. The next receipt will use the new details.",
            ],
          },
          {
            id: "portal-error",
            q: "I clicked Manage billing but got an error. What now?",
            a: [
              "Two common causes. First, your account doesn't have an active Stripe subscription. Second, Stripe may not have a complete billing profile for your account yet.",
              "Easy first check: sign out, sign back in with the email you used at checkout, and try again. If it still fails, contact us with your account email and the team will fix it from our side in a minute.",
            ],
          },
          {
            id: "autorenew",
            q: "Will my subscription auto-renew?",
            a: [
              "Yes. Monthly plans renew every month, annual plans renew every year on the same date. You can see the next billing date in your account and on Stripe's portal.",
              "If you don't want auto-renew, cancel any time before the renewal date. Cancellation isn't immediate. You keep access through the period you already paid for.",
            ],
          },
          {
            id: "refund",
            q: "Can I get a refund?",
            a: [
              "Yes. If the purchase was less than 14 days ago and the service hasn't been used much, write to us with your account email and a short note about why. Those refunds get approved without a fight.",
              "If it's been more than 14 days, the team handles it case by case. Cancel the subscription so it doesn't keep renewing, and email us.",
            ],
          },
          {
            id: "unknown-charge",
            q: "I see a charge I don't recognise.",
            a: [
              "Charges appear as GADIT or GADIT.APP with $2.99 (Clear monthly), $4.99 (Deep monthly), $29.99 (Clear yearly), or $49.99 (Deep yearly). If it doesn't match, it might be from a different service.",
              "If you're certain it's not yours, don't dispute through your bank yet. Write to us directly first with the date and amount. The team will find it, explain what it is, and refund if needed. A bank dispute can make future billing harder, so resolving it through support is usually faster and safer.",
            ],
          },
          {
            id: "failed-payment",
            q: "My payment failed. What should I do?",
            a: [
              "Stripe automatically retries failed payments a few times over the following days. Most failures resolve on their own once the bank releases the hold or the card has enough balance.",
              "If you want to fix it right away, go to Account → Manage billing → Add payment method, enter a working card, and set it as Default. Stripe will retry the failed charge immediately on the new card. If your subscription has already lapsed to Basic, you can resubscribe from Pricing and your notebook stays intact.",
            ],
          },
          {
            id: "plan-comparison",
            q: "What's the difference between Basic, Clear, and Deep?",
            a: [
              "Basic (free): up to 20 word lookups a day, every meaning, examples per meaning, idioms, and word origin. No signup required for basic searches.",
              "Clear ($2.99/month or $29.99/year): unlimited lookups, kid-friendly explanations, an image per word (30/month), compose-your-own-sentence with feedback, idioms detail, and 30 days of search history.",
              "Deep ($4.99/month or $49.99/year): everything in Clear, plus practice quizzes, the personal notebook with smart spaced-repetition practice, distinguishing similar words, and a larger image quota (100/month).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Account & sign-in",
        items: [
          {
            id: "no-verification-email",
            q: "I didn't receive my verification email.",
            a: [
              "Check spam and promotions folders first. Gmail and Outlook sometimes route account emails there until you mark one as \"Not spam\".",
              "If it's not there, the email might have been mistyped at signup. Try signing up again and double-check the address. If you used Google sign-up, no verification email is needed.",
            ],
          },
          {
            id: "forgot-password",
            q: "I forgot my password.",
            a: [
              "Open the sign-in dialog and click \"Forgot password?\". Enter the email you use for Gadit and you'll get a reset link within a minute or two.",
              "If the email doesn't arrive, check spam. If it still doesn't arrive, you might have signed up with Google instead of email and password. Try the \"Continue with Google\" button.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "I'm sure my password is right but it says \"Wrong email or password\".",
            a: [
              "Three things to check. First, capslock. Second, trailing space when copy-pasting. Third, you signed up with Google rather than a password (use \"Continue with Google\" instead).",
              "Still stuck? Reset the password from the same dialog. It sets you up clean.",
            ],
          },
          {
            id: "google-fails",
            q: "Google sign-in doesn't work.",
            a: [
              "Most common cause: your browser is blocking third-party cookies or pop-ups for gadit.app. Allow them in the address-bar permissions and try again.",
              "If you're in incognito mode, Google sign-in is restricted on purpose. Switch to a normal browser window.",
            ],
          },
          {
            id: "change-email",
            q: "How do I change the email on my account?",
            a: [
              "Account, click your email, Change email. You'll need to confirm the new address before it sticks. Your subscription, history, and notebook all carry over.",
              "If the email is tied to a Stripe customer, update it on the Stripe billing portal too so future receipts go to the new address.",
            ],
          },
          {
            id: "delete-account",
            q: "How do I delete my account?",
            a: [
              "Account, bottom of the page, Delete account. This is permanent. Your subscription is cancelled, your notebook and history are erased, and the email is freed up for a fresh signup.",
              "Stripe records of past charges remain (we're legally required to keep them for accounting). Nothing else stays.",
            ],
          },
          {
            id: "share-account",
            q: "Can my partner or child share my account?",
            a: [
              "One signed-in user per account at a time. Kids mode lets a single Clear or Deep account serve a parent and child: flip the toggle and definitions render kid-friendly without separate logins.",
              "For two adults who both want separate notebooks and progress, create two accounts. Clear is $2.99 a month per account.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "I think I have two accounts by mistake. What now?",
            a: [
              "This usually happens when someone signs up once with Google and once with email and password using the same address, or when you sign up twice with different email addresses. Each signup creates a separate Gadit account with its own notebook, history, and subscription state.",
              "Write to us with both email addresses (or UIDs from the Account page) and which one you'd like to keep. The team will merge the notebooks and history onto the account you choose, then close the other one cleanly. No data lost.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Using Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "I think the definition is wrong. What do I do?",
            a: [
              "Every result page has a small \"Report\" button at the bottom. Tap it, pick a category (definition, etymology, example, idiom, kids explanation, and so on) and write a short note. It comes straight to the team and every report gets reviewed.",
              "Don't worry about being too picky. The dictionary improves from this feedback faster than from anything else.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Kids mode isn't changing the explanation.",
            a: [
              "Kids mode only flips text where the word already has a kid-friendly explanation generated. For brand-new words you've just looked up, give it 10 to 15 seconds. The kid-friendly version is generated on the fly the first time.",
              "Also: kids mode requires Clear or Deep. If you're on Basic, the toggle will prompt you to upgrade. Anonymous users get prompted to sign up.",
            ],
          },
          {
            id: "voice-fails",
            q: "Voice search doesn't work.",
            a: [
              "Voice search needs microphone permission. Most browsers ask once per site. If you accidentally clicked Block, you'll need to flip it back manually: click the lock or info icon next to gadit.app in the address bar, then Site settings, then Microphone, then Allow.",
              "On Safari iOS, microphone access also requires a Settings → Safari → Microphone toggle. Voice is currently a Clear and Deep feature: Basic users see an upgrade prompt, signed-out visitors see a sign-in prompt.",
            ],
          },
          {
            id: "no-image",
            q: "I can't generate an image for the word.",
            a: [
              "Image generation is a Clear or Deep feature with a monthly quota. Clear gets 30 images a month, Deep gets 100. If you've used up the quota, you'll see a wall. It resets on the 1st of every month.",
              "If you're under the quota and still seeing failures, it's usually transient. Try again in 30 seconds. Persistent failures are a bug. Please report from the word page.",
            ],
          },
          {
            id: "save-word",
            q: "How do I save a word to my notebook?",
            a: [
              "On any word result page, tap Save to notebook near the title. The notebook is a Clear and Deep feature where you can review saved words later, see them on a galaxy view, and run smart-practice sessions (Deep).",
              "Words you've saved and opened at least once are available offline from the local cache. The offline pack also caches the most popular words in your language so you're ready without internet.",
            ],
          },
          {
            id: "offline",
            q: "How does offline mode work?",
            a: [
              "Words you've already viewed are cached locally. Open them again without internet and they load instantly. The full offline pack (top words in your language) downloads on demand from the notebook page.",
              "Searching for a brand-new word still requires connectivity, because Gadit has to generate the definition from scratch. The offline cache is for words you've already explored.",
            ],
          },
          {
            id: "slow",
            q: "The app feels slow.",
            a: [
              "The first lookup of a word is the slowest because Gadit generates the full result from scratch: usually a few seconds, sometimes longer for complex words. Subsequent lookups of the same word are instant, served from cache.",
              "If everything feels slow, try a hard refresh: Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows. If the slowness persists across pages, please email us with your country and browser so the team can check the network route to our servers from your region.",
            ],
          },
          {
            id: "word-not-found",
            q: "I searched a word and didn't get a result. What's going on?",
            a: [
              "First, check the spelling. Gadit handles minor typos most of the time, but a wrong vowel or missing letter can throw it off. Try the suggested correction if one appears.",
              "Beyond that: very rare or slang words might not return a confident result. If you're sure the word is real, click the Report button on the result page (or on the error screen) and let us know. Every report gets reviewed and real misses get fed back into the system.",
            ],
          },
          {
            id: "change-language",
            q: "How do I change the UI language?",
            a: [
              "Top right of any page, you'll see a small flag icon (or your current language name). Tap it and pick from 30+ languages: English, Greek, Hebrew, Arabic, Russian, Spanish, Portuguese, French, German, Czech, Slovak, Italian, Japanese, Hindi, Amharic, Zulu.",
              "Your choice is saved on this device. Everything reloads in the new language: the interface, the menus, future word definitions, examples, kid explanations, even the etymology. Already-cached results in the old language stay until you search those words again.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Partner program",
        items: [
          {
            id: "join-partner",
            q: "How do I become a Gadit partner?",
            a: [
              "Open /partners from any page and click \"Become a partner\". Sign up with your name and email, and your unique referral link plus a dashboard to track clicks and commissions are ready right away. No waiting for approval.",
              "Joining is free and open to anyone. You don't need a Gadit subscription to become a partner.",
            ],
          },
          {
            id: "commission-model",
            q: "How are commissions calculated?",
            a: [
              "The standard terms are 25% of every payment a customer makes in their first year. After that first year, you earn 10% of every payment for as long as the customer keeps paying.",
              "This works the same for monthly and annual plans, because commission is counted on each actual payment. If a customer cancels, your commission stops with their last payment.",
              "The team can set different rates for specific partners. Your own rates always show in your partner dashboard, which you can reach from /partners.",
            ],
          },
          {
            id: "payout",
            q: "When do I get paid?",
            a: [
              "Monthly, once your balance crosses $50. We use the payout method you set in the partner dashboard (bank transfer, PayPal, and so on). $50 is the minimum threshold, not a cap. You can earn far more, you just receive the payout when you cross the threshold.",
              "Commissions release 30 days after the subscription payment, to allow for the refund window. So a January subscription releases in early February and lands in your next payout once your balance crosses $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "I joined but my dashboard is empty.",
            a: [
              "Stats show after the first click on your link. Empty just means nobody's clicked yet. Go share the link. The dashboard updates in near real time once activity starts.",
              "If you've shared and someone's signed up but the dashboard isn't reflecting it, write to us with the rough time of signup and the team will check the attribution.",
            ],
          },
          {
            id: "attribution-window",
            q: "How long does my referral link keep tracking a visitor?",
            a: [
              "Sixty days. When a visitor clicks your link, we set a cookie identifying you as the referrer. If they sign up and subscribe any time in the next 60 days (even if they leave the site and come back later through a Google search), the attribution still credits you.",
              "Cookie clearance: if the visitor clears their cookies or switches browser/device before they sign up, attribution can be lost. There's no workaround for that, but 60 days is a generous window compared to most partner programs.",
            ],
          },
          {
            id: "missing-commission",
            q: "Someone signed up through my link but I don't see the commission.",
            a: [
              "Most often this is timing: the signup shows up in the dashboard within minutes, but the commission only books once the subscription is actually paid (which can be days later if they're on a free trial). Check back after the trial ends.",
              "If the subscription paid but you still don't see the commission after 48 hours, write to us with the rough signup time and the email or rough name of the subscriber if you know it. The team will dig into the attribution chain and fix any miss manually.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "General",
        items: [
          {
            id: "what-is-gadit",
            q: "What is Gadit?",
            a: [
              "A multilingual dictionary built to make a word click, not just give a one-line definition. Every word opens with all its meanings, real examples per meaning, idioms, etymology, an optional image, and (with Clear and Deep) a kid-friendly explanation, compose-your-own-sentence with feedback, and quizzes.",
              "Currently 30+ UI languages. Internally the team calls it GAD a word: to understand a word all the way through, not just translate it.",
            ],
          },
          {
            id: "languages",
            q: "Which languages do you support?",
            a: [
              "Interface: English, Greek, Hebrew, Arabic, Russian, Spanish, Portuguese, French, German, Czech, Slovak, Italian, Japanese, Zulu.",
              "You can look up a word in any of those languages and get the definition, examples, and everything else in your chosen UI language. Hebrew and Arabic are fully RTL and use their native fonts.",
            ],
          },
          {
            id: "kid-safety",
            q: "Is Gadit safe for kids?",
            a: [
              "Gadit is designed for a parent to use safely alongside a child. Kids mode produces explanations that are simple, concrete, and age-appropriate (around the 5 to 10 year old level), using the same engine that powers adult content with explicit instructions to simplify. No user-generated content is ever shown to kids.",
              "In line with our policies and child-privacy rules around the world, independent account ownership is 13 and up. The standard pattern is a parent's account that the parent uses together with their kid, which is exactly what Kids mode is built for.",
            ],
          },
          {
            id: "data",
            q: "Where is my data stored? Do you sell it?",
            a: [
              "Account, history, notebook, and generated images are stored securely in Firebase, encrypted in storage. We don't sell your data to anyone. We only share what's needed to run Gadit (storage, payments, content providers), as spelled out in the Privacy Policy.",
              "You can export your notebook or delete your account at any time from the Account page.",
            ],
          },
          {
            id: "contact-direct",
            q: "How do I reach you directly?",
            a: [
              "Use the email button at the bottom of this page. It goes straight to the team inbox. Every message gets read and a reply within 24 to 48 hours (often faster).",
              "Email beats chat for support: it gives the team a chance to read carefully and reply thoughtfully. Phone support isn't offered yet.",
            ],
          },
        ],
      },
    ],
  },
  zu: {
    eyebrow: "Isikhungo Sosizo",
    heading: "Thola impendulo, ngokushesha.",
    lede: "Imibuzo evamile nezixazululo isinyathelo nesinyathelo, zihlelwe ngezindawo. Uma ungayiboni inkinga yakho, xhumana neqembu ngezansi.",
    stillNeedHelpHeading: "Usabambekile?",
    stillNeedHelpBody: "Sibhalele ngqo. Wonke umyalezo ufundwa iqembu futhi uthola impendulo phakathi kosuku noma ezimbili.",
    emailCta: "Sithumelele i-imeyili",
    responseTime: "Impendulo evamile: phakathi kwamahora angu-24 kuya kwangu-48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ukukhokha nokubhalisa",
        items: [
          {
            id: "change-card",
            q: "Ngiyishintsha kanjani ikhadi lesikweletu ekubhaliseni kwami?",
            a: [
              "Ungashintshela ekhadini elisha ngaphansi komzuzu ngaphandle kokukhansela. Ukubhalisa kwakho kwamanje kuqhubeka kusebenza, kodwa manje ekhadini elisha.",
              "1. Ngena ku-gadit.app bese uvula ikhasi lakho le-Account (phezulu ngakwesokudla). 2. Chofoza \"Manage billing\". 3. Kuvuleka ikhasi le-Stripe elivikelekile. Chofoza \"Add payment method\", faka ikhadi elisha, bese ulimaka njenge-Default. 4. Ngokuzikhethela, susa ikhadi elidala.",
              "Kusukela emjikelezweni olandelayo wokukhokha, konke kuya ekhadini elisha. Inkokhelo yangaphambilini (esivele iqoqiwe) ihlala ekhadini elidala. Akudingeki umbuyiselo ngaphandle uma uwufuna ngokuqondile.",
            ],
          },
          {
            id: "cancel",
            q: "Ngikukhansela kanjani ukubhalisa kwami?",
            a: [
              "Ungakwenza wena, noma nini. Ngena ngemvume, vula i-Akhawunti, bese uthepha okuthi Khansela ukubhalisa ngaphansi kohlelo lwakho.",
              "Ukufinyelela kwakho kuqhubeka kuze kube sekupheleni kwesikhathi osuvele usikhokhele. Ngemva kwalokho i-akhawunti ibuyela ku-Basic (yamahhala). Amagama akho awagcinile, umlando, nencwadi yamanothi kuhlala kuphephile futhi kufinyeleleka.",
              "Uma ukhansela ngephutha noma ushintsha umqondo, ungaqhubeka nokubhalisa kusuka kuleli khasi elifanayo ngaphambi kokuphela kwesikhathi.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ngishintsha kanjani kusuka ku-Clear ngiya ku-Deep (noma okuphambene)?",
            a: [
              "I-Account, bese Manage billing, bese Update subscription. Khetha uhlelo olusha.",
              "I-Stripe ibala umehluko wentengo ngokuzenzakalelayo, ngokwezinsuku ezisele esikhathini samanje. Uma uthuthukisa, uzokhokhiswa umehluko kuphela wesikhathi esisele. Uma ushintshela ezingeni eliphansi, isikweletu sisebenza esikweletini sakho esilandelayo.",
            ],
          },
          {
            id: "invoice",
            q: "Ngiyilanda kanjani i-invoyisi noma irisidi?",
            a: [
              "I-Account, bese Manage billing, bese Invoice history. Yonke inkokhelo inerisidi ye-PDF elandekayo enemininingwane yokukhokha oyigcinile.",
              "Uma udinga igama, ikheli, noma i-ID yentela ehlukile ku-invoyisi (isibonelo igama lenkampani ngezinjongo zentela), buyekeza imininingwane yakho yokukhokha kuleli khasi elifanayo ngaphambi kokulanda. Irisidi elandelayo lizosebenzisa imininingwane emisha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ngichofozile Manage billing kodwa ngathola iphutha. Manje kwenziwani?",
            a: [
              "Izimbangela ezimbili ezivamile. Okokuqala, i-akhawunti yakho ayinakho ukubhalisa kwe-Stripe okusebenzayo. Okwesibili, kungenzeka i-Stripe ingakabi nephrofayela egcwele yokukhokha ye-akhawunti yakho okwamanje.",
              "Ukuhlola kokuqala okulula: phuma, ubuye ungene nge-imeyili oyisebenzisile lapho ukhokha, bese uzama futhi. Uma kusehluleka, xhumana nathi nge-imeyili ye-akhawunti yakho futhi iqembu lizokulungisa ohlangothini lwethu ngomzuzu.",
            ],
          },
          {
            id: "autorenew",
            q: "Ingabe ukubhalisa kwami kuzozivuselela ngokuzenzakalelayo?",
            a: [
              "Yebo. Amahlelo enyanga avuselela njalo ngenyanga, amahlelo onyaka avuselela njalo ngonyaka ngosuku olufanayo. Ungabona usuku olulandelayo lokukhokha ku-akhawunti yakho nasephothalini ye-Stripe.",
              "Uma ungakufuni ukuzivuselela okuzenzakalelayo, khansela nganoma yisiphi isikhathi ngaphambi kosuku lokuvuselela. Ukukhansela akwenzeki ngokushesha. Ugcina ukufinyelela kuze kube sekupheleni kwesikhathi osuvele usikhokhele.",
            ],
          },
          {
            id: "refund",
            q: "Ngingawuthola umbuyiselo?",
            a: [
              "Yebo. Uma ukuthenga kwenzeke ngaphansi kwezinsuku ezingu-14 ezedlule futhi insizakalo ingasetshenzisiwe kakhulu, sibhalele nge-imeyili ye-akhawunti yakho nenothi elifushane ngesizathu. Leyo mibuyiselo iyagunyazwa ngaphandle kwempikiswano.",
              "Uma sekwedlule izinsuku ezingaphezu kuka-14, iqembu likuphatha icala ngecala. Khansela ukubhalisa ukuze kungaqhubeki kuvuselela, bese usithumelela i-imeyili.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ngibona inkokhelo engingayazi.",
            a: [
              "Izinkokhelo zivela njenge-GADIT noma i-GADIT.APP nge-$2.99 (Clear yanyanga), $4.99 (Deep yanyanga), $29.99 (Clear yonyaka), noma $49.99 (Deep yonyaka). Uma ingahambisani, kungenzeka ivela kwenye insizakalo.",
              "Uma uqinisekile ukuthi akuyona eyakho, ungaqali ngokuphikisa ngebhange lakho. Sibhalele ngqo kuqala ngosuku nenani. Iqembu lizoyithola, lichaze ukuthi iyini, futhi libuyisele uma kudingeka. Ukuphikisa ngebhange kungenza ukukhokha kwesikhathi esizayo kube nzima, ngakho ukukuxazulula ngosizo ngokuvamile kushesha futhi kuphephe kakhulu.",
            ],
          },
          {
            id: "failed-payment",
            q: "Inkokhelo yami yehlulekile. Kufanele ngenzeni?",
            a: [
              "I-Stripe izama kabusha ngokuzenzakalelayo izinkokhelo ezihlulekile izikhathi ezimbalwa ezinsukwini ezilandelayo. Iningi lokwehluleka lizixazulula lona uma ibhange likhulula ukubamba noma ikhadi linebhalansi eyanele.",
              "Uma ufuna ukuyilungisa ngokushesha, iya ku-Account, Manage billing, Add payment method, faka ikhadi elisebenzayo, bese ulisetha njenge-Default. I-Stripe izozama kabusha inkokhelo ehlulekile ngokushesha ekhadini elisha. Uma ukubhalisa kwakho sekuphelelwe yisikhathi kwabuyela ku-Basic, ungabhalisa kabusha kusuka ku-Pricing futhi incwadi yakho yamanothi ihlala iphelele.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Uyini umehluko phakathi kwe-Basic, Clear, ne-Deep?",
            a: [
              "Basic (yamahhala): kufikela kumagama angu-20 owasesha ngosuku, zonke izincazelo, izibonelo ngencazelo ngayinye, izisho, nomsuka wegama. Akudingeki kubhalisa ukuze usesho olusisekelo.",
              "Clear ($2.99/inyanga noma $29.99/unyaka): usesho olungenamkhawulo, izincazelo ezinobungane, isithombe ngegama ngalinye (30/inyanga), ukubumba owakho umusho ngempendulo, imininingwane yezisho, nezinsuku ezingu-30 zomlando wosesho.",
              "Deep ($4.99/inyanga noma $49.99/unyaka): konke okuku-Clear, kanye nezivivinyo zokuzejwayeza, incwadi yamanothi yomuntu siqu enokuzejwayeza kokuphinda okuhlakaniphile, ukuhlukanisa amagama afanayo, kanye nesabelo esikhulu sezithombe (100/inyanga).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "I-akhawunti nokungena",
        items: [
          {
            id: "no-verification-email",
            q: "Angiyitholanga i-imeyili yami yokuqinisekisa.",
            a: [
              "Hlola amafolda e-spam nawezikhangiso kuqala. I-Gmail ne-Outlook kwesinye isikhathi zithumela ama-imeyili e-akhawunti lapho kuze kube yilapho umaka elilodwa njenge \"Not spam\".",
              "Uma lingekho, kungenzeka i-imeyili yabhalwa ngephutha ngesikhathi sokubhalisa. Zama ukubhalisa futhi bese uhlola kabili ikheli. Uma usebenzise ukubhalisa nge-Google, akudingeki i-imeyili yokuqinisekisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ngiyikhohliwe iphasiwedi yami.",
            a: [
              "Vula ibhokisi lokungena bese uchofoza \"Forgot password?\". Faka i-imeyili oyisebenzisela i-Gadit bese uthola isixhumanisi sokusetha kabusha phakathi komzuzu noma emibili.",
              "Uma i-imeyili ingafiki, hlola i-spam. Uma isengafiki, kungenzeka wabhalisa nge-Google esikhundleni se-imeyili nephasiwedi. Zama inkinobho ethi \"Continue with Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ngiqinisekile ukuthi iphasiwedi yami ilungile kodwa ithi \"Wrong email or password\".",
            a: [
              "Izinto ezintathu okufanele uzihlole. Okokuqala, i-capslock. Okwesibili, isikhala esisemuva uma ukopisha unamathisela. Okwesithathu, wabhalisa nge-Google kunephasiwedi (sebenzisa \"Continue with Google\" esikhundleni salokho).",
              "Usabambekile? Setha kabusha iphasiwedi kusuka kubhokisi elifanayo. Kukubeka endaweni ecacile.",
            ],
          },
          {
            id: "google-fails",
            q: "Ukungena nge-Google akusebenzi.",
            a: [
              "Imbangela evame kakhulu: isiphequluli sakho sivimbela amakhukhi enkampani yesithathu noma ama-pop-up e-gadit.app. Wavumele ezimvumeni ezisebharini yekheli bese uzama futhi.",
              "Uma usemodini ye-incognito, ukungena nge-Google kuvinjelwe ngamabomu. Shintshela kuwindi elijwayelekile lesiphequluli.",
            ],
          },
          {
            id: "change-email",
            q: "Ngiyishintsha kanjani i-imeyili ku-akhawunti yami?",
            a: [
              "I-Account, chofoza i-imeyili yakho, Change email. Uzodinga ukuqinisekisa ikheli elisha ngaphambi kokuthi lisebenze. Ukubhalisa kwakho, umlando, nencwadi yamanothi konke kudlulela.",
              "Uma i-imeyili iboshelwe kukhasimende le-Stripe, yibuyekeze nasephothalini yokukhokha ye-Stripe ukuze amarisidi esikhathi esizayo aye ekhelini elisha.",
            ],
          },
          {
            id: "delete-account",
            q: "Ngiyisusa kanjani i-akhawunti yami?",
            a: [
              "I-Account, ngezansi kwekhasi, Delete account. Lokhu kuhlala unomphela. Ukubhalisa kwakho kuyakhanselwa, incwadi yakho yamanothi nomlando kuyasuswa, futhi i-imeyili iyakhululwa ukuze ubhalise kabusha.",
              "Amarekhodi e-Stripe ezinkokhelo ezedlule ahlala (ngokomthetho sidinga ukuwagcina ngezobalomali). Akukho okunye okusalayo.",
            ],
          },
          {
            id: "share-account",
            q: "Ingabe umlingani wami noma ingane yami bangayabelana nge-akhawunti yami?",
            a: [
              "Umsebenzisi oyedwa ongenile nge-akhawunti ngasikhathi sinye. Imodi yezingane ivumela i-akhawunti eyodwa ye-Clear noma ye-Deep ukuthi isize umzali nengane: guqula i-toggle bese izincazelo zivela zinobungane ngaphandle kokungena okwehlukene.",
              "Kubantu abadala ababili abafuna bobabili izincwadi zamanothi ezihlukene nenqubekela phambili, dala ama-akhawunti amabili. I-Clear ingu-$2.99 ngenyanga nge-akhawunti ngayinye.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ngicabanga ukuthi nginama-akhawunti amabili ngephutha. Manje kwenziwani?",
            a: [
              "Lokhu kuvame ukwenzeka lapho umuntu ebhalisa kanye nge-Google bese ebhalisa kanye nge-imeyili nephasiwedi esebenzisa ikheli elifanayo, noma lapho ubhalisa kabili ngamakheli e-imeyili ahlukene. Ukubhalisa ngakunye kudala i-akhawunti ye-Gadit ehlukene enencwadi yamanothi yayo, umlando, nesimo sokubhalisa.",
              "Sibhalele ngamakheli e-imeyili womabili (noma ama-UID asuka ekhasini le-Account) nokuthi yiliphi ofuna ukuligcina. Iqembu lizohlanganisa izincwadi zamanothi nomlando ku-akhawunti oyikhethayo, bese livala enye ngokuhlanzekile. Ayikho idatha elahlekayo.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Ukusebenzisa i-Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ngicabanga ukuthi incazelo ayilungile. Ngenzani?",
            a: [
              "Wonke amakhasi omphumela anenkinobho encane ethi \"Report\" ngezansi. Yicindezele, khetha isigaba (incazelo, umsuka wegama, isibonelo, isisho, incazelo yezingane, njalonjalo) bese ubhala inothi elifushane. Kufika ngqo eqenjini futhi wonke umbiko uyabuyekezwa.",
              "Ungakhathazeki ngokuba nokukhetha okweqile. Isichazamazwi sithuthuka kule mpendulo ngokushesha kunanoma yini enye.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Imodi yezingane ayiyishintshi incazelo.",
            a: [
              "Imodi yezingane iguqula umbhalo kuphela lapho igama selivele linencazelo enobungane ekhiqiziwe. Emagameni amasha owaqeda ukuwabheka, linike imizuzwana engu-10 kuya kwengu-15. Inguqulo enobungane ikhiqizwa khona lapho okokuqala.",
              "Futhi: imodi yezingane idinga i-Clear noma i-Deep. Uma uku-Basic, i-toggle izokunxusa ukuthi uthuthukise. Abasebenzisi abangaziwa banxuswa ukuthi babhalise.",
            ],
          },
          {
            id: "voice-fails",
            q: "Usesho ngezwi alusebenzi.",
            a: [
              "Usesho ngezwi ludinga imvume yemakrofoni. Iziphequluli eziningi zibuza kanye ngesayithi ngalinye. Uma ngengozi uchofoze u-Block, uzodinga ukukuguqula kabusha ngesandla: chofoza isikhiye noma isithonjana solwazi eduze kwe-gadit.app ebharini yekheli, bese Site settings, bese Microphone, bese Allow.",
              "Ku-Safari iOS, ukufinyelela imakrofoni kudinga futhi i-toggle ku-Settings, Safari, Microphone. Izwi okwamanje liyisici se-Clear ne-Deep: abasebenzisi be-Basic babona isinxuso sokuthuthukisa, izivakashi ezingaphumile zibona isinxuso sokungena.",
            ],
          },
          {
            id: "no-image",
            q: "Angikwazi ukukhiqiza isithombe segama.",
            a: [
              "Ukukhiqiza izithombe kuyisici se-Clear noma se-Deep esinesabelo sanyanga. I-Clear ithola izithombe ezingu-30 ngenyanga, i-Deep ithola ezingu-100. Uma usisebenzise saphela isabelo, uzobona udonga. Sisetha kabusha ngo-1 wanyanga zonke.",
              "Uma ungaphansi kwesabelo kodwa usabona ukwehluleka, ngokuvamile kuyedlula. Zama futhi ngemva kwemizuzwana engu-30. Ukwehluleka okuqhubekayo kuyiphutha lohlelo. Sicela ubike kusuka ekhasini legama.",
            ],
          },
          {
            id: "save-word",
            q: "Ngiligcina kanjani igama encwadini yami yamanothi?",
            a: [
              "Kunoma yiliphi ikhasi lomphumela wegama, cindezela Save to notebook eduze kwesihloko. Incwadi yamanothi iyisici se-Clear ne-Deep lapho ungabuyekeza khona amagama awagcinile kamuva, uwabone ngokubuka kwe-galaxy, futhi uqhube izikhathi zokuzejwayeza okuhlakaniphile (Deep).",
              "Amagama owagcinile futhi wawavula okungenani kanye ayatholakala ungaxhunyiwe ku-inthanethi kusuka kunqolobane yasendaweni. Iphakethe lokungaxhunyiwe futhi ligcina amagama adume kakhulu ngolimi lwakho ukuze ulunge ngaphandle kwe-inthanethi.",
            ],
          },
          {
            id: "offline",
            q: "Isebenza kanjani imodi yokungaxhunyiwe ku-inthanethi?",
            a: [
              "Amagama osuwabukile agcinwa endaweni yasendaweni. Wavule futhi ngaphandle kwe-inthanethi bese elayisha ngokushesha. Iphakethe eligcwele lokungaxhunyiwe (amagama aphambili ngolimi lwakho) lilanda ngokudingeka kusuka ekhasini lencwadi yamanothi.",
              "Ukusesha igama elisha ngokuphelele kusadinga uxhumano, ngoba i-Gadit kufanele ikhiqize incazelo kusukela ekuqaleni. Inqolobane yokungaxhunyiwe ingeyamagama osuwahlolile.",
            ],
          },
          {
            id: "slow",
            q: "Uhlelo lokusebenza luzwakala luhamba kancane.",
            a: [
              "Ukubheka kokuqala kwegama kuhamba kancane kakhulu ngoba i-Gadit ikhiqiza umphumela ophelele kusukela ekuqaleni: ngokuvamile imizuzwana embalwa, kwesinye isikhathi isikhathi eside kumagama ayinkimbinkimbi. Ukubheka okulandelayo kwegama elifanayo kusheshayo, kulethwa kusuka enqolobaneni.",
              "Uma konke kuzwakala kuhamba kancane, zama ukuvuselela okuqinile: Cmd+Shift+R ku-Mac, Ctrl+Shift+R ku-Windows. Uma ukuhamba kancane kuqhubeka kuwo wonke amakhasi, sicela usithumelele i-imeyili nezwe lakho nesiphequluli ukuze iqembu lihlole indlela yenethiwekhi eya kumaseva ethu kusuka esifundeni sakho.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ngiseshe igama kodwa angitholanga mphumela. Kwenzekani?",
            a: [
              "Okokuqala, hlola upelo. I-Gadit iphatha amaphutha amancane wokuthayipha isikhathi esiningi, kodwa unkamisa ongalungile noma uhlamvu olungekho kungayidukisa. Zama ukulungiswa okuphakanyisiwe uma kuvela.",
              "Ngaphandle kwalokho: amagama angavamile kakhulu noma esilingi angahle angabuyisi umphumela oqinisekile. Uma uqinisekile ukuthi igama likhona ngempela, chofoza inkinobho ethi Report ekhasini lomphumela (noma esikrinini sephutha) bese usazisa. Wonke umbiko uyabuyekezwa futhi ukungatholakali kwangempela kubuyiselwa ohlelweni.",
            ],
          },
          {
            id: "change-language",
            q: "Ngilushintsha kanjani ulimi lwesixhumi (UI)?",
            a: [
              "Phezulu ngakwesokudla kwanoma yiliphi ikhasi, uzobona isithonjana esincane sefulege (noma igama lolimi lwakho lwamanje). Yicindezele bese ukhetha phakathi kwezilimi ezingu-21: isiNgisi, isiGreki, isiHeberu, isi-Arabhu, isiRashiya, isiSpanish, isiPutukezi, isiFulentshi, isiJalimane, isiCzech, isiSlovak, isiTaliyane, isiJaphane, isiHindi, isi-Amharic, isiZulu.",
              "Ukukhetha kwakho kugcinwa kule divayisi. Konke kulayisha kabusha ngolimi olusha: isixhumi, amamenyu, izincazelo zamagama zesikhathi esizayo, izibonelo, izincazelo zezingane, ngisho nomsuka wegama. Imiphumela esivele igciniwe ngolimi oludala ihlala kuze kube yilapho usesha lawo magama futhi.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Uhlelo lwabalingani",
        items: [
          {
            id: "join-partner",
            q: "Ngiba kanjani umlingani we-Gadit?",
            a: [
              "Vula i-/partners kusuka kunoma yiliphi ikhasi bese uchofoza \"Become a partner\". Bhalisa ngegama nge-imeyili yakho, futhi isixhumanisi sakho esiyingqayizivele sokudlulisela kanye nedeshibhodi yokulandelela ukuchofoza namakhomishini kulungile ngokushesha. Akukho ukulinda ukugunyazwa.",
              "Ukujoyina kumahhala futhi kuvulekele wonke umuntu. Awudingi ukubhalisela i-Gadit ukuze ube umlingani.",
            ],
          },
          {
            id: "commission-model",
            q: "Amakhomishini abalwa kanjani?",
            a: [
              "Imigomo ejwayelekile ingu-25% wayo yonke inkokhelo eyenziwa yikhasimende onyakeni walo wokuqala. Ngemva kwalowo nyaka wokuqala, uhola u-10% wayo yonke inkokhelo inqobo nje uma ikhasimende liqhubeka likhokha.",
              "Lokhu kusebenza ngendlela efanayo ezinhlelweni zenyanga nezonyaka, ngoba ikhomishini ibalwa enkokhelweni ngayinye eyenziwe ngempela. Uma ikhasimende likhansela, ikhomishini yakho iyama ngenkokhelo yalo yokugcina.",
              "Iqembu lingasetha amazinga ahlukile kwabalingani abathile. Amazinga akho ahlala ebonakala kudeshibhodi yakho yabalingani, ongayifinyelela kusuka ku-/partners.",
            ],
          },
          {
            id: "payout",
            q: "Ngikhokhelwa nini?",
            a: [
              "Ngenyanga, uma ibhalansi yakho iwela ngaphezu kuka-$50. Sisebenzisa indlela yokukhokha oyisethe kudeshibhodi yabalingani (ukudlulisa ngebhange, i-PayPal, njalonjalo). U-$50 uwumkhawulo ophansi, hhayi umkhawulo ophezulu. Ungahola okuningi kakhulu, uthola nje inkokhelo lapho wedlula umkhawulo.",
              "Amakhomishini akhululwa ngemva kwezinsuku ezingu-30 kwenkokhelo yokubhalisa, ukuze kuvumeleke iwindi lombuyiselo. Ngakho ukubhalisa kukaJanuwari kukhululwa ekuqaleni kukaFebhuwari futhi kufika enkokhelweni yakho elandelayo uma ibhalansi yakho iwela ngaphezu kuka-$50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ngijoyinile kodwa ideshibhodi yami ayinalutho.",
            a: [
              "Izibalo zivela ngemva kokuchofoza kokuqala esixhumanisini sakho. Okungenalutho kusho nje ukuthi akekho osechofozile okwamanje. Hamba wabelane ngesixhumanisi. Ideshibhodi ibuyekeza cishe ngesikhathi sangempela uma umsebenzi uqala.",
              "Uma wabelane futhi othile ebhalisile kodwa ideshibhodi ingakubonisi, sibhalele ngesikhathi esilinganiselwe sokubhalisa futhi iqembu lizohlola ukwabelwa.",
            ],
          },
          {
            id: "attribution-window",
            q: "Isixhumanisi sami sokudlulisela siqhubeka isikhathi esingakanani silandelela isivakashi?",
            a: [
              "Izinsuku ezingamashumi ayisithupha. Lapho isivakashi sichofoza isixhumanisi sakho, sibeka ikhukhi elikuhlonza njengomdlulisi. Uma bebhalisa futhi bebhalisela nganoma yisiphi isikhathi ezinsukwini ezingu-60 ezizayo (ngisho noma beshiya isayithi bese bebuya kamuva ngosesho lwe-Google), ukwabelwa kusakubalela wena.",
              "Ukususwa kwamakhukhi: uma isivakashi sisusa amakhukhi aso noma sishintsha isiphequluli noma idivayisi ngaphambi kokuthi babhalise, ukwabelwa kungalahleka. Alikho isu lokusijikela lokho, kodwa izinsuku ezingu-60 ziyiwindi elivulelekile uma kuqhathaniswa nezinhlelo eziningi zabalingani.",
            ],
          },
          {
            id: "missing-commission",
            q: "Umuntu othile ubhalise ngesixhumanisi sami kodwa angiyiboni ikhomishini.",
            a: [
              "Ngokuvamile lokhu kungenxa yesikhathi: ukubhalisa kuvela kudeshibhodi phakathi kwemizuzu, kodwa ikhomishini ibhukwa kuphela uma ukubhalisa sekukhokhelwe ngempela (okungaba izinsuku kamuva uma besesikhathini sokulinga samahhala). Buyela emuva ngemva kokuphela kwesikhathi sokulinga.",
              "Uma ukubhalisa kukhokhelwe kodwa usangayiboni ikhomishini ngemva kwamahora angu-48, sibhalele ngesikhathi esilinganiselwe sokubhalisa kanye ne-imeyili noma igama elilinganiselwe lombhalisi uma ulazi. Iqembu lizophenya iketango lokwabelwa futhi lilungise noma yikuphi ukungatholakali ngesandla.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Okujwayelekile",
        items: [
          {
            id: "what-is-gadit",
            q: "Yini i-Gadit?",
            a: [
              "Isichazamazwi sezilimi eziningi esakhelwe ukwenza igama licace, hhayi nje ukunika incazelo yomugqa owodwa. Igama ngalinye livuleka nazo zonke izincazelo zalo, izibonelo zangempela ngencazelo ngayinye, izisho, umsuka wegama, isithombe ongazikhethela sona, kanye (nge-Clear ne-Deep) nencazelo enobungane, ukubumba owakho umusho ngempendulo, nezivivinyo.",
              "Okwamanje izilimi ze-UI ezingu-14. Ngaphakathi iqembu likubiza ngokuthi uku-GAD igama: ukuqonda igama ngokuphelele, hhayi nje ukulihumusha.",
            ],
          },
          {
            id: "languages",
            q: "Yiziphi izilimi enizisekelayo?",
            a: [
              "Isixhumi: isiNgisi, isiGreki, isiHeberu, isi-Arabhu, isiRashiya, isiSpanish, isiPutukezi, isiFulentshi, isiJalimane, isiCzech, isiSlovak, isiTaliyane, isiJaphane, isiZulu.",
              "Ungabheka igama nganoma yiluphi lwalezo zilimi bese uthola incazelo, izibonelo, nakho konke okunye ngolimi lwe-UI olukhethile. IsiHeberu nesi-Arabhu zibhalwa ngokugcwele kusuka ngakwesokudla kuya ngakwesobunxele futhi zisebenzisa amafonti azo omdabu.",
            ],
          },
          {
            id: "kid-safety",
            q: "Ingabe i-Gadit iphephile ezinganeni?",
            a: [
              "I-Gadit yakhelwe ukuthi umzali ayisebenzise ngokuphepha eceleni kwengane. Imodi yezingane ikhiqiza izincazelo ezilula, ezibonakalayo, nezifanele ubudala (cishe izinga leminyaka engu-5 kuya kwengu-10), isebenzisa injini efanayo enika amandla okuqukethwe kwabadala nemiyalo ecacile yokwenza kube lula. Akukho okuqukethwe okwenziwe umsebenzisi okuke kuboniswe ezinganeni.",
              "Ngokuhambisana nezinqubomgomo zethu nemithetho yobumfihlo bezingane emhlabeni wonke, ubunikazi be-akhawunti ezimele bungobeminyaka engu-13 nangaphezulu. Iphethini ejwayelekile yi-akhawunti yomzali umzali ayisebenzisa kanye nengane yakhe, okuyikho kanye i-Kids mode eyakhelwe kona.",
            ],
          },
          {
            id: "data",
            q: "Idatha yami igcinwaphi? Ingabe niyayithengisa?",
            a: [
              "I-akhawunti, umlando, incwadi yamanothi, nezithombe ezikhiqiziwe zigcinwa ngokuphephile ku-Firebase, zibethelwe endaweni yokugcina. Asiyithengisi idatha yakho kunoma ubani. Sabelana kuphela ngalokho okudingekayo ukusebenzisa i-Gadit (indawo yokugcina, izinkokhelo, abahlinzeki bokuqukethwe), njengoba kuchaziwe kuNqubomgomo Yobumfihlo.",
              "Ungakhipha incwadi yakho yamanothi noma ususe i-akhawunti yakho nganoma yisiphi isikhathi kusuka ekhasini le-Account.",
            ],
          },
          {
            id: "contact-direct",
            q: "Ngingafinyelela kanjani kini ngqo?",
            a: [
              "Sebenzisa inkinobho ye-imeyili engezansi kwaleli khasi. Iya ngqo enqolobaneni yemiyalezo yeqembu. Wonke umyalezo uyafundwa futhi uthola impendulo phakathi kwamahora angu-24 kuya kwangu-48 (ngokuvamile ngokushesha okukhulu).",
              "I-imeyili ingcono kunengxoxo ekusekeleni: inika iqembu ithuba lokufunda ngokucophelela nokuphendula ngokucabanga. Ukusekelwa ngefoni akukatholakali okwamanje.",
            ],
          },
        ],
      },
    ],
  },
  xh: {
    eyebrow: "Iziko loncedo",
    heading: "Fumana impendulo, ngokukhawuleza.",
    lede: "Imibuzo eqhelekileyo nezisombululo inyathelo ngenyathelo, zicwangciswe ngamacandelo. Ukuba awuyiboni ingxaki yakho, qhagamshelana neqela ezantsi.",
    stillNeedHelpHeading: "Usabambekile?",
    stillNeedHelpBody: "Sibhalele ngqo. Wonke umyalezo ufundwa liqela kwaye uphendulwa kwisithuba sosuku okanye ezimbini.",
    emailCta: "Sithumelele i-imeyile",
    responseTime: "Impendulo eqhelekileyo: kwiiyure ezingama-24 ukuya kwezingama-48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Iintlawulo nomrhumo",
        items: [
          {
            id: "change-card",
            q: "Ndilitshintsha njani ikhadi letyala kumrhumo wam?",
            a: [
              "Ungatshintshela kwikhadi elitsha ngaphantsi komzuzu ngaphandle kokurhoxisa. Umrhumo wakho wangoku uyaqhubeka, kodwa ngekhadi elitsha.",
              "1. Ngena kwi-gadit.app uze uvule iphepha leAkhawunti yakho (phezulu ekunene). 2. Cofa \"Lawula iintlawulo\". 3. Kuvuleka iphepha le-Stripe elikhuselekileyo. Cofa \"Add payment method\", faka ikhadi elitsha, uze ulibeke njengeDefault. 4. Ukuba uyafuna, susa ikhadi elidala.",
              "Ukususela kumjikelo olandelayo wokuhlawula, yonke into iya kwikhadi elitsha. Intlawulo yangaphambili (esele iqokelelwe) ihlala kwikhadi elidala. Akufuneki mbuyekezo ngaphandle kokuba uyifuna ngokuthe ngqo.",
            ],
          },
          {
            id: "cancel",
            q: "Ndiwurhoxisa njani umrhumo wam?",
            a: [
              "Uzenzela ngokwakho, nanini na. Ngena, vula iAkhawunti, uze ucofe Rhoxisa umrhumo phantsi kwesicwangciso sakho.",
              "Ukufikelela kwakho kuyaqhubeka de kuphele ixesha osele ulihlawulele. Emva koko iakhawunti ibuyela kwi-Basic (simahla). Amagama akho agciniweyo, imbali nencwadi yakho zihlala zikhuselekile kwaye ziyafikeleleka.",
              "Ukuba urhoxisa ngempazamo okanye utshintsha ingqondo, ungawuqhubela phambili umrhumo kwakwiphepha elo ngaphambi kokuba ixesha liphele.",
            ],
          },
          {
            id: "switch-plan",
            q: "Nditshintsha njani ukusuka kwi-Clear ukuya kwi-Deep (okanye ngenye indlela)?",
            a: [
              "IAkhawunti, emva koko Lawula iintlawulo, emva koko Update subscription. Khetha isicwangciso esitsha.",
              "I-Stripe ibala umahluko wexabiso ngokuzenzekelayo, ngokweentsuku ezisele kwixesha langoku. Ukuba uyanyusela, uhlawuliswa kuphela umahluko kwixesha eliseleyo. Ukuba utshintshela kwinqanaba eliphantsi, ikhredithi isetyenziswa kwibhili yakho elandelayo.",
            ],
          },
          {
            id: "invoice",
            q: "Ndiyikhuphela njani i-invoyisi okanye irisithi?",
            a: [
              "IAkhawunti, emva koko Lawula iintlawulo, emva koko Invoice history. Yonke intlawulo inerisithi ye-PDF onokuyikhuphela eneenkcukacha zokuhlawula ozigcinileyo.",
              "Ukuba ufuna igama elahlukileyo, idilesi okanye inombolo yerhafu kwi-invoyisi (umzekelo igama lenkampani ngenjongo zerhafu), hlaziya iinkcukacha zakho zokuhlawula kwakwiphepha elo ngaphambi kokukhuphela. Irisithi elandelayo iza kusebenzisa iinkcukacha ezintsha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ndicofe Lawula iintlawulo kodwa ndafumana impazamo. Ndenze ntoni ngoku?",
            a: [
              "Kukho izizathu ezibini eziqhelekileyo. Okokuqala, iakhawunti yakho ayinawo umrhumo we-Stripe osebenzayo. Okwesibini, i-Stripe isenokuba ayikabi neprofayile epheleleyo yokuhlawula yeakhawunti yakho.",
              "Into elula yokuqala ukuyijonga: phuma, ungene kwakhona nge-imeyile oyisebenzise xa ubuhlawula, uze uzame kwakhona. Ukuba isasilela, qhagamshelana nathi nge-imeyile yeakhawunti yakho kwaye iqela liza kuyilungisa kwicala lethu ngomzuzu.",
            ],
          },
          {
            id: "autorenew",
            q: "Ingaba umrhumo wam uza kuzihlaziya ngokwawo?",
            a: [
              "Ewe. Izicwangciso zenyanga zihlaziywa inyanga nganye, izicwangciso zonyaka zihlaziywa unyaka ngamnye ngomhla ofanayo. Ungawubona umhla olandelayo wokuhlawula kwiakhawunti yakho nakwiphothali ye-Stripe.",
              "Ukuba awufuni kuhlaziywa ngokuzenzekelayo, rhoxisa nanini na ngaphambi komhla wokuhlaziya. Ukurhoxisa akwenzeki ngoko nangoko. Ugcina ukufikelela kulo lonke ixesha osele ulihlawulele.",
            ],
          },
          {
            id: "refund",
            q: "Ndingayifumana imali yam ibuyiswe?",
            a: [
              "Ewe. Ukuba uthenge kwiintsuku ezingaphantsi kwe-14 ezidlulileyo kwaye inkonzo ayikasetyenziswa kakhulu, sibhalele nge-imeyile yeakhawunti yakho kunye nenqaku elifutshane elichaza isizathu. Ezo mbuyekezo zivunywa ngaphandle kwengxabano.",
              "Ukuba sele kudlule iintsuku ezingaphezu kwe-14, iqela liyiphatha ngokwemeko nganye. Rhoxisa umrhumo ukuze ungaqhubeki uzihlaziya, uze usithumelele i-imeyile.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ndibona intlawulo endingayaziyo.",
            a: [
              "Iintlawulo zivela njenge-GADIT okanye i-GADIT.APP ene-$2.99 (Clear ngenyanga), $4.99 (Deep ngenyanga), $29.99 (Clear ngonyaka), okanye $49.99 (Deep ngonyaka). Ukuba ayihambelani, isenokuba ivela kwenye inkonzo.",
              "Ukuba uqinisekile ukuba asiyiyo eyakho, musa ukuyiphikisa ngebhanki yakho okwangoku. Qala usibhalele ngqo ngomhla nemali. Iqela liza kuyifumana, likuchazele ukuba yintoni, kwaye libuyise imali ukuba kuyimfuneko. Ukuphikisa ngebhanki kunokwenza iintlawulo ezizayo zibe nzima, ngoko ukuyisombulula ngenkxaso kudla ngokukhawuleza nokukhuseleka ngakumbi.",
            ],
          },
          {
            id: "failed-payment",
            q: "Intlawulo yam ayiphumelelanga. Ndenze ntoni?",
            a: [
              "I-Stripe iphinda izame iintlawulo ezingaphumelelanga izihlandlo ezimbalwa kwiintsuku ezilandelayo. Uninzi lweempazamo zizisombulula ngokwazo xa ibhanki ikhulula imali ebibanjiwe okanye ikhadi linemali eyaneleyo.",
              "Ukuba ufuna ukuyilungisa ngoko nangoko, yiya kwiAkhawunti → Lawula iintlawulo → Add payment method, faka ikhadi elisebenzayo, uze ulibeke njengeDefault. I-Stripe iza kuphinda izame intlawulo ebingaphumelelanga kwangoko kwikhadi elitsha. Ukuba umrhumo wakho sele ubuyele kwi-Basic, ungabhalisa kwakhona kwiphepha lamaXabiso kwaye incwadi yakho ihlala ingachukumiswanga.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Yintoni umahluko phakathi kwe-Basic, Clear ne-Deep?",
            a: [
              "Basic (simahla): ukuya kukhangelo lwamagama olungama-20 ngosuku, zonke iintsingiselo, imizekelo kwintsingiselo nganye, izaci nemvelaphi yegama. Akufuneki kubhalisa ukuze ukhangele ngokusisiseko.",
              "Clear ($2.99/ngenyanga okanye $29.99/ngonyaka): ukhangelo olungenamda, iinkcazelo ezilungele abantwana, umfanekiso wegama ngalinye (30/ngenyanga), ukubhala esakho isivakalisi nengxelo, iinkcukacha zezaci, kunye neentsuku ezingama-30 zembali yokukhangela.",
              "Deep ($4.99/ngenyanga okanye $49.99/ngonyaka): yonke into ekwi-Clear, kunye nemibuzo yokuziqhelisa, incwadi yakho yamagama enokuziqhelisa okukrelekrele ngokuphinda ngamaxesha athile, ukwahlula amagama afanayo, nesabelo esikhulu semifanekiso (100/ngenyanga).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Iakhawunti nokungena",
        items: [
          {
            id: "no-verification-email",
            q: "Andiyifumananga i-imeyile yokuqinisekisa.",
            a: [
              "Qala ujonge kwiifolda ze-spam nezentengiso. I-Gmail ne-Outlook ngamanye amaxesha zithumela ii-imeyile zeakhawunti apho de uphawule enye njenge-\"Not spam\".",
              "Ukuba ayikho apho, i-imeyile isenokuba ichwethezwe ngempazamo xa ububhalisa. Zama ukubhalisa kwakhona uze uphinde ujonge idilesi. Ukuba ubhalise nge-Google, akufuneki imeyile yokuqinisekisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ndiyilibele iphasiwedi yam.",
            a: [
              "Vula ibhokisi yokungena uze ucofe \"Uyilibele iphasiwedi?\". Faka i-imeyile oyisebenzisela i-Gadit kwaye uza kufumana ilinki yokutshintsha iphasiwedi kwisithuba somzuzu okanye emibini.",
              "Ukuba i-imeyile ayifiki, jonga kwi-spam. Ukuba ayikafiki nangoko, usenokuba ubhalise nge-Google endaweni ye-imeyile nephasiwedi. Zama iqhosha elithi \"Qhubeka nge-Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ndiqinisekile ukuba iphasiwedi yam ichanekile kodwa ithi \"I-imeyile okanye iphasiwedi ayichanekanga\".",
            a: [
              "Kukho izinto ezintathu zokujonga. Okokuqala, i-capslock. Okwesibini, isithuba esisekupheleni xa ukopa uncamathisela. Okwesithathu, ubhalise nge-Google kunokuba ubhalise ngephasiwedi (sebenzisa \"Qhubeka nge-Google\" endaweni yoko).",
              "Usabambekile? Tshintsha iphasiwedi kwakwibhokisi leyo. Oko kukulungiselela ngokutsha.",
            ],
          },
          {
            id: "google-fails",
            q: "Ukungena nge-Google akusebenzi.",
            a: [
              "Owona nobangela uqhelekileyo: ibhrawuza yakho ivimba ii-cookie zabantu besithathu okanye ii-pop-up ze-gadit.app. Zivumele kwiimvume zebha yedilesi uze uzame kwakhona.",
              "Ukuba ukwimo ye-incognito, ukungena nge-Google kuthintelwe ngabom. Tshintshela kwifestile eqhelekileyo yebhrawuza.",
            ],
          },
          {
            id: "change-email",
            q: "Ndiyitshintsha njani i-imeyile kwiakhawunti yam?",
            a: [
              "IAkhawunti, cofa i-imeyile yakho, Tshintsha i-imeyile. Kuza kufuneka uqinisekise idilesi entsha ngaphambi kokuba isebenze. Umrhumo wakho, imbali nencwadi yakho zonke ziyadluliselwa.",
              "Ukuba i-imeyile inxulumene nomthengi we-Stripe, yihlaziye nakwiphothali yeentlawulo ye-Stripe ukuze iirisithi ezizayo ziye kwidilesi entsha.",
            ],
          },
          {
            id: "delete-account",
            q: "Ndiyicima njani iakhawunti yam?",
            a: [
              "IAkhawunti, ezantsi kwiphepha, Cima iakhawunti. Oku kungunaphakade. Umrhumo wakho urhoxisiwe, incwadi nembali yakho ziyacinywa, kwaye i-imeyile iyakhululeka ukuze ubhalise ngokutsha.",
              "Iirekhodi ze-Stripe zeentlawulo ezidlulileyo ziyahlala (umthetho usinyanzela ukuba sizigcine ngenjongo zobalo-mali). Akukho nto yimbi ihlalayo.",
            ],
          },
          {
            id: "share-account",
            q: "Ingaba iqabane lam okanye umntwana wam angabelana ngeakhawunti yam?",
            a: [
              "Umsebenzisi omnye ongeneyo kwiakhawunti ngexesha. Imo yabantwana ivumela iakhawunti enye ye-Clear okanye ye-Deep ukuba isebenzele umzali nomntwana: tshintsha iswitshi kwaye iintsingiselo ziboniswa ngendlela elungele abantwana ngaphandle kokungena okwahlukileyo.",
              "Kubantu abadala ababini abafuna iincwadi nenkqubela ezahlukeneyo, yenza iiakhawunti ezimbini. I-Clear yi-$2.99 ngenyanga kwiakhawunti nganye.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ndicinga ukuba ndineeakhawunti ezimbini ngempazamo. Ndenze ntoni ngoku?",
            a: [
              "Oku kudla ngokwenzeka xa umntu ebhalisa kanye nge-Google aphinde abhalise nge-imeyile nephasiwedi esebenzisa idilesi enye, okanye xa ubhalisa kabini ngeedilesi ze-imeyile ezahlukeneyo. Ukubhalisa ngakunye kwenza iakhawunti ye-Gadit eyahlukileyo eneyayo incwadi, imbali nemeko yomrhumo.",
              "Sibhalele ngazo zombini iidilesi ze-imeyile (okanye ii-UID ezivela kwiphepha leAkhawunti) nokuba ufuna ukugcina eyiphi. Iqela liza kudibanisa iincwadi nembali kwiakhawunti oyikhethayo, emva koko livale enye ngokucocekileyo. Akukho nkcukacha zilahlekayo.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Ukusebenzisa i-Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ndicinga ukuba intsingiselo ayichanekanga. Ndenze ntoni?",
            a: [
              "Lonke iphepha leziphumo lineqhosha elincinci elithi \"Xela\" ezantsi. Licofe, khetha udidi (intsingiselo, imvelaphi, umzekelo, isaci, inkcazelo yabantwana, njalo njalo) uze ubhale inqaku elifutshane. Lifika ngqo kwiqela kwaye yonke ingxelo iyajongwa.",
              "Musa ukukhathazeka ngokuba nobunzulu obugqithisileyo. Isichazi-magama siphucuka ngokukhawuleza ngale ngxelo kunangayo nantoni na enye.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Imo yabantwana ayiyitshintshi inkcazelo.",
            a: [
              "Imo yabantwana itshintsha kuphela isicatshulwa apho igama sele linenkcazelo elungele abantwana eyenziweyo. Kumagama amatsha osandula ukuwakhangela, nika imizuzwana eli-10 ukuya kweli-15. Uhlobo olulungele abantwana lwenziwa ngoko nangoko okokuqala.",
              "Kwakhona: imo yabantwana ifuna i-Clear okanye i-Deep. Ukuba ukwi-Basic, iswitshi iza kukucela ukuba unyusele. Abasebenzisi abangaziwayo bacelwa ukuba babhalise.",
            ],
          },
          {
            id: "voice-fails",
            q: "Ukukhangela ngelizwi akusebenzi.",
            a: [
              "Ukukhangela ngelizwi kufuna imvume yemayikrofoni. Uninzi lweebhrawuza zibuza kanye kwisiza ngasinye. Ukuba ucofe ngempazamo uBlock, kuza kufuneka uyibuyisele ngesandla: cofa umqondiso wesitshixo okanye wolwazi ecaleni kwe-gadit.app kwibha yedilesi, emva koko Site settings, emva koko Microphone, emva koko Allow.",
              "Kwi-Safari ye-iOS, ukufikelela kwimayikrofoni kukwafuna iswitshi kwi-Settings → Safari → Microphone. Ilizwi okwangoku luphawu lwe-Clear ne-Deep: abasebenzisi be-Basic babona isicelo sokunyusela, abatyeleli abangangenanga babona isicelo sokungena.",
            ],
          },
          {
            id: "no-image",
            q: "Andikwazi ukwenza umfanekiso wegama.",
            a: [
              "Ukwenza imifanekiso luphawu lwe-Clear okanye lwe-Deep olunesabelo senyanga. I-Clear ifumana imifanekiso engama-30 ngenyanga, i-Deep ifumana eli-100. Ukuba usisebenzisile isabelo sonke, uza kubona udonga. Siqala ngokutsha ngomhla woku-1 wenyanga nganye.",
              "Ukuba ungaphantsi kwesabelo kwaye usabona ukusilela, kudla ngokuba yingxaki yethutyana. Zama kwakhona emva kwemizuzwana engama-30. Ukusilela okuqhubekayo yimpazamo kwinkqubo. Nceda uyixele kwiphepha legama.",
            ],
          },
          {
            id: "save-word",
            q: "Ndiligcina njani igama kwincwadi yam?",
            a: [
              "Kulo naliphi na iphepha leziphumo zegama, cofa Gcina encwadini kufutshane nesihloko. Incwadi luphawu lwe-Clear ne-Deep apho unokuphinda ujonge amagama agciniweyo kamva, uwabone kwimbonakalo yomnyele, kwaye wenze iiseshoni zokuziqhelisa okukrelekrele (Deep).",
              "Amagama owagcinileyo nowavule ubuncinane kanye ayafumaneka ungekho kwi-intanethi kwi-cache yesixhobo. Ipakethe yokufunda ungekho kwi-intanethi ikwagcina amagama athandwa kakhulu kulwimi lwakho ukuze ulungele ngaphandle kwe-intanethi.",
            ],
          },
          {
            id: "offline",
            q: "Isebenza njani imo yokungabikho kwi-intanethi?",
            a: [
              "Amagama osele uwajongile agcinwa kwisixhobo sakho. Wavule kwakhona ngaphandle kwe-intanethi kwaye ayalayisha ngoko nangoko. Ipakethe epheleleyo yokufunda ungekho kwi-intanethi (amagama aphambili kulwimi lwakho) ikhutshelwa xa uyicela kwiphepha lencwadi.",
              "Ukukhangela igama elitsha ngokupheleleyo kusafuna unxibelelwano, kuba i-Gadit kufuneka yenze intsingiselo ukusukela ekuqaleni. I-cache yokungabikho kwi-intanethi ingeyamagama osele uwaphononongile.",
            ],
          },
          {
            id: "slow",
            q: "Iapp ibonakala icotha.",
            a: [
              "Ukhangelo lokuqala lwegama lolona lucothayo kuba i-Gadit yenza isiphumo esipheleleyo ukusukela ekuqaleni: kudla ngokuba yimizuzwana embalwa, ngamanye amaxesha ixesha elide kumagama antsonkothileyo. Ukhangelo olulandelayo lwegama elo lukhawuleza kakhulu, luvela kwi-cache.",
              "Ukuba yonke into ibonakala icotha, zama ukuhlaziya ngokupheleleyo: Cmd+Shift+R kwi-Mac, Ctrl+Shift+R kwi-Windows. Ukuba ukucotha kuqhubeka kuwo onke amaphepha, nceda usithumelele i-imeyile ngelizwe lakho nebhrawuza yakho ukuze iqela lijonge indlela yenethiwekhi ukusuka kummandla wakho ukuya kwiiseva zethu.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ndikhangele igama kodwa andafumana siphumo. Kwenzeka ntoni?",
            a: [
              "Okokuqala, jonga upelo. Gadit iyakwazi ukulungisa iimpazamo ezincinci zokuchwetheza ixesha elininzi, kodwa isikhamiso esingachanekanga okanye unobumba ongekhoyo kunokuyiphazamisa. Zama ulungiso olucetyiswayo ukuba luyavela.",
              "Ngaphezu koko: amagama anqabileyo kakhulu okanye esitsotsi asenokungabuyisi siphumo esiqinisekileyo. Ukuba uqinisekile ukuba igama likhona ngokwenene, cofa iqhosha elithi Xela kwiphepha leziphumo (okanye kwisikrini sempazamo) usazise. Yonke ingxelo iyajongwa kwaye amagama aphosiweyo ngokwenene afakwa kwakhona kwinkqubo.",
            ],
          },
          {
            id: "change-language",
            q: "Ndilutshintsha njani ulwimi lojongano?",
            a: [
              "Phezulu ekunene kulo naliphi na iphepha, uza kubona umqondiso omncinci wefleyiki (okanye igama lolwimi lwakho lwangoku). Wucofe uze ukhethe kwiilwimi ezingaphezu kwama-30: isiNgesi, isiGrike, isiHebhere, isiArabhu, isiRashiya, isiSpanish, isiPhuthukezi, isiFrentshi, isiJamani, isiCzech, isiSlovak, isiTaliyane, isiJapan, isiHindi, isiAmharic, isiZulu.",
              "Ukhetho lwakho lugcinwa kwesi sixhobo. Yonke into iphinda ilayishe ngolwimi olutsha: ujongano, iimenyu, iintsingiselo zamagama ezizayo, imizekelo, iinkcazelo zabantwana, nkqu nemvelaphi. Iziphumo esele zigcinwe ngolwimi oludala zihlala de uphinde uwakhangele loo magama.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Inkqubo yamaqabane",
        items: [
          {
            id: "join-partner",
            q: "Ndiba njani liqabane le-Gadit?",
            a: [
              "Vula /partners kulo naliphi na iphepha uze ucofe \"Yiba liqabane\". Bhalisa ngegama lakho ne-imeyile, kwaye ilinki yakho ekhethekileyo yokucebisa kunye nebhodi yokulandelela ukucofa neekhomishini zilunga ngoko nangoko. Akukho kulinda kuvunywa.",
              "Ukujoyina kusimahla kwaye kuvulelekile kuwo wonke umntu. Akufuneki ube nomrhumo we-Gadit ukuze ube liqabane.",
            ],
          },
          {
            id: "commission-model",
            q: "Zibalwa njani iikhomishini?",
            a: [
              "Imiqathango esemgangathweni yi-25% yayo yonke intlawulo eyenziwa ngumthengi kunyaka wakhe wokuqala. Emva kwaloo nyaka wokuqala, ufumana i-10% yayo yonke intlawulo lo gama nje umthengi esaqhubeka ehlawula.",
              "Oku kusebenza ngendlela efanayo kwizicwangciso zenyanga nezonyaka, kuba ikhomishini ibalwa kwintlawulo nganye yokwenyani. Ukuba umthengi uyarhoxisa, ikhomishini yakho iyayeka kwintlawulo yakhe yokugqibela.",
              "Iqela lingamisela amazinga ahlukeneyo kumaqabane athile. Amazinga akho asoloko evela kwibhodi yakho yeqabane, onokuyifikelela kwi-/partners.",
            ],
          },
          {
            id: "payout",
            q: "Ndihlawulwa nini?",
            a: [
              "Ngenyanga, xa ibhalansi yakho idlula i-$50. Sisebenzisa indlela yokuhlawula oyimisele kwibhodi yeqabane (ukudlulisela ebhankini, i-PayPal, njalo njalo). I-$50 ngumda ophantsi, ayingomda uphezulu. Ungazuza okungakumbi kakhulu, ufumana nje intlawulo xa udlula loo mda.",
              "Iikhomishini zikhutshwa kwiintsuku ezingama-30 emva kwentlawulo yomrhumo, ukuze kuvunyelwe ixesha lembuyekezo. Ngoko umrhumo kaJanuwari ukhutshwa ekuqaleni kukaFebruwari kwaye ungena kwintlawulo yakho elandelayo xa ibhalansi yakho idlula i-$50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ndijoyinile kodwa ibhodi yam ayinanto.",
            a: [
              "Amanani avela emva kokucofa kokuqala kwilinki yakho. Ukungabi nanto kuthetha nje ukuba akukabikho mntu uyicofileyo. Hamba wabelane ngelinki. Ibhodi ihlaziywa phantse ngoko nangoko xa umsebenzi uqalisa.",
              "Ukuba wabelene kwaye umntu ebhalisile kodwa ibhodi ayibonisi oko, sibhalele ngexesha eliqikelelweyo lokubhalisa kwaye iqela liza kujonga ukuba kubalelwe ngubani.",
            ],
          },
          {
            id: "attribution-window",
            q: "Ilinki yam yokucebisa iyamlandela umtyeleli ixesha elingakanani?",
            a: [
              "Iintsuku ezingamashumi amathandathu. Xa umtyeleli ecofa ilinki yakho, sibeka i-cookie ekuchonga njengomcebisi. Ukuba bayabhalisa kwaye bahlawule umrhumo nanini na kwiintsuku ezingama-60 ezilandelayo (nokuba bayasishiya isiza baze babuye kamva ngokukhangela kwi-Google), ukubalelwa kusaya kuwe.",
              "Ukucocwa kwee-cookie: ukuba umtyeleli ucoca ii-cookie zakhe okanye utshintsha ibhrawuza/isixhobo ngaphambi kokuba abhalise, ukubalelwa kunokulahleka. Akukho ndlela yokukuphepha oko, kodwa iintsuku ezingama-60 lixesha elide xa uthelekisa neenkqubo ezininzi zamaqabane.",
            ],
          },
          {
            id: "missing-commission",
            q: "Umntu ubhalise ngelinki yam kodwa andiyiboni ikhomishini.",
            a: [
              "Ixesha elininzi oku kungenxa yexesha: ukubhalisa kuvela kwibhodi kwimizuzu embalwa, kodwa ikhomishini ibhalwa kuphela xa umrhumo uhlawulwe ngokwenene (okunokuba ziintsuku kamva ukuba bakuvavanyo lwasimahla). Phinda ujonge emva kokuba uvavanyo luphele.",
              "Ukuba umrhumo uhlawulwe kodwa usayiboni ikhomishini emva kweeyure ezingama-48, sibhalele ngexesha eliqikelelweyo lokubhalisa kunye ne-imeyile okanye igama elimalunga lombhalisi ukuba uyalazi. Iqela liza kuphonononga ukulandelelana kokubalelwa kwaye lilungise nayiphi na into ephosiweyo ngesandla.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Ngokubanzi",
        items: [
          {
            id: "what-is-gadit",
            q: "Yintoni i-Gadit?",
            a: [
              "Isichazi-magama seelwimi ezininzi esakhelwe ukwenza igama liqondakale, hayi nje ukunika intsingiselo yomgca omnye. Igama ngalinye livuleka nazo zonke iintsingiselo zalo, imizekelo yokwenyani kwintsingiselo nganye, izaci, imvelaphi, umfanekiso ongenyanzelekanga, kunye (nge-Clear ne-Deep) nenkcazelo elungele abantwana, ukubhala esakho isivakalisi nengxelo, nemibuzo.",
              "Okwangoku zingaphezu kwama-30 iilwimi zojongano. Ngaphakathi, iqela likubiza ngokuthi yenza i-GAD kwigama: ukuqonda igama ukuya esiphelweni, hayi nje ukuliguqulela.",
            ],
          },
          {
            id: "languages",
            q: "Zeziphi iilwimi enizixhasayo?",
            a: [
              "Ujongano: isiNgesi, isiGrike, isiHebhere, isiArabhu, isiRashiya, isiSpanish, isiPhuthukezi, isiFrentshi, isiJamani, isiCzech, isiSlovak, isiTaliyane, isiJapan, isiZulu.",
              "Ungakhangela igama nangaluphi na kwezo lwimi uze ufumane intsingiselo, imizekelo nayo yonke enye into ngolwimi lojongano olukhethileyo. IsiHebhere nesiArabhu zibhalwa ngokupheleleyo ukusuka ekunene ukuya ekhohlo kwaye zisebenzisa oonobumba bazo bemveli.",
            ],
          },
          {
            id: "kid-safety",
            q: "Ingaba i-Gadit ikhuselekile kubantwana?",
            a: [
              "Gadit yenzelwe ukuba umzali ayisebenzise ngokukhuselekileyo ecaleni komntwana. Imo yabantwana ivelisa iinkcazelo ezilula, ezicacileyo nezifanele ubudala (malunga nenqanaba leminyaka emi-5 ukuya kweli-10), isebenzisa injini efanayo eqhuba umxholo wabantu abadala enemiyalelo ecacileyo yokwenza lula. Akukho mxholo wenziwe ngabasebenzisi ukhe uboniswe abantwana.",
              "Ngokuhambelana nemigaqo-nkqubo yethu nemithetho yobucala babantwana kwihlabathi liphela, ubunini beakhawunti obuzimeleyo bungowabaneminyaka eli-13 nangaphezulu. Indlela esemgangathweni yiakhawunti yomzali umzali ayisebenzisa kunye nomntwana wakhe, kwaye kanye yile nto iMo yabantwana yakhelwe yona.",
            ],
          },
          {
            id: "data",
            q: "Zigcinwa phi iinkcukacha zam? Ingaba niyazithengisa?",
            a: [
              "Iakhawunti, imbali, incwadi nemifanekiso eyenziweyo zigcinwa ngokukhuselekileyo kwi-Firebase, zifihlwe ngekhowudi xa zigciniwe. Asizithengiseli mntu iinkcukacha zakho. Sabelana kuphela ngoko kufunekayo ukuqhuba i-Gadit (ukugcina, iintlawulo, ababoneleli bomxholo), njengoko kuchaziwe kuMgaqo-nkqubo wabucala.",
              "Ungayikhupha incwadi yakho okanye ucime iakhawunti yakho nanini na kwiphepha leAkhawunti.",
            ],
          },
          {
            id: "contact-direct",
            q: "Ndinifikelela njani ngqo?",
            a: [
              "Sebenzisa iqhosha le-imeyile elingezantsi kweli phepha. Liya ngqo kwibhokisi yeposi yeqela. Wonke umyalezo uyafundwa kwaye uphendulwa kwiiyure ezingama-24 ukuya kwezingama-48 (kaninzi ngokukhawuleza).",
              "I-imeyile ingcono kunencoko kwinkxaso: inika iqela ithuba lokufunda ngononophelo nokuphendula ngokucingisisa. Inkxaso ngefowuni ayikanikezelwa okwangoku.",
            ],
          },
        ],
      },
    ],
  },
  nso: {
    eyebrow: "Senthara ya Thušo",
    heading: "Hwetša karabo, ka pela.",
    lede: "Dipotšišo tše di tlwaelegilego le ditharollo tša kgato ka kgato, di rulagantšwe go ya ka dihlogo. Ge o sa bone bothata bja gago, ikgokaganye le sehlopha ka fase.",
    stillNeedHelpHeading: "O sa kgomaretšwe?",
    stillNeedHelpBody: "Re ngwalele thwii. Molaetša o mongwe le o mongwe o balwa ke sehlopha gomme o hwetša karabo ka gare ga letšatši goba a mabedi.",
    emailCta: "Re romele imeile",
    responseTime: "Gantši re araba: ka gare ga diiri tše 24 go ya go tše 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ditefo le peeletšo",
        items: [
          {
            id: "change-card",
            q: "Nka fetoša bjang karata ya sekoloto ya peeletšo ya ka?",
            a: [
              "O ka fetogela go karata ye mpsha ka nako ye nnyane go feta motsotso ntle le go khansela. Peeletšo ya gago ya bjale e tšwela pele, eupša ka karata ye mpsha.",
              "1. Tsena go gadit.app gomme o bule letlakala la gago la Akhaonto (godimo ka go le letona). 2. Kgotla \"Laola ditefo\". 3. Letlakala le le šireletšegilego la Stripe le a bulega. Kgotla \"Add payment method\", tsenya karata ye mpsha, gomme o e swaye bjalo ka Default. 4. Ge o rata, tloša karata ya kgale.",
              "Go tloga nakong ye e latelago ya tefo, tšohle di ya go karata ye mpsha. Tefo ya pele (ye e šetšego e lefilwe) e dula go karata ya kgale. Ga go nyakege go bušetšwa tšhelete ntle le ge o e nyaka ka nnete.",
            ],
          },
          {
            id: "cancel",
            q: "Nka khansela bjang peeletšo ya ka?",
            a: [
              "O itirela ka bowena, nako efe goba efe. Tsena, bula Akhaonto, gomme o kgotle Khansela peeletšo ka tlase ga leano la gago.",
              "Phihlelelo ya gago e tšwela pele go fihla mafelelong a nako yeo o šetšego o e lefetše. Ka morago ga fao akhaonto e boela go Basic (mahala). Mantšu ao o a bolokilego, histori le puku ya mantšu di dula di bolokegile e bile di a hwetšagala.",
              "Ge o khansela ka phošo goba o fetoša monagano, o ka tšwetša pele peeletšo go tšwa letlakaleng le le swanago pele nako e fela.",
            ],
          },
          {
            id: "switch-plan",
            q: "Nka fetoga bjang go tloga go Clear go ya go Deep (goba ka tsela ye nngwe)?",
            a: [
              "Akhaonto, ke moka Laola ditefo, ke moka Update subscription. Kgetha leano le leswa.",
              "Stripe e bala phapano ya theko ka bowona, go ya ka matšatši ao a šetšego nakong ya bjale. Ge o kaonafatša, o tla lefišwa fela phapano bakeng sa nako ye e šetšego. Ge o fetogela go legato la tlase, tšhelete ye e šetšego e šomišwa tefong ya gago ye e latelago.",
            ],
          },
          {
            id: "invoice",
            q: "Nka laolla bjang invoice goba rasiti?",
            a: [
              "Akhaonto, ke moka Laola ditefo, ke moka Invoice history. Tefo ye nngwe le ye nngwe e na le rasiti ya PDF ye e laollegago ye e nago le dintlha tša tefo tšeo o di bolokilego.",
              "Ge o nyaka leina, aterese goba nomoro ya motšhelo ye e fapanego go invoice (mohlala leina la khamphani bakeng sa motšhelo), mpshafatša dintlha tša gago tša tefo letlakaleng le le swanago pele o laolla. Rasiti ye e latelago e tla šomiša dintlha tše mpsha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ke kgotlile Laola ditefo eupša ka hwetša phošo. Bjale?",
            a: [
              "Go na le mabaka a mabedi a tlwaelegilego. La pele, akhaonto ya gago ga e na peeletšo ya Stripe ye e šomago. La bobedi, Stripe e ka ba e se na profaele ye e feletšego ya ditefo ya akhaonto ya gago.",
              "Tekolo ya mathomo ye bonolo: tšwa, o tsene gape ka imeile ye o e šomišitšego ge o be o lefa, o leke gape. Ge e sa palelwa, ikgokaganye le rena ka imeile ya akhaonto ya gago gomme sehlopha se tla e lokiša ka lehlakoreng la rena ka motsotso.",
            ],
          },
          {
            id: "autorenew",
            q: "Na peeletšo ya ka e tla mpshafala ka bowona?",
            a: [
              "Ee. Maano a kgwedi a mpshafala kgwedi ye nngwe le ye nngwe, maano a ngwaga a mpshafala ngwaga o mongwe le o mongwe ka letšatši le le swanago. O ka bona letšatši la tefo ye e latelago akhaontong ya gago le phothaleng ya Stripe.",
              "Ge o sa nyake go mpshafatšwa ka bowona, khansela nako efe goba efe pele ga letšatši la mpshafatšo. Go khansela ga go direge gateetee. O dula o na le phihlelelo go fihla mafelelong a nako yeo o šetšego o e lefetše.",
            ],
          },
          {
            id: "refund",
            q: "Na nka bušetšwa tšhelete?",
            a: [
              "Ee. Ge theko e dirilwe ka gare ga matšatši a 14 gomme tirelo e sa šomišwa kudu, re ngwalele ka imeile ya akhaonto ya gago le lengwalwana le lekopana la gore ke ka lebaka la eng. Dipušetšo tšeo di dumelelwa ntle le kgang.",
              "Ge e le go feta matšatši a 14, sehlopha se e lekola ka nngwe ka nngwe. Khansela peeletšo gore e se tšwele pele e mpshafala, gomme o re romele imeile.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ke bona tefo ye ke sa e tsebego.",
            a: [
              "Ditefo di bonagala bjalo ka GADIT goba GADIT.APP ka $2.99 (Clear ya kgwedi), $4.99 (Deep ya kgwedi), $29.99 (Clear ya ngwaga), goba $49.99 (Deep ya ngwaga). Ge e sa sepelelane, e ka ba e tšwa tirelong ye nngwe.",
              "Ge o kgonthišegile gore ga se ya gago, o se ke wa ganetša ka panka ya gago gabjale. Re ngwalele thwii pele ka letšatši le tšhelete. Sehlopha se tla e hwetša, sa hlaloša gore ke eng, gomme sa bušetša tšhelete ge go nyakega. Kganetšo ya panka e ka dira gore ditefo tša ka moso di be thata, ka fao go e rarolla ka thušo gantši go a akgofa e bile go bolokegile.",
            ],
          },
          {
            id: "failed-payment",
            q: "Tefo ya ka e paletšwe. Ke dire eng?",
            a: [
              "Stripe e leka gape ka bowona ditefo tše di paletšwego ga mmalwa matšatšing a a latelago. Bontši bja diphošo di a rarollega ka botšona ge panka e lokolla thibelo goba karata e na le tšhelete ye e lekanego.",
              "Ge o nyaka go e lokiša gateetee, eya go Akhaonto → Laola ditefo → Add payment method, tsenya karata ye e šomago, gomme o e beakanye bjalo ka Default. Stripe e tla leka gape tefo ye e paletšwego gateetee ka karata ye mpsha. Ge e ba peeletšo ya gago e šetše e boetše go Basic, o ka ingwadiša gape go tšwa go Ditheko gomme puku ya gago ya mantšu e dula e le gona.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Phapano ke eng magareng ga Basic, Clear le Deep?",
            a: [
              "Basic (mahala): go fihla go dinyakišišo tše 20 tša mantšu ka letšatši, ditlhalošo ka moka, mehlala ya tlhalošo ye nngwe le ye nngwe, dika, le mothopo wa lentšu. Ga go nyakege go ingwadiša bakeng sa dinyakišišo tša motheo.",
              "Clear ($2.99/kgwedi goba $29.99/ngwaga): dinyakišišo tše di sa felego, ditlhalošo tše di loketšego bana, seswantšho sa lentšu le lengwe le le lengwe (30/kgwedi), go ngwala lefoko la gago le dikarabelo, dintlha tša dika, le histori ya dinyakišišo ya matšatši a 30.",
              "Deep ($4.99/kgwedi goba $49.99/ngwaga): tšohle tša Clear, gape le ditlhahlobo tša tlwaetšo, puku ya mantšu ya motho ka noši le tlwaetšo ye bohlale ya poeletšo ka dikgaukano, go aroganya mantšu a a swanago, le diswantšho tše dintši (100/kgwedi).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akhaonto le go tsena",
        items: [
          {
            id: "no-verification-email",
            q: "Ga ke a hwetša imeile ya ka ya go kgonthiša.",
            a: [
              "Lekola pele difoltara tša spam le tša dipapatšo. Ka nako ye nngwe Gmail le Outlook di romela diimeile tša akhaonto moo go fihlela o swaya e nngwe bjalo ka \"Not spam\".",
              "Ge e se gona, imeile e ka ba e ngwadilwe ka phošo ge o ingwadiša. Leka go ingwadiša gape gomme o lekole aterese gabotse. Ge o ingwadišitše ka Google, ga go nyakege imeile ya go kgonthiša.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ke lebetše phasewete ya ka.",
            a: [
              "Bula lepokisi la go tsena gomme o kgotle \"O lebetše phasewete?\". Tsenya imeile ye o e šomišago go Gadit gomme o tla hwetša linki ya go fetoša phasewete ka gare ga motsotso goba ye mebedi.",
              "Ge imeile e sa fihle, lekola spam. Ge e sa fihle le gona, o ka ba o ingwadišitše ka Google go e na le imeile le phasewete. Leka konopo ya \"Tšwela pele ka Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ke kgonthišegile gore phasewete ya ka e nepagetše eupša e re \"Imeile goba phasewete e fošagetše\".",
            a: [
              "Go na le dilo tše tharo tša go lekola. Sa pele, capslock. Sa bobedi, sekgoba mafelelong ge o kopiša le go kgomaretša. Sa boraro, o ingwadišitše ka Google go e na le phasewete (šomiša \"Tšwela pele ka Google\" go e na le moo).",
              "O sa kgomaretšwe? Fetoša phasewete go tšwa lepokising le le swanago. Go go thomiša lefsa gabotse.",
            ],
          },
          {
            id: "google-fails",
            q: "Go tsena ka Google ga go šome.",
            a: [
              "Lebaka le le tlwaelegilego kudu: sefetleki sa gago se thibela dikhukhi tša batho ba bangwe goba mafasetere a go tšwelela bakeng sa gadit.app. Di dumelele ditumelelong tša bara ya aterese gomme o leke gape.",
              "Ge o le mokgweng wa incognito, go tsena ka Google go thibetšwe ka morero. Fetogela go lefasetere la tlwaelo la sefetleki.",
            ],
          },
          {
            id: "change-email",
            q: "Nka fetoša bjang imeile ya akhaonto ya ka?",
            a: [
              "Akhaonto, kgotla imeile ya gago, Fetoša imeile. O tla swanela ke go kgonthiša aterese ye mpsha pele e šoma. Peeletšo ya gago, histori le puku ya mantšu ka moka di a fetišetšwa.",
              "Ge imeile e tlemagantšwe le moreki wa Stripe, e mpshafatše le phothaleng ya ditefo ya Stripe gore dirasiti tša ka moso di ye atereseng ye mpsha.",
            ],
          },
          {
            id: "delete-account",
            q: "Nka phumola bjang akhaonto ya ka?",
            a: [
              "Akhaonto, ka fase ga letlakala, Phumola akhaonto. Se ke sa go ya go ile. Peeletšo ya gago e a khanselwa, puku ya gago ya mantšu le histori di a phumolwa, gomme imeile e lokologa bakeng sa go ingwadiša lefsa.",
              "Direkoto tša Stripe tša ditefo tša kgale di a dula (molao o re gapeletša go di boloka bakeng sa dipalo tša ditšhelete). Ga go se sengwe se se dulago.",
            ],
          },
          {
            id: "share-account",
            q: "Na molekane wa ka goba ngwana wa ka a ka abelana akhaonto ya ka?",
            a: [
              "Modiriši o tee yo a tsenego akhaontong ka nako. Mokgwa wa bana o dumelela akhaonto e tee ya Clear goba Deep go direla motswadi le ngwana: kgotla sefetoši gomme ditlhalošo di bonagala di loketše bana ntle le go tsena ka go arogana.",
              "Bakeng sa batho ba babedi ba bagolo bao ba nyakago dipuku tša mantšu le tšwelopele tše di arogilego, bula diakhaonto tše pedi. Clear ke $2.99 ka kgwedi go akhaonto ye nngwe le ye nngwe.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ke nagana gore ke na le diakhaonto tše pedi ka phošo. Bjale?",
            a: [
              "Se gantši se direga ge motho a ingwadiša gatee ka Google le gatee ka imeile le phasewete ka aterese ye e swanago, goba ge o ingwadiša gabedi ka diaterese tša imeile tše di fapanego. Go ingwadiša go go gongwe le go go gongwe go bula akhaonto ye e arogilego ya Gadit ye e nago le puku ya yona ya mantšu, histori le boemo bja peeletšo.",
              "Re ngwalele ka diaterese ka bobedi tša imeile (goba di-UID go tšwa letlakaleng la Akhaonto) le gore o nyaka go boloka efe. Sehlopha se tla kopanya dipuku tša mantšu le histori akhaontong ye o e kgethago, ke moka sa tswalela ye nngwe gabotse. Ga go tshedimošo ye e lahlegago.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Go šomiša Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ke nagana gore tlhalošo e fošagetše. Ke dire eng?",
            a: [
              "Letlakala le lengwe le le lengwe la sephetho le na le konopo ye nnyane ya \"Bega\" ka fase. E kgotle, kgetha mohuta (tlhalošo, mothopo wa lentšu, mohlala, seka, tlhalošo ya bana, bjalo bjalo) gomme o ngwale lengwalwana le lekopana. Le tla thwii go sehlopha gomme pego ye nngwe le ye nngwe e a lekolwa.",
              "O se tshwenyege ka go ba yo a hlokomelago kudu. Pukuntšu e kaonafala ka pela ka dikarabelo tše go feta ka selo se sengwe.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Mokgwa wa bana ga o fetoše tlhalošo.",
            a: [
              "Mokgwa wa bana o fetoša fela sengwalwa moo lentšu le šetšego le na le tlhalošo ye e loketšego bana ye e dirilwego. Bakeng sa mantšu a mafsa ao o sa tšwago go a nyaka, e fe metsotswana ye 10 go ya go ye 15. Kgatišo ye e loketšego bana e dirwa gateetee ka lekga la mathomo.",
              "Gape: Mokgwa wa bana o nyaka Clear goba Deep. Ge o le go Basic, sefetoši se tla go kgopela go kaonafatša. Badiriši bao ba sa tsebjego ba kgopelwa go ingwadiša.",
            ],
          },
          {
            id: "voice-fails",
            q: "Go nyaka ka lentšu ga go šome.",
            a: [
              "Go nyaka ka lentšu go nyaka tumelelo ya maekrofouno. Bontši bja difetleki di botšiša gatee go weposaete ye nngwe le ye nngwe. Ge o kgotlile Block ka phošo, o tla swanela ke go e bušetša ka seatla: kgotla leswao la senotlelo goba la tshedimošo kgauswi le gadit.app bareng ya aterese, ke moka Site settings, ke moka Microphone, ke moka Allow.",
              "Go Safari ya iOS, phihlelelo ya maekrofouno gape e nyaka sefetoši sa Settings → Safari → Microphone. Lentšu ga bjale ke karolo ya Clear le Deep: badiriši ba Basic ba bona kgopelo ya go kaonafatša, baeti bao ba sa tsenago ba bona kgopelo ya go tsena.",
            ],
          },
          {
            id: "no-image",
            q: "Ga ke kgone go dira seswantšho sa lentšu.",
            a: [
              "Go dira diswantšho ke karolo ya Clear goba Deep ye e nago le palo ya kgwedi. Clear e hwetša diswantšho tše 30 ka kgwedi, Deep e hwetša tše 100. Ge o šomišitše palo ka moka, o tla bona lepheko. E thoma lefsa ka la 1 la kgwedi ye nngwe le ye nngwe.",
              "Ge o sa le ka tlase ga palo gomme o sa bona diphošo, gantši ke tša nakwana. Leka gape ka morago ga metsotswana ye 30. Diphošo tše di tšwelago pele ke bothata. Hle bega go tšwa letlakaleng la lentšu.",
            ],
          },
          {
            id: "save-word",
            q: "Nka boloka bjang lentšu pukung ya ka ya mantšu?",
            a: [
              "Letlakaleng lefe goba lefe la sephetho sa lentšu, kgotla Boloka pukung kgauswi le sehlogo. Puku ya mantšu ke karolo ya Clear le Deep moo o ka boeletšago mantšu ao o a bolokilego ka morago, wa a bona ka pono ya sehlopha sa dinaledi, le go dira ditlwaetšo tše bohlale (Deep).",
              "Mantšu ao o a bolokilego gomme wa a bula bonyenyane gatee a hwetšagala ntle le inthanete go tšwa polokelong ya sedirišwa. Sephuthelwana sa ntle le inthanete gape se boloka mantšu ao a nyakwago kudu ka polelo ya gago gore o be o itokišitše ntle le inthanete.",
            ],
          },
          {
            id: "offline",
            q: "Mokgwa wa ntle le inthanete o šoma bjang?",
            a: [
              "Mantšu ao o šetšego o a bone a bolokwa sedirišweng sa gago. A bule gape ntle le inthanete gomme a laišega gateetee. Sephuthelwana ka moka sa ntle le inthanete (mantšu a ka pele ka polelo ya gago) se laollwa ge o se nyaka go tšwa letlakaleng la puku ya mantšu.",
              "Go nyaka lentšu le leswa go sa nyaka inthanete, ka gobane Gadit e swanetše go dira tlhalošo go tloga mathomong. Polokelo ya ntle le inthanete ke ya mantšu ao o šetšego o a hlahlobile.",
            ],
          },
          {
            id: "slow",
            q: "Tirišo e bonagala e nanya.",
            a: [
              "Nyakišišo ya mathomo ya lentšu ke yona ye e nanyago kudu ka gobane Gadit e dira sephetho ka moka go tloga mathomong: gantši metsotswana ye mmalwa, ka nako ye nngwe go feta bakeng sa mantšu a a raraganego. Dinyakišišo tše di latelago tša lentšu le le swanago di a akgofa, di tšwa polokelong.",
              "Ge tšohle di bonagala di nanya, leka go mpshafatša ka matla: Cmd+Shift+R go Mac, Ctrl+Shift+R go Windows. Ge go nanya go tšwela pele matlakaleng ka moka, hle re romele imeile ka naga ya gago le sefetleki gore sehlopha se lekole tsela ya neteweke go ya diseborong tša rena go tšwa tikologong ya gago.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ke nyakile lentšu eupša ka se hwetše sephetho. Go direga eng?",
            a: [
              "Sa pele, lekola mopeleto. Gadit gantši e kgona go šoma le diphošo tše nnyane, eupša ditlhaka tše di fošagetšego goba tlhaka ye e hlaelago di ka e gakantšha. Leka phošollo ye e šišintšwego ge e tšwelela.",
              "Ka ntle ga fao: mantšu a a sa tlwaelegago kudu goba a polelo ya mmileng a ka se bušetše sephetho se se kgonthišegilego. Ge o kgonthišegile gore lentšu ke la nnete, kgotla konopo ya Bega letlakaleng la sephetho (goba sekirining sa phošo) gomme o re tsebiše. Pego ye nngwe le ye nngwe e a lekolwa gomme mantšu a nnete ao a hlaetšego a tsenywa gape tshepedišong.",
            ],
          },
          {
            id: "change-language",
            q: "Nka fetoša bjang polelo ya tšhebedišo?",
            a: [
              "Godimo ka go le letona la letlakala lefe goba lefe, o tla bona leswao le lennyane la folaga (goba leina la polelo ya gago ya bjale). Le kgotle gomme o kgethe go tšwa dipolelong tše 30+: Seisemane, Segerika, Seheberu, Searabia, Serashia, Sepanish, Sepotokisi, Sefora, Sejeremane, Setšheke, Seslovakia, Setaliane, Sejapane, SeHindi, Seamhariki, Sezulu.",
              "Kgetho ya gago e bolokwa sedirišweng se. Tšohle di laišega gape ka polelo ye mpsha: tšhebedišo, mananeo, ditlhalošo tša mantšu tša ka moso, mehlala, ditlhalošo tša bana, le mothopo wa lentšu. Dipoelo tše di šetšego di bolokilwe ka polelo ya kgale di dula go fihlela o nyaka mantšu ao gape.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Lenaneo la balekane",
        items: [
          {
            id: "join-partner",
            q: "Nka ba bjang molekane wa Gadit?",
            a: [
              "Bula /partners go tšwa letlakaleng lefe goba lefe gomme o kgotle \"Become a partner\". Ingwadiše ka leina la gago le imeile, gomme linki ya gago ye e sa swanego le ye nngwe ya go šišinya gotee le letlakala la taolo la go latela dikgotlo le dikhomišene di lokile gateetee. Ga go go letela tumelelo.",
              "Go tsena ke mahala gomme go bulegetše mang le mang. Ga o nyake peeletšo ya Gadit gore o be molekane.",
            ],
          },
          {
            id: "commission-model",
            q: "Dikhomišene di balwa bjang?",
            a: [
              "Melawana ya tlwaelo ke 25% ya tefo ye nngwe le ye nngwe ye moreki a e dirago ngwageng wa gagwe wa mathomo. Ka morago ga ngwaga woo wa mathomo, o hwetša 10% ya tefo ye nngwe le ye nngwe go fihla ge moreki a tšwela pele a lefa.",
              "Se se šoma ka tsela ye e swanago go maano a kgwedi le a ngwaga, ka gobane khomišene e balwa tefong ye nngwe le ye nngwe ya nnete. Ge moreki a khansela, khomišene ya gago e fela ka tefo ya gagwe ya mafelelo.",
              "Sehlopha se ka beakanya dikhomišene tše di fapanego bakeng sa balekane ba itšego. Dikhomišene tša gago di bonagala ka mehla letlakaleng la gago la taolo la molekane, leo o ka le hwetšago go tšwa go /partners.",
            ],
          },
          {
            id: "payout",
            q: "Ke lefelwa neng?",
            a: [
              "Kgwedi le kgwedi, ge tšhelete ya gago e feta $50. Re šomiša mokgwa wa tefo wo o o beakantšego letlakaleng la taolo la molekane (phetišetšo ya panka, PayPal, bjalo bjalo). $50 ke bonyenyane bjo bo nyakegago, e sego mollwane. O ka hwetša go feta kudu, o amogela tefo fela ge o feta bonyenyane bjoo.",
              "Dikhomišene di lokollwa matšatši a 30 ka morago ga tefo ya peeletšo, go fa sebaka sa go bušetša tšhelete. Ka fao peeletšo ya Janaware e lokollwa mathomong a Feberware gomme e tsena tefong ya gago ye e latelago ge tšhelete ya gago e feta $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ke tsene eupša letlakala la ka la taolo ga le na selo.",
            a: [
              "Dipalo di bonagala ka morago ga kgotlo ya mathomo go linki ya gago. Go se be le selo go ra fela gore ga go eso be le yo a kgotlilego. Eya o abelane linki. Letlakala la taolo le mpshafala e ka ba gateetee ge mošomo o thoma.",
              "Ge o abelane gomme motho a ingwadišitše eupša letlakala la taolo le sa e bontšhe, re ngwalele ka nako ye e ka bago ya go ingwadiša gomme sehlopha se tla lekola go balelwa ga yona.",
            ],
          },
          {
            id: "attribution-window",
            q: "Linki ya ka ya go šišinya e latela moeti nako ye kae?",
            a: [
              "Matšatši a masometshela. Ge moeti a kgotla linki ya gago, re bea khukhi ye e go laetšago bjalo ka yo a mo rometšego. Ge a ingwadiša gomme a ngwadiša peeletšo nako efe goba efe matšatšing a 60 a a latelago (le ge a ka tloga weposaeteng gomme a boa ka morago ka nyakišišo ya Google), go balelwa go sa ya go wena.",
              "Go phumolwa ga dikhukhi: ge moeti a phumola dikhukhi tša gagwe goba a fetoša sefetleki/sedirišwa pele a ingwadiša, go balelwa go ka lahlega. Ga go tsela ya go phema seo, eupša matšatši a 60 ke nako ye telele ge e bapetšwa le mananeo a mantši a balekane.",
            ],
          },
          {
            id: "missing-commission",
            q: "Motho o ingwadišitše ka linki ya ka eupša ga ke bone khomišene.",
            a: [
              "Gantši ke taba ya nako: go ingwadiša go bonagala letlakaleng la taolo ka gare ga metsotso, eupša khomišene e ngwalwa fela ge peeletšo e lefilwe ka nnete (se se ka tšea matšatši ge e ba a le tekong ya mahala). Lekola gape ka morago ga ge teko e fela.",
              "Ge peeletšo e lefilwe eupša o sa bone khomišene ka morago ga diiri tše 48, re ngwalele ka nako ye e ka bago ya go ingwadiša le imeile goba leina la mongwadiši ge o le tseba. Sehlopha se tla nyakišiša tatelano ya go balelwa gomme se lokiše phošo efe goba efe ka seatla.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Kakaretšo",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit ke eng?",
            a: [
              "Pukuntšu ya dipolelo tše ntši ye e agetšwego go dira gore lentšu le kwagale, e sego fela go fa tlhalošo ya mothalo o tee. Lentšu le lengwe le le lengwe le bulega le na le ditlhalošo tša lona ka moka, mehlala ya nnete ya tlhalošo ye nngwe le ye nngwe, dika, mothopo wa lentšu, seswantšho se o ka se kgethago, le (ka Clear le Deep) tlhalošo ye e loketšego bana, go ngwala lefoko la gago le dikarabelo, le ditlhahlobo.",
              "Ga bjale dipolelo tše 30+ tša tšhebedišo. Ka gare ga sehlopha re e bitša go GAD lentšu: go kwešiša lentšu ka botlalo, e sego fela go le fetolela.",
            ],
          },
          {
            id: "languages",
            q: "Le thekga dipolelo dife?",
            a: [
              "Tšhebedišo: Seisemane, Segerika, Seheberu, Searabia, Serashia, Sepanish, Sepotokisi, Sefora, Sejeremane, Setšheke, Seslovakia, Setaliane, Sejapane, Sezulu.",
              "O ka nyaka lentšu ka efe goba efe ya dipolelo tšeo gomme wa hwetša tlhalošo, mehlala le tšohle tše dingwe ka polelo ya tšhebedišo ye o e kgethilego. Seheberu le Searabia di ngwalwa ka botlalo go tloga go le letona go ya go le letshadi gomme di šomiša difonte tša tšona.",
            ],
          },
          {
            id: "kid-safety",
            q: "Na Gadit e bolokegile bakeng sa bana?",
            a: [
              "Gadit e diretšwe gore motswadi a e šomiše ka polokego gotee le ngwana. Mokgwa wa bana o tšweletša ditlhalošo tše bonolo, tše di kwagalago le tše di loketšego mengwaga (maemong a mengwaga ye 5 go ya go ye 10), o šomiša enjene ye e swanago le ye e dirago diteng tša batho ba bagolo, ka ditaelo tše di kwagalago tša go nolofatša. Ga go diteng tše di dirilwego ke badiriši tšeo di kilego tša bontšhwa bana.",
              "Go ya ka dipholisi tša rena le melao ya sephiri sa bana lefaseng ka bophara, go ba le akhaonto ka noši ke go tloga mengwageng ye 13 go ya godimo. Mokgwa wa tlwaelo ke akhaonto ya motswadi yeo motswadi a e šomišago gotee le ngwana wa gagwe, e lego seo Mokgwa wa bana o agetšwego sona.",
            ],
          },
          {
            id: "data",
            q: "Tshedimošo ya ka e bolokwa kae? Na le a e rekiša?",
            a: [
              "Akhaonto, histori, puku ya mantšu le diswantšho tše di dirilwego di bolokwa ka polokego go Firebase, di notletšwe polokelong. Ga re rekišetše motho le ge e le ofe tshedimošo ya gago. Re abelana fela seo se nyakegago go šomiša Gadit (polokelo, ditefo, bafepi ba diteng), bjalo ka ge go hlalošitšwe ka go Pholisi ya Sephiri.",
              "O ka ntšha puku ya gago ya mantšu goba wa phumola akhaonto ya gago nako efe goba efe go tšwa letlakaleng la Akhaonto.",
            ],
          },
          {
            id: "contact-direct",
            q: "Nka le hwetša bjang thwii?",
            a: [
              "Šomiša konopo ya imeile ka fase ga letlakala le. E ya thwii lepokising la diimeile la sehlopha. Molaetša o mongwe le o mongwe o a balwa gomme o hwetša karabo ka gare ga diiri tše 24 go ya go tše 48 (gantši ka pela go feta).",
              "Imeile e phala poledišano bakeng sa thušo: e fa sehlopha sebaka sa go bala ka tlhokomelo le go araba ka kelohloko. Thušo ka mogala ga e eso fiwe.",
            ],
          },
        ],
      },
    ],
  },
  tn: {
    eyebrow: "Lefelo la Thuso",
    heading: "Bona karabo, ka bonako.",
    lede: "Dipotso tse di tlwaelegileng le ditharabololo kgato ka kgato, di rulagantswe ka dikarolo. Fa o sa bone bothata jwa gago, ikgolaganye le setlhopha kwa tlase.",
    stillNeedHelpHeading: "A o sa ntse o kgoreletsegile?",
    stillNeedHelpBody: "Re kwalele ka tlhamalalo. Molaetsa mongwe le mongwe o balwa ke setlhopha mme o bona karabo mo letsatsing kgotsa a mabedi.",
    emailCta: "Re romelele imeile",
    responseTime: "Gantsi re araba mo diureng di le 24 go ya go 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Dituelo le ikwadiso",
        items: [
          {
            id: "change-card",
            q: "Ke fetola jang karata ya sekoloto mo ikwadisong ya me?",
            a: [
              "O ka fetolela go karata e ntšha mo nakong e e kwa tlase ga motsotso kwa ntle ga go khansela. Ikwadiso ya gago ya jaanong e tswelela, fela ka karata e ntšha.",
              "1. Tsena mo gadit.app mme o bule tsebe ya gago ya Akhaonto (kwa godimo ka fa mojeng). 2. Tobetsa \"Laola dituelo\". 3. Tsebe e e sireletsegileng ya Stripe e a bulega. Tobetsa \"Add payment method\", tsenya karata e ntšha, mme o e tshwaye e le ya Default. 4. Fa o batla, tlosa karata ya kgale.",
              "Go tloga mo nakong e e latelang ya tefo, sengwe le sengwe se ya mo karateng e ntšha. Tefo e e fetileng (e e setseng e duetswe) e nna mo karateng ya kgale. Ga go tlhokege go busediwa madi ntle le fa o a batla ka tlhamalalo.",
            ],
          },
          {
            id: "cancel",
            q: "Ke khansela jang ikwadiso ya me?",
            a: [
              "O itirela, nako nngwe le nngwe. Tsena, bula Akhaonto, mme o tobetse Khansela ikwadiso fa tlase ga leano la gago.",
              "Phitlhelelo ya gago e tswelela go fitlha kwa bofelong jwa nako e o setseng o e duetse. Morago ga foo akhaonto e boela kwa Basic (mahala). Mafoko a o a bolokileng, hisitori, le bukana di nna di babalesegile mme di a fitlhelelwa.",
              "Fa o khansela ka phoso kgotsa o fetola mogopolo, o ka tswelela ka ikwadiso mo tsebeng e e tshwanang pele nako e fela.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ke fetola jang go tswa mo Clear go ya go Deep (kgotsa go boela morago)?",
            a: [
              "Akhaonto, morago Laola dituelo, morago Ntšhafatsa ikwadiso. Tlhopha leano le leša.",
              "Stripe e bala pharologano ya tlhwatlhwa ka bo yone, go ya ka malatsi a a setseng mo nakong ya jaanong. Fa o tlhatlosa, o tla duedisiwa pharologano fela mo nakong e e setseng. Fa o fetolela kwa maemong a a kwa tlase, madi a a setseng a dirisiwa mo tefong ya gago e e latelang.",
            ],
          },
          {
            id: "invoice",
            q: "Ke laolela jang inwoisi kgotsa resiti?",
            a: [
              "Akhaonto, morago Laola dituelo, morago Hisitori ya diinwoisi. Tefo nngwe le nngwe e na le resiti ya PDF e o ka e laolelang e e nang le dintlha tsa tefo tse o di bolokileng.",
              "Fa o tlhoka leina le lengwe, aterese, kgotsa nomoro ya lekgetho mo inwoising (sekai leina la khampani ka ntlha ya lekgetho), ntšhafatsa dintlha tsa gago tsa tefo mo tsebeng e e tshwanang pele o laolela. Resiti e e latelang e tla dirisa dintlha tse dintšha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ke tobeditse Laola dituelo mme ka bona phoso. Jaanong?",
            a: [
              "Go na le mabaka a mabedi a a tlwaelegileng. La ntlha, akhaonto ya gago ga e na ikwadiso e e dirang ya Stripe. La bobedi, Stripe e ka tswa e ise e nne le porofaele e e feletseng ya tefo ya akhaonto ya gago.",
              "Tlhatlhobo ya ntlha e e bonolo: tswa, o boe o tsene ka imeile e o e dirisitseng fa o duela, mme o leke gape. Fa e sa ntse e palelwa, ikgolaganye le rona ka imeile ya akhaonto ya gago mme setlhopha se tla e baakanya ka fa letlhakoreng la rona mo motsotsong.",
            ],
          },
          {
            id: "autorenew",
            q: "A ikwadiso ya me e tla ntšhafala ka bo yone?",
            a: [
              "Ee. Maano a kgwedi a ntšhafala kgwedi nngwe le nngwe, maano a ngwaga a ntšhafala ngwaga nngwe le nngwe ka letlha le le tshwanang. O ka bona letlha la tefo e e latelang mo akhaontong ya gago le mo potaleng ya Stripe.",
              "Fa o sa batle go ntšhafala ka bo yone, khansela nako nngwe le nngwe pele ga letlha la go ntšhafatsa. Go khansela ga go diragale ka bonako. O nna le phitlhelelo go fitlha kwa bofelong jwa nako e o setseng o e duetse.",
            ],
          },
          {
            id: "refund",
            q: "A nka busediwa madi?",
            a: [
              "Ee. Fa theko e dirilwe mo malatsing a a kwa tlase ga 14 a a fetileng mme tirelo e sa dirisiwa thata, re kwalele ka imeile ya akhaonto ya gago le molaetsa o mokhutshwane wa gore goreng. Dituelo tseo di dumelelwa kwa ntle ga kgang.",
              "Fa go fetile malatsi a a fetang 14, setlhopha se tsamaisa kgang nngwe le nngwe ka bo yone. Khansela ikwadiso gore e se ka ya tswelela go ntšhafala, mme o re romelele imeile.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ke bona tefo e ke sa e itseng.",
            a: [
              "Dituelo di bonala e le GADIT kgotsa GADIT.APP ka $2.99 (Clear ya kgwedi), $4.99 (Deep ya kgwedi), $29.99 (Clear ya ngwaga), kgotsa $49.99 (Deep ya ngwaga). Fa e sa tsamaisane, e ka tswa e tswa mo tirelong e nngwe.",
              "Fa o tlhomamisegile gore ga se ya gago, o se ka wa ngongorega kwa bankeng ya gago jaanong. Pele re kwalele ka tlhamalalo ka letlha le palo ya madi. Setlhopha se tla e bona, se tlhalose gore ke eng, mme se busetse madi fa go tlhokega. Ngongorego ya banka e ka dira gore dituelo tsa isago di nne thata, ka jalo go e rarabolola ka thuso gantsi go bonako mme go babalesegile.",
            ],
          },
          {
            id: "failed-payment",
            q: "Tefo ya me e padile. Ke dire eng?",
            a: [
              "Stripe e leka gape dituelo tse di paletsweng ka bo yone makgetlho a le mmalwa mo malatsing a a latelang. Bontsi jwa go palelwa go a rarabologa fa banka e lokolola thibelo kgotsa fa karata e na le madi a a lekaneng.",
              "Fa o batla go e baakanya ka bonako, ya kwa Akhaonto → Laola dituelo → Add payment method, tsenya karata e e dirang, mme o e dire ya Default. Stripe e tla leka gape tefo e e paletsweng ka bonako ka karata e ntšha. Fa ikwadiso ya gago e setse e boetse kwa Basic, o ka ikwadisa gape mo Ditlhwatlhwa mme bukana ya gago e nna e ntse jalo.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Pharologano ke eng fa gare ga Basic, Clear, le Deep?",
            a: [
              "Basic (mahala): go fitlha dipatlo tsa mafoko di le 20 ka letsatsi, ditlhaloso tsotlhe, dikai mo tlhalosong nngwe le nngwe, dikapolelo, le tshimologo ya lefoko. Ga go tlhokege go ikwadisa mo dipatlong tsa motheo.",
              "Clear ($2.99/kgwedi kgotsa $29.99/ngwaga): dipatlo kwa ntle ga selekanyo, ditlhaloso tse di tshwanetseng bana, setshwantsho sa lefoko lengwe le lengwe (30/kgwedi), go kwala polelo ya gago o bone maikutlo, dintlha tsa dikapolelo, le hisitori ya dipatlo ya malatsi a le 30.",
              "Deep ($4.99/kgwedi kgotsa $49.99/ngwaga): sengwe le sengwe se se mo Clear, mmogo le ditlhatlhobo tsa boikatiso, bukana ya gago e e nang le boikatiso jo botlhale jwa go boeletsa ka nako, go farologanya mafoko a a tshwanang, le ditshwantsho di le dintsi (100/kgwedi).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akhaonto le go tsena",
        items: [
          {
            id: "no-verification-email",
            q: "Ga ke a amogela imeile ya go netefatsa.",
            a: [
              "Pele, tlhola mo difoleteng tsa spam le tsa dipapatso. Gmail le Outlook ka dinako tse dingwe di isa diimeile tsa akhaonto koo go fitlha o tshwaya nngwe e le \"Not spam\".",
              "Fa e se koo, imeile e ka tswa e kwadilwe phoso fa o ikwadisa. Leka go ikwadisa gape mme o tlhole aterese sentle. Fa o ikwadisitse ka Google, ga go tlhokege imeile ya go netefatsa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ke lebetse lefoko la me la sephiri.",
            a: [
              "Bula lebokoso la go tsena mme o tobetse \"A o lebetse lefoko la sephiri?\". Tsenya imeile e o e dirisang mo Gadit mme o tla amogela kgolagano ya go le fetola mo motsotsong kgotsa e le mebedi.",
              "Fa imeile e sa goroge, tlhola spam. Fa e sa ntse e sa goroge, o ka tswa o ikwadisitse ka Google go na le imeile le lefoko la sephiri. Leka konopo ya \"Tswelela ka Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ke tlhomamisegile gore lefoko la me la sephiri le siame mme go kwadilwe \"Imeile kgotsa lefoko la sephiri ga di a siama\".",
            a: [
              "Dilo di le tharo tsa go tlhola. Sa ntlha, capslock. Sa bobedi, sekgala kwa bofelong fa o kopolola. Sa boraro, o ikwadisitse ka Google go na le lefoko la sephiri (dirisa \"Tswelela ka Google\").",
              "A o sa ntse o kgoreletsegile? Fetola lefoko la sephiri mo lebokosong le le tshwanang. Go go simolodisa sešwa.",
            ],
          },
          {
            id: "google-fails",
            q: "Go tsena ka Google ga go dire.",
            a: [
              "Lebaka le le tlwaelegileng thata: sebatli sa gago se thibela di-cookie tsa batho ba bangwe kgotsa di-pop-up tsa gadit.app. Di letle mo ditetlelelong tsa mola wa aterese mme o leke gape.",
              "Fa o le mo mokgweng wa incognito, go tsena ka Google go thibetswe ka boomo. Fetolela kwa letlhabaphefong le le tlwaelegileng la sebatli.",
            ],
          },
          {
            id: "change-email",
            q: "Ke fetola jang imeile mo akhaontong ya me?",
            a: [
              "Akhaonto, tobetsa imeile ya gago, Fetola imeile. O tla tlhoka go tlhomamisa aterese e ntšha pele e dira. Ikwadiso ya gago, hisitori, le bukana tsotlhe di a fetisediwa.",
              "Fa imeile e golagane le moreki wa Stripe, e ntšhafatse le mo potaleng ya dituelo ya Stripe gore diresiti tsa isago di ye kwa aterese e ntšha.",
            ],
          },
          {
            id: "delete-account",
            q: "Ke phimola jang akhaonto ya me?",
            a: [
              "Akhaonto, kwa tlase ga tsebe, Phimola akhaonto. Se ke sa ka metlha. Ikwadiso ya gago e a khanselwa, bukana le hisitori di a phimolwa, mme imeile e a gololwa gore o ka ikwadisa sešwa.",
              "Direkoto tsa Stripe tsa dituelo tse di fetileng di a sala (molao o re patelela go di boloka ka ntlha ya dibuka tsa madi). Ga go na sepe se sengwe se se salang.",
            ],
          },
          {
            id: "share-account",
            q: "A molekane wa me kgotsa ngwana wa me a ka abelana akhaonto ya me?",
            a: [
              "Modirisi a le mongwe yo o tsenyeng mo akhaontong ka nako. Mokgwa wa bana o letla akhaonto e le nngwe ya Clear kgotsa Deep go direla motsadi le ngwana: fetola konopo mme ditlhaloso di bonala di tshwanetse bana kwa ntle ga go tsena go go farologaneng.",
              "Mo bagolong ba babedi ba mongwe le mongwe a batlang bukana le kgatelopele ya gagwe, dirang diakhaonto di le pedi. Clear ke $2.99 ka kgwedi mo akhaontong nngwe le nngwe.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ke akanya gore ke na le diakhaonto di le pedi ka phoso. Jaanong?",
            a: [
              "Se gantsi se diragala fa motho a ikwadisa gangwe ka Google mme gangwe ka imeile le lefoko la sephiri a dirisa aterese e e tshwanang, kgotsa fa o ikwadisa gabedi ka diaterese tse di farologaneng tsa imeile. Go ikwadisa gongwe le gongwe go dira akhaonto ya Gadit e e farologaneng e e nang le bukana, hisitori, le seemo sa ikwadiso sa yone.",
              "Re kwalele ka diaterese tsa imeile ka bobedi (kgotsa di-UID go tswa mo tsebeng ya Akhaonto) le gore ke efe e o batlang go e boloka. Setlhopha se tla kopanya dibukana le hisitori mo akhaontong e o e tlhophang, morago se tswale e nngwe sentle. Ga go na tshedimosetso e e latlhegang.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Go dirisa Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ke akanya gore tlhaloso e phoso. Ke dire eng?",
            a: [
              "Tsebe nngwe le nngwe ya dipholo e na le konopo e nnye ya \"Bega\" kwa tlase. E tobetse, tlhopha karolo (tlhaloso, tshimologo ya lefoko, sekai, kapolelo, tlhaloso ya bana, jalo le jalo) mme o kwale molaetsa o mokhutshwane. O tla ka tlhamalalo kwa setlhopheng mme pego nngwe le nngwe e a sekasekwa.",
              "O se tshwenyege ka go nna kelotlhoko thata. Thanodi e tokafala ka bonako go tswa mo maikutlong a go gaisa sepe se sengwe.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Mokgwa wa bana ga o fetole tlhaloso.",
            a: [
              "Mokgwa wa bana o fetola mokwalo fela fa lefoko le setse le na le tlhaloso e e tshwanetseng bana e e dirilweng. Mo mafokong a mašwa a o sa tswang go a batla, ema metsotswana e le 10 go ya go 15. Kgatiso ya bana e dirwa ka nako eo la ntlha.",
              "Gape: Mokgwa wa bana o tlhoka Clear kgotsa Deep. Fa o le mo Basic, konopo e tla go kopa go tlhatlosa. Badirisi ba ba sa itsiweng ba kopiwa go ikwadisa.",
            ],
          },
          {
            id: "voice-fails",
            q: "Go batla ka lentswe ga go dire.",
            a: [
              "Go batla ka lentswe go tlhoka tetla ya maekerofouno. Bontsi jwa dibatli di kopa gangwe mo setsheng sengwe le sengwe. Fa o tobeditse Block ka phoso, o tla tlhoka go e fetola ka seatla: tobetsa setshwantshwana sa senotlolo kgotsa sa tshedimosetso fa thoko ga gadit.app mo moleng wa aterese, morago Site settings, morago Microphone, morago Allow.",
              "Mo Safari ya iOS, phitlhelelo ya maekerofouno e tlhoka gape konopo ya Settings → Safari → Microphone. Lentswe ga jaana ke karolo ya Clear le Deep: badirisi ba Basic ba bona kopo ya go tlhatlosa, baeti ba ba sa tsenang ba bona kopo ya go tsena.",
            ],
          },
          {
            id: "no-image",
            q: "Ga ke kgone go dira setshwantsho sa lefoko.",
            a: [
              "Go dira ditshwantsho ke karolo ya Clear kgotsa Deep e e nang le selekanyo sa kgwedi. Clear e bona ditshwantsho di le 30 ka kgwedi, Deep e bona di le 100. Fa o dirisitse selekanyo sotlhe, o tla bona kgoreletso. E simolola sešwa ka la ntlha la kgwedi nngwe le nngwe.",
              "Fa o le kwa tlase ga selekanyo mme o sa ntse o bona go palelwa, gantsi ke ga nakwana. Leka gape morago ga metsotswana e le 30. Go palelwa go go tswelelang ke phoso. Tsweetswee e bege go tswa mo tsebeng ya lefoko.",
            ],
          },
          {
            id: "save-word",
            q: "Ke boloka jang lefoko mo bukaneng ya me?",
            a: [
              "Mo tsebeng nngwe le nngwe ya dipholo tsa lefoko, tobetsa Boloka mo bukaneng gaufi le setlhogo. Bukana ke karolo ya Clear le Deep e o ka boeletsang mafoko a o a bolokileng mo go yone moragonyana, wa a bona mo ponalong ya dinaledi, le go dira boikatiso jo botlhale (Deep).",
              "Mafoko a o a bolokileng mme wa a bula bonnye gangwe a fitlhelelwa kwa ntle ga inthanete go tswa mo polokelong ya sedirisiwa. Sephuthelo sa kwa ntle ga inthanete se boloka gape mafoko a a tumileng thata mo puong ya gago gore o nne o ipaakantse kwa ntle ga inthanete.",
            ],
          },
          {
            id: "offline",
            q: "Mokgwa wa kwa ntle ga inthanete o dira jang?",
            a: [
              "Mafoko a o setseng o a lebeletse a bolokwa mo sedirisweng. A bule gape kwa ntle ga inthanete mme a laisega ka bonako. Sephuthelo se se feletseng sa kwa ntle ga inthanete (mafoko a a kwa godimo mo puong ya gago) se laolelwa fa o se kopa go tswa mo tsebeng ya bukana.",
              "Go batla lefoko le leša go sa ntse go tlhoka inthanete, ka gonne Gadit e tshwanetse go dira tlhaloso go simolola kwa tshimologong. Polokelo ya kwa ntle ga inthanete ke ya mafoko a o setseng o a sekasekile.",
            ],
          },
          {
            id: "slow",
            q: "Tiriso e bonala e le bonya.",
            a: [
              "Patlo ya ntlha ya lefoko ke yone e e bonya thata ka gonne Gadit e dira dipholo tsotlhe go simolola kwa tshimologong: gantsi metsotswana e le mmalwa, ka dinako tse dingwe go feta mo mafokong a a raraaneng. Dipatlo tse di latelang tsa lefoko le le tshwanang di diragala ka bonako, go tswa mo polokelong.",
              "Fa sengwe le sengwe se bonala se le bonya, leka go simolola sešwa ka thata: Cmd+Shift+R mo Mac, Ctrl+Shift+R mo Windows. Fa bonya bo tswelela mo ditsebeng tsotlhe, tsweetswee re romelele imeile ka naga ya gago le sebatli gore setlhopha se tlhole tsela ya neteweke go ya kwa diserefareng tsa rona go tswa mo kgaolong ya gago.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ke batlile lefoko mme ka se bone dipholo. Go diragala eng?",
            a: [
              "Pele, tlhola mopeleto. Gadit gantsi e tsamaisa diphoso tse dinnye tsa go kwala, mme tumanosi e e phoso kgotsa tlhaka e e tlhaelang e ka e tlhakatlhakanya. Leka paakanyo e e akantsweng fa e bonala.",
              "Go feta foo: mafoko a a sa tlwaelegang thata kgotsa a puo ya mmila a ka se nne le dipholo tse di ikanyegang. Fa o tlhomamisegile gore lefoko ke la nnete, tobetsa konopo ya Bega mo tsebeng ya dipholo (kgotsa mo sekirining sa phoso) mme o re itsise. Pego nngwe le nngwe e a sekasekwa mme mafoko a nnete a a tlhaelang a tsenngwa mo thulaganyong.",
            ],
          },
          {
            id: "change-language",
            q: "Ke fetola jang puo ya tiriso?",
            a: [
              "Kwa godimo ka fa mojeng mo tsebeng nngwe le nngwe, o tla bona setshwantshwana se sennye sa folaga (kgotsa leina la puo ya gago ya jaanong). Se tobetse mme o tlhophe mo dipuong di le 30+: Sekgoa, Segerika, Sehebera, Searabia, Serashia, Sesepanishe, Sepotokisi, Sefora, Sejeremane, Setšheke, Seslovakia, Setaliana, Sejapane, Sehindi, Seamhariki, Sezulu.",
              "Tlhopho ya gago e bolokwa mo sedirisweng se. Sengwe le sengwe se laisega gape ka puo e ntšha: tiriso, malenaane, ditlhaloso tsa mafoko tsa isago, dikai, ditlhaloso tsa bana, le tshimologo ya lefoko. Dipholo tse di setseng di bolokilwe ka puo ya kgale di nna jalo go fitlha o batla mafoko ao gape.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Lenaneo la balekane",
        items: [
          {
            id: "join-partner",
            q: "Ke nna jang molekane wa Gadit?",
            a: [
              "Bula /partners go tswa mo tsebeng nngwe le nngwe mme o tobetse \"Nna molekane\". Ikwadise ka leina le imeile ya gago, mme kgolagano ya gago e e kgethegileng le lebota la go latela ditobetso le dikomishene di siametse ka bonako. Ga go na go letela tetla.",
              "Go tsena ke mahala mme go bulegetse mongwe le mongwe. Ga o tlhoke ikwadiso ya Gadit go nna molekane.",
            ],
          },
          {
            id: "commission-model",
            q: "Dikomishene di balwa jang?",
            a: [
              "Melawana e e tlwaelegileng ke 25% ya tefo nngwe le nngwe e moreki a e dirang mo ngwageng wa gagwe wa ntlha. Morago ga ngwaga oo wa ntlha, o kuna 10% ya tefo nngwe le nngwe fa fela moreki a ntse a duela.",
              "Se se dira ka tsela e e tshwanang mo maanong a kgwedi le a ngwaga, ka gonne komishene e balwa mo tefong nngwe le nngwe ya nnete. Fa moreki a khansela, komishene ya gago e emisa ka tefo ya gagwe ya bofelo.",
              "Setlhopha se ka baya dipalo tse di farologaneng mo balekaneng bangwe. Dipalo tsa gago di bonala ka metlha mo lebotong la gago la molekane, le o ka le fitlhelelang go tswa mo /partners.",
            ],
          },
          {
            id: "payout",
            q: "Ke duelwa leng?",
            a: [
              "Kgwedi le kgwedi, fa madi a gago a feta $50. Re dirisa tsela ya tefo e o e beileng mo lebotong la molekane (phetisetso ya banka, PayPal, jalo le jalo). $50 ke bonnye jo bo tlhokegang, e seng selekanyo sa bogolo. O ka kuna go feta thata, o amogela fela tefo fa o feta selekanyo seo.",
              "Dikomishene di lokollwa malatsi a le 30 morago ga tefo ya ikwadiso, go letla nako ya go busetsa madi. Ka jalo ikwadiso ya Ferikgong e lokollwa kwa tshimologong ya Tlhakole mme e tsena mo tefong ya gago e e latelang fa madi a gago a feta $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ke tsene mme lebota la me ga le na sepe.",
            a: [
              "Dipalo di bonala morago ga go tobetsa ga ntlha mo kgolaganong ya gago. Fa go se na sepe go raya fela gore ga go ise go nne le ope yo o tobetsang. Ya o abelane kgolagano. Lebota le ntšhafala ka bonako fa tiro e simolola.",
              "Fa o abetse mme mongwe a ikwadisitse mme lebota le sa se bontshe, re kwalele ka nako e e ka nnang ya go ikwadisa mme setlhopha se tla tlhola gore e tsewa e le ya ga mang.",
            ],
          },
          {
            id: "attribution-window",
            q: "Kgolagano ya me e latela moeti nako e e kae?",
            a: [
              "Malatsi a le masome a marataro. Fa moeti a tobetsa kgolagano ya gago, re baya cookie e e go supang jaaka yo o mo romileng. Fa a ikwadisa mme a duela nako nngwe le nngwe mo malatsing a le 60 a a latelang (le fa a tswa mo setsheng mme a boa moragonyana ka patlo ya Google), o sa ntse o bonwa e le wena.",
              "Go phimola di-cookie: fa moeti a phimola di-cookie tsa gagwe kgotsa a fetola sebatli/sedirisiwa pele a ikwadisa, kgolagano le wena e ka latlhega. Ga go na tsela ya go thibela seo, mme malatsi a le 60 ke nako e telele fa e bapisiwa le mananeo a mantsi a balekane.",
            ],
          },
          {
            id: "missing-commission",
            q: "Mongwe o ikwadisitse ka kgolagano ya me mme ga ke bone komishene.",
            a: [
              "Gantsi se ke ka ntlha ya nako: go ikwadisa go bonala mo lebotong mo metsotsong, mme komishene e kwalwa fela fa ikwadiso e duetswe tota (se se ka diragala malatsi morago fa a le mo tekong ya mahala). Tlhola gape morago ga fa teko e fela.",
              "Fa ikwadiso e duetswe mme o sa ntse o sa bone komishene morago ga diura di le 48, re kwalele ka nako e e ka nnang ya go ikwadisa le imeile kgotsa leina la moikwadisi fa o le itse. Setlhopha se tla sekaseka sentle mme se baakanye phoso epe ka seatla.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Kakaretso",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit ke eng?",
            a: [
              "Thanodi ya dipuo di le dintsi e e agetsweng go dira gore lefoko le tlhaloganyesege, e seng go naya tlhaloso ya mola o le mongwe fela. Lefoko lengwe le lengwe le bulega le na le ditlhaloso tsotlhe, dikai tsa nnete mo tlhalosong nngwe le nngwe, dikapolelo, tshimologo ya lefoko, setshwantsho fa o batla, mme (ka Clear le Deep) tlhaloso e e tshwanetseng bana, go kwala polelo ya gago o bone maikutlo, le ditlhatlhobo.",
              "Ga jaana go na le dipuo tsa tiriso di le 30+. Mo setlhopheng re e bitsa go GAD lefoko: go tlhaloganya lefoko go fitlha kwa bofelong, e seng go le fetolela fela.",
            ],
          },
          {
            id: "languages",
            q: "Lo dirisa dipuo dife?",
            a: [
              "Tiriso: Sekgoa, Segerika, Sehebera, Searabia, Serashia, Sesepanishe, Sepotokisi, Sefora, Sejeremane, Setšheke, Seslovakia, Setaliana, Sejapane, Sezulu.",
              "O ka batla lefoko ka nngwe ya dipuo tseo mme o bone tlhaloso, dikai, le sengwe le sengwe se sengwe ka puo ya tiriso e o e tlhophileng. Sehebera le Searabia di kwalwa go tswa mojeng go ya molemeng ka botlalo mme di dirisa mekwalo ya tsone.",
            ],
          },
          {
            id: "kid-safety",
            q: "A Gadit e babalesegile mo baneng?",
            a: [
              "Gadit e diretswe gore motsadi a e dirise ka polokesego mmogo le ngwana. Mokgwa wa bana o dira ditlhaloso tse di bonolo, tse di tlhamaletseng, tse di tshwanetseng dingwaga (ka nna maemo a dingwaga di le 5 go ya go 10), o dirisa enjene e e tshwanang e e dirang dikagare tsa bagolo ka ditaelo tse di tlhamaletseng tsa go nolofatsa. Ga go na dikagare tse di kwadilweng ke badirisi tse di bontshiwang bana.",
              "Go ya ka dipholisi tsa rona le melao ya sephiri sa bana mo lefatsheng lotlhe, go nna mong wa akhaonto a le esi ke go tloga ka dingwaga di le 13. Tsela e e tlwaelegileng ke akhaonto ya motsadi e motsadi a e dirisang mmogo le ngwana wa gagwe, e leng sone se Mokgwa wa bana o agetsweng sone.",
            ],
          },
          {
            id: "data",
            q: "Tshedimosetso ya me e bolokwa kae? A lo a e rekisa?",
            a: [
              "Akhaonto, hisitori, bukana, le ditshwantsho tse di dirilweng di bolokwa ka tsela e e sireletsegileng mo Firebase, di khoutilwe mo polokelong. Ga re rekisetse ope tshedimosetso ya gago. Re abelana fela se se tlhokegang go tsamaisa Gadit (polokelo, dituelo, batlamedi ba dikagare), jaaka go tlhalositswe mo Pholising ya Sephiri.",
              "O ka ntsha bukana ya gago kgotsa wa phimola akhaonto ya gago nako nngwe le nngwe go tswa mo tsebeng ya Akhaonto.",
            ],
          },
          {
            id: "contact-direct",
            q: "Nka lo fitlhelela jang ka tlhamalalo?",
            a: [
              "Dirisa konopo ya imeile kwa tlase ga tsebe e. E ya ka tlhamalalo kwa lebokosong la setlhopha. Molaetsa mongwe le mongwe o a balwa mme o bona karabo mo diureng di le 24 go ya go 48 (gantsi ka bonako go feta).",
              "Imeile e botoka go feta puisano ya chat mo thusong: e naya setlhopha sebaka sa go bala ka kelotlhoko le go araba sentle. Thuso ka mogala ga e ise e nne teng.",
            ],
          },
        ],
      },
    ],
  },
  st: {
    eyebrow: "Setsi sa Thuso",
    heading: "Fumana karabo, kapele.",
    lede: "Dipotso tse tlwaelehileng le ditharollo mohato ka mohato, di hlophisitswe ka dikarolo. Haeba o sa bone bothata ba hao, ikopanye le sehlopha ka tlase.",
    stillNeedHelpHeading: "O ntse o thatafallwa?",
    stillNeedHelpBody: "Re ngolle ka kotloloho. Molaetsa o mong le o mong o balwa ke sehlopha mme o fumana karabo nakong ya letsatsi kapa a mabedi.",
    emailCta: "Re romele imeile",
    responseTime: "Karabo e tlwaelehileng: nakong ya dihora tse 24 ho isa ho tse 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ditefo le ngodiso",
        items: [
          {
            id: "change-card",
            q: "Nka fetola karete ya mokitlane ngodisong ya ka jwang?",
            a: [
              "O ka fetohela karete e ntjha ka nako e ka tlase ho motsotso ntle le ho emisa. Ngodiso ya hao ya hajwale e tswela pele, empa ka karete e ntjha.",
              "1. Kena ho gadit.app mme o bule leqephe la hao la Akhaonte (hodimo ka ho le letona). 2. Tobetsa \"Laola ditefo\". 3. Leqephe le sireletsehileng la Stripe le a buleha. Tobetsa \"Add payment method\", kenya karete e ntjha, mme o e tshwaye e le ya Kamehla (Default). 4. Ha o rata, tlosa karete ya kgale.",
              "Ho tloha nakong e latelang ya tefo, tsohle di ya kareteng e ntjha. Tefo e fetileng (e seng e nkuwe) e dula kareteng ya kgale. Ha ho hlokahale ho kgutliswa tjhelete ntle le haeba o e batla ka ho kgetheha.",
            ],
          },
          {
            id: "cancel",
            q: "Nka emisa ngodiso ya ka jwang?",
            a: [
              "O iketsetsa yona, nako efe kapa efe. Kena, bula Akhaonte, mme o tobetse Emisa ngodiso ka tlase ho moralo wa hao.",
              "Phihlello ya hao e tswela pele ho fihlela qetellong ya nako eo o seng o e lefetse. Ka mora moo akhaonte e kgutlela ho Basic (mahala). Mantswe ao o a bolokileng, nalane, le bukana di dula di bolokehile mme di fumaneha.",
              "Haeba o emisa ka phoso kapa o fetola mohopolo, o ka tswela pele ka ngodiso leqepheng lona leo pele nako e fela.",
            ],
          },
          {
            id: "switch-plan",
            q: "Nka fetoha jwang ho tloha ho Clear ho ya ho Deep (kapa ka tsela e nngwe)?",
            a: [
              "Akhaonte, ebe Laola ditefo, ebe Update subscription. Kgetha moralo o motjha.",
              "Stripe e bala phapang ya theko ka bo yona, ho ya ka matsatsi a setseng nakong ya hajwale. Haeba o ntlafatsa, o tla lefiswa phapang feela bakeng sa nako e setseng. Haeba o fetohela mokgahlelong o tlase, tjhelete e setseng e sebediswa tefong ya hao e latelang.",
            ],
          },
          {
            id: "invoice",
            q: "Nka jarolla invoice kapa rasiti jwang?",
            a: [
              "Akhaonte, ebe Laola ditefo, ebe Invoice history. Tefo e nngwe le e nngwe e na le rasiti ya PDF e ka jarollwang e nang le dintlha tsa tefo tseo o di bolokileng.",
              "Haeba o hloka lebitso, aterese, kapa nomoro ya lekgetho e fapaneng ho invoice (mohlala lebitso la khampani bakeng sa lekgetho), ntjhafatsa dintlha tsa hao tsa tefo leqepheng lona leo pele o jarolla. Rasiti e latelang e tla sebedisa dintlha tse ntjha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ke tobeditse Laola ditefo empa ka fumana phoso. Ke etse eng jwale?",
            a: [
              "Ho na le disosa tse pedi tse tlwaelehileng. Ya pele, akhaonte ya hao ha e na ngodiso ya Stripe e sebetsang. Ya bobedi, Stripe e kanna ya se be le profaele e felletseng ya tefo bakeng sa akhaonte ya hao hajwale.",
              "Tlhahlobo ya pele e bonolo: tswa, o kene hape ka imeile eo o e sebedisitseng ha o lefa, mme o leke hape. Haeba e ntse e hloleha, ikopanye le rona ka imeile ya akhaonte ya hao mme sehlopha se tla e lokisa ka motsotso.",
            ],
          },
          {
            id: "autorenew",
            q: "Na ngodiso ya ka e tla ntjhafala ka bo yona?",
            a: [
              "E. Merero ya kgwedi e ntjhafala kgwedi le kgwedi, merero ya selemo e ntjhafala selemo le selemo ka letsatsi lona leo. O ka bona letsatsi la tefo e latelang akhaonteng ya hao le portal ya Stripe.",
              "Haeba o sa batle hore e ntjhafale ka bo yona, emisa nako efe kapa efe pele ho letsatsi la ntjhafatso. Ho emisa hase hang hang. O ntse o kena ho fihlela qetellong ya nako eo o seng o e lefetse.",
            ],
          },
          {
            id: "refund",
            q: "Na nka kgutlisetswa tjhelete?",
            a: [
              "E. Haeba theko e entswe nakong e ka tlase ho matsatsi a 14 mme tshebeletso e sa sebediswa haholo, re ngolle ka imeile ya akhaonte ya hao le molaetsa o mokgutshwane wa hore hobaneng. Ho kgutlisa tjhelete hoo ho dumellwa ntle le ngangisano.",
              "Haeba ho fetile matsatsi a 14, sehlopha se sheba taba ka nngwe ka nngwe. Emisa ngodiso hore e se ke ya tswela pele ho ntjhafala, mme o re romele imeile.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ke bona tefo eo ke sa e tsebeng.",
            a: [
              "Ditefo di hlaha e le GADIT kapa GADIT.APP ka $2.99 (Clear ka kgwedi), $4.99 (Deep ka kgwedi), $29.99 (Clear ka selemo), kapa $49.99 (Deep ka selemo). Haeba e sa tsamaisane, e kanna ya eba ya tshebeletso e nngwe.",
              "Haeba o na le bonnete ba hore hase ya hao, o se ke wa e hanyetsa bankeng ya hao hajwale. Re ngolle pele ka kotloloho ka letsatsi le tjhelete. Sehlopha se tla e fumana, se hlalose hore ke eng, mme se kgutlise tjhelete ha ho hlokahala. Kganetso ya banka e ka thatafatsa ditefo tsa nakong e tlang, kahoo ho e rarolla ka thuso ya rona hangata ho potlakile ebile ho bolokehile haholwanyane.",
            ],
          },
          {
            id: "failed-payment",
            q: "Tefo ya ka e hlolehile. Ke lokela ho etsa eng?",
            a: [
              "Stripe e leka hape ditefo tse hlolehileng ka bo yona ka makgetlo a mmalwa matsatsing a latelang. Boholo ba ho hloleha ho a itokisa ha banka e lokolla thibelo kapa karete e na le tjhelete e lekaneng.",
              "Haeba o batla ho e lokisa hang hang, eya ho Akhaonte → Laola ditefo → Add payment method, kenya karete e sebetsang, mme o e behe e le ya Kamehla. Stripe e tla leka tefo e hlolehileng hape hang hang ka karete e ntjha. Haeba ngodiso ya hao e se e kgutletse ho Basic, o ka ngodisa hape leqepheng la Ditheko mme bukana ya hao e dula e le teng.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Phapang ke efe pakeng tsa Basic, Clear, le Deep?",
            a: [
              "Basic (mahala): ho fihlela dipatlo tsa mantswe tse 20 ka letsatsi, meelelo yohle, mehlala bakeng sa moelelo ka mong, dikapolelo, le tshimoloho ya lentswe. Ha ho hlokahale ho ngodisa bakeng sa dipatlo tsa motheo.",
              "Clear ($2.99/kgwedi kapa $29.99/selemo): dipatlo tse se nang moeli, ditlhaloso tse loketseng bana, setshwantsho bakeng sa lentswe ka leng (30/kgwedi), ho ngola polelo ya hao ka maikutlo, dintlha tsa dikapolelo, le nalane ya dipatlo ya matsatsi a 30.",
              "Deep ($4.99/kgwedi kapa $49.99/selemo): tsohle tse ho Clear, hammoho le dikwisi tsa boikwetliso, bukana ya hao e nang le boikwetliso bo bohlale ba ho pheta ka dinako tse arohaneng, ho arohanya mantswe a tshwanang, le ditshwantsho tse ngata haholwanyane (100/kgwedi).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akhaonte le ho kena",
        items: [
          {
            id: "no-verification-email",
            q: "Ha ke a fumana imeile ya netefatso.",
            a: [
              "Sheba pele difoldareng tsa spam le tsa dipapatso. Ka nako e nngwe Gmail le Outlook di isa diimeile tsa akhaonte moo ho fihlela o tshwaya e nngwe e le \"Not spam\".",
              "Haeba e le sieo moo, imeile e kanna ya ba e ngotswe hampe ha o ngodisa. Leka ho ngodisa hape mme o hlahlobe aterese habedi. Haeba o ngodisitse ka Google, ha ho hlokahale imeile ya netefatso.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ke lebetse phasewete ya ka.",
            a: [
              "Bula foromo ya ho kena mme o tobetse \"O lebetse phasewete?\". Kenya imeile eo o e sebedisang ho Gadit mme o tla fumana lehokela la ho seta phasewete botjha nakong ya motsotso kapa e mmedi.",
              "Haeba imeile e sa fihle, sheba spam. Haeba e ntse e sa fihle, o kanna wa ba o ngodisitse ka Google ho ena le imeile le phasewete. Leka konopo ya \"Tswela pele ka Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ke na le bonnete ba hore phasewete ya ka e nepahetse empa e re \"Imeile kapa phasewete e fosahetse\".",
            a: [
              "Dintho tse tharo tsa ho hlahloba. Ya pele, capslock. Ya bobedi, sebaka se setseng qetellong ha o kopitsa le ho kgomaretsa. Ya boraro, o ngodisitse ka Google ho ena le phasewete (sebedisa \"Tswela pele ka Google\").",
              "O ntse o thatafallwa? Seta phasewete botjha foromong yona eo. E o lokisetsa botjha.",
            ],
          },
          {
            id: "google-fails",
            q: "Ho kena ka Google ha ho sebetse.",
            a: [
              "Sesosa se tlwaelehileng haholo: sebadi sa hao sa inthanete se thibela dikhukhi tsa batho ba bang kapa difensetere tse hlahang bakeng sa gadit.app. Di dumelle ditumellong tsa bara ya aterese mme o leke hape.",
              "Haeba o le mokgweng wa incognito, ho kena ka Google ho thibetswe ka boomo. Fetohela fensetereng e tlwaelehileng ya sebadi.",
            ],
          },
          {
            id: "change-email",
            q: "Nka fetola imeile akhaonteng ya ka jwang?",
            a: [
              "Akhaonte, tobetsa imeile ya hao, Fetola imeile. O tla hloka ho netefatsa aterese e ntjha pele e sebetsa. Ngodiso ya hao, nalane, le bukana kaofela di a fetisetswa.",
              "Haeba imeile e hokahantswe le moreki wa Stripe, e ntjhafatse le portal ya ditefo ya Stripe hore marasiti a tlang a ye atereseng e ntjha.",
            ],
          },
          {
            id: "delete-account",
            q: "Nka hlakola akhaonte ya ka jwang?",
            a: [
              "Akhaonte, tlase leqepheng, Hlakola akhaonte. Sena ke sa ka ho sa feleng. Ngodiso ya hao e a emiswa, bukana le nalane ya hao di a hlakolwa, mme imeile e a lokollwa bakeng sa ngodiso e ntjha.",
              "Direkoto tsa Stripe tsa ditefo tse fetileng di a sala (re tlamehile ka molao ho di boloka bakeng sa tsa ditjhelete). Ha ho letho le leng le salang.",
            ],
          },
          {
            id: "share-account",
            q: "Na molekane wa ka kapa ngwana wa ka a ka arolelana akhaonte ya ka?",
            a: [
              "Mosebedisi a le mong ya keneng akhaonteng ka nako. Mokgwa wa bana o dumella akhaonte e le nngwe ya Clear kapa Deep ho sebeletsa motswadi le ngwana: tobetsa konopo mme ditlhaloso di hlaha di loketse bana ntle le ho kena ka thoko.",
              "Bakeng sa batho ba baholo ba babedi ba batlang dibukana le tswelopele tse arohileng, bula diakhaonte tse pedi. Clear ke $2.99 ka kgwedi bakeng sa akhaonte ka nngwe.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ke nahana hore ke na le diakhaonte tse pedi ka phoso. Ke etse eng jwale?",
            a: [
              "Hangata sena se etsahala ha motho a ngodisa hang ka Google le hang ka imeile le phasewete a sebedisa aterese e le nngwe, kapa ha o ngodisa habedi ka diaterese tsa imeile tse fapaneng. Ngodiso e nngwe le e nngwe e etsa akhaonte e arohileng ya Gadit e nang le bukana ya yona, nalane, le boemo ba ngodiso.",
              "Re ngolle ka diaterese tsa imeile ka bobedi (kapa di-UID tse leqepheng la Akhaonte) le hore na o batla ho boloka efe. Sehlopha se tla kopanya dibukana le nalane akhaonteng eo o e kgethang, ebe se kwala e nngwe ka hloko. Ha ho dintlha tse lahlehang.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Ho sebedisa Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ke nahana hore tlhaloso e fosahetse. Ke etse eng?",
            a: [
              "Leqephe le leng le le leng la sephetho le na le konopo e nyenyane ya \"Tlaleha\" tlase. E tobetse, kgetha mofuta (tlhaloso, tshimoloho ya lentswe, mohlala, kapolelo, tlhaloso ya bana, jj.) mme o ngole molaetsa o mokgutshwane. E fihla ka kotloloho ho sehlopha mme tlaleho e nngwe le e nngwe e a hlahlojwa.",
              "O se ke wa tshwenyeha ka ho ba ya batlisisang haholo. Bukantswe e ntlafala ka maikutlo ana kapele ho feta ka eng kapa eng e nngwe.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Mokgwa wa bana ha o fetole tlhaloso.",
            a: [
              "Mokgwa wa bana o fetola feela sengolwa moo lentswe le seng le na le tlhaloso e loketseng bana e entsweng. Bakeng sa mantswe a matjha ao o sa tswang ho a batla, e fe metsotswana e 10 ho isa ho e 15. Mofuta o loketseng bana o etswa hang hang lekgetlong la pele.",
              "Hape: Mokgwa wa bana o hloka Clear kapa Deep. Haeba o ho Basic, konopo e tla o kopa ho ntlafatsa. Basebedisi ba sa tsejweng ba kopuwa ho ngodisa.",
            ],
          },
          {
            id: "voice-fails",
            q: "Ho batla ka lentswe ha ho sebetse.",
            a: [
              "Ho batla ka lentswe ho hloka tumello ya maekrofounu. Dibadi tse ngata di botsa hang bakeng sa wepesaete ka nngwe. Haeba o tobeditse Block ka phoso, o tla hloka ho e fetola ka letsoho: tobetsa letshwao la senotlolo kapa la tlhahisoleseding haufi le gadit.app bareng ya aterese, ebe Site settings, ebe Microphone, ebe Allow.",
              "Ho Safari ya iOS, phihlello ya maekrofounu e boetse e hloka konopo ya Settings → Safari → Microphone. Lentswe hajwale ke karolo ya Clear le Deep: basebedisi ba Basic ba bona kopo ya ho ntlafatsa, baeti ba sa kenang ba bona kopo ya ho kena.",
            ],
          },
          {
            id: "no-image",
            q: "Ha ke kgone ho etsa setshwantsho sa lentswe.",
            a: [
              "Ho etsa ditshwantsho ke karolo ya Clear kapa Deep e nang le moeli wa kgwedi. Clear e fumana ditshwantsho tse 30 ka kgwedi, Deep e fumana tse 100. Haeba o sebedisitse moeli wohle, o tla bona lerako. Le qala botjha ka la 1 kgwedi le kgwedi.",
              "Haeba o ka tlase ho moeli mme o ntse o bona ho hloleha, hangata ke ha nakwana. Leka hape ka mora metsotswana e 30. Ho hloleha ho phehellang ke phoso. Ka kopo tlaleha leqepheng la lentswe.",
            ],
          },
          {
            id: "save-word",
            q: "Nka boloka lentswe bukaneng ya ka jwang?",
            a: [
              "Leqepheng lefe kapa lefe la sephetho sa lentswe, tobetsa Boloka bukaneng haufi le sehlooho. Bukana ke karolo ya Clear le Deep moo o ka phetang mantswe a bolokilweng hamorao, wa a bona ka pono ya sehlopha sa dinaledi, mme wa etsa boikwetliso bo bohlale (Deep).",
              "Mantswe ao o a bolokileng mme wa a bula bonyane hang a fumaneha ntle le inthanete ho tswa polokelong ya sesebediswa. Sephutheloana sa ntle le inthanete se boetse se boloka mantswe a ratwang haholo ka puo ya hao hore o itokisetse ntle le inthanete.",
            ],
          },
          {
            id: "offline",
            q: "Mokgwa wa ntle le inthanete o sebetsa jwang?",
            a: [
              "Mantswe ao o seng o a shebile a bolokwa sesebedisweng sa hao. A bule hape ntle le inthanete mme a buleha hang hang. Sephutheloana se felletseng sa ntle le inthanete (mantswe a ka sehloohong ka puo ya hao) se jarollwa ha o se batla leqepheng la bukana.",
              "Ho batla lentswe le letjha ho ntse ho hloka inthanete, hobane Gadit e tlameha ho etsa tlhaloso ho tloha qalong. Polokelo ya ntle le inthanete ke ya mantswe ao o seng o a hlahlobile.",
            ],
          },
          {
            id: "slow",
            q: "App e utlwahala e lieha.",
            a: [
              "Patlo ya pele ya lentswe ke yona e liehang ka ho fetisisa hobane Gadit e etsa sephetho se felletseng ho tloha qalong: hangata metsotswana e mmalwa, ka nako e nngwe ho feta bakeng sa mantswe a rarahaneng. Dipatlo tse latelang tsa lentswe lona leo di potlakile hang hang, di tswa polokelong.",
              "Haeba tsohle di utlwahala di lieha, leka ho nchafatsa ka matla: Cmd+Shift+R ho Mac, Ctrl+Shift+R ho Windows. Haeba ho lieha ho tswela pele maqepheng ohle, ka kopo re romele imeile ka naha ya hao le sebadi sa hao hore sehlopha se hlahlobe tsela ya marangrang ho ya diseva tsa rona ho tswa sebakeng sa hao.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ke batlile lentswe mme ha ke a fumana sephetho. Ho etsahalang?",
            a: [
              "Pele, hlahloba mopeleto. Gadit e kgona ho lokisa diphoso tse nyenyane tsa mongolo boholo ba nako, empa liluma-nosi e fosahetseng kapa tlhaku e sieo e ka e ferekanya. Leka tokiso e sisinngwang haeba e hlaha.",
              "Ntle le moo: mantswe a sa tlwaelehang haholo kapa a puo ya seterata a kanna a se fumane sephetho se tshepahalang. Haeba o na le bonnete ba hore lentswe ke la nnete, tobetsa konopo ya Tlaleha leqepheng la sephetho (kapa skrineng sa phoso) mme o re tsebise. Tlaleho e nngwe le e nngwe e a hlahlojwa mme mantswe a nnete a fositsweng a kenngwa hape sistimeng.",
            ],
          },
          {
            id: "change-language",
            q: "Nka fetola puo ya sebopeho jwang?",
            a: [
              "Hodimo ka ho le letona leqepheng lefe kapa lefe, o tla bona letshwao le lenyenyane la folaga (kapa lebitso la puo ya hao ya hajwale). Le tobetse mme o kgethe hara dipuo tse fetang 30: Senyesemane, Segerike, Seheberu, Searabia, Serashea, Sespanishe, Sepotokisi, Sefora, Sejeremane, Setjheke, Seslovakia, Setaliana, Sejapane, Sehindi, Seamhariki, Sezulu.",
              "Kgetho ya hao e bolokwa sesebedisweng sena. Tsohle di laela hape ka puo e ntjha: sebopeho, manane, ditlhaloso tsa mantswe tse tlang, mehlala, ditlhaloso tsa bana, esita le tshimoloho ya lentswe. Diphetho tse seng di bolokilwe ka puo ya kgale di dula ho fihlela o batla mantswe ao hape.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Lenaneo la balekane",
        items: [
          {
            id: "join-partner",
            q: "Nka ba molekane wa Gadit jwang?",
            a: [
              "Bula /partners leqepheng lefe kapa lefe mme o tobetse \"Eba molekane\". Ngodisa ka lebitso la hao le imeile, mme lehokela la hao le ikgethang la ho kgothaletsa hammoho le leqephe la taolo la ho latela ho tobetsa le dikhomishene di lokile hang hang. Ha ho ho emela tumello.",
              "Ho kena ke mahala mme ho bulehetse motho ofe kapa ofe. Ha o hloke ngodiso ya Gadit ho ba molekane.",
            ],
          },
          {
            id: "commission-model",
            q: "Dikhomishene di balwa jwang?",
            a: [
              "Dipehelo tse tlwaelehileng ke 25% ya tefo e nngwe le e nngwe eo moreki a e etsang selemong sa hae sa pele. Ka mora selemo seo sa pele, o fumana 10% ya tefo e nngwe le e nngwe ha feela moreki a ntse a lefa.",
              "Sena se sebetsa ka tsela e tshwanang bakeng sa merero ya kgwedi le ya selemo, hobane khomishene e balwa tefong e nngwe le e nngwe ya nnete. Haeba moreki a emisa, khomishene ya hao e emisa le tefo ya hae ya ho qetela.",
              "Sehlopha se ka beha ditekanyetso tse fapaneng bakeng sa balekane ba itseng. Ditekanyetso tsa hao di dula di bonahala leqepheng la hao la taolo la molekane, leo o ka le fihlelang ho tswa ho /partners.",
            ],
          },
          {
            id: "payout",
            q: "Ke lefuwa neng?",
            a: [
              "Kgwedi le kgwedi, hang ha tjhelete ya hao e feta $50. Re sebedisa mokgwa wa tefo oo o o behileng leqepheng la taolo la molekane (phetisetso ya banka, PayPal, jj.). $50 ke bonyane, hase moeli. O ka fumana ho feta haholo, o fumana tefo feela ha o feta bonyane boo.",
              "Dikhomishene di lokollwa matsatsi a 30 ka mora tefo ya ngodiso, ho lebella nako ya ho kgutlisa tjhelete. Kahoo ngodiso ya Pherekgong e lokollwa qalong ya Hlakola mme e kena tefong ya hao e latelang hang ha tjhelete ya hao e feta $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ke kene empa leqephe la ka la taolo ha le na letho.",
            a: [
              "Dipalo di hlaha ka mora ho tobetsa ha pele lehokeleng la hao. Ho se be le letho ho bolela feela hore ha ho eso be le ya tobetsang. Eya o arolelane lehokela. Leqephe la taolo le ntjhafala hoo e batlang e le hang hang hang ha mosebetsi o qala.",
              "Haeba o arolelane mme motho a ngodisitse empa leqephe la taolo le sa e bontshe, re ngolle ka nako e ka bang ya ngodiso mme sehlopha se tla hlahloba hore na e balwa ho mang.",
            ],
          },
          {
            id: "attribution-window",
            q: "Lehokela la ka la ho kgothaletsa le latela moeti nako e kae?",
            a: [
              "Matsatsi a mashome a tsheletseng. Ha moeti a tobetsa lehokela la hao, re beha khukhi e o tsebahatsang jwalo ka ya kgothaditseng. Haeba a ngodisa mme a ngodisetsa moralo nako efe kapa efe matsatsing a 60 a latelang (leha a ka tloha wepesaeteng mme a kgutla hamorao ka patlo ya Google), o ntse o balelwa.",
              "Ho hlakolwa ha dikhukhi: haeba moeti a hlakola dikhukhi tsa hae kapa a fetola sebadi/sesebediswa pele a ngodisa, ho balelwa ho ka lahleha. Ha ho tsela e potolohang seo, empa matsatsi a 60 ke nako e telele ha e bapiswa le mananeo a mangata a balekane.",
            ],
          },
          {
            id: "missing-commission",
            q: "Motho o ngodisitse ka lehokela la ka empa ha ke bone khomishene.",
            a: [
              "Hangata ke taba ya nako: ngodiso e hlaha leqepheng la taolo nakong ya metsotso, empa khomishene e ngolwa feela hang ha ngodiso e lefilwe ka nnete (e leng ho ka nkang matsatsi haeba a le nakong ya teko ya mahala). Hlahloba hape ka mora hore nako ya teko e fele.",
              "Haeba ngodiso e lefilwe empa o ntse o sa bone khomishene ka mora dihora tse 48, re ngolle ka nako e ka bang ya ngodiso le imeile kapa lebitso la mongodisi haeba o le tseba. Sehlopha se tla batlisisa ketane ya ho balelwa mme se lokise phoso efe kapa efe ka letsoho.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Kakaretso",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit ke eng?",
            a: [
              "Bukantswe ya dipuo tse ngata e etseditsweng ho etsa hore lentswe le utlwahale, eseng feela ho fana ka tlhaloso ya mola o le mong. Lentswe le leng le le leng le buleha ka meelelo yohle ya lona, mehlala ya nnete bakeng sa moelelo ka mong, dikapolelo, tshimoloho ya lentswe, setshwantsho ha o rata, mme (ka Clear le Deep) tlhaloso e loketseng bana, ho ngola polelo ya hao ka maikutlo, le dikwisi.",
              "Hajwale ho na le dipuo tsa sebopeho tse fetang 30. Ka hare sehlopha se e bitsa ho GAD lentswe: ho utlwisisa lentswe ka botlalo, eseng feela ho le fetolela.",
            ],
          },
          {
            id: "languages",
            q: "Le tshehetsa dipuo dife?",
            a: [
              "Sebopeho: Senyesemane, Segerike, Seheberu, Searabia, Serashea, Sespanishe, Sepotokisi, Sefora, Sejeremane, Setjheke, Seslovakia, Setaliana, Sejapane, Sezulu.",
              "O ka batla lentswe ka efe kapa efe ya dipuo tseo mme o fumane tlhaloso, mehlala, le tsohle tse ding ka puo ya sebopeho eo o e kgethileng. Seheberu le Searabia di ngolwa ka botlalo ho tloha ka ho le letona ho ya ho le letshehadi mme di sebedisa difonte tsa tsona.",
            ],
          },
          {
            id: "kid-safety",
            q: "Na Gadit e bolokehile bakeng sa bana?",
            a: [
              "Gadit e etseditswe hore motswadi a e sebedise ka polokeho hammoho le ngwana. Mokgwa wa bana o etsa ditlhaloso tse bonolo, tse hlakileng, le tse loketseng dilemo (hoo e ka bang boemong ba dilemo tse 5 ho isa ho tse 10), o sebedisa enjene e tshwanang e etsang dikahare tsa batho ba baholo ka ditaelo tse hlakileng tsa ho nolofatsa. Ha ho dikahare tse etswang ke basebedisi tse kileng tsa bontshwa bana.",
              "Ho ya ka maano a rona le melao ya lekunutu la bana lefatsheng ka bophara, ho ba mong wa akhaonte o ikemetseng ke ho tloha dilemong tse 13. Mokgwa o tlwaelehileng ke akhaonte ya motswadi eo motswadi a e sebedisang hammoho le ngwana wa hae, e leng hona seo Mokgwa wa bana o etseditsweng sona.",
            ],
          },
          {
            id: "data",
            q: "Dintlha tsa ka di bolokwa kae? Na le a di rekisa?",
            a: [
              "Akhaonte, nalane, bukana, le ditshwantsho tse entsweng di bolokwa ka polokeho ho Firebase, di notletswe polokelong. Ha re rekisetse motho ofe kapa ofe dintlha tsa hao. Re arolelana feela se hlokahalang ho tsamaisa Gadit (polokelo, ditefo, bafani ba dikahare), jwalo ka ha ho hlalositswe Leanong la Lekunutu.",
              "O ka ntsha bukana ya hao kapa wa hlakola akhaonte ya hao nako efe kapa efe leqepheng la Akhaonte.",
            ],
          },
          {
            id: "contact-direct",
            q: "Nka le fihlela ka kotloloho jwang?",
            a: [
              "Sebedisa konopo ya imeile tlase leqepheng lena. E ya ka kotloloho lebokoseng la diimeile la sehlopha. Molaetsa o mong le o mong o a balwa mme o fumana karabo nakong ya dihora tse 24 ho isa ho tse 48 (hangata kapele).",
              "Imeile e molemo ho feta moqoqo bakeng sa thuso: e fa sehlopha monyetla wa ho bala ka hloko le ho araba ka kelello. Thuso ka mohala ha e eso fumanehe.",
            ],
          },
        ],
      },
    ],
  },
  ts: {
    eyebrow: "Ndhawu ya Mpfuno",
    heading: "Kumani nhlamulo, hi ku hatlisa.",
    lede: "Swivutiso leswi tolovelekeke na ndlela yo lulamisa swiphiqo goza hi goza, swi hleriwile hi swiphemu. Loko mi nga voni xiphiqo xa n'wina, vulavulani na ntlawa laha hansi.",
    stillNeedHelpHeading: "Xana ma ha khomekile?",
    stillNeedHelpBody: "Hi tsaleleni hi ku kongoma. Rungula rin'wana na rin'wana ri hlayiwa hi ntlawa naswona ri hlamuriwa endzhaku ka siku rin'we kumbe mambirhi.",
    emailCta: "Hi rhumeleni imeyili",
    responseTime: "Nhlamulo ya ntolovelo: endzhaku ka tiawara ta 24 ku ya eka 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ku hakela & mbhaliso",
        items: [
          {
            id: "change-card",
            q: "Ndzi cinca njhani khadi ra xikweleti eka mbhaliso wa mina?",
            a: [
              "Mi nga cincela eka khadi lerintshwa hi nkarhi wa le hansi ka minete handle ka ku khansela. Mbhaliso wa n'wina wa sweswi wu ya emahlweni wu tirha, ntsena hi khadi lerintshwa.",
              "1. Nghenani eka gadit.app kutani mi pfula tluka ra Akhawunti ya n'wina (ehenhla exineneni). 2. Thintani \"Lawula ku hakela\". 3. Tluka ra Stripe leri sirhelelekeke ri pfuleka. Thintani \"Add payment method\", tsalani khadi lerintshwa, kutani mi ri funga tanihi Default. 4. Loko mi lava, susani khadi ra khale.",
              "Ku sukela eka nkarhi lowu landzelaka wa ku hakela, hinkwaswo swi ya eka khadi lerintshwa. Ku hakerisiwa ka khale (loku se ku hakeriweke) ku tshama eka khadi ra khale. A ku laveki ku vuyiseriwa mali handle ka loko mi swi lava hi ku kongoma.",
            ],
          },
          {
            id: "cancel",
            q: "Ndzi khansela njhani mbhaliso wa mina?",
            a: [
              "Mi swi endla hi n'wexe, nkarhi wun'wana na wun'wana. Nghenani, pfulani Akhawunti, kutani mi thinta Khansela mbhaliso ehansi ka pulani ya n'wina.",
              "Ku nghena ka n'wina ku ya emahlweni ku fikela emakumu ka nkarhi lowu mi wu hakeleke. Endzhaku ka sweswo akhawunti yi tlhelela eka Basic (mahala). Marito lawa mi ma hlayiseke, matimu na buku ya marito swi tshama swi hlayisekile naswona swi kumeka.",
              "Loko mi khansela hi xihoxo kumbe mi cinca miehleketo, mi nga pfuxeta mbhaliso eka tluka rero emahlweni ka loko nkarhi wu hela.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ndzi cincela njhani ku suka eka Clear ku ya eka Deep (kumbe hi ndlela yin'wana)?",
            a: [
              "Akhawunti, kutani Lawula ku hakela, kutani \"Update subscription\". Hlawulani pulani leyintshwa.",
              "Stripe yi hlayela ku hambana ka nxavo hi ku tiendlela, hi ku ya hi masiku lama saleke eka nkarhi wa sweswi. Loko mi tlakusa, mi ta hakerisiwa ku hambana ntsena eka nkarhi lowu saleke. Loko mi cincela eka xiyimo xa le hansi, mali leyi saleke yi tirhisiwa eka rhisiti ya n'wina leyi landzelaka.",
            ],
          },
          {
            id: "invoice",
            q: "Ndzi dawuniloda njhani inivhoyisi kumbe rhisiti?",
            a: [
              "Akhawunti, kutani Lawula ku hakela, kutani \"Invoice history\". Ku hakerisiwa kun'wana na kun'wana ku na rhisiti ya PDF leyi dawunilodekaka leyi nga na vuxokoxoko bya ku hakela lebyi mi byi hlayiseke.",
              "Loko mi lava vito, adirese kumbe nomboro ya xibalo yo hambana eka inivhoyisi (xikombiso vito ra khampani hikwalaho ka xibalo), pfuxetani vuxokoxoko bya n'wina bya ku hakela eka tluka rero emahlweni ka ku dawuniloda. Rhisiti leyi landzelaka yi ta tirhisa vuxokoxoko lebyintshwa.",
            ],
          },
          {
            id: "portal-error",
            q: "Ndzi thintile Lawula ku hakela kambe ndzi kumile xihoxo. Ndzi endla yini?",
            a: [
              "Ku na swivangelo swimbirhi leswi tolovelekeke. Xo sungula, akhawunti ya n'wina a yi na mbhaliso wa Stripe lowu tirhaka. Xa vumbirhi, Stripe yi nga ha va yi nga si va na vuxokoxoko hinkwabyo bya ku hakela bya akhawunti ya n'wina.",
              "Ku kambela ko olova ko sungula: humani, nghenani nakambe hi imeyili leyi mi yi tirhiseke loko mi hakela, kutani mi ringeta nakambe. Loko swi nga si tirha, vulavulani na hina hi imeyili ya akhawunti ya n'wina kutani ntlawa wu ta swi lulamisa hi tlhelo ra hina hi minete.",
            ],
          },
          {
            id: "autorenew",
            q: "Xana mbhaliso wa mina wu ta pfuxetiwa hi ku tiendlela?",
            a: [
              "Ina. Tipulani ta n'hweti ti pfuxetiwa n'hweti yin'wana na yin'wana, tipulani ta lembe ti pfuxetiwa lembe rin'wana na rin'wana hi siku leri fanaka. Mi nga vona siku leri landzelaka ra ku hakela eka akhawunti ya n'wina na le ka phortali ya Stripe.",
              "Loko mi nga lavi ku pfuxetiwa hi ku tiendlela, khanselani nkarhi wun'wana na wun'wana emahlweni ka siku ra ku pfuxetiwa. Ku khansela a ku tirhi hi ku hatlisa. Mi ya emahlweni mi nghena ku fikela emakumu ka nkarhi lowu mi wu hakeleke.",
            ],
          },
          {
            id: "refund",
            q: "Xana ndzi nga vuyiseriwa mali?",
            a: [
              "Ina. Loko ku xava ku endliwe emahlweni ka masiku ya 14 naswona vukorhokeri byi nga tirhisiwanga ngopfu, hi tsaleleni hi imeyili ya akhawunti ya n'wina na rungula ro koma leri hlamuselaka xivangelo. Ku vuyiseriwa mali koloko ku pfumeleriwa handle ka ku lwisana.",
              "Loko ku hundze masiku yo tlula 14, ntlawa wu languta xiyimo xin'wana na xin'wana hi xoxe. Khanselani mbhaliso leswaku wu nga yi emahlweni wu pfuxetiwa, kutani mi hi rhumela imeyili.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ndzi vona ku hakerisiwa loku ndzi nga ku tiviki.",
            a: [
              "Ku hakerisiwa ku humelela tanihi GADIT kumbe GADIT.APP hi $2.99 (Clear hi n'hweti), $4.99 (Deep hi n'hweti), $29.99 (Clear hi lembe), kumbe $49.99 (Deep hi lembe). Loko swi nga fambelani, swi nga ha huma eka vukorhokeri byin'wana.",
              "Loko mi tiyisile leswaku a hi ka n'wina, mi nga si kaneta hi bangi ya n'wina. Hi tsaleleni hi ku kongoma ku sungula, mi ri na siku na mali. Ntlawa wu ta ku kuma, wu hlamusela leswaku i yini, naswona wu vuyisa mali loko swi laveka. Ku kaneta hi bangi swi nga endla ku hakela ka nkarhi lowu taka ku tika, hikwalaho ku swi lulamisa hi mpfuno hi ntolovelo swa hatlisa naswona swi hlayisekile.",
            ],
          },
          {
            id: "failed-payment",
            q: "Ku hakela ka mina a ku tirhanga. Ndzi fanele ku endla yini?",
            a: [
              "Stripe yi ringeta nakambe hi ku tiendlela ku hakela loku nga tirhangiki minkarhi yi nga ri yingani eka masiku lama landzelaka. Swiphiqo swo tala swa tilulamisela loko bangi yi humesa ku khomiwa kumbe khadi ri ri na mali leyi ringaneke.",
              "Loko mi lava ku swi lulamisa hi ku hatlisa, yanani eka Akhawunti → Lawula ku hakela → \"Add payment method\", tsalani khadi leri tirhaka, kutani mi ri veka tanihi Default. Stripe yi ta ringeta nakambe ku hakerisiwa loku nga tirhangiki hi ku hatlisa eka khadi lerintshwa. Loko mbhaliso wa n'wina wu se wu tlhelele eka Basic, mi nga tsarisa nakambe eka Minxavo naswona buku ya n'wina ya marito yi tshama yi ri kona.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Xana ku hambana exikarhi ka Basic, Clear na Deep i yini?",
            a: [
              "Basic (mahala): ku fika eka ku lava marito ka 20 hi siku, tinhlamuselo hinkwato, swikombiso eka nhlamuselo yin'wana na yin'wana, swivulavulelo, na masungulo ya rito. A ku laveki ku tsarisa eka ku lava ka le hansi.",
              "Clear ($2.99/n'hweti kumbe $29.99/lembe): ku lava handle ka ndzilakano, tinhlamuselo leti vana va ti twisisaka, xifaniso eka rito rin'wana na rin'wana (30/n'hweti), ku tsala xivulwa xa n'wina mi kuma switsundzuxo, vuxokoxoko bya swivulavulelo, na masiku ya 30 ya matimu ya ku lava.",
              "Deep ($4.99/n'hweti kumbe $49.99/lembe): hinkwaswo leswi nga eka Clear, ku engetela mavutiso yo titoloveta, buku ya marito ya n'wina na ntoloveto wa vutlhari wo vuyelela hi minkarhi leyi hambanaka, ku hambanisa marito lama fanaka, na swifaniso swo tala (100/n'hweti).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akhawunti & ku nghena",
        items: [
          {
            id: "no-verification-email",
            q: "A ndzi yi kumanga imeyili yo tiyisisa.",
            a: [
              "Kambelani tifolda ta spam na ta swinavelo ku sungula. Gmail na Outlook minkarhi yin'wana swi yisa timeyili ta tiakhawunti kwalaho ku fikela loko mi funga yin'we tanihi \"Not spam\".",
              "Loko yi nga ri kona, imeyili yi nga ha va yi tsariwe hi xihoxo loko mi tsarisa. Ringetani ku tsarisa nakambe mi kambela adirese kahle. Loko mi tsarise hi Google, a ku laveki imeyili yo tiyisisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ndzi rivele phasiwedi ya mina.",
            a: [
              "Pfulani fasitere ro nghena kutani mi thinta \"Mi rivele phasiwedi?\". Tsalani imeyili leyi mi yi tirhisaka eka Gadit kutani mi ta kuma linki yo cinca phasiwedi endzhaku ka minete yin'we kumbe timbirhi.",
              "Loko imeyili yi nga fiki, kambelani spam. Loko yi nga si fika, mi nga ha va mi tsarise hi Google ematshan'wini ya imeyili na phasiwedi. Ringetani buthoni ya \"Yisa emahlweni hi Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ndzi tiyisile leswaku phasiwedi ya mina yi lulamile kambe yi ri \"Imeyili kumbe phasiwedi a swi lulamanga\".",
            a: [
              "Swilo swinharhu swo kambela. Xo sungula, capslock. Xa vumbirhi, ndhawu leyi nga riki na nchumu emakumu loko mi kopa no nameka. Xa vunharhu, mi tsarise hi Google ku nga ri hi phasiwedi (tirhisani \"Yisa emahlweni hi Google\" ematshan'wini ya sweswo).",
              "Xana ma ha khomekile? Cincani phasiwedi eka fasitere rero. Swi mi sungulisa nakambe kahle.",
            ],
          },
          {
            id: "google-fails",
            q: "Ku nghena hi Google a ku tirhi.",
            a: [
              "Xivangelo lexi tolovelekeke ngopfu: bulawuza ya n'wina yi sivela ti-cookie ta van'wana kumbe ti-pop-up eka gadit.app. Ti pfumeleleni eka mpfumelelo wa bara ya adirese kutani mi ringeta nakambe.",
              "Loko mi ri eka xiyimo xa incognito, ku nghena hi Google ku sivelekile hi xikongomelo. Cincelani eka fasitere ra bulawuza ra ntolovelo.",
            ],
          },
          {
            id: "change-email",
            q: "Ndzi cinca njhani imeyili eka akhawunti ya mina?",
            a: [
              "Akhawunti, thintani imeyili ya n'wina, Cinca imeyili. Mi ta fanela ku tiyisisa adirese leyintshwa emahlweni ka loko yi tirha. Mbhaliso wa n'wina, matimu na buku ya marito swi ya emahlweni hinkwaswo.",
              "Loko imeyili yi hlanganisiwe na muxavi wa Stripe, yi pfuxeteni na le ka phortali ya ku hakela ya Stripe leswaku tirhisiti ta nkarhi lowu taka ti ya eka adirese leyintshwa.",
            ],
          },
          {
            id: "delete-account",
            q: "Ndzi susa njhani akhawunti ya mina?",
            a: [
              "Akhawunti, ehansi ka tluka, Susa akhawunti. Leswi i swa masiku hinkwawo. Mbhaliso wa n'wina wu khanseriwa, buku ya marito na matimu swi suriwa, naswona imeyili yi ntshunxeka leswaku yi tirhisiwa eka ku tsarisa lokuntshwa.",
              "Rhekhodo ya Stripe ya ku hakerisiwa ka khale yi tshama (hi bohiwa hi nawu ku yi hlayisa hikwalaho ka tibuku ta timali). A ku na swin'wana leswi tshamaka.",
            ],
          },
          {
            id: "share-account",
            q: "Xana munghana wa mina wa vutomi kumbe n'wana wa mina a nga avelana akhawunti ya mina?",
            a: [
              "Mutirhisi un'we loyi a ngheneke eka akhawunti hi nkarhi. Xiyimo xa vana xi pfumelela akhawunti yin'we ya Clear kumbe ya Deep ku tirhela mutswari na n'wana: cincani xilawuri kutani tinhlamuselo ti kombisiwa hi ndlela leyi vana va yi twisisaka handle ka ku nghena ko hambana.",
              "Eka vanhu lavakulu vambirhi lava havambirhi va lavaka tibuku ta marito na ku ya emahlweni ko hambana, endlani tiakhawunti timbirhi. Clear i $2.99 hi n'hweti eka akhawunti yin'we.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ndzi ehleketa leswaku ndzi na tiakhawunti timbirhi hi xihoxo. Ndzi endla yini?",
            a: [
              "Leswi hi ntolovelo swi humelela loko munhu a tsarisa kan'we hi Google na kan'we hi imeyili na phasiwedi a tirhisa adirese yin'we, kumbe loko mi tsarisa kambirhi hi tiadirese ta imeyili to hambana. Ku tsarisa kun'wana na kun'wana ku endla akhawunti yo hambana ya Gadit leyi nga na buku ya yona ya marito, matimu na xiyimo xa mbhaliso.",
              "Hi tsaleleni mi ri na tiadirese hatimbirhi ta imeyili (kumbe ti-UID eka tluka ra Akhawunti) na leyi mi lavaka ku yi hlayisa. Ntlawa wu ta hlanganisa tibuku ta marito na matimu eka akhawunti leyi mi yi hlawulaka, kutani wu pfala leyin'wana kahle. A ku lahleki vuxokoxoko.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Ku tirhisa Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ndzi ehleketa leswaku nhlamuselo yi hoxile. Ndzi endla yini?",
            a: [
              "Tluka rin'wana na rin'wana ra mbuyelo ri na buthoni yitsongo ya \"Vika xihoxo\" ehansi. Yi thinteni, hlawulani muxaka (nhlamuselo, masungulo, xikombiso, xivulavulelo, nhlamuselo ya vana, na swin'wana) kutani mi tsala rungula ro koma. Ri ta kongoma eka ntlawa naswona xiviko xin'wana na xin'wana xa languteriwa.",
              "Mi nga vileli hi ku va mi kongomisa ngopfu. Dikixinari yi antswa hi switsundzuxo leswi hi ku hatlisa ku tlula hi nchumu wun'wana.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Xiyimo xa vana a xi cinci nhlamuselo.",
            a: [
              "Xiyimo xa vana xi cinca tsalwa ntsena laha rito ri nga ni nhlamuselo leyi vana va yi twisisaka leyi se yi endliweke. Eka marito lamantshwa lawa mi ha ku ma lava, yimelani tisekoni ta 10 ku ya eka 15. Nhlamuselo ya vana yi endliwa hi ku hatlisa ro sungula.",
              "Naswona: Xiyimo xa vana xi lava Clear kumbe Deep. Loko mi ri eka Basic, xilawuri xi ta mi kombela ku tlakusa. Vatirhisi lava nga tiviwiki va kombeliwa ku tsarisa.",
            ],
          },
          {
            id: "voice-fails",
            q: "Ku lava hi rito a ku tirhi.",
            a: [
              "Ku lava hi rito ku lava mpfumelelo wa maykrofoni. Tibulawuza to tala ti vutisa kan'we eka websayiti yin'wana na yin'wana. Loko mi thintile Block hi xihoxo, mi ta fanela ku swi cinca hi voko: thintani aykhoni ya xilotlelo kumbe ya vuxokoxoko etlhelo ka gadit.app eka bara ya adirese, kutani Site settings, kutani Microphone, kutani Allow.",
              "Eka Safari ya iOS, ku nghena eka maykrofoni na kona ku lava xilawuri xa Settings → Safari → Microphone. Sweswi rito i xihlawulekisi xa Clear na Deep: vatirhisi va Basic va vona xikombelo xo tlakusa, vaendzi lava nga ngheniki va vona xikombelo xo nghena.",
            ],
          },
          {
            id: "no-image",
            q: "A ndzi swi koti ku endla xifaniso xa rito.",
            a: [
              "Ku endla swifaniso i xihlawulekisi xa Clear kumbe Deep lexi nga na ndzilakano wa n'hweti. Clear yi kuma swifaniso swa 30 hi n'hweti, Deep yi kuma 100. Loko mi tirhisile swifaniso hinkwaswo, mi ta vona xihingakanyo. Swi sungula nakambe hi siku ro sungula ra n'hweti yin'wana na yin'wana.",
              "Loko mi nga si fika eka ndzilakano naswona ma ha vona swi nga tirhi, hi ntolovelo i xiphiqo xa nkarhinyana. Ringetani nakambe endzhaku ka tisekoni ta 30. Swiphiqo leswi tshamaka i xihoxo xa sisiteme. Hi kombela mi xi vika ku suka eka tluka ra rito.",
            ],
          },
          {
            id: "save-word",
            q: "Ndzi hlayisa njhani rito ebukwini ya mina ya marito?",
            a: [
              "Eka tluka rin'wana na rin'wana ra mbuyelo wa rito, thintani Hlayisa ebukwini kusuhi na nhloko. Buku ya marito i xihlawulekisi xa Clear na Deep laha mi nga vuyelelaka marito lama hlayisiweke endzhaku, mi ma vona eka xiyimo xa ntlawa wa tinyeleti, na ku endla ntoloveto wa vutlhari (Deep).",
              "Marito lawa mi ma hlayiseke naswona mi ma pfuleke kan'we kumbe ku tlula ma kumeka handle ka inthanete ku suka eka vuhlayiselo bya xitirhisiwa. Phakete yo tirhisa handle ka inthanete na yona yi hlayisa marito lama laviwaka ngopfu eka ririmi ra n'wina leswaku mi lunghekile handle ka inthanete.",
            ],
          },
          {
            id: "offline",
            q: "Xana xiyimo xo tirhisa handle ka inthanete xi tirha njhani?",
            a: [
              "Marito lawa mi se mi ma voneke ma hlayisiwa eka xitirhisiwa. Ma pfuleni nakambe handle ka inthanete kutani ma layicheka hi ku hatlisa. Phakete hinkwayo yo tirhisa handle ka inthanete (marito ya le henhla eka ririmi ra n'wina) yi dawunilodiwa loko mi yi lava eka tluka ra buku ya marito.",
              "Ku lava rito lerintshwa ku ha lava inthanete, hikuva Gadit yi fanele ku endla nhlamuselo ku sukela eku sunguleni. Vuhlayiselo bya handle ka inthanete i bya marito lawa mi se mi ma lavisiseke.",
            ],
          },
          {
            id: "slow",
            q: "App yi titwa yi nonoka.",
            a: [
              "Ku lava ko sungula ka rito hi kona ku nonokaka ngopfu hikuva Gadit yi endla mbuyelo hinkwawo ku sukela eku sunguleni: hi ntolovelo tisekoni ti nga ri tingani, minkarhi yin'wana ku tlula eka marito yo tika. Ku lava loku landzelaka ka rito rero i ka xihatla, ku humaka eka vuhlayiselo.",
              "Loko hinkwaswo swi titwa swi nonoka, ringetani ku pfuxeta hi matimba: Cmd+Shift+R eka Mac, Ctrl+Shift+R eka Windows. Loko ku nonoka ku ya emahlweni eka matluka hinkwawo, hi kombela mi hi rhumela imeyili mi ri na tiko na bulawuza ya n'wina leswaku ntlawa wu kambela ndlela ya netiweke ku ya eka tisevha ta hina ku suka eka xifundzha xa n'wina.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ndzi lave rito kambe a ndzi kumanga mbuyelo. Ku humelela yini?",
            a: [
              "Xo sungula, kambelani mapeletelo. Gadit hakanyingi yi lulamisa swihoxo leswitsongo swa ku tsala, kambe vawele lowu hoxeke kumbe letere leri pfumalekaka swi nga yi pfilunganya. Ringetani ku lulamisa loku ringanyetiweke loko ku humelela.",
              "Ku engetela kona: marito lama nga tolovelekangiki ngopfu kumbe ya xiluva ma nga ha tlherisi mbuyelo lowu tshembekaka. Loko mi tiyisile leswaku rito i ra xiviri, thintani buthoni ya Vika xihoxo eka tluka ra mbuyelo (kumbe eka xikirini xa xihoxo) mi hi tivisa. Xiviko xin'wana na xin'wana xa languteriwa naswona marito ya xiviri lama pfumalekaka ma engeteriwa eka sisiteme.",
            ],
          },
          {
            id: "change-language",
            q: "Ndzi cinca njhani ririmi ra xitirhisiwa?",
            a: [
              "Ehenhla exineneni ka tluka rin'wana na rin'wana, mi ta vona aykhoni yitsongo ya mbendzele (kumbe vito ra ririmi ra n'wina ra sweswi). Yi thinteni kutani mi hlawula eka tindzimi ta 30+: Xinghezi, Xigriki, Xiheberu, Xiarabu, Xirhaxiya, Xipaniya, Xiputukezi, Xifurwa, Xijarimani, Xicheki, Xislovaki, Xitaliyana, Xijapani, Xihindi, Xiamhariki, Xizulu.",
              "Leswi mi swi hlawulaka swi hlayisiwa eka xitirhisiwa lexi. Hinkwaswo swi layicha nakambe hi ririmi lerintshwa: xitirhisiwa, timenyu, tinhlamuselo ta marito ta nkarhi lowu taka, swikombiso, tinhlamuselo ta vana, hambi ku ri masungulo. Mimbuyelo leyi se yi hlayisiweke hi ririmi ra khale yi tshama ku fikela loko mi lava marito wolawo nakambe.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Nongonoko wa vatirhisani",
        items: [
          {
            id: "join-partner",
            q: "Ndzi va njhani mutirhisani wa Gadit?",
            a: [
              "Pfulani /partners eka tluka rin'wana na rin'wana kutani mi thinta \"Become a partner\". Tsarisani hi vito na imeyili ya n'wina, kutani linki ya n'wina yo hlawuleka na dashibodo yo landzelela ku thinta na tikhomixini swi lunghekile hi ku hatlisa. A ku yimeleriwi mpfumelelo.",
              "Ku nghena i mahala naswona ku pfulekele un'wana na un'wana. A mi lavi mbhaliso wa Gadit leswaku mi va mutirhisani.",
            ],
          },
          {
            id: "commission-model",
            q: "Xana tikhomixini ti hlayiwa njhani?",
            a: [
              "Swipimelo swa ntolovelo i 25% ya ku hakela kun'wana na kun'wana loku muxavi a ku endlaka hi lembe ra yena ro sungula. Endzhaku ka lembe rero ro sungula, mi kuma 10% ya ku hakela kun'wana na kun'wana loko muxavi a ya emahlweni a hakela.",
              "Leswi swi tirha hi ndlela yin'we eka tipulani ta n'hweti na ta lembe, hikuva khomixini yi hlayiwa eka ku hakela kun'wana na kun'wana ka xiviri. Loko muxavi a khansela, khomixini ya n'wina yi yima eka ku hakela ka yena ko hetelela.",
              "Ntlawa wu nga veka mimpimo yo hambana eka vatirhisani vo karhi. Mimpimo ya n'wina yi tshama yi kombisiwa eka dashibodo ya n'wina ya mutirhisani, leyi mi nga yi kumaka eka /partners.",
            ],
          },
          {
            id: "payout",
            q: "Ndzi hakeriwa rini?",
            a: [
              "Hi n'hweti, loko mali ya n'wina yi tlula $50. Hi tirhisa ndlela yo hakela leyi mi yi vekeke eka dashibodo ya mutirhisani (ku hundzisela ebangini, PayPal, na swin'wana). $50 i ndzilakano wa le hansi, a hi ndzilakano wa le henhla. Mi nga kuma swo tala ngopfu, mi amukela ku hakeriwa ntsena loko mi tlula ndzilakano.",
              "Tikhomixini ti humesiwa endzhaku ka masiku ya 30 ku sukela loko mbhaliso wu hakeriwile, leswaku ku va na nkarhi wa ku vuyiseriwa mali. Hikwalaho mbhaliso wa Sunguti wu humesiwa eku sunguleni ka Nyenyanyana kutani wu nghena eka ku hakeriwa ka n'wina loku landzelaka loko mali ya n'wina yi tlula $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ndzi nghenile kambe dashibodo ya mina a yi na nchumu.",
            a: [
              "Tinomboro ti humelela endzhaku ka ku thinta ko sungula eka linki ya n'wina. Ku pfumala nchumu swi vula ntsena leswaku a ku si va na loyi a thinteke. Yanani mi avelana linki. Dashibodo yi pfuxetiwa kwalomu ka hi nkarhi wa xiviri loko ntirho wu sungula.",
              "Loko mi avelanile naswona munhu a tsarisile kambe dashibodo yi nga swi kombisi, hi tsaleleni mi ri na nkarhi wa kwalomu ka ku tsarisa kutani ntlawa wu ta kambela ku hlayeriwa.",
            ],
          },
          {
            id: "attribution-window",
            q: "Xana linki ya mina yo bumabumela yi landzelela muendzi ku ringana nkarhi muni?",
            a: [
              "Masiku ya makume ntsevu. Loko muendzi a thinta linki ya n'wina, hi veka cookie leyi mi tivisaka tanihi loyi a n'wi rhumeleke. Loko a tsarisa a hakela nkarhi wun'wana na wun'wana eka masiku ya 60 lama landzelaka (hambi a huma eka websayiti a tlhela a vuya endzhaku hi ku lava eka Google), ku hlayeriwa ka ha mi nyika.",
              "Ku sula ti-cookie: loko muendzi a sula ti-cookie ta yena kumbe a cinca bulawuza/xitirhisiwa emahlweni ka loko a tsarisa, ku hlayeriwa ku nga lahleka. A ku na ndlela yo swi papalata, kambe masiku ya 60 i nkarhi wo anama loko swi pimanisiwa na minongonoko yo tala ya vatirhisani.",
            ],
          },
          {
            id: "missing-commission",
            q: "Munhu u tsarise hi linki ya mina kambe a ndzi voni khomixini.",
            a: [
              "Hakanyingi i swa nkarhi: ku tsarisa ku humelela eka dashibodo endzhaku ka timinete, kambe khomixini yi tsariwa ntsena loko mbhaliso wu hakeriwile hakunene (leswi swi nga teka masiku loko a ri eka ndzingo wa mahala). Languteni nakambe endzhaku ka loko ndzingo wu herile.",
              "Loko mbhaliso wu hakeriwile kambe ma ha nga voni khomixini endzhaku ka tiawara ta 48, hi tsaleleni mi ri na nkarhi wa kwalomu ka ku tsarisa na imeyili kumbe vito ra kwalomu ra mutsarisi loko mi ri tiva. Ntlawa wu ta lavisisa ndlela ya ku hlayeriwa naswona wu lulamisa xihoxo xin'wana na xin'wana hi voko.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Swa ntolovelo",
        items: [
          {
            id: "what-is-gadit",
            q: "Xana Gadit i yini?",
            a: [
              "Dikixinari ya tindzimi to tala leyi akiweke leswaku rito ri twala hakunene, ku nga ri ku nyika nhlamuselo ya layini yin'we ntsena. Rito rin'wana na rin'wana ri pfuleka na tinhlamuselo ta rona hinkwato, swikombiso swa xiviri eka nhlamuselo yin'wana na yin'wana, swivulavulelo, masungulo, xifaniso lexi nga bohiki, na (hi Clear na Deep) nhlamuselo leyi vana va yi twisisaka, ku tsala xivulwa xa n'wina mi kuma switsundzuxo, na mavutiso.",
              "Sweswi ku na tindzimi ta xitirhisiwa ta 30+. Endzeni ka ntlawa hi swi vitana ku GAD rito: ku twisisa rito ku fikela emakumu, ku nga ri ku ri hundzuluxela ntsena.",
            ],
          },
          {
            id: "languages",
            q: "Xana mi seketela tindzimi tihi?",
            a: [
              "Xitirhisiwa: Xinghezi, Xigriki, Xiheberu, Xiarabu, Xirhaxiya, Xipaniya, Xiputukezi, Xifurwa, Xijarimani, Xicheki, Xislovaki, Xitaliyana, Xijapani, Xizulu.",
              "Mi nga lava rito hi ririmi rin'wana na rin'wana ra tindzimi teto kutani mi kuma nhlamuselo, swikombiso, na swin'wana hinkwaswo hi ririmi ra xitirhisiwa leri mi ri hlawuleke. Xiheberu na Xiarabu swi tsariwa hi ku helela ku suka exineneni ku ya eximatsini naswona swi tirhisa titsalwa ta swona.",
            ],
          },
          {
            id: "kid-safety",
            q: "Xana Gadit yi hlayisekile eka vana?",
            a: [
              "Gadit yi endleriwe leswaku mutswari a yi tirhisa hi ndlela leyi hlayisekeke a ri na n'wana. Xiyimo xa vana xi endla tinhlamuselo to olova, leti kongomeke, leti fambelanaka na malembe (kwalomu ka xiyimo xa malembe ya 5 ku ya eka 10), hi ku tirhisa njini leyi fanaka na leyi endlaka vuxokoxoko bya vanhu lavakulu yi ri na swiletelo swo kongoma swo olovisa. A ku na vuxokoxoko lebyi tsariweke hi vatirhisi lebyi kombisiwaka vana nikatsongo.",
              "Hi ku landza tipholisi ta hina na milawu ya xihundla xa vana emisaveni hinkwayo, ku va na akhawunti hi wexe swi sungula hi malembe ya 13 ku ya ehenhla. Ndlela ya ntolovelo i akhawunti ya mutswari leyi mutswari a yi tirhisaka swin'we na n'wana wa yena, leswi hi swona Xiyimo xa vana xi endleriweke swona.",
            ],
          },
          {
            id: "data",
            q: "Xana vuxokoxoko bya mina byi hlayisiwa kwihi? Xana ma byi xavisa?",
            a: [
              "Akhawunti, matimu, buku ya marito, na swifaniso leswi endliweke swi hlayisiwa hi ndlela leyi sirhelelekeke eka Firebase, swi fihliwile hi khodi eka vuhlayiselo. A hi xavisi vuxokoxoko bya n'wina eka munhu na un'we. Hi avelana ntsena leswi lavekaka ku tirhisa Gadit (vuhlayiselo, ku hakela, vanyiki va vuxokoxoko), hilaha swi hlamuseriweke hakona eka Pholisi ya Xihundla.",
              "Mi nga humesa buku ya n'wina ya marito kumbe ku susa akhawunti ya n'wina nkarhi wun'wana na wun'wana eka tluka ra Akhawunti.",
            ],
          },
          {
            id: "contact-direct",
            q: "Ndzi mi kuma njhani hi ku kongoma?",
            a: [
              "Tirhisani buthoni ya imeyili ehansi ka tluka leri. Yi kongoma eka bokisi ra timeyili ra ntlawa. Rungula rin'wana na rin'wana ri hlayiwa naswona ri hlamuriwa endzhaku ka tiawara ta 24 ku ya eka 48 (hakanyingi hi ku hatlisa).",
              "Imeyili yi antswa ku tlula bulo eka mpfuno: yi nyika ntlawa nkarhi wo hlaya hi vukheta no hlamula hi ku ehleketa. Mpfuno hi riqingho a wu si nyikiwa.",
            ],
          },
        ],
      },
    ],
  },
  ss: {
    eyebrow: "Sikhungo Selusito",
    heading: "Tfola imphendvulo, masinyane.",
    lede: "Imibuto levamile netisombululo tesinyatselo ngesinyatselo, letihlelwe ngetindzawo. Uma ungayiboni inkinga yakho, xhumana nelicembu ngentasi.",
    stillNeedHelpHeading: "Usabambekile?",
    stillNeedHelpBody: "Sibhalele ngco. Wonkhe umlayeto ufundvwa licembu futsi uphendvulwa ngekhatsi kwelilanga linye nobe lamabili.",
    emailCta: "Sitfumelele i-imeyili",
    responseTime: "Imphendvulo levamile: ngekhatsi kwemahora langu-24 kuya ku-48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Tinkhokhelo nekubhalisa",
        items: [
          {
            id: "change-card",
            q: "Ngilishintja njani likhadi lesikweleti ekubhaliseni kwami?",
            a: [
              "Ungashintjela kulikhadi lelisha ngaphansi kwemzuzu ngaphandle kwekukhansela. Kubhalisa kwakho kwanyalo kuchubeka, kodvwa ngelikhadi lelisha.",
              "1. Ngena ku-gadit.app bese uvula likhasi le-Akhawunti yakho (etulu ngesekudla). 2. Cindzetela \"Phatsa tinkhokhelo\". 3. Kuvuleka likhasi le-Stripe lelivikelekile. Cindzetela \"Add payment method\", faka likhadi lelisha, bese ulibeka njengeleli-Default. 4. Uma utsandza, susa likhadi lelidzala.",
              "Kusukela esikhatsini lesilandzelako sekukhokha, konkhe kuya kulikhadi lelisha. Inkhokhelo yangaphambilini (lesekhokhiwe) ihlala kulikhadi lelidzala. Akudzingeki kubuyiselwa imali ngaphandle uma uyifuna ngempela.",
            ],
          },
          {
            id: "cancel",
            q: "Ngikukhansela njani kubhalisa kwami?",
            a: [
              "Utentela wena, nobe nini. Ngena, vula i-Akhawunti, bese ucindzetela Khansela kubhalisa ngentasi kwelihlelo lakho.",
              "Kungena kwakho kuchubeka kuze kuphele sikhatsi lesesikhokhele. Ngemuva kwaloko i-akhawunti ibuyela ku-Basic (mahhala). Emagama lowagcinile, umlandvo, nencwadzi kuhlala kuphephile futsi kuyatfolakala.",
              "Uma ukhansela ngephutsa nobe ushintja umcondvo, ungachubeka nekubhalisa kulelo khasi ngaphambi kwekutsi sikhatsi siphele.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ngishintja njani kusuka ku-Clear kuya ku-Deep (nobe ngalenye indlela)?",
            a: [
              "I-Akhawunti, bese Phatsa tinkhokhelo, bese Vuselela kubhalisa. Khetsa lihlelo lelisha.",
              "I-Stripe ibala umehluko wenani ngekwayo, ngekwemalanga lasele esikhatsini sanyalo. Uma ukhuphula, utawukhokhiswa umehluko kuphela kulesikhatsi lesisele. Uma wehlela kulizinga lelincane, imali lesele isetjentiswa enkhokhelweni yakho lelandzelako.",
            ],
          },
          {
            id: "invoice",
            q: "Ngilandza njani i-invoyisi nobe lirisidi?",
            a: [
              "I-Akhawunti, bese Phatsa tinkhokhelo, bese Umlandvo wema-invoyisi. Yonkhe inkhokhelo inelirisidi le-PDF lelilandzekako lelinemininingwane yekukhokha loyigcinile.",
              "Uma udzinga libito lelehlukile, likheli, nobe inombolo yentsela ku-invoyisi (sibonelo libito lenkampani ngetinjongo tentsela), vuselela imininingwane yekukhokha kulelo khasi ngaphambi kwekulandza. Lirisidi lelilandzelako litawusebentisa imininingwane lemisha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ngicindzetele Phatsa tinkhokhelo kodvwa ngatfola liphutsa. Ngentenjani nyalo?",
            a: [
              "Kunetimbangela letimbili letivamile. Kwekucala, i-akhawunti yakho ayinako kubhalisa kwe-Stripe lokusebentako. Kwesibili, i-Stripe kungenteka ingakabi naphrofayili yekukhokha lephelele ye-akhawunti yakho.",
              "Kuhlola lokulula kwekucala: phuma, ungene futsi nge-imeyili lowayisebentisa ekukhokheni, bese uphindza uzama. Uma kusehluleka, xhumana natsi une-imeyili ye-akhawunti yakho futsi licembu litakulungisa ngasohlangotsini lwetfu ngemzuzu.",
            ],
          },
          {
            id: "autorenew",
            q: "Kubhalisa kwami kutawuvuseleleka ngekwako yini?",
            a: [
              "Yebo. Emahlelo enyanga avuseleleka nyanga yonkhe, emahlelo emnyaka avuseleleka minyaka yonkhe ngelilanga lelifanako. Ungabona lilanga lekukhokha lelilandzelako ku-akhawunti yakho nasesangweni le-Stripe.",
              "Uma ungafuni kuvuselelwa ngekwako, khansela nobe nini ngaphambi kwelilanga lekuvuselela. Kukhansela akwenteki masinyane. Ugcina kungena kuze kuphele sikhatsi lesesikhokhele.",
            ],
          },
          {
            id: "refund",
            q: "Ngingabuyiselwa imali yini?",
            a: [
              "Yebo. Uma kutsenga kwenteke emalanga langaphansi kwa-14 lendlulile futsi lusito lungakasetjentiswa kakhulu, sibhalele une-imeyili ye-akhawunti yakho kanye nenchazelo lefishane yekutsi kungani. Leto timali letibuyiselwako tiyavunywa ngaphandle kwenkinga.",
              "Uma sekudlule emalanga langetulu kwa-14, licembu likubuka ngalinye ngalinye. Khansela kubhalisa kute kungachubeki nekuvuseleleka, bese usitfumelela i-imeyili.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ngibona inkhokhelo lengingayati.",
            a: [
              "Tinkhokhelo tivela njenge-GADIT nobe GADIT.APP ne-$2.99 (Clear ngenyanga), $4.99 (Deep ngenyanga), $29.99 (Clear ngemnyaka), nobe $49.99 (Deep ngemnyaka). Uma ingafanani, kungenteka ivela kulolunye lusito.",
              "Uma uciniseka kutsi akusiyo yakho, ungakayiphikisi ebhange okwamanje. Sibhalele ngco kucala, usitjele lilanga nelinani lemali. Licembu litayitfola, lichaze kutsi iyini, futsi libuyisele imali uma kudzingeka. Kuphikisa ebhange kungenta tinkhokhelo letitako tibe lukhuni, ngako kuyilungisa ngelusito kuvame kusheshe futsi kuphephe kakhulu.",
            ],
          },
          {
            id: "failed-payment",
            q: "Inkhokhelo yami yehlulekile. Kufanele ngentenjani?",
            a: [
              "I-Stripe iphindza ngekwayo tinkhokhelo letehlulekile tikhatsi letimbalwa emalangeni lalandzelako. Kwehluleka lokunyenti kuyalungiseka ngekwako nangabe libhange likhulula kubanjwa nobe likhadi linemali leyenele.",
              "Uma ufuna kukulungisa masinyane, hamba ku-Akhawunti → Phatsa tinkhokhelo → Add payment method, faka likhadi lelisebentako, bese ulibeka njenge-Default. I-Stripe itawuphindza inkhokhelo leyehlulekile masinyane kulikhadi lelisha. Uma kubhalisa kwakho sekubuyele ku-Basic, ungabhalisa kabusha kusuka ku-Emanani futsi incwadzi yakho ihlala injalo.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Uyini umehluko emkhatsini we-Basic, Clear, ne-Deep?",
            a: [
              "Basic (mahhala): kusesha emagama lokufika ku-20 ngelilanga, tonkhe tinchazelo, tibonelo kunchazelo ngayinye, tisho, nemvelaphi yeligama. Akudzingeki kubhalisa kusesha lokuyisisekelo.",
              "Clear ($2.99/ngenyanga nobe $29.99/ngemnyaka): kusesha ngaphandle kwemkhawulo, tinchazelo letifanele bantfwana, sitfombe saligama ngalinye (30/ngenyanga), kubhala umusho wakho kanye nemibono, imininingwane yetisho, nemalanga langu-30 emlandvo wekusesha.",
              "Deep ($4.99/ngenyanga nobe $49.99/ngemnyaka): konkhe lokuku-Clear, kanye nemibuto yekuticecesha, incwadzi yakho yemagama lenekuticecesha lokuhlakaniphile lokuphindza ngetikhatsi, kuhlukanisa emagama lafanako, nesabelo setitfombe lesikhulu (100/ngenyanga).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "I-akhawunti nekungena",
        items: [
          {
            id: "no-verification-email",
            q: "Angikayitfoli i-imeyili yekucinisekisa.",
            a: [
              "Hlola emafolda e-spam ne-promotions kucala. I-Gmail ne-Outlook ngaletinye tikhatsi tiyisa ema-imeyili e-akhawunti lapho kuze uphawule leyinye njenge-\"Not spam\".",
              "Uma ingekho lapho, kungenteka i-imeyili ibhalwe kabi ekubhaliseni. Zama kubhalisa futsi uhlole kahle likheli. Uma ubhalise nge-Google, akudzingeki i-imeyili yekucinisekisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ngikhohlwe liphasiwedi lami.",
            a: [
              "Vula libhokisi lekungena bese ucindzetela \"Ukhohlwe liphasiwedi?\". Faka i-imeyili loyisebentisela Gadit futsi utawutfola lilinki lekusetha kabusha ngekhatsi kwemzuzu munye nobe lemibili.",
              "Uma i-imeyili ingafiki, hlola ku-spam. Uma isangafiki, kungenteka ubhalise nge-Google esikhundleni se-imeyili neliphasiwedi. Zama inkinobho letsi \"Chubeka nge-Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ngiciniseka kutsi liphasiwedi lami lilungile kodvwa kutsi \"I-imeyili nobe liphasiwedi akulungi\".",
            a: [
              "Tintfo letintsatfu tekuhlola. Kwekucala, i-capslock. Kwesibili, sikhala ekugcineni nawukopisha uphindze unamatsisele. Kwesitsatfu, ubhalise nge-Google kunekutsi ubhalise ngeliphasiwedi (sebentisa \"Chubeka nge-Google\" esikhundleni saloko).",
              "Usabambekile? Setha kabusha liphasiwedi kulelo bhokisi. Kukucalisa kabusha kahle.",
            ],
          },
          {
            id: "google-fails",
            q: "Kungena nge-Google akusebenti.",
            a: [
              "Imbangela levame kakhulu: i-browser yakho ivimba ema-cookie langesiwo e-gadit.app nobe ema-pop-up. Kuvumele etimvumweni temugca wekheli bese uphindza uzama.",
              "Uma usesimeni se-incognito, kungena nge-Google kuvinjelwe ngenhloso. Shintjela efasiteleni le-browser lelijwayelekile.",
            ],
          },
          {
            id: "change-email",
            q: "Ngiyishintja njani i-imeyili ku-akhawunti yami?",
            a: [
              "I-Akhawunti, cindzetela i-imeyili yakho, Shintja i-imeyili. Kutawudzingeka ucinisekise likheli lelisha ngaphambi kwekutsi lisebente. Kubhalisa kwakho, umlandvo, nencwadzi konkhe kuyadluliselwa.",
              "Uma i-imeyili ixhunywe kulikhasimende le-Stripe, yivuselele nasesangweni lekukhokha le-Stripe kute emarisidi latako aye kulikheli lelisha.",
            ],
          },
          {
            id: "delete-account",
            q: "Ngiyicisha njani i-akhawunti yami?",
            a: [
              "I-Akhawunti, ngentasi kwelikhasi, Cisha i-akhawunti. Loku kwanomphela. Kubhalisa kwakho kuyakhanselwa, incwadzi yakho nemlandvo kuyasulwa, futsi i-imeyili iyakhululeka kute kubhaliswe kabusha.",
              "Emarekhodi e-Stripe etinkhokhelo tangaphambilini ayahlala (umtsetfo usibophelela kutsi siwagcine ngetinjongo tekubalwa kwemali). Kute lokunye lokuhlalako.",
            ],
          },
          {
            id: "share-account",
            q: "Umlingani wami nobe umntfwana wami angayisebentisa nami i-akhawunti yami?",
            a: [
              "Umsebentisi munye longenile nge-akhawunti ngasinye sikhatsi. Simo sebantfwana sivumela i-akhawunti yinye ye-Clear nobe ye-Deep kutsi isebentele umtali nemntfwana: shintja inkinobho futsi tinchazelo tivela tifanele bantfwana ngaphandle kwekungena lokwehlukene.",
              "Kubantfu labadzala lababili labafuna tincwadzi nenchubekelembili lehlukene, vulani ema-akhawunti lamabili. Clear ngu-$2.99 ngenyanga nge-akhawunti ngayinye.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ngicabanga kutsi nginema-akhawunti lamabili ngephutsa. Ngentenjani nyalo?",
            a: [
              "Loku kuvame kwenteka nangabe umuntfu abhalisa kanye nge-Google futsi kanye nge-imeyili neliphasiwedi asebentisa likheli lelifanako, nobe nangabe ubhalisa kabili ngema-imeyili lehlukene. Kubhalisa ngakunye kudala i-akhawunti ye-Gadit lehlukile lenencwadzi yayo, umlandvo wayo, nesimo sayo sekubhalisa.",
              "Sibhalele unawo omabili ema-imeyili (nobe ema-UID lavela ekhasini le-Akhawunti) kanye nekutsi nguyiphi lofuna kuyigcina. Licembu litawuhlanganisa tincwadzi nemlandvo ku-akhawunti loyikhetsile, bese livala lenye kahle. Kute imininingwane lelahlekako.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Kusebentisa Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ngicabanga kutsi inchazelo ayilungi. Ngentenjani?",
            a: [
              "Lonkhe likhasi lemphumela linenkinobho lencane letsi \"Bika\" ngentasi. Yicindzetele, ukhetse luhlobo (inchazelo, imvelaphi, sibonelo, sisho, inchazelo yebantfwana, nalokunye) bese ubhala inchazelo lefishane. Iya ngco elicenjini futsi wonkhe umbiko uyabuketwa.",
              "Ungakhatsateki ngekutsi ucinisa kakhulu. Sichazamagama siba ncono ngalemibono masinyane kunanobe yini lenye.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Simo sebantfwana asiyishintji inchazelo.",
            a: [
              "Simo sebantfwana sishintja umbhalo kuphela lapho ligama selinenchazelo lefanele bantfwana leseyidaliwe. Emagameni lamasha nya losandza kuwasesha, linda imizuzwana lesuka ku-10 kuya ku-15. Inchazelo lefanele bantfwana idalwa khona lapho kwekucala.",
              "Futsi: simo sebantfwana sidzinga i-Clear nobe i-Deep. Uma use-Basic, inkinobho itakucela kutsi ukhuphule. Basebentisi labangatiwa bacelwa kutsi babhalise.",
            ],
          },
          {
            id: "voice-fails",
            q: "Kusesha ngelivi akusebenti.",
            a: [
              "Kusesha ngelivi kudzinga imvumo ye-microphone. Ema-browser lamanyenti abuta kanye kusayithi ngalinye. Uma ucindzetele Block ngephutsa, kutawudzingeka ukubuyisele ngesandla: cindzetela lithonjana lekhiye nobe lemininingwane eceleni kwa-gadit.app emugceni wekheli, bese Site settings, bese Microphone, bese Allow.",
              "Ku-Safari ye-iOS, kungena kwe-microphone kudzinga nenkinobho ku-Settings → Safari → Microphone. Livi nyalo litfolakala ku-Clear nase-Deep: basebentisi be-Basic babona sicelo sekukhuphula, tivakashi letingakangeni tibona sicelo sekungena.",
            ],
          },
          {
            id: "no-image",
            q: "Angikhoni kudala sitfombe saleligama.",
            a: [
              "Kudalwa kwetitfombe kutfolakala ku-Clear nobe ku-Deep kanye nesabelo senyanga. Clear itfola titfombe letingu-30 ngenyanga, Deep itfola leti-100. Uma usisebentisile sonkhe sabelo, utawubona ludvonga. Sicala kabusha mhla lu-1 enyangeni ngayinye.",
              "Uma ungakafiki esabelweni futsi usabona kwehluleka, kuvame kuba ngulokwesikhashana. Phindza uzame ngemuva kwemizuzwana lengu-30. Kwehluleka lokuchubekako kuyinkinga yesistimu. Sicela ubike kusuka ekhasini leligama.",
            ],
          },
          {
            id: "save-word",
            q: "Ngiligcina njani ligama encwadzini yami?",
            a: [
              "Kunobe nguliphi likhasi lemphumela weligama, cindzetela Gcina encwadzini eceleni kwesihloko. Incwadzi itfolakala ku-Clear nase-Deep, lapho ungabuyeketa khona emagama lowagcinile ngemuva, uwabone ekubukeni kwetinkhanyeti, futsi wente kuticecesha lokuhlakaniphile (Deep).",
              "Emagama lowagcinile futsi lowavulile nangabe kanye ayatfolakala ngaphandle kwe-inthanethi kusuka ku-cache lesedivayisini. Liphakethe langaphandle kwe-inthanethi ligcina nemagama ladvume kakhulu elulwimini lwakho kute ulungele ngaphandle kwe-inthanethi.",
            ],
          },
          {
            id: "offline",
            q: "Simo sangaphandle kwe-inthanethi sisebenta njani?",
            a: [
              "Emagama losawabukile agcinwa edivayisini. Wavule futsi ngaphandle kwe-inthanethi futsi ayavuleka masinyane. Liphakethe lonkhe langaphandle kwe-inthanethi (emagama laphambili elulwimini lwakho) liyalandzwa uma ulicela ekhasini lencwadzi.",
              "Kusesha ligama lelisha nya kusadzinga kuxhumana, ngobe Gadit kufanele idale inchazelo kusukela ekucaleni. Kugcinwa kwangaphandle kwe-inthanethi kwentelwe emagama losawahlolile.",
            ],
          },
          {
            id: "slow",
            q: "I-app ibonakala ihamba kancane.",
            a: [
              "Kusesha kwekucala kweligama kuhamba kancane kakhulu ngobe Gadit idala umphumela lophelele kusukela ekucaleni: imizuzwana lembalwa kuvamile, ngaletinye tikhatsi kudze kakhulu kumagama lalukhuni. Kusesha lokulandzelako kwaleligama lelifanako kwenteka masinyane, kusuka ku-cache.",
              "Uma konkhe kuhamba kancane, zama kuvuselela ngemandla: Cmd+Shift+R ku-Mac, Ctrl+Shift+R ku-Windows. Uma kuhamba kancane kuchubeka kuwo onkhe emakhasi, sicela usitfumelele i-imeyili unelive lakho ne-browser kute licembu lihlole indlela ye-network leya kuma-server etfu kusuka esifundzeni sakho.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ngiseshe ligama kodvwa angatfolanga umphumela. Kwentekani?",
            a: [
              "Kwekucala, hlola kupela. Gadit ivame kulungisa emaphutsa lamancane ekubhala, kodvwa inkhamisa lengakalungi nobe inhlamvu lengekho kungayidida. Zama kulungisa lokuphakanyisiwe uma kuvela.",
              "Ngaphandle kwaloko: emagama langavamile kakhulu nobe esitsetselo angahle angabuyisi umphumela lowetsembekile. Uma uciniseka kutsi ligama likhona ngempela, cindzetela inkinobho letsi Bika ekhasini lemphumela (nobe esikrinini seliphutsa) usatise. Wonkhe umbiko uyabuketwa futsi emagama langempela lebekaphutselwe ayabuyiselwa ehlelweni.",
            ],
          },
          {
            id: "change-language",
            q: "Ngilushintja njani lulwimi lwesikrini?",
            a: [
              "Etulu ngesekudla kunobe nguliphi likhasi, utawubona lithonjana lelincane lelifulegi (nobe libito lelulwimi lwakho lwanyalo). Licindzetele bese ukhetsa kuletilwimi letingetulu kwa-30: siNgisi, siGriki, siHebheru, si-Arabhu, siRashiya, siSpanishi, siPutukezi, siFulentshi, siJalimane, siCheki, siSlovaki, si-Italiya, siJaphani, siHindi, si-Amharic, siZulu.",
              "Lokukhetsile kugcinwa kulelithuluzi. Konkhe kulayisha kabusha ngelulwimi lolusha: sikrini, ema-menyu, tinchazelo temagama letitako, tibonelo, tinchazelo tebantfwana, ngisho nemvelaphi. Imiphumela lesigciniwe ngelulwimi lwangaphambilini ihlala kuze uphindze usesha lawo magama.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Luhlelo lwebalingani",
        items: [
          {
            id: "join-partner",
            q: "Ngiba njani ngumlingani we-Gadit?",
            a: [
              "Vula /partners kunobe nguliphi likhasi bese ucindzetela \"Yiba ngumlingani\". Bhalisa ngelibito lakho ne-imeyili, futsi lilinki lakho lekuncoma kanye nelibhodi lekulandzelela kucindzetelwa netikhomishini kulungile masinyane. Akulindwa kuvunywa.",
              "Kujoyina kumahhala futsi kuvulekele wonkhe umuntfu. Awudzingi kubhalisa ku-Gadit kute ube ngumlingani.",
            ],
          },
          {
            id: "commission-model",
            q: "Tikhomishini tibalwa njani?",
            a: [
              "Imigomo lejwayelekile ngu-25% wayo yonkhe inkhokhelo likhasimende leliyenta emnyakeni walo wekucala. Ngemuva kwalowo mnyaka wekucala, utfola 10% wayo yonkhe inkhokhelo uma nje likhasimende lisachubeka likhokha.",
              "Loku kusebenta ngendlela lefanako kumahlelo enyanga nawemnyaka, ngobe ikhomishini ibalwa enkhokhelweni ngayinye yangempela. Uma likhasimende likhansela, ikhomishini yakho iyema enkhokhelweni yalo yekugcina.",
              "Licembu lingabeka emazinga lehlukene kubalingani labatsite. Emazinga akho ahlala abonakala elibhodini lakho lemlingani, longalifinyelela kusuka ku-/partners.",
            ],
          },
          {
            id: "payout",
            q: "Ngikhokhelwa nini?",
            a: [
              "Ngenyanga, nangabe imali yakho seyidlula $50. Sisebentisa indlela yekukhokhela loyibeke elibhodini lemlingani (kudlulisela ebhange, i-PayPal, nalokunye). $50 ngumkhawulo lophansi, akusiwo umkhawulo lophakeme. Ungatfola lokunyenti kakhulu, utfola nje inkhokhelo nawudlula lomkhawulo.",
              "Tikhomishini tikhululwa emalanga langu-30 ngemuva kwenkhokhelo yekubhalisa, kute kuvunyelwe sikhatsi sekubuyiselwa kwemali. Ngako kubhalisa kwaJanuwari kukhululwa ekucaleni kwaFebruwari futsi kungena enkhokhelweni yakho lelandzelako nangabe imali yakho idlula $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ngijoyinile kodvwa libhodi lami alinalutfo.",
            a: [
              "Tibalo tivela ngemuva kwekucindzetelwa kwekucala kwelilinki lakho. Kungabi nalutfo kusho nje kutsi kute losacindzetele. Hamba wabelane ngelilinki. Libhodi liyavuseleleka cishe masinyane nangabe kusebenta sekucalile.",
              "Uma wabelene futsi umuntfu wabhalisa kodvwa libhodi lingakukhombisi, sibhalele usitjele sikhatsi lesilinganisiwe sekubhalisa futsi licembu litawuhlola kubalwa kwakho.",
            ],
          },
          {
            id: "attribution-window",
            q: "Lilinki lami lekuncoma lichubeka lilandzelela sivakashi sikhatsi lesingakanani?",
            a: [
              "Emalanga langu-60. Nangabe sivakashi sicindzetela lilinki lakho, sibeka i-cookie lekukhomba njengalowo locomile. Uma sibhalisa futsi sikhokha nobe nini emalangeni langu-60 latako (ngisho nangabe sishiya lisayithi bese sibuya ngemuva nge-Google), kubalwa kusakwakho.",
              "Kusulwa kwema-cookie: uma sivakashi sisula ema-cookie aso nobe sishintja i-browser/lithuluzi ngaphambi kwekubhalisa, kubalwa kungalahleka. Kute indlela yekugwema loko, kodvwa emalanga langu-60 sikhatsi lesinyenti uma kucatsaniswa nemahlelo lamanyenti ebalingani.",
            ],
          },
          {
            id: "missing-commission",
            q: "Umuntfu ubhalise ngelilinki lami kodvwa angiyiboni ikhomishini.",
            a: [
              "Kuvame kuba yindzaba yesikhatsi: kubhalisa kuvela elibhodini ngekhatsi kwemizuzu, kodvwa ikhomishini ibhalwa kuphela nangabe kubhalisa sekukhokhelwe ngempela (lokungaba ngemuva kwemalanga uma basekulingeni kwamahhala). Phindza uhlole ngemuva kwekuphela kwekulinga.",
              "Uma kubhalisa kukhokhelwe kodvwa usayiboni ikhomishini ngemuva kwemahora langu-48, sibhalele usitjele sikhatsi lesilinganisiwe sekubhalisa kanye ne-imeyili nobe libito lembhalisi uma ulati. Licembu litawuhlolisisa kubalwa futsi lilungise nobe yini lengekho ngesandla.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Lokuvamile",
        items: [
          {
            id: "what-is-gadit",
            q: "Iyini Gadit?",
            a: [
              "Sichazamagama setilwimi letinyenti lesakhelwe kwenta ligama licace, hhayi kunika inchazelo yemugca munye nje. Ligama ngalinye livuleka nato tonkhe tinchazelo talo, tibonelo tangempela kunchazelo ngayinye, tisho, imvelaphi, sitfombe uma utsandza, kanye (nge-Clear ne-Deep) nenchazelo lefanele bantfwana, kubhala umusho wakho kanye nemibono, nemibuto.",
              "Nyalo tilwimi tesikrini letingetulu kwa-30. Ngekhatsi licembu likubita ngekutsi ku-GAD ligama: kucondza ligama kuze kube sekugcineni, hhayi kulihumusha nje.",
            ],
          },
          {
            id: "languages",
            q: "Nisekela tiphi tilwimi?",
            a: [
              "Sikrini: siNgisi, siGriki, siHebheru, si-Arabhu, siRashiya, siSpanishi, siPutukezi, siFulentshi, siJalimane, siCheki, siSlovaki, si-Italiya, siJaphani, siZulu.",
              "Ungasesha ligama nganobe nguluphi kuleto tilwimi futsi utfole inchazelo, tibonelo, nako konkhe lokunye ngelulwimi lwesikrini lolukhetsile. SiHebheru nesi-Arabhu tibhalwa ngalokuphelele kusuka ngesekudla kuya ngesencele (RTL) futsi tisebentisa emafonti ato emdzabu.",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit iphephile yini kubantfwana?",
            a: [
              "Gadit yakhelwe kutsi umtali ayisebentise ngekuphepha ahlanganyela nemntfwana. Simo sebantfwana sikhicita tinchazelo letilula, leticacile, letifanele iminyaka (cishe lizinga leminyaka lesuka ku-5 kuya ku-10), sisebentisa injini lefanako lesebentela lokucuketfwe kwebantfu labadzala kanye netinkhombandlela letibonakalako tekwenta kube lula. Kute lokucuketfwe lokubhalwe ngubasebentisi lokukhonjiswa bantfwana.",
              "Ngekuvumelana netinchubomgomo tetfu nemitsetfo yemfihlo yebantfwana emhlabeni wonkhe, kuba ne-akhawunti yakho uwedvwa kuvumeleke kusukela eminyakeni leli-13 kuya etulu. Indlela lejwayelekile yi-akhawunti yemtali leyisebentiswa ngumtali nemntfwana wakhe ndzawonye, futsi yiloko kanye Simo sebantfwana lesakhelwe kona.",
            ],
          },
          {
            id: "data",
            q: "Imininingwane yami igcinwa kuphi? Niyayitsengisa yini?",
            a: [
              "I-akhawunti, umlandvo, incwadzi, netitfombe letidaliwe kugcinwa ngekuphepha ku-Firebase, kubetelwe ngekhodi ekugcinweni. Asiyitsengisi imininingwane yakho kunobe ngubani. Sabelana kuphela ngaloko lokudzingekako kute Gadit isebente (kugcina, tinkhokhelo, labanikela ngalokucuketfwe), njengobe kuchaziwe ku-Inchubomgomo Yemfihlo.",
              "Ungakhipha incwadzi yakho nobe ucishe i-akhawunti yakho nobe nini ekhasini le-Akhawunti.",
            ],
          },
          {
            id: "contact-direct",
            q: "Nginitfola njani ngco?",
            a: [
              "Sebentisa inkinobho ye-imeyili ngentasi kwalelikhasi. Iya ngco ebhokisini lemiyalezo lelicembu. Wonkhe umlayeto uyafundvwa futsi uphendvulwa ngekhatsi kwemahora langu-24 kuya ku-48 (kaninyenti masinyane).",
              "I-imeyili incono kunengcoco ekutfoleni lusito: inika licembu litfuba lekufundza kahle nekuphendvula ngekucabangisisa. Lusito ngelucingo alukanikwa okwamanje.",
            ],
          },
        ],
      },
    ],
  },
  ve: {
    eyebrow: "Fhethu ha Thuso",
    heading: "Wanani phindulo, nga u ṱavhanya.",
    lede: "Mbudziso dzi ḓivheaho na nḓila dza u lugisa tshiṱepe nga tshiṱepe, dzo dzudzanywa nga masia. Arali ni sa vhoni thaidzo yaṋu, kwamani tshigwada afho fhasi.",
    stillNeedHelpHeading: "Ni kha ḓi kundwa?",
    stillNeedHelpBody: "Ri ṅwaleleni. Mulaedza muṅwe na muṅwe u vhalwa nga tshigwada nahone u fhindulwa nga ḓuvha ḽithihi kana mavhili.",
    emailCta: "Ri rumeleni imeiḽi",
    responseTime: "Kanzhi ri fhindula nga awara dza 24 u swika 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Mbadelo na ṅwaliso",
        items: [
          {
            id: "change-card",
            q: "Ndi shandukisa hani garaṱa ya tshelede ya ṅwaliso wanga?",
            a: [
              "Ni nga shandukela kha garaṱa ntswa nga tshifhinga tshi si tshinzhi u fhira minithi ni sa khansele. Ṅwaliso waṋu u bvela phanḓa u tshi shuma, nga garaṱa ntswa fhedzi.",
              "1. Dzhenani kha gadit.app ni vule siaṱari ḽaṋu ḽa Akhaunthu (nṱha tshanḓa tshi ḽa). 2. Kiḽikani \"Langani mbadelo\". 3. Siaṱari ḽo tsireledzeaho ḽa Stripe ḽi a vulea. Kiḽikani \"Add payment method\", dzhenisani garaṱa ntswa, ni i swaye sa Default. 4. Arali ni tshi ṱoḓa, bvisani garaṱa ya kale.",
              "U bva kha tshifhinga tshi tevhelaho tsha mbadelo, zwoṱhe zwi ya kha garaṱa ntswa. Mbadelo yo fhiraho (ye ya no badelwa) i dzula kha garaṱa ya kale. A hu ṱoḓei u humiselwa tshelede nga nnḓa ha musi ni tshi i ṱoḓa.",
            ],
          },
          {
            id: "cancel",
            q: "Ndi khansela hani ṅwaliso wanga?",
            a: [
              "Ni zwi ita inwi vhaṋe, tshifhinga tshiṅwe na tshiṅwe. Dzhenani, vulani Akhaunthu, ni kwame Khansela ṅwaliso fhasi ha pulane yaṋu.",
              "Ni dzula ni tshi dzhena u swika magumoni a tshifhinga tshe na tshi badela. Nga murahu akhaunthu i humela kha Basic (mahala). Maipfi aṋu o vhulungwaho, zwe na ṱoḓa, na bugu zwi dzula zwo tsireledzea nahone zwi tshi wanala.",
              "Arali na khansela nga vhukhakhi kana na shandula muhumbulo, ni nga bvela phanḓa na ṅwaliso kha siaṱari ḽeneḽo phanḓa ha musi tshifhinga tshi tshi fhela.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ndi shandukela hani u bva kha Clear u ya kha Deep (kana nga iṅwe nḓila)?",
            a: [
              "Akhaunthu, nga murahu Langani mbadelo, nga murahu Update subscription. Khethani pulane ntswa.",
              "Stripe i vhalela phambano ya mutengo nga yoṱhe, u ya nga maḓuvha o salaho kha tshifhinga tshi re hone. Arali ni tshi khwinifhadza, ni ḓo badelisa phambano fhedzi kha tshifhinga tsho salaho. Arali ni tshi shandukela kha pulane ya fhasi, tshelede yo salaho i ḓo shuma kha mbadelo yaṋu i tevhelaho.",
            ],
          },
          {
            id: "invoice",
            q: "Ndi ḓaunuḽoda hani invoisi kana rasiti?",
            a: [
              "Akhaunthu, nga murahu Langani mbadelo, nga murahu Invoice history. Mbadelo iṅwe na iṅwe i na rasiti ya PDF ine ya nga ḓaunuḽodiwa i na zwidodombedzwa zwa mbadelo zwe na zwi vhulunga.",
              "Arali ni tshi ṱoḓa dzina, adiresi, kana nomboro ya muthelo yo fhambanaho kha invoisi (tsumbo, dzina ḽa khamphani u itela muthelo), vusuluseni zwidodombedzwa zwaṋu zwa mbadelo kha siaṱari ḽeneḽo phanḓa ha u ḓaunuḽoda. Rasiti i tevhelaho i ḓo shumisa zwidodombedzwa zwiswa.",
            ],
          },
          {
            id: "portal-error",
            q: "Ndo kiḽika Langani mbadelo fhedzi nda wana vhukhakhi. Ndi ite mini?",
            a: [
              "Hu na zwiitisi zwivhili zwi ḓivheaho. Tsha u thoma, akhaunthu yaṋu a i na ṅwaliso wa Stripe u khou shumaho. Tsha vhuvhili, Stripe i nga vha i si athu u vha na phrofaiḽi yo fhelelaho ya mbadelo ya akhaunthu yaṋu.",
              "Ṱhoḓisiso ya u thoma yo leluwaho: bvani, dzhenani hafhu nga imeiḽi ye na i shumisa musi ni tshi badela, ni lingedze hafhu. Arali zwi tshi kha ḓi kundelwa, ri kwameni nga imeiḽi ya akhaunthu yaṋu nahone tshigwada tshi ḓo zwi lugisa nga minithi.",
            ],
          },
          {
            id: "autorenew",
            q: "Naa ṅwaliso wanga u ḓo vusuluswa nga woṱhe?",
            a: [
              "Ee. Pulane dza nga ṅwedzi dzi vusuluswa ṅwedzi muṅwe na muṅwe, pulane dza nga ṅwaha dzi vusuluswa ṅwaha muṅwe na muṅwe nga ḓuvha ḽeneḽo. Ni nga vhona ḓuvha ḽi tevhelaho ḽa mbadelo kha akhaunthu yaṋu na kha fhethu ha Stripe.",
              "Arali ni sa ṱoḓi u vusuluswa nga woṱhe, khanselani tshifhinga tshiṅwe na tshiṅwe phanḓa ha ḓuvha ḽa u vusulusa. U khansela a zwi iteli nga u ṱavhanya. Ni dzula ni tshi dzhena u swika magumoni a tshifhinga tshe na tshi badela.",
            ],
          },
          {
            id: "refund",
            q: "Naa ndi nga humiselwa tshelede?",
            a: [
              "Ee. Arali na renga hu sa athu u fhela maḓuvha a 14 nahone tshumelo i songo shumiswa nga maanḓa, ri ṅwaleleni nga imeiḽi ya akhaunthu yaṋu na mulaedza mupfufhi wa uri ndi ngani. U humiselwa honoho hu tendelwa hu si na nndwa.",
              "Arali ho fhira maḓuvha a 14, tshigwada tshi sedza nga nḓila ya mulandu muṅwe na muṅwe. Khanselani ṅwaliso uri u si bvele phanḓa u tshi vusuluswa, ni ri rumele imeiḽi.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ndi vhona mbadelo ine nda sa i ḓivhe.",
            a: [
              "Mbadelo dzi vhonala sa GADIT kana GADIT.APP dzi na $2.99 (Clear nga ṅwedzi), $4.99 (Deep nga ṅwedzi), $29.99 (Clear nga ṅwaha), kana $49.99 (Deep nga ṅwaha). Arali i sa tshimbilelani, i nga vha i tshi bva kha tshumelo iṅwe.",
              "Arali no khwaṱha uri a si yaṋu, ni songo thoma u i hanedza nga bannga yaṋu. Ri ṅwaleleni u thoma ni tshi ri ṋea ḓuvha na tshelede. Tshigwada tshi ḓo i wana, tsha ṱalutshedza uri ndi mini, nahone tsha humisa tshelede arali zwi tshi ṱoḓea. U hanedza nga bannga zwi nga konḓisa mbadelo dza tshifhingani tshi ḓaho, ngauralo u zwi lugisa nga thuso kanzhi zwi a ṱavhanya nahone zwo tsireledzea.",
            ],
          },
          {
            id: "failed-payment",
            q: "Mbadelo yanga yo kundelwa. Ndi ite mini?",
            a: [
              "Stripe i lingedza hafhu mbadelo dzo kundelwaho lunzhi nga maḓuvha a tevhelaho. Vhunzhi ha u kundelwa hu a ḓilugisa musi bannga i tshi bvisa khaedu kana garaṱa i tshi vha na tshelede yo linganaho.",
              "Arali ni tshi ṱoḓa u zwi lugisa zwino, iyani kha Akhaunthu → Langani mbadelo → Add payment method, dzhenisani garaṱa i shumaho, ni i vhee sa Default. Stripe i ḓo lingedza hafhu mbadelo yo kundelwaho nga u ṱavhanya kha garaṱa ntswa. Arali ṅwaliso waṋu wo no humela kha Basic, ni nga ḓiṅwalisa hafhu kha Mitengo nahone bugu yaṋu i dzula i hone.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Phambano vhukati ha Basic, Clear, na Deep ndi ifhio?",
            a: [
              "Basic (mahala): u swika kha u ṱoḓa maipfi ha 20 nga ḓuvha, ndeme dzoṱhe, tsumbo kha ndeme iṅwe na iṅwe, mirero, na vhubvo ha ipfi. A hu ṱoḓei u ḓiṅwalisa kha u ṱoḓa ha fhasi.",
              "Clear ($2.99/ṅwedzi kana $29.99/ṅwaha): u ṱoḓa hu si na mukano, ṱhalutshedzo dza vhana, tshifanyiso kha ipfi ḽiṅwe na ḽiṅwe (30/ṅwedzi), u ṅwala mutaladzi waṋu ni wane vhuṱanzi, zwidodombedzwa zwa mirero, na zwe na ṱoḓa kha maḓuvha a 30.",
              "Deep ($4.99/ṅwedzi kana $49.99/ṅwaha): zwoṱhe zwi re kha Clear, hu tshi engedzwa mbudziso dza nḓowelo, bugu ya muṋe i na nḓowelo ya vhuṱali ine ya vhuyelela nga zwifhinga, u fhambanya maipfi a fanaho, na zwifanyiso zwinzhi (100/ṅwedzi).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akhaunthu na u dzhena",
        items: [
          {
            id: "no-verification-email",
            q: "A tho ngo wana imeiḽi ya u khwaṱhisa.",
            a: [
              "Ṱolani u thoma kha spam na kha phuromoshini. Gmail na Outlook zwiṅwe zwifhinga dzi isa imeiḽi dza akhaunthu henefho u swika ni tshi swaya nthihi sa \"Not spam\".",
              "Arali i siho henefho, imeiḽi i nga vha yo ṅwalwa zwi si zwone musi ni tshi ḓiṅwalisa. Lingedzani u ḓiṅwalisa hafhu ni ṱole adiresi zwavhuḓi. Arali no ḓiṅwalisa nga Google, a hu ṱoḓei imeiḽi ya u khwaṱhisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ndo hangwa phasiwedi yanga.",
            a: [
              "Vulani fhethu ha u dzhena ni kiḽike \"No hangwa phasiwedi?\". Dzhenisani imeiḽi ine na i shumisa kha Gadit nahone ni ḓo wana vhukwamani ha u vusulusa nga minithi nthihi kana mbili.",
              "Arali imeiḽi i sa swiki, ṱolani kha spam. Arali i tshi kha ḓi sa swika, ni nga vha no ḓiṅwalisa nga Google hu si nga imeiḽi na phasiwedi. Lingedzani bathoni ya \"Bvelani phanḓa nga Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ndo khwaṱha uri phasiwedi yanga ndi yone fhedzi i ri \"Imeiḽi kana phasiwedi yo khakhea\".",
            a: [
              "Hu na zwithu zwiraru zwa u ṱola. Tsha u thoma, capslock. Tsha vhuvhili, tshikhala magumoni musi ni tshi kopa na u dzhenisa. Tsha vhuraru, no ḓiṅwalisa nga Google hu si nga phasiwedi (shumisani \"Bvelani phanḓa nga Google\").",
              "Ni kha ḓi kundwa? Vusuluseni phasiwedi kha fhethu honoho. Zwi ni thomisa hafhu zwo kuna.",
            ],
          },
          {
            id: "google-fails",
            q: "U dzhena nga Google a zwi shumi.",
            a: [
              "Tshiitisi tshi ḓivheaho nga maanḓa: burausa yaṋu i khou thivhela cookies dza vhaṅwe kana pop-ups kha gadit.app. Zwi tendeleni kha thendelo dza bara ya adiresi ni lingedze hafhu.",
              "Arali ni kha tshiimo tsha incognito, u dzhena nga Google ho thivhelwa nga zwiṱoḓwa. Shandukelani kha windo ḽa burausa ḽa misi yoṱhe.",
            ],
          },
          {
            id: "change-email",
            q: "Ndi shandukisa hani imeiḽi kha akhaunthu yanga?",
            a: [
              "Akhaunthu, kiḽikani imeiḽi yaṋu, Shandukani imeiḽi. Ni ḓo fanela u khwaṱhisa adiresi ntswa phanḓa ha musi i tshi shuma. Ṅwaliso waṋu, zwe na ṱoḓa, na bugu zwoṱhe zwi a pfulutshelwa.",
              "Arali imeiḽi yo vhofhiwa na muthengi wa Stripe, i vusuluseni na kha fhethu ha mbadelo ha Stripe uri rasiti dza tshifhingani tshi ḓaho dzi ye kha adiresi ntswa.",
            ],
          },
          {
            id: "delete-account",
            q: "Ndi phumula hani akhaunthu yanga?",
            a: [
              "Akhaunthu, fhasi ha siaṱari, Phumulani akhaunthu. Hezwi ndi zwa lini na lini. Ṅwaliso waṋu u a khanselwa, bugu yaṋu na zwe na ṱoḓa zwi a phumulwa, nahone imeiḽi i a vhofhololwa uri i shumiswe hafhu u ḓiṅwalisa.",
              "Rekhodo dza Stripe dza mbadelo dzo fhiraho dzi a sala (ri ṱoḓiwa nga mulayo u dzi vhulunga u itela akhaunthu dza tshelede). A hu na tshiṅwe tshine tsha sala.",
            ],
          },
          {
            id: "share-account",
            q: "Naa mufarisi wanga kana ṅwana wanga a nga shumisa akhaunthu yanga?",
            a: [
              "Mushumisi muthihi o dzhenaho kha akhaunthu nga tshifhinga. Tshiimo tsha vhana tshi tendela akhaunthu nthihi ya Clear kana Deep u shumela mubebi na ṅwana: shandukisani bathoni nahone ṱhalutshedzo dzi vha dza vhana hu si na u dzhena ho khethekanaho.",
              "Kha vhahulwane vhavhili vhane vhoṱhe vha ṱoḓa bugu na mvelaphanḓa zwo khethekanaho, itani akhaunthu mbili. Clear ndi $2.99 nga ṅwedzi kha akhaunthu iṅwe na iṅwe.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ndi humbula uri ndi na akhaunthu mbili nga vhukhakhi. Ndi ite mini?",
            a: [
              "Hezwi kanzhi zwi itea musi muthu a tshi ḓiṅwalisa luthihi nga Google na luthihi nga imeiḽi na phasiwedi a tshi shumisa adiresi nthihi, kana musi ni tshi ḓiṅwalisa luvhili nga adiresi dza imeiḽi dzo fhambanaho. U ḓiṅwalisa huṅwe na huṅwe hu ita akhaunthu ya Gadit yo khethekanaho i na bugu yayo, zwe ya ṱoḓa, na tshiimo tsha ṅwaliso.",
              "Ri ṅwaleleni ni tshi ri ṋea adiresi dza imeiḽi dzoṱhe (kana UID u bva kha siaṱari ḽa Akhaunthu) na uri ni ṱoḓa u dzula na ifhio. Tshigwada tshi ḓo ṱanganyisa bugu na zwe na ṱoḓa kha akhaunthu ine na i khetha, nga murahu tsha vala iṅwe zwavhuḓi. A hu na mafhungo ane a xela.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "U shumisa Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ndi humbula uri ṱhalutshedzo yo khakhea. Ndi ite mini?",
            a: [
              "Siaṱari ḽiṅwe na ḽiṅwe ḽa mvelelo ḽi na bathoni ṱhukhu ya \"Vhigani\" fhasi. I kwameni, khethani lushaka (ṱhalutshedzo, vhubvo ha ipfi, tsumbo, murero, ṱhalutshedzo ya vhana, na zwiṅwe) ni ṅwale mulaedza mupfufhi. U swika nga u ṱavhanya kha tshigwada nahone muvhigo muṅwe na muṅwe u a sedzwa.",
              "Ni songo vhilaela uri ni khou ṱolesa. Bugu ya maipfi i khwinifhala nga u ṱavhanya nga vhuṱanzi uhu u fhira nga tshiṅwe tshithu.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Tshiimo tsha vhana a tshi khou shandukisa ṱhalutshedzo.",
            a: [
              "Tshiimo tsha vhana tshi shandukisa ṱhaluso fhedzi hune ipfi ḽa vha ḽo no itelwa ṱhalutshedzo ya vhana. Kha maipfi maswa e na kha ḓi a ṱoḓa, lindani tshekoni dza 10 u swika 15. Ṱhalutshedzo ya vhana i itwa nga u ṱavhanya lwa u thoma.",
              "Nahone: tshiimo tsha vhana tshi ṱoḓa Clear kana Deep. Arali ni kha Basic, bathoni i ḓo ni humbela u khwinifhadza. Vhashumisi vha sa ḓivhiwi vha humbelwa u ḓiṅwalisa.",
            ],
          },
          {
            id: "voice-fails",
            q: "U ṱoḓa nga ipfi a zwi shumi.",
            a: [
              "U ṱoḓa nga ipfi hu ṱoḓa thendelo ya maikhirofoni. Burausa nnzhi dzi vhudzisa luthihi kha saiti iṅwe na iṅwe. Arali no kiḽika Block nga vhukhakhi, ni ḓo fanela u zwi humisa nga tshanḓa: kiḽikani aikhoni ya khiyo kana ya mafhungo tsini na gadit.app kha bara ya adiresi, nga murahu Site settings, nga murahu Microphone, nga murahu Allow.",
              "Kha Safari ya iOS, u dzhena ha maikhirofoni hu ṱoḓa na Settings → Safari → Microphone. Ipfi zwino ndi tshipiḓa tsha Clear na Deep: vhashumisi vha Basic vha vhona khumbelo ya u khwinifhadza, vhadaleli vha songo dzhenaho vha vhona khumbelo ya u dzhena.",
            ],
          },
          {
            id: "no-image",
            q: "A thi koni u ita tshifanyiso tsha ipfi.",
            a: [
              "U ita zwifanyiso ndi tshipiḓa tsha Clear kana Deep tshi re na mukano wa ṅwedzi. Clear i wana zwifanyiso zwa 30 nga ṅwedzi, Deep i wana 100. Arali no fhedza mukano, ni ḓo vhona luvhondo. Zwi thoma hafhu nga ḓuvha ḽa u thoma ḽa ṅwedzi muṅwe na muṅwe.",
              "Arali ni fhasi ha mukano nahone ni tshi kha ḓi vhona u kundelwa, kanzhi ndi zwa tshifhinganyana. Lingedzani hafhu nga murahu ha tshekoni dza 30. U kundelwa hu sa fheli ndi vhukhakhi. Ri humbela ni vhige u bva kha siaṱari ḽa ipfi.",
            ],
          },
          {
            id: "save-word",
            q: "Ndi vhulunga hani ipfi kha bugu yanga?",
            a: [
              "Kha siaṱari ḽiṅwe na ḽiṅwe ḽa mvelelo ya ipfi, kwamani Vhulungani kha bugu tsini na ṱhoho. Bugu ndi tshipiḓa tsha Clear na Deep hune na nga sedza hafhu maipfi o vhulungwaho nga murahu, na a vhona kha tshivhonalo tsha galaxy, na u ita nḓowelo ya vhuṱali (Deep).",
              "Maipfi e na a vhulunga nahone na a vula nga u fhungudza luthihi a a wanala hu si na inthanethe. Phakhethe ya hu si na inthanethe i vhulunga na maipfi a ḓivheaho nga maanḓa nga luambo lwaṋu uri ni vhe no lugela hu si na inthanethe.",
            ],
          },
          {
            id: "offline",
            q: "Tshiimo tsha hu si na inthanethe tshi shuma hani?",
            a: [
              "Maipfi e na no a vhona a vhulungwa kha tshishumiswa tshaṋu. A vuleni hafhu hu si na inthanethe nahone a ḓo vulea nga u ṱavhanya. Phakhethe yoṱhe ya hu si na inthanethe (maipfi a nṱha nga luambo lwaṋu) i ḓaunuḽodiwa musi ni tshi i ṱoḓa u bva kha siaṱari ḽa bugu.",
              "U ṱoḓa ipfi ḽiswa tshoṱhe hu kha ḓi ṱoḓa inthanethe, ngauri Gadit i fanela u ita ṱhalutshedzo u bva mathomoni. Zwo vhulungwaho hu si na inthanethe ndi zwa maipfi e na no a ṱoḓisisa.",
            ],
          },
          {
            id: "slow",
            q: "Apuḽikhesheni i a ongolowa.",
            a: [
              "U ṱoḓa ha u thoma ha ipfi ndi hone hu ongolowaho nga maanḓa ngauri Gadit i ita mvelelo yoṱhe u bva mathomoni: kanzhi tshekoni dzi si gathi, zwiṅwe zwifhinga zwi lapfa kha maipfi a konḓaho. U ṱoḓa hu tevhelaho ha ipfi ḽeneḽo hu a ṱavhanya, hu tshi bva kha zwo vhulungwaho.",
              "Arali zwoṱhe zwi tshi ongolowa, lingedzani u vusulusa nga maanḓa: Cmd+Shift+R kha Mac, Ctrl+Shift+R kha Windows. Arali u ongolowa hu tshi bvela phanḓa kha masiaṱari oṱhe, ri rumeleni imeiḽi ni tshi ri vhudza shango ḽaṋu na burausa uri tshigwada tshi ṱole nḓila ya inthanethe u bva tshiṱirikini tshaṋu u ya kha maseva ashu.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ndo ṱoḓa ipfi fhedzi a tho ngo wana mvelelo. Hu khou itea mini?",
            a: [
              "Tsha u thoma, ṱolani mupeleto. Gadit kanzhi i lugisa vhukhakhi vhuṱuku ha u ṅwala, fhedzi vokhali yo khakheaho kana ḽeḓere ḽi si ho zwi nga i vhilaedza. Lingedzani tshilugiso tsho themendelwaho arali tshi tshi vhonala.",
              "Nga nnḓa ha zwenezwo: maipfi a sa wanali kanzhi kana a slang a nga sa ṋee mvelelo yo khwaṱhaho. Arali no khwaṱha uri ipfi ndi ḽa vhukuma, kiḽikani bathoni ya Vhigani kha siaṱari ḽa mvelelo (kana kha tshikirini tsha vhukhakhi) ni ri ḓivhadze. Muvhigo muṅwe na muṅwe u a sedzwa nahone maipfi a vhukuma e a vha a siho a dzheniswa kha sisiṱeme.",
            ],
          },
          {
            id: "change-language",
            q: "Ndi shandukisa hani luambo lwa tshikirini?",
            a: [
              "Nṱha tshanḓa tshi ḽa kha siaṱari ḽiṅwe na ḽiṅwe, ni ḓo vhona aikhoni ṱhukhu ya fulaga (kana dzina ḽa luambo lwaṋu lwa zwino). I kwameni ni khethe kha nyambo dza 30+: Luisimane, Lugerika, Luheberu, Luarabu, Lurashia, Lusipenishi, Luphothugisi, Lufurentshi, Lujeremane, Lutsheke, Luslovakia, Lutaliana, Lujapani, Luhindi, Luamhariki, Luzulu.",
              "Khetho yaṋu i vhulungwa kha tshishumiswa itshi. Zwoṱhe zwi vulea hafhu nga luambo luswa: tshikirini, menyu, ṱhalutshedzo dza maipfi dza tshifhingani tshi ḓaho, tsumbo, ṱhalutshedzo dza vhana, na vhubvo ha ipfi. Mvelelo dzo no vhulungwaho nga luambo lwa kale dzi dzula u swika ni tshi ṱoḓa hafhu maipfi ayo.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Mbekanyamushumo ya vhashumisani",
        items: [
          {
            id: "join-partner",
            q: "Ndi vha hani mushumisani wa Gadit?",
            a: [
              "Vulani /partners u bva kha siaṱari ḽiṅwe na ḽiṅwe ni kiḽike \"Vhani mushumisani\". Ḓiṅwaliseni nga dzina na imeiḽi yaṋu, nahone vhukwamani haṋu ha u themendela na tshikirini tsha u tevhela u kwama na khomishini zwi a lugela nga u ṱavhanya. A hu na u lindela thendelo.",
              "U dzhena ndi mahala nahone ho vulelwa muthu muṅwe na muṅwe. A ni ṱoḓi ṅwaliso wa Gadit uri ni vhe mushumisani.",
            ],
          },
          {
            id: "commission-model",
            q: "Khomishini dzi vhalelwa hani?",
            a: [
              "Milayo ya misi yoṱhe ndi 25% ya mbadelo iṅwe na iṅwe ine muthengi a i ita kha ṅwaha wawe wa u thoma. Nga murahu ha ṅwaha wa u thoma, ni wana 10% ya mbadelo iṅwe na iṅwe tshifhinga tshoṱhe tshine muthengi a bvela phanḓa a tshi badela.",
              "Hezwi zwi shuma nga nḓila i fanaho kha pulane dza nga ṅwedzi na dza nga ṅwaha, ngauri khomishini i vhalelwa kha mbadelo iṅwe na iṅwe ya vhukuma. Arali muthengi a khansela, khomishini yaṋu i ima nga mbadelo yawe ya u fhedza.",
              "Tshigwada tshi nga vhea mitengo yo fhambanaho kha vhashumisani vho khetheaho. Mitengo yaṋu i sumbedzwa tshifhinga tshoṱhe kha tshikirini tshaṋu tsha mushumisani, tshine na nga tshi swikela u bva kha /partners.",
            ],
          },
          {
            id: "payout",
            q: "Ndi ḓo badelwa lini?",
            a: [
              "Nga ṅwedzi, musi tshelede yaṋu i tshi fhira $50. Ri shumisa nḓila ya mbadelo ye na i vhea kha tshikirini tsha mushumisani (u rumela tshelede bannga, PayPal, na dziṅwe). $50 ndi mukano wa fhasi, a si mukano wa nṱha. Ni nga wana zwinzhi vhukuma, ni wana mbadelo fhedzi musi ni tshi fhira mukano.",
              "Khomishini dzi bviswa nga murahu ha maḓuvha a 30 a mbadelo ya ṅwaliso, u itela tshifhinga tsha u humiselwa tshelede. Ngauralo ṅwaliso wa Phando u bviswa mathomoni a Luhuhi nahone u dzhena kha mbadelo yaṋu i tevhelaho musi tshelede yaṋu i tshi fhira $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ndo dzhena fhedzi tshikirini tshanga a tshi na tshithu.",
            a: [
              "Zwiyelo zwi vhonala nga murahu ha u kwama ha u thoma kha vhukwamani haṋu. U sa vha na tshithu zwi amba uri a hu athu u vha na muthu o kwamaho. Iyani ni kovhekane vhukwamani. Tshikirini tshi vusuluswa nga u ṱavhanya musi mishumo i tshi thoma.",
              "Arali no kovhekana nahone muṅwe o ḓiṅwalisa fhedzi tshikirini tshi sa sumbedzi, ri ṅwaleleni ni tshi ri vhudza tshifhinga tsha u ḓiṅwalisa nahone tshigwada tshi ḓo ṱola.",
            ],
          },
          {
            id: "attribution-window",
            q: "Vhukwamani haṋu ha u themendela vhu tevhela mudaleli lwa tshifhinga tshingafhani?",
            a: [
              "Maḓuvha a 60. Musi mudaleli a tshi kwama vhukwamani haṋu, ri vhea cookie ine ya ni sumbedza sa ane a themendela. Arali vha ḓiṅwalisa nahone vha badela ṅwaliso tshifhinga tshiṅwe na tshiṅwe kha maḓuvha a 60 a tevhelaho (naho vha bva kha saiti vha vhuya nga murahu nga u ṱoḓa kha Google), zwi kha ḓi ṋewa inwi.",
              "U phumula cookies: arali mudaleli a phumula cookies dzawe kana a shandukisa burausa/tshishumiswa phanḓa ha u ḓiṅwalisa, zwi nga xela. A hu na nḓila ya u zwi thivhela, fhedzi maḓuvha a 60 ndi tshifhinga tshilapfu u vhambedza na mbekanyamushumo nnzhi dza vhashumisani.",
            ],
          },
          {
            id: "missing-commission",
            q: "Muṅwe o ḓiṅwalisa nga vhukwamani hanga fhedzi a thi vhoni khomishini.",
            a: [
              "Kanzhi ndi zwa tshifhinga: u ḓiṅwalisa hu vhonala kha tshikirini nga mitsini, fhedzi khomishini i ṅwaliwa fhedzi musi ṅwaliso wo badelwa vhukuma (zwine zwa nga dzhia maḓuvha arali vha kha tshilingo tsha mahala). Ṱolani hafhu nga murahu ha musi tshilingo tsho fhela.",
              "Arali ṅwaliso wo badelwa fhedzi ni sa athu u vhona khomishini nga murahu ha awara dza 48, ri ṅwaleleni ni tshi ri vhudza tshifhinga tsha u ḓiṅwalisa na imeiḽi kana dzina ḽa muṅwalisi arali ni tshi ḽi ḓivha. Tshigwada tshi ḓo ṱoḓisisa nahone tsha lugisa zwi si ho nga tshanḓa.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Zwa misi yoṱhe",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit ndi mini?",
            a: [
              "Bugu ya maipfi ya nyambo nnzhi yo itelwaho uri ipfi ḽi pfesesee, hu si u ṋea ṱhalutshedzo ya mutalo muthihi fhedzi. Ipfi ḽiṅwe na ḽiṅwe ḽi vulea na ndeme dzaḽo dzoṱhe, tsumbo dza vhukuma kha ndeme iṅwe na iṅwe, mirero, vhubvo ha ipfi, tshifanyiso tshi sa kombetshedzwi, na (nga Clear na Deep) ṱhalutshedzo ya vhana, u ṅwala mutaladzi waṋu ni wane vhuṱanzi, na mbudziso.",
              "Zwino hu na nyambo dza tshikirini dza 30+. Ngomu tshigwada tshi zwi vhidza u GAD ipfi: u pfesesa ipfi u swika magumoni, hu si u ḽi ṱalutshedzela fhedzi.",
            ],
          },
          {
            id: "languages",
            q: "Ni shuma nga nyambo dzifhio?",
            a: [
              "Tshikirini: Luisimane, Lugerika, Luheberu, Luarabu, Lurashia, Lusipenishi, Luphothugisi, Lufurentshi, Lujeremane, Lutsheke, Luslovakia, Lutaliana, Lujapani, Luzulu.",
              "Ni nga ṱoḓa ipfi nga luṅwe lwa nyambo idzo ni wane ṱhalutshedzo, tsumbo, na zwiṅwe zwoṱhe nga luambo lwa tshikirini lwe na lu khetha. Luheberu na Luarabu zwi ṅwalwa u bva tshanḓa tshi ḽa u ya tshanḓa tshi monyi tshoṱhe nahone zwi shumisa fonte dzazwo.",
            ],
          },
          {
            id: "kid-safety",
            q: "Naa Gadit yo tsireledzea kha vhana?",
            a: [
              "Gadit yo itelwa uri mubebi a i shumise nga nḓila yo tsireledzeaho e na ṅwana. Tshiimo tsha vhana tshi ita ṱhalutshedzo dzo leluwaho, dzi pfeseseaho, nahone dzi tshimbilelanaho na miṅwaha (tsini na vhuimo ha miṅwaha ya 5 u swika 10), hu tshi shumiswa tshishumiswa tshine tsha ita zwithu zwa vhahulwane hu na ndaela dzo khetheaho dza u leludza. A hu na zwithu zwo ṅwalwaho nga vhashumisi zwine zwa sumbedzwa vhana.",
              "U ya nga mbekanyamaitele dzashu na milayo ya tshiphiri tsha vhana shangoni ḽoṱhe, u vha muṋe wa akhaunthu e eṱhe ndi u bva kha miṅwaha ya 13. Nḓila ya misi yoṱhe ndi akhaunthu ya mubebi ine mubebi a i shumisa na ṅwana wawe, zwine ndi zwone zwe Tshiimo tsha vhana tsha itelwa zwone.",
            ],
          },
          {
            id: "data",
            q: "Mafhungo anga a vhulungwa ngafhi? Naa ni a rengisa?",
            a: [
              "Akhaunthu, zwe na ṱoḓa, bugu, na zwifanyiso zwo itwaho zwi vhulungwa nga nḓila yo tsireledzeaho kha Firebase, zwo dzumbiwa kha vhuvhulungelo. A ri rengisi mafhungo aṋu kha muthu. Ri kovhekana fhedzi zwine zwa ṱoḓea u shumisa Gadit (vhuvhulungelo, mbadelo, vhaṋei vha zwithu), sa zwo ṅwalwaho kha Mbekanyamaitele ya Tshiphiri.",
              "Ni nga bvisa bugu yaṋu kana ni phumule akhaunthu yaṋu tshifhinga tshiṅwe na tshiṅwe u bva kha siaṱari ḽa Akhaunthu.",
            ],
          },
          {
            id: "contact-direct",
            q: "Ndi nga ni kwama hani nga u ṱavhanya?",
            a: [
              "Shumisani bathoni ya imeiḽi i re fhasi ha siaṱari iḽi. I ya kha bogisi ḽa imeiḽi ḽa tshigwada. Mulaedza muṅwe na muṅwe u a vhalwa nahone u fhindulwa nga awara dza 24 u swika 48 (kanzhi nga u ṱavhanya).",
              "Imeiḽi i fhira u davhidzana kha thuso: i ṋea tshigwada tshikhala tsha u vhala nga vhuronwane na u fhindula nga ṱhogomelo. Thuso nga founu a i athu u ṋewa.",
            ],
          },
        ],
      },
    ],
  },
  nr: {
    eyebrow: "Isikhungo Sesizo",
    heading: "Thola ipendulo, msinyana.",
    lede: "Imibuzo evamileko nezilungiso zegadango ngegadango, zihlelwe ngeendawo. Nange ungaboni umraro wakho, thintana nethimba ngezansi.",
    stillNeedHelpHeading: "Usabambekile?",
    stillNeedHelpBody: "Sitlolele ngokuqondileko. Umlayezo ngamunye ufundwa lithimba begodu uthola ipendulo phakathi kwelanga linye namkha amabili.",
    emailCta: "Sithumelele i-imeyili",
    responseTime: "Ipendulo ejayelekileko: phakathi kwamahora ama-24 ukuya kwama-48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Ukubhadela nokubhalisela",
        items: [
          {
            id: "change-card",
            q: "Ngiyitjhentjha njani ikarada yesikweletu ekubhaliseleni kwami?",
            a: [
              "Ungatjhentjhela kukarada etjha ngaphasi komzuzu ngaphandle kokukhansela. Ukubhalisela kwakho kwanje kuragela phambili, kwaphela ngekarada etjha.",
              "1. Ngena ku-gadit.app bese uvula ikhasi lakho le-Akhawunti (phezulu kwesokudla). 2. Qhwarhaza \"Lawula ukubhadela\". 3. Ikhasi le-Stripe eliphephileko liyavuleka. Qhwarhaza \"Faka indlela yokubhadela\", tlola ikarada etjha, bese uyibeka njengejayelekileko. 4. Nawufuna, susa ikarada endala.",
              "Kusukela esikhathini sokubhadela esilandelako, koke kuya kukarada etjha. Ukubhadeliswa kwangaphambili (osekuthethiwe) kuhlala kukarada endala. Akutlhogeki ukubuyiselwa imali ngaphandle kobana uyifuna ngokuqondileko.",
            ],
          },
          {
            id: "cancel",
            q: "Ngikukhansela njani ukubhalisela kwami?",
            a: [
              "Uzenzela wena, nanyana kunini. Ngena, vula i-Akhawunti, bese uthinta Khansela ukubhalisela ngaphasi kwehlelo lakho.",
              "Ukungena kwakho kuragela phambili bekube kuphela isikhathi osele usibhadelele. Ngemva kwalokho i-akhawunti ibuyela ku-Basic (mahala). Amezwi owabulungileko, umlando nebhuku lakho lamezwi kuhlala kuphephile begodu kuyatholakala.",
              "Nange ukhansele ngephutha namkha utjhentjha umkhumbulo, ungavuselela ukubhalisela ekhasini elifanako ngaphambi kobana isikhathi siphele.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ngitjhentjha njani ukusuka ku-Clear ukuya ku-Deep (namkha ngokuphambeneko)?",
            a: [
              "I-Akhawunti, bese Lawula ukubhadela, bese Vuselela ukubhalisela. Khetha ihlelo elitjha.",
              "I-Stripe ibala umehluko wenani ngokuzenzakalela, ngokwamalanga asele esikhathini sanje. Nawuthuthukisako, ubhadeliswa umehluko kwaphela wesikhathi esiseleko. Nawutjhentjhela ezingeni eliphasi, imali eseleko isetjenziswa erhumweni lakho elilandelako.",
            ],
          },
          {
            id: "invoice",
            q: "Ngiyidawuniloda njani i-invoyisi namkha irisidi?",
            a: [
              "I-Akhawunti, bese Lawula ukubhadela, bese Umlando wee-invoyisi. Ukubhadeliswa ngakunye kunerisidi ye-PDF engadawunilodwa enemininingwana yokubhadela oyibulungileko.",
              "Nange utlhoga ibizo elihlukileko, ikheli, namkha inomboro yerhumo ku-invoyisi (isibonelo ibizo lekhampani ngeenhloso zerhumo), vuselela imininingwana yakho yokubhadela ekhasini elifanako ngaphambi kokudawuniloda. Irisidi elandelako izakusebenzisa imininingwana etjha.",
            ],
          },
          {
            id: "portal-error",
            q: "Ngiqhwarhaze Lawula ukubhadela kodwana ngathola iphutha. Ngenzeni nje?",
            a: [
              "Kuneenzathu ezimbili ezivamileko. Kokuthoma, i-akhawunti yakho ayinakho ukubhalisela kwe-Stripe okusebenzako. Kwesibili, i-Stripe kungenzeka ingakabi nephrofayili yokubhadela epheleleko ye-akhawunti yakho.",
              "Into elula yokuthoma: phuma, ungene godu nge-imeyili oyisebenzise ekubhadeleni, bese ulinga godu. Nange kusehluleka, thintana nathi nge-imeyili ye-akhawunti yakho, ithimba lizakulungisa ngehlangothini lethu ngomzuzu.",
            ],
          },
          {
            id: "autorenew",
            q: "Ukubhalisela kwami kuzakuzivuselela?",
            a: [
              "Iye. Amahlelo wenyanga avuseleleka qobe nyanga, amahlelo wonyaka avuseleleka qobe mnyaka ngelanga elifanako. Ungabona ilanga lokubhadela elilandelako ku-akhawunti yakho naphothalini ye-Stripe.",
              "Nange ungafuni ukuzivuselela, khansela nanyana kunini ngaphambi kwelanga lokuvuselela. Ukukhansela akwenzeki khonokho. Ugcina ukungena bekube kuphela isikhathi osele usibhadelele.",
            ],
          },
          {
            id: "refund",
            q: "Ngingabuyiselwa imali?",
            a: [
              "Iye. Nange ukuthenga kwenzeke ngaphasi kwamalanga ali-14 adlulileko begodu umsebenzi ungakasetjenziswa khulu, sitlolele nge-imeyili ye-akhawunti yakho nombhalo omfitjhani wesizathu. Ukubuyiselwa imali okunjalo kuvunyelwa ngaphandle kobudisi.",
              "Nange sekudlule amalanga ali-14, ithimba likuphatha ngokwesimo ngasinye. Khansela ukubhalisela bona kungaragi kuzivuselela, bese usithumelela i-imeyili.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ngibona ukubhadeliswa engingakwaziko.",
            a: [
              "Ukubhadeliswa kuvela njenge-GADIT namkha i-GADIT.APP ne-$2.99 (Clear ngenyanga), $4.99 (Deep ngenyanga), $29.99 (Clear ngomnyaka), namkha $49.99 (Deep ngomnyaka). Nange kungafanelani, kungaba ngokwenye isevisi.",
              "Nange uqinisekile bona akusikho kwakho, ungakuphikisi ebhanga lakho okwanje. Sitlolele ngokuqondileko kuqala ngelanga nenani. Ithimba lizakukuthola, lihlathulule bona kuyini, begodu libuyise imali nange kutlhogeka. Ukuphikisa ebhanga kungenza ukubhadela kwesikhathi esizako kube budisi, ngalokho ukukulungisa ngesizo kanengi kusheshe begodu kuphephile khulu.",
            ],
          },
          {
            id: "failed-payment",
            q: "Ukubhadela kwami kwehlulekile. Kufuze ngenzeni?",
            a: [
              "I-Stripe ilinga godu ngokuzenzakalela ukubhadela okwehlulekileko kanengana emalangeni alandelako. Ukwehluleka okunengi kuzilungisa lokha ibhanga nalikhulula ukubanjwa namkha ikarada inemali eneleko.",
              "Nange ufuna ukukulungisa khonokho, iya ku-Akhawunti → Lawula ukubhadela → Faka indlela yokubhadela, tlola ikarada esebenzako, bese uyibeka njengejayelekileko. I-Stripe izakulinga godu ukubhadeliswa okwehlulekileko khonokho ngekarada etjha. Nange ukubhalisela kwakho sele kubuyele ku-Basic, ungabhalisela godu emaNanini begodu ibhuku lakho lamezwi lihlala lingakathintwa.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Umehluko uyini hlangana ne-Basic, i-Clear ne-Deep?",
            a: [
              "I-Basic (mahala): ukufuna amezwi okufika ku-20 ngelanga, zoke iinhlathululo, izibonelo zehlathululo ngayinye, izaga, nomsuka welizwi. Akutlhogeki ukubhalisa ekufuneni okusisekelo.",
              "I-Clear ($2.99/ngenyanga namkha $29.99/ngomnyaka): ukufuna ngaphandle komkhawulo, iinhlathululo ezifanele abantwana, isithombe selizwi ngalinye (30/ngenyanga), tlola umutjho wakho uthole amazwana, imininingwana yezaga, nomlando wokufuna wamalanga ama-30.",
              "I-Deep ($4.99/ngenyanga namkha $49.99/ngomnyaka): koke okuku-Clear, kunye neenkhwizi zokuzilolonga, ibhuku lamezwi lakho elinokuzilolonga okuhlakaniphileko kokubuyekeza ngezikhathi, ukuhlukanisa amezwi afanako, nesabelo sezithombe esikhulu (100/ngenyanga).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "I-akhawunti nokungena",
        items: [
          {
            id: "no-verification-email",
            q: "Angikayitholi i-imeyili yokuqinisekisa.",
            a: [
              "Hlola kuqala iinqoqwana ze-spam nezokukhangisa. I-Gmail ne-Outlook kwesinye isikhathi zithumela ama-imeyili we-akhawunti lapho bekube uphawula enye njengethi \"Not spam\".",
              "Nange ingekho lapho, i-imeyili kungenzeka itlolwe ngephutha ekubhaliseni. Linga ukubhalisa godu bese uhlola ikheli kuhle. Nange ubhalise nge-Google, ayitlhogeki i-imeyili yokuqinisekisa.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ngikhohlwe iphasiwedi yami.",
            a: [
              "Vula ibhokisi lokungena bese uqhwarhaza \"Ukhohlwe iphasiwedi?\". Tlola i-imeyili oyisebenzisela i-Gadit, uzakuthola ilinki yokutjhentjha phakathi komzuzu namkha emibili.",
              "Nange i-imeyili ingafiki, hlola i-spam. Nange isengafiki, kungenzeka ubhalise nge-Google esikhundleni se-imeyili nephasiwedi. Linga ikunupu ethi \"Raga nge-Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ngiqinisekile bona iphasiwedi yami ilungile kodwana kuthiwa \"I-imeyili namkha iphasiwedi akukalungi\".",
            a: [
              "Izinto ezintathu okufuze uzihlole. Kokuthoma, i-capslock. Kwesibili, isikhala ekugcineni nawukopa begodu unamathisela. Kwesithathu, ubhalise nge-Google esikhundleni sephasiwedi (sebenzisa \"Raga nge-Google\" kunalokho).",
              "Usabambekile? Tjhentjha iphasiwedi ebhokisini elifanako. Kukulungisela kuhle butjha.",
            ],
          },
          {
            id: "google-fails",
            q: "Ukungena nge-Google akusebenzi.",
            a: [
              "Isizathu esivamileko khulu: ibhrawuza yakho ivimba ama-cookie wabantu bangaphandle namkha ama-pop-up we-gadit.app. Kuvumele emvumweni yebhawa lekheli bese ulinga godu.",
              "Nange useModini ye-incognito, ukungena nge-Google kuvinjelwe ngehloso. Tjhentjhela efasiteleni lebhrawuza elijayelekileko.",
            ],
          },
          {
            id: "change-email",
            q: "Ngiyitjhentjha njani i-imeyili ku-akhawunti yami?",
            a: [
              "I-Akhawunti, qhwarhaza i-imeyili yakho, Tjhentjha i-imeyili. Kuzakufuze uqinisekise ikheli elitjha ngaphambi kobana lisebenze. Ukubhalisela kwakho, umlando nebhuku lamezwi koke kuyadluliselwa.",
              "Nange i-imeyili ibotjhelelwe ekhasimendeni le-Stripe, yivuselele naphothalini yokubhadela ye-Stripe bona amarisidi azako aye ekhelini elitjha.",
            ],
          },
          {
            id: "delete-account",
            q: "Ngiyisula njani i-akhawunti yami?",
            a: [
              "I-Akhawunti, ngezansi kwekhasi, Sula i-akhawunti. Lokhu kungokwaphakade. Ukubhalisela kwakho kuyakhanselwa, ibhuku lakho lamezwi nomlando kuyasulwa, begodu i-imeyili iyakhululwa bona ubhalise butjha.",
              "Amarekhodi we-Stripe wokubhadeliswa kwangaphambili ayahlala (umthetho usibophelela bona siwagcine ngebanga lokubalwa kwemali). Akukho okhunye okuhlalako.",
            ],
          },
          {
            id: "share-account",
            q: "Umlingani wami namkha umntwana wami angabelana nami nge-akhawunti?",
            a: [
              "Umsebenzisi munye ongeneko ku-akhawunti ngesikhathi. Imodi yabantwana ivumela i-akhawunti yinye ye-Clear namkha ye-Deep bona isize umbelethi nomntwana: thinta isitjhintjhi, iinhlathululo zivele zifanele abantwana ngaphandle kokungena okuhlukeneko.",
              "Kubantu abadala ababili abafuna boke amabhuku wamezwi nokuthuthuka okuhlukeneko, yenza ama-akhawunti amabili. I-Clear ingu-$2.99 ngenyanga nge-akhawunti ngayinye.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ngicabanga bona nginama-akhawunti amabili ngephutha. Ngenzeni nje?",
            a: [
              "Lokhu kanengi kwenzeka lokha umuntu abhalisa kanye nge-Google bese kanye nge-imeyili nephasiwedi asebenzisa ikheli elifanako, namkha nawubhalisa kabili ngama-imeyili ahlukeneko. Ukubhalisa ngakunye kwenza i-akhawunti ye-Gadit ehlukileko enebhuku layo lamezwi, umlando nesimo sokubhalisela.",
              "Sitlolele ngama-imeyili womabili (namkha ama-UID asekhasini le-Akhawunti) nokobana ngiyiphi ofuna ukuyigcina. Ithimba lizakuhlanganisa amabhuku wamezwi nomlando ku-akhawunti oyikhethileko, bese livala enye ngokuhlelekileko. Ayikho imininingwana elahlekako.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Ukusebenzisa i-Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Ngicabanga bona ihlathululo ayikalungi. Ngenzani?",
            a: [
              "Ikhasi ngalinye lomphumela linekunupu encani ethi \"Bika\" ngezansi. Yithinte, khetha isigaba (ihlathululo, umsuka welizwi, isibonelo, isaga, ihlathululo yabantwana, njalo njalo) bese utlola umbhalo omfitjhani. Ufika ngokuqondileko ethimbeni begodu umbiko ngamunye uyahlolwa.",
              "Ungatshwenyeki bona ukhetha khulu. Isihlathululimezwi sithuthuka msinyana ngamazwana la ukudlula nanyana yini enye.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Imodi yabantwana ayitjhentjhi ihlathululo.",
            a: [
              "Imodi yabantwana itjhentjha umtlolo kwaphela lapho ilizwi sele linehlathululo efanele abantwana eyenziweko. Emezwini amatjha osanda kuwafuna, lindela imizuzwana eli-10 ukuya kwe-15. Ihlathululo efanele abantwana yenziwa khonokho ngesikhathi sokuthoma.",
              "Godu: imodi yabantwana itlhoga i-Clear namkha i-Deep. Nange use-Basic, isitjhintjhi sizakukubawa bona uthuthukise. Abasebenzisi abangaziwako babawa bona babhalise.",
            ],
          },
          {
            id: "voice-fails",
            q: "Ukufuna ngelizwi akusebenzi.",
            a: [
              "Ukufuna ngelizwi kutlhoga imvumo yemakrofoni. Amabhrawuza amanengi abuza kanye ngesayithi ngayinye. Nange uqhwarhaze Vimba ngephutha, kuzakufuze ukubuyisele ngesandla: qhwarhaza itjhwayo lekhiya namkha lemininingwana eceleni kwe-gadit.app ebhaweni lekheli, bese Iinlungiselelo zesayithi, bese iMakrofoni, bese Vumela.",
              "Ku-Safari ye-iOS, ukungena kwemakrofoni godu kutlhoga isitjhintjhi se-Settings → Safari → Microphone. Ilizwi nje liyinzuzo ye-Clear ne-Deep: abasebenzisi be-Basic babona isimemo sokuthuthukisa, abavakatjheli abangakangeni babona isimemo sokungena.",
            ],
          },
          {
            id: "no-image",
            q: "Angikghoni ukwenza isithombe selizwi.",
            a: [
              "Ukwenza izithombe kuyinzuzo ye-Clear namkha ye-Deep enesabelo senyanga. I-Clear ithola izithombe ezima-30 ngenyanga, i-Deep ithola ezili-100. Nange usisebenzise soke isabelo, uzakubona umthangala. Sithoma butjha ngelanga lokuthoma lenyanga ngayinye.",
              "Nange ungakafiki esabelweni kodwana usabona ukwehluleka, kanengi kwesikhatjhana. Linga godu ngemva kwemizuzwana ema-30. Ukwehluleka okuraga kungaba liphutha lesistimu. Sibawa ubike ekhasini lelizwi.",
            ],
          },
          {
            id: "save-word",
            q: "Ngilibulunga njani ilizwi ebhukwini lami lamezwi?",
            a: [
              "Ekhasini nanyana ngiliphi lomphumela welizwi, thinta Bulunga ebhukwini eduze nesihloko. Ibhuku lamezwi liyinzuzo ye-Clear ne-Deep lapho ungabuyekeza khona amezwi owabulungileko ngemva kwalokho, uwabone ekuboneni kweenkanyezi, begodu wenze izikhathi zokuzilolonga okuhlakaniphileko (Deep).",
              "Amezwi owabulungileko begodu wawavula okungenani kanye ayatholakala ngaphandle kwe-inthanethi ku-cache yedivayisi. Iphakethe langaphandle kwe-inthanethi libulunga namezwi athandwa khulu ngelimi lakho bona ulunge ngaphandle kwe-inthanethi.",
            ],
          },
          {
            id: "offline",
            q: "Imodi yangaphandle kwe-inthanethi isebenza njani?",
            a: [
              "Amezwi osele uwabonile abulungwa kudivayisi. Wavule godu ngaphandle kwe-inthanethi, azakulayitha khonokho. Iphakethe loke langaphandle kwe-inthanethi (amezwi aphambili ngelimi lakho) lidawunilodwa ngokufuna kwakho ekhasini lebhuku lamezwi.",
              "Ukufuna ilizwi elitjha ngokupheleleko kusatlhoga i-inthanethi, ngombana i-Gadit kufuze yenze ihlathululo kusukela ekuthomeni. I-cache yangaphandle kwe-inthanethi ngeyamezwi osele uwahlolile.",
            ],
          },
          {
            id: "slow",
            q: "I-app ibonakala iphuza.",
            a: [
              "Ukufuna kokuthoma kwelizwi kuphuza khulu ngombana i-Gadit yenza umphumela woke kusukela ekuthomeni: kanengi imizuzwana embalwa, kwesinye isikhathi kude kwamezwi abudisi. Ukufuna okulandelako kwelizwi elifanako kwenzeka khonokho, kuvela ku-cache.",
              "Nange koke kuphuza, linga ukuvuselela ngamandla: Cmd+Shift+R ku-Mac, Ctrl+Shift+R ku-Windows. Nange ukuphuza kuraga emakhasini woke, sibawa usithumelele i-imeyili ngenarha yakho nebhrawuza bona ithimba lihlole indlela ye-inthanethi ukuya emaseva wethu ukusuka esifundeni sakho.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ngifune ilizwi angakhenge ngithole umphumela. Kwenzekani?",
            a: [
              "Kokuthoma, hlola ukupela. I-Gadit kanengi ilungisa amaphutha amancani wokutlola, kodwana unkamisa ongakalungi namkha ilembu elingekho kungayidida. Linga isilungiso esiphakanyiswako nasivelako.",
              "Ngaphezu kwalokho: amezwi angajayelekiko khulu namkha wesitsotsi angabuyisi umphumela othembekileko. Nange uqinisekile bona ilizwi lamambala, qhwarhaza ikunupu ethi Bika ekhasini lomphumela (namkha esikrinini sephutha) bese usazisa. Umbiko ngamunye uyahlolwa begodu okuphoswe ngamambala kubuyiselwa esistimini.",
            ],
          },
          {
            id: "change-language",
            q: "Ngilitjhentjha njani ilimi lokusebenzisa?",
            a: [
              "Phezulu kwesokudla kwekhasi nanyana ngiliphi, uzakubona itjhwayo elincani lefulege (namkha ibizo lelimi lakho lanje). Lithinte bese ukhetha emalimini angaphezu kwa-30: isiNgisi, isiGrigi, isiHebheru, isi-Arabhu, isiRhashiya, isiPanitjhi, isiPutukezi, isiFurentjhi, isiJarimani, isiTjheki, isiSlovakhi, isiTaliyana, isiJapani, isiHindi, isi-Amharic, isiZulu.",
              "Ukhetho lwakho lubulungwa kudivayisi le. Koke kulayitha godu ngelimi elitjha: ukusebenzisa, iimenyu, iinhlathululo zamezwi ezizako, izibonelo, iinhlathululo zabantwana, ngitjho nomsuka welizwi. Imiphumela esele ibulungiwe ngelimi elidala ihlala bekube ufuna amezwi lawo godu.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Uhlelo lwabalingani",
        items: [
          {
            id: "join-partner",
            q: "Ngiba njani mlingani we-Gadit?",
            a: [
              "Vula i-/partners ekhasini nanyana ngiliphi bese uqhwarhaza \"Yiba mlingani\". Bhalisa ngebizo lakho ne-imeyili, ilinki yakho ekhethekileko yokuncoma kunye nedeshibhodi yokulandelela ukuqhwarhaza neenkhomitjhini kulungile khonokho. Akunakulindela imvumo.",
              "Ukujoyina kumahala begodu kuvulekele woke umuntu. Awutlhogi ukubhalisela kwe-Gadit bona ube mlingani.",
            ],
          },
          {
            id: "commission-model",
            q: "Iinkhomitjhini zibalwa njani?",
            a: [
              "Imibandela ejayelekileko yi-25% yembhadelo ngayinye ikhasimende eliyenza emnyakeni walo wokuthoma. Ngemva komnyaka wokuthoma, uzuza i-10% yembhadelo ngayinye isikhathi soke ikhasimende lisabhadela.",
              "Lokhu kusebenza ngokufanako emahlelweni wenyanga nawonyaka, ngombana ikhomitjhini ibalwa embhadelweni ngamunye wamambala. Nange ikhasimende likhansela, ikhomitjhini yakho iyajama embhadelweni walo wokugcina.",
              "Ithimba lingabeka amazinga ahlukeneko wabalingani abathileko. Amazinga wakho ahlala atjengiswa edeshibhodini yakho yomlingani, ongayifikelela ku-/partners.",
            ],
          },
          {
            id: "payout",
            q: "Ngibhadelwa nini?",
            a: [
              "Ngenyanga, lokha imali yakho nayidlula i-$50. Sisebenzisa indlela yokubhadela oyibeke edeshibhodini yomlingani (ukudlulisela ebhanga, i-PayPal, njalo njalo). I-$50 mkhawulo omncani, ayisiwo mkhawulo ophezulu. Ungazuza okunengi khulu, uthola umbhadelo lokha nawudlula umkhawulo.",
              "Iinkhomitjhini zikhululwa ngemva kwamalanga ama-30 ngemva kokubhadelela ukubhalisela, bona kube nesikhathi sokubuyiselwa imali. Ngalokho ukubhalisela kwakaJanabari kukhululwa ekuthomeni kwakaFebherbari begodu kungena embhadelweni wakho olandelako lokha imali yakho nayidlula i-$50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ngijoyinile kodwana ideshibhodi yami ayinalitho.",
            a: [
              "Iinomboro zivela ngemva kokuqhwarhaza kokuthoma elinkini yakho. Ukungabi nalitho kutjho bona akukho okhe waqhwarhaza okwanje. Iya uyokwabelana ngelinki. Ideshibhodi ivuseleleka ngokuseduze ngesikhathi sinye lokha ukusebenza nakuthomako.",
              "Nange wabelene begodu umuntu wabhalisa kodwana ideshibhodi ingakutjengisi, sitlolele ngesikhathi esiseduze sokubhalisa, ithimba lizakuhlola ukubalelwa.",
            ],
          },
          {
            id: "attribution-window",
            q: "Ilinki yami yokuncoma ilandelela umvakatjheli isikhathi esingangani?",
            a: [
              "Amalanga ama-60. Lokha umvakatjheli aqhwarhaza ilinki yakho, sibeka i-cookie ekutjengisa njengomncomi. Nange abhalisa begodu abhalisele nanyana kunini emalangeni ama-60 alandelako (ngitjho nanyana aphuma esayithini bese abuya ngemva kwalokho ngokufuna ku-Google), ukubalelwa kusaya kuwe.",
              "Ukusulwa kwama-cookie: nange umvakatjheli asula ama-cookie wakhe namkha atjhentjha ibhrawuza/idivayisi ngaphambi kokubhalisa, ukubalelwa kungalahleka. Ayikho indlela yokugwema lokho, kodwana amalanga ama-60 sikhathi esikhulu uma kumadaniswa nezinye izinhlelo ezinengi zabalingani.",
            ],
          },
          {
            id: "missing-commission",
            q: "Umuntu ubhalise ngelinki yami kodwana angiyiboni ikhomitjhini.",
            a: [
              "Kanengi lokhu kusikhathi: ukubhalisa kuvela edeshibhodini phakathi kwemizuzu, kodwana ikhomitjhini ibhalwa kwaphela lokha ukubhalisela nakubhadelwe ngamambala (lokho okungaba ngemva kwamalanga nange basekulingeni kwamahala). Buyela uhlole ngemva kobana ukulinga kuphele.",
              "Nange ukubhalisela kubhadelwe kodwana usayiboni ikhomitjhini ngemva kwamahora ama-48, sitlolele ngesikhathi esiseduze sokubhalisa ne-imeyili namkha ibizo elisondeleko lombhaliseli nawulazi. Ithimba lizakuhlola ngokujulileko ukubalelwa bese lilungisa okuphosiweko ngesandla.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Okujayelekileko",
        items: [
          {
            id: "what-is-gadit",
            q: "Iyini i-Gadit?",
            a: [
              "Isihlathululimezwi samalimi amanengi esakhelwe bona ilizwi lizwisiseke ngamambala, ingasi ukunikela ihlathululo yomugca munye kwaphela. Ilizwi ngalinye livuleka nazo zoke iinhlathululo zalo, izibonelo zamambala zehlathululo ngayinye, izaga, umsuka welizwi, isithombe nawusifuna, begodu (nge-Clear ne-Deep) ihlathululo efanele abantwana, tlola umutjho wakho uthole amazwana, neenkhwizi.",
              "Nje kunamalimi angaphezu kwa-30 wokusebenzisa. Ngaphakathi ithimba likubiza ngokuthi kwenza i-GAD elizwini: ukuzwisisa ilizwi ngokuzeleko, ingasi ukulitjhugulula kwaphela.",
            ],
          },
          {
            id: "languages",
            q: "Nisekela maphi amalimi?",
            a: [
              "Ukusebenzisa: isiNgisi, isiGrigi, isiHebheru, isi-Arabhu, isiRhashiya, isiPanitjhi, isiPutukezi, isiFurentjhi, isiJarimani, isiTjheki, isiSlovakhi, isiTaliyana, isiJapani, isiZulu.",
              "Ungafuna ilizwi ngelinye nelinye lamalimi lawo bese uthola ihlathululo, izibonelo nakho koke okhunye ngelimi lokusebenzisa olikhethileko. IsiHebheru nesi-Arabhu zitlolwa ngokuzeleko kusukela kwesokudla ukuya kwesobunxele begodu zisebenzisa iimfonti zazo zamambala.",
            ],
          },
          {
            id: "kid-safety",
            q: "I-Gadit iphephile kubantwana?",
            a: [
              "I-Gadit yakhelwe bona umbelethi ayisebenzise ngokuphephileko kunye nomntwana. Imodi yabantwana yenza iinhlathululo ezilula, eziqondileko nezifanele ubudala (ezingeni leminyaka ema-5 ukuya kweli-10 ngokuseduze), isebenzisa injini efanako esebenzisela okuqukethwe kwabadala kunye neenyeleliso eziqondileko zokwenza kube lula. Okuqukethwe okwenziwe ngabasebenzisi akukhe kwatjengiswa abantwana.",
              "Ngokuvumelana nemithetho yethu nemithetho yefihlo yabantwana ephasini loke, ukuba ne-akhawunti ngokwakho kungeyeminyaka eli-13 nangaphezulu. Indlela ejayelekileko yi-akhawunti yombelethi umbelethi ayisebenzisa kunye nomntwana wakhe, lokho kanye Imodi yabantwana eyakhelwe khona.",
            ],
          },
          {
            id: "data",
            q: "Imininingwana yami ibulungwa kuphi? Niyayithengisa?",
            a: [
              "I-akhawunti, umlando, ibhuku lamezwi nezithombe ezenziweko kubulungwa ngokuphephileko ku-Firebase, kubethelwe esitorweni. Asithengisi imininingwana yakho kunanyana ngubani. Sabelana kwaphela ngalokho okutlhogekako bona i-Gadit isebenze (ukubulunga, ukubhadela, abaletha okuqukethwe), njengokutlolwe eMthethomgomweni Wefihlo.",
              "Ungakhupha ibhuku lakho lamezwi namkha usule i-akhawunti yakho nanyana kunini ekhasini le-Akhawunti.",
            ],
          },
          {
            id: "contact-direct",
            q: "Nginifikelela njani ngokuqondileko?",
            a: [
              "Sebenzisa ikunupu ye-imeyili ngezansi kwekhasi leli. Iya ngokuqondileko ebhokisini lethimba. Umlayezo ngamunye uyafundwa begodu uthola ipendulo phakathi kwamahora ama-24 ukuya kwama-48 (kanengi msinyana).",
              "I-imeyili ingcono kunokukhulumisana ngesizo: inikela ithimba ithuba lokufunda kuhle nokuphendula ngokucabangisisa. Isizo ngefowuni alikanikelwa okwanje.",
            ],
          },
        ],
      },
    ],
  },
  el: {
    eyebrow: "Κέντρο βοήθειας",
    heading: "Βρες μια απάντηση, γρήγορα.",
    lede: "Συχνές ερωτήσεις και λύσεις βήμα προς βήμα, οργανωμένες ανά περιοχή. Αν δεν βλέπεις το ζήτημά σου, επικοινώνησε με την ομάδα στο κάτω μέρος.",
    stillNeedHelpHeading: "Ακόμα κολλημένος;",
    stillNeedHelpBody: "Γράψε μας απευθείας. Κάθε μήνυμα διαβάζεται από την ομάδα και παίρνει απάντηση μέσα σε μία ή δύο ημέρες.",
    emailCta: "Στείλε μας email",
    responseTime: "Τυπική απάντηση: μέσα σε 24 με 48 ώρες.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Χρέωση και συνδρομή",
        items: [
          {
            id: "change-card",
            q: "Πώς αλλάζω την πιστωτική κάρτα στη συνδρομή μου;",
            a: [
              "Μπορείς να περάσεις σε νέα κάρτα σε λιγότερο από ένα λεπτό, χωρίς να ακυρώσεις τίποτα. Η τρέχουσα συνδρομή σου συνεχίζει κανονικά, απλώς με τη νέα κάρτα.",
              "1. Συνδέσου στο gadit.app και άνοιξε τη σελίδα του λογαριασμού σου (πάνω δεξιά). 2. Πάτησε \"Διαχείριση χρέωσης\". 3. Ανοίγει μια ασφαλής σελίδα του Stripe. Πάτησε \"Προσθήκη τρόπου πληρωμής\", καταχώρισε τη νέα κάρτα και όρισέ την ως προεπιλογή. 4. Προαιρετικά, αφαίρεσε την παλιά κάρτα.",
              "Από τον επόμενο κύκλο χρέωσης και μετά, όλα πηγαίνουν στη νέα κάρτα. Η προηγούμενη χρέωση (που έχει ήδη εισπραχθεί) παραμένει στην παλιά κάρτα. Δεν χρειάζεται επιστροφή χρημάτων, εκτός αν τη θέλεις ειδικά.",
            ],
          },
          {
            id: "cancel",
            q: "Πώς ακυρώνω τη συνδρομή μου;",
            a: [
              "Μόνοι σας, οποιαδήποτε στιγμή. Συνδεθείτε, ανοίξτε τον Λογαριασμό και πατήστε Ακύρωση συνδρομής κάτω από το πρόγραμμά σας.",
              "Η πρόσβασή σου συνεχίζει μέχρι το τέλος της περιόδου που έχεις ήδη πληρώσει. Μετά, ο λογαριασμός επιστρέφει στο Basic (δωρεάν). Οι αποθηκευμένες λέξεις, το ιστορικό και το σημειωματάριό σου μένουν ασφαλή και προσβάσιμα.",
              "Αν ακυρώσεις κατά λάθος ή αλλάξεις γνώμη, μπορείς να συνεχίσεις τη συνδρομή από την ίδια σελίδα πριν λήξει η περίοδος.",
            ],
          },
          {
            id: "switch-plan",
            q: "Πώς αλλάζω από Clear σε Deep (ή το αντίστροφο);",
            a: [
              "Λογαριασμός, μετά Διαχείριση χρέωσης, μετά Ενημέρωση συνδρομής. Διάλεξε το νέο πλάνο.",
              "Το Stripe υπολογίζει αυτόματα τη διαφορά τιμής, αναλογικά με τις μέρες που απομένουν στην τρέχουσα περίοδο. Αν κάνεις αναβάθμιση, θα χρεωθείς μόνο τη διαφορά για το υπόλοιπο της περιόδου. Αν περνάς σε χαμηλότερο πλάνο, η πίστωση εφαρμόζεται στον επόμενο λογαριασμό σου.",
            ],
          },
          {
            id: "invoice",
            q: "Πώς κατεβάζω τιμολόγιο ή απόδειξη;",
            a: [
              "Λογαριασμός, μετά Διαχείριση χρέωσης, μετά Ιστορικό τιμολογίων. Κάθε χρέωση έχει μια απόδειξη PDF για κατέβασμα, με τα στοιχεία χρέωσης που αποθήκευσες.",
              "Αν χρειάζεσαι διαφορετικό όνομα, διεύθυνση ή ΑΦΜ στο τιμολόγιο (για παράδειγμα την επωνυμία μιας εταιρείας για φορολογικούς λόγους), ενημέρωσε τα στοιχεία χρέωσης στην ίδια σελίδα πριν το κατεβάσεις. Η επόμενη απόδειξη θα χρησιμοποιήσει τα νέα στοιχεία.",
            ],
          },
          {
            id: "portal-error",
            q: "Πάτησα Διαχείριση χρέωσης αλλά πήρα σφάλμα. Τι κάνω τώρα;",
            a: [
              "Δύο συνηθισμένες αιτίες. Πρώτον, ο λογαριασμός σου δεν έχει ενεργή συνδρομή στο Stripe. Δεύτερον, μπορεί το Stripe να μην έχει ακόμα πλήρες προφίλ χρέωσης για τον λογαριασμό σου.",
              "Εύκολος πρώτος έλεγχος: αποσυνδέσου, ξανασυνδέσου με το email που χρησιμοποίησες κατά την αγορά και δοκίμασε ξανά. Αν συνεχίζει να αποτυγχάνει, επικοινώνησε μαζί μας με το email του λογαριασμού σου και η ομάδα θα το διορθώσει από την πλευρά μας σε ένα λεπτό.",
            ],
          },
          {
            id: "autorenew",
            q: "Θα ανανεωθεί αυτόματα η συνδρομή μου;",
            a: [
              "Ναι. Τα μηνιαία πλάνα ανανεώνονται κάθε μήνα, τα ετήσια πλάνα ανανεώνονται κάθε χρόνο την ίδια ημερομηνία. Μπορείς να δεις την επόμενη ημερομηνία χρέωσης στον λογαριασμό σου και στην πύλη του Stripe.",
              "Αν δεν θέλεις αυτόματη ανανέωση, ακύρωσε όποτε θέλεις πριν από την ημερομηνία ανανέωσης. Η ακύρωση δεν είναι άμεση. Κρατάς την πρόσβασή σου μέχρι το τέλος της περιόδου που έχεις ήδη πληρώσει.",
            ],
          },
          {
            id: "refund",
            q: "Μπορώ να πάρω επιστροφή χρημάτων;",
            a: [
              "Ναι. Αν η αγορά έγινε πριν από λιγότερο από 14 ημέρες και η υπηρεσία δεν έχει χρησιμοποιηθεί πολύ, γράψε μας με το email του λογαριασμού σου και μια σύντομη σημείωση για τον λόγο. Αυτές οι επιστροφές εγκρίνονται χωρίς τριβές.",
              "Αν έχουν περάσει πάνω από 14 ημέρες, η ομάδα το εξετάζει κατά περίπτωση. Ακύρωσε τη συνδρομή για να μην ανανεώνεται και στείλε μας email.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Βλέπω μια χρέωση που δεν αναγνωρίζω.",
            a: [
              "Οι χρεώσεις εμφανίζονται ως GADIT ή GADIT.APP με $2.99 (Clear μηνιαίο), $4.99 (Deep μηνιαίο), $29.99 (Clear ετήσιο) ή $49.99 (Deep ετήσιο). Αν δεν ταιριάζει, μπορεί να προέρχεται από άλλη υπηρεσία.",
              "Αν είσαι σίγουρος ότι δεν είναι δική σου, μην κάνεις ακόμα αμφισβήτηση μέσω της τράπεζάς σου. Γράψε μας πρώτα απευθείας με την ημερομηνία και το ποσό. Η ομάδα θα τη βρει, θα σου εξηγήσει τι είναι και θα κάνει επιστροφή αν χρειάζεται. Μια αμφισβήτηση στην τράπεζα μπορεί να δυσκολέψει τις μελλοντικές χρεώσεις, οπότε η επίλυση μέσω της υποστήριξης είναι συνήθως πιο γρήγορη και ασφαλής.",
            ],
          },
          {
            id: "failed-payment",
            q: "Η πληρωμή μου απέτυχε. Τι πρέπει να κάνω;",
            a: [
              "Το Stripe επαναλαμβάνει αυτόματα τις αποτυχημένες πληρωμές μερικές φορές μέσα στις επόμενες μέρες. Οι περισσότερες αποτυχίες λύνονται από μόνες τους μόλις η τράπεζα απελευθερώσει τη δέσμευση ή η κάρτα έχει αρκετό υπόλοιπο.",
              "Αν θέλεις να το διορθώσεις αμέσως, πήγαινε στο Λογαριασμός → Διαχείριση χρέωσης → Προσθήκη τρόπου πληρωμής, καταχώρισε μια κάρτα που λειτουργεί και όρισέ την ως προεπιλογή. Το Stripe θα επαναλάβει αμέσως την αποτυχημένη χρέωση στη νέα κάρτα. Αν η συνδρομή σου έχει ήδη υποβαθμιστεί σε Basic, μπορείς να ξαναγραφτείς από τη σελίδα Pricing και το σημειωματάριό σου μένει ανέπαφο.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Ποια είναι η διαφορά ανάμεσα σε Basic, Clear και Deep;",
            a: [
              "Basic (δωρεάν): έως 20 αναζητήσεις λέξεων την ημέρα, όλες οι σημασίες, παραδείγματα ανά σημασία, ιδιωματισμοί και προέλευση της λέξης. Δεν απαιτείται εγγραφή για τις βασικές αναζητήσεις.",
              "Clear ($2.99/μήνα ή $29.99/έτος): απεριόριστες αναζητήσεις, επεξηγήσεις φιλικές προς τα παιδιά, μία εικόνα ανά λέξη (30/μήνα), σύνθεση δικής σου πρότασης με ανατροφοδότηση, αναλυτικοί ιδιωματισμοί και 30 ημέρες ιστορικού αναζητήσεων.",
              "Deep ($4.99/μήνα ή $49.99/έτος): όλα όσα έχει το Clear, συν κουίζ εξάσκησης, το προσωπικό σημειωματάριο με έξυπνη εξάσκηση διαστημικής επανάληψης, διάκριση παρόμοιων λέξεων και μεγαλύτερο όριο εικόνων (100/μήνα).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Λογαριασμός και σύνδεση",
        items: [
          {
            id: "no-verification-email",
            q: "Δεν έλαβα το email επιβεβαίωσης.",
            a: [
              "Έλεγξε πρώτα τους φακέλους ανεπιθύμητης αλληλογραφίας και προσφορών. Το Gmail και το Outlook μερικές φορές δρομολογούν εκεί τα emails λογαριασμού, μέχρι να επισημάνεις κάποιο ως \"Not spam\".",
              "Αν δεν είναι εκεί, ίσως το email γράφτηκε λάθος κατά την εγγραφή. Δοκίμασε να εγγραφείς ξανά και έλεγξε προσεκτικά τη διεύθυνση. Αν χρησιμοποίησες εγγραφή με Google, δεν χρειάζεται email επιβεβαίωσης.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ξέχασα τον κωδικό μου.",
            a: [
              "Άνοιξε το παράθυρο σύνδεσης και πάτησε \"Ξέχασες τον κωδικό;\". Καταχώρισε το email που χρησιμοποιείς για το Gadit και θα λάβεις έναν σύνδεσμο επαναφοράς μέσα σε ένα ή δύο λεπτά.",
              "Αν το email δεν φτάσει, έλεγξε τα ανεπιθύμητα. Αν και πάλι δεν φτάσει, ίσως έκανες εγγραφή με Google αντί για email και κωδικό. Δοκίμασε το κουμπί \"Continue with Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Είμαι σίγουρος ότι ο κωδικός μου είναι σωστός αλλά λέει \"Λάθος email ή κωδικός\".",
            a: [
              "Τρία πράγματα να ελέγξεις. Πρώτον, το Caps Lock. Δεύτερον, κενό στο τέλος όταν κάνεις αντιγραφή-επικόλληση. Τρίτον, έκανες εγγραφή με Google αντί για κωδικό (χρησιμοποίησε το \"Continue with Google\").",
              "Ακόμα κολλημένος; Κάνε επαναφορά του κωδικού από το ίδιο παράθυρο. Σε βάζει σε καθαρή αρχή.",
            ],
          },
          {
            id: "google-fails",
            q: "Η σύνδεση με Google δεν λειτουργεί.",
            a: [
              "Η πιο συνηθισμένη αιτία: ο browser σου μπλοκάρει cookies τρίτων ή pop-ups για το gadit.app. Επίτρεψέ τα από τις άδειες στη γραμμή διευθύνσεων και δοκίμασε ξανά.",
              "Αν είσαι σε λειτουργία ανώνυμης περιήγησης, η σύνδεση με Google είναι περιορισμένη επίτηδες. Άλλαξε σε ένα κανονικό παράθυρο του browser.",
            ],
          },
          {
            id: "change-email",
            q: "Πώς αλλάζω το email του λογαριασμού μου;",
            a: [
              "Λογαριασμός, πάτησε το email σου, Αλλαγή email. Θα χρειαστεί να επιβεβαιώσεις τη νέα διεύθυνση πριν οριστικοποιηθεί. Η συνδρομή, το ιστορικό και το σημειωματάριό σου μεταφέρονται όλα.",
              "Αν το email είναι συνδεδεμένο με έναν πελάτη του Stripe, ενημέρωσέ το και στην πύλη χρέωσης του Stripe, ώστε οι μελλοντικές αποδείξεις να πηγαίνουν στη νέα διεύθυνση.",
            ],
          },
          {
            id: "delete-account",
            q: "Πώς διαγράφω τον λογαριασμό μου;",
            a: [
              "Λογαριασμός, στο κάτω μέρος της σελίδας, Διαγραφή λογαριασμού. Αυτό είναι μόνιμο. Η συνδρομή σου ακυρώνεται, το σημειωματάριο και το ιστορικό σου διαγράφονται, και το email απελευθερώνεται για μια νέα εγγραφή.",
              "Τα αρχεία του Stripe για παλιές χρεώσεις παραμένουν (είμαστε νομικά υποχρεωμένοι να τα κρατάμε για λογιστικούς λόγους). Τίποτα άλλο δεν μένει.",
            ],
          },
          {
            id: "share-account",
            q: "Μπορεί ο σύντροφος ή το παιδί μου να μοιραστεί τον λογαριασμό μου;",
            a: [
              "Ένας συνδεδεμένος χρήστης ανά λογαριασμό κάθε φορά. Η λειτουργία για παιδιά επιτρέπει σε έναν λογαριασμό Clear ή Deep να εξυπηρετεί έναν γονέα και ένα παιδί: γυρίζεις τον διακόπτη και οι ορισμοί εμφανίζονται φιλικά προς τα παιδιά χωρίς ξεχωριστές συνδέσεις.",
              "Για δύο ενήλικες που θέλουν και οι δύο ξεχωριστά σημειωματάρια και πρόοδο, φτιάξτε δύο λογαριασμούς. Το Clear κοστίζει $2.99 τον μήνα ανά λογαριασμό.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Νομίζω ότι έχω δύο λογαριασμούς κατά λάθος. Τι κάνω τώρα;",
            a: [
              "Αυτό συνήθως συμβαίνει όταν κάποιος εγγράφεται μία φορά με Google και μία φορά με email και κωδικό χρησιμοποιώντας την ίδια διεύθυνση, ή όταν εγγράφεσαι δύο φορές με διαφορετικές διευθύνσεις email. Κάθε εγγραφή δημιουργεί έναν ξεχωριστό λογαριασμό Gadit με δικό του σημειωματάριο, ιστορικό και κατάσταση συνδρομής.",
              "Γράψε μας με τις δύο διευθύνσεις email (ή τα UID από τη σελίδα του λογαριασμού) και ποιον θέλεις να κρατήσεις. Η ομάδα θα συγχωνεύσει τα σημειωματάρια και το ιστορικό στον λογαριασμό που θα επιλέξεις και μετά θα κλείσει τον άλλον καθαρά. Δεν χάνεται κανένα δεδομένο.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Χρήση του Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Νομίζω ότι ο ορισμός είναι λάθος. Τι κάνω;",
            a: [
              "Κάθε σελίδα αποτελέσματος έχει ένα μικρό κουμπί \"Αναφορά\" στο κάτω μέρος. Πάτησέ το, διάλεξε μια κατηγορία (ορισμός, ετυμολογία, παράδειγμα, ιδιωματισμός, επεξήγηση για παιδιά και ούτω καθεξής) και γράψε μια σύντομη σημείωση. Έρχεται κατευθείαν στην ομάδα και κάθε αναφορά εξετάζεται.",
              "Μην ανησυχείς αν είσαι πολύ σχολαστικός. Το λεξικό βελτιώνεται από αυτή την ανατροφοδότηση πιο γρήγορα από οτιδήποτε άλλο.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Η λειτουργία για παιδιά δεν αλλάζει την επεξήγηση.",
            a: [
              "Η λειτουργία για παιδιά αλλάζει το κείμενο μόνο εκεί όπου η λέξη έχει ήδη μια δημιουργημένη επεξήγηση φιλική προς τα παιδιά. Για ολοκαίνουριες λέξεις που μόλις αναζήτησες, δώσ' του 10 με 15 δευτερόλεπτα. Η έκδοση για παιδιά δημιουργείται εκείνη τη στιγμή, την πρώτη φορά.",
              "Επίσης: η λειτουργία για παιδιά απαιτεί Clear ή Deep. Αν είσαι στο Basic, ο διακόπτης θα σου προτείνει να αναβαθμίσεις. Στους ανώνυμους χρήστες προτείνεται να εγγραφούν.",
            ],
          },
          {
            id: "voice-fails",
            q: "Η φωνητική αναζήτηση δεν λειτουργεί.",
            a: [
              "Η φωνητική αναζήτηση χρειάζεται άδεια μικροφώνου. Οι περισσότεροι browsers ρωτούν μία φορά ανά ιστότοπο. Αν κατά λάθος πάτησες Αποκλεισμός, θα χρειαστεί να το αλλάξεις πίσω χειροκίνητα: πάτησε το εικονίδιο του λουκέτου ή των πληροφοριών δίπλα στο gadit.app στη γραμμή διευθύνσεων, μετά Ρυθμίσεις ιστότοπου, μετά Μικρόφωνο, μετά Να επιτρέπεται.",
              "Στο Safari iOS, η πρόσβαση στο μικρόφωνο απαιτεί επίσης έναν διακόπτη στο Ρυθμίσεις → Safari → Μικρόφωνο. Η φωνή είναι προς το παρόν λειτουργία των Clear και Deep: οι χρήστες Basic βλέπουν πρόταση αναβάθμισης, οι αποσυνδεδεμένοι επισκέπτες βλέπουν πρόταση σύνδεσης.",
            ],
          },
          {
            id: "no-image",
            q: "Δεν μπορώ να δημιουργήσω εικόνα για τη λέξη.",
            a: [
              "Η δημιουργία εικόνων είναι λειτουργία των Clear ή Deep με μηνιαίο όριο. Το Clear παίρνει 30 εικόνες τον μήνα, το Deep παίρνει 100. Αν έχεις εξαντλήσει το όριο, θα δεις ένα φράγμα. Επαναφέρεται την 1η κάθε μήνα.",
              "Αν είσαι κάτω από το όριο και εξακολουθείς να βλέπεις αποτυχίες, συνήθως είναι παροδικό. Δοκίμασε ξανά σε 30 δευτερόλεπτα. Οι επίμονες αποτυχίες είναι σφάλμα. Κάνε αναφορά από τη σελίδα της λέξης.",
            ],
          },
          {
            id: "save-word",
            q: "Πώς αποθηκεύω μια λέξη στο σημειωματάριό μου;",
            a: [
              "Σε οποιαδήποτε σελίδα αποτελέσματος λέξης, πάτησε Αποθήκευση στο σημειωματάριο κοντά στον τίτλο. Το σημειωματάριο είναι λειτουργία των Clear και Deep, όπου μπορείς να ξαναδείς αποθηκευμένες λέξεις αργότερα, να τις δεις σε προβολή γαλαξία και να τρέξεις συνεδρίες έξυπνης εξάσκησης (Deep).",
              "Οι λέξεις που έχεις αποθηκεύσει και ανοίξει τουλάχιστον μία φορά είναι διαθέσιμες εκτός σύνδεσης από την τοπική μνήμη. Το πακέτο εκτός σύνδεσης αποθηκεύει επίσης τις πιο δημοφιλείς λέξεις στη γλώσσα σου, ώστε να είσαι έτοιμος και χωρίς ίντερνετ.",
            ],
          },
          {
            id: "offline",
            q: "Πώς λειτουργεί η λειτουργία εκτός σύνδεσης;",
            a: [
              "Οι λέξεις που έχεις ήδη δει αποθηκεύονται τοπικά. Άνοιξέ τες ξανά χωρίς ίντερνετ και φορτώνουν αμέσως. Το πλήρες πακέτο εκτός σύνδεσης (κορυφαίες λέξεις στη γλώσσα σου) κατεβαίνει κατ' απαίτηση από τη σελίδα του σημειωματαρίου.",
              "Η αναζήτηση μιας ολοκαίνουριας λέξης εξακολουθεί να απαιτεί σύνδεση, γιατί το Gadit πρέπει να δημιουργήσει τον ορισμό από την αρχή. Η μνήμη εκτός σύνδεσης είναι για λέξεις που έχεις ήδη εξερευνήσει.",
            ],
          },
          {
            id: "slow",
            q: "Η εφαρμογή μοιάζει αργή.",
            a: [
              "Η πρώτη αναζήτηση μιας λέξης είναι η πιο αργή, γιατί το Gadit δημιουργεί ολόκληρο το αποτέλεσμα από την αρχή: συνήθως λίγα δευτερόλεπτα, μερικές φορές περισσότερο για σύνθετες λέξεις. Οι επόμενες αναζητήσεις της ίδιας λέξης είναι ακαριαίες, σερβίρονται από τη μνήμη.",
              "Αν όλα μοιάζουν αργά, δοκίμασε μια σκληρή ανανέωση: Cmd+Shift+R σε Mac, Ctrl+Shift+R σε Windows. Αν η βραδύτητα επιμένει σε όλες τις σελίδες, στείλε μας email με τη χώρα και τον browser σου, ώστε η ομάδα να ελέγξει τη διαδρομή του δικτύου προς τους διακομιστές μας από την περιοχή σου.",
            ],
          },
          {
            id: "word-not-found",
            q: "Αναζήτησα μια λέξη και δεν πήρα αποτέλεσμα. Τι συμβαίνει;",
            a: [
              "Πρώτα, έλεγξε την ορθογραφία. Το Gadit χειρίζεται τα περισσότερα μικρά τυπογραφικά λάθη, αλλά ένα λάθος φωνήεν ή ένα γράμμα που λείπει μπορεί να το μπερδέψει. Δοκίμασε την προτεινόμενη διόρθωση, αν εμφανιστεί.",
              "Πέρα από αυτό: πολύ σπάνιες λέξεις ή αργκό μπορεί να μην επιστρέψουν σίγουρο αποτέλεσμα. Αν είσαι σίγουρος ότι η λέξη είναι υπαρκτή, πάτησε το κουμπί Αναφορά στη σελίδα του αποτελέσματος (ή στην οθόνη σφάλματος) και ενημέρωσέ μας. Κάθε αναφορά εξετάζεται και οι πραγματικές αστοχίες τροφοδοτούνται πίσω στο σύστημα.",
            ],
          },
          {
            id: "change-language",
            q: "Πώς αλλάζω τη γλώσσα του περιβάλλοντος;",
            a: [
              "Πάνω δεξιά σε κάθε σελίδα, θα δεις ένα μικρό εικονίδιο σημαίας (ή το όνομα της τρέχουσας γλώσσας σου). Πάτησέ το και διάλεξε ανάμεσα σε 30+ γλώσσες: Αγγλικά, Ελληνικά, Εβραϊκά, Αραβικά, Ρωσικά, Ισπανικά, Πορτογαλικά, Γαλλικά, Γερμανικά, Τσέχικα, Σλοβάκικα, Ιταλικά, Ιαπωνικά, Χίντι, Αμχαρικά.",
              "Η επιλογή σου αποθηκεύεται σε αυτή τη συσκευή. Όλα ξαναφορτώνουν στη νέα γλώσσα: το περιβάλλον, τα μενού, οι μελλοντικοί ορισμοί λέξεων, τα παραδείγματα, οι επεξηγήσεις για παιδιά, ακόμα και η ετυμολογία. Τα ήδη αποθηκευμένα αποτελέσματα στην παλιά γλώσσα παραμένουν μέχρι να αναζητήσεις ξανά αυτές τις λέξεις.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Πρόγραμμα συνεργατών",
        items: [
          {
            id: "join-partner",
            q: "Πώς γίνομαι συνεργάτης του Gadit;",
            a: [
              "Άνοιξε το /partners από οποιαδήποτε σελίδα και πάτησε \"Γίνε συνεργάτης\". Κάνε εγγραφή με το όνομα και το email σου, και ο μοναδικός σου σύνδεσμος παραπομπής μαζί με έναν πίνακα για την παρακολούθηση κλικ και προμηθειών είναι έτοιμα αμέσως. Χωρίς αναμονή για έγκριση.",
              "Η συμμετοχή είναι δωρεάν και ανοιχτή σε όλους. Δεν χρειάζεσαι συνδρομή στο Gadit για να γίνεις συνεργάτης.",
            ],
          },
          {
            id: "commission-model",
            q: "Πώς υπολογίζονται οι προμήθειες;",
            a: [
              "Οι τυπικοί όροι είναι 25% από κάθε πληρωμή που κάνει ένας πελάτης τον πρώτο του χρόνο. Μετά τον πρώτο χρόνο, κερδίζεις 10% από κάθε πληρωμή για όσο ο πελάτης συνεχίζει να πληρώνει.",
              "Αυτό ισχύει το ίδιο για μηνιαία και ετήσια πλάνα, γιατί η προμήθεια υπολογίζεται σε κάθε πραγματική πληρωμή. Αν ένας πελάτης ακυρώσει, η προμήθειά σου σταματά με την τελευταία του πληρωμή.",
              "Η ομάδα μπορεί να ορίσει διαφορετικά ποσοστά για συγκεκριμένους συνεργάτες. Τα δικά σου ποσοστά φαίνονται πάντα στον πίνακα συνεργατών σου, στον οποίο φτάνεις από το /partners.",
            ],
          },
          {
            id: "payout",
            q: "Πότε πληρώνομαι;",
            a: [
              "Μηνιαία, μόλις το υπόλοιπό σου ξεπεράσει τα $50. Χρησιμοποιούμε τη μέθοδο πληρωμής που όρισες στον πίνακα συνεργατών (τραπεζικό έμβασμα, PayPal και ούτω καθεξής). Τα $50 είναι το ελάχιστο όριο, όχι ανώτατο. Μπορείς να κερδίσεις πολύ περισσότερα, απλώς λαμβάνεις την πληρωμή όταν ξεπεράσεις το όριο.",
              "Οι προμήθειες αποδεσμεύονται 30 ημέρες μετά την πληρωμή της συνδρομής, ώστε να καλυφθεί το παράθυρο επιστροφών. Έτσι μια συνδρομή του Ιανουαρίου αποδεσμεύεται στις αρχές Φεβρουαρίου και μπαίνει στην επόμενη πληρωμή σου μόλις το υπόλοιπό σου ξεπεράσει τα $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Εγγράφηκα αλλά ο πίνακάς μου είναι άδειος.",
            a: [
              "Τα στατιστικά εμφανίζονται μετά το πρώτο κλικ στον σύνδεσμό σου. Άδειος σημαίνει απλώς ότι κανείς δεν έχει κάνει κλικ ακόμα. Πήγαινε να μοιραστείς τον σύνδεσμο. Ο πίνακας ενημερώνεται σχεδόν σε πραγματικό χρόνο μόλις ξεκινήσει η δραστηριότητα.",
              "Αν έχεις μοιραστεί τον σύνδεσμο και κάποιος έχει εγγραφεί αλλά ο πίνακας δεν το αντικατοπτρίζει, γράψε μας με τον κατά προσέγγιση χρόνο της εγγραφής και η ομάδα θα ελέγξει την απόδοση.",
            ],
          },
          {
            id: "attribution-window",
            q: "Για πόσο καιρό ο σύνδεσμος παραπομπής μου συνεχίζει να παρακολουθεί έναν επισκέπτη;",
            a: [
              "Εξήντα ημέρες. Όταν ένας επισκέπτης κάνει κλικ στον σύνδεσμό σου, ορίζουμε ένα cookie που σε αναγνωρίζει ως τον παραπέμποντα. Αν εγγραφεί και κάνει συνδρομή οποιαδήποτε στιγμή μέσα στις επόμενες 60 ημέρες (ακόμα κι αν φύγει από τον ιστότοπο και επιστρέψει αργότερα μέσω αναζήτησης στο Google), η απόδοση εξακολουθεί να πιστώνεται σε εσένα.",
              "Εκκαθάριση cookies: αν ο επισκέπτης καθαρίσει τα cookies του ή αλλάξει browser ή συσκευή πριν εγγραφεί, η απόδοση μπορεί να χαθεί. Δεν υπάρχει λύση γι' αυτό, αλλά οι 60 ημέρες είναι ένα γενναιόδωρο παράθυρο σε σύγκριση με τα περισσότερα προγράμματα συνεργατών.",
            ],
          },
          {
            id: "missing-commission",
            q: "Κάποιος εγγράφηκε μέσω του συνδέσμου μου αλλά δεν βλέπω την προμήθεια.",
            a: [
              "Τις περισσότερες φορές είναι θέμα χρονισμού: η εγγραφή εμφανίζεται στον πίνακα μέσα σε λεπτά, αλλά η προμήθεια καταχωρείται μόνο όταν η συνδρομή πληρωθεί πραγματικά (κάτι που μπορεί να αργήσει μέρες αν ο χρήστης είναι σε δωρεάν δοκιμή). Έλεγξε ξανά αφού λήξει η δοκιμή.",
              "Αν η συνδρομή πληρώθηκε αλλά εξακολουθείς να μη βλέπεις την προμήθεια μετά από 48 ώρες, γράψε μας με τον κατά προσέγγιση χρόνο εγγραφής και το email ή το κατά προσέγγιση όνομα του συνδρομητή, αν το γνωρίζεις. Η ομάδα θα ψάξει την αλυσίδα απόδοσης και θα διορθώσει χειροκίνητα οποιαδήποτε αστοχία.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Γενικά",
        items: [
          {
            id: "what-is-gadit",
            q: "Τι είναι το Gadit;",
            a: [
              "Ένα πολύγλωσσο λεξικό φτιαγμένο για να κάνει μια λέξη να «κουμπώσει», όχι απλώς να δώσει έναν μονόγραμμο ορισμό. Κάθε λέξη ανοίγει με όλες τις σημασίες της, πραγματικά παραδείγματα ανά σημασία, ιδιωματισμούς, ετυμολογία, μια προαιρετική εικόνα και (με τα Clear και Deep) μια επεξήγηση φιλική προς τα παιδιά, σύνθεση δικής σου πρότασης με ανατροφοδότηση και κουίζ.",
              "Αυτή τη στιγμή 30+ γλώσσες περιβάλλοντος. Εσωτερικά, η ομάδα το λέει «να κάνεις GAD σε μια λέξη»: να την καταλάβεις μέχρι το τέλος, όχι απλώς να τη μεταφράσεις.",
            ],
          },
          {
            id: "languages",
            q: "Ποιες γλώσσες υποστηρίζετε;",
            a: [
              "Περιβάλλον: Αγγλικά, Ελληνικά, Εβραϊκά, Αραβικά, Ρωσικά, Ισπανικά, Πορτογαλικά, Γαλλικά, Γερμανικά, Τσέχικα, Σλοβάκικα, Ιταλικά, Ιαπωνικά.",
              "Μπορείς να αναζητήσεις μια λέξη σε οποιαδήποτε από αυτές τις γλώσσες και να πάρεις τον ορισμό, τα παραδείγματα και όλα τα υπόλοιπα στη γλώσσα περιβάλλοντος που διάλεξες. Τα Εβραϊκά και τα Αραβικά είναι πλήρως RTL και χρησιμοποιούν τις μητρικές τους γραμματοσειρές.",
            ],
          },
          {
            id: "kid-safety",
            q: "Είναι το Gadit ασφαλές για παιδιά;",
            a: [
              "Το Gadit σχεδιάστηκε για να το χρησιμοποιεί ένας γονέας με ασφάλεια δίπλα σε ένα παιδί. Η λειτουργία για παιδιά παράγει επεξηγήσεις που είναι απλές, συγκεκριμένες και κατάλληλες για την ηλικία (γύρω στο επίπεδο 5 με 10 ετών), χρησιμοποιώντας τον ίδιο μηχανισμό που τροφοδοτεί το περιεχόμενο για ενήλικες, με ρητές οδηγίες για απλοποίηση. Κανένα περιεχόμενο που δημιουργείται από χρήστες δεν εμφανίζεται ποτέ σε παιδιά.",
              "Σύμφωνα με τις πολιτικές μας και τους κανόνες προστασίας της ιδιωτικότητας των παιδιών σε όλο τον κόσμο, η ανεξάρτητη κατοχή λογαριασμού είναι από 13 ετών και άνω. Το τυπικό μοτίβο είναι ένας λογαριασμός γονέα που ο γονέας χρησιμοποιεί μαζί με το παιδί του, κάτι που είναι ακριβώς αυτό για το οποίο φτιάχτηκε η λειτουργία για παιδιά.",
            ],
          },
          {
            id: "data",
            q: "Πού αποθηκεύονται τα δεδομένα μου; Τα πουλάτε;",
            a: [
              "Ο λογαριασμός, το ιστορικό, το σημειωματάριο και οι εικόνες που δημιουργήθηκαν αποθηκεύονται με ασφάλεια στο Firebase, κρυπτογραφημένα στην αποθήκευση. Δεν πουλάμε τα δεδομένα σου σε κανέναν. Μοιραζόμαστε μόνο ό,τι χρειάζεται για να λειτουργεί το Gadit (αποθήκευση, πληρωμές, πάροχοι περιεχομένου), όπως περιγράφεται στην Πολιτική Απορρήτου.",
              "Μπορείς να εξαγάγεις το σημειωματάριό σου ή να διαγράψεις τον λογαριασμό σου οποιαδήποτε στιγμή από τη σελίδα του λογαριασμού.",
            ],
          },
          {
            id: "contact-direct",
            q: "Πώς επικοινωνώ μαζί σας απευθείας;",
            a: [
              "Χρησιμοποίησε το κουμπί email στο κάτω μέρος αυτής της σελίδας. Πηγαίνει κατευθείαν στα εισερχόμενα της ομάδας. Κάθε μήνυμα διαβάζεται και λαμβάνει απάντηση μέσα σε 24 με 48 ώρες (συχνά πιο γρήγορα).",
              "Το email υπερτερεί του chat για υποστήριξη: δίνει στην ομάδα την ευκαιρία να διαβάσει προσεκτικά και να απαντήσει στοχευμένα. Τηλεφωνική υποστήριξη δεν προσφέρεται ακόμα.",
            ],
          },
        ],
      },
    ],
  },
  he: {
    eyebrow: "מרכז עזרה",
    heading: "מצאו תשובה. מהר.",
    lede: "שאלות נפוצות ופתרונות שלב שלב, מסודרים לפי תחום. לא רואים את הבעיה שלכם? אפשר לפנות אלינו ישירות למטה.",
    stillNeedHelpHeading: "עדיין תקועים?",
    stillNeedHelpBody: "כתבו לנו ישירות. כל הודעה נקראת על ידי הצוות, ותגובה תגיע תוך יום או יומיים.",
    emailCta: "שלחו לנו מייל",
    responseTime: "זמן תגובה אופייני: עד 48 שעות.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "חיוב ומנוי",
        items: [
          {
            id: "change-card",
            q: "איך אני מחליף כרטיס אשראי לחיוב המנוי שלי?",
            a: [
              "אפשר להחליף לכרטיס חדש בפחות מדקה, בלי לבטל. המנוי הנוכחי שלכם ממשיך, פשוט עם הכרטיס החדש.",
              "1. היכנסו ל-gadit.app ופתחו את עמוד החשבון (פינה ימנית עליונה). 2. לחצו על \"ניהול חיוב\". 3. ייפתח מסך מאובטח של Stripe. לחצו \"Add payment method\", הכניסו את הכרטיס החדש, וסמנו אותו כברירת מחדל. 4. אופציונלי, מחקו את הכרטיס הישן.",
              "מהחיוב הבא והלאה הכל ילך לכרטיס החדש. החיוב הקודם (שכבר נגבה) נשאר על הכרטיס הישן. אין צורך בהחזר אלא אם תרצו אחד באופן ספציפי.",
            ],
          },
          {
            id: "cancel",
            q: "איך מבטלים מנוי?",
            a: [
              "בעצמכם, בכל רגע. מתחברים, נכנסים לחשבון ולוחצים \"ביטול המנוי\" מתחת למסלול.",
              "הגישה ממשיכה עד סוף התקופה ששילמתם עליה. אחר כך החשבון יורד ל-Basic (חינמי). המילים השמורות, היסטוריה והמחברת נשמרים ונשארים נגישים.",
              "אם ביטלתם בטעות או שינתם דעתכם, אפשר לחדש את המנוי מאותו עמוד לפני שהתקופה מסתיימת.",
            ],
          },
          {
            id: "switch-plan",
            q: "איך עוברים מ-Clear ל-Deep (או הפוך)?",
            a: [
              "חשבון, ואז ניהול חיוב, ואז Update subscription. בחרו את המסלול החדש.",
              "Stripe מחשב את ההפרש אוטומטית, לפי הימים שנותרו בתקופת החיוב. אם משדרגים, תחויבו רק על ההפרש לתקופה הנוכחית. אם עוברים למסלול נמוך יותר, הקרדיט יחול על החיוב הבא.",
            ],
          },
          {
            id: "invoice",
            q: "איך מורידים חשבונית או קבלה?",
            a: [
              "חשבון, ואז ניהול חיוב, ואז Invoice history. לכל חיוב יש קבלת PDF להורדה עם פרטי החיוב ששמרתם.",
              "אם צריך שם, כתובת או מספר עוסק שונים על החשבונית (למשל שם חברה לצרכי מס), עדכנו את פרטי החיוב באותו עמוד לפני ההורדה. הקבלה הבאה תשתמש בפרטים החדשים.",
            ],
          },
          {
            id: "portal-error",
            q: "לחצתי על ניהול חיוב וקיבלתי שגיאה. מה לעשות?",
            a: [
              "שתי סיבות נפוצות. ראשית, לחשבון שלכם אין מנוי Stripe פעיל. שנית, ייתכן שפרופיל הלקוח שלכם ב-Stripe לא נוצר או לא הושלם כמו שצריך.",
              "בדיקה ראשונה פשוטה: צאו, היכנסו שוב עם האימייל שבו רכשתם, ונסו שוב. אם זה עדיין לא עובד, כתבו לנו עם האימייל של החשבון והצוות יסדר את זה מהצד שלנו בדקה.",
            ],
          },
          {
            id: "autorenew",
            q: "המנוי יתחדש אוטומטית?",
            a: [
              "כן. מנויים חודשיים מתחדשים כל חודש, מנויים שנתיים מתחדשים כל שנה באותו תאריך. אפשר לראות את תאריך החיוב הבא בעמוד החשבון וב-Stripe portal.",
              "אם אתם לא רוצים חידוש אוטומטי, בטלו בכל רגע לפני תאריך החידוש. הביטול אינו מיידי. אתם שומרים על הגישה עד סוף התקופה ששילמתם.",
            ],
          },
          {
            id: "refund",
            q: "אפשר לקבל החזר כספי?",
            a: [
              "כן. אם רכשתם לפני פחות מ-14 ימים ולא השתמשתם בשירות הרבה, כתבו לנו עם האימייל של החשבון והסבר קצר. החזרים כאלה מאושרים בלי להתעקש.",
              "אם עבר יותר מ-14 ימים, הצוות יטפל מקרה מקרה. בטלו את המנוי כדי שלא יתחדש, ושלחו לנו מייל.",
            ],
          },
          {
            id: "unknown-charge",
            q: "אני רואה חיוב שאני לא מזהה.",
            a: [
              "חיובים מופיעים כ-GADIT או GADIT.APP עם $2.99 (Clear חודשי), $4.99 (Deep חודשי), $29.99 (Clear שנתי), או $49.99 (Deep שנתי). אם זה לא תואם, זה כנראה משירות אחר.",
              "אם אתם בטוחים שזה לא שלכם, אל תפנו לבנק עם מחלוקת עדיין. כתבו לנו קודם עם התאריך והסכום. הצוות ימצא, יסביר מה זה, ויחזיר אם צריך. פתיחת מחלוקת דרך הבנק עלולה לסבך את החיוב ואת החשבון שלכם בהמשך, לכן פנייה לתמיכה היא מהירה ובטוחה יותר.",
            ],
          },
          {
            id: "failed-payment",
            q: "התשלום שלי נכשל. מה לעשות?",
            a: [
              "Stripe מנסה אוטומטית לחייב מחדש כמה פעמים בימים שלאחר הכישלון. רוב הכשלים מסתדרים מעצמם ברגע שהבנק משחרר את ההקפאה או שהכרטיס חוזר ליתרה חיובית.",
              "אם תרצו לתקן מיד, היכנסו לחשבון → ניהול חיוב → Add payment method, הוסיפו כרטיס תקין וסמנו אותו כברירת מחדל. Stripe ינסה לחייב את החיוב הכושל מיד בכרטיס החדש. אם המנוי כבר ירד ל-Basic, אפשר לחדש מחדש מעמוד המחירים, והמחברת שלכם נשארת שלמה.",
            ],
          },
          {
            id: "plan-comparison",
            q: "מה ההבדל בין Basic, Clear ו-Deep?",
            a: [
              "Basic (חינם): עד 20 חיפושי מילים ביום, כל המשמעויות, דוגמאות לכל משמעות, ניבים, ומקור המילה. לא נדרשת הרשמה לחיפושים בסיסיים.",
              "Clear ($2.99 לחודש או $29.99 לשנה): חיפושים ללא הגבלה, הסברים ידידותיים לילדים, תמונה לכל מילה (30 בחודש), חיבור משפט משלכם עם פידבק, פירוט ניבים, ו-30 ימי היסטוריית חיפושים.",
              "Deep ($4.99 לחודש או $49.99 לשנה): כל מה ש-Clear כולל, ובנוסף חידוני תרגול, המחברת האישית עם תרגול חכם בשיטת חזרה מרווחת, השוואה בין מילים דומות, ומכסה גדולה יותר של תמונות (100 בחודש).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "חשבון וכניסה",
        items: [
          {
            id: "no-verification-email",
            q: "לא קיבלתי מייל אימות.",
            a: [
              "בדקו קודם את תיקיית הספאם והקידומים. Gmail ו-Outlook לפעמים מפנים מיילי חשבון לשם עד שמסמנים אחד כ\"לא ספאם\".",
              "אם זה לא שם, אולי הייתה טעות באימייל בהרשמה. נסו להירשם שוב ובדקו את הכתובת. אם נרשמתם דרך Google, לא נדרש מייל אימות.",
            ],
          },
          {
            id: "forgot-password",
            q: "שכחתי סיסמה.",
            a: [
              "פתחו את דיאלוג ההתחברות ולחצו \"שכחת סיסמה?\". הכניסו את האימייל שאתם משתמשים בו ב-Gadit ותקבלו לינק לאיפוס תוך דקה או שתיים.",
              "אם המייל לא מגיע, בדקו ספאם. אם הוא עדיין לא מגיע, אולי נרשמתם עם Google ולא עם אימייל וסיסמה. נסו את הכפתור \"Continue with Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "אני בטוח שהסיסמה נכונה אבל מקבל \"אימייל או סיסמה שגויים\".",
            a: [
              "שלושה דברים לבדוק. ראשית, Caps Lock. שנית, רווח מיותר אחרי העתקה. שלישית, נרשמתם עם Google ולא עם סיסמה (השתמשו ב-\"Continue with Google\").",
              "עדיין תקועים? אפסו את הסיסמה מאותו דיאלוג. זה מסדר אתכם נקי.",
            ],
          },
          {
            id: "google-fails",
            q: "התחברות עם Google לא עובדת.",
            a: [
              "הסיבה הנפוצה ביותר: הדפדפן חוסם cookies של צד שלישי או pop-ups עבור gadit.app. אפשרו אותם בהרשאות שורת הכתובת ונסו שוב.",
              "אם אתם במצב גלישה בסתר, התחברות Google מוגבלת בכוונה. עברו לחלון רגיל.",
            ],
          },
          {
            id: "change-email",
            q: "איך משנים את האימייל של החשבון?",
            a: [
              "חשבון, לחיצה על האימייל שלכם, Change email. תצטרכו לאשר את הכתובת החדשה לפני שזה תופס. המנוי, היסטוריה והמחברת, הכל עובר אוטומטית.",
              "אם האימייל קשור ל-customer ב-Stripe, עדכנו אותו גם בפורטל החיוב של Stripe כדי שקבלות עתידיות ילכו לכתובת החדשה.",
            ],
          },
          {
            id: "delete-account",
            q: "איך מוחקים חשבון?",
            a: [
              "חשבון, תחתית העמוד, Delete account. זה לצמיתות. המנוי מבוטל, המחברת וההיסטוריה נמחקות, והאימייל מתפנה להרשמה חדשה.",
              "רשומות Stripe של חיובים עבר נשארות (חייבים לפי חוק לשמור לצרכי הנהלת חשבונות). שום דבר אחר לא נשאר.",
            ],
          },
          {
            id: "share-account",
            q: "בן הזוג או הילד שלי יכולים לחלוק את החשבון שלי?",
            a: [
              "משתמש מחובר אחד לחשבון בכל רגע. מצב ילדים מאפשר לחשבון Clear או Deep אחד לשרת הורה וילד יחד: לוחצים על הטוגל וההגדרות מוצגות באופן ידידותי לילד בלי לוגין נפרד.",
              "לשני מבוגרים שרוצים מחברות והתקדמות נפרדות, פתחו שני חשבונות. Clear עולה $2.99 לחודש לכל חשבון.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "נראה שיש לי שני חשבונות בטעות. מה עושים?",
            a: [
              "זה קורה בדרך כלל כשמישהו נרשם פעם אחת עם Google ופעם נוספת עם אימייל וסיסמה לאותה הכתובת, או כשנרשמים פעמיים בכתובות שונות. כל הרשמה יוצרת חשבון נפרד ב-Gadit עם מחברת, היסטוריה ומנוי משלו.",
              "כתבו לנו עם שני האימיילים (או ה-UID של כל חשבון מעמוד החשבון) ועם איזה חשבון תרצו להשאיר. הצוות יאחד את המחברת וההיסטוריה אל החשבון שבחרתם, ויסגור את השני בצורה נקייה. שום מידע לא יאבד.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "שימוש ב-Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "ההגדרה לא נכונה. מה לעשות?",
            a: [
              "בכל עמוד תוצאה יש כפתור \"דיווח\" קטן בתחתית. לחצו עליו, בחרו קטגוריה (הגדרה, אטימולוגיה, דוגמה, ניב, הסבר לילדים וכו') וכתבו הערה קצרה. זה מגיע ישירות לצוות וכל דיווח נבדק.",
              "אל תדאגו להיות יותר מדי קפדנים. המילון משתפר מהפידבק הזה מהר יותר מכל דבר אחר.",
            ],
          },
          {
            id: "kids-not-working",
            q: "מצב ילדים לא מחליף את ההסבר.",
            a: [
              "מצב ילדים מחליף טקסט רק היכן שלמילה כבר יש הסבר ידידותי לילד שנוצר. למילים חדשות שזה עתה חיפשתם, תנו לזה 10 עד 15 שניות. הגרסה לילדים נוצרת on-the-fly בפעם הראשונה.",
              "כמו כן: מצב ילדים דורש Clear או Deep. אם אתם ב-Basic, הטוגל יזמין אתכם לשדרג. למשתמשים אנונימיים יוצע להירשם.",
            ],
          },
          {
            id: "voice-fails",
            q: "חיפוש קולי לא עובד.",
            a: [
              "חיפוש קולי דורש הרשאת מיקרופון. רוב הדפדפנים שואלים פעם אחת לאתר. אם בטעות אמרתם חסום, צריך להחזיר ידנית: לחצו על אייקון המנעול או המידע ליד gadit.app בשורת הכתובת, אחר כך Site settings, אחר כך Microphone, אחר כך Allow.",
              "ב-Safari iOS, גישה למיקרופון דורשת גם הגדרה ב-Settings → Safari → Microphone. חיפוש קולי הוא כרגע פיצ'ר של Clear ו-Deep: משתמשי Basic יראו בקשה לשדרג מסלול, אורחים לא מחוברים יראו בקשה להירשם.",
            ],
          },
          {
            id: "no-image",
            q: "אני לא מצליח לייצר תמונה למילה.",
            a: [
              "יצירת תמונות היא פיצ'ר של Clear או Deep עם מכסה חודשית. Clear מקבל 30 תמונות לחודש, Deep מקבל 100. אם נגמרה המכסה, תראו חסימה. היא מתאפסת ב-1 לכל חודש.",
              "אם אתם מתחת למכסה ועדיין רואים כשלים, זה בדרך כלל זמני. נסו שוב בעוד 30 שניות. כשלים מתמשכים זה באג. אנא דווחו מעמוד המילה.",
            ],
          },
          {
            id: "save-word",
            q: "איך שומרים מילה במחברת?",
            a: [
              "בכל עמוד תוצאת מילה, לחצו על שמור במחברת ליד הכותרת. המחברת היא פיצ'ר של Clear ו-Deep, שבו תוכלו לסקור מילים שמורות מאוחר יותר, לראות אותן בתצוגת גלקסיה, ולהריץ אימוני חזרה חכמה (Deep).",
              "מילים ששמרתם ופתחתם לפחות פעם אחת זמינות במצב לא־מקוון. בנוסף, חבילת האופליין שומרת במטמון את המילים הפופולריות בשפה שלכם, כדי שתהיו מוכנים גם בלי אינטרנט.",
            ],
          },
          {
            id: "offline",
            q: "איך עובד המצב הלא־מקוון?",
            a: [
              "מילים שראיתם כבר נשמרות במטמון מקומי. פתחו אותן שוב בלי אינטרנט והן יטענו מיידית. חבילת האופליין המלאה (מילים מובילות בשפה שלכם) יורדת לבקשתכם מעמוד המחברת.",
              "חיפוש מילה חדשה לחלוטין עדיין דורש חיבור לאינטרנט, כי המערכת צריכה לייצר את ההגדרה מאפס. המטמון הלא־מקוון הוא למילים שכבר חקרתם.",
            ],
          },
          {
            id: "slow",
            q: "האפליקציה מרגישה אטית.",
            a: [
              "החיפוש הראשון של מילה הוא האטי ביותר, כי המערכת מייצרת את התוצאה המלאה מאפס. לרוב מדובר בכמה שניות, לפעמים יותר על מילים מורכבות. חיפושים חוזרים של אותה המילה מיידיים, כי הם מגיעים מהמטמון.",
              "אם הכל מרגיש אטי, נסו לרענן את הדף ברענון קשה: Cmd+Shift+R במק, או Ctrl+Shift+R בווינדוס. אם האיטיות נמשכת בכל העמודים, שלחו לנו מייל עם המדינה והדפדפן שלכם, כדי שהצוות יוכל לבדוק אם יש בעיית ניתוב מהאזור שלכם לשרתים.",
            ],
          },
          {
            id: "word-not-found",
            q: "חיפשתי מילה ולא קיבלתי תוצאה. מה קורה?",
            a: [
              "קודם כל בדקו את הכתיב. Gadit מסתדר עם רוב טעויות הקלדה קטנות, אבל אות חסרה או תנועה לא נכונה יכולות לבלבל את המערכת. אם מופיעה הצעת תיקון, נסו אותה.",
              "מעבר לזה, מילים נדירות מאוד או סלנג לא תמיד מצליחות לחזור עם תשובה בטוחה. אם אתם בטוחים שהמילה תקינה, לחצו על כפתור הדיווח בעמוד התוצאה (או במסך השגיאה) ושלחו לנו. כל דיווח נבדק, ופספוסים אמיתיים מוחזרים למערכת.",
            ],
          },
          {
            id: "change-language",
            q: "איך משנים את שפת הממשק?",
            a: [
              "בפינה הימנית-עליונה של כל עמוד תראו אייקון קטן של דגל (או את שם השפה הנוכחית). לחצו עליו ובחרו מתוך 30+ שפות: עברית, אנגלית, יוונית, ערבית, רוסית, ספרדית, פורטוגזית, צרפתית, גרמנית, צ'כית, סלובקית, איטלקית, יפנית, הינדי, אמהרית.",
              "הבחירה נשמרת על המכשיר. הכל ייטען מחדש בשפה החדשה: הממשק, התפריטים, הגדרות מילים עתידיות, הדוגמאות, ההסבר לילדים ואפילו האטימולוגיה. תוצאות שכבר נשמרו במטמון בשפה הישנה יישארו כך עד שתחפשו אותן שוב.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "תוכנית שותפים",
        items: [
          {
            id: "join-partner",
            q: "איך אני נהיה שותף של Gadit?",
            a: [
              "פתיחת /partners מכל עמוד, ולחיצה על \"הצטרפות כשותף\". ההרשמה היא עם שם ואימייל, והלינק הייחודי מגיע מיד יחד עם דשבורד למעקב אחרי קליקים ועמלות. אין המתנה לאישור.",
              "ההצטרפות חינמית ופתוחה לכולם. לא צריך מנוי ל-Gadit כדי להיות שותפים.",
            ],
          },
          {
            id: "commission-model",
            q: "איך מחושבות העמלות?",
            a: [
              "התנאים הרגילים הם 25% מכל תשלום של לקוח בשנה הראשונה שלו. אחרי השנה הראשונה תקבלו 10% מכל תשלום, כל עוד הלקוח ממשיך לשלם.",
              "זה עובד אותו דבר במנוי חודשי ובמנוי שנתי, כי העמלה מחושבת על כל תשלום בפועל. אם לקוח מבטל, העמלה שלכם נעצרת בתשלום האחרון שלו.",
              "הצוות יכול לקבוע אחוזים אחרים לשותפים מסוימים. האחוזים שלכם תמיד מופיעים בלוח השותפים שלכם, שאפשר להגיע אליו מ-/partners.",
            ],
          },
          {
            id: "payout",
            q: "מתי אני מקבל את הכסף?",
            a: [
              "חודשית, ברגע שהיתרה עוברת $50. אנחנו משתמשים בשיטת התשלום שהגדרתם בלוח השותפים (העברה בנקאית, PayPal וכו'). $50 הוא הסף המינימלי, לא תקרה. אתם יכולים להרוויח הרבה יותר, פשוט מקבלים את התשלום כשעוברים את הסף.",
              "העמלות משתחררות 30 יום אחרי תשלום המנוי, כדי לאפשר חלון להחזרים. אז מנוי מינואר משוחרר בתחילת פברואר, וייכנס לתשלום הבא כשהיתרה שלכם עוברת $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "נרשמתי אבל לוח השותפים שלי ריק.",
            a: [
              "הסטטיסטיקות מופיעות אחרי הקליק הראשון על הלינק שלכם. ריק פירושו פשוט שאף אחד לא לחץ עדיין. צאו ושתפו את הלינק. לוח השותפים מתעדכן כמעט בזמן אמת ברגע שמתחילה פעילות.",
              "אם שיתפתם ומישהו נרשם אבל לוח השותפים לא משקף את זה, כתבו לנו עם הזמן המשוער שבו הוא נרשם, והצוות יבדוק את השיוך.",
            ],
          },
          {
            id: "attribution-window",
            q: "כמה זמן לינק ההפניה שלי ממשיך לעקוב אחרי מבקרים?",
            a: [
              "60 ימים. כשמבקר לוחץ על הלינק שלכם, אנחנו שותלים cookie שמזהה אתכם כמפנים. אם הוא ירשם או יקנה מנוי בכל זמן ב-60 הימים הבאים, גם אם הוא יצא מהאתר וחזר מאוחר יותר דרך חיפוש בגוגל, השיוך עדיין יתייחס אליכם.",
              "אם המבקר מנקה cookies או עובר דפדפן או מכשיר לפני שהוא נרשם, השיוך יכול לאבד. אין דרך לעקוף את זה, אבל 60 ימים זה חלון נדיב יחסית לרוב תוכניות השותפים בשוק.",
            ],
          },
          {
            id: "missing-commission",
            q: "מישהו נרשם דרך הלינק שלי אבל אני לא רואה עמלה.",
            a: [
              "ברוב המקרים זה עניין של תזמון: הרישום מופיע בלוח השותפים תוך דקות, אבל העמלה נרשמת רק כשהמנוי משלם בפועל, וזה יכול להיות כמה ימים אחר כך אם הוא בתקופת ניסיון. תבדקו שוב אחרי שתקופת הניסיון נגמרת.",
              "אם המנוי שילם ועדיין אין עמלה אחרי 48 שעות, כתבו לנו עם הזמן המשוער של ההרשמה ועם האימייל או השם המשוער של הנרשם, אם אתם יודעים. הצוות יבדוק את שרשרת השיוך ויתקן ידנית כל פספוס.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "כללי",
        items: [
          {
            id: "what-is-gadit",
            q: "מה זה Gadit?",
            a: [
              "מילון רב־לשוני שבנוי כדי לגרום למילה להיתפס, לא רק לתת הגדרה של שורה אחת. כל מילה נפתחת עם כל המשמעויות שלה, דוגמאות אמיתיות לכל משמעות, ניבים, אטימולוגיה, תמונה אופציונלית, ו(עם Clear ו-Deep) הסבר ידידותי לילדים, חיבור משפט משלכם עם פידבק, וחידונים.",
              "כרגע 30+ שפות ממשק. אצלנו אומרים לעשות GAD למילה, כלומר להבין אותה עד הסוף, לא רק לתרגם אותה.",
            ],
          },
          {
            id: "languages",
            q: "אילו שפות אתם תומכים?",
            a: [
              "ממשק: אנגלית, עברית, יוונית, ערבית, רוסית, ספרדית, פורטוגזית, צרפתית, גרמנית, צ'כית, סלובקית, איטלקית, יפנית.",
              "אפשר לחפש מילה בכל אחת מהשפות הללו ולקבל הגדרה, דוגמאות, והכל ברירת מחדל בשפת הממשק שבחרתם. עברית וערבית הן RTL מלא ומשתמשות בפונטים הילידיים שלהן.",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit בטוח לילדים?",
            a: [
              "Gadit נבנה כך שהורה יוכל להשתמש בו עם הילד בצורה בטוחה ומבוקרת. מצב ילדים מייצר הסברים פשוטים, קונקרטיים ומתאימים לגיל (רמת 5 עד 10 שנים), עם אותו מנוע שמייצר את התוכן למבוגרים, רק עם הוראות מפורשות לפישוט. אף תוכן שמשתמשים יוצרים לא מוצג לילדים.",
              "בהתאם למדיניות שלנו ולכללי פרטיות ילדים בעולם, חשבון עצמאי מיועד לגיל 13 ומעלה. המודל הסטנדרטי הוא חשבון של ההורה שמשמש את ההורה יחד עם הילד, וזה בדיוק מה שמצב ילדים נועד לאפשר.",
            ],
          },
          {
            id: "data",
            q: "איפה הנתונים שלי שמורים? אתם מוכרים אותם?",
            a: [
              "חשבון, היסטוריה, מחברת ותמונות שנוצרו נשמרים באופן מאובטח אצל Firebase, מוצפנים באחסון. אנחנו לא מוכרים את הנתונים שלכם לאיש. אנחנו משתפים מידע רק עם השירותים שמפעילים את Gadit (אחסון, תשלומים, ספקי תוכן), בדיוק כפי שמפורט במדיניות הפרטיות.",
              "אפשר לייצא את המחברת או למחוק חשבון בכל רגע מעמוד החשבון.",
            ],
          },
          {
            id: "contact-direct",
            q: "איך אפשר להגיע אליכם ישירות?",
            a: [
              "השתמשו בכפתור המייל בתחתית העמוד. הוא מגיע ישירות לצוות. כל הודעה נקראת ומקבלת מענה תוך 24 עד 48 שעות (לרוב מהר יותר).",
              "מייל עדיף על צ'אט בתמיכה: הוא נותן לצוות לקרוא בעיון ולענות במחשבה. תמיכה טלפונית עדיין לא מוצעת.",
            ],
          },
        ],
      },
    ],
  },
} satisfies Partial<Record<Lang, HelpContent>>);

// The other 29 UI languages, one file per group (2026-10-10 i18n sweep).
Object.assign(HELP, HELP_MORE_1, HELP_MORE_2, HELP_MORE_3, HELP_MORE_4, HELP_MORE_5);
// Safety net: a language without its own block reads English.
for (const { code } of LANGUAGES) {
  if (!HELP[code]) HELP[code] = HELP.en;
}


// New plans (Gadi 2026-10-06): the plan answers come from plan-copy, so the
// help center says Basic / Individual / Family in every language.
for (const code of Object.keys(HELP) as Lang[]) {
  const h = HELP[code];
  const billing = h?.categories?.find((c) => c.id === "billing");
  if (!billing) continue;
  const L = h === HELP.en ? "en" : code;
  for (const it of billing.items) {
    if (it.id === "switch-plan") {
      it.q = planCopy(L, "helpSwitchQ");
      it.a = [planCopy(L, "helpSwitchA1"), planCopy(L, "helpSwitchA2")];
    } else if (it.id === "unknown-charge") {
      it.a = [planCopy(L, "helpChargeA1"), ...it.a.slice(1)];
    } else if (it.id === "plan-comparison") {
      it.q = planCopy(L, "helpCompareQ");
      it.a = [planCopy(L, "helpCompareA1"), planCopy(L, "helpCompareA2"), planCopy(L, "helpCompareA3")];
    }
  }
}
