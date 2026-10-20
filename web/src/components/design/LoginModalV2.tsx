"use client";

/**
 * LoginModal — CrispTech rethemed.
 *
 * Same auth flow as before (Google + email/password, signup age gate,
 * password policy, Firebase error mapping). Visual language is the
 * wordbook system: clean white card, teal accent, no electric-blue
 * gradients. Matches the home / pricing / features chrome.
 */

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { v2 } from "@/lib/i18n-v2";
import { detectInAppBrowser } from "@/lib/in-app-browser";
import { loginHelp } from "@/lib/login-help-copy";
import { useNativeAuthAvailable } from "@/lib/use-native-app";
import { isNativeAuthCancel } from "@/lib/native-auth";

/** Every failed sign-in is noted (address, error code, page; never the
 *  password) so a locked-out person shows up in /admin/auth-errors before
 *  they have to complain (Gadi 2026-10-10). Fire-and-forget. */
function logAuthError(email: string, code: string, mode: string, lang: string) {
  try {
    void fetch("/api/auth/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, mode, lang, page: window.location.host + window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* never block sign-in */ }
}

type Mode = "signin" | "signup";

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.34C4.68 5.17 6.66 3.58 9 3.58z" />
    </svg>
  );
}

// Apple logo for the Sign in with Apple button (Apple HIG: white logo on a
// black button, same size as the other sign-in buttons).
function AppleLogo() {
  return (
    <svg width="16" height="19" viewBox="0 0 814 1000" aria-hidden="true" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M1 9s2.7-5 8-5 8 5 8 5-2.7 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 9s2.7-5 8-5c1.5 0 2.8.4 3.9 1M16 9s-2.7 5-8 5c-1.5 0-2.8-.4-3.9-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 16 16 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "gd-spin 0.7s linear infinite" }} aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <path d="M12 7a5 5 0 0 0-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// "Joining a family?" entry to the pairing-code screen. Critical on iOS: a
// child who paired in Safari and then "Add to Home Screen" gets a standalone
// PWA with ISOLATED storage — the Safari login does not carry over, so the
// installed app opens logged out. The fix is to let them pair from INSIDE the
// installed app: this link routes to /join where they enter the 6-digit code,
// and the signInWithCustomToken session then persists in the PWA's own store.
// he + en authored; every other language falls back to en (local dict, avoids
// touching the 12 full v2 locales). Gadi 2026-09-15.
const JOIN_FAMILY_CTA: Record<string, string> = {
  en: "Joining a family? Enter your code",
  he: "מצטרפ/ת למשפחה? הזנת קוד",
  ar: "الانضمام إلى عائلة؟ أدخل الرمز",
  ru: "Присоединяетесь к семье? Введите код",
  es: "¿Te unes a una familia? Introduce tu código",
  fr: "Rejoindre une famille ? Entre ton code",
  pt: "Entrando em uma família? Digite seu código",
  de: "Einer Familie beitreten? Code eingeben",
  cs: "Připojuješ se k rodině? Zadej svůj kód",
  sk: "Pripájaš sa k rodine? Zadaj svoj kód",
  it: "Entri in una famiglia? Inserisci il tuo codice",
  ja: "家族に参加しますか？コードを入力",
  hi: "परिवार से जुड़ रहे हैं? अपना कोड डालें",
  am: "ቤተሰብ ለመቀላቀል? ኮዱን ያስገቡ",
  uk: "Приєднуєтеся до родини? Введіть код",
  tr: "Bir aileye mi katılıyorsun? Kodunu gir",
  pl: "Dołączasz do rodziny? Wpisz swój kod",
  fa: "به یک خانواده می‌پیوندید؟ کد خود را وارد کنید",
  id: "Bergabung dengan keluarga? Masukkan kodemu",
  nl: "Sluit je je aan bij een gezin? Voer je code in",
  el: "Μπαίνεις σε οικογένεια; Βάλε τον κωδικό σου",
  zu: "Ujoyina umndeni? Faka ikhodi yakho",
  xh: "Ujoyina usapho? Faka ikhowudi yakho",
  nso: "O tsena lapeng? Tsenya khoutu ya gago",
  tn: "A o tsena mo lelapeng? Tsenya khoutu ya gago",
  st: "O kena lelapeng? Kenya khoutu ya hao",
  ts: "Xana u nghena endyangwini? Tsala khodi ya wena",
  ss: "Ujoyina umndeni? Faka ikhodi yakho",
  ve: "Ni khou dzhena kha muṱa? Dzhenisani khoudu yaṋu",
  nr: "Ujoyina umndeni? Tlola ikhowudi yakho",
  vi: "Tham gia một gia đình? Nhập mã của bạn",
  fil: "Sasali sa isang pamilya? Ilagay ang iyong code",
  af: "Sluit jy by 'n gesin aan? Voer jou kode in",
  sw: "Unajiunga na familia? Weka msimbo wako",
  "zh-CN": "要加入家庭？输入你的代码",
  "zh-TW": "要加入家庭？輸入你的代碼",
  ko: "가족에 참여하나요? 코드를 입력하세요",
  th: "จะเข้าร่วมครอบครัวใช่ไหม ใส่รหัสของคุณ",
  bn: "পরিবারে যোগ দিচ্ছ? তোমার কোড লেখো",
  da: "Skal du være med i en familie? Indtast din kode",
  hu: "Családhoz csatlakozol? Add meg a kódodat",
};

// Shown when signup is rejected for a blocked (relay/disposable) email domain.
const BLOCKED_SIGNUP_MSG: Record<string, string> = {
  en: "Please sign up with a regular email address.",
  he: "כדי להירשם יש להשתמש בכתובת אימייל רגילה.",
  ar: "يرجى التسجيل باستخدام عنوان بريد إلكتروني عادي.",
  ru: "Пожалуйста, зарегистрируйтесь с обычным адресом электронной почты.",
  es: "Regístrate con una dirección de correo electrónico normal.",
  pt: "Faça o cadastro com um endereço de e-mail comum.",
  fr: "Veuillez vous inscrire avec une adresse e-mail classique.",
  de: "Bitte registriere dich mit einer normalen E-Mail-Adresse.",
  cs: "Pro registraci použijte běžnou e-mailovou adresu.",
  sk: "Na registráciu použite bežnú e-mailovú adresu.",
  it: "Per registrarti usa un normale indirizzo email.",
  ja: "通常のメールアドレスで登録してください。",
  hi: "कृपया किसी सामान्य ईमेल पते से साइन अप करें।",
  am: "እባክዎ በመደበኛ የኢሜይል አድራሻ ይመዝገቡ።",
  uk: "Будь ласка, зареєструйтеся зі звичайною адресою електронної пошти.",
  tr: "Lütfen normal bir e-posta adresiyle kaydolun.",
  pl: "Aby się zarejestrować, użyj zwykłego adresu e-mail.",
  fa: "لطفاً با یک نشانی ایمیل معمولی ثبت‌نام کنید.",
  id: "Silakan daftar dengan alamat email biasa.",
  nl: "Meld je aan met een gewoon e-mailadres.",
  el: "Κάνε εγγραφή με μια κανονική διεύθυνση email.",
  zu: "Sicela ubhalise ngekheli le-imeyili elijwayelekile.",
  xh: "Nceda ubhalise ngedilesi ye-imeyile eqhelekileyo.",
  nso: "Hle ingwadiše ka aterese ya imeile ya tlwaelo.",
  tn: "Tsweetswee ikwadise ka aterese ya imeile e e tlwaelegileng.",
  st: "Ka kopo ngodisa ka aterese ya imeile e tlwaelehileng.",
  ts: "Hi kombela mi tsarisa hi adirese ya imeyili ya ntolovelo.",
  ss: "Sicela ubhalise nge-imeyili lejwayelekile.",
  ve: "Ri humbela ni ḓiṅwalise nga imeiḽi ya misi yoṱhe.",
  nr: "Sibawa ubhalise nge-imeyili ejayelekileko.",
  vi: "Vui lòng đăng ký bằng một địa chỉ email thông thường.",
  fil: "Mag-sign up gamit ang isang karaniwang email address.",
  af: "Registreer asseblief met 'n gewone e-posadres.",
  sw: "Tafadhali jisajili kwa anwani ya kawaida ya barua pepe.",
  "zh-CN": "请使用常规邮箱地址注册。",
  "zh-TW": "請使用一般的電子郵件地址註冊。",
  ko: "일반 이메일 주소로 가입해 주세요.",
  th: "โปรดสมัครด้วยที่อยู่อีเมลทั่วไป",
  bn: "অনুগ্রহ করে একটি সাধারণ ইমেইল ঠিকানা দিয়ে সাইন আপ করুন।",
  da: "Tilmeld dig med en almindelig e-mailadresse.",
  hu: "Kérjük, egy szokásos e-mail-címmel regisztrálj.",
};

export function LoginModalV2() {
  const {
    showLoginModal,
    setShowLoginModal,
    loginReason,
    loginMode,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
  } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const isRtl = dir === "rtl";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Refs for focus management on validation errors. When submit fails
  // due to an invalid field we move focus to that field so a keyboard
  // user (or a screen reader) can see and correct the problem without
  // hunting. Gadi 2026-06-26 audit fix A2.
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string>("");
  // A non-v2 error message (e.g. blocked signup domain) shown in the same slot,
  // so we don't have to add a key across every language in i18n-v2.
  const [localError, setLocalError] = useState<string>("");
  // Wrong password: a way out instead of a bare error (Gadi 2026-10-10).
  const [wrongPwd, setWrongPwd] = useState(false);
  const [notice, setNotice] = useState("");
  const lh = loginHelp(lang);
  // COPPA / GDPR self-attestation — we can't verify age, but we make
  // the user click that they're old enough. Industry-standard minimum.
  const [ageAccepted, setAgeAccepted] = useState(false);
  // A tap on Google / Apple / sign up before the 18+ box is ticked shows a
  // red line right under the box and scrolls to it (2026-10-20: the buttons
  // were disabled, a tap did nothing on a phone, and a college mailing got
  // 87 clicks and no signup).
  const [ageNudge, setAgeNudge] = useState(0);
  const ageRef = useRef<HTMLLabelElement | null>(null);
  const nudgeAge = () => {
    setAgeNudge((n) => n + 1);
    try { ageRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }); } catch { /* fine */ }
  };
  // Instagram/Facebook/TikTok in-app webview detection. Google's OAuth
  // refuses to authorise embedded user-agents, and the popup is
  // blocked anyway, so a "Continue with Google" button in this context
  // sends the user into a dead-end loop. We hide it and show an
  // explainer pointing the user at email signup or "open in browser".
  // SSR-safe: stays null until first client render so the server-side
  // markup matches the initial client render. Once detected, it sticks.
  const [inAppName, setInAppName] = useState<string | null>(null);
  // Inside the Gadit iOS app: Sign in with Apple (App Review 4.8), run by the
  // app's native sheet, next to Google (also native there). False everywhere
  // else, so the web and Android never show the Apple button.
  const appleAvailable = useNativeAuthAvailable("apple");

  useEffect(() => {
    setInAppName(detectInAppBrowser());
  }, []);

  useEffect(() => {
    if (showLoginModal) {
      setMode(loginMode);
      setBusy(false);
      setErrorKey("");
      setLocalError("");
      setWrongPwd(false);
      setNotice("");
      setShowPwd(false);
      setAgeAccepted(false);
    }
  }, [showLoginModal, loginMode]);

  useEffect(() => {
    if (!showLoginModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowLoginModal(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLoginModal, setShowLoginModal]);

  // After a validation/server error, move focus to the right input so
  // keyboard + screen-reader users find the problem instantly. Gadi
  // 2026-06-26 audit fix A2: WCAG focus-on-error.
  useEffect(() => {
    if (!errorKey) return;
    // Password-policy + wrong-credentials live on the password field;
    // wrong-email + email-already-in-use live on the email field; the
    // catch-all generic errors go to email (which is the entry point
    // a recovering user usually wants to edit first).
    if (
      errorKey === "loginErrorWeakPassword" ||
      errorKey === "loginErrorWrongCredentials"
    ) {
      passwordRef.current?.focus();
    } else if (
      errorKey === "loginErrorInvalidEmail" ||
      errorKey === "loginErrorEmailInUse" ||
      errorKey === "loginErrorGeneric"
    ) {
      emailRef.current?.focus();
    }
  }, [errorKey]);

  if (!showLoginModal) return null;

  // Signup-mode error mapping. The earlier version collapsed
  // 'email-already-in-use' into the generic message to avoid the
  // signup form becoming an enumeration oracle. In practice that
  // pattern caused real users (e.g. someone signing up their
  // spouse) to get stuck on 'Something went wrong' when the actual
  // issue was simply that they'd already tried with that email.
  // Surfacing the specific case here (with a 'try signing in'
  // hint) gives them a way out; the enumeration risk is the same
  // as the signin error already exposing 'wrong email or password'.
  function mapAuthError(msg: string, mode: Mode): string {
    // Lowercase the haystack so we catch both the new SDK kebab-case
    // ('auth/invalid-credential') and the legacy REST UPPER_SNAKE
    // ('INVALID_LOGIN_CREDENTIALS', 'EMAIL_NOT_FOUND', 'INVALID_PASSWORD').
    // Firebase v10 ships an enumeration-protected unified error code
    // for wrong-password + user-not-found that earlier versions
    // distinguished — both must funnel to "Wrong email or password".
    const m = msg.toLowerCase();
    if (mode === "signup") {
      if (m.includes("email-already-in-use") || m.includes("email_exists")) return "loginErrorEmailInUse";
      if (m.includes("weak-password") || m.includes("weak_password")) return "loginErrorWeakPassword";
      if (m.includes("invalid-email") || m.includes("invalid_email")) return "loginErrorInvalidEmail";
      return "loginErrorGeneric";
    }
    if (
      m.includes("user-not-found") ||
      m.includes("user_not_found") ||
      m.includes("wrong-password") ||
      m.includes("wrong_password") ||
      m.includes("invalid-credential") ||
      m.includes("invalid_credential") ||
      m.includes("invalid-login-credentials") ||
      m.includes("invalid_login_credentials") ||
      m.includes("email-not-found") ||
      m.includes("email_not_found") ||
      m.includes("invalid-password") ||
      m.includes("invalid_password") ||
      m.includes("missing-password") ||
      m.includes("missing_password")
    ) {
      return "loginErrorWrongCredentials";
    }
    if (m.includes("invalid-email") || m.includes("invalid_email")) return "loginErrorInvalidEmail";
    if (m.includes("too-many-requests") || m.includes("too_many_attempts")) return "loginErrorGeneric";
    if (m.includes("network-request-failed") || m.includes("network_error")) return "loginErrorGeneric";
    return "loginErrorGeneric";
  }

  async function handleGoogle() {
    if (mode === "signup" && !ageAccepted) {
      nudgeAge();
      return;
    }
    setBusy(true);
    setErrorKey("");
    try { sessionStorage.setItem("gadit-auth-flow", String(Date.now())); } catch { /* fine */ }
    try {
      await signInWithGoogle();
    } catch (err) {
      if (isNativeAuthCancel(err)) return; // closed the iOS sheet: nothing to say
      const msg = err instanceof Error ? err.message : "google";
      logAuthError("", msg, "google", lang);
      if (msg.includes("account-exists-with-different-credential")) setErrorKey("loginErrorEmailInUse");
      else setErrorKey("loginErrorGoogleFailed");
    } finally {
      setBusy(false);
    }
  }

  async function handleApple() {
    if (mode === "signup" && !ageAccepted) {
      nudgeAge();
      return;
    }
    setBusy(true);
    setErrorKey("");
    setLocalError("");
    try {
      await signInWithApple();
    } catch (err) {
      if (isNativeAuthCancel(err)) return;
      const msg = err instanceof Error ? err.message : "apple";
      logAuthError("", msg, "apple", lang);
      // Same email already registered another way (one account per email):
      // "Email already in use. Try logging in."
      if (msg.includes("account-exists-with-different-credential")) setErrorKey("loginErrorEmailInUse");
      else setLocalError(v2(lang, "loginErrorGoogleFailed").replace("Google", "Apple"));
    } finally {
      setBusy(false);
    }
  }

  // Firebase's default 6-char minimum accepts "111111" — bumped to 8
  // with letter+digit mix. Signup only; signin must accept legacy 6-char.
  function validateSignupPassword(pw: string): string | null {
    if (pw.length < 8) return "loginErrorWeakPassword";
    if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "loginErrorWeakPassword";
    return null;
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setErrorKey("");
    if (mode === "signup") {
      if (!ageAccepted) {
        nudgeAge();
        return;
      }
      const policyErr = validateSignupPassword(password);
      if (policyErr) {
        setErrorKey(policyErr);
        return;
      }
    }
    setLocalError("");
    setWrongPwd(false);
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signin") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("blocked-signup-domain")) {
        setLocalError(BLOCKED_SIGNUP_MSG[lang] ?? BLOCKED_SIGNUP_MSG.en);
        setBusy(false);
        return;
      }
      // Log the raw Firebase error to the console so we can debug
      // production sign-up failures by asking the user to share their
      // browser console — without exposing the raw text in the UI.
      console.error("[auth] mode=" + mode + " error:", msg);
      logAuthError(email.trim(), msg, mode, lang);
      const mapped = mapAuthError(msg, mode);
      if (mapped === "loginErrorWrongCredentials" && mode === "signin") setWrongPwd(true);
      else setErrorKey(mapped);
    } finally {
      setBusy(false);
    }
  }

  // "Email me a sign-in link": in by email, no password. Only works for an
  // existing account (the server checks, and answers the same either way).
  async function sendMagicLink() {
    const addr = email.trim();
    if (!addr) {
      setWrongPwd(false);
      setErrorKey("loginForgotPasswordEnterEmail");
      return;
    }
    setBusy(true);
    setErrorKey("");
    try {
      await fetch("/api/auth/email-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addr, lang, next: window.location.pathname + window.location.search }),
      });
      setWrongPwd(false);
      setNotice(lh.magicSent.replace("{email}", addr));
    } catch {
      setErrorKey("loginResetError");
    } finally {
      setBusy(false);
    }
  }

  async function sendReset() {
    if (!email.trim()) {
      setWrongPwd(false);
      setErrorKey("loginForgotPasswordEnterEmail");
      return;
    }
    setBusy(true);
    setErrorKey("");
    try {
      await sendPasswordReset(email.trim(), lang);
      setWrongPwd(false);
      setNotice("");
      setErrorKey("loginResetSent");
    } catch (err) {
      console.error("[auth] password-reset error:", err);
      setErrorKey("loginResetError");
    } finally {
      setBusy(false);
    }
  }

  const titleKey = mode === "signup" ? "loginCreateAccount" : "loginWelcomeBack";
  const submitKey = busy
    ? mode === "signup" ? "loginCreatingAccount" : "loginSigningIn"
    : mode === "signup" ? "loginSubmitSignUp" : "loginSubmitSignIn";
  const toggleKey = mode === "signup" ? "loginSwitchToSignIn" : "loginSwitchToSignUp";

  return (
    <div
      className="wordbook wb-login-backdrop"
      data-login-modal=""
      onClick={() => setShowLoginModal(false)}
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      <div
        className="wb-login-card"
        style={{ textAlign: isRtl ? "right" : "left" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setShowLoginModal(false)}
          aria-label={v2(lang, "loginCloseAria")}
          className="wb-login-close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        <div className="wb-login-logo">
          Gad<span className="wb-login-logo-it">it</span>
        </div>

        <h2 className="wb-login-title">{v2(lang, titleKey)}</h2>

        {loginReason && <p className="wb-login-reason">{loginReason}</p>}

        {/* Age + terms gate, promoted ABOVE the auth buttons in signup
            mode. The previous layout had it tucked at the bottom of the
            email form, so a user who clicked the Google button first
            (the natural visual order) got bounced with an opaque
            'please accept terms' error pointing at a control they
            hadn't seen yet. With the checkbox up here it's the first
            thing a signing-up user reads, and both auth paths visibly
            depend on it (the Google button + email submit both show
            their disabled state until it's checked). */}
        {mode === "signup" && (
          <>
          <label ref={ageRef} key={ageNudge} className={`wb-login-age wb-login-age-top${ageNudge > 0 && !ageAccepted ? " is-nudge" : ""}`}>
            <input
              type="checkbox"
              checked={ageAccepted}
              onChange={(e) => setAgeAccepted(e.target.checked)}
            />
            <span>
              {v2(lang, "loginAgeTermsLine")}{" "}
              <a href={href("/terms")} target="_blank" onClick={(e) => e.stopPropagation()}>
                {v2(lang, "loginTermsLinkLabel")}
              </a>
              {" · "}
              <a href={href("/privacy")} target="_blank" onClick={(e) => e.stopPropagation()}>
                {v2(lang, "loginPrivacyLinkLabel")}
              </a>
            </span>
          </label>
          {ageNudge > 0 && !ageAccepted && (
            <p className="wb-login-age-msg" role="alert">{v2(lang, "loginErrorAgeRequired")}</p>
          )}
          </>
        )}

        {inAppName ? (
          // Inside an in-app webview (Instagram, Facebook, TikTok, …).
          // Hide the Google button entirely; Google blocks OAuth here
          // and showing a non-functional button confuses users. Tell
          // them to either use email below or open the page in a real
          // browser to get the Google option back.
          <div className="wb-login-inapp-notice" role="note">
            {v2(lang, "loginInAppNotice").replace("{app}", inAppName)}
          </div>
        ) : (
          <>
            {appleAvailable && (
              // Label: the Google button's own string in this language with
              // the brand swapped ("המשיכו עם Apple", "Continue with Apple"),
              // so every UI language is covered and the pair reads alike.
              <button
                type="button"
                onClick={handleApple}
                disabled={busy}
                className="wb-login-apple"
              >
                <AppleLogo />
                <span>{v2(lang, "loginContinueWithGoogle").replace("Google", "Apple")}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="wb-login-google"
            >
              <GoogleG />
              <span>{v2(lang, "loginContinueWithGoogle")}</span>
            </button>

            <div className="wb-login-sep">
              <span>{v2(lang, "loginOrSeparator")}</span>
            </div>
          </>
        )}

        <form onSubmit={handleEmail} noValidate>
          {wrongPwd ? (
            <div className="wb-login-error wb-login-help" role="alert">
              <span>{lh.wrongHelp}</span>
              <span className="wb-login-help-actions">
                <button type="button" className="wb-login-help-btn is-primary" onClick={() => void sendMagicLink()} disabled={busy}>{lh.magicLink}</button>
                <button type="button" className="wb-login-help-btn" onClick={() => void sendReset()} disabled={busy}>{lh.resetNow}</button>
              </span>
            </div>
          ) : notice ? (
            <div className="wb-login-error is-success" role="status">{notice}</div>
          ) : (errorKey || localError) ? (
            <div
              className={`wb-login-error ${errorKey === "loginResetSent" ? "is-success" : ""}`}
              role="alert"
            >
              {localError || v2(lang, errorKey as never)}
            </div>
          ) : null}

          <div className="wb-login-field">
            <label className="wb-login-label">{v2(lang, "loginEmailLabel")}</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              dir="ltr"
              placeholder={v2(lang, "loginEmailPlaceholder")}
              disabled={busy}
              className={`wb-login-input ${errorKey ? "is-error" : ""}`}
            />
          </div>

          <div className="wb-login-field">
            <label className="wb-login-label">{v2(lang, "loginPasswordLabel")}</label>
            <div className="wb-login-pwd-wrap">
              <input
                ref={passwordRef}
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                dir="ltr"
                placeholder={v2(lang, "loginPasswordPlaceholder")}
                disabled={busy}
                className={`wb-login-input-pwd ${errorKey ? "is-error" : ""}`}
                style={{ padding: isRtl ? "11px 14px 11px 40px" : "11px 40px 11px 14px" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? v2(lang, "loginHidePassword") : v2(lang, "loginShowPassword")}
                aria-pressed={showPwd}
                tabIndex={-1}
                className="wb-login-pwd-toggle"
              >
                <EyeIcon open={showPwd} />
              </button>
            </div>
          </div>

          {/* Age + terms checkbox now lives ABOVE the Google button , 
              not inside this form — so a user who started a signup by
              clicking Google sees and accepts the gate before they get
              an error. Both signup paths use the same shared ageAccepted
              state, including the disable below. */}
          <button
            type="submit"
            disabled={busy}
            className="wb-login-submit"
          >
            {busy && <Spinner />}
            {v2(lang, submitKey)}
          </button>
        </form>

        {/* Forgot-password link, signin mode only. Tapping it triggers
            Firebase's password-reset email to whatever's in the email
            field. The success message is intentionally generic ('if
            an account exists') so we don't leak which addresses are
            registered. If the email field is empty we just nudge the
            user to fill it first instead of sending a malformed
            request. */}
        {mode === "signin" && (
          <>
            <button type="button" className="wb-login-magic" disabled={busy} onClick={() => void sendMagicLink()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
              </svg>
              {lh.magicLink}
            </button>
            <div className="wb-login-forgot">
              <button type="button" className="wb-login-forgot-btn" disabled={busy} onClick={() => void sendReset()}>
                {v2(lang, "loginForgotPassword")}
              </button>
            </div>
          </>
        )}

        <div className="wb-login-toggle">
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "signin" ? "signup" : "signin"));
              setErrorKey("");
            }}
          >
            {v2(lang, toggleKey)}
          </button>
        </div>

        {/* Family pairing entry — reachable from INSIDE the installed PWA so a
            child can pair with the 6-digit code where the session will persist
            (see JOIN_FAMILY_CTA note above). */}
        <div className="wb-login-toggle" style={{ marginTop: 4 }}>
          <a
            href={href("/join")}
            onClick={() => setShowLoginModal(false)}
            style={{ fontSize: 13, color: "var(--ink-muted, #6B7280)" }}
          >
            {JOIN_FAMILY_CTA[lang] ?? JOIN_FAMILY_CTA.en}
          </a>
        </div>
      </div>
    </div>
  );
}
