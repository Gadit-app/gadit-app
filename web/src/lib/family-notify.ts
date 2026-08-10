import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { sendPushToOwner } from "@/lib/push";
import { Resend } from "resend";

/**
 * Deliver "your child looked up a word" alerts to a family owner across
 * both channels: a Web Push banner (when they enabled it on a device)
 * and an email fallback (always, so it lands even on an iPhone that
 * never installed the PWA). Copy is rendered in the owner's UI language
 * (he / en supported here; everything else falls back to English).
 *
 * Two shapes:
 *   - instant: one word, sent the moment the child searches it.
 *   - digest:  an end-of-day summary listing the day's words.
 */

type OwnerCopyLang = "he" | "en";

async function resolveOwner(ownerUid: string): Promise<{ email: string | null; lang: OwnerCopyLang }> {
  let email: string | null = null;
  try {
    email = (await getAdminAuth().getUser(ownerUid)).email ?? null;
  } catch {
    email = null;
  }
  let lang: OwnerCopyLang = "en";
  try {
    const doc = await getAdminDb().collection("users").doc(ownerUid).get();
    if (doc.data()?.uiLang === "he") lang = "he";
  } catch {
    /* default en */
  }
  return { email, lang };
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
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

const emailShell = (lang: OwnerCopyLang, inner: string) =>
  `<div dir="${lang === "he" ? "rtl" : "ltr"}" style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1c1917">${inner}<div style="margin-top:20px;font-size:12px;color:#a8a29e">Gadit</div></div>`;

/** One word, right now. */
export async function notifyOwnerInstant(ownerUid: string, kidName: string, word: string): Promise<void> {
  const { email, lang } = await resolveOwner(ownerUid);
  const title = lang === "he" ? `${kidName} חיפש/ה מילה` : `${kidName} looked up a word`;

  await sendPushToOwner(ownerUid, { title, body: word, url: "/family", tag: "kid-search" });

  if (email) {
    const subject = lang === "he" ? `${kidName} חיפש/ה: ${word}` : `${kidName} looked up: ${word}`;
    const lead =
      lang === "he"
        ? `${esc(kidName)} חיפש/ה עכשיו מילה במילון:`
        : `${esc(kidName)} just looked up a word in the dictionary:`;
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
  const n = items.length;
  const title =
    lang === "he" ? `סיכום היום: ${n} מילים` : `Today's summary: ${n} word${n === 1 ? "" : "s"}`;
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
    const lead = lang === "he" ? "המילים שהילדים חיפשו היום:" : "Words your kids looked up today:";
    const html = emailShell(lang, `<p style="margin:0 0 14px;font-size:15px">${lead}</p>${blocks}`);
    await sendEmail(email, title, html);
  }
}
