import type { Firestore, DocumentData } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { loadFamilyProgress, type ChildProgressFull } from "@/lib/family-progress";
import { activationLang } from "@/lib/activation";
import { isInternalEmail } from "@/lib/internal-accounts";
import { renderEmailHtmlV2, mdLiteToHtml, applyName } from "./render";
import { sendDripEmail } from "./send";
import { buildUnsubUrl } from "./registry";

/**
 * Weekly parent report (Gadi 2026-10-21): every Sunday morning (Israel
 * time) each paying Family owner gets one email with, per child, what the
 * child added this week, so the parent sees the value and pushes the child
 * to keep going. It pushes USAGE only: never pausing, cancelling or refunds.
 * A child with nothing this week gets one warm, concrete step (a short game
 * from their own words), never guilt.
 *
 * Numbers: lib/family-progress (loadFamilyProgress), the same function as the
 * parent dashboard (/api/family/progress), so the email and the dashboard
 * always agree. Only children (roles boy / girl); a family with no child is
 * skipped (the activation "add a child" email covers it).
 *
 * Sent by the daily drip cron on Sunday runs (Israel date), once per family
 * per ISO week. Ledger: users/{ownerUid}.weeklyReportSent = "YYYY-Www".
 * Switch: emailConfig/weeklyReport.enabled (off until Gadi approves).
 * Copy: Hebrew and English in code; every other language gets the English
 * email (LTR), with links in the family's own language.
 */

export const WEEKLY_REPORT_CONFIG_DOC = "emailConfig/weeklyReport";
export const WEEKLY_REPORT_KEY = "weekly-report";

export async function weeklyReportEnabled(db: Firestore): Promise<boolean> {
  try {
    const s = await db.doc(WEEKLY_REPORT_CONFIG_DOC).get();
    return s.exists && s.data()?.enabled === true;
  } catch {
    return false;
  }
}

/** Israel calendar date "YYYY-MM-DD" of a moment. */
function ilDate(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}

/** Is it Sunday in Israel? */
export function isSundayIL(ms: number): boolean {
  const d = ilDate(ms);
  return new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10))).getUTCDay() === 0;
}

/** ISO week "YYYY-Www" of the Israel calendar date (weeks start Monday, so a
 *  Sunday closes its ISO week: one report per Sunday). */
export function isoWeekIL(ms: number): string {
  const d = ilDate(ms);
  const t = new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)));
  const day = t.getUTCDay() || 7; // Mon=1 .. Sun=7
  t.setUTCDate(t.getUTCDate() + 4 - day); // the Thursday of this week decides the year
  const year = t.getUTCFullYear();
  const week = Math.ceil(((t.getTime() - Date.UTC(year, 0, 1)) / 86_400_000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Who may get the report at all (day and ledger aside). */
export function weeklyReportEligible(uid: string, email: string | null | undefined, d: DocumentData): boolean {
  const s = d.subscriptionStatus;
  if (s !== "active" && s !== "trialing" && s !== "past_due") return false;
  if (d.familyId !== uid) return false; // the Family owner (payer) only
  if (typeof d.schoolId === "string" && d.schoolId === uid) return false; // a school account
  if (!email || isInternalEmail(email)) return false;
  if (d.emailSuppressed === true || d.dripUnsubscribed === true) return false;
  return true;
}

/** Due on this run: eligible, a Sunday in Israel, not sent this ISO week. */
export function weeklyReportDue(uid: string, email: string | null | undefined, d: DocumentData, now: number): boolean {
  if (!isSundayIL(now)) return false;
  if (d.weeklyReportSent === isoWeekIL(now)) return false;
  return weeklyReportEligible(uid, email, d);
}

// ── Rendering ──────────────────────────────────────────────────────────

export type ReportChild = Pick<ChildProgressFull, "name" | "role" | "linked" | "total" | "thisWeek" | "streak" | "weekList" | "learning">;

const MAX_WORDS = 5;
const SITE = "https://www.gadit.app";

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

/** A word or name keeps its own direction inside the email (a Hebrew word in
 *  an English email, an English word in a Hebrew one). */
function dirOf(s: string): "rtl" | "ltr" {
  return /[֐-׿؀-ۿ]/.test(s) ? "rtl" : "ltr";
}
const iso = (s: string) => `<span dir="${dirOf(s)}">${esc(s)}</span>`;

function link(lang: string, path: string, content: string): string {
  const base = lang === "en" || !lang ? SITE : `${SITE}/${lang}`;
  const sep = path.includes("?") ? "&" : "?";
  return `${base}${path}${sep}utm_source=weekly-report&utm_medium=email&utm_campaign=weekly-report&utm_content=${content}`;
}

type Copy = {
  subjectActive: (one: ReportChild | null) => string;
  subjectQuiet: (one: ReportChild | null) => string;
  greeting: string;
  introActive: (one: ReportChild | null) => string;
  introQuiet: (one: ReportChild | null) => string;
  together: (n: number) => string;
  childName: (c: ReportChild) => string;
  newLabel: (n: number) => string;
  wordsLabel: string;
  more: (n: number) => string;
  total: (n: number) => string;
  streak: (n: number) => string;
  learned: (c: ReportChild) => string;
  idea: string;
  ideaGame: (c: ReportChild) => string;
  ideaFirst: (c: ReportChild) => string;
  ideaConnect: (c: ReportChild) => string;
  playCta: string;
  connectCta: string;
  outroActive: string;
  outroQuiet: string;
  cta: string;
  next: string;
};

const g = (c: ReportChild, boy: string, girl: string) => (c.role === "girl" ? girl : boy);
const possEn = (c: ReportChild) => (c.name.trim() ? `${c.name.trim()}'s` : "your child's");

/** Escape, and in a right-to-left email keep Latin runs (a name, Gadit) in their own order. */
function textHtml(s: string, rtl: boolean): string {
  const e = esc(s);
  return rtl ? e.replace(/[A-Za-z][A-Za-z0-9']*(?:[ .][A-Za-z0-9']+)*/g, (m) => `<span dir="ltr">${m}</span>`) : e;
}

const HE: Copy = {
  subjectActive: (one) => (one ? `מה ${one.name.trim()} ${g(one, "למד", "למדה")} השבוע ב-Gadit` : "מה הילדים שלכם למדו השבוע ב-Gadit"),
  subjectQuiet: (one) => (one ? `רעיון קטן לשבוע של ${one.name.trim()} ב-Gadit` : "רעיון קטן לשבוע של הילדים ב-Gadit"),
  greeting: "היי {שם},",
  introActive: (one) => (one ? `הנה הסיכום השבועי של ${one.name.trim()} ב-Gadit.` : "הנה הסיכום השבועי של הילדים שלכם ב-Gadit."),
  introQuiet: (one) => (one ? `שבוע חדש מתחיל, והנה רעיון קטן לפתוח אותו יחד עם ${one.name.trim()}.` : "שבוע חדש מתחיל, והנה רעיון קטן לפתוח אותו יחד עם הילדים."),
  together: (n) => (n === 1 ? "יחד נוספה השבוע מילה חדשה אחת למחברות." : `יחד נוספו השבוע ${n} מילים חדשות למחברות.`),
  childName: (c) => c.name.trim() || g(c, "הילד", "הילדה"),
  newLabel: (n) => (n === 1 ? "מילה חדשה השבוע" : "מילים חדשות השבוע"),
  wordsLabel: "המילים:",
  more: (n) => (n === 1 ? "ועוד אחת" : `ועוד ${n}`),
  total: (n) => (n === 1 ? "במחברת: מילה אחת" : `במחברת: ${n} מילים`),
  streak: (n) => (n === 1 ? "רצף של יום אחד" : `רצף של ${n} ימים`),
  learned: (c) => {
    const l = c.learning;
    if (!l || !l.learnedWeek) return "";
    const lang = l.lang === "en" ? "אנגלית" : "עברית";
    return l.learnedWeek === 1 ? `בלימוד ${lang}: מילה אחת נלמדה עד הסוף השבוע` : `בלימוד ${lang}: ${l.learnedWeek} מילים נלמדו עד הסוף השבוע`;
  },
  idea: "רעיון לשבוע הזה:",
  ideaGame: (c) => `5 דקות עם משחק מהמילים של ${HE.childName(c)}. המילים שכבר ${g(c, "שמר", "שמרה")} מחכות שם.`,
  ideaFirst: (c) => `5 דקות עם משחק קצר, ואחר כך מחפשים יחד מילה אחת מהספר או משיעורי הבית. היא תישמר במחברת של ${HE.childName(c)}.`,
  ideaConnect: (c) => `כדי לראות כאן מה ${HE.childName(c)} ${g(c, "לומד", "לומדת")}, מחברים ${g(c, "לו מכשיר משלו", "לה מכשיר משלה")} או משתמשים במצב ילדים במכשיר שלכם.`,
  playCta: "למשחקים",
  connectCta: "לחיבור",
  outroActive: "רעיון לשיחה: בחרו מילה אחת מהרשימה ושאלו בארוחת הערב מה היא אומרת. כל מילה שחוזרים אליה נשארת.",
  outroQuiet: "מספיקות כמה דקות ביום. כל מילה שנשמרת במחברת נכנסת למשחקים, וככה אוצר המילים גדל.",
  cta: "ללוח ההורים",
  next: "צריכים עזרה? אפשר פשוט להשיב למייל הזה.",
};

const EN: Copy = {
  subjectActive: (one) => (one ? `What ${one.name.trim()} learned on Gadit this week` : "What your kids learned on Gadit this week"),
  subjectQuiet: (one) => (one ? `A small idea for ${one.name.trim()}'s week on Gadit` : "A small idea for your kids' week on Gadit"),
  greeting: "Hi {name},",
  introActive: (one) => (one ? `Here is ${one.name.trim()}'s weekly summary on Gadit.` : "Here is your kids' weekly summary on Gadit."),
  introQuiet: (one) => (one ? `A new week is starting, and here is a small idea to open it together with ${one.name.trim()}.` : "A new week is starting, and here is a small idea to open it together with your kids."),
  together: (n) => (n === 1 ? "Together, 1 new word went into the notebooks this week." : `Together, ${n} new words went into the notebooks this week.`),
  childName: (c) => c.name.trim() || "Your child",
  newLabel: (n) => (n === 1 ? "new word this week" : "new words this week"),
  wordsLabel: "The words:",
  more: (n) => `and ${n} more`,
  total: (n) => (n === 1 ? "In the notebook: 1 word" : `In the notebook: ${n} words`),
  streak: (n) => (n === 1 ? "A 1-day streak" : `A ${n}-day streak`),
  learned: (c) => {
    const l = c.learning;
    if (!l || !l.learnedWeek) return "";
    const lang = l.lang === "en" ? "English" : "Hebrew";
    return l.learnedWeek === 1 ? `Learning ${lang}: 1 word fully learned this week` : `Learning ${lang}: ${l.learnedWeek} words fully learned this week`;
  },
  idea: "An idea for this week:",
  ideaGame: (c) => `5 minutes with a game made from ${possEn(c)} own words. The words already saved are waiting there.`,
  ideaFirst: (c) => `5 minutes with a short game, then look up one word together from a book or homework. It is saved to ${possEn(c)} notebook.`,
  ideaConnect: (c) => `To see here what ${c.name.trim() || "your child"} is learning, connect a device of their own or use Kids Mode on your device.`,
  playCta: "Open the games",
  connectCta: "Connect",
  outroActive: "An idea for the dinner table: pick one word from the list and ask what it means. Every word you come back to stays.",
  outroQuiet: "A few minutes a day is enough. Every word saved to the notebook goes into the games, and that is how a vocabulary grows.",
  cta: "Open the parent dashboard",
  next: "Need help? Just reply to this email.",
};

function childCard(c: ReportChild, C: Copy, rtl: boolean, linkLang: string): string {
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";
  const name = C.childName(c);
  const parts: string[] = [];
  parts.push(`<div dir="${dir}" style="text-align:${align};font-size:17px;font-weight:700;color:#111827;margin:0 0 8px;">${iso(name)}</div>`);
  const meta: string[] = [];
  if (c.thisWeek > 0) {
    parts.push(
      `<div dir="${dir}" style="text-align:${align};margin:0 0 10px;color:#374151;font-size:15px;"><span style="font-size:28px;font-weight:700;color:#0E7490;">${c.thisWeek}</span>&nbsp;&nbsp;${esc(C.newLabel(c.thisWeek))}</div>`,
    );
    const shown = c.weekList.slice(0, MAX_WORDS);
    if (shown.length) {
      const chips = shown
        .map((w) => `<span dir="${dirOf(w)}" style="display:inline-block;background:#FFFFFF;border:1px solid #D6E4E1;border-radius:999px;padding:3px 11px;margin:0 0 6px ${rtl ? "6px" : "0"};${rtl ? "" : "margin-right:6px;"}font-size:14px;color:#1C1917;">${esc(w)}</span>`)
        .join("");
      const rest = c.weekList.length - shown.length;
      parts.push(
        `<div dir="${dir}" style="text-align:${align};margin:0 0 8px;font-size:14px;color:#6B7280;"><div style="margin:0 0 6px;">${esc(C.wordsLabel)}</div>${chips}${rest > 0 ? `<span style="font-size:14px;color:#6B7280;">${esc(C.more(rest))}</span>` : ""}</div>`,
      );
    }
    if (c.total > 0) meta.push(C.total(c.total));
    if (c.streak > 0) meta.push(C.streak(c.streak));
  } else {
    const [text, cta, path, content] = !c.linked
      ? [C.ideaConnect(c), C.connectCta, "/family?tab=members", "connect"]
      : c.total > 0
        ? [C.ideaGame(c), C.playCta, "/play", "play"]
        : [C.ideaFirst(c), C.playCta, "/play", "play-first"];
    parts.push(
      `<div dir="${dir}" style="text-align:${align};margin:0 0 8px;font-size:15px;line-height:1.7;color:#374151;"><b>${esc(C.idea)}</b><br>${textHtml(text, rtl)}</div>`,
      `<div dir="${dir}" style="text-align:${align};margin:0 0 6px;"><a href="${link(linkLang, path, content)}" style="color:#0E7490;font-weight:700;text-decoration:underline;font-size:15px;">${esc(cta)}</a></div>`,
    );
    if (c.total > 0) meta.push(C.total(c.total));
    if (c.streak > 0) meta.push(C.streak(c.streak));
  }
  const learned = C.learned(c);
  if (learned) meta.push(learned);
  if (meta.length) {
    parts.push(`<div dir="${dir}" style="text-align:${align};margin:6px 0 0;font-size:13px;line-height:1.6;color:#6B7280;">${meta.map((m) => textHtml(m, rtl)).join(" · ")}</div>`);
  }
  return `<div dir="${dir}" style="text-align:${align};background:#F6FAF9;border:1px solid #E1EAE7;border-radius:12px;padding:16px 18px;margin:0 0 14px;">${parts.join("")}</div>`;
}

/** Pure renderer (cron, admin preview, sample). `lang` is the copy language
 *  ("he" or "en"); `linkLang` is the family's own UI language for the links. */
export function renderWeeklyReport(
  kids: ReportChild[],
  opts: { lang: string; linkLang?: string; firstName: string | null; unsubscribeUrl: string },
): { subject: string; html: string; text: string } {
  const he = opts.lang === "he";
  const C = he ? HE : EN;
  const contentLang = he ? "he" : "en";
  const linkLang = opts.linkLang || contentLang;
  const active = kids.filter((k) => k.thisWeek > 0);
  // One named child: the subject and intro use the name; otherwise "the kids".
  const one = kids.length === 1 && kids[0].name.trim() ? kids[0] : null;
  const subject = active.length ? C.subjectActive(one) : C.subjectQuiet(one);
  const fill = (s: string) => applyName(s, opts.firstName);
  const weekTotal = kids.reduce((s, k) => s + k.thisWeek, 0);
  const intro = [fill(C.greeting), active.length ? C.introActive(one) : C.introQuiet(one)];
  if (active.length && kids.length > 1) intro.push(C.together(weekTotal));
  const bodyHtml =
    mdLiteToHtml(contentLang, intro.join("\n\n")) +
    kids.map((k) => childCard(k, C, he, linkLang)).join("") +
    mdLiteToHtml(contentLang, active.length ? C.outroActive : C.outroQuiet);
  const helpBase = linkLang === "en" ? SITE : `${SITE}/${linkLang}`;
  const html = renderEmailHtmlV2({
    he,
    lang: contentLang,
    bodyHtml,
    ctaText: C.cta,
    ctaUrl: link(linkLang, "/family", "dashboard"),
    next: C.next,
    helpUrl: `${helpBase}/help`,
    unsubscribeUrl: opts.unsubscribeUrl,
  });
  const text = [
    `Subject: ${subject}`,
    ...kids.map((k) => {
      const bits = [`${C.childName(k)} [${k.role}${k.linked ? "" : ", not linked"}]: week ${k.thisWeek}, total ${k.total}, streak ${k.streak}`];
      if (k.weekList.length) bits.push(`words: ${k.weekList.slice(0, MAX_WORDS).join(", ")}${k.weekList.length > MAX_WORDS ? ` (+${k.weekList.length - MAX_WORDS})` : ""}`);
      if (k.learning?.learnedWeek) bits.push(`learning ${k.learning.lang}: ${k.learning.learnedWeek} this week`);
      if (k.thisWeek === 0) bits.push(`nudge: ${!k.linked ? "connect" : k.total > 0 ? "play" : "play-first"}`);
      return bits.join("; ");
    }),
  ].join("\n");
  return { subject, html, text };
}

/** The family's children (boy / girl only), from the dashboard's own numbers. */
export async function loadReportChildren(ownerUid: string): Promise<ChildProgressFull[]> {
  const p = await loadFamilyProgress(ownerUid);
  return p.children.filter((c) => c.role === "boy" || c.role === "girl");
}

/** Copy language for a family: Hebrew or English (every other UI language
 *  reads the English email); links keep the family's own UI language. */
export function weeklyReportLangs(d: DocumentData, override?: string | null): { lang: "he" | "en"; linkLang: string } {
  const ui = override || activationLang(d);
  return { lang: ui === "he" ? "he" : "en", linkLang: ui };
}

/** Build the report for one owner; null when the family has no child. */
export async function buildWeeklyReport(p: {
  ownerUid: string;
  d: DocumentData;
  firstName: string | null;
  lang?: string | null;
}): Promise<{ subject: string; html: string; text: string; kids: ChildProgressFull[] } | null> {
  const kids = await loadReportChildren(p.ownerUid);
  if (!kids.length) return null;
  const { lang, linkLang } = weeklyReportLangs(p.d, p.lang);
  const r = renderWeeklyReport(kids, { lang, linkLang, firstName: p.firstName, unsubscribeUrl: buildUnsubUrl(p.ownerUid) });
  return { ...r, kids };
}

/** Build, send (scheduled: waits out Shabbat) and mark the ISO-week ledger. */
export async function sendWeeklyReport(
  db: Firestore,
  p: { uid: string; email: string; d: DocumentData; firstName: string | null; now: number },
): Promise<{ ok: true } | { ok: false; skipped?: boolean; reason: string }> {
  const built = await buildWeeklyReport({ ownerUid: p.uid, d: p.d, firstName: p.firstName });
  if (!built) return { ok: false, skipped: true, reason: "no_child" };
  const r = await sendDripEmail({ to: p.email, subject: built.subject, html: built.html, scheduled: true });
  if (!r.ok) return { ok: false, reason: r.reason };
  await db.collection("users").doc(p.uid).set(
    { weeklyReportSent: isoWeekIL(p.now), weeklyReportAt: FieldValue.serverTimestamp(), weeklyReportMessageId: r.id ?? null },
    { merge: true },
  );
  return { ok: true };
}

/** Sample children for a preview without a real family. */
export function sampleReportChildren(lang: string): ReportChild[] {
  const he = lang === "he";
  return [
    { name: he ? "נועה" : "Noa", role: "girl", linked: true, total: 42, thisWeek: 7, streak: 3, weekList: he ? ["פוטוסינתזה", "ענן", "מקור", "גבול", "סבלנות", "דמיון", "אומץ"] : ["photosynthesis", "cloud", "source", "border", "patience", "imagination", "courage"], learning: null },
    { name: he ? "איתי" : "Itai", role: "boy", linked: true, total: 12, thisWeek: 0, streak: 0, weekList: [], learning: null },
  ];
}
