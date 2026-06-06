"use client";

/**
 * TTSButton — speaker icon that pronounces a piece of text.
 *
 * Two-tier strategy:
 *   - Web Speech API (free, built into every modern browser) for
 *     short content like a single word — used for every user.
 *     Voice quality is robotic but for a 1-2 syllable word that's
 *     perfectly acceptable; the user just needs to hear the
 *     pronunciation, not enjoy narration.
 *   - OpenAI TTS (server-side, /api/tts) for paragraph-length
 *     content like a full definition — gated to Clear/Deep so we
 *     don't burn budget on free users.
 *
 * Behavior:
 *   - First click → starts playback. Icon switches to playing state
 *     (pulse animation via .is-playing class).
 *   - Second click while playing → stops playback.
 *   - On audio end → reverts to idle.
 *   - Disabled if Web Speech isn't available (very old browsers).
 *
 * Language: the word language is what TTS uses, not the UI language —
 * an English word should be pronounced in English even when the UI
 * is Hebrew. Caller passes `audioLang` (BCP-47 like "en-US", "he-IL",
 * "ar-SA", "de-DE", "cs-CZ"). When missing we fall back to detecting
 * from text or, last resort, "en-US".
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type Props = {
  /** Text to pronounce. Single word for now; designed to accept
   *  longer text once the OpenAI TTS path is wired in. */
  text: string;
  /** BCP-47 lang tag for voice selection. Maps to the WORD's language,
   *  NOT the UI language. */
  audioLang?: string;
  /** Force OpenAI TTS path (paid tier feature). Default false — uses
   *  Web Speech for free, instant playback. */
  useOpenAI?: boolean;
  /** Accessible label for the speaker icon. */
  ariaLabel: string;
  /** Optional className so callers can drop the button into the same
   *  visual row as Save/Share without needing custom CSS. */
  className?: string;
};

/**
 * Map our app's 2-letter Lang codes to BCP-47 lang tags that the
 * browser's SpeechSynthesis engine knows. Without this it falls back
 * to the system default, which often pronounces Hebrew/Arabic/Czech
 * in English approximations.
 */
function toBcp47(audioLang: string | undefined): string {
  if (!audioLang) return "en-US";
  // Allow callers to pass either "he" or "he-IL" — normalize to a
  // long tag the engine recognizes.
  const map: Record<string, string> = {
    en: "en-US",
    he: "he-IL",
    ar: "ar-SA",
    ru: "ru-RU",
    es: "es-ES",
    pt: "pt-BR",
    fr: "fr-FR",
    de: "de-DE",
    cs: "cs-CZ",
  };
  const short = audioLang.split("-")[0].toLowerCase();
  return map[short] ?? audioLang;
}

export function TTSButton({
  text,
  audioLang,
  useOpenAI = false,
  ariaLabel,
  className = "wb-word-act-icon",
}: Props) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [supported, setSupported] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Detect Web Speech availability on mount. Some embedded browsers
  // (in-app webviews) ship without speechSynthesis.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!useOpenAI && !("speechSynthesis" in window)) setSupported(false);
  }, [useOpenAI]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utterRef.current = null;
    setState("idle");
  }, []);

  // Clean up if the component unmounts mid-playback (user navigates away).
  useEffect(() => () => stop(), [stop]);

  const playWebSpeech = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    // Cancel anything already playing — multiple TTS buttons on the
    // page must not stack.
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = toBcp47(audioLang);
    // Slightly slower than default so single words land clearly.
    u.rate = 0.95;
    u.pitch = 1.0;
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");
    utterRef.current = u;
    setState("playing");
    window.speechSynthesis.speak(u);
  }, [text, audioLang]);

  const { user } = useAuth();
  const playOpenAITTS = useCallback(async () => {
    setState("loading");
    try {
      // /api/tts is tier-gated to Clear/Deep, so we need to send the
      // signed-in user's Firebase ID token. If there's no user we fall
      // back to Web Speech immediately rather than triggering an
      // inevitable 401.
      if (!user) {
        setState("idle");
        playWebSpeech();
        return;
      }
      const idToken = await user.getIdToken();
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ text, lang: audioLang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setState("idle");
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setState("idle");
      };
      setState("playing");
      await audio.play();
    } catch (err) {
      console.warn("[TTS] OpenAI fallback to Web Speech:", err);
      setState("idle");
      // Last-resort fallback so the click still does something.
      playWebSpeech();
    }
  }, [text, audioLang, playWebSpeech]);

  const onClick = useCallback(() => {
    if (state !== "idle") {
      stop();
      return;
    }
    if (useOpenAI) {
      void playOpenAITTS();
    } else {
      playWebSpeech();
    }
  }, [state, stop, useOpenAI, playOpenAITTS, playWebSpeech]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className}${state === "playing" ? " is-playing" : ""}`}
      aria-label={ariaLabel}
      aria-pressed={state === "playing"}
      title={ariaLabel}
      style={{ position: "relative" }}
    >
      {state === "loading" ? (
        <SpinnerIcon />
      ) : state === "playing" ? (
        <SpeakerActiveIcon />
      ) : (
        <SpeakerIcon />
      )}
    </button>
  );
}

function SpeakerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpeakerActiveIcon() {
  // Same speaker with a subtle pulse — animation lives in globals.css
  // via the .is-playing class; the icon itself doesn't differ much.
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" strokeWidth="2" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" fill="none" strokeWidth="2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
