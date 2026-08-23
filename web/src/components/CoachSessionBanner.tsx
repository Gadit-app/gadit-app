"use client";

/**
 * When a coach has entered a student's profile (a session minted by
 * /api/coach/enter, carrying a `coach: true` token claim), show a slim fixed
 * bar with a clear way back: "Exit coaching" signs out of the student and
 * returns to /coach. Mounted globally in layout; renders nothing for ordinary
 * sessions. Gadi 2026-08-22.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

const LABEL: Record<string, { coaching: (name: string) => string; exit: string }> = {
  en: { coaching: (n) => (n ? `Coaching ${n}` : "Coaching a student"), exit: "Exit coaching" },
  he: { coaching: (n) => (n ? `מאמן את ${n}` : "מאמן תלמיד"), exit: "יציאה מהאימון" },
  ar: { coaching: (n) => (n ? `تدريب ${n}` : "تدريب طالب"), exit: "إنهاء التدريب" },
  ru: { coaching: (n) => (n ? `Занятия с ${n}` : "Занятия с учеником"), exit: "Выйти из режима наставника" },
  es: { coaching: (n) => (n ? `Acompañando a ${n}` : "Acompañando a un estudiante"), exit: "Salir del acompañamiento" },
  pt: { coaching: (n) => (n ? `Acompanhando ${n}` : "Acompanhando um aluno"), exit: "Sair do acompanhamento" },
  fr: { coaching: (n) => (n ? `Accompagnement de ${n}` : "Accompagnement d'un élève"), exit: "Quitter l'accompagnement" },
  de: { coaching: (n) => (n ? `Begleitung von ${n}` : "Begleitung einer Schülerin oder eines Schülers"), exit: "Begleitung beenden" },
  cs: { coaching: (n) => (n ? `Vedení ${n}` : "Vedení studenta"), exit: "Ukončit vedení" },
  sk: { coaching: (n) => (n ? `Vedenie ${n}` : "Vedenie študenta"), exit: "Ukončiť vedenie" },
  it: { coaching: (n) => (n ? `Segui ${n}` : "Segui uno studente"), exit: "Esci dall'affiancamento" },
  ja: { coaching: (n) => (n ? `${n} さんをサポート中` : "生徒をサポート中"), exit: "サポートを終了する" },
  hi: { coaching: (n) => (n ? `${n} को कोचिंग दे रहे हैं` : "एक छात्र को कोचिंग दे रहे हैं"), exit: "कोचिंग से बाहर निकलें" },
  am: { coaching: (n) => (n ? `${n}ን በማሰልጠን ላይ` : "ተማሪ በማሰልጠን ላይ"), exit: "ከማሰልጠን ውጣ" },
  uk: { coaching: (n) => (n ? `Наставництво для ${n}` : "Наставництво для учня"), exit: "Вийти з наставництва" },
  tr: { coaching: (n) => (n ? `${n} koçluğu` : "Bir öğrenciye koçluk"), exit: "Koçluktan çık" },
  pl: { coaching: (n) => (n ? `Prowadzisz ${n}` : "Prowadzisz ucznia"), exit: "Zakończ prowadzenie" },
  fa: { coaching: (n) => (n ? `مربیگری ${n}` : "مربیگری یک دانش‌آموز"), exit: "خروج از مربیگری" },
  id: { coaching: (n) => (n ? `Membimbing ${n}` : "Membimbing seorang siswa"), exit: "Keluar dari bimbingan" },
  nl: { coaching: (n) => (n ? `${n} begeleiden` : "Een leerling begeleiden"), exit: "Begeleiding afsluiten" },
  el: { coaching: (n) => (n ? `Καθοδήγηση του/της ${n}` : "Καθοδήγηση ενός μαθητή"), exit: "Έξοδος από την καθοδήγηση" },
  zu: { coaching: (n) => (n ? `Ukuqeqesha u-${n}` : "Ukuqeqesha umfundi"), exit: "Phuma ekuqeqesheni" },
  vi: { coaching: (n) => (n ? `Đang kèm cặp ${n}` : "Đang kèm cặp một học viên"), exit: "Thoát kèm cặp" },
  fil: { coaching: (n) => (n ? `Kino-coach si ${n}` : "Nagko-coach ng isang estudyante"), exit: "Lumabas sa coaching" },
  af: { coaching: (n) => (n ? `Afrig ${n}` : "Afrig 'n leerder"), exit: "Verlaat afrigting" },
  sw: { coaching: (n) => (n ? `Kumfundisha ${n}` : "Kumfundisha mwanafunzi"), exit: "Ondoka kwenye ufundishaji" },
  "zh-CN": { coaching: (n) => (n ? `正在辅导 ${n}` : "正在辅导一名学生"), exit: "退出辅导" },
  "zh-TW": { coaching: (n) => (n ? `正在輔導 ${n}` : "正在輔導一名學生"), exit: "退出輔導" },
  ko: { coaching: (n) => (n ? `${n} 코칭 중` : "학생 코칭 중"), exit: "코칭 종료" },
  th: { coaching: (n) => (n ? `กำลังโค้ช ${n}` : "กำลังโค้ชนักเรียนคนหนึ่ง"), exit: "ออกจากการโค้ช" },
  bn: { coaching: (n) => (n ? `${n}-কে কোচিং করছেন` : "একজন শিক্ষার্থীকে কোচিং করছেন"), exit: "কোচিং থেকে বেরিয়ে যান" },
  da: { coaching: (n) => (n ? `Coacher ${n}` : "Coacher en elev"), exit: "Afslut coaching" },
  hu: { coaching: (n) => (n ? `${n} korrepetálása` : "Egy tanuló korrepetálása"), exit: "Kilépés a korrepetálásból" },
};
function lbl(lang: string) { return LABEL[lang] ?? LABEL.en; }

export function CoachSessionBanner() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const [isCoach, setIsCoach] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setIsCoach(false); return; }
      try {
        const res = await user.getIdTokenResult();
        if (cancelled) return;
        setIsCoach(res.claims?.coach === true);
        setName(user.displayName || "");
      } catch {
        if (!cancelled) setIsCoach(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!isCoach) return null;
  const c = lbl(lang);

  async function exit() {
    try {
      const { signOut, getAuth } = await import("firebase/auth");
      await signOut(getAuth());
    } catch { /* ignore */ }
    router.push("/coach");
  }

  return (
    <div
      dir={dir}
      role="status"
      style={{
        position: "sticky", top: 0, zIndex: 60, width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
        padding: "8px 16px", background: "#7C3AED", color: "#fff",
        fontSize: 14, fontWeight: 600,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
        <span aria-hidden="true">🎓</span>{c.coaching(name)}
      </span>
      <button
        type="button"
        onClick={exit}
        style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
      >
        {c.exit}
      </button>
    </div>
  );
}
