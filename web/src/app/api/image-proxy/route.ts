import { NextRequest, NextResponse } from "next/server";
import { isAllowedImageUrl } from "@/lib/image-proxy-url";

/**
 * GET /api/image-proxy?url=<public word-picture URL>
 *
 * Serves one of OUR stored pictures through our own origin so the client can
 * draw it on a <canvas> and read it back (the Gadit watermark added when a
 * picture is shared or saved, lib/watermark.ts). The bucket sends no CORS
 * headers, so drawing the storage URL directly taints the canvas.
 *
 * Only our own bucket is allowed (lib/image-proxy-url.ts, no arbitrary URLs,
 * so no SSRF surface), only image responses are passed on, and the size is
 * capped. The pictures are public already; this adds no access.
 */

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !isAllowedImageUrl(url)) {
    return NextResponse.json({ error: "url_not_allowed" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, { redirect: "error" });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: "fetch_failed" }, { status: upstream.status === 404 ? 404 : 502 });
  }
  const type = upstream.headers.get("content-type") || "";
  if (!type.startsWith("image/")) {
    return NextResponse.json({ error: "not_an_image" }, { status: 415 });
  }
  if (Number(upstream.headers.get("content-length") || 0) > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  const buf = await upstream.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  return new Response(buf, {
    headers: {
      "Content-Type": type,
      // Stored pictures never change under the same URL.
      "Cache-Control": "public, max-age=86400, s-maxage=2592000",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
