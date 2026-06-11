# Gadit Help Center — Copy Review

Generated automatically from `web/src/lib/help-i18n.ts`.

**For the reviewer:** this is the full Help Center copy as it currently ships at https://www.gadit.app/contact in English and Hebrew. Please review for:

- Tone and voice (first person, no marketing fluff, founder style)
- Accuracy of the technical instructions (actual product behaviour)
- Clarity (each answer should end with a concrete next step)
- Style consistency (no em-dashes, no double-quotes mid-letter, no AI tells)
- Coverage gaps (questions a real user would ask that we don't answer)
- Localisation quality on the Hebrew side specifically

Reply with a list of specific corrections per item id, e.g. `billing.change-card paragraph 2: …`.

---

# English

**Page heading:** Find an answer, fast.

**Lede:** Common questions and step by step fixes, organised by area. If you don't see your issue, write me directly at the bottom.

**Still stuck heading:** Still stuck?

**Still stuck body:** Write me directly. I read every message myself and reply within a day or two.

**Email CTA:** Email me

**Response time line:** Typical reply: within 24 to 48 hours.

---

## 💳  Billing & subscription (`billing`)

### `change-card`

**Q:** I want to change the credit card on my subscription. How?

**A:**

> You can switch to a new card in under a minute without cancelling. Your current subscription keeps running, just on the new card.

> 1. Sign in at gadit.app and open your Account page (top right). 2. Click "Manage billing". 3. A secure Stripe page opens. Click "Add payment method", enter the new card, and mark it as Default. 4. Optionally remove the old card.

> From the next billing cycle on, everything goes to the new card. The previous charge (already collected) stays on the old card. No refund needed unless you want one specifically.

### `cancel`

**Q:** How do I cancel my subscription?

**A:**

> Self-serve, any time. Sign in, open Account, click Manage billing, then Cancel subscription.

> Your access continues until the end of the period you already paid for. After that the account drops back to Basic (free). Your saved words, history, and notebook stay safe and accessible.

> If you cancel by mistake or change your mind, you can resume the subscription from the same page before the period ends.

### `switch-plan`

**Q:** How do I switch from Clear to Deep (or the other way)?

**A:**

> Account, then Manage billing, then Update subscription. Pick the new plan.

> Stripe calculates the price difference automatically, pro-rated by the days remaining in the current period. If you're upgrading, you'll be charged just the difference for the rest of the period. If you're switching to a lower tier, the credit applies to your next bill.

### `invoice`

**Q:** How do I download an invoice or receipt?

**A:**

> Account, then Manage billing, then Invoice history. Every charge has a downloadable PDF receipt with the billing details you saved.

> If you need a different name, address, or tax ID on the invoice (for example a company name for tax purposes), update your billing details on the same page before downloading. The next receipt will use the new details.

### `portal-error`

**Q:** I clicked Manage billing but got an error. What now?

**A:**

> Two common causes. First, your account doesn't have an active Stripe subscription. Second, Stripe may not have a complete billing profile for your account yet.

> Easy first check: sign out, sign back in with the email you used at checkout, and try again. If it still fails, write me with your account email and I'll fix it from my side in a minute.

### `autorenew`

**Q:** Will my subscription auto-renew?

**A:**

> Yes. Monthly plans renew every month, annual plans renew every year on the same date. You can see the next billing date in your account and on Stripe's portal.

> If you don't want auto-renew, cancel any time before the renewal date. Cancellation isn't immediate. You keep access through the period you already paid for.

### `refund`

**Q:** Can I get a refund?

**A:**

> Yes. If you bought less than 14 days ago and you didn't use the service much, write me with your account email and a short note about why. I refund those without a fight.

> If it's been more than 14 days, I'll handle it case by case. Cancel the subscription so it doesn't keep renewing, and email me.

### `unknown-charge`

**Q:** I see a charge I don't recognise.

**A:**

> Charges appear as GADIT or GADIT.APP with $2.99 (Clear monthly), $4.99 (Deep monthly), $29.99 (Clear yearly), or $49.99 (Deep yearly). If it doesn't match, it might be from a different service.

> If you're certain it's not yours, don't dispute through your bank yet. Write me directly first with the date and amount. I'll find it, explain what it is, and refund if needed. A bank dispute can make future billing harder, so resolving it through me is usually faster and safer.

### `failed-payment`

**Q:** My payment failed. What should I do?

**A:**

> Stripe automatically retries failed payments a few times over the following days. Most failures resolve on their own once the bank releases the hold or the card has enough balance.

> If you want to fix it right away, go to Account → Manage billing → Add payment method, enter a working card, and set it as Default. Stripe will retry the failed charge immediately on the new card. If your subscription has already lapsed to Basic, you can resubscribe from Pricing and your notebook stays intact.

### `plan-comparison`

**Q:** What's the difference between Basic, Clear, and Deep?

**A:**

> Basic (free): up to 20 word lookups a day, every meaning, examples per meaning, idioms, and word origin. No signup required for basic searches.

> Clear ($2.99/month or $29.99/year): unlimited lookups, kid-friendly explanations, an AI image per word (30/month), compose-your-own-sentence with feedback, idioms detail, and 30 days of search history.

> Deep ($4.99/month or $49.99/year): everything in Clear, plus practice quizzes, the personal notebook with smart spaced-repetition practice, distinguishing similar words, and a larger image quota (100/month).

---

## 👤  Account & sign-in (`account`)

### `no-verification-email`

**Q:** I didn't receive my verification email.

**A:**

> Check spam and promotions folders first. Gmail and Outlook sometimes route account emails there until you mark one as "Not spam".

> If it's not there, the email might have been mistyped at signup. Try signing up again and double-check the address. If you used Google sign-up, no verification email is needed.

### `forgot-password`

**Q:** I forgot my password.

**A:**

> Open the sign-in dialog and click "Forgot password?". Enter the email you use for Gadit and you'll get a reset link within a minute or two.

> If the email doesn't arrive, check spam. If it still doesn't arrive, you might have signed up with Google instead of email and password. Try the "Continue with Google" button.

### `wrong-credentials`

**Q:** I'm sure my password is right but it says "Wrong email or password".

**A:**

> Three things to check. First, capslock. Second, trailing space when copy-pasting. Third, you signed up with Google rather than a password (use "Continue with Google" instead).

> Still stuck? Reset the password from the same dialog. It sets you up clean.

### `google-fails`

**Q:** Google sign-in doesn't work.

**A:**

> Most common cause: your browser is blocking third-party cookies or pop-ups for gadit.app. Allow them in the address-bar permissions and try again.

> If you're in incognito mode, Google sign-in is restricted on purpose. Switch to a normal browser window.

### `change-email`

**Q:** How do I change the email on my account?

**A:**

> Account, click your email, Change email. You'll need to confirm the new address before it sticks. Your subscription, history, and notebook all carry over.

> If the email is tied to a Stripe customer, update it on the Stripe billing portal too so future receipts go to the new address.

### `delete-account`

**Q:** How do I delete my account?

**A:**

> Account, bottom of the page, Delete account. This is permanent. Your subscription is cancelled, your notebook and history are erased, and the email is freed up for a fresh signup.

> Stripe records of past charges remain (we're legally required to keep them for accounting). Nothing else stays.

### `share-account`

**Q:** Can my partner or child share my account?

**A:**

> One signed-in user per account at a time. Kids mode lets a single Clear or Deep account serve a parent and child: flip the toggle and definitions render kid-friendly without separate logins.

> For two adults who both want separate notebooks and progress, create two accounts. Clear is $2.99 a month per account.

### `multiple-accounts`

**Q:** I think I have two accounts by mistake. What now?

**A:**

> This usually happens when someone signs up once with Google and once with email and password using the same address, or when you sign up twice with different email addresses. Each signup creates a separate Gadit account with its own notebook, history, and subscription state.

> Write me with both email addresses (or UIDs from the Account page) and which one you'd like to keep. I'll merge the notebooks and history onto the account you choose, then close the other one cleanly. No data lost.

---

## 🔍  Using Gadit (`product`)

### `wrong-definition`

**Q:** I think the definition is wrong. What do I do?

**A:**

> Every result page has a small "Report" button at the bottom. Tap it, pick a category (definition, etymology, example, idiom, kids explanation, and so on) and write a short note. It comes straight to me and I review every report.

> Don't worry about being too picky. The dictionary improves from this feedback faster than from anything else.

### `kids-not-working`

**Q:** Kids mode isn't changing the explanation.

**A:**

> Kids mode only flips text where the word already has a kid-friendly explanation generated. For brand-new words you've just looked up, give it 10 to 15 seconds. The kid-friendly version is generated on the fly the first time.

> Also: kids mode requires Clear or Deep. If you're on Basic, the toggle will prompt you to upgrade. Anonymous users get prompted to sign up.

### `voice-fails`

**Q:** Voice search doesn't work.

**A:**

> Voice search needs microphone permission. Most browsers ask once per site. If you accidentally clicked Block, you'll need to flip it back manually: click the lock or info icon next to gadit.app in the address bar, then Site settings, then Microphone, then Allow.

> On Safari iOS, microphone access also requires a Settings → Safari → Microphone toggle. Voice is currently a Clear and Deep feature: Basic users see an upgrade prompt, signed-out visitors see a sign-in prompt.

### `no-image`

**Q:** I can't generate an image for the word.

**A:**

> Image generation is a Clear or Deep feature with a monthly quota. Clear gets 30 images a month, Deep gets 100. If you've used up the quota, you'll see a wall. It resets on the 1st of every month.

> If you're under the quota and still seeing failures, it's usually transient. Try again in 30 seconds. Persistent failures are a bug. Please report from the word page.

### `save-word`

**Q:** How do I save a word to my notebook?

**A:**

> On any word result page, tap Save to notebook near the title. The notebook is a Clear and Deep feature where you can review saved words later, see them on a galaxy view, and run smart-practice sessions (Deep).

> Words you've saved and opened at least once are available offline from the local cache. The offline pack also caches the most popular words in your language so you're ready without internet.

### `offline`

**Q:** How does offline mode work?

**A:**

> Words you've already viewed are cached locally. Open them again without internet and they load instantly. The full offline pack (top words in your language) downloads on demand from the notebook page.

> Searching for a brand-new word still requires connectivity, because Gadit has to ask the AI to define it. The offline cache is for words you've already explored.

### `slow`

**Q:** The app feels slow.

**A:**

> The first lookup of a word is the slowest because Gadit generates the full result fresh from AI: usually a few seconds, sometimes longer for complex words. Subsequent lookups of the same word are instant, served from cache.

> If everything feels slow, try a hard refresh: Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows. If the slowness persists across pages, please email me with your country and browser so I can check the network route to our servers from your region.

### `word-not-found`

**Q:** I searched a word and didn't get a result. What's going on?

**A:**

> First, check the spelling. Gadit handles minor typos most of the time, but a wrong vowel or missing letter can throw it off. Try the suggested correction if one appears.

> Beyond that: very rare or slang words might not return a confident result. If you're sure the word is real, click the Report button on the result page (or on the error screen) and tell me. I review every report and feed real misses back into the system.

### `change-language`

**Q:** How do I change the UI language?

**A:**

> Top right of any page, you'll see a small flag icon (or your current language name). Tap it and pick from 12 languages: English, Hebrew, Arabic, Russian, Spanish, Portuguese, French, German, Czech, Slovak, Italian, Japanese.

> Your choice is saved on this device. Everything reloads in the new language: the interface, the menus, future word definitions, examples, kid explanations, even the etymology. Already-cached results in the old language stay until you search those words again.

---

## 🤝  Partner program (`partner`)

### `join-partner`

**Q:** How do I become a Gadit partner?

**A:**

> Open /affiliates from any page and click "Get your link". You'll be signed in automatically (or prompted to sign up). The dashboard mints your unique link instantly. No waiting for approval.

> The partner program is for Clear or Deep subscribers only. To recommend Gadit credibly, we ask that you use it yourself first. Upgrade from Pricing if you're on Basic.

### `commission-model`

**Q:** How are commissions calculated?

**A:**

> Standard partners earn 30% of every subscription paid via their link, every month, for the first 12 months of each subscriber. After 12 months that drops to 0%. If you've hit Active Partner status (10 paying subscribers active at once), you keep 10% lifetime commission on all of your subscribers, even after the first 12 months are up.

> Annual subscriptions get a one-time 15% commission on the first payment, instead of the 30% monthly rate spread across the year.

### `payout`

**Q:** When do I get paid?

**A:**

> Monthly, once your balance crosses $50. We use the payout method you set in the partner dashboard (bank transfer, PayPal, and so on). $50 is the minimum threshold, not a cap. You can earn far more, you just receive the payout when you cross the threshold.

> Commissions release 30 days after the subscription payment, to allow for the refund window. So a January subscription releases in early February and lands in your next payout once your balance crosses $50.

### `empty-dashboard`

**Q:** I joined but my dashboard is empty.

**A:**

> Stats show after the first click on your link. Empty just means nobody's clicked yet. Go share the link. The dashboard updates in near real time once activity starts.

> If you've shared and someone's signed up but the dashboard isn't reflecting it, write me with the rough time of signup and I'll check the attribution.

### `attribution-window`

**Q:** How long does my referral link keep tracking a visitor?

**A:**

> Sixty days. When a visitor clicks your link, we set a cookie identifying you as the referrer. If they sign up and subscribe any time in the next 60 days (even if they leave the site and come back later through a Google search), the attribution still credits you.

> Cookie clearance: if the visitor clears their cookies or switches browser/device before they sign up, attribution can be lost. There's no workaround for that, but 60 days is a generous window compared to most partner programs.

### `missing-commission`

**Q:** Someone signed up through my link but I don't see the commission.

**A:**

> Most often this is timing: the signup shows up in the dashboard within minutes, but the commission only books once the subscription is actually paid (which can be days later if they're on a free trial). Check back after the trial ends.

> If the subscription paid but you still don't see the commission after 48 hours, write me with the rough signup time and the email or rough name of the subscriber if you know it. I'll dig into the attribution chain and fix any miss manually.

---

## ❓  General (`general`)

### `what-is-gadit`

**Q:** What is Gadit?

**A:**

> A multilingual dictionary built to make a word click, not just give a one-line definition. Every word opens with all its meanings, real examples per meaning, idioms, etymology, an optional AI image, and (with Clear and Deep) a kid-friendly explanation, compose-your-own-sentence with feedback, and quizzes.

> Currently 12 UI languages. Internally I call it GAD a word: to understand a word all the way through, not just translate it.

### `languages`

**Q:** Which languages do you support?

**A:**

> Interface: English, Hebrew, Arabic, Russian, Spanish, Portuguese, French, German, Czech, Slovak, Italian, Japanese.

> You can look up a word in any of those languages and get the definition, examples, and everything else in your chosen UI language. Hebrew and Arabic are fully RTL and use their native fonts.

### `kid-safety`

**Q:** Is Gadit safe for kids?

**A:**

> Gadit is designed for a parent to use safely alongside a child. Kids mode produces explanations that are simple, concrete, and age-appropriate (around the 5 to 10 year old level), running the same AI we use for adult content with explicit instructions to simplify. No user-generated content is ever shown to kids.

> In line with our policies and child-privacy rules around the world, independent account ownership is 13 and up. The standard pattern is a parent's account that the parent uses together with their kid, which is exactly what Kids mode is built for.

### `data`

**Q:** Where is my data stored? Do you sell it?

**A:**

> Account, history, notebook, and generated images are stored securely in Firebase, encrypted in storage. We don't sell your data to anyone. We only share what's needed to run Gadit (storage, payments, AI providers), as spelled out in the Privacy Policy.

> You can export your notebook or delete your account at any time from the Account page.

### `contact-direct`

**Q:** How do I reach you directly?

**A:**

> Use the email button at the bottom of this page. It goes straight to my inbox. I read every message myself and reply within 24 to 48 hours (often faster).

> I prefer email over chat because it gives me a chance to read carefully and reply thoughtfully. I don't offer phone support yet.

---

# עברית (Hebrew)

**Page heading:** מצאו תשובה. מהר.

**Lede:** שאלות נפוצות ופתרונות שלב שלב, מסודרים לפי תחום. לא רואים את הבעיה שלכם? תכתבו לי ישירות למטה.

**Still stuck heading:** עדיין תקועים?

**Still stuck body:** תכתבו לי ישירות. אני קורא כל הודעה בעצמי ועונה תוך יום או יומיים.

**Email CTA:** שלחו לי מייל

**Response time line:** זמן תגובה אופייני: עד 48 שעות.

---

## 💳  חיוב ומנוי (`billing`)

### `change-card`

**Q:** אני רוצה להחליף כרטיס אשראי לחיוב המנוי שלי. איך?

**A:**

> אפשר להחליף לכרטיס חדש בפחות מדקה, בלי לבטל. המנוי הנוכחי שלכם ממשיך, פשוט עם הכרטיס החדש.

> 1. היכנסו ל-gadit.app ופתחו את עמוד החשבון (פינה ימנית עליונה). 2. לחצו על "ניהול חיוב". 3. ייפתח מסך מאובטח של Stripe. לחצו "Add payment method", הכניסו את הכרטיס החדש, וסמנו אותו כברירת מחדל. 4. אופציונלי, מחקו את הכרטיס הישן.

> מהחיוב הבא והלאה הכל ילך לכרטיס החדש. החיוב הקודם (שכבר נגבה) נשאר על הכרטיס הישן. אין צורך בהחזר אלא אם תרצו אחד באופן ספציפי.

### `cancel`

**Q:** איך מבטלים מנוי?

**A:**

> אתם יכולים לבטל לבד, בכל רגע. היכנסו, פתחו את עמוד החשבון, לחצו ניהול חיוב, ואחר כך Cancel subscription.

> הגישה ממשיכה עד סוף התקופה ששילמתם עליה. אחר כך החשבון יורד ל-Basic (חינמי). המילים השמורות, היסטוריה והמחברת נשמרים ונשארים נגישים.

> אם ביטלתם בטעות או שינתם דעתכם, אפשר לחדש את המנוי מאותו עמוד לפני שהתקופה מסתיימת.

### `switch-plan`

**Q:** איך עוברים מ-Clear ל-Deep (או הפוך)?

**A:**

> חשבון, ואז ניהול חיוב, ואז Update subscription. בחרו את המסלול החדש.

> Stripe מחשב את ההפרש אוטומטית, לפי הימים שנותרו בתקופת החיוב. אם משדרגים, תחויבו רק על ההפרש לתקופה הנוכחית. אם עוברים למסלול נמוך יותר, הקרדיט יחול על החיוב הבא.

### `invoice`

**Q:** איך מורידים חשבונית או קבלה?

**A:**

> חשבון, ואז ניהול חיוב, ואז Invoice history. לכל חיוב יש קבלת PDF להורדה עם פרטי החיוב ששמרתם.

> אם צריך שם, כתובת או מספר עוסק שונים על החשבונית (למשל שם חברה לצרכי מס), עדכנו את פרטי החיוב באותו עמוד לפני ההורדה. הקבלה הבאה תשתמש בפרטים החדשים.

### `portal-error`

**Q:** לחצתי על ניהול חיוב וקיבלתי שגיאה. מה לעשות?

**A:**

> שתי סיבות נפוצות. ראשית, לחשבון שלכם אין מנוי Stripe פעיל. שנית, ייתכן שפרופיל הלקוח שלכם ב-Stripe לא נוצר או לא הושלם כמו שצריך.

> בדיקה ראשונה פשוטה: צאו, היכנסו שוב עם האימייל שבו רכשתם, ונסו שוב. אם זה עדיין לא עובד, תכתבו לי עם האימייל של החשבון ואני אסדר את זה מהצד שלי בדקה.

### `autorenew`

**Q:** המנוי יתחדש אוטומטית?

**A:**

> כן. מנויים חודשיים מתחדשים כל חודש, מנויים שנתיים מתחדשים כל שנה באותו תאריך. אפשר לראות את תאריך החיוב הבא בעמוד החשבון וב-Stripe portal.

> אם אתם לא רוצים חידוש אוטומטי, בטלו בכל רגע לפני תאריך החידוש. הביטול אינו מיידי. אתם שומרים על הגישה עד סוף התקופה ששילמתם.

### `refund`

**Q:** אפשר לקבל החזר כספי?

**A:**

> כן. אם רכשתם לפני פחות מ-14 ימים ולא השתמשתם בשירות הרבה, תכתבו לי עם האימייל של החשבון והסבר קצר. אני מאשר אותם בלי להתעקש.

> אם עבר יותר מ-14 ימים, אטפל מקרה מקרה. בטלו את המנוי כדי שלא יתחדש, ושלחו לי מייל.

### `unknown-charge`

**Q:** אני רואה חיוב שאני לא מזהה.

**A:**

> חיובים מופיעים כ-GADIT או GADIT.APP עם $2.99 (Clear חודשי), $4.99 (Deep חודשי), $29.99 (Clear שנתי), או $49.99 (Deep שנתי). אם זה לא תואם, זה כנראה משירות אחר.

> אם אתם בטוחים שזה לא שלכם, אל תפנו לבנק עם מחלוקת עדיין. תכתבו לי קודם עם התאריך והסכום. אני אמצא, אסביר מה זה, ואחזיר אם צריך. פתיחת מחלוקת דרך הבנק עלולה לסבך את החיוב ואת החשבון שלכם בהמשך, לכן פנייה אליי היא מהירה ובטוחה יותר.

### `failed-payment`

**Q:** התשלום שלי נכשל. מה לעשות?

**A:**

> Stripe מנסה אוטומטית לחייב מחדש כמה פעמים בימים שלאחר הכישלון. רוב הכשלים מסתדרים מעצמם ברגע שהבנק משחרר את ההקפאה או שהכרטיס חוזר ליתרה חיובית.

> אם תרצו לתקן מיד, היכנסו לחשבון → ניהול חיוב → Add payment method, הוסיפו כרטיס תקין וסמנו אותו כברירת מחדל. Stripe ינסה לחייב את החיוב הכושל מיד בכרטיס החדש. אם המנוי כבר ירד ל-Basic, אפשר לחדש מחדש מעמוד המחירים, והמחברת שלכם נשארת שלמה.

### `plan-comparison`

**Q:** מה ההבדל בין Basic, Clear ו-Deep?

**A:**

> Basic (חינם): עד 20 חיפושי מילים ביום, כל המשמעויות, דוגמאות לכל משמעות, ניבים, ומקור המילה. לא נדרשת הרשמה לחיפושים בסיסיים.

> Clear ($2.99 לחודש או $29.99 לשנה): חיפושים ללא הגבלה, הסברים ידידותיים לילדים, תמונת AI לכל מילה (30 בחודש), חיבור משפט משלכם עם פידבק, פירוט ניבים, ו-30 ימי היסטוריית חיפושים.

> Deep ($4.99 לחודש או $49.99 לשנה): כל מה ש-Clear כולל, ובנוסף חידוני תרגול, המחברת האישית עם תרגול חכם בשיטת חזרה מרווחת, השוואה בין מילים דומות, ומכסה גדולה יותר של תמונות (100 בחודש).

---

## 👤  חשבון וכניסה (`account`)

### `no-verification-email`

**Q:** לא קיבלתי מייל אימות.

**A:**

> בדקו קודם את תיקיית הספאם והקידומים. Gmail ו-Outlook לפעמים מפנים מיילי חשבון לשם עד שמסמנים אחד כ"לא ספאם".

> אם זה לא שם, אולי הייתה טעות באימייל בהרשמה. נסו להירשם שוב ובדקו את הכתובת. אם נרשמתם דרך Google, לא נדרש מייל אימות.

### `forgot-password`

**Q:** שכחתי סיסמה.

**A:**

> פתחו את דיאלוג ההתחברות ולחצו "שכחת סיסמה?". הכניסו את האימייל שאתם משתמשים בו ב-Gadit ותקבלו לינק לאיפוס תוך דקה או שתיים.

> אם המייל לא מגיע, בדקו ספאם. אם הוא עדיין לא מגיע, אולי נרשמתם עם Google ולא עם אימייל וסיסמה. נסו את הכפתור "Continue with Google".

### `wrong-credentials`

**Q:** אני בטוח שהסיסמה נכונה אבל מקבל "אימייל או סיסמה שגויים".

**A:**

> שלושה דברים לבדוק. ראשית, Caps Lock. שנית, רווח מיותר אחרי העתקה. שלישית, נרשמתם עם Google ולא עם סיסמה (השתמשו ב-"Continue with Google").

> עדיין תקועים? אפסו את הסיסמה מאותו דיאלוג. זה מסדר אתכם נקי.

### `google-fails`

**Q:** התחברות עם Google לא עובדת.

**A:**

> הסיבה הנפוצה ביותר: הדפדפן חוסם cookies של צד שלישי או pop-ups עבור gadit.app. אפשרו אותם בהרשאות שורת הכתובת ונסו שוב.

> אם אתם במצב גלישה בסתר, התחברות Google מוגבלת בכוונה. עברו לחלון רגיל.

### `change-email`

**Q:** איך משנים את האימייל של החשבון?

**A:**

> חשבון, לחיצה על האימייל שלכם, Change email. תצטרכו לאשר את הכתובת החדשה לפני שזה תופס. המנוי, היסטוריה והמחברת, הכל עובר אוטומטית.

> אם האימייל קשור ל-customer ב-Stripe, עדכנו אותו גם בפורטל החיוב של Stripe כדי שקבלות עתידיות ילכו לכתובת החדשה.

### `delete-account`

**Q:** איך מוחקים חשבון?

**A:**

> חשבון, תחתית העמוד, Delete account. זה לצמיתות. המנוי מבוטל, המחברת וההיסטוריה נמחקות, והאימייל מתפנה להרשמה חדשה.

> רשומות Stripe של חיובים עבר נשארות (חייבים לפי חוק לשמור לצרכי הנהלת חשבונות). שום דבר אחר לא נשאר.

### `share-account`

**Q:** בן הזוג או הילד שלי יכולים לחלוק את החשבון שלי?

**A:**

> משתמש מחובר אחד לחשבון בכל רגע. מצב ילדים מאפשר לחשבון Clear או Deep אחד לשרת הורה וילד יחד: לוחצים על הטוגל וההגדרות מוצגות באופן ידידותי לילד בלי לוגין נפרד.

> לשני מבוגרים שרוצים מחברות והתקדמות נפרדות, פתחו שני חשבונות. Clear עולה $2.99 לחודש לכל חשבון.

### `multiple-accounts`

**Q:** נראה שיש לי שני חשבונות בטעות. מה עושים?

**A:**

> זה קורה בדרך כלל כשמישהו נרשם פעם אחת עם Google ופעם נוספת עם אימייל וסיסמה לאותה הכתובת, או כשנרשמים פעמיים בכתובות שונות. כל הרשמה יוצרת חשבון נפרד ב-Gadit עם מחברת, היסטוריה ומנוי משלו.

> כתבו לי עם שני האימיילים (או ה-UID של כל חשבון מעמוד החשבון) ועם איזה חשבון תרצו להשאיר. אני אאחד את המחברת וההיסטוריה אל החשבון שבחרתם, ואסגור את השני בצורה נקייה. שום מידע לא יאבד.

---

## 🔍  שימוש ב-Gadit (`product`)

### `wrong-definition`

**Q:** ההגדרה לא נכונה. מה לעשות?

**A:**

> בכל עמוד תוצאה יש כפתור "דיווח" קטן בתחתית. לחצו עליו, בחרו קטגוריה (הגדרה, אטימולוגיה, דוגמה, ניב, הסבר לילדים וכו') וכתבו הערה קצרה. זה מגיע ישירות אליי ואני בודק כל דיווח.

> אל תדאגו להיות יותר מדי קפדנים. המילון משתפר מהפידבק הזה מהר יותר מכל דבר אחר.

### `kids-not-working`

**Q:** מצב ילדים לא מחליף את ההסבר.

**A:**

> מצב ילדים מחליף טקסט רק היכן שלמילה כבר יש הסבר ידידותי לילד שנוצר. למילים חדשות שזה עתה חיפשתם, תנו לזה 10 עד 15 שניות. הגרסה לילדים נוצרת on-the-fly בפעם הראשונה.

> כמו כן: מצב ילדים דורש Clear או Deep. אם אתם ב-Basic, הטוגל יזמין אתכם לשדרג. למשתמשים אנונימיים יוצע להירשם.

### `voice-fails`

**Q:** חיפוש קולי לא עובד.

**A:**

> חיפוש קולי דורש הרשאת מיקרופון. רוב הדפדפנים שואלים פעם אחת לאתר. אם בטעות אמרתם חסום, צריך להחזיר ידנית: לחצו על אייקון המנעול או המידע ליד gadit.app בשורת הכתובת, אחר כך Site settings, אחר כך Microphone, אחר כך Allow.

> ב-Safari iOS, גישה למיקרופון דורשת גם הגדרה ב-Settings → Safari → Microphone. חיפוש קולי הוא כרגע פיצ'ר של Clear ו-Deep: משתמשי Basic יראו בקשה לשדרג מסלול, אורחים לא מחוברים יראו בקשה להירשם.

### `no-image`

**Q:** אני לא מצליח לייצר תמונה למילה.

**A:**

> יצירת תמונות היא פיצ'ר של Clear או Deep עם מכסה חודשית. Clear מקבל 30 תמונות לחודש, Deep מקבל 100. אם נגמרה המכסה, תראו חסימה. היא מתאפסת ב-1 לכל חודש.

> אם אתם מתחת למכסה ועדיין רואים כשלים, זה בדרך כלל זמני. נסו שוב בעוד 30 שניות. כשלים מתמשכים זה באג. אנא דווחו מעמוד המילה.

### `save-word`

**Q:** איך שומרים מילה במחברת?

**A:**

> בכל עמוד תוצאת מילה, לחצו על שמור במחברת ליד הכותרת. המחברת היא פיצ'ר של Clear ו-Deep, שבו תוכלו לסקור מילים שמורות מאוחר יותר, לראות אותן בתצוגת גלקסיה, ולהריץ אימוני חזרה חכמה (Deep).

> מילים ששמרתם ופתחתם לפחות פעם אחת זמינות במצב לא־מקוון. בנוסף, חבילת האופליין שומרת במטמון את המילים הפופולריות בשפה שלכם, כדי שתהיו מוכנים גם בלי אינטרנט.

### `offline`

**Q:** איך עובד המצב הלא־מקוון?

**A:**

> מילים שראיתם כבר נשמרות במטמון מקומי. פתחו אותן שוב בלי אינטרנט והן יטענו מיידית. חבילת האופליין המלאה (מילים מובילות בשפה שלכם) יורדת לבקשתכם מעמוד המחברת.

> חיפוש מילה חדשה לחלוטין עדיין דורש חיבור לאינטרנט, כי המערכת צריכה לבקש מה-AI להגדיר אותה. המטמון הלא־מקוון הוא למילים שכבר חקרתם.

### `slow`

**Q:** האפליקציה מרגישה אטית.

**A:**

> החיפוש הראשון של מילה הוא האטי ביותר, כי המערכת מייצרת את התוצאה המלאה מ-AI. לרוב מדובר בכמה שניות, לפעמים יותר על מילים מורכבות. חיפושים חוזרים של אותה המילה מיידיים, כי הם מגיעים מהמטמון.

> אם הכל מרגיש אטי, נסו לרענן את הדף ברענון קשה: Cmd+Shift+R במק, או Ctrl+Shift+R בווינדוס. אם האיטיות נמשכת בכל העמודים, שלחו לי מייל עם המדינה והדפדפן שלכם, כדי שאוכל לבדוק אם יש בעיית ניתוב מהאזור שלכם לשרתים.

### `word-not-found`

**Q:** חיפשתי מילה ולא קיבלתי תוצאה. מה קורה?

**A:**

> קודם כל בדקו את הכתיב. Gadit מסתדר עם רוב טעויות הקלדה קטנות, אבל אות חסרה או תנועה לא נכונה יכולות לבלבל את המערכת. אם מופיעה הצעת תיקון, נסו אותה.

> מעבר לזה, מילים נדירות מאוד או סלנג לא תמיד מצליחות לחזור עם תשובה בטוחה. אם אתם בטוחים שהמילה תקינה, לחצו על כפתור הדיווח בעמוד התוצאה (או במסך השגיאה) וכתבו לי. אני בודק כל דיווח ומחזיר את החזרות האמיתיות חזרה למערכת.

### `change-language`

**Q:** איך משנים את שפת הממשק?

**A:**

> בפינה הימנית-עליונה של כל עמוד תראו אייקון קטן של דגל (או את שם השפה הנוכחית). לחצו עליו ובחרו מתוך 12 שפות: עברית, אנגלית, ערבית, רוסית, ספרדית, פורטוגזית, צרפתית, גרמנית, צ'כית, סלובקית, איטלקית, יפנית.

> הבחירה נשמרת על המכשיר. הכל ייטען מחדש בשפה החדשה: הממשק, התפריטים, הגדרות מילים עתידיות, הדוגמאות, ההסבר לילדים ואפילו האטימולוגיה. תוצאות שכבר נשמרו במטמון בשפה הישנה יישארו כך עד שתחפשו אותן שוב.

---

## 🤝  תוכנית שותפים (`partner`)

### `join-partner`

**Q:** איך אני נהיה שותף של Gadit?

**A:**

> פתחו את /affiliates מכל עמוד ולחצו "קבלו את הלינק שלכם". תיכנסו אוטומטית (או יתבקש מכם להירשם). הדאשבורד מייצר את הלינק הייחודי שלכם מיידית. אין המתנה לאישור.

> תוכנית השותפים היא רק למנויי Clear או Deep. כדי להמליץ על Gadit בצורה אמינה, אנחנו מבקשים שתשתמשו בעצמכם קודם. שדרגו מ-Pricing אם אתם ב-Basic.

### `commission-model`

**Q:** איך מחושבות העמלות?

**A:**

> שותפים רגילים מקבלים 30% מכל מנוי ששולם דרך הלינק שלכם, כל חודש, ב-12 החודשים הראשונים. אחרי 12 חודשים העמלה יורדת ל-0%. אם הגעתם לסטטוס Active Partner (10 מנויים פעילים), אתם ממשיכים לקבל 10% עמלה לכל החיים מכל המנויים שלכם, גם אחרי 12 החודשים.

> במנויים שנתיים מקבלים עמלה חד פעמית של 15% על התשלום הראשון, במקום 30% חודשי לאורך השנה.

### `payout`

**Q:** מתי אני מקבל את הכסף?

**A:**

> חודשית, ברגע שהיתרה עוברת $50. אנחנו משתמשים בשיטת התשלום שהגדרתם בלוח השותפים (העברה בנקאית, PayPal וכו'). $50 הוא הסף המינימלי, לא תקרה. אתם יכולים להרוויח הרבה יותר, פשוט מקבלים את התשלום כשעוברים את הסף.

> העמלות משתחררות 30 יום אחרי תשלום המנוי, כדי לאפשר חלון להחזרים. אז מנוי מינואר משוחרר בתחילת פברואר, וייכנס לתשלום הבא כשהיתרה שלכם עוברת $50.

### `empty-dashboard`

**Q:** נרשמתי אבל לוח השותפים שלי ריק.

**A:**

> הסטטיסטיקות מופיעות אחרי הקליק הראשון על הלינק שלכם. ריק פירושו פשוט שאף אחד לא לחץ עדיין. צאו ושתפו את הלינק. לוח השותפים מתעדכן כמעט בזמן אמת ברגע שמתחילה פעילות.

> אם שיתפתם ומישהו נרשם אבל לוח השותפים לא משקף את זה, תכתבו לי עם הזמן המשוער שבו הוא נרשם, ואני אבדוק את השיוך.

### `attribution-window`

**Q:** כמה זמן לינק ההפניה שלי ממשיך לעקוב אחרי מבקרים?

**A:**

> 60 ימים. כשמבקר לוחץ על הלינק שלכם, אנחנו שותלים cookie שמזהה אתכם כמפנים. אם הוא ירשם או יקנה מנוי בכל זמן ב-60 הימים הבאים, גם אם הוא יצא מהאתר וחזר מאוחר יותר דרך חיפוש בגוגל, השיוך עדיין יתייחס אליכם.

> אם המבקר מנקה cookies או עובר דפדפן או מכשיר לפני שהוא נרשם, השיוך יכול לאבד. אין דרך לעקוף את זה, אבל 60 ימים זה חלון נדיב יחסית לרוב תוכניות השותפים בשוק.

### `missing-commission`

**Q:** מישהו נרשם דרך הלינק שלי אבל אני לא רואה עמלה.

**A:**

> ברוב המקרים זה עניין של תזמון: הרישום מופיע בלוח השותפים תוך דקות, אבל העמלה נרשמת רק כשהמנוי משלם בפועל, וזה יכול להיות כמה ימים אחר כך אם הוא בתקופת ניסיון. תבדקו שוב אחרי שתקופת הניסיון נגמרת.

> אם המנוי שילם ועדיין אין עמלה אחרי 48 שעות, כתבו לי עם הזמן המשוער של ההרשמה ועם האימייל או השם המשוער של הנרשם, אם אתם יודעים. אני אבדוק את שרשרת השיוך ואתקן ידנית כל פספוס.

---

## ❓  כללי (`general`)

### `what-is-gadit`

**Q:** מה זה Gadit?

**A:**

> מילון רב־לשוני שבנוי כדי לגרום למילה להיתפס, לא רק לתת הגדרה של שורה אחת. כל מילה נפתחת עם כל המשמעויות שלה, דוגמאות אמיתיות לכל משמעות, ניבים, אטימולוגיה, תמונת AI אופציונלית, ו(עם Clear ו-Deep) הסבר ידידותי לילדים, חיבור משפט משלכם עם פידבק, וחידונים.

> כרגע 12 שפות ממשק. אצלנו אומרים לעשות GAD למילה, כלומר להבין אותה עד הסוף, לא רק לתרגם אותה.

### `languages`

**Q:** אילו שפות אתם תומכים?

**A:**

> ממשק: אנגלית, עברית, ערבית, רוסית, ספרדית, פורטוגזית, צרפתית, גרמנית, צ'כית, סלובקית, איטלקית, יפנית.

> אפשר לחפש מילה בכל אחת מהשפות הללו ולקבל הגדרה, דוגמאות, והכל ברירת מחדל בשפת הממשק שבחרתם. עברית וערבית הן RTL מלא ומשתמשות בפונטים הילידיים שלהן.

### `kid-safety`

**Q:** Gadit בטוח לילדים?

**A:**

> Gadit נבנה כך שהורה יוכל להשתמש בו עם הילד בצורה בטוחה ומבוקרת. מצב ילדים מייצר הסברים פשוטים, קונקרטיים ומתאימים לגיל (רמת 5 עד 10 שנים), עם אותו AI שמייצר את התוכן למבוגרים, רק עם הוראות מפורשות לפישוט. אף תוכן שמשתמשים יוצרים לא מוצג לילדים.

> בהתאם למדיניות שלנו ולכללי פרטיות ילדים בעולם, חשבון עצמאי מיועד לגיל 13 ומעלה. המודל הסטנדרטי הוא חשבון של ההורה שמשמש את ההורה יחד עם הילד, וזה בדיוק מה שמצב ילדים נועד לאפשר.

### `data`

**Q:** איפה הנתונים שלי שמורים? אתם מוכרים אותם?

**A:**

> חשבון, היסטוריה, מחברת ותמונות שנוצרו נשמרים באופן מאובטח אצל Firebase, מוצפנים באחסון. אנחנו לא מוכרים את הנתונים שלכם לאיש. אנחנו משתפים מידע רק עם השירותים שמפעילים את Gadit (אחסון, תשלומים, ספקי AI), בדיוק כפי שמפורט במדיניות הפרטיות.

> אפשר לייצא את המחברת או למחוק חשבון בכל רגע מעמוד החשבון.

### `contact-direct`

**Q:** איך אני יכול להגיע אליכם ישירות?

**A:**

> השתמשו בכפתור המייל בתחתית העמוד. הוא מגיע ישירות אליי. אני קורא כל הודעה בעצמי ועונה תוך 24 עד 48 שעות (לרוב מהר יותר).

> אני מעדיף מייל על פני צ'אט, כי כך אני יכול לקרוא את הפנייה בעיון ולענות במחשבה. אני עדיין לא מציע תמיכה טלפונית.

---

