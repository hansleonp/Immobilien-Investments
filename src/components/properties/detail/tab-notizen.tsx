"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProperty } from "@/lib/queries/properties";
import type { PropertyRow } from "@/types/database";

export function TabNotizen({ property }: { property: Pick<PropertyRow, "id" | "notes"> }) {
  const update = useUpdateProperty();
  const [value, setValue] = useState(property.notes ?? "");
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Autosave
  useEffect(() => {
    if (value === (property.notes ?? "")) return;
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      update.mutate(
        { id: property.id, values: { notes: value || null } },
        { onSuccess: () => setSaved(true) }
      );
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="max-w-3xl space-y-2">
      <Textarea
        rows={14}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Notizen zu diesem Objekt — Eindrücke, Rückfragen, Verhandlungsstand…"
      />
      <p className="text-xs text-neutral-400">
        {saved ? "Gespeichert" : "Speichert…"} · Änderungen werden automatisch gesichert
      </p>
    </div>
  );
}
