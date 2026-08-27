"use client";

/**
 * When a device is in Kids Mode (a kid tapped in via /kids), keep the kid
 * boxed in: a slim bar with "Switch kid" (back to the /kids switcher) and
 * "Exit Kids Mode" (become the parent again). Shown only for a kid session
 * that carries the `gadit-kids-mode` session flag. A focus mode, not a lock.
 * Mounted globally in layout. Gadi 2026-08-22.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

const L: Record<string, { label: string; switchKid: string; exit: string }> = {
  en: { label: "Kids Mode", switchKid: "Switch kid", exit: "Exit" },
  he: { label: "מצב ילדים", switchKid: "החלף ילד", exit: "יציאה" },
  ar: { label: "وضع الأطفال", switchKid: "تبديل الطفل", exit: "خروج" },
  ru: { label: "Детский режим", switchKid: "Сменить ребёнка", exit: "Выход" },
  es: { label: "Modo Niños", switchKid: "Cambiar de niño", exit: "Salir" },
  pt: { label: "Modo Infantil", switchKid: "Trocar de criança", exit: "Sair" },
  fr: { label: "Mode Enfants", switchKid: "Changer d'enfant", exit: "Quitter" },
  de: { label: "Kindermodus", switchKid: "Kind wechseln", exit: "Beenden" },
  cs: { label: "Dětský režim", switchKid: "Přepnout dítě", exit: "Konec" },
  sk: { label: "Detský režim", switchKid: "Prepnúť dieťa", exit: "Koniec" },
  it: { label: "Modalità Bambini", switchKid: "Cambia bambino", exit: "Esci" },
  ja: { label: "キッズモード", switchKid: "子どもを切り替え", exit: "終了" },
  hi: { label: "किड्स मोड", switchKid: "बच्चा बदलें", exit: "बाहर निकलें" },
  am: { label: "የልጆች ሁነታ", switchKid: "ልጅ ቀይር", exit: "ውጣ" },
  uk: { label: "Дитячий режим", switchKid: "Змінити дитину", exit: "Вийти" },
  tr: { label: "Çocuk Modu", switchKid: "Çocuk değiştir", exit: "Çıkış" },
  pl: { label: "Tryb dziecięcy", switchKid: "Zmień dziecko", exit: "Wyjdź" },
  fa: { label: "حالت کودکان", switchKid: "تعویض کودک", exit: "خروج" },
  id: { label: "Mode Anak", switchKid: "Ganti anak", exit: "Keluar" },
  nl: { label: "Kindermodus", switchKid: "Kind wisselen", exit: "Afsluiten" },
  el: { label: "Παιδική λειτουργία", switchKid: "Αλλαγή παιδιού", exit: "Έξοδος" },
  zu: { label: "Imodi Yezingane", switchKid: "Shintsha ingane", exit: "Phuma" },
  vi: { label: "Chế độ trẻ em", switchKid: "Đổi bé", exit: "Thoát" },
  fil: { label: "Kids Mode", switchKid: "Palitan ang bata", exit: "Lumabas" },
  af: { label: "Kindermodus", switchKid: "Wissel kind", exit: "Verlaat" },
  sw: { label: "Hali ya Watoto", switchKid: "Badilisha mtoto", exit: "Ondoka" },
  "zh-CN": { label: "儿童模式", switchKid: "切换孩子", exit: "退出" },
  "zh-TW": { label: "兒童模式", switchKid: "切換孩子", exit: "離開" },
  ko: { label: "키즈 모드", switchKid: "아이 바꾸기", exit: "나가기" },
  th: { label: "โหมดเด็ก", switchKid: "สลับเด็ก", exit: "ออก" },
  bn: { label: "শিশু মোড", switchKid: "শিশু বদলাও", exit: "বেরিয়ে যাও" },
  da: { label: "Børnetilstand", switchKid: "Skift barn", exit: "Afslut" },
  hu: { label: "Gyerekmód", switchKid: "Gyerek váltása", exit: "Kilépés" },
};
function lbl(lang: string) { return L[lang] ?? L.en; }

export function KidsModeBar() {
  const { user, familyRole } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  // Lazy initializer reads the flag synchronously so the bar is correct on the
  // first paint (with familyRole now seeded from cache too), instead of
  // appearing late and shoving the page down (Gadi 2026-08-27).
  const [on, setOn] = useState<boolean>(() => {
    try { return typeof window !== "undefined" && sessionStorage.getItem("gadit-kids-mode") === "1"; } catch { return false; }
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { setOn(sessionStorage.getItem("gadit-kids-mode") === "1"); } catch { setOn(false); }
  }, [user, familyRole]);

  if (!on || familyRole !== "kid" || !user) return null;
  const c = lbl(lang);

  async function exit() {
    if (busy || !user) return;
    setBusy(true);
    try {
      const idToken = await user.getIdToken();
      // Find the owner and become them again.
      const gRes = await fetch("/api/family/switch-member", { headers: { Authorization: `Bearer ${idToken}` } });
      const gJson = (await gRes.json()) as { members?: Array<{ id: string; isOwner: boolean }> };
      const owner = (gJson.members ?? []).find((m) => m.isOwner);
      if (!owner) throw new Error();
      const pRes = await fetch("/api/family/switch-member", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ memberId: owner.id }),
      });
      const pJson = (await pRes.json()) as { token?: string };
      if (!pRes.ok || !pJson.token) throw new Error();
      const { signInWithCustomToken, getAuth } = await import("firebase/auth");
      await signInWithCustomToken(getAuth(), pJson.token);
      try { sessionStorage.removeItem("gadit-kids-mode"); } catch { /* ignore */ }
      router.push(href("/family"));
    } catch {
      setBusy(false);
    }
  }

  return (
    <div dir={dir} role="status"
      style={{ position: "sticky", top: 0, zIndex: 60, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "7px 14px", background: "#F59E0B", color: "#1a1206", fontSize: 14, fontWeight: 700 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span aria-hidden="true">🧒</span>{c.label}</span>
      <button type="button" onClick={() => router.push(href("/kids"))}
        style={{ background: "rgba(0,0,0,0.12)", color: "#1a1206", border: "none", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        {c.switchKid}
      </button>
      <button type="button" onClick={exit} disabled={busy}
        style={{ background: "transparent", color: "#1a1206", border: "1px solid rgba(0,0,0,0.28)", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "inherit" }}>
        {c.exit}
      </button>
    </div>
  );
}
