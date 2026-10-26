import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";
import { logAiUsage, usageFrom, TEXT_MODEL } from "@/lib/ai-cost";

/**
 * POST /api/ocr — extract the text from a photographed page OR an uploaded PDF
 * so the Reader can turn it into tappable words. A kid photographs / uploads a
 * page of a book or worksheet, we extract the text, and hand it back.
 *
 * Auth: signed-in, paid tiers only (the model call costs money) — same gate as
 * /api/transcribe. Input: multipart form with an `image` file (JPEG/PNG/WEBP/
 * HEIC) OR a `application/pdf`. Output: { text, legible, unsure }: words the
 * model could not read come back as ⟦?⟧ (never a guessed word), `unsure` counts
 * them, `legible` is "good" | "poor" | "unreadable" (then `text` is empty).
 *
 * Both go to TEXT_MODEL in one transcription call: images as an `image_url` part, PDFs as a `file` part
 * (OpenAI reads the PDF directly, handling BOTH text-based and scanned PDFs —
 * no local rasterization/canvas dependency needed). Mirrors the codebase's
 * OpenAI fetch pattern.
 */

export const maxDuration = 120;

// Vercel caps a serverless request body around 4.5MB, so anything larger never
// reaches this handler intact. Keep the accepted size just under that and give
// a clear "too large" message rather than a mysterious platform failure.
const MAX_BYTES = 4.3 * 1024 * 1024;

const OCR_SYSTEM =
  "You are an OCR engine. Transcribe the text in the image EXACTLY as written, " +
  "in its original language and script. Transcribe EVERY word, in order, and do " +
  "not skip, omit, merge, or drop any word, even if the scan is imperfect or " +
  "skewed. Copy each word letter for letter, exactly as printed. Do NOT 'fix', " +
  "modernize, or normalize spelling, and do NOT add, drop, or reorder any " +
  "letter. If a word looks unusual, still transcribe the exact letters you see " +
  "rather than guessing a more common word. " +
  "NEVER GUESS: if you cannot read a word with certainty from the letters " +
  "themselves, write ⟦?⟧ in its place instead of a likely-looking word. Do not " +
  "use the meaning of the sentence to fill in a word you cannot see. " +
  "For HEBREW: transcribe the exact consonants only and do NOT include niqqud " +
  "(vowel points) — the niqqud is added separately. Be especially careful with " +
  "the mater lectionis letters yod (י) and vav (ו): do not insert an extra yod " +
  "or vav that is not printed, do not remove one that is printed, and never " +
  "change a word's spelling to a different but similar-looking word (for " +
  "example keep נגיף as נגיף, not ניגף). " +
  "For a multi-page document, transcribe every page in reading order, separated " +
  "by a blank line. Preserve line breaks and paragraph breaks. Do not translate, " +
  "summarize, correct, explain, apologize, or add any commentary. " +
  "Reply with JSON only, in this shape: " +
  '{"text": "<the transcribed text>", "legible": "good" | "poor" | "unreadable"}. ' +
  '"legible" judges the image: "good" when every word could be read with ' +
  'certainty, "poor" when some words could not (they are the ⟦?⟧ marks), ' +
  '"unreadable" when the image is too blurry, dark or small to read the text. ' +
  'If there is genuinely no readable text, return {"text": "", "legible": "unreadable"} ' +
  "(never a sentence explaining that you cannot read it).";

/** The mark the model writes in place of a word it cannot read (Gadi
 *  2026-10-26: a blurry photo made it invent 12 plausible words instead). */
const UNSURE = "⟦?⟧";

type Legible = "good" | "poor" | "unreadable";

/** Read the model's JSON reply. Anything that is not the expected JSON is
 *  treated as the plain transcription (the behavior before the JSON shape). */
function parseOcrReply(raw: string): { text: string; legible: Legible } {
  const body = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const j = JSON.parse(body) as { text?: unknown; legible?: unknown };
    if (j && typeof j === "object" && typeof j.text === "string") {
      const l = String(j.legible ?? "").toLowerCase();
      return { text: j.text, legible: l === "poor" || l === "unreadable" ? l : "good" };
    }
  } catch { /* not JSON: fall through */ }
  return { text: raw, legible: "good" };
}

/**
 * A sideways or upside-down photo makes the model guess words instead of
 * reading them (Gadi 2026-10-13: Ziv's "בוודאי הבנתם" came back "בוודאי
 * נזכרתם"). So the photo is turned upright first: EXIF orientation, then the
 * same photo in 4 rotations, small, and the model picks the upright one
 * (4 out of 4 in testing, about 400 tokens). Any failure keeps the photo as it is.
 */
async function uprightImage(buf: Buffer): Promise<{ buf: Buffer; type: string } | null> {
  try {
    const sharp = (await import("sharp")).default;
    const base = await sharp(buf).rotate().jpeg({ quality: 90 }).toBuffer();
    const ROT = [0, 90, 180, 270];
    const variants = await Promise.all(ROT.map((d) => sharp(base).rotate(d).resize(512, 512, { fit: "inside" }).jpeg({ quality: 70 }).toBuffer()));
    const content = [
      { type: "text", text: 'These are the same photo in 4 rotations, labelled A, B, C, D in order. In which one is the text upright and readable (letters standing the right way, lines horizontal)? Reply with JSON only: {"upright": "A"}.' },
      ...variants.flatMap((b, i) => [
        { type: "text", text: "ABCD"[i] },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${b.toString("base64")}`, detail: "low" } },
      ]),
    ];
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: TEXT_MODEL, temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "user", content }] }),
    });
    if (!res.ok) return { buf: base, type: "image/jpeg" };
    const data = await res.json();
    { const u = usageFrom(data); void logAiUsage({ feature: "ocr_orient", model: TEXT_MODEL, tokensIn: u.tokensIn, tokensOut: u.tokensOut }); }
    const letter = String(JSON.parse(data.choices?.[0]?.message?.content ?? "{}").upright ?? "A").trim().toUpperCase();
    const deg = ROT["ABCD".indexOf(letter)] ?? 0;
    return { buf: deg ? await sharp(base).rotate(deg).jpeg({ quality: 90 }).toBuffer() : base, type: "image/jpeg" };
  } catch (e) {
    console.warn("[ocr] upright step skipped:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
    if (userInfo.plan === "basic") {
      return NextResponse.json({ error: "upgrade_required", requiredPlan: "clear" }, { status: 402 });
    }

    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "no_image" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "image_too_large" }, { status: 413 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

    const isPdf = file.type === "application/pdf";
    let buf: Buffer = Buffer.from(await file.arrayBuffer());
    let imgType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
    if (!isPdf) {
      const up = await uprightImage(buf);
      if (up) { buf = up.buf; imgType = up.type; }
    }
    const b64 = buf.toString("base64");

    // Images -> image_url part; PDFs -> file part (OpenAI reads the PDF itself).
    const userContent = isPdf
      ? [
          { type: "text", text: "Transcribe all the text in this document." },
          {
            type: "file",
            file: {
              filename: (file instanceof File && file.name) || "document.pdf",
              file_data: `data:application/pdf;base64,${b64}`,
            },
          },
        ]
      : [
          { type: "text", text: "Transcribe the text in this image." },
          {
            type: "image_url",
            // detail:"high" forces full-resolution analysis instead of the
            // default down-tiled pass — materially better on small Hebrew print
            // where a thin yod/vav is easily lost or hallucinated (Gadi 2026-09-19).
            image_url: {
              url: `data:${imgType};base64,${b64}`,
              detail: "high",
            },
          },
        ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        temperature: 0,
        // One call returns the text AND how legible the photo was.
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: OCR_SYSTEM },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[ocr] OpenAI error:", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "ocr_failed" }, { status: 502 });
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    { const u = usageFrom(data); void logAiUsage({ feature: "ocr", model: TEXT_MODEL, tokensIn: u.tokensIn, tokensOut: u.tokensOut, plan: userInfo.plan }); }
    const parsed = parseOcrReply(data.choices?.[0]?.message?.content ?? "");
    let text = parsed.text.trim();
    let legible: Legible = parsed.legible;
    // A blank/black frame makes the model reply with a refusal ("I'm sorry, I
    // can't transcribe…") instead of empty. Treat that as no text so the client
    // shows a real error rather than loading the apology as the passage.
    const low = text.toLowerCase();
    if (
      text.length < 300 &&
      (low.startsWith("i'm sorry") || low.startsWith("i am sorry") || low.startsWith("sorry") ||
        low.includes("can't transcribe") || low.includes("cannot transcribe") ||
        low.includes("unable to transcribe") || low.includes("no readable text"))
    ) {
      text = "";
    }
    // Words the model could not read are marked, never guessed. Count them;
    // a text that is mostly marks (or has no letters left) is unreadable, and
    // then no text goes back at all, so no caller builds words from it.
    const unsure = text.split(UNSURE).length - 1;
    const words = (text.replaceAll(UNSURE, " ").match(/\p{L}[\p{L}\p{M}'’-]*/gu) ?? []).length;
    if (legible === "unreadable" || !words || unsure >= words) text = "";
    if (!text) legible = "unreadable";
    else if (unsure > 0 && legible === "good") legible = "poor";
    return NextResponse.json({ text, legible, unsure: text ? unsure : 0 });
  } catch (e) {
    console.error("[ocr] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
