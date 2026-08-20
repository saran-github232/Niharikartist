// Resizes an uploaded photo client-side (Canvas) and returns it as a JPEG
// data URL — no external image host involved, so there's no link to ever
// break. Downscaling keeps the JSON store (data/shop-additions.json) from
// bloating with un-resized phone photos; the full image is kept intact
// (no cropping) since ArtworkCard already letterboxes via object-contain.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

export async function fileToOptimizedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser can't process images for upload.");
    ctx.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
