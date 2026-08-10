"use client";

/**
 * /join?code=XXXXXX — landing for paired devices.
 *
 * If `?code=` is present, auto-submits via POST /api/family/pair/redeem,
 * then calls `signInWithCustomToken` on the returned token. Persisted
 * via Firebase Auth's IndexedDB (the SDK does this by default), so the
 * device stays signed in across refreshes and reboots.
 *
 * If no code is in the URL, shows an input box. After successful pair,
 * navigates to / (the main Gadit app) — the user can now search words
 * with their own notebook + history.
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

const COPY: Record<string, {
  title: string;
  sub: string;
  inputLabel: string;
  submit: string;
  joining: string;
  success: string;
  errInvalid: string;
  errExpired: string;
  errNotFound: string;
  errGeneric: string;
}> = {
  he: {
    title: "כניסה למשפחה",
    sub: "הקלידו את הקוד בן 6 הספרות שההורה ייצר",
    inputLabel: "קוד 6 ספרות",
    submit: "המשך",
    joining: "מתחבר...",
    success: "מחובר! מעביר אתכם ל-Gadit...",
    errInvalid: "הקוד חייב להיות 6 ספרות",
    errExpired: "הקוד פג. בקשו מההורה לייצר חדש.",
    errNotFound: "הקוד לא קיים",
    errGeneric: "משהו השתבש. נסו שוב.",
  },
  en: {
    title: "Join a family",
    sub: "Type the 6-digit code your parent generated",
    inputLabel: "6-digit code",
    submit: "Continue",
    joining: "Joining...",
    success: "Joined! Taking you to Gadit...",
    errInvalid: "Code must be 6 digits",
    errExpired: "Code expired. Ask your parent to generate a new one.",
    errNotFound: "Code not found",
    errGeneric: "Something went wrong. Please try again.",
  },
  zu: {
    title: "Joyina umndeni",
    sub: "Bhala ikhodi enezinombolo ezingu-6 eyenziwe umzali wakho",
    inputLabel: "Ikhodi enezinombolo ezingu-6",
    submit: "Qhubeka",
    joining: "Iyajoyina...",
    success: "Ujoyinile! Sikuyisa ku-Gadit...",
    errInvalid: "Ikhodi kumele ibe nezinombolo ezingu-6",
    errExpired: "Ikhodi iphelelwe yisikhathi. Cela umzali wakho enze entsha.",
    errNotFound: "Ikhodi ayitholakalanga",
    errGeneric: "Kukhona okungahambanga kahle. Sicela uzame futhi.",
  },
  el: {
    title: "Μπες σε μια οικογένεια",
    sub: "Πληκτρολόγησε τον 6ψήφιο κωδικό που δημιούργησε ο γονιός σου",
    inputLabel: "6ψήφιος κωδικός",
    submit: "Συνέχεια",
    joining: "Σύνδεση...",
    success: "Μπήκες! Σε πάμε στο Gadit...",
    errInvalid: "Ο κωδικός πρέπει να έχει 6 ψηφία",
    errExpired: "Ο κωδικός έληξε. Ζήτησε από τον γονιό σου να δημιουργήσει νέο.",
    errNotFound: "Ο κωδικός δεν βρέθηκε",
    errGeneric: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
  },
  hi: {
    title: "परिवार में जुड़ें",
    sub: "अपने माता-पिता का बनाया 6-अंकों का कोड डालें",
    inputLabel: "6-अंकों का कोड",
    submit: "आगे बढ़ें",
    joining: "जुड़ रहे हैं...",
    success: "जुड़ गए! Gadit पर ले जा रहे हैं...",
    errInvalid: "कोड में 6 अंक होने चाहिए",
    errExpired: "कोड समाप्त। अपने माता-पिता से नया कोड बनवाएँ।",
    errNotFound: "कोड नहीं मिला",
    errGeneric: "कुछ ग़लत हुआ। फिर से कोशिश करें।",
  },
  am: {
    title: "ቤተሰብ ጋር ተቀላቀሉ",
    sub: "ወላጃችሁ ያዘጋጀውን ባለ 6 አሃዝ ኮድ አስገቡ",
    inputLabel: "ባለ 6 አሃዝ ኮድ",
    submit: "ቀጥሉ",
    joining: "እየተቀላቀላችሁ ነው...",
    success: "ተቀላቅላችኋል! ወደ Gadit እየወሰድናችሁ ነው...",
    errInvalid: "ኮዱ 6 አሃዝ መሆን አለበት",
    errExpired: "ኮዱ ጊዜው አልፎበታል። ወላጃችሁ አዲስ ኮድ እንዲያዘጋጅ ጠይቁ።",
    errNotFound: "ኮዱ አልተገኘም",
    errGeneric: "የሆነ ስህተት ተፈጥሯል። እንደገና ሞክሩ።",
  },
};

export function JoinClient() {
  const router = useRouter();
  const search = useSearchParams();
  const { lang, dir } = useLang();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;

  const [code, setCode] = useState<string>(search.get("code") ?? "");
  const [status, setStatus] = useState<"idle" | "joining" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-submit if a code came in via the QR link.
  useEffect(() => {
    const initial = search.get("code");
    if (initial && /^\d{6}$/.test(initial)) {
      void submit(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(c6: string) {
    if (!/^\d{6}$/.test(c6)) {
      setErrorMsg(c.errInvalid);
      setStatus("error");
      return;
    }
    setStatus("joining");
    setErrorMsg("");
    try {
      const res = await fetch("/api/family/pair/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c6 }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "code_expired") setErrorMsg(c.errExpired);
        else if (data.error === "code_not_found") setErrorMsg(c.errNotFound);
        else setErrorMsg(c.errGeneric);
        setStatus("error");
        return;
      }
      // Sign in with the custom token. Firebase persists via IndexedDB.
      await signInWithCustomToken(firebaseAuth, data.token);
      setStatus("success");
      // Land on the main app — kids/parents both use the dictionary
      // search as their primary surface for v1.
      setTimeout(() => router.push(href("/")), 600);
    } catch (e) {
      console.error("redeem failed:", e);
      setErrorMsg(c.errGeneric);
      setStatus("error");
    }
  }

  return (
    <div className="wordbook wb-family-page" dir={dir}>
      <main className="wb-family-main">
        <header className="wb-family-header">
          <h1 className="wb-family-title">{c.title}</h1>
          <p className="wb-family-sub">{c.sub}</p>
        </header>

        <div className="wb-family-pair-card">
          {status === "success" ? (
            <div className="wb-family-join-success">{c.success}</div>
          ) : (
            <>
              <label className="wb-family-field" style={{ width: "100%" }}>
                <span className="wb-family-field-label">{c.inputLabel}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="wb-family-code-input"
                  autoFocus
                  dir="ltr"
                />
              </label>
              {errorMsg && <div className="wb-family-error">{errorMsg}</div>}
              <button
                type="button"
                className="wb-family-cta"
                onClick={() => submit(code)}
                disabled={status === "joining" || code.length !== 6}
              >
                {status === "joining" ? c.joining : c.submit}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
