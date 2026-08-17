"use client";

/**
 * Hands-free voice assistant (Gadi 2026-08-17). Once turned on (one tap to
 * grant the mic), it listens continuously while Gadit is open and in the
 * foreground. A kid or parent can just say, from across the room:
 *   "Gadit, what is nuance?"  ·  "גדית, מה זה תום?"
 * and Gadit opens that word and reads the definition aloud, then keeps
 * listening for the next question. No per-question tapping, like a home
 * assistant, for as long as the tab stays open.
 *
 * Uses the browser's Web Speech API (continuous SpeechRecognition) — free,
 * real-time, no server round-trip for the listening. The spoken answer reuses
 * the word page's /api/tts. A true always-on "Hey Gadit" with the tab in the
 * background needs the native app; a browser can't listen in the background.
 *
 * Gated to paying users (Clear / Deep / Family) and to browsers that support
 * SpeechRecognition (Chrome / Edge / Safari). Hidden otherwise.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

// Minimal Web Speech API typings (absent from the DOM lib).
interface SRAlt { transcript: string }
interface SRResult { 0: SRAlt; isFinal: boolean }
interface SRResultList { length: number; [i: number]: SRResult }
interface SREvent { resultIndex: number; results: SRResultList }
interface SRErrorEvent { error: string }
interface SpeechRec {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SRCtor = new () => SpeechRec;

function getSRCtor(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

// UI language → BCP-47 recognition locale (accuracy hint).
function recLocale(lang: string): string {
  const map: Record<string, string> = {
    he: "he-IL", en: "en-US", ar: "ar-SA", ru: "ru-RU", es: "es-ES", pt: "pt-BR",
    fr: "fr-FR", de: "de-DE", it: "it-IT", nl: "nl-NL", cs: "cs-CZ", sk: "sk-SK",
    uk: "uk-UA", tr: "tr-TR", pl: "pl-PL", fa: "fa-IR", id: "id-ID", el: "el-GR",
    hi: "hi-IN", ja: "ja-JP", am: "am-ET", zu: "zu-ZA",
  };
  return map[lang] ?? "en-US";
}

const WAKE = /\b(gadit|היי גדית|hey gadit|גדית)\b/i;

// Strip the wake word and any leading question phrasing, return the target
// word(s) — or null if nothing usable. Deliberately forgiving.
function extractQuery(raw: string): string | null {
  let t = raw.trim();
  const m = t.match(WAKE);
  if (!m || m.index === undefined) return null;
  t = t.slice(m.index + m[0].length).trim().replace(/^[,\s.]+/, "");
  if (!t) return null;
  const lower = t.toLowerCase();

  // "what does X mean" / "what is X" (capture before "mean")
  let q =
    lower.match(/what (?:does|is|are) (?:the word |the meaning of |a )?(.+?)(?: mean| means)?$/)?.[1] ||
    // "define X" / "definition of X" / "meaning of X"
    lower.match(/(?:define|definition of|meaning of|what's)\s+(?:the word )?(.+)$/)?.[1] ||
    // Hebrew: "מה זה X" / "מה הפירוש של X" / "פירוש X" / "הגדרה של X"
    t.match(/(?:מה\s+(?:זה|זאת אומרת)|מה\s+(?:ה)?(?:פירוש|משמעות|הגדרה)(?:\s+של)?(?:\s+המילה)?|פירוש|הגדרה\s+של)\s+(.+)$/)?.[1] ||
    // Fallback: whatever followed the wake word
    t;

  q = q.trim().replace(/[?.!,;]+$/g, "").replace(/^(the word|a|an)\s+/i, "").trim();
  // A dictionary lookup is almost always one token; keep it tight.
  const parts = q.split(/\s+/);
  if (parts.length > 4) q = parts.slice(-2).join(" ");
  return q || null;
}

type Status = "off" | "listening" | "heard" | "error";

export function VoiceAssistant() {
  const { user, plan } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();

  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<Status>("off");
  const [heard, setHeard] = useState("");
  const recRef = useRef<SpeechRec | null>(null);
  const listeningRef = useRef(false);
  const cooldownRef = useRef(0);

  useEffect(() => { setSupported(getSRCtor() !== null); }, []);

  const stop = useCallback(() => {
    listeningRef.current = false;
    setStatus("off");
    try { recRef.current?.abort(); } catch { /* ignore */ }
    recRef.current = null;
  }, []);

  const handleTranscript = useCallback((text: string) => {
    setHeard(text);
    const word = extractQuery(text);
    if (!word) return;
    // Debounce: ignore repeats within 4s (recognition can echo).
    const now = Date.now();
    if (now - cooldownRef.current < 4000) return;
    cooldownRef.current = now;
    setStatus("heard");
    router.push(`${href(`/word/${encodeURIComponent(word)}`)}?speak=1`);
  }, [router, href]);

  const start = useCallback(() => {
    const Ctor = getSRCtor();
    if (!Ctor) { setStatus("error"); return; }
    const rec = new Ctor();
    rec.lang = recLocale(lang);
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: SREvent) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) handleTranscript(r[0].transcript);
      }
    };
    rec.onerror = (e: SRErrorEvent) => {
      // Transient errors (silence, aborted) — the onend handler restarts.
      if (e.error === "not-allowed" || e.error === "service-not-allowed") stop();
    };
    rec.onend = () => {
      // Browsers stop after a silence; restart to stay hands-free.
      if (listeningRef.current) { try { rec.start(); } catch { /* ignore */ } }
    };
    recRef.current = rec;
    listeningRef.current = true;
    setStatus("listening");
    try { rec.start(); } catch { setStatus("error"); }
  }, [lang, handleTranscript, stop]);

  // Clean up on unmount.
  useEffect(() => () => { try { recRef.current?.abort(); } catch { /* ignore */ } }, []);

  // Gate: paying, logged-in users on a supporting browser only.
  const eligible = !!user && (plan === "clear" || plan === "deep") && supported;
  if (!eligible) return null;

  const on = status === "listening" || status === "heard";
  const label =
    status === "heard" ? (heard || (lang === "he" ? "מחפש…" : "Searching…"))
    : status === "listening" ? (lang === "he" ? "מקשיב… אמור: “גדית, מה זה…”" : "Listening… say “Gadit, what is…”")
    : (lang === "he" ? "מצב האזנה" : "Listening mode");

  return (
    <div dir={dir} style={{ position: "fixed", insetInlineEnd: 16, bottom: 16, zIndex: 60, display: "flex", alignItems: "center", gap: 10, flexDirection: dir === "rtl" ? "row-reverse" : "row" }}>
      {on && (
        <div style={{ maxWidth: 260, background: "#111827", color: "#fff", fontSize: 13, fontWeight: 500, padding: "8px 14px", borderRadius: 999, boxShadow: "0 6px 20px rgba(0,0,0,0.18)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </div>
      )}
      <button
        type="button"
        onClick={() => (on ? stop() : start())}
        aria-label={label}
        title={label}
        style={{
          width: 52, height: 52, borderRadius: "50%", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: on ? "#DC2626" : "#0EA5A5", color: "#fff",
          boxShadow: "0 6px 20px rgba(0,0,0,0.22)", transition: "background 0.2s",
          animation: status === "listening" ? "vaPulse 1.6s ease-in-out infinite" : "none",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
          <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A7 7 0 0 0 19 11z" />
        </svg>
      </button>
      <style>{`@keyframes vaPulse { 0%,100% { box-shadow: 0 6px 20px rgba(220,38,38,0.3), 0 0 0 0 rgba(220,38,38,0.4); } 50% { box-shadow: 0 6px 20px rgba(220,38,38,0.3), 0 0 0 10px rgba(220,38,38,0); } }`}</style>
    </div>
  );
}
