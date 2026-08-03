"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useHref } from "@/lib/href";
import { isParentRole, type FamilyMember } from "@/lib/family";

/**
 * First-steps checklist for a brand-new Family owner. Gadi 2026-08-03: on
 * signup a parent should see a short, unmistakable list of the first things
 * to do — (1) connect the second parent, (2) connect the kids, (3) save
 * Gadit to the home screen. The Family welcome email links straight here.
 *
 * Completion is auto-detected from the roster (a second parent exists, a
 * child exists) and, for the home-screen step, from display-mode +
 * localStorage. The card hides itself once all three are done or the owner
 * dismisses it, so it never nags a set-up family.
 */

const DISMISS_KEY = "gadit_family_checklist_dismissed_v1";
const HOMESCREEN_KEY = "gadit_family_homescreen_done_v1";

type Copy = {
  title: string;
  subtitle: string;
  step1: string;
  step1sub: string;
  step2: string;
  step2sub: string;
  step3: string;
  step3sub: string;
  cta: string;
  add: string;
  homeHelp: string;
  markDone: string;
  dismiss: string;
  done: string;
};

const COPY: Record<string, Copy> = {
  he: {
    title: "צעדים ראשונים",
    subtitle: "שלושה דברים קטנים כדי שכל המשפחה תהיה מוכנה.",
    step1: "לחבר את ההורה השני",
    step1sub: "כדי שגם ההורה השני יראה את ההתקדמות של הילדים.",
    step2: "לחבר את הילדים",
    step2sub: "לכל ילד מכשיר משלו, בלי סיסמה, עם קוד חיבור פשוט.",
    step3: "לשמור את Gadit על מסך הבית",
    step3sub: "בטלפון, בטאבלט או במחשב, כדי שזה תמיד יהיה בהישג יד.",
    cta: "חיבור",
    add: "הוספה",
    homeHelp: "בתפריט הדפדפן בוחרים \"הוספה למסך הבית\" או \"התקנה\". במחשב, סמל ההתקנה מופיע בשורת הכתובת.",
    markDone: "סימון כבוצע",
    dismiss: "אפשר להסתיר",
    done: "בוצע",
  },
  en: {
    title: "First steps",
    subtitle: "Three small things to get the whole family set up.",
    step1: "Connect the second parent",
    step1sub: "So both parents can follow the kids' progress.",
    step2: "Connect the kids",
    step2sub: "Each child gets their own device, no password, just a short pairing code.",
    step3: "Save Gadit to the home screen",
    step3sub: "On a phone, tablet or computer, so it's always one tap away.",
    cta: "Connect",
    add: "Add",
    homeHelp: "In your browser menu choose \"Add to Home Screen\" or \"Install\". On a computer, the install icon appears in the address bar.",
    markDone: "Mark as done",
    dismiss: "Hide this",
    done: "Done",
  },
  ar: {
    title: "الخطوات الأولى",
    subtitle: "ثلاثة أمور صغيرة لتجهيز العائلة بالكامل.",
    step1: "ربط الوالد الثاني",
    step1sub: "ليتابع كلا الوالدين تقدم الأطفال.",
    step2: "ربط الأطفال",
    step2sub: "لكل طفل جهازه الخاص، بدون كلمة مرور، فقط رمز ربط قصير.",
    step3: "حفظ Gadit على الشاشة الرئيسية",
    step3sub: "على الهاتف أو الجهاز اللوحي أو الحاسوب، ليكون دائمًا في متناول اليد.",
    cta: "ربط",
    add: "إضافة",
    homeHelp: "من قائمة المتصفح اختر \"إضافة إلى الشاشة الرئيسية\" أو \"تثبيت\". على الحاسوب، تظهر أيقونة التثبيت في شريط العنوان.",
    markDone: "تحديد كمكتمل",
    dismiss: "إخفاء",
    done: "تم",
  },
  ru: {
    title: "Первые шаги",
    subtitle: "Три небольших действия, чтобы настроить всю семью.",
    step1: "Подключить второго родителя",
    step1sub: "Чтобы оба родителя видели прогресс детей.",
    step2: "Подключить детей",
    step2sub: "У каждого ребёнка своё устройство, без пароля, только короткий код.",
    step3: "Сохранить Gadit на главный экран",
    step3sub: "На телефоне, планшете или компьютере, чтобы всегда был под рукой.",
    cta: "Подключить",
    add: "Добавить",
    homeHelp: "В меню браузера выберите «На главный экран» или «Установить». На компьютере значок установки появляется в адресной строке.",
    markDone: "Отметить как выполненное",
    dismiss: "Скрыть",
    done: "Готово",
  },
};

function CheckCircle({ done, n }: { done: boolean; n: number }) {
  if (done) {
    return (
      <span className="fam-chk-circle is-done" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  return <span className="fam-chk-circle" aria-hidden>{n}</span>;
}

export function FamilySetupChecklist({
  members,
  lang,
}: {
  members: FamilyMember[];
  lang: string;
}) {
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;

  const [dismissed, setDismissed] = useState(false);
  const [homeDone, setHomeDone] = useState(false);
  const [showHomeHelp, setShowHomeHelp] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    // Installed-as-app counts as "saved to home screen" automatically.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone || localStorage.getItem(HOMESCREEN_KEY) === "1") setHomeDone(true);
  }, []);

  const parents = members.filter((m) => isParentRole(m.role));
  const children = members.filter((m) => !isParentRole(m.role));

  const step1done = parents.length > 1; // owner + a second parent
  const step2done = children.length > 0;
  const step3done = homeDone;
  const allDone = step1done && step2done && step3done;

  // Avoid a hydration flash: render nothing until we've read localStorage.
  if (!hydrated || dismissed || allDone) return null;

  const markHomeDone = () => {
    setHomeDone(true);
    setShowHomeHelp(false);
    if (typeof window !== "undefined") localStorage.setItem(HOMESCREEN_KEY, "1");
  };
  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <div className="fam-chk">
      <style>{CHK_CSS}</style>
      <div className="fam-chk-head">
        <div>
          <h2 className="fam-chk-title">{t.title}</h2>
          <p className="fam-chk-sub">{t.subtitle}</p>
        </div>
        <button type="button" className="fam-chk-dismiss" onClick={dismiss}>{t.dismiss}</button>
      </div>

      <ul className="fam-chk-list">
        {/* Step 1 — second parent */}
        <li className={`fam-chk-item ${step1done ? "is-done" : ""}`}>
          <CheckCircle done={step1done} n={1} />
          <div className="fam-chk-body">
            <span className="fam-chk-label">{t.step1}</span>
            <span className="fam-chk-itemsub">{step1done ? t.done : t.step1sub}</span>
          </div>
          {!step1done && (
            <Link href={href("/family/add")} className="fam-chk-cta">{t.add}</Link>
          )}
        </li>

        {/* Step 2 — kids */}
        <li className={`fam-chk-item ${step2done ? "is-done" : ""}`}>
          <CheckCircle done={step2done} n={2} />
          <div className="fam-chk-body">
            <span className="fam-chk-label">{t.step2}</span>
            <span className="fam-chk-itemsub">{step2done ? t.done : t.step2sub}</span>
          </div>
          {!step2done && (
            <Link href={href("/family/add")} className="fam-chk-cta">{t.add}</Link>
          )}
        </li>

        {/* Step 3 — home screen */}
        <li className={`fam-chk-item ${step3done ? "is-done" : ""}`}>
          <CheckCircle done={step3done} n={3} />
          <div className="fam-chk-body">
            <span className="fam-chk-label">{t.step3}</span>
            <span className="fam-chk-itemsub">{step3done ? t.done : t.step3sub}</span>
            {showHomeHelp && !step3done && (
              <span className="fam-chk-help">{t.homeHelp}</span>
            )}
          </div>
          {!step3done && (
            showHomeHelp ? (
              <button type="button" className="fam-chk-cta" onClick={markHomeDone}>{t.markDone}</button>
            ) : (
              <button type="button" className="fam-chk-cta fam-chk-cta-ghost" onClick={() => setShowHomeHelp(true)}>{t.cta}</button>
            )
          )}
        </li>
      </ul>
    </div>
  );
}

const CHK_CSS = `
.fam-chk {
  background: #fff;
  border: 1px solid #E6E9EC;
  border-radius: 18px;
  padding: 20px 22px;
  margin-bottom: 22px;
  box-shadow: 0 1px 2px rgba(16,24,40,.04);
}
.fam-chk-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:14px; }
.fam-chk-title { margin:0; font-size:17px; font-weight:700; color:#0F172A; }
.fam-chk-sub { margin:3px 0 0; font-size:13.5px; color:#64748B; line-height:1.4; }
.fam-chk-dismiss { flex-shrink:0; background:none; border:none; color:#94A3B8; font-size:12.5px; font-weight:600; cursor:pointer; padding:2px 4px; }
.fam-chk-dismiss:hover { color:#64748B; }
.fam-chk-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
.fam-chk-item { display:flex; align-items:center; gap:13px; padding:12px 14px; border:1px solid #EEF1F4; border-radius:13px; background:#FBFCFD; transition:background .15s, border-color .15s; }
.fam-chk-item.is-done { background:#F0FDFA; border-color:#CCF3EF; }
.fam-chk-circle { flex-shrink:0; width:26px; height:26px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#0EA5A5; background:#E6FBF8; box-shadow: inset 0 0 0 1.5px #B7EEE8; }
.fam-chk-circle.is-done { color:#fff; background:#0EA5A5; box-shadow:none; }
.fam-chk-body { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.fam-chk-label { font-size:14.5px; font-weight:650; color:#0F172A; }
.fam-chk-item.is-done .fam-chk-label { color:#0E7C74; }
.fam-chk-itemsub { font-size:12.5px; color:#64748B; line-height:1.4; }
.fam-chk-help { font-size:12.5px; color:#475569; line-height:1.45; margin-top:6px; background:#F1F5F9; border-radius:9px; padding:8px 10px; }
.fam-chk-cta { flex-shrink:0; background:#0EA5A5; color:#fff; border:none; border-radius:9px; padding:8px 15px; font-size:13px; font-weight:650; cursor:pointer; text-decoration:none; white-space:nowrap; }
.fam-chk-cta:hover { background:#0C9088; }
.fam-chk-cta-ghost { background:#fff; color:#0E7C74; box-shadow: inset 0 0 0 1.5px #B7EEE8; }
.fam-chk-cta-ghost:hover { background:#F0FDFA; }
`;
