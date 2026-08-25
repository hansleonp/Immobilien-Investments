import { supabase } from "./supabase";

// Privater Bucket mit Owner-RLS (erster Pfad-Ordner = auth.uid()).
const BUCKET = "documents";

export interface UploadedDoc {
  path: string;
  name: string;
  mime: string;
  size: number;
}

// Dateinamen für den Storage-Pfad entschärfen (keine Umlaute/Sonderzeichen).
function safeName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_");
  return cleaned.slice(-80) || "datei";
}

/** Lädt eine Datei in den documents-Bucket unter {userId}/property-{propertyId}/… */
export async function uploadDoc(
  userId: string,
  propertyId: string,
  file: File
): Promise<UploadedDoc> {
  const path = `${userId}/property-${propertyId}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;
  return { path, name: file.name, mime: file.type || "", size: file.size };
}

// Signierte URLs kurz cachen (Ablauf 1 h, wir cachen 55 min).
const urlCache = new Map<string, { url: string; exp: number }>();

export async function docUrl(path: string): Promise<string | null> {
  const now = Date.now();
  const hit = urlCache.get(path);
  if (hit && hit.exp > now) return hit.url;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error || !data) return null;
  urlCache.set(path, { url: data.signedUrl, exp: now + 55 * 60 * 1000 });
  return data.signedUrl;
}

export async function deleteDoc(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]);
}

export function fmtSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("de-DE", { maximumFractionDigits: 1 })} MB`;
}
