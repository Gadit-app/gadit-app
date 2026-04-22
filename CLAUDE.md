# GADIT — אפליקציית מילון רב-משמעי רב-לשוני

> **CLAUDE.md ייעודי לפרויקט** — טוען אוטומטית כשפותחים את [c:/Users/gadi/gadit-app/](c:/Users/gadi/gadit-app/).
> לכללים כלליים של גדי (שפה, אוטונומיה) — ראה [C:\Users\gadi\CLAUDE.md](C:/Users/gadi/CLAUDE.md).
> לקונטקסט עסקי של LLC (מותג, קהל יעד, don'ts) — ראה [F:\Lavi-Learning-LLC\CLAUDE.md](F:/Lavi-Learning-LLC/CLAUDE.md).

---

## What this is

אפליקציית ווב לפירוש מילים — המשתמש מקליד מילה בשפה כלשהי, והאפליקציה מחזירה:
- **כל המשמעויות** של המילה (לא רק הראשית)
- **3 דוגמאות** לכל משמעות
- **אטימולוגיה** (מקור היסטורי — לא פירוק שורש)
- **Context mode** — אם המילה רב-משמעית, המשתמש יכול להדביק משפט והאפליקציה תבחר את המשמעות הנכונה
- **4 שפות ממשק**: עברית, ערבית, אנגלית, רוסית (RTL מלא לעברית/ערבית)

---

## Stack

| שכבה | טכנולוגיה |
|------|-----------|
| Framework | **Next.js 16.2.4** (App Router) — ⚠️ יש Breaking Changes מ-15 |
| UI | React 19.2, TypeScript, Tailwind v4 |
| Auth + DB | Firebase (Auth + Firestore) |
| Payments | Stripe |
| Hosting | Vercel — [www.gadit.app](https://www.gadit.app) |
| Repo | [github.com/Gadit-app/gadit-app](https://github.com/Gadit-app/gadit-app) (public) |
| i18n | מותאם אישית ב-[web/src/lib/i18n.ts](web/src/lib/i18n.ts) |
| Fonts | Rubik (עברית), Cairo (ערבית), Inter (EN/RU), Heebo (fallback RTL) |

---

## מבנה הפרויקט

```
gadit-app/                      ← root
├── .git                        ← מקושר ל-github.com/Gadit-app/gadit-app
├── .vercel                     ← מקושר ל-prj_bJu0UiIhUgXREzzvM3aL1dRvslyl
├── package.json                ← workspace: ["web"]
└── web/                        ← הקוד האמיתי (Root Directory ב-Vercel)
    ├── .env.local              ← Firebase + Stripe keys (pulled from Vercel)
    ├── CLAUDE.md               ← מפנה ל-AGENTS.md
    ├── AGENTS.md               ← ⚠️ "This is NOT the Next.js you know"
    ├── public/
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx        ← homepage + landing page מלא
        │   ├── globals.css
        │   ├── pricing/
        │   └── api/
        │       ├── define/           ← פירוש מילה
        │       ├── check-sentence/   ← בחירת משמעות לפי משפט
        │       ├── create-checkout/  ← Stripe checkout
        │       └── webhook/          ← Stripe webhook
        ├── components/
        │   ├── Header.tsx
        │   └── LoginModal.tsx
        └── lib/
            ├── firebase.ts
            ├── auth-context.tsx
            ├── lang-context.tsx
            └── i18n.ts         ← כל התרגומים
```

---

## ⚠️ Next.js 16 — חובה לקרוא לפני כתיבת קוד

AGENTS.md של הפרויקט אומר במפורש: **"This is NOT the Next.js you know"**.
יש שינויים שוברים מ-Next 15 → 16. לפני שינוי API routes / layouts / metadata / middleware:

```bash
ls web/node_modules/next/dist/docs/
```

וקרא את התיעוד הרלוונטי המקומי. **לא לסמוך על דפוסי Next 14/15 מהזיכרון**.

---

## Commands

```bash
# מ-root של הפרויקט
npm run dev             # מריץ web workspace dev server
npm run build           # build

# מתוך web/
cd web
npm run dev             # localhost:3000
npm run lint

# Vercel
vercel env pull web/.env.local              # משיכת env vars
vercel                                       # preview deploy
vercel --prod                                # production deploy

# Git
git add . && git commit -m "..." && git push # push ל-main → Vercel deploy אוטומטי
```

---

## סטטוס נוכחי (2026-04-21)

**Commit אחרון ב-main**: `92fe139` — *"debug: expose firestore errors to find cache issue"*

**באג פתוח**: בעיית cache של Firestore — הוספו לוגים כדי לאבחן. צריך לבדוק מה השגיאות חושפות.

**מה עובד**: landing page מלא, חיפוש מילים, ריבוי משמעויות, context mode, pricing, i18n 4 שפות, RTL, Stripe checkout.

---

## עקרונות עבודה

- **כל שינוי קוד → git commit → git push → Vercel deploy אוטומטי**. אין טעם ב-`vercel --prod` ידני אלא אם צריך preview.
- **לא להזכיר סיינטולוגיה / Applied Scholastics** בשום מקום באתר — gadit.app הוא מוצר עצמאי.
- **השפה המדוברת** באתר: מילון אוניברסלי, לא קשור לתכני המכללה לחינוך חדש.
- **טון**: מינימליסטי, מקצועי. לא ה-voice הפרובוקטיבי של המכללה — זה מוצר B2C גלובלי.
