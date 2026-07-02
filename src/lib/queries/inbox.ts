import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ImportInboxRow, InboxStatus } from "@/types/database";

/** Alle Posteingang-Einträge: status "neu" zuerst, sonst received_at absteigend */
export function useInbox() {
  return useQuery({
    queryKey: ["inbox"],
    queryFn: async (): Promise<ImportInboxRow[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("import_inbox")
        .select("*")
        .order("received_at", { ascending: false });
      if (error) throw error;
      // Stabiler Sort: "neu" nach vorne, Rest behält received_at-Ordnung
      const rank = (s: InboxStatus) => (s === "neu" ? 0 : 1);
      return [...data].sort((a, b) => rank(a.status) - rank(b.status));
    },
  });
}

/** Anzahl neuer Einträge (head-only Count-Query, keine Daten übertragen) */
export function useInboxCount() {
  return useQuery({
    queryKey: ["inbox", "count"],
    queryFn: async (): Promise<number> => {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("import_inbox")
        .select("*", { count: "exact", head: true })
        .eq("status", "neu");
      if (error) throw error;
      return count ?? 0;
    },
  });
}

/** Status eines Eintrags ändern, optional mit Verknüpfung zum angelegten Objekt */
export function useUpdateInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      status: InboxStatus;
      propertyId?: string | null;
    }) => {
      const supabase = createClient();
      const values: { status: InboxStatus; property_id?: string | null } = {
        status: args.status,
      };
      if (args.propertyId !== undefined) values.property_id = args.propertyId;
      const { error } = await supabase
        .from("import_inbox")
        .update(values)
        .eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}
