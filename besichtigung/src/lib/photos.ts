import { supabase } from "./supabase";

const BUCKET = "inspection-photos";

// Foto clientseitig verkleinern (max 1400px, JPEG 0.8)
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxDim = 1400;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.8)
  );
}

// Upload; bei Offline/Fehler wird ein lokaler data:-URL zurückgegeben (Fallback)
export async function uploadPhoto(
  userId: string,
  inspectionId: string,
  itemId: string,
  file: File
): Promise<string> {
  const blob = await compressImage(file);
  const path = `${userId}/${inspectionId}/${itemId}-${Date.now()}.jpg`;
  try {
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) throw error;
    return path;
  } catch {
    // Offline-Fallback: als data-URL im Datensatz speichern
    return await blobToDataUrl(blob);
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(blob);
  });
}

const urlCache = new Map<string, string>();

export async function photoUrl(path: string): Promise<string | null> {
  if (path.startsWith("data:")) return path;
  if (urlCache.has(path)) return urlCache.get(path)!;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24);
  if (error || !data) return null;
  urlCache.set(path, data.signedUrl);
  return data.signedUrl;
}

export async function deletePhoto(path: string): Promise<void> {
  if (path.startsWith("data:")) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
