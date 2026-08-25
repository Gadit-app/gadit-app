"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { memberColorFor, avatarUrl } from "@/lib/family";

type Member = {
  id: string; name: string; role: string; colorIndex: number;
  avatarPhotoUrl: string; avatarId: string; isOwner: boolean; pin: string;
};

const T: Record<string, {
  who: string; signin: string; enterPin: (name: string) => string; wrong: string;
  exit: string; back: string;
}> = {
  ar: { who: "من يستخدم؟", signin: "سجّل الدخول لاستخدام وضع الأطفال", enterPin: (n) => `رمز ${n}`, wrong: "حاول مرة أخرى", exit: "الخروج من وضع الأطفال", back: "رجوع" },
  ru: { who: "Кто пользуется?", signin: "Войдите, чтобы включить детский режим", enterPin: (n) => `Код: ${n}`, wrong: "Попробуй ещё раз", exit: "Выйти из детского режима", back: "Назад" },
  es: { who: "¿Quién lo usa?", signin: "Inicia sesión para usar el Modo Niños", enterPin: (n) => `Código de ${n}`, wrong: "Inténtalo de nuevo", exit: "Salir del Modo Niños", back: "Atrás" },
  pt: { who: "Quem está usando?", signin: "Entre para usar o Modo Infantil", enterPin: (n) => `Código de ${n}`, wrong: "Tente de novo", exit: "Sair do Modo Infantil", back: "Voltar" },
  fr: { who: "Qui l'utilise ?", signin: "Connecte-toi pour utiliser le Mode Enfants", enterPin: (n) => `Code de ${n}`, wrong: "Réessaie", exit: "Quitter le Mode Enfants", back: "Retour" },
  de: { who: "Wer nutzt es?", signin: "Melde dich an, um den Kindermodus zu nutzen", enterPin: (n) => `Code von ${n}`, wrong: "Versuch es nochmal", exit: "Kindermodus beenden", back: "Zurück" },
  cs: { who: "Kdo to používá?", signin: "Přihlas se a používej Dětský režim", enterPin: (n) => `Kód dítěte ${n}`, wrong: "Zkus to znovu", exit: "Ukončit Dětský režim", back: "Zpět" },
  sk: { who: "Kto to používa?", signin: "Prihlás sa a používaj Detský režim", enterPin: (n) => `Kód dieťaťa ${n}`, wrong: "Skús to znova", exit: "Ukončiť Detský režim", back: "Späť" },
  it: { who: "Chi la sta usando?", signin: "Accedi per usare la Modalità Bambini", enterPin: (n) => `Codice di ${n}`, wrong: "Riprova", exit: "Esci dalla Modalità Bambini", back: "Indietro" },
  ja: { who: "だれが使う？", signin: "キッズモードを使うにはサインインしてください", enterPin: (n) => `${n}のコード`, wrong: "もう一度やってみてね", exit: "キッズモードを終了", back: "もどる" },
  hi: { who: "कौन इस्तेमाल कर रहा है?", signin: "किड्स मोड इस्तेमाल करने के लिए साइन इन करें", enterPin: (n) => `${n} का कोड`, wrong: "फिर से कोशिश करो", exit: "किड्स मोड से बाहर निकलें", back: "वापस" },
  am: { who: "ማን እየተጠቀመ ነው?", signin: "የልጆች ሁነታን ለመጠቀም ይግቡ", enterPin: (n) => `የ${n} ኮድ`, wrong: "እንደገና ሞክር", exit: "ከየልጆች ሁነታ ውጣ", back: "ተመለስ" },
  uk: { who: "Хто користується?", signin: "Увійдіть, щоб користуватися дитячим режимом", enterPin: (n) => `Код для ${n}`, wrong: "Спробуй ще раз", exit: "Вийти з дитячого режиму", back: "Назад" },
  tr: { who: "Kim kullanıyor?", signin: "Çocuk Modunu kullanmak için giriş yap", enterPin: (n) => `${n} için kod`, wrong: "Tekrar dene", exit: "Çocuk Modundan çık", back: "Geri" },
  pl: { who: "Kto korzysta?", signin: "Zaloguj się, aby korzystać z trybu dziecięcego", enterPin: (n) => `Kod dla ${n}`, wrong: "Spróbuj ponownie", exit: "Wyjdź z trybu dziecięcego", back: "Wstecz" },
  fa: { who: "چه کسی استفاده می‌کند؟", signin: "برای استفاده از حالت کودکان وارد شوید", enterPin: (n) => `کد ${n}`, wrong: "دوباره امتحان کن", exit: "خروج از حالت کودکان", back: "بازگشت" },
  id: { who: "Siapa yang memakai?", signin: "Masuk untuk memakai Mode Anak", enterPin: (n) => `Kode ${n}`, wrong: "Coba lagi", exit: "Keluar dari Mode Anak", back: "Kembali" },
  nl: { who: "Wie gebruikt dit?", signin: "Log in om de kindermodus te gebruiken", enterPin: (n) => `Code van ${n}`, wrong: "Probeer opnieuw", exit: "Kindermodus afsluiten", back: "Terug" },
  el: { who: "Ποιος το χρησιμοποιεί;", signin: "Συνδέσου για να χρησιμοποιήσεις την παιδική λειτουργία", enterPin: (n) => `Κωδικός του ${n}`, wrong: "Δοκίμασε ξανά", exit: "Έξοδος από την παιδική λειτουργία", back: "Πίσω" },
  zu: { who: "Ubani osebenzisayo?", signin: "Ngena ukuze usebenzise iModi Yezingane", enterPin: (n) => `Ikhodi ka-${n}`, wrong: "Zama futhi", exit: "Phuma kwiModi Yezingane", back: "Emuva" },
  vi: { who: "Ai đang dùng?", signin: "Đăng nhập để dùng Chế độ trẻ em", enterPin: (n) => `Mã của ${n}`, wrong: "Thử lại", exit: "Thoát Chế độ trẻ em", back: "Quay lại" },
  fil: { who: "Sino ang gumagamit?", signin: "Mag-sign in para gamitin ang Kids Mode", enterPin: (n) => `Code ni ${n}`, wrong: "Subukan ulit", exit: "Lumabas sa Kids Mode", back: "Bumalik" },
  af: { who: "Wie gebruik dit?", signin: "Meld aan om Kindermodus te gebruik", enterPin: (n) => `${n} se kode`, wrong: "Probeer weer", exit: "Verlaat Kindermodus", back: "Terug" },
  sw: { who: "Nani anatumia?", signin: "Ingia ili kutumia Hali ya Watoto", enterPin: (n) => `Nambari ya ${n}`, wrong: "Jaribu tena", exit: "Ondoka kwenye Hali ya Watoto", back: "Rudi" },
  "zh-CN": { who: "谁在使用？", signin: "登录以使用儿童模式", enterPin: (n) => `${n} 的密码`, wrong: "再试一次", exit: "退出儿童模式", back: "返回" },
  "zh-TW": { who: "誰在使用？", signin: "登入以使用兒童模式", enterPin: (n) => `${n} 的密碼`, wrong: "再試一次", exit: "離開兒童模式", back: "返回" },
  ko: { who: "누가 사용하나요?", signin: "키즈 모드를 사용하려면 로그인하세요", enterPin: (n) => `${n}의 비밀번호`, wrong: "다시 시도하세요", exit: "키즈 모드 나가기", back: "뒤로" },
  th: { who: "ใครกำลังใช้งาน?", signin: "เข้าสู่ระบบเพื่อใช้โหมดเด็ก", enterPin: (n) => `รหัสของ ${n}`, wrong: "ลองอีกครั้ง", exit: "ออกจากโหมดเด็ก", back: "กลับ" },
  bn: { who: "কে ব্যবহার করছে?", signin: "শিশু মোড ব্যবহার করতে সাইন ইন করো", enterPin: (n) => `${n}-এর কোড`, wrong: "আবার চেষ্টা করো", exit: "শিশু মোড থেকে বেরোও", back: "পিছনে" },
  da: { who: "Hvem bruger den?", signin: "Log ind for at bruge Børnetilstand", enterPin: (n) => `${n}s kode`, wrong: "Prøv igen", exit: "Forlad Børnetilstand", back: "Tilbage" },
  hu: { who: "Ki használja?", signin: "Jelentkezz be a Gyerekmód használatához", enterPin: (n) => `${n} kódja`, wrong: "Próbáld újra", exit: "Kilépés a Gyerekmódból", back: "Vissza" },
  en: {
    who: "Who's using?",
    signin: "Sign in to use Kids Mode",
    enterPin: (n) => `${n}'s code`,
    wrong: "Try again",
    exit: "Exit Kids Mode",
    back: "Back",
  },
  he: {
    who: "מי משתמש עכשיו?",
    signin: "התחבר כדי להשתמש במצב ילדים",
    enterPin: (n) => `הקוד של ${n}`,
    wrong: "נסה שוב",
    exit: "יציאה ממצב ילדים",
    back: "חזרה",
  },
};
function t(lang: string) { return T[lang] ?? T.en; }

export function KidsSwitcherClient() {
  const { user, loading: authLoading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = t(lang);

  const [members, setMembers] = useState<Member[] | null>(null);
  const [selected, setSelected] = useState<Member | null>(null);
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [entering, setEntering] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/switch-member", { headers: { Authorization: `Bearer ${idToken}` } });
      if (!res.ok) return;
      const data = (await res.json()) as { members?: Member[] };
      setMembers(data.members ?? []);
    } catch { setMembers([]); }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const kids = (members ?? []).filter((m) => !m.isOwner);
  const owner = (members ?? []).find((m) => m.isOwner) || null;

  async function enter(m: Member, opts?: { exit?: boolean }) {
    if (!user || entering) return;
    setEntering(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/family/switch-member", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ memberId: m.id }),
      });
      const json = (await res.json()) as { token?: string };
      if (!res.ok || !json.token) throw new Error();
      const { signInWithCustomToken, getAuth } = await import("firebase/auth");
      await signInWithCustomToken(getAuth(), json.token);
      try {
        if (opts?.exit) sessionStorage.removeItem("gadit-kids-mode");
        else sessionStorage.setItem("gadit-kids-mode", "1");
      } catch { /* ignore */ }
      router.push(href("/"));
    } catch {
      setEntering(false);
    }
  }

  function tapKid(m: Member) {
    // No PIN gate (Gadi 2026-08-25): one family device, tap a sibling to enter.
    // A wrong tap only ever helps the other child toward their goals/skins, so
    // the extra keypad step was pure friction.
    void enter(m);
  }

  function pressDigit(d: string) {
    if (!selected) return;
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      if (next === selected.pin) { void enter(selected); }
      else { setShake(true); setTimeout(() => { setShake(false); setPin(""); }, 450); }
    }
  }

  if (!user) {
    // A shared-tablet PWA drops `user` to null for a moment every time it wakes,
    // and often wakes offline. Don't flash the sign-in prompt in that window —
    // wait quietly (Yooniz gotcha: the most painful one to miss).
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    if (authLoading || offline) {
      return (
        <div className="wordbook wb-shell-page" dir={dir} style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontSize: 32, color: "var(--ink-faint, #9CA3AF)" }} aria-busy="true">
          …
        </div>
      );
    }
    return (
      <div className="wordbook wb-shell-page" dir={dir} style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <button type="button" onClick={() => promptLogin({ mode: "signin" })} style={btnTeal}>{c.signin}</button>
      </div>
    );
  }

  return (
    <div className="wordbook wb-shell-page" dir={dir} style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: 34 }}>
      {!selected ? (
        <>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: "var(--ink)", textAlign: "center", letterSpacing: "-0.02em" }}>{c.who}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 26, justifyContent: "center", maxWidth: 720 }}>
            {kids.map((m) => {
              const photo = m.avatarPhotoUrl || avatarUrl(m.avatarId);
              return (
                <button key={m.id} type="button" onClick={() => tapKid(m)} disabled={entering}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: "transparent", border: "none", cursor: entering ? "default" : "pointer", fontFamily: "inherit", width: 130 }}>
                  <span style={{ width: 108, height: 108, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: memberColorFor({ colorIndex: m.colorIndex }), color: "#fff", fontSize: 44, fontWeight: 800, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.35)" }}>
                    {photo ? <img src={photo} alt="" width={108} height={108} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (m.name || "?").charAt(0).toUpperCase()}
                  </span>
                  <span style={{ fontSize: 19, fontWeight: 700, color: "var(--ink)" }}>
                    {m.name || "—"}
                  </span>
                </button>
              );
            })}
          </div>
          {owner && (
            <button type="button" onClick={() => enter(owner, { exit: true })} disabled={entering}
              style={{ marginTop: 10, background: "transparent", border: "none", color: "var(--ink-muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
              {c.exit}
            </button>
          )}
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, animation: shake ? "wb-shake 0.4s" : undefined }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)" }}>{c.enterPin(selected.name || "")}</h2>
          <div style={{ display: "flex", gap: 14 }}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < pin.length ? "#0EA5A5" : "color-mix(in srgb, var(--ink) 18%, transparent)" }} />
            ))}
          </div>
          {/* Always LTR so the digits never mirror to 3-2-1 in an RTL UI. */}
          <div dir="ltr" style={{ display: "grid", gridTemplateColumns: "repeat(3, 74px)", gap: 14 }}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button key={d} type="button" onClick={() => pressDigit(d)} style={keyStyle}>{d}</button>
            ))}
            <button type="button" onClick={() => { setSelected(null); setPin(""); }} style={{ ...keyStyle, fontSize: 15, fontWeight: 700 }}>{c.back}</button>
            <button type="button" onClick={() => pressDigit("0")} style={keyStyle}>0</button>
            <button type="button" onClick={() => setPin((p) => p.slice(0, -1))} style={{ ...keyStyle, fontSize: 24 }}>⌫</button>
          </div>
        </div>
      )}
      <style>{`@keyframes wb-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-9px)}40%,80%{transform:translateX(9px)}}`}</style>
    </div>
  );
}

const btnTeal: React.CSSProperties = { background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 999, padding: "13px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const keyStyle: React.CSSProperties = { width: 74, height: 74, borderRadius: "50%", border: "1px solid var(--rule)", background: "var(--surface)", color: "var(--ink)", fontSize: 28, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
