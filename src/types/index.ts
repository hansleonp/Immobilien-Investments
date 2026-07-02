import type { FinanceResult } from "@/lib/finance/calc";
import type { ScoreResult } from "@/lib/finance/score";
import type {
  ContactEventRow,
  ContactRow,
  DocumentRow,
  PropertyRow,
  TaskRow,
  ViewingRow,
} from "./database";

/** Objekt inkl. aller Relationen — Ergebnis des nested Selects der Listenquery */
export type PropertyWithRelations = PropertyRow & {
  tasks: TaskRow[];
  contact_events: ContactEventRow[];
  viewings: ViewingRow[];
  contacts: ContactRow[];
  documents: Pick<DocumentRow, "id" | "category">[];
};

/** Objekt + berechnete Kennzahlen (Laufzeit, nie persistiert) */
export type EnrichedProperty = {
  property: PropertyWithRelations;
  finance: FinanceResult;
  score: ScoreResult;
};
