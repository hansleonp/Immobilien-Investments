import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  ContactInsert,
  DiscardReason,
  PropertyInsert,
  PropertyRow,
  PropertySource,
} from "@/types/database";
import type { PropertyWithRelations } from "@/types";

const PROPERTY_SELECT =
  "*, tasks(*), contact_events(*), viewings(*), contacts(*), documents(id, category)";

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async (): Promise<PropertyWithRelations[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select(PROPERTY_SELECT)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as PropertyWithRelations[];
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: async (): Promise<PropertyWithRelations> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select(PROPERTY_SELECT)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as PropertyWithRelations;
    },
  });
}

/** Dubletten-Check: existiert bereits ein Objekt mit dieser URL bzw. Quelle+ID? */
export async function findDuplicate(args: {
  sourceUrl?: string | null;
  source?: PropertySource | null;
  externalId?: string | null;
}): Promise<Pick<PropertyRow, "id" | "title" | "status"> | null> {
  const supabase = createClient();
  if (args.source && args.externalId) {
    const { data } = await supabase
      .from("properties")
      .select("id, title, status")
      .eq("source", args.source)
      .eq("external_id", args.externalId)
      .maybeSingle();
    if (data) return data;
  }
  if (args.sourceUrl) {
    const { data } = await supabase
      .from("properties")
      .select("id, title, status")
      .eq("source_url", args.sourceUrl)
      .maybeSingle();
    if (data) return data;
  }
  return null;
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      property: PropertyInsert;
      contact?: Omit<ContactInsert, "property_id"> | null;
    }): Promise<PropertyRow> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .insert(args.property)
        .select()
        .single();
      if (error) throw error;
      if (args.contact?.name) {
        const { error: contactError } = await supabase
          .from("contacts")
          .insert({ ...args.contact, property_id: data.id });
        if (contactError) throw contactError;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; values: Partial<PropertyInsert> }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("properties")
        .update(args.values)
        .eq("id", args.id);
      if (error) throw error;
    },
    // Optimistisch: Liste + Detail sofort aktualisieren
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ["properties"] });
      const previousList = queryClient.getQueryData<PropertyWithRelations[]>([
        "properties",
      ]);
      const previousDetail = queryClient.getQueryData<PropertyWithRelations>([
        "properties",
        args.id,
      ]);
      if (previousList) {
        queryClient.setQueryData(
          ["properties"],
          previousList.map((p) => (p.id === args.id ? { ...p, ...args.values } : p))
        );
      }
      if (previousDetail) {
        queryClient.setQueryData(["properties", args.id], {
          ...previousDetail,
          ...args.values,
        });
      }
      return { previousList, previousDetail };
    },
    onError: (_err, args, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["properties"], context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(["properties", args.id], context.previousDetail);
      }
    },
    onSettled: (_data, _err, args) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties", args.id] });
    },
  });
}

export function useDiscardProperty() {
  const update = useUpdateProperty();
  return {
    ...update,
    discard: (id: string, reason: DiscardReason) =>
      update.mutate({
        id,
        values: {
          status: "verworfen",
          discard_reason: reason,
          discarded_at: new Date().toISOString().slice(0, 10),
        },
      }),
  };
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
