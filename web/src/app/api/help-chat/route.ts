import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { answerHelp, type HelpMsg, type HelpPlatform } from "@/lib/help-chat/engine";
import { customerCategory, isInternalEmail } from "@/lib/internal-accounts";
import { isIosAppUA } from "@/lib/native-app";
import { LANGUAGES } from "@/lib/i18n";
import { logAiUsage } from "@/lib/ai-cost";
import { sendMail } from "@/lib/mail";
import { helpUi } from "@/lib/help-chat/ui";
import type { KbItem } from "@/lib/help-chat/kb";

/**
 * The help assistant (Gadi 2026-11-15; the council's guardrails).
 *
 * GET  /api/help-chat?lang=xx    -> { enabled, email, test, ui } for the signed-in caller
 *                                   (ui: the window's words in that language)
 * POST /api/help-chat            { lang, platform, convId, kidsMode, messages }
 *                                -> { reply, escalate, reason, linkId, logId, email }
 * POST /api/help-chat            { feedback: { logId, helped } } -> { ok }
 *
 * The switch is Firestore config/helpChat { enabled, audience: "testers" | "all",
 * userDaily, globalDaily, dollarDaily }. No document = off. "testers" lets in
 * users/{uid}.tester and our own accounts only. A child profile, Kids Mode and
 * signed-out visitors never get it. Limits per UTC day: questions per user,
 * questions for everyone, and dollars for everyone (helpChatDaily/{day}).
 * Every question and answer goes to helpLogs (kept 180 days: expireAt). A
 * hand-off emails the team (NOTIFY_EMAIL) with reply-to the user.
 */

export const maxDuration = 45;

type Cfg = { enabled: boolean; audience: "testers" | "all"; userDaily: number; globalDaily: number; dollarDaily: number };
const LANG_CODES = new Set(LANGUAGES.map((l) => l.code as string));
const day = () => new Date().toISOString().slice(0, 10);
const KEEP_DAYS = 180;

async function config(): Promise<Cfg> {
  try {
    const d = (await getAdminDb().collection("config").doc("helpChat").get()).data() ?? {};
    const n = (v: unknown, f: number) => (typeof v === "number" && v > 0 ? v : f);
    return { enabled: d.enabled === true, audience: d.audience === "all" ? "all" : "testers", userDaily: n(d.userDaily, 20), globalDaily: n(d.globalDaily, 300), dollarDaily: n(d.dollarDaily, 5) };
  } catch {
    return { enabled: false, audience: "testers", userDaily: 20, globalDaily: 300, dollarDaily: 5 };
  }
}

async function who(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  const token = h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
  if (!token) return null;
  try {
    const t = await getAdminAuth().verifyIdToken(token);
    const u = (await getAdminDb().collection("users").doc(t.uid).get()).data() ?? {};
    const email = (typeof t.email === "string" ? t.email : typeof u.email === "string" ? u.email : "") || "";
    return {
      uid: t.uid, email, tester: u.tester === true, internal: isInternalEmail(email),
      kid: u.familyRole === "kid", familyId: typeof u.familyId === "string" ? u.familyId : null,
      plan: customerCategory(u, t.uid), name: typeof u.displayName === "string" ? u.displayName : typeof u.name === "string" ? u.name : "",
    };
  } catch {
    return null;
  }
}

type Who = NonNullable<Awaited<ReturnType<typeof who>>>;

// Items Gadi adds or fixes on /admin/help-chat (Firestore helpKb), on top of lib/help-chat/kb.ts.
let added: { at: number; items: KbItem[] } | null = null;
async function addedKb(): Promise<KbItem[]> {
  if (added && Date.now() - added.at < 60_000) return added.items;
  try {
    const snap = await getAdminDb().collection("helpKb").get();
    const items = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as { q?: string; a?: string; money?: boolean; enabled?: boolean; order?: number }) }))
      .filter((k) => k.enabled !== false && typeof k.q === "string" && typeof k.a === "string" && k.q.trim() !== "" && k.a.trim() !== "")
      .sort((x, y) => (x.order ?? 0) - (y.order ?? 0))
      .map((k): KbItem => ({ id: k.id, q: String(k.q), a: String(k.a), ...(k.money ? { money: true as const } : {}) }));
    added = { at: Date.now(), items };
    return items;
  } catch {
    return added?.items ?? [];
  }
}
const allowed = (cfg: Cfg, w: Who) => cfg.enabled && !w.kid && (cfg.audience === "all" || w.tester || w.internal);

export async function GET(req: NextRequest) {
  const w = await who(req);
  if (!w) return NextResponse.json({ enabled: false });
  const cfg = await config();
  if (!allowed(cfg, w)) return NextResponse.json({ enabled: false });
  const lang = req.nextUrl.searchParams.get("lang") ?? "en";
  return NextResponse.json({ enabled: true, email: w.email, test: cfg.audience !== "all", ui: helpUi(LANG_CODES.has(lang) ? lang : "en") });
}

/** Store app or website. When it is not clear, it is the app (the stricter rules). */
function platformOf(req: NextRequest, said: unknown): HelpPlatform {
  if (isIosAppUA(req.headers.get("user-agent"))) return "ios";
  if (said === "ios") return "ios";
  // The tab itself knows (html[data-play], set per tab in layout.tsx); anything else is the app.
  return said === "web" ? "web" : "play";
}

function cleanMessages(v: unknown): HelpMsg[] {
  if (!Array.isArray(v)) return [];
  const out = v
    .filter((m): m is { role: string; content: string } => !!m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 1000) }))
    .filter((m) => m.content.trim())
    .slice(-10);
  while (out.length && out[0].role !== "user") out.shift();
  return out.length && out[out.length - 1].role === "user" ? out : [];
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

async function handOff(w: Who, o: { lang: string; platform: string; reason: string; messages: HelpMsg[]; answer: string }) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  const talk = [...o.messages, { role: "assistant" as const, content: o.answer || "(הודעת העברה לצוות)" }].slice(-7)
    .map((m) => `<p style="margin:6px 0"><b>${m.role === "user" ? "המשתמש" : "העוזר"}:</b> ${esc(m.content).replace(/\n/g, "<br>")}</p>`).join("");
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;color:#111">
<p><b>שאלה בעוזר שצריכה אדם</b> (סיבה: ${esc(o.reason)})</p>
<p>${esc(w.name || "בלי שם")} · ${esc(w.email || "בלי מייל")} · תוכנית ${esc(w.plan)} · ${esc(o.platform)} · שפה ${esc(o.lang)}</p>
${talk}
<p style="color:#666;font-size:13px">תשובה למייל הזה תגיע ישר למשתמש.</p></div>`;
  try {
    await sendMail({ from: "Gadit <notify@gadit.app>", to, subject: `🆘 העוזר של Gadit: ${o.reason} · ${w.email || w.uid}`, html, ...(w.email ? { replyTo: w.email } : {}) });
  } catch { /* the log keeps it either way */ }
}

export async function POST(req: NextRequest) {
  const w = await who(req);
  if (!w) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const db = getAdminDb();

  // "Did it help?" on one answer: only the asker's own log.
  if (body.feedback && typeof body.feedback === "object") {
    const f = body.feedback as { logId?: unknown; helped?: unknown };
    if (typeof f.logId !== "string" || typeof f.helped !== "boolean") return NextResponse.json({ error: "bad_request" }, { status: 400 });
    const ref = db.collection("helpLogs").doc(f.logId);
    const snap = await ref.get();
    if (!snap.exists || snap.get("uid") !== w.uid) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await ref.update({ helped: f.helped, helpedAt: new Date() });
    return NextResponse.json({ ok: true });
  }

  const cfg = await config();
  if (!allowed(cfg, w) || body.kidsMode === true) return NextResponse.json({ error: "not_available" }, { status: 403 });
  const messages = cleanMessages(body.messages);
  if (!messages.length) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const lang = typeof body.lang === "string" && LANG_CODES.has(body.lang) ? body.lang : "en";
  const platform = platformOf(req, body.platform);
  const convId = typeof body.convId === "string" ? body.convId.slice(0, 40) : "";

  // Limits: this user's questions today, everyone's questions and dollars today.
  const today = day();
  const dailyRef = db.collection("helpChatDaily").doc(today);
  const rateRef = db.collection("helpChatRate").doc(`${w.uid}_${today}`);
  const [daily, rate] = await Promise.all([dailyRef.get(), rateRef.get()]);
  const limited = (Number(rate.get("count") ?? 0) >= cfg.userDaily) || (Number(daily.get("count") ?? 0) >= cfg.globalDaily) || (Number(daily.get("cost") ?? 0) >= cfg.dollarDaily);
  if (limited) return NextResponse.json({ limited: true, reply: "", escalate: false });

  let a;
  try {
    a = await answerHelp({ messages, lang, platform, plan: w.plan, extra: await addedKb() });
  } catch (e) {
    console.error("help-chat: model failed", e);
    return NextResponse.json({ failed: true, reply: "", escalate: false });
  }
  void logAiUsage({ feature: "help_chat", model: a.model, costUsd: a.costUsd, tokensIn: a.tokensIn, tokensOut: a.tokensOut, plan: w.plan, admin: w.internal });
  const inc = FieldValue.increment;
  await Promise.all([
    dailyRef.set({ day: today, count: inc(1), cost: inc(a.costUsd), escalated: inc(a.escalate ? 1 : 0) }, { merge: true }),
    rateRef.set({ uid: w.uid, day: today, count: inc(1), expireAt: new Date(Date.now() + 3 * 864e5) }, { merge: true }),
  ]).catch(() => undefined);

  const question = messages[messages.length - 1].content;
  let logId = "";
  try {
    const ref = await db.collection("helpLogs").add({
      uid: w.uid, email: w.email, familyId: w.familyId, convId, lang, platform, plan: w.plan, tester: w.tester, internal: w.internal,
      question, answer: a.answer, escalate: a.escalate, reason: a.reason, linkId: a.linkId,
      tokensIn: a.tokensIn, cachedIn: a.cachedIn, tokensOut: a.tokensOut, cost: a.costUsd, model: a.model,
      helped: null, ts: new Date(), expireAt: new Date(Date.now() + KEEP_DAYS * 864e5),
    });
    logId = ref.id;
  } catch (e) {
    console.warn("help-chat: log failed", e);
  }
  if (a.escalate) void handOff(w, { lang, platform, reason: a.reason, messages, answer: a.answer });
  return NextResponse.json({ reply: a.answer, escalate: a.escalate, reason: a.reason, linkId: a.linkId, logId, email: a.escalate ? w.email : "" });
}
