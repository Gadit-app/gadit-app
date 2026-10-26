"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { memberColorFor, avatarUrl } from "@/lib/family";

type Member = {
  id: string; name: string; role: string; colorIndex: number;
  avatarPhotoUrl: string; avatarId: string; isOwner: boolean;
};

const T: Record<string, {
  who: string; signin: string; exit: string;
}> = {
  ar: { who: "من يستخدم؟", signin: "سجّل الدخول لاستخدام وضع الأطفال", exit: "الخروج من وضع الأطفال" },
  ru: { who: "Кто пользуется?", signin: "Войдите, чтобы включить детский режим", exit: "Выйти из детского режима" },
  es: { who: "¿Quién lo usa?", signin: "Inicia sesión para usar el Modo Niños", exit: "Salir del Modo Niños" },
  pt: { who: "Quem está usando?", signin: "Entre para usar o Modo Infantil", exit: "Sair do Modo Infantil" },
  fr: { who: "Qui l'utilise ?", signin: "Connecte-toi pour utiliser le Mode Enfants", exit: "Quitter le Mode Enfants" },
  de: { who: "Wer nutzt es?", signin: "Melde dich an, um den Kindermodus zu nutzen", exit: "Kindermodus beenden" },
  cs: { who: "Kdo to používá?", signin: "Přihlas se a používej Dětský režim", exit: "Ukončit Dětský režim" },
  sk: { who: "Kto to používa?", signin: "Prihlás sa a používaj Detský režim", exit: "Ukončiť Detský režim" },
  it: { who: "Chi la sta usando?", signin: "Accedi per usare la Modalità Bambini", exit: "Esci dalla Modalità Bambini" },
  ja: { who: "だれが使う？", signin: "キッズモードを使うにはサインインしてください", exit: "キッズモードを終了" },
  hi: { who: "कौन इस्तेमाल कर रहा है?", signin: "किड्स मोड इस्तेमाल करने के लिए साइन इन करें", exit: "किड्स मोड से बाहर निकलें" },
  am: { who: "ማን እየተጠቀመ ነው?", signin: "የልጆች ሁነታን ለመጠቀም ይግቡ", exit: "ከየልጆች ሁነታ ውጣ" },
  uk: { who: "Хто користується?", signin: "Увійдіть, щоб користуватися дитячим режимом", exit: "Вийти з дитячого режиму" },
  tr: { who: "Kim kullanıyor?", signin: "Çocuk Modunu kullanmak için giriş yap", exit: "Çocuk Modundan çık" },
  pl: { who: "Kto korzysta?", signin: "Zaloguj się, aby korzystać z trybu dziecięcego", exit: "Wyjdź z trybu dziecięcego" },
  fa: { who: "چه کسی استفاده می‌کند؟", signin: "برای استفاده از حالت کودکان وارد شوید", exit: "خروج از حالت کودکان" },
  id: { who: "Siapa yang memakai?", signin: "Masuk untuk memakai Mode Anak", exit: "Keluar dari Mode Anak" },
  nl: { who: "Wie gebruikt dit?", signin: "Log in om de kindermodus te gebruiken", exit: "Kindermodus afsluiten" },
  el: { who: "Ποιος το χρησιμοποιεί;", signin: "Συνδέσου για να χρησιμοποιήσεις την παιδική λειτουργία", exit: "Έξοδος από την παιδική λειτουργία" },
  zu: { who: "Ubani osebenzisayo?", signin: "Ngena ukuze usebenzise iModi Yezingane", exit: "Phuma kwiModi Yezingane" },
  xh: {
    who: "Ngubani osebenzisayo?",
    signin: "Ngena ukuze usebenzise isikrini sabantwana ekwabelwana ngaso",
    exit: "Phuma kwisikrini ekwabelwana ngaso",
  },
  nso: {
    who: "Ke mang yo a šomišago?",
    signin: "Tsena gore o šomiše sekirini se se abelanwago sa bana",
    exit: "Tšwa sekirining se se abelanwago",
  },
  tn: {
    who: "Ke mang yo o dirisang?",
    signin: "Tsena go dirisa sekirini sa bana se se abelanwang",
    exit: "Tswa mo sekirining se se abelanwang",
  },
  st: {
    who: "Ke mang ya e sebedisang?",
    signin: "Kena hore o sebedise skrine se arolelanwang sa bana",
    exit: "Tswa skrineng se arolelanwang",
  },
  ts: {
    who: "I mani loyi a tirhisaka?",
    signin: "Nghenani leswaku mi tirhisa xikirini xa vana lexi avelaniwaka",
    exit: "Huma eka xikirini lexi avelaniwaka",
  },
  ss: {
    who: "Ngubani lolisebentisako?",
    signin: "Ngena kute usebentise sikrini sebantfwana lesabelwanako",
    exit: "Phuma esikrinini lesabelwanako",
  },
  ve: {
    who: "Ndi nnyi ane a khou shumisa?",
    signin: "Dzhenani uri ni shumise tshikirini tsha vhana tshine tsha shumiswa nga vhoṱhe",
    exit: "Bvani kha tshikirini tsha vhoṱhe",
  },
  nr: {
    who: "Ngubani osebenzisako?",
    signin: "Ngena bona usebenzise isikrini sabantwana esabelwanako",
    exit: "Phuma esikrinini esabelwanako",
  },
  vi: { who: "Ai đang dùng?", signin: "Đăng nhập để dùng Chế độ trẻ em", exit: "Thoát Chế độ trẻ em" },
  fil: { who: "Sino ang gumagamit?", signin: "Mag-sign in para gamitin ang Kids Mode", exit: "Lumabas sa Kids Mode" },
  af: { who: "Wie gebruik dit?", signin: "Meld aan om Kindermodus te gebruik", exit: "Verlaat Kindermodus" },
  sw: { who: "Nani anatumia?", signin: "Ingia ili kutumia Hali ya Watoto", exit: "Ondoka kwenye Hali ya Watoto" },
  "zh-CN": { who: "谁在使用？", signin: "登录以使用儿童模式", exit: "退出儿童模式" },
  "zh-TW": { who: "誰在使用？", signin: "登入以使用兒童模式", exit: "離開兒童模式" },
  ko: { who: "누가 사용하나요?", signin: "키즈 모드를 사용하려면 로그인하세요", exit: "키즈 모드 나가기" },
  th: { who: "ใครกำลังใช้งาน?", signin: "เข้าสู่ระบบเพื่อใช้โหมดเด็ก", exit: "ออกจากโหมดเด็ก" },
  bn: { who: "কে ব্যবহার করছে?", signin: "শিশু মোড ব্যবহার করতে সাইন ইন করো", exit: "শিশু মোড থেকে বেরোও" },
  da: { who: "Hvem bruger den?", signin: "Log ind for at bruge Børnetilstand", exit: "Forlad Børnetilstand" },
  hu: { who: "Ki használja?", signin: "Jelentkezz be a Gyerekmód használatához", exit: "Kilépés a Gyerekmódból" },
  en: {
    who: "Who's using?",
    signin: "Sign in to use the shared kids screen",
    exit: "Exit shared screen",
  },
  he: {
    who: "מי משתמש עכשיו?",
    signin: "צריך להתחבר כדי להשתמש במסך המשותף",
    exit: "יציאה מהמסך המשותף",
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
    </div>
  );
}

const btnTeal: React.CSSProperties = { background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 999, padding: "13px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
