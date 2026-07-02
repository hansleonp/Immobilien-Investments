import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  DocumentCategory,
  DocumentRow,
  PropertyRow,
} from "@/types/database";

/** Dokument inkl. Objekt (für die globale Dokumente-Seite) */
export type DocumentWithProperty = DocumentRow & {
  properties: Pick<PropertyRow, "id" | "title"> | null;
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const BUCKET = "documents";

/** Dateinamen für den Storage-Pfad bereinigen (nur [a-zA-Z0-9._-]) */
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function useAllDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async (): Promise<DocumentWithProperty[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("documents")
        .select("*, properties(id, title)")
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data as unknown as DocumentWithProperty[];
    },
  });
}

/** Alle Dokument-Zeilen eines Objekts (PROPERTY_SELECT liefert nur id+category) */
export function usePropertyDocuments(propertyId: string) {
  return useQuery({
    queryKey: ["documents", propertyId],
    queryFn: async (): Promise<DocumentRow[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("property_id", propertyId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      propertyId: string;
      file: File;
      category: DocumentCategory;
      viewingId?: string | null;
    }): Promise<DocumentRow> => {
      const { propertyId, file, category, viewingId } = args;
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`„${file.name}“ ist größer als 10 MB`);
      }
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Nicht angemeldet");
      }
      const userId = userData.user.id;
      // Pfadschema PFLICHT: erster Ordner = auth.uid() (Storage-RLS)
      const storagePath = `${userId}/${propertyId}/${crypto.randomUUID()}-${sanitizeFileName(
        file.name
      )}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          contentType: file.type || undefined,
        });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("documents")
        .insert({
          property_id: propertyId,
          viewing_id: viewingId ?? null,
          file_name: file.name,
          file_type: file.type || null,
          file_size: file.size,
          storage_path: storagePath,
          category,
        })
        .select()
        .single();
      if (error) {
        // Best effort: hochgeladene Datei wieder entfernen
        try {
          await supabase.storage.from(BUCKET).remove([storagePath]);
        } catch {
          // ignorieren — Datei bleibt ggf. verwaist im Storage
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doc: Pick<DocumentRow, "id" | "storage_path">) => {
      const supabase = createClient();
      // Storage zuerst (Fehler tolerieren, damit die Zeile nicht verwaist bleibt)
      try {
        await supabase.storage.from(BUCKET).remove([doc.storage_path]);
      } catch {
        // ignorieren
      }
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

/** Signierte URL für ein privates Storage-Objekt (1 Stunde gültig) */
export async function getDocumentUrl(storagePath: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);
  if (error || !data?.signedUrl) {
    throw error ?? new Error("Signierte URL konnte nicht erstellt werden");
  }
  return data.signedUrl;
}
