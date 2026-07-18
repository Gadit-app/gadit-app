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
  MAX_KIDS_PER_FAMILY,
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
  capReached: string;
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
    capReached: `הגעתם למקסימום של ${MAX_KIDS_PER_FAMILY} ילדים במנוי המשפחתי.`,
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
    capReached: `You've reached the cap of ${MAX_KIDS_PER_FAMILY} children on the Family plan.`,
  },
  hi: {
    title: "आपका परिवार",
    sub: "हर सदस्य का अपना खाता है, अपनी नोटबुक और इतिहास के साथ।",
    add: "+ जोड़ें",
    parents: "माता-पिता",
    children: "बच्चे",
    empty: "अभी कोई परिवारजन नहीं। पहले बच्चे को जोड़ने से शुरू करें।",
    pair: "डिवाइस जोड़ें",
    revoke: "अलग करें",
    paired: "जुड़ा हुआ",
    owner: "मुख्य",
    notReady: "सदस्यों को प्रबंधित करने के लिए Family सब्सक्रिप्शन ज़रूरी है।",
    goPricing: "क़ीमत देखें",
    welcome: "Family में स्वागत है! शुरू करने के लिए अपने सदस्य जोड़ें।",
    back: "← वापस",
    capReached: `आप Family प्लान में ${MAX_KIDS_PER_FAMILY} बच्चों की सीमा तक पहुँच गए हैं।`,
  },
  am: {
    title: "ቤተሰብዎ",
    sub: "እያንዳንዱ የቤተሰብ አባል የራሱ ተጠቃሚ ነው፣ የራሱ ማስታወሻ ደብተር እና ታሪክ አለው።",
    add: "+ ጨምር",
    parents: "ወላጆች",
    children: "ልጆች",
    empty: "እስካሁን የቤተሰብ አባላት የሉም። የመጀመሪያውን ልጅ በመጨመር ይጀምሩ።",
    pair: "መሳሪያ ያገናኙ",
    revoke: "ግንኙነት አቋርጥ",
    paired: "ተገናኝቷል",
    owner: "ዋና ወላጅ",
    notReady: "አባላትን ለማስተዳደር የFamily ምዝገባ ያስፈልጋል።",
    goPricing: "ዋጋዎችን ይመልከቱ",
    welcome: "እንኳን ወደ Family በደህና መጡ! ለመጀመር የቤተሰብ አባላትዎን ይጨምሩ።",
    back: "← ተመለስ",
    capReached: `በFamily እቅድ ላይ ያለውን የ${MAX_KIDS_PER_FAMILY} ልጆች ጣሪያ ደርሰዋል።`,
  },
};

const ROLE_LABEL: Record<string, Record<"father" | "mother" | "boy" | "girl", string>> = {
  he: { father: "אבא", mother: "אמא", boy: "בן", girl: "בת" },
  en: { father: "Dad", mother: "Mom", boy: "Son", girl: "Daughter" },
  hi: { father: "पापा", mother: "मम्मी", boy: "बेटा", girl: "बेटी" },
  am: { father: "አባት", mother: "እናት", boy: "ወንድ ልጅ", girl: "ሴት ልጅ" },
};

// ─── Progress dashboard ────────────────────────────────────────────
// The parent's report card: per child, how their vocabulary is
// growing (total words, words this week, recent words). This is the
// feature that answers "why pay when ChatGPT is free" — ChatGPT is a
// conversation that vanishes, Gadit accumulates and shows the growth.
type ChildProgress = {
  memberId: string;
  name: string;
  role: string;
  colorIndex: number;
  linked: boolean;
  total: number;
  thisWeek: number;
  recent: string[];
};

const PROGRESS_COPY: Record<string, {
  title: string;
  sub: string;
  familyTotal: string;
  weekTotal: string;
  wordsInNotebook: string;
  thisWeek: string;
  recentWords: string;
  notLinked: string;
  noneYet: string;
  loading: string;
}> = {
  he: {
    title: "ההתקדמות של הילדים",
    sub: "כמה מילים כל ילד למד, וכמה נוספו השבוע. אוצר המילים גדל לנגד עיניכם.",
    familyTotal: "מילים במחברות המשפחה",
    weekTotal: "מילים חדשות השבוע",
    wordsInNotebook: "מילים במחברת",
    thisWeek: "השבוע",
    recentWords: "מילים אחרונות",
    notLinked: "המכשיר של הילד עדיין לא מחובר. חברו אותו כדי לראות את ההתקדמות.",
    noneYet: "עדיין אין מילים במחברת. ברגע שהילד יתחיל לחפש, הן יופיעו כאן.",
    loading: "טוענים את ההתקדמות...",
  },
  en: {
    title: "Your children's progress",
    sub: "How many words each child has learned, and how many were added this week. Watch the vocabulary grow.",
    familyTotal: "words in the family's notebooks",
    weekTotal: "new words this week",
    wordsInNotebook: "words in notebook",
    thisWeek: "this week",
    recentWords: "Recent words",
    notLinked: "This child's device is not linked yet. Pair it to see their progress.",
    noneYet: "No words in the notebook yet. As soon as your child starts looking words up, they appear here.",
    loading: "Loading progress...",
  },
};

function ProgressCard({ c, t, lang }: { c: ChildProgress; t: (typeof PROGRESS_COPY)["en"]; lang: string }) {
  const color = memberColorFor({ colorIndex: c.colorIndex });
  const initial = (c.name || "?").trim().charAt(0).toUpperCase() || "?";
  const roleName = (ROLE_LABEL[lang] ?? ROLE_LABEL.en)[c.role as "boy" | "girl"] ?? "";
  return (
    <div className="fam-dash-card">
      <div className="fam-dash-head">
        <div className="fam-dash-avatar" style={{ background: color }}>{initial}</div>
        <div>
          <div className="fam-dash-name">{c.name || roleName}</div>
          <div className="fam-dash-role">{roleName}</div>
        </div>
      </div>
      {!c.linked ? (
        <div className="fam-dash-note">{t.notLinked}</div>
      ) : c.total === 0 ? (
        <div className="fam-dash-note">{t.noneYet}</div>
      ) : (
        <>
          <div className="fam-dash-stats">
            <div className="fam-dash-big">
              <span className="fam-dash-num">{c.total}</span>
              <span className="fam-dash-label">{t.wordsInNotebook}</span>
            </div>
            {c.thisWeek > 0 && (
              <div className="fam-dash-week">+{c.thisWeek} {t.thisWeek}</div>
            )}
          </div>
          {c.recent.length > 0 && (
            <div className="fam-dash-recent">
              <div className="fam-dash-recent-label">{t.recentWords}</div>
              <div className="fam-dash-chips">
                {c.recent.slice(0, 5).map((w, i) => (
                  <span key={i} className="fam-dash-chip">{w}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
  const [progress, setProgress] = useState<{ children: ChildProgress[]; totalWords: number; weekWords: number } | null>(null);

  const isWelcome = search.get("welcome") === "1";
  const pt = PROGRESS_COPY[lang] ?? PROGRESS_COPY.en;

  // Load the progress dashboard once we know the user owns a family.
  // Refetch when members change (a newly paired child should appear).
  useEffect(() => {
    if (!user || !family) return;
    let cancelled = false;
    (async () => {
      try {
        const { getIdToken } = await import("firebase/auth");
        const idToken = await getIdToken(user);
        const res = await fetch("/api/family/progress", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setProgress(data);
      } catch {
        /* progress is a nice-to-have; never block the roster */
      }
    })();
    return () => { cancelled = true; };
  }, [user, family, members.length]);

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
  const atCap = children.length >= MAX_KIDS_PER_FAMILY;

  return (
    <div className="wordbook wb-family-page" dir={dir}>
      <main className="wb-family-main">
        <Link href={href("/")} className="wb-family-back">{c.back}</Link>

        <header className="wb-family-header">
          <h1 className="wb-family-title">{c.title}</h1>
          <p className="wb-family-sub">{c.sub}</p>
          {isWelcome && <div className="wb-family-welcome-pill">{c.welcome}</div>}
          {atCap ? (
            <div className="wb-family-cap-pill">{c.capReached}</div>
          ) : (
            <Link href={href("/family/add")} className="wb-family-add-btn">{c.add}</Link>
          )}
        </header>

        {progress && progress.children.length > 0 && (
          <section className="fam-dash">
            <style>{FAM_DASH_CSS}</style>
            <h2 className="wb-family-section-title">{pt.title}</h2>
            <p className="fam-dash-sub">{pt.sub}</p>
            {progress.totalWords > 0 && (
              <div className="fam-dash-summary">
                <div className="fam-dash-sumcard">
                  <span className="fam-dash-sumnum">{progress.totalWords}</span>
                  <span className="fam-dash-sumlabel">{pt.familyTotal}</span>
                </div>
                <div className="fam-dash-sumcard fam-dash-sumcard-week">
                  <span className="fam-dash-sumnum">+{progress.weekWords}</span>
                  <span className="fam-dash-sumlabel">{pt.weekTotal}</span>
                </div>
              </div>
            )}
            <div className="fam-dash-grid">
              {progress.children.map((cp) => (
                <ProgressCard key={cp.memberId} c={cp} t={pt} lang={lang} />
              ))}
            </div>
          </section>
        )}

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

// Scoped styles for the progress dashboard. Kept local (not in
// globals.css) so this feature is fully self-contained.
const FAM_DASH_CSS = `
.fam-dash { margin: 8px 0 30px; }
.fam-dash-sub { color: #6b7280; font-size: 14.5px; margin: 4px 0 16px; line-height: 1.5; }
.fam-dash-summary { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
.fam-dash-sumcard {
  flex: 1; min-width: 150px;
  background: linear-gradient(140deg, rgba(14,165,165,0.12), rgba(14,165,165,0.04));
  border: 1px solid rgba(14,165,165,0.2);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 2px;
}
.fam-dash-sumcard-week {
  background: linear-gradient(140deg, rgba(124,58,237,0.12), rgba(124,58,237,0.04));
  border-color: rgba(124,58,237,0.2);
}
.fam-dash-sumnum { font-size: 30px; font-weight: 800; color: #1f2937; line-height: 1; }
.fam-dash-sumcard-week .fam-dash-sumnum { color: #6d28d9; }
.fam-dash-sumlabel { font-size: 13px; color: #6b7280; font-weight: 600; }
.fam-dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.fam-dash-card {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.09);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 6px 18px rgba(31,41,55,0.05);
}
.fam-dash-head { display: flex; align-items: center; gap: 11px; margin-bottom: 14px; }
.fam-dash-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  color: #fff; font-weight: 800; font-size: 18px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.fam-dash-name { font-weight: 700; font-size: 16px; color: #1f2937; }
.fam-dash-role { font-size: 12.5px; color: #9ca3af; }
.fam-dash-note { color: #6b7280; font-size: 13.5px; line-height: 1.5; padding: 4px 0; }
.fam-dash-stats { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }
.fam-dash-big { display: flex; flex-direction: column; }
.fam-dash-num { font-size: 34px; font-weight: 800; color: #0b7d7d; line-height: 1; }
.fam-dash-label { font-size: 12.5px; color: #6b7280; font-weight: 600; margin-top: 3px; }
.fam-dash-week {
  background: rgba(124,58,237,0.1); color: #6d28d9;
  font-weight: 800; font-size: 13px;
  border-radius: 999px; padding: 5px 11px;
  white-space: nowrap;
}
.fam-dash-recent { margin-top: 14px; border-top: 1px dashed rgba(31,41,55,0.12); padding-top: 12px; }
.fam-dash-recent-label { font-size: 12px; color: #9ca3af; font-weight: 700; margin-bottom: 7px; }
.fam-dash-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.fam-dash-chip {
  background: rgba(14,165,165,0.09); color: #374151;
  border-radius: 999px; padding: 4px 11px;
  font-size: 13px; font-weight: 600;
}
`;
