"use client";

/**
 * "Invent your learning game" (Gadi 2026-11-12): children love to play, so
 * they are asked how they would like to learn. A banner on the games page
 * (subscribers only) opens a small panel where the child records the idea, up
 * to 90 seconds, or writes it. The idea goes to /api/game-idea, which keeps
 * only the words (never the recording) and puts it in front of Gadi; a game
 * that gets built carries the child's first name on its card.
 */

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const MAX_SECONDS = 90;

type Copy = {
  banner: string; bannerSub: string; title: string; lead: string; lead2: string; record: string; stop: string; recorded: string; redo: string;
  or: string; placeholder: string; send: string; sending: string; thanks: string; thanksSub: string; close: string;
  notHeard: string; limit: string; failed: string; noMic: string; privacy: string; seconds: (n: number) => string;
};
const COPY: Record<string, Copy> = {
  he: {
    banner: "יש לכם רעיון למשחק?", bannerSub: "ספרו לנו איך הייתם רוצים ללמוד, ונבנה את המשחק שלכם",
    title: "המציאו משחק לימודי", lead: "הסבירו איך משחקים, מה רואים על המסך ומה לומדים", lead2: "ספרו בקול או כתבו",
    record: "הקליטו", stop: "סיימתי", recorded: "ההקלטה מוכנה", redo: "להקליט שוב",
    or: "או כתבו", placeholder: "המשחק שלי הוא", send: "שלחו את הרעיון", sending: "שולחים",
    thanks: "הרעיון נשלח", thanksSub: "כשנבנה את המשחק, השם שלכם יופיע עליו", close: "סגירה",
    notHeard: "לא הצלחנו לשמוע. נסו להקליט שוב, קרוב למכשיר", limit: "שלחתם כבר חמישה רעיונות היום. מחר אפשר עוד",
    failed: "משהו השתבש. נסו שוב", noMic: "המיקרופון לא זמין. אפשר לכתוב את הרעיון",
    privacy: "ההקלטה לא נשמרת. נשמר רק הטקסט של הרעיון", seconds: (n) => `${n} שניות`,
  },
  en: {
    banner: "Got an idea for a game?", bannerSub: "Tell us how you would like to learn, and we will build your game",
    title: "Invent a learning game", lead: "Explain how you play, what is on the screen and what you learn", lead2: "Say it or write it",
    record: "Record", stop: "Done", recorded: "The recording is ready", redo: "Record again",
    or: "or write it", placeholder: "My game is", send: "Send the idea", sending: "Sending",
    thanks: "Your idea was sent", thanksSub: "When we build the game, your name will be on it", close: "Close",
    notHeard: "We could not hear it. Try recording again, close to the device", limit: "You sent five ideas today. More tomorrow",
    failed: "Something went wrong. Try again", noMic: "The microphone is not available. You can write the idea",
    privacy: "The recording is not kept. Only the words of the idea are saved", seconds: (n) => `${n} seconds`,
  },
  ar: {
    banner: "عندك فكرة للعبة؟", bannerSub: "أخبرنا كيف تحب أن تتعلم، وسنبني لعبتك",
    title: "اخترع لعبة تعليمية", lead: "اشرح كيف نلعب، ماذا نرى على الشاشة وماذا نتعلم", lead2: "قلها بصوتك أو اكتبها",
    record: "تسجيل", stop: "انتهيت", recorded: "التسجيل جاهز", redo: "سجّل من جديد",
    or: "أو اكتب", placeholder: "لعبتي هي", send: "إرسال الفكرة", sending: "جارٍ الإرسال",
    thanks: "تم إرسال الفكرة", thanksSub: "عندما نبني اللعبة، سيظهر اسمك عليها", close: "إغلاق",
    notHeard: "لم نسمع جيدًا. حاول التسجيل مرة أخرى قريبًا من الجهاز", limit: "أرسلت خمس أفكار اليوم. غدًا يمكن المزيد",
    failed: "حدث خطأ. حاول مرة أخرى", noMic: "الميكروفون غير متاح. يمكنك كتابة الفكرة",
    privacy: "لا نحتفظ بالتسجيل. نحفظ نص الفكرة فقط", seconds: (n) => `${n} ثانية`,
  },
  ru: {
    banner: "Есть идея игры?", bannerSub: "Расскажи, как тебе хочется учиться, и мы сделаем твою игру",
    title: "Придумай обучающую игру", lead: "Объясни, как играть, что на экране и чему мы учимся", lead2: "Расскажи вслух или напиши",
    record: "Записать", stop: "Готово", recorded: "Запись готова", redo: "Записать ещё раз",
    or: "или напиши", placeholder: "Моя игра", send: "Отправить идею", sending: "Отправляем",
    thanks: "Идея отправлена", thanksSub: "Когда мы сделаем игру, на ней будет твоё имя", close: "Закрыть",
    notHeard: "Не удалось расслышать. Запиши ещё раз, ближе к устройству", limit: "Сегодня уже пять идей. Завтра можно ещё",
    failed: "Что-то пошло не так. Попробуй ещё раз", noMic: "Микрофон недоступен. Идею можно написать",
    privacy: "Запись не сохраняется. Сохраняется только текст идеи", seconds: (n) => `${n} с`,
  },
};

export function GameIdea({ lang, dir }: { lang: string; dir: "ltr" | "rtl" }) {
  const c = COPY[lang] ?? COPY.en;
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [clip, setClip] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [note, setNote] = useState("");
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const release = () => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null;
  };
  // Closed while the browser was still asking for the microphone: the answer
  // must not start a recording nobody can see.
  const gone = useRef(false);
  useEffect(() => { gone.current = false; return () => { gone.current = true; try { rec.current?.stop(); } catch { /* not recording */ } release(); }; }, []);

  const stop = () => { try { rec.current?.stop(); } catch { /* not recording */ } };
  const start = async () => {
    setNote(""); setClip(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setNote(c.noMic); return; }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch { setNote(c.noMic); return; }
    if (gone.current) { release(); return; }
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported?.(m)) ?? "";
    let r: MediaRecorder;
    try { r = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined); } catch { release(); setNote(c.noMic); return; }
    const chunks: Blob[] = [];
    r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    r.onstop = () => { release(); setRecording(false); if (chunks.length) setClip(new Blob(chunks, { type: r.mimeType || mime || "audio/webm" })); };
    rec.current = r;
    r.start();
    setSecs(0); setRecording(true);
    timer.current = setInterval(() => setSecs((n) => { if (n + 1 >= MAX_SECONDS) stop(); return n + 1; }), 1000);
  };

  const send = async () => {
    if (!user || state === "sending" || (!clip && !text.trim())) return;
    setState("sending"); setNote("");
    try {
      const fd = new FormData();
      if (clip) fd.append("audio", clip);
      if (text.trim()) fd.append("text", text.trim());
      fd.append("lang", lang);
      const r = await fetch("/api/game-idea", { method: "POST", headers: { Authorization: `Bearer ${await user.getIdToken()}` }, body: fd });
      if (r.ok) { setState("sent"); setClip(null); setText(""); return; }
      setState("idle");
      setNote(r.status === 422 ? c.notHeard : r.status === 429 ? c.limit : c.failed);
      if (r.status === 422) setClip(null);
    } catch { setState("idle"); setNote(c.failed); }
  };
  const close = () => { stop(); setOpen(false); setState("idle"); setNote(""); };

  return (
    <>
      <style>{CSS}</style>
      <button type="button" className="gi-banner" dir={dir} onClick={() => setOpen(true)}>
        <span className="gi-bulb" aria-hidden="true">💡</span>
        <span className="gi-banner-text">
          <strong>{c.banner}</strong>
          <span>{c.bannerSub}</span>
        </span>
      </button>
      {open && (
        <div className="gi-veil" role="dialog" aria-modal="true" aria-label={c.title} dir={dir} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="gi-box">
            <button type="button" className="gi-x" onClick={close} aria-label={c.close}>✕</button>
            {state === "sent" ? (
              <>
                <div className="gi-big" aria-hidden="true">🎉</div>
                <h2>{c.thanks}</h2>
                <p>{c.thanksSub}</p>
                <button type="button" className="gi-btn" onClick={close}>{c.close}</button>
              </>
            ) : (
              <>
                <div className="gi-big" aria-hidden="true">💡</div>
                <h2>{c.title}</h2>
                <p>{c.lead}</p>
                <p className="gi-lead2">{c.lead2}</p>
                {recording ? (
                  <button type="button" className="gi-btn is-rec" onClick={stop}>⏹ {c.stop} · {c.seconds(secs)}</button>
                ) : clip ? (
                  <div className="gi-row">
                    <span className="gi-ok">✓ {c.recorded}</span>
                    <button type="button" className="gi-link" onClick={() => void start()}>{c.redo}</button>
                  </div>
                ) : (
                  <button type="button" className="gi-btn is-mic" onClick={() => void start()}>🎤 {c.record}</button>
                )}
                <span className="gi-or">{c.or}</span>
                <textarea className="gi-text" dir={dir} rows={3} maxLength={1200} placeholder={c.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
                {note ? <p className="gi-note" role="status">{note}</p> : null}
                <button type="button" className="gi-btn" disabled={state === "sending" || recording || (!clip && !text.trim())} onClick={() => void send()}>
                  {state === "sending" ? c.sending : c.send}
                </button>
                <p className="gi-small">{c.privacy}</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* One look in every theme: the panel is a light card over a dark veil, so its colours are fixed. */
const CSS = `
.gi-banner { display: flex; align-items: center; gap: 14px; width: 100%; margin: 0 0 18px; padding: 14px 18px; border: 0; border-radius: 22px; background: linear-gradient(120deg, #fff3c4, #ffd98a); color: #3b2a12; font: inherit; text-align: start; cursor: pointer; box-shadow: 0 6px 18px #0002; }
.gi-banner:active { transform: scale(0.99); }
.gi-bulb { flex: none; display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: #fff; font-size: 28px; box-shadow: 0 3px 8px #0002; }
.gi-banner-text { display: grid; gap: 2px; min-width: 0; }
.gi-banner-text strong { font-size: 19px; font-weight: 800; }
.gi-banner-text span { font-size: 14px; color: #5b4520; }
.gi-veil { position: fixed; inset: 0; z-index: 1200; display: grid; place-items: center; padding: 16px; background: #0b1220cc; }
.gi-box { position: relative; display: grid; justify-items: center; gap: 12px; width: min(100%, 440px); max-height: calc(100dvh - 32px); overflow: auto; padding: 26px 22px 20px; border-radius: 26px; background: #fffdf6; color: #14202b; text-align: center; box-shadow: 0 20px 60px #0008; }
.gi-box h2 { margin: 0; font-size: 24px; font-weight: 800; color: #14202b; }
.gi-box p { margin: 0; font-size: 16px; line-height: 1.5; color: #3d4852; }
.gi-big { font-size: 44px; line-height: 1; }
.gi-box .gi-lead2 { font-weight: 700; color: #14202b; }
.gi-x { position: absolute; top: 10px; inset-inline-end: 10px; width: 40px; height: 40px; border: 0; border-radius: 50%; background: #eef1f4; color: #14202b; font-size: 16px; cursor: pointer; }
.gi-btn { min-height: 52px; padding: 12px 26px; border: 0; border-radius: 999px; background: #0a7472; color: #fff; font: inherit; font-weight: 800; font-size: 18px; cursor: pointer; box-shadow: 0 4px 0 #075452; }
.gi-btn:disabled { opacity: 0.5; cursor: default; }
.gi-btn.is-mic { background: #c2410c; box-shadow: 0 4px 0 #7c2d12; }
.gi-btn.is-rec { background: #b91c1c; box-shadow: 0 4px 0 #7f1d1d; }
.gi-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; }
.gi-ok { font-weight: 800; color: #166534; }
.gi-link { border: 0; background: transparent; color: #0a5c5a; font: inherit; font-weight: 700; text-decoration: underline; cursor: pointer; }
.gi-or { font-size: 14px; font-weight: 700; color: #5f6b73; }
.gi-text { width: 100%; padding: 12px 14px; border: 2px solid #d9d3c3; border-radius: 16px; background: #fff; color: #14202b; font: inherit; font-size: 17px; line-height: 1.5; resize: vertical; }
.gi-box .gi-note { color: #9a3412; font-weight: 700; }
.gi-box .gi-small { font-size: 13px; color: #5f6b73; }
`;
