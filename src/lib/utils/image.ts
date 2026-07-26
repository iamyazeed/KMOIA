/**
 * Client-side image preparation.
 *
 * Runs in the browser before upload so Storage only ever receives a correctly
 * sized, correctly cropped WebP. Doing this here rather than in a serverless
 * function keeps uploads fast on the slow connections the committee will
 * realistically be using, and costs nothing to run.
 */

const MAX_DIMENSION = 2400;
const WEBP_QUALITY = 0.86;

export type PreparedImage = {
  blob: Blob;
  width: number;
  height: number;
  /** Tiny base64 JPEG used as `blurDataURL`, avoiding a blurhash dependency. */
  placeholder: string;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image."));
    };
    img.src = url;
  });
}

/** Centre-crop rectangle for a target aspect ratio. */
function cropRect(width: number, height: number, ratio: number | null) {
  if (!ratio) return { sx: 0, sy: 0, sw: width, sh: height };

  const currentRatio = width / height;

  if (currentRatio > ratio) {
    const sw = Math.round(height * ratio);
    return { sx: Math.round((width - sw) / 2), sy: 0, sw, sh: height };
  }

  const sh = Math.round(width / ratio);
  return { sx: 0, sy: Math.round((height - sh) / 2), sw: width, sh };
}

export async function prepareImage(
  file: File,
  ratio: number | null,
): Promise<PreparedImage> {
  const img = await loadImage(file);
  const { sx, sy, sw, sh } = cropRect(
    img.naturalWidth,
    img.naturalHeight,
    ratio,
  );

  const scale = Math.min(1, MAX_DIMENSION / Math.max(sw, sh));
  const width = Math.round(sw * scale);
  const height = Math.round(sh * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image processing is not available in this browser.");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
  );

  if (!blob) throw new Error("The image could not be converted.");

  // 24px-wide preview, inlined as a data URL. next/image blurs it up.
  const thumb = document.createElement("canvas");
  const thumbWidth = 24;
  thumb.width = thumbWidth;
  thumb.height = Math.max(1, Math.round((height / width) * thumbWidth));
  thumb
    .getContext("2d")
    ?.drawImage(canvas, 0, 0, thumb.width, thumb.height);

  return {
    blob,
    width,
    height,
    placeholder: thumb.toDataURL("image/jpeg", 0.5),
  };
}

/** `photo.JPG` → `photo-1738000000.webp` */
export function storageFilename(original: string) {
  const base = original
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${base || "image"}-${Date.now()}.webp`;
}
