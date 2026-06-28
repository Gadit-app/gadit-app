"use client";

/**
 * /schools — owner dashboard for the Schools subscription.
 *
 * Responsibilities:
 *   - Verify the signed-in user owns a Schools subscription. If not, soft
 *     redirect to /pricing.
 *   - Let the principal name the school + upload a logo (shown on the
 *     kid-facing /c/<CODE> page so the classroom feels like part of the
 *     school).
 *   - List every classroom with its 6-character class code and "Open"
 *     button to the teacher view at /classroom/[id].
 *   - "+ Add classroom" creates a new classroom with a random code,
 *     server-validated for uniqueness within the school.
 *
 * Auth model: the owner has a real Firebase Auth uid that matches
 * schoolId. Kids reach /c/<CODE> WITHOUT authenticating (no accounts,
 * no PII) — that's why this page never shows kid data; only aggregate
 * counts per classroom.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { db } from "@/lib/firebase";
import type { Classroom, School } from "@/lib/school";
import { ALLOWED_LOGO_MIMES, MAX_LOGO_BYTES } from "@/lib/school";

const COPY: Record<string, {
  title: string;
  sub: string;
  schoolNameLabel: string;
  schoolNamePh: string;
  logoLabel: string;
  logoCta: string;
  logoReplace: string;
  logoTooBig: string;
  logoBadType: string;
  logoUploading: string;
  classroomsHeading: string;
  addClassroom: string;
  classroomNamePh: string;
  empty: string;
  open: string;
  codeLabel: string;
  wordsLabel: string;
  notReady: string;
  goPricing: string;
  welcome: string;
  back: string;
  saving: string;
  creating: string;
}> = {
  he: {
    title: "בית הספר שלך",
    sub: "כיתות, קודים, ומה הילדים חיפשו היום.",
    schoolNameLabel: "שם בית הספר",
    schoolNamePh: "בית הספר היסודי שלי",
    logoLabel: "לוגו בית הספר",
    logoCta: "העלאת לוגו",
    logoReplace: "החלפת לוגו",
    logoTooBig: "הלוגו גדול מדי. עד 500KB.",
    logoBadType: "רק קבצי PNG או JPG.",
    logoUploading: "מעלה...",
    classroomsHeading: "כיתות",
    addClassroom: "+ הוספת כיתה",
    classroomNamePh: "ז'1 — שרה",
    empty: "עדיין לא הוספתם כיתות. הוסיפו את הראשונה.",
    open: "פתח",
    codeLabel: "קוד",
    wordsLabel: "מילים",
    notReady: "כדי לנהל בית ספר אתם צריכים את מנוי Schools.",
    goPricing: "לתמחור",
    welcome: "ברוכים הבאים ל-Schools! הוסיפו כיתה ראשונה כדי להתחיל.",
    back: "→ חזרה",
    saving: "שומר...",
    creating: "יוצר...",
  },
  en: {
    title: "Your School",
    sub: "Classrooms, codes, and what the kids looked up today.",
    schoolNameLabel: "School name",
    schoolNamePh: "My Elementary School",
    logoLabel: "School logo",
    logoCta: "Upload logo",
    logoReplace: "Replace logo",
    logoTooBig: "Logo too big. Max 500KB.",
    logoBadType: "PNG or JPG only.",
    logoUploading: "Uploading…",
    classroomsHeading: "Classrooms",
    addClassroom: "+ Add classroom",
    classroomNamePh: "7B — Sara",
    empty: "No classrooms yet. Add your first.",
    open: "Open",
    codeLabel: "Code",
    wordsLabel: "words",
    notReady: "Schools subscription is required to manage classrooms.",
    goPricing: "See pricing",
    welcome: "Welcome to Schools! Add your first classroom to get started.",
    back: "← Back",
    saving: "Saving…",
    creating: "Creating…",
  },
  hi: {
    title: "आपका स्कूल",
    sub: "कक्षाएँ, कोड, और बच्चों ने आज क्या खोजा।",
    schoolNameLabel: "स्कूल का नाम",
    schoolNamePh: "मेरा प्राथमिक स्कूल",
    logoLabel: "स्कूल का लोगो",
    logoCta: "लोगो अपलोड करें",
    logoReplace: "लोगो बदलें",
    logoTooBig: "लोगो बहुत बड़ा है। अधिकतम 500KB।",
    logoBadType: "केवल PNG या JPG।",
    logoUploading: "अपलोड हो रहा है…",
    classroomsHeading: "कक्षाएँ",
    addClassroom: "+ कक्षा जोड़ें",
    classroomNamePh: "7B — सारा",
    empty: "अभी कोई कक्षा नहीं। पहली जोड़ें।",
    open: "खोलें",
    codeLabel: "कोड",
    wordsLabel: "शब्द",
    notReady: "कक्षाएँ प्रबंधित करने के लिए Schools सब्सक्रिप्शन ज़रूरी है।",
    goPricing: "क़ीमत देखें",
    welcome: "Schools में स्वागत है! शुरू करने के लिए पहली कक्षा जोड़ें।",
    back: "← वापस",
    saving: "सहेजा जा रहा है…",
    creating: "बनाया जा रहा है…",
  },
};

export function SchoolsClient() {
  const { user, loading } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const search = useSearchParams();
  const c = COPY[lang] ?? COPY.en;

  const [school, setSchool] = useState<School | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schoolChecked, setSchoolChecked] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  // Per-row classroom-name edit. We track which row is in edit mode +
  // its draft string so a click on a name turns the span into an
  // input, save on blur or Enter. Gadi (2026-06-28) reported he had
  // no way to rename a classroom after creating it.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");

  const isWelcome = search.get("welcome") === "1";

  // Subscribe to schools/{ownerUid} doc + classrooms subcollection.
  useEffect(() => {
    if (!user) return;
    const schoolRef = doc(db, "schools", user.uid);
    const unsubSchool = onSnapshot(
      schoolRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as School;
          setSchool(data);
          // Sync name draft from server on first load only — once the
          // user is typing, don't clobber their in-flight edits.
          setNameDraft((prev) => (prev === "" ? data.name : prev));
        } else {
          setSchool(null);
        }
        setSchoolChecked(true);
      },
      () => setSchoolChecked(true)
    );
    const classroomsQ = query(
      collection(db, "schools", user.uid, "classrooms"),
      orderBy("createdAt", "asc")
    );
    const unsubClassrooms = onSnapshot(
      classroomsQ,
      (snap) => {
        setClassrooms(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Classroom, "id">) }))
        );
      },
      () => {}
    );
    return () => {
      unsubSchool();
      unsubClassrooms();
    };
  }, [user]);

  if (loading || !schoolChecked) {
    return <div className="wordbook wb-school-page" dir={dir}>&nbsp;</div>;
  }

  if (!user) {
    router.replace(href("/pricing"));
    return null;
  }

  // No school doc = no Schools subscription. Soft message + pricing link.
  if (!school) {
    return (
      <div className="wordbook wb-school-page" dir={dir}>
        <main className="wb-school-main">
          <p>{c.notReady}</p>
          <Link href={href("/pricing")} className="wb-school-cta" style={{ display: "inline-block", marginTop: 16 }}>
            {c.goPricing}
          </Link>
        </main>
      </div>
    );
  }

  async function saveSchoolName(next: string) {
    if (!user || !school) return;
    if (next === school.name) return;
    setNameSaving(true);
    try {
      await updateDoc(doc(db, "schools", user.uid), {
        name: next,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("save school name failed:", err);
    } finally {
      setNameSaving(false);
    }
  }

  async function saveClassroomName(classroomId: string, next: string) {
    if (!user) return;
    setEditingId(null);
    try {
      await updateDoc(
        doc(db, "schools", user.uid, "classrooms", classroomId),
        { name: next.trim() }
      );
    } catch (err) {
      console.error("save classroom name failed:", err);
    }
  }

  async function createClassroom() {
    if (!user || creating) return;
    setCreating(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/schools/create-classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ name: newClassroomName.trim() }),
      });
      if (res.ok) {
        setNewClassroomName("");
      } else {
        console.error("create classroom failed:", await res.text());
      }
    } catch (err) {
      console.error("create classroom failed:", err);
    } finally {
      setCreating(false);
    }
  }

  async function onLogoPicked(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLogoError(null);
    if (!(ALLOWED_LOGO_MIMES as readonly string[]).includes(file.type)) {
      setLogoError(c.logoBadType);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError(c.logoTooBig);
      return;
    }
    setLogoUploading(true);
    try {
      const idToken = await user.getIdToken();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/schools/logo", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: form,
      });
      if (!res.ok) {
        setLogoError(c.logoBadType);
      }
    } catch (err) {
      console.error("logo upload failed:", err);
    } finally {
      setLogoUploading(false);
    }
  }

  return (
    <div className="wordbook wb-school-page" dir={dir}>
      <main className="wb-school-main">
        <Link href={href("/")} className="wb-family-back">{c.back}</Link>

        <header className="wb-school-header">
          {/* Logo slot. Universal "click to upload image" pattern:
              the slot itself shows the current logo (or a placeholder
              icon), AND a small camera badge in the bottom-end corner
              signals it's an upload target. Replaces the previous
              ambiguous design where the graduation cap looked like
              decoration; tested user (Gadi 2026-06-28) didn't realise
              he could click. */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              type="button"
              className="wb-school-logo-slot"
              onClick={() => logoInputRef.current?.click()}
              title={school.logoUrl ? c.logoReplace : c.logoCta}
              aria-label={school.logoUrl ? c.logoReplace : c.logoCta}
              style={{
                // When a logo is uploaded the mustard fill becomes
                // visual noise behind any transparent-PNG logo (the
                // user-uploaded "computer + cap" logo had its
                // background showing through in V1). Swap to white in
                // the with-logo state so the user's logo reads clean;
                // keep mustard for the empty placeholder state.
                background: school.logoUrl ? "#FFFFFF" : undefined,
                border: school.logoUrl ? "1px solid var(--hairline, #E5E7EB)" : "1px solid #FCD34D",
                cursor: "pointer",
              }}
            >
              {school.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={school.logoUrl} alt="" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7l9-4 9 4-9 4-9-4z" />
                  <path d="M21 10v6" />
                  <path d="M5 9v5c0 2 3 4 7 4s7-2 7-4V9" />
                </svg>
              )}
            </button>
            {/* Edit pencil badge. Sits half-on, half-off the slot's
                bottom-end corner. Mustard pill with a white pencil
                glyph — Gadi (2026-06-28) found the camera icon
                ambiguous; a pencil reads as "edit" immediately. The
                glyph is sized so it fits comfortably inside the
                circle without overflow. Pointer events pass through
                to the underlying button so a click on the badge ALSO
                opens the file picker. */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: -4,
                insetInlineEnd: -4,
                width: 24,
                height: 24,
                borderRadius: 999,
                background: "#CA8A04",
                border: "2px solid var(--surface, #FFFFFF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                boxShadow: "0 2px 4px rgba(202, 138, 4, 0.35)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </span>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={onLogoPicked}
            hidden
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="wb-school-title">{c.title}</h1>
            <p className="wb-school-sub">{c.sub}</p>
          </div>
        </header>

        {logoUploading && (
          <div className="wb-school-sub" style={{ marginBottom: 12 }}>{c.logoUploading}</div>
        )}
        {logoError && (
          <div className="wb-school-sub" style={{ color: "#B91C1C", marginBottom: 12 }}>{logoError}</div>
        )}

        {isWelcome && (
          <div
            style={{
              padding: "12px 16px",
              background: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: 12,
              color: "#A16207",
              fontFamily: "var(--wb-sans)",
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            {c.welcome}
          </div>
        )}

        {/* School name editable in-place. Save on blur — no save button
            needed. updatedAt is bumped server-side via updateDoc. */}
        <section style={{ marginBottom: 32 }}>
          <label
            style={{
              display: "block",
              fontFamily: "var(--wb-sans)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#A16207",
              marginBottom: 8,
            }}
          >
            {c.schoolNameLabel}
          </label>
          <input
            type="text"
            value={nameDraft}
            placeholder={c.schoolNamePh}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => saveSchoolName(nameDraft.trim())}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid var(--hairline)",
              borderRadius: 10,
              background: "var(--surface)",
              fontFamily: "var(--wb-sans)",
              fontSize: 16,
              color: "var(--ink)",
              outline: "none",
            }}
          />
          {nameSaving && (
            <div className="wb-school-sub" style={{ marginTop: 6 }}>{c.saving}</div>
          )}
        </section>

        {/* Classrooms list */}
        <section>
          <h2
            style={{
              fontFamily: "var(--wb-serif)",
              fontWeight: 700,
              fontSize: 20,
              color: "var(--ink)",
              margin: "0 0 14px",
            }}
          >
            {c.classroomsHeading}
          </h2>

          {classrooms.length === 0 ? (
            <p className="wb-school-sub" style={{ marginBottom: 16 }}>{c.empty}</p>
          ) : (
            <div style={{ marginBottom: 20 }}>
              {classrooms.map((cls) => (
                <div key={cls.id} className="wb-classroom-row">
                  <span className="wb-classroom-code">{cls.code}</span>
                  {editingId === cls.id ? (
                    <input
                      type="text"
                      value={editingDraft}
                      autoFocus
                      onChange={(e) => setEditingDraft(e.target.value)}
                      onBlur={() => saveClassroomName(cls.id, editingDraft)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveClassroomName(cls.id, editingDraft);
                        } else if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        border: "1px solid #FCD34D",
                        borderRadius: 8,
                        background: "var(--surface)",
                        fontFamily: "var(--wb-sans)",
                        fontSize: 15.5,
                        fontWeight: 600,
                        color: "var(--ink)",
                        outline: "none",
                      }}
                    />
                  ) : (
                    <span
                      className="wb-classroom-name"
                      onClick={() => {
                        setEditingId(cls.id);
                        setEditingDraft(cls.name ?? "");
                      }}
                      title={lang === "he" ? "לחץ לעריכת שם הכיתה" : "Click to edit classroom name"}
                      style={{ cursor: "pointer" }}
                    >
                      {cls.name || c.classroomsHeading}
                    </span>
                  )}
                  <span className="wb-classroom-count">
                    {cls.searchCount ?? 0} {c.wordsLabel}
                  </span>
                  <Link
                    href={href(`/classroom/${cls.id}`)}
                    className="wb-school-cta"
                    style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}
                  >
                    {c.open}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Inline add-classroom form. The classroom name is optional —
              if blank the row shows the code-only label. */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="text"
              value={newClassroomName}
              placeholder={c.classroomNamePh}
              onChange={(e) => setNewClassroomName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createClassroom(); }}
              disabled={creating}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1px solid var(--hairline)",
                borderRadius: 10,
                background: "var(--surface)",
                fontFamily: "var(--wb-sans)",
                fontSize: 15,
                color: "var(--ink)",
                outline: "none",
              }}
            />
            <button
              type="button"
              className="wb-school-cta"
              onClick={createClassroom}
              disabled={creating}
              style={{ width: "auto", padding: "10px 18px" }}
            >
              {creating ? c.creating : c.addClassroom}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
