/**
 * Which picture URLs may go through /api/image-proxy, and the proxied URL for
 * one. Shared by the route (server) and lib/watermark.ts (client). Only our
 * own public bucket is allowed, so the proxy can never fetch arbitrary URLs.
 */

const ALLOWED_PREFIX = "https://storage.googleapis.com/gadit-app.firebasestorage.app/";

export function isAllowedImageUrl(raw: string | null | undefined): boolean {
  if (!raw || !raw.startsWith(ALLOWED_PREFIX)) return false;
  try {
    const u = new URL(raw);
    return (
      u.protocol === "https:" &&
      u.hostname === "storage.googleapis.com" &&
      u.pathname.startsWith("/gadit-app.firebasestorage.app/") &&
      !u.pathname.includes("..") &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
}

/** Same-origin URL to read the picture's pixels: our bucket goes through the
 *  proxy, same-origin / data: / blob: URLs are used as they are. */
export function readableImageUrl(src: string): string {
  if (isAllowedImageUrl(src)) return `/api/image-proxy?url=${encodeURIComponent(src)}`;
  return src;
}
