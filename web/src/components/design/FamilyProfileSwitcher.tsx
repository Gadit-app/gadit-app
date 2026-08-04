"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { memberColorFor } from "@/lib/family";

/**
 * Shared-device family profile switcher (Gadi 2026-08-05). On a shared
 * computer, a kid can switch to a sibling's profile in one tap, no code.
 * Lives inside the topbar user menu, so it's reachable from any screen
 * (including the search/word page where kids actually look words up).
 * Shows for any signed-in family member; the billing owner is never a
 * target (switch back to it by logging in normally).
 */

type SwitchMember = { id: string; name: string; role: string; colorIndex: number };

const COPY: Record<string, { title: string; hint: string; switching: string }> = {
  he: { title: "החלפת פרופיל", hint: "מי מחפש עכשיו?", switching: "מחליף…" },
  en: { title: "Switch profile", hint: "Who's searching now?", switching: "Switching…" },
  ar: { title: "تبديل الملف الشخصي", hint: "من يبحث الآن؟", switching: "جارٍ التبديل…" },
  ru: { title: "Сменить профиль", hint: "Кто сейчас ищет?", switching: "Переключение…" },
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

  if (!familyId || !members || members.length === 0) return null;

  async function switchTo(m: SwitchMember) {
    if (!user || busy) return;
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
      // Reload so every surface picks up the new member's session + notebook.
      window.location.reload();
    } catch {
      setBusy(null);
    }
  }

  return (
    <div style={{ padding: "6px 8px 4px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft, #9CA3AF)", letterSpacing: 0.4, textTransform: "uppercase", padding: "2px 6px 6px" }}>
        {t.title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {members.map((m) => {
          const linked = busy === m.id;
          const isMe = user?.uid?.endsWith(`_${m.id}`);
          return (
            <button
              key={m.id}
              type="button"
              disabled={!!busy || isMe}
              onClick={() => switchTo(m)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "8px 8px", borderRadius: 8, border: "none",
                background: isMe ? "var(--paper, #F3F4F6)" : "transparent",
                cursor: busy || isMe ? "default" : "pointer", textAlign: "start",
                fontFamily: "inherit", opacity: busy && !linked ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!busy && !isMe) e.currentTarget.style.background = "var(--paper, #F9FAFB)"; }}
              onMouseLeave={(e) => { if (!isMe) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, background: memberColorFor({ colorIndex: m.colorIndex }), display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                {ROLE_ICON[m.role] ?? "🙂"}
              </span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--ink, #111827)" }}>
                {m.name || (ROLE_ICON[m.role] ?? "")}
              </span>
              {linked && <span style={{ fontSize: 12, color: "var(--ink-soft, #9CA3AF)" }}>{t.switching}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ borderTop: "1px solid var(--hairline, #E5E7EB)", margin: "6px 4px 2px" }} />
    </div>
  );
}
