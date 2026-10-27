/**
 * Prepare a picked file for the OCR upload. Images are downscaled to a max edge
 * and re-encoded as JPEG so a multi-MB phone photo lands well under the
 * serverless body limit (the usual cause of "we couldn't read the file"), and
 * EXIF orientation is baked in so a sideways photo OCRs upright. PDFs and any
 * format the browser can't decode pass through unchanged.
 *
 * Shared by every photo button (Gadi 2026-10-27: a mother's sharp phone photo
 * of a word list never reached the reader on the dictation page, which sent
 * the full-size photo; only the Reader shrank it).
 */
export async function prepareForUpload(file: Blob): Promise<Blob> {
  if (file.type === "application/pdf" || !file.type.startsWith("image/")) return file;
  // 3000px keeps fine detail (Hebrew niqqud, small print) legible for OCR while
  // JPEG at 0.92 still lands well under the body limit for a page of text.
  const MAX_EDGE = 3000;
  const JPEG_QUALITY = 0.92;
  const SMALL_ENOUGH = 1.2 * 1024 * 1024; // already small and reasonable → leave it
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const longest = Math.max(bitmap.width, bitmap.height);
    // Nothing to gain from re-encoding a small, well-sized image.
    if (longest <= MAX_EDGE && file.size <= SMALL_ENOUGH) { bitmap.close?.(); return file; }
    const scale = Math.min(1, MAX_EDGE / longest);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close?.(); return file; }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    // A very busy page can still be large at 0.92: one more, lighter pass.
    if (blob && blob.size > 3.8 * 1024 * 1024) {
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    }
    return blob && blob.size > 0 ? blob : file;
  } catch {
    // HEIC on a browser that can't decode it, etc. — send the original and let
    // the server try; if it's too large the user gets the clear size message.
    return file;
  }
}

/** The form body for /api/ocr with the prepared image. */
export async function ocrForm(file: Blob): Promise<FormData> {
  const fd = new FormData();
  const prepared = await prepareForUpload(file);
  fd.append("image", prepared, prepared === file && file instanceof File ? file.name : "upload.jpg");
  return fd;
}
