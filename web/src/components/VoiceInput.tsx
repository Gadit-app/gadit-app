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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
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
      setState("recording");
    } catch (e) {
      console.error("getUserMedia failed:", e);
      setState("error");
      setErrorMsg("Mic permission denied");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  async function handleStop() {
    setState("transcribing");
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
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

  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";

  // Visuals per state
  let bg = "transparent";
  let color = "rgb(100 116 139)";
  let border = "1px solid rgb(226 232 240)";
  let icon = "🎤";
  if (state === "recording") {
    bg = "rgb(254 226 226)";
    color = "rgb(220 38 38)";
    border = "1px solid rgb(252 165 165)";
    icon = "⏹";
  } else if (state === "transcribing") {
    bg = "rgb(239 246 255)";
    color = "rgb(37 99 235)";
    border = "1px solid rgb(147 197 253)";
    icon = "…";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "transcribing"}
      className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 transition-all hover:opacity-80 disabled:opacity-60 disabled:cursor-wait`}
      style={{ background: bg, color, border }}
      title={errorMsg || title || "Voice input"}
      aria-label="Voice input"
    >
      <span className={state === "recording" ? "animate-pulse" : ""}>{icon}</span>
    </button>
  );
}
