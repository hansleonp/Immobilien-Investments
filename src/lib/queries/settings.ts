import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { MarketPriceRow, SettingsRow } from "@/types/database";

/** Startwerte für die Marktpreis-Referenz — vom User in den Einstellungen pflegbar */
const MARKET_PRICE_SEED = [
  { city: "Bad Honnef", price_per_sqm: 3400, rent_per_sqm: 11.5 },
  { city: "Königswinter", price_per_sqm: 3100, rent_per_sqm: 10.5 },
  { city: "Bonn", price_per_sqm: 3800, rent_per_sqm: 12.5 },
];

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<SettingsRow> => {
      const supabase = createClient();
      const { data, error } = await supabase.from("settings").select("*").maybeSingle();
      if (error) throw error;
      if (data) return data;

      // Erste Nutzung: Settings-Zeile mit Defaults + Marktpreis-Startwerte anlegen
      const { data: created, error: insertError } = await supabase
        .from("settings")
        .insert({})
        .select()
        .single();
      if (insertError) throw insertError;
      await supabase.from("market_prices").insert(MARKET_PRICE_SEED);
      return created;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<SettingsRow>) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");
      const { error } = await supabase
        .from("settings")
        .update(values)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      // Kennzahlen hängen an den Annahmen — alles neu berechnen lassen
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useMarketPrices() {
  return useQuery({
    queryKey: ["market_prices"],
    queryFn: async (): Promise<MarketPriceRow[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("market_prices")
        .select("*")
        .order("city");
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveMarketPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      id?: string;
      city: string;
      price_per_sqm: number;
      rent_per_sqm: number | null;
    }) => {
      const supabase = createClient();
      if (values.id) {
        const { error } = await supabase
          .from("market_prices")
          .update({
            city: values.city,
            price_per_sqm: values.price_per_sqm,
            rent_per_sqm: values.rent_per_sqm,
          })
          .eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("market_prices").insert({
          city: values.city,
          price_per_sqm: values.price_per_sqm,
          rent_per_sqm: values.rent_per_sqm,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market_prices"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeleteMarketPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("market_prices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market_prices"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
