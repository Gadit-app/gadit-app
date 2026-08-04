"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { memberColorFor } from "@/lib/family";

/**
 * Shared-device family profile switcher (Gadi 2026-08-05; back-to-parent
 * added 2026-08-04). On a shared computer, a kid switches to a sibling's
 * profile in one tap, no code. The parent account shows here too, as a
 * clearly-labeled row, so getting back to the parent is the SAME one tap
 * (Gadi 2026-08-04: the parent could switch into a kid but had no way
 * back). Lives inside the topbar user menu, reachable from any screen.
 */

type SwitchMember = { id: string; name: string; role: string; colorIndex: number; isOwner: boolean };

const COPY: Record<string, { title: string; parentTag: string; parentFallback: string; switching: string }> = {
  he: { title: "החלפת פרופיל", parentTag: "הורה", parentFallback: "חשבון ההורה", switching: "מחליף…" },
  en: { title: "Switch profile", parentTag: "Parent", parentFallback: "Parent account", switching: "Switching…" },
  ar: { title: "تبديل الملف الشخصي", parentTag: "الوالد", parentFallback: "حساب الوالد", switching: "جارٍ التبديل…" },
  ru: { title: "Сменить профиль", parentTag: "Родитель", parentFallback: "Аккаунт родителя", switching: "Переключение…" },
};

const ROLE_ICON: Record<string, string> = { father: "👨", mother: "👩", boy: "👦", girl: "👧" };

export function FamilyProfileSwitcher({ onSwitch }: { onSwitch?: () => void }) {
  const { user, familyId } = useAuth();
  const { lang } = useLang();
  const t = COPY[lang] ?? COPY.en;

  const [members, setMembers] = useState<SwitchMember[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !familyId) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/family/switch-member", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) return;
        const json = (await res.json()) as { members?: SwitchMember[] };
        if (!cancelled) setMembers(json.members ?? []);
      } catch {
        /* switcher is optional; stay hidden on failure */
      }
    })();
    return () => { cancelled = true; };
  }, [user, familyId]);

  // Is this row the profile we're currently signed in as? The parent's
  // real uid IS the family id; a kid's synthetic uid ends with `_<id>`.
  function isCurrent(m: SwitchMember): boolean {
    if (m.isOwner) return user?.uid === familyId;
    return !!user?.uid?.endsWith(`_${m.id}`);
  }

  async function switchTo(m: SwitchMember) {
    if (!user || busy || isCurrent(m)) return;
    setBusy(m.id);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/switch-member", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ memberId: m.id }),
      });
      const json = (await res.json().catch(() => null)) as { token?: string } | null;
      if (!res.ok || !json?.token) { setBusy(null); return; }
      const { signInWithCustomToken, getAuth } = await import("firebase/auth");
      await signInWithCustomToken(getAuth(), json.token);
      onSwitch?.();
      // Reload so every surface picks up the new profile's session + notebook.
      window.location.reload();
    } catch {
      setBusy(null);
    }
  }

  if (!familyId || !members) return null;
  const kids = members.filter((m) => !m.isOwner);
  const owner = members.find((m) => m.isOwner) ?? null;
  // Nothing to switch to (e.g. the parent alone, no kids) → stay hidden.
  const hasTarget = members.some((m) => !isCurrent(m));
  if (!hasTarget) return null;

  function Row({ m, tag }: { m: SwitchMember; tag?: string }) {
    const linked = busy === m.id;
    const mine = isCurrent(m);
    const label = m.name || (m.isOwner ? t.parentFallback : (ROLE_ICON[m.role] ?? ""));
    return (
      <button
        type="button"
        disabled={!!busy || mine}
        onClick={() => switchTo(m)}
        style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          padding: "8px 8px", borderRadius: 8, border: "none",
          background: mine ? "var(--paper, #F3F4F6)" : "transparent",
          cursor: busy || mine ? "default" : "pointer", textAlign: "start",
          fontFamily: "inherit", opacity: busy && !linked ? 0.5 : 1,
        }}
        onMouseEnter={(e) => { if (!busy && !mine) e.currentTarget.style.background = "var(--paper, #F9FAFB)"; }}
        onMouseLeave={(e) => { if (!mine) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, background: memberColorFor({ colorIndex: m.colorIndex }), display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
          {ROLE_ICON[m.role] ?? (m.isOwner ? "🧑" : "🙂")}
        </span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--ink, #111827)" }}>
          {label}
        </span>
        {tag && !linked && (
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-soft, #9CA3AF)", letterSpacing: 0.3, textTransform: "uppercase" }}>
            {tag}
          </span>
        )}
        {linked && <span style={{ fontSize: 12, color: "var(--ink-soft, #9CA3AF)" }}>{t.switching}</span>}
      </button>
    );
  }

  return (
    <div style={{ padding: "6px 8px 4px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft, #9CA3AF)", letterSpacing: 0.4, textTransform: "uppercase", padding: "2px 6px 6px" }}>
        {t.title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {kids.map((m) => <Row key={m.id} m={m} />)}
        {owner && (
          <>
            {kids.length > 0 && <div style={{ borderTop: "1px solid var(--hairline, #E5E7EB)", margin: "4px 4px" }} />}
            <Row m={owner} tag={t.parentTag} />
          </>
        )}
      </div>
      <div style={{ borderTop: "1px solid var(--hairline, #E5E7EB)", margin: "6px 4px 2px" }} />
    </div>
  );
}
