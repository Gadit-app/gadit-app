"use client";

/**
 * /family — owner dashboard for the Family subscription.
 *
 * Responsibilities:
 *   - Verify the signed-in user owns a Family subscription. If not, send
 *     them to /pricing with a soft message.
 *   - Show the family roster split into Parents + Children rows
 *     (mirrors Yooniz's pattern).
 *   - Each card surfaces "Pair device" (generates code, navigates to
 *     /family/[memberId]/pair) and, once linked, "Revoke".
 *   - "+ Add member" navigates to /family/add.
 *
 * Auth model: the owner has a real Firebase Auth uid that matches
 * familyId. Paired members signed in via custom tokens should NOT see
 * this page — they're redirected to /. (Future: kids get their own
 * landing page; for v1 they just use the main app.)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { db } from "@/lib/firebase";
import {
  FamilyMember,
  Family,
  isParentRole,
  memberColorFor,
} from "@/lib/family";

const COPY: Record<string, {
  title: string;
  sub: string;
  add: string;
  parents: string;
  children: string;
  empty: string;
  pair: string;
  revoke: string;
  paired: string;
  owner: string;
  notReady: string;
  goPricing: string;
  welcome: string;
  back: string;
}> = {
  he: {
    title: "המשפחה שלכם",
    sub: "כל בן משפחה הוא משתמש בפני עצמו, עם המחברת וההיסטוריה שלו.",
    add: "+ הוספה",
    parents: "הורים",
    children: "ילדים",
    empty: "עדיין לא הוספתם בני משפחה. התחילו עם הילד הראשון.",
    pair: "חיבור מכשיר",
    revoke: "ניתוק",
    paired: "מחובר",
    owner: "ההורה הראשי",
    notReady: "כדי לנהל משפחה אתם צריכים את מנוי Family.",
    goPricing: "לתמחור",
    welcome: "ברוכים הבאים ל-Family! הוסיפו את חברי המשפחה כדי להתחיל.",
    back: "→ חזרה",
  },
  en: {
    title: "Your Family",
    sub: "Every family member is their own user, with their own notebook and history.",
    add: "+ Add",
    parents: "Parents",
    children: "Children",
    empty: "No family members yet. Start by adding your first child.",
    pair: "Pair device",
    revoke: "Unpair",
    paired: "Paired",
    owner: "Owner",
    notReady: "Family subscription is required to manage members.",
    goPricing: "See pricing",
    welcome: "Welcome to Family! Add your members to get started.",
    back: "← Back",
  },
};

const ROLE_LABEL: Record<string, Record<"father" | "mother" | "boy" | "girl", string>> = {
  he: { father: "אבא", mother: "אמא", boy: "בן", girl: "בת" },
  en: { father: "Dad", mother: "Mom", boy: "Son", girl: "Daughter" },
};

function MemberCard({
  m,
  onPair,
  onRevoke,
  pairLabel,
  revokeLabel,
  pairedLabel,
  ownerLabel,
  roleLabel,
}: {
  m: FamilyMember;
  onPair: () => void;
  onRevoke: () => void;
  pairLabel: string;
  revokeLabel: string;
  pairedLabel: string;
  ownerLabel: string;
  roleLabel: string;
}) {
  const color = memberColorFor(m);
  const initial = (m.name || roleLabel || "?").trim().charAt(0).toUpperCase();
  const linked = !!m.userId && !m.isOwner;
  return (
    <div className="wb-family-member-card">
      <div className="wb-family-member-avatar" style={{ background: color }}>
        {m.avatarPhotoUrl ? (
          <img src={m.avatarPhotoUrl} alt="" />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      <div className="wb-family-member-meta">
        <div className="wb-family-member-name">{m.name || roleLabel}</div>
        <div className="wb-family-member-role">
          {m.isOwner ? ownerLabel : roleLabel}
          {linked && <span className="wb-family-member-paired-dot">· {pairedLabel}</span>}
        </div>
      </div>
      {!m.isOwner && (
        <div className="wb-family-member-actions">
          <button type="button" className="wb-family-member-pair" onClick={onPair}>
            {pairLabel}
          </button>
          {linked && (
            <button type="button" className="wb-family-member-revoke" onClick={onRevoke}>
              {revokeLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function FamilyClient() {
  const { user, loading } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const search = useSearchParams();
  const c = COPY[lang] ?? COPY.en;
  const roleLabel = ROLE_LABEL[lang] ?? ROLE_LABEL.en;

  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyChecked, setFamilyChecked] = useState(false);

  const isWelcome = search.get("welcome") === "1";

  // Subscribe to families/{ownerUid} doc + its members subcollection.
  useEffect(() => {
    if (!user) return;
    const famRef = doc(db, "families", user.uid);
    const unsubFamily = onSnapshot(
      famRef,
      (snap) => {
        if (snap.exists()) {
          setFamily(snap.data() as Family);
        } else {
          setFamily(null);
        }
        setFamilyChecked(true);
      },
      () => setFamilyChecked(true)
    );
    const membersQ = query(
      collection(db, "families", user.uid, "members"),
      orderBy("createdAt", "asc")
    );
    const unsubMembers = onSnapshot(
      membersQ,
      (snap) => {
        setMembers(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FamilyMember, "id">) }))
        );
      },
      () => {}
    );
    return () => {
      unsubFamily();
      unsubMembers();
    };
  }, [user]);

  if (loading || !familyChecked) {
    return <div className="wordbook wb-family-page" dir={dir}>&nbsp;</div>;
  }

  if (!user) {
    router.replace(href("/pricing"));
    return null;
  }

  // No family doc = no Family subscription. Soft redirect with a message.
  if (!family) {
    return (
      <div className="wordbook wb-family-page" dir={dir}>
        <main className="wb-family-main">
          <div className="wb-family-empty-state">
            <p>{c.notReady}</p>
            <Link href={href("/pricing")} className="wb-family-cta">
              {c.goPricing}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const parents = members.filter((m) => isParentRole(m.role));
  const children = members.filter((m) => !isParentRole(m.role));

  return (
    <div className="wordbook wb-family-page" dir={dir}>
      <main className="wb-family-main">
        <Link href={href("/")} className="wb-family-back">{c.back}</Link>

        <header className="wb-family-header">
          <h1 className="wb-family-title">{c.title}</h1>
          <p className="wb-family-sub">{c.sub}</p>
          {isWelcome && <div className="wb-family-welcome-pill">{c.welcome}</div>}
          <Link href={href("/family/add")} className="wb-family-add-btn">{c.add}</Link>
        </header>

        {members.length === 0 ? (
          <div className="wb-family-empty-state">
            <p>{c.empty}</p>
            <Link href={href("/family/add")} className="wb-family-cta">{c.add}</Link>
          </div>
        ) : (
          <>
            {parents.length > 0 && (
              <section className="wb-family-section">
                <h2 className="wb-family-section-title">{c.parents}</h2>
                <div className="wb-family-grid">
                  {parents.map((m) => (
                    <MemberCard
                      key={m.id}
                      m={m}
                      onPair={() => router.push(href(`/family/${m.id}/pair`))}
                      onRevoke={() => revokeMember(user.uid, m.id)}
                      pairLabel={c.pair}
                      revokeLabel={c.revoke}
                      pairedLabel={c.paired}
                      ownerLabel={c.owner}
                      roleLabel={roleLabel[m.role]}
                    />
                  ))}
                </div>
              </section>
            )}
            {children.length > 0 && (
              <section className="wb-family-section">
                <h2 className="wb-family-section-title">{c.children}</h2>
                <div className="wb-family-grid">
                  {children.map((m) => (
                    <MemberCard
                      key={m.id}
                      m={m}
                      onPair={() => router.push(href(`/family/${m.id}/pair`))}
                      onRevoke={() => revokeMember(user.uid, m.id)}
                      pairLabel={c.pair}
                      revokeLabel={c.revoke}
                      pairedLabel={c.paired}
                      ownerLabel={c.owner}
                      roleLabel={roleLabel[m.role]}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

async function revokeMember(_ownerUid: string, memberId: string) {
  const { getAuth, getIdToken } = await import("firebase/auth");
  const u = getAuth().currentUser;
  if (!u) return;
  const idToken = await getIdToken(u);
  await fetch("/api/family/pair/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ memberId }),
  });
}
