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
 * - Partner program fourth. Affonso embed plus 30% / 10% lifetime
 *   model and payout question.
 * - General last. What Gadit is, languages, kids safety, data.
 */

import type { Lang } from "./i18n";

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
              "Self-serve, any time. Sign in, open Account, click Manage billing, then Cancel subscription.",
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
              "Top right of any page, you'll see a small flag icon (or your current language name). Tap it and pick from 22 languages: English, Greek, Hebrew, Arabic, Russian, Spanish, Portuguese, French, German, Czech, Slovak, Italian, Japanese, Hindi, Amharic, Zulu.",
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
              "The partner program is for Clear or Deep subscribers only. To recommend Gadit credibly, we ask that you use it yourself first. Upgrade from Pricing if you're on Basic.",
            ],
          },
          {
            id: "commission-model",
            q: "How are commissions calculated?",
            a: [
              "Standard partners earn 30% of every subscription paid via their link, every month, for the first 12 months of each subscriber. After 12 months that drops to 0%. If you've hit Active Partner status (10 paying subscribers active at once), you keep 10% lifetime commission on all of your subscribers, even after the first 12 months are up.",
              "Annual subscriptions get a one-time 15% commission on the first payment, instead of the 30% monthly rate spread across the year.",
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
              "Currently 14 UI languages. Internally the team calls it GAD a word: to understand a word all the way through, not just translate it.",
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
              "Uzenzela wena, nganoma yisiphi isikhathi. Ngena, vula i-Account, chofoza Manage billing, bese uchofoza Cancel subscription.",
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
              "Uhlelo lwabalingani lungolwababhalisi be-Clear noma be-Deep kuphela. Ukuze utuse i-Gadit ngokwethembeka, sicela ukuthi uyisebenzise wena kuqala. Thuthukisa kusuka ku-Pricing uma uku-Basic.",
            ],
          },
          {
            id: "commission-model",
            q: "Amakhomishini abalwa kanjani?",
            a: [
              "Abalingani abajwayelekile bahola u-30% wakho konke ukubhalisa okukhokhwa ngesixhumanisi sabo, njalo ngenyanga, ezinyangeni ezingu-12 zokuqala zombhalisi ngamunye. Ngemva kwezinyanga ezingu-12 lokho kwehla kuya ku-0%. Uma ufinyelele esimweni se-Active Partner (ababhalisi abangu-10 abakhokhayo abasebenzayo ngasikhathi sinye), ugcina ikhomishini engu-10% impilo yonke kubo bonke ababhalisi bakho, ngisho nangemva kokuphela kwezinyanga ezingu-12 zokuqala.",
              "Ukubhalisa konyaka kuthola ikhomishini engu-15% kanye enkokhelweni yokuqala, esikhundleni sezinga langenyanga elingu-30% elisatshalaliswe unyaka wonke.",
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
              "Το κάνεις μόνος σου, όποτε θέλεις. Συνδέσου, άνοιξε τον λογαριασμό, πάτησε Διαχείριση χρέωσης και μετά Ακύρωση συνδρομής.",
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
              "Πάνω δεξιά σε κάθε σελίδα, θα δεις ένα μικρό εικονίδιο σημαίας (ή το όνομα της τρέχουσας γλώσσας σου). Πάτησέ το και διάλεξε ανάμεσα σε 22 γλώσσες: Αγγλικά, Ελληνικά, Εβραϊκά, Αραβικά, Ρωσικά, Ισπανικά, Πορτογαλικά, Γαλλικά, Γερμανικά, Τσέχικα, Σλοβάκικα, Ιταλικά, Ιαπωνικά, Χίντι, Αμχαρικά.",
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
              "Το πρόγραμμα συνεργατών είναι μόνο για συνδρομητές Clear ή Deep. Για να προτείνεις το Gadit αξιόπιστα, σου ζητάμε να το χρησιμοποιείς πρώτα εσύ ο ίδιος. Αναβάθμισε από το Pricing αν είσαι στο Basic.",
            ],
          },
          {
            id: "commission-model",
            q: "Πώς υπολογίζονται οι προμήθειες;",
            a: [
              "Οι τυπικοί συνεργάτες κερδίζουν 30% από κάθε συνδρομή που πληρώνεται μέσω του συνδέσμου τους, κάθε μήνα, για τους πρώτους 12 μήνες κάθε συνδρομητή. Μετά τους 12 μήνες αυτό πέφτει στο 0%. Αν έχεις φτάσει στην κατάσταση Active Partner (10 πληρωμένοι συνδρομητές ενεργοί ταυτόχρονα), κρατάς 10% προμήθεια εφ' όρου ζωής σε όλους τους συνδρομητές σου, ακόμα και μετά τη λήξη των πρώτων 12 μηνών.",
              "Οι ετήσιες συνδρομές λαμβάνουν μια εφάπαξ προμήθεια 15% στην πρώτη πληρωμή, αντί για το μηνιαίο ποσοστό 30% κατανεμημένο στη διάρκεια του έτους.",
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
              "Αυτή τη στιγμή 22 γλώσσες περιβάλλοντος. Εσωτερικά, η ομάδα το λέει «να κάνεις GAD σε μια λέξη»: να την καταλάβεις μέχρι το τέλος, όχι απλώς να τη μεταφράσεις.",
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
              "אתם יכולים לבטל לבד, בכל רגע. היכנסו, פתחו את עמוד החשבון, לחצו ניהול חיוב, ואחר כך Cancel subscription.",
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
              "בפינה הימנית-עליונה של כל עמוד תראו אייקון קטן של דגל (או את שם השפה הנוכחית). לחצו עליו ובחרו מתוך 22 שפות: עברית, אנגלית, יוונית, ערבית, רוסית, ספרדית, פורטוגזית, צרפתית, גרמנית, צ'כית, סלובקית, איטלקית, יפנית, הינדי, אמהרית.",
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
              "תוכנית השותפים היא רק למנויי Clear או Deep. כדי להמליץ על Gadit בצורה אמינה, אנחנו מבקשים שתשתמשו בעצמכם קודם. שדרגו מ-Pricing אם אתם ב-Basic.",
            ],
          },
          {
            id: "commission-model",
            q: "איך מחושבות העמלות?",
            a: [
              "שותפים רגילים מקבלים 30% מכל מנוי ששולם דרך הלינק שלכם, כל חודש, ב-12 החודשים הראשונים. אחרי 12 חודשים העמלה יורדת ל-0%. אם הגעתם לסטטוס Active Partner (10 מנויים פעילים), אתם ממשיכים לקבל 10% עמלה לכל החיים מכל המנויים שלכם, גם אחרי 12 החודשים.",
              "במנויים שנתיים מקבלים עמלה חד פעמית של 15% על התשלום הראשון, במקום 30% חודשי לאורך השנה.",
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
              "כרגע 22 שפות ממשק. אצלנו אומרים לעשות GAD למילה, כלומר להבין אותה עד הסוף, לא רק לתרגם אותה.",
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

// Other 10 languages fall back to English until a translation pass.
// Slovak (Andrea's market) is the next-priority translate target;
// add it to the Object.assign block above when the strings are ready.
const fallback = HELP.en;
for (const code of ["ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja"] as Lang[]) {
  // "el" (Greek) intentionally omitted here: it has a full native block above.
  HELP[code] = fallback;
}
