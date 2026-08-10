"use client";

/**
 * /family/add — owner adds a new family member.
 *
 * Two-step flow:
 *   1. Role picker — 4 cards (אבא/אמא/בן/בת).
 *   2. Name input + color picker, then "Add".
 *
 * On submit:
 *   - Writes a member doc to families/{ownerUid}/members/{auto-id}.
 *   - Routes to /family/[id]/pair so the owner can immediately
 *     generate a QR code for the new member's device.
 *   - For parents the owner adds (mother/father), this still routes
 *     to /pair, since the secondary parent also pairs via QR + code
 *     (same flow as kids, role claim differs).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { db } from "@/lib/firebase";
import { MemberRole, MEMBER_COLORS, MAX_KIDS_PER_FAMILY, isParentRole } from "@/lib/family";

const COPY: Record<string, {
  title: string;
  step1: string;
  step2: string;
  father: string;
  mother: string;
  boy: string;
  girl: string;
  nameLabel: string;
  namePlaceholder: string;
  colorLabel: string;
  back: string;
  cancel: string;
  add: string;
  adding: string;
  capReached: string;
}> = {
  he: {
    title: "מי מצטרף למשפחה?",
    step1: "בחרו תפקיד",
    step2: "שם וצבע",
    father: "אבא",
    mother: "אמא",
    boy: "בן",
    girl: "בת",
    nameLabel: "שם",
    namePlaceholder: "מאיה",
    colorLabel: "צבע אווטאר",
    back: "→ חזרה",
    cancel: "ביטול",
    add: "הוסף למשפחה",
    adding: "מוסיף...",
    capReached: `מנוי Family מוגבל ל-${MAX_KIDS_PER_FAMILY} ילדים. לא ניתן להוסיף עוד ילדים, אבל אפשר עדיין להוסיף הורה.`,
  },
  en: {
    title: "Who's joining the family?",
    step1: "Pick a role",
    step2: "Name & color",
    father: "Dad",
    mother: "Mom",
    boy: "Son",
    girl: "Daughter",
    nameLabel: "Name",
    namePlaceholder: "Maya",
    colorLabel: "Avatar color",
    back: "← Back",
    cancel: "Cancel",
    add: "Add to family",
    adding: "Adding...",
    capReached: `Family is limited to ${MAX_KIDS_PER_FAMILY} children. You can't add more children, but you can still add a parent.`,
  },
  zu: {
    title: "Ubani ojoyina umndeni?",
    step1: "Khetha indima",
    step2: "Igama nombala",
    father: "Ubaba",
    mother: "Umama",
    boy: "Indodana",
    girl: "Indodakazi",
    nameLabel: "Igama",
    namePlaceholder: "Maya",
    colorLabel: "Umbala we-avatar",
    back: "← Emuva",
    cancel: "Khansela",
    add: "Engeza emndenini",
    adding: "Kuyengezwa...",
    capReached: `I-Family ikhawulelwe ezinganeni ezingu-${MAX_KIDS_PER_FAMILY}. Awukwazi ukwengeza izingane ezengeziwe, kodwa usengakwazi ukwengeza umzali.`,
  },
  el: {
    title: "Ποιος μπαίνει στην οικογένεια;",
    step1: "Διάλεξε ρόλο",
    step2: "Όνομα και χρώμα",
    father: "Μπαμπάς",
    mother: "Μαμά",
    boy: "Γιος",
    girl: "Κόρη",
    nameLabel: "Όνομα",
    namePlaceholder: "Μαρία",
    colorLabel: "Χρώμα άβαταρ",
    back: "← Πίσω",
    cancel: "Ακύρωση",
    add: "Προσθήκη στην οικογένεια",
    adding: "Προσθήκη...",
    capReached: `Το Family περιορίζεται σε ${MAX_KIDS_PER_FAMILY} παιδιά. Δεν μπορείς να προσθέσεις άλλα παιδιά, αλλά μπορείς ακόμη να προσθέσεις γονέα.`,
  },
  ru: {
    title: "Кто присоединяется к семье?",
    step1: "Выберите роль",
    step2: "Имя и цвет",
    father: "Папа",
    mother: "Мама",
    boy: "Сын",
    girl: "Дочь",
    nameLabel: "Имя",
    namePlaceholder: "Майя",
    colorLabel: "Цвет аватара",
    back: "← Назад",
    cancel: "Отмена",
    add: "Добавить в семью",
    adding: "Добавляем...",
    capReached: `Family ограничен ${MAX_KIDS_PER_FAMILY} детьми. Больше детей добавить нельзя, но можно добавить родителя.`,
  },
  hi: {
    title: "परिवार में कौन जुड़ रहा है?",
    step1: "भूमिका चुनें",
    step2: "नाम और रंग",
    father: "पापा",
    mother: "मम्मी",
    boy: "बेटा",
    girl: "बेटी",
    nameLabel: "नाम",
    namePlaceholder: "आर्या",
    colorLabel: "अवतार का रंग",
    back: "← वापस",
    cancel: "रद्द करें",
    add: "परिवार में जोड़ें",
    adding: "जोड़ रहे हैं...",
    capReached: `Family ${MAX_KIDS_PER_FAMILY} बच्चों तक सीमित है। और बच्चे नहीं जोड़ सकते, पर माता-पिता अब भी जोड़ सकते हैं।`,
  },
  am: {
    title: "ማን ነው ቤተሰቡን የሚቀላቀለው?",
    step1: "ሚና ይምረጡ",
    step2: "ስም እና ቀለም",
    father: "አባት",
    mother: "እናት",
    boy: "ወንድ ልጅ",
    girl: "ሴት ልጅ",
    nameLabel: "ስም",
    namePlaceholder: "ሰላም",
    colorLabel: "የአምሳያ ቀለም",
    back: "← ተመለስ",
    cancel: "ሰርዝ",
    add: "ወደ ቤተሰቡ ጨምር",
    adding: "እየጨመርን ነው...",
    capReached: `Family እስከ ${MAX_KIDS_PER_FAMILY} ልጆች ብቻ ነው። ተጨማሪ ልጆች መጨመር አይቻልም፣ ግን አሁንም ወላጅ መጨመር ይችላሉ።`,
  },
};

const ROLE_DEFS: Array<{ role: MemberRole; iconViewBox: string; iconPath: string }> = [
  // Mars symbol
  { role: "father", iconViewBox: "0 0 24 24", iconPath: "M14 4h6v6 M20 4l-7 7 M11 14a5 5 0 1 1-3.5-8.5 5 5 0 0 1 3.5 8.5z" },
  // Venus symbol
  { role: "mother", iconViewBox: "0 0 24 24", iconPath: "M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 14v6 M9 18h6" },
  // Smiley
  { role: "boy", iconViewBox: "0 0 24 24", iconPath: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M8.5 10v.5 M15.5 10v.5 M8.5 14.5c1.2 1.2 5 1.2 7 0" },
  // Bow
  { role: "girl", iconViewBox: "0 0 24 24", iconPath: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M8.5 10v.5 M15.5 10v.5 M8.5 14.5c1.2 1.2 5 1.2 7 0 M5 4l4 4 M19 4l-4 4" },
];

export function FamilyAddClient() {
  const { user, loading } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = COPY[lang] ?? COPY.en;

  const [role, setRole] = useState<MemberRole | null>(null);
  const [name, setName] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [childCount, setChildCount] = useState<number | null>(null);

  // Snapshot the family's current child count once on mount. This is the
  // gate that prevents the parent from adding a 6th child on the Family
  // plan. Picking up here instead of subscribing because the parent flow
  // is short-lived: pick role -> add -> redirect.
  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const snap = await getDocs(collection(db, "families", user.uid, "members"));
        const kids = snap.docs.filter((d) => !isParentRole(d.data().role)).length;
        setChildCount(kids);
      } catch {
        setChildCount(0);
      }
    })();
  }, [user]);

  const atKidCap =
    role !== null && !isParentRole(role) && childCount !== null && childCount >= MAX_KIDS_PER_FAMILY;

  async function addMember() {
    if (!user || !role) return;
    if (atKidCap) return;
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, "families", user.uid, "members"), {
        role,
        name: name.trim(),
        colorIndex,
        isOwner: false,
        createdAt: serverTimestamp(),
      });
      router.push(href(`/family/${ref.id}/pair`));
    } catch (e) {
      console.error("add member failed:", e);
      setSaving(false);
    }
  }

  if (loading || !user) {
    return <div className="wordbook wb-family-page" dir={dir}>&nbsp;</div>;
  }

  return (
    <div className="wordbook wb-family-page" dir={dir}>
      <main className="wb-family-main">
        <Link href={href("/family")} className="wb-family-back">{c.back}</Link>

        <header className="wb-family-header">
          <h1 className="wb-family-title">{c.title}</h1>
          <p className="wb-family-sub">{role ? c.step2 : c.step1}</p>
        </header>

        {!role ? (
          <div className="wb-family-role-grid">
            {ROLE_DEFS.map((r, i) => (
              <button
                key={r.role}
                type="button"
                className="wb-family-role-card"
                onClick={() => {
                  setRole(r.role);
                  setColorIndex(i % MEMBER_COLORS.length);
                }}
              >
                <div className="wb-family-role-icon" style={{ background: MEMBER_COLORS[i] }}>
                  <svg width="32" height="32" viewBox={r.iconViewBox} fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={r.iconPath} />
                  </svg>
                </div>
                <div className="wb-family-role-label">{c[r.role]}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="wb-family-add-form">
            {atKidCap && (
              <div className="wb-family-cap-pill" style={{ alignSelf: "stretch" }}>
                {c.capReached}
              </div>
            )}
            <label className="wb-family-field">
              <span className="wb-family-field-label">{c.nameLabel}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.namePlaceholder}
                autoFocus
                className="wb-family-field-input"
              />
            </label>

            <div className="wb-family-field">
              <span className="wb-family-field-label">{c.colorLabel}</span>
              <div className="wb-family-color-row">
                {MEMBER_COLORS.map((color, i) => (
                  <button
                    key={color}
                    type="button"
                    className={`wb-family-color-dot${i === colorIndex ? " is-selected" : ""}`}
                    style={{ background: color }}
                    onClick={() => setColorIndex(i)}
                    aria-label={`color ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="wb-family-form-actions">
              <button
                type="button"
                className="wb-family-cta-ghost"
                onClick={() => setRole(null)}
                disabled={saving}
              >
                {c.cancel}
              </button>
              <button
                type="button"
                className="wb-family-cta"
                onClick={addMember}
                disabled={saving || atKidCap}
              >
                {saving ? c.adding : c.add}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
