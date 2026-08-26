import { NextRequest, NextResponse } from "next/server";
import { verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * POST /api/ocr — extract the text from a photographed page so the Reader can
 * turn it into tappable words. A kid photographs a page of a book / worksheet,
 * we OCR it with a vision model, and hand back the plain text.
 *
 * Auth: signed-in, paid tiers only (the vision call costs money) — same gate
 * as /api/transcribe. Input: multipart form with an `image` file (JPEG/PNG/
 * WEBP/HEIC). Output: { text }.
 *
 * Mirrors the codebase's OpenAI pattern (fetch to api.openai.com with the
 * OPENAI_API_KEY bearer). Uses gpt-4o for reliable multilingual OCR.
 */

export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024; // 8MB — client should downscale before upload

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

    const mime = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
    const buf = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${mime};base64,${buf.toString("base64")}`;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

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
          {
            role: "system",
            content:
              "You are an OCR engine. Transcribe the text in the image EXACTLY as written, " +
              "in its original language and script. Preserve line breaks and paragraph breaks. " +
              "Do not translate, summarize, correct, explain, or add anything. " +
              "Return ONLY the transcribed text. If there is no readable text, return an empty string.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Transcribe the text in this image." },
              { type: "image_url", image_url: { url: dataUri } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[ocr] OpenAI error:", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "ocr_failed" }, { status: 502 });
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = (data.choices?.[0]?.message?.content ?? "").trim();
    return NextResponse.json({ text });
  } catch (e) {
    console.error("[ocr] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
