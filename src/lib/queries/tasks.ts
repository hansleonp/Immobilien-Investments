import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PropertyRow, TaskInsert, TaskRow } from "@/types/database";

/** Aufgabe inkl. zugehörigem Objekt (für die globale Aufgaben-Seite) */
export type TaskWithProperty = TaskRow & {
  properties: Pick<PropertyRow, "id" | "title"> | null;
};

export function useAllTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TaskWithProperty[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .select("*, properties(id, title)")
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as unknown as TaskWithProperty[];
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: TaskInsert): Promise<TaskRow> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert(task)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; values: Partial<TaskInsert> }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("tasks")
        .update(args.values)
        .eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
