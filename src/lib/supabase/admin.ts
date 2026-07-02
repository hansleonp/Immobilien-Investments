// Service-Role-Client für Server-Kontexte OHNE User-Session (z. B. Inbound-
// E-Mail-Webhook). Umgeht RLS — nur serverseitig verwenden, Key nie in den
// Client leaken!

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Liefert einen Supabase-Client mit Service-Role-Key oder null, wenn die
 * nötigen Umgebungsvariablen (NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY) fehlen.
 */
export function createAdminClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  // Robust gegen Kopier-Unfälle: Whitespace/Zeilenumbrüche und versehentlich
  // mehrfach eingefügte Werte auf den ersten Token reduzieren
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().split(/\s+/)[0];
  if (!url || !serviceRoleKey) return null;
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
