import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * POST /api/ocr — extract the text from a photographed page OR an uploaded PDF
 * so the Reader can turn it into tappable words. A kid photographs / uploads a
 * page of a book or worksheet, we extract the text, and hand it back.
 *
 * Auth: signed-in, paid tiers only (the model call costs money) — same gate as
 * /api/transcribe. Input: multipart form with an `image` file (JPEG/PNG/WEBP/
 * HEIC) OR a `application/pdf`. Output: { text }.
 *
 * Both go to gpt-4o: images as an `image_url` part, PDFs as a `file` part
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
  "skewed. For HEBREW you do NOT need to include niqqud (vowel points) — focus " +
  "on getting every letter and word right; the niqqud is added separately. For " +
  "a multi-page document, transcribe every page in reading order, separated by " +
  "a blank line. Preserve line breaks and paragraph breaks. Do not translate, " +
  "summarize, correct, explain, apologize, or add any commentary. Return ONLY " +
  "the transcribed text. If there is genuinely no readable text, return an " +
  "empty string (never a sentence explaining that you cannot read it).";

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
    const buf = Buffer.from(await file.arrayBuffer());
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
            image_url: { url: `data:${file.type && file.type.startsWith("image/") ? file.type : "image/jpeg"};base64,${b64}` },
          },
        ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0,
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
    let text = (data.choices?.[0]?.message?.content ?? "").trim();
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
    return NextResponse.json({ text });
  } catch (e) {
    console.error("[ocr] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
