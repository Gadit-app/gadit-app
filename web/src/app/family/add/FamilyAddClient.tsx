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

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { db } from "@/lib/firebase";
import { MemberRole, MEMBER_COLORS } from "@/lib/family";

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

  async function addMember() {
    if (!user || !role) return;
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
                disabled={saving}
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
