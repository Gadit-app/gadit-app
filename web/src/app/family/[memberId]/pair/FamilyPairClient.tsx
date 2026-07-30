"use client";

/**
 * /family/[memberId]/pair — owner sees a QR + 6-digit code to hand off
 * to a member's device.
 *
 * On mount, calls POST /api/family/pair/create to generate a code.
 * The page shows:
 *   - The QR (encodes `${origin}/join?code=XXXXXX`)
 *   - The 6-digit code in big legible type
 *   - A countdown to expiration (mm:ss)
 *   - "Generate new code" button
 *   - Once the member's `userId` field is populated server-side
 *     (via redeem), this page surfaces a success state ("Linked!") via
 *     a real-time subscription on the member doc and offers to return.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { db } from "@/lib/firebase";
import { FamilyMember, PAIRING_CODE_TTL_MS } from "@/lib/family";

const COPY: Record<string, {
  title: string;
  sub: string;
  yourCode: string;
  ttlPrefix: string;
  ttlSuffix: string;
  expired: string;
  newCode: string;
  generating: string;
  pairedTitle: string;
  pairedSub: string;
  done: string;
  back: string;
  qrAlt: string;
}> = {
  he: {
    title: "חיבור מכשיר",
    sub: "סרקו את ה-QR מהמכשיר שלכם, או הקלידו את הקוד הזה ב-gadit.app/join",
    yourCode: "הקוד שלכם",
    ttlPrefix: "פג בעוד",
    ttlSuffix: "דקות",
    expired: "הקוד פג. ייצרו קוד חדש.",
    newCode: "קוד חדש",
    generating: "מייצר...",
    pairedTitle: "המכשיר חובר ✓",
    pairedSub: "המכשיר עכשיו מחובר תמידית לחשבון של בן המשפחה.",
    done: "← חזרה לדף המשפחה",
    back: "→ חזרה",
    qrAlt: "QR לחיבור מכשיר",
  },
  en: {
    title: "Pair device",
    sub: "Scan the QR from your member's device, or type this code at gadit.app/join",
    yourCode: "Your code",
    ttlPrefix: "Expires in",
    ttlSuffix: "min",
    expired: "Code expired. Generate a new one.",
    newCode: "New code",
    generating: "Generating...",
    pairedTitle: "Device paired ✓",
    pairedSub: "The device is now permanently linked to this member's account.",
    done: "← Back to family",
    back: "← Back",
    qrAlt: "QR pairing code",
  },
  hi: {
    title: "डिवाइस जोड़ें",
    sub: "अपने सदस्य के डिवाइस से QR स्कैन करें, या gadit.app/join पर यह कोड डालें",
    yourCode: "आपका कोड",
    ttlPrefix: "समाप्ति में",
    ttlSuffix: "मिनट",
    expired: "कोड समाप्त। नया कोड बनाएँ।",
    newCode: "नया कोड",
    generating: "बना रहे हैं...",
    pairedTitle: "डिवाइस जुड़ गया ✓",
    pairedSub: "यह डिवाइस अब इस सदस्य के खाते से हमेशा के लिए जुड़ा है।",
    done: "← परिवार पर वापस",
    back: "← वापस",
    qrAlt: "QR जोड़ने का कोड",
  },
  am: {
    title: "መሳሪያ ማገናኘት",
    sub: "QR ኮዱን በአባሉ መሳሪያ ይቃኙ፣ ወይም ይህን ኮድ gadit.app/join ላይ ያስገቡ",
    yourCode: "ኮድዎ",
    ttlPrefix: "የሚያበቃው በ",
    ttlSuffix: "ደቂቃ ውስጥ ነው",
    expired: "ኮዱ ጊዜው አልፎበታል። አዲስ ኮድ ያዘጋጁ።",
    newCode: "አዲስ ኮድ",
    generating: "እየተዘጋጀ ነው...",
    pairedTitle: "መሳሪያው ተገናኝቷል ✓",
    pairedSub: "መሳሪያው አሁን ከዚህ አባል መለያ ጋር በቋሚነት ተገናኝቷል።",
    done: "← ወደ ቤተሰብ ገጹ ተመለሱ",
    back: "← ተመለስ",
    qrAlt: "የመሳሪያ ማገናኛ QR ኮድ",
  },
};

function formatMs(ms: number): string {
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function FamilyPairClient() {
  const { user, loading } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const params = useParams<{ memberId: string }>();
  const memberId = params.memberId;
  const c = COPY[lang] ?? COPY.en;

  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [generating, setGenerating] = useState(false);
  const [member, setMember] = useState<FamilyMember | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://gadit.app";
  const qrUrl = useMemo(
    () => (code ? `${origin}/join?code=${code}` : ""),
    [code, origin]
  );

  // Subscribe to member doc to detect successful pair.
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, "families", user.uid, "members", memberId),
      (snap) => {
        if (snap.exists()) {
          setMember({ id: snap.id, ...(snap.data() as Omit<FamilyMember, "id">) });
        }
      }
    );
    return unsub;
  }, [user, memberId]);

  // Generate a fresh pairing code on mount.
  useEffect(() => {
    if (!user || member?.userId) return;
    void generateCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, member?.userId]);

  // Tick clock so the countdown re-renders.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  async function generateCode() {
    if (!user) return;
    setGenerating(true);
    try {
      const { getIdToken } = await import("firebase/auth");
      const idToken = await getIdToken(user);
      const res = await fetch("/api/family/pair/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (data.code) {
        setCode(data.code);
        // Base the countdown on the CLIENT clock, not the server's absolute
        // expiresAt: a device whose clock runs ahead was showing "expired"
        // the instant the code was generated (Sheli, 2026-07-30). The server
        // still validates the real expiry against its own clock on redeem.
        setExpiresAt(Date.now() + PAIRING_CODE_TTL_MS);
      }
    } catch (e) {
      console.error("generate code failed:", e);
    } finally {
      setGenerating(false);
    }
  }

  if (loading || !user) {
    return <div className="wordbook wb-family-page" dir={dir}>&nbsp;</div>;
  }

  // Success state — the member just paired their device.
  if (member?.userId) {
    return (
      <div className="wordbook wb-family-page" dir={dir}>
        <main className="wb-family-main">
          <div className="wb-family-pair-card">
            <h1 className="wb-family-title">{c.pairedTitle}</h1>
            <p className="wb-family-sub">{c.pairedSub}</p>
            <Link href={href("/family")} className="wb-family-cta">{c.done}</Link>
          </div>
        </main>
      </div>
    );
  }

  const msLeft = expiresAt ? expiresAt - now : 0;
  const expired = expiresAt !== null && msLeft <= 0;

  return (
    <div className="wordbook wb-family-page" dir={dir}>
      <main className="wb-family-main">
        <Link href={href("/family")} className="wb-family-back">{c.back}</Link>

        <header className="wb-family-header">
          <h1 className="wb-family-title">{c.title}</h1>
          <p className="wb-family-sub">{c.sub}</p>
        </header>

        <div className="wb-family-pair-card">
          {code && !expired && (
            <>
              <div className="wb-family-qr-frame" dir="ltr">
                <QRCodeSVG value={qrUrl} size={208} bgColor="#FFFFFF" fgColor="#0F172A" level="M" />
              </div>
              <div className="wb-family-code-label">{c.yourCode}</div>
              <div className="wb-family-code" dir="ltr">{code}</div>
              <div className="wb-family-code-ttl">
                {c.ttlPrefix} {formatMs(msLeft)} {c.ttlSuffix}
              </div>
            </>
          )}
          {(expired || !code) && (
            <div className="wb-family-code-expired">
              {expired ? c.expired : ""}
            </div>
          )}
          <button
            type="button"
            className="wb-family-cta-ghost"
            onClick={generateCode}
            disabled={generating}
          >
            {generating ? c.generating : c.newCode}
          </button>
        </div>
      </main>
    </div>
  );
}
