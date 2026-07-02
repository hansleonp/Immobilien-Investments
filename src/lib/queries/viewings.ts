import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  ContactRow,
  PropertyRow,
  ViewingInsert,
  ViewingRow,
} from "@/types/database";

/** Besichtigung inkl. Objekt + Ansprechpartner (für die globale Besichtigungs-Seite) */
export type ViewingWithRelations = ViewingRow & {
  properties: Pick<PropertyRow, "id" | "title" | "street" | "zip" | "city"> | null;
  contacts: Pick<ContactRow, "name"> | null;
};

export function useAllViewings() {
  return useQuery({
    queryKey: ["viewings"],
    queryFn: async (): Promise<ViewingWithRelations[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("viewings")
        .select(
          "*, properties(id, title, street, zip, city), contacts:contact_id(name)"
        )
        .order("viewing_date", { ascending: true });
      if (error) throw error;
      return data as unknown as ViewingWithRelations[];
    },
  });
}

export function useCreateViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (viewing: ViewingInsert): Promise<ViewingRow> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("viewings")
        .insert(viewing)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewings"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; values: Partial<ViewingInsert> }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("viewings")
        .update(args.values)
        .eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewings"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeleteViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("viewings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewings"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
