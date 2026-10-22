import sharp from "sharp";

/**
 * Every drawn picture is stored as a WebP of at most 768 px (Gadi 2026-10-22:
 * pictures must show at once). The model returns a 1024 px PNG of about
 * 1.25 MB; at 768 px WebP quality 82 it is about 50 KB, with no visible
 * difference on a phone card or a projector tile.
 */
export async function toWebp(png: Buffer): Promise<Buffer> {
  return sharp(png).resize(768, 768, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
}
