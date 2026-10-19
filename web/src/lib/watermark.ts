/**
 * Gadit watermark for pictures that LEAVE the app (shared or saved).
 * Pictures shown inside the app stay clean; only the exported copy is marked.
 *
 * The mark: the header wordmark "Gad" (ink) + "it" (teal italic) followed by
 * ".app" in a muted grey, so it reads as both the logo and the address
 * gadit.app. It sits on a soft rounded white pill at 85% opacity, always in
 * the BOTTOM-RIGHT corner (the wordmark is Latin, so one fixed spot in every
 * UI language). Pill height is 4.5% of the picture's shorter side (clamped
 * 16..96px), with a 2.5% margin.
 *
 * Client only (canvas). Our bucket sends no CORS headers, so the picture is
 * read through the same-origin /api/image-proxy (lib/image-proxy-url.ts).
 */

import { readableImageUrl } from "@/lib/image-proxy-url";
import { nativeShareFallback } from "@/lib/native-app";

const INK = "#0B0F19";
const TEAL = "#0EA5A5";
const MUTED = "#5C6270";
const FONT_FAMILY = "Rubik, system-ui, -apple-system, 'Segoe UI', sans-serif";
const MAX_EDGE = 2048;

export type MarkMetrics = {
  pillH: number;
  fontPx: number;
  padX: number;
  margin: number;
};

export type MarkBox = MarkMetrics & {
  x: number;
  y: number;
  w: number;
  radius: number;
  /** Text start x and baseline y inside the pill. */
  textX: number;
  baselineY: number;
};

/** Size of the mark for a picture of w x h pixels (pure, unit-tested). */
export function markMetrics(w: number, h: number): MarkMetrics {
  const base = Math.max(1, Math.min(w, h));
  const pillH = Math.round(Math.min(96, Math.max(16, base * 0.045)));
  return {
    pillH,
    fontPx: Math.round(pillH * 0.58),
    padX: Math.round(pillH * 0.45),
    margin: Math.round(Math.max(6, base * 0.025)),
  };
}

/** Where the pill goes once the text width (at metrics.fontPx) is known:
 *  bottom-right corner, never wider than the picture minus both margins. */
export function markBox(w: number, h: number, textW: number, m: MarkMetrics = markMetrics(w, h)): MarkBox {
  let { pillH, fontPx, padX } = m;
  const { margin } = m;
  let pillW = textW + padX * 2;
  const maxW = w - margin * 2;
  if (pillW > maxW && pillW > 0) {
    const k = maxW / pillW;
    pillW = maxW;
    pillH = Math.max(8, Math.round(pillH * k));
    fontPx = Math.max(6, Math.round(fontPx * k));
    padX = Math.round(padX * k);
  }
  const x = Math.round(w - margin - pillW);
  const y = Math.round(h - margin - pillH);
  return {
    pillH,
    fontPx,
    padX,
    margin,
    x,
    y,
    w: Math.round(pillW),
    radius: pillH / 2,
    textX: x + padX,
    // Visually centred for Rubik caps/x-height: baseline a bit below middle.
    baselineY: Math.round(y + pillH / 2 + fontPx * 0.35),
  };
}

type Segment = { text: string; font: string; color: string };

function segments(fontPx: number): Segment[] {
  return [
    { text: "Gad", font: `500 ${fontPx}px ${FONT_FAMILY}`, color: INK },
    { text: "it", font: `italic 400 ${fontPx}px ${FONT_FAMILY}`, color: TEAL },
    { text: ".app", font: `400 ${Math.round(fontPx * 0.82)}px ${FONT_FAMILY}`, color: MUTED },
  ];
}

function measure(ctx: CanvasRenderingContext2D, segs: Segment[]): number {
  let total = 0;
  for (const s of segs) {
    ctx.font = s.font;
    total += ctx.measureText(s.text).width;
  }
  return total;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  ctx.closePath();
}

/** Draw the mark onto a canvas that already holds the picture. */
export function drawMark(ctx: CanvasRenderingContext2D, w: number, h: number): MarkBox {
  const m = markMetrics(w, h);
  const textW = measure(ctx, segments(m.fontPx));
  const box = markBox(w, h, textW, m);
  const segs = segments(box.fontPx);

  ctx.save();
  ctx.shadowColor = "rgba(11, 15, 25, 0.16)";
  ctx.shadowBlur = Math.max(2, box.pillH * 0.3);
  ctx.shadowOffsetY = Math.max(1, box.pillH * 0.06);
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  roundRect(ctx, box.x, box.y, box.w, box.pillH, box.radius);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.direction = "ltr";
  let x = box.textX;
  for (const s of segs) {
    ctx.font = s.font;
    ctx.fillStyle = s.color;
    ctx.fillText(s.text, x, box.baselineY);
    x += ctx.measureText(s.text).width;
  }
  ctx.restore();
  return box;
}

async function ensureFont(): Promise<void> {
  try {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!fonts?.load) return;
    await Promise.race([
      Promise.all([
        fonts.load(`500 24px Rubik`, "Gadit"),
        fonts.load(`italic 400 24px Rubik`, "it"),
        fonts.load(`400 24px Rubik`, ".app"),
      ]),
      new Promise((r) => setTimeout(r, 1200)),
    ]);
  } catch {
    /* system font fallback is fine */
  }
}

async function loadBlob(src: string): Promise<Blob> {
  const res = await fetch(readableImageUrl(src));
  if (!res.ok) throw new Error(`image fetch ${res.status}`);
  const blob = await res.blob();
  if (!blob.type.startsWith("image/")) throw new Error("not an image");
  return blob;
}

async function decode(blob: Blob): Promise<{ img: CanvasImageSource; w: number; h: number; done: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(blob);
      return { img: bmp, w: bmp.width, h: bmp.height, done: () => bmp.close?.() };
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(blob);
  const el = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("decode failed"));
    i.src = url;
  });
  return { img: el, w: el.naturalWidth, h: el.naturalHeight, done: () => URL.revokeObjectURL(url) };
}

/** The picture at `src` (URL or Blob) with the Gadit mark, as a JPEG Blob.
 *  Throws on any failure; callers fall back to the original picture. */
export async function watermarkImage(src: string | Blob): Promise<Blob> {
  const source = typeof src === "string" ? await loadBlob(src) : src;
  const [{ img, w: nw, h: nh, done }] = await Promise.all([decode(source), ensureFont()]);
  try {
    if (!nw || !nh) throw new Error("empty image");
    const scale = Math.min(1, MAX_EDGE / Math.max(nw, nh));
    const w = Math.round(nw * scale);
    const h = Math.round(nh * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.fillStyle = "#FFFFFF"; // JPEG has no alpha: transparent areas go white
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    drawMark(ctx, w, h);
    const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!out || out.size === 0) throw new Error("encode failed");
    return out;
  } finally {
    done();
  }
}

/** A file name for the exported picture: gadit-<word>.jpg (letters of any
 *  script kept, everything else becomes "-"). */
export function pictureFileName(word: string, ext = "jpg"): string {
  const slug = (word || "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug ? `gadit-${slug}.${ext}` : `gadit.${ext}`;
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

type ShareNav = Navigator & {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
};

function isAbort(e: unknown): boolean {
  return !!e && typeof e === "object" && (e as { name?: string }).name === "AbortError";
}

/**
 * Share (or, where files cannot be shared, download) a picture with the Gadit
 * mark. `ready` is an optional pre-built watermarked Blob (build it when the
 * viewer opens so the share sheet opens straight from the tap; Safari drops
 * the tap's permission after a slow await).
 *
 * Never breaks: if marking fails the ORIGINAL picture is shared; if even that
 * cannot be read, the picture's link is shared or opened.
 */
export async function shareWatermarkedPicture(opts: {
  src: string;
  word: string;
  pageUrl?: string;
  ready?: Blob | null;
}): Promise<void> {
  const { src, word, pageUrl } = opts;
  const nav = navigator as ShareNav;
  const title = word ? `Gadit, ${word}` : "Gadit";

  let blob: Blob | null = opts.ready ?? null;
  let marked = !!blob;
  if (!blob) {
    try {
      blob = await watermarkImage(src);
      marked = true;
    } catch (e) {
      console.warn("[watermark] falling back to the original picture:", e);
      try {
        blob = await loadBlob(src);
      } catch {
        blob = null;
      }
    }
  }

  if (blob) {
    const ext = marked ? "jpg" : (blob.type.split("/")[1] || "png").replace("jpeg", "jpg");
    const file = new File([blob], pictureFileName(word, ext), { type: blob.type || "image/jpeg" });
    if (typeof nav.share === "function" && typeof nav.canShare === "function") {
      const withText: ShareData = pageUrl ? { files: [file], title, text: pageUrl } : { files: [file], title };
      const data = nav.canShare(withText) ? withText : { files: [file] };
      if (nav.canShare(data)) {
        try {
          await nav.share(data);
          return;
        } catch (e) {
          if (isAbort(e)) return; // user closed the share sheet
          // NotAllowedError etc.: save the file instead.
        }
      }
    }
    // iOS app without navigator.share: the app's share sheet with the
    // word page link (a file cannot cross the bridge).
    if (typeof nav.share !== "function" && nativeShareFallback(pageUrl || src, title)) return;
    downloadBlob(blob, file.name);
    return;
  }

  // Nothing readable: share or open the picture's own link.
  try {
    if (typeof nav.share === "function") {
      await nav.share({ title, url: src });
      return;
    }
    if (nativeShareFallback(pageUrl || src, title)) return;
  } catch (e) {
    if (isAbort(e)) return;
  }
  window.open(src, "_blank", "noopener");
}
