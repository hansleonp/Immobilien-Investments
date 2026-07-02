"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  PURCHASE_CHECKLIST_SECTIONS,
  PURCHASE_CHECKLIST_TOTAL,
} from "@/lib/constants";
import { useUpdateProperty } from "@/lib/queries/properties";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/database";

type ChecklistState = Record<string, { checked?: boolean; note?: string }>;

function readChecklist(property: Pick<PropertyRow, "purchase_checklist">): ChecklistState {
  const raw = property.purchase_checklist;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as ChecklistState;
  }
  return {};
}

export function TabKaufpruefung({
  property,
}: {
  property: Pick<PropertyRow, "id" | "purchase_checklist">;
}) {
  const update = useUpdateProperty();
  const [state, setState] = useState<ChecklistState>(() => readChecklist(property));

  const checkedCount = Object.values(state).filter((v) => v?.checked).length;

  function persist(next: ChecklistState) {
    setState(next);
    update.mutate(
      { id: property.id, values: { purchase_checklist: next } },
      { onError: () => toast.error("Speichern fehlgeschlagen") }
    );
  }

  function toggle(key: string, checked: boolean) {
    persist({ ...state, [key]: { ...state[key], checked } });
  }

  function saveNote(key: string, note: string) {
    const current = state[key]?.note ?? "";
    if (note.trim() === current.trim()) return;
    persist({ ...state, [key]: { ...state[key], note: note.trim() } });
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
        <div>
          <p className="text-sm font-medium">
            Kaufprüfung: {checkedCount}/{PURCHASE_CHECKLIST_TOTAL} geprüft
          </p>
          <p className="text-xs text-neutral-500">
            Vor Angebot und Notartermin alle Punkte abarbeiten — Notizen werden
            automatisch gespeichert.
          </p>
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-neutral-100">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              checkedCount === PURCHASE_CHECKLIST_TOTAL ? "bg-green-600" : "bg-green-400"
            )}
            style={{ width: `${(checkedCount / PURCHASE_CHECKLIST_TOTAL) * 100}%` }}
          />
        </div>
      </div>

      {PURCHASE_CHECKLIST_SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item) => {
              const entry = state[item.key];
              return (
                <div key={item.key} className="flex items-start gap-3">
                  <Checkbox
                    checked={entry?.checked ?? false}
                    onCheckedChange={(checked) => toggle(item.key, checked === true)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        entry?.checked && "text-neutral-400 line-through"
                      )}
                    >
                      {item.label}
                    </p>
                    {"hint" in item && item.hint && (
                      <p className="text-xs text-neutral-400">{item.hint}</p>
                    )}
                    <Input
                      className="mt-1.5 h-7 text-sm"
                      placeholder="Notiz / Ergebnis…"
                      defaultValue={entry?.note ?? ""}
                      onBlur={(e) => saveNote(item.key, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
