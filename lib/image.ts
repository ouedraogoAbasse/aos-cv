const DEFAULT_MAX_DIMENSION = 900;
const DEFAULT_QUALITY = 0.85;

/** Lit un fichier en data URL (base64). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Lecture impossible."));
    reader.readAsDataURL(file);
  });
}

/** Reconstruit un File à partir d'une data URL (restauration depuis localStorage). */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [head, body] = dataUrl.split(",");
  const mime = head.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

/**
 * Réduit la taille d'une image (dimension max + compression JPEG).
 * Indispensable pour : ne pas saturer localStorage et garder un export PDF léger.
 * En cas d'échec (format non décodable), on renvoie le fichier d'origine.
 */
export async function compressImage(
  file: File,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  // GIF (animation) et SVG : on ne les redessine pas pour ne pas les casser.
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * ratio));
    const height = Math.max(1, Math.round(bitmap.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    // Fond blanc : évite les pixels noirs si l'image PNG est transparente et convertie en JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outputType, quality),
    );
    if (!blob) return file;

    const extension = outputType === "image/png" ? "png" : "jpg";
    const baseName = file.name.replace(/\.\w+$/, "") || "image";
    return new File([blob], `${baseName}.${extension}`, { type: outputType });
  } catch {
    return file;
  }
}
