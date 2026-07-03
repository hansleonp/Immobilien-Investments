// Hand-geschriebene DB-Typen, passend zu supabase/migrations/0001_init.sql.
// Kann später durch `supabase gen types typescript` ersetzt werden.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PropertySource =
  | "immoscout24"
  | "kleinanzeigen"
  | "immowelt"
  | "immonet"
  | "makler"
  | "bank"
  | "sonstige"
  | "manuell";

export type PropertyCondition =
  | "erstbezug"
  | "saniert"
  | "gepflegt"
  | "renovierungsbeduerftig"
  | "sanierungsbeduerftig"
  | "unbekannt";

export type RentalStatus = "frei" | "vermietet" | "unbekannt";

export type PropertyStatus =
  | "neu"
  | "interessant"
  | "kontaktiert"
  | "antwort_ausstehend"
  | "rueckmeldung_erhalten"
  | "besichtigung_geplant"
  | "besichtigung_erledigt"
  | "unterlagen_pruefen"
  | "angebot_vorbereiten"
  | "angebot_abgegeben"
  | "verhandlung"
  | "notarvorbereitung"
  | "gekauft"
  | "abgelehnt"
  | "verworfen";

export type AnswerStatus =
  | "keine_anfrage"
  | "anfrage_gesendet"
  | "antwort_ausstehend"
  | "antwort_erhalten"
  | "kein_interesse_anbieter"
  | "objekt_verkauft"
  | "besichtigung_vereinbart"
  | "unterlagen_erhalten";

export type DiscardReason =
  | "zu_teuer"
  | "schlechte_lage"
  | "schlechter_zustand"
  | "negativer_cashflow"
  | "hausgeld_zu_hoch"
  | "rechtliche_bedenken"
  | "verkauft"
  | "sonstiges";

export type ContactType =
  | "plattform"
  | "email"
  | "telefon"
  | "whatsapp"
  | "persoenlich"
  | "sonstiges";

export type EventDirection = "ausgehend" | "eingehend";

export type TaskPriority = "hoch" | "mittel" | "niedrig";

export type ViewingStatus = "geplant" | "erledigt" | "abgesagt";

export type DocumentCategory =
  | "expose"
  | "grundriss"
  | "energieausweis"
  | "teilungserklaerung"
  | "wirtschaftsplan"
  | "hausgeldabrechnung"
  | "protokoll_ev"
  | "mietvertrag"
  | "nebenkostenabrechnung"
  | "foto"
  | "finanzierung"
  | "sonstiges";

export type InboxStatus = "neu" | "uebernommen" | "verworfen";

export type LocationClass = "A" | "B" | "C" | "D";

export type SettingsRow = {
  user_id: string;
  equity_percent: number;
  interest_rate: number;
  repayment_rate: number;
  purchase_costs_percent: number;
  maintenance_per_sqm: number;
  non_recoverable_per_sqm: number;
  target_yield: number;
  min_cashflow: number;
  goal_units: number;
  goal_year: number;
  created_at: string;
  updated_at: string;
}

export type MarketPriceRow = {
  id: string;
  user_id: string;
  city: string;
  price_per_sqm: number;
  rent_per_sqm: number | null;
  location_class: LocationClass | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export type PropertyRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  unit_label: string | null;
  street: string | null;
  zip: string | null;
  city: string;
  district: string | null;
  source: PropertySource;
  source_url: string | null;
  external_id: string | null;
  image_url: string | null;
  /** Veröffentlichungs-/Inseratsdatum (YYYY-MM-DD) — Näherung, editierbar */
  listed_at: string | null;
  property_type: string;
  price: number | null;
  living_area: number | null;
  rooms: number | null;
  floor: string | null;
  construction_year: number | null;
  condition: PropertyCondition;
  energy_class: string | null;
  rental_status: RentalStatus;
  current_rent_cold: number | null;
  estimated_rent_cold: number | null;
  hausgeld: number | null;
  hausgeld_non_recoverable: number | null;
  maintenance_monthly: number | null;
  planned_renovation_costs: number;
  equity_percent_override: number | null;
  interest_rate_override: number | null;
  repayment_rate_override: number | null;
  purchase_costs_percent_override: number | null;
  fixed_rate_years: number | null;
  location_rating: number | null;
  rentability_rating: number | null;
  condition_rating: number | null;
  score_override: number | null;
  status: PropertyStatus;
  answer_status: AnswerStatus;
  is_favorite: boolean;
  discard_reason: DiscardReason | null;
  discarded_at: string | null;
  purchased_at: string | null;
  notes: string | null;
  ai_analysis: Json | null;
  purchase_checklist: Json;
  ai_analyzed_at: string | null;
}

export type ContactRow = {
  id: string;
  user_id: string;
  property_id: string;
  name: string;
  company: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
  platform: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ContactEventRow = {
  id: string;
  user_id: string;
  property_id: string;
  contact_id: string | null;
  event_date: string;
  contact_type: ContactType;
  direction: EventDirection;
  summary: string;
  next_action: string | null;
  next_action_date: string | null;
  created_at: string;
}

export type TaskRow = {
  id: string;
  user_id: string;
  property_id: string | null;
  contact_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ViewingRow = {
  id: string;
  user_id: string;
  property_id: string;
  contact_id: string | null;
  viewing_date: string;
  location: string | null;
  status: ViewingStatus;
  notes: string | null;
  rating: number | null;
  checklist: Json;
  created_at: string;
  updated_at: string;
}

export type DocumentRow = {
  id: string;
  user_id: string;
  property_id: string;
  viewing_id: string | null;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string;
  category: DocumentCategory;
  notes: string | null;
  uploaded_at: string;
}

export type ImportInboxRow = {
  id: string;
  user_id: string;
  source: string;
  source_url: string;
  external_id: string | null;
  subject: string | null;
  excerpt: string | null;
  parsed: Json;
  status: InboxStatus;
  property_id: string | null;
  received_at: string;
}

// Insert-Typen: Spalten mit DB-Default oder nullable sind optional.
type WithDefaults<Row, Required extends keyof Row> = Pick<Row, Required> &
  Partial<Omit<Row, Required>>;

export type SettingsInsert = Partial<SettingsRow>;
export type MarketPriceInsert = WithDefaults<MarketPriceRow, "city" | "price_per_sqm">;
export type PropertyInsert = WithDefaults<PropertyRow, "title">;
export type ContactInsert = WithDefaults<ContactRow, "property_id" | "name">;
export type ContactEventInsert = WithDefaults<
  ContactEventRow,
  "property_id" | "contact_type" | "summary"
>;
export type TaskInsert = WithDefaults<TaskRow, "title">;
export type ViewingInsert = WithDefaults<ViewingRow, "property_id" | "viewing_date">;
export type DocumentInsert = WithDefaults<
  DocumentRow,
  "property_id" | "file_name" | "storage_path"
>;
export type ImportInboxInsert = WithDefaults<ImportInboxRow, "user_id" | "source_url">;

type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      settings: Table<SettingsRow, SettingsInsert>;
      market_prices: Table<MarketPriceRow, MarketPriceInsert>;
      properties: Table<PropertyRow, PropertyInsert>;
      contacts: Table<ContactRow, ContactInsert>;
      contact_events: Table<ContactEventRow, ContactEventInsert>;
      tasks: Table<TaskRow, TaskInsert>;
      viewings: Table<ViewingRow, ViewingInsert>;
      documents: Table<DocumentRow, DocumentInsert>;
      import_inbox: Table<ImportInboxRow, ImportInboxInsert>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
