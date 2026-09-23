/** Utilitários de imagem no navegador (grátis, sem serviço externo). */

export const MAX_UPLOAD_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Envie apenas imagens.";
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `Imagem acima de ${MAX_UPLOAD_MB} MB.`;
  return null;
}

/**
 * Reduz a foto (lado maior = maxSide) e converte para JPEG.
 * Deixa o upload rápido no 4G e economiza armazenamento.
 */
export async function compressImage(
  file: File,
  { maxSide = 1280, quality = 0.8 }: { maxSide?: number; quality?: number } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file; // formato que o navegador não decodifica (ex.: HEIC em alguns) → envia original
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality),
  );
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
