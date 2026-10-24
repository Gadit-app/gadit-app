"use client";
import { useEffect, useRef, useState } from "react";

type State = "idle" | "recording" | "transcribing" | "error";

interface Props {
  uiLang: string;
  getIdToken: () => Promise<string | null>;
  onResult: (text: string) => void;
  /** Whether the feature is enabled for this user (Clear/Deep). Hidden if false. */
  enabled: boolean;
  /** Optional: tooltip on the button */
  title?: string;
  /** Optional: visual size */
  size?: "sm" | "md";
}

export default function VoiceInput({
  uiLang,
  getIdToken,
  onResult,
  enabled,
  title,
  size = "md",
}: Props) {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  // Hands-free stop (Gadi 2026-10-24): one tap starts, and the recording ends
  // by itself once the speaker goes quiet, like the phone keyboards do.
  const vadRef = useRef<{ ctx: AudioContext; timer: number } | null>(null);
  const cancelRef = useRef(false);
  const [level, setLevel] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      stopVad();
    };
  }, []);

  if (!enabled) return null;

  async function startRecording() {
    setErrorMsg("");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("error");
      setErrorMsg("Microphone not supported in this browser");
      return;
    }
    // The level meter's AudioContext is created right here, inside the tap,
    // before any await: Safari on iPhone starts a context made later
    // "suspended", and a suspended meter would hear only silence.
    let ctx: AudioContext | null = null;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) { ctx = new AC(); void ctx.resume().catch(() => {}); }
    } catch { ctx = null; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      // Pick best supported mime type
      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
      const mimeType = candidates.find((c) => MediaRecorder.isTypeSupported(c)) || "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = handleStop;
      recorder.start();
      cancelRef.current = false;
      setState("recording");
      startVad(stream, ctx);
    } catch (e) {
      console.error("getUserMedia failed:", e);
      ctx?.close().catch(() => {});
      setState("error");
      setErrorMsg("Mic permission denied");
    }
  }

  // Voice-activity watch: learn the room's noise for the first moments, then
  // stop 1.3 s after speech ends. No speech within 7 s cancels quietly; 45 s is
  // the hard limit.
  function startVad(stream: MediaStream, ctx: AudioContext | null) {
    try {
      if (!ctx) return;
      void ctx.resume().catch(() => {});
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      const buf = new Float32Array(an.fftSize);
      const t0 = performance.now();
      let floor = 0, floorN = 0, spoke = false, lastLoud = t0, peak = 0;
      const timer = window.setInterval(() => {
        an.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        const now = performance.now();
        if (now - t0 < 350) { floor += rms; floorN++; return; }
        const base = floorN ? floor / floorN : 0.005;
        // Capped, so speech that starts at once cannot raise the bar out of reach.
        const loud = rms > Math.max(0.015, Math.min(base * 2.8, 0.045));
        peak = Math.max(peak, rms);
        setLevel(Math.min(1, rms * 12));
        if (loud) { spoke = true; lastLoud = now; }
        if (now - t0 > 45000) { stopRecording(); return; }
        if (spoke && now - lastLoud > 1300) stopRecording();
        // Nothing said in 7 s: a truly silent take is dropped; a quiet voice
        // that never crossed the bar is still sent for transcription.
        else if (!spoke && now - t0 > 7000) {
          // A meter that never ran (still suspended) proves nothing: keep the
          // take and let the tap-to-stop finish it instead of dropping it.
          if (ctx.state !== "running") return;
          cancelRef.current = peak < 0.008; stopRecording();
        }
      }, 100);
      vadRef.current = { ctx, timer };
    } catch { /* no auto-stop: the tap-to-stop still works */ }
  }

  function stopVad() {
    const v = vadRef.current;
    vadRef.current = null;
    setLevel(0);
    if (!v) return;
    window.clearInterval(v.timer);
    v.ctx.close().catch(() => {});
  }

  function stopRecording() {
    stopVad();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  async function handleStop() {
    stopVad();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (cancelRef.current) { cancelRef.current = false; setState("idle"); return; }
    setState("transcribing");
    try {
      const blobType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: blobType });
      if (blob.size === 0) {
        setState("idle");
        return;
      }
      const idToken = await getIdToken();
      if (!idToken) {
        setState("error");
        setErrorMsg("Login required");
        return;
      }
      const form = new FormData();
      form.append("audio", blob, "audio.webm");
      form.append("uiLang", uiLang);
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: form,
      });
      if (!res.ok) {
        setState("error");
        setErrorMsg("Couldn't transcribe");
        return;
      }
      const data = (await res.json()) as { text?: string };
      const text = (data.text || "").trim();
      if (text) onResult(text);
      setState("idle");
    } catch (e) {
      console.error("transcription error:", e);
      setState("error");
      setErrorMsg("Couldn't transcribe");
    }
  }

  function onClick() {
    if (state === "recording") stopRecording();
    else if (state === "idle" || state === "error") startRecording();
  }

  const sizeClass = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? 16 : 20;

  // Visuals per state
  let bg = "transparent";
  let color = "rgb(100 116 139)";
  const border = "none";
  if (state === "recording") {
    bg = "rgb(239 68 68)"; // red, visually distinct, classic recording cue
    color = "white";
  } else if (state === "transcribing") {
    bg = "rgb(239 246 255)";
    color = "rgb(37 99 235)";
  }

  // Material-style mic icon (filled). When recording, show a stop square.
  // When transcribing, show a small spinner.
  function renderIcon() {
    if (state === "transcribing") {
      return (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M21 12a9 9 0 1 1-6.22-8.56" style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }} />
        </svg>
      );
    }
    if (state === "recording") {
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      );
    }
    // Idle: standard microphone icon (Material Design style)
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
        <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A7 7 0 0 0 19 11z" />
      </svg>
    );
  }

  const hoverClass = state === "idle" || state === "error" ? "hover:bg-slate-100 hover:text-slate-700" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "transcribing"}
      className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 transition-colors ${hoverClass} disabled:opacity-60 disabled:cursor-wait`}
      style={{ background: bg, color, border, ...(state === "recording" ? { boxShadow: `0 0 0 ${3 + Math.round(level * 9)}px rgb(239 68 68 / 0.22)`, transition: "box-shadow 90ms linear" } : {}) }}
      title={errorMsg || title || "Voice input"}
      aria-label="Voice input"
    >
      {renderIcon()}
    </button>
  );
}
