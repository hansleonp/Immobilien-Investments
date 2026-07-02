import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ContactEventInsert, ContactEventRow } from "@/types/database";

export function useCreateContactEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: ContactEventInsert): Promise<ContactEventRow> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contact_events")
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeleteContactEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("contact_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
