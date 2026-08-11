import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { sendPushToOwner } from "@/lib/push";
import { NOTIF_STRINGS } from "@/lib/family-notify-strings";
import { Resend } from "resend";

/**
 * Deliver "your child looked up a word" alerts to a family owner across
 * both channels: a Web Push banner (when they enabled it on a device)
 * and an email fallback (always, so it lands even on an iPhone that
 * never installed the PWA). Copy is rendered in the OWNER'S language, so
 * a Hebrew parent gets Hebrew, a German parent gets German, etc.
 *
 * Language priority: the language the owner was using when they turned
 * notifications on (families/{owner}.notifyPrefs.lang) → their stored
 * uiLang/dripLang → English. Falls back to English per-key for any
 * language not yet in NOTIF_STRINGS.
 *
 * Two shapes:
 *   - instant: one word, sent the moment the child searches it.
 *   - digest:  an end-of-day summary listing the day's words.
 */

const RTL_LANGS = new Set(["he", "ar", "fa"]);

async function resolveOwner(ownerUid: string): Promise<{ email: string | null; lang: string }> {
  let email: string | null = null;
  try {
    email = (await getAdminAuth().getUser(ownerUid)).email ?? null;
  } catch {
    email = null;
  }

  const db = getAdminDb();
  let lang = "en";
  try {
    // 1) what the parent was using when they enabled notifications.
    const fam = await db.collection("families").doc(ownerUid).get();
    const prefLang = fam.data()?.notifyPrefs?.lang as string | undefined;
    if (prefLang && typeof prefLang === "string") {
      lang = prefLang;
    } else {
      // 2) fall back to whatever language we have stored for the user.
      const u = (await db.collection("users").doc(ownerUid).get()).data() as
        | { uiLang?: string; dripLang?: string }
        | undefined;
      lang = u?.uiLang || u?.dripLang || "en";
    }
  } catch {
    lang = "en";
  }
  return { email, lang };
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    await new Resend(key).emails.send({
      from: "Gadit <notify@gadit.app>",
      to,
      subject,
      html,
    });
  } catch (e) {
    console.error("[family-notify] email error:", e);
  }
}

const emailShell = (lang: string, inner: string) =>
  `<div dir="${RTL_LANGS.has(lang) ? "rtl" : "ltr"}" style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1c1917">${inner}<div style="margin-top:20px;font-size:12px;color:#a8a29e">Gadit</div></div>`;

/** One word, right now. */
export async function notifyOwnerInstant(ownerUid: string, kidName: string, word: string): Promise<void> {
  const { email, lang } = await resolveOwner(ownerUid);
  const t = NOTIF_STRINGS[lang] ?? NOTIF_STRINGS.en;

  await sendPushToOwner(ownerUid, {
    title: fill(t.instantTitle, { kid: kidName }),
    body: word,
    url: "/family",
    tag: "kid-search",
  });

  if (email) {
    const subject = fill(t.instantSubject, { kid: kidName, word });
    const lead = fill(t.instantLead, { kid: esc(kidName) });
    const html = emailShell(
      lang,
      `<p style="margin:0 0 12px;font-size:15px">${lead}</p>` +
        `<p style="margin:0;font-size:26px;font-weight:700;color:#0EA5A5">${esc(word)}</p>`,
    );
    await sendEmail(email, subject, html);
  }
}

/** End-of-day summary. items = [{ kidName, word }]. */
export async function notifyOwnerDigest(
  ownerUid: string,
  items: { kidName: string; word: string }[],
): Promise<void> {
  if (items.length === 0) return;
  const { email, lang } = await resolveOwner(ownerUid);
  const t = NOTIF_STRINGS[lang] ?? NOTIF_STRINGS.en;
  const title = fill(t.digestTitle, { n: items.length });
  const preview = items.slice(0, 4).map((i) => i.word).join(", ");

  await sendPushToOwner(ownerUid, { title, body: preview, url: "/family", tag: "kid-digest" });

  if (email) {
    // Group words by child for a readable list.
    const byKid = new Map<string, string[]>();
    for (const it of items) {
      const arr = byKid.get(it.kidName) ?? [];
      arr.push(it.word);
      byKid.set(it.kidName, arr);
    }
    const blocks = Array.from(byKid.entries())
      .map(
        ([kid, words]) =>
          `<p style="margin:0 0 6px;font-weight:600;font-size:14px">${esc(kid)}</p>` +
          `<p style="margin:0 0 16px;font-size:15px;color:#44403c;line-height:1.7">${words.map(esc).join(" · ")}</p>`,
      )
      .join("");
    const html = emailShell(lang, `<p style="margin:0 0 14px;font-size:15px">${esc(fill(t.digestLead, {}))}</p>${blocks}`);
    await sendEmail(email, title, html);
  }
}
